---
title: Tổng hợp câu hỏi phỏng vấn Spring Cloud Gateway
category: Distributed
description: Giải thích chi tiết các nguyên lý cốt lõi của Spring Cloud Gateway, bao gồm cấu hình route, Predicate assertion, cơ chế Filter, rate limiting và circuit breaking, workflow, v.v. — các câu hỏi phỏng vấn phổ biến và điểm thực hành.
tag:
  - API Gateway
  - Spring Cloud
head:
  - - meta
    - name: keywords
      content: Spring Cloud Gateway,gateway,Gateway,route configuration,Filter,rate limiting circuit breaking,Predicate,gateway interview questions
---

> Bài này được tái cấu trúc và hoàn thiện từ bài [6000 chữ | 16 hình | Hiểu sâu nguyên lý Spring Cloud Gateway - Wukong Chat Architecture](https://mp.weixin.qq.com/s/XjFYsP1IUqNzWqXZdJn-Aw).

## Spring Cloud Gateway là gì?

Spring Cloud Gateway thuộc gateway trong hệ sinh thái Spring Cloud. Mục tiêu ra đời chủ yếu là để thay thế **Zuul 1.x**. Zuul 1.x dựa trên Servlet blocking I/O architecture nên hiệu năng hạn chế trong tình huống high concurrency. Còn Zuul 2.x dù dùng Netty non-blocking architecture nhưng Spring Cloud chính thức không tích hợp Zuul 2.x. Spring Cloud Gateway ra đời còn sớm hơn cả Zuul 2.x.

Để nâng cao hiệu năng gateway, Spring Cloud Gateway dựa trên Spring WebFlux. Spring WebFlux dùng thư viện Reactor để triển khai reactive programming model, tầng dưới dựa trên Netty để triển khai synchronous non-blocking I/O.

![](/images/github/javaguide/system-design/distributed-system/api-gateway/springcloud-gateway-%20demo.png)

Spring Cloud Gateway không chỉ cung cấp routing thống nhất mà còn cung cấp các chức năng cơ bản của gateway dựa trên Filter chain như: security, monitoring/metrics, rate limiting.

Sự khác biệt giữa Spring Cloud Gateway và Zuul 2.x không lớn — cũng xử lý request qua filter. Tuy nhiên, hiện nay khuyến nghị dùng Spring Cloud Gateway thay vì Zuul — Spring Cloud ecosystem hỗ trợ nó thân thiện hơn.

- GitHub: <https://github.com/spring-cloud/spring-cloud-gateway>
- Website: <https://spring.io/projects/spring-cloud-gateway>

## Workflow của Spring Cloud Gateway?

Workflow của Spring Cloud Gateway như hình dưới:

![Workflow của Spring Cloud Gateway](/images/github/javaguide/system-design/distributed-system/api-gateway/spring-cloud-gateway-workflow.png)

Đây là hình từ blog chính thức của Spring, link bài gốc: <https://spring.io/blog/2022/08/26/creating-a-custom-spring-cloud-gateway-filter>.

Phân tích flow cụ thể:

1. **Route matching**: Request của client đến gateway, trước tiên qua Gateway Handler Mapping xử lý — ở đây sẽ đánh giá Predicate (assertion), xem match với routing rule nào. Routing này map đến một service backend nào đó.
2. **Request filtering**: Sau đó request đến Gateway Web Handler — có rất nhiều filter ở đây tạo thành Filter Chain. Các filter này có thể intercept và modify request như thêm request header, parameter validation, v.v. — hơi giống lọc nước bẩn. Sau đó forward request đến service backend thực tế. Về logic có thể gọi là Pre-Filters — "Pre" có thể hiểu là "trước khi...".
3. **Service processing**: Service backend xử lý request.
4. **Response filtering**: Sau khi backend xử lý xong kết quả, trả về cho filter của Gateway để xử lý lại. Về logic có thể gọi là Post-Filters — "Post" có thể hiểu là "sau khi...".
5. **Response return**: Response sau khi qua filter xử lý, trả về cho client.

Tóm tắt: Request của client trước tiên tìm route phù hợp qua matching rule — map đến service cụ thể. Request sau khi qua filter xử lý được forward đến service cụ thể. Sau khi service xử lý xong, qua filter xử lý lại, cuối cùng trả về cho client.

## Predicate của Spring Cloud Gateway là gì?

Predicate (assertion) nghe có vẻ rất sâu xa — đây là thuật ngữ lập trình, trong cuộc sống hàng ngày chúng ta hầu như không dùng. Nói thẳng ra: nó chỉ là `if` điều kiện cho một expression — kết quả là true hoặc false. Nếu true thì làm việc này, ngược lại làm việc kia.

Trong Gateway, nếu request của client thỏa điều kiện assertion, sẽ map đến router được chỉ định và forward đến service được chỉ định để xử lý.

Ví dụ cấu hình assertion như dưới, đã cấu hình hai routing rule, có một cấu hình predicate. Khi URL request chứa `api/thirdparty` thì match route đầu tiên `route_thirdparty`.

![Ví dụ cấu hình Predicate](/images/github/javaguide/system-design/distributed-system/api-gateway/spring-cloud-gateway-predicate-example.png)

Các quy tắc routing assertion phổ biến như hình dưới:

![Quy tắc routing assertion của Spring Cloud Gateway](/images/github/javaguide/system-design/distributed-system/api-gateway/spring-cloud-gateway-predicate-rules.png)

## Mối quan hệ giữa Route và Predicate trong Spring Cloud Gateway?

Quan hệ tương ứng giữa Route và Predicate như sau:

![Quan hệ tương ứng giữa Route và Predicate](/images/github/javaguide/system-design/distributed-system/api-gateway/spring-cloud-gateway-predicate-route.png)

- **One-to-many**: Một routing rule có thể chứa nhiều assertion. Như hình trên Route1 cấu hình ba Predicate.
- **Đồng thời thỏa mãn**: Nếu một routing rule có nhiều assertion, cần thỏa tất cả cùng lúc mới match. Như hình trên Route2 cấu hình hai assertion — request của client phải thỏa cả hai assertion mới match Route2.
- **Match đầu tiên**: Nếu một request có thể match nhiều route, sẽ map đến route match thành công đầu tiên. Như hình trên, request của client thỏa assertion của Route3 và Route4, nhưng Route3 cấu hình trước trong config file nên chỉ match Route3.

## Spring Cloud Gateway triển khai dynamic routing như thế nào?

Khi dùng Spring Cloud Gateway, giải pháp tài liệu chính thức cung cấp luôn dựa trên cách cấu hình file hoặc code.

Spring Cloud Gateway là entry của microservice, cần tránh restart tối đa có thể. Nhưng hiện tại thay đổi cấu hình cần restart service — không đáp ứng được nhu cầu dynamic refresh và real-time change trong sản xuất thực tế. Vì vậy cần dynamic cấu hình gateway trong khi Spring Cloud Gateway đang chạy.

Có nhiều cách triển khai dynamic routing. Một cách khuyến nghị là dựa trên Nacos registry. Spring Cloud Gateway có thể lấy metadata của service từ registry (như service name, path, v.v.), sau đó tự động tạo routing rule dựa trên thông tin này. Như vậy khi thêm, xóa hoặc cập nhật service instance, gateway tự động nhận biết và điều chỉnh routing rule tương ứng mà không cần bảo trì thủ công cấu hình routing.

Thực ra các bước phức tạp này không cần tự triển khai thủ công. Qua Nacos Server và Spring Cloud Alibaba Nacos Config có thể triển khai dynamic change cấu hình. Link tài liệu chính thức: <https://github.com/alibaba/spring-cloud-alibaba/wiki/Nacos-config>.

## Spring Cloud Gateway có những loại filter nào?

Filter theo request và response chia thành hai loại:

- **Pre type**: Trước khi request được forward đến microservice, intercept và modify request như parameter validation, permission validation, traffic monitoring, log output và protocol conversion, v.v.
- **Post type**: Sau khi microservice xử lý xong request, trả về response cho gateway. Gateway có thể xử lý lại như modify response content hay response header, log output, traffic monitoring, v.v.

Một cách phân loại khác là dựa trên phạm vi tác dụng của Filter:

- **GatewayFilter**: Local filter, filter áp dụng trên single route hoặc một nhóm route. Đánh dấu đỏ là các filter phổ biến hơn.
- **GlobalFilter**: Global filter, filter áp dụng trên tất cả route.

### Local Filter

Các local filter phổ biến như hình dưới:

![](/images/github/javaguide/system-design/distributed-system/api-gateway/spring-cloud-gateway-gatewayfilters.png)

Dùng như thế nào? Dưới đây là ví dụ: Nếu URL match thành công thì bỏ "api" khỏi URL.

```yaml
filters: # Filter
  - RewritePath=/api/(?<segment>.*),/$\{segment} # Thay thế "api" trong path redirect thành empty
```

Tất nhiên cũng có thể custom filter — không đi sâu trong bài này.

### Global Filter

Các global filter phổ biến như hình dưới:

![](/images/github/javaguide/system-design/distributed-system/api-gateway/spring-cloud-gateway-globalfilters.png)

Cách dùng phổ biến nhất của global filter là load balancing. Cấu hình như sau:

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: route_member # Third-party microservice routing rule
          uri: lb://passjava-member # Load balancing, forward request đến service passjava-member đã đăng ký trong registry
          predicates: # Assertion
            - Path=/api/member/** # Nếu frontend request path chứa api/member, áp dụng routing rule này
          filters: # Filter
            - RewritePath=/api/(?<segment>.*),/$\{segment} # Thay thế api trong path redirect thành empty
```

Có keyword quan trọng `lb` ở đây, dùng global filter `LoadBalancerClientFilter`. Sau khi match route này, sẽ forward request đến service passjava-member và hỗ trợ load balancing forward — tức trước tiên resolve passjava-member thành host và port thực tế của microservice, rồi forward đến microservice thực tế.

## Spring Cloud Gateway có hỗ trợ rate limiting không?

Spring Cloud Gateway có sẵn rate limiting filter. Interface tương ứng là `RateLimiter`, chỉ có một implementation class là `RedisRateLimiter` (rate limiting dựa trên Redis + Lua) — chức năng rate limiting cung cấp khá đơn giản và không dễ dùng.

Từ Sentinel 1.6.0, Sentinel giới thiệu adapter module cho Spring Cloud Gateway — có thể cung cấp rate limiting theo hai chiều resource: chiều route và chiều custom API. Tức Spring Cloud Gateway có thể kết hợp Sentinel để triển khai gateway traffic control mạnh mẽ hơn.

## Spring Cloud Gateway custom global exception handling như thế nào?

Trong SpringBoot project, chúng ta chỉ cần cấu hình `@RestControllerAdvice` và `@ExceptionHandler` trong project để catch global exception. Tuy nhiên cách này không áp dụng được cho Spring Cloud Gateway.

Spring Cloud Gateway cung cấp nhiều cách xử lý global. Một cách phổ biến là implement `ErrorWebExceptionHandler` và override method `handle`:

```java
@Order(-1)
@Component
@RequiredArgsConstructor
public class GlobalErrorWebExceptionHandler implements ErrorWebExceptionHandler {
    private final ObjectMapper objectMapper;

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
    // ...
    }
}
```

## Tài liệu tham khảo

- Tài liệu chính thức Spring Cloud Gateway: <https://cloud.spring.io/spring-cloud-gateway/reference/html/>
- Creating a custom Spring Cloud Gateway Filter: <https://spring.io/blog/2022/08/26/creating-a-custom-spring-cloud-gateway-filter>
- Global exception handling: <https://zhuanlan.zhihu.com/p/347028665>
