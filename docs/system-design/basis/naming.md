---
title: Hướng dẫn đặt tên code
description: Hướng dẫn chuẩn hóa đặt tên code, bao gồm nguyên tắc và kỹ thuật đặt tên biến, phương thức, class, nâng cao tính dễ đọc và dễ bảo trì của code.
category: Code Quality
head:
  - - meta
    - name: keywords
      content: code naming,naming conventions,variable naming,function naming,class naming,readability,code quality,Code Review
---

Tôi vẫn nhớ khi mới đi làm, trong những buổi Code Review của project, tôi thường xuyên bị "chê" vì đặt tên biến không chuẩn!

Nguyên nhân chủ yếu là do bản thân lúc đó kinh nghiệm chưa đủ, và hồi học đại học khi làm project cũng không chú ý lắm những vấn đề này, nghĩ chỉ cần implement được chức năng là được.

Nhưng, đi làm thì khác, vì tính dễ đọc và dễ bảo trì của code, yêu cầu về chất lượng code của project team khá cao!

Gần đây, một intern mới vào project team cũng thường xuyên bị "chê" trong Code Review vì đặt tên biến không chuẩn, điều này khiến tôi nhớ lại những ngày mới vào công ty viết code.

Vì vậy, tôi viết bài này về chuẩn hóa đặt tên biến, hy vọng có thể giúp ích cho những bạn có cùng vấn đề này.

Đúng là trong quá trình lập trình, có quá nhiều thứ làm chúng ta đau đầu, như đặt tên, bảo trì code của người khác, viết test, giao tiếp với người khác v.v.

Nghe nói trên Quora, gần 5000 lập trình viên bình chọn điều khó nhất là "đặt tên".

Martin Fowler — tác giả nổi tiếng của cuốn 《Refactoring》 — từng đề cập trong bài [TwoHardThings](https://martinfowler.com/bliki/TwoHardThings.html) rằng CS có hai điều khó nhất: một là **cache invalidation**, một là **đặt tên chương trình**.

![](/images/java-guide-blog/marting-naming.png)

Câu này thực ra là Martin Fowler cũng trích dẫn từ người khác, có nhiều cách diễn đạt tương tự. Ví dụ trong lĩnh vực distributed system có hai điều khó nhất: một là **đảm bảo thứ tự message**, một là **exactly-once delivery**.

![](/images/java-guide-blog/20210629104844645.png)

Hôm nay chúng ta sẽ riêng nói về **đặt tên**!

Bài này đọc cùng với bài tôi đã đăng trước [《Coding 5 phút, đặt tên 2 tiếng? Tham khảo chuẩn hóa đặt tên Java đầy đủ nhất!》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247486449&idx=1&sn=c3b502529ff991c7180281bcc22877af&chksm=cea2443af9d5cd2c1c87049ed15ccf6f88275419c7dbe542406166a703b27d0f3ecf2af901f8&token=999884676&lang=zh_CN#rd) sẽ hiệu quả hơn!

## Tại sao cần chú trọng việc đặt tên?

Đầu tiên chúng ta cần hiểu tại sao lại cần chú trọng việc đặt tên trong lập trình, nó có ý nghĩa gì với công việc coding của chúng ta.

**Tại sao đặt tên lại quan trọng?** Vì **đặt tên tốt chính là comment, người khác nhìn vào tên của bạn là biết biến, phương thức hay class đó làm gì!**

Nói đơn giản là **người khác dựa vào tên của bạn là hiểu được ý nghĩa code bạn muốn diễn đạt** (tất nhiên, điều kiện là người đó cũng có kiến thức tiếng Anh cơ bản, quen thuộc với những từ thường gặp trong lập trình).

Lấy ví dụ đơn giản minh họa tầm quan trọng của đặt tên.

Cuốn 《Clean Code》 nêu rõ:

> **Code tốt tự nó là comment, chúng ta nên cố gắng chuẩn hóa và làm đẹp code để giảm thiểu comment không cần thiết.**
>
> **Nếu ngôn ngữ lập trình đủ biểu đạt, không cần comment, hãy cố gắng dùng code để giải thích.**
>
> Ví dụ:
>
> Bỏ comment phức tạp dưới đây, chỉ cần tạo một function có cùng ý nghĩa với những gì comment nói:
>
> ```java
> // check to see if the employee is eligible for full benefits
> if ((employee.flags & HOURLY_FLAG) && (employee.age > 65))
> ```
>
> Nên thay bằng:
>
> ```java
> if (employee.isEligibleForFullBenefits())
> ```

## Các quy tắc đặt tên phổ biến và phạm vi áp dụng

Ở đây chỉ giới thiệu 3 quy tắc đặt tên phổ biến nhất.

### CamelCase (Camel case)

CamelCase chắc chắn là quy tắc phổ biến nhất với chúng ta, cách đặt tên này dùng định dạng hỗn hợp chữ hoa chữ thường để phân biệt các từ, và các từ không cách nhau bằng dấu cách hay ký tự kết nối.

#### UpperCamelCase (Pascal case)

**Tên class cần dùng UpperCamelCase**

Ví dụ đúng:

```java
ServiceDiscovery、ServiceInstance、LruCacheFactory
```

Ví dụ sai:

```java
serviceDiscovery、Serviceinstance、LRUCacheFactory
```

#### lowerCamelCase

**Tên phương thức, tên parameter, member variable, local variable cần dùng lowerCamelCase.**

Ví dụ đúng:

```java
getUserInfo()
createCustomThreadPool()
setNameFormat(String nameFormat)
Uservice userService;
```

Ví dụ sai:

```java
GetUserInfo()、CreateCustomThreadPool()、setNameFormat(String NameFormat)
Uservice user_service
```

### snake_case (Underscore notation)

**Tên test method, constant, enum cần dùng snake_case**

Trong snake_case, các từ được nối bằng dấu gạch dưới "\_", ví dụ `should_get_200_status_code_when_request_is_valid`, `CLIENT_CONNECT_SERVER_FAILURE`.

Ưu điểm của snake_case là khi tên cần dùng nhiều từ. Ví dụ nếu tên trên dùng lowerCamelCase: "shouldGet200StatusCodeWhenRequestIsValid".

Cảm thấy thế nào? So với snake_case có phải khó đọc hơn không?

Ví dụ đúng:

```java
@Test
void should_get_200_status_code_when_request_is_valid() {
  ......
}
```

Ví dụ sai:

```java
@Test
void shouldGet200StatusCodeWhenRequestIsValid() {
  ......
}
```

### kebab-case (Hyphen notation)

Trong kebab-case, các từ được nối bằng dấu gạch ngang "-", ví dụ `dubbo-registry`.

Khuyến nghị tên thư mục của project dùng kebab-case, ví dụ tên các module của dubbo project như sau.

![](/images/java-guide-blog/dubbo-naming.png)

## Các quy tắc đặt tên phổ biến

### Quy tắc đặt tên cơ bản của Java

**1. Tên class cần dùng UpperCamelCase. Tên phương thức, tên parameter, member variable, local variable cần dùng lowerCamelCase.**

**2. Tên test method, constant, enum cần dùng snake_case**, ví dụ `should_get_200_status_code_when_request_is_valid`, `CLIENT_CONNECT_SERVER_FAILURE`. Và **tên test method yêu cầu toàn bộ chữ thường, constant và enum cần toàn bộ chữ hoa.**

**3. Tên thư mục của project dùng kebab-case, ví dụ `dubbo-registry`.**

**4. Package name thống nhất dùng chữ thường, cố gắng dùng một danh từ duy nhất làm package name, các từ nối bằng dấu ".", và mỗi từ phải là số ít.**

Ví dụ đúng: `org.apache.dubbo.common.threadlocal`

Ví dụ sai: ~~`org.apache_dubbo.Common.threadLocals`~~

**5. Tên abstract class bắt đầu bằng Abstract**.

```java
// Abstract class trừu tượng hóa phần remote transport (nguồn: Dubbo source code)
public abstract class AbstractClient extends AbstractEndpoint implements Client {

}
```

**6. Tên exception class kết thúc bằng Exception.**

```java
// Custom NoSuchMethodException (nguồn: Dubbo source code)
public class NoSuchMethodException extends RuntimeException {
    private static final long serialVersionUID = -2725364246023268766L;

    public NoSuchMethodException() {
        super();
    }

    public NoSuchMethodException(String msg) {
        super(msg);
    }
}
```

**7. Tên test class bắt đầu bằng tên class cần test, kết thúc bằng Test.**

```java
// Test class được viết cho class AnnotationUtils (nguồn: Dubbo source code)
public class AnnotationUtilsTest {
  ......
}
```

Biến kiểu boolean trong POJO class đừng thêm tiền tố `is`, nếu không một số framework khi parse sẽ gây lỗi serialization.

Nếu module, interface, class, phương thức sử dụng design pattern, cần phản ánh pattern cụ thể trong tên.

### Quy tắc đặt tên dễ đọc

**1. Để đặt tên dễ hiểu và dễ đọc hơn, hãy tránh viết tắt/rút gọn từ, trừ khi những từ đó đã được thừa nhận rộng rãi. Ví dụ `CustomThreadFactory` không thể viết thành ~~`CustomTF`~~.**

**2. Đặt tên không giống function là phải ngắn gọn, tên dễ đọc ưu tiên hơn tên ngắn, mặc dù tên dễ đọc sẽ dài hơn.** Điều này tương ứng với điểm 1 ở trên.

**3. Tránh đặt tên vô nghĩa, mỗi tên bạn đặt ra phải có nghĩa rõ ràng.**

Ví dụ đúng: `UserService userService;` `int userCount`;

Ví dụ sai: ~~`UserService service`~~ ~~`int count`~~

**4. Tránh tên quá dài (tốt nhất trong 50 ký tự), tên quá dài khó đọc và xấu.**

**5. Không dùng tiếng địa phương phiên âm, càng không được dùng tiếng bản địa không phải tiếng Anh.** Tuy nhiên các từ thông dụng quốc tế như alibaba, wuhan, taobao có thể coi như tiếng Anh.

Ví dụ đúng: discount

Ví dụ sai: ~~dazhe~~

## Codelf: Công cụ đặt tên biến thần kỳ?

Đây là một website do người Việt phát triển, nhiều người trên mạng gọi đây là công cụ đặt tên biến thần kỳ. Sau khi dùng thử vài ngày tôi thấy không tuyệt vời như vậy. Các bạn có thể tự trải nghiệm rồi đưa ra nhận xét của mình.

Codelf cung cấp phiên bản website online, địa chỉ: [https://unbug.github.io/codelf/](https://unbug.github.io/codelf/), cách dùng cụ thể như sau:

Tôi chọn ngôn ngữ lập trình Java, rồi tìm kiếm từ khóa "serialization", nó trả về rất nhiều tên liên quan đến serialization.

![](./pictures/Codelf.png)

Ngoài ra, Codelf còn cung cấp plugin VS Code, xem đánh giá này, mọi người có vẻ khá thích công cụ đặt tên này.

![](./pictures/vscode-codelf.png)

## Đọc thêm

1. 《Alibaba Java Development Handbook》
2. 《Clean Code》
3. Google Java Style Guide: <https://google.github.io/styleguide/javaguide.html>
4. Tạm biệt coding 5 phút, đặt tên 2 tiếng! Tham khảo chuẩn hóa đặt tên Java đầy đủ nhất: <https://www.cnblogs.com/liqiangchn/p/12000361.html>

## Tổng kết

Là một lập trình viên đủ tiêu chuẩn, các bạn đều biết tầm quan trọng của việc code thể hiện rõ ý nghĩa. Muốn viết code chất lượng cao, đặt tên tốt là bước đầu tiên!

Đặt tên tốt có ý nghĩa rất lớn trong việc giúp người khác (bao gồm cả bạn) hiểu code của bạn! Code của bạn càng dễ hiểu thì khả năng bảo trì càng cao, đồng thời cũng cho thấy thiết kế code của bạn càng tốt!

Trong quá trình coding hàng ngày, chúng ta cần ghi nhớ các quy tắc đặt tên phổ biến như tên class dùng UpperCamelCase, không dùng tiếng địa phương phiên âm, càng không dùng tiếng không phải tiếng Anh...

Ngoài ra, một website tên Codelf do người Việt phát triển được nhiều người gọi là "công cụ đặt tên biến thần kỳ", khi bạn đau đầu vì đặt tên, có thể tham khảo một số ví dụ đặt tên được cung cấp ở đó.

Cuối cùng, chúc mọi người không còn phải đau đầu vì đặt tên nữa!

<!-- @include: @article-footer.snippet.md -->
