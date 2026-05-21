---
title: Giải thích chi tiết mô hình phân tầng OSI và TCP/IP（Cơ bản）
description: Giải thích chi tiết mô hình phân tầng và phân chia trách nhiệm của OSI và TCP/IP, kết hợp lịch sử và thực tiễn để so sánh sự khác biệt và đánh đổi kỹ thuật giữa hai mô hình.
category: Kiến thức cơ bản máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: OSI 7 tầng,TCP/IP 4 tầng,mô hình phân tầng,phân chia trách nhiệm,protocol stack,so sánh
---

## Mô hình 7 tầng OSI

**Mô hình 7 tầng OSI** là mô hình phân tầng mạng được Tổ chức Tiêu chuẩn hóa Quốc tế đề xuất. Cấu trúc tổng thể và chức năng của mỗi tầng được minh họa trong hình dưới đây:

![Mô hình 7 tầng OSI](https://oss.javaguide.cn/github/javaguide/cs-basics/network/osi-7-model.png)

Mỗi tầng tập trung làm một việc cụ thể, và mỗi tầng cần sử dụng chức năng do tầng dưới cung cấp. Ví dụ, tầng vận chuyển cần sử dụng chức năng định tuyến và đánh địa chỉ do tầng mạng cung cấp, nhờ đó tầng vận chuyển mới biết gửi dữ liệu đến đâu.

**Mô hình 7 tầng OSI có khái niệm rõ ràng và lý thuyết hoàn chỉnh, nhưng khá phức tạp và không thực tiễn, hơn nữa một số chức năng xuất hiện lặp lại ở nhiều tầng.**

Hình trên có thể hơi trừu tượng, đây là một hình minh họa sinh động hơn. Hình dưới tôi tìm được trên một trang web nước ngoài, rất hay!

![Mô hình 7 tầng OSI (2)](https://oss.javaguide.cn/github/javaguide/osi七层模型2.png)

**Mô hình OSI 7 tầng tốt vậy, tại sao lại thua mô hình TCP/IP 4 tầng?**

Quả thực, mô hình OSI 7 tầng khi đó được nhiều công ty lớn thậm chí một số chính phủ quốc gia ủng hộ. Với bối cảnh như vậy, tại sao nó lại thất bại? Tôi cho rằng có một vài lý do chính sau:

1. Các chuyên gia thiết kế OSI thiếu kinh nghiệm thực tế, họ thiếu động lực thương mại khi hoàn thiện tiêu chuẩn OSI.
2. Việc triển khai giao thức OSI quá phức tạp và hiệu suất vận hành rất thấp.
3. Chu kỳ ban hành tiêu chuẩn OSI quá dài, khiến các thiết bị sản xuất theo tiêu chuẩn OSI không thể kịp thời ra thị trường (đầu thập niên 1990, dù toàn bộ tiêu chuẩn OSI quốc tế đã được ban hành, Internet dựa trên TCP/IP đã vận hành thành công trên phạm vi khá rộng toàn cầu).
4. Việc phân chia các tầng OSI không hoàn toàn hợp lý, một số chức năng xuất hiện lặp lại ở nhiều tầng.

Mô hình OSI 7 tầng dù thất bại nhưng vẫn cung cấp nhiều nền tảng lý thuyết hữu ích. Để hiểu tốt hơn về phân tầng mạng, mô hình OSI 7 tầng vẫn rất cần thiết phải học.

Cuối cùng chia sẻ một hình tổng kết rất hay về mô hình OSI 7 tầng!

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/osi-model-detail.png)

## Mô hình 4 tầng TCP/IP

**Mô hình 4 tầng TCP/IP** là mô hình được sử dụng rộng rãi hiện nay. Ta có thể coi mô hình TCP/IP như phiên bản tinh gọn của mô hình OSI 7 tầng, bao gồm 4 tầng sau:

1. Tầng ứng dụng (Application layer)
2. Tầng vận chuyển (Transport layer)
3. Tầng mạng (Network layer)
4. Tầng giao tiếp mạng (Network interface layer)

Cần lưu ý rằng ta không thể ánh xạ chính xác hoàn toàn mô hình TCP/IP 4 tầng với mô hình OSI 7 tầng, nhưng có thể đối chiếu đơn giản như hình dưới:

![Mô hình TCP/IP 4 tầng](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-ip-4-model.png)

### Tầng ứng dụng（Application layer）

**Tầng ứng dụng nằm trên tầng vận chuyển, chủ yếu cung cấp dịch vụ trao đổi thông tin giữa các ứng dụng trên hai thiết bị đầu cuối, định nghĩa định dạng trao đổi thông tin, các message sẽ được chuyển cho tầng vận chuyển bên dưới để truyền tải.** Đơn vị dữ liệu tương tác ở tầng ứng dụng gọi là datagram (bản tin).

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/network-five-layer-sample-diagram.png)

Giao thức tầng ứng dụng định nghĩa các quy tắc giao tiếp mạng. Với các ứng dụng mạng khác nhau cần có giao thức tầng ứng dụng khác nhau. Trên Internet có rất nhiều giao thức tầng ứng dụng, ví dụ HTTP hỗ trợ ứng dụng Web, SMTP hỗ trợ email, v.v.

**Các giao thức tầng ứng dụng phổ biến**:

![Các giao thức tầng ứng dụng phổ biến](https://oss.javaguide.cn/github/javaguide/cs-basics/network/application-layer-protocol.png)

- **HTTP (HyperText Transfer Protocol — Giao thức truyền tải siêu văn bản)**: Dựa trên TCP, là giao thức truyền tải siêu văn bản và nội dung đa phương tiện, chủ yếu được thiết kế cho giao tiếp giữa trình duyệt Web và Web server. Khi duyệt web, các trang web được tải qua HTTP request.
- **SMTP (Simple Mail Transfer Protocol — Giao thức truyền mail đơn giản)**: Dựa trên TCP, là giao thức gửi email. Lưu ý ⚠️: SMTP chỉ phụ trách gửi mail, không nhận mail. Để nhận mail từ mail server cần dùng giao thức POP3 hoặc IMAP.
- **POP3/IMAP (Giao thức nhận mail)**: Dựa trên TCP, cả hai đều phụ trách nhận mail. IMAP là giao thức mới hơn POP3, mạnh hơn về cả tính năng lẫn hiệu suất. IMAP hỗ trợ tìm kiếm, đánh dấu, phân loại, lưu trữ email và đồng bộ trạng thái email trên nhiều thiết bị. Hầu hết các email client và server hiện đại đều hỗ trợ IMAP.
- **FTP (File Transfer Protocol — Giao thức truyền file)**: Dựa trên TCP, là giao thức truyền file giữa các máy tính, có thể che giấu sự khác biệt về hệ điều hành và phương thức lưu trữ file. Lưu ý ⚠️: FTP là giao thức không an toàn vì không mã hóa dữ liệu trong quá trình truyền. Nên dùng các giao thức an toàn hơn như SFTP khi truyền dữ liệu nhạy cảm.
- **Telnet (Giao thức đăng nhập từ xa)**: Dựa trên TCP, dùng để đăng nhập vào server khác qua một terminal. Nhược điểm lớn nhất của Telnet là toàn bộ dữ liệu (bao gồm username và password) đều được gửi dưới dạng plain text, tiềm ẩn rủi ro bảo mật. Đó là lý do tại sao ngày nay ít dùng Telnet mà chuyển sang dùng giao thức bảo mật SSH.
- **SSH (Secure Shell Protocol — Giao thức shell an toàn)**: Dựa trên TCP, thực hiện truy cập an toàn và truyền file thông qua cơ chế mã hóa và xác thực.
- **RTP (Real-time Transport Protocol — Giao thức truyền tải thời gian thực)**: Thường dựa trên UDP nhưng cũng hỗ trợ TCP. Cung cấp chức năng truyền dữ liệu thời gian thực end-to-end, nhưng không bao gồm đặt trước tài nguyên, không đảm bảo chất lượng truyền tải thời gian thực — các chức năng này do WebRTC thực hiện.
- **DNS (Domain Name System — Hệ thống quản lý tên miền)**: Thường dựa trên UDP (cổng 53), dùng để giải quyết vấn đề ánh xạ tên miền và địa chỉ IP. Khi response data quá lớn hoặc thực hiện zone transfer sẽ chuyển sang dùng TCP.

Xem bài [Tổng hợp các giao thức tầng ứng dụng phổ biến](./application-layer-protocol.md) để tìm hiểu chi tiết các giao thức này.

### Tầng vận chuyển（Transport layer）

**Nhiệm vụ chính của tầng vận chuyển là cung cấp dịch vụ truyền dữ liệu chung cho giao tiếp giữa các tiến trình trên hai thiết bị đầu cuối.** Các tiến trình ứng dụng sử dụng dịch vụ này để truyền các datagram tầng ứng dụng. "Chung" có nghĩa là không dành riêng cho một ứng dụng cụ thể, mà nhiều ứng dụng có thể cùng sử dụng một dịch vụ tầng vận chuyển.

**Các giao thức tầng vận chuyển phổ biến**:

![Các giao thức tầng vận chuyển phổ biến](https://oss.javaguide.cn/github/javaguide/cs-basics/network/transport-layer-protocol.png)

- **TCP (Transmission Control Protocol — Giao thức kiểm soát truyền tải)**: Cung cấp dịch vụ truyền dữ liệu **hướng kết nối** (connection-oriented) và **đáng tin cậy** (reliable).
- **UDP (User Datagram Protocol — Giao thức datagram người dùng)**: Cung cấp dịch vụ truyền dữ liệu **không kết nối** (connectionless), **best-effort** (không đảm bảo độ tin cậy truyền dữ liệu), đơn giản và hiệu quả.

### Tầng mạng（Network layer）

**Tầng mạng chịu trách nhiệm cung cấp dịch vụ giao tiếp cho các host khác nhau trên mạng chuyển mạch gói.** Khi gửi dữ liệu, tầng mạng đóng gói các segment hoặc user datagram từ tầng vận chuyển thành packet (gói tin) để truyền tải. Trong kiến trúc TCP/IP, vì tầng mạng dùng giao thức IP nên packet cũng được gọi là IP datagram, viết tắt là datagram.

⚠️ Lưu ý: **Đừng nhầm lẫn "UDP (User Datagram)" của tầng vận chuyển với "IP datagram" của tầng mạng**.

**Một nhiệm vụ khác của tầng mạng là chọn route phù hợp, để các packet từ tầng vận chuyển của host nguồn có thể tìm đến host đích thông qua các router trong tầng mạng.**

Cần nhấn mạnh rằng từ "mạng" trong "tầng mạng" không còn là các mạng cụ thể mà ta thường nói đến, mà là tên của tầng thứ ba trong mô hình kiến trúc mạng máy tính.

Internet được kết nối từ rất nhiều mạng không đồng nhất (heterogeneous) thông qua các router. Giao thức tầng mạng Internet dùng là Internet Protocol (IP) không kết nối và nhiều giao thức định tuyến, do đó tầng mạng của Internet còn được gọi là **tầng Internet** hay **tầng IP**.

**Các giao thức tầng mạng phổ biến**:

![Các giao thức tầng mạng phổ biến](images/network-model/nerwork-layer-protocol.png)

- **IP (Internet Protocol — Giao thức Internet)**: Một trong các giao thức quan trọng nhất của TCP/IP, chức năng chính là định nghĩa định dạng gói tin, định tuyến và đánh địa chỉ gói tin để chúng có thể truyền qua mạng và đến đúng đích. Hiện tại giao thức IP chủ yếu có hai loại: IPv4 cũ và IPv6 mới hơn; cả hai đang được sử dụng, nhưng IPv6 đã được đề xuất thay thế IPv4.
- **ARP (Address Resolution Protocol — Giao thức phân giải địa chỉ)**: ARP giải quyết vấn đề chuyển đổi giữa địa chỉ tầng mạng (IP) và địa chỉ tầng liên kết (MAC). Vì trong quá trình truyền vật lý của IP datagram, luôn cần biết hop tiếp theo (đích vật lý tiếp theo) là ở đâu, nhưng địa chỉ IP là địa chỉ logic còn MAC mới là địa chỉ vật lý, ARP giải quyết một số vấn đề chuyển đổi từ IP sang MAC.
- **ICMP (Internet Control Message Protocol — Giao thức bản tin kiểm soát Internet)**: Giao thức dùng để truyền trạng thái mạng và thông báo lỗi, thường dùng cho chẩn đoán và khắc phục sự cố mạng. Ví dụ công cụ Ping dùng giao thức ICMP để kiểm tra kết nối mạng.
- **NAT (Network Address Translation — Giao thức dịch địa chỉ mạng)**: Đúng như tên gọi, NAT được ứng dụng trong quá trình chuyển đổi địa chỉ từ mạng nội bộ ra mạng ngoài. Cụ thể, trong một subnet nhỏ (LAN), các host dùng địa chỉ IP trong cùng LAN đó, nhưng ngoài LAN, trên WAN cần một địa chỉ IP thống nhất để định danh LAN đó trên toàn Internet.
- **OSPF (Open Shortest Path First — Giao thức đường ngắn nhất mở đầu tiên)**: Một giao thức cổng nội bộ (Interior Gateway Protocol — IGP), cũng là giao thức định tuyến động được sử dụng rộng rãi, dựa trên thuật toán trạng thái liên kết, xem xét băng thông, độ trễ của liên kết để chọn đường đi tối ưu.
- **RIP (Routing Information Protocol — Giao thức thông tin định tuyến)**: Một giao thức cổng nội bộ (IGP), cũng là giao thức định tuyến động, dựa trên thuật toán vector khoảng cách, dùng số hop cố định làm thước đo, chọn đường ít hop nhất làm đường tối ưu.
- **BGP (Border Gateway Protocol — Giao thức cổng biên)**: Giao thức định tuyến dùng để trao đổi thông tin về khả năng tiếp cận tầng mạng (NLRI — Network Layer Reachability Information) giữa các miền định tuyến, có tính linh hoạt và khả năng mở rộng cao.

### Tầng giao tiếp mạng（Network interface layer）

Ta có thể coi tầng giao tiếp mạng là sự kết hợp của tầng liên kết dữ liệu và tầng vật lý.

1. Tầng liên kết dữ liệu (data link layer) thường được viết tắt là tầng liên kết (dữ liệu truyền giữa hai host luôn được truyền qua từng đoạn liên kết). **Chức năng của tầng liên kết dữ liệu là đóng khung (frame) các IP datagram nhận từ tầng mạng, truyền frame trên liên kết giữa hai node kề nhau. Mỗi frame bao gồm dữ liệu và thông tin điều khiển cần thiết (như thông tin đồng bộ, thông tin địa chỉ, kiểm soát lỗi, v.v.).**
2. **Chức năng của tầng vật lý là thực hiện truyền tải transparent bit stream giữa các node máy tính kề nhau, che giấu tối đa sự khác biệt của môi trường truyền dẫn và thiết bị vật lý cụ thể.**

Các chức năng và giao thức quan trọng của tầng giao tiếp mạng được minh họa trong hình dưới:

![Các chức năng và giao thức quan trọng của tầng giao tiếp mạng](https://oss.javaguide.cn/github/javaguide/cs-basics/network/network-interface-layer-protocol.png)

### Tổng kết

Tóm tắt ngắn gọn các giao thức và công nghệ cốt lõi của từng tầng:

![Tổng quan các giao thức TCP/IP theo tầng](https://oss.javaguide.cn/github/javaguide/cs-basics/network/network-protocol-overview.png)

**Giao thức tầng ứng dụng**:

- HTTP (HyperText Transfer Protocol — Giao thức truyền tải siêu văn bản)
- SMTP (Simple Mail Transfer Protocol — Giao thức truyền mail đơn giản)
- POP3/IMAP (Giao thức nhận mail)
- FTP (File Transfer Protocol — Giao thức truyền file)
- Telnet (Giao thức đăng nhập từ xa)
- SSH (Secure Shell Protocol — Giao thức shell an toàn)
- RTP (Real-time Transport Protocol — Giao thức truyền tải thời gian thực)
- DNS (Domain Name System — Hệ thống quản lý tên miền)
- ……

**Giao thức tầng vận chuyển**:

- Giao thức TCP
  - Cấu trúc segment
  - Truyền dữ liệu đáng tin cậy
  - Kiểm soát luồng (Flow control)
  - Kiểm soát tắc nghẽn (Congestion control)
- Giao thức UDP
  - Cấu trúc segment
  - RDT (Reliable Data Transfer Protocol — Giao thức truyền dữ liệu đáng tin cậy)

**Giao thức tầng mạng**:

- IP (Internet Protocol — Giao thức Internet)
- ARP (Address Resolution Protocol — Giao thức phân giải địa chỉ)
- Giao thức ICMP (Giao thức bản tin kiểm soát, dùng để gửi thông điệp điều khiển)
- NAT (Network Address Translation — Giao thức dịch địa chỉ mạng)
- OSPF (Open Shortest Path First — Giao thức đường ngắn nhất mở đầu tiên)
- RIP (Routing Information Protocol — Giao thức thông tin định tuyến)
- BGP (Border Gateway Protocol — Giao thức cổng biên)
- ……

**Tầng giao tiếp mạng**:

- Công nghệ phát hiện lỗi
- Giao thức đa truy cập (Công nghệ ghép kênh)
- Giao thức CSMA/CD
- Giao thức MAC
- Công nghệ Ethernet
- ……

## Lý do phân tầng mạng

Ở cuối bài này, tôi muốn bàn về: "Tại sao mạng cần phân tầng?"

Nói đến phân tầng, hãy bắt đầu từ việc phát triển một chương trình backend thông thường bằng framework. Chúng ta thường phân hệ thống thành ba tầng theo nguyên tắc mỗi tầng làm những việc khác nhau (các hệ thống phức tạp hơn có thể có nhiều tầng hơn):

1. Repository (thao tác với database)
2. Service (thao tác nghiệp vụ)
3. Controller (trao đổi dữ liệu giữa frontend và backend)

**Các hệ thống phức tạp cần phân tầng vì mỗi tầng cần tập trung vào một loại công việc. Lý do phân tầng mạng cũng tương tự — mỗi tầng chỉ tập trung vào một loại công việc.**

Vậy tại sao mạng cần phân tầng? Tôi cho rằng có 3 lý do chính:

1. **Các tầng độc lập với nhau**: Các tầng không cần quan tâm đến cách các tầng khác được triển khai, chỉ cần biết cách gọi các chức năng do tầng dưới cung cấp (có thể hiểu đơn giản là gọi interface). **Điều này giống với nguyên tắc phân tầng hệ thống trong phát triển phần mềm.**
2. **Tăng tính linh hoạt tổng thể**: Mỗi tầng có thể dùng công nghệ phù hợp nhất để triển khai, chỉ cần đảm bảo chức năng cung cấp và quy tắc interface không thay đổi. **Điều này tương ứng với nguyên tắc high cohesion, low coupling trong phát triển hệ thống.**
3. **Chia nhỏ vấn đề lớn**: Phân tầng có thể chia vấn đề mạng phức tạp thành nhiều vấn đề nhỏ hơn, ranh giới rõ ràng hơn để xử lý và giải quyết. Điều này giúp hệ thống mạng máy tính phức tạp trở nên dễ thiết kế, triển khai và chuẩn hóa. **Điều này tương ứng với việc phát triển phần mềm thông thường — ta thường phân rã chức năng hệ thống, chia vấn đề phức tạp thành các vấn đề nhỏ hơn dễ hiểu hơn với ranh giới (mục tiêu và interface) được định nghĩa rõ ràng hơn.**

Tôi nghĩ đến một câu nói rất nổi tiếng trong thế giới máy tính, xin chia sẻ ở đây:

> Bất kỳ vấn đề nào trong lĩnh vực khoa học máy tính đều có thể được giải quyết bằng cách thêm một tầng trung gian gián tiếp. Toàn bộ kiến trúc máy tính từ trên xuống dưới đều được thiết kế theo cấu trúc phân tầng nghiêm ngặt.

## Tài liệu tham khảo

- TCP/IP model vs OSI model: <https://fiberbit.com.tw/tcpip-model-vs-osi-model/>
- Data Encapsulation and the TCP/IP Protocol Stack: <https://docs.oracle.com/cd/E19683-01/806-4075/ipov-32/index.html>

<!-- @include: @article-footer.snippet.md -->
