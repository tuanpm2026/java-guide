---
title: Giải thích chi tiết truyền giá trị trong Java
description: Giải thích chi tiết tại sao Java chỉ có truyền giá trị: thông qua ví dụ phân tích sâu cơ chế truyền tham số Java, làm rõ hiểu lầm phổ biến về truyền giá trị và truyền tham chiếu, hiểu bản chất sự khác biệt giữa tham số hình thức và tham số thực tế.
category: Java
tag:
  - Java cơ bản
head:
  - - meta
    - name: keywords
      content: Java truyền giá trị,truyền tham chiếu,truyền tham số,formal parameter,actual parameter,object reference,gọi method,cơ chế truyền tham số Java
---

Trước khi bắt đầu, hãy hiểu hai khái niệm sau:

- Tham số hình thức & tham số thực tế
- Truyền giá trị & truyền tham chiếu

## Tham số hình thức & Tham số thực tế

Định nghĩa method có thể dùng **tham số** (method có tham số). Tham số trong ngôn ngữ lập trình được chia thành:

- **Tham số thực tế (Arguments)**: Tham số dùng để truyền vào function/method, phải có giá trị xác định.
- **Tham số hình thức (Parameters)**: Dùng để định nghĩa function/method, nhận tham số thực tế, không cần có giá trị xác định.

```java
String hello = "Hello!";
// hello là tham số thực tế
sayHello(hello);
// str là tham số hình thức
void sayHello(String str) {
    System.out.println(str);
}
```

## Truyền giá trị & Truyền tham chiếu

Có hai cách ngôn ngữ lập trình truyền tham số thực tế cho method (hay function):

- **Truyền giá trị (Pass by value)**: Method nhận bản sao của giá trị tham số thực tế, tạo ra bản copy.
- **Truyền tham chiếu (Pass by reference)**: Method nhận trực tiếp địa chỉ của tham số thực tế, không phải giá trị bên trong — đây là con trỏ. Lúc này tham số hình thức chính là tham số thực tế, mọi sửa đổi trên tham số hình thức đều phản ánh lên tham số thực tế, kể cả gán lại giá trị.

Nhiều ngôn ngữ lập trình (như C++, Pascal) cung cấp cả hai cách truyền tham số, nhưng **trong Java chỉ có truyền giá trị**.

## Tại sao Java chỉ có truyền giá trị?

**Tại sao nói Java chỉ có truyền giá trị?** Không cần giải thích nhiều, tôi sẽ chứng minh qua 3 ví dụ.

### Ví dụ 1: Truyền tham số kiểu nguyên thủy

Code:

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

Output:

```plain
a = 20
b = 10
num1 = 10
num2 = 20
```

Phân tích:

Việc hoán đổi giá trị `a`, `b` trong method `swap()` không ảnh hưởng đến `num1`, `num2`. Vì giá trị của `a`, `b` chỉ là bản sao chép từ `num1`, `num2`. Tức là `a`, `b` tương đương bản sao của `num1`, `num2` — nội dung bản sao dù sửa thế nào cũng không ảnh hưởng đến bản gốc.

![](https://oss.javaguide.cn/github/javaguide/java/basis/java-value-passing-01.png)

Qua ví dụ trên, ta đã biết một method không thể sửa đổi tham số kiểu dữ liệu nguyên thủy. Nhưng tham chiếu đối tượng làm tham số thì khác, xem ví dụ 2.

### Ví dụ 2: Truyền tham số kiểu tham chiếu (1)

Code:

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

Output:

```plain
1
0
```

Phân tích:

![](https://oss.javaguide.cn/github/javaguide/java/basis/java-value-passing-02.png)

Xem ví dụ này nhiều người chắc nghĩ Java dùng truyền tham chiếu cho tham số kiểu tham chiếu.

Thực ra không phải vậy, ở đây vẫn là truyền giá trị, chỉ là giá trị được truyền là địa chỉ của tham số thực tế mà thôi!

Tức là tham số của method `change` sao chép địa chỉ của `arr` (tham số thực tế), do đó nó và `arr` trỏ đến cùng một mảng object. Điều này giải thích tại sao sửa đổi tham số hình thức bên trong method lại ảnh hưởng đến tham số thực tế.

Để bác bỏ mạnh mẽ hơn rằng Java không dùng truyền tham chiếu cho tham số kiểu tham chiếu, hãy xem ví dụ dưới!

### Ví dụ 3: Truyền tham số kiểu tham chiếu (2)

```java
public class Person {
    private String name;
   // Bỏ qua constructor, Getter&Setter
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

Output:

```plain
person1:Tiểu Lý
person2:Tiểu Trương
xiaoZhang:Tiểu Trương
xiaoLi:Tiểu Lý
```

Phân tích:

Sao lại thế? Hoán đổi hai tham số hình thức kiểu tham chiếu không ảnh hưởng đến tham số thực tế!

Tham số `person1` và `person2` của method `swap` chỉ là bản sao địa chỉ của tham số thực tế `xiaoZhang` và `xiaoLi`. Do đó, việc hoán đổi `person1` và `person2` chỉ là hoán đổi hai địa chỉ đã sao chép, không ảnh hưởng đến tham số thực tế `xiaoZhang` và `xiaoLi`.

![](https://oss.javaguide.cn/github/javaguide/java/basis/java-value-passing-03.png)

## Truyền tham chiếu trông như thế nào?

Đến đây, chắc bạn đã biết Java chỉ có truyền giá trị, không có truyền tham chiếu. Nhưng truyền tham chiếu thực sự trông như thế nào? Dưới đây lấy code `C++` làm ví dụ, để bạn thấy diện mạo thật sự của truyền tham chiếu.

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

Kết quả output:

```plain
invoke before: 10
incr before: 10
incr after: 11
invoke after: 11
```

Phân tích: Có thể thấy, sửa đổi tham số hình thức trong function `incr` ảnh hưởng được đến giá trị tham số thực tế. Lưu ý: ở đây kiểu dữ liệu của tham số hình thức trong `incr` dùng `int&` mới là truyền tham chiếu. Nếu dùng `int` thì vẫn là truyền giá trị!

## Tại sao Java không đưa vào truyền tham chiếu?

Truyền tham chiếu có vẻ tiện, có thể sửa trực tiếp giá trị tham số thực tế ngay trong method, nhưng tại sao Java không đưa vào truyền tham chiếu?

**Lưu ý: Dưới đây là quan điểm cá nhân, không phải từ Java chính thức:**

1. Vì lý do bảo mật, các thao tác trên giá trị bên trong method đều là điều người gọi không biết (định nghĩa method dưới dạng interface, người gọi không quan tâm triển khai cụ thể). Hãy tưởng tượng: nếu rút tiền 100 nhưng bị trừ 200, có đáng sợ không?
2. Cha đẻ của Java, James Gosling, ngay từ khi thiết kế đã nhận thấy nhiều nhược điểm của C và C++, nên muốn thiết kế một ngôn ngữ mới là Java. Khi thiết kế Java, ông tuân thủ nguyên tắc đơn giản dễ dùng, loại bỏ nhiều "tính năng" mà developer dễ gây lỗi nếu không cẩn thận. Ít thứ trong ngôn ngữ hơn, developer cũng cần học ít hơn.

## Tổng kết

Cách Java truyền tham số thực tế cho method (hay function) là **truyền giá trị**:

- Nếu tham số là kiểu nguyên thủy, đơn giản, giá trị được truyền là bản sao của giá trị literal của kiểu nguyên thủy, tạo ra bản copy.
- Nếu tham số là kiểu tham chiếu, giá trị được truyền là bản sao của địa chỉ trong heap mà tham số thực tế tham chiếu đến, cũng tạo ra bản copy.

## Tài liệu tham khảo

- 《Java Core Technology Volume I》 Kiến thức cơ bản Phiên bản thứ 10 Chương 4, Mục 4.5
- [Java rốt cuộc là truyền giá trị hay truyền tham chiếu? - Câu trả lời của Hollis - Zhihu](https://www.zhihu.com/question/31203609/answer/576030121)
- [Oracle Java Tutorials - Passing Information to a Method or a Constructor](https://docs.oracle.com/javase/tutorial/java/javaOO/arguments.html)
- [Interview with James Gosling, Father of Java](https://mappingthejourney.com/single-post/2017/06/29/episode-3-interview-with-james-gosling-father-of-java/)

<!-- @include: @article-footer.snippet.md -->
