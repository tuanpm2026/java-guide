---
title: Giải thích chi tiết ThreadLocal
description: "Phân tích chuyên sâu ThreadLocal: giải thích nguyên lý biến cục bộ luồng, cơ chế ThreadLocalMap, vấn đề tham chiếu yếu và rò rỉ bộ nhớ, các trường hợp sử dụng và thực hành tốt nhất."
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: ThreadLocal,线程本地变量,ThreadLocalMap,内存泄漏,弱引用,ThreadLocal原理,线程隔离
---

> Bài viết này được đóng góp bởi 一枝花算不算浪漫, địa chỉ bài gốc: [https://juejin.cn/post/6844904151567040519](https://juejin.cn/post/6844904151567040519).

### Lời mở đầu

![](./images/thread-local/1.png)

**Toàn bài có hơn 10000 chữ, 31 hình ảnh. Bài viết này cũng tốn khá nhiều thời gian và công sức để hoàn thành. Sáng tạo không dễ, mong mọi người quan tâm và ủng hộ, cảm ơn.**

Đối với `ThreadLocal`, phản ứng đầu tiên của nhiều người có thể là: đơn giản thôi, biến bản sao của luồng, mỗi luồng cách ly nhau. Vậy có một số câu hỏi mọi người có thể suy nghĩ:

- Key của `ThreadLocal` là **tham chiếu yếu (weak reference)**, vậy khi thực hiện `ThreadLocal.get()`, sau khi **GC** xảy ra, key có phải là **null** không?
- **Cấu trúc dữ liệu** của `ThreadLocalMap` trong `ThreadLocal` là gì?
- **Thuật toán Hash** của `ThreadLocalMap`?
- Cách giải quyết **xung đột Hash** trong `ThreadLocalMap`?
- **Cơ chế mở rộng** của `ThreadLocalMap`?
- **Cơ chế dọn dẹp key hết hạn** trong `ThreadLocalMap`? Quy trình **dọn dẹp thăm dò (exploratory cleanup)** và **dọn dẹp heuristic (heuristic cleanup)**?
- Nguyên lý triển khai phương thức `ThreadLocalMap.set()`?
- Nguyên lý triển khai phương thức `ThreadLocalMap.get()`?
- Tình huống sử dụng `ThreadLocal` trong dự án? Các vấn đề gặp phải?
- ……

Bạn đã nắm vững tất cả các câu hỏi trên chưa? Bài viết này sẽ phân tích **chi tiết** `ThreadLocal` bằng hình ảnh và văn bản xung quanh những câu hỏi đó.

### Mục lục

**Lưu ý:** Mã nguồn trong bài viết này dựa trên `JDK 1.8`

### Ví dụ mã `ThreadLocal`

Trước tiên hãy xem ví dụ sử dụng `ThreadLocal`:

```java
public class ThreadLocalTest {
    private List<String> messages = Lists.newArrayList();

    public static final ThreadLocal<ThreadLocalTest> holder = ThreadLocal.withInitial(ThreadLocalTest::new);

    public static void add(String message) {
        holder.get().messages.add(message);
    }

    public static List<String> clear() {
        List<String> messages = holder.get().messages;
        holder.remove();

        System.out.println("size: " + holder.get().messages.size());
        return messages;
    }

    public static void main(String[] args) {
        ThreadLocalTest.add("一枝花算不算浪漫");
        System.out.println(holder.get().messages);
        ThreadLocalTest.clear();
    }
}
```

Kết quả in:

```java
[一枝花算不算浪漫]
size: 0
```

Đối tượng `ThreadLocal` có thể cung cấp biến cục bộ luồng, mỗi luồng `Thread` có một **biến bản sao** riêng, nhiều luồng không ảnh hưởng lẫn nhau.

### Cấu trúc dữ liệu của `ThreadLocal`

![](./images/thread-local/2.png)

Lớp `Thread` có biến thể hiện `threadLocals` kiểu `ThreadLocal.ThreadLocalMap`, nghĩa là mỗi luồng có `ThreadLocalMap` riêng của mình.

`ThreadLocalMap` có cài đặt độc lập của riêng nó, ta có thể đơn giản coi `key` của nó là `ThreadLocal`, `value` là giá trị được đặt vào trong mã (thực ra `key` không phải là bản thân `ThreadLocal`, mà là một **tham chiếu yếu** của nó).

Mỗi luồng khi đặt giá trị vào `ThreadLocal` đều sẽ lưu vào `ThreadLocalMap` của chính mình, khi đọc cũng dùng `ThreadLocal` làm tham chiếu để tìm `key` tương ứng trong `map` của mình, từ đó thực hiện **cách ly luồng**.

`ThreadLocalMap` có cấu trúc hơi giống `HashMap`, chỉ là `HashMap` được triển khai bằng **mảng + danh sách liên kết**, còn `ThreadLocalMap` không có cấu trúc **danh sách liên kết**.

Cần chú ý đến `Entry`, key của nó là `ThreadLocal<?> k`, kế thừa từ `WeakReference`, tức là loại tham chiếu yếu mà chúng ta thường nói đến.

### Sau GC, key có phải là null không?

Trả lời câu hỏi đầu bài, key của `ThreadLocal` là tham chiếu yếu, vậy khi thực hiện `ThreadLocal.get()`, sau khi xảy ra `GC`, key có phải là `null` không?

Để hiểu rõ vấn đề này, ta cần hiểu **bốn loại tham chiếu** trong `Java`:

- **Tham chiếu mạnh (Strong Reference)**: Các đối tượng được tạo bằng new thường là loại tham chiếu mạnh. Khi tham chiếu mạnh còn tồn tại, garbage collector sẽ không bao giờ thu hồi đối tượng được tham chiếu, dù bộ nhớ có thiếu
- **Tham chiếu mềm (Soft Reference)**: Đối tượng được trang trí bằng SoftReference được gọi là tham chiếu mềm, đối tượng được tham chiếu mềm trỏ đến sẽ bị thu hồi khi bộ nhớ sắp tràn
- **Tham chiếu yếu (Weak Reference)**: Đối tượng được trang trí bằng WeakReference được gọi là tham chiếu yếu, miễn là xảy ra thu gom rác, nếu đối tượng này chỉ được trỏ bởi tham chiếu yếu thì sẽ bị thu hồi
- **Tham chiếu ảo (Phantom Reference)**: Tham chiếu ảo là loại tham chiếu yếu nhất trong Java, được định nghĩa bằng PhantomReference. Tác dụng duy nhất của tham chiếu ảo là dùng hàng đợi để nhận thông báo khi đối tượng sắp chết

Tiếp theo hãy xem mã, ta dùng reflection để xem dữ liệu trong `ThreadLocal` sau `GC`: (mã dưới đây có nguồn từ: <https://blog.csdn.net/thewindkee/article/details/103726942> chạy cục bộ để demo kịch bản thu hồi GC)

```java
public class ThreadLocalDemo {

    public static void main(String[] args) throws NoSuchFieldException, IllegalAccessException, InterruptedException {
        Thread t = new Thread(()->test("abc",false));
        t.start();
        t.join();
        System.out.println("--gc后--");
        Thread t2 = new Thread(() -> test("def", true));
        t2.start();
        t2.join();
    }

    private static void test(String s,boolean isGC)  {
        try {
            new ThreadLocal<>().set(s);
            if (isGC) {
                System.gc();
            }
            Thread t = Thread.currentThread();
            Class<? extends Thread> clz = t.getClass();
            Field field = clz.getDeclaredField("threadLocals");
            field.setAccessible(true);
            Object ThreadLocalMap = field.get(t);
            Class<?> tlmClass = ThreadLocalMap.getClass();
            Field tableField = tlmClass.getDeclaredField("table");
            tableField.setAccessible(true);
            Object[] arr = (Object[]) tableField.get(ThreadLocalMap);
            for (Object o : arr) {
                if (o != null) {
                    Class<?> entryClass = o.getClass();
                    Field valueField = entryClass.getDeclaredField("value");
                    Field referenceField = entryClass.getSuperclass().getSuperclass().getDeclaredField("referent");
                    valueField.setAccessible(true);
                    referenceField.setAccessible(true);
                    System.out.println(String.format("弱引用key:%s,值:%s", referenceField.get(o), valueField.get(o)));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

Kết quả như sau:

```java
弱引用key:java.lang.ThreadLocal@433619b6,值:abc
弱引用key:java.lang.ThreadLocal@418a15e3,值:java.lang.ref.SoftReference@bf97a12
--gc后--
弱引用key:null,值:def
```

![](./images/thread-local/3.png)

Như hình, vì `ThreadLocal` được tạo ở đây không trỏ đến bất kỳ giá trị nào, tức là không có tham chiếu nào:

```java
new ThreadLocal<>().set(s);
```

Vì vậy sau `GC`, `key` sẽ bị thu hồi, ta thấy trong debug ở trên `referent=null`. Nếu **thay đổi mã một chút:**

![](./images/thread-local/4.png)

Câu hỏi này lúc mới nhìn, nếu không suy nghĩ nhiều, **tham chiếu yếu**, và **thu gom rác**, chắc chắn sẽ nghĩ là `null`.

Thực ra không đúng, vì đề bài nói đang thực hiện `ThreadLocal.get()`, chứng tỏ thực ra vẫn có **tham chiếu mạnh** tồn tại, vì vậy `key` không phải là `null`. Như hình dưới, **tham chiếu mạnh** đến `ThreadLocal` vẫn còn tồn tại.

![](./images/thread-local/5.png)

Nếu **tham chiếu mạnh** của ta không tồn tại, thì `key` sẽ bị thu hồi, tức là sẽ xảy ra tình trạng `value` không bị thu hồi, `key` bị thu hồi, dẫn đến `value` tồn tại mãi mãi, gây ra rò rỉ bộ nhớ.

### Phân tích mã nguồn phương thức `ThreadLocal.set()`

![](./images/thread-local/6.png)

Nguyên lý của phương thức `set` trong `ThreadLocal` như hình trên, rất đơn giản, chủ yếu là kiểm tra xem `ThreadLocalMap` có tồn tại hay không, sau đó dùng phương thức `set` trong `ThreadLocal` để xử lý dữ liệu.

Mã như sau:

```java
public void set(T value) {
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    if (map != null)
        map.set(this, value);
    else
        createMap(t, value);
}

void createMap(Thread t, T firstValue) {
    t.threadLocals = new ThreadLocalMap(this, firstValue);
}
```

Logic cốt lõi chính vẫn nằm trong `ThreadLocalMap`, hãy tiếp tục xem xuống, phía sau sẽ có phân tích chi tiết hơn.

### Thuật toán Hash của `ThreadLocalMap`

Vì là cấu trúc `Map`, `ThreadLocalMap` tất nhiên cũng phải triển khai thuật toán `hash` riêng để giải quyết vấn đề xung đột mảng bảng băm.

```java
int i = key.threadLocalHashCode & (len-1);
```

Thuật toán `hash` trong `ThreadLocalMap` rất đơn giản, ở đây `i` chính là chỉ số mảng tương ứng của key hiện tại trong bảng băm.

Điều quan trọng nhất ở đây là cách tính giá trị `threadLocalHashCode`. Trong `ThreadLocal` có một thuộc tính `HASH_INCREMENT = 0x61c88647`

```java
public class ThreadLocal<T> {
    private final int threadLocalHashCode = nextHashCode();

    private static AtomicInteger nextHashCode = new AtomicInteger();

    private static final int HASH_INCREMENT = 0x61c88647;

    private static int nextHashCode() {
        return nextHashCode.getAndAdd(HASH_INCREMENT);
    }

    static class ThreadLocalMap {
        ThreadLocalMap(ThreadLocal<?> firstKey, Object firstValue) {
            table = new Entry[INITIAL_CAPACITY];
            int i = firstKey.threadLocalHashCode & (INITIAL_CAPACITY - 1);

            table[i] = new Entry(firstKey, firstValue);
            size = 1;
            setThreshold(INITIAL_CAPACITY);
        }
    }
}
```

Mỗi khi tạo một đối tượng `ThreadLocal`, giá trị `ThreadLocal.nextHashCode` này sẽ tăng thêm `0x61c88647`.

Giá trị này rất đặc biệt, đó là **số Fibonacci** hay còn gọi là **tỷ lệ vàng**. Increment hash là số này mang lại lợi ích là hash **phân bố rất đều**.

Ta có thể tự thử:

![](./images/thread-local/8.png)

Có thể thấy các mã hash được tạo ra phân bố rất đều. Ở đây không đi sâu vào thuật toán **Fibonacci** cụ thể, những ai quan tâm có thể tự tìm hiểu.

### Xung đột Hash trong `ThreadLocalMap`

> **Lưu ý:** Trong tất cả các hình ví dụ dưới đây, **khối xanh** `Entry` đại diện cho **dữ liệu bình thường**, **khối xám** đại diện cho `Entry` có giá trị `key` là `null`, **đã bị thu gom rác**. **Khối trắng** đại diện cho `Entry` là `null`.

Mặc dù `ThreadLocalMap` sử dụng **tỷ lệ vàng** làm hệ số tính hash, giảm đáng kể xác suất xung đột `Hash`, nhưng vẫn sẽ có xung đột.

Cách giải quyết xung đột trong `HashMap` là xây dựng cấu trúc **danh sách liên kết** trên mảng, dữ liệu xung đột được treo vào danh sách liên kết, nếu độ dài danh sách liên kết vượt quá một số nhất định sẽ chuyển đổi thành **cây đỏ-đen**.

Còn `ThreadLocalMap` không có cấu trúc danh sách liên kết, vì vậy không thể dùng cách giải quyết xung đột của `HashMap`.

![](./images/thread-local/7.png)

Như hình trên, nếu ta chèn dữ liệu `value=27`, sau khi tính `hash` nên rơi vào slot 4, nhưng slot 4 đã có dữ liệu `Entry`.

Lúc này sẽ tìm kiếm tuyến tính về phía sau, cho đến khi tìm thấy slot có `Entry` là `null` mới dừng tìm kiếm và đặt phần tử hiện tại vào slot đó. Tất nhiên trong quá trình lặp cũng có các tình huống khác, như gặp `Entry` không phải `null` mà `key` bằng nhau, hoặc tình huống `key` trong `Entry` là `null`, v.v., đều có xử lý khác nhau, sẽ giải thích chi tiết từng cái sau.

Ở đây cũng vẽ một dữ liệu có `key` là `null` trong `Entry` (**dữ liệu khối xám Entry=2**), vì loại `key` là **tham chiếu yếu**, nên sẽ có loại dữ liệu này. Trong quá trình `set`, nếu gặp dữ liệu `Entry` với key đã hết hạn, thực ra sẽ thực hiện một vòng **dọn dẹp thăm dò**, cách thực hiện cụ thể sẽ nói sau.

### Chi tiết về `ThreadLocalMap.set()`

#### Giải thích nguyên lý `ThreadLocalMap.set()` bằng sơ đồ

Sau khi xem **thuật toán hash** của `ThreadLocal`, hãy xem cách `set` được triển khai.

Việc `set` dữ liệu vào `ThreadLocalMap` (**thêm mới** hoặc **cập nhật** dữ liệu) chia thành nhiều trường hợp, ta dùng hình vẽ để minh họa từng trường hợp.

**Trường hợp 1:** Dữ liệu `Entry` ở vị trí slot sau khi tính `hash` là rỗng:

![](./images/thread-local/9.png)

Ở đây đặt trực tiếp dữ liệu vào slot đó.

**Trường hợp 2:** Dữ liệu slot không rỗng, giá trị `key` nhất quán với giá trị `key` lấy được qua `hash` của `ThreadLocal` hiện tại:

![](./images/thread-local/10.png)

Ở đây cập nhật trực tiếp dữ liệu của slot đó.

**Trường hợp 3:** Dữ liệu slot không rỗng, trong quá trình duyệt về phía sau, trước khi tìm thấy slot có `Entry` là `null`, không gặp `Entry` với key hết hạn:

![](./images/thread-local/11.png)

Duyệt mảng băm, tìm kiếm tuyến tính về phía sau. Nếu tìm thấy slot có `Entry` là `null`, đặt dữ liệu vào slot đó; hoặc trong quá trình duyệt gặp dữ liệu có **key bằng nhau**, cập nhật trực tiếp.

**Trường hợp 4:** Dữ liệu slot không rỗng, trong quá trình duyệt về phía sau, trước khi tìm thấy slot có `Entry` là `null`, gặp `Entry` với key hết hạn. Như hình dưới, trong quá trình duyệt về phía sau, gặp dữ liệu `Entry` ở slot có chỉ số `index=7` với `key=null`:

![](./images/thread-local/12.png)

Dữ liệu `Entry` tại chỉ số mảng băm 7 có `key` là `null`, cho thấy giá trị `key` của dữ liệu này đã bị garbage collector thu hồi. Lúc này sẽ thực hiện phương thức `replaceStaleEntry()`, phương thức này có nghĩa là **logic thay thế dữ liệu hết hạn**. Bắt đầu duyệt từ **index=7** làm điểm khởi đầu, thực hiện công việc dọn dẹp dữ liệu hết hạn bằng thăm dò.

Khởi tạo vị trí bắt đầu quét dọn dẹp dữ liệu hết hạn bằng thăm dò: `slotToExpunge = staleSlot = 7`

Từ `staleSlot` hiện tại duyệt **về phía trước** tìm các dữ liệu hết hạn khác, sau đó cập nhật chỉ số bắt đầu quét `slotToExpunge`. Vòng lặp `for` lặp cho đến khi gặp `Entry` là `null` mới kết thúc.

Nếu tìm thấy dữ liệu hết hạn, tiếp tục duyệt về phía trước cho đến khi gặp slot có `Entry=null` mới dừng lặp. Như hình dưới, **slotToExpunge được cập nhật thành 0**:

![](./images/thread-local/13.png)

Duyệt về phía trước từ nút hiện tại (`index=7`), kiểm tra xem có dữ liệu `Entry` hết hạn không, nếu có thì cập nhật giá trị `slotToExpunge`. Gặp `null` thì kết thúc thăm dò. Lấy ví dụ hình trên, `slotToExpunge` được cập nhật thành 0.

Thao tác duyệt về phía trước ở trên là để cập nhật giá trị chỉ số bắt đầu `slotToExpunge` của việc dọn dẹp dữ liệu hết hạn. Giá trị này sẽ được giải thích sau, nó dùng để xác định xem trước slot hết hạn `staleSlot` có còn phần tử hết hạn nào không.

Tiếp theo bắt đầu duyệt về phía sau từ vị trí `staleSlot` (`index=7`). **Nếu tìm thấy dữ liệu Entry có cùng giá trị key:**

![](./images/thread-local/14.png)

Từ nút hiện tại `staleSlot` tìm phần tử `Entry` có `key` bằng nhau về phía sau. Sau khi tìm thấy, cập nhật giá trị `Entry` và trao đổi vị trí của phần tử `staleSlot` (`staleSlot` là phần tử hết hạn), cập nhật dữ liệu `Entry`, sau đó bắt đầu dọn dẹp các `Entry` hết hạn như hình:

![](/images/java-guide-blog/view.png)

Trong quá trình duyệt về phía sau, nếu không tìm thấy dữ liệu Entry có cùng giá trị key:

![](./images/thread-local/15.png)

Từ nút hiện tại `staleSlot` tìm phần tử `Entry` có giá trị `key` bằng nhau về phía sau, cho đến khi `Entry` là `null` mới dừng tìm kiếm. Qua hình trên, lúc này trong `table` không có `Entry` có `key` giống nhau.

Tạo `Entry` mới, thay thế vị trí `table[stableSlot]`:

![](./images/thread-local/16.png)

Sau khi thay thế xong cũng tiến hành dọn dẹp các phần tử hết hạn. Công việc dọn dẹp chủ yếu có hai phương thức: `expungeStaleEntry()` và `cleanSomeSlots()`, chi tiết sẽ nói sau, hãy tiếp tục đọc.

#### Phân tích mã nguồn `ThreadLocalMap.set()`

Ở trên đã phân tích nguyên lý triển khai của `set()` bằng hình ảnh, thực ra đã khá rõ ràng rồi. Tiếp tục xem mã nguồn:

`java.lang.ThreadLocal`.`ThreadLocalMap.set()`:

```java
private void set(ThreadLocal<?> key, Object value) {
    Entry[] tab = table;
    int len = tab.length;
    int i = key.threadLocalHashCode & (len-1);

    for (Entry e = tab[i];
         e != null;
         e = tab[i = nextIndex(i, len)]) {
        ThreadLocal<?> k = e.get();

        if (k == key) {
            e.value = value;
            return;
        }

        if (k == null) {
            replaceStaleEntry(key, value, i);
            return;
        }
    }

    tab[i] = new Entry(key, value);
    int sz = ++size;
    if (!cleanSomeSlots(i, sz) && sz >= threshold)
        rehash();
}
```

Ở đây sẽ tính vị trí tương ứng trong bảng băm qua `key`, sau đó từ vị trí bucket tương ứng của `key` hiện tại tìm về phía sau, tìm bucket có thể sử dụng.

```java
Entry[] tab = table;
int len = tab.length;
int i = key.threadLocalHashCode & (len-1);
```

Khi nào bucket mới có thể sử dụng?

1. `k = key` nghĩa là thao tác thay thế, có thể sử dụng
2. Gặp bucket hết hạn, thực hiện logic thay thế, chiếm bucket hết hạn
3. Trong quá trình tìm kiếm, gặp trường hợp `Entry=null` trong bucket, sử dụng trực tiếp

Tiếp theo thực hiện vòng lặp `for` duyệt về phía sau. Trước tiên xem cài đặt của `nextIndex()`, `prevIndex()`:

![](./images/thread-local/17.png)

```java
private static int nextIndex(int i, int len) {
    return ((i + 1 < len) ? i + 1 : 0);
}

private static int prevIndex(int i, int len) {
    return ((i - 1 >= 0) ? i - 1 : len - 1);
}
```

Tiếp tục xem logic còn lại trong vòng lặp `for`:

1. Dữ liệu `Entry` trong bucket tương ứng với giá trị `key` hiện tại là rỗng, điều này cho thấy không có xung đột dữ liệu ở mảng băm này. Thoát khỏi vòng lặp `for`, trực tiếp `set` dữ liệu vào bucket tương ứng
2. Nếu dữ liệu `Entry` trong bucket tương ứng với `key` không rỗng
   - 2.1 Nếu `k = key`, thao tác `set` hiện tại là thao tác thay thế, thực hiện logic thay thế, trả về trực tiếp
   - 2.2 Nếu `key = null`, dữ liệu `Entry` ở vị trí bucket hiện tại là dữ liệu hết hạn, thực hiện phương thức `replaceStaleEntry()` (phương thức cốt lõi), sau đó trả về
3. Vòng lặp `for` thực hiện xong, tiếp tục đi xuống cho thấy trong quá trình lặp về phía sau gặp tình huống `entry` là `null`
   - 3.1 Trong bucket có `Entry` là `null`, tạo đối tượng `Entry` mới
   - 3.2 Thực hiện thao tác `++size`
4. Gọi `cleanSomeSlots()` để thực hiện một lần dọn dẹp heuristic, dọn dẹp dữ liệu `Entry` có `key` hết hạn trong mảng băm
   - 4.1 Nếu sau khi dọn dẹp không dọn được dữ liệu nào, và `size` vượt quá ngưỡng (2/3 độ dài mảng), thực hiện thao tác `rehash()`
   - 4.2 Trong `rehash()` trước tiên sẽ thực hiện một vòng dọn dẹp thăm dò, dọn dẹp các `key` hết hạn. Sau khi dọn dẹp xong nếu **size >= threshold - threshold / 4**, sẽ thực hiện logic mở rộng thực sự (logic mở rộng xem phía sau)

Tiếp theo tập trung vào phương thức `replaceStaleEntry()`. Phương thức này cung cấp chức năng thay thế dữ liệu hết hạn, ta có thể kết hợp với sơ đồ nguyên lý **trường hợp 4** ở trên để xem lại. Mã cụ thể như sau:

`java.lang.ThreadLocal.ThreadLocalMap.replaceStaleEntry()`:

```java
private void replaceStaleEntry(ThreadLocal<?> key, Object value,
                                       int staleSlot) {
    Entry[] tab = table;
    int len = tab.length;
    Entry e;

    int slotToExpunge = staleSlot;
    for (int i = prevIndex(staleSlot, len);
         (e = tab[i]) != null;
         i = prevIndex(i, len))

        if (e.get() == null)
            slotToExpunge = i;

    for (int i = nextIndex(staleSlot, len);
         (e = tab[i]) != null;
         i = nextIndex(i, len)) {

        ThreadLocal<?> k = e.get();

        if (k == key) {
            e.value = value;

            tab[i] = tab[staleSlot];
            tab[staleSlot] = e;

            if (slotToExpunge == staleSlot)
                slotToExpunge = i;
            cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);
            return;
        }

        if (k == null && slotToExpunge == staleSlot)
            slotToExpunge = i;
    }

    tab[staleSlot].value = null;
    tab[staleSlot] = new Entry(key, value);

    if (slotToExpunge != staleSlot)
        cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);
}
```

`slotToExpunge` biểu thị chỉ số bắt đầu của việc dọn dẹp dữ liệu hết hạn bằng thăm dò, mặc định bắt đầu từ `staleSlot` hiện tại. Từ `staleSlot` hiện tại, duyệt về phía trước tìm dữ liệu không hết hạn, vòng lặp `for` tiếp tục cho đến khi gặp `Entry` là `null` mới kết thúc. Nếu tìm thấy dữ liệu hết hạn khi duyệt về phía trước, cập nhật chỉ số bắt đầu dọn dẹp thành i, tức là `slotToExpunge=i`

```java
for (int i = prevIndex(staleSlot, len);
     (e = tab[i]) != null;
     i = prevIndex(i, len)){

    if (e.get() == null){
        slotToExpunge = i;
    }
}
```

Tiếp theo bắt đầu tìm về phía sau từ `staleSlot`, cũng kết thúc ở bucket có `Entry` là `null`.
Nếu trong quá trình lặp, **gặp k == key**, cho thấy đây là logic thay thế. Thay thế dữ liệu mới và trao đổi vị trí `staleSlot` hiện tại. Nếu `slotToExpunge == staleSlot`, điều này có nghĩa là khi `replaceStaleEntry()` tìm về phía trước ban đầu không tìm thấy dữ liệu `Entry` hết hạn nào. Sau đó trong quá trình tìm về phía sau cũng không phát hiện dữ liệu hết hạn, cập nhật chỉ số bắt đầu dọn dẹp thăm dò thành chỉ số vòng lặp hiện tại, tức là `slotToExpunge = i`. Cuối cùng gọi `cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);` để thực hiện dọn dẹp dữ liệu hết hạn theo heuristic.

```java
if (k == key) {
    e.value = value;

    tab[i] = tab[staleSlot];
    tab[staleSlot] = e;

    if (slotToExpunge == staleSlot)
        slotToExpunge = i;

    cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);
    return;
}
```

Cả `cleanSomeSlots()` lẫn `expungeStaleEntry()` sẽ được giải thích chi tiết sau. Đây là hai phương thức liên quan đến dọn dẹp, một cái là dọn dẹp heuristic (Heuristically scan) cho `Entry` liên quan đến `key` hết hạn, cái còn lại là dọn dẹp thăm dò cho `Entry` liên quan đến `key` hết hạn.

**Nếu k != key** thì tiếp tục đi xuống, `k == null` cho thấy `Entry` đang duyệt là dữ liệu hết hạn, `slotToExpunge == staleSlot` cho thấy khi tìm dữ liệu về phía trước ban đầu không tìm thấy `Entry` hết hạn nào. Nếu điều kiện thỏa mãn, cập nhật `slotToExpunge` thành vị trí hiện tại, điều kiện tiên quyết là nút tiền nhiệm không có dữ liệu hết hạn khi quét.

```java
if (k == null && slotToExpunge == staleSlot)
    slotToExpunge = i;
```

Trong quá trình lặp về phía sau nếu không tìm thấy dữ liệu `k == key` và gặp dữ liệu `Entry` là `null`, kết thúc thao tác lặp hiện tại. Lúc này cho thấy đây là logic thêm mới, thêm dữ liệu mới vào `slot` tương ứng với `table[staleSlot]`.

```java
tab[staleSlot].value = null;
tab[staleSlot] = new Entry(key, value);
```

Cuối cùng kiểm tra xem ngoài `staleSlot`, còn có dữ liệu slot hết hạn khác không. Nếu có thì bắt đầu logic dọn dẹp dữ liệu:

```java
if (slotToExpunge != staleSlot)
    cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);
```

### Quy trình dọn dẹp thăm dò key hết hạn của `ThreadLocalMap`

Ở trên đã đề cập đến hai cách dọn dẹp dữ liệu `key` hết hạn của `ThreadLocalMap`: **dọn dẹp thăm dò** và **dọn dẹp heuristic**.

Trước tiên nói về dọn dẹp thăm dò, tức là phương thức `expungeStaleEntry`. Duyệt mảng băm, thăm dò và dọn dẹp dữ liệu hết hạn từ vị trí bắt đầu về phía sau, đặt `Entry` của dữ liệu hết hạn thành `null`. Dọc đường gặp dữ liệu chưa hết hạn sẽ `rehash` lại và tìm vị trí trong mảng `table`, nếu vị trí tìm được đã có dữ liệu rồi, sẽ đặt dữ liệu chưa hết hạn vào bucket `Entry=null` gần nhất với vị trí này, giúp `Entry` sau `rehash` gần hơn với vị trí bucket đúng. Logic thao tác như sau:

![](./images/thread-local/18.png)

Như hình, `set(27)` sau khi tính hash nên rơi vào bucket `index=4`. Do bucket `index=4` đã có dữ liệu rồi, nên duyệt về phía sau và cuối cùng đặt dữ liệu vào bucket `index=7`. Sau một thời gian, `key` của dữ liệu `Entry` trong `index=5` trở thành `null`

![](./images/thread-local/19.png)

Nếu có dữ liệu khác được `set` vào `map`, sẽ kích hoạt thao tác **dọn dẹp thăm dò**.

Như hình trên, sau khi thực hiện **dọn dẹp thăm dò**, dữ liệu tại `index=5` được dọn sạch. Tiếp tục lặp về phía sau, đến phần tử `index=7`, sau khi `rehash` phát hiện `index` đúng của phần tử này là 4, nhưng vị trí này đã có dữ liệu rồi. Tìm nút `Entry=null` gần `index=4` nhất (dữ liệu vừa được dọn bằng thăm dò: `index=5`), sau đó di chuyển dữ liệu `index=7` sang `index=5`. Lúc này vị trí bucket gần hơn với vị trí đúng `index=4`.

Sau một vòng dọn dẹp thăm dò, dữ liệu có `key` hết hạn sẽ được dọn sạch, dữ liệu không hết hạn sau khi `rehash` định vị lại sẽ ở vị trí bucket gần hơn về lý thuyết với vị trí `i= key.hashCode & (tab.len - 1)`. Tối ưu hóa này sẽ cải thiện hiệu suất truy vấn của toàn bộ bảng băm.

Tiếp theo xem quy trình cụ thể của `expungeStaleEntry()`, vẫn theo cách giải thích bằng sơ đồ nguyên lý trước rồi mới xem mã nguồn:

![](./images/thread-local/20.png)

Ta giả sử gọi `expungeStaleEntry(3)` để gọi phương thức này. Như hình trên, ta có thể thấy tình trạng dữ liệu của `table` trong `ThreadLocalMap`. Tiếp theo thực hiện thao tác dọn dẹp:

![](./images/thread-local/21.png)

Bước đầu tiên là xóa dữ liệu ở vị trí `tab[staleSlot]` hiện tại, `Entry` ở vị trí `index=3` trở thành `null`. Sau đó tiếp tục thăm dò về phía sau:

![](./images/thread-local/22.png)

Sau khi thực hiện bước hai, phần tử tại index=4 được di chuyển sang slot index=3.

Tiếp tục lặp kiểm tra về phía sau, gặp dữ liệu bình thường, tính xem vị trí dữ liệu này có bị lệch không, nếu bị lệch thì tính lại vị trí `slot`, mục đích là để dữ liệu bình thường được lưu ở vị trí đúng hoặc gần vị trí đúng hơn

![](./images/thread-local/23.png)

Trong quá trình lặp về phía sau gặp slot rỗng, kết thúc thăm dò. Như vậy một vòng dọn dẹp thăm dò hoàn tất. Tiếp tục xem **mã nguồn triển khai** cụ thể:

```java
private int expungeStaleEntry(int staleSlot) {
    Entry[] tab = table;
    int len = tab.length;

    tab[staleSlot].value = null;
    tab[staleSlot] = null;
    size--;

    Entry e;
    int i;
    for (i = nextIndex(staleSlot, len);
         (e = tab[i]) != null;
         i = nextIndex(i, len)) {
        ThreadLocal<?> k = e.get();
        if (k == null) {
            e.value = null;
            tab[i] = null;
            size--;
        } else {
            int h = k.threadLocalHashCode & (len - 1);
            if (h != i) {
                tab[i] = null;

                while (tab[h] != null)
                    h = nextIndex(h, len);
                tab[h] = e;
            }
        }
    }
    return i;
}
```

Ở đây ta vẫn lấy `staleSlot=3` làm ví dụ. Trước tiên xóa dữ liệu ở slot `tab[staleSlot]`, sau đó đặt `size--`
Tiếp theo lặp về phía sau từ vị trí `staleSlot`. Nếu gặp dữ liệu hết hạn `k==null`, cũng xóa dữ liệu slot đó, rồi `size--`

```java
ThreadLocal<?> k = e.get();

if (k == null) {
    e.value = null;
    tab[i] = null;
    size--;
}
```

Nếu `key` chưa hết hạn, tính lại xem chỉ số vị trí của `key` hiện tại có phải là chỉ số slot hiện tại không. Nếu không, cho thấy đã xảy ra xung đột `hash`, lúc này từ chỉ số slot đúng đã tính lại mới đó, lặp về phía sau tìm vị trí gần nhất có thể lưu `entry`.

```java
int h = k.threadLocalHashCode & (len - 1);
if (h != i) {
    tab[i] = null;

    while (tab[h] != null)
        h = nextIndex(h, len);

    tab[h] = e;
}
```

Đây là xử lý dữ liệu bình thường có xung đột `Hash`. Sau khi lặp, `Entry` có xung đột `Hash` sẽ ở vị trí gần vị trí đúng hơn, điều này giúp hiệu quả truy vấn cao hơn.

### Cơ chế mở rộng của `ThreadLocalMap`

Ở cuối phương thức `ThreadLocalMap.set()`, nếu sau khi thực hiện dọn dẹp heuristic mà không dọn được dữ liệu nào, và số lượng `Entry` trong mảng băm hiện tại đã đạt đến ngưỡng mở rộng `(len*2/3)`, bắt đầu thực hiện logic `rehash()`:

```java
if (!cleanSomeSlots(i, sz) && sz >= threshold)
    rehash();
```

Tiếp theo xem cài đặt cụ thể của `rehash()`:

```java
private void rehash() {
    expungeStaleEntries();

    if (size >= threshold - threshold / 4)
        resize();
}

private void expungeStaleEntries() {
    Entry[] tab = table;
    int len = tab.length;
    for (int j = 0; j < len; j++) {
        Entry e = tab[j];
        if (e != null && e.get() == null)
            expungeStaleEntry(j);
    }
}
```

Ở đây trước tiên thực hiện dọn dẹp thăm dò, dọn dẹp từ vị trí bắt đầu của `table` về phía sau. Ở trên đã phân tích chi tiết về quy trình dọn dẹp. Sau khi dọn dẹp xong, trong `table` có thể có một số dữ liệu `Entry` với `key` là `null` đã được dọn sạch. Vì vậy lúc này dùng phán đoán `size >= threshold - threshold / 4` tức là `size >= threshold * 3/4` để quyết định có mở rộng hay không.

Ta nhớ ngưỡng để thực hiện `rehash()` ở trên là `size >= threshold`. Vì vậy khi người phỏng vấn hỏi về cơ chế mở rộng của `ThreadLocalMap`, ta nhất định phải nói rõ hai bước này:

![](./images/thread-local/24.png)

Tiếp theo xem phương thức `resize()` cụ thể. Để tiện minh họa, ta lấy `oldTab.len=8` làm ví dụ:

![](./images/thread-local/25.png)

Kích thước của `tab` sau khi mở rộng là `oldLen * 2`. Sau đó duyệt bảng băm cũ, tính lại vị trí `hash`, đặt vào mảng `tab` mới. Nếu có xung đột `hash` thì tìm vị trí `entry` là `null` gần nhất phía sau. Sau khi duyệt xong, tất cả dữ liệu `entry` trong `oldTab` đã được đưa vào `tab` mới. Tính lại **ngưỡng** mở rộng lần sau của `tab`. Mã cụ thể như sau:

```java
private void resize() {
    Entry[] oldTab = table;
    int oldLen = oldTab.length;
    int newLen = oldLen * 2;
    Entry[] newTab = new Entry[newLen];
    int count = 0;

    for (int j = 0; j < oldLen; ++j) {
        Entry e = oldTab[j];
        if (e != null) {
            ThreadLocal<?> k = e.get();
            if (k == null) {
                e.value = null;
            } else {
                int h = k.threadLocalHashCode & (newLen - 1);
                while (newTab[h] != null)
                    h = nextIndex(h, newLen);
                newTab[h] = e;
                count++;
            }
        }
    }

    setThreshold(newLen);
    size = count;
    table = newTab;
}
```

### Chi tiết về `ThreadLocalMap.get()`

Ở trên đã xem xong mã nguồn của phương thức `set()`, bao gồm các thao tác set dữ liệu, dọn dẹp dữ liệu, tối ưu hóa vị trí bucket. Tiếp theo xem nguyên lý thao tác `get()`.

#### Sơ đồ giải thích `ThreadLocalMap.get()`

**Trường hợp 1:** Tính vị trí `slot` trong bảng băm qua giá trị `key`, sau đó `Entry.key` ở vị trí `slot` đó nhất quán với `key` cần tìm, trả về trực tiếp:

![](./images/thread-local/26.png)

**Trường hợp 2:** `Entry.key` ở vị trí `slot` không nhất quán với `key` cần tìm:

![](./images/thread-local/27.png)

Ta lấy `get(ThreadLocal1)` làm ví dụ. Sau khi tính `hash`, vị trí `slot` đúng phải là 4. Nhưng slot `index=4` đã có dữ liệu, và giá trị `key` không bằng `ThreadLocal1`, nên cần tiếp tục lặp về phía sau để tìm.

Khi lặp đến dữ liệu `index=5`, lúc này `Entry.key=null`, kích hoạt một thao tác thu hồi dữ liệu thăm dò. Thực hiện phương thức `expungeStaleEntry()`. Sau khi thực hiện xong, dữ liệu tại `index 5,8` sẽ bị thu hồi, còn dữ liệu tại `index 6,7` sẽ được dịch lên trước. Sau khi `index 6,7` dịch lên, tiếp tục lặp từ `index=5` về phía sau. Do đó tìm thấy dữ liệu `Entry` có giá trị `key` bằng nhau tại `index=6`, như hình:

![](./images/thread-local/28.png)

#### Phân tích mã nguồn `ThreadLocalMap.get()`

`java.lang.ThreadLocal.ThreadLocalMap.getEntry()`:

```java
private Entry getEntry(ThreadLocal<?> key) {
    int i = key.threadLocalHashCode & (table.length - 1);
    Entry e = table[i];
    if (e != null && e.get() == key)
        return e;
    else
        return getEntryAfterMiss(key, i, e);
}

private Entry getEntryAfterMiss(ThreadLocal<?> key, int i, Entry e) {
    Entry[] tab = table;
    int len = tab.length;

    while (e != null) {
        ThreadLocal<?> k = e.get();
        if (k == key)
            return e;
        if (k == null)
            expungeStaleEntry(i);
        else
            i = nextIndex(i, len);
        e = tab[i];
    }
    return null;
}
```

### Quy trình dọn dẹp heuristic key hết hạn của `ThreadLocalMap`

Ở trên đã đề cập nhiều đến hai cách dọn dẹp key hết hạn của `ThreadLocalMap`: **dọn dẹp thăm dò (expungeStaleEntry())**, **dọn dẹp heuristic (cleanSomeSlots())**

Dọn dẹp thăm dò là dọn dẹp về phía sau từ `Entry` hiện tại, gặp giá trị `null` thì kết thúc dọn dẹp, thuộc loại **dọn dẹp thăm dò tuyến tính**.

Còn dọn dẹp heuristic được tác giả định nghĩa là: **Heuristically scan some cells looking for stale entries**.

![](./images/thread-local/29.png)

Mã cụ thể như sau:

```java
private boolean cleanSomeSlots(int i, int n) {
    boolean removed = false;
    Entry[] tab = table;
    int len = tab.length;
    do {
        i = nextIndex(i, len);
        Entry e = tab[i];
        if (e != null && e.get() == null) {
            n = len;
            removed = true;
            i = expungeStaleEntry(i);
        }
    } while ( (n >>>= 1) != 0);
    return removed;
}
```

### `InheritableThreadLocal`

Khi sử dụng `ThreadLocal`, trong các kịch bản bất đồng bộ, không thể chia sẻ dữ liệu bản sao luồng được tạo trong luồng cha cho luồng con.

Để giải quyết vấn đề này, JDK còn có lớp `InheritableThreadLocal`. Hãy xem một ví dụ:

```java
public class InheritableThreadLocalDemo {
    public static void main(String[] args) {
        ThreadLocal<String> ThreadLocal = new ThreadLocal<>();
        ThreadLocal<String> inheritableThreadLocal = new InheritableThreadLocal<>();
        ThreadLocal.set("父类数据:threadLocal");
        inheritableThreadLocal.set("父类数据:inheritableThreadLocal");

        new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("子线程获取父类ThreadLocal数据：" + ThreadLocal.get());
                System.out.println("子线程获取父类inheritableThreadLocal数据：" + inheritableThreadLocal.get());
            }
        }).start();
    }
}
```

Kết quả in:

```java
子线程获取父类ThreadLocal数据：null
子线程获取父类inheritableThreadLocal数据：父类数据:inheritableThreadLocal
```

Nguyên lý triển khai là luồng con được tạo ra trong luồng cha bằng cách gọi phương thức `new Thread()`. Phương thức `Thread#init` được gọi trong constructor của `Thread`. Trong phương thức `init` sao chép dữ liệu luồng cha sang luồng con:

```java
private void init(ThreadGroup g, Runnable target, String name,
                      long stackSize, AccessControlContext acc,
                      boolean inheritThreadLocals) {
    if (name == null) {
        throw new NullPointerException("name cannot be null");
    }

    if (inheritThreadLocals && parent.inheritableThreadLocals != null)
        this.inheritableThreadLocals =
            ThreadLocal.createInheritedMap(parent.inheritableThreadLocals);
    this.stackSize = stackSize;
    tid = nextThreadID();
}
```

Nhưng `InheritableThreadLocal` vẫn có nhược điểm. Thông thường xử lý bất đồng bộ ta dùng thread pool, còn `InheritableThreadLocal` được gán giá trị trong phương thức `init()` của `new Thread`. Thread pool tái sử dụng luồng, nên sẽ có vấn đề ở đây.

Tất nhiên, khi có vấn đề thì sẽ có giải pháp. Alibaba đã mã nguồn mở một thành phần `TransmittableThreadLocal` có thể giải quyết vấn đề này. Ở đây không đi sâu thêm, những ai quan tâm có thể tự tìm hiểu.

### Thực chiến sử dụng `ThreadLocal` trong dự án

#### Các trường hợp sử dụng `ThreadLocal`

Trong dự án hiện tại, ta dùng `ELK+Logstash` để ghi log, và cuối cùng hiển thị và tìm kiếm trong `Kibana`.

Hiện tại đều là hệ thống phân tán cung cấp dịch vụ thống nhất ra bên ngoài. Mối quan hệ giữa các dự án có thể liên kết qua `traceId`. Nhưng làm thế nào để truyền `traceId` giữa các dự án khác nhau?

Ở đây ta dùng `org.slf4j.MDC` để thực hiện chức năng này, bên trong nó được triển khai bằng `ThreadLocal`. Cài đặt cụ thể như sau:

Khi frontend gửi request đến **dịch vụ A**, **dịch vụ A** sẽ tạo một chuỗi `traceId` tương tự `UUID`, đặt chuỗi này vào `ThreadLocal` của luồng hiện tại. Khi gọi **dịch vụ B**, ghi `traceId` vào `Header` của request. Khi **dịch vụ B** nhận request, trước tiên sẽ kiểm tra xem `Header` của request có `traceId` không. Nếu có thì ghi vào `ThreadLocal` của luồng mình.

![](./images/thread-local/30.png)

`requestId` trong hình chính là `traceId` liên kết các hệ thống của ta. Các hệ thống gọi lẫn nhau, qua `requestId` này có thể tìm thấy liên kết tương ứng. Ở đây cũng có một số tình huống khác:

![](./images/thread-local/31.png)

Với những tình huống này, ta đều có giải pháp tương ứng như sau

#### Giải pháp gọi từ xa Feign

**Dịch vụ gửi request:**

```java
@Component
@Slf4j
public class FeignInvokeInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        String requestId = MDC.get("requestId");
        if (StringUtils.isNotBlank(requestId)) {
            template.header("requestId", requestId);
        }
    }
}
```

**Dịch vụ nhận request:**

```java
@Slf4j
@Component
public class LogInterceptor extends HandlerInterceptorAdapter {

    @Override
    public void afterCompletion(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2, Exception arg3) {
        MDC.remove("requestId");
    }

    @Override
    public void postHandle(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2, ModelAndView arg3) {
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        String requestId = request.getHeader(BaseConstant.REQUEST_ID_KEY);
        if (StringUtils.isBlank(requestId)) {
            requestId = UUID.randomUUID().toString().replace("-", "");
        }
        MDC.put("requestId", requestId);
        return true;
    }
}
```

#### Gọi bất đồng bộ thread pool, truyền requestId

Vì `MDC` được triển khai dựa trên `ThreadLocal`, trong quá trình bất đồng bộ, luồng con không thể lấy được dữ liệu lưu trong `ThreadLocal` của luồng cha. Vì vậy có thể tùy chỉnh thread pool executor, sửa đổi phương thức `run()` trong đó:

```java
public class MyThreadPoolTaskExecutor extends ThreadPoolTaskExecutor {

    @Override
    public void execute(Runnable runnable) {
        Map<String, String> context = MDC.getCopyOfContextMap();
        super.execute(() -> run(runnable, context));
    }

    @Override
    private void run(Runnable runnable, Map<String, String> context) {
        if (context != null) {
            MDC.setContextMap(context);
        }
        try {
            runnable.run();
        } finally {
            MDC.remove();
        }
    }
}
```

#### Dùng MQ gửi tin nhắn cho hệ thống bên thứ ba

Trong nội dung tin nhắn MQ tùy chỉnh thuộc tính `requestId`. Sau khi bên nhận tiêu thụ tin nhắn, tự phân tích `requestId` để sử dụng.

<!-- @include: @article-footer.snippet.md -->
