---
title: Tổng hợp kiến thức cơ bản về Java IO
description: Tổng hợp toàn diện kiến thức cơ bản về Java IO：giải thích chi tiết sự khác biệt giữa luồng byte và luồng ký tự, luồng byte InputStream/OutputStream, luồng ký tự Reader/Writer, tối ưu hóa bằng luồng đệm, thao tác đọc ghi file.
category: Java
tag:
  - Java IO
  - Java Cơ bản
head:
  - - meta
    - name: keywords
      content: Java IO,字节流,字符流,InputStream,OutputStream,Reader,Writer,文件操作,缓冲流
---

<!-- @include: @small-advertisement.snippet.md -->

## Giới thiệu IO Stream

IO tức là `Input/Output`, nhập và xuất. Quá trình dữ liệu đi vào bộ nhớ máy tính gọi là nhập, ngược lại quá trình xuất ra bộ lưu trữ bên ngoài (ví dụ cơ sở dữ liệu, file, máy chủ từ xa) gọi là xuất. Quá trình truyền dữ liệu giống như dòng nước chảy, vì vậy gọi là IO stream. Trong Java, IO stream được chia thành luồng nhập và luồng xuất, và dựa theo cách xử lý dữ liệu lại chia thành luồng byte và luồng ký tự.

Hơn 40 lớp IO stream trong Java đều được dẫn xuất từ 4 lớp trừu tượng cơ sở sau.

- `InputStream`/`Reader`: Lớp cơ sở của tất cả các luồng nhập, lớp trước là luồng byte nhập, lớp sau là luồng ký tự nhập.
- `OutputStream`/`Writer`: Lớp cơ sở của tất cả các luồng xuất, lớp trước là luồng byte xuất, lớp sau là luồng ký tự xuất.

## Luồng byte

### InputStream (Luồng byte nhập)

`InputStream` dùng để đọc dữ liệu (thông tin byte) từ nguồn (thường là file) vào bộ nhớ, lớp trừu tượng `java.io.InputStream` là lớp cha của tất cả các luồng byte nhập.

Các phương thức thường dùng của `InputStream`:

- `read()`: Trả về dữ liệu của byte tiếp theo trong luồng nhập. Giá trị trả về nằm trong khoảng 0 đến 255. Nếu không đọc được byte nào, mã trả về `-1`, biểu thị kết thúc file.
- `read(byte b[])`: Đọc một số byte từ luồng nhập và lưu vào mảng `b`. Nếu độ dài của mảng `b` bằng không, không đọc gì. Nếu không có byte khả dụng để đọc, trả về `-1`. Nếu có byte khả dụng, số byte đọc nhiều nhất bằng `b.length`, trả về số byte đã đọc. Phương thức này tương đương với `read(b, 0, b.length)`.
- `read(byte b[], int off, int len)`: Dựa trên phương thức `read(byte b[])` thêm tham số `off` (offset) và `len` (số byte tối đa cần đọc).
- `skip(long n)`: Bỏ qua n byte trong luồng nhập, trả về số byte thực sự đã bỏ qua.
- `available()`: Trả về số byte có thể đọc trong luồng nhập.
- `close()`: Đóng luồng nhập và giải phóng tài nguyên hệ thống liên quan.

Từ Java 9, `InputStream` bổ sung thêm nhiều phương thức tiện ích:

- `readAllBytes()`: Đọc tất cả byte trong luồng nhập, trả về mảng byte.
- `readNBytes(byte[] b, int off, int len)`: Chặn cho đến khi đọc đủ `len` byte.
- `transferTo(OutputStream out)`: Chuyển tất cả byte từ một luồng nhập sang một luồng xuất.

`FileInputStream` là đối tượng luồng byte nhập được dùng phổ biến, có thể chỉ định trực tiếp đường dẫn file, có thể đọc trực tiếp dữ liệu đơn byte hoặc đọc vào mảng byte.

Ví dụ code `FileInputStream`:

```java
try (InputStream fis = new FileInputStream("input.txt")) {
    System.out.println("Number of remaining bytes:"
            + fis.available());
    int content;
    long skip = fis.skip(2);
    System.out.println("The actual number of bytes skipped:" + skip);
    System.out.print("The content read from file:");
    while ((content = fis.read()) != -1) {
        System.out.print((char) content);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

Nội dung file `input.txt`:

![](https://oss.javaguide.cn/github/javaguide/java/image-20220419155214614.png)

Đầu ra:

```plain
Number of remaining bytes:11
The actual number of bytes skipped:2
The content read from file:JavaGuide
```

Tuy nhiên, thông thường chúng ta không dùng `FileInputStream` đơn lẻ, thường kết hợp với `BufferedInputStream` (luồng byte nhập đệm, sẽ đề cập sau).

Đoạn code dưới đây khá phổ biến trong dự án của chúng ta, chúng ta dùng `readAllBytes()` để đọc tất cả byte từ luồng nhập và gán trực tiếp vào đối tượng `String`.

```java
// 新建一个 BufferedInputStream 对象
BufferedInputStream bufferedInputStream = new BufferedInputStream(new FileInputStream("input.txt"));
// 读取文件的内容并复制到 String 对象中
String result = new String(bufferedInputStream.readAllBytes());
System.out.println(result);
```

`DataInputStream` dùng để đọc dữ liệu của kiểu cụ thể, không thể dùng độc lập, phải kết hợp với luồng khác như `FileInputStream`.

```java
FileInputStream fileInputStream = new FileInputStream("input.txt");
//必须将fileInputStream作为构造参数才能使用
DataInputStream dataInputStream = new DataInputStream(fileInputStream);
//可以读取任意具体的类型数据
dataInputStream.readBoolean();
dataInputStream.readInt();
dataInputStream.readUTF();
```

`ObjectInputStream` dùng để đọc đối tượng Java từ luồng nhập (deserialization), `ObjectOutputStream` dùng để ghi đối tượng vào luồng xuất (serialization).

```java
ObjectInputStream input = new ObjectInputStream(new FileInputStream("object.data"));
MyClass object = (MyClass) input.readObject();
input.close();
```

Ngoài ra, lớp dùng để serialize và deserialize phải triển khai giao diện `Serializable`. Nếu có thuộc tính trong đối tượng không muốn serialize, dùng `transient` để đánh dấu.

### OutputStream (Luồng byte xuất)

`OutputStream` dùng để ghi dữ liệu (thông tin byte) vào đích (thường là file), lớp trừu tượng `java.io.OutputStream` là lớp cha của tất cả các luồng byte xuất.

Các phương thức thường dùng của `OutputStream`:

- `write(int b)`: Ghi một byte cụ thể vào luồng xuất.
- `write(byte b[])`: Ghi mảng `b` vào luồng xuất, tương đương với `write(b, 0, b.length)`.
- `write(byte[] b, int off, int len)`: Dựa trên phương thức `write(byte b[])` thêm tham số `off` (offset) và `len` (số byte tối đa cần đọc).
- `flush()`: Xả luồng xuất này và buộc ghi tất cả các byte xuất đã được đệm.
- `close()`: Đóng luồng xuất và giải phóng tài nguyên hệ thống liên quan.

`FileOutputStream` là đối tượng luồng byte xuất được dùng phổ biến nhất, có thể chỉ định trực tiếp đường dẫn file, có thể xuất trực tiếp dữ liệu đơn byte hoặc xuất mảng byte cụ thể.

Ví dụ code `FileOutputStream`:

```java
try (FileOutputStream output = new FileOutputStream("output.txt")) {
    byte[] array = "JavaGuide".getBytes();
    output.write(array);
} catch (IOException e) {
    e.printStackTrace();
}
```

Kết quả chạy:

![](https://oss.javaguide.cn/github/javaguide/java/image-20220419155514392.png)

Tương tự `FileInputStream`, `FileOutputStream` thường cũng kết hợp với `BufferedOutputStream` (luồng byte xuất đệm, sẽ đề cập sau).

```java
FileOutputStream fileOutputStream = new FileOutputStream("output.txt");
BufferedOutputStream bos = new BufferedOutputStream(fileOutputStream)
```

**`DataOutputStream`** dùng để ghi dữ liệu của kiểu cụ thể, không thể dùng độc lập, phải kết hợp với luồng khác như `FileOutputStream`.

```java
// 输出流
FileOutputStream fileOutputStream = new FileOutputStream("out.txt");
DataOutputStream dataOutputStream = new DataOutputStream(fileOutputStream);
// 输出任意数据类型
dataOutputStream.writeBoolean(true);
dataOutputStream.writeByte(1);
```

`ObjectInputStream` dùng để đọc đối tượng Java từ luồng nhập (deserialization), `ObjectOutputStream` ghi đối tượng vào luồng xuất (serialization).

```java
ObjectOutputStream output = new ObjectOutputStream(new FileOutputStream("file.txt")
Person person = new Person("Guide哥", "JavaGuide作者");
output.writeObject(person);
```

## Luồng ký tự

Dù là đọc ghi file hay gửi nhận qua mạng, đơn vị lưu trữ nhỏ nhất của thông tin đều là byte. **Vậy tại sao thao tác I/O stream lại cần chia thành thao tác luồng byte và luồng ký tự?**

Theo tôi có hai lý do chính:

- Luồng ký tự được Java Virtual Machine chuyển đổi từ byte, quá trình này tương đối tốn thời gian.
- Nếu không biết kiểu encoding, rất dễ xảy ra vấn đề ký tự rác (garbled text).

Vấn đề ký tự rác rất dễ tái hiện, chỉ cần thay đổi nội dung file `input.txt` trong ví dụ `FileInputStream` ở trên thành chữ Trung văn là được, không cần thay đổi code.

![](https://oss.javaguide.cn/github/javaguide/java/image-20220419154632551.png)

Đầu ra:

```java
Number of remaining bytes:9
The actual number of bytes skipped:2
The content read from file:§å®¶å¥½
```

Có thể thấy rõ ràng nội dung đọc ra đã biến thành ký tự rác.

Do đó, I/O stream cung cấp thẳng một giao diện thao tác trực tiếp trên ký tự, tiện lợi cho thao tác luồng ký tự hàng ngày. Nếu là file âm thanh, ảnh hay các file đa phương tiện, dùng luồng byte sẽ tốt hơn; còn nếu liên quan đến ký tự thì nên dùng luồng ký tự.

Luồng ký tự mặc định dùng encoding `Unicode`, bạn có thể tùy chỉnh encoding thông qua constructor.

Unicode bản thân chỉ là một bộ ký tự, nó gán một số duy nhất cho mỗi ký tự, không quy định cách lưu trữ cụ thể. UTF-8, UTF-16, UTF-32 đều là các phương thức encoding của Unicode, chúng dùng số byte khác nhau để biểu diễn ký tự Unicode. Ví dụ, UTF-8: tiếng Anh chiếm 1 byte, tiếng Trung chiếm 3 byte.

### Reader (Luồng ký tự nhập)

`Reader` dùng để đọc dữ liệu (thông tin ký tự) từ nguồn (thường là file) vào bộ nhớ, lớp trừu tượng `java.io.Reader` là lớp cha của tất cả các luồng ký tự nhập.

`Reader` dùng để đọc văn bản, `InputStream` dùng để đọc byte thô.

Các phương thức thường dùng của `Reader`:

- `read()`: Đọc một ký tự từ luồng nhập.
- `read(char[] cbuf)`: Đọc một số ký tự từ luồng nhập và lưu vào mảng ký tự `cbuf`, tương đương với `read(cbuf, 0, cbuf.length)`.
- `read(char[] cbuf, int off, int len)`: Dựa trên phương thức `read(char[] cbuf)` thêm tham số `off` (offset) và `len` (số ký tự tối đa cần đọc).
- `skip(long n)`: Bỏ qua n ký tự trong luồng nhập, trả về số ký tự thực sự đã bỏ qua.
- `close()`: Đóng luồng nhập và giải phóng tài nguyên hệ thống liên quan.

`InputStreamReader` là cầu nối chuyển đổi luồng byte sang luồng ký tự, lớp con của nó `FileReader` là một lớp đóng gói dựa trên đó, có thể thao tác trực tiếp trên file ký tự.

```java
// 字节流转换为字符流的桥梁
public class InputStreamReader extends Reader {
}
// 用于读取字符文件
public class FileReader extends InputStreamReader {
}
```

Ví dụ code `FileReader`:

```java
try (FileReader fileReader = new FileReader("input.txt");) {
    int content;
    long skip = fileReader.skip(3);
    System.out.println("The actual number of characters skipped:" + skip);
    System.out.print("The content read from file:");
    while ((content = fileReader.read()) != -1) {
        System.out.print((char) content);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

Nội dung file `input.txt`:

![](https://oss.javaguide.cn/github/javaguide/java/image-20220419154632551.png)

Đầu ra:

```plain
The actual number of characters skipped:3
The content read from file:我是Guide。
```

### Writer (Luồng ký tự xuất)

`Writer` dùng để ghi dữ liệu (thông tin ký tự) vào đích (thường là file), lớp trừu tượng `java.io.Writer` là lớp cha của tất cả các luồng ký tự xuất.

Các phương thức thường dùng của `Writer`:

- `write(int c)`: Ghi một ký tự đơn.
- `write(char[] cbuf)`: Ghi mảng ký tự `cbuf`, tương đương với `write(cbuf, 0, cbuf.length)`.
- `write(char[] cbuf, int off, int len)`: Dựa trên phương thức `write(char[] cbuf)` thêm tham số `off` (offset) và `len` (số ký tự tối đa cần đọc).
- `write(String str)`: Ghi chuỗi ký tự, tương đương với `write(str, 0, str.length())`.
- `write(String str, int off, int len)`: Dựa trên phương thức `write(String str)` thêm tham số `off` (offset) và `len` (số ký tự tối đa cần đọc).
- `append(CharSequence csq)`: Nối chuỗi ký tự cụ thể vào đối tượng `Writer` cụ thể và trả về đối tượng `Writer` đó.
- `append(char c)`: Nối ký tự cụ thể vào đối tượng `Writer` cụ thể và trả về đối tượng `Writer` đó.
- `flush()`: Xả luồng xuất này và buộc ghi tất cả các ký tự xuất đã được đệm.
- `close()`: Đóng luồng xuất và giải phóng tài nguyên hệ thống liên quan.

`OutputStreamWriter` là cầu nối chuyển đổi luồng ký tự sang luồng byte, lớp con của nó `FileWriter` là một lớp đóng gói dựa trên đó, có thể ghi trực tiếp ký tự vào file.

```java
// 字符流转换为字节流的桥梁
public class OutputStreamWriter extends Writer {
}
// 用于写入字符到文件
public class FileWriter extends OutputStreamWriter {
}
```

Ví dụ code `FileWriter`:

```java
try (Writer output = new FileWriter("output.txt")) {
    output.write("你好，我是Guide。");
} catch (IOException e) {
    e.printStackTrace();
}
```

Kết quả đầu ra:

![](https://oss.javaguide.cn/github/javaguide/java/image-20220419155802288.png)

## Luồng đệm byte

Thao tác IO rất tốn hiệu năng, luồng đệm tải dữ liệu vào vùng đệm, đọc/ghi nhiều byte cùng một lúc, từ đó tránh các thao tác IO thường xuyên, nâng cao hiệu quả truyền dữ liệu.

Luồng đệm byte ở đây áp dụng mẫu thiết kế Decorator để tăng cường chức năng cho các đối tượng con của `InputStream` và `OutputStream`.

Ví dụ, chúng ta có thể dùng `BufferedInputStream` (luồng byte nhập đệm) để tăng cường chức năng của `FileInputStream`.

```java
// 新建一个 BufferedInputStream 对象
BufferedInputStream bufferedInputStream = new BufferedInputStream(new FileInputStream("input.txt"));
```

Sự khác biệt về hiệu năng giữa luồng byte và luồng đệm byte chủ yếu thể hiện khi chúng ta dùng cả hai đều gọi phương thức `write(int b)` và `read()` - các phương thức chỉ đọc/ghi một byte mỗi lần. Vì luồng đệm byte có vùng đệm nội bộ (mảng byte), luồng đệm byte sẽ lưu trữ các byte đã đọc vào vùng đệm trước, giảm đáng kể số lần IO, nâng cao hiệu quả đọc.

Tôi dùng phương thức `write(int b)` và `read()`, so sánh thời gian sao chép một file PDF `524.9 mb` qua luồng byte và luồng đệm byte:

```plain
使用缓冲流复制PDF文件总耗时:15428 毫秒
使用普通字节流复制PDF文件总耗时:2555062 毫秒
```

Chênh lệch thời gian giữa hai loại rất lớn, luồng đệm chỉ mất 1/165 thời gian so với luồng byte.

Code test như sau:

```java
@Test
void copy_pdf_to_another_pdf_buffer_stream() {
    // 记录开始时间
    long start = System.currentTimeMillis();
    try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream("深入理解计算机操作系统.pdf"));
         BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("深入理解计算机操作系统-副本.pdf"))) {
        int content;
        while ((content = bis.read()) != -1) {
            bos.write(content);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
    // 记录结束时间
    long end = System.currentTimeMillis();
    System.out.println("使用缓冲流复制PDF文件总耗时:" + (end - start) + " 毫秒");
}

@Test
void copy_pdf_to_another_pdf_stream() {
    // 记录开始时间
    long start = System.currentTimeMillis();
    try (FileInputStream fis = new FileInputStream("深入理解计算机操作系统.pdf");
         FileOutputStream fos = new FileOutputStream("深入理解计算机操作系统-副本.pdf")) {
        int content;
        while ((content = fis.read()) != -1) {
            fos.write(content);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
    // 记录结束时间
    long end = System.currentTimeMillis();
    System.out.println("使用普通流复制PDF文件总耗时:" + (end - start) + " 毫秒");
}
```

Nếu gọi phương thức `read(byte b[])` và `write(byte b[], int off, int len)` - các phương thức ghi một mảng byte, miễn là kích thước mảng byte hợp lý, chênh lệch hiệu năng giữa hai loại thực ra không lớn, cơ bản có thể bỏ qua.

Lần này chúng ta dùng phương thức `read(byte b[])` và `write(byte b[], int off, int len)`, so sánh thời gian sao chép một file PDF 524.9 mb qua luồng byte và luồng đệm byte:

```plain
使用缓冲流复制PDF文件总耗时:695 毫秒
使用普通字节流复制PDF文件总耗时:989 毫秒
```

Chênh lệch thời gian giữa hai loại không nhiều, hiệu năng của luồng đệm chỉ nhỉnh hơn một chút.

Code test như sau:

```java
@Test
void copy_pdf_to_another_pdf_with_byte_array_buffer_stream() {
    // 记录开始时间
    long start = System.currentTimeMillis();
    try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream("深入理解计算机操作系统.pdf"));
         BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("深入理解计算机操作系统-副本.pdf"))) {
        int len;
        byte[] bytes = new byte[4 * 1024];
        while ((len = bis.read(bytes)) != -1) {
            bos.write(bytes, 0, len);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
    // 记录结束时间
    long end = System.currentTimeMillis();
    System.out.println("使用缓冲流复制PDF文件总耗时:" + (end - start) + " 毫秒");
}

@Test
void copy_pdf_to_another_pdf_with_byte_array_stream() {
    // 记录开始时间
    long start = System.currentTimeMillis();
    try (FileInputStream fis = new FileInputStream("深入理解计算机操作系统.pdf");
         FileOutputStream fos = new FileOutputStream("深入理解计算机操作系统-副本.pdf")) {
        int len;
        byte[] bytes = new byte[4 * 1024];
        while ((len = fis.read(bytes)) != -1) {
            fos.write(bytes, 0, len);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
    // 记录结束时间
    long end = System.currentTimeMillis();
    System.out.println("使用普通流复制PDF文件总耗时:" + (end - start) + " 毫秒");
}
```

### BufferedInputStream (Luồng byte nhập đệm)

`BufferedInputStream` trong quá trình đọc dữ liệu (thông tin byte) từ nguồn (thường là file) vào bộ nhớ không đọc từng byte một, mà sẽ lưu trữ các byte đã đọc vào vùng đệm trước, rồi đọc riêng lẻ từng byte từ vùng đệm nội bộ. Điều này giảm đáng kể số lần IO, nâng cao hiệu quả đọc.

`BufferedInputStream` duy trì nội bộ một vùng đệm, vùng đệm này thực chất là một mảng byte, có thể xác nhận kết luận này bằng cách đọc source code của `BufferedInputStream`.

```java
public
class BufferedInputStream extends FilterInputStream {
    // 内部缓冲区数组
    protected volatile byte buf[];
    // 缓冲区的默认大小
    private static int DEFAULT_BUFFER_SIZE = 8192;
    // 使用默认的缓冲区大小
    public BufferedInputStream(InputStream in) {
        this(in, DEFAULT_BUFFER_SIZE);
    }
    // 自定义缓冲区大小
    public BufferedInputStream(InputStream in, int size) {
        super(in);
        if (size <= 0) {
            throw new IllegalArgumentException("Buffer size <= 0");
        }
        buf = new byte[size];
    }
}
```

Kích thước vùng đệm mặc định là **8192** byte, tất nhiên bạn cũng có thể chỉ định kích thước vùng đệm thông qua constructor `BufferedInputStream(InputStream in, int size)`.

### BufferedOutputStream (Luồng byte xuất đệm)

`BufferedOutputStream` trong quá trình ghi dữ liệu (thông tin byte) vào đích (thường là file) không ghi từng byte một, mà sẽ lưu trữ các byte cần ghi vào vùng đệm trước, rồi ghi riêng lẻ từng byte từ vùng đệm nội bộ. Điều này giảm đáng kể số lần IO, nâng cao hiệu quả.

```java
try (BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("output.txt"))) {
    byte[] array = "JavaGuide".getBytes();
    bos.write(array);
} catch (IOException e) {
    e.printStackTrace();
}
```

Tương tự `BufferedInputStream`, `BufferedOutputStream` cũng duy trì nội bộ một vùng đệm, và kích thước vùng đệm này cũng là **8192** byte.

## Luồng đệm ký tự

`BufferedReader` (luồng ký tự nhập đệm) và `BufferedWriter` (luồng ký tự xuất đệm) tương tự `BufferedInputStream` (luồng byte nhập đệm) và `BufferedOutputStream` (luồng byte nhập đệm), đều duy trì nội bộ một mảng byte làm vùng đệm. Tuy nhiên, loại trước chủ yếu dùng để thao tác thông tin ký tự.

## Luồng in

Đoạn code dưới đây mọi người dùng thường xuyên phải không?

```java
System.out.print("Hello！");
System.out.println("Hello！");
```

`System.out` thực ra là để lấy đối tượng `PrintStream`, phương thức `print` thực ra gọi phương thức `write` của đối tượng `PrintStream`.

`PrintStream` thuộc luồng in byte, tương ứng với nó là `PrintWriter` (luồng in ký tự). `PrintStream` là lớp con của `OutputStream`, `PrintWriter` là lớp con của `Writer`.

```java
public class PrintStream extends FilterOutputStream
    implements Appendable, Closeable {
}
public class PrintWriter extends Writer {
}
```

## Luồng truy cập ngẫu nhiên

Luồng truy cập ngẫu nhiên được đề cập ở đây là `RandomAccessFile`, hỗ trợ nhảy tùy ý đến bất kỳ vị trí nào trong file để đọc ghi.

Constructor của `RandomAccessFile` như sau, chúng ta có thể chỉ định `mode` (chế độ đọc ghi).

```java
// openAndDelete 参数默认为 false 表示打开文件并且这个文件不会被删除
public RandomAccessFile(File file, String mode)
    throws FileNotFoundException {
    this(file, mode, false);
}
// 私有方法
private RandomAccessFile(File file, String mode, boolean openAndDelete)  throws FileNotFoundException{
  // 省略大部分代码
}
```

Chế độ đọc ghi chủ yếu có bốn loại sau:

- `r`: Chế độ chỉ đọc.
- `rw`: Chế độ đọc ghi.
- `rws`: So với `rw`, `rws` đồng bộ cập nhật sửa đổi "nội dung file" hoặc "metadata" vào thiết bị lưu trữ ngoài.
- `rwd`: So với `rw`, `rwd` đồng bộ cập nhật sửa đổi "nội dung file" vào thiết bị lưu trữ ngoài.

Nội dung file là dữ liệu thực sự được lưu trong file, metadata là thông tin mô tả thuộc tính file như kích thước file, thời gian tạo và sửa đổi.

`RandomAccessFile` có một con trỏ file để biểu thị vị trí của byte tiếp theo sẽ được ghi vào hoặc đọc ra. Chúng ta có thể dùng phương thức `seek(long pos)` của `RandomAccessFile` để đặt offset của con trỏ file (vị trí cách đầu file `pos` byte). Nếu muốn lấy vị trí hiện tại của con trỏ file, có thể dùng phương thức `getFilePointer()`.

Ví dụ code `RandomAccessFile`:

```java
RandomAccessFile randomAccessFile = new RandomAccessFile(new File("input.txt"), "rw");
System.out.println("读取之前的偏移量：" + randomAccessFile.getFilePointer() + ",当前读取到的字符" + (char) randomAccessFile.read() + "，读取之后的偏移量：" + randomAccessFile.getFilePointer());
// 指针当前偏移量为 6
randomAccessFile.seek(6);
System.out.println("读取之前的偏移量：" + randomAccessFile.getFilePointer() + ",当前读取到的字符" + (char) randomAccessFile.read() + "，读取之后的偏移量：" + randomAccessFile.getFilePointer());
// 从偏移量 7 的位置开始往后写入字节数据
randomAccessFile.write(new byte[]{'H', 'I', 'J', 'K'});
// 指针当前偏移量为 0，回到起始位置
randomAccessFile.seek(0);
System.out.println("读取之前的偏移量：" + randomAccessFile.getFilePointer() + ",当前读取到的字符" + (char) randomAccessFile.read() + "，读取之后的偏移量：" + randomAccessFile.getFilePointer());
```

Nội dung file `input.txt`:

![](https://oss.javaguide.cn/github/javaguide/java/image-20220421162050158.png)

Đầu ra:

```plain
读取之前的偏移量：0,当前读取到的字符A，读取之后的偏移量：1
读取之前的偏移量：6,当前读取到的字符G，读取之后的偏移量：7
读取之前的偏移量：0,当前读取到的字符A，读取之后的偏移量：1
```

Nội dung file `input.txt` trở thành `ABCDEFGHIJK`.

Phương thức `write` của `RandomAccessFile` khi ghi đối tượng nếu vị trí tương ứng đã có dữ liệu sẽ ghi đè lên đó.

```java
RandomAccessFile randomAccessFile = new RandomAccessFile(new File("input.txt"), "rw");
randomAccessFile.write(new byte[]{'H', 'I', 'J', 'K'});
```

Giả sử trước khi chạy đoạn chương trình trên nội dung file `input.txt` là `ABCD`, sau khi chạy sẽ trở thành `HIJK`.

Một ứng dụng phổ biến của `RandomAccessFile` là triển khai **truyền tệp từ điểm dừng** (breakpoint resume) cho file lớn. Truyền tệp từ điểm dừng là gì? Nói đơn giản là sau khi tải file bị tạm dừng hoặc thất bại giữa chừng (ví dụ gặp vấn đề mạng), không cần tải lại từ đầu, chỉ cần tải những phần chưa tải thành công. Tải theo phần (chia file thành nhiều phần trước) là cơ sở của truyền tệp từ điểm dừng.

`RandomAccessFile` có thể giúp chúng ta hợp nhất các phần file, code ví dụ như sau:

![](https://oss.javaguide.cn/github/javaguide/java/io/20210609164749122.png)

Tôi đã giới thiệu chi tiết vấn đề tải file lớn trong [《Java 面试指北》](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html).

![](https://oss.javaguide.cn/github/javaguide/java/image-20220428104115362.png)

Triển khai của `RandomAccessFile` phụ thuộc vào `FileDescriptor` (file descriptor) và `FileChannel` (memory-mapped file).

<!-- @include: @article-footer.snippet.md -->
