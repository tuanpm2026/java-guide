---
title: Giải thích chi tiết AQS
description: "Phân tích chuyên sâu về AbstractQueuedSynchronizer (AQS): nguyên lý cốt lõi, cấu trúc hàng đợi CLH, triển khai khóa độc quyền và khóa chia sẻ, ứng dụng các bộ đồng bộ như ReentrantLock/Semaphore, cơ chế chặn và đánh thức thread."
category: Java
tag:
  - Java Concurrent
head:
  - - meta
    - name: keywords
      content: AQS,AbstractQueuedSynchronizer,队列同步器,独占锁,共享锁,CLH队列,ReentrantLock实现原理
---

<!-- markdownlint-disable MD024 -->

## Giới thiệu AQS

AQS là viết tắt của `AbstractQueuedSynchronizer`, có nghĩa là bộ đồng bộ hóa hàng đợi trừu tượng. Class này nằm trong package `java.util.concurrent.locks`.

![](https://oss.javaguide.cn/github/javaguide/AQS.png)

AQS là một abstract class, chủ yếu dùng để xây dựng các lock và bộ đồng bộ.

```java
public abstract class AbstractQueuedSynchronizer extends AbstractOwnableSynchronizer implements java.io.Serializable {
}
```

AQS cung cấp các triển khai chức năng chung để xây dựng lock và bộ đồng bộ. Do đó, sử dụng AQS có thể xây dựng một cách đơn giản và hiệu quả nhiều bộ đồng bộ được ứng dụng rộng rãi, chẳng hạn như `ReentrantLock`, `Semaphore`, cũng như `ReentrantReadWriteLock`, `SynchronousQueue` và nhiều bộ đồng bộ khác đều dựa trên AQS.

## Nguyên lý AQS

Khi được hỏi về kiến thức đồng bộ trong phỏng vấn, hầu hết đều sẽ được hỏi "Hãy trình bày hiểu biết của bạn về nguyên lý AQS". Dưới đây là một ví dụ để tham khảo. Phỏng vấn không phải là học thuộc, bạn nhất định phải đưa vào suy nghĩ của mình, dù không thêm được suy nghĩ riêng thì cũng phải đảm bảo có thể giải thích một cách dễ hiểu chứ không phải đọc thuộc.

### Tìm hiểu nhanh về AQS

Trước khi thực sự giải thích source code AQS, cần có nhận thức tổng thể về AQS. Ở đây sẽ thông qua một vài câu hỏi để hiểu AQS ở mức tổng quan, biết được AQS nằm ở tầng nào trong toàn bộ Java concurrency, sau đó khi học source code AQS mới có thể hiểu sâu hơn về mối quan hệ giữa bộ đồng bộ và AQS.

#### Vai trò của AQS là gì?

AQS giải quyết vấn đề phức tạp khi các nhà phát triển triển khai bộ đồng bộ. Nó cung cấp một framework chung để triển khai các bộ đồng bộ khác nhau, chẳng hạn như **reentrant lock** (`ReentrantLock`), **semaphore** (`Semaphore`) và **countdown timer** (`CountDownLatch`). Bằng cách đóng gói cơ chế đồng bộ thread ở tầng dưới, AQS ẩn đi logic quản lý thread phức tạp, giúp nhà phát triển chỉ cần tập trung vào logic đồng bộ cụ thể.

Nói đơn giản, AQS là một abstract class, cung cấp **execution framework** chung cho bộ đồng bộ. Nó định nghĩa **quy trình chung cho việc lấy và giải phóng tài nguyên**, còn logic lấy tài nguyên cụ thể được triển khai bởi bộ đồng bộ cụ thể thông qua việc override các template method. Do đó, có thể coi AQS là **"nền tảng" cơ sở** của bộ đồng bộ, còn bộ đồng bộ là **"ứng dụng" cụ thể** được xây dựng dựa trên AQS.

#### Tại sao AQS sử dụng biến thể của CLH lock queue?

CLH lock là một triển khai tối ưu dựa trên **spin lock**.

Trước tiên hãy nói về vấn đề của spin lock: spin lock sử dụng cách thread liên tục thực hiện thao tác `compareAndSet` (viết tắt là `CAS`) trên một biến nguyên tử để cố gắng lấy lock. Trong tình huống high concurrency, nhiều thread sẽ cùng lúc cạnh tranh cùng một biến nguyên tử, dễ dẫn đến việc thao tác `CAS` của một thread bị thất bại trong thời gian dài, gây ra **vấn đề "starvation"** (một số thread có thể không bao giờ lấy được lock).

CLH lock cải thiện spin lock bằng cách đưa vào một hàng đợi để tổ chức các thread cạnh tranh đồng thời:

- Mỗi thread sẽ được thêm vào hàng đợi như một node, và theo dõi trạng thái của node thread trước đó thông qua spin, thay vì cạnh tranh trực tiếp biến dùng chung.
- Các thread xếp hàng theo thứ tự, đảm bảo tính công bằng, qua đó tránh được vấn đề "starvation".

AQS (AbstractQueuedSynchronizer) tiếp tục tối ưu hóa dựa trên CLH lock, tạo ra **biến thể CLH queue** bên trong. Có hai cải tiến chính:

1. **Spin + Blocking**: CLH lock sử dụng phương thức spin thuần túy để chờ lock được giải phóng, nhưng lượng lớn thao tác spin chiếm dụng quá nhiều tài nguyên CPU. AQS đưa vào cơ chế kết hợp **spin + blocking**:
   - Nếu thread lấy lock thất bại, sẽ spin ngắn để thử lấy lock;
   - Nếu vẫn thất bại, thread sẽ vào trạng thái blocking, chờ được đánh thức, từ đó giảm lãng phí CPU.
2. **Chuyển từ hàng đợi một chiều sang hàng đợi hai chiều**: CLH lock sử dụng hàng đợi một chiều, node chỉ biết trạng thái của node trước, khi một node giải phóng lock cần thông qua hàng đợi để đánh thức node tiếp theo. AQS chuyển hàng đợi thành **hàng đợi hai chiều**, thêm con trỏ `next`, giúp node không chỉ biết node trước mà còn có thể trực tiếp đánh thức node sau, đơn giản hóa thao tác hàng đợi và tăng hiệu quả đánh thức.

#### Tại sao AQS có hiệu năng tốt?

Vì AQS sử dụng nhiều thao tác `CAS` ở bên trong.

AQS lưu trữ các node thread đang chờ thông qua hàng đợi bên trong. Vì hàng đợi là tài nguyên dùng chung, trong tình huống multi-thread cần đảm bảo truy cập đồng bộ vào hàng đợi.

AQS kiểm soát truy cập đồng bộ vào hàng đợi thông qua các thao tác `CAS`, chủ yếu được dùng để kiểm soát concurrency safety cho hai thao tác `khởi tạo hàng đợi` và `thread node vào hàng đợi`. Mặc dù sử dụng `CAS` để kiểm soát concurrency safety có thể đảm bảo hiệu năng tốt, nhưng đồng thời cũng tăng **độ phức tạp lập trình** đáng kể.

#### Tại sao trong AQS, Node cần các trạng thái khác nhau?

`waitStatus` trong AQS tương tự như **state machine**, thể hiện ý nghĩa khác nhau của Node qua các trạng thái khác nhau, và kiểm soát sự chuyển đổi giữa các trạng thái dựa trên các thao tác khác nhau.

- Trạng thái `0`: Sau khi node mới được thêm vào hàng đợi, trạng thái ban đầu là `0`.

- Trạng thái `SIGNAL`: Khi có node mới vào hàng đợi, trạng thái của node predecessor sẽ được cập nhật từ `0` thành `SIGNAL`, nghĩa là sau khi node predecessor giải phóng lock cần thực hiện thao tác đánh thức node mới. Nếu đánh thức node successor của node trạng thái `SIGNAL`, trạng thái `SIGNAL` sẽ được cập nhật thành `0`. Tức là thông qua việc xóa trạng thái `SIGNAL` để chỉ ra đã thực hiện thao tác đánh thức.

- Trạng thái `CANCELLED`: Nếu một node đang chờ trong hàng đợi để lấy lock mà thất bại vì lý do nào đó, trạng thái của node đó sẽ chuyển thành `CANCELLED`, chỉ ra rằng đã hủy việc lấy lock. Node ở trạng thái này là bất thường, không thể bị đánh thức, cũng không thể đánh thức node successor.

### Tư tưởng cốt lõi của AQS

Tư tưởng cốt lõi của AQS là: nếu tài nguyên dùng chung được yêu cầu đang rảnh, thì đặt thread đang yêu cầu tài nguyên hiện tại làm thread làm việc hợp lệ, và đặt tài nguyên dùng chung vào trạng thái bị khóa. Nếu tài nguyên dùng chung đang bị chiếm dụng, thì cần một cơ chế để thread chặn chờ và phân bổ lock khi được đánh thức. Cơ chế này trong AQS được triển khai dựa trên tối ưu hóa tiếp theo từ **CLH lock** (Craig, Landin, and Hagersten locks).

**CLH lock** cải thiện spin lock, là spin lock dựa trên linked list đơn. Trong tình huống multi-thread, các thread yêu cầu lấy lock được tổ chức thành hàng đợi một chiều, mỗi thread đang chờ sẽ truy cập trạng thái của node thread trước thông qua spin, chỉ sau khi node trước giải phóng lock, node hiện tại mới có thể lấy lock. Cấu trúc hàng đợi của **CLH lock** được thể hiện như hình dưới.

![Cấu trúc hàng đợi CLH lock](https://oss.javaguide.cn/github/javaguide/open-source-project/clh-lock-queue-structure.png)

**Hàng đợi chờ** được sử dụng trong AQS là biến thể của CLH lock queue (sau đây gọi tắt là CLH variant queue).

CLH variant queue trong AQS là hàng đợi hai chiều, các thread tạm thời không lấy được lock sẽ được thêm vào hàng đợi này. Sự khác biệt chính giữa CLH variant queue và CLH lock queue gốc có hai điểm:

- Từ **spin** tối ưu thành **spin + blocking**: Hiệu năng của spin rất cao, nhưng lượng lớn spin chiếm dụng nhiều tài nguyên CPU, vì vậy trong CLH variant queue sẽ trước tiên thử lấy lock bằng spin, nếu thất bại mới chờ blocking.
- Từ **hàng đợi một chiều** tối ưu thành **hàng đợi hai chiều**: Trong CLH variant queue, thread đang chờ sẽ bị chặn, khi thread ở đầu hàng đợi giải phóng lock cần đánh thức thread phía sau, do đó thêm con trỏ `next`, trở thành hàng đợi hai chiều.

AQS đóng gói mỗi thread yêu cầu tài nguyên dùng chung thành một node (Node) trong CLH variant queue để thực hiện phân bổ lock. Trong CLH variant queue, một node đại diện cho một thread, nó lưu trữ tham chiếu thread (thread), trạng thái hiện tại của node trong hàng đợi (waitStatus), node predecessor (prev), node successor (next).

Cấu trúc CLH variant queue trong AQS được thể hiện như hình dưới:

![Cấu trúc CLH variant queue](https://oss.javaguide.cn/github/javaguide/java/concurrent/clh-queue-structure-bianti.png)

Về giải thích chi tiết cấu trúc dữ liệu cốt lõi của AQS - CLH lock, rất khuyến nghị đọc bài viết [Java AQS 核心数据结构-CLH 锁 - Qunar 技术沙龙](https://mp.weixin.qq.com/s/jEx-4XhNGOFdCo4Nou5tqg).

Sơ đồ nguyên lý cốt lõi của AQS (`AbstractQueuedSynchronizer`):

![CLH variant queue](https://oss.javaguide.cn/github/javaguide/java/concurrent/clh-queue-state.png)

AQS sử dụng **biến thành viên int `state` để biểu thị trạng thái đồng bộ**, hoàn thành việc xếp hàng của thread lấy tài nguyên thông qua **hàng đợi chờ/đợi FIFO** được tích hợp sẵn.

Biến `state` được sửa đổi bởi `volatile`, dùng để thể hiện tình trạng lấy tài nguyên tới hạn hiện tại. Ở đây vai trò của `volatile` không chỉ đảm bảo visibility, quan trọng hơn là thông qua quy tắc happens-before (thao tác ghi vào biến volatile xảy ra trước thao tác đọc sau đó) để ngăn compiler và processor sắp xếp lại lệnh, từ đó đảm bảo tính đúng đắn của ngữ nghĩa lock.

```java
// Biến dùng chung, được sửa đổi bởi volatile, đảm bảo thread visibility và ngăn instruction reordering
private volatile int state;
```

Ngoài ra, thông tin trạng thái `state` có thể được thao tác thông qua `getState()`, `setState()` và `compareAndSetState()` kiểu `protected`. Và, các phương thức này đều được sửa đổi bởi `final`, không thể được override trong subclass.

```java
//Trả về giá trị hiện tại của trạng thái đồng bộ
protected final int getState() {
     return state;
}
 // Đặt giá trị trạng thái đồng bộ
protected final void setState(int newState) {
     state = newState;
}
//Đặt nguyên tử (thao tác CAS) giá trị trạng thái đồng bộ thành giá trị update nếu giá trị trạng thái đồng bộ hiện tại bằng expect (giá trị mong đợi)
protected final boolean compareAndSetState(int expect, int update) {
      return unsafe.compareAndSwapInt(this, stateOffset, expect, update);
}
```

Lấy reentrant mutex lock `ReentrantLock` làm ví dụ, bên trong nó duy trì một biến `state` để biểu thị trạng thái chiếm dụng của lock. Giá trị ban đầu của `state` là 0, cho biết lock đang ở trạng thái không bị khóa. Khi thread A gọi phương thức `lock()`, nó sẽ cố gắng chiếm lock độc quyền thông qua phương thức `tryAcquire()` và tăng giá trị `state` lên 1. Nếu thành công, thread A lấy được lock. Nếu thất bại, thread A sẽ được thêm vào hàng đợi chờ (CLH variant queue), cho đến khi thread khác giải phóng lock đó. Giả sử thread A lấy lock thành công, trước khi giải phóng lock, thread A có thể tự mình lấy lock này nhiều lần (`state` sẽ tích lũy). Đây chính là biểu hiện của tính reentrant: một thread có thể lấy cùng một lock nhiều lần mà không bị chặn. Nhưng điều này cũng có nghĩa là, một thread phải giải phóng lock cùng số lần với số lần lấy, để `state` trở về 0, tức là đưa lock trở về trạng thái không bị khóa. Chỉ như vậy, các thread khác đang chờ mới có cơ hội lấy lock đó.

Quá trình thread A cố gắng lấy lock được thể hiện trong hình dưới (nguồn hình [从 ReentrantLock 的实现看 AQS 的原理及应用 - 美团技术团队](./reentrantlock.md)):

![AQS exclusive mode acquire lock](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-exclusive-mode-acquire-lock.png)

Lấy countdown timer `CountDownLatch` làm ví dụ, tác vụ được chia thành N subthread để thực thi, `state` cũng được khởi tạo thành N (lưu ý N phải khớp với số lượng thread). N subthread này bắt đầu thực thi tác vụ, mỗi khi một subthread thực thi xong, sẽ gọi một lần phương thức `countDown()`. Phương thức này sẽ cố gắng sử dụng thao tác CAS (Compare and Swap) để giảm giá trị `state` đi 1. Khi tất cả subthread thực thi xong (tức là giá trị `state` thành 0), `CountDownLatch` sẽ gọi phương thức `unpark()` để đánh thức main thread. Lúc này, main thread có thể trả về từ phương thức `await()` (phương thức `await()` trong `CountDownLatch` chứ không phải trong AQS), tiếp tục thực thi các thao tác tiếp theo.

### Ý nghĩa trạng thái waitStatus của Node

`waitStatus` trong AQS tương tự như **state machine**, thể hiện ý nghĩa khác nhau của Node qua các trạng thái khác nhau, và kiểm soát sự chuyển đổi giữa các trạng thái dựa trên các thao tác khác nhau.

| Trạng thái Node | Giá trị | Ý nghĩa                                                                                                                                                                           |
| --------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CANCELLED`     | 1       | Chỉ ra thread đã hủy lấy lock. Thread bị ngắt khi đang chờ lấy tài nguyên, hoặc chờ tài nguyên quá thời gian sẽ cập nhật sang trạng thái này.                                     |
| `SIGNAL`        | -1      | Chỉ ra node successor cần được node hiện tại đánh thức. Sau khi thread node hiện tại giải phóng lock, cần đánh thức node successor.                                               |
| `CONDITION`     | -2      | Chỉ ra node đang chờ Condition. Khi thread khác gọi phương thức `signal()` của Condition, node sẽ được chuyển từ hàng đợi chờ sang hàng đợi đồng bộ để chờ lấy tài nguyên.        |
| `PROPAGATE`     | -3      | Dùng cho shared mode. Trong shared mode, có thể xảy ra tình huống thread không thể bị đánh thức trong hàng đợi, do đó đã đưa vào trạng thái `PROPAGATE` để giải quyết vấn đề này. |
|                 | 0       | Trạng thái ban đầu của node mới thêm vào hàng đợi.                                                                                                                                |

Trong source code AQS, thường sử dụng `> 0`, `< 0` để kiểm tra `waitStatus`.

Nếu `waitStatus > 0`, chỉ ra trạng thái của node đã hủy chờ lấy tài nguyên.

Nếu `waitStatus < 0`, chỉ ra trạng thái của node đang ở trạng thái bình thường, tức là chưa hủy chờ.

Trong đó trạng thái `SIGNAL` là quan trọng nhất, chuyển đổi trạng thái node và thao tác tương ứng như sau:

| Chuyển đổi trạng thái | Thao tác tương ứng                                                                                                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`                   | Khi node mới vào hàng đợi, trạng thái ban đầu là `0`.                                                                                                                                                                  |
| `0 -> SIGNAL`         | Khi node mới vào hàng đợi, trạng thái của node predecessor sẽ được cập nhật từ `0` thành `SIGNAL`. Trạng thái `SIGNAL` chỉ ra rằng node successor của node này cần được đánh thức.                                     |
| `SIGNAL -> 0`         | Khi đánh thức node successor, cần xóa trạng thái của node hiện tại. Thường xảy ra ở node `head`, ví dụ trạng thái node `head` được cập nhật từ `SIGNAL` thành `0`, chỉ ra đã đánh thức node successor của node `head`. |
| `0 -> PROPAGATE`      | AQS đưa vào trạng thái `PROPAGATE` để giải quyết tình huống node thread không thể được đánh thức trong tình huống concurrency. (Sẽ được đề cập trong phần phân tích source code lấy tài nguyên shared mode của AQS)    |

### Bộ đồng bộ tùy chỉnh

Dựa trên AQS có thể triển khai bộ đồng bộ tùy chỉnh. AQS cung cấp 5 template method (template method pattern). Nếu cần tùy chỉnh bộ đồng bộ, phương thức thông thường là (một ứng dụng điển hình của template method pattern):

1. Bộ đồng bộ tùy chỉnh kế thừa `AbstractQueuedSynchronizer`.
2. Override các template method mà AQS expose ra.

**AQS sử dụng template method pattern, khi tùy chỉnh bộ đồng bộ cần override các hook method mà AQS cung cấp dưới đây:**

```java
//Exclusive mode. Thử lấy tài nguyên, thành công trả về true, thất bại trả về false.
protected boolean tryAcquire(int)
//Exclusive mode. Thử giải phóng tài nguyên, thành công trả về true, thất bại trả về false.
protected boolean tryRelease(int)
//Shared mode. Thử lấy tài nguyên. Số âm chỉ ra thất bại; 0 chỉ ra thành công nhưng không còn tài nguyên khả dụng; số dương chỉ ra thành công và còn tài nguyên.
protected int tryAcquireShared(int)
//Shared mode. Thử giải phóng tài nguyên, thành công trả về true, thất bại trả về false.
protected boolean tryReleaseShared(int)
//Thread này có đang độc quyền tài nguyên không. Chỉ cần triển khai khi dùng condition.
protected boolean isHeldExclusively()
```

**Hook method là gì?** Hook method là phương thức được khai báo trong abstract class, thường được sửa đổi bởi từ khóa `protected`, có thể là phương thức rỗng (do subclass triển khai), cũng có thể là phương thức đã có triển khai mặc định. Template design pattern kiểm soát triển khai các bước cố định thông qua hook method.

Do giới hạn bài viết, ở đây sẽ không giới thiệu chi tiết về template method pattern, các bạn chưa rõ có thể xem bài viết: [用 Java8 改造后的模板方法模式真的是 yyds!](https://mp.weixin.qq.com/s/zpScSCktFpnSWHWIQem2jg).

Ngoài các hook method được đề cập ở trên, tất cả các phương thức khác trong class AQS đều là `final`, do đó không thể được override bởi các class khác.

### Phương thức chia sẻ tài nguyên của AQS

AQS định nghĩa hai phương thức chia sẻ tài nguyên: `Exclusive` (độc quyền, chỉ một thread có thể thực thi, như `ReentrantLock`) và `Share` (chia sẻ, nhiều thread có thể thực thi đồng thời, như `Semaphore`/`CountDownLatch`).

Nhìn chung, phương thức chia sẻ của bộ đồng bộ tùy chỉnh là độc quyền hoặc chia sẻ, họ cũng chỉ cần triển khai một trong hai cặp `tryAcquire-tryRelease`, `tryAcquireShared-tryReleaseShared`. Nhưng AQS cũng hỗ trợ bộ đồng bộ tùy chỉnh triển khai đồng thời cả hai phương thức độc quyền và chia sẻ, như `ReentrantReadWriteLock`.

### So sánh chuyên sâu giữa Exclusive mode và Shared mode

Ở trên đã giới thiệu sơ lược về hai phương thức chia sẻ tài nguyên của AQS. Dưới đây sẽ so sánh hệ thống giữa exclusive mode và shared mode từ nhiều chiều để hiểu sâu hơn sự khác biệt giữa hai phương thức.

#### So sánh đặc tính

| Chiều so sánh                      | Exclusive mode                                                 | Shared mode                                                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mức độ đồng thời**               | Tại cùng một thời điểm chỉ có một thread có thể lấy tài nguyên | Tại cùng một thời điểm có thể có nhiều thread cùng lấy tài nguyên                                                                                                |
| **Điểm vào lấy tài nguyên**        | `acquire(int arg)`                                             | `acquireShared(int arg)`                                                                                                                                         |
| **Điểm vào giải phóng tài nguyên** | `release(int arg)`                                             | `releaseShared(int arg)`                                                                                                                                         |
| **Template method cần override**   | `tryAcquire(int)` / `tryRelease(int)`                          | `tryAcquireShared(int)` / `tryReleaseShared(int)`                                                                                                                |
| **Giá trị trả về của tryXxx**      | `boolean`, `true` chỉ ra lấy/giải phóng thành công             | `int` (khi lấy), số âm chỉ ra thất bại, 0 chỉ ra thành công nhưng không còn tài nguyên, số dương chỉ ra thành công và còn tài nguyên; `boolean` (khi giải phóng) |
| **Đánh thức node successor**       | Khi giải phóng tài nguyên đánh thức một node successor         | Sau khi lấy tài nguyên thành công, nếu còn tài nguyên dư, sẽ tiếp tục đánh thức các node tiếp theo (lan truyền đánh thức)                                        |
| **Định danh kiểu Node**            | `Node.EXCLUSIVE` (`null`)                                      | `Node.SHARED` (một instance `Node` tĩnh)                                                                                                                         |
| **Triển khai điển hình**           | `ReentrantLock`, write lock của `ReentrantReadWriteLock`       | `Semaphore`, `CountDownLatch`, read lock của `ReentrantReadWriteLock`                                                                                            |

#### Ngữ nghĩa của `state` trong các bộ đồng bộ khác nhau

`state` trong AQS là biến trạng thái đồng bộ chung, các bộ đồng bộ khác nhau gán cho nó ý nghĩa khác nhau:

| Bộ đồng bộ               | Mode               | Ngữ nghĩa của `state`                                                                                                           |
| ------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `ReentrantLock`          | Exclusive          | Biểu thị số lần reenter của lock. `state == 0` chỉ ra lock rảnh; `state > 0` chỉ ra lock đang bị giữ, giá trị là số lần reenter |
| `ReentrantReadWriteLock` | Exclusive + Shared | 16 bit cao biểu thị số lần giữ read lock (shared), 16 bit thấp biểu thị số lần reenter write lock (exclusive)                   |
| `Semaphore`              | Shared             | Biểu thị số lượng permit khả dụng. Mỗi lần `acquire()` giảm, `release()` tăng                                                   |
| `CountDownLatch`         | Shared             | Biểu thị count cần chờ. Mỗi lần `countDown()` giảm 1, đến 0 đánh thức tất cả thread đang chờ                                    |

Dưới đây thông qua một ví dụ code để trực quan cảm nhận sự khác biệt trong cách sử dụng giữa exclusive mode và shared mode:

```java
import java.util.concurrent.Semaphore;
import java.util.concurrent.locks.ReentrantLock;

public class ExclusiveVsSharedDemo {
    public static void main(String[] args) {
        // Exclusive mode: chỉ 1 thread có thể vào critical section tại cùng một thời điểm
        ReentrantLock lock = new ReentrantLock();

        // Shared mode: tối đa 3 thread có thể vào critical section tại cùng một thời điểm
        Semaphore semaphore = new Semaphore(3);

        // Ví dụ exclusive mode
        Runnable exclusiveTask = () -> {
            lock.lock();
            try {
                System.out.println(Thread.currentThread().getName()
                        + " 获取到独占锁，正在执行...");
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                lock.unlock();
            }
        };

        // Ví dụ shared mode
        Runnable sharedTask = () -> {
            try {
                semaphore.acquire();
                System.out.println(Thread.currentThread().getName()
                        + " 获取到许可证，正在执行...");
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                semaphore.release();
            }
        };

        System.out.println("=== 独占模式（ReentrantLock）===");
        for (int i = 0; i < 5; i++) {
            new Thread(exclusiveTask, "独占线程-" + i).start();
        }

        try { Thread.sleep(3000); } catch (InterruptedException e) { }

        System.out.println("\n=== 共享模式（Semaphore）===");
        for (int i = 0; i < 5; i++) {
            new Thread(sharedTask, "共享线程-" + i).start();
        }
    }
}
```

Chạy code trên có thể quan sát: trong exclusive mode, 5 thread thực thi nghiêm ngặt lần lượt từng cái một, còn trong shared mode tối đa 3 thread thực thi đồng thời.

### Phân tích source code lấy tài nguyên AQS (Exclusive mode)

Phương thức entry trong AQS để lấy tài nguyên ở exclusive mode là `acquire()`, như sau:

```JAVA
// AQS
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

Trong `acquire()`, thread trước tiên sẽ thử lấy tài nguyên dùng chung; nếu lấy thất bại, sẽ đóng gói thread thành Node node thêm vào hàng đợi chờ của AQS; sau khi vào hàng đợi, sẽ cho các thread trong hàng đợi thử lấy tài nguyên và thực hiện thao tác chặn thread. Tương ứng với ba phương thức sau:

- `tryAcquire()`: Thử lấy lock (template method), `AQS` không cung cấp triển khai cụ thể, do subclass triển khai.
- `addWaiter()`: Nếu lấy lock thất bại, sẽ đóng gói thread hiện tại thành Node node thêm vào CLH variant queue của AQS để chờ lấy lock.
- `acquireQueued()`: Chặn thread và gọi phương thức `tryAcquire()` để thread trong hàng đợi thử lấy lock.

#### Phân tích `tryAcquire()`

Template method `tryAcquire()` tương ứng trong AQS như sau:

```JAVA
// AQS
protected boolean tryAcquire(int arg) {
    throw new UnsupportedOperationException();
}
```

Phương thức `tryAcquire()` là template method mà AQS cung cấp, không cung cấp triển khai mặc định.

Do đó, khi phân tích phương thức `tryAcquire()` ở đây, lấy non-fair lock (exclusive lock) của `ReentrantLock` làm ví dụ để phân tích. `tryAcquire()` được triển khai bên trong `ReentrantLock` sẽ gọi đến `nonfairTryAcquire()` bên dưới:

```JAVA
// ReentrantLock
final boolean nonfairTryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    // 1、Lấy trạng thái state trong AQS
    int c = getState();
    // 2、Nếu state là 0, chứng tỏ lock chưa bị thread khác chiếm dụng
    if (c == 0) {
        // 2.1、Cập nhật state qua CAS
        if (compareAndSetState(0, acquires)) {
            // 2.2、Nếu CAS cập nhật thành công, đặt người giữ lock là thread hiện tại
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    // 3、Nếu thread hiện tại và thread giữ lock giống nhau, tức là đã xảy ra "lock reentry"
    else if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0) // overflow
            throw new Error("Maximum lock count exceeded");
        // 3.1、Tăng số lần reentry của lock lên 1
        setState(nextc);
        return true;
    }
    // 4、Nếu lock bị thread khác chiếm dụng, trả về false, chỉ ra lấy lock thất bại
    return false;
}
```

Bên trong phương thức `nonfairTryAcquire()`, chủ yếu hoàn thành việc lấy tài nguyên thông qua hai thao tác cốt lõi:

- Cập nhật biến `state` thông qua `CAS`. `state == 0` chỉ ra tài nguyên chưa bị chiếm dụng. `state > 0` chỉ ra tài nguyên đang bị chiếm dụng, lúc này `state` biểu thị số lần reentry.
- Đặt thread giữ tài nguyên thông qua `setExclusiveOwnerThread()`.

Nếu thread cập nhật biến `state` thành công, tức là đã lấy được tài nguyên, do đó đặt thread giữ tài nguyên là thread hiện tại.

#### Phân tích `addWaiter()`

Sau khi thử lấy tài nguyên thất bại thông qua phương thức `tryAcquire()`, sẽ gọi phương thức `addWaiter()` để đóng gói thread hiện tại thành Node node thêm vào hàng đợi bên trong `AQS`. Code của `addWaiter()` như sau:

```JAVA
// AQS
private Node addWaiter(Node mode) {
    // 1、Đóng gói thread hiện tại thành Node node.
    Node node = new Node(Thread.currentThread(), mode);
    Node pred = tail;
    // 2、Nếu pred != null, chứng tỏ node tail đã được khởi tạo, có thể thêm Node node vào hàng đợi trực tiếp.
    if (pred != null) {
        node.prev = pred;
        // 2.1、Kiểm soát concurrency safety thông qua CAS.
        if (compareAndSetTail(pred, node)) {
            pred.next = node;
            return node;
        }
    }
    // 3、Khởi tạo hàng đợi và thêm Node node mới tạo vào hàng đợi.
    enq(node);
    return node;
}
```

**Concurrency safety khi node vào hàng đợi:**

Trong phương thức `addWaiter()`, cần thực hiện thao tác **vào hàng đợi** cho Node node. Vì đang ở môi trường multi-thread, cần đảm bảo concurrency safety thông qua thao tác `CAS`.

Cập nhật con trỏ `tail` trỏ đến Node node mới vào hàng đợi thông qua thao tác `CAS`, `CAS` có thể đảm bảo chỉ một thread thành công trong việc sửa đổi con trỏ `tail`, qua đó đảm bảo concurrency safety khi Node node vào hàng đợi.

**Khởi tạo hàng đợi nội bộ AQS:**

Khi thực thi `addWaiter()`, nếu phát hiện `pred == null`, tức là con trỏ `tail` là null, chứng tỏ hàng đợi chưa được khởi tạo, cần gọi phương thức `enq()` để khởi tạo hàng đợi và thêm Node node vào hàng đợi sau khi khởi tạo, code như sau:

```JAVA
// AQS
private Node enq(final Node node) {
    for (;;) {
        Node t = tail;
        if (t == null) {
            // 1、Đảm bảo concurrency safety của khởi tạo hàng đợi thông qua thao tác CAS
            if (compareAndSetHead(new Node()))
                tail = head;
        } else {
            // 2、Giống với thao tác node vào hàng đợi trong phương thức addWaiter()
            node.prev = t;
            if (compareAndSetTail(t, node)) {
                t.next = node;
                return t;
            }
        }
    }
}
```

Trong phương thức `enq()`, khởi tạo hàng đợi, trong quá trình khởi tạo cũng cần dùng `CAS` để đảm bảo concurrency safety.

Khởi tạo hàng đợi gồm hai bước: khởi tạo node `head`, con trỏ `tail` trỏ đến node `head`.

**Hàng đợi sau khi khởi tạo được thể hiện trong hình dưới:**

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/clh-queue-structure-init.png)

#### Phân tích `acquireQueued()`

Để tiện đọc, ở đây dán lại code `acquire()` lấy tài nguyên trong `AQS`:

```JAVA
// AQS
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

Trong phương thức `acquire()`, sau khi thêm Node node vào hàng đợi thông qua phương thức `addWaiter()`, sẽ gọi phương thức `acquireQueued()`. Code như sau:

```JAVA
// AQS: Cho node trong hàng đợi thử lấy lock và chặn thread.
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            // 1、Thử lấy lock.
            final Node p = node.predecessor();
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            // 2、Kiểm tra xem thread có thể bị chặn không, nếu có, chặn thread hiện tại.
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        // 3、Nếu lấy lock thất bại, sẽ hủy lấy lock, cập nhật trạng thái node thành CANCELLED.
        if (failed)
            cancelAcquire(node);
    }
}
```

Trong phương thức `acquireQueued()`, chủ yếu làm hai việc:

- **Thử lấy tài nguyên:** Sau khi thread hiện tại vào hàng đợi, nếu phát hiện node predecessor là node `head`, chứng tỏ thread hiện tại là node đang chờ đầu tiên trong hàng đợi, do đó gọi `tryAcquire()` để thử lấy tài nguyên.

- **Chặn thread hiện tại**: Nếu thử lấy tài nguyên thất bại, cần chặn thread hiện tại, chờ được đánh thức để lấy tài nguyên.

**1、Thử lấy tài nguyên**

Trong phương thức `acquireQueued()`, thử lấy tài nguyên gồm 2 bước:

- `p == head`: Chỉ ra node predecessor của node hiện tại là node `head`. Lúc này node hiện tại là node đang chờ đầu tiên trong hàng đợi AQS.
- `tryAcquire(arg) == true`: Chỉ ra thread hiện tại thử lấy tài nguyên thành công.

Sau khi lấy tài nguyên thành công, cần **loại bỏ node của thread hiện tại khỏi hàng đợi chờ**. Thao tác loại bỏ là: đặt node thread đang chờ làm node `head` (node `head` là virtual node, không tham gia xếp hàng lấy tài nguyên).

**2、Chặn thread hiện tại**

Trong `AQS`, việc đánh thức node hiện tại cần phụ thuộc vào node trước đó. Nếu node trước đó hủy lấy lock, trạng thái của nó sẽ trở thành `CANCELLED`, node trạng thái `CANCELLED` không lấy được lock, do đó cũng không thể thực hiện thao tác mở khóa để đánh thức node hiện tại. Do đó trước khi chặn thread hiện tại, cần bỏ qua các node trạng thái `CANCELLED`.

Sử dụng phương thức `shouldParkAfterFailedAcquire()` để kiểm tra xem node thread hiện tại có thể bị chặn không, như sau:

```JAVA
// AQS: Kiểm tra xem node thread hiện tại có thể bị chặn không.
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
    int ws = pred.waitStatus;
    // 1、Trạng thái node predecessor bình thường, trả về true trực tiếp.
    if (ws == Node.SIGNAL)
        return true;
    // 2、ws > 0 chỉ ra trạng thái node predecessor bất thường, tức là trạng thái CANCELLED, cần bỏ qua node trạng thái bất thường.
    if (ws > 0) {
        do {
            node.prev = pred = pred.prev;
        } while (pred.waitStatus > 0);
        pred.next = node;
    } else {
        // 3、Nếu trạng thái node predecessor không phải SIGNAL cũng không phải CANCELLED, đặt trạng thái thành SIGNAL.
        compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
    }
    return false;
}
```

Logic kiểm tra trong phương thức `shouldParkAfterFailedAcquire()`:

- Nếu phát hiện trạng thái node predecessor là `SIGNAL`, có thể chặn thread hiện tại.
- Nếu phát hiện trạng thái node predecessor là `CANCELLED`, cần bỏ qua các node trạng thái `CANCELLED`.
- Nếu phát hiện trạng thái node predecessor không phải `SIGNAL` hay `CANCELLED`, chỉ ra node predecessor đang ở trạng thái chờ tài nguyên bình thường, do đó đặt trạng thái node predecessor thành `SIGNAL`, chỉ ra rằng node predecessor cần đánh thức node tiếp theo.

Sau khi xác định thread hiện tại có thể bị chặn, gọi phương thức `parkAndCheckInterrupt()` để chặn thread hiện tại. Bên trong sử dụng `LockSupport` để thực hiện blocking. `LockSupport` ở tầng dưới dựa trên class `Unsafe` để chặn thread, code như sau:

```JAVA
// AQS
private final boolean parkAndCheckInterrupt() {
    // 1、Thread bị chặn ở đây
    LockSupport.park(this);
    // 2、Sau khi thread được đánh thức, trả về trạng thái interrupt của thread
    return Thread.interrupted();
}
```

**Tại sao sau khi thread được đánh thức cần trả về trạng thái interrupt của thread?**

Trong phương thức `parkAndCheckInterrupt()`, khi thực thi xong `LockSupport.park(this)`, thread sẽ bị chặn, code như sau:

```JAVA
// AQS
private final boolean parkAndCheckInterrupt() {
    LockSupport.park(this);
    // Sau khi thread được đánh thức, cần trả về trạng thái interrupt của thread
    return Thread.interrupted();
}
```

Sau khi thread được đánh thức, cần thực thi `Thread.interrupted()` để trả về trạng thái interrupt của thread, tại sao vậy?

Điều này liên quan đến cơ chế hợp tác interrupt của thread. Sau khi thread được đánh thức, không chắc chắn là bị đánh thức bởi interrupt hay bởi `LockSupport.unpark()`, do đó cần thông qua trạng thái interrupt của thread để phán đoán.

**Trong phương thức `acquire()`, tại sao cần gọi `selfInterrupt()`?**

Code phương thức `acquire()` như sau:

```JAVA
// AQS
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

Trong phương thức `acquire()`, khi điều kiện câu lệnh `if` trả về `true`, sẽ gọi `selfInterrupt()`, tại sao phương thức này cần interrupt thread hiện tại?

Khi điều kiện `if` là `true`, cần `tryAcquire()` trả về `false` và `acquireQueued()` trả về `true`.

Trong đó phương thức `acquireQueued()` trả về **trạng thái interrupt** của thread sau khi được đánh thức, thông qua việc thực thi `Thread.interrupted()` để trả về. Phương thức này trong khi trả về trạng thái interrupt, cũng sẽ xóa trạng thái interrupt của thread.

Do đó nếu điều kiện `if` là `true`, chỉ ra trạng thái interrupt của thread là `true`, nhưng sau khi gọi `Thread.interrupted()`, trạng thái interrupt của thread được xóa thành `false`, do đó cần thực thi lại `selfInterrupt()` để đặt lại trạng thái interrupt của thread.

### Phân tích source code giải phóng tài nguyên AQS (Exclusive mode)

Phương thức entry trong AQS để giải phóng tài nguyên ở exclusive mode là `release()`, code như sau:

```JAVA
// AQS
public final boolean release(int arg) {
    // 1、Thử giải phóng lock
    if (tryRelease(arg)) {
        Node h = head;
        // 2、Đánh thức node successor
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}
```

Trong phương thức `release()`, chủ yếu làm hai việc: thử giải phóng lock và đánh thức node successor. Phương thức tương ứng như sau:

**1、Thử giải phóng lock**

Thử giải phóng lock thông qua phương thức `tryRelease()`, phương thức này là template method, được triển khai bởi bộ đồng bộ tùy chỉnh, do đó ở đây vẫn lấy `ReentrantLock` làm ví dụ.

Phương thức `tryRelease()` được triển khai trong `ReentrantLock` như sau:

```JAVA
// ReentrantLock
protected final boolean tryRelease(int releases) {
    int c = getState() - releases;
    // 1、Kiểm tra xem thread giữ lock có phải thread hiện tại không
    if (Thread.currentThread() != getExclusiveOwnerThread())
        throw new IllegalMonitorStateException();
    boolean free = false;
    // 2、Nếu state là 0, chỉ ra thread hiện tại không còn số lần reentry. Do đó cập nhật free thành true, chỉ ra thread này sẽ giải phóng lock.
    if (c == 0) {
        free = true;
        // 3、Cập nhật thread giữ tài nguyên thành null
        setExclusiveOwnerThread(null);
    }
    // 4、Cập nhật giá trị state
    setState(c);
    return free;
}
```

Trong phương thức `tryRelease()`, trước tiên tính giá trị `state` sau khi giải phóng lock, kiểm tra xem giá trị `state` có bằng 0 không.

- Nếu `state == 0`, chỉ ra thread không còn số lần reentry, cập nhật `free = true` và sửa thread giữ tài nguyên thành null, chỉ ra thread hoàn toàn giải phóng lock này.
- Nếu `state != 0`, chỉ ra thread vẫn còn số lần reentry, do đó không cập nhật giá trị `free`, giá trị `free` là `false` chỉ ra thread chưa hoàn toàn giải phóng lock này.

Sau đó cập nhật giá trị `state` và trả về giá trị `free`, giá trị `free` chỉ ra thread có hoàn toàn giải phóng lock không.

**2、Đánh thức node successor**

Nếu `tryRelease()` trả về `true`, chỉ ra thread không còn số lần reentry, lock đã được hoàn toàn giải phóng, do đó cần đánh thức node successor.

Trước khi đánh thức node successor, cần kiểm tra xem có thể đánh thức node successor không, điều kiện kiểm tra là: `h != null && h.waitStatus != 0`. Đây là giải thích tại sao cần kiểm tra như vậy:

- `h == null`: Chỉ ra node `head` chưa được khởi tạo, tức là hàng đợi trong AQS chưa được khởi tạo, do đó không thể đánh thức node thread trong hàng đợi.
- `h != null && h.waitStatus == 0`: Chỉ ra head node vừa mới khởi tạo xong (trạng thái khởi tạo của node là 0), thread node successor chưa vào hàng đợi thành công, do đó không cần đánh thức node tiếp theo. (Khi node successor vào hàng đợi, sẽ sửa trạng thái node predecessor thành `SIGNAL`, chỉ ra cần đánh thức node successor)
- `h != null && h.waitStatus != 0`: Trong đó `waitStatus` có thể lớn hơn 0 hoặc nhỏ hơn 0. Trong đó `> 0` chỉ ra node đã hủy chờ lấy tài nguyên, `< 0` chỉ ra node đang ở trạng thái chờ bình thường.

Tiếp theo vào phương thức `unparkSuccessor()` để xem cách đánh thức node successor:

```JAVA
// AQS: Tham số đầu vào ở đây là head node của hàng đợi (virtual head node)
private void unparkSuccessor(Node node) {
    int ws = node.waitStatus;
    // 1、Xóa trạng thái của head node để chuẩn bị cho việc đánh thức tiếp theo.
    if (ws < 0)
        compareAndSetWaitStatus(node, ws, 0);

    Node s = node.next;
    // 2、Nếu node successor bất thường, cần duyệt từ tail về trước để tìm node trạng thái bình thường để đánh thức.
    if (s == null || s.waitStatus > 0) {
        s = null;
        for (Node t = tail; t != null && t != node; t = t.prev)
            if (t.waitStatus <= 0)
                s = t;
    }
    if (s != null)
        // 3、Đánh thức node successor
        LockSupport.unpark(s.thread);
}
```

Trong `unparkSuccessor()`, nếu trạng thái của head node `< 0` (trong điều kiện bình thường, chỉ cần có node successor, trạng thái head node phải là `SIGNAL`, tức là -1), chỉ ra cần đánh thức node successor, do đó ở đây xóa trước nhãn trạng thái head node, cập nhật trạng thái thành 0, chỉ ra đã thực hiện thao tác đánh thức node tiếp theo.

Nếu `s == null` hoặc `s.waitStatus > 0`, chỉ ra node successor bất thường, lúc này không thể đánh thức node bất thường, mà phải tìm node trạng thái bình thường để đánh thức.

Do đó cần duyệt từ con trỏ `tail` về trước, để tìm node đầu tiên có trạng thái bình thường (`waitStatus <= 0`) để đánh thức.

**Tại sao cần duyệt từ con trỏ `tail` về trước, thay vì từ con trỏ `head` về sau để tìm node trạng thái bình thường?**

Hướng duyệt liên quan đến **thao tác vào hàng đợi của node**. Phương thức vào hàng đợi như sau:

```JAVA
// AQS: Phương thức node vào hàng đợi
private Node addWaiter(Node mode) {
    Node node = new Node(Thread.currentThread(), mode);
    Node pred = tail;
    if (pred != null) {
        // 1、Sửa con trỏ prev trước.
        node.prev = pred;
        if (compareAndSetTail(pred, node)) {
            // 2、Sau đó mới sửa con trỏ next.
            pred.next = node;
            return node;
        }
    }
    enq(node);
    return node;
}
```

Trong phương thức `addWaiter()`, node `node` vào hàng đợi cần sửa hai con trỏ `node.prev` và `pred.next`, nhưng hai thao tác này không phải **atomic operation**, sửa con trỏ `node.prev` trước, sau đó mới sửa con trỏ `pred.next`.

Trong trường hợp cực đoan, có thể xảy ra tình huống trạng thái của node tiếp theo sau node `head` là `CANCELLED`, lúc này node mới vào hàng đợi chỉ cập nhật con trỏ `node.prev`, chưa cập nhật con trỏ `pred.next`, như hình:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-addWaiter.png)

Như vậy nếu duyệt từ con trỏ `head` về sau, không thể tìm thấy node mới vào hàng đợi, do đó cần duyệt từ con trỏ `tail` về trước để tìm node mới vào hàng đợi.

### Minh họa nguyên lý hoạt động AQS (Exclusive mode)

Đến đây, source code lấy và giải phóng tài nguyên trong AQS ở exclusive mode đã được giải thích xong. Để có nhận thức rõ ràng hơn về nguyên lý hoạt động AQS và sự thay đổi trạng thái node, tiếp theo sẽ thông qua vẽ hình để hiểu toàn bộ nguyên lý hoạt động AQS.

Vì AQS là công cụ đồng bộ tầng dưới, các phương thức lấy và giải phóng tài nguyên không cung cấp triển khai cụ thể, do đó ở đây dựa trên `ReentrantLock` để vẽ hình giải thích.

Giả sử tổng cộng có 3 thread cố gắng lấy lock, các thread lần lượt là `T1`, `T2` và `T3`.

Lúc này, giả sử thread `T1` lấy được lock trước, thread `T2` xếp hàng chờ lấy lock. Trước khi thread `T2` vào hàng đợi, cần khởi tạo hàng đợi nội bộ AQS. Node `head` sau khi khởi tạo có trạng thái là `0`. Hàng đợi nội bộ AQS sau khi khởi tạo như hình:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process.png)

Lúc này, thread `T2` cố gắng lấy lock. Vì thread `T1` giữ lock, thread `T2` sẽ vào hàng đợi chờ lấy lock. Đồng thời cập nhật trạng thái node predecessor (node `head`) từ `0` thành `SIGNAL`, chỉ ra cần đánh thức node successor của node `head`. Lúc này, hàng đợi nội bộ AQS như hình:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-2.png)

Lúc này, thread `T3` cố gắng lấy lock. Vì thread `T1` giữ lock, thread `T3` sẽ vào hàng đợi chờ lấy lock. Đồng thời cập nhật trạng thái node predecessor (node thread `T2`) từ `0` thành `SIGNAL`, chỉ ra node thread `T2` cần đánh thức node successor. Lúc này, hàng đợi nội bộ AQS như hình:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-3.png)

Lúc này, giả sử thread `T1` giải phóng lock, sẽ đánh thức node successor `T2`. Sau khi thread `T2` được đánh thức, lấy được lock và thoát ra khỏi hàng đợi chờ.

Ở đây node thread `T2` thoát khỏi hàng đợi chờ không phải là xóa trực tiếp khỏi hàng đợi, mà là làm cho node thread `T2` trở thành node `head` mới, qua đó thoát khỏi việc chờ lấy tài nguyên. Lúc này hàng đợi nội bộ AQS như sau:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-4.png)

Lúc này, giả sử thread `T2` giải phóng lock, sẽ đánh thức node successor `T3`. Sau khi thread `T3` lấy được lock, cũng thoát khỏi hàng đợi chờ, tức là làm cho node thread `T3` thành node `head` để thoát khỏi việc chờ lấy tài nguyên. Lúc này hàng đợi nội bộ AQS như sau:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/aqs-acquire-and-release-process-5.png)

### Phân tích source code lấy tài nguyên AQS (Shared mode)

Phương thức entry trong AQS để lấy tài nguyên ở shared mode là `acquireShared()`, như sau:

```JAVA
// AQS
public final void acquireShared(int arg) {
    if (tryAcquireShared(arg) < 0)
        doAcquireShared(arg);
}
```

Trong phương thức `acquireShared()`, trước tiên sẽ thử lấy shared lock, nếu lấy thất bại, sẽ thêm thread hiện tại vào hàng đợi để block, chờ đánh thức để thử lấy shared lock, tương ứng với hai phương thức sau: `tryAcquireShared()` và `doAcquireShared()`.

Trong đó phương thức `tryAcquireShared()` là template method mà AQS cung cấp, do bộ đồng bộ triển khai logic cụ thể. Do đó ở đây lấy `Semaphore` làm ví dụ để phân tích cách lấy tài nguyên trong shared mode.

#### Phân tích `tryAcquireShared()`

`Semaphore` triển khai cả fair lock và non-fair lock, tiếp theo lấy non-fair lock làm ví dụ để phân tích source code `tryAcquireShared()`.

Phương thức `tryAcquireShared()` được override trong `Semaphore` sẽ gọi phương thức `nonfairTryAcquireShared()` dưới đây:

```JAVA
// Semaphore override template method của AQS
protected int tryAcquireShared(int acquires) {
    return nonfairTryAcquireShared(acquires);
}

// Semaphore
final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
        // 1、Lấy số lượng tài nguyên khả dụng.
        int available = getState();
        // 2、Tính số lượng tài nguyên còn lại.
        int remaining = available - acquires;
        // 3、Nếu số lượng tài nguyên còn lại < 0, tức là tài nguyên không đủ, trả về trực tiếp; nếu CAS cập nhật state thành công, tức là thread hiện tại lấy được tài nguyên dùng chung, trả về trực tiếp.
        if (remaining < 0 ||
            compareAndSetState(available, remaining))
            return remaining;
    }
}
```

Trong shared mode, giá trị `state` trong AQS biểu thị số lượng tài nguyên dùng chung.

Trong phương thức `nonfairTryAcquireShared()`, sẽ liên tục thử lấy tài nguyên trong vòng lặp vô hạn, nếu "số tài nguyên còn lại không đủ" hoặc "thread hiện tại lấy được tài nguyên thành công", thoát vòng lặp vô hạn. Phương thức trả về **số lượng tài nguyên còn lại**, dựa trên giá trị trả về khác nhau, có 3 trường hợp:

- **Số lượng tài nguyên còn lại > 0**: Chỉ ra lấy tài nguyên thành công, và thread tiếp theo cũng có thể lấy được tài nguyên.
- **Số lượng tài nguyên còn lại = 0**: Chỉ ra lấy tài nguyên thành công, nhưng thread tiếp theo không thể lấy được tài nguyên.
- **Số lượng tài nguyên còn lại < 0**: Chỉ ra lấy tài nguyên thất bại.

#### Phân tích `doAcquireShared()`

Để tiện đọc, ở đây dán lại phương thức entry lấy tài nguyên `acquireShared()`:

```JAVA
// AQS
public final void acquireShared(int arg) {
    if (tryAcquireShared(arg) < 0)
        doAcquireShared(arg);
}
```

Trong phương thức `acquireShared()`, trước tiên sẽ thử lấy tài nguyên thông qua `tryAcquireShared()`.

Nếu phát hiện giá trị trả về của phương thức `< 0`, tức là số tài nguyên còn lại nhỏ hơn 0, chỉ ra thread hiện tại lấy tài nguyên thất bại. Do đó sẽ vào phương thức `doAcquireShared()`, thêm thread hiện tại vào hàng đợi AQS để chờ. Như sau:

```JAVA
// AQS
private void doAcquireShared(int arg) {
    // 1、Thêm thread hiện tại vào hàng đợi chờ.
    final Node node = addWaiter(Node.SHARED);
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            final Node p = node.predecessor();
            if (p == head) {
                // 2、Nếu thread hiện tại là node đầu tiên trong hàng đợi chờ, thử lấy tài nguyên.
                int r = tryAcquireShared(arg);
                if (r >= 0) {
					// 3、Loại bỏ node thread hiện tại khỏi hàng đợi chờ, và đánh thức các node thread tiếp theo.
                    setHeadAndPropagate(node, r);
                    p.next = null; // help GC
                    if (interrupted)
                        selfInterrupt();
                    failed = false;
                    return;
                }
            }
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        // 3、Nếu lấy tài nguyên thất bại, sẽ hủy lấy tài nguyên, cập nhật trạng thái node thành CANCELLED.
        if (failed)
            cancelAcquire(node);
    }
}
```

Vì thread hiện tại đã thử lấy tài nguyên thất bại, do đó trong phương thức `doAcquireShared()`, cần đóng gói thread hiện tại thành Node node, thêm vào hàng đợi để chờ.

Sự khác biệt lớn nhất giữa lấy tài nguyên theo **shared mode** và **exclusive mode** là: trong shared mode, số lượng tài nguyên có thể lớn hơn 1, tức là nhiều thread có thể cùng giữ tài nguyên.

Do đó trong shared mode, khi thread được đánh thức và lấy được tài nguyên, nếu phát hiện vẫn còn tài nguyên dư, sẽ thử đánh thức thread phía sau để thử lấy tài nguyên. Phương thức `setHeadAndPropagate()` tương ứng như sau:

```JAVA
// AQS
private void setHeadAndPropagate(Node node, int propagate) {
    Node h = head;
    // 1、Loại bỏ node thread hiện tại khỏi hàng đợi chờ.
    setHead(node);
	// 2、Đánh thức node chờ tiếp theo.
    if (propagate > 0 || h == null || h.waitStatus < 0 ||
        (h = head) == null || h.waitStatus < 0) {
        Node s = node.next;
        if (s == null || s.isShared())
            doReleaseShared();
    }
}
```

Trong phương thức `setHeadAndPropagate()`, đánh thức node tiếp theo cần thỏa mãn một số điều kiện nhất định, chủ yếu cần thỏa mãn 2 điều kiện:

- `propagate > 0`: `propagate` đại diện cho số lượng tài nguyên còn lại sau khi lấy tài nguyên, nếu `> 0`, có thể đánh thức thread tiếp theo để lấy tài nguyên.
- `h.waitStatus < 0`: `h` node ở đây là node `head` trước khi thực thi `setHead()`. Khi kiểm tra `head.waitStatus` sử dụng `< 0`, chủ yếu để xác nhận trạng thái node `head` là `SIGNAL` hay `PROPAGATE`. Nếu node `head` là `SIGNAL`, có thể đánh thức node tiếp theo; nếu trạng thái node `head` là `PROPAGATE`, cũng có thể đánh thức node tiếp theo (đây là để giải quyết vấn đề xuất hiện trong tình huống concurrency, sẽ giải thích chi tiết sau).

Câu lệnh `if` về **đánh thức node chờ tiếp theo** trong code hơi phức tạp, ở đây sẽ giải thích tại sao viết như vậy:

```JAVA
if (propagate > 0 || h == null || h.waitStatus < 0 ||
    (h = head) == null || h.waitStatus < 0)
```

- `h == null || h.waitStatus < 0`: `h == null` dùng để ngăn null pointer exception. Trong điều kiện bình thường h sẽ không là `null`, vì trước khi thực thi đến đây, node hiện tại đã vào hàng đợi rồi, hàng đợi không thể chưa được khởi tạo.

  `h.waitStatus < 0` chủ yếu kiểm tra trạng thái node `head` có phải `SIGNAL` hay `PROPAGATE`, dùng `< 0` để kiểm tra trực tiếp khá tiện.

- `(h = head) == null || h.waitStatus < 0`: Nếu đến đây chỉ ra kiểm tra `h.waitStatus < 0` trước đó, tức là có concurrency.

  Đồng thời có thread khác đang đánh thức node tiếp theo, đã sửa giá trị node `head` từ `SIGNAL` thành `0`. Do đó, ở đây lấy lại node `head` mới, lần này node `head` được lấy là node thread hiện tại được đặt bởi `setHead()`, sau đó kiểm tra lại trạng thái `waitStatus`.

Nếu điều kiện `if` thỏa mãn, sẽ đi vào phương thức `doReleaseShared()` để đánh thức node chờ tiếp theo, như sau:

```JAVA
private void doReleaseShared() {
    for (;;) {
        Node h = head;
        // 1、Hàng đợi cần có ít nhất một node thread đang chờ.
        if (h != null && h != tail) {
            int ws = h.waitStatus;
            // 2、Nếu trạng thái node head là SIGNAL, có thể đánh thức node successor.
            if (ws == Node.SIGNAL) {
                // 2.1 Xóa trạng thái SIGNAL của node head, cập nhật thành 0. Chỉ ra đã đánh thức node successor của node này.
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue;
                // 2.2 Đánh thức node successor
                unparkSuccessor(h);
            }
            // 3、Nếu trạng thái node head là 0, cập nhật thành PROPAGATE. Đây là để giải quyết vấn đề tồn tại trong tình huống concurrency, sẽ giải thích chi tiết sau.
            else if (ws == 0 &&
                     !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                continue;
        }
        if (h == head)
            break;
    }
}
```

Trong phương thức `doReleaseShared()`, sẽ kiểm tra trạng thái `waitStatus` của node `head` để quyết định thao tác tiếp theo, có hai trường hợp:

- Trạng thái node `head` là `SIGNAL`: Chỉ ra node `head` có node successor cần được đánh thức, do đó thông qua thao tác `CAS` cập nhật trạng thái `SIGNAL` của node `head` thành `0`. Thông qua việc xóa trạng thái `SIGNAL` để chỉ ra đã thực hiện thao tác đánh thức node successor của node `head`.
- Trạng thái node `head` là `0`: Chỉ ra có tình huống concurrency, cần sửa `0` thành `PROPAGATE` để đảm bảo có thể đánh thức thread bình thường trong tình huống concurrency.

#### Tại sao cần trạng thái `PROPAGATE`?

Khi giải phóng tài nguyên trong `doReleaseShared()`, bước 3 không dễ hiểu, tức là nếu phát hiện trạng thái node `head` là `0`, cập nhật trạng thái node `head` từ `0` thành `PROPAGATE`.

`PROPAGATE` của Node trong AQS được dùng để xử lý vấn đề không thể đánh thức node thread có thể xảy ra trong tình huống concurrency. `PROPAGATE` chỉ được dùng một lần trong phương thức `doReleaseShared()`.

**Tiếp theo thông qua phân tích ví dụ, tại sao cần trạng thái `PROPAGATE`?**

Trong shared mode, chuỗi gọi phương thức lấy và giải phóng tài nguyên của thread như sau:

- Chuỗi gọi phương thức lấy tài nguyên của thread: `acquireShared() -> tryAcquireShared() -> thread block chờ đánh thức -> tryAcquireShared() -> setHeadAndPropagate() -> nếu (số tài nguyên còn lại > 0) || (head.waitStatus < 0) thì đánh thức node tiếp theo`.

- Chuỗi gọi phương thức giải phóng tài nguyên của thread: `releaseShared() -> tryReleaseShared() -> doReleaseShared()`.

**Nếu khi giải phóng tài nguyên không đổi trạng thái node `head` từ `0` thành `PROPAGATE`:**

Giả sử tổng cộng có 4 thread cố gắng lấy tài nguyên theo shared mode, tổng cộng có 2 tài nguyên. Ban đầu thread `T3` và `T4` lấy được tài nguyên, thread `T1` và `T2` không lấy được, do đó xếp hàng chờ trong hàng đợi.

- Tại thời điểm 1, thread `T1` và `T2` đang chờ trong hàng đợi, `T3` và `T4` giữ tài nguyên. Lúc này các node trong hàng đợi chờ và trạng thái tương ứng (trong ngoặc đơn là trạng thái `waitStatus` của node):

  `head(-1) -> T1(-1) -> T2(0)`.

- Tại thời điểm 2, thread `T3` giải phóng tài nguyên, thông qua phương thức `doReleaseShared()` cập nhật trạng thái node `head` từ `SIGNAL` thành `0` và đánh thức thread `T1`, sau đó thread `T3` thoát ra.

  Sau khi thread `T1` được đánh thức, lấy được tài nguyên thông qua `tryAcquireShared()`, nhưng lúc này chưa kịp thực thi `setHeadAndPropagate()` để đặt mình làm node `head`. Lúc này trạng thái node trong hàng đợi chờ là:

  `head(0) -> T1(-1) -> T2(0)`.

- Tại thời điểm 3, thread `T4` giải phóng tài nguyên, vì lúc này trạng thái node `head` là `0`, do đó trong phương thức `doReleaseShared()` không thể đánh thức node successor của `head`, sau đó thread `T4` thoát ra.

- Tại thời điểm 4, thread `T1` tiếp tục thực thi phương thức `setHeadAndPropagate()` để đặt mình làm node `head`.

  Nhưng lúc này vì phương thức `tryAcquireShared()` được thread `T1` thực thi trả về số tài nguyên còn lại là `0`, và trạng thái node `head` là `0`, do đó thread `T1` sẽ không đánh thức node tiếp theo trong phương thức `setHeadAndPropagate()`. Lúc này trạng thái node trong hàng đợi chờ là:

  `head(-1, node thread T1) -> T2(0)`.

Lúc này dẫn đến node thread `T2` đang chờ trong hàng đợi mà không thể bị đánh thức. Bảng thời điểm tương ứng như sau:

| Thời điểm   | Thread T1                                                                         | Thread T2    | Thread T3                        | Thread T4                                                                                                 | Hàng đợi chờ                        |
| ----------- | --------------------------------------------------------------------------------- | ------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Thời điểm 1 | Hàng đợi chờ                                                                      | Hàng đợi chờ | Giữ tài nguyên                   | Giữ tài nguyên                                                                                            | `head(-1) -> T1(-1) -> T2(0)`       |
| Thời điểm 2 | (Thực thi) Được đánh thức, lấy tài nguyên nhưng chưa kịp đặt mình làm node `head` | Hàng đợi chờ | (Thực thi) Giải phóng tài nguyên | Giữ tài nguyên                                                                                            | `head(0) -> T1(-1) -> T2(0)`        |
| Thời điểm 3 |                                                                                   | Hàng đợi chờ | Đã thoát                         | (Thực thi) Giải phóng tài nguyên. Nhưng trạng thái node `head` là `0`, không thể đánh thức node successor | `head(0) -> T1(-1) -> T2(0)`        |
| Thời điểm 4 | (Thực thi) Đặt mình làm node `head`                                               | Hàng đợi chờ | Đã thoát                         | Đã thoát                                                                                                  | `head(-1, node thread T1) -> T2(0)` |

**Nếu khi giải phóng tài nguyên, đổi trạng thái node `head` từ `0` thành `PROPAGATE`, có thể giải quyết vấn đề concurrency xuất hiện ở trên, như sau:**

- Tại thời điểm 1, thread `T1` và `T2` đang chờ trong hàng đợi, `T3` và `T4` giữ tài nguyên. Lúc này các node trong hàng đợi chờ và trạng thái tương ứng là:

  `head(-1) -> T1(-1) -> T2(0)`.

- Tại thời điểm 2, thread `T3` giải phóng tài nguyên, thông qua phương thức `doReleaseShared()` cập nhật trạng thái node `head` từ `SIGNAL` thành `0` và đánh thức thread `T1`, sau đó thread `T3` thoát ra.

  Sau khi thread `T1` được đánh thức, lấy được tài nguyên thông qua `tryAcquireShared()`, nhưng lúc này chưa kịp thực thi `setHeadAndPropagate()` để đặt mình làm node `head`. Lúc này trạng thái node trong hàng đợi chờ là:

  `head(0) -> T1(-1) -> T2(0)`.

- Tại thời điểm 3, thread `T4` giải phóng tài nguyên, vì lúc này trạng thái node `head` là `0`, do đó trong phương thức `doReleaseShared()` sẽ cập nhật trạng thái node `head` từ `0` thành `PROPAGATE`, sau đó thread `T4` thoát ra. Lúc này trạng thái node trong hàng đợi chờ là:

  `head(PROPAGATE) -> T1(-1) -> T2(0)`.

- Tại thời điểm 4, thread `T1` tiếp tục thực thi phương thức `setHeadAndPropagate()` để đặt mình làm node `head`. Lúc này trạng thái node trong hàng đợi chờ là:

  `head(-1, node thread T1) -> T2(0)`.

- Tại thời điểm 5, mặc dù lúc này phương thức `tryAcquireShared()` được thread `T1` thực thi trả về số tài nguyên còn lại là `0`, nhưng trạng thái node `head` là `PROPAGATE < 0` (node `head` ở đây là node `head` cũ, không phải node thread `T1` vừa trở thành node `head`).

  Do đó thread `T1` sẽ đánh thức node `T2` tiếp theo trong phương thức `setHeadAndPropagate()`, và cập nhật trạng thái node `head` từ `SIGNAL` thành `0`. Lúc này trạng thái node trong hàng đợi chờ là:

  `head(0, node thread T1) -> T2(0)`.

- Tại thời điểm 6, sau khi thread `T2` được đánh thức, lấy được tài nguyên và đặt mình làm node `head`. Lúc này trạng thái node trong hàng đợi chờ là:

  `head(0, node thread T2)`.

Với trạng thái `PROPAGATE`, có thể tránh tình huống thread `T2` không thể bị đánh thức. Bảng thời điểm tương ứng như sau:

| Thời điểm   | Thread T1                                                                                                                                                                                                                        | Thread T2                                                                              | Thread T3                        | Thread T4                                                                                             | Hàng đợi chờ                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Thời điểm 1 | Hàng đợi chờ                                                                                                                                                                                                                     | Hàng đợi chờ                                                                           | Giữ tài nguyên                   | Giữ tài nguyên                                                                                        | `head(-1) -> T1(-1) -> T2(0)`        |
| Thời điểm 2 | (Thực thi) Được đánh thức, lấy tài nguyên nhưng chưa kịp đặt mình làm node `head`                                                                                                                                                | Hàng đợi chờ                                                                           | (Thực thi) Giải phóng tài nguyên | Giữ tài nguyên                                                                                        | `head(0) -> T1(-1) -> T2(0)`         |
| Thời điểm 3 | Chưa tiếp tục thực thi                                                                                                                                                                                                           | Hàng đợi chờ                                                                           | Đã thoát                         | (Thực thi) Giải phóng tài nguyên. Lúc này sẽ cập nhật trạng thái node `head` từ `0` thành `PROPAGATE` | `head(PROPAGATE) -> T1(-1) -> T2(0)` |
| Thời điểm 4 | (Thực thi) Đặt mình làm node `head`                                                                                                                                                                                              | Hàng đợi chờ                                                                           | Đã thoát                         | Đã thoát                                                                                              | `head(-1, node thread T1) -> T2(0)`  |
| Thời điểm 5 | (Thực thi) Vì trạng thái node `head` là `PROPAGATE < 0`, do đó sẽ đánh thức node tiếp theo trong phương thức `setHeadAndPropagate()`, lúc này cập nhật trạng thái node `head` mới từ `SIGNAL` thành `0` và đánh thức thread `T2` | Hàng đợi chờ                                                                           | Đã thoát                         | Đã thoát                                                                                              | `head(0, node thread T1) -> T2(0)`   |
| Thời điểm 6 | Đã thoát                                                                                                                                                                                                                         | (Thực thi) Thread `T2` được đánh thức, lấy được tài nguyên và đặt mình làm node `head` | Đã thoát                         | Đã thoát                                                                                              | `head(0, node thread T2)`            |

### Phân tích source code giải phóng tài nguyên AQS (Shared mode)

Phương thức entry trong AQS để giải phóng tài nguyên ở shared mode là `releaseShared()`, code như sau:

```JAVA
// AQS
public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}
```

Trong đó phương thức `tryReleaseShared()` là template method mà AQS cung cấp, ở đây vẫn lấy `Semaphore` để giải thích, như sau:

```JAVA
// Semaphore
protected final boolean tryReleaseShared(int releases) {
    for (;;) {
        int current = getState();
        int next = current + releases;
        if (next < current) // overflow
            throw new Error("Maximum permit count exceeded");
        if (compareAndSetState(current, next))
            return true;
    }
}
```

Trong phương thức `tryReleaseShared()` được `Semaphore` triển khai, sẽ liên tục thử giải phóng tài nguyên trong vòng lặp vô hạn, tức là thông qua thao tác `CAS` để cập nhật giá trị `state`.

Nếu cập nhật thành công, chứng tỏ giải phóng tài nguyên thành công, sẽ vào phương thức `doReleaseShared()`.

Phương thức `doReleaseShared()` đã được phân tích chi tiết source code trong phần lấy tài nguyên (shared mode) phía trên, không lặp lại ở đây.

### Cơ chế hoạt động của Condition condition queue

Ở trên trong bảng trạng thái `waitStatus` đã đề cập đến trạng thái `CONDITION` (giá trị -2), chỉ ra node đang chờ trong Condition condition queue. Ở đây sẽ giải thích có hệ thống cơ chế hoạt động của Condition condition queue.

#### Condition là gì?

`Condition` là interface được định nghĩa trong package `java.util.concurrent.locks`, nó cung cấp cơ chế thread wait/notify tương tự như `Object.wait()` / `Object.notify()`, nhưng mạnh mẽ và linh hoạt hơn. `Condition` phải được sử dụng kết hợp với `Lock`, giống như `wait/notify` phải được sử dụng kết hợp với `synchronized`.

So với `wait/notify` của `Object`, ưu điểm chính của `Condition` là:

- **Hỗ trợ nhiều hàng đợi chờ**: Một `Lock` có thể tạo nhiều instance `Condition`, các thread khác nhau có thể chờ trên các điều kiện khác nhau, thực hiện cộng tác thread tinh tế hơn. Trong khi `synchronized` chỉ có một hàng đợi chờ.
- **Hỗ trợ chờ không phản hồi interrupt**: `Condition` cung cấp phương thức `awaitUninterruptibly()`.
- **Hỗ trợ chờ có timeout**: `Condition` cung cấp phương thức `awaitNanos(long)` và `await(long, TimeUnit)`, có thể đặt deadline chờ.

#### Hai loại hàng đợi trong AQS

Thực tế AQS bên trong duy trì **hai loại hàng đợi**:

1. **Sync queue (CLH variant queue)**: Chính là hàng đợi hai chiều đã phân tích chi tiết ở trên, dùng để lưu trữ các node thread đang chờ vì lấy tài nguyên thất bại.
2. **Condition queue**: Là linked list một chiều, dùng để lưu trữ các node thread đang chờ vì đã gọi phương thức `Condition.await()`. Mỗi instance `Condition` duy trì một condition queue độc lập.

Các node trong condition queue sử dụng con trỏ `nextWaiter` của `Node` để liên kết node tiếp theo, tạo thành linked list một chiều. Head node của condition queue là `firstWaiter`, tail node là `lastWaiter`.

#### Quy trình hoạt động cốt lõi của Condition

Inner class `ConditionObject` của AQS triển khai interface `Condition`, các phương thức cốt lõi là `await()` và `signal()`.

**Quy trình hoạt động của phương thức `await()`:**

1. Đóng gói thread hiện tại thành node `Node` (`waitStatus` đặt thành `CONDITION`), thêm vào tail của condition queue.
2. Hoàn toàn giải phóng lock mà thread hiện tại giữ (tức là đặt giá trị `state` thành 0) và lưu giá trị `state` trước khi giải phóng.
3. Block thread hiện tại, chờ được `signal()` đánh thức hoặc bị interrupt.
4. Sau khi được đánh thức, vào lại sync queue để cạnh tranh lock thông qua `acquireQueued()`, và khôi phục giá trị `state` (số lần reentry) đã lưu trước đó.

**Quy trình hoạt động của phương thức `signal()`:**

1. Kiểm tra xem thread gọi `signal()` có giữ lock không (không giữ thì ném `IllegalMonitorStateException`).
2. Loại bỏ node đầu tiên đang chờ trong condition queue khỏi condition queue.
3. Sửa `waitStatus` của node từ `CONDITION` thành `0`, và thêm vào tail của sync queue thông qua phương thức `enq()`.
4. Nếu trạng thái node predecessor trong sync queue bất thường (`CANCELLED`) hoặc CAS đặt trạng thái node predecessor thành `SIGNAL` thất bại, thì đánh thức trực tiếp thread đó.

Phương thức `signalAll()` tương tự như `signal()`, sự khác biệt là nó sẽ chuyển **tất cả** node trong condition queue vào sync queue.

Code ví dụ dưới đây thể hiện cách sử dụng điển hình của `Condition` — triển khai một bounded blocking queue đơn giản:

```java
import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class SimpleBlockingQueue<T> {
    private final Queue<T> queue = new LinkedList<>();
    private final int capacity;
    private final ReentrantLock lock = new ReentrantLock();
    // Hai condition queue khác nhau: lần lượt dùng cho "hàng đợi không đầy" và "hàng đợi không rỗng"
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();

    public SimpleBlockingQueue(int capacity) {
        this.capacity = capacity;
    }

    /**
     * Thêm phần tử vào hàng đợi, nếu hàng đợi đầy thì chờ.
     */
    public void put(T item) throws InterruptedException {
        lock.lock();
        try {
            // Khi hàng đợi đầy, chờ trên điều kiện notFull
            while (queue.size() == capacity) {
                notFull.await();
            }
            queue.offer(item);
            // Sau khi thêm phần tử, thông báo cho consumer thread đang chờ trên điều kiện notEmpty
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    /**
     * Lấy phần tử từ hàng đợi, nếu hàng đợi rỗng thì chờ.
     */
    public T take() throws InterruptedException {
        lock.lock();
        try {
            // Khi hàng đợi rỗng, chờ trên điều kiện notEmpty
            while (queue.isEmpty()) {
                notEmpty.await();
            }
            T item = queue.poll();
            // Sau khi lấy phần tử, thông báo cho producer thread đang chờ trên điều kiện notFull
            notFull.signal();
            return item;
        } finally {
            lock.unlock();
        }
    }

    public static void main(String[] args) {
        SimpleBlockingQueue<Integer> blockingQueue = new SimpleBlockingQueue<>(5);

        // Producer thread
        Thread producer = new Thread(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    blockingQueue.put(i);
                    System.out.println("生产: " + i);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Producer");

        // Consumer thread
        Thread consumer = new Thread(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    int item = blockingQueue.take();
                    System.out.println("消费: " + item);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Consumer");

        producer.start();
        consumer.start();
    }
}
```

Trong ví dụ trên, `notFull` và `notEmpty` là hai instance `Condition` độc lập, mỗi instance duy trì condition queue riêng. Producer chờ trên `notFull` khi hàng đợi đầy, consumer chờ trên `notEmpty` khi hàng đợi rỗng. Thiết kế tách biệt điều kiện chờ này tránh được việc đánh thức thread không cần thiết, hiệu quả hơn `synchronized` + `wait/notifyAll`.

#### Phân tích source code cốt lõi của `await()`

```java
// AQS inner class ConditionObject
public final void await() throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    // 1、Đóng gói thread hiện tại thành Node node, thêm vào condition queue
    Node node = addConditionWaiter();
    // 2、Hoàn toàn giải phóng lock, và lưu giá trị state trước khi giải phóng
    int savedState = fullyRelease(node);
    int interruptMode = 0;
    // 3、Nếu node không trong sync queue, block thread hiện tại
    while (!isOnSyncQueue(node)) {
        LockSupport.park(this);
        if ((interruptMode = checkInterruptWhileWaiting(node)) != 0)
            break;
    }
    // 4、Sau khi được đánh thức, vào lại sync queue để cạnh tranh lock
    if (acquireQueued(node, savedState) && interruptMode != THROW_IE)
        interruptMode = REINTERRUPT;
    if (node.nextWaiter != null)
        unlinkCancelledWaiters();
    if (interruptMode != 0)
        reportInterruptAfterWait(interruptMode);
}
```

Phương thức `await()` có hai thao tác then chốt:

- `fullyRelease(node)`: Hoàn toàn giải phóng lock (chứ không chỉ giải phóng một lần), như vậy dù thread đã reenter lock nhiều lần, trong thời gian chờ vẫn có thể cho thread khác lấy lock. Sau khi được đánh thức sẽ khôi phục số lần reentry trước đó thông qua `acquireQueued(node, savedState)`.
- `isOnSyncQueue(node)`: Kiểm tra xem node có đã được chuyển vào sync queue chưa. Khi thread khác gọi `signal()`, node sẽ được chuyển từ condition queue vào sync queue, lúc này `isOnSyncQueue()` trả về `true`, thread thoát vòng lặp `while`, bắt đầu cạnh tranh lock.

### Phân tích sự khác biệt hiệu năng giữa fair lock và non-fair lock

Trong phần phân tích source code phía trên, lấy non-fair lock của `ReentrantLock` làm ví dụ để giải thích triển khai `tryAcquire()`. Thực tế `ReentrantLock` hỗ trợ cả hai chế độ fair lock và non-fair lock. Ở đây phân tích sâu sự khác biệt triển khai của hai loại và ảnh hưởng của chúng đến hiệu năng.

#### Sự khác biệt ở tầng source code

`ReentrantLock` mặc định sử dụng non-fair lock, thông qua tham số constructor có thể chuyển sang fair lock:

```java
// Non-fair lock (mặc định)
ReentrantLock unfairLock = new ReentrantLock();
// Fair lock
ReentrantLock fairLock = new ReentrantLock(true);
```

Sự khác biệt cốt lõi của hai loại nằm ở triển khai phương thức `tryAcquire()`. `nonfairTryAcquire()` của non-fair lock đã được phân tích ở trên, dưới đây xem triển khai fair lock:

```java
// ReentrantLock.FairSync
protected final boolean tryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    if (c == 0) {
        // Sự khác biệt then chốt: trước tiên gọi hasQueuedPredecessors() để kiểm tra xem trong sync queue có thread chờ lâu hơn không
        if (!hasQueuedPredecessors() &&
            compareAndSetState(0, acquires)) {
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
    return false;
}
```

**Sự khác biệt duy nhất** là fair lock có thêm một kiểm tra `hasQueuedPredecessors()` trước khi CAS sửa `state`:

```java
// AQS
public final boolean hasQueuedPredecessors() {
    Node t = tail;
    Node h = head;
    Node s;
    return h != t &&
        ((s = h.next) == null || s.thread != Thread.currentThread());
}
```

Phương thức này dùng để kiểm tra xem trước thread hiện tại có thread khác đang xếp hàng không. Nếu có, thread hiện tại không thể lấy lock trực tiếp mà phải xếp hàng chờ, qua đó đảm bảo tính công bằng **FIFO**.

Còn non-fair lock không có kiểm tra này, khi lock vừa được giải phóng, thread mới đến có thể lấy lock trực tiếp thông qua CAS, dù trong sync queue đã có thread khác đang chờ.

#### So sánh sự khác biệt hiệu năng

| Chiều so sánh          | Non-fair lock (mặc định)                                                                                                             | Fair lock                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| **Throughput**         | Cao hơn. Thread mới có cơ hội lấy lock trực tiếp, giảm context switch của thread                                                     | Thấp hơn. Tất cả thread phải xếp hàng, tăng chi phí context switch                            |
| **Thread starvation**  | Có thể xảy ra. Trong trường hợp cực đoan, một số thread có thể không thể lấy lock trong thời gian dài                                | Không xảy ra. Phân bổ lock nghiêm ngặt theo thứ tự yêu cầu                                    |
| **Context switch**     | Ít hơn. Sau khi thread giữ lock giải phóng lock, thread mới đến có thể lấy lock trực tiếp, không cần đánh thức thread trong hàng đợi | Nhiều hơn. Mỗi lần giải phóng lock đều cần đánh thức thread tiếp theo trong hàng đợi          |
| **Tình huống phù hợp** | Hầu hết tình huống (yêu cầu cao về response time và throughput)                                                                      | Tình huống có yêu cầu nghiêm ngặt về tính công bằng (như phân bổ tài nguyên, lập lịch tác vụ) |

**Tại sao non-fair lock thường có hiệu năng tốt hơn?**

Lý do then chốt là **giảm số lần context switch của thread**. Khi thread A giữ lock giải phóng lock:

- **Non-fair lock**: Lúc này nếu vừa hay có thread B đang cố gắng lấy lock (chưa vào sync queue), thread B có thể lấy lock trực tiếp thông qua CAS và thực thi ngay lập tức, tránh chi phí đánh thức thread trong hàng đợi. Còn thread đang chờ trong hàng đợi sau khi được đánh thức phát hiện lock bị chiếm, sẽ chặn lại, tuy nhìn có vẻ "lãng phí" một lần đánh thức, nhưng nhìn tổng thể giảm số lần chuyển đổi thread.
- **Fair lock**: Thread B phải xếp vào tail hàng đợi, sau đó đánh thức thread ở head hàng đợi. Từ lúc thread được đánh thức đến lúc thực sự bắt đầu thực thi, có một khoảng **scheduling delay** (trạng thái thread chuyển từ blocking sang running), trong khoảng thời gian chờ này lock đang idle, làm giảm mức độ sử dụng lock.

Doug Lea trong tài liệu `ReentrantLock` chỉ ra: chương trình sử dụng fair lock trong môi trường multi-thread thường có tổng throughput thấp hơn chương trình sử dụng non-fair lock (tức là chậm hơn), do đó `ReentrantLock` mặc định sử dụng non-fair mode. Nhưng trong tình huống cần đảm bảo thứ tự xử lý yêu cầu hoặc tránh thread starvation (như phân bổ connection pool), fair lock là lựa chọn tốt hơn.

Dưới đây thông qua ví dụ code để minh chứng sự khác biệt hành vi giữa fair lock và non-fair lock:

```java
import java.util.concurrent.locks.ReentrantLock;

public class FairVsUnfairLockDemo {
    // Lần lượt test fair lock và non-fair lock
    private static void testLock(ReentrantLock lock, String lockType) {
        System.out.println("=== " + lockType + " ===");
        Runnable task = () -> {
            for (int i = 0; i < 2; i++) {
                lock.lock();
                try {
                    System.out.println(Thread.currentThread().getName() + " 获取到锁");
                } finally {
                    lock.unlock();
                }
            }
        };

        Thread[] threads = new Thread[5];
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(task, lockType + "-线程-" + i);
        }
        for (Thread t : threads) {
            t.start();
        }
        for (Thread t : threads) {
            try { t.join(); } catch (InterruptedException e) { }
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // Non-fair lock: cùng một thread có thể liên tục lấy lock nhiều lần
        testLock(new ReentrantLock(false), "非公平锁");

        // Fair lock: các thread lần lượt lấy lock theo thứ tự yêu cầu
        testLock(new ReentrantLock(true), "公平锁");
    }
}
```

Chạy code trên có thể quan sát: trong non-fair lock mode, cùng một thread có thể liên tục lấy lock nhiều lần (vì sau khi giải phóng lock nó lập tức đi cạnh tranh lại, có xác suất cao lấy được lock trước khi thread trong hàng đợi được đánh thức); còn trong fair lock mode, thứ tự thread lấy lock đồng đều hơn, không xảy ra tình huống một thread liên tục chiếm lock.

## Các công cụ đồng bộ hóa phổ biến

### Semaphore (Đèn hiệu)

#### Giới thiệu

`synchronized` và `ReentrantLock` đều chỉ cho phép một thread truy cập vào một tài nguyên tại một thời điểm, trong khi `Semaphore` (đèn hiệu) có thể được dùng để kiểm soát số lượng thread truy cập đồng thời vào một tài nguyên cụ thể.

`Semaphore` sử dụng đơn giản. Giả sử có `N(N>5)` thread cùng muốn lấy tài nguyên chia sẻ từ `Semaphore`, đoạn code dưới đây mô tả rằng tại cùng một thời điểm chỉ có 5 trong số N thread có thể lấy được tài nguyên chia sẻ, các thread còn lại sẽ bị chặn. Chỉ những thread đã lấy được tài nguyên chia sẻ mới được thực thi. Khi một thread giải phóng tài nguyên chia sẻ, các thread đang bị chặn mới có thể lấy được.

```java
// Số lượng tài nguyên chia sẻ ban đầu
final Semaphore semaphore = new Semaphore(5);
// Lấy 1 giấy phép
semaphore.acquire();
// Giải phóng 1 giấy phép
semaphore.release();
```

Khi số lượng tài nguyên ban đầu là 1, `Semaphore` sẽ thoái hóa thành một exclusive lock.

`Semaphore` có hai chế độ:

- **Chế độ công bằng (fair mode):** Thứ tự gọi phương thức `acquire()` chính là thứ tự nhận giấy phép, tuân theo FIFO;
- **Chế độ không công bằng (non-fair mode):** Tranh giành theo kiểu preemptive.

Hai constructor tương ứng của `Semaphore` như sau:

```java
public Semaphore(int permits) {
    sync = new NonfairSync(permits);
}

public Semaphore(int permits, boolean fair) {
    sync = fair ? new FairSync(permits) : new NonfairSync(permits);
}
```

**Cả hai constructor đều phải cung cấp số lượng giấy phép, constructor thứ hai có thể chỉ định chế độ công bằng hay không công bằng, mặc định là chế độ không công bằng.**

`Semaphore` thường được dùng cho các tình huống có giới hạn rõ ràng về số lượng truy cập tài nguyên, chẳng hạn như rate limiting (chỉ áp dụng cho chế độ single machine; trong các dự án thực tế nên dùng Redis + Lua để rate limiting).

#### Nguyên lý

`Semaphore` là một triển khai của shared lock, nó khởi tạo giá trị `state` của AQS là `permits`. Bạn có thể hiểu giá trị `permits` là số lượng giấy phép, chỉ những thread nào lấy được giấy phép mới được thực thi.

Lấy phương thức `acquire` không tham số làm ví dụ, khi gọi `semaphore.acquire()`, thread sẽ cố lấy giấy phép. Nếu `state > 0` thì có thể lấy thành công; nếu `state <= 0` thì số lượng giấy phép không đủ, lấy thất bại.

Nếu có thể lấy thành công (`state > 0`), sẽ cố dùng thao tác CAS để sửa giá trị `state` thành `state=state-1`. Nếu lấy thất bại thì sẽ tạo một Node thêm vào hàng đợi chờ và treo thread hiện tại.

```java
// Lấy 1 giấy phép
public void acquire() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}

// Lấy một hoặc nhiều giấy phép
public void acquire(int permits) throws InterruptedException {
    if (permits < 0) throw new IllegalArgumentException();
    sync.acquireSharedInterruptibly(permits);
}
```

Phương thức `acquireSharedInterruptibly` là triển khai mặc định trong `AbstractQueuedSynchronizer`.

```java
// Lấy giấy phép ở chế độ chia sẻ, trả về nếu thành công, thêm vào hàng đợi chờ và treo thread nếu thất bại
public final void acquireSharedInterruptibly(int arg)
    throws InterruptedException {
    if (Thread.interrupted())
      throw new InterruptedException();
        // Thử lấy giấy phép, arg là số giấy phép muốn lấy, khi lấy thất bại thì tạo node thêm vào hàng đợi chờ và treo thread hiện tại.
    if (tryAcquireShared(arg) < 0)
      doAcquireSharedInterruptibly(arg);
}
```

Tiếp theo, lấy chế độ không công bằng (`NonfairSync`) làm ví dụ để xem triển khai của phương thức `tryAcquireShared`.

```java
// Thử lấy tài nguyên ở chế độ chia sẻ (tài nguyên trong Semaphore chính là giấy phép):
protected int tryAcquireShared(int acquires) {
    return nonfairTryAcquireShared(acquires);
}

// Lấy giấy phép ở chế độ chia sẻ không công bằng
final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
        // Số lượng giấy phép hiện có
        int available = getState();
        /*
         * Thử lấy giấy phép, khi số giấy phép hiện có nhỏ hơn hoặc bằng 0, trả về giá trị âm tức là lấy thất bại,
         * chỉ khi số giấy phép hiện có lớn hơn 0 mới có thể lấy thành công, nếu CAS thất bại sẽ vòng lặp lại để lấy giá trị mới nhất và thử lại
         */
        int remaining = available - acquires;
        if (remaining < 0 ||
            compareAndSetState(available, remaining))
            return remaining;
    }
}
```

Lấy phương thức `release` không tham số làm ví dụ, khi gọi `semaphore.release()`, thread sẽ cố giải phóng giấy phép và dùng thao tác CAS để sửa giá trị `state` thành `state=state+1`. Sau khi giải phóng giấy phép thành công, đồng thời sẽ đánh thức một thread trong hàng đợi chờ. Thread được đánh thức sẽ thử lại việc sửa giá trị `state` thành `state=state-1`, nếu `state > 0` thì lấy token thành công, ngược lại sẽ vào lại hàng đợi chờ và treo thread.

```java
// Giải phóng một giấy phép
public void release() {
    sync.releaseShared(1);
}

// Giải phóng một hoặc nhiều giấy phép
public void release(int permits) {
    if (permits < 0) throw new IllegalArgumentException();
    sync.releaseShared(permits);
}
```

Phương thức `releaseShared` là triển khai mặc định trong `AbstractQueuedSynchronizer`.

```java
// Giải phóng shared lock
// Nếu tryReleaseShared trả về true, thì đánh thức một hoặc nhiều thread trong hàng đợi chờ.
public final boolean releaseShared(int arg) {
    //Giải phóng shared lock
    if (tryReleaseShared(arg)) {
      //Giải phóng node chờ phía sau của node hiện tại
      doReleaseShared();
      return true;
    }
    return false;
}
```

Phương thức `tryReleaseShared` là một phương thức được override bởi lớp nội bộ `Sync` của `Semaphore`. Triển khai mặc định trong `AbstractQueuedSynchronizer` chỉ ném ra ngoại lệ `UnsupportedOperationException`.

```java
// Một phương thức được override trong lớp nội bộ Sync
// Thử giải phóng tài nguyên
protected final boolean tryReleaseShared(int releases) {
    for (;;) {
        int current = getState();
        // Số giấy phép hiện có +1
        int next = current + releases;
        if (next < current) // overflow
            throw new Error("Maximum permit count exceeded");
         // CAS sửa giá trị state
        if (compareAndSetState(current, next))
            return true;
    }
}
```

Có thể thấy, các phương thức được đề cập ở trên về cơ bản đều được triển khai thông qua bộ đồng bộ hóa `sync`. `Sync` là lớp nội bộ của `CountDownLatch`, kế thừa `AbstractQueuedSynchronizer` và override một số phương thức của nó. Ngoài ra, `Sync` còn có hai lớp con là `NonfairSync` (tương ứng với chế độ không công bằng) và `FairSync` (tương ứng với chế độ công bằng).

```java
private static final class Sync extends AbstractQueuedSynchronizer {
  // ...
}
static final class NonfairSync extends Sync {
  // ...
}
static final class FairSync extends Sync {
  // ...
}
```

#### Thực hành

```java
public class SemaphoreExample {
  // Số lượng request
  private static final int threadCount = 550;

  public static void main(String[] args) throws InterruptedException {
    // Tạo một thread pool có số lượng thread cố định (nếu số thread ở đây quá ít bạn sẽ thấy thực thi rất chậm)
    ExecutorService threadPool = Executors.newFixedThreadPool(300);
    // Số lượng giấy phép ban đầu
    final Semaphore semaphore = new Semaphore(20);

    for (int i = 0; i < threadCount; i++) {
      final int threadnum = i;
      threadPool.execute(() -> {// Sử dụng Lambda expression
        try {
          semaphore.acquire();// Lấy 1 giấy phép, vậy số thread có thể chạy là 20/1=20
          test(threadnum);
          semaphore.release();// Giải phóng 1 giấy phép
        } catch (InterruptedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }

      });
    }
    threadPool.shutdown();
    System.out.println("finish");
  }

  public static void test(int threadnum) throws InterruptedException {
    Thread.sleep(1000);// Mô phỏng thao tác tốn thời gian của request
    System.out.println("threadnum:" + threadnum);
    Thread.sleep(1000);// Mô phỏng thao tác tốn thời gian của request
  }
}
```

Việc thực thi phương thức `acquire()` sẽ bị chặn cho đến khi có một giấy phép có thể lấy được, rồi lấy đi một giấy phép; mỗi lần gọi phương thức `release` sẽ tăng thêm một giấy phép, điều này có thể giải phóng một phương thức `acquire()` đang bị chặn. Tuy nhiên, thực ra không có đối tượng giấy phép thực sự nào; `Semaphore` chỉ duy trì một số lượng giấy phép có thể lấy được. `Semaphore` thường được dùng để giới hạn số lượng thread truy cập vào một tài nguyên nhất định.

Tất nhiên cũng có thể lấy và giải phóng nhiều giấy phép một lúc, nhưng thông thường không cần thiết phải làm vậy:

```java
semaphore.acquire(5);// Lấy 5 giấy phép, vậy số thread có thể chạy là 20/5=4
test(threadnum);
semaphore.release(5);// Giải phóng 5 giấy phép
```

Ngoài phương thức `acquire()`, một phương thức phổ biến khác tương ứng là `tryAcquire()`, phương thức này sẽ trả về `false` ngay lập tức nếu không lấy được giấy phép.

[Nội dung bổ sung issue645](https://github.com/Snailclimb/JavaGuide/issues/645):

> `Semaphore` được triển khai dựa trên AQS, dùng để kiểm soát số lượng thread truy cập đồng thời, nhưng khái niệm của nó khác với shared lock. Constructor của `Semaphore` dùng tham số `permits` để khởi tạo biến `state` của AQS, biến này đại diện cho số lượng giấy phép hiện có. Khi một thread gọi phương thức `acquire()` để cố lấy giấy phép, `state` sẽ giảm 1 theo cách nguyên tử. Nếu `state` sau khi giảm 1 lớn hơn hoặc bằng 0, thì `acquire()` thành công và thread có thể tiếp tục thực thi. Nếu `state` sau khi giảm 1 nhỏ hơn 0, tức là số lượng thread truy cập đồng thời hiện tại đã đạt đến giới hạn `permits`, thread đó sẽ được đưa vào hàng đợi chờ của AQS và bị chặn, **thay vì spin-wait**. Khi một thread khác hoàn thành công việc và gọi phương thức `release()`, `state` sẽ tăng 1 theo cách nguyên tử. Thao tác `release()` sẽ đánh thức một hoặc nhiều thread đang bị chặn trong hàng đợi chờ của AQS. Các thread được đánh thức sẽ thử lại thao tác `acquire()`, tranh giành lấy giấy phép còn trống. Do đó, `Semaphore` kiểm soát số lượng thread truy cập đồng thời bằng cách kiểm soát số lượng giấy phép, chứ không phải thông qua cơ chế spin và shared lock.

### CountDownLatch (Bộ đếm ngược)

#### Giới thiệu

`CountDownLatch` cho phép `count` thread bị chặn tại một điểm, cho đến khi tất cả các thread hoàn thành công việc của mình.

`CountDownLatch` chỉ dùng được một lần, giá trị bộ đếm chỉ có thể được khởi tạo một lần trong constructor, sau đó không có cơ chế nào để đặt lại giá trị. Sau khi `CountDownLatch` đã được sử dụng xong, nó không thể được dùng lại.

#### Nguyên lý

`CountDownLatch` là một triển khai của shared lock, nó khởi tạo giá trị `state` của AQS là `count`. Điều này có thể thấy qua constructor của `CountDownLatch`.

```java
public CountDownLatch(int count) {
    if (count < 0) throw new IllegalArgumentException("count < 0");
    this.sync = new Sync(count);
}

private static final class Sync extends AbstractQueuedSynchronizer {
    Sync(int count) {
        setState(count);
    }
  //...
}
```

Khi một thread gọi `countDown()`, thực ra nó dùng phương thức `tryReleaseShared` với thao tác CAS để giảm `state` cho đến khi `state` bằng 0. Khi `state` bằng 0, tức là tất cả các thread đã gọi phương thức `countDown`, thì các thread đang chờ trên `CountDownLatch` sẽ được đánh thức và tiếp tục thực thi.

```java
public void countDown() {
    // Sync là lớp nội bộ của CountDownLatch, kế thừa AbstractQueuedSynchronizer
    sync.releaseShared(1);
}
```

Phương thức `releaseShared` là triển khai mặc định trong `AbstractQueuedSynchronizer`.

```java
// Giải phóng shared lock
// Nếu tryReleaseShared trả về true, thì đánh thức một hoặc nhiều thread trong hàng đợi chờ.
public final boolean releaseShared(int arg) {
    //Giải phóng shared lock
    if (tryReleaseShared(arg)) {
      //Giải phóng node chờ phía sau của node hiện tại
      doReleaseShared();
      return true;
    }
    return false;
}
```

Phương thức `tryReleaseShared` là một phương thức được override bởi lớp nội bộ `Sync` của `CountDownLatch`. Triển khai mặc định trong `AbstractQueuedSynchronizer` chỉ ném ra ngoại lệ `UnsupportedOperationException`.

```java
// Giảm dần state cho đến khi state bằng 0;
// Chỉ khi count giảm về 0, countDown mới trả về true
protected boolean tryReleaseShared(int releases) {
    // Vòng lặp kiểm tra xem state có bằng 0 không
    for (;;) {
        int c = getState();
        // Nếu state đã là 0 rồi, trả về false ngay
        if (c == 0)
            return false;
        // Giảm state
        int nextc = c-1;
        // Dùng CAS để cập nhật giá trị state
        if (compareAndSetState(c, nextc))
            return nextc == 0;
    }
}
```

Lấy phương thức `await` không tham số làm ví dụ, khi gọi `await()`, nếu `state` không bằng 0 thì chứng tỏ công việc chưa hoàn thành, `await()` sẽ tiếp tục bị chặn, tức là các câu lệnh sau `await()` sẽ không được thực thi (thread `main` được thêm vào hàng đợi chờ, tức là hàng đợi CLH biến thể). Sau đó, `CountDownLatch` sẽ spin CAS kiểm tra `state == 0`, nếu `state == 0` thì sẽ giải phóng tất cả các thread đang chờ, và các câu lệnh sau phương thức `await()` sẽ được thực thi.

```java
// Chờ (cũng có thể gọi là khóa)
public void await() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}
// Chờ có thời gian timeout
public boolean await(long timeout, TimeUnit unit)
    throws InterruptedException {
    return sync.tryAcquireSharedNanos(1, unit.toNanos(timeout));
}
```

Phương thức `acquireSharedInterruptibly` là triển khai mặc định trong `AbstractQueuedSynchronizer`.

```java
// Thử lấy lock, nếu thành công thì trả về, nếu thất bại thì thêm vào hàng đợi chờ và treo thread
public final void acquireSharedInterruptibly(int arg)
    throws InterruptedException {
    if (Thread.interrupted())
      throw new InterruptedException();
        // Thử lấy lock, nếu thành công thì trả về
    if (tryAcquireShared(arg) < 0)
      // Lấy thất bại thì thêm vào hàng đợi chờ và treo thread
      doAcquireSharedInterruptibly(arg);
}
```

Phương thức `tryAcquireShared` là một phương thức được override bởi lớp nội bộ `Sync` của `CountDownLatch`, tác dụng của nó là kiểm tra xem giá trị `state` có bằng 0 không, nếu có thì trả về 1, ngược lại trả về -1.

```java
protected int tryAcquireShared(int acquires) {
    return (getState() == 0) ? 1 : -1;
}
```

#### Thực hành

**Hai cách dùng điển hình của CountDownLatch**:

1. Một thread chờ n thread thực thi xong trước khi bắt đầu chạy: Khởi tạo bộ đếm của `CountDownLatch` là n (`new CountDownLatch(n)`), mỗi khi một task thread hoàn thành thì giảm bộ đếm 1 (`countdownlatch.countDown()`), khi bộ đếm về 0 thì thread đang `await()` trên `CountDownLatch` sẽ được đánh thức. Một ứng dụng điển hình là khi khởi động service, main thread cần chờ nhiều component tải xong mới tiếp tục thực thi.
2. Thực hiện tính song song tối đa cho nhiều thread bắt đầu thực thi cùng lúc: Chú ý là tính song song (parallelism), không phải concurrency, nhấn mạnh rằng nhiều thread bắt đầu thực thi tại cùng một thời điểm. Tương tự như đua chạy, đặt nhiều thread vào điểm xuất phát, chờ súng phát lệnh rồi cùng chạy. Cách làm là khởi tạo một đối tượng `CountDownLatch` dùng chung với bộ đếm là 1 (`new CountDownLatch(1)`), nhiều thread `coundownlatch.await()` trước khi bắt đầu thực thi task, khi main thread gọi `countDown()`, bộ đếm về 0, nhiều thread được đánh thức cùng lúc.

**Ví dụ code CountDownLatch**:

```java
public class CountDownLatchExample {
  // Số lượng request
  private static final int THREAD_COUNT = 550;

  public static void main(String[] args) throws InterruptedException {
    // Tạo một thread pool có số lượng thread cố định (nếu số thread ở đây quá ít bạn sẽ thấy thực thi rất chậm)
    // Chỉ dùng để test, trong thực tế hãy gán thủ công các tham số của thread pool
    ExecutorService threadPool = Executors.newFixedThreadPool(300);
    final CountDownLatch countDownLatch = new CountDownLatch(THREAD_COUNT);
    for (int i = 0; i < THREAD_COUNT; i++) {
      final int threadNum = i;
      threadPool.execute(() -> {
        try {
          test(threadNum);
        } catch (InterruptedException e) {
          e.printStackTrace();
        } finally {
          // Biểu thị một request đã được hoàn thành
          countDownLatch.countDown();
        }

      });
    }
    countDownLatch.await();
    threadPool.shutdown();
    System.out.println("finish");
  }

  public static void test(int threadnum) throws InterruptedException {
    Thread.sleep(1000);
    System.out.println("threadNum:" + threadnum);
    Thread.sleep(1000);
  }
}
```

Trong đoạn code trên, chúng ta định nghĩa số lượng request là 550, chỉ sau khi 550 request này được xử lý xong mới thực thi `System.out.println("finish");`.

Lần tương tác đầu tiên với `CountDownLatch` là main thread chờ các thread khác. Main thread phải gọi phương thức `CountDownLatch.await()` ngay sau khi khởi động các thread khác. Như vậy thao tác của main thread sẽ bị chặn tại phương thức này cho đến khi các thread khác hoàn thành công việc của mình.

N thread còn lại phải tham chiếu đối tượng latch, vì chúng cần thông báo cho đối tượng `CountDownLatch` rằng chúng đã hoàn thành công việc. Cơ chế thông báo này được thực hiện thông qua phương thức `CountDownLatch.countDown()`; mỗi lần gọi phương thức này, giá trị count khởi tạo trong constructor sẽ giảm 1. Vì vậy khi N thread đều đã gọi phương thức này, giá trị count bằng 0, main thread có thể tiếp tục thực thi công việc của mình thông qua phương thức `await()`.

Thêm một điểm nữa: Nếu dùng không đúng phương thức `await()` của `CountDownLatch` rất dễ gây deadlock, ví dụ như nếu đổi vòng for trong code trên thành:

```java
for (int i = 0; i < threadCount-1; i++) {
.......
}
```

Điều này sẽ khiến giá trị `count` không thể bằng 0, dẫn đến chờ mãi mãi.

### CyclicBarrier (Rào chắn tuần hoàn)

#### Giới thiệu

`CyclicBarrier` rất giống với `CountDownLatch`, nó cũng có thể thực hiện chờ đợi kỹ thuật giữa các thread, nhưng chức năng của nó phức tạp và mạnh hơn `CountDownLatch`. Kịch bản ứng dụng chính tương tự `CountDownLatch`.

> `CountDownLatch` được triển khai dựa trên AQS, còn `CyclicBarrier` dựa trên `ReentrantLock` (`ReentrantLock` cũng thuộc bộ đồng bộ hóa AQS) và `Condition`.

Nghĩa đen của `CyclicBarrier` là rào chắn (Barrier) có thể dùng theo chu kỳ (Cyclic). Tác dụng của nó là: cho một nhóm thread bị chặn khi đến một rào chắn (cũng có thể gọi là điểm đồng bộ hóa), cho đến khi thread cuối cùng đến rào chắn thì rào chắn mới mở, và tất cả các thread bị rào chắn chặn mới có thể tiếp tục thực thi.

#### Nguyên lý

Bên trong `CyclicBarrier` sử dụng một biến `count` làm bộ đếm, giá trị ban đầu của `count` là giá trị khởi tạo của thuộc tính `parties`, mỗi khi một thread đến rào chắn thì bộ đếm giảm 1. Nếu giá trị `count` bằng 0, tức là đây là thread cuối cùng trong thế hệ này đến rào chắn, thì sẽ cố thực thi task được truyền vào constructor.

```java
//Số thread bị chặn mỗi lần
private final int parties;
//Bộ đếm
private int count;
```

Dưới đây chúng ta kết hợp source code để xem sơ qua.

1、Constructor mặc định của `CyclicBarrier` là `CyclicBarrier(int parties)`, tham số của nó đại diện cho số lượng thread bị rào chắn chặn, mỗi thread gọi phương thức `await()` để thông báo với `CyclicBarrier` rằng tôi đã đến rào chắn, sau đó thread hiện tại bị chặn.

```java
public CyclicBarrier(int parties) {
    this(parties, null);
}

public CyclicBarrier(int parties, Runnable barrierAction) {
    if (parties <= 0) throw new IllegalArgumentException();
    this.parties = parties;
    this.count = parties;
    this.barrierCommand = barrierAction;
}
```

Trong đó, `parties` đại diện cho số lượng thread bị chặn, khi số lượng thread bị chặn đạt đến giá trị này thì mở rào chắn cho tất cả thread đi qua.

2、Khi gọi phương thức `await()` trên đối tượng `CyclicBarrier`, thực ra là gọi phương thức `dowait(false, 0L)`. Phương thức `await()` giống như hành động dựng lên một rào chắn, chặn các thread lại, khi số lượng thread bị chặn đạt đến giá trị `parties` thì rào chắn mới mở và các thread mới được thực thi tiếp.

```java
public int await() throws InterruptedException, BrokenBarrierException {
  try {
      return dowait(false, 0L);
  } catch (TimeoutException toe) {
      throw new Error(toe); // cannot happen
  }
}
```

Phân tích source code phương thức `dowait(false, 0L)` như sau:

```java
    // Chỉ sau khi số lượng thread hoặc số lượng request đạt đến count thì các phương thức sau await mới được thực thi. Trong ví dụ trên, giá trị count là 5.
    private int count;
    /**
     * Main barrier code, covering the various policies.
     */
    private int dowait(boolean timed, long nanos)
        throws InterruptedException, BrokenBarrierException,
               TimeoutException {
        final ReentrantLock lock = this.lock;
        // Khóa lại
        lock.lock();
        try {
            final Generation g = generation;

            if (g.broken)
                throw new BrokenBarrierException();

            // Nếu thread bị interrupt, ném ngoại lệ
            if (Thread.interrupted()) {
                breakBarrier();
                throw new InterruptedException();
            }
            // count giảm 1
            int index = --count;
            // Khi count giảm về 0 thì thread cuối cùng đã đến rào chắn, tức là đã đạt điều kiện để thực thi các phương thức sau await
            if (index == 0) {  // tripped
                boolean ranAction = false;
                try {
                    final Runnable command = barrierCommand;
                    if (command != null)
                        command.run();
                    ranAction = true;
                    // Đặt lại count về giá trị khởi tạo của thuộc tính parties
                    // Đánh thức các thread đang chờ trước đó
                    // Bắt đầu lượt thực thi tiếp theo
                    nextGeneration();
                    return 0;
                } finally {
                    if (!ranAction)
                        breakBarrier();
                }
            }

            // loop until tripped, broken, interrupted, or timed out
            for (;;) {
                try {
                    if (!timed)
                        trip.await();
                    else if (nanos > 0L)
                        nanos = trip.awaitNanos(nanos);
                } catch (InterruptedException ie) {
                    if (g == generation && ! g.broken) {
                        breakBarrier();
                        throw ie;
                    } else {
                        // We're about to finish waiting even if we had not
                        // been interrupted, so this interrupt is deemed to
                        // "belong" to subsequent execution.
                        Thread.currentThread().interrupt();
                    }
                }

                if (g.broken)
                    throw new BrokenBarrierException();

                if (g != generation)
                    return index;

                if (timed && nanos <= 0L) {
                    breakBarrier();
                    throw new TimeoutException();
                }
            }
        } finally {
            lock.unlock();
        }
    }
```

#### Thực hành

Ví dụ 1:

```java
public class CyclicBarrierExample1 {
  // Số lượng request
  private static final int threadCount = 550;
  // Số lượng thread cần đồng bộ hóa
  private static final CyclicBarrier cyclicBarrier = new CyclicBarrier(5);

  public static void main(String[] args) throws InterruptedException {
    // Tạo thread pool
    ExecutorService threadPool = Executors.newFixedThreadPool(10);

    for (int i = 0; i < threadCount; i++) {
      final int threadNum = i;
      Thread.sleep(1000);
      threadPool.execute(() -> {
        try {
          test(threadNum);
        } catch (InterruptedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        } catch (BrokenBarrierException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
      });
    }
    threadPool.shutdown();
  }

  public static void test(int threadnum) throws InterruptedException, BrokenBarrierException {
    System.out.println("threadnum:" + threadnum + "is ready");
    try {
      /**Chờ 60 giây, đảm bảo các thread con thực thi xong hoàn toàn*/
      cyclicBarrier.await(60, TimeUnit.SECONDS);
    } catch (Exception e) {
      System.out.println("-----CyclicBarrierException------");
    }
    System.out.println("threadnum:" + threadnum + "is finish");
  }

}
```

Kết quả chạy như sau:

```plain
threadnum:0is ready
threadnum:1is ready
threadnum:2is ready
threadnum:3is ready
threadnum:4is ready
threadnum:4is finish
threadnum:0is finish
threadnum:1is finish
threadnum:2is finish
threadnum:3is finish
threadnum:5is ready
threadnum:6is ready
threadnum:7is ready
threadnum:8is ready
threadnum:9is ready
threadnum:9is finish
threadnum:5is finish
threadnum:8is finish
threadnum:7is finish
threadnum:6is finish
......
```

Có thể thấy khi số lượng thread tức là số lượng request đạt đến 5 như chúng ta đã định nghĩa, các phương thức sau `await()` mới được thực thi.

Ngoài ra, `CyclicBarrier` còn cung cấp một constructor nâng cao hơn là `CyclicBarrier(int parties, Runnable barrierAction)`, dùng để thực thi `barrierAction` ưu tiên khi thread đến rào chắn, thuận tiện xử lý các kịch bản nghiệp vụ phức tạp hơn.

Ví dụ 2:

```java
public class CyclicBarrierExample2 {
  // Số lượng request
  private static final int threadCount = 550;
  // Số lượng thread cần đồng bộ hóa
  private static final CyclicBarrier cyclicBarrier = new CyclicBarrier(5, () -> {
    System.out.println("------当线程数达到之后，优先执行------");
  });

  public static void main(String[] args) throws InterruptedException {
    // Tạo thread pool
    ExecutorService threadPool = Executors.newFixedThreadPool(10);

    for (int i = 0; i < threadCount; i++) {
      final int threadNum = i;
      Thread.sleep(1000);
      threadPool.execute(() -> {
        try {
          test(threadNum);
        } catch (InterruptedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        } catch (BrokenBarrierException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
      });
    }
    threadPool.shutdown();
  }

  public static void test(int threadnum) throws InterruptedException, BrokenBarrierException {
    System.out.println("threadnum:" + threadnum + "is ready");
    cyclicBarrier.await();
    System.out.println("threadnum:" + threadnum + "is finish");
  }

}
```

Kết quả chạy như sau:

```plain
threadnum:0is ready
threadnum:1is ready
threadnum:2is ready
threadnum:3is ready
threadnum:4is ready
------当线程数达到之后，优先执行------
threadnum:4is finish
threadnum:0is finish
threadnum:2is finish
threadnum:1is finish
threadnum:3is finish
threadnum:5is ready
threadnum:6is ready
threadnum:7is ready
threadnum:8is ready
threadnum:9is ready
------当线程数达到之后，优先执行------
threadnum:9is finish
threadnum:5is finish
threadnum:6is finish
threadnum:8is finish
threadnum:7is finish
......
```

## Tham khảo

- Java 并发之 AQS 详解：<https://www.cnblogs.com/waterystone/p/4920797.html>
- 从 ReentrantLock 的实现看 AQS 的原理及应用：<https://tech.meituan.com/2019/12/05/aqs-theory-and-apply.html>

<!-- @include: @article-footer.snippet.md -->
