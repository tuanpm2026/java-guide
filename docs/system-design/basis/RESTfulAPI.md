---
title: Hướng dẫn ngắn gọn về RESTful API
description: Giải thích chi tiết quy chuẩn thiết kế RESTful API, bao gồm nguyên tắc kiến trúc REST, thiết kế resource path, sử dụng HTTP method và quy chuẩn status code.
category: Code Quality
head:
  - - meta
    - name: keywords
      content: RESTful API,REST,API design,resource path,HTTP method,status code,idempotency,interface specification
---

Bài này nói đơn giản về kiến thức RESTful API cần thiết cho backend developer.

Trước khi bắt đầu giới thiệu chính thức về RESTful API, cần hiểu rõ trước: **API rốt cuộc là gì?**

## API là gì?

**API (Application Programming Interface)** dịch ra là giao diện lập trình ứng dụng.

Khi phát triển backend, công việc chính của chúng ta là cung cấp API cho frontend hoặc các backend service khác — ví dụ API query user data.

![](https://oss.javaguide.cn/github/javaguide/system-design/basis/20210507130629538.png)

Tuy nhiên, API không chỉ đại diện cho interface do backend system expose ra. Các method do framework cung cấp cũng thuộc phạm vi API.

Để tiện hiểu, liệt kê thêm vài ví dụ 🌰:

1. Khi bạn search sản phẩm trên trang e-commerce, frontend của trang e-commerce gọi API search sản phẩm do backend cung cấp.
2. Khi bạn dùng JDK để develop Java program và muốn đọc user input, cần dùng IO API do JDK cung cấp.
3. ……

Bạn có thể hiểu API như cầu nối giao tiếp giữa program và program — bản chất chỉ là một function. Ngoài ra, dùng API cũng không phải tùy tiện — các quy tắc của nó (như format input/output data) do bên cung cấp API quy định.

## RESTful API là gì?

**RESTful API** thường được gọi là **REST API** — là API được build dựa trên REST. REST là gì, sẽ đề cập sau — liên quan đến nhiều khái niệm.

Đọc các bài về RESTful API thường thấy khó hiểu vì một số khái niệm liên quan đến REST tương đối khó. Nhưng thực ra kiến thức RESTful API chúng ta dùng hàng ngày rất đơn giản và dễ tóm gọn!

Ví dụ: nếu tôi cho bạn hai API dưới đây, bạn có biết ngay chúng dùng để làm gì không! Đây chính là sức mạnh của RESTful API!

```plain
GET    /classes: Liệt kê tất cả lớp học
POST   /classes: Tạo mới một lớp học
```

**RESTful API giúp bạn nhìn vào URL + HTTP Method là biết URL đó dùng để làm gì, nhìn vào HTTP status code là biết kết quả request như thế nào.**

Khi thiết kế API trong quá trình phát triển, ít nhất nên đáp ứng yêu cầu cơ bản nhất của RESTful API (ví dụ: interface nên dùng noun, dùng `POST` request để tạo resource, `DELETE` request để xóa resource, v.v. Ví dụ: `GET /notes/id` — lấy thông tin note có id chỉ định).

## Giải thích REST

**REST** là viết tắt của `REpresentational State Transfer`. Dịch nghĩa là "**biểu diễn chuyển đổi trạng thái**".

Nghe khó hiểu, thực ra tên đầy đủ của REST là **Resource Representational State Transfer** — dịch thẳng là **"Tài nguyên" được "chuyển đổi trạng thái" theo một "dạng biểu diễn" nhất định trong quá trình truyền qua mạng**. Nếu vẫn chưa hiểu, hãy đọc tiếp — phần giải thích dưới đây chắc chắn sẽ giúp bạn hiểu REST là gì.

Giải thích từng khái niệm liên quan để hiểu sâu hơn. Thực ra không cần hiểu hết các khái niệm này cũng có thể hiểu phần tiếp theo. Nhưng để có thể nói chuyện tốt về "RESTful API" với người khác — khuyến nghị bạn nên hiểu kỹ!

- **Resource (Tài nguyên)**: Có thể gọi dữ liệu object thực là resource. Một resource có thể là một collection, cũng có thể là một individual entity. Ví dụ classes đại diện cho resource dạng collection, còn class cụ thể đại diện cho resource individual. Mỗi loại resource có URI (Uniform Resource Identifier) riêng. Nếu cần lấy resource đó, truy cập URI là được. Ví dụ lấy class cụ thể: `/class/12`. Resource cũng có thể chứa sub-resource, ví dụ `/classes/classId/teachers` — liệt kê tất cả thông tin giáo viên của lớp được chỉ định.
- **Representational (Dạng biểu diễn)**: "Resource" là information entity có thể có nhiều dạng biểu hiện bên ngoài. Dạng cụ thể của "resource" được trình bày như `json`, `xml`, `image`, `txt`, v.v. gọi là "representation layer/representation form" của nó.
- **State Transfer (Chuyển đổi trạng thái)**: Lần đầu thấy cụm từ này chắc nhiều người bị lúng túng? Nói thẳng ra: State Transfer trong REST mô tả nhiều hơn về trạng thái resource phía server. Ví dụ bạn thay đổi trạng thái resource qua CRUD (được triển khai bởi HTTP verb). PS: HTTP protocol là stateless protocol — tất cả trạng thái resource đều được lưu phía server.

Tổng hợp giải thích trên, tóm tắt RESTful architecture là gì:

1. Mỗi URI đại diện cho một loại resource.
2. Giữa client và server, truyền tải một dạng biểu diễn của resource này như `json`, `xml`, `image`, `txt`, v.v.
3. Client thực hiện thao tác trên server-side resource qua HTTP verb cụ thể để thực hiện "representation state transfer".

## Quy chuẩn RESTful API

![](https://oss.javaguide.cn/github/javaguide/system-design/basis/20210507154007779.png)

### Action (Hành động)

- `GET`: Request lấy specific resource từ server. Ví dụ: `GET /classes` (lấy tất cả lớp học)
- `POST`: Tạo resource mới trên server. Ví dụ: `POST /classes` (tạo lớp học)
- `PUT`: Update resource trên server (client cung cấp toàn bộ resource sau khi update). Ví dụ: `PUT /classes/12` (update lớp có mã 12)
- `DELETE`: Xóa specific resource khỏi server. Ví dụ: `DELETE /classes/12` (xóa lớp có mã 12)
- `PATCH`: Update resource trên server (client cung cấp attribute cần thay đổi — có thể coi là partial update). Ít dùng hơn nên không ví dụ ở đây.

### Path (Interface Naming)

Path còn gọi là "endpoint" — biểu thị URL cụ thể của API. Các quy chuẩn phổ biến trong phát triển thực tế:

1. **URL không được có động từ, chỉ có danh từ. Danh từ trong API cũng nên dùng số nhiều.** Vì resource trong REST thường ứng với table trong database — table trong database là "collection" của cùng loại record. Nếu API call không liên quan đến resource (như tính toán, dịch thuật, v.v.) thì có thể dùng động từ. Ví dụ: `GET /calculate?param1=11&param2=33`.
2. **Không dùng chữ hoa, khuyến nghị dùng dấu gạch ngang `-` thay vì gạch dưới `_`**. Ví dụ invitation code viết là `invitation-code` chứ không phải ~~invitation_code~~.
3. **Sử dụng tốt API versioning**. Khi API thay đổi lớn và không tương thích với phiên bản cũ, có thể versioning qua URL, ví dụ `http://api.example.com/v1`, `http://apiv1.example.com`. Version không nhất thiết phải là số — date, season đều có thể làm version identifier. Team project đồng thuận là được.
4. **Interface nên dùng noun, tránh dùng verb.** RESTful API thao tác (HTTP Method) trên resource (noun) chứ không phải action (verb).

Talk is cheap! Lấy ví dụ thực tế! Giờ có API cung cấp thông tin lớp học (class), bao gồm thông tin giáo viên và học sinh trong lớp. Path nên được thiết kế như sau:

```plain
GET    /classes: Liệt kê tất cả lớp học
POST   /classes: Tạo mới một lớp học
GET    /classes/{classId}: Lấy thông tin của lớp học được chỉ định
PUT    /classes/{classId}: Update thông tin của lớp học được chỉ định (thường cập nhật toàn bộ)
PATCH  /classes/{classId}: Update thông tin của lớp học được chỉ định (thường cập nhật một phần)
DELETE /classes/{classId}: Xóa một lớp học
GET    /classes/{classId}/teachers: Liệt kê tất cả thông tin giáo viên của lớp được chỉ định
GET    /classes/{classId}/students: Liệt kê tất cả thông tin học sinh của lớp được chỉ định
DELETE /classes/{classId}/teachers/{ID}: Xóa thông tin giáo viên chỉ định trong lớp chỉ định
```

Phản ví dụ:

```plain
/getAllclasses
/createNewclass
/deleteAllActiveclasses
```

Cần phân tích rõ cấu trúc phân cấp của resource. Ví dụ phạm vi nghiệp vụ là trường học, thì school sẽ là first-level resource: `/schools`. Teacher: `/schools/teachers`, student: `/schools/students` là second-level resource.

### Filtering (Lọc thông tin)

Nếu cần thêm điều kiện cụ thể khi query, khuyến nghị dùng dạng url parameter. Ví dụ muốn query lớp có state là active và name là guidegege:

```plain
GET    /classes?state=active&name=guidegege
```

Ví dụ thực hiện phân trang query:

```plain
GET    /classes?page=1&size=10 // Chỉ định trang 1, mỗi trang 10 data
```

### Status Codes (Mã trạng thái)

**Phạm vi status code:**

| 2xx: Thành công    | 3xx: Redirect            | 4xx: Client Error      | 5xx: Server Error   |
| ------------------ | ------------------------ | ---------------------- | ------------------- |
| 200 Thành công     | 301 Redirect vĩnh viễn   | 400 Bad Request        | 500 Server Error    |
| 201 Tạo thành công | 304 Resource chưa modify | 401 Unauthorized       | 502 Gateway Error   |
|                    |                          | 403 Forbidden          | 504 Gateway Timeout |
|                    |                          | 404 Not Found          |                     |
|                    |                          | 405 Method Not Allowed |                     |

## Đỉnh cao của RESTful là HATEOAS

> **Đỉnh cao của RESTful là HATEOAS, nhưng cơ bản không dùng trong dự án thực tế.**

Trên đây là những thứ cơ bản nhất của RESTful API — cũng là điều dễ thực hành nhất trong phát triển hàng ngày. Thực ra RESTful API tốt nhất nên đạt được Hypermedia — tức trong kết quả trả về có link trỏ đến các API method khác, giúp user không cần đọc tài liệu cũng biết bước tiếp theo nên làm gì.

Ví dụ khi user gửi request đến root directory của `api.example.com`, sẽ nhận được kết quả như thế này:

```javascript
{"link": {
  "rel":   "collection https://www.example.com/classes",
  "href":  "https://api.example.com/classes",
  "title": "List of classes",
  "type":  "application/vnd.yourformat+json"
}}
```

Code trên có property `link` trong document. User đọc property này sẽ biết bước tiếp theo gọi API nào. `rel` là mối quan hệ của API với URL hiện tại (relationship collection, kèm URL của collection đó). `href` là path của API, `title` là tiêu đề API, `type` là kiểu trả về. Thiết kế `Hypermedia API` được gọi là [HATEOAS](http://en.wikipedia.org/wiki/HATEOAS).

Trong Spring có thư viện API tên HATEOAS. Thông qua nó có thể dễ dàng tạo API đáp ứng thiết kế HATEOAS. Bài đọc liên quan:

- [Dùng HATEOAS trong Spring Boot](https://blog.aisensiy.me/2017/06/04/spring-boot-and-hateoas/)
- [Building REST services with Spring](https://spring.io/guides/tutorials/rest/) (Spring official)
- [An Intro to Spring HATEOAS](https://www.baeldung.com/spring-hateoas-tutorial)
- [spring-hateoas-examples](https://github.com/spring-projects/spring-hateoas-examples/tree/master/hypermedia)
- [Spring HATEOAS](https://spring.io/projects/spring-hateoas#learn) (Spring official)

## Tài liệu tham khảo

- <https://RESTfulapi.net/>
- <https://www.ruanyifeng.com/blog/2014/05/restful_api.html>
- <https://juejin.im/entry/59e460c951882542f578f2f0>
- <https://phauer.com/2016/testing-RESTful-services-java-best-practices/>
- <https://www.seobility.net/en/wiki/REST_API>
- <https://dev.to/duomly/rest-api-vs-graphql-comparison-3j6g>

<!-- @include: @article-footer.snippet.md -->
