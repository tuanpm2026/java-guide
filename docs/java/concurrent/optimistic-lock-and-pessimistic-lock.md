---
title: Giải thích chi tiết Optimistic Lock và Pessimistic Lock
description: "So sánh sâu Optimistic Lock và Pessimistic Lock: giải thích chi tiết triển khai pessimistic lock bằng synchronized/ReentrantLock, cơ chế CAS/version number của optimistic lock, phân tích tình huống sử dụng, so sánh hiệu năng và gợi ý lựa chọn."
category: Java
tag:
  - Java Concurrent
head:
  - - meta
    - name: keywords
      content: optimistic lock,pessimistic lock,synchronized,ReentrantLock,CAS,version number mechanism,kiểm soát concurrency,tối ưu lock
---

Nếu chiếu Pessimistic Lock và Optimistic Lock vào cuộc sống thực tế: Pessimistic Lock giống như một người bi quan (hay còn gọi là cẩn thận), luôn giả định tình huống xấu nhất để tránh vấn đề xảy ra. Optimistic Lock giống như một người lạc quan, luôn giả định tình huống tốt nhất và giải quyết vấn đề nhanh chóng trước khi nó xảy ra.

## Pessimistic Lock là gì?

Pessimistic Lock luôn giả định tình huống xấu nhất, cho rằng mỗi lần shared resource được truy cập sẽ xảy ra vấn đề (ví dụ dữ liệu chia sẻ bị sửa đổi), nên mỗi lần thực hiện thao tác lấy resource đều sẽ lock. Các thread khác muốn lấy resource này sẽ bị block cho đến khi lock được người giữ trước đó release. Tức là **shared resource mỗi lần chỉ cho một thread dùng, các thread khác block, dùng xong thì chuyển resource cho thread khác**.

Các exclusive lock như `synchronized` và `ReentrantLock` trong Java chính là triển khai của tư tưởng pessimistic lock.

```java
public void performSynchronisedTask() {
    synchronized (this) {
        // Thao tác cần đồng bộ
    }
}

private Lock lock = new ReentrantLock();
lock.lock();
try {
   // Thao tác cần đồng bộ
} finally {
    lock.unlock();
}
```

Trong tình huống high concurrency, cạnh tranh lock kịch liệt sẽ gây block thread. Nhiều thread bị block sẽ dẫn đến context switching của hệ thống, tăng overhead hiệu năng. Ngoài ra, pessimistic lock còn có thể gây ra deadlock (khi thread lấy lock theo thứ tự không đúng), ảnh hưởng đến hoạt động bình thường của code.

## Optimistic Lock là gì?

Optimistic Lock luôn giả định tình huống tốt nhất, cho rằng mỗi lần shared resource được truy cập sẽ không xảy ra vấn đề, thread có thể thực thi liên tục mà không cần lock và không cần chờ. Chỉ khi commit sửa đổi mới kiểm tra xem resource (tức dữ liệu) có bị thread khác sửa đổi không (phương pháp cụ thể có thể dùng version number mechanism hoặc CAS algorithm).

Trong Java, các lớp atomic variable trong package `java.util.concurrent.atomic` (ví dụ `AtomicInteger`, `LongAdder`) dùng một cách triển khai của optimistic lock là **CAS**.

![Tổng quan JUC atomic classes](/images/github/javaguide/java/JUC%E5%8E%9F%E5%AD%90%E7%B1%BB%E6%A6%82%E8%A7%88-20230814005211968.png)

```java
// LongAdder hiệu năng tốt hơn AtomicInteger và AtomicLong trong tình huống high concurrency
// Chi phí là tiêu tốn nhiều bộ nhớ hơn (đánh đổi không gian lấy thời gian)
LongAdder sum = new LongAdder();
sum.increment();
```

Trong tình huống high concurrency, so với pessimistic lock, optimistic lock không có lock contention gây block thread, cũng không có vấn đề deadlock, hiệu năng thường tốt hơn một bậc. Tuy nhiên, nếu xung đột xảy ra thường xuyên (trường hợp write chiếm tỷ lệ rất cao), sẽ thường xuyên fail và retry, điều này cũng ảnh hưởng đáng kể đến hiệu năng, khiến CPU tăng đột biến.

Vấn đề fail-retry nhiều lần cũng có thể giải quyết được. Như `LongAdder` đã đề cập trước đó dùng cách đánh đổi không gian lấy thời gian để giải quyết vấn đề này.

Về lý thuyết:

- Pessimistic lock thường dùng nhiều hơn trong trường hợp write nhiều (many-write scenario, cạnh tranh kịch liệt), như vậy tránh được việc fail và retry liên tục ảnh hưởng hiệu năng. Chi phí của pessimistic lock là cố định. Tuy nhiên, nếu optimistic lock giải quyết được vấn đề fail và retry thường xuyên (như `LongAdder`), cũng có thể cân nhắc dùng optimistic lock, tùy tình huống cụ thể.
- Optimistic lock thường dùng nhiều hơn trong trường hợp write ít (many-read scenario, ít cạnh tranh), như vậy tránh được việc lock liên tục ảnh hưởng hiệu năng. Tuy nhiên, optimistic lock chủ yếu nhắm vào đối tượng là single shared variable (tham khảo các lớp atomic variable trong package `java.util.concurrent.atomic`).

## Cách triển khai Optimistic Lock?

Optimistic lock thường dùng version number mechanism hoặc CAS algorithm. CAS algorithm được dùng nhiều hơn, cần đặc biệt chú ý đến điều này.

### Version number mechanism

Thường thêm một trường `version` (số phiên bản dữ liệu) vào bảng dữ liệu, biểu thị số lần dữ liệu bị sửa đổi. Khi dữ liệu bị sửa đổi, giá trị `version` tăng thêm 1. Khi thread A muốn cập nhật giá trị dữ liệu, đọc dữ liệu đồng thời cũng đọc giá trị `version`. Khi submit cập nhật, chỉ cập nhật nếu giá trị version vừa đọc bằng giá trị `version` hiện tại trong database, ngược lại retry thao tác cập nhật cho đến khi thành công.

**Ví dụ đơn giản**: Giả sử trong bảng thông tin tài khoản có trường version với giá trị hiện tại là 1; số dư tài khoản (`balance`) hiện tại là $100.

1. Nhân viên A đọc ra (version=1) và trừ $50 từ số dư tài khoản ($100 - $50).
2. Trong quá trình nhân viên A thao tác, nhân viên B cũng đọc thông tin người dùng này (version=1) và trừ $20 ($100 - $20).
3. Nhân viên A hoàn thành sửa đổi, gửi số phiên bản (version=1) cùng số dư sau khi trừ (balance=$50) lên database cập nhật. Vì phiên bản submit bằng phiên bản hiện tại trong database, dữ liệu được cập nhật, database ghi lại version cập nhật thành 2.
4. Nhân viên B hoàn thành thao tác, cũng cố gắng gửi số phiên bản (version=1) lên database cập nhật (balance=$80), nhưng so sánh với phiên bản hiện tại thì version submit là 1 trong khi version hiện tại trong database là 2, không thỏa mãn chiến lược optimistic lock "phiên bản submit phải bằng phiên bản hiện tại mới được cập nhật", do đó submit của nhân viên B bị từ chối.

Như vậy tránh được khả năng kết quả sửa đổi dựa trên dữ liệu cũ version=1 của nhân viên B ghi đè lên kết quả thao tác của nhân viên A.

### CAS algorithm

CAS là viết tắt của **Compare And Swap (So sánh và Hoán đổi)**, dùng để triển khai optimistic lock, được ứng dụng rộng rãi trong nhiều framework. Ý tưởng của CAS rất đơn giản: dùng một expected value và biến muốn cập nhật để so sánh, chỉ cập nhật khi hai giá trị bằng nhau.

CAS là một atomic operation, phụ thuộc vào một lệnh atomic của CPU.

> **Atomic operation** là thao tác nhỏ nhất không thể chia nhỏ hơn, tức là thao tác một khi bắt đầu không thể bị gián đoạn cho đến khi hoàn thành.

CAS liên quan đến ba operand:

- **V**: Giá trị biến cần cập nhật (Var)
- **E**: Giá trị kỳ vọng (Expected)
- **N**: Giá trị mới muốn ghi (New)

Khi và chỉ khi giá trị V bằng E, CAS mới dùng giá trị mới N cập nhật nguyên tử giá trị của V. Nếu không bằng, nghĩa là có thread khác đã cập nhật V, thread hiện tại từ bỏ cập nhật.

**Ví dụ đơn giản**: Thread A muốn sửa giá trị biến i thành 6, giá trị ban đầu của i là 1 (V=1, E=1, N=6, giả sử không có vấn đề ABA).

1. So sánh i với 1, nếu bằng nhau nghĩa là không bị thread khác sửa, có thể đặt thành 6.
2. So sánh i với 1, nếu không bằng nghĩa là bị thread khác sửa, thread hiện tại từ bỏ cập nhật, thao tác CAS thất bại.

Khi nhiều thread cùng dùng CAS để thao tác một biến, chỉ một thread thắng và cập nhật thành công, các thread còn lại đều thất bại. Tuy nhiên thread thất bại không bị suspend, chỉ được thông báo thất bại và cho phép thử lại, tất nhiên cũng cho phép thread thất bại từ bỏ thao tác.

Để tìm hiểu thêm về CAS, có thể đọc bài [Giải thích chi tiết CAS](./cas.md), trong đó đề cập chi tiết đến triển khai CAS trong Java và một số vấn đề CAS có thể gặp phải.

## Tổng kết

Bài này giới thiệu chi tiết khái niệm optimistic lock và pessimistic lock, cùng các cách triển khai phổ biến của optimistic lock:

- Pessimistic lock dựa trên giả định bi quan, cho rằng shared resource sẽ xảy ra xung đột trong mỗi lần truy cập, nên lock trong mỗi lần thao tác. Cơ chế lock này sẽ khiến các thread khác bị block cho đến khi lock được release. `synchronized` và `ReentrantLock` trong Java là triển khai điển hình của pessimistic lock. Mặc dù pessimistic lock có thể tránh hiệu quả data race, trong tình huống high concurrency sẽ gây block thread, context switching thường xuyên, ảnh hưởng hiệu năng hệ thống, và còn có thể gây ra deadlock.
- Optimistic lock dựa trên giả định lạc quan, cho rằng shared resource sẽ không xảy ra xung đột trong mỗi lần truy cập, không cần lock, chỉ cần kiểm tra xem dữ liệu có bị thread khác sửa đổi khi commit. Các lớp như `AtomicInteger` và `LongAdder` trong Java triển khai optimistic lock thông qua CAS (Compare-And-Swap) algorithm. Optimistic lock tránh được block thread và deadlock, hiệu năng vượt trội trong tình huống read nhiều write ít. Tuy nhiên khi thao tác write nhiều, có thể dẫn đến nhiều lần retry và thất bại, ảnh hưởng hiệu năng.
- Optimistic lock chủ yếu triển khai thông qua version number mechanism hoặc CAS algorithm. Version number mechanism đảm bảo tính nhất quán dữ liệu bằng cách so sánh version number, trong khi CAS dùng hardware instruction để thực hiện atomic operation, so sánh và hoán đổi giá trị biến trực tiếp.

Pessimistic lock và optimistic lock đều có ưu nhược điểm riêng, phù hợp với các tình huống ứng dụng khác nhau. Trong phát triển thực tế, chọn cơ chế lock phù hợp có thể nâng cao hiệu quả concurrency performance và độ ổn định của hệ thống.

## Tài liệu tham khảo

- 《Java Concurrent Programming Core 78 Lectures》
- Pessimistic Lock, Optimistic Lock, Reentrant Lock, Spin Lock, Biased Lock, Lightweight/Heavyweight Lock, Read-Write Lock và các loại lock trong Java dễ hiểu: <https://zhuanlan.zhihu.com/p/71156910>

<!-- @include: @article-footer.snippet.md -->
