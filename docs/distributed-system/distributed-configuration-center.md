---
title: Tổng hợp câu hỏi phỏng vấn Distributed Configuration Center
description: Phân tích sâu nguyên lý cốt lõi và các điểm phỏng vấn tần suất cao của distributed configuration center, bao gồm so sánh và lựa chọn Apollo, Nacos, Spring Cloud Config, cơ chế push config (long polling/gRPC), gray release, thiết kế high availability, v.v.
category: Distributed
keywords:
  - Configuration center
head:
  - - meta
    - name: keywords
      content: configuration center,distributed configuration center,Apollo,Nacos,Spring Cloud Config,configuration center interview questions,gray release,long polling
---

<!-- @include: @small-advertisement.snippet.md -->

## Tại sao phải dùng Configuration Center?

Trong microservice architecture, khi nghiệp vụ phát triển thường dẫn đến số service tăng, từ đó cấu hình chương trình (service address, database parameter, feature flag, v.v.) cũng tăng. Cách config file truyền thống có các vấn đề sau:

- **Không thể dynamic update**: Config đặt trong code repository, mỗi lần sửa phải deploy lại phiên bản mới mới có hiệu lực.
- **Bảo mật không đủ**: Sensitive config (database password, API Key) viết thẳng vào code repository dễ bị lộ.
- **Hiệu lực kém**: Dù có sửa được config file, thường vẫn phải restart service mới có hiệu lực.
- **Thiếu permission control**: Không thể kiểm soát fine-grained permission cho các thao tác xem, sửa, publish config.
- **Config phân tán khó quản lý**: Config của multi-environment (dev/test/prod), multi-cluster phân tán khắp nơi, khó unified maintenance.

Ngoài ra, configuration center thường cung cấp các khả năng nâng cao sau:

- **Version management**: Ghi lại người sửa, thời gian sửa, nội dung sửa của mỗi lần thay đổi config, hỗ trợ rollback một nút.
- **Gray release**: Trước tiên push config cho một phần instance để verify, giảm rủi ro thay đổi (Apollo, Nacos 1.1.0+ hỗ trợ).

![Apollo Configuration Center](/images/github/javaguide/config-center/view-release-history.png)

## Các Configuration Center phổ biến là gì? Làm thế nào chọn?

| Phương án                                                                          | Trạng thái    | Đặc điểm                                                                  |
| ---------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------- |
| [Spring Cloud Config](https://cloud.spring.io/spring-cloud-config/reference/html/) | Hoạt động     | Hỗ trợ native trong Spring ecosystem, lưu dựa trên Git                    |
| [Nacos](https://github.com/alibaba/nacos)                                          | Hoạt động     | Alibaba open source, Configuration center + Service discovery gộp làm một |
| [Apollo](https://github.com/apolloconfig/apollo)                                   | Hoạt động     | Ctrip open source, tính năng quản lý config đầy đủ nhất                   |
| K8s ConfigMap                                                                      | Hoạt động     | Giải pháp Kubernetes native                                               |
| Disconf / Qconf                                                                    | Ngừng bảo trì | Không khuyến nghị dùng                                                    |

**Gợi ý lựa chọn**:

- Chỉ cần configuration center → **Apollo** (tính năng đầy đủ nhất) hoặc **Nacos** (dễ bắt đầu hơn)
- Cần configuration center + service discovery → **Nacos**
- Trong Spring Cloud ecosystem và muốn đơn giản → **Spring Cloud Config**
- Môi trường Kubernetes → **K8s ConfigMap mount + application layer file monitoring** (do Kubelet sync Volume có độ trễ 1~2 phút, cần tích hợp inotify hoặc Spring Cloud Kubernetes để hot reload)

**Apollo vs Nacos vs Spring Cloud Config**

> **Ghi chú phiên bản**: So sánh dưới đây dựa trên Apollo 2.x, Nacos 2.x, Spring Cloud Config 3.x

| Tính năng               | Apollo                          | Nacos                                   | Spring Cloud Config                                    |
| ----------------------- | ------------------------------- | --------------------------------------- | ------------------------------------------------------ |
| Config UI               | Hỗ trợ (đầy đủ)                 | Hỗ trợ                                  | Không (thao tác qua Git)                               |
| Config có hiệu lực ngay | Hỗ trợ (long polling, trong 1s) | Hỗ trợ (gRPC long connection, trong 1s) | Bán real-time (cần trigger refresh hoặc Bus broadcast) |
| Version management      | Hỗ trợ native                   | Hỗ trợ native                           | Phụ thuộc Git                                          |
| Permission management   | Hỗ trợ (fine-grained)           | Hỗ trợ                                  | Phụ thuộc Git platform                                 |
| Gray release            | Hỗ trợ (đầy đủ)                 | Hỗ trợ (1.1.0+, cơ bản)                 | Không hỗ trợ                                           |
| Config rollback         | Hỗ trợ                          | Hỗ trợ                                  | Phụ thuộc Git                                          |
| Alert notification      | Hỗ trợ                          | Hỗ trợ                                  | Không hỗ trợ                                           |
| Multi-language          | Hỗ trợ (Open API)               | Hỗ trợ (Open API)                       | Chỉ Spring application                                 |
| Multi-environment       | Hỗ trợ                          | Hỗ trợ                                  | Cần nhiều Git repository                               |
| Dependency component    | MySQL + Eureka                  | Built-in storage (Derby/MySQL) + JRaft  | Git + optional message queue                           |

**So sánh sâu**:

1. **Apollo**: Tính năng quản lý config đầy đủ nhất (gray release, permission control, audit log), nhưng deployment complexity cao. Trong tình huống multi-environment (FAT/UAT/PROD) cần physical isolation, cần deploy độc lập Portal, Admin Service, Config Service và database cluster riêng — ops threshold trung bình đến cao.
2. **Nacos**: Configuration + Registry center gộp làm một, deployment đơn giản (single mode chỉ một Jar), nhưng gray release và các tính năng khác tương đối cơ bản.
3. **Spring Cloud Config**: Kiến trúc đơn giản nhất (dựa trên Git), nhưng real-time kém, cần thêm component để tự động refresh.

## Các điểm thiết kế cốt lõi của Configuration Center

Khi thiết kế hoặc lựa chọn configuration center, cần chú ý các khả năng sau:

### 1. Cơ chế push config

| Mode             | Real-time         | Tải server                                       | Implementation complexity | Tình huống áp dụng        |
| ---------------- | ----------------- | ------------------------------------------------ | ------------------------- | ------------------------- |
| **Push mode**    | Cao (millisecond) | Cao (cần duy trì connection)                     | Cao                       | Yêu cầu real-time mạnh    |
| **Pull mode**    | Thấp (giây~phút)  | Cao (polling vô ích)                             | Thấp                      | Config hiếm khi thay đổi  |
| **Long polling** | Trung-cao (1~30s) | Trung bình (áp lực memory lớn khi nhiều kết nối) | Trung bình                | **Phương án chính luồng** |

> **Giải thích cơ chế push**:
>
> - **Apollo**: Dùng HTTP long polling. Client gửi request, server nếu có thay đổi trả về ngay; không có thay đổi thì hold request (mặc định 30s), trong thời gian đó nếu có thay đổi respond ngay.
> - **Nacos 2.x**: Dùng gRPC long connection bidirectional stream. So với HTTP long polling của 1.x, gRPC connection nhẹ hơn, config thay đổi có thể push millisecond đến client chủ động.
>
> **Lưu ý**: Mặc dù long polling tiết kiệm CPU và network overhead hơn short polling, nhưng khi client scale lên hàng trăm nghìn, server cần maintain lượng lớn HTTP request đang hang (phụ thuộc vào Servlet AsyncContext) — vẫn có áp lực đáng kể lên memory và connection count limit.

### 2. Danh sách tính năng cần thiết

- **Permission control**: Xem, sửa, publish config cần authorized theo cấp bậc.
- **Audit log**: Ghi lại đầy đủ người thao tác, thời gian, nội dung thay đổi config.
- **Version management**: Mỗi lần publish tạo version number, hỗ trợ rollback về bất kỳ historical version nào.
- **Gray release**: Config trước tiên push đến một phần instance, sau khi verify xong mới full release.
- **Multi-environment isolation**: Config của các môi trường dev, test, prod được quản lý độc lập.
- **High availability deployment**: Configuration center bản thân cần cluster deployment, tránh single point of failure.

## Lấy Apollo làm ví dụ giới thiệu thiết kế Configuration Center

### Giới thiệu Apollo

Theo giới thiệu chính thức của Apollo:

> [Apollo](https://github.com/ctripcorp/apollo) là distributed configuration center do bộ phận framework của Ctrip phát triển. Có thể quản lý tập trung config của application trong các environment và cluster khác nhau. Sau khi config được sửa đổi có thể push real-time đến application side, đồng thời có các tính năng quản trị permission và process theo chuẩn. Phù hợp với tình huống microservice config management.
>
> Server dựa trên Spring Boot và Spring Cloud để phát triển, sau khi đóng gói có thể chạy trực tiếp mà không cần cài thêm application container như Tomcat.
>
> Java client không phụ thuộc bất kỳ framework nào, có thể chạy trong tất cả Java runtime environment, đồng thời cũng hỗ trợ tốt môi trường Spring/Spring Boot.

Các tính năng cốt lõi của Apollo:

- **Config thay đổi có hiệu lực ngay (hot release)**: Dựa trên long polling, trong 1s có thể nhận được config mới nhất.
- **Gray release**: Config chỉ push cho một phần application, giảm rủi ro thay đổi.
- **Deployment đơn giản**: Single environment chỉ phụ thuộc MySQL (Eureka có thể dùng built-in mode), nhưng multi-environment isolation deployment có complexity cao hơn.
- **Cross-language**: Cung cấp HTTP interface, không giới hạn ngôn ngữ lập trình.

Cách dùng Apollo xem [Apollo Official Usage Guide](https://www.apolloconfig.com/#/zh/).

### Phân tích kiến trúc Apollo

Basic model Apollo chính thức đưa ra:

![](https://img-blog.csdnimg.cn/a75ccb863e4a401d947c87bb14af7dc3.png)

1. User sửa/publish config trong Apollo configuration center.
2. Apollo configuration center thông báo application config đã thay đổi.
3. Application truy cập Apollo configuration center để lấy config mới nhất.

Official architecture diagram:

![](https://img-blog.csdnimg.cn/79c7445f9dbc45adb45699d40ef50f44.png)

### Mô tả Component

| Component          | Vai trò                                                        | Default port |
| ------------------ | -------------------------------------------------------------- | ------------ |
| **Portal**         | Web management interface, cung cấp quản lý config trực quan    | 8070         |
| **Client**         | Client SDK, cung cấp khả năng lấy config và lắng nghe thay đổi | -            |
| **Meta Server**    | HTTP proxy của Eureka, cùng process với Config Service         | 8080         |
| **Config Service** | Cung cấp interface đọc và push config, được Client gọi         | 8080         |
| **Admin Service**  | Cung cấp interface quản lý config, được Portal gọi             | 8090         |
| **Eureka**         | Service registry, Config/Admin Service đăng ký vào đây         | 8761         |
| **MySQL**          | Lưu config data và metadata                                    | 3306         |

### Core Flow

**Phía Client (lấy config)**:

1. Client khởi động truy cập Meta Server để lấy danh sách địa chỉ Config Service.
2. Client cache địa chỉ service cục bộ (vẫn khả dụng khi Eureka fail).
3. Client khởi tạo long polling request để lấy config.
4. Config Service sau khi phát hiện config thay đổi sẽ respond ngay.
5. Client cập nhật in-memory cache, trigger change callback và **async persist vào local file system** (mặc định tại `/opt/data/` hoặc `/opt/logs/`).

> **Disaster recovery mechanism**: Dù tất cả Config Service đều down và application restart, Client vẫn có thể đọc config đã được cache từ local disk để hoàn thành startup — đảm bảo application availability không phụ thuộc chặt vào configuration center.

**Phía Portal (publish config)**:

1. User sửa config trong Portal và click publish.
2. Portal gọi interface publish của Admin Service.
3. Admin Service ghi config vào MySQL và tạo publish version.
4. Config Service thông báo Client qua long polling rằng config đã thay đổi.
5. Client pull lại config mới nhất.

### Ví dụ sử dụng Client

Lấy config:

```java
Config config = ConfigService.getAppConfig();
String someKey = "someKeyFromDefaultNamespace";
String someDefaultValue = "someDefaultValueForTheKey";
String value = config.getProperty(someKey, someDefaultValue);
```

Lắng nghe thay đổi config:

```java
Config config = ConfigService.getAppConfig();
config.addChangeListener(new ConfigChangeListener() {
    @Override
    public void onChange(ConfigChangeEvent changeEvent) {
        // Xử lý thay đổi config
        for (String key : changeEvent.changedKeys()) {
            ConfigChange change = changeEvent.getChange(key);
            System.out.println(String.format(
                "Key: %s, Old: %s, New: %s",
                key, change.getOldValue(), change.getNewValue()));
        }
    }
});
```

## Tài liệu tham khảo

- [Tài liệu chính thức Nacos](https://nacos.io/zh-cn/docs/what-is-nacos.html)
- [Tài liệu chính thức Apollo](https://www.apolloconfig.com/#/zh/README)
- [Tài liệu chính thức Spring Cloud Config](https://cloud.spring.io/spring-cloud-config/reference/html/)
- [Nacos 1.1.0 phát hành, hỗ trợ gray config](https://nacos.io/zh-cn/blog/nacos%201.1.0.html)
- [Thực tiễn Apollo tại Youzan](https://mp.weixin.qq.com/s/Ge14UeY9Gm2Hrk--E47eJQ)
- [So sánh các lựa chọn microservice configuration center](https://www.itshangxp.com/spring-cloud/spring-cloud-config-center/)
