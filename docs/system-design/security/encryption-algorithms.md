---
title: Tổng hợp các thuật toán mã hóa phổ biến
description: Giải thích chi tiết các thuật toán mã hóa phổ biến, bao gồm nguyên lý và application scenario của symmetric và asymmetric encryption algorithms như AES, RSA cùng hash algorithms như MD5, SHA.
category: System Design
tag:
  - Security
  - Hash Algorithm
head:
  - - meta
    - name: keywords
      content: encryption algorithms,AES,RSA,hash algorithm,digest algorithm,HTTPS,symmetric encryption,asymmetric encryption,BCrypt
---

Thuật toán mã hóa là kỹ thuật dùng phương pháp toán học để biến đổi dữ liệu, mục đích là bảo vệ an toàn dữ liệu, ngăn người không được phép đọc hoặc sửa đổi. Thuật toán mã hóa có thể phân thành ba loại lớn: symmetric encryption algorithm, asymmetric encryption algorithm và hash algorithm (còn gọi là digest algorithm).

Các scenario phổ biến trong phát triển hàng ngày cần dùng đến thuật toán mã hóa:

1. Password lưu trong database cần thêm salt rồi dùng hash algorithm (như BCrypt) để mã hóa.
2. Dữ liệu nhạy cảm như số tài khoản ngân hàng, số CMND lưu trong database cần dùng symmetric encryption algorithm (như AES) để lưu.
3. Dữ liệu nhạy cảm được truyền qua mạng như số tài khoản ngân hàng, số CMND cần dùng HTTPS + asymmetric encryption algorithm (như RSA) để đảm bảo an toàn của dữ liệu truyền.
4. ……

ps: Nghiêm túc mà nói, hash algorithm thực ra không thuộc encryption algorithm, chỉ là có thể dùng trong một số encryption scenario (ví dụ password encryption). Hai cái có thể coi là parallel relationship. Encryption algorithm thường chỉ các algorithm có thể chuyển đổi plaintext thành ciphertext và có thể khôi phục ciphertext về plaintext thông qua một phương tiện nào đó (như key). Còn hash algorithm là quá trình một chiều, nó chuyển đổi input info thành một hash value có độ dài cố định, trông như ngẫu nhiên, nhưng quá trình này là không thể đảo ngược — tức là không thể khôi phục thông tin gốc từ hash value.

## Hash Algorithm

Hash algorithm còn gọi là hash function hay digest algorithm. Tác dụng của nó là tạo ra một unique identifier có độ dài cố định từ data có độ dài tùy ý — còn gọi là hash value, scatter value hoặc message digest (sau đây gọi thống nhất là hash value).

![Hash algorithm effect demonstration](https://oss.javaguide.cn/github/javaguide/system-design/security/encryption-algorithms/hash-function-effect-demonstration.png)

Hash algorithm là không thể đảo ngược — bạn không thể lấy lại giá trị gốc từ giá trị sau khi hash.

Tác dụng của hash value là có thể dùng để verify tính toàn vẹn và nhất quán của data.

Hai ví dụ thực tế:

- Khi lưu password vào database dùng hash algorithm để mã hóa, có thể phán đoán password có đúng không bằng cách so sánh hash value của password user nhập với hash value được lưu trong database.
- Khi chúng ta download một file, có thể phán đoán file có bị tamper hoặc hỏng không bằng cách so sánh hash value của file với hash value do official cung cấp.

Đặc điểm của thuật toán này là không thể đảo ngược:

- Không thể khôi phục data gốc từ hash value.
- Bất kỳ thay đổi nào trong data gốc đều sẽ gây ra thay đổi lớn trong hash value.

Hash algorithm có thể phân đơn giản thành hai loại:

1. **Cryptographic hash algorithm**: Hash algorithm có tính bảo mật cao, có thể cung cấp một mức độ bảo vệ tính toàn vẹn dữ liệu và chống tamper, chống lại một số phương pháp tấn công nhất định. Bảo mật tương đối cao nhưng hiệu năng kém hơn. Phù hợp với scenario yêu cầu bảo mật cao. Ví dụ SHA2, SHA3, SM3, RIPEMD-160, BLAKE2 v.v.
2. **Non-cryptographic hash algorithm**: Hash algorithm có tính bảo mật tương đối thấp, dễ bị ảnh hưởng bởi brute force, collision attack và các tấn công khác. Nhưng hiệu năng cao, phù hợp với scenario không yêu cầu bảo mật. Ví dụ CRC32, MurMurHash3 v.v.

Ngoài hai loại này còn có một số hash algorithm đặc biệt như **slow hash algorithm** có bảo mật cao hơn.

Các hash algorithm phổ biến:

- **MD (Message Digest)**: MD2, MD4, MD5 v.v., đã không còn được khuyến nghị.
- **SHA (Secure Hash Algorithm)**: SHA-1 series bảo mật thấp, SHA2, SHA3 series bảo mật cao hơn.
- **Chinese National Cryptography Algorithm (SM)**: Ví dụ SM2, SM3, SM4. SM2 là asymmetric encryption algorithm, SM4 là symmetric encryption algorithm, SM3 là hash algorithm (bảo mật và hiệu quả tương đương SHA-256, nhưng phù hợp hơn với môi trường ứng dụng trong nước).
- **Bcrypt (password hash algorithm)**: Password hash algorithm dựa trên Blowfish encryption algorithm, được thiết kế chuyên cho password encryption, bảo mật cao, thuộc slow hash algorithm.
- **MAC (Message Authentication Code)**: HMAC là một loại MAC dựa trên hash, có thể kết hợp với bất kỳ hash algorithm an toàn nào, ví dụ SHA-256.
- **CRC (Cyclic Redundancy Check)**: CRC32 là một CRC algorithm, đặc điểm là tạo ra 32-bit checksum, thường dùng trong data integrity check, file check v.v.
- **SipHash**: Không phải traditional keyless cryptographic hash function (như SHA-256), mà là keyed PRF (Pseudo-Random Function). Phải dùng kết hợp với một random key mới thực sự có khả năng chống collision attack. Mục đích thiết kế là đạt được sự cân bằng giữa tốc độ và bảo mật, dùng để phòng chống [hash flooding DoS attack](https://aumasson.jp/siphash/siphashdos_29c3_slides.pdf). Rust mặc định dùng SipHash làm hash algorithm (hiện là SipHash-1-3). Từ Redis 4.0, hash algorithm của dictionary (dict) đã chuyển từ MurmurHash2 sang SipHash (hiện là SipHash-1-2).
- **MurMurHash**: Classic fast non-cryptographic hash algorithm, phiên bản mới nhất hiện tại là MurMurHash3, có thể tạo ra hash value 32-bit hoặc 128-bit.
- ……

Hash algorithm thường không cần key, nhưng cũng có một số special hash algorithm cần key. Ví dụ, MAC và SipHash là loại hash algorithm dựa trên key — nó thêm một key vào nền tảng hash algorithm, làm cho chỉ người biết key mới có thể verify tính toàn vẹn và nguồn gốc của data.

### MD

MD algorithm có nhiều phiên bản bao gồm MD2, MD4, MD5 v.v. Trong đó MD5 là phiên bản phổ biến nhất, có thể tạo ra hash value 128-bit (16 byte). Về bảo mật: MD5 > MD4 > MD2. Ngoài các phiên bản này còn có một số algorithm cải tiến dựa trên MD4 hoặc MD5 như RIPEMD, HAVAL v.v.

Ngay cả MD algorithm an toàn nhất là MD5 cũng có rủi ro bị crack. Attacker có thể tìm ra hash value trùng với data gốc thông qua brute force hoặc rainbow table attack, từ đó crack data.

Để tăng độ khó crack, thông thường có thể chọn cách thêm salt. Salt (Muối) trong mật mã học là kỹ thuật chèn một string cụ thể vào bất kỳ vị trí cố định nào trong password, làm cho kết quả hash khác với kết quả hash dùng password gốc — quá trình này gọi là "salting".

Thêm salt rồi có an toàn không? Không hẳn, điều này chỉ tăng độ khó crack, không có nghĩa là không thể crack. Và bản thân MD5 algorithm tồn tại vấn đề weak collision — nhiều input khác nhau tạo ra cùng MD5 value.

Do đó, MD algorithm đã không còn được khuyến nghị. Nên dùng các hash algorithm an toàn hơn như SHA-2, Bcrypt.

Java cung cấp hỗ trợ cho MD algorithm series bao gồm MD2, MD5.

MD5 code example (without salt):

```java
String originalString = "Java Learning + Interview Guide: javaguide.cn";
// Tạo MD5 digest object
MessageDigest messageDigest = MessageDigest.getInstance("MD5");
messageDigest.update(originalString.getBytes(StandardCharsets.UTF_8));
// Tính hash value
byte[] result = messageDigest.digest();
// Chuyển đổi hash value sang hex string
String hexString = new HexBinaryAdapter().marshal(result);
System.out.println("Original String: " + originalString);
System.out.println("MD5 Hash: " + hexString.toLowerCase());
```

Output:

```bash
Original String: Java Learning + Interview Guide: javaguide.cn
MD5 Hash: fb246796f5b1b60d4d0268c817c608fa
```

### SHA

SHA (Secure Hash Algorithm) series algorithm là một nhóm cryptographic hash algorithm, dùng để map data có độ dài tùy ý thành hash value có độ dài cố định. SHA series algorithm được NSA (National Security Agency) thiết kế năm 1993, hiện có ba phiên bản SHA-1, SHA-2, SHA-3.

SHA-1 algorithm map data có độ dài tùy ý thành hash value 160-bit. Tuy nhiên, SHA-1 algorithm tồn tại một số lỗ hổng nghiêm trọng như bảo mật thấp, dễ bị collision attack và length extension attack. Do đó, SHA-1 algorithm đã không còn được khuyến nghị. SHA-2 family (như SHA-256, SHA-384, SHA-512 v.v.) và SHA-3 series là giải pháp thay thế SHA-1, chúng đều cung cấp bảo mật cao hơn và hash value dài hơn.

SHA-2 family được cải tiến từ SHA-1 algorithm, sử dụng quá trình tính toán phức tạp hơn và nhiều vòng hơn, khiến attacker khó tìm collision hơn qua precomputation hoặc may rủi.

Để tìm kiếm cryptographic hash algorithm an toàn và tiên tiến hơn, NIST (National Institute of Standards and Technology) công khai kêu gọi đề xuất SHA-3 candidate algorithm vào năm 2007. NIST nhận được 64 đề xuất algorithm, sau nhiều vòng đánh giá và lọc, cuối cùng vào năm 2012 công bố Keccak algorithm thắng, trở thành SHA-3 standard algorithm (SHA-3 không có quan hệ trực tiếp với SHA-2). Keccak algorithm có tư duy thiết kế hoàn toàn khác với MD và SHA-1/2 — đó là Sponge Construction, khiến các phương pháp tấn công truyền thống không thể áp dụng trực tiếp cho SHA-3 (có thể chống lại tất cả các phương thức tấn công đã biết hiện nay bao gồm collision attack, length extension attack, differential attack v.v.).

Vì SHA-2 algorithm chưa xuất hiện lỗ hổng bảo mật nghiêm trọng và hiệu quả trong phần mềm cao hơn, nên phần lớn người vẫn có xu hướng dùng SHA-2 algorithm.

So với MD5 algorithm, lý do SHA-2 algorithm mạnh hơn chủ yếu có hai điểm:

- Hash value dài hơn: Ví dụ hash value của SHA-256 algorithm dài 256-bit, còn MD5 algorithm dài 128-bit. Điều này tăng độ khó cho attacker brute force hoặc rainbow table attack.
- Khả năng chống collision mạnh hơn: SHA algorithm dùng quá trình tính toán phức tạp hơn và nhiều vòng hơn, khiến attacker khó tìm collision hơn qua precomputation hoặc may rủi. Hiện chưa tìm thấy bất kỳ hai data khác nhau nào có cùng SHA-256 hash value.

Tất nhiên SHA-2 cũng không tuyệt đối an toàn, cũng có rủi ro bị brute force hoặc rainbow table attack. Vì vậy trong ứng dụng thực tế, salting vẫn là không thể thiếu.

Java cung cấp hỗ trợ cho SHA algorithm series bao gồm SHA-1, SHA-256, SHA-384 và SHA-512.

SHA-256 code example (without salt):

```java
String originalString = "Java Learning + Interview Guide: javaguide.cn";
// Tạo SHA-256 digest object
MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
messageDigest.update(originalString.getBytes());
// Tính hash value
byte[] result = messageDigest.digest();
// Chuyển đổi hash value sang hex string
String hexString = new HexBinaryAdapter().marshal(result);
System.out.println("Original String: " + originalString);
System.out.println("SHA-256 Hash: " + hexString.toLowerCase());
```

Output:

```bash
Original String: Java Learning + Interview Guide: javaguide.cn
SHA-256 Hash: 184eb7e1d7fb002444098c9bde3403c6f6722c93ecfac242c0e35cd9ed3b41cd
```

### Bcrypt

Bcrypt algorithm là password hash algorithm dựa trên Blowfish encryption algorithm, được thiết kế chuyên cho password encryption, bảo mật cao.

Do Bcrypt sử dụng hai cơ chế là salt và cost, nó có thể hiệu quả ngăn chặn rainbow table attack và brute force attack, từ đó đảm bảo tính bảo mật của password. Salt là một string được tạo ngẫu nhiên, dùng để trộn với password, tăng complexity và uniqueness của password. Cost là numeric parameter, dùng để kiểm soát số lần iteration của Bcrypt algorithm, tăng thời gian tính toán và resource consumption của password hash.

Bcrypt algorithm có thể điều chỉnh complexity của encryption theo tình hình thực tế, có thể đặt các cost value và salt value khác nhau để đáp ứng các yêu cầu bảo mật khác nhau, flexibility rất cao.

Spring Security — security framework của Java application — hỗ trợ nhiều password encoder, trong đó `BCryptPasswordEncoder` là một loại được official khuyến nghị, nó dùng BCrypt algorithm để mã hóa và lưu password của user.

```java
@Bean
public PasswordEncoder passwordEncoder(){
    return new BCryptPasswordEncoder();
}
```

## Symmetric Encryption (Mã hóa đối xứng)

Symmetric encryption algorithm là algorithm mã hóa và giải mã dùng cùng một key — còn gọi là shared key encryption algorithm.

![Symmetric Encryption](https://oss.javaguide.cn/github/javaguide/system-design/security/encryption-algorithms/symmetric-encryption.png)

Các symmetric encryption algorithm phổ biến gồm DES, 3DES, AES v.v.

### DES và 3DES

DES (Data Encryption Standard) dùng key 64-bit (effective key length 56-bit, 8-bit parity check) và plaintext 64-bit để mã hóa.

Mặc dù DES mỗi lần chỉ mã hóa được 64-bit, nhưng chúng ta chỉ cần chia plaintext thành các block 64-bit, là có thể thực hiện mã hóa plaintext có độ dài tùy ý. Nếu độ dài plaintext không phải bội số của 64-bit, phải thực hiện padding. Các padding mode phổ biến gồm PKCS5Padding, PKCS7Padding, NOPADDING.

Core idea của DES encryption algorithm là chia plaintext 64-bit thành hai nửa, sau đó thực hiện nhiều vòng biến đổi trên mỗi nửa, cuối cùng gộp lại thành ciphertext 64-bit. Các biến đổi này bao gồm permutation, XOR, selection, shift và các thao tác khác. Mỗi vòng đều dùng một subkey, và các subkey đều được tạo từ cùng một master key 56-bit. DES encryption algorithm tổng cộng thực hiện 16 vòng biến đổi, cuối cùng thực hiện một inverse permutation để ra ciphertext cuối.

![DES (Data Encryption Standard)](https://oss.javaguide.cn/github/javaguide/system-design/security/des-steps.jpg)

Đây là một classic symmetric encryption algorithm, nhưng cũng có nhược điểm rõ ràng — key 56-bit không đủ bảo mật, đã được chứng minh có thể crack trong thời gian ngắn.

Để cải thiện bảo mật của DES algorithm, người ta đề xuất một số variant hoặc giải pháp thay thế như 3DES (Triple DES).

3DES (Triple DES) là encryption algorithm chuyển tiếp từ DES sang AES, nó dùng 2 hoặc 3 key 56-bit để mã hóa data ba lần. 3DES tương đương với việc áp dụng ba lần symmetric encryption algorithm DES trên mỗi data block.

Để tương thích với DES thông thường, 3DES không trực tiếp dùng cách encrypt->encrypt->encrypt mà dùng encrypt->decrypt->encrypt. Khi cả ba key đều giống nhau, hai bước trước cancel nhau, tương đương với chỉ thực hiện một lần mã hóa, do đó có thể tương thích với DES encryption algorithm thông thường. 3DES an toàn hơn DES nhưng tốc độ xử lý không cao.

### AES

AES (Advanced Encryption Standard) algorithm là symmetric key encryption algorithm tiên tiến hơn, nó dùng key 128-bit, 192-bit hoặc 256-bit để mã hóa hoặc giải mã data. Key càng dài, bảo mật càng cao.

AES cũng là block cipher, block length chỉ có thể là 128-bit, tức là mỗi block là 16 byte. AES encryption algorithm có nhiều mode of operation như ECB, CBC, OFB, CFB, CTR, XTS, OCB, GCM (mode được dùng rộng rãi nhất hiện nay). Các mode khác nhau có parameter và encryption flow khác nhau, nhưng core vẫn là AES algorithm.

Tương tự DES, đối với plaintext không phải bội số của 128-bit cần thực hiện padding. Các padding mode phổ biến gồm PKCS5Padding, PKCS7Padding, NOPADDING. Tuy nhiên, AES-GCM là stream cipher algorithm, có thể mã hóa plaintext có độ dài tùy ý, vì vậy padding mode tương ứng là NoPadding — không cần padding.

Tốc độ của AES nhanh hơn 3DES và an toàn hơn.

![AES (Advanced Encryption Standard)](https://oss.javaguide.cn/github/javaguide/system-design/security/aes-steps.jpg)

So sánh đơn giản DES và AES (hình ảnh từ: [RSA vs. AES Encryption: Key Differences Explained](https://cheapsslweb.com/blog/rsa-vs-aes-encryption)):

![DES vs AES comparison](https://oss.javaguide.cn/github/javaguide/system-design/security/des-vs-aes.png)

AES algorithm code example dựa trên Java:

```java
private static final String AES_ALGORITHM = "AES";
// AES key
private static final String AES_SECRET_KEY = "4128D9CDAC7E2F82951CBAF7FDFE675B";
// AES encryption mode GCM, padding mode NoPadding
// AES-GCM là stream cipher algorithm nên padding mode là NoPadding — không cần padding
private static final String AES_TRANSFORMATION = "AES/GCM/NoPadding";
// Encryptor
private static Cipher encryptionCipher;
// Decryptor
private static Cipher decryptionCipher;

/**
 * Khởi tạo
 */
public static void init() throws Exception {
    // Chuyển đổi AES key thành SecretKeySpec object
    SecretKeySpec secretKeySpec = new SecretKeySpec(AES_SECRET_KEY.getBytes(), AES_ALGORITHM);
    // Lấy encryptor tương ứng với AES encryption mode và padding mode được chỉ định rồi khởi tạo
    encryptionCipher = Cipher.getInstance(AES_TRANSFORMATION);
    encryptionCipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);
    // Lấy decryptor tương ứng với AES encryption mode và padding mode được chỉ định rồi khởi tạo
    decryptionCipher = Cipher.getInstance(AES_TRANSFORMATION);
    decryptionCipher.init(Cipher.DECRYPT_MODE, secretKeySpec, new GCMParameterSpec(128, encryptionCipher.getIV()));
}

/**
 * Mã hóa
 */
public static String encrypt(String data) throws Exception {
    byte[] dataInBytes = data.getBytes();
    // Mã hóa dữ liệu
    byte[] encryptedBytes = encryptionCipher.doFinal(dataInBytes);
    return Base64.getEncoder().encodeToString(encryptedBytes);
}

/**
 * Giải mã
 */
public static String decrypt(String encryptedData) throws Exception {
    byte[] dataInBytes = Base64.getDecoder().decode(encryptedData);
    // Giải mã dữ liệu
    byte[] decryptedBytes = decryptionCipher.doFinal(dataInBytes);
    return new String(decryptedBytes, StandardCharsets.UTF_8);
}

public static void main(String[] args) throws Exception {
    String originalString = "Java Learning + Interview Guide: javaguide.cn";
    init();
    String encryptedData = encrypt(originalString);
    String decryptedData = decrypt(encryptedData);
    System.out.println("Original String: " + originalString);
    System.out.println("AES Encrypted Data : " + encryptedData);
    System.out.println("AES Decrypted Data : " + decryptedData);
}
```

Output:

```bash
Original String: Java Learning + Interview Guide: javaguide.cn
AES Encrypted Data : E1qTkK91suBqToag7WCyoFP9uK5hR1nSfM6p+oBlYj71bFiIVnk5TsQRT+zpjv8stha7oyKi3jQ=
AES Decrypted Data : Java Learning + Interview Guide: javaguide.cn
```

## Asymmetric Encryption (Mã hóa bất đối xứng)

Asymmetric encryption algorithm là algorithm mã hóa và giải mã dùng các key khác nhau — còn gọi là public key encryption algorithm. Hai key này khác nhau, một cái gọi là public key (có thể công khai cho bất kỳ ai), cái còn lại gọi là private key (cần bảo mật).

Nếu dùng public key để mã hóa data, chỉ có thể dùng private key tương ứng để giải mã (encryption); nếu dùng private key để mã hóa data, chỉ có thể dùng public key tương ứng để giải mã (signature). Như vậy có thể thực hiện truyền dữ liệu an toàn và identity authentication.

![Asymmetric Encryption](https://oss.javaguide.cn/github/javaguide/system-design/security/encryption-algorithms/asymmetric-encryption.png)

Các asymmetric encryption algorithm phổ biến gồm RSA, DSA, ECC v.v.

### RSA

RSA (Rivest–Shamir–Adleman algorithm) là asymmetric encryption algorithm dựa trên difficulty của large number factorization. Nó cần chọn hai large prime numbers làm một phần của private key, sau đó tính tích của chúng làm một phần của public key (tìm hai large prime numbers tương đối đơn giản, còn factorize tích của chúng cực kỳ khó). Chi tiết về nguyên lý RSA algorithm có thể tham khảo bài: [Do you really understand RSA encryption algorithm? - Xiaofuge](https://www.cnblogs.com/xiaofuge/p/16954187.html).

Bảo mật của RSA algorithm phụ thuộc vào độ khó của large number factorization. Hiện tại đã có RSA public key 512-bit và 768-bit bị factorize thành công, vì vậy khuyến nghị dùng key length 2048-bit trở lên.

Ưu điểm của RSA algorithm là đơn giản dễ dùng, có thể dùng cho data encryption và digital signature. Nhược điểm là tốc độ tính toán chậm, không phù hợp với mã hóa lượng lớn dữ liệu.

RSA algorithm là asymmetric encryption algorithm được ứng dụng rộng rãi nhất hiện nay. Các protocol như SSL/TLS, SSH đều có dùng RSA algorithm.

![HTTPS certificate signing algorithm with SHA-256 with RSA encryption](https://oss.javaguide.cn/github/javaguide/system-design/security/encryption-algorithms/https-rsa-sha-256.png)

RSA algorithm code example dựa trên Java:

```java
private static final String RSA_ALGORITHM = "RSA";

/**
 * Tạo RSA key pair
 */
public static KeyPair generateKeyPair() throws NoSuchAlgorithmException {
    KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(RSA_ALGORITHM);
    // Key size là 2048-bit
    keyPairGenerator.initialize(2048);
    return keyPairGenerator.generateKeyPair();
}

/**
 * Mã hóa data bằng public key
 */
public static String encrypt(String data, PublicKey publicKey) throws Exception {
    Cipher cipher = Cipher.getInstance(RSA_ALGORITHM);
    cipher.init(Cipher.ENCRYPT_MODE, publicKey);
    byte[] encryptedData = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
    return Base64.getEncoder().encodeToString(encryptedData);
}

/**
 * Giải mã data bằng private key
 */
public static String decrypt(String encryptedData, PrivateKey privateKey) throws Exception {
    byte[] decodedData = Base64.getDecoder().decode(encryptedData);
    Cipher cipher = Cipher.getInstance(RSA_ALGORITHM);
    cipher.init(Cipher.DECRYPT_MODE, privateKey);
    byte[] decryptedData = cipher.doFinal(decodedData);
    return new String(decryptedData, StandardCharsets.UTF_8);
}

public static void main(String[] args) throws Exception {
    KeyPair keyPair = generateKeyPair();
    PublicKey publicKey = keyPair.getPublic();
    PrivateKey privateKey = keyPair.getPrivate();
    String originalString = "Java Learning + Interview Guide: javaguide.cn";
    String encryptedData = encrypt(originalString, publicKey);
    String decryptedData = decrypt(encryptedData, privateKey);
    System.out.println("Original String: " + originalString);
    System.out.println("RSA Encrypted Data : " + encryptedData);
    System.out.println("RSA Decrypted Data : " + decryptedData);
}
```

Output:

```bash
Original String: Java Learning + Interview Guide: javaguide.cn
RSA Encrypted Data : T9ey/CEPUAhZm4UJjuVNIg8RPd1fQ32S9w6+rvOKxmuMumkJY2daFfWuCn8A73Mk5bL6TigOJI0GHfKOt/W2x968qLM3pBGCcPX17n4pR43f32IIIz9iPdgF/INOqDxP5ZAtCDvTiuzcSgDHXqiBSK5TDjtj7xoGjfudYAXICa8pWitnqDgJYoo2J0F8mKzxoi8D8eLE455MEx8ZT1s7FUD/z7/H8CfShLRbO9zq/zFI06TXn123ufg+F4lDaq/5jaIxGVEUB/NFeX4N6OZCFHtAV32mw71BYUadzI9TgvkkUr1rSKmQ0icNhnRdKedJokGUh8g9QQ768KERu92Ibg==
RSA Decrypted Data : Java Learning + Interview Guide: javaguide.cn
```

### DSA

DSA (Digital Signature Algorithm) là asymmetric encryption algorithm dựa trên difficulty của discrete logarithm. Nó cần chọn một prime number q và một multiple of q là p làm một phần của private key, sau đó tính một primitive root g modulo p và một integer y modulo q làm một phần của public key. Bảo mật của DSA algorithm phụ thuộc vào độ khó của discrete logarithm. Hiện đã có DSA public key 1024-bit bị crack thành công, vì vậy khuyến nghị dùng key length 2048-bit trở lên.

Ưu điểm của DSA algorithm là digital signature nhanh, phù hợp để tạo digital certificate. Nhược điểm là không thể dùng cho data encryption và quá trình signing cần random number.

Quá trình signing của DSA algorithm:

1. Dùng message digest algorithm để mã hóa data cần gửi, tạo ra một information digest — tức là biểu diễn data ngắn, duy nhất, không thể đảo ngược.
2. Bên gửi dùng DSA private key của mình để mã hóa information digest lần nữa, tạo thành digital signature — tức là data attachment có thể chứng minh nguồn gốc và tính toàn vẹn của data.
3. Truyền original data và digital signature cùng nhau qua internet đến bên nhận.
4. Bên nhận dùng public key của bên gửi để giải mã digital signature, lấy được information digest. Đồng thời, bên nhận cũng dùng message digest algorithm để mã hóa original data nhận được, lấy được một information digest khác. Bên nhận so sánh hai information digest, nếu nhất quán thì chứng tỏ data không bị tamper hoặc hỏng trong quá trình truyền; ngược lại thì data đã mất security và confidentiality.

![DSA algorithm signing process](https://oss.javaguide.cn/github/javaguide/system-design/security/encryption-algorithms/dsa-algorithm-signing-process.png)

## Tổng kết

Bài viết này giới thiệu ba loại encryption algorithm: hash algorithm, symmetric encryption algorithm và asymmetric encryption algorithm.

- Hash algorithm là kỹ thuật dùng phương pháp toán học để tạo ra unique identifier có độ dài cố định từ data, có thể dùng để verify tính toàn vẹn và nhất quán của data. Các hash algorithm phổ biến gồm MD, SHA, MAC v.v.
- Symmetric encryption algorithm là algorithm mã hóa và giải mã dùng cùng một key, có thể dùng để bảo vệ security và confidentiality của data. Các symmetric encryption algorithm phổ biến gồm DES, 3DES, AES v.v.
- Asymmetric encryption algorithm là algorithm mã hóa và giải mã dùng các key khác nhau, có thể dùng để thực hiện truyền dữ liệu an toàn và identity authentication. Các asymmetric encryption algorithm phổ biến gồm RSA, DSA, ECC v.v.

## Tài liệu tham khảo

- Deep understanding of perfect hashing - Tencent Technical Engineering: <https://mp.weixin.qq.com/s/M8Wcj8sZ7UF1CMr887Puog>
- Practical cryptography for developers (2) — Hash functions: <https://thiscute.world/posts/practical-cryptography-basics-2-hash/>
- Wonderful security journey of DSA algorithm: <https://zhuanlan.zhihu.com/p/347025157>
- Introduction to AES-GCM encryption: <https://juejin.cn/post/6844904122676690951>
- Java AES 256 GCM Encryption and Decryption Example | JCE Unlimited Strength: <https://www.javainterviewpoint.com/java-aes-256-gcm-encryption-and-decryption/>

<!-- @include: @article-footer.snippet.md -->
