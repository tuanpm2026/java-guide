---
title: Tổng hợp câu hỏi phỏng vấn về Java Collection (Phần 1)
description: Tổng hợp câu hỏi phỏng vấn về framework collection Java：Phân tích chuyên sâu các giao diện Collection/List/Set/Queue, so sánh ArrayList/LinkedList/HashMap và các lớp collection thường dùng, nắm vững cấu trúc dữ liệu nền tảng và kịch bản sử dụng của collection.
category: Java
tag:
  - Java Collection
head:
  - - meta
    - name: keywords
      content: Java集合,Collection,List,Set,Queue,ArrayList,LinkedList,HashMap,集合框架,Java面试题
---

<!-- @include: @small-advertisement.snippet.md -->

<!-- markdownlint-disable MD024 -->

## Tổng quan về Collection

### Tổng quan về Java Collection

Java Collection, còn gọi là container, chủ yếu được dẫn xuất từ hai giao diện lớn: một là giao diện `Collection`, chủ yếu dùng để lưu trữ các phần tử đơn; một là giao diện `Map`, chủ yếu dùng để lưu trữ cặp key-value. Đối với giao diện `Collection`, bên dưới còn có ba giao diện con chính: `List`, `Set`, `Queue`.

Framework Java Collection được thể hiện trong hình dưới đây:

![Tổng quan framework Java Collection](https://oss.javaguide.cn/github/javaguide/java/collection/java-collection-hierarchy.png)

Lưu ý: Hình chỉ liệt kê các quan hệ kế thừa chính, không liệt kê tất cả quan hệ. Ví dụ đã bỏ qua các lớp trừu tượng như `AbstractList`, `NavigableSet` và một số lớp hỗ trợ khác. Nếu muốn tìm hiểu sâu hơn, có thể tự xem mã nguồn.

### ⭐️Nói về sự khác biệt giữa List, Set, Queue, Map?

- `List` (trợ thủ đắc lực cho thứ tự): Các phần tử lưu trữ có thứ tự và có thể trùng lặp.
- `Set` (chú trọng tính duy nhất): Các phần tử lưu trữ không được trùng lặp.
- `Queue` (máy xếp hàng thực hiện chức năng hàng đợi): Xác định thứ tự trước sau theo quy tắc xếp hàng cụ thể, các phần tử lưu trữ có thứ tự và có thể trùng lặp.
- `Map` (chuyên gia tìm kiếm bằng key): Lưu trữ theo cặp key-value, tương tự hàm toán học y=f(x), "x" đại diện cho key, "y" đại diện cho value. Key không có thứ tự và không trùng lặp, value không có thứ tự và có thể trùng lặp, mỗi key ánh xạ đến tối đa một value.

### Tóm tắt cấu trúc dữ liệu nền tảng của framework collection

Hãy xem các collection dưới giao diện `Collection` trước.

#### List

- `ArrayList`: Mảng `Object[]`. Xem chi tiết: [Phân tích mã nguồn ArrayList](./arraylist-source-code.md).
- `Vector`: Mảng `Object[]`.
- `LinkedList`: Danh sách liên kết đôi (trước JDK1.6 là danh sách liên kết vòng, JDK1.7 đã bỏ vòng). Xem chi tiết: [Phân tích mã nguồn LinkedList](./linkedlist-source-code.md).

#### Set

- `HashSet` (không có thứ tự, duy nhất): Được cài đặt dựa trên `HashMap`, bên dưới dùng `HashMap` để lưu phần tử.
- `LinkedHashSet`: `LinkedHashSet` là lớp con của `HashSet`, và bên trong được cài đặt thông qua `LinkedHashMap`.
- `TreeSet` (có thứ tự, duy nhất): Cây đỏ đen (cây nhị phân tìm kiếm tự cân bằng).

#### Queue

- `PriorityQueue`: Mảng `Object[]` cài đặt heap nhỏ. Xem chi tiết: [Phân tích mã nguồn PriorityQueue](./priorityqueue-source-code.md).
- `DelayQueue`: `PriorityQueue`. Xem chi tiết: [Phân tích mã nguồn DelayQueue](./delayqueue-source-code.md).
- `ArrayDeque`: Mảng đôi hai chiều có thể mở rộng động.

Tiếp tục xem các collection dưới giao diện `Map`.

#### Map

- `HashMap`: Trước JDK1.8, `HashMap` được tạo thành từ mảng+danh sách liên kết, mảng là thân chính của `HashMap`, danh sách liên kết chủ yếu tồn tại để giải quyết xung đột hash ("phương pháp chaining" giải quyết xung đột). Từ JDK1.8 trở đi, khi giải quyết xung đột hash có sự thay đổi lớn hơn: khi độ dài danh sách liên kết lớn hơn ngưỡng (mặc định là 8) (trước khi chuyển danh sách liên kết thành cây đỏ đen sẽ kiểm tra, nếu độ dài mảng hiện tại nhỏ hơn 64, thì sẽ chọn mở rộng mảng trước thay vì chuyển thành cây đỏ đen), danh sách liên kết sẽ được chuyển thành cây đỏ đen để giảm thời gian tìm kiếm. Xem chi tiết: [Phân tích mã nguồn HashMap](./hashmap-source-code.md).
- `LinkedHashMap`: `LinkedHashMap` kế thừa từ `HashMap`, nên cấu trúc bên dưới vẫn dựa trên cấu trúc hash chaining gồm mảng và danh sách liên kết hoặc cây đỏ đen. Ngoài ra, `LinkedHashMap` trên cơ sở cấu trúc trên, thêm một danh sách liên kết đôi, giúp cấu trúc trên có thể duy trì thứ tự chèn cặp key-value. Đồng thời thông qua các thao tác tương ứng trên danh sách liên kết, thực hiện logic liên quan đến thứ tự truy cập. Xem chi tiết: [Phân tích mã nguồn LinkedHashMap](./linkedhashmap-source-code.md)
- `Hashtable`: Được tạo thành từ mảng+danh sách liên kết, mảng là thân chính của `Hashtable`, danh sách liên kết chủ yếu tồn tại để giải quyết xung đột hash.
- `TreeMap`: Cây đỏ đen (cây nhị phân tìm kiếm tự cân bằng).

### Cách chọn collection?

Chúng ta chủ yếu dựa trên đặc điểm của collection để chọn collection phù hợp. Ví dụ:

- Khi cần lấy giá trị phần tử theo key, chọn collection dưới giao diện `Map`. Khi cần sắp xếp thì chọn `TreeMap`, không cần sắp xếp thì chọn `HashMap`, cần đảm bảo an toàn luồng thì chọn `ConcurrentHashMap`.
- Khi chỉ cần lưu giá trị phần tử, chọn collection cài đặt giao diện `Collection`. Khi cần đảm bảo phần tử duy nhất thì chọn collection cài đặt giao diện `Set` như `TreeSet` hoặc `HashSet`. Không cần thì chọn cài đặt giao diện `List` như `ArrayList` hoặc `LinkedList`, rồi tiếp tục chọn dựa trên đặc điểm của các collection cài đặt giao diện này.

### Tại sao cần dùng collection?

Khi cần lưu một nhóm dữ liệu cùng loại, mảng là một trong những container cơ bản và thường dùng nhất. Nhưng việc dùng mảng để lưu đối tượng có một số hạn chế, vì trong phát triển thực tế, kiểu dữ liệu lưu trữ đa dạng và số lượng không xác định. Lúc này, Java Collection phát huy tác dụng. So với mảng, Java Collection cung cấp các phương pháp linh hoạt và hiệu quả hơn để lưu trữ nhiều đối tượng dữ liệu. Các lớp và giao diện collection trong framework Java Collection có thể lưu trữ các loại và số lượng đối tượng khác nhau, đồng thời còn có nhiều cách thao tác đa dạng. So với mảng, ưu điểm của Java Collection là kích thước có thể thay đổi, hỗ trợ generic, có thuật toán tích hợp, v.v. Nói chung, Java Collection nâng cao tính linh hoạt trong lưu trữ và xử lý dữ liệu, có thể thích ứng tốt hơn với nhu cầu dữ liệu đa dạng trong phát triển phần mềm hiện đại, và hỗ trợ viết code chất lượng cao.

## List

### ⭐️Sự khác biệt giữa ArrayList và Array (mảng)?

`ArrayList` được cài đặt nội bộ dựa trên mảng động, linh hoạt hơn khi sử dụng so với `Array` (mảng tĩnh):

- `ArrayList` sẽ tự động mở rộng hoặc thu hẹp dựa trên số phần tử thực tế được lưu, còn `Array` sau khi tạo thì không thể thay đổi độ dài.
- `ArrayList` cho phép dùng generic để đảm bảo an toàn kiểu, `Array` thì không.
- `ArrayList` chỉ có thể lưu đối tượng. Đối với dữ liệu kiểu cơ bản, cần dùng lớp wrapper tương ứng (như Integer, Double, v.v.). `Array` có thể lưu trực tiếp dữ liệu kiểu cơ bản, cũng có thể lưu đối tượng.
- `ArrayList` hỗ trợ các thao tác thường dùng như chèn, xóa, duyệt, và cung cấp nhiều phương thức API như `add()`, `remove()`, v.v. `Array` chỉ là mảng có độ dài cố định, chỉ có thể truy cập phần tử theo chỉ số, không có khả năng thêm/xóa phần tử động.
- `ArrayList` không cần chỉ định kích thước khi tạo, còn `Array` phải chỉ định kích thước khi tạo.

Dưới đây là so sánh sử dụng đơn giản giữa hai cái:

`Array`:

```java
 // 初始化一个 String 类型的数组
 String[] stringArr = new String[]{"hello", "world", "!"};
 // 修改数组元素的值
 stringArr[0] = "goodbye";
 System.out.println(Arrays.toString(stringArr));// [goodbye, world, !]
 // 删除数组中的元素，需要手动移动后面的元素
 for (int i = 0; i < stringArr.length - 1; i++) {
     stringArr[i] = stringArr[i + 1];
 }
 stringArr[stringArr.length - 1] = null;
 System.out.println(Arrays.toString(stringArr));// [world, !, null]
```

`ArrayList`:

```java
// 初始化一个 String 类型的 ArrayList
 ArrayList<String> stringList = new ArrayList<>(Arrays.asList("hello", "world", "!"));
// 添加元素到 ArrayList 中
 stringList.add("goodbye");
 System.out.println(stringList);// [hello, world, !, goodbye]
 // 修改 ArrayList 中的元素
 stringList.set(0, "hi");
 System.out.println(stringList);// [hi, world, !, goodbye]
 // 删除 ArrayList 中的元素
 stringList.remove(0);
 System.out.println(stringList); // [world, !, goodbye]
```

### Sự khác biệt giữa ArrayList và Vector? (Chỉ cần biết)

- `ArrayList` là lớp cài đặt chính của `List`, bên dưới dùng mảng `Object[]`, phù hợp cho công việc tìm kiếm thường xuyên, không an toàn luồng.
- `Vector` là lớp cài đặt cũ của `List`, bên dưới dùng mảng `Object[]`, an toàn luồng.

### Sự khác biệt giữa Vector và Stack? (Chỉ cần biết)

- Cả `Vector` và `Stack` đều an toàn luồng, đều dùng từ khóa `synchronized` để xử lý đồng bộ.
- `Stack` kế thừa từ `Vector`, là một ngăn xếp vào sau ra trước (LIFO), còn `Vector` là một danh sách.

Cùng với sự phát triển của lập trình đồng thời Java, `Vector` và `Stack` đã bị loại bỏ, khuyến nghị dùng các lớp collection đồng thời (ví dụ `ConcurrentHashMap`, `CopyOnWriteArrayList`, v.v.) hoặc tự cài đặt phương thức an toàn luồng để cung cấp hỗ trợ thao tác đa luồng an toàn.

### ArrayList có thể thêm giá trị null không?

`ArrayList` có thể lưu bất kỳ loại đối tượng nào, bao gồm cả giá trị `null`. Tuy nhiên, không khuyến nghị thêm giá trị `null` vào `ArrayList`, giá trị `null` vô nghĩa, sẽ làm code khó bảo trì vì quên kiểm tra null có thể dẫn đến NullPointerException.

Ví dụ mã:

```java
ArrayList<String> listOfStrings = new ArrayList<>();
listOfStrings.add(null);
listOfStrings.add("java");
System.out.println(listOfStrings);
```

Kết quả:

```plain
[null, java]
```

### ⭐️Độ phức tạp thời gian chèn và xóa phần tử của ArrayList?

Đối với chèn:

- Chèn đầu: Do cần dịch chuyển tất cả phần tử lần lượt một vị trí về sau, độ phức tạp thời gian là O(n).
- Chèn cuối: Khi dung lượng của `ArrayList` chưa đạt giới hạn, chèn phần tử vào cuối danh sách có độ phức tạp thời gian là O(1), vì chỉ cần thêm một phần tử vào cuối mảng; khi dung lượng đã đạt giới hạn và cần mở rộng, thì cần thực hiện thao tác O(n) để sao chép mảng cũ sang mảng mới lớn hơn, rồi thực hiện thao tác O(1) để thêm phần tử.
- Chèn vị trí chỉ định: Cần dịch chuyển tất cả phần tử sau vị trí mục tiêu một vị trí về sau, rồi đặt phần tử mới vào vị trí chỉ định. Quá trình này cần dịch chuyển trung bình n/2 phần tử, nên độ phức tạp thời gian là O(n).

Đối với xóa:

- Xóa đầu: Do cần dịch chuyển tất cả phần tử lần lượt một vị trí về trước, độ phức tạp thời gian là O(n).
- Xóa cuối: Khi phần tử bị xóa nằm ở cuối danh sách, độ phức tạp thời gian là O(1).
- Xóa vị trí chỉ định: Cần dịch chuyển tất cả phần tử sau phần tử mục tiêu một vị trí về trước để lấp đầy vị trí trống, nên cần dịch chuyển trung bình n/2 phần tử, độ phức tạp thời gian là O(n).

Dưới đây là ví dụ đơn giản:

```java
// ArrayList的底层数组大小为10，此时存储了7个元素
+---+---+---+---+---+---+---+---+---+---+
| 1 | 2 | 3 | 4 | 5 | 6 | 7 |   |   |   |
+---+---+---+---+---+---+---+---+---+---+
  0   1   2   3   4   5   6   7   8   9
// 在索引为1的位置插入一个元素8，该元素后面的所有元素都要向右移动一位
+---+---+---+---+---+---+---+---+---+---+
| 1 | 8 | 2 | 3 | 4 | 5 | 6 | 7 |   |   |
+---+---+---+---+---+---+---+---+---+---+
  0   1   2   3   4   5   6   7   8   9
// 删除索引为1的位置的元素，该元素后面的所有元素都要向左移动一位
+---+---+---+---+---+---+---+---+---+---+
| 1 | 2 | 3 | 4 | 5 | 6 | 7 |   |   |   |
+---+---+---+---+---+---+---+---+---+---+
  0   1   2   3   4   5   6   7   8   9
```

### ⭐️Độ phức tạp thời gian chèn và xóa phần tử của LinkedList?

- Chèn/xóa đầu: Chỉ cần sửa con trỏ của nút đầu là hoàn thành thao tác chèn/xóa, nên độ phức tạp thời gian là O(1).
- Chèn/xóa cuối: Chỉ cần sửa con trỏ của nút cuối là hoàn thành thao tác chèn/xóa, nên độ phức tạp thời gian là O(1).
- Chèn/xóa vị trí chỉ định: Cần di chuyển đến vị trí chỉ định trước, rồi sửa con trỏ của nút chỉ định để hoàn thành chèn/xóa. Tuy nhiên do có con trỏ đầu và đuôi, có thể xuất phát từ con trỏ gần hơn, nên cần duyệt trung bình n/4 phần tử, độ phức tạp thời gian là O(n).

Ví dụ đơn giản: Giả sử chúng ta muốn xóa nút 9, cần duyệt danh sách liên kết để tìm nút đó. Sau đó thực hiện thay đổi con trỏ của nút tương ứng. Mã nguồn cụ thể có thể tham khảo: [Phân tích mã nguồn LinkedList](https://javaguide.cn/java/collection/linkedlist-source-code.html).

![Logic phương thức unlink](https://oss.javaguide.cn/github/javaguide/java/collection/linkedlist-unlink.jpg)

### Tại sao LinkedList không thể cài đặt giao diện RandomAccess?

`RandomAccess` là một giao diện đánh dấu, dùng để chỉ ra rằng lớp cài đặt giao diện này hỗ trợ truy cập ngẫu nhiên (tức là có thể truy cập phần tử nhanh chóng qua chỉ số). Vì cấu trúc dữ liệu bên dưới của `LinkedList` là danh sách liên kết, địa chỉ bộ nhớ không liên tục, chỉ có thể định vị qua con trỏ, không hỗ trợ truy cập ngẫu nhiên nhanh, nên không thể cài đặt giao diện `RandomAccess`.

### ⭐️Sự khác biệt giữa ArrayList và LinkedList?

- **Có đảm bảo an toàn luồng không:** Cả `ArrayList` và `LinkedList` đều không đồng bộ, tức là không đảm bảo an toàn luồng;
- **Cấu trúc dữ liệu nền tảng:** `ArrayList` bên dưới dùng **mảng `Object`**; `LinkedList` bên dưới dùng cấu trúc dữ liệu **danh sách liên kết đôi** (trước JDK1.6 là danh sách liên kết vòng, JDK1.7 đã bỏ vòng. Chú ý sự khác biệt giữa danh sách liên kết đôi và danh sách liên kết đôi vòng, sẽ được giới thiệu ở dưới!)
- **Việc chèn và xóa có bị ảnh hưởng bởi vị trí phần tử không:**
  - `ArrayList` dùng mảng để lưu, nên độ phức tạp thời gian chèn và xóa phần tử bị ảnh hưởng bởi vị trí phần tử. Ví dụ: khi thực hiện phương thức `add(E e)`, `ArrayList` mặc định thêm phần tử được chỉ định vào cuối danh sách này, độ phức tạp thời gian lúc này là O(1). Nhưng nếu muốn chèn và xóa phần tử tại vị trí i cụ thể (`add(int index, E element)`), độ phức tạp thời gian là O(n). Vì khi thực hiện thao tác trên, phần tử thứ i và (n-i) phần tử sau phần tử thứ i trong collection đều phải thực hiện dịch chuyển một vị trí về sau/trước.
  - `LinkedList` dùng danh sách liên kết để lưu, nên việc chèn hoặc xóa phần tử ở đầu và đuôi không bị ảnh hưởng bởi vị trí phần tử (`add(E e)`, `addFirst(E e)`, `addLast(E e)`, `removeFirst()`, `removeLast()`), độ phức tạp thời gian là O(1). Nếu muốn chèn và xóa phần tử tại vị trí `i` cụ thể (`add(int index, E element)`, `remove(Object o)`, `remove(int index)`), độ phức tạp thời gian là O(n), vì cần di chuyển đến vị trí chỉ định trước rồi mới chèn và xóa.
- **Có hỗ trợ truy cập ngẫu nhiên nhanh không:** `LinkedList` không hỗ trợ truy cập phần tử ngẫu nhiên hiệu quả, còn `ArrayList` (đã cài đặt giao diện `RandomAccess`) hỗ trợ. Truy cập ngẫu nhiên nhanh là lấy nhanh đối tượng phần tử thông qua số thứ tự của phần tử (tương ứng với phương thức `get(int index)`).
- **Chiếm dụng bộ nhớ:** Lãng phí bộ nhớ của `ArrayList` chủ yếu thể hiện ở việc dự trữ một lượng không gian dung lượng nhất định ở cuối danh sách list, trong khi chi phí bộ nhớ của LinkedList thể hiện ở chỗ mỗi phần tử đều cần tiêu tốn nhiều không gian hơn ArrayList (vì cần lưu trữ con trỏ kế tiếp trực tiếp, con trỏ tiền nhiệm trực tiếp và dữ liệu).

Trong dự án chúng ta thường không sử dụng `LinkedList`. Các kịch bản cần dùng `LinkedList` hầu như đều có thể thay thế bằng `ArrayList`, và hiệu suất thường tốt hơn! Ngay cả tác giả của `LinkedList` là Joshua Bloch cũng tự nói rằng chưa bao giờ dùng `LinkedList`.

![](https://oss.javaguide.cn/github/javaguide/redisimage-20220412110853807.png)

Ngoài ra, đừng vô thức nghĩ rằng `LinkedList` là danh sách liên kết nên phù hợp nhất cho kịch bản thêm/xóa phần tử. Như đã nói ở trên, `LinkedList` chỉ có độ phức tạp thời gian gần O(1) khi chèn hoặc xóa phần tử ở đầu và đuôi, các trường hợp thêm/xóa phần tử khác có độ phức tạp thời gian trung bình là O(n).

#### Nội dung bổ sung: Danh sách liên kết đôi và danh sách liên kết đôi vòng

**Danh sách liên kết đôi:** Chứa hai con trỏ, một prev trỏ đến nút trước, một next trỏ đến nút sau.

![Danh sách liên kết đôi](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/bidirectional-linkedlist.png)

**Danh sách liên kết đôi vòng:** Nút cuối cùng có next trỏ đến head, còn prev của head trỏ đến nút cuối cùng, tạo thành một vòng.

![Danh sách liên kết đôi vòng](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/bidirectional-circular-linkedlist.png)

#### Nội dung bổ sung: Giao diện RandomAccess

```java
public interface RandomAccess {
}
```

Xem mã nguồn thì thấy thực ra giao diện `RandomAccess` không định nghĩa gì cả. Vì vậy, theo tôi giao diện `RandomAccess` chỉ là một nhãn hiệu. Đánh dấu điều gì? Đánh dấu rằng lớp cài đặt giao diện này có chức năng truy cập ngẫu nhiên.

Trong phương thức `binarySearch()`, nó cần kiểm tra xem list truyền vào có phải là instance của `RandomAccess` không. Nếu là, gọi phương thức `indexedBinarySearch()`, nếu không thì gọi phương thức `iteratorBinarySearch()`.

```java
    public static <T>
    int binarySearch(List<? extends Comparable<? super T>> list, T key) {
        if (list instanceof RandomAccess || list.size()<BINARYSEARCH_THRESHOLD)
            return Collections.indexedBinarySearch(list, key);
        else
            return Collections.iteratorBinarySearch(list, key);
    }
```

`ArrayList` đã cài đặt giao diện `RandomAccess`, còn `LinkedList` thì không. Tại sao? Tôi nghĩ vẫn liên quan đến cấu trúc dữ liệu nền tảng! `ArrayList` bên dưới là mảng, còn `LinkedList` bên dưới là danh sách liên kết. Mảng tự nhiên hỗ trợ truy cập ngẫu nhiên, độ phức tạp thời gian là O(1), nên gọi là truy cập ngẫu nhiên nhanh. Danh sách liên kết cần duyệt đến vị trí cụ thể mới truy cập được phần tử tại vị trí đó, độ phức tạp thời gian là O(n), nên không hỗ trợ truy cập ngẫu nhiên nhanh. `ArrayList` cài đặt giao diện `RandomAccess`, biểu thị nó có chức năng truy cập ngẫu nhiên nhanh. Giao diện `RandomAccess` chỉ là nhãn hiệu, không phải là vì `ArrayList` cài đặt giao diện `RandomAccess` mới có chức năng truy cập ngẫu nhiên nhanh!

### ⭐️Nói về cơ chế mở rộng của ArrayList

Xem bài viết chi tiết tại đây: [Phân tích cơ chế mở rộng ArrayList](https://javaguide.cn/java/collection/arraylist-source-code.html#arraylist-扩容机制分析).

### ⭐️fail-fast và fail-safe trong collection là gì?

`fail-fast` (thất bại nhanh) và `fail-safe` (thất bại an toàn) là hai triết lý thiết kế và chiến lược chịu lỗi hoàn toàn khác nhau trong framework collection Java khi xử lý vấn đề sửa đổi đồng thời.

Về `fail-fast`, trích dẫn một bài viết trên `medium` về `fail-fast` và `fail-safe`:

> Fail-fast systems are designed to immediately stop functioning upon encountering an unexpected condition. This immediate failure helps to catch errors early, making debugging more straightforward.

Tư tưởng thất bại nhanh là đối với ngoại lệ có thể xảy ra, tuyên bố lỗi trước và dừng hoạt động, thông qua việc phát hiện và dừng lỗi sớm, giảm rủi ro lỗi hệ thống lan rộng.

Hầu hết các collection trong gói `java.util` (như `ArrayList`, `HashMap`) không hỗ trợ an toàn luồng. Để sớm phát hiện rủi ro an toàn luồng do thao tác đồng thời gây ra, người ta đề xuất dùng `modCount` để ghi lại số lần sửa đổi. Trong quá trình lặp, so sánh số lần sửa đổi kỳ vọng `expectedModCount` và `modCount` có nhất quán không để xác định có thao tác đồng thời không, từ đó thực hiện thất bại nhanh, đảm bảo tránh thực hiện code phức tạp không cần thiết khi có ngoại lệ.

**Ví dụ ArrayList (fail-fast):**

```java
     // 使用线程不安全的 ArrayList，它是一种 fail-fast 集合
      List<Integer> list = new ArrayList<>();
      CountDownLatch latch = new CountDownLatch(2);

      for (int i = 0; i < 5; i++) {
          list.add(i);
      }
      System.out.println("Initial list: " + list);

      Thread t1 = new Thread(() -> {
          try {
              for (Integer i : list) {
                  System.out.println("Iterator Thread (t1) sees: " + i);
                  Thread.sleep(100);
              }
          } catch (ConcurrentModificationException e) {
              System.err.println("!!! Iterator Thread (t1) caught ConcurrentModificationException as expected.");
          } catch (InterruptedException e) {
              e.printStackTrace();
          } finally {
              latch.countDown();
          }
      });

      Thread t2 = new Thread(() -> {
          try {
              Thread.sleep(50);
              System.out.println("-> Modifier Thread (t2) is removing element 1...");
              list.remove(Integer.valueOf(1));
              System.out.println("-> Modifier Thread (t2) finished removal.");
          } catch (InterruptedException e) {
              e.printStackTrace();
          } finally {
              latch.countDown();
          }
      });

      t1.start();
      t2.start();
      latch.await();

      System.out.println("Final list state: " + list);
```

Kết quả:

```
Initial list: [0, 1, 2, 3, 4]
Iterator Thread (t1) sees: 0
-> Modifier Thread (t2) is removing element 1...
-> Modifier Thread (t2) finished removal.
!!! Iterator Thread (t1) caught ConcurrentModificationException as expected.
Final list state: [0, 2, 3, 4]
```

Sau khi luồng t2 sửa đổi danh sách, thao tác lặp tiếp theo của luồng t1 ngay lập tức ném ra `ConcurrentModificationException`. Đó là vì iterator của ArrayList mỗi lần gọi `next()` đều kiểm tra xem `modCount` có bị thay đổi không. Một khi phát hiện collection đã bị sửa đổi mà iterator không biết, nó sẽ ngay lập tức "thất bại nhanh" để ngăn tiếp tục thao tác trên dữ liệu không nhất quán dẫn đến hậu quả không thể đoán trước.

Chúng ta cũng đưa ra phương thức `next` khi iterator vòng lặp `for` lấy phần tử tiếp theo ở bên dưới. Có thể thấy `checkForComodification` bên trong có logic so sánh số lần sửa đổi:

```java
 public E next() {
 			//检查是否存在并发修改
            checkForComodification();
            //......
            //返回下一个元素
            return (E) elementData[lastRet = i];
        }

final void checkForComodification() {
		//当前循环遍历次数和预期修改次数不一致时，就会抛出ConcurrentModificationException
            if (modCount != expectedModCount)
                throw new ConcurrentModificationException();
        }

```

Còn `fail-safe` tức là thất bại an toàn, nó hướng tới việc phục hồi và tiếp tục chạy ngay cả khi gặp tình huống bất ngờ, điều này làm cho nó đặc biệt phù hợp với các môi trường không chắc chắn hoặc không ổn định:

> Fail-safe systems take a different approach, aiming to recover and continue even in the face of unexpected conditions. This makes them particularly suited for uncertain or volatile environments.

Tư tưởng này thường được áp dụng trong container đồng thời. Cài đặt kinh điển nhất là `CopyOnWriteArrayList`. Thông qua tư tưởng ghi khi sao chép (Copy-On-Write), đảm bảo khi thực hiện thao tác sửa đổi thì sao chép ra một bản snapshot, sau khi hoàn thành thao tác thêm hoặc xóa dựa trên snapshot này, trỏ tham chiếu mảng bên dưới của `CopyOnWriteArrayList` đến không gian mảng mới này. Từ đó tránh bị ảnh hưởng bởi sửa đổi đồng thời khi lặp dẫn đến vấn đề an toàn thao tác đồng thời. Tất nhiên cách làm này cũng có nhược điểm, tức là không thể lấy kết quả thời gian thực khi duyệt:

![](https://oss.javaguide.cn/github/javaguide/java/collection/fail-fast-and-fail-safe-copyonwritearraylist.png)

Chúng ta cũng đưa ra code cốt lõi của `CopyOnWriteArrayList` cài đặt `fail-safe`. Có thể thấy cài đặt của nó là dùng `getArray` lấy tham chiếu mảng rồi dùng `Arrays.copyOf` để lấy một snapshot của mảng, sau khi hoàn thành thao tác thêm dựa trên snapshot này, sửa địa chỉ tham chiếu mà biến `array` bên dưới trỏ đến, từ đó hoàn thành ghi khi sao chép:

```java
public boolean add(E e) {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
        	//获取原有数组
            Object[] elements = getArray();
            int len = elements.length;
            //基于原有数组复制出一份内存快照
            Object[] newElements = Arrays.copyOf(elements, len + 1);
            //进行添加操作
            newElements[len] = e;
            //array指向新的数组
            setArray(newElements);
            return true;
        } finally {
            lock.unlock();
        }
    }
```

## Set

### Sự khác biệt giữa Comparable và Comparator

Cả giao diện `Comparable` và `Comparator` đều là giao diện dùng để sắp xếp trong Java. Chúng đóng vai trò quan trọng trong việc so sánh kích thước, sắp xếp giữa các đối tượng lớp cài đặt:

- Giao diện `Comparable` thực ra xuất phát từ gói `java.lang`, có phương thức `compareTo(Object obj)` để sắp xếp
- Giao diện `Comparator` thực ra xuất phát từ gói `java.util`, có phương thức `compare(Object obj1, Object obj2)` để sắp xếp

Thông thường khi cần sắp xếp tùy chỉnh cho một collection, chúng ta phải ghi đè phương thức `compareTo()` hoặc `compare()`. Khi cần cài đặt hai cách sắp xếp cho một collection, ví dụ đối tượng `song` dùng một phương thức sắp xếp cho tên bài hát và một cho tên ca sĩ, chúng ta có thể ghi đè phương thức `compareTo()` và dùng `Comparator` tự tạo, hoặc dùng hai `Comparator` để cài đặt sắp xếp theo tên bài hát và sắp xếp theo tên ca sĩ. Cách thứ hai nghĩa là chỉ có thể dùng phiên bản hai tham số của `Collections.sort()`.

#### Sắp xếp tùy chỉnh với Comparator

```java
ArrayList<Integer> arrayList = new ArrayList<Integer>();
arrayList.add(-1);
arrayList.add(3);
arrayList.add(3);
arrayList.add(-5);
arrayList.add(7);
arrayList.add(4);
arrayList.add(-9);
arrayList.add(-7);
System.out.println("原始数组:");
System.out.println(arrayList);
// void reverse(List list)：反转
Collections.reverse(arrayList);
System.out.println("Collections.reverse(arrayList):");
System.out.println(arrayList);

// void sort(List list),按自然排序的升序排序
Collections.sort(arrayList);
System.out.println("Collections.sort(arrayList):");
System.out.println(arrayList);
// 定制排序的用法
Collections.sort(arrayList, new Comparator<Integer>() {
    @Override
    public int compare(Integer o1, Integer o2) {
        return o2.compareTo(o1);
    }
});
System.out.println("定制排序后：");
System.out.println(arrayList);
```

Output:

```plain
原始数组:
[-1, 3, 3, -5, 7, 4, -9, -7]
Collections.reverse(arrayList):
[-7, -9, 4, 7, -5, 3, 3, -1]
Collections.sort(arrayList):
[-9, -7, -5, -1, 3, 3, 4, 7]
定制排序后：
[7, 4, 3, 3, -1, -5, -7, -9]
```

#### Ghi đè phương thức compareTo để sắp xếp theo tuổi

```java
// person对象没有实现Comparable接口，所以必须实现，这样才不会出错，才可以使treemap中的数据按顺序排列
// 前面一个例子的String类已经默认实现了Comparable接口，详细可以查看String类的API文档，另外其他
// 像Integer类等都已经实现了Comparable接口，所以不需要另外实现了
public  class Person implements Comparable<Person> {
    private String name;
    private int age;

    public Person(String name, int age) {
        super();
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    /**
     * T重写compareTo方法实现按年龄来排序
     */
    @Override
    public int compareTo(Person o) {
        if (this.age > o.getAge()) {
            return 1;
        }
        if (this.age < o.getAge()) {
            return -1;
        }
        return 0;
    }
}

```

```java
    public static void main(String[] args) {
        TreeMap<Person, String> pdata = new TreeMap<Person, String>();
        pdata.put(new Person("张三", 30), "zhangsan");
        pdata.put(new Person("李四", 20), "lisi");
        pdata.put(new Person("王五", 10), "wangwu");
        pdata.put(new Person("小红", 5), "xiaohong");
        // 得到key的值的同时得到key所对应的值
        Set<Person> keys = pdata.keySet();
        for (Person key : keys) {
            System.out.println(key.getAge() + "-" + key.getName());

        }
    }
```

Output:

```plain
5-小红
10-王五
20-李四
30-张三
```

### Ý nghĩa của tính không có thứ tự và không thể trùng lặp là gì?

- Không có thứ tự không đồng nghĩa với ngẫu nhiên. Không có thứ tự nghĩa là dữ liệu được lưu trong mảng bên dưới không được thêm theo thứ tự chỉ số mảng, mà được quyết định theo giá trị hash của dữ liệu.
- Không thể trùng lặp nghĩa là phần tử được thêm khi kiểm tra bằng `equals()` trả về false. Cần đồng thời ghi đè phương thức `equals()` và phương thức `hashCode()`.

### So sánh điểm giống và khác nhau giữa HashSet, LinkedHashSet và TreeSet

- `HashSet`, `LinkedHashSet` và `TreeSet` đều là lớp cài đặt giao diện `Set`, đều có thể đảm bảo phần tử duy nhất và đều không an toàn luồng.
- Sự khác biệt chính giữa `HashSet`, `LinkedHashSet` và `TreeSet` nằm ở cấu trúc dữ liệu nền tảng khác nhau. Cấu trúc dữ liệu nền tảng của `HashSet` là bảng hash (cài đặt dựa trên `HashMap`). Cấu trúc dữ liệu nền tảng của `LinkedHashSet` là danh sách liên kết và bảng hash, thứ tự chèn và lấy phần tử thỏa mãn FIFO. Cấu trúc dữ liệu nền tảng của `TreeSet` là cây đỏ đen, phần tử có thứ tự, cách sắp xếp gồm sắp xếp tự nhiên và sắp xếp tùy chỉnh.
- Cấu trúc dữ liệu nền tảng khác nhau dẫn đến kịch bản ứng dụng của ba cái này khác nhau. `HashSet` dùng cho kịch bản không cần đảm bảo thứ tự chèn và lấy phần tử. `LinkedHashSet` dùng để đảm bảo thứ tự chèn và lấy phần tử thỏa mãn FIFO. `TreeSet` dùng cho kịch bản hỗ trợ quy tắc sắp xếp tùy chỉnh cho phần tử.

## Queue

### Sự khác biệt giữa Queue và Deque

`Queue` là hàng đợi một đầu, chỉ có thể chèn phần tử từ một đầu và xóa phần tử ở đầu kia. Cài đặt thường tuân theo quy tắc **FIFO (First In First Out)**.

`Queue` mở rộng giao diện `Collection`. Dựa trên **cách xử lý khác nhau sau khi thao tác thất bại do vấn đề dung lượng**, có thể chia thành hai loại phương thức: một loại ném ngoại lệ sau khi thao tác thất bại, loại kia trả về giá trị đặc biệt.

| Giao diện `Queue`         | Ném ngoại lệ | Trả về giá trị đặc biệt |
| ------------------------- | ------------ | ----------------------- |
| Chèn cuối hàng            | add(E e)     | offer(E e)              |
| Xóa đầu hàng              | remove()     | poll()                  |
| Truy vấn phần tử đầu hàng | element()    | peek()                  |

`Deque` là hàng đợi hai đầu, có thể chèn hoặc xóa phần tử ở cả hai đầu hàng đợi.

`Deque` mở rộng giao diện `Queue`, thêm phương thức chèn và xóa ở đầu và đuôi hàng đợi. Cũng phân chia thành hai loại theo cách xử lý khác nhau sau khi thất bại:

| Giao diện `Deque`          | Ném ngoại lệ  | Trả về giá trị đặc biệt |
| -------------------------- | ------------- | ----------------------- |
| Chèn đầu hàng              | addFirst(E e) | offerFirst(E e)         |
| Chèn cuối hàng             | addLast(E e)  | offerLast(E e)          |
| Xóa đầu hàng               | removeFirst() | pollFirst()             |
| Xóa cuối hàng              | removeLast()  | pollLast()              |
| Truy vấn phần tử đầu hàng  | getFirst()    | peekFirst()             |
| Truy vấn phần tử cuối hàng | getLast()     | peekLast()              |

Thực tế, `Deque` còn cung cấp các phương thức khác như `push()` và `pop()`, có thể dùng để mô phỏng ngăn xếp.

### Sự khác biệt giữa ArrayDeque và LinkedList

Cả `ArrayDeque` và `LinkedList` đều cài đặt giao diện `Deque`, cả hai đều có chức năng hàng đợi. Nhưng chúng có gì khác nhau?

- `ArrayDeque` được cài đặt dựa trên mảng độ dài thay đổi và hai con trỏ, còn `LinkedList` được cài đặt thông qua danh sách liên kết.

- `ArrayDeque` không hỗ trợ lưu dữ liệu `NULL`, nhưng `LinkedList` hỗ trợ.

- `ArrayDeque` mới được giới thiệu trong JDK1.6, còn `LinkedList` đã tồn tại từ JDK1.2.

- `ArrayDeque` khi chèn có thể có quá trình mở rộng, nhưng sau khi tính trung bình, thao tác chèn vẫn là O(1). Mặc dù `LinkedList` không cần mở rộng, nhưng mỗi lần chèn dữ liệu đều cần cấp phát không gian heap mới, hiệu suất trung bình chậm hơn.

Về góc độ hiệu suất, dùng `ArrayDeque` để cài đặt hàng đợi tốt hơn so với `LinkedList`. Ngoài ra, `ArrayDeque` cũng có thể dùng để cài đặt ngăn xếp.

### Nói về PriorityQueue

`PriorityQueue` được giới thiệu trong JDK1.5. Sự khác biệt của nó so với `Queue` là thứ tự phần tử ra hàng liên quan đến độ ưu tiên, tức là phần tử có độ ưu tiên cao nhất luôn ra hàng trước.

Một số điểm quan trọng liên quan:

- `PriorityQueue` được cài đặt bằng cấu trúc dữ liệu heap nhị phân, bên dưới dùng mảng độ dài thay đổi để lưu dữ liệu
- `PriorityQueue` thông qua thao tác nổi lên và chìm xuống của phần tử heap, thực hiện chèn phần tử và xóa phần tử đỉnh heap với độ phức tạp thời gian O(logn).
- `PriorityQueue` không an toàn luồng và không hỗ trợ lưu đối tượng `NULL` và `non-comparable`.
- `PriorityQueue` mặc định là heap nhỏ, nhưng có thể nhận `Comparator` làm tham số khởi tạo để tùy chỉnh thứ tự ưu tiên của phần tử.

`PriorityQueue` trong phỏng vấn thường xuất hiện nhiều hơn khi giải thuật toán. Các ví dụ điển hình bao gồm sắp xếp heap, tìm số lớn thứ K, duyệt đồ thị có trọng số, v.v. Vì vậy cần sử dụng thành thạo.

### BlockingQueue là gì?

`BlockingQueue` (hàng đợi chặn) là một giao diện kế thừa từ `Queue`. `BlockingQueue` chặn vì nó hỗ trợ chặn liên tục khi hàng đợi không có phần tử cho đến khi có phần tử; còn hỗ trợ nếu hàng đợi đã đầy, đợi liên tục đến khi hàng đợi có thể chứa phần tử mới thì mới đưa vào.

```java
public interface BlockingQueue<E> extends Queue<E> {
  // ...
}
```

`BlockingQueue` thường được dùng trong mô hình producer-consumer. Luồng producer sẽ thêm dữ liệu vào hàng đợi, còn luồng consumer sẽ lấy dữ liệu từ hàng đợi để xử lý.

![BlockingQueue](https://oss.javaguide.cn/github/javaguide/java/collection/blocking-queue.png)

### Có những lớp cài đặt nào của BlockingQueue?

![Các lớp cài đặt của BlockingQueue](https://oss.javaguide.cn/github/javaguide/java/collection/blocking-queue-hierarchy.png)

Các lớp cài đặt hàng đợi chặn thường dùng trong Java có mấy loại sau:

1. `ArrayBlockingQueue`: Hàng đợi chặn có giới hạn cài đặt bằng mảng. Khi tạo cần chỉ định kích thước dung lượng, và hỗ trợ cả hai cơ chế khóa công bằng và không công bằng.
2. `LinkedBlockingQueue`: Hàng đợi chặn có giới hạn tùy chọn cài đặt bằng danh sách liên kết đơn. Khi tạo có thể chỉ định kích thước dung lượng, nếu không chỉ định thì mặc định là `Integer.MAX_VALUE`. Khác với `ArrayBlockingQueue`, nó chỉ hỗ trợ cơ chế khóa không công bằng.
3. `PriorityBlockingQueue`: Hàng đợi chặn không giới hạn hỗ trợ sắp xếp theo độ ưu tiên. Phần tử phải cài đặt giao diện `Comparable` hoặc truyền đối tượng `Comparator` trong hàm khởi tạo, và không thể chèn phần tử null.
4. `SynchronousQueue`: Hàng đợi đồng bộ, là loại hàng đợi chặn không lưu phần tử. Mỗi thao tác chèn phải chờ thao tác xóa tương ứng, ngược lại thao tác xóa cũng phải chờ thao tác chèn. Do đó, `SynchronousQueue` thường được dùng để truyền dữ liệu trực tiếp giữa các luồng.
5. `DelayQueue`: Hàng đợi trì hoãn, trong đó các phần tử chỉ có thể ra hàng khi đã đến thời gian trì hoãn được chỉ định.
6. ……

Trong phát triển hàng ngày, các hàng đợi này thực ra ít được dùng, chỉ cần biết là đủ.

### ⭐️Sự khác biệt giữa ArrayBlockingQueue và LinkedBlockingQueue?

`ArrayBlockingQueue` và `LinkedBlockingQueue` là hai loại cài đặt hàng đợi chặn thường dùng trong gói đồng thời Java, cả hai đều an toàn luồng. Tuy nhiên chúng có những sự khác biệt sau:

- Cài đặt bên dưới: `ArrayBlockingQueue` dựa trên mảng, còn `LinkedBlockingQueue` dựa trên danh sách liên kết.
- Có giới hạn không: `ArrayBlockingQueue` là hàng đợi có giới hạn, phải chỉ định kích thước dung lượng khi tạo. `LinkedBlockingQueue` khi tạo có thể không chỉ định kích thước dung lượng, mặc định là `Integer.MAX_VALUE`, tức là không giới hạn. Nhưng cũng có thể chỉ định kích thước hàng đợi để trở thành có giới hạn.
- Khóa có tách biệt không: Trong `ArrayBlockingQueue` khóa không tách biệt, tức là sản xuất và tiêu thụ dùng cùng một khóa; trong `LinkedBlockingQueue` khóa được tách biệt, tức là sản xuất dùng `putLock`, tiêu thụ dùng `takeLock`, điều này có thể ngăn tranh chấp khóa giữa luồng sản xuất và tiêu thụ.
- Chiếm dụng bộ nhớ: `ArrayBlockingQueue` cần cấp phát bộ nhớ mảng trước, còn `LinkedBlockingQueue` cấp phát bộ nhớ nút danh sách liên kết động. Điều này có nghĩa là `ArrayBlockingQueue` khi tạo sẽ chiếm một lượng không gian bộ nhớ nhất định, và thường cấp phát bộ nhớ nhiều hơn thực tế dùng, còn `LinkedBlockingQueue` chiếm dụng bộ nhớ dần dần theo sự tăng của phần tử.

<!-- @include: @article-footer.snippet.md -->
