---
title: Giải thích chi tiết cơ chế Java SPI
description: Giải thích toàn diện về nguyên lý và ứng dụng của cơ chế Java SPI：hiểu cơ chế khám phá dịch vụ ServiceLoader, ứng dụng SPI trong JDBC/Dubbo/Spring, so sánh với API và các thực tiễn tốt nhất.
category: Java
tag:
  - Java Cơ bản
head:
  - - meta
    - name: keywords
      content: Java SPI,SPI机制,ServiceLoader,服务发现,插件化,JDBC驱动加载,Dubbo扩展,SPI应用
---

> Bài viết này được đóng góp bởi [Kingshion](https://github.com/jjx0708). Rất chào đón các bạn tham gia vào công việc duy trì JavaGuide, đây là một việc rất có ý nghĩa. Chi tiết xem tại: [Hướng dẫn đóng góp JavaGuide](https://javaguide.cn/javaguide/contribution-guideline.html).

Thiết kế hướng đối tượng khuyến khích lập trình dựa trên giao diện thay vì dựa trên các triển khai cụ thể giữa các module, nhằm giảm sự phụ thuộc giữa các module, tuân theo nguyên tắc đảo ngược phụ thuộc và hỗ trợ nguyên tắc đóng mở (mở cho mở rộng, đóng cho sửa đổi). Tuy nhiên, phụ thuộc trực tiếp vào các triển khai cụ thể sẽ dẫn đến việc phải sửa đổi mã khi thay thế triển khai, vi phạm nguyên tắc đóng mở. Để giải quyết vấn đề này, SPI ra đời, cung cấp một cơ chế khám phá dịch vụ, cho phép chỉ định động các triển khai cụ thể từ bên ngoài chương trình. Điều này tương tự với tư tưởng của Inversion of Control (IoC), chuyển quyền kiểm soát lắp ráp component ra ngoài chương trình.

Cơ chế SPI cũng giải quyết được các hạn chế do mô hình ủy quyền cha mẹ trong hệ thống tải lớp Java gây ra. [Mô hình ủy quyền cha mẹ](https://javaguide.cn/java/jvm/classloader.html) tuy đảm bảo tính an toàn và nhất quán của thư viện lõi, nhưng cũng hạn chế khả năng tải các lớp trên classpath của ứng dụng (thường được triển khai bởi bên thứ ba) từ thư viện lõi hoặc thư viện mở rộng. SPI cho phép thư viện lõi hoặc thư viện mở rộng định nghĩa giao diện dịch vụ, các nhà phát triển bên thứ ba cung cấp và triển khai, cơ chế tải dịch vụ SPI sẽ tự động khám phá và tải các triển khai này trong thời gian chạy. Ví dụ, JDBC 4.0 trở lên sử dụng SPI để tự động khám phá và tải driver cơ sở dữ liệu, nhà phát triển chỉ cần đặt file JAR của driver vào classpath mà không cần dùng `Class.forName()` để tải lớp driver một cách tường minh.

## Giới thiệu SPI

### SPI là gì?

SPI tức là Service Provider Interface, nghĩa đen là "giao diện của nhà cung cấp dịch vụ". Cách hiểu của tôi là: một giao diện dành riêng cho các nhà cung cấp dịch vụ hoặc các nhà phát triển muốn mở rộng chức năng của framework.

SPI tách biệt giao diện dịch vụ khỏi các triển khai dịch vụ cụ thể, tách rời bên gọi dịch vụ và bên triển khai dịch vụ, giúp tăng tính mở rộng và khả năng bảo trì của chương trình. Việc sửa đổi hoặc thay thế triển khai dịch vụ không cần sửa đổi bên gọi.

Nhiều framework sử dụng cơ chế SPI của Java, ví dụ: Spring framework, tải driver cơ sở dữ liệu, giao diện log, và cơ chế mở rộng của Dubbo, v.v.

<img src="/images/github/javaguide/java/basis/spi/22e1830e0b0e4115a882751f6c417857tplv-k3u1fbpfcp-zoom-1.jpeg" style="zoom:50%;" />

### SPI và API khác nhau như thế nào?

**Vậy SPI và API khác nhau chỗ nào?**

Nói đến SPI thì không thể không nhắc đến API (Application Programming Interface). Theo nghĩa rộng, cả hai đều là giao diện và rất dễ nhầm lẫn. Hãy dùng một hình ảnh để làm rõ trước:

![SPI VS API](/images/github/javaguide/java/basis/spi-vs-api.png)

Thông thường, giao tiếp giữa các module được thực hiện qua giao diện, vì vậy chúng ta đưa một "giao diện" vào giữa bên gọi dịch vụ và bên triển khai dịch vụ (còn gọi là nhà cung cấp dịch vụ).

- Khi bên triển khai cung cấp cả giao diện lẫn triển khai, chúng ta có thể gọi giao diện của bên triển khai để sử dụng khả năng mà họ cung cấp, đó là **API**. Trong trường hợp này, cả giao diện lẫn triển khai đều nằm trong package của bên triển khai. Bên gọi gọi chức năng của bên triển khai thông qua giao diện mà không cần quan tâm đến chi tiết triển khai cụ thể.
- Khi giao diện tồn tại ở phía bên gọi, đó là **SPI**. Bên gọi giao diện xác định quy tắc giao diện, sau đó các nhà cung cấp khác nhau triển khai giao diện này theo quy tắc đó để cung cấp dịch vụ.

Ví dụ dễ hiểu: Công ty H là một công ty công nghệ, vừa thiết kế một chip mới và cần sản xuất đại trà. Thị trường có nhiều công ty sản xuất chip. Khi đó, chỉ cần công ty H xác định tiêu chuẩn sản xuất chip (định nghĩa tiêu chuẩn giao diện), các công ty chip đối tác (nhà cung cấp dịch vụ) sẽ giao hàng theo tiêu chuẩn với các đặc điểm riêng của họ (cung cấp các triển khai khác nhau nhưng cho ra kết quả giống nhau).

## Demo thực tế

SLF4J (Simple Logging Facade for Java) là một facade log (giao diện) cho Java, có nhiều triển khai cụ thể như: Logback, Log4j, Log4j2, v.v. Và còn có thể chuyển đổi giữa các triển khai mà không cần thay đổi mã dự án, chỉ cần chỉnh sửa một số phụ thuộc trong Maven pom là đủ.

![](/images/github/javaguide/java/basis/spi/image-20220723213306039-165858318917813.png)

Đây chính là được triển khai dựa vào cơ chế SPI. Tiếp theo chúng ta sẽ cùng triển khai một phiên bản đơn giản của framework log.

### Service Provider Interface

Tạo một dự án Java mới `service-provider-interface` với cấu trúc thư mục như sau: (lưu ý tạo dự án Java thuần túy, không tạo dự án Maven. Dự án Maven liên quan đến một số cấu hình biên dịch, nếu có private server thì deploy trực tiếp sẽ thuận tiện hơn, nhưng nếu không có thì có thể gặp một số vấn đề kỳ lạ trong quá trình thực hiện.)

```plain
│  service-provider-interface.iml
│
├─.idea
│  │  .gitignore
│  │  misc.xml
│  │  modules.xml
│  └─ workspace.xml
│
└─src
    └─edu
        └─jiangxuan
            └─up
                └─spi
                        Logger.java
                        LoggerService.java
                        Main.class
```

Tạo giao diện `Logger`, đây chính là SPI - giao diện nhà cung cấp dịch vụ. Các nhà cung cấp dịch vụ sau này sẽ triển khai giao diện này.

```java
package edu.jiangxuan.up.spi;

public interface Logger {
    void info(String msg);
    void debug(String msg);
}
```

Tiếp theo là lớp `LoggerService`, chủ yếu để cung cấp chức năng cụ thể cho người sử dụng dịch vụ (bên gọi). Lớp này cũng là yếu tố then chốt để triển khai cơ chế Java SPI. Nếu còn thắc mắc, bạn có thể tiếp tục đọc phần sau.

```java
package edu.jiangxuan.up.spi;

import java.util.ArrayList;
import java.util.List;
import java.util.ServiceLoader;

public class LoggerService {
    private static final LoggerService SERVICE = new LoggerService();

    private final Logger logger;

    private final List<Logger> loggerList;

    private LoggerService() {
        ServiceLoader<Logger> loader = ServiceLoader.load(Logger.class);
        List<Logger> list = new ArrayList<>();
        for (Logger log : loader) {
            list.add(log);
        }
        // LoggerList 是所有 ServiceProvider
        loggerList = list;
        if (!list.isEmpty()) {
            // Logger 只取一个
            logger = list.get(0);
        } else {
            logger = null;
        }
    }

    public static LoggerService getService() {
        return SERVICE;
    }

    public void info(String msg) {
        if (logger == null) {
            System.out.println("info 中没有发现 Logger 服务提供者");
        } else {
            logger.info(msg);
        }
    }

    public void debug(String msg) {
        if (loggerList.isEmpty()) {
            System.out.println("debug 中没有发现 Logger 服务提供者");
        }
        loggerList.forEach(log -> log.debug(msg));
    }
}
```

Tạo lớp `Main` (người dùng dịch vụ, bên gọi), khởi chạy chương trình để xem kết quả.

```java
package org.spi.service;

public class Main {
    public static void main(String[] args) {
        LoggerService service = LoggerService.getService();

        service.info("Hello SPI");
        service.debug("Hello SPI");
    }
}
```

Kết quả chương trình:

> info 中没有发现 Logger 服务提供者
> debug 中没有发现 Logger 服务提供者

Lúc này chúng ta chỉ có giao diện rỗng, chưa cung cấp bất kỳ triển khai nào cho giao diện `Logger`, nên kết quả đầu ra không in ra những gì được mong đợi.

Bạn có thể dùng lệnh hoặc trực tiếp dùng IDEA để đóng gói toàn bộ chương trình thành file jar.

### Service Provider

Tiếp theo tạo một dự án mới để triển khai giao diện `Logger`.

Tạo dự án `service-provider` với cấu trúc thư mục như sau:

```plain
│  service-provider.iml
│
├─.idea
│  │  .gitignore
│  │  misc.xml
│  │  modules.xml
│  └─ workspace.xml
│
├─lib
│      service-provider-interface.jar
|
└─src
    ├─edu
    │  └─jiangxuan
    │      └─up
    │          └─spi
    │              └─service
    │                      Logback.java
    │
    └─META-INF
        └─services
                edu.jiangxuan.up.spi.Logger

```

Tạo lớp `Logback`

```java
package edu.jiangxuan.up.spi.service;

import edu.jiangxuan.up.spi.Logger;

public class Logback implements Logger {
    @Override
    public void info(String s) {
        System.out.println("Logback info 打印日志：" + s);
    }

    @Override
    public void debug(String s) {
        System.out.println("Logback debug 打印日志：" + s);
    }
}

```

Import file jar của `service-provider-interface` vào dự án.

Tạo thư mục lib, sao chép file jar vào đó, rồi thêm vào dự án.

![](/images/github/javaguide/java/basis/spi/523d5e25198444d3b112baf68ce49daetplv-k3u1fbpfcp-watermark.png)

Sau đó nhấn OK.

![](/images/github/javaguide/java/basis/spi/f4ba0aa71e9b4d509b9159892a220850tplv-k3u1fbpfcp-watermark.png)

Tiếp theo bạn có thể import các lớp và phương thức từ file jar vào dự án, giống như khi import JDK.

Triển khai giao diện `Logger`, trong thư mục `src` tạo thư mục `META-INF/services`, sau đó tạo file `edu.jiangxuan.up.spi.Logger` (tên đầy đủ của SPI), nội dung file là: `edu.jiangxuan.up.spi.service.Logback` (tên đầy đủ của Logback, tức là tên package + tên lớp của lớp triển khai SPI).

**Đây là tiêu chuẩn đã được thống nhất bởi JDK SPI ServiceLoader.**

Giải thích sơ qua: Cơ chế SPI trong Java là mỗi khi tải lớp sẽ tìm kiếm file trong thư mục `META-INF/services` dưới thư mục tương đối của class, tải tất cả các file trong thư mục đó vào bộ nhớ, rồi dựa trên tên file và nội dung file để tìm lớp triển khai cụ thể của giao diện tương ứng. Sau khi tìm thấy lớp triển khai, có thể dùng reflection để tạo đối tượng tương ứng, lưu vào một danh sách list, từ đó có thể lấy các instance tương ứng thông qua vòng lặp hoặc duyệt danh sách để tạo ra các triển khai khác nhau.

Do đó, có một số yêu cầu quy tắc: Tên file phải là tên đầy đủ của giao diện, nội dung file phải là tên đầy đủ của các lớp triển khai. Có thể có nhiều lớp triển khai, chỉ cần xuống dòng. Khi có nhiều lớp triển khai, chúng sẽ được tải lần lượt từng cái một.

Tiếp theo cũng đóng gói dự án `service-provider` thành file jar, đây chính là triển khai của nhà cung cấp dịch vụ. Thông thường việc import phụ thuộc Maven pom cũng tương tự như vậy, chỉ là chúng ta chưa publish file jar này lên Maven public repository, nên phải thêm thủ công vào dự án cần dùng.

### Kết quả trình diễn

Để trực quan hơn, tôi tạo thêm một dự án test mới: `java-spi-test`

Sau đó import file jar giao diện `Logger` trước, rồi import file jar của lớp triển khai cụ thể.

![](/images/github/javaguide/java/basis/spi/image-20220723215812708-165858469599214.png)

Tạo phương thức Main để test:

```java
package edu.jiangxuan.up.service;

import edu.jiangxuan.up.spi.LoggerService;

public class TestJavaSPI {
    public static void main(String[] args) {
        LoggerService loggerService = LoggerService.getService();
        loggerService.info("你好");
        loggerService.debug("测试Java SPI 机制");
    }
}
```

Kết quả chạy:

> Logback info 打印日志：你好
> Logback debug 打印日志：测试 Java SPI 机制

Điều này chứng minh lớp triển khai trong file jar đã được import và hoạt động.

Nếu chúng ta không import file jar của lớp triển khai cụ thể, kết quả chạy sẽ là:

> info 中没有发现 Logger 服务提供者
> debug 中没有发现 Logger 服务提供者

Qua việc sử dụng cơ chế SPI, có thể thấy sự phụ thuộc giữa dịch vụ (`LoggerService`) và nhà cung cấp dịch vụ rất thấp. Nếu muốn đổi sang một triển khai khác, chỉ cần thay đổi triển khai cụ thể cho giao diện `Logger` trong dự án `service-provider`, chỉ cần thay một file jar khác. Cũng có thể có nhiều triển khai trong một dự án, đây chẳng phải là nguyên lý của SLF4J hay sao?

Nếu một ngày yêu cầu thay đổi, cần xuất log ra message queue hoặc thực hiện một số thao tác khác, khi đó hoàn toàn không cần thay đổi triển khai của Logback, chỉ cần thêm một triển khai dịch vụ mới (service-provider) - có thể thêm triển khai ngay trong dự án này hoặc đưa vào từ bên ngoài qua file jar dịch vụ mới. Chúng ta có thể chọn một triển khai cụ thể (service-provider) trong dịch vụ (LoggerService) để hoàn thành các thao tác cần thiết.

Tiếp theo hãy cùng tìm hiểu chi tiết nguyên lý hoạt động cốt lõi của Java SPI — **ServiceLoader**.

## ServiceLoader

### Triển khai cụ thể của ServiceLoader

Để sử dụng cơ chế SPI của Java cần dựa vào `ServiceLoader` để triển khai. Hãy cùng xem `ServiceLoader` thực sự làm gì:

`ServiceLoader` là một lớp tiện ích do JDK cung cấp, nằm trong package `java.util;`.

```plain
A facility to load implementations of a service.
```

Đây là chú thích chính thức của JDK: **Một công cụ để tải các triển khai của dịch vụ.**

Tiếp tục đọc, chúng ta thấy lớp này là kiểu `final`, nên không thể kế thừa hay sửa đổi, đồng thời nó triển khai giao diện `Iterable`. Lý do triển khai iterator là để tiện lợi cho việc lấy triển khai dịch vụ tương ứng thông qua duyệt lặp sau này.

```java
public final class ServiceLoader<S> implements Iterable<S>{ xxx...}
```

Có thể thấy một khai báo hằng quen thuộc:

`private static final String PREFIX = "META-INF/services/";`

Dưới đây là phương thức `load`: có thể thấy phương thức `load` hỗ trợ hai kiểu tham số nạp chồng;

```java
public static <S> ServiceLoader<S> load(Class<S> service) {
    ClassLoader cl = Thread.currentThread().getContextClassLoader();
    return ServiceLoader.load(service, cl);
}

public static <S> ServiceLoader<S> load(Class<S> service,
                                        ClassLoader loader) {
    return new ServiceLoader<>(service, loader);
}

private ServiceLoader(Class<S> svc, ClassLoader cl) {
    service = Objects.requireNonNull(svc, "Service interface cannot be null");
    loader = (cl == null) ? ClassLoader.getSystemClassLoader() : cl;
    acc = (System.getSecurityManager() != null) ? AccessController.getContext() : null;
    reload();
}

public void reload() {
    providers.clear();
    lookupIterator = new LazyIterator(service, loader);
}
```

Cơ chế giải quyết việc tải lớp của bên thứ ba thực ra nằm trong `ClassLoader cl = Thread.currentThread().getContextClassLoader();`, `cl` chính là **Thread Context ClassLoader** (bộ tải lớp ngữ cảnh luồng). Đây là bộ tải lớp mà mỗi luồng nắm giữ, thiết kế của JDK cho phép ứng dụng hoặc container (như Web application server) đặt bộ tải lớp này để thư viện lõi có thể dùng nó để tải các lớp của ứng dụng.

Theo mặc định, Thread Context ClassLoader là Application ClassLoader (bộ tải lớp ứng dụng), chịu trách nhiệm tải các lớp trên classpath. Khi thư viện lõi cần tải các lớp do ứng dụng cung cấp, nó có thể dùng Thread Context ClassLoader để thực hiện. Như vậy, ngay cả mã thư viện lõi được tải bởi bootstrap classloader cũng có thể tải và sử dụng các lớp được tải bởi Application ClassLoader.

Theo thứ tự gọi trong code, trong phương thức `reload()` được triển khai thông qua lớp nội bộ `LazyIterator`. Tiếp tục đọc phần dưới.

Sau khi `ServiceLoader` triển khai phương thức của giao diện `Iterable`, nó có khả năng lặp. Khi phương thức `iterator` này được gọi, trước tiên sẽ tìm kiếm trong cache `Provider` của `ServiceLoader`, nếu cache không có thì tìm kiếm trong `LazyIterator`.

```java

public Iterator<S> iterator() {
    return new Iterator<S>() {

        Iterator<Map.Entry<String, S>> knownProviders
                = providers.entrySet().iterator();

        public boolean hasNext() {
            if (knownProviders.hasNext())
                return true;
            return lookupIterator.hasNext(); // 调用 LazyIterator
        }

        public S next() {
            if (knownProviders.hasNext())
                return knownProviders.next().getValue();
            return lookupIterator.next(); // 调用 LazyIterator
        }

        public void remove() {
            throw new UnsupportedOperationException();
        }

    };
}
```

Khi gọi `LazyIterator`, triển khai cụ thể như sau:

```java

public boolean hasNext() {
    if (acc == null) {
        return hasNextService();
    } else {
        PrivilegedAction<Boolean> action = new PrivilegedAction<Boolean>() {
            public Boolean run() {
                return hasNextService();
            }
        };
        return AccessController.doPrivileged(action, acc);
    }
}

private boolean hasNextService() {
    if (nextName != null) {
        return true;
    }
    if (configs == null) {
        try {
            //通过PREFIX（META-INF/services/）和类名 获取对应的配置文件，得到具体的实现类
            String fullName = PREFIX + service.getName();
            if (loader == null)
                configs = ClassLoader.getSystemResources(fullName);
            else
                configs = loader.getResources(fullName);
        } catch (IOException x) {
            fail(service, "Error locating configuration files", x);
        }
    }
    while ((pending == null) || !pending.hasNext()) {
        if (!configs.hasMoreElements()) {
            return false;
        }
        pending = parse(service, configs.nextElement());
    }
    nextName = pending.next();
    return true;
}


public S next() {
    if (acc == null) {
        return nextService();
    } else {
        PrivilegedAction<S> action = new PrivilegedAction<S>() {
            public S run() {
                return nextService();
            }
        };
        return AccessController.doPrivileged(action, acc);
    }
}

private S nextService() {
    if (!hasNextService())
        throw new NoSuchElementException();
    String cn = nextName;
    nextName = null;
    Class<?> c = null;
    try {
        c = Class.forName(cn, false, loader);
    } catch (ClassNotFoundException x) {
        fail(service,
                "Provider " + cn + " not found");
    }
    if (!service.isAssignableFrom(c)) {
        fail(service,
                "Provider " + cn + " not a subtype");
    }
    try {
        S p = service.cast(c.newInstance());
        providers.put(cn, p);
        return p;
    } catch (Throwable x) {
        fail(service,
                "Provider " + cn + " could not be instantiated",
                x);
    }
    throw new Error();          // This cannot happen
}
```

Có thể nhiều người thấy phần này hơi phức tạp, không sao, tôi đã triển khai một mô hình `ServiceLoader` đơn giản, quy trình và nguyên lý đều nhất quán, bạn có thể bắt đầu bằng cách tự triển khai một phiên bản đơn giản:

### Tự triển khai một ServiceLoader

Dán code trước:

```java
package edu.jiangxuan.up.service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Constructor;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

public class MyServiceLoader<S> {

    // 对应的接口 Class 模板
    private final Class<S> service;

    // 对应实现类的 可以有多个，用 List 进行封装
    private final List<S> providers = new ArrayList<>();

    // 类加载器
    private final ClassLoader classLoader;

    // 暴露给外部使用的方法，通过调用这个方法可以开始加载自己定制的实现流程。
    public static <S> MyServiceLoader<S> load(Class<S> service) {
        return new MyServiceLoader<>(service);
    }

    // 构造方法私有化
    private MyServiceLoader(Class<S> service) {
        this.service = service;
        this.classLoader = Thread.currentThread().getContextClassLoader();
        doLoad();
    }

    // 关键方法，加载具体实现类的逻辑
    private void doLoad() {
        try {
            // 读取所有 jar 包里面 META-INF/services 包下面的文件，这个文件名就是接口名，然后文件里面的内容就是具体的实现类的路径加全类名
            Enumeration<URL> urls = classLoader.getResources("META-INF/services/" + service.getName());
            // 挨个遍历取到的文件
            while (urls.hasMoreElements()) {
                // 取出当前的文件
                URL url = urls.nextElement();
                System.out.println("File = " + url.getPath());
                // 建立链接
                URLConnection urlConnection = url.openConnection();
                urlConnection.setUseCaches(false);
                // 获取文件输入流
                InputStream inputStream = urlConnection.getInputStream();
                // 从文件输入流获取缓存
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
                // 从文件内容里面得到实现类的全类名
                String className = bufferedReader.readLine();

                while (className != null) {
                    // 通过反射拿到实现类的实例
                    Class<?> clazz = Class.forName(className, false, classLoader);
                    // 如果声明的接口跟这个具体的实现类是属于同一类型，（可以理解为Java的一种多态，接口跟实现类、父类和子类等等这种关系。）则构造实例
                    if (service.isAssignableFrom(clazz)) {
                        Constructor<? extends S> constructor = (Constructor<? extends S>) clazz.getConstructor();
                        S instance = constructor.newInstance();
                        // 把当前构造的实例对象添加到 Provider的列表里面
                        providers.add(instance);
                    }
                    // 继续读取下一行的实现类，可以有多个实现类，只需要换行就可以了。
                    className = bufferedReader.readLine();
                }
            }
        } catch (Exception e) {
            System.out.println("读取文件异常。。。");
        }
    }

    // 返回spi接口对应的具体实现类列表
    public List<S> getProviders() {
        return providers;
    }
}
```

Các thông tin chính đã được mô tả qua chú thích trong code.

Luồng chính là:

1. Dùng công cụ URL để tìm file tương ứng trong thư mục `/META-INF/services` của file jar,
2. Đọc tên file để tìm giao diện spi tương ứng,
3. Dùng stream `InputStream` để đọc tên đầy đủ của các lớp triển khai cụ thể trong file,
4. Dựa trên tên đầy đủ thu được, kiểm tra xem có cùng kiểu với giao diện spi không, nếu có thì dùng cơ chế reflection để tạo đối tượng instance tương ứng,
5. Thêm instance vừa tạo vào danh sách `Providers`.

## Tổng kết

Thực ra không khó để nhận ra, triển khai cụ thể của cơ chế SPI về bản chất vẫn được hoàn thành qua reflection. Cụ thể là: **Chúng ta khai báo lớp triển khai cụ thể cần công khai ra bên ngoài trong file `META-INF/services/` theo quy tắc.**

Ngoài ra, cơ chế SPI được áp dụng trong nhiều framework: Nguyên lý cơ bản của Spring framework cũng tương tự. Dubbo framework cũng cung cấp cơ chế mở rộng SPI tương tự, chỉ là cách triển khai cụ thể cơ chế SPI trong Dubbo và Spring có một số điểm khác biệt nhỏ so với những gì chúng ta học hôm nay, nhưng nguyên lý tổng thể đều nhất quán. Tin rằng thông qua việc học cơ chế SPI trong JDK, các bạn có thể hiểu được một, biết được trăm, hiểu sâu hơn về các framework khác.

Thông qua cơ chế SPI có thể nâng cao đáng kể tính linh hoạt của thiết kế giao diện, tuy nhiên cơ chế SPI cũng có một số nhược điểm, ví dụ:

1. Duyệt tải tất cả các lớp triển khai, hiệu quả tương đối thấp;
2. Khi nhiều `ServiceLoader` cùng `load` đồng thời, sẽ có vấn đề về đồng thời.

<!-- @include: @article-footer.snippet.md -->
