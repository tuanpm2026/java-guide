---
title: Tổng quan các tính năng mới trong Java 16
description: Giới thiệu các cập nhật ngôn ngữ và platform của JDK 16, bao gồm record class và các thay đổi JEP khác.
category: Java
tag:
  - Java tính năng mới
head:
  - - meta
    - name: keywords
      content: Java 16,JDK16,record class improvements,new API,JEP,performance
---

Java 16 phát hành chính thức ngày 16/3/2021 — phiên bản không hỗ trợ dài hạn (non-LTS).

JDK 16 có tổng cộng 17 tính năng mới. Bài này sẽ chọn giới thiệu chi tiết một số tính năng quan trọng hơn:

- [JEP 338: Vector API (Incubator)](https://openjdk.java.net/jeps/338)
- [JEP 376: ZGC: Concurrent Thread-Stack Processing](https://openjdk.java.net/jeps/376)
- [JEP 387: Elastic Metaspace](https://openjdk.java.net/jeps/387)
- [JEP 390: Warnings for Value-Based Classes](https://openjdk.java.net/jeps/390)
- [JEP 394: Pattern Matching for instanceof (Chính thức)](https://openjdk.java.net/jeps/394)
- [JEP 395: Records (Chính thức)](https://openjdk.java.net/jeps/395)
- [JEP 396: Strongly Encapsulate JDK Internals by Default](https://openjdk.java.net/jeps/396)
- [JEP 397: Sealed Classes (Second Preview)](https://openjdk.java.net/jeps/397)

Hình dưới là số lượng tính năng mới và thời gian cập nhật từng phiên bản từ JDK 8 đến JDK 25:

![Số lượng tính năng mới và thời gian cập nhật mỗi phiên bản từ JDK 8 đến JDK 25](/images/github/javaguide/java/new-features/jdk8~jdk24.png)

Đọc thêm: [OpenJDK Java 16 Documentation](https://openjdk.java.net/projects/jdk/16/).

## JEP 338: Vector API (Incubation lần 1)

Vector API ban đầu được đề xuất qua [JEP 338](https://openjdk.java.net/jeps/338), được tích hợp vào Java 16 như [incubation API](http://openjdk.java.net/jeps/11). Vòng incubation thứ hai qua [JEP 414](https://openjdk.java.net/jeps/414) được tích hợp vào Java 17, vòng ba qua [JEP 417](https://openjdk.java.net/jeps/417) được tích hợp vào Java 18, vòng bốn qua [JEP 426](https://openjdk.java.net/jeps/426) được tích hợp vào Java 19.

Incubator API này cung cấp initial iteration của API để biểu đạt một số vector computation. Các computation này có thể được compile đáng tin cậy tại runtime thành optimal vector hardware instruction trên CPU architecture được hỗ trợ — đạt hiệu năng vượt trội so với scalar computation tương đương, tận dụng đầy đủ kỹ thuật SIMD. Dù HotSpot hỗ trợ auto-vectorization, nhưng tập scalar operation có thể convert còn hạn chế và dễ bị ảnh hưởng bởi code changes. API này sẽ cho phép developer dễ dàng viết portable high-performance vector algorithm bằng Java.

Trong [Tổng quan tính năng mới Java 18](./java18.md), tôi đã giới thiệu chi tiết về Vector API nên không nhắc lại ở đây.

## JEP 347: Enable C++ 14 Language Features

Java 16 cho phép dùng C++ 14 language feature trong C++ source code của JDK, cung cấp hướng dẫn cụ thể về feature nào có thể dùng trong HotSpot code.

Trong Java 15, C++ language feature dùng trong JDK bị giới hạn ở C++98/03 language standard. Điều này yêu cầu cập nhật phiên bản compiler tối thiểu có thể chấp nhận cho các platform khác nhau.

## JEP 376: ZGC: Concurrent Thread-Stack Processing

Java 16 chuyển xử lý ZGC thread stack từ safepoint sang concurrent phase, cho phép GC safepoint pause trong millisecond ngay cả trên heap lớn. Loại bỏ nguồn delay cuối cùng trong ZGC garbage collector có thể cải thiện đáng kể hiệu năng và efficiency của ứng dụng.

## JEP 387: Elastic Metaspace

Kể từ khi giới thiệu Metaspace, dựa trên phản hồi, Metaspace thường chiếm quá nhiều off-heap memory dẫn đến lãng phí memory. Tính năng Elastic Metaspace có thể trả lại memory metadata JVM class chưa sử dụng (tức metaspace) cho OS nhanh hơn, giúp giảm footprint của metaspace.

Đề xuất này cũng đơn giản hóa code của metaspace để giảm chi phí maintenance.

## JEP 390: Warnings for Value-Based Classes

> Phần giới thiệu sau trích từ: [Thực tiễn | Phân tích tính năng cú pháp mới Java 16](https://xie.infoq.cn/article/8304c894c4e38318d38ceb116), bài gốc viết rất tốt, khuyến nghị đọc.

Từ Java 9, Java đã nâng cấp annotation `@Deprecated`, bổ sung 2 element mới là `since` và `forRemoval`. Trong đó `since` dùng để chỉ định phiên bản khi API được đánh dấu `@Deprecated` bị deprecated. `forRemoval` làm rõ thêm semantics khi API được đánh dấu `@Deprecated` — nếu `forRemoval=true`, nghĩa là API đó chắc chắn sẽ bị xóa trong phiên bản tương lai và developer nên dùng API mới để thay thế, không còn dễ gây nhầm lẫn (trước Java 9, API được đánh dấu `@Deprecated` có thể có nhiều ý nghĩa khác nhau như có rủi ro khi dùng, có thể có compatibility error trong tương lai, có thể bị xóa trong phiên bản tương lai, hoặc nên dùng giải pháp thay thế tốt hơn).

Quan sát kỹ các wrapper class của kiểu nguyên thủy (như `java.lang.Integer`, `java.lang.Double`), dễ thấy constructor của chúng đều đã được đánh dấu `@Deprecated(since="9", forRemoval = true)` — nghĩa là constructor của chúng sẽ bị xóa trong tương lai và không nên tiếp tục dùng code như `new Integer()` (khuyến nghị dùng `Integer a = 10;` hoặc `Integer.valueOf()`). Nếu tiếp tục dùng sẽ sinh warning lúc compile: `'Integer(int)' is deprecated and marked for removal`. Đáng chú ý là các wrapper type này đã được chỉ định là value type giống như `java.util.Optional` và `java.time.LocalDateTime`.

Thêm nữa, nếu tiếp tục dùng value type trong `synchronized` block sẽ sinh warning lúc compile và runtime, thậm chí throw exception. Cần lưu ý rằng dù không có warning và exception lúc compile và runtime, cũng không khuyến nghị dùng value type trong `synchronized` block. Lấy ví dụ về tự tăng:

```java
public void inc(Integer count) {
    for (int i = 0; i < 10; i++) {
        new Thread(() -> {
            synchronized (count) {
                count++;
            }
        }).start();
    }
}
```

Khi thực thi code trên, kết quả cuối cùng chắc chắn sẽ khác với kỳ vọng. Đây là lỗi phổ biến của nhiều người mới bắt đầu. Vì trong môi trường concurrent, `Integer` object hoàn toàn không thể đảm bảo thread safety thông qua `synchronized` — mỗi thao tác `count++` sinh ra hashcode khác nhau, tức là mỗi lần lock trên một object khác nhau. Do đó nếu muốn đảm bảo atomicity trong phát triển thực tế, nên dùng `AtomicInteger`.

## JEP 392: Packaging Tool (Chính thức)

Trong Java 14, JEP 343 giới thiệu packaging tool với lệnh `jpackage`. Trong Java 15 tiếp tục ở giai đoạn incubation. Giờ trong Java 16 cuối cùng đã trở thành official feature.

Packaging tool này cho phép đóng gói ứng dụng Java self-contained. Nó hỗ trợ native packaging format — cung cấp trải nghiệm cài đặt tự nhiên cho end user. Các format bao gồm: msi và exe trên Windows, pkg và dmg trên macOS, deb và rpm trên Linux. Cho phép chỉ định startup parameter lúc đóng gói, và có thể gọi trực tiếp từ command line hoặc theo cách lập trình qua ToolProvider API. Lưu ý tên module jpackage thay đổi từ `jdk.incubator.jpackage` thành `jdk.jpackage`. Điều này cải thiện trải nghiệm cài đặt ứng dụng của end user và đơn giản hóa deployment theo mô hình "app store".

## JEP 393: Foreign Memory Access API (Incubation lần 3)

Giới thiệu Foreign Memory Access API để cho phép Java program truy cập foreign memory bên ngoài Java heap một cách an toàn và hiệu quả.

Java 14 ([JEP 370](https://openjdk.org/jeps/370)) là lần incubation đầu tiên. Java 15 là lần incubation thứ hai ([JEP 383](https://openjdk.org/jeps/383)). Java 16 là lần incubation thứ ba.

Mục đích giới thiệu Foreign Memory Access API:

- **General**: Một API duy nhất có thể thao tác nhiều loại foreign memory (như native memory, persistent memory, heap memory, v.v.).
- **Safe**: Bất kể thao tác với loại memory nào, API cũng không được phá vỡ tính an toàn của JVM.
- **Control**: Tự do chọn cách giải phóng memory (explicit, implicit, v.v.).
- **Usable**: Nếu cần truy cập foreign memory, API nên là `sun.misc.Unsafe`.

## JEP 394: Pattern Matching for instanceof (Chính thức)

| Phiên bản JDK | Loại cập nhật     | JEP                                     | Nội dung cập nhật                                                  |
| ------------- | ----------------- | --------------------------------------- | ------------------------------------------------------------------ |
| Java SE 14    | Preview           | [JEP 305](https://openjdk.org/jeps/305) | Lần đầu giới thiệu instanceof pattern matching.                    |
| Java SE 15    | Second Preview    | [JEP 375](https://openjdk.org/jeps/375) | Không thay đổi so với phiên bản trước, tiếp tục thu thập phản hồi. |
| Java SE 16    | Permanent Release | [JEP 394](https://openjdk.org/jeps/394) | Pattern variable không còn ngầm là final.                          |

Từ Java 16, có thể modify giá trị của variable trong `instanceof`.

```java
// Code cũ
if (o instanceof String) {
    String s = (String)o;
    ... use s ...
}

// Code mới
if (o instanceof String s) {
    ... use s ...
}
```

## JEP 395: Records (Chính thức)

Lịch sử thay đổi record type:

| Phiên bản JDK | Loại cập nhật     | JEP                                          | Nội dung cập nhật                                                                                |
| ------------- | ----------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Java SE 14    | Preview           | [JEP 359](https://openjdk.java.net/jeps/359) | Giới thiệu keyword `record`, cung cấp cú pháp ngắn gọn để định nghĩa immutable data trong class. |
| Java SE 15    | Second Preview    | [JEP 384](https://openjdk.org/jeps/384)      | Hỗ trợ dùng `record` trong local method và interface.                                            |
| Java SE 16    | Permanent Release | [JEP 395](https://openjdk.org/jeps/395)      | Non-static inner class có thể định nghĩa non-constant static member.                             |

Từ Java SE 16, non-static inner class có thể định nghĩa non-constant static member.

```java
public class Outer {
  class Inner {
    static int age;
  }
}
```

> Trước JDK 16, nếu viết code như trên, IDE sẽ nhắc: static field `age` không thể khai báo trong non-static inner type, trừ khi được khởi tạo bằng constant expression.

## JEP 396: Strongly Encapsulate JDK Internals by Default

Tính năng này mặc định strongly encapsulate tất cả internal element của JDK, ngoại trừ các internal API quan trọng (như `sun.misc.Unsafe`). Theo mặc định, code truy cập JDK internal API được compile thành công với phiên bản trước có thể không hoạt động nữa. Khuyến khích developer migrate từ dùng internal element sang dùng standard API để cả họ lẫn user có thể nâng cấp lên phiên bản Java tương lai một cách seamless. Strong encapsulation được kiểm soát bởi launcher option `--illegal-access` của JDK 9, đến JDK 15 mặc định là warning, từ JDK 16 mặc định là deny. Hiện vẫn có thể dùng single command line option để relaxe encapsulation cho tất cả package. Trong tương lai chỉ có dùng `--add-opens` mới mở được package cụ thể.

## JEP 397: Sealed Classes (Preview lần 2)

Sealed class được đề xuất preview qua [JEP 360](https://openjdk.java.net/jeps/360), được tích hợp vào Java 15. Trong JDK 16, sealed class được cải tiến (kiểm tra reference nghiêm ngặt hơn và quan hệ kế thừa của sealed class), và được đề xuất preview lần nữa qua [JEP 397](https://openjdk.java.net/jeps/397).

Trong [Tổng quan tính năng mới Java 14 & 15](./java14-15.md), tôi đã giới thiệu chi tiết về sealed class nên không nhắc lại ở đây.

## Các cải tiến và cải thiện khác

- **JEP 380: Unix-Domain Socket Channel**: Unix-domain socket là tính năng của hầu hết Unix platform, nay cũng được hỗ trợ trên Windows 10 và Windows Server 2019. Tính năng này bổ sung Unix-domain (AF_UNIX) socket support cho socket channel và server socket channel API trong package `java.nio.channels`. Nó mở rộng inherited channel mechanism để hỗ trợ Unix-domain socket channel và server socket channel. Unix-domain socket dùng cho IPC (inter-process communication) trên cùng host. Về nhiều mặt giống TCP/IP, khác ở chỗ socket được đánh địa chỉ qua file system pathname thay vì IP address và port number. Với local IPC, Unix-domain socket an toàn và hiệu quả hơn TCP/IP loopback connection.
- **JEP 389: Foreign Linker API (Incubation)**: Incubator API này cung cấp tính năng statically typed, pure-Java access to native code — sẽ đơn giản hóa đáng kể quá trình binding native library vốn phức tạp và dễ lỗi. Java 1.1 đã hỗ trợ native method call qua JNI nhưng không dễ dùng. Java developer nên có thể bind native library cụ thể cho task cụ thể. Nó cũng cung cấp foreign function support mà không cần JNI glue code.
- **JEP 357: Migrate from Mercurial to Git**: Trước đây OpenJDK source code được quản lý bằng VCS Mercurial, nay đã migrate sang Git.
- **JEP 369: Migrate to GitHub**: Nhất quán với thay đổi migrate từ Mercurial sang Git trong JEP 357, sau khi migrate VCS sang Git, chọn lưu trữ Git repository của cộng đồng OpenJDK trên GitHub. Tuy nhiên chỉ migrate JDK 11 trở lên.
- **JEP 386: Alpine Linux Port**: Alpine Linux là bản phân phối Linux độc lập, phi thương mại, rất nhỏ gọn (container dưới 8MB, cài đặt tối thiểu ra disk khoảng 130MB) và đơn giản, đồng thời đảm bảo bảo mật. Đề xuất này port JDK sang Alpine Linux. Vì Alpine Linux là lightweight Linux distribution dựa trên musl lib, các Linux distribution khác dùng musl lib trên x64 và AArch64 cũng phù hợp.
- **JEP 388: Windows/AArch64 Port**: Trọng tâm của các JEP này không phải bản thân công việc port mà là tích hợp chúng vào JDK mainline repository. JEP 386 port JDK sang Alpine Linux và các distribution dùng musl làm C library chính trên x64. Ngoài ra JEP 388 port JDK sang Windows AArch64 (ARM64).

## Tài liệu tham khảo

- [Java Language Changes](https://docs.oracle.com/en/java/javase/16/language/java-language-changes.html)
- [Consolidated JDK 16 Release Notes](https://www.oracle.com/java/technologies/javase/16all-relnotes.html)
- [Java 16 phát hành chính thức, phân tích từng tính năng mới](https://www.infoq.cn/article/IAkwhx7i9V7G8zLVEd4L)
- [Thực tiễn | Phân tích tính năng cú pháp mới Java 16](https://xie.infoq.cn/article/8304c894c4e38318d38ceb116) (rất hay)

<!-- @include: @article-footer.snippet.md -->
