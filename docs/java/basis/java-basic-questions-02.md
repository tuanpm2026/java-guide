---
title: Tóm tắt các câu hỏi phỏng vấn Java cơ bản (Phần 2)
description: Tóm tắt kiến thức cốt lõi lập trình hướng đối tượng Java bao gồm ba đặc tính chính (đóng gói, kế thừa, đa hình), sự khác biệt giữa interface và abstract class, phương thức của lớp Object, deep copy và shallow copy, so sánh String/StringBuffer/StringBuilder, giúp nhanh chóng nắm bắt bản chất OOP của Java.
category: Java
tag:
  - Java cơ bản
head:
  - - meta
    - name: keywords
      content: hướng đối tượng, đóng gói kế thừa đa hình, interface, abstract class, deep copy shallow copy, lớp Object, equals, hashCode, String, string constant pool, câu hỏi phỏng vấn Java
---

## Nền tảng lập trình hướng đối tượng

### ⭐️ Sự khác biệt giữa lập trình hướng đối tượng và lập trình hướng thủ tục

Lập trình hướng thủ tục (Procedural-Oriented Programming, POP) và lập trình hướng đối tượng (Object-Oriented Programming, OOP) là hai mô hình lập trình phổ biến, sự khác biệt chính nằm ở cách tiếp cận giải quyết vấn đề:

- **Lập trình hướng thủ tục (POP)**: Lập trình hướng thủ tục chia quy trình giải quyết vấn đề thành từng phương thức riêng lẻ, và thực hiện lần lượt từng phương thức để giải quyết vấn đề.
- **Lập trình hướng đối tượng (OOP)**: Lập trình hướng đối tượng trước tiên sẽ trừu tượng hóa các đối tượng, sau đó sử dụng các đối tượng thực hiện các phương thức để giải quyết vấn đề.

Khi so sánh với POP, các chương trình được phát triển bằng OOP có những ưu điểm sau:

- **Dễ bảo trì**: Nhờ cấu trúc tốt và tính đóng gói, các chương trình OOP thường dễ bảo trì hơn.
- **Dễ tái sử dụng**: Thông qua kế thừa và đa hình, thiết kế OOP giúp mã nguồn có khả năng tái sử dụng cao hơn, dễ dàng mở rộng chức năng.
- **Dễ mở rộng**: Thiết kế mô-đun hóa làm cho việc mở rộng hệ thống trở nên dễ dàng và linh hoạt hơn.

Cách lập trình POP thường đơn giản và trực tiếp hơn, phù hợp để xử lý một số nhiệm vụ tương đối đơn giản.

Sự khác biệt về hiệu suất giữa POP và OOP chủ yếu phụ thuộc vào cơ chế chạy của chúng, chứ không chỉ là mô hình lập trình. Do đó, việc so sánh đơn giản hai điều này về hiệu suất là một hiểu lầm phổ biến.

Khi chọn mô hình lập trình, hiệu suất không phải là yếu tố duy nhất cần xem xét. Khả năng bảo trì mã, khả năng mở rộng và hiệu quả phát triển cũng rất quan trọng.

Hầu hết các ngôn ngữ lập trình hiện đại đều hỗ trợ nhiều mô hình lập trình, có thể được sử dụng cho cả lập trình hướng thủ tục và lập trình hướng đối tượng.

Dưới đây là một ví dụ về tính diện tích và chu vi của hình tròn, đơn giản minh họa hai cách tiếp cận khác nhau của lập trình hướng đối tượng và hướng thủ tục.

**Lập trình hướng đối tượng**:

```java
public class Circle {
    // Định nghĩa bán kính hình tròn
    private double radius;

    // Hàm khởi tạo
    public Circle(double radius) {
        this.radius = radius;
    }

    // Tính diện tích hình tròn
    public double getArea() {
        return Math.PI * radius * radius;
    }

    // Tính chu vi hình tròn
    public double getPerimeter() {
        return 2 * Math.PI * radius;
    }

    public static void main(String[] args) {
        // Tạo một hình tròn có bán kính 3
        Circle circle = new Circle(3.0);

        // Xuất diện tích và chu vi hình tròn
        System.out.println("Diện tích hình tròn: " + circle.getArea());
        System.out.println("Chu vi hình tròn: " + circle.getPerimeter());
    }
}
```

Chúng tôi đã định nghĩa một lớp `Circle` để biểu diễn hình tròn, lớp này bao gồm thuộc tính bán kính của hình tròn và các phương thức để tính diện tích, chu vi.

**Lập trình hướng thủ tục**:

```java
public class Main {
    public static void main(String[] args) {
        // Định nghĩa bán kính hình tròn
        double radius = 3.0;

        // Tính diện tích và chu vi hình tròn
        double area = Math.PI * radius * radius;
        double perimeter = 2 * Math.PI * radius;

        // Xuất diện tích và chu vi hình tròn
        System.out.println("Diện tích hình tròn: " + area);
        System.out.println("Chu vi hình tròn: " + perimeter);
    }
}
```

Chúng tôi đã trực tiếp định nghĩa bán kính hình tròn và sử dụng bán kính đó để trực tiếp tính diện tích và chu vi.

### Sử dụng toán tử nào để tạo một đối tượng? Sự khác biệt giữa instance của đối tượng và tham chiếu đối tượng là gì?

Sử dụng toán tử `new`. Toán tử `new` tạo instance của đối tượng (instance của đối tượng nằm trong heap memory), tham chiếu đối tượng chỉ đến instance của đối tượng (tham chiếu đối tượng được lưu trữ trong stack memory).

- Một tham chiếu đối tượng có thể chỉ đến 0 hoặc 1 đối tượng (một sợi dây có thể không buộc bóng bay, hoặc chỉ buộc một bóng bay);
- Một đối tượng có thể có n tham chiếu chỉ đến nó (có thể dùng n sợi dây buộc một bóng bay).

### ⭐️ Sự khác biệt giữa bằng nhau của đối tượng và bằng nhau của tham chiếu

- Bằng nhau của đối tượng thường so sánh nội dung lưu trữ trong bộ nhớ có bằng nhau hay không.
- Bằng nhau của tham chiếu thường so sánh xem địa chỉ bộ nhớ mà chúng chỉ đến có bằng nhau hay không.

Đây là một ví dụ:

```java
String str1 = "hello";
String str2 = new String("hello");
String str3 = "hello";
// Sử dụng == để so sánh tham chiếu bằng nhau của chuỗi
System.out.println(str1 == str2);
System.out.println(str1 == str3);
// Sử dụng phương thức equals để so sánh bằng nhau của chuỗi
System.out.println(str1.equals(str2));
System.out.println(str1.equals(str3));
```

Kết quả đầu ra:

```plain
false
true
true
true
```

Từ kết quả đầu ra trên, chúng ta có thể thấy:

- `str1` và `str2` không bằng nhau, trong khi `str1` và `str3` bằng nhau. Điều này là vì toán tử `==` so sánh xem các tham chiếu chuỗi có bằng nhau hay không.
- `str1`, `str2`, `str3` đều có nội dung bằng nhau. Điều này là vì phương thức `equals` so sánh nội dung của chuỗi. Miễn là nội dung của các chuỗi này bằng nhau, ngay cả khi các tham chiếu đối tượng của các chuỗi khác nhau, chúng vẫn được coi là bằng nhau.

### Nếu một lớp không khai báo hàm khởi tạo, chương trình có thể thực hiện chính xác không?

Hàm khởi tạo là một phương thức đặc biệt, công dụng chính là hoàn thành việc khởi tạo đối tượng.

Nếu một lớp không khai báo hàm khởi tạo, vẫn có thể thực hiện! Bởi vì ngay cả khi một lớp không khai báo hàm khởi tạo, nó vẫn sẽ có hàm khởi tạo mặc định không có tham số. Nếu chúng ta tự thêm hàm khởi tạo của lớp (dù có tham số hay không), Java sẽ không thêm hàm khởi tạo mặc định không có tham số nữa.

Chúng ta luôn sử dụng hàm khởi tạo một cách không biết không tuyên bố, vì đó là lý do tại sao chúng ta phải thêm dấu ngoặc đơn ở phía sau khi tạo đối tượng (bởi vì phải gọi hàm khởi tạo không có tham số). Nếu chúng ta nạp chồng hàm khởi tạo có tham số, hãy nhớ viết ra hàm khởi tạo không có tham số (dù có sử dụng hay không), vì điều này có thể giúp chúng ta tránh gặp vấn đề khi tạo đối tượng.

### Hàm khởi tạo có những đặc điểm gì? Có thể được override không?

Hàm khởi tạo có những đặc điểm sau:

- **Tên giống với tên lớp**: Tên của hàm khởi tạo phải giống hệt với tên lớp.
- **Không có giá trị trả về**: Hàm khởi tạo không có kiểu trả về và không thể sử dụng `void` để khai báo.
- **Thực hiện tự động**: Khi tạo đối tượng của lớp, hàm khởi tạo sẽ thực hiện tự động, không cần gọi một cách tường minh.

Hàm khởi tạo **không thể bị override (ghi đè)**, nhưng **có thể được overload (nạp chồng)**. Do đó, một lớp có thể có nhiều hàm khởi tạo, các hàm khởi tạo này có thể có các danh sách tham số khác nhau, để cung cấp các cách khác nhau để khởi tạo đối tượng.

### ⭐️ Ba đặc tính chính của lập trình hướng đối tượng

#### Đóng gói (Encapsulation)

Đóng gói có nghĩa là ẩn thông tin trạng thái của một đối tượng (cũng là các thuộc tính) bên trong đối tượng, không cho phép các đối tượng bên ngoài truy cập trực tiếp vào thông tin bên trong của đối tượng. Nhưng có thể cung cấp một số phương thức có thể được truy cập từ bên ngoài để hoạt động trên các thuộc tính. Giống như chúng ta không thể nhìn thấy thông tin các bộ phận bên trong của máy lạnh treo trên tường (cũng là các thuộc tính), nhưng có thể kiểm soát máy lạnh thông qua điều khiển từ xa (phương thức). Nếu một thuộc tính không muốn được truy cập từ bên ngoài, chúng ta hoàn toàn không cần phải cung cấp phương thức cho bên ngoài truy cập. Tuy nhiên, nếu một lớp không cung cấp bất kỳ phương thức nào cho bên ngoài truy cập, thì lớp này cũng không có ý nghĩa gì. Giống như nếu không có điều khiển từ xa cho máy lạnh, chúng ta sẽ không thể kiểm soát việc làm lạnh của máy lạnh, máy lạnh sẽ không có ý nghĩa (tất nhiên, hiện nay có nhiều cách khác, đây chỉ là ví dụ).

```java
public class Student {
    private int id;      // thuộc tính id được đóng gói riêng tư
    private String name; // thuộc tính name được đóng gói riêng tư

    // Phương thức để lấy id
    public int getId() {
        return id;
    }

    // Phương thức để thiết lập id
    public void setId(int id) {
        this.id = id;
    }

    // Phương thức để lấy name
    public String getName() {
        return name;
    }

    // Phương thức để thiết lập name
    public void setName(String name) {
        this.name = name;
    }
}
```

#### Kế thừa (Inheritance)

Các loại đối tượng khác nhau thường có một số điểm chung. Ví dụ, học sinh Tiểu Minh, học sinh Tiểu Hồng, học sinh Tiểu Lý đều chia sẻ các đặc điểm của học sinh (lớp, mã số học sinh, v.v.). Đồng thời, mỗi đối tượng lại định nghĩa các đặc điểm bổ sung làm cho chúng khác biệt. Ví dụ, Tiểu Minh giỏi toán, Tiểu Hồng có tính cách hấp dẫn; Tiểu Lý có sức mạnh lớn. Kế thừa là một kỹ thuật sử dụng định nghĩa của lớp hiện có như cơ sở để xây dựng các lớp mới. Định nghĩa của lớp mới có thể thêm dữ liệu hoặc chức năng mới, hoặc sử dụng chức năng của lớp cha, nhưng không thể chọn lực để kế thừa lớp cha. Bằng cách sử dụng kế thừa, có thể nhanh chóng tạo các lớp mới, có thể cải thiện khả năng tái sử dụng mã, khả năng bảo trì chương trình, tiết kiệm rất nhiều thời gian tạo lớp mới, nâng cao hiệu quả phát triển của chúng tôi.

**Hãy nhớ 3 điểm sau về kế thừa:**

1. Lớp con sở hữu tất cả các thuộc tính và phương thức của đối tượng lớp cha (bao gồm cả thuộc tính riêng tư và phương thức riêng tư), nhưng các thuộc tính riêng tư và phương thức riêng tư của lớp cha không thể được lớp con truy cập, **chỉ là sở hữu**.
2. Lớp con có thể có các thuộc tính và phương thức của riêng mình, tức là lớp con có thể mở rộng lớp cha.
3. Lớp con có thể thực hiện các phương thức của lớp cha theo cách của riêng nó.

#### Đa hình (Polymorphism)

Đa hình, như tên gọi của nó, có nghĩa là một đối tượng có nhiều trạng thái, được thể hiện cụ thể là tham chiếu của lớp cha chỉ đến instance của lớp con.

**Đặc điểm của đa hình:**

- Giữa loại đối tượng và loại tham chiếu tồn tại mối quan hệ kế thừa (lớp) / thực hiện (interface);
- Phương thức nào được gọi bởi biến loại tham chiếu cuối cùng phải được xác định trong quá trình chạy chương trình;
- Đa hình không thể gọi các phương thức "chỉ tồn tại trong lớp con nhưng không tồn tại trong lớp cha";
- Nếu lớp con đã ghi đè phương thức của lớp cha, phương thức được thực hiện thực sự là phương thức được ghi đè của lớp con, nếu lớp con không ghi đè phương thức của lớp cha, phương thức được thực hiện là phương thức của lớp cha.

### ⭐️ Interface và abstract class có điểm chung và khác biệt gì?

#### Điểm chung giữa interface và abstract class

- **Khởi tạo**: Interface và abstract class đều không thể được khởi tạo trực tiếp, chỉ có thể tạo đối tượng cụ thể sau khi được thực hiện (interface) hoặc kế thừa (abstract class).
- **Phương thức trừu tượng**: Interface và abstract class đều có thể chứa các phương thức trừu tượng. Các phương thức trừu tượng không có thân phương thức, phải được thực hiện trong lớp con hoặc lớp triển khai.

#### Sự khác biệt giữa interface và abstract class

- **Mục đích thiết kế**: Interface chủ yếu được sử dụng để ràng buộc hành vi của lớp, bạn thực hiện một interface nhất định có nghĩa là bạn có hành vi tương ứng. Abstract class chủ yếu được sử dụng để tái sử dụng mã, nhấn mạnh mối quan hệ thuộc về.
- **Kế thừa và thực hiện**: Một lớp chỉ có thể kế thừa một lớp (bao gồm cả abstract class), bởi vì Java không hỗ trợ đa kế thừa. Nhưng một lớp có thể thực hiện nhiều interface, một interface cũng có thể kế thừa nhiều interface khác.
- **Biến thành viên**: Biến thành viên trong interface chỉ có thể là `public static final`, không thể được sửa đổi và phải có giá trị khởi tạo. Biến thành viên của abstract class có thể có bất kỳ modifier nào (`private`, `protected`, `public`), có thể được định nghĩa lại hoặc gán lại trong lớp con.
- **Phương thức**:
  - Trước Java 8, các phương thức trong interface mặc định là `public abstract`, tức là chỉ có thể có khai báo phương thức. Từ Java 8 trở đi, có thể định nghĩa các phương thức `default` (mặc định) và phương thức `static` (tĩnh) trong interface. Từ Java 9 trở đi, interface có thể chứa các phương thức `private`.
  - Abstract class có thể chứa các phương thức trừu tượng và phương thức không trừu tượng. Các phương thức trừu tượng không có thân phương thức, phải được thực hiện trong lớp con. Các phương thức không trừu tượng có cách thực hiện cụ thể, có thể được sử dụng trực tiếp trong abstract class hoặc được ghi đè trong lớp con.

Trong các phiên bản Java 8 và cao hơn, interface đã giới thiệu các loại phương thức mới: phương thức `default`, phương thức `static` và phương thức `private`. Những phương thức này làm cho việc sử dụng interface trở nên linh hoạt hơn.

Phương thức `default` được giới thiệu trong Java 8 được sử dụng để cung cấp cách thực hiện mặc định cho các phương thức interface, có thể bị ghi đè trong lớp triển khai. Như vậy, có thể thêm các chức năng mới vào interface hiện có mà không phải sửa đổi lớp triển khai, do đó tăng khả năng mở rộng interface và khả năng tương thích ngược.

```java
public interface MyInterface {
    default void defaultMethod() {
        System.out.println("Đây là một phương thức mặc định.");
    }
}
```

Phương thức `static` được giới thiệu trong Java 8 không thể bị ghi đè trong lớp triển khai, chỉ có thể được gọi trực tiếp thông qua tên interface (`MyInterface.staticMethod()`), tương tự như phương thức tĩnh trong lớp. Phương thức `static` thường được sử dụng để định nghĩa một số phương thức tiện ích chung liên quan đến interface, thường ít được sử dụng.

```java
public interface MyInterface {
    static void staticMethod() {
        System.out.println("Đây là một phương thức tĩnh trong interface.");
    }
}
```

Java 9 cho phép sử dụng các phương thức `private` trong interface. Các phương thức `private` có thể được sử dụng để chia sẻ mã bên trong interface, không được công khai.

```java
public interface MyInterface {
    // phương thức default
    default void defaultMethod() {
        commonMethod();
    }

    // phương thức static
    static void staticMethod() {
        // cài đặt
    }

    // phương thức private
    private void commonMethod() {
        // cài đặt
    }
}
```

## String, StringBuffer, StringBuilder

### ⭐️ Sự khác biệt giữa String, StringBuffer, StringBuilder

**String**:

- Là một lớp bất biến, một khi được tạo, giá trị của nó không thể thay đổi.
- Vì String là bất biến, mỗi khi thực hiện một thao tác trên String (chẳng hạn như nối, cắt), một đối tượng String mới sẽ được tạo.
- String được sử dụng rộng rãi nhưng hiệu suất không cao khi cần thực hiện nhiều thao tác trên chuỗi.

**StringBuffer**:

- Là một lớp có thể thay đổi và luồng an toàn (thread-safe).
- Được đồng bộ hóa, vì vậy khi được truy cập từ nhiều luồng, nó an toàn nhưng hiệu suất thấp hơn.
- StringBuffer được sử dụng khi cần chuỗi có thể thay đổi và tính an toàn của luồng.

**StringBuilder**:

- Là một lớp có thể thay đổi nhưng không an toàn với các luồng.
- Không được đồng bộ hóa, vì vậy khi được truy cập từ một luồng duy nhất, nó an toàn và có hiệu suất cao hơn StringBuffer.
- StringBuilder được sử dụng khi cần chuỗi có thể thay đổi và không cần tính an toàn của luồng.

| Đặc tính          | String | StringBuffer | StringBuilder |
| ----------------- | ------ | ------------ | ------------- |
| Có thể thay đổi   | Không  | Có           | Có            |
| An toàn với luồng | Có     | Có           | Không         |
| Hiệu suất         | Thấp   | Trung bình   | Cao           |

> **String là thực sự bất biến**
>
> `String` thực sự bất biến có những lý do sau:
>
> 1. Mảng lưu trữ chuỗi được sửa đổi bằng `final` và là riêng tư, và lớp `String` không cung cấp / không công khai bất kỳ phương thức nào để sửa đổi chuỗi này.
> 2. Lớp `String` được sửa đổi bằng `final` dẫn đến nó không thể bị kế thừa, do đó tránh được lớp con phá vỡ tính bất biến của `String`.
>
> Lưu ý bổ sung (từ [issue 675](https://github.com/Snailclimb/JavaGuide/issues/675)): Sau Java 9, `String`, `StringBuilder` và `StringBuffer` được cài đặt bằng cách sử dụng mảng `byte` để lưu trữ chuỗi.
>
> ```java
> public final class String implements java.io.Serializable,Comparable<String>, CharSequence {
>     // @Stable annotation cho biết biến được sửa đổi tối đa một lần, được gọi là "ổn định".
>     @Stable
>     private final byte[] value;
> }
>
> abstract class AbstractStringBuilder implements Appendable, CharSequence {
>     byte[] value;
> }
> ```
>
> **Tại sao Java 9 lại thay đổi cài đặt cơ sở của `String` từ `char[]` thành `byte[]`?**
>
> Phiên bản mới của String thực sự hỗ trợ hai sơ đồ mã hóa: Latin-1 và UTF-16. Nếu chuỗi chứa các ký tự Hán trong phạm vi có thể được biểu diễn bằng Latin-1, thì sơ đồ mã hóa Latin-1 sẽ được sử dụng. Trong sơ đồ mã hóa Latin-1, `byte` chiếm một byte (8 bit), `char` chiếm 2 byte (16 bit), `byte` tiết kiệm một nửa bộ nhớ so với `char`.
>
> JDK chính thức nói rằng phần lớn các đối tượng chuỗi chỉ chứa các ký tự có thể được biểu diễn bằng Latin-1.
>
> Nếu chuỗi chứa các ký tự Hán vượt quá phạm vi có thể được biểu diễn bằng Latin-1, thì không gian bị chiếm bởi `byte` và `char` là như nhau.

### ⭐️ Sử dụng "+" hay StringBuilder để nối chuỗi?

Ngôn ngữ Java không hỗ trợ nạp chồng toán tử, "+" và "+=" là các toán tử được nạp chồng đặc biệt cho lớp String, cũng là hai toán tử duy nhất được nạp chồng trong Java.

```java
String str1 = "he";
String str2 = "llo";
String str3 = "world";
String str4 = str1 + str2 + str3;
```

Mã byte tương ứng với đoạn mã trên:

Có thể thấy rằng, các đối tượng chuỗi thông qua cách nối chuỗi "+" thực sự được triển khai bằng cách gọi phương thức `append()` của `StringBuilder`, sau khi nối xong, gọi `toString()` để nhận được một đối tượng `String`.

Tuy nhiên, nếu sử dụng "+" cho nối chuỗi bên trong vòng lặp, sẽ có một vấn đề rõ ràng: **trình biên dịch sẽ không tạo một `StringBuilder` duy nhất để tái sử dụng, sẽ dẫn đến việc tạo quá nhiều đối tượng `StringBuilder`**.

```java
String[] arr = {"he", "llo", "world"};
String s = "";
for (int i = 0; i < arr.length; i++) {
    s += arr[i];
}
System.out.println(s);
```

Đối tượng `StringBuilder` được tạo bên trong vòng lặp, điều này có nghĩa là mỗi lần lặp sẽ tạo một đối tượng `StringBuilder`.

Nếu sử dụng trực tiếp đối tượng `StringBuilder` để nối chuỗi, vấn đề này sẽ không xảy ra.

```java
String[] arr = {"he", "llo", "world"};
StringBuilder s = new StringBuilder();
for (String value : arr) {
    s.append(value);
}
System.out.println(s);
```

Nếu bạn sử dụng IDEA, cơ chế kiểm tra mã được tích hợp sẵn trong IDEA cũng sẽ gợi ý bạn sửa đổi mã.

Trong JDK 9, phép cộng chuỗi "+" được thay đổi để sử dụng phương thức động `makeConcatWithConstants()` để triển khai, bằng cách cấp phát sẵn không gian từ đó giảm bớt việc tạo một số đối tượng tạm thời. Tuy nhiên, tối ưu hóa này chủ yếu dành cho phép nối chuỗi đơn giản, chẳng hạn như: `a+b+c`. Đối với các thao tác nối lớp bên trong vòng lặp, vẫn sẽ cấp phát bộ nhớ động từng cái một (tương tự khái niệm hai cái hai append), hiệu suất không cao bằng cách sử dụng StringBuilder thủ công để nối.

### String#equals() và Object#equals() có gì khác nhau?

Phương thức `equals` trong `String` đã bị ghi đè, so sánh giá trị của chuỗi String có bằng nhau hay không. Phương thức `equals` của `Object` là so sánh địa chỉ bộ nhớ của các đối tượng.

### ⭐️ Bạn hiểu về tác dụng của string constant pool không?

**String constant pool** là một vùng được JVM mở ra để nâng cao hiệu suất và giảm mức tiêu thụ bộ nhớ đối với các chuỗi (lớp String), mục đích chính là tránh tạo các chuỗi trùng lặp.

```java
// 1. Tìm kiếm đối tượng chuỗi "ab" trong string constant pool, nếu không có thì tạo "ab" và đặt vào string constant pool
// 2. Gán tham chiếu đối tượng chuỗi "ab" cho aa
String aa = "ab";
// Trực tiếp trả về đối tượng chuỗi "ab" trong string constant pool, gán cho tham chiếu bb
String bb = "ab";
System.out.println(aa==bb); // true
```

Để biết thêm thông tin về string constant pool, bạn có thể xem bài viết [Chi tiết về vùng bộ nhớ Java](https://javaguide.cn/java/jvm/memory-area.html).

### ⭐️ Câu lệnh `String s1 = new String("abc");` tạo bao nhiêu đối tượng chuỗi?

Câu trả lời trước tiên: sẽ tạo 1 hoặc 2 đối tượng chuỗi.

1. Nếu "abc" không tồn tại trong string constant pool: sẽ tạo 2 đối tượng chuỗi. Một cái trong string constant pool, được tạo bởi lệnh `ldc`. Một cái trong heap, được tạo bởi `new String()`, được khởi tạo sử dụng "abc" từ constant pool.
2. Nếu "abc" đã tồn tại trong string constant pool: sẽ tạo 1 đối tượng chuỗi. Đối tượng này trong heap, được tạo bởi `new String()`, được khởi tạo sử dụng "abc" từ constant pool.

Bây giờ hãy bắt đầu phân tích chi tiết.

1、Nếu đối tượng chuỗi "abc" không tồn tại trong string constant pool, trước tiên nó sẽ tạo đối tượng chuỗi "abc" trong string constant pool, sau đó tạo một đối tượng chuỗi "abc" khác trong heap memory.

Ví dụ mã (JDK 1.8):

```java
String s1 = new String("abc");
```

Mã byte tương ứng:

```java
// Cấp phát một đối tượng String chưa được khởi tạo trong heap memory.
// #2 là một tham chiếu tượng trưng trong constant pool, chỉ đến lớp java/lang/String.
// Trong giai đoạn giải quyết của việc tải lớp, tham chiếu tượng trưng này sẽ được giải quyết thành tham chiếu trực tiếp, tức là chỉ đến lớp java/lang/String thực tế.
0 new #2 <java/lang/String>
// Sao chép tham chiếu đối tượng String ở đỉnh stack, chuẩn bị cho cuộc gọi hàm khởi tạo tiếp theo.
// Lúc này, operand stack có hai tham chiếu đối tượng giống nhau: một được chuyển đến hàm khởi tạo, cái kia để giữ tham chiếu đến đối tượng mới, sau này sẽ được lưu trữ trong bảng biến cục bộ.
3 dup
// JVM trước tiên kiểm tra xem "abc" có tồn tại trong string constant pool hay không.
// Nếu "abc" đã tồn tại trong constant pool, trả về trực tiếp tham chiếu của chuỗi đó;
// Nếu "abc" không tồn tại trong constant pool, JVM sẽ tạo chuỗi từ chữ "abc" trong constant pool và trả về tham chiếu của nó.
// Tham chiếu này được đẩy vào operand stack, được sử dụng như một tham số của hàm khởi tạo.
4 ldc #3 <abc>
// Gọi phương thức khởi tạo, sử dụng "abc" được tải từ constant pool để khởi tạo đối tượng String trong heap
// Đối tượng String mới sẽ chứa nội dung giống như "abc" trong constant pool, nhưng nó là một đối tượng độc lập, được lưu trữ trong heap.
6 invokespecial #4 <java/lang/String.<init> : (Ljava/lang/String;)V>
// Lưu trữ tham chiếu đối tượng String trong heap vào bảng biến cục bộ
9 astore_1
// Trả về, kết thúc phương thức
10 return
```

Lệnh `ldc (load constant)` thực sự tải các hằng số khác nhau từ constant pool, bao gồm hằng số chuỗi, hằng số nguyên, hằng số dấu phẩy động, thậm chí các tham chiếu lớp. Đối với hằng số chuỗi, hành vi của lệnh `ldc` như sau:

1. **Tải chuỗi từ constant pool**: `ldc` trước tiên kiểm tra xem constant pool đã có đối tượng chuỗi có nội dung giống nhau hay chưa.
2. **Tái sử dụng đối tượng chuỗi hiện có**: Nếu constant pool đã có đối tượng chuỗi có nội dung giống nhau, `ldc` sẽ tải tham chiếu của đối tượng đó vào operand stack.
3. **Không có thì tạo mới và thêm vào constant pool**: Nếu constant pool không có đối tượng chuỗi có nội dung giống nhau, JVM sẽ tạo một đối tượng chuỗi mới trong constant pool, và tải tham chiếu của nó vào operand stack.

2、Nếu đối tượng chuỗi "abc" đã tồn tại trong string constant pool, sẽ chỉ tạo 1 đối tượng chuỗi "abc" trong heap.

Ví dụ mã (JDK 1.8):

```java
// Đối tượng chuỗi "abc" đã tồn tại trong string constant pool
String s1 = "abc";
// Đoạn mã dưới đây chỉ sẽ tạo 1 đối tượng chuỗi "abc" trong heap
String s2 = new String("abc");
```

Mã byte tương ứng:

```java
0 ldc #2 <abc>
2 astore_1
3 new #3 <java/lang/String>
6 dup
7 ldc #2 <abc>
9 invokespecial #4 <java/lang/String.<init> : (Ljava/lang/String;)V>
12 astore_2
13 return
```

Ở đây không chi tiết bình luận mã byte ở trên, lệnh `ldc` ở vị trí 7 sẽ không tạo một đối tượng chuỗi mới "abc" trong heap, điều này là vì lệnh `ldc` ở vị trí 0 đã được thực thi một lần, đã tạo một đối tượng chuỗi "abc" trong heap một lần rồi. Lệnh `ldc` ở vị trí 7 sẽ trực tiếp trả về tham chiếu của đối tượng chuỗi "abc" trong string constant pool.

### Phương thức String#intern() có tác dụng gì?

`String.intern()` là một phương thức `native` (bản địa), được sử dụng để xử lý các tham chiếu đối tượng chuỗi trong string constant pool. Quy trình làm việc của nó có thể được tóm tắt như sau:

1. **Constant pool đã có đối tượng chuỗi có nội dung giống nhau**: Nếu string constant pool đã có một đối tượng `String` có nội dung giống với chuỗi gọi phương thức `intern()`, phương thức `intern()` sẽ trực tiếp trả về tham chiếu của đối tượng đó trong constant pool.
2. **Constant pool không có đối tượng chuỗi có nội dung giống nhau**: Nếu string constant pool chưa có một đối tượng có nội dung giống với chuỗi gọi phương thức `intern()`, phương thức `intern()` sẽ thêm tham chiếu của đối tượng chuỗi hiện tại vào string constant pool, và trả về tham chiếu đó.

Tóm tắt:

- Công dụng chính của phương thức `intern()` là đảm bảo tính duy nhất của tham chiếu chuỗi trong constant pool.
- Khi gọi `intern()`, nếu constant pool đã có chuỗi có nội dung giống nhau, sẽ trả về tham chiếu của đối tượng hiện có trong constant pool; ngược lại, sẽ thêm chuỗi này vào constant pool và trả về tham chiếu của nó.

Ví dụ mã (JDK 1.8):

```java
// s1 chỉ đến đối tượng "Java" trong string constant pool
String s1 = "Java";
// s2 cũng chỉ đến đối tượng "Java" trong string constant pool, là cùng một đối tượng với s1
String s2 = s1.intern();
// Tạo một đối tượng "Java" mới trong heap, s3 chỉ đến nó
String s3 = new String("Java");
// s4 chỉ đến đối tượng "Java" trong string constant pool, là cùng một đối tượng với s1
String s4 = s3.intern();
// s1 và s2 chỉ đến cùng một đối tượng trong constant pool
System.out.println(s1 == s2); // true
// s3 chỉ đến đối tượng trong heap, s4 chỉ đến đối tượng trong constant pool, vì vậy khác nhau
System.out.println(s3 == s4); // false
// s1 và s4 đều chỉ đến cùng một đối tượng trong constant pool
System.out.println(s1 == s4); // true
```

### Điều gì xảy ra khi biến loại String và hằng số String thực hiện phép "+"?

Trước tiên, hãy xem trường hợp cộng chuỗi không có từ khóa `final` (JDK1.8):

```java
String str1 = "str";
String str2 = "ing";
String str3 = "str" + "ing";
String str4 = str1 + str2;
String str5 = "string";
System.out.println(str3 == str4);//false
System.out.println(str3 == str5);//true
System.out.println(str4 == str5);//false
```

> **Lưu ý**: Để so sánh xem giá trị của chuỗi String có bằng nhau hay không, có thể sử dụng phương thức `equals()`. Phương thức `equals` trong `String` đã bị ghi đè. Phương thức `equals` của `Object` so sánh địa chỉ bộ nhớ của các đối tượng, trong khi phương thức `equals` của `String` so sánh xem giá trị của chuỗi có bằng nhau hay không. Nếu sử dụng `==` để so sánh xem hai chuỗi có bằng nhau hay không, IDEA vẫn sẽ gợi ý bạn sử dụng phương thức `equals()` để thay thế.

**Đối với các chuỗi mà giá trị có thể được xác định vào thời kỳ biên dịch, tức là hằng số chuỗi, JVM sẽ lưu trữ chúng vào string constant pool. Hơn nữa, chuỗi được lấy từ việc nối các hằng số chuỗi đã được lưu trữ trong string constant pool tại thời kỳ biên dịch, điều này là nhờ tối ưu hóa của trình biên dịch.**

Trong quá trình biên dịch, trình biên dịch Javac (gọi là trình biên dịch trong phần dưới đây) thực hiện một tối ưu hóa mã được gọi là **constant folding** (gấp hằng số).

Constant folding sẽ tính toán giá trị của biểu thức hằng số và nhúng nó dưới dạng hằng số trong mã được tạo cuối cùng, đây là một trong số rất ít các tối ưu hóa mà trình biên dịch Javac sẽ thực hiện trên mã nguồn (các tối ưu hóa mã hầu như đều được thực hiện trong trình biên dịch theo thời gian thực).

Đối với `String str3 = "str" + "ing";`, trình biên dịch sẽ tối ưu hóa cho bạn thành `String str3 = "string";`.

Không phải tất cả các hằng số đều sẽ được gấp, chỉ những hằng số mà trình biên dịch có thể xác định giá trị trong quá trình biên dịch chương trình mới có thể:

- Các kiểu dữ liệu cơ bản (`byte`, `boolean`, `short`, `char`, `int`, `float`, `long`, `double`) cũng như hằng số chuỗi.
- Các biến kiểu dữ liệu cơ bản và chuỗi được sửa đổi bằng `final`
- Chuỗi được tạo thông qua phép nối "+", phép toán số học giữa các kiểu dữ liệu cơ bản (cộng, trừ, nhân, chia), phép toán bit của kiểu dữ liệu cơ bản (<<, >>, >>>)

**Giá trị của tham chiếu không thể được xác định vào thời kỳ biên dịch chương trình, trình biên dịch không thể tối ưu hóa nó.**

Tham chiếu đối tượng và cách nối chuỗi "+", thực tế được triển khai bằng cách gọi phương thức `append()` của `StringBuilder`, sau khi nối xong, gọi `toString()` để nhận được một đối tượng `String`.

```java
String str4 = new StringBuilder().append(str1).append(str2).toString();
```

Khi viết mã bình thường, hãy cố gắng tránh nối nhiều đối tượng chuỗi, vì điều này sẽ tạo lại các đối tượng. Nếu cần thay đổi chuỗi, có thể sử dụng `StringBuilder` hoặc `StringBuffer`.

Tuy nhiên, sau khi chuỗi được khai báo bằng từ khóa `final`, có thể để trình biên dịch xử lý nó như một hằng số.

Ví dụ mã:

```java
final String str1 = "str";
final String str2 = "ing";
// Hai biểu thức dưới đây thực sự tương đương
String c = "str" + "ing";// đối tượng trong constant pool
String d = str1 + str2; // đối tượng trong constant pool
System.out.println(c == d);// true
```

Sau khi được sửa đổi bằng từ khóa `final`, `String` sẽ được trình biên dịch coi như một hằng số, trình biên dịch có thể xác định giá trị của nó vào thời kỳ biên dịch, tác dụng của nó giống như truy cập một hằng số.

Nếu giá trị của hằng số chỉ có thể được biết vào thời kỳ chạy, sẽ không thể tối ưu hóa nó.

Ví dụ mã (`str2` chỉ có thể xác định giá trị vào thời kỳ chạy):

```java
final String str1 = "str";
final String str2 = getStr();
String c = "str" + "ing";// đối tượng trong constant pool
String d = str1 + str2; // đối tượng mới được tạo trong heap
System.out.println(c == d);// false
public static String getStr() {
      return "ing";
}
```

## Tham khảo

- Deep analysis of String#intern: <https://tech.meituan.com/2014/03/06/in-depth-understanding-string-intern.html>
- Java String source code reading: <http://keaper.cn/2020/09/08/java-string-mian-mian-guan/>
- R's answer about constant folding: <https://www.zhihu.com/question/55976094/answer/147302764>
