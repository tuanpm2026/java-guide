---
title: Giải Thích Chi Tiết Java Chỉ Có Truyền Giá Trị
description: Giải thích chi tiết tại sao Java chỉ có truyền giá trị thông qua ví dụ phân tích sâu cơ chế truyền tham số Java, làm rõ các hiểu lầm thường gặp về truyền giá trị và truyền tham chiếu, hiểu được sự khác biệt cốt lõi giữa tham số hình thức và tham số thực tế.
category: Java
tag:
  - Java Cơ Bản
head:
  - - meta
    - name: keywords
      content: truyền giá trị Java, truyền tham chiếu, truyền tham số, tham số hình thức, tham số thực tế, gọi phương thức, cơ chế truyền tham số
---

Trước tiên, chúng ta hãy làm rõ hai khái niệm dưới đây:

- Tham số hình thức & Tham số thực tế
- Truyền giá trị & Truyền tham chiếu

## Tham Số Hình Thức & Tham Số Thực Tế

Định nghĩa của phương thức có thể sử dụng **tham số** (phương thức có tham số), tham số trong ngôn ngữ lập trình được chia thành:

- **Tham Số Thực Tế (Arguments)**: Tham số được truyền cho hàm/phương thức, phải có giá trị nhất định.
- **Tham Số Hình Thức (Parameters)**: Được sử dụng để định nghĩa hàm/phương thức, nhận tham số thực tế, không cần có giá trị nhất định.

```java
String hello = "Hello!";
// hello là tham số thực tế
sayHello(hello);
// str là tham số hình thức
void sayHello(String str) {
    System.out.println(str);
}
```

## Truyền Giá Trị & Truyền Tham Chiếu

Những cách mà ngôn ngữ lập trình truyền tham số thực tế cho phương thức (hoặc hàm) được chia thành hai loại:

- **Truyền Giá Trị**: Phương thức nhận được bản sao của giá trị tham số thực tế, sẽ tạo ra bản sao.
- **Truyền Tham Chiếu**: Phương thức nhận được trực tiếp địa chỉ của tham số thực tế, không phải giá trị bên trong tham số thực tế, đây là con trỏ, lúc này tham số hình thức chính là tham số thực tế, bất kỳ sửa đổi nào đối với tham số hình thức sẽ phản ánh vào tham số thực tế, bao gồm gán lại giá trị.

Rất nhiều ngôn ngữ lập trình (ví dụ như C++, Pascal) cung cấp hai cách truyền tham số, tuy nhiên, trong Java chỉ có truyền giá trị.

## Tại Sao Java Chỉ Có Truyền Giá Trị?

**Tại Sao Nói Java Chỉ Có Truyền Giá Trị Hả?** Không cần lời nói thừa, tôi sẽ chứng minh điều này thông qua 3 ví dụ.

### Ví Dụ 1: Truyền Tham Số Kiểu Dữ Liệu Cơ Bản

Mã code:

```java
public static void main(String[] args) {
    int num1 = 10;
    int num2 = 20;
    swap(num1, num2);
    System.out.println("num1 = " + num1);
    System.out.println("num2 = " + num2);
}

public static void swap(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
    System.out.println("a = " + a);
    System.out.println("b = " + b);
}
```

Đầu ra:

```plain
a = 20
b = 10
num1 = 10
num2 = 20
```

Giải thích:

Trong phương thức `swap()`, giá trị của `a`, `b` được hoán đổi, nhưng sẽ không ảnh hưởng đến `num1`, `num2`. Vì giá trị của `a`, `b` chỉ được sao chép từ `num1`, `num2`. Nói cách khác, a, b giống như bản sao của `num1`, `num2`, bất kỳ sửa đổi nào đối với nội dung của bản sao cũng sẽ không ảnh hưởng đến bản gốc.

Thông qua ví dụ trên, chúng ta đã biết rằng một phương thức không thể sửa đổi một tham số kiểu dữ liệu cơ bản, trong khi đối tượng tham chiếu truyền vào lại khác, hãy xem ví dụ 2.

### Ví Dụ 2: Truyền Tham Số Kiểu Tham Chiếu 1

Mã code:

```java
  public static void main(String[] args) {
      int[] arr = { 1, 2, 3, 4, 5 };
      System.out.println(arr[0]);
      change(arr);
      System.out.println(arr[0]);
  }

  public static void change(int[] array) {
      // Đổi phần tử đầu tiên của mảng thành 0
      array[0] = 0;
  }
```

Đầu ra:

```plain
1
0
```

Giải thích:

Nhìn vào ví dụ này, rất nhiều người chắc chắn cảm thấy Java truyền tham số kiểu tham chiếu là truyền tham chiếu.

Thực tế, không phải như vậy, tham số được truyền ở đây vẫn là giá trị, chỉ là giá trị này là địa chỉ của tham số thực tế mà thôi!

Nói cách khác, tham số của phương thức `change` sao chép địa chỉ của `arr` (tham số thực tế), do đó nó và `arr` chỉ cùng một đối tượng mảng. Điều này cũng giải thích tại sao sửa đổi của tham số hình thức trong phương thức sẽ ảnh hưởng đến tham số thực tế.

Để phản bác mạnh mẽ hơn rằng Java truyền tham số kiểu tham chiếu không phải là truyền tham chiếu, hãy xem ví dụ tiếp theo!

### Ví Dụ 3: Truyền Tham Số Kiểu Tham Chiếu 2

```java
public class Person {
    private String name;
   // Bỏ qua hàm tạo, getter & setter
}

public static void main(String[] args) {
    Person xiaoZhang = new Person("Tiểu Trương");
    Person xiaoLi = new Person("Tiểu Lý");
    swap(xiaoZhang, xiaoLi);
    System.out.println("xiaoZhang:" + xiaoZhang.getName());
    System.out.println("xiaoLi:" + xiaoLi.getName());
}

public static void swap(Person person1, Person person2) {
    Person temp = person1;
    person1 = person2;
    person2 = temp;
    System.out.println("person1:" + person1.getName());
    System.out.println("person2:" + person2.getName());
}
```

Đầu ra:

```plain
person1:Tiểu Lý
person2:Tiểu Trương
xiaoZhang:Tiểu Trương
xiaoLi:Tiểu Lý
```

Giải thích:

Chuyện gì vậy??? Hai biến tham số hình thức kiểu tham chiếu được hoán đổi, nhưng vẫn không ảnh hưởng đến tham số thực tế nhỉ!

Tham số `person1` và `person2` của phương thức `swap` chỉ là sao chép của địa chỉ của tham số thực tế `xiaoZhang` và `xiaoLi`. Do đó, hoán đổi `person1` và `person2` chỉ là hoán đổi hai địa chỉ sao chép mà thôi, sẽ không ảnh hưởng đến tham số thực tế `xiaoZhang` và `xiaoLi`.

## Truyền Tham Chiếu Như Thế Nào?

Nhìn đến đây, chúng tôi tin chắc rằng trong Java chỉ có truyền giá trị, không có truyền tham chiếu. Nhưng truyền tham chiếu thực sự trông như thế nào? Dưới đây, để tiêu chí với code của `C++` làm ví dụ, cho bạn thấy lộ diện của truyền tham chiếu.

```C++
#include <iostream>

void incr(int& num)
{
    std::cout << "incr before: " << num << "\n";
    num++;
    std::cout << "incr after: " << num << "\n";
}

int main()
{
    int age = 10;
    std::cout << "invoke before: " << age << "\n";
    incr(age);
    std::cout << "invoke after: " << age << "\n";
}
```

Kết quả đầu ra:

```plain
invoke before: 10
incr before: 10
incr after: 11
invoke after: 11
```

Phân tích: Có thể thấy rằng sửa đổi của tham số hình thức trong hàm `incr` có thể ảnh hưởng đến giá trị của tham số thực tế. Lưu ý: ở đây kiểu dữ liệu của tham số hình thức trong hàm `incr` là `int&` thì mới là truyền tham chiếu, nếu là `int` thì vẫn là truyền giá trị nhé!

## Tại Sao Java Lại Không Đưa Vào Truyền Tham Chiếu Hả?

Truyền tham chiếu có vẻ rất tốt, có thể sửa đổi trực tiếp giá trị của tham số thực tế bên trong phương thức, nhưng tại sao Java lại không đưa vào truyền tham chiếu hả?

**Lưu ý: Những điều dưới đây là quan điểm cá nhân, không phải từ phía chính thức Java:**

1. Vì lý do bảo mật, các hoạt động đối với giá trị bên trong phương thức, đều là chưa biết đối với người gọi (định nghĩa phương thức thành giao diện, người gọi không quan tâm đến cách triển khai cụ thể). Bạn cũng tưởng tượng một cách khác, nếu bạn sử dụng thẻ ngân hàng để rút tiền, rút ra là 100, bị trừ 200, có phải là rất đáng sợ không.
2. James Gosling, cha đẻ của Java, khi thiết kế Java, đã nhìn thấy nhiều điểm yếu của C, C++, vì vậy mới muốn thiết kế một ngôn ngữ lập trình mới—Java. Khi thiết kế Java, ông đã tuân theo nguyên tắc đơn giản và dễ sử dụng, loại bỏ nhiều tính năng "khó gây ra sự cố" nếu lập trình viên không cẩn thận, ngôn ngữ chính nó ít, điều mà lập trình viên phải học cũng ít.

## Tóm Tắt

Cách truyền tham số thực tế cho phương thức (hoặc hàm) trong Java là **truyền giá trị**:

- Nếu tham số là kiểu dữ liệu cơ bản, rất đơn giản, truyền chính là bản sao của giá trị theo ngôn ngữ của kiểu dữ liệu cơ bản, sẽ tạo ra bản sao.
- Nếu tham số là kiểu tham chiếu, truyền là bản sao của giá trị địa chỉ của đối tượng mà tham số thực tế tham chiếu đến trong heap, tương tự cũng sẽ tạo ra bản sao.

## Tài Liệu Tham Khảo

- "Java Công Nghệ Cốt Lõi Tập I" - Kiến Thức Cơ Bản Phiên Bản Thứ Mười Chương 4, Phần 4.5
- [Java Cuối Cùng Có Phải Là Truyền Giá Trị Hay Truyền Tham Chiếu? - Câu Trả Lời Của Hollis - Zhihu](https://www.zhihu.com/question/31203609/answer/576030121)
- [Oracle Java Tutorials - Passing Information to a Method or a Constructor](https://docs.oracle.com/javase/tutorial/java/javaOO/arguments.html)
- [Interview with James Gosling, Father of Java](https://mappingthejourney.com/single-post/2017/06/29/episode-3-interview-with-james-gosling-father-of-java/)
