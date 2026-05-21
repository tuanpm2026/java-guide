---
title: Giải thích chi tiết CAS
description: Phân tích sâu CAS Compare-And-Swap: giải thích chi tiết nguyên lý CAS atomic operation, triển khai lớp Unsafe, vấn đề ABA và giải pháp, cơ chế spin lock, so sánh hiệu năng với pessimistic lock.
category: Java
tag:
  - Java Concurrent
head:
  - - meta
    - name: keywords
      content: CAS,Compare-And-Swap,atomic operation,ABA problem,spin lock,optimistic lock,Unsafe,nguyên lý CAS
---

Để xem giới thiệu về optimistic lock và pessimistic lock cùng các cách triển khai phổ biến của optimistic lock, hãy đọc bài: [Giải thích chi tiết Optimistic Lock và Pessimistic Lock](https://javaguide.cn/java/concurrent/optimistic-lock-and-pessimistic-lock.html).

Bài này chủ yếu giới thiệu: Cách triển khai CAS trong Java và một số vấn đề CAS có thể gặp phải.

## CAS được triển khai như thế nào trong Java?

Trong Java, một lớp quan trọng để triển khai thao tác CAS (Compare-And-Swap — So sánh và Hoán đổi) là `Unsafe`.

Lớp `Unsafe` nằm trong package `sun.misc`, là lớp cung cấp các thao tác low-level, không an toàn. Do tính năng mạnh mẽ và nguy hiểm tiềm ẩn, nó thường được dùng trong JVM nội bộ hoặc một số thư viện cần hiệu năng cực cao và truy cập low-level, không khuyến nghị developer thông thường dùng trong ứng dụng. Xem bài này để biết thêm chi tiết về lớp `Unsafe`: 📌[Giải thích chi tiết Java magic class Unsafe](https://javaguide.cn/java/basis/unsafe.html).

Lớp `Unsafe` trong package `sun.misc` cung cấp các method `compareAndSwapObject`, `compareAndSwapInt`, `compareAndSwapLong` để triển khai thao tác CAS trên kiểu `Object`, `int`, `long`:

```java
/**
 * Cập nhật nguyên tử giá trị field của object.
 *
 * @param o        Object cần thao tác
 * @param offset   Memory offset của field trong object
 * @param expected Giá trị cũ kỳ vọng
 * @param x        Giá trị mới cần đặt
 * @return true nếu giá trị được cập nhật thành công; ngược lại false
 */
boolean compareAndSwapObject(Object o, long offset, Object expected, Object x);

/**
 * Cập nhật nguyên tử giá trị field kiểu int của object.
 */
boolean compareAndSwapInt(Object o, long offset, int expected, int x);

/**
 * Cập nhật nguyên tử giá trị field kiểu long của object.
 */
boolean compareAndSwapLong(Object o, long offset, long expected, long x);
```

Các method CAS trong lớp `Unsafe` là `native` method. Từ khóa `native` cho biết các method này được triển khai bằng native code (thường là C hoặc C++), không phải Java. Các method này gọi trực tiếp hardware instruction ở tầng dưới để thực hiện atomic operation. Tức là Java không trực tiếp triển khai CAS bằng Java.

Nói chính xác hơn, CAS trong Java được triển khai dưới dạng C++ inline assembly, được gọi thông qua JNI (Java Native Interface). Do đó, triển khai cụ thể của CAS gắn chặt với hệ điều hành và CPU.

Package `java.util.concurrent.atomic` cung cấp một số lớp dùng cho atomic operation.

![Tổng quan JUC atomic classes](https://oss.javaguide.cn/github/javaguide/java/JUC%E5%8E%9F%E5%AD%90%E7%B1%BB%E6%A6%82%E8%A7%88.png)

Để xem giới thiệu và cách dùng các lớp Atomic, đọc bài: [Tổng hợp Atomic atomic classes](https://javaguide.cn/java/concurrent/atomic-classes.html).

Các lớp Atomic dựa vào CAS optimistic lock để đảm bảo tính nguyên tử của các method, không cần dùng cơ chế lock truyền thống (như `synchronized` block hay `ReentrantLock`).

`AtomicInteger` là một trong các lớp atomic của Java, chủ yếu dùng cho atomic operation trên biến kiểu `int`. Nó dùng các method atomic operation low-level do lớp `Unsafe` cung cấp để đạt thread safety không cần lock.

Dưới đây, chúng ta phân tích source code cốt lõi của `AtomicInteger` (JDK 1.8) để giải thích cách Java dùng các method của lớp `Unsafe` để triển khai atomic operation.

Source code cốt lõi của `AtomicInteger`:

```java
// Lấy instance Unsafe
private static final Unsafe unsafe = Unsafe.getUnsafe();
private static final long valueOffset;

static {
    try {
        // Lấy memory offset của field "value" trong class AtomicInteger
        valueOffset = unsafe.objectFieldOffset
            (AtomicInteger.class.getDeclaredField("value"));
    } catch (Exception ex) { throw new Error(ex); }
}
// Đảm bảo visibility của field "value"
private volatile int value;

// Nguyên tử đặt giá trị thành newValue nếu giá trị hiện tại bằng expected
// Dùng Unsafe#compareAndSwapInt để thực hiện CAS
public final boolean compareAndSet(int expect, int update) {
    return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
}

// Nguyên tử cộng delta vào giá trị hiện tại và trả về giá trị cũ
public final int getAndAdd(int delta) {
    return unsafe.getAndAddInt(this, valueOffset, delta);
}

// Nguyên tử cộng 1 vào giá trị hiện tại và trả về giá trị trước khi cộng (giá trị cũ)
// Dùng Unsafe#getAndAddInt để thực hiện CAS
public final int getAndIncrement() {
    return unsafe.getAndAddInt(this, valueOffset, 1);
}

// Nguyên tử trừ 1 khỏi giá trị hiện tại và trả về giá trị trước khi trừ (giá trị cũ)
public final int getAndDecrement() {
    return unsafe.getAndAddInt(this, valueOffset, -1);
}
```

Source code của `Unsafe#getAndAddInt`:

```java
// Nguyên tử lấy và tăng giá trị integer
public final int getAndAddInt(Object o, long offset, int delta) {
    int v;
    do {
        // Lấy giá trị integer tại memory offset của object o theo kiểu volatile
        v = getIntVolatile(o, offset);
    } while (!compareAndSwapInt(o, offset, v, v + delta));
    // Trả về giá trị cũ
    return v;
}
```

Có thể thấy, `getAndAddInt` dùng vòng lặp `do-while`: khi `compareAndSwapInt` thất bại sẽ liên tục retry cho đến khi thành công. Tức là, method `getAndAddInt` thông qua `compareAndSwapInt` để cố gắng cập nhật giá trị `value`. Nếu cập nhật thất bại (giá trị hiện tại bị thread khác sửa trong khoảng thời gian này), nó sẽ lấy lại giá trị hiện tại và thử cập nhật lại, cho đến khi thao tác thành công.

Vì thao tác CAS có thể thất bại do xung đột concurrency, thường dùng kết hợp với vòng lặp `while` — retry liên tục sau thất bại cho đến khi thành công. Đây chính là **cơ chế spin lock**.

## CAS algorithm có những vấn đề gì?

ABA problem là vấn đề phổ biến nhất của CAS algorithm.

### ABA Problem

Nếu một biến V lần đầu đọc có giá trị A, và khi chuẩn bị gán giá trị mới thì kiểm tra vẫn thấy A, liệu chúng ta có thể nói giá trị của nó chưa bị thread khác sửa đổi không? Rõ ràng là không thể, vì trong khoảng thời gian đó giá trị có thể đã bị đổi sang giá trị khác rồi đổi lại A, khi đó thao tác CAS sẽ nhầm tưởng nó chưa bao giờ bị sửa đổi. Vấn đề này gọi là **"ABA" problem của CAS**.

Cách giải quyết ABA problem là thêm **version number hoặc timestamp** trước biến. Lớp `AtomicStampedReference` từ JDK 1.5 trở đi dùng để giải quyết ABA problem. Method `compareAndSet()` trong đó trước tiên kiểm tra current reference có bằng expected reference không, và current stamp có bằng expected stamp không. Nếu tất cả bằng nhau thì nguyên tử đặt giá trị reference và stamp thành giá trị update được cho.

```java
public boolean compareAndSet(V   expectedReference,
                             V   newReference,
                             int expectedStamp,
                             int newStamp) {
    Pair<V> current = pair;
    return
        expectedReference == current.reference &&
        expectedStamp == current.stamp &&
        ((newReference == current.reference &&
          newStamp == current.stamp) ||
         casPair(current, Pair.of(newReference, newStamp)));
}
```

### Vòng lặp dài, overhead lớn

CAS thường dùng spin operation để retry — không thành công thì tiếp tục loop cho đến thành công. Nếu lâu không thành công, sẽ gây overhead thực thi rất lớn cho CPU.

Nếu JVM có thể hỗ trợ lệnh `pause` do processor cung cấp, hiệu quả của spin operation sẽ được cải thiện. Lệnh `pause` có hai tác dụng quan trọng:

1. **Trì hoãn thực thi pipeline instruction**: Lệnh `pause` có thể trì hoãn thực thi instruction, từ đó giảm tiêu thụ tài nguyên CPU. Thời gian trì hoãn cụ thể phụ thuộc vào phiên bản triển khai của processor, trên một số processor thời gian trì hoãn có thể bằng 0.
2. **Tránh memory order conflict**: Khi thoát vòng lặp, lệnh `pause` có thể tránh CPU pipeline bị xóa do memory order conflict, từ đó tăng hiệu quả thực thi CPU.

### Chỉ có thể đảm bảo atomic operation trên một shared variable

CAS chỉ hiệu quả với single shared variable. Khi cần thao tác nhiều shared variable, CAS không đủ khả năng. Tuy nhiên, từ JDK 1.5, Java cung cấp lớp `AtomicReference`, cho phép đảm bảo tính nguyên tử giữa các reference object. Bằng cách đóng gói nhiều biến trong một object, chúng ta có thể dùng `AtomicReference` để thực hiện thao tác CAS.

Ngoài cách dùng `AtomicReference`, cũng có thể dùng lock để đảm bảo.

## Tổng kết

Trong Java, CAS được triển khai thông qua các `native` method trong lớp `Unsafe`. Các method này gọi hardware instruction ở tầng dưới để thực hiện atomic operation. Vì triển khai của nó phụ thuộc vào C++ inline assembly và JNI call, triển khai cụ thể của CAS gắn chặt với hệ điều hành và CPU.

CAS tuy có đặc tính lock-free hiệu quả, nhưng cũng cần chú ý đến các vấn đề như ABA, vòng lặp dài overhead lớn, v.v.
