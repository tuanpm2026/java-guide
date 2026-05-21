---
title: Phân tích mã nguồn CopyOnWriteArrayList
description: "Phân tích chuyên sâu mã nguồn CopyOnWriteArrayList: giải thích chi tiết cơ chế Copy-On-Write (COW), phù hợp với kịch bản đọc nhiều ghi ít, triển khai List an toàn luồng, đảm bảo tính nhất quán snapshot và cân nhắc về chi phí bộ nhớ."
category: Java
tag:
  - Java Collections
head:
  - - meta
    - name: keywords
      content: CopyOnWriteArrayList源码,写时复制COW,线程安全List,读多写少,并发容器,快照一致性
---

## Giới thiệu về CopyOnWriteArrayList

Trước JDK1.5, nếu muốn sử dụng `List` an toàn trong môi trường đồng thời, chỉ có thể chọn `Vector`. Tuy nhiên `Vector` là một tập hợp cũ đã lỗi thời. Hầu hết các phương thức thêm, xóa, sửa, truy vấn của `Vector` đều được gắn `synchronized`, cách này tuy đảm bảo đồng bộ nhưng thực chất là đặt một khóa lớn lên toàn bộ `Vector`, khiến mỗi phương thức khi thực thi đều phải chờ lấy khóa, dẫn đến hiệu suất rất thấp.

JDK1.5 giới thiệu gói `Java.util.concurrent` (JUC), cung cấp nhiều container vừa an toàn luồng vừa có hiệu suất đồng thời tốt. Trong số đó, triển khai `List` an toàn luồng duy nhất là `CopyOnWriteArrayList`. Để tìm hiểu tổng quan về các container đồng thời phổ biến trong gói `java.util.concurrent`, bạn có thể đọc bài viết của tôi: [Tổng hợp các container đồng thời phổ biến trong Java](https://javaguide.cn/java/concurrent/java-concurrent-collections.html).

### CopyOnWriteArrayList có gì đặc biệt?

Đối với phần lớn các kịch bản nghiệp vụ, thao tác đọc thường nhiều hơn rất nhiều so với thao tác ghi. Vì thao tác đọc không sửa đổi dữ liệu gốc, nên việc khóa mỗi lần đọc thực ra là lãng phí tài nguyên. Thay vào đó, chúng ta nên cho phép nhiều luồng cùng lúc truy cập dữ liệu nội bộ của `List`, vì thao tác đọc vốn là an toàn.

Tư tưởng này rất giống với thiết kế khóa đọc-ghi `ReentrantReadWriteLock`: đọc-đọc không loại trừ nhau, đọc-ghi loại trừ nhau, ghi-ghi loại trừ nhau (chỉ đọc-đọc là không loại trừ). `CopyOnWriteArrayList` triển khai tư tưởng này ở mức độ cao hơn. Để tối ưu tối đa hiệu suất đọc, thao tác đọc trong `CopyOnWriteArrayList` hoàn toàn không cần khóa. Đặc biệt hơn, thao tác ghi cũng không chặn thao tác đọc — chỉ có ghi-ghi mới loại trừ nhau. Nhờ đó, hiệu suất đọc có thể được nâng cao đáng kể.

Cốt lõi đảm bảo an toàn luồng của `CopyOnWriteArrayList` nằm ở chiến lược **Sao chép khi ghi (Copy-On-Write)**, điều này đã thể hiện ngay trong tên gọi của nó.

### Tư tưởng của Copy-On-Write là gì?

"Copy-On-Write" trong tên `CopyOnWriteArrayList` có nghĩa là sao chép khi ghi, viết tắt là COW.

Dưới đây là phần giới thiệu về Copy-On-Write từ Wikipedia, khá súc tích:

> Sao chép khi ghi (tiếng Anh: Copy-on-write, viết tắt COW) là một chiến lược tối ưu hóa trong lĩnh vực thiết kế chương trình máy tính. Ý tưởng cốt lõi là: nếu có nhiều caller cùng yêu cầu truy cập cùng một tài nguyên (chẳng hạn như dữ liệu trong bộ nhớ hay ổ đĩa), họ sẽ cùng nhận được một con trỏ trỏ đến tài nguyên đó. Chỉ khi một caller cố gắng sửa đổi nội dung tài nguyên, hệ thống mới thực sự tạo ra một bản sao riêng (private copy) cho caller đó, trong khi các caller khác vẫn thấy tài nguyên ban đầu không thay đổi. Quá trình này trong suốt với các caller còn lại. Ưu điểm chính của cách làm này là nếu caller không sửa đổi tài nguyên thì không có bản sao nào được tạo ra, do đó nhiều caller chỉ đọc có thể dùng chung một tài nguyên.

Lấy `CopyOnWriteArrayList` làm ví dụ: khi cần sửa đổi (các thao tác `add`, `set`, `remove`, v.v.) nội dung của `CopyOnWriteArrayList`, thay vì sửa trực tiếp mảng gốc, nó sẽ tạo một bản sao của mảng bên dưới, thực hiện sửa đổi trên bản sao đó, sau đó gán lại mảng đã sửa đổi. Nhờ vậy, thao tác ghi không ảnh hưởng đến thao tác đọc.

Có thể thấy, cơ chế sao chép khi ghi rất phù hợp với kịch bản đồng thời đọc nhiều ghi ít, có thể nâng cao đáng kể hiệu suất đồng thời của hệ thống.

Tuy nhiên, cơ chế sao chép khi ghi không phải là giải pháp hoàn hảo cho mọi tình huống, nó vẫn có một số nhược điểm:

1. Chiếm dụng bộ nhớ: mỗi thao tác ghi đều cần sao chép toàn bộ dữ liệu gốc, tốn thêm không gian bộ nhớ. Khi lượng dữ liệu lớn, có thể dẫn đến thiếu tài nguyên bộ nhớ.
2. Chi phí ghi cao: mỗi thao tác ghi đều phải sao chép dữ liệu gốc rồi mới sửa đổi và thay thế, nên chi phí ghi tương đối lớn. Trong kịch bản ghi thường xuyên, hiệu suất có thể bị ảnh hưởng.
3. Vấn đề nhất quán dữ liệu: thao tác sửa đổi không phản ánh ngay vào kết quả cuối cùng mà phải chờ sao chép hoàn tất, điều này có thể gây ra một số vấn đề về nhất quán dữ liệu.
4. ……

## Phân tích mã nguồn CopyOnWriteArrayList

Dưới đây phân tích mã nguồn cốt lõi của `CopyOnWriteArrayList` dựa trên JDK1.8.

Định nghĩa lớp `CopyOnWriteArrayList` như sau:

```java
public class CopyOnWriteArrayList<E>
extends Object
implements List<E>, RandomAccess, Cloneable, Serializable
{
  //...
}
```

`CopyOnWriteArrayList` triển khai các interface sau:

- `List`: cho thấy đây là một danh sách, hỗ trợ thêm, xóa, tìm kiếm và truy cập qua chỉ số.
- `RandomAccess`: đây là interface đánh dấu, cho biết tập hợp `List` này hỗ trợ **truy cập ngẫu nhiên nhanh**.
- `Cloneable`: cho thấy nó có khả năng sao chép, có thể thực hiện deep copy hoặc shallow copy.
- `Serializable`: cho thấy nó có thể được tuần tự hóa, tức là có thể chuyển đối tượng thành luồng byte để lưu trữ lâu dài hoặc truyền qua mạng.

![Biểu đồ lớp CopyOnWriteArrayList](https://oss.javaguide.cn/github/javaguide/java/collection/copyonwritearraylist-class-diagram.png)

### Khởi tạo

`CopyOnWriteArrayList` có một constructor không tham số và hai constructor có tham số.

```java
// 创建一个空的 CopyOnWriteArrayList
public CopyOnWriteArrayList() {
    setArray(new Object[0]);
}

// 按照集合的迭代器返回的顺序创建一个包含指定集合元素的 CopyOnWriteArrayList
public CopyOnWriteArrayList(Collection<? extends E> c) {
    Object[] elements;
    if (c.getClass() == CopyOnWriteArrayList.class)
        elements = ((CopyOnWriteArrayList<?>)c).getArray();
    else {
        elements = c.toArray();
        // c.toArray might (incorrectly) not return Object[] (see 6260652)
        if (elements.getClass() != Object[].class)
            elements = Arrays.copyOf(elements, elements.length, Object[].class);
    }
    setArray(elements);
}

// 创建一个包含指定数组的副本的列表
public CopyOnWriteArrayList(E[] toCopyIn) {
    setArray(Arrays.copyOf(toCopyIn, toCopyIn.length, Object[].class));
}
```

### Chèn phần tử

Phương thức `add()` của `CopyOnWriteArrayList` có ba phiên bản:

- `add(E e)`: chèn phần tử vào cuối `CopyOnWriteArrayList`.
- `add(int index, E element)`: chèn phần tử vào vị trí chỉ định trong `CopyOnWriteArrayList`.
- `addIfAbsent(E e)`: nếu phần tử chỉ định chưa tồn tại thì thêm vào. Trả về true nếu thêm thành công.

Dưới đây lấy `add(E e)` làm ví dụ:

```java
// 插入元素到 CopyOnWriteArrayList 的尾部
public boolean add(E e) {
    final ReentrantLock lock = this.lock;
    // 加锁
    lock.lock();
    try {
        // 获取原来的数组
        Object[] elements = getArray();
        // 原来数组的长度
        int len = elements.length;
        // 创建一个长度+1的新数组，并将原来数组的元素复制给新数组
        Object[] newElements = Arrays.copyOf(elements, len + 1);
        // 元素放在新数组末尾
        newElements[len] = e;
        // array指向新数组
        setArray(newElements);
        return true;
    } finally {
        // 解锁
        lock.unlock();
    }
}
```

Từ mã nguồn trên có thể thấy:

- Phương thức `add` sử dụng `ReentrantLock` để khóa, đảm bảo đồng bộ và tránh trường hợp nhiều luồng ghi đồng thời tạo ra nhiều bản sao. Khóa được khai báo là `final` đảm bảo địa chỉ bộ nhớ của khóa không thay đổi, và logic giải phóng khóa được đặt trong `finally` để đảm bảo khóa luôn được giải phóng.
- `CopyOnWriteArrayList` thực hiện thao tác ghi bằng cách sao chép mảng bên dưới: tạo một mảng mới chứa phần tử cần thêm, thực hiện ghi trên mảng mới, sau đó gán mảng mới cho tham chiếu mảng bên dưới, thay thế mảng cũ. Điều này xác nhận điều đã nói ở trên: cốt lõi đảm bảo an toàn luồng của `CopyOnWriteArrayList` nằm ở chiến lược **Sao chép khi ghi (Copy-On-Write)**.
- Mỗi thao tác ghi đều phải sao chép mảng bên dưới qua `Arrays.copyOf` với độ phức tạp thời gian O(n) và tốn thêm bộ nhớ. Vì vậy, `CopyOnWriteArrayList` phù hợp với kịch bản đọc nhiều ghi ít; khi ghi không thường xuyên và bộ nhớ đủ, nó có thể nâng cao hiệu suất hệ thống.
- `CopyOnWriteArrayList` không có thao tác mở rộng `grow()` như `ArrayList`.

> Độ phức tạp thời gian của phương thức `Arrays.copyOf` là O(n), trong đó n là độ dài mảng cần sao chép. Nguyên lý của phương thức này là tạo một mảng mới, sao chép dữ liệu từ mảng nguồn sang mảng mới rồi trả về. Phương thức này sao chép toàn bộ mảng nên độ phức tạp tỉ lệ thuận với độ dài mảng, tức O(n). Đáng chú ý là vì bên dưới gọi lệnh sao chép cấp hệ thống, hiệu suất thực tế của phương thức này khá tốt, nhưng cũng cần lưu ý kiểm soát lượng dữ liệu sao chép để tránh chiếm dụng bộ nhớ quá mức.

### Đọc phần tử

Thao tác đọc của `CopyOnWriteArrayList` dựa trên mảng nội bộ `array` và không thực sự sửa đổi dữ liệu, nên không cần kiểm soát đồng bộ hay khóa trong khi đọc, đảm bảo an toàn dữ liệu. Với cơ chế này, nhiều luồng có thể đọc phần tử trong danh sách cùng lúc.

```java
// 底层数组，只能通过getArray和setArray方法访问
private transient volatile Object[] array;

public E get(int index) {
    return get(getArray(), index);
}

final Object[] getArray() {
    return array;
}

private E get(Object[] a, int index) {
    return (E) a[index];
}
```

Tuy nhiên, phương thức `get` có tính nhất quán yếu, trong một số trường hợp có thể đọc được giá trị phần tử cũ.

Phương thức `get(int index)` thực hiện qua hai bước:

1. Lấy tham chiếu mảng hiện tại qua `getArray()`;
2. Lấy phần tử tại chỉ số index trực tiếp từ mảng.

Quá trình này không có khóa, nên trong môi trường đồng thời có thể xảy ra tình huống sau:

1. Luồng 1 gọi `get(int index)` để lấy giá trị, bên trong lấy được giá trị thuộc tính `array` qua `getArray()`;
2. Luồng 2 gọi các phương thức sửa đổi `add`, `set`, `remove`, v.v. của `CopyOnWriteArrayList`, bên trong thay đổi giá trị thuộc tính `array` qua `setArray`;
3. Luồng 1 vẫn lấy giá trị từ mảng `array` cũ.

### Lấy số lượng phần tử trong danh sách

```java
public int size() {
    return getArray().length;
}
```

Mảng `array` trong `CopyOnWriteArrayList` mỗi lần sao chép đều vừa đúng chứa tất cả các phần tử, không có khoảng dự phòng như `ArrayList`. Vì vậy, `CopyOnWriteArrayList` không có thuộc tính `size` — độ dài mảng bên dưới chính là số lượng phần tử, nên phương thức `size()` chỉ cần trả về độ dài mảng.

### Xóa phần tử

`CopyOnWriteArrayList` có tổng cộng 4 phương thức liên quan đến xóa phần tử:

1. `remove(int index)`: xóa phần tử tại vị trí chỉ định. Dịch chuyển các phần tử phía sau sang trái (trừ 1 từ chỉ số của chúng).
2. `boolean remove(Object o)`: xóa lần xuất hiện đầu tiên của phần tử chỉ định, trả về false nếu không tồn tại.
3. `boolean removeAll(Collection<?> c)`: xóa khỏi danh sách tất cả phần tử có trong tập hợp chỉ định.
4. `void clear()`: xóa tất cả phần tử trong danh sách.

Dưới đây lấy `remove(int index)` làm ví dụ:

```java
public E remove(int index) {
    // 获取可重入锁
    final ReentrantLock lock = this.lock;
    // 加锁
    lock.lock();
    try {
         //获取当前array数组
        Object[] elements = getArray();
        // 获取当前array长度
        int len = elements.length;
        //获取指定索引的元素(旧值)
        E oldValue = get(elements, index);
        int numMoved = len - index - 1;
        // 判断删除的是否是最后一个元素
        if (numMoved == 0)
             // 如果删除的是最后一个元素，直接复制该元素前的所有元素到新的数组
            setArray(Arrays.copyOf(elements, len - 1));
        else {
            // 分段复制，将index前的元素和index+1后的元素复制到新数组
            // 新数组长度为旧数组长度-1
            Object[] newElements = new Object[len - 1];
            System.arraycopy(elements, 0, newElements, 0, index);
            System.arraycopy(elements, index + 1, newElements, index,
                             numMoved);
            //将新数组赋值给array引用
            setArray(newElements);
        }
        return oldValue;
    } finally {
         // 解锁
        lock.unlock();
    }
}
```

### Kiểm tra sự tồn tại của phần tử

`CopyOnWriteArrayList` cung cấp hai phương thức để kiểm tra xem phần tử chỉ định có trong danh sách hay không:

- `contains(Object o)`: kiểm tra có chứa phần tử chỉ định không.
- `containsAll(Collection<?> c)`: kiểm tra có chứa tất cả phần tử của tập hợp chỉ định không.

```java
// 判断是否包含指定元素
public boolean contains(Object o) {
    //获取当前array数组
    Object[] elements = getArray();
    //调用index尝试查找指定元素，如果返回值大于等于0，则返回true，否则返回false
    return indexOf(o, elements, 0, elements.length) >= 0;
}

// 判断是否保证指定集合的全部元素
public boolean containsAll(Collection<?> c) {
    //获取当前array数组
    Object[] elements = getArray();
    //获取数组长度
    int len = elements.length;
    //遍历指定集合
    for (Object e : c) {
        //循环调用indexOf方法判断，只要有一个没有包含就直接返回false
        if (indexOf(e, elements, 0, len) < 0)
            return false;
    }
    //最后表示全部包含或者制定集合为空集合，那么返回true
    return true;
}
```

## Kiểm tra các phương thức thông dụng của CopyOnWriteArrayList

Mã nguồn:

```java
// 创建一个 CopyOnWriteArrayList 对象
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();

// 向列表中添加元素
list.add("Java");
list.add("Python");
list.add("C++");
System.out.println("初始列表：" + list);

// 使用 get 方法获取指定位置的元素
System.out.println("列表第二个元素为：" + list.get(1));

// 使用 remove 方法删除指定元素
boolean result = list.remove("C++");
System.out.println("删除结果：" + result);
System.out.println("列表删除元素后为：" + list);

// 使用 set 方法更新指定位置的元素
list.set(1, "Golang");
System.out.println("列表更新后为：" + list);

// 使用 add 方法在指定位置插入元素
list.add(0, "PHP");
System.out.println("列表插入元素后为：" + list);

// 使用 size 方法获取列表大小
System.out.println("列表大小为：" + list.size());

// 使用 removeAll 方法删除指定集合中所有出现的元素
result = list.removeAll(List.of("Java", "Golang"));
System.out.println("批量删除结果：" + result);
System.out.println("列表批量删除元素后为：" + list);

// 使用 clear 方法清空列表中所有元素
list.clear();
System.out.println("列表清空后为：" + list);
```

Kết quả đầu ra:

```plain
Danh sách sau khi cập nhật: [Java, Golang]
Danh sách sau khi chèn phần tử: [PHP, Java, Golang]
Kích thước danh sách: 3
Kết quả xóa hàng loạt: true
Danh sách sau khi xóa hàng loạt: [PHP]
Danh sách sau khi xóa toàn bộ: []
```

<!-- @include: @article-footer.snippet.md -->
