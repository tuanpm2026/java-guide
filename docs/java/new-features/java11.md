---
title: Tổng quan các tính năng mới trong Java 11 (Quan trọng)
description: Tổng kết các cập nhật của JDK 11, tập trung vào HTTP client mới và các tính năng thực dụng khác như cải tiến String.
category: Java
tag:
  - Java tính năng mới
head:
  - - meta
    - name: keywords
      content: Java 11,JDK11,LTS,HTTP client,String API,removed features
---

Java 11 phát hành chính thức ngày 25/9/2018 — đây là phiên bản rất quan trọng! Java 11 là phiên bản Long-Term-Support (LTS) đầu tiên sau Java 8. Oracle tuyên bố sẽ hỗ trợ mạnh mẽ Java 11, hỗ trợ này sẽ kéo dài đến tháng 9/2026.

Hình dưới là timeline hỗ trợ Oracle JDK chính thức từ Oracle.

![Timeline hỗ trợ Oracle JDK chính thức từ Oracle](/images/github/javaguide/java/new-features/4c1611fad59449edbbd6e233690e9fa7.png)

Hình dưới là số lượng tính năng mới và thời gian cập nhật từng phiên bản từ JDK 8 đến JDK 25:

![Số lượng tính năng mới và thời gian cập nhật mỗi phiên bản từ JDK 8 đến JDK 25](/images/github/javaguide/java/new-features/jdk8~jdk24.png)

Bài này sẽ chọn giới thiệu chi tiết một số tính năng quan trọng hơn:

- [JEP 321: HTTP Client (Standard)](https://openjdk.org/jeps/321)
- [JEP 323: Local-Variable Syntax for Lambda Parameters](https://openjdk.org/jeps/323)
- [JEP 330: Launch Single-File Source-Code Programs](https://openjdk.org/jeps/330)
- [JEP 333: ZGC: A Scalable Low-Latency Garbage Collector (Experimental)](https://openjdk.org/jeps/333)

## JEP 321: HTTP Client (Phiên bản chuẩn)

Java 11 chuẩn hóa HTTP Client API được giới thiệu trong Java 9 và cập nhật trong Java 10. Trong khi ở giai đoạn incubation ở hai phiên bản trước, HTTP Client gần như được viết lại hoàn toàn, và hiện đã hỗ trợ đầy đủ async non-blocking.

Hơn nữa, trong Java 11, tên package của HTTP Client thay đổi từ `jdk.incubator.http` thành `java.net.http`. API này cung cấp non-blocking request và response semantics thông qua `CompletableFuture`. Cách dùng cũng rất đơn giản:

```java
var request = HttpRequest.newBuilder()
    .uri(URI.create("https://javastack.cn"))
    .GET()
    .build();
var client = HttpClient.newHttpClient();

// Đồng bộ
HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());

// Bất đồng bộ
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
    .thenApply(HttpResponse::body)
    .thenAccept(System.out::println);
```

## JEP 333: ZGC (Garbage collector độ trễ thấp có khả năng mở rộng — Thực nghiệm)

**ZGC tức là Z Garbage Collector** — garbage collector có khả năng mở rộng, độ trễ thấp.

ZGC được thiết kế chủ yếu để đáp ứng các mục tiêu sau:

- GC pause time không vượt quá 10ms
- Xử lý được cả heap nhỏ vài trăm MB lẫn heap lớn vài TB
- Throughput ứng dụng không giảm quá 15% (so với G1 collection algorithm)
- Đặt nền tảng để dễ dàng đưa vào GC feature mới và tận dụng colored pointer và Load barrier để tối ưu
- Hiện chỉ hỗ trợ nền tảng Linux/x64

ZGC hiện **đang ở giai đoạn thực nghiệm**, chỉ hỗ trợ nền tảng Linux/x64. Lưu ý: ZGC trở thành official feature trong Java 15, Java 21 giới thiệu Generational ZGC.

Tương tự ParNew trong CMS và G1, ZGC cũng dùng mark-copy algorithm, nhưng ZGC đã cải tiến đáng kể thuật toán này.

ZGC xuất hiện Stop The World ít hơn nhiều!

Chi tiết xem: [《Khám phá và thực chiến ZGC — Garbage Collector thế hệ mới》](https://tech.meituan.com/2020/08/06/new-zgc-practice-in-meituan.html)

## JEP 323: Local-Variable Syntax for Lambda Parameters

Từ Java 10, local variable type inference đã được giới thiệu như một key feature. Type inference cho phép dùng keyword `var` làm kiểu của biến cục bộ thay vì kiểu thực tế — compiler suy luận kiểu dựa trên giá trị gán cho biến.

Trong Java 10, keyword `var` có một số hạn chế:

- Chỉ dùng cho local variable
- Khi khai báo phải khởi tạo
- Không dùng làm method parameter được
- Không dùng trong Lambda expression được

Java 11 cho phép developer dùng `var` để khai báo tham số trong Lambda expression.

```java
// Hai cách dưới đây tương đương
Consumer<String> consumer = (var i) -> System.out.println(i);
Consumer<String> consumer = (String i) -> System.out.println(i);
```

## JEP 330: Launch Single-File Source-Code Programs

Điều này có nghĩa là chúng ta có thể chạy Java source code của single file. Tính năng này cho phép dùng Java interpreter để thực thi trực tiếp Java source code. Source code được compile trong memory, sau đó được interpreter thực thi — không cần tạo file `.class` trên disk. Hạn chế duy nhất là tất cả class liên quan phải được định nghĩa trong cùng một Java file.

Đặc biệt hữu ích cho người mới học Java muốn thử các chương trình đơn giản. Kết hợp với jshell, đến mức độ nhất định tăng cường khả năng dùng Java để viết script.

## Cải tiến API

Không phải tất cả thay đổi API đều được phát hành qua JEP (Java Enhancement Proposal).

Trong development flow của JDK: **JEP** thường dùng cho các thay đổi lớn như giới thiệu language feature mới (như `var`), JVM mechanism mới (như ZGC), hay tái cấu trúc library quy mô lớn. Các thao tác như thêm vài method vào class hiện có (như `String.isBlank()`) thường được coi là library maintenance thông thường — được submit và review trực tiếp qua ticket của **JBS (JDK Bug System)**, sau đó phát hành trực tiếp theo version.

### Cải tiến String

Java 11 bổ sung một loạt method xử lý string:

```java
// Kiểm tra string có blank không
" ".isBlank(); // true
// Xóa khoảng trắng đầu và cuối string
" Java ".strip(); // "Java"
// Xóa khoảng trắng đầu string
" Java ".stripLeading();   // "Java "
// Xóa khoảng trắng cuối string
" Java ".stripTrailing();  // "Java"
// Lặp string bao nhiêu lần
"Java".repeat(3);             // "JavaJavaJava"
// Trả về collection của string được phân tách bằng line terminator
"A\nB\nC".lines().count();    // 3
"A\nB\nC".lines().collect(Collectors.toList());
```

### Cải tiến Optional

Bổ sung method `isEmpty()` để kiểm tra xem `Optional` chỉ định có rỗng không.

```java
var op = Optional.empty();
System.out.println(op.isEmpty()); // Kiểm tra Optional chỉ định có rỗng không
```

## Các tính năng mới khác

- **Garbage collector mới Epsilon**: GC hoàn toàn passive, cấp phát tài nguyên memory hữu hạn, giảm tối đa memory footprint và memory throughput latency.
- **Low-overhead Heap Profiling**: Java 11 cung cấp phương pháp sampling phân bổ Java heap overhead thấp, có thể lấy thông tin về Java object được phân bổ trên heap, và có thể truy cập heap info qua JVMTI.
- **TLS 1.3 Protocol**: Java 11 bao gồm triển khai TLS 1.3 specification (RFC 8446), thay thế TLS trong các phiên bản trước kể cả TLS 1.2. Cũng cải thiện các tính năng TLS khác như OCSP stapling extension (RFC 6066, RFC 6961) và session hash, extended master secret extension (RFC 7627). Cũng có nhiều cải tiến về bảo mật và hiệu năng.
- **Java Flight Recorder**: Trước đây là công cụ phân tích trong commercial JDK, nhưng trong Java 11 code của nó được đưa vào public codebase — tất cả mọi người đều có thể dùng tính năng này.
- ……

## Tài liệu tham khảo

- JDK 11 Release Notes: <https://www.oracle.com/java/technologies/javase/11-relnote-issues.html>
- Java 11 – Features and Comparison: <https://www.geeksforgeeks.org/java-11-features-and-comparison/>

<!-- @include: @article-footer.snippet.md -->
