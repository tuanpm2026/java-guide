---
title: Tổng hợp các annotation thường dùng trong Spring&SpringMVC&SpringBoot
description: Tổng hợp đầy đủ các annotation thường dùng trong Spring và SpringBoot, bao gồm hướng dẫn chi tiết cách sử dụng các annotation cốt lõi như @Autowired, @Component, @RequestMapping.
category: Framework
tag:
  - SpringBoot
  - Spring
head:
  - - meta
    - name: keywords
      content: Spring注解,Spring Boot注解,@SpringBootApplication,@Autowired,@RequestMapping,@Configuration,@Component,常用注解
---

Có thể nói không ngoa rằng, các annotation Spring/SpringBoot thường dùng được giới thiệu trong bài viết này về cơ bản đã bao phủ hầu hết các tình huống phổ biến mà bạn gặp trong công việc. Đối với mỗi annotation, bài viết này đều cung cấp cách sử dụng cụ thể. Sau khi nắm vững những nội dung này, việc phát triển dự án bằng Spring Boot sẽ không còn là vấn đề lớn nữa!

**Tại sao viết bài viết này?**

Gần đây tôi thấy trên mạng có một bài viết về các annotation thường dùng trong Spring Boot được chia sẻ rộng rãi, nhưng nội dung bài viết có một số điểm gây hiểu nhầm, có thể không thân thiện với những developer chưa có nhiều kinh nghiệm thực tế. Vì vậy tôi đã dành vài ngày để tổng hợp bài viết này, hy vọng có thể giúp mọi người hiểu và sử dụng các annotation Spring tốt hơn.

**Do năng lực và thời gian cá nhân có hạn, nếu có bất kỳ lỗi hay thiếu sót nào, rất mong được góp ý! Xin chân thành cảm ơn!**

## Các annotation cơ bản của Spring Boot

`@SpringBootApplication` là annotation cốt lõi của ứng dụng Spring Boot, thường được dùng để đánh dấu lớp khởi động chính.

Ví dụ:

```java
@SpringBootApplication
public class SpringSecurityJwtGuideApplication {
      public static void main(java.lang.String[] args) {
        SpringApplication.run(SpringSecurityJwtGuideApplication.class, args);
    }
}
```

Chúng ta có thể coi `@SpringBootApplication` là sự kết hợp của ba annotation dưới đây:

- **`@EnableAutoConfiguration`**: Bật cơ chế tự động cấu hình của Spring Boot.
- **`@ComponentScan`**: Quét các lớp được đánh dấu bởi `@Component`, `@Service`, `@Repository`, `@Controller`, v.v.
- **`@Configuration`**: Cho phép đăng ký thêm các Spring Bean hoặc import các lớp cấu hình khác.

Mã nguồn như sau:

```java
package org.springframework.boot.autoconfigure;
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(excludeFilters = {
    @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
    @Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
public @interface SpringBootApplication {
   ......
}

package org.springframework.boot;
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Configuration
public @interface SpringBootConfiguration {

}
```

## Spring Bean

### Dependency Injection (DI - Tiêm phụ thuộc)

`@Autowired` được dùng để tự động tiêm các phụ thuộc (tức là các Spring Bean khác). Nó có thể được đánh dấu trên constructor, field, Setter method hoặc configuration method, Spring container sẽ tự động tìm Bean khớp kiểu và tiêm vào.

```java
@Service
public class UserServiceImpl implements UserService {
    // ...
}

@RestController
public class UserController {
    // Tiêm qua field
    @Autowired
    private UserService userService;
    // ...
}
```

Khi tồn tại nhiều Bean cùng kiểu, `@Autowired` mặc định tiêm theo kiểu có thể gây ra sự mơ hồ. Lúc này, có thể kết hợp với `@Qualifier`, chỉ định tên Bean để chọn chính xác instance cần tiêm.

```java
@Repository("userRepositoryA")
public class UserRepositoryA implements UserRepository { /* ... */ }

@Repository("userRepositoryB")
public class UserRepositoryB implements UserRepository { /* ... */ }

@Service
public class UserService {
    @Autowired
    @Qualifier("userRepositoryA") // 指定注入名为 "userRepositoryA" 的 Bean
    private UserRepository userRepository;
    // ...
}
```

`@Primary` cũng nhằm giải quyết vấn đề tiêm khi tồn tại nhiều instance Bean cùng kiểu. Thêm annotation `@Primary` vào khi định nghĩa Bean (ví dụ dùng `@Bean` hoặc annotation lớp), nghĩa là Bean đó là đối tượng tiêm **ưu tiên**. Khi thực hiện tiêm `@Autowired`, nếu không dùng `@Qualifier` để chỉ định tên, Spring sẽ ưu tiên chọn Bean có `@Primary`.

```java
@Primary // 将 UserRepositoryA 设为首选注入对象
@Repository("userRepositoryA")
public class UserRepositoryA implements UserRepository { /* ... */ }

@Repository("userRepositoryB")
public class UserRepositoryB implements UserRepository { /* ... */ }

@Service
public class UserService {
    @Autowired // 会自动注入 UserRepositoryA，因为它是 @Primary
    private UserRepository userRepository;
    // ...
}
```

`@Resource(name="beanName")` là annotation được định nghĩa theo đặc tả JSR-250, cũng được dùng để tiêm phụ thuộc. Mặc định nó tìm Bean theo **tên (by Name)** để tiêm, còn `@Autowired` mặc định theo **kiểu (by Type)**. Nếu không chỉ định thuộc tính `name`, nó sẽ cố tìm theo tên field hoặc tên method, nếu không tìm thấy sẽ quay lại tìm theo kiểu (tương tự `@Autowired`).

`@Resource` chỉ có thể đánh dấu trên field và Setter method, không hỗ trợ tiêm qua constructor.

```java
@Service
public class UserService {
    @Resource(name = "userRepositoryA")
    private UserRepository userRepository;
    // ...
}
```

### Phạm vi Bean

`@Scope("scopeName")` định nghĩa phạm vi của Spring Bean, tức là vòng đời và phạm vi hiển thị của instance Bean. Các phạm vi thường dùng bao gồm:

- **singleton**: Trong IoC container chỉ có một instance bean duy nhất. Các bean trong Spring mặc định đều là singleton, là ứng dụng của mẫu thiết kế singleton.
- **prototype**: Mỗi lần lấy sẽ tạo một instance bean mới. Nghĩa là, gọi `getBean()` hai lần liên tiếp sẽ nhận được hai instance Bean khác nhau.
- **request** (chỉ dùng cho ứng dụng Web): Mỗi HTTP request sẽ tạo ra một bean mới (request bean), bean đó chỉ có hiệu lực trong HTTP request hiện tại.
- **session** (chỉ dùng cho ứng dụng Web): Mỗi HTTP request từ session mới sẽ tạo ra một bean mới (session bean), bean đó chỉ có hiệu lực trong HTTP session hiện tại.
- **application/global-session** (chỉ dùng cho ứng dụng Web): Mỗi ứng dụng Web tạo ra một Bean khi khởi động (application Bean), bean đó chỉ có hiệu lực trong thời gian khởi động ứng dụng hiện tại.
- **websocket** (chỉ dùng cho ứng dụng Web): Mỗi phiên WebSocket tạo ra một bean mới.

```java
@Component
// 每次获取都会创建新的 PrototypeBean 实例
@Scope("prototype")
public class PrototypeBean {
    // ...
}
```

### Đăng ký Bean

Spring container cần biết những lớp nào cần được quản lý như Bean. Ngoài việc khai báo tường minh bằng method `@Bean` (thường trong lớp `@Configuration`), cách phổ biến hơn là dùng annotation Stereotype (kiểu hình thức) để đánh dấu lớp, kết hợp với cơ chế Component Scanning, để Spring tự động phát hiện và đăng ký các lớp đó như Bean. Các Bean này sau đó có thể được tiêm vào các component khác thông qua `@Autowired` và các cách khác.

Dưới đây là một số annotation thường dùng để đăng ký Bean:

- `@Component`: Annotation chung, có thể đánh dấu bất kỳ lớp nào là component của `Spring`. Nếu một Bean không biết thuộc tầng nào, có thể dùng annotation `@Component` để đánh dấu.
- `@Repository`: Tương ứng với tầng persistence (Dao), chủ yếu dùng cho các thao tác liên quan đến cơ sở dữ liệu.
- `@Service`: Tương ứng với tầng service, chủ yếu liên quan đến một số logic phức tạp, cần sử dụng tầng Dao.
- `@Controller`: Tương ứng với tầng controller của Spring MVC, chủ yếu dùng để nhận request của người dùng và gọi tầng Service để trả dữ liệu về trang frontend.
- `@RestController`: Một annotation kết hợp, tương đương với `@Controller` + `@ResponseBody`. Nó được thiết kế chuyên biệt cho controller của RESTful Web service. Các lớp được đánh dấu `@RestController`, tất cả các handler method của chúng đều tự động serialize giá trị trả về (thường là JSON) và ghi vào HTTP response body, thay vì được giải thích là tên view.

`@Controller` vs `@RestController`:

- `@Controller`: Chủ yếu dùng cho ứng dụng Spring MVC truyền thống, giá trị trả về của method thường là tên view logic, cần view resolver để render trang. Nếu cần trả về dữ liệu (như JSON), cần thêm annotation `@ResponseBody` vào method.
- `@RestController`: Được thiết kế chuyên biệt để xây dựng RESTful API trả về dữ liệu. Sau khi dùng annotation này trên lớp, giá trị trả về của tất cả các method mặc định được coi là nội dung response body (tương đương mỗi method đều ngầm thêm `@ResponseBody`), thường dùng để trả về dữ liệu JSON hoặc XML. Trong các ứng dụng frontend-backend tách biệt hiện đại, `@RestController` là lựa chọn phổ biến hơn.

Về so sánh `@RestController` và `@Controller`, xem bài viết này: [@RestController vs @Controller](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485544&idx=1&sn=3cc95b88979e28fe3bfe539eb421c6d8&chksm=cea247a3f9d5ceb5e324ff4b8697adc3e828ecf71a3468445e70221cce768d1e722085359907&token=1725092312&lang=zh_CN#rd).

## Cấu hình

### Khai báo lớp cấu hình

`@Configuration` chủ yếu dùng để khai báo một lớp là lớp cấu hình của Spring. Mặc dù có thể thay thế bằng annotation `@Component`, nhưng `@Configuration` thể hiện mục đích của lớp rõ ràng hơn (định nghĩa Bean), ngữ nghĩa rõ ràng hơn, cũng thuận tiện cho Spring thực hiện các xử lý đặc biệt (ví dụ, thông qua CGLIB proxy đảm bảo hành vi singleton của method `@Bean`).

```java
@Configuration
public class AppConfig {

    // @Bean 注解用于在配置类中声明一个 Bean
    @Bean
    public TransferService transferService() {
        return new TransferServiceImpl();
    }

    // 配置类中可以包含一个或多个 @Bean 方法。
}
```

### Đọc thông tin cấu hình

Trong quá trình phát triển ứng dụng, chúng ta thường cần quản lý một số thông tin cấu hình, ví dụ chi tiết kết nối cơ sở dữ liệu, khóa hoặc địa chỉ của các dịch vụ bên thứ ba (như Alibaba Cloud OSS, dịch vụ SMS, xác thực WeChat). Thông thường, những thông tin này sẽ được **lưu trữ tập trung trong file cấu hình** (như `application.yml` hoặc `application.properties`) để thuận tiện quản lý và chỉnh sửa.

Spring cung cấp nhiều cách tiện lợi để đọc các thông tin cấu hình này. Giả sử chúng ta có file `application.yml` như sau:

```yaml
wuhan2020: 2020年初武汉爆发了新型冠状病毒，疫情严重，但是，我相信一切都会过去！武汉加油！中国加油！

my-profile:
  name: Guide哥
  email: koushuangbwcx@163.com

library:
  location: 湖北武汉加油中国加油
  books:
    - name: 天才基本法
      description: 二十二岁的林朝夕在父亲确诊阿尔茨海默病这天，得知自己暗恋多年的校园男神裴之即将出国深造的消息——对方考取的学校，恰是父亲当年为她放弃的那所。
    - name: 时间的秩序
      description: 为什么我们记得过去，而非未来？时间"流逝"意味着什么？是我们存在于时间之内，还是时间存在于我们之中？卡洛·罗韦利用诗意的文字，邀请我们思考这一亘古难题——时间的本质。
    - name: 了不起的我
      description: 如何养成一个新习惯？如何让心智变得更成熟？如何拥有高质量的关系？ 如何走出人生的艰难时刻？
```

Dưới đây giới thiệu một số cách thường dùng để đọc cấu hình:

1、`@Value("${property.key}")` tiêm giá trị thuộc tính đơn lẻ từ file cấu hình (như `application.properties` hoặc `application.yml`). Nó cũng hỗ trợ Spring Expression Language (SpEL), có thể thực hiện logic tiêm phức tạp hơn.

```java
@Value("${wuhan2020}")
String wuhan2020;
```

2、`@ConfigurationProperties` có thể đọc thông tin cấu hình và ràng buộc với Bean, được dùng nhiều hơn.

```java
@Component
@ConfigurationProperties(prefix = "library")
class LibraryProperties {
    @NotEmpty
    private String location;
    private List<Book> books;

    @Setter
    @Getter
    @ToString
    static class Book {
        String name;
        String description;
    }
  省略getter/setter
  ......
}
```

Bạn có thể tiêm nó vào lớp và sử dụng như một Spring Bean thông thường.

```java
@Service
public class LibraryService {

    private final LibraryProperties libraryProperties;

    @Autowired
    public LibraryService(LibraryProperties libraryProperties) {
        this.libraryProperties = libraryProperties;
    }

    public void printLibraryInfo() {
        System.out.println(libraryProperties);
    }
}
```

### Tải file cấu hình được chỉ định

Annotation `@PropertySource` cho phép tải file cấu hình tùy chỉnh. Phù hợp cho các tình huống cần lưu trữ một phần thông tin cấu hình riêng biệt.

```java
@Component
@PropertySource("classpath:website.properties")

class WebSite {
    @Value("${url}")
    private String url;

  省略getter/setter
  ......
}
```

**Lưu ý**: Khi sử dụng `@PropertySource`, hãy đảm bảo đường dẫn file bên ngoài chính xác và file nằm trong classpath.

Xem thêm tại bài viết của tôi: [10 phút giải quyết cách đọc file cấu hình một cách thanh lịch trong SpringBoot?](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247486181&idx=2&sn=10db0ae64ef501f96a5b0dbc4bd78786&chksm=cea2452ef9d5cc384678e456427328600971180a77e40c13936b19369672ca3e342c26e92b50&token=816772476&lang=zh_CN#rd).

## MVC

### HTTP Request

**5 loại request phổ biến:**

- **GET**: Request lấy tài nguyên cụ thể từ server. Ví dụ: `GET /users` (lấy tất cả học sinh)
- **POST**: Tạo tài nguyên mới trên server. Ví dụ: `POST /users` (tạo học sinh)
- **PUT**: Cập nhật tài nguyên trên server (client cung cấp toàn bộ tài nguyên đã cập nhật). Ví dụ: `PUT /users/12` (cập nhật học sinh có mã 12)
- **DELETE**: Xóa tài nguyên cụ thể khỏi server. Ví dụ: `DELETE /users/12` (xóa học sinh có mã 12)
- **PATCH**: Cập nhật tài nguyên trên server (client cung cấp các thuộc tính thay đổi, có thể coi là cập nhật một phần), ít được dùng nên không ví dụ ở đây.

#### GET request

`@GetMapping("users")` tương đương với `@RequestMapping(value="/users",method=RequestMethod.GET)`.

```java
@GetMapping("/users")
public ResponseEntity<List<User>> getAllUsers() {
 return userRepository.findAll();
}
```

#### POST request

`@PostMapping("users")` tương đương với `@RequestMapping(value="/users",method=RequestMethod.POST)`.

`@PostMapping` thường kết hợp với `@RequestBody`, dùng để nhận dữ liệu JSON và ánh xạ thành đối tượng Java.

```java
@PostMapping("/users")
public ResponseEntity<User> createUser(@Valid @RequestBody UserCreateRequest userCreateRequest) {
 return userRepository.save(userCreateRequest);
}
```

#### PUT request

`@PutMapping("/users/{userId}")` tương đương với `@RequestMapping(value="/users/{userId}",method=RequestMethod.PUT)`.

```java
@PutMapping("/users/{userId}")
public ResponseEntity<User> updateUser(@PathVariable(value = "userId") Long userId,
  @Valid @RequestBody UserUpdateRequest userUpdateRequest) {
  ......
}
```

#### DELETE request

`@DeleteMapping("/users/{userId}")` tương đương với `@RequestMapping(value="/users/{userId}",method=RequestMethod.DELETE)`

```java
@DeleteMapping("/users/{userId}")
public ResponseEntity deleteUser(@PathVariable(value = "userId") Long userId){
  ......
}
```

#### PATCH request

Trong các dự án thực tế, chúng ta thường chỉ dùng PATCH request để cập nhật dữ liệu khi PUT không đủ.

```java
  @PatchMapping("/profile")
  public ResponseEntity updateStudent(@RequestBody StudentUpdateRequest studentUpdateRequest) {
        studentRepository.updateDetail(studentUpdateRequest);
        return ResponseEntity.ok().build();
    }
```

### Ràng buộc tham số

Khi xử lý HTTP request, Spring MVC cung cấp nhiều annotation để ràng buộc tham số request vào tham số method. Dưới đây là các cách ràng buộc tham số thường gặp:

#### Trích xuất tham số từ URL path

`@PathVariable` dùng để trích xuất tham số từ URL path. Ví dụ:

```java
@GetMapping("/klasses/{klassId}/teachers")
public List<Teacher> getTeachersByClass(@PathVariable("klassId") Long klassId) {
    return teacherService.findTeachersByClass(klassId);
}
```

Nếu URL request là `/klasses/123/teachers`, thì `klassId = 123`.

#### Ràng buộc tham số query

`@RequestParam` dùng để ràng buộc tham số query. Ví dụ:

```java
@GetMapping("/klasses/{klassId}/teachers")
public List<Teacher> getTeachersByClass(@PathVariable Long klassId,
                                        @RequestParam(value = "type", required = false) String type) {
    return teacherService.findTeachersByClassAndType(klassId, type);
}
```

Nếu URL request là `/klasses/123/teachers?type=web`, thì `klassId = 123`, `type = web`.

#### Ràng buộc dữ liệu JSON trong request body

`@RequestBody` dùng để đọc phần body của Request (có thể là POST, PUT, DELETE, GET request) với **Content-Type là application/json**, sau khi nhận dữ liệu sẽ tự động ràng buộc dữ liệu vào đối tượng Java. Hệ thống sẽ dùng `HttpMessageConverter` hoặc `HttpMessageConverter` tùy chỉnh để chuyển đổi chuỗi json trong body của request thành đối tượng java.

Tôi dùng một ví dụ đơn giản để minh họa cách sử dụng cơ bản!

Chúng ta có một interface đăng ký:

```java
@PostMapping("/sign-up")
public ResponseEntity signUp(@RequestBody @Valid UserRegisterRequest userRegisterRequest) {
  userService.save(userRegisterRequest);
  return ResponseEntity.ok().build();
}
```

Đối tượng `UserRegisterRequest`:

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisterRequest {
    @NotBlank
    private String userName;
    @NotBlank
    private String password;
    @NotBlank
    private String fullName;
}
```

Chúng ta gửi post request đến interface này, và body mang dữ liệu JSON:

```json
{ "userName": "coder", "fullName": "shuangkou", "password": "123456" }
```

Như vậy backend của chúng ta có thể trực tiếp ánh xạ dữ liệu định dạng json vào lớp `UserRegisterRequest`.

![](./images/spring-annotations/@RequestBody.png)

**Lưu ý**:

- Một method chỉ có thể có một tham số `@RequestBody`, nhưng có thể có nhiều `@PathVariable` và `@RequestParam`.
- Nếu cần nhận nhiều đối tượng phức tạp, nên gộp thành một đối tượng duy nhất.

## Validation dữ liệu

Validation dữ liệu là khâu then chốt để đảm bảo tính ổn định và bảo mật của hệ thống. Dù đã thực hiện validation dữ liệu ở giao diện người dùng (frontend), **backend service vẫn phải validate lại dữ liệu nhận được**. Điều này là vì validation frontend có thể dễ dàng bị bỏ qua (ví dụ, thông qua developer tools để chỉnh sửa request hoặc dùng các công cụ HTTP như Postman, curl để gọi API trực tiếp), dữ liệu có hại hoặc sai có thể được gửi trực tiếp đến backend. Vì vậy, validation backend là hàng rào cuối cùng, cũng là quan trọng nhất để ngăn chặn dữ liệu bất hợp lệ, duy trì tính nhất quán dữ liệu, đảm bảo logic nghiệp vụ thực thi đúng.

Bean Validation là bộ đặc tả định nghĩa tiêu chuẩn validation tham số JavaBean (JSR 303, 349, 380), cung cấp một loạt annotation có thể dùng trực tiếp trên thuộc tính JavaBean, từ đó thực hiện validation tham số thuận tiện.

- **JSR 303 (Bean Validation 1.0):** Đặt nền móng, giới thiệu các annotation validation cốt lõi (như `@NotNull`, `@Size`, `@Min`, `@Max`, v.v.), định nghĩa cách validate thuộc tính JavaBean bằng annotation, hỗ trợ validation đối tượng lồng nhau và validator tùy chỉnh.
- **JSR 349 (Bean Validation 1.1):** Mở rộng trên nền tảng 1.0, ví dụ giới thiệu hỗ trợ validation tham số method và giá trị trả về, tăng cường xử lý Group Validation.
- **JSR 380 (Bean Validation 2.0):** Tận dụng các tính năng mới của Java 8 và thực hiện một số cải tiến, ví dụ hỗ trợ kiểu ngày giờ trong package `java.time`, giới thiệu một số annotation validation mới (như `@NotEmpty`, `@NotBlank`, v.v.).

Bean Validation bản thân chỉ là một bộ **đặc tả (interface và annotation)**, chúng ta cần một **framework cụ thể** cài đặt bộ đặc tả này để thực thi logic validation. Hiện tại, **Hibernate Validator** là cài đặt tham chiếu có thẩm quyền và được sử dụng rộng rãi nhất của đặc tả Bean Validation.

- Hibernate Validator 4.x cài đặt Bean Validation 1.0 (JSR 303).
- Hibernate Validator 5.x cài đặt Bean Validation 1.1 (JSR 349).
- Hibernate Validator 6.x và các phiên bản cao hơn cài đặt Bean Validation 2.0 (JSR 380).

Việc sử dụng Bean Validation trong dự án Spring Boot rất thuận tiện nhờ khả năng tự động cấu hình của Spring Boot. Về việc import dependency, cần lưu ý:

- Trong các phiên bản Spring Boot cũ hơn (thường là trước 2.3.x), `spring-boot-starter-web` mặc định đã bao gồm hibernate-validator. Vì vậy, chỉ cần import Web Starter là không cần thêm dependency liên quan đến validation.
- Từ phiên bản Spring Boot 2.3.x, để quản lý dependency chi tiết hơn, dependency liên quan đến validation đã được tách khỏi spring-boot-starter-web. Nếu dự án của bạn sử dụng các phiên bản này hoặc mới hơn, và cần tính năng Bean Validation, bạn cần thêm dependency `spring-boot-starter-validation` một cách tường minh:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

![](https://oss.javaguide.cn/2021/03/c7bacd12-1c1a-4e41-aaaf-4cad840fc073.png)

Dự án không phải SpringBoot cần tự import các package dependency liên quan, không trình bày nhiều ở đây, chi tiết có thể xem bài viết của tôi: [Cách làm validation tham số trong Spring/Spring Boot? Tất cả những gì bạn cần biết đều ở đây!](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485783&idx=1&sn=a407f3b75efa17c643407daa7fb2acd6&chksm=cea2469cf9d5cf8afbcd0a8a1c9cc4294d6805b8e01bee6f76bb2884c5bc15478e91459def49&token=292197051&lang=zh_CN#rd).

👉 Cần lưu ý: Tất cả các annotation, nên sử dụng annotation JSR, tức là `javax.validation.constraints`, không phải `org.hibernate.validator.constraints`

### Một số annotation thường dùng để validate field

Đặc tả Bean Validation và cài đặt của nó (như Hibernate Validator) cung cấp phong phú các annotation để khai báo quy tắc validation. Dưới đây là một số annotation thường dùng và mô tả:

- `@NotNull`: Kiểm tra phần tử được đánh dấu (bất kỳ kiểu nào) không được là `null`.
- `@NotEmpty`: Kiểm tra phần tử được đánh dấu (như `CharSequence`, `Collection`, `Map`, `Array`) không được là `null` và kích thước/độ dài không được bằng 0. Lưu ý: với chuỗi, `@NotEmpty` cho phép chuỗi chứa ký tự trắng như `" "`.
- `@NotBlank`: Kiểm tra `CharSequence` (như `String`) được đánh dấu không được là `null`, và độ dài sau khi loại bỏ khoảng trắng đầu và cuối phải lớn hơn 0. (Tức là không được là chuỗi chỉ có ký tự trắng).
- `@Null`: Kiểm tra phần tử được đánh dấu phải là `null`.
- `@AssertTrue` / `@AssertFalse`: Kiểm tra phần tử kiểu `boolean` hoặc `Boolean` được đánh dấu phải là `true` / `false`.
- `@Min(value)` / `@Max(value)`: Kiểm tra giá trị kiểu số (hoặc biểu diễn chuỗi của nó) được đánh dấu phải lớn hơn hoặc bằng / nhỏ hơn hoặc bằng `value` chỉ định. Áp dụng cho kiểu nguyên (`byte`, `short`, `int`, `long`, `BigInteger`, v.v.).
- `@DecimalMin(value)` / `@DecimalMax(value)`: Chức năng tương tự `@Min` / `@Max`, nhưng áp dụng cho kiểu số có chứa số thập phân (`BigDecimal`, `BigInteger`, `CharSequence`, `byte`, `short`, `int`, `long` và các wrapper class). `value` phải là biểu diễn chuỗi của số.
- `@Size(min=, max=)`: Kiểm tra kích thước/độ dài của phần tử (như `CharSequence`, `Collection`, `Map`, `Array`) được đánh dấu phải nằm trong khoảng `min` và `max` chỉ định (bao gồm biên).
- `@Digits(integer=, fraction=)`: Kiểm tra giá trị kiểu số (hoặc biểu diễn chuỗi của nó) được đánh dấu, số chữ số phần nguyên phải ≤ `integer`, số chữ số phần thập phân phải ≤ `fraction`.
- `@Pattern(regexp=, flags=)`: Kiểm tra `CharSequence` (như `String`) được đánh dấu có khớp với biểu thức chính quy (`regexp`) chỉ định không. `flags` có thể chỉ định chế độ khớp (như không phân biệt hoa thường).
- `@Email`: Kiểm tra `CharSequence` (như `String`) được đánh dấu có đúng định dạng Email không (có một biểu thức chính quy tương đối lỏng lẻo được tích hợp sẵn).
- `@Past` / `@Future`: Kiểm tra kiểu ngày hoặc giờ (`java.util.Date`, `java.util.Calendar`, các kiểu trong package JSR 310 `java.time`) được đánh dấu có ở trước / sau thời gian hiện tại không.
- `@PastOrPresent` / `@FutureOrPresent`: Tương tự `@Past` / `@Future`, nhưng cho phép bằng thời gian hiện tại.
- ……

### Validate request body (RequestBody)

Khi method Controller dùng annotation `@RequestBody` để nhận request body và ràng buộc vào đối tượng, có thể thêm annotation `@Valid` trước tham số đó để kích hoạt validation đối tượng. Nếu validation thất bại, nó sẽ ném `MethodArgumentNotValidException`.

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Person {
    @NotNull(message = "classId 不能为空")
    private String classId;

    @Size(max = 33)
    @NotNull(message = "name 不能为空")
    private String name;

    @Pattern(regexp = "((^Man$|^Woman$|^UGM$))", message = "sex 值不在可选范围")
    @NotNull(message = "sex 不能为空")
    private String sex;

    @Email(message = "email 格式不正确")
    @NotNull(message = "email 不能为空")
    private String email;
}


@RestController
@RequestMapping("/api")
public class PersonController {
    @PostMapping("/person")
    public ResponseEntity<Person> getPerson(@RequestBody @Valid Person person) {
        return ResponseEntity.ok().body(person);
    }
}
```

### Validate tham số request (Path Variables và Request Parameters)

Đối với dữ liệu kiểu đơn giản được ánh xạ trực tiếp vào tham số method (như path variable `@PathVariable` hoặc request parameter `@RequestParam`), cách validate có đôi chút khác biệt:

1. **Thêm annotation `@Validated` vào lớp Controller**: Annotation này do Spring cung cấp (không phải tiêu chuẩn JSR), nó cho phép Spring xử lý annotation validation tham số ở cấp method. **Đây là bước bắt buộc.**
2. **Đặt annotation validation trực tiếp lên tham số method**: Áp dụng các annotation validation như `@Min`, `@Max`, `@Size`, `@Pattern` trực tiếp lên tham số `@PathVariable` hoặc `@RequestParam` tương ứng.

Nhất định không được quên thêm annotation `@Validated` vào lớp, tham số này có thể báo cho Spring biết để validate tham số method.

```java
@RestController
@RequestMapping("/api")
@Validated // 关键步骤 1: 必须在类上添加 @Validated
public class PersonController {

    @GetMapping("/person/{id}")
    public ResponseEntity<Integer> getPersonByID(
            @PathVariable("id")
            @Max(value = 5, message = "ID 不能超过 5") // 关键步骤 2: 校验注解直接放在参数上
            Integer id
    ) {
        // 如果传入的 id > 5，Spring 会在进入方法体前抛出 ConstraintViolationException 异常。
        // 全局异常处理器同样需要处理此异常。
        return ResponseEntity.ok().body(id);
    }

    @GetMapping("/person")
    public ResponseEntity<String> findPersonByName(
            @RequestParam("name")
            @NotBlank(message = "姓名不能为空") // 同样适用于 @RequestParam
            @Size(max = 10, message = "姓名长度不能超过 10")
            String name
    ) {
        return ResponseEntity.ok().body("Found person: " + name);
    }
}
```

## Xử lý ngoại lệ toàn cục

Giới thiệu về xử lý ngoại lệ toàn cục ở tầng Controller - thứ không thể thiếu trong dự án Spring.

**Các annotation liên quan:**

1. `@ControllerAdvice`: Annotation định nghĩa lớp xử lý ngoại lệ toàn cục
2. `@ExceptionHandler`: Annotation khai báo method xử lý ngoại lệ

Cách sử dụng? Lấy ví dụ từ phần validation tham số ở mục 5. Nếu tham số method không đúng sẽ ném `MethodArgumentNotValidException`, chúng ta xử lý ngoại lệ này.

```java
@ControllerAdvice
@ResponseBody
public class GlobalExceptionHandler {

    /**
     * 请求参数异常处理
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex, HttpServletRequest request) {
       ......
    }
}
```

Xem thêm về xử lý ngoại lệ Spring Boot tại hai bài viết của tôi:

1. [Một số cách thường gặp để xử lý ngoại lệ trong SpringBoot](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485568&idx=2&sn=c5ba880fd0c5d82e39531fa42cb036ac&chksm=cea2474bf9d5ce5dcbc6a5f6580198fdce4bc92ef577579183a729cb5d1430e4994720d59b34&token=2133161636&lang=zh_CN#rd)
2. [Sử dụng enum để đóng gói đơn giản xử lý ngoại lệ toàn cục SpringBoot một cách thanh lịch!](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247486379&idx=2&sn=48c29ae65b3ed874749f0803f0e4d90e&chksm=cea24460f9d5cd769ed53ad7e17c97a7963a89f5350e370be633db0ae8d783c3a3dbd58c70f8&token=1054498516&lang=zh_CN#rd)

## Transaction (Giao dịch)

Chỉ cần dùng annotation `@Transactional` trên method cần mở transaction!

```java
@Transactional(rollbackFor = Exception.class)
public void save() {
  ......
}

```

Chúng ta biết Exception được chia thành runtime exception RuntimeException và non-runtime exception. Trong annotation `@Transactional` nếu không cấu hình thuộc tính `rollbackFor`, thì transaction chỉ rollback khi gặp `RuntimeException`, thêm `rollbackFor=Exception.class` có thể để transaction cũng rollback khi gặp non-runtime exception.

Annotation `@Transactional` thường có thể tác dụng lên `lớp` hoặc `method`.

- **Tác dụng lên lớp**: Khi đặt annotation `@Transactional` lên lớp, nghĩa là tất cả các method public của lớp đó đều được cấu hình thông tin thuộc tính transaction giống nhau.
- **Tác dụng lên method**: Khi lớp đã cấu hình `@Transactional`, method cũng cấu hình `@Transactional`, transaction của method sẽ override thông tin cấu hình transaction của lớp.

Xem thêm về transaction Spring tại bài viết của tôi: [Có lẽ là giải thích quản lý transaction Spring đẹp nhất](./spring-transaction.md).

## JPA

Spring Data JPA cung cấp một loạt annotation và tính năng, giúp developer dễ dàng thực hiện ORM (Object Relational Mapping).

### Tạo bảng

`@Entity` dùng để khai báo một lớp là entity class của JPA, ánh xạ với bảng trong cơ sở dữ liệu. `@Table` chỉ định tên bảng tương ứng với entity.

```java
@Entity
@Table(name = "role")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    // 省略 getter/setter
}
```

### Chiến lược tạo primary key

`@Id` khai báo field là primary key. `@GeneratedValue` chỉ định chiến lược tạo primary key.

JPA cung cấp 4 chiến lược tạo primary key:

- **`GenerationType.TABLE`**: Tạo primary key thông qua bảng cơ sở dữ liệu.
- **`GenerationType.SEQUENCE`**: Tạo primary key thông qua sequence cơ sở dữ liệu (áp dụng cho Oracle và các cơ sở dữ liệu khác).
- **`GenerationType.IDENTITY`**: Primary key tự tăng (áp dụng cho MySQL và các cơ sở dữ liệu khác).
- **`GenerationType.AUTO`**: JPA tự động chọn chiến lược tạo phù hợp (chiến lược mặc định).

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

Khai báo chiến lược tạo primary key tùy chỉnh thông qua `@GenericGenerator`:

```java
@Id
@GeneratedValue(generator = "IdentityIdGenerator")
@GenericGenerator(name = "IdentityIdGenerator", strategy = "identity")
private Long id;
```

Tương đương với:

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

Các chiến lược tạo primary key JPA cung cấp như sau:

```java
public class DefaultIdentifierGeneratorFactory
    implements MutableIdentifierGeneratorFactory, Serializable, ServiceRegistryAwareService {

  @SuppressWarnings("deprecation")
  public DefaultIdentifierGeneratorFactory() {
    register( "uuid2", UUIDGenerator.class );
    register( "guid", GUIDGenerator.class );      // can be done with UUIDGenerator + strategy
    register( "uuid", UUIDHexGenerator.class );      // "deprecated" for new use
    register( "uuid.hex", UUIDHexGenerator.class );   // uuid.hex is deprecated
    register( "assigned", Assigned.class );
    register( "identity", IdentityGenerator.class );
    register( "select", SelectGenerator.class );
    register( "sequence", SequenceStyleGenerator.class );
    register( "seqhilo", SequenceHiLoGenerator.class );
    register( "increment", IncrementGenerator.class );
    register( "foreign", ForeignGenerator.class );
    register( "sequence-identity", SequenceIdentityGenerator.class );
    register( "enhanced-sequence", SequenceStyleGenerator.class );
    register( "enhanced-table", TableGenerator.class );
  }

  public void register(String strategy, Class generatorClass) {
    LOG.debugf( "Registering IdentifierGenerator strategy [%s] -> [%s]", strategy, generatorClass.getName() );
    final Class previous = generatorStrategyToClassNameMap.put( strategy, generatorClass );
    if ( previous != null ) {
      LOG.debugf( "    - overriding [%s]", previous.getName() );
    }
  }

}
```

### Ánh xạ field

`@Column` dùng để chỉ định quan hệ ánh xạ giữa field entity và cột cơ sở dữ liệu.

- **`name`**: Chỉ định tên cột cơ sở dữ liệu.
- **`nullable`**: Chỉ định có cho phép `null` không.
- **`length`**: Đặt độ dài field (chỉ áp dụng cho kiểu `String`).
- **`columnDefinition`**: Chỉ định kiểu cơ sở dữ liệu và giá trị mặc định của field.

```java
@Column(name = "user_name", nullable = false, length = 32)
private String userName;

@Column(columnDefinition = "tinyint(1) default 1")
private Boolean enabled;
```

### Bỏ qua field

`@Transient` dùng để khai báo field không cần persistent.

```java
@Entity
public class User {

    @Transient
    private String temporaryField; // 不会映射到数据库表中
}
```

Các cách khác để field không được persistent:

- **`static`**: Field static sẽ không được persistent.
- **`final`**: Field final sẽ không được persistent.
- **`transient`**: Field được khai báo bằng từ khóa `transient` của Java sẽ không được serialize hoặc persistent.

### Lưu trữ field lớn

`@Lob` dùng để khai báo field lớn (như `CLOB` hoặc `BLOB`).

```java
@Lob
@Column(name = "content", columnDefinition = "LONGTEXT NOT NULL")
private String content;
```

### Ánh xạ kiểu enum

`@Enumerated` dùng để ánh xạ kiểu enum thành field cơ sở dữ liệu.

- **`EnumType.ORDINAL`**: Lưu số thứ tự của enum (mặc định).
- **`EnumType.STRING`**: Lưu tên của enum (được khuyến nghị).

```java
public enum Gender {
    MALE,
    FEMALE
}

@Entity
public class User {

    @Enumerated(EnumType.STRING)
    private Gender gender;
}
```

Giá trị được lưu trong cơ sở dữ liệu là `MALE` hoặc `FEMALE`.

### Tính năng audit

Thông qua tính năng audit của JPA, có thể tự động ghi lại thời gian tạo, thời gian cập nhật, người tạo và người cập nhật trong entity.

Lớp cơ sở audit:

```java
@Data
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AbstractAuditBase {

    @CreatedDate
    @Column(updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;
}
```

Cấu hình tính năng audit:

```java
@Configuration
@EnableJpaAuditing
public class AuditConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> Optional.ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getName);
    }
}
```

Giới thiệu sơ qua một số annotation liên quan ở trên:

1. `@CreatedDate`: Cho biết field này là field thời gian tạo, khi entity này được insert, giá trị sẽ được đặt
2. `@CreatedBy`: Cho biết field này là người tạo, khi entity này được insert, giá trị sẽ được đặt. `@LastModifiedDate`, `@LastModifiedBy` tương tự.
3. `@EnableJpaAuditing`: Bật tính năng audit JPA.

### Thao tác sửa đổi và xóa

Annotation `@Modifying` dùng để đánh dấu thao tác sửa đổi hoặc xóa, phải sử dụng cùng với `@Transactional`.

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Modifying
    @Transactional
    void deleteByUserName(String userName);
}
```

### Quan hệ liên kết

JPA cung cấp 4 annotation cho các quan hệ liên kết:

- **`@OneToOne`**: Quan hệ một-một.
- **`@OneToMany`**: Quan hệ một-nhiều.
- **`@ManyToOne`**: Quan hệ nhiều-một.
- **`@ManyToMany`**: Quan hệ nhiều-nhiều.

```java
@Entity
public class User {

    @OneToOne
    private Profile profile;

    @OneToMany(mappedBy = "user")
    private List<Order> orders;
}
```

## Xử lý dữ liệu JSON

Trong phát triển Web, thường xuyên cần xử lý chuyển đổi giữa đối tượng Java và định dạng JSON. Spring thường tích hợp thư viện Jackson để hoàn thành việc này, dưới đây là một số annotation Jackson thường dùng, có thể giúp chúng ta tùy chỉnh quá trình serialize (Java object sang JSON) và deserialize (JSON sang Java object).

### Lọc field JSON

Đôi khi chúng ta không muốn một số field của đối tượng Java được bao gồm trong JSON cuối cùng được tạo ra, hoặc không xử lý một số thuộc tính JSON nhất định khi chuyển đổi JSON thành đối tượng Java.

`@JsonIgnoreProperties` tác dụng lên lớp để lọc bỏ các field cụ thể không trả về hoặc không parse.

```java
// 在生成 JSON 时忽略 userRoles 属性
// 如果允许未知属性（即 JSON 中有而类中没有的属性），可以添加 ignoreUnknown = true
@JsonIgnoreProperties({"userRoles"})
public class User {
    private String userName;
    private String fullName;
    private String password;
    private List<UserRole> userRoles = new ArrayList<>();
    // getters and setters...
}
```

`@JsonIgnore` tác dụng ở cấp field hoặc method `getter/setter`, dùng để chỉ định bỏ qua thuộc tính cụ thể đó khi serialize hoặc deserialize.

```java
public class User {
    private String userName;
    private String fullName;
    private String password;

    // 在生成 JSON 时忽略 userRoles 属性
    @JsonIgnore
    private List<UserRole> userRoles = new ArrayList<>();
    // getters and setters...
}
```

`@JsonIgnoreProperties` phù hợp hơn để loại trừ nhiều field tường minh khi định nghĩa lớp, hoặc loại trừ field trong tình huống kế thừa; `@JsonIgnore` thì trực tiếp hơn để đánh dấu một field cụ thể.

### Định dạng dữ liệu JSON

`@JsonFormat` dùng để chỉ định định dạng của thuộc tính khi serialize và deserialize. Thường dùng để định dạng kiểu ngày giờ.

Ví dụ:

```java
// 指定 Date 类型序列化为 ISO 8601 格式字符串，并设置时区为 GMT
@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "GMT")
private Date date;
```

### Làm phẳng đối tượng JSON

Annotation `@JsonUnwrapped` tác dụng lên field, dùng để "nâng lên" các thuộc tính của đối tượng lồng nhau lên cấp hiện tại khi serialize, deserialize thực hiện ngược lại. Điều này có thể làm cấu trúc JSON phẳng hơn.

Giả sử có lớp `Account`, chứa hai đối tượng lồng nhau `Location` và `PersonInfo`.

```java
@Getter
@Setter
@ToString
public class Account {
    private Location location;
    private PersonInfo personInfo;

  @Getter
  @Setter
  @ToString
  public static class Location {
     private String provinceName;
     private String countyName;
  }
  @Getter
  @Setter
  @ToString
  public static class PersonInfo {
    private String userName;
    private String fullName;
  }
}

```

Cấu trúc JSON trước khi làm phẳng:

```json
{
  "location": {
    "provinceName": "湖北",
    "countyName": "武汉"
  },
  "personInfo": {
    "userName": "coder1234",
    "fullName": "shaungkou"
  }
}
```

Dùng `@JsonUnwrapped` để làm phẳng đối tượng:

```java
@Getter
@Setter
@ToString
public class Account {
    @JsonUnwrapped
    private Location location;
    @JsonUnwrapped
    private PersonInfo personInfo;
    ......
}
```

Cấu trúc JSON sau khi làm phẳng:

```json
{
  "provinceName": "湖北",
  "countyName": "武汉",
  "userName": "coder1234",
  "fullName": "shaungkou"
}
```

## Testing (Kiểm thử)

`@ActiveProfiles` thường tác dụng lên lớp test, dùng để khai báo Spring configuration profile có hiệu lực.

```java
// 指定在 RANDOM_PORT 上启动应用上下文，并激活 "test" profile
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Slf4j
public abstract class TestBase {
    // Common test setup or abstract methods...
}
```

`@Test` là annotation do framework JUnit (thường là JUnit 5 Jupiter) cung cấp, dùng để đánh dấu một method là test method. Mặc dù không phải annotation của Spring, nhưng nó là nền tảng để thực thi unit test và integration test.

`@Transactional` khi được khai báo trên test method, dữ liệu sẽ rollback, tránh làm ô nhiễm dữ liệu test.

`@WithMockUser` là annotation do module Spring Security Test cung cấp, dùng để mô phỏng người dùng đã được xác thực trong quá trình test. Có thể dễ dàng chỉ định tên người dùng, mật khẩu, role (authorities), v.v., từ đó test các endpoint hoặc method được bảo vệ bởi security.

```java
public class MyServiceTest extends TestBase { // Assuming TestBase provides Spring context

    @Test
    @Transactional // 测试数据将回滚
    @WithMockUser(username = "test-user", authorities = { "ROLE_TEACHER", "read" }) // 模拟一个名为 "test-user"，拥有 TEACHER 角色和 read 权限的用户
    void should_perform_action_requiring_teacher_role() throws Exception {
        // ... 测试逻辑 ...
        // 这里可以调用需要 "ROLE_TEACHER" 权限的服务方法
    }
}
```

## Tổng kết phân loại annotation

(Bảng tổng hợp)

<!-- @include: @article-footer.snippet.md -->
