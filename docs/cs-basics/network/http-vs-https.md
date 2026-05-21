---
title: HTTP vs HTTPS（Tầng ứng dụng）
description: So sánh giao thức HTTP và HTTPS về cơ chế bảo mật, phân tích nguyên lý hoạt động và quá trình handshake của SSL/TLS, làm rõ các chi tiết triển khai bảo mật ở tầng ứng dụng.
category: Kiến thức cơ bản máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: HTTP,HTTPS,SSL,TLS,mã hóa,xác thực,cổng,bảo mật,quá trình handshake
---

## Giao thức HTTP

### Giới thiệu giao thức HTTP

Giao thức HTTP, tên đầy đủ là HyperText Transfer Protocol (Giao thức truyền tải siêu văn bản). Đúng như tên gọi, HTTP được dùng để quy chuẩn việc truyền tải siêu văn bản — tức là các loại thông điệp trên mạng bao gồm văn bản và nhiều dạng khác. Cụ thể hơn, HTTP chủ yếu quy chuẩn hành vi của trình duyệt và server.

Ngoài ra, HTTP là giao thức không trạng thái (stateless), nghĩa là server không lưu trữ bất kỳ thông tin nào về các request trước đó của client. Đây thực ra là cách tiếp cận đơn giản hóa có chủ đích — các giao thức có trạng thái phức tạp hơn nhiều vì phải duy trì trạng thái (lịch sử thông tin), và nếu client hoặc server gặp sự cố, trạng thái sẽ không nhất quán, chi phí giải quyết sự không nhất quán này rất cao.

### Quá trình giao tiếp HTTP

HTTP là giao thức tầng ứng dụng, sử dụng TCP (tầng vận chuyển) làm giao thức nền tảng, cổng mặc định là 80. Quá trình giao tiếp diễn ra như sau:

1. Server lắng nghe request từ client trên cổng 80.
2. Trình duyệt khởi tạo kết nối TCP đến server (tạo Socket).
3. Server chấp nhận kết nối TCP từ trình duyệt.
4. Trình duyệt (HTTP client) và Web server (HTTP server) trao đổi các HTTP message.
5. Đóng kết nối TCP.

### Ưu điểm của giao thức HTTP

Khả năng mở rộng tốt, tốc độ nhanh, hỗ trợ đa nền tảng tốt.

## Giao thức HTTPS

### Giới thiệu giao thức HTTPS

Giao thức HTTPS (HyperText Transfer Protocol Secure) là phiên bản HTTP được tăng cường bảo mật. HTTPS xây dựng trên nền HTTP, cũng dùng TCP làm giao thức nền tảng, và bổ sung thêm giao thức SSL/TLS để mã hóa và xác thực bảo mật. Cổng mặc định là 443.

Trong HTTPS, sau khi hoàn thành TLS handshake, dữ liệu giao tiếp được bảo vệ bằng thuật toán mã hóa đối xứng (như AES-128-GCM hoặc AES-256-GCM), khóa được thương lượng sinh ra trong giai đoạn handshake thông qua mã hóa bất đối xứng (như RSA-2048/4096 hoặc ECDH). Khóa 40 bit từ SSL thời kỳ đầu đã bị loại bỏ do không đủ độ an toàn; TLS hiện đại yêu cầu khóa đối xứng ít nhất 128 bit.

### Ưu điểm của giao thức HTTPS

Bảo mật tốt hơn, độ tin cậy cao hơn.

## Cốt lõi của HTTPS — Giao thức SSL/TLS

HTTPS đạt được yêu cầu bảo mật cao nhờ kết hợp SSL/TLS với TCP, mã hóa dữ liệu truyền thông, giải quyết vấn đề dữ liệu HTTP truyền thông dưới dạng plain text. Phần tiếp theo sẽ giới thiệu chi tiết nguyên lý hoạt động của SSL/TLS.

### Sự khác biệt giữa SSL và TLS?

**SSL và TLS không có nhiều khác biệt.**

SSL là viết tắt của Secure Sockets Layer, lần đầu phát hành năm 1996 (SSL 3.0). SSL 1.0 chưa bao giờ được ra mắt, SSL 2.0 có nhiều lỗ hổng nghiêm trọng (lỗ hổng DROWN — Decrypting RSA with Obsolete and Weakened eNcryption). Không lâu sau, năm 1999, SSL 3.0 được nâng cấp và **phiên bản mới được đặt tên là TLS 1.0**. Do đó, TLS được xây dựng trên cơ sở SSL, nhưng theo thói quen, giao thức mã hóa cốt lõi trong HTTPS thường được gọi chung là SSL/TLS. Hiện tại SSL đã bị loại bỏ hoàn toàn, TLS 1.2 và TLS 1.3 là tiêu chuẩn thực tế của HTTPS hiện đại.

### Nguyên lý hoạt động của SSL/TLS

#### Mã hóa bất đối xứng

Yếu tố cốt lõi của SSL/TLS là **mã hóa bất đối xứng**. Mã hóa bất đối xứng sử dụng hai khóa — một public key (khóa công khai) và một private key (khóa riêng tư). Trong quá trình giao tiếp, private key chỉ được lưu giữ bởi bên giải mã, còn public key được biết bởi bất kỳ ai muốn giao tiếp với bên giải mã. Hãy tưởng tượng một kịch bản:

> Tại một bưu điện tự phục vụ, mỗi kênh giao tiếp là một hộp thư. Mỗi chủ hộp thư dựng một biển hiệu bên cạnh, treo một chiếc chìa khóa: "Đây là public key của tôi, người gửi hãy bỏ thư vào hộp và khóa bằng public key này."
>
> Nhưng public key chỉ có thể khóa, không thể mở khóa. Chỉ có chủ hộp thư mới mở được — vì chỉ họ mới giữ private key.
>
> Như vậy, thông tin giao tiếp sẽ không bị người khác đánh chặn, phụ thuộc vào tính bảo mật của private key.

![](./images/http-vs-https/public-key-cryptography.png)

Public key và private key trong mã hóa bất đối xứng được tạo ra thông qua cơ chế toán học phức tạp (mật mã học cho rằng để đảm bảo bảo mật cao, không nên tự tạo ra các cơ chế mã hóa). Thuật toán sinh cặp public/private key dựa trên hàm một chiều có cửa sập (one-way trapdoor function).

> Hàm một chiều: Biết hàm một chiều f, cho bất kỳ đầu vào x, dễ tính đầu ra y=f(x); nhưng cho đầu ra y, giả sử tồn tại f(x)=y, rất khó tính ngược x từ f.
>
> Hàm một chiều có cửa sập: Một dạng hàm một chiều yếu hơn. Biết hàm một chiều có cửa sập f và cửa sập h, cho bất kỳ đầu vào x, dễ tính đầu ra y=f(x;h); nhưng cho đầu ra y, giả sử tồn tại f(x;h)=y, rất khó tính x chỉ từ f, nhưng có thể suy ra x từ f và h.

![Hàm một chiều](./images/http-vs-https/OWF.png)

Hình trên minh họa hàm một chiều (không phải hàm một chiều có cửa sập). Giả sử có một bí kíp tuyệt thế, bất kỳ ai biết bí kíp này đều có thể tái tạo táo từ nước ép táo, thì bí kíp đó chính là "cửa sập".

Ở đây, phương pháp tính của hàm f tương đương với public key, cửa sập h tương đương với private key. Public key f là công khai, bất kỳ ai với đầu vào đã có đều có thể mã hóa bằng f, nhưng để khôi phục thông tin gốc từ thông tin mã hóa, nhất thiết phải có private key.

#### Mã hóa đối xứng

Hai bên giao tiếp sử dụng SSL/TLS cần dùng mã hóa bất đối xứng, nhưng mã hóa bất đối xứng sử dụng các thuật toán toán học phức tạp, trong quá trình giao tiếp thực tế chi phí tính toán cao, hiệu suất thấp. Do đó, SSL/TLS thực tế mã hóa message bằng mã hóa đối xứng.

> Mã hóa đối xứng: Hai bên giao tiếp chia sẻ khóa k duy nhất, thuật toán mã hóa/giải mã đã biết, bên mã hóa dùng khóa k để mã hóa, bên giải mã dùng khóa k để giải mã, tính bảo mật phụ thuộc vào tính bí mật của khóa k.

![](./images/http-vs-https/symmetric-encryption.png)

Chi phí tạo khóa đối xứng thấp hơn nhiều so với cặp public/private key, vậy tại sao SSL/TLS vẫn cần mã hóa bất đối xứng? Vì tính bảo mật của mã hóa đối xứng hoàn toàn phụ thuộc vào tính bí mật của khóa. Trước khi hai bên giao tiếp, cần thỏa thuận một khóa dùng cho mã hóa đối xứng. Chúng ta biết rằng kênh truyền thông mạng không an toàn, các gói tin truyền đi đều có thể bị nhìn thấy bởi bất kỳ ai, nên khóa không thể trao đổi trực tiếp trên kênh mạng. Do đó, mã hóa bất đối xứng được dùng để mã hóa khóa đối xứng, bảo vệ khóa này khỏi bị nghe lén trên kênh mạng. Như vậy, hai bên giao tiếp chỉ cần một lần mã hóa bất đối xứng để trao đổi khóa đối xứng, sau đó trong các lần giao tiếp tiếp theo dùng khóa tuyệt đối an toàn này để mã hóa đối xứng thông tin, đảm bảo tính bảo mật của message truyền tải.

#### Độ tin cậy của việc truyền tải public key

Đến đây trong quá trình giới thiệu SSL/TLS, những ai am hiểu về bảo mật thông tin sẽ nghĩ đến một rủi ro bảo mật, hãy xem xét kịch bản sau:

> Client C và server S muốn giao tiếp bằng SSL/TLS. Theo nguyên lý trên, C cần biết public key của S trước, và cách duy nhất để nhận public key của S là truyền nó trên kênh mạng. Cần lưu ý một số tiền đề trong giao tiếp mạng:
>
> 1. Bất kỳ ai đều có thể bắt gói tin
> 2. Tính bảo mật của gói tin do người gửi thiết kế
> 3. Cơ chế thiết kế thuật toán mã hóa mặc định là công khai, còn (khóa giải mã) mặc định là bí mật
>
> Do đó, giả sử public key của S không được mã hóa, truyền thẳng trên kênh, thì rất có thể tồn tại kẻ tấn công A, gửi cho C một gói tin giả mạo, giả vờ là public key của S nhưng thực ra là public key của server bẫy AS. Khi C nhận được public key của AS (mà tưởng là của S), C sau đó sẽ dùng public key của AS để mã hóa dữ liệu và truyền trên kênh công khai. Khi đó A bắt các gói tin mã hóa này, dùng private key của AS giải mã, là đã đánh chặn được nội dung C định gửi cho S, trong khi C và S hoàn toàn không biết.
>
> Tương tự, public key của S dù có được mã hóa cũng khó tránh khỏi vấn đề tin cậy này — C đã bị AS "câu dẫn" mất rồi!

![](./images/http-vs-https/attack1.png)

Để giải quyết vấn đề tin cậy trong truyền tải public key, tổ chức bên thứ ba ra đời — CA (Certificate Authority — Tổ chức cấp chứng chỉ). CA mặc định là bên thứ ba đáng tin cậy. CA cấp chứng chỉ cho các server, chứng chỉ được lưu trên server và kèm theo **chữ ký điện tử** của CA (xem phần tiếp theo).

Khi client (trình duyệt) gửi HTTPS request đến server, nhất thiết phải lấy chứng chỉ của server đó trước, kiểm tra tính hợp lệ của chứng chỉ dựa trên thông tin trong đó. Nếu client phát hiện chứng chỉ không hợp lệ, lỗi sẽ xảy ra. Sau khi client lấy được chứng chỉ của server, vì tính tin cậy của chứng chỉ đã được tổ chức thứ ba xác nhận, và chứng chỉ chứa thông tin public key của server, client có thể tin tưởng rằng public key trong chứng chỉ chính là public key của server đích.

#### Chữ ký số

Đến phần này là phần cuối của SSL/TLS rồi. Phần trước đã đề cập đến chữ ký số. Vấn đề mà chữ ký số cần giải quyết là ngăn chặn chứng chỉ bị giả mạo. Lý do CA đáng tin cậy chính là **nhờ công nghệ chữ ký số**.

Chữ ký số là kỹ thuật kết hợp hash và mã hóa được CA dùng khi cấp chứng chỉ cho server, đóng dấu lên chứng chỉ để cung cấp chức năng xác minh giả mạo. Quy trình cụ thể như sau:

> CA biết public key của server, áp dụng kỹ thuật hash lên chứng chỉ để tạo ra một digest (bản tóm tắt). CA dùng CA private key mã hóa digest này và đính kèm vào cuối chứng chỉ, gửi cho server.
>
> Bây giờ server gửi chứng chỉ đó đến client, client cần xác minh danh tính chứng chỉ. Client tìm đến CA, lấy CA public key, dùng CA public key giải mã chữ ký của chứng chỉ, thu được digest do CA tạo ra.
>
> Client áp dụng cùng một thuật toán hash lên dữ liệu chứng chỉ (bao gồm public key của server) để thu được digest, rồi so sánh digest này với digest vừa giải mã từ chữ ký. Nếu giống nhau thì xác minh thành công; ngược lại thì thất bại.

![](./images/http-vs-https/digital-signature.png)

Tóm lại, cơ chế truyền tải public key kèm chứng chỉ diễn ra như sau:

1. Có server S, client C và tổ chức thứ ba đáng tin cậy CA.
2. S tin tưởng CA, CA biết public key của S, CA cấp chứng chỉ cho S. Kèm theo chữ ký mã hóa message digest bằng CA private key.
3. S nhận chứng chỉ do CA cấp, truyền chứng chỉ đó cho C.
4. C nhận chứng chỉ của S, tin tưởng CA và biết CA public key, dùng CA public key giải mã chữ ký trên chứng chỉ S, đồng thời hash message để thu được digest. So sánh digest, xác minh tính xác thực của chứng chỉ S.
5. Nếu C xác minh chứng chỉ S là thật, thì tin tưởng public key của S (trong chứng chỉ S).

![](./images/http-vs-https/public-key-transmission.png)

Về chữ ký số, phần trình bày ở đây còn khá đơn giản. Nếu bạn chưa hiểu rõ, rất khuyến khích xem video [Nguyên lý chữ ký số và chứng chỉ số](https://www.bilibili.com/video/BV18N411X7ty/) — đây là bài giảng rõ ràng nhất mà tôi từng xem.

![](/images/github/javaguide/image-20220321121814946.png)

## Tổng kết

- **Số cổng**: HTTP mặc định là 80, HTTPS mặc định là 443.
- **Tiền tố URL**: URL của HTTP bắt đầu bằng `http://`, URL của HTTPS bắt đầu bằng `https://`.
- **Bảo mật và tiêu thụ tài nguyên**: Giao thức HTTP chạy trên TCP, toàn bộ nội dung truyền tải đều là plain text, client và server đều không thể xác minh danh tính đối phương. HTTPS là giao thức HTTP chạy trên SSL/TLS, SSL/TLS chạy trên TCP. Toàn bộ nội dung truyền tải đều được mã hóa bằng mã hóa đối xứng, nhưng khóa đối xứng được mã hóa bất đối xứng bằng chứng chỉ phía server. Do đó, HTTP có tính bảo mật kém hơn HTTPS, nhưng HTTPS tiêu tốn nhiều tài nguyên server hơn HTTP.

<!-- @include: @article-footer.snippet.md -->
