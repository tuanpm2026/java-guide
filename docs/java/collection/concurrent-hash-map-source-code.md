---
title: Phân tích mã nguồn ConcurrentHashMap
description: Phân tích chuyên sâu mã nguồn ConcurrentHashMap：So sánh cơ chế khóa phân đoạn Segment của JDK1.7 với cơ chế CAS+Synchronized của JDK1.8, hiểu rõ cơ chế an toàn luồng và tối ưu hiệu suất của Map trong môi trường đa luồng.
category: Java
tag:
  - Java Collection
head:
  - - meta
    - name: keywords
      content: ConcurrentHashMap源码,线程安全Map,分段锁Segment,CAS操作,并发容器,JDK7与JDK8区别
---

<!-- @include: @small-advertisement.snippet.md -->

> Bài viết này được đóng góp từ mục đọc code: <https://mp.weixin.qq.com/s/AHWzboztt53ZfFZmsSnMSw>, JavaGuide đã cải tiến và tối ưu hóa đáng kể bài gốc.

Bài viết trước đã giới thiệu mã nguồn HashMap, nhận được phản hồi tốt, nhiều bạn cũng đã chia sẻ quan điểm của mình. Lần này lại đến, lần này là `ConcurrentHashMap`, là HashMap an toàn luồng, tần suất sử dụng của nó cũng rất cao. Vậy cấu trúc lưu trữ và nguyên lý thực hiện của nó là như thế nào?

## 1. ConcurrentHashMap 1.7

### 1. Cấu trúc lưu trữ

![Cấu trúc lưu trữ ConcurrentHashMap Java 7](/images/github/javaguide/java/collection/java7_concurrenthashmap.png)

Cấu trúc lưu trữ của `ConcurrentHashMap` trong Java 7 như hình trên, `ConcurrentHashMap` được tổ hợp từ nhiều `Segment`, mỗi `Segment` là một cấu trúc tương tự như `HashMap`, vì vậy mỗi `HashMap` bên trong có thể mở rộng. Nhưng số lượng `Segment` **không thể thay đổi sau khi khởi tạo**, mặc định có 16 `Segment`, bạn cũng có thể hiểu `ConcurrentHashMap` mặc định hỗ trợ tối đa 16 luồng đồng thời.

### 2. Khởi tạo

Khám phá quy trình khởi tạo của `ConcurrentHashMap` thông qua hàm khởi tạo không tham số.

```java
    /**
     * Creates a new, empty map with a default initial capacity (16),
     * load factor (0.75) and concurrencyLevel (16).
     */
    public ConcurrentHashMap() {
        this(DEFAULT_INITIAL_CAPACITY, DEFAULT_LOAD_FACTOR, DEFAULT_CONCURRENCY_LEVEL);
    }
```

Hàm khởi tạo không tham số gọi hàm khởi tạo có tham số, truyền vào ba giá trị mặc định của các tham số như sau.

```java
    /**
     * 默认初始化容量
     */
    static final int DEFAULT_INITIAL_CAPACITY = 16;

    /**
     * 默认负载因子
     */
    static final float DEFAULT_LOAD_FACTOR = 0.75f;

    /**
     * 默认并发级别
     */
    static final int DEFAULT_CONCURRENCY_LEVEL = 16;
```

Tiếp tục xem logic cài đặt bên trong hàm khởi tạo có tham số này.

```java
@SuppressWarnings("unchecked")
public ConcurrentHashMap(int initialCapacity,float loadFactor, int concurrencyLevel) {
    // 参数校验
    if (!(loadFactor > 0) || initialCapacity < 0 || concurrencyLevel <= 0)
        throw new IllegalArgumentException();
    // 校验并发级别大小，大于 1<<16，重置为 65536
    if (concurrencyLevel > MAX_SEGMENTS)
        concurrencyLevel = MAX_SEGMENTS;
    // Find power-of-two sizes best matching arguments
    // 2的多少次方
    int sshift = 0;
    int ssize = 1;
    // 这个循环可以找到 concurrencyLevel 之上最近的 2的次方值
    while (ssize < concurrencyLevel) {
        ++sshift;
        ssize <<= 1;
    }
    // 记录段偏移量
    this.segmentShift = 32 - sshift;
    // 记录段掩码
    this.segmentMask = ssize - 1;
    // 设置容量
    if (initialCapacity > MAXIMUM_CAPACITY)
        initialCapacity = MAXIMUM_CAPACITY;
    // c = 容量 / ssize ，默认 16 / 16 = 1，这里是计算每个 Segment 中的类似于 HashMap 的容量
    int c = initialCapacity / ssize;
    if (c * ssize < initialCapacity)
        ++c;
    int cap = MIN_SEGMENT_TABLE_CAPACITY;
    //Segment 中的类似于 HashMap 的容量至少是2或者2的倍数
    while (cap < c)
        cap <<= 1;
    // create segments and segments[0]
    // 创建 Segment 数组，设置 segments[0]
    Segment<K,V> s0 = new Segment<K,V>(loadFactor, (int)(cap * loadFactor),
                         (HashEntry<K,V>[])new HashEntry[cap]);
    Segment<K,V>[] ss = (Segment<K,V>[])new Segment[ssize];
    UNSAFE.putOrderedObject(ss, SBASE, s0); // ordered write of segments[0]
    this.segments = ss;
}
```

Tóm tắt logic khởi tạo của ConcurrentHashMap trong Java 7.

1. Kiểm tra các tham số cần thiết.
2. Kiểm tra kích thước mức độ đồng thời `concurrencyLevel`, nếu lớn hơn giá trị tối đa thì đặt lại về giá trị tối đa. Hàm khởi tạo không tham số **mặc định là 16**.
3. Tìm giá trị **lũy thừa của 2** gần nhất lớn hơn `concurrencyLevel` làm kích thước dung lượng khởi tạo, **mặc định là 16**.
4. Ghi lại lượng dịch chuyển `segmentShift`, giá trị này là N trong【dung lượng = 2 lũy thừa N】, sẽ được dùng khi tính vị trí trong Put sau này. **Mặc định là 32 - sshift = 28**.
5. Ghi lại `segmentMask`, mặc định là ssize - 1 = 16 - 1 = 15.
6. **Khởi tạo `segments[0]`**, **kích thước mặc định là 2**, **hệ số tải 0.75**, **ngưỡng mở rộng là 2\*0.75=1.5**, chỉ khi chèn phần tử thứ hai mới mở rộng.

### 3. put

Tiếp tục xem mã nguồn phương thức put dựa trên các tham số khởi tạo ở trên.

```java
/**
 * Maps the specified key to the specified value in this table.
 * Neither the key nor the value can be null.
 *
 * <p> The value can be retrieved by calling the <tt>get</tt> method
 * with a key that is equal to the original key.
 *
 * @param key key with which the specified value is to be associated
 * @param value value to be associated with the specified key
 * @return the previous value associated with <tt>key</tt>, or
 *         <tt>null</tt> if there was no mapping for <tt>key</tt>
 * @throws NullPointerException if the specified key or value is null
 */
public V put(K key, V value) {
    Segment<K,V> s;
    if (value == null)
        throw new NullPointerException();
    int hash = hash(key);
    // hash 值无符号右移 28位（初始化时获得），然后与 segmentMask=15 做与运算
    // 其实也就是把高4位与segmentMask（1111）做与运算
    int j = (hash >>> segmentShift) & segmentMask;
    if ((s = (Segment<K,V>)UNSAFE.getObject          // nonvolatile; recheck
         (segments, (j << SSHIFT) + SBASE)) == null) //  in ensureSegment
        // 如果查找到的 Segment 为空，初始化
        s = ensureSegment(j);
    return s.put(key, hash, value, false);
}

/**
 * Returns the segment for the given index, creating it and
 * recording in segment table (via CAS) if not already present.
 *
 * @param k the index
 * @return the segment
 */
@SuppressWarnings("unchecked")
private Segment<K,V> ensureSegment(int k) {
    final Segment<K,V>[] ss = this.segments;
    long u = (k << SSHIFT) + SBASE; // raw offset
    Segment<K,V> seg;
    // 判断 u 位置的 Segment 是否为null
    if ((seg = (Segment<K,V>)UNSAFE.getObjectVolatile(ss, u)) == null) {
        Segment<K,V> proto = ss[0]; // use segment 0 as prototype
        // 获取0号 segment 里的 HashEntry<K,V> 初始化长度
        int cap = proto.table.length;
        // 获取0号 segment 里的 hash 表里的扩容负载因子，所有的 segment 的 loadFactor 是相同的
        float lf = proto.loadFactor;
        // 计算扩容阀值
        int threshold = (int)(cap * lf);
        // 创建一个 cap 容量的 HashEntry 数组
        HashEntry<K,V>[] tab = (HashEntry<K,V>[])new HashEntry[cap];
        if ((seg = (Segment<K,V>)UNSAFE.getObjectVolatile(ss, u)) == null) { // recheck
            // 再次检查 u 位置的 Segment 是否为null，因为这时可能有其他线程进行了操作
            Segment<K,V> s = new Segment<K,V>(lf, threshold, tab);
            // 自旋检查 u 位置的 Segment 是否为null
            while ((seg = (Segment<K,V>)UNSAFE.getObjectVolatile(ss, u))
                   == null) {
                // 使用CAS 赋值，只会成功一次
                if (UNSAFE.compareAndSwapObject(ss, u, null, seg = s))
                    break;
            }
        }
    }
    return seg;
}
```

Phân tích mã nguồn trên đã giải thích quy trình xử lý khi `ConcurrentHashMap` put một dữ liệu, dưới đây tổng hợp quy trình cụ thể.

1. Tính vị trí của key cần put, lấy `Segment` tại vị trí đã chỉ định.

2. Nếu `Segment` tại vị trí chỉ định là null, khởi tạo `Segment` này.

   **Quy trình khởi tạo Segment:**

   1. Kiểm tra `Segment` tại vị trí đã tính có null không.
   2. Nếu null tiếp tục khởi tạo, dùng dung lượng và hệ số tải của `Segment[0]` tạo mảng `HashEntry`.
   3. Kiểm tra lại `Segment` tại vị trí chỉ định đã tính có null không.
   4. Dùng mảng `HashEntry` đã tạo để khởi tạo Segment này.
   5. Tự quay kiểm tra `Segment` tại vị trí chỉ định đã tính có null không, dùng CAS để gán `Segment` tại vị trí này.

3. `Segment.put` chèn giá trị key, value.

Phần trên đã khám phá thao tác lấy đoạn `Segment` và khởi tạo đoạn `Segment`. Dòng cuối cùng phương thức put của `Segment` chưa được xem, tiếp tục phân tích.

```java
final V put(K key, int hash, V value, boolean onlyIfAbsent) {
    // 获取 ReentrantLock 独占锁，获取不到，scanAndLockForPut 获取。
    HashEntry<K,V> node = tryLock() ? null : scanAndLockForPut(key, hash, value);
    V oldValue;
    try {
        HashEntry<K,V>[] tab = table;
        // 计算要put的数据位置
        int index = (tab.length - 1) & hash;
        // CAS 获取 index 坐标的值
        HashEntry<K,V> first = entryAt(tab, index);
        for (HashEntry<K,V> e = first;;) {
            if (e != null) {
                // 检查是否 key 已经存在，如果存在，则遍历链表寻找位置，找到后替换 value
                K k;
                if ((k = e.key) == key ||
                    (e.hash == hash && key.equals(k))) {
                    oldValue = e.value;
                    if (!onlyIfAbsent) {
                        e.value = value;
                        ++modCount;
                    }
                    break;
                }
                e = e.next;
            }
            else {
                // first 有值没说明 index 位置已经有值了，有冲突，链表头插法。
                if (node != null)
                    node.setNext(first);
                else
                    node = new HashEntry<K,V>(hash, key, value, first);
                int c = count + 1;
                // 容量大于扩容阀值，小于最大容量，进行扩容
                if (c > threshold && tab.length < MAXIMUM_CAPACITY)
                    rehash(node);
                else
                    // index 位置赋值 node，node 可能是一个元素，也可能是一个链表的表头
                    setEntryAt(tab, index, node);
                ++modCount;
                count = c;
                oldValue = null;
                break;
            }
        }
    } finally {
        unlock();
    }
    return oldValue;
}
```

Vì `Segment` kế thừa `ReentrantLock`, nên `Segment` bên trong có thể dễ dàng lấy khóa. Quy trình put sử dụng tính năng này.

1. `tryLock()` lấy khóa, nếu không lấy được thì dùng phương thức **`scanAndLockForPut`** để tiếp tục lấy.

2. Tính vị trí index để đặt dữ liệu put, rồi lấy `HashEntry` tại vị trí này.

3. Duyệt để chèn phần tử mới, tại sao phải duyệt? Vì `HashEntry` lấy được ở đây có thể là phần tử rỗng, cũng có thể danh sách liên kết đã tồn tại, nên phải xử lý khác nhau.

   Nếu **`HashEntry` tại vị trí này không tồn tại**:

   1. Nếu dung lượng hiện tại lớn hơn ngưỡng mở rộng và nhỏ hơn dung lượng tối đa, **mở rộng**.
   2. Chèn trực tiếp theo phương thức chèn đầu danh sách.

   Nếu **`HashEntry` tại vị trí này tồn tại**:

   1. Kiểm tra key và giá trị hash của phần tử hiện tại trong danh sách liên kết có nhất quán với key và hash cần put không. Nếu nhất quán thì thay thế giá trị.
   2. Nếu không nhất quán, lấy nút tiếp theo trong danh sách liên kết, cho đến khi tìm thấy cùng key để thay thế giá trị, hoặc danh sách liên kết hết mà không có cùng key.
      1. Nếu dung lượng hiện tại lớn hơn ngưỡng mở rộng và nhỏ hơn dung lượng tối đa, **mở rộng**.
      2. Chèn trực tiếp theo phương thức chèn đầu danh sách.

4. Nếu vị trí cần chèn đã tồn tại trước đó, sau khi thay thế trả về giá trị cũ, ngược lại trả về null.

Thao tác `scanAndLockForPut` trong bước đầu tiên không được giới thiệu ở đây. Phương thức này thực hiện tự quay liên tục `tryLock()` để lấy khóa. Khi số lần tự quay lớn hơn số lần chỉ định, dùng `lock()` chặn để lấy khóa. Trong quá trình tự quay, đồng thời lấy `HashEntry` tại vị trí hash.

```java
private HashEntry<K,V> scanAndLockForPut(K key, int hash, V value) {
    HashEntry<K,V> first = entryForHash(this, hash);
    HashEntry<K,V> e = first;
    HashEntry<K,V> node = null;
    int retries = -1; // negative while locating node
    // 自旋获取锁
    while (!tryLock()) {
        HashEntry<K,V> f; // to recheck first below
        if (retries < 0) {
            if (e == null) {
                if (node == null) // speculatively create node
                    node = new HashEntry<K,V>(hash, key, value, null);
                retries = 0;
            }
            else if (key.equals(e.key))
                retries = 0;
            else
                e = e.next;
        }
        else if (++retries > MAX_SCAN_RETRIES) {
            // 自旋达到指定次数后，阻塞等到只到获取到锁
            lock();
            break;
        }
        else if ((retries & 1) == 0 &&
                 (f = entryForHash(this, hash)) != first) {
            e = first = f; // re-traverse if entry changed
            retries = -1;
        }
    }
    return node;
}

```

### 4. Mở rộng rehash

Mở rộng của `ConcurrentHashMap` chỉ mở rộng gấp đôi so với ban đầu. Khi di chuyển dữ liệu từ mảng cũ sang mảng mới, vị trí hoặc không đổi, hoặc thay đổi thành `index + oldSize`. Node trong tham số sẽ được chèn vào vị trí chỉ định bằng **phương thức chèn đầu** sau khi mở rộng.

```java
private void rehash(HashEntry<K,V> node) {
    HashEntry<K,V>[] oldTable = table;
    // 老容量
    int oldCapacity = oldTable.length;
    // 新容量，扩大两倍
    int newCapacity = oldCapacity << 1;
    // 新的扩容阀值
    threshold = (int)(newCapacity * loadFactor);
    // 创建新的数组
    HashEntry<K,V>[] newTable = (HashEntry<K,V>[]) new HashEntry[newCapacity];
    // 新的掩码，默认2扩容后是4，-1是3，二进制就是11。
    int sizeMask = newCapacity - 1;
    for (int i = 0; i < oldCapacity ; i++) {
        // 遍历老数组
        HashEntry<K,V> e = oldTable[i];
        if (e != null) {
            HashEntry<K,V> next = e.next;
            // 计算新的位置，新的位置只可能是不变或者是老的位置+老的容量。
            int idx = e.hash & sizeMask;
            if (next == null)   //  Single node on list
                // 如果当前位置还不是链表，只是一个元素，直接赋值
                newTable[idx] = e;
            else { // Reuse consecutive sequence at same slot
                // 如果是链表了
                HashEntry<K,V> lastRun = e;
                int lastIdx = idx;
                // 新的位置只可能是不变或者是老的位置+老的容量。
                // 遍历结束后，lastRun 后面的元素位置都是相同的
                for (HashEntry<K,V> last = next; last != null; last = last.next) {
                    int k = last.hash & sizeMask;
                    if (k != lastIdx) {
                        lastIdx = k;
                        lastRun = last;
                    }
                }
                // ，lastRun 后面的元素位置都是相同的，直接作为链表赋值到新位置。
                newTable[lastIdx] = lastRun;
                // Clone remaining nodes
                for (HashEntry<K,V> p = e; p != lastRun; p = p.next) {
                    // 遍历剩余元素，头插法到指定 k 位置。
                    V v = p.value;
                    int h = p.hash;
                    int k = h & sizeMask;
                    HashEntry<K,V> n = newTable[k];
                    newTable[k] = new HashEntry<K,V>(h, p.key, v, n);
                }
            }
        }
    }
    // 头插法插入新的节点
    int nodeIndex = node.hash & sizeMask; // add the new node
    node.setNext(newTable[nodeIndex]);
    newTable[nodeIndex] = node;
    table = newTable;
}
```

Một số bạn có thể thắc mắc về hai vòng for cuối cùng. Vòng for đầu tiên là để tìm một nút mà tất cả các nút next sau nó có vị trí mới giống nhau. Sau đó gán nó làm danh sách liên kết đến vị trí mới. Vòng for thứ hai là để chèn các phần tử còn lại vào vị trí chỉ định theo phương thức chèn đầu danh sách. ~~Lý do cài đặt như vậy có thể dựa trên thống kê xác suất, các bạn có nghiên cứu sâu có thể chia sẻ ý kiến.~~

Vòng `for` thứ hai bên trong dùng `new HashEntry<K,V>(h, p.key, v, n)` tạo một `HashEntry` mới thay vì tái sử dụng cái trước. Lý do là nếu tái sử dụng cái trước, điều đó sẽ khiến các luồng đang duyệt (như đang thực hiện phương thức `get`) không thể tiếp tục duyệt do con trỏ bị thay đổi. Như chú thích đã nói:

> Khi chúng không còn được tham chiếu bởi bất kỳ luồng đọc nào có thể đang duyệt bảng đồng thời, các nút được thay thế sẽ có thể được GC.
>
> The nodes they replace will be garbage collectable as soon as they are no longer referenced by any reader thread that may be in the midst of concurrently traversing table

Tại sao cần thêm một vòng `for` để tìm `lastRun`, thực ra là để giảm số lần tạo đối tượng, như chú thích đã nói:

> Về mặt thống kê, với ngưỡng mặc định, khi dung lượng bảng tăng gấp đôi, chỉ khoảng một phần sáu số nút cần được sao chép.
>
> Statistically, at the default threshold, only about one-sixth of them need cloning when a table doubles.

### 5. get

Đến đây rất đơn giản, phương thức get chỉ cần hai bước.

1. Tính vị trí lưu trữ của key.
2. Duyệt vị trí chỉ định để tìm giá trị value của key giống nhau.

```java
public V get(Object key) {
    Segment<K,V> s; // manually integrate access methods to reduce overhead
    HashEntry<K,V>[] tab;
    int h = hash(key);
    long u = (((h >>> segmentShift) & segmentMask) << SSHIFT) + SBASE;
    // 计算得到 key 的存放位置
    if ((s = (Segment<K,V>)UNSAFE.getObjectVolatile(segments, u)) != null &&
        (tab = s.table) != null) {
        for (HashEntry<K,V> e = (HashEntry<K,V>) UNSAFE.getObjectVolatile
                 (tab, ((long)(((tab.length - 1) & h)) << TSHIFT) + TBASE);
             e != null; e = e.next) {
            // 如果是链表，遍历查找到相同 key 的 value。
            K k;
            if ((k = e.key) == key || (e.hash == h && key.equals(k)))
                return e.value;
        }
    }
    return null;
}
```

## 2. ConcurrentHashMap 1.8

Nhìn chung, `ConcurrentHashMap` trong Java 8 so với Java 7 có nhiều thay đổi đáng kể.

### 1. Cấu trúc lưu trữ

![Cấu trúc lưu trữ ConcurrentHashMap Java8 (hình ảnh từ javadoop)](/images/github/javaguide/java/collection/java8_concurrenthashmap.png)

Có thể thấy ConcurrentHashMap của Java 8 so với Java 7 có thay đổi khá lớn, không còn là **mảng Segment + mảng HashEntry + danh sách liên kết** như trước, mà là **mảng Node + danh sách liên kết / cây đỏ đen**. Khi danh sách liên kết xung đột đạt đến độ dài nhất định, danh sách liên kết sẽ được chuyển đổi thành cây đỏ đen.

### 2. Khởi tạo initTable

```java
/**
 * Initializes table, using the size recorded in sizeCtl.
 */
private final Node<K,V>[] initTable() {
    Node<K,V>[] tab; int sc;
    while ((tab = table) == null || tab.length == 0) {
        //　如果 sizeCtl < 0 ,说明另外的线程执行CAS 成功，正在进行初始化。
        if ((sc = sizeCtl) < 0)
            // 让出 CPU 使用权
            Thread.yield(); // lost initialization race; just spin
        else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
            try {
                if ((tab = table) == null || tab.length == 0) {
                    int n = (sc > 0) ? sc : DEFAULT_CAPACITY;
                    @SuppressWarnings("unchecked")
                    Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                    table = tab = nt;
                    sc = n - (n >>> 2);
                }
            } finally {
                sizeCtl = sc;
            }
            break;
        }
    }
    return tab;
}
```

Từ mã nguồn có thể thấy việc khởi tạo `ConcurrentHashMap` được thực hiện thông qua **tự quay và CAS**. Cần chú ý biến `sizeCtl` (viết tắt của sizeControl), giá trị của nó quyết định trạng thái khởi tạo hiện tại.

1. -1 có nghĩa là đang khởi tạo, các luồng khác cần tự quay chờ đợi
2. -N có nghĩa là table đang mở rộng, 16 bit cao là dấu hiệu nhận dạng mở rộng, 16 bit thấp trừ 1 là số luồng đang mở rộng
3. 0 biểu thị kích thước khởi tạo của table, nếu table chưa được khởi tạo
4. \>0 biểu thị ngưỡng mở rộng của table, nếu table đã được khởi tạo.

### 3. put

Xem trực tiếp qua mã nguồn put.

```java
public V put(K key, V value) {
    return putVal(key, value, false);
}

/** Implementation for put and putIfAbsent */
final V putVal(K key, V value, boolean onlyIfAbsent) {
    // key 和 value 不能为空
    if (key == null || value == null) throw new NullPointerException();
    int hash = spread(key.hashCode());
    int binCount = 0;
    for (Node<K,V>[] tab = table;;) {
        // f = 目标位置元素
        Node<K,V> f; int n, i, fh;// fh 后面存放目标位置的元素 hash 值
        if (tab == null || (n = tab.length) == 0)
            // 数组桶为空，初始化数组桶（自旋+CAS)
            tab = initTable();
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            // 桶内为空，CAS 放入，不加锁，成功了就直接 break 跳出
            if (casTabAt(tab, i, null,new Node<K,V>(hash, key, value, null)))
                break;  // no lock when adding to empty bin
        }
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);
        else {
            V oldVal = null;
            // 使用 synchronized 加锁加入节点
            synchronized (f) {
                if (tabAt(tab, i) == f) {
                    // 说明是链表
                    if (fh >= 0) {
                        binCount = 1;
                        // 循环加入新的或者覆盖节点
                        for (Node<K,V> e = f;; ++binCount) {
                            K ek;
                            if (e.hash == hash &&
                                ((ek = e.key) == key ||
                                 (ek != null && key.equals(ek)))) {
                                oldVal = e.val;
                                if (!onlyIfAbsent)
                                    e.val = value;
                                break;
                            }
                            Node<K,V> pred = e;
                            if ((e = e.next) == null) {
                                pred.next = new Node<K,V>(hash, key,
                                                          value, null);
                                break;
                            }
                        }
                    }
                    else if (f instanceof TreeBin) {
                        // 红黑树
                        Node<K,V> p;
                        binCount = 2;
                        if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key,
                                                       value)) != null) {
                            oldVal = p.val;
                            if (!onlyIfAbsent)
                                p.val = value;
                        }
                    }
                }
            }
            if (binCount != 0) {
                if (binCount >= TREEIFY_THRESHOLD)
                    treeifyBin(tab, i);
                if (oldVal != null)
                    return oldVal;
                break;
            }
        }
    }
    addCount(1L, binCount);
    return null;
}
```

1. Tính hashcode dựa trên key.

2. Kiểm tra xem có cần khởi tạo không.

3. Đó là Node được xác định vị trí cho key hiện tại, nếu null nghĩa là vị trí hiện tại có thể ghi dữ liệu, dùng CAS thử ghi vào, nếu thất bại thì tự quay để đảm bảo thành công.

4. Nếu `hashcode` của vị trí hiện tại `== MOVED == -1`, cần mở rộng.

5. Nếu không thỏa mãn tất cả, dùng synchronized để khóa ghi dữ liệu.

6. Nếu số lượng lớn hơn `TREEIFY_THRESHOLD` thì thực hiện phương thức cây hóa. Trong `treeifyBin` sẽ kiểm tra trước nếu độ dài mảng hiện tại ≥64 thì mới chuyển danh sách liên kết thành cây đỏ đen.

### 4. get

Quy trình get khá đơn giản, xem trực tiếp qua mã nguồn.

```java
public V get(Object key) {
    Node<K,V>[] tab; Node<K,V> e, p; int n, eh; K ek;
    // key 所在的 hash 位置
    int h = spread(key.hashCode());
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (e = tabAt(tab, (n - 1) & h)) != null) {
        // 如果指定位置元素存在，头结点hash值相同
        if ((eh = e.hash) == h) {
            if ((ek = e.key) == key || (ek != null && key.equals(ek)))
                // key hash 值相等，key值相同，直接返回元素 value
                return e.val;
        }
        else if (eh < 0)
            // 头结点hash值小于0，说明正在扩容或者是红黑树，find查找
            return (p = e.find(h, key)) != null ? p.val : null;
        while ((e = e.next) != null) {
            // 是链表，遍历查找
            if (e.hash == h &&
                ((ek = e.key) == key || (ek != null && key.equals(ek))))
                return e.val;
        }
    }
    return null;
}
```

Tóm tắt quy trình get:

1. Tính vị trí dựa trên giá trị hash.
2. Tìm đến vị trí chỉ định, nếu nút đầu là cái cần tìm, trả về trực tiếp value của nó.
3. Nếu giá trị hash của nút đầu nhỏ hơn 0, nghĩa là đang mở rộng hoặc là cây đỏ đen, tìm kiếm trong đó.
4. Nếu là danh sách liên kết, duyệt để tìm.

### 5. Đếm kích thước

Phương thức `size()` của `ConcurrentHashMap` dùng để lấy tổng số phần tử hiện có trong Map, nhưng trong kịch bản đồng thời cao, làm thế nào để thống kê số lượng phần tử chính xác và hiệu quả là một điểm khó kỹ thuật. Java 8 đã áp dụng một cơ chế đếm phân đoạn tinh tế để giải quyết vấn đề này.

#### 5.1 Tại sao cần đếm phân đoạn

Trong môi trường đồng thời, nếu nhiều luồng cùng thực hiện thao tác `put`, tất cả đều cần cập nhật tổng số phần tử. Nếu dùng một biến đếm chung, sẽ dẫn đến cạnh tranh gay gắt — tất cả các luồng đều tranh giành quyền sửa đổi cùng một biến, điều này ảnh hưởng nghiêm trọng đến hiệu suất.

Để giải quyết vấn đề này, `ConcurrentHashMap` áp dụng tư tưởng thiết kế **phân tán điểm nóng**: không dùng một bộ đếm duy nhất, mà phân tán việc đếm vào nhiều biến. Giống như ngân hàng không chỉ mở một quầy phục vụ mà mở nhiều quầy để phân luồng khách hàng, điều này có thể giảm đáng kể xung đột.

#### 5.2 Thiết kế baseCount và counterCells

`ConcurrentHashMap` nội bộ duy trì hai trường quan trọng liên quan đến đếm:

- **baseCount**: bộ đếm cơ sở, khi không có cạnh tranh, trực tiếp cập nhật biến này thông qua CAS. Có thể hiểu nó là "bộ đếm chính".
- **counterCells**: mảng bộ đếm. Khi nhiều luồng cạnh tranh cập nhật `baseCount` thất bại, chúng sẽ thử phân tán số tăng đếm đến các vị trí khác nhau trong mảng `counterCells`.
  - Mỗi luồng dựa trên **giá trị Probe** của mình (có thể hiểu là một loại mã hash được tạo từ ID luồng) ánh xạ đến một slot trong mảng, ưu tiên tích lũy trong "ô nghiêng về phía này".
  - **Lưu ý**: ô này không phải là "riêng tư của luồng" theo nghĩa chặt chẽ. Khi xung đột hash, nhiều luồng vẫn có thể ánh xạ đến cùng một slot và cập nhật đồng thời.

**Ví dụ**: Giả sử có 10 luồng đồng thời thêm phần tử vào Map. Luồng đầu tiên thành công cập nhật `baseCount` qua CAS, nhưng 9 luồng sau khi cập nhật `baseCount` phát hiện có cạnh tranh, sẽ chuyển sang mảng `counterCells` tìm một vị trí để tích lũy. 9 luồng này có thể phân tán đến các vị trí khác nhau trong mảng (ví dụ luồng 2 ở `counterCells[1]`, luồng 3 ở `counterCells[2]`), từ đó phân tán cạnh tranh từ một điểm sang nhiều điểm.

#### 5.3 Cập nhật đếm khi put phần tử như thế nào

Ở cuối phương thức `putVal`, chúng ta có thể thấy gọi phương thức `addCount(1L, binCount)`, phương thức này dùng để cập nhật đếm phần tử.

Logic thực hiện của `addCount` có thể được tóm tắt đại khái như sau:

1. **Ưu tiên thử cập nhật baseCount**

   - Nếu hiện tại chưa bật `counterCells` (`counterCells == null`), luồng sẽ trước tiên thử trực tiếp cập nhật `baseCount` thông qua CAS.
   - Nếu CAS thành công, nghĩa là cạnh tranh không gay gắt, trả về trực tiếp.

2. **Khi cạnh tranh xuất hiện, chuyển sang counterCells**

   - Nếu CAS cập nhật `baseCount` thất bại (nghĩa là có luồng khác đang cạnh tranh), hoặc `counterCells` đã tồn tại (nghĩa là hệ thống trước đó đã gặp cạnh tranh), luồng sẽ thử cập nhật trong `counterCells`:
     - Dựa trên giá trị probe của mình ánh xạ đến một slot;
     - Thực hiện một lần CAS tích lũy trên `CounterCell` tương ứng với slot đó.
   - Nếu slot này rỗng hoặc CAS vẫn xung đột, sẽ vào một đường dẫn "nặng" hơn `fullAddCount`, trong đó chịu trách nhiệm khởi tạo slot, chọn lại slot, v.v.

3. **Khởi tạo động và mở rộng counterCells**
   - Khi phát hiện cạnh tranh tương đối gay gắt (ví dụ: CAS của một cell cũng thường xuyên thất bại), `fullAddCount` sẽ dưới sự bảo vệ của khóa tự quay nhẹ `cellsBusy`:
     - Nếu `counterCells` chưa được khởi tạo, khởi tạo một mảng nhỏ (ví dụ độ dài 2);
     - Nếu đã tồn tại và độ dài chưa đạt giới hạn trên (thường không vượt quá số CPU core), mở rộng theo 2 lần, thêm nhiều slot đếm hơn, phân tán các luồng thêm nữa.

Thiết kế này đảm bảo: khi đồng thời thấp chỉ dùng `baseCount` đơn giản, đường dẫn rất ngắn; khi đồng thời cao tự động chuyển sang đếm phân đoạn, thông qua cơ chế `counterCells` và mở rộng làm giảm bớt cạnh tranh, cân bằng giữa hiệu suất và độ chính xác.

#### 5.4 sumCount tính tổng số phần tử như thế nào

Khi chúng ta gọi phương thức `size()`, cuối cùng sẽ gọi phương thức `sumCount()` để tính tổng số phần tử. Logic của `sumCount()` rất đơn giản trực tiếp:

1. Đọc giá trị `baseCount` làm giá trị cơ sở.
2. Duyệt mảng `counterCells`, tích lũy giá trị đếm của tất cả các vị trí không rỗng vào giá trị cơ sở.
3. Trả về kết quả tích lũy.

**Lưu ý**:

- **Tính nhất quán yếu**: `sumCount()` **không khóa** toàn bộ. Nếu trong quá trình tính có luồng khác chèn dữ liệu, kết quả trả về chỉ là **giá trị gần đúng**. Nhưng trong kịch bản đồng thời cao, việc theo đuổi "tổng số chính xác trong tức khắc" tốn kém quá mức và vô nghĩa, giá trị gần đúng thường đã đủ.
- **Tràn số nguyên**: Phương thức `size()` trả về kiểu `int`. Nếu số lượng phần tử vượt quá `Integer.MAX_VALUE`, nó chỉ trả về `Integer.MAX_VALUE`. Nếu cần lấy đếm dung lượng lớn chính xác, khuyến nghị sử dụng phương thức **`mappingCount()`** mới được thêm trong Java 8, phương thức này trả về kiểu `long`.

## 3. Tóm tắt

`ConcurrentHashMap` trong Java 7 sử dụng khóa phân đoạn, tức là mỗi `Segment` chỉ có một luồng có thể thao tác cùng lúc. Mỗi `Segment` là một cấu trúc giống mảng `HashMap`, có thể mở rộng, xung đột của nó sẽ chuyển thành danh sách liên kết. Nhưng số lượng `Segment` không thể thay đổi sau khi khởi tạo.

`ConcurrentHashMap` trong Java 8 sử dụng cơ chế khóa `Synchronized` kết hợp CAS. Cấu trúc cũng tiến hóa từ **mảng `Segment` + mảng `HashEntry` + danh sách liên kết** trong Java 7 thành **mảng Node + danh sách liên kết / cây đỏ đen**. Node là một cấu trúc tương tự HashEntry. Xung đột của nó khi đạt đến kích thước nhất định `TREEIFY_THRESHOLD = 8` sẽ chuyển thành cây đỏ đen, khi xung đột nhỏ hơn một số lượng nhất định `UNTREEIFY_THRESHOLD = 6` lại quay về danh sách liên kết.

Một số bạn có thể nghi ngờ về hiệu suất của `Synchronized`. Thực ra khóa `Synchronized` từ khi giới thiệu chiến lược nâng cấp khóa, hiệu suất không còn là vấn đề nữa. Các bạn có hứng thú có thể tự tìm hiểu về **nâng cấp khóa** của `Synchronized`.

<!-- @include: @article-footer.snippet.md -->
