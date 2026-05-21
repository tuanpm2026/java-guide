---
title: Giải thích chi tiết nguyên lý và thuật toán Load Balancing
description: Bài viết giải thích chi tiết nguyên lý cốt lõi của load balancing, bao gồm sự khác biệt giữa 4-layer/7-layer load balancing, so sánh server-side và client-side load balancing, giải thích sâu các thuật toán như round-robin, weighted round-robin, random, consistent hashing, cũng như các giải pháp triển khai chính như Nginx, LVS.
category: High Performance
head:
  - - meta
    - name: keywords
      content: load balancing,layer 4 load balancing,layer 7 load balancing,Nginx load balancing,LVS,load balancing algorithms,round-robin,consistent hashing,client-side load balancing
---

<!-- @include: @small-advertisement.snippet.md -->

## Load Balancing là gì?

**Load Balancing** là việc phân phối request của user đến các server khác nhau để xử lý, nhằm cải thiện khả năng xử lý đồng thời tổng thể và độ tin cậy của hệ thống. Dịch vụ load balancing có thể được thực hiện bởi phần mềm hoặc phần cứng chuyên dụng. Thông thường, phần cứng có hiệu năng tốt hơn còn phần mềm có giá rẻ hơn (sẽ giới thiệu chi tiết sau).

Hình dưới đây là ảnh minh họa từ một bài trong phần "High Concurrency" của [《Java Interview Guide》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247519384&idx=1&sn=bc7e71af75350b755f04ca4178395b1a&chksm=cea1c353f9d64a458f797696d4144b4d6e58639371a4612b8e4d106d83a66d2289e7b2cd7431&token=660789642&lang=zh_CN&scene=21#wechat_redirect). Từ hình có thể thấy, product service của hệ thống được deploy nhiều lần trên các server khác nhau, để phân luồng request truy cập product service, chúng ta dùng load balancing.

![Multiple service instances - Load Balancing](https://oss.javaguide.cn/github/javaguide/high-performance/load-balancing/multi-service-load-balancing.drawio.png)

Load balancing là một phương thức phổ biến và tương đối đơn giản để cải thiện khả năng đồng thời và độ tin cậy của hệ thống, dù là monolithic architecture hay microservices architecture đều hầu như dùng đến.

## Load Balancing được phân loại như thế nào?

Load balancing có thể chia đơn giản thành **server-side load balancing** và **client-side load balancing**.

Server-side load balancing liên quan đến nhiều kiến thức hơn và gặp nhiều hơn trong công việc, vì vậy tôi sẽ dành nhiều thời gian hơn để giới thiệu.

### Server-side Load Balancing

**Server-side load balancing** chủ yếu áp dụng giữa **external request** và **gateway layer** của hệ thống, có thể triển khai bằng **phần mềm** hoặc **phần cứng**.

Hình dưới đây là sơ đồ server-side load balancing đơn giản dựa trên Nginx mà tôi vẽ:

![Server-side load balancing dựa trên Nginx](https://oss.javaguide.cn/github/javaguide/high-performance/load-balancing/server-load-balancing.png)

**Hardware load balancing** thực hiện chức năng load balancing thông qua thiết bị phần cứng chuyên dụng (như **F5, A10, Array**).

Ưu điểm của hardware load balancing là hiệu năng rất mạnh và ổn định, nhược điểm là đắt thực sự. Loại F5 cơ bản cũng tốn tối thiểu hơn 20 vạn, hầu hết công ty không thể kham nổi. Nếu business không lớn, thực sự không cần thiết phải dùng phần cứng để load balancing, dùng software load balancing là đủ!

Trong công việc hàng ngày, chúng ta thường khó tiếp xúc với hardware load balancing, tiếp xúc nhiều hơn là **software load balancing**. Software load balancing thực hiện chức năng qua phần mềm (như **LVS, Nginx, HAproxy**), hiệu năng tuy kém hơn một chút nhưng giá rẻ! Server Linux cơ bản cũng chỉ vài nghìn, loại hiệu năng tốt hơn 2-3 vạn là rất ổn.

Theo mô hình OSI, server-side load balancing còn có thể chia thành:

- Layer 2 load balancing
- Layer 3 load balancing
- Layer 4 load balancing
- Layer 7 load balancing

Phổ biến nhất là layer 4 và layer 7 load balancing, vì vậy bài này cũng tập trung giới thiệu hai loại này.

> Nginx official website có giới thiệu chi tiết về layer 4 và layer 7 load balancing, bạn quan tâm có thể xem:
>
> - [What Is Layer 4 Load Balancing?](https://www.nginx.com/resources/glossary/layer-4-load-balancing/)
> - [What Is Layer 7 Load Balancing?](https://www.nginx.com/resources/glossary/layer-7-load-balancing/)

![OSI 7-layer model](https://oss.javaguide.cn/github/javaguide/cs-basics/network/osi-7-model.png)

- **Layer 4 load balancing** hoạt động tại tầng 4 của mô hình OSI — transport layer. Giao thức chính ở tầng này là TCP/UDP. Load balancer ở tầng này có thể thấy địa chỉ source port và destination port trong gói tin, sẽ dựa trên những thông tin này thông qua một số thuật toán load balancing để forward gói tin đến server backend thực. Tức là, cốt lõi của layer 4 load balancing là load balancing ở mức IP+port, không liên quan đến nội dung cụ thể của message.
- **Layer 7 load balancing** hoạt động tại tầng 7 của mô hình OSI — application layer. Giao thức chính ở tầng này là HTTP. Load balancing ở tầng này route network request theo cách phức tạp hơn layer 4, nó sẽ đọc phần data của message (ví dụ phần HTTP message), rồi đưa ra quyết định load balancing dựa trên nội dung đọc được (như URL, Cookie). Tức là, cốt lõi của layer 7 load balancer là load balancing ở mức nội dung message (như URL, Cookie). Thiết bị thực hiện layer 7 load balancing thường được gọi là **reverse proxy server**.

Layer 7 load balancing tiêu tốn nhiều hiệu năng hơn layer 4 load balancing, nhưng cũng linh hoạt hơn, có thể route network request thông minh hơn. Ví dụ bạn có thể tối ưu dựa trên nội dung request như caching, compression, encryption.

Nói đơn giản, **layer 4 load balancing có hiệu năng mạnh, layer 7 load balancing có tính năng mạnh hơn!** Nhưng với phần lớn business scenario, sự khác biệt hiệu năng giữa layer 4 và layer 7 load balancing cơ bản có thể bỏ qua.

Đoạn dưới đây trích từ bài [What Is Layer 4 Load Balancing?](https://www.nginx.com/resources/glossary/layer-4-load-balancing/) trên Nginx official website:

> Layer 4 load balancing was a popular architectural approach to traffic handling when commodity hardware was not as powerful as it is now, and the interaction between clients and application servers was much less complex. It requires less computation than more sophisticated load balancing methods (such as Layer 7), but CPU and memory are now sufficiently fast and cheap that the performance advantage for Layer 4 load balancing has become negligible or irrelevant in most situations.

Trong công việc, chúng ta thường dùng **Nginx** để làm layer 7 load balancing, và LVS (Linux Virtual Server, layer 4 load balancing của Linux kernel) để làm layer 4 load balancing.

Về tổng hợp các kiến thức phổ biến của Nginx, đã có nội dung tương ứng trong phần "Technical Interview Questions" của [《Java Interview Guide》](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html), bạn quan tâm có thể xem.

![](https://oss.javaguide.cn/github/javaguide/image-20220328105759300.png)

Nhưng LVS thực ra hầu hết công ty không cần dùng đến, chỉ những công ty lớn như Alibaba, Baidu, Tencent, eBay mới dùng. Dùng nhiều nhất vẫn là Nginx.

### Client-side Load Balancing

**Client-side load balancing** chủ yếu áp dụng giữa các service khác nhau bên trong hệ thống, có thể dùng component load balancing có sẵn để triển khai.

Trong client-side load balancing, client tự duy trì một danh sách địa chỉ server, trước khi gửi request, client sẽ dựa trên thuật toán load balancing tương ứng để chọn một server cụ thể xử lý request.

Client-side load balancer và service chạy trong cùng một process hoặc Java program, không có network overhead thêm. Tuy nhiên, việc triển khai client-side load balancing bị giới hạn bởi ngôn ngữ lập trình, ví dụ Spring Cloud Load Balancer chỉ dùng được cho Java.

Các microservices framework chủ yếu trong Java như Dubbo, Spring Cloud đều tích hợp sẵn triển khai client-side load balancing out-of-the-box. Dubbo mặc định tích hợp load balancing, Spring Cloud triển khai load balancing theo dạng component, là tùy chọn. Phổ biến nhất là Spring Cloud Load Balancer (official, recommended) và Ribbon (Netflix, đã deprecated).

Hình dưới đây là sơ đồ đơn giản client-side load balancing dựa trên Spring Cloud Load Balancer (Ribbon tương tự) mà tôi vẽ:

![](https://oss.javaguide.cn/github/javaguide/high-performance/load-balancing/spring-cloud-lb-gateway.png)

## Các thuật toán load balancing phổ biến là gì?

### Random (Ngẫu nhiên)

**Random** là thuật toán load balancing đơn giản và thô nhất.

Nếu không cấu hình weight, tất cả server có xác suất được truy cập như nhau. Nếu cấu hình weight, server có weight cao hơn sẽ có xác suất được truy cập lớn hơn.

Thuật toán random không có weight phù hợp với cluster có server hiệu năng tương đương, mỗi server chịu tải như nhau. Weighted random phù hợp với cluster có server hiệu năng không đồng đều, weight giúp phân phối request hợp lý hơn.

Tuy nhiên, random algorithm có một nhược điểm khá rõ: một số máy trong một khoảng thời gian không được random đến, dù đây là thuật toán xác suất, dù weight bằng nhau cũng có thể xảy ra tình trạng này.

Vì vậy, **Round-robin** ra đời!

### Round-robin (Vòng lặp)

Round-robin lần lượt xử lý từng server, cũng có thể đặt weight.

Nếu không cấu hình weight, mỗi request được phân bổ lần lượt đến các server khác nhau theo thứ tự thời gian. Nếu cấu hình weight, server có weight cao hơn sẽ được truy cập nhiều hơn.

Thuật toán round-robin không có weight phù hợp với cluster có server hiệu năng tương đương. Weighted round-robin phù hợp với cluster có server hiệu năng không đồng đều.

Dựa trên weighted round-robin, còn có thuật toán load balancing được cải tiến hơn nữa như smooth weighted round-robin.

Smooth weighted round-robin algorithm được triển khai lần đầu trong Nginx, có thể tham khảo commit này: <https://github.com/phusion/nginx/commit/27e94984486058d73157038f7950a0a36ecc6e35>. Nếu bạn đã nghiên cứu kỹ chiến lược load balancing của Dubbo, sẽ thấy weighted round-robin của Dubbo tham khảo thuật toán này và cải tiến thêm.

![Dubbo Weighted Round-Robin Load Balancing Algorithm](https://oss.javaguide.cn/github/javaguide/high-performance/load-balancing/dubbo-round-robin-load-balance.png)

### Power of Two Choices (Hai lần ngẫu nhiên)

Thuật toán Power of Two Choices thêm một lần random nữa trên cơ sở random, chọn thêm một server. Sau đó dựa trên load của hai server, chọn ra server phù hợp nhất.

Ưu điểm của thuật toán này là có thể điều chỉnh động load của backend node, làm cho nó cân bằng hơn. Nếu chỉ dùng random một lần, có thể dẫn đến một số server bị quá tải trong khi một số server lại nhàn rỗi.

### Hash (Băm)

Chuyển đổi thông tin parameter của request thành hash value thông qua hash function, rồi dựa trên hash value để quyết định server nào xử lý request.

Khi số server không thay đổi, request có cùng parameter luôn được gửi đến cùng một server xử lý, ví dụ request từ cùng IP, request của cùng user.

### Consistent Hashing (Băm nhất quán)

Tương tự hash, consistent hashing cũng có thể đảm bảo request có cùng parameter luôn được gửi đến cùng một server. Nhưng nó giải quyết một số vấn đề của hash thông thường.

Khi số server thay đổi, hash value của hash thông thường sẽ rơi vào server khác, điều này rõ ràng vi phạm ý định ban đầu của việc dùng hash. Còn core idea của consistent hashing là map cả data và node lên một hash ring, rồi dựa trên thứ tự hash value để xác định data thuộc node nào. Khi server thêm hoặc xóa, chỉ ảnh hưởng đến hash của server đó, không gây ra việc phân phối lại hash key của toàn bộ service cluster.

### Least Connections (Kết nối ít nhất)

Khi có request mới, duyệt danh sách server node và chọn server có số kết nối nhỏ nhất để phản hồi request hiện tại. Trong trường hợp có cùng số kết nối, có thể thực hiện weighted random.

Least connections dựa trên giả định lý tưởng rằng server có nhiều kết nối hơn thì load cao hơn. Tuy nhiên, thực tế là số kết nối không thể đại diện cho load thực tế của server — một số kết nối tiêu tốn nhiều system resource hơn, một số kết nối ít tiêu tốn hơn.

### Least Active (Hoạt động ít nhất)

Least active tương tự least connections nhưng khoa học hơn. Least active lấy số active connection làm tiêu chuẩn, số active connection có thể hiểu là số request đang được xử lý hiện tại. Active count càng thấp, khả năng xử lý càng mạnh, như vậy server có khả năng xử lý mạnh hơn sẽ xử lý nhiều request hơn. Trong trường hợp có cùng active count, có thể thực hiện weighted random.

### Fastest Response Time (Thời gian phản hồi nhanh nhất)

Khác với least connections và least active, fastest response time lấy response time làm tiêu chuẩn để chọn server cụ thể. Client duy trì response time của mỗi server, mỗi request chọn server có response time ngắn nhất. Trong trường hợp có cùng response time, có thể thực hiện weighted random.

Thuật toán này giúp request được xử lý nhanh hơn, nhưng có thể gây tình trạng traffic tập trung quá nhiều vào server hiệu năng cao.

## Layer 7 load balancing có thể làm thế nào?

Giới thiệu ngắn gọn hai giải pháp layer 7 load balancing thường dùng trong project: DNS resolution và reverse proxy.

Ngoài hai giải pháp này, HTTP redirect cũng có thể dùng để triển khai load balancing, nhưng DNS resolution và reverse proxy vẫn được dùng nhiều hơn và khuyến nghị hơn.

### DNS Resolution

DNS resolution là cách triển khai layer 7 load balancing khá sớm, rất đơn giản.

Nguyên lý của DNS resolution triển khai load balancing như sau: Cấu hình nhiều IP address cho cùng một host record trong DNS server, các IP address này tương ứng với các server khác nhau. Khi user request domain name, DNS server dùng thuật toán round-robin để trả về IP address, như vậy thực hiện được round-robin load balancing.

![](https://oss.javaguide.cn/github/javaguide/high-performance/load-balancing/6997605302452f07e8b28d257d349bf0.png)

DNS resolution hiện nay hầu hết đều hỗ trợ cấu hình weight của IP address, như vậy trong cluster có server hiệu năng không đồng đều, việc phân bổ request sẽ hợp lý hơn. Như Alibaba Cloud DNS mà tôi đang dùng cũng hỗ trợ cấu hình weight.

![](https://oss.javaguide.cn/github/javaguide/aliyun-dns-weight-setting.png)

### Reverse Proxy (Proxy ngược)

Client gửi request đến reverse proxy server, reverse proxy server chọn target server, lấy data rồi trả về cho client. Địa chỉ được public ra ngoài là địa chỉ reverse proxy server, ẩn địa chỉ IP thực của server. Reverse proxy "proxy" cho target server, quá trình này là transparent với client.

Nginx là reverse proxy server phổ biến nhất, nó có thể phân phối request nhận được từ client theo một số quy tắc nhất định (load balancing strategy) đều đặn đến tất cả server trong server cluster.

Reverse proxy load balancing cũng thuộc layer 7 load balancing.

![](https://oss.javaguide.cn/github/javaguide/nginx-load-balance.png)

## Client-side load balancing thường được làm thế nào?

Như đã nói ở trên, client-side load balancing có thể dùng component load balancing có sẵn để triển khai.

**Netflix Ribbon** và **Spring Cloud Load Balancer** là hai component load balancing phổ biến nhất trong Java ecosystem hiện nay.

Ribbon là component load balancing đời cũ do Netflix phát triển, chức năng khá đầy đủ, hỗ trợ nhiều load balancing strategy. Spring Cloud Load Balancer là sản phẩm chính thức của Spring để thay thế Ribbon, chức năng tương đối đơn giản hơn, hỗ trợ ít load balancing strategy hơn.

7 load balancing strategy mà Ribbon hỗ trợ:

- `RandomRule`: Random strategy
- `RoundRobinRule` (default): Round-robin strategy
- `WeightedResponseTimeRule`: Weight strategy (quyết định weight dựa trên response time)
- `BestAvailableRule`: Least connections strategy
- `RetryRule`: Retry strategy (lấy service theo round-robin strategy, nếu service instance lấy được là null hoặc đã hết hiệu lực, sẽ retry liên tục trong thời gian chỉ định để lấy service, nếu vẫn không lấy được sau thời gian chỉ định thì trả về null)
- `AvailabilityFilteringRule`: Availability-sensitive strategy (lọc bỏ service instance không healthy trước, rồi chọn service instance có số kết nối nhỏ hơn)
- `ZoneAvoidanceRule`: Zone-sensitive strategy (chọn service instance dựa trên hiệu năng của zone mà service thuộc về và tính khả dụng của service)

2 load balancing strategy mà Spring Cloud Load Balancer hỗ trợ:

- `RandomLoadBalancer`: Random strategy
- `RoundRobinLoadBalancer` (default): Round-robin strategy

```java
public class CustomLoadBalancerConfiguration {

    @Bean
    ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(Environment environment,
            LoadBalancerClientFactory loadBalancerClientFactory) {
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(loadBalancerClientFactory
                .getLazyProvider(name, ServiceInstanceListSupplier.class),
                name);
    }
}
```

Tuy nhiên, load balancing strategy mà Spring Cloud Load Balancer hỗ trợ thực ra không chỉ hai loại này, các implementation class của `ServiceInstanceListSupplier` cũng có thể giúp nó hỗ trợ các load balancing strategy tương tự Ribbon. Điều này có vẻ được bổ sung dần về sau, không đọc tài liệu chính thức khó phát hiện ra, vì vậy đọc tài liệu chính thức thực sự rất quan trọng!

Đây là hai ví dụ chính thức:

- `ZonePreferenceServiceInstanceListSupplier`: Triển khai load balancing dựa trên zone
- `HintBasedServiceInstanceListSupplier`: Triển khai load balancing dựa trên hint

```java
public class CustomLoadBalancerConfiguration {
    // Dùng phương pháp load balancing dựa trên zone
    @Bean
    public ServiceInstanceListSupplier discoveryClientServiceInstanceListSupplier(
            ConfigurableApplicationContext context) {
        return ServiceInstanceListSupplier.builder()
                    .withDiscoveryClient()
                    .withZonePreference()
                    .withCaching()
                    .build(context);
    }
}
```

Về giới thiệu chi tiết và cập nhật hơn về Spring Cloud Load Balancer, khuyến nghị xem tài liệu chính thức: <https://docs.spring.io/spring-cloud-commons/docs/current/reference/html/#spring-cloud-loadbalancer>, tất cả dựa trên tài liệu chính thức.

Round-robin strategy cơ bản có thể đáp ứng yêu cầu của phần lớn project, trong project thực tế nếu không có yêu cầu đặc biệt, thường dùng default round-robin strategy. Ngoài ra, cả Ribbon và Spring Cloud Load Balancer đều hỗ trợ custom load balancing strategy.

Cá nhân tôi khuyến nghị nếu không thực sự cần một chức năng hoặc load balancing strategy đặc trưng của Ribbon, hãy ưu tiên dùng Spring Cloud Load Balancer do Spring official cung cấp.

Cuối cùng nói về lý do tôi không khuyến nghị dùng Ribbon.

Spring Cloud phiên bản 2020.0.0 đã loại bỏ tất cả các component của Netflix trừ Eureka. Spring Cloud Hoxton.M2 là phiên bản đầu tiên hỗ trợ Spring Cloud Load Balancer để thay thế Netflix Ribbon.

Khi học microservices lúc đầu, chắc chắn chúng ta đã tiếp xúc với các component cần thiết để xây dựng hệ thống microservices nổi tiếng do Netflix mã nguồn mở như Feign, Ribbon, Zuul, Hystrix, Eureka v.v. Cho đến nay vẫn còn rất rất nhiều công ty đang sử dụng những component này. Không ngoa khi nói Netflix đã dẫn dắt sự phát triển microservices trong Java stack.

![](https://oss.javaguide.cn/github/javaguide/SpringCloudNetflix.png)

**Vậy tại sao Spring Cloud lại vội vàng loại bỏ các component của Netflix?** Chủ yếu là vì năm 2018, Netflix tuyên bố các component mã nguồn mở cốt lõi như Hystrix, Ribbon, Zuul, Eureka v.v. chuyển sang trạng thái maintenance, không phát triển tính năng mới nữa, chỉ fix BUG. Vì vậy, Spring official buộc phải cân nhắc loại bỏ các component của Netflix.

**Spring Cloud Alibaba** là một lựa chọn tốt, đặc biệt đối với các công ty và individual developer trong nước.

## Tài liệu tham khảo

- Dry goods | Implementation of Layer 4 Software Load Balancing at eBay: <https://mp.weixin.qq.com/s/bZMxLTECOK3mjdgiLbHj-g>
- HTTP Load Balancing (Nginx official documentation): <https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/>
- Deep Dive into Load Balancing - vivo Internet Technology: <https://www.cnblogs.com/vivotech/p/14859041.html>

<!-- @include: @article-footer.snippet.md -->
