---
title: Tổng hợp câu hỏi phổ biến về Virtual Thread
description: Giải thích chi tiết Java 21 Virtual Thread: phân tích toàn diện nguyên lý Virtual Threads, sự khác biệt với platform thread, Project Loom, tình huống I/O-intensive phù hợp, lưu ý sử dụng và best practice.
category: Java
tag:
  - Java Concurrent
head:
  - - meta
    - name: keywords
      content: Java virtual thread,Virtual Threads,Project Loom,Java 21 new features,lightweight thread,coroutine,nguyên lý virtual thread
---

> Một phần nội dung bài này đến từ [PR](https://github.com/Snailclimb/JavaGuide/pull/2190) của [Lorin](https://github.com/Lorin-github).

Virtual Thread được chính thức phát hành trong Java 21 — đây là một cập nhật trọng lượng nặng.

## Virtual Thread là gì?

Virtual Thread (luồng ảo) là lightweight thread (LWP — Lightweight Process) được JDK chứ không phải OS triển khai, được schedule bởi JVM. Nhiều virtual thread chia sẻ cùng một OS thread. Số lượng virtual thread có thể lớn hơn rất nhiều so với OS thread.

## Mối quan hệ giữa Virtual Thread và Platform Thread là gì?

Trước khi giới thiệu virtual thread, package `java.lang.Thread` đã hỗ trợ gọi là platform thread — tức thread mà chúng ta vẫn dùng trước khi có virtual thread. JVM scheduler quản lý virtual thread thông qua platform thread (carrier thread). Một platform thread có thể thực thi các virtual thread khác nhau vào các thời điểm khác nhau (nhiều virtual thread mount trên một platform thread). Khi virtual thread bị block hoặc chờ, platform thread có thể chuyển sang thực thi virtual thread khác.

Sơ đồ quan hệ giữa virtual thread, platform thread và system kernel thread như dưới (nguồn: [How to Use Java 19 Virtual Threads](https://medium.com/javarevisited/how-to-use-java-19-virtual-threads-c16a32bad5f7)):

![Quan hệ giữa virtual thread, platform thread và system kernel thread](https://oss.javaguide.cn/github/javaguide/java/new-features/virtual-threads-platform-threads-kernel-threads-relationship.png)

Thêm một điểm về quan hệ tương ứng giữa platform thread và system kernel thread: Trên các OS phổ biến như Windows và Linux, Java thread dùng mô hình one-to-one — tức một platform thread tương ứng một system kernel thread. Solaris là ngoại lệ, HotSpot VM trên Solaris hỗ trợ cả many-to-many và one-to-one. Tham khảo câu trả lời của R: [Mô hình thread trong JVM có phải user-level không?](https://www.zhihu.com/question/23096638/answer/29617153).

## Virtual Thread có ưu và nhược điểm gì?

### Ưu điểm

- **Rất lightweight**: Có thể tạo hàng trăm nghìn virtual thread trong một thread mà không gây tạo quá nhiều thread và context switching.
- **Đơn giản hóa async programming**: Virtual thread có thể đơn giản hóa async programming, giúp code dễ hiểu và bảo trì hơn. Có thể viết async code trông giống sync code, tránh được callback hell.
- **Giảm resource overhead**: Vì virtual thread được JVM triển khai, nó có thể sử dụng underlying resource như CPU và memory hiệu quả hơn. Context switching của virtual thread nhẹ hơn platform thread, do đó hỗ trợ high concurrency tốt hơn.

### Nhược điểm

- **Không phù hợp cho compute-intensive task**: Virtual thread phù hợp với I/O-intensive task nhưng không phù hợp với compute-intensive task, vì tính toán dày đặc luôn cần CPU resource hỗ trợ.
- **Không tương thích với một số third-party library**: Mặc dù virtual thread được thiết kế với khả năng tương thích code hiện có, nhưng một số third-party library phụ thuộc vào đặc tính platform thread có thể không hoàn toàn tương thích với virtual thread.

## Cách tạo Virtual Thread?

Official cung cấp 4 cách tạo virtual thread sau:

1. Dùng `Thread.startVirtualThread()` để tạo
2. Dùng `Thread.ofVirtual()` để tạo
3. Dùng `ThreadFactory` để tạo
4. Dùng `Executors.newVirtualThreadPerTaskExecutor()` để tạo

**1. Dùng `Thread.startVirtualThread()` để tạo**

```java
public class VirtualThreadTest {
  public static void main(String[] args) {
    CustomThread customThread = new CustomThread();
    Thread.startVirtualThread(customThread);
  }
}

static class CustomThread implements Runnable {
  @Override
  public void run() {
    System.out.println("CustomThread run");
  }
}
```

**2. Dùng `Thread.ofVirtual()` để tạo**

```java
public class VirtualThreadTest {
  public static void main(String[] args) {
    CustomThread customThread = new CustomThread();
    // Tạo mà không start
    Thread unStarted = Thread.ofVirtual().unstarted(customThread);
    unStarted.start();
    // Tạo và start luôn
    Thread.ofVirtual().start(customThread);
  }
}
static class CustomThread implements Runnable {
  @Override
  public void run() {
    System.out.println("CustomThread run");
  }
}
```

**3. Dùng `ThreadFactory` để tạo**

```java
public class VirtualThreadTest {
  public static void main(String[] args) {
    CustomThread customThread = new CustomThread();
    ThreadFactory factory = Thread.ofVirtual().factory();
    Thread thread = factory.newThread(customThread);
    thread.start();
  }
}

static class CustomThread implements Runnable {
  @Override
  public void run() {
    System.out.println("CustomThread run");
  }
}
```

**4. Dùng `Executors.newVirtualThreadPerTaskExecutor()` để tạo**

```java
public class VirtualThreadTest {
  public static void main(String[] args) {
    CustomThread customThread = new CustomThread();
    ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
    executor.submit(customThread);
  }
}
static class CustomThread implements Runnable {
  @Override
  public void run() {
    System.out.println("CustomThread run");
  }
}
```

## So sánh hiệu năng Virtual Thread và Platform Thread

Xử lý cùng một task bằng multi-thread và virtual thread, so sánh số lượng OS thread được tạo và thời gian xử lý.

**Lưu ý**: Trong số OS thread được đếm có một số là background thread (như GC thread), giống nhau ở cả hai tình huống nên không ảnh hưởng đến việc so sánh.

**Code test**:

```java
public class VirtualThreadTest {
    static List<Integer> list = new ArrayList<>();
    public static void main(String[] args) {
        // Mở thread để đếm platform thread số lượng
        ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(1);
        scheduledExecutorService.scheduleAtFixedRate(() -> {
            ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
            ThreadInfo[] threadInfo = threadBean.dumpAllThreads(false, false);
            updateMaxThreadNum(threadInfo.length);
        }, 10, 10, TimeUnit.MILLISECONDS);

        long start = System.currentTimeMillis();
        // Virtual thread
        ExecutorService executor =  Executors.newVirtualThreadPerTaskExecutor();
        // Dùng platform thread
        // ExecutorService executor =  Executors.newFixedThreadPool(200);
        for (int i = 0; i < 10000; i++) {
            executor.submit(() -> {
                try {
                    // Thread sleep 0.5s, simulate business processing
                    TimeUnit.MILLISECONDS.sleep(500);
                } catch (InterruptedException ignored) {
                }
            });
        }
        executor.close();
        System.out.println("max：" + list.get(0) + " platform thread/os thread");
        System.out.printf("totalMillis：%dms\n", System.currentTimeMillis() - start);


    }
    // Cập nhật số lượng platform thread tối đa đã tạo
    private static void updateMaxThreadNum(int num) {
        if (list.isEmpty()) {
            list.add(num);
        } else {
            Integer integer = list.get(0);
            if (num > integer) {
                list.add(0, num);
            }
        }
    }
}
```

**10000 requests, mỗi request mất 1s**:

```plain
// Virtual Thread
max：22 platform thread/os thread
totalMillis：1806ms

// Platform Thread  200 threads
max：209 platform thread/os thread
totalMillis：50578ms

// Platform Thread  500 threads
max：509 platform thread/os thread
totalMillis：20254ms

// Platform Thread  1000 threads
max：1009 platform thread/os thread
totalMillis：10214ms

// Platform Thread  2000 threads
max：2009 platform thread/os thread
totalMillis：5358ms
```

**10000 requests, mỗi request mất 0.5s**:

```plain
// Virtual Thread
max：22 platform thread/os thread
totalMillis：1316ms

// Platform Thread  200 threads
max：209 platform thread/os thread
totalMillis：25619ms

// Platform Thread  500 threads
max：509 platform thread/os thread
totalMillis：10277ms

// Platform Thread  1000 threads
max：1009 platform thread/os thread
totalMillis：5197ms

// Platform Thread  2000 threads
max：2009 platform thread/os thread
totalMillis：2865ms
```

- Có thể thấy trong tình huống I/O-intensive, cần tạo nhiều platform thread async mới đạt được tốc độ xử lý của virtual thread.
- Do đó, trong tình huống I/O-intensive, virtual thread có thể cải thiện đáng kể hiệu quả thực thi thread, giảm tạo thread resource và context switching.

**Lưu ý**: Có giai đoạn JDK liên tục nỗ lực với Reactive programming để cải thiện hiệu năng Java, nhưng Reactive programming khó hiểu, debug và sử dụng, cuối cùng lại quay về sync programming — và cuối cùng virtual thread ra đời.

## Nguyên lý bên dưới của Virtual Thread là gì?

Nếu muốn tìm hiểu chi tiết nguyên lý triển khai virtual thread, khuyến nghị bài: [Virtual Thread — VirtualThread Source Code Analysis](https://www.cnblogs.com/throwable/p/16758997.html).
