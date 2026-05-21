---
title: Giải thích chi tiết thiết kế hệ thống phân quyền
description: Role-Based Access Control (RBAC) là mô hình phân quyền thông qua role của user, thực hiện kiểm soát truy cập linh hoạt. So với việc cấp quyền trực tiếp cho user, RBAC đơn giản hơn, hiệu quả hơn và có khả năng mở rộng tốt hơn.
category: System Design
tag:
  - Security
head:
  - - meta
    - name: keywords
      content: permission system design,RBAC,ABAC,user role permission,resource permission,permission model,permission validation,authorization system
---

<!-- @include: @article-header.snippet.md -->

> Tác giả: Zhuanzhuan Tech Team
>
> Bài gốc: <https://mp.weixin.qq.com/s/ONMuELjdHYa0yQceTj01Iw>

## Vấn đề và hiện trạng của hệ thống phân quyền cũ

Zhuanzhuan trước đây không có một hệ thống quản lý phân quyền thống nhất, việc quản lý quyền hạn do từng nghiệp vụ tự nghiên cứu phát triển hoặc dùng hệ thống phân quyền của nghiệp vụ khác, sự thiếu thống nhất này gây ra nhiều vấn đề:

1. Mỗi nghiệp vụ tự phát minh lại bánh xe, chi phí bảo trì cao
2. Mỗi hệ thống chỉ giải quyết một phần vấn đề trong từng scenario, giải pháp không đủ tổng quát, khi chọn công nghệ cho project mới không có phương án quản lý phân quyền đáng tin cậy
3. Thiếu quản lý log và quy trình phê duyệt thống nhất, rất khó truy vết thông tin ủy quyền

Dựa trên các vấn đề trên, cuối năm ngoái công ty khởi động xây dựng hệ thống phân quyền thống nhất của Zhuanzhuan, mục tiêu là phát triển một hệ thống quản lý phân quyền linh hoạt, dễ dùng và an toàn để cung cấp cho các nghiệp vụ sử dụng.

## Các phương pháp thiết kế hệ thống phân quyền trong ngành

Hiện tại ngành có hai mô hình phân quyền chính, dưới đây giới thiệu lần lượt:

- **Role-Based Access Control (RBAC)**
- **Attribute-Based Access Control (ABAC)**

### Mô hình RBAC

**Role-Based Access Control (RBAC)** là mô hình phân quyền thông qua role của user, thực hiện kiểm soát truy cập linh hoạt. So với việc cấp quyền trực tiếp cho user, RBAC đơn giản hơn, hiệu quả hơn và có khả năng mở rộng tốt hơn.

Một user có thể có nhiều role, mỗi role lại có thể được phân nhiều quyền, từ đó tạo thành mô hình ủy quyền "user - role - permission". Trong mô hình này, user với role, role với permission tạo thành quan hệ many-to-many.

Mô tả bằng hình ảnh như sau:

![Sơ đồ mô hình phân quyền RBAC](/images/github/javaguide/system-design/security/design-of-authority-system/rbac.png)

Khi sử dụng `RBAC model`, thông qua phân tích tình hình thực tế của user, dựa trên trách nhiệm và nhu cầu chung, cấp cho họ các role khác nhau. Mối quan hệ `user -> role -> permission` này cho phép chúng ta không cần quản lý riêng lẻ quyền của từng user, user lấy quyền cần thiết từ role được cấp.

Lấy ví dụ một scenario đơn giản (hệ thống phân quyền Gitlab), trong hệ thống user có 3 role: `Admin`, `Maintainer`, `Operator`. Ba role này có quyền khác nhau, ví dụ chỉ `Admin` mới có quyền tạo repository và xóa repository, các role khác không có. Chúng ta cấp role `Admin` cho một user, user đó sẽ có quyền **tạo repository** và **xóa repository**.

Thông qua `RBAC model`, khi có nhiều user có cùng quyền, chỉ cần tạo role có quyền đó, rồi cấp các role khác nhau cho từng user. Sau này chỉ cần sửa quyền của role là tự động sửa quyền của tất cả user trong role đó.

### Mô hình ABAC

**Attribute-Based Access Control (ABAC)** là mô hình ủy quyền linh hoạt hơn `RBAC model`, nguyên lý là dùng các thuộc tính khác nhau để tính toán động xem một thao tác có được phép hay không. Mô hình này được dùng nhiều trong cloud systems như AWS, Alibaba Cloud.

Xem xét các scenario kiểm soát phân quyền sau:

1. Cấp quyền chỉnh sửa một cuốn sách cụ thể cho một người cụ thể
2. Khi phòng ban của document trùng với phòng ban của user, user có thể truy cập document đó
3. Khi user là chủ sở hữu document và trạng thái document là draft, user có thể chỉnh sửa document
4. Trước 9 giờ sáng, cấm người thuộc phòng A truy cập hệ thống B
5. Ở bất kỳ đâu trừ Thượng Hải, cấm truy cập hệ thống A với tư cách admin
6. User có quyền thao tác các đơn hàng được tạo trước ngày 2022-06-07

Có thể thấy các scenario trên rất khó triển khai bằng `RBAC model`, vì `RBAC model` chỉ mô tả user có thể thực hiện thao tác gì, nhưng điều kiện thao tác và dữ liệu thao tác thì `RBAC model` không có những giới hạn này. Đây chính là điểm mạnh của `ABAC model` — tư tưởng của nó là tính toán động xem user có quyền thực hiện thao tác hay không dựa trên user, thuộc tính dữ liệu được truy cập và các yếu tố môi trường khác nhau.

#### Nguyên lý của mô hình ABAC

Trong `ABAC model`, liệu một thao tác có được phép hay không được tính toán động dựa trên subject, resource, operation và environment information.

- **Subject**: Subject là user đang yêu cầu truy cập tài nguyên. Thuộc tính của user bao gồm ID, personal resource, role, department, organization membership, v.v.
- **Resource**: Resource là asset hoặc object mà user muốn truy cập, ví dụ file, data, server, thậm chí API
- **Operation**: Operation là thao tác mà user muốn thực hiện trên resource. Các thao tác phổ biến gồm "read", "write", "edit", "copy", "delete"
- **Environment**: Environment là context của mỗi access request. Environment attributes bao gồm thời gian và địa điểm truy cập, thiết bị của subject, communication protocol và encryption strength, v.v.

Trong quá trình thực thi decision statement của `ABAC model`, decision engine sẽ tính toán dynamic decision result dựa trên các decision statement đã định nghĩa kết hợp các yếu tố subject, resource, operation, environment. Mỗi khi có access request, decision system của `ABAC model` sẽ phân tích xem attribute values có khớp với policy đã thiết lập hay không. Nếu có policy khớp, access request sẽ được thông qua.

## Tư tưởng thiết kế của hệ thống phân quyền mới

Kết hợp với tình hình nghiệp vụ thực tế của Zhuanzhuan, `RBAC model` đáp ứng được phần lớn các business scenario, và chi phí phát triển thấp hơn nhiều so với hệ thống phân quyền dùng `ABAC model`, nên hệ thống phân quyền mới chọn triển khai dựa trên `RBAC model`. Với những business system thực sự không thể đáp ứng, chúng tôi chọn cách tạm thời không hỗ trợ — điều này giúp hệ thống phân quyền mới triển khai nhanh hơn và để nghiệp vụ sử dụng sớm hơn.

Standard `RBAC model` hoàn toàn tuân theo chuỗi `user -> role -> permission`, tức là quyền của user hoàn toàn do các role user sở hữu kiểm soát. Nhưng điều này có một nhược điểm: muốn thêm quyền cho user phải tạo thêm một role mới, dẫn đến hiệu quả thao tác thực tế khá thấp. Vì vậy chúng tôi bổ sung thêm khả năng cấp quyền trực tiếp cho user trên nền `RBAC model` — tức là vừa có thể thêm role cho user, vừa có thể thêm trực tiếp quyền cho user. Quyền cuối cùng của user là tổ hợp của role và permission point sở hữu.

**Permission model của hệ thống phân quyền mới**: Quyền cuối cùng của user = Quyền từ role user sở hữu + Quyền độc lập cấu hình cho user, lấy hợp của cả hai.

Sơ đồ hệ thống phân quyền mới như sau:

![Sơ đồ hệ thống phân quyền mới](/images/github/javaguide/system-design/security/design-of-authority-system/new-authority-system-design.png)

- Đầu tiên, tất cả user của tập đoàn (bao gồm user bên ngoài) được quản lý thống nhất thông qua chức năng **đăng nhập và đăng ký thống nhất**, đồng thời kết nối với module thông tin cơ cấu tổ chức của công ty, đảm bảo thông tin của cùng một người nhất quán trên tất cả hệ thống — điều này cũng tạo ra tính khả thi cho việc quản lý phân quyền dựa trên cơ cấu tổ chức về sau.
- Tiếp theo, vì hệ thống phân quyền mới cần phục vụ tất cả nghiệp vụ của tập đoàn, cần hỗ trợ quản lý phân quyền đa hệ thống. Trước khi user thực hiện quản lý phân quyền, cần chọn hệ thống tương ứng trước, rồi cấu hình thông tin **menu permission** và **data permission** của hệ thống đó, thiết lập các permission point của hệ thống. _PS: Giải thích cụ thể về menu permission và data permission sẽ được trình bày chi tiết ở phần sau._
- Cuối cùng, tạo các role khác nhau trong hệ thống đó, cấu hình permission point cho các role khác nhau. Ví dụ role store manager có quyền thao tác nhân viên, quyền xem dữ liệu cửa hàng v.v. Sau khi cấu hình xong role này, chỉ cần thêm role này cho store manager là họ có được quyền tương ứng.

Sau khi hoàn thành cấu hình trên, có thể thực hiện quản lý phân quyền cho user. Có hai cách để thêm quyền cho user:

1. Chọn user trước, rồi thêm quyền. Cách này có thể thêm bất kỳ role hoặc menu/data permission point nào cho user.
2. Chọn role trước, rồi liên kết user. Cách này chỉ có thể thêm role cho user, không thể thêm riêng lẻ menu/data permission point.

Thiết kế cụ thể của hai cách này sẽ được giải thích chi tiết ở phần sau.

### Quản lý phân quyền của chính hệ thống phân quyền

Đối với hệ thống phân quyền, trước tiên cần thiết kế tốt quản lý phân quyền của chính hệ thống — tức là cần quản lý tốt "ai có thể vào hệ thống phân quyền, ai có thể quản lý phân quyền của các hệ thống khác". User của chính hệ thống phân quyền được chia thành 3 loại:

1. **Super Admin**: Có toàn quyền thao tác hệ thống phân quyền, có thể thực hiện bất kỳ thao tác nào trong hệ thống và quản lý các hệ thống ứng dụng đã kết nối với phân quyền.
2. **Permission Operator**: User có role super admin của ít nhất một hệ thống ứng dụng đã kết nối. User này chỉ có thể thực hiện các thao tác trong phạm vi quyền của các hệ thống ứng dụng mình quản lý. Permission Operator là một loại identity, không cần phân công mà được tự động có dựa trên quy tắc.
3. **Normal User**: Normal user cũng có thể coi là một loại identity, ngoài 2 loại trên, tất cả còn lại đều là normal user. Họ chỉ có thể xin kết nối hệ thống và truy cập trang xin cấp quyền.

### Định nghĩa các loại quyền

Trong hệ thống phân quyền mới, chúng tôi chia quyền thành 2 loại:

- **Menu Function Permission**: Bao gồm quyền truy cập directory navigation, menu của hệ thống, cũng như quyền thao tác button và API
- **Data Permission**: Bao gồm định nghĩa phạm vi truy vấn data, trong các hệ thống khác nhau thường gọi là "organization", "site", v.v. Trong hệ thống phân quyền mới, thống nhất gọi là "organization" để quản lý data permission

### Phân loại default role

Mỗi hệ thống được thiết kế 3 default role để đáp ứng nhu cầu quản lý phân quyền cơ bản:

- **Super Admin**: Role này có toàn quyền trong hệ thống đó, có thể sửa cấu hình role permission, có thể ủy quyền cho user khác.
- **System Admin**: Role này có khả năng ủy quyền cho user khác và sửa cấu hình role permission, nhưng bản thân role không có bất kỳ quyền nào.
- **Authorization Admin**: Role này có khả năng ủy quyền cho user khác. Nhưng phạm vi ủy quyền không vượt quá quyền mà mình đang có.

> Ví dụ: Authorization Admin A có thể thêm quyền cho user B, nhưng phạm vi thêm nhỏ hơn hoặc bằng quyền mà user A đang có.

Qua sự phân chia này, **có quyền** và **có khả năng ủy quyền** được tách biệt, có thể đáp ứng tất cả các scenario kiểm soát phân quyền.

## Thiết kế core module của hệ thống phân quyền mới

Phần trên đã giới thiệu tư tưởng thiết kế tổng thể của hệ thống phân quyền mới, tiếp theo giới thiệu lần lượt thiết kế các core module.

### Quản lý hệ thống/menu/data permission

Các bước để kết nối một hệ thống mới vào hệ thống phân quyền:

1. Tạo hệ thống
2. Cấu hình menu function permission
3. Cấu hình data permission (tùy chọn)
4. Tạo role cho hệ thống

Trong đó, bước 1, 2, 3 đều được thực hiện trong module quản lý hệ thống, quy trình cụ thể như hình dưới:

![Sơ đồ quy trình kết nối hệ thống](/images/github/javaguide/system-design/security/design-of-authority-system/new-authority-system-design-access-flow-chart.png)

User có thể thực hiện CRUD trên thông tin cơ bản của hệ thống, các hệ thống khác nhau được phân biệt duy nhất bằng `system code`. Đồng thời `system code` cũng được dùng làm prefix cho menu và data permission code, qua thiết kế này đảm bảo permission code duy nhất toàn cục.

Ví dụ system code là `test_online`, thì format menu code của hệ thống đó sẽ là `test_online:m_xxx`.

Giao diện quản lý hệ thống được thiết kế như sau:

![Thiết kế giao diện quản lý hệ thống](/images/github/javaguide/system-design/security/design-of-authority-system/new-authority-system-management-interface.png)

#### Quản lý menu

Hệ thống phân quyền mới phân loại menu thành `directory`, `menu` và `operation`, minh họa như hình dưới:

![Giao diện quản lý menu](/images/github/javaguide/system-design/security/design-of-authority-system/new-authority-system-menu.png)

Ý nghĩa của chúng lần lượt là:

- **Directory**: Là directory cấp đầu tiên trên cùng của hệ thống ứng dụng, thường ở bên phải logo hệ thống
- **Menu**: Là multi-level menu ở phía trái hệ thống ứng dụng, thường ở bên dưới logo hệ thống, cũng là cấu trúc menu được dùng nhiều nhất
- **Operation**: Là button, API và các phần tử có thể định nghĩa là operation hoặc page element trong trang.

Giao diện quản lý menu được thiết kế như sau:

![Thiết kế giao diện quản lý menu](/images/github/javaguide/system-design/security/design-of-authority-system/new-authority-system-menu-management-interface.png)

Dữ liệu menu permission cũng cung cấp hai cách sử dụng:

- **Dynamic menu mode**: Trong mode này, việc thêm/xóa menu hoàn toàn do hệ thống phân quyền quản lý. Tức là thêm menu trong hệ thống phân quyền, hệ thống ứng dụng sẽ đồng bộ thêm theo. Ưu điểm của mode này là sửa menu không cần deploy lại project.
- **Static menu mode**: Việc thêm/xóa menu do frontend của hệ thống ứng dụng kiểm soát, hệ thống phân quyền chỉ kiểm soát access permission. Trong mode này, hệ thống phân quyền chỉ đánh dấu user có quyền truy cập menu hiện tại hay không, còn việc hiển thị cụ thể do frontend quyết định dựa trên permission data.

### Quản lý role và user

Quản lý role và user đều là các core module có thể trực tiếp thay đổi quyền của user, toàn bộ tư tưởng thiết kế như hình dưới:

![Thiết kế module quản lý role và user](/images/github/javaguide/system-design/security/design-of-authority-system/role-and-user-management.png)

Điểm trọng tâm trong thiết kế module này là cần tính đến batch operation. Dù là liên kết user thông qua role, hay thêm/xóa/reset quyền hàng loạt cho user, các scenario batch operation đều cần được thiết kế tốt.

### Xin cấp quyền

Ngoài việc thêm quyền cho user khác, hệ thống phân quyền mới còn hỗ trợ user tự xin cấp quyền. Module này ngoài quy trình phê duyệt thông thường (xin, phê duyệt, xem), có một tính năng khá đặc biệt là làm thế nào để user chọn đúng quyền mình cần. Vì vậy trong thiết kế module này, ngoài việc chọn trực tiếp role, còn hỗ trợ chọn ngược role thông qua menu/data permission point, như hình dưới:

![Giao diện xin cấp quyền](/images/github/javaguide/system-design/security/design-of-authority-system/permission-application.png)

### Operation log

System operation log được chia thành 2 loại lớn:

1. **Operation audit log**: Log các thao tác quan trọng mà user có thể xem và tra cứu
2. **Service log**: Log được tạo ra trong quá trình service của hệ thống chạy. Trong đó, thông tin trong service log nhiều hơn operation audit log, nhưng không tiện tìm kiếm xem. Vì vậy hệ thống phân quyền cần cung cấp chức năng operation audit log.

Trong hệ thống phân quyền mới, tất cả thao tác của user có thể chia thành 3 loại: tạo mới, cập nhật, xóa. Tất cả module cũng có thể enumerable, ví dụ quản lý user, quản lý role, quản lý menu, v.v. Khi xác định được những thông tin này, một log record có thể được trừu tượng hóa thành: Ai (Who) vào lúc nào (When) đã thực hiện thao tác gì trên module nào của đối tượng nào (Target). Như vậy lưu tất cả record vào database, có thể dễ dàng xem và lọc log.

## Tổng kết và triển vọng

Đến đây, các tư tưởng thiết kế cốt lõi và module của hệ thống phân quyền mới đã được giới thiệu đầy đủ. Hệ thống mới được nhiều nghiệp vụ trong Zhuanzhuan kết nối sử dụng, quản lý phân quyền so với trước đây thuận tiện hơn rất nhiều. Hệ thống phân quyền là một hệ thống nền tảng của mỗi công ty, thiết kế linh hoạt và đầy đủ có thể giúp sự phát triển nghiệp vụ trong tương lai hiệu quả hơn.

Hai bài tiếp theo:

- [Thiết kế và triển khai hệ thống phân quyền thống nhất Zhuanzhuan (Backend Implementation)](https://mp.weixin.qq.com/s/hFTDckfxhSnoM_McP18Vkg)
- [Thiết kế và triển khai hệ thống phân quyền thống nhất Zhuanzhuan (Frontend Implementation)](https://mp.weixin.qq.com/s/a_P4JAwxgunhfmJvpBnWYA)

## Tài liệu tham khảo

- Chọn mô hình kiểm soát truy cập phù hợp: <https://docs.authing.cn/v2/guides/access-control/choose-the-right-access-control-model.html>

<!-- @include: @article-footer.snippet.md -->
