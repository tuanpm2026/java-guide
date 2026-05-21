---
title: Tổng hợp câu hỏi phỏng vấn mạng máy tính thường gặp (Phần 1)
description: Tổng hợp mới nhất các câu hỏi phỏng vấn mạng máy tính tần suất cao (Phần 1)：mô hình bốn tầng TCP/IP, so sánh toàn bộ phiên bản HTTP, bắt tay ba chiều TCP, phân giải DNS, đẩy thời gian thực WebSocket/SSE, v.v., có hình ảnh minh họa + đánh dấu điểm quan trọng ⭐️, một bài tổng kết các điểm kiến thức cốt lõi tầng ứng dụng & truyền tải & mạng, chuẩn bị nhanh cho phỏng vấn backend!
category: Kiến thức cơ bản về máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: 计算机网络面试题,TCP/IP四层模型,HTTP面试,HTTPS vs HTTP,HTTP/1.1 vs HTTP/2,HTTP/3 QUIC,TCP三次握手,UDP区别,DNS解析,WebSocket vs SSE,GET vs POST,应用层协议,网络分层,队头阻塞,PING命令,ARP协议
---

<!-- @include: @small-advertisement.snippet.md -->

Phần trên chủ yếu là nội dung cơ bản về mạng máy tính và tầng ứng dụng.

## Kiến thức cơ bản về mạng máy tính

### Mô hình phân tầng mạng

#### Mô hình OSI 7 tầng là gì? Vai trò của mỗi tầng là gì?

**Mô hình OSI 7 tầng** là mô hình phân tầng mạng do Tổ chức Tiêu chuẩn hóa Quốc tế đề xuất, cấu trúc tổng thể và chức năng của mỗi tầng được thể hiện trong hình dưới đây:

![OSI 七层模型](https://oss.javaguide.cn/github/javaguide/cs-basics/network/osi-7-model.png)

Mỗi tầng tập trung vào một việc, và mỗi tầng cần sử dụng chức năng do tầng dưới cung cấp, ví dụ tầng truyền tải cần sử dụng chức năng định tuyến và địa chỉ do tầng mạng cung cấp, để tầng truyền tải biết truyền dữ liệu đến đâu.

**Cấu trúc hệ thống bảy tầng OSI có khái niệm rõ ràng, lý thuyết cũng rất hoàn chỉnh, nhưng nó khá phức tạp và không thực tế, và một số chức năng xuất hiện lặp lại ở nhiều tầng.**

Hình trên có thể khá trừu tượng, hãy xem thêm một hình ảnh sinh động hơn. Hình dưới đây là một hình tôi thấy trên một trang web nước ngoài, rất tuyệt!

![osi七层模型2](https://oss.javaguide.cn/github/javaguide/osi七层模型2.png)

#### ⭐️Mô hình bốn tầng TCP/IP là gì? Vai trò của mỗi tầng là gì?

**Mô hình bốn tầng TCP/IP** là mô hình được áp dụng rộng rãi hiện nay, chúng ta có thể xem mô hình TCP/IP như phiên bản rút gọn của mô hình OSI 7 tầng, bao gồm 4 tầng sau:

1. Tầng ứng dụng
2. Tầng truyền tải
3. Tầng mạng
4. Tầng giao diện mạng

Cần lưu ý rằng, chúng ta không thể ánh xạ mô hình bốn tầng TCP/IP và mô hình OSI 7 tầng một cách chính xác hoàn toàn, nhưng có thể so sánh đơn giản giữa hai mô hình này như hình dưới đây:

![TCP/IP 四层模型](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-ip-4-model.png)

Để biết thêm chi tiết về vai trò của mỗi tầng, vui lòng xem bài viết [Giải thích chi tiết mô hình phân tầng mạng OSI và TCP/IP (Cơ bản)](https://javaguide.cn/cs-basics/network/osi-and-tcp-ip-model.html) này.

#### Tại sao mạng cần phân tầng?

Nói đến phân tầng, hãy bắt đầu từ việc phát triển một chương trình phía backend thông thường của chúng ta. Chúng ta thường phân hệ thống thành ba tầng theo nguyên tắc mỗi tầng làm những việc khác nhau (các hệ thống phức tạp sẽ có nhiều tầng hơn):

1. Repository (thao tác cơ sở dữ liệu)
2. Service (thao tác nghiệp vụ)
3. Controller (trao đổi dữ liệu front-end và back-end)

**Hệ thống phức tạp cần phân tầng, vì mỗi tầng cần tập trung vào một loại việc. Lý do phân tầng mạng cũng tương tự, mỗi tầng chỉ tập trung vào một loại việc.**

Tốt rồi, hãy quay lại câu hỏi: "Tại sao mạng cần phân tầng?". Tôi nghĩ có 3 lý do chính:

1. **Các tầng độc lập với nhau**: Các tầng độc lập với nhau, các tầng không cần quan tâm đến cách các tầng khác triển khai, chỉ cần biết cách gọi chức năng mà tầng dưới đã cung cấp là được (có thể hiểu đơn giản là gọi interface). **Điều này giống với lý do chúng ta phân tầng hệ thống khi phát triển.**
2. **Tăng tính linh hoạt và khả năng thay thế**: Mỗi tầng có thể sử dụng công nghệ phù hợp nhất để triển khai, chỉ cần đảm bảo rằng chức năng bạn cung cấp và các quy tắc của interface bạn cung cấp không thay đổi. Và mỗi tầng có thể được sửa đổi hoặc thay thế tùy theo nhu cầu mà không ảnh hưởng đến toàn bộ cấu trúc mạng. **Điều này cũng tương ứng với nguyên tắc high cohesion, low coupling yêu cầu trong phát triển hệ thống thông thường.**
3. **Chia vấn đề lớn thành nhỏ**: Phân tầng có thể phân tách vấn đề mạng phức tạp thành nhiều vấn đề nhỏ với ranh giới khá rõ ràng và đơn giản để xử lý và giải quyết. Điều này khiến hệ thống mạng máy tính phức tạp trở nên dễ thiết kế, triển khai và tiêu chuẩn hóa. **Điều này tương ứng với việc chúng ta thường phân tách chức năng hệ thống khi phát triển, và phân tách các vấn đề phức tạp thành các vấn đề nhỏ dễ hiểu hơn, các vấn đề nhỏ này có ranh giới (mục tiêu và interface) được định nghĩa tốt hơn.**

Tôi nghĩ đến một câu nói rất nổi tiếng trong thế giới máy tính, chia sẻ ở đây:

> Bất kỳ vấn đề nào trong lĩnh vực khoa học máy tính đều có thể được giải quyết bằng cách thêm một tầng trung gian gián tiếp, toàn bộ hệ thống máy tính từ trên xuống dưới đều được thiết kế theo cấu trúc phân tầng nghiêm ngặt.

### Các giao thức mạng phổ biến

#### ⭐️Tầng ứng dụng có những giao thức phổ biến nào?

![应用层常见协议](https://oss.javaguide.cn/github/javaguide/cs-basics/network/application-layer-protocol.png)

- **HTTP (Hypertext Transfer Protocol - Giao thức truyền tải siêu văn bản)**: Dựa trên giao thức TCP, là một giao thức dùng để truyền tải nội dung siêu văn bản và đa phương tiện, chủ yếu được thiết kế cho việc giao tiếp giữa trình duyệt Web và máy chủ Web. Khi chúng ta dùng trình duyệt để duyệt web, trang web được tải thông qua yêu cầu HTTP.
- **SMTP (Simple Mail Transfer Protocol - Giao thức truyền tải thư điện tử đơn giản)**: Dựa trên giao thức TCP, là một giao thức dùng để gửi thư điện tử. Lưu ý ⚠️: Giao thức SMTP chỉ chịu trách nhiệm gửi thư, không phải nhận thư. Để nhận thư từ máy chủ thư, cần dùng giao thức POP3 hoặc IMAP.
- **POP3/IMAP (Giao thức nhận thư)**: Dựa trên giao thức TCP, cả hai đều là giao thức chịu trách nhiệm nhận thư. Giao thức IMAP là giao thức mới hơn POP3, nó mạnh mẽ hơn về chức năng và hiệu năng. IMAP hỗ trợ các tính năng nâng cao như tìm kiếm thư, đánh dấu, phân loại, lưu trữ, và có thể đồng bộ trạng thái thư giữa nhiều thiết bị. Hầu hết các email client và máy chủ hiện đại đều hỗ trợ IMAP.
- **FTP (File Transfer Protocol - Giao thức truyền tải tệp)**: Dựa trên giao thức TCP, là một giao thức dùng để truyền tải tệp giữa các máy tính, có thể che giấu hệ điều hành và phương thức lưu trữ tệp. Lưu ý ⚠️: FTP là một giao thức không an toàn vì nó không mã hóa dữ liệu trong quá trình truyền. Nên sử dụng giao thức an toàn hơn như SFTP khi truyền dữ liệu nhạy cảm.
- **Telnet (Giao thức đăng nhập từ xa)**: Dựa trên giao thức TCP, dùng để đăng nhập vào máy chủ khác qua một terminal. Một trong những nhược điểm lớn nhất của giao thức Telnet là tất cả dữ liệu (bao gồm tên người dùng và mật khẩu) đều được gửi dưới dạng văn bản thuần túy, điều này có rủi ro bảo mật tiềm ẩn. Đây là lý do chính khiến ngày nay Telnet ít được sử dụng, thay vào đó là một giao thức truyền tải mạng rất an toàn gọi là SSH.
- **SSH (Secure Shell Protocol - Giao thức truyền tải mạng an toàn)**: Dựa trên giao thức TCP, thực hiện truy cập an toàn và truyền tải tệp thông qua cơ chế mã hóa và xác thực.
- **RTP (Real-time Transport Protocol - Giao thức truyền tải thời gian thực)**: Thường dựa trên giao thức UDP, nhưng cũng hỗ trợ giao thức TCP. Nó cung cấp chức năng truyền tải dữ liệu thời gian thực từ đầu đến đầu, nhưng không bao gồm đặt trước tài nguyên, không đảm bảo chất lượng truyền tải thời gian thực, những chức năng này được triển khai bởi WebRTC.
- **DNS (Domain Name System - Hệ thống tên miền)**: Thường dựa trên giao thức UDP (cổng 53), dùng để giải quyết vấn đề ánh xạ giữa tên miền và địa chỉ IP. Khi dữ liệu phản hồi quá lớn hoặc thực hiện zone transfer sẽ chuyển sang dùng TCP.

Để biết thêm chi tiết về các giao thức này, vui lòng xem bài viết [Tổng hợp các giao thức tầng ứng dụng thường gặp](./application-layer-protocol.md) này.

#### Tầng truyền tải có những giao thức phổ biến nào?

![传输层常见协议](https://oss.javaguide.cn/github/javaguide/cs-basics/network/transport-layer-protocol.png)

- **TCP (Transmission Control Protocol - Giao thức kiểm soát truyền tải)**: Cung cấp dịch vụ truyền tải dữ liệu **hướng kết nối**, **đáng tin cậy**.
- **UDP (User Datagram Protocol - Giao thức datagram người dùng)**: Cung cấp dịch vụ truyền tải dữ liệu **không kết nối**, **cố gắng tốt nhất** (không đảm bảo độ tin cậy truyền tải dữ liệu), đơn giản và hiệu quả.

#### Tầng mạng có những giao thức phổ biến nào?

![网络层常见协议](images/network-model/nerwork-layer-protocol.png)

- **IP (Internet Protocol - Giao thức Internet)**: Một trong những giao thức quan trọng nhất trong bộ giao thức TCP/IP, thuộc giao thức tầng mạng, chức năng chính là định nghĩa định dạng gói dữ liệu, định tuyến và địa chỉ gói dữ liệu để chúng có thể truyền qua mạng và đến đúng đích. Hiện nay có hai loại giao thức IP chính, một là IPv4 cũ, và một là IPv6 mới hơn. Hiện tại cả hai giao thức đều đang được sử dụng, nhưng giao thức sau đã được đề xuất để thay thế giao thức trước.
- **ARP (Address Resolution Protocol - Giao thức phân giải địa chỉ)**: Giao thức ARP giải quyết vấn đề chuyển đổi giữa địa chỉ tầng mạng và địa chỉ tầng liên kết. Vì trong quá trình truyền vật lý của một gói dữ liệu IP, luôn cần biết bước nhảy tiếp theo (đích tiếp theo vật lý) sẽ đi đến đâu, nhưng địa chỉ IP thuộc địa chỉ logic trong khi địa chỉ MAC mới là địa chỉ vật lý. Giao thức ARP giải quyết một số vấn đề về chuyển đổi địa chỉ IP sang địa chỉ MAC.
- **ICMP (Internet Control Message Protocol - Giao thức thông báo kiểm soát Internet)**: Một giao thức dùng để truyền tải trạng thái mạng và thông báo lỗi, thường được dùng để chẩn đoán và khắc phục sự cố mạng. Ví dụ, công cụ Ping sử dụng giao thức ICMP để kiểm tra kết nối mạng.
- **NAT (Network Address Translation - Giao thức dịch địa chỉ mạng)**: Ứng dụng của giao thức NAT giống như tên của nó — dịch địa chỉ mạng, áp dụng trong quá trình chuyển đổi địa chỉ từ mạng nội bộ sang mạng bên ngoài. Cụ thể, trong một mạng con nhỏ (mạng LAN), mỗi host sử dụng địa chỉ IP trong cùng LAN đó, nhưng ngoài LAN đó, trong mạng WAN (Wide Area Network), cần một địa chỉ IP thống nhất để xác định vị trí của LAN đó trên toàn Internet.
- **OSPF (Open Shortest Path First - Giao thức ưu tiên đường ngắn nhất mở)**: Một loại giao thức cổng nội bộ (Interior Gateway Protocol, IGP), cũng là một giao thức định tuyến động được sử dụng rộng rãi, dựa trên thuật toán trạng thái liên kết, xem xét băng thông, độ trễ và các yếu tố khác của liên kết để chọn đường tốt nhất.
- **RIP (Routing Information Protocol - Giao thức thông tin định tuyến)**: Một loại giao thức cổng nội bộ (Interior Gateway Protocol, IGP), cũng là một giao thức định tuyến động, dựa trên thuật toán vector khoảng cách, sử dụng số hop cố định làm thước đo, chọn đường có ít hop nhất làm đường tốt nhất.
- **BGP (Border Gateway Protocol - Giao thức cổng biên giới)**: Một giao thức định tuyến dùng để trao đổi thông tin khả năng tiếp cận tầng mạng (Network Layer Reachability Information, NLRI) giữa các miền lựa chọn định tuyến, có tính linh hoạt và khả năng mở rộng cao.

## HTTP

### ⭐️Từ khi nhập URL đến khi trang hiển thị thì chính xác điều gì đã xảy ra? (Rất quan trọng)

> Câu hỏi tương tự: Khi mở một trang web, toàn bộ quá trình sẽ sử dụng những giao thức nào?

Hãy xem một hình ảnh trước (nguồn từ cuốn sách "Giải thích HTTP bằng hình ảnh"):

<img src="https://oss.javaguide.cn/github/javaguide/url%E8%BE%93%E5%85%A5%E5%88%B0%E5%B1%95%E7%A4%BA%E5%87%BA%E6%9D%A5%E7%9A%84%E8%BF%87%E7%A8%8B.jpg" style="zoom:50%" />

Hình trên có một lỗi cần lưu ý: là OSPF không phải OPSF. OSPF (Open Shortest Path First, ospf) - Giao thức ưu tiên đường ngắn nhất mở, là giao thức chọn định tuyến do Lực lượng đặc nhiệm kỹ thuật Internet phát triển.

Tổng thể chia thành các bước sau:

1. Nhập URL của trang web cụ thể vào trình duyệt.
2. Trình duyệt thông qua giao thức DNS để lấy địa chỉ IP tương ứng với tên miền.
3. Trình duyệt dựa trên địa chỉ IP và số cổng, gửi yêu cầu kết nối TCP đến máy chủ đích.
4. Trình duyệt trên kết nối TCP, gửi một bản tin yêu cầu HTTP đến máy chủ, yêu cầu lấy nội dung trang web.
5. Máy chủ nhận bản tin yêu cầu HTTP, xử lý yêu cầu và trả về bản tin phản hồi HTTP cho trình duyệt.
6. Trình duyệt nhận bản tin phản hồi HTTP, phân tích mã HTML trong body phản hồi, kết xuất cấu trúc và kiểu dáng của trang web, đồng thời dựa trên URL của các tài nguyên khác trong HTML (như hình ảnh, CSS, JS, v.v.), gửi lại yêu cầu HTTP để lấy nội dung của các tài nguyên đó, cho đến khi trang web được tải và hiển thị hoàn toàn.
7. Trình duyệt khi không cần giao tiếp với máy chủ nữa, có thể chủ động đóng kết nối TCP, hoặc chờ yêu cầu đóng kết nối từ phía máy chủ.

Để biết thêm chi tiết, có thể xem bài viết này: [Toàn bộ quá trình truy cập một trang web (Kết nối kiến thức)](https://javaguide.cn/cs-basics/network/the-whole-process-of-accessing-web-pages.html) (Rất đáng đọc).

### ⭐️HTTP có những mã trạng thái nào?

Mã trạng thái HTTP được dùng để mô tả kết quả của yêu cầu HTTP, ví dụ 2xx đại diện cho yêu cầu được xử lý thành công.

![常见 HTTP 状态码](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http-status-code.png)

Để biết tổng hợp chi tiết hơn về mã trạng thái HTTP, có thể xem bài viết tôi đã viết: [Tổng hợp các mã trạng thái HTTP thường gặp (Tầng ứng dụng)](https://javaguide.cn/cs-basics/network/http-status-codes.html).

### Các trường phổ biến trong HTTP Header là gì?

| Tên trường yêu cầu  | Mô tả                                                                                                                                                                                                                                                     | Ví dụ                                                                            |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| Accept              | Loại nội dung phản hồi (Content-Types) có thể chấp nhận.                                                                                                                                                                                                  | Accept: text/plain                                                               |
| Accept-Charset      | Bộ ký tự có thể chấp nhận                                                                                                                                                                                                                                 | Accept-Charset: utf-8                                                            |
| Accept-Datetime     | Phiên bản được biểu diễn theo thời gian có thể chấp nhận                                                                                                                                                                                                  | Accept-Datetime: Thu, 31 May 2007 20:35:00 GMT                                   |
| Accept-Encoding     | Danh sách phương thức mã hóa có thể chấp nhận. Tham khảo nén HTTP.                                                                                                                                                                                        | Accept-Encoding: gzip, deflate                                                   |
| Accept-Language     | Danh sách ngôn ngữ tự nhiên của nội dung phản hồi có thể chấp nhận.                                                                                                                                                                                       | Accept-Language: en-US                                                           |
| Authorization       | Thông tin xác thực cho xác thực giao thức truyền tải siêu văn bản                                                                                                                                                                                         | Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==                                |
| Cache-Control       | Dùng để chỉ định các chỉ thị mà tất cả các cơ chế bộ nhớ đệm trong chuỗi yêu cầu/phản hồi này đều phải tuân theo                                                                                                                                          | Cache-Control: no-cache                                                          |
| Connection          | Loại kết nối mà trình duyệt muốn ưu tiên sử dụng                                                                                                                                                                                                          | Connection: keep-alive                                                           |
| Content-Length      | Độ dài của body yêu cầu được biểu thị bằng mảng byte tám bit (byte 8 bit)                                                                                                                                                                                 | Content-Length: 348                                                              |
| Content-MD5         | Giá trị MD5 nhị phân của nội dung body yêu cầu, được mã hóa bằng Base64                                                                                                                                                                                   | Content-MD5: Q2hlY2sgSW50ZWdyaXR5IQ==                                            |
| Content-Type        | Loại đa phương tiện của body yêu cầu (dùng trong yêu cầu POST và PUT)                                                                                                                                                                                     | Content-Type: application/x-www-form-urlencoded                                  |
| Cookie              | HTTP Cookie đã được máy chủ gửi trước đó thông qua Set-Cookie                                                                                                                                                                                             | Cookie: $Version=1; Skin=new;                                                    |
| Date                | Ngày và giờ gửi tin nhắn này (theo định dạng "ngày HTTP" được định nghĩa trong RFC 7231)                                                                                                                                                                  | Date: Tue, 15 Nov 1994 08:12:31 GMT                                              |
| Expect              | Cho biết client yêu cầu máy chủ thực hiện hành vi cụ thể                                                                                                                                                                                                  | Expect: 100-continue                                                             |
| From                | Địa chỉ email của người dùng khởi tạo yêu cầu này                                                                                                                                                                                                         | From: `user@example.com`                                                         |
| Host                | Tên miền của máy chủ (cho virtual host), và số cổng TCP mà máy chủ đang nghe. Số cổng có thể bị bỏ qua nếu cổng được yêu cầu là cổng tiêu chuẩn của dịch vụ tương ứng.                                                                                    | Host: en.wikipedia.org                                                           |
| If-Match            | Chỉ thực hiện thao tác tương ứng khi entity do client cung cấp khớp với entity tương ứng trên máy chủ. Chủ yếu dùng trong các phương thức như PUT, chỉ cập nhật tài nguyên khi tài nguyên đó chưa bị sửa đổi kể từ lần cập nhật cuối cùng của người dùng. | If-Match: "737060cd8c284d8af7ad3082f209582d"                                     |
| If-Modified-Since   | Cho phép máy chủ trả về mã trạng thái `304 Not Modified` nếu tài nguyên được yêu cầu không bị sửa đổi kể từ ngày được chỉ định                                                                                                                            | If-Modified-Since: Sat, 29 Oct 1994 19:43:31 GMT                                 |
| If-None-Match       | Cho phép máy chủ trả về mã trạng thái `304 Not Modified` nếu ETag của tài nguyên được yêu cầu không thay đổi                                                                                                                                              | If-None-Match: "737060cd8c284d8af7ad3082f209582d"                                |
| If-Range            | Nếu entity chưa bị sửa đổi, hãy gửi cho tôi một hoặc nhiều phần tôi còn thiếu; nếu không, hãy gửi toàn bộ entity mới                                                                                                                                      | If-Range: "737060cd8c284d8af7ad3082f209582d"                                     |
| If-Unmodified-Since | Chỉ gửi phản hồi nếu entity chưa bị sửa đổi kể từ một thời điểm cụ thể.                                                                                                                                                                                   | If-Unmodified-Since: Sat, 29 Oct 1994 19:43:31 GMT                               |
| Max-Forwards        | Giới hạn số lần tin nhắn này có thể được proxy và gateway chuyển tiếp.                                                                                                                                                                                    | Max-Forwards: 10                                                                 |
| Origin              | Khởi tạo yêu cầu CORS.                                                                                                                                                                                                                                    | `Origin: http://www.example-social-network.com`                                  |
| Pragma              | Liên quan đến các triển khai cụ thể, các trường này có thể tạo ra nhiều hiệu ứng ở bất kỳ đâu trong chuỗi yêu cầu/phản hồi.                                                                                                                               | Pragma: no-cache                                                                 |
| Proxy-Authorization | Thông tin xác thực để xác thực với proxy.                                                                                                                                                                                                                 | Proxy-Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==                          |
| Range               | Chỉ yêu cầu một phần của entity. Độ lệch byte bắt đầu từ 0. Tham khảo dịch vụ byte.                                                                                                                                                                       | Range: bytes=500-999                                                             |
| Referer             | Biểu thị trang trước mà trình duyệt đã truy cập, chính là trang đó có một liên kết đã đưa trình duyệt đến trang đang được yêu cầu.                                                                                                                        | `Referer: http://en.wikipedia.org/wiki/Main_Page`                                |
| TE                  | Kiểu mã hóa truyền tải mà trình duyệt dự kiến nhận được: có thể sử dụng các giá trị trong trường header phản hồi Transfer-Encoding;                                                                                                                       | TE: trailers, deflate                                                            |
| Upgrade             | Yêu cầu máy chủ nâng cấp lên giao thức khác.                                                                                                                                                                                                              | Upgrade: HTTP/2.0, SHTTP/1.3, IRC/6.9, RTA/x11                                   |
| User-Agent          | Chuỗi định danh trình duyệt của trình duyệt                                                                                                                                                                                                               | User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/21.0 |
| Via                 | Thông báo cho máy chủ biết, yêu cầu này được gửi bởi những proxy nào.                                                                                                                                                                                     | Via: 1.0 fred, 1.1 example.com (Apache/1.1)                                      |
| Warning             | Một cảnh báo chung, thông báo rằng có thể có lỗi trong body nội dung entity.                                                                                                                                                                              | Warning: 199 Miscellaneous warning                                               |

### ⭐️HTTP và HTTPS có gì khác nhau? (Quan trọng)

![HTTP 和 HTTPS 对比](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http-vs-https.png)

- **Số cổng**: HTTP mặc định là 80, HTTPS mặc định là 443.
- **Tiền tố URL**: Tiền tố URL của HTTP là `http://`, tiền tố URL của HTTPS là `https://`.
- **Bảo mật và tiêu thụ tài nguyên**: Giao thức HTTP chạy trên TCP, tất cả nội dung truyền đều là văn bản thuần túy, client và máy chủ đều không thể xác minh danh tính của nhau. HTTPS là giao thức HTTP chạy trên SSL/TLS, SSL/TLS chạy trên TCP. Tất cả nội dung truyền đều được mã hóa, mã hóa sử dụng mã hóa đối xứng, nhưng khóa mã hóa đối xứng được mã hóa bất đối xứng bằng chứng chỉ phía máy chủ. Vì vậy, bảo mật của HTTP không bằng HTTPS, nhưng HTTPS tiêu tốn nhiều tài nguyên máy chủ hơn HTTP.
- **SEO (Tối ưu hóa công cụ tìm kiếm)**: Các công cụ tìm kiếm thường ưu tiên các trang web sử dụng giao thức HTTPS hơn vì HTTPS có thể cung cấp bảo mật và bảo vệ quyền riêng tư người dùng cao hơn. Các trang web sử dụng giao thức HTTPS có thể được hiển thị ưu tiên trong kết quả tìm kiếm, từ đó ảnh hưởng đến SEO.

Để biết so sánh chi tiết hơn về HTTP và HTTPS, có thể xem bài viết tôi đã viết: [HTTP vs HTTPS (Tầng ứng dụng)](https://javaguide.cn/cs-basics/network/http-vs-https.html).

### HTTP/1.0 và HTTP/1.1 có gì khác nhau?

![HTTP/1.0 和 HTTP/1.1 对比](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http1.0-vs-http1.1.png)

- **Phương thức kết nối**: HTTP/1.0 là kết nối ngắn, HTTP/1.1 hỗ trợ kết nối dài. Kết nối dài và ngắn của giao thức HTTP thực chất là kết nối dài và ngắn của giao thức TCP.
- **Mã phản hồi trạng thái**: HTTP/1.1 đã thêm vào số lượng lớn mã trạng thái, riêng mã trạng thái phản hồi lỗi đã thêm 24 loại. Ví dụ như `100 (Continue)` — yêu cầu khởi động trước khi yêu cầu tài nguyên lớn, `206 (Partial Content)` — mã định danh cho yêu cầu phạm vi, `409 (Conflict)` — yêu cầu xung đột với quy định tài nguyên hiện tại, `410 (Gone)` — tài nguyên đã được chuyển vĩnh viễn và không có địa chỉ chuyển tiếp nào đã biết.
- **Cơ chế bộ nhớ đệm**: Trong HTTP/1.0 chủ yếu dùng If-Modified-Since, Expires trong Header làm tiêu chuẩn phán xét bộ nhớ đệm, HTTP/1.1 giới thiệu nhiều chiến lược kiểm soát bộ nhớ đệm hơn như Entity tag, If-Unmodified-Since, If-Match, If-None-Match và nhiều header bộ nhớ đệm có thể lựa chọn hơn để kiểm soát chiến lược bộ nhớ đệm.
- **Băng thông**: Trong HTTP/1.0, có một số hiện tượng lãng phí băng thông, ví dụ client chỉ cần một phần của đối tượng, nhưng máy chủ lại gửi toàn bộ đối tượng, và không hỗ trợ chức năng tiếp tục từ điểm dừng. HTTP/1.1 giới thiệu trường range trong header yêu cầu, cho phép chỉ yêu cầu một phần của tài nguyên, tức là mã trả về là 206 (Partial Content), điều này tạo thuận lợi cho các nhà phát triển tự do lựa chọn để tận dụng đầy đủ băng thông và kết nối.
- **Xử lý Host Header**: HTTP/1.1 giới thiệu trường Host header, cho phép lưu trữ nhiều tên miền trên cùng một địa chỉ IP, từ đó hỗ trợ chức năng virtual host. Còn HTTP/1.0 không có trường Host header, không thể thực hiện virtual host.

Để biết so sánh chi tiết hơn về HTTP/1.0 và HTTP/1.1, có thể xem bài viết tôi đã viết: [HTTP/1.0 vs HTTP/1.1 (Tầng ứng dụng)](https://javaguide.cn/cs-basics/network/http1.0-vs-http1.1.html).

### ⭐️HTTP/1.1 và HTTP/2.0 có gì khác nhau?

![HTTP/1.0 和 HTTP/1.1 对比](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http1.1-vs-http2.0.png)

- **Ghép kênh (Multiplexing)**: HTTP/2.0 có thể truyền đồng thời nhiều yêu cầu và phản hồi trên cùng một kết nối (có thể xem như phiên bản nâng cấp của kết nối dài trong HTTP/1.1), không ảnh hưởng lẫn nhau. HTTP/1.1 sử dụng phương thức nối tiếp, mỗi yêu cầu và phản hồi cần kết nối độc lập, và trình duyệt để kiểm soát tài nguyên sẽ có giới hạn 6-8 kết nối TCP. Điều này làm cho HTTP/2.0 hiệu quả hơn khi xử lý nhiều yêu cầu, giảm độ trễ mạng và cải thiện hiệu năng.
- **Binary Frames (Khung nhị phân)**: HTTP/2.0 sử dụng khung nhị phân để truyền dữ liệu, trong khi HTTP/1.1 sử dụng bản tin định dạng văn bản. Khung nhị phân gọn gàng và hiệu quả hơn, giảm lượng dữ liệu truyền và tiêu thụ băng thông.
- **Tắc nghẽn đầu hàng (Head-of-Line Blocking)**: HTTP/2 giới thiệu công nghệ ghép kênh, cho phép nhiều yêu cầu và phản hồi truyền đan xen song song trên một kết nối TCP duy nhất, giải quyết vấn đề tắc nghẽn đầu hàng ở tầng ứng dụng của HTTP/1.1, nhưng HTTP/2 vẫn chịu ảnh hưởng của **tắc nghẽn đầu hàng ở tầng TCP**.
- **Nén Header (Header Compression)**: HTTP/1.1 hỗ trợ nén `Body`, `Header` không hỗ trợ nén. HTTP/2.0 hỗ trợ nén `Header`, sử dụng thuật toán HPACK được thiết kế đặc biệt cho nén `Header`, giảm tải mạng.
- **Server Push (Đẩy từ máy chủ)**: HTTP/2.0 hỗ trợ server push, có thể đẩy các tài nguyên liên quan khác cho client khi client yêu cầu một tài nguyên, từ đó giảm số lần yêu cầu và độ trễ của client. Còn HTTP/1.1 cần client tự gửi yêu cầu để lấy các tài nguyên liên quan.

Hiệu ứng ghép kênh HTTP/2.0 (nguồn ảnh: [HTTP/2 For Web Developers](https://blog.cloudflare.com/http-2-for-web-developers/)):

![HTTP/2 Multiplexing](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http2.0-multiplexing.png)

Có thể thấy, cơ chế ghép kênh của HTTP/2 cho phép nhiều yêu cầu và phản hồi chia sẻ một kết nối TCP, từ đó tránh tình trạng HTTP/1.1 phải thiết lập nhiều kết nối song song khi xử lý yêu cầu đồng thời, giảm tải phụ thêm từ việc thiết lập và duy trì kết nối lặp lại. Còn trong HTTP/1.1, mặc dù hỗ trợ kết nối bền vững, nhưng để giảm thiểu vấn đề tắc nghẽn đầu hàng, trình duyệt thường thiết lập nhiều kết nối song song cho cùng một tên miền.

### HTTP/2.0 và HTTP/3.0 có gì khác nhau?

![HTTP/2.0 和 HTTP/3.0 对比](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http2.0-vs-http3.0.png)

- **Giao thức truyền tải**: HTTP/2.0 được triển khai dựa trên giao thức TCP, HTTP/3.0 thêm giao thức QUIC (Quick UDP Internet Connections) để thực hiện truyền tải đáng tin cậy, cung cấp bảo mật tương đương TLS/SSL với độ trễ kết nối và truyền tải thấp hơn. Có thể xem QUIC như phiên bản nâng cấp của UDP, thêm nhiều chức năng như mã hóa, truyền lại, v.v. HTTP/3.0 trước đây có tên là HTTP-over-QUIC, từ cái tên này chúng ta cũng có thể thấy, đột phá lớn nhất của HTTP/3 là sử dụng QUIC.
- **Thiết lập kết nối**: HTTP/2.0 cần trải qua quy trình bắt tay ba chiều TCP cổ điển (do thiết lập kết nối HTTPS an toàn cũng cần bắt tay TLS, cần khoảng 3 RTT). Do đặc tính của giao thức QUIC (TLS 1.3, TLS 1.3 ngoài hỗ trợ bắt tay 1 RTT còn hỗ trợ bắt tay 0 RTT), thiết lập kết nối chỉ cần 0-RTT hoặc 1-RTT. Điều này có nghĩa là QUIC trong trường hợp tốt nhất không cần bất kỳ vòng đi về thêm nào để thiết lập kết nối mới.
- **Nén Header**: HTTP/2.0 sử dụng thuật toán HPACK để nén header, còn HTTP/3.0 sử dụng thuật toán nén header QPACK hiệu quả hơn.
- **Tắc nghẽn đầu hàng**: HTTP/2.0 ghép nhiều yêu cầu vào một kết nối TCP, một khi xảy ra mất gói, sẽ chặn tất cả các yêu cầu HTTP. Do đặc tính của giao thức QUIC, HTTP/3.0 ở một mức độ nhất định giải quyết được vấn đề tắc nghẽn đầu hàng (Head-of-Line blocking, viết tắt: HOL blocking), một kết nối thiết lập nhiều luồng dữ liệu khác nhau, các luồng dữ liệu này độc lập với nhau, khi một luồng dữ liệu xảy ra mất gói, các luồng dữ liệu của nó không bị ảnh hưởng (về bản chất là ghép kênh + round-robin).
- **Chuyển tiếp kết nối**: HTTP/3.0 hỗ trợ chuyển tiếp kết nối, vì QUIC sử dụng ID 64 bit để định danh kết nối, chỉ cần ID không thay đổi sẽ không bị gián đoạn, khi môi trường mạng thay đổi (ví dụ từ Wi-Fi chuyển sang dữ liệu di động) cũng có thể duy trì kết nối. Còn kết nối TCP được cấu thành từ (IP nguồn, cổng nguồn, IP đích, cổng đích), chỉ cần một trong bộ tứ này thay đổi, kết nối đó sẽ không thể dùng được nữa.
- **Phục hồi lỗi**: HTTP/3.0 có cơ chế phục hồi lỗi tốt hơn, khi gặp các sự cố mạng như mất gói, độ trễ, có thể phục hồi và truyền lại nhanh hơn. Còn HTTP/2.0 cần dựa vào cơ chế phục hồi lỗi của TCP.
- **Bảo mật**: Trong HTTP/2.0, TLS được dùng để mã hóa và xác thực toàn bộ phiên HTTP, bao gồm tất cả header HTTP và tải trọng dữ liệu. Công việc của TLS là ở trên tầng TCP, nó mã hóa dữ liệu tầng ứng dụng được truyền trong kết nối TCP và không mã hóa header TCP cũng như header tầng bản ghi TLS, vì vậy trong quá trình truyền, header TCP có thể bị kẻ tấn công giả mạo để gây nhiễu giao tiếp. Còn HTTP/3.0's QUIC thực hiện mã hóa và xác thực cho toàn bộ gói dữ liệu (bao gồm cả header bản tin và body bản tin), đảm bảo an toàn.

So sánh ngăn xếp giao thức HTTP/1.0, HTTP/2.0 và HTTP/3.0:

![http-3-implementation](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http-3-implementation.png)

Dưới đây là hình so sánh chi tiết hơn về HTTP/2.0 và HTTP/3.0:

![HTTP/2.0 和 HTTP/3.0 详细对比图](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http2-and-http3-stacks-comparison.png)

Từ hình trên có thể thấy:

- **HTTP/2.0**: Sử dụng TCP làm giao thức truyền tải, dùng HPACK để nén header, phụ thuộc vào TLS để mã hóa.
- **HTTP/3.0**: Sử dụng giao thức QUIC dựa trên UDP, dùng QPACK hiệu quả hơn để nén header, tích hợp trực tiếp TLS trong QUIC. Giao thức QUIC có các đặc tính chuyển tiếp kết nối, kiểm soát tắc nghẽn và tránh tắc nghẽn, kiểm soát luồng.

Để biết thêm giới thiệu chi tiết về quá trình phát triển từ HTTP/1.0 đến HTTP/3.0, đề nghị đọc [Tối ưu hóa kỹ thuật từ HTTP/1 đến HTTP/3](https://dbwu.tech/posts/http_evolution/).

### Sự khác biệt về tắc nghẽn đầu hàng giữa HTTP/1.1 và HTTP/2.0 là gì?

Nguyên nhân chính của tắc nghẽn đầu hàng HTTP/1.1 là không thể ghép kênh:

- Trong một kết nối TCP, yêu cầu và phản hồi tài nguyên được xử lý theo thứ tự. Nếu một tài nguyên lớn (như một file lớn) đang được truyền, các tài nguyên nhỏ tiếp theo (như file CSS nhỏ hơn) cần đợi tài nguyên trước đó hoàn thành truyền mới có thể được gửi.
- Nếu trình duyệt cần tải đồng thời nhiều tài nguyên (như nhiều file CSS, JS, v.v.), thường sẽ mở nhiều kết nối TCP song song (thường giới hạn 6 kết nối). Nhưng mỗi kết nối vẫn bị giới hạn bởi cơ chế yêu cầu-phản hồi tuần tự, vì vậy vẫn xảy ra **tắc nghẽn đầu hàng ở tầng ứng dụng**.

Mặc dù HTTP/2.0 giới thiệu công nghệ ghép kênh, cho phép nhiều yêu cầu và phản hồi truyền đan xen song song trên một kết nối TCP duy nhất, giải quyết **vấn đề tắc nghẽn đầu hàng ở tầng ứng dụng của HTTP/1.1**, nhưng HTTP/2.0 vẫn chịu ảnh hưởng của **tắc nghẽn đầu hàng ở tầng TCP**:

- HTTP/2.0 thông qua cơ chế frame chia mỗi tài nguyên thành các phần nhỏ và phân bổ stream ID duy nhất cho mỗi tài nguyên, để dữ liệu của nhiều tài nguyên có thể truyền đan xen trong cùng một kết nối TCP.
- TCP với tư cách là giao thức tầng truyền tải yêu cầu giao dữ liệu theo thứ tự. Nếu một gói dữ liệu bị mất trong quá trình truyền, ngay cả khi các gói dữ liệu tiếp theo đã đến, vẫn phải đợi gói dữ liệu bị mất được truyền lại mới có thể tiếp tục xử lý. Tính thứ tự của tầng truyền tải này dẫn đến **tắc nghẽn đầu hàng ở tầng TCP**.
- Ví dụ, nếu một gói dữ liệu TCP của HTTP/2 mang dữ liệu của nhiều tài nguyên (ví dụ JS và CSS), và gói dữ liệu đó bị mất, thì tất cả dữ liệu tài nguyên trong các gói dữ liệu tiếp theo đều cần đợi gói dữ liệu bị mất được truyền lại, dẫn đến tất cả các stream đều bị chặn.

Cuối cùng, hãy tổng kết bằng một bảng:

| **Khía cạnh**              | **Tắc nghẽn đầu hàng HTTP/1.1**                                   | **Tắc nghẽn đầu hàng HTTP/2.0**                                                                 |
| -------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Tầng**                   | Tầng ứng dụng (hạn chế của giao thức HTTP)                        | Tầng truyền tải (hạn chế của giao thức TCP)                                                     |
| **Nguyên nhân gốc rễ**     | Không thể ghép kênh, yêu cầu và phản hồi phải truyền theo thứ tự  | TCP yêu cầu giao gói dữ liệu theo thứ tự, mất gói chặn toàn bộ kết nối                          |
| **Phạm vi ảnh hưởng**      | Một yêu cầu/phản hồi HTTP sẽ chặn các yêu cầu/phản hồi tiếp theo. | Mất một gói TCP sẽ ảnh hưởng tất cả stream HTTP/2.0 (phụ thuộc vào cùng một kết nối TCP cơ bản) |
| **Phương pháp giảm thiểu** | Mở nhiều kết nối TCP song song                                    | Giảm mất gói mạng hoặc dùng giao thức QUIC dựa trên UDP                                         |
| **Tình huống ảnh hưởng**   | Xảy ra mỗi lần, đặc biệt khi file lớn chặn file nhỏ.              | Dễ xảy ra hơn trong môi trường mạng có tỷ lệ mất gói cao.                                       |

### ⭐️HTTP là giao thức không lưu trạng thái, làm sao để lưu trạng thái người dùng?

Bản thân giao thức HTTP là **không có trạng thái (stateless)**. Điều này có nghĩa là máy chủ theo mặc định không thể phân biệt hai yêu cầu liên tiếp có đến từ cùng một người dùng không, hay cùng một người dùng đã thực hiện thao tác gì trước đó. Điều này giống như một người phục vụ "hay quên", mỗi lần bạn nói chuyện với anh ta, anh ta đều không biết bạn là ai, cũng không biết bạn đã gọi món gì trước đó.

Nhưng trong ứng dụng Web thực tế, như mua hàng trực tuyến, đăng nhập người dùng, v.v., rõ ràng chúng ta cần nhớ trạng thái của người dùng (ví dụ như mặt hàng trong giỏ hàng, thông tin đăng nhập của người dùng). Để giải quyết vấn đề này, có một số cơ chế phổ biến sau:

**Phương án 1: Session (Phiên) kết hợp Cookie (Phương thức phổ biến):**

![](https://oss.javaguide.cn/github/javaguide/system-design/security/session-cookie-authentication-process.png)

Đây có thể nói là phương pháp cổ điển và thường dùng nhất. Quy trình cơ bản như sau:

1. Người dùng gửi tên người dùng, mật khẩu, mã xác minh lên máy chủ để đăng nhập hệ thống.
2. Sau khi máy chủ xác minh thành công, sẽ tạo cho người dùng này một đối tượng Session chuyên dụng (có thể hiểu là một vùng bộ nhớ trên máy chủ, lưu trữ dữ liệu trạng thái của người dùng đó như giỏ hàng, thông tin đăng nhập, v.v.) và lưu trữ lại, đồng thời phân bổ cho Session này một `SessionID` duy nhất.
3. Máy chủ gửi `SessionID` này cho trình duyệt của người dùng thông qua chỉ thị `Set-Cookie` trong header phản hồi HTTP.
4. Trình duyệt nhận được `SessionID`, sẽ lưu nó dưới dạng Cookie ở local. Khi người dùng duy trì trạng thái đăng nhập, mỗi lần gửi yêu cầu đến máy chủ đó, trình duyệt sẽ tự động đính kèm Cookie chứa `SessionID` này.
5. Máy chủ nhận yêu cầu, lấy `SessionID` từ Cookie, có thể tìm thấy đối tượng Session đã lưu trước đó, từ đó biết đây là người dùng nào và trạng thái trước đó của họ.

Khi sử dụng Session, cần lưu ý một số điểm sau:

- **Hỗ trợ Cookie phía client**: Chức năng cốt lõi phụ thuộc vào Session cần đảm bảo trình duyệt người dùng đã bật Cookie.
- **Quản lý hết hạn Session**: Đặt thời gian hết hạn Session hợp lý, cân bằng giữa bảo mật và trải nghiệm người dùng.
- **Bảo mật Session ID**: Đặt cờ `HttpOnly` cho Cookie chứa `SessionID` có thể ngăn script phía client (như JavaScript) đánh cắp, đặt cờ Secure có thể đảm bảo `SessionID` chỉ được truyền qua kết nối HTTPS, tăng cường bảo mật.

Dữ liệu Session bản thân được lưu trữ ở phía máy chủ. Các phương thức lưu trữ phổ biến bao gồm:

- **Bộ nhớ máy chủ**: Triển khai đơn giản, tốc độ truy cập nhanh, nhưng dữ liệu sẽ mất khi máy chủ khởi động lại, và không có lợi cho cân bằng tải giữa nhiều máy chủ. Phương thức này phù hợp với các tình huống nghiệp vụ đơn giản có lượng người dùng không lớn.
- **Cơ sở dữ liệu (như MySQL, PostgreSQL)**: Dữ liệu được lưu trữ bền vững, nhưng hiệu năng đọc ghi tương đối thấp, thường không dùng cách này.
- **Bộ nhớ đệm phân tán (như Redis)**: Hiệu năng cao, hỗ trợ triển khai phân tán, là giải pháp rất phổ biến trong các ứng dụng quy mô lớn hiện nay.

**Phương án 2: Khi Cookie bị tắt: URL Rewriting (Viết lại URL)**

Nếu trình duyệt người dùng đã tắt Cookie, hoặc trong một số trường hợp không tiện dùng Cookie, còn có một phương án dự phòng là viết lại URL. Phương thức này sẽ gắn `SessionID` trực tiếp vào cuối URL, được truyền như một tham số. Ví dụ: <http://www.example.com/page?sessionid=xxxxxx>. Phía máy chủ sẽ phân tích tham số `sessionid` trong URL để lấy `SessionID`, từ đó tìm dữ liệu Session tương ứng.

Phương pháp này thường không được dùng, có các nhược điểm sau:

- URL sẽ dài hơn và không đẹp;
- `SessionID` bị lộ trong URL, bảo mật thấp hơn (dễ bị sao chép, chia sẻ hoặc ghi vào log);
- Có thể không thân thiện với SEO (Tối ưu hóa công cụ tìm kiếm).

**Phương án 3: Xác thực dựa trên Token (như JWT - JSON Web Tokens)**

Đây là một phương thức xác thực không trạng thái ngày càng phổ biến, đặc biệt phù hợp cho kiến trúc tách biệt front-end và back-end và microservices.

![ JWT 身份验证示意图](https://oss.javaguide.cn/github/javaguide/system-design/jwt/jwt-authentication%20process.png)

Lấy JWT làm ví dụ (phương án Token thông thường cũng được), các bước đơn giản hóa như sau:

1. Người dùng gửi tên người dùng, mật khẩu và mã xác minh lên máy chủ để đăng nhập hệ thống;
2. Nếu tên người dùng, mật khẩu và mã xác minh của người dùng đều đúng, phía máy chủ sẽ trả về Token đã được ký, tức là JWT;
3. Client nhận Token và tự lưu trữ (ví dụ `localStorage` của trình duyệt);
4. Mỗi khi người dùng gửi yêu cầu đến backend sẽ đính kèm JWT này trong Header;
5. Phía máy chủ kiểm tra JWT và lấy thông tin liên quan đến người dùng từ đó.

Để biết giới thiệu chi tiết về JWT, có thể xem hai bài viết này:

- [Giải thích chi tiết các khái niệm cơ bản về JWT](https://javaguide.cn/system-design/security/jwt-intro.html)
- [Phân tích ưu nhược điểm của xác thực JWT](https://javaguide.cn/system-design/security/advantages-and-disadvantages-of-jwt.html)

Tóm lại, mặc dù HTTP bản thân không có trạng thái, nhưng thông qua các cơ chế như Cookie + Session, viết lại URL hoặc Token, chúng ta có thể theo dõi và quản lý trạng thái người dùng hiệu quả trong ứng dụng Web. Trong đó, **Cookie + Session là phương thức truyền thống và được sử dụng rộng rãi nhất, trong khi xác thực dựa trên Token ngày càng được ưa chuộng trong các ứng dụng Web hiện đại.**

### Sự khác biệt giữa URI và URL là gì?

- URI (Uniform Resource Identifier) là định danh tài nguyên thống nhất, có thể xác định duy nhất một tài nguyên.
- URL (Uniform Resource Locator) là định vị tài nguyên thống nhất, có thể cung cấp đường dẫn của tài nguyên đó. Đây là một loại URI cụ thể, tức là URL có thể dùng để định danh một tài nguyên, và còn chỉ ra cách locate tài nguyên đó.

Vai trò của URI giống như số chứng minh nhân dân, vai trò của URL giống như địa chỉ nhà hơn. URL là một loại URI cụ thể, nó không chỉ xác định duy nhất tài nguyên mà còn cung cấp thông tin để định vị tài nguyên đó.

### Cookie và Session có gì khác nhau?

Nói chính xác hơn, câu hỏi này thuộc phạm vi xác thực và ủy quyền, bạn có thể tìm thấy câu trả lời chi tiết trong bài viết [Giải thích chi tiết các khái niệm cơ bản về xác thực và ủy quyền](https://javaguide.cn/system-design/security/basis-of-authority-certification.html) này.

### ⭐️Sự khác biệt giữa GET và POST

Câu hỏi này được thảo luận khá sôi nổi trên Zhihu, địa chỉ: <https://www.zhihu.com/question/28586791>.

GET và POST là hai phương thức yêu cầu thường dùng trong giao thức HTTP, chúng có các đặc điểm và cách dùng khác nhau trong các tình huống và mục đích khác nhau. Nhìn chung, có thể phân biệt hai loại này từ các khía cạnh sau (trọng tâm là hiểu sự khác biệt về ngữ nghĩa giữa hai loại):

- Ngữ nghĩa (Sự khác biệt chính): GET thường dùng để lấy hoặc truy vấn tài nguyên, còn POST thường dùng để tạo hoặc sửa đổi tài nguyên.
- Idempotent (Bất biến): Yêu cầu GET là idempotent, tức là thực thi nhiều lần sẽ không thay đổi trạng thái tài nguyên, còn yêu cầu POST không phải idempotent, tức là mỗi lần thực thi có thể tạo ra kết quả khác nhau hoặc ảnh hưởng đến trạng thái tài nguyên.
- Định dạng: Tham số của yêu cầu GET thường được đặt trong URL, tạo thành chuỗi truy vấn (querystring), còn tham số của yêu cầu POST thường được đặt trong body yêu cầu, có thể có nhiều định dạng mã hóa như application/x-www-form-urlencoded, multipart/form-data, application/json, v.v. Độ dài URL của yêu cầu GET bị giới hạn bởi trình duyệt và máy chủ, còn kích thước body của yêu cầu POST không có giới hạn rõ ràng. Tuy nhiên, thực tế yêu cầu GET cũng có thể dùng body để truyền dữ liệu, chỉ là không được khuyến nghị làm vậy, vì điều này có thể gây ra một số vấn đề về tính tương thích hoặc ngữ nghĩa.
- Bộ nhớ đệm: Vì yêu cầu GET là idempotent, nó có thể được trình duyệt hoặc các nút trung gian khác (như proxy, gateway) lưu vào bộ nhớ đệm để cải thiện hiệu năng và hiệu quả. Còn yêu cầu POST không phù hợp để lưu vào bộ nhớ đệm, vì nó có thể có tác dụng phụ, mỗi lần thực thi có thể cần phản hồi thời gian thực.
- Bảo mật: Yêu cầu GET và yêu cầu POST nếu dùng giao thức HTTP đều không an toàn, vì bản thân giao thức HTTP là truyền văn bản thuần túy, phải dùng giao thức HTTPS để mã hóa truyền dữ liệu. Ngoài ra, yêu cầu GET so với yêu cầu POST dễ rò rỉ dữ liệu nhạy cảm hơn, vì tham số của yêu cầu GET thường được đặt trong URL.

Nhắc lại, trọng tâm là hiểu sự khác biệt về ngữ nghĩa giữa hai loại, trong quá trình sử dụng thực tế, cũng dựa trên ngữ nghĩa để phân biệt dùng GET hay POST. Tuy nhiên, cũng có một số dự án dùng POST cho tất cả các yêu cầu, điều này không cố định, nhóm dự án đồng thuận là được.

## WebSocket

### WebSocket là gì?

WebSocket là một giao thức giao tiếp song công đầy đủ dựa trên kết nối TCP, tức là client và máy chủ có thể đồng thời gửi và nhận dữ liệu.

Giao thức WebSocket ra đời năm 2008, trở thành tiêu chuẩn quốc tế năm 2011, hầu hết các trình duyệt phiên bản mới hơn chính thống đều hỗ trợ giao thức này. Tuy nhiên, WebSocket không chỉ có thể được dùng trong các ứng dụng dựa trên trình duyệt, nhiều ngôn ngữ lập trình, framework và máy chủ cũng cung cấp hỗ trợ WebSocket.

Bản chất của giao thức WebSocket là giao thức ở tầng ứng dụng, dùng để bù đắp sự thiếu sót của giao thức HTTP về khả năng giao tiếp bền vững. Client và máy chủ chỉ cần bắt tay một lần, giữa hai bên có thể tạo kết nối bền vững ngay lập tức, và thực hiện truyền dữ liệu hai chiều.

![Websocket 示意图](https://oss.javaguide.cn/github/javaguide/system-design/web-real-time-message-push/1460000042192394.png)

Dưới đây là các tình huống ứng dụng phổ biến của WebSocket:

- Barrage video
- Đẩy tin nhắn thời gian thực, xem chi tiết bài viết [Giải thích chi tiết đẩy tin nhắn thời gian thực trên Web](https://javaguide.cn/system-design/web-real-time-message-push.html)
- Game thời gian thực nhiều người chơi
- Chỉnh sửa cộng tác nhiều người dùng
- Chat mạng xã hội
- ……

### ⭐️WebSocket và HTTP có gì khác nhau?

WebSocket và HTTP đều là giao thức tầng ứng dụng dựa trên TCP, đều có thể truyền dữ liệu trong mạng.

Dưới đây là những điểm khác biệt chính giữa hai loại:

- WebSocket là giao thức giao tiếp thời gian thực hai chiều, trong khi HTTP là giao thức giao tiếp một chiều. Và trong giao tiếp giao thức HTTP chỉ có client mới có thể khởi tạo, máy chủ không thể chủ động thông báo cho client.
- WebSocket sử dụng ws:// hoặc wss:// (giao thức sau khi mã hóa bằng SSL/TLS, tương tự như mối quan hệ giữa HTTP và HTTPS) làm tiền tố giao thức, HTTP sử dụng http:// hoặc https:// làm tiền tố giao thức.
- WebSocket có thể hỗ trợ mở rộng, người dùng có thể mở rộng giao thức, triển khai một số giao thức con tùy chỉnh một phần như hỗ trợ nén, mã hóa, v.v.
- Định dạng dữ liệu giao tiếp WebSocket khá nhẹ, phần đầu gói kiểm soát giao thức tương đối nhỏ, tải mạng nhỏ, còn mỗi giao tiếp HTTP đều phải mang header đầy đủ, tải mạng lớn hơn (HTTP/2.0 sử dụng khung nhị phân để truyền dữ liệu, hỗ trợ nén header, giảm tải mạng).

### Quy trình làm việc của WebSocket là gì?

Quy trình làm việc của WebSocket có thể chia thành các bước sau:

1. Client gửi một yêu cầu HTTP đến máy chủ, header yêu cầu chứa các trường như `Upgrade: websocket` và `Sec-WebSocket-Key`, biểu thị yêu cầu nâng cấp giao thức lên WebSocket;
2. Máy chủ nhận yêu cầu này, sẽ thực hiện thao tác nâng cấp giao thức, nếu hỗ trợ WebSocket, sẽ phản hồi mã trạng thái HTTP 101, header phản hồi chứa `Connection: Upgrade` và `Sec-WebSocket-Accept: xxx`, v.v., biểu thị đã nâng cấp thành công sang giao thức WebSocket.
3. Kết nối WebSocket được thiết lập giữa client và máy chủ, có thể truyền dữ liệu hai chiều. Dữ liệu được truyền dưới dạng frames (khung), mỗi tin nhắn WebSocket có thể bị cắt thành nhiều khung dữ liệu (đơn vị nhỏ nhất). Bên gửi sẽ cắt tin nhắn thành nhiều khung gửi cho bên nhận, bên nhận nhận các khung tin nhắn và lắp ráp lại các khung liên quan thành tin nhắn đầy đủ.
4. Client hoặc máy chủ có thể chủ động gửi một khung đóng, biểu thị muốn ngắt kết nối. Sau khi bên kia nhận được, cũng sẽ phản hồi một khung đóng, sau đó hai bên đóng kết nối TCP.

Ngoài ra, sau khi thiết lập kết nối WebSocket, thông qua cơ chế heartbeat để duy trì sự ổn định và hoạt động của kết nối WebSocket.

### ⭐️Sự khác biệt giữa WebSocket và short polling, long polling

Ba phương thức này đều nhằm giải quyết vấn đề "**làm thế nào để client kịp thời lấy dữ liệu mới nhất từ máy chủ, thực hiện cập nhật thời gian thực**". Phương thức triển khai và hiệu quả, sự khác biệt về tính thời gian thực của chúng khá lớn.

**1. Short Polling (Thăm dò ngắn)**

- **Nguyên lý**: Client cứ mỗi một khoảng thời gian cố định (như 5 giây) sẽ gửi một yêu cầu HTTP, hỏi máy chủ có dữ liệu mới không. Máy chủ nhận yêu cầu sẽ phản hồi ngay lập tức.
- **Ưu điểm**: Triển khai đơn giản, khả năng tương thích tốt, dùng yêu cầu HTTP thông thường là được.
- **Nhược điểm**:
  - **Tính thời gian thực trung bình**: Tin nhắn có thể đến trong khoảng thời gian giữa hai lần thăm dò, người dùng cần đợi đến lần yêu cầu tiếp theo mới biết.
  - **Lãng phí tài nguyên lớn**: Liên tục thiết lập/đóng kết nối, và hầu hết các yêu cầu nhận được đều là "không có tin nhắn mới", làm tăng đáng kể áp lực máy chủ và mạng.

**2. Long Polling (Thăm dò dài)**

- **Nguyên lý**: Client gửi yêu cầu, nếu máy chủ tạm thời không có dữ liệu mới, sẽ giữ kết nối, cho đến khi có dữ liệu mới hoặc hết thời gian mới phản hồi. Sau khi client nhận phản hồi sẽ ngay lập tức gửi yêu cầu tiếp theo, thực hiện "giả thời gian thực".
- **Ưu điểm**:
  - **Tính thời gian thực tốt hơn**: Một khi có dữ liệu mới có thể đẩy ngay, không cần đợi yêu cầu định kỳ tiếp theo.
  - **Giảm phản hồi trống**: Giảm phản hồi rỗng không hiệu quả, cải thiện hiệu quả.
- **Nhược điểm**:
  - **Chiếm nhiều tài nguyên máy chủ**: Cần duy trì lâu dài nhiều kết nối, tiêu tốn luồng/số kết nối máy chủ.
  - **Lãng phí tài nguyên lớn**: Vẫn cần thiết lập lại kết nối sau mỗi phản hồi, và vẫn dựa trên cơ chế yêu cầu-phản hồi một chiều HTTP.

**3. WebSocket**

- **Nguyên lý**: Client và máy chủ sau khi bắt tay HTTP Upgrade một lần, thiết lập một kết nối TCP bền vững. Sau đó, hai bên có thể bất cứ lúc nào, chủ động gửi dữ liệu, thực hiện giao tiếp song công đầy đủ, độ trễ thấp thực sự.
- **Ưu điểm**:
  - **Tính thời gian thực mạnh**: Dữ liệu có thể gửi nhận hai chiều ngay lập tức, độ trễ cực thấp.
  - **Hiệu quả tài nguyên cao**: Kết nối duy trì liên tục, không cần thiết lập/đóng lại liên tục, giảm tiêu thụ tài nguyên.
  - **Chức năng mạnh**: Hỗ trợ máy chủ chủ động đẩy tin nhắn, client chủ động khởi tạo giao tiếp.
- **Nhược điểm**:
  - **Giới hạn sử dụng**: Cần cả máy chủ và client đều hỗ trợ giao thức WebSocket. Có một số yêu cầu nhất định về quản lý kết nối (như heartbeat keepalive, tự động kết nối lại khi mất kết nối, v.v.).
  - **Triển khai phức tạp hơn**: Triển khai phức tạp hơn so với short polling và long polling.

![Websocket 示意图](https://oss.javaguide.cn/github/javaguide/system-design/web-real-time-message-push/1460000042192394.png)

### ⭐️SSE và WebSocket có gì khác nhau?

SSE (Server-Sent Events) và WebSocket đều là công nghệ để máy chủ đẩy tin nhắn thời gian thực đến trình duyệt, giúp nội dung trang web có thể tự động cập nhật mà không cần người dùng làm mới trang theo cách thủ công. Mặc dù mục tiêu tương tự, nhưng chúng có một số điểm khác biệt quan trọng về cách thức hoạt động và tình huống áp dụng:

1. **Phương thức giao tiếp:**
   - **SSE:** **Giao tiếp một chiều**. Chỉ có máy chủ có thể gửi dữ liệu đến client (trình duyệt). Client không thể gửi dữ liệu đến máy chủ thông qua cùng một kết nối (cần gửi yêu cầu HTTP mới).
   - **WebSocket:** **Giao tiếp hai chiều (song công đầy đủ)**. Client và máy chủ có thể gửi tin nhắn cho nhau bất cứ lúc nào, thực hiện tương tác thời gian thực thực sự.
2. **Giao thức tầng dưới:**
   - **SSE:** Dựa trên **giao thức HTTP/HTTPS tiêu chuẩn**. Về bản chất đây là một yêu cầu HTTP "kết nối dài", máy chủ duy trì kết nối mở và liên tục gửi luồng sự kiện. Không cần hỗ trợ máy chủ hoặc giao thức đặc biệt, cơ sở hạ tầng HTTP hiện có là đủ.
   - **WebSocket:** Sử dụng **giao thức ws:// hoặc wss:// độc lập**. Cần thiết lập kết nối thông qua yêu cầu HTTP "Upgrade" cụ thể, và máy chủ cần hỗ trợ giao thức WebSocket rõ ràng để xử lý kết nối và khung tin nhắn.
3. **Độ phức tạp và chi phí triển khai:**
   - **SSE:** **Triển khai tương đối đơn giản**, chủ yếu xử lý ở phía máy chủ. Phía trình duyệt có EventSource API tiêu chuẩn, tiện dùng. Chi phí phát triển và bảo trì thấp hơn.
   - **WebSocket:** **Phức tạp hơn một chút**. Cần phía máy chủ xử lý đặc biệt kết nối WebSocket và giao thức, phía client cũng cần dùng WebSocket API. Nếu cần xem xét tính tương thích, heartbeat, kết nối lại, v.v., chi phí phát triển sẽ cao hơn.
4. **Kết nối lại khi mất kết nối:**
   - **SSE:** **Trình duyệt hỗ trợ native**. EventSource API cung cấp cơ chế tự động kết nối lại khi mất kết nối.
   - **WebSocket:** **Cần triển khai thủ công**. Nhà phát triển cần tự viết logic để phát hiện mất kết nối và thực hiện thử kết nối lại.
5. **Loại dữ liệu:**
   - **SSE:** **Chủ yếu được thiết kế để truyền văn bản** (mã hóa UTF-8). Nếu cần truyền dữ liệu nhị phân, cần mã hóa trước thành văn bản như Base64, v.v.
   - **WebSocket:** **Hỗ trợ native truyền dữ liệu văn bản và nhị phân**, không cần mã hóa thêm.

Để cung cấp trải nghiệm người dùng tốt hơn và tận dụng tính đơn giản, hiệu quả, dựa trên HTTP tiêu chuẩn của nó, **Server-Sent Events (SSE) là lựa chọn công nghệ phổ biến thậm chí có thể nói là tiêu chuẩn hiện nay của API mô hình ngôn ngữ lớn (như OpenAI, DeepSeek, v.v.) để triển khai phản hồi streaming**.

Lấy DeepSeek làm ví dụ, hãy gửi một yêu cầu và mở console trình duyệt để xác minh:

![DeepSeek 响应标头](https://oss.javaguide.cn/github/javaguide/cs-basics/network/deepseek-sse.png)

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/deepseek-sse-eventstream.png)

Có thể thấy, header phản hồi chứa `text/event-stream`, xác nhận rằng SSE đang được sử dụng. Và dữ liệu phản hồi đúng là được truyền theo từng đoạn liên tục.

## PING

### Tác dụng của lệnh PING là gì?

Lệnh PING là một công cụ chẩn đoán mạng thường dùng, thường được dùng để kiểm tra kết nối và độ trễ mạng giữa các host trong mạng.

Đây là một ví dụ đơn giản, chúng ta PING Baidu.

```bash
# 发送4个PING请求数据包到 www.baidu.com
❯ ping -c 4 www.baidu.com

PING www.a.shifen.com (14.119.104.189): 56 data bytes
64 bytes from 14.119.104.189: icmp_seq=0 ttl=54 time=27.867 ms
64 bytes from 14.119.104.189: icmp_seq=1 ttl=54 time=28.732 ms
64 bytes from 14.119.104.189: icmp_seq=2 ttl=54 time=27.571 ms
64 bytes from 14.119.104.189: icmp_seq=3 ttl=54 time=27.581 ms

--- www.a.shifen.com ping statistics ---
4 packets transmitted, 4 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 27.571/27.938/28.732/0.474 ms
```

Kết quả đầu ra của lệnh PING thường bao gồm các phần thông tin sau:

1. **Thông tin ICMP Echo Request (Bản tin yêu cầu)**: Số thứ tự, giá trị TTL (Time to Live).
2. **Tên miền hoặc địa chỉ IP của host đích**: Dòng đầu tiên của kết quả đầu ra.
3. **Thời gian khứ hồi (RTT, Round-Trip Time)**: Tổng thời gian từ khi gửi ICMP Echo Request (bản tin yêu cầu) đến khi nhận ICMP Echo Reply (bản tin phản hồi), dùng để đo lường độ trễ kết nối mạng.
4. **Kết quả thống kê (Statistics)**: Bao gồm số lượng gói dữ liệu ICMP yêu cầu được gửi, số lượng gói dữ liệu phản hồi ICMP được nhận, tỷ lệ mất gói, giá trị nhỏ nhất, trung bình, lớn nhất và độ lệch chuẩn của thời gian khứ hồi (RTT).

Nếu PING đến host đích tương ứng không nhận được phản hồi đúng, điều đó cho thấy kết nối giữa hai host này có vấn đề (một số host hoặc quản trị viên mạng có thể đã tắt tính năng phản hồi yêu cầu ICMP, điều này cũng có thể dẫn đến không nhận được phản hồi đúng). Nếu thời gian khứ hồi (RTT) quá cao, cho thấy độ trễ mạng quá cao.

### Nguyên lý hoạt động của lệnh PING là gì?

PING dựa trên **ICMP (Internet Control Message Protocol - Giao thức thông báo kiểm soát Internet)** ở tầng mạng, nguyên lý chính là thực hiện thông qua việc gửi và nhận bản tin ICMP trên mạng.

Bản tin ICMP chứa trường kiểu, dùng để xác định loại bản tin ICMP. Có nhiều loại bản tin ICMP, nhưng đại thể có thể chia thành hai loại:

- **Loại bản tin truy vấn**: Gửi yêu cầu đến host đích và mong đợi nhận được phản hồi.
- **Loại bản tin lỗi**: Gửi thông tin lỗi đến host nguồn, dùng để báo cáo các tình huống lỗi trong mạng.

ICMP Echo Request (kiểu 8) và ICMP Echo Reply (kiểu 0) được PING sử dụng thuộc loại bản tin truy vấn.

- Lệnh PING sẽ gửi ICMP Echo Request đến host đích.
- Nếu kết nối giữa hai host bình thường, host đích sẽ trả về một ICMP Echo Reply tương ứng.

## DNS

### Tác dụng của DNS là gì?

DNS (Domain Name System - Hệ thống tên miền) là giao thức quan trọng đầu tiên được dùng sau khi người dùng dùng trình duyệt truy cập địa chỉ web. DNS cần giải quyết **vấn đề ánh xạ giữa tên miền và địa chỉ IP**.

![DNS:域名系统](https://oss.javaguide.cn/github/javaguide/cs-basics/network/dns-overview.png)

Trên một máy tính, có thể tồn tại bộ nhớ đệm DNS của trình duyệt, bộ nhớ đệm DNS của hệ điều hành, bộ nhớ đệm DNS của router. Nếu tất cả các bộ nhớ đệm trên đều không tìm thấy, thì DNS sẽ được sử dụng.

Hiện nay thiết kế của DNS sử dụng cấu trúc cơ sở dữ liệu phân tán, phân cấp, **DNS là giao thức tầng ứng dụng, có thể chạy trên giao thức UDP hoặc TCP, cổng 53**.

### DNS có những máy chủ nào? Root server có bao nhiêu cái?

Máy chủ DNS từ dưới lên trên có thể được phân chia thành các cấp độ sau (tất cả máy chủ DNS đều thuộc một trong bốn loại sau):

- Root DNS server. Root DNS server cung cấp địa chỉ IP của máy chủ TLD. Hiện tại trên thế giới chỉ có 13 nhóm root server, trong lãnh thổ Trung Quốc hiện vẫn chưa có root server.
- Máy chủ DNS tên miền cấp cao nhất (máy chủ TLD). Tên miền cấp cao nhất là hậu tố của tên miền, như `com`, `org`, `net`, `edu`, v.v. Các quốc gia cũng có tên miền cấp cao nhất riêng, như `uk`, `fr`, `ca`. Máy chủ TLD cung cấp địa chỉ IP của máy chủ DNS có thẩm quyền.
- Máy chủ DNS có thẩm quyền. Mỗi tổ chức có host có thể truy cập công khai trên Internet phải cung cấp bản ghi DNS có thể truy cập công khai, những bản ghi này ánh xạ tên của các host đó thành địa chỉ IP.
- Máy chủ DNS cục bộ. Mỗi ISP (nhà cung cấp dịch vụ Internet) đều có máy chủ DNS cục bộ của riêng mình. Khi host gửi yêu cầu DNS, yêu cầu đó được gửi đến máy chủ DNS cục bộ, nó đóng vai trò như proxy, và chuyển tiếp yêu cầu đó vào cấu trúc phân cấp DNS. Nói chính xác, không thuộc cấu trúc phân cấp DNS.

Trên thế giới không chỉ có 13 root server, đây là sự hiểu lầm phổ biến của nhiều người, nhiều bài viết trên mạng cũng viết như vậy. Thực ra, số lượng root server hiện nay vượt xa con số này. Ban đầu, 13 địa chỉ IP được phân bổ cho root server DNS, mỗi địa chỉ IP tương ứng với một root DNS server khác nhau. Tuy nhiên, do sự phát triển và tăng trưởng nhanh chóng của Internet, kiến trúc ban đầu này không còn phù hợp với nhu cầu hiện tại. Để cải thiện độ tin cậy, bảo mật và hiệu năng của DNS, hiện tại mỗi địa chỉ IP trong 13 địa chỉ này đều có nhiều máy chủ, tính đến cuối năm 2023, tổng số tất cả root server đã đạt hơn 1700 cái, và sẽ tiếp tục tăng trong tương lai.

### ⭐️Quy trình phân giải DNS là gì?

Toàn bộ quy trình có khá nhiều bước, tôi đã viết riêng một bài viết để giới thiệu chi tiết: [Giải thích chi tiết hệ thống tên miền DNS (Tầng ứng dụng)](https://javaguide.cn/cs-basics/network/dns.html).

### DNS hijacking là gì? Cách ứng phó?

DNS hijacking là một cuộc tấn công mạng, nó sửa đổi kết quả phân giải của máy chủ DNS để cho tên miền mà người dùng truy cập trỏ đến địa chỉ IP sai, từ đó khiến người dùng không thể truy cập trang web bình thường, hoặc bị dẫn đến trang web độc hại. DNS hijacking đôi khi còn được gọi là DNS redirect, DNS spoofing hoặc DNS pollution.

## Tài liệu tham khảo

- "Giải thích HTTP bằng hình ảnh" (《图解 HTTP》)
- "Mạng máy tính: Phương pháp từ trên xuống" (《计算机网络：自顶向下方法》) (Phiên bản thứ 7)
- Phân tích chi tiết HTTP/2.0 và giao thức HTTPS: <https://juejin.cn/post/7034668672262242318>
- Tổng hợp đầy đủ các trường header yêu cầu HTTP | HTTP Request Headers: <https://www.flysnow.org/tools/table/http-request-headers/>
- HTTP1, HTTP2, HTTP3: <https://juejin.cn/post/6855470356657307662>
- Cách nhìn nhận HTTP/3? - Trả lời của Che Xiaopang - Zhihu: <https://www.zhihu.com/question/302412059/answer/533223530>

<!-- @include: @article-footer.snippet.md -->
