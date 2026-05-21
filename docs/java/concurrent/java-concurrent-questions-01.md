---
title: Tổng hợp câu hỏi phỏng vấn Java Concurrent thường gặp (Phần 1)
description: "Câu hỏi phỏng vấn Java concurrent programming cơ bản: giải thích sâu sự khác biệt thread và process, cách tạo multi-thread, vòng đời và trạng thái thread, bốn điều kiện deadlock và cách ngăn chặn, các khái niệm concurrent và parallel, v.v."
category: Java
tag:
  - Java Concurrent
head:
  - - meta
    - name: keywords
      content: Java concurrent,thread và process,multi-thread,deadlock,thread lifecycle,concurrent programming,Java interview questions,cách tạo thread
---

<!-- @include: @small-advertisement.snippet.md -->

## Thread (Luồng)

### ⭐️Thread và Process là gì?

#### Process là gì?

Process là một lần thực thi của program — là đơn vị cơ bản để hệ thống chạy program. Do đó process là động. Hệ thống chạy một program chính là quá trình một process từ tạo ra, chạy đến kết thúc.

Trong Java, khi chúng ta khởi động hàm `main` thực chất là khởi động một JVM process. Thread nơi hàm `main` chạy là một thread trong process này — còn gọi là main thread.

Như hình dưới, trên Windows có thể thấy rõ các process Windows đang chạy hiện tại (chạy file `.exe`) qua Task Manager.

![Ví dụ process trên Windows](https://oss.javaguide.cn/github/javaguide/java/%E8%BF%9B%E7%A8%8B%E7%A4%BA%E4%BE%8B%E5%9B%BE%E7%89%87-Windows.png)

#### Thread là gì?

Thread tương tự process, nhưng thread là đơn vị thực thi nhỏ hơn process. Một process có thể tạo ra nhiều thread trong quá trình thực thi. Không giống process, nhiều thread cùng loại chia sẻ tài nguyên **heap** và **method area** của process. Nhưng mỗi thread có **program counter**, **JVM stack** và **native method stack** riêng. Do đó chi phí khi hệ thống tạo thread hay chuyển đổi giữa các thread nhỏ hơn nhiều so với process — cũng chính vì vậy thread còn được gọi là lightweight process.

Java program bản chất là multi-thread program. Có thể dùng JMX để xem một Java program thông thường có những thread nào, code như sau:

```java
public class MultiThread {
	public static void main(String[] args) {
		// Lấy Java thread management MXBean
	ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
		// Không cần lấy monitor và synchronizer info của sync, chỉ lấy thread và thread stack info
		ThreadInfo[] threadInfos = threadMXBean.dumpAllThreads(false, false);
		// Duyệt thread info, chỉ print thread ID và thread name
		for (ThreadInfo threadInfo : threadInfos) {
			System.out.println("[" + threadInfo.getThreadId() + "] " + threadInfo.getThreadName());
		}
	}
}
```

Output của program trên như sau (output có thể khác nhau, không cần quan tâm vai trò của từng thread — chỉ cần biết main thread thực thi hàm main):

```plain
[5] Attach Listener // Thread xử lý attach event
[4] Signal Dispatcher // Thread xử lý tín hiệu JVM
[3] Finalizer // Thread gọi method finalize của object
[2] Reference Handler // Thread clear reference
[1] main // main thread, entry point của program
```

Từ output trên có thể thấy: **Một Java program chạy là main thread và nhiều thread khác chạy đồng thời**.

### Java thread và OS thread khác nhau như thế nào?

Trước JDK 1.2, Java thread được triển khai dựa trên Green Thread — một loại user-level thread, tức JVM tự mô phỏng multi-threading mà không phụ thuộc vào OS. Do Green Thread có một số hạn chế khi dùng so với native thread (như Green Thread không thể dùng trực tiếp các tính năng do OS cung cấp như async I/O, chỉ chạy trên một kernel thread nên không tận dụng được multi-core), từ JDK 1.2 trở đi Java thread chuyển sang triển khai dựa trên Native Thread — tức JVM dùng trực tiếp kernel-level thread (kernel thread) gốc của OS để triển khai Java thread. Thread được OS kernel schedule và quản lý.

Đã đề cập user thread và kernel thread, vì nhiều bạn chưa hiểu rõ sự khác biệt, giới thiệu ngắn gọn:

- **User thread**: Thread được user space program quản lý và schedule, chạy trong user space (dành riêng cho application).
- **Kernel thread**: Thread được OS kernel quản lý và schedule, chạy trong kernel space (chỉ kernel program có thể truy cập).

Tóm tắt ngắn gọn sự khác biệt và đặc điểm của user thread và kernel thread: User thread tạo và switch cost thấp nhưng không tận dụng được multi-core. Kernel thread tạo và switch cost cao nhưng có thể tận dụng multi-core.

Một câu tóm gọn quan hệ giữa Java thread và OS thread: **Java thread hiện nay bản chất chính là OS thread**.

Thread model là cách liên kết giữa user thread và kernel thread. Có ba thread model phổ biến:

1. One-to-one (một user thread tương ứng một kernel thread)
2. Many-to-one (nhiều user thread map đến một kernel thread)
3. Many-to-many (nhiều user thread map đến nhiều kernel thread)

![Ba loại thread model phổ biến](https://oss.javaguide.cn/github/javaguide/java/concurrent/three-types-of-thread-models.png)

Trên các OS phổ biến như Windows và Linux, Java thread dùng thread model one-to-one — tức một Java thread tương ứng một system kernel thread. Solaris là ngoại lệ (Solaris hỗ trợ many-to-many thread model). HotSpot VM trên Solaris hỗ trợ cả many-to-many và one-to-one. Tham khảo câu trả lời của R: [Mô hình thread trong JVM có phải user-level không?](https://www.zhihu.com/question/23096638/answer/29617153).

### ⭐️Hãy mô tả ngắn gọn quan hệ, sự khác biệt, ưu nhược điểm giữa thread và process?

Hình dưới là Java memory area. Từ góc độ JVM qua hình này nói về quan hệ giữa thread và process.

![Java runtime data area (sau JDK1.8)](https://oss.javaguide.cn/github/javaguide/java/jvm/java-runtime-data-areas-jdk1.8.png)

Từ hình trên có thể thấy: Một process có thể có nhiều thread. Nhiều thread chia sẻ tài nguyên **heap** và **method area (Metaspace sau JDK1.8)** của process. Nhưng mỗi thread có **program counter**, **JVM stack** và **native method stack** riêng.

**Tóm tắt**: Thread là đơn vị chạy nhỏ hơn được chia ra từ process. Sự khác biệt lớn nhất giữa thread và process là về cơ bản các process là độc lập với nhau, còn các thread không nhất thiết như vậy vì các thread trong cùng process rất có thể ảnh hưởng lẫn nhau. Thread execution overhead nhỏ nhưng không thuận tiện cho resource management và protection. Process thì ngược lại.

Dưới đây là phần mở rộng của điểm kiến thức này!

Hãy suy nghĩ câu hỏi: Tại sao **program counter**, **JVM stack** và **native method stack** là private của thread? Tại sao heap và method area là shared của thread?

#### Tại sao program counter là private?

Program counter chủ yếu có hai tác dụng:

1. Bytecode interpreter đọc instruction theo thứ tự qua việc thay đổi program counter, từ đó triển khai flow control của code như: sequential execution, selection, loop, exception handling.
2. Trong multi-thread, program counter dùng để ghi lại vị trí thực thi của thread hiện tại, để khi thread được switch trở lại biết thread đó chạy đến đâu rồi.

Cần lưu ý: Nếu thực thi native method thì program counter ghi là undefined address. Chỉ khi thực thi Java code mới ghi địa chỉ instruction tiếp theo.

Vì vậy, program counter private chủ yếu là để **có thể khôi phục đến đúng vị trí thực thi sau khi thread switch**.

#### Tại sao JVM stack và native method stack là private?

- **JVM stack**: Mỗi Java method trước khi thực thi sẽ tạo một stack frame để lưu local variable table, operand stack, constant pool reference, v.v. Quá trình từ method call đến khi thực thi xong tương ứng với quá trình một stack frame push và pop trong JVM stack.
- **Native method stack**: Vai trò rất giống JVM stack. Sự khác biệt là: **JVM stack phục vụ cho JVM thực thi Java method (tức bytecode), còn native method stack phục vụ cho JVM sử dụng Native method.** Trong HotSpot virtual machine, hai cái này được gộp làm một.

Vì vậy, để **đảm bảo local variable trong thread không bị thread khác truy cập**, JVM stack và native method stack là private của thread.

#### Hiểu ngắn gọn về heap và method area

Heap và method area là resource shared của tất cả thread. Heap là vùng memory lớn nhất trong process, chủ yếu dùng để lưu object mới tạo (hầu hết object được cấp phát memory ở đây). Method area chủ yếu lưu class info đã được load, constant, static variable, code cache sau khi JIT compile, v.v.

### Cách tạo Thread?

Nói chung có nhiều cách tạo thread như kế thừa class `Thread`, implement interface `Runnable`, implement interface `Callable`, dùng thread pool, dùng class `CompletableFuture`, v.v.

Tuy nhiên, các cách này thực ra không thực sự tạo thread. Nói chính xác hơn, đây đều là các cách dùng multi-thread trong Java code.

Nói nghiêm túc, Java chỉ có một cách tạo thread — đó là qua `new Thread().start()`. Bất kể cách nào, cuối cùng đều phụ thuộc vào `new Thread().start()`.

### ⭐️Hãy nói về vòng đời và trạng thái của Thread?

Java thread tại một thời điểm cụ thể trong vòng đời chỉ có thể ở một trong 6 trạng thái khác nhau sau:

- **NEW**: Trạng thái khởi đầu, thread đã được tạo nhưng chưa gọi `start()`.
- **RUNNABLE**: Trạng thái chạy, thread đã gọi `start()` và đang chờ chạy.
- **BLOCKED**: Trạng thái blocked, cần chờ lock được release.
- **WAITING**: Trạng thái chờ, thread này cần chờ thread khác thực hiện một số action cụ thể (notify hoặc interrupt).
- **TIME_WAITING**: Trạng thái timed wait, có thể tự trả về sau khoảng thời gian chỉ định thay vì chờ mãi mãi như WAITING.
- **TERMINATED**: Trạng thái kết thúc, thread đã thực thi xong.

Thread trong vòng đời không cố định ở một trạng thái nào mà chuyển đổi giữa các trạng thái theo việc thực thi code.

Sơ đồ chuyển đổi trạng thái Java thread (nguồn: [Sửa lỗi | Ba lỗi về trạng thái thread trong 《The Art of Java Concurrent Programming》](https://mp.weixin.qq.com/s/0UTyrJpRKaKhkhHcQtXAiA)):

![Sơ đồ chuyển đổi trạng thái Java thread](https://oss.javaguide.cn/github/javaguide/java/concurrent/640.png)

Từ hình trên có thể thấy: Sau khi thread được tạo sẽ ở trạng thái **NEW (Mới tạo)**. Sau khi gọi method `start()` bắt đầu chạy, thread lúc này ở trạng thái **READY (Sẵn sàng)**. Thread ở trạng thái READY sau khi nhận được CPU time slice sẽ ở trạng thái **RUNNING (Đang chạy)**.

> Ở tầng OS, thread có trạng thái READY và RUNNING. Còn ở tầng JVM chỉ có thể thấy trạng thái RUNNABLE (nguồn: [HowToDoInJava](https://howtodoinJava.com/): [Java Thread Life Cycle and Thread States](https://howtodoinJava.com/Java/multi-threading/Java-thread-life-cycle-and-thread-states/)). Nên Java system thường gộp cả hai trạng thái này gọi là **RUNNABLE (Đang chạy)**.
>
> **Tại sao JVM không phân biệt hai trạng thái này?** (Trích từ: [Java thread chạy sao lại có trạng thái thứ sáu? - Câu trả lời của Dawell](https://www.zhihu.com/question/56494969/answer/154053599)) OS multi-task hiện đại dạng time-sharing thường áp dụng cái gọi là "time quantum/time slice" để thực hiện preemptive round-robin scheduling. Time slice này thường rất nhỏ — một thread mỗi lần chỉ có thể chạy tối đa khoảng 10-20ms trên CPU (lúc này ở running state) — tức khoảng 0.01 giây. Hết time slice sẽ bị switch xuống, đặt vào cuối scheduling queue chờ được schedule lại (quay lại ready state). Thread switch nhanh như vậy nên không có ý nghĩa gì khi phân biệt hai trạng thái này.

![RUNNABLE-VS-RUNNING](https://oss.javaguide.cn/github/javaguide/java/RUNNABLE-VS-RUNNING.png)

- Sau khi thread thực thi method `wait()`, thread vào trạng thái **WAITING (Chờ)**. Thread ở waiting state cần thông báo từ thread khác mới có thể trở về running state.
- Trạng thái **TIMED_WAITING (Timed wait)** tương đương waiting state nhưng có thêm timeout limit. Ví dụ dùng method `sleep(long millis)` hoặc `wait(long millis)` có thể đặt thread vào TIMED_WAITING. Sau khi timeout, thread sẽ trở về RUNNABLE state.
- Khi thread vào `synchronized` method/block hoặc gọi `wait` xong (được `notify`) nhưng tái vào `synchronized` method/block và lock đang bị thread khác chiếm, thread lúc này vào trạng thái **BLOCKED (Blocked)**.
- Sau khi thread thực thi xong method `run()` sẽ vào trạng thái **TERMINATED (Kết thúc)**.

### Context switch là gì?

Thread trong quá trình thực thi có điều kiện và trạng thái chạy riêng (còn gọi là context) như program counter và stack info đã đề cập. Khi xảy ra các tình huống sau, thread sẽ thoát khỏi trạng thái chiếm CPU.

- Chủ động nhường CPU, ví dụ gọi `sleep()`, `wait()`, v.v.
- Time slice hết vì OS phải ngăn một thread hoặc process chiếm CPU quá lâu gây starve cho các thread/process khác.
- Gọi system interrupt loại blocking như IO request — thread bị block.
- Bị terminate hoặc kết thúc chạy.

Trong đó ba trường hợp đầu đều gây thread switch. Thread switch nghĩa là cần lưu context của thread hiện tại để thread có thể khôi phục lại lần sau khi chiếm CPU, và load context của thread tiếp theo sẽ chiếm CPU. Đây chính là **context switch**.

Context switch là chức năng cơ bản của OS hiện đại. Vì mỗi lần cần lưu và khôi phục thông tin, điều này sẽ tiêu tốn tài nguyên CPU và memory — tức hiệu quả sẽ có overhead nhất định. Nếu switch thường xuyên sẽ khiến efficiency tổng thể thấp.

### So sánh method Thread#sleep() và Object#wait()

**Điểm chung**: Cả hai đều có thể tạm dừng thực thi thread.

**Sự khác biệt**:

- **Method `sleep()` không release lock, còn method `wait()` release lock**.
- `wait()` thường dùng cho tương tác/giao tiếp giữa các thread, `sleep()` thường dùng để tạm dừng thực thi.
- Sau khi method `wait()` được gọi, thread sẽ không tự tỉnh dậy — cần thread khác gọi `notify()` hoặc `notifyAll()` trên cùng object. Method `sleep()` sau khi thực thi xong, thread tự động tỉnh dậy. Hoặc cũng có thể dùng `wait(long timeout)` — thread tự tỉnh dậy sau timeout.
- `sleep()` là static local method của class `Thread`, `wait()` là local method của class `Object`. Tại sao thiết kế như vậy? Câu hỏi tiếp theo sẽ đề cập.

### Tại sao method wait() không định nghĩa trong Thread?

`wait()` là để thread đang giữ object lock thực hiện chờ — sẽ tự động release object lock mà thread hiện tại đang chiếm. Mỗi object (`Object`) đều có object lock. Vì cần release object lock của thread hiện tại và đưa nó vào WAITING state, tự nhiên phải thao tác trên object (`Object`) tương ứng chứ không phải thread hiện tại (`Thread`).

Câu hỏi tương tự: **Tại sao method `sleep()` định nghĩa trong `Thread`?**

Vì `sleep()` là để thread hiện tại tạm dừng thực thi, không liên quan đến object class, cũng không cần lấy object lock.

### Có thể gọi trực tiếp method run của class Thread không?

Đây là câu hỏi phỏng vấn Java multi-thread kinh điển khác, thường được hỏi trong phỏng vấn. Đơn giản nhưng nhiều người không trả lời được!

`new` một `Thread` — thread vào trạng thái new. Gọi method `start()` sẽ khởi động thread và đưa thread vào trạng thái ready. Sau khi được cấp phát time slice có thể bắt đầu chạy. `start()` sẽ thực hiện công việc chuẩn bị tương ứng của thread, rồi tự động thực thi nội dung method `run()` — đây mới là multi-thread thực sự. Nhưng nếu thực thi trực tiếp method `run()`, sẽ coi `run()` như một method bình thường và thực thi trong thread đang gọi method đó — đây không phải multi-thread.

**Tóm lại: Gọi method `start()` mới khởi động được thread và đưa thread vào trạng thái ready. Thực thi trực tiếp method `run()` thì không thực thi theo cách multi-thread.**

## Multi-threading

### Sự khác biệt giữa Concurrent và Parallel

- **Concurrent (Đồng thời)**: Hai hay nhiều task thực thi trong cùng một **khoảng thời gian**.
- **Parallel (Song song)**: Hai hay nhiều task thực thi tại cùng một **thời điểm**.

Điểm quan trọng nhất là: Có **cùng lúc** thực thi không.

### Sự khác biệt giữa Synchronous và Asynchronous

- **Synchronous (Đồng bộ)**: Sau khi phát một call, trước khi nhận được kết quả thì call đó không thể return — cứ chờ.
- **Asynchronous (Bất đồng bộ)**: Sau khi call được phát ra, không cần chờ kết quả trả về — call đó return ngay.

### ⭐️Tại sao phải dùng multi-thread?

Từ góc độ tổng quát trước:

- **Từ góc độ hardware tầng dưới của máy tính**: Thread có thể coi là lightweight process — là đơn vị nhỏ nhất của thực thi program. Chi phí switch và schedule giữa các thread nhỏ hơn nhiều so với process. Hơn nữa, kỷ nguyên multi-core CPU nghĩa là nhiều thread có thể chạy đồng thời, giảm overhead context switching của thread.
- **Từ xu hướng phát triển internet hiện đại**: Hệ thống ngày nay thường yêu cầu concurrency hàng triệu hay thậm chí hàng chục triệu. Multi-thread concurrent programming chính là nền tảng để phát triển high-concurrency system. Tận dụng tốt cơ chế multi-thread có thể tăng đáng kể concurrency ability và hiệu năng tổng thể của hệ thống.

Đi sâu hơn vào hardware tầng dưới:

- **Kỷ nguyên single-core**: Trong kỷ nguyên single-core, multi-thread chủ yếu để tăng efficiency sử dụng CPU và IO system của single process. Giả sử chỉ chạy một Java process, khi request IO nếu Java process chỉ có một thread, thread bị IO block thì toàn bộ process bị block. CPU và IO device chỉ có một cái chạy, có thể nói efficiency tổng thể hệ thống chỉ 50%. Khi dùng multi-thread, một thread bị IO block, các thread khác vẫn có thể tiếp tục dùng CPU. Từ đó tăng efficiency tổng thể sử dụng tài nguyên hệ thống của Java process.
- **Kỷ nguyên multi-core**: Multi-thread chủ yếu để tăng khả năng tận dụng multi-core CPU của process. Ví dụ muốn tính toán một task phức tạp, nếu chỉ dùng một thread thì dù hệ thống có bao nhiêu CPU core cũng chỉ tận dụng được một. Còn tạo nhiều thread, các thread này có thể được map xuống nhiều CPU core ở tầng dưới để thực thi. Khi không có resource contention giữa các thread trong task, efficiency thực thi task sẽ cải thiện đáng kể, xấp xỉ bằng (thời gian thực thi trên single-core / số CPU core).

### ⭐️Single-core CPU có hỗ trợ Java multi-threading không?

Single-core CPU hỗ trợ Java multi-threading. OS thông qua time slice round-robin phân bổ CPU time cho các thread khác nhau. Dù single-core CPU mỗi lần chỉ thực thi một task, nhưng thông qua việc switch nhanh giữa các thread, user cảm giác nhiều task đang chạy đồng thời.

Tiện nói về thread scheduling mode Java dùng.

OS chủ yếu dùng hai thread scheduling mode để quản lý thực thi multi-thread:

- **Preemptive Scheduling**: OS quyết định khi nào tạm dừng thread đang chạy và switch sang thread khác. Sự switch này thường được kích hoạt bởi system clock interrupt (time slice round-robin) hay event ưu tiên cao khác (như I/O operation hoàn thành). Cách này có context switching overhead nhưng fairness và CPU resource utilization tốt, không dễ block.
- **Cooperative Scheduling**: Sau khi thread thực thi xong, chủ động thông báo hệ thống switch sang thread khác. Cách này có thể giảm performance overhead của context switching nhưng fairness kém, dễ block.

Java dùng preemptive scheduling. Tức JVM bản thân không chịu trách nhiệm thread scheduling mà ủy thác cho OS. OS thường schedule thread execution dựa trên thread priority và time slice. Thread có priority cao thường có nhiều cơ hội nhận CPU time slice hơn.

### ⭐️Chạy nhiều thread trên single-core CPU hiệu quả có nhất thiết cao hơn không?

Hiệu quả khi chạy nhiều thread đồng thời trên single-core CPU phụ thuộc vào loại thread và tính chất task. Nói chung có hai loại thread:

1. **CPU-intensive**: Thread loại này chủ yếu tính toán và xử lý logic, cần chiếm nhiều CPU resource.
2. **IO-intensive**: Thread loại này chủ yếu thao tác input/output như đọc/ghi file, network communication, v.v. Cần chờ IO device response, không chiếm nhiều CPU resource.

Trên single-core CPU, tại cùng một thời điểm chỉ có một thread chạy, các thread khác cần chờ CPU time slice được phân bổ. Nếu thread là CPU-intensive, nhiều thread chạy đồng thời sẽ dẫn đến thread switching thường xuyên, tăng overhead hệ thống và giảm efficiency. Nếu thread là IO-intensive, nhiều thread chạy đồng thời có thể tận dụng thời gian nhàn rỗi của CPU khi chờ IO — tăng efficiency.

Do đó với single-core CPU, nếu task là CPU-intensive thì mở nhiều thread sẽ ảnh hưởng efficiency. Nếu task là IO-intensive thì mở nhiều thread sẽ tăng efficiency. Tất nhiên "nhiều" ở đây cũng cần vừa phải — không thể vượt quá giới hạn hệ thống có thể chịu đựng.

### Dùng multi-thread có thể gây ra những vấn đề gì?

Mục đích của concurrent programming là để cải thiện efficiency thực thi chương trình, từ đó tăng tốc độ chạy. Nhưng concurrent programming không phải lúc nào cũng tăng tốc độ chạy. Và concurrent programming có thể gặp nhiều vấn đề như memory leak, deadlock, thread unsafe, v.v.

### Làm thế nào hiểu thread safe và thread unsafe?

Thread safe và thread unsafe là mô tả về việc truy cập cùng một dữ liệu trong multi-thread environment có đảm bảo tính đúng đắn và nhất quán hay không.

- Thread safe có nghĩa là trong multi-thread environment, bất kể có bao nhiêu thread cùng truy cập cùng một dữ liệu, đều đảm bảo tính đúng đắn và nhất quán của dữ liệu đó.
- Thread unsafe nghĩa là trong multi-thread environment, nhiều thread cùng truy cập một dữ liệu có thể dẫn đến data lộn xộn, sai hoặc mất mát.

## ⭐️Deadlock

### Thread deadlock là gì?

Thread deadlock mô tả tình huống: nhiều thread cùng bị block, một hay tất cả chúng đều chờ một resource nào đó được release. Vì thread bị block vô thời hạn, program không thể kết thúc bình thường.

Như hình dưới, thread A giữ resource 2, thread B giữ resource 1, cả hai đều muốn xin resource của bên kia — nên hai thread này sẽ chờ nhau và vào trạng thái deadlock.

![Sơ đồ thread deadlock](https://oss.javaguide.cn/github/javaguide/java/2019-4%E6%AD%BB%E9%94%811.png)

Demo deadlock qua ví dụ dưới đây — code mô phỏng tình huống deadlock trong hình (code đến từ 《The Beauty of Concurrent Programming》):

```java
public class DeadLockDemo {
    private static Object resource1 = new Object(); // Resource 1
    private static Object resource2 = new Object(); // Resource 2

    public static void main(String[] args) {
        new Thread(() -> {
            synchronized (resource1) {
                System.out.println(Thread.currentThread() + "get resource1");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread() + "waiting get resource2");
                synchronized (resource2) {
                    System.out.println(Thread.currentThread() + "get resource2");
                }
            }
        }, "Thread 1").start();

        new Thread(() -> {
            synchronized (resource2) {
                System.out.println(Thread.currentThread() + "get resource2");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread() + "waiting get resource1");
                synchronized (resource1) {
                    System.out.println(Thread.currentThread() + "get resource1");
                }
            }
        }, "Thread 2").start();
    }
}
```

Output:

```plain
Thread[Thread 1,5,main]get resource1
Thread[Thread 2,5,main]get resource2
Thread[Thread 1,5,main]waiting get resource2
Thread[Thread 2,5,main]waiting get resource1
```

Thread A qua `synchronized (resource1)` lấy được monitor lock của `resource1`, rồi dùng `Thread.sleep(1000)` cho thread A sleep 1 giây để thread B được thực thi và lấy monitor lock của resource2. Thread A và thread B sau khi sleep xong đều bắt đầu cố lấy resource của bên kia — hai thread này rơi vào trạng thái chờ nhau — deadlock xảy ra.

Ví dụ trên thỏa mãn bốn điều kiện cần thiết để sinh deadlock:

1. **Mutual exclusion condition (Điều kiện loại trừ lẫn nhau)**: Resource tại bất kỳ thời điểm nào chỉ do một thread chiếm.
2. **Hold and wait condition (Điều kiện giữ và chờ)**: Thread bị block vì request resource nhưng không nhả resource đã lấy được.
3. **No preemption condition (Điều kiện không tước đoạt)**: Resource mà thread đã lấy được không thể bị thread khác cưỡng bức tước đoạt trước khi dùng xong — chỉ khi tự dùng xong mới release.
4. **Circular wait condition (Điều kiện chờ vòng)**: Một số thread tạo thành quan hệ chờ resource đầu đuôi gắn lại với nhau.

### Làm thế nào phát hiện deadlock?

- Dùng lệnh `jmap`, `jstack`, v.v. để xem JVM thread stack và heap memory. Nếu có deadlock, output của `jstack` thường có chữ `Found one Java-level deadlock:`, theo sau là thông tin thread liên quan đến deadlock. Ngoài ra, trong dự án thực tế còn có thể kết hợp lệnh `top`, `df`, `free`, v.v. để xem tình trạng cơ bản của OS. Deadlock có thể khiến CPU, memory và tài nguyên khác tiêu thụ quá cao.
- Dùng công cụ như VisualVM, JConsole để troubleshoot.

Dưới đây demo bằng công cụ JConsole.

Trước tiên tìm thư mục bin của JDK, tìm jconsole và double-click mở.

![jconsole](https://oss.javaguide.cn/github/javaguide/java/concurrent/jdk-home-bin-jconsole.png)

Với MAC user, có thể xem thư mục cài JDK qua `/usr/libexec/java_home -V`, sau khi tìm thấy mở bằng `open . + folder address`. Ví dụ path của một JDK trên máy tôi là:

```bash
 open . /Users/guide/Library/Java/JavaVirtualMachines/corretto-1.8.0_252/Contents/Home
```

Sau khi mở jconsole, connect đến program tương ứng, vào giao diện thread và chọn detect deadlock là xong!

![jconsole phát hiện deadlock](https://oss.javaguide.cn/github/javaguide/java/concurrent/jconsole-check-deadlock.png)

![jconsole phát hiện được deadlock](https://oss.javaguide.cn/github/javaguide/java/concurrent/jconsole-check-deadlock-done.png)

### Làm thế nào ngăn chặn và tránh thread deadlock?

**Làm thế nào ngăn chặn deadlock?** Phá vỡ các điều kiện cần thiết gây deadlock là được:

1. **Phá vỡ hold and wait condition**: Xin tất cả resource một lần.
2. **Phá vỡ no preemption condition**: Khi thread đang giữ một phần resource mà xin resource khác không được, có thể chủ động release resource đang giữ.
3. **Phá vỡ circular wait condition**: Ngăn bằng cách xin resource theo thứ tự. Xin resource theo thứ tự nhất định, release theo thứ tự ngược lại. Phá vỡ circular wait condition.

**Làm thế nào tránh deadlock?**

Tránh deadlock là khi phân bổ resource, dùng thuật toán (như Banker's Algorithm) để tính toán và đánh giá việc phân bổ resource, đưa nó vào safe state.

> **Safe state** là hệ thống có thể phân bổ resource cần thiết cho mỗi thread theo một thứ tự thread progression nào đó (P1, P2, P3...Pn) cho đến khi thỏa mãn nhu cầu resource tối đa của mỗi thread, giúp mỗi thread hoàn thành thuận lợi. Gọi `<P1, P2, P3...Pn>` là safe sequence.

Sửa code của thread 2 thành như dưới đây thì sẽ không xảy ra deadlock:

```java
new Thread(() -> {
            synchronized (resource1) {
                System.out.println(Thread.currentThread() + "get resource1");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread() + "waiting get resource2");
                synchronized (resource2) {
                    System.out.println(Thread.currentThread() + "get resource2");
                }
            }
        }, "Thread 2").start();
```

Output:

```plain
Thread[Thread 1,5,main]get resource1
Thread[Thread 1,5,main]waiting get resource2
Thread[Thread 1,5,main]get resource2
Thread[Thread 2,5,main]get resource1
Thread[Thread 2,5,main]waiting get resource2
Thread[Thread 2,5,main]get resource2

Process finished with exit code 0
```

Phân tích tại sao code trên tránh được deadlock?

Thread 1 đầu tiên lấy được monitor lock của resource1 — lúc này thread 2 không lấy được. Sau đó thread 1 lấy monitor lock của resource2 — lấy được. Thread 1 release monitor lock của resource1 và resource2, thread 2 lấy được và có thể thực thi. Như vậy phá vỡ circular wait condition — tránh được deadlock.
