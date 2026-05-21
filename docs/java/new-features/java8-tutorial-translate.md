---
title: Hướng dẫn Java 8 - Bản dịch tiếng Việt
description: Dịch và tổng hợp hướng dẫn Java 8, bao gồm Lambda, Method References, Default Interface Methods, Stream và các tính năng mới khác kèm code ví dụ.
category: Java
tag:
  - Java Tính năng mới
head:
  - - meta
    - name: keywords
      content: Java 8,指南,Lambda,方法引用,默认方法,Stream API,函数式接口,Date/Time API
---

# Hướng dẫn Java 8

JDK 8 được phát hành vào ngày 18 tháng 3 năm 2014, đây là phiên bản LTS (Long Term Support), là một trong những phiên bản quan trọng nhất trong lịch sử Java. Tính đến thời điểm hiện tại, có năm phiên bản hỗ trợ dài hạn: JDK8, JDK11, JDK17, JDK21 và JDK 25.

JDK 8 giới thiệu nhiều tính năng mới quan trọng, bài viết này sẽ chọn và giới thiệu chi tiết một số tính năng mới quan trọng hơn:

- Lambda expressions
- Method references
- Interface default methods
- Stream API
- Functional interfaces
- Optional class
- Date/Time API
- Annotation enhancements

Hình dưới là số lượng tính năng mới và thời gian cập nhật của từng phiên bản từ JDK 8 đến JDK 24:

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

Khi Java 8 ngày càng phổ biến, nhiều người đề cập rằng Java 8 cũng là một điểm kiến thức rất thường được hỏi trong phỏng vấn. Đáp ứng yêu cầu của mọi người, tôi định tổng hợp phần kiến thức này. Ban đầu định tự tổng hợp, nhưng sau đó thấy có một repository liên quan trên GitHub, địa chỉ:
[https://github.com/winterbe/java8-tutorial](https://github.com/winterbe/java8-tutorial). Repository này bằng tiếng Anh, tôi đã dịch ra và thêm, sửa đổi một số nội dung, dưới đây là nội dung chính.

---

Chào mừng bạn đọc bài giới thiệu về Java 8 của tôi. Hướng dẫn này sẽ từng bước hướng dẫn bạn qua tất cả các tính năng ngôn ngữ mới. Dựa trên các ví dụ code ngắn, bạn sẽ học cách sử dụng default interface method, lambda expression, method reference và repeatable annotation. Ở cuối bài, bạn sẽ quen thuộc với các thay đổi API mới nhất như stream, functional interface, mở rộng của Map và Date API mới. Không có đoạn văn dài nhàm chán, chỉ có các đoạn code có chú thích.

## Interface Default Methods (Phương thức mặc định của Interface)

Java 8 cho phép chúng ta thêm triển khai phương thức không trừu tượng vào interface bằng từ khóa `default`. Tính năng này còn được gọi là [virtual extension method](http://stackoverflow.com/a/24102730).

Ví dụ đầu tiên:

```java
interface Formula{

    double calculate(int a);

    default double sqrt(int a) {
        return Math.sqrt(a);
    }

}
```

Interface Formula ngoài phương thức trừu tượng để tính công thức còn định nghĩa phương thức mặc định `sqrt`. Class triển khai interface này chỉ cần triển khai phương thức trừu tượng `calculate`. Phương thức mặc định `sqrt` có thể được sử dụng trực tiếp. Tất nhiên bạn cũng có thể trực tiếp tạo đối tượng qua interface, sau đó triển khai phương thức mặc định trong interface là được, chúng ta thử qua code để xem cách này.

```java
public class Main {

  public static void main(String[] args) {
    // 通过匿名内部类方式访问接口
    Formula formula = new Formula() {
        @Override
        public double calculate(int a) {
            return sqrt(a * 100);
        }
    };

    System.out.println(formula.calculate(100));     // 100.0
    System.out.println(formula.sqrt(16));           // 4.0

  }

}
```

formula được triển khai như một anonymous object. Code này rất dễ hiểu, 6 dòng code triển khai tính toán `sqrt(a * 100)`. Trong phần tiếp theo, chúng ta sẽ thấy có một cách tốt hơn và thuận tiện hơn để triển khai single method object trong Java 8.

**Ghi chú của người dịch:** Dù là abstract class hay interface, đều có thể truy cập thông qua anonymous inner class. Không thể tạo đối tượng trực tiếp qua abstract class hoặc interface. Đối với việc truy cập interface thông qua anonymous inner class ở trên, chúng ta có thể hiểu như sau: một inner class triển khai phương thức trừu tượng trong interface và trả về một đối tượng inner class, sau đó chúng ta để tham chiếu của interface trỏ đến đối tượng này.

## Lambda Expressions (Biểu thức Lambda)

Đầu tiên hãy xem cách sắp xếp chuỗi trong Java phiên bản cũ:

```java
List<String> names = Arrays.asList("peter", "anna", "mike", "xenia");

Collections.sort(names, new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return b.compareTo(a);
    }
});
```

Chỉ cần truyền vào phương thức tĩnh `Collections.sort` một đối tượng List và một comparator để sắp xếp theo thứ tự chỉ định. Cách làm thông thường là tạo một anonymous comparator rồi truyền nó vào phương thức `sort`.

Trong Java 8 bạn không cần dùng cách anonymous object truyền thống này nữa, Java 8 cung cấp cú pháp ngắn gọn hơn, lambda expression:

```java
Collections.sort(names, (String a, String b) -> {
    return b.compareTo(a);
});
```

Có thể thấy code ngắn hơn và dễ đọc hơn, nhưng thực ra có thể viết ngắn hơn nữa:

```java
Collections.sort(names, (String a, String b) -> b.compareTo(a));
```

Đối với function body chỉ có một dòng code, bạn có thể bỏ dấu ngoặc nhọn {} và từ khóa return, nhưng bạn còn có thể viết ngắn hơn nữa:

```java
names.sort((a, b) -> b.compareTo(a));
```

Class List bản thân đã có phương thức `sort`. Và Java compiler có thể tự động suy ra kiểu tham số, nên bạn không cần viết lại kiểu nữa. Tiếp theo chúng ta xem lambda expression còn có những ứng dụng nào khác.

## Functional Interfaces (Interface hàm)

**Ghi chú của người dịch:** Giải thích phần này trong bài gốc không rõ ràng lắm, nên đã chỉnh sửa!

Các nhà thiết kế ngôn ngữ Java đã đầu tư nhiều công sức để suy nghĩ cách hỗ trợ Lambda một cách thân thiện trong các hàm hiện có. Cách tiếp cận cuối cùng được chọn là: thêm khái niệm functional interface. **"Functional interface" là interface chỉ chứa một phương thức trừu tượng duy nhất, nhưng có thể có nhiều phương thức không trừu tượng (tức là default method đề cập ở trên).** Interface như vậy có thể được chuyển đổi ngầm thành lambda expression. `java.lang.Runnable` và `java.util.concurrent.Callable` là hai ví dụ điển hình nhất của functional interface. Java 8 thêm một annotation đặc biệt `@FunctionalInterface`, nhưng annotation này thường không bắt buộc (được khuyến nghị sử dụng trong một số trường hợp), chỉ cần interface chỉ chứa một phương thức trừu tượng, máy ảo sẽ tự động xác định interface đó là functional interface. Thường khuyến nghị dùng annotation `@FunctionalInterface` trên interface để khai báo, như vậy nếu compiler phát hiện interface có annotation này mà có nhiều hơn một phương thức trừu tượng sẽ báo lỗi, như hình dưới:

![@FunctionalInterface 注解](https://oss.javaguide.cn/github/javaguide/java/@FunctionalInterface.png)

Ví dụ:

```java
@FunctionalInterface
public interface Converter<F, T> {
  T convert(F from);
}
```

```java
    // TODO 将数字字符串转换为整数类型
    Converter<String, Integer> converter = (from) -> Integer.valueOf(from);
    Integer converted = converter.convert("123");
    System.out.println(converted.getClass()); //class java.lang.Integer
```

**Ghi chú của người dịch:** Hầu hết các functional interface không cần chúng ta tự viết, Java 8 đã triển khai hết cho chúng ta, các interface này đều trong package java.util.function.

## Method and Constructor References (Tham chiếu phương thức và constructor)

Code trong phần trước còn có thể biểu diễn thông qua static method reference:

```java
    Converter<String, Integer> converter = Integer::valueOf;
    Integer converted = converter.convert("123");
    System.out.println(converted.getClass());   //class java.lang.Integer
```

Java 8 cho phép bạn truyền tham chiếu của phương thức hoặc constructor thông qua từ khóa `::`. Ví dụ trên cho thấy cách tham chiếu đến static method. Nhưng chúng ta cũng có thể tham chiếu đến object method:

```java
class Something {
    String startsWith(String s) {
        return String.valueOf(s.charAt(0));
    }
}
```

```java
Something something = new Something();
Converter<String, String> converter = something::startsWith;
String converted = converter.convert("Java");
System.out.println(converted);    // "J"
```

Tiếp theo xem constructor được tham chiếu bằng từ khóa `::` như thế nào, trước tiên chúng ta định nghĩa một class đơn giản với nhiều constructor:

```java
class Person {
    String firstName;
    String lastName;

    Person() {}

    Person(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }
}
```

Tiếp theo chúng ta chỉ định một object factory interface để tạo đối tượng Person:

```java
interface PersonFactory<P extends Person> {
    P create(String firstName, String lastName);
}
```

Ở đây chúng ta sử dụng constructor reference để liên kết chúng, thay vì triển khai thủ công một factory hoàn chỉnh:

```java
PersonFactory<Person> personFactory = Person::new;
Person person = personFactory.create("Peter", "Parker");
```

Chúng ta chỉ cần dùng `Person::new` để lấy tham chiếu đến constructor của class Person, Java compiler sẽ tự động chọn constructor phù hợp dựa trên kiểu tham số của phương thức `PersonFactory.create`.

## Lambda Scopes (Phạm vi Lambda)

### Truy cập biến cục bộ

Chúng ta có thể trực tiếp truy cập biến cục bộ bên ngoài trong lambda expression:

```java
final int num = 1;
Converter<Integer, String> stringConverter =
        (from) -> String.valueOf(from + num);

stringConverter.convert(2);     // 3
```

Nhưng khác với anonymous object, biến num ở đây không cần khai báo là final, code này cũng đúng:

```java
int num = 1;
Converter<Integer, String> stringConverter =
        (from) -> String.valueOf(from + num);

stringConverter.convert(2);     // 3
```

Tuy nhiên num ở đây không được sửa đổi bởi code sau (tức là ngầm có ngữ nghĩa final), ví dụ dưới đây không thể biên dịch:

```java
int num = 1;
Converter<Integer, String> stringConverter =
        (from) -> String.valueOf(from + num);
num = 3;//在lambda表达式中试图修改num同样是不允许的。
```

### Truy cập field và biến tĩnh

So với biến cục bộ, trong lambda expression chúng ta có quyền đọc và ghi cả instance field và biến tĩnh. Hành vi này nhất quán với anonymous object.

```java
class Lambda4 {
    static int outerStaticNum;
    int outerNum;

    void testScopes() {
        Converter<Integer, String> stringConverter1 = (from) -> {
            outerNum = 23;
            return String.valueOf(from);
        };

        Converter<Integer, String> stringConverter2 = (from) -> {
            outerStaticNum = 72;
            return String.valueOf(from);
        };
    }
}
```

### Truy cập default method của interface

Còn nhớ ví dụ formula trong phần một không? Interface `Formula` định nghĩa một default method `sqrt`, phương thức này có thể được truy cập từ mỗi instance formula chứa anonymous object. Điều này không áp dụng cho lambda expression.

Không thể truy cập default method từ lambda expression, vì vậy code sau không thể biên dịch:

```java
Formula formula = (a) -> sqrt(a * 100);
```

## Built-in Functional Interfaces (Functional Interface tích hợp sẵn)

JDK 1.8 API chứa nhiều functional interface tích hợp sẵn. Một số interface này khá quen thuộc trong Java phiên bản cũ như: `Comparator` hoặc `Runnable`, những interface này đều được thêm annotation `@FunctionalInterface` để có thể dùng trong lambda expression.

Nhưng Java 8 API cũng cung cấp nhiều functional interface mới để làm cho công việc lập trình thuận tiện hơn, một số interface đến từ thư viện [Google Guava](https://code.google.com/p/guava-libraries/), dù bạn quen thuộc với chúng, vẫn nên xem cách chúng được mở rộng để sử dụng với lambda.

### Predicate

Predicate interface là interface **kiểu khẳng định** nhận một tham số và trả về giá trị boolean. Interface này bao gồm nhiều default method để kết hợp Predicate thành logic phức tạp khác (như: AND, OR, NOT):

**Ghi chú của người dịch:** Source code của Predicate interface như sau:

```java
package java.util.function;
import java.util.Objects;

@FunctionalInterface
public interface Predicate<T> {

    // 该方法是接受一个传入类型,返回一个布尔值.此方法应用于判断.
    boolean test(T t);

    //and方法与关系型运算符"&&"相似，两边都成立才返回true
    default Predicate<T> and(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) && other.test(t);
    }
    // 与关系运算符"!"相似，对判断进行取反
    default Predicate<T> negate() {
        return (t) -> !test(t);
    }
    //or方法与关系型运算符"||"相似，两边只要有一个成立就返回true
    default Predicate<T> or(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) || other.test(t);
    }
   // 该方法接收一个Object对象,返回一个Predicate类型.此方法用于判断第一个test的方法与第二个test方法相同(equal).
    static <T> Predicate<T> isEqual(Object targetRef) {
        return (null == targetRef)
                ? Objects::isNull
                : object -> targetRef.equals(object);
    }
```

Ví dụ:

```java
Predicate<String> predicate = (s) -> s.length() > 0;

predicate.test("foo");              // true
predicate.negate().test("foo");     // false

Predicate<Boolean> nonNull = Objects::nonNull;
Predicate<Boolean> isNull = Objects::isNull;

Predicate<String> isEmpty = String::isEmpty;
Predicate<String> isNotEmpty = isEmpty.negate();
```

### Function

Function interface nhận một tham số và tạo ra kết quả. Default method có thể dùng để nối nhiều function lại với nhau (compose, andThen):

**Ghi chú của người dịch:** Source code của Function interface như sau:

```java

package java.util.function;

import java.util.Objects;

@FunctionalInterface
public interface Function<T, R> {

    //将Function对象应用到输入的参数上，然后返回计算结果。
    R apply(T t);
    //将两个Function整合，并返回一个能够执行两个Function对象功能的Function对象。
    default <V> Function<V, R> compose(Function<? super V, ? extends T> before) {
        Objects.requireNonNull(before);
        return (V v) -> apply(before.apply(v));
    }
    //
    default <V> Function<T, V> andThen(Function<? super R, ? extends V> after) {
        Objects.requireNonNull(after);
        return (T t) -> after.apply(apply(t));
    }

    static <T> Function<T, T> identity() {
        return t -> t;
    }
}
```

```java
Function<String, Integer> toInteger = Integer::valueOf;
Function<String, String> backToString = toInteger.andThen(String::valueOf);
backToString.apply("123");     // "123"
```

### Supplier

Supplier interface tạo ra kết quả của kiểu generic đã cho. Khác với Function interface, Supplier interface không nhận tham số.

```java
Supplier<Person> personSupplier = Person::new;
personSupplier.get();   // new Person
```

### Consumer

Consumer interface đại diện cho thao tác thực hiện trên một tham số đầu vào duy nhất.

```java
Consumer<Person> greeter = (p) -> System.out.println("Hello, " + p.firstName);
greeter.accept(new Person("Luke", "Skywalker"));
```

### Comparator

Comparator là interface kinh điển trong Java cũ, Java 8 thêm nhiều default method trên cơ sở đó:

```java
Comparator<Person> comparator = (p1, p2) -> p1.firstName.compareTo(p2.firstName);

Person p1 = new Person("John", "Doe");
Person p2 = new Person("Alice", "Wonderland");

comparator.compare(p1, p2);             // > 0
comparator.reversed().compare(p1, p2);  // < 0
```

## Optional

Optional không phải là functional interface, mà là công cụ tiện lợi để ngăn chặn NullPointerException. Đây là một khái niệm quan trọng cho phần tiếp theo, hãy nhanh chóng hiểu cách Optional hoạt động.

Optional là một container đơn giản, giá trị của nó có thể là null hoặc không phải null. Trước Java 8, thường một hàm nên trả về đối tượng không null nhưng đôi khi lại không trả về gì, còn trong Java 8, bạn nên trả về Optional thay vì null.

Ghi chú của người dịch: Đã thêm tác dụng của mỗi phương thức trong ví dụ.

```java
//of()：为非null的值创建一个Optional
Optional<String> optional = Optional.of("bam");
// isPresent()：如果值存在返回true，否则返回false
optional.isPresent();           // true
//get()：如果Optional有值则将其返回，否则抛出NoSuchElementException
optional.get();                 // "bam"
//orElse()：如果有值则将其返回，否则返回指定的其它值
optional.orElse("fallback");    // "bam"
//ifPresent()：如果Optional实例有值则为其调用consumer，否则不做处理
optional.ifPresent((s) -> System.out.println(s.charAt(0)));     // "b"
```

Đọc thêm được khuyến nghị: [[Java8] Cách dùng Optional đúng](https://blog.kaaass.net/archives/764)

## Streams (Luồng)

`java.util.Stream` đại diện cho một chuỗi thao tác có thể thực thi một lần trên một nhóm phần tử. Các thao tác Stream chia thành intermediate operation (thao tác trung gian) hoặc terminal operation (thao tác cuối), terminal operation trả về một kết quả tính toán cụ thể, còn intermediate operation trả về Stream, như vậy bạn có thể nối nhiều thao tác lại với nhau theo thứ tự. Để tạo Stream cần chỉ định một data source, như các subclass của `java.util.Collection`, List hoặc Set, Map không hỗ trợ. Các thao tác Stream có thể thực thi tuần tự hoặc song song.

Đầu tiên xem cách dùng Stream, trước tiên tạo List dữ liệu cần dùng trong code ví dụ:

```java
List<String> stringList = new ArrayList<>();
stringList.add("ddd2");
stringList.add("aaa2");
stringList.add("bbb1");
stringList.add("aaa1");
stringList.add("bbb3");
stringList.add("ccc");
stringList.add("bbb2");
stringList.add("ddd1");
```

Java 8 mở rộng các collection class, có thể tạo Stream thông qua Collection.stream() hoặc Collection.parallelStream(). Các phần tiếp theo sẽ giải thích chi tiết các thao tác Stream thường dùng:

### Filter (Lọc)

Lọc thông qua predicate interface để lọc và chỉ giữ lại các phần tử thỏa mãn điều kiện, thao tác này thuộc **intermediate operation**, vì vậy chúng ta có thể áp dụng các thao tác Stream khác trên kết quả lọc (như forEach). forEach cần một hàm để thực thi lần lượt trên các phần tử đã lọc. forEach là **terminal operation**, vì vậy chúng ta không thể thực thi các thao tác Stream khác sau forEach.

```java
        // 测试 Filter(过滤)
        stringList
                .stream()
                .filter((s) -> s.startsWith("a"))
                .forEach(System.out::println);//aaa2 aaa1
```

forEach được thiết kế cho Lambda, giữ phong cách ngắn gọn nhất. Và bản thân Lambda expression có thể tái sử dụng, rất tiện.

### Sorted (Sắp xếp)

Sắp xếp là **intermediate operation**, trả về Stream đã được sắp xếp. **Nếu bạn không chỉ định Comparator tùy chỉnh thì sẽ dùng sắp xếp mặc định.**

```java
        // 测试 Sort (排序)
        stringList
                .stream()
                .sorted()
                .filter((s) -> s.startsWith("a"))
                .forEach(System.out::println);// aaa1 aaa2
```

Cần lưu ý là sắp xếp chỉ tạo ra một Stream đã được sắp xếp, không ảnh hưởng đến data source gốc, stringList gốc sau khi sắp xếp không bị sửa đổi:

```java
    System.out.println(stringList);// ddd2, aaa2, bbb1, aaa1, bbb3, ccc, bbb2, ddd1
```

### Map (Ánh xạ)

Intermediate operation map sẽ lần lượt chuyển đổi mỗi phần tử thành đối tượng khác theo Function interface được chỉ định.

Ví dụ dưới cho thấy việc chuyển đổi chuỗi sang chuỗi chữ hoa. Bạn cũng có thể dùng map để chuyển đổi đối tượng sang kiểu khác, kiểu Stream mà map trả về được quyết định bởi giá trị trả về của hàm bạn truyền vào map.

```java
        // 测试 Map 操作
        stringList
                .stream()
                .map(String::toUpperCase)
                .sorted((a, b) -> b.compareTo(a))
                .forEach(System.out::println);// "DDD2", "DDD1", "CCC", "BBB3", "BBB2", "BBB1", "AAA2", "AAA1"
```

### Match (Khớp)

Stream cung cấp nhiều thao tác khớp, cho phép phát hiện xem Predicate được chỉ định có khớp với toàn bộ Stream không. Tất cả thao tác khớp đều là **terminal operation** và trả về giá trị boolean.

```java
        // 测试 Match (匹配)操作
        boolean anyStartsWithA =
                stringList
                        .stream()
                        .anyMatch((s) -> s.startsWith("a"));
        System.out.println(anyStartsWithA);      // true

        boolean allStartsWithA =
                stringList
                        .stream()
                        .allMatch((s) -> s.startsWith("a"));

        System.out.println(allStartsWithA);      // false

        boolean noneStartsWithZ =
                stringList
                        .stream()
                        .noneMatch((s) -> s.startsWith("z"));

        System.out.println(noneStartsWithZ);      // true
```

### Count (Đếm)

Đếm là **terminal operation**, trả về số lượng phần tử trong Stream, **kiểu trả về là long**.

```java
      //测试 Count (计数)操作
        long startsWithB =
                stringList
                        .stream()
                        .filter((s) -> s.startsWith("b"))
                        .count();
        System.out.println(startsWithB);    // 3
```

### Reduce (Rút gọn)

Đây là **terminal operation**, cho phép rút gọn nhiều phần tử trong stream thành một phần tử thông qua hàm được chỉ định, kết quả sau khi rút gọn được biểu diễn thông qua interface Optional:

```java
        //测试 Reduce (规约)操作
        Optional<String> reduced =
                stringList
                        .stream()
                        .sorted()
                        .reduce((s1, s2) -> s1 + "#" + s2);

        reduced.ifPresent(System.out::println);//aaa1#aaa2#bbb1#bbb2#bbb3#ccc#ddd1#ddd2
```

**Ghi chú của người dịch:** Tác dụng chính của phương thức này là ghép các phần tử Stream lại với nhau. Nó cung cấp một giá trị khởi đầu (seed), sau đó theo quy tắc tính toán (BinaryOperator), kết hợp với phần tử thứ nhất, thứ hai, thứ n của Stream trước đó. Theo nghĩa này, ghép chuỗi, sum số, min, max, average đều là reduce đặc biệt. Ví dụ sum của Stream tương đương với `Integer sum = integers.reduce(0, (a, b) -> a+b);` Cũng có trường hợp không có giá trị khởi đầu, lúc đó sẽ kết hợp hai phần tử đầu của Stream, trả về Optional.

```java
// 字符串连接，concat = "ABCD"
String concat = Stream.of("A", "B", "C", "D").reduce("", String::concat);
// 求最小值，minValue = -3.0
double minValue = Stream.of(-1.5, 1.0, -3.0, -2.0).reduce(Double.MAX_VALUE, Double::min);
// 求和，sumValue = 10, 有起始值
int sumValue = Stream.of(1, 2, 3, 4).reduce(0, Integer::sum);
// 求和，sumValue = 10, 无起始值
sumValue = Stream.of(1, 2, 3, 4).reduce(Integer::sum).get();
// 过滤，字符串连接，concat = "ace"
concat = Stream.of("a", "B", "c", "D", "e", "F").
 filter(x -> x.compareTo("Z") > 0).
 reduce("", String::concat);
```

Ví dụ như reduce() đầu tiên ở trên, tham số đầu tiên (ký tự trắng) là giá trị khởi đầu, tham số thứ hai (String::concat) là BinaryOperator. Loại reduce() có giá trị khởi đầu này đều trả về đối tượng cụ thể. Còn đối với reduce() không có giá trị khởi đầu ở ví dụ thứ tư, vì có thể không đủ phần tử, trả về Optional, xin chú ý sự khác biệt này. Xem thêm: [IBM: Giải thích chi tiết Streams API trong Java 8](https://www.ibm.com/developerworks/cn/java/j-lo-java8streamapi/index.html)

## Parallel Streams (Luồng song song)

Đề cập trước đó Stream có hai loại tuần tự và song song, các thao tác trên Stream tuần tự được hoàn thành theo thứ tự trong một thread, còn Parallel Stream được thực thi đồng thời trên nhiều thread.

Ví dụ dưới cho thấy cách nâng cao hiệu suất thông qua Parallel Stream:

Trước tiên chúng ta tạo một bảng lớn không có phần tử trùng lặp:

```java
int max = 1000000;
List<String> values = new ArrayList<>(max);
for (int i = 0; i < max; i++) {
    UUID uuid = UUID.randomUUID();
    values.add(uuid.toString());
}
```

Chúng ta sắp xếp bằng cả hai cách tuần tự và song song, cuối cùng xem so sánh thời gian sử dụng.

### Sequential Sort (Sắp xếp tuần tự)

```java
//串行排序
long t0 = System.nanoTime();
long count = Arrays.stream(list.stream().sorted().toArray()).count();
System.out.println(count);

long t1 = System.nanoTime();

long millis = TimeUnit.NANOSECONDS.toMillis(t1 - t0);
System.out.println(String.format("sequential sort took: %d ms", millis));
```

```plain
1000000
sequential sort took: 709 ms//串行排序所用的时间
```

### Parallel Sort (Sắp xếp song song)

```java
//并行排序
long t0 = System.nanoTime();

long count = Arrays.stream(list.parallelStream().sorted().toArray()).count();
System.out.println(count);

long t1 = System.nanoTime();

long millis = TimeUnit.NANOSECONDS.toMillis(t1 - t0);
System.out.println(String.format("parallel sort took: %d ms", millis));

```

```java
1000000
parallel sort took: 475 ms//并行排序所用的时间
```

Hai đoạn code trên gần như giống hệt nhau, nhưng phiên bản song song nhanh hơn khoảng 50%, thay đổi duy nhất cần làm là thay `stream()` bằng `parallelStream()`.

## Maps

Đề cập trước đó, kiểu Map không hỗ trợ streams, nhưng Map cung cấp một số phương thức mới hữu ích để xử lý một số nhiệm vụ hàng ngày. Bản thân interface Map không có phương thức `stream()` khả dụng, nhưng bạn có thể tạo stream chuyên biệt trên keys, values hoặc thông qua `map.keySet().stream()`, `map.values().stream()` và `map.entrySet().stream()`.

Ngoài ra, Maps hỗ trợ nhiều phương thức mới và hữu ích để thực hiện các nhiệm vụ thường gặp.

```java
Map<Integer, String> map = new HashMap<>();

for (int i = 0; i < 10; i++) {
    map.putIfAbsent(i, "val" + i);
}

map.forEach((id, val) -> System.out.println(val));//val0 val1 val2 val3 val4 val5 val6 val7 val8 val9
```

`putIfAbsent` ngăn chúng ta phải viết thêm code khi kiểm tra null; `forEach` nhận một consumer để thực hiện thao tác trên mỗi phần tử trong map.

Ví dụ này cho thấy cách sử dụng hàm để tính toán code trên map:

```java
map.computeIfPresent(3, (num, val) -> val + num);
map.get(3);             // val33

map.computeIfPresent(9, (num, val) -> null);
map.containsKey(9);     // false

map.computeIfAbsent(23, num -> "val" + num);
map.containsKey(23);    // true

map.computeIfAbsent(3, num -> "bam");
map.get(3);             // val33
```

Tiếp theo cho thấy cách xóa một item khớp cả key và value trong Map:

```java
map.remove(3, "val3");
map.get(3);             // val33
map.remove(3, "val33");
map.get(3);             // null
```

Một phương thức hữu ích khác:

```java
map.getOrDefault(42, "not found");  // not found
```

Việc merge các phần tử của Map cũng trở nên dễ dàng hơn:

```java
map.merge(9, "val9", (value, newValue) -> value.concat(newValue));
map.get(9);             // val9
map.merge(9, "concat", (value, newValue) -> value.concat(newValue));
map.get(9);             // val9concat
```

Merge làm việc là nếu key không tồn tại thì chèn vào, ngược lại thực hiện thao tác merge trên giá trị tương ứng với key gốc rồi chèn lại vào map.

## Date API (API Ngày tháng)

Java 8 bao gồm một API ngày giờ hoàn toàn mới trong package `java.time`. API Date mới tương tự với thư viện Joda-Time, nhưng chúng không giống nhau. Các ví dụ dưới đây bao gồm các phần quan trọng nhất của API mới này. Người dịch đã tham khảo sách liên quan và sửa đổi phần lớn nội dung phần này.

**Ghi chú của người dịch (Tổng hợp):**

- Class Clock cung cấp các phương thức truy cập ngày giờ hiện tại, Clock nhạy cảm với múi giờ, có thể dùng để thay thế `System.currentTimeMillis()` để lấy số microsecond hiện tại. Một điểm thời gian cụ thể cũng có thể được biểu diễn bằng class `Instant`, class `Instant` cũng có thể dùng để tạo đối tượng `java.util.Date` phiên bản cũ.

- Trong API mới, múi giờ được biểu diễn bằng ZoneId. Múi giờ có thể được lấy một cách thuận tiện bằng phương thức tĩnh of. Abstract class `ZoneId` (trong package `java.time`) đại diện cho một identifier vùng. Nó có một phương thức tĩnh tên là `getAvailableZoneIds`, trả về tất cả identifier vùng.

- Trong jdk1.8 đã thêm các class như LocalDate và LocalDateTime để giải quyết vấn đề xử lý ngày tháng, đồng thời giới thiệu class DateTimeFormatter mới để giải quyết vấn đề định dạng ngày tháng. Có thể dùng Instant thay thế Date, LocalDateTime thay thế Calendar, DateTimeFormatter thay thế SimpleDateFormat.

### Clock

Class Clock cung cấp các phương thức truy cập ngày giờ hiện tại, Clock nhạy cảm với múi giờ, có thể dùng để thay thế `System.currentTimeMillis()` để lấy số microsecond hiện tại. Một điểm thời gian cụ thể cũng có thể được biểu diễn bằng class `Instant`, class `Instant` cũng có thể dùng để tạo đối tượng `java.util.Date` phiên bản cũ.

```java
Clock clock = Clock.systemDefaultZone();
long millis = clock.millis();
System.out.println(millis);//1552379579043
Instant instant = clock.instant();
System.out.println(instant);
Date legacyDate = Date.from(instant); //2019-03-12T08:46:42.588Z
System.out.println(legacyDate);//Tue Mar 12 16:32:59 CST 2019
```

### Timezones (Múi giờ)

Trong API mới, múi giờ được biểu diễn bằng ZoneId. Múi giờ có thể được lấy một cách thuận tiện bằng phương thức tĩnh of. Abstract class `ZoneId` (trong package `java.time`) đại diện cho một identifier vùng. Nó có một phương thức tĩnh tên là `getAvailableZoneIds`, trả về tất cả identifier vùng.

```java
//输出所有区域标识符
System.out.println(ZoneId.getAvailableZoneIds());

ZoneId zone1 = ZoneId.of("Europe/Berlin");
ZoneId zone2 = ZoneId.of("Brazil/East");
System.out.println(zone1.getRules());// ZoneRules[currentStandardOffset=+01:00]
System.out.println(zone2.getRules());// ZoneRules[currentStandardOffset=-03:00]
```

### LocalTime (Giờ địa phương)

LocalTime định nghĩa một thời gian không có thông tin múi giờ, ví dụ 10 giờ tối hoặc 17:30:15. Ví dụ dưới tạo hai giờ địa phương sử dụng múi giờ đã tạo trong code trước. Sau đó so sánh thời gian và tính chênh lệch thời gian giữa hai thời điểm theo giờ và phút:

```java
LocalTime now1 = LocalTime.now(zone1);
LocalTime now2 = LocalTime.now(zone2);
System.out.println(now1.isBefore(now2));  // false

long hoursBetween = ChronoUnit.HOURS.between(now1, now2);
long minutesBetween = ChronoUnit.MINUTES.between(now1, now2);

System.out.println(hoursBetween);       // -3
System.out.println(minutesBetween);     // -239
```

LocalTime cung cấp nhiều factory method để đơn giản hóa việc tạo đối tượng, bao gồm phân tích chuỗi thời gian.

```java
LocalTime late = LocalTime.of(23, 59, 59);
System.out.println(late);       // 23:59:59
DateTimeFormatter germanFormatter =
    DateTimeFormatter
        .ofLocalizedTime(FormatStyle.SHORT)
        .withLocale(Locale.GERMAN);

LocalTime leetTime = LocalTime.parse("13:37", germanFormatter);
System.out.println(leetTime);   // 13:37
```

### LocalDate (Ngày địa phương)

LocalDate biểu diễn một ngày cụ thể, ví dụ 2014-03-11. Giá trị đối tượng này là không thể thay đổi, dùng cơ bản giống với LocalTime. Ví dụ dưới cho thấy cách cộng trừ ngày/tháng/năm cho đối tượng Date. Ngoài ra cần lưu ý là những đối tượng này là không thể thay đổi, thao tác luôn trả về một instance mới.

```java
LocalDate today = LocalDate.now();//获取现在的日期
System.out.println("今天的日期: "+today);//2019-03-12
LocalDate tomorrow = today.plus(1, ChronoUnit.DAYS);
System.out.println("明天的日期: "+tomorrow);//2019-03-13
LocalDate yesterday = tomorrow.minusDays(2);
System.out.println("昨天的日期: "+yesterday);//2019-03-11
LocalDate independenceDay = LocalDate.of(2019, Month.MARCH, 12);
DayOfWeek dayOfWeek = independenceDay.getDayOfWeek();
System.out.println("今天是周几:"+dayOfWeek);//TUESDAY
```

Phân tích kiểu LocalDate từ chuỗi đơn giản như phân tích LocalTime, dưới đây là ví dụ dùng `DateTimeFormatter` để phân tích chuỗi:

```java
    String str1 = "2014==04==12 01时06分09秒";
        // 根据需要解析的日期、时间字符串定义解析所用的格式器
        DateTimeFormatter fomatter1 = DateTimeFormatter
                .ofPattern("yyyy==MM==dd HH时mm分ss秒");

        LocalDateTime dt1 = LocalDateTime.parse(str1, fomatter1);
        System.out.println(dt1); // 输出 2014-04-12T01:06:09

        String str2 = "2014$$$四月$$$13 20小时";
        DateTimeFormatter fomatter2 = DateTimeFormatter
                .ofPattern("yyy$$$MMM$$$dd HH小时");
        LocalDateTime dt2 = LocalDateTime.parse(str2, fomatter2);
        System.out.println(dt2); // 输出 2014-04-13T20:00

```

Xem thêm ví dụ định dạng ngày tháng bằng `DateTimeFormatter`:

```java
LocalDateTime rightNow=LocalDateTime.now();
String date=DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(rightNow);
System.out.println(date);//2019-03-12T16:26:48.29
DateTimeFormatter formatter=DateTimeFormatter.ofPattern("YYYY-MM-dd HH:mm:ss");
System.out.println(formatter.format(rightNow));//2019-03-12 16:26:48
```

**🐛 Sửa chính xác (xem: [issue#1157](https://github.com/Snailclimb/JavaGuide/issues/1157))**: Khi dùng `YYYY` để hiển thị năm, sẽ hiển thị năm của tuần chứa thời gian hiện tại, có vấn đề ở tuần vượt năm. Thông thường dùng `yyyy` để hiển thị năm chính xác.

Ví dụ hiển thị ngày sai do vượt năm:

```java
LocalDateTime rightNow = LocalDateTime.of(2020, 12, 31, 12, 0, 0);
String date= DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(rightNow);
// 2020-12-31T12:00:00
System.out.println(date);
DateTimeFormatter formatterOfYYYY = DateTimeFormatter.ofPattern("YYYY-MM-dd HH:mm:ss");
// 2021-12-31 12:00:00
System.out.println(formatterOfYYYY.format(rightNow));

DateTimeFormatter formatterOfYyyy = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
// 2020-12-31 12:00:00
System.out.println(formatterOfYyyy.format(rightNow));
```

Từ hình dưới có thể thấy rõ hơn lỗi cụ thể, và IDEA đã gợi ý thông minh rằng nên dùng `yyyy` thay vì `YYYY`.

![](https://oss.javaguide.cn/github/javaguide/java/new-features/2021042717491413.png)

### LocalDateTime (Ngày giờ địa phương)

LocalDateTime biểu diễn đồng thời thời gian và ngày tháng, tương đương với việc kết hợp nội dung hai phần trước vào một đối tượng. LocalDateTime cũng như LocalTime và LocalDate, đều là không thể thay đổi. LocalDateTime cung cấp một số phương thức để truy cập các field cụ thể.

```java
LocalDateTime sylvester = LocalDateTime.of(2014, Month.DECEMBER, 31, 23, 59, 59);

DayOfWeek dayOfWeek = sylvester.getDayOfWeek();
System.out.println(dayOfWeek);      // WEDNESDAY

Month month = sylvester.getMonth();
System.out.println(month);          // DECEMBER

long minuteOfDay = sylvester.getLong(ChronoField.MINUTE_OF_DAY);
System.out.println(minuteOfDay);    // 1439
```

Chỉ cần thêm thông tin múi giờ, có thể chuyển đổi thành điểm thời gian Instant, đối tượng Instant có thể dễ dàng chuyển đổi thành `java.util.Date` kiểu cũ.

```java
Instant instant = sylvester
        .atZone(ZoneId.systemDefault())
        .toInstant();

Date legacyDate = Date.from(instant);
System.out.println(legacyDate);     // Wed Dec 31 23:59:59 CET 2014
```

Định dạng LocalDateTime cũng giống như định dạng thời gian và ngày tháng, ngoài việc dùng các format định sẵn, chúng ta cũng có thể tự định nghĩa format:

```java
DateTimeFormatter formatter =
    DateTimeFormatter
        .ofPattern("MMM dd, yyyy - HH:mm");
LocalDateTime parsed = LocalDateTime.parse("Nov 03, 2014 - 07:13", formatter);
String string = formatter.format(parsed);
System.out.println(string);     // Nov 03, 2014 - 07:13
```

Khác với java.text.NumberFormat, phiên bản mới DateTimeFormatter là không thể thay đổi, vì vậy nó là thread-safe.
Thông tin chi tiết về định dạng ngày giờ ở [đây](https://docs.oracle.com/javase/8/docs/api/java/time/format/DateTimeFormatter.html).

## Annotations (Annotation)

Trong Java 8, hỗ trợ annotation lặp lại, trước tiên xem một ví dụ để hiểu ý nghĩa.
Đầu tiên định nghĩa một wrapper class Hints annotation để chứa một nhóm annotation Hint cụ thể:

```java
@Retention(RetentionPolicy.RUNTIME)
@interface Hints {
    Hint[] value();
}
@Repeatable(Hints.class)
@interface Hint {
    String value();
}
```

Java 8 cho phép chúng ta sử dụng annotation cùng kiểu nhiều lần, chỉ cần đánh dấu annotation đó bằng `@Repeatable`.

Ví dụ 1: Dùng wrapper class làm container để lưu nhiều annotation (cách cũ)

```java
@Hints({@Hint("hint1"), @Hint("hint2")})
class Person {}
```

Ví dụ 2: Dùng annotation lặp lại (cách mới)

```java
@Hint("hint1")
@Hint("hint2")
class Person {}
```

Trong ví dụ thứ hai Java compiler sẽ ngầm định nghĩa annotation @Hints cho bạn, hiểu điều này giúp bạn dùng reflection để lấy thông tin này:

```java
Hint hint = Person.class.getAnnotation(Hint.class);
System.out.println(hint);                   // null
Hints hints1 = Person.class.getAnnotation(Hints.class);
System.out.println(hints1.value().length);  // 2

Hint[] hints2 = Person.class.getAnnotationsByType(Hint.class);
System.out.println(hints2.length);          // 2
```

Dù chúng ta không định nghĩa annotation `@Hints` trên class `Person`, chúng ta vẫn có thể lấy annotation `@Hints` thông qua `getAnnotation(Hints.class)`, cách thuận tiện hơn là dùng `getAnnotationsByType` có thể trực tiếp lấy tất cả annotation `@Hint`.
Ngoài ra annotation trong Java 8 còn thêm vào hai target mới:

```java
@Target({ElementType.TYPE_PARAMETER, ElementType.TYPE_USE})
@interface MyAnnotation {}
```

## Tiếp theo đi đâu?

Các tính năng mới của Java 8 đã viết đến đây rồi, chắc chắn còn nhiều tính năng khác đang chờ khám phá. Trong JDK 1.8 còn rất nhiều thứ hữu ích như `Arrays.parallelSort`, `StampedLock` và `CompletableFuture`, v.v.

<!-- @include: @article-footer.snippet.md -->
