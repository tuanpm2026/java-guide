---
title: Tổng hợp câu hỏi thường gặp về Kafka
description: Bài viết này tổng hợp các câu hỏi phỏng vấn Kafka và kiến thức cốt lõi, bao gồm kiến trúc Kafka (Broker/Topic/Partition/Consumer Group), nguyên lý hiệu năng cao (zero-copy/ghi tuần tự/xử lý hàng loạt), độ tin cậy của message (cơ chế ACK/ISR replica), thứ tự message, cơ chế Rebalance, so sánh Kafka và RocketMQ, hỗ trợ học tập và phỏng vấn Kafka.
category: Hiệu năng cao
tag:
  - Message Queue
head:
  - - meta
    - name: keywords
      content: Kafka,消息队列,Kafka分区,Kafka副本,ISR,消费者组,Rebalance,零拷贝,Kafka面试
---

## Kiến thức cơ bản về Kafka

### Kafka là gì? Các tình huống ứng dụng chính là gì?

Kafka là một nền tảng xử lý stream phân tán. Điều này có nghĩa là gì?

Nền tảng stream có ba chức năng chính:

1. **Message queue**: Phát hành và đăng ký luồng message, chức năng này tương tự như message queue, đây cũng là lý do Kafka được phân loại là message queue.
2. **Lưu trữ và ghi lại luồng message theo cách bền vững, chịu lỗi**: Kafka sẽ lưu trữ message vào đĩa, tránh hiệu quả nguy cơ mất message.
3. **Nền tảng xử lý stream:** Xử lý khi message được phát hành, Kafka cung cấp một thư viện xử lý stream hoàn chỉnh.

Kafka có hai tình huống ứng dụng chính:

1. **Message queue**: Xây dựng pipeline dữ liệu stream real-time để lấy dữ liệu đáng tin cậy giữa các hệ thống hoặc ứng dụng.
2. **Xử lý dữ liệu:** Xây dựng chương trình xử lý dữ liệu stream real-time để chuyển đổi hoặc xử lý luồng dữ liệu.

### So với các message queue khác, ưu thế của Kafka ở đâu?

Hiện nay khi nhắc đến Kafka, chúng ta đã mặc định nó là một message queue rất xuất sắc, chúng ta cũng thường so sánh nó với RocketMQ, RabbitMQ. Tôi nghĩ ưu thế chính của Kafka so với các message queue khác như sau:

1. **Hiệu năng tuyệt vời**: Được phát triển dựa trên ngôn ngữ Scala và Java, thiết kế sử dụng nhiều tư tưởng xử lý hàng loạt và bất đồng bộ, có thể xử lý lên đến hàng chục triệu message mỗi giây.
2. **Khả năng tương thích hệ sinh thái không thể so sánh**: Tính tương thích của Kafka với hệ sinh thái xung quanh là tốt nhất không có đối thủ, đặc biệt trong lĩnh vực big data và stream computing.

Thực tế, trong giai đoạn đầu, Kafka không phải là một message queue đủ tiêu chuẩn, Kafka trong giai đoạn đầu trong lĩnh vực message queue giống như một đứa trẻ ăn mặc rách rưới, chức năng không hoàn thiện và có một số vấn đề nhỏ như mất message, không đảm bảo độ tin cậy của message, v.v. Tất nhiên, điều này cũng liên quan lớn đến việc LinkedIn ban đầu phát triển Kafka để xử lý log với số lượng khổng lồ, haha, ban đầu họ không có ý định làm message queue, ai biết sau đó lại vô tình chiếm một chỗ đứng trong lĩnh vực message queue.

Với sự phát triển tiếp theo, những điểm yếu này đã được Kafka dần dần sửa chữa và hoàn thiện. Vì vậy, **nói rằng Kafka không đáng tin cậy như một message queue đã là lạc hậu rồi!**

### Bạn có hiểu về mô hình queue không? Bạn có biết mô hình message của Kafka không?

> Nói thêm: JMS và AMQP thời kỳ đầu thuộc về các tiêu chuẩn liên quan được thực hiện bởi các tổ chức có thẩm quyền trong lĩnh vực dịch vụ message, tôi đã giới thiệu trong bài viết [《消息队列其实很简单》](https://github.com/Snailclimb/JavaGuide#%E6%95%B0%E6%8D%AE%E9%80%9A%E4%BF%A1%E4%B8%AD%E9%97%B4%E4%BB%B6) trên [JavaGuide](https://github.com/Snailclimb/JavaGuide). Nhưng, sự tiến hóa của các tiêu chuẩn này không theo kịp tốc độ phát triển của message queue, các tiêu chuẩn này thực tế đã ở trạng thái lỗi thời. Vì vậy, tình huống có thể xảy ra là: các message queue khác nhau đều có mô hình message riêng của mình.

#### Mô hình queue: Mô hình message thời kỳ đầu

![Mô hình queue](/images/github/javaguide/high-performance/message-queue/%E9%98%9F%E5%88%97%E6%A8%A1%E5%9E%8B23.png)

**Sử dụng Queue (hàng đợi) làm phương tiện truyền thông message, đáp ứng mô hình producer-consumer, một message chỉ có thể được sử dụng bởi một consumer, các message chưa được tiêu thụ sẽ được giữ trong queue cho đến khi được tiêu thụ hoặc hết hạn.** Ví dụ: nếu producer của chúng ta gửi 100 message, hai consumer đến tiêu thụ, trong điều kiện bình thường hai consumer sẽ mỗi người tiêu thụ một nửa theo thứ tự message được gửi (tức là bạn một cái tôi một cái).

**Vấn đề tồn tại với mô hình queue:**

Giả sử chúng ta có tình huống như sau: Chúng ta cần phân phối message do producer tạo ra cho nhiều consumer, và mỗi consumer đều có thể nhận được nội dung message đầy đủ.

Trong tình huống này, mô hình queue khó giải quyết. Nhiều người cứng nhắc sẽ nói: Chúng ta có thể tạo một queue riêng biệt cho mỗi consumer, để producer gửi nhiều bản. Đây là cách làm rất ngu ngốc, lãng phí tài nguyên không cần thiết, và còn đi ngược lại mục đích sử dụng message queue.

#### Mô hình Publish-Subscribe: Mô hình message của Kafka

Mô hình publish-subscribe chủ yếu để giải quyết vấn đề tồn tại với mô hình queue.

![Mô hình publish-subscribe](/images/java-guide-blog/%E5%8F%91%E5%B8%83%E8%AE%A2%E9%98%85%E6%A8%A1%E5%9E%8B.png)

Mô hình publish-subscribe (Pub-Sub) sử dụng **Topic (chủ đề)** làm phương tiện truyền thông message, tương tự như **chế độ broadcast**; publisher phát hành một message, message đó được truyền đến tất cả subscriber thông qua topic, **những người đăng ký sau khi một message được broadcast sẽ không nhận được message đó**.

**Trong mô hình publish-subscribe, nếu chỉ có một subscriber, thì về cơ bản nó giống với mô hình queue. Vì vậy, mô hình publish-subscribe có thể tương thích với mô hình queue ở cấp độ chức năng.**

**Kafka áp dụng mô hình publish-subscribe.**

> **Mô hình message của RocketMQ và Kafka về cơ bản hoàn toàn giống nhau. Sự khác biệt duy nhất là trong Kafka không có khái niệm queue, thứ tương ứng là Partition (phân vùng).**

## Các khái niệm cốt lõi của Kafka

### Producer, Consumer, Broker, Topic, Partition là gì?

Kafka gửi message do producer phát hành đến **Topic (chủ đề)**, các consumer cần những message này có thể đăng ký các **Topic (chủ đề)** này, như hình dưới đây:

![](/images/github/javaguide/high-performance/message-queue20210507200944439.png)

Hình trên cũng giới thiệu cho chúng ta một số khái niệm quan trọng của Kafka:

1. **Producer (Nhà sản xuất)**: Bên tạo ra message.
2. **Consumer (Người tiêu dùng)**: Bên tiêu thụ message.
3. **Broker (Nhà môi giới)**: Có thể được coi là một instance Kafka độc lập. Nhiều Kafka Broker tạo thành một Kafka Cluster.

Đồng thời, bạn chắc chắn cũng nhận thấy mỗi Broker lại chứa hai khái niệm quan trọng là Topic và Partition:

- **Topic (Chủ đề)**: Producer gửi message đến topic cụ thể, Consumer tiêu thụ message bằng cách đăng ký Topic cụ thể.
- **Partition (Phân vùng)**: Partition thuộc về một phần của Topic. Một Topic có thể có nhiều Partition, và Partition của cùng một Topic có thể được phân tán trên các Broker khác nhau, điều này cũng có nghĩa là một Topic có thể trải dài trên nhiều Broker. Điều này giống như hình tôi đã vẽ ở trên.

> Lưu ý quan trọng: **Partition (phân vùng) trong Kafka thực tế có thể tương ứng với queue trong message queue. Điều này có dễ hiểu hơn không?**

### Bạn có hiểu về cơ chế multi-replica của Kafka không? Nó mang lại những lợi ích gì?

Một điểm tôi cho là khá quan trọng là Kafka đã giới thiệu cơ chế multi-replica (Replica) cho Partition. Trong số nhiều replica của Partition, sẽ có một replica được gọi là leader, các replica khác được gọi là follower. Message chúng ta gửi sẽ được gửi đến replica leader, sau đó replica follower mới có thể kéo message từ replica leader để đồng bộ.

> Producer và consumer chỉ tương tác với replica leader. Bạn có thể hiểu các replica khác chỉ là bản sao của replica leader, sự tồn tại của chúng chỉ để đảm bảo tính an toàn của việc lưu trữ message. Khi replica leader bị lỗi, một leader mới sẽ được bầu chọn từ các follower, nhưng nếu có follower nào mà mức độ đồng bộ với leader không đáp ứng yêu cầu thì không được tham gia bầu chọn leader.

**Cơ chế multi-partition (Partition) và multi-replica (Replica) của Kafka có những lợi ích gì?**

1. Kafka cung cấp khả năng đồng thời tốt hơn (cân bằng tải) bằng cách chỉ định nhiều Partition cho một Topic cụ thể, trong khi các Partition có thể được phân tán trên các Broker khác nhau.
2. Partition có thể chỉ định số Replica tương ứng, điều này cũng nâng cao đáng kể tính an toàn của lưu trữ message, cải thiện khả năng phục hồi sau thảm họa, nhưng cũng tương ứng làm tăng không gian lưu trữ cần thiết.

## Zookeeper và Kafka

### Vai trò của Zookeeper trong Kafka là gì?

> Để hiểu vai trò của Zookeeper trong Kafka, nhất định phải tự tay xây dựng một môi trường Kafka rồi tự vào Zookeeper xem có những thư mục nào liên quan đến Kafka, mỗi node lưu những thông tin gì. Nhất định đừng chỉ xem mà không thực hành, kiến thức học như vậy cuối cùng sẽ bị quên mất! Phần nội dung này có tham khảo bài viết sau: <https://www.jianshu.com/p/a036405f989c>.

Hình dưới đây là Zookeeper cục bộ của tôi, nó đã kết nối thành công với Kafka cục bộ của tôi (cấu trúc thư mục sau đây được thực hiện thông qua plugin Zookeeper tool của idea).

<img src="/images/github/javaguide/high-performance/message-queue/zookeeper-kafka.jpg" style="zoom:50%;" />

ZooKeeper chủ yếu cung cấp chức năng quản lý metadata cho Kafka.

Từ hình, chúng ta có thể thấy Zookeeper chủ yếu làm những việc sau cho Kafka:

1. **Broker Registration (Đăng ký Broker)**: Trên Zookeeper sẽ có một node chuyên dùng **để ghi lại danh sách server Broker**. Mỗi Broker khi khởi động sẽ đăng ký trên Zookeeper, tức là tạo node thuộc về mình dưới `/brokers/ids`. Mỗi Broker sẽ ghi địa chỉ IP và số port của mình vào node đó.
2. **Topic Registration (Đăng ký Topic)**: Trong Kafka, **message của cùng một Topic sẽ được chia thành nhiều partition** và phân tán trên nhiều Broker, **thông tin partition này và mối quan hệ tương ứng với Broker** cũng đều do Zookeeper duy trì. Ví dụ tôi tạo một chủ đề tên là my-topic và nó có hai partition, tương ứng trong Zookeeper sẽ tạo các thư mục sau: `/brokers/topics/my-topic/Partitions/0`, `/brokers/topics/my-topic/Partitions/1`
3. **Load Balancing (Cân bằng tải)**: Như đã đề cập ở trên, Kafka cung cấp khả năng đồng thời tốt hơn bằng cách chỉ định nhiều Partition cho một Topic cụ thể, trong khi các Partition có thể được phân tán trên các Broker khác nhau. Đối với các Partition khác nhau của cùng một Topic, Kafka sẽ cố gắng phân tán các Partition này trên các server Broker khác nhau. Sau khi producer tạo ra message cũng sẽ cố gắng gửi đến Partition của các Broker khác nhau. Khi Consumer tiêu thụ, Zookeeper có thể thực hiện cân bằng tải động dựa trên số lượng Partition và Consumer hiện tại.
4. ……

### Sử dụng Kafka có thể không cần Zookeeper không?

Trước Kafka 2.8, điều bị phàn nàn nhiều nhất về Kafka là sự phụ thuộc nặng nề vào Zookeeper. Sau Kafka 2.8, chế độ KRaft dựa trên giao thức Raft đã được giới thiệu, không còn phụ thuộc vào Zookeeper nữa, đơn giản hóa đáng kể kiến trúc Kafka, cho phép bạn sử dụng Kafka theo cách nhẹ nhàng hơn.

Tuy nhiên, cần lưu ý: **Nếu muốn sử dụng chế độ KRaft, khuyến nghị chọn phiên bản Kafka cao hơn, vì tính năng này vẫn đang được tiếp tục hoàn thiện và tối ưu hóa. Kafka 3.3.1 là phiên bản đầu tiên đánh dấu giao thức đồng thuận KRaft (Kafka Raft) là sẵn sàng cho môi trường production.**

![](/images/github/javaguide/high-performance/message-queue/kafka3.3.1-kraft-production-ready.png)

## Thứ tự tiêu thụ, mất message và tiêu thụ lặp lại trong Kafka

### Kafka đảm bảo thứ tự tiêu thụ message như thế nào?

Trong quá trình sử dụng message queue, chúng ta thường có các tình huống nghiệp vụ cần đảm bảo nghiêm ngặt thứ tự tiêu thụ message, ví dụ chúng ta đồng thời gửi 2 message, 2 message này tương ứng với các thao tác cơ sở dữ liệu là:

1. Thay đổi cấp độ thành viên của người dùng.
2. Tính giá đơn hàng dựa trên cấp độ thành viên.

Nếu thứ tự tiêu thụ của hai message này không giống nhau, kết quả cuối cùng sẽ hoàn toàn khác nhau.

Chúng ta biết rằng Partition (phân vùng) trong Kafka là nơi thực sự lưu trữ message, tất cả message chúng ta gửi đều được đặt ở đây. Và Partition (phân vùng) của chúng ta tồn tại trong khái niệm Topic (chủ đề), và chúng ta có thể chỉ định nhiều Partition cho một Topic cụ thể.

![](/images/github/javaguide/high-performance/message-queue/KafkaTopicPartionsLayout.png)

Mỗi lần thêm message vào Partition (phân vùng) đều sử dụng phương pháp thêm vào cuối (tail append), như hình trên. **Kafka chỉ có thể đảm bảo các message trong Partition (phân vùng) có thứ tự.**

> Khi message được thêm vào Partition (phân vùng) sẽ được phân bổ một offset cụ thể. Kafka đảm bảo thứ tự message trong partition thông qua offset.

Vì vậy, chúng ta có một cách đơn giản để đảm bảo thứ tự tiêu thụ message: **1 Topic chỉ tương ứng với 1 Partition**. Điều này tất nhiên có thể giải quyết vấn đề, nhưng phá vỡ ý tưởng thiết kế ban đầu của Kafka.

Khi gửi 1 message trong Kafka, có thể chỉ định 4 tham số: topic, partition, key, data (dữ liệu). Nếu bạn chỉ định Partition khi gửi message, tất cả message sẽ được gửi đến Partition được chỉ định. Và các message có cùng key có thể đảm bảo chỉ được gửi đến cùng một partition, chúng ta có thể sử dụng id của bảng/đối tượng làm key.

Tóm lại, để đảm bảo thứ tự tiêu thụ message trong Kafka, có hai phương pháp sau:

1. 1 Topic chỉ tương ứng với 1 Partition.
2. (Khuyến nghị) Chỉ định key/Partition khi gửi message.

Tất nhiên không chỉ có hai phương pháp trên, đây là hai phương pháp tôi cho là tương đối dễ hiểu.

### Kafka đảm bảo message không bị mất như thế nào?

#### Tình huống producer mất message

Producer gọi phương thức `send` để gửi message, message có thể không được gửi đi do vấn đề mạng.

Vì vậy, chúng ta không thể mặc định rằng message đã được gửi thành công sau khi gọi phương thức `send`. Để xác định message đã được gửi thành công, chúng ta phải kiểm tra kết quả gửi message. Nhưng cần lưu ý rằng Kafka producer sử dụng phương thức `send` để gửi message thực ra là thao tác bất đồng bộ, chúng ta có thể lấy kết quả gọi thông qua phương thức `get()`, nhưng điều này cũng làm nó trở thành thao tác đồng bộ, code ví dụ như sau:

> **Code chi tiết xem bài viết của tôi: [Kafka series part 3! Learn how to use Kafka as a message queue in Spring Boot in 10 minutes?](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247486269&idx=2&sn=ec00417ad641dd8c3d145d74cafa09ce&chksm=cea244f6f9d5cde0c8eb233fcc4cf82e11acd06446719a7af55230649863a3ddd95f78d111de&token=1633957262&lang=zh_CN#rd)**

```java
SendResult<String, Object> sendResult = kafkaTemplate.send(topic, o).get();
if (sendResult.getRecordMetadata() != null) {
  logger.info("生产者成功发送消息到" + sendResult.getProducerRecord().topic() + "-> " + sendRe
              sult.getProducerRecord().value().toString());
}
```

Nhưng nhìn chung không khuyến nghị làm như vậy! Có thể áp dụng cách thêm callback function, code ví dụ như sau:

```java
        ListenableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, o);
        future.addCallback(result -> logger.info("生产者成功发送消息到topic:{} partition:{}的消息", result.getRecordMetadata().topic(), result.getRecordMetadata().partition()),
                ex -> logger.error("生产者发送消失败，原因：{}", ex.getMessage()));
```

Nếu gửi message thất bại, chúng ta kiểm tra nguyên nhân thất bại rồi gửi lại!

Ngoài ra, ở đây khuyến nghị đặt `retries` (số lần thử lại) của Producer thành một giá trị hợp lý, thường là 3, nhưng để đảm bảo message không bị mất thường sẽ đặt lớn hơn một chút. Sau khi cài đặt xong, khi gặp sự cố mạng có thể tự động thử lại gửi message, tránh mất message. Ngoài ra, khuyến nghị cũng đặt khoảng thời gian thử lại, vì nếu khoảng thời gian quá nhỏ thì hiệu quả thử lại không rõ ràng, mạng dao động một lần là đã thử lại xong 3 lần rồi.

#### Tình huống consumer mất message

Chúng ta biết rằng khi message được thêm vào Partition (phân vùng) sẽ được phân bổ một offset cụ thể. Offset biểu thị vị trí hiện tại Consumer đang tiêu thụ trong Partition (phân vùng). Kafka có thể đảm bảo thứ tự message trong partition thông qua offset.

![kafka offset](/images/github/javaguide/high-performance/message-queue/kafka-offset.jpg)

Khi consumer kéo một message nào đó trong partition, consumer sẽ tự động commit offset. Tự động commit sẽ có một vấn đề, hãy thử nghĩ xem: khi consumer vừa lấy được message này chuẩn bị tiêu thụ thực sự, đột nhiên bị crash, message thực tế chưa được tiêu thụ, nhưng offset đã được tự động commit.

**Giải pháp cũng khá mạnh bạo, chúng ta tắt thủ công việc tự động commit offset, mỗi lần sau khi thực sự tiêu thụ xong message thì tự tay commit offset.** Nhưng, những bạn tinh ý chắc chắn sẽ phát hiện ra điều này sẽ dẫn đến vấn đề message bị tiêu thụ lại. Ví dụ bạn vừa tiêu thụ xong message, chưa kịp commit offset, bị crash, thì về lý thuyết message này sẽ bị tiêu thụ hai lần.

#### Kafka làm mất message

Chúng ta biết Kafka đã giới thiệu cơ chế multi-replica (Replica) cho Partition. Trong số nhiều replica của Partition, sẽ có một replica được gọi là leader, các replica khác được gọi là follower. Message chúng ta gửi sẽ được gửi đến replica leader, sau đó replica follower mới có thể kéo message từ replica leader để đồng bộ. Producer và consumer chỉ tương tác với replica leader. Bạn có thể hiểu các replica khác chỉ là bản sao của replica leader, sự tồn tại của chúng chỉ để đảm bảo tính an toàn của việc lưu trữ message.

**Hãy thử hình dung một tình huống: Nếu broker chứa replica leader bị crash đột ngột, thì phải bầu chọn ra một leader mới từ các follower replica, nhưng nếu dữ liệu của leader chưa được đồng bộ bởi một số follower replica, điều đó sẽ dẫn đến mất message.**

**Đặt acks = all**

Giải pháp là chúng ta đặt **acks = all**. acks là một tham số rất quan trọng của Kafka producer.

Giá trị mặc định của acks là 1, nghĩa là message của chúng ta được coi là đã gửi thành công sau khi được replica leader nhận. Khi chúng ta cấu hình **acks = all** có nghĩa là chỉ khi tất cả replica trong danh sách ISR đều nhận được message, producer mới nhận được phản hồi từ server. Chế độ này là cấp cao nhất, cũng là an toàn nhất, có thể đảm bảo không chỉ một Broker nhận được message. Độ trễ của chế độ này sẽ rất cao.

**Đặt replication.factor >= 3**

Để đảm bảo replica leader có follower replica có thể đồng bộ message, chúng ta thường đặt **replication.factor >= 3** cho topic. Điều này có thể đảm bảo mỗi partition có ít nhất 3 replica. Mặc dù gây ra dư thừa dữ liệu, nhưng mang lại tính an toàn cho dữ liệu.

**Đặt min.insync.replicas > 1**

Thông thường chúng ta cũng cần đặt **min.insync.replicas> 1**, cấu hình này có nghĩa là message phải được ghi vào ít nhất 2 replica mới được coi là gửi thành công. Giá trị mặc định của **min.insync.replicas** là 1, trong môi trường production thực tế nên tránh giá trị mặc định là 1.

Nhưng để đảm bảo tính khả dụng cao của toàn bộ dịch vụ Kafka, bạn cần đảm bảo **replication.factor > min.insync.replicas**. Tại sao? Hãy thử nghĩ xem nếu cả hai bằng nhau, chỉ cần có một replica bị down, toàn bộ partition sẽ không thể hoạt động bình thường. Điều này rõ ràng vi phạm tính khả dụng cao! Thường khuyến nghị đặt **replication.factor = min.insync.replicas + 1**.

**Đặt unclean.leader.election.enable = false**

> **Từ Kafka 0.11.0.0 trở đi, giá trị mặc định của tham số unclean.leader.election.enable thay đổi từ true thành false**

Như đã đề cập ban đầu, message chúng ta gửi sẽ được gửi đến replica leader, sau đó follower replica mới có thể kéo message từ replica leader để đồng bộ. Tình trạng đồng bộ message giữa nhiều follower replica không giống nhau, khi chúng ta cấu hình **unclean.leader.election.enable = false**, khi replica leader bị lỗi sẽ không chọn ra leader từ các follower replica mà mức độ đồng bộ với leader không đáp ứng yêu cầu, điều này giảm khả năng mất message.

### Kafka đảm bảo message không bị tiêu thụ lặp lại như thế nào?

**Nguyên nhân xuất hiện tiêu thụ message lặp lại trong Kafka:**

- Dữ liệu đã được tiêu thụ phía server chưa commit offset thành công (nguyên nhân gốc rễ).
- Phía Kafka do thời gian xử lý nghiệp vụ phía server dài hoặc các lý do kết nối mạng khiến Kafka cho rằng service đã bị treo, kích hoạt rebalance partition.

**Giải pháp:**

- Service tiêu thụ message thực hiện kiểm tra idempotent, ví dụ set của Redis, khóa chính của MySQL và các tính năng idempotent tự nhiên khác. Phương pháp này hiệu quả nhất.
- Đặt tham số **`enable.auto.commit`** thành false, tắt tự động commit, developer thủ công commit offset trong code. Thì ở đây sẽ có một vấn đề: **Khi nào là thời điểm thích hợp để commit offset?**
  - Commit sau khi xử lý xong message: Vẫn có nguy cơ tiêu thụ message lặp lại, giống như tự động commit
  - Commit ngay khi kéo được message: Sẽ có nguy cơ mất message. Trong các tình huống cho phép message bị trễ, thường áp dụng cách này. Sau đó, sử dụng scheduled task để làm dữ liệu backup trong thời gian nghiệp vụ không bận rộn (như lúc nửa đêm).

## Cơ chế retry trong Kafka

Ở phần Kafka đảm bảo message không bị mất, chúng ta đã đề cập đến cơ chế retry của Kafka. Do phần nội dung này khá quan trọng, chúng ta sẽ giới thiệu chi tiết hơn ở đây.

Trên internet có nhiều bài viết về cơ chế retry mặc định của Spring Kafka, nhưng phần lớn đều đã lỗi thời, hoàn toàn không khớp với kết quả thực tế. Sau đây là phân tích lại dựa trên mã nguồn của [spring-kafka-2.9.3](https://mvnrepository.com/artifact/org.springframework.kafka/spring-kafka/2.9.3).

### Điều gì xảy ra khi tiêu thụ thất bại?

Trong quá trình tiêu thụ, khi một message bị lỗi, liệu nó có chặn việc tiêu thụ các message tiếp theo trong queue không? Như vậy nghiệp vụ sẽ không bị tắc nghẽn sao?

Code producer:

```Java
 for (int i = 0; i < 10; i++) {
   kafkaTemplate.send(KafkaConst.TEST_TOPIC, String.valueOf(i))
 }
```

Code consumer:

```Java
   @KafkaListener(topics = {KafkaConst.TEST_TOPIC},groupId = "apple")
   private void customer(String message) throws InterruptedException {
       log.info("kafka customer:{}",message);
       Integer n = Integer.parseInt(message);
       if (n%5==0){
           throw new  RuntimeException();
       }
   }
```

Trong cấu hình mặc định, khi tiêu thụ bị lỗi sẽ thực hiện retry, sau nhiều lần retry sẽ bỏ qua message hiện tại, tiếp tục tiêu thụ các message tiếp theo, sẽ không bị tắc nghẽn mãi ở message hiện tại. Dưới đây là một đoạn log tiêu thụ, có thể thấy khi `test-0@95` được retry nhiều lần sẽ bị bỏ qua.

```Java
2023-08-10 12:03:32.918 DEBUG 9700 --- [ntainer#0-0-C-1] o.s.kafka.listener.DefaultErrorHandler   : Skipping seek of: test-0@95
2023-08-10 12:03:32.918 TRACE 9700 --- [ntainer#0-0-C-1] o.s.kafka.listener.DefaultErrorHandler   : Seeking: test-0 to: 96
2023-08-10 12:03:32.918  INFO 9700 --- [ntainer#0-0-C-1] o.a.k.clients.consumer.KafkaConsumer     : [Consumer clientId=consumer-apple-1, groupId=apple] Seeking to offset 96 for partition test-0

```

Do đó, ngay cả khi một message bị lỗi khi tiêu thụ, Kafka consumer vẫn có thể tiếp tục tiêu thụ các message tiếp theo, sẽ không bị tắc nghẽn mãi ở message hiện tại, đảm bảo nghiệp vụ hoạt động bình thường.

### Mặc định sẽ retry bao nhiêu lần?

Trong cấu hình mặc định, khi tiêu thụ bị lỗi sẽ thực hiện retry, số lần retry là bao nhiêu, retry có khoảng thời gian không?

Xem mã nguồn lớp `FailedRecordTracker` có một hàm `recovered`, trả về giá trị Boolean để xác định có cần retry hay không, dưới đây là logic xác định có retry hay không trong hàm này:

```java
	@Override
	public boolean recovered(ConsumerRecord << ? , ? > record, Exception exception,
	    @Nullable MessageListenerContainer container,
	    @Nullable Consumer << ? , ? > consumer) throws InterruptedException {

	    if (this.noRetries) {
         // 不支持重试
	        attemptRecovery(record, exception, null, consumer);
	        return true;
	    }
     // 取已经失败的消费记录集合
	    Map < TopicPartition, FailedRecord > map = this.failures.get();
	    if (map == null) {
	        this.failures.set(new HashMap < > ());
	        map = this.failures.get();
	    }
     //  获取消费记录所在的Topic和Partition
	    TopicPartition topicPartition = new TopicPartition(record.topic(), record.partition());
	    FailedRecord failedRecord = getFailedRecordInstance(record, exception, map, topicPartition);
     // 通知注册的重试监听器，消息投递失败
	    this.retryListeners.forEach(rl - >
	        rl.failedDelivery(record, exception, failedRecord.getDeliveryAttempts().get()));
	    // 获取下一次重试的时间间隔
    long nextBackOff = failedRecord.getBackOffExecution().nextBackOff();
	    if (nextBackOff != BackOffExecution.STOP) {
	        this.backOffHandler.onNextBackOff(container, exception, nextBackOff);
	        return false;
	    } else {
	        attemptRecovery(record, exception, topicPartition, consumer);
	        map.remove(topicPartition);
	        if (map.isEmpty()) {
	            this.failures.remove();
	        }
	        return true;
	    }
	}
```

Trong đó, giá trị của `BackOffExecution.STOP` là -1.

```java
@FunctionalInterface
public interface BackOffExecution {

	long STOP = -1;
	long nextBackOff();

}
```

Giá trị của `nextBackOff` được tính bằng cách gọi hàm `nextBackOff()` của lớp `BackOff`. Nếu số lần thực thi hiện tại lớn hơn số lần thực thi tối đa thì trả về `STOP`, tức là chỉ sau khi vượt quá số lần thực thi tối đa này mới dừng retry.

```Java
public long nextBackOff() {
  this.currentAttempts++;
  if (this.currentAttempts <= getMaxAttempts()) {
    return getInterval();
  }
  else {
    return STOP;
  }
}
```

Vậy giá trị `getMaxAttempts` là bao nhiêu? Quay lại ban đầu, khi thực thi bị lỗi sẽ vào `DefaultErrorHandler`. Constructor mặc định của `DefaultErrorHandler` là:

```Java
public DefaultErrorHandler() {
  this(null, SeekUtils.DEFAULT_BACK_OFF);
}
```

`SeekUtils.DEFAULT_BACK_OFF` được định nghĩa là:

```Java
public static final int DEFAULT_MAX_FAILURES = 10;

public static final FixedBackOff DEFAULT_BACK_OFF = new FixedBackOff(0, DEFAULT_MAX_FAILURES - 1);
```

Giá trị của `DEFAULT_MAX_FAILURES` là 10, `currentAttempts` từ 0 đến 9, vì vậy tổng cộng sẽ thực thi 10 lần, khoảng thời gian mỗi lần retry là 0.

Cuối cùng, tóm tắt đơn giản: Kafka consumer trong cấu hình mặc định sẽ thực hiện tối đa 10 lần retry, khoảng thời gian mỗi lần retry là 0, tức là retry ngay lập tức. Nếu sau 10 lần retry vẫn không thể tiêu thụ message thành công, sẽ không retry nữa, message sẽ được coi là tiêu thụ thất bại.

### Cách tùy chỉnh số lần retry và khoảng thời gian?

Từ code ở trên có thể biết, số lần retry và khoảng thời gian của error handler mặc định được kiểm soát bởi `FixedBackOff`, `FixedBackOff` là mặc định khi khởi tạo `DefaultErrorHandler`. Vì vậy để tùy chỉnh số lần retry và khoảng thời gian, chỉ cần truyền `FixedBackOff` tùy chỉnh khi khởi tạo `DefaultErrorHandler`. Tái triển khai một `KafkaListenerContainerFactory`, gọi `setCommonErrorHandler` để đặt error handler tùy chỉnh mới là có thể thực hiện.

```Java
@Bean
public KafkaListenerContainerFactory kafkaListenerContainerFactory(ConsumerFactory<String, String> consumerFactory) {
    ConcurrentKafkaListenerContainerFactory factory = new ConcurrentKafkaListenerContainerFactory();
    // 自定义重试时间间隔以及次数
    FixedBackOff fixedBackOff = new FixedBackOff(1000, 5);
    factory.setCommonErrorHandler(new DefaultErrorHandler(fixedBackOff));
    factory.setConsumerFactory(consumerFactory);
    return factory;
}
```

### Cách cảnh báo sau khi retry thất bại?

Để tùy chỉnh logic sau khi retry thất bại, cần thực hiện thủ công, dưới đây là một ví dụ đơn giản, override hàm `handleRemaining` của `DefaultErrorHandler`, thêm các thao tác tùy chỉnh như cảnh báo.

```Java
@Slf4j
public class DelErrorHandler extends DefaultErrorHandler {

    public DelErrorHandler(FixedBackOff backOff) {
        super(null,backOff);
    }

    @Override
    public void handleRemaining(Exception thrownException, List<ConsumerRecord<?, ?>> records, Consumer<?, ?> consumer, MessageListenerContainer container) {
        super.handleRemaining(thrownException, records, consumer, container);
        log.info("重试多次失败");
        // 自定义操作
    }
}
```

`DefaultErrorHandler` chỉ là một error handler mặc định, Spring Kafka còn cung cấp interface `CommonErrorHandler`. Thực hiện thủ công `CommonErrorHandler` có thể triển khai nhiều thao tác tùy chỉnh hơn, có độ linh hoạt rất cao. Ví dụ dựa trên các kiểu lỗi khác nhau, thực hiện logic retry và logic nghiệp vụ khác nhau, v.v.

### Cách xử lý lại dữ liệu sau khi retry thất bại?

Khi đạt đến số lần retry tối đa, dữ liệu sẽ bị bỏ qua trực tiếp, tiếp tục đi về phía sau. Sau khi code được sửa chữa, làm thế nào để tiêu thụ lại những dữ liệu retry thất bại này?

**Dead Letter Queue (DLQ - Hàng đợi thư chết)** là một loại queue đặc biệt trong message middleware. Nó chủ yếu được sử dụng để xử lý các message không thể được consumer xử lý đúng cách, thường là do lỗi định dạng message, xử lý thất bại, tiêu thụ timeout và các tình huống khác dẫn đến message bị "loại bỏ" hoặc "chết". Khi message vào queue, consumer sẽ cố gắng xử lý nó. Nếu xử lý thất bại, hoặc vượt quá số lần retry nhất định mà vẫn không thể xử lý thành công, message có thể được gửi đến dead letter queue, thay vì bị loại bỏ vĩnh viễn. Trong dead letter queue, có thể phân tích và xử lý thêm những message không thể tiêu thụ bình thường này, để xác định vị trí vấn đề, sửa chữa lỗi và thực hiện các biện pháp thích hợp.

`@RetryableTopic` là một annotation trong Spring Kafka, được sử dụng để cấu hình một Topic hỗ trợ retry message, khuyến nghị sử dụng annotation này hơn để hoàn thành retry.

```Java
// 重试 5 次，重试间隔 100 毫秒,最大间隔 1 秒
@RetryableTopic(
        attempts = "5",
        backoff = @Backoff(delay = 100, maxDelay = 1000)
)
@KafkaListener(topics = {KafkaConst.TEST_TOPIC}, groupId = "apple")
private void customer(String message) {
    log.info("kafka customer:{}", message);
    Integer n = Integer.parseInt(message);
    if (n % 5 == 0) {
        throw new RuntimeException();
    }
    System.out.println(n);
}
```

Khi đạt đến số lần retry tối đa, nếu vẫn không thể xử lý message thành công, message sẽ được gửi đến dead letter queue tương ứng. Đối với việc xử lý dead letter queue, có thể sử dụng `@DltHandler` để xử lý, cũng có thể sử dụng `@KafkaListener` để tiêu thụ lại.

## Tham khảo

- Tài liệu chính thức Kafka: <https://kafka.apache.org/documentation/>
- Geek Time —《Kafka 核心技术与实战》Phần 11: Cấu hình không mất message được triển khai như thế nào?

<!-- @include: @article-footer.snippet.md -->
