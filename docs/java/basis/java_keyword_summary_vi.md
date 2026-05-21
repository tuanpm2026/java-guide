---
title: Tóm Tắt Các Từ Khóa Java
description: Tóm tắt toàn diện các từ khóa Java thường dùng giải thích chi tiết cách sử dụng từ khóa final, static, this, super, volatile, transient, synchronized, hỗ trợ các lập trình viên Java nắm vững cú pháp cốt lõi.
category: Java
tag:
  - Java Cơ Bản
head:
  - - meta
    - name: keywords
      content: từ khóa Java, từ khóa final, từ khóa static, từ khóa this, từ khóa super, volatile, transient, synchronized
---

# Tóm Tắt Từ Khóa final, static, this, super

## Từ Khóa final

**Từ khóa final có nghĩa là cuối cùng, không thể sửa đổi, ghét thay đổi nhất, được sử dụng để sửa đổi lớp, phương thức và biến, có các đặc điểm sau:**

1. Lớp được sửa đổi bằng final không thể được kế thừa, tất cả các phương thức thành viên trong lớp final sẽ được ngầm chỉ định là phương thức final;

2. Phương thức được sửa đổi bằng final không thể được ghi đè;

3. Biến được sửa đổi bằng final là hằng số, nếu là biến kiểu dữ liệu cơ bản, giá trị sẽ không thể thay đổi sau khi khởi tạo; nếu là biến kiểu tham chiếu, không thể tham chiếu đến một đối tượng khác sau khi khởi tạo.

Giải thích: Lý do sử dụng phương thức final có hai:

1. Khóa phương thức, để tránh bất kỳ lớp kế thừa nào sửa đổi ý nghĩa của nó;
2. Hiệu năng. Trong các phiên bản Java ban đầu, sẽ chuyển đổi phương thức final thành lệnh gọi nội tuyến. Tuy nhiên, nếu phương thức quá lớn, có thể sẽ không thấy cải thiện hiệu năng nào từ lệnh gọi nội tuyến (trong các phiên bản Java hiện tại, không cần sử dụng phương thức final để tối ưu hóa này).

## Từ Khóa static

**Từ khóa static chủ yếu có bốn trường hợp sử dụng:**

1. **Sửa đổi biến thành viên và phương thức thành viên:** Các thành viên được sửa đổi bằng static thuộc về lớp, không thuộc về bất kỳ đối tượng nào của lớp này, được chia sẻ bởi tất cả các đối tượng trong lớp, có thể và nên được gọi thông qua tên lớp. Biến được khai báo bằng static thuộc về biến thành viên tĩnh, biến tĩnh được lưu trữ trong khu vực bộ nhớ phương thức của Java. Định dạng gọi: `Tên_Lớp.Tên_Biến_Tĩnh` hoặc `Tên_Lớp.Tên_Phương_Thức_Tĩnh()`

2. **Khối Mã Tĩnh:** Khối mã tĩnh được định nghĩa bên trong lớp nhưng bên ngoài phương thức, khối mã tĩnh được thực thi trước khối mã không tĩnh (khối mã tĩnh→khối mã không tĩnh→hàm tạo). Bất kể lớp tạo bao nhiêu đối tượng, khối mã tĩnh chỉ được thực thi một lần.

3. **Lớp Bên Trong Tĩnh (static chỉ có thể sửa đổi lớp bên trong):** Sự khác biệt lớn nhất giữa lớp bên trong tĩnh và không tĩnh: lớp bên trong không tĩnh sau khi biên dịch xong sẽ ngầm lưu giữ một tham chiếu, tham chiếu này chỉ đến lớp bên ngoài mà tạo nó, nhưng lớp bên trong tĩnh không có. Không có tham chiếu này có nghĩa là: 1. Tạo nó không cần phụ thuộc vào tạo lớp bên ngoài. 2. Nó không thể sử dụng bất kỳ biến thành viên không tĩnh và phương thức không tĩnh nào của lớp bên ngoài.

4. **Nhập Tĩnh (sử dụng để nhập tài nguyên tĩnh, tính năng mới sau 1.5):** Định dạng: `import static` Hai từ khóa này được sử dụng cùng nhau có thể chỉ định nhập tài nguyên tĩnh cụ thể từ một lớp, không cần sử dụng tên lớp để gọi các thành viên tĩnh trong lớp, có thể sử dụng trực tiếp biến thành viên tĩnh và phương thức thành viên tĩnh của lớp.

## Từ Khóa this

Từ khóa this được sử dụng để tham chiếu đến phiên bản hiện tại của lớp. Ví dụ:

```java
class Manager {
    Employees[] employees;
    void manageEmployees() {
        int totalEmp = this.employees.length;
        System.out.println("Total employees: " + totalEmp);
        this.report();
    }
    void report() { }
}
```

Trong ví dụ trên, từ khóa this được sử dụng ở hai nơi:

- this.employees.length: Truy cập biến của phiên bản hiện tại của lớp Manager.
- this.report(): Gọi phương thức của phiên bản hiện tại của lớp Manager.

Từ khóa này là tùy chọn, có nghĩa là nếu không sử dụng từ khóa này, ví dụ trên sẽ hoạt động tương tự. Tuy nhiên, sử dụng từ khóa này có thể làm cho mã dễ đọc hoặc dễ hiểu hơn.

## Từ Khóa super

Từ khóa super được sử dụng để truy cập biến và phương thức của lớp cha từ lớp con. Ví dụ:

```java
public class Super {
    protected int number;
    protected void showNumber() {
        System.out.println("number = " + number);
    }
}
public class Sub extends Super {
    void bar() {
        super.number = 10;
        super.showNumber();
    }
}
```

Trong ví dụ trên, lớp Sub truy cập biến thành viên `number` của lớp cha và gọi phương thức `showNumber()` của lớp cha `Super`.

**Vấn Đề Cần Lưu Ý Khi Sử Dụng this Và super:**

- Khi sử dụng `super()` trong hàm tạo để gọi hàm tạo khác trong lớp cha, câu lệnh này phải ở vị trí đầu tiên của hàm tạo, nếu không trình biên dịch sẽ báo lỗi. Ngoài ra, khi gọi `this` để gọi hàm tạo khác trong cùng một lớp, cũng phải đặt ở vị trí đầu tiên.
- this, super không thể được sử dụng trong các phương thức static.

**Giải Thích Đơn Giản:**

Các thành viên được sửa đổi bằng static thuộc về lớp, không thuộc về bất kỳ đối tượng nào của lớp này, được chia sẻ bởi tất cả các đối tượng trong lớp. Trong khi this đại diện cho tham chiếu đến đối tượng của lớp này, chỉ vào đối tượng của lớp này; trong khi super đại diện cho tham chiếu đến đối tượng của lớp cha, chỉ vào đối tượng của lớp cha; vì vậy, **this và super thuộc về phạm vi đối tượng, trong khi phương thức tĩnh thuộc về phạm vi lớp**.

## Tài Liệu Tham Khảo

- <https://www.codejava.net/java-core/the-java-language/java-keywords>
- <https://blog.csdn.net/u013393958/article/details/79881037>

# Giải Thích Chi Tiết Từ Khóa static

## Bốn Trường Hợp Sử Dụng Chính Của Từ Khóa static

1. Sửa đổi biến thành viên và phương thức thành viên
2. Khối Mã Tĩnh
3. Sửa đổi lớp (chỉ có thể sửa đổi lớp bên trong)
4. Nhập Tĩnh (sử dụng để nhập tài nguyên tĩnh, tính năng mới sau 1.5)

### Sửa Đổi Biến Thành Viên Và Phương Thức Thành Viên (Thường Dùng)

Các thành viên được sửa đổi bằng static thuộc về lớp, không thuộc về bất kỳ đối tượng nào của lớp này, được chia sẻ bởi tất cả các đối tượng trong lớp, có thể và nên được gọi thông qua tên lớp. Biến được khai báo bằng static thuộc về biến thành viên tĩnh, biến tĩnh được lưu trữ trong khu vực bộ nhớ phương thức của Java.

Khu vực phương thức cũng giống như heap, là khu vực bộ nhớ được chia sẻ của luồng, nó được sử dụng để lưu trữ thông tin lớp đã được máy ảo Java tải, hằng số, biến tĩnh, dữ liệu đã được biên dịch ngay của trình biên dịch và các dữ liệu khác. Mặc dù thông số kỹ thuật máy ảo Java mô tả khu vực phương thức là một phần logic của heap, nhưng nó có một biệt danh khác được gọi là Non-Heap (không phải heap), mục đích là để phân biệt với khu vực heap của Java.

Trong máy ảo HotSpot, khu vực phương thức còn thường được gọi là "Permanent Generation", về bản chất hai cái này không tương đương. Chỉ là vì đội phát triển máy ảo HotSpot sử dụng permanent generation để triển khai khu vực phương thức mà thôi, điều này cho phép bộ thu gom rác của máy ảo HotSpot quản lý phần bộ nhớ này giống như quản lý heap của Java. Tuy nhiên, đây không phải là một ý tưởng tốt, vì nó dễ gặp phải vấn đề tràn bộ nhớ hơn.

Định dạng gọi:

- `Tên_Lớp.Tên_Biến_Tĩnh`
- `Tên_Lớp.Tên_Phương_Thức_Tĩnh()`

Nếu biến hoặc phương thức được sửa đổi bằng private, biểu thị rằng thuộc tính hoặc phương thức này chỉ có thể được truy cập bên trong lớp, không thể được truy cập bên ngoài lớp.

Phương pháp kiểm tra:

```java
public class StaticBean {
    String name;
    // Biến tĩnh
    static int age;
    public StaticBean(String name) {
        this.name = name;
    }
    // Phương thức tĩnh
    static void sayHello() {
        System.out.println("Hello i am java");
    }
    @Override
    public String toString() {
        return "StaticBean{"+
                "name=" + name + ",age=" + age +
                "}";
    }
}
```

```java
public class StaticDemo {
    public static void main(String[] args) {
        StaticBean staticBean = new StaticBean("1");
        StaticBean staticBean2 = new StaticBean("2");
        StaticBean staticBean3 = new StaticBean("3");
        StaticBean staticBean4 = new StaticBean("4");
        StaticBean.age = 33;
        System.out.println(staticBean + " " + staticBean2 + " " + staticBean3 + " " + staticBean4);
        // StaticBean{name=1,age=33} StaticBean{name=2,age=33} StaticBean{name=3,age=33} StaticBean{name=4,age=33}
        StaticBean.sayHello();// Hello i am java
    }
}
```

### Khối Mã Tĩnh

Khối mã tĩnh được định nghĩa bên trong lớp nhưng bên ngoài phương thức, khối mã tĩnh được thực thi trước khối mã không tĩnh (khối mã tĩnh → khối mã không tĩnh → hàm tạo). Bất kể lớp tạo bao nhiêu đối tượng, khối mã tĩnh chỉ được thực thi một lần.

Định dạng của khối mã tĩnh:

```plain
static {
Nội dung câu lệnh;
}
```

Có thể có nhiều khối mã tĩnh trong một lớp, vị trí có thể được đặt ở bất cứ đâu, nó không nằm trong bất kỳ phương thức nào, JVM sẽ thực thi các khối mã tĩnh này khi tải lớp, nếu có nhiều khối mã tĩnh, JVM sẽ thực thi chúng theo thứ tự xuất hiện trong lớp một cách tuần tự, mỗi khối mã chỉ được thực thi một lần.

Khối mã tĩnh có thể gán giá trị cho biến tĩnh được định nghĩa sau nó, nhưng không thể truy cập.

### Lớp Bên Trong Tĩnh

Sự khác biệt lớn nhất giữa lớp bên trong tĩnh và không tĩnh, chúng ta biết rằng lớp bên trong không tĩnh sau khi biên dịch xong sẽ ngầm lưu giữ một tham chiếu, tham chiếu này chỉ đến lớp bên ngoài mà tạo nó, nhưng lớp bên trong tĩnh không có. Không có tham chiếu này có nghĩa là:

1. Tạo nó không cần phụ thuộc vào tạo lớp bên ngoài.
2. Nó không thể sử dụng bất kỳ biến thành viên không tĩnh và phương thức không tĩnh nào của lớp bên ngoài.

Ví dụ (triển khai mẫu singleton bằng lớp bên trong tĩnh)

```java
public class Singleton {
    // Khai báo là private để tránh gọi hàm tạo mặc định để tạo đối tượng
    private Singleton() {
    }
    // Khai báo là private chỉ ra rằng lớp bên trong tĩnh này chỉ có thể được truy cập trong lớp Singleton này
    private static class SingletonHolder {
        private static final Singleton INSTANCE = new Singleton();
    }
    public static Singleton getUniqueInstance() {
        return SingletonHolder.INSTANCE;
    }
}
```

Khi lớp Singleton được tải, lớp bên trong tĩnh SingletonHolder chưa được tải vào bộ nhớ. Chỉ khi gọi phương thức `getUniqueInstance()` từ đó kích hoạt `SingletonHolder.INSTANCE`, SingletonHolder mới được tải, lúc này khởi tạo phiên bản INSTANCE, và máy ảo Java có thể đảm bảo rằng INSTANCE chỉ được khởi tạo một lần duy nhất.

Cách tiếp cận này không chỉ có lợi ích của khởi tạo chậm, mà còn được bảo vệ bởi bảo vệ an toàn luồng được cung cấp bởi máy ảo Java.

### Nhập Tĩnh

Định dạng: import static

Hai từ khóa này được sử dụng cùng nhau có thể chỉ định nhập tài nguyên tĩnh cụ thể từ một lớp, không cần sử dụng tên lớp để gọi các thành viên tĩnh trong lớp, có thể sử dụng trực tiếp biến thành viên tĩnh và phương thức thành viên tĩnh của lớp

```java
 // Nhập tất cả tài nguyên tĩnh của Math, lúc này có thể sử dụng trực tiếp các phương thức tĩnh bên trong mà không cần gọi thông qua tên lớp
 // Nếu chỉ muốn nhập một phương thức tĩnh cụ thể nào đó, chỉ cần thay thế * bằng tên phương thức tương ứng
import static java.lang.Math.*;// Hoặc thay đổi thành import static java.lang.Math.max; để nhập một phương thức tĩnh cụ thể max
public class Demo {
  public static void main(String[] args) {
    int max = max(1,2);
    System.out.println(max);
  }
}
```

## Nội Dung Bổ Sung

### Phương Thức Tĩnh Và Phương Thức Không Tĩnh

Phương thức tĩnh thuộc về lớp chính nó, phương thức không tĩnh thuộc về mỗi đối tượng được tạo từ lớp. Nếu phương thức của bạn thực hiện một thao tác không phụ thuộc vào các biến của lớp, hãy đặt nó thành tĩnh (điều này sẽ làm cho footprint của chương trình nhỏ hơn). Ngược lại, nó nên không tĩnh.

Ví dụ

```java
class Foo {
    int i;
    public Foo(int i) {
       this.i = i;
    }
    public static String method1() {
       return "An example string that doesn't depend on i (an instance variable)";
    }
    public int method2() {
       return this.i + 1;  //Phụ thuộc vào i
    }
}
```

Bạn có thể gọi phương thức tĩnh theo cách này: `Foo.method1()`. Nếu bạn cố gắng gọi method2 theo cách này sẽ không thành công. Nhưng cách này sẽ hoạt động

```java
Foo bar = new Foo(1);
bar.method2();
```

Tóm tắt:

- Khi gọi phương thức tĩnh bên ngoài, có thể sử dụng cách "Tên*Lớp.Tên_Phương_Thức" hoặc cách "Tên*Đối_Tượng.Tên_Phương_Thức". Trong khi phương thức non-static chỉ có thể sử dụng cách sau. Nói cách khác, gọi phương thức tĩnh có thể không cần tạo đối tượng.
- Khi phương thức tĩnh truy cập các thành viên của lớp, chỉ cho phép truy cập các thành viên tĩnh (tức là biến thành viên tĩnh và phương thức tĩnh), không cho phép truy cập biến thành viên non-static và phương thức non-static; phương thức non-static không có hạn chế này.

### `static{}` Khối Mã Tĩnh Và `{}` Khối Mã Không Tĩnh (Khối Mã Tạo)

Điểm giống nhau: cả hai đều được thực thi khi JVM tải lớp và trước khi hàm tạo được thực thi, có thể xác định nhiều cái trong một lớp, khi xác định nhiều cái sẽ được thực thi theo thứ tự xác định, thường trong khối mã sẽ gán giá trị cho một số biến static.

Điểm khác biệt: khối mã tĩnh được thực thi trước khối mã không tĩnh (khối mã tĩnh -> khối mã không tĩnh -> hàm tạo). Khối mã tĩnh chỉ thực thi lần đầu new một lần, sau đó không thực thi nữa, trong khi khối mã không tĩnh sẽ thực thi mỗi lần new một lần. Khối mã không tĩnh có thể được định nghĩa trong các phương thức thông thường (tuy nhiên việc làm này không có ích lắm); trong khi khối mã tĩnh không thể.

> **🐛 Sửa Lỗi (tham khảo [issue #677](https://github.com/Snailclimb/JavaGuide/issues/677))**: Khối mã tĩnh có thể được thực thi khi first new đối tượng, nhưng không nhất thiết chỉ khi first new. Ví dụ, khi tạo đối tượng Class thông qua `Class.forName("ClassDemo")` cũng sẽ thực thi, tức là new hoặc `Class.forName("ClassDemo")` đều sẽ thực thi khối mã tĩnh.
> Nhìn chung, nếu có một số code như ví dụ các biến hoặc đối tượng phổ biến nhất trong dự án phải được thực thi khi dự án khởi động, cần sử dụng khối mã tĩnh, code này được thực thi chủ động. Nếu chúng ta muốn thiết kế các phương thức không cần tạo đối tượng mà có thể được gọi trực tiếp trên lớp, ví dụ: `Arrays` lớp, `Character` lớp, `String` lớp, v.v., chúng ta cần sử dụng phương thức tĩnh, sự khác biệt của hai cái là khối mã tĩnh được thực thi tự động trong khi phương thức tĩnh được thực thi khi được gọi.

Ví dụ:

```java
public class Test {
    public Test() {
        System.out.print("Hàm tạo mặc định！--");
    }
    // Khối mã không tĩnh
    {
        System.out.print("Khối mã không tĩnh！--");
    }
    // Khối mã tĩnh
    static {
        System.out.print("Khối mã tĩnh！--");
    }
    private static void test() {
        System.out.print("Nội dung trong phương thức tĩnh! --");
        {
            System.out.print("Khối mã trong phương thức tĩnh！--");
        }
    }
    public static void main(String[] args) {
        Test test = new Test();
        Test.test();// Khối mã tĩnh！--Nội dung trong phương thức tĩnh! --Khối mã trong phương thức tĩnh！--
    }
}
```

Đầu ra của đoạn code trên:

```plain
Khối mã tĩnh！--Khối mã không tĩnh！--Hàm tạo mặc định！--Nội dung trong phương thức tĩnh! --Khối mã trong phương thức tĩnh！--
```

Khi chỉ thực thi `Test.test();` đầu ra là:

```plain
Khối mã tĩnh！--Nội dung trong phương thức tĩnh! --Khối mã trong phương thức tĩnh！--
```

Khi chỉ thực thi `Test test = new Test();` đầu ra là:

```plain
Khối mã tĩnh！--Khối mã không tĩnh！--Hàm tạo mặc định！--
```

Sự khác biệt giữa khối mã không tĩnh và hàm tạo là: khối mã không tĩnh là khởi tạo thống nhất cho tất cả các đối tượng, trong khi hàm tạo là khởi tạo cho đối tượng tương ứng, vì hàm tạo có thể có nhiều cái, chạy hàm tạo nào sẽ xây dựng loại đối tượng gì, nhưng bất kể xây dựng loại đối tượng nào, khối mã tạo không tĩnh phải được thực thi trước. Nói cách khác, nội dung được định nghĩa trong khối mã tạo không tĩnh là nội dung khởi tạo chung của các đối tượng khác nhau.

### Tài Liệu Tham Khảo

- <https://blog.csdn.net/chen13579867831/article/details/78995480>
- <https://www.cnblogs.com/chenssy/p/3388487.html>
- <https://www.cnblogs.com/Qian123/p/5713440.html>
