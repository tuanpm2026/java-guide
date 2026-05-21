---
title: Phân tích mã nguồn LinkedList
description: Phân tích chuyên sâu mã nguồn LinkedList：phân tích cấu trúc danh sách liên kết đôi, triển khai interface Deque, chèn/xóa ở đầu/cuối với độ phức tạp thời gian O(1), so sánh hiệu năng với ArrayList và các trường hợp sử dụng phù hợp.
category: Java
tag:
  - Java Collections
head:
  - - meta
    - name: keywords
      content: LinkedList源码,双向链表,Deque接口,LinkedList与ArrayList区别,插入删除性能,链表实现
---

<!-- @include: @article-header.snippet.md -->

## Giới thiệu về LinkedList

`LinkedList` là một lớp collection được triển khai dựa trên danh sách liên kết đôi, thường được so sánh với `ArrayList`. Về sự so sánh chi tiết giữa `LinkedList` và `ArrayList`, bạn có thể xem bài viết [Tổng hợp các câu hỏi phỏng vấn thường gặp về Java Collections (Phần 1)](./java-collection-questions-01.md).

![Danh sách liên kết đôi](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/bidirectional-linkedlist.png)

Tuy nhiên, trong dự án thực tế chúng ta thường không dùng `LinkedList`. Hầu hết các tình huống cần dùng `LinkedList` đều có thể thay thế bằng `ArrayList`, và hiệu năng thường tốt hơn! Ngay cả tác giả của `LinkedList` là Joshua Bloch cũng nói rằng ông chưa bao giờ dùng `LinkedList`.

![](https://oss.javaguide.cn/github/javaguide/redisimage-20220412110853807.png)

Ngoài ra, đừng vô thức nghĩ rằng `LinkedList` là danh sách liên kết nên phù hợp nhất cho các tình huống thêm/xóa phần tử. Như đã đề cập ở trên, `LinkedList` chỉ có độ phức tạp thời gian gần O(1) khi chèn hoặc xóa phần tử ở đầu hoặc cuối, còn các trường hợp thêm/xóa khác đều có độ phức tạp thời gian trung bình là O(n).

### Độ phức tạp thời gian khi chèn và xóa phần tử của LinkedList?

- Chèn/xóa ở đầu: chỉ cần sửa đổi con trỏ của nút đầu là hoàn thành thao tác chèn/xóa, nên độ phức tạp thời gian là O(1).
- Chèn/xóa ở cuối: chỉ cần sửa đổi con trỏ của nút cuối là hoàn thành thao tác chèn/xóa, nên độ phức tạp thời gian là O(1).
- Chèn/xóa tại vị trí chỉ định: cần di chuyển đến vị trí chỉ định trước, rồi sửa đổi con trỏ của nút chỉ định để hoàn thành thao tác chèn/xóa. Tuy nhiên vì có con trỏ đầu và cuối nên có thể xuất phát từ con trỏ gần hơn, cần duyệt trung bình n/4 phần tử, nên độ phức tạp thời gian là O(n).

### Tại sao LinkedList không thể triển khai interface RandomAccess?

`RandomAccess` là một marker interface dùng để biểu thị rằng lớp triển khai interface này hỗ trợ truy cập ngẫu nhiên (tức là có thể truy cập phần tử nhanh chóng qua chỉ mục). Vì cấu trúc dữ liệu bên dưới của `LinkedList` là danh sách liên kết, địa chỉ bộ nhớ không liên tục, chỉ có thể định vị qua con trỏ, không hỗ trợ truy cập nhanh ngẫu nhiên, nên không thể triển khai interface `RandomAccess`.

## Phân tích mã nguồn LinkedList

Dưới đây lấy JDK1.8 làm ví dụ để phân tích mã nguồn cốt lõi của `LinkedList`.

Định nghĩa lớp `LinkedList` như sau:

```java
public class LinkedList<E>
    extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, java.io.Serializable
{
  //...
}
```

`LinkedList` kế thừa `AbstractSequentialList`, còn `AbstractSequentialList` lại kế thừa `AbstractList`.

Khi đọc mã nguồn của `ArrayList`, chúng ta biết rằng `ArrayList` cũng kế thừa `AbstractList`, vì vậy `LinkedList` sẽ có nhiều phương thức tương tự `ArrayList`.

`LinkedList` triển khai các interface sau:

- `List`: biểu thị nó là một danh sách, hỗ trợ các thao tác thêm, xóa, tìm kiếm và có thể truy cập qua chỉ mục.
- `Deque`: kế thừa từ interface `Queue`, có đặc tính hàng đợi hai đầu, hỗ trợ chèn và xóa phần tử từ cả hai đầu, thuận tiện để triển khai các cấu trúc dữ liệu như ngăn xếp (stack) và hàng đợi (queue). Lưu ý rằng `Deque` được phát âm là "deck" [dɛk], điều mà nhiều người thường đọc sai.
- `Cloneable`: biểu thị nó có khả năng sao chép, có thể thực hiện deep copy hoặc shallow copy.
- `Serializable`: biểu thị nó có thể được serialize, tức là có thể chuyển đổi đối tượng thành byte stream để lưu trữ hoặc truyền qua mạng, rất tiện lợi.

![Sơ đồ lớp LinkedList](https://oss.javaguide.cn/github/javaguide/java/collection/linkedlist--class-diagram.png)

Các phần tử trong `LinkedList` được định nghĩa thông qua `Node`:

```java
private static class Node<E> {
    E item;// 节点值
    Node<E> next; // 指向的下一个节点（后继节点）
    Node<E> prev; // 指向的前一个节点（前驱结点）

    // 初始化参数顺序分别是：前驱结点、本身节点值、后继节点
    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```

### Khởi tạo

`LinkedList` có một constructor không tham số và một constructor có tham số.

```java
// 创建一个空的链表对象
public LinkedList() {
}

// 接收一个集合类型作为参数，会创建一个与传入集合相同元素的链表对象
public LinkedList(Collection<? extends E> c) {
    this();
    addAll(c);
}
```

### Chèn phần tử

`LinkedList` không chỉ triển khai các phương thức liên quan đến interface `List`, mà còn triển khai nhiều phương thức của interface `Deque`, vì vậy chúng ta có nhiều cách để chèn phần tử.

Ở đây lấy phương thức chèn liên quan đến interface `List` làm ví dụ để giải thích mã nguồn, tương ứng với phương thức `add()`.

Phương thức `add()` có hai phiên bản:

- `add(E e)`: dùng để chèn phần tử vào cuối `LinkedList`, tức là thêm phần tử mới làm phần tử cuối cùng của danh sách liên kết, độ phức tạp thời gian là O(1).
- `add(int index, E element)`: dùng để chèn phần tử tại vị trí chỉ định. Cách chèn này cần di chuyển đến vị trí chỉ định trước, rồi sửa đổi con trỏ của nút chỉ định để hoàn thành thao tác, nên cần di chuyển trung bình n/4 phần tử, độ phức tạp thời gian là O(n).

```java
// 在链表尾部插入元素
public boolean add(E e) {
    linkLast(e);
    return true;
}

// 在链表指定位置插入元素
public void add(int index, E element) {
    // 下标越界检查
    checkPositionIndex(index);

    // 判断 index 是不是链表尾部位置
    if (index == size)
        // 如果是就直接调用 linkLast 方法将元素节点插入链表尾部即可
        linkLast(element);
    else
        // 如果不是则调用 linkBefore 方法将其插入指定元素之前
        linkBefore(element, node(index));
}

// 将元素节点插入到链表尾部
void linkLast(E e) {
    // 将最后一个元素赋值（引用传递）给节点 l
    final Node<E> l = last;
    // 创建节点，并指定节点前驱为链表尾节点 last，后继引用为空
    final Node<E> newNode = new Node<>(l, e, null);
    // 将 last 引用指向新节点
    last = newNode;
    // 判断尾节点是否为空
    // 如果 l 是null 意味着这是第一次添加元素
    if (l == null)
        // 如果是第一次添加，将first赋值为新节点，此时链表只有一个元素
        first = newNode;
    else
        // 如果不是第一次添加，将新节点赋值给l（添加前的最后一个元素）的next
        l.next = newNode;
    size++;
    modCount++;
}

// 在指定元素之前插入元素
void linkBefore(E e, Node<E> succ) {
    // assert succ != null;断言 succ不为 null
    // 定义一个节点元素保存 succ 的 prev 引用，也就是它的前一节点信息
    final Node<E> pred = succ.prev;
    // 初始化节点，并指明前驱和后继节点
    final Node<E> newNode = new Node<>(pred, e, succ);
    // 将 succ 节点前驱引用 prev 指向新节点
    succ.prev = newNode;
    // 判断前驱节点是否为空，为空表示 succ 是第一个节点
    if (pred == null)
        // 新节点成为第一个节点
        first = newNode;
    else
        // succ 节点前驱的后继引用指向新节点
        pred.next = newNode;
    size++;
    modCount++;
}
```

### Lấy phần tử

`LinkedList` có tổng cộng 3 phương thức liên quan đến việc lấy phần tử:

1. `getFirst()`: lấy phần tử đầu tiên của danh sách liên kết.
2. `getLast()`: lấy phần tử cuối cùng của danh sách liên kết.
3. `get(int index)`: lấy phần tử tại vị trí chỉ định trong danh sách liên kết.

```java
// 获取链表的第一个元素
public E getFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return f.item;
}

// 获取链表的最后一个元素
public E getLast() {
    final Node<E> l = last;
    if (l == null)
        throw new NoSuchElementException();
    return l.item;
}

// 获取链表指定位置的元素
public E get(int index) {
  // 下标越界检查，如果越界就抛异常
  checkElementIndex(index);
  // 返回链表中对应下标的元素
  return node(index).item;
}
```

Điểm cốt lõi ở đây là phương thức `node(int index)`:

```java
// 返回指定下标的非空节点
Node<E> node(int index) {
    // 断言下标未越界
    // assert isElementIndex(index);
    // 如果index小于size的二分之一  从前开始查找（向后查找）  反之向前查找
    if (index < (size >> 1)) {
        Node<E> x = first;
        // 遍历，循环向后查找，直至 i == index
        for (int i = 0; i < index; i++)
            x = x.next;
        return x;
    } else {
        Node<E> x = last;
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}
```

Các phương thức như `get(int index)` hay `remove(int index)` đều gọi phương thức này bên trong để lấy nút tương ứng.

Từ mã nguồn của phương thức này có thể thấy, nó so sánh giá trị chỉ mục với một nửa kích thước của danh sách liên kết để xác định bắt đầu duyệt từ đầu hay cuối. Nếu giá trị chỉ mục nhỏ hơn một nửa size, bắt đầu duyệt từ đầu, ngược lại duyệt từ cuối. Điều này giúp tìm nút mục tiêu trong thời gian ngắn hơn, tận dụng đặc điểm của danh sách liên kết đôi để nâng cao hiệu quả.

### Xóa phần tử

`LinkedList` có tổng cộng 5 phương thức liên quan đến việc xóa phần tử:

1. `removeFirst()`: xóa và trả về phần tử đầu tiên của danh sách liên kết.
2. `removeLast()`: xóa và trả về phần tử cuối cùng của danh sách liên kết.
3. `remove(E e)`: xóa phần tử chỉ định xuất hiện lần đầu tiên trong danh sách liên kết, trả về false nếu không tồn tại phần tử đó.
4. `remove(int index)`: xóa phần tử tại chỉ mục chỉ định và trả về giá trị của phần tử đó.
5. `void clear()`: xóa tất cả phần tử trong danh sách liên kết này.

```java
// 删除并返回链表的第一个元素
public E removeFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return unlinkFirst(f);
}

// 删除并返回链表的最后一个元素
public E removeLast() {
    final Node<E> l = last;
    if (l == null)
        throw new NoSuchElementException();
    return unlinkLast(l);
}

// 删除链表中首次出现的指定元素，如果不存在该元素则返回 false
public boolean remove(Object o) {
    // 如果指定元素为 null，遍历链表找到第一个为 null 的元素进行删除
    if (o == null) {
        for (Node<E> x = first; x != null; x = x.next) {
            if (x.item == null) {
                unlink(x);
                return true;
            }
        }
    } else {
        // 如果不为 null ,遍历链表找到要删除的节点
        for (Node<E> x = first; x != null; x = x.next) {
            if (o.equals(x.item)) {
                unlink(x);
                return true;
            }
        }
    }
    return false;
}

// 删除链表指定位置的元素
public E remove(int index) {
    // 下标越界检查，如果越界就抛异常
    checkElementIndex(index);
    return unlink(node(index));
}
```

Điểm cốt lõi ở đây là phương thức `unlink(Node<E> x)`:

```java
E unlink(Node<E> x) {
    // 断言 x 不为 null
    // assert x != null;
    // 获取当前节点（也就是待删除节点）的元素
    final E element = x.item;
    // 获取当前节点的下一个节点
    final Node<E> next = x.next;
    // 获取当前节点的前一个节点
    final Node<E> prev = x.prev;

    // 如果前一个节点为空，则说明当前节点是头节点
    if (prev == null) {
        // 直接让链表头指向当前节点的下一个节点
        first = next;
    } else { // 如果前一个节点不为空
        // 将前一个节点的 next 指针指向当前节点的下一个节点
        prev.next = next;
        // 将当前节点的 prev 指针置为 null，，方便 GC 回收
        x.prev = null;
    }

    // 如果下一个节点为空，则说明当前节点是尾节点
    if (next == null) {
        // 直接让链表尾指向当前节点的前一个节点
        last = prev;
    } else { // 如果下一个节点不为空
        // 将下一个节点的 prev 指针指向当前节点的前一个节点
        next.prev = prev;
        // 将当前节点的 next 指针置为 null，方便 GC 回收
        x.next = null;
    }

    // 将当前节点元素置为 null，方便 GC 回收
    x.item = null;
    size--;
    modCount++;
    return element;
}
```

Logic của phương thức `unlink()` như sau:

1. Đầu tiên lấy nút trước (predecessor) và nút sau (successor) của nút x cần xóa.
2. Kiểm tra xem nút cần xóa có phải là nút đầu hay nút cuối không:
   - Nếu x là nút đầu, cho `first` trỏ đến nút kế tiếp `next` của x
   - Nếu x là nút cuối, cho `last` trỏ đến nút trước `prev` của x
   - Nếu x không phải nút đầu cũng không phải nút cuối, thực hiện bước tiếp theo
3. Cho successor của predecessor của nút x trỏ đến successor `next` của nút cần xóa, ngắt kết nối giữa x và x.prev.
4. Cho predecessor của successor của nút x trỏ đến predecessor `prev` của nút cần xóa, ngắt kết nối giữa x và x.next.
5. Đặt phần tử của nút x cần xóa thành null, sửa đổi độ dài danh sách liên kết.

Bạn có thể tham khảo hình dưới để hiểu (nguồn hình: [Phân tích mã nguồn LinkedList (JDK 1.8)](https://www.tianxiaobo.com/2018/01/31/LinkedList-%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90-JDK-1-8/)):

![Logic phương thức unlink](https://oss.javaguide.cn/github/javaguide/java/collection/linkedlist-unlink.jpg)

### Duyệt danh sách liên kết

Khuyến nghị sử dụng vòng lặp `for-each` để duyệt các phần tử trong `LinkedList`. Vòng lặp `for-each` cuối cùng sẽ được chuyển đổi thành dạng iterator.

```java
LinkedList<String> list = new LinkedList<>();
list.add("apple");
list.add("banana");
list.add("pear");

for (String fruit : list) {
    System.out.println(fruit);
}
```

Cốt lõi của việc duyệt `LinkedList` là triển khai iterator của nó.

```java
// 双向迭代器
private class ListItr implements ListIterator<E> {
    // 表示上一次调用 next() 或 previous() 方法时经过的节点；
    private Node<E> lastReturned;
    // 表示下一个要遍历的节点；
    private Node<E> next;
    // 表示下一个要遍历的节点的下标，也就是当前节点的后继节点的下标；
    private int nextIndex;
    // 表示当前遍历期望的修改计数值，用于和 LinkedList 的 modCount 比较，判断链表是否被其他线程修改过。
    private int expectedModCount = modCount;
    …………
}
```

Dưới đây chúng ta sẽ giới thiệu chi tiết các phương thức cốt lõi trong iterator `ListItr`.

Trước tiên xem duyệt theo chiều từ đầu đến cuối:

```java
// 判断还有没有下一个节点
public boolean hasNext() {
    // 判断下一个节点的下标是否小于链表的大小，如果是则表示还有下一个元素可以遍历
    return nextIndex < size;
}
// 获取下一个节点
public E next() {
    // 检查在迭代过程中链表是否被修改过
    checkForComodification();
    // 判断是否还有下一个节点可以遍历，如果没有则抛出 NoSuchElementException 异常
    if (!hasNext())
        throw new NoSuchElementException();
    // 将 lastReturned 指向当前节点
    lastReturned = next;
    // 将 next 指向下一个节点
    next = next.next;
    nextIndex++;
    return lastReturned.item;
}
```

Tiếp theo xem duyệt theo chiều từ cuối đến đầu:

```java
// 判断是否还有前一个节点
public boolean hasPrevious() {
    return nextIndex > 0;
}

// 获取前一个节点
public E previous() {
    // 检查是否在迭代过程中链表被修改
    checkForComodification();
    // 如果没有前一个节点，则抛出异常
    if (!hasPrevious())
        throw new NoSuchElementException();
    // 将 lastReturned 和 next 指针指向上一个节点
    lastReturned = next = (next == null) ? last : next.prev;
    nextIndex--;
    return lastReturned.item;
}
```

Nếu cần xóa hoặc chèn phần tử, cũng có thể thực hiện bằng iterator.

```java
LinkedList<String> list = new LinkedList<>();
list.add("apple");
list.add(null);
list.add("banana");

//  Collection 接口的 removeIf 方法底层依然是基于迭代器
list.removeIf(Objects::isNull);

for (String fruit : list) {
    System.out.println(fruit);
}
```

Phương thức xóa phần tử tương ứng của iterator như sau:

```java
// 从列表中删除上次被返回的元素
public void remove() {
    // 检查是否在迭代过程中链表被修改
    checkForComodification();
    // 如果上次返回的节点为空，则抛出异常
    if (lastReturned == null)
        throw new IllegalStateException();

    // 获取当前节点的下一个节点
    Node<E> lastNext = lastReturned.next;
    // 从链表中删除上次返回的节点
    unlink(lastReturned);
    // 修改指针
    if (next == lastReturned)
        next = lastNext;
    else
        nextIndex--;
    // 将上次返回的节点引用置为 null，方便 GC 回收
    lastReturned = null;
    expectedModCount++;
}
```

## Kiểm tra các phương thức thường dùng của LinkedList

Code:

```java
// 创建 LinkedList 对象
LinkedList<String> list = new LinkedList<>();

// 添加元素到链表末尾
list.add("apple");
list.add("banana");
list.add("pear");
System.out.println("链表内容：" + list);

// 在指定位置插入元素
list.add(1, "orange");
System.out.println("链表内容：" + list);

// 获取指定位置的元素
String fruit = list.get(2);
System.out.println("索引为 2 的元素：" + fruit);

// 修改指定位置的元素
list.set(3, "grape");
System.out.println("链表内容：" + list);

// 删除指定位置的元素
list.remove(0);
System.out.println("链表内容：" + list);

// 删除第一个出现的指定元素
list.remove("banana");
System.out.println("链表内容：" + list);

// 获取链表的长度
int size = list.size();
System.out.println("链表长度：" + size);

// 清空链表
list.clear();
System.out.println("清空后的链表：" + list);
```

Kết quả đầu ra:

```plain
Phần tử tại chỉ mục 2: banana
Nội dung danh sách: [apple, orange, banana, grape]
Nội dung danh sách: [orange, banana, grape]
Nội dung danh sách: [orange, grape]
Độ dài danh sách: 2
Danh sách sau khi xóa toàn bộ: []
```

<!-- @include: @article-footer.snippet.md -->
