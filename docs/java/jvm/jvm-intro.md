---
title: Tìm hiểu JVM bằng ngôn ngữ bình dân
description: Giới thiệu các thành phần cơ bản của JVM và luồng thực thi tải class bằng cách thông dụng, giúp nhanh chóng nhập môn nguyên lý máy ảo.
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: JVM 基础,类加载,方法区,堆栈,程序计数器,运行时数据区
---

> Bài viết được đóng góp bởi [说出你的愿望吧丷](https://juejin.im/user/5c2400afe51d45451758aa96), địa chỉ bài gốc: <https://juejin.im/post/5e1505d0f265da5d5d744050>.

## Lời mở đầu

Nếu trong bài có vấn đề về từ ngữ hoặc cách hiểu, xin hãy chỉ ra. Bài viết này nhằm đề cập nhưng không đi sâu, nhưng sẽ cố gắng trình bày các điểm kiến thức một cách hiệu quả.

## I. Giới thiệu cơ bản về JVM

JVM là viết tắt của Java Virtual Machine, là một máy tính ảo, một loại quy chuẩn. Thực hiện các chức năng máy tính khác nhau thông qua mô phỏng trên máy tính thực tế...

Thực ra bỏ qua những câu chuyên nghiệp đó, chỉ cần biết rằng JVM thực chất giống như một chiếc máy tính nhỏ chạy trên môi trường hệ điều hành Windows hoặc Linux. Nó tương tác trực tiếp với hệ điều hành, không tương tác trực tiếp với phần cứng, còn hệ điều hành có thể giúp chúng ta hoàn thành công việc tương tác với phần cứng.

![](https://static001.geekbang.org/infoq/da/da0380a04d9c04facd2add5f6dba06fa.png)

### 1.1 File Java được chạy như thế nào

Ví dụ chúng ta vừa viết một file HelloWorld.java, thì file HelloWorld.java bỏ qua tất cả mọi thứ, nó giống như một file văn bản, chỉ là file văn bản này được viết bằng tiếng Anh và có một số thụt lề nhất định mà thôi.

Còn **JVM** của chúng ta không nhận biết được file văn bản, vì vậy nó cần **biên dịch**, tạo ra file nhị phân **HelloWorld.class** mà nó có thể đọc được.

#### ① Class loader (Bộ tải class)

Nếu **JVM** muốn thực thi file **.class** này, chúng ta cần nạp nó vào một **class loader**, nó giống như một công nhân bốc vác, sẽ đưa tất cả các file **.class** vào JVM.

![](https://static001.geekbang.org/infoq/2f/2f012fde94376f43a25dbe1dd07e0dd8.png)

#### ② Method Area (Vùng phương thức)

**Method Area** được dùng để lưu trữ các dữ liệu như metadata của class, thông tin class, hằng số, biến tĩnh, code sau biên dịch, v.v.

Class loader đưa file .class vào thì trước tiên thả vào vùng này.

#### ③ Heap (Vùng heap)

**Heap** chủ yếu chứa một số dữ liệu được lưu trữ, như instance đối tượng, mảng, v.v., nó và method area đều thuộc **vùng chia sẻ thread**. Nghĩa là chúng đều **không thread-safe**.

#### ④ Stack (Ngăn xếp)

**Stack** là không gian chạy code của chúng ta. Mỗi phương thức chúng ta viết đều được đặt vào **stack** để chạy.

Chúng ta có thể nghe đến Native Method Stack hoặc Native Method Interface hai thuật ngữ này, nhưng về cơ bản chúng ta ít liên quan đến hai phần này, chúng sử dụng C để làm việc ở tầng dưới, không liên quan nhiều đến Java.

#### ⑤ Program Counter (Bộ đếm chương trình)

Chủ yếu hoàn thành công việc tải, giống như một con trỏ trỏ đến dòng code tiếp theo chúng ta cần thực thi. Giống với stack, đều là **riêng theo thread**, nghĩa là mỗi thread sẽ có vùng tương ứng của chính nó và không tồn tại vấn đề đồng thời và đa luồng.

![](https://static001.geekbang.org/infoq/c6/c602f57ea9297f50bbc265f1821d6263.png)

#### Tóm tắt nhỏ

1. File Java sau biên dịch trở thành file bytecode .class
2. File bytecode được class loader đưa vào JVM
3. Năm vùng chính của máy ảo: Method Area, Heap đều là vùng chia sẻ thread, có vấn đề thread safety, Stack và Native Method Stack và Program Counter đều là vùng riêng, không tồn tại vấn đề thread safety, còn việc điều chỉnh JVM chủ yếu xoay quanh hai vùng Heap và Stack.

### 1.2 Ví dụ code đơn giản

Một class Student đơn giản

![](https://static001.geekbang.org/infoq/12/12f0b239db65b8a95f0ce90e9a580e4d.png)

Một phương thức main

![](https://static001.geekbang.org/infoq/0c/0c6d94ab88a9f2b923f5fea3f95bc2eb.png)

Các bước thực thi phương thức main như sau:

1. Sau khi biên dịch App.java được App.class, thực thi App.class, hệ thống sẽ khởi động một tiến trình JVM, tìm file nhị phân tên App.class trong đường dẫn classpath, tải thông tin class của App vào method area trong vùng dữ liệu runtime, quá trình này gọi là tải class App
2. JVM tìm điểm nhập chính của App, thực thi phương thức main
3. Câu lệnh đầu tiên trong main là `Student student = new Student("tellUrDream")`, tức là để JVM tạo một đối tượng Student, nhưng lúc này trong method area không có thông tin class Student, vì vậy JVM ngay lập tức tải class Student, đưa thông tin class Student vào method area
4. Sau khi tải xong class Student, JVM phân bổ bộ nhớ cho một instance Student mới trong heap, sau đó gọi constructor để khởi tạo instance Student, instance Student này giữ **tham chiếu trỏ đến thông tin kiểu class Student trong method area**
5. Khi thực thi `student.sayName()`, JVM tìm đối tượng student theo tham chiếu của student, sau đó theo tham chiếu mà đối tượng student giữ để định vị bảng phương thức của thông tin kiểu class student trong method area, lấy địa chỉ bytecode của `sayName()`.
6. Thực thi `sayName()`

Thực ra cũng không cần quan tâm quá nhiều, chỉ cần biết khi khởi tạo instance đối tượng sẽ đi tìm thông tin class trong method area, sau khi hoàn thành thì chạy phương thức ở stack. Tìm phương thức thì tìm trong method table.

## II. Giới thiệu về Class Loader

Đề cập trước đó nó chịu trách nhiệm tải các file .class, chúng có ký hiệu đặc biệt ở đầu file, tải nội dung bytecode của file class vào bộ nhớ và chuyển đổi nội dung này thành cấu trúc dữ liệu runtime trong method area, và ClassLoader chỉ chịu trách nhiệm tải file class, còn việc có thể chạy hay không do Execution Engine quyết định.

### 2.1 Luồng class loader

Từ khi class được tải vào bộ nhớ máy ảo cho đến khi giải phóng bộ nhớ, tổng cộng có 7 bước: tải, xác minh, chuẩn bị, giải quyết, khởi tạo, sử dụng, hủy tải. Trong đó **xác minh, chuẩn bị, giải quyết ba phần gọi chung là liên kết**.

#### 2.1.1 Tải

1. Tải file class vào bộ nhớ
2. Chuyển đổi cấu trúc dữ liệu tĩnh thành cấu trúc dữ liệu runtime trong method area
3. Tạo đối tượng java.lang.Class đại diện cho class này trong heap làm điểm truy cập dữ liệu

#### 2.1.2 Liên kết

1. Xác minh: Đảm bảo class được tải phù hợp với quy chuẩn JVM và bảo mật, đảm bảo phương thức của class được xác minh không thực hiện các sự kiện gây hại cho máy ảo khi runtime, thực chất là một kiểm tra bảo mật
2. Chuẩn bị: Phân bổ không gian bộ nhớ cho biến static trong method area, đặt giá trị khởi tạo của biến, ví dụ `static int a = 3` (lưu ý: giai đoạn chuẩn bị chỉ đặt biến tĩnh trong class (method area), không bao gồm biến instance (heap memory), biến instance được gán giá trị khi khởi tạo đối tượng)
3. Giải quyết: Quá trình máy ảo thay thế symbolic reference trong constant pool thành direct reference (symbolic reference ví dụ như hiện tại tôi `import java.util.ArrayList` đó là symbolic reference, direct reference là con trỏ hoặc địa chỉ đối tượng, lưu ý đối tượng tham chiếu nhất định phải được thực hiện trong bộ nhớ)

#### 2.1.3 Khởi tạo

Khởi tạo thực chất là quá trình thực thi phương thức constructor class `<clinit>()`, và phải đảm bảo phương thức `<clinit>()` của class cha được thực thi xong trước. Phương thức này được compiler thu thập, thực thi theo thứ tự tất cả khởi tạo tường minh của biến class (biến thành viên được đánh dấu static) và các câu lệnh trong khối static code. Lúc này `static int a` ở giai đoạn chuẩn bị từ giá trị khởi tạo mặc định 0 trở thành giá trị khởi tạo tường minh 3. Do thứ tự thực thi, nếu biến class trong giai đoạn khởi tạo được thay đổi lần nữa trong khối static code, sẽ ghi đè lên khởi tạo tường minh của biến class, giá trị cuối cùng sẽ là giá trị trong khối static code.

> Lưu ý: Trong file bytecode có hai loại phương thức khởi tạo, `<init>` khởi tạo tài nguyên phi tĩnh và `<clinit>` khởi tạo tài nguyên tĩnh, phương thức constructor class `<clinit>()` khác với constructor của class, những phương thức này đều là phương thức đặc biệt trong file bytecode chỉ JVM mới nhận biết được.

#### 2.1.4 Hủy tải

GC hủy tải các đối tượng không sử dụng khỏi bộ nhớ.

### 2.2 Thứ tự tải của class loader

Thứ tự tải một Class cũng có độ ưu tiên, class loader từ dưới lên trên theo thứ tự sau:

1. BootStrap ClassLoader: rt.jar
2. Extension ClassLoader: tải các jar extension
3. App ClassLoader: các jar trong classpath được chỉ định
4. Custom ClassLoader: class loader tùy chỉnh

### 2.3 Cơ chế ủy quyền cha mẹ (双亲委派机制)

Khi một class nhận được yêu cầu tải, nó sẽ không tự mình thử tải trước, mà ủy quyền cho class cha hoàn thành, ví dụ hiện tại tôi muốn `new` một `Person`, Person này là class tùy chỉnh của chúng ta, nếu muốn tải nó, trước tiên sẽ ủy quyền lên App ClassLoader, chỉ khi tất cả class loader cha phản hồi rằng họ không thể hoàn thành yêu cầu này (tức là tất cả class loader cha đều không tìm thấy Class cần tải), class loader con mới tự thử tải.

Điều này mang lại lợi ích là, khi tải class trong package rt.jar, dù là class loader nào tải, cuối cùng đều sẽ ủy quyền cho BootStrap ClassLoader để tải, điều này đảm bảo kết quả nhận được khi dùng các class loader khác nhau đều giống nhau.

Thực ra điều này cũng có tác dụng cách ly, tránh code của chúng ta ảnh hưởng đến code JDK, ví dụ tôi tự định nghĩa một `java.lang.String`:

```java
package java.lang;
public class String {
    public static void main(String[] args) {
        System.out.println();
    }
}
```

Khi cố gắng chạy hàm `main` của class hiện tại, code của chúng ta chắc chắn sẽ báo lỗi. Điều này là vì khi tải thực sự tìm thấy `java.lang.String` trong rt.jar, nhưng phát hiện trong đó không có phương thức `main`.

## III. Vùng dữ liệu Runtime

### 3.1 Native Method Stack và Program Counter

Ví dụ chúng ta mở source code class Thread, sẽ thấy phương thức start0 của nó có từ khóa native và không có phần thân phương thức, loại phương thức được đánh dấu native này là native method, được triển khai bằng C, và thường những phương thức này được đặt trong một vùng gọi là native method stack.

Program counter thực chất là một con trỏ, trỏ đến lệnh tiếp theo chúng ta cần thực thi trong chương trình, nó cũng là vùng duy nhất trong vùng bộ nhớ sẽ không xảy ra OutOfMemoryError, và chiếm không gian bộ nhớ nhỏ đến mức cơ bản có thể bỏ qua. Bộ nhớ này chỉ đại diện cho chỉ số dòng của bytecode đang được thực thi bởi thread hiện tại, bộ phân tích bytecode thay đổi giá trị bộ đếm này để chọn bytecode tiếp theo cần thực thi.

Nếu thực thi là native method, con trỏ này không hoạt động.

### 3.2 Method Area (Vùng phương thức)

Tác dụng chính của Method Area là lưu trữ metadata của class, hằng số và biến tĩnh, v.v. Khi thông tin lưu trữ quá lớn, sẽ báo lỗi khi không thể đáp ứng phân bổ bộ nhớ.

### 3.3 VM Stack và VM Heap

Một câu tóm tắt: stack quản lý chạy, heap quản lý lưu trữ. Thì VM Stack chịu trách nhiệm chạy code, còn VM Heap chịu trách nhiệm lưu trữ dữ liệu.

#### 3.3.1 Khái niệm VM Stack

Nó là model bộ nhớ thực thi phương thức Java. Trong đó lưu trữ các biến cục bộ, dynamic link, method exit, thao tác stack (push và pop), và riêng theo thread. Đồng thời nếu chúng ta nghe đến local variable table, thì cũng đang nói về VM Stack.

```java
public class Person{
    int a = 1;

    public void doSomething(){
        int b = 2;
    }
}
```

#### 3.3.2 Các ngoại lệ tồn tại trong VM Stack

Nếu độ sâu stack mà thread yêu cầu lớn hơn độ sâu tối đa của VM Stack, sẽ báo **StackOverflowError** (lỗi này thường xảy ra trong đệ quy). Java Virtual Machine cũng có thể mở rộng động, nhưng khi mở rộng sẽ liên tục xin bộ nhớ, khi không thể xin đủ bộ nhớ sẽ báo **OutOfMemoryError**.

#### 3.3.3 Vòng đời của VM Stack

Đối với stack, không tồn tại garbage collection. Chỉ cần chương trình chạy xong, không gian stack sẽ tự nhiên được giải phóng. Vòng đời của stack nhất quán với thread nơi nó tồn tại.

Bổ sung thêm: biến 8 kiểu cơ bản + biến tham chiếu đối tượng + phương thức instance đều được phân bổ bộ nhớ trong stack.

#### 3.3.4 Thực thi VM Stack

Chúng ta thường nghe nói đến dữ liệu stack frame, nói thẳng ra trong JVM gọi là stack frame, đặt trong Java thực ra là phương thức, nó cũng được lưu trữ trong stack.

Dữ liệu trong stack đều tồn tại ở định dạng stack frame, nó là một tập dữ liệu về phương thức và dữ liệu runtime. Ví dụ chúng ta thực thi một phương thức a, sẽ tạo ra một stack frame A1 tương ứng, sau đó A1 được push vào stack. Tương tự phương thức b sẽ có B1, phương thức c sẽ có C1, sau khi thread này thực thi xong, stack sẽ trước tiên pop C1, sau B1, A1. Đây là nguyên tắc vào sau ra trước.

#### 3.3.5 Tái sử dụng biến cục bộ

Local variable table dùng để lưu trữ các tham số phương thức và biến cục bộ được định nghĩa trong phương thức. Dung lượng của nó lấy Slot làm đơn vị tối thiểu, một slot có thể lưu trữ kiểu dữ liệu không quá 32 bit.

Máy ảo sử dụng local variable table theo cách định vị bằng chỉ số, phạm vi là `[0, số lượng slot trong local variable table]`. Các tham số trong phương thức sẽ được sắp xếp theo một thứ tự nhất định trong local variable table này, còn sắp xếp thế nào chúng ta có thể không cần quan tâm. Còn để tiết kiệm không gian stack frame, các slot này có thể được tái sử dụng, khi vị trí thực thi phương thức vượt qua một biến nào đó, slot của biến đó có thể được các biến khác tái sử dụng. Tất nhiên nếu cần tái sử dụng, thì garbage collection tự nhiên sẽ không động đến những bộ nhớ này.

#### 3.3.6 Khái niệm VM Heap

Bộ nhớ JVM sẽ được chia thành heap memory và non-heap memory, trong heap memory cũng sẽ chia thành **young generation** và **old generation**, còn non-heap memory là **permanent generation**. Young generation lại chia thành **Eden** và **Survivor** zone. Survivor cũng chia thành **FromPlace** và **ToPlace**, vùng survivor ToPlace là trống. Tỷ lệ mặc định của Eden, FromPlace và ToPlace là **8:1:1**. Tất nhiên điều này thực ra cũng có thể được điều chỉnh động theo tốc độ tạo đối tượng thông qua tham số `-XX:+UsePSAdaptiveSurvivorSizePolicy`.

Heap memory lưu trữ các đối tượng, garbage collection là thu thập những đối tượng này rồi giao cho thuật toán GC để thu hồi. Non-heap memory thực ra chúng ta đã nói, chính là method area. Trong phiên bản 1.8 đã loại bỏ permanent generation, thay thế là metaspace (MetaSpace), sự khác biệt lớn nhất là metaSpace không tồn tại trong JVM, nó sử dụng bộ nhớ local. Và có hai tham số:

```plain
MetaspaceSize：初始化元空间大小，控制发生GC
MaxMetaspaceSize：限制元空间大小上限，防止占用过多物理内存。
```

Lý do loại bỏ có thể hiểu sơ qua: thay đổi được thực hiện để hợp nhất HotSpot JVM và JRockit VM, vì JRockit không có permanent generation, nhưng điều này cũng gián tiếp giải quyết vấn đề OOM của permanent generation.

#### 3.3.7 Giới thiệu về Eden (Young Generation)

Khi chúng ta `new` một đối tượng, trước tiên sẽ được đặt vào một vùng nhớ được chia ra trong Eden làm không gian lưu trữ, nhưng chúng ta biết heap memory là chia sẻ thread, vì vậy có thể xảy ra tình huống hai đối tượng dùng chung một bộ nhớ. Cách xử lý của JVM ở đây là trước tiên xin một vùng nhớ liên tục cho mỗi thread và quy định vị trí đặt đối tượng, còn nếu không đủ không gian sẽ xin thêm nhiều vùng nhớ nữa. Thao tác này chúng ta gọi là TLAB, có hứng thú có thể tìm hiểu thêm.

Khi vùng Eden đầy, sẽ kích hoạt một thao tác gọi là Minor GC (GC xảy ra ở young generation), các đối tượng còn sống được di chuyển sang vùng Survivor0. ~~Sau khi vùng Survivor0 đầy kích hoạt Minor GC, sẽ di chuyển đối tượng còn sống sang vùng Survivor1~~, lúc này cũng sẽ hoán đổi hai con trỏ from và to, điều này đảm bảo trong một khoảng thời gian luôn có một vùng survivor trống và vùng survivor mà to trỏ đến là trống. Sau nhiều lần Minor GC mà vẫn còn sống (**ở đây tiêu chí còn sống là 15 lần, tương ứng với tham số máy ảo là `-XX:MaxTenuringThreshold`. Tại sao là 15, vì HotSpot sẽ ghi lại tuổi trong trường đánh dấu trong object header, không gian được phân bổ chỉ có 4 bit, vì vậy tối đa chỉ có thể ghi đến 15**) sẽ được chuyển sang old generation.

> 🐛 Sửa chính xác: Khi không gian bộ nhớ trong vùng Eden đầy, sẽ kích hoạt Minor GC, vùng Survivor0 đầy không kích hoạt Minor GC.
>
> **Vậy khi nào đối tượng trong vùng Survivor0 mới được garbage collect?**
>
> Giả sử vùng Survivor0 hiện tại đã đầy, lúc này lại kích hoạt Minor GC, phát hiện vùng Survivor0 vẫn đầy, không thể chứa nữa, lúc này sẽ cùng nhau phân tích khả năng tiếp cận của đối tượng trong vùng S0 và vùng Eden, tìm ra các đối tượng hoạt động, sao chép chúng sang vùng S1 và xóa sạch các đối tượng trong vùng S0 và vùng Eden, như vậy những đối tượng không thể tiếp cận sẽ bị xóa, và hoán đổi vùng S0 và vùng S1.

Old generation lưu trữ các đối tượng sống lâu dài, khi đầy sẽ kích hoạt Full GC mà chúng ta hay nghe đến, trong thời gian đó sẽ dừng tất cả các thread chờ GC hoàn thành. Vì vậy đối với ứng dụng yêu cầu phản hồi cao nên cố gắng giảm thiểu Full GC xảy ra để tránh vấn đề timeout phản hồi.

Và khi old generation thực thi full gc xong mà vẫn không thể thực hiện thao tác lưu đối tượng, sẽ sinh ra OOM, lúc này là heap memory trong máy ảo không đủ, nguyên nhân có thể là kích thước heap memory được cấu hình quá nhỏ, điều này có thể điều chỉnh thông qua tham số `-Xms`, `-Xmx`. Cũng có thể là trong code tạo ra các đối tượng lớn và nhiều, và chúng liên tục được tham chiếu nên garbage collection không thể thu hồi chúng trong thời gian dài.

![](https://static001.geekbang.org/infoq/39/398255141fde8ba208f6c99f4edaa9fe.png)

Bổ sung: Về vấn đề tham số `-XX:TargetSurvivorRatio`. Thực ra cũng không nhất thiết phải thỏa mãn `-XX:MaxTenuringThreshold` mới chuyển sang old generation. Có thể lấy ví dụ: nếu đối tượng tuổi 5 chiếm 30%, tuổi 6 chiếm 36%, tuổi 7 chiếm 34%, sau khi thêm một đoạn tuổi nào đó (như tuổi 6 trong ví dụ), tổng chiếm dụng vượt quá Survivor space \* TargetSurvivorRatio, thì từ đoạn tuổi đó trở lên sẽ vào old generation (tức là đối tượng tuổi 6 trong ví dụ, nghĩa là tuổi 6 và tuổi 7 thăng lên old generation), lúc này không cần đợi đến 15 theo yêu cầu trong MaxTenuringThreshold.

#### 3.3.8 Làm sao xác định một đối tượng cần bị loại bỏ

![](https://static001.geekbang.org/infoq/1b/1ba7f3cff6e07c6e9c6765cc4ef74997.png)

Program counter, VM Stack, Native Method Stack trong hình, 3 vùng này tồn tại cùng với thread. Việc phân bổ và thu hồi bộ nhớ đều được xác định. Cùng với sự kết thúc của thread, bộ nhớ tự nhiên được thu hồi, vì vậy không cần xem xét vấn đề garbage collection. Còn Java Heap và Method Area thì khác, các thread dùng chung, việc phân bổ và thu hồi bộ nhớ đều động. Do đó những gì garbage collector quan tâm đều là phần bộ nhớ heap và method này.

Trước khi thu hồi phải xác định đối tượng nào còn sống, đối tượng nào đã chết. Dưới đây giới thiệu hai phương pháp tính toán cơ bản:

1. Tính bằng reference counter: Thêm một reference counter vào đối tượng, mỗi lần tham chiếu đến đối tượng này counter tăng một, khi tham chiếu mất hiệu lực thì giảm một, counter bằng 0 thì là không còn sử dụng nữa. Tuy nhiên phương pháp này có một tình huống là khi xảy ra circular reference giữa các đối tượng, GC không thể thu hồi.

2. Tính bằng reachability analysis: Đây là một triển khai tương tự cây nhị phân, lấy một loạt GC ROOTS làm tập đối tượng còn sống ban đầu, tìm kiếm từ node này xuống dưới, đường tìm kiếm được gọi là reference chain, thêm các đối tượng có thể được tập hợp này tham chiếu vào tập hợp. Khi tìm kiếm một đối tượng đến GC Roots mà không sử dụng bất kỳ reference chain nào, thì đối tượng đó là không thể sử dụng. Các ngôn ngữ lập trình thương mại chính, ví dụ Java, C# đều dựa vào cách này để xác định đối tượng có còn sống hay không.

(Chỉ cần hiểu qua) Trong ngôn ngữ Java, các đối tượng có thể làm GC Roots chia thành các loại sau:

1. Đối tượng được tham chiếu trong VM Stack (bảng phương thức cục bộ trong stack frame) (biến cục bộ)
2. Đối tượng được tham chiếu bởi biến tĩnh trong Method Area (biến tĩnh)
3. Đối tượng được tham chiếu bởi hằng số trong Method Area
4. Đối tượng được tham chiếu JNI trong Native Method Stack (tức là phương thức được đánh dấu native) (JNI là cách Java Virtual Machine gọi hàm C tương ứng, thông qua hàm JNI cũng có thể tạo đối tượng Java mới. Và JNI đối với tham chiếu cục bộ hoặc tham chiếu toàn cục của đối tượng đều sẽ đánh dấu các đối tượng mà chúng trỏ đến là không thể thu hồi)
5. Các Java thread đã khởi động và chưa kết thúc

Ưu điểm của phương pháp này là có thể giải quyết vấn đề circular reference, nhưng việc triển khai cần tiêu tốn nhiều tài nguyên và thời gian, cũng cần GC (quá trình phân tích của nó không thể thay đổi quan hệ tham chiếu, vì vậy cần dừng tất cả các tiến trình).

#### 3.3.9 Làm thế nào để tuyên bố một đối tượng thực sự đã chết

Trước tiên phải đề cập đến một phương thức tên là **finalize()**

finalize() là một phương thức của class Object, phương thức finalize() của một đối tượng chỉ được hệ thống tự động gọi một lần, đối tượng thoát khỏi cái chết thông qua phương thức finalize(), lần thứ hai sẽ không gọi lại.

Bổ sung: Không khuyến khích gọi finalize() trong chương trình để tự cứu. Khuyến nghị quên đi sự tồn tại của phương thức này trong chương trình Java. Vì thời gian thực thi của nó không xác định, thậm chí còn không chắc có được thực thi không (chương trình Java thoát bất thường), và chi phí chạy cao, không thể đảm bảo thứ tự gọi của các đối tượng (thậm chí được gọi trong các thread khác nhau). Trong Java 9 đã được đánh dấu **deprecated**, và `java.lang.ref.Cleaner` (tức là bộ strong, soft, weak, phantom reference) đã dần thay thế nó, sẽ nhẹ nhàng và đáng tin cậy hơn `finalize`.

![](https://static001.geekbang.org/infoq/8d/8d7f0381c7d857c7ceb8ae5a5fef0f4a.png)

Việc xác định cái chết của một đối tượng cần ít nhất hai lần đánh dấu:

1. Nếu đối tượng sau khi phân tích khả năng tiếp cận không tìm thấy reference chain kết nối với GC Roots, thì nó sẽ được đánh dấu lần đầu và thực hiện một lần sàng lọc. Điều kiện xét là quyết định đối tượng này có cần thiết phải thực thi phương thức finalize() hay không. Nếu đối tượng cần thiết phải thực thi phương thức finalize(), thì được đặt vào hàng đợi F-Queue.
2. GC đánh dấu lần hai các đối tượng trong hàng đợi F-Queue. Nếu đối tượng trong phương thức finalize() tái tạo liên kết với bất kỳ đối tượng nào trên reference chain, thì khi đánh dấu lần hai sẽ di chuyển nó ra khỏi tập hợp "sắp thu hồi". Nếu lúc này đối tượng vẫn không thoát được thành công, thì chỉ có thể bị thu hồi.

Nếu xác định đối tượng đã chết, chúng ta nên thu hồi những rác này như thế nào?

### 3.4 Thuật toán garbage collection

Để xem giới thiệu chi tiết về các thuật toán garbage collection thường gặp, khuyến nghị đọc bài này: [JVM 垃圾回收详解（重点）](https://javaguide.cn/java/jvm/jvm-garbage-collection.html).

### 3.5 (Tham khảo) Các loại garbage collector

Garbage collector trong HotSpot VM và các trường hợp áp dụng:

![](https://static001.geekbang.org/infoq/9f/9ff72176ab0bf58bc43e142f69427379.png)

Đến jdk8, garbage collector mặc định là Parallel Scavenge và Parallel Old.

Từ jdk9 trở đi, G1 collector trở thành garbage collector mặc định.
Hiện tại, G1 collector có thời gian dừng ngắn nhất và không có nhược điểm rõ ràng, rất phù hợp với ứng dụng Web. Khi kiểm tra ứng dụng Web trong jdk8, heap memory 6G, young generation 4.5G, Parallel Scavenge thu hồi young generation dừng lâu đến 1.5 giây. G1 collector thu hồi young generation cùng kích thước chỉ dừng 0.2 giây.

### 3.6 (Tham khảo) Các tham số thường dùng của JVM

Tham số JVM rất nhiều, ở đây chỉ liệt kê một vài cái quan trọng hơn, thông qua các công cụ tìm kiếm khác nhau cũng có thể biết được thông tin này.

| Tên tham số                | Ý nghĩa                                                                                   | Giá trị mặc định          | Ghi chú                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| -Xms                       | Kích thước heap ban đầu                                                                   | 1/64 bộ nhớ vật lý (<1GB) | Mặc định (có thể điều chỉnh tham số MinHeapFreeRatio) khi heap trống nhỏ hơn 40%, JVM sẽ tăng heap đến giới hạn tối đa -Xmx.                                                                                                                                                                                                                                                                                                                                                                     |
| -Xmx                       | Kích thước heap tối đa                                                                    | 1/4 bộ nhớ vật lý (<1GB)  | Mặc định (có thể điều chỉnh tham số MaxHeapFreeRatio) khi heap trống lớn hơn 70%, JVM sẽ giảm heap đến giới hạn tối thiểu -Xms.                                                                                                                                                                                                                                                                                                                                                                  |
| -Xmn                       | Kích thước young generation (1.4 trở lên)                                                 |                           | Lưu ý: kích thước ở đây là (eden + 2 survivor space). Khác với New gen hiển thị trong `jmap -heap`. Tổng kích thước heap = kích thước young generation + kích thước old generation + kích thước persistent generation. Tăng young generation sẽ giảm old generation. Giá trị này ảnh hưởng khá lớn đến hiệu suất hệ thống, Sun chính thức khuyến nghị cấu hình là 3/8 toàn bộ heap.                                                                                                              |
| -XX:NewSize                | Đặt kích thước young generation (cho 1.3/1.4)                                             |                           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -XX:MaxNewSize             | Giá trị tối đa của young generation (cho 1.3/1.4)                                         |                           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -XX:PermSize               | Đặt giá trị ban đầu của permanent generation (perm gen)                                   | 1/64 bộ nhớ vật lý        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -XX:MaxPermSize            | Đặt giá trị tối đa của permanent generation                                               | 1/4 bộ nhớ vật lý         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -Xss                       | Kích thước heap stack của mỗi thread                                                      |                           | Từ JDK5.0 trở đi mỗi thread stack size là 1M, trước đó là 256K. Điều chỉnh theo kích thước bộ nhớ cần thiết của thread ứng dụng. Với cùng bộ nhớ vật lý, giảm giá trị này có thể tạo nhiều thread hơn. Nhưng hệ điều hành vẫn có giới hạn số thread trong một tiến trình, không thể tạo vô hạn, giá trị kinh nghiệm khoảng 3000~5000. Ứng dụng nhỏ, nếu stack không sâu, 128k nên đủ. Ứng dụng lớn khuyến nghị dùng 256k. Tùy chọn này ảnh hưởng khá lớn đến hiệu suất, cần kiểm tra nghiêm túc. |
| -XX:NewRatio               | Tỷ lệ giữa young generation (gồm Eden và hai Survivor) và old generation (trừ persistent) |                           | -XX:NewRatio=4 nghĩa là tỷ lệ young generation với old generation là 1:4, young generation chiếm 1/5 toàn bộ heap. Khi Xms=Xmx và đã đặt Xmn, tham số này không cần đặt.                                                                                                                                                                                                                                                                                                                         |
| -XX:SurvivorRatio          | Tỷ lệ kích thước vùng Eden và Survivor                                                    |                           | Đặt là 8, thì tỷ lệ giữa hai vùng Survivor và một vùng Eden là 2:8, một vùng Survivor chiếm 1/10 young generation.                                                                                                                                                                                                                                                                                                                                                                               |
| -XX:+DisableExplicitGC     | Tắt System.gc()                                                                           |                           | Tham số này cần kiểm tra nghiêm túc                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -XX:PretenureSizeThreshold | Đối tượng vượt quá bao nhiêu thì phân bổ trực tiếp trong old generation                   | 0                         | Đơn vị byte. Không hiệu lực khi young generation dùng Parallel Scavenge GC. Một trường hợp khác phân bổ trực tiếp trong old generation là đối tượng mảng lớn và không có external reference trong mảng.                                                                                                                                                                                                                                                                                          |
| -XX:ParallelGCThreads      | Số thread của parallel collector                                                          |                           | Giá trị này tốt nhất cấu hình bằng số processor. Cũng áp dụng cho CMS.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -XX:MaxGCPauseMillis       | Thời gian tối đa của mỗi lần garbage collection young generation (thời gian dừng tối đa)  |                           | Nếu không thể đáp ứng thời gian này, JVM sẽ tự động điều chỉnh kích thước young generation để thỏa mãn giá trị này.                                                                                                                                                                                                                                                                                                                                                                              |

Thực ra còn có một số tham số về in ấn và CMS, ở đây không liệt kê từng cái một nữa.

## IV. Một số khía cạnh về điều chỉnh JVM

Dựa trên các điểm kiến thức JVM vừa đề cập, chúng ta có thể thử điều chỉnh JVM, chủ yếu là phần heap memory.

Kích thước vùng dữ liệu dùng chung của tất cả thread = kích thước young generation + kích thước old generation + kích thước persistent generation. Persistent generation thường có kích thước cố định là 64m. Vì vậy sau khi tăng young generation trong java heap, kích thước old generation sẽ giảm (vì việc dọn dẹp old generation dùng fullgc, nên old generation quá nhỏ lại sẽ làm tăng số lần fullgc). Giá trị này ảnh hưởng khá lớn đến hiệu suất hệ thống, Sun chính thức khuyến nghị cấu hình là 3/8 java heap.

### 4.1 Điều chỉnh heap memory tối đa và tối thiểu

`-Xmx -Xms`: Chỉ định giá trị tối đa java heap (mặc định là 1/4 bộ nhớ vật lý (<1GB)) và giá trị tối thiểu java heap ban đầu (mặc định là 1/64 bộ nhớ vật lý (<1GB)).

Mặc định (có thể điều chỉnh tham số MinHeapFreeRatio) khi heap trống nhỏ hơn 40%, JVM sẽ tăng heap đến giới hạn tối đa -Xmx. Mặc định (có thể điều chỉnh tham số MaxHeapFreeRatio) khi heap trống lớn hơn 70%, JVM sẽ giảm heap nhưng không nhỏ hơn -Xms. Nói đơn giản, bạn liên tục đẩy dữ liệu vào heap memory, khi kích thước còn lại nhỏ hơn 40%, JVM sẽ động xin không gian bộ nhớ nhưng sẽ nhỏ hơn -Xmx, nếu kích thước còn lại lớn hơn 70%, lại sẽ động thu nhỏ nhưng không nhỏ hơn -Xms. Đơn giản như vậy thôi.

Trong quá trình phát triển, thường cấu hình hai tham số `-Xms` và `-Xmx` bằng nhau, mục đích là để sau khi cơ chế garbage collection Java dọn sạch vùng heap không cần phân chia lại tính toán kích thước vùng heap mà lãng phí tài nguyên.

Chúng ta thực thi code sau:

```java
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M");    //系统的最大空间
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M");  //系统的空闲空间
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M");  //当前可用的总空间
```

Lưu ý: ở đây đặt là kích thước Java heap, tức là kích thước young generation + kích thước old generation.

![](https://static001.geekbang.org/infoq/11/114f32ddd295b2e30444f42f6180538c.png)

Đặt một tham số VM options:

```plain
-Xmx20m -Xms5m -XX:+PrintGCDetails
```

![](https://static001.geekbang.org/infoq/7e/7ea0bf0dec20e44bf95128c571d6ef0e.png)

Khởi động lại phương thức main:

![](https://static001.geekbang.org/infoq/c8/c89edbd0a147a791cfabdc37923c6836.png)

Ở đây GC bật ra Allocation Failure (thất bại phân bổ), sự kiện này xảy ra ở PSYoungGen, tức là young generation.

Lúc này bộ nhớ đã xin được là 18M, free memory là 4.214195251464844M.

Lúc này chúng ta tạo một byte array xem, thực thi code sau:

```java
byte[] b = new byte[1 * 1024 * 1024];
System.out.println("分配了1M空间给数组");
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M");  //系统的最大空间
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M");  //系统的空闲空间
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M");
```

![](https://static001.geekbang.org/infoq/db/dbeb6aea0a90949f7d7fe4746ddb11a3.png)

Lúc này free memory lại thu nhỏ, nhưng total memory không thay đổi. Java sẽ cố gắng duy trì giá trị total mem ở kích thước heap memory tối thiểu.

```java
byte[] b = new byte[10 * 1024 * 1024];
System.out.println("分配了10M空间给数组");
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M");  //系统的最大空间
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M");  //系统的空闲空间
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M");  //当前可用的总空间
```

![](https://static001.geekbang.org/infoq/b6/b6a7c522166dbd425dbb06eb56c9b071.png)

Lúc này chúng ta tạo ra một dữ liệu byte 10M, lúc này heap memory tối thiểu không chịu được nữa. Chúng ta sẽ thấy total memory hiện tại đã trở thành 15M, đây là kết quả đã xin bộ nhớ một lần.

Lúc này chúng ta chạy thêm code này:

```java
System.gc();
System.out.println("Xmx=" + Runtime.getRuntime().maxMemory() / 1024.0 / 1024 + "M");    //系统的最大空间
System.out.println("free mem=" + Runtime.getRuntime().freeMemory() / 1024.0 / 1024 + "M");  //系统的空闲空间
System.out.println("total mem=" + Runtime.getRuntime().totalMemory() / 1024.0 / 1024 + "M");  //当前可用的总空间
```

![](https://static001.geekbang.org/infoq/8d/8dd6e8fccfd1394b83251c136ee44ceb.png)

Lúc này chúng ta thực thi thủ công một lần fullgc, total memory lại trở về 5.5M, lúc này lại là kết quả giải phóng bộ nhớ đã xin.

### 4.2 Điều chỉnh tỷ lệ young generation và old generation

```plain
-XX:NewRatio --- 比值(新生代（eden+2*Survivor）和老年代（不包含永久区）的比值)

例如：-XX:NewRatio=4，表示新生代:老年代=1:4，即新生代占整个堆的 1/5。在 Xms=Xmx 并且设置了 Xmn 的情况下，该参数不需要进行设置。
```

### 4.3 Điều chỉnh tỷ lệ vùng Survivor và vùng Eden

```plain
-XX:SurvivorRatio（幸存代）--- 设置两个 Survivor 区和 eden 的比值

例如：8，表示两个 Survivor:eden=2:8，即一个 Survivor 占年轻代的 1/10
```

### 4.4 Đặt kích thước young generation và old generation

```plain
-XX:NewSize --- 设置年轻代大小
-XX:MaxNewSize --- 设置年轻代最大值
```

Có thể kiểm tra các tình huống khác nhau bằng cách đặt các tham số khác nhau, dù sao giải pháp tối ưu nhất tất nhiên là tỷ lệ Eden và Survivor chính thức là 8:1:1, và khi giới thiệu các tham số này đều đã kèm theo một số giải thích, ai muốn tìm hiểu cũng có thể xem qua. Dù sao heap memory tối đa và tối thiểu nếu giá trị khác nhau sẽ dẫn đến nhiều lần gc, cần chú ý.

### 4.5 Tóm tắt nhỏ

Điều chỉnh kích thước young generation và survivor generation theo tình huống thực tế, Sun chính thức khuyến nghị young generation chiếm 3/8 java heap, survivor generation chiếm 1/10 young generation.

Khi OOM, hãy nhớ Dump heap ra, đảm bảo có thể gỡ lỗi tại chỗ, thông qua lệnh dưới đây bạn có thể xuất file .dump, file này có thể dùng VisualVM hoặc Java VisualVM đi kèm với Java.

```plain
-Xmx20m -Xms5m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=bạn muốn xuất log ở đường dẫn nào
```

Thông thường chúng ta cũng có thể thông qua việc viết script để khi OOM xảy ra báo cho chúng ta biết, có thể thông qua gửi email hoặc restart chương trình để giải quyết.

### 4.6 Cấu hình permanent generation

```plain
-XX:PermSize -XX:MaxPermSize
```

Không gian ban đầu (mặc định là 1/64 bộ nhớ vật lý) và không gian tối đa (mặc định là 1/4 bộ nhớ vật lý). Nghĩa là, khi jvm khởi động, permanent generation từ đầu đã chiếm không gian PermSize, nếu không gian vẫn không đủ, có thể tiếp tục mở rộng, nhưng không thể vượt quá MaxPermSize, ngược lại sẽ OOM.

Tips: Nếu không gian heap chưa dùng hết mà đã ném OOM, có thể là permanent generation gây ra. Không gian heap thực tế chiếm dụng rất ít, nhưng permanent generation tràn cũng ném OOM như nhau.

### 4.7 Điều chỉnh tham số stack của JVM

#### 4.7.1 Điều chỉnh kích thước stack space của mỗi thread

Có thể điều chỉnh kích thước stack space của mỗi thread thông qua `-Xss`.

Từ JDK5.0 trở đi mỗi thread stack size là 1M, trước đó là 256K. Với cùng bộ nhớ vật lý, giảm giá trị này có thể tạo nhiều thread hơn. Nhưng hệ điều hành vẫn có giới hạn số thread trong một tiến trình, không thể tạo vô hạn, giá trị kinh nghiệm khoảng 3000~5000.

#### 4.7.2 Đặt kích thước thread stack

```plain
-XXThreadStackSize：
设置线程栈的大小(0 means use default stack size)
```

Những tham số này đều có thể kiểm tra đơn giản thông qua tự viết chương trình, ở đây hạn chế về độ dài bài không cung cấp thêm demo nữa.

### 4.8 (Có thể bỏ qua) Giới thiệu các tham số JVM khác

Tham số rất nhiều và đa dạng, sẽ không nói hết tất cả, vì mọi người thực ra cũng không cần thiết đi sâu đến tận cùng.

#### 4.8.1 Đặt kích thước trang bộ nhớ

```plain
-XXThreadStackSize：
设置内存页的大小，不可设置过大，会影响Perm的大小
```

#### 4.8.2 Đặt tối ưu hóa nhanh cho kiểu nguyên thủy

```plain
-XX:+UseFastAccessorMethods：
设置原始类型的快速优化
```

#### 4.8.3 Đặt tắt GC thủ công

```plain
-XX:+DisableExplicitGC：
设置关闭System.gc()(这个参数需要严格的测试)
```

#### 4.8.4 Đặt tuổi tối đa của rác

```plain
-XX:MaxTenuringThreshold
设置垃圾最大年龄。如果设置为0的话,则年轻代对象不经过Survivor区,直接进入年老代.对于年老代比较多的应用,可以提高效率。如果将此值设置为一个较大值,则年轻代对象会在Survivor区进行多次复制,这样可以增加对象再年轻代的存活时间,加在年轻代即被回收的概率。该参数只有在串行GC时才有效.
```

#### 4.8.5 Tăng tốc biên dịch

```plain
-XX:+AggressiveOpts
加快编译速度
```

#### 4.8.6 Cải thiện hiệu suất cơ chế khóa

```plain
-XX:+UseBiasedLocking
```

#### 4.8.7 Tắt garbage collection

```plain
-Xnoclassgc
```

#### 4.8.8 Đặt thời gian tồn tại trong heap space

```plain
-XX:SoftRefLRUPolicyMSPerMB
设置每兆堆空闲空间中SoftReference的存活时间，默认值是1s。
```

#### 4.8.9 Đặt đối tượng phân bổ trực tiếp trong old generation

```plain
-XX:PretenureSizeThreshold
设置对象超过多大时直接在老年代分配，默认值是0。
```

#### 4.8.10 Đặt tỷ lệ TLAB chiếm vùng eden

```plain
-XX:TLABWasteTargetPercent
设置TLAB占eden区的百分比，默认值是1% 。
```

#### 4.8.11 Đặt có ưu tiên YGC không

```plain
-XX:+CollectGen0First
设置FullGC时是否先YGC，默认值是false。
```

## Kết

Thực sự đã nói rất lâu về điều này, tham khảo nhiều nguồn tài liệu, có "Phân tích sâu về máy ảo" và "Câu hỏi phỏng vấn kỹ thuật cốt lõi Java" của Geek Time, có Baidu, có một số tổng kết từ các khóa học online đang học. Hy vọng có ích cho bạn, cảm ơn.

<!-- @include: @article-footer.snippet.md -->
