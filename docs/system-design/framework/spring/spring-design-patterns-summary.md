---
title: Giải thích chi tiết các Design Pattern trong Spring
description: Giải thích chi tiết các design pattern trong Spring Framework, bao gồm Factory Pattern, Proxy Pattern, Singleton Pattern, Template Method và ứng dụng thực tế trong source code Spring.
category: Framework
tag:
  - Spring
head:
  - - meta
    - name: keywords
      content: Spring设计模式,工厂模式,代理模式,模板方法,单例,策略模式,适配器模式,Spring源码
---

"JDK sử dụng những design pattern nào? Spring sử dụng những design pattern nào?" - Đây là hai câu hỏi khá phổ biến trong các buổi phỏng vấn.

Tôi đã tìm kiếm trên mạng về các bài giải thích design pattern trong Spring và thấy rằng hầu hết đều na ná nhau, và phần lớn đã cũ. Vì vậy, tôi đã dành vài ngày để tự tổng hợp lại.

Do năng lực cá nhân còn hạn chế, bài viết có thể có sai sót, mọi người đều có thể chỉ ra. Ngoài ra, do giới hạn độ dài bài viết, phần giải thích về design pattern và một số source code chỉ được đề cập qua, mục đích chính của bài viết này là ôn lại các design pattern trong Spring.

## Inversion of Control (IoC) và Dependency Injection (DI)

**IoC (Inversion of Control, Đảo ngược điều khiển)** là một khái niệm vô cùng quan trọng trong Spring, nó không phải là một công nghệ mà là một tư tưởng thiết kế giảm coupling. Mục đích chính của IoC là thông qua "bên thứ ba" (IoC container trong Spring) để thực hiện decoupling giữa các đối tượng có quan hệ phụ thuộc (IoC container quản lý đối tượng, bạn chỉ cần sử dụng), từ đó giảm độ coupling giữa các đoạn code.

**IoC là một nguyên tắc, không phải là một pattern, các pattern sau đây (nhưng không giới hạn) triển khai nguyên tắc IoC.**

![ioc-patterns](/images/github/javaguide/ioc-patterns.png)

**IoC container của Spring giống như một nhà máy, khi chúng ta cần tạo một đối tượng, chỉ cần cấu hình tệp cấu hình/annotation là xong, hoàn toàn không cần quan tâm đến đối tượng được tạo ra như thế nào.** IoC container chịu trách nhiệm tạo đối tượng, kết nối các đối tượng lại với nhau, cấu hình các đối tượng này, và xử lý toàn bộ vòng đời của các đối tượng này từ khi tạo đến khi bị hủy hoàn toàn.

Trong một dự án thực tế, nếu một lớp Service có hàng trăm thậm chí hàng nghìn lớp làm nền tảng, chúng ta cần khởi tạo Service này, và có thể phải hiểu rõ constructor của tất cả các lớp nền tảng mỗi lần, điều này có thể khiến bạn phát điên. Nếu sử dụng IoC, bạn chỉ cần cấu hình, sau đó tham chiếu ở nơi cần thiết, điều này tăng đáng kể khả năng bảo trì của dự án và giảm độ khó phát triển.

> Để hiểu về Spring IoC, đề xuất xem câu trả lời này trên Zhihu: <https://www.zhihu.com/question/23277575/answer/169698662>, rất hay.

**Làm sao để hiểu Inversion of Control?** Ví dụ: "Đối tượng a phụ thuộc vào đối tượng b, khi đối tượng a cần sử dụng đối tượng b thì phải tự tạo ra nó. Nhưng khi hệ thống giới thiệu IoC container, đối tượng a và đối tượng b mất đi mối liên kết trực tiếp. Lúc này, khi đối tượng a cần sử dụng đối tượng b, chúng ta có thể chỉ định IoC container tạo một đối tượng b và inject vào đối tượng a". Quá trình đối tượng a lấy đối tượng phụ thuộc b chuyển từ hành vi chủ động thành hành vi bị động, quyền kiểm soát bị đảo ngược, đó là nguồn gốc của tên gọi Inversion of Control.

**DI (Dependency Inject, Dependency Injection) là một design pattern triển khai Inversion of Control, Dependency Injection là việc truyền biến instance vào một đối tượng.**

## Factory Design Pattern

Spring sử dụng factory pattern có thể tạo đối tượng bean thông qua `BeanFactory` hoặc `ApplicationContext`.

**So sánh hai loại:**

- `BeanFactory`: Lazy injection (chỉ inject khi cần dùng đến bean đó), chiếm ít bộ nhớ hơn so với `ApplicationContext`, tốc độ khởi động chương trình nhanh hơn.
- `ApplicationContext`: Khi container khởi động, dù bạn có dùng hay không, tất cả bean đều được tạo ngay lập tức. `BeanFactory` chỉ cung cấp hỗ trợ dependency injection cơ bản nhất, `ApplicationContext` mở rộng `BeanFactory`, ngoài các chức năng của `BeanFactory` còn có thêm nhiều chức năng khác, vì vậy nhà phát triển thường dùng `ApplicationContext` nhiều hơn.

Ba lớp triển khai của `ApplicationContext`:

1. `ClassPathXmlApplication`: Xử lý tệp context như là tài nguyên classpath.
2. `FileSystemXmlApplication`: Tải thông tin định nghĩa context từ tệp XML trong hệ thống tệp.
3. `XmlWebApplicationContext`: Tải thông tin định nghĩa context từ tệp XML trong hệ thống Web.

Example:

```java
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.FileSystemXmlApplicationContext;

public class App {
  public static void main(String[] args) {
    ApplicationContext context = new FileSystemXmlApplicationContext(
        "C:/work/IOC Containers/springframework.applicationcontext/src/main/resources/bean-factory-config.xml");

    HelloApplicationContext obj = (HelloApplicationContext) context.getBean("helloApplicationContext");
    obj.getMsg();
  }
}
```

## Singleton Design Pattern

Trong hệ thống của chúng ta, có một số đối tượng mà thực ra chúng ta chỉ cần một, chẳng hạn: thread pool, cache, dialog, registry, đối tượng log, đối tượng đóng vai trò là driver thiết bị như máy in, card đồ họa. Thực tế, loại đối tượng này chỉ có thể có một instance, nếu tạo ra nhiều instance có thể dẫn đến một số vấn đề, ví dụ: hành vi bất thường của chương trình, sử dụng quá nhiều tài nguyên, hoặc kết quả không nhất quán.

**Lợi ích của việc sử dụng Singleton Pattern**:

- Đối với các đối tượng được sử dụng thường xuyên, có thể bỏ qua thời gian tạo đối tượng, điều này đặc biệt đáng kể về chi phí hệ thống đối với các đối tượng nặng;
- Do số lần thực hiện thao tác new giảm, tần suất sử dụng bộ nhớ hệ thống cũng giảm, điều này sẽ giảm áp lực GC, rút ngắn thời gian dừng GC.

**Phạm vi mặc định của bean trong Spring là singleton.** Ngoài phạm vi singleton, bean trong Spring còn có các phạm vi sau:

- **prototype**: Mỗi lần lấy sẽ tạo một instance bean mới. Tức là, gọi `getBean()` hai lần liên tiếp sẽ nhận được các instance Bean khác nhau.
- **request** (chỉ có trong ứng dụng Web): Mỗi HTTP request sẽ tạo ra một bean mới (request bean), bean đó chỉ có hiệu lực trong HTTP request hiện tại.
- **session** (chỉ có trong ứng dụng Web): Mỗi HTTP request từ session mới sẽ tạo ra một bean mới (session bean), bean đó chỉ có hiệu lực trong HTTP session hiện tại.
- **application/global-session** (chỉ có trong ứng dụng Web): Mỗi ứng dụng Web tạo một Bean (application Bean) khi khởi động, bean đó chỉ có hiệu lực trong thời gian khởi động ứng dụng hiện tại.
- **websocket** (chỉ có trong ứng dụng Web): Mỗi phiên WebSocket tạo ra một bean mới.

Spring triển khai singleton pattern theo cách đặc biệt là singleton registry thông qua `ConcurrentHashMap`.

Code cốt lõi của Spring để triển khai singleton như sau:

```java
// 通过 ConcurrentHashMap（线程安全） 实现单例注册表
private final Map<String, Object> singletonObjects = new ConcurrentHashMap<String, Object>(64);

public Object getSingleton(String beanName, ObjectFactory<?> singletonFactory) {
        Assert.notNull(beanName, "'beanName' must not be null");
        synchronized (this.singletonObjects) {
            // 检查缓存中是否存在实例
            Object singletonObject = this.singletonObjects.get(beanName);
            if (singletonObject == null) {
                //...省略了很多代码
                try {
                    singletonObject = singletonFactory.getObject();
                }
                //...省略了很多代码
                // 如果实例对象在不存在，我们注册到单例注册表中。
                addSingleton(beanName, singletonObject);
            }
            return (singletonObject != NULL_OBJECT ? singletonObject : null);
        }
    }
    //将对象添加到单例注册表
    protected void addSingleton(String beanName, Object singletonObject) {
            synchronized (this.singletonObjects) {
                this.singletonObjects.put(beanName, (singletonObject != null ? singletonObject : NULL_OBJECT));

            }
        }
}
```

**Singleton Bean có vấn đề thread safety không?**

Phần lớn thời gian chúng ta không sử dụng đa luồng trong dự án, nên ít người quan tâm đến vấn đề này. Singleton Bean có vấn đề thread, chủ yếu là vì khi nhiều luồng thao tác trên cùng một đối tượng thì có tranh chấp tài nguyên.

Có hai giải pháp phổ biến:

1. Trong Bean, hãy cố gắng tránh định nghĩa các biến thành viên có thể thay đổi.
2. Định nghĩa một biến thành viên `ThreadLocal` trong lớp, lưu các biến thành viên có thể thay đổi vào `ThreadLocal` (đây là cách được khuyến nghị).

Tuy nhiên, phần lớn Bean thực tế đều là stateless (không có biến instance) (như Dao, Service), trong trường hợp này Bean là thread-safe.

## Proxy Design Pattern

### Ứng dụng của Proxy Pattern trong AOP

**AOP (Aspect-Oriented Programming, Lập trình hướng khía cạnh)** có khả năng đóng gói những logic hoặc trách nhiệm không liên quan đến business nhưng được gọi chung bởi các module business (như xử lý transaction, quản lý log, kiểm soát quyền, v.v.), thuận tiện cho việc giảm code trùng lặp trong hệ thống, giảm độ coupling giữa các module, và có lợi cho khả năng mở rộng và bảo trì trong tương lai.

Spring AOP dựa trên dynamic proxy, nếu đối tượng cần proxy có triển khai một interface nào đó, Spring AOP sẽ sử dụng **JDK Proxy** để tạo đối tượng proxy; đối với các đối tượng không triển khai interface, không thể dùng JDK Proxy để proxy, lúc này Spring AOP sẽ dùng **Cglib** để tạo một lớp con của đối tượng được proxy làm proxy, như hình dưới đây:

![SpringAOPProcess](/images/github/javaguide/SpringAOPProcess.jpg)

Tất nhiên, bạn cũng có thể dùng AspectJ, Spring AOP đã tích hợp AspectJ, AspectJ được coi là AOP framework hoàn chỉnh nhất trong hệ sinh thái Java.

Sau khi sử dụng AOP, chúng ta có thể trừu tượng hóa một số chức năng chung, dùng trực tiếp ở nơi cần thiết, điều này đơn giản hóa đáng kể lượng code. Khi cần thêm chức năng mới cũng dễ dàng, điều này cũng tăng khả năng mở rộng hệ thống. Chức năng log, quản lý transaction, v.v. đều dùng đến AOP.

### Spring AOP và AspectJ AOP khác nhau như thế nào?

**Spring AOP thuộc về runtime enhancement, còn AspectJ là compile-time enhancement.** Spring AOP dựa trên Proxy, còn AspectJ dựa trên Bytecode Manipulation.

Spring AOP đã tích hợp AspectJ, AspectJ được coi là AOP framework hoàn chỉnh nhất trong hệ sinh thái Java. AspectJ mạnh hơn Spring AOP về chức năng, nhưng Spring AOP tương đối đơn giản hơn.

Nếu số lượng aspect của chúng ta ít, thì hiệu suất của cả hai không chênh lệch nhiều. Nhưng khi có quá nhiều aspect, tốt hơn nên chọn AspectJ, nó nhanh hơn Spring AOP rất nhiều.

## Template Method

Template Method Pattern là một behavioral design pattern, nó định nghĩa khung của một thuật toán trong một thao tác, và trì hoãn một số bước xuống lớp con. Template Method cho phép lớp con có thể redefine cách triển khai một số bước cụ thể của thuật toán mà không thay đổi cấu trúc của thuật toán.

```java
public abstract class Template {
    //这是我们的模板方法
    public final void TemplateMethod(){
        PrimitiveOperation1();
        PrimitiveOperation2();
        PrimitiveOperation3();
    }

    protected void  PrimitiveOperation1(){
        //当前类实现
    }

    //被子类实现的方法
    protected abstract void PrimitiveOperation2();
    protected abstract void PrimitiveOperation3();

}
public class TemplateImpl extends Template {

    @Override
    public void PrimitiveOperation2() {
        //当前类实现
    }

    @Override
    public void PrimitiveOperation3() {
        //当前类实现
    }
}

```

Các lớp thao tác cơ sở dữ liệu kết thúc bằng Template như `JdbcTemplate`, `HibernateTemplate` trong Spring đều sử dụng template pattern. Thông thường chúng ta dùng kế thừa để triển khai template pattern, nhưng Spring không dùng cách này mà kết hợp Callback pattern với template method pattern, vừa đạt được hiệu quả tái sử dụng code, vừa tăng tính linh hoạt.

## Observer Pattern

Observer Pattern là một object behavioral pattern. Nó biểu thị mối quan hệ phụ thuộc giữa các đối tượng, khi một đối tượng thay đổi, tất cả các đối tượng phụ thuộc vào nó cũng phản ứng. Mô hình event-driven của Spring là một ứng dụng điển hình của Observer Pattern. Mô hình event-driven của Spring rất hữu ích, có thể decoupling code của chúng ta trong nhiều tình huống. Ví dụ, mỗi khi thêm sản phẩm mới thì cần cập nhật lại index sản phẩm, lúc này có thể dùng Observer Pattern để giải quyết vấn đề này.

### Ba vai trò trong mô hình Event-Driven của Spring

#### Vai trò sự kiện

`ApplicationEvent` (trong package `org.springframework.context`) đóng vai trò là sự kiện, đây là một lớp abstract, nó kế thừa `java.util.EventObject` và triển khai interface `java.io.Serializable`.

Spring mặc định có các sự kiện sau, tất cả đều là triển khai của `ApplicationContextEvent` (kế thừa từ `ApplicationContextEvent`):

- `ContextStartedEvent`: Sự kiện được kích hoạt sau khi `ApplicationContext` khởi động;
- `ContextStoppedEvent`: Sự kiện được kích hoạt sau khi `ApplicationContext` dừng;
- `ContextRefreshedEvent`: Sự kiện được kích hoạt sau khi `ApplicationContext` khởi tạo hoặc refresh hoàn tất;
- `ContextClosedEvent`: Sự kiện được kích hoạt sau khi `ApplicationContext` đóng.

![ApplicationEvent-Subclass](/images/github/javaguide/ApplicationEvent-Subclass.png)

#### Vai trò event listener

`ApplicationListener` đóng vai trò là event listener, nó là một interface, chỉ định nghĩa một phương thức `onApplicationEvent()` để xử lý `ApplicationEvent`. Source code của interface `ApplicationListener` như sau, có thể thấy rằng sự kiện trong interface chỉ cần triển khai `ApplicationEvent` là được. Vì vậy, trong Spring chúng ta chỉ cần triển khai phương thức `onApplicationEvent()` của interface `ApplicationListener` là hoàn thành việc lắng nghe sự kiện.

```java
package org.springframework.context;
import java.util.EventListener;
@FunctionalInterface
public interface ApplicationListener<E extends ApplicationEvent> extends EventListener {
    void onApplicationEvent(E var1);
}
```

#### Vai trò event publisher

`ApplicationEventPublisher` đóng vai trò là publisher của sự kiện, nó cũng là một interface.

```java
@FunctionalInterface
public interface ApplicationEventPublisher {
    default void publishEvent(ApplicationEvent event) {
        this.publishEvent((Object)event);
    }

    void publishEvent(Object var1);
}

```

Phương thức `publishEvent()` của interface `ApplicationEventPublisher` được triển khai trong lớp `AbstractApplicationContext`. Đọc triển khai của phương thức này, bạn sẽ thấy rằng thực ra sự kiện được broadcast thông qua `ApplicationEventMulticaster`. Nội dung cụ thể quá nhiều, sẽ không phân tích ở đây, có thể sẽ viết riêng một bài sau.

### Tóm tắt luồng sự kiện của Spring

1. Định nghĩa một sự kiện: Triển khai một lớp kế thừa từ `ApplicationEvent`, và viết constructor tương ứng;
2. Định nghĩa một event listener: Triển khai interface `ApplicationListener`, override phương thức `onApplicationEvent()`;
3. Sử dụng event publisher để publish message: Có thể publish message thông qua phương thức `publishEvent()` của `ApplicationEventPublisher`.

Example:

```java
// 定义一个事件,继承自ApplicationEvent并且写相应的构造函数
public class DemoEvent extends ApplicationEvent{
    private static final long serialVersionUID = 1L;

    private String message;

    public DemoEvent(Object source,String message){
        super(source);
        this.message = message;
    }

    public String getMessage() {
         return message;
          }


// 定义一个事件监听者,实现ApplicationListener接口，重写 onApplicationEvent() 方法；
@Component
public class DemoListener implements ApplicationListener<DemoEvent>{

    //使用onApplicationEvent接收消息
    @Override
    public void onApplicationEvent(DemoEvent event) {
        String msg = event.getMessage();
        System.out.println("接收到的信息是："+msg);
    }

}
// 发布事件，可以通过ApplicationEventPublisher  的 publishEvent() 方法发布消息。
@Component
public class DemoPublisher {

    @Autowired
    ApplicationContext applicationContext;

    public void publish(String message){
        //发布事件
        applicationContext.publishEvent(new DemoEvent(this, message));
    }
}

```

Khi gọi phương thức `publish()` của `DemoPublisher`, ví dụ `demoPublisher.publish("你好")`, console sẽ in ra: `接收到的信息是：你好`.

## Adapter Pattern

Adapter Pattern chuyển đổi một interface thành interface khác mà client mong muốn, Adapter Pattern cho phép các lớp có interface không tương thích có thể làm việc cùng nhau.

### Adapter Pattern trong Spring AOP

Chúng ta biết rằng việc triển khai Spring AOP dựa trên Proxy Pattern, nhưng các enhancement hoặc Advice trong Spring AOP sử dụng Adapter Pattern, interface liên quan là `AdvisorAdapter`.

Các loại Advice thường dùng: `BeforeAdvice` (trước khi gọi phương thức target, pre-notification), `AfterAdvice` (sau khi gọi phương thức target, post-notification), `AfterReturningAdvice` (sau khi phương thức target thực thi xong, trước return), v.v. Mỗi loại Advice đều có interceptor tương ứng: `MethodBeforeAdviceInterceptor`, `AfterReturningAdviceInterceptor`, `ThrowsAdviceInterceptor`, v.v.

Các notification được định nghĩa sẵn trong Spring cần được chuyển đổi thông qua adapter tương ứng, chuyển thành đối tượng kiểu interface `MethodInterceptor` (method interceptor) (ví dụ: `MethodBeforeAdviceAdapter` thông qua việc gọi phương thức `getInterceptor`, chuyển đổi `MethodBeforeAdvice` thành `MethodBeforeAdviceInterceptor`).

### Adapter Pattern trong Spring MVC

Trong Spring MVC, `DispatcherServlet` gọi `HandlerMapping` dựa trên thông tin request để phân giải `Handler` tương ứng với request. Sau khi phân giải được `Handler` tương ứng (tức là `Controller` mà chúng ta thường nói), bắt đầu được xử lý bởi adapter `HandlerAdapter`. `HandlerAdapter` đóng vai trò là expected interface, các lớp adapter cụ thể được dùng để adapt các lớp target, `Controller` đóng vai trò là lớp cần adapt.

**Tại sao phải dùng Adapter Pattern trong Spring MVC?**

Trong Spring MVC có nhiều loại `Controller`, các loại `Controller` khác nhau xử lý request theo các phương thức khác nhau. Nếu không sử dụng Adapter Pattern, `DispatcherServlet` sẽ phải trực tiếp lấy loại `Controller` tương ứng và tự phán đoán, giống như đoạn code dưới đây:

```java
if(mappedHandler.getHandler() instanceof MultiActionController){
   ((MultiActionController)mappedHandler.getHandler()).xxx
}else if(mappedHandler.getHandler() instanceof XXX){
    ...
}else if(...){
   ...
}
```

Nếu thêm một loại `Controller` nữa thì phải thêm một câu lệnh điều kiện vào code trên, hình thức này làm cho chương trình khó bảo trì, cũng vi phạm nguyên tắc Open/Closed trong design pattern - mở cho mở rộng, đóng cho sửa đổi.

## Decorator Pattern

Decorator Pattern có thể động thêm một số thuộc tính hoặc hành vi cho đối tượng. So với việc sử dụng kế thừa, Decorator Pattern linh hoạt hơn. Nói đơn giản là khi chúng ta cần sửa đổi chức năng gốc nhưng không muốn sửa trực tiếp code gốc, hãy thiết kế một Decorator bọc quanh code gốc. Thực ra trong JDK cũng có nhiều nơi dùng Decorator Pattern, chẳng hạn như họ `InputStream`, các lớp con của `InputStream` như `FileInputStream` (đọc tệp), `BufferedInputStream` (thêm cache, tăng đáng kể tốc độ đọc tệp), v.v. đều mở rộng chức năng của `InputStream` mà không sửa đổi code `InputStream`.

![装饰者模式示意图](/images/github/javaguide/Decorator.jpg)

Trong Spring khi cấu hình DataSource, DataSource có thể là các cơ sở dữ liệu và nguồn dữ liệu khác nhau. Liệu chúng ta có thể động chuyển đổi giữa các nguồn dữ liệu khác nhau với ít sửa đổi code lớp gốc nhất theo nhu cầu của khách hàng không? Lúc này phải dùng Decorator Pattern (điểm này tôi vẫn chưa hiểu rõ nguyên lý cụ thể). Các class dùng Wrapper Pattern trong Spring có chứa `Wrapper` hoặc `Decorator` trong tên lớp. Những lớp này về cơ bản đều động thêm một số trách nhiệm phụ cho một đối tượng.

## Tổng kết

Spring Framework sử dụng những design pattern nào?

- **Factory Design Pattern**: Spring sử dụng factory pattern để tạo đối tượng bean thông qua `BeanFactory`, `ApplicationContext`.
- **Proxy Design Pattern**: Triển khai chức năng Spring AOP.
- **Singleton Design Pattern**: Bean trong Spring mặc định đều là singleton.
- **Template Method Pattern**: Các lớp thao tác cơ sở dữ liệu kết thúc bằng Template như `jdbcTemplate`, `hibernateTemplate` trong Spring đều sử dụng template pattern.
- **Wrapper Design Pattern**: Dự án của chúng ta cần kết nối nhiều cơ sở dữ liệu, và các khách hàng khác nhau có thể truy cập các cơ sở dữ liệu khác nhau tùy theo nhu cầu trong mỗi lần truy cập. Pattern này cho phép chúng ta động chuyển đổi giữa các nguồn dữ liệu khác nhau theo nhu cầu khách hàng.
- **Observer Pattern**: Mô hình event-driven của Spring là một ứng dụng điển hình của Observer Pattern.
- **Adapter Pattern**: Enhancement hoặc Advice trong Spring AOP sử dụng Adapter Pattern, Spring MVC cũng sử dụng Adapter Pattern để adapt `Controller`.
- ……

## Tài liệu tham khảo

- 《Spring 技术内幕》
- <https://blog.eduonix.com/java-programming-2/learn-design-patterns-used-spring-framework/>
- <https://www.tutorialsteacher.com/ioc/inversion-of-control>
- <https://design-patterns.readthedocs.io/zh_CN/latest/behavioral_patterns/observer.html>
- <https://juejin.im/post/5a8eb261f265da4e9e307230>
- <https://juejin.im/post/5ba28986f265da0abc2b6084>

<!-- @include: @article-footer.snippet.md -->
