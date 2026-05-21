---
title: Tại sao TCP hướng byte stream, UDP hướng datagram?（Tầng vận chuyển）
description: Làm rõ sự khác biệt bản chất giữa byte stream của TCP và datagram của UDP, phân tích nguyên nhân và giải pháp cho sticky packet/split packet (粘包/拆包), bao gồm các điểm phỏng vấn phổ biến như Nagle, Delayed ACK.
category: Kiến thức cơ bản máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: TCP,UDP,字节流,报文,粘包,拆包,消息边界,Nagle,Delayed ACK,TCP_NODELAY
---

Trước đó đã nói TCP hướng byte stream, UDP hướng datagram. Điểm này trông giống như một định nghĩa, nhưng rất nhiều vấn đề sticky packet, split packet thực ra đều ẩn trong đây.

Kết luận trước: **TCP chỉ đảm bảo byte đến đáng tin cậy và theo thứ tự, không đảm bảo message boundary của tầng ứng dụng; UDP sẽ giữ nguyên message boundary mà tầng ứng dụng đưa cho nó.**

Bài viết này chủ yếu trả lời một số câu hỏi:

1. Tại sao nói TCP hướng byte stream, UDP hướng datagram?
2. TCP sticky packet, split packet thực ra xảy ra như thế nào?
3. Tầng ứng dụng nên định nghĩa message boundary như thế nào?
4. Tại sao Nagle algorithm và Delayed ACK có thể làm chậm các gói tin nhỏ?

Lấy ví dụ, tầng ứng dụng gửi liên tiếp hai message:

```
消息 1：hello
消息 2：world
```

Nếu gửi bằng UDP, thường tương ứng với hai UDP datagram. Khi nhận phía receiver gọi `recvfrom()`, cũng đọc theo từng datagram: mỗi lần đọc một UDP datagram, không gộp hai lần gửi thành một stream. Hàng đợi nhận của UDP, một phần tử là một datagram, message boundary được bảo toàn tự nhiên.

Tuy nhiên ở đây cũng có một chi tiết: UDP bảo toàn message boundary ở tầng transport, không có nghĩa là nó phù hợp để gửi message có kích thước tùy ý. Khi datagram quá lớn, tầng IP phía dưới vẫn có thể phân mảnh; khi buffer nhận quá nhỏ, cũng có thể bị cắt bớt. Vì vậy "hướng datagram" của UDP không có nghĩa là "gửi bao nhiêu cũng không sao", mà là nó không trừu tượng hóa dữ liệu ứng dụng thành một byte stream liên tục như TCP. RFC 768 định nghĩa UDP là datagram mode, và nêu rõ nó cung cấp cơ chế giao thức tối thiểu, không đảm bảo giao hàng đáng tin cậy và không trùng lặp.

Nếu gửi bằng TCP, không thể hiểu như vậy. Tầng ứng dụng gọi `send()` hai lần, chỉ là ghi hai đoạn byte vào buffer gửi của kernel. Còn những byte này khi nào thực sự được gửi đi, gộp thành mấy TCP segment để gửi, mỗi lần `recv()` ở đầu nhận đọc được bao nhiêu, đều không do hai lần `send()` này trực tiếp quyết định.

Ví dụ, bên nhận có thể đọc một lần (sticky packet):

```
helloworld
```

Hoặc đọc thành nhiều lần (split packet):

```
hel
lowor
ld
```

Đây không phải TCP bị lỗi, mà là cách thức hoạt động của TCP vốn dĩ là như vậy. TCP xử lý byte stream liên tục, nó chỉ quan tâm những byte này có đến đáng tin cậy và theo thứ tự không, không quan tâm "message thứ mấy" của tầng ứng dụng bắt đầu từ đâu, kết thúc ở đâu. RFC 9293 cũng nêu rõ, TCP segment và boundary của `send()` / socket write ở tầng ứng dụng thường không tương ứng một-một, TCP không đảm bảo boundary của buffer đọc/ghi ứng dụng liên quan đến boundary phân đoạn mạng.

![Message boundary của TCP và UDP](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-udp-byte-stream-tcp-udp-message-boundary.png)

Vì vậy, cách nói "sticky packet/split packet của TCP" giống một hiện tượng nhìn từ góc độ tầng ứng dụng hơn. Nói chính xác, TCP không có khái niệm "packet", nó truyền byte stream liên tục. Điều thực sự cần giải quyết là: **tầng ứng dụng nên định nghĩa message boundary như thế nào**.

#### Tại sao xuất hiện sticky packet và split packet?

Các nguyên nhân phổ biến như sau.

**1. TCP là giao thức byte stream, không có message boundary của tầng ứng dụng.**

TCP có trách nhiệm đưa byte đến đối phương một cách đáng tin cậy và theo thứ tự, nhưng không ghi lại "20 byte này là message thứ nhất, 30 byte kia là message thứ hai".

**2. Một lần `send()` không bằng một lần gửi mạng.**

`send()` thành công thường chỉ có nghĩa là dữ liệu đã được copy từ process ứng dụng vào buffer gửi của kernel. Còn khi nào thực sự gửi đi, tách thành mấy TCP segment để gửi, còn phụ thuộc vào MSS, send window, congestion window, Nagle algorithm, hàng đợi NIC, v.v.

**3. Một lần `recv()` cũng không bằng đọc được một message hoàn chỉnh.**

Bên nhận chỉ lấy byte từ buffer nhận TCP. Buffer có thể đã tích lũy nhiều message, cũng có thể chỉ có nửa message. `recv()` chỉ copy dữ liệu đang có thể đọc vào cho ứng dụng, không giúp bạn cắt theo message business.

**4. Tối ưu hóa gói nhỏ có thể thay đổi thời điểm gửi.**

Nagle algorithm, Delayed ACK, Linux tự động gộp các ghi nhỏ, v.v., đều có thể ảnh hưởng đến thời điểm gửi dữ liệu nhỏ. Ví dụ từ Linux 3.14 có `tcp_autocorking`, kernel sẽ cố gộp các ghi nhỏ liên tiếp, giảm số lượng gói gửi; ứng dụng cũng có thể dùng `TCP_CORK` để kiểm soát rõ ràng khi nào "mở nút" để gửi.

Đây cũng là lý do tại sao trong Netty, Dubbo, custom RPC, IM gateway, game service, protocol encoding/decoding rất quan trọng. Chỉ cần tầng dưới dùng TCP, thì phải định nghĩa rõ message boundary ở tầng ứng dụng.

![Tại sao sticky packet / split packet của TCP xuất hiện?](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-udp-byte-stream-tcp-sticky-split-causes.png)

#### Làm thế nào để giải quyết sticky packet/split packet của TCP?

Ý tưởng cốt lõi chỉ có một: **để bên nhận biết một message kết thúc ở đâu.**

![Tầng ứng dụng nên định nghĩa message boundary như thế nào?](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-udp-byte-stream-tcp-message-boundary-solutions.png)

Có ba cách phổ biến.

**1. Độ dài cố định**

Quy định mỗi message đều có độ dài cố định, ví dụ 64 byte. Bên nhận cứ đọc đủ 64 byte thì coi là đọc xong một message hoàn chỉnh.

Cách này triển khai đơn giản, nhưng kém linh hoạt. Message ngắn phải padding, lãng phí không gian; message dài lại phải tách thêm. Phù hợp với các tình huống có format message rất cố định, không thích hợp cho protocol business thông dụng.

**2. Delimiter (Ký tự phân cách)**

Thêm ký tự phân cách đặc biệt giữa các message, ví dụ newline `\n`, `\r\n`, hoặc ký tự kết thúc tùy chỉnh.

```
hello\n
world\n
```

Bên nhận liên tục đọc dữ liệu từ buffer, cứ gặp delimiter thì cắt ra một message hoàn chỉnh. Nhiều text protocol sẽ dùng ý tưởng tương tự.

Cách này trực quan, nhưng cần lưu ý hai vấn đề: thứ nhất, delimiter có thể xuất hiện đúng trong nội dung message, lúc đó cần escape; thứ hai, delimiter bản thân cũng có thể bị cắt vào hai lần đọc khác nhau, nên khi parse phía nhận không thể giả định một lần `recv()` đọc được delimiter hoàn chỉnh.

**3. Length header (Header chứa độ dài)**

Đây là cách phổ biến hơn trong engineering. Protocol header cố định chứa một trường độ dài, biểu thị message body phía sau có bao nhiêu byte.

```
| 4 字节长度 | 消息体 |
```

Bên nhận đọc trước protocol header có độ dài cố định, parse ra độ dài message body, rồi tiếp tục đọc số byte được chỉ định. Chưa đọc đủ thì tiếp tục đợi; đọc nhiều hơn thì để lại phần thừa trong buffer, làm phần đầu của message tiếp theo.

Nhiều binary protocol, RPC protocol đều dùng cách này. Khi thiết kế thực tế, protocol header thường không chỉ chứa độ dài, mà còn chứa magic number, version number, message type, sequence number, serialization method, v.v.

Length header cũng có pitfall. Trường độ dài cần thống nhất byte order, thường dùng network byte order; còn phải giới hạn độ dài tối đa của body, tránh đối phương truyền một giá trị độ dài rất lớn làm cạn kiệt bộ nhớ. Khi parse protocol trên production, không thể chỉ nghĩ đến happy path, còn phải xử lý half-packet, độ dài bất thường, kết nối đóng giữa chừng, request được tạo độc hại, v.v.

#### Tại sao Nagle algorithm và Delayed ACK lại làm chậm gói nhỏ?

Khi nói về sticky packet, thường sẽ hỏi thêm về Nagle algorithm.

Mục tiêu của Nagle algorithm là giảm số lượng gói nhỏ. Băng thông mạng thời kỳ đầu hạn chế, nếu ứng dụng mỗi lần chỉ ghi 1 byte, nhưng header TCP/IP đã có mấy chục byte, mạng sẽ đầy "gói nhỏ", hiệu quả rất thấp. RFC 896 thảo luận về loại vấn đề small-packet này, và đề xuất khi trên kết nối còn có dữ liệu chưa được xác nhận, dữ liệu nhỏ mới có thể tạm giữ lại, đợi ACK đến rồi tiếp tục gửi.

Delayed ACK là tối ưu hóa ở bên nhận. Bên nhận sau khi nhận dữ liệu, không nhất thiết gửi ACK ngay lập tức, mà đợi một khoảng thời gian nhỏ, xem có thể gộp ACK với dữ liệu cần trả về để gửi cùng không, giảm số lượng gói ACK thuần túy. RFC 9293 cũng gọi chiến lược "ít hơn một ACK cho mỗi segment dữ liệu" này là delayed ACK.

Hai cơ chế này xem riêng lẻ đều có lý, nhưng kết hợp lại có thể khuếch đại độ trễ. Tình huống điển hình là:

```
客户端 write 小数据 A
客户端马上 write 小数据 B
客户端等待服务端响应
```

![Tại sao Nagle + Delayed ACK có thể làm chậm gói nhỏ?](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-udp-byte-stream-nagle-delayed-ack-latency.png)

Dữ liệu nhỏ A đã được gửi, dữ liệu nhỏ B có thể bị giữ lại trong buffer gửi do Nagle algorithm, đợi ACK của A. Server sau khi nhận A, nếu tạm thời chưa có response business để trả về, Delayed ACK có thể lại trì hoãn gửi ACK. Vì vậy bên gửi đợi ACK, bên nhận đợi thêm dữ liệu hoặc đợi timer delayed ACK, độ trễ bị khuếch đại.

Loại vấn đề này dễ cảm nhận hơn trong short RPC, interactive protocol, game sync, remote terminal.

Hướng giải quyết không phải là "cứ tắt Nagle". Cách ổn định hơn là:

- Các ghi nhỏ có thể gộp, hãy gộp thành một message hoàn chỉnh ở tầng ứng dụng trước, rồi gọi một lần `write()`.
- Trong mô hình request/response, cố tránh nhiều lần `write()` nhỏ liên tiếp rồi lập tức đợi response.
- Với kết nối nhạy cảm về độ trễ và message rất nhỏ, có thể đánh giá bật `TCP_NODELAY`, để dữ liệu nhỏ được gửi nhanh hơn.
- Với tình huống ưu tiên throughput, muốn tích lũy đủ dữ liệu rồi mới gửi, có thể đánh giá dùng `TCP_CORK` trên Linux, nhưng nó không phù hợp với code cross-platform.
- Trước khi điều chỉnh tham số hãy bắt packet để xác nhận, đừng thấy "chậm" là lập tức sửa socket option.

Trong Java, nhiều network framework sẽ expose cấu hình `TCP_NODELAY`, ví dụ `ChannelOption.TCP_NODELAY` của Netty. Nó thực sự có thể giảm thời gian chờ của message nhỏ, nhưng cũng có thể tăng số lượng gói nhỏ. Với service high QPS, trade-off này cần xem xét cùng message size, RTT, throughput, CPU và packet rate của NIC. Linux `tcp(7)` cũng nêu rõ, `TCP_NODELAY` sẽ tắt Nagle algorithm, còn `TCP_CORK` dùng để tránh gửi frame không hoàn chỉnh, đợi ứng dụng xác nhận "có thể gửi rồi" mới gửi.

#### Khi phỏng vấn nên trả lời như thế nào?

Có thể trả lời như sau:

TCP hướng byte stream. Dữ liệu tầng ứng dụng ghi vào sẽ đi vào buffer của kernel, TCP chỉ đảm bảo những byte này đến đối phương đáng tin cậy và theo thứ tự, không đảm bảo một lần `send()` tương ứng một lần `recv()`, cũng không giữ nguyên message boundary của tầng ứng dụng. Do đó bên nhận có thể đọc được nhiều message một lần, cũng có thể chỉ đọc được nửa message, đây là hiện tượng sticky packet, split packet hay nói.

UDP hướng datagram. Một lần dữ liệu tầng ứng dụng đưa cho UDP sẽ được gửi đi như một UDP datagram, bên nhận cũng đọc theo từng datagram, nên message boundary được giữ nguyên tự nhiên. Tuy nhiên UDP không đảm bảo giao hàng đáng tin cậy, cũng không đảm bảo thứ tự.

Giải quyết sticky packet/split packet của TCP, về bản chất là protocol tầng ứng dụng tự định nghĩa message boundary. Các giải pháp phổ biến là độ dài cố định, delimiter, length header. Trong engineering thường dùng length header hơn, vì nó thân thiện hơn với binary protocol và variable-length message, nhưng phải xử lý byte order, giới hạn độ dài tối đa, buffer half-packet và đóng kết nối bất thường, v.v.
