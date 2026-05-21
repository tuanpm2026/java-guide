---
title: Làm thế nào để triển khai Delayed Task dựa trên Redis?
description: "Giải thích chi tiết hai phương án triển khai delayed task dựa trên Redis: lắng nghe sự kiện key expired và Redisson delayed queue, phân tích ưu nhược điểm, vấn đề độ tin cậy và tình huống sử dụng của mỗi phương án."
category: Cơ sở dữ liệu
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis delayed task,delayed queue,lắng nghe sự kiện key expired,Redisson DelayedQueue,order timeout,scheduled task
---

Để triển khai chức năng delayed task dựa trên Redis, về cơ bản có hai phương án:

1. Redis expired event listener (lắng nghe sự kiện key expired)
2. Delayed queue tích hợp sẵn trong Redisson

Khi phỏng vấn, bạn có thể nói đã cân nhắc cả hai phương án, nhưng cuối cùng phát hiện phương án Redis expired event listener có nhiều vấn đề, nên chọn phương án Redisson DelayedQueue tích hợp sẵn.

Lúc đó phỏng vấn viên có thể hỏi thêm một số câu hỏi liên quan, phần sau sẽ đề cập — chuẩn bị trước là tốt nhất.

Ngoài ra, ngoài các vấn đề được giới thiệu dưới đây, bạn nên ôn lại tất cả các câu hỏi phổ biến liên quan đến Redis, không loại trừ phỏng vấn viên sẽ hỏi thêm các câu hỏi Redis khác.

### Nguyên lý triển khai chức năng delayed task bằng Redis expired event listener?

Redis 2.0 giới thiệu chức năng pub/sub (publish/subscribe). Trong pub/sub, có khái niệm gọi là **channel (kênh)**, tương tự như **topic** trong message queue.

Pub/sub liên quan đến hai vai trò: publisher (nhà xuất bản) và subscriber (người đăng ký, cũng gọi là consumer):

- Publisher gửi message vào channel được chỉ định qua `PUBLISH`.
- Subscriber đăng ký channel mình quan tâm qua `SUBSCRIBE`. Subscriber có thể đăng ký một hoặc nhiều channel.

![Chức năng pub/sub của Redis](/images/github/javaguide/database/redis/redis-pub-sub.png)

Trong chế độ pub/sub, producer cần chỉ định channel để gửi message, consumer đăng ký channel tương ứng để nhận message.

Redis có nhiều channel mặc định, các channel này được Redis tự gửi message, không phải do code của chúng ta viết. Trong đó, `__keyevent@0__:expired` là một channel mặc định phụ trách lắng nghe sự kiện key expired. Tức là khi một key expired, Redis sẽ publish sự kiện key expired vào channel `__keyevent@<db>__:expired`.

Chúng ta chỉ cần lắng nghe channel này là có thể nhận được message về key đã expired, từ đó triển khai chức năng delayed task.

Chức năng này được Redis gọi chính thức là **keyspace notifications**, có tác dụng giám sát real-time các thay đổi của key và value trong Redis.

### Redis expired event listener có những hạn chế gì khi triển khai delayed task?

**1. Độ kịp thời kém**

Tài liệu chính thức giải thích nguyên nhân độ kịp thời kém tại: <https://redis.io/docs/manual/keyspace-notifications/#timing-of-expired-events>.

![Redis expired event](/images/github/javaguide/database/redis/redis-timing-of-expired-events.png)

Điểm cốt lõi: message sự kiện expired được publish khi Redis server xóa key, chứ không phải ngay khi key expired.

Có hai chiến lược xóa dữ liệu expired phổ biến:

1. **Lazy deletion**: Chỉ kiểm tra key expired khi lấy key ra. Thân thiện nhất với CPU nhưng có thể khiến quá nhiều key expired không được xóa.
2. **Periodic deletion**: Định kỳ trích xuất một số key để thực hiện thao tác xóa key expired. Redis ở tầng dưới sẽ giới hạn thời gian thực thi và tần suất của thao tác xóa để giảm ảnh hưởng đến CPU.

Periodic deletion thân thiện với memory hơn, lazy deletion thân thiện với CPU hơn. Mỗi cái có ưu điểm riêng, nên Redis áp dụng chiến lược **periodic deletion + lazy/lazy deletion**.

Do đó, sẽ xảy ra tình huống: tôi đã đặt thời gian expired cho key, nhưng đến thời điểm đó key vẫn chưa bị xóa, dẫn đến sự kiện expired không được publish.

**2. Mất message**

Message trong chế độ pub/sub của Redis không hỗ trợ persistence, khác với message queue. Trong chế độ pub/sub của Redis, publisher gửi message đến channel, subscriber lắng nghe channel để nhận message. Khi không có subscriber, message bị bỏ qua thẳng và không được lưu trữ trong Redis.

**3. Duplicate message consumption với nhiều service instance**

Chế độ pub/sub của Redis hiện chỉ có broadcast mode, nghĩa là khi producer publish một message vào channel cụ thể, tất cả consumer đăng ký channel liên quan đều nhận được message đó.

Lúc này cần chú ý vấn đề nhiều service instance xử lý trùng lặp message, điều này tăng workload phát triển và độ khó bảo trì.

### Nguyên lý của Redisson Delayed Queue là gì? Có những ưu điểm gì?

Redisson là một Redis client mã nguồn mở cho ngôn ngữ Java, cung cấp nhiều chức năng out-of-the-box như nhiều loại distributed lock, delayed queue.

Chúng ta có thể dùng RDelayedQueue tích hợp sẵn của Redisson để triển khai chức năng delayed task.

Redisson RDelayedQueue được triển khai dựa trên SortedSet của Redis. SortedSet là một sorted collection, mỗi phần tử có thể đặt một score biểu thị trọng số. Redisson tận dụng đặc tính này, insert các task cần delay vào SortedSet và đặt thời gian expired tương ứng làm score.

Redisson định kỳ dùng lệnh `zrangebyscore` để quét các phần tử đã expired trong SortedSet, sau đó xóa các phần tử expired này khỏi SortedSet và thêm chúng vào ready message list. Ready message list là một blocking queue, có message vào sẽ được consumer lắng nghe ngay. Cách này tránh consumer phải poll toàn bộ SortedSet, tăng hiệu quả thực thi.

So với triển khai delayed task bằng Redis expired event listener, cách này có những ưu điểm sau:

1. **Giảm khả năng mất message**: Message trong DelayedQueue được persist. Kể cả Redis bị down, dựa trên cơ chế persistence cũng chỉ có thể mất một chút message, ảnh hưởng không lớn. Tất nhiên bạn cũng có thể dùng phương pháp scan database làm compensation mechanism.
2. **Message không có vấn đề duplicate consumption**: Mỗi client đều lấy task từ cùng một target queue, không có vấn đề duplicate consumption.

So với delayed queue tích hợp sẵn của Redisson, message queue có thể đảm bảo độ tin cậy consume message, kiểm soát số lượng producer và consumer để đạt throughput cao hơn và độ tin cậy mạnh hơn. Trong dự án thực tế, ưu tiên dùng phương án delayed message của message queue.
