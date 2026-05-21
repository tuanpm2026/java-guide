---
title: Phân tích mã nguồn LinkedHashMap
description: Phân tích chuyên sâu mã nguồn LinkedHashMap：Giải thích chi tiết cách LinkedHashMap duy trì danh sách liên kết đôi để thực hiện sắp xếp theo thứ tự chèn/truy cập, cài đặt bộ nhớ cache LRU, sự khác biệt với HashMap và tối ưu hóa hiệu suất duyệt.
category: Java
tag:
  - Java Collection
head:
  - - meta
    - name: keywords
      content: LinkedHashMap源码,插入顺序,访问顺序,LRU缓存,双向链表,有序Map,LinkedHashMap实现原理
---

## Giới thiệu LinkedHashMap

`LinkedHashMap` là một lớp collection do Java cung cấp, nó kế thừa từ `HashMap` và duy trì thêm một danh sách liên kết đôi trên nền `HashMap`, mang lại những đặc điểm sau:

1. Hỗ trợ duyệt theo thứ tự chèn khi lặp.
2. Hỗ trợ sắp xếp theo thứ tự truy cập các phần tử, phù hợp để đóng gói công cụ bộ nhớ cache LRU.
3. Vì nội bộ sử dụng danh sách liên kết đôi để duy trì các nút, hiệu suất duyệt tỷ lệ thuận với số lượng phần tử, so với `HashMap` tỷ lệ thuận với dung lượng, hiệu quả lặp sẽ cao hơn nhiều.

Cấu trúc logic của `LinkedHashMap` được thể hiện trong hình dưới đây, nó duy trì một danh sách liên kết đôi giữa các nút trên nền `HashMap`, giúp các nút, danh sách liên kết, và cây đỏ đen phân tán trên các bucket khác nhau được liên kết theo thứ tự.

![Cấu trúc logic LinkedHashMap](/images/github/javaguide/java/collection/linkhashmap-structure-overview.png)

## Ví dụ sử dụng LinkedHashMap

### Duyệt theo thứ tự chèn

Như dưới đây, chúng ta thêm các phần tử vào `LinkedHashMap` theo thứ tự rồi duyệt.

```java
HashMap < String, String > map = new LinkedHashMap < > ();
map.put("a", "2");
map.put("g", "3");
map.put("r", "1");
map.put("e", "23");

for (Map.Entry < String, String > entry: map.entrySet()) {
    System.out.println(entry.getKey() + ":" + entry.getValue());
}
```

Kết quả:

```java
a:2
g:3
r:1
e:23
```

Có thể thấy, thứ tự lặp của `LinkedHashMap` nhất quán với thứ tự chèn, đây là điều mà `HashMap` không có.

### Duyệt theo thứ tự truy cập

`LinkedHashMap` định nghĩa chế độ sắp xếp `accessOrder` (kiểu boolean, mặc định là false), true là thứ tự truy cập, false là thứ tự chèn.

Để thực hiện duyệt theo thứ tự truy cập, chúng ta có thể dùng hàm khởi tạo `LinkedHashMap` truyền thuộc tính `accessOrder`, và đặt `accessOrder` thành true, nghĩa là nó có tính sắp xếp theo truy cập.

```java
LinkedHashMap<Integer, String> map = new LinkedHashMap<>(16, 0.75f, true);
map.put(1, "one");
map.put(2, "two");
map.put(3, "three");
map.put(4, "four");
map.put(5, "five");
//访问元素2,该元素会被移动至链表末端
map.get(2);
//访问元素3,该元素会被移动至链表末端
map.get(3);
for (Map.Entry<Integer, String> entry : map.entrySet()) {
    System.out.println(entry.getKey() + " : " + entry.getValue());
}
```

Kết quả:

```java
1 : one
4 : four
5 : five
2 : two
3 : three
```

Có thể thấy, thứ tự lặp của `LinkedHashMap` nhất quán với thứ tự truy cập.

### Bộ nhớ cache LRU

Từ ví dụ trên, chúng ta có thể thấy rằng thông qua `LinkedHashMap` chúng ta có thể đóng gói một bộ nhớ cache LRU (**L**east **R**ecently **U**sed, ít được sử dụng gần đây nhất) đơn giản, đảm bảo khi số phần tử lưu trữ vượt quá dung lượng container, phần tử ít được truy cập gần đây nhất sẽ bị xóa.

![](/images/github/javaguide/java/collection/lru-cache.png)

Ý tưởng cài đặt cụ thể như sau:

- Kế thừa `LinkedHashMap`;
- Trong hàm khởi tạo đặt `accessOrder` thành true, như vậy khi truy cập một phần tử, phần tử đó sẽ được di chuyển đến cuối danh sách liên kết, phần tử đầu danh sách liên kết là phần tử ít được truy cập gần đây nhất;
- Ghi đè phương thức `removeEldestEntry`, phương thức này trả về một giá trị boolean, thông báo cho `LinkedHashMap` có cần xóa phần tử đầu danh sách không (dung lượng cache có hạn).

```java
public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    /**
     * 判断size超过容量时返回true，告知LinkedHashMap移除最老的缓存项(即链表的第一个元素)
     */
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}
```

Mã kiểm tra như sau, người viết khởi tạo dung lượng cache là 3, sau đó lần lượt thêm 4 phần tử.

```java
LRUCache<Integer, String> cache = new LRUCache<>(3);
cache.put(1, "one");
cache.put(2, "two");
cache.put(3, "three");
cache.put(4, "four");
cache.put(5, "five");
for (int i = 1; i <= 5; i++) {
    System.out.println(cache.get(i));
}
```

Kết quả:

```java
null
null
three
four
five
```

Từ kết quả đầu ra, do dung lượng cache là 3, khi thêm phần tử thứ 4, phần tử thứ 1 sẽ bị xóa. Khi thêm phần tử thứ 5, phần tử thứ 2 sẽ bị xóa.

## Phân tích mã nguồn LinkedHashMap

### Thiết kế Node

Trước khi thảo luận chính thức về `LinkedHashMap`, hãy nói về thiết kế nút `Entry` của `LinkedHashMap`. Chúng ta đều biết rằng các nút trong bucket của `HashMap` bị chuyển thành danh sách liên kết do xung đột sẽ được chuyển thành cây đỏ đen khi thỏa mãn hai điều kiện sau:

1. ~~Số nút trên danh sách liên kết đạt ngưỡng cây hóa 7, tức là `TREEIFY_THRESHOLD - 1`.~~
2. Dung lượng bucket đạt dung lượng cây hóa tối thiểu `MIN_TREEIFY_CAPACITY`.

> **🐛 Sửa chữa (xem: [issue#2147](https://github.com/Snailclimb/JavaGuide/issues/2147))**：
>
> Số nút trên danh sách liên kết đạt ngưỡng cây hóa là 8 chứ không phải 7. Vì cách kiểm tra trong mã nguồn là duyệt từ phần tử đầu tiên của danh sách liên kết, chỉ số bắt đầu từ 0, nên điều kiện kiểm tra được đặt là 8-1=7, thực chất là khi lặp đến phần tử cuối thì mới kiểm tra toàn bộ danh sách liên kết có độ dài lớn hơn hoặc bằng 8 thì mới thực hiện cây hóa.
>
> ![](/images/github/javaguide/java/jvm/LinkedHashMap-putval-TREEIFY.png)

`LinkedHashMap` xây dựng một danh sách liên kết đôi cho mỗi nút trên bucket trên nền `HashMap`, điều này khiến các nút cây được chuyển thành cây đỏ đen cũng cần có đặc tính của nút danh sách liên kết đôi, tức là mỗi nút cây cần có hai tham chiếu để lưu địa chỉ của nút trước và nút sau. Do đó, thiết kế lớp nút cây `TreeNode` là một vấn đề khá phức tạp.

Hãy xem sơ đồ lớp giữa hai loại nút này:

1. Lớp nút bên trong `Entry` của `LinkedHashMap` dựa trên `HashMap`, thêm con trỏ `before` và `after` để cho nút có đặc tính danh sách liên kết đôi.
2. Nút cây `TreeNode` của `HashMap` kế thừa `Entry` của `LinkedHashMap` vốn đã có đặc tính danh sách liên kết đôi.

![Mối quan hệ giữa LinkedHashMap và HashMap](/images/github/javaguide/java/collection/map-hashmap-linkedhashmap.png)

Nhiều bạn đọc sẽ thắc mắc: tại sao `TreeNode` của `HashMap` phải lấy đặc tính danh sách liên kết đôi thông qua `LinkedHashMap`? Tại sao không trực tiếp cài đặt con trỏ trước và sau trên `Node`?

Trả lời câu hỏi đầu tiên: chúng ta đều biết `LinkedHashMap` thêm con trỏ đôi vào các nút trên nền `HashMap` để thực hiện đặc tính danh sách liên kết đôi. Vì vậy khi danh sách liên kết bên trong `LinkedHashMap` chuyển thành cây đỏ đen, các nút tương ứng sẽ chuyển thành nút cây `TreeNode`. Để đảm bảo khi sử dụng `LinkedHashMap`, các nút cây vẫn có đặc tính danh sách liên kết đôi, `TreeNode` cần kế thừa `Entry` của `LinkedHashMap`.

Về câu hỏi thứ hai: nếu trực tiếp cài đặt con trỏ trước và sau trên `Node` của `HashMap`, rồi `TreeNode` kế thừa `Node` để lấy đặc tính danh sách liên kết đôi thì sao? Thực ra cách đó cũng được. Chỉ là cách đó sẽ làm cho lớp `Node` lưu cặp key-value khi dùng `HashMap` có thêm hai tham chiếu không cần thiết, lãng phí bộ nhớ không cần thiết.

Vì vậy, để đảm bảo lớp `Node` bên dưới `HashMap` không có tham chiếu dư thừa, đồng thời đảm bảo lớp `Entry` của `LinkedHashMap` có tham chiếu lưu danh sách liên kết, người thiết kế đã cho `Entry` của `LinkedHashMap` kế thừa Node và thêm tham chiếu `before`, `after` để lưu nút trước và sau, để các nút cần đặc tính danh sách liên kết thực hiện logic cần thiết. Sau đó `TreeNode` kế thừa `Entry` để lấy hai con trỏ `before`, `after`.

```java
static class Entry<K,V> extends HashMap.Node<K,V> {
        Entry<K,V> before, after;
        Entry(int hash, K key, V value, Node<K,V> next) {
            super(hash, key, value, next);
        }
    }
```

Nhưng như vậy, khi dùng `HashMap`, `TreeNode` cũng có thêm hai tham chiếu không cần thiết, không phải là lãng phí bộ nhớ sao?

```java
static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
  //略

}
```

Về vấn đề này, trích dẫn nhận xét của tác giả: các tác giả cho rằng với thuật toán `hashCode` tốt, xác suất `HashMap` chuyển thành cây đỏ đen là không lớn. Dù có chuyển thành cây đỏ đen, cũng có thể do xóa hoặc mở rộng mà `TreeNode` lại được chuyển về `Node`, nên xác suất sử dụng `TreeNode` không cao, sự lãng phí tài nguyên bộ nhớ này là có thể chấp nhận được.

```bash
Because TreeNodes are about twice the size of regular nodes, we
use them only when bins contain enough nodes to warrant use
(see TREEIFY_THRESHOLD). And when they become too small (due to
removal or resizing) they are converted back to plain bins.  In
usages with well-distributed user hashCodes, tree bins are
rarely used.  Ideally, under random hashCodes, the frequency of
nodes in bins follows a Poisson distribution
```

### Hàm khởi tạo

`LinkedHashMap` có 4 hàm khởi tạo, cài đặt khá đơn giản, gọi trực tiếp hàm khởi tạo của lớp cha `HashMap` để hoàn thành khởi tạo.

```java
public LinkedHashMap() {
    super();
    accessOrder = false;
}

public LinkedHashMap(int initialCapacity) {
    super(initialCapacity);
    accessOrder = false;
}

public LinkedHashMap(int initialCapacity, float loadFactor) {
    super(initialCapacity, loadFactor);
    accessOrder = false;
}

public LinkedHashMap(int initialCapacity,
    float loadFactor,
    boolean accessOrder) {
    super(initialCapacity, loadFactor);
    this.accessOrder = accessOrder;
}
```

Như đã đề cập ở trên, mặc định `accessOrder` là false. Nếu muốn `LinkedHashMap` sắp xếp cặp key-value theo thứ tự truy cập (tức là đặt phần tử ít truy cập gần đây ở đầu danh sách liên kết, phần tử truy cập gần đây nhất di chuyển đến cuối danh sách), cần gọi hàm khởi tạo thứ 4 và đặt `accessOrder` thành true.

### Phương thức get

Phương thức `get` là phương thức duy nhất được ghi đè trong các thao tác thêm/xóa/sửa/tìm của `LinkedHashMap`. Khi `accessOrder` là true, sau khi hoàn thành truy vấn phần tử, nó sẽ di chuyển phần tử hiện tại được truy cập đến cuối danh sách liên kết.

```java
public V get(Object key) {
     Node < K, V > e;
     //获取key的键值对,若为空直接返回
     if ((e = getNode(hash(key), key)) == null)
         return null;
     //若accessOrder为true，则调用afterNodeAccess将当前元素移到链表末尾
     if (accessOrder)
         afterNodeAccess(e);
     //返回键值对的值
     return e.value;
 }
```

Từ mã nguồn có thể thấy, các bước thực hiện của `get` rất đơn giản:

1. Gọi `getNode` của lớp cha `HashMap` để lấy cặp key-value, nếu null thì trả về trực tiếp.
2. Kiểm tra `accessOrder` có phải true không, nếu true thì cần đảm bảo tính sắp xếp truy cập danh sách liên kết của `LinkedHashMap`, thực hiện bước 3.
3. Gọi `afterNodeAccess` được ghi đè trong `LinkedHashMap` để thêm phần tử hiện tại vào cuối danh sách liên kết.

Điểm mấu chốt nằm ở cài đặt phương thức `afterNodeAccess`, phương thức này chịu trách nhiệm di chuyển phần tử đến cuối danh sách liên kết.

```java
void afterNodeAccess(Node < K, V > e) { // move node to last
    LinkedHashMap.Entry < K, V > last;
    //如果accessOrder 且当前节点不为链表尾节点
    if (accessOrder && (last = tail) != e) {

        //获取当前节点、以及前驱节点和后继节点
        LinkedHashMap.Entry < K, V > p =
            (LinkedHashMap.Entry < K, V > ) e, b = p.before, a = p.after;

        //将当前节点的后继节点指针指向空，使其和后继节点断开联系
        p.after = null;

        //如果前驱节点为空，则说明当前节点是链表的首节点，故将后继节点设置为首节点
        if (b == null)
            head = a;
        else
            //如果前驱节点不为空，则让前驱节点指向后继节点
            b.after = a;

        //如果后继节点不为空，则让后继节点指向前驱节点
        if (a != null)
            a.before = b;
        else
            //如果后继节点为空，则说明当前节点在链表最末尾，直接让last 指向前驱节点,这个 else其实 没有意义，因为最开头if已经确保了p不是尾结点了，自然after不会是null
            last = b;

        //如果last为空，则说明当前链表只有一个节点p，则将head指向p
        if (last == null)
            head = p;
        else {
            //反之让p的前驱指针指向尾节点，再让尾节点的前驱指针指向p
            p.before = last;
            last.after = p;
        }
        //tail指向p，自此将节点p移动到链表末尾
        tail = p;

        ++modCount;
    }
}
```

Từ mã nguồn có thể thấy, phương thức `afterNodeAccess` thực hiện các bước sau:

1. Nếu `accessOrder` là true và đuôi danh sách liên kết không phải nút hiện tại p, thì cần di chuyển nút hiện tại đến cuối danh sách liên kết.
2. Lấy nút hiện tại p, nút trước b và nút sau a của nó.
3. Đặt con trỏ sau của nút hiện tại p thành null, ngắt kết nối với nút sau.
4. Cố gắng cho nút trước trỏ đến nút sau; nếu nút trước là null, nghĩa là nút hiện tại p là nút đầu danh sách liên kết, nên đặt trực tiếp nút sau a làm nút đầu, sau đó thêm p vào cuối a.
5. Cố gắng cho nút sau a trỏ đến nút trước b.
6. Các thao tác trên giúp nút trước và nút sau liên kết với nhau, tách nút hiện tại p ra độc lập. Bước này thêm nút hiện tại p vào cuối danh sách liên kết; nếu cuối danh sách liên kết là null, nghĩa là danh sách liên kết chỉ có một nút p, nên cho head trỏ đến p.
7. Các thao tác trên đã đưa p thành công đến cuối danh sách liên kết, cuối cùng cho con trỏ tail tức con trỏ trỏ đến cuối danh sách liên kết trỏ đến p.

Có thể kết hợp hình ảnh này để hiểu, thể hiện phần tử có key là 13 được di chuyển đến cuối danh sách liên kết.

![LinkedHashMap di chuyển phần tử 13 đến cuối danh sách liên kết](/images/github/javaguide/java/collection/linkedhashmap-get.png)

Không hiểu cũng không sao, biết chức năng của phương thức này là đủ, sau này có thời gian sẽ tiêu hóa dần.

### newNode — Chèn nút mới vào cuối danh sách liên kết

Phần trên đã giới thiệu `afterNodeAccess` di chuyển **nút đã tồn tại** đến cuối danh sách liên kết như thế nào. Vậy **nút mới chèn vào** được thêm vào danh sách liên kết như thế nào?

Câu trả lời nằm ở chỗ `LinkedHashMap` ghi đè phương thức `newNode` của `HashMap`. Khi `HashMap` chèn cặp key-value mới, nó sẽ gọi `newNode` để tạo đối tượng nút. `LinkedHashMap` trong phương thức được ghi đè không chỉ tạo nút `Entry`, mà còn gọi thêm `linkNodeLast` để liên kết nó vào cuối danh sách liên kết đôi:

```java
// HashMap 的 newNode 是普通实现
Node<K,V> newNode(int hash, K key, V value, Node<K,V> next) {
    return new Node<>(hash, key, value, next);
}

// LinkedHashMap 重写 newNode，额外调用 linkNodeLast
Node<K,V> newNode(int hash, K key, V value, Node<K,V> e) {
    LinkedHashMap.Entry<K,V> p =
        new LinkedHashMap.Entry<>(hash, key, value, e);
    linkNodeLast(p);  // 关键：将新节点链接到链表尾部
    return p;
}
```

Cài đặt phương thức `linkNodeLast` như sau:

```java
// 将节点链接到双向链表尾部
private void linkNodeLast(LinkedHashMap.Entry<K,V> p) {
    LinkedHashMap.Entry<K,V> last = tail;
    tail = p;  // tail 指向新节点
    if (last == null)
        head = p;  // 链表为空，head 也指向新节点
    else {
        p.before = last;  // 新节点的前驱指向原尾节点
        last.after = p;   // 原尾节点的后继指向新节点
    }
}
```

**Đây là cơ chế cốt lõi của LinkedHashMap để thực hiện sắp xếp theo thứ tự chèn**: mỗi lần chèn nút mới, thông qua việc ghi đè `newNode` và gọi `linkNodeLast`, nút mới được thêm vào cuối danh sách liên kết đôi. Như vậy khi duyệt từ nút đầu `head` theo con trỏ `after`, ta có thể lấy tất cả các phần tử theo thứ tự chèn.

Tương tự, `LinkedHashMap` cũng ghi đè phương thức `newTreeNode`, đảm bảo khi nút cây được chèn cũng được liên kết vào cuối danh sách liên kết:

```java
TreeNode<K,V> newTreeNode(int hash, K key, V value, Node<K,V> next) {
    TreeNode<K,V> p = new TreeNode<K,V>(hash, key, value, next);
    linkNodeLast(p);
    return p;
}
```

### Thao tác hậu xử lý sau phương thức remove — afterNodeRemoval

`LinkedHashMap` không ghi đè phương thức `remove`, mà trực tiếp kế thừa phương thức `remove` của `HashMap`. Để đảm bảo sau khi xóa cặp key-value, nút trong danh sách liên kết đôi cũng được xóa đồng bộ, `LinkedHashMap` ghi đè phương thức `afterNodeRemoval` vốn là cài đặt trống của `HashMap`.

```java
final Node<K,V> removeNode(int hash, Object key, Object value,
                               boolean matchValue, boolean movable) {
        //略
            if (node != null && (!matchValue || (v = node.value) == value ||
                                 (value != null && value.equals(v)))) {
                if (node instanceof TreeNode)
                    ((TreeNode<K,V>)node).removeTreeNode(this, tab, movable);
                else if (node == p)
                    tab[index] = node.next;
                else
                    p.next = node.next;
                ++modCount;
                --size;
                //HashMap的removeNode完成元素移除后会调用afterNodeRemoval进行移除后置操作
                afterNodeRemoval(node);
                return node;
            }
        }
        return null;
    }
//空实现
void afterNodeRemoval(Node<K,V> p) { }
```

Chúng ta có thể thấy phương thức `removeNode` bên trong phương thức `remove` kế thừa từ `HashMap` sau khi xóa nút khỏi bucket, gọi `afterNodeRemoval`.

```java
void afterNodeRemoval(Node<K,V> e) { // unlink

    //获取当前节点p、以及e的前驱节点b和后继节点a
        LinkedHashMap.Entry<K,V> p =
            (LinkedHashMap.Entry<K,V>)e, b = p.before, a = p.after;
    //将p的前驱和后继指针都设置为null，使其和前驱、后继节点断开联系
        p.before = p.after = null;

    //如果前驱节点为空，则说明当前节点p是链表首节点，让head指针指向后继节点a即可
        if (b == null)
            head = a;
        else
        //如果前驱节点b不为空，则让b直接指向后继节点a
            b.after = a;

    //如果后继节点为空，则说明当前节点p在链表末端，所以直接让tail指针指向前驱节点a即可
        if (a == null)
            tail = b;
        else
        //反之后继节点的前驱指针直接指向前驱节点
            a.before = b;
    }
```

Từ mã nguồn có thể thấy, thao tác tổng thể của phương thức `afterNodeRemoval` là ngắt kết nối nút hiện tại p với nút trước và nút sau, chờ GC thu hồi. Các bước cụ thể:

1. Lấy nút hiện tại p, nút trước b và nút sau a của p.
2. Ngắt kết nối nút hiện tại p với nút trước và nút sau.
3. Cố gắng cho nút trước b trỏ đến nút sau a; nếu b là null, nghĩa là nút hiện tại p ở đầu danh sách liên kết, trực tiếp cho head trỏ đến nút sau a.
4. Cố gắng cho nút sau a trỏ đến nút trước b; nếu a là null, nghĩa là nút hiện tại p ở cuối danh sách liên kết, nên trực tiếp cho con trỏ tail trỏ đến nút trước b.

Có thể kết hợp hình ảnh này để hiểu, thể hiện phần tử có key là 13 bị xóa, tức là phần tử này đã được xóa khỏi danh sách liên kết.

![LinkedHashMap xóa phần tử 13](/images/github/javaguide/java/collection/linkedhashmap-remove.png)

Không hiểu cũng không sao, biết chức năng của phương thức này là đủ, sau này có thời gian sẽ tiêu hóa dần.

### Thao tác hậu xử lý sau phương thức put — afterNodeInsertion

Tương tự, `LinkedHashMap` cũng không cài đặt phương thức chèn mà trực tiếp kế thừa tất cả phương thức chèn của `HashMap` để người dùng sử dụng. Nhưng để duy trì tính sắp xếp truy cập danh sách liên kết đôi, nó làm hai việc:

1. Ghi đè `afterNodeAccess` (đã đề cập ở trên): nếu key hiện tại được chèn đã tồn tại trong `map`, vì thao tác chèn của `LinkedHashMap` thêm nút mới vào cuối danh sách liên kết, nên đối với key đã tồn tại thì gọi `afterNodeAccess` để đưa nó về cuối danh sách.
2. Ghi đè phương thức `afterNodeInsertion` của `HashMap`, khi `removeEldestEntry` trả về true, sẽ xóa nút đầu danh sách liên kết.

Điều này có thể thấy trong phương thức cốt lõi `putVal` của thao tác chèn `HashMap`.

```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
          //略
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                 //如果当前的key在map中存在，则调用afterNodeAccess
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        if (++size > threshold)
            resize();
         //调用插入后置方法，该方法被LinkedHashMap重写
        afterNodeInsertion(evict);
        return null;
    }
```

Mã nguồn của các bước trên đã được giải thích ở trên, nên ở đây chúng ta tập trung tìm hiểu quy trình làm việc của `afterNodeInsertion`. Giả sử chúng ta đã ghi đè `removeEldestEntry`, khi `size` của danh sách liên kết vượt quá `capacity`, thì trả về true.

```java
/**
 * 判断size超过容量时返回true，告知LinkedHashMap移除最老的缓存项(即链表的第一个元素)
 */
protected boolean removeEldestEntry(Map.Entry < K, V > eldest) {
    return size() > capacity;
}
```

Lấy hình dưới đây làm ví dụ, giả sử người viết vừa chèn một nút mới 19 chưa tồn tại, giả sử `capacity` là 4, nên `removeEldestEntry` trả về true, chúng ta cần xóa nút đầu danh sách liên kết.

![LinkedHashMap chèn phần tử mới 19](/images/github/javaguide/java/collection/linkedhashmap-after-insert-1.png)

Các bước xóa rất đơn giản: kiểm tra nút đầu danh sách liên kết có tồn tại không, nếu có thì ngắt kết nối giữa nút đầu và nút sau, cho con trỏ nút đầu trỏ đến nút tiếp theo, nên con trỏ head trỏ đến 12, nút 10 trở thành đối tượng rỗng không có tham chiếu nào trỏ đến, chờ GC.

![LinkedHashMap chèn phần tử mới 19](/images/github/javaguide/java/collection/linkedhashmap-after-insert-2.png)

```java
void afterNodeInsertion(boolean evict) { // possibly remove eldest
        LinkedHashMap.Entry<K,V> first;
        //如果evict为true且队首元素不为空以及removeEldestEntry返回true，则说明我们需要最老的元素(即在链表首部的元素)移除。
        if (evict && (first = head) != null && removeEldestEntry(first)) {
          //获取链表首部的键值对的key
            K key = first.key;
            //调用removeNode将元素从HashMap的bucket中移除，并和LinkedHashMap的双向链表断开，等待gc回收
            removeNode(hash(key), key, null, false, true);
        }
    }
```

Từ mã nguồn có thể thấy, phương thức `afterNodeInsertion` thực hiện các bước sau:

1. Kiểm tra `eldest` có phải true không, chỉ khi true mới có thể nói rằng có thể cần xóa cặp key-value lâu nhất (tức phần tử ở đầu danh sách liên kết). Có cần xóa cụ thể hay không, còn phải xác định xem danh sách liên kết có rỗng không `((first = head) != null)`, và phương thức `removeEldestEntry` có trả về true không. Chỉ khi cả hai trả về true mới có thể xác định danh sách liên kết hiện tại không rỗng và cần thực hiện xóa.
2. Lấy key của phần tử đầu tiên trong danh sách liên kết.
3. Gọi phương thức `removeNode` của `HashMap`, phương thức này đã đề cập ở trên, nó xóa nút khỏi bucket của `HashMap`, và `LinkedHashMap` cũng ghi đè phương thức `afterNodeRemoval` bên trong `removeNode`, nên bước này thông qua `removeNode` sẽ xóa phần tử khỏi bucket của `HashMap` và ngắt kết nối với danh sách liên kết đôi của `LinkedHashMap`, chờ GC thu hồi.

## So sánh hiệu suất duyệt giữa LinkedHashMap và HashMap

`LinkedHashMap` duy trì một danh sách liên kết đôi để ghi lại thứ tự chèn dữ liệu, do đó khi lặp tạo iterator, nó duyệt theo đường đi của danh sách liên kết đôi. Điều này so với cách duyệt toàn bộ bucket của `HashMap` hiệu quả hơn nhiều.

Điều này có thể được xác nhận từ iterator của hai cái, hãy xem iterator của `HashMap` trước. Có thể thấy khi `HashMap` lặp cặp key-value, nó sử dụng phương thức `nextNode` trả về phần tử tiếp theo mà next trỏ đến, và duyệt bucket từ next để tìm Node không rỗng tiếp theo trong bucket.

```java
 final class EntryIterator extends HashIterator
 implements Iterator < Map.Entry < K, V >> {
     public final Map.Entry < K,
     V > next() {
         return nextNode();
     }
 }

 //获取下一个Node
 final Node < K, V > nextNode() {
     Node < K, V > [] t;
     //获取下一个元素next
     Node < K, V > e = next;
     if (modCount != expectedModCount)
         throw new ConcurrentModificationException();
     if (e == null)
         throw new NoSuchElementException();
     //将next指向bucket中下一个不为空的Node
     if ((next = (current = e).next) == null && (t = table) != null) {
         do {} while (index < t.length && (next = t[index++]) == null);
     }
     return e;
 }
```

Ngược lại, iterator của `LinkedHashMap` trực tiếp sử dụng con trỏ `after` để định vị nhanh đến nút sau của nút hiện tại, đơn giản và hiệu quả hơn nhiều.

```java
 final class LinkedEntryIterator extends LinkedHashIterator
 implements Iterator < Map.Entry < K, V >> {
     public final Map.Entry < K,
     V > next() {
         return nextNode();
     }
 }
 //获取下一个Node
 final LinkedHashMap.Entry < K, V > nextNode() {
     //获取下一个节点next
     LinkedHashMap.Entry < K, V > e = next;
     if (modCount != expectedModCount)
         throw new ConcurrentModificationException();
     if (e == null)
         throw new NoSuchElementException();
     //current 指针指向当前节点
     current = e;
     //next直接当前节点的after指针快速定位到下一个节点
     next = e.after;
     return e;
 }
```

Để xác minh quan điểm trên, người viết đã kiểm tra áp lực hai container này, kiểm tra thời gian chèn 10 triệu và duyệt 10 triệu mục dữ liệu:

```java
int count = 1000_0000;
Map<Integer, Integer> hashMap = new HashMap<>();
Map<Integer, Integer> linkedHashMap = new LinkedHashMap<>();

long start, end;

start = System.currentTimeMillis();
for (int i = 0; i < count; i++) {
    hashMap.put(ThreadLocalRandom.current().nextInt(1, count), ThreadLocalRandom.current().nextInt(0, count));
}
end = System.currentTimeMillis();
System.out.println("map time putVal: " + (end - start));

start = System.currentTimeMillis();
for (int i = 0; i < count; i++) {
    linkedHashMap.put(ThreadLocalRandom.current().nextInt(1, count), ThreadLocalRandom.current().nextInt(0, count));
}
end = System.currentTimeMillis();
System.out.println("linkedHashMap putVal time: " + (end - start));

start = System.currentTimeMillis();
long num = 0;
for (Integer v : hashMap.values()) {
    num = num + v;
}
end = System.currentTimeMillis();
System.out.println("map get time: " + (end - start));

start = System.currentTimeMillis();
for (Integer v : linkedHashMap.values()) {
    num = num + v;
}
end = System.currentTimeMillis();
System.out.println("linkedHashMap get time: " + (end - start));
System.out.println(num);
```

Từ kết quả đầu ra, do `LinkedHashMap` cần duy trì danh sách liên kết đôi, việc chèn phần tử tốn thời gian hơn so với `HashMap`, nhưng với danh sách liên kết đôi xác định rõ quan hệ trước sau, hiệu quả lặp so với cái trước cao hơn nhiều. Tuy nhiên, nhìn chung sự khác biệt không lớn, xét cho cùng lượng dữ liệu rất lớn.

```bash
map time putVal: 5880
linkedHashMap putVal time: 7567
map get time: 143
linkedHashMap get time: 67
63208969074998
```

## Các câu hỏi phỏng vấn thường gặp về LinkedHashMap

### LinkedHashMap là gì?

`LinkedHashMap` là một lớp con của `HashMap` trong framework collection Java, nó kế thừa tất cả thuộc tính và phương thức của `HashMap`, và trên nền `HashMap` ghi đè các phương thức `afterNodeRemoval`, `afterNodeInsertion`, `afterNodeAccess`. Điều này giúp nó có đặc tính chèn có thứ tự và truy cập có thứ tự.

### LinkedHashMap lặp các phần tử theo thứ tự chèn như thế nào?

`LinkedHashMap` lặp các phần tử theo thứ tự chèn là hành vi mặc định của nó. `LinkedHashMap` nội bộ duy trì một danh sách liên kết đôi để ghi lại thứ tự chèn của các phần tử. Do đó, khi dùng iterator để lặp các phần tử, thứ tự của chúng giống với thứ tự chèn ban đầu.

### LinkedHashMap lặp các phần tử theo thứ tự truy cập như thế nào?

`LinkedHashMap` có thể chỉ định lặp theo thứ tự truy cập thông qua tham số `accessOrder` trong hàm khởi tạo. Khi `accessOrder` là true, mỗi lần truy cập một phần tử, phần tử đó sẽ được di chuyển đến cuối danh sách liên kết, do đó lần sau truy cập phần tử đó, nó sẽ là phần tử cuối cùng trong danh sách, thực hiện lặp theo thứ tự truy cập.

### LinkedHashMap cài đặt bộ nhớ cache LRU như thế nào?

Đặt `accessOrder` thành true và ghi đè phương thức `removeEldestEntry` trả về true khi kích thước danh sách liên kết vượt quá dung lượng, mỗi lần truy cập một phần tử, phần tử đó sẽ được di chuyển đến cuối danh sách. Một khi thao tác chèn khiến `removeEldestEntry` trả về true, coi như cache đầy, `LinkedHashMap` sẽ xóa phần tử đầu danh sách, từ đó chúng ta có thể cài đặt một bộ nhớ cache LRU.

### LinkedHashMap và HashMap có gì khác nhau?

`LinkedHashMap` và `HashMap` đều là các lớp cài đặt giao diện Map trong framework collection Java. Sự khác biệt lớn nhất của chúng nằm ở thứ tự lặp các phần tử. `HashMap` lặp các phần tử theo thứ tự không xác định, trong khi `LinkedHashMap` cung cấp chức năng lặp theo thứ tự chèn hoặc thứ tự truy cập. Ngoài ra, `LinkedHashMap` nội bộ duy trì một danh sách liên kết đôi để ghi lại thứ tự chèn hoặc truy cập của các phần tử, còn `HashMap` thì không có danh sách này. Do đó, hiệu suất chèn của `LinkedHashMap` có thể thấp hơn `HashMap` một chút, nhưng nó cung cấp thêm nhiều chức năng và hiệu quả lặp so với `HashMap` hiệu quả hơn.

## Tài liệu tham khảo

- LinkedHashMap 源码详细分析（JDK1.8）:<https://www.imooc.com/article/22931>
- HashMap 与 LinkedHashMap:<https://www.cnblogs.com/Spground/p/8536148.html>
- 源于 LinkedHashMap 源码: <https://leetcode.cn/problems/lru-cache/solution/yuan-yu-linkedhashmapyuan-ma-by-jeromememory/>
<!-- @include: @article-footer.snippet.md -->
