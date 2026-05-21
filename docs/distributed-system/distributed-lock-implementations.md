---
title: Tổng hợp các giải pháp triển khai distributed lock phổ biến
category: Distributed System
description: Giải thích chi tiết các giải pháp triển khai distributed lock phổ biến, bao gồm nguyên lý, ưu/nhược điểm và best practice của việc triển khai distributed lock dựa trên Redis SETNX, Redlock, ZooKeeper temporary node.
tag:
  - Distributed Lock
head:
  - - meta
    - name: keywords
      content: distributed lock,Redis distributed lock,ZooKeeper distributed lock,SETNX,Redlock,distributed lock implementation,distributed lock interview questions
---

<!-- @include: @small-advertisement.snippet.md -->

Thông thường, chúng ta sẽ chọn triển khai distributed lock dựa trên Redis hoặc ZooKeeper. Redis được dùng nhiều hơn một chút. Ở đây tôi cũng lấy Redis làm ví dụ để giới thiệu trước việc triển khai distributed lock.

## Triển khai Distributed Lock dựa trên Redis

### Làm thế nào để triển khai distributed lock đơn giản nhất dựa trên Redis?

Dù là local lock hay distributed lock, cốt lõi đều là "mutual exclusion".

Trong Redis, lệnh `SETNX` có thể giúp chúng ta triển khai mutual exclusion. `SETNX` tức là **SET** if **N**ot e**X**ists (tương ứng với method `setIfAbsent` trong Java) — chỉ set giá trị key nếu key không tồn tại. Nếu key đã tồn tại, `SETNX` không làm gì cả.

```bash
> SETNX lockKey uniqueValue
(integer) 1
> SETNX lockKey uniqueValue
(integer) 0
```

Để release lock, chỉ cần xóa key tương ứng bằng lệnh `DEL`.

```bash
> DEL lockKey
(integer) 1
```

Để tránh xóa nhầm lock của người khác, ở đây chúng ta khuyến nghị dùng Lua script để phán đoán qua value (unique value) tương ứng với key.

Lý do dùng Lua script là để đảm bảo tính atomic của operation unlock. Vì Redis khi thực thi Lua script có thể thực thi theo cách atomic, từ đó đảm bảo tính atomic của operation release lock.

```lua
// Khi release lock, trước tiên so sánh xem value tương ứng với lock có bằng nhau không, tránh release nhầm lock
if redis.call("get",KEYS[1]) == ARGV[1] then
    return redis.call("del",KEYS[1])
else
    return 0
end
```

![Redis implements simple distributed lock](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/distributed-lock-setnx.png)

Đây là triển khai distributed lock Redis đơn giản nhất, cách triển khai tương đối đơn giản, hiệu năng cũng rất cao. Tuy nhiên, cách này tồn tại một số vấn đề khi triển khai distributed lock. Ví dụ application gặp một số vấn đề như logic release lock đột nhiên treo, có thể dẫn đến lock không được release, từ đó khiến shared resource không thể được truy cập bởi thread/process khác.

### Tại sao cần đặt expiration time cho lock?

Để tránh lock không được release, giải pháp có thể nghĩ đến là: **đặt expiration time cho key (tức là lock) này**.

```bash
127.0.0.1:6379> SET lockKey uniqueValue EX 3 NX
OK
```

- **lockKey**: Tên của lock;
- **uniqueValue**: Random string có thể unique identify lock;
- **NX**: Chỉ SET thành công khi key tương ứng với lockKey không tồn tại;
- **EX**: Cài đặt expiration time (đơn vị giây). EX 3 nghĩa là lock này có auto expiration time 3 giây. Tương ứng với EX là PX (đơn vị millisecond), cả hai đều là cài đặt expiration time.

**Phải đảm bảo việc set value của key chỉ định và expiration time là một atomic operation!!!** Nếu không, vẫn có thể xảy ra vấn đề lock không được release.

Điều này đúng là có thể giải quyết vấn đề, nhưng giải pháp này cũng tồn tại lỗ hổng: **Nếu thời gian thao tác shared resource lớn hơn expiration time, sẽ xảy ra vấn đề lock hết hạn sớm, từ đó dẫn đến distributed lock trực tiếp mất hiệu lực. Nếu đặt timeout time của lock quá dài, lại ảnh hưởng đến performance.**

Bạn có thể đang nghĩ: **Nếu thao tác shared resource chưa hoàn thành, thời gian hết hạn của lock có thể tự gia hạn thì tốt biết bao!**

### Làm thế nào để triển khai gia hạn lock một cách elegant?

Đối với các bạn phát triển Java, đã có sẵn giải pháp: **[Redisson](https://github.com/redisson/redisson)**. Giải pháp cho các ngôn ngữ khác có thể tìm thấy trong tài liệu chính thức Redis tại: <https://redis.io/topics/distlock>.

![Distributed locks with Redis](https://oss.javaguide.cn/github/javaguide/redis-distributed-lock.png)

Redisson là open source Java language Redis client, cung cấp nhiều chức năng out-of-the-box, không chỉ bao gồm nhiều loại triển khai distributed lock. Ngoài ra, Redisson còn hỗ trợ nhiều deployment architecture như Redis standalone, Redis Sentinel, Redis Cluster.

Distributed lock trong Redisson có cơ chế auto renewal tích hợp sẵn, sử dụng rất đơn giản, nguyên lý cũng tương đối đơn giản. Nó cung cấp một **Watch Dog** chuyên dùng để monitor và gia hạn lock. Nếu thread thao tác shared resource chưa thực thi xong, Watch Dog sẽ liên tục mở rộng expiration time của lock, từ đó đảm bảo lock không bị release do timeout.

![Redisson Watch Dog auto renewal](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/distributed-lock-redisson-renew-expiration.png)

Tên Watch Dog bắt nguồn từ method `getLockWatchdogTimeout()`, method này trả về expiration time mà Watch Dog gia hạn lock, mặc định là 30 giây ([redisson-3.17.6](https://github.com/redisson/redisson/releases/tag/redisson-3.17.6)).

```java
// Mặc định 30 giây, hỗ trợ sửa đổi
private long lockWatchdogTimeout = 30 * 1000;

public Config setLockWatchdogTimeout(long lockWatchdogTimeout) {
    this.lockWatchdogTimeout = lockWatchdogTimeout;
    return this;
}
public long getLockWatchdogTimeout() {
   return lockWatchdogTimeout;
}
```

Method `renewExpiration()` chứa logic chính của Watch Dog:

```java
private void renewExpiration() {
         //......
        Timeout task = commandExecutor.getConnectionManager().newTimeout(new TimerTask() {
            @Override
            public void run(Timeout timeout) throws Exception {
                //......
                // Async renewal dựa trên Lua script
                CompletionStage<Boolean> future = renewExpirationAsync(threadId);
                future.whenComplete((res, e) -> {
                    if (e != null) {
                        // Không thể gia hạn
                        log.error("Can't update lock " + getRawName() + " expiration", e);
                        EXPIRATION_RENEWAL_MAP.remove(getEntryName());
                        return;
                    }

                    if (res) {
                        // Gọi đệ quy để gia hạn
                        renewExpiration();
                    } else {
                        // Hủy gia hạn
                        cancelExpirationRenewal(null);
                    }
                });
            }
         // Delay internalLockLeaseTime/3 (mặc định 10s, tức là 30/3) rồi gọi
        }, internalLockLeaseTime / 3, TimeUnit.MILLISECONDS);

        ee.setTimeout(task);
    }
```

Mặc định, mỗi 10 giây Watch Dog thực hiện operation gia hạn, đặt timeout time của lock thành 30 giây. Trước khi Watch Dog gia hạn cũng sẽ phán đoán trước xem có cần thực hiện operation gia hạn không, chỉ khi cần mới thực hiện, nếu không thì hủy operation gia hạn.

Watch Dog triển khai async renewal của lock bằng cách gọi method `renewExpirationAsync()`:

```java
protected CompletionStage<Boolean> renewExpirationAsync(long threadId) {
    return evalWriteAsync(getRawName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
            // Phán đoán xem có phải là thread giữ lock, nếu có thì thực hiện operation gia hạn, đặt expiration time của lock thành 30s (mặc định)
            "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
                    "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                    "return 1; " +
                    "end; " +
                    "return 0;",
            Collections.singletonList(getRawName()),
            internalLockLeaseTime, getLockName(threadId));
}
```

Có thể thấy, method `renewExpirationAsync` thực ra gọi Lua script để gia hạn, cách làm này chủ yếu để đảm bảo tính atomic của operation gia hạn.

Đây tôi lấy distributed reentrant lock `RLock` của Redisson làm ví dụ để giải thích cách dùng Redisson để triển khai distributed lock:

```java
// 1. Lấy distributed lock object được chỉ định
RLock lock = redisson.getLock("lock");
// 2. Lấy lock mà không đặt lock timeout time, có Watch Dog auto renewal mechanism
lock.lock();
// 3. Thực thi business
...
// 4. Release lock
lock.unlock();
```

Chỉ khi không chỉ định lock timeout time mới dùng đến Watch Dog auto renewal mechanism.

```java
// Manually đặt expiration time cho lock, không có Watch Dog auto renewal mechanism
lock.lock(10, TimeUnit.SECONDS);
```

Nếu dùng Redis để triển khai distributed lock, khuyến nghị sử dụng trực tiếp dựa trên Redisson.

### Làm thế nào để triển khai reentrant lock?

Reentrant lock là lock mà cùng một thread có thể lấy nhiều lần. Ví dụ một thread đang thực thi một method có lock, method đó gọi đến method khác cũng cần cùng lock đó, thì thread có thể trực tiếp thực thi method được gọi — tức là reentrant, không cần lấy lại lock. Như `synchronized` và `ReentrantLock` trong Java đều là reentrant lock.

**Non-reentrant distributed lock về cơ bản có thể đáp ứng phần lớn business scenario, một số scenario đặc biệt có thể cần dùng reentrant distributed lock.**

Core idea của việc triển khai reentrant distributed lock là khi thread lấy lock thì phán đoán xem có phải là lock của mình không, nếu có thì không cần lấy lại. Vì vậy, chúng ta có thể liên kết một reentrant counter và một thread sở hữu nó với mỗi lock. Khi reentrant counter lớn hơn 0, lock bị chiếm giữ, cần phán đoán xem thread chiếm giữ lock và thread yêu cầu lấy lock có phải là cùng một thread không.

Trong project thực tế, chúng ta không cần tự implement, khuyến nghị dùng **Redisson** đã đề cập, nó tích hợp sẵn nhiều loại lock như reentrant lock (Reentrant Lock), spin lock (Spin Lock), fair lock (Fair Lock), multi lock (MultiLock), red lock (RedLock), read/write lock (ReadWriteLock).

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/redisson-readme-locks.png)

### Redis giải quyết reliability của distributed lock trong tình huống cluster như thế nào?

Để tránh single point of failure, Redis service trong môi trường production thường được deploy theo cluster.

Trong Redis cluster, việc triển khai distributed lock được giới thiệu ở trên sẽ có một số vấn đề. Vì data sync của Redis cluster đến các node là async, nếu sau khi lấy lock ở Redis master node, trước khi đồng bộ sang các node khác, Redis master node bị down, lúc này Redis master node mới vẫn có thể lấy lock, vì vậy nhiều application service có thể lấy lock cùng lúc.

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/redis-master-slave-distributed-lock.png)

Để giải quyết vấn đề này, cha đẻ Redis antirez đã thiết kế [Redlock algorithm](https://redis.io/topics/distlock) để giải quyết.

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/distributed-lock-redis.io-realock.png)

Ý tưởng của Redlock algorithm là cho client lần lượt yêu cầu lock từ nhiều Redis instance độc lập trong Redis cluster. Nếu client có thể hoàn thành thành công operation lock với hơn nửa số instance, thì chúng ta coi như client đã lấy được distributed lock thành công, ngược lại lock thất bại.

Dù một số Redis node có vấn đề, miễn là đảm bảo hơn nửa Redis node trong Redis cluster khả dụng, distributed lock service là bình thường.

Redlock trực tiếp thao tác Redis node chứ không phải thông qua Redis cluster, như vậy mới có thể tránh vấn đề lock lost do Redis cluster master-slave switching.

Redlock triển khai khá phức tạp, hiệu năng tương đối kém, còn tồn tại ẩn họa bảo mật khi xảy ra clock drift. Martin Kleppmann — tác giả cuốn sách 《Designing Data-Intensive Applications》— đã từng chuyên viết bài phản bác Redlock ([How to do distributed locking - Martin Kleppmann - 2016](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)), ông cho rằng đây là một triển khai distributed lock rất tệ. Bạn quan tâm có thể đọc bài [Redis lock from interview rapid fire to gods fighting](https://mp.weixin.qq.com/s?__biz=Mzg3NjU3NTkwMQ==&mid=2247505097&idx=1&sn=5c03cb769c4458350f4d4a321ad51f5a&source=41#wechat_redirect) có giới thiệu chi tiết về cuộc tranh luận gay gắt của antirez và Martin Kleppmann về Redlock.

Trong project thực tế không khuyến nghị dùng Redlock algorithm, cost và benefit không tương xứng. Có thể cân nhắc triển khai distributed lock dựa trên Redis master-slave replication + sentinel mode.

## Triển khai Distributed Lock dựa trên ZooKeeper

So với Redis, ZooKeeper triển khai distributed lock ngoài cung cấp reliability tương đối cao hơn, về mặt chức năng còn có một đặc tính rất hữu ích: **Watch mechanism**. Cơ chế này có thể dùng để triển khai fair distributed lock. Tuy nhiên, distributed lock triển khai bằng ZooKeeper có hiệu năng tương đối kém, vì vậy nếu yêu cầu hiệu năng cao thì ZooKeeper có thể không phù hợp.

### Làm thế nào để triển khai distributed lock dựa trên ZooKeeper?

ZooKeeper distributed lock được triển khai dựa trên **temporary sequential node** và **Watcher (event listener)**.

Lấy lock:

1. Đầu tiên chúng ta cần có persistent node `/locks`, client lấy lock là tạo temporary sequential node trong `locks`.
2. Giả sử client 1 tạo node `/locks/lock1`. Sau khi tạo thành công, sẽ phán đoán xem `lock1` có phải là child node nhỏ nhất trong `/locks` không.
3. Nếu `lock1` là child node nhỏ nhất, thì lấy lock thành công. Ngược lại, lấy lock thất bại.
4. Nếu lấy lock thất bại, có nghĩa là có client khác đã lấy lock thành công. Client 1 sẽ không liên tục loop để cố gắng lấy lock, mà đăng ký một event listener trên node trước đó như `/locks/lock0`. Tác dụng của listener này là sau khi node trước đó release lock thì thông báo cho client 1 (tránh vô hiệu spin), như vậy client 1 sẽ lấy lock thành công.

Release lock:

1. Client lấy lock thành công sau khi thực thi xong business flow, sẽ xóa child node tương ứng.
2. Client lấy lock thành công khi gặp sự cố, child node tương ứng vì là temporary sequential node cũng sẽ bị xóa tự động, tránh lock không được release.
3. Event listener chúng ta nói trước đó thực ra monitor sự kiện xóa child node này, child node bị xóa có nghĩa là lock được release.

![](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/distributed-lock-zookeeper.png)

Trong project thực tế, khuyến nghị dùng Curator để triển khai ZooKeeper distributed lock. Curator là Java client framework ZooKeeper mã nguồn mở của Netflix, so với client zookeeper tự đi kèm, Curator được đóng gói đầy đủ hơn và các API đều có thể sử dụng khá tiện lợi.

`Curator` chủ yếu triển khai 4 loại lock sau:

- `InterProcessMutex`: Distributed reentrant exclusive lock
- `InterProcessSemaphoreMutex`: Distributed non-reentrant exclusive lock
- `InterProcessReadWriteLock`: Distributed read/write lock
- `InterProcessMultiLock`: Container quản lý nhiều lock như một entity, khi lấy lock thì lấy tất cả lock, release lock cũng release tất cả lock resource (bỏ qua lock release thất bại).

```java
CuratorFramework client = ZKUtils.getClient();
client.start();
// Distributed reentrant exclusive lock
InterProcessLock lock1 = new InterProcessMutex(client, lockPath1);
// Distributed non-reentrant exclusive lock
InterProcessLock lock2 = new InterProcessSemaphoreMutex(client, lockPath2);
// Quản lý nhiều lock như một thể thống nhất
InterProcessMultiLock lock = new InterProcessMultiLock(Arrays.asList(lock1, lock2));

if (!lock.acquire(10, TimeUnit.SECONDS)) {
   throw new IllegalStateException("Không thể lấy multi-lock");
}
System.out.println("Đã lấy multi-lock");
System.out.println("Có lock đầu tiên không: " + lock1.isAcquiredInThisProcess());
System.out.println("Có lock thứ hai không: " + lock2.isAcquiredInThisProcess());
try {
    // Resource operation
    resource.use();
} finally {
    System.out.println("Release multi-lock");
    lock.release();
}
System.out.println("Có lock đầu tiên không: " + lock1.isAcquiredInThisProcess());
System.out.println("Có lock thứ hai không: " + lock2.isAcquiredInThisProcess());
client.close();
```

### Tại sao phải dùng temporary sequential node?

Mỗi data node trong ZooKeeper được gọi là **znode** — đây là đơn vị nhỏ nhất của data trong ZooKeeper.

Chúng ta thường chia znode thành 4 loại lớn:

- **PERSISTENT node**: Một khi tạo ra là tồn tại mãi dù ZooKeeper cluster down, cho đến khi xóa nó.
- **EPHEMERAL node**: Lifecycle của temporary node gắn với **client session**, **session mất thì node mất**. Ngoài ra, **temporary node chỉ có thể là leaf node**, không thể tạo child node.
- **PERSISTENT_SEQUENTIAL node**: Ngoài đặc tính của PERSISTENT node, tên của child node còn có tính tuần tự. Ví dụ `/node1/app0000000001`, `/node1/app0000000002`.
- **EPHEMERAL_SEQUENTIAL node**: Ngoài đặc tính của EPHEMERAL node, tên của child node còn có tính tuần tự.

Có thể thấy, so với persistent node, temporary node chủ yếu xử lý tình huống session fail khác nhau — session temporary node mất thì node tương ứng mất. Như vậy, nếu client gặp exception dẫn đến chưa kịp release lock cũng không sao, session fail thì node tự động bị xóa, không xảy ra vấn đề deadlock.

Khi dùng Redis triển khai distributed lock, chúng ta tránh lock không được release dẫn đến deadlock bằng expiration time, còn ZooKeeper trực tiếp tận dụng đặc tính của temporary node.

Giả sử không dùng sequential node, tất cả client cố gắng lấy lock đều sẽ add watcher vào child node giữ lock. Khi lock đó được release, chắc chắn sẽ gây ra tất cả client cố gắng lấy lock tranh nhau lock — điều này không thân thiện với hiệu năng. Khi dùng sequential node, chỉ cần monitor node trước đó là đủ, thân thiện hơn với hiệu năng.

### Tại sao cần đặt listener cho node trước đó?

> Watcher (event listener) là một đặc tính rất quan trọng trong ZooKeeper. ZooKeeper cho phép user đăng ký một số Watcher trên node được chỉ định. Khi một số event cụ thể được trigger, ZooKeeper server sẽ thông báo event đến client quan tâm. Cơ chế này là đặc tính quan trọng để ZooKeeper triển khai distributed coordination service.

Trong cùng một khoảng thời gian, có thể có nhiều client đồng thời lấy lock, nhưng chỉ có một thành công. Nếu lấy lock thất bại, có nghĩa là có client khác đã lấy lock thành công. Client lấy lock thất bại sẽ không liên tục loop để cố gắng lấy lock, mà đăng ký một event listener trên node trước đó.

Tác dụng của event listener này là: **Sau khi client tương ứng với node trước đó release lock (tức là sau khi node trước đó bị xóa, monitor là deletion event), thông báo cho client lấy lock thất bại (wake up waiting thread, Java's `wait/notifyAll`), cho phép nó cố gắng lấy lock, và sau đó thành công lấy lock.**

### Làm thế nào để triển khai reentrant lock?

Ở đây tôi lấy triển khai reentrant lock của Curator's `InterProcessMutex` để giới thiệu (source code: [InterProcessMutex.java](https://github.com/apache/curator/blob/master/curator-recipes/src/main/java/org/apache/curator/framework/recipes/locks/InterProcessMutex.java)).

Khi chúng ta gọi method `InterProcessMutex#acquire` để lấy lock, sẽ gọi method `InterProcessMutex#internalLock`.

```java
// Lấy reentrant mutex lock cho đến khi thành công
@Override
public void acquire() throws Exception {
  if (!internalLock(-1, null)) {
    throw new IOException("Lost connection while trying to acquire lock: " + basePath);
  }
}
```

Method `internalLock` sẽ trước tiên lấy thread hiện đang yêu cầu lock, sau đó lấy `lockData` tương ứng với thread hiện tại từ `threadData` (kiểu `ConcurrentMap<Thread, LockData>`). `lockData` chứa thông tin lock và số lần lock — là chìa khóa để triển khai reentrant lock.

Lần đầu tiên lấy lock, `lockData` là `null`. Sau khi lấy lock thành công, sẽ đặt thread hiện tại và `lockData` tương ứng vào `threadData`.

```java
private boolean internalLock(long time, TimeUnit unit) throws Exception {
  // Lấy thread hiện đang yêu cầu lock
  Thread currentThread = Thread.currentThread();
  // Lấy lockData tương ứng
  LockData lockData = threadData.get(currentThread);
  // Lần đầu lấy lock, lockData là null
  if (lockData != null) {
    // Sau khi thread hiện tại đã lấy lock một lần
    // Vì lock của thread hiện tại tồn tại, lockCount tự tăng rồi return, triển khai lock reentrant
    lockData.lockCount.incrementAndGet();
    return true;
  }
  // Cố gắng lấy lock
  String lockPath = internals.attemptLock(time, unit, getLockNodeBytes());
  if (lockPath != null) {
    LockData newLockData = new LockData(currentThread, lockPath);
     // Sau khi lấy lock thành công, đặt thread hiện tại và lockData tương ứng vào threadData
    threadData.put(currentThread, newLockData);
    return true;
  }

  return false;
}
```

`LockData` là static inner class trong `InterProcessMutex`.

```java
private final ConcurrentMap<Thread, LockData> threadData = Maps.newConcurrentMap();

private static class LockData
{
    // Thread hiện đang giữ lock
    final Thread owningThread;
    // Child node tương ứng với lock
    final String lockPath;
    // Số lần lock
    final AtomicInteger lockCount = new AtomicInteger(1);

    private LockData(Thread owningThread, String lockPath)
    {
      this.owningThread = owningThread;
      this.lockPath = lockPath;
    }
}
```

Nếu đã lấy lock một lần, lần sau đến lấy lock, sẽ bị chặn ngay ở `if (lockData != null)`, rồi thực thi `lockData.lockCount.incrementAndGet()` để tăng số lần lock thêm 1.

Logic triển khai reentrant lock hoàn toàn rất đơn giản, trực tiếp phán đoán ở phía client xem thread hiện tại có lấy lock không. Nếu có thì chỉ cần tăng số lần lock thêm 1 là được.

## Tổng kết

Trong bài viết này, tôi giới thiệu hai phương thức phổ biến để triển khai distributed lock: **Redis** và **ZooKeeper**. Còn việc chọn Redis hay ZooKeeper để triển khai distributed lock, vẫn phải quyết định dựa trên yêu cầu cụ thể của business.

- Nếu yêu cầu hiệu năng cao, khuyến nghị dùng Redis để triển khai distributed lock. Ưu tiên chọn distributed lock có sẵn do **Redisson** cung cấp, thay vì tự implement. Trong project thực tế không khuyến nghị dùng Redlock algorithm, cost và benefit không tương xứng, có thể cân nhắc distributed lock dựa trên Redis master-slave replication + sentinel mode.
- Nếu yêu cầu reliability cao, khuyến nghị dùng ZooKeeper để triển khai distributed lock, khuyến nghị triển khai dựa trên framework **Curator**. Tuy nhiên, nhiều project hiện tại không dùng ZooKeeper. Nếu thuần túy vì distributed lock mà giới thiệu ZooKeeper thì không ổn lắm, không khuyến nghị làm vậy — vì một chức năng nhỏ mà tăng thêm độ phức tạp của hệ thống.

Cần lưu ý rằng, dù chọn phương án nào để triển khai distributed lock, bao gồm Redis, ZooKeeper hay Etcd (bài này không giới thiệu nhưng cũng thường dùng để triển khai distributed lock), đều không thể đảm bảo 100% an toàn, đặc biệt khi gặp các tình huống bất thường như process garbage collection (GC), network delay.

Để tiếp tục nâng cao reliability của hệ thống, khuyến nghị giới thiệu một fallback mechanism. Ví dụ có thể dùng **version number (Fencing Token) mechanism** để tránh concurrent conflict.

<!-- @include: @article-footer.snippet.md -->
