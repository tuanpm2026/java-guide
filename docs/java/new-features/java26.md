---
title: Tổng quan tính năng mới Java 26
description: Tổng quan các tính năng mới và thay đổi xem trước quan trọng trong JDK 26, tập trung vào HTTP/3, tối ưu hóa hiệu năng GC, bộ nhớ đệm AOT và các cải tiến ngôn ngữ/nền tảng.
category: Java
tag:
  - Java Tính năng mới
head:
  - - meta
    - name: keywords
      content: Java 26,JDK26,HTTP/3,G1 GC,AOT 缓存,延迟常量,结构化并发,向量 API,模式匹配
---

JDK 26 được phát hành vào ngày 17 tháng 3 năm 2026, đây là phiên bản không phải LTS (không hỗ trợ dài hạn). Phiên bản hỗ trợ dài hạn trước đó là **JDK 25**, phiên bản hỗ trợ dài hạn tiếp theo dự kiến là **JDK 29**.

JDK 26 có tổng cộng 10 tính năng mới. Bài viết này sẽ chọn lọc và giới thiệu chi tiết một số tính năng quan trọng:

- [JEP 517: HTTP/3 for the HTTP Client API (Thêm hỗ trợ HTTP/3 cho HTTP Client API)](https://openjdk.org/jeps/517)
- [JEP 522: G1 GC: Improve Throughput by Reducing Synchronization (Tối ưu hóa thông lượng G1 GC)](https://openjdk.org/jeps/522)
- [JEP 516: Ahead-of-Time Object Caching with Any GC (Bộ nhớ đệm đối tượng AOT hỗ trợ bất kỳ GC nào)](https://openjdk.org/jeps/516)
- [JEP 500: Prepare to Make Final Mean Final (Chuẩn bị để final thực sự bất biến)](https://openjdk.org/jeps/500)
- [JEP 526: Lazy Constants (Hằng số lười, lần xem trước thứ hai)](https://openjdk.org/jeps/526)
- [JEP 525: Structured Concurrency (Đồng thời có cấu trúc, lần xem trước thứ sáu)](https://openjdk.org/jeps/525)
- [JEP 530: Primitive Types in Patterns, instanceof, and switch (Pattern matching hỗ trợ kiểu nguyên thủy, lần xem trước thứ tư)](https://openjdk.org/jeps/530)
- [JEP 524: PEM Encodings of Cryptographic Objects (Mã hóa PEM cho đối tượng mật mã, lần xem trước thứ hai)](https://openjdk.org/jeps/524)
- [JEP 529: Vector API (Vector API, lần incubate thứ mười một)](https://openjdk.org/jeps/529)
- [JEP 504: Remove the Applet API (Loại bỏ Applet API)](https://openjdk.org/jeps/504)

Biểu đồ dưới đây thể hiện số lượng tính năng mới và thời gian phát hành từ JDK 8 đến JDK 25:

![](/images/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 517: Thêm hỗ trợ HTTP/3 cho HTTP Client API

JDK 26 chính thức bổ sung hỗ trợ **HTTP/3** cho API `java.net.http.HttpClient` — đây là một bản cập nhật quan trọng được mong chờ từ lâu.

**Ưu điểm của HTTP/3**:

- **Dựa trên giao thức QUIC**: HTTP/2 được xây dựng trên giao thức TCP, HTTP/3 bổ sung giao thức QUIC (Quick UDP Internet Connections) để thực hiện truyền tải đáng tin cậy, cung cấp bảo mật tương đương TLS/SSL với độ trễ kết nối và truyền tải thấp hơn. Bạn có thể coi QUIC như phiên bản nâng cấp của UDP, bổ sung nhiều tính năng như mã hóa, truyền lại, v.v.
- **Loại bỏ head-of-line blocking**: HTTP/2 ghép kênh nhiều yêu cầu trên một kết nối TCP — một khi xảy ra mất gói, tất cả các yêu cầu HTTP đều bị chặn. Nhờ đặc tính của giao thức QUIC, HTTP/3 giải quyết được phần nào vấn đề head-of-line blocking (HOL blocking): một kết nối tạo ra nhiều luồng dữ liệu độc lập nhau, một luồng bị mất gói không ảnh hưởng đến các luồng khác (về bản chất là ghép kênh + round-robin).
- **Thiết lập kết nối nhanh hơn**: HTTP/2 cần trải qua quá trình bắt tay TCP ba bước kinh điển (do kết nối HTTPS an toàn còn cần bắt tay TLS, tổng cộng khoảng 3 RTT). Nhờ đặc tính của QUIC (TLS 1.3 — ngoài hỗ trợ bắt tay 1 RTT, còn hỗ trợ bắt tay 0 RTT), việc thiết lập kết nối chỉ cần 0-RTT hoặc 1-RTT. Điều này có nghĩa là trong trường hợp tốt nhất, QUIC không cần thêm bất kỳ vòng đi-về nào để thiết lập kết nối mới.
- **Trải nghiệm di động tốt hơn**: HTTP/3.0 hỗ trợ di chuyển kết nối vì QUIC dùng ID 64-bit để nhận dạng kết nối — miễn là ID không đổi, kết nối không bị ngắt, ngay cả khi môi trường mạng thay đổi (như chuyển từ Wi-Fi sang dữ liệu di động). Còn kết nối TCP được xác định bởi bộ tứ (IP nguồn, cổng nguồn, IP đích, cổng đích) — hễ một trong bốn giá trị thay đổi, kết nối đó không còn dùng được nữa.

Để đọc thêm, tham khảo bài viết: [Tổng hợp câu hỏi phỏng vấn mạng máy tính thường gặp (Phần 1)](https://javaguide.cn/cs-basics/network/other-network-questions.html) (Mô hình phân lớp mạng, tổng hợp các giao thức mạng phổ biến, HTTP, WebSocket, DNS, v.v.)

**Cách sử dụng**:

HTTP/3 rất dễ sử dụng, hầu như không cần sửa đổi mã hiện có. `HttpClient` sẽ tự động thương lượng sử dụng phiên bản HTTP cao nhất:

```java
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://example.com"))
    .build();

// 如果服务器支持 HTTP/3，HttpClient 会自动升级使用
HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());

System.out.println(response.body());
```

Nếu cần chỉ định rõ ràng sử dụng HTTP/3, có thể thiết lập qua phương thức `version()`:

```java
// 所有请求默认优先使用 HTTP/3
HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_3)  // 明确指定 HTTP/3
    .build();

// 设置单个HttpRequest对象的首选协议版本
HttpRequest request = HttpRequest.newBuilder(URI.create("https://javaguide.cn/"))
                         .version(HttpClient.Version.HTTP_3)
                         .GET().build();
```

## JEP 522: Tối ưu hóa thông lượng G1 GC

**Từ JDK 9, G1 garbage collector trở thành garbage collector mặc định.** Nó tìm sự cân bằng giữa độ trễ và thông lượng. Tuy nhiên, sự cân bằng này đôi khi ảnh hưởng đến hiệu năng ứng dụng. So với Parallel GC thiên về thông lượng, G1 làm việc đồng thời với ứng dụng nhiều hơn để giảm thời gian dừng GC. Nhưng điều này đồng nghĩa các luồng ứng dụng phải chia sẻ CPU với luồng GC và phải phối hợp với nhau — sự đồng bộ hóa này làm giảm thông lượng và tăng độ trễ.

JEP 522 giới thiệu cơ chế **Card Table kép**:

1. **Card table thứ nhất**: Write barrier của luồng ứng dụng cập nhật card table này **không cần bất kỳ đồng bộ hóa nào**, khiến mã write barrier đơn giản hơn và nhanh hơn.
2. **Card table thứ hai**: Luồng optimizer xử lý song song card table này (ban đầu trống) ở chạy nền.

Khi G1 phát hiện việc quét card table thứ nhất có thể vượt quá mục tiêu thời gian dừng, nó sẽ hoán đổi nguyên tử hai card table. Luồng ứng dụng tiếp tục cập nhật bảng thứ hai (trống, vốn là bảng thứ nhất), còn luồng optimizer xử lý bảng thứ nhất (đầy, vốn là bảng thứ hai) mà không cần đồng bộ hóa thêm.

**Hiệu quả cải thiện hiệu năng**:

- Với các ứng dụng **thường xuyên sửa đổi trường tham chiếu đối tượng**, thông lượng tăng **5-15%**
- Ngay cả với các ứng dụng ít sửa đổi trường tham chiếu, do write barrier được đơn giản hóa (giảm từ khoảng 50 lệnh xuống còn 12 lệnh trên x64), thông lượng cũng có thể tăng đến **5%**
- Thời gian dừng GC cũng **giảm nhẹ**

**Chi phí bộ nhớ**:

Card table thứ hai có cùng dung lượng với card table thứ nhất; mỗi card table cần 0,2% dung lượng Java heap, tức là mỗi 1GB heap sẽ sử dụng thêm khoảng 2MB native memory.

## JEP 516: Bộ nhớ đệm đối tượng AOT hỗ trợ bất kỳ GC nào

Đây là cột mốc quan trọng của **Project Leyden**, cho phép bộ nhớ đệm đối tượng ahead-of-time (AOT) hoạt động với **bất kỳ garbage collector nào**.

Trước đây, AOT class data sharing được giới thiệu trong JDK 24 (JEP 483) chỉ hỗ trợ G1 garbage collector, không thể phối hợp với các GC khác như ZGC. Nguyên nhân là các tham chiếu đối tượng lưu trữ trong bộ nhớ đệm AOT sử dụng địa chỉ bộ nhớ vật lý, trong khi layout bộ nhớ và chiến lược di chuyển đối tượng của các GC khác nhau thì khác nhau.

JEP 516 thay đổi cách lưu trữ tham chiếu đối tượng từ **địa chỉ bộ nhớ vật lý** sang **chỉ mục logic**:

- Lưu trữ bộ nhớ đệm theo định dạng luồng độc lập với GC
- Bộ nhớ đệm có thể được bất kỳ GC nào tải và giải phân tích tại runtime
- JVM chuyển đổi chỉ mục logic thành địa chỉ bộ nhớ thực tế khi tải

**Lợi ích hiệu năng**:

- **Tối ưu thời gian khởi động**: Giảm đáng kể thời gian cold start của ứng dụng Java
- **Hỗ trợ ZGC**: ZGC có độ trễ thấp giờ cũng có thể hưởng lợi từ tăng tốc khởi động của bộ nhớ đệm AOT
- **Thân thiện với cloud-native**: Đặc biệt có giá trị cho các tình huống nhạy cảm với thời gian khởi động như microservice và serverless function

## JEP 500: Chuẩn bị để final thực sự bất biến

Tính năng này mở đường cho nguyên tắc integrity-first của Java, chuẩn bị để các trường `final` thực sự trở nên bất biến.

Từ JDK 1.0, các trường `final` trong Java thực ra có thể bị sửa đổi thông qua **deep reflection**:

```java
import java.lang.reflect.Field;
import java.lang.reflect.Method;

class Example {
    private final String name = "Original";

    public String getName() {
        return name;
    }
}

// 通过反射修改 final 字段
Example example = new Example();
Field field = Example.class.getDeclaredField("name");
field.setAccessible(true);

// 移除 final 修饰符
Field modifiersField = Field.class.getDeclaredField("modifiers");
modifiersField.setAccessible(true);
modifiersField.setInt(field, field.getModifiers() & ~Modifier.FINAL);

field.set(example, "Modified");  // 成功修改了 final 字段！
System.out.println(example.getName());  // 输出 "Modified"
```

Khả năng này, dù được sử dụng bởi một số framework (như thư viện serialization, framework dependency injection, công cụ kiểm thử), đã phá vỡ đảm bảo tính bất biến của `final` và cản trở tối ưu hóa trình biên dịch.

Trong JDK 26, khi sửa đổi trường `final` thông qua deep reflection, JVM sẽ **phát ra cảnh báo**. Đây là bước chuẩn bị cho việc cấm mặc định thao tác này trong các phiên bản tương lai.

Với các trường hợp thực sự cần sửa đổi trường `final`, JDK 26 cung cấp cơ chế opt-in tường minh, cho phép nhà phát triển tiếp tục sử dụng khả năng này trong thời kỳ chuyển tiếp, đồng thời chuẩn bị cho chế độ strict trong tương lai.

## JEP 526: Hằng số lười (lần xem trước thứ hai)

Tính năng này được xem trước lần đầu bởi [JEP 501](https://openjdk.org/jeps/501) (JDK 25), JDK 26 là lần xem trước thứ hai.

Các trường `static final` truyền thống được khởi tạo khi lớp được tải, điều này:

- Tăng thời gian khởi động.
- Lãng phí bộ nhớ nếu hằng số đó chưa bao giờ được dùng.
- Đòi hỏi các pattern khởi tạo lười phức tạp (như double-checked locking, Holder class pattern, v.v.).

JEP 526 giới thiệu `LazyConstant<T>` — một đối tượng giữ dữ liệu bất biến mà JVM coi như một hằng số thực sự, đạt được hiệu năng tương đương khai báo trường `final`.

```java
// 传统方式：类加载时立即初始化
static final ExpensiveObject TRADITIONAL = new ExpensiveObject();

// 新方式：首次访问时才初始化
static final LazyConstant<ExpensiveObject> LAZY =
    LazyConstant.of(() -> new ExpensiveObject());

// 使用时
ExpensiveObject obj = LAZY.get();  // 此时才初始化
```

**Ưu điểm**:

- **Khởi tạo theo nhu cầu**: Chỉ khởi tạo khi được truy cập lần đầu, cải thiện hiệu năng khởi động.
- **Thread-safe**: Có đảm bảo thread-safe tích hợp, không cần đồng bộ hóa thủ công.
- **Tối ưu hóa JVM**: JVM có thể tối ưu hóa hằng số lười giống như trường `final`.
- **Đơn giản hóa mã**: Loại bỏ các pattern khởi tạo lười phức tạp như double-checked locking.

## JEP 525: Đồng thời có cấu trúc (lần xem trước thứ sáu)

JDK 19 đã giới thiệu đồng thời có cấu trúc — một phương pháp lập trình đa luồng nhằm đơn giản hóa lập trình đa luồng thông qua Structured Concurrency API, không nhằm thay thế `java.util.concurrent`, hiện đang ở giai đoạn incubator.

Đồng thời có cấu trúc coi nhiều tác vụ chạy trên các luồng khác nhau như một đơn vị công việc duy nhất, từ đó đơn giản hóa xử lý lỗi, nâng cao độ tin cậy và khả năng quan sát. Nói cách khác, đồng thời có cấu trúc giữ nguyên khả năng đọc, bảo trì và quan sát của mã đơn luồng.

API cơ bản của đồng thời có cấu trúc là `StructuredTaskScope`, hỗ trợ phân chia tác vụ thành nhiều tác vụ con đồng thời, thực thi trong các luồng riêng; các tác vụ con phải hoàn thành trước khi tác vụ chính/cha tiếp tục, hoặc bị hủy khi tác vụ chính/cha thất bại.

Cách dùng cơ bản của `StructuredTaskScope`:

```java
    try (var scope = new StructuredTaskScope<Object>()) {
        // 使用fork方法派生线程来执行子任务
        Future<Integer> future1 = scope.fork(task1);
        Future<String> future2 = scope.fork(task2);
        // 等待线程完成
        scope.join();
        // 结果的处理可能包括处理或重新抛出异常
        ... process results/exceptions ...
    } // close
```

Đồng thời có cấu trúc rất phù hợp với virtual thread — các luồng nhẹ được JDK triển khai. Nhiều virtual thread dùng chung một luồng hệ điều hành, cho phép có rất nhiều virtual thread cùng tồn tại.

**Thay đổi mới trong Java 26**:

- **Cải tiến Joiner**: Interface `Joiner` bổ sung phương thức `onTimeout()`, cho phép trả về kết quả cụ thể khi hết thời gian chờ.
- **Tối ưu kiểu trả về**: `allSuccessfulOrThrow()` nay trả về trực tiếp danh sách kết quả (`List`) thay vì stream các tác vụ con như trước.
- **Đơn giản hóa API**: Đổi tên `anySuccessfulResultOrThrow()` thành `anySuccessfulOrThrow()` cho gọn hơn.

## JEP 530: Pattern matching hỗ trợ kiểu nguyên thủy (lần xem trước thứ tư)

Tính năng này được xem trước lần đầu bởi [JEP 455](https://openjdk.org/jeps/455 "JEP 455") (JDK 23).

Pattern matching có thể xử lý tất cả các kiểu dữ liệu nguyên thủy (`int`, `double`, `boolean`, v.v.) trong câu lệnh `switch` và `instanceof`:

```java
static void test(Object obj) {
    if (obj instanceof int i) {
        System.out.println("这是一个int类型: " + i);
    }
}
```

JDK 26 tiếp tục cải thiện tính năng này:

- Loại bỏ nhiều hạn chế liên quan đến kiểu nguyên thủy, làm cho pattern matching, `instanceof` và `switch` thống nhất hơn và biểu đạt tốt hơn.
- Tăng cường định nghĩa về tính chính xác vô điều kiện.
- Áp dụng kiểm tra tính dominance nghiêm ngặt hơn trong cấu trúc `switch`, giúp trình biên dịch nhận biết và giảm thiểu phạm vi lỗi lập trình rộng hơn.

Nhờ đó có thể thực hiện so khớp và chuyển đổi kiểu nguyên thủy một cách an toàn và ngắn gọn hơn — giống như xử lý kiểu đối tượng — tiếp tục loại bỏ mã boilerplate trong Java.

## JEP 524: Mã hóa PEM cho đối tượng mật mã (lần xem trước thứ hai)

Tính năng này được xem trước lần đầu bởi [JEP 518](https://openjdk.org/jeps/518) (JDK 25).

PEM (Privacy-Enhanced Mail) là một định dạng văn bản được sử dụng rộng rãi để lưu trữ và truyền tải các đối tượng mật mã như chứng chỉ, khóa riêng tư và khóa công khai. JEP 524 cung cấp một API mới để mã hóa đối tượng mật mã thành định dạng PEM và giải mã từ định dạng PEM về đối tượng mật mã.

```java
// 将密钥编码为 PEM 格式
KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
kpg.initialize(2048);
KeyPair keyPair = kpg.generateKeyPair();

// 编码为 PEM
String pemEncoded = PemEncoding.encode(keyPair.getPrivate());

// 从 PEM 解码
PrivateKey decodedKey = PemEncoding.decode(pemEncoded);
```

API này giảm nguy cơ lỗi, đơn giản hóa các yêu cầu tuân thủ, và nâng cao tính di động và khả năng tương tác của các ứng dụng Java bảo mật bằng cách đơn giản hóa cấu hình và tích hợp mật mã cho các yêu cầu doanh nghiệp, đám mây và quy định.

## JEP 529: Vector API (Vector API, lần incubate thứ mười một)

Tính toán vector bao gồm một chuỗi các phép toán trên vector. Vector API được dùng để biểu diễn các tính toán vector, có thể được biên dịch đáng tin cậy tại runtime thành các lệnh vector tối ưu trên kiến trúc CPU được hỗ trợ, đạt hiệu năng vượt trội so với tính toán scalar tương đương.

Mục tiêu của Vector API là cung cấp cho người dùng cách biểu diễn tính toán vector đơn giản, dễ dùng và độc lập với nền tảng cho nhiều loại tính toán vector.

Đây là tính toán scalar đơn giản trên các phần tử mảng:

```java
void scalarComputation(float[] a, float[] b, float[] c) {
   for (int i = 0; i < a.length; i++) {
        c[i] = (a[i] * a[i] + b[i] * b[i]) * -1.0f;
   }
}
```

Đây là tính toán vector tương đương sử dụng Vector API:

```java
static final VectorSpecies<Float> SPECIES = FloatVector.SPECIES_PREFERRED;

void vectorComputation(float[] a, float[] b, float[] c) {
    int i = 0;
    int upperBound = SPECIES.loopBound(a.length);
    for (; i < upperBound; i += SPECIES.length()) {
        // FloatVector va, vb, vc;
        var va = FloatVector.fromArray(SPECIES, a, i);
        var vb = FloatVector.fromArray(SPECIES, b, i);
        var vc = va.mul(va)
                   .add(vb.mul(vb))
                   .neg();
        vc.intoArray(c, i);
    }
    for (; i < a.length; i++) {
        c[i] = (a[i] * a[i] + b[i] * b[i]) * -1.0f;
    }
}
```

Mặc dù vẫn đang ở giai đoạn incubating, lần lặp thứ mười một đủ để chứng minh tầm quan trọng của nó. Nó cho phép Java viết mã có hiệu năng gần hoặc ngang bằng với các ngôn ngữ native như C++ trong các lĩnh vực nhạy cảm với hiệu năng như tính toán khoa học, machine learning, suy luận AI, xử lý big data.

## JEP 504: Loại bỏ Applet API

Applet API được đánh dấu deprecated trong JDK 9, được đánh dấu forRemoval trong JDK 17. Trong JDK 26, Applet API cuối cùng đã được **loại bỏ hoàn toàn**. Thật đáng mừng!

Điều này có nghĩa là:

- Lớp `java.applet.Applet` và các lớp liên quan đã bị xóa.
- Giảm dung lượng cài đặt và mã nguồn của JDK.
- Cải thiện hiệu năng, độ ổn định và bảo mật của ứng dụng.

Công nghệ Applet đã lỗi thời từ lâu, phát triển web hiện đại đã hoàn toàn chuyển sang các technology stack khác. Loại bỏ legacy API này là bước cần thiết trong quá trình hiện đại hóa nền tảng Java.

## Tổng kết

Mặc dù JDK 26 là phiên bản không phải LTS, nhưng nó chứa một số tính năng quan trọng đáng chú ý:

| Danh mục      | Tính năng                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| **Mạng**      | Hỗ trợ HTTP/3                                                                                         |
| **Hiệu năng** | Tối ưu hóa thông lượng G1 GC, bộ nhớ đệm AOT hỗ trợ bất kỳ GC                                         |
| **Ngôn ngữ**  | Pattern matching hỗ trợ kiểu nguyên thủy (lần xem trước thứ tư), hằng số lười (lần xem trước thứ hai) |
| **Đồng thời** | Đồng thời có cấu trúc (lần xem trước thứ sáu), Vector API (lần incubate thứ mười một)                 |
| **Bảo mật**   | Để final thực sự bất biến, hỗ trợ mã hóa PEM                                                          |
| **Dọn dẹp**   | Loại bỏ Applet API                                                                                    |

Oracle sẽ cung cấp bản cập nhật đến tháng 9 năm 2026, sau đó sẽ được thay thế bởi Oracle JDK 27.
