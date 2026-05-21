---
title: Giải thích chi tiết cấu trúc Class file
description: Giới thiệu cấu trúc Java bytecode Class file và các thành phần cốt lõi như constant pool, giúp hiểu về sản phẩm biên dịch.
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: Class file,constant pool,magic number,version,field,method,attribute
---

## Ôn lại Bytecode

Trong Java, code mà JVM có thể hiểu được gọi là `bytecode` (tức các file có đuôi `.class`). Bytecode không hướng đến bất kỳ processor cụ thể nào mà chỉ hướng đến virtual machine. Thông qua bytecode, Java giải quyết một phần vấn đề hiệu năng thấp của ngôn ngữ interpreted truyền thống, đồng thời vẫn giữ lại tính portable của ngôn ngữ interpreted. Do đó Java program khi chạy hiệu quả khá tốt, hơn nữa vì bytecode không gắn với một máy cụ thể, Java program có thể chạy trên nhiều hệ điều hành khác nhau mà không cần biên dịch lại.

Clojure (phương ngữ của ngôn ngữ Lisp), Groovy, Scala, JRuby, Kotlin, v.v. đều chạy trên Java Virtual Machine. Hình dưới cho thấy các ngôn ngữ khác nhau được các compiler khác nhau biên dịch thành file `.class` và cuối cùng chạy trên JVM. Format nhị phân của file `.class` có thể xem bằng [WinHex](https://www.x-ways.net/winhex/).

![Các ngôn ngữ lập trình chạy trên JVM](https://oss.javaguide.cn/github/javaguide/java/basis/java-virtual-machine-program-language-os.png)

Có thể nói file `.class` là cầu nối quan trọng giữa các ngôn ngữ khác nhau trong JVM, đồng thời cũng là một lý do quan trọng Java cross-platform.

## Tổng kết cấu trúc Class file

Theo Java Virtual Machine Specification, Class file được định nghĩa qua `ClassFile` — hơi giống struct trong C.

Cấu trúc của `ClassFile` như sau:

```java
ClassFile {
    u4             magic; // Cờ của Class file
    u2             minor_version; // Minor version của Class
    u2             major_version; // Major version của Class
    u2             constant_pool_count; // Số lượng trong constant pool
    cp_info        constant_pool[constant_pool_count-1]; // Constant pool
    u2             access_flags; // Access flag của Class
    u2             this_class; // Class hiện tại
    u2             super_class; // Class cha
    u2             interfaces_count; // Số lượng interface
    u2             interfaces[interfaces_count]; // Một class có thể implement nhiều interface
    u2             fields_count; // Số lượng field
    field_info     fields[fields_count]; // Một class có thể có nhiều field
    u2             methods_count; // Số lượng method
    method_info    methods[methods_count]; // Một class có thể có nhiều method
    u2             attributes_count; // Số attribute trong attribute table của class này
    attribute_info attributes[attributes_count]; // Attribute table collection
}
```

Thông qua phân tích nội dung `ClassFile`, có thể biết được cấu tạo của class file.

![Phân tích nội dung ClassFile](https://oss.javaguide.cn/java-guide-blog/16d5ec47609818fc.jpeg)

Hình dưới được xem qua IDEA plugin `jclasslib` — có thể trực quan hơn khi xem cấu trúc Class file.

![](https://oss.javaguide.cn/java-guide-blog/image-20210401170711475.png)

Dùng `jclasslib` không chỉ có thể trực quan xem bytecode file tương ứng với một class, mà còn xem thông tin cơ bản, constant pool, interface, attribute, function, v.v. của class.

Dưới đây giới thiệu chi tiết một số component liên quan đến cấu trúc Class file.

### Magic Number

```java
    u4             magic; // Cờ của Class file
```

4 byte đầu của mỗi Class file gọi là Magic Number. Tác dụng duy nhất của nó là **xác định xem file này có phải Class file mà virtual machine có thể nhận không**. Java spec quy định magic number là giá trị cố định: 0xCAFEBABE. Nếu file đọc không bắt đầu bằng magic number này, Java Virtual Machine sẽ từ chối load nó.

### Class file version number (Minor & Major Version)

```java
    u2             minor_version; // Minor version của Class
    u2             major_version; // Major version của Class
```

Bốn byte ngay sau magic number lưu version number của Class file: byte thứ 5 và 6 là **minor version**, byte thứ 7 và 8 là **major version**.

Mỗi lần Java phát hành major version (như Java 8, Java 9), major version sẽ tăng thêm 1. Có thể dùng lệnh `javap -v` để nhanh chóng xem thông tin version number của Class file.

JVM phiên bản cao có thể thực thi Class file do compiler phiên bản thấp tạo ra, nhưng JVM phiên bản thấp không thể thực thi Class file do compiler phiên bản cao tạo ra. Do đó trong phát triển thực tế cần đảm bảo version JDK phát triển nhất quán với version JDK môi trường production.

### Constant Pool

```java
    u2             constant_pool_count; // Số lượng trong constant pool
    cp_info        constant_pool[constant_pool_count-1]; // Constant pool
```

Ngay sau major và minor version là constant pool. Số lượng trong constant pool là `constant_pool_count-1` (**Constant pool counter đếm từ 1. Việc để trống constant item thứ 0 có xem xét đặc biệt — giá trị index 0 biểu thị "không tham chiếu bất kỳ constant pool item nào"**).

Constant pool chủ yếu lưu hai loại constant: literal và symbolic reference. Literal gần với khái niệm constant ở tầng ngôn ngữ Java như text string, constant value được khai báo là `final`, v.v. Symbolic reference thuộc khái niệm của compile theory. Bao gồm ba loại constant sau:

- Fully qualified name của class và interface
- Name và descriptor của field
- Name và descriptor của method

Mỗi item constant trong constant pool đều là một table. 14 loại table này đều có đặc điểm chung: **bit đầu tiên là flag bit kiểu u1 - tag để xác định loại constant, đại diện cho loại constant nào là constant hiện tại.**

|               Loại               | Tag |                     Mô tả                     |
| :------------------------------: | :-: | :-------------------------------------------: |
|        CONSTANT_utf8_info        |  1  |              String mã hóa UTF-8              |
|      CONSTANT_Integer_info       |  3  |                Integer literal                |
|       CONSTANT_Float_info        |  4  |                 Float literal                 |
|        CONSTANT_Long_info        |  5  |                 Long literal                  |
|       CONSTANT_Double_info       |  6  |                Double literal                 |
|       CONSTANT_Class_info        |  7  |  Symbolic reference của class hoặc interface  |
|       CONSTANT_String_info       |  8  |              String type literal              |
|      CONSTANT_FieldRef_info      |  9  |         Symbolic reference của field          |
|     CONSTANT_MethodRef_info      | 10  |   Symbolic reference của method trong class   |
| CONSTANT_InterfaceMethodRef_info | 11  | Symbolic reference của method trong interface |
|    CONSTANT_NameAndType_info     | 12  |   Symbolic reference của field hoặc method    |
|     CONSTANT_MethodType_info     | 16  |             Biểu thị method type              |
|    CONSTANT_MethodHandle_info    | 15  |            Biểu thị method handle             |
|   CONSTANT_InvokeDynamic_info    | 18  |      Biểu thị dynamic method call point       |

Có thể dùng lệnh `javap -v class_name` để xem thông tin constant pool trong file `.class` (`javap -v class_name -> temp.txt`: xuất kết quả ra file temp.txt).

### Access Flags

```java
    u2             access_flags; // Access flag của Class
```

Sau khi constant pool kết thúc, ngay sau đó là hai byte biểu thị access flag. Flag này dùng để xác định một số thông tin truy cập ở tầng class hay interface, bao gồm: Class này là class hay interface, có phải kiểu `public` hay `abstract` không, nếu là class có được khai báo là `final` không, v.v.

Class access và attribute modifier:

![Class access và attribute modifier](https://oss.javaguide.cn/github/javaguide/java/%E8%AE%BF%E9%97%AE%E6%A0%87%E5%BF%97.png)

Chúng ta định nghĩa một class `Employee`:

```java
package top.snailclimb.bean;
public class Employee {
   ...
}
```

Dùng lệnh `javap -v class_name` để xem access flag của class.

![Xem access flag của class](https://oss.javaguide.cn/github/javaguide/java/%E6%9F%A5%E7%9C%8B%E7%B1%BB%E7%9A%84%E8%AE%BF%E9%97%AE%E6%A0%87%E5%BF%97.png)

### Index collection của Class hiện tại (This Class), Class cha (Super Class), Interface

```java
    u2             this_class; // Class hiện tại
    u2             super_class; // Class cha
    u2             interfaces_count; // Số lượng interface
    u2             interfaces[interfaces_count]; // Một class có thể implement nhiều interface
```

Quan hệ kế thừa của Java class được xác định bởi ba thứ: class index, parent class index và interface index collection. Chúng xếp theo thứ tự ngay sau access flag.

Class index dùng để xác định fully qualified name của class này. Parent class index dùng để xác định fully qualified name của parent class. Vì Java dùng single inheritance nên parent class index chỉ có một. Ngoài `java.lang.Object`, tất cả Java class đều có parent class, nên parent class index của tất cả Java class (trừ `java.lang.Object`) đều khác 0.

Interface index collection mô tả class này implement những interface nào. Các interface được implement sẽ được xếp từ trái sang phải theo thứ tự sau `implements` (hoặc `extends` nếu class này bản thân là interface) trong interface index collection.

### Field table collection (Fields)

```java
    u2             fields_count; // Số lượng field
    field_info     fields[fields_count]; // Một class có thể có nhiều field
```

Field table (field info) dùng để mô tả variable được khai báo trong interface hay class. Field bao gồm class-level variable và instance variable, nhưng không bao gồm local variable được khai báo bên trong method.

**Cấu trúc của field info (field table):**

![Cấu trúc field table](https://oss.javaguide.cn/github/javaguide/java/%E5%AD%97%E6%AE%B5%E8%A1%A8%E7%9A%84%E7%BB%93%E6%9E%84.png)

- **access_flags**: Scope của field (`public`, `private`, `protected` modifier), là instance variable hay class variable (`static` modifier), có thể serialize không (`transient` modifier), mutability (`final`), visibility (`volatile` modifier — có bắt buộc đọc/ghi từ main memory không).
- **name_index**: Reference đến constant pool, biểu thị name của field.
- **descriptor_index**: Reference đến constant pool, biểu thị descriptor của field và method.
- **attributes_count**: Một field còn có một số extra attribute. `attributes_count` lưu số lượng attribute.
- **attributes[attributes_count]**: Lưu nội dung cụ thể của attribute.

Trong các thông tin trên, mỗi modifier đều là boolean — hoặc có modifier đó hoặc không. Rất phù hợp để biểu thị bằng flag bit. Còn tên field là gì, field được định nghĩa là kiểu data nào đều không thể cố định — chỉ có thể dùng constant trong constant pool để mô tả.

**Giá trị access_flag của field:**

![Giá trị access_flag của field](https://oss.javaguide.cn/github/javaguide/java/jvm/class-file-fields-access_flag.png)

### Method table collection (Methods)

```java
    u2             methods_count; // Số lượng method
    method_info    methods[methods_count]; // Một class có thể có nhiều method
```

`methods_count` biểu thị số lượng method, còn `method_info` biểu thị method table.

Format lưu method trong Class file gần như hoàn toàn giống với cách mô tả field. Cấu trúc method table giống field table, bao gồm lần lượt access flag, name index, descriptor index, attribute table collection.

**Cấu trúc của method_info (method table):**

![Cấu trúc method table](https://oss.javaguide.cn/github/javaguide/java/%E6%96%B9%E6%B3%95%E8%A1%A8%E7%9A%84%E7%BB%93%E6%9E%84.png)

**Giá trị access_flag của method table:**

![Giá trị access_flag của method table](https://oss.javaguide.cn/github/javaguide/java/jvm/class-file-methods-access_flag.png)

Lưu ý: Vì modifier `volatile` và `transient` không thể modify method, nên trong access flag của method table không có hai flag tương ứng. Nhưng vì `synchronized`, `native`, `abstract` và các keyword khác có thể modify method, nên có thêm các flag tương ứng với những keyword này.

### Attribute table collection (Attributes)

```java
   u2             attributes_count; // Số attribute trong attribute table của class này
   attribute_info attributes[attributes_count]; // Attribute table collection
```

Trong Class file, field table, method table đều có thể mang attribute table collection riêng để mô tả một số thông tin đặc thù trong một số tình huống nhất định. Khác với các data item khác trong Class file yêu cầu thứ tự, độ dài và nội dung cố định, attribute table collection có ràng buộc lỏng hơn một chút. Không yêu cầu thứ tự nghiêm ngặt giữa các attribute table, và miễn là không trùng tên attribute đã có, bất kỳ compiler nào cũng có thể ghi attribute info do mình định nghĩa vào attribute table. JVM runtime sẽ bỏ qua các attribute mà nó không nhận ra.

## Tài liệu tham khảo

- 《Java Virtual Machine in Action》
- Chapter 4. The class File Format - Java Virtual Machine Specification: <https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html>
- Phân tích thực tế cấu trúc file JAVA CLASS: <https://coolshell.cn/articles/9229.html>
- 《Java Virtual Machine Principle Diagrams》 1.2.2, Giải thích chi tiết constant pool trong Class file (Phần 1): <https://blog.csdn.net/luanlouis/article/details/39960815>
