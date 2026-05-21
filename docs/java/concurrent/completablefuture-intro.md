---
title: Giới thiệu chi tiết về CompletableFuture
description: Giải thích chi tiết về lập trình bất đồng bộ với CompletableFuture：Trình bày đầy đủ các API cốt lõi của CompletableFuture, sắp xếp tác vụ bất đồng bộ, kết hợp thenCompose/thenCombine, tổng hợp allOf/anyOf, cấu hình thread pool và các thực hành tốt nhất.
category: Java
tag:
  - Java Concurrent
head:
  - - meta
    - name: keywords
      content: CompletableFuture,异步编程,异步编排,Future,thenCompose,thenCombine,allOf,并行任务
---

Trong các dự án thực tế, một API có thể cần lấy nhiều loại dữ liệu khác nhau cùng lúc rồi tổng hợp trả về, tình huống này khá phổ biến. Ví dụ: khi người dùng yêu cầu lấy thông tin đơn hàng, có thể cần đồng thời lấy thông tin người dùng, chi tiết sản phẩm, thông tin vận chuyển, gợi ý sản phẩm, v.v.

Nếu thực hiện tuần tự (từng tác vụ theo thứ tự), tốc độ phản hồi của API sẽ rất chậm. Xét đến việc phần lớn các tác vụ này **không có mối quan hệ thứ tự trước sau**, chúng có thể được **thực hiện song song**, chẳng hạn khi gọi lấy chi tiết sản phẩm thì có thể đồng thời gọi lấy thông tin vận chuyển. Bằng cách thực hiện nhiều tác vụ song song, tốc độ phản hồi của API sẽ được cải thiện đáng kể.

![](/images/github/javaguide/high-performance/serial-to-parallel.png)

Đối với các tác vụ có mối quan hệ thứ tự gọi trước sau, có thể thực hiện sắp xếp tác vụ.

![](/images/github/javaguide/high-performance/serial-to-parallel2.png)

1. Chỉ sau khi lấy được thông tin người dùng mới có thể gọi API chi tiết sản phẩm và thông tin vận chuyển.
2. Chỉ sau khi lấy thành công chi tiết sản phẩm và thông tin vận chuyển mới có thể gọi API gợi ý sản phẩm.

Các tình huống có thể cần sắp xếp tác vụ bất đồng bộ đa luồng (đây chỉ là ví dụ, dữ liệu không nhất thiết phải trả về một lần, có thể chia API):

1. Trang chủ: Ví dụ trang chủ của cộng đồng kỹ thuật có thể cần đồng thời lấy danh sách bài viết gợi ý, thanh quảng cáo, bảng xếp hạng bài viết, chủ đề hot, v.v.
2. Trang chi tiết: Ví dụ trang chi tiết bài viết của cộng đồng kỹ thuật có thể cần đồng thời lấy thông tin tác giả, nội dung bài viết, bình luận bài viết, v.v.
3. Module thống kê: Ví dụ module thống kê backend của cộng đồng kỹ thuật có thể cần đồng thời lấy tổng số người theo dõi, dữ liệu bài viết (lượt xem, bình luận, lưu) tổng hợp, v.v.

Đối với các chương trình Java, `CompletableFuture` được giới thiệu trong Java 8 có thể giúp chúng ta sắp xếp nhiều tác vụ, tính năng rất mạnh mẽ.

Bài viết này là phần nhập môn đơn giản về `CompletableFuture`, hướng dẫn mọi người các API phổ biến của `CompletableFuture`.

## Giới thiệu về Future

Lớp `Future` là ứng dụng điển hình của tư tưởng bất đồng bộ, chủ yếu được dùng trong các tình huống cần thực hiện các tác vụ tốn thời gian, để tránh chương trình phải chờ đợi tại chỗ cho đến khi tác vụ tốn thời gian hoàn thành, hiệu quả thực thi quá thấp. Cụ thể là: khi chúng ta thực hiện một tác vụ tốn thời gian, chúng ta có thể giao tác vụ này cho một luồng con thực hiện bất đồng bộ, trong khi đó chúng ta có thể làm việc khác, không cần chờ đợi cho đến khi tác vụ hoàn thành. Khi chúng ta hoàn thành việc của mình, chúng ta có thể lấy kết quả thực thi của tác vụ tốn thời gian qua lớp `Future`. Như vậy, hiệu quả thực thi của chương trình được cải thiện rõ rệt.

Đây thực chất là **mẫu Future** cổ điển trong lập trình đa luồng, bạn có thể xem nó như một mẫu thiết kế, ý tưởng cốt lõi là gọi bất đồng bộ, chủ yếu dùng trong lĩnh vực đa luồng, không phải đặc trưng riêng của ngôn ngữ Java.

Trong Java, lớp `Future` chỉ là một interface generic, nằm trong package `java.util.concurrent`, định nghĩa 5 phương thức, chủ yếu bao gồm 4 chức năng sau:

- Hủy tác vụ;
- Kiểm tra tác vụ có bị hủy không;
- Kiểm tra tác vụ đã thực hiện xong chưa;
- Lấy kết quả thực thi tác vụ.

```java
// V 代表了Future执行的任务返回值的类型
public interface Future<V> {
    // 取消任务执行
    // 成功取消返回 true，否则返回 false
    boolean cancel(boolean mayInterruptIfRunning);
    // 判断任务是否被取消
    boolean isCancelled();
    // 判断任务是否已经执行完成
    boolean isDone();
    // 获取任务执行结果
    V get() throws InterruptedException, ExecutionException;
    // 指定时间内没有返回计算结果就抛出 TimeOutException 异常
    V get(long timeout, TimeUnit unit)

        throws InterruptedException, ExecutionException, TimeoutExceptio

}
```

Hiểu đơn giản là: Tôi có một tác vụ, giao cho `Future` xử lý. Trong thời gian tác vụ thực hiện tôi có thể làm bất cứ điều gì muốn. Và trong thời gian đó tôi còn có thể hủy tác vụ cũng như lấy trạng thái thực thi của tác vụ. Sau một thời gian, tôi có thể lấy kết quả thực thi tác vụ trực tiếp từ `Future`.

## Giới thiệu về CompletableFuture

`Future` trong quá trình sử dụng thực tế có một số hạn chế, chẳng hạn không hỗ trợ sắp xếp kết hợp tác vụ bất đồng bộ, phương thức `get()` để lấy kết quả tính toán là lời gọi chặn.

Lớp `CompletableFuture` được giới thiệu trong Java 8 có thể giải quyết những hạn chế này của `Future`. Ngoài cung cấp các tính năng `Future` hữu dụng và mạnh mẽ hơn, `CompletableFuture` còn cung cấp khả năng lập trình hàm, sắp xếp kết hợp tác vụ bất đồng bộ (có thể nối nhiều tác vụ bất đồng bộ thành một chuỗi hoàn chỉnh), v.v.

Hãy cùng xem qua định nghĩa của lớp `CompletableFuture`.

```java
public class CompletableFuture<T> implements Future<T>, CompletionStage<T> {
}
```

Có thể thấy, `CompletableFuture` đồng thời triển khai cả hai interface `Future` và `CompletionStage`.

![](/images/github/javaguide/java/concurrent/completablefuture-class-diagram.jpg)

Ngoài cung cấp các tính năng `Future` hữu dụng và mạnh mẽ hơn, `CompletableFuture` còn cung cấp khả năng lập trình hàm.

![](/images/javaguide/image-20210902092441434.png)

Interface `Future` có 5 phương thức:

- `boolean cancel(boolean mayInterruptIfRunning)`: Cố gắng hủy thực thi tác vụ.
- `boolean isCancelled()`: Kiểm tra tác vụ có bị hủy không.
- `boolean isDone()`: Kiểm tra tác vụ đã thực hiện xong chưa.
- `get()`: Chờ tác vụ hoàn thành và lấy kết quả tính toán.
- `get(long timeout, TimeUnit unit)`: Thêm một thời gian timeout.

Interface `CompletionStage` mô tả một giai đoạn của tính toán bất đồng bộ. Nhiều tính toán có thể được chia thành nhiều giai đoạn hoặc bước, lúc này có thể dùng nó để tổng hợp tất cả các bước lại, tạo thành pipeline của tính toán bất đồng bộ.

Interface `CompletionStage` có nhiều phương thức, khả năng lập trình hàm của `CompletableFuture` được cung cấp bởi interface này. Nhìn vào tham số các phương thức của interface này bạn sẽ thấy nó sử dụng nhiều lập trình hàm được giới thiệu trong Java 8.

![](/images/javaguide/image-20210902093026059.png)

Do có nhiều phương thức, nên không thể giải thích từng cái một ở đây, phần dưới tôi sẽ giới thiệu cách sử dụng hầu hết các phương thức phổ biến.

## Các thao tác phổ biến với CompletableFuture

### Tạo CompletableFuture

Các phương thức phổ biến để tạo đối tượng `CompletableFuture` như sau:

1. Thông qua từ khóa new.
2. Dựa trên các phương thức factory static có sẵn của `CompletableFuture`: `runAsync()`, `supplyAsync()`.

#### Từ khóa new

Tạo đối tượng `CompletableFuture` bằng từ khóa new có thể được xem như sử dụng `CompletableFuture` như một `Future`.

Trong dự án open source của tôi [guide-rpc-framework](https://github.com/Snailclimb/guide-rpc-framework), tôi đã tạo đối tượng `CompletableFuture` theo cách này.

Hãy xem một ví dụ đơn giản.

Chúng ta tạo một `CompletableFuture` với kiểu kết quả là `RpcResponse<Object>`, bạn có thể coi `resultFuture` như là nơi chứa kết quả tính toán bất đồng bộ.

```java
CompletableFuture<RpcResponse<Object>> resultFuture = new CompletableFuture<>();
```

Giả sử ở một thời điểm nào đó trong tương lai, chúng ta nhận được kết quả cuối cùng. Lúc này, chúng ta có thể gọi phương thức `complete()` để truyền kết quả vào, điều này có nghĩa là `resultFuture` đã hoàn thành.

```java
// complete() 方法只能调用一次，后续调用将被忽略。
resultFuture.complete(rpcResponse);
```

Bạn có thể dùng phương thức `isDone()` để kiểm tra đã hoàn thành chưa.

```java
public boolean isDone() {
    return result != null;
}
```

Lấy kết quả tính toán bất đồng bộ cũng rất đơn giản, chỉ cần gọi phương thức `get()`. Luồng gọi `get()` sẽ bị chặn cho đến khi `CompletableFuture` hoàn thành tính toán.

```java
rpcResponse = completableFuture.get();
```

Nếu bạn đã biết kết quả tính toán, có thể dùng phương thức static `completedFuture()` để tạo `CompletableFuture`.

```java
CompletableFuture<String> future = CompletableFuture.completedFuture("hello!");
assertEquals("hello!", future.get());
```

Phương thức `completedFuture()` bên dưới gọi phương thức new có tham số, chỉ là phương thức này không được expose ra ngoài.

```java
public static <U> CompletableFuture<U> completedFuture(U value) {
    return new CompletableFuture<U>((value == null) ? NIL : value);
}
```

#### Phương thức factory static

Hai phương thức này có thể giúp chúng ta đóng gói logic tính toán.

```java
static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier);
// 使用自定义线程池(推荐)
static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier, Executor executor);
static CompletableFuture<Void> runAsync(Runnable runnable);
// 使用自定义线程池(推荐)
static CompletableFuture<Void> runAsync(Runnable runnable, Executor executor);
```

Phương thức `runAsync()` nhận tham số là `Runnable`, đây là một interface hàm, không cho phép trả về giá trị. Khi bạn cần thao tác bất đồng bộ và không quan tâm đến kết quả trả về, có thể dùng phương thức `runAsync()`.

```java
@FunctionalInterface
public interface Runnable {
    public abstract void run();
}
```

Phương thức `supplyAsync()` nhận tham số là `Supplier<U>`, đây cũng là một interface hàm, `U` là kiểu của kết quả trả về.

```java
@FunctionalInterface
public interface Supplier<T> {

    /**
     * Gets a result.
     *
     * @return a result
     */
    T get();
}
```

Khi bạn cần thao tác bất đồng bộ và quan tâm đến kết quả trả về, có thể dùng phương thức `supplyAsync()`.

```java
CompletableFuture<Void> future = CompletableFuture.runAsync(() -> System.out.println("hello!"));
future.get();// 输出 "hello!"
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "hello!");
assertEquals("hello!", future2.get());
```

### Xử lý kết quả tính toán bất đồng bộ

Sau khi nhận được kết quả tính toán bất đồng bộ, chúng ta còn có thể xử lý thêm, các phương thức thường dùng bao gồm:

- `thenApply()`
- `thenAccept()`
- `thenRun()`
- `whenComplete()`

Phương thức `thenApply()` nhận một instance `Function` để xử lý kết quả.

```java
// 沿用上一个任务的线程池
public <U> CompletableFuture<U> thenApply(
    Function<? super T,? extends U> fn) {
    return uniApplyStage(null, fn);
}

//使用默认的 ForkJoinPool 线程池（不推荐）
public <U> CompletableFuture<U> thenApplyAsync(
    Function<? super T,? extends U> fn) {
    return uniApplyStage(defaultExecutor(), fn);
}
// 使用自定义线程池(推荐)
public <U> CompletableFuture<U> thenApplyAsync(
    Function<? super T,? extends U> fn, Executor executor) {
    return uniApplyStage(screenExecutor(executor), fn);
}
```

Ví dụ sử dụng phương thức `thenApply()`:

```java
CompletableFuture<String> future = CompletableFuture.completedFuture("hello!")
        .thenApply(s -> s + "world!");
assertEquals("hello!world!", future.get());
// 这次调用将被忽略。
future.thenApply(s -> s + "nice!");
assertEquals("hello!world!", future.get());
```

Bạn còn có thể thực hiện **gọi chuỗi**:

```java
CompletableFuture<String> future = CompletableFuture.completedFuture("hello!")
        .thenApply(s -> s + "world!").thenApply(s -> s + "nice!");
assertEquals("hello!world!nice!", future.get());
```

**Nếu bạn không cần lấy kết quả trả về từ callback, có thể dùng `thenAccept()` hoặc `thenRun()`. Điểm khác biệt giữa hai phương thức này là `thenRun()` không thể truy cập kết quả tính toán bất đồng bộ.**

Tham số của phương thức `thenAccept()` là `Consumer<? super T>`.

```java
public CompletableFuture<Void> thenAccept(Consumer<? super T> action) {
    return uniAcceptStage(null, action);
}

public CompletableFuture<Void> thenAcceptAsync(Consumer<? super T> action) {
    return uniAcceptStage(defaultExecutor(), action);
}

public CompletableFuture<Void> thenAcceptAsync(Consumer<? super T> action,
                                               Executor executor) {
    return uniAcceptStage(screenExecutor(executor), action);
}
```

Như tên gọi, `Consumer` là interface tiêu thụ (consume), nó có thể nhận 1 đối tượng đầu vào và thực hiện "tiêu thụ".

```java
@FunctionalInterface
public interface Consumer<T> {

    void accept(T t);

    default Consumer<T> andThen(Consumer<? super T> after) {
        Objects.requireNonNull(after);
        return (T t) -> { accept(t); after.accept(t); };
    }
}
```

Tham số của phương thức `thenRun()` là `Runnable`.

```java
public CompletableFuture<Void> thenRun(Runnable action) {
    return uniRunStage(null, action);
}

public CompletableFuture<Void> thenRunAsync(Runnable action) {
    return uniRunStage(defaultExecutor(), action);
}

public CompletableFuture<Void> thenRunAsync(Runnable action,
                                            Executor executor) {
    return uniRunStage(screenExecutor(executor), action);
}
```

Ví dụ sử dụng `thenAccept()` và `thenRun()`:

```java
CompletableFuture.completedFuture("hello!")
        .thenApply(s -> s + "world!").thenApply(s -> s + "nice!").thenAccept(System.out::println);//hello!world!nice!

CompletableFuture.completedFuture("hello!")
        .thenApply(s -> s + "world!").thenApply(s -> s + "nice!").thenRun(() -> System.out.println("hello!"));//hello!
```

Tham số của phương thức `whenComplete()` là `BiConsumer<? super T, ? super Throwable>`.

```java
public CompletableFuture<T> whenComplete(
    BiConsumer<? super T, ? super Throwable> action) {
    return uniWhenCompleteStage(null, action);
}


public CompletableFuture<T> whenCompleteAsync(
    BiConsumer<? super T, ? super Throwable> action) {
    return uniWhenCompleteStage(defaultExecutor(), action);
}
// 使用自定义线程池(推荐)
public CompletableFuture<T> whenCompleteAsync(
    BiConsumer<? super T, ? super Throwable> action, Executor executor) {
    return uniWhenCompleteStage(screenExecutor(executor), action);
}
```

So với `Consumer`, `BiConsumer` có thể nhận 2 đối tượng đầu vào và thực hiện "tiêu thụ".

```java
@FunctionalInterface
public interface BiConsumer<T, U> {
    void accept(T t, U u);

    default BiConsumer<T, U> andThen(BiConsumer<? super T, ? super U> after) {
        Objects.requireNonNull(after);

        return (l, r) -> {
            accept(l, r);
            after.accept(l, r);
        };
    }
}
```

Ví dụ sử dụng `whenComplete()`:

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> "hello!")
        .whenComplete((res, ex) -> {
            // res 代表返回的结果
            // ex 的类型为 Throwable ，代表抛出的异常
            System.out.println(res);
            // 这里没有抛出异常所有为 null
            assertNull(ex);
        });
assertEquals("hello!", future.get());
```

### Xử lý ngoại lệ

Bạn có thể dùng phương thức `handle()` để xử lý các ngoại lệ có thể xảy ra trong quá trình thực thi tác vụ.

```java
public <U> CompletableFuture<U> handle(
    BiFunction<? super T, Throwable, ? extends U> fn) {
    return uniHandleStage(null, fn);
}

public <U> CompletableFuture<U> handleAsync(
    BiFunction<? super T, Throwable, ? extends U> fn) {
    return uniHandleStage(defaultExecutor(), fn);
}

public <U> CompletableFuture<U> handleAsync(
    BiFunction<? super T, Throwable, ? extends U> fn, Executor executor) {
    return uniHandleStage(screenExecutor(executor), fn);
}
```

Code ví dụ như sau:

```java
CompletableFuture<String> future
        = CompletableFuture.supplyAsync(() -> {
    if (true) {
        throw new RuntimeException("Computation error!");
    }
    return "hello!";
}).handle((res, ex) -> {
    // res 代表返回的结果
    // ex 的类型为 Throwable ，代表抛出的异常
    return res != null ? res : "world!";
});
assertEquals("world!", future.get());
```

Bạn còn có thể dùng phương thức `exceptionally()` để xử lý ngoại lệ.

```java
CompletableFuture<String> future
        = CompletableFuture.supplyAsync(() -> {
    if (true) {
        throw new RuntimeException("Computation error!");
    }
    return "hello!";
}).exceptionally(ex -> {
    System.out.println(ex.toString());// CompletionException
    return "world!";
});
assertEquals("world!", future.get());
```

Nếu bạn muốn kết quả của `CompletableFuture` là ngoại lệ, có thể dùng phương thức `completeExceptionally()` để gán giá trị cho nó.

```java
CompletableFuture<String> completableFuture = new CompletableFuture<>();
// ...
completableFuture.completeExceptionally(
  new RuntimeException("Calculation failed!"));
// ...
completableFuture.get(); // ExecutionException
```

### Kết hợp CompletableFuture

Bạn có thể dùng `thenCompose()` để nối hai đối tượng `CompletableFuture` theo thứ tự, thực hiện chuỗi tác vụ bất đồng bộ. Tác dụng của nó là lấy kết quả trả về của tác vụ trước làm tham số đầu vào cho tác vụ tiếp theo, từ đó tạo thành mối quan hệ phụ thuộc.

```java
public <U> CompletableFuture<U> thenCompose(
    Function<? super T, ? extends CompletionStage<U>> fn) {
    return uniComposeStage(null, fn);
}

public <U> CompletableFuture<U> thenComposeAsync(
    Function<? super T, ? extends CompletionStage<U>> fn) {
    return uniComposeStage(defaultExecutor(), fn);
}

public <U> CompletableFuture<U> thenComposeAsync(
    Function<? super T, ? extends CompletionStage<U>> fn,
    Executor executor) {
    return uniComposeStage(screenExecutor(executor), fn);
}
```

Ví dụ sử dụng phương thức `thenCompose()`:

```java
CompletableFuture<String> future
        = CompletableFuture.supplyAsync(() -> "hello!")
        .thenCompose(s -> CompletableFuture.supplyAsync(() -> s + "world!"));
assertEquals("hello!world!", future.get());
```

Trong phát triển thực tế, phương thức này rất hữu ích. Ví dụ, task1 và task2 đều thực hiện bất đồng bộ, nhưng task1 phải hoàn thành trước khi task2 bắt đầu (task2 phụ thuộc vào kết quả của task1).

Tương tự với phương thức `thenCompose()` còn có phương thức `thenCombine()`, nó cũng có thể kết hợp hai đối tượng `CompletableFuture`.

```java
CompletableFuture<String> completableFuture
        = CompletableFuture.supplyAsync(() -> "hello!")
        .thenCombine(CompletableFuture.supplyAsync(
                () -> "world!"), (s1, s2) -> s1 + s2)
        .thenCompose(s -> CompletableFuture.supplyAsync(() -> s + "nice!"));
assertEquals("hello!world!nice!", completableFuture.get());
```

**Vậy `thenCompose()` và `thenCombine()` khác nhau ở điểm nào?**

- `thenCompose()` có thể nối hai đối tượng `CompletableFuture`, lấy kết quả trả về của tác vụ trước làm tham số của tác vụ tiếp theo, giữa chúng có mối quan hệ thứ tự.
- `thenCombine()` sẽ tổng hợp kết quả của hai tác vụ sau khi cả hai đều hoàn thành. Hai tác vụ thực hiện song song, giữa chúng không có mối quan hệ phụ thuộc thứ tự.

Ngoài `thenCompose()` và `thenCombine()`, còn có một số phương thức kết hợp `CompletableFuture` khác để thực hiện các hiệu ứng khác nhau, đáp ứng các nhu cầu nghiệp vụ khác nhau.

Ví dụ, nếu chúng ta muốn thực hiện task3 khi bất kỳ task1 hoặc task2 hoàn thành, có thể dùng `acceptEither()`.

```java
public CompletableFuture<Void> acceptEither(
    CompletionStage<? extends T> other, Consumer<? super T> action) {
    return orAcceptStage(null, other, action);
}

public CompletableFuture<Void> acceptEitherAsync(
    CompletionStage<? extends T> other, Consumer<? super T> action) {
    return orAcceptStage(asyncPool, other, action);
}
```

Một ví dụ đơn giản:

```java
CompletableFuture<String> task = CompletableFuture.supplyAsync(() -> {
    System.out.println("任务1开始执行，当前时间：" + System.currentTimeMillis());
    try {
        Thread.sleep(500);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    System.out.println("任务1执行完毕，当前时间：" + System.currentTimeMillis());
    return "task1";
});

CompletableFuture<String> task2 = CompletableFuture.supplyAsync(() -> {
    System.out.println("任务2开始执行，当前时间：" + System.currentTimeMillis());
    try {
        Thread.sleep(1000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    System.out.println("任务2执行完毕，当前时间：" + System.currentTimeMillis());
    return "task2";
});

task.acceptEitherAsync(task2, (res) -> {
    System.out.println("任务3开始执行，当前时间：" + System.currentTimeMillis());
    System.out.println("上一个任务的结果为：" + res);
});

// 增加一些延迟时间，确保异步任务有足够的时间完成
try {
    Thread.sleep(2000);
} catch (InterruptedException e) {
    e.printStackTrace();
}
```

Kết quả đầu ra:

```plain
任务1开始执行，当前时间：1695088058520
任务2开始执行，当前时间：1695088058521
任务1执行完毕，当前时间：1695088059023
任务3开始执行，当前时间：1695088059023
上一个任务的结果为：task1
任务2执行完毕，当前时间：1695088059523
```

Thao tác kết hợp tác vụ `acceptEitherAsync()` sẽ kích hoạt thực thi task3 khi bất kỳ tác vụ bất đồng bộ 1 hoặc 2 hoàn thành, nhưng cần lưu ý thời điểm kích hoạt này là không chắc chắn. Nếu cả task1 và task2 đều chưa hoàn thành thì task3 không thể được thực thi.

### Chạy song song nhiều CompletableFuture

Bạn có thể dùng phương thức static `allOf()` của `CompletableFuture` để chạy song song nhiều `CompletableFuture`.

Trong các dự án thực tế, chúng ta thường cần chạy song song nhiều tác vụ không liên quan đến nhau, các tác vụ này không có mối quan hệ phụ thuộc, có thể thực hiện độc lập với nhau.

Ví dụ chúng ta cần đọc và xử lý 6 file, 6 tác vụ này không có thứ tự phụ thuộc khi thực hiện, nhưng chúng ta cần thống kê và tổng hợp kết quả xử lý của các file này khi trả về cho người dùng. Trong trường hợp như thế này chúng ta có thể dùng chạy song song nhiều `CompletableFuture` để xử lý.

Code ví dụ như sau:

```java
CompletableFuture<Void> task1 =
  CompletableFuture.supplyAsync(()->{
    //自定义业务操作
  });
......
CompletableFuture<Void> task6 =
  CompletableFuture.supplyAsync(()->{
    //自定义业务操作
  });
......
 CompletableFuture<Void> headerFuture=CompletableFuture.allOf(task1,.....,task6);

  try {
    headerFuture.join();
  } catch (Exception ex) {
    ......
  }
System.out.println("all done. ");
```

Phương thức thường được đem so sánh với `allOf()` là phương thức `anyOf()`.

**Phương thức `allOf()` sẽ chờ đến khi tất cả `CompletableFuture` đều chạy xong mới trả về**

```java
Random rand = new Random();
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
    try {
        Thread.sleep(1000 + rand.nextInt(1000));
    } catch (InterruptedException e) {
        e.printStackTrace();
    } finally {
        System.out.println("future1 done...");
    }
    return "abc";
});
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> {
    try {
        Thread.sleep(1000 + rand.nextInt(1000));
    } catch (InterruptedException e) {
        e.printStackTrace();
    } finally {
        System.out.println("future2 done...");
    }
    return "efg";
});
```

Gọi `join()` để chương trình chờ `future1` và `future2` đều chạy xong mới tiếp tục thực hiện.

```java
CompletableFuture<Void> completableFuture = CompletableFuture.allOf(future1, future2);
completableFuture.join();
assertTrue(completableFuture.isDone());
System.out.println("all futures done...");
```

Kết quả đầu ra:

```plain
future1 done...
future2 done...
all futures done...
```

**Phương thức `anyOf()` không chờ tất cả `CompletableFuture` đều chạy xong mới trả về, chỉ cần một cái hoàn thành là được!**

```java
CompletableFuture<Object> f = CompletableFuture.anyOf(future1, future2);
System.out.println(f.get());
```

Kết quả đầu ra có thể là:

```plain
future2 done...
efg
```

Hoặc có thể là:

```plain
future1 done...
abc
```

## Khuyến nghị sử dụng CompletableFuture

### Sử dụng thread pool tùy chỉnh

Trong các ví dụ code ở trên, để tiện lợi, chúng ta không chọn thread pool tùy chỉnh. Trong dự án thực tế, điều này là không thể chấp nhận.

`CompletableFuture` mặc định sử dụng `ForkJoinPool.commonPool()` được chia sẻ toàn cục làm executor, tất cả các tác vụ bất đồng bộ không chỉ định executor đều sử dụng thread pool này. Điều này có nghĩa là nếu ứng dụng, nhiều thư viện hoặc framework (như Spring, thư viện bên thứ ba) đều phụ thuộc vào `CompletableFuture`, theo mặc định chúng đều chia sẻ cùng một thread pool.

Mặc dù `ForkJoinPool` rất hiệu quả, nhưng khi đồng thời gửi nhiều tác vụ, có thể dẫn đến tranh giành tài nguyên và thread starvation, ảnh hưởng đến hiệu năng hệ thống.

Để tránh những vấn đề này, khuyến nghị cung cấp thread pool tùy chỉnh cho `CompletableFuture`, mang lại những lợi ích sau:

- **Cô lập**: Phân bổ thread pool độc lập cho các tác vụ khác nhau, tránh tranh giành tài nguyên thread pool toàn cục.
- **Kiểm soát tài nguyên**: Điều chỉnh kích thước thread pool và kiểu hàng đợi theo đặc điểm tác vụ, tối ưu hóa hiệu năng.
- **Xử lý ngoại lệ**: Xử lý tốt hơn các ngoại lệ trong luồng thông qua `ThreadFactory` tùy chỉnh.

```java
private ThreadPoolExecutor executor = new ThreadPoolExecutor(10, 10,
        0L, TimeUnit.MILLISECONDS,
        new LinkedBlockingQueue<Runnable>());

CompletableFuture.runAsync(() -> {
     //...
}, executor);
```

### Cố gắng tránh dùng get()

Phương thức `get()` của `CompletableFuture` là chặn, nên cố gắng tránh sử dụng. Nếu bắt buộc phải dùng, cần thêm thời gian timeout, nếu không có thể dẫn đến luồng chính chờ mãi, không thể thực hiện các tác vụ khác.

```java
    CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
        try {
            Thread.sleep(10_000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return "Hello, world!";
    });

    // 获取异步任务的返回值，设置超时时间为 5 秒
    try {
        String result = future.get(5, TimeUnit.SECONDS);
        System.out.println(result);
    } catch (InterruptedException | ExecutionException | TimeoutException e) {
        // 处理异常
        e.printStackTrace();
    }
}
```

Đoạn code trên khi gọi `get()` đã ném ra ngoại lệ `TimeoutException`. Như vậy chúng ta có thể thực hiện các thao tác tương ứng trong xử lý ngoại lệ, chẳng hạn hủy tác vụ, thử lại tác vụ, ghi log, v.v.

### Xử lý ngoại lệ đúng cách

Khi sử dụng `CompletableFuture` nhất định phải xử lý ngoại lệ đúng cách, tránh mất ngoại lệ hoặc xuất hiện các vấn đề không kiểm soát được.

Dưới đây là một số khuyến nghị:

- Dùng phương thức `whenComplete` có thể kích hoạt callback khi tác vụ hoàn thành và xử lý ngoại lệ đúng cách, thay vì để ngoại lệ bị nuốt mất hoặc mất đi.
- Dùng phương thức `exceptionally` có thể xử lý ngoại lệ và ném lại, để ngoại lệ có thể lan truyền đến các giai đoạn tiếp theo, thay vì để ngoại lệ bị bỏ qua hoặc kết thúc.
- Dùng phương thức `handle` có thể xử lý kết quả trả về bình thường và ngoại lệ, và trả về kết quả mới, thay vì để ngoại lệ ảnh hưởng đến logic nghiệp vụ bình thường.
- Dùng phương thức `CompletableFuture.allOf` có thể kết hợp nhiều `CompletableFuture` và xử lý thống nhất ngoại lệ của tất cả tác vụ, thay vì để xử lý ngoại lệ quá dài dòng hoặc lặp lại.
- ……

### Kết hợp nhiều tác vụ bất đồng bộ hợp lý

Sử dụng đúng cách các phương thức `thenCompose()`, `thenCombine()`, `acceptEither()`, `allOf()`, `anyOf()`, v.v. để kết hợp nhiều tác vụ bất đồng bộ, đáp ứng nhu cầu nghiệp vụ thực tế, nâng cao hiệu quả thực thi của chương trình.

Trong thực tế sử dụng, chúng ta còn có thể tận dụng hoặc tham khảo các framework sắp xếp tác vụ bất đồng bộ có sẵn, chẳng hạn [asyncTool](https://gitee.com/jd-platform-opensource/asyncTool) của JD.

![asyncTool README 文档](/images/github/javaguide/java/concurrent/asyncTool-readme.png)

## Lời kết

Bài viết này chỉ giới thiệu đơn giản các khái niệm cốt lõi và một số API phổ biến của `CompletableFuture`. Nếu muốn tìm hiểu sâu hơn, có thể tìm thêm sách và blog, chẳng hạn một số bài viết sau khá tốt:

- [CompletableFuture 原理与实践-外卖商家端 API 的异步化 - 美团技术团队](https://tech.meituan.com/2022/05/12/principles-and-practices-of-completablefuture.html): Bài viết này giới thiệu chi tiết về ứng dụng của `CompletableFuture` trong các dự án thực tế. Tham khảo bài viết này có thể tối ưu hóa các tình huống tương tự trong dự án, cũng là một điểm sáng nhỏ. Cách tối ưu hiệu năng này khá đơn giản và hiệu quả tốt!
- [读 RocketMQ 源码，学习并发编程三大神器 - 勇哥 java 实战分享](https://mp.weixin.qq.com/s/32Ak-WFLynQfpn0Cg0N-0A): Bài viết này giới thiệu ứng dụng của `CompletableFuture` trong RocketMQ. Cụ thể, từ RocketMQ 4.7, RocketMQ đã giới thiệu `CompletableFuture` để thực hiện xử lý tin nhắn bất đồng bộ.

Ngoài ra, khuyến nghị mọi người có thể xem framework concurrent [asyncTool](https://gitee.com/jd-platform-opensource/asyncTool) của JD, trong đó có nhiều ứng dụng `CompletableFuture`.

<!-- @include: @article-footer.snippet.md -->
