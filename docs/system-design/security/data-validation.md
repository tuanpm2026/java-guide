---
title: Tại sao cả frontend lẫn backend đều phải validation data?
description: Giải thích sự cần thiết của data validation ở cả frontend và backend, giải thích tầm quan trọng của parameter validation, permission validation và các biện pháp bảo mật ngăn bypass frontend validation.
category: System Design
tag:
  - Security
head:
  - - meta
    - name: keywords
      content: data validation,frontend validation,backend validation,parameter validation,permission validation,input validation,security protection,anti-injection
---

> Câu hỏi phỏng vấn liên quan:
>
> - Frontend đã làm validation rồi, backend có cần làm không?
> - Frontend đã làm data validation, tại sao backend vẫn cần làm lại (thậm chí nghiêm ngặt hơn)?
> - Frontend/backend cần validation những gì?

Khi phát triển Web, dù là viết frontend page hay backend interface, đều phải làm việc với data. Làm thế nào đảm bảo data qua lại đáng tin cậy và an toàn? Đó chính là **data validation**. Hơn nữa, việc này frontend phải làm, backend **càng phải làm**, còn phải thêm **permission validation** là "ổ khóa" quan trọng — thiếu một cũng không được!

Tại sao nói vậy? Frontend validation chủ yếu là để user experience và chặn một số data "điền bừa" rõ ràng. Nhưng người hiểu kỹ thuật bypass frontend validation là chuyện quá đơn giản (như dùng Postman gửi request thẳng). Nên, **backend validation mới là phòng tuyến cuối cùng và cứng nhất** bảo vệ security và data accuracy của hệ thống. Nó phải đảm bảo data vào hệ thống không chỉ đúng format mà còn tuân thủ business rules. Và quan trọng nhất, người thực hiện thao tác đó phải có **permission**!

![](/images/github/javaguide/system-design/security/user-input-validation.png)

## Frontend Validation

Frontend validation giống như người gác cổng tận tình. Mục đích chính là khi user điền data, ngay lập tức báo chỗ nào sai để sửa — tránh submit xong rồi backend nói không được phải làm lại. Lợi ích của điều này rõ ràng:

1. **Trải nghiệm tốt**: Có gợi ý khi nhập, sai biết ngay, sửa tiện, user cảm thấy mượt mà không bực bội.
2. **Giảm tải backend**: Chặn một số data lỗi format rõ ràng, thiếu required field ngay ở frontend — giảm invalid request gửi lên backend, tiết kiệm tài nguyên server và network traffic. Cần lưu ý backend vẫn phải validation — thêm frontend validation chỉ giảm nhiều invalid request.

Frontend thường validation những gì?

- **Required field check**: Cơ bản nhất — chỗ nào cần điền không được để trống.
- **Format check**: Ví dụ email phải có dạng (xxx@xx.com), số điện thoại phải là 11 chữ số, v.v. Lúc này regular expression phát huy tác dụng.
- **Repeat input check**: Đảm bảo hai lần nhập giống nhau, ví dụ field "Confirm Password" khi đăng ký.
- **Range/length check**: Tuổi không thể âm? Password dài từ 6 đến 20 ký tự? Loại này đều phải kiểm.
- **Validity/business check**: Username có bị đăng ký chưa? Sản phẩm chọn còn hàng không? Loại này tùy theo nghiệp vụ, cần phối hợp với backend.
- **File upload check**: Giới hạn loại file (như chỉ hỗ trợ `.jpg`, `.png`) và kích thước file.
- **Security check**: Phòng chống tấn công XSS (Cross-site Scripting), xử lý input của user, đừng để script viết vào chạy trên trang của mình.
- ...v.v., tùy theo yêu cầu nghiệp vụ.

Tóm lại, core của frontend validation là **hướng dẫn user nhập đúng** và **cải thiện trải nghiệm tương tác**.

## Backend Validation

Frontend validation chỉ là phòng tuyến đầu tiên. Dù cải thiện user experience nhưng vẫn có thể bị bypass. Backend validation mới thực sự đóng vai trò quyết định. Backend cần coi tất cả data từ frontend với thái độ "có thể có vấn đề" và kiểm tra toàn diện. Backend validation không chỉ phải bao phủ kiểm tra cơ bản của frontend (như format, range, length, v.v.) mà còn cần validation nghiêm ngặt và sâu hơn, đảm bảo security và data consistency của hệ thống. Dưới đây là các nội dung trọng tâm của backend validation:

1. **Completeness check**: Các field được interface document yêu cầu rõ ràng phải tồn tại, ví dụ `userId` và `orderId`. Nếu thiếu required field, backend nên trả lỗi ngay và từ chối xử lý request.
2. **Validity/existence check**: Verify xem data được truyền vào có thực sự hợp lệ không. Ví dụ `productId` truyền vào có tồn tại trong database không? `couponId` có hết hạn hay đã dùng chưa? Thường cần confirm bằng cách query database hay call service khác.
3. **Consistency check**: Với operation liên quan đến nhiều data object, verify xem chúng có phù hợp với business logic không. Ví dụ trước khi update order status, cần đảm bảo current status của order cho phép sửa đổi — không thể nhảy thẳng từ "chưa thanh toán" sang "đã hoàn thành". Consistency check là key để đảm bảo data flow đúng đắn.
4. **Security check**: Backend phải phòng chống nhiều loại tấn công độc hại bao gồm nhưng không giới hạn ở XSS, SQL injection, v.v. Tất cả external input phải được filter và validate nghiêm ngặt, ví dụ dùng parameterized query để ngăn SQL injection, hoặc escape HTML data trả về để tránh XSS.
5. ...Về cơ bản, validation nào frontend làm được, backend vì an toàn đều phải làm lại.

Trong Java backend, viết if-else mỗi lần để làm các validation cơ bản này rất mệt. May mắn thay Java community đã cung cấp standard specification **Bean Validation**. Nó cho phép dùng annotation để khai báo validation rule trực tiếp trên property của JavaBean (như DTO object), rất tiện.

- **JSR 303 (1.0)**: Đặt nền tảng, giới thiệu `@NotNull`, `@Size`, `@Min`, `@Max` và các annotation quen thuộc khác.
- **JSR 349 (1.1)**: Thêm validation cho method parameter và return value, cùng các enhancement như group validation.
- **JSR 380 (2.0)**: Đón nhận Java 8, hỗ trợ Date/Time API mới, bổ sung thêm các annotation thực dụng hơn như `@NotEmpty`, `@NotBlank`, `@Email`.

Spring Boot sớm (khoảng trước 2.3.x): `spring-boot-starter-web` đã tích hợp sẵn `hibernate-validator`, không cần thêm gì.

Spring Boot 2.3.x trở đi: Để linh hoạt hơn, dependency liên quan đến validation được tách riêng. Cần thêm thủ công dependency `spring-boot-starter-validation`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

Bean Validation specification và các implementation của nó (như Hibernate Validator) cung cấp nhiều annotation để khai báo validation rule theo dạng declarative. Dưới đây là một số annotation phổ biến:

- `@NotNull`: Kiểm tra element được annotate (bất kỳ kiểu nào) không thể là `null`.
- `@NotEmpty`: Kiểm tra element được annotate (như `CharSequence`, `Collection`, `Map`, `Array`) không thể null và size/length không thể là 0. Lưu ý: Với string, `@NotEmpty` cho phép string chứa whitespace như `" "`.
- `@NotBlank`: Kiểm tra `CharSequence` được annotate (như `String`) không thể null và length sau khi trim whitespace phải > 0 (tức không thể là blank string).
- `@Null`: Kiểm tra element được annotate phải là `null`.
- `@AssertTrue` / `@AssertFalse`: Kiểm tra element kiểu `boolean` hoặc `Boolean` được annotate phải là `true` / `false`.
- `@Min(value)` / `@Max(value)`: Kiểm tra giá trị của kiểu số (hoặc string representation) được annotate phải >= / <= `value` được chỉ định. Áp dụng cho kiểu integer (`byte`, `short`, `int`, `long`, `BigInteger`, v.v.).
- `@DecimalMin(value)` / `@DecimalMax(value)`: Chức năng tương tự `@Min` / `@Max`, nhưng áp dụng cho kiểu số có thể có decimal (`BigDecimal`, `BigInteger`, `CharSequence`, `byte`, `short`, `int`, `long` và wrapper class tương ứng). `value` phải là string representation của số.
- `@Size(min=, max=)`: Kiểm tra size/length của element được annotate (như `CharSequence`, `Collection`, `Map`, `Array`) phải nằm trong range `min` và `max` được chỉ định (bao gồm boundary).
- `@Digits(integer=, fraction=)`: Kiểm tra kiểu số (hoặc string representation) được annotate, số chữ số phần nguyên phải ≤ `integer`, số chữ số phần thập phân phải ≤ `fraction`.
- `@Pattern(regexp=, flags=)`: Kiểm tra xem `CharSequence` (như `String`) được annotate có match regex (`regexp`) được chỉ định không. `flags` có thể chỉ định matching mode (như case-insensitive).
- `@Email`: Kiểm tra xem `CharSequence` (như `String`) được annotate có đúng format Email không (tích hợp một regex tương đối lỏng lẻo).
- `@Past` / `@Future`: Kiểm tra kiểu date hay time được annotate (`java.util.Date`, `java.util.Calendar`, các kiểu trong package `java.time` của JSR 310) có trước / sau thời điểm hiện tại không.
- `@PastOrPresent` / `@FutureOrPresent`: Tương tự `@Past` / `@Future`, nhưng cho phép bằng thời điểm hiện tại.
- ……

Khi Controller method dùng annotation `@RequestBody` để nhận request body và bind vào một object, có thể thêm annotation `@Valid` trước parameter đó để trigger validation cho object đó. Nếu validation fail sẽ throw `MethodArgumentNotValidException`.

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Person {
    @NotNull(message = "classId không được để trống")
    private String classId;

    @Size(max = 33)
    @NotNull(message = "name không được để trống")
    private String name;

    @Pattern(regexp = "((^Man$|^Woman$|^UGM$))", message = "sex value không nằm trong range được chọn")
    @NotNull(message = "sex không được để trống")
    private String sex;

    @Email(message = "email format không đúng")
    @NotNull(message = "email không được để trống")
    private String email;
}


@RestController
@RequestMapping("/api")
public class PersonController {
    @PostMapping("/person")
    public ResponseEntity<Person> getPerson(@RequestBody @Valid Person person) {
        return ResponseEntity.ok().body(person);
    }
}
```

Với data kiểu đơn giản được map trực tiếp vào method parameter (như path variable `@PathVariable` hay request parameter `@RequestParam`), cách validation hơi khác:

1. **Thêm annotation `@Validated` lên class Controller**: Annotation này do Spring cung cấp (không phải chuẩn JSR), giúp Spring có thể xử lý các annotation validation cấp method parameter. **Đây là bước bắt buộc.**
2. **Đặt annotation validation trực tiếp lên method parameter**: Apply các annotation validation như `@Min`, `@Max`, `@Size`, `@Pattern`, v.v. trực tiếp lên parameter `@PathVariable` hay `@RequestParam` tương ứng.

Nhất định đừng quên thêm annotation `@Validated` lên class — parameter này báo cho Spring biết cần validate method parameter.

```java
@RestController
@RequestMapping("/api")
@Validated // Bước quan trọng 1: Phải thêm @Validated lên class
public class PersonController {

    @GetMapping("/person/{id}")
    public ResponseEntity<Integer> getPersonByID(
            @PathVariable("id")
            @Max(value = 5, message = "ID không được vượt quá 5") // Bước quan trọng 2: Annotation validation đặt thẳng lên parameter
            Integer id
    ) {
        // Nếu id được truyền vào > 5, Spring sẽ throw ConstraintViolationException trước khi vào method body.
        // Global exception handler cũng cần xử lý exception này.
        return ResponseEntity.ok().body(id);
    }

    @GetMapping("/person")
    public ResponseEntity<String> findPersonByName(
            @RequestParam("name")
            @NotBlank(message = "Tên không được để trống") // Áp dụng tương tự với @RequestParam
            @Size(max = 10, message = "Tên không được dài quá 10 ký tự")
            String name
    ) {
        return ResponseEntity.ok().body("Found person: " + name);
    }
}
```

Bean Validation chủ yếu giải quyết validation ở cấp độ **format và syntax của data**. Nhưng chỉ có điều này vẫn chưa đủ.

## Permission Validation

Data format đã được verify, không vấn đề. Nhưng, **thao tác này, user đang login hiện tại, họ có quyền làm không?** Đây là vấn đề **permission validation** cần giải quyết. Ví dụ:

- User thông thường có thể sửa order của người khác không? (Không được)
- Khách vãng lai có thể truy cập interface admin backend không? (Không được)
- Khách vãng lai có thể quản lý thông tin user khác không? (Không được)
- VIP user có thể dùng coupon độc quyền không? (Được)
- ……

Permission validation xảy ra **sau data validation**. Nó quan tâm đến "**Who (Ai)** có thể thực hiện **Action (Thao tác gì)** trên **What resource (Tài nguyên nào)**".

**Tại sao permission validation quan trọng?**

- **Nền tảng bảo mật**: Ngăn chặn truy cập và thao tác trái phép, bảo vệ data user và security hệ thống.
- **Business isolation**: Đảm bảo các role khác nhau (admin, user thông thường, VIP user, v.v.) chỉ có thể truy cập và thao tác trong phạm vi permission của họ.
- **Compliance requirement**: Nhiều quy định ngành có yêu cầu nghiêm ngặt về permission truy cập data.

Cách chính của Java backend hiện nay là dùng security framework trưởng thành để triển khai permission validation, chứ không tự viết (dễ lỗi và khó bảo trì).

1. **Spring Security (tiêu chuẩn ngành, khuyến nghị)**: Dựa trên Filter Chain để intercept request, thực hiện authentication (bạn là ai?) và authorization (bạn được làm gì?). Spring Security mạnh mẽ, community hoạt động, tích hợp liền mạch với Spring ecosystem. Tuy nhiên, cấu hình tương đối phức tạp, learning curve dốc.
2. **Apache Shiro**: Security framework phổ biến khác. Nhẹ hơn Spring Security, API trực quan dễ hiểu hơn. Cũng cung cấp authentication, authorization, session management, encryption, v.v. Là lựa chọn tốt cho project không quen với Spring hoặc thấy Spring Security quá nặng.
3. **Sa-Token**: Lightweight Java permission authentication framework trong nước. Hỗ trợ authentication authorization, SSO, kick offline, auto renewal, v.v. So với Spring Security và Shiro, Sa-Token tích hợp sẵn nhiều chức năng out-of-the-box hơn và cũng đơn giản hơn khi sử dụng.
4. **Manual check (không khuyến nghị cho tình huống phức tạp)**: Trong code Service layer hoặc Controller layer, thủ công lấy thông tin user hiện tại (ví dụ từ SecurityContextHolder hoặc Session), rồi if-else kiểm tra role hay permission của user. Permission logic coupling với business logic, code duplicate, khó bảo trì, dễ bỏ sót. Chỉ phù hợp với permission scenario rất đơn giản.

**Giới thiệu ngắn về Permission Model**:

- **RBAC (Role-Based Access Control)**: Kiểm soát truy cập dựa trên role. Gán role cho user, gán permission cho role. User có tổng hợp permission của tất cả role của mình. Đây là model phổ biến nhất.
- **ABAC (Attribute-Based Access Control)**: Kiểm soát truy cập dựa trên attribute. Quyết định dựa trên user attribute, resource attribute, operation attribute và environment attribute. Linh hoạt hơn nhưng cũng phức tạp hơn.

Thông thường, hầu hết hệ thống đều dùng RBAC permission model hoặc phiên bản đơn giản hóa của nó. Mô tả bằng hình như dưới:

![RBAC Permission Model Diagram](/images/github/javaguide/system-design/security/design-of-authority-system/rbac.png)

Chi tiết về thiết kế permission system xem bài: [Thiết kế Permission System Explained](https://javaguide.cn/system-design/security/design-of-authority-system.html).

## Tổng kết

Tóm lại, để xây dựng Web application an toàn, ổn định và user experience tốt, ba checkpoint của frontend data validation, backend data validation và backend permission validation đều phải setup tốt. Mỗi cái có trọng tâm riêng:

- **Frontend data validation**: Cải thiện user experience, giảm invalid request — phòng tuyến "thân thiện" đầu tiên.
- **Backend data validation**: Đảm bảo data format đúng và tuân thủ business rules — phòng tuyến "kỹ thuật" ngăn "dirty data" vào database. Bean Validation cho phép dùng annotation để khai báo validation rule trực tiếp trên property của JavaBean (như DTO object), rất tiện.
- **Backend permission validation**: Đảm bảo "đúng người" làm "đúng việc" — phòng tuyến "bảo mật" ngăn unauthorized operation. Các framework như Spring Security, Shiro, Sa-Token có thể giúp triển khai permission validation.

## Tài liệu tham khảo

- Tại sao cả frontend lẫn backend đều cần data validation?: <https://juejin.cn/post/7306045519099658240>
