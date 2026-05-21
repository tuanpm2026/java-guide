---
title: Giải thích chi tiết các khái niệm cơ bản về Authentication và Authorization
description: Giải thích chi tiết các khái niệm cơ bản về authentication và authorization, bao gồm sự khác biệt giữa Authentication và Authorization, Session, Token, OAuth2 và các kiến thức cốt lõi.
category: System Design
tag:
  - Security
head:
  - - meta
    - name: keywords
      content: authentication,authorization,Authentication,Authorization,Session,Token,OAuth2,access control,security basics
---

## Sự khác biệt giữa Authentication (Xác thực) và Authorization (Phân quyền) là gì?

Đây là câu hỏi mà đại đa số mọi người đều nhầm lẫn. Trước tiên hãy nhận biết hai danh từ này qua cách phát âm, nhiều người hay nhầm phát âm của chúng, vì vậy tôi khuyến nghị bạn tra xem cách phát âm đúng của hai từ này và ý nghĩa cụ thể của chúng là gì.

Nói đơn giản:

- **Authentication (Xác thực):** Bạn là ai.
- **Authorization (Phân quyền):** Bạn có quyền làm gì.

Cách diễn đạt chính thức hơn (dài dòng hơn):

- **Authentication (Xác thực)** là thông tin xác nhận danh tính của bạn (ví dụ username/user ID và password). Thông qua thông tin này, hệ thống biết bạn là bạn — tức là hệ thống tồn tại user bạn. Vì vậy Authentication được gọi là identity/user verification.
- **Authorization (Phân quyền)** xảy ra sau **Authentication**. Phân quyền chủ yếu quản lý quyền truy cập hệ thống của chúng ta. Ví dụ một số tài nguyên cụ thể chỉ người có quyền đặc biệt mới có thể truy cập (như admin), một số thao tác trên tài nguyên hệ thống như xóa, thêm, cập nhật chỉ người cụ thể mới có thể thực hiện.

Authentication:

![Authentication login](/images/github/javaguide/system-design/security/authentication-login.png)

Authorization:

![No permission](/images/github/javaguide/system-design/security/20210604161032412.png)

Hai cái này thường được kết hợp sử dụng trong hệ thống của chúng ta, mục đích là để bảo vệ tính bảo mật của hệ thống.

## Bạn có biết về mô hình RBAC không?

Mô hình kiểm soát truy cập được sử dụng phổ biến nhất trong kiểm soát quyền hệ thống là **RBAC model**.

**RBAC là gì?** RBAC là Role-Based Access Control (Kiểm soát truy cập dựa trên vai trò). Đây là phương thức ủy quyền thông qua liên kết quyền với role, và role lại liên kết với user.

Nói đơn giản: Một user có thể có nhiều role, mỗi role có thể được phân nhiều quyền, từ đó tạo thành mô hình ủy quyền "user - role - permission". Trong mô hình này, user với role, role với permission tạo thành quan hệ many-to-many.

![Sơ đồ mô hình phân quyền RBAC](/images/github/javaguide/system-design/security/design-of-authority-system/rbac.png)

Trong mô hình phân quyền RBAC, quyền được liên kết với role, user có được quyền của những role đó bằng cách trở thành thành viên của role có quyền đặc biệt đó — điều này đơn giản hóa đáng kể việc quản lý quyền.

Để triển khai mô hình phân quyền RBAC, thiết kế database table phổ biến như sau (tổng cộng 5 bảng, 2 bảng junction để thiết lập liên kết giữa các bảng):

![](/images/2020-11/%E6%95%B0%E6%8D%AE%E5%BA%93%E8%AE%BE%E8%AE%A1-%E6%9D%83%E9%99%90.png)

Thông qua mô hình phân quyền này, chúng ta có thể tạo các role khác nhau và phân phạm vi quyền (menu) khác nhau cho từng role.

![](/images/github/javaguide/books%E6%9D%83%E9%99%90%E7%AE%A1%E7%90%86%E6%A8%A1%E5%9D%97.png)

Thông thường, nếu hệ thống có yêu cầu kiểm soát quyền khá nghiêm ngặt, thường sẽ chọn dùng RBAC model để kiểm soát quyền.

## Cookie là gì? Tác dụng của Cookie là gì?

![](/images/github/javaguide/system-design/security/cookie-sessionId.png)

`Cookie` và `Session` đều là phương thức session để theo dõi danh tính của browser user, nhưng application scenario của hai cái này khá khác nhau.

Wikipedia định nghĩa `Cookie` như sau:

> `Cookies` là dữ liệu (thường được mã hóa) được lưu trữ trên thiết bị đầu cuối cục bộ của user bởi một số website nhằm nhận dạng user.

Nói đơn giản: **`Cookie` được lưu ở phía client, thường dùng để lưu thông tin user**.

Dưới đây là một số ứng dụng của `Cookie`:

1. Chúng ta lưu thông tin cơ bản của user đã đăng nhập trong `Cookie`, lần sau truy cập website trang có thể tự động điền một số thông tin cơ bản giúp bạn đăng nhập. Ngoài ra, `Cookie` còn có thể lưu user preferences, theme và các cài đặt khác.
2. Dùng `Cookie` lưu `SessionId` hoặc `Token`, khi gửi request đến backend mang theo `Cookie`, backend có thể lấy được `Session` hoặc `Token`. Như vậy có thể ghi lại trạng thái hiện tại của user, vì HTTP protocol là stateless.
3. `Cookie` cũng có thể dùng để ghi lại và phân tích hành vi user. Ví dụ đơn giản: khi bạn mua sắm online, vì HTTP protocol không có trạng thái, nếu server muốn biết trạng thái dừng của bạn trên một trang hay bạn đã xem sản phẩm nào, một cách triển khai phổ biến là lưu những thông tin này trong `Cookie`.
4. ……

## Làm thế nào để sử dụng Cookie trong project?

Ở đây tôi lấy Spring Boot project làm ví dụ.

**1) Đặt `Cookie` trả về cho client**

```java
@GetMapping("/change-username")
public String setCookie(HttpServletResponse response) {
    // Tạo một cookie
    Cookie cookie = new Cookie("username", "Jovan");
    // Đặt thời gian hết hạn cookie
    cookie.setMaxAge(7 * 24 * 60 * 60); // expires in 7 days
    // Thêm vào response
    response.addCookie(cookie);

    return "Username is changed!";
}
```

**2) Dùng annotation `@CookieValue` của Spring framework để lấy giá trị của cookie cụ thể**

```java
@GetMapping("/")
public String readCookie(@CookieValue(value = "username", defaultValue = "Atta") String username) {
    return "Hey! My username is " + username;
}
```

**3) Đọc tất cả giá trị `Cookie`**

```java
@GetMapping("/all-cookies")
public String readAllCookies(HttpServletRequest request) {

    Cookie[] cookies = request.getCookies();
    if (cookies != null) {
        return Arrays.stream(cookies)
                .map(c -> c.getName() + "=" + c.getValue()).collect(Collectors.joining(", "));
    }

    return "No cookies";
}
```

Xem thêm về cách sử dụng `Cookie` trong Spring Boot tại bài: [How to use cookies in Spring Boot](https://attacomsian.com/blog/cookies-spring-boot).

## Cookie và Session khác nhau như thế nào?

**Mục đích chính của `Session` là ghi lại trạng thái của user ở phía server.** Scenario điển hình là giỏ hàng — khi bạn thêm sản phẩm vào giỏ hàng, hệ thống không biết đó là user nào thao tác vì HTTP protocol là stateless. Sau khi server tạo `Session` cụ thể cho user cụ thể, có thể nhận dạng và theo dõi user đó.

Dữ liệu `Cookie` được lưu ở phía client (browser), dữ liệu `Session` được lưu ở phía server. `Session` có tính bảo mật cao hơn tương đối. Nếu dùng `Cookie`, đừng ghi thông tin nhạy cảm vào `Cookie`, tốt nhất nên mã hóa thông tin `Cookie` và chỉ giải mã khi cần dùng ở phía server.

**Vậy, làm thế nào để xác thực danh tính bằng `Session`?**

## Làm thế nào để xác thực danh tính bằng phương án Session-Cookie?

Nhiều khi chúng ta dùng `SessionID` để nhận dạng user cụ thể, `SessionID` thường được lưu trong Redis. Ví dụ:

1. User đăng nhập thành công vào hệ thống, server trả về cho client `Cookie` chứa `SessionID`.
2. Khi user gửi request đến backend, `SessionID` sẽ được gửi kèm, backend từ đó biết trạng thái danh tính của bạn.

Quy trình chi tiết hơn của phương thức xác thực này như sau:

![](/images/github/javaguide/system-design/security/session-cookie-authentication-process.png)

1. User gửi username, password, verification code đến server để đăng nhập hệ thống.
2. Sau khi server xác minh thành công, sẽ tạo một Session object chuyên dùng cho user đó (có thể hiểu là một vùng bộ nhớ trên server, lưu data trạng thái của user như giỏ hàng, thông tin đăng nhập v.v.) và lưu lại, đồng thời cấp cho Session này một `SessionID` duy nhất.
3. Server gửi `SessionID` đến browser của user thông qua directive `Set-Cookie` trong HTTP response header.
4. Sau khi nhận được `SessionID`, browser sẽ lưu dưới dạng Cookie. Khi user ở trạng thái đăng nhập, mỗi lần gửi request đến server, browser sẽ tự động mang theo Cookie chứa `SessionID`.
5. Server nhận request, lấy `SessionID` từ Cookie, tìm được Session object đã lưu trước đó, từ đó biết đây là user nào và trạng thái trước đó của họ.

Khi sử dụng Session cần chú ý các điểm sau:

- **Client Cookie support**: Chức năng cốt lõi phụ thuộc Session cần đảm bảo browser của user đã bật Cookie.
- **Session expiry management**: Đặt thời gian hết hạn Session hợp lý, cân bằng giữa security và user experience.
- **Session ID security**: Đặt flag `HttpOnly` cho Cookie chứa `SessionID` để ngăn client script (như JavaScript) đánh cắp; đặt flag Secure để đảm bảo `SessionID` chỉ được truyền qua HTTPS connection, tăng tính bảo mật.

Ngoài ra, Spring Session cung cấp cơ chế quản lý session thông tin của user trên nhiều ứng dụng hoặc instance. Nếu muốn tìm hiểu chi tiết có thể xem một số bài rất hay sau:

- [Getting Started with Spring Session](https://codeboje.de/spring-Session-tutorial/)
- [Guide to Spring Session](https://www.baeldung.com/spring-Session)
- [Sticky Sessions with Spring Session & Redis](https://medium.com/@gvnix/sticky-Sessions-with-spring-Session-redis-bdc6f7438cc3)

## Phương án Session-Cookie hoạt động như thế nào khi có nhiều server node?

Phương án Session-Cookie là một phương thức xác thực danh tính rất tốt trong môi trường monolithic. Nhưng khi server mở rộng theo chiều ngang thành nhiều node, phương án Session-Cookie sẽ phải đối mặt với thách thức.

Ví dụ: Giả sử chúng ta deploy hai service A, B giống nhau, user lần đầu đăng nhập, Nginx qua cơ chế load balancing chuyển request của user đến server A, lúc này thông tin Session của user được lưu tại server A. Kết quả, lần thứ hai user truy cập, Nginx route request đến server B, vì server B không có lưu Session của user nên user phải đăng nhập lại.

**Chúng ta nên làm thế nào để tránh tình trạng này?**

Có một số giải pháp để tham khảo:

1. Tất cả request của một user nhất định đều được phân bổ đến cùng một server xử lý thông qua hash strategy cụ thể. Như vậy, mỗi server lưu Session của một phần user. Nếu server down, tất cả Session nó lưu sẽ bị mất hoàn toàn.
2. Thông tin Session mà mỗi server lưu đều đồng bộ với nhau — tức là mỗi server lưu toàn bộ Session. Mỗi khi Session trên một server thay đổi, đồng bộ sang các server khác. Phương án này tốn kém, và càng nhiều node thì chi phí đồng bộ càng cao.
3. Dùng riêng một data node (như cache) mà tất cả server đều có thể truy cập để lưu Session. Để đảm bảo high availability, data node nên tránh single point of failure.
4. Spring Session là project dùng để quản lý session trên nhiều server. Nó có thể tích hợp với nhiều backend storage (như Redis, MongoDB v.v.) để triển khai distributed session management. Thông qua Spring Session, có thể lưu session data vào shared external storage để đồng bộ và chia sẻ session giữa các server.

## Nếu không có Cookie thì Session có còn dùng được không?

Đây là câu hỏi phỏng vấn kinh điển!

Thông thường `SessionID` được lưu qua `Cookie`, nếu bạn dùng phương án lưu `SessionID` bằng `Cookie`, khi client vô hiệu hóa `Cookie` thì `Session` sẽ không hoạt động bình thường.

Nhưng, không phải không có `Cookie` thì không thể dùng `Session`. Ví dụ bạn có thể đặt `SessionID` vào trong `url` của request `https://javaguide.cn/?Session_id=xxx`. Phương án này khả thi, nhưng bảo mật và user experience giảm. Tất nhiên, để an toàn bạn cũng có thể mã hóa `SessionID` một lần trước khi truyền vào backend.

## Tại sao Cookie không thể ngăn CSRF attack còn Token thì có thể?

**CSRF (Cross Site Request Forgery)** thường được dịch là **Cross-site Request Forgery**. Vậy Cross-site Request Forgery là gì? Nói đơn giản là dùng danh tính của bạn để gửi một số request không thân thiện với bạn. Ví dụ đơn giản:

Xiao Zhuang đăng nhập vào một ngân hàng online, vào khu vực diễn đàn của ngân hàng online, thấy dưới một bài đăng có link ghi "Đầu tư thông minh, lợi nhuận năm vượt 10 nghìn", Xiao Zhuang tò mò click vào link đó, kết quả phát hiện tài khoản mất 10.000 đồng. Chuyện gì đây? Thì ra hacker đã giấu một request trong link, request này trực tiếp sử dụng danh tính của Xiao Zhuang gửi request chuyển tiền đến ngân hàng — tức là gửi request đến ngân hàng thông qua Cookie của bạn.

```html
<a src=http://www.mybank.com/Transfer?bankId=11&money=10000>Đầu tư thông minh, lợi nhuận năm vượt 10 nghìn</>
```

Như đã đề cập ở trên, khi thực hiện `Session` authentication, chúng ta thường dùng `Cookie` để lưu `SessionId`. Khi đăng nhập, backend tạo một `SessionId` đặt trong Cookie trả về cho client, server lưu `SessionId` này qua Redis hoặc công cụ lưu trữ khác, client sau khi đăng nhập mỗi lần request đều mang theo `SessionId` này, server dùng `SessionId` này để xác định danh tính. Nếu ai đó lấy được `SessionId` qua `Cookie`, có thể thay thế danh tính bạn truy cập hệ thống.

Trong `Session` authentication, `SessionId` trong `Cookie` được browser gửi đến server, lợi dụng đặc điểm này, attacker có thể đạt được mục đích tấn công bằng cách khiến user click nhầm vào link tấn công.

Nhưng, nếu dùng `Token` thì không có vấn đề này. Sau khi đăng nhập thành công và nhận được `Token`, thường chúng ta sẽ chọn lưu trong `localStorage` (local storage của browser). Rồi ở frontend thông qua một số cách sẽ thêm `Token` này vào mỗi request gửi đến backend — như vậy sẽ không có lỗ hổng CSRF. Vì dù bạn click vào link bất hợp pháp và gửi request đến server, request bất hợp pháp đó sẽ không mang `Token`, vì vậy request này sẽ là bất hợp pháp.

![](/images/github/javaguide/system-design/security/20210615161108272.png)

Cần lưu ý: Dù là `Cookie` hay `Token` đều không thể tránh được **Cross Site Scripting (XSS) attack**.

> Cross Site Scripting (Tấn công cross-site scripting) viết tắt là CSS nhưng điều này sẽ nhầm lẫn với Cascading Style Sheets (CSS). Vì vậy có người viết tắt là XSS.

Trong XSS, attacker dùng nhiều cách để chèn malicious code vào trang của user khác, có thể đánh cắp thông tin như `Cookie` thông qua script.

Khuyến nghị đọc: [Làm thế nào để ngăn CSRF attack? — Meituan Technical Team](https://tech.meituan.com/2018/10/11/fe-security-csrf.html)

## JWT là gì? JWT bao gồm những phần nào?

[Giải thích chi tiết các khái niệm cơ bản về JWT](./jwt-intro.md)

## Làm thế nào để xác thực danh tính dựa trên JWT? Làm thế nào để ngăn JWT bị giả mạo?

[Giải thích chi tiết các khái niệm cơ bản về JWT](./jwt-intro.md)

## SSO là gì?

SSO (Single Sign On) — Đăng nhập một lần là khi user đăng nhập vào một trong các subsystem thì có quyền truy cập vào các hệ thống liên quan khác. Ví dụ khi đăng nhập vào JD Finance (Jingdong), chúng ta đồng thời đăng nhập thành công vào JD Supermarket, JD International, JD Fresh và các subsystem khác.

![SSO diagram](/images/github/javaguide/system-design/security/sso.png)

## SSO có lợi ích gì?

- **Góc độ user**: User có thể đăng nhập một lần dùng nhiều lần, không cần nhớ nhiều bộ username/password, tiện lợi.
- **Góc độ system admin**: Admin chỉ cần duy trì một account center thống nhất, tiện quản lý.
- **Góc độ phát triển hệ thống mới**: Khi phát triển hệ thống mới chỉ cần kết nối trực tiếp với account center thống nhất, đơn giản hóa quy trình phát triển, tiết kiệm thời gian.

## Làm thế nào để thiết kế và triển khai hệ thống SSO?

[Giải thích chi tiết SSO Single Sign On](./sso-intro.md)

## OAuth 2.0 là gì?

OAuth là giao thức ủy quyền chuẩn trong ngành, chủ yếu dùng để ủy quyền cho ứng dụng bên thứ ba nhận quyền hạn chế. OAuth 2.0 là bản thiết kế lại hoàn toàn của OAuth 1.0, nhanh hơn, dễ triển khai hơn, OAuth 1.0 đã bị deprecated. Chi tiết xem: [rfc6749](https://tools.ietf.org/html/rfc6749).

Thực ra đây là một cơ chế ủy quyền, mục đích cuối cùng là cấp cho ứng dụng bên thứ ba một Token có thời hạn, cho phép ứng dụng bên thứ ba lấy được tài nguyên liên quan thông qua Token đó.

OAuth 2.0 được dùng phổ biến nhất trong scenario đăng nhập bên thứ ba — khi website của bạn tích hợp đăng nhập bên thứ ba thường dùng giao thức OAuth 2.0.

Ngoài ra, OAuth 2.0 hiện cũng phổ biến trong scenario thanh toán (WeChat Pay, Alipay) và nền tảng phát triển (WeChat Open Platform, Alibaba Open Platform, v.v.).

Hình dưới đây là sơ đồ đăng nhập bên thứ ba [Slack OAuth 2.0](https://api.slack.com/legacy/oauth):

![](/images/github/javaguide/system-design/security/20210615151716340.png)

**Khuyến nghị đọc:**

- [Giải thích đơn giản về OAuth 2.0](http://www.ruanyifeng.com/blog/2019/04/oauth_design.html)
- [Hiểu giao thức OAuth 2.0 trong 10 phút](https://deepzz.com/post/what-is-oauth2-protocol.html)
- [Bốn phương thức của OAuth 2.0](http://www.ruanyifeng.com/blog/2019/04/oauth-grant-types.html)
- [GitHub OAuth third-party login tutorial](http://www.ruanyifeng.com/blog/2019/04/github-oauth.html)

## Tài liệu tham khảo

- Không dùng JWT thay thế quản lý session (Phần 1): Hiểu toàn diện về Token, JWT, OAuth, SAML, SSO: <https://zhuanlan.zhihu.com/p/38942172>
- Introduction to JSON Web Tokens: <https://jwt.io/introduction>
- JSON Web Token Claims: <https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-token-claims>

<!-- @include: @article-footer.snippet.md -->
