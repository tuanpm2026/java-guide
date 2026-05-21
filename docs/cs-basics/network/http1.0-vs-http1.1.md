---
title: HTTP 1.0 vs HTTP 1.1（Tầng ứng dụng）
description: So sánh chi tiết sự khác biệt giữa HTTP/1.0 và HTTP/1.1, bao gồm persistent connection, pipelining, cache và cải tiến status code, cùng ảnh hưởng thực tiễn.
category: Kiến thức cơ bản máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: HTTP/1.0,HTTP/1.1,persistent connection,pipelining,cache,status code,Host,tối ưu băng thông
---

Bài này so sánh HTTP 1.0 và HTTP 1.1 theo các khía cạnh sau:

- Response status code
- Xử lý cache
- Phương thức kết nối
- Xử lý Host header
- Tối ưu băng thông

## Response Status Code

HTTP/1.0 chỉ định nghĩa 16 status code. HTTP/1.1 bổ sung thêm nhiều status code, riêng error response status code đã thêm 24 loại. Ví dụ: `100 (Continue)` — request khởi động trước khi request tài nguyên lớn; `206 (Partial Content)` — mã định danh cho range request; `409 (Conflict)` — request xung đột với quy định của tài nguyên hiện tại; `410 (Gone)` — tài nguyên đã chuyển vĩnh viễn và không có địa chỉ chuyển tiếp nào được biết.

## Xử lý Cache

Công nghệ cache giúp tiết kiệm lượng lớn băng thông mạng và giảm độ trễ nhận thông tin của người dùng bằng cách tránh tương tác thường xuyên giữa người dùng và origin server.

### HTTP/1.0

Cơ chế cache của HTTP/1.0 khá đơn giản. Server dùng thẻ `Expires` để đánh dấu (thời gian) một response body; các request trong khoảng thời gian `Expires` đều lấy cache response body đó. Trong response body lần đầu server gửi cho client, có thẻ `Last-Modified` đánh dấu lần sửa đổi cuối cùng của tài nguyên được yêu cầu trên server. Trong request header, dùng thẻ `If-Modified-Since` đánh dấu một mốc thời gian, ý nghĩa là client hỏi server: "Sau thời điểm này, tài nguyên tôi muốn request có bị sửa đổi không?" Thông thường, giá trị `If-Modified-Since` trong request header chính là giá trị `Last-Modified` trong response body khi lần trước lấy tài nguyên đó.

Nếu server nhận request header và đánh giá rằng sau thời điểm `If-Modified-Since`, tài nguyên thực sự không bị sửa đổi, thì trả lại cho client response header `304 not modified`, ý nghĩa là "cache vẫn dùng được, lấy từ trình duyệt đi!".

Nếu server đánh giá rằng sau thời điểm `If-Modified-Since`, tài nguyên đã bị sửa đổi, thì trả lại cho client response body `200 OK` kèm nội dung tài nguyên mới, ý nghĩa là "cái bạn muốn tôi đã sửa rồi, đây là bản mới".

![HTTP1.0cache1](./images/http-vs-https/HTTP1.0cache1.png)

![HTTP1.0cache2](./images/http-vs-https/HTTP1.0cache2.png)

### HTTP/1.1

Cơ chế cache của HTTP/1.1 trên nền tảng HTTP/1.0, bổ sung thêm nhiều tính linh hoạt và khả năng mở rộng. Nguyên lý hoạt động cơ bản giữ nguyên như HTTP/1.0, nhưng thêm nhiều tính năng chi tiết hơn. Trong đó, tính năng phổ biến nhất trong request header là `Cache-Control`, xem chi tiết tại MDN Web Docs [Cache-Control](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cache-Control).

## Phương thức kết nối

**HTTP/1.0 mặc định dùng short connection (kết nối ngắn)**, tức là mỗi lần client và server thực hiện một thao tác HTTP thì thiết lập một kết nối, xong nhiệm vụ thì ngắt kết nối. Khi trình duyệt client truy cập một trang HTML hoặc trang Web khác có chứa các tài nguyên Web khác (như file JavaScript, file ảnh, file CSS, v.v.), mỗi khi gặp một tài nguyên Web như vậy, trình duyệt lại thiết lập một kết nối TCP mới, dẫn đến rất nhiều "handshake segment" và "wave segment" chiếm dụng băng thông.

**Để giải quyết vấn đề lãng phí tài nguyên của HTTP/1.0, HTTP/1.1 tối ưu thành mặc định dùng persistent connection (kết nối dài).** Request header ở chế độ persistent connection sẽ thông báo cho server: "Tôi request kết nối với bạn, và sau khi kết nối thành công, xin đừng đóng." Do đó kết nối TCP này sẽ tiếp tục mở, phục vụ cho các tương tác dữ liệu tiếp theo giữa client và server. Tức là khi dùng persistent connection, sau khi tải xong một trang web, kết nối TCP giữa client và server dùng để truyền dữ liệu HTTP sẽ không bị đóng, khi client truy cập server này lại, sẽ tiếp tục dùng kết nối đã thiết lập này.

Nếu kết nối TCP luôn giữ nguyên cũng là lãng phí tài nguyên, do đó một số phần mềm server (như Apache) còn hỗ trợ cấu hình thời gian timeout. Nếu trong khoảng thời gian timeout không có request mới đến, kết nối TCP mới bị đóng.

Cần nói rõ: HTTP/1.0 vẫn cung cấp tùy chọn persistent connection bằng cách thêm `Connection: Keep-alive` vào request header. Tương tự, trong HTTP/1.1, nếu không muốn dùng persistent connection, cũng có thể thêm `Connection: close` vào request header để thông báo cho server: "Tôi không cần persistent connection, kết nối xong có thể đóng."

**Persistent connection và short connection của HTTP thực chất là persistent connection và short connection của TCP.**

**Cần cả client và server đều hỗ trợ persistent connection mới thực hiện được.**

## Xử lý Host Header

DNS cho phép nhiều hostname được bind vào cùng một địa chỉ IP, nhưng HTTP/1.0 không xem xét vấn đề này. Giả sử có URL tài nguyên là `http://example1.org/home.html`, trong request của HTTP/1.0, request sẽ là `GET /home.html HTTP/1.0` — tức là không kèm theo hostname. Message như vậy gửi đến server, server không hiểu được URL thực sự mà client muốn request.

Do đó, HTTP/1.1 bổ sung trường `Host` vào request header. Request header với trường `Host` sẽ là:

```plain
GET /home.html HTTP/1.1
Host: example1.org
```

Như vậy, server có thể xác định được URL thực sự mà client muốn request.

## Tối ưu băng thông

### Range Request

HTTP/1.1 giới thiệu cơ chế range request để tránh lãng phí băng thông. Khi client muốn request một phần của file, hoặc cần tiếp tục tải một file đã tải một phần nhưng bị ngắt, HTTP/1.1 có thể thêm header `Range` vào request để chỉ request (và chỉ request được dữ liệu kiểu byte) một phần của dữ liệu. Server có thể bỏ qua header `Range` hoặc trả về một vài Range response.

Status code `206 (Partial Content)` chủ yếu nhằm đảm bảo client và proxy server có thể nhận dạng chính xác partial content response, tránh nhầm tưởng là tài nguyên đầy đủ và cache sai. Điều này rất quan trọng cho việc xử lý range request và quản lý cache đúng đắn.

Một ví dụ range request HTTP/1.1 điển hình:

```bash
# Lấy 1024 byte đầu tiên của file
GET /z4d4kWk.jpg HTTP/1.1
Host: i.imgur.com
Range: bytes=0-1023
```

Response `206 Partial Content`:

```bash

HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1023/146515
Content-Length: 1024
…
（nội dung nhị phân）
```

Giải thích ngắn gọn các trường trong HTTP range response header:

- **Header `Content-Range`**: Chỉ ra vị trí của dữ liệu trả về trong toàn bộ tài nguyên, bao gồm byte bắt đầu, byte kết thúc và tổng độ dài tài nguyên. Ví dụ, `Content-Range: bytes 0-1023/146515` cho biết server trả về dữ liệu từ byte 0 đến 1023 (tổng 1024 byte), trong khi tổng độ dài toàn bộ tài nguyên là 146.515 byte.
- **Header `Content-Length`**: Chỉ ra số byte thực tế được truyền trong response này. Ví dụ, `Content-Length: 1024` cho biết server đã truyền 1024 byte dữ liệu.

Header `Range` không chỉ có thể request một phạm vi byte đơn lẻ mà còn có thể request nhiều phạm vi cùng lúc. Cách này gọi là "multiple range request".

Client muốn lấy byte 0 đến 499 và byte 1000 đến 1499 của tài nguyên:

```bash
GET /path/to/resource HTTP/1.1
Host: example.com
Range: bytes=0-499,1000-1499
```

Server trả về nhiều phạm vi byte, nội dung mỗi phạm vi được phân tách bằng separator:

```bash
HTTP/1.1 206 Partial Content
Content-Type: multipart/byteranges; boundary=3d6b6a416f9b5
Content-Length: 376

--3d6b6a416f9b5
Content-Type: application/octet-stream
Content-Range: bytes 0-99/2000

(khối dữ liệu byte 0 đến 99)

--3d6b6a416f9b5
Content-Type: application/octet-stream
Content-Range: bytes 500-599/2000

(khối dữ liệu byte 500 đến 599)

--3d6b6a416f9b5
Content-Type: application/octet-stream
Content-Range: bytes 1000-1099/2000

(khối dữ liệu byte 1000 đến 1099)

--3d6b6a416f9b5--
```

### Status Code 100

HTTP/1.1 bổ sung status code `100`. Tình huống sử dụng status code này là: với một số request file lớn, server có thể không muốn response request đó. Lúc này status code `100` có thể dùng làm tín hiệu cho biết request có được response bình thường không, quy trình như hình dưới:

![HTTP1.1continue1](./images/http-vs-https/HTTP1.1continue1.png)

![HTTP1.1continue2](./images/http-vs-https/HTTP1.1continue2.png)

Tuy nhiên trong HTTP/1.0, không có status code `100 (Continue)`. Để kích hoạt cơ chế này, có thể gửi header `Expect` với giá trị `100-continue`.

### Nén

Nhiều định dạng dữ liệu sẽ được nén trước khi truyền. Nén dữ liệu có thể tối ưu đáng kể hiệu quả sử dụng băng thông. Tuy nhiên, HTTP/1.0 cung cấp ít tùy chọn nén dữ liệu, không hỗ trợ chọn chi tiết nén, cũng không thể phân biệt giữa nén end-to-end hay nén hop-by-hop.

HTTP/1.1 phân biệt rõ ràng content encoding và transfer encoding. Content encoding luôn là end-to-end, transfer encoding luôn là hop-by-hop.

HTTP/1.0 bao gồm header `Content-Encoding`, mã hóa message theo kiểu end-to-end. HTTP/1.1 bổ sung header `Transfer-Encoding`, có thể mã hóa message theo kiểu hop-by-hop. HTTP/1.1 còn bổ sung header `Accept-Encoding` để client chỉ ra loại content encoding nó có thể xử lý.

## Tổng kết

1. **Phương thức kết nối**: HTTP 1.0 dùng short connection, HTTP 1.1 hỗ trợ persistent connection.
2. **Response status code**: HTTP/1.1 bổ sung thêm nhiều status code, riêng error response status code đã thêm 24 loại. Ví dụ: `100 (Continue)` — request khởi động trước khi request tài nguyên lớn; `206 (Partial Content)` — mã định danh range request; `409 (Conflict)` — request xung đột với tài nguyên hiện tại; `410 (Gone)` — tài nguyên đã chuyển vĩnh viễn.
3. **Xử lý cache**: HTTP 1.0 chủ yếu dùng `If-Modified-Since`, `Expires` trong header làm tiêu chuẩn đánh giá cache. HTTP 1.1 giới thiệu nhiều chiến lược kiểm soát cache hơn như Entity tag, `If-Unmodified-Since`, `If-Match`, `If-None-Match` và nhiều cache header có thể chọn khác để kiểm soát chiến lược cache.
4. **Tối ưu băng thông và sử dụng kết nối mạng**: HTTP 1.0 có một số hiện tượng lãng phí băng thông, ví dụ client chỉ cần một phần của đối tượng nhưng server gửi toàn bộ, và không hỗ trợ tiếp tục tải từ điểm dừng. HTTP 1.1 bổ sung header `range` trong request header, cho phép chỉ request một phần tài nguyên — tức response code là 206 (Partial Content), giúp developer thoải mái lựa chọn để tận dụng đầy đủ băng thông và kết nối.
5. **Xử lý Host header**: HTTP/1.1 bổ sung trường `Host` vào request header.

## Tài liệu tham khảo

[Key differences between HTTP/1.0 and HTTP/1.1](http://www.ra.ethz.ch/cdstore/www8/data/2136/pdf/pd1.pdf)

<!-- @include: @article-footer.snippet.md -->
