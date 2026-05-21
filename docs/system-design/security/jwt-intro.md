---
title: Giải thích chi tiết khái niệm cơ bản JWT
description: Giải thích chi tiết khái niệm cơ bản JWT, bao gồm cấu trúc thành phần, thuật toán ký, nguyên lý hoạt động và ứng dụng trong login authentication của JSON Web Token.
category: System Design
tag:
  - Security
head:
  - - meta
    - name: keywords
      content: JWT,JSON Web Token,Token authentication,stateless,Header Payload Signature,signing algorithm,login authentication,CSRF
---

<!-- @include: @article-header.snippet.md -->

## JWT là gì?

JWT (JSON Web Token) là giải pháp cross-domain authentication phổ biến nhất hiện nay — một cơ chế authentication và authorization dựa trên Token. Từ tên đầy đủ của JWT có thể thấy, bản thân JWT cũng là Token — một loại Token cấu trúc JSON được chuẩn hóa.

JWT tự chứa tất cả thông tin cần thiết cho xác thực danh tính, do đó server không cần lưu trữ thông tin Session. Điều này rõ ràng tăng availability và scalability của hệ thống, giảm đáng kể áp lực cho server.

Có thể thấy, **JWT phù hợp hơn với nguyên tắc "Stateless (phi trạng thái)" khi thiết kế RESTful API**.

Hơn nữa, dùng JWT authentication có thể ngăn chặn hiệu quả tấn công CSRF vì JWT thường lưu trong localStorage và quá trình authentication bằng JWT không liên quan đến Cookie.

Trong bài [Phân tích ưu nhược điểm của JWT](./advantages-and-disadvantages-of-jwt.md) tôi đã giới thiệu chi tiết ưu điểm và nhược điểm khi dùng JWT để identity authentication.

Dưới đây là định nghĩa chính thức về JWT từ [RFC 7519](https://tools.ietf.org/html/rfc7519):

> JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties. The claims in a JWT are encoded as a JSON object that is used as the payload of a JSON Web Signature (JWS) structure or as the plaintext of a JSON Web Encryption (JWE) structure, enabling the claims to be digitally signed or integrity protected with a Message Authentication Code (MAC) and/or encrypted. ——[JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)

## JWT gồm những phần nào?

![Cấu trúc JWT](https://oss.javaguide.cn/javaguide/system-design/jwt/jwt-composition.png)

JWT về bản chất là một chuỗi ký tự, được chia thành ba phần mã hóa Base64 bởi dấu (`.`):

- **Header (Đầu)**: Mô tả metadata của JWT, định nghĩa thuật toán ký và kiểu `Token`. Header được mã hóa Base64Url thành phần đầu tiên của JWT.
- **Payload (Tải)**: Lưu dữ liệu thực tế cần truyền tải, chứa Claims (khai báo, bao gồm thông tin liên quan đến JWT) như `sub` (subject), `jti` (JWT ID). Payload được mã hóa Base64Url thành phần thứ hai của JWT.
- **Signature (Chữ ký)**: Server tạo ra từ Payload, Header và một Secret key dùng thuật toán ký được chỉ định trong Header (mặc định là HMAC SHA256). Signature được tạo ra sẽ thành phần thứ ba của JWT.

JWT thường trông như thế này: `xxxxx.yyyyy.zzzzz`.

Ví dụ:

```plain
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Có thể decode JWT trên trang web [jwt.io](https://jwt.io/). Kết quả decode là ba phần Header, Payload, Signature.

Header và Payload đều là dữ liệu JSON. Signature được tạo từ Payload, Header và Secret (key) qua công thức tính toán và thuật toán mã hóa cụ thể.

![](https://oss.javaguide.cn/javaguide/system-design/jwt/jwt.io.png)

### Header

Header thường gồm hai phần:

- `typ` (Type): Loại token — tức JWT.
- `alg` (Algorithm): Thuật toán ký, ví dụ HS256.

Ví dụ:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Header dạng JSON được convert sang mã hóa Base64 thành phần đầu tiên của JWT.

### Payload

Payload cũng là dữ liệu JSON, chứa Claims (bao gồm thông tin liên quan đến JWT).

Claims chia thành ba loại:

- **Registered Claims (Khai báo đã đăng ký)**: Một số khai báo được định nghĩa trước, khuyến nghị dùng nhưng không bắt buộc.
- **Public Claims (Khai báo public)**: JWT issuer có thể tự định nghĩa, nhưng để tránh conflict nên định nghĩa trong [IANA JSON Web Token Registry](https://www.iana.org/assignments/jwt/jwt.xhtml).
- **Private Claims (Khai báo private)**: JWT issuer tự định nghĩa theo nhu cầu project, phù hợp hơn với tình huống project thực tế.

Dưới đây là một số registered claim thường gặp:

- `iss` (issuer): JWT issuer.
- `iat` (issued at time): Thời gian JWT được tạo.
- `sub` (subject): Chủ thể JWT.
- `aud` (audience): Người nhận JWT.
- `exp` (expiration time): Thời gian hết hạn của JWT.
- `nbf` (not before time): Thời gian JWT có hiệu lực — JWT trước thời điểm này không được chấp nhận xử lý.
- `jti` (JWT ID): Định danh duy nhất của JWT.

Ví dụ:

```json
{
  "uid": "ff1212f5-d8d1-4496-bf41-d2dda73de19a",
  "sub": "1234567890",
  "name": "John Doe",
  "exp": 15323232,
  "iat": 1516239022,
  "scope": ["admin", "user"]
}
```

Phần Payload mặc định không được mã hóa — **tuyệt đối không lưu thông tin riêng tư vào Payload!!!**

Payload dạng JSON được convert sang mã hóa Base64 thành phần thứ hai của JWT.

### Signature

Phần Signature là chữ ký cho hai phần trước — có tác dụng ngăn JWT (chủ yếu là payload) bị giả mạo.

Việc tạo chữ ký này cần:

- Header + Payload.
- Secret key lưu ở server (tuyệt đối không được để lộ).
- Thuật toán ký.

Công thức tính chữ ký như sau:

```plain
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)
```

Sau khi tính ra chữ ký, ghép ba phần Header, Payload, Signature thành một string, mỗi phần phân tách bằng dấu "chấm" (`.`) — string này chính là JWT.

## Xác thực danh tính dựa trên JWT như thế nào?

Trong ứng dụng authentication dựa trên JWT, server tạo JWT từ Payload, Header và Secret key rồi gửi JWT cho client. Sau khi client nhận JWT, sẽ lưu vào Cookie hay localStorage, và tất cả request sau này của client đều mang token này.

![Sơ đồ JWT authentication](https://oss.javaguide.cn/github/javaguide/system-design/jwt/jwt-authentication%20process.png)

Các bước đơn giản hóa như sau:

1. User gửi username, password và verification code đến server để login.
2. Nếu username, password và verification code đều đúng, server trả về signed Token — tức JWT.
3. Client nhận Token và tự lưu (ví dụ vào `localStorage` của browser).
4. Mỗi lần user gửi request đến backend đều mang JWT này trong Header.
5. Server kiểm tra JWT và lấy thông tin liên quan đến user từ đó.

Hai lời khuyên:

1. Khuyến nghị lưu JWT trong localStorage thay vì Cookie — lưu trong Cookie có rủi ro CSRF.
2. Cách phổ biến để request server kèm JWT là đặt trong field `Authorization` của HTTP Header (`Authorization: Bearer Token`).

**[spring-security-jwt-guide](https://github.com/Snailclimb/spring-security-jwt-guide)** là một case đơn giản về JWT authentication — có thể tham khảo nếu quan tâm.

## Làm thế nào ngăn JWT bị giả mạo?

Với chữ ký, dù JWT bị lộ hay bị chặn, hacker cũng không thể đồng thời giả mạo Signature, Header, Payload.

Tại sao? Vì sau khi server nhận JWT, sẽ parse ra Header, Payload và Signature. Server tạo lại một Signature mới dựa trên Header, Payload và secret key. So sánh Signature mới tạo với Signature trong JWT — nếu giống nhau nghĩa là Header và Payload chưa bị sửa đổi.

Tuy nhiên, nếu secret key của server cũng bị lộ, hacker có thể đồng thời giả mạo Signature, Header, Payload. Hacker sửa trực tiếp Header và Payload rồi tạo lại Signature mới là xong.

**Bảo quản tốt secret key, tuyệt đối không để lộ. Bảo mật của JWT cốt lõi ở chữ ký, bảo mật của chữ ký cốt lõi ở secret key.**

## Làm thế nào tăng cường bảo mật JWT?

1. Dùng thuật toán mã hóa có hệ số an toàn cao.
2. Dùng thư viện open source trưởng thành, không cần reinvent the wheel.
3. Lưu JWT trong localStorage thay vì Cookie, tránh rủi ro CSRF.
4. Tuyệt đối không lưu thông tin riêng tư vào Payload.
5. Bảo quản tốt secret key, tuyệt đối không để lộ. Bảo mật JWT cốt lõi ở chữ ký, bảo mật chữ ký cốt lõi ở secret key.
6. Payload phải thêm `exp` (thời gian hết hạn JWT) — JWT có hiệu lực vĩnh viễn là không hợp lý. Và thời gian hết hạn JWT không nên quá dài.
7. ……

<!-- @include: @article-footer.snippet.md -->
