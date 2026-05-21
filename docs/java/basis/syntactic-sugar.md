---
title: Giải thích chi tiết về Syntactic Sugar trong Java
description: Phân tích sâu nguyên lý syntactic sugar trong Java：giải thích cơ chế triển khai tại compile-time của autoboxing/unboxing, type erasure, enhanced for, varargs, enum, Lambda và các syntactic sugar khác, tránh những cạm bẫy khi sử dụng.
category: Java
tag:
  - Nền tảng Java
head:
  - - meta
    - name: keywords
      content: Java语法糖,自动装箱拆箱,泛型擦除,增强for循环,可变参数,枚举,内部类,Lambda表达式,语法糖原理
---

> Tác giả：Hollis
>
> Bài gốc：<https://mp.weixin.qq.com/s/o4XdEMq1DL-nBS-f8Za5Aw>

Syntactic sugar là một kiến thức thường được hỏi trong các buổi phỏng vấn Java tại các công ty lớn.

Bài viết này tiếp cận từ góc độ nguyên lý biên dịch Java, đi sâu vào bytecode và class file, bóc tách từng lớp để hiểu nguyên lý và cách sử dụng syntactic sugar trong Java, giúp mọi người vừa biết cách sử dụng syntactic sugar trong Java, vừa hiểu được nguyên lý đằng sau những syntactic sugar này.

## Syntactic Sugar là gì?

**Syntactic Sugar (Cú pháp đường)** còn được gọi là "sugar-coated syntax" (cú pháp bọc đường), là thuật ngữ do nhà khoa học máy tính người Anh Peter.J.Landin đặt ra, chỉ một loại cú pháp được thêm vào ngôn ngữ máy tính mà không ảnh hưởng đến chức năng của ngôn ngữ, nhưng lại thuận tiện hơn cho lập trình viên sử dụng. Nói một cách đơn giản, syntactic sugar giúp chương trình ngắn gọn hơn và có khả năng đọc cao hơn.

![](/images/github/javaguide/java/basis/syntactic-sugar/image-20220818175953954.png)

> Thú vị là, trong lĩnh vực lập trình, ngoài syntactic sugar (đường cú pháp), còn có các khái niệm syntactic salt (muối cú pháp) và syntactic saccharin (đường hóa học cú pháp), nhưng bài viết này không mở rộng về những khái niệm đó.

Hầu hết các ngôn ngữ lập trình phổ biến mà chúng ta biết đều có syntactic sugar. Tác giả cho rằng số lượng syntactic sugar là một trong những tiêu chí đánh giá một ngôn ngữ có mạnh hay không. Nhiều người nói Java là một "ngôn ngữ ít đường", nhưng thực ra từ Java 7, Java đã liên tục bổ sung các loại "đường" ở cấp độ ngôn ngữ, chủ yếu trong khuôn khổ dự án "Project Coin". Mặc dù ngay cả bây giờ vẫn còn người cho rằng Java hiện tại là ít đường, trong tương lai Java vẫn sẽ tiếp tục phát triển theo hướng "nhiều đường hơn".

## Java có những Syntactic Sugar phổ biến nào?

Như đã đề cập trước đó, sự tồn tại của syntactic sugar chủ yếu là để thuận tiện cho các lập trình viên sử dụng. Tuy nhiên thực ra, **JVM không hỗ trợ những syntactic sugar này. Những syntactic sugar này sẽ được khôi phục về cấu trúc cú pháp cơ bản đơn giản hơn trong giai đoạn biên dịch, quá trình này gọi là desugaring.**

Nói đến biên dịch, mọi người đều biết rằng trong ngôn ngữ Java, lệnh `javac` có thể biên dịch file nguồn có phần mở rộng `.java` thành bytecode có phần mở rộng `.class` có thể chạy trên JVM. Nếu bạn xem mã nguồn của `com.sun.tools.javac.main.JavaCompiler`, bạn sẽ thấy trong `compile()` có một bước gọi `desugar()`, và phương thức này chịu trách nhiệm thực hiện việc desugaring.

Những syntactic sugar phổ biến nhất trong Java bao gồm generics, varargs, conditional compilation, autoboxing/unboxing, inner classes, v.v. Bài viết này chủ yếu phân tích nguyên lý đằng sau những syntactic sugar này. Từng bước bóc tách lớp "đường" để nhìn thấy bản chất.

Ở đây chúng ta sẽ sử dụng [decompilation (dịch ngược)](https://mp.weixin.qq.com/s?__biz=MzI3NzE0NjcwMg==&mid=2650120609&idx=1&sn=5659f96310963ad57d55b48cee63c788&chksm=f36bbc80c41c3596a1e4bf9501c6280481f1b9e06d07af354474e6f3ed366fef016df673a7ba&scene=21#wechat_redirect), bạn có thể dịch ngược file Class trực tuyến qua [Decompilers online](http://www.javadecompilers.com/).

### switch hỗ trợ String và Enum

Như đã đề cập trước đó, từ Java 7, các syntactic sugar trong ngôn ngữ Java dần trở nên phong phú hơn, trong đó một syntactic sugar khá quan trọng là `switch` trong Java 7 bắt đầu hỗ trợ `String`.

Trước khi bắt đầu, cần nắm rõ một điểm: `switch` trong Java vốn đã hỗ trợ các kiểu cơ bản. Ví dụ như `int`, `char`, v.v. Đối với kiểu `int`, nó so sánh trực tiếp theo giá trị số. Đối với kiểu `char`, nó so sánh theo mã ascii. Vì vậy, đối với trình biên dịch, `switch` thực ra chỉ có thể sử dụng kiểu số nguyên, mọi phép so sánh đều phải chuyển đổi sang số nguyên. Ví dụ như `byte`, `short`, `char` (mã ascii là số nguyên) và `int`.

Bây giờ hãy xem `switch` hỗ trợ `String` như thế nào, ví dụ đoạn code dưới đây:

```java
public class switchDemoString {
    public static void main(String[] args) {
        String str = "world";
        switch (str) {
        case "hello":
            System.out.println("hello");
            break;
        case "world":
            System.out.println("world");
            break;
        default:
            break;
        }
    }
}
```

Sau khi dịch ngược, nội dung như sau:

```java
public class switchDemoString
{
    public switchDemoString()
    {
    }
    public static void main(String args[])
    {
        String str = "world";
        String s;
        switch((s = str).hashCode())
        {
        default:
            break;
        case 99162322:
            if(s.equals("hello"))
                System.out.println("hello");
            break;
        case 113318802:
            if(s.equals("world"))
                System.out.println("world");
            break;
        }
    }
}
```

Nhìn vào đoạn code này, bạn sẽ hiểu rằng **switch với string được thực hiện thông qua phương thức `equals()` và `hashCode()`.** May mắn là phương thức `hashCode()` trả về giá trị `int`, không phải `long`.

Nhìn kỹ có thể thấy, điều thực sự được so sánh trong `switch` là giá trị hash, sau đó sử dụng phương thức `equals` để kiểm tra an toàn. Kiểm tra này là cần thiết vì hash có thể xảy ra va chạm. Do đó, hiệu suất của nó không bằng khi dùng enum trong `switch` hoặc dùng hằng số nguyên thuần túy, nhưng cũng không quá tệ.

### Generics

Chúng ta đều biết rằng nhiều ngôn ngữ hỗ trợ generics, nhưng điều nhiều người không biết là các trình biên dịch khác nhau xử lý generics theo những cách khác nhau. Thông thường, một trình biên dịch xử lý generics theo hai cách: `Code specialization` và `Code sharing`. C++ và C# sử dụng cơ chế `Code specialization`, trong khi Java sử dụng cơ chế `Code sharing`.

> Phương thức Code sharing tạo ra biểu diễn bytecode duy nhất cho mỗi kiểu generic và ánh xạ tất cả các instance của kiểu generic đó vào biểu diễn bytecode duy nhất này. Việc ánh xạ nhiều instance kiểu generic vào biểu diễn bytecode duy nhất được thực hiện thông qua type erasure (xóa kiểu - `type erasure`).

Điều này có nghĩa là, **đối với JVM, nó hoàn toàn không nhận ra cú pháp như `Map<String, String> map`. Cần phải thực hiện desugaring thông qua type erasure trong giai đoạn biên dịch.**

Quá trình chính của type erasure như sau: 1. Thay thế tất cả các tham số generic bằng kiểu cha xa nhất bên trái (kiểu cha cấp cao nhất). 2. Loại bỏ tất cả các tham số kiểu.

Đoạn code dưới đây:

```java
Map<String, String> map = new HashMap<String, String>();
map.put("name", "hollis");
map.put("wechat", "Hollis");
map.put("blog", "www.hollischuang.com");
```

Sau khi desugaring sẽ trở thành:

```java
Map map = new HashMap();
map.put("name", "hollis");
map.put("wechat", "Hollis");
map.put("blog", "www.hollischuang.com");
```

Đoạn code dưới đây:

```java
public static <A extends Comparable<A>> A max(Collection<A> xs) {
    Iterator<A> xi = xs.iterator();
    A w = xi.next();
    while (xi.hasNext()) {
        A x = xi.next();
        if (w.compareTo(x) < 0)
            w = x;
    }
    return w;
}
```

Sau khi type erasure sẽ trở thành:

```java
 public static Comparable max(Collection xs){
    Iterator xi = xs.iterator();
    Comparable w = (Comparable)xi.next();
    while(xi.hasNext())
    {
        Comparable x = (Comparable)xi.next();
        if(w.compareTo(x) < 0)
            w = x;
    }
    return w;
}
```

**Trong JVM không có generics, chỉ có các class và method thông thường. Tất cả các tham số kiểu của class generic đều bị xóa khi biên dịch, class generic không có đối tượng `Class` riêng. Ví dụ không tồn tại `List<String>.class` hay `List<Integer>.class`, chỉ có `List.class`.**

### Autoboxing và Unboxing

Autoboxing là quá trình Java tự động chuyển đổi giá trị kiểu nguyên thủy thành đối tượng tương ứng, ví dụ chuyển đổi biến int thành đối tượng Integer, quá trình này gọi là boxing (đóng hộp). Ngược lại, chuyển đổi đối tượng Integer thành giá trị kiểu int gọi là unboxing (mở hộp). Vì quá trình boxing và unboxing ở đây được thực hiện tự động chứ không phải do con người chuyển đổi, nên được gọi là autoboxing và unboxing. Các kiểu nguyên thủy byte, short, char, int, long, float, double và boolean tương ứng với các lớp bọc Byte, Short, Character, Integer, Long, Float, Double, Boolean.

Hãy xem đoạn code autoboxing trước:

```java
 public static void main(String[] args) {
    int i = 10;
    Integer n = i;
}
```

Sau khi dịch ngược, code như sau:

```java
public static void main(String args[])
{
    int i = 10;
    Integer n = Integer.valueOf(i);
}
```

Tiếp theo hãy xem đoạn code unboxing:

```java
public static void main(String[] args) {

    Integer i = 10;
    int n = i;
}
```

Sau khi dịch ngược, code như sau:

```java
public static void main(String args[])
{
    Integer i = Integer.valueOf(10);
    int n = i.intValue();
}
```

Từ nội dung thu được sau khi dịch ngược, chúng ta có thể thấy rằng khi boxing, phương thức được gọi tự động là phương thức `valueOf(int)` của `Integer`. Còn khi unboxing, phương thức được gọi tự động là phương thức `intValue` của `Integer`.

Vì vậy, **quá trình boxing được thực hiện bằng cách gọi phương thức valueOf của lớp bọc, còn quá trình unboxing được thực hiện bằng cách gọi phương thức xxxValue của lớp bọc.**

### Varargs (Tham số có độ dài thay đổi)

Variable arguments (varargs) là một tính năng được giới thiệu trong Java 1.5. Nó cho phép một phương thức nhận bất kỳ số lượng giá trị nào làm tham số.

Hãy xem đoạn code varargs sau, trong đó phương thức `print` nhận varargs:

```java
public static void main(String[] args)
    {
        print("Holis", "公众号:Hollis", "博客：www.hollischuang.com", "QQ：907607222");
    }

public static void print(String... strs)
{
    for (int i = 0; i < strs.length; i++)
    {
        System.out.println(strs[i]);
    }
}
```

Code sau khi dịch ngược:

```java
 public static void main(String args[])
{
    print(new String[] {
        "Holis", "公众号:Hollis", "博客：www.hollischuang.com", "QQ：907607222"
    });
}

public static transient void print(String strs[])
{
    for(int i = 0; i < strs.length; i++)
        System.out.println(strs[i]);

}
```

Từ code sau khi dịch ngược, chúng ta có thể thấy rằng khi varargs được sử dụng, đầu tiên nó sẽ tạo một mảng, độ dài của mảng bằng với số lượng tham số thực tế được truyền vào khi gọi phương thức đó, sau đó đặt tất cả các giá trị tham số vào mảng này, rồi truyền mảng này làm tham số đến phương thức được gọi. (Lưu ý: `transient` chỉ có ý nghĩa khi sửa đổi biến thành viên, việc "sửa đổi phương thức" ở đây là do javassist sử dụng cùng một giá trị số để biểu diễn cả `transient` và `vararg`, xem [tại đây](https://github.com/jboss-javassist/javassist/blob/7302b8b0a09f04d344a26ebe57f29f3db43f2a3e/src/main/javassist/bytecode/AccessFlag.java#L32).)

### Enum

Java SE5 cung cấp một kiểu mới - kiểu enum của Java. Từ khóa `enum` có thể tạo một tập hợp hữu hạn các giá trị có tên thành một kiểu mới, và những giá trị có tên này có thể được sử dụng như các thành phần chương trình thông thường. Đây là một tính năng rất hữu ích.

Để xem mã nguồn, trước tiên cần có một lớp. Vậy kiểu enum thực sự là lớp gì? Có phải là `enum` không? Câu trả lời rõ ràng là không, `enum` cũng giống như `class`, chỉ là một từ khóa, nó không phải là một lớp. Vậy enum được duy trì bởi lớp nào? Hãy viết một enum đơn giản:

```java
public enum t {
    SPRING,SUMMER;
}
```

Sau đó chúng ta dùng dịch ngược để xem đoạn code này được triển khai như thế nào, nội dung code sau khi dịch ngược như sau:

```java
//Java编译器会自动将枚举名处理为合法类名（首字母大写）: t -> T
public final class T extends Enum
{
    private T(String s, int i)
    {
        super(s, i);
    }
    public static T[] values()
    {
        T at[];
        int i;
        T at1[];
        System.arraycopy(at = ENUM$VALUES, 0, at1 = new T[i = at.length], 0, i);
        return at1;
    }

    public static T valueOf(String s)
    {
        return (T)Enum.valueOf(demo/T, s);
    }

    public static final T SPRING;
    public static final T SUMMER;
    private static final T ENUM$VALUES[];
    static
    {
        SPRING = new T("SPRING", 0);
        SUMMER = new T("SUMMER", 1);
        ENUM$VALUES = (new T[] {
            SPRING, SUMMER
        });
    }
}
```

Từ code sau khi dịch ngược, chúng ta có thể thấy `public final class T extends Enum`, nghĩa là lớp này kế thừa lớp `Enum`, đồng thời từ khóa `final` cho chúng ta biết rằng lớp này cũng không thể được kế thừa.

**Khi chúng ta dùng `enum` để định nghĩa một kiểu enum, trình biên dịch sẽ tự động tạo cho chúng ta một lớp kiểu `final` kế thừa lớp `Enum`, vì vậy kiểu enum không thể được kế thừa.**

### Inner Class (Lớp nội)

Inner class còn được gọi là nested class, có thể hiểu inner class là một thành viên thông thường của outer class (lớp ngoài).

**Lý do inner class cũng là syntactic sugar là vì nó chỉ là một khái niệm tại compile time. Nếu định nghĩa một inner class `inner` bên trong `outer.java`, sau khi biên dịch thành công, sẽ tạo ra hai file `.class` hoàn toàn khác nhau, lần lượt là `outer.class` và `outer$inner.class`. Vì vậy, tên của inner class hoàn toàn có thể trùng tên với outer class.**

```java
public class OuterClass {
    private String userName;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public static void main(String[] args) {

    }

    class InnerClass{
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
```

Đoạn code trên sau khi biên dịch sẽ tạo ra hai file class: `OuterClass$InnerClass.class`, `OuterClass.class`. Khi chúng ta cố gắng dịch ngược file `OuterClass.class`, command line sẽ in ra nội dung sau: `Parsing OuterClass.class...Parsing inner class OuterClass$InnerClass.class... Generating OuterClass.jad`. Nó sẽ dịch ngược cả hai file và tạo ra một file `OuterClass.jad`. Nội dung file như sau:

```java
public class OuterClass
{
    class InnerClass
    {
        public String getName()
        {
            return name;
        }
        public void setName(String name)
        {
            this.name = name;
        }
        private String name;
        final OuterClass this$0;

        InnerClass()
        {
            this.this$0 = OuterClass.this;
            super();
        }
    }

    public OuterClass()
    {
    }
    public String getUserName()
    {
        return userName;
    }
    public void setUserName(String userName){
        this.userName = userName;
    }
    public static void main(String args1[])
    {
    }
    private String userName;
}
```

**Tại sao inner class có thể sử dụng thuộc tính private của outer class**:

Chúng ta thêm một phương thức vào InnerClass để in thuộc tính userName của outer class

```java
//省略其他属性
public class OuterClass {
    private String userName;
    ......
    class InnerClass{
    ......
        public void printOut(){
            System.out.println("Username from OuterClass:"+userName);
        }
    }
}

// 此时，使用javap -p命令对OuterClass反编译结果：
public classOuterClass {
    private String userName;
    ......
    static String access$000(OuterClass);
}
// 此时，InnerClass的反编译结果：
class OuterClass$InnerClass {
    final OuterClass this$0;
    ......
    public void printOut();
}

```

Thực tế, sau khi biên dịch, bên trong instance của inner class sẽ có tham chiếu đến instance của outer class là `this$0`, nhưng việc truy cập thuộc tính private bằng cách đơn giản như `outer.name` là không thể. Từ kết quả dịch ngược, chúng ta có thể thấy rằng trong outer class sẽ có một bridge method (phương thức cầu nối) `static String access$000(OuterClass)`, trả về đúng kiểu String, tức là thuộc tính userName. Chính thông qua phương thức này mà inner class có thể truy cập thuộc tính private của outer class. Vì vậy, phương thức `printOut()` sau khi dịch ngược đại khái như sau:

```java
public void printOut() {
    System.out.println("Username from OuterClass:" + OuterClass.access$000(this.this$0));
}
```

Bổ sung:

1. Anonymous inner class (lớp nội ẩn danh), local inner class (lớp nội cục bộ), static inner class (lớp nội tĩnh) cũng sử dụng bridge method để lấy thuộc tính private.
2. Static inner class không có tham chiếu `this$0`
3. Anonymous inner class và local inner class sử dụng biến cục bộ bằng cách sao chép, biến đó sau khi khởi tạo không thể được sửa đổi. Dưới đây là một ví dụ:

```java
public class OuterClass {
    private String userName;

    public void test(){
        //这里i初始化为1后就不能再被修改
        int i=1;
        class Inner{
            public void printName(){
                System.out.println(userName);
                System.out.println(i);
            }
        }
    }
}
```

Sau khi dịch ngược:

```java
//javap命令反编译Inner的结果
//i被复制进内部类，且为final
class OuterClass$1Inner {
  final int val$i;
  final OuterClass this$0;
  OuterClass$1Inner();
  public void printName();
}

```

### Conditional Compilation (Biên dịch có điều kiện)

Thông thường, mỗi dòng code trong chương trình đều tham gia biên dịch. Nhưng đôi khi vì lý do tối ưu code, người ta muốn chỉ biên dịch một phần nội dung nhất định. Lúc này cần thêm điều kiện vào chương trình, để trình biên dịch chỉ biên dịch code thỏa mãn điều kiện và bỏ qua code không thỏa mãn. Đây gọi là conditional compilation.

Trong C hoặc CPP, có thể thực hiện conditional compilation thông qua preprocessor statements. Thực ra trong Java cũng có thể thực hiện conditional compilation. Hãy xem đoạn code dưới đây:

```java
public class ConditionalCompilation {
    public static void main(String[] args) {
        final boolean DEBUG = true;
        if(DEBUG) {
            System.out.println("Hello, DEBUG!");
        }

        final boolean ONLINE = false;

        if(ONLINE){
            System.out.println("Hello, ONLINE!");
        }
    }
}
```

Sau khi dịch ngược, code như sau:

```java
public class ConditionalCompilation
{

    public ConditionalCompilation()
    {
    }

    public static void main(String args[])
    {
        boolean DEBUG = true;
        System.out.println("Hello, DEBUG!");
        boolean ONLINE = false;
    }
}
```

Đầu tiên, chúng ta thấy rằng trong code sau khi dịch ngược không có `System.out.println("Hello, ONLINE!");`, đây thực chất là conditional compilation. Khi `if(ONLINE)` là false, trình biên dịch không biên dịch code bên trong nó.

Vì vậy, **conditional compilation trong cú pháp Java được thực hiện thông qua câu lệnh if có điều kiện là hằng số. Nguyên lý của nó cũng là syntactic sugar của ngôn ngữ Java. Dựa trên giá trị đúng/sai của điều kiện if, trình biên dịch loại bỏ trực tiếp khối code với nhánh false. Conditional compilation được thực hiện theo cách này phải được triển khai trong phần thân phương thức, và không thể thực hiện conditional compilation trên toàn bộ cấu trúc class Java hoặc thuộc tính class. So với conditional compilation trong C/C++, điều này có nhiều hạn chế hơn. Java không giới thiệu chức năng conditional compilation ngay từ đầu, tuy có hạn chế nhưng vẫn tốt hơn là không có.**

### Assertion (Khẳng định)

Trong Java, từ khóa `assert` được giới thiệu từ JAVA SE 1.4. Để tránh lỗi khi code Java cũ sử dụng từ khóa `assert`, Java mặc định không bật kiểm tra assertion khi thực thi (lúc này, tất cả các câu lệnh assertion sẽ bị bỏ qua!). Nếu muốn bật kiểm tra assertion, cần dùng switch `-enableassertions` hoặc `-ea` để bật.

Hãy xem đoạn code chứa assertion:

```java
public class AssertTest {
    public static void main(String args[]) {
        int a = 1;
        int b = 1;
        assert a == b;
        System.out.println("公众号：Hollis");
        assert a != b : "Hollis";
        System.out.println("博客：www.hollischuang.com");
    }
}
```

Sau khi dịch ngược, code như sau:

```java
public class AssertTest {
   public AssertTest()
    {
    }
    public static void main(String args[])
{
    int a = 1;
    int b = 1;
    if(!$assertionsDisabled && a != b)
        throw new AssertionError();
    System.out.println("公众号：Hollis");
    if(!$assertionsDisabled && a == b)
    {
        throw new AssertionError("Hollis");
    } else
    {
        System.out.println("博客：www.hollischuang.com");
        return;
    }
}

static final boolean $assertionsDisabled = !com/hollis/suguar/AssertTest.desiredAssertionStatus();

}
```

Rõ ràng là code sau khi dịch ngược phức tạp hơn nhiều so với code gốc của chúng ta. Vì vậy, khi sử dụng syntactic sugar assert này, chúng ta đã tiết kiệm được rất nhiều code. **Thực ra, bên dưới assertion là câu lệnh if. Nếu kết quả assertion là true, thì không làm gì cả, chương trình tiếp tục thực thi. Nếu kết quả assertion là false, chương trình sẽ ném AssertError để ngắt quá trình thực thi.** `-enableassertions` sẽ thiết lập giá trị trường \$assertionsDisabled.

### Numeric Literals (Ký hiệu số)

Trong Java 7, numeric literals, dù là số nguyên hay số thực dấu chấm động, đều cho phép chèn bất kỳ số lượng dấu gạch dưới nào giữa các chữ số. Những dấu gạch dưới này không ảnh hưởng đến giá trị của literal, mục đích chỉ là để dễ đọc.

Ví dụ:

```java
public class Test {
    public static void main(String... args) {
        int i = 10_000;
        System.out.println(i);
    }
}
```

Sau khi dịch ngược:

```java
public class Test
{
  public static void main(String[] args)
  {
    int i = 10000;
    System.out.println(i);
  }
}
```

Sau khi dịch ngược là xóa `_`. Tức là **trình biên dịch không nhận ra `_` trong numeric literal và cần loại bỏ nó trong giai đoạn biên dịch.**

### for-each

Enhanced for loop (`for-each`) chắc chắn không xa lạ với mọi người, thường được sử dụng trong phát triển hàng ngày, nó giúp viết ít code hơn so với vòng lặp for thông thường. Vậy syntactic sugar này được triển khai như thế nào phía sau?

```java
public static void main(String... args) {
    String[] strs = {"Hollis", "公众号：Hollis", "博客：www.hollischuang.com"};
    for (String s : strs) {
        System.out.println(s);
    }
    List<String> strList = ImmutableList.of("Hollis", "公众号：Hollis", "博客：www.hollischuang.com");
    for (String s : strList) {
        System.out.println(s);
    }
}
```

Sau khi dịch ngược, code như sau:

```java
public static transient void main(String args[])
{
    String strs[] = {
        "Hollis", "公众号：Hollis", "博客：www.hollischuang.com"
    };
    String args1[] = strs;
    int i = args1.length;
    for(int j = 0; j < i; j++)
    {
        String s = args1[j];
        System.out.println(s);
    }

    List strList = ImmutableList.of("Hollis", "公众号：Hollis", "博客：www.hollischuang.com");
    String s;
    for(Iterator iterator = strList.iterator(); iterator.hasNext(); System.out.println(s))
        s = (String)iterator.next();

}
```

Code rất đơn giản, **nguyên lý triển khai của for-each thực chất là sử dụng vòng lặp for thông thường và iterator.**

### try-with-resource

Trong Java, đối với các tài nguyên tốn kém như IO stream cho thao tác file, kết nối database, v.v., sau khi sử dụng xong phải đóng kịp thời bằng phương thức close, nếu không tài nguyên sẽ luôn ở trạng thái mở, có thể gây ra memory leak và các vấn đề khác.

Cách phổ biến để đóng tài nguyên là giải phóng trong khối `finally`, tức là gọi phương thức `close`. Ví dụ, chúng ta thường viết code như thế này:

```java
public static void main(String[] args) {
    BufferedReader br = null;
    try {
        String line;
        br = new BufferedReader(new FileReader("d:\\hollischuang.xml"));
        while ((line = br.readLine()) != null) {
            System.out.println(line);
        }
    } catch (IOException e) {
        // handle exception
    } finally {
        try {
            if (br != null) {
                br.close();
            }
        } catch (IOException ex) {
            // handle exception
        }
    }
}
```

Từ Java 7, JDK cung cấp một cách tốt hơn để đóng tài nguyên - sử dụng câu lệnh `try-with-resources`. Hãy viết lại đoạn code trên, kết quả như sau:

```java
public static void main(String... args) {
    try (BufferedReader br = new BufferedReader(new FileReader("d:\\ hollischuang.xml"))) {
        String line;
        while ((line = br.readLine()) != null) {
            System.out.println(line);
        }
    } catch (IOException e) {
        // handle exception
    }
}
```

Nhìn thật tuyệt vời, mặc dù trước đây tôi thường dùng `IOUtils` để đóng stream và không viết nhiều code trong `finally`, nhưng syntactic sugar mới này trông có vẻ thanh lịch hơn nhiều. Hãy xem bên dưới nó là gì:

```java
public static transient void main(String args[])
    {
        BufferedReader br;
        Throwable throwable;
        br = new BufferedReader(new FileReader("d:\\ hollischuang.xml"));
        throwable = null;
        String line;
        try
        {
            while((line = br.readLine()) != null)
                System.out.println(line);
        }
        catch(Throwable throwable2)
        {
            throwable = throwable2;
            throw throwable2;
        }
        finally
        {
            if(br != null)
                if(throwable != null)
                    try
                    {
                        br.close();
                    }
                    catch(Throwable throwable1)
                    {
                        throwable.addSuppressed(throwable1);
                    }
                else
                    br.close();
        }
    }
}
```

**Thực ra nguyên lý phía sau cũng rất đơn giản. Những thao tác đóng tài nguyên mà chúng ta không làm, trình biên dịch đã làm hộ chúng ta rồi. Vì vậy, điều này một lần nữa xác nhận rằng, tác dụng của syntactic sugar là để thuận tiện cho lập trình viên sử dụng, nhưng cuối cùng vẫn phải chuyển thành ngôn ngữ mà trình biên dịch hiểu được.**

### Lambda Expression

Về lambda expression, có người có thể nghi ngờ vì có người trên mạng nói nó không phải là syntactic sugar. Thực ra tôi muốn sửa lại quan điểm đó. **Lambda expression không phải là syntactic sugar của anonymous inner class, nhưng nó cũng là một loại syntactic sugar. Cách triển khai thực sự phụ thuộc vào một số lambda-related API được cung cấp ở tầng JVM.**

Hãy xem một lambda expression đơn giản. Duyệt qua một list:

```java
public static void main(String... args) {
    List<String> strList = ImmutableList.of("Hollis", "公众号：Hollis", "博客：www.hollischuang.com");

    strList.forEach( s -> { System.out.println(s); } );
}
```

Tại sao nói nó không phải là syntactic sugar của inner class? Như đã đề cập khi nói về inner class, sau khi biên dịch, inner class sẽ có hai file class. Nhưng class chứa lambda expression sau khi biên dịch chỉ có một file.

Sau khi dịch ngược, code như sau:

```java
public static /* varargs */ void main(String ... args) {
    ImmutableList strList = ImmutableList.of((Object)"Hollis", (Object)"公众号：Hollis", (Object)"博客：www.hollischuang.com");
    strList.forEach((Consumer<String>)LambdaMetafactory.metafactory(null, null, null, (Ljava/lang/Object;)V, lambda$main$0(java.lang.String ), (Ljava/lang/String;)V)());
}

private static /* synthetic */ void lambda$main$0(String s) {
    System.out.println(s);
}
```

Có thể thấy, trong phương thức `forEach`, thực ra là gọi phương thức `java.lang.invoke.LambdaMetafactory#metafactory`. Tham số thứ tư `implMethod` của phương thức này chỉ định cách triển khai phương thức. Có thể thấy ở đây thực ra đang gọi một phương thức `lambda$main$0` để thực hiện in.

Hãy xem một ví dụ phức tạp hơn một chút, lọc List trước rồi sau đó in ra:

```java
public static void main(String... args) {
    List<String> strList = ImmutableList.of("Hollis", "公众号：Hollis", "博客：www.hollischuang.com");

    List HollisList = strList.stream().filter(string -> string.contains("Hollis")).collect(Collectors.toList());

    HollisList.forEach( s -> { System.out.println(s); } );
}
```

Sau khi dịch ngược, code như sau:

```java
public static /* varargs */ void main(String ... args) {
    ImmutableList strList = ImmutableList.of((Object)"Hollis", (Object)"公众号：Hollis", (Object)"博客：www.hollischuang.com");
    List<Object> HollisList = strList.stream().filter((Predicate<String>)LambdaMetafactory.metafactory(null, null, null, (Ljava/lang/Object;)Z, lambda$main$0(java.lang.String ), (Ljava/lang/String;)Z)()).collect(Collectors.toList());
    HollisList.forEach((Consumer<Object>)LambdaMetafactory.metafactory(null, null, null, (Ljava/lang/Object;)V, lambda$main$1(java.lang.Object ), (Ljava/lang/Object;)V)());
}

private static /* synthetic */ void lambda$main$1(Object s) {
    System.out.println(s);
}

private static /* synthetic */ boolean lambda$main$0(String string) {
    return string.contains("Hollis");
}
```

Hai lambda expression lần lượt gọi phương thức `lambda$main$1` và `lambda$main$0`.

**Vì vậy, việc triển khai lambda expression thực sự phụ thuộc vào một số API tầng thấp. Trong giai đoạn biên dịch, trình biên dịch sẽ desugaring lambda expression, chuyển đổi thành cách gọi các API nội bộ.**

## Những cạm bẫy có thể gặp phải

### Generics

**Một, khi Generics gặp Overloading**

```java
public class GenericTypes {

    public static void method(List<String> list) {
        System.out.println("invoke method(List<String> list)");
    }

    public static void method(List<Integer> list) {
        System.out.println("invoke method(List<Integer> list)");
    }
}
```

Đoạn code trên có hai hàm overloaded vì kiểu tham số của chúng khác nhau, một là `List<String>` và một là `List<Integer>`. Nhưng đoạn code này không thể biên dịch được. Vì như đã đề cập trước đó, tham số `List<Integer>` và `List<String>` sau khi biên dịch đều bị xóa, trở thành cùng một kiểu raw List. Thao tác xóa này làm cho chữ ký của hai phương thức này trở nên giống hệt nhau.

**Hai, khi Generics gặp catch**

Tham số kiểu của generic không thể được sử dụng trong câu lệnh catch của xử lý ngoại lệ Java. Vì xử lý ngoại lệ được JVM thực hiện tại runtime. Do thông tin kiểu bị xóa, JVM không thể phân biệt hai kiểu ngoại lệ `MyException<String>` và `MyException<Integer>`.

**Ba, khi Generics chứa biến static**

```java
public class StaticTest{
    public static void main(String[] args){
        GT<Integer> gti = new GT<Integer>();
        gti.var=1;
        GT<String> gts = new GT<String>();
        gts.var=2;
        System.out.println(gti.var);
    }
}
class GT<T>{
    public static int var=0;
    public void nothing(T x){}
}
```

Kết quả đầu ra của đoạn code trên là: 2!

Một số bạn có thể lầm tưởng rằng các class generic là các class khác nhau, tương ứng với bytecode khác nhau. Thực ra do type erasure, tất cả các instance của class generic đều liên kết với cùng một bytecode, biến static của class generic là được chia sẻ. `GT<Integer>.var` và `GT<String>.var` trong ví dụ trên thực chất là cùng một biến.

### Autoboxing và Unboxing

**So sánh đối tượng bằng nhau**

```java
public static void main(String[] args) {
    Integer a = 1000;
    Integer b = 1000;
    Integer c = 100;
    Integer d = 100;
    System.out.println("a == b is " + (a == b));
    System.out.println(("c == d is " + (c == d)));
}
```

Kết quả đầu ra:

```plain
a == b is false
c == d is true
```

Trong Java 5, một tính năng mới được giới thiệu trong các thao tác Integer để tiết kiệm bộ nhớ và cải thiện hiệu suất. Các đối tượng kiểu số nguyên thực hiện cache và tái sử dụng thông qua cùng một tham chiếu đối tượng.

> Áp dụng cho phạm vi giá trị nguyên từ -128 đến +127.
>
> Chỉ áp dụng cho autoboxing. Không áp dụng cho các đối tượng được tạo bằng constructor.

### Enhanced for loop

```java
for (Student stu : students) {
    if (stu.getId() == 2)
        students.remove(stu);
}
```

Sẽ ném ngoại lệ `ConcurrentModificationException`.

Điều này liên quan đến cơ chế **fail-fast (thất bại nhanh)** của collection. Lấy `ArrayList` làm ví dụ, nó nội bộ duy trì một bộ đếm `modCount`, mỗi khi cấu trúc collection được sửa đổi (chẳng hạn thêm, xóa) thì bộ đếm này sẽ tăng lên. Khi tạo `Iterator`, `modCount` hiện tại sẽ được ghi lại là `expectedModCount`. Mỗi lần gọi `next()`, `Iterator` sẽ kiểm tra xem `modCount` có bằng `expectedModCount` không. Nếu không bằng, có nghĩa là collection đã bị sửa đổi theo cách khác trong quá trình duyệt, và `java.util.ConcurrentModificationException` sẽ bị ném.

Vì vậy, `Iterator` không cho phép đối tượng đang được duyệt bị thay đổi khi nó đang hoạt động. Nhưng bạn có thể sử dụng phương thức `remove()` của chính `Iterator` để xóa đối tượng. Phương thức `Iterator.remove()` sẽ cập nhật đồng bộ `expectedModCount` sau khi xóa phần tử, từ đó tránh kích hoạt ngoại lệ này.

## Tóm tắt

Phần trên đã giới thiệu 12 loại syntactic sugar phổ biến trong Java. Syntactic sugar chỉ là một loại cú pháp được cung cấp để thuận tiện cho các lập trình viên phát triển. Nhưng những cú pháp này chỉ được lập trình viên nhận biết. Để có thể thực thi, cần phải desugaring, tức là chuyển thành cú pháp mà JVM hiểu được. Khi chúng ta desugaring các syntactic sugar, bạn sẽ thấy rằng những cú pháp tiện lợi mà chúng ta dùng hàng ngày thực ra đều được tạo thành từ những cú pháp đơn giản hơn khác.

Với những syntactic sugar này, chúng ta có thể tăng hiệu suất đáng kể trong quá trình phát triển hàng ngày, nhưng đồng thời cũng phải tránh lạm dụng chúng. Tốt nhất là hiểu nguyên lý trước khi sử dụng, để tránh sa vào bẫy.

<!-- @include: @article-footer.snippet.md -->
