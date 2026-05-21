---
title: Tổng kết các lớp Atomic
description: "Giải thích chi tiết các lớp Atomic trong Java: tổng quan hệ thống lớp Atomic trong gói JUC, các lớp thường dùng như AtomicInteger/AtomicLong/AtomicReference, cơ chế an toàn luồng dựa trên CAS, trường hợp sử dụng và ưu điểm về hiệu năng."
category: Java
tag:
  - Java Concurrency
head:
  - - meta
    - name: keywords
      content: Atomic原子类,AtomicInteger,AtomicLong,AtomicReference,CAS原子操作,JUC并发包,原子类使用
---

## Giới thiệu về các lớp Atomic

`Atomic` dịch sang tiếng Việt có nghĩa là "nguyên tử". Trong hóa học, nguyên tử là đơn vị nhỏ nhất cấu thành vật chất và không thể bị phân chia trong các phản ứng hóa học. Trong lập trình, `Atomic` chỉ một thao tác có tính nguyên tử, tức là thao tác đó không thể bị chia nhỏ hay gián đoạn. Dù có nhiều luồng cùng thực thi, thao tác đó hoặc được thực hiện hoàn toàn, hoặc không thực hiện gì cả — các luồng khác sẽ không bao giờ thấy trạng thái thực hiện dở dang.

Nói đơn giản, lớp nguyên tử là các lớp có đặc tính thao tác nguyên tử.

Các lớp `Atomic` trong gói `java.util.concurrent.atomic` cung cấp một cách an toàn luồng để thao tác trên từng biến đơn lẻ.

Các lớp `Atomic` dựa vào khóa lạc quan CAS (Compare-And-Swap, so sánh và hoán đổi) để đảm bảo tính nguyên tử của các phương thức, thay vì phải sử dụng cơ chế khóa truyền thống (như khối `synchronized` hay `ReentrantLock`).

Bài viết này chỉ giới thiệu khái niệm về các lớp Atomic. Để tìm hiểu nguyên lý triển khai cụ thể, bạn có thể đọc bài viết này của tác giả: [Giải thích chi tiết về CAS](./cas.md).

![Tổng quan các lớp Atomic trong JUC](/images/github/javaguide/java/JUC%E5%8E%9F%E5%AD%90%E7%B1%BB%E6%A6%82%E8%A7%88.png)

Dựa theo kiểu dữ liệu được thao tác, các lớp nguyên tử trong gói JUC có thể được chia thành 4 loại:

**1、Kiểu cơ bản (Primitive Types)**

Cập nhật kiểu cơ bản theo cách nguyên tử

- `AtomicInteger`: Lớp nguyên tử kiểu số nguyên (int)
- `AtomicLong`: Lớp nguyên tử kiểu số nguyên dài (long)
- `AtomicBoolean`: Lớp nguyên tử kiểu boolean

**2、Kiểu mảng (Array Types)**

Cập nhật một phần tử trong mảng theo cách nguyên tử

- `AtomicIntegerArray`: Lớp nguyên tử mảng số nguyên
- `AtomicLongArray`: Lớp nguyên tử mảng số nguyên dài
- `AtomicReferenceArray`: Lớp nguyên tử mảng kiểu tham chiếu

**3、Kiểu tham chiếu (Reference Types)**

- `AtomicReference`: Lớp nguyên tử kiểu tham chiếu
- `AtomicMarkableReference`: Lớp nguyên tử cập nhật kiểu tham chiếu kèm nhãn đánh dấu. Lớp này liên kết nhãn boolean với tham chiếu, ~~cũng có thể giải quyết vấn đề ABA có thể xảy ra khi dùng CAS để cập nhật nguyên tử~~.
- `AtomicStampedReference`: Lớp nguyên tử cập nhật kiểu tham chiếu kèm số phiên bản. Lớp này liên kết giá trị số nguyên với tham chiếu, có thể dùng để cập nhật nguyên tử dữ liệu và số phiên bản của dữ liệu, giải quyết vấn đề ABA có thể xảy ra khi dùng CAS để cập nhật nguyên tử.

**🐛 Đính chính (tham khảo: [issue#626](https://github.com/Snailclimb/JavaGuide/issues/626))** : `AtomicMarkableReference` không thể giải quyết vấn đề ABA.

**4、Kiểu cập nhật thuộc tính đối tượng (Object Field Updater Types)**

- `AtomicIntegerFieldUpdater`: Bộ cập nhật nguyên tử cho trường kiểu số nguyên
- `AtomicLongFieldUpdater`: Bộ cập nhật nguyên tử cho trường kiểu số nguyên dài
- `AtomicReferenceFieldUpdater`: Bộ cập nhật nguyên tử cho trường trong kiểu tham chiếu

## Lớp nguyên tử kiểu cơ bản

Cập nhật kiểu cơ bản theo cách nguyên tử

- `AtomicInteger`: Lớp nguyên tử kiểu số nguyên (int)
- `AtomicLong`: Lớp nguyên tử kiểu số nguyên dài (long)
- `AtomicBoolean`: Lớp nguyên tử kiểu boolean

Ba lớp trên cung cấp các phương thức gần như giống nhau, vì vậy ở đây chúng ta lấy `AtomicInteger` làm ví dụ để giới thiệu.

**Các phương thức thường dùng của lớp `AtomicInteger`**:

```java
public final int get() //获取当前的值
public final int getAndSet(int newValue)//获取当前的值，并设置新的值
public final int getAndIncrement()//获取当前的值，并自增
public final int getAndDecrement() //获取当前的值，并自减
public final int getAndAdd(int delta) //获取当前的值，并加上预期的值
boolean compareAndSet(int expect, int update) //如果输入的数值等于预期值，则以原子方式将该值设置为输入值（update）
public final void lazySet(int newValue)//最终设置为newValue, lazySet 提供了一种比 set 方法更弱的语义，可能导致其他线程在之后的一小段时间内还是可以读到旧的值，但可能更高效。
```

**Ví dụ sử dụng lớp `AtomicInteger`**:

```java
// 初始化 AtomicInteger 对象，初始值为 0
AtomicInteger atomicInt = new AtomicInteger(0);

// 使用 getAndSet 方法获取当前值，并设置新值为 3
int tempValue = atomicInt.getAndSet(3);
System.out.println("tempValue: " + tempValue + "; atomicInt: " + atomicInt);

// 使用 getAndIncrement 方法获取当前值，并自增 1
tempValue = atomicInt.getAndIncrement();
System.out.println("tempValue: " + tempValue + "; atomicInt: " + atomicInt);

// 使用 getAndAdd 方法获取当前值，并增加指定值 5
tempValue = atomicInt.getAndAdd(5);
System.out.println("tempValue: " + tempValue + "; atomicInt: " + atomicInt);

// 使用 compareAndSet 方法进行原子性条件更新，期望值为 9，更新值为 10
boolean updateSuccess = atomicInt.compareAndSet(9, 10);
System.out.println("Update Success: " + updateSuccess + "; atomicInt: " + atomicInt);

// 获取当前值
int currentValue = atomicInt.get();
System.out.println("Current value: " + currentValue);

// 使用 lazySet 方法设置新值为 15
atomicInt.lazySet(15);
System.out.println("After lazySet, atomicInt: " + atomicInt);
```

Kết quả đầu ra:

```java
tempValue: 0; atomicInt: 3
tempValue: 3; atomicInt: 4
tempValue: 4; atomicInt: 9
Update Success: true; atomicInt: 10
Current value: 10
After lazySet, atomicInt: 15
```

## Lớp nguyên tử kiểu mảng

Cập nhật một phần tử trong mảng theo cách nguyên tử

- `AtomicIntegerArray`: Lớp nguyên tử mảng số nguyên
- `AtomicLongArray`: Lớp nguyên tử mảng số nguyên dài
- `AtomicReferenceArray`: Lớp nguyên tử mảng kiểu tham chiếu

Ba lớp trên cung cấp các phương thức gần như giống nhau, vì vậy ở đây chúng ta lấy `AtomicIntegerArray` làm ví dụ để giới thiệu.

**Các phương thức thường dùng của lớp `AtomicIntegerArray`**:

```java
public final int get(int i) //获取 index=i 位置元素的值
public final int getAndSet(int i, int newValue)//返回 index=i 位置的当前的值，并将其设置为新值：newValue
public final int getAndIncrement(int i)//获取 index=i 位置元素的值，并让该位置的元素自增
public final int getAndDecrement(int i) //获取 index=i 位置元素的值，并让该位置的元素自减
public final int getAndAdd(int i, int delta) //获取 index=i 位置元素的值，并加上预期的值
boolean compareAndSet(int i, int expect, int update) //如果输入的数值等于预期值，则以原子方式将 index=i 位置的元素值设置为输入值（update）
public final void lazySet(int i, int newValue)//最终 将index=i 位置的元素设置为newValue,使用 lazySet 设置之后可能导致其他线程在之后的一小段时间内还是可以读到旧的值。
```

**Ví dụ sử dụng lớp `AtomicIntegerArray`**:

```java
int[] nums = {1, 2, 3, 4, 5, 6};
// 创建 AtomicIntegerArray
AtomicIntegerArray atomicArray = new AtomicIntegerArray(nums);

// 打印 AtomicIntegerArray 中的初始值
System.out.println("Initial values in AtomicIntegerArray:");
for (int j = 0; j < nums.length; j++) {
    System.out.print("Index " + j + ": " + atomicArray.get(j) + " ");
}

// 使用 getAndSet 方法将索引 0 处的值设置为 2，并返回旧值
int tempValue = atomicArray.getAndSet(0, 2);
System.out.println("\nAfter getAndSet(0, 2):");
System.out.println("Returned value: " + tempValue);
for (int j = 0; j < atomicArray.length(); j++) {
    System.out.print("Index " + j + ": " + atomicArray.get(j) + " ");
}

// 使用 getAndIncrement 方法将索引 0 处的值加 1，并返回旧值
tempValue = atomicArray.getAndIncrement(0);
System.out.println("\nAfter getAndIncrement(0):");
System.out.println("Returned value: " + tempValue);
for (int j = 0; j < atomicArray.length(); j++) {
    System.out.print("Index " + j + ": " + atomicArray.get(j) + " ");
}

// 使用 getAndAdd 方法将索引 0 处的值增加 5，并返回旧值
tempValue = atomicArray.getAndAdd(0, 5);
System.out.println("\nAfter getAndAdd(0, 5):");
System.out.println("Returned value: " + tempValue);
for (int j = 0; j < atomicArray.length(); j++) {
    System.out.print("Index " + j + ": " + atomicArray.get(j) + " ");
}
```

Kết quả đầu ra:

```plain
Initial values in AtomicIntegerArray:
Index 0: 1 Index 1: 2 Index 2: 3 Index 3: 4 Index 4: 5 Index 5: 6
After getAndSet(0, 2):
Returned value: 1
Index 0: 2 Index 1: 2 Index 2: 3 Index 3: 4 Index 4: 5 Index 5: 6
After getAndIncrement(0):
Returned value: 2
Index 0: 3 Index 1: 2 Index 2: 3 Index 3: 4 Index 4: 5 Index 5: 6
After getAndAdd(0, 5):
Returned value: 3
Index 0: 8 Index 1: 2 Index 2: 3 Index 3: 4 Index 4: 5 Index 5: 6
```

## Lớp nguyên tử kiểu tham chiếu

Lớp nguyên tử kiểu cơ bản chỉ có thể cập nhật một biến. Nếu cần cập nhật nguyên tử nhiều biến, cần sử dụng lớp nguyên tử kiểu tham chiếu.

- `AtomicReference`: Lớp nguyên tử kiểu tham chiếu
- `AtomicStampedReference`: Lớp nguyên tử cập nhật kiểu tham chiếu kèm số phiên bản. Lớp này liên kết giá trị số nguyên với tham chiếu, có thể dùng để cập nhật nguyên tử dữ liệu và số phiên bản của dữ liệu, giải quyết vấn đề ABA có thể xảy ra khi dùng CAS để cập nhật nguyên tử.
- `AtomicMarkableReference`: Lớp nguyên tử cập nhật kiểu tham chiếu kèm nhãn đánh dấu. Lớp này liên kết nhãn boolean với tham chiếu, ~~cũng có thể giải quyết vấn đề ABA có thể xảy ra khi dùng CAS để cập nhật nguyên tử.~~

Ba lớp trên cung cấp các phương thức gần như giống nhau, vì vậy ở đây chúng ta lấy `AtomicReference` làm ví dụ để giới thiệu.

**Ví dụ sử dụng lớp `AtomicReference`**:

```java
// Person 类
class Person {
    private String name;
    private int age;
    //省略getter/setter和toString
}


// 创建 AtomicReference 对象并设置初始值
AtomicReference<Person> ar = new AtomicReference<>(new Person("SnailClimb", 22));

// 打印初始值
System.out.println("Initial Person: " + ar.get().toString());

// 更新值
Person updatePerson = new Person("Daisy", 20);
ar.compareAndSet(ar.get(), updatePerson);

// 打印更新后的值
System.out.println("Updated Person: " + ar.get().toString());

// 尝试再次更新
Person anotherUpdatePerson = new Person("John", 30);
boolean isUpdated = ar.compareAndSet(updatePerson, anotherUpdatePerson);

// 打印是否更新成功及最终值
System.out.println("Second Update Success: " + isUpdated);
System.out.println("Final Person: " + ar.get().toString());
```

Kết quả đầu ra:

```plain
Initial Person: Person{name='SnailClimb', age=22}
Updated Person: Person{name='Daisy', age=20}
Second Update Success: true
Final Person: Person{name='John', age=30}
```

**Ví dụ sử dụng lớp `AtomicStampedReference`**:

```java
// 创建一个 AtomicStampedReference 对象，初始值为 "SnailClimb"，初始版本号为 1
AtomicStampedReference<String> asr = new AtomicStampedReference<>("SnailClimb", 1);

// 打印初始值和版本号
int[] initialStamp = new int[1];
String initialRef = asr.get(initialStamp);
System.out.println("Initial Reference: " + initialRef + ", Initial Stamp: " + initialStamp[0]);

// 更新值和版本号
int oldStamp = initialStamp[0];
String oldRef = initialRef;
String newRef = "Daisy";
int newStamp = oldStamp + 1;

boolean isUpdated = asr.compareAndSet(oldRef, newRef, oldStamp, newStamp);
System.out.println("Update Success: " + isUpdated);

// 打印更新后的值和版本号
int[] updatedStamp = new int[1];
String updatedRef = asr.get(updatedStamp);
System.out.println("Updated Reference: " + updatedRef + ", Updated Stamp: " + updatedStamp[0]);

// 尝试用错误的版本号更新
boolean isUpdatedWithWrongStamp = asr.compareAndSet(newRef, "John", oldStamp, newStamp + 1);
System.out.println("Update with Wrong Stamp Success: " + isUpdatedWithWrongStamp);

// 打印最终的值和版本号
int[] finalStamp = new int[1];
String finalRef = asr.get(finalStamp);
System.out.println("Final Reference: " + finalRef + ", Final Stamp: " + finalStamp[0]);
```

Kết quả đầu ra:

```plain
Initial Reference: SnailClimb, Initial Stamp: 1
Update Success: true
Updated Reference: Daisy, Updated Stamp: 2
Update with Wrong Stamp Success: false
Final Reference: Daisy, Final Stamp: 2
```

**Ví dụ sử dụng lớp `AtomicMarkableReference`**:

```java
// 创建一个 AtomicMarkableReference 对象，初始值为 "SnailClimb"，初始标记为 false
AtomicMarkableReference<String> amr = new AtomicMarkableReference<>("SnailClimb", false);

// 打印初始值和标记
boolean[] initialMark = new boolean[1];
String initialRef = amr.get(initialMark);
System.out.println("Initial Reference: " + initialRef + ", Initial Mark: " + initialMark[0]);

// 更新值和标记
String oldRef = initialRef;
String newRef = "Daisy";
boolean oldMark = initialMark[0];
boolean newMark = true;

boolean isUpdated = amr.compareAndSet(oldRef, newRef, oldMark, newMark);
System.out.println("Update Success: " + isUpdated);

// 打印更新后的值和标记
boolean[] updatedMark = new boolean[1];
String updatedRef = amr.get(updatedMark);
System.out.println("Updated Reference: " + updatedRef + ", Updated Mark: " + updatedMark[0]);

// 尝试用错误的标记更新
boolean isUpdatedWithWrongMark = amr.compareAndSet(newRef, "John", oldMark, !newMark);
System.out.println("Update with Wrong Mark Success: " + isUpdatedWithWrongMark);

// 打印最终的值和标记
boolean[] finalMark = new boolean[1];
String finalRef = amr.get(finalMark);
System.out.println("Final Reference: " + finalRef + ", Final Mark: " + finalMark[0]);
```

Kết quả đầu ra:

```plain
Initial Reference: SnailClimb, Initial Mark: false
Update Success: true
Updated Reference: Daisy, Updated Mark: true
Update with Wrong Mark Success: false
Final Reference: Daisy, Final Mark: true
```

## Lớp nguyên tử kiểu cập nhật thuộc tính đối tượng

Khi cần cập nhật nguyên tử một trường nào đó trong một lớp, cần dùng đến lớp nguyên tử kiểu cập nhật thuộc tính đối tượng.

- `AtomicIntegerFieldUpdater`: Bộ cập nhật nguyên tử cho trường kiểu số nguyên
- `AtomicLongFieldUpdater`: Bộ cập nhật nguyên tử cho trường kiểu số nguyên dài
- `AtomicReferenceFieldUpdater`: Bộ cập nhật nguyên tử cho trường trong kiểu tham chiếu

Để cập nhật nguyên tử thuộc tính của đối tượng cần thực hiện hai bước. Bước thứ nhất, vì tất cả các lớp nguyên tử kiểu cập nhật thuộc tính đối tượng đều là lớp trừu tượng, nên mỗi lần sử dụng phải dùng phương thức tĩnh `newUpdater()` để tạo một bộ cập nhật, đồng thời cần chỉ định lớp và thuộc tính muốn cập nhật. Bước thứ hai, thuộc tính của đối tượng cần được cập nhật phải được khai báo với modifier `volatile int`.

Ba lớp trên cung cấp các phương thức gần như giống nhau, vì vậy ở đây chúng ta lấy `AtomicIntegerFieldUpdater` làm ví dụ để giới thiệu.

**Ví dụ sử dụng lớp `AtomicIntegerFieldUpdater`**:

```java
// Person 类
class Person {
    private String name;
    // 要使用 AtomicIntegerFieldUpdater，字段必须是 volatile int
    volatile int age;
    //省略getter/setter和toString
}

// 创建 AtomicIntegerFieldUpdater 对象
AtomicIntegerFieldUpdater<Person> ageUpdater = AtomicIntegerFieldUpdater.newUpdater(Person.class, "age");

// 创建 Person 对象
Person person = new Person("SnailClimb", 22);

// 打印初始值
System.out.println("Initial Person: " + person);

// 更新 age 字段
ageUpdater.incrementAndGet(person); // 自增
System.out.println("After Increment: " + person);

ageUpdater.addAndGet(person, 5); // 增加 5
System.out.println("After Adding 5: " + person);

ageUpdater.compareAndSet(person, 28, 30); // 如果当前值是 28，则设置为 30
System.out.println("After Compare and Set (28 to 30): " + person);

// 尝试使用错误的比较值进行更新
boolean isUpdated = ageUpdater.compareAndSet(person, 28, 35); // 这次应该失败
System.out.println("Compare and Set (28 to 35) Success: " + isUpdated);
System.out.println("Final Person: " + person);
```

Kết quả đầu ra:

```plain
Initial Person: Name: SnailClimb, Age: 22
After Increment: Name: SnailClimb, Age: 23
After Adding 5: Name: SnailClimb, Age: 28
After Compare and Set (28 to 30): Name: SnailClimb, Age: 30
Compare and Set (28 to 35) Success: false
Final Person: Name: SnailClimb, Age: 30
```

## Tài liệu tham khảo

- 《Nghệ thuật lập trình đồng thời Java》

<!-- @include: @article-footer.snippet.md -->
