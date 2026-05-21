---
title: Tổng quan tính năng mới Java 21 (Quan trọng)
description: Tổng quan các tính năng mới quan trọng và tác động thực tiễn của JDK 21, tập trung giới thiệu String Templates, Sequenced Collections, Generational ZGC, Virtual Threads và nhiều hơn nữa.
category: Java
tag:
  - Java Tính năng mới
head:
  - - meta
    - name: keywords
      content: Java 21,JDK21,LTS,字符串模板,Sequenced Collections,分代 ZGC,记录模式,switch 模式匹配,虚拟线程,外部函数与内存 API
---

JDK 21 được phát hành vào ngày 19 tháng 9 năm 2023, đây là một phiên bản rất quan trọng, mang tính cột mốc.

JDK 21 là phiên bản LTS (Long-Term Support - Hỗ trợ dài hạn), tính đến thời điểm này, có bốn phiên bản hỗ trợ dài hạn là JDK8, JDK11, JDK17 và JDK21.

JDK 21 có tổng cộng 15 tính năng mới, bài viết này sẽ chọn lọc và giới thiệu chi tiết một số tính năng quan trọng:

- [JEP 430: String Templates（Mẫu chuỗi）](https://openjdk.org/jeps/430)（xem trước）
- [JEP 431: Sequenced Collections（Tập hợp có thứ tự）](https://openjdk.org/jeps/431)
- [JEP 439: Generational ZGC（ZGC phân thế hệ）](https://openjdk.org/jeps/439)
- [JEP 440: Record Patterns（Mẫu bản ghi）](https://openjdk.org/jeps/440)
- [JEP 441: Pattern Matching for switch（Khớp mẫu cho switch）](https://openjdk.org/jeps/441)
- [JEP 442: Foreign Function & Memory API（API hàm ngoài và bộ nhớ）](https://openjdk.org/jeps/442)（lần xem trước thứ ba）
- [JEP 443: Unnamed Patterns and Variables（Mẫu và biến không tên）](https://openjdk.org/jeps/443)（xem trước）
- [JEP 444: Virtual Threads（Luồng ảo）](https://openjdk.org/jeps/444)
- [JEP 445: Unnamed Classes and Instance Main Methods（Lớp không tên và phương thức main thực thể）](https://openjdk.org/jeps/445)（xem trước）

Hình dưới đây thể hiện số lượng tính năng mới và thời điểm cập nhật của mỗi phiên bản từ JDK 8 đến JDK 24:

![](/images/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 430: String Templates（Mẫu chuỗi, xem trước）

String Templates (Mẫu chuỗi) hiện vẫn là một tính năng xem trước trong JDK 21.

String Templates cung cấp một cách ngắn gọn và trực quan hơn để xây dựng chuỗi động. Bằng cách sử dụng placeholder `${}`, chúng ta có thể nhúng trực tiếp giá trị của biến vào chuỗi mà không cần xử lý thủ công. Lúc runtime, trình biên dịch Java sẽ thay thế các placeholder này bằng giá trị biến thực tế. Hơn nữa, biểu thức hỗ trợ các đặc tính như biến cục bộ, trường tĩnh/không tĩnh, thậm chí cả phương thức và kết quả tính toán.

Thực ra, String Templates (Mẫu chuỗi) đã tồn tại trong hầu hết các ngôn ngữ lập trình:

```typescript
"Greetings {{ name }}!";  //Angular
`Greetings ${ name }!`;    //Typescript
$"Greetings { name }!"    //Visual basic
f"Greetings { name }!"    //Python
```

Trước khi Java có String Templates, chúng ta thường dùng nối chuỗi hoặc phương thức định dạng để xây dựng chuỗi:

```java
//concatenation
message = "Greetings " + name + "!";

//String.format()
message = String.format("Greetings %s!", name);  //concatenation

//MessageFormat
message = new MessageFormat("Greetings {0}!").format(name);

//StringBuilder
message = new StringBuilder().append("Greetings ").append(name).append("!").toString();
```

Các phương thức này ít nhiều đều có nhược điểm, ví dụ như khó đọc, dài dòng, phức tạp.

Java dùng String Templates để nối chuỗi, có thể nhúng trực tiếp biểu thức vào chuỗi mà không cần xử lý thêm:

```java
String message = STR."Greetings \{name}!";
```

Trong biểu thức template ở trên:

- STR là template processor (bộ xử lý mẫu).
- `\{name}` là biểu thức, lúc runtime, các biểu thức này sẽ được thay thế bằng giá trị biến tương ứng.

Java hiện hỗ trợ ba loại template processor:

- STR: Tự động thực hiện string interpolation, tức là thay thế mỗi biểu thức nhúng trong mẫu bằng giá trị của nó (chuyển đổi thành chuỗi).
- FMT: Tương tự STR, nhưng còn có thể nhận format specifier, các format specifier này xuất hiện bên trái biểu thức nhúng để kiểm soát kiểu đầu ra.
- RAW: Không tự động xử lý string template như STR và FMT, mà trả về một đối tượng `StringTemplate` chứa thông tin về văn bản và biểu thức trong mẫu.

```java
String name = "Lokesh";

//STR
String message = STR."Greetings \{name}.";

//FMT
String message = FMT."Greetings %-12s\{name}.";

//RAW
StringTemplate st = RAW."Greetings \{name}.";
String message = STR.process(st);
```

Ngoài ba template processor tích hợp sẵn của JDK, bạn còn có thể triển khai interface `StringTemplate.Processor` để tạo template processor của riêng mình, chỉ cần kế thừa interface `StringTemplate.Processor` rồi triển khai phương thức `process`.

Chúng ta có thể dùng biến cục bộ, trường tĩnh/không tĩnh và thậm chí phương thức làm biểu thức nhúng:

```java
//variable
message = STR."Greetings \{name}!";

//method
message = STR."Greetings \{getName()}!";

//field
message = STR."Greetings \{this.name}!";
```

Cũng có thể thực hiện tính toán trong biểu thức và in kết quả:

```java
int x = 10, y = 20;
String s = STR."\{x} + \{y} = \{x + y}";  //"10 + 20 = 30"
```

Để cải thiện khả năng đọc, chúng ta có thể chia biểu thức nhúng thành nhiều dòng:

```java
String time = STR."The current time is \{
    //sample comment - current time in HH:mm:ss
    DateTimeFormatter
      .ofPattern("HH:mm:ss")
      .format(LocalTime.now())
  }.";
```

## JEP 431: Sequenced Collections（Tập hợp có thứ tự）

JDK 21 giới thiệu một kiểu tập hợp mới: **Sequenced Collections (Tập hợp có thứ tự, còn gọi là tập hợp theo thứ tự)**, đây là loại tập hợp có thứ tự gặp (encounter order) xác định (dù chúng ta duyệt qua tập hợp bao nhiêu lần, thứ tự xuất hiện của các phần tử luôn cố định). Sequenced Collections cung cấp các phương thức đơn giản để xử lý phần tử đầu tiên và cuối cùng của tập hợp, cũng như chế độ xem đảo ngược (thứ tự ngược lại so với tập hợp gốc).

Sequenced Collections bao gồm ba interface sau:

- [`SequencedCollection`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedCollection.html)
- [`SequencedSet`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedSet.html)
- [`SequencedMap`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/SequencedMap.html)

Interface `SequencedCollection` kế thừa interface `Collection`, cung cấp các phương thức truy cập, thêm hoặc xóa phần tử ở hai đầu tập hợp và lấy chế độ xem đảo ngược của tập hợp.

```java
interface SequencedCollection<E> extends Collection<E> {

  // New Method

  SequencedCollection<E> reversed();

  // Promoted methods from Deque<E>

  void addFirst(E);
  void addLast(E);

  E getFirst();
  E getLast();

  E removeFirst();
  E removeLast();
}
```

Các interface `List` và `Deque` triển khai interface `SequencedCollection`.

Lấy `ArrayList` làm ví dụ minh họa cách sử dụng thực tế:

```java
ArrayList<Integer> arrayList = new ArrayList<>();

arrayList.add(1);   // List contains: [1]

arrayList.addFirst(0);  // List contains: [0, 1]
arrayList.addLast(2);   // List contains: [0, 1, 2]

Integer firstElement = arrayList.getFirst();  // 0
Integer lastElement = arrayList.getLast();  // 2

List<Integer> reversed = arrayList.reversed();
System.out.println(reversed); // Prints [2, 1, 0]
```

Interface `SequencedSet` kế thừa trực tiếp interface `SequencedCollection` và ghi đè phương thức `reversed()`.

```java
interface SequencedSet<E> extends SequencedCollection<E>, Set<E> {

    SequencedSet<E> reversed();
}
```

`SortedSet` và `LinkedHashSet` triển khai interface `SequencedSet`.

Lấy `LinkedHashSet` làm ví dụ minh họa cách sử dụng thực tế:

```java
LinkedHashSet<Integer> linkedHashSet = new LinkedHashSet<>(List.of(1, 2, 3));

Integer firstElement = linkedHashSet.getFirst();   // 1
Integer lastElement = linkedHashSet.getLast();    // 3

linkedHashSet.addFirst(0);  //List contains: [0, 1, 2, 3]
linkedHashSet.addLast(4);   //List contains: [0, 1, 2, 3, 4]

System.out.println(linkedHashSet.reversed());   //Prints [4, 3, 2, 1, 0]
```

Interface `SequencedMap` kế thừa interface `Map`, cung cấp các phương thức truy cập, thêm hoặc xóa cặp key-value ở hai đầu tập hợp, lấy `SequencedSet` chứa key, `SequencedCollection` chứa value, `SequencedSet` chứa entry (cặp key-value), cũng như lấy chế độ xem đảo ngược của tập hợp.

```java
interface SequencedMap<K,V> extends Map<K,V> {

  // New Methods

  SequencedMap<K,V> reversed();

  SequencedSet<K> sequencedKeySet();
  SequencedCollection<V> sequencedValues();
  SequencedSet<Entry<K,V>> sequencedEntrySet();

  V putFirst(K, V);
  V putLast(K, V);


  // Promoted Methods from NavigableMap<K, V>

  Entry<K, V> firstEntry();
  Entry<K, V> lastEntry();

  Entry<K, V> pollFirstEntry();
  Entry<K, V> pollLastEntry();
}
```

`SortedMap` và `LinkedHashMap` triển khai interface `SequencedMap`.

Lấy `LinkedHashMap` làm ví dụ minh họa cách sử dụng thực tế:

```java
LinkedHashMap<Integer, String> map = new LinkedHashMap<>();

map.put(1, "One");
map.put(2, "Two");
map.put(3, "Three");

map.firstEntry();   //1=One
map.lastEntry();    //3=Three

System.out.println(map);  //{1=One, 2=Two, 3=Three}

Map.Entry<Integer, String> first = map.pollFirstEntry();   //1=One
Map.Entry<Integer, String> last = map.pollLastEntry();    //3=Three

System.out.println(map);  //{2=Two}

map.putFirst(1, "One");     //{1=One, 2=Two}
map.putLast(3, "Three");    //{1=One, 2=Two, 3=Three}

System.out.println(map);  //{1=One, 2=Two, 3=Three}
System.out.println(map.reversed());   //{3=Three, 2=Two, 1=One}
```

## JEP 439: Generational ZGC（ZGC phân thế hệ）

JDK21 mở rộng chức năng ZGC, bổ sung tính năng GC phân thế hệ. Tuy nhiên, mặc định tính năng này bị tắt, cần bật qua cấu hình:

```bash
// 启用分代ZGC
java -XX:+UseZGC -XX:+ZGenerational ...
```

Trong các phiên bản tương lai, nhà phát triển sẽ đặt ZGenerational làm giá trị mặc định, tức là mặc định bật GC phân thế hệ của ZGC. Trong các phiên bản muộn hơn nữa, ZGC không phân thế hệ sẽ bị loại bỏ.

> In a future release we intend to make Generational ZGC the default, at which point -XX:-ZGenerational will select non-generational ZGC. In an even later release we intend to remove non-generational ZGC, at which point the ZGenerational option will become obsolete.
>
> Trong các phiên bản tương lai, chúng tôi có kế hoạch đặt Generational ZGC làm tùy chọn mặc định, khi đó -XX:-ZGenerational sẽ chọn ZGC không phân thế hệ. Trong các phiên bản muộn hơn nữa, chúng tôi có kế hoạch loại bỏ ZGC không phân thế hệ, khi đó tùy chọn ZGenerational sẽ trở nên lỗi thời.

Generational ZGC có thể giảm đáng kể thời gian dừng (stop-the-world pause) trong quá trình thu gom rác, đồng thời cải thiện khả năng phản hồi của ứng dụng. Điều này rất có giá trị cho việc tối ưu hóa hiệu suất của các ứng dụng Java lớn và các tình huống high concurrency.

## JEP 440: Record Patterns（Mẫu bản ghi）

Mẫu bản ghi được xem trước lần đầu trong Java 19, được đề xuất bởi [JEP 405](https://openjdk.org/jeps/405). JDK 20 là lần xem trước thứ hai, được đề xuất bởi [JEP 432](https://openjdk.org/jeps/432). Cuối cùng, mẫu bản ghi được chính thức hóa trong JDK21.

[Tổng quan tính năng mới Java 20](./java20.md) đã giới thiệu chi tiết về mẫu bản ghi, không nhắc lại ở đây.

## JEP 441: Pattern Matching for switch（Khớp mẫu cho switch）

Cải thiện biểu thức và câu lệnh `switch` trong Java, cho phép sử dụng mẫu trong nhãn `case`. Khi mẫu khớp, code tương ứng với nhãn `case` sẽ được thực thi.

Trong đoạn code sau, biểu thức `switch` sử dụng mẫu kiểu để khớp.

```java
static String formatterPatternSwitch(Object obj) {
    return switch (obj) {
        case Integer i -> String.format("int %d", i);
        case Long l    -> String.format("long %d", l);
        case Double d  -> String.format("double %f", d);
        case String s  -> String.format("String %s", s);
        default        -> obj.toString();
    };
}
```

## JEP 442: Foreign Function & Memory API（API hàm ngoài và bộ nhớ, lần xem trước thứ ba）

Chương trình Java có thể tương tác với code và dữ liệu bên ngoài Java runtime thông qua API này. Bằng cách gọi hiệu quả các hàm ngoài (tức là code bên ngoài JVM) và truy cập an toàn bộ nhớ ngoài (tức là bộ nhớ không được JVM quản lý), API này cho phép chương trình Java gọi các thư viện native và xử lý dữ liệu native mà không nguy hiểm và dễ vỡ như JNI.

Foreign Function & Memory API được ấp ủ lần đầu trong Java 17, được đề xuất bởi [JEP 412](https://openjdk.java.net/jeps/412). Ấp ủ lần hai trong Java 18, được đề xuất bởi [JEP 419](https://openjdk.org/jeps/419). Xem trước lần đầu trong Java 19, được đề xuất bởi [JEP 424](https://openjdk.org/jeps/424). JDK 20 là lần xem trước thứ hai, được đề xuất bởi [JEP 434](https://openjdk.org/jeps/434). JDK 21 là lần xem trước thứ ba, được đề xuất bởi [JEP 442](https://openjdk.org/jeps/442).

Trong [Tổng quan tính năng mới Java 19](./java19.md), tôi đã giới thiệu chi tiết về Foreign Function & Memory API, nên không nhắc lại ở đây.

## JEP 443: Unnamed Patterns and Variables（Mẫu và biến không tên, xem trước）

Mẫu và biến không tên cho phép chúng ta dùng dấu gạch dưới `_` để đại diện cho các biến không tên và các thành phần không dùng đến trong khớp mẫu, nhằm cải thiện khả năng đọc và bảo trì code.

Kịch bản điển hình của biến không tên là câu lệnh `try-with-resources`, biến ngoại lệ trong mệnh đề `catch` và vòng lặp `for`. Khi biến không cần sử dụng, có thể thay thế bằng dấu gạch dưới `_`, giúp nhận biết rõ ràng các biến không được dùng đến.

```java
try (var _ = ScopedContext.acquire()) {
  // No use of acquired resource
}
try { ... }
catch (Exception _) { ... }
catch (Throwable _) { ... }

for (int i = 0, _ = runOnce(); i < arr.length; i++) {
  ...
}
```

Mẫu không tên là mẫu vô điều kiện và không ràng buộc bất kỳ giá trị nào. Biến mẫu không tên xuất hiện trong mẫu kiểu.

```java
if (r instanceof ColoredPoint(_, Color c)) { ... c ... }

switch (b) {
    case Box(RedBall _), Box(BlueBall _) -> processBox(b);
    case Box(GreenBall _)                -> stopProcessing();
    case Box(_)                          -> pickAnotherBox();
}
```

## JEP 444: Virtual Threads（Luồng ảo）

Virtual Thread là một bản cập nhật trọng lượng nặng, nhất định phải chú ý!

Virtual Thread được xem trước lần đầu trong Java 19, được đề xuất bởi [JEP 425](https://openjdk.org/jeps/425). JDK 20 là lần xem trước thứ hai. Cuối cùng, virtual thread được chính thức hóa trong JDK21.

[Tổng quan tính năng mới Java 20](./java20.md) đã giới thiệu chi tiết về virtual thread, không nhắc lại ở đây.

## JEP 445: Unnamed Classes and Instance Main Methods（Lớp không tên và phương thức main thực thể, xem trước）

Tính năng này chủ yếu đơn giản hóa khai báo phương thức `main`. Đối với người mới học Java, khai báo phương thức `main` này đưa vào quá nhiều khái niệm cú pháp Java, không thuận tiện cho người mới làm quen nhanh.

Định nghĩa phương thức `main` trước khi dùng tính năng này:

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Định nghĩa phương thức `main` sau khi dùng tính năng mới:

```java
class HelloWorld {
    void main() {
        System.out.println("Hello, World!");
    }
}
```

Rút gọn thêm (lớp không tên cho phép không cần định nghĩa tên lớp):

```java
void main() {
   System.out.println("Hello, World!");
}
```

## Tham khảo

- Java 21 String Templates：<https://howtodoinjava.com/java/java-string-templates/>
- Java 21 Sequenced Collections：<https://howtodoinjava.com/java/sequenced-collections/>
