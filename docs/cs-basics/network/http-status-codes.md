---
title: Tổng hợp các HTTP Status Code phổ biến (Tầng ứng dụng)
description: Tổng hợp ý nghĩa và tình huống sử dụng các HTTP status code phổ biến, nhấn mạnh các điểm dễ nhầm lẫn như 201/204, giúp nâng cao hiệu quả thiết kế và debug API.
category: Kiến thức cơ bản máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: HTTP status code,2xx,3xx,4xx,5xx,redirect,error code,201 Created,204 No Content
---

HTTP status code dùng để mô tả kết quả của HTTP request, ví dụ 2xx nghĩa là request đã được xử lý thành công.

![Các HTTP status code phổ biến](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http-status-code.png)

### 1xx Informational（Mã trạng thái thông tin）

So với các nhóm status code khác, 1xx là nhóm bạn hầu như sẽ không gặp trong thực tế, nên ở đây ta bỏ qua.

### 2xx Success（Mã trạng thái thành công）

- **200 OK**: Request được xử lý thành công. Ví dụ, gửi HTTP request truy vấn dữ liệu người dùng lên server, server trả về đúng dữ liệu. Đây là HTTP status code phổ biến nhất trong thực tế.
- **201 Created**: Request được xử lý thành công và đã tạo ~~một resource mới~~ trên server. Ví dụ, tạo một người dùng mới thông qua POST request.
- **202 Accepted**: Server đã nhận được request nhưng chưa xử lý. Ví dụ, gửi request cần server tốn nhiều thời gian xử lý (như tạo báo cáo, xuất Excel), server đã nhận nhưng chưa hoàn tất.
- **204 No Content**: Server đã xử lý thành công request nhưng không trả về nội dung gì. Ví dụ, gửi request xóa một người dùng, server xử lý thành công thao tác xóa nhưng không trả về nội dung nào.

🐛 Đính chính (xem: [issue#2458](https://github.com/Snailclimb/JavaGuide/issues/2458)): Status code 201 Created chính xác hơn là tạo một hoặc nhiều resource mới, tham khảo: <https://httpwg.org/specs/rfc9110.html#status.201>.

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/rfc9110-201-created.png)

Cần đặc biệt nhắc đến status code 204, đây là mã không thường gặp trong học tập/công việc hàng ngày.

[Mô tả status code 204 trong HTTP RFC 2616](https://tools.ietf.org/html/rfc2616#section-10.2.5) như sau:

> The server has fulfilled the request but does not need to return an
> entity-body, and might want to return updated metainformation. The
> response MAY include new or updated metainformation in the form of
> entity-headers, which if present SHOULD be associated with the
> requested variant.
>
> If the client is a user agent, it SHOULD NOT change its document view
> from that which caused the request to be sent. This response is
> primarily intended to allow input for actions to take place without
> causing a change to the user agent's active document view, although
> any new or updated metainformation SHOULD be applied to the document
> currently in the user agent's active view.
>
> The 204 response MUST NOT include a message-body, and thus is always
> terminated by the first empty line after the header fields.

Nói đơn giản, status code 204 mô tả tình huống sau khi gửi HTTP request lên server, ta chỉ quan tâm đến việc xử lý có thành công hay không. Tức là ta chỉ cần một kết quả: true/false.

Ví dụ thực tế: Bạn thích một cô gái và hỏi: "Anh có thể theo đuổi em không?", cô gái trả lời: "Được!". Nếu coi cô gái như server thì rất dễ hiểu status code 204 rồi.

### 3xx Redirection（Mã trạng thái chuyển hướng）

- **301 Moved Permanently**: Resource đã bị chuyển hướng vĩnh viễn. Ví dụ website của bạn đổi địa chỉ URL.
- **302 Found**: Resource bị chuyển hướng tạm thời. Ví dụ một số resource trên website của bạn tạm thời chuyển sang địa chỉ URL khác.

### 4xx Client Error（Mã trạng thái lỗi phía client）

- **400 Bad Request**: HTTP request gửi lên có vấn đề. Ví dụ tham số request không hợp lệ, sai HTTP method.
- **401 Unauthorized**: Truy cập resource yêu cầu xác thực mà chưa được xác thực.
- **403 Forbidden**: Từ chối thẳng HTTP request, không xử lý. Thường dùng cho các request bất hợp lệ.
- **404 Not Found**: Resource bạn yêu cầu không tìm thấy trên server. Ví dụ bạn yêu cầu thông tin của một người dùng, server không tìm thấy người dùng đó.
- **409 Conflict**: Request resource xung đột với trạng thái hiện tại của server, request không thể được xử lý.

### 5xx Server Error（Mã trạng thái lỗi phía server）

- **500 Internal Server Error**: Server gặp sự cố (thường là server bị bug). Ví dụ server xử lý request và bất ngờ throw exception nhưng exception không được xử lý đúng cách phía server.
- **502 Bad Gateway**: Gateway của chúng ta chuyển tiếp request đến server nhưng server trả về response lỗi.

### Tài liệu tham khảo

- <https://www.restapitutorial.com/httpstatuscodes.html>
- <https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status>
- <https://en.wikipedia.org/wiki/List_of_HTTP_status_codes>
- <https://segmentfault.com/a/1190000018264501>

<!-- @include: @article-footer.snippet.md -->
