---
title: Giải thích chi tiết lớp ma thuật Unsafe trong Java
description: "Phân tích sâu về lớp ma thuật Unsafe trong Java: trình bày khả năng tầng dưới của Unsafe như thao tác bộ nhớ trực tiếp, CAS atomic operations, khởi tạo instance đối tượng, hiểu nguyên lý triển khai của các công cụ đồng thời JUC và rủi ro khi sử dụng."
category: Java
tag:
  - Java Cơ bản
head:
  - - meta
    - name: keywords
      content: Unsafe类,内存操作,CAS原子操作,堆外内存,直接内存,sun.misc.Unsafe,JUC底层实现
---

> Bài viết này được tổng hợp và hoàn thiện từ hai bài viết xuất sắc sau:
>
> - [Java 魔法类：Unsafe 应用解析 - Meituan Tech Team - 2019](https://tech.meituan.com/2019/02/14/talk-about-java-magic-class-unsafe.html)
> - [Java 双刃剑之 Unsafe 类详解 - 码农参上 - 2021](https://xie.infoq.cn/article/8b6ed4195e475bfb32dacc5cb)

<!-- markdownlint-disable MD024 -->

Những ai đã đọc source code JUC chắc chắn sẽ nhận ra rằng nhiều công cụ đồng thời đều gọi một lớp có tên là `Unsafe`.

Vậy lớp này chủ yếu dùng để làm gì? Có những trường hợp sử dụng nào? Bài viết này sẽ giúp bạn hiểu rõ!

## Giới thiệu Unsafe

`Unsafe` là một lớp nằm trong package `sun.misc`, chủ yếu cung cấp các phương thức để thực hiện các thao tác cấp thấp, không an toàn như truy cập trực tiếp tài nguyên bộ nhớ hệ thống, tự quản lý tài nguyên bộ nhớ, v.v. Các phương thức này đóng vai trò quan trọng trong việc nâng cao hiệu quả chạy Java và tăng cường khả năng thao tác tài nguyên tầng dưới của ngôn ngữ Java. Tuy nhiên, vì lớp `Unsafe` cho phép Java có khả năng thao tác không gian bộ nhớ tương tự con trỏ ngôn ngữ C, điều này cũng làm tăng nguy cơ xảy ra các vấn đề liên quan đến con trỏ trong chương trình. Sử dụng lớp `Unsafe` quá mức hoặc không đúng cách trong chương trình sẽ làm tăng khả năng chương trình bị lỗi, khiến ngôn ngữ Java vốn an toàn trở nên không còn "an toàn" nữa, vì vậy việc sử dụng `Unsafe` nhất định phải thận trọng.

Ngoài ra, việc triển khai các chức năng mà `Unsafe` cung cấp cần phụ thuộc vào Native Method (phương thức bản địa). Bạn có thể xem phương thức bản địa như là phương thức được viết bằng ngôn ngữ lập trình khác trong Java. Phương thức bản địa được đánh dấu bằng từ khóa **`native`**, trong code Java chỉ khai báo phần đầu phương thức, còn việc triển khai cụ thể được giao cho **code bản địa**.

![](/images/github/javaguide/java/basis/unsafe/image-20220717115231125.png)

**Tại sao phải sử dụng phương thức bản địa?**

1. Cần sử dụng các tính năng phụ thuộc hệ điều hành mà Java không có, Java cần thực hiện kiểm soát tầng dưới trong khi đảm bảo đa nền tảng, cần nhờ đến các ngôn ngữ khác.
2. Đối với một số chức năng đã được hoàn thành bằng ngôn ngữ khác, có thể dùng Java gọi trực tiếp.
3. Khi chương trình nhạy cảm về thời gian hoặc yêu cầu hiệu suất rất cao, cần sử dụng ngôn ngữ cấp thấp hơn như C/C++ thậm chí Assembly.

Nhiều công cụ đồng thời trong package JUC khi triển khai cơ chế đồng thời đều gọi phương thức bản địa, thông qua chúng phá vỡ giới hạn của Java runtime, có thể tiếp cận một số chức năng ở tầng dưới hệ điều hành. Đối với cùng một phương thức bản địa, các hệ điều hành khác nhau có thể triển khai theo các cách khác nhau, nhưng đối với người dùng thì trong suốt, cuối cùng đều nhận được cùng kết quả.

## Tạo instance Unsafe

Một phần source code của `sun.misc.Unsafe` như sau:

```java
public final class Unsafe {
  // 单例对象
  private static final Unsafe theUnsafe;
  ......
  private Unsafe() {
  }
  @CallerSensitive
  public static Unsafe getUnsafe() {
    Class var0 = Reflection.getCallerClass();
    // 仅在引导类加载器`BootstrapClassLoader`加载时才合法
    if(!VM.isSystemDomainLoader(var0.getClassLoader())) {
      throw new SecurityException("Unsafe");
    } else {
      return theUnsafe;
    }
  }
}
```

Lớp `Unsafe` được triển khai như singleton, cung cấp phương thức tĩnh `getUnsafe` để lấy instance `Unsafe`. Trông có vẻ có thể dùng để lấy instance `Unsafe`. Nhưng khi chúng ta gọi trực tiếp phương thức tĩnh này, sẽ ném ngoại lệ `SecurityException`:

```bash
Exception in thread "main" java.lang.SecurityException: Unsafe
 at sun.misc.Unsafe.getUnsafe(Unsafe.java:90)
 at com.cn.test.GetUnsafeTest.main(GetUnsafeTest.java:12)
```

**Tại sao phương thức `public static` không thể được gọi trực tiếp?**

Điều này là vì trong phương thức `getUnsafe`, sẽ kiểm tra `classLoader` của người gọi, xác định xem lớp hiện tại có được tải bởi `Bootstrap classLoader` hay không, nếu không thì sẽ ném ngoại lệ `SecurityException`. Nghĩa là, chỉ các lớp được tải bởi bootstrap class loader mới có thể gọi các phương thức trong lớp Unsafe, để ngăn các phương thức này bị gọi trong code không đáng tin cậy.

**Tại sao lại hạn chế sử dụng lớp Unsafe chặt chẽ như vậy?**

Các chức năng mà `Unsafe` cung cấp quá cấp thấp (như truy cập trực tiếp tài nguyên bộ nhớ hệ thống, tự quản lý tài nguyên bộ nhớ, v.v.), rủi ro bảo mật cũng khá lớn, sử dụng không đúng rất dễ xảy ra vấn đề nghiêm trọng.

**Nếu muốn sử dụng lớp `Unsafe`, làm thế nào để lấy instance?**

Ở đây giới thiệu hai phương án khả thi.

1. Sử dụng reflection để lấy đối tượng singleton `theUnsafe` đã được khởi tạo trong lớp Unsafe.

```java
private static Unsafe reflectGetUnsafe() {
    try {
      Field field = Unsafe.class.getDeclaredField("theUnsafe");
      field.setAccessible(true);
      return (Unsafe) field.get(null);
    } catch (Exception e) {
      log.error(e.getMessage(), e);
      return null;
    }
}
```

2. Từ điều kiện hạn chế sử dụng của phương thức `getUnsafe`, thông qua lệnh Java `-Xbootclasspath/a` thêm đường dẫn jar chứa lớp A gọi các phương thức liên quan đến Unsafe vào đường dẫn bootstrap mặc định, để A được tải bởi bootstrap class loader, từ đó an toàn lấy instance Unsafe thông qua phương thức `Unsafe.getUnsafe`.

```bash
java -Xbootclasspath/a: ${path}   // 其中path为调用Unsafe相关方法的类所在jar包路径
```

## Chức năng của Unsafe

Tổng quan, chức năng của lớp `Unsafe` có thể được chia thành 8 loại:

1. Thao tác bộ nhớ
2. Memory barrier (Rào cản bộ nhớ)
3. Thao tác đối tượng
4. Thao tác dữ liệu
5. CAS operations
6. Thread scheduling (Lập lịch thread)
7. Thao tác Class
8. Thông tin hệ thống

### Thao tác bộ nhớ

#### Giới thiệu

Nếu bạn là lập trình viên đã viết C hoặc C++, chắc chắn quen thuộc với thao tác bộ nhớ, còn trong Java không được phép thao tác trực tiếp trên bộ nhớ, việc phân bổ và thu hồi bộ nhớ đối tượng đều do JVM tự triển khai. Nhưng trong `Unsafe`, các interface sau đây có thể thao tác bộ nhớ trực tiếp:

```java
//分配新的本地空间
public native long allocateMemory(long bytes);
//重新调整内存空间的大小
public native long reallocateMemory(long address, long bytes);
//将内存设置为指定值
public native void setMemory(Object o, long offset, long bytes, byte value);
//内存拷贝
public native void copyMemory(Object srcBase, long srcOffset,Object destBase, long destOffset,long bytes);
//清除内存
public native void freeMemory(long address);
```

Sử dụng code sau để kiểm tra:

```java
private void memoryTest() {
    int size = 4;
    // 1. 分配初始内存
    long oldAddr = unsafe.allocateMemory(size);
    System.out.println("Initial address: " + oldAddr);

    // 2. 向初始内存写入数据
    unsafe.putInt(oldAddr, 16843009); // 写入 0x01010101
    System.out.println("Value at oldAddr: " + unsafe.getInt(oldAddr));

    // 3. 重新分配内存
    long newAddr = unsafe.reallocateMemory(oldAddr, size * 2);
    System.out.println("New address: " + newAddr);

    // 4. reallocateMemory 已经将数据从 oldAddr 拷贝到 newAddr
    // 所以 newAddr 的前4个字节应该和 oldAddr 的内容一样
    System.out.println("Value at newAddr (first 4 bytes): " + unsafe.getInt(newAddr));

    // 关键：之后所有操作都应该基于 newAddr，oldAddr 已失效！
    try {
        // 5. 在新内存块的后半部分写入新数据
        unsafe.putInt(newAddr + size, 33686018); // 写入 0x02020202

        // 6. 读取整个8字节的long值
        System.out.println("Value at newAddr (full 8 bytes): " + unsafe.getLong(newAddr));

    } finally {
        // 7. 只释放最后有效的内存地址
        unsafe.freeMemory(newAddr);
        // 如果尝试 freeMemory(oldAddr)，将会导致 double free 错误！
    }
}
```

Xem kết quả đầu ra trước:

```plain
Initial address: 140467048086752
Value at oldAddr: 16843009
New address: 140467048086752
Value at newAddr (first 4 bytes): 16843009
Value at newAddr (full 8 bytes): 144680345659310337
```

Hành vi của `reallocateMemory` tương tự hàm realloc trong C, nó sẽ cố gắng mở rộng hoặc thu nhỏ khối bộ nhớ mà không di chuyển dữ liệu. Hành vi của nó chủ yếu có hai trường hợp:

1. **Mở rộng tại chỗ**: Nếu sau khối bộ nhớ hiện tại có đủ không gian trống liên tục, `reallocateMemory` sẽ mở rộng trực tiếp trên địa chỉ gốc và trả về địa chỉ gốc.
2. **Mở rộng ở chỗ khác**: Nếu sau khối bộ nhớ hiện tại không đủ không gian, nó sẽ tìm một vùng bộ nhớ mới đủ lớn, sao chép dữ liệu cũ sang đó, sau đó giải phóng địa chỉ bộ nhớ cũ và trả về địa chỉ mới.

**Kết hợp với kết quả chạy lần này, chúng ta có thể phân tích như sau:**

**Bước một: Phân bổ ban đầu và ghi**

- `unsafe.allocateMemory(size)` phân bổ 4 byte bộ nhớ ngoài heap, địa chỉ là `140467048086752`.
- `unsafe.putInt(oldAddr, 16843009)` ghi giá trị int `16843009` vào địa chỉ đó, biểu diễn hex là `0x01010101`. `getInt` đọc đúng, chứng tỏ ghi thành công.

**Bước hai: Mở rộng bộ nhớ tại chỗ**

- `long newAddr = unsafe.reallocateMemory(oldAddr, size * 2)` cố gắng mở rộng khối bộ nhớ lên 8 byte.
- Quan sát đầu ra New address: `140467048086752`, chúng ta thấy `newAddr` và `oldAddr` **hoàn toàn giống nhau**.
- Điều này chứng tỏ lần này kích hoạt "mở rộng tại chỗ". Hệ thống tìm thấy đủ không gian sau địa chỉ `140467048086752`, trực tiếp mở rộng khối bộ nhớ lên 8 byte. Trong quá trình này, địa chỉ cũ `oldAddr` vẫn hợp lệ và chính là `newAddr`, dữ liệu không bị di chuyển.

**Bước ba: Xác minh dữ liệu và ghi dữ liệu mới**

- `unsafe.getInt(newAddr)` đọc lại 4 byte đầu, kết quả vẫn là `16843009`, xác minh dữ liệu gốc còn nguyên vẹn.
- `unsafe.putInt(newAddr + size, 33686018)` ghi giá trị int mới `33686018` (hex là `0x02020202`) vào 4 byte sau phần được mở rộng (offset là 4).

**Bước bốn: Đọc dữ liệu đầy đủ**

- `unsafe.getLong(newAddr)` đọc một giá trị long (8 byte) từ địa chỉ bắt đầu. Lúc này 8 byte trong bộ nhớ là sự ghép nối của `0x01010101` (địa chỉ thấp) và `0x02020202` (địa chỉ cao).
- Trên máy Little-Endian, 8 byte này sẽ được diễn giải là số hex `0x0202020201010101`.
- Số hex này chuyển sang thập phân, kết quả chính là `144680345659310337`. Điều này giải thích hoàn hảo kết quả đầu ra cuối cùng.

**Bước năm: Giải phóng bộ nhớ an toàn**

- Trong khối `finally`, `unsafe.freeMemory(newAddr)` giải phóng an toàn toàn bộ khối bộ nhớ 8 byte.
- Vì lần này là mở rộng tại chỗ (`oldAddr == newAddr`), nên nếu nhầm viết thêm `freeMemory(oldAddr)` cũng sẽ gây ra lỗi double free nghiêm trọng.

#### Ứng dụng điển hình

`DirectByteBuffer` là một lớp quan trọng mà Java dùng để triển khai bộ nhớ ngoài heap, thường được dùng làm buffer pool trong quá trình truyền thông, như được áp dụng rộng rãi trong các NIO framework như Netty, MINA. Logic tạo, sử dụng, hủy bộ nhớ ngoài heap của `DirectByteBuffer` đều được triển khai bởi API bộ nhớ ngoài heap mà Unsafe cung cấp.

**Tại sao phải sử dụng bộ nhớ ngoài heap?**

- Cải thiện dừng garbage collection. Vì bộ nhớ ngoài heap được quản lý trực tiếp bởi hệ điều hành chứ không phải JVM, nên khi sử dụng bộ nhớ ngoài heap có thể duy trì quy mô bộ nhớ heap nhỏ hơn. Từ đó giảm ảnh hưởng của dừng thu hồi khi GC đối với ứng dụng.
- Nâng cao hiệu suất I/O của chương trình. Thường trong quá trình truyền thông I/O, có thao tác sao chép dữ liệu từ bộ nhớ trong heap sang bộ nhớ ngoài heap, đối với dữ liệu tạm thời cần thường xuyên sao chép dữ liệu giữa các bộ nhớ và có vòng đời ngắn, đều khuyến nghị lưu trữ trong bộ nhớ ngoài heap.

Hình dưới đây là constructor của `DirectByteBuffer`, khi tạo `DirectByteBuffer`, phân bổ bộ nhớ thông qua `Unsafe.allocateMemory`, khởi tạo bộ nhớ qua `Unsafe.setMemory`, sau đó xây dựng đối tượng `Cleaner` dùng để theo dõi garbage collection của đối tượng `DirectByteBuffer`, để khi `DirectByteBuffer` bị thu gom rác, bộ nhớ ngoài heap được phân bổ cũng được giải phóng cùng.

```java
DirectByteBuffer(int cap) {                   // package-private

    super(-1, 0, cap, cap);
    boolean pa = VM.isDirectMemoryPageAligned();
    int ps = Bits.pageSize();
    long size = Math.max(1L, (long)cap + (pa ? ps : 0));
    Bits.reserveMemory(size, cap);

    long base = 0;
    try {
        // 分配内存并返回基地址
        base = unsafe.allocateMemory(size);
    } catch (OutOfMemoryError x) {
        Bits.unreserveMemory(size, cap);
        throw x;
    }
    // 内存初始化
    unsafe.setMemory(base, size, (byte) 0);
    if (pa && (base % ps != 0)) {
        // Round up to page boundary
        address = base + ps - (base & (ps - 1));
    } else {
        address = base;
    }
    // 跟踪 DirectByteBuffer 对象的垃圾回收，以实现堆外内存释放
    cleaner = Cleaner.create(this, new Deallocator(base, size, cap));
    att = null;
}
```

### Memory Barrier (Rào cản bộ nhớ)

#### Giới thiệu

Trước khi giới thiệu memory barrier, cần biết rằng compiler và CPU sẽ sắp xếp lại code trong khi đảm bảo kết quả đầu ra của chương trình nhất quán, nhằm nâng cao hiệu suất từ góc độ tối ưu hóa lệnh. Còn việc sắp xếp lại lệnh có thể mang lại kết quả không tốt, dẫn đến dữ liệu không nhất quán giữa cache CPU tốc độ cao và bộ nhớ, còn memory barrier (`Memory Barrier`) ngăn chặn việc sắp xếp lại lệnh ở hai phía của rào cản từ đó tránh tình trạng tối ưu hóa không chính xác của compiler và phần cứng.

Ở tầng phần cứng, memory barrier là lệnh CPU cung cấp để ngăn code sắp xếp lại, cách triển khai memory barrier trên các nền tảng phần cứng khác nhau có thể không giống nhau. Trong Java 8, đã giới thiệu 3 hàm memory barrier, nó che giấu sự khác biệt ở tầng dưới của hệ điều hành, cho phép định nghĩa trong code và thống nhất do JVM sinh ra lệnh memory barrier, để thực hiện chức năng memory barrier.

`Unsafe` cung cấp ba phương thức liên quan đến memory barrier sau:

```java
//内存屏障，禁止load操作重排序。屏障前的load操作不能被重排序到屏障后，屏障后的load操作不能被重排序到屏障前
public native void loadFence();
//内存屏障，禁止store操作重排序。屏障前的store操作不能被重排序到屏障后，屏障后的store操作不能被重排序到屏障前
public native void storeFence();
//内存屏障，禁止load、store操作重排序
public native void fullFence();
```

Memory barrier có thể xem như một điểm đồng bộ trong thao tác truy cập bộ nhớ ngẫu nhiên, làm cho tất cả các thao tác đọc ghi trước điểm này đều thực thi xong trước khi bắt đầu thực thi các thao tác sau điểm này. Lấy phương thức `loadFence` làm ví dụ, nó sẽ ngăn sắp xếp lại thao tác đọc, đảm bảo tất cả thao tác đọc trước rào cản này đều đã hoàn thành, và đặt dữ liệu cache là không hợp lệ, tải lại từ main memory.

Thấy đây ước chừng nhiều bạn sẽ nghĩ đến từ khóa `volatile`, nếu thêm từ khóa `volatile` vào field thì có thể thực hiện khả năng hiển thị của field trong đa luồng. Dựa trên read memory barrier, chúng ta cũng có thể thực hiện cùng chức năng. Dưới đây định nghĩa một lớp thread, trong thread đó sửa đổi flag, lưu ý ở đây `flag` không được đánh dấu bởi `volatile`:

```java
@Getter
class ChangeThread implements Runnable{
    /**volatile**/ boolean flag=false;
    @Override
    public void run() {
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("subThread change flag to:" + flag);
        flag = true;
    }
}
```

Trong vòng lặp `while` của main thread, thêm memory barrier, kiểm tra xem có thể nhận biết được sự thay đổi của `flag` hay không:

```java
public static void main(String[] args){
    ChangeThread changeThread = new ChangeThread();
    new Thread(changeThread).start();
    while (true) {
        boolean flag = changeThread.isFlag();
        unsafe.loadFence(); //加入读内存屏障
        if (flag){
            System.out.println("detected flag changed");
            break;
        }
    }
    System.out.println("main thread end");
}
```

Kết quả chạy:

```plain
subThread change flag to:false
detected flag changed
main thread end
```

Còn nếu xóa phương thức `loadFence` trong code trên, thì main thread sẽ không thể nhận biết sự thay đổi của `flag`, sẽ liên tục lặp trong `while`. Có thể dùng hình để biểu diễn quá trình trên:

![](/images/github/javaguide/java/basis/unsafe/image-20220717144703446.png)

Các bạn hiểu Java Memory Model (`JMM`) nên biết, thread đang chạy không đọc trực tiếp biến trong main memory, chỉ có thể thao tác biến trong working memory của mình, sau đó đồng bộ lên main memory, và working memory của thread không thể chia sẻ. Quy trình trong hình trên là thread con thông qua main memory đồng bộ kết quả đã sửa đổi cho main thread, từ đó sửa đổi working space của main thread, thoát khỏi vòng lặp.

#### Ứng dụng điển hình

Trong Java 8 đã giới thiệu một cơ chế khóa mới — `StampedLock`, có thể xem đây là phiên bản cải tiến của read-write lock. `StampedLock` cung cấp một triển khai optimistic read lock, loại optimistic read lock này tương tự như thao tác không khóa, hoàn toàn không chặn write thread lấy write lock, từ đó giảm nhẹ hiện tượng "đói" của write thread khi đọc nhiều ghi ít. Vì optimistic read lock của `StampedLock` không chặn write thread lấy read lock, khi biến chia sẻ thread được load từ main memory sang working memory thread, sẽ có vấn đề dữ liệu không nhất quán.

Để giải quyết vấn đề này, phương thức `validate` của `StampedLock` sẽ thêm một `load` memory barrier thông qua phương thức `loadFence` của `Unsafe`.

```java
public boolean validate(long stamp) {
   U.loadFence();
   return (stamp & SBITS) == (state & SBITS);
}
```

### Thao tác đối tượng

#### Giới thiệu

**Ví dụ**

```java
import sun.misc.Unsafe;
import java.lang.reflect.Field;

public class Main {

    private int value;

    public static void main(String[] args) throws Exception{
        Unsafe unsafe = reflectGetUnsafe();
        assert unsafe != null;
        long offset = unsafe.objectFieldOffset(Main.class.getDeclaredField("value"));
        Main main = new Main();
        System.out.println("value before putInt: " + main.value);
        unsafe.putInt(main, offset, 42);
        System.out.println("value after putInt: " + main.value);
  System.out.println("value after putInt: " + unsafe.getInt(main, offset));
    }

    private static Unsafe reflectGetUnsafe() {
        try {
            Field field = Unsafe.class.getDeclaredField("theUnsafe");
            field.setAccessible(true);
            return (Unsafe) field.get(null);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

}
```

Kết quả đầu ra:

```plain
value before putInt: 0
value after putInt: 42
value after putInt: 42
```

**Thuộc tính đối tượng**

Việc lấy memory offset của thuộc tính thành viên đối tượng, và sửa đổi giá trị thuộc tính field, chúng ta đã kiểm tra trong ví dụ trên. Ngoài các phương thức `putInt`, `getInt` đề cập trước đó, Unsafe còn cung cấp phương thức `put` và `get` cho toàn bộ 8 kiểu dữ liệu cơ bản và `Object`, và tất cả các phương thức `put` đều có thể vượt qua quyền truy cập, trực tiếp sửa đổi dữ liệu trong bộ nhớ. Đọc comment trong source code openJDK phát hiện, đọc ghi kiểu dữ liệu cơ bản và `Object` có chút khác nhau, kiểu dữ liệu cơ bản thao tác trực tiếp trên giá trị thuộc tính (`value`), còn thao tác của `Object` dựa trên giá trị tham chiếu (`reference value`). Dưới đây là phương thức đọc ghi của `Object`:

```java
//在对象的指定偏移地址获取一个对象引用
public native Object getObject(Object o, long offset);
//在对象指定偏移地址写入一个对象引用
public native void putObject(Object o, long offset, Object x);
```

Ngoài đọc ghi thông thường thuộc tính đối tượng, `Unsafe` còn cung cấp phương thức **volatile read/write** và **ordered write**. Phạm vi bao phủ của phương thức volatile read/write giống với đọc ghi thông thường, bao gồm toàn bộ kiểu dữ liệu cơ bản và kiểu `Object`, lấy kiểu `int` làm ví dụ:

```java
//在对象的指定偏移地址处读取一个int值，支持volatile load语义
public native int getIntVolatile(Object o, long offset);
//在对象指定偏移地址处写入一个int，支持volatile store语义
public native void putIntVolatile(Object o, long offset, int x);
```

So với đọc ghi thông thường, volatile read/write có chi phí cao hơn, vì nó cần đảm bảo khả năng hiển thị và tính thứ tự. Khi thực thi thao tác `get`, sẽ bắt buộc lấy giá trị thuộc tính từ main memory, khi dùng phương thức `put` đặt giá trị thuộc tính, sẽ bắt buộc cập nhật giá trị lên main memory, từ đó đảm bảo những thay đổi này hiển thị với các thread khác.

Các phương thức ordered write có ba loại sau:

```java
public native void putOrderedObject(Object o, long offset, Object x);
public native void putOrderedInt(Object o, long offset, int x);
public native void putOrderedLong(Object o, long offset, long x);
```

Chi phí của ordered write thấp hơn so với `volatile`, vì nó chỉ đảm bảo tính thứ tự khi ghi, chứ không đảm bảo khả năng hiển thị, nghĩa là giá trị một thread ghi không đảm bảo ngay lập tức hiển thị với các thread khác. Để giải quyết sự khác biệt ở đây, cần bổ sung thêm kiến thức về memory barrier, trước tiên cần hiểu hai khái niệm lệnh:

- `Load`: Sao chép dữ liệu từ main memory vào cache của processor
- `Store`: Đẩy dữ liệu trong cache của processor lên main memory

Sự khác biệt giữa ordered write và `volatile` write là, trong ordered write thêm memory barrier kiểu `StoreStore`, còn trong `volatile` write thêm memory barrier là kiểu `StoreLoad`, như hình dưới đây:

![](/images/github/javaguide/java/basis/unsafe/image-20220717144834132.png)

Trong phương thức ordered write, sử dụng rào cản `StoreStore`, rào cản này đảm bảo `Store1` ngay lập tức đẩy dữ liệu lên bộ nhớ, thao tác này trước `Store2` và các lệnh lưu trữ tiếp theo. Còn trong `volatile` write, sử dụng rào cản `StoreLoad`, rào cản này đảm bảo `Store1` ngay lập tức đẩy dữ liệu lên bộ nhớ, thao tác này trước `Load2` và các lệnh tải tiếp theo, và, rào cản `StoreLoad` sẽ làm tất cả các lệnh truy cập bộ nhớ trước rào cản đó, bao gồm lệnh lưu trữ và lệnh truy cập đều hoàn thành xong, mới thực thi các lệnh truy cập bộ nhớ sau rào cản đó.

Tóm lại, trong ba loại phương thức ghi ở trên, về hiệu quả ghi, theo thứ tự `put`, `putOrder`, `putVolatile` hiệu quả giảm dần.

**Khởi tạo instance đối tượng**

Sử dụng phương thức `allocateInstance` của `Unsafe`, cho phép chúng ta thực hiện khởi tạo đối tượng bằng cách không thông thường, trước tiên định nghĩa một entity class và gán giá trị cho biến thành viên trong constructor:

```java
@Data
public class A {
    private int b;
    public A(){
        this.b =1;
    }
}
```

So sánh các cách tạo đối tượng khác nhau dựa trên constructor, reflection và phương thức `Unsafe`:

```java
public void objTest() throws Exception{
    A a1=new A();
    System.out.println(a1.getB());
    A a2 = A.class.newInstance();
    System.out.println(a2.getB());
    A a3= (A) unsafe.allocateInstance(A.class);
    System.out.println(a3.getB());
}
```

Kết quả in lần lượt là 1, 1, 0, chứng tỏ trong quá trình tạo đối tượng thông qua phương thức `allocateInstance`, constructor của class sẽ không được gọi. Khi tạo đối tượng bằng cách này, chỉ sử dụng đối tượng `Class`, vì vậy nếu muốn bỏ qua giai đoạn khởi tạo đối tượng hoặc bỏ qua kiểm tra bảo mật của constructor, có thể dùng phương thức này. Trong ví dụ trên, nếu thay đổi constructor của class A thành `private`, sẽ không thể tạo đối tượng thông qua constructor và reflection (có thể tạo đối tượng thông qua constructor object sau khi setAccessible), nhưng phương thức `allocateInstance` vẫn có hiệu lực.

#### Ứng dụng điển hình

- **Cách khởi tạo đối tượng thông thường**: Các cách tạo đối tượng mà chúng ta thường dùng, về bản chất đều được triển khai thông qua cơ chế new. Nhưng cơ chế new có đặc điểm là khi class chỉ cung cấp constructor có tham số mà không khai báo rõ ràng constructor không tham số, thì phải dùng constructor có tham số để xây dựng đối tượng, và khi dùng constructor có tham số, phải truyền số lượng tham số tương ứng mới hoàn thành khởi tạo đối tượng.
- **Cách khởi tạo không thông thường**: Còn trong Unsafe cung cấp phương thức allocateInstance, chỉ thông qua đối tượng Class có thể tạo instance của class đó, và không cần gọi constructor, code khởi tạo, kiểm tra bảo mật JVM, v.v. Nó ngăn chặn kiểm tra modifier, nghĩa là dù constructor được đánh dấu private cũng có thể khởi tạo thông qua phương thức này, chỉ cần cung cấp đối tượng class là có thể tạo đối tượng tương ứng. Do tính năng này, allocateInstance được áp dụng trong java.lang.invoke, Objenesis (cung cấp cách sinh đối tượng bỏ qua constructor class), Gson (dùng khi deserialize), v.v.

### Thao tác mảng

#### Giới thiệu

`arrayBaseOffset` và `arrayIndexScale` kết hợp với nhau có thể định vị vị trí của mỗi phần tử trong mảng trong bộ nhớ.

```java
//返回数组中第一个元素的偏移地址
public native int arrayBaseOffset(Class<?> arrayClass);
//返回数组中一个元素占用的大小
public native int arrayIndexScale(Class<?> arrayClass);
```

#### Ứng dụng điển hình

Hai phương thức liên quan đến thao tác dữ liệu này có ứng dụng điển hình trong `AtomicIntegerArray` (có thể thực hiện thao tác atomic trên mỗi phần tử của mảng `Integer`) trong package `java.util.concurrent.atomic`, như được hiển thị trong source code `AtomicIntegerArray` dưới đây, thông qua `arrayBaseOffset`, `arrayIndexScale` của `Unsafe` lấy riêng offset địa chỉ của phần tử đầu tiên của mảng `base` và nhân tố kích thước phần tử đơn `scale`. Các thao tác atomic liên quan tiếp theo đều phụ thuộc vào hai giá trị này để định vị phần tử trong mảng, như phương thức `getAndAdd` được hiển thị trong hình hai bên dưới lấy offset địa chỉ của một phần tử mảng nào đó thông qua phương thức `checkedByteOffset`, sau đó thực hiện thao tác atomic thông qua CAS.

![](/images/github/javaguide/java/basis/unsafe/image-20220717144927257.png)

### CAS Operations

#### Giới thiệu

Phần này chủ yếu là các phương thức liên quan đến CAS.

```java
/**
  *  CAS
  * @param o         包含要修改field的对象
  * @param offset    对象中某field的偏移量
  * @param expected  期望值
  * @param update    更新值
  * @return          true | false
  */
public final native boolean compareAndSwapObject(Object o, long offset,  Object expected, Object update);

public final native boolean compareAndSwapInt(Object o, long offset, int expected,int update);

public final native boolean compareAndSwapLong(Object o, long offset, long expected, long update);
```

**CAS là gì?** CAS tức là Compare And Swap (So sánh và Hoán đổi), là một kỹ thuật thường được dùng khi triển khai thuật toán đồng thời. Thao tác CAS bao gồm ba toán hạng — vị trí bộ nhớ, giá trị gốc kỳ vọng và giá trị mới. Khi thực hiện thao tác CAS, so sánh giá trị tại vị trí bộ nhớ với giá trị gốc kỳ vọng, nếu khớp thì processor sẽ tự động cập nhật giá trị tại vị trí đó thành giá trị mới, nếu không processor không làm gì. Chúng ta đều biết CAS là một lệnh atomic của CPU (lệnh cmpxchg), không gây ra vấn đề dữ liệu không nhất quán, triển khai tầng dưới của phương thức CAS mà `Unsafe` cung cấp (như `compareAndSwapXXX`) chính là lệnh CPU `cmpxchg`.

#### Ứng dụng điển hình

Trong các công cụ đồng thời của package JUC, CAS được sử dụng rộng rãi, như trong các bài giới thiệu `synchronized` và `AQS` trước đây cũng đề cập nhiều lần đến CAS, nó đóng vai trò rộng rãi với tư cách là optimistic lock trong các công cụ đồng thời. Trong lớp `Unsafe`, cung cấp phương thức `compareAndSwapObject`, `compareAndSwapInt`, `compareAndSwapLong` để triển khai thao tác CAS cho các kiểu `Object`, `int`, `long`. Lấy phương thức `compareAndSwapInt` làm ví dụ:

```java
public final native boolean compareAndSwapInt(Object o, long offset,int expected,int x);
```

Trong tham số, `o` là đối tượng cần cập nhật, `offset` là offset của field kiểu int trong đối tượng `o`, nếu giá trị field này giống với `expected`, thì đặt giá trị field thành giá trị mới `x`, và cập nhật này không thể bị gián đoạn, tức là một thao tác atomic. Dưới đây là ví dụ sử dụng `compareAndSwapInt`:

```java
private volatile int a;
public static void main(String[] args){
    CasTest casTest=new CasTest();
    new Thread(()->{
        for (int i = 1; i < 5; i++) {
            casTest.increment(i);
            System.out.print(casTest.a+" ");
        }
    }).start();
    new Thread(()->{
        for (int i = 5 ; i <10 ; i++) {
            casTest.increment(i);
            System.out.print(casTest.a+" ");
        }
    }).start();
}

private void increment(int x){
    while (true){
        try {
            long fieldOffset = unsafe.objectFieldOffset(CasTest.class.getDeclaredField("a"));
            if (unsafe.compareAndSwapInt(this,fieldOffset,x-1,x))
                break;
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
    }
}
```

Chạy code sẽ lần lượt in:

```plain
1 2 3 4 5 6 7 8 9
```

Nếu bạn dán đoạn code trên vào IDE và chạy, sẽ phát hiện không thể nhận được kết quả đầu ra mong muốn. Có bạn đã chỉ ra vấn đề này trên Github: [issue#2650](https://github.com/Snailclimb/JavaGuide/issues/2650). Dưới đây là code đã được sửa:

```java
// 将递增和打印操作封装在一个原子性更强的方法内
private void incrementAndPrint(int targetValue) {
    while (true) {
        int currentValue = a; // 读取当前 a 的值
        // 如果当前值已经达到或超过目标值，说明已被其他线程处理，跳过
        if (currentValue >= targetValue) {
            return;
        }
        // 尝试 CAS 操作：如果当前值等于 targetValue - 1，则原子地设置为 targetValue
        if (unsafe.compareAndSwapInt(this, fieldOffset, currentValue, targetValue)) {
            // CAS 成功后立即打印，确保打印的就是本次设置的值
            System.out.print(targetValue + " ");
            return;
        }
        // CAS 失败，重新读取并重试
    }
}
```

Trong ví dụ trên, chúng ta tạo hai thread, cả hai đều cố gắng sửa đổi biến chia sẻ a. Mỗi thread khi gọi phương thức `incrementAndPrint(targetValue)`:

1. Trước tiên đọc giá trị hiện tại của a `currentValue`.
2. Kiểm tra xem `currentValue` có bằng `targetValue - 1` không (tức là giá trị trước kỳ vọng).
3. Nếu điều kiện thỏa mãn, gọi `unsafe.compareAndSwapInt()` cố gắng cập nhật `a` từ `currentValue` sang `targetValue`.
4. Nếu thao tác CAS thành công (trả về true), in `targetValue` và thoát khỏi vòng lặp.
5. Nếu thao tác CAS thất bại, có nghĩa là có thread khác đang cạnh tranh đồng thời, lúc này sẽ đọc lại `currentValue` và retry, cho đến khi thành công.

Cơ chế này đảm bảo mỗi số (từ 1 đến 9) chỉ được đặt thành công và in một lần, và theo thứ tự.

![](/images/github/javaguide/java/basis/unsafe/image-20220717144939826.png)

Cần lưu ý:

1. **Logic spin:** Bản thân phương thức `compareAndSwapInt` chỉ thực thi một lần thao tác so sánh và hoán đổi, và ngay lập tức trả về kết quả. Do đó, để đảm bảo thao tác cuối cùng thành công (khi giá trị phù hợp với kỳ vọng), chúng ta cần triển khai rõ ràng logic spin (như vòng lặp `while(true)`) trong code, liên tục thử cho đến khi thao tác CAS thành công.
2. **Triển khai của `AtomicInteger`:** Lớp `java.util.concurrent.atomic.AtomicInteger` trong JDK bên trong chính sử dụng thao tác CAS và logic spin tương tự để triển khai các phương thức atomic `getAndIncrement()`, `compareAndSet()`, v.v. Trực tiếp sử dụng `AtomicInteger` thường là cách an toàn và được khuyến nghị hơn, vì nó đóng gói sự phức tạp ở tầng dưới.
3. **Vấn đề ABA:** Bản thân thao tác CAS tồn tại vấn đề ABA (một giá trị từ A thay đổi thành B, rồi thay đổi lại A, khi CAS kiểm tra sẽ cho rằng giá trị không thay đổi). Trong một số tình huống, nếu lịch sử thay đổi giá trị quan trọng, có thể cần dùng `AtomicStampedReference` để giải quyết. Nhưng trong tình huống đơn giản tăng dần như ví dụ này, vấn đề ABA thường không ảnh hưởng.
4. **Tiêu thụ CPU:** Spin kéo dài sẽ tiêu thụ tài nguyên CPU. Trong trường hợp cạnh tranh khốc liệt hoặc điều kiện không thỏa mãn trong thời gian dài, có thể xem xét thêm chiến lược backoff phức tạp hơn (như `Thread.sleep()` hoặc `LockSupport.parkNanos()`) để tối ưu.

### Thread Scheduling (Lập lịch thread)

#### Giới thiệu

Lớp `Unsafe` cung cấp các phương thức `park`, `unpark`, `monitorEnter`, `monitorExit`, `tryMonitorEnter` để lập lịch thread.

```java
//取消阻塞线程
public native void unpark(Object thread);
//阻塞线程
public native void park(boolean isAbsolute, long time);
//获得对象锁（可重入锁）
@Deprecated
public native void monitorEnter(Object o);
//释放对象锁
@Deprecated
public native void monitorExit(Object o);
//尝试获取对象锁
@Deprecated
public native boolean tryMonitorEnter(Object o);
```

Phương thức `park`, `unpark` có thể thực hiện treo và khôi phục thread, treo một thread được triển khai thông qua phương thức `park`, sau khi gọi phương thức `park`, thread sẽ liên tục bị block cho đến khi timeout hoặc xuất hiện điều kiện ngắt; `unpark` có thể kết thúc một thread đang bị treo, khiến nó khôi phục bình thường.

Ngoài ra, ba phương thức liên quan đến `monitor` trong source code `Unsafe` đã được đánh dấu là `deprecated`, không nên được sử dụng:

```java
//获得对象锁
@Deprecated
public native void monitorEnter(Object var1);
//释放对象锁
@Deprecated
public native void monitorExit(Object var1);
//尝试获得对象锁
@Deprecated
public native boolean tryMonitorEnter(Object var1);
```

Phương thức `monitorEnter` dùng để lấy object lock, `monitorExit` dùng để giải phóng object lock, nếu thực thi phương thức này trên một đối tượng chưa được `monitorEnter` khóa, sẽ ném ngoại lệ `IllegalMonitorStateException`. Phương thức `tryMonitorEnter` cố gắng lấy object lock, nếu thành công trả về `true`, ngược lại trả về `false`.

#### Ứng dụng điển hình

Lớp core của framework khóa và đồng bộ Java `AbstractQueuedSynchronizer` (AQS), thực hiện block và wake up thread thông qua gọi `LockSupport.park()` và `LockSupport.unpark()`, còn phương thức `park`, `unpark` của `LockSupport` thực ra được triển khai bằng cách gọi `park`, `unpark` của `Unsafe`.

```java
public static void park(Object blocker) {
    Thread t = Thread.currentThread();
    setBlocker(t, blocker);
    UNSAFE.park(false, 0L);
    setBlocker(t, null);
}
public static void unpark(Thread thread) {
    if (thread != null)
        UNSAFE.unpark(thread);
}
```

Phương thức `park` của `LockSupport` gọi phương thức `park` của `Unsafe` để block thread hiện tại, phương thức này sau khi block thread sẽ không tiếp tục thực thi về phía sau, cho đến khi có thread khác gọi phương thức `unpark` đánh thức thread hiện tại. Ví dụ dưới đây kiểm tra hai phương thức này của `Unsafe`:

```java
public static void main(String[] args) {
    Thread mainThread = Thread.currentThread();
    new Thread(()->{
        try {
            TimeUnit.SECONDS.sleep(5);
            System.out.println("subThread try to unpark mainThread");
            unsafe.unpark(mainThread);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }).start();

    System.out.println("park main mainThread");
    unsafe.park(false,0L);
    System.out.println("unpark mainThread success");
}
```

Đầu ra chương trình:

```plain
park main mainThread
subThread try to unpark mainThread
unpark mainThread success
```

Luồng chạy chương trình cũng khá dễ hiểu, thread con sau khi bắt đầu chạy trước tiên ngủ, đảm bảo main thread có thể gọi phương thức `park` để block chính nó, thread con sau khi ngủ 5 giây, gọi phương thức `unpark` đánh thức main thread, để main thread có thể tiếp tục thực thi. Toàn bộ luồng như hình dưới đây:

![](/images/github/javaguide/java/basis/unsafe/image-20220717144950116.png)

### Thao tác Class

#### Giới thiệu

Các thao tác liên quan đến `Class` của `Unsafe` chủ yếu bao gồm các phương thức tải class và thao tác biến tĩnh.

**Các phương thức liên quan đến đọc thuộc tính tĩnh**

```java
//获取静态属性的偏移量
public native long staticFieldOffset(Field f);
//获取静态属性的对象指针
public native Object staticFieldBase(Field f);
//判断类是否需要初始化（用于获取类的静态属性前进行检测）
public native boolean shouldBeInitialized(Class<?> c);
```

Tạo một class chứa thuộc tính tĩnh, tiến hành kiểm tra:

```java
@Data
public class User {
    public static String name="Hydra";
    int age;
}
private void staticTest() throws Exception {
    User user=new User();
    // 也可以用下面的语句触发类初始化
    // 1.
    // unsafe.ensureClassInitialized(User.class);
    // 2.
    // System.out.println(User.name);
    System.out.println(unsafe.shouldBeInitialized(User.class));
    Field sexField = User.class.getDeclaredField("name");
    long fieldOffset = unsafe.staticFieldOffset(sexField);
    Object fieldBase = unsafe.staticFieldBase(sexField);
    Object object = unsafe.getObject(fieldBase, fieldOffset);
    System.out.println(object);
}
```

Kết quả chạy:

```plain
false
Hydra
```

Trong thao tác đối tượng của `Unsafe`, chúng ta học được cách lấy offset thuộc tính đối tượng thông qua phương thức `objectFieldOffset` và dựa vào đó để đọc ghi giá trị biến, nhưng nó không áp dụng cho thuộc tính tĩnh trong class, lúc này cần dùng phương thức `staticFieldOffset`. Trong code trên, chỉ trong quá trình lấy đối tượng `Field` mới phụ thuộc vào `Class`, còn khi lấy thuộc tính biến tĩnh không còn phụ thuộc vào `Class` nữa.

Trong code trên trước tiên tạo một đối tượng `User`, điều này vì nếu một class chưa được khởi tạo, thì các thuộc tính tĩnh của nó cũng sẽ không được khởi tạo, thuộc tính field cuối cùng lấy được sẽ là `null`. Vì vậy trước khi lấy thuộc tính tĩnh, cần gọi phương thức `shouldBeInitialized` để xác định xem có cần khởi tạo class này trước khi lấy hay không. Nếu xóa câu lệnh tạo đối tượng User, kết quả chạy sẽ trở thành:

```plain
true
null
```

**Sử dụng phương thức `defineClass` cho phép chương trình động tạo một class khi runtime**

```java
public native Class<?> defineClass(String name, byte[] b, int off, int len, ClassLoader loader,ProtectionDomain protectionDomain);
```

Trong quá trình sử dụng thực tế, chỉ cần truyền vào mảng byte, chỉ số byte bắt đầu và độ dài byte đọc, mặc định class loader (`ClassLoader`) và protection domain (`ProtectionDomain`) đến từ instance gọi phương thức này. Ví dụ dưới đây triển khai chức năng decompile file class đã được tạo ra:

```java
private static void defineTest() {
    String fileName="F:\\workspace\\unsafe-test\\target\\classes\\com\\cn\\model\\User.class";
    File file = new File(fileName);
    try(FileInputStream fis = new FileInputStream(file)) {
        byte[] content=new byte[(int)file.length()];
        fis.read(content);
        Class clazz = unsafe.defineClass(null, content, 0, content.length, null, null);
        Object o = clazz.newInstance();
        Object age = clazz.getMethod("getAge").invoke(o, null);
        System.out.println(age);
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

Trong code trên, trước tiên đọc file `class` và chuyển đổi thành mảng byte thông qua file stream, sau đó dùng phương thức `defineClass` động tạo một class, và hoàn thành công việc khởi tạo nó trong phần tiếp theo, quy trình như hình dưới đây, và class được tạo theo cách này sẽ bỏ qua tất cả kiểm tra bảo mật của JVM.

![](/images/github/javaguide/java/basis/unsafe/image-20220717145000710.png)

Ngoài phương thức `defineClass`, Unsafe còn cung cấp phương thức `defineAnonymousClass`:

```java
public native Class<?> defineAnonymousClass(Class<?> hostClass, byte[] data, Object[] cpPatches);
```

Sử dụng phương thức này có thể động tạo một anonymous class, trong biểu thức `Lambda` sử dụng ASM để động sinh bytecode, sau đó dùng phương thức này để định nghĩa anonymous class triển khai functional interface tương ứng. Trong tính năng mới phát hành JDK 15, trong mục hidden class (`Hidden classes`), chỉ ra rằng sẽ deprecated phương thức `defineAnonymousClass` của `Unsafe` trong các phiên bản tương lai.

#### Ứng dụng điển hình

Triển khai Lambda expression cần phụ thuộc phương thức `defineAnonymousClass` của `Unsafe` để định nghĩa anonymous class triển khai functional interface tương ứng.

### Thông tin hệ thống

#### Giới thiệu

Phần này bao gồm hai phương thức lấy thông tin liên quan đến hệ thống.

```java
//返回系统指针的大小。返回值为4（32位系统）或 8（64位系统）。
public native int addressSize();
//内存页的大小，此值为2的幂次方。
public native int pageSize();
```

#### Ứng dụng điển hình

Hai phương thức này có phạm vi ứng dụng khá ít, trong lớp `java.nio.Bits`, khi sử dụng `pageCount` tính số trang bộ nhớ cần thiết, gọi phương thức `pageSize` để lấy kích thước trang bộ nhớ. Ngoài ra, khi sử dụng phương thức `copySwapMemory` để sao chép bộ nhớ, gọi phương thức `addressSize` để kiểm tra tình trạng hệ thống 32 bit.

## Tổng kết

Trong bài viết này, chúng ta trước tiên giới thiệu khái niệm cơ bản và nguyên lý hoạt động của `Unsafe`, và trên cơ sở đó đã giải thích và thực hành API của nó. Tin rằng qua quá trình này, mọi người có thể nhận ra rằng `Unsafe` trong một số tình huống nhất định thực sự có thể cung cấp sự tiện lợi trong lập trình cho chúng ta. Nhưng quay lại chủ đề ban đầu, khi sử dụng những tiện lợi này, thực sự tồn tại một số ẩn họa về bảo mật, theo tôi, một công nghệ có yếu tố không an toàn không đáng sợ, điều đáng sợ là nó bị lạm dụng trong quá trình sử dụng. Mặc dù trước đây có tin đồn rằng lớp `Unsafe` sẽ bị loại bỏ trong Java 9, nhưng nó vẫn đã tồn tại đến Java 16. Theo logic tồn tại có lý do, chỉ cần sử dụng đúng cách, nó vẫn có thể mang lại nhiều trợ giúp cho chúng ta, vì vậy cuối cùng vẫn khuyến nghị mọi người, khi sử dụng `Unsafe` nhất định phải thận trọng, tránh lạm dụng.

<!-- @include: @article-footer.snippet.md -->
