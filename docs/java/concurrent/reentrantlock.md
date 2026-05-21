---
title: Tìm hiểu nguyên lý AQS qua cách triển khai ReentrantLock
description: Phân tích chuyên sâu về nguyên lý ReentrantLock và AQS：giải thích chi tiết cách triển khai khóa có thể nhập lại ReentrantLock, sự khác biệt giữa khóa công bằng và khóa không công bằng, quy trình khóa/mở khóa dựa trên AQS, và so sánh hiệu năng với synchronized.
category: Java
tag:
  - Java Concurrent
head:
  - - meta
    - name: keywords
      content: ReentrantLock,AQS,公平锁,非公平锁,可重入锁,lock unlock,ReentrantLock原理,synchronized对比
---

> Bài viết này được dịch từ: <https://tech.meituan.com/2019/12/05/aqs-theory-and-apply.html>
>
> Tác giả: Đội kỹ thuật Meituan

Phần lớn các lớp đồng bộ hóa trong Java (Semaphore, ReentrantLock, v.v.) đều được triển khai dựa trên AbstractQueuedSynchronizer (gọi tắt là AQS). AQS là một framework đơn giản cung cấp chức năng quản lý trạng thái đồng bộ hóa theo kiểu nguyên tử, chặn và đánh thức luồng cũng như mô hình hàng đợi.

Bài viết này sẽ đi từ tầng ứng dụng đến tầng nguyên lý, và thông qua các đặc tính cơ bản của ReentrantLock cũng như mối liên hệ giữa ReentrantLock và AQS, chúng tôi sẽ phân tích sâu các kiến thức về khóa độc quyền trong AQS, đồng thời sử dụng hình thức hỏi đáp để giúp mọi người hiểu AQS. Do giới hạn độ dài, bài viết này chủ yếu trình bày logic khóa độc quyền trong AQS và Sync Queue, không đề cập đến phần chứa khóa chia sẻ và Condition Queue (trọng tâm của bài viết là phân tích nguyên lý AQS, chỉ giới thiệu sơ qua về ReentrantLock, các bạn quan tâm có thể đọc thêm mã nguồn ReentrantLock).

## 1 ReentrantLock

### 1.1 Tổng quan tính năng của ReentrantLock

ReentrantLock có nghĩa là khóa có thể nhập lại, tức là một luồng có thể khóa lặp lại một tài nguyên quan trọng. Để giúp mọi người hiểu rõ hơn về tính năng của ReentrantLock, chúng ta hãy so sánh ReentrantLock với Synchronized thường dùng, các tính năng của chúng như sau (phần màu xanh là các điểm chính sẽ được phân tích trong bài viết này):

![](https://p0.meituan.net/travelcube/412d294ff5535bbcddc0d979b2a339e6102264.png)

Dưới đây là so sánh trực quan hơn thông qua pseudocode:

```java
// **************************Synchronized的使用方式**************************
// 1.用于代码块
synchronized (this) {}
// 2.用于对象
synchronized (object) {}
// 3.用于方法
public synchronized void test () {}
// 4.可重入
for (int i = 0; i < 100; i++) {
  synchronized (this) {}
}
// **************************ReentrantLock的使用方式**************************
public void test () throw Exception {
  // 1.初始化选择公平锁、非公平锁
  ReentrantLock lock = new ReentrantLock(true);
  // 2.可用于代码块
  lock.lock();
  try {
    try {
      // 3.支持多种加锁方式，比较灵活; 具有可重入特性
      if(lock.tryLock(100, TimeUnit.MILLISECONDS)){ }
    } finally {
      // 4.手动释放锁
      lock.unlock()
    }
  } finally {
    lock.unlock();
  }
}
```

### 1.2 Mối liên hệ giữa ReentrantLock và AQS

Qua nội dung trên, chúng ta đã biết rằng ReentrantLock hỗ trợ khóa công bằng và khóa không công bằng (để biết phân tích nguyên lý về khóa công bằng và khóa không công bằng, có thể tham khảo 《[不可不说的 Java"锁"事](https://mp.weixin.qq.com/s?__biz=MjM5NjQ5MTI5OA==&mid=2651749434&idx=3&sn=5ffa63ad47fe166f2f1a9f604ed10091&chksm=bd12a5778a652c61509d9e718ab086ff27ad8768586ea9b38c3dcf9e017a8e49bcae3df9bcc8&scene=38#wechat_redirect)》), và bên dưới ReentrantLock được triển khai bởi AQS. Vậy ReentrantLock liên kết với AQS thông qua khóa công bằng và khóa không công bằng như thế nào? Chúng ta hãy tập trung vào quy trình khóa của hai loại này để hiểu mối liên hệ của chúng với AQS (mối liên hệ với AQS trong quá trình khóa khá rõ ràng, quy trình mở khóa sẽ được giới thiệu sau).

Quy trình khóa trong mã nguồn khóa không công bằng như sau:

```java
// java.util.concurrent.locks.ReentrantLock#NonfairSync

// 非公平锁
static final class NonfairSync extends Sync {
  ...
  final void lock() {
    if (compareAndSetState(0, 1))
      setExclusiveOwnerThread(Thread.currentThread());
    else
      acquire(1);
    }
  ...
}
```

Ý nghĩa của đoạn code này là:

- Nếu đặt biến State (trạng thái đồng bộ) thành công qua CAS, tức là lấy khóa thành công, thì đặt luồng hiện tại làm luồng độc quyền.
- Nếu đặt biến State (trạng thái đồng bộ) thất bại qua CAS, tức là lấy khóa thất bại, thì vào phương thức Acquire để xử lý tiếp theo.

Bước đầu tiên dễ hiểu, nhưng sau khi lấy khóa thất bại ở bước thứ hai, chiến lược xử lý tiếp theo là gì? Có thể có các suy nghĩ sau:

- Quy trình tiếp theo sau khi một luồng lấy khóa thất bại là gì? Có hai khả năng sau:

(1) Đặt kết quả lấy khóa của luồng hiện tại là thất bại, kết thúc quy trình lấy khóa. Thiết kế này sẽ làm giảm đáng kể mức độ đồng thời của hệ thống, không đáp ứng nhu cầu thực tế của chúng ta. Vì vậy cần đến quy trình sau, đó là quy trình xử lý của framework AQS.

(2) Tồn tại một cơ chế xếp hàng chờ đợi nhất định, luồng tiếp tục chờ, vẫn giữ khả năng lấy khóa, quy trình lấy khóa vẫn tiếp tục.

- Đối với trường hợp thứ hai của câu hỏi 1, đã nói đến cơ chế xếp hàng chờ đợi, chắc chắn sẽ có một loại hàng đợi nào đó được tạo thành, hàng đợi như vậy có cấu trúc dữ liệu là gì?
- Luồng đang trong cơ chế xếp hàng chờ đợi, khi nào có cơ hội lấy được khóa?
- Nếu luồng đang trong cơ chế xếp hàng chờ đợi mà không thể lấy được khóa, có cần tiếp tục chờ không, hay có chiến lược khác để giải quyết vấn đề này?

Với những câu hỏi về khóa không công bằng này, hãy xem cách lấy khóa trong mã nguồn khóa công bằng:

```java
// java.util.concurrent.locks.ReentrantLock#FairSync

static final class FairSync extends Sync {
  ...
  final void lock() {
    acquire(1);
  }
  ...
}
```

Nhìn vào đoạn code này, chúng ta có thể có thắc mắc này: Hàm Lock thực hiện khóa thông qua phương thức Acquire, nhưng cụ thể khóa như thế nào?

Kết hợp quy trình khóa của khóa công bằng và khóa không công bằng, mặc dù quy trình có một số khác biệt nhất định, nhưng cả hai đều gọi phương thức Acquire, và phương thức Acquire là phương thức cốt lõi trong lớp cha AQS của FairSync và UnfairSync.

Đối với những vấn đề đã đề cập ở trên, thực ra trong mã nguồn lớp ReentrantLock đều không thể giải đáp được, và câu trả lời cho những vấn đề này đều nằm trong lớp AbstractQueuedSynchronizer nơi phương thức Acquire tồn tại, đó là trọng tâm của bài viết này — AQS. Tiếp theo chúng ta sẽ giới thiệu chi tiết về AQS cũng như mối liên hệ giữa ReentrantLock và AQS (câu trả lời cho các vấn đề liên quan sẽ được giải đáp trong phần 2.3.5).

## 2 AQS

Trước tiên, hãy hiểu tổng quan về framework AQS qua sơ đồ kiến trúc dưới đây:

![](https://p1.meituan.net/travelcube/82077ccf14127a87b77cefd1ccf562d3253591.png)

- Trong hình trên, các phần có màu là Method, không có màu là Attribution.
- Nói chung, framework AQS được chia thành năm tầng, từ trên xuống dưới từ nông đến sâu, từ API mà AQS cung cấp ra bên ngoài đến dữ liệu nền tảng bên dưới cùng.
- Khi có bộ đồng bộ tùy chỉnh tiếp nhận, chỉ cần viết lại một phần phương thức cần thiết ở tầng đầu tiên, không cần quan tâm đến quy trình triển khai cụ thể ở tầng dưới. Khi bộ đồng bộ tùy chỉnh thực hiện thao tác khóa hoặc mở khóa, trước tiên sẽ đi qua API ở tầng đầu tiên để vào phương thức nội bộ AQS, sau đó đi qua tầng thứ hai để lấy khóa; tiếp theo đối với quy trình lấy khóa thất bại, sẽ vào xử lý hàng đợi chờ ở tầng thứ ba và tầng thứ tư, và các phương thức xử lý này đều phụ thuộc vào tầng cung cấp dữ liệu cơ sở thứ năm.

Tiếp theo chúng ta sẽ phân tích từng phần framework AQS từ tổng thể đến chi tiết, từ quy trình đến phương thức, quy trình phân tích chính như sau:

![](https://p1.meituan.net/travelcube/d2f7f7fffdc30d85d17b44266c3ab05323338.png)

### 2.1 Tổng quan nguyên lý

Ý tưởng cốt lõi của AQS là: nếu tài nguyên chia sẻ được yêu cầu đang rảnh, thì đặt luồng đang yêu cầu tài nguyên hiện tại làm luồng làm việc hiệu quả, đặt tài nguyên chia sẻ ở trạng thái khóa; nếu tài nguyên chia sẻ đang bị chiếm, cần một cơ chế chặn và đánh thức nhất định để đảm bảo phân bổ khóa. Cơ chế này chủ yếu được triển khai bằng biến thể của hàng đợi CLH, thêm luồng tạm thời không lấy được khóa vào hàng đợi.

CLH: Hàng đợi Craig, Landin và Hagersten, là danh sách liên kết một chiều. Hàng đợi trong AQS là hàng đợi hai chiều ảo biến thể CLH (FIFO), AQS thực hiện phân bổ khóa bằng cách đóng gói mỗi luồng yêu cầu tài nguyên chia sẻ vào một nút.

Sơ đồ nguyên lý chính như sau:

![](https://p0.meituan.net/travelcube/7132e4cef44c26f62835b197b239147b18062.png)

AQS sử dụng một biến thành viên kiểu int Volatile để biểu diễn trạng thái đồng bộ, thông qua hàng đợi FIFO tích hợp để hoàn thành công việc xếp hàng lấy tài nguyên, thông qua CAS để hoàn thành việc sửa đổi giá trị State.

#### 2.1.1 Cấu trúc dữ liệu AQS

Trước tiên hãy xem cấu trúc dữ liệu cơ bản nhất trong AQS — Node, Node chính là nút trong hàng đợi biến thể CLH ở trên.

![](https://p1.meituan.net/travelcube/960271cf2b5c8a185eed23e98b72c75538637.png)

Giải thích ý nghĩa của một số phương thức và giá trị thuộc tính:

| Phương thức và giá trị thuộc tính | Ý nghĩa                                                                                                                                              |
| :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| waitStatus                        | Trạng thái của nút hiện tại trong hàng đợi                                                                                                           |
| thread                            | Biểu diễn luồng ở nút đó                                                                                                                             |
| prev                              | Con trỏ đến nút trước                                                                                                                                |
| predecessor                       | Trả về nút trước, nếu không có sẽ ném ra npe                                                                                                         |
| nextWaiter                        | Trỏ đến nút tiếp theo ở trạng thái CONDITION (vì bài viết này không đề cập đến hàng đợi Condition Queue, con trỏ này sẽ không được giới thiệu nhiều) |
| next                              | Con trỏ đến nút sau                                                                                                                                  |

Hai chế độ khóa của luồng:

| Chế độ    | Ý nghĩa                                           |
| :-------- | :------------------------------------------------ |
| SHARED    | Biểu diễn luồng đang chờ khóa theo chế độ chia sẻ |
| EXCLUSIVE | Biểu diễn luồng đang chờ khóa theo cách độc quyền |

waitStatus có các giá trị enum sau:

| Enum      | Ý nghĩa                                                                         |
| :-------- | :------------------------------------------------------------------------------ |
| 0         | Giá trị mặc định khi một Node được khởi tạo                                     |
| CANCELLED | Là 1, biểu thị yêu cầu lấy khóa của luồng đã bị hủy                             |
| CONDITION | Là -2, biểu thị nút đang ở trong hàng đợi chờ, luồng nút đang chờ đánh thức     |
| PROPAGATE | Là -3, trường này chỉ được dùng khi luồng hiện tại đang trong tình huống SHARED |
| SIGNAL    | Là -1, biểu thị luồng đã sẵn sàng, chỉ chờ tài nguyên được giải phóng           |

#### 2.1.2 Trạng thái đồng bộ State

Sau khi tìm hiểu cấu trúc dữ liệu, tiếp theo hãy tìm hiểu về trạng thái đồng bộ của AQS — State. AQS duy trì một trường có tên là state, nghĩa là trạng thái đồng bộ, được sửa đổi bởi Volatile, dùng để hiển thị tình trạng lấy khóa của tài nguyên quan trọng hiện tại.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private volatile int state;
```

Dưới đây là một số phương thức để truy cập trường này:

| Tên phương thức                                                    | Mô tả                        |
| :----------------------------------------------------------------- | :--------------------------- |
| protected final int getState()                                     | Lấy giá trị State            |
| protected final void setState(int newState)                        | Đặt giá trị State            |
| protected final boolean compareAndSetState(int expect, int update) | Cập nhật State theo cách CAS |

Các phương thức này đều được sửa đổi bởi Final, có nghĩa là lớp con không thể ghi đè chúng. Chúng ta có thể thực hiện chế độ độc quyền và chế độ chia sẻ đa luồng (quy trình khóa) bằng cách sửa đổi trạng thái đồng bộ được biểu diễn bởi trường State.

![](https://p0.meituan.net/travelcube/27605d483e8935da683a93be015713f331378.png)

![](https://p0.meituan.net/travelcube/3f1e1a44f5b7d77000ba4f9476189b2e32806.png)

Đối với công cụ đồng bộ tùy chỉnh của chúng ta, cần tùy chỉnh cách lấy và giải phóng trạng thái đồng bộ, đó là tầng đầu tiên trong sơ đồ kiến trúc AQS: tầng API.

### 2.2 Các phương thức quan trọng của AQS và mối liên hệ với ReentrantLock

Từ sơ đồ kiến trúc có thể biết, AQS cung cấp nhiều phương thức Protected để tùy chỉnh việc triển khai bộ đồng bộ. Các phương thức liên quan đến triển khai bộ đồng bộ tùy chỉnh cũng chỉ là để thực hiện chế độ độc quyền hoặc chế độ chia sẻ đa luồng bằng cách sửa đổi trường State. Bộ đồng bộ tùy chỉnh cần triển khai các phương thức sau (các phương thức ReentrantLock cần triển khai như sau, không phải tất cả):

| Tên phương thức                             | Mô tả                                                                                                                                                                                           |
| :------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| protected boolean isHeldExclusively()       | Liệu luồng này có đang độc chiếm tài nguyên không. Chỉ cần triển khai khi dùng Condition.                                                                                                       |
| protected boolean tryAcquire(int arg)       | Chế độ độc quyền. arg là số lần lấy khóa, thử lấy tài nguyên, thành công trả về True, thất bại trả về False.                                                                                    |
| protected boolean tryRelease(int arg)       | Chế độ độc quyền. arg là số lần giải phóng khóa, thử giải phóng tài nguyên, thành công trả về True, thất bại trả về False.                                                                      |
| protected int tryAcquireShared(int arg)     | Chế độ chia sẻ. arg là số lần lấy khóa, thử lấy tài nguyên. Số âm biểu thị thất bại; 0 biểu thị thành công nhưng không còn tài nguyên khả dụng; số dương biểu thị thành công và còn tài nguyên. |
| protected boolean tryReleaseShared(int arg) | Chế độ chia sẻ. arg là số lần giải phóng khóa, thử giải phóng tài nguyên, nếu sau khi giải phóng cho phép đánh thức nút chờ tiếp theo trả về True, ngược lại trả về False.                      |

Thông thường, bộ đồng bộ tùy chỉnh hoặc là chế độ độc quyền, hoặc là chế độ chia sẻ, và chúng chỉ cần triển khai một trong hai tryAcquire-tryRelease hoặc tryAcquireShared-tryReleaseShared. AQS cũng hỗ trợ bộ đồng bộ tùy chỉnh đồng thời triển khai cả hai chế độ độc quyền và chia sẻ, như ReentrantReadWriteLock. ReentrantLock là khóa độc quyền, nên đã triển khai tryAcquire-tryRelease.

Lấy khóa không công bằng làm ví dụ, ở đây chủ yếu trình bày mối liên hệ giữa các phương thức của khóa không công bằng và AQS, vai trò cụ thể của từng phương thức cốt lõi sẽ được giới thiệu chi tiết ở phần sau của bài viết.

![](https://p1.meituan.net/travelcube/b8b53a70984668bc68653efe9531573e78636.png)

> Sửa lỗi (xem: [issue#1761](https://github.com/Snailclimb/JavaGuide/issues/1761)): Có một lỗi nhỏ trong hình, sau khi (AQS) CAS sửa đổi trạng thái tài nguyên chia sẻ State thành công thì nên là lấy khóa thành công (khóa không công bằng).
>
> Mã nguồn tương ứng như sau:
>
> ```java
> final boolean nonfairTryAcquire(int acquires) {
>          final Thread current = Thread.currentThread();//获取当前线程
>          int c = getState();
>          if (c == 0) {
>              if (compareAndSetState(0, acquires)) {//CAS抢锁
>                  setExclusiveOwnerThread(current);//设置当前线程为独占线程
>                  return true;//抢锁成功
>              }
>          }
>          else if (current == getExclusiveOwnerThread()) {
>              int nextc = c + acquires;
>              if (nextc < 0) // overflow
>                  throw new Error("Maximum lock count exceeded");
>              setState(nextc);
>              return true;
>          }
>          return false;
>      }
> ```

Để giúp mọi người hiểu quy trình tương tác giữa các phương thức ReentrantLock và AQS, lấy khóa không công bằng làm ví dụ, chúng ta hãy tách riêng quy trình tương tác giữa khóa và mở khóa để nhấn mạnh, nhằm hiểu nội dung tiếp theo.

![](https://p1.meituan.net/travelcube/7aadb272069d871bdee8bf3a218eed8136919.png)

Khóa:

- Thực hiện thao tác khóa thông qua phương thức khóa Lock của ReentrantLock.
- Sẽ gọi phương thức Lock của lớp nội bộ Sync, vì Sync#lock là phương thức abstract, tùy theo loại khóa công bằng và khóa không công bằng mà ReentrantLock khởi tạo chọn, thực thi phương thức Lock của lớp nội bộ tương ứng, về bản chất đều sẽ thực thi phương thức Acquire của AQS.
- Phương thức Acquire của AQS sẽ thực thi phương thức tryAcquire, nhưng vì tryAcquire cần bộ đồng bộ tùy chỉnh triển khai, nên sẽ thực thi phương thức tryAcquire trong ReentrantLock. Vì ReentrantLock được triển khai thông qua phương thức tryAcquire của lớp nội bộ khóa công bằng và khóa không công bằng, nên sẽ thực thi tryAcquire khác nhau tùy theo loại khóa.
- tryAcquire là logic lấy khóa, sau khi lấy thất bại, sẽ thực thi logic tiếp theo của framework AQS, không liên quan đến bộ đồng bộ tùy chỉnh ReentrantLock.

Mở khóa:

- Thực hiện mở khóa thông qua phương thức mở khóa Unlock của ReentrantLock.
- Unlock sẽ gọi phương thức Release của lớp nội bộ Sync, phương thức này kế thừa từ AQS.
- Release sẽ gọi phương thức tryRelease, tryRelease cần bộ đồng bộ tùy chỉnh triển khai, tryRelease chỉ được triển khai trong Sync của ReentrantLock, vì vậy có thể thấy, quy trình giải phóng khóa không phân biệt là khóa công bằng hay không công bằng.
- Sau khi giải phóng thành công, tất cả quá trình xử lý đều do framework AQS hoàn thành, không liên quan đến bộ đồng bộ tùy chỉnh.

Qua mô tả trên, có thể tóm tắt sơ bộ mối quan hệ ánh xạ của các phương thức cốt lõi ở tầng API khi ReentrantLock khóa và mở khóa.

![](https://p0.meituan.net/travelcube/f30c631c8ebbf820d3e8fcb6eee3c0ef18748.png)

## 3 Hiểu AQS qua ReentrantLock

Khóa công bằng và khóa không công bằng trong ReentrantLock giống nhau ở tầng dưới, ở đây lấy khóa không công bằng làm ví dụ để phân tích.

Trong khóa không công bằng, có đoạn code sau:

```java
// java.util.concurrent.locks.ReentrantLock

static final class NonfairSync extends Sync {
  ...
  final void lock() {
    if (compareAndSetState(0, 1))
      setExclusiveOwnerThread(Thread.currentThread());
    else
      acquire(1);
  }
  ...
}
```

Hãy xem Acquire này được viết như thế nào:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

public final void acquire(int arg) {
  if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
    selfInterrupt();
}
```

Rồi xem phương thức tryAcquire:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

protected boolean tryAcquire(int arg) {
  throw new UnsupportedOperationException();
}
```

Có thể thấy, đây chỉ là triển khai đơn giản của AQS, phương thức triển khai cụ thể để lấy khóa được triển khai riêng bởi khóa công bằng và khóa không công bằng (lấy ReentrantLock làm ví dụ). Nếu phương thức này trả về True, có nghĩa là luồng hiện tại lấy khóa thành công, không cần thực thi tiếp; nếu lấy thất bại, cần thêm vào hàng đợi chờ. Dưới đây sẽ giải thích chi tiết khi nào và cách nào luồng được thêm vào hàng đợi chờ.

### 3.1 Thêm luồng vào hàng đợi chờ

#### 3.1.1 Thời điểm thêm vào hàng đợi

Khi thực thi Acquire(1), sẽ lấy khóa thông qua tryAcquire. Trong trường hợp này, nếu lấy khóa thất bại, sẽ gọi addWaiter để thêm vào hàng đợi chờ.

#### 3.1.2 Cách thêm vào hàng đợi

Sau khi lấy khóa thất bại, sẽ thực thi addWaiter(Node.EXCLUSIVE) để thêm vào hàng đợi chờ, phương thức triển khai cụ thể như sau:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private Node addWaiter(Node mode) {
  Node node = new Node(Thread.currentThread(), mode);
  // Try the fast path of enq; backup to full enq on failure
  Node pred = tail;
  if (pred != null) {
    node.prev = pred;
    if (compareAndSetTail(pred, node)) {
      pred.next = node;
      return node;
    }
  }
  enq(node);
  return node;
}
private final boolean compareAndSetTail(Node expect, Node update) {
  return unsafe.compareAndSwapObject(this, tailOffset, expect, update);
}
```

Quy trình chính như sau:

- Tạo một nút mới dựa trên luồng hiện tại và chế độ khóa.
- Con trỏ Pred trỏ đến nút đuôi Tail.
- Đặt con trỏ Prev của Node mới trỏ đến Pred.
- Thông qua phương thức compareAndSetTail để hoàn thành việc đặt nút đuôi. Phương thức này chủ yếu so sánh tailOffset và Expect, nếu Node của tailOffset và Node của Expect có cùng địa chỉ, thì đặt giá trị Tail thành giá trị Update.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

static {
  try {
    stateOffset = unsafe.objectFieldOffset(AbstractQueuedSynchronizer.class.getDeclaredField("state"));
    headOffset = unsafe.objectFieldOffset(AbstractQueuedSynchronizer.class.getDeclaredField("head"));
    tailOffset = unsafe.objectFieldOffset(AbstractQueuedSynchronizer.class.getDeclaredField("tail"));
    waitStatusOffset = unsafe.objectFieldOffset(Node.class.getDeclaredField("waitStatus"));
    nextOffset = unsafe.objectFieldOffset(Node.class.getDeclaredField("next"));
  } catch (Exception ex) {
    throw new Error(ex);
  }
}
```

Từ khối code static của AQS có thể thấy, tất cả đều là lấy độ lệch tương đối của một thuộc tính đối tượng so với đối tượng đó trong bộ nhớ, để chúng ta có thể tìm thấy thuộc tính này trong bộ nhớ đối tượng dựa trên độ lệch này. tailOffset là độ lệch tương ứng của tail, vì vậy lúc này sẽ đặt Node mới tạo làm nút đuôi của hàng đợi hiện tại. Đồng thời, vì là danh sách liên kết hai chiều, cũng cần để nút trước đó trỏ đến nút đuôi.

- Nếu con trỏ Pred là Null (có nghĩa là không có phần tử trong hàng đợi chờ), hoặc vị trí con trỏ Pred hiện tại và Tail khác nhau (có nghĩa là đã bị luồng khác sửa đổi), cần xem phương thức Enq.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private Node enq(final Node node) {
  for (;;) {
    Node t = tail;
    if (t == null) { // Must initialize
      if (compareAndSetHead(new Node()))
        tail = head;
    } else {
      node.prev = t;
      if (compareAndSetTail(t, node)) {
        t.next = node;
        return t;
      }
    }
  }
}
```

Nếu chưa được khởi tạo, cần khởi tạo một nút đầu. Nhưng hãy lưu ý, nút đầu được khởi tạo không phải là nút luồng hiện tại, mà là nút gọi constructor không tham số. Nếu đã trải qua khởi tạo hoặc đồng thời dẫn đến có phần tử trong hàng đợi, thì cách xử lý giống với phương thức trước. Thực ra, addWaiter là thao tác thêm nút đuôi trong danh sách liên kết hai đầu, cần lưu ý rằng nút đầu của danh sách liên kết hai đầu là nút đầu gọi constructor không tham số.

Tóm lại, khi luồng lấy khóa, quy trình đại thể như sau:

1. Khi không có luồng nào lấy được khóa, luồng 1 lấy khóa thành công.

2. Luồng 2 yêu cầu khóa, nhưng khóa đang bị luồng 1 chiếm.

![img](https://p0.meituan.net/travelcube/e9e385c3c68f62c67c8d62ab0adb613921117.png)

3. Nếu có thêm luồng muốn lấy khóa, chỉ cần xếp hàng sau trong hàng đợi là được.

Quay lại code ở trên, hasQueuedPredecessors là phương thức khóa công bằng dùng để phán xét xem có nút hiệu lực nào trong hàng đợi chờ không khi thực hiện khóa. Nếu trả về False, có nghĩa là luồng hiện tại có thể tranh giành tài nguyên chia sẻ; nếu trả về True, có nghĩa là hàng đợi có nút hiệu lực, luồng hiện tại phải thêm vào hàng đợi chờ.

```java
// java.util.concurrent.locks.ReentrantLock

public final boolean hasQueuedPredecessors() {
  // The correctness of this depends on head being initialized
  // before tail and on head.next being accurate if the current
  // thread is first in queue.
  Node t = tail; // Read fields in reverse initialization order
  Node h = head;
  Node s;
  return h != t && ((s = h.next) == null || s.thread != Thread.currentThread());
}
```

Nhìn vào đây, chúng ta hãy hiểu tại sao `h != t && ((s = h.next) == null || s.thread != Thread.currentThread())` phải phán xét nút tiếp theo của nút đầu? Nút đầu tiên lưu trữ dữ liệu gì?

> Trong danh sách liên kết hai chiều, nút đầu tiên là nút ảo, thực ra không lưu trữ bất kỳ thông tin nào, chỉ chiếm chỗ. Nút đầu tiên thực sự có dữ liệu bắt đầu từ nút thứ hai. Khi h != t: nếu (s = h.next) == null, hàng đợi chờ đang có luồng đang khởi tạo, nhưng chỉ tiến hành đến bước Tail trỏ đến Head, chưa đặt Head trỏ đến Tail, lúc này trong hàng đợi có phần tử, cần trả về True (xem chi tiết ở phân tích code bên dưới). Nếu (s = h.next) != null, có nghĩa là lúc này trong hàng đợi có ít nhất một nút hiệu lực. Nếu lúc này s.thread == Thread.currentThread(), có nghĩa là luồng trong nút hiệu lực đầu tiên của hàng đợi chờ giống với luồng hiện tại, thì luồng hiện tại có thể lấy tài nguyên; nếu s.thread != Thread.currentThread(), có nghĩa là luồng của nút hiệu lực đầu tiên trong hàng đợi chờ khác với luồng hiện tại, luồng hiện tại phải thêm vào hàng đợi chờ.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer#enq

if (t == null) { // Must initialize
  if (compareAndSetHead(new Node()))
    tail = head;
} else {
  node.prev = t;
  if (compareAndSetTail(t, node)) {
    t.next = node;
    return t;
  }
}
```

Thao tác vào hàng đợi của nút không phải là thao tác nguyên tử, vì vậy sẽ xuất hiện tình trạng head != tail tạm thời, lúc này Tail trỏ đến nút cuối cùng và Tail trỏ đến Head. Nếu Head không trỏ đến Tail (xem dòng 5, 6, 7), trong trường hợp này cũng cần thêm luồng liên quan vào hàng đợi. Vì vậy đoạn code này là để giải quyết vấn đề đồng thời trong các tình huống cực đoan.

#### 3.1.3 Thời điểm luồng ra khỏi hàng đợi chờ

Quay lại mã nguồn ban đầu:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

public final void acquire(int arg) {
  if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
    selfInterrupt();
}
```

Văn bản trên đã giải thích phương thức addWaiter, phương thức này thực ra là thêm luồng tương ứng vào trong danh sách liên kết hai đầu theo dạng cấu trúc dữ liệu Node, và trả về một Node chứa luồng đó. Node này sẽ được dùng làm tham số để vào phương thức acquireQueued. Phương thức acquireQueued có thể thực hiện thao tác "lấy khóa" đối với luồng đang xếp hàng.

Tóm lại, một luồng lấy khóa thất bại, được đưa vào hàng đợi chờ, acquireQueued sẽ liên tục thử lấy khóa cho luồng trong hàng đợi, cho đến khi lấy thành công hoặc không còn cần lấy (bị ngắt).

Dưới đây chúng ta sẽ phân tích mã nguồn acquireQueued từ hai hướng "khi nào ra khỏi hàng đợi?" và "cách ra khỏi hàng đợi như thế nào?":

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

final boolean acquireQueued(final Node node, int arg) {
  // 标记是否成功拿到资源
  boolean failed = true;
  try {
    // 标记等待过程中是否中断过
    boolean interrupted = false;
    // 开始自旋，要么获取锁，要么中断
    for (;;) {
      // 获取当前节点的前驱节点
      final Node p = node.predecessor();
      // 如果p是头结点，说明当前节点在真实数据队列的首部，就尝试获取锁（别忘了头结点是虚节点）
      if (p == head && tryAcquire(arg)) {
        // 获取锁成功，头指针移动到当前node
        setHead(node);
        p.next = null; // help GC
        failed = false;
        return interrupted;
      }
      // 说明p为头节点且当前没有获取到锁（可能是非公平锁被抢占了）或者是p不为头结点，这个时候就要判断当前node是否要被阻塞（被阻塞条件：前驱节点的waitStatus为-1），防止无限循环浪费资源。具体两个方法下面细细分析
      if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
        interrupted = true;
    }
  } finally {
    if (failed)
      cancelAcquire(node);
  }
}
```

Lưu ý: phương thức setHead là đặt nút hiện tại thành nút ảo, nhưng không sửa đổi waitStatus, vì nó là dữ liệu cần dùng liên tục.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private void setHead(Node node) {
  head = node;
  node.thread = null;
  node.prev = null;
}

// java.util.concurrent.locks.AbstractQueuedSynchronizer

// 靠前驱节点判断当前线程是否应该被阻塞
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
  // 获取前驱结点的节点状态
  int ws = pred.waitStatus;
  // 说明前驱结点处于唤醒状态
  if (ws == Node.SIGNAL)
    return true;
  // 通过枚举值我们知道waitStatus>0是取消状态
  if (ws > 0) {
    do {
      // 循环向前查找取消节点，把取消节点从队列中剔除
      node.prev = pred = pred.prev;
    } while (pred.waitStatus > 0);
    pred.next = node;
  } else {
    // 设置前任节点等待状态为SIGNAL
    compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
  }
  return false;
}
```

parkAndCheckInterrupt chủ yếu dùng để treo luồng hiện tại, chặn call stack, trả về trạng thái ngắt của luồng hiện tại.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private final boolean parkAndCheckInterrupt() {
    LockSupport.park(this);
    return Thread.interrupted();
}
```

Sơ đồ quy trình của các phương thức trên như sau:

![](https://p0.meituan.net/travelcube/c124b76dcbefb9bdc778458064703d1135485.png)

Từ hình trên có thể thấy, điều kiện để thoát khỏi vòng lặp hiện tại là khi "nút trước là nút đầu và luồng hiện tại lấy khóa thành công". Để tránh vòng lặp vô hạn gây lãng phí tài nguyên CPU, chúng ta sẽ phán xét trạng thái của nút trước để quyết định có treo luồng hiện tại hay không. Quy trình treo cụ thể được biểu diễn bằng sơ đồ quy trình như sau (quy trình shouldParkAfterFailedAcquire):

![](https://p0.meituan.net/travelcube/9af16e2481ad85f38ca322a225ae737535740.png)

Thắc mắc về việc giải phóng nút khỏi hàng đợi đã được giải đáp, nhưng lại có vấn đề mới:

- shouldParkAfterFailedAcquire trong trạng thái nút bị hủy được tạo ra như thế nào? Khi nào sẽ đặt waitStatus của một nút thành -1?
- Lúc nào giải phóng nút và thông báo cho luồng bị treo?

### 3.2 Tạo nút trạng thái CANCELLED

Code Finally trong phương thức acquireQueued:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

final boolean acquireQueued(final Node node, int arg) {
  boolean failed = true;
  try {
    ...
    for (;;) {
      final Node p = node.predecessor();
      if (p == head && tryAcquire(arg)) {
        ...
        failed = false;
        ...
      }
      ...
  } finally {
    if (failed)
      cancelAcquire(node);
    }
}
```

Thông qua phương thức cancelAcquire, đánh dấu trạng thái Node là CANCELLED. Tiếp theo, chúng ta phân tích từng dòng nguyên lý của phương thức này:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private void cancelAcquire(Node node) {
  // 将无效节点过滤
  if (node == null)
    return;
  // 设置该节点不关联任何线程，也就是虚节点
  node.thread = null;
  Node pred = node.prev;
  // 通过前驱节点，跳过取消状态的node
  while (pred.waitStatus > 0)
    node.prev = pred = pred.prev;
  // 获取过滤后的前驱节点的后继节点
  Node predNext = pred.next;
  // 把当前node的状态设置为CANCELLED
  node.waitStatus = Node.CANCELLED;
  // 如果当前节点是尾节点，将从后往前的第一个非取消状态的节点设置为尾节点
  // 更新失败的话，则进入else，如果更新成功，将tail的后继节点设置为null
  if (node == tail && compareAndSetTail(node, pred)) {
    compareAndSetNext(pred, predNext, null);
  } else {
    int ws;
    // 如果当前节点不是head的后继节点，1:判断当前节点前驱节点的是否为SIGNAL，2:如果不是，则把前驱节点设置为SIGNAL看是否成功
    // 如果1和2中有一个为true，再判断当前节点的线程是否为null
    // 如果上述条件都满足，把当前节点的前驱节点的后继指针指向当前节点的后继节点
    if (pred != head && ((ws = pred.waitStatus) == Node.SIGNAL || (ws <= 0 && compareAndSetWaitStatus(pred, ws, Node.SIGNAL))) && pred.thread != null) {
      Node next = node.next;
      if (next != null && next.waitStatus <= 0)
        compareAndSetNext(pred, predNext, next);
    } else {
      // 如果当前节点是head的后继节点，或者上述条件不满足，那就唤醒当前节点的后继节点
      unparkSuccessor(node);
    }
    node.next = node; // help GC
  }
}
```

Quy trình hiện tại:

- Lấy nút trước của nút hiện tại, nếu trạng thái nút trước là CANCELLED, thì tiếp tục duyệt về phía trước, tìm nút Pred đầu tiên có waitStatus <= 0, liên kết nút Pred tìm thấy với nút hiện tại Node, đặt nút hiện tại Node thành CANCELLED.
- Tùy theo vị trí của nút hiện tại, xem xét ba trường hợp sau:

(1) Nút hiện tại là nút đuôi.

(2) Nút hiện tại là nút kế tiếp của Head.

(3) Nút hiện tại không phải là nút kế tiếp của Head, cũng không phải nút đuôi.

Dựa trên điều kiện thứ hai ở trên, hãy phân tích quy trình của từng trường hợp.

Nút hiện tại là nút đuôi.

![](https://p1.meituan.net/travelcube/b845211ced57561c24f79d56194949e822049.png)

Nút hiện tại là nút kế tiếp của Head.

![](https://p1.meituan.net/travelcube/ab89bfec875846e5028a4f8fead32b7117975.png)

Nút hiện tại không phải là nút kế tiếp của Head, cũng không phải nút đuôi.

![](https://p0.meituan.net/travelcube/45d0d9e4a6897eddadc4397cf53d6cd522452.png)

Qua quy trình trên, chúng ta đã hiểu sơ bộ về việc tạo và thay đổi trạng thái nút CANCELLED. Nhưng tại sao tất cả các thay đổi đều thao tác trên con trỏ Next, mà không thao tác trên con trỏ Prev? Trong trường hợp nào sẽ thao tác trên con trỏ Prev?

> Khi thực thi cancelAcquire, nút trước của nút hiện tại có thể đã ra khỏi hàng đợi (đã thực thi phương thức shouldParkAfterFailedAcquire trong khối Try code rồi). Nếu lúc này sửa đổi con trỏ Prev, có thể dẫn đến Prev trỏ đến một Node khác đã bị xóa khỏi hàng đợi, vì vậy thay đổi con trỏ Prev lúc này không an toàn. Trong phương thức shouldParkAfterFailedAcquire, code dưới đây sẽ được thực thi, thực ra đó là xử lý con trỏ Prev. shouldParkAfterFailedAcquire chỉ được thực thi khi lấy khóa thất bại, sau khi vào phương thức đó, có nghĩa là tài nguyên chia sẻ đã được lấy, các nút trước nút hiện tại sẽ không thay đổi, vì vậy việc thay đổi con trỏ Prev lúc này tương đối an toàn.
>
> ```java
> do {
>   node.prev = pred = pred.prev;
> } while (pred.waitStatus > 0);
> ```

### 3.3 Cách mở khóa

Chúng ta đã phân tích quy trình cơ bản trong quá trình khóa, tiếp theo hãy phân tích quy trình cơ bản của mở khóa. Vì ReentrantLock khi mở khóa không phân biệt khóa công bằng và không công bằng, nên chúng ta xem thẳng mã nguồn mở khóa:

```java
// java.util.concurrent.locks.ReentrantLock

public void unlock() {
  sync.release(1);
}
```

Có thể thấy, về bản chất, nơi giải phóng khóa được hoàn thành bởi framework.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

public final boolean release(int arg) {
  if (tryRelease(arg)) {
    Node h = head;
    if (h != null && h.waitStatus != 0)
      unparkSuccessor(h);
    return true;
  }
  return false;
}
```

Trong lớp cha Sync của khóa công bằng và không công bằng trong ReentrantLock, cơ chế giải phóng khóa có thể nhập lại được định nghĩa.

```java
// java.util.concurrent.locks.ReentrantLock.Sync

// 方法返回当前锁是不是没有被线程持有
protected final boolean tryRelease(int releases) {
  // 减少可重入次数
  int c = getState() - releases;
  // 当前线程不是持有锁的线程，抛出异常
  if (Thread.currentThread() != getExclusiveOwnerThread())
    throw new IllegalMonitorStateException();
  boolean free = false;
  // 如果持有线程全部释放，将当前独占锁所有线程设置为null，并更新state
  if (c == 0) {
    free = true;
    setExclusiveOwnerThread(null);
  }
  setState(c);
  return free;
}
```

Hãy giải thích mã nguồn dưới đây:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

public final boolean release(int arg) {
  // 上边自定义的tryRelease如果返回true，说明该锁没有被任何线程持有
  if (tryRelease(arg)) {
    // 获取头结点
    Node h = head;
    // 头结点不为空并且头结点的waitStatus不是初始化节点情况，解除线程挂起状态
    if (h != null && h.waitStatus != 0)
      unparkSuccessor(h);
    return true;
  }
  return false;
}
```

Tại sao điều kiện phán xét ở đây là h != null && h.waitStatus != 0?

> h == null Head chưa được khởi tạo. Trong trường hợp ban đầu, head == null, nút đầu tiên vào hàng đợi, Head sẽ được khởi tạo thành một nút ảo. Vì vậy, nếu chưa kịp vào hàng đợi, sẽ xuất hiện tình huống head == null.
>
> h != null && waitStatus == 0 biểu thị luồng tương ứng với nút kế tiếp vẫn đang chạy, không cần đánh thức.
>
> h != null && waitStatus < 0 biểu thị luồng tương ứng với nút kế tiếp có thể đang bị chặn, cần đánh thức.

Hãy xem thêm phương thức unparkSuccessor:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private void unparkSuccessor(Node node) {
  // 获取头结点waitStatus
  int ws = node.waitStatus;
  if (ws < 0)
    compareAndSetWaitStatus(node, ws, 0);
  // 获取当前节点的下一个节点
  Node s = node.next;
  // 如果下个节点是null或者下个节点被cancelled，就找到队列最开始的非cancelled的节点
  if (s == null || s.waitStatus > 0) {
    s = null;
    // 就从尾部节点开始找，到队首，找到队列第一个waitStatus<0的节点。
    for (Node t = tail; t != null && t != node; t = t.prev)
      if (t.waitStatus <= 0)
        s = t;
  }
  // 如果当前节点的下个节点不为空，而且状态<=0，就把当前节点unpark
  if (s != null)
    LockSupport.unpark(s.thread);
}
```

Tại sao phải tìm nút đầu tiên không phải Cancelled từ sau về trước? Lý do như sau.

Phương thức addWaiter trước đó:

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private Node addWaiter(Node mode) {
  Node node = new Node(Thread.currentThread(), mode);
  // Try the fast path of enq; backup to full enq on failure
  Node pred = tail;
  if (pred != null) {
    node.prev = pred;
    if (compareAndSetTail(pred, node)) {
      pred.next = node;
      return node;
    }
  }
  enq(node);
  return node;
}
```

Từ đây có thể thấy, thao tác vào hàng đợi của nút không phải là thao tác nguyên tử, tức là `node.prev = pred; compareAndSetTail(pred, node)` ở hai chỗ này có thể được xem là thao tác nguyên tử của việc Tail vào hàng đợi, nhưng lúc này `pred.next = node;` chưa được thực thi. Nếu lúc này thực thi phương thức unparkSuccessor, thì không thể tìm từ trước về sau, vì vậy cần tìm từ sau về trước. Còn một lý do nữa là, khi tạo nút trạng thái CANCELLED, con trỏ Next bị ngắt trước, con trỏ Prev không bị ngắt, vì vậy cũng phải duyệt từ sau về trước mới có thể duyệt đầy đủ tất cả các Node.

Tóm lại, nếu tìm từ trước về sau, do thao tác vào hàng đợi không nguyên tử trong các tình huống cực đoan và thao tác ngắt con trỏ Next trong quá trình tạo nút CANCELLED, có thể dẫn đến không thể duyệt tất cả các nút. Vì vậy, sau khi đánh thức luồng tương ứng, luồng tương ứng sẽ tiếp tục thực thi tiếp. Sau khi tiếp tục thực thi phương thức acquireQueued, ngắt được xử lý như thế nào?

### 3.4 Quy trình thực thi sau khi khôi phục từ ngắt

Sau khi đánh thức, sẽ thực thi `return Thread.interrupted();`, hàm này trả về trạng thái ngắt của luồng đang thực thi hiện tại và xóa nó.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private final boolean parkAndCheckInterrupt() {
  LockSupport.park(this);
  return Thread.interrupted();
}
```

Quay lại code acquireQueued, khi parkAndCheckInterrupt trả về True hoặc False, giá trị của interrupted khác nhau, nhưng đều sẽ thực thi vòng lặp tiếp theo. Nếu lúc này lấy khóa thành công, sẽ trả về interrupted hiện tại.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

final boolean acquireQueued(final Node node, int arg) {
  boolean failed = true;
  try {
    boolean interrupted = false;
    for (;;) {
      final Node p = node.predecessor();
      if (p == head && tryAcquire(arg)) {
        setHead(node);
        p.next = null; // help GC
        failed = false;
        return interrupted;
      }
      if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
        interrupted = true;
      }
  } finally {
    if (failed)
      cancelAcquire(node);
  }
}
```

Nếu acquireQueued là True, sẽ thực thi phương thức selfInterrupt.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

static void selfInterrupt() {
  Thread.currentThread().interrupt();
}
```

Phương thức này thực ra là để ngắt luồng. Nhưng tại sao sau khi lấy được khóa vẫn phải ngắt luồng? Phần này thuộc kiến thức ngắt hợp tác do Java cung cấp, các bạn quan tâm có thể tìm hiểu. Ở đây giới thiệu sơ qua:

1. Khi luồng bị ngắt được đánh thức, không biết lý do bị đánh thức, có thể là luồng hiện tại đang chờ bị ngắt, cũng có thể là bị đánh thức sau khi giải phóng khóa. Vì vậy chúng ta kiểm tra đánh dấu ngắt thông qua phương thức Thread.interrupted() (phương thức này trả về trạng thái ngắt của luồng thực thi hiện tại và đặt đánh dấu ngắt của luồng hiện tại thành False), và ghi lại. Nếu phát hiện luồng đã bị ngắt, thì ngắt lại một lần nữa.
2. Luồng bị đánh thức trong quá trình chờ tài nguyên, sau khi đánh thức sẽ tiếp tục cố gắng lấy khóa, cho đến khi lấy được khóa. Tức là trong toàn bộ quy trình, không phản hồi ngắt, chỉ ghi lại bản ghi ngắt. Cuối cùng lấy được khóa và trả về, nếu đã bị ngắt, cần bổ sung thêm một lần ngắt.

Cách xử lý ở đây chủ yếu sử dụng runWorker trong đơn vị hoạt động cơ bản Worker trong thread pool, phán xét bổ sung thông qua Thread.interrupted(), các bạn quan tâm có thể xem mã nguồn ThreadPoolExecutor.

### 3.5 Tóm tắt nhỏ

Chúng ta đã đặt ra một số câu hỏi ở phần 1.3, bây giờ hãy trả lời.

> H: Quy trình tiếp theo sau khi một luồng lấy khóa thất bại là gì?
>
> Đ: Tồn tại một cơ chế xếp hàng chờ đợi nhất định, luồng tiếp tục chờ, vẫn giữ khả năng lấy khóa, quy trình lấy khóa vẫn tiếp tục.
>
> H: Đã nói đến cơ chế xếp hàng chờ đợi, chắc chắn sẽ có một loại hàng đợi nào đó được tạo thành, hàng đợi như vậy có cấu trúc dữ liệu là gì?
>
> Đ: Là hàng đợi hai đầu FIFO biến thể CLH.
>
> H: Luồng đang trong cơ chế xếp hàng chờ đợi, khi nào có cơ hội lấy được khóa?
>
> Đ: Có thể xem chi tiết ở phần 2.3.1.3.
>
> H: Nếu luồng đang trong cơ chế xếp hàng chờ đợi mà không thể lấy được khóa, có cần tiếp tục chờ không? Hay có chiến lược khác để giải quyết vấn đề này?
>
> Đ: Trạng thái của nút nơi luồng đang ở sẽ chuyển thành trạng thái hủy, nút trạng thái hủy sẽ được giải phóng khỏi hàng đợi, xem chi tiết ở phần 2.3.2.
>
> H: Hàm Lock thực hiện khóa thông qua phương thức Acquire, nhưng cụ thể khóa như thế nào?
>
> Đ: Acquire của AQS sẽ gọi phương thức tryAcquire, tryAcquire được triển khai bởi mỗi bộ đồng bộ tùy chỉnh, hoàn thành quá trình khóa thông qua tryAcquire.

## 4 Ứng dụng AQS

### 4.1 Ứng dụng tính năng nhập lại của ReentrantLock

Tính năng nhập lại của ReentrantLock là một trong những ứng dụng tốt của AQS. Sau khi tìm hiểu các kiến thức trên, chúng ta dễ dàng biết phương thức ReentrantLock triển khai tính năng nhập lại. Trong ReentrantLock, dù là khóa công bằng hay không công bằng, đều có một đoạn logic.

Khóa công bằng:

```java
// java.util.concurrent.locks.ReentrantLock.FairSync#tryAcquire

if (c == 0) {
  if (!hasQueuedPredecessors() && compareAndSetState(0, acquires)) {
    setExclusiveOwnerThread(current);
    return true;
  }
}
else if (current == getExclusiveOwnerThread()) {
  int nextc = c + acquires;
  if (nextc < 0)
    throw new Error("Maximum lock count exceeded");
  setState(nextc);
  return true;
}
```

Khóa không công bằng:

```java
// java.util.concurrent.locks.ReentrantLock.Sync#nonfairTryAcquire

if (c == 0) {
  if (compareAndSetState(0, acquires)){
    setExclusiveOwnerThread(current);
    return true;
  }
}
else if (current == getExclusiveOwnerThread()) {
  int nextc = c + acquires;
  if (nextc < 0) // overflow
    throw new Error("Maximum lock count exceeded");
  setState(nextc);
  return true;
}
```

Từ hai đoạn trên có thể thấy, có một trạng thái đồng bộ State để kiểm soát tình huống nhập lại tổng thể. State được sửa đổi bởi Volatile, dùng để đảm bảo một mức độ khả năng hiển thị và thứ tự nhất định.

```java
// java.util.concurrent.locks.AbstractQueuedSynchronizer

private volatile int state;
```

Tiếp theo hãy xem quy trình chính của trường State:

1. State được khởi tạo là 0, biểu thị không có luồng nào giữ khóa.
2. Khi có luồng giữ khóa đó, giá trị sẽ tăng thêm 1 so với ban đầu, cùng một luồng lấy khóa nhiều lần sẽ cộng thêm 1 nhiều lần, đây là khái niệm nhập lại.
3. Mở khóa cũng là trừ 1 trường này, cho đến khi đạt 0, luồng này giải phóng khóa.

### 4.2 Tình huống ứng dụng trong JUC

Ngoài ứng dụng tính năng nhập lại của ReentrantLock ở trên, AQS với tư cách là framework cho lập trình đồng thời, cung cấp giải pháp tốt cho nhiều công cụ đồng bộ hóa khác. Dưới đây liệt kê một số công cụ đồng bộ trong JUC, giới thiệu sơ qua về tình huống ứng dụng AQS:

| Công cụ đồng bộ        | Mối liên hệ giữa công cụ đồng bộ và AQS                                                                                                                                                                             |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ReentrantLock          | Dùng AQS để lưu số lần giữ khóa lặp. Khi một luồng lấy khóa, ReentrantLock ghi lại định danh luồng đang giữ khóa, dùng để phát hiện có lấy lặp không, và xử lý tình huống bất thường khi luồng sai cố gắng mở khóa. |
| Semaphore              | Dùng trạng thái đồng bộ AQS để lưu số đếm hiện tại của semaphore. tryRelease sẽ tăng số đếm, acquireShared sẽ giảm số đếm.                                                                                          |
| CountDownLatch         | Dùng trạng thái đồng bộ AQS để biểu diễn số đếm. Khi số đếm là 0, tất cả thao tác Acquire (phương thức await của CountDownLatch) mới có thể đi qua.                                                                 |
| ReentrantReadWriteLock | Dùng 16 bit trong trạng thái đồng bộ AQS để lưu số lần giữ khóa ghi, 16 bit còn lại để lưu số lần giữ khóa đọc.                                                                                                     |
| ThreadPoolExecutor     | Worker sử dụng trạng thái đồng bộ AQS để thiết lập biến luồng độc quyền (tryAcquire và tryRelease).                                                                                                                 |

### 4.3 Công cụ đồng bộ tùy chỉnh

Sau khi tìm hiểu nguyên lý cơ bản của AQS, dựa theo các kiến thức AQS đã đề cập ở trên, hãy tự triển khai một công cụ đồng bộ.

```java
public class LeeLock  {

    private static class Sync extends AbstractQueuedSynchronizer {
        @Override
        protected boolean tryAcquire (int arg) {
            return compareAndSetState(0, 1);
        }

        @Override
        protected boolean tryRelease (int arg) {
            setState(0);
            return true;
        }

        @Override
        protected boolean isHeldExclusively () {
            return getState() == 1;
        }
    }

    private Sync sync = new Sync();

    public void lock () {
        sync.acquire(1);
    }

    public void unlock () {
        sync.release(1);
    }
}
```

Thực hiện một số chức năng đồng bộ hóa nhất định thông qua Lock mà chúng ta tự định nghĩa.

```java
public class LeeMain {

    static int count = 0;
    static LeeLock leeLock = new LeeLock();

    public static void main (String[] args) throws InterruptedException {

        Runnable runnable = new Runnable() {
            @Override
            public void run () {
                try {
                    leeLock.lock();
                    for (int i = 0; i < 10000; i++) {
                        count++;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    leeLock.unlock();
                }

            }
        };
        Thread thread1 = new Thread(runnable);
        Thread thread2 = new Thread(runnable);
        thread1.start();
        thread2.start();
        thread1.join();
        thread2.join();
        System.out.println(count);
    }
}
```

Kết quả của mỗi lần chạy code trên đều là 20000. Chỉ với vài dòng code đơn giản có thể thực hiện chức năng đồng bộ hóa, đây là sức mạnh của AQS.

## 5 Tổng kết

Chúng ta sử dụng đồng thời trong công việc hàng ngày quá nhiều, nhưng những người hiểu rõ framework nguyên lý cơ bản bên trong đồng thời lại không nhiều. Do giới hạn độ dài, bài viết này chỉ giới thiệu nguyên lý của khóa có thể nhập lại ReentrantLock và nguyên lý AQS, hy vọng có thể trở thành "bước khởi đầu" để mọi người tìm hiểu về AQS và các bộ đồng bộ như ReentrantLock.

## Tài liệu tham khảo

- Lea D. The java. util. concurrent synchronizer framework\[J]. Science of Computer Programming, 2005, 58(3): 293-309.
- 《Java 并发编程实战》
- [不可不说的 Java"锁"事](https://tech.meituan.com/2018/11/15/java-lock.html)

<!-- @include: @article-footer.snippet.md -->
