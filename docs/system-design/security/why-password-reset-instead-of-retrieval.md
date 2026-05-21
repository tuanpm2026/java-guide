---
title: Tại sao khi quên password chỉ có thể reset, không thể lấy lại password cũ?
description: Giải thích chi tiết tại sao website khi quên password chỉ có thể cho bạn reset password chứ không thể nói password cũ. Lý do cốt lõi là server dùng hash algorithm để lưu password — hash algorithm không thể đảo ngược, không thể khôi phục password gốc từ hash value. Bài này còn giới thiệu kiến thức về password storage security, salt mechanism, Bcrypt encryption, password transmission security.
category:
  - System Design
tag:
  - Data Security
  - Password Security
  - Hash Algorithm
  - Interview Questions
head:
  - - meta
    - name: keywords
      content: password reset,password recovery,hash algorithm,password storage,Bcrypt,salting,password security,interview questions
---

Đây là câu hỏi khá thú vị — nhiều công ty cũng đã hỏi trong phỏng vấn. Khá đơn giản, không biết mọi người khi reset password có bao giờ nghĩ đến câu hỏi này không.

![Reset account password](/images/github/javaguide/system-design/security/reset-password-page.png)

Trả lời câu hỏi này thực ra chỉ một câu: **Vì server cũng không biết password gốc của bạn là gì**. Developer lưu password gốc đã bị đuổi rồi 🤣.

Nếu server biết password gốc của bạn, đó là vấn đề rủi ro bảo mật nghiêm trọng.

Hãy phân tích đơn giản ở đây.

Bài này không bàn nhiều về encryption algorithm. Bạn quan tâm có thể đọc: [Tổng hợp các thuật toán mã hóa phổ biến](https://javaguide.cn/system-design/security/encryption-algorithms.html).

![](/images/github/javaguide/system-design/security/encryption-algorithms/javaguide-security-encryption-algorithms.png)

## Tại sao server không biết password gốc của bạn?

Ai từng làm development đều biết rằng khi server lưu password vào database, **tuyệt đối không thể lưu dạng plain text**.

Nếu lưu plain text, rủi ro quá lớn:

1. Data trong database có nguy cơ bị đánh cắp.
2. Nhân viên nội bộ có quyền database có thể lợi dụng ác ý.
3. Sau khi hacker xâm nhập có thể lấy trực tiếp password của tất cả user.

Do đó password phải qua xử lý mới được lưu. Cách xử lý này chính là dùng **hash algorithm**.

## Giới thiệu Hash Algorithm

Hash algorithm còn gọi là hash function hay digest algorithm. Tác dụng của nó là tạo ra một unique identifier có độ dài cố định từ data có độ dài tùy ý — còn gọi là hash value, digest (sau đây gọi thống nhất là hash value).

![Hash algorithm effect demonstration](/images/github/javaguide/system-design/security/encryption-algorithms/hash-function-effect-demonstration.png)

Hash algorithm có hai đặc điểm quan trọng:

1. **Irreversibility (Không thể đảo ngược)**: Bạn không thể lấy lại giá trị gốc từ giá trị sau khi hash. **Đây là cốt lõi!**
2. **Determinism (Tính xác định)**: Cùng input luôn tạo ra cùng output.

Có một ví dụ rất sinh động: **Password bạn lưu giống như khoai tây đã thái sợi, không thể phục hồi lại thành khoai tây. Nhưng cách website kiểm tra password có đúng không là lấy password mới bạn nhập như cái khoai tây và thái lại một lần nữa, rồi xem hai đĩa khoai tây sợi có giống nhau không.**

Hai đặc điểm này quyết định hash algorithm rất phù hợp để lưu password: Server chỉ lưu hash value của password, khi verify chỉ cần so sánh xem hash value có nhất quán không.

### Phân loại Hash Algorithm

Hash algorithm có thể chia đơn giản thành hai loại:

1. **Cryptographic hash algorithm**: Hash algorithm có tính bảo mật cao. Có thể cung cấp một mức độ bảo vệ tính toàn vẹn dữ liệu và chống tamper, chống lại một số phương pháp tấn công nhất định. Bảo mật tương đối cao nhưng hiệu năng kém hơn. Phù hợp với tình huống yêu cầu bảo mật cao. Ví dụ SHA2, SHA3, SM3, RIPEMD-160, BLAKE2, v.v.
2. **Non-cryptographic hash algorithm**: Hash algorithm có tính bảo mật tương đối thấp, dễ bị ảnh hưởng bởi brute force, collision attack và các tấn công khác. Nhưng hiệu năng cao, phù hợp với tình huống không yêu cầu bảo mật. Ví dụ CRC32, MurMurHash3, v.v.

Ngoài hai loại này còn có một số hash algorithm đặc biệt như **slow hash algorithm** có bảo mật cao hơn.

### Tại sao không khuyến nghị MD5?

Trước đây thường dùng MD5 để encrypt password, nhưng hiện nay **không còn được khuyến nghị** với các lý do sau:

1. **Collision resistance kém**: Có vấn đề weak collision — nhiều input khác nhau có thể tạo ra cùng MD5 value.
2. **Hash value quá ngắn**: Hash value 128-bit dễ bị rainbow table attack.
3. **Tốc độ tính toán quá nhanh**: Ngược lại dễ bị brute force.

Chi tiết đọc: [Đừng viết MD5 encrypt password trong CV nữa!](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247542780&idx=1&sn=fb2fe3fb53fe596cc5b22e30766e0098&scene=21#wechat_redirect)

### Tại sao cần thêm Salt?

Chỉ dùng hash algorithm để lưu password vẫn có nguy cơ bị **rainbow table attack**. Rainbow table là bảng tra cứu hash value được tính toán trước. Attacker có thể nhanh chóng crack password bằng cách tra bảng.

Salt (Muối) trong mật mã học là kỹ thuật chèn một string cụ thể vào bất kỳ vị trí cố định nào trong password, làm cho kết quả hash khác với kết quả hash dùng password gốc — quá trình này gọi là "salting".

**Tác dụng của Salt**:

1. Tăng complexity và uniqueness của password.
2. Làm rainbow table attack vô hiệu (salt của mỗi user khác nhau).
3. Dù hai user dùng cùng password, hash value cũng khác nhau.

## Phương án lưu trữ Password được khuyến nghị

Hiện có hai phương án lưu password được khuyến nghị:

### Phương án 1: Cryptographic Hash Algorithm + Salt

Dùng cryptographic hash algorithm có bảo mật cao (như SHA-256, SHA-3) cộng với salt value.

Ví dụ code SHA-256 + Salt:

```java
String password = "123456";
String salt = "1abd1c";
// Tạo SHA-256 digest object
MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
messageDigest.update((password + salt).getBytes());
// Tính hash value
byte[] result = messageDigest.digest();
// Convert hash value sang hex string
String hexString = new HexBinaryAdapter().marshal(result);
System.out.println("Original String: " + password);
System.out.println("SHA-256 Hash: " + hexString.toLowerCase());
```

Output:

```bash
Original String: 123456
SHA-256 Hash: 424026bb6e21ba5cda976caed81d15a3be7b1b2accabb79878758289df98cbec
```

### Phương án 2: Slow Hash Algorithm (khuyến nghị hơn)

**Bcrypt** là hash algorithm được thiết kế chuyên cho password encryption — thuộc loại slow hash algorithm. Nó tích hợp sẵn cơ chế salt và tham số cost:

- **salt**: String được tạo ngẫu nhiên, dùng để trộn với password, tăng uniqueness của password.
- **cost**: Kiểm soát số lần iteration, tăng thời gian tính toán và tiêu thụ tài nguyên.

Bcrypt có thể phòng chống hiệu quả rainbow table attack và brute force attack.

Spring Security — security framework của Java application — officially khuyến nghị dùng `BCryptPasswordEncoder`:

```java
@Bean
public PasswordEncoder passwordEncoder(){
    return new BCryptPasswordEncoder();
}
```

## Login Verification Flow

Khi bạn nhập password để login, verification flow như sau:

1. Server lấy salt value và stored hash value của user đó từ database theo username.
2. Server ghép password do user nhập với salt value, tính hash value.
3. So sánh hash value được tính với hash value lưu trong database xem có nhất quán không.
4. Nếu nhất quán, password đúng; ngược lại password sai.

![](/images/github/javaguide/system-design/security/encryption-algorithms/sha256-salt-password.png)

## Khi reset password làm thế nào biết password mới giống password cũ?

Bạn tinh tế có thể nhận thấy một số website khi reset password sẽ nhắc "password mới không được giống password cũ". Website làm thế nào biết password mới và password cũ giống nhau?

Nguyên lý thực ra giống với verify tính đúng đắn của password:

1. User nhập password mới.
2. Server dùng salt value của user đó để tính hash value của password mới.
3. So sánh hash value của password mới với hash value password cũ lưu trong database.
4. Nếu giống nhau, nghĩa là password mới và cũ như nhau, từ chối sửa đổi.

Vậy website không biết password cũ của bạn là gì — chỉ so sánh hai đĩa "khoai tây sợi" có giống nhau không.

## Password Transmission Security

Phần trước toàn nói về storage security của password ở server side. Vậy password có an toàn trong quá trình transmission không?

Có câu hỏi phỏng vấn phổ biến: **Nếu một nhân viên biết cách mã hóa, liệu họ có thể chặn packet và mô phỏng mã hóa để lấy password không?**

Câu trả lời: **Storage và transmission bản thân đã được xử lý riêng biệt**.

Phương án password security hoàn chỉnh cần đảm bảo cả storage security lẫn transmission security.

### Dùng HTTPS

HTTPS protocol là nền tảng để bảo vệ transmission security. HTTP protocol chạy trên TCP, tất cả nội dung truyền đều là plain text, client và server đều không thể verify danh tính của đối phương. HTTPS là HTTP protocol chạy trên SSL/TLS, tất cả nội dung truyền đều được mã hóa.

Chi tiết so sánh HTTP và HTTPS xem bài: [HTTP vs HTTPS (Application Layer)](https://javaguide.cn/cs-basics/network/http-vs-https.html).

**Tuy nhiên, chỉ dựa vào HTTPS vẫn chưa đủ an toàn**:

1. HTTPS có rủi ro downgrade attack, man-in-the-middle attack.
2. HTTPS chỉ đảm bảo third-party packet capturing thấy ciphertext trong transmission, không thể ngăn malicious behavior của client bản thân.

Do đó còn cần **encrypt password trước khi truyền**.

### Encrypted Password Transmission

Encryption algorithm chia thành **symmetric encryption** và **asymmetric encryption**.

**Symmetric encryption** là thuật toán mã hóa và giải mã dùng cùng key — còn gọi là shared key encryption algorithm.

![Symmetric Encryption](/images/github/javaguide/system-design/security/encryption-algorithms/symmetric-encryption.png)

**Asymmetric encryption** là thuật toán mã hóa và giải mã dùng key khác nhau — còn gọi là public key encryption algorithm. Hai key này: một là public key (có thể công khai), một là private key (cần bảo mật). Data mã hóa bằng public key chỉ có thể giải mã bằng private key tương ứng, và ngược lại.

![Asymmetric Encryption](/images/github/javaguide/system-design/security/encryption-algorithms/asymmetric-encryption.png)

Các asymmetric encryption algorithm phổ biến là RSA, DSA, ECC, v.v.

Với tình huống password transmission, **khuyến nghị dùng asymmetric encryption**. Full flow như sau:

1. Server tạo cặp public/private key. Private key được bảo mật nghiêm ngặt trên server, public key được gửi xuống client.
2. Trước khi client gửi password, encrypt password bằng public key.
3. Server sau khi nhận encrypted data, dùng private key để decrypt lấy password gốc.
4. Server hash password gốc, thêm salt rồi lưu.

### Phương án bảo mật hoàn chỉnh

Kết hợp storage và transmission, một phương án password security hoàn chỉnh gồm ba tầng:

```javascript
// Tầng 1: Client encryption (asymmetric encrypted transmission)
const encryptedPassword = rsaEncrypt(password, publicKey);

// Tầng 2: HTTPS secure transmission
// Tầng 3: Server-side storage (hash + salt value)
```

Do đó, dù nhân viên nội bộ biết encryption algorithm, họ chỉ có thể lấy được:

- Tầng transmission: Ciphertext sau asymmetric encryption (không có private key không thể decrypt)
- Tầng storage: Digest sau hash (hash không thể đảo ngược, không thể khôi phục)

Hai tầng bảo vệ này đảm bảo security của password trên toàn link.

## Tổng kết

Quay lại câu hỏi ban đầu: Tại sao khi quên password chỉ có thể reset, không thể nói lại password cũ?

Vì server lưu giá trị sau khi password được xử lý bằng hash algorithm. **Hash algorithm không thể đảo ngược** — không thể khôi phục password gốc từ hash value. Đây là nguyên tắc cơ bản của password security.

Nếu một website có thể nói lại password gốc của bạn, nghĩa là nó **lưu password dạng plain text** — đây là ẩn họa bảo mật nghiêm trọng. Khuyến nghị ngay lập tức đổi password và tránh xa website đó.
