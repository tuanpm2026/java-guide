---
title: Tổng quan các tính năng mới trong Java 18
description: Tổng quan các cập nhật và preview feature của JDK 18, hiểu các cải tiến do API mới mang lại.
category: Java
tag:
  - Java tính năng mới
head:
  - - meta
    - name: keywords
      content: Java 18,JDK18,preview feature,API update,JEP
---

Java 18 phát hành chính thức ngày 22/3/2022 — phiên bản không hỗ trợ dài hạn.

JDK 18 có tổng cộng 8 tính năng mới. Bài này sẽ chọn giới thiệu chi tiết một số tính năng quan trọng hơn:

- [JEP 400: UTF-8 by Default](https://openjdk.java.net/jeps/400)
- [JEP 408: Simple Web Server](https://openjdk.java.net/jeps/408)
- [JEP 413: Code Snippets in Java API Documentation](https://openjdk.java.net/jeps/413)
- [JEP 416: Reimplement Core Reflection with Method Handles](https://openjdk.java.net/jeps/416)
- [JEP 417: Vector API (Third Incubator)](https://openjdk.java.net/jeps/417)
- [JEP 418: Internet-Address Resolution SPI](https://openjdk.java.net/jeps/418)
- [JEP 419: Foreign Function & Memory API (Second Incubator)](https://openjdk.java.net/jeps/419)

Hình dưới là số lượng tính năng mới và thời gian cập nhật từng phiên bản từ JDK 8 đến JDK 25:

![Số lượng tính năng mới và thời gian cập nhật mỗi phiên bản từ JDK 8 đến JDK 25](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

Đọc thêm:

- [OpenJDK Java 18 Documentation](https://openjdk.java.net/projects/jdk/18/)
- [IntelliJ IDEA | Hỗ trợ tính năng Java 18](https://mp.weixin.qq.com/s/PocFKR9z9u7-YCZHsrA5kQ)

## JEP 400: UTF-8 by Default (Chính thức)

JDK cuối cùng đã đặt UTF-8 làm charset mặc định.

Trong Java 17 và các phiên bản trước, charset mặc định được xác định lúc JVM chạy, phụ thuộc vào OS, locale settings, v.v. — nên có rủi ro tiềm ẩn. Ví dụ một chương trình Java in text ra console chạy bình thường trên Mac nhưng bị garbled characters khi sang Windows nếu không thay đổi charset thủ công.

## JEP 408: Simple Web Server (Chính thức)

Từ Java 18, có thể dùng lệnh `jwebserver` để khởi động một static web server đơn giản.

```bash
$ jwebserver
Binding to loopback by default. For all interfaces use "-b 0.0.0.0" or "-b ::".
Serving /cwd and subdirectories on 127.0.0.1 port 8000
URL: http://127.0.0.1:8000/
```

Server này không hỗ trợ CGI và Servlet, chỉ giới hạn ở static file.

## JEP 413: Code Snippets in Java API Documentation (Chính thức)

Trước Java 18, nếu muốn đưa code snippet vào Javadoc có thể dùng `<pre>{@code ...}</pre>`.

```java
<pre>{@code
    lines of source code
}</pre>
```

Cách `<pre>{@code ...}</pre>` tạo ra hiệu quả tương đối thường.

Từ Java 18, có thể dùng tag `@snippet` để làm điều này.

```java
/**
 * The following code shows how to use {@code Optional.isPresent}:
 * {@snippet :
 * if (v.isPresent()) {
 *     System.out.println("v: " + v.get());
 * }
 * }
 */
```

Cách `@snippet` tạo ra hiệu quả tốt hơn và dùng tiện hơn.

## JEP 416: Reimplement Core Reflection with Method Handles (Chính thức)

Java 18 cải tiến logic triển khai của `java.lang.reflect.Method`, `Constructor` — hiệu năng tốt hơn, tốc độ nhanh hơn. Thay đổi này không thay đổi API liên quan, nghĩa là không cần sửa code reflection trong phát triển mà vẫn trải nghiệm được reflection hiệu năng tốt hơn.

OpenJDK chính thức cung cấp kết quả benchmark hiệu năng reflection của triển khai mới và cũ.

![Kết quả benchmark hiệu năng reflection của triển khai mới và cũ](https://oss.javaguide.cn/github/javaguide/java/new-features/JEP416Benchmark.png)

## JEP 417: Vector API (Incubation lần 3)

Vector API ban đầu được đề xuất qua [JEP 338](https://openjdk.java.net/jeps/338), được tích hợp vào Java 16 như [incubation API](http://openjdk.java.net/jeps/11). Vòng incubation thứ hai qua [JEP 414](https://openjdk.java.net/jeps/414) được tích hợp vào Java 17, vòng ba qua [JEP 417](https://openjdk.java.net/jeps/417) được tích hợp vào Java 18, vòng bốn qua [JEP 426](https://openjdk.java.net/jeps/426) được tích hợp vào Java 19.

Vector computation bao gồm một loạt thao tác trên vector. Vector API dùng để biểu đạt vector computation — computation này có thể được compile đáng tin cậy tại runtime thành optimal vector instruction trên CPU architecture được hỗ trợ, từ đó đạt hiệu năng vượt trội so với scalar computation tương đương.

Mục tiêu của Vector API là cung cấp cho user biểu đạt đơn giản, dễ dùng và platform-agnostic cho nhiều loại vector computation.

Đây là scalar computation đơn giản trên array element:

```java
void scalarComputation(float[] a, float[] b, float[] c) {
   for (int i = 0; i < a.length; i++) {
        c[i] = (a[i] * a[i] + b[i] * b[i]) * -1.0f;
   }
}
```

Đây là vector computation tương đương dùng Vector API:

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

Trong JDK 18, hiệu năng của Vector API được tối ưu thêm.

## JEP 418: Internet-Address Resolution SPI (Chính thức)

Java 18 định nghĩa một SPI (service-provider interface) hoàn toàn mới cho việc phân giải tên và địa chỉ chính, để `java.net.InetAddress` có thể dùng third-party resolver bên ngoài platform.

## JEP 419: Foreign Function & Memory API (Incubation lần 2)

Java program có thể tương tác với code và data bên ngoài Java runtime thông qua API này. Bằng cách gọi hiệu quả foreign function (code bên ngoài JVM) và truy cập an toàn foreign memory (memory không do JVM quản lý), API này cho phép Java program gọi native library và xử lý native data mà không nguy hiểm và dễ vỡ như JNI.

Foreign Function & Memory API trải qua vòng incubation đầu tiên trong Java 17 qua [JEP 412](https://openjdk.java.net/jeps/412). Vòng incubation thứ hai qua [JEP 419](https://openjdk.org/jeps/419) được tích hợp vào Java 18, preview qua [JEP 424](https://openjdk.org/jeps/424) được tích hợp vào Java 19.

Trong [Tổng quan tính năng mới Java 19](./java19.md), tôi đã giới thiệu chi tiết về Foreign Function & Memory API nên không nhắc lại ở đây.

<!-- @include: @article-footer.snippet.md -->
