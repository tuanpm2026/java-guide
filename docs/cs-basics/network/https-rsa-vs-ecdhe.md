---
title: RSA và ECDHE trong bắt tay HTTPS, thực sự khác nhau ở điểm nào? (Tầng ứng dụng)
description: So sánh sự khác biệt cốt lõi giữa trao đổi khóa RSA và ECDHE trong bắt tay TLS, làm rõ tính bảo mật chuyển tiếp, cách đặt tên bộ mật mã, các thay đổi trong TLS 1.3 và những điểm quan trọng trong phỏng vấn.
category: Kiến thức cơ bản về máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: HTTPS,RSA,ECDHE,TLS,握手,前向安全,密钥交换,密码套件,TLS 1.3,PreMasterSecret
---

Nhiều người lần đầu học HTTPS sẽ có một ấn tượng rất đơn giản trong đầu:

**HTTPS = HTTP + mã hóa, mã hóa = RSA. Vì vậy, HTTPS = mã hóa RSA.**

Hiểu biết này không phải là vô căn cứ. Các triển khai HTTPS thời kỳ đầu thực sự sử dụng nhiều bộ mật mã liên quan đến RSA, và nhiều tài liệu nhập môn cũng thích lấy RSA làm ví dụ.

Nhưng nói chính xác, HTTPS chưa bao giờ đồng nghĩa với mã hóa RSA. Ngay cả trong thời đại TLS 1.0, TLS 1.1, RSA cũng chỉ là một trong các phương án tùy chọn, giao thức còn có các phương thức trao đổi khóa như DHE. Đến TLS 1.3, trao đổi khóa RSA tĩnh đã bị loại bỏ, RSA xuất hiện nhiều hơn ở các vị trí như ký chứng chỉ và xác thực danh tính.

Vì vậy, bài viết này thực sự không so sánh "RSA hay ECDHE cái nào cao cấp hơn".

**Trong bắt tay RSA, tài liệu khóa phiên được tạo bởi client rồi mã hóa gửi cho server; trong bắt tay ECDHE, tài liệu khóa phiên không được truyền trực tiếp mà được cả hai bên tự tính toán ra.**

Bài viết này chủ yếu trả lời một số câu hỏi:

1. Tại sao HTTPS không đồng nghĩa với mã hóa RSA?
2. Tài liệu khóa phiên trong bắt tay RSA và ECDHE được tạo ra như thế nào?
3. Tại sao ECDHE có thể cung cấp tính bảo mật chuyển tiếp?
4. Tại sao TLS 1.3 loại bỏ trao đổi khóa RSA tĩnh?

Khi giải thích rõ những câu hỏi này, `PreMasterSecret`, `Server Key Exchange`, bảo mật chuyển tiếp, lý do TLS 1.3 loại bỏ RSA tĩnh — tất cả đều có thể hiểu theo từng bước.

![RSA và ECDHE trao đổi khóa: sự khác biệt cốt lõi](https://oss.javaguide.cn/github/javaguide/cs-basics/network/https-rsa-ecdhe-rsa-and-ecdhe-key-exchange-core-differences.png)

## Hai vấn đề cốt lõi của bắt tay TLS

HTTPS vẫn dựa trên HTTP và vẫn phụ thuộc vào TCP. Sự khác biệt là thông điệp HTTP không chạy trực tiếp trên TCP mà phải qua TLS để hoàn thành xác thực danh tính, thỏa thuận khóa và bảo vệ mã hóa.

Sau khi bắt tay hoàn tất, thứ thực sự bảo vệ dữ liệu nghiệp vụ thường là các thuật toán mã hóa đối xứng như AES-GCM, không phải dùng RSA để mã hóa toàn bộ yêu cầu và phản hồi.

Có hai vấn đề ở đây.

**Vấn đề thứ nhất: Trình duyệt và máy chủ cần thỏa thuận một khóa phiên.**

Khi truyền yêu cầu HTTP, Cookie, nội dung phản hồi về sau, khóa phiên này sẽ được dùng để mã hóa đối xứng. Mã hóa đối xứng phù hợp hơn để xử lý lượng lớn dữ liệu; mã hóa bất đối xứng có chi phí tính toán cao, thường không dùng để mã hóa trực tiếp toàn bộ nội dung trang web.

**Vấn đề thứ hai: Trình duyệt cần xác nhận rằng đầu kia thực sự là trang web mục tiêu.**

Nếu chỉ là "máy chủ gửi khóa công khai cho trình duyệt", thì người trung gian cũng có thể gửi khóa công khai của họ. Trình duyệt tưởng đó là khóa công khai của trang web mục tiêu, rồi mã hóa thông tin bí mật gửi cho kẻ tấn công. Chứng chỉ, CA, chữ ký số giải quyết vấn đề này: chứng minh khóa công khai này thực sự gắn với tên miền này, không phải do ai đó chèn vào trên đường truyền.

Bắt tay RSA và ECDHE đều phải đối mặt với hai vấn đề này. Chỉ là cách chúng giải quyết "khóa phiên từ đâu ra" là khác nhau.

## Bắt tay RSA: Gửi tài liệu khóa đã mã hóa

### Luồng bắt tay đầy đủ

Hãy xem trao đổi khóa RSA trong TLS 1.2.

Trình duyệt gửi `ClientHello` trước. Bên trong có phiên bản TLS mà client hỗ trợ, bộ mật mã được hỗ trợ, và một số ngẫu nhiên `Client Random`.

Sau khi server nhận, nó phản hồi `ServerHello`, chọn phiên bản TLS và bộ mật mã, cũng cung cấp một số ngẫu nhiên `Server Random`, rồi gửi chứng chỉ của mình cho client.

Đến đây, client đã nhận được chứng chỉ của server. Nó sẽ xác minh chuỗi chứng chỉ, tên miền, thời hạn, chữ ký và các thông tin khác. Sau khi xác minh chứng chỉ thành công, client lấy khóa công khai RSA của server từ chứng chỉ.

Tiếp theo là bước quan trọng: client tạo một giá trị ngẫu nhiên mới, tức là `PreMasterSecret`. Trong trao đổi khóa RSA của TLS 1.2, giá trị này là **48 byte**. Client sẽ mã hóa `PreMasterSecret` bằng khóa công khai RSA trong chứng chỉ server, rồi đặt kết quả mã hóa vào `Client Key Exchange` gửi cho server.

Server nhận được, dùng khóa riêng RSA của mình để giải mã, lấy cùng một `PreMasterSecret`.

Lúc này, client và server đều có ba tài liệu:

```text
Client Random
Server Random
PreMasterSecret
```

Cả hai bên dựa trên ba tài liệu này để tạo ra `Master Secret`, và khóa phiên tiếp theo cũng sẽ được tạo từ đây. Khi thực sự truyền yêu cầu và phản hồi HTTP, dùng các khóa đối xứng được tạo ra này.

Tóm tắt trong một câu:

**Tài liệu khóa phiên trong bắt tay RSA là do client tạo ra rồi "gói lại" gửi cho server.**

Ở đây "gói lại" dựa vào khóa công khai RSA của server. Chỉ có server nắm giữ khóa riêng RSA tương ứng mới có thể mở gói này.

Trông có vẻ hợp lý. Client tạo bí mật, server giải mã bằng khóa riêng, cả hai lấy cùng một tài liệu, rồi kết hợp với hai số ngẫu nhiên để tạo khóa phiên tiếp theo.

Nhưng vấn đề cũng ở đây.

### Không có bảo mật chuyển tiếp: Khóa riêng dài hạn quá có giá trị

Giả sử kẻ tấn công hôm nay bắt được một đoạn lưu lượng HTTPS, nhưng lúc đó không có khóa riêng của server nên không đọc được nội dung. Họ có thể lưu lưu lượng lại.

Một năm sau, nếu khóa riêng RSA của server bị rò rỉ, điều gì sẽ xảy ra?

Trong trao đổi khóa RSA, `PreMasterSecret` mà client đã gửi được mã hóa bằng khóa công khai RSA của server. Nếu kẻ tấn công đã bắt hoàn chỉnh các số ngẫu nhiên văn bản rõ trong giai đoạn bắt tay, tức là `Client Random`, `Server Random`, đồng thời lưu `PreMasterSecret` đã mã hóa, rồi kết hợp với khóa riêng server bị rò rỉ sau này, họ có thể giải mã `PreMasterSecret` lúc đó và tiếp tục tạo ra khóa phiên đã được sử dụng trong kết nối đó.

Dữ liệu cũ có cơ hội bị khai thác.

Cần lưu ý điều kiện: không phải "chỉ cần khóa riêng bị rò rỉ, tất cả lịch sử lưu lượng nhất định bị giải mã". Kẻ tấn công ít nhất phải có đủ dữ liệu bắt tay và dữ liệu ứng dụng. Nếu chỉ có từng đoạn một chiều, hoặc nhật ký bắt tay không đầy đủ, ngay cả có khóa riêng cũng chưa chắc khôi phục được phiên đó.

Nhưng từ góc độ thiết kế bảo mật, rủi ro này đã đủ rắc rối. Khi khóa riêng dài hạn trở thành chìa khóa tổng mở lưu lượng lịch sử, tác động của nó không chỉ bao phủ các kết nối tương lai mà còn ảnh hưởng đến các giao tiếp đã xảy ra trong quá khứ.

Phê bình ở đây không phải là thuật toán RSA "không thể dùng". RSA vẫn có thể dùng cho xác thực chữ ký và xuất hiện trong hệ thống chứng chỉ. Vấn đề nằm ở "dùng khóa riêng server không đổi dài hạn để giải mã tài liệu khóa trong các bắt tay lịch sử".

Khi khóa riêng server bị rò rỉ, cái giá phải trả quá lớn.

![RSA tĩnh thiếu bảo mật chuyển tiếp: Bắt gói đầy đủ + rò rỉ khóa riêng có thể truy xuất lưu lượng lịch sử](https://oss.javaguide.cn/github/javaguide/cs-basics/network/https-rsa-ecdhe-static-rsa-lacks-forward-secrecy.png)

### Một gánh nặng lịch sử khác: Tấn công padding oracle

Trao đổi khóa RSA còn có một rắc rối ở tầng kỹ thuật: `PreMasterSecret` không được mã hóa trần trụi mà được đóng gói theo định dạng như RSAES-PKCS1-v1_5 rồi mới mã hóa.

Chi tiết này đã từng dẫn đến các cuộc tấn công padding oracle như Bleichenbacher.

Ý tưởng cơ bản là: kẻ tấn công không nhất thiết phải ngay lập tức lấy được khóa riêng server, mà liên tục tạo ra các bản mã khác nhau gửi cho server, quan sát sự khác biệt trong cách server xử lý "lỗi padding, lỗi phiên bản, lỗi độ dài". Nếu server để lộ sự khác biệt trong mã lỗi, thời gian phản hồi, hành vi nhật ký, cách đóng kết nối, kẻ tấn công có thể dần dần tiếp cận văn bản rõ.

Điều rắc rối về kiểu tấn công này là nó không phải là vấn đề toán học thuần túy mà là vấn đề triển khai.

TLS 1.2 đã có yêu cầu phòng thủ cho loại tình huống này: ngay cả khi server giải mã thất bại, cũng không được tiết lộ lý do thất bại cụ thể ra ngoài, mà tiếp tục dùng giá trị ngẫu nhiên để chạy hết quy trình, tránh kẻ tấn công đánh giá bản mã có gần đúng định dạng hay không thông qua hành vi khác biệt.

Nhưng yêu cầu quy chuẩn không có nghĩa là triển khai đáng tin cậy. Cuộc tấn công ROBOT năm 2017 một lần nữa chứng minh rằng một số server vẫn có thể để lộ oracle giải mã RSA do sự khác biệt hành vi nhỏ. Mã lỗi, thời gian xử lý, nhật ký, đường dẫn rẽ nhánh — chỉ cần một chỗ biểu hiện không nhất quán đều có thể trở thành kênh bên.

Vì vậy, trao đổi khóa RSA tĩnh bị loại bỏ không chỉ vì nó không có bảo mật chuyển tiếp mà còn vì nó đặt quá nhiều rủi ro vào chi tiết triển khai.

### Liệu có thể bị hạ cấp xuống RSA không?

Ở đây cần bổ sung một điểm dễ hiểu nhầm.

Trong TLS 1.2, client mang theo danh sách bộ mật mã hỗ trợ trong `ClientHello`, server chọn một bộ cả hai đều hỗ trợ. Về lý thuyết, nếu server vẫn mở các bộ trao đổi khóa RSA tĩnh như `TLS_RSA_*`, client cũ có thể tiếp tục dùng bắt tay RSA.

Nhưng điều này không có nghĩa là "người trung gian tùy tiện xóa ECDHE trong ClientHello là có thể khiến kết nối âm thầm hạ cấp xuống RSA". `Finished` ở cuối bắt tay sẽ kiểm tra transcript bắt tay, việc giả mạo `ClientHello` đơn giản thường dẫn đến kiểm tra thất bại, không xây dựng được kết nối.

Trong lịch sử đã có các cuộc tấn công liên quan đến hạ cấp, như FREAK và Logjam. Chúng khai thác việc một số client và server lúc đó vẫn hỗ trợ bộ mật mã cấp xuất khẩu yếu, kết hợp với vấn đề triển khai và cấu hình, đẩy kết nối xuống đường RSA_EXPORT hoặc DHE_EXPORT yếu hơn, chứ không phải "tùy tiện xóa ECDHE là có thể thành công âm thầm". TLS 1.3 thêm giá trị bảo vệ hạ cấp vào `ServerHello.random` cũng nhắc nhở chúng ta: bản thân giao thức luôn bổ sung các bề mặt tấn công lịch sử loại này.

Điều thực sự cần quan tâm là cấu hình server: nếu không cần tương thích với các client rất cũ, nên tắt các bộ trao đổi khóa RSA tĩnh, chỉ giữ lại các bộ hỗ trợ bảo mật chuyển tiếp. Nếu không, trong môi trường vẫn có thể có client hoặc cấu hình sai đi vào bắt tay RSA.

Đây cũng là lý do tại sao khi kiểm tra cấu hình TLS cần xem kết quả thỏa thuận bộ mật mã thực tế. Chỉ nhìn "server hỗ trợ ECDHE" là không đủ, còn cần xem nó có đồng thời giữ lại các bộ cũ như `TLS_RSA_*` không.

## Bắt tay ECDHE: Cả hai bên cùng thỏa thuận tài liệu khóa

### Ý tưởng cốt lõi của DH

`DHE` trong ECDHE đến từ Diffie-Hellman Ephemeral, nghĩa là Diffie-Hellman tạm thời. `EC` phía trước là Elliptic Curve, chỉ dựa trên đường cong elliptic.

Đừng bị tên gọi làm sợ. Trước tiên đừng xem đường cong elliptic, hãy xem DH muốn giải quyết vấn đề gì.

Mục tiêu của DH rất thú vị: hai bên giao tiếp không truyền trực tiếp bí mật chung, nhưng vẫn có thể mỗi bên tự tính ra cùng một bí mật chung.

Có thể hiểu đại khái như sau:

Client tạo một khóa riêng tạm thời, chỉ giữ ở local, rồi tính ra một khóa công khai tạm thời gửi cho server. Server cũng tạo một khóa riêng tạm thời, chỉ giữ ở local, rồi tính ra một khóa công khai tạm thời gửi cho client.

Cả hai bên trao đổi đều là khóa công khai. Kẻ tấn công trong mạng có thể thấy các khóa công khai này, nhưng không thấy khóa riêng tạm thời của mỗi bên.

Tiếp theo, client dùng "khóa riêng tạm thời của mình + khóa công khai tạm thời của server" để tính bí mật chung; server dùng "khóa riêng tạm thời của mình + khóa công khai tạm thời của client" cũng tính ra cùng một bí mật chung.

Bí mật chung không được truyền qua mạng.

ECDHE chỉ là thực hiện quá trình này trong hệ thống đường cong elliptic. Lý thuyết toán học của đường cong elliptic trừu tượng hơn, nhưng với cùng mức độ bảo mật, nó thường có thể đạt mức bảo mật tương đương với khóa ngắn hơn, chi phí tính toán và truyền tải cũng thấp hơn DHE trường hữu hạn truyền thống. Để hiểu bắt tay TLS, chỉ cần nhớ một câu:

**Tài liệu khóa phiên của ECDHE không phải là một bên tạo ra rồi gửi cho bên kia, mà là cả hai bên thỏa thuận ra thông qua khóa tạm thời.**

### Luồng bắt tay đầy đủ

Hãy xem bắt tay `ECDHE_RSA` phổ biến trong TLS 1.2.

Client vẫn gửi `ClientHello` trước, bên trong có phiên bản TLS, bộ mật mã được hỗ trợ, `Client Random`. Server phản hồi `ServerHello`, chọn một bộ mật mã, ví dụ:

```text
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
```

Tên bộ mật mã này cần phân tách, không thể thấy RSA là tưởng nó vẫn dùng RSA để mã hóa khóa phiên.

- `ECDHE` chỉ phương thức trao đổi khóa.
- `RSA` chỉ phương thức ký xác thực.
- `AES_256_GCM` chỉ dữ liệu bản ghi tiếp theo dùng AES, độ dài khóa 256 bit, chế độ là GCM.
- `SHA384` chỉ định thuật toán hash được dùng cho TLS 1.2 PRF và thông điệp `Finished`.

GCM bản thân đã cung cấp bảo vệ tính toàn vẹn ở tầng bản ghi, nên `SHA384` ở đây không còn chỉ MAC ở tầng bản ghi mà chủ yếu tham gia vào việc tạo và xác minh khóa trong giai đoạn bắt tay.

Server tiếp tục gửi chứng chỉ. Lấy `ECDHE_RSA` làm ví dụ, khóa công khai RSA trong chứng chỉ chủ yếu dùng để xác minh chữ ký server, chứ không phải để client dùng nó mã hóa `PreMasterSecret`.

Sau đó, bắt tay ECDHE và RSA bắt đầu phân kỳ.

Trong bắt tay ECDHE, server sẽ gửi `Server Key Exchange`. Thông điệp này chứa các tham số đường cong elliptic mà server đã chọn và khóa công khai ECDHE tạm thời của server.

**Câu hỏi đặt ra: Làm thế nào client biết khóa công khai ECDHE tạm thời này không bị người trung gian thay thế?**

**Câu trả lời là chữ ký.**

Server sẽ dùng khóa riêng tương ứng với chứng chỉ để ký các tham số bắt tay. Client nhận được, dùng khóa công khai trong chứng chỉ để xác minh chữ ký. Nếu xác minh chữ ký thành công, client có thể xác nhận: khóa công khai ECDHE tạm thời này thực sự đến từ server nắm giữ khóa riêng chứng chỉ, không phải bị ai thay thế trên đường.

Tiếp theo client cũng tạo khóa riêng và khóa công khai ECDHE tạm thời của mình, gửi khóa công khai tạm thời của client cho server qua `Client Key Exchange`.

Đến bước này, cả hai bên đã có tài liệu cần thiết để tính bí mật chung.

Client có:

```text
客户端临时私钥
服务端临时公钥
Client Random
Server Random
```

Server có:

```text
服务端临时私钥
客户端临时公钥
Client Random
Server Random
```

Hai bên mỗi bên tự tính ra cùng một bí mật chung, rồi tạo ra khóa phiên được sử dụng tiếp theo.

Nhấn mạnh lại một lần nữa:

**RSA trong ECDHE_RSA không phải để mã hóa truyền khóa phiên. Nó có nhiệm vụ chứng minh "các tham số tạm thời ECDHE này thực sự được gửi bởi server".**

Đây cũng là chỗ nhiều người dễ hiểu nhầm nhất khi nhìn vào tên bộ mật mã.

![Luồng bắt tay TLS 1.2 ECDHE_RSA](https://oss.javaguide.cn/github/javaguide/cs-basics/network/https-rsa-ecdhe-tls-1-2-ecdhe-rsa-handshake-process.png)

### Cách đọc tên bộ mật mã

Tên bộ mật mã TLS 1.2 thường có thể phân tách theo dòng này:

```text
TLS_密钥交换算法_认证算法_WITH_对称加密算法_哈希算法
```

Ví dụ:

```text
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
```

Có thể phân tách thành:

```text
ECDHE：密钥交换
RSA：身份认证，也就是服务端签名
AES_128_GCM：后续记录层加密算法
SHA256：TLS 1.2 PRF 和 Finished 消息使用的哈希算法；如果是 GCM 套件，它不再充当记录层 MAC
```

Xem thêm một ví dụ khác:

```text
TLS_RSA_WITH_AES_128_GCM_SHA256
```

`RSA` ở đây xuất hiện trước `WITH` và không có `ECDHE`, chỉ ra rằng cả trao đổi khóa và xác thực danh tính đều gắn với RSA. Loại này là bộ trao đổi khóa RSA tĩnh điển hình.

Đến TLS 1.3, cách đặt tên bộ mật mã đã thay đổi, ví dụ:

```text
TLS_AES_128_GCM_SHA256
```

Bạn sẽ thấy nó không còn viết phương thức trao đổi khóa và xác thực vào tên bộ mật mã nữa. TLS 1.3 tách thông tin này sang các phần mở rộng và thông điệp bắt tay khác, tên bộ mật mã chủ yếu mô tả thuật toán AEAD ở tầng bản ghi và thuật toán hash mà HKDF sử dụng.

Vì vậy, khi thấy `TLS_AES_128_GCM_SHA256` của TLS 1.3, đừng nhầm tưởng nó "không có trao đổi khóa". Trao đổi khóa vẫn còn, chỉ là không viết theo kiểu đặt tên của TLS 1.2.

![Phân tách tên bộ mật mã](https://oss.javaguide.cn/github/javaguide/cs-basics/network/https-rsa-ecdhe-cipher-suite-name-decomposition.png)

## Bảo mật chuyển tiếp và chi phí hiệu suất

### Tại sao ECDHE có bảo mật chuyển tiếp

Chìa khóa là `E`, tức là `Ephemeral`, tạm thời.

Khóa riêng trong bắt tay ECDHE không phải là khóa riêng dài hạn trong chứng chỉ server, mà là khóa riêng tạm thời được sử dụng trong quá trình bắt tay. Sau khi kết nối kết thúc, trong điều kiện bình thường không nên còn phụ thuộc vào tài liệu tạm thời này.

Kết quả là: kẻ tấn công hôm nay bắt gói, ngày nào đó trong tương lai lấy được khóa riêng chứng chỉ server, cũng không thể chỉ dùng khóa dài hạn này để khôi phục bí mật chung tạm thời trong mỗi lần bắt tay trong quá khứ. Bởi vì thứ thực sự tham gia thỏa thuận khóa lúc đó là khóa riêng ECDHE tạm thời trong lần bắt tay đó, chứ không phải khóa riêng chứng chỉ.

Khóa riêng chứng chỉ ở đây giống "bút ký" hơn, không phải "chìa khóa két sắt".

Trong trao đổi khóa RSA, khóa riêng server có thể trực tiếp mở `PreMasterSecret` mà client gửi; trong ECDHE, khóa riêng server chỉ ký các tham số tạm thời, chứng minh danh tính. Nó không trực tiếp tham gia vào việc tính bí mật chung của mỗi kết nối.

Sự thay đổi vai trò này quyết định sự khác biệt giữa hai loại trong việc bảo vệ lưu lượng lịch sử.

![Nguyên tắc bảo mật chuyển tiếp của ECDHE: Khóa dài hạn vs Khóa tạm thời](https://oss.javaguide.cn/github/javaguide/cs-basics/network/https-rsa-ecdhe-ecdhe-forward-secrecy-principle-long-term-key-vs-ephemeral-key.png)

Tuy nhiên, bảo mật chuyển tiếp không phải là phép màu bất khả xâm phạm.

Nếu chất lượng số ngẫu nhiên server rất kém, khóa riêng tạm thời bị ghi vào nhật ký, hoặc có rò rỉ bộ nhớ trong triển khai, ECDHE cũng không cứu được bạn. Trong triển khai kỹ thuật, để giảm chi phí bắt tay, một số triển khai có thể tái sử dụng tài liệu riêng tạm thời DH/ECDH trong thời gian ngắn: trong kịch bản DH trường hữu hạn thường gọi là "tái sử dụng số mũ", trong kịch bản ECDH thường gọi là "tái sử dụng khóa riêng/scalar tạm thời". Nếu thời gian tái sử dụng quá dài, độ hạt của bảo mật chuyển tiếp sẽ trở nên thô hơn.

Còn một loại rủi ro đến từ kiểm tra tham số. Ví dụ server không kiểm tra đúng liệu điểm đường cong elliptic mà client gửi có nằm trên đường cong hợp lệ không, có thể tạo không gian cho tấn công đường cong không hợp lệ. Các nhà phát triển thông thường không nhất thiết phải viết trực tiếp lớp mã này, nhưng nó nhắc nhở chúng ta: giao thức mật mã học không chỉ "chọn đúng thuật toán" là xong, triển khai và cấu hình thư viện TLS cũng quan trọng.

### Ảnh hưởng của khôi phục phiên

Còn một điểm dễ bị bỏ qua: **khôi phục phiên.**

Bắt tay ECDHE đầy đủ cần thực hiện thỏa thuận khóa tạm thời, chi phí không thấp. Để giảm chi phí bắt tay, TLS hỗ trợ khôi phục phiên. Khi client truy cập lại cùng một trang web, có thể thử tái sử dụng trạng thái phiên đã thỏa thuận trước đó, tránh mỗi lần đều phải thực hiện đầy đủ một lượt bắt tay.

Vấn đề là khôi phục phiên cũng có biên giới bảo mật riêng.

Lấy ticket phiên trong TLS 1.2 làm ví dụ, server dùng một khóa mã hóa ticket để bảo vệ trạng thái phiên, client sau đó mang ticket quay lại, server mở ticket ra rồi khôi phục phiên. Nếu khóa mã hóa ticket này lâu dài không xoay vòng, một khi bị rò rỉ, kẻ tấn công có thể mở các ticket đã thu thập trước đó và tiếp tục khôi phục tài liệu khóa của các phiên liên quan.

Lúc này, cửa sổ bảo mật chuyển tiếp không còn là "một kết nối" mà sẽ bị kéo dài đến "vòng đời của khóa mã hóa ticket".

Vì vậy cấu hình trực tuyến không thể chỉ nhìn "có bật ECDHE không". Khóa ticket phiên được tạo như thế nào, xoay vòng như thế nào, có được chia sẻ giữa nhiều máy không, ảnh hưởng nếu bị rò rỉ lớn đến đâu, cũng phải tính vào.

### Hiệu suất không miễn phí

ECDHE mang lại bảo mật chuyển tiếp, nhưng nó cũng có chi phí.

Con đường chính của trao đổi khóa RSA là server dùng khóa riêng RSA dài hạn để mở `PreMasterSecret` mà client gửi. ECDHE_RSA cần hoàn thành thỏa thuận ECDH tạm thời và còn phải ký các tham số tạm thời của server.

Đối với dịch vụ có lưu lượng cao, bắt tay TLS sẽ tiêu thụ CPU, đặc biệt là khi kết nối ngắn nhiều, tỷ lệ trúng khôi phục phiên thấp.

Không thể đơn giản viết "ECDHE nhất định chậm hơn RSA". Chi phí thực tế phụ thuộc vào độ dài khóa RSA, lựa chọn đường cong elliptic, thuật toán ký, triển khai thư viện TLS, tập lệnh CPU, tỷ lệ trúng khôi phục phiên và các yếu tố khác. Ví dụ X25519, P-256, RSA 2048, RSA 3072 biểu hiện khác nhau trên các CPU và thư viện TLS khác nhau.

Nếu thực sự muốn đánh giá chi phí, phương pháp đáng tin cậy nhất không phải là trích dẫn con số cố định của người khác mà là kiểm tra áp lực trên máy mục tiêu. Ít nhất phải phân biệt ba điều:

```text
1. 单次密码学操作耗时
2. 完整 TLS 握手耗时
3. 业务请求端到端耗时
```

Mục đầu tiên có thể dùng `openssl speed` để xem số lượng đại thể, ví dụ kiểm tra khả năng tính toán RSA, ECDH, X25519; mục thứ hai cần xem thư viện TLS và cấu hình server; mục thứ ba còn bị ảnh hưởng bởi mạng, tái sử dụng kết nối, logic ứng dụng.

Vì vậy trực tuyến không chỉ dùng "chuyển sang ECDHE" để giải quyết tất cả vấn đề. Cách phổ biến hơn là kết hợp TLS 1.3, khôi phục phiên, lựa chọn thuật toán chứng chỉ và đường cong hợp lý, khi cần thiết thêm tăng tốc phần cứng.

Bảo mật và hiệu suất không phải là chọn một trong hai, nhưng cũng không thể giả vờ không có chi phí.

## Những thay đổi trong TLS 1.3

Nếu chỉ nhìn vào TLS 1.2, RSA và ECDHE có thể được so sánh như hai phương thức trao đổi khóa.

Nhưng đến TLS 1.3, trao đổi khóa RSA tĩnh đã bị loại bỏ, cấu trúc bắt tay cũng thay đổi.

Bắt tay đầy đủ TLS 1.2 thường cần 2 RTT. Client gửi `ClientHello` trước, server phản hồi `ServerHello`, chứng chỉ và các thông điệp bắt tay liên quan, client gửi trao đổi khóa và `Finished`, server cuối cùng phản hồi `Finished`.

TLS 1.3 thì đặt trước tham số trao đổi khóa vào `key_share` trong `ClientHello`. Phản hồi đầu tiên của server đã có thể trả về `key_share` của mình, bắt tay đầy đủ thường được nén xuống còn 1 RTT.

2 RTT xuống 1 RTT tiết kiệm được bao nhiêu mili giây phụ thuộc vào môi trường mạng. Cùng trung tâm dữ liệu có thể chỉ vài mili giây; trong kịch bản xuyên vùng, mạng di động, mất gói cao, ít một RTT mới dễ cảm nhận được.

Tuy nhiên, TLS 1.3 không phải trong mọi trường hợp đều ổn định 1 RTT. Nếu `key_share` mà client mang không khớp với đường cong mà server hỗ trợ, server sẽ trả về `HelloRetryRequest`, yêu cầu client đổi một bộ tham số rồi gửi lại. Lúc này bắt tay có thể gần lại 2 RTT.

Vì vậy trong môi trường sản xuất, việc client và server hỗ trợ các nhóm thỏa thuận khóa phổ biến cần được căn chỉnh càng nhiều càng tốt, như `X25519`, `secp256r1` và các lựa chọn phổ biến khác. Nếu không, lợi thế 1 RTT của TLS 1.3 có thể bị giảm sút.

![So sánh RTT bắt tay TLS 1.2 vs TLS 1.3](https://oss.javaguide.cn/github/javaguide/cs-basics/network/https-rsa-ecdhe-tls-1-2-vs-tls-1-3-handshake-rtt-comparison.png)

Còn trao đổi khóa hybrid hậu lượng tử, 0-RTT, PSK-only, mTLS, những thứ này đều thuộc một nhánh khác, bài này không mở rộng.

## Tra cứu nhanh sự khác biệt cốt lõi RSA vs ECDHE

Nhìn cùng nhau, sự khác biệt rất rõ ràng.

| So sánh                               | Trao đổi khóa RSA                                                                               | Trao đổi khóa ECDHE                                                                                             |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Bối cảnh phiên bản phổ biến           | Có thể thấy trong TLS 1.2 và các phiên bản cũ hơn                                               | Phổ biến trong TLS 1.2, TLS 1.3 tiếp tục hướng thỏa thuận khóa tạm thời                                         |
| Tài liệu khóa phiên đến từ đâu        | Client tạo `PreMasterSecret`, mã hóa bằng khóa công khai RSA của server để gửi                  | Cả hai bên mỗi bên tạo cặp khóa tạm thời, tính bí mật chung qua ECDHE                                           |
| Vai trò của khóa riêng server         | Giải mã `PreMasterSecret` mà client gửi                                                         | Ký các tham số ECDHE tạm thời, chứng minh tham số đến từ server thực                                            |
| Những gì được truyền qua mạng         | `PreMasterSecret` đã mã hóa                                                                     | Khóa công khai tạm thời của cả hai bên và các tham số đã ký                                                     |
| Có hỗ trợ bảo mật chuyển tiếp không   | Không hỗ trợ                                                                                    | Hỗ trợ, với điều kiện khóa tạm thời được tạo đúng cách và không lưu giữ sau khi sử dụng                         |
| Ảnh hưởng sau khi khóa riêng bị rò rỉ | Trong trường hợp dữ liệu bắt tay được bắt đầy đủ, lưu lượng lịch sử có thể bị giải mã           | Chỉ dựa vào khóa riêng chứng chỉ, thường không thể mở lưu lượng lịch sử                                         |
| Vấn đề điển hình                      | Khóa riêng dài hạn có giá trị quá cao, có gánh nặng lịch sử tấn công padding oracle PKCS#1 v1.5 | Bắt tay có chi phí tính toán bổ sung, kiểm tra tham số và quản lý khóa tạm thời phụ thuộc chất lượng triển khai |
| Tình hình TLS 1.3                     | Trao đổi khóa RSA tĩnh đã bị loại bỏ                                                            | Thỏa thuận khóa tạm thời trở thành dòng chính                                                                   |

![So sánh nhanh RSA vs ECDHE](https://oss.javaguide.cn/github/javaguide/cs-basics/network/https-rsa-ecdhe-rsa-vs-ecdhe-quick-reference.png)

Nếu bạn muốn giải thích nhanh trong phỏng vấn, có thể nói như vậy:

**Bắt tay RSA là "client tạo bí mật, mã hóa bằng khóa công khai server gửi đi"; bắt tay ECDHE là "cả hai bên trao đổi khóa công khai tạm thời, mỗi bên tự tính ra cùng một bí mật". Khóa riêng server của RSA có thể giải mã tài liệu bắt tay lịch sử nên không có bảo mật chuyển tiếp; khóa riêng chứng chỉ của ECDHE chỉ làm xác thực chữ ký, không trực tiếp giải mã bí mật phiên, nên phù hợp hơn với HTTPS hiện đại.**

Đoạn này là đủ dùng rồi.

### Hiểu nhầm phổ biến: ECDHE_RSA không phải là cả hai thuật toán đều mã hóa

Hãy nói riêng về `ECDHE_RSA`, vì cái tên này quá dễ gây hiểu nhầm.

Nhiều người thấy:

```text
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
```

Phản xạ đầu tiên là: có phải là trước tiên làm một vòng tính toán ECDHE, rồi làm một vòng mã hóa RSA không?

Không phải.

Trong bộ mật mã này:

Trao đổi khóa dùng ECDHE;  
Xác thực danh tính dùng chữ ký RSA;  
Mã hóa dữ liệu tiếp theo dùng AES-256-GCM;  
Hash liên quan dùng SHA384.

Điều này cũng giải thích tại sao câu "HTTPS vẫn đang dùng RSA" cần nói cẩn thận.

Dùng RSA để ký chứng chỉ và dùng RSA để trao đổi khóa là hai việc khác nhau.

Cái trước vẫn phổ biến trong HTTPS hiện đại, cái sau đã không phù hợp để làm dòng chính của TLS hiện đại.

### Vai trò thực tế của RSA trong HTTPS hiện đại

Khi học bắt tay HTTPS, nhiều tài liệu nhập môn thích tóm tắt bằng một câu:

Mã hóa bất đối xứng trao đổi khóa đối xứng.

Câu này có ích ở giai đoạn nhập môn, nhưng không đủ chính xác. Nó giống như đang mô tả ý tưởng của trao đổi khóa RSA thời kỳ đầu hơn.

Đến ECDHE, khóa không phải đơn giản là "mã hóa rồi truyền" mà là cả hai bên thỏa thuận ra. Đến TLS 1.3, ranh giới giữa trao đổi khóa, xác thực danh tính và mã hóa tầng bản ghi rõ ràng hơn: thỏa thuận khóa tạm thời chịu trách nhiệm tạo bí mật chung, chứng chỉ chịu trách nhiệm xác thực danh tính, mã hóa đối xứng chịu trách nhiệm bảo vệ dữ liệu ứng dụng tiếp theo.

Cách nói chính xác hơn là:

Dữ liệu nghiệp vụ HTTPS thường được mã hóa bằng khóa đối xứng; bắt tay TLS chịu trách nhiệm thỏa thuận khóa này và xác minh danh tính. RSA có thể tham gia xác thực danh tính và từng có thể tham gia trao đổi khóa; ECDHE chịu trách nhiệm thỏa thuận khóa tạm thời, có thể tránh phiên lịch sử bị trực tiếp phơi bày do rò rỉ khóa riêng chứng chỉ trong tương lai.

Nếu trộn lẫn mấy điều này, rất dễ đi đến kết luận sai: thấy RSA là tưởng nó đang mã hóa khóa phiên, thấy ECDHE_RSA là tưởng cả hai thuật toán đều đang làm mã hóa.

Thực tế không phải vậy.

## Kết nối qua một yêu cầu đầy đủ

Khi trình duyệt truy cập một trang web HTTPS, kết nối TCP được thiết lập trước. Sau đó bắt tay TLS bắt đầu.

Nếu là trao đổi khóa RSA trong TLS 1.2, sau khi client xác minh chứng chỉ, tạo `PreMasterSecret` 48 byte, mã hóa bằng khóa công khai RSA trong chứng chỉ server gửi cho server. Server giải mã bằng khóa riêng RSA, cả hai bên kết hợp với hai số ngẫu nhiên để tạo khóa phiên.

Nếu là ECDHE_RSA trong TLS 1.2, sau khi server gửi chứng chỉ, còn gửi `Server Key Exchange`, bên trong mang khóa công khai ECDHE tạm thời và chữ ký. Client xác minh chữ ký xong cũng tạo khóa công khai ECDHE tạm thời của mình gửi lại. Cả hai bên không truyền bí mật chung cuối cùng mà mỗi bên tự tính ra cùng một bí mật chung, rồi tạo khóa phiên.

Hai luồng này trông chỉ khác nhau vài thông điệp bắt tay, nhưng tính chất bảo mật khác nhau rất nhiều.

Vấn đề của trao đổi khóa RSA là gánh nặng lịch sử quá nặng: khóa riêng dài hạn một khi bị rò rỉ, lưu lượng đã được lưu trước đây cũng có thể bị ảnh hưởng; thêm vào đó rủi ro triển khai như tấn công padding oracle PKCS#1 v1.5, nó đã không phù hợp làm phương án trao đổi khóa TLS hiện đại.

ECDHE chuyển việc thỏa thuận khóa cho mỗi kết nối thành một quá trình tạm thời, khiến khóa riêng dài hạn của server không còn là chìa khóa mở lưu lượng lịch sử. Nó cũng có chi phí tính toán, cũng phụ thuộc vào triển khai và cấu hình đúng đắn, nhưng hướng phù hợp hơn với yêu cầu bảo mật của HTTPS hiện đại.

Bài viết này chỉ tập trung vào một câu hỏi: **Trao đổi khóa RSA và ECDHE thực sự khác nhau ở đâu**. Nếu tiếp tục đi sâu hơn, còn có thể mở rộng 0-RTT, PSK, xoay vòng ticket phiên, mTLS, tính minh bạch chứng chỉ, chuyển đổi hậu lượng tử của TLS 1.3, tất cả đều đáng viết riêng.

Vì vậy, khi phỏng vấn hỏi "sự khác biệt giữa bắt tay RSA và ECDHE là gì", đừng chỉ trả lời "một cái không hỗ trợ bảo mật chuyển tiếp, một cái hỗ trợ".

Điều thực sự cần nói là:

**RSA là gửi bí mật đã mã hóa qua; ECDHE là cả hai bên thỏa thuận tạm thời ra.**

Khi giải thích rõ câu này, `PreMasterSecret`, `Server Key Exchange`, bảo mật chuyển tiếp, lý do TLS 1.3 loại bỏ RSA tĩnh — tất cả đều có thể giải thích theo từng bước.
