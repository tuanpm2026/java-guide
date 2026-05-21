---
title: Thực chiến các tính năng mới Java 8
description: Giới thiệu thực chiến các tính năng mới cốt lõi của Java 8, bao gồm Lambda, Stream, Optional, Date-Time API và các phương thức mặc định của interface.
category: Java
tag:
  - Tính năng mới Java
head:
  - - meta
    - name: keywords
      content: Java 8,Lambda,Stream API,Optional,Date/Time API,默认方法,函数式接口
---

> Bài viết này được đóng góp bởi [cowbi](https://github.com/cowbi)~

<!-- markdownlint-disable MD024 -->

JDK 8 được phát hành vào ngày 18 tháng 3 năm 2014, đây là phiên bản LTS (Long-Term Support - Hỗ trợ dài hạn), và là phiên bản JDK được sử dụng nhiều nhất trên thị trường hiện nay. Tính đến thời điểm này, đã có năm phiên bản hỗ trợ dài hạn: JDK8, JDK11, JDK17, JDK21 và JDK 25.

JDK 8 đã giới thiệu nhiều tính năng mới quan trọng. Bài viết này sẽ chọn lọc một số tính năng mới quan trọng hơn để giới thiệu chi tiết:

- Biểu thức Lambda
- Stream API
- Lớp Optional
- Date-Time API
- Phương thức mặc định của Interface
- Interface hàm (Functional Interface)

Hình dưới đây hiển thị số lượng tính năng mới được giới thiệu và thời gian cập nhật của từng phiên bản từ JDK 8 đến JDK 24:

![](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

Oracle đã phát hành Java 8 (jdk1.8) vào năm 2014, có nhiều lý do khiến nó trở thành phiên bản jdk được sử dụng nhiều nhất trên thị trường. Mặc dù đã gần 7 năm kể từ khi phát hành, nhưng nhiều lập trình viên vẫn chưa thực sự hiểu rõ các tính năng mới của nó, đặc biệt là những lập trình viên đã quen với các phiên bản trước Java 8 như tôi.

Để không bị tụt lại quá xa, chúng ta cần tổng hợp và sắp xếp lại những tính năng mới này. So với jdk 7, Java 8 có nhiều thay đổi và tối ưu, chẳng hạn như interface có thể chứa phương thức tĩnh và có thể có phần thân phương thức - điều này đã lật ngược nhận thức trước đây; `java.util.HashMap` đã thêm cây đỏ-đen vào cấu trúc dữ liệu; và biểu thức Lambda được biết đến rộng rãi, v.v. Bài viết này không thể chia sẻ tất cả các tính năng mới, chỉ liệt kê các tính năng thường dùng nhất để giải thích chi tiết. Để biết thêm nội dung liên quan, hãy xem [Giới thiệu về tính năng mới Java 8 trên trang chính thức](https://www.oracle.com/java/technologies/javase/8-whats-new.html).

## Interface

Mục đích thiết kế ban đầu của interface là hướng tới trừu tượng, nâng cao khả năng mở rộng. Điều này để lại một tiếc nuối nhỏ là khi Interface thay đổi, các lớp triển khai nó cũng phải thay đổi theo.

Để giải quyết vấn đề không tương thích giữa việc sửa đổi interface và các triển khai hiện có. Các phương thức của interface mới có thể được đánh dấu bằng `default` hoặc `static`, như vậy có thể có phần thân phương thức, và các lớp triển khai cũng không cần phải ghi đè phương thức này.

Một interface có thể có nhiều phương thức được đánh dấu bởi chúng, sự khác biệt chính giữa 2 modifier này cũng chính là sự khác biệt giữa phương thức thông thường và phương thức tĩnh.

1. Phương thức được đánh dấu bằng `default` là phương thức instance thông thường, có thể được gọi bằng `this`, có thể được kế thừa và ghi đè bởi lớp con.
2. Phương thức được đánh dấu bằng `static`, cách sử dụng giống như phương thức tĩnh của lớp thông thường. Nhưng nó không thể được kế thừa bởi lớp con, chỉ có thể được gọi thông qua `Interface`.

Hãy xem một ví dụ thực tế.

```java
public interface InterfaceNew {
    static void sm() {
        System.out.println("interface提供的方式实现");
    }
    static void sm2() {
        System.out.println("interface提供的方式实现");
    }

    default void def() {
        System.out.println("interface default方法");
    }
    default void def2() {
        System.out.println("interface default2方法");
    }
    //须要实现类重写
    void f();
}

public interface InterfaceNew1 {
    default void def() {
        System.out.println("InterfaceNew1 default方法");
    }
}
```

Nếu có một lớp vừa triển khai interface `InterfaceNew` vừa triển khai interface `InterfaceNew1`, và cả hai đều có `def()`, và giữa `InterfaceNew` và `InterfaceNew1` không có quan hệ kế thừa, thì lúc này bắt buộc phải ghi đè `def()`. Nếu không, sẽ xảy ra lỗi khi biên dịch.

```java
public class InterfaceNewImpl implements InterfaceNew , InterfaceNew1{
    public static void main(String[] args) {
        InterfaceNewImpl interfaceNew = new InterfaceNewImpl();
        interfaceNew.def();
    }

    @Override
    public void def() {
        InterfaceNew1.super.def();
    }

    @Override
    public void f() {
    }
}
```

**Trong Java 8, sự khác biệt giữa interface và abstract class là gì?**

Nhiều bạn cho rằng: "Vì interface cũng có thể có triển khai phương thức riêng, có vẻ không khác nhiều so với abstract class."

Thực ra vẫn có sự khác biệt:

1. Sự khác biệt giữa interface và class, nghe có vẻ hiển nhiên, chủ yếu gồm:

   - Interface hỗ trợ đa triển khai, class chỉ đơn kế thừa
   - Các phương thức của interface được đánh dấu bằng public abstract, biến được đánh dấu bằng public static final. Abstract class có thể sử dụng các modifier khác

2. Phương thức của interface giống như một plugin mở rộng hơn. Còn phương thức của abstract class là để kế thừa.

Như đã đề cập ở đầu, interface đã thêm các phương thức đánh dấu bằng `default` và `static` để giải quyết vấn đề không tương thích giữa việc sửa đổi interface và các triển khai hiện có, không phải để thay thế `abstract class`. Trong thực tế, những nơi cần dùng abstract class vẫn nên dùng abstract class, không nên thay thế bằng tính năng mới của interface.

**Hãy nhớ rằng interface và class luôn luôn khác nhau.**

## Functional Interface - Interface hàm

**Định nghĩa**: Còn được gọi là SAM interface, tức là Single Abstract Method interfaces - interface chỉ có một phương thức trừu tượng duy nhất, nhưng có thể có nhiều phương thức không trừu tượng.

Trong Java 8, có một package chuyên dành cho functional interface `java.util.function`, tất cả các interface trong package này đều có annotation `@FunctionalInterface`, cung cấp tính năng lập trình hàm.

Trong các package khác cũng có functional interface, một số không có annotation `@FunctionalInterface`, nhưng miễn là phù hợp với định nghĩa của functional interface thì đó là functional interface, không liên quan đến việc có annotation `@FunctionalInterface` hay không - annotation chỉ có tác dụng kiểm tra quy tắc bắt buộc trong quá trình biên dịch. Nó được sử dụng rộng rãi trong biểu thức Lambda.

## Biểu thức Lambda

Tiếp theo, hãy nói về biểu thức Lambda được biết đến rộng rãi. Đây là tính năng mới quan trọng nhất thúc đẩy việc phát hành Java 8. Là thay đổi lớn nhất kể từ Generics và Annotation.

Sử dụng biểu thức Lambda có thể làm cho code trở nên ngắn gọn và súc tích hơn. Cho phép Java hỗ trợ _lập trình hàm_ đơn giản.

> Biểu thức Lambda là một hàm ẩn danh, Java 8 cho phép truyền hàm vào phương thức dưới dạng tham số.

### Cú pháp

```java
(parameters) -> expression 或
(parameters) ->{ statements; }
```

### Lambda trong thực chiến

Hãy cùng cảm nhận sự tiện lợi mà Lambda mang lại thông qua các ví dụ thực tế

#### Thay thế lớp nội ẩn danh

Trước đây, cách duy nhất để truyền tham số động vào phương thức là sử dụng inner class. Ví dụ:

**1. Interface `Runnable`**

```java
new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("The runable now is using!");
            }
}).start();
//用lambda
new Thread(() -> System.out.println("It's a lambda function!")).start();
```

**2. Interface `Comparator`**

```java
List<Integer> strings = Arrays.asList(1, 2, 3);

Collections.sort(strings, new Comparator<Integer>() {
@Override
public int compare(Integer o1, Integer o2) {
    return o1 - o2;}
});

//Lambda
Collections.sort(strings, (Integer o1, Integer o2) -> o1 - o2);
//分解开
Comparator<Integer> comparator = (Integer o1, Integer o2) -> o1 - o2;
Collections.sort(strings, comparator);
```

**3. Interface `Listener`**

```java
JButton button = new JButton();
button.addItemListener(new ItemListener() {
@Override
public void itemStateChanged(ItemEvent e) {
   e.getItem();
}
});
//lambda
button.addItemListener(e -> e.getItem());
```

**4. Interface tự định nghĩa**

Ba ví dụ trên là những trường hợp phổ biến nhất trong quá trình phát triển, và từ đó chúng ta có thể cảm nhận được sự tiện lợi và gọn gàng mà Lambda mang lại. Nó chỉ giữ lại code thực sự cần thiết, bỏ qua tất cả code thừa. Vậy nó có yêu cầu gì với interface không? Chúng ta nhận thấy những lớp nội ẩn danh này chỉ ghi đè một phương thức của interface, và tất nhiên cũng chỉ có một phương thức cần ghi đè. Đây chính là **functional interface** mà chúng ta đã đề cập ở trên, tức là miễn là tham số của phương thức là functional interface thì đều có thể sử dụng biểu thức Lambda.

```java
@FunctionalInterface
public interface Comparator<T>{}

@FunctionalInterface
public interface Runnable{}
```

Chúng ta tự định nghĩa một functional interface

```java
@FunctionalInterface
public interface LambdaInterface {
 void f();
}
//使用
public class LambdaClass {
    public static void forEg() {
        lambdaInterfaceDemo(()-> System.out.println("自定义函数式接口"));
    }
    //函数式接口参数
    static void lambdaInterfaceDemo(LambdaInterface i){
        i.f();
    }
}
```

#### Duyệt collection

```java
void lamndaFor() {
        List<String> strings = Arrays.asList("1", "2", "3");
        //传统foreach
        for (String s : strings) {
            System.out.println(s);
        }
        //Lambda foreach
        strings.forEach((s) -> System.out.println(s));
        //or
        strings.forEach(System.out::println);
     //map
        Map<Integer, String> map = new HashMap<>();
        map.forEach((k,v)->System.out.println(v));
}
```

#### Tham chiếu phương thức

Java 8 cho phép sử dụng từ khóa `::` để truyền tham chiếu phương thức hoặc constructor, dù sao đi nữa, kiểu trả về của biểu thức phải là functional-interface.

```java
public class LambdaClassSuper {
    LambdaInterface sf(){
        return null;
    }
}

public class LambdaClass extends LambdaClassSuper {
    public static LambdaInterface staticF() {
        return null;
    }

    public LambdaInterface f() {
        return null;
    }

    void show() {
        //1.调用静态函数，返回类型必须是functional-interface
        LambdaInterface t = LambdaClass::staticF;

        //2.实例方法调用
        LambdaClass lambdaClass = new LambdaClass();
        LambdaInterface lambdaInterface = lambdaClass::f;

        //3.超类上的方法调用
        LambdaInterface superf = super::sf;

        //4. 构造方法调用
        LambdaInterface tt = LambdaClassSuper::new;
    }
}
```

#### Truy cập biến

```java
int i = 0;
Collections.sort(strings, (Integer o1, Integer o2) -> o1 - i);
//i =3;
```

Biểu thức lambda có thể tham chiếu đến biến bên ngoài, nhưng biến đó mặc định có thuộc tính final, không thể bị sửa đổi. Nếu sửa đổi, sẽ xảy ra lỗi khi biên dịch.

## Stream

Java đã thêm package `java.util.stream`, nó giống nhưng khác với stream trước đây. Trước đây chúng ta thường gặp nhất là resource stream như `java.io.FileInputStream`, thông qua stream để đưa file từ nơi này sang nơi khác, nó chỉ là công cụ vận chuyển nội dung, không thực hiện bất kỳ thao tác _CRUD_ nào trên nội dung file.

`Stream` vẫn không lưu trữ dữ liệu, điểm khác biệt là nó có thể truy vấn (Retrieve) và xử lý logic dữ liệu collection, bao gồm lọc, sắp xếp, thống kê, đếm, v.v. Có thể hiểu nó như câu lệnh SQL.

Nguồn dữ liệu của nó có thể là `Collection`, `Array`, v.v. Do tham số của các phương thức đều là kiểu functional interface, nên thường được sử dụng kết hợp với Lambda.

### Loại Stream

1. stream - luồng tuần tự
2. parallelStream - luồng song song, có thể thực thi đa luồng

### Các phương thức thường dùng

Tiếp theo hãy xem các phương thức thường dùng của `java.util.stream.Stream`

```java
/**
* 返回一个串行流
*/
default Stream<E> stream()

/**
* 返回一个并行流
*/
default Stream<E> parallelStream()

/**
* 返回T的流
*/
public static<T> Stream<T> of(T t)

/**
* 返回其元素是指定值的顺序流。
*/
public static<T> Stream<T> of(T... values) {
    return Arrays.stream(values);
}


/**
* 过滤，返回由与给定predicate匹配的该流的元素组成的流
*/
Stream<T> filter(Predicate<? super T> predicate);

/**
* 此流的所有元素是否与提供的predicate匹配。
*/
boolean allMatch(Predicate<? super T> predicate)

/**
* 此流任意元素是否有与提供的predicate匹配。
*/
boolean anyMatch(Predicate<? super T> predicate);

/**
* 返回一个 Stream的构建器。
*/
public static<T> Builder<T> builder();

/**
* 使用 Collector对此流的元素进行归纳
*/
<R, A> R collect(Collector<? super T, A, R> collector);

/**
 * 返回此流中的元素数。
*/
long count();

/**
* 返回由该流的不同元素（根据 Object.equals(Object) ）组成的流。
*/
Stream<T> distinct();

/**
 * 遍历
*/
void forEach(Consumer<? super T> action);

/**
* 用于获取指定数量的流，截短长度不能超过 maxSize 。
*/
Stream<T> limit(long maxSize);

/**
* 用于映射每个元素到对应的结果
*/
<R> Stream<R> map(Function<? super T, ? extends R> mapper);

/**
* 根据提供的 Comparator进行排序。
*/
Stream<T> sorted(Comparator<? super T> comparator);

/**
* 丢弃此流中的前 n 个元素，返回由剩余元素组成的新流。
*/
Stream<T> skip(long n);

/**
* 返回一个包含此流的元素的数组。
*/
Object[] toArray();

/**
* 使用提供的 generator函数返回一个包含此流的元素的数组，以分配返回的数组，以及分区执行或调整大小可能需要的任何其他数组。
*/
<A> A[] toArray(IntFunction<A[]> generator);

/**
* 合并流
*/
public static <T> Stream<T> concat(Stream<? extends T> a, Stream<? extends T> b)
```

### Thực chiến

Bài viết này liệt kê cách sử dụng các phương thức tiêu biểu của `Stream`, cần xem thêm cách sử dụng khác vẫn nên tham khảo Api.

```java
@Test
public void test() {
  List<String> strings = Arrays.asList("abc", "def", "gkh", "abc");
    //返回符合条件的stream
    Stream<String> stringStream = strings.stream().filter(s -> "abc".equals(s));
    //计算流符合条件的流的数量
    long count = stringStream.count();

    //forEach遍历->打印元素
    strings.stream().forEach(System.out::println);

    //limit 获取到1个元素的stream
    Stream<String> limit = strings.stream().limit(1);
    //toArray 比如我们想看这个limitStream里面是什么，比如转换成String[],比如循环
    String[] array = limit.toArray(String[]::new);

    //map 对每个元素进行操作返回新流
    Stream<String> map = strings.stream().map(s -> s + "22");

    //sorted 排序并打印
    strings.stream().sorted().forEach(System.out::println);

    //Collectors collect 把abc放入容器中
    List<String> collect = strings.stream().filter(string -> "abc".equals(string)).collect(Collectors.toList());
    //把list转为string，各元素用，号隔开
    String mergedString = strings.stream().filter(string -> !string.isEmpty()).collect(Collectors.joining(","));

    //对数组的统计，比如用
    List<Integer> number = Arrays.asList(1, 2, 5, 4);

    IntSummaryStatistics statistics = number.stream().mapToInt((x) -> x).summaryStatistics();
    System.out.println("列表中最大的数 : "+statistics.getMax());
    System.out.println("列表中最小的数 : "+statistics.getMin());
    System.out.println("平均数 : "+statistics.getAverage());
    System.out.println("所有数之和 : "+statistics.getSum());

    //concat 合并流
    List<String> strings2 = Arrays.asList("xyz", "jqx");
    Stream.concat(strings2.stream(),strings.stream()).count();

    //注意 一个Stream只能操作一次，不能断开，否则会报错。
    Stream stream = strings.stream();
    //第一次使用
    stream.limit(2);
    //第二次使用
    stream.forEach(System.out::println);
    //报错 java.lang.IllegalStateException: stream has already been operated upon or closed

    //但是可以这样, 连续使用
    stream.limit(2).forEach(System.out::println);
}
```

### Thực thi trễ (Lazy Evaluation)

Khi thực thi các phương thức trả về `Stream`, chúng không thực thi ngay lập tức, mà đợi cho đến khi có phương thức trả về kiểu không phải `Stream` mới thực thi. Bởi vì khi có được `Stream` không thể dùng trực tiếp, mà cần xử lý thành kiểu thông thường. `Stream` ở đây có thể hiểu như luồng nhị phân (hai thứ hoàn toàn khác nhau), lấy được cũng không hiểu được.

Hãy phân tích phương thức `filter` bên dưới.

```java
@Test
public void laziness(){
  List<String> strings = Arrays.asList("abc", "def", "gkh", "abc");
  Stream<Integer> stream = strings.stream().filter(new Predicate() {
      @Override
      public boolean test(Object o) {
        System.out.println("Predicate.test 执行");
        return true;
        }
      });

   System.out.println("count 执行");
   stream.count();
}
/*-------执行结果--------*/
count 执行
Predicate.test 执行
Predicate.test 执行
Predicate.test 执行
Predicate.test 执行
```

Theo thứ tự thực thi, lẽ ra phải in 4 lần "Predicate.test thực thi" trước, rồi mới in "count thực thi". Kết quả thực tế lại ngược lại. Điều này chứng tỏ phương thức trong filter không thực thi ngay lập tức, mà đợi đến khi gọi phương thức `count()` mới thực thi.

Các ví dụ trên đều là `Stream` tuần tự. `parallelStream` song song có cách sử dụng tương tự Stream tuần tự. Điểm khác biệt chính là `parallelStream` có thể thực thi đa luồng, được triển khai dựa trên framework ForkJoin. Hãy tự tìm hiểu về framework `ForkJoin` và `ForkJoinPool` khi có thời gian. Ở đây có thể hiểu đơn giản là nó được thực hiện thông qua thread pool, điều này liên quan đến thread safety, tiêu thụ thread, v.v. Hãy cùng trải nghiệm thực thi đa luồng của parallel stream thông qua code.

```java
@Test
public void parallelStreamTest(){
   List<Integer> numbers = Arrays.asList(1, 2, 5, 4);
   numbers.parallelStream() .forEach(num->System.out.println(Thread.currentThread().getName()+">>"+num));
}
//执行结果
main>>5
ForkJoinPool.commonPool-worker-2>>4
ForkJoinPool.commonPool-worker-11>>1
ForkJoinPool.commonPool-worker-9>>2
```

Từ kết quả, chúng ta thấy rằng for-each sử dụng đa luồng.

### Tổng kết

Từ mã nguồn và ví dụ, chúng ta có thể tổng kết một số đặc điểm của stream:

1. Thông qua lập trình chuỗi đơn giản, nó có thể dễ dàng xử lý lại dữ liệu sau khi duyệt.
2. Tham số của phương thức đều là kiểu functional interface
3. Một Stream chỉ có thể thao tác một lần, sau khi thao tác xong sẽ bị đóng, tiếp tục sử dụng stream này sẽ báo lỗi.
4. Stream không lưu trữ dữ liệu, không thay đổi nguồn dữ liệu

## Optional

Trong [Hướng dẫn phát triển Alibaba về Optional](https://share.weiyun.com/ThuqEbD5) có viết:

> Phòng ngừa NPE là kỹ năng cơ bản của lập trình viên, chú ý đến các tình huống NPE xảy ra:
>
> 1. Khi kiểu trả về là kiểu dữ liệu nguyên thủy, khi return đối tượng kiểu đóng gói, auto-unboxing có thể gây ra NPE.
>
> Ví dụ phản diện: public int f() { return Integer object}, nếu là null, auto-unboxing sẽ ném NPE.
>
> 2. Kết quả truy vấn database có thể là null.
> 3. Ngay cả khi collection không empty, phần tử lấy ra cũng có thể là null.
> 4. Khi đối tượng trả về từ remote call, phải yêu cầu kiểm tra null pointer, phòng ngừa NPE.
> 5. Với dữ liệu lấy từ Session, khuyến nghị kiểm tra NPE, tránh null pointer.
> 6. Gọi chuỗi obj.getA().getB().getC(); gọi liên tục, dễ gây ra NPE.
>
> Ví dụ đúng: Sử dụng lớp Optional của JDK8 để phòng ngừa vấn đề NPE.

Họ khuyến nghị sử dụng `Optional` để giải quyết vấn đề NPE (`java.lang.NullPointerException`), nó sinh ra chính vì NPE, có thể chứa giá trị null hoặc không null. Hãy cùng từng bước khám phá `Optional` thông qua mã nguồn.

Giả sử có một lớp `Zoo`, bên trong có thuộc tính `Dog`, yêu cầu lấy `age` của `Dog`.

```java
class Zoo {
   private Dog dog;
}

class Dog {
   private int age;
}
```

Cách truyền thống giải quyết NPE:

```java
Zoo zoo = getZoo();
if(zoo != null){
   Dog dog = zoo.getDog();
   if(dog != null){
      int age = dog.getAge();
      System.out.println(age);
   }
}
```

Kiểm tra từng lớp xem đối tượng có null không, một số người nói cách này rất xấu xí và không thanh lịch, nhưng tôi không nghĩ vậy. Ngược lại, tôi thấy nó rất gọn gàng, dễ đọc, dễ hiểu. Các bạn nghĩ sao?

`Optional` được triển khai như sau:

```java
Optional.ofNullable(zoo).map(o -> o.getDog()).map(d -> d.getAge()).ifPresent(age ->
    System.out.println(age)
);
```

Có phải ngắn gọn hơn nhiều không?

### Cách tạo một Optional

Trong ví dụ trên, `Optional.ofNullable` là một trong những cách tạo Optional. Hãy xem ý nghĩa của nó và các phương thức mã nguồn khác để tạo Optional.

```java
/**
* Common instance for {@code empty()}. 全局EMPTY对象
*/
private static final Optional<?> EMPTY = new Optional<>();

/**
* Optional维护的值
*/
private final T value;

/**
* 如果value是null就返回EMPTY，否则就返回of(T)
*/
public static <T> Optional<T> ofNullable(T value) {
   return value == null ? empty() : of(value);
}
/**
* 返回 EMPTY 对象
*/
public static<T> Optional<T> empty() {
   Optional<T> t = (Optional<T>) EMPTY;
   return t;
}
/**
* 返回Optional对象
*/
public static <T> Optional<T> of(T value) {
    return new Optional<>(value);
}
/**
* 私有构造方法，给value赋值
*/
private Optional(T value) {
  this.value = Objects.requireNonNull(value);
}
/**
* 所以如果of(T value) 的value是null，会抛出NullPointerException异常，这样貌似就没处理NPE问题
*/
public static <T> T requireNonNull(T obj) {
  if (obj == null)
         throw new NullPointerException();
  return obj;
}
```

Sự khác biệt duy nhất giữa phương thức `ofNullable` và `of` là khi value là null, `ofNullable` trả về `EMPTY`, còn `of` sẽ ném exception `NullPointerException`. Nếu cần để `NullPointerException` lộ ra thì dùng `of`, ngược lại thì dùng `ofNullable`.

**Sự khác biệt giữa `map()` và `flatMap()` là gì?**

Cả `map` và `flatMap` đều áp dụng một hàm cho mỗi phần tử trong collection, nhưng điểm khác biệt là `map` trả về một collection mới, còn `flatMap` ánh xạ mỗi phần tử thành một collection, rồi làm phẳng collection đó.

Trong ứng dụng thực tế, nếu `map` trả về mảng thì cuối cùng sẽ nhận được mảng hai chiều, sử dụng `flatMap` là để làm phẳng mảng hai chiều này thành mảng một chiều.

```java
public class MapAndFlatMapExample {
    public static void main(String[] args) {
        List<String[]> listOfArrays = Arrays.asList(
                new String[]{"apple", "banana", "cherry"},
                new String[]{"orange", "grape", "pear"},
                new String[]{"kiwi", "melon", "pineapple"}
        );

        List<String[]> mapResult = listOfArrays.stream()
                .map(array -> Arrays.stream(array).map(String::toUpperCase).toArray(String[]::new))
                .collect(Collectors.toList());

        System.out.println("Using map:");
        mapResult.forEach(arrays-> System.out.println(Arrays.toString(arrays)));

        List<String> flatMapResult = listOfArrays.stream()
                .flatMap(array -> Arrays.stream(array).map(String::toUpperCase))
                .collect(Collectors.toList());

        System.out.println("Using flatMap:");
        System.out.println(flatMapResult);
    }
}

```

Kết quả chạy:

```plain
Using map:
[[APPLE, BANANA, CHERRY], [ORANGE, GRAPE, PEAR], [KIWI, MELON, PINEAPPLE]]

Using flatMap:
[APPLE, BANANA, CHERRY, ORANGE, GRAPE, PEAR, KIWI, MELON, PINEAPPLE]
```

Cách hiểu đơn giản nhất là `flatMap()` có thể mở rộng kết quả của `map()`.

Trong `Optional`, khi sử dụng `map()`, nếu hàm ánh xạ trả về giá trị thông thường, nó sẽ bọc giá trị đó trong một `Optional` mới. Còn khi sử dụng `flatMap`, nếu hàm ánh xạ trả về một `Optional`, nó sẽ làm phẳng `Optional` trả về đó, không bọc thành `Optional` lồng nhau.

Dưới đây là code ví dụ so sánh:

```java
public static void main(String[] args) {
        int userId = 1;

        // 使用flatMap的代码
        String cityUsingFlatMap = getUserById(userId)
                .flatMap(OptionalExample::getAddressByUser)
                .map(Address::getCity)
                .orElse("Unknown");

        System.out.println("User's city using flatMap: " + cityUsingFlatMap);

        // 不使用flatMap的代码
        Optional<Optional<Address>> optionalAddress = getUserById(userId)
                .map(OptionalExample::getAddressByUser);

        String cityWithoutFlatMap;
        if (optionalAddress.isPresent()) {
            Optional<Address> addressOptional = optionalAddress.get();
            if (addressOptional.isPresent()) {
                Address address = addressOptional.get();
                cityWithoutFlatMap = address.getCity();
            } else {
                cityWithoutFlatMap = "Unknown";
            }
        } else {
            cityWithoutFlatMap = "Unknown";
        }

        System.out.println("User's city without flatMap: " + cityWithoutFlatMap);
    }
```

Sử dụng đúng `flatMap` trong `Stream` và `Optional` có thể giảm thiểu nhiều code không cần thiết.

### Kiểm tra xem value có null không

```java
/**
* value是否为null
*/
public boolean isPresent() {
    return value != null;
}
/**
* 如果value不为null执行consumer.accept
*/
public void ifPresent(Consumer<? super T> consumer) {
   if (value != null)
    consumer.accept(value);
}
```

### Lấy value

```java
/**
* Return the value if present, otherwise invoke {@code other} and return
* the result of that invocation.
* 如果value != null 返回value，否则返回other的执行结果
*/
public T orElseGet(Supplier<? extends T> other) {
    return value != null ? value : other.get();
}

/**
* 如果value != null 返回value，否则返回T
*/
public T orElse(T other) {
    return value != null ? value : other;
}

/**
* 如果value != null 返回value，否则抛出参数返回的异常
*/
public <X extends Throwable> T orElseThrow(Supplier<? extends X> exceptionSupplier) throws X {
        if (value != null) {
            return value;
        } else {
            throw exceptionSupplier.get();
        }
}
/**
* value为null抛出NoSuchElementException，不为空返回value。
*/
public T get() {
  if (value == null) {
      throw new NoSuchElementException("No value present");
  }
  return value;
}
```

### Lọc value

```java
/**
* 1. 如果是empty返回empty
* 2. predicate.test(value)==true 返回this，否则返回empty
*/
public Optional<T> filter(Predicate<? super T> predicate) {
        Objects.requireNonNull(predicate);
        if (!isPresent())
            return this;
        else
            return predicate.test(value) ? this : empty();
}
```

### Tổng kết

Sau khi đọc mã nguồn `Optional`, các phương thức của `Optional` thực sự rất đơn giản. Đáng lưu ý là nếu thực sự không muốn thấy `NPE`, thì đừng dùng `of()`, `get()`, `flatMap(..)`. Cuối cùng hãy sử dụng tổng hợp các phương thức tần suất cao của `Optional`.

```java
Optional.ofNullable(zoo).map(o -> o.getDog()).map(d -> d.getAge()).filter(v->v==1).orElse(3);
```

## Date-Time API

Đây là sự bổ sung mạnh mẽ cho `java.util.Date`, giải quyết hầu hết các vấn đề khó chịu của lớp Date:

1. Không an toàn với luồng (non-thread-safe)
2. Xử lý múi giờ rắc rối
3. Định dạng và tính toán thời gian phức tạp
4. Thiết kế có khiếm khuyết, lớp Date chứa đồng thời cả ngày và giờ; còn có java.sql.Date dễ gây nhầm lẫn.

Hãy cùng so sánh sự khác biệt giữa java.util.Date và Date mới thông qua các ví dụ thời gian thường dùng. Đã đến lúc sửa lại code sử dụng `java.util.Date`.

### Các lớp chính trong java.time

`java.util.Date` vừa chứa ngày vừa chứa giờ, còn `java.time` tách chúng ra

```java
LocalDateTime.class //日期+时间 format: yyyy-MM-ddTHH:mm:ss.SSS
LocalDate.class //日期 format: yyyy-MM-dd
LocalTime.class //时间 format: HH:mm:ss
```

### Định dạng

**Trước Java 8:**

```java
public void oldFormat(){
    Date now = new Date();
    //format yyyy-MM-dd
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    String date  = sdf.format(now);
    System.out.println(String.format("date format : %s", date));

    //format HH:mm:ss
    SimpleDateFormat sdft = new SimpleDateFormat("HH:mm:ss");
    String time = sdft.format(now);
    System.out.println(String.format("time format : %s", time));

    //format yyyy-MM-dd HH:mm:ss
    SimpleDateFormat sdfdt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    String datetime = sdfdt.format(now);
    System.out.println(String.format("dateTime format : %s", datetime));
}
```

**Từ Java 8 trở đi:**

```java
public void newFormat(){
    //format yyyy-MM-dd
    LocalDate date = LocalDate.now();
    System.out.println(String.format("date format : %s", date));

    //format HH:mm:ss
    LocalTime time = LocalTime.now().withNano(0);
    System.out.println(String.format("time format : %s", time));

    //format yyyy-MM-dd HH:mm:ss
    LocalDateTime dateTime = LocalDateTime.now();
    DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    String dateTimeStr = dateTime.format(dateTimeFormatter);
    System.out.println(String.format("dateTime format : %s", dateTimeStr));
}
```

### Chuyển đổi chuỗi sang định dạng ngày

**Trước Java 8:**

```java
//已弃用
Date date = new Date("2021-01-26");
//替换为
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
Date date1 = sdf.parse("2021-01-26");
```

**Từ Java 8 trở đi:**

```java
LocalDate date = LocalDate.of(2021, 1, 26);
LocalDate.parse("2021-01-26");

LocalDateTime dateTime = LocalDateTime.of(2021, 1, 26, 12, 12, 22);
LocalDateTime.parse("2021-01-26T12:12:22");

LocalTime time = LocalTime.of(12, 12, 22);
LocalTime.parse("12:12:22");
```

**Trước Java 8** việc chuyển đổi cần dựa vào lớp `SimpleDateFormat`, còn **từ Java 8 trở đi** chỉ cần phương thức `of` hoặc `parse` của `LocalDate`, `LocalTime`, `LocalDateTime`.

### Tính toán ngày

Dưới đây chỉ lấy **ngày sau một tuần** làm ví dụ, các đơn vị khác (năm, tháng, ngày, nửa ngày, giờ, v.v.) tương tự. Ngoài ra, các đơn vị này đều được định nghĩa trong enum _java.time.temporal.ChronoUnit_.

**Trước Java 8:**

```java
public void afterDay(){
     //一周后的日期
     SimpleDateFormat formatDate = new SimpleDateFormat("yyyy-MM-dd");
     Calendar ca = Calendar.getInstance();
     ca.add(Calendar.DATE, 7);
     Date d = ca.getTime();
     String after = formatDate.format(d);
     System.out.println("一周后日期：" + after);

   //算两个日期间隔多少天，计算间隔多少年，多少月方法类似
     String dates1 = "2021-12-23";
   String dates2 = "2021-02-26";
     SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
     Date date1 = format.parse(dates1);
     Date date2 = format.parse(dates2);
     int day = (int) ((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));
     System.out.println(dates1 + "和" + dates2 + "相差" + day + "天");
     //结果：2021-02-26和2021-12-23相差300天
}
```

**Từ Java 8 trở đi:**

```java
public void pushWeek(){
     //一周后的日期
     LocalDate localDate = LocalDate.now();
     //方法1
     LocalDate after = localDate.plus(1, ChronoUnit.WEEKS);
     //方法2
     LocalDate after2 = localDate.plusWeeks(1);
     System.out.println("一周后日期：" + after);

     //算两个日期间隔多少天，计算间隔多少年，多少月
     LocalDate date1 = LocalDate.parse("2021-02-26");
     LocalDate date2 = LocalDate.parse("2021-12-23");
     Period period = Period.between(date1, date2);
     System.out.println("date1 到 date2 相隔："
                + period.getYears() + "年"
                + period.getMonths() + "月"
                + period.getDays() + "天");
   //打印结果是 "date1 到 date2 相隔：0年9月27天"
     //这里period.getDays()得到的天是抛去年月以外的天数，并不是总天数
     //如果要获取纯粹的总天数应该用下面的方法
     long day = date2.toEpochDay() - date1.toEpochDay();
     System.out.println(date1 + "和" + date2 + "相差" + day + "天");
     //打印结果：2021-02-26和2021-12-23相差300天
}
```

### Lấy ngày cụ thể

Ngoài việc tính toán ngày phức tạp, việc lấy một ngày cụ thể cũng rất phức tạp, chẳng hạn như lấy ngày đầu tiên, ngày cuối cùng của tháng hiện tại.

**Trước Java 8:**

```java
public void getDay() {

        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        //获取当前月第一天：
        Calendar c = Calendar.getInstance();
        c.set(Calendar.DAY_OF_MONTH, 1);
        String first = format.format(c.getTime());
        System.out.println("first day:" + first);

        //获取当前月最后一天
        Calendar ca = Calendar.getInstance();
        ca.set(Calendar.DAY_OF_MONTH, ca.getActualMaximum(Calendar.DAY_OF_MONTH));
        String last = format.format(ca.getTime());
        System.out.println("last day:" + last);

        //当年最后一天
        Calendar currCal = Calendar.getInstance();
        Calendar calendar = Calendar.getInstance();
        calendar.clear();
        calendar.set(Calendar.YEAR, currCal.get(Calendar.YEAR));
        calendar.roll(Calendar.DAY_OF_YEAR, -1);
        Date time = calendar.getTime();
        System.out.println("last day:" + format.format(time));
}
```

**Từ Java 8 trở đi:**

```java
public void getDayNew() {
    LocalDate today = LocalDate.now();
    //获取当前月第一天：
    LocalDate firstDayOfThisMonth = today.with(TemporalAdjusters.firstDayOfMonth());
    // 取本月最后一天
    LocalDate lastDayOfThisMonth = today.with(TemporalAdjusters.lastDayOfMonth());
    //取下一天：
    LocalDate nextDay = lastDayOfThisMonth.plusDays(1);
    //当年最后一天
    LocalDate lastday = today.with(TemporalAdjusters.lastDayOfYear());
    //2021年最后一个周日，如果用Calendar是不得烦死。
    LocalDate lastMondayOf2021 = LocalDate.parse("2021-12-31").with(TemporalAdjusters.lastInMonth(DayOfWeek.SUNDAY));
}
```

Trong `java.time.temporal.TemporalAdjusters` còn có nhiều thuật toán tiện lợi khác, ở đây không dẫn hết Api, đều rất đơn giản, xem vào là hiểu ngay.

### JDBC và Java 8

Bây giờ mối quan hệ tương ứng giữa kiểu thời gian JDBC và kiểu thời gian Java 8 là:

1. `Date` ---> `LocalDate`
2. `Time` ---> `LocalTime`
3. `Timestamp` ---> `LocalDateTime`

Còn trước đây tất cả đều tương ứng với `Date`, và chỉ có `Date`.

### Múi giờ

> Múi giờ: Cách phân chia múi giờ chính thức là mỗi 15° kinh độ là một múi giờ, toàn cầu có 24 múi giờ, mỗi múi giờ chênh nhau 1 giờ. Nhưng để thuận tiện về mặt hành chính, thường gộp 1 quốc gia hoặc 1 tỉnh vào cùng múi giờ. Ví dụ, Trung Quốc có lãnh thổ rộng lớn, khoảng trải dài 5 múi giờ, nhưng thực tế chỉ dùng múi giờ Đông 8 tức giờ Bắc Kinh làm chuẩn.

Đối tượng `java.util.Date` thực chất lưu trữ số mili-giây đã trôi qua kể từ 0 giờ ngày 1 tháng 1 năm 1970 (GMT) đến thời điểm mà đối tượng Date biểu thị. Tức là dù new Date ở múi giờ nào, số mili-giây nó ghi đều như nhau, không liên quan đến múi giờ. Nhưng khi sử dụng cần chuyển đổi sang giờ địa phương, điều này liên quan đến quốc tế hóa thời gian. `java.util.Date` không tự hỗ trợ quốc tế hóa, cần dựa vào `TimeZone`.

```java
//北京时间：Wed Jan 27 14:05:29 CST 2021
Date date = new Date();

SimpleDateFormat bjSdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//北京时区
bjSdf.setTimeZone(TimeZone.getTimeZone("Asia/Shanghai"));
System.out.println("毫秒数:" + date.getTime() + ", 北京时间:" + bjSdf.format(date));

//东京时区
SimpleDateFormat tokyoSdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
tokyoSdf.setTimeZone(TimeZone.getTimeZone("Asia/Tokyo"));  // 设置东京时区
System.out.println("毫秒数:" + date.getTime() + ", 东京时间:" + tokyoSdf.format(date));

//如果直接print会自动转成当前时区的时间
System.out.println(date);
//Wed Jan 27 14:05:29 CST 2021
```

Trong các tính năng mới, `java.time.ZonedDateTime` được giới thiệu để biểu thị thời gian có múi giờ. Nó có thể được hiểu là `LocalDateTime + ZoneId`.

```java
//当前时区时间
ZonedDateTime zonedDateTime = ZonedDateTime.now();
System.out.println("当前时区时间: " + zonedDateTime);

//东京时间
ZoneId zoneId = ZoneId.of(ZoneId.SHORT_IDS.get("JST"));
ZonedDateTime tokyoTime = zonedDateTime.withZoneSameInstant(zoneId);
System.out.println("东京时间: " + tokyoTime);

// ZonedDateTime 转 LocalDateTime
LocalDateTime localDateTime = tokyoTime.toLocalDateTime();
System.out.println("东京时间转当地时间: " + localDateTime);

//LocalDateTime 转 ZonedDateTime
ZonedDateTime localZoned = localDateTime.atZone(ZoneId.systemDefault());
System.out.println("本地时区时间: " + localZoned);

//打印结果
当前时区时间: 2021-01-27T14:43:58.735+08:00[Asia/Shanghai]
东京时间: 2021-01-27T15:43:58.735+09:00[Asia/Tokyo]
东京时间转当地时间: 2021-01-27T15:43:58.735
当地时区时间: 2021-01-27T15:43:58.735+08:00[Asia/Shanghai]
```

### Tổng kết

Thông qua việc so sánh `Date` cũ và mới ở trên, tất nhiên chỉ liệt kê một phần sự khác biệt về chức năng, còn nhiều tính năng khác cần tự khám phá. Tóm lại, date-time-api mang lại nhiều lợi ích cho các thao tác ngày tháng. Trong công việc hàng ngày khi gặp thao tác kiểu date, ưu tiên suy nghĩ đến date-time-api trước, nếu thực sự không giải quyết được mới xem xét đến Date cũ.

## Tổng kết

Chúng ta đã tổng hợp và tổng kết các tính năng mới của Java 8:

- Interface & functional Interface
- Lambda
- Stream
- Optional
- Date time-api

Đây đều là các tính năng được sử dụng khá phổ biến trong quá trình phát triển. Sau khi tổng hợp, nhận ra chúng thực sự rất hay, nhưng tôi đã không áp dụng sớm hơn. Luôn cảm thấy học các tính năng mới Java 8 khá phiền, cứ dùng cách triển khai cũ. Thực ra những tính năng mới này có thể nắm vững trong vài ngày, và một khi nắm được, hiệu quả làm việc sẽ tăng lên đáng kể. Thực ra khi chúng ta tăng lương cũng là trả tiền cho việc học, không học thì cuối cùng sẽ bị đào thải, khủng hoảng tuổi 35 sẽ đến sớm hơn.

<!-- @include: @article-footer.snippet.md -->
