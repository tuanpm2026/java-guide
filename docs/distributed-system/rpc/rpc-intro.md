---
title: Tổng hợp kiến thức cơ bản về RPC
category: Distributed
description: Giải thích chi tiết cơ bản về RPC remote procedure call, giải thích nguyên lý cốt lõi RPC, call flow (Client Stub/Server Stub/network transmission), serialization protocol (Protobuf/Hessian/Kryo) và phân tích so sánh các RPC framework phổ biến như Dubbo/gRPC/Thrift.
tag:
  - RPC
head:
  - - meta
    - name: keywords
      content: RPC,remote procedure call,RPC principle,RPC framework,Dubbo,gRPC,serialization,Stub,dynamic proxy,RPC interview questions
---

Bài này giới thiệu ngắn gọn các khái niệm cơ bản liên quan đến RPC.

## RPC là gì?

**RPC (Remote Procedure Call)** — Gọi hàm từ xa. Từ tên gọi đã thấy RPC tập trung vào remote call chứ không phải local call.

**Tại sao cần RPC?** Vì các method do service trên hai server khác nhau cung cấp không nằm trong cùng một memory space, nên cần network programming để truyền tham số cần thiết cho method call. Kết quả của method call cũng cần nhận qua network programming. Nhưng nếu tự tay triển khai network programming cho toàn bộ quá trình gọi này thì workload rất lớn — phải xem xét cả cách truyền tầng dưới (TCP hay UDP), serialization, v.v.

**RPC có thể giúp chúng ta làm gì?** Nói đơn giản, thông qua RPC có thể gọi method của service trên máy tính từ xa — quá trình này đơn giản như gọi local method. Và! Chúng ta không cần hiểu chi tiết cụ thể của low-level network programming.

Ví dụ: Hai service A, B khác nhau deploy trên hai máy khác nhau. Service A muốn gọi một method nào đó trong Service B thì có thể dùng RPC.

Một câu tóm tắt: **RPC ra đời là để việc gọi remote method đơn giản như gọi local method.**

## Nguyên lý của RPC là gì?

Để giúp hiểu nguyên lý RPC, có thể coi chức năng cốt lõi của toàn bộ RPC là do 5 phần sau triển khai:

1. **Client (Service consumer)**: Bên gọi remote method.
2. **Client Stub**: Thực chất là proxy class. Việc proxy class làm rất đơn giản — truyền thông tin về method bạn gọi, class, tham số method, v.v. đến server.
3. **Network transmission**: Network transmission là truyền thông tin về method bạn gọi (như tham số) đến server. Server sau khi thực thi xong trả kết quả về qua network transmission. Cách triển khai network transmission có nhiều loại như Socket cơ bản nhất, hay Netty có hiệu năng và đóng gói tốt hơn (khuyến nghị).
4. **Server Stub**: Đây không phải proxy class. Tốt nhất không nên hiểu là Stub. Server Stub ở đây thực ra là class sau khi nhận request thực thi method từ client, đi thực thi method tương ứng rồi trả kết quả về cho client.
5. **Server (Service provider)**: Bên cung cấp remote method.

Sơ đồ nguyên lý cụ thể như dưới. Sau đây sẽ giải thích toàn bộ quá trình RPC liên tục:

![Sơ đồ nguyên lý RPC](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/37345851.jpg)

1. Service consumer (client) gọi remote service theo cách gọi local.
2. Client Stub sau khi nhận call chịu trách nhiệm đóng gói method, tham số, v.v. thành message body có thể truyền qua network (serialization): `RpcRequest`.
3. Client Stub tìm địa chỉ remote service và gửi message đến service provider.
4. Server Stub nhận message và deserialize message thành Java object: `RpcRequest`.
5. Server Stub gọi local method dựa trên thông tin class, method, tham số method trong `RpcRequest`.
6. Server Stub lấy kết quả thực thi method và đóng gói thành message body có thể truyền qua network: `RpcResponse` (serialization) rồi gửi cho consumer.
7. Client Stub nhận message và deserialize thành Java object: `RpcResponse` — từ đó có được kết quả cuối cùng. Xong!

Tin rằng sau khi đọc giải thích trên, đã hiểu được nguyên lý RPC.

Dù không dài nhưng về cơ bản đã giải thích rõ nguyên lý cốt lõi của RPC framework! Các chi tiết kỹ thuật trên sẽ được giới thiệu trong các chương sau.

**Cuối cùng, về nguyên lý RPC, mong các bạn không chỉ hiểu mà còn có thể tự vẽ ra và giải thích cho người khác nghe. Vì trong phỏng vấn, câu hỏi này gần như chắc chắn gặp khi phỏng vấn viên hỏi về RPC.**

## Có những RPC framework phổ biến nào?

RPC framework ở đây là framework cho phép client gọi trực tiếp method của server, đơn giản như gọi local method — ví dụ Dubbo, Motan, gRPC được giới thiệu dưới đây. Nếu cần làm việc với HTTP protocol, parse và đóng gói HTTP request và response thì loại framework đó không thể gọi là "RPC framework" — ví dụ Feign.

### Dubbo

![](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/image-20220716111053081.png)

Apache Dubbo là microservice framework, cung cấp giải pháp high-performance RPC communication, traffic governance, observability, v.v. cho thực tiễn microservice quy mô lớn, bao gồm SDK triển khai cho nhiều ngôn ngữ như Java, Golang.

Dubbo cung cấp gần như tất cả khả năng service governance từ service definition, service discovery, service communication đến traffic control, hỗ trợ Triple protocol (next-gen RPC communication protocol định nghĩa trên HTTP/2), application-level service discovery, Dubbo Mesh (Dubbo3 giới thiệu nhiều cloud-native friendly features mới), v.v.

![](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/image-20220716111545343.png)

Dubbo được Alibaba open source, sau đó gia nhập Apache. Chính sự xuất hiện của Dubbo đã khiến ngày càng nhiều công ty bắt đầu dùng và chấp nhận distributed architecture.

Dubbo là một trong những open source project trong nước chất lượng cao — source code rất đáng học và đọc!

- GitHub: <https://github.com/apache/incubator-dubbo>
- Website: <https://dubbo.apache.org/zh/>

### Motan

Motan là RPC framework open source của Sina Weibo, nghe nói đang hỗ trợ hàng nghìn tỷ lượt call tại Sina Weibo. Tuy nhiên tôi ít thấy công ty nào dùng, và tài liệu trên mạng cũng khá ít.

Nhiều người thích so sánh Motan với Dubbo vì cả hai đều do công ty lớn trong nước open source. Sau khi tham khảo nhiều tài liệu và xem qua source code, tôi thấy: **Motan giống phiên bản tinh gọn của Dubbo hơn — có lẽ học hỏi tư tưởng của Dubbo, thiết kế Motan đơn giản hơn, chức năng thuần túy hơn.**

Tuy nhiên tôi không khuyến nghị dùng Motan trong dự án thực tế. Nếu công ty bạn dùng thì vẫn khuyến nghị Dubbo — community activity và ecosystem tốt hơn nhiều.

- Nhìn từ Motan về thiết kế RPC framework: <http://kriszhang.com/motan-rpc-impl/>
- Tài liệu tiếng Trung Motan: <https://github.com/weibocom/motan/wiki/zh_overview>

### gRPC

![](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/2843b10d-0c2f-4b7e-9c3e-ea4466792a8b.png)

gRPC là open source RPC framework high-performance, đa năng của Google. Nó được thiết kế chủ yếu hướng đến phát triển mobile application và dựa trên chuẩn HTTP/2 protocol (hỗ trợ bidirectional streaming, message header compression, v.v. — tiết kiệm bandwidth hơn). Xây dựng dựa trên ProtoBuf serialization protocol và hỗ trợ nhiều ngôn ngữ lập trình.

**ProtoBuf là gì?** [ProtoBuf (Protocol Buffer)](https://github.com/protocolbuffers/protobuf) là format data linh hoạt và hiệu quả hơn, có thể dùng cho communication protocol, data storage, v.v. Về cơ bản hỗ trợ tất cả ngôn ngữ lập trình mainstream và cross-platform. Tuy nhiên định nghĩa interface và data type qua ProtoBuf khá rườm rà — đây là một nhược điểm nhỏ.

![](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/image-20220716104304033.png)

Phải nói rằng thiết kế communication layer của gRPC rất xuất sắc. Cải tiến communication layer của [Dubbo-go 3.0](https://dubbogo.github.io/) chủ yếu học hỏi từ gRPC.

Tuy nhiên, thiết kế của gRPC khiến nó hầu như không có khả năng service governance. Nếu muốn giải quyết vấn đề này cần phụ thuộc vào các component khác như PolarisMesh của Tencent.

- GitHub: <https://github.com/grpc/grpc>
- Website: <https://grpc.io/>

### Thrift

Apache Thrift là cross-language RPC communication framework open source của Facebook, hiện đã được trao cho Apache Foundation quản lý. Do đặc tính cross-language và hiệu năng xuất sắc, được nhiều công ty Internet ứng dụng. Các công ty có năng lực thậm chí phát triển thêm một bộ distributed service framework dựa trên Thrift với các chức năng như service registration, service discovery.

`Thrift` hỗ trợ nhiều **ngôn ngữ lập trình** khác nhau như `C++`, `Java`, `Python`, `PHP`, `Ruby`, v.v. (hỗ trợ nhiều ngôn ngữ hơn gRPC).

- Website: <https://thrift.apache.org/>
- Giới thiệu đơn giản về Thrift: <https://www.jianshu.com/p/8f25d057a5a9>

### Tổng kết

Mặc dù gRPC và Thrift hỗ trợ cross-language RPC call, nhưng chúng chỉ cung cấp chức năng RPC framework cơ bản nhất, thiếu hỗ trợ của một loạt component service hóa đi kèm và chức năng service governance.

Dubbo dù xét về mức độ hoàn chỉnh chức năng, ecosystem hay community activity đều là xuất sắc nhất. Hơn nữa Dubbo có nhiều case thành công trong nước như Dangdang, Didi, v.v. — là RPC framework đã được kiểm chứng production chín chắn và ổn định. Quan trọng nhất là bạn có thể tìm rất nhiều tài liệu tham khảo Dubbo, learning curve tương đối thấp.

Hình dưới thể hiện ecosystem của Dubbo.

![](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/eee98ff2-8e06-4628-a42b-d30ffcd2831e.png)

Dubbo cũng là một trong các component của Spring Cloud Alibaba.

![](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/0d195dae-72bc-4956-8451-3eaf6dd11cbd.png)

Nhưng Dubbo và Motan chủ yếu dùng cho ngôn ngữ Java. Dù Dubbo và Motan hiện cũng có thể tương thích một phần ngôn ngữ khác, nhưng không quá khuyến nghị. Nếu cần cross-language call thì có thể cân nhắc dùng gRPC.

Tóm lại, nếu bạn dùng Java backend tech stack và đang phân vân chọn RPC framework nào thì tôi khuyến nghị cân nhắc Dubbo.

## Làm thế nào thiết kế và triển khai một RPC framework?

**《Tự viết RPC Framework》** là một internal booklet nhỏ trên [Knowledge Planet](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html) của tôi. Tôi đã viết 12 bài để giải thích cách từ đầu triển khai một RPC framework đơn giản dựa trên Netty+Kyro+Zookeeper.

Tuy nhỏ nhưng đầy đủ — code có comment chi tiết, cấu trúc rõ ràng, tích hợp Check Style để chuẩn hóa code structure, rất phù hợp để đọc và học.

**Tổng quan nội dung**:

![](https://oss.javaguide.cn/github/javaguide/image-20220308100605485.png)

## Đã có HTTP protocol, tại sao còn cần RPC?

Câu trả lời chi tiết cho câu hỏi này, xem bài: [Đã có HTTP protocol, tại sao còn cần RPC?](http&rpc.md).

<!-- @include: @article-footer.snippet.md -->
