---
title: Giải thích chi tiết Degradation & Circuit Breaking
description: Giải thích chi tiết service degradation và circuit breaking mechanism, trình bày degradation strategy, nguyên lý circuit breaker và thực hành áp dụng các framework như Hystrix, Sentinel, Resilience4j, bao gồm cascading failure, circuit breaker state machine, isolation strategy và system adaptive protection.
category: High Availability
icon: circuit
head:
  - - meta
    - name: keywords
      content: service degradation,circuit breaker,circuit breaking mechanism,Sentinel,Hystrix,Resilience4j,cascading failure,circuit breaker state machine,Fallback,rate limiting degradation circuit breaking,microservice high availability,system adaptive protection,thread pool isolation,semaphore isolation
---

## Degradation là gì?

Service Degradation (Giảm chức năng dịch vụ) là chiến lược xử lý sự cố từ góc độ ưu tiên chức năng hệ thống: Khi load (như CPU usage > 80%, thread pool saturated, P99 response time > 1s) gần đạt ngưỡng, có chiến lược giảm chất lượng non-core service để giải phóng tài nguyên đảm bảo availability của core path.

### Đặc điểm của Degradation

| Chiều                     | Mô tả                                   | Ví dụ                                                                          |
| ------------------------- | --------------------------------------- | ------------------------------------------------------------------------------ |
| **Nguyên nhân kích hoạt** | Tổng tải vượt ngưỡng                    | CPU usage > 80%, P99 RT > 1s, P999 RT > 3s, queue backlog depth > 80% capacity |
| **Mục đích**              | Bảo vệ core, bỏ non-core                | Tắt recommendation, giữ đặt hàng                                               |
| **Granularity**           | Ba cấp service/page/interface/feature   | Tắt module gợi ý sản phẩm                                                      |
| **Controllability**       | Dynamic switch qua configuration center | Nacos 2.0+ gRPC long connection (millisecond push)                             |
| **Priority**              | Level 1-10, từ peripheral đến core      | L10: đặt hàng > L5: bình luận > L1: gợi ý                                      |

### Có những phương thức Degradation nào?

| Phương thức                   | Mô tả                                                                        | Tình huống áp dụng                     | Failure path & Rủi ro                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Delayed service**           | Async hóa non-real-time operation, ghi vào MQ/cache                          | Comment scoring, data stats            | MQ backlog cần back pressure (như Jitter retry để tránh storm)                                         |
| **Page fragment degradation** | Trực tiếp tắt non-core feature block                                         | Recommendation area, ad space          | Không                                                                                                  |
| **Async request degradation** | In-page async load interface trả về fallback data                            | Delivery estimate, price prediction    | Fallback data cần pre-warm cache                                                                       |
| **Page redirect degradation** | Dẫn traffic sang static/simple page                                          | Static activity page, maintenance page | Cần preset static page version                                                                         |
| **Write degradation**         | Ưu tiên ghi vào Redis/local WAL, sync DB qua reliable MQ hoặc scheduled task | Flash sale inventory deduction         | Cần đảm bảo eventual consistency (reconciliation/compensation); in-memory queue mất data khi node down |
| **Read degradation**          | Chỉ đọc cache, shield backend call                                           | Product detail read-heavy write-light  | Khi cache miss cần trả về degradation page                                                             |

### Phương án triển khai Degradation switch

| Phương án                                      | Real-time              | Consistency                                     | Complexity | Tình huống áp dụng                      |
| ---------------------------------------------- | ---------------------- | ----------------------------------------------- | ---------- | --------------------------------------- |
| **Config file + Restart**                      | Thấp                   | Mạnh                                            | Thấp       | Non-urgent, thay đổi không thường xuyên |
| **Database switch table**                      | Trung bình             | Trung bình                                      | Trung bình | Tình huống cần audit log                |
| **Configuration center (Nacos 2.0+ / Apollo)** | Cao (millisecond push) | Eventual consistent (gRPC bidirectional stream) | Cao        | Khuyến nghị cho production              |
| **Redis/Diamond**                              | Cao                    | Eventual consistent                             | Trung bình | Lightweight solution                    |

> Lưu ý: Nacos 2.0+ dựa trên **gRPC Persistent Connection** và **Bidirectional Streaming** để triển khai server-side proactive push — push effective time đạt millisecond. So với HTTP long polling (Polling) của 1.x, gRPC mode tránh được redundant TPS, dùng NIO mechanism tăng throughput. Hiệu năng tổng thể cải thiện ~**10 lần**, memory footprint giảm **50%**, single machine có thể hỗ trợ **100k+** instance connection.
>
> **Consistency mechanism**: Nacos 2.0+ không dùng ACK mechanism nghiêm ngặt mà dựa vào **HTTP/2 PING frame** (Keepalive) để phát hiện connection health và nhanh chóng nhận biết ngắt kết nối, đảm bảo push đáng tin cậy. Khi mất kết nối, client tự động reconnect và sync data để đạt eventual consistency.
>
> **Network partition scenario**: Nacos Registry module (Naming) thiên về AP, nhưng **Configuration Center (Config) module dùng Raft protocol đảm bảo strong consistency (CP)**. Degradation switch thuộc phạm vi configuration center. Khi network partition, Nacos nodes thuộc minority sẽ từ chối write và có thể gây client config drift. Lúc này client cần dựa vào local cache file (Failover config) làm last resort và chấp nhận rủi ro degradation rule không thể push real-time.
>
> **Upgrade compatibility**: Nacos 2.0 server tương thích Nacos 1.x client (qua HTTP protocol), nhưng 2.0 client không tương thích 1.x server (gRPC protocol).
>
> **Client thread management**: gRPC executor core thread count được cấu hình dựa trên số CPU core (như 200 core, 800 max), cần chú ý tránh resource exhaustion.

### Phân loại Service Degradation

Degradation theo mức độ tự động hóa chia thành:

- **Auto switch degradation** (timeout, failure count, fault, rate limiting)
- **Manual switch degradation** (flash sale, e-commerce promotion, v.v.)

Phân loại auto degradation:

| Loại                       | Trigger threshold                                 | Fallback solution                  | Failure path requirement                            |
| -------------------------- | ------------------------------------------------- | ---------------------------------- | --------------------------------------------------- |
| **Timeout degradation**    | RT > threshold (như P99 > 500ms) và kéo dài N lần | Default value                      | Cần idempotency protection, tránh retry storm       |
| **Failure degradation**    | Exception rate > threshold (như 50%)              | Fallback data                      | Fallback data cần pre-warm cache                    |
| **Fault degradation**      | HTTP 5xx/RPC exception/DNS resolution fail        | Cached data                        | Trả về default khi cache miss                       |
| **Rate limit degradation** | QPS > threshold                                   | Queue page/out of stock/error page | Queue page cần prevent re-entry (idempotency token) |

> Retry storm: Khi service phục hồi nhưng lượng lớn client retry cùng lúc có thể gây service crash lần nữa. Defense measures gồm: Jitter retry (random backoff), token bucket rate limiting, group batch recovery.

## Large-scale Distributed System nên Degrade như thế nào?

Trong large-scale distributed system thường có hàng trăm nghìn service. Trước các big event thường batch degrade dựa trên mức độ quan trọng và quan hệ giữa các nghiệp vụ.

### Khả năng của Degradation Platform

Các công ty internet lớn thường có unified degradation platform với các core capability:

| Capability                  | Mô tả                                    | Implementation key points                                                  |
| --------------------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| **Hierarchical management** | Service priority level 1-10              | Core business review, dependency relationship analysis                     |
| **Batch degradation**       | Batch execution by level/group           | Degradation sequence orchestration, atomicity guarantee (two-phase commit) |
| **Dynamic switch**          | Real-time push via configuration center  | Nacos 2.0+ gRPC hoặc WebSocket                                             |
| **Effect validation**       | Gray validation + monitoring observation | A/B test, metric comparison                                                |
| **One-click rollback**      | Version management + quick rollback      | Config versioning, change audit                                            |

### Lập kế hoạch Degradation

1. **Business classification**: Phân tích độ cốt lõi của service, định nghĩa priority L1-L10.
2. **Dependency analysis**: Vẽ service call chain, xác định critical path và single point dependency.
3. **Degradation strategy**: Thiết kế degradation plan cho mỗi non-core service (bao gồm failure path).
4. **Drill validation**: Định kỳ thực hiện degradation drill, đảm bảo plan có hiệu lực (bao gồm network partition scenario).

> Network partition scenario: Theo định lý PACELC, khi partition cần cân nhắc giữa availability (A) và consistency (C). Degradation plan nên chỉ rõ hành vi trong thời gian partition (như tiếp tục serve local cache, tạm dừng cross-zone call).
>
> **Chi tiết**: [CAP & BASE Theory Explained](https://javaguide.cn/distributed-system/protocol/cap-and-base-theorem.html).

## Circuit Breaking là gì?

Circuit Breaker Pattern là link protection mechanism để đối phó với microservice cascading failure — tương tự fuse trong mạch điện.

### Cascading Failure

Normal call chain: Service A ──> Service B ──> Service C

Cascading failure scenario:

- Service C response chậm/unavailable.
- Calls đến Service C xếp hàng (thread pool exhausted).
- Call thread của Service B bị block.
- Service A cũng bị kéo sập — cascading failure lan ra toàn hệ thống.

### Circuit Breaker State Machine

Circuit breaker có ba trạng thái:

| State        | Mô tả                                        | Hành vi                                              | Điều kiện chuyển trạng thái                                                                       |
| ------------ | -------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Closed**   | Trạng thái bình thường, cho phép request qua | Ghi nhận failure rate/slow call ratio                | Failure rate/slow call ratio > threshold → Open                                                   |
| **Open**     | Circuit breaking triggered, từ chối request  | Nhanh chóng trả Fallback, không gọi downstream       | Sau sleep window (như 10s) → HalfOpen                                                             |
| **HalfOpen** | Probe xem service có phục hồi không          | Release số lượng probe request được cấu hình (như 3) | Tất cả probe thành công (hoặc thỏa success rate threshold) → Closed; Bất kỳ probe nào fail → Open |

> Half-Open risk & Warm Up pre-warming: Probe request có thể trigger retry storm hay secondary cascading failure. Khuyến nghị giới hạn số probe request (như Sentinel default là 3) và yêu cầu tất cả probe thành công (hoặc thỏa configured success rate threshold) mới chuyển thành Closed. Nếu release condition quá lỏng (như một lần thành công là Closed), đối với cold node vừa được khởi động lại từ crash, concurrent traffic đổ vào ngay lập tức sẽ lấp đầy thread pool, gây secondary breach (cold start killer).
>
> **Warm Up pre-warming mechanism**: Cần kết hợp với pre-warming rate limiting dựa trên token bucket/leaky bucket algorithm. Trong pre-warming period (như 10s) theo cooling factor (default 3), smooth ramp up allowed QPS threshold từ `maxQps / 3` lên maximum capacity, tránh cold node bị secondary breach do CPU Cache Miss và database connection pool chưa initialized. Monitor **P99 latency** và **database connection pool active connection count** trong cold start period để validate pre-warming effect.

### Circuit Breaking Strategy

Sentinel 1.8.2+ hỗ trợ ba circuit breaking strategy:

| Strategy            | Trigger condition                              | Typical threshold config        | Version requirement |
| ------------------- | ---------------------------------------------- | ------------------------------- | ------------------- |
| **Slow call ratio** | P99 RT > max slow call RT và ratio > threshold | RT > 500ms, ratio > 50%         | 1.8.0+              |
| **Exception ratio** | Exception ratio > threshold                    | Exception rate > 50%            | All versions        |
| **Exception count** | Exception count > threshold                    | Exceptions > 50 within 1 minute | All versions        |

> P99 vs Average RT: Dùng average RT có thể che giấu long-tail latency. Production khuyến nghị monitor P99/P999 để tránh tình huống "hầu hết request nhanh nhưng một số request cực chậm".

## Degradation và Circuit Breaking khác nhau như thế nào?

| Chiều              | Degradation                      | Circuit Breaking                          |
| ------------------ | -------------------------------- | ----------------------------------------- |
| **Core focus**     | Resource priority allocation     | Call chain protection                     |
| **Trigger mode**   | Proactive (system/manual)        | Passive (triggered by dependency anomaly) |
| **Scope**          | Current service hoặc downstream  | Upstream của call chain                   |
| **Recovery mode**  | Manual close hoặc auto detection | Automatic (Half-Open probe)               |
| **Return content** | Fallback value/cache/static page | Fallback method                           |

**Quan hệ ba cơ chế**:

- Rate limiting: Bảo vệ bản thân không bị đánh sập (giới hạn traffic vào)
- Degradation: Bản thân chủ động hy sinh non-core feature (giảm chất lượng service)
- Circuit breaking: Ngăn bị downstream kéo sập (cắt dependency bất thường)

> Ví dụ so sánh: Rate limiting là "giới hạn khách vào siêu thị", degradation là "siêu thị đóng cửa một số tầng", circuit breaking là "sau khi phát hiện nhà cung cấp có vấn đề thì dừng hợp tác".

## Có những giải pháp hiện có nào?

Các circuit breaking degradation component phổ biến trong Spring Cloud ecosystem:

- **Hystrix 1.5.18** (ngừng bảo trì năm 2018)
- **Sentinel 1.8.2+** (Alibaba open source, khuyến nghị)
- **Resilience4j 1.7.1+** (lightweight)
- **Spring Retry** (retry component)

### So sánh Hystrix vs Sentinel vs Resilience4j

| Chiều                          | Sentinel 1.8.2+                                 | Hystrix 1.5.18                    | Resilience4j 1.7.1+                         |
| ------------------------------ | ----------------------------------------------- | --------------------------------- | ------------------------------------------- |
| **Maintenance status**         | ✅ Active maintenance                           | ❌ Discontinued 2018              | ✅ Active maintenance                       |
| **Isolation strategy**         | Concurrent thread count (semaphore)             | Thread pool (default) / semaphore | SemaphoreBulkhead / FixedThreadPoolBulkhead |
| **Circuit breaking strategy**  | Slow call ratio/exception ratio/exception count | Exception ratio                   | Exception ratio/exception count             |
| **Real-time metrics**          | Sliding window                                  | Sliding window (RxJava)           | Ring buffer                                 |
| **Rate limiting**              | QPS/concurrent thread/call relationship         | Limited support                   | RateLimiter                                 |
| **Traffic shaping**            | Slow start/steady queue                         | ❌                                | ❌                                          |
| **System adaptive protection** | ✅ Load/RT/thread count/QPS                     | ❌                                | ❌                                          |
| **Dashboard**                  | ✅ Out-of-the-box                               | ⚠️ Basic                          | ⚠️ Need to build                            |
| **Framework adaptation**       | Servlet/Spring Cloud/Dubbo/gRPC                 | Spring Cloud Netflix              | Reactor/Vert.x                              |

### So sánh Isolation Strategy

| Strategy                  | Sentinel                         | Hystrix        | Resilience4j               | Trade-offs                                                                                                                                                                                      |
| ------------------------- | -------------------------------- | -------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Thread pool isolation** | -                                | ✅ Default     | ✅ FixedThreadPoolBulkhead | Ưu điểm: Timeout control độc lập, resource isolation triệt để, hỗ trợ async. Nhược điểm: OS-level context switching overhead (P99 degradation), thread pool size khó xác định, tăng GC pressure |
| **Semaphore isolation**   | ✅ Lightweight, no thread switch | ✅ Lightweight | ✅ SemaphoreBulkhead       | Ưu điểm: Không có extra thread overhead, memory footprint nhỏ. Nhược điểm: Không thể timeout control (phụ thuộc business layer), không hỗ trợ async                                             |

> **GC và Scheduling pressure**: Thread pool isolation tạo ra nhiều independent thread. Trong high concurrency, bottleneck thực sự là CPU thực hiện **OS-level scheduling wake-up và suspend** giữa vô số thread. **Context switching** thường xuyên tiêu tốn vô ích nhiều CPU Us/Sy time và trực tiếp gây **P99 tail latency của business request tăng vọt**. Lock contention chỉ là bề ngoài của concurrency contention; context switching overhead mới là kẻ thực sự nguy hiểm. `FixedThreadPoolBulkhead` của Resilience4j dựa trên `ArrayBlockingQueue`, cũng có lock contention trong extreme high concurrency, nhưng thường ít nghiêm trọng hơn context switching overhead.

### System Adaptive Protection (Tính năng độc quyền của Sentinel)

Sentinel 1.8+ cung cấp **System Adaptive Protection** (System Rule). Core là giới thiệu dynamic capacity evaluation logic tương tự **TCP BBR**:

**Implicit core condition**: `Current concurrent thread count > (Max system QPS × Min RT)`

| Metric                      | Mô tả                                            | Typical threshold              | Version requirement |
| --------------------------- | ------------------------------------------------ | ------------------------------ | ------------------- |
| **Load (System load)**      | Linux `load1` value                              | > CPU core count × 2           | All versions        |
| **Average RT**              | Average response time của tất cả ingress traffic | > 500ms (khuyến nghị dùng P99) | 1.8.0+ hỗ trợ P99   |
| **Concurrent thread count** | Current concurrent thread count                  | > 500                          | All versions        |
| **Ingress QPS**             | QPS của ingress traffic                          | > 1000                         | All versions        |

Sau khi trigger, system sẽ tự động từ chối một phần request để tránh system crash. So với static threshold, BBR-style dynamic capacity evaluation có thể ngăn system crash do static threshold lag.

### Gợi ý lựa chọn và Migration Trade-offs

| Scenario                           | Recommended solution                        | Migration trade-offs                                          |
| ---------------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| New project (Spring Cloud Alibaba) | **Sentinel 1.8.2+**                         | Không có migration cost                                       |
| New project (reactive/lightweight) | **Resilience4j 1.7.1+**                     | Cần tự xây dashboard                                          |
| Existing project (Hystrix)         | Tiếp tục dùng Hystrix, lên kế hoạch migrate | Migration cost: API change + dashboard setup + rule migration |
| Cần system adaptive protection     | **Sentinel** (độc quyền)                    | Không có alternative                                          |

## Đọc thêm

- [Circuit Breaker Pattern - Martin Fowler](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Tài liệu chính thức Sentinel](https://sentinelguard.io/zh-cn/docs/introduction.html)
- [Release It! - Michael Nygard (Production-grade degradation và circuit breaking practice)](https://www.pragprog.com/titles/mnee2/release-it-second-edition/)
- [PACELC: A Simple Perspective on Latency and Consistency](https://www.cs.berkeley.edu/~brewer/cs262/PACELC.pdf)

## Tài liệu tham khảo

- [So sánh Sentinel và Hystrix](https://github.com/alibaba/Sentinel/wiki/Sentinel-%E4%B8%8E-Hystrix-%E7%9A%84%E5%AF%B9%E6%AF%94)
- [Tài liệu chính thức Spring Cloud Alibaba](https://spring-cloud-alibaba-group.github.io/github-pages/2022/zh-cn/index.html)
- [Service degradation và circuit breaking trong high concurrency](https://suprisemf.github.io/2018/08/03/%E9%AB%98%E5%B9%B6%E5%8F%91%E4%B9%8B%E6%9C%8D%E5%8A%A1%E9%99%8D%E7%BA%A7%E4%B8%8E%E7%86%94%E6%96%AD/)
