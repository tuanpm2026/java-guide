---
title: Giải thích chi tiết SSO Single Sign-On
category: System Design
description: Giải thích chi tiết nguyên lý SSO Single Sign-On, bao gồm thiết kế unified authentication center, CAS protocol, triển khai cross-domain login và cơ chế đồng bộ login state.
tag:
  - Security
head:
  - - meta
    - name: keywords
      content: SSO,single sign-on,unified authentication,login state,ticket,TGT,ST,CAS protocol,cross-domain login
---

> Bài này được chuyển đăng có phép từ: <https://ken.io/note/sso-design-implement>, tác giả: ken.io

## Giới thiệu SSO

### SSO là gì?

SSO là viết tắt của Single Sign On — Đăng nhập một lần. SSO nghĩa là trong nhiều ứng dụng, user chỉ cần đăng nhập một lần là có thể truy cập tất cả ứng dụng tin tưởng lẫn nhau.

Ví dụ sau khi đăng nhập vào NetEase account center (<https://reg.163.com/>), truy cập các trang sau đều ở trạng thái đăng nhập:

- NetEase Live [https://v.163.com](https://v.163.com/)
- NetEase Blog [https://blog.163.com](https://blog.163.com/)
- NetEase Huatian [https://love.163.com](https://love.163.com/)
- NetEase Kaola [https://www.kaola.com](https://www.kaola.com/)
- NetEase Lofter [http://www.lofter.com](http://www.lofter.com/)

### SSO có những lợi ích gì?

1. **Góc độ user**: User đăng nhập một lần dùng được nhiều lần, không cần nhớ nhiều bộ username/password — tiện lợi.
2. **Góc độ system admin**: Admin chỉ cần duy trì một account center thống nhất — tiện quản lý.
3. **Góc độ phát triển hệ thống mới**: Khi phát triển hệ thống mới chỉ cần kết nối trực tiếp với account center thống nhất — đơn giản hóa development flow, tiết kiệm thời gian.

## Thiết kế và Triển khai SSO

Bài này chủ yếu thảo luận về cách thiết kế & triển khai một hệ thống SSO.

Các chức năng cốt lõi cần triển khai:

- Single sign-on (Đăng nhập một lần)
- Single sign-out (Đăng xuất một lần)
- Hỗ trợ cross-domain single sign-on
- Hỗ trợ cross-domain single sign-out

### Ứng dụng cốt lõi và dependency

![Thiết kế SSO (Single Sign-On)](/images/github/javaguide/system-design/security/sso/sso-system.png-kblb.png)

| Ứng dụng/Module/Object    | Mô tả                                                  |
| ------------------------- | ------------------------------------------------------ |
| Frontend site             | Site cần đăng nhập                                     |
| SSO site - Login          | Cung cấp trang đăng nhập                               |
| SSO site - Logout         | Cung cấp entry đăng xuất                               |
| SSO service - Login       | Cung cấp login service                                 |
| SSO service - Login state | Cung cấp service kiểm tra login state/query login info |
| SSO service - Logout      | Cung cấp service đăng xuất user                        |
| Database                  | Lưu trữ thông tin tài khoản user                       |
| Cache                     | Lưu trữ login info của user, thường dùng Redis         |

### Lưu trữ và kiểm tra login state của user

Các Web framework phổ biến triển khai Session đều sinh một SessionId lưu trong browser Cookie, rồi lưu nội dung Session trong server-side memory — [ken.io](https://ken.io/) đã đề cập trong [Session working principle](https://ken.io/note/session-principle-skill) trước đó. Toàn bộ ý tưởng ở đây cũng học hỏi từ cách tiếp cận này.

Sau khi user đăng nhập thành công, sinh ra AuthToken giao cho client lưu giữ. Nếu là browser thì lưu trong Cookie. Nếu là mobile App thì lưu trong local cache của App. Bài này chủ yếu thảo luận về SSO cho Web site.

Khi user duyệt các trang cần đăng nhập, client gửi AuthToken lên SSO service để kiểm tra login state/lấy login info của user.

Với việc lưu login info, khuyến nghị dùng Redis. Dùng Redis cluster để lưu login info vừa đảm bảo high availability vừa có thể scale linearly. Đồng thời có thể cho SSO service đáp ứng yêu cầu load balancing/scalability.

| Object     | Mô tả                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AuthToken  | Dùng trực tiếp UUID/GUID là được. Nếu cần validate tính hợp lệ của AuthToken, có thể encrypt UserName + timestamp để sinh, server side decrypt rồi validate. |
| Login info | Thường cache UserId, UserName                                                                                                                                |

### User Login / Login Validation

**Sequence diagram đăng nhập**

![Thiết kế SSO - Sequence diagram đăng nhập](/images/github/javaguide/system-design/security/sso/sso-login-sequence.png-kbrb.png)

Theo hình trên, sau khi user đăng nhập, AuthToken được lưu trong Cookie. `domain=test.com`. Browser sẽ đặt domain thành `.test.com`.

Như vậy khi truy cập tất cả web site `*.test.com`, AuthToken đều được gửi lên server side. Sau đó thông qua SSO service, hoàn tất việc kiểm tra state của user / lấy login info của user.

**Lấy login info / Kiểm tra login state**

![Thiết kế SSO - Lấy login info / Kiểm tra login state](/images/github/javaguide/system-design/security/sso/sso-logincheck-sequence.png-kbrb.png)

### User Logout

Khi user đăng xuất cần làm những việc đơn giản:

1. Server side xóa login state trong cache (Redis).
2. Client side xóa AuthToken đã lưu.

**Sequence diagram đăng xuất**

![Thiết kế SSO - User logout](/images/github/javaguide/system-design/security/sso/sso-logout-sequence.png-kbrb.png)

### Cross-domain Login, Logout

Như đã đề cập trước đó, ý tưởng cốt lõi là client lưu AuthToken, server side dùng Redis lưu login info. Vì client lưu AuthToken trong Cookie, nên vấn đề cross-domain cần giải quyết là làm thế nào giải quyết cross-domain read/write của Cookie.

Ý tưởng cốt lõi để giải quyết cross-domain:

- Sau khi đăng nhập xong, truyền AuthToken đến site ngoài main domain qua callback. Site đó tự lưu AuthToken vào Cookie dưới domain hiện tại.
- Sau khi đăng xuất xong, qua callback gọi trang logout của site non-main domain, hoàn thành việc đặt AuthToken trong Cookie thành expired.

**Cross-domain login (main domain đã đăng nhập)**

![Thiết kế SSO - Cross-domain login (main domain đã đăng nhập)](/images/github/javaguide/system-design/security/sso/sso-crossdomain-login-loggedin-sequence.png-kbrb.png)

**Cross-domain login (main domain chưa đăng nhập)**

![Thiết kế SSO - Cross-domain login (main domain chưa đăng nhập)](/images/github/javaguide/system-design/security/sso/sso-crossdomain-login-unlogin-sequence.png-kbrb.png)

**Cross-domain logout**

![Thiết kế SSO - Cross-domain logout](/images/github/javaguide/system-design/security/sso/sso-crossdomain-logout-sequence.png-kbrb.png)

## Ghi chú

- Về phương án: Thiết kế lần này chủ yếu cung cấp ý tưởng triển khai. Nếu liên quan đến App user login, khi truy cập SSO service thêm xác minh signature của App là được. Tất nhiên nếu có wireless gateway thì việc verify signature không phải vấn đề.
- Về sequence diagram: Sequence diagram không bao gồm tất cả scenario, chỉ liệt kê các scenario cốt lõi/chính. Ngoài ra một số message không ảnh hưởng đến việc hiểu ý tưởng đã được lược bỏ.

<!-- @include: @article-footer.snippet.md -->
