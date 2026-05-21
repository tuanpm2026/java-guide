---
title: Tổng Hợp Kiến Thức Cốt Lõi về Java NIO
description: "Tổng hợp toàn diện kiến thức cốt lõi về Java NIO: giải thích chi tiết ba thành phần cốt lõi Channel, Buffer, Selector, triển khai non-blocking IO, kỹ thuật zero-copy, so sánh hiệu suất với IO truyền thống."
category: Java
tag:
  - Java IO
  - Java Cơ Bản
head:
  - - meta
    - name: keywords
      content: Java NIO,Channel,Buffer,Selector,非阻塞IO,多路复用,零拷贝,NIO核心组件
---

Trước khi học NIO, bạn cần hiểu trước kiến thức lý thuyết cơ bản về mô hình I/O của máy tính. Nếu chưa biết, bạn có thể tham khảo bài viết tôi đã viết: [Giải Thích Chi Tiết Mô Hình Java IO](https://javaguide.cn/java/io/io-model.html).

## Giới thiệu NIO

Trong mô hình Java I/O truyền thống (BIO), các thao tác I/O được thực hiện theo cách blocking. Tức là khi một thread thực hiện một thao tác I/O, nó sẽ bị block cho đến khi hoàn thành. Mô hình blocking này có thể gây ra bottleneck hiệu suất khi xử lý nhiều kết nối đồng thời, vì cần tạo một thread cho mỗi kết nối, trong khi việc tạo và chuyển đổi thread đều tốn chi phí.

Để giải quyết vấn đề này, trong phiên bản Java 1.4 đã giới thiệu một mô hình I/O mới — **NIO** (New IO, còn gọi là Non-blocking IO). NIO bù đắp cho những thiếu sót của synchronous blocking I/O, nó cung cấp I/O non-blocking, hướng buffer, dựa trên channel trong code Java tiêu chuẩn, có thể dùng ít thread để xử lý nhiều kết nối, nâng cao đáng kể hiệu suất I/O và khả năng xử lý đồng thời.

Hình dưới đây là biểu đồ so sánh đơn giản về cách BIO, NIO và AIO xử lý request của client (về phần giới thiệu AIO, có thể xem bài viết của tôi: [Giải Thích Chi Tiết Mô Hình Java IO](https://javaguide.cn/java/io/io-model.html), không phải trọng tâm, chỉ cần biết qua).

![BIO、NIO 和 AIO 对比](https://oss.javaguide.cn/github/javaguide/java/nio/bio-aio-nio.png)

⚠️ Lưu ý: Sử dụng NIO không nhất thiết có nghĩa là hiệu suất cao, ưu thế hiệu suất của nó chủ yếu thể hiện trong môi trường mạng có độ đồng thời cao và độ trễ cao. Khi số lượng kết nối ít, mức độ đồng thời thấp hoặc tốc độ truyền mạng nhanh, hiệu suất của NIO không nhất thiết vượt trội hơn BIO truyền thống.

## Các thành phần cốt lõi của NIO

NIO chủ yếu bao gồm ba thành phần cốt lõi sau:

- **Buffer (vùng đệm)**: NIO đọc và ghi dữ liệu đều thực hiện thông qua buffer. Khi đọc thì điền dữ liệu từ Channel vào Buffer, còn khi ghi thì ghi dữ liệu từ Buffer vào Channel.
- **Channel (kênh)**: Channel là một kênh truyền dữ liệu hai chiều, có thể đọc và ghi. NIO thực hiện nhập xuất dữ liệu thông qua Channel. Channel là một khái niệm trừu tượng, nó có thể đại diện cho kết nối giữa file, socket hoặc các nguồn dữ liệu khác.
- **Selector (bộ chọn)**: Cho phép một thread xử lý nhiều Channel, là mô hình I/O multiplexing dựa trên event-driven. Tất cả Channel đều có thể đăng ký lên Selector, để Selector phân bổ thread xử lý các sự kiện.

Mối quan hệ giữa ba thứ như hình dưới đây (tạm thời chưa hiểu không sao, phần sau sẽ giới thiệu chi tiết):

![Buffer、Channel和Selector三者之间的关系](https://oss.javaguide.cn/github/javaguide/java/nio/channel-buffer-selector.png)

Dưới đây sẽ giới thiệu chi tiết về ba thành phần này.

### Buffer (Vùng đệm)

Trong BIO truyền thống, việc đọc ghi dữ liệu là hướng stream, chia thành byte stream và character stream.

Trong thư viện NIO của Java 1.4, tất cả dữ liệu đều được xử lý bằng buffer, đây là một sự khác biệt quan trọng so với BIO trước đó, hơi giống với buffered stream trong BIO. Khi NIO đọc dữ liệu, nó đọc trực tiếp vào buffer. Khi ghi dữ liệu, ghi vào buffer. Khi đọc ghi dữ liệu với NIO, đều thực hiện thông qua buffer.

Các lớp con của `Buffer` như hình dưới đây. Trong đó, thường dùng nhất là `ByteBuffer`, nó có thể dùng để lưu trữ và thao tác dữ liệu byte.

![Buffer 的子类](https://oss.javaguide.cn/github/javaguide/java/nio/buffer-subclasses.png)

Bạn có thể hiểu Buffer như một mảng, `IntBuffer`, `FloatBuffer`, `CharBuffer` lần lượt tương ứng với `int[]`, `float[]`, `char[]`, v.v.

Để hiểu rõ hơn về buffer, hãy xem qua bốn biến thành viên được định nghĩa trong lớp `Buffer`:

```java
public abstract class Buffer {
    // Invariants: mark <= position <= limit <= capacity
    private int mark = -1;
    private int position = 0;
    private int limit;
    private int capacity;
}
```

Ý nghĩa cụ thể của bốn biến thành viên này như sau:

1. Dung lượng (`capacity`): Lượng dữ liệu tối đa mà `Buffer` có thể lưu trữ, được thiết lập khi tạo `Buffer` và không thể thay đổi;
2. Giới hạn (`limit`): Ranh giới dữ liệu có thể đọc/ghi trong `Buffer`. Ở chế độ ghi, `limit` đại diện cho lượng dữ liệu tối đa có thể ghi, thường bằng `capacity` (có thể thiết lập qua phương thức `limit(int newLimit)`); ở chế độ đọc, `limit` bằng kích thước thực tế của dữ liệu đã ghi vào Buffer.
3. Vị trí (`position`): Vị trí (index) của dữ liệu tiếp theo có thể được đọc hoặc ghi. Khi chuyển từ chế độ ghi sang chế độ đọc (flip), `position` sẽ được đặt về 0, để có thể đọc ghi từ đầu.
4. Dấu (`mark`): `Buffer` cho phép định vị trực tiếp đến vị trí đánh dấu này, đây là thuộc tính tùy chọn;

Ngoài ra, các biến trên thỏa mãn quan hệ sau: **0 <= mark <= position <= limit <= capacity**.

Buffer có hai chế độ là chế độ đọc và chế độ ghi, lần lượt dùng để đọc dữ liệu từ Buffer hoặc ghi dữ liệu vào Buffer. Buffer sau khi được tạo mặc định ở chế độ ghi, gọi `flip()` có thể chuyển sang chế độ đọc. Nếu muốn chuyển lại sang chế độ ghi, có thể gọi phương thức `clear()` hoặc `compact()`.

![position 、limit 和 capacity 之前的关系](https://oss.javaguide.cn/github/javaguide/java/nio/JavaNIOBuffer.png)

![position 、limit 和 capacity 之前的关系](https://oss.javaguide.cn/github/javaguide/java/nio/NIOBufferClassAttributes.png)

Đối tượng `Buffer` không thể được tạo bằng cách gọi constructor thông qua `new`, chỉ có thể khởi tạo `Buffer` thông qua các static method.

Ở đây lấy `ByteBuffer` làm ví dụ để giới thiệu:

```java
// 分配堆内存
public static ByteBuffer allocate(int capacity);
// 分配直接内存
public static ByteBuffer allocateDirect(int capacity);
```

Hai phương thức cốt lõi nhất của Buffer:

1. `get`: Đọc dữ liệu từ buffer
2. `put`: Ghi dữ liệu vào buffer

Ngoài hai phương thức trên, các phương thức quan trọng khác:

- `flip`: Chuyển buffer từ chế độ ghi sang chế độ đọc, nó sẽ đặt giá trị của `limit` bằng giá trị `position` hiện tại, và đặt giá trị của `position` về 0.
- `clear`: Xóa buffer, chuyển buffer từ chế độ đọc sang chế độ ghi, và đặt giá trị của `position` về 0, đặt giá trị của `limit` bằng giá trị của `capacity`.
- ……

Quá trình thay đổi dữ liệu trong Buffer:

```java
import java.nio.*;

public class CharBufferDemo {
    public static void main(String[] args) {
        // 分配一个容量为8的CharBuffer
        CharBuffer buffer = CharBuffer.allocate(8);
        System.out.println("初始状态：");
        printState(buffer);

        // 向buffer写入3个字符
        buffer.put('a').put('b').put('c');
        System.out.println("写入3个字符后的状态：");
        printState(buffer);

        // 调用flip()方法，准备读取buffer中的数据，将 position 置 0,limit 的置 3
        buffer.flip();
        System.out.println("调用flip()方法后的状态：");
        printState(buffer);

        // 读取字符
        while (buffer.hasRemaining()) {
            System.out.print(buffer.get());
        }

        // 调用clear()方法，清空缓冲区，将 position 的值置为 0，将 limit 的值置为 capacity 的值
        buffer.clear();
        System.out.println("调用clear()方法后的状态：");
        printState(buffer);

    }

    // 打印buffer的capacity、limit、position、mark的位置
    private static void printState(CharBuffer buffer) {
        System.out.print("capacity: " + buffer.capacity());
        System.out.print(", limit: " + buffer.limit());
        System.out.print(", position: " + buffer.position());
        System.out.print(", mark 开始读取的字符: " + buffer.mark());
        System.out.println("\n");
    }
}
```

Kết quả đầu ra:

```bash
初始状态：
capacity: 8, limit: 8, position: 0

写入3个字符后的状态：
capacity: 8, limit: 8, position: 3

准备读取buffer中的数据！

调用flip()方法后的状态：
capacity: 8, limit: 3, position: 0

读取到的数据：abc

调用clear()方法后的状态：
capacity: 8, limit: 8, position: 0
```

Để giúp hiểu, tôi đã vẽ một hình ảnh thể hiện sự thay đổi của `capacity`, `limit` và `position` ở từng giai đoạn.

![capacity、limit和position每一阶段的变化](https://oss.javaguide.cn/github/javaguide/java/nio/NIOBufferClassAttributesDataChanges.png)

### Channel (Kênh)

Channel là một kênh, nó thiết lập kết nối với nguồn dữ liệu (như file, network socket, v.v.). Chúng ta có thể dùng nó để đọc và ghi dữ liệu, giống như mở một ống dẫn nước, để dữ liệu chảy tự do trong Channel.

Stream trong BIO là một chiều, chia thành các `InputStream` (luồng đầu vào) và `OutputStream` (luồng đầu ra) khác nhau, dữ liệu chỉ truyền theo một hướng. Điểm khác biệt giữa channel và stream là channel là hai chiều, nó có thể dùng để đọc, ghi hoặc đồng thời đọc ghi.

Channel tương tác với Buffer đã giới thiệu ở trên, khi đọc thì điền dữ liệu từ Channel vào Buffer, còn khi ghi thì ghi dữ liệu từ Buffer vào Channel.

![Channel 和 Buffer之间的关系](https://oss.javaguide.cn/github/javaguide/java/nio/channel-buffer.png)

Ngoài ra, vì Channel là full-duplex nên nó có thể ánh xạ tốt hơn các API của hệ điều hành nền. Đặc biệt trong mô hình lập trình mạng UNIX, các channel của hệ điều hành nền đều là full-duplex, hỗ trợ đồng thời cả đọc và ghi.

Các lớp con của `Channel` như hình dưới đây.

![Channel 的子类](https://oss.javaguide.cn/github/javaguide/java/nio/channel-subclasses.png)

Trong đó, các loại channel thường dùng nhất là:

- `FileChannel`: Channel truy cập file;
- `SocketChannel`, `ServerSocketChannel`: Channel giao tiếp TCP;
- `DatagramChannel`: Channel giao tiếp UDP;

![Channel继承关系图](https://oss.javaguide.cn/github/javaguide/java/nio/channel-inheritance-relationship.png)

Hai phương thức cốt lõi nhất của Channel:

1. `read`: Đọc dữ liệu và ghi vào Buffer.
2. `write`: Ghi dữ liệu từ Buffer vào Channel.

Ở đây chúng ta dùng `FileChannel` làm ví dụ để demo cách đọc dữ liệu file.

```java
RandomAccessFile reader = new RandomAccessFile("/Users/guide/Documents/test_read.in", "r");
FileChannel channel = reader.getChannel();
ByteBuffer buffer = ByteBuffer.allocate(1024);
channel.read(buffer);
```

### Selector (Bộ chọn)

Selector (bộ chọn) là một thành phần quan trọng trong NIO, nó cho phép một thread xử lý nhiều Channel. Selector dựa trên mô hình I/O multiplexing event-driven, nguyên lý hoạt động chính là: thông qua Selector đăng ký sự kiện của channel, Selector sẽ liên tục poll các Channel đã đăng ký trên nó. Khi sự kiện xảy ra, ví dụ như: có kết nối TCP mới đến trên một Channel, sự kiện đọc và ghi, Channel đó sẽ ở trạng thái sẵn sàng và được Selector poll ra. Selector sẽ thêm các Channel liên quan vào tập hợp sẵn sàng. Thông qua SelectionKey có thể lấy tập hợp Channel sẵn sàng, sau đó thực hiện các thao tác I/O tương ứng trên các Channel sẵn sàng đó.

![Selector 选择器工作示意图](https://oss.javaguide.cn/github/javaguide/java/nio/selector-channel-selectionkey.png)

Một Selector multiplexer có thể đồng thời poll nhiều Channel, vì JDK dùng `epoll()` thay thế cho triển khai `select` truyền thống, nên nó không có giới hạn connection handle tối đa `1024/2048`. Điều này có nghĩa là chỉ cần một thread phụ trách việc poll của Selector, có thể tiếp nhận hàng ngàn client.

Selector có thể lắng nghe bốn loại sự kiện sau:

1. `SelectionKey.OP_ACCEPT`: Biểu thị sự kiện channel chấp nhận kết nối, thường dùng cho `ServerSocketChannel`.
2. `SelectionKey.OP_CONNECT`: Biểu thị sự kiện channel hoàn thành kết nối, thường dùng cho `SocketChannel`.
3. `SelectionKey.OP_READ`: Biểu thị sự kiện channel sẵn sàng để đọc, tức là có dữ liệu có thể đọc.
4. `SelectionKey.OP_WRITE`: Biểu thị sự kiện channel sẵn sàng để ghi, tức là có thể ghi dữ liệu.

`Selector` là lớp abstract, có thể tạo instance Selector bằng cách gọi static method `open()` của lớp này. Selector có thể đồng thời giám sát trạng thái `IO` của nhiều `SelectableChannel`, là cốt lõi của non-blocking `IO`.

Một instance Selector có ba tập hợp `SelectionKey`:

1. Tập hợp tất cả `SelectionKey`: Đại diện cho tất cả `Channel` đã đăng ký trên Selector đó, tập hợp này có thể được trả về thông qua phương thức `keys()`.
2. Tập hợp `SelectionKey` được chọn: Đại diện cho tất cả Channel cần xử lý `IO` có thể lấy được thông qua phương thức `select()`, tập hợp này có thể được trả về thông qua `selectedKeys()`.
3. Tập hợp `SelectionKey` đã bị hủy: Đại diện cho tất cả `Channel` đã hủy đăng ký, trong lần thực thi phương thức `select()` tiếp theo, `SelectionKey` tương ứng với các `Channel` này sẽ bị xóa hoàn toàn, chương trình thường không cần truy cập trực tiếp tập hợp này và cũng không có phương thức để truy cập.

Demo đơn giản cách duyệt qua tập hợp `SelectionKey` được chọn và xử lý:

```java
Set<SelectionKey> selectedKeys = selector.selectedKeys();
Iterator<SelectionKey> keyIterator = selectedKeys.iterator();
while (keyIterator.hasNext()) {
    SelectionKey key = keyIterator.next();
    if (key != null) {
        if (key.isAcceptable()) {
            // ServerSocketChannel 接收了一个新连接
        } else if (key.isConnectable()) {
            // 表示一个新连接建立
        } else if (key.isReadable()) {
            // Channel 有准备好的数据，可以读取
        } else if (key.isWritable()) {
            // Channel 有空闲的 Buffer，可以写入数据
        }
    }
    keyIterator.remove();
}
```

Selector cũng cung cấp một loạt phương thức liên quan đến `select()`:

- `int select()`: Giám sát tất cả `Channel` đã đăng ký, khi có thao tác `IO` cần xử lý trong số đó, phương thức này sẽ trả về và thêm `SelectionKey` tương ứng vào tập hợp `SelectionKey` được chọn, phương thức này trả về số lượng `Channel` đó.
- `int select(long timeout)`: Thao tác `select()` có thể thiết lập thời gian timeout.
- `int selectNow()`: Thực hiện thao tác `select()` trả về ngay lập tức, so với phương thức `select()` không có tham số, phương thức này sẽ không block thread.
- `Selector wakeup()`: Khiến một phương thức `select()` chưa trả về lập tức trả về.
- ……

Ví dụ đơn giản sử dụng Selector để đọc ghi qua mạng:

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
import java.util.Set;

public class NioSelectorExample {

  public static void main(String[] args) {
    try {
      ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
      serverSocketChannel.configureBlocking(false);
      serverSocketChannel.socket().bind(new InetSocketAddress(8080));

      Selector selector = Selector.open();
      // 将 ServerSocketChannel 注册到 Selector 并监听 OP_ACCEPT 事件
      serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);

      while (true) {
        int readyChannels = selector.select();

        if (readyChannels == 0) {
          continue;
        }

        Set<SelectionKey> selectedKeys = selector.selectedKeys();
        Iterator<SelectionKey> keyIterator = selectedKeys.iterator();

        while (keyIterator.hasNext()) {
          SelectionKey key = keyIterator.next();

          if (key.isAcceptable()) {
            // 处理连接事件
            ServerSocketChannel server = (ServerSocketChannel) key.channel();
            SocketChannel client = server.accept();
            client.configureBlocking(false);

            // 将客户端通道注册到 Selector 并监听 OP_READ 事件
            client.register(selector, SelectionKey.OP_READ);
          } else if (key.isReadable()) {
            // 处理读事件
            SocketChannel client = (SocketChannel) key.channel();
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            int bytesRead = client.read(buffer);

            if (bytesRead > 0) {
              buffer.flip();
              System.out.println("收到数据：" +new String(buffer.array(), 0, bytesRead));
              // 将客户端通道注册到 Selector 并监听 OP_WRITE 事件
              client.register(selector, SelectionKey.OP_WRITE);
            } else if (bytesRead < 0) {
              // 客户端断开连接
              client.close();
            }
          } else if (key.isWritable()) {
            // 处理写事件
            SocketChannel client = (SocketChannel) key.channel();
            ByteBuffer buffer = ByteBuffer.wrap("Hello, Client!".getBytes());
            client.write(buffer);

            // 将客户端通道注册到 Selector 并监听 OP_READ 事件
            client.register(selector, SelectionKey.OP_READ);
          }

          keyIterator.remove();
        }
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
```

Trong ví dụ, chúng ta đã tạo một server đơn giản, lắng nghe cổng 8080, sử dụng Selector để xử lý các sự kiện kết nối, đọc và ghi. Khi nhận được dữ liệu từ client, server sẽ đọc dữ liệu và in ra console, sau đó phản hồi client với "Hello, Client!".

## Zero-Copy trong NIO

Zero-copy là một biện pháp phổ biến để nâng cao hiệu suất thao tác IO, các dự án open source hàng đầu như ActiveMQ, Kafka, RocketMQ, QMQ, Netty đều sử dụng zero-copy.

Zero-copy có nghĩa là khi máy tính thực hiện thao tác IO, CPU không cần sao chép dữ liệu từ vùng lưu trữ này sang vùng lưu trữ khác, nhờ đó có thể giảm context switch và thời gian copy của CPU. Tức là zero-copy chủ yếu giải quyết vấn đề sao chép dữ liệu liên tục khi hệ điều hành xử lý thao tác I/O. Các kỹ thuật triển khai zero-copy phổ biến là: `mmap+write`, `sendfile` và `sendfile + DMA gather copy`.

Hình dưới đây thể hiện biểu đồ so sánh các kỹ thuật zero-copy khác nhau:

|                            | CPU copy | DMA copy | System call | Context switch |
| -------------------------- | -------- | -------- | ----------- | -------------- |
| Phương pháp truyền thống   | 2        | 2        | read+write  | 4              |
| mmap+write                 | 1        | 2        | mmap+write  | 4              |
| sendfile                   | 1        | 2        | sendfile    | 2              |
| sendfile + DMA gather copy | 0        | 2        | sendfile    | 2              |

Có thể thấy rằng, dù là phương pháp I/O truyền thống hay sau khi áp dụng zero-copy, 2 lần DMA (Direct Memory Access) copy đều không thể tránh khỏi. Vì hai lần DMA đều phụ thuộc vào phần cứng để thực hiện. Zero-copy chủ yếu là giảm bớt CPU copy và context switch.

Hỗ trợ zero-copy của Java:

- `MappedByteBuffer` là một triển khai mà NIO cung cấp dựa trên kỹ thuật zero-copy memory mapping (`mmap`), bên dưới thực tế là gọi system call `mmap` của Linux kernel. Nó có thể ánh xạ một file hoặc một phần file vào bộ nhớ, tạo thành một file bộ nhớ ảo, nhờ đó có thể thao tác trực tiếp dữ liệu trong bộ nhớ mà không cần system call để đọc ghi file.
- `transferTo()/transferFrom()` của `FileChannel` là một triển khai mà NIO cung cấp dựa trên kỹ thuật zero-copy send file (`sendfile`), bên dưới thực tế là gọi system call `sendfile` của Linux kernel. Nó có thể truyền dữ liệu file trực tiếp từ disk đến network mà không cần qua buffer của user space. Về cách dùng `FileChannel` có thể xem bài viết: [Java NIO 文件通道 FileChannel 用法](https://www.cnblogs.com/robothy/p/14235598.html).

Ví dụ code:

```java
private void loadFileIntoMemory(File xmlFile) throws IOException {
  FileInputStream fis = new FileInputStream(xmlFile);
  // 创建 FileChannel 对象
  FileChannel fc = fis.getChannel();
  // FileChannel.map() 将文件映射到直接内存并返回 MappedByteBuffer 对象
  MappedByteBuffer mmb = fc.map(FileChannel.MapMode.READ_ONLY, 0, fc.size());
  xmlFileBuffer = new byte[(int)fc.size()];
  mmb.get(xmlFileBuffer);
  fis.close();
}
```

## Tổng kết

Bài viết này chủ yếu giới thiệu các điểm kiến thức cốt lõi của NIO, bao gồm các thành phần cốt lõi của NIO và zero-copy.

Nếu chúng ta cần dùng NIO để xây dựng chương trình mạng, không nên dùng trực tiếp NIO thuần, vì lập trình phức tạp và chức năng quá yếu. Khuyến nghị sử dụng một số framework lập trình mạng dựa trên NIO đã chín muồi như Netty. Netty đã thực hiện một số tối ưu hóa và mở rộng trên nền NIO như hỗ trợ nhiều giao thức, hỗ trợ SSL/TLS, v.v.

## Tham khảo

- Java NIO 浅析：<https://tech.meituan.com/2016/11/04/nio.html>

- 面试官：Java NIO 了解？<https://mp.weixin.qq.com/s/mZobf-U8OSYQfHfYBEB6KA>

- Java NIO：Buffer、Channel 和 Selector：<https://www.javadoop.com/post/java-nio>

<!-- @include: @article-footer.snippet.md -->
