---
title: Hướng dẫn thực chiến thiết kế Distributed ID
category: Distributed
description: Hướng dẫn thực chiến thiết kế Distributed ID, kết hợp các tình huống nghiệp vụ như order system, aggregate payment QR, coupon để giải thích các điểm thiết kế, lựa chọn kỹ thuật và chiến lược sinh ID trong các tình huống khác nhau.
tag:
  - Distributed ID
head:
  - - meta
    - name: keywords
      content: distributed ID,distributed ID design,order ID generation,coupon ID,aggregate payment QR,ID generation strategy,distributed system design
---

::: tip

Đọc được một bài của Baidu Geek bàn về thiết kế distributed ID kết hợp với các tình huống cụ thể, thấy khá hay. Vì vậy tôi đã tổng hợp một phần nội dung bài đó vào đây. Link bài gốc: [Nguyên lý kỹ thuật và thực chiến dự án của ID Generation Service](https://mp.weixin.qq.com/s/bFDLb6U6EgI-DvCdLTq_QA).

:::

Hầu hết các bài về distributed ID generation service trên mạng đều tập trung phân tích nguyên lý kỹ thuật. Rất hiếm thấy bài hướng dẫn chọn ID generation service dựa trên tình huống nghiệp vụ cụ thể.

Bài này kết hợp một số tình huống sử dụng để khám phá sâu hơn các yêu cầu cụ thể đối với ID trong tình huống nghiệp vụ.

## Tình huống 1: Order System

Khi mua hàng ở siêu thị, chúng ta thấy QR code thanh toán một mã, order number khi đặt hàng, coupon code dùng được, joint product redemption code — đây đều là các order number thường gặp khi mua sắm online. Tại sao một số order number rất dài, một số chỉ vài chữ số? Một số nhìn là biết ngày tháng năm, một số lại không mang ý nghĩa gì? Dưới đây phân tích cụ thể triển khai ID service trong các tình huống khác nhau của order system.

### 1. Aggregate Payment QR (Thanh toán một mã)

Aggregate payment QR phổ biến mà chúng ta thấy là một QR code có thể scan bằng Alipay hoặc WeChat để thanh toán.

Bản chất QR code là một string. Bản chất aggregate code là một URL. Người dùng dùng Alipay hay WeChat scan một mã để thanh toán, không cần lo nhầm Alipay scan WeChat payment QR hay ngược lại. Điều này giảm đáng kể thời gian scan QR payment của người dùng.

Nguyên lý triển khai: Sau khi user scan mã bằng APP, backend website sẽ xác định môi trường scan của user (WeChat, Alipay, QQ Wallet, JD Pay, UnionPay, v.v.).

Nguyên lý xác định môi trường scan là dựa trên HTTP header của trình duyệt mở link. Khi bất kỳ trình duyệt nào mở link HTTP, header của request đều có thông tin User-Agent (UA).

UA là một string header đặc biệt. Server có thể nhận dạng được OS và phiên bản, loại CPU, trình duyệt và phiên bản, browser rendering engine, ngôn ngữ trình duyệt, browser plugin, v.v. từ đó.

Tên sản phẩm thanh toán tương ứng của các kênh khác nhau không giống nhau — phải xem kỹ API documentation của từng sản phẩm thanh toán.

1. WeChat Pay: JSAPI Payment
2. Alipay: Mobile Web Payment
3. QQ Wallet: Public Account Payment

Bản chất đều là triển khai HTML5 payment trong in-app browser.

![Ví dụ payment thư viện tài liệu](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/distributed-id-design-pay-one-card.png)

Team R&D của Wenku đã tối ưu và cải tiến ý tưởng này. Tạo động QR code aggregate payment đã được binding sẵn thông tin sản phẩm và giá mà user chọn, cập nhật động theo sản phẩm user chọn. Điều này không chỉ hỗ trợ một mã kích hoạt thanh toán đa nền tảng, mà còn không cần user chọn sản phẩm nhập số tiền mới thanh toán được đơn hàng — rất mượt mà. Sau khi user thực sự scan mã, server mới lấy UID user qua frontend, kết hợp với thông tin sản phẩm đã binding trong QR code, thực sự tạo order và gửi thông tin thanh toán đến third-party (QQ, WeChat, Alipay). Third-party tạo payment order đẩy xuống thiết bị user, từ đó kích hoạt thanh toán.

Khác với aggregate payment cố định, trong ứng dụng Wenku dùng dynamic QR code. QR code bản chất là một short URL. ID service cung cấp tham số định danh duy nhất cho short URL. Short URL duy nhất map đến ID đã binding thông tin order của sản phẩm. Kết hợp sâu kỹ thuật và nghiệp vụ, rút ngắn flow thanh toán, cải thiện trải nghiệm thanh toán của user.

### 2. Order Number

Order number trong quá trình nghiệp vụ thực tế tồn tại như mã định danh duy nhất của một đơn hàng, thường dùng cho các tình huống nghiệp vụ sau:

1. User gặp vấn đề với đơn hàng, cần liên hệ customer service hỗ trợ.
2. Thao tác với đơn hàng như thu tiền offline, verify đơn hàng.
3. Đặt hàng, sửa đơn, chốt đơn, hủy đơn, after-sales và các xử lý, theo dõi flow đơn hàng nội bộ hệ thống.

Khi search thông tin liên quan đơn hàng thường dùng order ID làm unique identifier — vì tính duy nhất trong quy tắc sinh order number quyết định điều này. Từ góc độ kỹ thuật, ngoài các tính chất cần thiết của ID service, thiết kế order number cần thể hiện một vài đặc tính:

**(1) Information security (Bảo mật thông tin)**

Order number không được để lộ tình trạng kinh doanh của công ty như doanh số ngày, serial number công ty, cùng thông tin kinh doanh và thông tin riêng tư như số điện thoại, CMND user. Đồng thời không được có quy luật tổng thể rõ ràng (có thể có quy luật cục bộ) — chỉ cần thay đổi một ký tự là query được thông tin đơn hàng khác, điều này cũng không cho phép.

Tương tự quy tắc sinh số báo danh thi đại học — không thể là số liên tiếp, không thì chỉ cần tra theo thứ tự là tìm được điểm của thí sinh khác — tuyệt đối không cho phép.

**(2) Partial readability (Đọc được một phần)**

Số chữ số phải tiện thao tác, yêu cầu độ dài order number vừa phải và có quy luật cục bộ. Như vậy tiện cho customer service tra cứu khi đơn hàng bất thường hay trả hàng.

Order number quá dài hay khó đọc sẽ khiến customer service khó nhập và tỷ lệ sai cao, ảnh hưởng trải nghiệm after-sales của user. Vì vậy trong tình huống nghiệp vụ thực tế, thiết kế order number thường mang theo một số thông tin cho phép công khai hữu ích cho tình huống sử dụng như thời gian, ngày trong tuần, loại, v.v. — chủ yếu dựa trên tình huống sử dụng của order number liên quan.

Hơn nữa, các yếu tố tự tăng như thời gian, ngày trong tuần làm một phần element của thiết kế order number giúp giải quyết vấn đề order number trùng lặp do tích lũy nghiệp vụ gây ra.

**(3) Query efficiency (Hiệu quả query)**

Hầu hết order number của các e-commerce platform phổ biến đều là số thuần túy. Vừa có readability, type `int` có query efficiency cao hơn type `varchar`, thân thiện hơn với online business.

### 3. Coupon và Redemption Code

Coupon và redemption code là một trong những công cụ khuyến mãi phổ biến nhất. Sử dụng hợp lý chúng có thể cho người mua hưởng ưu đãi, giúp người bán tăng doanh số. Các tình huống phổ biến:

1. Mua sản phẩm joint [Wenku VIP + QQ Music annual card] trên Wenku, sau khi thanh toán thành công sẽ nhận được redemption code cho QQ Music annual card, có thể vào QQ Music App để đổi thành music member annual card.
2. Trong thời kỳ dịch bệnh, một số chính quyền địa phương phát phiếu tiêu dùng.
3. Đồ uống đóng chai thường có nhập mã ưu đãi để đổi quà.

![Đổi quà bằng mã ưu đãi](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/distributed-id-design-coupon.png)

Từ góc độ kỹ thuật, một số tình huống phù hợp sinh ID ngay lúc dùng, như coupon nhận khi mua sắm trên e-commerce platform — chỉ cần phân bổ thông tin coupon khi user nhận là được. Một số tình huống kết hợp online/offline như phiếu giảm giá mùa dịch, nắp chai bốc thăm, thẻ JD, thẻ siêu thị cần sinh trước. Coupon code được sinh trước có các đặc tính sau:

1. Sinh trước, cung cấp để warm up trước khi event chính thức bắt đầu.
2. Số lượng coupon lớn, đơn vị là vạn, thường trên 100 nghìn.
3. Không thể crack hay làm giả.
4. Hỗ trợ verify sau khi dùng.
5. Coupon, redemption code thuộc chiến lược rải rộng nên tỷ lệ sử dụng thấp — không phù hợp lưu trong database **(tốn không gian, data hợp lệ lại ít)**.

Về tư duy thiết kế, cần thiết kế một chiến lược sinh redemption code hiệu quả — hỗ trợ sinh trước, hỗ trợ validation, nội dung ngắn gọn, các redemption code được sinh ra đều có tính duy nhất. Chiến lược như vậy là một chiến lược encoding/decoding đặc biệt — tuân thủ quy tắc encoding/decoding đã thỏa thuận để đáp ứng các yêu cầu trên.

Vì là quy tắc encoding/decoding, cần thỏa thuận encoding space (tức ký tự tạo nên redemption code mà user thấy). Encoding space gồm ký tự a-z, A-Z, số 0-9. Để tăng khả năng nhận dạng redemption code, loại bỏ chữ hoa O và I. Các ký tự khả dụng như sau, tổng 60 ký tự:

`abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXZY0123456789`

Đã nói redemption code cần ngắn gọn nhất có thể, nên khi thiết kế cần xem xét số ký tự. Giả sử giới hạn trên là 12 chữ, character space có 60 ký tự, thì phạm vi có thể biểu thị là 60^12=130606940160000000000000 (tức redemption code 12 chữ có thể sinh ra số lượng khổng lồ — đủ cho team marketing dùng thoải mái). Chuyển sang nhị phân:

`1001000100000000101110011001101101110011000000000000000000000` (61 bit)

**Phân tích thành phần redemption code**

Redemption code có thể sinh trước và không cần không gian lưu trữ thêm. Mỗi phương án ưu đãi có một nhóm redemption code độc lập (tức mỗi event marketing do team marketing tổ chức đều có redemption code riêng, không thể dùng lẫn — ví dụ redemption code Double 11 không thể dùng cho Double 12). Mỗi redemption code có số thứ tự riêng để tránh trùng lặp. Để đảm bảo tính hợp lệ, data của redemption code cần được validate. Cấu trúc data của redemption code hiện tại:

Promotion Scheme ID + Redemption code serial number i + Checksum

**Phương án encoding**

1. Redemption code serial number i: Biểu thị redemption code hiện tại là redemption code thứ i trong event hiện tại. Phạm vi của redemption code serial number quyết định số lượng redemption code có thể phát hành. Hiện dùng 30 bit để biểu thị, phạm vi: 1073741824 (1 tỷ code).
2. Promotion Scheme ID: Biểu thị ID của phương án ưu đãi hiện tại. Phạm vi của promotion scheme quyết định số lần có thể tổ chức event ưu đãi. Hiện dùng 15 bit để biểu thị, phạm vi: 32768 (xem xét tần suất event marketing và giá trị khởi đầu ID là 10000, 15 bit là đủ — 365 ngày mỗi ngày có event marketing có thể dùng 54 năm).
3. Checksum: Validate xem redemption code có hợp lệ không — chủ yếu để nhanh chóng validate thông tin redemption code có đúng không, ngoài ra có thể fill data để tăng tính phân tán của data. Dùng 13 bit để biểu thị checksum, chia thành hai phần: 6 bit đầu và 7 bit sau.

Khi đào sâu nghiệp vụ còn có phân biệt universal coupon và individual coupon, mỗi loại có đặc điểm riêng — triển khai kỹ thuật cần suy nghĩ phù hợp với tình huống:

1. Universal coupon: Nhiều player đều có thể nhập đổi, có giới hạn tổng số lượng và hạn dùng.
2. Individual coupon: Team marketing có thể đặt vật phẩm thưởng, hạn dùng, số lượng của redemption code qua backend, rồi backend sinh danh sách redemption code. Sau khi đổi thì verify.

## Tình huống 2: Tracing

### 1. Log Tracking

Trong distributed service architecture, một Web request từ khi vào gateway có thể gọi nhiều service để xử lý request và lấy kết quả cuối. Trong quá trình này, giao tiếp giữa các service là network request độc lập. Dù bất kỳ service nào trong đường truyền bị lỗi hay xử lý chậm đều ảnh hưởng đến frontend.

Để xử lý một Web request cần gọi nhiều service. Để dễ dàng query service nào bị lỗi, giải pháp phổ biến hiện nay là giới thiệu distributed tracing cho toàn hệ thống.

![Distributed Tracing](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/distributed-id-design-tracing.png)

Trong distributed tracing có hai khái niệm quan trọng: trace (theo dõi) và span (khoảng). Trace là toàn bộ link view của request trong distributed system. Span đại diện cho view bên trong các service khác nhau trong toàn bộ link. Các span kết hợp lại là toàn bộ trace view.

Trong toàn bộ call chain của request, request sẽ mang traceid truyền xuống các downstream service. Mỗi service bên trong cũng tạo spanid riêng để tạo internal call view của mình, và truyền cùng traceid xuống downstream service.

### 2. Quy tắc sinh TraceId

Trong tình huống này, ngoài yêu cầu ID phải duy nhất, còn yêu cầu sinh hiệu quả cao, throughput lớn. traceid cần có khả năng tự sinh bởi server instance ở access layer. Nếu mỗi ID trong trace đều cần request đến ID service chung để sinh, đó là lãng phí thuần túy bandwidth mạng. Và sẽ block request user truyền xuống downstream, tăng response latency, thêm rủi ro không cần thiết. Vì vậy server instance tốt nhất tự tính được traceid, spanid — tránh phụ thuộc external service.

Quy tắc sinh: Server IP + Thời gian sinh ID + Auto-increment sequence + Process ID hiện tại, ví dụ:

`0ad1348f1403169275002100356696`

8 chữ số đầu `0ad1348f` là IP của máy sinh TraceId — đây là số hex. Mỗi hai chữ số biểu thị một phần của IP. Chuyển sang thập phân mỗi hai chữ số sẽ có IP `10.209.52.143`. Bạn cũng có thể dùng quy luật này để tìm server đầu tiên mà request đi qua.

13 chữ số tiếp theo `1403169275002` là thời gian sinh TraceId. 4 chữ số tiếp `1003` là sequence tự tăng, từ 1000 tăng lên 9000, đến 9000 thì quay về 1000 và tăng lại. 5 chữ số cuối `56696` là process ID hiện tại — để tránh TraceId conflict khi nhiều process trên cùng một máy, nên thêm process ID hiện tại vào cuối TraceId.

### 3. Quy tắc sinh SpanId

Span là tầng. Ví dụ instance đầu tiên là tầng 1, request được proxy hay phân phối đến instance tiếp theo xử lý là tầng 2, cứ thế tiếp theo. Thông qua tầng, SpanId biểu thị vị trí của call này trong toàn bộ call chain tree.

Giả sử server instance A nhận một user request — đây là root node của toàn bộ call. Các log không phải service call do A xử lý request này sinh ra thì spanid đều là 0. A cần gọi B, C, D ba server instance lần lượt qua RPC, thì trong log của A, SpanId lần lượt là 0.1, 0.2 và 0.3; trong B, C, D SpanId cũng lần lượt là 0.1, 0.2 và 0.3. Nếu C khi xử lý request lại gọi E, F hai server instance, thì SpanId tương ứng trong C là 0.2.1 và 0.2.2; log tương ứng trong E, F cũng là 0.2.1 và 0.2.2.

Từ mô tả trên có thể thấy, nếu thu thập tất cả SpanId trong một lần call, có thể tạo thành một link tree hoàn chỉnh.

**Bản chất sinh spanid: Trong quá trình truyền xuyên tầng, kiểm soát tự tăng major/minor version number để thực hiện.**

## Tình huống 3: Short URL

Short URL chủ yếu bao gồm hai chức năng: rút ngắn URL và khôi phục URL. So với long URL, short URL tiện truyền bá hơn qua email, social network, Weibo và mobile. Ví dụ long URL rất dài thông qua short URL service có thể tạo ra short URL tương ứng, tránh xuống hàng hay vượt quá giới hạn ký tự.

![Tác dụng của Short URL](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/distributed-id-design-short-url.png)

Các ID generation service phổ biến như MySQL ID auto-increment, Redis key auto-increment, segment mode, đều sinh ID là một chuỗi số. Short URL service chuyển đổi long URL của user thành short URL.

Thực chất là ghép numeric ID mới sinh ra vào sau domain `dwz.cn`. Dùng trực tiếp numeric ID thì URL cũng hơi dài. Service có thể nén độ dài bằng cách chuyển numeric ID sang hệ đếm cao hơn. Thuật toán này ngày càng được dùng nhiều trong triển khai kỹ thuật short URL — có thể nén thêm độ dài URL. Thuật toán chuyển đổi hệ đếm có rất nhiều ứng dụng trong cuộc sống:

- Long URL của user: <https://wenku.baidu.com/ndbusiness/browse/wenkuvipcashier?cashier_code=PCoperatebanner>
- Short URL mapping ID: <https://dwz.cn/2047601319t66> (chỉ để minh họa, có thể không mở được)
- Short URL sau khi chuyển hệ đếm: <https://dwz.cn/2ezwDJ0> (chỉ để minh họa, có thể không mở được)

<!-- @include: @article-footer.snippet.md -->
