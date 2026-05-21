---
title: Tổng hợp câu hỏi phỏng vấn về mạng máy tính (Phần dưới)
description: Tổng hợp câu hỏi phỏng vấn mạng máy tính tần suất cao mới nhất (Phần dưới) - So sánh sâu TCP/UDP, Three-way Handshake Four-way Teardown, tối ưu HTTP/3 QUIC, ưu điểm IPv6, giải thích NAT/ARP. Kèm bảng + đánh dấu ⭐️ điểm trọng tâm, một bài nắm vững kiến thức cốt lõi Transport Layer & Network Layer.
category: CS Basics
tag:
  - Computer Network
head:
  - - meta
    - name: keywords
      content: computer network interview,TCP vs UDP,TCP three-way handshake,HTTP/3 QUIC,IPv4 vs IPv6,TCP reliability,IP address,NAT protocol,ARP protocol,transport layer interview,network layer questions
---

<!-- @include: @article-header.snippet.md -->

Phần dưới chủ yếu là nội dung liên quan đến transport layer và network layer.

## TCP và UDP

### ⭐️Sự khác biệt giữa TCP và UDP (Quan trọng)

1. **Có kết nối hay không**:
   - TCP là connection-oriented. Trước khi truyền dữ liệu, phải thiết lập kết nối qua "three-way handshake"; sau khi truyền dữ liệu xong, cần giải phóng kết nối qua "four-way teardown". Điều này đảm bảo cả hai bên đều sẵn sàng giao tiếp.
   - UDP là connectionless. Không cần thiết lập bất kỳ kết nối nào trước khi gửi dữ liệu, ném gói dữ liệu (datagram) trực tiếp ra.
2. **Có phải reliable transmission không**:
   - TCP cung cấp dịch vụ truyền dữ liệu đáng tin cậy. Nó đảm bảo dữ liệu đến đích không có lỗi, không mất mát, không trùng lặp và theo đúng thứ tự thông qua một loạt cơ chế như sequence number, ACK, timeout retransmission, flow control, congestion control.
   - UDP cung cấp truyền không đáng tin cậy. Nó cố gắng tối đa để giao (best-effort delivery), nhưng không đảm bảo dữ liệu nhất định đến nơi, không đảm bảo thứ tự đến, và không tự động retransmit. Sau khi nhận được message, bên nhận cũng không chủ động gửi xác nhận.
3. **Có trạng thái hay không**:
   - TCP là stateful. Vì phải đảm bảo độ tin cậy, TCP cần duy trì thông tin trạng thái kết nối ở cả hai đầu, như sequence number, window size, dữ liệu nào đã gửi, dữ liệu nào đã được confirm.
   - UDP là stateless. Nó không duy trì trạng thái kết nối, sau khi bên gửi gửi dữ liệu xong không còn quan tâm nó có đến không và đến như thế nào, vì vậy overhead nhỏ hơn (**Điều này rất "phũ"!**).
4. **Hiệu quả truyền**:
   - TCP vì cần thiết lập kết nối, gửi xác nhận, xử lý retransmit v.v. nên overhead lớn hơn, hiệu quả truyền tương đối thấp hơn.
   - UDP cấu trúc đơn giản, không có cơ chế kiểm soát phức tạp, overhead nhỏ, hiệu quả truyền cao hơn, tốc độ nhanh hơn.
5. **Hình thức truyền**:
   - TCP là byte stream oriented. Nó coi dữ liệu do application giao là một chuỗi byte không có cấu trúc, có thể chia nhỏ hoặc gộp dữ liệu.
   - UDP là message oriented. Application giao cho UDP bao nhiêu data block, UDP gửi bấy nhiêu, không chia nhỏ cũng không gộp, giữ nguyên ranh giới message của application.
6. **Header overhead**:
   - Header của TCP ít nhất cần 20 byte, nếu chứa option field có thể lên đến 60 byte.
   - Header của UDP rất đơn giản, cố định chỉ có 8 byte.
7. **Có cung cấp broadcast hoặc multicast không**:
   - TCP chỉ hỗ trợ unicast Point-to-Point.
   - UDP hỗ trợ one-to-one (unicast), one-to-many (multicast) và one-to-all (broadcast).
8. ……

Để so sánh trực quan hơn, xem bảng dưới:

| Đặc điểm                | TCP                        | UDP                                          |
| ----------------------- | -------------------------- | -------------------------------------------- |
| **Connectivity**        | Connection-oriented        | Connectionless                               |
| **Reliability**         | Reliable                   | Unreliable (best-effort)                     |
| **State**               | Stateful                   | Stateless                                    |
| **Efficiency**          | Lower                      | Higher                                       |
| **Transfer Form**       | Byte stream                | Datagram (Message)                           |
| **Header Overhead**     | 20-60 bytes                | 8 bytes                                      |
| **Communication Mode**  | Point-to-point (unicast)   | Unicast, multicast, broadcast                |
| **Common Applications** | HTTP/HTTPS, FTP, SMTP, SSH | DNS, DHCP, SNMP, TFTP, VoIP, video streaming |

### ⭐️Khi nào chọn TCP, khi nào chọn UDP?

Việc chọn TCP hay UDP phụ thuộc chủ yếu vào **yêu cầu về độ tin cậy truyền dữ liệu của application và yêu cầu về tính thời gian thực, hiệu quả**.

Khi **tính chính xác và toàn vẹn dữ liệu cực kỳ quan trọng, không thể có bất kỳ sai sót nào**, thường chọn TCP. Vì TCP cung cấp một bộ cơ chế hoàn chỉnh (three-way handshake, ACK, retransmit, flow control v.v.) để đảm bảo dữ liệu đến đích đáng tin cậy và có thứ tự. Scenario điển hình:

- **Web browsing (HTTP/HTTPS)**: Nội dung webpage, hình ảnh, script phải tải hoàn chỉnh mới hiển thị đúng.
- **File transfer (FTP, SCP)**: Nội dung file không cho phép mất bất kỳ byte nào hoặc sai thứ tự.
- **Email (SMTP, POP3, IMAP)**: Nội dung email cần đến đích hoàn toàn không có lỗi.
- **Remote login (SSH, Telnet)**: Command và response cần truyền chính xác.
- ……

Khi **tính thời gian thực, tốc độ và hiệu quả được ưu tiên, và application có thể chấp nhận một lượng nhỏ mất mát dữ liệu hoặc sai thứ tự**, thường chọn UDP. UDP overhead nhỏ, truyền nhanh, không có quy trình phức tạp để thiết lập kết nối và đảm bảo độ tin cậy. Scenario điển hình:

- **Real-time audio/video communication (VoIP, video conferencing, live streaming)**: Mất đi một vài gói dữ liệu (có thể gây ra màn hình hoặc âm thanh bị giật ngắn) thường chấp nhận được hơn là delay dài do chờ retransmit (cơ chế TCP). Application layer có thể có cơ chế bù riêng.
- **Online games**: Cần truyền nhanh thông tin vị trí, trạng thái của player, yêu cầu tính thời gian thực cực cao, dữ liệu cũ nhanh chóng trở nên vô dụng, mất một ít dữ liệu thường không ảnh hưởng nhiều.
- **DHCP (Dynamic Host Configuration Protocol)**: Client khi request IP chưa có IP, không thể đáp ứng điều kiện tiên quyết của TCP để thiết lập kết nối, và DHCP có nhu cầu broadcast, interaction mode đơn giản và có cơ chế reliability riêng.
- **IoT data reporting**: Trong một số scenario, sensor định kỳ báo cáo dữ liệu, mất vài data point đơn lẻ có thể không ảnh hưởng đến phân tích xu hướng tổng thể.
- ……

### HTTP dựa trên TCP hay UDP?

~~**HTTP protocol dựa trên TCP protocol**, vì vậy trước khi gửi HTTP request cần thiết lập kết nối TCP tức là phải trải qua 3-way handshake.~~

🐛 Cập nhật (xem [issue#1915](https://github.com/Snailclimb/JavaGuide/issues/1915)):

HTTP/3.0 trở về trước dựa trên TCP protocol, còn HTTP/3.0 sẽ bỏ TCP, chuyển sang **QUIC protocol dựa trên UDP**:

- **HTTP/1.x và HTTP/2.0**: Hai phiên bản này của HTTP protocol đều rõ ràng xây dựng trên TCP. TCP cung cấp truyền đáng tin cậy, connection-oriented, đảm bảo dữ liệu đến theo thứ tự, không có lỗi — điều này rất quan trọng cho việc hiển thị đúng nội dung webpage. Trước khi gửi HTTP request, cần thiết lập kết nối qua TCP three-way handshake.
- **HTTP/3.0**: Đây là thay đổi lớn. HTTP/3 bỏ TCP, chuyển sang dùng QUIC protocol, còn QUIC được xây dựng trên UDP.

![http-3-implementation](/images/github/javaguide/cs-basics/network/http-3-implementation.png)

**Tại sao HTTP/3 thực hiện thay đổi này? Chủ yếu có hai lý do:**

1. Giải quyết vấn đề Head-of-Line Blocking (HOL blocking).
2. Giảm độ trễ thiết lập kết nối.

Dưới đây giới thiệu chi tiết hai tối ưu này.

Trong HTTP/2, mặc dù có thể truyền đồng thời nhiều request/response stream trên một kết nối TCP (multiplexing), nhưng đặc điểm của bản thân TCP (đảm bảo thứ tự, đáng tin cậy) có nghĩa là nếu một TCP segment của một stream bị mất hoặc delay, toàn bộ kết nối TCP sẽ bị block chờ segment đó được retransmit. Điều này sẽ ảnh hưởng đến tất cả HTTP/2 stream trên kết nối TCP đó, dù các gói dữ liệu của stream khác đã đến. **QUIC (chạy trên UDP) giải quyết vấn đề này**. QUIC triển khai cơ chế multiplexing và flow control riêng. Các HTTP request/response stream khác nhau thực sự độc lập ở tầng QUIC. Nếu data packet của một stream bị mất, nó chỉ block stream đó, không ảnh hưởng đến các stream khác trên cùng kết nối QUIC (về bản chất là multiplexing + polling), cải thiện đáng kể hiệu quả concurrent transmission.

Ngoài giải quyết HOL blocking, HTTP/3.0 còn giảm độ trễ của quá trình handshake. Trong HTTP/2.0, để thiết lập một kết nối HTTPS an toàn, cần qua TCP three-way handshake và TLS handshake:

1. TCP three-way handshake: Client và server trao đổi SYN và ACK packet, thiết lập kết nối TCP. Quá trình này cần 1.5 RTT (round-trip time) — thời gian từ khi gửi đến khi nhận gói dữ liệu.
2. TLS handshake: Client và server trao đổi key và certificate, thiết lập TLS encryption layer. Quá trình này cần ít nhất 1 RTT (TLS 1.3) hoặc 2 RTT (TLS 1.2).

Vì vậy, thiết lập kết nối HTTP/2.0 cần ít nhất 2.5 RTT (TLS 1.3) hoặc 3.5 RTT (TLS 1.2). Còn trong HTTP/3.0, QUIC protocol (TLS 1.3, TLS 1.3 ngoài hỗ trợ 1-RTT handshake còn hỗ trợ 0-RTT handshake) chỉ cần 0-RTT hoặc 1-RTT để thiết lập kết nối. Điều này có nghĩa là trong trường hợp tốt nhất, QUIC có thể thiết lập kết nối mới mà không cần bất kỳ RTT nào.

Tham khảo chứng minh liên quan:

- <https://zh.wikipedia.org/zh/HTTP/3>
- <https://datatracker.ietf.org/doc/rfc9114/>

### Bạn biết những protocol nào dựa trên TCP/UDP?

TCP (Transmission Control Protocol) và UDP (User Datagram Protocol) là hai core protocol của internet transport layer, cung cấp dịch vụ communication cơ bản cho các application layer protocol. Dưới đây là một số application layer protocol phổ biến xây dựng trên TCP và UDP:

**Protocol chạy trên TCP (Nhấn mạnh reliable, ordered transmission):**

| Tên đầy đủ (Viết tắt)                      | Tên tiếng Anh                      | Mục đích chính                               | Mô tả và đặc điểm                                                                                                                                                                               |
| ------------------------------------------ | ---------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP (HyperText Transfer Protocol)         | HyperText Transfer Protocol        | Truyền webpage, hypertext, multimedia        | **HTTP/1.x và HTTP/2 dựa trên TCP**. Các phiên bản cũ không mã hóa, là nền tảng Web communication.                                                                                              |
| HTTPS (HyperText Transfer Protocol Secure) | HyperText Transfer Protocol Secure | Truyền webpage được mã hóa                   | Thêm SSL/TLS encryption layer giữa HTTP và TCP, đảm bảo tính confidential và integrity của transmission.                                                                                        |
| FTP (File Transfer Protocol)               | File Transfer Protocol             | Truyền file                                  | FTP truyền thống là **plain text**, không an toàn. Khuyến nghị dùng **SFTP (SSH File Transfer Protocol)** hoặc **FTPS (FTP over SSL/TLS)**.                                                     |
| SMTP (Simple Mail Transfer Protocol)       | Simple Mail Transfer Protocol      | **Gửi** email                                | Chịu trách nhiệm gửi email từ client đến server, hoặc truyền giữa các mail server. Có thể nâng cấp lên encrypted transmission qua **STARTTLS**.                                                 |
| POP3 (Post Office Protocol v3)             | Post Office Protocol version 3     | **Nhận** email                               | Thường **download email từ server về thiết bị local rồi xóa bản sao trên server** (có thể cấu hình giữ lại). **POP3S** là phiên bản SSL/TLS.                                                    |
| IMAP (Internet Message Access Protocol)    | Internet Message Access Protocol   | **Nhận và quản lý** email                    | Email được giữ trên server, hỗ trợ đồng bộ trạng thái email trên nhiều thiết bị, quản lý folder, tìm kiếm online. **IMAPS** là phiên bản SSL/TLS. Lựa chọn đầu tiên cho dịch vụ email hiện đại. |
| Telnet                                     | Teletype Network                   | Đăng nhập terminal từ xa                     | **Plain text** tất cả dữ liệu (bao gồm password), bảo mật cực kém, cơ bản đã bị SSH thay thế hoàn toàn.                                                                                         |
| SSH (Secure Shell)                         | Secure Shell                       | Quản lý từ xa an toàn, truyền dữ liệu mã hóa | Cung cấp remote login và command execution mã hóa, cùng SFTP và các chức năng khác, là phương án an toàn thay thế Telnet.                                                                       |

**Protocol chạy trên UDP (Nhấn mạnh fast, low-overhead transmission):**

| Tên đầy đủ (Viết tắt)                      | Tên tiếng Anh                         | Mục đích chính                               | Mô tả và đặc điểm                                                                                                                                     |
| ------------------------------------------ | ------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP/3                                     | HyperText Transfer Protocol version 3 | Truyền webpage thế hệ mới                    | Dựa trên **QUIC** protocol (QUIC xây dựng trên UDP), nhằm giảm latency, giải quyết TCP HOL blocking, hỗ trợ 0-RTT connection establishment.           |
| DHCP (Dynamic Host Configuration Protocol) | Dynamic Host Configuration Protocol   | Cấp phát dynamic IP và cấu hình mạng         | Client tự động lấy IP address, subnet mask, gateway, DNS server và thông tin khác từ server.                                                          |
| DNS (Domain Name System)                   | Domain Name System                    | Phân giải domain name sang IP address        | **Thường dùng UDP** để query nhanh. Khi response packet quá lớn hoặc thực hiện zone transfer (AXFR), **chuyển sang TCP** để đảm bảo toàn vẹn dữ liệu. |
| RTP (Real-time Transport Protocol)         | Real-time Transport Protocol          | Truyền real-time audio/video stream          | Thường dùng cho VoIP, video conferencing, live streaming. Tối đa giảm latency, chấp nhận một ít mất gói. Thường dùng kết hợp với RTCP.                |
| RTCP (RTP Control Protocol)                | RTP Control Protocol                  | Quality monitoring và control của RTP stream | Phối hợp với RTP, cung cấp thông tin thống kê như packet loss, latency, jitter, hỗ trợ traffic control và congestion management.                      |
| TFTP (Trivial File Transfer Protocol)      | Trivial File Transfer Protocol        | Truyền file đơn giản                         | Chức năng đơn giản, thường dùng trong LAN để diskless workstation khởi động, network device firmware upgrade và các scenario truyền file nhỏ.         |
| SNMP (Simple Network Management Protocol)  | Simple Network Management Protocol    | Monitoring và quản lý thiết bị mạng          | Cho phép network admin query và sửa đổi thông tin trạng thái của thiết bị mạng.                                                                       |
| NTP (Network Time Protocol)                | Network Time Protocol                 | Đồng bộ đồng hồ máy tính                     | Dùng để đồng bộ thời gian giữa các máy tính trong mạng, đảm bảo tính nhất quán thời gian.                                                             |

**Tóm lại:**

- **TCP** phù hợp hơn với các application có yêu cầu cao về **độ tin cậy, toàn vẹn và thứ tự dữ liệu**, như web browsing (HTTP/HTTPS), file transfer (FTP/SFTP), email (SMTP/POP3/IMAP).
- **UDP** phù hợp hơn với các application có **yêu cầu thời gian thực cao, chấp nhận một ít mất dữ liệu**, như DNS resolution, real-time audio/video (RTP), online games, network management (SNMP).

### ⭐️TCP Three-way Handshake và Four-way Teardown (Rất quan trọng)

**Câu hỏi phỏng vấn liên quan**:

- Tại sao cần three-way handshake?
- Three-way handshake lần 2 truyền lại ACK, tại sao còn phải truyền lại SYN?
- Tại sao cần four-way teardown?
- Tại sao không thể gộp ACK và FIN mà server gửi lại, biến thành three-way teardown?
- Nếu ACK của server trong lần teardown thứ 2 không đến được client, thì sao?
- Tại sao sau lần teardown thứ 4, client cần chờ thêm 2\*MSL (Maximum Segment Lifetime) mới vào trạng thái CLOSED?

**Tham khảo đáp án**: [TCP Three-way Handshake và Four-way Teardown (Transport Layer)](https://javaguide.cn/cs-basics/network/tcp-connection-and-disconnection.html).

### ⭐️TCP đảm bảo độ tin cậy truyền tải như thế nào? (Quan trọng)

[Đảm bảo độ tin cậy TCP (Transport Layer)](https://javaguide.cn/cs-basics/network/tcp-reliability-guarantee.html)

## IP

### Vai trò của IP protocol là gì?

**IP (Internet Protocol)** là một trong những protocol quan trọng nhất trong TCP/IP protocol suite, thuộc về network layer protocol. Vai trò chính là định nghĩa định dạng data packet, routing và addressing data packet, để chúng có thể truyền qua mạng và đến đúng đích.

Hiện tại IP protocol chủ yếu có hai loại: IPv4 cũ hơn và IPv6 mới hơn. Cả hai protocol đều đang được sử dụng, nhưng IPv6 đã được đề xuất để thay thế IPv4.

### IP address là gì? IP addressing hoạt động như thế nào?

Mỗi thiết bị hoặc domain kết nối internet (như máy tính, server, router v.v.) đều được cấp một **IP address (Internet Protocol address)** làm unique identifier. Mỗi IP address là một chuỗi ký tự, như 192.168.1.1 (IPv4), 2001:0db8:85a3:0000:0000:8a2e:0370:7334 (IPv6).

Khi thiết bị mạng gửi IP data packet, packet chứa **source IP address** và **destination IP address**. Source IP address dùng để xác định thiết bị hoặc domain gửi packet, còn destination IP address dùng để xác định thiết bị hoặc domain nhận packet. Điều này tương tự như một bức thư chứa cả địa chỉ đích và địa chỉ trả lại.

Thiết bị mạng dựa vào destination IP address để xác định đích đến của packet và forward packet đến đúng mạng hoặc subnet đích, từ đó thực hiện giao tiếp giữa các thiết bị.

Cách addressing dựa trên IP address này là nền tảng của internet communication, cho phép packet truyền giữa các mạng khác nhau, thực hiện kết nối mạng phạm vi toàn cầu. Tính duy nhất và toàn cầu của IP address đảm bảo mỗi thiết bị trong mạng có thể được nhận dạng và addressing thông qua IP address độc đáo của nó.

![IP address helps packets reach their destination](/images/github/javaguide/cs-basics/network/internet_protocol_ip_address_diagram.png)

### IP address filtering là gì?

**IP Address Filtering** nói đơn giản là giới hạn hoặc chặn truy cập từ IP address hoặc dải IP address cụ thể. Ví dụ, image service của bạn đột nhiên bị tấn công từ một IP address, thì có thể cấm IP address đó truy cập image service.

IP address filtering là một biện pháp bảo mật mạng đơn giản, trong ứng dụng thực tế thường được kết hợp với các biện pháp bảo mật mạng khác như authentication, authorization, encryption. Chỉ dùng IP address filtering một mình không thể đảm bảo hoàn toàn an toàn mạng.

### ⭐️Sự khác biệt giữa IPv4 và IPv6 là gì?

**IPv4 (Internet Protocol version 4)** là phiên bản IP address được sử dụng rộng rãi hiện tại, định dạng là bốn nhóm số cách nhau bằng dấu chấm, ví dụ: 123.89.46.72. IPv4 dùng 32-bit address làm Internet address, có nghĩa là có khoảng 4.2 tỷ ($2^{32}$) IP address khả dụng.

![IPv4](/images/github/javaguide/cs-basics/network/Figure-1-IPv4Addressformatwithdotteddecimalnotation-29c824f6a451d48d8c27759799f0c995.png)

Ít vậy tất nhiên không đủ dùng! Để giải quyết vấn đề cạn kiệt IP address, giải pháp căn bản nhất là dùng phiên bản IP protocol mới với không gian địa chỉ lớn hơn — **IPv6 (Internet Protocol version 6)**. IPv6 address dùng định dạng phức tạp hơn, sử dụng nhóm số và chữ cái cách nhau bởi dấu hai chấm đơn hoặc đôi, ví dụ: 2001:0db8:85a3:0000:0000:8a2e:0370:7334. IPv6 dùng 128-bit internet address, có nghĩa là có tới $2^{128}$ IP address khả dụng (số 39 chữ số bắt đầu bằng 3, kinh khủng thật!).

![IPv6](/images/github/javaguide/cs-basics/network/Figure-2-IPv6Addressformatwithhexadecimalnotation-7da3a419bd81627a9b2cef3b0efb4940.png)

Ngoài không gian address lớn hơn, ưu điểm của IPv6 còn bao gồm:

- **SLAAC (Stateless Address Autoconfiguration)**: Host có thể tạo trực tiếp IPv6 address toàn cục duy nhất dựa trên interface identifier và network prefix mà không cần phụ thuộc vào DHCP server, đơn giản hóa cấu hình và quản lý mạng.
- **NAT (Network Address Translation) trở thành tùy chọn**: Tài nguyên IPv6 address đủ dùng, có thể cho mỗi thiết bị trên toàn cầu một địa chỉ độc lập.
- **Header structure được cải tiến**: Cấu trúc IPv6 header đơn giản và hiệu quả hơn IPv4, giảm processing overhead, cải thiện network performance.
- **Optional extension header**: Cho phép thêm các extension header khác nhau vào IPv6 header để triển khai các loại chức năng và option khác nhau.
- **ICMPv6 (Internet Control Message Protocol for IPv6)**: ICMPv6 trong IPv6 có một số cải tiến so với ICMP trong IPv4, như cải tiến neighbor discovery, path MTU discovery v.v., nâng cao độ tin cậy và performance của mạng.
- ……

### Làm thế nào để lấy IP thực của client?

Có nhiều cách để lấy IP thực của client, chủ yếu chia thành phương pháp application layer, transport layer và network layer.

**Application layer method**:

Lấy qua request header [X-Forwarded-For](https://en.wikipedia.org/wiki/X-Forwarded-For), đơn giản và tiện lợi. Tuy nhiên, phương pháp này không thể đảm bảo IP lấy được là thực, vì trường X-Forwarded-For có thể bị giả mạo. Nếu qua nhiều proxy server, trường X-Forwarded-For có thể có nhiều giá trị (mang tất cả địa chỉ proxy server trong chuỗi request). Ngoài ra, phương pháp này chỉ áp dụng cho HTTP và SMTP protocol.

**Transport layer method**:

Sử dụng TCP Options field để mang thông tin source IP thực. Phương pháp này áp dụng cho bất kỳ protocol dựa trên TCP nào, không bị giới hạn bởi application layer. Tuy nhiên, đây không phải là điều TCP standard hỗ trợ, vì vậy cần cả hai bên đều thực hiện thay đổi. Nghĩa là: Bên gửi cần có khả năng chèn source IP thực vào TCP Options. Bên nhận cần có khả năng đọc IP address từ TCP Options.

Cũng có thể truyền client IP và Port thông qua Proxy Protocol. Phương pháp này có thể sử dụng Nginx hoặc các reverse proxy server hỗ trợ protocol này để lấy IP thực hoặc parse IP thực ở business server.

**Network layer method**:

Tunnel + DSR mode. Phương pháp này có thể áp dụng cho bất kỳ protocol nào, nhưng triển khai sẽ khá phức tạp và có một số hạn chế, trong ứng dụng thực tế thường không dùng phương pháp này.

### Vai trò của NAT là gì?

**NAT (Network Address Translation)** chủ yếu được dùng để chuyển đổi IP address giữa các mạng khác nhau. Nó cho phép map private IP address (như IP address dùng trong LAN) sang public IP address (dùng trên internet) hoặc ngược lại, từ đó cho phép nhiều thiết bị trong LAN truy cập internet qua một public IP duy nhất.

NAT không chỉ giúp giảm bớt vấn đề thiếu hụt tài nguyên IPv4 address, mà còn có thể ẩn cấu trúc topo thực tế của internal network, khiến external network không thể truy cập trực tiếp các thiết bị trong internal network, từ đó nâng cao tính bảo mật của internal network.

![NAT implements IP address translation](/images/github/javaguide/cs-basics/network/network-address-translation.png)

Đọc liên quan: [Giải thích chi tiết NAT Protocol (Network Layer)](https://javaguide.cn/cs-basics/network/nat.html).

## ARP

### MAC address là gì?

Tên đầy đủ của MAC address là **Media Access Control Address**. Nếu nói rằng mỗi tài nguyên trên internet được định danh duy nhất bởi IP address (nội dung IP protocol), thì mọi thiết bị mạng đều được định danh duy nhất bởi MAC address.

![Mặt sau của router sẽ ghi MAC address](/images/github/javaguide/cs-basics/network/router-back-will-indicate-mac-address.png)

Có thể hiểu rằng MAC address là số CMND thực sự của một thiết bị mạng, còn IP address chỉ là một cách định vị không trùng lặp (ví dụ như Zhang San sống ở tỉnh X, thành phố Y, đường Z, cách định vị logic này là IP address, số CMND của anh ta mới là MAC address). MAC address cũng có một số tên gọi khác như LAN address, physical address, ethernet address.

> Một điều nữa cần biết: Không chỉ network resource mới có IP address, network device cũng có IP address, như router. Nhưng về mặt cấu trúc, vai trò của network device như router là tạo thành một mạng và thường là internal network, vì vậy IP address của chúng thường là internal IP. Thiết bị trong internal network khi giao tiếp với thiết bị bên ngoài internal network cần dùng NAT protocol.

MAC address có độ dài 6 byte (48 bit), không gian địa chỉ có tới 280 nghìn tỷ ($2^{48}$). MAC address được IEEE thống nhất quản lý và cấp phát. Về lý thuyết, MAC address trên network card trong một thiết bị mạng là vĩnh viễn. Các nhà sản xuất network card khác nhau mua không gian MAC address từ IEEE (24 bit đầu của MAC), tức là 24 bit đầu do IEEE thống nhất quản lý, đảm bảo không trùng lặp. Còn 24 bit sau, do từng nhà sản xuất tự quản lý, cũng đảm bảo MAC address của hai network card được sản xuất ra không trùng nhau.

MAC address có tính portable và permanent. Số CMND vĩnh viễn xác định danh tính của một người, dù đi đâu cũng không thay đổi. Còn IP address không có những thuộc tính này, khi một thiết bị thay đổi mạng, IP address của nó có thể thay đổi — tức là vị trí của nó trên internet đã thay đổi.

Cuối cùng, nhớ rằng MAC address có một địa chỉ đặc biệt: FF-FF-FF-FF-FF-FF (địa chỉ toàn 1), địa chỉ này đại diện cho broadcast address.

### ⭐️ARP protocol giải quyết vấn đề gì?

ARP protocol, tên đầy đủ là **Address Resolution Protocol**, giải quyết vấn đề chuyển đổi giữa network layer address và link layer address. Vì quá trình truyền vật lý của một IP datagram, luôn cần biết hop tiếp theo (điểm đích vật lý tiếp theo) đi đâu, nhưng IP address thuộc logical address, còn MAC address mới là physical address. ARP protocol giải quyết một số vấn đề chuyển đổi IP address sang MAC address.

### Nguyên lý hoạt động của ARP protocol?

[Giải thích chi tiết ARP Protocol (Network Layer)](https://javaguide.cn/cs-basics/network/arp.html)

## Gợi ý ôn tập

Rất khuyến nghị mọi người đọc cuốn 《Illustrated HTTP》, cuốn sách không nhiều trang nhưng nội dung rất phong phú, dù để nắm vững hệ thống kiến thức mạng hay thuần túy để đối phó phỏng vấn đều rất hữu ích. Các bài viết dưới đây chỉ là tài liệu tham khảo. Khi học môn này ở năm 2 đại học, chúng tôi dùng giáo trình 《Computer Networks 7th Edition》 (Xie Xiren biên soạn), không khuyến nghị đọc giáo trình này, sách rất dày và kiến thức thiên về lý thuyết, không chắc mọi người có thể đọc hết với tâm thế bình tĩnh hay không.

## Tài liệu tham khảo

- 《Illustrated HTTP》
- 《Computer Networking: A Top-Down Approach》 (7th Edition)
- What is Internet Protocol (IP)?: <https://www.cloudflare.com/zh-cn/learning/network-layer/internet-protocol/>
- Various methods for passing real source IP - Geek Time: <https://time.geekbang.org/column/article/497864>
- What Is NAT and What Are the Benefits of NAT Firewalls?: <https://community.fs.com/blog/what-is-nat-and-what-are-the-benefits-of-nat-firewalls.html>
