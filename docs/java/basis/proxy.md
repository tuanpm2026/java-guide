---
title: Giải Thích Chi Tiết Proxy Pattern trong Java
description: "Giải thích chi tiết nguyên lý và cách triển khai Proxy Pattern trong Java: so sánh sự khác biệt giữa static proxy và dynamic proxy, phân tích sâu cơ chế JDK dynamic proxy và CGLIB proxy, hiểu rõ cách triển khai AOP cross-cutting concerns."
category: Java
tag:
  - Java Cơ Bản
head:
  - - meta
    - name: keywords
      content: Java代理模式,静态代理,动态代理,JDK动态代理,CGLIB代理,AOP,设计模式,代理实现
---

## 1. Proxy Pattern

Proxy Pattern là một design pattern khá dễ hiểu. Nói đơn giản thì **chúng ta sử dụng đối tượng proxy để thay thế cho việc truy cập trực tiếp vào đối tượng thực (real object), nhờ đó có thể cung cấp thêm các tính năng bổ sung và mở rộng chức năng của đối tượng đích mà không cần sửa đổi đối tượng đích gốc.**

**Mục đích chính của Proxy Pattern là mở rộng chức năng của đối tượng đích, ví dụ như có thể thêm các thao tác tùy chỉnh trước và sau khi thực thi một phương thức nào đó của đối tượng đích.**

Ví dụ: Cô dâu nhờ dì của mình thay mặt để xử lý các câu hỏi từ chú rể, những câu hỏi mà cô dâu nhận được đều đã được dì xử lý và lọc qua. Người dì ở đây có thể được coi là đối tượng proxy của bạn, hành vi (phương thức) được ủy quyền là tiếp nhận và trả lời câu hỏi của chú rể.

![Understanding the Proxy Design Pattern | by Mithun Sasidharan | Medium](/images/2020-8/1*DjWCgTFm-xqbhbNQVsaWQw.png)

<p style="text-align:right;font-size:13px;color:gray">https://medium.com/@mithunsasidharan/understanding-the-proxy-design-pattern-5e63fe38052a</p>

Proxy Pattern có hai cách triển khai là static proxy và dynamic proxy, chúng ta hãy xem cách triển khai của static proxy trước.

## 2. Static Proxy

Trong static proxy, việc tăng cường mỗi phương thức của đối tượng đích đều được thực hiện thủ công (sẽ trình bày code cụ thể ở phần sau), rất thiếu linh hoạt (ví dụ như khi interface thêm phương thức mới, cả đối tượng đích lẫn đối tượng proxy đều phải chỉnh sửa) và rất phiền phức (cần phải viết riêng một lớp proxy cho mỗi lớp đích). Kịch bản ứng dụng thực tế rất rất ít, hầu như không thấy việc sử dụng static proxy trong phát triển hàng ngày.

Ở trên chúng ta đã nói về static proxy từ góc độ triển khai và ứng dụng. Từ góc độ JVM, **static proxy sẽ biên dịch interface, lớp triển khai, lớp proxy thành các file `.class` thực tế ngay lúc biên dịch.**

Các bước triển khai static proxy:

1. Định nghĩa một interface và lớp triển khai của nó;
2. Tạo một lớp proxy cũng triển khai interface đó;
3. Inject đối tượng đích vào lớp proxy, sau đó gọi phương thức tương ứng của lớp đích trong phương thức tương ứng của lớp proxy. Như vậy, chúng ta có thể che giấu việc truy cập đối tượng đích thông qua lớp proxy và có thể làm những thứ tùy ý trước và sau khi phương thức đích thực thi.

Dưới đây là demo qua code!

**1. Định nghĩa interface gửi tin nhắn SMS**

```java
public interface SmsService {
    String send(String message);
}
```

**2. Triển khai interface gửi tin nhắn SMS**

```java
public class SmsServiceImpl implements SmsService {
    public String send(String message) {
        System.out.println("send message:" + message);
        return message;
    }
}
```

**3. Tạo lớp proxy và cũng triển khai interface gửi tin nhắn SMS**

```java
public class SmsProxy implements SmsService {

    private final SmsService smsService;

    public SmsProxy(SmsService smsService) {
        this.smsService = smsService;
    }

    @Override
    public String send(String message) {
        //调用方法之前，我们可以添加自己的操作
        System.out.println("before method send()");
        smsService.send(message);
        //调用方法之后，我们同样可以添加自己的操作
        System.out.println("after method send()");
        return null;
    }
}
```

**4. Sử dụng thực tế**

```java
public class Main {
    public static void main(String[] args) {
        SmsService smsService = new SmsServiceImpl();
        SmsProxy smsProxy = new SmsProxy(smsService);
        smsProxy.send("java");
    }
}
```

Sau khi chạy đoạn code trên, console sẽ in ra:

```bash
before method send()
send message:java
after method send()
```

Nhìn vào kết quả đầu ra, chúng ta đã tăng cường phương thức `send()` của `SmsServiceImpl`.

## 3. Dynamic Proxy

So với static proxy, dynamic proxy linh hoạt hơn nhiều. Chúng ta không cần tạo riêng một lớp proxy cho mỗi lớp đích, và cũng không nhất thiết phải triển khai interface — chúng ta có thể proxy trực tiếp lớp triển khai (cơ chế CGLIB dynamic proxy).

**Từ góc độ JVM, dynamic proxy sinh ra bytecode của lớp một cách động tại thời điểm runtime và nạp vào JVM.**

Khi nói đến dynamic proxy, Spring AOP và RPC framework là hai thứ không thể không nhắc đến, cả hai đều dựa trên dynamic proxy để triển khai.

**Dynamic proxy được sử dụng tương đối ít trong phát triển hàng ngày của chúng ta, nhưng trong các framework thì gần như là công nghệ bắt buộc phải dùng. Sau khi học được dynamic proxy, nó cũng rất hữu ích cho việc hiểu và học nguyên lý của các framework khác nhau.**

Đối với Java, có nhiều cách triển khai dynamic proxy, chẳng hạn như **JDK dynamic proxy**, **CGLIB dynamic proxy**, v.v.

[guide-rpc-framework](https://github.com/Snailclimb/guide-rpc-framework) sử dụng JDK dynamic proxy, hãy cùng xem cách sử dụng JDK dynamic proxy trước.

Ngoài ra, mặc dù [guide-rpc-framework](https://github.com/Snailclimb/guide-rpc-framework) không sử dụng **CGLIB dynamic proxy**, chúng ta vẫn giới thiệu qua cách sử dụng của nó cùng với sự so sánh với **JDK dynamic proxy**.

### 3.1. Cơ chế JDK Dynamic Proxy

#### 3.1.1. Giới thiệu

**Trong cơ chế Java dynamic proxy, interface `InvocationHandler` và lớp `Proxy` là cốt lõi.**

Phương thức được sử dụng nhiều nhất trong lớp `Proxy` là: `newProxyInstance()`, phương thức này chủ yếu dùng để tạo ra một đối tượng proxy.

```java
    public static Object newProxyInstance(ClassLoader loader,
                                          Class<?>[] interfaces,
                                          InvocationHandler h)
        throws IllegalArgumentException
    {
        ......
    }
```

Phương thức này có 3 tham số:

1. **loader**: Class loader, dùng để nạp đối tượng proxy.
2. **interfaces**: Một số interface mà lớp được proxy triển khai;
3. **h**: Đối tượng đã triển khai interface `InvocationHandler`;

Để triển khai dynamic proxy, còn phải triển khai `InvocationHandler` để tùy chỉnh logic xử lý. Khi đối tượng dynamic proxy của chúng ta gọi một phương thức, lời gọi phương thức đó sẽ được chuyển tiếp đến phương thức `invoke` của lớp triển khai interface `InvocationHandler`.

```java
public interface InvocationHandler {

    /**
     * 当你使用代理对象调用方法的时候实际会调用到这个方法
     */
    public Object invoke(Object proxy, Method method, Object[] args)
        throws Throwable;
}
```

Phương thức `invoke()` có ba tham số sau:

1. **proxy**: Lớp proxy được tạo ra động
2. **method**: Phương thức tương ứng với phương thức được gọi từ đối tượng lớp proxy
3. **args**: Các tham số của phương thức `method` hiện tại

Tức là: **khi đối tượng proxy được tạo ra bằng `newProxyInstance()` của lớp `Proxy` gọi một phương thức, thực tế nó sẽ gọi đến phương thức `invoke()` của lớp triển khai interface `InvocationHandler`.** Bạn có thể tùy chỉnh logic xử lý trong phương thức `invoke()`, ví dụ như làm gì đó trước và sau khi phương thức thực thi.

#### 3.1.2. Các bước sử dụng lớp JDK Dynamic Proxy

1. Định nghĩa một interface và lớp triển khai của nó;
2. Tùy chỉnh `InvocationHandler` và override phương thức `invoke`, trong phương thức `invoke` chúng ta sẽ gọi phương thức gốc (phương thức của lớp được proxy) và tùy chỉnh một số logic xử lý;
3. Tạo đối tượng proxy thông qua phương thức `Proxy.newProxyInstance(ClassLoader loader, Class<?>[] interfaces, InvocationHandler h)`;

#### 3.1.3. Ví dụ code

Nói như vậy có thể hơi trừu tượng và khó hiểu, hãy xem một ví dụ để cảm nhận!

**1. Định nghĩa interface gửi tin nhắn SMS**

```java
public interface SmsService {
    String send(String message);
}
```

**2. Triển khai interface gửi tin nhắn SMS**

```java
public class SmsServiceImpl implements SmsService {
    public String send(String message) {
        System.out.println("send message:" + message);
        return message;
    }
}
```

**3. Định nghĩa một lớp JDK dynamic proxy**

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * @author shuang.kou
 * @createTime 2020年05月11日 11:23:00
 */
public class DebugInvocationHandler implements InvocationHandler {
    /**
     * 代理类中的真实对象
     */
    private final Object target;

    public DebugInvocationHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws InvocationTargetException, IllegalAccessException {
        //调用方法之前，我们可以添加自己的操作
        System.out.println("before method " + method.getName());
        Object result = method.invoke(target, args);
        //调用方法之后，我们同样可以添加自己的操作
        System.out.println("after method " + method.getName());
        return result;
    }
}

```

Phương thức `invoke()`: Khi đối tượng dynamic proxy của chúng ta gọi phương thức gốc, thực tế cuối cùng là gọi đến phương thức `invoke()`, sau đó `invoke()` thay chúng ta gọi phương thức gốc của đối tượng được proxy.

**4. Factory class để lấy đối tượng proxy**

```java
public class JdkProxyFactory {
    public static Object getProxy(Object target) {
        return Proxy.newProxyInstance(
                target.getClass().getClassLoader(), // 目标类的类加载器
                target.getClass().getInterfaces(),  // 代理需要实现的接口，可指定多个
                new DebugInvocationHandler(target)   // 代理对象对应的自定义 InvocationHandler
        );
    }
}
```

`getProxy()`: Chủ yếu lấy đối tượng proxy của một lớp nào đó thông qua phương thức `Proxy.newProxyInstance()`

**5. Sử dụng thực tế**

```java
SmsService smsService = (SmsService) JdkProxyFactory.getProxy(new SmsServiceImpl());
smsService.send("java");
```

Sau khi chạy đoạn code trên, console sẽ in ra:

```plain
before method send
send message:java
after method send
```

### 3.2. Cơ chế CGLIB Dynamic Proxy

#### 3.2.1. Giới thiệu

**Vấn đề nghiêm trọng nhất của JDK dynamic proxy là nó chỉ có thể proxy các lớp đã triển khai interface.**

**Để giải quyết vấn đề này, chúng ta có thể dùng cơ chế CGLIB dynamic proxy.**

[CGLIB](https://github.com/cglib/cglib) (_Code Generation Library_) là một thư viện sinh bytecode dựa trên [ASM](http://www.baeldung.com/java-asm), cho phép chúng ta sửa đổi bytecode và sinh mã động tại thời điểm runtime. CGLIB triển khai proxy thông qua kế thừa. Nhiều framework open source nổi tiếng đều sử dụng [CGLIB](https://github.com/cglib/cglib), ví dụ như module AOP trong Spring: nếu đối tượng đích triển khai interface thì mặc định dùng JDK dynamic proxy, ngược lại thì dùng CGLIB dynamic proxy.

**Trong cơ chế CGLIB dynamic proxy, interface `MethodInterceptor` và lớp `Enhancer` là cốt lõi.**

Bạn cần tùy chỉnh `MethodInterceptor` và override phương thức `intercept`, `intercept` dùng để chặn và tăng cường các phương thức của lớp được proxy.

```java
public interface MethodInterceptor
extends Callback{
    // 拦截被代理类中的方法
    public Object intercept(Object obj, java.lang.reflect.Method method, Object[] args,MethodProxy proxy) throws Throwable;
}

```

1. **obj**: Đối tượng được proxy (đối tượng cần tăng cường)
2. **method**: Phương thức bị chặn (phương thức cần tăng cường)
3. **args**: Tham số đầu vào của phương thức
4. **proxy**: Dùng để gọi phương thức gốc

Bạn có thể lấy lớp được proxy một cách động thông qua lớp `Enhancer`. Khi lớp proxy gọi phương thức, thực tế là gọi phương thức `intercept` trong `MethodInterceptor`.

#### 3.2.2. Các bước sử dụng lớp CGLIB Dynamic Proxy

1. Định nghĩa một lớp;
2. Tùy chỉnh `MethodInterceptor` và override phương thức `intercept`, `intercept` dùng để chặn và tăng cường các phương thức của lớp được proxy, tương tự phương thức `invoke` trong JDK dynamic proxy;
3. Tạo lớp proxy thông qua phương thức `create()` của lớp `Enhancer`;

#### 3.2.3. Ví dụ code

Khác với JDK dynamic proxy không cần dependency bổ sung, [CGLIB](https://github.com/cglib/cglib) (_Code Generation Library_) thực chất là một project open source, nếu muốn sử dụng thì cần thêm dependency liên quan thủ công.

```xml
<dependency>
  <groupId>cglib</groupId>
  <artifactId>cglib</artifactId>
  <version>3.3.0</version>
</dependency>
```

**1. Triển khai một lớp gửi tin nhắn SMS sử dụng Alibaba Cloud**

```java
package github.javaguide.dynamicProxy.cglibDynamicProxy;

public class AliSmsService {
    public String send(String message) {
        System.out.println("send message:" + message);
        return message;
    }
}
```

**2. Tùy chỉnh `MethodInterceptor` (method interceptor)**

```java
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;

import java.lang.reflect.Method;

/**
 * 自定义MethodInterceptor
 */
public class DebugMethodInterceptor implements MethodInterceptor {


    /**
     * @param o           代理对象本身（注意不是原始对象，如果使用method.invoke(o, args)会导致循环调用）
     * @param method      被拦截的方法（需要增强的方法）
     * @param args        方法入参
     * @param methodProxy 高性能的方法调用机制，避免反射开销
     */
    @Override
    public Object intercept(Object o, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
        //调用方法之前，我们可以添加自己的操作
        System.out.println("before method " + method.getName());
        Object object = methodProxy.invokeSuper(o, args);
        //调用方法之后，我们同样可以添加自己的操作
        System.out.println("after method " + method.getName());
        return object;
    }

}
```

**3. Lấy lớp proxy**

```java
import net.sf.cglib.proxy.Enhancer;

public class CglibProxyFactory {

    public static Object getProxy(Class<?> clazz) {
        // 创建动态代理增强类
        Enhancer enhancer = new Enhancer();
        // 设置类加载器
        enhancer.setClassLoader(clazz.getClassLoader());
        // 设置被代理类
        enhancer.setSuperclass(clazz);
        // 设置方法拦截器
        enhancer.setCallback(new DebugMethodInterceptor());
        // 创建代理类
        return enhancer.create();
    }
}
```

**4. Sử dụng thực tế**

```java
AliSmsService aliSmsService = (AliSmsService) CglibProxyFactory.getProxy(AliSmsService.class);
aliSmsService.send("java");
```

Sau khi chạy đoạn code trên, console sẽ in ra:

```bash
before method send
send message:java
after method send
```

### 3.3. So sánh JDK Dynamic Proxy và CGLIB Dynamic Proxy

1. JDK dynamic proxy là chính thức, nó yêu cầu lớp được proxy phải triển khai interface. Nguyên lý của nó là tạo động một lớp triển khai interface để làm proxy. CGLIB là bên thứ ba, nó không cần interface. Nguyên lý của nó là tạo động một lớp con của lớp được proxy để làm proxy. Nhưng cũng chính vì là kế thừa nên nó không thể proxy các lớp `final`, và các phương thức được proxy cũng không thể là `final` hoặc `private`.
2. Về hiệu suất của cả hai, trong hầu hết các trường hợp JDK dynamic proxy hiệu quả hơn, và lợi thế này càng rõ ràng hơn khi phiên bản JDK được nâng cấp.

## 4. So sánh Static Proxy và Dynamic Proxy

Sự khác biệt cốt lõi giữa static proxy và dynamic proxy nằm ở **thời điểm xác định quan hệ proxy, tính linh hoạt trong triển khai và chi phí bảo trì**.

| Chiều so sánh                    | Static Proxy                                                                                                                                                      | Dynamic Proxy                                                                                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Thời điểm xác định quan hệ proxy | Lúc biên dịch (sau khi biên dịch tạo ra các file bytecode `.class` cố định)                                                                                       | Lúc runtime (tạo động bytecode của lớp proxy và nạp vào JVM)                                                                                                |
| Cách triển khai                  | Viết lớp proxy thủ công, cần triển khai cùng interface với lớp đích, ràng buộc một-một                                                                            | Không cần viết lớp proxy thủ công, đóng gói logic tăng cường thông qua `Handler`/`Interceptor`, tái sử dụng một-nhiều                                       |
| Phụ thuộc interface              | Bắt buộc phải triển khai interface (lớp proxy và lớp đích tuân theo cùng một interface)                                                                           | Hỗ trợ proxy interface hoặc proxy trực tiếp lớp triển khai                                                                                                  |
| Lượng code và khả năng bảo trì   | Lượng code lớn (lớp đích càng nhiều thì lớp proxy càng nhiều), chi phí bảo trì cao; khi interface thêm phương thức, lớp đích và lớp proxy đều cần sửa đổi đồng bộ | Lượng code rất ít (logic tăng cường dùng chung có thể tái sử dụng), dễ bảo trì; tách biệt với interface, thay đổi interface không ảnh hưởng đến logic proxy |
| Ưu điểm cốt lõi                  | Triển khai đơn giản, logic trực quan, không phụ thuộc framework bổ sung                                                                                           | Linh hoạt, khả năng tái sử dụng cao, giảm code lặp, phù hợp với các tình huống phức tạp                                                                     |
| Kịch bản ứng dụng điển hình      | Decorator pattern đơn giản, nhu cầu tăng cường cho ít lớp cố định                                                                                                 | Spring AOP, RPC framework (như Dubbo), ORM framework                                                                                                        |

## 5. Tổng kết

Bài viết này chủ yếu giới thiệu hai cách triển khai của Proxy Pattern: static proxy và dynamic proxy. Bao gồm thực hành với static proxy và dynamic proxy, sự khác biệt giữa static proxy và dynamic proxy, sự khác biệt giữa JDK dynamic proxy và CGLIB dynamic proxy.

Tất cả source code đề cập trong bài, bạn có thể tìm thấy ở đây: [https://github.com/Snailclimb/guide-rpc-framework-learning/tree/master/src/main/java/github/javaguide/proxy](https://github.com/Snailclimb/guide-rpc-framework-learning/tree/master/src/main/java/github/javaguide/proxy) .

<!-- @include: @article-footer.snippet.md -->
