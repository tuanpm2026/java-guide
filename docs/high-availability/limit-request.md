---
title: Giải thích chi tiết Rate Limiting cho Service
description: Giải thích chi tiết nguyên lý và triển khai rate limiting cho service, bao gồm các thuật toán rate limiting chính như fixed window, sliding window, token bucket, leaky bucket.
category: High Availability
icon: limit_rate
---

Đối với hệ thống phần mềm, rate limiting là giới hạn tốc độ request, tránh lượng request đột ngột lớn làm sập hệ thống. Xét cho cùng, khả năng xử lý của hệ thống phần mềm là có hạn. Nếu vượt quá phạm vi xử lý của nó, hệ thống phần mềm có thể bị sập trực tiếp.

Rate limiting có thể dẫn đến request của user không được xử lý đúng hoặc không được xử lý ngay lập tức, nhưng đây thường cũng là giải pháp tối ưu sau khi cân nhắc sự ổn định của hệ thống phần mềm.

Trong cuộc sống thực tế, có rất nhiều ứng dụng thực tế của rate limiting. Ví dụ như xếp hàng mua vé là để tránh lượng lớn user đổ xô vào mua vé khiến nhân viên bán vé không thể xử lý.

## Các thuật toán rate limiting phổ biến là gì?

Giới thiệu ngắn gọn 4 thuật toán rate limiting rất dễ hiểu và dễ triển khai!

> Hình ảnh lấy từ bài viết của InfoQ [《Distributed Service Rate Limiting in Practice》](https://www.infoq.cn/article/Qg2tX8fyw5Vt-f3HH673).

### Fixed Window Counter Algorithm (Thuật toán đếm cửa sổ cố định)

Fixed window thực chất là time window, nguyên lý là chia thời gian thành các window có kích thước cố định, giới hạn số lượng hoặc tốc độ request trong mỗi window — tức là fixed window counter algorithm quy định số lượng request mà hệ thống xử lý trong một đơn vị thời gian.

Giả sử chúng ta quy định một interface trong hệ thống chỉ được truy cập 33 lần trong 1 phút, tư duy triển khai dùng fixed window counter algorithm như sau:

- Chia thời gian thành window kích thước cố định, ở đây là 1 phút một window.
- Cho một biến `counter` để ghi lại số lượng request interface đang xử lý, giá trị ban đầu là 0 (đại diện cho interface chưa xử lý request nào trong 1 phút hiện tại).
- Trong 1 phút, mỗi lần xử lý một request thì `counter+1`, khi `counter=33` (tức là trong 1 phút này interface đã được truy cập 33 lần), các request tiếp theo sẽ bị từ chối tất cả.
- Đến khi 1 phút kết thúc, reset `counter` về 0, bắt đầu đếm lại.

![Fixed Window Counter Algorithm](https://static001.infoq.cn/resource/image/8d/15/8ded7a2b90e1482093f92fff555b3615.png)

Ưu điểm: Triển khai đơn giản, dễ hiểu.

Nhược điểm:

- Rate limiting không đủ mượt. Ví dụ, chúng ta giới hạn một interface chỉ được truy cập 30 lần mỗi phút. Giả sử 30 giây đầu đã có 30 request đến, thì 30 giây sau sẽ không thể xử lý request nào — điều này không thể chấp nhận được, user experience cực kỳ tệ!
- Không thể đảm bảo tốc độ rate limiting, do đó không thể đối phó với traffic đột ngột tăng vọt. Ví dụ, chúng ta giới hạn một interface chỉ được truy cập 1000 lần trong 1 phút, QPS của interface này là 500. Trong 55 giây đầu interface này không nhận một request nào, đến giây cuối đột nhiên nhận được 1000 request. Trong tình huống này, 1000 request này không thể được xử lý trong 1 giây, hệ thống bị đánh gục bởi lượng request đột ngột tăng vọt.

### Sliding Window Counter Algorithm (Thuật toán đếm cửa sổ trượt)

**Sliding window counter algorithm** có thể coi là phiên bản nâng cấp của fixed window counter algorithm, granularity của rate limiting nhỏ hơn.

Tối ưu của sliding window counter algorithm so với fixed window counter algorithm là: **Nó chia thời gian thành các slice theo tỷ lệ nhất định**.

Ví dụ interface của chúng ta giới hạn 60 request mỗi phút, chúng ta có thể chia 1 phút thành 60 window. Mỗi giây di chuyển một lần, mỗi window chỉ có thể xử lý không quá `60(số request)/60(số window)` request. Nếu tổng số request của window hiện tại vượt quá số lượng giới hạn thì không xử lý request khác nữa.

Rõ ràng, **càng chia nhiều ô trong sliding window, sliding window cuộn càng mượt, thống kê rate limiting càng chính xác.**

![Sliding Window Counter Algorithm](https://static001.infoq.cn/resource/image/ae/15/ae4d3cd14efb8dc7046d691c90264715.png)

Ưu điểm:

- So với fixed window algorithm, sliding window counter algorithm có thể đối phó với traffic đột ngột tăng vọt.
- So với fixed window algorithm, sliding window counter algorithm có granularity nhỏ hơn, có thể cung cấp kiểm soát rate limiting chính xác hơn.

Nhược điểm:

- Tương tự như fixed window counter algorithm, sliding window counter algorithm vẫn tồn tại vấn đề rate limiting không đủ mượt.
- So với fixed window counter algorithm, sliding window counter algorithm phức tạp hơn để triển khai và hiểu.

### Leaky Bucket Algorithm (Thuật toán xô rò)

Chúng ta có thể ví hành động gửi request như đổ nước vào xô, quá trình xử lý request của chúng ta có thể ví như nước rò ra từ xô rò. Chúng ta đổ nước vào xô với bất kỳ tốc độ nào, và nước chảy ra với tốc độ nhất định. Khi nước vượt quá dung lượng xô thì bị bỏ đi, vì dung lượng xô không thay đổi, đảm bảo tốc độ tổng thể.

Nếu muốn triển khai thuật toán này cũng rất đơn giản, chuẩn bị một queue để lưu request, rồi định kỳ lấy request từ queue để thực thi (ý tưởng giống như message queue peak shaving/rate limiting).

![Leaky Bucket Algorithm](https://static001.infoq.cn/resource/image/75/03/75938d1010138ce66e38c6ed0392f103.png)

Ưu điểm:

- Triển khai đơn giản, dễ hiểu.
- Có thể kiểm soát tốc độ rate limiting, tránh network congestion và system overload.

Nhược điểm:

- Không thể đối phó với traffic đột ngột tăng vọt, vì chỉ có thể xử lý request với tốc độ cố định, sử dụng system resource không hiệu quả.
- Nếu tốc độ đổ nước vào xô (gửi request) luôn lớn hơn tốc độ nước chảy ra (xử lý request), thì xô sẽ luôn đầy, một phần request mới sẽ bị bỏ đi, dẫn đến chất lượng service giảm.

Trong tình huống nghiệp vụ thực tế, về cơ bản không dùng leaky bucket algorithm.

### Token Bucket Algorithm (Thuật toán xô token)

Token bucket algorithm cũng khá đơn giản. Giống như leaky bucket algorithm, nhân vật chính vẫn là cái xô (thuật toán rate limiting này cứ xoay quanh cái xô!). Nhưng bây giờ trong xô chứa token, request cần lấy một token trước khi được xử lý, sau khi xử lý xong thì bỏ token đó đi. Chúng ta thêm token vào xô với tốc độ nhất định theo kích thước rate limit. Nếu xô đầy thì không thể tiếp tục thêm token nữa.

![Token Bucket Algorithm](https://static001.infoq.cn/resource/image/ec/93/eca0e5eaa35dac938c673fecf2ec9a93.png)

Ưu điểm:

- Có thể giới hạn tốc độ trung bình và đối phó với traffic đột ngột tăng vọt.
- Có thể điều chỉnh dynamic tốc độ tạo token.

Nhược điểm:

- Nếu tốc độ tạo token và dung lượng xô đặt không hợp lý, có thể xảy ra vấn đề như lượng lớn request bị bỏ đi, system overload.
- So với các thuật toán rate limiting khác, phức tạp hơn để triển khai và hiểu.

## Rate limiting dựa trên đối tượng gì?

Trong project thực tế, cũng cần xác định rate limiting object — tức là rate limiting dựa trên đối tượng gì. Các rate limiting object phổ biến:

- **IP**: Rate limiting dựa trên IP, phạm vi áp dụng rộng, đơn giản và trực tiếp.
- **Business ID**: Chọn business ID duy nhất để rate limiting có mục tiêu hơn. Ví dụ rate limiting dựa trên user ID.
- **Personalized**: Áp dụng các chiến lược rate limiting khác nhau dựa trên thuộc tính hoặc hành vi của user. Ví dụ VIP user không bị giới hạn còn user thông thường bị giới hạn. Điều chỉnh dynamic chiến lược rate limiting dựa trên các chỉ số vận hành của hệ thống (như QPS, số concurrent call, system load v.v.). Ví dụ khi system load cao, kiểm soát giảm số request thông qua mỗi giây.

Rate limiting dựa trên IP là một phương án khá phổ biến hiện nay. Tuy nhiên, trong ứng dụng thực tế cần chú ý lấy đúng IP thực của user. Phương pháp phổ biến để lấy IP thực là X-Forwarded-For và TCP Options field mang thông tin source IP thực. Mặc dù trường X-Forwarded-For có thể bị giả mạo, nhưng vì triển khai đơn giản và tiện lợi, nhiều project vẫn dùng trực tiếp phương pháp này.

Ngoài các rate limiting object tôi giới thiệu ở trên, còn có một số chiến lược rate limiting object phức tạp hơn. Ví dụ Sentinel của Alibaba còn hỗ trợ [rate limiting dựa trên call relationship](https://github.com/alibaba/Sentinel/wiki/流量控制#基于调用关系的流量控制) (bao gồm rate limiting dựa trên caller, rate limiting dựa trên call chain entry, associated traffic rate limiting v.v.) và [hot parameter rate limiting](https://github.com/alibaba/Sentinel/wiki/热点参数限流) ở granularity chi tiết hơn (real-time thống kê hot parameter và kiểm soát traffic đối với resource call của hot parameter).

Ngoài ra, một project có thể chọn sử dụng kết hợp nhiều rate limiting object khác nhau tùy theo nhu cầu nghiệp vụ cụ thể.

## Single-instance Rate Limiting thực hiện thế nào?

Single-instance rate limiting nhắm vào ứng dụng monolithic architecture.

Single-instance rate limiting có thể dùng trực tiếp utility class rate limiting `RateLimiter` đi kèm trong Google Guava. `RateLimiter` dựa trên token bucket algorithm, có thể đối phó với burst traffic.

> Guava: <https://github.com/google/guava>

Ngoài triển khai token bucket algorithm cơ bản nhất (smooth burst rate limiting), Guava's `RateLimiter` còn cung cấp triển khai algorithm **smooth warmup rate limiting**.

Smooth burst rate limiting là đặt token vào xô theo tốc độ chỉ định, còn smooth warmup rate limiting sẽ có một khoảng thời gian warmup, trong thời gian warmup, tốc độ sẽ dần tăng lên đến tốc độ đã cấu hình.

Dưới đây chúng ta tìm hiểu chi tiết qua hai ví dụ đơn giản!

Chúng ta chỉ cần import dependency liên quan đến Guava trong project là có thể dùng.

```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>31.0.1-jre</version>
</dependency>
```

Dưới đây là một Demo đơn giản về Guava smooth burst rate limiting.

```java
import com.google.common.util.concurrent.RateLimiter;

/**
 * @author Guide
 * @date 2021/10/08 19:12
 **/
public class RateLimiterDemo {

    public static void main(String[] args) {
        // 1s đặt 5 token vào xô tức là 0.2s đặt 1 token vào xô
        RateLimiter rateLimiter = RateLimiter.create(5);
        for (int i = 0; i < 10; i++) {
            double sleepingTime = rateLimiter.acquire(1);
            System.out.printf("get 1 tokens: %ss%n", sleepingTime);
        }
    }
}

```

Output:

```bash
get 1 tokens: 0.0s
get 1 tokens: 0.188413s
get 1 tokens: 0.197811s
get 1 tokens: 0.198316s
get 1 tokens: 0.19864s
get 1 tokens: 0.199363s
get 1 tokens: 0.193997s
get 1 tokens: 0.199623s
get 1 tokens: 0.199357s
get 1 tokens: 0.195676s
```

Dưới đây là một Demo đơn giản về Guava smooth warmup rate limiting.

```java
import com.google.common.util.concurrent.RateLimiter;
import java.util.concurrent.TimeUnit;

/**
 * @author Guide
 * @date 2021/10/08 19:12
 **/
public class RateLimiterDemo {

    public static void main(String[] args) {
        // 1s đặt 5 token vào xô tức là 0.2s đặt 1 token vào xô
        // Thời gian warmup là 3s, tức là trong 3s đầu tốc độ phát token sẽ tăng dần đến 0.2s đặt 1 token vào xô
        RateLimiter rateLimiter = RateLimiter.create(5, 3, TimeUnit.SECONDS);
        for (int i = 0; i < 20; i++) {
            double sleepingTime = rateLimiter.acquire(1);
            System.out.printf("get 1 tokens: %sds%n", sleepingTime);
        }
    }
}
```

Output:

```bash
get 1 tokens: 0.0s
get 1 tokens: 0.561919s
get 1 tokens: 0.516931s
get 1 tokens: 0.463798s
get 1 tokens: 0.41286s
get 1 tokens: 0.356172s
get 1 tokens: 0.300489s
get 1 tokens: 0.252545s
get 1 tokens: 0.203996s
get 1 tokens: 0.198359s
```

Ngoài ra, **Bucket4j** là một thư viện rate limiting rất tốt dựa trên token/leaky bucket algorithm.

> Bucket4j: <https://github.com/vladimir-bukhtoyarov/bucket4j>

So với Guava's rate limiting utility class, Bucket4j cung cấp chức năng rate limiting đầy đủ hơn. Không chỉ hỗ trợ single-instance rate limiting và distributed rate limiting, còn có thể tích hợp monitoring, kết hợp với Prometheus và Grafana.

Tuy nhiên, Guava cũng chỉ là một thư viện utility class chức năng đầy đủ, chức năng rate limiting out-of-the-box của nó vẫn khá thực dụng trong nhiều single-instance scenario.

Phiên bản ban đầu của single-instance rate limiting tích hợp sẵn trong Spring Cloud Gateway được triển khai dựa trên Bucket4j. Sau đó thay bằng **Resilience4j**.

Resilience4j là lightweight fault tolerance component, lấy cảm hứng từ Hystrix. Sau khi [Netflix tuyên bố không còn phát triển tích cực Hystrix](https://github.com/Netflix/Hystrix/commit/a7df971cbaddd8c5e976b3cc5f14013fe6ad00e6), cả Spring official và Netflix đều khuyến nghị dùng Resilience4j để làm rate limiting và circuit breaking.

> Resilience4j: <https://github.com/resilience4j/resilience4j>

Thông thường, để đảm bảo high availability của hệ thống, rate limiting và circuit breaking của project đều phải được làm cùng nhau.

Resilience4j không chỉ cung cấp rate limiting, còn cung cấp circuit breaking, load protection, auto retry và các chức năng out-of-the-box khác để đảm bảo high availability của hệ thống. Ngoài ra, ecosystem của Resilience4j cũng tốt hơn, nhiều gateway sử dụng Resilience4j để làm rate limiting và circuit breaking.

Vì vậy, trong phần lớn scenario, Resilience4j có thể là lựa chọn tốt hơn. Nếu là một số scenario rate limiting đơn giản, Guava hoặc Bucket4j cũng là lựa chọn tốt.

## Distributed Rate Limiting thực hiện thế nào?

Distributed rate limiting nhắm vào ứng dụng distributed/microservices architecture. Trong architecture này, single-instance rate limiting không còn phù hợp, vì sẽ có nhiều loại service, và một loại service cũng có thể được deploy nhiều lần.

Các phương án distributed rate limiting phổ biến:

- **Rate limiting qua middleware**: Có thể dùng Sentinel hoặc Redis để tự triển khai logic rate limiting tương ứng.
- **Gateway layer rate limiting**: Phương án khá phổ biến, trực tiếp cài rate limiting ở gateway layer. Tuy nhiên, gateway layer rate limiting thường cũng cần tích hợp middleware/framework. Ví dụ distributed rate limiting implementation `RedisRateLimiter` của Spring Cloud Gateway được triển khai dựa trên Redis+Lua, và Spring Cloud Gateway còn có thể tích hợp Sentinel để làm rate limiting.

Nếu bạn muốn thủ công triển khai logic rate limiting dựa trên Redis, khuyến nghị kết hợp với Lua script.

**Tại sao khuyến nghị cách Redis+Lua?** Chủ yếu có hai lý do:

- **Giảm network overhead**: Chúng ta có thể dùng Lua script để thực thi hàng loạt lệnh Redis, những lệnh Redis này sẽ được submit lên Redis server để thực thi một lần, giảm đáng kể network overhead.
- **Atomicity**: Một đoạn Lua script có thể được coi là một lệnh thực thi, trong quá trình thực thi một đoạn Lua script sẽ không có script hoặc lệnh Redis nào khác thực thi đồng thời, đảm bảo operation không bị chèn hoặc bị làm phiền bởi instruction khác.

Ở đây tôi không đặt code script rate limiting cụ thể, trên mạng cũng có nhiều Lua script rate limiting tốt có sẵn để tham khảo. Ví dụ plugin RateLimiter rate limiting của Apache gateway project ShenYu đã triển khai token bucket algorithm/concurrent token bucket algorithm, leaky bucket algorithm, sliding window algorithm dựa trên Redis+Lua.

> ShenYu: <https://github.com/apache/incubator-shenyu>

![ShenYu rate limiting script](https://oss.javaguide.cn/github/javaguide/high-availability/limit-request/shenyu-ratelimit-lua-scripts.png)

Ngoài ra, nếu không muốn tự viết Lua script, cũng có thể dùng trực tiếp `RRateLimiter` trong Redisson để triển khai distributed rate limiting, triển khai tầng dưới của nó dựa trên Lua code + token bucket algorithm.

Redisson là open source Java language Redis client, cung cấp nhiều chức năng out-of-the-box, như triển khai data structure phổ biến trong Java, distributed lock, delay queue v.v. Ngoài ra, Redisson còn hỗ trợ nhiều deployment architecture như Redis standalone, Redis Sentinel, Redis Cluster.

Cách dùng `RRateLimiter` rất đơn giản. Đầu tiên cần lấy một đối tượng `RRateLimiter`, lấy trực tiếp qua Redisson client là được. Sau đó đặt rate limiting rule.

```java
// Tạo một Redisson client instance
RedissonClient redissonClient = Redisson.create();
// Lấy rate limiter object tên "javaguide.limiter"
RRateLimiter rateLimiter = redissonClient.getRateLimiter("javaguide.limiter");
// Thử đặt tốc độ rate limiter là 100 lần mỗi giờ
// RateType có hai loại: OVERALL là global rate limiting, PER_CLIENT là single client rate limiting (có thể coi là single-instance rate limiting)
rateLimiter.trySetRate(RateType.OVERALL, 100, 1, RateIntervalUnit.HOURS);
```

Tiếp theo gọi phương thức `acquire()` hoặc `tryAcquire()` để lấy permit.

```java
// Lấy một permit, nếu vượt quá tốc độ rate limiter thì sẽ đợi
// acquire() là phương thức đồng bộ, phương thức bất đồng bộ tương ứng: acquireAsync()
rateLimiter.acquire(1);
// Thử lấy một permit trong 5 giây, nếu thành công trả về true, ngược lại false
// tryAcquire() là phương thức đồng bộ, phương thức bất đồng bộ tương ứng: tryAcquireAsync()
boolean res = rateLimiter.tryAcquire(1, 5, TimeUnit.SECONDS);
```

## Tổng kết

Bài viết này chủ yếu giới thiệu các thuật toán rate limiting phổ biến, cách chọn rate limiting object, và cách triển khai single-instance rate limiting cũng như distributed rate limiting.

## Tài liệu tham khảo

- Service governance - lightweight circuit breaking framework Resilience4j: <https://xie.infoq.cn/article/14786e571c1a4143ad1ef8f19>
- Super detailed Guava RateLimiter rate limiting principle analysis: <https://cloud.tencent.com/developer/article/1408819>
- Spring Cloud Gateway rate limiting in action 👍: <https://www.aneasystone.com/archives/2020/08/spring-cloud-gateway-current-limiting.html>
- Detailed explanation of Redisson distributed rate limiting implementation: <https://juejin.cn/post/7199882882138898489>
- One article explaining Java rate limiting interface implementation - Alibaba Cloud Developer: <https://mp.weixin.qq.com/s/A5VYjstIDeVvizNK2HkrTQ>
- Exploration and practice of distributed rate limiting - Tencent Cloud Developer: <https://mp.weixin.qq.com/s/MJbEQROGlThrHSwCjYB_4Q>

<!-- @include: @article-footer.snippet.md -->
