---
title: Giải Thích Chi Tiết Cơ Chế Phản Ánh Java
description: Giải thích sâu về cơ chế phản ánh Java và ứng dụng nắm vững các API cốt lõi Class, Method, Field, hiểu được ứng dụng phản ánh trong các framework như Spring, MyBatis, học cách triển khai proxy động.
category: Java
tag:
  - Java Cơ Bản
head:
  - - meta
    - name: keywords
      content: phản ánh Java, cơ chế phản ánh, lớp Class, phương thức Method, trường Field, proxy động, nguyên lý framework, hoạt động lúc chạy
---

## Phản Ánh Là Gì?

Nếu bạn đã nghiên cứu các nguyên lý cơ bản của framework hoặc tự viết framework, chắc chắn không lạ gì với khái niệm phản ánh.

Phản ánh được gọi là linh hồn của framework, chủ yếu vì nó cung cấp cho chúng tôi khả năng phân tích lớp và thực thi các phương thức của lớp tại thời gian chạy.

Thông qua phản ánh, bạn có thể lấy được tất cả các thuộc tính và phương thức của bất kỳ lớp nào, bạn cũng có thể gọi các phương thức và thuộc tính này.

## Bạn Hiểu Rõ Các Tình Huống Ứng Dụng Của Phản Ánh Không?

Hầu hết thời gian chúng tôi viết mã kinh doanh, rất ít khi tiếp xúc với các tình huống sử dụng trực tiếp cơ chế phản ánh.

Tuy nhiên, điều này không có nghĩa là phản ánh không có ích. Trái lại, chính vì phản ánh, bạn mới có thể sử dụng các framework khác nhau một cách dễ dàng. Các framework như Spring/Spring Boot, MyBatis, v.v. đều sử dụng cơ chế phản ánh rộng rãi.

**Các framework này cũng sử dụng rộng rãi proxy động, và cách triển khai proxy động cũng phụ thuộc vào phản ánh.**

Ví dụ, đây là ví dụ mã triển khai proxy động thông qua JDK, nó sử dụng lớp phản ánh `Method` để gọi phương thức được chỉ định.

```java
public class DebugInvocationHandler implements InvocationHandler {
    /**
     * Đối tượng thực tế trong lớp proxy
     */
    private final Object target;

    public DebugInvocationHandler(Object target) {
        this.target = target;
    }


    public Object invoke(Object proxy, Method method, Object[] args) throws InvocationTargetException, IllegalAccessException {
        System.out.println("before method " + method.getName());
        Object result = method.invoke(target, args);
        System.out.println("after method " + method.getName());
        return result;
    }
}

```

Ngoài ra, **chú thích** - một công cụ lớn của Java cũng sử dụng phản ánh để triển khai.

Tại sao khi bạn sử dụng Spring, một chú thích `@Component` chỉ khai báo một lớp là Spring Bean? Tại sao bạn có thể đọc giá trị trong tệp cấu hình thông qua chú thích `@Value`? Nó hoạt động như thế nào?

Tất cả đều là vì bạn có thể phân tích lớp dựa trên phản ánh, sau đó lấy được chú thích trên lớp/thuộc tính/phương thức/tham số của phương thức. Sau khi nhận được chú thích, bạn có thể thực hiện xử lý tiếp theo.

## Thảo Luận Về Ưu Điểm Và Nhược Điểm Của Cơ Chế Phản Ánh

**Ưu Điểm**: Có thể làm cho mã của chúng tôi linh hoạt hơn, cung cấp tính năng sẵn sàng sử dụng cho các framework khác nhau

**Nhược Điểm**: Cung cấp cho chúng tôi khả năng phân tích và thao tác các lớp tại thời gian chạy, điều này cũng tăng vấn đề bảo mật. Ví dụ, bạn có thể bỏ qua kiểm tra an toàn của tham số kiểu dữ liệu chung (kiểm tra an toàn tham số kiểu dữ liệu chung xảy ra tại thời gian biên dịch). Ngoài ra, hiệu năng của phản ánh cũng tương đối yếu hơn, tuy nhiên, đối với framework, ảnh hưởng là không đáng kể. Bài đọc liên quan: [Java Reflection: Why is it so slow?](https://stackoverflow.com/questions/1392351/java-reflection-why-is-it-so-slow)

## Thực Hành Phản Ánh

### Bốn Cách Để Lấy Đối Tượng Class

Nếu chúng tôi cần lấy động các thông tin này, chúng tôi cần dựa vào đối tượng Class. Đối tượng Class sẽ cho biết chương trình đang chạy các phương thức, biến, v.v. của một lớp. Java cung cấp bốn cách để lấy đối tượng Class:

**1. Khi Bạn Biết Lớp Cụ Thể, Bạn Có Thể Sử Dụng:**

```java
Class alunbarClass = TargetObject.class;
```

Nhưng thông thường chúng tôi không biết lớp cụ thể, về cơ bản chúng tôi lấy đối tượng Class bằng cách duyệt qua các lớp dưới một gói, thông qua cách này để lấy đối tượng Class sẽ không thực hiện khởi tạo

**2. Thông Qua `Class.forName()` Truyền Vào Đường Dẫn Đầy Đủ Của Lớp:**

```java
Class alunbarClass1 = Class.forName("cn.javaguide.TargetObject");
```

**3. Thông Qua Phiên Bản Đối Tượng `instance.getClass()` Lấy:**

```java
TargetObject o = new TargetObject();
Class alunbarClass2 = o.getClass();
```

**4. Thông Qua Classloader `xxxClassLoader.loadClass()` Truyền Vào Đường Dẫn Lớp Lấy:**

```java
ClassLoader.getSystemClassLoader().loadClass("cn.javaguide.TargetObject");
```

Lấy đối tượng Class thông qua classloader sẽ không thực hiện khởi tạo, có nghĩa là không thực hiện một loạt bước bao gồm khởi tạo, mã khối tĩnh và đối tượng tĩnh sẽ không được thực thi

### Một Số Hoạt Động Cơ Bản Của Phản Ánh

1. Tạo một lớp `TargetObject` mà chúng tôi sẽ sử dụng phản ánh để hoạt động.

```java
package cn.javaguide;

public class TargetObject {
    private String value;

    public TargetObject() {
        value = "JavaGuide";
    }

    public void publicMethod(String s) {
        System.out.println("I love " + s);
    }

    private void privateMethod() {
        System.out.println("value is " + value);
    }
}
```

2. Sử dụng phản ánh để hoạt động trên phương thức và thuộc tính của lớp này

```java
package cn.javaguide;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class Main {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchMethodException, IllegalAccessException, InstantiationException, InvocationTargetException, NoSuchFieldException {
        /**
         * Lấy đối tượng Class của lớp TargetObject và tạo một phiên bản TargetObject
         */
        Class<?> targetClass = Class.forName("cn.javaguide.TargetObject");
        TargetObject targetObject = (TargetObject) targetClass.newInstance();
        /**
         * Lấy tất cả các phương thức được định nghĩa trong lớp TargetObject
         */
        Method[] methods = targetClass.getDeclaredMethods();
        for (Method method : methods) {
            System.out.println(method.getName());
        }

        /**
         * Lấy một phương thức cụ thể và gọi nó
         */
        Method publicMethod = targetClass.getDeclaredMethod("publicMethod",
                String.class);

        publicMethod.invoke(targetObject, "JavaGuide");

        /**
         * Lấy một tham số cụ thể và sửa đổi giá trị của tham số
         */
        Field field = targetClass.getDeclaredField("value");
        // Để sửa đổi các tham số trong lớp, chúng tôi hủy kiểm tra bảo mật
        field.setAccessible(true);
        field.set(targetObject, "JavaGuide");

        /**
         * Gọi một phương thức private
         */
        Method privateMethod = targetClass.getDeclaredMethod("privateMethod");
        // Để gọi một phương thức private, chúng tôi hủy kiểm tra bảo mật
        privateMethod.setAccessible(true);
        privateMethod.invoke(targetObject);
    }
}

```

Đầu ra:

```plain
publicMethod
privateMethod
I love JavaGuide
value is JavaGuide
```

**Lưu Ý**: Có người đề cập rằng chạy mã trên sẽ ném ngoại lệ `ClassNotFoundException`, lý do cụ thể là bạn không thay thế tên gói của mã này bằng `TargetObject` mà bạn tạo.
Bạn có thể tham khảo bài viết: <https://www.cnblogs.com/chanshuyi/p/head_first_of_reflection.html>

```java
Class<?> targetClass = Class.forName("cn.javaguide.TargetObject");
```
