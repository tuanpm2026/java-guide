---
title: Tổng quan tính năng mới Java 24
description: Tóm tắt các tính năng mới và thay đổi trong JDK 24, giúp theo dõi sự phát triển của Java.
category: Java
tag:
  - Java Tính năng mới
head:
  - - meta
    - name: keywords
      content: Java 24,JDK24,JEP 更新,语言特性,GC 改进,平台增强
---

JDK 24 được phát hành vào tháng 3 năm 2025, đây là phiên bản không phải LTS (Long-Term Support). Phiên bản hỗ trợ dài hạn tiếp theo là **JDK 25**, dự kiến phát hành vào tháng 9 năm 2025.

JDK 24 có tổng cộng 24 tính năng mới. Bài viết này sẽ chọn lọc và giới thiệu chi tiết một số tính năng quan trọng:

- [JEP 478: Key Derivation Function API (API Hàm Dẫn Xuất Khóa)](https://openjdk.org/jeps/478)
- [JEP 483: Early Class-File Loading & Linking (Tải và liên kết tệp lớp sớm)](https://openjdk.org/jeps/483)
- [JEP 484: Class File API (API Tệp Lớp)](https://openjdk.org/jeps/484)
- [JEP 485: Stream Gatherers (Bộ thu thập luồng)](https://openjdk.org/jeps/485)
- [JEP 486: Disable the Security Manager (Vô hiệu hóa vĩnh viễn Security Manager)](https://openjdk.org/jeps/486)
- [JEP 487: Scoped Values (Giá trị có phạm vi, lần xem trước thứ tư)](https://openjdk.org/jeps/487)
- [JEP 495: Simplified Source Files and Instance Main Methods (Tệp nguồn đơn giản hóa và phương thức main dạng instance, lần xem trước thứ tư)](https://openjdk.org/jeps/495)
- [JEP 497: Quantum-Resistant Digital Signature Algorithm (ML-DSA) (Thuật toán chữ ký số kháng lượng tử)](https://openjdk.org/jeps/497)
- [JEP 499: Structured Concurrency (Đồng thời có cấu trúc, lần xem trước thứ tư)](https://openjdk.org/jeps/499)

Biểu đồ dưới đây thể hiện số lượng tính năng mới và thời gian phát hành từ JDK 8 đến JDK 25:

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 478: Key Derivation Function API (API Hàm Dẫn Xuất Khóa)

API Hàm Dẫn Xuất Khóa là một thuật toán mật mã dùng để dẫn xuất các khóa bổ sung từ khóa ban đầu và các dữ liệu khác. Vai trò cốt lõi của nó là tạo ra nhiều khóa khác nhau cho các mục đích mã hóa khác nhau (như mã hóa, xác thực, v.v.), tránh rủi ro bảo mật do tái sử dụng khóa. Đây là một cột mốc quan trọng trong mật mã học thế hệ mới, đặt nền tảng cho môi trường điện toán lượng tử đang nổi lên.

Thông qua API này, các nhà phát triển có thể sử dụng các thuật toán dẫn xuất khóa mới nhất (như HKDF và Argon2 trong tương lai):

```java
// 创建一个 KDF 对象，使用 HKDF-SHA256 算法
KDF hkdf = KDF.getInstance("HKDF-SHA256");

// 创建 Extract 和 Expand 参数规范
AlgorithmParameterSpec params =
    HKDFParameterSpec.ofExtract()
                     .addIKM(initialKeyMaterial) // 设置初始密钥材料
                     .addSalt(salt)             // 设置盐值
                     .thenExpand(info, 32);     // 设置扩展信息和目标长度

// 派生一个 32 字节的 AES 密钥
SecretKey key = hkdf.deriveKey("AES", params);

// 可以使用相同的 KDF 对象进行其他密钥派生操作
```

## JEP 483: Early Class-File Loading & Linking (Tải và liên kết tệp lớp sớm)

Trong JVM truyền thống, ứng dụng cần tải động và liên kết các lớp mỗi lần khởi động. Cơ chế này gây ra tắc nghẽn hiệu năng đáng kể cho các ứng dụng nhạy cảm với thời gian khởi động (như microservice hay serverless function). Tính năng này giảm đáng kể chi phí công việc lặp lại bằng cách lưu vào bộ nhớ đệm các lớp đã được tải và liên kết, từ đó giảm đáng kể thời gian khởi động ứng dụng Java. Thử nghiệm cho thấy với các ứng dụng lớn (như ứng dụng server dựa trên Spring), thời gian khởi động có thể giảm hơn 40%.

Tối ưu hóa này không xâm lấn — không cần thay đổi bất kỳ mã nào trong ứng dụng, thư viện hay framework, cách khởi động cũng giữ nguyên, chỉ cần thêm các tham số JVM liên quan (như `-XX:+ClassDataSharing`).

## JEP 484: Class File API (API Tệp Lớp)

API Tệp Lớp được xem trước lần đầu trong JDK 22 ([JEP 457](https://openjdk.org/jeps/457)), xem trước lần thứ hai và tiếp tục hoàn thiện trong JDK 23 ([JEP 466](https://openjdk.org/jeps/466)). Cuối cùng, tính năng này chính thức được công nhận trong JDK 24.

Mục tiêu của API Tệp Lớp là cung cấp một bộ API tiêu chuẩn hóa để phân tích, tạo và chuyển đổi các tệp lớp Java, thay thế sự phụ thuộc vào các thư viện bên thứ ba (như ASM) trong việc xử lý tệp lớp.

```java
// 创建一个 ClassFile 对象，这是操作类文件的入口。
ClassFile cf = ClassFile.of();
// 解析字节数组为 ClassModel
ClassModel classModel = cf.parse(bytes);

// 构建新的类文件，移除以 "debug" 开头的所有方法
byte[] newBytes = cf.build(classModel.thisClass().asSymbol(),
        classBuilder -> {
            // 遍历所有类元素
            for (ClassElement ce : classModel) {
                // 判断是否为方法 且 方法名以 "debug" 开头
                if (!(ce instanceof MethodModel mm
                        && mm.methodName().stringValue().startsWith("debug"))) {
                    // 添加到新的类文件中
                    classBuilder.with(ce);
                }
            }
        });
```

## JEP 485: Stream Gatherers (Bộ thu thập luồng)

Bộ thu thập luồng `Stream::gather(Gatherer)` là một tính năng mới mạnh mẽ, cho phép nhà phát triển định nghĩa các phép toán trung gian tùy chỉnh để thực hiện các phép chuyển đổi dữ liệu phức tạp và linh hoạt hơn. Interface `Gatherer` là trung tâm của tính năng này, định nghĩa cách thu thập các phần tử từ luồng, duy trì trạng thái trung gian và tạo ra kết quả trong quá trình xử lý.

Khác với các phép toán tích hợp sẵn như `filter`, `map` hay `distinct`, `Stream::gather` cho phép nhà phát triển thực hiện những tác vụ khó hoàn thành với các phép toán Stream tiêu chuẩn. Ví dụ, có thể dùng `Stream::gather` để thực hiện cửa sổ trượt, loại trùng theo quy tắc tùy chỉnh, hoặc các phép chuyển đổi trạng thái và tổng hợp phức tạp hơn. Sự linh hoạt này mở rộng đáng kể phạm vi ứng dụng của Stream API, giúp nhà phát triển đối phó với các tình huống xử lý dữ liệu phức tạp hơn.

Logic loại trùng theo độ dài chuỗi được triển khai dựa trên `Stream::gather(Gatherer)`:

```java
var result = Stream.of("foo", "bar", "baz", "quux")
                   .gather(Gatherer.ofSequential(
                       HashSet::new, // 初始化状态为 HashSet,用于保存已经遇到过的字符串长度
                       (set, str, downstream) -> {
                           if (set.add(str.length())) {
                               return downstream.push(str);
                           }
                           return true; // 继续处理流
                       }
                   ))
                   .toList();// 转换为列表

// 输出结果 ==> [foo, quux]
```

## JEP 486: Disable the Security Manager (Vô hiệu hóa vĩnh viễn Security Manager)

JDK 24 không còn cho phép bật `Security Manager`, kể cả khi dùng lệnh `java -Djava.security.manager` cũng không thể kích hoạt được nữa — đây là bước then chốt trong quá trình loại bỏ hoàn toàn tính năng này. Mặc dù `Security Manager` từng là công cụ quan trọng trong Java để hạn chế quyền của mã (như truy cập hệ thống tệp hay mạng, đọc/ghi tệp nhạy cảm, thực thi lệnh hệ thống), nhưng do độ phức tạp cao, tỷ lệ sử dụng thấp và chi phí bảo trì lớn, cộng đồng Java quyết định loại bỏ hoàn toàn nó.

## JEP 487: Scoped Values (Giá trị có phạm vi, lần xem trước thứ tư)

Giá trị có phạm vi (Scoped Values) có thể chia sẻ dữ liệu bất biến trong cùng một luồng và giữa các luồng, ưu việt hơn biến cục bộ luồng (thread-local variable), đặc biệt khi sử dụng số lượng lớn virtual thread.

```java
final static ScopedValue<...> V = new ScopedValue<>();

// In some method
ScopedValue.where(V, <value>)
           .run(() -> { ... V.get() ... call methods ... });

// In a method called directly or indirectly from the lambda expression
... V.get() ...
```

Giá trị có phạm vi cho phép chia sẻ dữ liệu an toàn và hiệu quả giữa các thành phần trong chương trình lớn mà không cần dùng đến tham số phương thức.

## JEP 491: Virtual Threads Synchronization Without Pinning (Đồng bộ hóa virtual thread không cần ghim vào platform thread)

Tối ưu hóa cơ chế hoạt động của virtual thread với `synchronized`. Khi virtual thread bị block trong các phương thức hay khối `synchronized`, thông thường chúng có thể giải phóng luồng hệ điều hành (platform thread) mà chúng đang chiếm, tránh tình trạng chiếm giữ platform thread trong thời gian dài, từ đó nâng cao khả năng đồng thời của ứng dụng. Cơ chế này tránh được "Pinning" — tình trạng virtual thread chiếm giữ platform thread trong thời gian dài, ngăn platform thread phục vụ các virtual thread khác.

Mã Java hiện có sử dụng `synchronized` không cần sửa đổi để hưởng lợi từ khả năng mở rộng của virtual thread. Ví dụ, một ứng dụng I/O-intensive sử dụng platform thread truyền thống có thể bị giảm khả năng đồng thời do luồng bị block. Còn với virtual thread, dù bị block trong khối `synchronized`, platform thread cũng không bị ghim, cho phép nó tiếp tục phục vụ các virtual thread khác, nâng cao hiệu năng đồng thời tổng thể.

## JEP 493: Linking Run-Time Images Without JMOD Files (Liên kết ảnh runtime mà không cần tệp JMOD)

Mặc định, JDK bao gồm cả ảnh runtime (các module cần thiết khi chạy) và tệp JMOD. Tính năng này cho phép công cụ jlink tạo ảnh runtime tùy chỉnh mà không cần dùng tệp JMOD của JDK, giảm dung lượng cài đặt JDK (khoảng 25%).

Giải thích:

- Jlink là công cụ dòng lệnh mới được phát hành cùng Java 9. Nó cho phép nhà phát triển tạo JRE nhẹ, tùy chỉnh cho ứng dụng Java dựa trên module.
- Tệp JMOD là tệp mô tả module Java, chứa metadata và tài nguyên của module.

## JEP 495: Simplified Source Files and Instance Main Methods (Tệp nguồn đơn giản hóa và phương thức main dạng instance, lần xem trước thứ tư)

Tính năng này chủ yếu đơn giản hóa khai báo phương thức `main`. Đối với người mới học Java, khai báo phương thức `main` này giới thiệu quá nhiều khái niệm cú pháp Java, không có lợi cho người mới nhanh chóng bắt đầu.

Định nghĩa phương thức `main` trước khi sử dụng tính năng này:

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Định nghĩa phương thức `main` sau khi sử dụng tính năng mới:

```java
class HelloWorld {
    void main() {
        System.out.println("Hello, World!");
    }
}
```

Đơn giản hóa hơn nữa (lớp không có tên cho phép chúng ta bỏ qua tên lớp):

```java
void main() {
   System.out.println("Hello, World!");
}
```

## JEP 497: Quantum-Resistant Digital Signature Algorithm (ML-DSA) (Thuật toán chữ ký số kháng lượng tử)

JDK 24 giới thiệu hỗ trợ triển khai thuật toán chữ ký số dựa trên mạng tinh thể module kháng lượng tử (Module-Lattice-Based Digital Signature Algorithm, **ML-DSA**), chuẩn bị cho việc chống lại các mối đe dọa tiềm ẩn từ máy tính lượng tử trong tương lai.

ML-DSA là thuật toán kháng lượng tử được Viện Tiêu chuẩn và Công nghệ Quốc gia Hoa Kỳ (NIST) chuẩn hóa trong FIPS 204, dùng cho chữ ký số và xác thực danh tính.

## JEP 498: Warnings When Using `sun.misc.Unsafe` Memory Access Methods (Cảnh báo khi sử dụng phương thức truy cập bộ nhớ `sun.misc.Unsafe`)

JDK 23 ([JEP 471](https://openjdk.org/jeps/471)) đề xuất deprecate các phương thức truy cập bộ nhớ trong `sun.misc.Unsafe`, các phương thức này sẽ bị loại bỏ trong các phiên bản tương lai. Trong JDK 24, khi gọi bất kỳ phương thức truy cập bộ nhớ nào của `sun.misc.Unsafe` lần đầu tiên, runtime sẽ phát ra cảnh báo.

Các phương thức không an toàn này đã có giải pháp thay thế an toàn và hiệu quả:

- `java.lang.invoke.VarHandle`: Được giới thiệu trong JDK 9 (JEP 193), cung cấp cách an toàn và hiệu quả để thao tác bộ nhớ heap, bao gồm các trường của đối tượng, trường static của lớp và phần tử mảng.
- `java.lang.foreign.MemorySegment`: Được giới thiệu trong JDK 22 (JEP 454), cung cấp cách an toàn và hiệu quả để truy cập bộ nhớ ngoài heap, đôi khi phối hợp với `VarHandle`.

Hai lớp này là thành phần cốt lõi của Foreign Function & Memory API, được dùng để quản lý và thao tác bộ nhớ ngoài heap. Foreign Function & Memory API chính thức được công nhận trong JDK 22 trở thành tính năng tiêu chuẩn.

```java
import jdk.incubator.foreign.*;
import java.lang.invoke.VarHandle;

// 管理堆外整数数组的类
class OffHeapIntBuffer {

    // 用于访问整数元素的VarHandle
    private static final VarHandle ELEM_VH = ValueLayout.JAVA_INT.arrayElementVarHandle();

    // 内存管理器
    private final Arena arena;

    // 堆外内存段
    private final MemorySegment buffer;

    // 构造函数，分配指定数量的整数空间
    public OffHeapIntBuffer(long size) {
        this.arena  = Arena.ofShared();
        this.buffer = arena.allocate(ValueLayout.JAVA_INT, size);
    }

    // 释放内存
    public void deallocate() {
        arena.close();
    }

    // 以volatile方式设置指定索引的值
    public void setVolatile(long index, int value) {
        ELEM_VH.setVolatile(buffer, 0L, index, value);
    }

    // 初始化指定范围的元素为0
    public void initialize(long start, long n) {
        buffer.asSlice(ValueLayout.JAVA_INT.byteSize() * start,
                       ValueLayout.JAVA_INT.byteSize() * n)
              .fill((byte) 0);
    }

    // 将指定范围的元素复制到新数组
    public int[] copyToNewArray(long start, int n) {
        return buffer.asSlice(ValueLayout.JAVA_INT.byteSize() * start,
                              ValueLayout.JAVA_INT.byteSize() * n)
                     .toArray(ValueLayout.JAVA_INT);
    }
}
```

## JEP 499: Structured Concurrency (Đồng thời có cấu trúc, lần xem trước thứ tư)

JDK 19 đã giới thiệu đồng thời có cấu trúc — một phương pháp lập trình đa luồng nhằm đơn giản hóa lập trình đa luồng thông qua Structured Concurrency API, không nhằm thay thế `java.util.concurrent`, hiện đang ở giai đoạn incubator.

Đồng thời có cấu trúc coi nhiều tác vụ chạy trên các luồng khác nhau như một đơn vị công việc duy nhất, từ đó đơn giản hóa xử lý lỗi, nâng cao độ tin cậy và khả năng quan sát. Nói cách khác, đồng thời có cấu trúc giữ nguyên khả năng đọc, bảo trì và quan sát của mã đơn luồng.

API cơ bản của đồng thời có cấu trúc là `StructuredTaskScope`, hỗ trợ phân chia tác vụ thành nhiều tác vụ con đồng thời, thực thi trong các luồng riêng, và các tác vụ con phải hoàn thành trước khi tác vụ chính tiếp tục.

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
