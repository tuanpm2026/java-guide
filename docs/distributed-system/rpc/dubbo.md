---
title: Tổng hợp câu hỏi phỏng vấn Dubbo
category: Hệ thống phân tán
description: Kiến thức cốt lõi và câu hỏi phỏng vấn Dubbo chi tiết, bao gồm nguyên lý kiến trúc Dubbo, cơ chế mở rộng SPI, chiến lược cân bằng tải (ngẫu nhiên/vòng robin/consistent hash), đăng ký và khám phá dịch vụ, dung sai lỗi cụm, quản trị dịch vụ và các nội dung cốt lõi khác.
tag:
  - RPC
  - Dubbo
head:
  - - meta
    - name: keywords
      content: Dubbo,Dubbo面试题,Dubbo原理,SPI机制,负载均衡,服务注册,集群容错,服务治理,RPC框架
---

::: tip

- Dubbo3 đã được phát hành, bài viết này được viết dựa trên Dubbo2. Dubbo3 được phát triển từ Dubbo2, trong khi giữ nguyên các tính năng cốt lõi ban đầu, Dubbo3 đã nâng cấp toàn diện về tính dễ sử dụng, thực hành microservice quy mô lớn, thích ứng cơ sở hạ tầng cloud-native, thiết kế bảo mật và nhiều hướng khác.
- Nhiều liên kết trong bài viết này đã hết hiệu lực, nguyên nhân chính là do tài liệu chính thức của Dubbo đã được sửa đổi dẫn đến URL hỏng.

:::

Bài viết này là tổng kết về Dubbo mà tôi đã thực hiện dựa trên tài liệu chính thức và kinh nghiệm sử dụng thực tế của bản thân. Chào mừng bổ sung!

## Cơ bản về Dubbo

### Dubbo là gì?

![Trang web chính thức Dubbo](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/rpc/dubbo.org-overview.png)

[Apache Dubbo](https://github.com/apache/dubbo) |ˈdʌbəʊ| là một framework WEB và RPC mã nguồn mở hiệu suất cao, nhẹ.

Theo giới thiệu của [tài liệu chính thức Dubbo](https://dubbo.apache.org/zh/), Dubbo cung cấp sáu khả năng cốt lõi:

1. Gọi RPC hiệu suất cao dựa trên proxy giao diện.
2. Dung sai lỗi thông minh và cân bằng tải.
3. Đăng ký và khám phá dịch vụ tự động.
4. Khả năng mở rộng cao.
5. Lập lịch luồng giao thông thời gian chạy.
6. Quản trị và vận hành dịch vụ trực quan.

![Sáu khả năng cốt lõi mà Dubbo cung cấp](https://oss.javaguide.cn/%E6%BA%90%E7%A0%81/dubbo/dubbo%E6%8F%90%E4%BE%9B%E7%9A%84%E5%85%AD%E5%A4%A7%E6%A0%B8%E5%BF%83%E8%83%BD%E5%8A%9B.png)

Nói một cách đơn giản: **Dubbo không chỉ có thể giúp chúng ta gọi dịch vụ từ xa, mà còn cung cấp một số tính năng sẵn dùng khác như cân bằng tải thông minh.**

Dubbo hiện đã có gần 34.4k Star.

Trong **hoạt động bình chọn dự án mã nguồn mở Trung Quốc OSC năm 2020**, Dubbo xếp thứ 7 trong danh mục dự án framework phát triển và thành phần cơ sở. So với vài năm trước, mức độ nổi tiếng và xếp hạng có phần giảm sút.

![](https://oss.javaguide.cn/%E6%BA%90%E7%A0%81/dubbo/image-20210107153159545.png)

Dubbo được Alibaba mã nguồn mở, sau đó gia nhập Apache. Chính sự ra đời của Dubbo đã khiến ngày càng nhiều công ty bắt đầu sử dụng và chấp nhận kiến trúc phân tán.

### Tại sao nên dùng Dubbo?

Cùng với sự phát triển của Internet, quy mô website ngày càng lớn, số lượng người dùng ngày càng nhiều. Kiến trúc ứng dụng đơn lẻ, kiến trúc ứng dụng dọc không đáp ứng được nhu cầu của chúng ta, lúc này kiến trúc dịch vụ phân tán ra đời.

Dưới kiến trúc dịch vụ phân tán, hệ thống được tách thành các dịch vụ khác nhau như dịch vụ SMS, dịch vụ bảo mật, mỗi dịch vụ độc lập cung cấp một dịch vụ cốt lõi nào đó của hệ thống.

Chúng ta có thể sử dụng Java RMI (Java Remote Method Invocation), Hessian — các framework hỗ trợ gọi từ xa — để đơn giản hóa việc expose và tham chiếu dịch vụ từ xa. Nhưng! Khi ngày càng nhiều dịch vụ ra đời, quan hệ gọi dịch vụ ngày càng phức tạp. Khi áp lực truy cập ứng dụng ngày càng lớn, nhu cầu về cân bằng tải và giám sát dịch vụ cũng trở nên cấp bách. Chúng ta có thể dùng phần cứng như F5 để làm cân bằng tải, nhưng điều đó làm tăng chi phí và có rủi ro điểm lỗi đơn.

Tuy nhiên, sự ra đời của Dubbo đã giải quyết các vấn đề trên. **Dubbo giúp chúng ta giải quyết những vấn đề gì?**

1. **Cân bằng tải**: Khi cùng một dịch vụ được triển khai trên các máy khác nhau, nên gọi dịch vụ trên máy nào.
2. **Tạo chuỗi gọi dịch vụ**: Khi hệ thống phát triển, ngày càng nhiều dịch vụ, quan hệ phụ thuộc giữa các dịch vụ trở nên phức tạp rối rắm, thậm chí không phân biệt được ứng dụng nào cần khởi động trước ứng dụng nào, ngay cả kiến trúc sư cũng không thể mô tả đầy đủ quan hệ kiến trúc ứng dụng. Dubbo có thể giải quyết cho chúng ta cách các dịch vụ gọi lẫn nhau.
3. **Thống kê áp lực truy cập và thời gian dịch vụ, lập lịch và quản trị tài nguyên**: Quản lý dung lượng cụm theo thời gian thực dựa trên áp lực truy cập, nâng cao hiệu suất sử dụng cụm.
4. ……

![Tổng quan khả năng Dubbo](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/rpc/dubbo-features-overview.jpg)

Ngoài ra, Dubbo ngoài việc có thể được áp dụng trong hệ thống phân tán, còn có thể được áp dụng trong hệ thống microservice đang rất phổ biến hiện nay. Tuy nhiên, vì Spring Cloud được sử dụng rộng rãi hơn trong microservice, tôi cho rằng thông thường khi nhắc đến Dubbo, phần lớn là trong bối cảnh hệ thống phân tán.

**Chúng ta vừa đề cập đến khái niệm phân tán, dưới đây hãy giới thiệu thêm về phân tán là gì và tại sao cần phân tán?**

## Cơ bản về phân tán

### Phân tán là gì?

Phân tán hay còn gọi là SOA phân tán, điều quan trọng là hướng dịch vụ. Nói đơn giản, phân tán là chúng ta chia toàn bộ hệ thống thành các dịch vụ khác nhau, sau đó đặt các dịch vụ này lên các máy chủ khác nhau để giảm áp lực cho dịch vụ đơn lẻ, nâng cao khả năng đồng thời và hiệu suất. Ví dụ hệ thống thương mại điện tử có thể được chia đơn giản thành hệ thống đơn hàng, hệ thống sản phẩm, hệ thống đăng nhập, v.v. Mỗi dịch vụ sau khi tách ra có thể được triển khai trên các máy khác nhau, nếu lượng truy cập của một dịch vụ nào đó khá lớn thì cũng có thể triển khai dịch vụ đó đồng thời trên nhiều máy.

![Sơ đồ minh họa giao dịch phân tán](https://oss.javaguide.cn/java-guide-blog/%E5%88%86%E5%B8%83%E5%BC%8F%E4%BA%8B%E5%8A%A1%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

### Tại sao cần phân tán?

Từ góc độ phát triển, code của ứng dụng đơn lẻ đều tập trung ở một chỗ, còn code của hệ thống phân tán được tách theo nghiệp vụ. Vì vậy, mỗi team có thể chịu trách nhiệm phát triển một dịch vụ, điều này nâng cao hiệu quả phát triển. Ngoài ra, code được tách theo nghiệp vụ cũng dễ bảo trì và mở rộng hơn.

Ngoài ra, tôi cho rằng việc tách hệ thống thành phân tán không chỉ thuận tiện cho việc mở rộng và bảo trì hệ thống, mà còn nâng cao hiệu suất toàn bộ hệ thống. Hãy nghĩ xem? Chia toàn bộ hệ thống thành các dịch vụ/hệ thống khác nhau, sau đó mỗi dịch vụ/hệ thống riêng biệt được triển khai trên một máy chủ, chẳng phải điều đó nâng cao hiệu suất hệ thống rất nhiều hay sao?

## Kiến trúc Dubbo

### Các vai trò cốt lõi trong kiến trúc Dubbo là gì?

[Chương thiết kế framework trong tài liệu chính thức](https://dubbo.apache.org/zh/docs/v2.7/dev/design/) đã giới thiệu rất chi tiết, tôi chỉ nhắc lại một số điểm khá quan trọng ở đây.

![dubbo-relation](https://oss.javaguide.cn/%E6%BA%90%E7%A0%81/dubbo/dubbo-relation.jpg)

Giới thiệu ngắn gọn về các node trên và mối quan hệ giữa chúng:

- **Container:** Container chạy dịch vụ, chịu trách nhiệm load và chạy service provider. Bắt buộc.
- **Provider:** Service provider expose dịch vụ, sẽ đăng ký dịch vụ của mình cung cấp lên registry center. Bắt buộc.
- **Consumer:** Service consumer gọi dịch vụ từ xa, sẽ đăng ký subscribe dịch vụ mà mình cần lên registry center. Bắt buộc.
- **Registry:** Registry center đăng ký và khám phá dịch vụ. Registry center sẽ trả về danh sách địa chỉ service provider cho consumer. Không bắt buộc.
- **Monitor:** Monitor center thống kê số lần gọi dịch vụ và thời gian gọi. Service consumer và provider sẽ định kỳ gửi dữ liệu thống kê đến monitor center. Không bắt buộc.

### Bạn có hiểu khái niệm Invoker trong Dubbo không?

`Invoker` là một khái niệm rất quan trọng trong mô hình domain của Dubbo, nếu bạn đã đọc source code Dubbo, bạn sẽ thấy nó vô số lần. Ví dụ trong phần source code cân bằng tải mà tôi sắp đề cập có rất nhiều bóng dáng của `Invoker`.

Nói đơn giản, `Invoker` là sự trừu tượng hóa của Dubbo đối với lời gọi từ xa.

![dubbo_rpc_invoke.jpg](https://oss.javaguide.cn/java-guide-blog/dubbo_rpc_invoke.jpg)

Theo cách nói của Dubbo chính thức, `Invoker` được chia thành:

- `Invoker` cung cấp dịch vụ
- `Invoker` tiêu thụ dịch vụ

Giả sử chúng ta cần gọi một phương thức từ xa, chúng ta cần dynamic proxy để che giấu các chi tiết của lời gọi từ xa phải không! Các chi tiết mà chúng ta che giấu đó phụ thuộc vào triển khai `Invoker` tương ứng, `Invoker` thực hiện lời gọi dịch vụ từ xa thực sự.

### Bạn có hiểu nguyên lý hoạt động của Dubbo không?

Hình dưới đây là thiết kế tổng thể của Dubbo, từ dưới lên trên được chia thành mười tầng, các tầng đều phụ thuộc một chiều.

> Phần nền xanh nhạt bên trái là các giao diện mà service consumer sử dụng, phần nền xanh lá nhạt bên phải là các giao diện mà service provider sử dụng, phần trên trục giữa là các giao diện mà cả hai bên đều dùng.

![dubbo-framework](https://oss.javaguide.cn/source-code/dubbo/dubbo-framework.jpg)

- **Tầng cấu hình config**: Cấu hình liên quan đến Dubbo. Hỗ trợ cấu hình bằng code, đồng thời cũng hỗ trợ cấu hình dựa trên Spring, lấy `ServiceConfig`, `ReferenceConfig` làm trung tâm.
- **Tầng proxy dịch vụ proxy**: Một chìa khóa để gọi phương thức từ xa giống như gọi phương thức cục bộ, quá trình gọi thực sự phụ thuộc vào proxy class, lấy `ServiceProxy` làm trung tâm.
- **Tầng registry center registry**: Đóng gói đăng ký và khám phá địa chỉ dịch vụ.
- **Tầng định tuyến cụm cluster**: Đóng gói định tuyến và cân bằng tải của nhiều provider, cầu nối với registry center, lấy `Invoker` làm trung tâm.
- **Tầng giám sát monitor**: Giám sát số lần gọi RPC và thời gian gọi, lấy `Statistics` làm trung tâm.
- **Tầng gọi từ xa protocol**: Đóng gói lời gọi RPC, lấy `Invocation`, `Result` làm trung tâm.
- **Tầng trao đổi thông tin exchange**: Đóng gói mô hình request-response, chuyển đồng bộ thành bất đồng bộ, lấy `Request`, `Response` làm trung tâm.
- **Tầng truyền tải mạng transport**: Trừu tượng hóa mina và netty thành giao diện thống nhất, lấy `Message` làm trung tâm.
- **Tầng serialization dữ liệu serialize**: Serialize dữ liệu cần được truyền qua mạng.

### Bạn có hiểu cơ chế SPI của Dubbo không? Cách mở rộng triển khai mặc định trong Dubbo?

Cơ chế SPI (Service Provider Interface) được sử dụng rộng rãi trong các dự án mã nguồn mở, nó có thể giúp chúng ta tìm kiếm động các triển khai của dịch vụ/chức năng (ví dụ như chiến lược cân bằng tải).

Nguyên lý cụ thể của SPI như sau: Chúng ta đặt các lớp triển khai của giao diện vào file cấu hình, trong quá trình chạy chương trình chúng ta đọc file cấu hình, load các lớp triển khai thông qua reflection. Như vậy, chúng ta có thể thay thế động lớp triển khai của giao diện trong thời gian chạy. Tư tưởng tương tự như tách coupling IoC.

Java bản thân đã cung cấp triển khai cơ chế SPI. Tuy nhiên, Dubbo không dùng trực tiếp, mà tăng cường cơ chế SPI gốc của Java để đáp ứng tốt hơn các nhu cầu của mình.

**Vậy làm thế nào để mở rộng triển khai mặc định trong Dubbo?**

Ví dụ nếu chúng ta muốn triển khai chiến lược cân bằng tải của riêng mình, chúng ta tạo lớp triển khai tương ứng `XxxLoadBalance` triển khai giao diện `LoadBalance` hoặc lớp `AbstractLoadBalance`.

```java
package com.xxx;

import org.apache.dubbo.rpc.cluster.LoadBalance;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.RpcException;

public class XxxLoadBalance implements LoadBalance {
    public <T> Invoker<T> select(List<Invoker<T>> invokers, Invocation invocation) throws RpcException {
        // ...
    }
}
```

Chúng ta ghi đường dẫn của lớp triển khai này vào file `META-INF/dubbo/org.apache.dubbo.rpc.cluster.LoadBalance` trong thư mục `resources` là xong.

```java
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxLoadBalance.java (实现LoadBalance接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.LoadBalance (纯文本文件，内容为：xxx=com.xxx.XxxLoadBalance)
```

`org.apache.dubbo.rpc.cluster.LoadBalance`

```plain
xxx=com.xxx.XxxLoadBalance
```

Còn nhiều lựa chọn có thể mở rộng khác, bạn có thể tìm thấy trong [tài liệu chính thức](https://cn.dubbo.apache.org/zh-cn/overview/home/).

### Bạn có biết kiến trúc microkernel của Dubbo không?

Dubbo áp dụng mô hình Microkernel (vi nhân) + Plugin (plugin), nói đơn giản là kiến trúc microkernel. Microkernel chỉ chịu trách nhiệm lắp ghép các plugin.

**Kiến trúc microkernel là gì?** Cuốn sách 《Software Architecture Patterns》 giới thiệu như sau:

> Mẫu kiến trúc microkernel (đôi khi được gọi là mẫu kiến trúc plugin) là một mẫu tự nhiên để triển khai các ứng dụng dựa trên sản phẩm. Ứng dụng dựa trên sản phẩm là những ứng dụng đã được đóng gói và có các phiên bản khác nhau, có thể tải xuống như plugin của bên thứ ba. Sau đó, nhiều công ty cũng phát triển và phát hành các ứng dụng thương mại nội bộ của mình như phần mềm ứng dụng có số phiên bản, mô tả và plugin có thể tải. Hệ thống microkernel cho phép người dùng thêm các ứng dụng bổ sung như plugin vào ứng dụng cốt lõi, từ đó cung cấp khả năng mở rộng và tách biệt chức năng.

Kiến trúc microkernel bao gồm hai loại thành phần: **hệ thống cốt lõi (core system)** và **module plugin (plug-in modules)**.

![](https://oss.javaguide.cn/source-code/dubbo/%E5%BE%AE%E5%86%85%E6%A0%B8%E6%9E%B6%E6%9E%84%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

Hệ thống cốt lõi cung cấp khả năng cốt lõi mà hệ thống cần, module plugin có thể mở rộng chức năng của hệ thống. Do đó, hệ thống dựa trên kiến trúc microkernel rất dễ mở rộng chức năng.

Một số IDE phổ biến mà chúng ta thấy đều có thể coi là được thiết kế dựa trên kiến trúc microkernel. Hầu hết các IDE như IDEA, VSCode đều cung cấp plugin để làm phong phú thêm chức năng của mình.

Chính vì Dubbo dựa trên kiến trúc microkernel, mới cho phép chúng ta tùy ý thay thế các tính năng của Dubbo. Ví dụ nếu bạn cảm thấy triển khai module serialization của Dubbo không đáp ứng yêu cầu của mình, không sao cả! Bạn tự triển khai một module serialization là được!

Thông thường, microkernel sẽ sử dụng các cách như Factory, IoC, OSGi để quản lý vòng đời plugin. Dubbo không muốn phụ thuộc vào IoC container như Spring, cũng không muốn tự tạo một IoC container nhỏ (over-engineering), vì vậy đã áp dụng cách quản lý plugin Factory đơn giản nhất: **Cơ chế mở rộng SPI tiêu chuẩn JDK** (`java.util.ServiceLoader`).

### Một số câu hỏi tự kiểm tra nhỏ về kiến trúc Dubbo

#### Vai trò của registry center là gì?

Registry center chịu trách nhiệm đăng ký và tra cứu địa chỉ dịch vụ, tương đương với dịch vụ thư mục. Service provider và consumer chỉ tương tác với registry center khi khởi động.

#### Sau khi service provider bị down, registry center sẽ làm gì?

Registry center sẽ ngay lập tức push sự kiện thông báo cho consumer.

#### Vai trò của monitor center là gì?

Monitor center chịu trách nhiệm thống kê số lần gọi và thời gian gọi của từng dịch vụ.

#### Nếu cả registry center và monitor center đều bị down, các dịch vụ có bị sập không?

Không. Cả hai đều down cũng không ảnh hưởng đến provider và consumer đang chạy, vì consumer đã cache danh sách provider cục bộ. Registry center và monitor center đều là tùy chọn, service consumer có thể kết nối trực tiếp với service provider.

## Chiến lược cân bằng tải của Dubbo

### Cân bằng tải là gì?

Trước tiên hãy xem giải thích mang tính chính thức hơn một chút. Đoạn dưới đây được trích từ định nghĩa cân bằng tải trên Wikipedia:

> Cân bằng tải cải thiện phân phối tải công việc trên nhiều tài nguyên tính toán (ví dụ như máy tính, cụm máy tính, liên kết mạng, bộ vi xử lý trung tâm hoặc ổ đĩa). Cân bằng tải nhằm mục đích tối ưu hóa sử dụng tài nguyên, tối đa hóa thông lượng, tối thiểu hóa thời gian phản hồi, và tránh quá tải bất kỳ tài nguyên đơn lẻ nào. Sử dụng nhiều thành phần với cân bằng tải thay vì một thành phần duy nhất có thể tăng độ tin cậy và tính khả dụng thông qua dự phòng. Cân bằng tải thường liên quan đến phần mềm hoặc phần cứng chuyên dụng.

**Những gì trên có thể không dễ hiểu, hãy nói một cách thông tục hơn.**

Một dịch vụ nào đó trong hệ thống của chúng ta có lượng truy cập đặc biệt lớn, chúng ta đã triển khai dịch vụ này trên nhiều máy chủ, khi client gửi yêu cầu, nhiều máy chủ đều có thể xử lý yêu cầu này. Vậy, cách chọn đúng máy chủ xử lý yêu cầu là rất quan trọng. Giả sử bạn chỉ để một máy chủ xử lý yêu cầu cho dịch vụ đó, thì ý nghĩa của việc triển khai dịch vụ đó trên nhiều máy chủ không còn nữa. Cân bằng tải là để tránh một máy chủ duy nhất phải phản hồi cùng một yêu cầu, dễ gây ra sự cố máy chủ, crash, v.v. Từ bốn chữ "cân bằng tải" chúng ta có thể cảm nhận rõ ý nghĩa của nó.

### Dubbo cung cấp những chiến lược cân bằng tải nào?

Trong cân bằng tải cụm, Dubbo cung cấp nhiều chiến lược cân bằng, mặc định là gọi ngẫu nhiên `random`. Chúng ta cũng có thể tự mở rộng chiến lược cân bằng tải (tham khảo cơ chế SPI của Dubbo).

Trong Dubbo, tất cả các lớp triển khai cân bằng tải đều kế thừa từ `AbstractLoadBalance`, lớp này triển khai giao diện `LoadBalance` và đóng gói một số logic chung.

```java
public abstract class AbstractLoadBalance implements LoadBalance {

    static int calculateWarmupWeight(int uptime, int warmup, int weight) {
    }

    @Override
    public <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) {
    }

    protected abstract <T> Invoker<T> doSelect(List<Invoker<T>> invokers, URL url, Invocation invocation);


    int getWeight(Invoker<?> invoker, Invocation invocation) {

    }
}
```

Các lớp triển khai của `AbstractLoadBalance` bao gồm những lớp sau:

![](https://oss.javaguide.cn/java-guide-blog/image-20210326105257812.png)

Tài liệu chính thức giới thiệu phần cân bằng tải này rất chi tiết, khuyến nghị bạn xem, địa chỉ: [https://dubbo.apache.org/zh/docs/v2.7/dev/source/loadbalance/#m-zhdocsv27devsourceloadbalance](https://dubbo.apache.org/zh/docs/v2.7/dev/source/loadbalance/#m-zhdocsv27devsourceloadbalance) .

#### RandomLoadBalance

Chọn ngẫu nhiên theo trọng số (triển khai thuật toán random có trọng số). Đây là chiến lược cân bằng tải mặc định của Dubbo.

Nguyên lý triển khai cụ thể của `RandomLoadBalance` rất đơn giản, giả sử có hai máy chủ S1, S2 cung cấp cùng dịch vụ, trọng số của S1 là 7, trọng số của S2 là 3.

Chúng ta phân phối các giá trị trọng số này trên khoảng tọa độ sẽ được: S1->[0, 7), S2->[7, 10). Chúng ta tạo số ngẫu nhiên trong khoảng [0, 10), số ngẫu nhiên rơi vào khoảng nào thì chọn máy chủ tương ứng để xử lý yêu cầu.

![RandomLoadBalance](https://oss.javaguide.cn/java-guide-blog/%20RandomLoadBalance.png)

Source code của `RandomLoadBalance` rất đơn giản, dành vài phút đọc qua.

> Source code dưới đây đến từ phiên bản mới nhất 2.7.9 trên nhánh master của Dubbo.

```java
public class RandomLoadBalance extends AbstractLoadBalance {

    public static final String NAME = "random";

    @Override
    protected <T> Invoker<T> doSelect(List<Invoker<T>> invokers, URL url, Invocation invocation) {

        int length = invokers.size();
        boolean sameWeight = true;
        int[] weights = new int[length];
        int totalWeight = 0;
        // 下面这个for循环的主要作用就是计算所有该服务的提供者的权重之和 totalWeight（），
        // 除此之外，还会检测每个服务提供者的权重是否相同
        for (int i = 0; i < length; i++) {
            int weight = getWeight(invokers.get(i), invocation);
            totalWeight += weight;
            weights[i] = totalWeight;
            if (sameWeight && totalWeight != weight * (i + 1)) {
                sameWeight = false;
            }
        }
        if (totalWeight > 0 && !sameWeight) {
            // 随机生成一个 [0, totalWeight) 区间内的数字
            int offset = ThreadLocalRandom.current().nextInt(totalWeight);
            // 判断会落在哪个服务提供者的区间
            for (int i = 0; i < length; i++) {
                if (offset < weights[i]) {
                    return invokers.get(i);
                }
            }

        return invokers.get(ThreadLocalRandom.current().nextInt(length));
    }

}

```

#### LeastActiveLoadBalance

`LeastActiveLoadBalance` dịch trực tiếp là **cân bằng tải số hoạt động tối thiểu**.

Cái tên này hơi không trực quan, nếu không đọc kỹ định nghĩa về số hoạt động trong tài liệu chính thức, bạn sẽ không biết cái này dùng để làm gì.

Hãy nói thế này! Ban đầu số hoạt động của tất cả service provider đều là 0 (mỗi phương thức cụ thể của mỗi service provider có một số hoạt động tương ứng, tôi sẽ đề cập trong source code phần sau), mỗi khi nhận được một yêu cầu, số hoạt động của service provider tương ứng tăng +1, khi yêu cầu này được xử lý xong, số hoạt động giảm -1.

Vì vậy, **Dubbo cho rằng ai có số hoạt động càng ít, tốc độ xử lý càng nhanh, hiệu suất càng tốt, khi đó tôi sẽ ưu tiên chuyển yêu cầu cho service provider có số hoạt động ít.**

**Nếu có nhiều service provider có số hoạt động bằng nhau thì sao?**

Đơn giản, thì chạy lại một lần `RandomLoadBalance`.

```java
public class LeastActiveLoadBalance extends AbstractLoadBalance {

    public static final String NAME = "leastactive";

    @Override
    protected <T> Invoker<T> doSelect(List<Invoker<T>> invokers, URL url, Invocation invocation) {
        int length = invokers.size();
        int leastActive = -1;
        int leastCount = 0;
        int[] leastIndexes = new int[length];
        int[] weights = new int[length];
        int totalWeight = 0;
        int firstWeight = 0;
        boolean sameWeight = true;
        // 这个 for 循环的主要作用是遍历 invokers 列表，找出活跃数最小的 Invoker
        // 如果有多个 Invoker 具有相同的最小活跃数，还会记录下这些 Invoker 在 invokers 集合中的下标，并累加它们的权重，比较它们的权重值是否相等
        for (int i = 0; i < length; i++) {
            Invoker<T> invoker = invokers.get(i);
            // 获取 invoker 对应的活跃(active)数
            int active = RpcStatus.getStatus(invoker.getUrl(), invocation.getMethodName()).getActive();
            int afterWarmup = getWeight(invoker, invocation);
            weights[i] = afterWarmup;
            if (leastActive == -1 || active < leastActive) {
                leastActive = active;
                leastCount = 1;
                leastIndexes[0] = i;
                totalWeight = afterWarmup;
                firstWeight = afterWarmup;
                sameWeight = true;
            } else if (active == leastActive) {
                leastIndexes[leastCount++] = i;
                totalWeight += afterWarmup;
                if (sameWeight && afterWarmup != firstWeight) {
                    sameWeight = false;
                }
            }
        }
       // 如果只有一个 Invoker 具有最小的活跃数，此时直接返回该 Invoker 即可
        if (leastCount == 1) {
            return invokers.get(leastIndexes[0]);
        }
        // 如果有多个 Invoker 具有相同的最小活跃数，但它们之间的权重不同
        // 这里的处理方式就和  RandomLoadBalance 一致了
        if (!sameWeight && totalWeight > 0) {
            int offsetWeight = ThreadLocalRandom.current().nextInt(totalWeight);
            for (int i = 0; i < leastCount; i++) {
                int leastIndex = leastIndexes[i];
                offsetWeight -= weights[leastIndex];
                if (offsetWeight < 0) {
                    return invokers.get(leastIndex);
                }
            }
        }
        return invokers.get(leastIndexes[ThreadLocalRandom.current().nextInt(leastCount)]);
    }
}

```

Số hoạt động được lưu thông qua một `ConcurrentMap` trong `RpcStatus`, dựa vào URL và tên phương thức được gọi của service provider, chúng ta có thể lấy được số hoạt động tương ứng. Tức là số hoạt động của mỗi phương thức trong service provider là độc lập với nhau.

```java
public class RpcStatus {

    private static final ConcurrentMap<String, ConcurrentMap<String, RpcStatus>> METHOD_STATISTICS =
            new ConcurrentHashMap<String, ConcurrentMap<String, RpcStatus>>();

   public static RpcStatus getStatus(URL url, String methodName) {
        String uri = url.toIdentityString();
        ConcurrentMap<String, RpcStatus> map = METHOD_STATISTICS.computeIfAbsent(uri, k -> new ConcurrentHashMap<>());
        return map.computeIfAbsent(methodName, k -> new RpcStatus());
    }
    public int getActive() {
        return active.get();
    }

}
```

#### ConsistentHashLoadBalance

`ConsistentHashLoadBalance` chắc bạn cũng không xa lạ, trong phân vùng cơ sở dữ liệu, các cụm khác nhau, chiến lược cân bằng tải này được sử dụng thường xuyên.

`ConsistentHashLoadBalance` tức là **chiến lược cân bằng tải Consistent Hash**. Trong `ConsistentHashLoadBalance` không có khái niệm trọng số, cụ thể service provider nào xử lý yêu cầu được quyết định bởi tham số yêu cầu của bạn, tức là các yêu cầu có cùng tham số luôn được gửi đến cùng một service provider.

![](https://oss.javaguide.cn/java-guide-blog/consistent-hash-data-incline.jpg)

Ngoài ra, để tránh vấn đề nghiêng dữ liệu (node không đủ phân tán, lượng lớn yêu cầu rơi vào cùng một node), Dubbo cũng giới thiệu khái niệm node ảo. Thông qua node ảo có thể làm cho các node phân tán hơn, cân bằng hiệu quả lượng yêu cầu của từng node.

![](https://oss.javaguide.cn/java-guide-blog/consistent-hash-invoker.jpg)

Tài liệu chính thức có phân tích source code chi tiết: [https://dubbo.apache.org/zh/docs/v2.7/dev/source/loadbalance/#23-consistenthashloadbalance](https://dubbo.apache.org/zh/docs/v2.7/dev/source/loadbalance/#23-consistenthashloadbalance) . Còn có một [PR#5440](https://github.com/apache/dubbo/pull/5440) liên quan để sửa một số Bug tồn tại trong ConsistentHashLoadBalance phiên bản cũ. Bạn nào quan tâm có thể dành thêm thời gian nghiên cứu. Tôi sẽ không phân tích nhiều ở đây, bài tập này để lại cho các bạn!

#### RoundRobinLoadBalance

Cân bằng tải vòng robin có trọng số.

Vòng robin là phân phối yêu cầu lần lượt cho từng service provider. Vòng robin có trọng số là trên cơ sở vòng robin, để nhiều yêu cầu hơn rơi vào service provider có trọng số lớn hơn. Ví dụ giả sử có hai máy chủ S1, S2 cung cấp cùng dịch vụ, trọng số của S1 là 7, trọng số của S2 là 3.

Nếu chúng ta có 10 yêu cầu, thì 7 yêu cầu sẽ được S1 xử lý, 3 yêu cầu được S2 xử lý.

Nhưng, nếu là `RandomLoadBalance` thì rất có thể có trường hợp trong 10 yêu cầu có 9 yêu cầu đều được S1 xử lý (vấn đề xác suất).

Code triển khai của `RoundRobinLoadBalance` trong Dubbo đã được sửa đổi và xây dựng lại nhiều lần, phiên bản Dubbo-2.6.5 của `RoundRobinLoadBalance` là thuật toán smooth weighted round robin.

## Giao thức serialization của Dubbo

### Dubbo hỗ trợ những phương thức serialization nào?

![Các giao thức serialization mà Dubbo hỗ trợ](https://oss.javaguide.cn/github/javaguide/csdn/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM0MzM3Mjcy,size_16,color_FFFFFF,t_70-20230309234143460.png)

Dubbo hỗ trợ nhiều phương thức serialization: serialization tích hợp sẵn của JDK, hessian2, JSON, Kryo, FST, Protostuff, ProtoBuf, v.v.

Phương thức serialization mặc định mà Dubbo sử dụng là hessian2.

### Hãy nói về những gì bạn hiểu về các giao thức serialization này?

Thông thường chúng ta sẽ không sử dụng trực tiếp phương thức serialization tích hợp sẵn của JDK. Nguyên nhân chính có hai:

1. **Không hỗ trợ gọi đa ngôn ngữ**: Nếu gọi dịch vụ phát triển bằng ngôn ngữ khác thì không hỗ trợ.
2. **Hiệu suất kém**: Hiệu suất thấp hơn so với các framework serialization khác, nguyên nhân chính là kích thước mảng byte sau khi serialize khá lớn, dẫn đến chi phí truyền tải tăng.

JSON serialization do vấn đề hiệu suất, chúng ta thường cũng không cân nhắc sử dụng.

Như Protostuff, ProtoBuf, hessian2 đều là các phương thức serialization đa ngôn ngữ, nếu có nhu cầu đa ngôn ngữ thì có thể cân nhắc sử dụng.

Kryo và FST là hai phương thức serialization mà Dubbo giới thiệu sau này, hiệu suất rất tốt. Tuy nhiên, cả hai đều dành riêng cho ngôn ngữ Java. Trong một bài viết trên trang web chính thức của Dubbo có đề cập đến việc khuyến nghị sử dụng Kryo làm phương thức serialization cho môi trường production.

Trong tài liệu chính thức của Dubbo còn có một [biểu đồ so sánh hiệu suất của các giao thức serialization](https://dubbo.apache.org/zh/docs/v2.7/user/serialization/#m-zhdocsv27userserialization) để tham khảo.

![So sánh hiệu suất giao thức serialization](https://oss.javaguide.cn/github/javaguide/distributed-system/rpc/dubbo-serialization-protocol-performance-comparison.png)

<!-- @include: @article-footer.snippet.md -->
