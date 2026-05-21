---
title: Tổng hợp Design Patterns trong Java IO
description: Phân tích sâu các design patterns trong Java IO: giải thích chi tiết ứng dụng Decorator Pattern trong BufferedInputStream, Adapter Pattern trong InputStreamReader, Template Method Pattern trong InputStream, hiểu kiến trúc thư viện class Java IO.
category: Java
tag:
  - Java IO
  - Java Basics
head:
  - - meta
    - name: keywords
      content: Java IO design patterns,decorator pattern,adapter pattern,template method pattern,FilterInputStream,IO stream design
---

Bài viết này chúng ta cùng xem qua các ứng dụng design patterns mà chúng ta có thể học từ IO.

## Decorator Pattern

**Decorator Pattern** có thể mở rộng tính năng của object gốc mà không cần thay đổi nó.

Decorator Pattern dùng composition thay vì inheritance để mở rộng tính năng của original class, đặc biệt hữu dụng trong các scenarios có quan hệ kế thừa phức tạp (như IO, quan hệ kế thừa giữa các classes khá phức tạp).

Đối với byte streams, `FilterInputStream` (tương ứng input stream) và `FilterOutputStream` (tương ứng output stream) là core của Decorator Pattern, được dùng để tăng cường tính năng của các subclass objects của `InputStream` và `OutputStream`.

`BufferedInputStream` (byte buffered input stream), `DataInputStream`... đều là subclasses của `FilterInputStream`; `BufferedOutputStream` (byte buffered output stream), `DataOutputStream`... đều là subclasses của `FilterOutputStream`.

Ví dụ, chúng ta có thể dùng `BufferedInputStream` (byte buffered input stream) để tăng cường tính năng của `FileInputStream`.

Constructor của `BufferedInputStream`:

```java
public BufferedInputStream(InputStream in) {
    this(in, DEFAULT_BUFFER_SIZE);
}

public BufferedInputStream(InputStream in, int size) {
    super(in);
    if (size <= 0) {
        throw new IllegalArgumentException("Buffer size <= 0");
    }
    buf = new byte[size];
}
```

Có thể thấy, một trong các parameters của constructor `BufferedInputStream` là `InputStream`.

Code example của `BufferedInputStream`:

```java
try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream("input.txt"))) {
    int content;
    long skip = bis.skip(2);
    while ((content = bis.read()) != -1) {
        System.out.print((char) content);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

Lúc này, bạn có thể nghĩ: **Tại sao không tạo thẳng một `BufferedFileInputStream` (character buffered file input stream)?**

```java
BufferedFileInputStream bfis = new BufferedFileInputStream("input.txt");
```

Nếu số subclasses của `InputStream` ít, cách này không có vấn đề gì. Tuy nhiên, subclasses của `InputStream` thực sự rất nhiều, quan hệ kế thừa cũng rất phức tạp. Nếu chúng ta tạo một buffered input stream tùy chỉnh cho mỗi subclass, sẽ rất phiền phức.

Nếu bạn quen với IO streams, bạn sẽ thấy `ZipInputStream` và `ZipOutputStream` còn có thể tăng cường tính năng của `BufferedInputStream` và `BufferedOutputStream`.

```java
BufferedInputStream bis = new BufferedInputStream(new FileInputStream(fileName));
ZipInputStream zis = new ZipInputStream(bis);

BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(fileName));
ZipOutputStream zipOut = new ZipOutputStream(bos);
```

`ZipInputStream` và `ZipOutputStream` kế thừa từ `InflaterInputStream` và `DeflaterOutputStream` tương ứng.

```java
public
class InflaterInputStream extends FilterInputStream {
}

public
class DeflaterOutputStream extends FilterOutputStream {
}

```

Đây cũng là một đặc tính quan trọng của Decorator Pattern, tức là có thể lồng nhiều decorators với original class.

Để thực hiện hiệu quả này, decorator class cần kế thừa cùng abstract class hoặc implement cùng interface như original class. Các IO decorator classes và original classes được giới thiệu ở trên có parent class chung là `InputStream` và `OutputStream`.

Đối với character streams, `BufferedReader` có thể tăng cường tính năng của các subclasses của `Reader` (character input stream), `BufferedWriter` có thể tăng cường tính năng của các subclasses của `Writer` (character output stream).

```java
BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(fileName), "UTF-8"));
```

Có rất nhiều ví dụ về ứng dụng Decorator Pattern trong IO streams, không cần cố gắng ghi nhớ, hoàn toàn không cần thiết! Sau khi nắm rõ core của Decorator Pattern, khi dùng bạn sẽ tự nhiên nhận ra chỗ nào có Decorator Pattern.

## Adapter Pattern

**Adapter Pattern** chủ yếu dùng để các classes có interfaces không tương thích có thể làm việc cùng nhau, bạn có thể liên tưởng đến power adapter thường dùng hàng ngày.

Trong Adapter Pattern, object hoặc class được adapted gọi là **Adaptee**, object hoặc class tác động lên Adaptee gọi là **Adapter**. Adapter chia thành Object Adapter và Class Adapter. Class Adapter dùng kế thừa để implement, Object Adapter dùng composition để implement.

Trong IO streams, interface của character stream và byte stream khác nhau, chúng có thể phối hợp làm việc là dựa trên Adapter Pattern, chính xác hơn là Object Adapter. Thông qua adapter, chúng ta có thể adapt byte stream object thành character stream object, như vậy có thể đọc hoặc ghi character data trực tiếp qua byte stream object.

`InputStreamReader` và `OutputStreamWriter` là hai Adapters, đồng thời chúng cũng là cầu nối giữa byte stream và character stream. `InputStreamReader` dùng `StreamDecoder` (stream decoder) để decode bytes, **thực hiện chuyển đổi byte stream thành character stream**; `OutputStreamWriter` dùng `StreamEncoder` (stream encoder) để encode characters, thực hiện chuyển đổi character stream thành byte stream.

Subclasses của `InputStream` và `OutputStream` là Adaptees, `InputStreamReader` và `OutputStreamWriter` là Adapters.

```java
// InputStreamReader là Adapter, FileInputStream là Adaptee
InputStreamReader isr = new InputStreamReader(new FileInputStream(fileName), "UTF-8");
// BufferedReader tăng cường tính năng của InputStreamReader (Decorator Pattern)
BufferedReader bufferedReader = new BufferedReader(isr);
```

Một phần source code của `java.io.InputStreamReader`:

```java
public class InputStreamReader extends Reader {
    //Object dùng để decode
    private final StreamDecoder sd;
    public InputStreamReader(InputStream in) {
        super(in);
        try {
            // Lấy StreamDecoder object
            sd = StreamDecoder.forInputStreamReader(in, this, (String)null);
        } catch (UnsupportedEncodingException e) {
            throw new Error(e);
        }
    }
    // Dùng StreamDecoder object để thực hiện đọc cụ thể
    public int read() throws IOException {
        return sd.read();
    }
}
```

Một phần source code của `java.io.OutputStreamWriter`:

```java
public class OutputStreamWriter extends Writer {
    // Object dùng để encode
    private final StreamEncoder se;
    public OutputStreamWriter(OutputStream out) {
        super(out);
        try {
           // Lấy StreamEncoder object
            se = StreamEncoder.forOutputStreamWriter(out, this, (String)null);
        } catch (UnsupportedEncodingException e) {
            throw new Error(e);
        }
    }
    // Dùng StreamEncoder object để thực hiện ghi cụ thể
    public void write(int c) throws IOException {
        se.write(c);
    }
}
```

**Sự khác biệt giữa Adapter Pattern và Decorator Pattern là gì?**

**Decorator Pattern** thiên về dynamic enhancement tính năng của original class, decorator class cần kế thừa cùng abstract class hoặc implement cùng interface với original class. Ngoài ra, Decorator Pattern hỗ trợ lồng nhiều decorators với original class.

**Adapter Pattern** thiên về làm cho các classes có incompatible interfaces có thể làm việc cùng nhau. Khi chúng ta gọi method tương ứng của Adapter, bên trong Adapter sẽ gọi methods của Adaptee class hoặc các classes liên quan đến Adaptee, quá trình này transparent. Ví dụ `StreamDecoder` (stream decoder) và `StreamEncoder` (stream encoder) lần lượt lấy `FileChannel` object dựa trên `InputStream` và `OutputStream` và gọi các methods `read` và `write` tương ứng để đọc và ghi byte data.

```java
StreamDecoder(InputStream in, Object lock, CharsetDecoder dec) {
    // Bỏ qua hầu hết code
    // Lấy FileChannel object từ InputStream object
    ch = getChannel((FileInputStream)in);
}
```

Adapter và Adaptee không cần kế thừa cùng abstract class hoặc implement cùng interface.

Ngoài ra, class `FutureTask` dùng Adapter Pattern, inner class `RunnableAdapter` của `Executors` là một Adapter, dùng để adapt `Runnable` thành `Callable`.

Constructor của `FutureTask` có parameter `Runnable`:

```java
public FutureTask(Runnable runnable, V result) {
    // Gọi method callable của Executors class
    this.callable = Executors.callable(runnable, result);
    this.state = NEW;
}
```

Method và Adapter tương ứng trong `Executors`:

```java
// Thực tế gọi constructor của inner class RunnableAdapter của Executors
public static <T> Callable<T> callable(Runnable task, T result) {
    if (task == null)
        throw new NullPointerException();
    return new RunnableAdapter<T>(task, result);
}
// Adapter
static final class RunnableAdapter<T> implements Callable<T> {
    final Runnable task;
    final T result;
    RunnableAdapter(Runnable task, T result) {
        this.task = task;
        this.result = result;
    }
    public T call() {
        task.run();
        return result;
    }
}
```

## Factory Pattern

Factory Pattern dùng để tạo objects. NIO sử dụng Factory Pattern nhiều, ví dụ method `newInputStream` của class `Files` dùng để tạo `InputStream` object (static factory), method `get` của class `Paths` tạo `Path` object (static factory), method `getPath` của class `ZipFileSystem` (class trong package `sun.nio`, là một số internal implementations liên quan đến `java.nio`) tạo `Path` object (simple factory).

```java
InputStream is = Files.newInputStream(Paths.get(generatorLogoPath))
```

## Observer Pattern

File directory monitoring service trong NIO sử dụng Observer Pattern.

File directory monitoring service trong NIO dựa trên interface `WatchService` và interface `Watchable`. `WatchService` là Observer, `Watchable` là Observable.

Interface `Watchable` định nghĩa method `register` dùng để đăng ký object vào `WatchService` (monitoring service) và bind listening events.

```java
public interface Path
    extends Comparable<Path>, Iterable<Path>, Watchable{
}

public interface Watchable {
    WatchKey register(WatchService watcher,
                      WatchEvent.Kind<?>[] events,
                      WatchEvent.Modifier... modifiers)
        throws IOException;
}
```

`WatchService` dùng để monitor sự thay đổi của file directory, cùng một `WatchService` object có thể monitor nhiều file directories.

```java
// Tạo WatchService object
WatchService watchService = FileSystems.getDefault().newWatchService();

// Khởi tạo Path class của một folder được monitored:
Path path = Paths.get("workingDirectory");
// Đăng ký path object này vào WatchService (monitoring service)
WatchKey watchKey = path.register(
watchService, StandardWatchEventKinds...);
```

Parameter thứ hai `events` (events cần listen) của method `register` trong class `Path` là varargs, tức là chúng ta có thể listen nhiều events cùng lúc.

```java
WatchKey register(WatchService watcher,
                  WatchEvent.Kind<?>... events)
    throws IOException;
```

Có 3 listening events thường dùng:

- `StandardWatchEventKinds.ENTRY_CREATE`: File được tạo.
- `StandardWatchEventKinds.ENTRY_DELETE`: File bị xóa.
- `StandardWatchEventKinds.ENTRY_MODIFY`: File bị sửa đổi.

Method `register` trả về `WatchKey` object. Qua `WatchKey` object có thể lấy thông tin cụ thể của event như trong file directory là tạo, xóa hay sửa file, tên cụ thể của file được tạo, xóa hoặc sửa là gì.

```java
WatchKey key;
while ((key = watchService.take()) != null) {
    for (WatchEvent<?> event : key.pollEvents()) {
      // Có thể gọi methods của WatchEvent object để làm gì đó như output context info cụ thể của event
    }
    key.reset();
}
```

Bên trong `WatchService` dùng một daemon thread với cách polling định kỳ để phát hiện sự thay đổi của file. Source code đã được đơn giản hóa như sau:

```java
class PollingWatchService
    extends AbstractWatchService
{
    // Định nghĩa một daemon thread polling để phát hiện thay đổi file
    private final ScheduledExecutorService scheduledExecutor;

    PollingWatchService() {
        scheduledExecutor = Executors
            .newSingleThreadScheduledExecutor(new ThreadFactory() {
                 @Override
                 public Thread newThread(Runnable r) {
                     Thread t = new Thread(r);
                     t.setDaemon(true);
                     return t;
                 }});
    }

  void enable(Set<? extends WatchEvent.Kind<?>> events, long period) {
    synchronized (this) {
      // Cập nhật listening events
      this.events = events;

        // Bật periodic polling
      Runnable thunk = new Runnable() { public void run() { poll(); }};
      this.poller = scheduledExecutor
        .scheduleAtFixedRate(thunk, period, period, TimeUnit.SECONDS);
    }
  }
}
```

## References

- Patterns in Java APIs: <http://cecs.wright.edu/~tkprasad/courses/ceg860/paper/node26.html>
- Decorator Pattern: Learning Decorator Pattern by Analyzing Java IO Class Library Source Code: <https://time.geekbang.org/column/article/204845>
- What is sun.nio package, is it Java code? - RednaxelaFX <https://www.zhihu.com/question/29237781/answer/43653953>

<!-- @include: @article-footer.snippet.md -->
