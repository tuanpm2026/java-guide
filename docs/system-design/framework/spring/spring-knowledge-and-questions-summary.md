---
title: Tổng hợp câu hỏi phỏng vấn Spring thường gặp
description: Giải thích chi tiết các câu hỏi phỏng vấn cốt lõi của Spring framework, bao gồm IoC container, nguyên lý AOP, vòng đời Bean, dependency injection và các kiến thức cốt lõi của Spring.
category: Framework
tag:
  - Spring
head:
  - - meta
    - name: keywords
      content: Spring面试题,Spring框架,Bean生命周期,IoC,AOP,依赖注入,事务,Spring常见问题
---

<!-- @include: @small-advertisement.snippet.md -->

Bài viết này chủ yếu muốn thông qua một số câu hỏi để giúp mọi người hiểu sâu hơn về Spring, vì vậy sẽ không đề cập quá nhiều đến code!

Nhiều câu hỏi dưới đây bản thân tôi cũng không chú ý đến trong quá trình sử dụng Spring, bản thân tôi cũng phải tạm thời tra cứu nhiều tài liệu và sách để bổ sung. Trên mạng cũng có một số bài viết tổng hợp các câu hỏi thường gặp/câu hỏi phỏng vấn về Spring, tôi cảm thấy hầu hết đều copy lẫn nhau, và nhiều câu hỏi cũng không tốt lắm, một số câu trả lời cũng có vấn đề. Vì vậy, tôi đã dành một tuần thời gian rảnh để tổng hợp lại, hy vọng có thể giúp ích cho mọi người.

## Cơ bản về Spring

### Spring framework là gì?

Spring là một framework phát triển Java nhẹ, mã nguồn mở, nhằm nâng cao hiệu quả phát triển của developer và khả năng bảo trì của hệ thống.

Khi chúng ta nói Spring framework thường chỉ Spring Framework, nó là tập hợp của nhiều module, sử dụng các module này có thể thuận tiện hỗ trợ chúng ta trong phát triển, ví dụ Spring hỗ trợ IoC (Inversion of Control: Điều khiển ngược) và AOP (Aspect-Oriented Programming: Lập trình hướng khía cạnh), có thể dễ dàng truy cập cơ sở dữ liệu, có thể dễ dàng tích hợp các component bên thứ ba (email, task, scheduling, cache, v.v.), hỗ trợ unit test khá tốt, hỗ trợ phát triển ứng dụng Java RESTful.

![](/images/github/javaguide/system-design/framework/spring/38ef122122de4375abcd27c3de8f60b4.png)

Ý tưởng cốt lõi nhất của Spring là không tạo ra bánh xe, dùng ngay không cần cấu hình, nâng cao hiệu quả phát triển.

Spring dịch ra có nghĩa là mùa xuân, thấy mục tiêu và sứ mệnh của nó là mang lại mùa xuân cho lập trình viên Java!

Tính năng cốt lõi mà Spring cung cấp chủ yếu là IoC và AOP. Học Spring, nhất định phải hiểu ý tưởng cốt lõi của IoC và AOP!

- Trang chính thức Spring: <https://spring.io/>
- Địa chỉ GitHub: <https://github.com/spring-projects/spring-framework>

### Spring bao gồm những module nào?

**Phiên bản Spring 4.x**:

![Các module chính của Spring 4.x](/images/github/javaguide/system-design/framework/spring/jvme0c60b4606711fc4a0b6faf03230247a.png)

**Phiên bản Spring 5.x**:

![Các module chính của Spring 5.x](/images/github/javaguide/system-design/framework/spring/20200831175708.png)

Trong phiên bản Spring 5.x, component Portlet của module Web đã bị loại bỏ, đồng thời thêm component WebFlux cho xử lý phản ứng bất đồng bộ.

Quan hệ phụ thuộc của các module Spring như sau:

![Quan hệ phụ thuộc của các module Spring](/images/github/javaguide/system-design/framework/spring/20200902100038.png)

#### Core Container

Module cốt lõi của Spring framework, cũng có thể gọi là module cơ bản, chủ yếu cung cấp hỗ trợ cho tính năng dependency injection IoC. Hầu hết các tính năng khác của Spring đều cần phụ thuộc vào module này, có thể thấy từ biểu đồ quan hệ phụ thuộc các module Spring ở trên.

- **spring-core**: Các công cụ cơ bản cốt lõi của Spring framework.
- **spring-beans**: Cung cấp hỗ trợ cho các tính năng tạo, cấu hình và quản lý bean.
- **spring-context**: Cung cấp hỗ trợ cho các tính năng internationalization, event propagation, resource loading.
- **spring-expression**: Cung cấp hỗ trợ cho ngôn ngữ biểu thức (Spring Expression Language) SpEL, chỉ phụ thuộc vào module core, không phụ thuộc vào các module khác, có thể sử dụng độc lập.

#### AOP

- **spring-aspects**: Module này cung cấp hỗ trợ cho tích hợp với AspectJ.
- **spring-aop**: Cung cấp cài đặt lập trình hướng khía cạnh.
- **spring-instrument**: Cung cấp chức năng thêm agent (đại lý) cho JVM. Cụ thể hơn, nó cung cấp một weaving proxy cho Tomcat, có thể truyền class file cho Tomcat, như thể những file này được class loader load. Không hiểu cũng không sao, module này có tình huống sử dụng rất hạn chế.

#### Data Access/Integration

- **spring-jdbc**: Cung cấp JDBC trừu tượng hóa cho truy cập cơ sở dữ liệu. Các cơ sở dữ liệu khác nhau đều có API độc lập để thao tác cơ sở dữ liệu, còn chương trình Java chỉ cần tương tác với JDBC API, điều này che chắn ảnh hưởng của cơ sở dữ liệu.
- **spring-tx**: Cung cấp hỗ trợ cho transaction.
- **spring-orm**: Cung cấp hỗ trợ cho các framework ORM như Hibernate, JPA, iBatis.
- **spring-oxm**: Cung cấp một lớp trừu tượng hỗ trợ OXM (Object-to-XML-Mapping), ví dụ: JAXB, Castor, XMLBeans, JiBX và XStream.
- **spring-jms**: Dịch vụ tin nhắn. Từ sau Spring Framework 4.1, nó còn cung cấp kế thừa module spring-messaging.

#### Spring Web

- **spring-web**: Cung cấp một số hỗ trợ cơ bản nhất cho cài đặt tính năng Web.
- **spring-webmvc**: Cung cấp cài đặt Spring MVC.
- **spring-websocket**: Cung cấp hỗ trợ WebSocket, WebSocket có thể cho phép client và server thực hiện giao tiếp hai chiều.
- **spring-webflux**: Cung cấp hỗ trợ WebFlux. WebFlux là framework phản ứng mới được giới thiệu trong Spring Framework 5.0. Khác với Spring MVC, nó không cần Servlet API, là hoàn toàn bất đồng bộ.

#### Messaging

**spring-messaging** là module mới được thêm vào từ Spring 4.0, trách nhiệm chính là tích hợp một số ứng dụng truyền báo cáo cơ bản cho Spring framework.

#### Spring Test

Spring team ủng hộ phát triển theo Test Driven Development (TDD). Với sự giúp đỡ của Inversion of Control (IoC), unit test và integration test trở nên đơn giản hơn.

Module test của Spring hỗ trợ khá tốt các framework test thường dùng như JUnit (framework unit test), TestNG (tương tự JUnit), Mockito (chủ yếu dùng để Mock object), PowerMock (giải quyết vấn đề của Mockito như không thể mock phương thức final, static, private).

### ⭐️Mối quan hệ giữa Spring, Spring MVC, Spring Boot là gì?

Nhiều người bị nhầm lẫn giữa Spring, Spring MVC, Spring Boot! Ở đây giới thiệu sơ qua về ba thứ này, thực ra rất đơn giản, không có gì cao siêu.

Spring bao gồm nhiều module chức năng (vừa đề cập ở trên), trong đó quan trọng nhất là module Spring-Core (chủ yếu cung cấp hỗ trợ cho tính năng dependency injection IoC), cài đặt tính năng của các module khác trong Spring (như Spring MVC) về cơ bản đều cần phụ thuộc vào module này.

Hình dưới đây tương ứng với phiên bản Spring 4.x. Trong phiên bản 5.x mới nhất hiện tại, component Portlet của module Web đã bị loại bỏ, đồng thời thêm component WebFlux cho xử lý phản ứng bất đồng bộ.

![Các module chính của Spring](/images/github/javaguide/jvme0c60b4606711fc4a0b6faf03230247a.png)

Spring MVC là một module rất quan trọng trong Spring, chủ yếu mang lại cho Spring khả năng xây dựng nhanh chóng ứng dụng Web kiến trúc MVC. MVC là viết tắt của Model (mô hình), View (giao diện), Controller (bộ điều khiển), ý tưởng cốt lõi là tổ chức code bằng cách tách biệt business logic, dữ liệu và hiển thị.

![](/images/java-guide-blog/image-20210809181452421.png)

Sử dụng Spring để phát triển các cấu hình khác nhau quá rắc rối, ví dụ khi bật một số tính năng Spring nhất định, cần cấu hình tường minh bằng XML hoặc Java. Vì vậy, Spring Boot ra đời!

Spring nhằm đơn giản hóa phát triển ứng dụng J2EE enterprise. Spring Boot nhằm đơn giản hóa phát triển Spring (giảm file cấu hình, dùng ngay không cần cấu hình!).

Spring Boot chỉ đơn giản hóa cấu hình, nếu bạn cần xây dựng ứng dụng Web kiến trúc MVC, bạn vẫn cần dùng Spring MVC làm MVC framework, chỉ là Spring Boot giúp bạn đơn giản hóa rất nhiều cấu hình của Spring MVC, thực sự làm được dùng ngay không cần cấu hình!

## Spring IoC

### ⭐️IoC là gì?

IoC (Inversion of Control) tức là điều khiển ngược/phản đảo điều khiển. Đây là một ý tưởng chứ không phải một cài đặt kỹ thuật. Mô tả về: Vấn đề tạo và quản lý object trong lĩnh vực phát triển Java.

Ví dụ: Hiện có lớp A phụ thuộc vào lớp B

- **Cách phát triển truyền thống**: Thường là trong lớp A thủ công dùng từ khóa new để new một object B ra
- **Cách phát triển dùng ý tưởng IoC**: Không dùng từ khóa new để tạo object, mà thông qua IoC container (Spring framework) để giúp chúng ta khởi tạo object. Chúng ta cần object nào, lấy trực tiếp từ IoC container.

Từ so sánh hai cách phát triển trên: Chúng ta "mất đi một quyền" (quyền tạo, quản lý object), qua đó cũng được một lợi ích (không cần lo nghĩ về một loạt việc tạo, quản lý object nữa)

**Tại sao gọi là điều khiển ngược?**

- **Điều khiển**: Chỉ quyền tạo (khởi tạo, quản lý) object
- **Ngược**: Quyền điều khiển được giao cho môi trường bên ngoài (IoC container)

![Minh họa IoC](/images/github/javaguide/system-design/framework/spring/IoC&Aop-ioc-illustration.png)

### ⭐️IoC giải quyết vấn đề gì?

Ý tưởng của IoC là hai bên không phụ thuộc lẫn nhau, do container bên thứ ba quản lý các tài nguyên liên quan. Điều này có lợi ích gì?

1. Mức độ coupling (liên kết) hoặc mức độ phụ thuộc giữa các object giảm xuống;
2. Tài nguyên trở nên dễ quản lý hơn; ví dụ với Spring container cung cấp thì rất dễ dàng có thể cài đặt một singleton.

Ví dụ: Hiện có một thao tác User, dùng cấu trúc hai tầng Service và Dao để phát triển

Trong trường hợp không dùng ý tưởng IoC, tầng Service muốn dùng cài đặt cụ thể của tầng Dao, cần thủ công new ra lớp cài đặt cụ thể `UserDaoImpl` của `IUserDao` trong `UserServiceImpl` (không thể trực tiếp new class interface).

Hoàn hảo, cách này cũng có thể thực hiện được, nhưng hãy tưởng tượng tình huống sau:

Trong quá trình phát triển đột nhiên nhận được yêu cầu mới, phát triển một lớp cài đặt cụ thể khác cho interface `IUserDao`. Vì tầng Server phụ thuộc vào cài đặt cụ thể của `IUserDao`, chúng ta cần chỉnh sửa object được new trong `UserServiceImpl`. Nếu chỉ có một lớp tham chiếu đến cài đặt cụ thể của `IUserDao`, có thể cảm thấy cũng được, chỉnh sửa cũng không tốn nhiều công sức, nhưng nếu có rất nhiều nơi tham chiếu đến cài đặt cụ thể của `IUserDao`, một khi cần thay đổi cách cài đặt `IUserDao`, việc chỉnh sửa sẽ rất nhức đầu.

![IoC&Aop-ioc-illustration-dao-service](/images/github/javaguide/system-design/framework/spring/IoC&Aop-ioc-illustration-dao-service.png)

Dùng ý tưởng IoC, chúng ta giao quyền điều khiển (tạo, quản lý) object cho IoC container quản lý, khi dùng chỉ cần "xin" từ IoC container là được

![](/images/github/javaguide/system-design/framework/spring/IoC&Aop-ioc-illustration-dao.png)

### Spring Bean là gì?

Đơn giản mà nói, Bean chỉ là những object được IoC container quản lý.

Chúng ta cần báo cho IoC container biết giúp chúng ta quản lý những object nào, điều này được định nghĩa thông qua configuration metadata. Configuration metadata có thể là file XML, annotation hoặc Java configuration class.

```xml
<!-- Constructor-arg with 'value' attribute -->
<bean id="..." class="...">
   <constructor-arg value="..."/>
</bean>
```

Hình dưới đây đơn giản minh họa cách IoC container dùng configuration metadata để quản lý object.

![](/images/github/javaguide/system-design/framework/spring/062b422bd7ac4d53afd28fb74b2bc94d.png)

Hai package `org.springframework.beans` và `org.springframework.context` là nền tảng cài đặt IoC, nếu muốn nghiên cứu mã nguồn liên quan đến IoC có thể xem

### Các annotation để khai báo một lớp là Bean là gì?

- `@Component`: Annotation chung, có thể đánh dấu bất kỳ lớp nào là component của `Spring`. Nếu một Bean không biết thuộc tầng nào, có thể dùng annotation `@Component` để đánh dấu.
- `@Repository`: Tương ứng với tầng persistence (Dao), chủ yếu dùng cho các thao tác liên quan đến cơ sở dữ liệu.
- `@Service`: Tương ứng với tầng service, chủ yếu liên quan đến một số logic phức tạp, cần sử dụng tầng Dao.
- `@Controller`: Tương ứng với tầng controller của Spring MVC, chủ yếu dùng để nhận request của người dùng và gọi tầng `Service` để trả dữ liệu về trang frontend.

### Sự khác biệt giữa @Component và @Bean là gì?

- Annotation `@Component` tác dụng lên lớp, còn annotation `@Bean` tác dụng lên method.
- `@Component` thường được phát hiện tự động và tự động lắp ráp vào Spring container thông qua quét class path (chúng ta có thể dùng annotation `@ComponentScan` để định nghĩa đường dẫn quét để tìm ra các lớp cần lắp ráp và tự động lắp ráp vào Spring bean container). Annotation `@Bean` thường là chúng ta định nghĩa tạo ra bean này trong method được đánh dấu annotation đó, `@Bean` báo cho Spring biết đây là instance của class nào, khi tôi cần dùng nó thì trả lại cho tôi.
- Annotation `@Bean` có khả năng tùy chỉnh mạnh hơn annotation `@Component`, và có nhiều nơi chúng ta chỉ có thể đăng ký bean thông qua annotation `@Bean`. Ví dụ khi chúng ta tham chiếu đến lớp trong thư viện bên thứ ba cần lắp ráp vào Spring container, thì chỉ có thể thực hiện qua `@Bean`.

Ví dụ sử dụng annotation `@Bean`:

```java
@Configuration
public class AppConfig {
    @Bean
    public TransferService transferService() {
        return new TransferServiceImpl();
    }

}
```

Code trên tương đương với cấu hình xml dưới đây

```xml
<beans>
    <bean id="transferService" class="com.acme.TransferServiceImpl"/>
</beans>
```

Ví dụ dưới đây không thể thực hiện bằng `@Component`.

```java
@Bean
public OneService getService(status) {
    case (status)  {
        when 1:
                return new serviceImpl1();
        when 2:
                return new serviceImpl2();
        when 3:
                return new serviceImpl3();
    }
}
```

### Các annotation để tiêm Bean là gì?

`@Autowired` tích hợp sẵn trong Spring và `@Resource`, `@Inject` tích hợp trong JDK đều có thể dùng để tiêm Bean.

| Annotation   | Package                            | Source       |
| ------------ | ---------------------------------- | ------------ |
| `@Autowired` | `org.springframework.bean.factory` | Spring 2.5+  |
| `@Resource`  | `javax.annotation`                 | Java JSR-250 |
| `@Inject`    | `javax.inject`                     | Java JSR-330 |

`@Autowired` và `@Resource` được dùng nhiều hơn một chút.

### ⭐️Sự khác biệt giữa @Autowired và @Resource là gì?

`@Autowired` là annotation tích hợp sẵn trong Spring, logic tiêm mặc định là **ưu tiên khớp theo kiểu (byType), nếu tồn tại nhiều Bean cùng kiểu thì thử lọc theo tên (byName)**.

Cụ thể:

1. Ưu tiên tìm Bean khớp kiểu theo interface/kiểu lớp trong Spring container. Nếu chỉ tìm thấy một Bean khớp kiểu, tiêm trực tiếp, không cần xem xét tên;
2. Nếu tìm thấy nhiều Bean cùng kiểu (ví dụ một interface có nhiều lớp cài đặt), sẽ thử khớp theo **tên thuộc tính hoặc tên tham số** với tên Bean (tên Bean mặc định là tên lớp với chữ cái đầu viết thường, trừ khi được chỉ định tường minh qua `@Bean(name = "...")` hoặc `@Component("...")`).

Khi một interface tồn tại nhiều lớp cài đặt:

- Nếu tên thuộc tính trùng với tên của một Bean nào đó, tiêm Bean đó;
- Nếu tên thuộc tính không khớp với tên của bất kỳ Bean nào, sẽ ném `NoUniqueBeanDefinitionException`, lúc này cần chỉ định tường minh tên Bean cần tiêm qua `@Qualifier`.

Ví dụ minh họa:

```java
// SmsService 接口有两个实现类：SmsServiceImpl1、SmsServiceImpl2（均被 Spring 管理）

// 报错：byType 匹配到多个 Bean，且属性名 "smsService" 与两个实现类的默认名称（smsServiceImpl1、smsServiceImpl2）都不匹配
@Autowired
private SmsService smsService;

// 正确：属性名 "smsServiceImpl1" 与实现类 SmsServiceImpl1 的默认名称匹配
@Autowired
private SmsService smsServiceImpl1;

// 正确：通过 @Qualifier 显式指定 Bean 名称 "smsServiceImpl1"
@Autowired
@Qualifier(value = "smsServiceImpl1")
private SmsService smsService;
```

Trong thực tế phát triển, chúng ta vẫn khuyến nghị chỉ định tường minh tên qua annotation `@Qualifier` thay vì phụ thuộc vào tên biến.

`@Resource` xuất phát từ đặc tả **JSR-250** (đặc tả Java chuẩn), trong JDK 6 đến JDK 10, nó thực sự tồn tại trong package do JDK cung cấp. Tuy nhiên, từ JDK 11, nó không còn mặc định tồn tại trong JDK nữa, bạn cần import dependency thêm `javax.annotation-api` mới có thể dùng.

Logic xử lý của Spring đối với `@Resource` (trường hợp không có tham số) như sau:

1. **Khớp theo tên (byName):** Mặc định lấy tên field (Field Name) làm tên bean để tìm trong container. Nếu tìm thấy Bean có tên đó, tiêm trực tiếp.
2. **Quay lại khớp theo kiểu (byType):** Nếu **không** tìm thấy Bean cùng tên, Spring sẽ thử tìm theo **kiểu** của field. **Kết quả xác định khớp theo kiểu**
   - **Tìm thấy 1 Bean**: Tiêm thành công.
   - **Tìm thấy 0 Bean**: Ném ngoại lệ (`NoSuchBeanDefinitionException`).
   - **Tìm thấy >1 Bean**: Ném ngoại lệ (`NoUniqueBeanDefinitionException`).

`@Resource` có hai thuộc tính quan trọng và thường dùng trong phát triển hàng ngày: `name` (tên), `type` (kiểu).

```java
public @interface Resource {
    String name() default "";
    Class<?> type() default Object.class;
}
```

Nếu chỉ chỉ định thuộc tính `name` thì cách tiêm là `byName`, nếu chỉ chỉ định thuộc tính `type` thì cách tiêm là `byType`, nếu chỉ định cả `name` và `type` (không khuyến nghị) thì cách tiêm là `byType`+`byName`.

```java
// 报错，byName 和 byType 都无法匹配到 bean
@Resource
private SmsService smsService;
// 正确注入 SmsServiceImpl1 对象对应的 bean
@Resource
private SmsService smsServiceImpl1;
// 正确注入 SmsServiceImpl1 对象对应的 bean（比较推荐这种方式）
@Resource(name = "smsServiceImpl1")
private SmsService smsService;
```

**Tóm tắt ngắn gọn**:

- `@Autowired` là annotation do Spring cung cấp, `@Resource` là annotation do JDK cung cấp.
- `Autowired` cách tiêm mặc định là `byType` (khớp theo kiểu), `@Resource` cách tiêm mặc định là `byName` (khớp theo tên).
- Khi một interface tồn tại nhiều lớp cài đặt, cả `@Autowired` và `@Resource` đều cần thông qua tên mới có thể khớp đúng Bean tương ứng. `Autowired` có thể chỉ định tường minh tên qua annotation `@Qualifier`, `@Resource` có thể chỉ định tường minh tên qua thuộc tính `name`.
- `@Autowired` hỗ trợ dùng trên constructor, method, field và tham số. `@Resource` chủ yếu dùng cho tiêm trên field và method, không hỗ trợ trên constructor hoặc tham số.

Xét rằng ngữ nghĩa của `@Resource` rõ ràng hơn (ưu tiên tên), và là chuẩn Java, có thể giảm coupling chặt với Spring framework, chúng ta thường **khuyến nghị dùng `@Resource` hơn**, đặc biệt trong tình huống cần tiêm theo tên. Còn `@Autowired` kết hợp constructor injection, có ưu thế trong việc thực hiện tính bất biến và tính bắt buộc của dependency injection, cũng là thực hành rất tốt.

### Các cách tiêm Bean là gì?

Các cách phổ biến của Dependency Injection (DI):

1. Constructor injection: Tiêm dependency thông qua constructor của lớp.
1. Setter injection: Tiêm dependency thông qua Setter method của lớp.
1. Field injection: Trực tiếp dùng annotation (như `@Autowired` hoặc `@Resource`) trên field của lớp để tiêm dependency.

Ví dụ constructor injection:

```java
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    //...
}
```

Ví dụ Setter injection:

```java
@Service
public class UserService {

    private UserRepository userRepository;

    // 在 Spring 4.3 及以后的版本，特定情况下 @Autowired 可以省略不写
    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    //...
}
```

Ví dụ Field injection:

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    //...
}
```

### ⭐️Constructor injection hay Setter injection?

Spring chính thức có câu trả lời cho câu hỏi này: <https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html#beans-setter-injection>.

Ở đây tôi chủ yếu trích xuất và tổng hợp hoàn thiện khuyến nghị chính thức của Spring.

**Spring chính thức khuyến nghị constructor injection**, ưu điểm của cách tiêm này như sau:

1. Tính toàn vẹn phụ thuộc: Đảm bảo tất cả các dependency bắt buộc đều được tiêm khi object được tạo, tránh rủi ro null pointer exception.
2. Tính bất biến: Giúp tạo object bất biến, nâng cao thread safety.
3. Đảm bảo khởi tạo: Component đã được khởi tạo hoàn toàn trước khi sử dụng, giảm các lỗi tiềm ẩn.
4. Thuận tiện test: Trong unit test, có thể truyền trực tiếp mock dependency qua constructor, không cần phụ thuộc vào Spring container để tiêm.

Constructor injection phù hợp để xử lý **các dependency bắt buộc**, còn **Setter injection** thì phù hợp hơn cho **các dependency tùy chọn**, các dependency này có thể có giá trị mặc định hoặc được đặt động trong vòng đời object. Mặc dù `@Autowired` có thể dùng cho Setter method để xử lý các dependency bắt buộc, nhưng constructor injection vẫn là lựa chọn tốt hơn.

Trong một số trường hợp (ví dụ lớp bên thứ ba không cung cấp Setter method), constructor injection có thể là **lựa chọn duy nhất**.

### ⭐️Phạm vi Bean có những loại nào?

Phạm vi Bean trong Spring thường có mấy loại sau:

- **singleton**: Trong IoC container chỉ có một instance bean duy nhất. Các bean trong Spring mặc định đều là singleton, là ứng dụng của mẫu thiết kế singleton.
- **prototype**: Mỗi lần lấy sẽ tạo một instance bean mới. Nghĩa là, gọi `getBean()` hai lần liên tiếp sẽ nhận được hai instance Bean khác nhau.
- **request** (chỉ dùng cho ứng dụng Web): Mỗi HTTP request sẽ tạo ra một bean mới (request bean), bean đó chỉ có hiệu lực trong HTTP request hiện tại.
- **session** (chỉ dùng cho ứng dụng Web): Mỗi HTTP request từ session mới sẽ tạo ra một bean mới (session bean), bean đó chỉ có hiệu lực trong HTTP session hiện tại.
- **application/global-session** (chỉ dùng cho ứng dụng Web): Mỗi ứng dụng Web tạo ra một Bean khi khởi động (application Bean), bean đó chỉ có hiệu lực trong thời gian khởi động ứng dụng hiện tại.
- **websocket** (chỉ dùng cho ứng dụng Web): Mỗi phiên WebSocket tạo ra một bean mới.

**Cách cấu hình phạm vi bean như thế nào?**

Cách xml:

```xml
<bean id="..." class="..." scope="singleton"></bean>
```

Cách annotation:

```java
@Bean
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public Person personPrototype() {
    return new Person();
}
```

### ⭐️Bean có thread safe không?

Bean trong Spring framework có thread safe hay không phụ thuộc vào phạm vi và trạng thái của nó.

Ở đây lấy hai phạm vi thường dùng nhất là prototype và singleton để giới thiệu. Hầu hết mọi tình huống đều dùng phạm vi singleton mặc định, chủ yếu tập trung vào phạm vi singleton.

Trong phạm vi prototype, mỗi lần lấy sẽ tạo một instance bean mới, không tồn tại vấn đề tranh chấp tài nguyên, vì vậy không có vấn đề thread safe. Trong phạm vi singleton, IoC container chỉ có một instance bean duy nhất, có thể tồn tại vấn đề tranh chấp tài nguyên (tùy thuộc vào Bean có trạng thái hay không). Nếu bean này có trạng thái thì tồn tại vấn đề thread safe (Bean có trạng thái chỉ object chứa biến thành viên có thể thay đổi).

Ví dụ Bean có trạng thái:

```java
// 定义了一个购物车类，其中包含一个保存用户的购物车里商品的 List
@Component
public class ShoppingCart {
    private List<String> items = new ArrayList<>();

    public void addItem(String item) {
        items.add(item);
    }

    public List<String> getItems() {
        return items;
    }
}
```

Tuy nhiên, hầu hết Bean thực tế đều không có trạng thái (không định nghĩa biến thành viên có thể thay đổi) (như Dao, Service), trong trường hợp này, Bean là thread safe.

Ví dụ Bean không có trạng thái:

```java
// 定义了一个用户服务，它仅包含业务逻辑而不保存任何状态。
@Component
public class UserService {

    public User findUserById(Long id) {
        //...
    }
    //...
}
```

Đối với vấn đề thread safe của singleton Bean có trạng thái, ba cách giải quyết phổ biến là:

1. **Tránh biến thành viên có thể thay đổi**: Cố gắng thiết kế Bean không có trạng thái.
2. **Dùng `ThreadLocal`**: Lưu biến thành viên có thể thay đổi trong `ThreadLocal`, đảm bảo luồng độc lập.
3. **Dùng cơ chế đồng bộ**: Dùng `synchronized` hoặc `ReentrantLock` để thực hiện kiểm soát đồng bộ, đảm bảo thread safe.

Lấy `ThreadLocal` làm ví dụ, minh họa tình huống `ThreadLocal` lưu thông tin đăng nhập người dùng:

```java
public class UserThreadLocal {

    private UserThreadLocal() {}

    private static final ThreadLocal<SysUser> LOCAL = ThreadLocal.withInitial(() -> null);

    public static void put(SysUser sysUser) {
        LOCAL.set(sysUser);
    }

    public static SysUser get() {
        return LOCAL.get();
    }

    public static void remove() {
        LOCAL.remove();
    }
}
```

### ⭐️Bạn có hiểu về vòng đời của Bean không?

1. **Tạo instance Bean**: Bean container trước tiên sẽ tìm định nghĩa Bean trong file cấu hình, sau đó dùng Java Reflection API để tạo instance Bean.
2. **Gán thuộc tính/điền thuộc tính Bean**: Đặt các thuộc tính và dependency liên quan cho Bean, ví dụ object được tiêm bởi annotation `@Autowired`, giá trị được tiêm bởi `@Value`, dependency và giá trị được tiêm bởi Setter method hoặc constructor, các loại tài nguyên khác nhau được tiêm bởi `@Resource`.
3. **Khởi tạo Bean**:
   - Nếu Bean cài đặt interface `BeanNameAware`, gọi method `setBeanName()`, truyền vào tên Bean.
   - Nếu Bean cài đặt interface `BeanClassLoaderAware`, gọi method `setBeanClassLoader()`, truyền vào instance của object `ClassLoader`.
   - Nếu Bean cài đặt interface `BeanFactoryAware`, gọi method `setBeanFactory()`, truyền vào instance của object `BeanFactory`.
   - Tương tự như trên, nếu cài đặt các interface `*.Aware` khác, thì gọi method tương ứng.
   - Nếu có object `BeanPostProcessor` liên quan đến Spring container đang load Bean này, thực thi method `postProcessBeforeInitialization()`
   - Nếu Bean cài đặt interface `InitializingBean`, thực thi method `afterPropertiesSet()`.
   - Nếu định nghĩa Bean trong file cấu hình chứa thuộc tính `init-method`, thực thi method được chỉ định.
   - Nếu có object `BeanPostProcessor` liên quan đến Spring container đang load Bean này, thực thi method `postProcessAfterInitialization()`.
4. **Hủy Bean**: Hủy không có nghĩa là lập tức hủy Bean, mà là ghi lại trước method hủy của Bean, khi sau này cần hủy Bean hoặc hủy container, sẽ gọi các method này để giải phóng tài nguyên mà Bean đang giữ.
   - Nếu Bean cài đặt interface `DisposableBean`, thực thi method `destroy()`.
   - Nếu định nghĩa Bean trong file cấu hình chứa thuộc tính `destroy-method`, thực thi method hủy Bean được chỉ định. Hoặc, cũng có thể trực tiếp dùng annotation `@PreDestroy` để đánh dấu method thực thi trước khi Bean bị hủy.

Trong method `doCreateBean()` của `AbstractAutowireCapableBeanFactory` có thể thấy lần lượt thực thi 4 giai đoạn này:

```java
protected Object doCreateBean(final String beanName, final RootBeanDefinition mbd, final @Nullable Object[] args)
    throws BeanCreationException {

    // 1. 创建 Bean 的实例
    BeanWrapper instanceWrapper = null;
    if (instanceWrapper == null) {
        instanceWrapper = createBeanInstance(beanName, mbd, args);
    }

    Object exposedObject = bean;
    try {
        // 2. Bean 属性赋值/填充
        populateBean(beanName, mbd, instanceWrapper);
        // 3. Bean 初始化
        exposedObject = initializeBean(beanName, exposedObject, mbd);
    }

    // 4. 销毁 Bean-注册回调接口
    try {
        registerDisposableBeanIfNecessary(beanName, bean, mbd);
    }

    return exposedObject;
}
```

Interface `Aware` cho phép Bean lấy tài nguyên Spring container.

Các interface `Aware` chính do Spring cung cấp:

1. `BeanNameAware`: Tiêm beanName tương ứng với bean hiện tại;
2. `BeanClassLoaderAware`: Tiêm ClassLoader đang load bean hiện tại;
3. `BeanFactoryAware`: Tiêm tham chiếu đến container `BeanFactory` hiện tại.

Interface `BeanPostProcessor` là điểm mở rộng mạnh mẽ do Spring cung cấp để chỉnh sửa Bean.

```java
public interface BeanPostProcessor {

	// 初始化前置处理
	default Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
		return bean;
	}

	// 初始化后置处理
	default Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
		return bean;
	}

}
```

- `postProcessBeforeInitialization`: Thực thi sau khi Bean được khởi tạo, thuộc tính được tiêm hoàn chỉnh, trước method `InitializingBean#afterPropertiesSet` và method `init-method` tùy chỉnh;
- `postProcessAfterInitialization`: Tương tự như trên, nhưng thực thi sau method `InitializingBean#afterPropertiesSet` và method `init-method` tùy chỉnh.

`InitializingBean` và `init-method` là điểm mở rộng do Spring cung cấp để khởi tạo Bean.

```java
public interface InitializingBean {
 // 初始化逻辑
	void afterPropertiesSet() throws Exception;
}
```

Chỉ định method `init-method`, chỉ định method khởi tạo:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="demo" class="com.chaycao.Demo" init-method="init()"/>

</beans>
```

**Làm sao để nhớ được?**

1. Tổng thể có thể chia đơn giản thành bốn bước: Khởi tạo instance -> Gán thuộc tính -> Khởi tạo -> Hủy.
2. Bước khởi tạo liên quan đến nhiều bước hơn, bao gồm dependency injection của interface `Aware`, xử lý trước và sau khởi tạo của `BeanPostProcessor` cũng như thao tác khởi tạo của `InitializingBean` và `init-method`.
3. Bước hủy sẽ đăng ký callback interface hủy liên quan, cuối cùng thực hiện hủy qua `DisposableBean` và `destroy-method`.

Cuối cùng, chia sẻ một hình minh họa rõ ràng (nguồn ảnh: [Cách nhớ vòng đời Spring Bean](https://chaycao.github.io/2020/02/15/如何记忆Spring-Bean的生命周期.html)).

![](/images/github/javaguide/system-design/framework/spring/spring-bean-lifestyle.png)

## Spring AOP

### ⭐️Hãy chia sẻ hiểu biết của bạn về AOP

AOP (Aspect-Oriented Programming: Lập trình hướng khía cạnh) có thể đóng gói những logic hoặc trách nhiệm không liên quan đến nghiệp vụ nhưng được gọi chung bởi các module nghiệp vụ (ví dụ xử lý transaction, quản lý log, kiểm soát quyền), thuận tiện để giảm code trùng lặp trong hệ thống, giảm mức độ coupling giữa các module, và có lợi cho khả năng mở rộng và bảo trì trong tương lai.

Spring AOP dựa trên dynamic proxy, nếu object cần proxy, cài đặt một số interface, thì Spring AOP sẽ dùng **JDK Proxy** để tạo proxy object, còn đối với object không cài đặt interface, không thể dùng JDK Proxy để proxy, lúc này Spring AOP sẽ dùng **Cglib** để tạo một subclass của object được proxy làm proxy, như hình dưới đây:

![SpringAOPProcess](/images/github/javaguide/system-design/framework/spring/230ae587a322d6e4d09510161987d346.jpeg)

Tất nhiên bạn cũng có thể dùng **AspectJ**! Spring AOP đã tích hợp AspectJ, AspectJ xứng đáng được coi là framework AOP hoàn chỉnh nhất trong hệ sinh thái Java.

Một số thuật ngữ chuyên môn liên quan đến lập trình cắt ngang AOP:

| Thuật ngữ                |                                                    Ý nghĩa                                                     |
| :----------------------- | :------------------------------------------------------------------------------------------------------------: |
| Target (Mục tiêu)        |                                             Object được thông báo                                              |
| Proxy (Proxy)            |                       Proxy object được tạo sau khi áp dụng thông báo cho target object                        |
| JoinPoint (Điểm kết nối) |            Tất cả các method được định nghĩa trong lớp mà target object thuộc về đều là join point             |
| Pointcut (Điểm cắt)      | Join point bị aspect chặn/nâng cao (pointcut nhất định là join point, join point không nhất thiết là pointcut) |
| Advice (Thông báo)       |            Logic/code nâng cao, tức là việc cần làm sau khi chặn được join point của target object             |
| Aspect (Khía cạnh)       |                                               Pointcut + Advice                                                |
| Weaving (Dệt)            |                   Quá trình áp dụng thông báo cho target object, qua đó tạo ra proxy object                    |

### ⭐️Sự khác biệt giữa Spring AOP và AspectJ AOP là gì?

| Tính năng              | Spring AOP                                                                         | AspectJ                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Cách nâng cao**      | Nâng cao runtime (dựa trên dynamic proxy)                                          | Nâng cao compile time, nâng cao class load time (thao tác trực tiếp bytecode) |
| **Hỗ trợ pointcut**    | Cấp method (trong phạm vi Spring Bean, không hỗ trợ method final và static)        | Cấp method, field, constructor, method static, v.v.                           |
| **Hiệu năng**          | Runtime phụ thuộc proxy, có chi phí nhất định, hiệu năng thấp hơn khi nhiều aspect | Runtime không có chi phí proxy, hiệu năng cao hơn                             |
| **Độ phức tạp**        | Đơn giản, dễ dùng, phù hợp với hầu hết tình huống                                  | Tính năng mạnh mẽ, nhưng tương đối phức tạp hơn                               |
| **Tình huống sử dụng** | Yêu cầu AOP đơn giản trong ứng dụng Spring                                         | Yêu cầu AOP hiệu năng cao, độ phức tạp cao                                    |

**Nên chọn như thế nào?**

- **Cân nhắc tính năng**: AspectJ hỗ trợ tình huống AOP phức tạp hơn, Spring AOP đơn giản dễ dùng hơn. Nếu bạn cần nâng cao method `final`, method tĩnh, truy cập field, gọi constructor, hoặc cần áp dụng logic nâng cao trên object không được Spring quản lý, AspectJ là lựa chọn duy nhất.
- **Cân nhắc hiệu năng**: Khi số lượng aspect ít, hiệu năng hai bên không chênh lệch nhiều, nhưng khi aspect nhiều hơn, hiệu năng AspectJ tốt hơn.

**Tóm tắt một câu**: Ưu tiên dùng Spring AOP cho tình huống đơn giản; khi tình huống phức tạp hoặc yêu cầu hiệu năng cao, chọn AspectJ.

### ⭐️Các loại advice phổ biến trong AOP là gì?

![](/images/github/javaguide/system-design/framework/spring/aspectj-advice-types.jpg)

- **Before (Thông báo trước)**: Kích hoạt trước khi method của target object được gọi
- **After (Thông báo sau)**: Kích hoạt sau khi method của target object được gọi
- **AfterReturning (Thông báo trả về)**: Kích hoạt sau khi method của target object hoàn thành, sau khi trả về giá trị kết quả
- **AfterThrowing (Thông báo ngoại lệ)**: Kích hoạt sau khi method của target object ném/kích hoạt ngoại lệ. AfterReturning và AfterThrowing là loại trừ lẫn nhau. Nếu gọi method thành công không có ngoại lệ thì sẽ có giá trị trả về; nếu method ném ngoại lệ thì sẽ không có giá trị trả về.
- **Around (Thông báo bao quanh)**: Kiểm soát lập trình việc gọi method của target object. Thông báo bao quanh là loại có phạm vi thao tác lớn nhất trong tất cả các loại thông báo, vì nó có thể lấy trực tiếp target object và method cần thực thi, vì vậy thông báo bao quanh có thể làm mọi thứ trước và sau khi gọi method của target object, thậm chí không gọi method của target object

### Cách kiểm soát thứ tự thực thi của nhiều aspect?

1、Thông thường dùng annotation `@Order` để trực tiếp định nghĩa thứ tự aspect

```java
// 值越小优先级越高
@Order(3)
@Component
@Aspect
public class LoggingAspect implements Ordered {
```

**2、Cài đặt interface `Ordered` và override method `getOrder`.**

```java
@Component
@Aspect
public class LoggingAspect implements Ordered {

    // ....

    @Override
    public int getOrder() {
        // 返回值越小优先级越高
        return 1;
    }
}
```

## Spring MVC

### Hãy chia sẻ hiểu biết của bạn về Spring MVC?

MVC là viết tắt của Model (mô hình), View (giao diện), Controller (bộ điều khiển), ý tưởng cốt lõi là tổ chức code bằng cách tách biệt business logic, dữ liệu và hiển thị.

![](/images/java-guide-blog/image-20210809181452421.png)

Trên mạng có nhiều người nói MVC không phải là design pattern, chỉ là quy chuẩn thiết kế phần mềm, cá nhân tôi nghiêng về quan điểm MVC cũng là một trong nhiều design pattern. Dự án **[java-design-patterns](https://github.com/iluwatar/java-design-patterns)** cũng có giới thiệu liên quan về MVC.

![](/images/github/javaguide/system-design/framework/spring/159b3d3e70dd45e6afa81bf06d09264e.png)

Để thực sự hiểu Spring MVC, trước tiên hãy xem thời đại Model 1 và Model 2 khi chưa có Spring MVC.

**Thời đại Model 1**

Nhiều bạn học Java backend khá muộn có thể không tiếp xúc với phát triển ứng dụng JavaWeb trong thời đại Model 1. Trong chế độ Model 1, toàn bộ ứng dụng Web hầu như được cấu thành bởi các trang JSP, chỉ dùng một lượng nhỏ JavaBean để xử lý kết nối cơ sở dữ liệu, truy cập và các thao tác khác.

Trong chế độ này JSP vừa là tầng điều khiển (Controller) vừa là tầng biểu diễn (View). Rõ ràng, chế độ này tồn tại nhiều vấn đề. Ví dụ logic điều khiển và logic biểu diễn lẫn lộn với nhau, dẫn đến tỷ lệ tái sử dụng code cực thấp; lại ví dụ frontend và backend phụ thuộc lẫn nhau, khó test bảo trì và hiệu quả phát triển cực thấp.

![mvc-mode1](/images/java-guide-blog/mvc-mode1.png)

**Thời đại Model 2**

Các bạn đã học Servlet và làm các Demo liên quan hẳn biết chế độ phát triển "Java Bean(Model) + JSP (View) + Servlet (Controller)", đây là chế độ phát triển MVC JavaWeb thời kỳ đầu.

- Model: Dữ liệu liên quan đến hệ thống, tức là dao và bean.
- View: Hiển thị dữ liệu trong model, chỉ dùng để hiển thị.
- Controller: Nhận request người dùng, và gửi request đến Model, cuối cùng trả dữ liệu cho JSP và hiển thị cho người dùng

![](/images/java-guide-blog/mvc-model2.png)

Chế độ Model 2 vẫn tồn tại nhiều vấn đề, mức độ trừu tượng và đóng gói của Model 2 vẫn còn rất chưa đủ, khi sử dụng Model 2 để phát triển không thể tránh khỏi việc tạo lại bánh xe, điều này làm giảm đáng kể khả năng bảo trì và tái sử dụng của chương trình.

Vì vậy, nhiều framework MVC liên quan đến phát triển JavaWeb đã ra đời như Struts2, nhưng Struts2 khá cồng kềnh.

**Thời đại Spring MVC**

Với sự phổ biến của Spring framework nhẹ, trong hệ sinh thái Spring xuất hiện framework Spring MVC, Spring MVC là framework MVC xuất sắc nhất hiện tại. So với Struts2, Spring MVC sử dụng đơn giản và tiện lợi hơn, hiệu quả phát triển cao hơn, và Spring MVC chạy cũng nhanh hơn.

MVC là một design pattern, Spring MVC là một MVC framework xuất sắc. Spring MVC có thể giúp chúng ta phát triển tầng Web đơn giản hơn, và nó được tích hợp tự nhiên với Spring framework. Trong Spring MVC, chúng ta thường chia dự án backend thành tầng Service (xử lý nghiệp vụ), tầng Dao (thao tác cơ sở dữ liệu), tầng Entity (lớp entity), tầng Controller (tầng điều khiển, trả dữ liệu về trang frontend).

### Các component cốt lõi của Spring MVC là gì?

Nhớ được các component dưới đây, cũng có nghĩa là nhớ được nguyên lý hoạt động của SpringMVC.

- **`DispatcherServlet`**: **Bộ xử lý trung tâm cốt lõi**, chịu trách nhiệm nhận request, phân phát, và trả về response cho client.
- **`HandlerMapping`**: **Handler mapping**, theo URL đi tìm `Handler` có thể xử lý, và sẽ đóng gói cùng interceptor liên quan đến request và `Handler`.
- **`HandlerAdapter`**: **Handler adapter**, theo `Handler` được tìm bởi `HandlerMapping`, thực thi `Handler` tương ứng;
- **`Handler`**: **Request handler**, handler xử lý request thực tế.
- **`ViewResolver`**: **View resolver**, theo view logic/view được trả về bởi `Handler`, resolve và render view thực sự, và chuyển cho `DispatcherServlet` response client

### ⭐️Bạn có hiểu nguyên lý hoạt động của SpringMVC không?

**Nguyên lý Spring MVC như hình dưới đây:**

> Tôi không tự vẽ hình minh họa nguyên lý hoạt động SpringMVC, trực tiếp tìm một cái rất rõ ràng trực quan trên mạng cho tiết kiệm, nguồn gốc không rõ.

![](/images/github/javaguide/system-design/framework/spring/de6d2b213f112297298f3e223bf08f28.png)

**Giải thích luồng (quan trọng):**

1. Client (trình duyệt) gửi request, `DispatcherServlet` chặn request.
2. `DispatcherServlet` theo thông tin request gọi `HandlerMapping`. `HandlerMapping` theo URL tìm `Handler` (tức là `Controller` mà chúng ta thường nói) có thể xử lý, và sẽ đóng gói cùng interceptor liên quan đến request và `Handler`.
3. `DispatcherServlet` gọi `HandlerAdapter` để thực thi `Handler`.
4. `Handler` sau khi hoàn thành xử lý request của người dùng, sẽ trả về một object `ModelAndView` cho `DispatcherServlet`, `ModelAndView` như tên gợi ý, chứa thông tin model dữ liệu và thông tin view tương ứng. `Model` là data object được trả về, `View` là `View` logic.
5. `ViewResolver` sẽ tìm `View` thực sự theo `View` logic.
6. `DispaterServlet` truyền `Model` được trả về cho `View` (render view).
7. Trả `View` về cho requester (trình duyệt)

Luồng trên là nguyên lý hoạt động của chế độ phát triển truyền thống (JSP, Thymeleaf, v.v.). Tuy nhiên, hiện tại cách phát triển chủ đạo là frontend-backend tách biệt, trong trường hợp này khái niệm `View` của Spring MVC đã có một số thay đổi. Vì `View` thường được xử lý bởi framework frontend (Vue, React, v.v.), backend không còn chịu trách nhiệm render trang, mà chỉ chịu trách nhiệm cung cấp dữ liệu, vì vậy:

- Khi frontend-backend tách biệt, backend thường không còn trả về view cụ thể, mà trả về **dữ liệu thuần** (thường là định dạng JSON), do frontend chịu trách nhiệm render và hiển thị.
- Phần `View` trong tình huống frontend-backend tách biệt thường không cần đặt, method controller của Spring MVC chỉ cần trả về dữ liệu, không còn trả về `ModelAndView`, mà trực tiếp trả về dữ liệu, Spring sẽ tự động chuyển đổi thành định dạng JSON. Tương ứng, `ViewResolver` cũng sẽ không còn được sử dụng.

Làm thế nào để thực hiện được?

- Dùng annotation `@RestController` thay thế annotation `@Controller` truyền thống, như vậy tất cả các method mặc định sẽ trả về dữ liệu định dạng JSON, thay vì cố gắng resolve view.
- Nếu bạn dùng `@Controller`, có thể kết hợp annotation `@ResponseBody` để trả về JSON.

### Cách xử lý ngoại lệ thống nhất?

Khuyến nghị dùng annotation để xử lý ngoại lệ thống nhất, cụ thể sẽ dùng đến hai annotation `@ControllerAdvice` + `@ExceptionHandler`.

```java
@ControllerAdvice
@ResponseBody
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<?> handleAppException(BaseException ex, HttpServletRequest request) {
      //......
    }

    @ExceptionHandler(value = ResourceNotFoundException.class)
    public ResponseEntity<ErrorReponse> handleResourceNotFoundException(ResourceNotFoundException ex, HttpServletRequest request) {
      //......
    }
}
```

Trong cách xử lý ngoại lệ này, sẽ dệt logic xử lý ngoại lệ (AOP) vào tất cả hoặc một số `Controller` được chỉ định, khi method trong `Controller` ném ngoại lệ, ngoại lệ sẽ được xử lý bởi method được đánh dấu annotation `@ExceptionHandler`.

Method `getMappedMethod` trong `ExceptionHandlerMethodResolver` quyết định ngoại lệ cụ thể được xử lý bởi method nào được đánh dấu annotation `@ExceptionHandler`.

```java
@Nullable
  private Method getMappedMethod(Class<? extends Throwable> exceptionType) {
    List<Class<? extends Throwable>> matches = new ArrayList<>();
    //找到可以处理的所有异常信息。mappedMethods 中存放了异常和处理异常的方法的对应关系
    for (Class<? extends Throwable> mappedException : this.mappedMethods.keySet()) {
      if (mappedException.isAssignableFrom(exceptionType)) {
        matches.add(mappedException);
      }
    }
    // 不为空说明有方法处理异常
    if (!matches.isEmpty()) {
      // 按照匹配程度从小到大排序
      matches.sort(new ExceptionDepthComparator(exceptionType));
      // 返回处理异常的方法
      return this.mappedMethods.get(matches.get(0));
    }
    else {
      return null;
    }
  }
```

Từ mã nguồn có thể thấy: **`getMappedMethod()` sẽ trước tiên tìm tất cả thông tin method có thể khớp xử lý ngoại lệ, sau đó sắp xếp chúng từ nhỏ đến lớn, cuối cùng lấy method khớp nhỏ nhất (tức là method có độ khớp cao nhất).**

## Spring framework sử dụng những design pattern nào?

> Về giới thiệu chi tiết của các design pattern dưới đây, có thể xem bài viết [Giải thích chi tiết Design Pattern trong Spring](https://javaguide.cn/system-design/framework/spring/spring-design-patterns-summary.html) tôi đã viết.

- **Factory design pattern**: Spring sử dụng factory pattern để tạo object bean thông qua `BeanFactory`, `ApplicationContext`.
- **Proxy design pattern**: Cài đặt tính năng AOP của Spring.
- **Singleton design pattern**: Bean trong Spring mặc định đều là singleton.
- **Template method pattern**: Các lớp thao tác cơ sở dữ liệu kết thúc bằng Template trong Spring như `jdbcTemplate`, `hibernateTemplate`, chúng sử dụng template pattern.
- **Wrapper design pattern**: Dự án của chúng ta cần kết nối nhiều cơ sở dữ liệu, và các client khác nhau trong mỗi lần truy cập sẽ truy cập các cơ sở dữ liệu khác nhau theo nhu cầu. Pattern này cho phép chúng ta chuyển đổi động giữa các data source khác nhau theo nhu cầu client.
- **Observer pattern**: Mô hình event driven của Spring là ứng dụng rất kinh điển của observer pattern.
- **Adapter pattern**: Nâng cao hoặc advice (Advice) trong Spring AOP sử dụng adapter pattern, Spring MVC cũng sử dụng adapter pattern để adapt `Controller`.
- ……

## ⭐️Circular Dependency trong Spring

### Bạn có hiểu về circular dependency trong Spring không, cách giải quyết như thế nào?

Circular dependency chỉ Bean object tham chiếu vòng, là hai hoặc nhiều Bean giữ tham chiếu của nhau, ví dụ CircularDependencyA → CircularDependencyB → CircularDependencyA.

```java
@Component
public class CircularDependencyA {
    @Autowired
    private CircularDependencyB circB;
}

@Component
public class CircularDependencyB {
    @Autowired
    private CircularDependencyA circA;
}
```

Object đơn tự phụ thuộc bản thân cũng sẽ xuất hiện circular dependency, nhưng xác suất này cực thấp, thuộc về lỗi viết code.

```java
@Component
public class CircularDependencyA {
    @Autowired
    private CircularDependencyA circA;
}
```

Spring framework giải quyết vấn đề này thông qua ba cấp cache, đảm bảo tạo Bean đúng đắn kể cả trong trường hợp circular dependency.

Ba cấp cache trong Spring thực ra là ba Map, như sau:

```java
// 一级缓存
/** Cache of singleton objects: bean name to bean instance. */
private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);

// 二级缓存
/** Cache of early singleton objects: bean name to bean instance. */
private final Map<String, Object> earlySingletonObjects = new HashMap<>(16);

// 三级缓存
/** Cache of singleton factories: bean name to ObjectFactory. */
private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16);
```

Đơn giản mà nói, ba cấp cache của Spring bao gồm:

1. **Cache cấp 1 (singletonObjects)**: Chứa Bean ở dạng cuối cùng (đã khởi tạo, điền thuộc tính, khởi tạo), singleton pool, được sinh ra cho "thuộc tính singleton của Spring". Thông thường chúng ta lấy Bean từ đây, nhưng không phải tất cả Bean đều ở trong singleton pool, ví dụ prototype Bean không ở đây.
2. **Cache cấp 2 (earlySingletonObjects)**: Chứa Bean chuyển tiếp (bán thành phẩm, chưa điền thuộc tính), tức là object được tạo bởi `ObjectFactory` trong cache cấp 3, được sử dụng kết hợp với cache cấp 3, có thể ngăn trong trường hợp AOP, mỗi lần gọi `ObjectFactory#getObject()` đều tạo proxy object mới.
3. **Cache cấp 3 (singletonFactories)**: Chứa `ObjectFactory`, method `getObject()` của `ObjectFactory` (cuối cùng gọi là method `getEarlyBeanReference()`) có thể tạo Bean gốc hoặc proxy object (nếu Bean bị AOP aspect proxy). Cache cấp 3 chỉ có hiệu lực đối với singleton Bean.

Tiếp theo nói về luồng tạo Bean của Spring:

1. Trước tiên đến **cache cấp 1 `singletonObjects`** để lấy, tồn tại thì trả về;
2. Nếu không tồn tại hoặc object đang tạo, thì đến **cache cấp 2 `earlySingletonObjects`** để lấy;
3. Nếu vẫn không lấy được, thì đến **cache cấp 3 `singletonFactories`** để lấy, thông qua thực thi `getObject()` của `ObjectFacotry` có thể lấy được object đó, sau khi lấy thành công, xóa khỏi cache cấp 3, và thêm object vào cache cấp 2.

Trong cache cấp 3 lưu trữ là `ObjectFacoty`:

```java
public interface ObjectFactory<T> {
    T getObject() throws BeansException;
}
```

Khi Spring tạo Bean, nếu cho phép circular dependency, Spring sẽ đưa trước Bean vừa khởi tạo xong nhưng thuộc tính chưa được khởi tạo ra ngoài, ở đây thông qua method `addSingletonFactory`, thêm một object `ObjectFactory` vào cache cấp 3:

```java
// AbstractAutowireCapableBeanFactory # doCreateBean #
public abstract class AbstractAutowireCapableBeanFactory ... {
	protected Object doCreateBean(...) {
        //...

        // 支撑循环依赖：将 ()->getEarlyBeanReference 作为一个 ObjectFactory 对象的 getObject() 方法加入到三级缓存中
		addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));
    }
}
```

Vậy ở trên khi nói về luồng tạo Bean của Spring đã nói, nếu cache cấp 1, cache cấp 2 đều không lấy được object, sẽ đến cache cấp 3 thông qua method `getObject` của `ObjectFactory` để lấy object.

```java
class A {
    // 使用了 B
    private B b;
}
class B {
    // 使用了 A
    private A a;
}
```

Lấy code circular dependency trên làm ví dụ, toàn bộ luồng giải quyết circular dependency như sau:

- Khi Spring tạo A xong, phát hiện A phụ thuộc B, lại đi tạo B, B phụ thuộc A, lại đi tạo A;
- Khi B tạo A, lúc này A xảy ra circular dependency, do A lúc này chưa khởi tạo hoàn tất, vì vậy trong **cache cấp 1 và 2** chắc chắn không có A;
- Lúc này đi đến cache cấp 3 gọi method `getObject()` để lấy **object được expose sớm** của A, tức là gọi method `getEarlyBeanReference()` đã thêm ở trên, tạo ra một **object expose sớm** của A;
- Sau đó xóa `ObjectFactory` này khỏi cache cấp 3, và đặt object expose sớm vào cache cấp 2, vậy B sẽ tiêm object expose sớm này vào dependency, để hỗ trợ circular dependency.

**Chỉ hai cấp cache có đủ không?** Trong trường hợp không có AOP, quả thực có thể chỉ dùng cache cấp 1 và cấp 2 để giải quyết vấn đề circular dependency. Tuy nhiên, khi liên quan đến AOP, cache cấp 3 trở nên rất quan trọng, vì nó đảm bảo rằng dù trong quá trình tạo Bean có nhiều lần request tham chiếu sớm, cũng luôn chỉ trả về cùng một proxy object, từ đó tránh được vấn đề cùng một Bean có nhiều proxy object.

**Cuối cùng tóm tắt cách Spring giải quyết ba cấp cache**:

Trong phần ba cấp cache này, chủ yếu nhớ cách Spring hỗ trợ circular dependency là được, tức là nếu xảy ra circular dependency thì đến **cache cấp 3 `singletonFactories`** lấy `ObjectFactory` được lưu trong cache cấp 3 và gọi method `getObject()` của nó để lấy object expose sớm của object circular dependency này (mặc dù chưa khởi tạo hoàn tất, nhưng có thể lấy được địa chỉ lưu trữ trong heap của object đó), và đặt object expose sớm này vào cache cấp 2, như vậy trong circular dependency, sẽ không khởi tạo trùng lặp!

Tuy nhiên, cơ chế này cũng có một số nhược điểm, ví dụ tăng overhead bộ nhớ (cần duy trì ba cấp cache, tức là ba Map), giảm hiệu năng (cần thực hiện nhiều lần kiểm tra và chuyển đổi). Ngoài ra, còn có một số ít trường hợp không hỗ trợ circular dependency, ví dụ non-singleton bean và bean có annotation `@Async` không thể hỗ trợ circular dependency.

### @Lazy có thể giải quyết circular dependency không?

`@Lazy` dùng để đánh dấu lớp có cần lazy loading/delayed loading không, có thể tác dụng lên lớp, method, constructor, tham số method, biến thành viên.

Spring Boot 2.2 thêm **thuộc tính lazy loading toàn cục**, sau khi bật, tất cả bean toàn cục được đặt thành lazy loading, cần mới tạo.

Cấu hình lazy loading toàn cục trong file cấu hình:

```properties
#默认false
spring.main.lazy-initialization=true
```

Cài đặt lazy loading toàn cục theo cách code:

```java
SpringApplication springApplication=new SpringApplication(Start.class);
springApplication.setLazyInitialization(false);
springApplication.run(args);
```

Nếu không thực sự cần thiết, cố gắng không dùng lazy loading toàn cục. Lazy loading toàn cục sẽ làm chậm quá trình load lần đầu sử dụng Bean, và nó sẽ delay phát hiện vấn đề của ứng dụng (khi Bean được khởi tạo, vấn đề mới xuất hiện).

Nếu một Bean không được đánh dấu là lazy loading, thì nó sẽ được tạo và khởi tạo trong quá trình Spring IoC container khởi động. Nếu một Bean được đánh dấu là lazy loading, thì nó sẽ không được khởi tạo ngay lập tức khi Spring IoC container khởi động, mà chỉ được tạo lần đầu khi được request. Điều này có thể giúp giảm thời gian khởi tạo khi ứng dụng khởi động, cũng có thể dùng để giải quyết vấn đề circular dependency.

Vấn đề circular dependency được giải quyết như thế nào qua `@Lazy`? Ở đây lấy một ví dụ, ví dụ có hai Bean, A và B, chúng xảy ra circular dependency, thì sau khi thêm annotation `@Lazy` vào constructor của A (delay khởi tạo Bean B), luồng load như sau:

- Trước tiên Spring sẽ đi tạo Bean của A, khi tạo cần tiêm thuộc tính B;
- Do A được đánh dấu annotation `@Lazy`, vì vậy Spring sẽ tạo một proxy object của B, tiêm proxy object này vào thuộc tính B trong A;
- Sau đó bắt đầu thực hiện khởi tạo B, khi tiêm thuộc tính A trong B, lúc này A đã tạo hoàn tất, có thể tiêm A vào.

Từ luồng load trên có thể thấy: Điểm mấu chốt để `@Lazy` giải quyết circular dependency nằm ở việc sử dụng proxy object.

- **Trong trường hợp không có `@Lazy`**: Khi Spring container khởi tạo `A` sẽ ngay lập tức cố gắng tạo `B`, trong khi trong quá trình tạo `B` lại cố gắng tạo `A`, cuối cùng dẫn đến circular dependency (tức là đệ quy vô hạn, cuối cùng ném ngoại lệ).
- **Trong trường hợp dùng `@Lazy`**: Spring sẽ không ngay lập tức tạo `B`, mà sẽ tiêm một proxy object của `B`. Do lúc này `B` vẫn chưa thực sự được khởi tạo, khởi tạo của `A` có thể hoàn thành thuận lợi. Đến khi instance của `A` thực sự gọi method của `B`, proxy object mới kích hoạt khởi tạo thực sự của `B`.

`@Lazy` có thể ở một mức độ nhất định phá vỡ circular dependency chain, cho phép Spring container thuận lợi hoàn thành việc tạo và tiêm Bean. Nhưng đây không phải là giải pháp cơ bản, đặc biệt trong tình huống constructor injection, phụ thuộc nhiều cấp phức tạp, `@Lazy` không thể giải quyết hiệu quả vấn đề. Vì vậy, thực hành tốt nhất vẫn là cố gắng tránh circular dependency trong thiết kế.

### SpringBoot có cho phép circular dependency xảy ra không?

SpringBoot trước 2.6.x mặc định cho phép circular dependency, tức là code của bạn xuất hiện vấn đề circular dependency, thông thường cũng sẽ không báo lỗi. Sau SpringBoot 2.6.x chính thức không còn khuyến nghị viết code có circular dependency, khuyến nghị developer tự viết code để giảm sự phụ thuộc không cần thiết lẫn nhau. Thực ra đây cũng là điều chúng ta nên làm nhất, circular dependency bản thân là một khiếm khuyết thiết kế, chúng ta không nên quá phụ thuộc vào Spring mà bỏ qua quy chuẩn và chất lượng code, biết đâu phiên bản SpringBoot tương lai nào đó sẽ hoàn toàn cấm code circular dependency.

Sau SpringBoot 2.6.x, nếu bạn không muốn refactor code circular dependency, cũng có thể áp dụng các phương pháp sau:

- Trong file cấu hình toàn cục đặt cho phép circular dependency tồn tại: `spring.main.allow-circular-references=true`. Cách đơn giản thô bạo nhất, không khuyến nghị lắm.
- Thêm annotation `@Lazy` vào Bean gây ra circular dependency, đây là cách tương đối được khuyến nghị. `@Lazy` dùng để đánh dấu lớp có cần lazy loading/delayed loading không, có thể tác dụng lên lớp, method, constructor, tham số method, biến thành viên.
- ……

## ⭐️Transaction trong Spring

Để biết giới thiệu chi tiết về transaction Spring, xem bài viết [Giải thích chi tiết Transaction Spring](https://javaguide.cn/system-design/framework/spring/spring-transaction.html) tôi đã viết.

### Spring có bao nhiêu cách quản lý transaction?

- **Programmatic transaction (transaction lập trình)**: Hardcode trong code (khuyến nghị dùng trong hệ thống phân tán): Quản lý transaction thủ công thông qua `TransactionTemplate` hoặc `TransactionManager`, phạm vi transaction quá lớn sẽ xuất hiện transaction chưa commit gây timeout, vì vậy transaction phải có granularity nhỏ hơn lock.
- **Declarative transaction (transaction khai báo)**: Cấu hình trong file XML hoặc trực tiếp dựa trên annotation (khuyến nghị cho ứng dụng đơn thể hoặc hệ thống nghiệp vụ đơn giản): Thực ra được thực hiện thông qua AOP (cách dùng annotation toàn phần dựa trên `@Transactional` là phổ biến nhất)

### Transaction trong Spring có những loại hành vi truyền bá nào?

**Hành vi truyền bá transaction là để giải quyết vấn đề transaction khi các method tầng nghiệp vụ gọi lẫn nhau**.

Khi method transaction được gọi bởi một method transaction khác, phải chỉ định cách transaction nên truyền bá. Ví dụ: Method có thể tiếp tục chạy trong transaction hiện tại, hoặc có thể mở một transaction mới và chạy trong transaction của chính mình.

Các giá trị hành vi truyền bá transaction đúng đắn như sau:

**1.`TransactionDefinition.PROPAGATION_REQUIRED`**

Hành vi truyền bá transaction được dùng nhiều nhất, annotation `@Transactional` mà chúng ta thường dùng mặc định dùng hành vi truyền bá transaction này. Nếu hiện tại có transaction thì tham gia vào transaction đó; nếu hiện tại không có transaction thì tạo một transaction mới.

**`2.TransactionDefinition.PROPAGATION_REQUIRES_NEW`**

Tạo một transaction mới, nếu hiện tại có transaction thì treo transaction hiện tại. Tức là bất kể method bên ngoài có bật transaction hay không, method bên trong được đánh dấu `Propagation.REQUIRES_NEW` sẽ mở transaction mới của mình, và các transaction được mở là độc lập, không ảnh hưởng lẫn nhau.

**3.`TransactionDefinition.PROPAGATION_NESTED`**

Nếu hiện tại có transaction, tạo một transaction làm nested transaction của transaction hiện tại để chạy; nếu hiện tại không có transaction, thì giá trị này tương đương với `TransactionDefinition.PROPAGATION_REQUIRED`.

**4.`TransactionDefinition.PROPAGATION_MANDATORY`**

Nếu hiện tại có transaction thì tham gia vào transaction đó; nếu hiện tại không có transaction thì ném ngoại lệ. (mandatory: bắt buộc)

Cái này ít được dùng.

Nếu cấu hình sai 3 loại hành vi truyền bá transaction sau, transaction sẽ không rollback:

- **`TransactionDefinition.PROPAGATION_SUPPORTS`**: Nếu hiện tại có transaction thì tham gia vào transaction đó; nếu hiện tại không có transaction thì tiếp tục chạy theo cách non-transaction.
- **`TransactionDefinition.PROPAGATION_NOT_SUPPORTED`**: Chạy theo cách non-transaction, nếu hiện tại có transaction thì treo transaction hiện tại.
- **`TransactionDefinition.PROPAGATION_NEVER`**: Chạy theo cách non-transaction, nếu hiện tại có transaction thì ném ngoại lệ.

### Transaction trong Spring có những cấp độ isolation nào?

Tương tự như phần hành vi truyền bá transaction, để thuận tiện sử dụng, Spring cũng định nghĩa tương ứng một enum class: `Isolation`

```java
public enum Isolation {

    DEFAULT(TransactionDefinition.ISOLATION_DEFAULT),
    READ_UNCOMMITTED(TransactionDefinition.ISOLATION_READ_UNCOMMITTED),
    READ_COMMITTED(TransactionDefinition.ISOLATION_READ_COMMITTED),
    REPEATABLE_READ(TransactionDefinition.ISOLATION_REPEATABLE_READ),
    SERIALIZABLE(TransactionDefinition.ISOLATION_SERIALIZABLE);

    private final int value;

    Isolation(int value) {
        this.value = value;
    }

    public int value() {
        return this.value;
    }

}
```

Dưới đây tôi lần lượt giới thiệu từng cấp độ isolation transaction:

- **`TransactionDefinition.ISOLATION_DEFAULT`**: Dùng cấp độ isolation mặc định của cơ sở dữ liệu backend, MySQL mặc định dùng cấp độ isolation `REPEATABLE_READ`, Oracle mặc định dùng cấp độ isolation `READ_COMMITTED`.
- **`TransactionDefinition.ISOLATION_READ_UNCOMMITTED`**: Cấp độ isolation thấp nhất, ít dùng cấp độ isolation này vì nó cho phép đọc dữ liệu thay đổi chưa được commit, **có thể gây dirty read, phantom read hoặc non-repeatable read**
- **`TransactionDefinition.ISOLATION_READ_COMMITTED`**: Cho phép đọc dữ liệu đã được commit bởi transaction concurrent, **có thể ngăn dirty read, nhưng phantom read hoặc non-repeatable read vẫn có thể xảy ra**
- **`TransactionDefinition.ISOLATION_REPEATABLE_READ`**: Kết quả đọc nhiều lần cùng một field là nhất quán, trừ khi dữ liệu bị chỉnh sửa bởi chính transaction đó, **có thể ngăn dirty read và non-repeatable read, nhưng phantom read vẫn có thể xảy ra.**
- **`TransactionDefinition.ISOLATION_SERIALIZABLE`**: Cấp độ isolation cao nhất, hoàn toàn tuân theo cấp độ isolation ACID. Tất cả transaction lần lượt thực thi tuần tự, như vậy giữa các transaction hoàn toàn không thể can thiệp lẫn nhau, tức là, **cấp độ này có thể ngăn dirty read, non-repeatable read và phantom read**. Nhưng điều này sẽ ảnh hưởng nghiêm trọng đến hiệu năng của chương trình. Thông thường cũng không dùng đến cấp độ này.

### Bạn có hiểu annotation @Transactional(rollbackFor = Exception.class) không?

`Exception` được chia thành runtime exception `RuntimeException` và non-runtime exception. Quản lý transaction rất quan trọng cho ứng dụng enterprise, dù có exception xảy ra cũng có thể đảm bảo tính nhất quán dữ liệu.

Khi annotation `@Transactional` tác dụng lên lớp, tất cả các method public của lớp đó sẽ có thuộc tính transaction của kiểu này, đồng thời chúng ta cũng có thể dùng annotation này ở cấp method để override định nghĩa cấp lớp.

Chiến lược rollback mặc định của annotation `@Transactional` là chỉ rollback transaction khi gặp `RuntimeException` (runtime exception) hoặc `Error`, và không rollback `Checked Exception` (checked exception). Điều này là vì Spring cho rằng `RuntimeException` và Error là lỗi không thể dự đoán trước, còn checked exception là lỗi có thể dự đoán trước, có thể xử lý thông qua business logic.

![](/images/github/javaguide/system-design/framework/spring/spring-transactional-rollbackfor.png)

Nếu muốn chỉnh sửa chiến lược rollback mặc định, có thể dùng thuộc tính `rollbackFor` và `noRollbackFor` của annotation `@Transactional` để chỉ định exception nào cần rollback, exception nào không cần rollback. Ví dụ, nếu muốn tất cả exception đều rollback transaction, có thể dùng annotation như sau:

```java
@Transactional(rollbackFor = Exception.class)
public void someMethod() {
// some business logic
}
```

Nếu muốn một số exception cụ thể không rollback transaction, có thể dùng annotation như sau:

```java
@Transactional(noRollbackFor = CustomException.class)
public void someMethod() {
// some business logic
}
```

## Spring Data JPA

JPA điều quan trọng là thực chiến, ở đây chỉ tổng hợp một phần nhỏ kiến thức.

### Cách dùng JPA để không persistent một field trong cơ sở dữ liệu?

Giả sử chúng ta có lớp sau:

```java
@Entity(name="USER")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID")
    private Long id;

    @Column(name="USER_NAME")
    private String userName;

    @Column(name="PASSWORD")
    private String password;

    private String secrect;

}
```

Nếu chúng ta muốn field `secrect` không được persistent, tức là không được lưu trữ bởi cơ sở dữ liệu thì làm thế nào? Chúng ta có thể áp dụng một số phương pháp sau:

```java
static String transient1; // not persistent because of static
final String transient2 = "Satish"; // not persistent because of final
transient String transient3; // not persistent because of transient
@Transient
String transient4; // not persistent because of @Transient
```

Thông thường dùng hai cách sau nhiều hơn, cá nhân tôi dùng cách annotation nhiều hơn.

### Tính năng audit của JPA dùng để làm gì? Có tác dụng gì?

Tính năng audit chủ yếu giúp chúng ta ghi lại hành vi thao tác cơ sở dữ liệu cụ thể như record nào đó được ai tạo, tạo lúc mấy giờ, người chỉnh sửa cuối cùng là ai, thời gian chỉnh sửa cuối cùng là lúc nào.

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
@EntityListeners(value = AuditingEntityListener.class)
public abstract class AbstractAuditBase {

    @CreatedDate
    @Column(updatable = false)
    @JsonIgnore
    private Instant createdAt;

    @LastModifiedDate
    @JsonIgnore
    private Instant updatedAt;

    @CreatedBy
    @Column(updatable = false)
    @JsonIgnore
    private String createdBy;

    @LastModifiedBy
    @JsonIgnore
    private String updatedBy;
}
```

- `@CreatedDate`: Cho biết field này là field thời gian tạo, khi entity này được insert, giá trị sẽ được đặt

- `@CreatedBy`: Cho biết field này là người tạo, khi entity này được insert, giá trị sẽ được đặt

  `@LastModifiedDate`, `@LastModifiedBy` tương tự.

### Các annotation quan hệ liên kết giữa các entity là gì?

- `@OneToOne`: Một-một.
- `@ManyToMany`: Nhiều-nhiều.
- `@OneToMany`: Một-nhiều.
- `@ManyToOne`: Nhiều-một.

Dùng `@ManyToOne` và `@OneToMany` cũng có thể biểu diễn quan hệ liên kết nhiều-nhiều.

## Spring Security

Spring Security điều quan trọng là thực chiến, ở đây chỉ tổng hợp một phần nhỏ kiến thức.

### Có những phương pháp nào để kiểm soát quyền truy cập request?

![](/images/github/javaguide/system-design/framework/spring/image-20220728201854641.png)

- `permitAll()`: Cho phép truy cập vô điều kiện dưới mọi hình thức, bất kể bạn đã đăng nhập hay chưa.
- `anonymous()`: Cho phép truy cập ẩn danh, tức là chưa đăng nhập mới có thể truy cập.
- `denyAll()`: Từ chối vô điều kiện mọi hình thức truy cập.
- `authenticated()`: Chỉ cho phép người dùng đã xác thực truy cập.
- `fullyAuthenticated()`: Chỉ cho phép người dùng đã đăng nhập hoặc đăng nhập qua remember-me truy cập.
- `hasRole(String)`: Chỉ cho phép role được chỉ định truy cập.
- `hasAnyRole(String)`: Chỉ định một hoặc nhiều role, người dùng thỏa mãn một trong số đó là có thể truy cập.
- `hasAuthority(String)`: Chỉ cho phép người dùng có quyền được chỉ định truy cập
- `hasAnyAuthority(String)`: Chỉ định một hoặc nhiều quyền, người dùng thỏa mãn một trong số đó là có thể truy cập.
- `hasIpAddress(String)`: Chỉ cho phép người dùng có IP được chỉ định truy cập.

### hasRole và hasAuthority có khác nhau không?

Có thể xem bài viết này của Song Ge: [hasRole và hasAuthority trong Spring Security có khác nhau không?](https://mp.weixin.qq.com/s/GTNOa2k9_n_H0w24upClRw), giới thiệu khá chi tiết.

### ⭐️Cách mã hóa mật khẩu như thế nào?

Nếu chúng ta cần lưu các dữ liệu nhạy cảm như mật khẩu vào cơ sở dữ liệu, cần mã hóa trước rồi mới lưu.

Spring Security cung cấp nhiều cài đặt thuật toán mã hóa, dùng ngay không cần cấu hình, rất thuận tiện. Interface của các lớp cài đặt thuật toán mã hóa này là `PasswordEncoder`, nếu bạn muốn tự cài đặt một thuật toán mã hóa, cũng cần cài đặt interface `PasswordEncoder`.

Interface `PasswordEncoder` tổng cộng có 3 method bắt buộc cài đặt.

```java
public interface PasswordEncoder {
    // 加密也就是对原始密码进行编码
    String encode(CharSequence var1);
    // 比对原始密码和数据库中保存的密码
    boolean matches(CharSequence var1, String var2);
    // 判断加密密码是否需要再次进行加密，默认返回 false
    default boolean upgradeEncoding(String encodedPassword) {
        return false;
    }
}
```

![](/images/github/javaguide/system-design/framework/spring/image-20220728183540954.png)

Chính thức khuyến nghị dùng lớp cài đặt thuật toán mã hóa dựa trên hàm hash mạnh bcrypt.

### Cách thay đổi thuật toán mã hóa hệ thống một cách thanh lịch?

Nếu trong quá trình phát triển, đột nhiên phát hiện thuật toán mã hóa hiện tại không thể đáp ứng nhu cầu của chúng ta, cần thay đổi sang thuật toán mã hóa khác, lúc này nên làm thế nào?

Cách được khuyến nghị là thông qua `DelegatingPasswordEncoder` tương thích nhiều phương án mã hóa mật khẩu khác nhau, để thích ứng với các nhu cầu nghiệp vụ khác nhau.

Từ tên cũng có thể thấy, `DelegatingPasswordEncoder` thực ra là một lớp proxy, không phải là một thuật toán mã hóa hoàn toàn mới, điều nó làm là proxy các lớp cài đặt thuật toán mã hóa đã đề cập ở trên. Trong Spring Security 5.0 trở đi, mã hóa mật khẩu mặc định dựa trên `DelegatingPasswordEncoder`.

## Tài liệu tham khảo

- 《Spring 技术内幕》
- 《从零开始深入学习 Spring》: <https://juejin.cn/book/6857911863016390663>
- <http://www.cnblogs.com/wmyskxz/p/8820371.html>
- <https://www.journaldev.com/2696/spring-interview-questions-and-answers>
- <https://www.edureka.co/blog/interview-questions/spring-interview-questions/>
- <https://www.cnblogs.com/clwydjgs/p/9317849.html>
- <https://howtodoinjava.com/interview-questions/top-spring-interview-questions-with-answers/>
- <http://www.tomaszezula.com/2014/02/09/spring-series-part-5-component-vs-bean/>
- <https://stackoverflow.com/questions/34172888/difference-between-bean-and-autowired>

<!-- @include: @article-footer.snippet.md -->
