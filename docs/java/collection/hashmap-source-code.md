---
title: Phân tích mã nguồn HashMap
description: Phân tích chuyên sâu mã nguồn HashMap：Giải thích chi tiết sự khác biệt cấu trúc JDK1.7/1.8, hàm nhiễu hash, load factor 0.75, cơ chế mở rộng rehash, ngưỡng chuyển đổi từ linked list sang red-black tree và các nguyên lý cốt lõi của HashMap.
category: Java
tag:
  - Java Collections
head:
  - - meta
    - name: keywords
      content: HashMap源码,哈希表,红黑树,链表,扰动函数,负载因子,HashMap扩容,哈希冲突,JDK1.8优化
---

<!-- @include: @article-header.snippet.md -->

> Cảm ơn [changfubai](https://github.com/changfubai) đã đóng góp cải thiện bài viết này!

## Giới thiệu HashMap

HashMap chủ yếu được dùng để lưu trữ các cặp key-value, được triển khai dựa trên Map interface sử dụng bảng băm (hash table), là một trong những Java Collection được sử dụng phổ biến nhất và không an toàn luồng (non-thread-safe).

`HashMap` có thể lưu trữ null cho cả key và value, nhưng null làm key chỉ có thể có một, còn null làm value có thể có nhiều.

Trước JDK1.8, HashMap được cấu tạo từ **mảng + linked list**, trong đó mảng là thành phần chính của HashMap, còn linked list chủ yếu tồn tại để giải quyết xung đột băm (hash collision) theo phương pháp "chaining". Từ JDK1.8 trở đi, `HashMap` có sự thay đổi lớn trong việc giải quyết xung đột băm: khi độ dài linked list lớn hơn hoặc bằng ngưỡng (mặc định là 8) (trước khi chuyển đổi linked list thành red-black tree, sẽ kiểm tra nếu độ dài mảng hiện tại nhỏ hơn 64 thì sẽ ưu tiên mở rộng mảng thay vì chuyển đổi sang red-black tree), linked list sẽ được chuyển đổi thành red-black tree để giảm thời gian tìm kiếm.

Kích thước khởi tạo mặc định của `HashMap` là 16. Mỗi lần mở rộng, dung lượng sẽ gấp đôi. Và `HashMap` luôn sử dụng lũy thừa của 2 làm kích thước bảng băm.

## Phân tích cấu trúc dữ liệu bên dưới

### Trước JDK1.8

Trước JDK1.8, phần dưới của HashMap là sự kết hợp của **mảng và linked list**, hay còn gọi là **linked list scatter** (phân tán linked list).

HashMap lấy hashCode của key, qua hàm nhiễu (perturbation function) để tạo ra giá trị hash, sau đó dùng `(n - 1) & hash` để xác định vị trí lưu phần tử hiện tại (n là độ dài mảng). Nếu vị trí đó đã có phần tử, thì so sánh hash value và key của phần tử đó với phần tử cần chèn: nếu giống nhau thì ghi đè trực tiếp, nếu khác nhau thì giải quyết xung đột bằng chaining (kéo chuỗi).

Cái gọi là hàm nhiễu chính là phương thức hash của HashMap. Sử dụng phương thức hash tức là sử dụng hàm nhiễu là để ngăn các triển khai hashCode() kém chất lượng, nói cách khác việc sử dụng hàm nhiễu có thể giảm bớt các va chạm (collision).

**Mã nguồn phương thức hash của HashMap trong JDK 1.8:**

Phương thức hash trong JDK 1.8 đơn giản hơn so với phương thức hash trong JDK 1.7, nhưng nguyên lý không thay đổi.

```java
    static final int hash(Object key) {
      int h;
      // key.hashCode()：返回散列值也就是hashcode
      // ^：按位异或
      // >>>:无符号右移，忽略符号位，空位都以0补齐
      return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
  }
```

So sánh với mã nguồn phương thức hash của HashMap trong JDK1.7.

```java
static int hash(int h) {
    // This function ensures that hashCodes that differ only by
    // constant multiples at each bit position have a bounded
    // number of collisions (approximately 8 at default load factor).

    h ^= (h >>> 20) ^ (h >>> 12);
    return h ^ (h >>> 7) ^ (h >>> 4);
}
```

So với phương thức hash của JDK1.8, phương thức hash của JDK 1.7 có hiệu suất kém hơn một chút, vì dù sao cũng đã nhiễu tới 4 lần.

**"Chaining" (phương pháp kéo chuỗi)** là: kết hợp linked list và mảng lại với nhau. Tức là tạo một mảng linked list, mỗi ô trong mảng là một linked list. Khi gặp xung đột băm, chỉ cần thêm giá trị bị xung đột vào linked list là được.

![Cấu trúc nội bộ trước JDK1.8 - HashMap](https://oss.javaguide.cn/github/javaguide/java/collection/jdk1.7_hashmap.png)

### Từ JDK1.8 trở đi

So với các phiên bản trước, JDK1.8 trở đi có sự thay đổi lớn trong việc giải quyết xung đột băm.

Khi độ dài linked list lớn hơn ngưỡng (mặc định là 8), phương thức `treeifyBin()` sẽ được gọi đầu tiên. Phương thức này sẽ quyết định có chuyển đổi sang red-black tree hay không dựa trên độ dài mảng của HashMap. Chỉ khi độ dài mảng lớn hơn hoặc bằng 64 mới thực hiện chuyển đổi sang red-black tree để giảm thời gian tìm kiếm. Ngược lại, chỉ thực hiện `resize()` để mở rộng mảng. Phần mã nguồn liên quan sẽ không trích dẫn ở đây, hãy tập trung vào phương thức `treeifyBin()` là được!

![Cấu trúc nội bộ từ JDK1.8 trở đi - HashMap](https://oss.javaguide.cn/github/javaguide/java/collection/jdk1.8_hashmap.png)

**Các thuộc tính của class:**

```java
public class HashMap<K,V> extends AbstractMap<K,V> implements Map<K,V>, Cloneable, Serializable {
    // 序列号
    private static final long serialVersionUID = 362498820763181265L;
    // 默认的初始容量是16
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4;
    // 最大容量
    static final int MAXIMUM_CAPACITY = 1 << 30;
    // 默认的负载因子
    static final float DEFAULT_LOAD_FACTOR = 0.75f;
    // 当桶(bucket)上的结点数大于等于这个值时会转成红黑树
    static final int TREEIFY_THRESHOLD = 8;
    // 当桶(bucket)上的结点数小于等于这个值时树转链表
    static final int UNTREEIFY_THRESHOLD = 6;
    // 桶中结构转化为红黑树对应的table的最小容量
    static final int MIN_TREEIFY_CAPACITY = 64;
    // 存储元素的数组，总是2的幂次倍
    transient Node<k,v>[] table;
    // 一个包含了映射中所有键值对的集合视图
    transient Set<map.entry<k,v>> entrySet;
    // 存放元素的个数，注意这个不等于数组的长度。
    transient int size;
    // 每次扩容和更改map结构的计数器
    transient int modCount;
    // 阈值(容量*负载因子) 当实际大小超过阈值时，会进行扩容
    int threshold;
    // 负载因子
    final float loadFactor;
}
```

- **loadFactor (hệ số tải)**

  loadFactor là hệ số tải, kiểm soát mức độ dày/thưa của dữ liệu được lưu trong mảng. loadFactor càng gần 1, dữ liệu (entry) được lưu trong mảng càng nhiều, càng dày đặc, tức là độ dài linked list sẽ tăng lên. loadFactor càng nhỏ, tức là càng gần 0, dữ liệu (entry) được lưu trong mảng càng ít, càng thưa thớt.

  **loadFactor quá lớn làm giảm hiệu quả tìm kiếm phần tử, quá nhỏ làm giảm tỷ lệ sử dụng mảng và dữ liệu sẽ rất phân tán. Giá trị mặc định của loadFactor là 0.75f là một giá trị ngưỡng tốt được đưa ra bởi phía chính thức**.

  Dung lượng mặc định là 16, hệ số tải là 0.75. Trong quá trình sử dụng Map liên tục thêm dữ liệu, khi số lượng vượt quá 16 \* 0.75 = 12 thì cần mở rộng dung lượng hiện tại từ 16, và quá trình mở rộng này liên quan đến rehash, sao chép dữ liệu, v.v., nên rất tốn hiệu suất.

- **threshold**

  **threshold = capacity \* loadFactor**, **khi Size > threshold** thì cần xem xét mở rộng mảng, tức là đây là **tiêu chuẩn để đánh giá liệu mảng có cần mở rộng hay không**.

**Mã nguồn class Node:**

```java
// 继承自 Map.Entry<K,V>
static class Node<K,V> implements Map.Entry<K,V> {
       final int hash;// 哈希值，存放元素到hashmap中时用来与其他元素hash值比较
       final K key;//键
       V value;//值
       // 指向下一个节点
       Node<K,V> next;
       Node(int hash, K key, V value, Node<K,V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }
        public final K getKey()        { return key; }
        public final V getValue()      { return value; }
        public final String toString() { return key + "=" + value; }
        // 重写hashCode()方法
        public final int hashCode() {
            return Objects.hashCode(key) ^ Objects.hashCode(value);
        }

        public final V setValue(V newValue) {
            V oldValue = value;
            value = newValue;
            return oldValue;
        }
        // 重写 equals() 方法
        public final boolean equals(Object o) {
            if (o == this)
                return true;
            if (o instanceof Map.Entry) {
                Map.Entry<?,?> e = (Map.Entry<?,?>)o;
                if (Objects.equals(key, e.getKey()) &&
                    Objects.equals(value, e.getValue()))
                    return true;
            }
            return false;
        }
}
```

**Mã nguồn class TreeNode:**

```java
static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
        TreeNode<K,V> parent;  // 父
        TreeNode<K,V> left;    // 左
        TreeNode<K,V> right;   // 右
        TreeNode<K,V> prev;    // needed to unlink next upon deletion
        boolean red;           // 判断颜色
        TreeNode(int hash, K key, V val, Node<K,V> next) {
            super(hash, key, val, next);
        }
        // 返回根节点
        final TreeNode<K,V> root() {
            for (TreeNode<K,V> r = this, p;;) {
                if ((p = r.parent) == null)
                    return r;
                r = p;
       }
```

## Phân tích mã nguồn HashMap

### Các phương thức khởi tạo (Constructor)

HashMap có bốn phương thức khởi tạo như sau:

```java
    // 默认构造函数。
    public HashMap() {
        this.loadFactor = DEFAULT_LOAD_FACTOR; // all   other fields defaulted
     }

     // 包含另一个"Map"的构造函数
     public HashMap(Map<? extends K, ? extends V> m) {
         this.loadFactor = DEFAULT_LOAD_FACTOR;
         putMapEntries(m, false);//下面会分析到这个方法
     }

     // 指定"容量大小"的构造函数
     public HashMap(int initialCapacity) {
         this(initialCapacity, DEFAULT_LOAD_FACTOR);
     }

     // 指定"容量大小"和"负载因子"的构造函数
     public HashMap(int initialCapacity, float loadFactor) {
         if (initialCapacity < 0)
             throw new IllegalArgumentException("Illegal initial capacity: " + initialCapacity);
         if (initialCapacity > MAXIMUM_CAPACITY)
             initialCapacity = MAXIMUM_CAPACITY;
         if (loadFactor <= 0 || Float.isNaN(loadFactor))
             throw new IllegalArgumentException("Illegal load factor: " + loadFactor);
         this.loadFactor = loadFactor;
         // 初始容量暂时存放到 threshold ，在resize中再赋值给 newCap 进行table初始化
         this.threshold = tableSizeFor(initialCapacity);
     }
```

> Cần đặc biệt lưu ý: `initialCapacity` được truyền vào không phải là dung lượng mảng cuối cùng. `HashMap` sẽ gọi `tableSizeFor()` để **làm tròn lên thành lũy thừa của 2 nhỏ nhất lớn hơn hoặc bằng giá trị đó**, và tạm thời lưu vào trường `threshold`. Mảng `table` thực sự sẽ được khởi tạo với kích thước này chỉ khi lần mở rộng đầu tiên (`resize()`) xảy ra.
>
> Ví dụ: `initialCapacity = 9` → `threshold = 16` → độ dài `table` cuối cùng là 16.

**Phương thức putMapEntries:**

```java
final void putMapEntries(Map<? extends K, ? extends V> m, boolean evict) {
    int s = m.size();
    if (s > 0) {
        // 判断table是否已经初始化
        if (table == null) { // pre-size
            /*
             * 未初始化，s为m的实际元素个数，ft=s/loadFactor => s=ft*loadFactor, 跟我们前面提到的
             * 阈值=容量*负载因子 是不是很像，是的，ft指的是要添加s个元素所需的最小的容量
             */
            float ft = ((float)s / loadFactor) + 1.0F;
            int t = ((ft < (float)MAXIMUM_CAPACITY) ?
                    (int)ft : MAXIMUM_CAPACITY);
            /*
             * 根据构造函数可知，table未初始化，threshold实际上是存放的初始化容量，如果添加s个元素所
             * 需的最小容量大于初始化容量，则将最小容量扩容为最接近的2的幂次方大小作为初始化。
             * 注意这里不是初始化阈值
             */
            if (t > threshold)
                threshold = tableSizeFor(t);
        }
        // 已初始化，并且m元素个数大于阈值，进行扩容处理
        else if (s > threshold)
            resize();
        // 将m中的所有元素添加至HashMap中，如果table未初始化，putVal中会调用resize初始化或扩容
        for (Map.Entry<? extends K, ? extends V> e : m.entrySet()) {
            K key = e.getKey();
            V value = e.getValue();
            putVal(hash(key), key, value, false, evict);
        }
    }
}
```

### Phương thức put

HashMap chỉ cung cấp phương thức put để thêm phần tử; phương thức putVal chỉ là một phương thức được gọi bởi put, không được cung cấp cho người dùng sử dụng trực tiếp.

**Phân tích phương thức putVal khi thêm phần tử như sau:**

1. Nếu vị trí mảng được xác định không có phần tử thì chèn trực tiếp.
2. Nếu vị trí mảng được xác định đã có phần tử, so sánh key của phần tử đó với key cần chèn: nếu key giống nhau thì ghi đè trực tiếp, nếu key khác nhau thì kiểm tra xem p có phải là tree node hay không, nếu có thì gọi `e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value)` để thêm phần tử vào cây. Nếu không thì duyệt linked list để chèn (chèn vào cuối linked list).

![ ](https://oss.javaguide.cn/github/javaguide/database/sql/put.png)

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    // table未初始化或者长度为0，进行扩容
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length;
    // (n - 1) & hash 确定元素存放在哪个桶中，桶为空，新生成结点放入桶中(此时，这个结点是放在数组中)
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    // 桶中已经存在元素（处理hash冲突）
    else {
        Node<K,V> e; K k;
        //快速判断第一个节点table[i]的key是否与插入的key一样，若相同就直接使用插入的值p替换掉旧的值e。
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
        // 判断插入的是否是红黑树节点
        else if (p instanceof TreeNode)
            // 放入树中
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        // 不是红黑树节点则说明为链表结点
        else {
            // 在链表最末插入结点
            for (int binCount = 0; ; ++binCount) {
                // 到达链表的尾部
                if ((e = p.next) == null) {
                    // 在尾部插入新结点
                    p.next = newNode(hash, key, value, null);
                    // 结点数量达到阈值(默认为 8 )，执行 treeifyBin 方法
                    // 这个方法会根据 HashMap 数组来决定是否转换为红黑树。
                    // 只有当数组长度大于或者等于 64 的情况下，才会执行转换红黑树操作，以减少搜索时间。否则，就是只是对数组扩容。
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        treeifyBin(tab, hash);
                    // 跳出循环
                    break;
                }
                // 判断链表中结点的key值与插入的元素的key值是否相等
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    // 相等，跳出循环
                    break;
                // 用于遍历桶中的链表，与前面的e = p.next组合，可以遍历链表
                p = e;
            }
        }
        // 表示在桶中找到key值、hash值与插入元素相等的结点
        if (e != null) {
            // 记录e的value
            V oldValue = e.value;
            // onlyIfAbsent为false或者旧值为null
            if (!onlyIfAbsent || oldValue == null)
                //用新值替换旧值
                e.value = value;
            // 访问后回调
            afterNodeAccess(e);
            // 返回旧值
            return oldValue;
        }
    }
    // 结构性修改
    ++modCount;
    // 实际大小大于阈值则扩容
    if (++size > threshold)
        resize();
    // 插入后回调
    afterNodeInsertion(evict);
    return null;
}
```

**Hãy so sánh thêm với mã nguồn phương thức put trong JDK1.7**

**Phân tích phương thức put như sau:**

- ① Nếu vị trí mảng được xác định không có phần tử thì chèn trực tiếp.
- ② Nếu vị trí mảng được xác định đã có phần tử, duyệt linked list với phần tử đó là đầu, lần lượt so sánh với key cần chèn: nếu key giống nhau thì ghi đè trực tiếp, nếu khác nhau thì sử dụng phương thức chèn đầu (head insertion) để chèn phần tử.

```java
public V put(K key, V value)
    if (table == EMPTY_TABLE) {
    inflateTable(threshold);
}
    if (key == null)
        return putForNullKey(value);
    int hash = hash(key);
    int i = indexFor(hash, table.length);
    for (Entry<K,V> e = table[i]; e != null; e = e.next) { // 先遍历
        Object k;
        if (e.hash == hash && ((k = e.key) == key || key.equals(k))) {
            V oldValue = e.value;
            e.value = value;
            e.recordAccess(this);
            return oldValue;
        }
    }

    modCount++;
    addEntry(hash, key, value, i);  // 再插入
    return null;
}
```

### Phương thức get

```java
public V get(Object key) {
    Node<K,V> e;
    return (e = getNode(hash(key), key)) == null ? null : e.value;
}

final Node<K,V> getNode(int hash, Object key) {
    Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (first = tab[(n - 1) & hash]) != null) {
        // 数组元素相等
        if (first.hash == hash && // always check first node
            ((k = first.key) == key || (key != null && key.equals(k))))
            return first;
        // 桶中不止一个节点
        if ((e = first.next) != null) {
            // 在树中get
            if (first instanceof TreeNode)
                return ((TreeNode<K,V>)first).getTreeNode(hash, key);
            // 在链表中get
            do {
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    return e;
            } while ((e = e.next) != null);
        }
    }
    return null;
}
```

### Phương thức resize

Khi mở rộng, sẽ đi kèm với một lần phân phối lại hash và duyệt tất cả các phần tử trong bảng hash, rất tốn thời gian. Khi viết chương trình, cần cố gắng tránh resize. Phương thức resize thực chất là tích hợp khởi tạo table và mở rộng table lại với nhau, hành vi bên dưới đều là gán cho table một mảng mới.

```java
final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;
    if (oldCap > 0) {
        // 超过最大值就不再扩充了，就只好随你碰撞去吧
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        // 没超过最大值，就扩充为原来的2倍
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY && oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // double threshold
    }
    else if (oldThr > 0) // initial capacity was placed in threshold
        // 创建对象时初始化容量大小放在threshold中，此时只需要将其作为新的数组容量
        newCap = oldThr;
    else {
        // signifies using defaults 无参构造函数创建的对象在这里计算容量和阈值
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    if (newThr == 0) {
        // 创建时指定了初始化容量或者负载因子，在这里进行阈值初始化，
    	// 或者扩容前的旧容量小于16，在这里计算新的resize上限
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ? (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr;
    @SuppressWarnings({"rawtypes","unchecked"})
        Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    if (oldTab != null) {
        // 把每个bucket都移动到新的buckets中
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;
                if (e.next == null)
                    // 只有一个节点，直接计算元素新的位置即可
                    newTab[e.hash & (newCap - 1)] = e;
                else if (e instanceof TreeNode)
                    // 将红黑树拆分成2棵子树，如果子树节点数小于等于 UNTREEIFY_THRESHOLD（默认为 6），则将子树转换为链表。
                    // 如果子树节点数大于 UNTREEIFY_THRESHOLD，则保持子树的树结构。
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                else {
                    Node<K,V> loHead = null, loTail = null;
                    Node<K,V> hiHead = null, hiTail = null;
                    Node<K,V> next;
                    do {
                        next = e.next;
                        // 原索引
                        if ((e.hash & oldCap) == 0) {
                            if (loTail == null)
                                loHead = e;
                            else
                                loTail.next = e;
                            loTail = e;
                        }
                        // 原索引+oldCap
                        else {
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);
                    // 原索引放到bucket里
                    if (loTail != null) {
                        loTail.next = null;
                        newTab[j] = loHead;
                    }
                    // 原索引+oldCap放到bucket里
                    if (hiTail != null) {
                        hiTail.next = null;
                        newTab[j + oldCap] = hiHead;
                    }
                }
            }
        }
    }
    return newTab;
}
```

## Kiểm thử các phương thức thường dùng của HashMap

```java
package map;

import java.util.Collection;
import java.util.HashMap;
import java.util.Set;

public class HashMapDemo {

    public static void main(String[] args) {
        HashMap<String, String> map = new HashMap<String, String>();
        // 键不能重复，值可以重复
        map.put("san", "张三");
        map.put("si", "李四");
        map.put("wu", "王五");
        map.put("wang", "老王");
        map.put("wang", "老王2");// 老王被覆盖
        map.put("lao", "老王");
        System.out.println("-------直接输出hashmap:-------");
        System.out.println(map);
        /**
         * 遍历HashMap
         */
        // 1.获取Map中的所有键
        System.out.println("-------foreach获取Map中所有的键:------");
        Set<String> keys = map.keySet();
        for (String key : keys) {
            System.out.print(key+"  ");
        }
        System.out.println();//换行
        // 2.获取Map中所有值
        System.out.println("-------foreach获取Map中所有的值:------");
        Collection<String> values = map.values();
        for (String value : values) {
            System.out.print(value+"  ");
        }
        System.out.println();//换行
        // 3.得到key的值的同时得到key所对应的值
        System.out.println("-------得到key的值的同时得到key所对应的值:-------");
        Set<String> keys2 = map.keySet();
        for (String key : keys2) {
            System.out.print(key + "：" + map.get(key)+"   ");

        }
        /**
         * 如果既要遍历key又要value，那么建议这种方式，因为如果先获取keySet然后再执行map.get(key)，map内部会执行两次遍历。
         * 一次是在获取keySet的时候，一次是在遍历所有key的时候。
         */
        // 当我调用put(key,value)方法的时候，首先会把key和value封装到
        // Entry这个静态内部类对象中，把Entry对象再添加到数组中，所以我们想获取
        // map中的所有键值对，我们只要获取数组中的所有Entry对象，接下来
        // 调用Entry对象中的getKey()和getValue()方法就能获取键值对了
        Set<java.util.Map.Entry<String, String>> entrys = map.entrySet();
        for (java.util.Map.Entry<String, String> entry : entrys) {
            System.out.println(entry.getKey() + "--" + entry.getValue());
        }

        /**
         * HashMap其他常用方法
         */
        System.out.println("after map.size()："+map.size());
        System.out.println("after map.isEmpty()："+map.isEmpty());
        System.out.println(map.remove("san"));
        System.out.println("after map.remove()："+map);
        System.out.println("after map.get(si)："+map.get("si"));
        System.out.println("after map.containsKey(si)："+map.containsKey("si"));
        System.out.println("after containsValue(李四)："+map.containsValue("李四"));
        System.out.println(map.replace("si", "李四2"));
        System.out.println("after map.replace(si, 李四2):"+map);
    }

}
```

<!-- @include: @article-footer.snippet.md -->
