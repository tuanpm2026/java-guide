---
title: Giải thích chi tiết quá trình Class Loading
description: Phân tích từng giai đoạn và chi tiết quan trọng của JVM class loading, hiểu rõ các hành vi cụ thể của verification, preparation, resolution và initialization.
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: class loading,loading,verification,preparation,resolution,initialization,clinit,constant pool
---

## Vòng đời của Class

Từ khi class được load vào bộ nhớ của virtual machine cho đến khi unload khỏi bộ nhớ, vòng đời đầy đủ có thể tóm tắt thành 7 giai đoạn: Loading (Tải), Verification (Xác minh), Preparation (Chuẩn bị), Resolution (Phân giải), Initialization (Khởi tạo), Using (Sử dụng) và Unloading (Gỡ bỏ). Trong đó, Verification, Preparation và Resolution được gọi chung là Linking (Liên kết).

Thứ tự 7 giai đoạn này như hình dưới:

![Vòng đời đầy đủ của một class](https://oss.javaguide.cn/github/javaguide/java/jvm/lifecycle-of-a-class.png)

## Quá trình Class Loading

**File Class cần được load vào virtual machine mới có thể chạy và sử dụng. Vậy virtual machine load các file Class này như thế nào?**

Hệ thống load file kiểu Class gồm ba bước chính: **Loading → Linking → Initialization**. Quá trình Linking lại chia thành ba bước: **Verification → Preparation → Resolution**.

![Quá trình Class Loading](https://oss.javaguide.cn/github/javaguide/java/jvm/class-loading-procedure.png)

Xem thêm: [Java Virtual Machine Specification - 5.3. Creation and Loading](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-5.html#jvms-5.3).

### Loading (Tải)

Bước đầu tiên của quá trình class loading, chủ yếu hoàn thành 3 việc sau:

1. Lấy binary byte stream định nghĩa class thông qua fully qualified class name.
2. Chuyển đổi cấu trúc lưu trữ tĩnh do byte stream biểu thị thành cấu trúc dữ liệu runtime của method area.
3. Tạo một `Class` object đại diện cho class trong memory, làm access entry cho các data này trong method area.

Ba điểm trên trong VM specification không cụ thể nên rất linh hoạt. Ví dụ "lấy binary byte stream qua fully qualified class name" không chỉ định lấy từ đâu (`ZIP`, `JAR`, `EAR`, `WAR`, network, dynamic proxy tạo runtime, các file khác như `JSP`...) hay lấy như thế nào.

Bước loading này chủ yếu được hoàn thành thông qua **class loader** sẽ đề cập sau. Có nhiều loại class loader; khi muốn load một class, class loader cụ thể nào được quyết định bởi **parent delegation model** (mặc dù chúng ta cũng có thể phá vỡ parent delegation model).

> Class loader và parent delegation model cũng là các điểm kiến thức rất quan trọng, được giới thiệu chi tiết trong bài [Giải thích chi tiết Class Loader](https://javaguide.cn/java/jvm/classloader.html). Khi đọc bài này, biết có điều đó là được.

Mỗi Java class có một reference trỏ đến `ClassLoader` đã load nó. Tuy nhiên, array class không được tạo thông qua `ClassLoader` mà do JVM tự động tạo khi cần. Khi array class lấy `ClassLoader` qua method `getClassLoader()`, sẽ nhất quán với `ClassLoader` của element type của array đó.

Giai đoạn loading của non-array class (thao tác lấy binary byte stream của class trong giai đoạn loading) là giai đoạn có khả năng kiểm soát mạnh nhất. Ở bước này chúng ta có thể tự custom class loader để kiểm soát cách lấy byte stream (override method `loadClass()` của class loader).

Một phần action của giai đoạn loading và giai đoạn linking (như một phần action verification format bytecode file) thực hiện xen kẽ nhau. Giai đoạn loading chưa kết thúc, giai đoạn linking có thể đã bắt đầu.

### Verification (Xác minh)

**Verification là bước đầu tiên của giai đoạn linking. Mục đích của giai đoạn này là đảm bảo thông tin trong byte stream của file Class phù hợp với tất cả ràng buộc trong 《Java Virtual Machine Specification》, đảm bảo thông tin này sau khi được thực thi như code không gây nguy hiểm cho bảo mật bản thân virtual machine.**

Bước verification này tiêu tốn tương đối nhiều resource trong toàn bộ quá trình class loading, nhưng rất cần thiết — có thể ngăn chặn hiệu quả việc thực thi code độc hại. Bảo mật chương trình luôn là ưu tiên hàng đầu.

Tuy nhiên, giai đoạn verification không phải là giai đoạn bắt buộc phải thực thi. Nếu tất cả code chương trình chạy (bao gồm code tự viết, từ third-party package, load từ ngoài, tạo dynamic, v.v.) đều đã được dùng và verified nhiều lần, trong giai đoạn production có thể cân nhắc dùng tham số `-Xverify:none` để tắt hầu hết biện pháp verification class, giảm thời gian class loading của virtual machine. Tuy nhiên cần lưu ý `-Xverify:none` và `-noverify` đã bị đánh dấu deprecated trong JDK 13, có thể bị loại bỏ trong phiên bản JDK tương lai.

Giai đoạn verification chủ yếu gồm bốn giai đoạn kiểm tra:

1. File format verification (kiểm tra format file Class)
2. Metadata verification (kiểm tra ngữ nghĩa bytecode)
3. Bytecode verification (kiểm tra ngữ nghĩa chương trình)
4. Symbolic reference verification (kiểm tra tính đúng đắn của class)

![Sơ đồ giai đoạn Verification](https://oss.javaguide.cn/github/javaguide/java/jvm/class-loading-process-verification.png)

Giai đoạn file format verification dựa trên binary byte stream của class, mục đích chính là đảm bảo byte stream input có thể được parse và lưu trữ đúng trong method area, format phù hợp với yêu cầu mô tả type info Java. Ngoài giai đoạn này, ba giai đoạn verification còn lại đều dựa trên cấu trúc lưu trữ của method area, không còn đọc/thao tác trực tiếp byte stream.

> Method area là một vùng logic trong JVM runtime data area, là vùng memory được chia sẻ giữa tất cả thread. Khi virtual machine cần dùng một class, nó cần đọc và parse file Class để lấy thông tin liên quan, rồi lưu vào method area. Method area lưu **class info, field info, method info, constant, static variable, code cache sau khi JIT compile, v.v.** đã được virtual machine load.
>
> Để xem giới thiệu chi tiết về method area, đọc bài [Giải thích chi tiết Java Memory Area](https://javaguide.cn/java/jvm/memory-area.html).

Symbolic reference verification xảy ra trong giai đoạn resolution của quá trình class loading — cụ thể là khi JVM chuyển đổi symbolic reference sang direct reference (giai đoạn resolution sẽ giới thiệu symbolic reference và direct reference).

Mục đích chính của symbolic reference verification là đảm bảo giai đoạn resolution có thể thực thi bình thường. Nếu không pass symbolic reference verification, JVM sẽ throw exception như:

- `java.lang.IllegalAccessError`: Khi class cố truy cập/modify field không có quyền hoặc gọi method không có quyền.
- `java.lang.NoSuchFieldError`: Khi class cố truy cập/modify một field cụ thể mà object không còn chứa field đó.
- `java.lang.NoSuchMethodError`: Khi class cố truy cập một method cụ thể mà method đó không tồn tại.
- ……

### Preparation (Chuẩn bị)

**Giai đoạn preparation là giai đoạn chính thức cấp phát memory cho class variable và đặt giá trị khởi đầu cho class variable**, tất cả memory này sẽ được cấp phát trong method area. Cần lưu ý một số điểm sau:

1. Memory được cấp phát lúc này chỉ bao gồm class variable (Class Variables — tức static variable, được modify bởi keyword `static`, chỉ liên quan đến class nên gọi là class variable), không bao gồm instance variable. Instance variable sẽ được cấp phát cùng với object trong Java heap khi object được instantiate.
2. Về mặt khái niệm, memory của class variable nên được cấp phát trong **method area**. Tuy nhiên cần lưu ý: Trước JDK 7, khi HotSpot dùng permanent generation triển khai method area, triển khai hoàn toàn tuân thủ logic concept này. Còn từ JDK 7 trở đi, HotSpot đã chuyển string constant pool, static variable ban đầu trong permanent generation vào heap, khi đó class variable sẽ được lưu cùng với Class object trong Java heap. Đọc thêm: [Erratum của 《Deep Understanding Java Virtual Machine (3rd Edition)》#75](https://github.com/fenixsoft/jvm_book/issues/75).
3. Giá trị khởi đầu được đặt ở đây "thông thường" là zero value mặc định của kiểu dữ liệu (như 0, 0L, null, false, v.v.). Ví dụ: khai báo `public static int value=111`, thì giá trị khởi đầu của `value` trong giai đoạn preparation là 0 chứ không phải 111 (giai đoạn initialization mới gán giá trị). Trường hợp đặc biệt: nếu thêm keyword `final` cho `value`: `public static final int value=111`, thì giá trị của `value` trong giai đoạn preparation sẽ được gán là 111.

**Zero value của basic data type**: (hình từ 《Deep Understanding Java Virtual Machine》 Edition 3, Section 7.3.3)

![Zero value của basic data type](https://oss.javaguide.cn/github/javaguide/java/%E5%9F%BA%E6%9C%AC%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B%E7%9A%84%E9%9B%B6%E5%80%BC.png)

### Resolution (Phân giải)

**Giai đoạn resolution là quá trình virtual machine thay thế symbolic reference trong constant pool bằng direct reference.** Resolution action chủ yếu nhắm vào 7 loại symbolic reference: class hoặc interface, field, class method, interface method, method type, method handle và call site specifier.

《Deep Understanding Java Virtual Machine》 Edition 3, Section 7.3.4 giải thích symbolic reference và direct reference như sau:

![Symbolic reference và Direct reference](https://oss.javaguide.cn/github/javaguide/java/jvm/symbol-reference-and-direct-reference.png)

Ví dụ: Khi chương trình thực thi một method, hệ thống cần biết chính xác method này nằm ở đâu. Java Virtual Machine chuẩn bị cho mỗi class một method table lưu tất cả method trong class. Khi cần gọi method của một class, chỉ cần biết offset của method đó trong method table là có thể gọi trực tiếp. Thông qua thao tác resolution, symbolic reference có thể trực tiếp chuyển thành vị trí của method đích trong class method table, từ đó method có thể được gọi.

Tóm lại, giai đoạn resolution là quá trình virtual machine thay thế symbolic reference trong constant pool bằng direct reference — tức lấy được pointer hoặc offset trong memory của class, field, hay method.

### Initialization (Khởi tạo)

**Giai đoạn initialization là quá trình thực thi method `<clinit>()`, là bước cuối cùng của class loading. Đây là bước JVM mới thực sự bắt đầu thực thi Java program code (bytecode) được định nghĩa trong class.**

> Lưu ý: Method `<clinit>()` được tự động tạo ra sau khi compile.

Với việc gọi method `<clinit>()`, virtual machine tự đảm bảo tính an toàn của nó trong môi trường đa luồng. Vì method `<clinit>()` là thread-safe với lock, nên trong môi trường multi-thread khi thực hiện class initialization có thể gây nhiều thread block — và loại block này rất khó phát hiện.

Với giai đoạn initialization, virtual machine quy định nghiêm ngặt có và chỉ có 6 trường hợp phải initialize class (chỉ khi chủ động dùng class mới initialize):

1. Khi gặp 4 bytecode instruction `new`, `getstatic`, `putstatic` hoặc `invokestatic`:
   - `new`: Tạo instance object của class.
   - `getstatic`, `putstatic`: Đọc hoặc đặt static field của type (trừ static field được modify bởi `final` và đã đặt kết quả vào constant pool lúc compile).
   - `invokestatic`: Gọi static method của class.
2. Khi dùng method của package `java.lang.reflect` để reflection call class như `Class.forName("...")`, `newInstance()`, v.v. Nếu class chưa initialize, cần trigger initialize.
3. Khi initialize một class, nếu parent class chưa initialize thì trigger initialize parent class trước.
4. Khi virtual machine khởi động, user cần định nghĩa một main class cần thực thi (class chứa method `main`) — virtual machine sẽ initialize class này trước.
5. `MethodHandle` và `VarHandle` có thể coi là cơ chế reflection gọi nhẹ hơn. Để dùng 2 call này phải dùng `findStaticVarHandle` để initialize class cần gọi trước.
6. **[Bổ sung từ [issue745](https://github.com/Snailclimb/JavaGuide/issues/745)]** Khi một interface định nghĩa default method (interface method được modify bởi keyword `default` mới trong JDK8), nếu implementation class của interface đó xảy ra initialization, thì interface đó phải được initialize trước.

## Class Unloading (Gỡ bỏ Class)

> Phần nội dung unloading đến từ [issue#662](https://github.com/Snailclimb/JavaGuide/issues/662), được bổ sung hoàn thiện bởi **[guang19](https://github.com/guang19)**.

**Unload class nghĩa là Class object của class đó bị GC.**

Unload class cần thỏa 3 điều kiện:

1. Tất cả instance object của class đó đã bị GC — tức heap không còn instance object của class đó.
2. Class đó không còn được reference ở bất kỳ nơi nào khác.
3. Instance của class loader đã load class đó đã bị GC.

Do đó, trong vòng đời JVM, các class được load bởi class loader có sẵn của JVM sẽ không bị unload. Nhưng các class được load bởi custom class loader của chúng ta thì có thể bị unload.

Chỉ cần hiểu một điểm: JDK tích hợp sẵn `BootstrapClassLoader`, `ExtClassLoader`, `AppClassLoader` chịu trách nhiệm load các class JDK cung cấp, nên chúng (instance của class loader) chắc chắn không bị GC. Còn instance của custom class loader chúng ta tạo thì có thể bị GC, nên các class được load bởi custom class loader của chúng ta có thể bị unload.

**Tài liệu tham khảo**

- 《Deep Understanding Java Virtual Machine》
- 《Java Virtual Machine in Action》
- Chapter 5. Loading, Linking, and Initializing - Java Virtual Machine Specification: <https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-5.html#jvms-5.4>

<!-- @include: @article-footer.snippet.md -->
