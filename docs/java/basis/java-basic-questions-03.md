---
title: Tóm Tắt Các Câu Hỏi Phỏng Vấn Java Cơ Bản (Phần 2)
description: Tóm tắt các câu hỏi phỏng vấn Java về các tính năng nâng cao giải thích chi tiết cơ chế xử lý ngoại lệ, nguyên lý kiểu dữ liệu chung, ứng dụng phản ánh, cách sử dụng chú thích, cơ chế SPI, tuần tự hóa, mô hình IO (BIO/NIO/AIO), cú pháp đường tắt và các kiến thức cốt lõi khác.
category: Java
tag:
  - Java Cơ Bản
head:
  - - meta
    - name: keywords
      content: ngoại lệ Java, kiểu dữ liệu chung, phản ánh, chú thích, SPI, tuần tự hóa, IO, cú pháp đường tắt, try-with-resources, BIO NIO AIO, câu hỏi phỏng vấn Java
---

## Ngoại Lệ

**Tổng Quan Về Cấu Trúc Phân Cấp Ngoại Lệ Java**:

Các ngoại lệ trong Java có một tổ tiên chung là lớp `Throwable` trong gói `java.lang`. Lớp `Throwable` có hai lớp con quan trọng:

- **`Exception`**: Ngoại lệ mà chương trình chính nó có thể xử lý, có thể được bắt bằng `catch`. `Exception` có thể chia thành Checked Exception (ngoại lệ được kiểm tra, phải xử lý) và Unchecked Exception (ngoại lệ không được kiểm tra, có thể không xử lý).
- **`Error`**: Lỗi mà chương trình không thể xử lý, ~~không có cách để bắt bằng `catch`~~không nên bắt bằng `catch`. Ví dụ như lỗi chạy máy ảo Java (`Virtual MachineError`), lỗi bộ nhớ máy ảo không đủ (`OutOfMemoryError`), lỗi định nghĩa lớp (`NoClassDefFoundError`), v.v. Khi những ngoại lệ này xảy ra, máy ảo Java (JVM) thường sẽ chọn kết thúc luồng.

### ClassNotFoundException Và NoClassDefFoundError Có Gì Khác Nhau?

- `ClassNotFoundException` là Exception, xảy ra khi sử dụng phản ánh để tải động không tìm thấy lớp, là điều có thể dự tính, có thể bắt và xử lý.
- `NoClassDefFoundError` là Error, là lớp tồn tại lúc biên dịch, nhưng không liên kết được lúc chạy (ví dụ: tệp jar bị thiếu), là vấn đề môi trường, khiến JVM không thể tiếp tục.

### ⭐️Checked Exception Và Unchecked Exception Có Gì Khác Nhau?

**Checked Exception** tức là ngoại lệ được kiểm tra, trong quá trình biên dịch code Java, nếu ngoại lệ được kiểm tra không được `catch` hoặc xử lý bằng từ khóa `throws`, thì sẽ không thể vượt qua biên dịch.

Ví dụ đoạn code hoạt động IO dưới đây:

Ngoài `RuntimeException` và các lớp con của nó, tất cả các lớp `Exception` khác và lớp con của chúng đều thuộc ngoại lệ được kiểm tra. Các ngoại lệ được kiểm tra phổ biến bao gồm: các ngoại lệ liên quan đến IO, `ClassNotFoundException`, `SQLException`...

**Unchecked Exception** tức là ngoại lệ không được kiểm tra, trong quá trình biên dịch code Java, ngay cả khi chúng tôi không xử lý ngoại lệ không được kiểm tra cũng có thể vượt qua biên dịch bình thường.

`RuntimeException` và tất cả các lớp con của nó được gọi chung là ngoại lệ không được kiểm tra, những ngoại lệ phổ biến (khuyến nghị ghi nhớ, sẽ thường xuyên được sử dụng trong phát triển hàng ngày):

- `NullPointerException` (lỗi con trỏ null)
- `IllegalArgumentException` (lỗi tham số, ví dụ như kiểu dữ liệu tham số phương thức sai)
- `NumberFormatException` (lỗi định dạng chuyển đổi chuỗi thành số, lớp con của `IllegalArgumentException`)
- `ArrayIndexOutOfBoundsException` (lỗi vượt chỉ số mảng)
- `ClassCastException` (lỗi chuyển đổi kiểu)
- `ArithmeticException` (lỗi tính toán)
- `SecurityException` (lỗi bảo mật, ví dụ như quyền không đủ)
- `UnsupportedOperationException` (lỗi hoạt động không được hỗ trợ, ví dụ tạo lại người dùng giống nhau)
- ...

### Bạn Thích Sử Dụng Checked Exception Hay Unchecked Exception Hơn?

Mặc định sử dụng Unchecked Exception, chỉ sử dụng Checked Exception khi cần thiết.

Chúng ta có thể coi Unchecked Exception (ví dụ như `NullPointerException`) như một lỗi code. Cách tốt nhất để xử lý lỗi là để nó lộ ra rồi sửa code, thay vì dùng `try-catch` để che giấu nó.

Nói chung, chỉ sử dụng Checked Exception trong một tình huống: khi ngoại lệ này là một phần của logic kinh doanh, và người gọi phải xử lý nó. Ví dụ, một ngoại lệ về số dư không đủ. Đây không phải là lỗi, mà là một nhánh kinh doanh bình thường, tôi cần sử dụng Checked Exception để buộc người gọi xử lý tình huống này, ví dụ như nhắc người dùng nạp tiền. Bằng cách này, chúng ta có thể đảm bảo tính toàn vẹn của logic kinh doanh quan trọng đồng thời giữ code càng đơn giản càng tốt.

### Lớp Throwable Có Những Phương Thức Thường Dùng Nào?

- `String getMessage()`: Trả về thông tin chi tiết khi xảy ra ngoại lệ
- `String toString()`: Trả về mô tả ngắn gọn khi xảy ra ngoại lệ
- `String getLocalizedMessage()`: Trả về thông tin bản địa hóa của đối tượng ngoại lệ. Sử dụng lớp con của `Throwable` để ghi đè phương thức này, có thể tạo thông tin bản địa hóa. Nếu lớp con không ghi đè phương thức này, thì thông tin được trả về bởi phương thức này giống như kết quả được trả về bởi `getMessage()`
- `void printStackTrace()`: In thông tin ngoại lệ được `Throwable` đóng gói lên bảng điều khiển

### Cách Sử Dụng try-catch-finally?

- Khối `try`: Được sử dụng để bắt ngoại lệ. Sau nó có thể theo sau không hoặc nhiều khối `catch`, nếu không có khối `catch`, thì phải theo sau một khối `finally`.
- Khối `catch`: Được sử dụng để xử lý ngoại lệ mà khối try bắt được.
- Khối `finally`: Bất kể có bắt hoặc xử lý ngoại lệ hay không, các câu lệnh trong khối `finally` đều sẽ được thực thi. Khi gặp câu lệnh `return` trong khối `try` hoặc khối `catch`, khối câu lệnh `finally` sẽ được thực thi trước khi phương thức trả về.

Ví dụ mã code:

```java
try {
    System.out.println("Thử làm gì đó");
    throw new RuntimeException("RuntimeException");
} catch (Exception e) {
    System.out.println("Bắt Exception -> " + e.getMessage());
} finally {
    System.out.println("Finally");
}
```

Đầu ra:

```plain
Thử làm gì đó
Bắt Exception -> RuntimeException
Finally
```

**Lưu Ý: Không nên sử dụng return trong khối lệnh finally!** Khi cả khối try và khối finally đều có câu lệnh return, câu lệnh return trong khối try sẽ bị bỏ qua. Điều này là do giá trị trả về của return trong câu lệnh try sẽ được lưu trữ tạm thời trong một biến cục bộ trước, khi thực thi đến câu lệnh return trong khối finally, giá trị của biến cục bộ này sẽ trở thành giá trị return của khối finally.

Ví dụ mã code:

```java
public static void main(String[] args) {
    System.out.println(f(2));
}

public static int f(int value) {
    try {
        return value * value;
    } finally {
        if (value == 2) {
            return 0;
        }
    }
}
```

Đầu ra:

```plain
0
```

### Mã Code Trong finally Có Chắc Chắn Sẽ Được Thực Thi Không?

Không chắc chắn! Trong một số tình huống nhất định, mã code trong finally sẽ không được thực thi.

Chẳng hạn, nếu máy ảo bị chấm dứt trước khi finally thực thi, thì mã code trong finally sẽ không được thực thi.

```java
try {
    System.out.println("Thử làm gì đó");
    throw new RuntimeException("RuntimeException");
} catch (Exception e) {
    System.out.println("Bắt Exception -> " + e.getMessage());
    // Chấm dứt máy ảo Java đang chạy
    System.exit(1);
} finally {
    System.out.println("Finally");
}
```

Đầu ra:

```plain
Thử làm gì đó
Bắt Exception -> RuntimeException
```

Ngoài ra, trong 2 tình huống đặc biệt sau đây, mã code của khối `finally` cũng sẽ không được thực thi:

1. Chương trình ở trong luồng chết
2. CPU bị tắt

### Cách Sử Dụng `try-with-resources` Thay Thế `try-catch-finally`?

1. **Phạm Vi Áp Dụng (Định Nghĩa Tài Nguyên)**: Bất kỳ đối tượng nào triển khai `java.lang.AutoCloseable` hoặc `java.io.Closeable`
2. **Thứ Tự Đóng Tài Nguyên Và Thực Thi Khối finally**: Trong câu lệnh `try-with-resources`, bất kỳ khối catch hoặc finally nào đều được chạy sau khi các tài nguyên được khai báo bị đóng

Trong "Effective Java" có nêu rõ:

> Đối mặt với những tài nguyên phải đóng, chúng ta nên ưu tiên sử dụng `try-with-resources` thay vì `try-finally`. Mã code kết quả sẽ ngắn hơn, rõ ràng hơn, và các ngoại lệ được tạo ra cũng hữu ích hơn cho chúng ta. `try-with-resources` làm cho việc viết code cho những tài nguyên phải đóng dễ dàng hơn, nếu sử dụng `try-finally` thì gần như không thể làm được.

Các tài nguyên như `InputStream`, `OutputStream`, `Scanner`, `PrintWriter` v.v. trong Java đều cần chúng ta gọi phương thức `close()` để đóng thủ công, nói chung chúng ta đều triển khai nhu cầu này thông qua câu lệnh `try-catch-finally`, như sau:

```java
// Đọc nội dung của tệp văn bản
Scanner scanner = null;
try {
    scanner = new Scanner(new File("D://read.txt"));
    while (scanner.hasNext()) {
        System.out.println(scanner.nextLine());
    }
} catch (FileNotFoundException e) {
    e.printStackTrace();
} finally {
    if (scanner != null) {
        scanner.close();
    }
}
```

Sử dụng câu lệnh `try-with-resources` sau Java 7 để cải tổ code trên:

```java
try (Scanner scanner = new Scanner(new File("test.txt"))) {
    while (scanner.hasNext()) {
        System.out.println(scanner.nextLine());
    }
} catch (FileNotFoundException fnfe) {
    fnfe.printStackTrace();
}
```

Tất nhiên, khi cần đóng nhiều tài nguyên, sử dụng `try-with-resources` cũng rất đơn giản, nếu bạn vẫn sử dụng `try-catch-finally` có thể gây ra nhiều vấn đề.

Thông qua sử dụng dấu chấm phẩy để phân cách, bạn có thể khai báo nhiều tài nguyên trong khối `try-with-resources`.

```java
try (BufferedInputStream bin = new BufferedInputStream(new FileInputStream(new File("test.txt")));
     BufferedOutputStream bout = new BufferedOutputStream(new FileOutputStream(new File("out.txt")))) {
    int b;
    while ((b = bin.read()) != -1) {
        bout.write(b);
    }
}
catch (IOException e) {
    e.printStackTrace();
}
```

### ⭐️Có Những Điểm Nào Cần Lưu Ý Khi Sử Dụng Ngoại Lệ?

- Không nên định nghĩa ngoại lệ làm biến tĩnh, vì điều này sẽ dẫn đến thông tin ngăn xếp ngoại lệ bị xáo trộn. Mỗi lần ném ngoại lệ thủ công, chúng ta cần ném một đối tượng ngoại lệ mới được tạo.
- Thông tin ngoại lệ được ném phải có ý nghĩa.
- Khuyến nghị ném ngoại lệ cụ thể hơn, ví dụ như khi lỗi chuyển đổi định dạng chuỗi sang số, nên ném `NumberFormatException` thay vì lớp cha `IllegalArgumentException`.
- Tránh ghi lại log lặp lại: Nếu ở nơi bắt ngoại lệ đã ghi lại thông tin đầy đủ (bao gồm loại ngoại lệ, thông báo lỗi và theo dõi ngăn xếp), thì khi ném lại ngoại lệ này trong code kinh doanh, không nên ghi lại cùng thông báo lỗi. Ghi lại log lặp lại sẽ làm cho tệp log phình ra, và có thể che giấu nguyên nhân thực tế của vấn đề, làm cho vấn đề khó theo dõi và giải quyết hơn.
- ...

## Kiểu Dữ Liệu Chung

### Kiểu Dữ Liệu Chung Là Gì? Có Tác Dụng Gì?

**Kiểu dữ liệu chung Java (Generics)** là tính năng mới được giới thiệu trong JDK 5. Sử dụng tham số kiểu dữ liệu chung, có thể tăng khả năng đọc hiểu và tính ổn định của code.

Trình biên dịch có thể kiểm tra tham số kiểu dữ liệu chung, và thông qua tham số kiểu dữ liệu chung có thể chỉ định loại đối tượng được truyền vào. Ví dụ `ArrayList<Person> persons = new ArrayList<Person>()` dòng code này chỉ rõ rằng đối tượng `ArrayList` này chỉ có thể chứa các đối tượng kiểu `Person`, nếu truyền vào kiểu khác sẽ báo lỗi.

```java
ArrayList<E> extends AbstractList<E>
```

Ngoài ra, `List` gốc có kiểu trả về là `Object`, cần chuyển đổi kiểu thủ công để sử dụng, sử dụng kiểu dữ liệu chung sau khi trình biên dịch tự động chuyển đổi.

### Cách Sử Dụng Kiểu Dữ Liệu Chung Có Bao Nhiêu?

Kiểu dữ liệu chung thường có ba cách sử dụng: **lớp kiểu dữ liệu chung**, **giao diện kiểu dữ liệu chung**, **phương thức kiểu dữ liệu chung**.

Để tìm hiểu chi tiết về kiểu dữ liệu chung, hãy xem bài viết [Chi Tiết Về Kiểu Dữ Liệu Chung & Ký Tự Đại Diện](./generics-and-wildcards.md).

## Phản Ánh

### Phản Ánh Được Sử Dụng Trong Những Tình Huống Nào?

Phản ánh được sử dụng rộng rãi trong các framework. Ví dụ:

- **Spring Framework**: Spring sử dụng phản ánh để tạo instance, setter injection, v.v.
- **MyBatis, Hibernate**: Những framework ORM này sử dụng phản ánh để tạo instance đối tượng và thiết lập giá trị thuộc tính.

Ngoài ra, trong quá trình phát triển, chúng ta cũng có thể sử dụng phản ánh để gọi phương thức private, lấy hoặc sửa đổi giá trị trường riêng tư để viết các bài kiểm tra.

Những framework như MyBatis, Hibernate có thể giúp bạn chuyển đổi một dòng dữ liệu được truy vấn từ cơ sở dữ liệu thành một đối tượng Java. Nó biết trường cơ sở dữ liệu tương ứng với thuộc tính Java nào như thế nào? Vẫn là nhờ phản ánh. Nó lấy danh sách thuộc tính của lớp Java thông qua phản ánh, sau đó ánh xạ kết quả truy vấn theo tên hoặc cấu hình, sau đó sử dụng phản ánh để gọi setter hoặc sửa đổi trực tiếp giá trị trường. Ngược lại, khi lưu đối tượng vào cơ sở dữ liệu, cũng sử dụng phản ánh để đọc giá trị thuộc tính để tạo SQL.

## Proxy

Để tìm hiểu chi tiết về proxy Java, bạn có thể xem bài viết [Chi Tiết Về Mẫu Proxy Java](proxy.md).

### Cách Triển Khai Proxy Động?

Proxy động là một mẫu thiết kế rất mạnh, nó cho phép chúng ta **không sửa đổi mã nguồn**, để **nâng cao chức năng (Enhancement)** các phương thức của một lớp hoặc đối tượng.

Trong Java, những cách phổ biến nhất để triển khai proxy động là: **Proxy Động JDK** và **Proxy Động CGLIB**.

**Loại Thứ Nhất: Proxy Động JDK**

Được cung cấp bởi chính thức Java, yêu cầu cốt lõi là lớp mục tiêu phải triển khai một hoặc nhiều giao diện. Proxy động JDK, lúc chạy, sẽ sử dụng phương thức `Proxy.newProxyInstance()` để tạo động một instance của lớp proxy triển khai những giao diện này. Lớp proxy này được tạo ra trong bộ nhớ, bạn không thể thấy tệp `.java` hoặc `.class` của nó.

Khi bạn gọi bất kỳ phương thức nào của đối tượng proxy, lệnh gọi này sẽ được chuyển tiếp tới phương thức `invoke` của giao diện `InvocationHandler` mà chúng ta cung cấp. Trong phương thức `invoke`, chúng ta có thể thêm logic nâng cao của chúng ta trước hoặc sau khi gọi phương thức gốc (phương thức mục tiêu).

**Loại Thứ Hai: Proxy Động CGLIB**

CGLIB là thư viện tạo mã của bên thứ ba. Nguyên lý của nó hoàn toàn khác với JDK, nó không yêu cầu lớp được proxy phải triển khai giao diện. Lúc chạy, nó tạo động lớp con của lớp mục tiêu làm lớp proxy (thông qua kỹ thuật thao tác bytecode ASM). Sau đó, nó sẽ ghi đè tất cả các phương thức không phải `final`, `private` và `static` trong lớp cha (tức là lớp được proxy).

Khi bạn gọi bất kỳ phương thức nào của đối tượng proxy, lệnh gọi này sẽ được phương thức `intercept` của giao diện `MethodInterceptor` của CGLIB bắt giữ. Giống như phương thức `invoke` của `InvocationHandler`, chúng ta có thể thêm logic nâng cao của chúng ta trong phương thức `intercept`, trước hoặc sau khi gọi phương thức lớp cha gốc.

### Proxy Tĩnh Và Proxy Động Có Gì Khác Nhau?

Sự khác biệt cốt lõi giữa proxy tĩnh và proxy động là **thời điểm xác định mối quan hệ proxy, tính linh hoạt của cách triển khai và chi phí bảo trì**.

| Khía Cạnh So Sánh                    | Proxy Tĩnh (Static Proxy)                                                                                                                                               | Proxy Động (Dynamic Proxy)                                                                                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Thời Điểm Xác Định Mối Quan Hệ Proxy | Thời gian biên dịch (sinh tệp bytecode `.class` cố định sau biên dịch)                                                                                                  | Thời gian chạy (tạo động bytecode lớp proxy và tải vào JVM)                                                                                                      |
| Cách Triển Khai                      | Viết thủ công lớp proxy, cần triển khai cùng giao diện với lớp mục tiêu, ràng buộc một-một                                                                              | Không cần viết thủ công lớp proxy, thông qua `Handler`/`Interceptor` để bao bọc logic nâng cao, tái sử dụng một-nhiều                                            |
| Phụ Thuộc Giao Diện                  | Phải triển khai giao diện (lớp proxy và lớp mục tiêu tuân theo cùng quy chuẩn giao diện)                                                                                | Hỗ trợ proxy giao diện hoặc proxy trực tiếp lớp triển khai                                                                                                       |
| Lượng Code & Tính Bảo Trì            | Lượng code lớn (càng nhiều lớp mục tiêu, càng nhiều lớp proxy), chi phí bảo trì cao; khi thêm phương thức giao diện mới, lớp mục tiêu và lớp proxy cần cập nhật đồng bộ | Lượng code rất ít (logic nâng cao chung có thể tái sử dụng), khả năng bảo trì tốt; giải phóng khỏi giao diện, thay đổi giao diện không ảnh hưởng đến logic proxy |
| Ưu Điểm Cốt Lõi                      | Triển khai đơn giản, logic rõ ràng, không có phụ thuộc framework bổ sung                                                                                                | Tính linh hoạt mạnh, tính tái sử dụng cao, giảm mã code lặp lại, thích hợp với các tình huống phức tạp                                                           |
| Tình Huống Ứng Dụng Điển Hình        | Mẫu decorator đơn giản, nhu cầu nâng cao một số lớp cố định                                                                                                             | Spring AOP, RPC Framework (như Dubbo), ORM Framework                                                                                                             |

### ⭐️Proxy Động JDK Và Proxy Động CGLIB Có Gì Khác Nhau?

1. Proxy động JDK là chính thức, nó yêu cầu lớp được proxy phải triển khai giao diện. Nguyên lý của nó là tạo động một lớp triển khai giao diện làm proxy. CGLIB là của bên thứ ba, nó không cần giao diện. Nguyên lý của nó là tạo động một lớp con của lớp được proxy làm proxy. Nhưng cũng chính vì là kế thừa, nên nó không thể proxy lớp `final`, phương thức được proxy cũng không thể là `final` hoặc `private`.
2. Về hiệu suất của cả hai, hầu hết các tình huống proxy động JDK là tuyệt vời hơn, với việc nâng cấp phiên bản JDK, ưu thế này trở nên rõ ràng hơn.

### ⭐️Giới Thiệu Các Tình Huống Ứng Dụng Thực Tế Của Proxy Động Trong Framework

Tình huống ứng dụng điển hình nhất của proxy động là **Spring AOP**.

AOP (Aspect-Oriented Programming: Lập Trình Hướng Khía Cạnh) có thể bao bọc những logic hoặc trách nhiệm không liên quan đến kinh doanh nhưng được gọi chung bởi các module kinh doanh (ví dụ: xử lý giao dịch, quản lý log, kiểm soát quyền hạn, v.v.), giúp giảm mã code lặp lại của hệ thống, giảm độ liên kết giữa các module, và có lợi cho tính mở rộng và khả năng bảo trì trong tương lai.

Spring AOP dựa trên proxy động, nếu đối tượng được proxy triển khai một giao diện nào đó, Spring AOP sẽ sử dụng **JDK Proxy** để tạo đối tượng proxy, trong khi đối với các đối tượng không triển khai giao diện, Spring AOP không thể sử dụng JDK Proxy để proxy, lúc này Spring AOP sẽ sử dụng **Cglib** để tạo một lớp con của đối tượng được proxy làm proxy, như hình dưới đây:

## Chú Thích

### Chú Thích Là Gì?

`Annotation` (Chú Thích) là tính năng mới được giới thiệu từ Java5, có thể được coi như một loại chú thích đặc biệt, được sử dụng chủ yếu để sửa đổi lớp, phương thức hoặc biến, cung cấp một số thông tin để chương trình sử dụng lúc biên dịch hoặc chạy.

Bản chất của chú thích là một giao diện đặc biệt kế thừa từ `Annotation`:

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.SOURCE)
public @interface Override {

}

public interface Override extends Annotation{

}
```

JDK cung cấp nhiều chú thích tích hợp (ví dụ như `@Override`, `@Deprecated`), đồng thời, chúng ta cũng có thể tự định nghĩa chú thích.

### Có Bao Nhiêu Phương Thức Phân Tích Chú Thích?

Chú thích chỉ có hiệu lực sau khi được phân tích, những phương thức phân tích phổ biến có hai loại:

- **Quét Trực Tiếp Tại Thời Gian Biên Dịch**: Trình biên dịch quét các chú thích tương ứng khi biên dịch code Java và xử lý, ví dụ như phương thức sử dụng chú thích `@Override`, trình biên dịch sẽ kiểm tra khi biên dịch xem phương thức hiện tại có ghi đè phương thức lớp cha tương ứng hay không.
- **Xử Lý Thông Qua Phản Ánh Tại Thời Gian Chạy**: Những chú thích tích hợp trong framework (ví dụ như `@Value`, `@Component` của Spring framework) đều được xử lý thông qua phản ánh.

## ⭐️SPI

Để tìm hiểu chi tiết về SPI, vui lòng xem bài viết [Chi Tiết Về Cơ Chế SPI Java](./spi.md).

### SPI Là Gì?

SPI tức là Service Provider Interface, theo nghĩa đen là "giao diện của nhà cung cấp dịch vụ", theo hiểu biết của tôi, đó là: một giao diện được cung cấp đặc biệt cho những nhà cung cấp dịch vụ hoặc nhà phát triển mở rộng chức năng framework để sử dụng.

SPI tách biệt giao diện dịch vụ và cách triển khai dịch vụ cụ thể, giải phóng người gọi dịch vụ và nhà cung cấp dịch vụ, có thể nâng cao tính mở rộng và khả năng bảo trì của chương trình. Sửa đổi hoặc thay thế cách triển khai dịch vụ không cần phải sửa đổi người gọi.

Rất nhiều framework sử dụng cơ chế SPI của Java, ví dụ như: Spring framework, tải trình điều khiển cơ sở dữ liệu, giao diện log, cùng với cách triển khai mở rộng Dubbo, v.v.

### SPI Và API Có Gì Khác Nhau?

Khi nói đến SPI, không thể không nói đến API (Application Programming Interface), từ góc độ rộng, chúng đều là giao diện, và rất dễ bị nhầm lẫn. Dưới đây là hình minh họa:

Thông thường, các module giao tiếp với nhau thông qua giao diện, do đó chúng ta giới thiệu một "giao diện" giữa bên gọi dịch vụ và bên cung cấp dịch vụ (còn được gọi là nhà cung cấp dịch vụ).

- Khi bên cung cấp cung cấp giao diện và cách triển khai, chúng ta có thể có được khả năng mà bên cung cấp cung cấp cho chúng ta thông qua gọi giao diện của bên cung cấp, đây là **API**. Trong tình huống này, giao diện và cách triển khai đều được đặt trong gói của bên cung cấp. Người gọi gọi giao diện của bên cung cấp để có được chức năng, mà không cần quan tâm đến chi tiết triển khai cụ thể.
- Khi giao diện nằm ở phía người gọi, đây là **SPI**. Bên người gọi xác định quy tắc giao diện, sau đó các nhà cung cấp khác nhau triển khai giao diện này dựa trên quy tắc này, từ đó cung cấp dịch vụ.

Ví dụ dễ hiểu: Công ty H là một công ty công nghệ, mới thiết kế một loại con chip, và bây giờ cần sản xuất hàng loạt, trong khi trên thị trường có vài công ty sản xuất chip. Lúc này, miễn là công ty H quy định tiêu chuẩn sản xuất chip (định nghĩa tiêu chuẩn giao diện), thì những công ty sản xuất chip hợp tác (nhà cung cấp dịch vụ) sẽ giao hàng theo tiêu chuẩn, từ đó có những chip đặc thù của riêng nhà (cung cấp cách triển khai của các phương án khác nhau, nhưng kết quả được giao là giống nhau).

### Ưu Và Nhược Điểm Của SPI?

Thông qua cơ chế SPI có thể nâng cao đáng kể tính linh hoạt của thiết kế giao diện, nhưng cơ chế SPI cũng có một số nhược điểm, ví dụ như:

- Cần duyệt qua tải tất cả các lớp triển khai, không thể tải theo yêu cầu, vì vậy hiệu suất tương đối thấp.
- Khi nhiều `ServiceLoader` cùng một lúc `load`, sẽ có vấn đề đồng thời.

## ⭐️Tuần Tự Hóa Và Giải Tuần Tự Hóa

Để tìm hiểu chi tiết về tuần tự hóa và giải tuần tự hóa, vui lòng xem bài viết [Giải Thích Chi Tiết Tuần Tự Hóa Java](./serialization.md), bên trong có những kiến thức và câu hỏi phỏng vấn toàn diện hơn.

### Tuần Tự Hóa Là Gì? Giải Tuần Tự Hóa Là Gì?

Nếu chúng ta cần lưu trữ đối tượng Java lâu dài, ví dụ lưu vào tệp, hoặc truyền đối tượng Java qua mạng, những tình huống này đều cần sử dụng tuần tự hóa.

Nói một cách đơn giản:

- **Tuần Tự Hóa**: Chuyển đổi cấu trúc dữ liệu hoặc đối tượng thành một định dạng có thể lưu trữ hoặc truyền, thường là dòng byte nhị phân, cũng có thể là JSON, XML và các định dạng văn bản khác
- **Giải Tuần Tự Hóa**: Quá trình chuyển đổi dữ liệu được tạo ra trong quá trình tuần tự hóa thành cấu trúc dữ liệu ban đầu hoặc đối tượng

Đối với ngôn ngữ lập trình hướng đối tượng như Java, chúng ta tuần tự hóa các đối tượng (Object) tức là các lớp được tạo instance (Class), nhưng trong C++ là ngôn ngữ bán hướng đối tượng, struct (cấu trúc) định nghĩa là một loại cấu trúc dữ liệu, trong khi class tương ứng với loại đối tượng.

Dưới đây là các tình huống ứng dụng phổ biến của tuần tự hóa và giải tuần tự hóa:

- Trước khi đối tượng được truyền qua mạng (ví dụ: khi gọi phương thức từ xa RPC), nó cần được tuần tự hóa trước tiên, sau khi nhận được đối tượng được tuần tự hóa, nó cần được giải tuần tự hóa;
- Trước khi lưu đối tượng vào tệp, cần thực hiện tuần tự hóa, khi đọc đối tượng từ tệp, cần thực hiện giải tuần tự hóa;
- Trước khi lưu đối tượng vào cơ sở dữ liệu (chẳng hạn như Redis), cần sử dụng tuần tự hóa, khi đọc đối tượng từ cơ sở dữ liệu bộ nhớ cache, cần giải tuần tự hóa;
- Trước khi lưu đối tượng vào bộ nhớ, cần thực hiện tuần tự hóa, khi đọc đối tượng từ bộ nhớ, cần thực hiện giải tuần tự hóa.

### Nếu Có Một Số Trường Không Muốn Tuần Tự Hóa Thì Sao?

Đối với các biến không muốn tuần tự hóa, sử dụng từ khóa `transient` để sửa đổi.

Tác dụng của từ khóa `transient` là: Ngăn chặn những biến trong phiên bản được sửa đổi bằng từ khóa này tuần tự hóa; khi đối tượng được giải tuần tự hóa, giá trị của biến được sửa đổi bằng `transient` sẽ không được lưu trữ lâu dài và khôi phục.

Về `transient` còn có một vài điểm cần lưu ý:

- `transient` chỉ có thể sửa đổi biến, không thể sửa đổi lớp và phương thức.
- Biến được sửa đổi bằng `transient`, sau khi giải tuần tự hóa, giá trị biến sẽ được đặt thành giá trị mặc định của kiểu. Ví dụ, nếu sửa đổi kiểu `int`, kết quả sau giải tuần tự hóa sẽ là `0`.
- Biến `static` vì không thuộc bất kỳ đối tượng nào (Object), nên dù có hoặc không có sửa đổi `transient`, đều sẽ không được tuần tự hóa.

### Các Giao Thức Tuần Tự Hóa Phổ Biến Có Những Cái Nào?

JDK tích hợp sẵn giao thức tuần tự hóa thường không được sử dụng, vì hiệu suất tuần tự hóa thấp và tồn tại vấn đề bảo mật. Những giao thức tuần tự hóa được sử dụng phổ biến là Hessian, Kryo, Protobuf, ProtoStuff, đây là những giao thức tuần tự hóa dựa trên nhị phân.

Những cái như JSON và XML là những loại tuần tự hóa văn bản. Mặc dù khả năng đọc hiểu tương đối tốt, nhưng hiệu suất kém, thường không được chọn.

### Tại Sao Không Khuyến Khích Sử Dụng Tuần Tự Hóa Mặc Định Của JDK?

Chúng ta hầu như không bao giờ sử dụng trực tiếp giao thức tuần tự hóa mặc định được cung cấp bởi JDK, lý do chính có những lý do sau:

- **Không Hỗ Trợ Gọi Chéo Ngôn Ngữ**: Nếu dịch vụ được gọi là từ ngôn ngữ khác thì sẽ không được hỗ trợ.
- **Hiệu Năng Kém**: So với các framework tuần tự hóa khác, hiệu suất thấp hơn, lý do chính là mảng byte được tuần tự hóa lớn hơn, dẫn đến chi phí vận chuyển tăng lên.
- **Tồn Tại Vấn Đề Bảo Mật**: Tuần tự hóa và giải tuần tự hóa chính nó không tồn tại vấn đề. Nhưng khi dữ liệu giải tuần tự hóa đầu vào có thể được kiểm soát bởi người dùng, thì những kẻ tấn công có thể tạo ra đầu vào độc hại, làm cho giải tuần tự hóa tạo ra các đối tượng không mong muốn, trong quá trình này sẽ thực thi mã được xây dựng bất kỳ. Bài đọc liên quan: [Lỗ Hổng Bảo Mật Ứng Dụng: Lỗ Hổng Giải Tuần Tự Hóa Java Là Gì](https://cryin.github.io/blog/secure-development-java-deserialization-vulnerability/)

## IO

Để tìm hiểu chi tiết về IO, vui lòng xem các bài viết dưới đây, những bài này có những kiến thức và câu hỏi phỏng vấn toàn diện hơn.

- [Tổng Hợp Kiến Thức Cơ Bản Java IO](./io-basis.md)
- [Tóm Tắt Mẫu Thiết Kế Java IO](./io-design-patterns.md)
- [Giải Thích Chi Tiết Mô Hình IO Java](./io-model.md)

### Bạn Hiểu Rõ Luồng IO Java Không?

IO tức là `Input/Output`, nhập vào và xuất ra. Quá trình nhập dữ liệu vào bộ nhớ máy tính tức là nhập vào, ngược lại, quá trình xuất ra bên ngoài lưu trữ (ví dụ như cơ sở dữ liệu, tệp, máy chủ từ xa) tức là xuất ra. Quá trình truyền dữ liệu tương tự như dòng nước, vì vậy được gọi là luồng IO. Luồng IO trong Java chia thành luồng nhập vào và luồng xuất ra, và theo cách xử lý dữ liệu lại chia thành luồng byte và luồng ký tự.

Hơn 40 lớp của luồng IO Java đều được lấy từ 4 lớp cơ sở trừu tượng sau đây.

- `InputStream`/`Reader`: Lớp cơ sở của tất cả các luồng nhập vào, cái trước là luồng nhập vào byte, cái sau là luồng nhập vào ký tự.
- `OutputStream`/`Writer`: Lớp cơ sở của tất cả các luồng xuất ra, cái trước là luồng xuất ra byte, cái sau là luồng xuất ra ký tự.

### Tại Sao Luồng IO Phải Chia Thành Luồng Byte Và Luồng Ký Tự?

Câu hỏi về cơ bản muốn hỏi: **Bất kể là đọc ghi tệp hay gửi nhận mạng, đơn vị lưu trữ nhỏ nhất của thông tin đều là byte, vậy tại sao hoạt động luồng IO phải chia thành hoạt động luồng byte và hoạt động luồng ký tự?**

Cá nhân cho rằng chủ yếu có hai lý do:

- Luồng ký tự được máy ảo Java chuyển đổi từ byte, quá trình này còn tương đối mất thời gian;
- Nếu chúng tôi không biết loại mã hóa, trong quá trình sử dụng luồng byte rất dễ xảy ra vấn đề font chữ lộn xộn.

### Có Những Mẫu Thiết Kế Nào Trong Java IO?

Tham khảo đáp án: [Tóm Tắt Mẫu Thiết Kế Java IO](./io-design-patterns.md)

### ⭐️Có Gì Khác Biệt Giữa BIO, NIO Và AIO?

Tham khảo đáp án: [Giải Thích Chi Tiết Mô Hình IO Java](./io-model.md)

## Cú Pháp Đường Tắt

### Cú Pháp Đường Tắt Là Gì?

**Cú Pháp Đường Tắt (Syntactic sugar)** là một loại cú pháp đặc biệt được thiết kế bởi ngôn ngữ lập trình để tiện cho lập trình viên phát triển chương trình, loại cú pháp này không ảnh hưởng đến chức năng của ngôn ngữ lập trình. Triển khai cùng một chức năng, mã được viết dựa trên cú pháp đường tắt thường đơn giản hơn, ngắn gọn hơn và dễ đọc hơn.

Ví dụ, `for-each` trong Java là một cú pháp đường tắt thường dùng, nguyên lý của nó thực chất là dựa trên vòng lặp for thông thường và trình lặp.

```java
String[] strs = {"JavaGuide", "Tài Khoản Công Khai: JavaGuide", "Blog: https://javaguide.cn/"};
for (String s : strs) {
    System.out.println(s);
}
```

Tuy nhiên, JVM thực sự không thể nhận ra cú pháp đường tắt, để cú pháp đường tắt Java được thực thi chính xác, cần phải được biên dịch trước thông qua trình biên dịch để giải cú pháp, tức là trong quá trình biên dịch chương trình sẽ chuyển đổi nó thành cú pháp cơ bản mà JVM có thể nhận ra. Điều này cũng cho thấy rằng, trong Java, những gì thực sự hỗ trợ cú pháp đường tắt là trình biên dịch Java chứ không phải JVM. Nếu bạn xem mã nguồn `com.sun.tools.javac.main.JavaCompiler`, bạn sẽ thấy rằng trong `compile()` có một bước là gọi `desugar()`, phương thức này chính là chịu trách nhiệm triển khai giải cú pháp đường tắt.

### Có Những Cú Pháp Đường Tắt Thường Gặp Nào Trong Java?

Những cú pháp đường tắt được sử dụng phổ biến nhất trong Java chủ yếu là kiểu dữ liệu chung, tự động đóng gói mở gói, tham số độ dài thay đổi, enum, lớp bên trong, vòng lặp for nâng cao, cú pháp try-with-resources, biểu thức lambda, v.v.

Để tìm hiểu chi tiết về những cú pháp đường tắt này, vui lòng xem bài viết [Giải Thích Chi Tiết Cú Pháp Đường Tắt Java](./syntactic-sugar.md).
