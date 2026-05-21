---
title: Giải thích chi tiết Class Loader (Quan trọng)
description: Giải thích chi tiết Java class loader: phân tích sâu cơ chế class loading của ClassLoader, nguyên lý Parent Delegation Model, Bootstrap ClassLoader/Extension ClassLoader/Application ClassLoader, triển khai custom class loader, tình huống phá vỡ Parent Delegation Model.
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: class loader,ClassLoader,parent delegation model,class loading process,custom class loader,break parent delegation
---

## Ôn lại quá trình Class Loading

Trước khi giới thiệu class loader và parent delegation model, ôn lại nhanh quá trình class loading.

- Quá trình class loading: **Loading → Linking → Initialization**.
- Quá trình Linking lại chia thành ba bước: **Verification → Preparation → Resolution**.

![Quá trình Class Loading](https://oss.javaguide.cn/github/javaguide/java/jvm/class-loading-procedure.png)

Loading là bước đầu tiên của quá trình class loading, chủ yếu hoàn thành 3 việc:

1. Lấy binary byte stream định nghĩa class thông qua fully qualified class name.
2. Chuyển đổi cấu trúc lưu trữ tĩnh do byte stream biểu thị thành cấu trúc dữ liệu runtime của method area.
3. Tạo `Class` object đại diện cho class trong memory, làm access entry cho các data này trong method area.

## Class Loader

### Giới thiệu Class Loader

Class loader xuất hiện từ JDK 1.0, ban đầu chỉ để đáp ứng nhu cầu Java Applet (đã bị loại bỏ). Sau đó dần trở thành một phần quan trọng của Java program, mang lại khả năng dynamic load Java class vào JVM và thực thi.

Theo giới thiệu của official API documentation:

> A class loader is an object that is responsible for loading classes. The class ClassLoader is an abstract class. Given the binary name of a class, a class loader should attempt to locate or generate data that constitutes a definition for the class. A typical strategy is to transform the name into a file name and then read a "class file" of that name from a file system.
>
> Every Class object contains a reference to the ClassLoader that defined it.
>
> Class objects for array classes are not created by class loaders, but are created automatically as required by the Java runtime. The class loader for an array class, as returned by Class.getClassLoader() is the same as the class loader for its element type; if the element type is a primitive type, then the array class has no class loader.

Dịch nghĩa:

> Class loader là object chịu trách nhiệm load class. `ClassLoader` là abstract class. Cho binary name của class, class loader sẽ cố gắng locate hoặc generate data cấu thành định nghĩa của class. Chiến lược điển hình là convert tên thành file name rồi đọc "class file" có tên đó từ file system.
>
> Mỗi Java class đều có reference trỏ đến `ClassLoader` đã load nó. Tuy nhiên array class không được tạo thông qua `ClassLoader` mà được JVM tự động tạo khi cần. `ClassLoader` của array class lấy qua method `getClassLoader()` giống với `ClassLoader` của element type của array đó.

Từ giới thiệu trên có thể thấy:

- Class loader là object chịu trách nhiệm load class, dùng để triển khai bước Loading trong quá trình class loading.
- Mỗi Java class đều có reference trỏ đến `ClassLoader` đã load nó.
- Array class không được tạo thông qua `ClassLoader` (array class không có binary byte stream tương ứng) — được JVM trực tiếp tạo ra.

```java
class Class<T> {
  ...
  private final ClassLoader classLoader;
  @CallerSensitive
  public ClassLoader getClassLoader() {
     //...
  }
  ...
}
```

Nói đơn giản: **Chức năng chính của class loader là dynamic load bytecode (file `.class`) của Java class vào JVM (tạo `Class` object đại diện cho class đó trong memory).** Bytecode có thể được compile từ Java source program (file `.java`) bởi `javac`, cũng có thể được generate động bằng công cụ hoặc download qua network.

Thực ra ngoài load class, class loader còn có thể load resource của Java application như text, image, config file, video, v.v. Bài này chỉ thảo luận về chức năng cốt lõi của nó: load class.

### Quy tắc load của Class Loader

Khi JVM khởi động, không load tất cả class cùng lúc mà load động theo nhu cầu. Tức hầu hết class chỉ được load khi thực sự cần dùng — thân thiện với memory hơn.

Các class đã được load sẽ được đặt trong `ClassLoader`. Khi load class, hệ thống trước tiên kiểm tra xem class hiện tại đã được load chưa. Class đã load sẽ được trả về trực tiếp, ngược lại mới cố load. Tức là với một class loader, class có cùng binary name chỉ được load một lần.

```java
public abstract class ClassLoader {
  ...
  private final ClassLoader parent;
  // Class do class loader này load.
  private final Vector<Class<?>> classes = new Vector<>();
  // Được VM gọi, dùng class loader này để ghi lại mỗi class đã load.
  void addClass(Class<?> c) {
        classes.addElement(c);
   }
  ...
}
```

### Tổng kết Class Loader

JVM tích hợp sẵn ba `ClassLoader` quan trọng:

1. **`BootstrapClassLoader` (Bootstrap class loader)**: Class loader ở tầng cao nhất, được triển khai bằng C++, thường biểu thị là null và không có parent. Chủ yếu dùng để load core class library nội bộ JDK (các jar package như `rt.jar`, `resources.jar`, `charsets.jar` trong thư mục `%JAVA_HOME%/lib` và tất cả class trong path được chỉ định bởi tham số `-Xbootclasspath`).
2. **`ExtensionClassLoader` (Extension class loader)**: Chủ yếu load các jar package và class trong thư mục `%JRE_HOME%/lib/ext` và tất cả class trong path được chỉ định bởi system variable `java.ext.dirs`.
3. **`AppClassLoader` (Application class loader)**: Class loader hướng đến user — load tất cả jar package và class dưới classpath của application hiện tại.

> 🌈 Mở rộng thêm:
>
> - **`rt.jar`**: rt là viết tắt "RunTime". `rt.jar` là Java base class library, chứa class file của tất cả class trong Java doc. Tức các built-in library `java.xxx.*` thường dùng đều ở trong đó như `java.util.*`, `java.io.*`, `java.nio.*`, `java.lang.*`, `java.sql.*`, `java.math.*`.
> - Java 9 giới thiệu module system và thay đổi một chút các class loader trên. Extension class loader đổi tên thành Platform class loader. Trong Java SE ngoài một số module quan trọng như `java.base` được load bởi Bootstrap class loader, các module khác đều được load bởi Platform class loader.

Ngoài ba loại class loader này, user còn có thể thêm custom class loader để mở rộng, đáp ứng nhu cầu đặc biệt. Ví dụ có thể mã hóa bytecode (file `.class`) của Java class, khi load dùng custom class loader để giải mã.

![Sơ đồ quan hệ phân cấp giữa các class loader](https://oss.javaguide.cn/github/javaguide/java/jvm/class-loader-parents-delegation-model.png)

Ngoài `BootstrapClassLoader` là một phần của JVM, tất cả class loader khác đều được triển khai bên ngoài JVM và đều kế thừa từ abstract class `ClassLoader`. Lợi ích là user có thể custom class loader để application quyết định cách lấy class cần thiết.

Mỗi `ClassLoader` có thể lấy parent `ClassLoader` qua `getParent()`. Nếu `ClassLoader` lấy được là `null` thì parent class loader của class loader đó là `BootstrapClassLoader`.

```java
public abstract class ClassLoader {
  ...
  // Parent loader
  private final ClassLoader parent;
  @CallerSensitive
  public final ClassLoader getParent() {
     //...
  }
  ...
}
```

**Tại sao lấy `ClassLoader` là `null` thì là do `BootstrapClassLoader` load?** Vì `BootstrapClassLoader` được triển khai bằng C++. Vì C++ class loader này không có class tương ứng trong Java, nên kết quả lấy được là null.

Dưới đây là ví dụ nhỏ lấy `ClassLoader`:

```java
public class PrintClassLoaderTree {

    public static void main(String[] args) {

        ClassLoader classLoader = PrintClassLoaderTree.class.getClassLoader();

        StringBuilder split = new StringBuilder("|--");
        boolean needContinue = true;
        while (needContinue){
            System.out.println(split.toString() + classLoader);
            if(classLoader == null){
                needContinue = false;
            }else{
                classLoader = classLoader.getParent();
                split.insert(0, "\t");
            }
        }
    }

}
```

Output (JDK 8):

```plain
|--sun.misc.Launcher$AppClassLoader@18b4aac2
    |--sun.misc.Launcher$ExtClassLoader@53bd815b
        |--null
```

Từ output có thể thấy:

- `ClassLoader` của Java class `PrintClassLoaderTree` chúng ta viết là `AppClassLoader`.
- Parent `ClassLoader` của `AppClassLoader` là `ExtClassLoader`.
- Parent `ClassLoader` của `ExtClassLoader` là `Bootstrap ClassLoader` — nên output là null.

### Custom Class Loader

Như đã nói ở trên, ngoài `BootstrapClassLoader` tất cả class loader đều được triển khai bằng Java và đều kế thừa `java.lang.ClassLoader`. Nếu muốn custom class loader, rõ ràng cần kế thừa abstract class `ClassLoader`.

Class `ClassLoader` có hai method quan trọng:

- `protected Class loadClass(String name, boolean resolve)`: Load class với binary name được chỉ định, triển khai parent delegation mechanism. `name` là binary name của class. Nếu `resolve` là true, sẽ gọi method `resolveClass(Class<?> c)` để resolve class khi load.
- `protected Class findClass(String name)`: Tìm class theo binary name, implementation mặc định là empty method.

Official API documentation viết:

> Subclasses of `ClassLoader` are encouraged to override `findClass(String name)`, rather than this method.
>
> Khuyến nghị subclass của `ClassLoader` override method `findClass(String name)` thay vì method `loadClass(String name, boolean resolve)`.

Nếu không muốn phá vỡ Parent Delegation Model, chỉ cần override method `findClass()` trong class `ClassLoader`. Class không thể được parent class loader load cuối cùng sẽ được load qua method này. Nhưng nếu muốn phá vỡ Parent Delegation Model thì cần override method `loadClass()`.

## Parent Delegation Model

### Giới thiệu Parent Delegation Model

Có rất nhiều loại class loader. Khi muốn load một class, class loader cụ thể nào sẽ load? Đây là lúc cần đề cập đến Parent Delegation Model.

Theo giới thiệu của official website:

> The ClassLoader class uses a delegation model to search for classes and resources. Each instance of ClassLoader has an associated parent class loader. When requested to find a class or resource, a ClassLoader instance will delegate the search for the class or resource to its parent class loader before attempting to find the class or resource itself. The virtual machine's built-in class loader, called the "bootstrap class loader", does not itself have a parent but may serve as the parent of a ClassLoader instance.

Dịch nghĩa:

> `ClassLoader` class dùng delegation model để tìm class và resource. Mỗi instance `ClassLoader` đều có parent class loader liên kết. Khi được yêu cầu tìm class hoặc resource, `ClassLoader` instance sẽ ủy thác việc tìm cho parent class loader của nó trước khi tự cố tìm.
> Built-in class loader trong virtual machine gọi là "bootstrap class loader" — bản thân không có parent nhưng có thể là parent của `ClassLoader` instance.

Từ giới thiệu trên có thể thấy:

- `ClassLoader` class dùng delegation model để tìm class và resource.
- Parent Delegation Model yêu cầu ngoài Bootstrap class loader ở tầng cao nhất, tất cả class loader còn lại đều phải có parent class loader.
- `ClassLoader` instance sẽ ủy thác cho parent class loader trước khi tự cố tìm class hoặc resource.

Quan hệ phân cấp giữa các class loader trong hình dưới được gọi là "**Parent Delegation Model**" của class loader.

![Sơ đồ quan hệ phân cấp giữa các class loader](https://oss.javaguide.cn/github/javaguide/java/jvm/class-loader-parents-delegation-model.png)

Lưu ý ⚠️: Parent Delegation Model không phải ràng buộc bắt buộc — chỉ là cách JDK official khuyến nghị. Nếu vì yêu cầu đặc biệt nào đó muốn phá vỡ Parent Delegation Model, cũng được — phần sau sẽ giới thiệu method cụ thể.

Thực ra "dual parent" (cha mẹ) trong tên gọi này dễ gây hiểu lầm. Parent Delegation Model ở đây không có nghĩa thực sự có một `MotherClassLoader` và một `FatherClassLoader`. Tôi cho rằng dịch là "single parent delegation model" tốt hơn. Tuy nhiên đã được gọi là "Parent Delegation Model" và lan truyền trong nước, cứ theo cái tên đó không sao — miễn là không bị hiểu nhầm.

Ngoài ra, quan hệ parent-child giữa các class loader thường không được triển khai bằng kế thừa mà thường dùng composition relationship để tái sử dụng code của parent loader.

```java
public abstract class ClassLoader {
  ...
  // Composition
  private final ClassLoader parent;
  protected ClassLoader(ClassLoader parent) {
       this(checkCreateClassLoader(), parent);
  }
  ...
}
```

Trong OOP có một design principle rất kinh điển: **Prefer composition over inheritance — use more composition, less inheritance.**

### Execution flow của Parent Delegation Model

Code triển khai Parent Delegation Model rất đơn giản, logic rất rõ ràng — tập trung trong method `loadClass()` của `java.lang.ClassLoader`. Code liên quan như sau:

```java
protected Class<?> loadClass(String name, boolean resolve)
    throws ClassNotFoundException
{
    synchronized (getClassLoadingLock(name)) {
        // Trước tiên kiểm tra xem class đã được load chưa
        Class c = findLoadedClass(name);
        if (c == null) {
            // Nếu c là null, class chưa được load
            long t0 = System.nanoTime();
            try {
                if (parent != null) {
                    // Nếu parent class loader không null, dùng loadClass của parent để load class
                    c = parent.loadClass(name, false);
                } else {
                    // Nếu parent class loader null, gọi bootstrap class loader để load
                    c = findBootstrapClassOrNull(name);
                }
            } catch (ClassNotFoundException e) {
                // Non-null parent class loader không tìm thấy class tương ứng, throw exception
            }

            if (c == null) {
                // Khi parent class loader không thể load, gọi method findClass để load
                // User có thể override method này để custom class loader
                long t1 = System.nanoTime();
                c = findClass(name);

                // Dùng để thống kê thông tin liên quan đến class loader
                sun.misc.PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                sun.misc.PerfCounter.getFindClasses().increment();
            }
        }
        if (resolve) {
            // Link operation trên class
            resolveClass(c);
        }
        return c;
    }
}
```

Mỗi khi class loader nhận request load, nó sẽ trước tiên forward request đến parent class loader. Chỉ khi parent class loader không tìm thấy class được request, class loader đó mới tự cố load.

Kết hợp source code trên, tóm tắt ngắn gọn execution flow của Parent Delegation Model:

- Khi load class, hệ thống trước tiên xem class hiện tại đã được load chưa. Class đã load trả về trực tiếp, ngược lại mới cố load (mỗi parent class loader đều đi qua flow này).
- Khi class loader load class, nó không tự cố load class trước mà ủy thác request đó cho parent class loader (gọi method `loadClass()` của parent loader để load class). Như vậy tất cả request cuối cùng đều được chuyển đến `BootstrapClassLoader` ở tầng cao nhất.
- Chỉ khi parent loader phản hồi rằng mình không thể hoàn thành request load này (không tìm thấy class cần thiết trong search range của nó), child loader mới tự cố load (gọi method `findClass()` của chính nó để load class).
- Nếu child class loader cũng không thể load class này, nó sẽ throw `ClassNotFoundException`.

🌈 Mở rộng thêm:

**Quy tắc cụ thể JVM xác định hai Java class có giống nhau không**: JVM không chỉ xem fully qualified name có giống nhau không mà còn xem class loader load class đó có giống nhau không. Chỉ khi cả hai đều giống nhau mới coi hai class là giống nhau. Dù hai class đến từ cùng file `.class`, được load bởi cùng virtual machine, chỉ cần class loader load chúng khác nhau thì hai class đó nhất định khác nhau.

### Lợi ích của Parent Delegation Model

Parent Delegation Model là phần quan trọng của Java class loading mechanism. Nó thực hiện hai mục tiêu bảo mật quan trọng thông qua cơ chế ưu tiên ủy thác parent loader load class: tránh class bị load trùng lặp và ngăn core API bị giả mạo.

JVM phân biệt các class khác nhau dựa trên tên class cộng với class loader load class đó. Dù cùng tên class, nếu được load bởi class loader khác nhau cũng được coi là class khác nhau. Parent Delegation Model đảm bảo core class luôn được load bởi `BootstrapClassLoader`, đảm bảo tính duy nhất của core class.

Ví dụ: JVM sẽ ưu tiên giao request load core class như `java.lang.Object` cho `BootstrapClassLoader` xử lý. Nhưng thực tế, `ClassLoader#preDefineClass` còn validate tên class ở giai đoạn define — bất kỳ tên class nào bắt đầu bằng `java.` đều bị từ chối, nên không thể dùng custom loader để fake core class.

Nhiều bạn sẽ nói: "Vậy nếu tôi bypass Parent Delegation Model thì sao?"

Tuy nhiên, dù attacker bypass được Parent Delegation Model, Java vẫn có cơ chế bảo mật tầng dưới hơn để bảo vệ core class library. Method `preDefineClass` của `ClassLoader` validate tên class trước khi define class. Bất kỳ tên class nào bắt đầu bằng `"java."` đều trigger `SecurityException`, ngăn malicious code define hoặc load fake core class.

Source code của `ClassLoader#preDefineClass` trong JDK 8 như sau:

```java
private ProtectionDomain preDefineClass(String name,
                                            ProtectionDomain pd)
    {
        // Kiểm tra tên class có hợp lệ không
        if (!checkName(name)) {
            throw new NoClassDefFoundError("IllegalName: " + name);
        }

        // Ngăn define class trong package "java.*".
        // Check này quan trọng về bảo mật vì ngăn malicious code thay thế core Java class.
        // JDK 9 tăng cường bảo mật của preDefineClass bằng platform class loader
        if ((name != null) && name.startsWith("java.")) {
            throw new SecurityException
                ("Prohibited package name: " +
                 name.substring(0, name.lastIndexOf('.')));
        }

         // Nếu không chỉ định ProtectionDomain, dùng default domain.
        if (pd == null) {
            pd = defaultDomain;
        }

        if (name != null) {
            checkCerts(name, pd.getCodeSource());
        }

        return pd;
    }
```

Trong JDK 9 phần logic này có thay đổi — thêm Platform class loader (lấy qua method `getPlatformClassLoader()`), tăng cường bảo mật của method `preDefineClass`. Không paste source code ở đây, bạn có thể tự xem nếu quan tâm.

### Cách phá vỡ Parent Delegation Model

~~Để tránh cơ chế parent delegation, ta có thể tự define một class loader, rồi override `loadClass()` là xong.~~

**🐛 Đính chính (xem: [issue871](https://github.com/Snailclimb/JavaGuide/issues/871))**: Để custom loader cần kế thừa `ClassLoader`. Nếu không muốn phá vỡ Parent Delegation Model, chỉ cần override method `findClass()` trong class `ClassLoader`. Class không thể được parent class loader load cuối cùng sẽ được load qua method này. Nhưng nếu muốn phá vỡ Parent Delegation Model thì cần override method `loadClass()`.

Tại sao override method `loadClass()` mới phá vỡ Parent Delegation Model? Execution flow của Parent Delegation Model đã giải thích:

> Class loader khi load class, không tự cố load class trước mà ủy thác request đó cho parent class loader (gọi method `loadClass()` của parent loader để load class).

Sau khi override method `loadClass()`, có thể thay đổi execution flow truyền thống của Parent Delegation Model. Ví dụ child class loader có thể trước tiên tự cố load class trước khi ủy thác cho parent class loader, hoặc sau khi parent class loader trả về, thử load từ nơi khác. Quy tắc cụ thể do chúng ta tự triển khai, tùy chỉnh theo yêu cầu project.

Tomcat server mà chúng ta khá quen thuộc đã custom class loader `WebAppClassLoader` để phá vỡ parent delegation mechanism — nhằm ưu tiên load class dưới thư mục Web application, sau đó mới load class ở thư mục khác. Đây cũng là nguyên lý cụ thể để cách ly class giữa các Web application trong Tomcat.

Cấu trúc phân cấp class loader của Tomcat như sau:

![Cấu trúc phân cấp class loader của Tomcat](https://oss.javaguide.cn/github/javaguide/java/jvm/tomcat-class-loader-parents-delegation-model.png)

Bốn custom class loader của Tomcat tương ứng với các thư mục:

- `CommonClassLoader` tương ứng `<Tomcat>/common/*`
- `CatalinaClassLoader` tương ứng `<Tomcat>/server/*`
- `SharedClassLoader` tương ứng `<Tomcat>/shared/*`
- `WebAppClassloader` tương ứng `<Tomcat>/webapps/<app>/WEB-INF/*`

Từ quan hệ delegation trong hình có thể thấy:

- `CommonClassLoader` là parent loader của `CatalinaClassLoader` và `SharedClassLoader`. Class mà `CommonClassLoader` có thể load đều có thể được `CatalinaClassLoader` và `SharedClassLoader` dùng. Do đó `CommonClassLoader` là để triển khai sharing và isolation của common class library (class library có thể được tất cả Web application và Tomcat internal component dùng).
- Class mà `CatalinaClassLoader` và `SharedClassLoader` load độc lập và cách ly nhau. `CatalinaClassLoader` dùng để load class của Tomcat bản thân — để cách ly class của Tomcat với class của Web application. `SharedClassLoader` là parent loader của `WebAppClassLoader`, chuyên load class được chia sẻ giữa các Web application. Nhưng trong cấu hình mặc định của Tomcat, giá trị `shared.loader=` trong file config `catalina.properties` là empty nên `SharedClassLoader` không có hiệu lực. `SharedClassLoader` thực chất sẽ degrade thành `CommonClassLoader`. `SharedClassLoader` phù hợp hơn để load class library được chia sẻ giữa nhiều web application, như monitoring, logging cấp toàn công ty.
- Mỗi Web application đều tạo riêng một `WebAppClassLoader`, và trong thread khởi động Web application đặt thread context class loader thành `WebAppClassLoader`. Các instance `WebAppClassLoader` khác nhau cách ly nhau — từ đó triển khai class isolation giữa các Web application.

Chỉ dựa vào custom class loader không thể đáp ứng yêu cầu của một số tình huống. Ví dụ trong một số trường hợp, high-level class loader cần load class chỉ có thể được low-level loader load.

Ví dụ trong SPI, interface SPI (như `java.sql.Driver`) được cung cấp bởi Java core library và được load bởi `BootstrapClassLoader`. Còn implementation của SPI (như `com.mysql.cj.jdbc.Driver`) được cung cấp bởi third-party vendor — được load bởi application class loader hoặc custom class loader. Mặc định, một class và class dependency được load bởi cùng class loader. Nên class loader load SPI interface (`BootstrapClassLoader`) cũng sẽ dùng để load SPI implementation. Theo Parent Delegation Model, `BootstrapClassLoader` không thể tìm thấy SPI implementation class vì nó không thể ủy thác cho child class loader để cố load.

Lưu ý: JDK 9+ giới thiệu modularization. JDBC API được tách vào module `java.sql`, không còn được `BootstrapClassLoader` load trực tiếp nữa mà là `PlatformClassLoader`.

```java
public class ClassLoaderTest {
    public static void main(String[] args) throws ClassNotFoundException {
        Class<?> clazz = Class.forName("java.sql.Driver");
        ClassLoader loader = clazz.getClassLoader();
        System.out.println("Loader for java.sql.Driver: " + loader);

        // Trên môi trường .jdks/corretto-1.8.0_442/bin/java: Loader for java.sql.Driver: null

        // Trên môi trường .jdks/jbr-17.0.12/bin/java: Loader for java.sql.Driver: jdk.internal.loader.ClassLoaders$PlatformClassLoader@30f39991
    }
}
```

Ví dụ khác: Giả sử project có Spring jar package. Vì được chia sẻ giữa các Web application, sẽ được load bởi `SharedClassLoader` (Web server là Tomcat). Project có một số business class dùng Spring như implement interface Spring cung cấp, dùng annotation Spring cung cấp. Nên class loader load Spring (`SharedClassLoader`) cũng sẽ dùng để load các business class này. Nhưng business class nằm dưới thư mục Web application, không nằm trong load path của `SharedClassLoader`, nên `SharedClassLoader` không tìm thấy business class và không thể load chúng.

Làm thế nào giải quyết vấn đề này? Lúc này cần dùng đến **Thread Context Class Loader (`ThreadContextClassLoader`)**.

Lấy ví dụ Spring: Khi Spring cần load business class, nó không dùng class loader của chính mình mà dùng thread context class loader của thread hiện tại. Như đã nói ở trên, mỗi Web application đều tạo riêng một `WebAppClassLoader`, và trong thread khởi động Web application đặt thread context class loader thành `WebAppClassLoader`. Như vậy high-level class loader (`SharedClassLoader`) có thể nhờ child class loader (`WebAppClassLoader`) để load business class — phá vỡ Java class loading delegation mechanism, cho phép application dùng class loader ngược chiều.

Nguyên lý của thread context class loader là lưu class loader trong thread private data, bind với thread. Khi cần lấy ra dùng. Class loader này thường được set bởi application hoặc container (như Tomcat).

`getContextClassLoader()` và `setContextClassLoader(ClassLoader cl)` trong `Java.lang.Thread` lần lượt dùng để lấy và đặt thread context class loader. Nếu không đặt qua `setContextClassLoader(ClassLoader cl)`, thread sẽ kế thừa thread context class loader của parent thread.

Code Spring lấy thread context class loader:

```java
cl = Thread.currentThread().getContextClassLoader();
```

Bạn có thể tự tìm hiểu sâu hơn về nguyên lý Tomcat phá vỡ Parent Delegation Model. Tài liệu khuyến nghị: [《Deep Dive Tomcat & Jetty》](http://gk.link/a/10Egr).

## Đọc thêm

- 《Deep Understanding Java Virtual Machine》
- Phân tích sâu nguyên lý Java ClassLoader: <https://blog.csdn.net/xyang81/article/details/7292380>
- Java ClassLoader: <http://gityuan.com/2016/01/24/java-classloader/>
- Class Loaders in Java: <https://www.baeldung.com/java-classloaders>
- Class ClassLoader - Oracle official docs: <https://docs.oracle.com/javase/8/docs/api/java/lang/ClassLoader.html>
- Old and difficult Java ClassLoader — understand it before you get old: <https://zhuanlan.zhihu.com/p/51374915>
