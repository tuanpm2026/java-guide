---
title: Tổng hợp các công cụ giám sát và xử lý sự cố JDK
description: Tổng hợp các công cụ giám sát và xử lý lỗi phổ biến của JDK kèm ví dụ sử dụng, hỗ trợ định vị và phân tích sự cố JVM.
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: JDK 工具,jps,jstat,jmap,jstack,jvisualvm,诊断,监控
---

## Công cụ dòng lệnh JDK

Các lệnh này nằm trong thư mục bin của thư mục cài đặt JDK:

- **`jps`** (JVM Process Status): tương tự lệnh `ps` trên UNIX. Dùng để xem thông tin về tất cả các tiến trình Java đang chạy, bao gồm tên lớp khởi động, tham số đầu vào và tham số JVM;
- **`jstat`** (JVM Statistics Monitoring Tool): dùng để thu thập dữ liệu vận hành của các khía cạnh khác nhau trong HotSpot Virtual Machine;
- **`jinfo`** (Configuration Info for Java): hiển thị thông tin cấu hình của máy ảo;
- **`jmap`** (Memory Map for Java): tạo snapshot heap dump;
- **`jhat`** (JVM Heap Dump Browser): dùng để phân tích file heapdump, nó sẽ tạo một máy chủ HTTP/HTML để người dùng xem kết quả phân tích trên trình duyệt. JDK9 đã loại bỏ jhat;
- **`jstack`** (Stack Trace for Java): tạo snapshot luồng tại thời điểm hiện tại của máy ảo — snapshot luồng là tập hợp stack phương thức đang thực thi của mỗi luồng trong máy ảo.

### `jps`: Xem tất cả tiến trình Java

Lệnh `jps` (JVM Process Status) tương tự lệnh `ps` trên UNIX.

`jps`: hiển thị tên lớp main của máy ảo và Local Virtual Machine Identifier (LVMID) của các tiến trình. `jps -q`: chỉ xuất LVMID của tiến trình.

```powershell
C:\Users\SnailClimb>jps
7360 NettyClient2
17396
7972 Launcher
16504 Jps
17340 NettyServer
```

`jps -l`: xuất tên đầy đủ của lớp main; nếu tiến trình chạy từ file Jar thì xuất đường dẫn Jar.

```powershell
C:\Users\SnailClimb>jps -l
7360 firstNettyDemo.NettyClient2
17396
7972 org.jetbrains.jps.cmdline.Launcher
16492 sun.tools.jps.Jps
17340 firstNettyDemo.NettyServer
```

`jps -v`: xuất các tham số JVM khi khởi động tiến trình máy ảo.

`jps -m`: xuất tham số truyền vào hàm main() của tiến trình Java.

### `jstat`: Giám sát các thông tin trạng thái vận hành của máy ảo

jstat (JVM Statistics Monitoring Tool) là công cụ dòng lệnh dùng để giám sát các thông tin trạng thái vận hành của máy ảo. Nó có thể hiển thị thông tin về class, bộ nhớ, thu gom rác, biên dịch JIT v.v. của tiến trình máy ảo local hoặc remote (yêu cầu máy chủ remote hỗ trợ RMI). Trên các máy chủ không có GUI, chỉ có môi trường console thuần văn bản, đây sẽ là công cụ đầu tiên được chọn để định vị vấn đề hiệu suất máy ảo trong runtime.

**Cú pháp lệnh `jstat`:**

```powershell
jstat -<option> [-t] [-h<lines>] <vmid> [<interval> [<count>]]
```

Ví dụ `jstat -gc -h3 31736 1000 10` có nghĩa là phân tích tình trạng GC của tiến trình id 31736, in kết quả mỗi 1000ms, dừng sau 10 lần in, in tiêu đề chỉ số sau mỗi 3 dòng.

**Các option thông dụng:**

- `jstat -class vmid`: hiển thị thông tin liên quan đến ClassLoader;
- `jstat -compiler vmid`: hiển thị thông tin liên quan đến biên dịch JIT;
- `jstat -gc vmid`: hiển thị thông tin heap liên quan đến GC;
- `jstat -gccapacity vmid`: hiển thị dung lượng và mức sử dụng của từng thế hệ;
- `jstat -gcnew vmid`: hiển thị thông tin thế hệ mới (Young Generation);
- `jstat -gcnewcapcacity vmid`: hiển thị kích thước và mức sử dụng của thế hệ mới;
- `jstat -gcold vmid`: hiển thị thống kê hành vi của thế hệ cũ và thế hệ vĩnh viễn; từ jdk1.8 trở đi, option này chỉ biểu thị thế hệ cũ vì thế hệ vĩnh viễn đã bị loại bỏ;
- `jstat -gcoldcapacity vmid`: hiển thị kích thước của thế hệ cũ;
- `jstat -gcpermcapacity vmid`: hiển thị kích thước thế hệ vĩnh viễn; từ jdk1.8 trở đi, option này không còn tồn tại vì thế hệ vĩnh viễn đã bị loại bỏ;
- `jstat -gcutil vmid`: hiển thị thông tin thu gom rác;

Ngoài ra, thêm tham số `-t` có thể thêm cột Timestamp vào đầu ra, hiển thị thời gian chạy của chương trình.

### `jinfo`: Xem và điều chỉnh các tham số máy ảo theo thời gian thực

`jinfo vmid`: xuất tất cả tham số và thuộc tính hệ thống của tiến trình jvm hiện tại (phần đầu là thuộc tính hệ thống, phần sau là tham số JVM).

`jinfo -flag name vmid`: xuất giá trị cụ thể của tham số theo tên. Ví dụ xuất MaxHeapSize, kiểm tra tiến trình jvm hiện tại có bật in log GC không (`-XX:PrintGCDetails`: chế độ log GC chi tiết, cả hai đều tắt mặc định).

```powershell
C:\Users\SnailClimb>jinfo  -flag MaxHeapSize 17340
-XX:MaxHeapSize=2124414976
C:\Users\SnailClimb>jinfo  -flag PrintGC 17340
-XX:-PrintGC
```

Sử dụng jinfo có thể thay đổi tham số jvm một cách động mà không cần khởi động lại máy ảo. Điều này đặc biệt hữu ích trong môi trường production, xem ví dụ dưới đây:

`jinfo -flag [+|-]name vmid`: bật hoặc tắt tham số theo tên.

```powershell
C:\Users\SnailClimb>jinfo  -flag  PrintGC 17340
-XX:-PrintGC

C:\Users\SnailClimb>jinfo  -flag  +PrintGC 17340

C:\Users\SnailClimb>jinfo  -flag  PrintGC 17340
-XX:+PrintGC
```

### `jmap`: Tạo snapshot heap dump

Lệnh `jmap` (Memory Map for Java) dùng để tạo snapshot heap dump. Nếu không dùng lệnh `jmap`, để lấy Java heap dump có thể dùng tham số `"-XX:+HeapDumpOnOutOfMemoryError"` để máy ảo tự động tạo file dump sau khi xảy ra ngoại lệ OOM. Trên Linux, cũng có thể lấy file dump bằng cách gửi tín hiệu thoát tiến trình qua `kill -3`.

`jmap` không chỉ dùng để lấy file dump — nó còn có thể truy vấn hàng đợi thực thi finalizer, thông tin chi tiết về Java heap và thế hệ vĩnh viễn, như tỷ lệ sử dụng không gian, loại collector đang dùng v.v. Giống `jinfo`, nhiều tính năng của `jmap` cũng bị hạn chế trên nền tảng Windows.

Ví dụ: xuất snapshot heap của ứng dụng chỉ định ra desktop. Sau đó có thể phân tích file heap bằng các công cụ như jhat, Visual VM.

```powershell
C:\Users\SnailClimb>jmap -dump:format=b,file=C:\Users\SnailClimb\Desktop\heap.hprof 17340
Dumping heap to C:\Users\SnailClimb\Desktop\heap.hprof ...
Heap dump file created
```

### **`jhat`**: Phân tích file heapdump

**`jhat`** dùng để phân tích file heapdump, nó sẽ tạo một máy chủ HTTP/HTML để người dùng xem kết quả phân tích trên trình duyệt.

```powershell
C:\Users\SnailClimb>jhat C:\Users\SnailClimb\Desktop\heap.hprof
Reading from C:\Users\SnailClimb\Desktop\heap.hprof...
Dump file created Sat May 04 12:30:31 CST 2019
Snapshot read, resolving...
Resolving 131419 objects...
Chasing references, expect 26 dots..........................
Eliminating duplicate references..........................
Snapshot resolved.
Started HTTP server on port 7000
Server is ready.
```

Truy cập <http://localhost:7000/>

Lưu ý: JDK9 đã loại bỏ jhat ([JEP 241: Remove the jhat Tool](https://openjdk.org/jeps/241)). Bạn có thể dùng các công cụ thay thế được khuyến nghị chính thức là Eclipse Memory Analyzer Tool (MAT) và VisualVM.

### **`jstack`**: Tạo snapshot luồng tại thời điểm hiện tại của máy ảo

Lệnh `jstack` (Stack Trace for Java) dùng để tạo snapshot luồng tại thời điểm hiện tại của máy ảo. Snapshot luồng là tập hợp stack phương thức đang thực thi của mỗi luồng trong máy ảo hiện tại.

Mục đích chính của việc tạo snapshot luồng là xác định nguyên nhân luồng bị dừng trong thời gian dài, chẳng hạn như deadlock giữa các luồng, vòng lặp vô tận, chờ tài nguyên bên ngoài trong thời gian dài v.v. Khi luồng bị dừng, dùng `jstack` để xem call stack của từng luồng, từ đó biết luồng không phản hồi đang làm gì ở background hoặc đang chờ tài nguyên gì.

**Dưới đây là đoạn code tạo deadlock giữa các luồng. Chúng ta sẽ dùng lệnh `jstack` để kiểm tra deadlock, xuất thông tin deadlock và tìm ra luồng xảy ra deadlock.**

```java
public class DeadLockDemo {
    private static Object resource1 = new Object();//资源 1
    private static Object resource2 = new Object();//资源 2

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
        }, "线程 1").start();

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
        }, "线程 2").start();
    }
}
```

Output

```plain
Thread[线程 1,5,main]get resource1
Thread[线程 2,5,main]get resource2
Thread[线程 1,5,main]waiting get resource2
Thread[线程 2,5,main]waiting get resource1
```

Luồng A lấy được monitor lock của resource1 qua synchronized (resource1), sau đó dùng `Thread.sleep(1000)` để cho luồng A ngủ 1 giây nhằm cho luồng B có cơ hội chạy và lấy monitor lock của resource2. Khi cả luồng A và luồng B thức dậy, cả hai đều cố gắng lấy tài nguyên của nhau, dẫn đến tình trạng chờ nhau vô tận — đây chính là deadlock.

**Phân tích bằng lệnh `jstack`:**

```powershell
C:\Users\SnailClimb>jps
13792 KotlinCompileDaemon
7360 NettyClient2
17396
7972 Launcher
8932 Launcher
9256 DeadLockDemo
10764 Jps
17340 NettyServer

C:\Users\SnailClimb>jstack 9256
```

Một phần kết quả đầu ra như sau:

```powershell
Found one Java-level deadlock:
=============================
"线程 2":
  waiting to lock monitor 0x000000000333e668 (object 0x00000000d5efe1c0, a java.lang.Object),
  which is held by "线程 1"
"线程 1":
  waiting to lock monitor 0x000000000333be88 (object 0x00000000d5efe1d0, a java.lang.Object),
  which is held by "线程 2"

Java stack information for the threads listed above:
===================================================
"线程 2":
        at DeadLockDemo.lambda$main$1(DeadLockDemo.java:31)
        - waiting to lock <0x00000000d5efe1c0> (a java.lang.Object)
        - locked <0x00000000d5efe1d0> (a java.lang.Object)
        at DeadLockDemo$$Lambda$2/1078694789.run(Unknown Source)
        at java.lang.Thread.run(Thread.java:748)
"线程 1":
        at DeadLockDemo.lambda$main$0(DeadLockDemo.java:16)
        - waiting to lock <0x00000000d5efe1d0> (a java.lang.Object)
        - locked <0x00000000d5efe1c0> (a java.lang.Object)
        at DeadLockDemo$$Lambda$1/1324119927.run(Unknown Source)
        at java.lang.Thread.run(Thread.java:748)

Found 1 deadlock.
```

Có thể thấy lệnh `jstack` đã giúp chúng ta tìm ra thông tin cụ thể về luồng xảy ra deadlock.

## Công cụ phân tích trực quan JDK

### JConsole: Bảng điều khiển giám sát và quản lý Java

JConsole là công cụ giám sát và quản lý trực quan dựa trên JMX. Nó có thể giám sát thuận tiện mức sử dụng bộ nhớ của tiến trình Java trên máy local và remote. Bạn có thể khởi động bằng lệnh `jconsole` trong console hoặc tìm `jconsole.exe` trong thư mục bin của JDK và double-click để chạy.

#### Kết nối Jconsole

![Kết nối Jconsole](./pictures/jdk监控和故障处理工具总结/1JConsole连接.png)

Nếu cần dùng JConsole để kết nối tiến trình remote, hãy thêm các tham số sau khi khởi động chương trình Java remote:

```properties
-Djava.rmi.server.hostname=外网访问 ip 地址
-Dcom.sun.management.jmxremote.port=60001   //监控的端口号
-Dcom.sun.management.jmxremote.authenticate=false   //关闭认证
-Dcom.sun.management.jmxremote.ssl=false
```

Khi kết nối bằng JConsole, địa chỉ tiến trình remote như sau:

```plain
外网访问 ip 地址:60001
```

#### Xem tổng quan chương trình Java

![Xem tổng quan chương trình Java](./pictures/jdk监控和故障处理工具总结/2查看Java程序概况.png)

#### Giám sát bộ nhớ

JConsole có thể hiển thị thông tin chi tiết về bộ nhớ hiện tại. Không chỉ bao gồm thông tin tổng thể về heap memory/non-heap memory, mà còn có thể xem chi tiết mức sử dụng của từng vùng như eden, survivor, như hình dưới đây.

Nhấn nút "Thực thi GC (G)" bên phải để buộc ứng dụng thực hiện một Full GC.

> - **GC thế hệ mới (Minor GC)**: chỉ hoạt động thu gom rác xảy ra ở thế hệ mới, Minor GC rất thường xuyên và tốc độ thu hồi thường khá nhanh.
> - **GC thế hệ cũ (Major GC/Full GC)**: chỉ hoạt động GC xảy ra ở thế hệ cũ, khi xuất hiện Major GC thường đi kèm ít nhất một lần Minor GC (không tuyệt đối), tốc độ Major GC thường chậm hơn Minor GC ít nhất 10 lần.

![Giám sát bộ nhớ](./pictures/jdk监控和故障处理工具总结/3内存监控.png)

#### Giám sát luồng

Tương tự lệnh `jstack` đã đề cập ở trên, nhưng ở dạng trực quan.

Phía dưới có nút "Phát hiện Deadlock (D)", nhấn vào đó có thể tự động tìm luồng xảy ra deadlock và thông tin chi tiết của chúng.

![Giám sát luồng](./pictures/jdk监控和故障处理工具总结/4线程监控.png)

### Visual VM: Công cụ xử lý sự cố đa năng

VisualVM cung cấp thông tin chi tiết về các ứng dụng Java đang chạy trên Java Virtual Machine (JVM). Trong giao diện đồ họa của VisualVM, bạn có thể xem thông tin liên quan đến nhiều ứng dụng Java một cách thuận tiện và nhanh chóng. Trang chủ Visual VM: <https://visualvm.github.io/>. Tài liệu tiếng Trung Visual VM: <https://visualvm.github.io/documentation.html>.

Đoạn dưới đây trích từ cuốn "Hiểu sâu về Java Virtual Machine".

> VisualVM (All-in-One Java Troubleshooting Tool) là chương trình giám sát vận hành và xử lý sự cố mạnh nhất được phát hành kèm JDK cho đến nay. Tài liệu phần mềm chính thức của VisualVM có ghi mô tả "All-in-One", ngụ ý rằng ngoài giám sát vận hành và xử lý sự cố, nó còn cung cấp nhiều tính năng khác như phân tích hiệu suất (Profiling). Tính năng phân tích hiệu suất của VisualVM thậm chí không thua kém so với các công cụ Profiling chuyên nghiệp có tính phí như JProfiler, YourKit. Hơn nữa, VisualVM còn có một ưu điểm lớn: chương trình được giám sát không cần chạy dựa trên Agent đặc biệt, do đó ảnh hưởng đến hiệu suất thực tế của ứng dụng rất nhỏ, có thể áp dụng trực tiếp trong môi trường production. Đây là ưu điểm mà JProfiler, YourKit và các công cụ khác không thể sánh bằng.

VisualVM được phát triển dựa trên nền tảng NetBeans, do đó ngay từ đầu nó đã có tính năng mở rộng plugin. Thông qua hỗ trợ mở rộng plugin, VisualVM có thể:

- Hiển thị tiến trình máy ảo cùng thông tin cấu hình và môi trường của tiến trình (jps, jinfo).
- Giám sát thông tin CPU, GC, heap, method area và luồng của ứng dụng (jstat, jstack).
- Dump và phân tích snapshot heap dump (jmap, jhat).
- Phân tích hiệu suất chạy chương trình ở cấp độ phương thức, tìm phương thức được gọi nhiều nhất và chạy lâu nhất.
- Snapshot chương trình offline: thu thập cấu hình runtime, thread dump, memory dump v.v. của chương trình để tạo snapshot, có thể gửi snapshot cho developer để phản hồi Bug.
- Vô số khả năng từ các plugin khác...

Ở đây không giới thiệu chi tiết cách dùng VisualVM. Nếu muốn tìm hiểu, có thể xem:

- <https://visualvm.github.io/documentation.html>
- <https://www.ibm.com/developerworks/cn/java/j-lo-visualvm/index.html>

### MAT: Công cụ phân tích bộ nhớ

MAT (Memory Analyzer Tool) là công cụ phân tích offline heap memory JVM nhanh, tiện lợi và đầy đủ tính năng. Nó hiển thị trạng thái snapshot heap dump được ghi lại khi JVM gặp sự cố (cũng có thể thực hiện phân tích heap dump trong lúc chạy bình thường), giúp định vị vấn đề rò rỉ bộ nhớ hoặc tối ưu hóa logic tiêu thụ bộ nhớ lớn.

Khi gặp vấn đề OOM và GC, tôi thường chọn MAT để phân tích file dump trước tiên — đây cũng là kịch bản được ứng dụng nhiều nhất của công cụ này.

Để tìm hiểu chi tiết về MAT, khuyến nghị hai bài viết sau đây, được viết rất hay:

- [Hướng dẫn chuyên sâu và thực hành công cụ phân tích bộ nhớ JVM MAT — Phần nhập môn](https://juejin.cn/post/6908665391136899079)
- [Hướng dẫn chuyên sâu và thực hành công cụ phân tích bộ nhớ JVM MAT — Phần nâng cao](https://juejin.cn/post/6911624328472133646)

<!-- @include: @article-footer.snippet.md -->
