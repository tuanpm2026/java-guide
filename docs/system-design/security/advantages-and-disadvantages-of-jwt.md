---
title: Phân tích ưu nhược điểm của JWT Authentication
description: Phân tích sâu ưu nhược điểm của JWT authentication, giải thích các vấn đề như JWT không thể chủ động expire, Token renewal và giải pháp tương ứng.
category: System Design
tag:
  - Security
head:
  - - meta
    - name: keywords
      content: JWT,Token authentication,stateless authentication,JWT disadvantages,refresh token,logout invalidation,security risk,alternative solution
---

Trong phỏng vấn campus recruit, hầu hết ứng viên dùng JWT cho phần authentication login. Hỏi về khái niệm JWT và lý do dùng JWT thì cơ bản đều trả lời được chút ít. Nhưng khi hỏi về một số vấn đề của JWT và giải pháp thì chỉ một phần nhỏ trả lời được tốt.

JWT không phải silver bullet — cũng có nhiều nhược điểm, nhiều khi không phải lựa chọn tối ưu. Bài này cùng nhau tìm hiểu ưu nhược điểm của JWT authentication và cách giải quyết các vấn đề phổ biến — xem tại sao nhiều người không còn khuyến nghị dùng JWT nữa.

Về giới thiệu khái niệm cơ bản JWT xem bài tôi viết: [Giải thích chi tiết khái niệm cơ bản JWT](https://javaguide.cn/system-design/security/jwt-intro.html).

## Ưu điểm của JWT

So với cách Session authentication, dùng JWT để authentication chủ yếu có 4 ưu điểm sau.

### Stateless (Phi trạng thái)

JWT tự chứa tất cả thông tin cần thiết cho xác thực danh tính, do đó server không cần lưu thông tin JWT. Điều này rõ ràng tăng availability và scalability của hệ thống, giảm đáng kể áp lực cho server.

Tuy nhiên, cũng chính vì JWT là stateless nên dẫn đến nhược điểm lớn nhất của nó: **không thể kiểm soát!**

Ví dụ khi muốn vô hiệu hóa một JWT hay thay đổi quyền của nó trong thời gian hiệu lực — điều này không có hiệu lực ngay lập tức, thường phải chờ đến khi hết hạn. Hoặc khi user Logout, JWT vẫn còn hiệu lực. Trừ khi chúng ta thêm logic bổ sung ở backend như lưu trữ JWT đã hết hiệu lực, backend trước tiên xác minh JWT có hiệu lực không rồi mới xử lý. Giải pháp cụ thể sẽ giới thiệu chi tiết sau, ở đây chỉ đề cập qua.

### Tránh hiệu quả tấn công CSRF

**CSRF (Cross Site Request Forgery — Tấn công giả mạo yêu cầu cross-site)** là một loại tấn công mạng. So với SQL injection, XSS và các cách tấn công bảo mật khác, CSRF ít nổi tiếng hơn. Nhưng nó thực sự là rủi ro bảo mật cần xem xét khi phát triển hệ thống. Ngay cả Gmail — sản phẩm của Google — cũng từng bị lộ lỗ hổng CSRF năm 2007, gây thiệt hại lớn cho user.

**Vậy cross-site request forgery là gì?** Nói đơn giản là dùng danh tính của bạn để làm việc xấu (gửi request không thân thiện với bạn như chuyển tiền độc hại).

Ví dụ đơn giản: Tiểu Tráng đăng nhập vào ngân hàng online, vào forum của ngân hàng, thấy một bài đăng có link "Đầu tư khoa học, lợi nhuận hàng năm vạn phần trăm". Tiểu Tráng tò mò click vào — kết quả tài khoản mất 10000. Chuyện gì xảy ra? Hóa ra hacker giấu một request trong link, request này lợi dụng thẳng danh tính của Tiểu Tráng gửi transfer request cho ngân hàng — tức dùng Cookie của bạn để gửi request cho ngân hàng.

```html
<a src="http://www.mybank.com/Transfer?bankId=11&money=10000"
  >Đầu tư khoa học, lợi nhuận hàng năm vạn phần trăm</a
>
```

Tấn công CSRF cần phụ thuộc vào Cookie. Trong Session authentication, `SessionID` trong Cookie được trình duyệt gửi đến server — chỉ cần gửi request là Cookie được mang theo. Nhờ đặc tính này, dù hacker không lấy được `SessionID` của bạn, chỉ cần để bạn click nhầm link tấn công là đạt được hiệu quả.

Ngoài ra không nhất thiết phải click link mới gây tấn công. Nhiều khi chỉ cần bạn mở một trang nào đó là CSRF attack đã xảy ra.

```html
<img src="http://www.mybank.com/Transfer?bankId=11&money=10000" />
```

**Tại sao JWT không có vấn đề này?**

Thông thường khi dùng JWT, sau khi đăng nhập thành công lấy được JWT, thường lưu vào localStorage. Mỗi request của frontend sau đó đều mang theo JWT này. Toàn bộ quá trình không hề liên quan đến Cookie. Do đó dù bạn click link bất hợp lệ gửi request đến server, request bất hợp lệ này cũng không mang JWT — nên request đó sẽ là bất hợp lệ.

Tóm gọn một câu: **Dùng JWT để authentication không phụ thuộc vào Cookie, do đó có thể tránh tấn công CSRF.**

Tuy nhiên như vậy cũng sẽ có rủi ro XSS attack. Để tránh XSS attack, bạn có thể chọn lưu JWT vào Cookie được đánh dấu là `httpOnly`. Nhưng điều này lại dẫn đến phải tự cung cấp CSRF protection, nên trong project thực tế thường cũng không làm vậy.

Cách phổ biến để tránh XSS attack là filter các suspicious string có rủi ro XSS trong request.

Trong Spring project, thường triển khai bằng cách tạo XSS filter:

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class XSSFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
      FilterChain chain) throws IOException, ServletException {
        XSSRequestWrapper wrappedRequest =
          new XSSRequestWrapper((HttpServletRequest) request);
        chain.doFilter(wrappedRequest, response);
    }

    // other methods
}
```

### Phù hợp với mobile application

Dùng Session để authentication cần lưu thông tin ở server side, và cách này phụ thuộc vào Cookie (cần Cookie lưu `SessionId`), nên không phù hợp với mobile.

Nhưng dùng JWT để authentication không có vấn đề này vì chỉ cần JWT có thể được client lưu là có thể dùng được, hơn nữa JWT còn có thể cross-language.

> Tại sao dùng Session để authentication không phù hợp với mobile?
>
> 1. State management: Session dựa trên server-side state management, còn mobile application thường là stateless. Kết nối của mobile device có thể không ổn định hoặc bị ngắt, nên khó duy trì long-term session state. Nếu dùng Session để authentication, mobile app cần thường xuyên maintain session với server, tăng network overhead và complexity.
> 2. Compatibility: Mobile application thường hướng đến nhiều platform như iOS, Android và Web. Mỗi platform có cách quản lý và lưu Session khác nhau, có thể dẫn đến vấn đề cross-platform compatibility.
> 3. Security: Mobile device thường ở môi trường mạng không tin tưởng, có rủi ro data leak và tấn công. Lưu session info nhạy cảm trên mobile device tăng rủi ro bị tấn công tiềm ẩn.

### Thân thiện với SSO (Single Sign-On)

Dùng Session để authentication, để triển khai SSO cần lưu Session info của user trên một máy, và thường gặp vấn đề Cookie cross-domain. Nhưng dùng JWT để authentication, JWT được lưu ở client side, không có những vấn đề này.

## Các vấn đề phổ biến của JWT Authentication và Giải pháp

### JWT vẫn còn hiệu lực sau khi logout, v.v.

Các tình huống cụ thể tương tự:

- Logout;
- Đổi password;
- Server sửa đổi quyền hoặc role của user;
- Tài khoản user bị ban/xóa;
- User bị server force logout;
- User bị kick offline;
- ……

Vấn đề này không tồn tại trong Session authentication — khi gặp tình huống này, server xóa Session record tương ứng là xong. Nhưng dùng JWT authentication thì khó giải quyết hơn. Như đã nói, JWT sau khi được phát hành nếu backend không thêm logic bổ sung thì vẫn hiệu lực cho đến khi hết hạn.

Làm thế nào giải quyết vấn đề này? Tôi tổng hợp 4 phương án sau:

**1. Lưu JWT vào database**

Lưu JWT hợp lệ vào database — khuyến nghị hơn là dùng in-memory database như Redis. Nếu muốn vô hiệu hóa một JWT, xóa JWT đó khỏi Redis là xong. Tuy nhiên điều này dẫn đến mỗi lần dùng JWT phải tra cứu trong Redis xem JWT có tồn tại không, và vi phạm nguyên tắc stateless của JWT.

**2. Blacklist mechanism**

Tương tự cách trên, dùng in-memory database như Redis để maintain một blacklist. Nếu muốn vô hiệu hóa một JWT, trực tiếp thêm JWT đó vào **blacklist**. Sau đó mỗi lần dùng JWT để request sẽ trước tiên kiểm tra xem JWT có trong blacklist không.

Cốt lõi của hai phương án đầu là lưu trữ JWT hợp lệ hoặc blacklist JWT được chỉ định.

Mặc dù cả hai vi phạm nguyên tắc stateless của JWT, nhưng trong project thực tế thường vẫn dùng hai phương án này.

**3. Sửa đổi secret key**

Tạo secret key riêng cho mỗi user. Nếu muốn vô hiệu hóa một JWT, chỉ cần sửa đổi secret key của user tương ứng. Tuy nhiên so với hai phương án đầu giới thiệu in-memory database, cách này gây hại nhiều hơn:

- Nếu service là distributed, mỗi khi phát hành JWT mới phải sync secret key trên nhiều máy. Vì vậy cần lưu secret key trong database hoặc external service — khi đó cũng không khác gì Session authentication.
- Nếu user cùng lúc mở hệ thống trên hai trình duyệt, hoặc cũng mở trên mobile — nếu logout từ một nơi thì tất cả nơi khác đều phải login lại — điều này không chấp nhận được.

**4. Giữ thời gian hiệu lực ngắn và rotate thường xuyên**

Cách đơn giản nhất. Nhưng sẽ khiến trạng thái login của user không được ghi nhớ persistent, và user phải login thường xuyên.

Ngoài ra, giải quyết vấn đề JWT vẫn hiệu lực sau khi đổi password tương đối dễ hơn. Một cách tôi cho là khá tốt: **Dùng hash value của password user để sign JWT. Do đó nếu password thay đổi, tất cả token cũ sẽ tự động không thể verify.**

### Vấn đề JWT Renewal

Thời gian hiệu lực JWT thường khuyến nghị không đặt quá dài. Vậy sau khi JWT hết hạn thì authentication như thế nào, làm thế nào dynamic refresh JWT để tránh user phải thường xuyên login lại?

Trước hết xem cách thường làm trong Session authentication: **Giả sử Session có hiệu lực 30 phút. Nếu trong 30 phút user có truy cập, kéo dài thêm 30 phút cho Session.**

Với JWT authentication, làm thế nào giải quyết vấn đề renewal? Tôi tổng hợp 4 phương án:

**1. Tương tự cách Session authentication (không khuyến nghị)**

Phương án này đáp ứng hầu hết tình huống. Giả sử server cấp JWT với hiệu lực 30 phút. Mỗi lần server validate, nếu phát hiện hiệu lực JWT sắp hết, server tạo lại JWT gửi cho client. Client mỗi lần request kiểm tra JWT mới và cũ — nếu không nhất quán thì cập nhật JWT cục bộ. Vấn đề là chỉ khi request sắp hết hạn mới update JWT — không thân thiện với client.

**2. Mỗi request trả về JWT mới (không khuyến nghị)**

Tư duy đơn giản, nhưng overhead sẽ khá lớn — đặc biệt khi server cần lưu trữ và maintain JWT.

**3. Đặt hiệu lực JWT đến nửa đêm (không khuyến nghị)**

Đây là phương án dung hòa, đảm bảo hầu hết user có thể login bình thường vào ban ngày. Phù hợp với hệ thống không yêu cầu security cao.

**4. Trả về hai JWT khi user login (khuyến nghị)**

Cái đầu là accessJWT, có thời gian hết hạn ngắn hơn như nửa tiếng. Cái kia là refreshJWT có thời gian hết hạn dài hơn như 1 ngày. refreshJWT chỉ dùng để lấy accessJWT, không dễ bị lộ.

Sau khi login, client lưu cả accessJWT và refreshJWT cục bộ. Mỗi lần truy cập gửi accessJWT cho server. Server validate tính hiệu lực của accessJWT. Nếu hết hạn thì gửi refreshJWT cho server. Nếu hợp lệ, server tạo accessJWT mới cho client. Ngược lại client login lại.

Nhược điểm của phương án này:

- Cần client phối hợp.
- Khi user logout cần đảm bảo cả hai JWT đều vô hiệu.
- Trong quá trình request lại để lấy JWT sẽ có khoảng thời gian ngắn JWT unavailable (có thể giải quyết bằng cách đặt timer ở client — khi accessJWT sắp hết hạn, lấy accessJWT mới qua refreshJWT trước).
- Có vấn đề bảo mật — chỉ cần lấy được refreshJWT chưa hết hạn là có thể liên tục lấy được accessJWT. Tuy nhiên vì refreshJWT chỉ dùng để lấy accessJWT nên không dễ bị lộ.

### JWT kích thước quá lớn

JWT cấu trúc phức tạp (Header, Payload và Signature), chứa nhiều thông tin bổ sung, còn cần Base64Url encoding — khiến JWT kích thước lớn hơn, tăng network transmission overhead.

Cấu trúc JWT:

![Cấu trúc JWT](https://oss.javaguide.cn/javaguide/system-design/jwt/jwt-composition.png)

Ví dụ JWT:

```plain
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Giải pháp:

- Giảm tối đa thông tin trong JWT Payload, chỉ giữ thông tin user và permission cần thiết.
- Trước khi truyền JWT, dùng thuật toán nén (như GZIP) để nén JWT giảm kích thước.
- Trong một số tình huống, dùng Token truyền thống có thể phù hợp hơn. Token truyền thống thường chỉ là một unique identifier, thông tin tương ứng (như user ID, Token expiration time, permission info) lưu ở server side — thường lưu qua Redis.

## Tổng kết

Một trong những ưu điểm quan trọng của JWT là stateless. Nhưng thực tế, khi muốn dùng JWT hợp lý trong project thực tế để authentication login, thường vẫn cần lưu thông tin JWT.

JWT cũng không phải silver bullet — cũng có nhiều nhược điểm. Cụ thể chọn JWT hay Session phụ thuộc vào yêu cầu cụ thể của project. Tuyệt đối không ca ngợi một chiều JWT mà coi thường các phương án authentication khác.

Ngoài ra, không dùng JWT mà dùng thẳng Token thông thường (randomly generated ID, không chứa thông tin cụ thể) kết hợp Redis để authentication cũng được.

## Tài liệu tham khảo

- JWT super detailed analysis: <https://learnku.com/articles/17883>
- How to log out when using JWT: <https://medium.com/devgorilla/how-to-log-out-when-using-jwt-a8c7823e8a6>
- CSRF protection with JSON Web JWTs: <https://medium.com/@agungsantoso/csrf-protection-with-json-web-JWTs-83e0f2fcbcc>
- Invalidating JSON Web JWTs: <https://stackoverflow.com/questions/21978658/invalidating-json-web-JWTs>
