---
title: Giải thích chi tiết JMM（Java Memory Model）
description: Phân tích sâu Java Memory Model JMM: giải thích chi tiết CPU cache model, cơ chế instruction reordering, nguyên tắc happens-before, đảm bảo memory visibility, hiểu tiêu chuẩn cơ bản của lập trình concurrent đa luồng.
category: Java
tag:
  - Java Concurrent
head:
  - - meta
    - name: keywords
      content: JMM,Java Memory Model,CPU cache,instruction reordering,happens-before,memory visibility,concurrent programming model
---

Với Java, bạn có thể coi **JMM (Java Memory Model — Mô hình bộ nhớ Java)** như một tập hợp các quy tắc Java định nghĩa liên quan đến lập trình concurrent. Ngoài việc trừu tượng hóa mối quan hệ giữa thread và main memory, nó còn quy định quá trình chuyển đổi từ Java source code thành instruction thực thi được của CPU phải tuân thủ những nguyên tắc và tiêu chuẩn nào liên quan đến concurrency. Mục đích chính là **đơn giản hóa lập trình đa luồng** và **tăng cường tính di động của chương trình**.

JMM chủ yếu định nghĩa **visibility** (khả năng nhìn thấy) của shared variable đối với các thread khác khi một thread thực hiện write operation.

Để hiểu sâu JMM, cần bắt đầu từ **CPU cache model** và **instruction reordering**.

## Bắt đầu từ CPU Cache Model

**Tại sao cần CPU high-speed cache?** Tương tự như cache (ví dụ Redis) mà chúng ta dùng khi phát triển backend website nhằm giải quyết sự chênh lệch tốc độ xử lý của chương trình và tốc độ truy cập RDBMS thông thường. **CPU cache dùng để giải quyết sự chênh lệch giữa tốc độ xử lý CPU và tốc độ xử lý memory.**

Chúng ta thậm chí có thể coi **memory như high-speed cache của external storage** — khi chương trình chạy, chúng ta copy dữ liệu từ external storage vào memory. Vì tốc độ xử lý memory cao hơn nhiều so với external storage, điều này tăng tốc xử lý.

Tóm lại: **CPU Cache cache dữ liệu memory để giải quyết sự không khớp giữa tốc độ xử lý CPU và memory; memory cache dữ liệu HDD để giải quyết vấn đề tốc độ truy cập HDD quá chậm.**

Để hiểu rõ hơn, tôi vẽ một sơ đồ đơn giản về CPU Cache như dưới:

> **🐛 Đính chính (xem: [issue#1848](https://github.com/Snailclimb/JavaGuide/issues/1848))**: Cải thiện chỗ không chính xác trong hình CPU cache model.

![Sơ đồ CPU Cache model](https://oss.javaguide.cn/github/javaguide/java/concurrent/cpu-cache.png)

CPU Cache hiện đại thường có ba tầng, gọi là L1, L2, L3 Cache. Một số CPU còn có L4 Cache — không thảo luận ở đây vì không phổ biến.

**Cách hoạt động của CPU Cache:** Copy một bản dữ liệu vào CPU Cache trước; khi CPU cần dùng, đọc trực tiếp từ CPU Cache; sau khi tính toán xong, ghi dữ liệu kết quả trở lại Main Memory. Tuy nhiên, điều này gây ra **vấn đề memory cache inconsistency**! Ví dụ thực hiện thao tác `i++`: nếu hai thread thực thi đồng thời, giả sử cả hai thread đọc `i=1` từ CPU Cache, sau khi cả hai tính xong `i++` và ghi lại Main Memory thì `i=2`, nhưng kết quả đúng phải là `i=3`.

**Để giải quyết vấn đề memory cache inconsistency, CPU có thể dùng cache coherence protocol (như [MESI protocol](https://zh.wikipedia.org/wiki/MESI%E5%8D%8F%E8%AE%AE)) hoặc các biện pháp khác.** Cache coherence protocol quy định các nguyên tắc và tiêu chuẩn khi CPU high-speed cache tương tác với main memory. Các CPU khác nhau thường dùng cache coherence protocol khác nhau.

![Cache coherence protocol](https://oss.javaguide.cn/github/javaguide/java/concurrent/cpu-cache-protocol.png)

Chương trình của chúng ta chạy trên hệ điều hành, OS che giấu chi tiết vận hành của hardware bên dưới và ảo hóa các hardware resource. Do đó, OS cũng cần giải quyết vấn đề memory cache inconsistency tương tự.

OS giải quyết vấn đề này bằng cách định nghĩa một loạt tiêu chuẩn thông qua **Memory Model**. Dù là Windows hay Linux, đều có Memory Model cụ thể.

## Instruction Reordering

Sau CPU cache model, hãy xem khái niệm quan trọng khác: **instruction reordering (sắp xếp lại lệnh)**.

Để tăng tốc độ thực thi/hiệu năng, máy tính sắp xếp lại các instruction khi thực thi code.

**Instruction reordering là gì?** Nói đơn giản là hệ thống không nhất thiết thực thi code theo thứ tự bạn viết.

Hai loại instruction reordering phổ biến:

- **Compiler optimization reordering**: Compiler (bao gồm JVM, JIT compiler, v.v.) sắp xếp lại thứ tự các câu lệnh mà không thay đổi ngữ nghĩa của chương trình single-thread.
- **Instruction parallel reordering**: Processor hiện đại dùng kỹ thuật Instruction-Level Parallelism (ILP) để thực thi song song nhiều instruction. Nếu không có data dependency, processor có thể thay đổi thứ tự thực thi machine instruction tương ứng với câu lệnh.

Ngoài ra, memory system cũng có "reordering" nhưng không phải reordering theo nghĩa thực sự. Trong JMM, biểu hiện là nội dung main memory và local memory có thể không nhất quán, dẫn đến chương trình có thể gặp vấn đề khi thực thi đa luồng.

Java source code trải qua quá trình **compiler optimization reordering → instruction parallel reordering → memory system reordering** rồi mới thành instruction sequence thực thi được của OS.

**Instruction reordering có thể đảm bảo serial semantic nhất quán, nhưng không có nghĩa vụ đảm bảo multi-thread semantic cũng nhất quán** — do đó trong multi-thread, instruction reordering có thể gây ra một số vấn đề.

Với compiler optimization reordering và processor instruction reordering (instruction parallel reordering và memory system reordering đều thuộc processor-level instruction reordering), cách xử lý khác nhau.

- Với compiler: Ngăn reordering bằng cách cấm loại compiler reordering cụ thể.
- Với processor: Ngăn reordering bằng cách chèn **Memory Barrier (memory fence)**.

> Memory Barrier (hay còn gọi là Memory Fence) là một CPU instruction dùng để ngăn processor instruction reordering (như rào cản), từ đó đảm bảo tính có thứ tự của thực thi instruction. Ngoài ra, để đạt hiệu ứng rào cản, khi processor ghi giá trị, nó sẽ force flush dữ liệu trong write buffer ra main memory; trước khi đọc giá trị, làm invalide dữ liệu liên quan trong local cache của processor và force load giá trị mới nhất từ main memory, từ đó đảm bảo visibility của variable.

## JMM (Java Memory Model)

### JMM là gì? Tại sao cần JMM?

Java là ngôn ngữ lập trình đầu tiên cố gắng cung cấp memory model. Do memory model cũ có một số khiếm khuyết (ví dụ rất dễ làm yếu khả năng tối ưu của compiler), từ Java 5, Java bắt đầu dùng memory model mới [《JSR-133: Java Memory Model and Thread Specification》](http://www.cs.umd.edu/~pugh/java/memoryModel/CommunityReview.pdf).

Thông thường, ngôn ngữ lập trình cũng có thể tái sử dụng memory model ở tầng OS. Nhưng memory model của các OS khác nhau. Nếu tái sử dụng trực tiếp memory model tầng OS, có thể dẫn đến cùng một bộ code chạy ổn trên OS này nhưng lại không chạy được trên OS khác. Java là ngôn ngữ cross-platform, cần tự cung cấp memory model để che giấu sự khác biệt hệ thống.

Đây chỉ là một trong những lý do JMM tồn tại. Thực ra, với Java, bạn có thể coi JMM như một tập quy tắc Java định nghĩa liên quan đến concurrent programming. Ngoài trừu tượng hóa mối quan hệ thread và main memory, nó còn quy định quá trình chuyển đổi từ Java source code thành CPU executable instruction phải tuân thủ những nguyên tắc và tiêu chuẩn liên quan đến concurrency nào. Mục đích chính là đơn giản hóa multi-thread programming, tăng cường tính di động của chương trình.

**Tại sao cần tuân thủ những nguyên tắc và tiêu chuẩn liên quan đến concurrency này?** Vì trong concurrent programming, các thiết kế như CPU multi-level cache và instruction reordering có thể gây ra một số vấn đề khi chương trình chạy. Ví dụ instruction reordering đã đề cập ở trên có thể khiến multi-thread program thực thi sai. Để giải quyết vấn đề instruction reordering này, JMM trừu tượng hóa **nguyên tắc happens-before** (sẽ giới thiệu chi tiết sau).

JMM về cơ bản là định nghĩa một số tiêu chuẩn để giải quyết các vấn đề này. Developer có thể dùng các tiêu chuẩn này để phát triển multi-thread program thuận tiện hơn. Với Java developer, bạn không cần hiểu nguyên lý low-level, chỉ cần dùng các keyword và class liên quan đến concurrency (như `volatile`, `synchronized`, các `Lock` khác nhau) là có thể phát triển chương trình an toàn concurrent.

### JMM trừu tượng hóa mối quan hệ giữa thread và main memory như thế nào?

**Java Memory Model (JMM)** trừu tượng hóa mối quan hệ giữa thread và main memory. Ví dụ, shared variable giữa các thread phải được lưu trong main memory.

Trước JDK 1.2, triển khai Java Memory Model luôn đọc variable từ **main memory** (tức shared memory), không cần chú ý đặc biệt. Còn trong Java Memory Model hiện tại, thread có thể lưu variable vào **local memory** (ví dụ register của máy) thay vì đọc/ghi trực tiếp trong main memory. Điều này có thể gây ra một thread sửa đổi giá trị của shared variable trong main memory, nhưng thread khác vẫn tiếp tục dùng bản copy variable trong register của mình, dẫn đến data inconsistency.

Điều này rất giống CPU cache model đã đề cập ở trên.

**Main memory là gì? Local memory là gì?**

- **Main memory**: Tất cả instance object do thread tạo ra đều được lưu trong main memory, dù là member variable hay local variable, class info, constant, static variable đều ở main memory. Để đạt tốc độ chạy tốt hơn, virtual machine và hardware system có thể ưu tiên lưu working memory trong register và high-speed cache.
- **Local memory**: Mỗi thread có local memory riêng tư, lưu bản copy của shared variable mà thread đó đã đọc/ghi. Mỗi thread chỉ có thể thao tác variable trong local memory của mình, không thể truy cập trực tiếp local memory của thread khác. Nếu thread cần giao tiếp, phải qua main memory. Local memory là khái niệm JMM trừu tượng hóa, không thực sự tồn tại. Nó bao gồm cache, write buffer, register và các tối ưu hardware và compiler khác.

Sơ đồ trừu tượng của Java Memory Model như sau:

![JMM (Java Memory Model)](https://oss.javaguide.cn/github/javaguide/java/concurrent/jmm.png)

Từ hình trên, nếu thread 1 và thread 2 muốn giao tiếp phải trải qua 2 bước:

1. Thread 1 đồng bộ giá trị bản copy shared variable đã sửa đổi trong local memory lên main memory.
2. Thread 2 đọc giá trị shared variable tương ứng từ main memory.

Tức là, JMM đảm bảo visibility cho shared variable.

Tuy nhiên, trong multi-thread, thao tác trên một shared variable trong main memory có thể gây ra vấn đề thread safety. Ví dụ:

1. Thread 1 và Thread 2 cùng thao tác trên shared variable, một bên execute modify, một bên execute read.
2. Thread 2 đọc được giá trị trước khi Thread 1 modify hay sau khi modify đều không chắc chắn. Vì cả Thread 1 và Thread 2 đều trước tiên copy shared variable từ main memory vào working memory của thread tương ứng.

Về giao thức tương tác cụ thể giữa main memory và working memory — cách copy variable từ main memory vào working memory, cách sync từ working memory về main memory — Java Memory Model định nghĩa 8 thao tác sync sau (chỉ cần hiểu, không cần thuộc lòng):

- **lock (khóa)**: Tác động lên variable trong main memory, đánh dấu nó là variable dành riêng cho một thread.
- **unlock (mở khóa)**: Tác động lên variable trong main memory, giải phóng trạng thái lock của variable. Variable được unlock mới có thể bị thread khác lock.
- **read (đọc)**: Tác động lên variable trong main memory, truyền giá trị của variable từ main memory sang working memory của thread để thao tác load tiếp theo sử dụng.
- **load (tải)**: Đặt giá trị variable lấy được từ thao tác read vào bản copy của variable trong working memory.
- **use (sử dụng)**: Truyền giá trị của một variable trong working memory cho execution engine; JVM thực hiện instruction này mỗi khi gặp instruction cần dùng variable.
- **assign (gán)**: Tác động lên variable trong working memory, gán giá trị nhận từ execution engine cho variable trong working memory; JVM thực hiện thao tác này mỗi khi gặp bytecode instruction gán giá trị cho variable.
- **store (lưu trữ)**: Tác động lên variable trong working memory, truyền giá trị của variable trong working memory ra main memory để thao tác write tiếp theo sử dụng.
- **write (ghi)**: Tác động lên variable trong main memory, đặt giá trị variable lấy từ working memory qua thao tác store vào variable trong main memory.

Ngoài 8 thao tác sync này, còn quy định các sync rule sau để đảm bảo thực thi đúng đắn (chỉ cần hiểu, không cần thuộc):

- Không cho phép thread vô cớ (không có thao tác assign nào) sync dữ liệu từ working memory của thread về main memory.
- Variable mới chỉ có thể "ra đời" trong main memory. Không cho phép dùng variable chưa khởi tạo (load hoặc assign) trực tiếp trong working memory. Nói cách khác, trước khi thực hiện use và store với variable, phải thực hiện assign và load trước.
- Tại cùng một thời điểm, chỉ cho phép một thread lock variable, nhưng lock operation có thể được cùng thread thực hiện lặp lại nhiều lần. Sau nhiều lần lock, chỉ khi thực hiện số lần unlock tương ứng, variable mới được unlock.
- Nếu thực hiện lock operation trên variable, giá trị của variable đó trong working memory sẽ bị xóa. Trước khi execution engine dùng variable này, cần thực hiện lại load hoặc assign để khởi tạo giá trị variable.
- Nếu variable chưa bị lock operation, không cho phép thực hiện unlock, cũng không cho phép unlock variable đang bị thread khác lock.
- ……

### Sự khác biệt giữa Java Memory Area và JMM là gì?

Đây là câu hỏi khá phổ biến, nhiều người mới bắt đầu rất dễ nhầm. **Java Memory Area và Memory Model là hai thứ hoàn toàn khác nhau**:

- JVM memory structure liên quan đến runtime area của Java Virtual Machine, định nghĩa cách JVM phân vùng lưu trữ dữ liệu chương trình khi chạy. Ví dụ heap chủ yếu dùng để lưu object instance.
- Java Memory Model liên quan đến concurrent programming của Java, trừu tượng hóa mối quan hệ giữa thread và main memory (ví dụ shared variable giữa các thread phải được lưu trong main memory), quy định quá trình chuyển đổi từ Java source code thành CPU executable instruction phải tuân thủ những nguyên tắc và tiêu chuẩn liên quan đến concurrency nào. Mục đích chính là đơn giản hóa multi-thread programming, tăng cường tính di động của chương trình.

### Nguyên tắc happens-before là gì?

Khái niệm happens-before ra đời sớm nhất trong bài báo [《Time, Clocks and the Ordering of Events in a Distributed System》](https://lamport.azurewebsites.net/pubs/time-clocks.pdf) của Leslie Lamport năm 1978. Trong bài báo này, Leslie Lamport đề xuất khái niệm [logical clock](https://writings.sh/post/logical-clocks), trở thành thuật toán logical clock đầu tiên. Trong môi trường distributed, thông qua một loạt quy tắc để định nghĩa sự thay đổi của logical clock, từ đó có thể dùng logical clock để đánh giá thứ tự trước sau của các event trong hệ thống distributed. **Logical clock không đo lường thời gian mà chỉ phân biệt thứ tự trước sau của event. Bản chất của nó là định nghĩa một loại happens-before relationship.**

Background ra đời của khái niệm happens-before ở trên không phải trọng điểm — chỉ cần hiểu đơn giản.

JSR 133 đã đưa vào khái niệm happens-before để mô tả memory visibility giữa hai operation.

**Tại sao cần nguyên tắc happens-before?** Sự ra đời của nguyên tắc happens-before nhằm cân bằng giữa programmer, compiler và processor. Programmer muốn strong memory model dễ hiểu và lập trình. Compiler và processor muốn weak memory model với ít ràng buộc hơn để tối ưu hiệu năng tối đa. Ý tưởng thiết kế của nguyên tắc happens-before thực ra rất đơn giản:

- Để ràng buộc compiler và processor ít nhất có thể: miễn là không thay đổi kết quả thực thi chương trình (chương trình single-thread và multi-thread thực thi đúng đắn), compiler và processor muốn reorder tối ưu thế nào cũng được.
- Với reordering thay đổi kết quả thực thi chương trình, JMM yêu cầu compiler và processor phải cấm loại reordering này.

Dưới đây là hình sơ đồ ý tưởng thiết kế JMM tôi vẽ lại dựa trên hình trong cuốn 《The Art of Java Concurrent Programming》.

![Ý tưởng thiết kế JMM](https://oss.javaguide.cn/github/javaguide/java/concurrent/jmm-design-idea.png)

Sau khi hiểu ý tưởng thiết kế của nguyên tắc happens-before, hãy xem định nghĩa happens-before của JSR-133:

- Nếu một operation happens-before một operation khác, thì kết quả thực thi của operation đầu sẽ visible với operation sau, và thứ tự thực thi của operation đầu đứng trước operation sau.
- Sự tồn tại happens-before relationship giữa hai operation không có nghĩa là triển khai cụ thể của Java platform nhất thiết phải thực thi theo thứ tự chỉ định bởi happens-before relationship. Nếu kết quả thực thi sau reordering nhất quán với kết quả thực thi theo happens-before relationship, JMM cũng cho phép reordering này.

Xem đoạn code sau:

```java
int userNum = getUserNum();   // 1
int teacherNum = getTeacherNum();   // 2
int totalNum = userNum + teacherNum;  // 3
```

- 1 happens-before 2
- 2 happens-before 3
- 1 happens-before 3

Mặc dù 1 happens-before 2, nhưng reordering 1 và 2 không ảnh hưởng đến kết quả thực thi code, nên JMM cho phép compiler và processor thực hiện reordering này. Nhưng 1 và 2 phải thực thi trước 3 — tức 1, 2 happens-before 3.

**Ý nghĩa nguyên tắc happens-before thực ra không phải là một operation xảy ra trước operation khác, mặc dù từ góc độ programmer điều này cũng không sai. Chính xác hơn, nó muốn diễn đạt rằng kết quả của operation trước là visible với operation sau, bất kể hai operation có ở cùng thread hay không.**

Ví dụ: operation 1 happens-before operation 2, dù operation 1 và operation 2 không ở cùng thread, JMM vẫn đảm bảo kết quả operation 1 visible với operation 2.

### Các quy tắc happens-before phổ biến là gì?

Quy tắc happens-before có 8 điều, không nhiều không ít. Chỉ cần hiểu 5 điều được liệt kê dưới đây. Không thể nhớ hết là điều bình thường — tra cứu bất cứ lúc nào.

1. **Program order rule**: Trong một thread, theo thứ tự code, operation viết trước happens-before operation viết sau.
2. **Monitor lock rule**: Unlock happens-before lock.
3. **Volatile variable rule**: Write operation trên một volatile variable happens-before read operation trên volatile variable đó sau này. Nói đơn giản là kết quả write operation trên volatile variable visible với bất kỳ operation nào xảy ra sau đó.
4. **Transitivity rule**: Nếu A happens-before B, và B happens-before C, thì A happens-before C.
5. **Thread start rule**: Method `start()` của Thread object happens-before mọi action của thread đó.

Nếu hai operation không thỏa mãn bất kỳ quy tắc happens-before nào trên đây, thì hai operation đó không có đảm bảo về thứ tự. JVM có thể reorder hai operation đó.

### Mối quan hệ giữa happens-before và JMM là gì?

Mối quan hệ giữa happens-before và JMM như hình dưới:

![jmm-vs-happens-before](https://oss.javaguide.cn/github/javaguide/java/concurrent/jmm-vs-happens-before.png)

- JMM cung cấp cho programmer **"happens-before rules"** (như program order rule, `volatile` variable rule, v.v.). Đây là ảo giác về **"strong memory model"**: programmer không cần quan tâm đến chi tiết reordering phức tạp ở low-level, chỉ cần code theo các quy tắc này là đảm bảo memory visibility trong multi-thread.
- Khi JVM thực thi, ánh xạ các quy tắc happens-before lên triển khai cụ thể. Để không mất hiệu năng trong khi đảm bảo tính chính xác, JMM chỉ **"cấm reordering ảnh hưởng đến kết quả thực thi"**. Với reordering không ảnh hưởng đến kết quả thực thi single-thread, JMM cho phép.
- Ở tầng thấp nhất là **"reordering rules"** thực tế của compiler và processor.

Tóm lại, JMM như một tầng trung gian: hướng lên cung cấp mô hình lập trình đơn giản cho programmer thông qua happens-before; hướng xuống tối ưu hiệu năng hardware bên dưới bằng cách cấm các reordering cụ thể. Thiết kế này vừa đảm bảo multi-thread safety vừa release tối đa hiệu năng hardware.

## Xem lại ba đặc tính quan trọng của Concurrent Programming

### Atomicity (Tính nguyên tử)

Một hoặc nhiều operation, hoặc tất cả đều được thực thi và không bị gián đoạn bởi bất kỳ yếu tố nào, hoặc tất cả đều không thực thi.

Trong Java, có thể dùng `synchronized`, các `Lock` và các lớp atomic khác nhau để đạt atomicity.

`synchronized` và các `Lock` đảm bảo tại bất kỳ thời điểm nào chỉ có một thread truy cập code block đó, do đó có thể đảm bảo atomicity. Các lớp atomic dùng CAS (compare and swap) operation (có thể cũng dùng keyword `volatile` hay `final`) để đảm bảo atomic operation.

### Visibility (Khả năng nhìn thấy)

Khi một thread modify shared variable, các thread khác có thể thấy ngay giá trị mới nhất sau khi modify.

Trong Java, có thể dùng `synchronized`, `volatile` và các `Lock` để đạt visibility.

Nếu khai báo variable là `volatile`, đây là chỉ thị cho JVM rằng variable này là shared và không ổn định, mỗi lần dùng phải đọc từ main memory.

### Ordering (Tính có thứ tự)

Do vấn đề instruction reordering, thứ tự thực thi code chưa chắc là thứ tự khi viết code.

Khi bàn về reordering ở trên cũng đã đề cập:

> **Instruction reordering có thể đảm bảo serial semantic nhất quán, nhưng không có nghĩa vụ đảm bảo multi-thread semantic cũng nhất quán** — do đó trong multi-thread, instruction reordering có thể gây ra một số vấn đề.

Trong Java, keyword `volatile` có thể cấm instruction reordering optimization.

## Tổng kết

- Java là ngôn ngữ đầu tiên cố gắng cung cấp memory model. Mục đích chính là đơn giản hóa multi-thread programming, tăng cường tính di động của chương trình.
- CPU có thể giải quyết vấn đề memory cache inconsistency bằng cache coherence protocol (như [MESI protocol](https://zh.wikipedia.org/wiki/MESI%E5%8D%8F%E8%AE%AE)).
- Để tăng tốc độ thực thi/hiệu năng, máy tính sắp xếp lại instruction khi thực thi code. Nói đơn giản là hệ thống không nhất thiết thực thi code theo thứ tự bạn viết. **Instruction reordering có thể đảm bảo serial semantic nhất quán, nhưng không có nghĩa vụ đảm bảo multi-thread semantic nhất quán** — do đó trong multi-thread, instruction reordering có thể gây ra vấn đề.
- Bạn có thể coi JMM như tập quy tắc Java định nghĩa liên quan đến concurrent programming. Ngoài trừu tượng hóa mối quan hệ thread và main memory, còn quy định quá trình chuyển đổi từ Java source code thành CPU executable instruction phải tuân thủ những nguyên tắc và tiêu chuẩn liên quan đến concurrency nào. Mục đích chính là đơn giản hóa multi-thread programming, tăng cường tính di động của chương trình.
- JSR 133 đưa vào khái niệm happens-before để mô tả memory visibility giữa hai operation.

## Tài liệu tham khảo

- 《The Art of Java Concurrent Programming》 Chương 3 Java Memory Model
- 《Deep Dive Java Multithreading》: <http://concurrent.redspider.group/RedSpider.html>
- Research on Java Memory Access Reordering: <https://tech.meituan.com/2014/09/23/java-memory-reordering.html>
- Hey classmate, your Java Memory Model (JMM) is here: <https://xie.infoq.cn/article/739920a92d0d27e2053174ef2>
- JSR 133 (Java Memory Model) FAQ: <https://www.cs.umd.edu/~pugh/java/memoryModel/jsr-133-faq.html>

<!-- @include: @article-footer.snippet.md -->
