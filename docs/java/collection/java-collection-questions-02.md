---
title: Tổng hợp câu hỏi phỏng vấn về Java Collection (Phần 2)
description: Câu hỏi phỏng vấn tần suất cao về Java Collection: Phân tích sâu nguyên lý bên dưới của HashMap, chuyển đổi cây đỏ-đen, giải quyết xung đột hash, cơ chế an toàn luồng của ConcurrentHashMap, sự khác biệt với Hashtable và các kiến thức cốt lõi.
category: Java
tag:
  - Java Collection
head:
  - - meta
    - name: keywords
      content: HashMap,ConcurrentHashMap,Hashtable,红黑树,哈希冲突,线程安全,集合面试题
---

<!-- @include: @article-header.snippet.md -->

## Map (Quan trọng)

### ⭐️ Sự khác nhau giữa HashMap và Hashtable

- **An toàn luồng:** `HashMap` không an toàn luồng, `Hashtable` an toàn luồng vì các phương thức bên trong `Hashtable` đều được bổ sung `synchronized`. (Nếu bạn cần đảm bảo an toàn luồng thì hãy sử dụng `ConcurrentHashMap`!);
- **Hiệu suất:** Vì vấn đề an toàn luồng, `HashMap` có hiệu suất cao hơn một chút so với `Hashtable`. Ngoài ra, `Hashtable` về cơ bản đã bị loại bỏ, không nên sử dụng trong code;
- **Hỗ trợ Null key và Null value:** `HashMap` có thể lưu trữ key và value là null, nhưng null làm key chỉ có thể có một, null làm value có thể có nhiều; Hashtable không cho phép null key và null value, nếu không sẽ ném ra `NullPointerException`.
- **Kích thước khởi tạo và mỗi lần mở rộng khác nhau:** ① Khi tạo mà không chỉ định giá trị dung lượng ban đầu, `Hashtable` có kích thước mặc định là 11, mỗi lần mở rộng dung lượng trở thành 2n+1. `HashMap` có kích thước khởi tạo mặc định là 16. Mỗi lần mở rộng dung lượng gấp đôi. ② Khi tạo với giá trị dung lượng ban đầu, `Hashtable` sẽ sử dụng trực tiếp kích thước bạn cung cấp, còn `HashMap` sẽ mở rộng nó thành lũy thừa của 2 (phương thức `tableSizeFor()` trong `HashMap` đảm bảo điều này, mã nguồn được cung cấp bên dưới). Tức là `HashMap` luôn sử dụng lũy thừa của 2 làm kích thước bảng hash, lý do sẽ được giới thiệu sau.
- **Cấu trúc dữ liệu bên dưới:** Kể từ JDK1.8, `HashMap` có thay đổi lớn khi giải quyết xung đột hash, khi độ dài danh sách liên kết lớn hơn ngưỡng (mặc định là 8), danh sách liên kết được chuyển đổi thành cây đỏ-đen (trước khi chuyển đổi sang cây đỏ-đen sẽ kiểm tra, nếu độ dài mảng hiện tại nhỏ hơn 64, thì sẽ chọn mở rộng mảng trước thay vì chuyển đổi sang cây đỏ-đen), để giảm thời gian tìm kiếm. `Hashtable` không có cơ chế này.
- **Cài đặt hàm hash:** `HashMap` thực hiện xử lý nhiễu pha trộn bit cao và bit thấp của giá trị hash để giảm xung đột, còn `Hashtable` trực tiếp sử dụng giá trị `hashCode()` của key.

**Constructor của `HashMap` với dung lượng ban đầu:**

```java
    public HashMap(int initialCapacity, float loadFactor) {
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal initial capacity: " +
                                               initialCapacity);
        if (initialCapacity > MAXIMUM_CAPACITY)
            initialCapacity = MAXIMUM_CAPACITY;
        if (loadFactor <= 0 || Float.isNaN(loadFactor))
            throw new IllegalArgumentException("Illegal load factor: " +
                                               loadFactor);
        this.loadFactor = loadFactor;
        this.threshold = tableSizeFor(initialCapacity);
    }
     public HashMap(int initialCapacity) {
        this(initialCapacity, DEFAULT_LOAD_FACTOR);
    }
```

Phương thức dưới đây đảm bảo rằng `HashMap` luôn sử dụng lũy thừa của 2 làm kích thước bảng hash.

```java
/**
 * Returns a power of two size for the given target capacity.
 */
static final int tableSizeFor(int cap) {
    int n = cap - 1;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
}
```

### Sự khác nhau giữa HashMap và HashSet

Nếu bạn đã đọc mã nguồn của `HashSet` thì bạn nên biết: `HashSet` về cơ bản được triển khai dựa trên `HashMap`. (Mã nguồn của `HashSet` rất ít, vì ngoài `clone()`, `writeObject()`, `readObject()` là các phương thức `HashSet` bắt buộc phải tự triển khai, các phương thức khác đều gọi trực tiếp phương thức trong `HashMap`.

|                `HashMap`                 |                                                                            `HashSet`                                                                            |
| :--------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|        Triển khai interface `Map`        |                                                                   Triển khai interface `Set`                                                                    |
|          Lưu trữ cặp key-value           |                                                                      Chỉ lưu trữ đối tượng                                                                      |
|   Gọi `put()` để thêm phần tử vào map    |                                                        Gọi phương thức `add()` để thêm phần tử vào `Set`                                                        |
| `HashMap` sử dụng Key để tính `hashcode` | `HashSet` sử dụng đối tượng thành viên để tính giá trị `hashcode`, với hai đối tượng `hashcode` có thể giống nhau, nên dùng `equals()` để kiểm tra sự bằng nhau |

### ⭐️ Sự khác nhau giữa HashMap và TreeMap

`TreeMap` và `HashMap` đều kế thừa từ `AbstractMap`, nhưng cần lưu ý rằng `TreeMap` còn triển khai interface `NavigableMap` và `SortedMap`.

![Sơ đồ kế thừa TreeMap](https://oss.javaguide.cn/github/javaguide/java/collection/treemap_hierarchy.png)

Việc triển khai interface `NavigableMap` cho phép `TreeMap` có khả năng tìm kiếm các phần tử trong collection.

Interface `NavigableMap` cung cấp nhiều phương thức để khám phá và thao tác với cặp key-value:

1. **Tìm kiếm định hướng**: Các phương thức như `ceilingEntry()`, `floorEntry()`, `higherEntry()` và `lowerEntry()` có thể dùng để tìm cặp key-value gần nhất lớn hơn hoặc bằng, nhỏ hơn hoặc bằng, lớn hơn nghiêm ngặt, nhỏ hơn nghiêm ngặt so với key đã cho.
2. **Thao tác tập con**: Các phương thức `subMap()`, `headMap()` và `tailMap()` có thể tạo ra view tập con của collection gốc một cách hiệu quả mà không cần sao chép toàn bộ collection.
3. **View nghịch đảo**: Phương thức `descendingMap()` trả về một view `NavigableMap` nghịch đảo, cho phép duyệt toàn bộ `TreeMap` theo chiều ngược.
4. **Thao tác biên**: Các phương thức như `firstEntry()`, `lastEntry()`, `pollFirstEntry()` và `pollLastEntry()` có thể thuận tiện để truy cập và xóa phần tử.

Tất cả các phương thức này được triển khai dựa trên thuộc tính của cấu trúc dữ liệu cây đỏ-đen, cây đỏ-đen duy trì trạng thái cân bằng, đảm bảo độ phức tạp thời gian của thao tác tìm kiếm là O(log n), điều này làm cho `TreeMap` trở thành công cụ mạnh mẽ để xử lý các vấn đề tìm kiếm trong collection có thứ tự.

Việc triển khai interface `SortedMap` cho phép `TreeMap` có khả năng sắp xếp các phần tử trong collection theo key. Mặc định sắp xếp theo thứ tự tăng dần của key, nhưng chúng ta cũng có thể chỉ định comparator sắp xếp. Mã ví dụ như sau:

```java
/**
 * @author shuang.kou
 * @createTime 2020年06月15日 17:02:00
 */
public class Person {
    private Integer age;

    public Person(Integer age) {
        this.age = age;
    }

    public Integer getAge() {
        return age;
    }


    public static void main(String[] args) {
        TreeMap<Person, String> treeMap = new TreeMap<>(new Comparator<Person>() {
            @Override
            public int compare(Person person1, Person person2) {
                int num = person1.getAge() - person2.getAge();
                return Integer.compare(num, 0);
            }
        });
        treeMap.put(new Person(3), "person1");
        treeMap.put(new Person(18), "person2");
        treeMap.put(new Person(35), "person3");
        treeMap.put(new Person(16), "person4");
        treeMap.entrySet().stream().forEach(personStringEntry -> {
            System.out.println(personStringEntry.getValue());
        });
    }
}
```

Đầu ra:

```plain
person1
person4
person2
person3
```

Có thể thấy, các phần tử trong `TreeMap` đã được sắp xếp theo thứ tự tăng dần của trường age của `Person`.

Ở trên, chúng ta triển khai bằng cách truyền vào lớp nội tuyến ẩn danh, bạn có thể thay thế code bằng cách triển khai biểu thức Lambda:

```java
TreeMap<Person, String> treeMap = new TreeMap<>((person1, person2) -> {
  int num = person1.getAge() - person2.getAge();
  return Integer.compare(num, 0);
});
```

**Tóm lại, so với `HashMap`, `TreeMap` chủ yếu có thêm khả năng sắp xếp các phần tử trong collection theo key và khả năng tìm kiếm các phần tử trong collection.**

### HashSet kiểm tra trùng lặp như thế nào?

Nội dung dưới đây trích từ cuốn sách khai sáng Java của tôi "Head first java" phiên bản thứ hai:

> Khi bạn thêm một đối tượng vào `HashSet`, `HashSet` sẽ tính toán giá trị `hashcode` của đối tượng để xác định vị trí thêm, đồng thời so sánh với giá trị `hashcode` của các đối tượng đã thêm khác, nếu không có `hashcode` trùng khớp, `HashSet` cho rằng đối tượng chưa xuất hiện trùng lặp. Nhưng nếu tìm thấy đối tượng có cùng giá trị `hashcode`, lúc này sẽ gọi phương thức `equals()` để kiểm tra xem các đối tượng có cùng hashcode có thực sự giống nhau không. Nếu cả hai giống nhau, `HashSet` sẽ không cho phép thao tác thêm thành công.

Trong JDK1.8, phương thức `add()` của `HashSet` chỉ đơn giản gọi phương thức `put()` của `HashMap`, và kiểm tra giá trị trả về để xác nhận xem có phần tử trùng lặp hay không. Xem trực tiếp mã nguồn trong `HashSet`:

```java
// Returns: true if this set did not already contain the specified element
// 返回值：当 set 中没有包含 add 的元素时返回真
public boolean add(E e) {
        return map.put(e, PRESENT)==null;
}
```

Trong phương thức `putVal()` của `HashMap` cũng có thể thấy mô tả sau:

```java
// Returns : previous value, or null if none
// 返回值：如果插入位置没有元素返回null，否则返回上一个元素
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
...
}
```

Tức là, trong JDK1.8, dù `HashSet` đã chứa phần tử đó hay chưa, `HashSet` đều sẽ chèn trực tiếp, chỉ là sẽ cho biết qua giá trị trả về của phương thức `add()` rằng trước khi chèn có phần tử giống nhau hay không.

### ⭐️ Triển khai bên dưới của HashMap

#### Trước JDK1.8

Trước JDK1.8, `HashMap` bên dưới là sự kết hợp của **mảng và danh sách liên kết**, tức là **danh sách liên kết phân tán**. HashMap lấy `hashcode` của key qua hàm nhiễu để nhận giá trị hash, sau đó dùng `(n - 1) & hash` để xác định vị trí lưu phần tử hiện tại (n ở đây là độ dài mảng), nếu vị trí hiện tại có phần tử thì kiểm tra hash value và key của phần tử đó với phần tử cần lưu có giống nhau không, nếu giống thì ghi đè trực tiếp, nếu không giống thì giải quyết xung đột bằng phương pháp kéo chuỗi.

Hàm nhiễu (phương thức `hash`) trong `HashMap` được dùng để tối ưu hóa phân phối giá trị hash. Bằng cách xử lý thêm trên `hashCode()` gốc, hàm nhiễu có thể giảm va chạm do triển khai `hashCode()` kém, qua đó cải thiện tính đồng đều của phân phối dữ liệu.

**Mã nguồn phương thức hash của HashMap trong JDK 1.8:**

Phương thức hash của JDK 1.8 đơn giản hơn so với JDK 1.7, nhưng nguyên lý không thay đổi.

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

So với phương thức hash của JDK1.8, phương thức hash của JDK 1.7 có hiệu suất kém hơn một chút vì xáo trộn 4 lần.

**"Phương pháp kéo chuỗi"** là: Kết hợp danh sách liên kết và mảng. Tức là tạo một mảng danh sách liên kết, mỗi ô trong mảng là một danh sách liên kết. Nếu gặp xung đột hash, chỉ cần thêm giá trị xung đột vào danh sách liên kết.

![Cấu trúc nội bộ trước jdk1.8-HashMap](https://oss.javaguide.cn/github/javaguide/java/collection/jdk1.7_hashmap.png)

#### Sau JDK1.8

So với các phiên bản trước, JDK1.8 có thay đổi lớn khi giải quyết xung đột hash, khi độ dài danh sách liên kết lớn hơn ngưỡng (mặc định là 8) (trước khi chuyển đổi danh sách liên kết sang cây đỏ-đen sẽ kiểm tra, nếu độ dài mảng hiện tại nhỏ hơn 64, thì sẽ chọn mở rộng mảng trước thay vì chuyển đổi sang cây đỏ-đen), danh sách liên kết được chuyển đổi sang cây đỏ-đen.

Mục đích của điều này là để giảm thời gian tìm kiếm: hiệu quả truy vấn của danh sách liên kết là O(n) (n là độ dài danh sách liên kết), cây đỏ-đen là loại cây tìm kiếm nhị phân tự cân bằng với hiệu quả truy vấn là O(log n). Khi danh sách liên kết ngắn, sự khác biệt hiệu suất giữa O(n) và O(log n) không rõ ràng. Nhưng khi danh sách liên kết dài hơn, hiệu suất truy vấn sẽ giảm đáng kể.

![Cấu trúc nội bộ sau jdk1.8-HashMap](https://oss.javaguide.cn/github/javaguide/java/collection/jdk1.8_hashmap.png)

**Tại sao ưu tiên mở rộng thay vì chuyển trực tiếp sang cây đỏ-đen?**

Mở rộng mảng có thể giảm xác suất xảy ra xung đột hash (tức là phân tán lại các phần tử sang mảng mới lớn hơn), điều này trong hầu hết các trường hợp hiệu quả hơn so với chuyển đổi trực tiếp sang cây đỏ-đen.

Cây đỏ-đen cần duy trì tự cân bằng, chi phí bảo trì cao. Và việc giới thiệu cây đỏ-đen quá sớm sẽ làm tăng độ phức tạp.

**Tại sao chọn ngưỡng 8 và 64?**

1. Phân phối Poisson cho thấy xác suất độ dài danh sách liên kết đạt 8 là rất thấp (nhỏ hơn một phần mười triệu). Trong đại đa số trường hợp, độ dài danh sách liên kết sẽ không vượt quá 8. Ngưỡng được đặt là 8, có thể đảm bảo cân bằng giữa hiệu suất và hiệu quả không gian.
2. Ngưỡng độ dài mảng 64 cũng là giá trị kinh nghiệm được xác thực qua thực tế. Trong mảng nhỏ, chi phí mở rộng thấp, ưu tiên mở rộng có thể tránh giới thiệu cây đỏ-đen quá sớm. Khi kích thước mảng đạt 64, xác suất xung đột cao hơn, lúc này lợi thế hiệu suất của cây đỏ-đen bắt đầu thể hiện.

> TreeMap, TreeSet và HashMap kể từ JDK1.8 đều sử dụng cây đỏ-đen bên dưới. Cây đỏ-đen được tạo ra để giải quyết khuyết điểm của cây tìm kiếm nhị phân, vì cây tìm kiếm nhị phân trong một số trường hợp sẽ thoái hóa thành cấu trúc tuyến tính.

Hãy cùng phân tích quá trình chuyển đổi từ danh sách liên kết sang cây đỏ-đen của `HashMap` kết hợp với mã nguồn.

**1. Logic kiểm tra chuyển đổi danh sách liên kết sang cây đỏ-đen trong phương thức `putVal`.**

Khi độ dài danh sách liên kết lớn hơn 8, sẽ thực thi logic `treeifyBin` (chuyển đổi cây đỏ-đen).

```java
// 遍历链表
for (int binCount = 0; ; ++binCount) {
    // 遍历到链表最后一个节点
    if ((e = p.next) == null) {
        p.next = newNode(hash, key, value, null);
        // 如果链表元素个数大于TREEIFY_THRESHOLD（8）
        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
            // 红黑树转换（并不会直接转换成红黑树）
            treeifyBin(tab, hash);
        break;
    }
    if (e.hash == hash &&
        ((k = e.key) == key || (key != null && key.equals(k))))
        break;
    p = e;
}
```

**2. Phương thức `treeifyBin` kiểm tra xem có thực sự chuyển đổi sang cây đỏ-đen không.**

```java
final void treeifyBin(Node<K,V>[] tab, int hash) {
    int n, index; Node<K,V> e;
    // 判断当前数组的长度是否小于 64
    if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
        // 如果当前数组的长度小于 64，那么会选择先进行数组扩容
        resize();
    else if ((e = tab[index = (n - 1) & hash]) != null) {
        // 否则才将列表转换为红黑树

        TreeNode<K,V> hd = null, tl = null;
        do {
            TreeNode<K,V> p = replacementTreeNode(e, null);
            if (tl == null)
                hd = p;
            else {
                p.prev = tl;
                tl.next = p;
            }
            tl = p;
        } while ((e = e.next) != null);
        if ((tab[index] = hd) != null)
            hd.treeify(tab);
    }
}
```

Trước khi chuyển đổi danh sách liên kết sang cây đỏ-đen sẽ kiểm tra, nếu độ dài mảng hiện tại nhỏ hơn 64, thì sẽ chọn mở rộng mảng trước thay vì chuyển đổi sang cây đỏ-đen.

### ⭐️ Tại sao độ dài của HashMap là lũy thừa của 2

Để `HashMap` lưu trữ và truy xuất hiệu quả và giảm va chạm, chúng ta cần đảm bảo dữ liệu được phân phối đồng đều. Giá trị hash trong Java thường được biểu diễn bằng `int`, có phạm vi từ `-2147483648 đến 2147483647`, tổng cộng khoảng 40 tỷ không gian ánh xạ, chỉ cần hàm hash ánh xạ tương đối đồng đều, thông thường ứng dụng sẽ rất khó xảy ra va chạm. Nhưng vấn đề là mảng có độ dài 40 tỷ không thể lưu vào bộ nhớ. Vì vậy, giá trị hash không thể dùng trực tiếp. Trước khi dùng phải thực hiện phép tính modulo với độ dài mảng, phần dư mới là vị trí lưu, tức là chỉ số mảng tương ứng.

**Thuật toán này nên được thiết kế như thế nào?**

Đầu tiên chúng ta có thể nghĩ đến phép tính % lấy dư. Nhưng điểm quan trọng ở đây là: "**Trong phép tính lấy dư (%), nếu số chia là lũy thừa của 2 thì tương đương với phép tính AND (&) với số chia trừ 1**（tức là `hash%length==hash&(length-1)` với điều kiện là length là lũy thừa của 2）." Và **phép tính bit AND & so với % có thể cải thiện hiệu suất tính toán**.

Ngoài lý do phép tính bit hiệu quả hơn phép lấy dư như đã nói ở trên, tôi nghĩ lý do quan trọng hơn là: **Độ dài là lũy thừa của 2 có thể làm cho `HashMap` mở rộng đồng đều hơn**. Ví dụ:

- length = 8, length - 1 = 7 biểu diễn nhị phân `0111`
- length = 16, length - 1 = 15 biểu diễn nhị phân `1111`

Lúc này các phần tử trong `HashMap` tính vị trí mảng mới `hash&(length-1)`, phụ thuộc vào bit nhị phân thứ 4 của hash (đếm từ phải), sẽ có hai trường hợp:

1. Bit nhị phân thứ 4 là 0, vị trí mảng không thay đổi, tức là phần tử hiện tại có vị trí giống nhau trong mảng mới và mảng cũ.
2. Bit nhị phân thứ 4 là 1, vị trí mảng nằm ở phần mở rộng của mảng mới.

Dưới đây là một ví dụ:

```plain
假设有一个元素的哈希值为 10101100

旧数组元素位置计算：
hash        = 10101100
length - 1  = 00000111
& -----------------
index       = 00000100  (4)

新数组元素位置计算：
hash        = 10101100
length - 1  = 00001111
& -----------------
index       = 00001100  (12)

看第四位（从右数）：
1.高位为 0：位置不变。
2.高位为 1：移动到新位置（原索引位置+原容量）。
```

⚠️ Lưu ý: Ví dụ ở đây nhìn vào bit nhị phân thứ 4, chính xác hơn là nhìn vào bit cao (đếm từ phải), ví dụ `length = 32` thì `length - 1 = 31`, nhị phân là `11111`, ở đây nhìn vào bit nhị phân thứ 5.

Tức là sau khi mở rộng, trong điều kiện giá trị hash của các phần tử trong mảng cũ phân phối đồng đều (sự đồng đều của giá trị hash phụ thuộc vào phương thức `hashcode()` và hàm nhiễu đã đề cập trước đó), các phần tử trong mảng mới cũng sẽ được phân bổ đồng đều, trường hợp tốt nhất là một nửa ở nửa trước của mảng mới, một nửa ở nửa sau của mảng mới.

Điều này cũng làm cho cơ chế mở rộng trở nên đơn giản và hiệu quả hơn, sau khi mở rộng chỉ cần kiểm tra sự thay đổi của bit cao của giá trị hash để quyết định vị trí mới của phần tử, hoặc vị trí không thay đổi (bit cao là 0), hoặc di chuyển đến vị trí mới (bit cao là 1, vị trí chỉ số gốc + dung lượng gốc).

Cuối cùng, tổng kết ngắn gọn lý do độ dài của `HashMap` là lũy thừa của 2:

1. Hiệu quả phép tính bit cao hơn: Phép tính bit AND (&) hiệu quả hơn phép lấy dư (%). Khi độ dài là lũy thừa của 2, `hash % length` tương đương với `hash & (length - 1)`.
2. Có thể đảm bảo phân phối giá trị hash đồng đều hơn: Sau khi mở rộng, trong điều kiện giá trị hash của các phần tử trong mảng cũ phân phối đồng đều, các phần tử trong mảng mới cũng sẽ được phân bổ đồng đều, trường hợp tốt nhất là một nửa ở nửa trước, một nửa ở nửa sau.
3. Cơ chế mở rộng trở nên đơn giản và hiệu quả hơn: Sau khi mở rộng chỉ cần kiểm tra sự thay đổi của bit cao của giá trị hash để quyết định vị trí mới của phần tử, hoặc vị trí không thay đổi (bit cao là 0), hoặc di chuyển đến vị trí mới (bit cao là 1, vị trí chỉ số gốc + dung lượng gốc).

### ⭐️ Vấn đề vòng lặp vô tận khi HashMap hoạt động đa luồng

Trong phiên bản JDK1.7 trở về trước, thao tác mở rộng của `HashMap` trong môi trường đa luồng có thể gây ra vấn đề vòng lặp vô tận. Đây là do khi có nhiều phần tử trong một bucket cần mở rộng, nhiều luồng đồng thời thao tác trên danh sách liên kết, phương pháp chèn đầu có thể dẫn đến các node trong danh sách liên kết trỏ sai vị trí, từ đó tạo ra danh sách liên kết vòng, khiến thao tác tìm kiếm phần tử rơi vào vòng lặp vô tận.

Để giải quyết vấn đề này, HashMap phiên bản JDK1.8 sử dụng phương pháp chèn cuối thay vì chèn đầu để tránh đảo ngược danh sách liên kết, đảm bảo node được chèn luôn đặt ở cuối danh sách liên kết, tránh cấu trúc vòng trong danh sách liên kết. Nhưng vẫn không khuyến nghị dùng `HashMap` trong môi trường đa luồng, vì dùng `HashMap` đa luồng vẫn tồn tại vấn đề ghi đè dữ liệu. Trong môi trường đồng thời, khuyến nghị sử dụng `ConcurrentHashMap`.

Trong phỏng vấn thông thường giới thiệu như vậy là đủ, không cần nhớ các chi tiết, cá nhân tôi cũng thấy không cần thiết. Nếu muốn tìm hiểu chi tiết về vấn đề vòng lặp vô tận do mở rộng HashMap, có thể xem bài viết này của chú Háo Tử: [Java HashMap 的死循环](https://coolshell.cn/articles/9606.html).

### ⭐️ Tại sao HashMap không an toàn luồng?

`HashMap` không an toàn luồng. Trong môi trường đa luồng khi thực hiện thao tác ghi đồng thời trên `HashMap`, có thể dẫn đến hai vấn đề chính:

1. **Mất dữ liệu**: Thao tác `put` đồng thời có thể dẫn đến ghi của một luồng bị luồng khác ghi đè.
2. **Vòng lặp vô tận**: Trong JDK 7 và các phiên bản trước, khi mở rộng đồng thời, do phương pháp chèn đầu có thể khiến danh sách liên kết tạo vòng, từ đó khi thao tác `get` gây ra vòng lặp vô tận, CPU tăng đột biến lên 100%.

Vấn đề mất dữ liệu tồn tại cả trong JDK1.7 và JDK 1.8, đây lấy JDK 1.8 làm ví dụ.

Sau JDK 1.8, trong `HashMap`, nhiều cặp key-value có thể được phân bổ vào cùng một bucket, và lưu trữ dưới dạng danh sách liên kết hoặc cây đỏ-đen. Nhiều luồng thực hiện thao tác `put` trên `HashMap` sẽ dẫn đến không an toàn luồng, cụ thể là có nguy cơ ghi đè dữ liệu.

Ví dụ:

- Hai luồng 1, 2 đồng thời thực hiện put, và xảy ra xung đột hash (chỉ số chèn tính bởi hàm hash giống nhau).
- Các luồng khác nhau có thể được cơ hội thực thi CPU ở các time slice khác nhau, luồng hiện tại 1 sau khi thực hiện xong kiểm tra xung đột hash, do hết time slice bị treo. Luồng 2 hoàn thành thao tác chèn trước.
- Sau đó, luồng 1 được time slice, vì trước đó đã thực hiện kiểm tra va chạm hash, nên lúc này sẽ trực tiếp chèn, điều này khiến dữ liệu do luồng 2 chèn bị luồng 1 ghi đè.

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
    // ...
    // 判断是否出现 hash 碰撞
    // (n - 1) & hash 确定元素存放在哪个桶中，桶为空，新生成结点放入桶中(此时，这个结点是放在数组中)
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    // 桶中已经存在元素（处理hash冲突）
    else {
    // ...
}
```

Còn một trường hợp là hai luồng đồng thời `put` dẫn đến giá trị `size` không chính xác, từ đó gây ra vấn đề ghi đè dữ liệu:

1. Luồng 1 thực thi kiểm tra `if(++size > threshold)`, giả sử lấy được giá trị `size` là 10, do hết time slice bị treo.
2. Luồng 2 cũng thực thi kiểm tra `if(++size > threshold)`, lấy được giá trị `size` cũng là 10, và chèn phần tử vào bucket đó, cập nhật giá trị `size` thành 11.
3. Sau đó, luồng 1 được time slice, nó cũng đặt phần tử vào bucket, và cập nhật giá trị size thành 11.
4. Luồng 1, 2 đều thực hiện một lần thao tác `put`, nhưng giá trị `size` chỉ tăng 1, dẫn đến thực tế chỉ có một phần tử được thêm vào `HashMap`.

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
    // ...
    // 实际大小大于阈值则扩容
    if (++size > threshold)
        resize();
    // 插入后回调
    afterNodeInsertion(evict);
    return null;
}
```

### Các cách duyệt HashMap phổ biến?

[7 cách duyệt HashMap và phân tích hiệu suất!](https://mp.weixin.qq.com/s/zQBN3UvJDhRTKP6SzcZFKw)

**🐛 Hiệu chỉnh (xem: [issue#1411](https://github.com/Snailclimb/JavaGuide/issues/1411))**:

Bài viết này có phân tích sai về hiệu suất duyệt parallelStream, kết luận trước: **Khi có blocking, parallelStream hiệu suất cao nhất, khi không có blocking, parallelStream hiệu suất thấp nhất**.

Khi duyệt không có blocking, hiệu suất của parallelStream thấp nhất:

```plain
Benchmark               Mode  Cnt     Score      Error  Units
Test.entrySet           avgt    5   288.651 ±   10.536  ns/op
Test.keySet             avgt    5   584.594 ±   21.431  ns/op
Test.lambda             avgt    5   221.791 ±   10.198  ns/op
Test.parallelStream     avgt    5  6919.163 ± 1116.139  ns/op
```

Sau khi thêm code blocking `Thread.sleep(10)`, hiệu suất của parallelStream mới là cao nhất:

```plain
Benchmark               Mode  Cnt           Score          Error  Units
Test.entrySet           avgt    5  1554828440.000 ± 23657748.653  ns/op
Test.keySet             avgt    5  1550612500.000 ±  6474562.858  ns/op
Test.lambda             avgt    5  1551065180.000 ± 19164407.426  ns/op
Test.parallelStream     avgt    5   186345456.667 ±  3210435.590  ns/op
```

### ⭐️ Sự khác nhau giữa ConcurrentHashMap và Hashtable

Sự khác biệt giữa `ConcurrentHashMap` và `Hashtable` chủ yếu thể hiện ở cách triển khai an toàn luồng khác nhau.

- **Cấu trúc dữ liệu bên dưới:** `ConcurrentHashMap` trong JDK1.7 sử dụng **mảng phân đoạn + danh sách liên kết**, trong JDK1.8 sử dụng cấu trúc dữ liệu giống `HashMap`, mảng + danh sách liên kết / cây đỏ-đen nhị phân. `Hashtable` và `HashMap` trước JDK1.8 có cấu trúc dữ liệu bên dưới tương tự đều sử dụng dạng **mảng + danh sách liên kết**, mảng là thân chính của HashMap, danh sách liên kết chủ yếu để giải quyết xung đột hash;
- **Cách triển khai an toàn luồng (quan trọng):**
  - Trong JDK1.7, `ConcurrentHashMap` phân đoạn toàn bộ mảng bucket (`Segment`, khóa phân đoạn), mỗi khóa chỉ khóa một phần dữ liệu trong container (có sơ đồ minh họa bên dưới), nhiều luồng truy cập dữ liệu của các phân đoạn khác nhau trong container sẽ không có cạnh tranh khóa, cải thiện tốc độ truy cập đồng thời.
  - Đến JDK1.8, `ConcurrentHashMap` đã loại bỏ khái niệm `Segment`, thay vào đó trực tiếp sử dụng cấu trúc dữ liệu `Node` mảng + danh sách liên kết + cây đỏ-đen để triển khai, kiểm soát đồng thời sử dụng `synchronized` và CAS để thao tác. (Kể từ JDK1.6, khóa `synchronized` đã được tối ưu nhiều) Toàn bộ trông giống như `HashMap` được tối ưu hóa và an toàn luồng, mặc dù trong JDK1.8 vẫn có thể thấy cấu trúc dữ liệu `Segment`, nhưng đã đơn giản hóa thuộc tính, chỉ để tương thích phiên bản cũ;
  - **`Hashtable` (cùng một khóa)**: Sử dụng `synchronized` để đảm bảo an toàn luồng, hiệu suất rất thấp. Khi một luồng truy cập phương thức đồng bộ, các luồng khác cũng truy cập phương thức đồng bộ, có thể vào trạng thái chờ hoặc polling, ví dụ như sử dụng put để thêm phần tử, luồng khác không thể dùng put thêm phần tử, cũng không thể dùng get, cạnh tranh ngày càng gay gắt và hiệu suất ngày càng thấp.

Dưới đây, hãy xem biểu đồ so sánh cấu trúc dữ liệu bên dưới của cả hai.

**Hashtable**:

![Cấu trúc nội bộ Hashtable](https://oss.javaguide.cn/github/javaguide/java/collection/jdk1.7_hashmap.png)

<p style="text-align:right;font-size:13px;color:gray">https://www.cnblogs.com/chengxiao/p/6842045.html></p>

**ConcurrentHashMap trong JDK1.7**:

![Cấu trúc lưu trữ Java7 ConcurrentHashMap](https://oss.javaguide.cn/github/javaguide/java/collection/java7_concurrenthashmap.png)

`ConcurrentHashMap` được tạo thành từ cấu trúc mảng `Segment` và cấu trúc mảng `HashEntry`.

Mỗi phần tử trong mảng `Segment` chứa một mảng `HashEntry`, mỗi mảng `HashEntry` thuộc cấu trúc danh sách liên kết.

**ConcurrentHashMap trong JDK1.8**:

![Cấu trúc lưu trữ Java8 ConcurrentHashMap](https://oss.javaguide.cn/github/javaguide/java/collection/java8_concurrenthashmap.png)

`ConcurrentHashMap` trong JDK1.8 không còn là **mảng Segment + mảng HashEntry + danh sách liên kết**, mà là **mảng Node + danh sách liên kết / cây đỏ-đen**. Tuy nhiên, Node chỉ có thể dùng cho trường hợp danh sách liên kết, trường hợp cây đỏ-đen cần sử dụng **`TreeNode`**. Khi danh sách liên kết xung đột đạt một độ dài nhất định, danh sách liên kết sẽ được chuyển đổi sang cây đỏ-đen.

`TreeNode` lưu trữ node cây đỏ-đen, được bao bọc bởi `TreeBin`. `TreeBin` duy trì node gốc của cây đỏ-đen thông qua thuộc tính `root`, vì khi cây đỏ-đen xoay, node gốc có thể bị thay thế bởi node con gốc, tại thời điểm này, nếu có luồng khác muốn ghi vào cây đỏ-đen này sẽ gặp vấn đề không an toàn luồng, vì vậy trong `ConcurrentHashMap`, `TreeBin` duy trì luồng hiện đang sử dụng cây đỏ-đen thông qua thuộc tính `waiter`, để ngăn các luồng khác vào.

```java
static final class TreeBin<K,V> extends Node<K,V> {
        TreeNode<K,V> root;
        volatile TreeNode<K,V> first;
        volatile Thread waiter;
        volatile int lockState;
        // values for lockState
        static final int WRITER = 1; // set while holding write lock
        static final int WAITER = 2; // set when waiting for write lock
        static final int READER = 4; // increment value for setting read lock
...
}
```

### ⭐️ Cách triển khai an toàn luồng cụ thể của ConcurrentHashMap / Triển khai cụ thể bên dưới

#### Trước JDK1.8

![Cấu trúc lưu trữ Java7 ConcurrentHashMap](https://oss.javaguide.cn/github/javaguide/java/collection/java7_concurrenthashmap.png)

Đầu tiên chia dữ liệu thành từng đoạn (đoạn này chính là `Segment`) để lưu trữ, sau đó cấp một khóa cho mỗi đoạn dữ liệu, khi một luồng chiếm khóa truy cập một đoạn dữ liệu, dữ liệu ở các đoạn khác cũng có thể được các luồng khác truy cập.

**`ConcurrentHashMap` được tạo thành từ cấu trúc mảng `Segment` và cấu trúc mảng `HashEntry`**.

`Segment` kế thừa `ReentrantLock`, vì vậy `Segment` là loại khóa tái nhập, đóng vai trò khóa. `HashEntry` dùng để lưu trữ dữ liệu cặp key-value.

```java
static class Segment<K,V> extends ReentrantLock implements Serializable {
}
```

Một `ConcurrentHashMap` chứa một mảng `Segment`, số lượng `Segment` **không thể thay đổi sau khi khởi tạo**. Kích thước mảng `Segment` mặc định là 16, tức là mặc định có thể hỗ trợ 16 luồng ghi đồng thời.

Cấu trúc của `Segment` tương tự `HashMap`, là cấu trúc mảng và danh sách liên kết, một `Segment` chứa một mảng `HashEntry`, mỗi `HashEntry` là một phần tử cấu trúc danh sách liên kết, mỗi `Segment` bảo vệ các phần tử trong mảng `HashEntry`, khi cần sửa đổi dữ liệu trong mảng `HashEntry`, phải lấy khóa `Segment` tương ứng trước. Tức là ghi đồng thời vào cùng một `Segment` sẽ bị chặn, ghi vào các `Segment` khác nhau có thể thực thi đồng thời.

#### Sau JDK1.8

![Cấu trúc lưu trữ Java8 ConcurrentHashMap](https://oss.javaguide.cn/github/javaguide/java/collection/java8_concurrenthashmap.png)

Java 8 gần như viết lại hoàn toàn `ConcurrentHashMap`, số dòng code từ hơn 1000 dòng trong Java 7 tăng lên hơn 6000 dòng hiện tại.

`ConcurrentHashMap` hủy bỏ khóa phân đoạn `Segment`, sử dụng `Node + CAS + synchronized` để đảm bảo an toàn đồng thời. Cấu trúc dữ liệu tương tự `HashMap` 1.8, mảng + danh sách liên kết / cây đỏ-đen nhị phân. Java 8 khi độ dài danh sách liên kết vượt quá một ngưỡng nhất định (8) sẽ chuyển danh sách liên kết (độ phức tạp thời gian địa chỉ O(N)) sang cây đỏ-đen (độ phức tạp thời gian địa chỉ O(log(N))).

Trong Java 8, độ chi tiết khóa tốt hơn, `synchronized` chỉ khóa node đầu của danh sách liên kết hoặc cây đỏ-đen nhị phân hiện tại, vì vậy chỉ cần hash không xung đột sẽ không có đồng thời, không ảnh hưởng đến đọc ghi của các Node khác, hiệu suất cải thiện đáng kể.

### ⭐️ Triển khai ConcurrentHashMap của JDK 1.7 và JDK 1.8 có gì khác nhau?

- **Cách triển khai an toàn luồng**: JDK 1.7 sử dụng khóa phân đoạn `Segment` để đảm bảo an toàn, `Segment` kế thừa từ `ReentrantLock`. JDK1.8 từ bỏ thiết kế khóa phân đoạn `Segment`, sử dụng `Node + CAS + synchronized` để đảm bảo an toàn luồng, độ chi tiết khóa tốt hơn, `synchronized` chỉ khóa node đầu của danh sách liên kết hoặc cây đỏ-đen nhị phân hiện tại.
- **Phương pháp giải quyết va chạm Hash**: JDK 1.7 dùng phương pháp kéo chuỗi, JDK1.8 dùng kéo chuỗi kết hợp cây đỏ-đen (khi độ dài danh sách liên kết vượt quá một ngưỡng nhất định, chuyển đổi danh sách liên kết sang cây đỏ-đen).
- **Độ đồng thời**: JDK 1.7 độ đồng thời tối đa là số lượng Segment, mặc định là 16. JDK 1.8 độ đồng thời tối đa là kích thước mảng Node, độ đồng thời lớn hơn.

### Tại sao key và value của ConcurrentHashMap không thể là null?

Key và value của `ConcurrentHashMap` không thể là null chủ yếu để tránh tính mơ hồ hai nghĩa. null là một giá trị đặc biệt, biểu thị không có đối tượng hoặc không có tham chiếu. Nếu bạn dùng null làm key, bạn không thể phân biệt liệu key này có tồn tại trong `ConcurrentHashMap` hay không, hay hoàn toàn không có key này. Tương tự, nếu bạn dùng null làm value, bạn không thể phân biệt liệu giá trị này có thực sự được lưu trong `ConcurrentHashMap` hay không, hay do không tìm thấy key tương ứng mà trả về.

Nói về phương thức get lấy giá trị, kết quả trả về là null có hai trường hợp:

- Giá trị không có trong collection;
- Giá trị bản thân là null.

Đây cũng là nguồn gốc của tính mơ hồ hai nghĩa.

Chi tiết có thể tham khảo [Phân tích mã nguồn ConcurrentHashMap](https://javaguide.cn/java/collection/concurrent-hash-map-source-code.html).

Trong môi trường đa luồng, tồn tại tình huống khi một luồng thao tác `ConcurrentHashMap` đó, các luồng khác sửa đổi `ConcurrentHashMap` đó, vì vậy không thể dùng `containsKey(key)` để xác định liệu cặp key-value có tồn tại hay không, cũng không thể giải quyết được vấn đề mơ hồ hai nghĩa.

Ngược lại với điều này, `HashMap` có thể lưu trữ key và value là null, nhưng null làm key chỉ có thể có một, null làm value có thể có nhiều. Nếu truyền null làm tham số, sẽ trả về giá trị ở vị trí có hash value là 0. Trong môi trường đơn luồng, không tồn tại tình huống khi một luồng thao tác HashMap đó, các luồng khác sửa đổi `HashMap` đó, vì vậy có thể dùng `contains(key)` để kiểm tra xem cặp key-value có tồn tại hay không, từ đó thực hiện xử lý tương ứng, không tồn tại vấn đề mơ hồ hai nghĩa.

Tức là, trong đa luồng không thể xác định chính xác cặp key-value có tồn tại hay không (có trường hợp các luồng khác sửa đổi), trong đơn luồng có thể (không có trường hợp các luồng khác sửa đổi).

Nếu bạn thực sự cần dùng null trong ConcurrentHashMap, có thể dùng một đối tượng null tĩnh đặc biệt để thay thế null.

```java
public static final Object NULL = new Object();
```

Cuối cùng, chia sẻ thêm câu trả lời của chính tác giả `ConcurrentHashMap` (Doug Lea) về vấn đề này:

> The main reason that nulls aren't allowed in ConcurrentMaps (ConcurrentHashMaps, ConcurrentSkipListMaps) is that ambiguities that may be just barely tolerable in non-concurrent maps can't be accommodated. The main one is that if `map.get(key)` returns `null`, you can't detect whether the key explicitly maps to `null` vs the key isn't mapped. In a non-concurrent map, you can check this via `map.contains(key)`, but in a concurrent one, the map might have changed between calls.

Sau khi dịch, ý nghĩa đại ý vẫn là trong đơn luồng có thể chịu đựng sự mơ hồ, còn trong đa luồng thì không thể.

### ⭐️ ConcurrentHashMap có thể đảm bảo tính nguyên tử của các thao tác kết hợp không?

`ConcurrentHashMap` an toàn luồng, có nghĩa là nó có thể đảm bảo rằng khi nhiều luồng đồng thời đọc ghi, sẽ không xảy ra tình trạng dữ liệu không nhất quán, cũng không gây ra vấn đề vòng lặp vô tận do thao tác đa luồng `HashMap` trong JDK1.7 và các phiên bản trước. Nhưng điều này không có nghĩa là nó có thể đảm bảo tất cả các thao tác kết hợp đều là nguyên tử, tuyệt đối không được nhầm lẫn!

Thao tác kết hợp là các thao tác bao gồm nhiều thao tác cơ bản (như `put`, `get`, `remove`, `containsKey` v.v.), ví dụ như kiểm tra trước xem một key có tồn tại không `containsKey(key)`, sau đó dựa vào kết quả thực hiện chèn hoặc cập nhật `put(key, value)`. Loại thao tác này trong quá trình thực hiện có thể bị các luồng khác ngắt, dẫn đến kết quả không như mong đợi.

Ví dụ, có hai luồng A và B đồng thời thực hiện thao tác kết hợp trên `ConcurrentHashMap`, như sau:

```java
// 线程 A
if (!map.containsKey(key)) {
map.put(key, value);
}
// 线程 B
if (!map.containsKey(key)) {
map.put(key, anotherValue);
}
```

Nếu thứ tự thực thi của luồng A và B như sau:

1. Luồng A kiểm tra không tồn tại key trong map
2. Luồng B kiểm tra không tồn tại key trong map
3. Luồng B chèn (key, anotherValue) vào map
4. Luồng A chèn (key, value) vào map

Thì kết quả cuối cùng là (key, value), không phải (key, anotherValue) như mong đợi. Đây là vấn đề do tính phi nguyên tử của thao tác kết hợp.

**Vậy làm thế nào để đảm bảo tính nguyên tử của thao tác kết hợp `ConcurrentHashMap`?**

`ConcurrentHashMap` cung cấp một số thao tác kết hợp nguyên tử, như `putIfAbsent`, `compute`, `computeIfAbsent`, `computeIfPresent`, `merge` v.v. Các phương thức này đều có thể nhận một function làm tham số, tính toán một value mới dựa trên key và value đã cho, và cập nhật vào map.

Code trên có thể viết lại thành:

```java
// 线程 A
map.putIfAbsent(key, value);
// 线程 B
map.putIfAbsent(key, anotherValue);
```

Hoặc:

```java
// 线程 A
map.computeIfAbsent(key, k -> value);
// 线程 B
map.computeIfAbsent(key, k -> anotherValue);
```

Nhiều bạn có thể nói, tình huống này cũng có thể thêm khóa để đồng bộ hóa! Đúng vậy, nhưng không khuyến nghị sử dụng cơ chế đồng bộ hóa bằng khóa, vi phạm mục đích sử dụng `ConcurrentHashMap`. Khi sử dụng `ConcurrentHashMap`, hãy cố gắng sử dụng các phương thức thao tác kết hợp nguyên tử này để đảm bảo tính nguyên tử.

## Lớp tiện ích Collections (Không quan trọng)

**Các phương thức thường dùng của lớp tiện ích `Collections`**:

- Sắp xếp
- Tìm kiếm, thay thế
- Kiểm soát đồng bộ (không khuyến nghị, khi cần loại collection an toàn luồng hãy cân nhắc sử dụng các collection đồng thời trong package JUC)

### Thao tác sắp xếp

```java
void reverse(List list)//反转
void shuffle(List list)//随机排序
void sort(List list)//按自然排序的升序排序
void sort(List list, Comparator c)//定制排序，由Comparator控制排序逻辑
void swap(List list, int i , int j)//交换两个索引位置的元素
void rotate(List list, int distance)//旋转。当distance为正数时，将list后distance个元素整体移到前面。当distance为负数时，将 list的前distance个元素整体移到后面
```

### Thao tác tìm kiếm, thay thế

```java
int binarySearch(List list, Object key)//对List进行二分查找，返回索引，注意List必须是有序的
int max(Collection coll)//根据元素的自然顺序，返回最大的元素。 类比int min(Collection coll)
int max(Collection coll, Comparator c)//根据定制排序，返回最大元素，排序规则由Comparatator类控制。类比int min(Collection coll, Comparator c)
void fill(List list, Object obj)//用指定的元素代替指定list中的所有元素
int frequency(Collection c, Object o)//统计元素出现次数
int indexOfSubList(List list, List target)//统计target在list中第一次出现的索引，找不到则返回-1，类比int lastIndexOfSubList(List source, list target)
boolean replaceAll(List list, Object oldVal, Object newVal)//用新元素替换旧元素
```

### Kiểm soát đồng bộ

`Collections` cung cấp nhiều phương thức `synchronizedXxx()`, phương thức này có thể bao bọc collection chỉ định thành collection đồng bộ luồng, từ đó giải quyết vấn đề an toàn luồng khi nhiều luồng truy cập đồng thời vào collection.

Chúng ta biết `HashSet`, `TreeSet`, `ArrayList`, `LinkedList`, `HashMap`, `TreeMap` đều không an toàn luồng. `Collections` cung cấp nhiều phương thức tĩnh có thể bao bọc chúng thành collection đồng bộ luồng.

**Tốt nhất không nên dùng các phương thức dưới đây, hiệu suất rất thấp, khi cần loại collection an toàn luồng hãy cân nhắc sử dụng các collection đồng thời trong package JUC.**

Các phương thức như sau:

```java
synchronizedCollection(Collection<T>  c) //返回指定 collection 支持的同步（线程安全的）collection。
synchronizedList(List<T> list)//返回指定列表支持的同步（线程安全的）List。
synchronizedMap(Map<K,V> m) //返回由指定映射支持的同步（线程安全的）Map。
synchronizedSet(Set<T> s) //返回指定 set 支持的同步（线程安全的）set。
```

<!-- @include: @article-footer.snippet.md -->
