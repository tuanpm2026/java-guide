---
title: Chi Tiết Về Kiểu Dữ Liệu Chung & Ký Tự Đại Diện
description: Phân tích toàn diện về kiểu dữ liệu chung Java và ký tự đại diện Hiểu sâu cơ chế xóa kiểu, cách sử dụng ký tự đại diện giới hạn trên và dưới, nguyên tắc PECS, nắm vững kỹ thuật lập trình kiểu dữ liệu chung cốt lõi.
category: Java
tag:
  - Java Cơ Bản
head:
  - - meta
    - name: keywords
      content: Java kiểu dữ liệu chung, ký tự đại diện, xóa kiểu, giới hạn kiểu dữ liệu, nguyên tắc PECS, phương thức kiểu dữ liệu chung, giao diện kiểu dữ liệu chung
---

## Kiểu Dữ Liệu Chung

### Kiểu Dữ Liệu Chung Là Gì? Có Tác Dụng Gì?

**Kiểu dữ liệu chung Java (Generics)** là tính năng mới được giới thiệu trong JDK 5. Sử dụng tham số kiểu dữ liệu chung, có thể tăng khả năng đọc hiểu và tính ổn định của code. **Nếu không có hướng dẫn đặc biệt, hành động sau đây dựa trên Java 8.**

Trình biên dịch có thể kiểm tra tham số kiểu dữ liệu chung, và thông qua tham số kiểu dữ liệu chung có thể chỉ định loại đối tượng được truyền vào. Ví dụ `ArrayList<Person> persons = new ArrayList<Person>()` dòng code này chỉ rõ rằng `ArrayList` này chỉ có thể chứa các đối tượng kiểu `Person`, nếu truyền vào kiểu khác sẽ báo lỗi (từ JDK 7 có thể viết `new ArrayList<>()`, trình biên dịch sẽ suy luận tham số kiểu).

```java
ArrayList<E> extends AbstractList<E>
```

Ngoài ra, `List` gốc có kiểu trả về là `Object`, cần chuyển đổi kiểu thủ công để sử dụng, sử dụng kiểu dữ liệu chung sau khi trình biên dịch tự động chuyển đổi.

### Có Bao Nhiêu Cách Sử Dụng Kiểu Dữ Liệu Chung?

Kiểu dữ liệu chung thường có ba cách sử dụng: **lớp kiểu dữ liệu chung**, **giao diện kiểu dữ liệu chung**, **phương thức kiểu dữ liệu chung**.

**1. Lớp Kiểu Dữ Liệu Chung:**

```java
// T ở đây có thể là bất kỳ định danh nào, các định danh như T, E, K, V thường được sử dụng
// để đại diện cho tham số kiểu dữ liệu chung
// Khi tạo instance của lớp kiểu dữ liệu chung, phải chỉ định kiểu cụ thể của T
public class Generic<T>{

    private T key;

    public Generic(T key) {
        this.key = key;
    }

    public T getKey(){
        return key;
    }
}
```

Cách tạo instance của lớp kiểu dữ liệu chung:

```java
Generic<Integer> genericInteger = new Generic<Integer>(123456);
// Từ JDK 7 có thể viết: new Generic<>(123456)
```

**2. Giao Diện Kiểu Dữ Liệu Chung:**

```java
public interface Generator<T> {
    public T method();
}
```

Triển khai giao diện kiểu dữ liệu chung, không chỉ định kiểu:

```java
class GeneratorImpl<T> implements Generator<T>{
    @Override
    public T method() {
        return null;
    }
}
```

Triển khai giao diện kiểu dữ liệu chung, chỉ định kiểu:

```java
class GeneratorImpl implements Generator<String> {
    @Override
    public String method() {
        return "hello";
    }
}
```

**3. Phương Thức Kiểu Dữ Liệu Chung:**

```java
   public static < E > void printArray( E[] inputArray )
   {
         for ( E element : inputArray ){
            System.out.printf( "%s ", element );
         }
         System.out.println();
    }
```

Cách sử dụng:

```java
// Tạo mảng các kiểu khác nhau: Integer, Double và Character
Integer[] intArray = { 1, 2, 3 };
String[] stringArray = { "Hello", "World" };
printArray( intArray  );
printArray( stringArray  );
```

### Dự Án Sử Dụng Kiểu Dữ Liệu Chung Ở Đâu?

- Tự định nghĩa giao diện kết quả trả về chung `CommonResult<T>` thông qua tham số `T` có thể xác định động kiểu dữ liệu của kết quả dựa trên kiểu trả về cụ thể
- Định nghĩa lớp xử lý `Excel` `ExcelUtil<T>` để xác định động kiểu dữ liệu của dữ liệu xuất Excel
- Xây dựng lớp tiện ích tập hợp (tham khảo các phương thức `sort`, `binarySearch` trong `Collections`)
- ……

### Cơ Chế Xóa Kiểu Dữ Liệu Chung Là Gì? Tại Sao Phải Xóa?

**Kiểu dữ liệu chung của Java là giả, vì Java trong quá trình biên dịch, tất cả thông tin kiểu dữ liệu chung đều sẽ bị xóa, đây cũng là cách gọi thường thấy của xóa kiểu.**

Trình biên dịch sẽ xóa động kiểu dữ liệu chung `T` thành `Object` hoặc xóa `T extends xxx` thành kiểu giới hạn `xxx` trong quá trình biên dịch.

Do đó, kiểu dữ liệu chung về cơ bản thực chất là hành vi của trình biên dịch, để đảm bảo giới thiệu cơ chế kiểu dữ liệu chung nhưng không tạo ra kiểu mới, giảm chi phí runtime của máy ảo, trình biên dịch thông qua xóa sẽ chuyển đổi lớp kiểu dữ liệu chung thành lớp thông thường.

Điều này có thể hơi trừu tượng, tôi sẽ đưa ra một ví dụ:

```java
List<Integer> list = new ArrayList<>();

list.add(12);
//1. Trong quá trình biên dịch sẽ báo lỗi trực tiếp
list.add("a");
Class<? extends List> clazz = list.getClass();
Method add = clazz.getDeclaredMethod("add", Object.class);
//2. Trong thời gian chạy thông qua phản ánh, có thể được thêm vào
add.invoke(list, "kl");

System.out.println(list)
```

Một ví dụ khác: Do vấn đề xóa kiểu dữ liệu chung, việc nạp chồng phương thức sau đây sẽ báo lỗi.

```java
public void print(List<String> list)  { }
public void print(List<Integer> list) { }
```

Nguyên nhân cũng rất đơn giản, sau khi xóa kiểu dữ liệu chung, `List<String>` và `List<Integer>` đều trở thành `List` sau khi biên dịch.

**Vì trình biên dịch phải xóa kiểu dữ liệu chung, vậy tại sao vẫn phải sử dụng kiểu dữ liệu chung? Dùng Object thay thế được không?**

Câu hỏi này thực chất là kiểm tra biểu diễn tác dụng của kiểu dữ liệu chung:

- Có thể sử dụng kiểu dữ liệu chung để kiểm tra kiểu trong thời gian biên dịch.

- Sử dụng kiểu `Object` cần thêm chuyển đổi kiểu ép buộc thủ công, giảm khả năng đọc hiểu code, tăng xác suất lỗi.

- Kiểu dữ liệu chung có thể sử dụng kiểu tự giới hạn như `T extends Comparable`.

### Phương Thức Cầu Nối Là Gì?

Phương thức cầu nối (`Bridge Method`) dùng để bảo tồn đa hình khi kế thừa lớp kiểu dữ liệu chung.

```java
class Node<T> {
    public T data;
    public Node(T data) { this.data = data; }
    public void setData(T data) {
        System.out.println("Node.setData");
        this.data = data;
    }
}

class MyNode extends Node<Integer> {
    public MyNode(Integer data) { super(data); }

  	// Sau khi xóa kiểu dữ liệu chung, Node<T> trở thành setData(Object data), còn lớp con MyNode không có phương thức override này,
   	// vì vậy trình biên dịch sẽ thêm phương thức cầu nối này để bảo tồn đa hình
   	public void setData(Object data) {
        setData((Integer) data);
    }

    public void setData(Integer data) {
        System.out.println("MyNode.setData");
        super.setData(data);
    }
}
```

⚠️ **Lưu Ý**: Phương thức cầu nối được trình biên dịch tự động tạo ra, không phải viết thủ công.

### Kiểu Dữ Liệu Chung Có Những Hạn Chế Nào? Tại Sao?

Các hạn chế của kiểu dữ liệu chung thường do cơ chế xóa kiểu dữ liệu chung gây ra. Sau khi xóa thành `Object` không thể xác định kiểu

- Chỉ có thể khai báo không thể tạo instance biến kiểu `T`.
- Tham số kiểu dữ liệu chung không thể là kiểu dữ liệu cơ bản. Vì kiểu dữ liệu cơ bản không phải là lớp con của `Object`, nên nên sử dụng kiểu tham chiếu tương ứng với kiểu dữ liệu cơ bản.
- Không thể tạo instance mảng của tham số kiểu dữ liệu chung. Sau khi xóa thành `Object` không thể xác định kiểu.
- Không thể tạo instance mảng kiểu dữ liệu chung.
- Kiểu dữ liệu chung không thể sử dụng `instanceof` để xác định kiểu tham số `T` trong thời gian chạy; `getClass()` cũng không thể phân biệt các tham số kiểu dữ liệu chung khác nhau sau khi xóa (ví dụ `List<String>` và `List<Integer>` đều nhận được `List.class`).
- Không thể triển khai hai giao diện khác nhau với cùng tham số kiểu dữ liệu chung, phương thức cầu nối của nhiều lớp cha sẽ xung đột sau khi xóa
- Không thể sử dụng `static` để sửa đổi biến kiểu dữ liệu chung
- ……

### Mã Code Dưới Đây Có Thể Biên Dịch Được Không? Tại Sao?

```java
public final class Algorithm {
    public static <T> T max(T x, T y) {
        return x > y ? x : y;
    }
}
```

Không thể biên dịch, vì x và y sẽ bị xóa thành kiểu `Object`, `Object` không thể sử dụng `>` để so sánh

```java
public class Singleton<T> {

    public static T getInstance() {
        if (instance == null)
            instance = new Singleton<T>();

        return instance;
    }

    private static T instance = null;
}
```

Không thể biên dịch, vì không thể sử dụng `static` để sửa đổi `T` kiểu dữ liệu chung.

## Ký Tự Đại Diện

### Ký Tự Đại Diện Là Gì? Có Tác Dụng Gì?

Kiểu dữ liệu chung là cố định, một số tình huống nhất định khiến việc sử dụng không linh hoạt, vì vậy ký tự đại diện ra đời! Ký tự đại diện có thể cho phép tham số kiểu dữ liệu thay đổi, được sử dụng để giải quyết vấn đề kiểu dữ liệu chung không thể hiệp biến.

Ví dụ:

```java
// Giới hạn kiểu là lớp con của Person
<? extends Person>
// Giới hạn kiểu là lớp cha của Manager
<? super Manager>
```

### Khác Biệt Giữa Ký Tự Đại Diện ? Và Kiểu Dữ Liệu Chung T Thường Được Sử Dụng Là Gì?

- `T` có thể được sử dụng để khai báo biến hoặc hằng số trong khi `?` thì không.
- `T` thường được sử dụng để khai báo lớp kiểu dữ liệu chung hoặc phương thức, ký tự đại diện `?` thường được sử dụng trong mã gọi phương thức kiểu dữ liệu chung và tham số hình thức.
- `T` sẽ bị xóa thành kiểu giới hạn hoặc `Object` trong quá trình biên dịch. Ký tự đại diện `?` sẽ bị trình biên dịch "bắt" thành một kiểu cụ thể nhưng chưa biết (capture) bên trong phương thức, do đó không thể ghi dữ liệu vào `List<?>` ngoại trừ `null`, nhưng có thể sử dụng cùng với phương thức kiểu dữ liệu chung.

### Ký Tự Đại Diện Không Giới Hạn Là Gì?

Ký tự đại diện không giới hạn có thể nhận bất kỳ dữ liệu kiểu dữ liệu chung nào, được sử dụng để triển khai các phương thức đơn giản không phụ thuộc vào tham số kiểu cụ thể, có thể bắt tham số kiểu và giao cho phương thức kiểu dữ liệu chung xử lý.

```java
void testMethod(Person<?> p) {
  // Phương thức kiểu dữ liệu chung tự xử lý
}
```

**Có Khác Biệt Giữa `List<?>` Và `List` Không?** Dĩ nhiên là có!

- `List<?> list` biểu thị các phần tử của `list` là **một kiểu nhất định nhưng chưa biết** (tức là có một kiểu `T`, `list` là `List<T>`), do đó trình biên dịch không cho phép thêm bất kỳ phần tử nào vào ngoại trừ `null`, để tránh không an toàn về kiểu.
- `List list` biểu thị kiểu phần tử mà `list` nắm giữ là `Object`, do đó có thể thêm bất kỳ kiểu đối tượng nào, nhưng trình biên dịch sẽ đưa ra cảnh báo.

```java
List<?> list = new ArrayList<>();
list.add("sss");//báo lỗi
List list2 = new ArrayList<>();
list2.add("sss");//cảnh báo
```

### Ký Tự Đại Diện Giới Hạn Trên Là Gì? Ký Tự Đại Diện Giới Hạn Dưới Là Gì?

Khi sử dụng kiểu dữ liệu chung, chúng ta còn có thể giới hạn giới hạn trên và dưới của tham số kiểu dữ liệu truyền vào, chẳng hạn: **tham số kiểu chỉ cho phép truyền vào kiểu cha hoặc lớp con của loại nào đó**.

**Ký Tự Đại Diện Giới Hạn Trên `extends`** có thể thực hiện chuyển đổi kiểu dữ liệu chung lên tức là kiểu truyền vào phải là lớp con của kiểu chỉ định.

Ví dụ:

```java
// Giới hạn phải là lớp con của lớp Person
<? extends Person>
```

Giới hạn kiểu có thể được đặt thành nhiều giới hạn, cũng có thể giới hạn kiểu `T`.

```java
<T extends T1 & T2>
<T extends XXX>
```

**Ký Tự Đại Diện Giới Hạn Dưới `super`** là đối lập với ký tự đại diện giới hạn trên `extends`, nó có thể thực hiện chuyển đổi kiểu dữ liệu chung xuống tức là tham số kiểu truyền vào phải là lớp cha của kiểu chỉ định.

Ví dụ:

```java
// Giới hạn phải là lớp cha của lớp Employee
List<? super Employee>
```

**Khác Biệt Giữa `? extends xxx` Và `? super xxx` Là Gì?**

Phạm vi nhận tham số của hai loại khác nhau. Ngoài ra, sử dụng tham số kiểu dữ liệu chung được khai báo bằng `? extends xxx` chỉ có thể gọi phương thức `get()` để trả về kiểu `xxx`, gọi `set()` sẽ báo lỗi. Sử dụng tham số kiểu dữ liệu chung được khai báo bằng `? super xxx` chỉ có thể gọi phương thức `set()` để nhận kiểu xxx, gọi `get()` sẽ báo lỗi.

**Nguyên Tắc PECS (Producer Extends, Consumer Super)**: Khi **lấy** phần tử từ cấu trúc dữ liệu sử dụng `extends` (nhà sản xuất, Producer); khi **ghi** phần tử vào cấu trúc dữ liệu sử dụng `super` (người tiêu dùng, Consumer). Ví dụ: `List<? extends Number>` chỉ có thể đọc `Number`, không thể ghi; `List<? super Integer>` có thể ghi `Integer` và lớp con của nó, khi đọc được `Object`. `Collections.copy(List<? super T> dest, List<? extends T> src)` là cách sử dụng điển hình: đọc từ `src`, ghi vào `dest`.

**Khác Biệt Giữa `T extends xxx` Và `? extends xxx` Là Gì?**

`T extends xxx` được sử dụng để định nghĩa lớp kiểu dữ liệu chung và phương thức, sau khi xóa sẽ trở thành kiểu `xxx`, `? extends xxx` được sử dụng để khai báo tham số hình thức của phương thức, nhận `xxx` và các loại con của nó.

**Khác Biệt Giữa `Class<?>` Và `Class` Là Gì?**

Sử dụng trực tiếp `Class` sẽ có cảnh báo kiểu, sử dụng `Class<?>` không có, vì `Class` là một lớp kiểu dữ liệu chung, nhận kiểu gốc sẽ sản sinh cảnh báo

### Mã Code Dưới Đây Có Thể Biên Dịch Được Không? Tại Sao?

```java
class Shape { /* ... */ }
class Circle extends Shape { /* ... */ }
class Rectangle extends Shape { /* ... */ }

class Node<T> { /* ... */ }

Node<Circle> nc = new Node<>();
Node<Shape>  ns = nc;
```

Không, vì `Node<Circle>` không phải là lớp con của `Node<Shape>`

```java
class Shape { /* ... */ }
class Circle extends Shape { /* ... */ }
class Rectangle extends Shape { /* ... */ }

class Node<T> { /* ... */ }
class ChildNode<T> extends Node<T>{

}
ChildNode<Circle> nc = new ChildNode<>();
Node<Circle>  ns = nc;
```

Có thể biên dịch được, `ChildNode<Circle>` là lớp con của `Node<Circle>`

```java
public static void print(List<? extends Number> list) {
    for (Number n : list)
        System.out.print(n + " ");
    System.out.println();
}
```

Có thể biên dịch được, `List<? extends Number>` có thể lấy ra phần tử, nhưng không thể gọi `add()` để thêm phần tử.

## Tài Liệu Tham Khảo

- Tài Liệu Chính Thức Java: https://docs.oracle.com/javase/tutorial/java/generics/index.html
- Java Cơ Bản - Một Bài Viết Làm Rõ Kiểu Dữ Liệu Chung: https://www.cnblogs.com/XiiX/p/14719568.html
