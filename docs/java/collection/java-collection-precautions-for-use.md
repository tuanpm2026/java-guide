---
title: Tổng hợp các lưu ý khi sử dụng Java Collection
description: Tổng hợp các lưu ý khi dùng Java collection: dựa trên Alibaba Java Development Manual tổng kết các best practice về kiểm tra collection rỗng, pitfall Arrays.asList, vấn đề subList, chọn concurrent container, v.v. để tránh các lỗi phổ biến.
category: Java
tag:
  - Java Collection
head:
  - - meta
    - name: keywords
      content: Java collection best practices,check collection empty,Arrays.asList,subList,concurrent container,collection usage notes,performance optimization
---

Bài này tôi tổng kết các lưu ý phổ biến khi dùng collection và nguyên lý cụ thể dựa theo 《Alibaba Java Development Manual》.

Rất khuyến nghị đọc đi đọc lại nhiều lần để tránh gặp những vấn đề cơ bản này khi viết code.

## Kiểm tra Collection rỗng

Mô tả trong 《Alibaba Java Development Manual》:

> **Để kiểm tra xem tất cả element bên trong collection có rỗng không, dùng method `isEmpty()` thay vì `size()==0`.**

Vì method `isEmpty()` có readability tốt hơn và time complexity là `O(1)`.

Hầu hết collection chúng ta dùng đều có method `size()` với time complexity `O(1)`, nhưng cũng có nhiều cái không phải `O(1)`, như `ConcurrentLinkedQueue` trong package `java.util.concurrent`. Method `isEmpty()` của `ConcurrentLinkedQueue` xác định qua method `first()` — method `first()` trả về node đầu tiên có giá trị không null trong queue (nguyên nhân node value là null là do logic delete được dùng trong iterator).

```java
public boolean isEmpty() { return first() == null; }

Node<E> first() {
    restartFromHead:
    for (;;) {
        for (Node<E> h = head, p = h, q;;) {
            boolean hasItem = (p.item != null);
            if (hasItem || (q = p.next) == null) {  // Giá trị node hiện tại không null hoặc đến cuối queue
                updateHead(h, p);  // Đặt head thành p
                return hasItem ? p : null;
            }
            else if (p == q) continue restartFromHead;
            else p = q;  // p = p.next
        }
    }
}
```

Vì khi insert và delete element đều thực thi method `updateHead(h, p)`, time complexity của method này xấp xỉ `O(1)`. Còn method `size()` cần duyệt toàn bộ linked list, time complexity `O(n)`.

```java
public int size() {
    int count = 0;
    for (Node<E> p = first(); p != null; p = succ(p))
        if (p.item != null)
            if (++count == Integer.MAX_VALUE)
                break;
    return count;
}
```

Ngoài ra, trong `ConcurrentHashMap` 1.7, time complexity của method `size()` và `isEmpty()` không giống nhau. `ConcurrentHashMap` 1.7 lưu số lượng element trong mỗi `Segment`. Method `size()` cần thống kê số lượng mỗi `Segment`, còn `isEmpty()` chỉ cần tìm `Segment` đầu tiên không rỗng. Nhưng trong `ConcurrentHashMap` 1.8, cả `size()` lẫn `isEmpty()` đều cần gọi method `sumCount()`, time complexity liên quan đến kích thước mảng `Node`. Dưới đây là source code của method `sumCount()`:

```java
final long sumCount() {
    CounterCell[] as = counterCells; CounterCell a;
    long sum = baseCount;
    if (as != null)
        for (int i = 0; i < as.length; ++i)
            if ((a = as[i]) != null)
                sum += a.value;
    return sum;
}
```

Vì trong môi trường concurrent, `ConcurrentHashMap` lưu số lượng node trong mỗi `Node` vào mảng `CounterCell[]`. Trong `ConcurrentHashMap` 1.7, số lượng element được lưu trong mỗi `Segment`. Method `size()` cần thống kê số lượng mỗi `Segment`, còn `isEmpty()` chỉ cần tìm `Segment` đầu tiên không rỗng.

## Chuyển Collection sang Map

Mô tả trong 《Alibaba Java Development Manual》:

> **Khi dùng method `toMap()` của class `java.util.stream.Collectors` để chuyển sang Map collection, nhất thiết phải chú ý khi value là null sẽ throw NPE exception.**

```java
class Person {
    private String name;
    private String phoneNumber;
     // getters và setters
}

List<Person> bookList = new ArrayList<>();
bookList.add(new Person("jack","18163138123"));
bookList.add(new Person("martin",null));
// Null pointer exception
bookList.stream().collect(Collectors.toMap(Person::getName, Person::getPhoneNumber));
```

Dưới đây giải thích nguyên nhân.

Trước tiên xem method `toMap()` của class `java.util.stream.Collectors` — có thể thấy bên trong gọi method `merge()` của interface `Map`.

```java
public static <T, K, U, M extends Map<K, U>>
Collector<T, ?, M> toMap(Function<? super T, ? extends K> keyMapper,
                            Function<? super T, ? extends U> valueMapper,
                            BinaryOperator<U> mergeFunction,
                            Supplier<M> mapSupplier) {
    BiConsumer<M, T> accumulator
            = (map, element) -> map.merge(keyMapper.apply(element),
                                          valueMapper.apply(element), mergeFunction);
    return new CollectorImpl<>(mapSupplier, accumulator, mapMerger(mergeFunction), CH_ID);
}
```

Method `merge()` của interface `Map` như dưới — đây là default implementation trong interface.

> Nếu chưa biết Java 8 new features, đọc bài: [《Java8 New Features Summary》](https://mp.weixin.qq.com/s/ojyl7B6PiHaTWADqmUq2rw).

```java
default V merge(K key, V value,
        BiFunction<? super V, ? super V, ? extends V> remappingFunction) {
    Objects.requireNonNull(remappingFunction);
    Objects.requireNonNull(value);
    V oldValue = get(key);
    V newValue = (oldValue == null) ? value :
               remappingFunction.apply(oldValue, value);
    if(newValue == null) {
        remove(key);
    } else {
        put(key, newValue);
    }
    return newValue;
}
```

Method `merge()` trước tiên gọi method `Objects.requireNonNull()` để kiểm tra value có null không.

```java
public static <T> T requireNonNull(T obj) {
    if (obj == null)
        throw new NullPointerException();
    return obj;
}
```

> `Collectors` cũng cung cấp method `toMap()` không cần mergeFunction, nhưng lúc này nếu xảy ra key conflict sẽ throw `duplicateKeyException`. Do đó mạnh mẽ khuyến nghị dùng method `toMap()` phải điền mergeFunction.

## Duyệt Collection

Mô tả trong 《Alibaba Java Development Manual》:

> **Không thực hiện thao tác `remove/add` element trong vòng lặp foreach. Để remove element dùng cách `Iterator`. Nếu thao tác concurrent, cần lock object `Iterator`.**

Thông qua decompile sẽ thấy cú pháp foreach ở tầng dưới thực ra vẫn dựa trên `Iterator`. Tuy nhiên thao tác `remove/add` gọi trực tiếp method của collection bản thân, không phải method `remove/add` của `Iterator`.

Điều này khiến `Iterator` bất ngờ thấy có element bị `remove/add`, rồi nó sẽ throw `ConcurrentModificationException` để thông báo người dùng rằng concurrent modification exception đã xảy ra. Đây là **fail-fast mechanism** trong single-thread.

> **fail-fast mechanism**: Khi nhiều thread modify fail-fast collection, có thể throw `ConcurrentModificationException`. Ngay cả single-thread cũng có thể xảy ra tình huống này như đã đề cập.
>
> Đọc liên quan: [fail-fast là gì](https://www.cnblogs.com/54chensongxia/p/12470446.html).

Từ Java 8, có thể dùng method `Collection#removeIf()` để xóa element thỏa điều kiện cụ thể:

```java
List<Integer> list = new ArrayList<>();
for (int i = 1; i <= 10; ++i) {
    list.add(i);
}
list.removeIf(filter -> filter % 2 == 0); /* Xóa tất cả số chẵn trong list */
System.out.println(list); /* [1, 3, 5, 7, 9] */
```

Ngoài việc dùng trực tiếp `Iterator` để duyệt như đã giới thiệu, còn có thể:

- Dùng vòng lặp for thông thường.
- Dùng các class collection fail-safe. Tất cả class collection trong package `java.util` đều là fail-fast, còn tất cả class trong package `java.util.concurrent` đều là fail-safe.
- ……

## Dedup Collection

Mô tả trong 《Alibaba Java Development Manual》:

> **Có thể tận dụng đặc tính unique element của `Set` để dedup nhanh một collection, tránh dùng `contains()` của `List` để duyệt dedup hoặc kiểm tra contains.**

Dưới đây dùng `HashSet` và `ArrayList` làm ví dụ.

```java
// Ví dụ dedup bằng Set
public static <T> Set<T> removeDuplicateBySet(List<T> data) {

    if (CollectionUtils.isEmpty(data)) {
        return new HashSet<>();
    }
    return new HashSet<>(data);
}

// Ví dụ dedup bằng List
public static <T> List<T> removeDuplicateByList(List<T> data) {

    if (CollectionUtils.isEmpty(data)) {
        return new ArrayList<>();

    }
    List<T> result = new ArrayList<>(data.size());
    for (T current : data) {
        if (!result.contains(current)) {
            result.add(current);
        }
    }
    return result;
}
```

Sự khác biệt cốt lõi giữa hai cách nằm ở triển khai method `contains()`.

Method `contains()` của `HashSet` ở tầng dưới phụ thuộc vào method `containsKey()` của `HashMap`, time complexity xấp xỉ O(1) (O(1) khi không có hash collision).

```java
private transient HashMap<E,Object> map;
public boolean contains(Object o) {
    return map.containsKey(o);
}
```

Chúng ta có N element insert vào Set thì time complexity xấp xỉ O(n).

Method `contains()` của `ArrayList` duyệt qua tất cả element, time complexity xấp xỉ O(n).

```java
public boolean contains(Object o) {
    return indexOf(o) >= 0;
}
public int indexOf(Object o) {
    if (o == null) {
        for (int i = 0; i < size; i++)
            if (elementData[i]==null)
                return i;
    } else {
        for (int i = 0; i < size; i++)
            if (o.equals(elementData[i]))
                return i;
    }
    return -1;
}
```

## Chuyển Collection sang Array

Mô tả trong 《Alibaba Java Development Manual》:

> **Khi dùng method chuyển collection sang array, phải dùng `toArray(T[] array)` của collection, truyền vào array rỗng có kiểu hoàn toàn nhất quán và độ dài 0.**

Tham số của method `toArray(T[] array)` là generic array. Nếu không truyền tham số nào vào `toArray` thì trả về mảng kiểu `Object`.

```java
String [] s= new String[]{
    "dog", "lazy", "a", "over", "jumps", "fox", "brown", "quick", "A"
};
List<String> list = Arrays.asList(s);
Collections.reverse(list);
// Sẽ báo lỗi nếu không chỉ định kiểu
s=list.toArray(new String[0]);
```

Do JVM optimization, `new String[0]` hiện nay được dùng tốt hơn làm tham số của `Collection.toArray()`. `new String[0]` đóng vai trò template, chỉ định kiểu của array trả về. 0 để tiết kiệm space — vì nó chỉ để mô tả kiểu trả về. Chi tiết: <https://shipilev.net/blog/2016/arrays-wisdom-ancients/>

## Chuyển Array sang Collection

Mô tả trong 《Alibaba Java Development Manual》:

> **Khi dùng tool class `Arrays.asList()` để convert array thành collection, không thể dùng các method modify collection. Method `add/remove/clear` của nó sẽ throw `UnsupportedOperationException`.**

Tôi đã gặp pitfall tương tự trong một project trước đây.

`Arrays.asList()` khá phổ biến trong phát triển hàng ngày — có thể dùng nó để convert một array thành `List` collection.

```java
String[] myArray = {"Apple", "Banana", "Orange"};
List<String> myList = Arrays.asList(myArray);
// Hai câu trên tương đương với câu dưới
List<String> myList = Arrays.asList("Apple","Banana", "Orange");
```

Mô tả của JDK source code cho method này:

```java
/**
  * Trả về fixed-size list được backed bởi array được chỉ định. Method này
  * là cầu nối giữa array-based và collection-based API,
  * dùng kết hợp với Collection.toArray(). List trả về là serializable và
  * implement RandomAccess interface.
  */
public static <T> List<T> asList(T... a) {
    return new ArrayList<>(a);
}
```

Dưới đây tổng kết các lưu ý khi dùng.

**1. `Arrays.asList()` là generic method — array truyền vào phải là object array, không phải primitive type.**

```java
int[] myArray = {1, 2, 3};
List myList = Arrays.asList(myArray);
System.out.println(myList.size()); // 1
System.out.println(myList.get(0)); // Địa chỉ của array
System.out.println(myList.get(1)); // Báo lỗi: ArrayIndexOutOfBoundsException
int[] array = (int[]) myList.get(0);
System.out.println(array[0]); // 1
```

Khi truyền vào array kiểu primitive, tham số thực sự mà `Arrays.asList()` nhận được không phải các element trong array mà là bản thân object array! Lúc này `List` có duy nhất một element là array đó — điều này giải thích code trên.

Dùng wrapper type array là giải quyết được vấn đề này.

```java
Integer[] myArray = {1, 2, 3};
```

**2. Dùng các method modify collection: `add()`, `remove()`, `clear()` sẽ throw exception.**

```java
List myList = Arrays.asList(1, 2, 3);
myList.add(4); // Runtime error: UnsupportedOperationException
myList.remove(1); // Runtime error: UnsupportedOperationException
myList.clear(); // Runtime error: UnsupportedOperationException
```

Method `Arrays.asList()` trả về không phải `java.util.ArrayList` mà là inner class của `java.util.Arrays`. Inner class này không implement các method modify của collection hay không override những method đó.

```java
List myList = Arrays.asList(1, 2, 3);
System.out.println(myList.getClass()); // class java.util.Arrays$ArrayList
```

Hình dưới là source code đơn giản của `java.util.Arrays$ArrayList` — có thể thấy class này override những method nào.

```java
  private static class ArrayList<E> extends AbstractList<E>
        implements RandomAccess, java.io.Serializable
    {
        ...

        @Override
        public E get(int index) {
          ...
        }

        @Override
        public E set(int index, E element) {
          ...
        }

        @Override
        public int indexOf(Object o) {
          ...
        }

        @Override
        public boolean contains(Object o) {
           ...
        }

        @Override
        public void forEach(Consumer<? super E> action) {
          ...
        }

        @Override
        public void replaceAll(UnaryOperator<E> operator) {
          ...
        }

        @Override
        public void sort(Comparator<? super E> c) {
          ...
        }
    }
```

Xem tiếp method `add/remove/clear` của `java.util.AbstractList` sẽ hiểu tại sao throw `UnsupportedOperationException`:

```java
public E remove(int index) {
    throw new UnsupportedOperationException();
}
public boolean add(E e) {
    add(size(), e);
    return true;
}
public void add(int index, E element) {
    throw new UnsupportedOperationException();
}

public void clear() {
    removeRange(0, size());
}
protected void removeRange(int fromIndex, int toIndex) {
    ListIterator<E> it = listIterator(fromIndex);
    for (int i=0, n=toIndex-fromIndex; i<n; i++) {
        it.next();
        it.remove();
    }
}
```

**Vậy làm thế nào convert array sang `ArrayList` đúng cách?**

1. Tự triển khai tool class:

```java
// JDK 1.5+
static <T> List<T> arrayToList(final T[] array) {
  final List<T> l = new ArrayList<T>(array.length);

  for (final T s : array) {
    l.add(s);
  }
  return l;
}


Integer [] myArray = { 1, 2, 3 };
System.out.println(arrayToList(myArray).getClass()); // class java.util.ArrayList
```

2. Cách đơn giản nhất:

```java
List list = new ArrayList<>(Arrays.asList("a", "b", "c"))
```

3. Dùng Java 8 `Stream` (khuyến nghị):

```java
Integer [] myArray = { 1, 2, 3 };
List myList = Arrays.stream(myArray).collect(Collectors.toList());
// Primitive type cũng có thể convert (dựa vào thao tác boxing của boxed)
int [] myArray2 = { 1, 2, 3 };
List myList = Arrays.stream(myArray2).boxed().collect(Collectors.toList());
```

4. Dùng Guava:

Với immutable collection, có thể dùng class [`ImmutableList`](https://github.com/google/guava/blob/master/guava/src/com/google/common/collect/ImmutableList.java) và factory method [`of()`](https://github.com/google/guava/blob/master/guava/src/com/google/common/collect/ImmutableList.java#L101) và [`copyOf()`](https://github.com/google/guava/blob/master/guava/src/com/google/common/collect/ImmutableList.java#L225) (tham số không được null):

```java
List<String> il = ImmutableList.of("string", "elements");  // from varargs
List<String> il = ImmutableList.copyOf(aStringArray);      // from array
```

Với mutable collection, có thể dùng class [`Lists`](https://github.com/google/guava/blob/master/guava/src/com/google/common/collect/Lists.java) và factory method [`newArrayList()`](https://github.com/google/guava/blob/master/guava/src/com/google/common/collect/Lists.java#L87):

```java
List<String> l1 = Lists.newArrayList(anotherListOrCollection);    // from collection
List<String> l2 = Lists.newArrayList(aStringArray);               // from array
List<String> l3 = Lists.newArrayList("or", "string", "elements"); // from varargs
```

5. Dùng Apache Commons Collections:

```java
List<String> list = new ArrayList<String>();
CollectionUtils.addAll(list, str);
```

6. Dùng method `List.of()` của Java 9:

```java
Integer[] array = {1, 2, 3};
List<Integer> list = List.of(array);
```
