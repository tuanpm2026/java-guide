---
title: Giải thích chi tiết nguyên lý tự động cấu hình của SpringBoot
description: Phân tích chuyên sâu nguyên lý tự động cấu hình SpringBoot, giải thích @EnableAutoConfiguration, cơ chế tải SpringFactories và cách hoạt động của các annotation điều kiện.
category: Framework
tag:
  - SpringBoot
head:
  - - meta
    - name: keywords
      content: Spring Boot自动装配,AutoConfiguration,EnableAutoConfiguration,SpringFactories,条件注解,Starter,Spring Boot原理
---

> Tác giả：[Miki-byte-1024](https://github.com/Miki-byte-1024) & [Snailclimb](https://github.com/Snailclimb)

Mỗi khi được hỏi về Spring Boot, phỏng vấn viên rất hay đặt câu hỏi này: "Hãy trình bày nguyên lý tự động cấu hình của SpringBoot?"

Tôi nghĩ chúng ta có thể trả lời từ các góc độ sau:

1. SpringBoot tự động cấu hình là gì?
2. SpringBoot thực hiện tự động cấu hình như thế nào? Làm thế nào để tải theo nhu cầu?
3. Làm thế nào để tự tạo một Starter?

Do giới hạn về độ dài, bài viết này không đi sâu vào chi tiết. Các bạn cũng có thể dùng chế độ debug để xem trực tiếp mã nguồn phần tự động cấu hình của SpringBoot.

## Lời mở đầu

Những ai đã dùng Spring đều từng bị nỗi khiếp sợ cấu hình XML thống trị. Dù Spring sau này đã giới thiệu cấu hình dựa trên annotation, chúng ta vẫn cần dùng XML hoặc Java để cấu hình tường minh khi bật một số tính năng của Spring hoặc khi tích hợp các thư viện bên thứ ba.

Lấy ví dụ. Trước khi có Spring Boot, để viết một dịch vụ web RESTful, chúng ta cần thực hiện các cấu hình như sau.

```java
@Configuration
public class RESTConfiguration
{
    @Bean
    public View jsonTemplate() {
        MappingJackson2JsonView view = new MappingJackson2JsonView();
        view.setPrettyPrint(true);
        return view;
    }

    @Bean
    public ViewResolver viewResolver() {
        return new BeanNameViewResolver();
    }
}
```

`spring-servlet.xml`

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:context="http://www.springframework.org/schema/context"
    xmlns:mvc="http://www.springframework.org/schema/mvc"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
    http://www.springframework.org/schema/context/ http://www.springframework.org/schema/context/spring-context.xsd
    http://www.springframework.org/schema/mvc/ http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <context:component-scan base-package="com.howtodoinjava.demo" />
    <mvc:annotation-driven />

    <!-- JSON Support -->
    <bean name="viewResolver" class="org.springframework.web.servlet.view.BeanNameViewResolver"/>
    <bean name="jsonTemplate" class="org.springframework.web.servlet.view.json.MappingJackson2JsonView"/>

</beans>
```

Nhưng với dự án Spring Boot, chúng ta chỉ cần thêm các dependency liên quan, không cần cấu hình, chỉ cần chạy phương thức `main` bên dưới là xong.

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

Hơn nữa, thông qua file cấu hình toàn cục của Spring Boot là `application.properties` hoặc `application.yml`, chúng ta có thể thiết lập dự án như đổi số cổng, cấu hình thuộc tính JPA, v.v.

**Tại sao Spring Boot lại tiện dụng đến vậy?** Điều này nhờ vào cơ chế tự động cấu hình của nó. **Tự động cấu hình có thể nói là cốt lõi của Spring Boot, vậy tự động cấu hình thực sự là gì?**

## SpringBoot tự động cấu hình là gì?

Khi chúng ta nhắc đến tự động cấu hình hiện nay, thường hay liên hệ với Spring Boot. Nhưng thực ra Spring Framework đã triển khai tính năng này từ lâu. Spring Boot chỉ dựa trên nền tảng đó, thông qua cơ chế SPI, để tối ưu hóa thêm.

> SpringBoot định nghĩa một bộ chuẩn giao diện, bộ chuẩn này quy định: SpringBoot khi khởi động sẽ quét file `META-INF/spring.factories` trong các jar phụ thuộc bên ngoài, tải thông tin kiểu cấu hình trong file vào Spring container (liên quan đến cơ chế tải lớp JVM và kiến thức về Spring container), và thực thi các thao tác khác nhau được định nghĩa trong lớp đó. Đối với jar bên ngoài, chỉ cần tuân theo chuẩn do SpringBoot định nghĩa là có thể tích hợp chức năng của mình vào SpringBoot.
> Từ Spring Boot 3.0, đường dẫn của package cấu hình tự động đã được thay đổi từ `META-INF/spring.factories` sang `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`.

Nếu không có Spring Boot, khi cần tích hợp thư viện bên thứ ba, chúng ta phải cấu hình thủ công, rất phức tạp. Nhưng với Spring Boot, chúng ta chỉ cần thêm một starter là xong. Ví dụ nếu muốn dùng redis trong dự án, chỉ cần thêm starter tương ứng vào.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

Sau khi thêm starter, chúng ta chỉ cần một vài annotation và một số cấu hình đơn giản là có thể sử dụng các chức năng do component bên thứ ba cung cấp.

Theo quan điểm của tôi, tự động cấu hình có thể hiểu đơn giản là: **thông qua annotation hoặc một số cấu hình đơn giản, với sự trợ giúp của Spring Boot, chúng ta có thể triển khai một chức năng nào đó.**

## SpringBoot thực hiện tự động cấu hình như thế nào?

Hãy xem annotation cốt lõi của SpringBoot là `SpringBootApplication`.

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
<1.>@SpringBootConfiguration
<2.>@ComponentScan
<3.>@EnableAutoConfiguration
public @interface SpringBootApplication {

}

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Configuration //实际上它也是一个配置类
public @interface SpringBootConfiguration {
}
```

Có thể xem `@SpringBootApplication` như là tập hợp của các annotation `@Configuration`, `@EnableAutoConfiguration`, `@ComponentScan`. Theo trang web chính thức của SpringBoot, ba annotation này có tác dụng lần lượt là:

- `@EnableAutoConfiguration`: Bật cơ chế tự động cấu hình của SpringBoot
- `@Configuration`: Cho phép đăng ký thêm bean trong context hoặc import các lớp cấu hình khác
- `@ComponentScan`: Quét các bean được đánh annotation `@Component` (`@Service`, `@Controller`), mặc định sẽ quét tất cả các lớp trong package chứa lớp khởi động, có thể tùy chỉnh bỏ qua một số bean. Như hình dưới đây, container sẽ loại trừ `TypeExcludeFilter` và `AutoConfigurationExcludeFilter`.

![](/images/p3-juejin/bcc73490afbe4c6ba62acde6a94ffdfd~tplv-k3u1fbpfcp-watermark.png)

`@EnableAutoConfiguration` là annotation quan trọng để triển khai tự động cấu hình, chúng ta sẽ đi sâu vào annotation này.

### @EnableAutoConfiguration: Annotation cốt lõi triển khai tự động cấu hình

`EnableAutoConfiguration` chỉ là một annotation đơn giản, chức năng cốt lõi của tự động cấu hình thực sự được triển khai thông qua lớp `AutoConfigurationImportSelector`.

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage //作用：将main包下的所有组件注册到容器中
@Import({AutoConfigurationImportSelector.class}) //加载自动装配类 xxxAutoconfiguration
public @interface EnableAutoConfiguration {
    String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";

    Class<?>[] exclude() default {};

    String[] excludeName() default {};
}
```

Bây giờ hãy phân tích kỹ lớp `AutoConfigurationImportSelector` thực sự làm gì?

### AutoConfigurationImportSelector: Tải các lớp tự động cấu hình

Cấu trúc kế thừa của lớp `AutoConfigurationImportSelector` như sau:

```java
public class AutoConfigurationImportSelector implements DeferredImportSelector, BeanClassLoaderAware, ResourceLoaderAware, BeanFactoryAware, EnvironmentAware, Ordered {

}

public interface DeferredImportSelector extends ImportSelector {

}

public interface ImportSelector {
    String[] selectImports(AnnotationMetadata var1);
}
```

Có thể thấy, lớp `AutoConfigurationImportSelector` triển khai interface `ImportSelector`, tức là đã triển khai phương thức `selectImports` trong interface này. Phương thức này chủ yếu dùng để **lấy tên đầy đủ của tất cả các lớp thỏa mãn điều kiện cần được tải vào IoC container**.

```java
private static final String[] NO_IMPORTS = new String[0];

public String[] selectImports(AnnotationMetadata annotationMetadata) {
        // <1>.判断自动装配开关是否打开
        if (!this.isEnabled(annotationMetadata)) {
            return NO_IMPORTS;
        } else {
          //<2>.获取所有需要装配的bean
            AutoConfigurationMetadata autoConfigurationMetadata = AutoConfigurationMetadataLoader.loadMetadata(this.beanClassLoader);
            AutoConfigurationImportSelector.AutoConfigurationEntry autoConfigurationEntry = this.getAutoConfigurationEntry(autoConfigurationMetadata, annotationMetadata);
            return StringUtils.toStringArray(autoConfigurationEntry.getConfigurations());
        }
    }
```

Ở đây chúng ta cần chú ý đặc biệt đến phương thức `getAutoConfigurationEntry()`, phương thức này chủ yếu chịu trách nhiệm tải các lớp cấu hình tự động.

Chuỗi gọi của phương thức này như sau:

![](/images/github/javaguide/system-design/framework/spring/3c1200712655443ca4b38500d615bb70~tplv-k3u1fbpfcp-watermark.png)

Bây giờ hãy phân tích chi tiết kết hợp với mã nguồn của `getAutoConfigurationEntry()`:

```java
private static final AutoConfigurationEntry EMPTY_ENTRY = new AutoConfigurationEntry();

AutoConfigurationEntry getAutoConfigurationEntry(AutoConfigurationMetadata autoConfigurationMetadata, AnnotationMetadata annotationMetadata) {
        //<1>.
        if (!this.isEnabled(annotationMetadata)) {
            return EMPTY_ENTRY;
        } else {
            //<2>.
            AnnotationAttributes attributes = this.getAttributes(annotationMetadata);
            //<3>.
            List<String> configurations = this.getCandidateConfigurations(annotationMetadata, attributes);
            //<4>.
            configurations = this.removeDuplicates(configurations);
            Set<String> exclusions = this.getExclusions(annotationMetadata, attributes);
            this.checkExcludedClasses(configurations, exclusions);
            configurations.removeAll(exclusions);
            configurations = this.filter(configurations, autoConfigurationMetadata);
            this.fireAutoConfigurationImportEvents(configurations, exclusions);
            return new AutoConfigurationImportSelector.AutoConfigurationEntry(configurations, exclusions);
        }
    }
```

**Bước 1**:

Kiểm tra xem switch tự động cấu hình có được bật không. Mặc định `spring.boot.enableautoconfiguration=true`, có thể thiết lập trong `application.properties` hoặc `application.yml`

![](/images/p3-juejin/77aa6a3727ea4392870f5cccd09844ab~tplv-k3u1fbpfcp-watermark.png)

**Bước 2**:

Dùng để lấy `exclude` và `excludeName` trong annotation `EnableAutoConfiguration`.

![](/images/p3-juejin/3d6ec93bbda1453aa08c52b49516c05a~tplv-k3u1fbpfcp-zoom-1.png)

**Bước 3**

Lấy tất cả các lớp cấu hình cần tự động cấu hình, đọc `META-INF/spring.factories`

```plain
spring-boot/spring-boot-project/spring-boot-autoconfigure/src/main/resources/META-INF/spring.factories
```

![](/images/github/javaguide/system-design/framework/spring/58c51920efea4757aa1ec29c6d5f9e36~tplv-k3u1fbpfcp-watermark.png)

Từ hình dưới có thể thấy tất cả nội dung cấu hình trong file này đã được đọc vào. Tác dụng của `XXXAutoConfiguration` là tải các component theo nhu cầu.

![](/images/github/javaguide/system-design/framework/spring/94d6e1a060ac41db97043e1758789026~tplv-k3u1fbpfcp-watermark.png)

Không chỉ `META-INF/spring.factories` trong dependency này được đọc, mà tất cả `META-INF/spring.factories` trong mọi Spring Boot Starter đều sẽ được đọc.

Vì vậy, bạn có thể thấy rõ ràng rằng Spring Boot Starter của connection pool cơ sở dữ liệu druid đã tạo file `META-INF/spring.factories`.

Nếu chúng ta muốn tự tạo một Spring Boot Starter, bước này là không thể thiếu.

![](/images/github/javaguide/system-design/framework/spring/68fa66aeee474b0385f94d23bcfe1745~tplv-k3u1fbpfcp-watermark.png)

**Bước 4**:

Đến đây phỏng vấn viên có thể hỏi bạn: "Trong `spring.factories` có rất nhiều cấu hình, mỗi lần khởi động có phải tải tất cả không?"

Rõ ràng, điều đó là không thực tế. Khi debug đến bước sau bạn sẽ thấy giá trị của `configurations` đã nhỏ đi.

![](/images/github/javaguide/system-design/framework/spring/267f8231ae2e48d982154140af6437b0~tplv-k3u1fbpfcp-watermark.png)

Vì bước này đã trải qua một lần lọc, tất cả các điều kiện trong `@ConditionalOnXXX` phải thỏa mãn thì lớp đó mới có hiệu lực.

```java
@Configuration
// 检查相关的类：RabbitTemplate 和 Channel是否存在
// 存在才会加载
@ConditionalOnClass({ RabbitTemplate.class, Channel.class })
@EnableConfigurationProperties(RabbitProperties.class)
@Import(RabbitAnnotationDrivenConfiguration.class)
public class RabbitAutoConfiguration {
}
```

Các bạn quan tâm có thể tìm hiểu chi tiết về các annotation điều kiện mà Spring Boot cung cấp

- `@ConditionalOnBean`: Khi trong container có Bean được chỉ định
- `@ConditionalOnMissingBean`: Khi trong container không có Bean được chỉ định
- `@ConditionalOnSingleCandidate`: Khi Bean được chỉ định chỉ có một trong container, hoặc dù có nhiều nhưng chỉ định Bean ưu tiên
- `@ConditionalOnClass`: Khi trong classpath có lớp được chỉ định
- `@ConditionalOnMissingClass`: Khi trong classpath không có lớp được chỉ định
- `@ConditionalOnProperty`: Thuộc tính được chỉ định có giá trị được chỉ định hay không
- `@ConditionalOnResource`: Classpath có giá trị được chỉ định hay không
- `@ConditionalOnExpression`: Dùng biểu thức SpEL làm điều kiện đánh giá
- `@ConditionalOnJava`: Dùng phiên bản Java làm điều kiện đánh giá
- `@ConditionalOnJndi`: Dưới điều kiện JNDI tồn tại, tìm kiếm tại vị trí được chỉ định
- `@ConditionalOnNotWebApplication`: Điều kiện dự án hiện tại không phải là dự án Web
- `@ConditionalOnWebApplication`: Điều kiện dự án hiện tại là dự án Web

## Làm thế nào để tự tạo một Starter

Nói mà không thực hành thì không ích gì, bây giờ hãy tự tạo một starter, triển khai thread pool tùy chỉnh

Bước một, tạo project `threadpool-spring-boot-starter`

![](/images/github/javaguide/system-design/framework/spring/1ff0ebe7844f40289eb60213af72c5a6~tplv-k3u1fbpfcp-watermark.png)

Bước hai, thêm các dependency liên quan đến Spring Boot

![](/images/github/javaguide/system-design/framework/spring/5e14254276604f87b261e5a80a354cc0~tplv-k3u1fbpfcp-watermark.png)

Bước ba, tạo `ThreadPoolAutoConfiguration`

![](/images/github/javaguide/system-design/framework/spring/1843f1d12c5649fba85fd7b4e4a59e39~tplv-k3u1fbpfcp-watermark.png)

Bước bốn, tạo file `META-INF/spring.factories` trong package resources của project `threadpool-spring-boot-starter`

![](/images/github/javaguide/system-design/framework/spring/97b738321f1542ea8140484d6aaf0728~tplv-k3u1fbpfcp-watermark.png)

Cuối cùng tạo project mới và thêm `threadpool-spring-boot-starter`

![](/images/github/javaguide/system-design/framework/spring/edcdd8595a024aba85b6bb20d0e3fed4~tplv-k3u1fbpfcp-watermark.png)

Test thành công!!!

![](/images/github/javaguide/system-design/framework/spring/9a265eea4de742a6bbdbbaa75f437307~tplv-k3u1fbpfcp-watermark.png)

## Tổng kết

Spring Boot bật tự động cấu hình thông qua `@EnableAutoConfiguration`, thông qua SpringFactoriesLoader cuối cùng tải các lớp cấu hình tự động trong `META-INF/spring.factories` để thực hiện tự động cấu hình. Các lớp cấu hình tự động thực chất là các lớp cấu hình được tải theo nhu cầu thông qua `@Conditional`, muốn chúng có hiệu lực phải thêm package `spring-boot-starter-xxx` để triển khai starter dependency.

<!-- @include: @article-footer.snippet.md -->
