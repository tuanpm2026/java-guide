---
title: Tổng hợp các giao thức tầng ứng dụng phổ biến（Tầng ứng dụng）
description: Tổng hợp các khái niệm cốt lõi và tình huống điển hình của các giao thức tầng ứng dụng phổ biến, trọng tâm so sánh mô hình giao tiếp và giới hạn khả năng của HTTP và WebSocket.
category: Kiến thức cơ bản máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: application layer protocol,HTTP,WebSocket,DNS,SMTP,FTP,features,scenarios
---

## HTTP: HyperText Transfer Protocol

**HTTP (HyperText Transfer Protocol — Giao thức truyền tải siêu văn bản)** là giao thức dùng để truyền tải siêu văn bản và nội dung multimedia, chủ yếu được thiết kế cho giao tiếp giữa trình duyệt Web và Web server. Khi chúng ta dùng trình duyệt để duyệt web, trang web được load qua HTTP request.

HTTP dùng mô hình client-server. Client gửi HTTP Request (yêu cầu) đến server, server respond và trả về HTTP Response (phản hồi). Toàn bộ quá trình như hình dưới.

这篇文章主要回答几个问题：

HTTP protocol dựa trên TCP protocol. Trước khi gửi HTTP request phải thiết lập kết nối TCP tức phải trải qua 3 lần bắt tay. Hầu hết HTTP protocol hiện đang dùng là 1.1. Trong protocol 1.1, Keep-Alive mặc định được bật — kết nối được thiết lập có thể tái sử dụng qua nhiều request.

Ngoài ra, HTTP protocol là protocol "stateless" (phi trạng thái) — không thể ghi lại trạng thái của client user. Thông thường chúng ta dùng Session để ghi lại trạng thái client user.

## WebSocket: Full-duplex Communication Protocol

WebSocket là full-duplex communication protocol dựa trên TCP connection — tức client và server có thể cùng lúc gửi và nhận data.

WebSocket protocol ra đời năm 2008, trở thành tiêu chuẩn quốc tế năm 2011. Hầu hết các phiên bản trình duyệt chính luồng mới hơn đều hỗ trợ giao thức này. Tuy nhiên WebSocket không chỉ dùng được trong browser-based application — nhiều ngôn ngữ lập trình, framework và server đều cung cấp WebSocket support.

Về bản chất WebSocket protocol là giao thức tầng ứng dụng, dùng để bù đắp thiếu sót của HTTP protocol về khả năng persistent communication. Client và server chỉ cần một lần handshake là có thể tạo kết nối persistent và truyền data hai chiều.

![Sơ đồ WebSocket](https://oss.javaguide.cn/github/javaguide/system-design/web-real-time-message-push/1460000042192394.png)

Dưới đây là các tình huống ứng dụng phổ biến của WebSocket:

- Video danmaku (bình luận bay)
- Real-time message push — xem bài [Web Real-time Message Push Explained](https://javaguide.cn/system-design/web-real-time-message-push.html)
- Real-time game battle
- Multi-user collaborative editing
- Social chat
- ……

Quá trình hoạt động của WebSocket có thể chia thành các bước sau:

1. Client gửi HTTP request đến server, request header chứa các field như `Upgrade: websocket` và `Sec-WebSocket-Key`, yêu cầu nâng cấp protocol lên WebSocket.
2. Server nhận request này, thực hiện upgrade protocol. Nếu hỗ trợ WebSocket sẽ reply HTTP 101 status code, response header chứa `Connection: Upgrade` và `Sec-WebSocket-Accept: xxx`, v.v. biểu thị đã nâng cấp thành công lên WebSocket protocol.
3. Client và server thiết lập kết nối WebSocket, có thể truyền data hai chiều. Data được truyền dưới dạng frame. Mỗi message của WebSocket có thể bị chia thành nhiều data frame (đơn vị nhỏ nhất). Sender sẽ cắt message thành nhiều frame gửi cho receiver. Receiver nhận message frame và reassemble các frame liên quan thành message hoàn chỉnh.
4. Client hoặc server có thể chủ động gửi close frame, biểu thị muốn ngắt kết nối. Bên kia nhận xong cũng reply close frame, sau đó cả hai đóng kết nối TCP.

Ngoài ra, sau khi thiết lập kết nối WebSocket, dùng heartbeat mechanism để duy trì tính ổn định và hoạt động của kết nối.

## SMTP: Simple Mail Transfer Protocol

**SMTP (Simple Mail Transfer Protocol — Giao thức truyền tải mail đơn giản)** dựa trên TCP protocol, là giao thức dùng để gửi email.

![SMTP Protocol](https://oss.javaguide.cn/github/javaguide/cs-basics/network/what-is-smtp.png)

Lưu ý ⚠️: **Giao thức nhận mail không phải SMTP mà là POP3.**

Phần SMTP protocol có khá nhiều nội dung. Hai câu hỏi sau khá quan trọng:

1. Quá trình gửi email.
2. Làm thế nào xác định email có thực sự tồn tại không?

**Quá trình gửi email?**

Ví dụ email của tôi là "dabai@cszhinan.com", tôi muốn gửi email đến "xiaoma@qq.com". Toàn bộ quá trình có thể chia đơn giản thành các bước sau:

1. Qua giao thức **SMTP**, tôi giao email đã viết cho 163 mail server (bưu điện).
2. 163 mail server phát hiện email tôi gửi đến là qq mail, dùng giao thức SMTP để forward email đến qq mail server.
3. qq mail server nhận email xong sẽ thông báo cho user có email "xiaoma@qq.com" đến lấy mail. Sau đó user dùng giao thức **POP3/IMAP** để lấy email ra.

**Làm thế nào xác định email có thực sự tồn tại?**

Trong nhiều tình huống (như email marketing), chúng ta cần xác định xem địa chỉ email cần gửi có thực sự tồn tại không. Lúc này có thể dùng giao thức SMTP để check:

1. Tìm địa chỉ SMTP server tương ứng với domain name của email.
2. Thử thiết lập kết nối với server.
3. Sau khi kết nối thành công, thử gửi email đến địa chỉ email cần verify.
4. Xác định tính xác thực của địa chỉ email dựa trên kết quả trả về.

Một số công cụ check email online được khuyến nghị:

1. <https://verify-email.org/>
2. <http://tool.chacuo.net/mailverify>
3. <https://www.emailcamel.com/>

## POP3/IMAP: Giao thức nhận mail

Hai giao thức này không cần nói nhiều. Chỉ cần biết **POP3 và IMAP đều là giao thức chịu trách nhiệm nhận mail** (cả hai đều dựa trên TCP protocol). Ngoài ra cần chú ý không nhầm lẫn hai cái này với giao thức SMTP. **SMTP chỉ chịu trách nhiệm gửi mail — giao thức thực sự chịu trách nhiệm nhận là POP3/IMAP.**

IMAP là giao thức mới hơn POP3, mạnh hơn về cả tính năng lẫn hiệu năng. IMAP hỗ trợ tìm kiếm, đánh dấu, phân loại, lưu trữ email và đồng bộ trạng thái email trên nhiều thiết bị. Hầu hết các email client và server hiện đại đều hỗ trợ IMAP.

## FTP: File Transfer Protocol

**Giao thức FTP** dựa trên TCP protocol, là giao thức dùng để truyền file giữa các máy tính, có thể che giấu sự khác biệt về OS và phương thức lưu trữ file.

FTP được thiết kế dựa trên mô hình client-server (C/S). Client và FTP server thiết lập hai kết nối. Nếu muốn phát triển phần mềm truyền file dựa trên giao thức FTP, trước tiên cần hiểu rõ nguyên lý FTP. Nhiều sách đã mô tả rất chi tiết:

> Ưu điểm độc đáo của FTP đồng thời cũng là điểm khác biệt lớn nhất so với các chương trình client-server khác là nó dùng hai kết nối TCP giữa hai host giao tiếp (các chương trình client-server khác thường chỉ có một kết nối TCP):
>
> 1. Control connection: Dùng để truyền thông tin điều khiển (command và response).
> 2. Data connection: Dùng để truyền data.
>
> Tư tưởng tách riêng command và data để truyền này cải thiện đáng kể hiệu quả của FTP.

![Quá trình hoạt động FTP](https://oss.javaguide.cn/github/javaguide/cs-basics/network/ftp.png)

Lưu ý ⚠️: FTP là giao thức không an toàn vì không mã hóa data trong quá trình truyền. Do đó file truyền qua FTP có thể bị nghe lén hoặc giả mạo. Khuyến nghị dùng giao thức an toàn hơn như SFTP (SSH File Transfer Protocol — giao thức truyền file an toàn dựa trên SSH, dùng để truyền file an toàn trên mạng) khi truyền data nhạy cảm.

## Telnet: Remote Login Protocol

**Giao thức Telnet** dựa trên TCP protocol, dùng để đăng nhập vào server khác qua một terminal. Một trong những nhược điểm lớn nhất của Telnet là tất cả data (bao gồm username và password) đều được gửi dưới dạng plain text — có rủi ro bảo mật tiềm ẩn. Đây là lý do tại sao ngày nay ít dùng Telnet mà chuyển sang dùng giao thức truyền tải mạng rất an toàn gọi là SSH.

![Telnet: Remote Login Protocol](https://oss.javaguide.cn/github/javaguide/cs-basics/network/Telnet_is_vulnerable_to_eavesdropping-2.png)

## SSH: Secure Network Transfer Protocol

**SSH (Secure Shell)** dựa trên TCP protocol, thực hiện truy cập an toàn và truyền file thông qua cơ chế mã hóa và xác thực.

SSH được dùng điển hình để đăng nhập vào máy tính từ xa và thực thi command. Ngoài ra SSH cũng hỗ trợ tunnel protocol, port mapping và X11 connection (cho phép user chạy graphical application trên remote server tại máy cục bộ). Qua giao thức SFTP (SSH File Transfer Protocol) hoặc SCP (Secure Copy Protocol), SSH còn có thể truyền file an toàn.

SSH dùng mô hình client-server, cổng mặc định là 22. SSH là daemon, chịu trách nhiệm lắng nghe real-time request từ client và xử lý. Hầu hết OS hiện đại đều cung cấp SSH.

Như hình dưới, SSH Client và SSH Server trao đổi public key để sinh shared symmetric encryption key, dùng cho các giao tiếp mã hóa tiếp theo.

![SSH: Secure Network Transfer Protocol](https://oss.javaguide.cn/github/javaguide/cs-basics/network/ssh-client-server.png)

## RTP: Real-time Transport Protocol

RTP (Real-time Transport Protocol — Giao thức truyền tải thời gian thực) thường dựa trên UDP protocol nhưng cũng hỗ trợ TCP. Nó cung cấp chức năng truyền data thời gian thực end-to-end, nhưng không bao gồm đặt trước tài nguyên, không đảm bảo chất lượng truyền tải thời gian thực — các chức năng này do WebRTC triển khai.

RTP protocol chia thành hai sub-protocol:

- **RTP (Real-time Transport Protocol)**: Truyền data có tính real-time.
- **RTCP (RTP Control Protocol)**: Cung cấp thông tin thống kê trong quá trình truyền tải thời gian thực (như network latency, packet loss rate, v.v.). WebRTC dựa trên thông tin này để xử lý packet loss.

## DNS: Domain Name System

DNS (Domain Name System — Hệ thống tên miền) thường dựa trên UDP protocol (cổng 53), dùng để giải quyết vấn đề ánh xạ domain name và IP address. Khi response data vượt giới hạn UDP hay thực hiện zone transfer sẽ chuyển sang TCP.

![DNS: Domain Name System](https://oss.javaguide.cn/github/javaguide/cs-basics/network/dns-overview.png)

## Tài liệu tham khảo

- 《Computer Networking: A Top-Down Approach》(7th Edition)
- Giới thiệu giao thức RTP: <https://mthli.xyz/rtp-introduction/>
