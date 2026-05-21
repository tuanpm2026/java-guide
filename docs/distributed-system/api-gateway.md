---
title: Tổng hợp kiến thức cơ bản về API Gateway
category: Distributed System
description: Giải thích chi tiết kiến thức cơ bản về API Gateway, bao gồm các chức năng cốt lõi (routing, authentication, rate limiting, load balancing), nguyên lý hoạt động, so sánh lựa chọn các giải pháp gateway phổ biến như Zuul, Spring Cloud Gateway, Nginx.
tag:
  - API Gateway
head:
  - - meta
    - name: keywords
      content: API Gateway,gateway,microservices gateway,Spring Cloud Gateway,Zuul,rate limiting,circuit breaker,load balancing,gateway interview questions
---

## Gateway là gì?

API Gateway là **điểm vào thống nhất** nằm giữa client và các backend service. Tất cả request của client đều đi qua gateway trước, sau đó gateway route đến service đích cụ thể.

### Giá trị cốt lõi

Trong microservices architecture, một hệ thống được tách thành nhiều service. Các tính năng như **security authentication, traffic control, logging, monitoring** là tính năng mà mỗi service đều cần. Nếu không có gateway, chúng ta cần triển khai riêng lẻ những tính năng này trong từng service, dẫn đến:

- **Code trùng lặp**: Cùng logic được triển khai dư thừa trong nhiều service
- **Quản lý phân tán**: Thiếu view cấu hình và monitoring thống nhất
- **Chi phí bảo trì cao**: Thay đổi tính năng cần sửa tất cả service

![API Gateway diagram](/images/github/javaguide/system-design/distributed-system/api-gateway-overview.png)

### Trách nhiệm cốt lõi

Dù chức năng của gateway nhiều, nhưng cốt lõi có thể tóm gọn thành hai việc:

| Trách nhiệm           | Mô tả                                                   | Tính năng điển hình                                                    |
| --------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Request Routing**   | Route request của client đến service đích đúng          | Dynamic routing, load balancing, protocol conversion                   |
| **Request Filtering** | Chặn và xử lý trước/sau khi request đến backend service | Authentication, authorization, rate limiting, circuit breaker, logging |

Gateway có thể cung cấp các chức năng: request routing, security authentication (identity/permission), traffic control, load balancing, degradation & circuit breaking, logging, monitoring, parameter validation, protocol conversion.

**Vị trí của gateway trong microservices architecture**: Tất cả request của client đến gateway trước, gateway chịu trách nhiệm authentication thống nhất, traffic control, route distribution, backend service tập trung xử lý business logic.

### High Availability Deployment

Việc giới thiệu gateway sẽ thêm một lần network forwarding (performance loss thường có thể bỏ qua trong môi trường internal network), nhưng đồng thời cũng giới thiệu rủi ro single point mới. Do đó, bản thân gateway service phải đảm bảo high availability:

Như hình dưới, lớp ngoài của gateway service sử dụng Nginx (hoặc các thiết bị/phần mềm load balancing khác) để đạt high availability thông qua load balancing. Khi deploy Nginx cũng cần cân nhắc high availability, tránh rủi ro single point.

![Server-side load balancing dựa trên Nginx](/images/github/javaguide/high-performance/load-balancing/server-load-balancing.png)

## Gateway có thể cung cấp những tính năng gì?

Phần lớn gateway có thể cung cấp các tính năng sau (một số tính năng cần tích hợp framework hoặc middleware khác):

- **Request Routing**: Forward request đến target microservice.
- **Load Balancing**: Thực hiện dynamic load balancing cho request dựa trên tình trạng load của từng microservice instance hoặc cấu hình load balancing strategy cụ thể.
- **Security Authentication**: Xác minh danh tính của user request và chỉ cho phép client đáng tin cậy truy cập API, cũng có thể sử dụng RBAC và các phương thức khác để phân quyền.
- **Parameter Validation**: Hỗ trợ logic mapping và validation tham số.
- **Logging**: Ghi log hành vi của tất cả request để sử dụng sau.
- **Monitoring & Alerting**: Monitoring từ các khía cạnh business metrics, machine metrics, JVM metrics và cung cấp cơ chế alerting đi kèm.
- **Traffic Control**: Kiểm soát traffic của request — giới hạn số request trong một khoảng thời gian.
- **Circuit Breaking & Degradation**: Real-time monitoring thống kê request, khi đạt ngưỡng failure đã cấu hình, tự động circuit break và trả về default value.
- **Response Caching**: Khi user request lấy dữ liệu static hoặc ít cập nhật, nhiều lần request trong một khoảng thời gian rất có thể lấy được dữ liệu giống nhau. Trong trường hợp này có thể cache response lại. Như vậy user request có thể nhận được response data trực tiếp ở gateway layer, không cần truy cập business service, giảm nhẹ gánh nặng cho business service.
- **Response Aggregation**: Trong một số trường hợp, response content mà user request cần lấy có thể đến từ nhiều business service. Gateway với tư cách là caller của business service, có thể tổng hợp response của nhiều service và trả về cùng lúc cho user.
- **Gray Release**: Dynamic phân luồng request đến các phiên bản service khác nhau (dạng gray release cơ bản nhất).
- **Exception Handling**: Với exception response được trả về từ business service, có thể thực hiện conversion processing ở gateway layer trước khi trả về cho user. Như vậy có thể ẩn một số chi tiết exception từ phía business, convert thành error message thân thiện với user để trả về.
- **API Documentation**: Nếu có kế hoạch expose API cho developer bên ngoài tổ chức, phải cân nhắc sử dụng API documentation như Swagger hoặc OpenAPI.
- **Protocol Conversion**: Tích hợp các microservice backend dựa trên các style và implementation technology khác nhau như REST, AMQP, Dubbo thông qua protocol conversion, cung cấp unified service cho các client cụ thể như Web Mobile, open platform.
- **Certificate Management**: Deploy SSL certificate đến API gateway, quản lý interface qua một điểm vào thống nhất, giảm complexity khi thay đổi certificate.

Hình dưới đây lấy từ bài [Design and Implementation of Shepherd - API Gateway Service at 10 Billion Scale - Meituan Technical Team - 2021](https://mp.weixin.qq.com/s/iITqdIiHi3XGKq6u6FRVdg).

![](/images/github/javaguide/distributed-system/api-gateway/up-35e102c633bbe8e0dea1e075ea3fee5dcfb.png)

## Các gateway system phổ biến là gì?

### Netflix Zuul

Zuul là gateway service được Netflix phát triển, cung cấp dynamic routing, monitoring, resiliency, security. Được phát triển trên Java stack, có thể phối hợp với Eureka, Ribbon, Hystrix và các component khác.

Kiến trúc cốt lõi của Zuul:

![Zuul core architecture](/images/github/javaguide/distributed-system/api-gateway/zuul-core-architecture.webp)

Zuul chủ yếu filter request thông qua filter (tương tự AOP) để triển khai các tính năng cần thiết của gateway.

![Zuul request lifecycle](/images/github/javaguide/system-design/distributed-system/api-gateway/zuul-request-lifecycle.webp)

Chúng ta có thể tùy chỉnh filter để xử lý request, và ecosystem của Zuul cũng có nhiều filter có sẵn. Ví dụ rate limiting có thể dùng trực tiếp [spring-cloud-zuul-ratelimit](https://github.com/marcosbarbero/spring-cloud-zuul-ratelimit) (đây chỉ là ví dụ minh họa, thông thường kết hợp với hystrix để làm rate limiting):

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-zuul</artifactId>
</dependency>
<dependency>
    <groupId>com.marcosbarbero.cloud</groupId>
    <artifactId>spring-cloud-zuul-ratelimit</artifactId>
    <version>2.2.0.RELEASE</version>
</dependency>
```

[Zuul 1.x](https://netflixtechblog.com/announcing-zuul-edge-service-in-the-cloud-ab3af5be08ee) dựa trên synchronous IO, hiệu năng kém. [Zuul 2.x](https://netflixtechblog.com/open-sourcing-zuul-2-82ea476cb2b3) triển khai asynchronous IO dựa trên Netty, hiệu năng cải thiện đáng kể.

![Zuul2 architecture](/images/github/javaguide/distributed-system/api-gateway/zuul2-core-architecture.png)

> **Lưu ý quan trọng**: Spring Cloud official đã **loại bỏ Zuul 1.x sau phiên bản Hoxton**. Mặc dù Netflix đã mã nguồn mở Zuul 2.x, nhưng Zuul 2.x không được tích hợp vào phiên bản chính của Spring Cloud. Đối với project mới trong Spring Cloud stack, **tuyệt đối không được chọn Zuul 1.x**, khuyến nghị dùng Spring Cloud Gateway.

- GitHub: <https://github.com/Netflix/zuul>
- Official Wiki: <https://github.com/Netflix/zuul/wiki>

### Spring Cloud Gateway

Spring Cloud Gateway là gateway trong hệ sinh thái Spring Cloud, ra đời với mục tiêu thay thế gateway đời cũ **Zuul** (chính xác là Zuul 1.x). Đáng chú ý, Spring Cloud Gateway ra đời sớm hơn Zuul 2.x, hai cái thuộc các con đường phát triển kỹ thuật khác nhau.

#### Tại sao Spring Cloud Gateway có hiệu năng tốt hơn?

| Phiên bản                | IO Model                          | Thread Model       | Throughput | Latency |
| ------------------------ | --------------------------------- | ------------------ | ---------- | ------- |
| **Zuul 1.x**             | Synchronous Blocking (Servlet)    | Thread per request | Thấp       | Cao     |
| **Zuul 2.x**             | Asynchronous Non-blocking (Netty) | Event loop         | Cao        | Thấp    |
| **Spring Cloud Gateway** | Asynchronous Non-blocking (Netty) | Event loop         | Cao        | Thấp    |

Spring Cloud Gateway triển khai dựa trên **Spring WebFlux** chứ không phải Spring WebMVC truyền thống. Spring WebFlux dùng thư viện **Reactor** để triển khai reactive programming model, tầng dưới dựa trên **Netty** để triển khai asynchronous non-blocking I/O.

**Ưu điểm của reactive programming**:

- **Non-blocking I/O**: Không cần phân bổ thread riêng cho mỗi request, ít thread có thể xử lý lượng lớn concurrent connection
- **Backpressure mechanism**: Khi downstream service xử lý không đủ nhanh, tự động điều tiết tốc độ upstream request, ngăn cascade failure
- **High resource utilization**: Chi phí thread context switching giảm đáng kể

#### Các khái niệm cốt lõi

Core component của Spring Cloud Gateway bao gồm ba phần:

1. **Route (Định tuyến)**: Building block cơ bản của gateway, bao gồm ID, target URI, tập hợp predicate và tập hợp filter
2. **Predicate (Vị từ)**: Đây là Java 8 `Predicate` function, dùng để khớp HTTP request (như path, method, header v.v.)
3. **Filter (Bộ lọc)**: Instance của `GatewayFilter`, dùng để sửa đổi request và response trước hoặc sau khi request được gửi đến downstream service

Spring Cloud Gateway và Zuul 2.x đều xử lý request thông qua filter, nhưng Spring Cloud Gateway tích hợp chặt chẽ hơn với Spring ecosystem (như Eureka, Consul, Config). Hiện tại, đối với project trong Java stack, Spring Cloud Gateway là lựa chọn được khuyến nghị.

- Github: <https://github.com/spring-cloud/spring-cloud-gateway>
- Official website: <https://spring.io/projects/spring-cloud-gateway>

### OpenResty

Theo giới thiệu chính thức:

> OpenResty là nền tảng Web hiệu năng cao dựa trên Nginx và Lua, tích hợp nhiều thư viện Lua chất lượng cao, module bên thứ ba và hầu hết các dependency. Dùng để dễ dàng xây dựng dynamic web application, web service và dynamic gateway có khả năng xử lý siêu cao đồng thời và mở rộng tốt.

![Mối quan hệ giữa OpenResty, Nginx và Lua](/images/github/javaguide/system-design/distributed-system/api-gatewaynginx-lua-openresty.png)

OpenResty dựa trên Nginx, chủ yếu nhắm đến khả năng high concurrency tuyệt vời của nó. Nhưng vì Nginx được phát triển bằng C, ngưỡng để phát triển thứ cấp khá cao. Nếu muốn triển khai một số logic hoặc tính năng tùy chỉnh trên Nginx, cần viết module C và biên dịch lại Nginx.

Để giải quyết vấn đề này, OpenResty thông qua việc triển khai các Nginx module như `ngx_lua` và `stream_lua` đã tích hợp hoàn hảo Lua/LuaJIT vào Nginx, cho phép chúng ta nhúng Lua script bên trong Nginx, mở rộng tính năng của gateway thông qua ngôn ngữ Lua đơn giản, ví dụ triển khai custom routing rule, filter, cache strategy.

> Lua là ngôn ngữ dynamic script rất nhanh, tốc độ chạy gần với C. LuaJIT là JIT compiler của Lua, có thể cải thiện đáng kể hiệu quả thực thi của Lua code. LuaJIT pre-compile và cache một số Lua function và library thường dùng, lần sau gọi có thể dùng trực tiếp bytecode đã cache, tăng tốc độ thực thi đáng kể.

Để tìm hiểu nhập môn OpenResty và gateway security thực chiến, khuyến nghị đọc bài: [Nhập môn OpenResty và gateway security thực chiến mà mọi backend đều nên biết](https://mp.weixin.qq.com/s/3HglZs06W95vF3tSa3KrXw).

- Github: <https://github.com/openresty/openresty>
- Official website: <https://openresty.org/>

### Kong

Kong là gateway system hiệu năng cao, cloud-native, có khả năng mở rộng và ecosystem phong phú dựa trên [OpenResty](https://github.com/openresty/) (Nginx + Lua), chủ yếu bao gồm 3 component:

- Kong Server: Server dựa trên Nginx, dùng để nhận API request.
- Apache Cassandra/PostgreSQL: Dùng để lưu trữ operational data (traditional mode).
- Kong Manager: Official UI management tool, cung cấp visual API management, monitoring và configuration (có OSS open source và Enterprise edition). Cũng có thể quản lý qua RESTful Admin API.

![](/images/github/javaguide/system-design/distributed-system/api-gateway/kong-way.webp)

Kong trước đây phụ thuộc external database để lưu cấu hình, architecture tương đối phức tạp, cần đảm bảo high availability thêm cho tầng database. Nhưng từ **Kong 1.1** trở đi, đã hỗ trợ **DB-less mode**:

- **Traditional mode**: Dùng PostgreSQL hoặc Cassandra lưu cấu hình, phù hợp với scenario cần persistent API data
- **DB-less mode**: Quản lý qua declarative config file, không cần deploy database, architecture nhẹ hơn
- **Kubernetes Ingress mode**: Quản lý cấu hình qua ConfigMap hoặc CRD (Kubernetes Custom Resource Definitions), không cần database, là cách dùng phổ biến trong môi trường K8s

> **Lưu ý**: Phần sau của bài này thảo luận về vấn đề high availability của Kong chủ yếu nhắm vào traditional mode. Khi dùng Ingress Controller mode trong K8s, architecture đã được đơn giản hóa đáng kể.

Kong cung cấp cơ chế plugin để mở rộng tính năng, plugin được thực thi trong lifecycle của request-response cycle của API. Ví dụ kích hoạt Zipkin plugin trên service:

```shell
$ curl -X POST http://kong:8001/services/{service}/plugins \
    --data "name=zipkin"  \
    --data "config.http_endpoint=http://your.zipkin.collector:9411/api/v2/spans" \
    --data "config.sample_ratio=0.001"
```

Kong về bản chất là Lua application, và là application được đóng gói thêm một lớp trên nền Openresty. Suy cho cùng là sử dụng cách nhúng Lua vào Nginx, trao cho Nginx khả năng lập trình, từ đó có thể làm những việc vô hạn ở tầng Nginx dưới dạng plugin như rate limiting, security access policy, routing, load balancing. Viết một Kong plugin là viết một Lua script tùy chỉnh theo chuẩn Kong plugin, rồi load vào Kong và reference.

![](/images/github/javaguide/system-design/distributed-system/api-gateway/kong-gateway-overview.png)

Ngoài Lua, Kong còn có thể phát triển plugin dựa trên Go, JavaScript, Python và các ngôn ngữ khác, nhờ PDK (Plugin Development Kit) tương ứng.

Về giới thiệu chi tiết Kong plugin, khuyến nghị đọc tài liệu chính thức: <https://docs.konghq.com/gateway/latest/kong-plugins/>, khá chi tiết.

- Github: <https://github.com/Kong/kong>
- Official website: <https://konghq.com/kong>

### APISIX

APISIX là gateway system hiệu năng cao, cloud-native, có khả năng mở rộng dựa trên OpenResty và etcd.

> etcd là open source, high availability distributed key-value storage system phát triển bằng Go, sử dụng Raft protocol để distributed consensus.

So với traditional API gateway, APISIX có dynamic routing và plugin hot loading, đặc biệt phù hợp với API management trong microservices system. Ngoài ra, APISIX tích hợp rất thuận tiện với các DevOps ecosystem tool như SkyWalking (distributed tracing), Zipkin (distributed tracing), Prometheus (monitoring system).

![APISIX architecture diagram](/images/github/javaguide/distributed-system/api-gateway/apisix-architecture.png)

Là project thay thế cho Nginx và Kong, APISIX hiện là Apache top-level open source project, và là domestic open source project graduate nhanh nhất. Nhiều công ty nổi tiếng trong nước (như Kingsoft, Youzan, iQiyi, Tencent, Beike) đã sử dụng APISIX để xử lý business traffic cốt lõi.

Theo giới thiệu của official website: "APISIX đã production-ready, tính năng, hiệu năng, kiến trúc toàn diện vượt trội so với Kong".

APISIX cũng hỗ trợ phát triển plugin tùy chỉnh. Ngoài Lua, developer còn có thể phát triển bằng hai cách sau để tránh chi phí học Lua:

- Thông qua Plugin Runner hỗ trợ nhiều ngôn ngữ lập trình phổ biến hơn (như Java, Python, Go v.v.). Bằng cách này, backend engineer có thể phát triển plugin APISIX bằng ngôn ngữ quen thuộc thông qua local RPC communication. Ưu điểm là giảm chi phí phát triển, nâng cao hiệu quả, nhưng có một số mất mát về hiệu năng.
- Dùng Wasm (WebAssembly) phát triển plugin. Wasm được nhúng vào APISIX, user có thể dùng Wasm để compile thành Wasm bytecode chạy trong APISIX.

> Wasm là định dạng binary instruction của stack-based virtual machine, một low-level assembly language, thiết kế để rất gần với compiled machine code và rất gần với native performance. Wasm ban đầu được xây dựng cho browser, nhưng khi công nghệ trưởng thành, càng ngày càng có nhiều use case ở phía server.

![](/images/github/javaguide/distributed-system/api-gateway/up-a240d3b113cde647f5850f4c7cc55d4ff5c.png)

- Github: <https://github.com/apache/apisix>
- Official website: <https://apisix.apache.org/zh/>

### Shenyu

Shenyu là gateway có khả năng mở rộng, hiệu năng cao, reactive dựa trên WebFlux, Apache top-level open source project.

![Shenyu architecture](/images/github/javaguide/distributed-system/api-gateway/shenyu-architecture.png)

Shenyu mở rộng tính năng thông qua plugin, plugin là tâm hồn của ShenYu và cũng có thể mở rộng và hot-plug. Các plugin khác nhau thực hiện các chức năng khác nhau. Shenyu tích hợp sẵn các plugin như rate limiting, circuit breaking, forwarding, rewrite, redirect, route monitoring v.v.

- Github: <https://github.com/apache/shenyu>
- Official website: <https://shenyu.apache.org/>

### So sánh tổng quan các gateway

| Đặc điểm            | Zuul 1.x      | Zuul 2.x           | Spring Cloud Gateway    | Kong                            | APISIX                         | Shenyu             |
| ------------------- | ------------- | ------------------ | ----------------------- | ------------------------------- | ------------------------------ | ------------------ |
| **IO Model**        | Sync Blocking | Async Non-blocking | Async Non-blocking      | Async Non-blocking              | Async Non-blocking             | Async Non-blocking |
| **Underlying Tech** | Servlet       | Netty              | WebFlux + Netty         | OpenResty (Nginx + Lua)         | OpenResty + etcd               | WebFlux + Netty    |
| **Performance**     | Thấp          | Cao                | Cao                     | Rất cao                         | Rất cao                        | Cao                |
| **Dynamic Config**  | Cần restart   | Hỗ trợ             | Hỗ trợ                  | Hỗ trợ                          | Hỗ trợ (hot update)            | Hỗ trợ             |
| **Config Storage**  | Memory        | Memory             | Memory                  | Database / YAML / K8s CRD       | etcd (distributed)             | Memory/Database    |
| **Rate Limiting**   | Cần integrate | Cần integrate      | Built-in (Resilience4j) | Plugin                          | Plugin                         | Plugin             |
| **Ecosystem**       | Netflix       | Netflix            | Spring Cloud            | CNCF / Kong                     | Apache                         | Apache             |
| **Ops Complexity**  | Thấp          | Trung              | Thấp                    | Trung (DB-less) / Cao (DB Mode) | Trung                          | Trung              |
| **Learning Curve**  | Gentle        | Gentle             | Gentle                  | Steep (Lua)                     | Steep (Lua)                    | Gentle (Java)      |
| **Use Case**        | Legacy system | Netflix stack      | Spring Cloud ecosystem  | Cloud-native, multi-language    | Cloud-native, high performance | Java ecosystem     |

## Làm thế nào để lựa chọn?

Chọn API gateway cần cân nhắc toàn diện về technology stack, performance requirements, team capabilities và ops cost.

| Scenario                                  | Giải pháp khuyến nghị                                                   | Lý do                                                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Spring Cloud ecosystem**                | Spring Cloud Gateway                                                    | Tích hợp liền mạch với Spring Boot/Spring Cloud, cấu hình đơn giản                                                               |
| **High performance / Cloud-native**       | APISIX                                                                  | Hot update dựa trên etcd, hiệu năng tốt, cloud-native architecture                                                               |
| **Multi-language ecosystem**              | Kong                                                                    | Plugin phong phú, hỗ trợ phát triển đa ngôn ngữ, cộng đồng mature                                                                |
| **Netflix stack**                         | Zuul 2.x                                                                | Tích hợp liền mạch với Eureka, Ribbon, Hystrix                                                                                   |
| **Dual-layer architecture (Recommended)** | Kong/APISIX (traffic gateway) + Spring Cloud Gateway (business gateway) | Traffic gateway xử lý SSL, WAF, global rate limiting; business gateway xử lý microservices authentication, parameter aggregation |

## Tài liệu tham khảo

- Kong plugin development tutorial [Easy to understand]: <https://cloud.tencent.com/developer/article/2104299>
- API Gateway Kong in action: <https://xie.infoq.cn/article/10e4dab2de0bdb6f2c3c93da6>
- Spring Cloud Gateway principles and applications: <https://blog.fintopia.tech/60e27b0e2078082a378ec5ed/>
- Why do microservices need an API gateway?: <https://apisix.apache.org/zh/blog/2023/03/08/why-do-microservices-need-an-api-gateway/>

<!-- @include: @article-footer.snippet.md -->
