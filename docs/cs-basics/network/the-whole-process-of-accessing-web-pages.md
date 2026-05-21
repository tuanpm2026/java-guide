---
title: Toàn bộ quá trình truy cập trang web（Kết nối kiến thức）
description: Liên kết toàn bộ chuỗi từ nhập URL đến render trang web, bao gồm DNS, TCP, HTTP và tải tài nguyên tĩnh, giúp hiểu sâu cho phỏng vấn và thực tiễn.
category: Kiến thức cơ bản máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: quá trình truy cập trang web,DNS,thiết lập TCP,HTTP request,tải tài nguyên,render,đóng kết nối
---

Trong các buổi phỏng vấn vị trí developer, kiến thức mạng máy tính luôn được hỏi nhiều. Nhưng nếu phỏng vấn viên chỉ hỏi một câu mà bao quát nhiều điểm kiến thức nhất, thì có lẽ đó là **toàn bộ quá trình duyệt web**. Bài này sẽ đưa bạn đi từ đầu đến cuối câu hỏi phỏng vấn "cũ nát" này — phải thuộc!

Tổng thể, mô hình giao tiếp mạng có thể biểu diễn bằng hình dưới — nghĩa là chỉ cần thuộc mô hình 5 tầng mạng, theo hệ thống này, nhiều điểm kiến thức sẽ tự nhiên kết nối. Quá trình truy cập trang web cũng vậy.

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/five-layers.png)

Trước khi bắt đầu, hãy lướt qua nhanh toàn bộ quy trình:

1. Nhập URL của trang web muốn truy cập vào trình duyệt.
2. Trình duyệt dùng giao thức DNS để lấy địa chỉ IP tương ứng với tên miền.
3. Trình duyệt dựa trên địa chỉ IP và số cổng, gửi request kết nối TCP đến server đích.
4. Trình duyệt gửi HTTP request message lên server qua kết nối TCP, yêu cầu lấy nội dung trang web.
5. Server nhận HTTP request message, xử lý và trả HTTP response message về cho trình duyệt.
6. Trình duyệt nhận HTTP response message, parse HTML code trong response body, render cấu trúc và style trang web; đồng thời dựa trên URL của các tài nguyên khác trong HTML (như ảnh, CSS, JS, v.v.) gửi thêm HTTP request để lấy nội dung các tài nguyên đó, cho đến khi trang web tải xong hoàn toàn.
7. Khi trình duyệt không cần giao tiếp với server nữa, có thể chủ động đóng kết nối TCP, hoặc chờ server đóng.

## Tầng ứng dụng

Mọi thứ bắt đầu — mở trình duyệt, nhập URL vào thanh địa chỉ, nhấn Enter. Vậy URL là gì? Truy cập URL có tác dụng gì?

Mở trình duyệt, nhập URL vào thanh địa chỉ và nhấn Enter. Việc đầu tiên trình duyệt làm không phải là gửi request, mà là parse URL và kiểm tra xem có thể sử dụng trực tiếp cache cục bộ không.

URL (Uniform Resource Locators — Định vị tài nguyên thống nhất) là công cụ định vị mọi tài nguyên trên mạng. Mỗi file tương ứng với một URL, giống như đường dẫn địa chỉ. Về lý thuyết, tài nguyên file và URL là quan hệ một-một. Thực tế cũng có ngoại lệ, ví dụ một số URL trỏ đến file đã được chuyển hướng sang vị trí khác, dẫn đến nhiều URL trỏ đến cùng một file.

### Cấu trúc URL

![Cấu trúc URL](https://oss.javaguide.cn/github/javaguide/cs-basics/network/URL-parts.png)

1. **Giao thức**: Tiền tố URL thường cho biết địa chỉ web đó dùng giao thức tầng ứng dụng nào, thường có hai loại — HTTP và HTTPS. Tất nhiên cũng có một số tiền tố ít phổ biến hơn, ví dụ `ftp:` dùng khi truyền file.
2. **Tên miền**: Tên miền là tên thông dụng để truy cập địa chỉ web. Ở đây cũng có thể là địa chỉ IP của trang web. Tên miền có thể hiểu là phiên bản dễ đọc của địa chỉ IP, vì hầu hết mọi người không muốn nhớ địa chỉ IP của một trang web.
3. **Cổng**: Nếu chỉ định cổng truy cập, cổng sẽ đứng ngay sau tên miền, phân tách bằng dấu hai chấm.
4. **Đường dẫn tài nguyên**: Ngay sau tên miền (cổng) là đường dẫn tài nguyên, bắt đầu từ `/` đầu tiên, biểu thị đường dẫn file từ thư mục root của server. Trong hình trên, file cần truy cập là `/path/to/myfile.html` dưới thư mục root server. Thiết kế ban đầu là file thường được lưu vật lý trên server host, nhưng giờ đây với sự tiến bộ của công nghệ mạng, file không nhất thiết phải lưu vật lý trên server host, có thể lưu trên cloud, và đường dẫn file cũng có thể là ảo (tuân theo một quy tắc nhất định).
5. **Tham số**: Tham số là các thông tin kèm theo trong URL khi trình duyệt gửi request đến server. Server sẽ trích xuất các tham số này khi parse request. Tham số có dạng key-value `key=value`, các cặp key-value phân tách bằng `&`. Ý nghĩa cụ thể của tham số liên quan đến phương thức thao tác request cụ thể.
6. **Anchor (Điểm neo)**: Anchor đúng như tên gọi, là một điểm neo trên trang được truy cập. Hầu hết các trang cần truy cập đều dài hơn một trang; nếu chỉ định anchor, khi hiển thị trang web phía client sẽ định vị đến vị trí anchor, tương đương một bookmark nhỏ. Đáng chú ý là trong URL, anchor bắt đầu bằng `#` và **không** được gửi như một phần của request đến server.

Sau khi nhập URL, nhân vật chính đầu tiên xuất hiện — DNS server phân giải tên miền. DNS (Domain Name System — Hệ thống tên miền) giải quyết vấn đề **ánh xạ tên miền và địa chỉ IP**. Vì tên miền chỉ là cái tên dễ nhớ của địa chỉ web, còn địa chỉ thực sự tồn tại của web là địa chỉ IP.

Xem thêm: [Giải thích chi tiết DNS — Hệ thống tên miền](https://javaguide.cn/cs-basics/network/dns.html)

1. **Strong cache (Cache mạnh)**: Kiểm tra header `Cache-Control` (ví dụ `max-age`) hoặc `Expires`, xác định cache có còn trong thời hạn hiệu lực không. Nếu còn hiệu lực, sử dụng trực tiếp cache, bỏ qua tất cả các network request phía sau.
2. **Negotiation cache (Cache thương lượng)**: Khi strong cache miss, trình duyệt gửi validation request đến server (mang theo `If-Modified-Since` hoặc `If-None-Match`), server xác định tài nguyên có thay đổi không. Nếu không thay đổi, trả về `304 Not Modified`, trình duyệt tiếp tục dùng cache cục bộ; nếu đã thay đổi, trả về `200 OK` và tài nguyên mới.

Sau khi dùng DNS lấy được địa chỉ IP của host đích, trình duyệt có thể gửi HTTP message đến địa chỉ IP đích để request tài nguyên cần thiết. Ở đây, tùy thuộc vào trang web đích, request message có thể dùng giao thức HTTP hoặc HTTPS có tính bảo mật cao hơn.

Xem thêm:

- [HTTP vs HTTPS（Tầng ứng dụng）](https://javaguide.cn/cs-basics/network/http-vs-https.html)
- [HTTP 1.0 vs HTTP 1.1（Tầng ứng dụng）](https://javaguide.cn/cs-basics/network/http1.0-vs-http1.1.html)
- [Tổng hợp các HTTP Status Code phổ biến](https://javaguide.cn/cs-basics/network/http-status-codes.html)

## Tầng vận chuyển

Vì giao thức HTTP dựa trên TCP, sau khi dữ liệu tầng ứng dụng được đóng gói xong, sẽ được chuyển cho tầng vận chuyển để tiếp tục đóng gói qua TCP.

Giao thức TCP đảm bảo độ tin cậy của truyền dữ liệu, là giao thức chủ đạo cho truyền tải gói tin.

Xem thêm:

- [TCP bắt tay 3 lần và vẫy tay 4 lần（Tầng vận chuyển）](https://javaguide.cn/cs-basics/network/tcp-connection-and-disconnection.html)
- [Đảm bảo độ tin cậy truyền tải TCP（Tầng vận chuyển）](https://javaguide.cn/cs-basics/network/tcp-reliability-guarantee.html)

## Tầng mạng

Cuối cùng đến tầng mạng. Lúc này host của chúng ta không còn tương tác với host khác nữa, mà tương tác với các hệ thống trung gian. Tức là tầng ứng dụng và tầng vận chuyển đều là giao thức end-to-end, còn tầng mạng trở xuống là giao thức của các middleware.

**Chức năng cốt lõi của tầng mạng — chuyển tiếp (forwarding) và định tuyến (routing)** — phải thuộc! Nếu phỏng vấn viên hỏi về tầng mạng mà bạn không biết gì, ít nhất cũng phải nói được năm chữ này — **chuyển tiếp và định tuyến**.

- **Forwarding (Chuyển tiếp)**: Chuyển packet từ cổng input của router sang cổng output phù hợp.
- **Routing (Định tuyến)**: Xác định đường đi của packet từ nguồn đến đích.

Vậy đến đây, gói tin của chúng ta đã được đóng gói qua tầng ứng dụng và tầng vận chuyển, đến tầng mạng, cuối cùng chuẩn bị truyền ở tầng vật lý. Vấn đề đầu tiên cần giải quyết là — **gửi đến đâu? Hay nói cách khác, cần gửi gói tin đến router nào?** Đây chính là vấn đề giao thức BGP giải quyết.
