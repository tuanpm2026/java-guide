---
title: Tổng hợp giải pháp Ẩn danh dữ liệu
description: Giải thích chi tiết các giải pháp ẩn danh dữ liệu, bao gồm quy tắc ẩn danh cho số điện thoại, CMND, thẻ ngân hàng và các dữ liệu nhạy cảm khác, cùng phương pháp triển khai bằng công cụ Hutool.
category: Thiết kế hệ thống
tag:
  - Bảo mật
head:
  - - meta
    - name: keywords
      content: 数据脱敏,隐私保护,手机号脱敏,身份证脱敏,掩码规则,敏感数据,测试数据,合规
---

<!-- @include: @article-header.snippet.md -->

> Bài viết này được dịch và bổ sung từ [Hutool: Một dòng code để ẩn danh dữ liệu - Nhà phát triển JD Cloud](https://mp.weixin.qq.com/s/1qFWczesU50ndPPLtABHFg).

## Ẩn danh dữ liệu là gì

### Định nghĩa ẩn danh dữ liệu

Baidu Baike định nghĩa ẩn danh dữ liệu như sau:

> Ẩn danh dữ liệu là việc biến đổi dữ liệu thông qua các quy tắc ẩn danh đối với một số thông tin nhạy cảm nhất định, để bảo vệ an toàn dữ liệu riêng tư nhạy cảm. Như vậy có thể sử dụng an toàn dataset thực đã được ẩn danh trong các môi trường phát triển, kiểm thử và các môi trường phi sản xuất khác cũng như môi trường outsource. Trong trường hợp liên quan đến dữ liệu bảo mật của khách hàng hoặc một số dữ liệu nhạy cảm thương mại, trong điều kiện không vi phạm quy tắc hệ thống, dữ liệu thực được cải biến để sử dụng cho mục đích kiểm thử, như CMND, số điện thoại, số thẻ, số khách hàng và các thông tin cá nhân khác đều cần ẩn danh dữ liệu. Đây là một trong những kỹ thuật bảo mật database.

Tóm lại, ẩn danh dữ liệu là việc biến đổi dữ liệu thông qua các quy tắc ẩn danh đối với một số thông tin nhạy cảm nhất định, để bảo vệ an toàn dữ liệu riêng tư nhạy cảm.

Trong quá trình ẩn danh dữ liệu, thường sử dụng các thuật toán và kỹ thuật khác nhau để xử lý dữ liệu theo các yêu cầu và kịch bản khác nhau. Ví dụ, đối với số CMND, có thể dùng thuật toán masking (mặt nạ) để giữ lại một vài chữ số đầu, các vị trí còn lại thay bằng "X" hoặc "\*"; đối với họ tên, có thể dùng thuật toán pseudonymization (giả danh), thay thế tên thực bằng tên giả được tạo ngẫu nhiên.

### Các quy tắc ẩn danh thường dùng

Các quy tắc ẩn danh thường dùng là để bảo vệ tính bảo mật của dữ liệu nhạy cảm, biến đổi hoặc sửa đổi dữ liệu nhạy cảm khi xử lý và lưu trữ.

Dưới đây là một số quy tắc ẩn danh phổ biến:

- Thay thế (thường dùng): Thay thế các ký tự hoặc chuỗi ký tự cụ thể trong dữ liệu nhạy cảm bằng các ký tự khác. Ví dụ, thay thế các chữ số ở giữa số thẻ tín dụng bằng dấu sao (\*) hoặc ký tự khác.
- Xóa: Xóa ngẫu nhiên một phần nội dung trong dữ liệu nhạy cảm. Ví dụ, xóa ngẫu nhiên 3 chữ số trong số điện thoại.
- Xáo trộn: Đảo lộn thứ tự của một số ký tự hoặc trường trong dữ liệu gốc. Ví dụ, hoán đổi ngẫu nhiên các vị trí trong số CMND.
- Thêm nhiễu: Inject một số sai lệch hoặc nhiễu vào dữ liệu để đạt được hiệu quả ẩn danh. Ví dụ, thêm một số ký tự được tạo ngẫu nhiên vào dữ liệu nhạy cảm.
- Mã hóa (thường dùng): Dùng thuật toán mã hóa để chuyển đổi dữ liệu nhạy cảm thành bản mã. Ví dụ, hash số thẻ ngân hàng bằng hàm hash MD5 hoặc SHA-256. Tham khảo bài viết này để tổng hợp các thuật toán mã hóa thường dùng: <https://javaguide.cn/system-design/security/encryption-algorithms.html>.
- ……

## Công cụ ẩn danh thường dùng

### Hutool

Hutool là một thư viện công cụ Java cơ bản, đóng gói các phương thức JDK cho file, stream, mã hóa/giải mã, chuyển đổi mã, regex, thread, XML, v.v., tạo thành các class Util công cụ khác nhau, đồng thời cung cấp các component sau:

|       Module       |                                                Giới thiệu                                                 |
| :----------------: | :-------------------------------------------------------------------------------------------------------: |
|     hutool-aop     |                         Đóng gói JDK dynamic proxy, cung cấp hỗ trợ AOP ngoài IOC                         |
| hutool-bloomFilter |                    Bloom filter, cung cấp một số bloom filter với các thuật toán Hash                     |
|    hutool-cache    |                                         Triển khai cache đơn giản                                         |
|    hutool-core     |                     Core, bao gồm thao tác Bean, ngày tháng, các Util khác nhau, v.v.                     |
|    hutool-cron     |                   Module scheduled task, cung cấp scheduled task theo biểu thức Crontab                   |
|   hutool-crypto    |          Module mã hóa/giải mã, cung cấp đóng gói các thuật toán symmetric, asymmetric và digest          |
|     hutool-db      |                  Thao tác dữ liệu sau khi đóng gói JDBC, dựa trên tư tưởng ActiveRecord                   |
|     hutool-dfa     |                                 Tìm kiếm đa từ khóa dựa trên mô hình DFA                                  |
|    hutool-extra    | Module mở rộng, đóng gói bên thứ ba (template engine, email, Servlet, QR code, Emoji, FTP, phân từ, v.v.) |
|    hutool-http     |                              Đóng gói Http client dựa trên HttpUrlConnection                              |
|     hutool-log     |                                Log facade tự động nhận dạng triển khai log                                |
|   hutool-script    |                                Đóng gói thực thi script, ví dụ Javascript                                 |
|   hutool-setting   |                            Đóng gói cấu hình Setting và Properties mạnh mẽ hơn                            |
|   hutool-system    |                            Đóng gói gọi tham số hệ thống (thông tin JVM, v.v.)                            |
|    hutool-json     |                                              Triển khai JSON                                              |
|   hutool-captcha   |                                        Triển khai captcha hình ảnh                                        |
|     hutool-poi     |                                     Đóng gói Excel và Word trong POI                                      |
|   hutool-socket    |                               Đóng gói Socket dựa trên NIO và AIO của Java                                |
|     hutool-jwt     |                                 Triển khai đóng gói JSON Web Token (JWT)                                  |

Có thể import riêng lẻ từng module theo nhu cầu, hoặc import tất cả module bằng cách thêm `hutool-all`. Công cụ ẩn danh dữ liệu được sử dụng trong bài viết này nằm trong module `hutool.core`.

Phiên bản mới nhất của Hutool hiện tại hỗ trợ các loại dữ liệu ẩn danh sau, về cơ bản bao phủ các thông tin nhạy cảm thường gặp.

1. User id
2. Họ tên tiếng Trung
3. Số CMND
4. Số điện thoại bàn
5. Số điện thoại di động
6. Địa chỉ
7. Email
8. Mật khẩu
9. Biển số xe đại lục Trung Quốc, bao gồm xe thường và xe năng lượng mới
10. Thẻ ngân hàng

#### Một dòng code để ẩn danh

Các phương thức ẩn danh mà Hutool cung cấp như hình dưới:

![](https://oss.javaguide.cn/github/javaguide/system-design/security/2023-08-01-10-2119fnVCIDozqHgRGx.png)

Lưu ý: Ẩn danh của Hutool thực hiện bằng cách dùng \* để thay thế thông tin nhạy cảm, triển khai cụ thể trong phương thức StrUtil.hide. Nếu muốn tùy chỉnh ký hiệu ẩn, có thể copy source code của Hutool ra và triển khai lại.

Đây lấy ví dụ về ẩn danh số điện thoại, số thẻ ngân hàng, số CMND và thông tin mật khẩu; dưới đây là code test tương ứng.

```java
import cn.hutool.core.util.DesensitizedUtil;
import org.junit.Test;
import org.springframework.boot.test.context.Spring BootTest;

/**
 *
 * @description: Hutool实现数据脱敏
 */
@Spring BootTest
public class HuToolDesensitizationTest {

    @Test
    public void testPhoneDesensitization(){
        String phone="13723231234";
        System.out.println(DesensitizedUtil.mobilePhone(phone)); //输出：137****1234
    }
    @Test
    public void testBankCardDesensitization(){
        String bankCard="6217000130008255666";
        System.out.println(DesensitizedUtil.bankCard(bankCard)); //输出：6217 **** **** *** 5666
    }

    @Test
    public void testIdCardNumDesensitization(){
        String idCardNum="411021199901102321";
        //只显示前4位和后2位
        System.out.println(DesensitizedUtil.idCardNum(idCardNum,4,2)); //输出：4110************21
    }
    @Test
    public void testPasswordDesensitization(){
        String password="www.jd.com_35711";
        System.out.println(DesensitizedUtil.password(password)); //输出：****************
    }
}
```

Trên đây là cách dùng class công cụ được Hutool đóng gói sẵn để thực hiện ẩn danh dữ liệu.

#### Kết hợp JackSon để ẩn danh qua annotation

Bây giờ đã có class công cụ ẩn danh, nếu frontend cần hiển thị dữ liệu ở nhiều chỗ, chúng ta không thể gọi một class công cụ ở mỗi chỗ, như vậy code sẽ rất dư thừa. Vậy làm thế nào để thực hiện ẩn danh dữ liệu một cách thanh lịch thông qua annotation?

Nếu project là web project dựa trên Spring Boot, có thể dùng custom serialization jackson tích hợp sẵn trong Spring Boot để thực hiện. Nguyên lý triển khai thực chất là thực hiện ẩn danh khi json được serialization render cho frontend.

**Bước 1: Enum chiến lược ẩn danh.**

```java
/**
 * @author
 * @description:脱敏策略枚举
 */
public enum DesensitizationTypeEnum {
    //自定义
    MY_RULE,
    //用户id
    USER_ID,
    //中文名
    CHINESE_NAME,
    //身份证号
    ID_CARD,
    //座机号
    FIXED_PHONE,
    //手机号
    MOBILE_PHONE,
    //地址
    ADDRESS,
    //电子邮件
    EMAIL,
    //密码
    PASSWORD,
    //中国大陆车牌，包含普通车辆、新能源车辆
    CAR_LICENSE,
    //银行卡
    BANK_CARD
}
```

Trên thể hiện các loại ẩn danh được hỗ trợ.

**Bước 2: Định nghĩa annotation Desensitization dùng cho ẩn danh.**

- `@Retention (RetentionPolicy.RUNTIME)`: Có hiệu lực tại runtime.
- `@Target (ElementType.FIELD)`: Có thể dùng trên field.
- `@JacksonAnnotationsInside`: Annotation này là một meta-annotation, chủ yếu dùng để đóng gói các annotation khác cùng nhau sử dụng.
- `@JsonSerialize`: Như đã nói ở trên, tác dụng của annotation này là cho phép custom serialization, có thể dùng trên annotation, method, field, class, v.v., có hiệu lực tại runtime, triển khai custom serialization bằng cách override method trong class serialization được cung cấp.

```java
/**
 * @author
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotationsInside
@JsonSerialize(using = DesensitizationSerialize.class)
public @interface Desensitization {
    /**
     * 脱敏数据类型，在MY_RULE的时候，startInclude和endExclude生效
     */
    DesensitizationTypeEnum type() default DesensitizationTypeEnum.MY_RULE;

    /**
     * 脱敏开始位置（包含）
     */
    int startInclude() default 0;

    /**
     * 脱敏结束位置（不包含）
     */
    int endExclude() default 0;
}
```

Lưu ý: Chỉ khi sử dụng enum ẩn danh tùy chỉnh `MY_RULE`, vị trí bắt đầu và kết thúc mới có hiệu lực.

**Bước 3: Tạo class serialization tùy chỉnh**

Đây là bước then chốt để chúng ta thực hiện ẩn danh dữ liệu. Class serialization tùy chỉnh kế thừa `JsonSerializer`, triển khai interface `ContextualSerializer`, và override hai method.

```java
/**
 * @author
 * @description: 自定义序列化类
 */
@AllArgsConstructor
@NoArgsConstructor
public class DesensitizationSerialize extends JsonSerializer<String> implements ContextualSerializer {
    private DesensitizationTypeEnum type;

    private Integer startInclude;

    private Integer endExclude;

    @Override
    public void serialize(String str, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        switch (type) {
            // 自定义类型脱敏
            case MY_RULE:
                jsonGenerator.writeString(CharSequenceUtil.hide(str, startInclude, endExclude));
                break;
            // userId脱敏
            case USER_ID:
                jsonGenerator.writeString(String.valueOf(DesensitizedUtil.userId()));
                break;
            // 中文姓名脱敏
            case CHINESE_NAME:
                jsonGenerator.writeString(DesensitizedUtil.chineseName(String.valueOf(str)));
                break;
            // 身份证脱敏
            case ID_CARD:
                jsonGenerator.writeString(DesensitizedUtil.idCardNum(String.valueOf(str), 1, 2));
                break;
            // 固定电话脱敏
            case FIXED_PHONE:
                jsonGenerator.writeString(DesensitizedUtil.fixedPhone(String.valueOf(str)));
                break;
            // 手机号脱敏
            case MOBILE_PHONE:
                jsonGenerator.writeString(DesensitizedUtil.mobilePhone(String.valueOf(str)));
                break;
            // 地址脱敏
            case ADDRESS:
                jsonGenerator.writeString(DesensitizedUtil.address(String.valueOf(str), 8));
                break;
            // 邮箱脱敏
            case EMAIL:
                jsonGenerator.writeString(DesensitizedUtil.email(String.valueOf(str)));
                break;
            // 密码脱敏
            case PASSWORD:
                jsonGenerator.writeString(DesensitizedUtil.password(String.valueOf(str)));
                break;
            // 中国车牌脱敏
            case CAR_LICENSE:
                jsonGenerator.writeString(DesensitizedUtil.carLicense(String.valueOf(str)));
                break;
            // 银行卡脱敏
            case BANK_CARD:
                jsonGenerator.writeString(DesensitizedUtil.bankCard(String.valueOf(str)));
                break;
            default:
        }

    }

    @Override
    public JsonSerializer<?> createContextual(SerializerProvider serializerProvider, BeanProperty beanProperty) throws JsonMappingException {
        if (beanProperty != null) {
            // 判断数据类型是否为String类型
            if (Objects.equals(beanProperty.getType().getRawClass(), String.class)) {
                // 获取定义的注解
                Desensitization desensitization = beanProperty.getAnnotation(Desensitization.class);
                // 为null
                if (desensitization == null) {
                    desensitization = beanProperty.getContextAnnotation(Desensitization.class);
                }
                // 不为null
                if (desensitization != null) {
                    // 创建定义的序列化类的实例并且返回，入参为注解定义的type,开始位置，结束位置。
                    return new DesensitizationSerialize(desensitization.type(), desensitization.startInclude(),
                            desensitization.endExclude());
                }
            }

            return serializerProvider.findValueSerializer(beanProperty.getType(), beanProperty);
        }
        return serializerProvider.findNullValueSerializer(null);
    }
}
```

Sau ba bước trên, đã hoàn thành việc ẩn danh dữ liệu thông qua annotation. Bây giờ hãy kiểm thử.

Trước tiên định nghĩa một pojo để kiểm thử, thêm chiến lược ẩn danh vào field tương ứng.

```java
/**
 *
 * @description:
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestPojo {

    private String userName;

    @Desensitization(type = DesensitizationTypeEnum.MOBILE_PHONE)
    private String phone;

    @Desensitization(type = DesensitizationTypeEnum.PASSWORD)
    private String password;

    @Desensitization(type = DesensitizationTypeEnum.MY_RULE, startInclude = 0, endExclude = 2)
    private String address;
}
```

Tiếp theo viết một controller để kiểm thử

```java
@RestController
public class TestController {

    @RequestMapping("/test")
    public TestPojo testDesensitization(){
        TestPojo testPojo = new TestPojo();
        testPojo.setUserName("我是用户名");
        testPojo.setAddress("地球中国-北京市通州区京东总部2号楼");
        testPojo.setPhone("13782946666");
        testPojo.setPassword("sunyangwei123123123.");
        System.out.println(testPojo);
        return testPojo;
    }

}
```

![](https://oss.javaguide.cn/github/javaguide/system-design/security/2023-08-02-16-497DdCBy8vbf2D69g.png)

Có thể thấy chúng ta đã thực hiện thành công ẩn danh dữ liệu.

### Apache ShardingSphere

ShardingSphere là một hệ sinh thái giải pháp middleware cơ sở dữ liệu phân tán mã nguồn mở, được tạo thành từ 3 sản phẩm độc lập nhau: Sharding-JDBC, Sharding-Proxy và Sharding-Sidecar (đang lên kế hoạch). Cả ba đều cung cấp chức năng phân mảnh dữ liệu, giao dịch phân tán và quản trị cơ sở dữ liệu chuẩn hóa.

Apache ShardingSphere có một module ẩn danh dữ liệu, module này tích hợp các chức năng ẩn danh dữ liệu thường dùng. Nguyên lý cơ bản là phân tích và chặn SQL do người dùng nhập vào, và dựa vào cấu hình ẩn danh của người dùng để rewrite SQL, từ đó thực hiện mã hóa field gốc và giải mã field đã mã hóa. Cuối cùng thực hiện lưu trữ mã hóa/giải mã và truy vấn transparent với người dùng.

Thông qua Apache ShardingSphere có thể tự động hóa & làm transparent quá trình ẩn danh dữ liệu, người dùng không cần quan tâm đến chi tiết triển khai ở giữa. Và cung cấp nhiều chiến lược ẩn danh built-in và bên thứ ba (AKS), người dùng chỉ cần cấu hình đơn giản là có thể sử dụng.

Địa chỉ tài liệu chính thức: <https://shardingsphere.apache.org/document/4.1.1/cn/features/orchestration/encrypt/>.

### FastJSON

Khi phát triển Web project hàng ngày, ngoài công cụ serialization mặc định tích hợp trong Spring, FastJson cũng là một công cụ serialization interface Restful Spring Web rất thường dùng.

FastJSON có hai cách chính để thực hiện ẩn danh dữ liệu:

- Dựa trên annotation `@JSONField`: Cần tự định nghĩa một class serialization dùng cho ẩn danh, sau đó chỉ định là loại serialization tùy chỉnh của chúng ta qua `serializeUsing` trong `@JSONField` trên field cần ẩn danh.
- Dựa trên serialization filter: Cần triển khai interface `ValueFilter`, override method `process` để hoàn thành ẩn danh tùy chỉnh, sau đó sử dụng chiến lược chuyển đổi tùy chỉnh khi chuyển đổi JSON. Tham khảo bài viết này để biết cách triển khai cụ thể: <https://juejin.cn/post/7067916686141161479>.

### Mybatis-Mate

Trước tiên giới thiệu mối quan hệ giữa ba cái MyBatis, MyBatis-Plus và Mybatis-Mate:

- MyBatis là một persistence layer framework xuất sắc, hỗ trợ SQL tùy chỉnh, stored procedure và advanced mapping.
- MyBatis-Plus là một công cụ tăng cường cho MyBatis, có thể đơn giản hóa đáng kể công việc phát triển persistence layer.
- Mybatis-Mate là module cấp doanh nghiệp được cung cấp cho MyBatis-Plus, nhằm xử lý dữ liệu một cách nhanh nhẹn và thanh lịch hơn. Tuy nhiên, cần cấu hình mã ủy quyền trước khi sử dụng (có phí).

Mybatis-Mate hỗ trợ ẩn danh từ nhạy cảm, tích hợp sẵn 9 loại quy tắc ẩn danh thường dùng như số điện thoại, email, số thẻ ngân hàng.

```java
@FieldSensitive("testStrategy")
private String username;

@Configuration
public class SensitiveStrategyConfig {

    /**
     * 注入脱敏策略
     */
    @Bean
    public ISensitiveStrategy sensitiveStrategy() {
        // 自定义 testStrategy 类型脱敏处理
        return new SensitiveStrategy().addStrategy("testStrategy", t -> t + "***test***");
    }
}

// 跳过脱密处理，用于编辑场景
RequestDataTransfer.skipSensitive();
```

### MyBatis-Flex

Tương tự MybatisPlus, MyBatis-Flex cũng là một MyBatis enhancement framework. MyBatis-Flex cũng cung cấp tính năng ẩn danh dữ liệu, và có thể sử dụng miễn phí.

MyBatis-Flex cung cấp annotation `@ColumnMask()` và 9 loại quy tắc ẩn danh built-in, dùng ngay:

```java
/**
 * 内置的数据脱敏方式
 */
public class Masks {
    /**
     * 手机号脱敏
     */
    public static final String MOBILE = "mobile";
    /**
     * 固定电话脱敏
     */
    public static final String FIXED_PHONE = "fixed_phone";
    /**
     * 身份证号脱敏
     */
    public static final String ID_CARD_NUMBER = "id_card_number";
    /**
     * 中文名脱敏
     */
    public static final String CHINESE_NAME = "chinese_name";
    /**
     * 地址脱敏
     */
    public static final String ADDRESS = "address";
    /**
     * 邮件脱敏
     */
    public static final String EMAIL = "email";
    /**
     * 密码脱敏
     */
    public static final String PASSWORD = "password";
    /**
     * 车牌号脱敏
     */
    public static final String CAR_LICENSE = "car_license";
    /**
     * 银行卡号脱敏
     */
    public static final String BANK_CARD_NUMBER = "bank_card_number";
    //...
}
```

Ví dụ sử dụng:

```java
@Table("tb_account")
public class Account {

    @Id(keyType = KeyType.Auto)
    private Long id;

    @ColumnMask(Masks.CHINESE_NAME)
    private String userName;

    @ColumnMask(Masks.EMAIL)
    private String email;

}
```

Nếu các quy tắc ẩn danh built-in này không đáp ứng yêu cầu của bạn, bạn còn có thể tự định nghĩa quy tắc ẩn danh.

1. Đăng ký quy tắc ẩn danh mới thông qua `MaskManager`:

```java
MaskManager.registerMaskProcessor("自定义规则名称"
        , data -> {
            return data;
        })
```

2. Sử dụng quy tắc ẩn danh tùy chỉnh

```java
@Table("tb_account")
public class Account {

    @Id(keyType = KeyType.Auto)
    private Long id;

    @ColumnMask("自定义规则名称")
    private String userName;
}
```

Và đối với các kịch bản cần bỏ qua xử lý ẩn danh, ví dụ vào trang chỉnh sửa để sửa dữ liệu người dùng, MyBatis-Flex cũng cung cấp hỗ trợ tương ứng:

1. **`MaskManager#execWithoutMask`** (Khuyến nghị): Method này sử dụng mẫu thiết kế template method, đảm bảo sau khi bỏ qua xử lý ẩn danh và thực thi logic liên quan sẽ tự động khôi phục xử lý ẩn danh.
2. **`MaskManager#skipMask`**: Bỏ qua xử lý ẩn danh.
3. **`MaskManager#restoreMask`**: Khôi phục xử lý ẩn danh, đảm bảo các thao tác tiếp theo tiếp tục sử dụng logic ẩn danh.

Triển khai của method `MaskManager#execWithoutMask` như sau:

```java
public static <T> T execWithoutMask(Supplier<T> supplier) {
    try {
        skipMask();
        return supplier.get();
    } finally {
        restoreMask();
    }
}
```

Các method `skipMask` và `restoreMask` của `MaskManager` thường được dùng theo cặp, khuyến nghị dùng mẫu `try{...}finally{...}`.

## Tổng kết

Bài viết này chủ yếu giới thiệu:

- Định nghĩa ẩn danh dữ liệu: Ẩn danh dữ liệu là việc biến đổi dữ liệu thông qua các quy tắc ẩn danh đối với một số thông tin nhạy cảm nhất định, để bảo vệ an toàn dữ liệu riêng tư nhạy cảm.
- Các quy tắc ẩn danh thường dùng: Thay thế, xóa, xáo trộn, thêm nhiễu và mã hóa.
- Các công cụ ẩn danh thường dùng: Hutool, Apache ShardingSphere, FastJSON, Mybatis-Mate và MyBatis-Flex.

## Tham khảo

- Trang web chính thức công cụ Hutool: <https://hutool.cn/docs/#/>
- Thảo luận về cách tùy chỉnh ẩn danh dữ liệu: <https://juejin.cn/post/7046567603971719204>
- FastJSON thực hiện ẩn danh dữ liệu: <https://juejin.cn/post/7067916686141161479>

<!-- @include: @article-footer.snippet.md -->
