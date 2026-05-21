---
title: Giải thích chi tiết IoC & AOP (Hiểu Nhanh)
description: Giải thích chi tiết nguyên lý cốt lõi của Spring IoC và AOP, bao gồm Inversion of Control, Dependency Injection, Aspect-Oriented Programming và implementation mechanism của Dynamic Proxy.
category: Framework
tag:
  - Spring
head:
  - - meta
    - name: keywords
      content: IoC,DI,AOP,Spring IoC Container,Dependency Injection,Aspect-Oriented Programming,Dynamic Proxy,Spring Principles
---

Bài viết này sẽ giải thích IoC & AOP từ các câu hỏi sau:

- IoC là gì?
- IoC giải quyết vấn đề gì?
- IoC và DI khác nhau thế nào?
- AOP là gì?
- AOP giải quyết vấn đề gì?
- AOP có những application scenarios nào?
- Tại sao AOP gọi là aspect-oriented programming?
- AOP có những implementation methods nào?

Trước tiên cần nói rõ: IoC & AOP không phải do Spring đề xuất — chúng đã tồn tại trước Spring, chỉ là thiên về lý thuyết hơn. Spring đã implement hai ideas này rất tốt ở technical level.

## IoC (Inversion of Control)

### IoC là gì?

IoC (Inversion of Control) tức là Đảo Ngược Kiểm Soát. Đây là một thought pattern, không phải một technical implementation. Mô tả vấn đề về creation và management của objects trong Java development.

Ví dụ: Class A depends on class B

- **Traditional development**: Thường manually new một B object trong class A bằng keyword `new`
- **IoC development**: Không tạo objects bằng keyword `new`, mà thông qua IoC container (Spring framework) để instantiate objects. Chúng ta cần object nào thì lấy trực tiếp từ IoC container.

So sánh hai approaches: Chúng ta "mất đi một quyền" (quyền create và manage objects), nhưng cũng có được một lợi ích (không cần lo về object creation, management nữa).

**Tại sao gọi là Inversion of Control?**

- **Control**: Quyền create (instantiate, manage) objects
- **Inversion**: Trao quyền control cho external environment (IoC container)

![IoC Diagram](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/IoC&Aop-ioc-illustration.png)

### IoC giải quyết vấn đề gì?

Idea của IoC là hai bên không phụ thuộc lẫn nhau, để third-party container quản lý related resources. Lợi ích:

1. Giảm coupling hay dependency degree giữa các objects
2. Resources trở nên dễ manage hơn — ví dụ dùng Spring container rất dễ implement Singleton

Ví dụ: Có một operation cho User, dùng Service và Dao two-layer structure để develop.

Không dùng IoC, Service layer muốn dùng Dao layer's concrete implementation cần manually new `UserDaoImpl` trong `UserServiceImpl`. Điều này ổn, nhưng hình dung scenario: Trong quá trình dev bỗng nhận được requirement mới — develop thêm một concrete implementation class cho `IUserDao`. Vì Service layer depends on concrete implementation của `IUserDao`, cần modify object được new trong `UserServiceImpl`. Nếu nhiều places đều reference concrete implementation của `IUserDao`, thay đổi implementation sẽ rất đau đầu.

![IoC DAO Service](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/IoC&Aop-ioc-illustration-dao-service.png)

Dùng IoC, chúng ta trao control (creation, management) của objects cho IoC container quản lý. Khi cần, chỉ cần "lấy" từ IoC container.

![IoC DAO](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/IoC&Aop-ioc-illustration-dao.png)

### IoC và DI có khác nhau không?

IoC (Inversion of Control) là một design thought hoặc design pattern. Design thought này là **trao control để manually create objects trong program cho third-party như IoC container.** Với Spring framework, IoC container thực ra là một Map (key, value) lưu trữ các objects.

Implementation method phổ biến và hợp lý nhất của IoC gọi là Dependency Injection (DI).

Martin Fowler (Old Ma) đề nghị đổi tên IoC thành DI. Big idea của Martin Fowler: IoC quá general và không có ý nghĩa rõ ràng, nhiều người nhầm lẫn. Dùng DI để chính xác chỉ tên pattern này tốt hơn.

## AOP (Aspect Oriented Programming)

Ở đây sẽ không dùng quá nhiều technical terms — mục đích là giải thích rõ idea của AOP.

### AOP là gì?

AOP (Aspect Oriented Programming) tức là Lập Trình Hướng Khía Cạnh. AOP là extension của OOP (Object Oriented Programming), hai cái bổ sung cho nhau, không đối lập.

Mục đích của AOP là tách **cross-cutting concerns** (như logging, transaction management, permission control, rate limiting, idempotency...) ra khỏi core business logic. Thông qua dynamic proxy, bytecode manipulation và các kỹ thuật khác để implement code reuse và decoupling, nâng cao code maintainability và extensibility.

### Tại sao AOP gọi là Aspect-Oriented Programming?

AOP gọi là aspect-oriented programming vì core idea của nó là tách cross-cutting concerns ra khỏi core business logic, tạo thành các **Aspects**.

![Aspect-oriented programming diagram](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/aop-program-execution.jpg)

Key terms của AOP:

- **Cross-cutting concerns**: Common behaviors trong nhiều classes hoặc objects (như logging, transaction management, permission control...).
- **Aspect**: Class encapsulating cross-cutting concerns. An aspect is a class. Có thể define nhiều advices để implement specific functionality.
- **JoinPoint**: Connection point là một specific moment trong method call hoặc method execution (như method call, exception throwing...).
- **Advice**: Advice là operation that aspect executes at a JoinPoint. Có 5 types: Before, After, AfterReturning, AfterThrowing, và Around.
- **Pointcut**: A pointcut is an expression matching which JoinPoints need to be enhanced by the aspect. Ví dụ `execution(* com.xyz.service..*(..))` matches classes or interfaces in `com.xyz.service` package và sub-packages.
- **Weaving**: Process of connecting aspects to target objects, applying advices to JoinPoints matched by pointcuts. Common weaving timing: Compile-Time Weaving (e.g., AspectJ) và Runtime Weaving (e.g., AspectJ, Spring AOP).

### AOP common advice types?

![AspectJ advice types](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/aspectj-advice-types.jpg)

- **Before**: Triggered before target object's method call
- **After**: Triggered after target object's method call
- **AfterReturning**: Triggered after target object's method completes and returns result
- **AfterThrowing**: Triggered when target object's method throws/triggers exception. AfterReturning and AfterThrowing are mutually exclusive.
- **Around**: Programmatic control over target object's method call. Around advice has the largest operable scope among all advice types — can control entire execution of target method.

### AOP giải quyết vấn đề gì?

OOP không thể xử lý tốt một số common behaviors dispersed across multiple classes or objects (cross-cutting concerns). Nếu implement những behaviors này trong mỗi class, sẽ gây code redundancy, complexity và difficulty to maintain.

AOP có thể tách cross-cutting concerns ra khỏi **core business logic (core concerns)**, achieving separation of concerns.

Ví dụ với logging: Trước khi dùng AOP, cần viết logic code logging cho từng method:

```java
public CommonResponse<Object> method1() {
      // Business logic
      xxService.method1();
      // Logging
      ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
      HttpServletRequest request = attributes.getRequest();
      // Log writing...
      return CommonResponse.success();
}

public CommonResponse<Object> method2() {
      // Business logic
      xxService.method2();
      // Logging
      ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
      HttpServletRequest request = attributes.getRequest();
      // Log writing...
      return CommonResponse.success();
}
```

Sau khi dùng AOP, có thể encapsulate logging logic thành một aspect, dùng pointcuts và advices để chỉ định methods nào cần logging:

```java
// Log annotation
@Target({ElementType.PARAMETER,ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Log {
    String description() default "";
    MethodType methodType() default MethodType.OTHER;
}

// Log Aspect
@Component
@Aspect
public class LogAspect {
  // Pointcut - all methods annotated with @Log
  @Pointcut("@annotation(cn.javaguide.annotation.Log)")
  public void webLog() {
  }

  @Around("webLog()")
  public Object doAround(ProceedingJoinPoint joinPoint) throws Throwable {
    // Specific handling logic omitted
  }
}
```

Với AOP, chỉ cần một annotation để implement logging:

```java
@Log(description = "method1",methodType = MethodType.INSERT)
public CommonResponse<Object> method1() {
      // Business logic
      xxService.method1();
      return CommonResponse.success();
}
```

### AOP application scenarios?

- **Logging**: Custom log annotation, dùng AOP, one line of code implements logging.
- **Performance statistics**: Dùng AOP để thống kê execution time của target methods trước và sau execution.
- **Transaction management**: `@Transactional` annotation để Spring quản lý transactions như rollback exceptions. `@Transactional` được implement based on AOP.
- **Permission control**: Dùng AOP để kiểm tra user permissions trước khi target method executes.
- **Rate limiting**: Dùng AOP để apply rate limiting to requests trước khi target method executes.
- **Cache management**: Dùng AOP để đọc và update cache trước và sau target method execution.
- ……

### AOP implementation methods?

Common AOP implementations: dynamic proxy, bytecode manipulation.

Spring AOP dựa trên dynamic proxy. Nếu object cần proxy đã implement một interface, Spring AOP sẽ dùng **JDK Proxy** để create proxy object. Với objects chưa implement interface, Spring AOP sẽ dùng CGLIB để generate subclass của object được proxied làm proxy.

![SpringAOPProcess](https://oss.javaguide.cn/github/javaguide/system-design/framework/spring/230ae587a322d6e4d09510161987d346.jpeg)

**Spring Boot và Spring có cùng dynamic proxy strategy không?** Thực ra không — nhiều người hiểu sai.

**Spring Boot trước 2.0**: Default dùng **JDK dynamic proxy**. Nếu target class chưa implement interface, sẽ throw exception. Developer phải explicitly configure `spring.aop.proxy-target-class=true` để dùng **CGLIB dynamic proxy**.

**Spring Boot 2.0 trở đi**: Nếu user không configure gì, default dùng **CGLIB dynamic proxy**. Muốn dùng JDK dynamic proxy, cần add `spring.aop.proxy-target-class=false` vào config file.

Tất nhiên cũng có thể dùng **AspectJ**! Spring AOP đã integrated AspectJ — AspectJ được coi là complete AOP framework nhất trong Java ecosystem.

**Spring AOP thuộc về runtime enhancement, còn AspectJ là compile-time enhancement.** Spring AOP based on Proxying, còn AspectJ based on Bytecode Manipulation.

AspectJ mạnh hơn Spring AOP, nhưng Spring AOP đơn giản hơn. Nếu số lượng aspects ít, performance difference không đáng kể. Khi quá nhiều aspects, tốt nhất dùng AspectJ — nó nhanh hơn Spring AOP nhiều.

## References

- AOP in Spring Boot, is it a JDK dynamic proxy or a Cglib dynamic proxy?: <https://www.springcloud.io/post/2022-01/springboot-aop/>
- Spring Proxying Mechanisms: <https://docs.spring.io/spring-framework/reference/core/aop/proxying.html>
