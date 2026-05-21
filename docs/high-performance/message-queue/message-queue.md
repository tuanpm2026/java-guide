---
title: Tổng hợp kiến thức cơ bản về hàng đợi tin nhắn
description: Bài viết này tổng hợp có hệ thống các kiến thức cốt lõi về hàng đợi tin nhắn, bao gồm các tình huống ứng dụng (xử lý bất đồng bộ/tách coupling/cắt đỉnh), mô hình tin nhắn (point-to-point/pub-sub), cách đảm bảo không mất tin nhắn, tính idempotent của tin nhắn, thứ tự tin nhắn, xử lý tích lũy tin nhắn và các vấn đề phổ biến khác, cũng như so sánh lựa chọn công nghệ Kafka, RocketMQ, RabbitMQ.
category: Hiệu suất cao
tag:
  - Hàng đợi tin nhắn
head:
  - - meta
    - name: keywords
      content: 消息队列,MQ,异步解耦,削峰填谷,消息丢失,消息幂等,消息顺序,Kafka,RocketMQ,RabbitMQ
---

::: tip

Hàng đợi tin nhắn được đề cập trong bài viết này chủ yếu đề cập đến hàng đợi tin nhắn phân tán.

:::

"RabbitMQ?" "Kafka?" "RocketMQ?"... Trong quá trình học tập và phát triển hàng ngày, chúng ta thường nghe đến từ khóa hàng đợi tin nhắn. Tôi cũng đề cập đến khái niệm này trong nhiều bài viết của mình. Có thể bạn là người dày dạn kinh nghiệm sử dụng hàng đợi tin nhắn, hoặc bạn là người mới chưa hiểu về hàng đợi tin nhắn, dù bạn có hiểu hay không, bài viết này sẽ giúp bạn nắm được một số lý thuyết cơ bản về hàng đợi tin nhắn.

Nếu bạn là người có kinh nghiệm, có thể bạn sẽ học được từ bài viết này một số khái niệm quan trọng về hàng đợi tin nhắn mà trước đây bạn chưa chú ý. Nếu bạn là người mới, tin rằng bài viết này sẽ là viên gạch mở ra cánh cửa hàng đợi tin nhắn cho bạn.

## Hàng đợi tin nhắn là gì?

Chúng ta có thể coi hàng đợi tin nhắn như một container chứa tin nhắn, khi chúng ta cần sử dụng tin nhắn, chỉ cần lấy tin nhắn từ container ra để dùng. Vì Queue là một cấu trúc dữ liệu vào trước ra trước (FIFO), nên khi tiêu thụ tin nhắn cũng theo thứ tự.

![](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/message-queue-small.png)

Hai bên tham gia truyền tin nhắn được gọi là **producer** và **consumer**, producer chịu trách nhiệm gửi tin nhắn, consumer chịu trách nhiệm xử lý tin nhắn.

![Mô hình Publish/Subscribe (Pub/Sub)](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/message-queue-pub-sub-model.png)

Một trong những phương thức giao tiếp liên tiến trình quan trọng trong hệ điều hành là hàng đợi tin nhắn. Hàng đợi tin nhắn mà chúng ta đề cập ở đây có sự khác biệt nhỏ, chủ yếu đề cập đến giao tiếp giữa các dịch vụ và các thành phần/module bên trong hệ thống, thuộc một loại **middleware**.

Wikipedia giới thiệu về middleware như sau:

> Middleware (tiếng Anh: Middleware), còn dịch là phần mềm trung gian, là loại phần mềm cung cấp kết nối giữa phần mềm hệ thống và phần mềm ứng dụng, tạo điều kiện giao tiếp giữa các thành phần phần mềm. Phần mềm ứng dụng có thể nhờ middleware chia sẻ thông tin và tài nguyên giữa các kiến trúc công nghệ khác nhau. Middleware nằm phía trên hệ điều hành client-server, quản lý tài nguyên tính toán và giao tiếp mạng.

Nói đơn giản: **Middleware là loại phần mềm phục vụ cho phần mềm ứng dụng, phần mềm ứng dụng phục vụ người dùng, người dùng không tiếp xúc hoặc sử dụng middleware.**

Ngoài hàng đợi tin nhắn, các middleware phổ biến khác còn có RPC framework, thành phần phân tán, HTTP server, framework lập lịch tác vụ, configuration center, công cụ phân vùng cơ sở dữ liệu và công cụ di chuyển dữ liệu, v.v.

Bạn có thể tham khảo câu trả lời chi tiết hơn về middleware từ công nghệ Taobao của Alibaba: <https://www.zhihu.com/question/19730582/answer/1663627873>.

Cùng với sự phát triển của hệ thống phân tán và microservice, hàng đợi tin nhắn có không gian phát huy lớn hơn trong thiết kế hệ thống. Sử dụng hàng đợi tin nhắn có thể giảm coupling của hệ thống, thực hiện tác vụ bất đồng bộ, cắt đỉnh lưu lượng hiệu quả, là một trong những thành phần quan trọng của hệ thống phân tán và microservice.

## Hàng đợi tin nhắn có tác dụng gì?

Thông thường, sử dụng hàng đợi tin nhắn có thể mang lại ba lợi ích sau cho hệ thống của chúng ta:

1. Xử lý bất đồng bộ
2. Cắt đỉnh/giới hạn lưu lượng
3. Giảm coupling của hệ thống

Ngoài ba điểm này, hàng đợi tin nhắn còn có một số tình huống ứng dụng khác, ví dụ như thực hiện giao dịch phân tán, đảm bảo thứ tự và xử lý luồng dữ liệu.

Nếu trong phỏng vấn bạn được người phỏng vấn hỏi câu hỏi này, thông thường là vì trong CV của bạn có đề cập đến nội dung hàng đợi tin nhắn. Lúc này khuyến nghị bạn kết hợp dự án của bản thân để trả lời.

### Xử lý bất đồng bộ

![Nâng cao hiệu suất hệ thống thông qua xử lý bất đồng bộ](https://oss.javaguide.cn/github/javaguide/Asynchronous-message-queue.png)

Các thao tác tốn thời gian trong yêu cầu người dùng được xử lý bất đồng bộ thông qua hàng đợi tin nhắn. Sau khi gửi tin nhắn tương ứng vào hàng đợi tin nhắn, kết quả được trả về ngay lập tức, giảm thời gian phản hồi, nâng cao trải nghiệm người dùng. Sau đó, hệ thống tiêu thụ tin nhắn.

Vì dữ liệu yêu cầu của người dùng được trả về ngay sau khi ghi vào hàng đợi tin nhắn, nhưng dữ liệu yêu cầu có thể thất bại trong các thao tác tiếp theo như xác thực nghiệp vụ, ghi cơ sở dữ liệu. Vì vậy, **sau khi sử dụng hàng đợi tin nhắn để xử lý bất đồng bộ, cần sửa đổi phù hợp quy trình nghiệp vụ để phối hợp**, ví dụ sau khi người dùng đặt hàng, dữ liệu đơn hàng được ghi vào hàng đợi tin nhắn, không thể ngay lập tức trả về cho người dùng rằng đơn hàng đã được gửi thành công, cần đợi đến khi tiến trình consumer đơn hàng trong hàng đợi tin nhắn thực sự xử lý xong đơn hàng đó, thậm chí sau khi xuất kho, mới thông báo cho người dùng qua email hoặc tin nhắn rằng đơn hàng đã thành công, để tránh tranh chấp giao dịch. Điều này giống như việc chúng ta đặt vé tàu và vé phim trên điện thoại.

### Cắt đỉnh/Giới hạn lưu lượng

**Trước tiên lưu trữ các tin nhắn giao dịch được tạo ra trong thời gian ngắn với lượng đồng thời cao vào hàng đợi tin nhắn, sau đó dịch vụ backend từ từ tiêu thụ các tin nhắn này theo khả năng của mình, điều này tránh được việc làm sập trực tiếp dịch vụ backend.**

Ví dụ: Trong một số hoạt động flash sale, khuyến mại trên thương mại điện tử, sử dụng hợp lý hàng đợi tin nhắn có thể chống đỡ hiệu quả cú sốc lên hệ thống do lượng lớn đơn hàng tràn vào ngay khi hoạt động khuyến mại bắt đầu. Như hình dưới đây:

![Cắt đỉnh](https://oss.javaguide.cn/github/javaguide/%E5%89%8A%E5%B3%B0-%E6%B6%88%E6%81%AF%E9%98%9F%E5%88%97.png)

### Giảm coupling của hệ thống

Sử dụng hàng đợi tin nhắn còn có thể giảm coupling của hệ thống. Nếu giữa các module không có lời gọi trực tiếp, thì việc thêm module mới hoặc sửa đổi module ít ảnh hưởng đến các module khác hơn, như vậy khả năng mở rộng của hệ thống chắc chắn tốt hơn.

Producer (client) gửi tin nhắn vào hàng đợi tin nhắn, consumer (server) xử lý tin nhắn. Hệ thống cần tiêu thụ chỉ cần lấy tin nhắn từ hàng đợi tin nhắn để tiêu thụ mà không cần coupling với các hệ thống khác, điều này rõ ràng cũng nâng cao khả năng mở rộng của hệ thống.

![Mô hình Publish/Subscribe (Pub/Sub)](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/message-queue-pub-sub-model.png)

**Hàng đợi tin nhắn hoạt động theo mô hình publish-subscribe, người gửi tin nhắn (producer) publish tin nhắn, một hoặc nhiều người nhận tin nhắn (consumer) subscribe tin nhắn.** Từ hình trên có thể thấy **người gửi tin nhắn (producer) và người nhận tin nhắn (consumer) không có coupling trực tiếp**, người gửi tin nhắn gửi tin nhắn đến hàng đợi tin nhắn phân tán là kết thúc việc xử lý tin nhắn, người nhận tin nhắn lấy tin nhắn đó từ hàng đợi tin nhắn phân tán để xử lý tiếp theo, và không cần biết tin nhắn đó đến từ đâu. **Đối với nghiệp vụ mới, chỉ cần quan tâm đến loại tin nhắn đó, là có thể subscribe tin nhắn đó, không có bất kỳ ảnh hưởng nào đến hệ thống và nghiệp vụ ban đầu, từ đó thực hiện thiết kế khả năng mở rộng của nghiệp vụ website**.

Ví dụ, hệ thống thương mại của chúng ta chia thành nhiều dịch vụ như người dùng, đơn hàng, tài chính, kho hàng, thông báo tin nhắn, logistics, kiểm soát rủi ro. Sau khi người dùng hoàn tất đặt hàng, cần gọi đến các dịch vụ tài chính (trừ tiền), kho hàng (quản lý tồn kho), logistics (giao hàng), thông báo tin nhắn (thông báo người dùng giao hàng), kiểm soát rủi ro (đánh giá rủi ro). Sau khi sử dụng hàng đợi tin nhắn, thao tác đặt hàng và các thao tác trừ tiền, giao hàng, thông báo tiếp theo được tách biệt. Đặt hàng xong gửi một tin nhắn vào hàng đợi tin nhắn, nơi nào cần dùng thì subscribe tin nhắn đó để tiêu thụ.

![](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/message-queue-decouple-mall-example.png)

Ngoài ra, để tránh việc mất tin nhắn do máy chủ hàng đợi tin nhắn bị down, tin nhắn đã được gửi thành công vào hàng đợi tin nhắn sẽ được lưu trữ trên máy chủ producer tin nhắn, chờ đến khi tin nhắn thực sự được xử lý bởi máy chủ consumer mới xóa tin nhắn. Sau khi máy chủ hàng đợi tin nhắn bị down, máy chủ producer sẽ chọn các máy chủ khác trong cụm máy chủ hàng đợi tin nhắn phân tán để publish tin nhắn.

**Lưu ý:** Đừng nghĩ rằng hàng đợi tin nhắn chỉ có thể hoạt động theo mô hình publish-subscribe, chỉ là trong môi trường nghiệp vụ tách coupling cụ thể này mới sử dụng mô hình publish-subscribe. Ngoài mô hình publish-subscribe, còn có mô hình point-to-point subscription (một tin nhắn chỉ có một consumer). Chúng ta thường dùng mô hình publish-subscribe hơn. Ngoài ra, hai mô hình tin nhắn này do JMS cung cấp, giao thức AMQP còn cung cấp thêm 5 mô hình tin nhắn khác.

### Thực hiện giao dịch phân tán

Một trong những giải pháp cho giao dịch phân tán là MQ transaction.

RocketMQ, Kafka, Pulsar, QMQ đều cung cấp các chức năng liên quan đến giao dịch. Giao dịch cho phép ứng dụng luồng sự kiện định nghĩa toàn bộ quá trình tiêu thụ, xử lý, tạo tin nhắn là một thao tác nguyên tử.

Bạn có thể xem chi tiết trong bài viết [Giải thích chi tiết giao dịch phân tán (trả phí)](https://javaguide.cn/distributed-system/distributed-transaction.html).

![Giải thích chi tiết giao dịch phân tán - MQ transaction](https://oss.javaguide.cn/github/javaguide/csdn/07b338324a7d8894b8aef4b659b76d92.png)

### Đảm bảo thứ tự

Trong nhiều tình huống ứng dụng, thứ tự xử lý dữ liệu là cực kỳ quan trọng. Hàng đợi tin nhắn đảm bảo dữ liệu được xử lý theo thứ tự cụ thể, phù hợp với các tình huống có yêu cầu nghiêm ngặt về thứ tự dữ liệu. Hầu hết các hàng đợi tin nhắn như RocketMQ, RabbitMQ, Pulsar, Kafka đều hỗ trợ tin nhắn có thứ tự.

### Xử lý trễ/theo lịch

Tin nhắn sau khi gửi sẽ không được tiêu thụ ngay lập tức, mà chỉ định một thời gian, đến thời gian đó mới tiêu thụ. Hầu hết các hàng đợi tin nhắn như RocketMQ, RabbitMQ, Pulsar đều hỗ trợ tin nhắn theo lịch/tin nhắn trễ.

![](https://oss.javaguide.cn/github/javaguide/tools/docker/rocketmq-schedule-message.png)

### Nhắn tin tức thời

MQTT (Message Queuing Telemetry Transport) là một giao thức truyền thông nhẹ, áp dụng mô hình publish/subscribe, rất phù hợp cho các ứng dụng như Internet of Things (IoT) cần hoạt động trong môi trường mạng băng thông thấp, độ trễ cao hoặc không đáng tin cậy. Nó hỗ trợ truyền tin nhắn tức thời, duy trì sự ổn định giao tiếp ngay cả trong điều kiện mạng kém.

RabbitMQ tích hợp sẵn plugin MQTT để thực hiện chức năng MQTT (mặc định không bật, cần bật thủ công).

### Xử lý luồng dữ liệu

Đối với luồng dữ liệu khổng lồ được tạo ra bởi hệ thống phân tán, như log nghiệp vụ, dữ liệu giám sát, hành vi người dùng, v.v., hàng đợi tin nhắn có thể thu thập dữ liệu này theo thời gian thực hoặc theo batch và nhập vào engine xử lý big data, thực hiện quản lý và xử lý luồng dữ liệu hiệu quả.

## Sử dụng hàng đợi tin nhắn sẽ mang lại những vấn đề gì?

- **Khả năng sẵn sàng của hệ thống giảm xuống:** Khả năng sẵn sàng của hệ thống giảm xuống ở một mức độ nào đó, tại sao lại như vậy? Trước khi thêm MQ, bạn không cần lo lắng về việc mất tin nhắn hay MQ bị down, v.v. Nhưng sau khi giới thiệu MQ, bạn cần phải lo về những điều đó!
- **Độ phức tạp của hệ thống tăng lên:** Sau khi thêm MQ, bạn cần đảm bảo tin nhắn không bị tiêu thụ trùng lặp, xử lý tình huống mất tin nhắn, đảm bảo thứ tự truyền tin nhắn, v.v.!
- **Vấn đề nhất quán:** Tôi đã đề cập ở trên rằng hàng đợi tin nhắn có thể thực hiện bất đồng bộ, tính bất đồng bộ mà hàng đợi tin nhắn mang lại thực sự có thể nâng cao tốc độ phản hồi của hệ thống. Nhưng, nếu consumer thực sự của tin nhắn không tiêu thụ tin nhắn đúng cách thì sao? Điều này sẽ dẫn đến tình trạng dữ liệu không nhất quán!

## JMS và AMQP

### JMS là gì?

JMS (JAVA Message Service, dịch vụ tin nhắn Java) là dịch vụ tin nhắn của Java, các client JMS có thể truyền tin nhắn bất đồng bộ với nhau thông qua dịch vụ JMS. **API JMS (JAVA Message Service, dịch vụ tin nhắn Java) là một tiêu chuẩn hoặc đặc tả dịch vụ tin nhắn**, cho phép các thành phần ứng dụng tạo, gửi, nhận và đọc tin nhắn dựa trên nền tảng JavaEE. Nó giúp truyền thông phân tán có coupling thấp hơn, dịch vụ tin nhắn đáng tin cậy hơn và có tính bất đồng bộ.

JMS định nghĩa năm loại định dạng nội dung tin nhắn khác nhau và loại tin nhắn được gọi, cho phép bạn gửi và nhận dữ liệu ở một số dạng khác nhau:

- `StreamMessage: Java` luồng dữ liệu của các giá trị nguyên thủy
- `MapMessage`: một tập hợp các cặp tên-giá trị
- `TextMessage`: một đối tượng chuỗi
- `ObjectMessage`: một đối tượng Java được serialize
- `BytesMessage`: một luồng dữ liệu byte

**ActiveMQ (đã bị loại bỏ) được triển khai dựa trên đặc tả JMS.**

### Hai mô hình tin nhắn của JMS

#### Mô hình Point-to-Point (P2P)

![Mô hình hàng đợi](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/message-queue-queue-model.png)

Sử dụng **Queue (Hàng đợi)** làm phương tiện truyền tin nhắn; thỏa mãn **mô hình producer-consumer**, một tin nhắn chỉ có thể được một consumer sử dụng, tin nhắn chưa được tiêu thụ được giữ trong hàng đợi cho đến khi được tiêu thụ hoặc hết thời gian. Ví dụ: nếu producer gửi 100 tin nhắn, hai consumer đến tiêu thụ thì thông thường hai consumer sẽ mỗi người tiêu thụ một nửa theo thứ tự tin nhắn được gửi (tức là bạn một cái tôi một cái mà tiêu thụ).

#### Mô hình Publish/Subscribe (Pub/Sub)

![Mô hình Publish/Subscribe (Pub/Sub)](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/message-queue-pub-sub-model.png)

Mô hình publish-subscribe (Pub/Sub) sử dụng **Topic (Chủ đề)** làm phương tiện truyền tin nhắn, tương tự như **chế độ broadcast**; publisher publish một tin nhắn, tin nhắn đó được truyền đến tất cả subscriber thông qua chủ đề.

### AMQP là gì?

AMQP, tức là Advanced Message Queuing Protocol, một **giao thức hàng đợi tin nhắn nâng cao** tiêu chuẩn tầng ứng dụng cung cấp dịch vụ tin nhắn thống nhất (giao thức tầng ứng dụng nhị phân), là một tiêu chuẩn mở của giao thức tầng ứng dụng, được thiết kế cho middleware hướng tin nhắn, tương thích với JMS. Client và middleware tin nhắn dựa trên giao thức này có thể truyền tin nhắn, không bị giới hạn bởi điều kiện như client/middleware cùng sản phẩm, ngôn ngữ phát triển khác nhau.

**RabbitMQ được triển khai dựa trên giao thức AMQP.**

### JMS vs AMQP

|    Chiều so sánh     | JMS                                                  | AMQP                                                                                                                                                                                                                                                      |
| :------------------: | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|      Định nghĩa      | Java API                                             | Giao thức                                                                                                                                                                                                                                                 |
|     Đa ngôn ngữ      | Không                                                | Có                                                                                                                                                                                                                                                        |
|     Đa nền tảng      | Không                                                | Có                                                                                                                                                                                                                                                        |
| Loại tin nhắn hỗ trợ | Cung cấp hai mô hình tin nhắn: ①Peer-2-Peer;②Pub/sub | Cung cấp năm mô hình tin nhắn: ①direct exchange; ②fanout exchange; ③topic change; ④headers exchange; ⑤system exchange. Về bản chất, bốn loại sau và mô hình pub/sub của JMS không có nhiều khác biệt, chỉ là phân chia chi tiết hơn về cơ chế định tuyến; |
| Loại tin nhắn hỗ trợ | Hỗ trợ nhiều loại tin nhắn, đã đề cập ở trên         | byte[] (nhị phân)                                                                                                                                                                                                                                         |

**Tổng kết:**

- AMQP định nghĩa giao thức tầng wire (wire-level protocol) cho tin nhắn, trong khi JMS định nghĩa đặc tả API. Trong hệ sinh thái Java, nhiều client đều có thể tương tác thông qua JMS mà không cần sửa đổi code ứng dụng, nhưng hỗ trợ đa nền tảng của nó yếu hơn. Trong khi AMQP vốn có đặc tính đa nền tảng và đa ngôn ngữ.
- JMS hỗ trợ các loại tin nhắn phức tạp như `TextMessage`, `MapMessage`; trong khi AMQP chỉ hỗ trợ loại tin nhắn `byte[]` (các loại phức tạp có thể serialize rồi gửi).
- Do thuật toán định tuyến mà Exchange cung cấp, AMQP có thể cung cấp nhiều phương thức định tuyến đa dạng để truyền tin nhắn đến hàng đợi tin nhắn, trong khi JMS chỉ hỗ trợ hai cách là Queue và Topic/Subscription.

## Sự khác biệt giữa RPC và hàng đợi tin nhắn

RPC và hàng đợi tin nhắn đều là một trong những thành phần quan trọng của hệ thống microservice phân tán, dưới đây hãy so sánh đơn giản hai thứ:

- **Xét về mục đích sử dụng**: RPC chủ yếu được dùng để giải quyết vấn đề giao tiếp từ xa giữa hai dịch vụ, không cần hiểu cơ chế giao tiếp mạng cơ bản. Thông qua RPC có thể giúp chúng ta gọi phương thức của một dịch vụ nào đó trên máy tính từ xa, quá trình này giống như gọi phương thức cục bộ. Hàng đợi tin nhắn chủ yếu được dùng để giảm coupling của hệ thống, thực hiện tác vụ bất đồng bộ, cắt đỉnh lưu lượng hiệu quả.
- **Xét về phương thức giao tiếp**: RPC là giao tiếp mạng trực tiếp hai chiều, hàng đợi tin nhắn là giao tiếp mạng một chiều có giới thiệu phương tiện trung gian.
- **Xét về kiến trúc**: Hàng đợi tin nhắn cần lưu trữ tin nhắn, RPC không có yêu cầu này, vì như đã nói trước đó RPC là giao tiếp mạng trực tiếp hai chiều.
- **Xét về tính kịp thời xử lý yêu cầu**: Các lời gọi được gửi thông qua RPC thường sẽ được xử lý ngay lập tức, tin nhắn được lưu trong hàng đợi tin nhắn không nhất thiết sẽ được xử lý ngay lập tức.

RPC và hàng đợi tin nhắn về bản chất là hai cơ chế triển khai khác nhau của giao tiếp mạng, hai thứ có mục đích sử dụng khác nhau, tuyệt đối không được nhầm lẫn giữa hai thứ.

## Lựa chọn công nghệ hàng đợi tin nhắn phân tán

### Các hàng đợi tin nhắn phổ biến là gì?

#### Kafka

![](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/kafka-logo.png)

Kafka là nền tảng xử lý luồng phân tán được LinkedIn mã nguồn mở, đã trở thành dự án cấp cao của Apache, ban đầu được dùng để xử lý lượng log khổng lồ, sau đó dần dần phát triển thành một hàng đợi tin nhắn hiệu suất cao đầy đủ tính năng.

Nền tảng xử lý luồng có ba chức năng chính:

1. **Hàng đợi tin nhắn**: Publish và subscribe luồng tin nhắn, chức năng này tương tự như hàng đợi tin nhắn, đây cũng là lý do Kafka được xếp vào danh mục hàng đợi tin nhắn.
2. **Lưu trữ bền vững chịu lỗi cho luồng tin nhắn**: Kafka sẽ lưu tin nhắn vào ổ đĩa, tránh hiệu quả rủi ro mất tin nhắn.
3. **Nền tảng xử lý luồng:** Xử lý khi tin nhắn được publish, Kafka cung cấp một thư viện xử lý luồng đầy đủ.

Kafka là một hệ thống phân tán, bao gồm các server và client giao tiếp thông qua giao thức mạng TCP hiệu suất cao, có thể triển khai trên phần cứng bare-metal, máy ảo và container trong môi trường on-premises và cloud.

Trước Kafka 2.8, điều bị chỉ trích nhiều nhất ở Kafka là sự phụ thuộc nặng vào Zookeeper để quản lý metadata và khả năng sẵn sàng cao của cụm. Sau Kafka 2.8, đã giới thiệu chế độ KRaft dựa trên giao thức Raft, không còn phụ thuộc vào Zookeeper nữa, đơn giản hóa đáng kể kiến trúc của Kafka, cho phép bạn sử dụng Kafka theo cách nhẹ nhàng hơn.

Tuy nhiên, cần lưu ý: **Nếu muốn sử dụng chế độ KRaft, khuyến nghị chọn phiên bản Kafka cao hơn, vì tính năng này vẫn đang được tiếp tục hoàn thiện tối ưu. Kafka 3.3.1 là phiên bản đầu tiên đánh dấu giao thức đồng thuận KRaft (Kafka Raft) là sẵn sàng cho production.**

![](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/kafka3.3.1-kraft-production-ready.png)

Trang web chính thức Kafka: <http://kafka.apache.org/>

Lịch sử cập nhật Kafka (có thể thấy trực quan dự án có còn được duy trì không): <https://kafka.apache.org/downloads>

#### RocketMQ

![](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/rocketmq-logo.png)

RocketMQ là nền tảng xử lý dữ liệu thời gian thực "tin nhắn, sự kiện, luồng" cloud-native mã nguồn mở của Alibaba, lấy cảm hứng từ Kafka, đã trở thành dự án cấp cao của Apache.

Các tính năng cốt lõi của RocketMQ (trích từ trang web chính thức RocketMQ):

- Cloud-native: sinh ra trong cloud, lớn lên trong cloud, mở rộng co giãn vô hạn, thân thiện với K8s
- Thông lượng cao: đảm bảo thông lượng hàng nghìn tỷ, đồng thời đáp ứng các tình huống microservice và big data.
- Xử lý luồng: cung cấp engine tính toán luồng nhẹ, khả năng mở rộng cao, hiệu suất cao và chức năng phong phú.
- Cấp độ tài chính: độ ổn định cấp độ tài chính, được sử dụng rộng rãi trong chuỗi giao dịch cốt lõi.
- Kiến trúc cực đơn giản: không có phụ thuộc bên ngoài, kiến trúc Shared-nothing.
- Hệ sinh thái thân thiện: kết nối liền mạch với hệ sinh thái xung quanh như microservice, tính toán thời gian thực, data lake.

Theo giới thiệu từ trang web chính thức:

> Kể từ khi ra đời, Apache RocketMQ đã được nhiều doanh nghiệp và nhà cung cấp cloud áp dụng rộng rãi nhờ các đặc điểm như kiến trúc đơn giản, chức năng nghiệp vụ phong phú, có khả năng mở rộng cực mạnh. Trải qua hơn mười năm được rèn luyện trong các tình huống quy mô lớn, RocketMQ đã trở thành giải pháp tin nhắn nghiệp vụ đáng tin cậy cấp tài chính được đồng thuận trong ngành công nghiệp, được ứng dụng rộng rãi trong các tình huống nghiệp vụ như Internet, big data, di động Internet, IoT.

Trang web chính thức RocketMQ: <https://rocketmq.apache.org/> (tài liệu rất chi tiết, khuyến nghị đọc)

Lịch sử cập nhật RocketMQ (có thể thấy trực quan dự án có còn được duy trì không): <https://github.com/apache/rocketmq/releases>

#### RabbitMQ

![](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/rabbitmq-logo.png)

RabbitMQ là middleware tin nhắn triển khai AMQP (Advanced Message Queuing Protocol, giao thức hàng đợi tin nhắn nâng cao) bằng ngôn ngữ Erlang, ban đầu xuất phát từ hệ thống tài chính, dùng để lưu trữ và chuyển tiếp tin nhắn trong hệ thống phân tán.

RabbitMQ phát triển đến ngày nay được ngày càng nhiều người công nhận, điều này gắn liền với thành tích xuất sắc trong tính dễ sử dụng, khả năng mở rộng, độ tin cậy và khả năng sẵn sàng cao. Các đặc điểm cụ thể của RabbitMQ có thể tóm tắt thành các điểm sau:

- **Độ tin cậy:** RabbitMQ sử dụng một số cơ chế để đảm bảo độ tin cậy của tin nhắn, như persistence, xác nhận truyền tải và xác nhận publish.
- **Định tuyến linh hoạt:** Trước khi tin nhắn vào hàng đợi, định tuyến tin nhắn thông qua exchange. Đối với các chức năng định tuyến thông thường, RabbitMQ đã cung cấp một số exchange tích hợp sẵn để triển khai. Đối với các chức năng định tuyến phức tạp hơn, có thể bind nhiều exchange với nhau, hoặc triển khai exchange của riêng mình thông qua cơ chế plugin. Phần này sẽ được giới thiệu chi tiết khi chúng ta nói về các khái niệm cốt lõi của RabbitMQ.
- **Khả năng mở rộng:** Nhiều node RabbitMQ có thể tạo thành một cụm, cũng có thể mở rộng động các node trong cụm theo tình huống nghiệp vụ thực tế.
- **Khả năng sẵn sàng cao:** Hàng đợi có thể được thiết lập mirror trên các máy trong cụm, đảm bảo hàng đợi vẫn khả dụng trong trường hợp một số node gặp vấn đề.
- **Hỗ trợ nhiều giao thức:** Ngoài hỗ trợ nguyên sinh giao thức AMQP, RabbitMQ còn hỗ trợ nhiều giao thức middleware tin nhắn như STOMP, MQTT.
- **Client đa ngôn ngữ:** RabbitMQ hỗ trợ hầu hết các ngôn ngữ phổ biến, như Java, Python, Ruby, PHP, C#, JavaScript, v.v.
- **Giao diện quản lý dễ sử dụng:** RabbitMQ cung cấp giao diện người dùng dễ sử dụng, cho phép người dùng giám sát và quản lý tin nhắn, các node trong cụm, v.v. Khi cài đặt RabbitMQ sẽ được giới thiệu, cài đặt xong RabbitMQ đã có sẵn giao diện quản lý.
- **Cơ chế plugin:** RabbitMQ cung cấp nhiều plugin để mở rộng từ nhiều phương diện, tất nhiên cũng có thể viết plugin của riêng mình. Cảm giác điều này hơi giống cơ chế SPI của Dubbo.

Trang web chính thức RabbitMQ: <https://www.rabbitmq.com/>.

Lịch sử cập nhật RabbitMQ (có thể thấy trực quan dự án có còn được duy trì không): <https://www.rabbitmq.com/news.html>

#### Pulsar

![](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/pulsar-logo.png)

Pulsar là nền tảng luồng tin nhắn phân tán cloud-native thế hệ tiếp theo, ban đầu được phát triển bởi Yahoo, đã trở thành dự án cấp cao của Apache.

Pulsar tích hợp tin nhắn, lưu trữ, tính toán hàm nhẹ làm một, áp dụng thiết kế kiến trúc tách biệt tính toán và lưu trữ, hỗ trợ multi-tenant, lưu trữ bền vững, sao chép dữ liệu đa vùng đa trung tâm dữ liệu, có đặc tính lưu trữ dữ liệu luồng như nhất quán mạnh, thông lượng cao, độ trễ thấp và khả năng mở rộng cao, được coi là giải pháp tốt nhất cho truyền, lưu trữ và tính toán luồng tin nhắn thời gian thực trong thời đại cloud-native.

Các tính năng chính của Pulsar như sau (trích từ trang web chính thức):

- Là nền tảng luồng tin nhắn phân tán cloud-native thế hệ tiếp theo.
- Một instance đơn của Pulsar hỗ trợ nguyên sinh nhiều cụm, có thể hoàn thành liền mạch việc sao chép tin nhắn giữa các cụm đa trung tâm dữ liệu.
- Độ trễ publish và end-to-end cực thấp.
- Có thể mở rộng liền mạch đến hơn một triệu topic.
- API client đơn giản, hỗ trợ Java, Go, Python và C++.
- Nhiều chế độ subscribe cho topic (exclusive, shared và failover).
- Cơ chế lưu trữ tin nhắn bền vững do Apache BookKeeper cung cấp đảm bảo truyền tin nhắn.
- Xử lý dữ liệu stream-native được thực hiện bởi framework tính toán serverless nhẹ Pulsar Functions.
- Pulsar IO, framework serverless connector dựa trên Pulsar Functions, giúp dữ liệu dễ dàng di chuyển vào và ra Apache Pulsar hơn.
- Lưu trữ phân tầng có thể offload dữ liệu từ hot storage sang cold/long-term storage (như S3, GCS) khi dữ liệu cũ đi.

Trang web chính thức Pulsar: <https://pulsar.apache.org/>

Lịch sử cập nhật Pulsar (có thể thấy trực quan dự án có còn được duy trì không): <https://github.com/apache/pulsar/releases>

#### ActiveMQ

Hiện đã bị loại bỏ, không khuyến nghị sử dụng, không khuyến nghị học.

### Làm thế nào để lựa chọn?

> Tham khảo 《Java工程师面试突击第1季 - thầy 中华石杉》

| Chiều so sánh     | Tóm tắt                                                                                                                                                                                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Thông lượng       | Thông lượng của ActiveMQ và RabbitMQ ở mức chục nghìn (ActiveMQ có hiệu suất kém nhất) thấp hơn một bậc so với RocketMQ và Kafka ở mức hàng trăm nghìn đến triệu.                                                                                                                                   |
| Khả năng sẵn sàng | Đều có thể thực hiện khả năng sẵn sàng cao. ActiveMQ và RabbitMQ đều dựa trên kiến trúc master-slave để thực hiện khả năng sẵn sàng cao. RocketMQ dựa trên kiến trúc phân tán. Kafka cũng là phân tán, một dữ liệu có nhiều bản sao, ít máy bị down không mất dữ liệu, không dẫn đến không khả dụng |
| Tính kịp thời     | RabbitMQ phát triển dựa trên Erlang, nên khả năng đồng thời rất mạnh, hiệu suất cực kỳ tốt, độ trễ rất thấp, đạt cấp độ microsecond, các loại khác đều ở cấp độ ms.                                                                                                                                 |
| Hỗ trợ tính năng  | Pulsar có tính năng đầy đủ hơn, hỗ trợ multi-tenant, nhiều chế độ tiêu thụ và chế độ bền vững, v.v., là nền tảng luồng tin nhắn phân tán cloud-native thế hệ tiếp theo.                                                                                                                             |
| Mất tin nhắn      | Khả năng mất tin nhắn của ActiveMQ và RabbitMQ là rất thấp, Kafka, RocketMQ và Pulsar về lý thuyết có thể đạt 0 mất mát.                                                                                                                                                                            |

**Tổng kết:**

- Cộng đồng của ActiveMQ thuộc loại khá trưởng thành, nhưng so với hiện tại, hiệu suất của ActiveMQ khá kém, và phiên bản lặp đi chậm, không khuyến nghị sử dụng, đã bị loại bỏ.
- RabbitMQ mặc dù thông lượng kém hơn Kafka, RocketMQ và Pulsar một chút, nhưng vì phát triển dựa trên Erlang nên khả năng đồng thời rất mạnh, hiệu suất cực kỳ tốt, độ trễ rất thấp, đạt cấp độ microsecond. Nhưng cũng chính vì RabbitMQ phát triển dựa trên Erlang, nên trong nước ít có công ty có đủ năng lực để nghiên cứu và tùy chỉnh source code cấp độ Erlang. Nếu tình huống nghiệp vụ không có yêu cầu quá cao về lượng đồng thời (hàng trăm nghìn, triệu), thì trong số các hàng đợi tin nhắn này, RabbitMQ có lẽ là lựa chọn hàng đầu của bạn.
- RocketMQ và Pulsar hỗ trợ nhất quán mạnh, có thể sử dụng cho các tình huống có yêu cầu nhất quán tin nhắn cao.
- RocketMQ là sản phẩm của Alibaba, dự án mã nguồn mở hệ Java, source code có thể đọc trực tiếp, sau đó có thể tùy chỉnh MQ của công ty mình, và RocketMQ có kinh nghiệm thực chiến từ tình huống nghiệp vụ thực tế của Alibaba.
- Đặc điểm của Kafka thực sự rất rõ ràng, đó là chỉ cung cấp ít tính năng cốt lõi hơn, nhưng cung cấp thông lượng cực cao, độ trễ cấp ms, khả năng sẵn sàng cực cao và độ tin cậy, và phân tán có thể mở rộng tùy ý. Đồng thời Kafka tốt nhất là hỗ trợ ít topic hơn, đảm bảo thông lượng cực cao của nó. Điểm yếu duy nhất của Kafka là có thể tiêu thụ tin nhắn trùng lặp, điều đó sẽ gây ra ảnh hưởng cực kỳ nhỏ đến độ chính xác dữ liệu. Trong lĩnh vực big data và thu thập log, ảnh hưởng nhỏ này có thể bỏ qua. Đặc tính này phù hợp tự nhiên với tính toán thời gian thực big data và thu thập log. Nếu là các tình huống tính toán thời gian thực, thu thập log trong lĩnh vực big data, dùng Kafka là tiêu chuẩn ngành, hoàn toàn không vấn đề gì, hoạt động cộng đồng rất cao, chắc chắn không biến mất, huống chi gần như là tiêu chuẩn thực tế trên toàn thế giới trong lĩnh vực này.

## Tham khảo

- 《Kiến trúc kỹ thuật website quy mô lớn》
- KRaft: Apache Kafka Without ZooKeeper: <https://developer.confluent.io/learn/kraft/>
- Tình huống sử dụng hàng đợi tin nhắn là gì?: <https://mp.weixin.qq.com/s/4V1jI6RylJr7Jr9JsQe73A>

<!-- @include: @article-footer.snippet.md -->
