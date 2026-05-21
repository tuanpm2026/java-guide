---
title: Giải thích chi tiết về Thu gom rác trong JVM (Trọng tâm)
description: Giải thích chi tiết về thu gom rác JVM - Trình bày toàn diện về các thuật toán GC (đánh dấu-xóa, sao chép, đánh dấu-nén), cơ chế thu gom theo thế hệ, các bộ thu gom rác phổ biến (Serial, Parallel, CMS, G1, ZGC) và thực hành tối ưu GC.
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: JVM垃圾回收,GC算法,垃圾回收器,分代回收,标记清除,复制算法,G1 GC,ZGC,GC调优
---

> Nếu không có ghi chú đặc biệt, tất cả nội dung đều đề cập đến máy ảo HotSpot.
>
> Bài viết này được tổng hợp và bổ sung dựa trên cuốn sách "Hiểu sâu về Máy ảo Java: Các tính năng nâng cao và thực hành tốt nhất của JVM".
>
> Các câu hỏi phỏng vấn thường gặp:
>
> - Làm thế nào để xác định một đối tượng đã chết (hai phương pháp).
> - Giới thiệu ngắn gọn về tham chiếu mạnh, tham chiếu mềm, tham chiếu yếu, tham chiếu ảo (sự khác biệt giữa tham chiếu ảo với tham chiếu mềm và yếu, lợi ích khi sử dụng tham chiếu mềm).
> - Làm thế nào để xác định một hằng số là hằng số đã bị bỏ.
> - Làm thế nào để xác định một lớp là lớp vô dụng.
> - Có những thuật toán thu gom rác nào, đặc điểm của từng loại?
> - Tại sao HotSpot lại chia thành thế hệ trẻ và thế hệ già?
> - Các bộ thu gom rác thường gặp là gì?
> - Giới thiệu về bộ thu gom CMS và G1.
> - Minor GC và Full GC khác nhau như thế nào?

## Lời mở đầu

Khi cần phân tích các vấn đề tràn bộ nhớ, khi thu gom rác trở thành nút thắt cổ chai ngăn hệ thống đạt được mức đồng thời cao hơn, chúng ta cần thực hiện việc giám sát và điều chỉnh cần thiết đối với các kỹ thuật "tự động" này.

## Cấu trúc cơ bản của vùng Heap

Quản lý bộ nhớ tự động của Java chủ yếu liên quan đến việc thu hồi và cấp phát bộ nhớ đối tượng. Đồng thời, chức năng cốt lõi nhất của quản lý bộ nhớ tự động Java là cấp phát và thu hồi đối tượng trong bộ nhớ **Heap**.

Heap Java là vùng chính được bộ thu gom rác quản lý, vì vậy còn được gọi là **GC Heap (Garbage Collected Heap)**.

Từ góc độ thu gom rác, vì các bộ thu gom hiện nay hầu hết sử dụng thuật toán thu gom rác theo thế hệ, Heap Java được chia thành nhiều vùng khác nhau, điều này cho phép chúng ta chọn thuật toán thu gom rác phù hợp dựa trên đặc điểm của từng vùng.

Trong JDK 7 và các phiên bản trước, bộ nhớ heap thường được chia thành ba phần:

1. Bộ nhớ thế hệ trẻ (Young Generation)
2. Thế hệ già (Old Generation)
3. Thế hệ vĩnh cửu (Permanent Generation)

Vùng Eden, hai vùng Survivor S0 và S1 trong hình dưới đây đều thuộc thế hệ trẻ, lớp giữa thuộc thế hệ già, lớp dưới cùng thuộc thế hệ vĩnh cửu.

![Cấu trúc bộ nhớ Heap](/images/github/javaguide/java/jvm/hotspot-heap-structure.png)

**Sau JDK 8, PermGen (Vĩnh cửu) đã được thay thế bởi Metaspace (Không gian siêu dữ liệu), Metaspace sử dụng bộ nhớ trực tiếp**.

Để biết thêm chi tiết về cấu trúc không gian heap, bạn có thể quay lại xem bài viết [Giải thích chi tiết về vùng bộ nhớ Java](./memory-area.md).

## Nguyên tắc cấp phát và thu hồi bộ nhớ

### Đối tượng được ưu tiên cấp phát trong vùng Eden

Trong hầu hết các trường hợp, đối tượng được cấp phát trong vùng Eden của thế hệ trẻ. Khi vùng Eden không có đủ không gian để cấp phát, máy ảo sẽ khởi động một Minor GC. Hãy thực hiện thử nghiệm thực tế bên dưới.

Mã thử nghiệm:

```java
public class GCTest {
  public static void main(String[] args) {
    byte[] allocation1, allocation2;
    allocation1 = new byte[30900*1024];
  }
}
```

Chạy theo cách sau:
![](/images/github/javaguide/java/jvm/25178350.png)

Tham số thêm vào: `-XX:+PrintGCDetails`
![](/images/github/javaguide/java/jvm/run-with-PrintGCDetails.png)

Kết quả chạy (phần chữ đỏ mô tả không chính xác, thực ra tương ứng với thế hệ vĩnh cửu của JDK1.7):

![](/images/github/javaguide/java/jvm/28954286.jpg)

Từ hình trên, chúng ta có thể thấy bộ nhớ vùng Eden gần như đã được cấp phát đầy (ngay cả khi chương trình không làm gì, thế hệ trẻ vẫn sử dụng hơn 2000k bộ nhớ).

Giả sử chúng ta tiếp tục cấp phát bộ nhớ cho `allocation2` thì điều gì sẽ xảy ra?

```java
allocation2 = new byte[900*1024];
```

![](/images/github/javaguide/java/jvm/28128785.jpg)

Khi cấp phát bộ nhớ cho `allocation2`, bộ nhớ vùng Eden gần như đã đầy.

Khi vùng Eden không có đủ không gian, máy ảo sẽ khởi động một Minor GC. Trong quá trình GC, máy ảo phát hiện `allocation1` không thể lưu vào không gian Survivor, vì vậy phải chuyển đối tượng thế hệ trẻ sang thế hệ già sớm thông qua **cơ chế đảm bảo cấp phát**. Không gian thế hệ già đủ để chứa `allocation1`, vì vậy Full GC sẽ không xảy ra. Sau khi thực thi Minor GC, nếu các đối tượng được cấp phát tiếp theo có thể nằm trong vùng Eden thì vẫn sẽ được cấp phát bộ nhớ tại Eden. Bạn có thể chạy đoạn mã sau để xác nhận:

```java
public class GCTest {

  public static void main(String[] args) {
    byte[] allocation1, allocation2,allocation3,allocation4,allocation5;
    allocation1 = new byte[32000*1024];
    allocation2 = new byte[1000*1024];
    allocation3 = new byte[1000*1024];
    allocation4 = new byte[1000*1024];
    allocation5 = new byte[1000*1024];
  }
}

```

### Đối tượng lớn đi thẳng vào thế hệ già

Đối tượng lớn là các đối tượng cần không gian bộ nhớ liên tục lớn (ví dụ: chuỗi, mảng).

Hành vi đối tượng lớn đi thẳng vào thế hệ già được quyết định động bởi máy ảo, liên quan đến bộ thu gom rác cụ thể và các tham số liên quan. Đây là chiến lược tối ưu nhằm tránh đặt đối tượng lớn vào thế hệ trẻ, từ đó giảm tần suất và chi phí thu gom rác ở thế hệ trẻ.

- Bộ thu gom rác G1 sẽ quyết định đối tượng nào đi thẳng vào thế hệ già dựa trên kích thước vùng heap được cài đặt bởi tham số `-XX:G1HeapRegionSize` và ngưỡng được cài đặt bởi `-XX:G1MixedGCLiveThresholdPercent`.
- Trong bộ thu gom Parallel Scavenge, mặc định không có ngưỡng cố định (`XX:ThresholdTolerance` được điều chỉnh động) để quyết định khi nào cấp phát trực tiếp đối tượng lớn vào thế hệ già. Thay vào đó, máy ảo quyết định động dựa trên tình trạng bộ nhớ heap hiện tại và dữ liệu lịch sử.

### Đối tượng tồn tại lâu sẽ vào thế hệ già

Vì máy ảo sử dụng ý tưởng thu gom theo thế hệ để quản lý bộ nhớ, khi thu hồi bộ nhớ phải có khả năng xác định đối tượng nào nên đặt ở thế hệ trẻ, đối tượng nào nên đặt ở thế hệ già. Để làm được điều này, máy ảo gán cho mỗi đối tượng một bộ đếm tuổi đối tượng (Age).

Trong hầu hết các trường hợp, đối tượng đầu tiên được cấp phát trong vùng Eden. Nếu đối tượng được sinh ra ở Eden và vẫn còn sống sau Minor GC đầu tiên, và có thể được chứa trong Survivor, nó sẽ được chuyển sang không gian Survivor (s0 hoặc s1) và tuổi đối tượng được đặt thành 1 (tuổi ban đầu sau khi chuyển từ Eden sang Survivor là 1).

Mỗi lần đối tượng sống sót qua một MinorGC trong Survivor, tuổi tăng thêm 1. Khi tuổi tăng đến một mức nhất định (mặc định là 15), đối tượng sẽ được thăng cấp lên thế hệ già. Ngưỡng tuổi thăng cấp có thể được đặt thông qua tham số `-XX:MaxTenuringThreshold`.

> Chỉnh sửa ([issue552](https://github.com/Snailclimb/JavaGuide/issues/552)): "Khi HotSpot duyệt qua tất cả các đối tượng, nó tích lũy kích thước của chúng theo thứ tự tăng dần của tuổi. Khi kích thước tích lũy của một tuổi nào đó vượt quá 50% vùng survivor (giá trị mặc định là 50%, có thể đặt qua `-XX:TargetSurvivorRatio=percent`, xem [issue1199](https://github.com/Snailclimb/JavaGuide/issues/1199)), thì lấy giá trị nhỏ hơn giữa tuổi này và MaxTenuringThreshold làm ngưỡng tuổi thăng cấp mới".
>
> Tài liệu chính thức JDK8: <https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html>.
>
> ![](/images/java-guide-blog/image-20210523201742303.png)
>
> **Mã tính toán tuổi động như sau:**
>
> ```c++
> uint ageTable::compute_tenuring_threshold(size_t survivor_capacity) {
> //survivor_capacity是survivor空间的大小
> size_t desired_survivor_size = (size_t)((((double)survivor_capacity)*TargetSurvivorRatio)/100);
> size_t total = 0;
> uint age = 1;
> while (age < table_size) {
> //sizes数组是每个年龄段对象大小
> total += sizes[age];
> if (total > desired_survivor_size) {
> break;
> }
> age++;
> }
> uint result = age < MaxTenuringThreshold ? age : MaxTenuringThreshold;
> ...
> }
>
> ```
>
> Bổ sung thêm ([issue672](https://github.com/Snailclimb/JavaGuide/issues/672)): **Về tuổi thăng cấp mặc định là 15, phát biểu này phần lớn bắt nguồn từ cuốn sách "Hiểu sâu về Máy ảo Java".**
> Nếu bạn đọc [các tham số máy ảo liên quan](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html) trên trang web Oracle, bạn sẽ thấy `-XX:MaxTenuringThreshold=threshold` có ghi chú:
>
> **Sets the maximum tenuring threshold for use in adaptive GC sizing. The largest value is 15. The default value is 15 for the parallel (throughput) collector, and 6 for the CMS collector. Tuổi thăng cấp mặc định không phải lúc nào cũng là 15, phụ thuộc vào bộ thu gom rác, với CMS là 6.**

### Các vùng GC chính

Ông Zhou Zhiming đã viết trong trang P92 của phiên bản thứ hai cuốn "Hiểu sâu về Máy ảo Java":

> ~~_"GC thế hệ già (Major GC/Full GC), chỉ GC xảy ra ở thế hệ già……"_~~

Phát biểu trên đã được sửa trong phiên bản thứ ba của "Hiểu sâu về Máy ảo Java". Cảm ơn câu trả lời của R:

![Câu trả lời của R](/images/github/javaguide/java/jvm/rf-hotspot-vm-gc.png)

**Tóm tắt:**

Đối với triển khai HotSpot VM, GC trong đó thực ra chỉ được phân loại chính xác thành hai loại lớn:

Thu gom một phần (Partial GC):

- Thu gom thế hệ trẻ (Minor GC / Young GC): Chỉ thu gom rác ở thế hệ trẻ;
- Thu gom thế hệ già (Major GC / Old GC): Chỉ thu gom rác ở thế hệ già. Lưu ý rằng Major GC trong một số ngữ cảnh cũng được dùng để chỉ thu gom toàn bộ heap;
- Thu gom hỗn hợp (Mixed GC): Thu gom rác cho toàn bộ thế hệ trẻ và một phần thế hệ già.

Thu gom toàn bộ heap (Full GC): Thu gom toàn bộ Heap Java và vùng phương thức.

### Đảm bảo cấp phát không gian

Đảm bảo cấp phát không gian là để đảm bảo rằng trước khi Minor GC, thế hệ già vẫn còn đủ không gian để chứa tất cả các đối tượng trong thế hệ trẻ.

Chương ba của "Hiểu sâu về Máy ảo Java" mô tả đảm bảo cấp phát không gian như sau:

> Trước JDK 6 Update 24, trước khi xảy ra Minor GC, máy ảo phải kiểm tra xem không gian liên tục tối đa có sẵn trong thế hệ già có lớn hơn tổng không gian của tất cả các đối tượng trong thế hệ trẻ không. Nếu điều kiện này thỏa mãn thì Minor GC lần này có thể đảm bảo an toàn. Nếu không, máy ảo sẽ kiểm tra xem giá trị của tham số `-XX:HandlePromotionFailure` có cho phép thất bại đảm bảo không; nếu cho phép, nó sẽ tiếp tục kiểm tra xem không gian liên tục tối đa có sẵn trong thế hệ già có lớn hơn kích thước trung bình của các đối tượng đã được thăng cấp vào thế hệ già không, nếu lớn hơn sẽ thực hiện một Minor GC, mặc dù Minor GC này có rủi ro; nếu nhỏ hơn, hoặc tham số `-XX:HandlePromotionFailure` không cho phép mạo hiểm thì lúc này phải thực hiện Full GC.
>
> Sau JDK 6 Update 24, quy tắc thay đổi thành: chỉ cần không gian liên tục của thế hệ già lớn hơn tổng kích thước đối tượng thế hệ trẻ hoặc kích thước trung bình của các lần thăng cấp trước, Minor GC sẽ được thực hiện, nếu không Full GC sẽ được thực hiện.

## Phương pháp xác định đối tượng đã chết

Heap chứa hầu như tất cả các thể hiện đối tượng, bước đầu tiên trước khi thu gom rác trong heap là xác định đối tượng nào đã chết (tức là các đối tượng không thể được sử dụng qua bất kỳ đường dẫn nào nữa).

### Phương pháp đếm tham chiếu

Thêm một bộ đếm tham chiếu vào đối tượng:

- Mỗi khi có nơi tham chiếu đến nó, bộ đếm tăng 1;
- Khi tham chiếu không còn hợp lệ, bộ đếm giảm 1;
- Bất kỳ lúc nào, đối tượng có bộ đếm bằng 0 đều không thể được sử dụng nữa.

**Phương pháp này đơn giản để triển khai và hiệu quả cao, nhưng hiện tại các máy ảo chính thống không chọn thuật toán này để quản lý bộ nhớ, lý do chính là nó rất khó giải quyết vấn đề tham chiếu vòng giữa các đối tượng.**

![Tham chiếu vòng giữa các đối tượng](/images/github/javaguide/java/jvm/object-circular-reference.png)

Vấn đề tham chiếu lẫn nhau giữa các đối tượng được mô tả như đoạn mã dưới đây: ngoài việc `objA` và `objB` tham chiếu lẫn nhau, không có tham chiếu nào khác giữa hai đối tượng này. Nhưng vì chúng tham chiếu nhau, bộ đếm tham chiếu của chúng đều không bằng 0, vì vậy thuật toán đếm tham chiếu không thể thông báo cho bộ thu gom GC thu hồi chúng.

```java
public class ReferenceCountingGc {
    Object instance = null;
    public static void main(String[] args) {
        ReferenceCountingGc objA = new ReferenceCountingGc();
        ReferenceCountingGc objB = new ReferenceCountingGc();
        objA.instance = objB;
        objB.instance = objA;
        objA = null;
        objB = null;
    }
}
```

### Thuật toán phân tích khả năng tiếp cận

Ý tưởng cơ bản của thuật toán này là sử dụng một tập hợp các đối tượng được gọi là **"GC Roots"** làm điểm khởi đầu, từ các nút này tìm kiếm xuống dưới, đường đi qua các nút được gọi là chuỗi tham chiếu. Khi một đối tượng không có bất kỳ chuỗi tham chiếu nào kết nối với GC Roots, thì đối tượng đó được coi là không thể sử dụng và cần được thu hồi.

Trong hình dưới, mặc dù `Object 6 ~ Object 10` có quan hệ tham chiếu với nhau, nhưng chúng không thể tiếp cận từ GC Roots, vì vậy chúng là các đối tượng cần được thu hồi.

![Thuật toán phân tích khả năng tiếp cận](/images/github/javaguide/java/jvm/jvm-gc-roots.png)

**Những đối tượng nào có thể là GC Roots?**

- Đối tượng được tham chiếu bởi bảng biến cục bộ trong stack máy ảo (stack frame)
- Đối tượng được tham chiếu bởi stack phương thức native (phương thức Native)
- Đối tượng được tham chiếu bởi các thuộc tính tĩnh của lớp trong vùng phương thức
- Đối tượng được tham chiếu bởi hằng số trong vùng phương thức
- Tất cả các đối tượng được giữ bởi khóa đồng bộ
- Đối tượng được tham chiếu bởi JNI (Java Native Interface)

**Nếu đối tượng có thể được thu hồi, điều đó có nghĩa là nó chắc chắn sẽ được thu hồi không?**

Ngay cả các đối tượng không thể tiếp cận trong phân tích khả năng tiếp cận cũng không nhất thiết là "phải chết", lúc này chúng đang ở "giai đoạn tạm giam". Để thực sự tuyên bố một đối tượng đã chết, phải trải qua ít nhất hai lần đánh dấu; đối tượng không thể tiếp cận trong phân tích khả năng tiếp cận sẽ được đánh dấu lần đầu và qua một lần lọc, điều kiện lọc là liệu đối tượng có cần thiết phải thực thi phương thức `finalize` không. Khi đối tượng không ghi đè phương thức `finalize`, hoặc phương thức `finalize` đã được máy ảo gọi trước đó, máy ảo sẽ coi cả hai trường hợp này là không cần thiết phải thực thi.

Các đối tượng được xác định là cần thực thi sẽ được đặt vào một hàng đợi để đánh dấu lần thứ hai. Trừ khi đối tượng này thiết lập liên kết với bất kỳ đối tượng nào trên chuỗi tham chiếu, nếu không nó sẽ thực sự bị thu hồi.

> Phương thức `finalize` trong lớp `Object` từ lâu đã được coi là thiết kế tệ, trở thành gánh nặng của ngôn ngữ Java, ảnh hưởng đến bảo mật ngôn ngữ Java và hiệu suất GC. Trong JDK9 và các phiên bản tiếp theo, phương thức `finalize` trong các lớp sẽ dần bị khai thác và loại bỏ. Hãy quên sự tồn tại của nó đi!
>
> Tham khảo:
>
> - [JEP 421: Deprecate Finalization for Removal](https://openjdk.java.net/jeps/421)
> - [Đã đến lúc quên phương thức finalize](https://mp.weixin.qq.com/s/LW-paZAMD08DP_3-XCUxmg)

### Tóm tắt các loại tham chiếu

Dù là xác định số lượng tham chiếu đối tượng qua phương pháp đếm tham chiếu, hay xác định chuỗi tham chiếu đối tượng có thể tiếp cận qua phân tích khả năng tiếp cận, việc xác định sự tồn tại của đối tượng đều liên quan đến "tham chiếu".

Trước JDK1.2, định nghĩa về tham chiếu trong Java rất truyền thống: nếu giá trị được lưu trong dữ liệu kiểu tham chiếu đại diện cho địa chỉ bắt đầu của một khối bộ nhớ khác, thì khối bộ nhớ đó đại diện cho một tham chiếu.

Sau JDK1.2, Java đã mở rộng khái niệm tham chiếu, phân chia tham chiếu thành bốn loại: tham chiếu mạnh, tham chiếu mềm, tham chiếu yếu, tham chiếu ảo (độ mạnh tham chiếu giảm dần). Tham chiếu mạnh là các đối tượng thông thường trong Java, còn tham chiếu mềm, yếu, ảo được định nghĩa trong JDK bởi các lớp `SoftReference`, `WeakReference`, `PhantomReference` tương ứng.

![Tóm tắt các loại tham chiếu Java](/images/github/javaguide/java/jvm/java-reference-type.png)

**1. Tham chiếu mạnh (StrongReference)**

Tham chiếu mạnh thực chất là việc gán tham chiếu phổ biến trong mã chương trình, đây là loại tham chiếu phổ biến nhất:

```java
String strongReference = new String("abc");
```

Nếu một đối tượng có tham chiếu mạnh, nó tương tự như **đồ dùng thiết yếu hàng ngày**, bộ thu gom rác sẽ không bao giờ thu hồi nó. Khi không gian bộ nhớ không đủ, JVM thà ném ra lỗi OutOfMemoryError khiến chương trình dừng bất thường, còn hơn là thu hồi bừa bãi đối tượng có tham chiếu mạnh để giải quyết vấn đề thiếu bộ nhớ.

**2. Tham chiếu mềm (SoftReference)**

Nếu một đối tượng chỉ có tham chiếu mềm, nó tương tự như **đồ dùng không thiết yếu**. Ví dụ tham chiếu mềm:

```java
// --- 示例1 ---
String str = new String("abc");
SoftReference<String> softReference1 = new SoftReference<>(str);
str = null; // 去掉强引用

// --- 示例2 ---
SoftReference<String> softReference2 = new SoftReference<>(new String("def")); // 匿名对象
```

Đối tượng tham chiếu mềm có thể bị thu hồi khi bộ nhớ bị áp lực, nhưng JVM không đảm bảo chỉ xóa khi thiếu bộ nhớ. Đảm bảo duy nhất là: trước khi ném OutOfMemoryError, tất cả các đối tượng chỉ có thể tiếp cận bằng tham chiếu mềm nhất định sẽ được xóa. Miễn là bộ thu gom rác không thu hồi nó, đối tượng đó có thể được chương trình sử dụng. Tham chiếu mềm có thể được dùng để triển khai bộ nhớ đệm tốc độ cao nhạy cảm với bộ nhớ.

Tham chiếu mềm có thể được dùng kết hợp với một hàng đợi tham chiếu (ReferenceQueue). Nếu đối tượng được tham chiếu bởi tham chiếu mềm bị thu gom rác, JVM sẽ thêm tham chiếu mềm này vào hàng đợi tham chiếu liên kết với nó.

**3. Tham chiếu yếu (WeakReference)**

Nếu một đối tượng chỉ có tham chiếu yếu, nó tương tự như **đồ dùng không thiết yếu**. Ví dụ tham chiếu yếu:

```java
// --- 示例1 ---
String str = new String("abc");
WeakReference<String> weakReference1 = new WeakReference<>(str);
str = null; //去除强引用

// --- 示例2 ---
WeakReference<String> weakReference2 = new WeakReference<>(new String("abc")); // 匿名对象
```

Sự khác biệt giữa tham chiếu yếu và tham chiếu mềm là: đối tượng chỉ có tham chiếu yếu có vòng đời ngắn hơn. Trong quá trình luồng bộ thu gom rác quét vùng bộ nhớ nó quản lý, một khi phát hiện đối tượng chỉ có tham chiếu yếu, bất kể không gian bộ nhớ hiện tại có đủ hay không, đều sẽ thu hồi bộ nhớ của nó. Tuy nhiên, vì bộ thu gom rác là luồng có mức ưu tiên rất thấp, nên không nhất thiết sẽ nhanh chóng phát hiện các đối tượng chỉ có tham chiếu yếu.

Tham chiếu yếu cũng có thể được dùng kết hợp với hàng đợi tham chiếu (ReferenceQueue). Nếu đối tượng được tham chiếu bởi tham chiếu yếu bị thu gom rác, JVM sẽ thêm tham chiếu yếu này vào hàng đợi tham chiếu liên kết với nó.

**4. Tham chiếu ảo (PhantomReference)**

"Tham chiếu ảo" theo nghĩa đen là như không có tham chiếu. Khác với các loại tham chiếu khác, tham chiếu ảo không quyết định vòng đời của đối tượng. Nếu một đối tượng chỉ giữ tham chiếu ảo, thì nó giống như không có tham chiếu nào, có thể bị thu gom rác bất cứ lúc nào. Ví dụ tham chiếu ảo:

```java
// --- 示例1 ---
String str = new String("abc");
ReferenceQueue queue = new ReferenceQueue();
// 创建虚引用，要求必须与一个引用队列关联
PhantomReference phantomReference1 = new PhantomReference(str, queue);
str = null; // 去除强引用

// --- 示例2 ---
PhantomReference phantomReference2 = new PhantomReference(new String("abc"), queue); // 匿名对象
```

**Tham chiếu ảo chủ yếu được dùng để theo dõi hoạt động đối tượng bị thu gom rác**.

**Một điểm khác biệt giữa tham chiếu ảo với tham chiếu mềm và yếu là:** Tham chiếu ảo phải được sử dụng kết hợp với hàng đợi tham chiếu (ReferenceQueue). Khi bộ thu gom rác chuẩn bị thu hồi đối tượng, nếu phát hiện nó vẫn còn tham chiếu ảo, trước khi thu hồi bộ nhớ của đối tượng, nó sẽ thêm tham chiếu ảo này vào hàng đợi tham chiếu liên kết. Chương trình có thể thực hiện các hành động cần thiết trước khi bộ nhớ của đối tượng được tham chiếu bị thu hồi bằng cách kiểm tra xem tham chiếu ảo đã được thêm vào hàng đợi tham chiếu chưa.

Đặc biệt lưu ý rằng trong thiết kế chương trình, tham chiếu yếu và tham chiếu ảo ít được sử dụng, tham chiếu mềm được dùng nhiều hơn. Nguyên nhân là **tham chiếu mềm có thể tăng tốc độ thu hồi bộ nhớ rác của JVM, duy trì sự vận hành an toàn của hệ thống, ngăn ngừa các vấn đề như tràn bộ nhớ (OutOfMemory)**.

### Làm thế nào để xác định một hằng số là hằng số đã bị bỏ?

Pool hằng chuỗi chủ yếu thu hồi các hằng đã bị bỏ. Vậy, làm thế nào để xác định một hằng là hằng đã bị bỏ?

~~**JVM từ JDK1.7 trở đi đã chuyển pool hằng thời gian chạy ra khỏi vùng phương thức và tạo ra một vùng trong Java Heap để lưu pool hằng thời gian chạy.**~~

> **Chỉnh sửa (xem: [issue747](https://github.com/Snailclimb/JavaGuide/issues/747), [reference](https://blog.csdn.net/q5706503/article/details/84640762))**:
>
> 1. **Trước JDK1.7, logic pool hằng thời gian chạy bao gồm pool hằng chuỗi được lưu trong vùng phương thức. Lúc này, triển khai vùng phương thức của HotSpot là thế hệ vĩnh cửu (PermGen)**
> 2. **JDK1.7, pool hằng chuỗi được chuyển từ vùng phương thức vào heap. Điều này không đề cập đến pool hằng thời gian chạy, tức là pool hằng chuỗi được chuyển riêng vào heap, còn lại của pool hằng thời gian chạy vẫn nằm trong vùng phương thức, tức là thế hệ vĩnh cửu trong HotSpot**.
> 3. **JDK1.8, HotSpot loại bỏ thế hệ vĩnh cửu và thay thế bằng Metaspace, lúc này pool hằng chuỗi vẫn ở heap, pool hằng thời gian chạy vẫn ở vùng phương thức, chỉ là triển khai vùng phương thức thay đổi từ thế hệ vĩnh cửu sang Metaspace**

Giả sử trong pool hằng chuỗi có chuỗi "abc", nếu hiện tại không có đối tượng String nào tham chiếu đến hằng chuỗi này, thì hằng "abc" là hằng đã bị bỏ. Nếu lúc này xảy ra thu hồi bộ nhớ và cần thiết, "abc" sẽ bị hệ thống xóa khỏi pool hằng.

### Làm thế nào để xác định một lớp là lớp vô dụng?

Vùng phương thức chủ yếu thu hồi các lớp vô dụng. Vậy làm thế nào để xác định một lớp là lớp vô dụng?

Xác định một hằng có phải "hằng đã bị bỏ" hay không khá đơn giản, còn xác định một lớp có phải "lớp vô dụng" hay không thì khắt khe hơn nhiều. Lớp cần thỏa mãn đồng thời 3 điều kiện sau mới được coi là **"lớp vô dụng"**:

- Tất cả các thể hiện của lớp đó đã bị thu hồi, tức là không có thể hiện nào của lớp đó tồn tại trong Java Heap.
- `ClassLoader` tải lớp đó đã bị thu hồi.
- Đối tượng `java.lang.Class` tương ứng với lớp đó không được tham chiếu ở bất kỳ đâu, và không thể truy cập phương thức của lớp đó thông qua phản chiếu ở bất kỳ đâu.

Máy ảo có thể thu hồi các lớp vô dụng thỏa mãn 3 điều kiện trên, đây chỉ là "có thể", không phải chắc chắn sẽ thu hồi như đối với đối tượng không được sử dụng.

## Thuật toán thu gom rác

### Thuật toán đánh dấu-xóa (Mark-and-Sweep)

Thuật toán đánh dấu-xóa (Mark-and-Sweep) được chia thành hai giai đoạn "đánh dấu (Mark)" và "xóa (Sweep)": Đầu tiên đánh dấu tất cả các đối tượng không cần thu hồi, sau khi đánh dấu xong thì thu hồi đồng loạt tất cả các đối tượng không được đánh dấu.

Đây là thuật toán thu gom cơ bản nhất, các thuật toán tiếp theo đều được cải tiến từ những thiếu sót của nó. Thuật toán thu gom rác này mang lại hai vấn đề rõ ràng:

1. **Vấn đề hiệu suất**: Hiệu suất của cả hai quá trình đánh dấu và xóa đều không cao.
2. **Vấn đề không gian**: Sau khi đánh dấu và xóa sẽ tạo ra nhiều mảnh bộ nhớ không liên tục.

![Thuật toán đánh dấu-xóa](/images/github/javaguide/java/jvm/mark-and-sweep-garbage-collection-algorithm.png)

Về việc đánh dấu đối tượng có thể thu hồi (đối tượng không thể tiếp cận) hay không thể thu hồi (đối tượng có thể tiếp cận), có nhiều ý kiến khác nhau, cả hai cách đều không sai, cá nhân tôi thiên về cách sau.

Nếu hiểu theo cách trước, toàn bộ quá trình đánh dấu-xóa đại khái như sau:

1. Khi một đối tượng được tạo, gán một bit đánh dấu, giả sử là 0 (false);
2. Trong giai đoạn đánh dấu, đặt bit đánh dấu của tất cả đối tượng có thể tiếp cận (hoặc đối tượng người dùng có thể tham chiếu) thành 1 (true);
3. Giai đoạn quét xóa các đối tượng có bit đánh dấu là 0 (false).

### Thuật toán sao chép (Copying)

Để giải quyết vấn đề hiệu suất và phân mảnh bộ nhớ của thuật toán đánh dấu-xóa, thuật toán thu gom sao chép (Copying) ra đời. Nó có thể chia bộ nhớ thành hai khối bằng nhau, mỗi lần chỉ sử dụng một khối. Khi bộ nhớ của khối này đã dùng hết, chép các đối tượng còn sống sang khối kia, rồi xóa toàn bộ không gian đã sử dụng một lần. Điều này làm cho mỗi lần thu hồi bộ nhớ chỉ thu hồi một nửa vùng bộ nhớ.

![Thuật toán sao chép](/images/github/javaguide/java/jvm/copying-garbage-collection-algorithm.png)

Mặc dù đã cải tiến thuật toán đánh dấu-xóa, vẫn còn những vấn đề sau:

- **Bộ nhớ khả dụng thu nhỏ**: Bộ nhớ khả dụng thu nhỏ xuống còn một nửa.
- **Không phù hợp với thế hệ già**: Nếu số lượng đối tượng còn sống tương đối lớn, hiệu suất sao chép sẽ rất kém.

### Thuật toán đánh dấu-nén (Mark-and-Compact)

Thuật toán đánh dấu-nén (Mark-and-Compact) là một thuật toán đánh dấu được đề xuất dựa trên đặc điểm của thế hệ già. Quá trình đánh dấu vẫn giống như thuật toán "đánh dấu-xóa", nhưng bước tiếp theo không phải là trực tiếp thu hồi các đối tượng có thể thu hồi, mà là dịch chuyển tất cả các đối tượng còn sống về một đầu, rồi trực tiếp xóa bộ nhớ bên ngoài ranh giới cuối.

![Thuật toán đánh dấu-nén](/images/github/javaguide/java/jvm/mark-and-compact-garbage-collection-algorithm.png)

Do có thêm bước nén, hiệu suất không cao, phù hợp với các cảnh huống như thế hệ già nơi tần suất thu gom rác không quá cao.

### Thuật toán thu gom theo thế hệ (Generational Collection)

Thu gom rác của các máy ảo hiện tại đều sử dụng thuật toán thu gom theo thế hệ. Thuật toán này không có ý tưởng mới, chỉ đơn giản là chia bộ nhớ thành nhiều khối dựa trên vòng đời khác nhau của đối tượng. Thông thường, Heap Java được chia thành thế hệ trẻ và thế hệ già, điều này cho phép chúng ta chọn thuật toán thu gom rác phù hợp dựa trên đặc điểm của từng thế hệ.

Ví dụ ở thế hệ trẻ, mỗi lần thu gom sẽ có nhiều đối tượng chết, vì vậy có thể chọn thuật toán "sao chép", chỉ cần trả chi phí sao chép ít đối tượng là có thể hoàn thành mỗi lần thu gom rác. Còn đối tượng trong thế hệ già có xác suất sống sót tương đối cao, và không có thêm không gian để phân bổ đảm bảo cho nó, vì vậy chúng ta phải chọn thuật toán "đánh dấu-xóa" hoặc "đánh dấu-nén" để thu gom rác.

**Câu hỏi phỏng vấn mở rộng:** Tại sao HotSpot lại chia thành thế hệ trẻ và thế hệ già?

Trả lời dựa trên phần giới thiệu về thuật toán thu gom theo thế hệ ở trên.

## Bộ thu gom rác

**Nếu thuật toán thu gom là phương pháp luận của việc thu hồi bộ nhớ, thì bộ thu gom rác là triển khai cụ thể của việc thu hồi bộ nhớ.**

Mặc dù chúng ta so sánh các bộ thu gom, nhưng không phải để chọn ra bộ thu gom tốt nhất. Vì cho đến nay vẫn chưa có bộ thu gom rác tốt nhất xuất hiện, càng không có bộ thu gom vạn năng, **điều chúng ta có thể làm là chọn bộ thu gom rác phù hợp nhất với ứng dụng cụ thể của mình**. Hãy thử nghĩ: nếu có một bộ thu gom hoàn hảo phù hợp với mọi cảnh huống trên toàn thế giới, thì HotSpot VM của chúng ta sẽ không cần triển khai nhiều bộ thu gom rác khác nhau như vậy.

Bộ thu gom rác mặc định của JDK (xem bằng lệnh `java -XX:+PrintCommandLineFlags -version`):

- JDK 8: Parallel Scavenge (thế hệ trẻ) + Parallel Old (thế hệ già)
- JDK 9 ~ JDK22: G1

### Bộ thu gom Serial

Bộ thu gom Serial (nối tiếp) là bộ thu gom rác cơ bản nhất và lâu đời nhất. Chỉ cần nhìn tên bạn đã biết đây là bộ thu gom đơn luồng. Ý nghĩa **"đơn luồng"** của nó không chỉ có nghĩa là nó chỉ sử dụng một luồng thu gom rác để hoàn thành công việc thu gom rác, điều quan trọng hơn là trong quá trình thu gom rác nó phải tạm dừng tất cả các luồng công việc khác (**"Stop The World"**), cho đến khi thu gom kết thúc.

**Thế hệ trẻ sử dụng thuật toán đánh dấu-sao chép, thế hệ già sử dụng thuật toán đánh dấu-nén.**

![Bộ thu gom Serial](/images/github/javaguide/java/jvm/serial-garbage-collector.png)

Các nhà thiết kế máy ảo tất nhiên biết rằng Stop The World mang lại trải nghiệm người dùng không tốt, vì vậy trong các thiết kế bộ thu gom rác tiếp theo, thời gian dừng liên tục được rút ngắn (vẫn còn dừng, quá trình tìm kiếm bộ thu gom rác tốt nhất vẫn tiếp tục).

Nhưng bộ thu gom Serial có điểm vượt trội hơn các bộ thu gom rác khác không? Tất nhiên có, nó **đơn giản và hiệu quả (so với đơn luồng của các bộ thu gom khác)**. Bộ thu gom Serial do không có chi phí tương tác luồng, có thể đạt được hiệu suất thu gom đơn luồng cao. Bộ thu gom Serial là lựa chọn tốt cho máy ảo chạy ở chế độ Client.

### Bộ thu gom ParNew

Bộ thu gom ParNew thực chất là phiên bản đa luồng của bộ thu gom Serial. Ngoài việc sử dụng đa luồng để thu gom rác, các hành vi khác (tham số điều khiển, thuật toán thu gom, chiến lược thu hồi, v.v.) hoàn toàn giống với bộ thu gom Serial.

**Thế hệ trẻ sử dụng thuật toán đánh dấu-sao chép, thế hệ già sử dụng thuật toán đánh dấu-nén.**

![Bộ thu gom ParNew](/images/github/javaguide/java/jvm/parnew-garbage-collector.png)

Đây là lựa chọn hàng đầu cho các máy ảo chạy ở chế độ Server. Ngoài bộ thu gom Serial, chỉ có nó mới có thể hoạt động cùng với bộ thu gom CMS (bộ thu gom đồng thời thực sự, sẽ được giới thiệu sau).

**Bổ sung khái niệm song song và đồng thời:**

- **Song song (Parallel)**: Nhiều luồng thu gom rác làm việc song song, nhưng lúc này luồng người dùng vẫn ở trạng thái chờ đợi.

- **Đồng thời (Concurrent)**: Luồng người dùng và luồng thu gom rác thực thi đồng thời (không nhất thiết song song, có thể xen kẽ), chương trình người dùng tiếp tục chạy trong khi bộ thu gom rác chạy trên CPU khác.

### Bộ thu gom Parallel Scavenge

Bộ thu gom Parallel Scavenge cũng là bộ thu gom đa luồng sử dụng thuật toán đánh dấu-sao chép, trông gần giống với ParNew. **Vậy điểm đặc biệt của nó là gì?**

```bash
-XX:+UseParallelGC

    使用 Parallel 收集器+ 老年代串行

-XX:+UseParallelOldGC

    使用 Parallel 收集器+ 老年代并行
```

Bộ thu gom Parallel Scavenge tập trung vào thông lượng (sử dụng CPU hiệu quả cao). Các bộ thu gom CMS và tương tự tập trung nhiều hơn vào thời gian dừng của luồng người dùng (nâng cao trải nghiệm người dùng). Thông lượng là tỷ lệ giữa thời gian CPU dùng để chạy mã người dùng với tổng thời gian CPU tiêu thụ. Bộ thu gom Parallel Scavenge cung cấp nhiều tham số để người dùng tìm thời gian dừng tối ưu hoặc thông lượng tối đa. Nếu không hiểu rõ về hoạt động của bộ thu gom và khó tối ưu thủ công, việc sử dụng bộ thu gom Parallel Scavenge kết hợp chiến lược tự điều chỉnh để ủy thác việc tối ưu quản lý bộ nhớ cho máy ảo cũng là lựa chọn tốt.

**Thế hệ trẻ sử dụng thuật toán đánh dấu-sao chép, thế hệ già sử dụng thuật toán đánh dấu-nén.**

![Sơ đồ hoạt động của bộ thu gom Parallel Old](/images/github/javaguide/java/jvm/parallel-scavenge-garbage-collector.png)

**Đây là bộ thu gom mặc định của JDK1.8**

Sử dụng lệnh `java -XX:+PrintCommandLineFlags -version` để xem:

```bash
-XX:InitialHeapSize=262921408 -XX:MaxHeapSize=4206742528 -XX:+PrintCommandLineFlags -XX:+UseCompressedClassPointers -XX:+UseCompressedOops -XX:+UseParallelGC
java version "1.8.0_211"
Java(TM) SE Runtime Environment (build 1.8.0_211-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.211-b12, mixed mode)
```

JDK1.8 mặc định sử dụng Parallel Scavenge + Parallel Old. Nếu chỉ định tham số -XX:+UseParallelGC thì mặc định cũng chỉ định -XX:+UseParallelOldGC. Có thể dùng -XX:-UseParallelOldGC để vô hiệu hóa tính năng này.

### Bộ thu gom Serial Old

**Phiên bản thế hệ già của bộ thu gom Serial**, cũng là bộ thu gom đơn luồng. Nó có hai mục đích chính: một là kết hợp với bộ thu gom Parallel Scavenge trong JDK1.5 và các phiên bản trước đó, hai là dùng làm phương án dự phòng cho bộ thu gom CMS.

![Bộ thu gom Serial](/images/github/javaguide/java/jvm/serial-garbage-collector.png)

### Bộ thu gom Parallel Old

**Phiên bản thế hệ già của bộ thu gom Parallel Scavenge**. Sử dụng đa luồng và thuật toán "đánh dấu-nén". Trong các trường hợp chú trọng thông lượng và tài nguyên CPU, có thể ưu tiên xem xét bộ thu gom Parallel Scavenge và Parallel Old.

![Sơ đồ hoạt động của bộ thu gom Parallel Old](/images/github/javaguide/java/jvm/parallel-scavenge-garbage-collector.png)

### Bộ thu gom CMS

**Bộ thu gom CMS (Concurrent Mark Sweep) là một bộ thu gom nhằm mục tiêu đạt được thời gian dừng thu hồi ngắn nhất. Nó rất phù hợp để sử dụng trong các ứng dụng chú trọng trải nghiệm người dùng.**

**Bộ thu gom CMS (Concurrent Mark Sweep) là bộ thu gom đồng thời đầu tiên thực sự trong máy ảo HotSpot, lần đầu tiên triển khai cho luồng thu gom rác và luồng người dùng (về cơ bản) làm việc đồng thời.**

Từ hai từ **Mark Sweep** trong tên có thể thấy bộ thu gom CMS được triển khai bằng thuật toán **"đánh dấu-xóa"**, quá trình hoạt động của nó phức tạp hơn so với các bộ thu gom rác trước. Toàn bộ quá trình được chia thành bốn bước:

- **Đánh dấu ban đầu:** Dừng ngắn, đánh dấu các đối tượng kết nối trực tiếp với root (đối tượng gốc);
- **Đánh dấu đồng thời:** Khởi động đồng thời GC và luồng người dùng, sử dụng cấu trúc đóng để ghi lại các đối tượng có thể tiếp cận. Nhưng ở cuối giai đoạn này, cấu trúc đóng không đảm bảo bao gồm tất cả các đối tượng có thể tiếp cận hiện tại. Vì luồng người dùng có thể liên tục cập nhật miền tham chiếu, luồng GC không thể đảm bảo tính thời gian thực của phân tích khả năng tiếp cận. Vì vậy, thuật toán này sẽ theo dõi và ghi lại những nơi xảy ra cập nhật tham chiếu.
- **Đánh dấu lại:** Giai đoạn đánh dấu lại nhằm sửa lại hồ sơ đánh dấu của những đối tượng bị thay đổi trong quá trình đánh dấu đồng thời do chương trình người dùng tiếp tục chạy. Thời gian dừng của giai đoạn này thường dài hơn giai đoạn đánh dấu ban đầu nhưng ngắn hơn nhiều so với giai đoạn đánh dấu đồng thời.
- **Xóa đồng thời:** Khởi động luồng người dùng, đồng thời luồng GC bắt đầu quét sạch các vùng chưa được đánh dấu.

![Bộ thu gom CMS](/images/github/javaguide/java/jvm/cms-garbage-collector.png)

Từ tên của nó có thể thấy đây là bộ thu gom ưu tú, ưu điểm chính là: **thu gom đồng thời, dừng ít**. Nhưng nó có ba nhược điểm rõ ràng:

- **Nhạy cảm với tài nguyên CPU;**
- **Không thể xử lý rác nổi;**
- **Thuật toán thu hồi "đánh dấu-xóa" dẫn đến nhiều mảnh không gian ở cuối thu gom.**

**Bộ thu gom rác CMS đã được đánh dấu lỗi thời (deprecated) trong Java 9, và bị loại bỏ trong Java 14.**

### Bộ thu gom G1

**G1 (Garbage-First) là bộ thu gom rác hướng server, chủ yếu nhắm vào các máy được trang bị nhiều bộ xử lý và bộ nhớ lớn. Nó đáp ứng các yêu cầu về thời gian dừng GC với xác suất rất cao, đồng thời có đặc tính hiệu suất thông lượng cao.**

Được coi là tính năng tiến hóa quan trọng trong HotSpot VM của JDK1.7. Nó có các đặc điểm sau:

- **Song song và đồng thời**: G1 có thể tận dụng đầy đủ ưu thế phần cứng trong môi trường CPU đa nhân, sử dụng nhiều CPU (CPU hoặc lõi CPU) để rút ngắn thời gian dừng Stop-The-World. Một số hành động GC vốn cần dừng luồng Java được thực thi bởi các bộ thu gom khác, G1 vẫn có thể cho phép chương trình Java tiếp tục chạy theo cách đồng thời.
- **Thu gom theo thế hệ**: Mặc dù G1 có thể quản lý toàn bộ GC heap một cách độc lập mà không cần bộ thu gom khác phối hợp, vẫn giữ khái niệm thế hệ.
- **Tích hợp không gian**: Khác với thuật toán "đánh dấu-xóa" của CMS, G1 từ toàn cục được triển khai dựa trên thuật toán "đánh dấu-nén"; từ góc độ cục bộ được triển khai dựa trên thuật toán "đánh dấu-sao chép".
- **Thời gian dừng có thể dự đoán**: Đây là ưu điểm lớn khác của G1 so với CMS. Giảm thời gian dừng là mối quan tâm chung của G1 và CMS, nhưng ngoài việc theo đuổi dừng ít, G1 còn có thể xây dựng mô hình thời gian dừng có thể dự đoán, cho phép người dùng chỉ định rõ ràng rằng trong một đoạn thời gian dài M mili giây, thời gian tiêu thụ vào thu gom rác không được vượt quá N mili giây.

Hoạt động của bộ thu gom G1 được chia thành các bước sau:

- **Đánh dấu ban đầu**: Dừng ngắn (Stop-The-World, STW), đánh dấu các đối tượng có thể tham chiếu trực tiếp từ GC Roots, tức là đánh dấu tất cả đối tượng hoạt động có thể tiếp cận trực tiếp.
- **Đánh dấu đồng thời**: Chạy đồng thời với ứng dụng, đánh dấu tất cả đối tượng có thể tiếp cận. Giai đoạn này có thể kéo dài tùy thuộc vào kích thước heap và số lượng đối tượng.
- **Đánh dấu cuối cùng**: Dừng ngắn (STW), xử lý một lượng nhỏ thay đổi tham chiếu chưa xử lý còn lại sau khi giai đoạn đánh dấu đồng thời kết thúc.
- **Thu gom lọc**: Dựa trên kết quả đánh dấu, chọn vùng có giá trị thu hồi cao, sao chép đối tượng còn sống sang vùng mới, thu hồi bộ nhớ vùng cũ. Giai đoạn này bao gồm một hoặc nhiều điểm dừng (STW) tùy thuộc vào độ phức tạp của thu hồi.

![Bộ thu gom G1](/images/github/javaguide/java/jvm/g1-garbage-collector.png)

**Bộ thu gom G1 duy trì một danh sách ưu tiên ở background, mỗi lần dựa trên thời gian thu gom được phép, ưu tiên chọn vùng Region có giá trị thu hồi cao nhất để thu hồi (đây cũng là nguồn gốc của tên Garbage-First)**. Cách sử dụng Region để phân chia không gian bộ nhớ và thu hồi vùng có độ ưu tiên cao này đảm bảo bộ thu gom G1 có thể đạt được hiệu quả thu gom cao nhất có thể trong thời gian hạn chế.

**Từ JDK9 trở đi, bộ thu gom rác G1 đã trở thành bộ thu gom rác mặc định.**

### Bộ thu gom ZGC

Tương tự như ParNew và G1, ZGC cũng sử dụng thuật toán đánh dấu-sao chép, nhưng ZGC đã thực hiện cải tiến lớn cho thuật toán này.

ZGC có thể kiểm soát thời gian tạm dừng trong vài mili giây, và thời gian tạm dừng không bị ảnh hưởng bởi kích thước bộ nhớ heap, tình trạng Stop The World sẽ ít xảy ra hơn, nhưng đánh đổi là hi sinh một phần thông lượng. ZGC hỗ trợ tối đa 16TB bộ nhớ heap.

ZGC được giới thiệu trong Java 11, ở giai đoạn thử nghiệm. Qua nhiều phiên bản lặp lại, liên tục hoàn thiện và sửa lỗi, ZGC đã có thể sử dụng chính thức từ Java 15.

Tuy nhiên, bộ thu gom rác mặc định vẫn là G1. Bạn có thể kích hoạt ZGC qua tham số sau:

```bash
java -XX:+UseZGC className
```

Trong Java 21, đã giới thiệu ZGC thế hệ, thời gian tạm dừng có thể rút ngắn xuống dưới 1 mili giây.

Bạn có thể kích hoạt ZGC thế hệ qua tham số sau:

```bash
java -XX:+UseZGC -XX:+ZGenerational className
```

Để biết thêm chi tiết về bộ thu gom ZGC, hãy đọc các bài viết này:

- [Phân tích ZGC từ góc độ các thuật toán GC lịch sử - JD Technology](https://mp.weixin.qq.com/s/ExkB40cq1_Z0ooDzXn7CVw)
- [Khám phá và thực hành bộ thu gom rác thế hệ mới ZGC - Meituan Tech Team](https://tech.meituan.com/2020/08/06/new-zgc-practice-in-meituan.html)
- [Giải thích chi tiết bộ thu gom rác JVM G1 & ZGC - Alibaba Cloud Developer](https://mp.weixin.qq.com/s/Ywj3XMws0IIK-kiUllN87Q)

## Tham khảo

- "Hiểu sâu về Máy ảo Java: Các tính năng nâng cao và thực hành tốt nhất của JVM (Phiên bản thứ hai)"
- The Java® Virtual Machine Specification - Java SE 8 Edition: <https://docs.oracle.com/javase/specs/jvms/se8/html/index.html>

<!-- @include: @article-footer.snippet.md -->
