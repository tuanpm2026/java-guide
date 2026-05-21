---
title: Giải Thích Chi Tiết Tuần Tự Hóa Java
description: Phân tích sâu cơ chế tuần tự hóa và giải tuần tự hóa Java giải thích giao diện Serializable, từ khóa transient, tác dụng của serialVersionUID, cách chọn giao thức tuần tự hóa và các tình huống ứng dụng như RPC, bộ nhớ cache.
category: Java
tag:
  - Java Cơ Bản
head:
  - - meta
    - name: keywords
      content: tuần tự hóa Java, giải tuần tự hóa, giao diện Serializable, từ khóa transient, serialVersionUID, giao thức tuần tự hóa, lưu trữ đối tượng
---

## Tuần Tự Hóa Và Giải Tuần Tự Hóa Là Gì?

Nếu chúng tôi cần lưu trữ đối tượng Java lâu dài như lưu vào tệp, hoặc truyền đối tượng Java qua mạng, những tình huống này đều cần sử dụng tuần tự hóa.

Nói một cách đơn giản:

- **Tuần Tự Hóa**: Chuyển đổi cấu trúc dữ liệu hoặc đối tượng thành một định dạng có thể lưu trữ hoặc truyền, thường là dòng byte nhị phân, cũng có thể là JSON, XML và các định dạng văn bản khác
- **Giải Tuần Tự Hóa**: Quá trình chuyển đổi dữ liệu được tạo ra trong quá trình tuần tự hóa thành cấu trúc dữ liệu ban đầu hoặc đối tượng

Đối với ngôn ngữ lập trình hướng đối tượng như Java, chúng tôi tuần tự hóa các đối tượng (Object) tức là các lớp được tạo instance (Class), nhưng trong C++ là một ngôn ngữ bán hướng đối tượng, struct (cấu trúc) định nghĩa là một loại cấu trúc dữ liệu, trong khi class tương ứng với loại đối tượng.

Dưới đây là các tình huống ứng dụng phổ biến của tuần tự hóa và giải tuần tự hóa:

- Trước khi đối tượng được truyền qua mạng (ví dụ: khi gọi phương thức từ xa RPC), nó cần được tuần tự hóa trước tiên, sau khi nhận được đối tượng được tuần tự hóa, nó cần được giải tuần tự hóa;
- Trước khi lưu đối tượng vào tệp, cần thực hiện tuần tự hóa, khi đọc đối tượng từ tệp, cần thực hiện giải tuần tự hóa;
- Trước khi lưu đối tượng vào cơ sở dữ liệu (chẳng hạn như Redis), cần sử dụng tuần tự hóa, khi đọc đối tượng từ cơ sở dữ liệu bộ nhớ cache, cần giải tuần tự hóa;
- Trước khi lưu đối tượng vào bộ nhớ, cần thực hiện tuần tự hóa, khi đọc đối tượng từ bộ nhớ, cần thực hiện giải tuần tự hóa.

Wikipedia giới thiệu tuần tự hóa như sau:

> **Tuần Tự Hóa** (serialization) trong xử lý dữ liệu của khoa học máy tính, là việc chuyển đổi cấu trúc dữ liệu hoặc trạng thái đối tượng thành một định dạng có thể sử dụng được (ví dụ: lưu vào tệp, lưu vào bộ đệm, hoặc gửi qua mạng), để phục vụ cho quá trình phục hồi sau này trong cùng một môi trường máy tính hoặc một môi trường máy tính khác. Tùy theo định dạng tuần tự hóa để lấy lại byte, kết quả có thể được sử dụng để tạo ra một bản sao có cùng ngữ nghĩa với đối tượng gốc. Đối với nhiều đối tượng, chẳng hạn như những đối tượng sử dụng nhiều tham chiếu, quá trình xây dựng lại tuần tự hóa này không dễ dàng. Trong hướng đối tượng, tuần tự hóa đối tượng không bao gồm các hàm liên quan của đối tượng ban đầu. Quá trình này còn được gọi là mã hóa đối tượng (object marshalling). Phép toán ngược để trích xuất cấu trúc dữ liệu từ một loạt byte là giải tuần tự hóa (còn được gọi là giải mã, deserialization, unmarshalling).

Tóm lại: **Mục đích chính của tuần tự hóa là truyền đối tượng qua mạng hoặc lưu đối tượng vào hệ thống tệp, cơ sở dữ liệu, bộ nhớ.**

**Giao Thức Tuần Tự Hóa Tương Ứng Với Lớp Mô Hình 4 Lớp Của TCP/IP Là Lớp Nào?**

Chúng ta biết rằng hai bên giao tiếp mạng phải áp dụng và tuân thủ cùng một giao thức. Mô hình 4 lớp TCP/IP như sau, giao thức tuần tự hóa thuộc về lớp nào?

1. Lớp Ứng Dụng
2. Lớp Vận Chuyển
3. Lớp Mạng
4. Lớp Giao Diện Mạng

Như hình cho thấy, trong mô hình OSI 7 lớp, lớp biểu diễn chủ yếu xử lý dữ liệu người dùng của lớp ứng dụng thành dòng byte nhị phân. Ngược lại, chuyển đổi dòng byte nhị phân thành dữ liệu người dùng của lớp ứng dụng. Điều này không chính là tương ứng với tuần tự hóa và giải tuần tự hóa sao?

Do đó, lớp ứng dụng, lớp biểu diễn và lớp phiên trong mô hình OSI 7 lớp đều tương ứng với lớp ứng dụng trong mô hình 4 lớp TCP/IP, vì vậy giao thức tuần tự hóa thuộc về một phần của lớp ứng dụng của giao thức TCP/IP.

## Có Những Giao Thức Tuần Tự Hóa Phổ Biến Nào?

Giao thức tuần tự hóa mặc định được đi kèm với JDK thường không được sử dụng, vì hiệu suất tuần tự hóa thấp và tồn tại vấn đề bảo mật. Các giao thức tuần tự hóa được sử dụng phổ biến là Hessian, Kryo, Protobuf, ProtoStuff, đây là những giao thức tuần tự hóa dựa trên nhị phân.

Những cái như JSON và XML là những loại tuần tự hóa văn bản. Mặc dù khả năng đọc hiểu tương đối tốt, nhưng hiệu năng kém, thường không được chọn.

### Cách Tuần Tự Hóa Mặc Định Của JDK

Tuần tự hóa mặc định của JDK, chỉ cần triển khai giao diện `java.io.Serializable`.

```java
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@ToString
public class RpcRequest implements Serializable {
    private static final long serialVersionUID = 1905122041950251207L;
    private String requestId;
    private String interfaceName;
    private String methodName;
    private Object[] parameters;
    private Class<?>[] paramTypes;
    private RpcMessageTypeEnum rpcMessageTypeEnum;
}
```

**Tác Dụng Của `serialVersionUID` Là Gì?**

Mã tuần tự hóa `serialVersionUID` có tác dụng kiểm soát phiên bản. Khi giải tuần tự hóa, sẽ kiểm tra xem `serialVersionUID` có bằng với `serialVersionUID` của lớp hiện tại hay không. Nếu `serialVersionUID` không khớp thì sẽ ném ngoại lệ `InvalidClassException`. Rất khuyến khích mỗi lớp được tuần tự hóa đều tự chỉ định `serialVersionUID` của nó, nếu không tự chỉ định, trình biên dịch sẽ động tạo mã tuần tự hóa mặc định.

**`serialVersionUID` không phải bị sửa đổi bởi biến static sao? Tại sao nó lại bị "tuần tự hóa"?**

~~Biến `static` được sửa đổi bằng biến tĩnh, nằm ở khu vực phương thức, về cơ bản không được tuần tự hóa. Biến `static` thuộc về lớp chứ không phải đối tượng. Sau khi giải tuần tự hóa, giá trị của biến `static` chỉ như được gán cho đối tượng, trông giống như biến `static` được tuần tự hóa, thực tế chỉ là ảo tưởng mà thôi.~~

**🐛 Sửa Lỗi (tham khảo [issue#2174](https://github.com/Snailclimb/JavaGuide/issues/2174)):**

Thông thường, biến `static` thuộc về lớp, không thuộc về bất kỳ phiên bản đối tượng nào, vì vậy chúng sẽ không được bao gồm trong dòng dữ liệu tuần tự hóa của đối tượng. Tuần tự hóa lưu trữ trạng thái của đối tượng (tức là giá trị của biến thực tế). Tuy nhiên, `serialVersionUID` là một trường hợp đặc biệt, `serialVersionUID` đã được xử lý đặc biệt. Chìa khóa là `serialVersionUID` không được tuần tự hóa như một phần của trạng thái đối tượng, mà cơ chế tuần tự hóa chính nó sử dụng nó như một "dấu vân tay" hoặc "số phiên bản" đặc biệt.

Khi một đối tượng được tuần tự hóa, `serialVersionUID` sẽ được ghi vào dòng byte tuần tự hóa (giống như lưu một số phiên bản, không phải lưu trạng thái của biến `static` chính nó); khi giải tuần tự hóa, nó cũng sẽ được phân tích cú pháp và thực hiện kiểm tra tính nhất quán, nếu không khớp, quá trình giải tuần tự hóa sẽ ném ngoại lệ `InvalidClassException`, vì điều này thường có nghĩa là định nghĩa của lớp được tuần tự hóa đã thay đổi, có thể không còn tương thích nữa.

Giải thích chính thức như sau:

> Một lớp có thể tuần tự hóa có thể khai báo rõ ràng `serialVersionUID` của nó bằng cách khai báo một trường có tên `"serialVersionUID"` là `static`, `final`, và kiểu `long`;
>
> Nếu muốn chỉ định rõ ràng `serialVersionUID`, phải sử dụng từ khóa `static` và `final` để sửa đổi một biến kiểu `long` trong lớp, tên biến phải là `"serialVersionUID"`.

Nói cách khác, bản thân `serialVersionUID` (như một biến static) thực sự không được tuần tự hóa như một phần của trạng thái đối tượng. Tuy nhiên, giá trị của nó được cơ chế tuần tự hóa Java xử lý đặc biệt—như một định danh phiên bản được đọc và ghi vào dòng tuần tự hóa, được sử dụng để kiểm tra tương thích phiên bản khi giải tuần tự hóa.

**Nếu Có Một Số Trường Không Muốn Tuần Tự Hóa Thì Sao?**

Đối với các biến không muốn tuần tự hóa, có thể sử dụng từ khóa `transient` để sửa đổi.

Tác dụng của từ khóa `transient` là: Ngăn chặn những biến trong phiên bản được sửa đổi bằng từ khóa này tuần tự hóa; khi đối tượng được giải tuần tự hóa, giá trị của biến được sửa đổi bằng `transient` sẽ không được lưu trữ lâu dài và khôi phục.

Về `transient` còn có một vài điểm cần lưu ý:

- `transient` chỉ có thể sửa đổi biến, không thể sửa đổi lớp và phương thức.
- Biến được sửa đổi bằng `transient`, sau khi giải tuần tự hóa, giá trị biến sẽ được đặt thành giá trị mặc định của kiểu. Ví dụ, nếu sửa đổi kiểu `int`, kết quả sau giải tuần tự hóa sẽ là `0`.
- Biến `static` vì không thuộc bất kỳ đối tượng nào (Object), nên dù có hoặc không có sửa đổi `transient`, đều sẽ không được tuần tự hóa.

**Tại Sao Không Khuyến Khích Sử Dụng Tuần Tự Hóa Mặc Định Của JDK?**

Chúng tôi hầu như hoặc thường không bao giờ sử dụng trực tiếp cách tuần tự hóa mặc định được cung cấp bởi JDK, lý do chính có các lý do sau:

- **Không Hỗ Trợ Gọi Chéo Ngôn Ngữ**: Nếu dịch vụ được gọi là từ ngôn ngữ khác thì sẽ không được hỗ trợ.
- **Hiệu Năng Kém**: So với các framework tuần tự hóa khác, hiệu năng thấp hơn, lý do chính là mảng byte được tuần tự hóa lớn hơn, dẫn đến chi phí vận chuyển tăng lên.
- **Tồn Tại Vấn Đề Bảo Mật**: Tuần tự hóa và giải tuần tự hóa chính nó không tồn tại vấn đề. Nhưng khi dữ liệu giải tuần tự hóa đầu vào có thể được kiểm soát bởi người dùng, thì những kẻ tấn công có thể tạo ra đầu vào độc hại, làm cho giải tuần tự hóa tạo ra các đối tượng không mong muốn, trong quá trình này sẽ thực thi mã được xây dựng bất kỳ. Bài đọc liên quan: [Lỗ Hổng Bảo Mật Ứng Dụng: Lỗ Hổng Giải Tuần Tự Hóa Java Là Gì?](https://www.zhihu.com/question/37562657/answer/1916596031)

### Kryo

Kryo là một công cụ tuần tự hóa/giải tuần tự hóa hiệu năng cao, do các tính năng lưu trữ độ dài thay đổi và sử dụng cơ chế tạo byte code của nó, có tốc độ chạy cao hơn và kích thước byte code nhỏ hơn.

Ngoài ra, Kryo đã là một triển khai tuần tự hóa rất trưởng thành, đã được sử dụng rộng rãi tại Twitter, Groupon, Yahoo và nhiều dự án nguồn mở nổi tiếng (chẳng hạn như Hive, Storm).

[guide-rpc-framework](https://github.com/Snailclimb/guide-rpc-framework) sử dụng kryo để tuần tự hóa, mã tuần tự hóa và giải tuần tự hóa liên quan như sau:

```java
/**
 * Lớp tuần tự hóa Kryo, hiệu suất tuần tự hóa Kryo rất cao, nhưng chỉ tương thích với ngôn ngữ Java
 *
 * @author shuang.kou
 * @createTime 2020年05月13日 19:29:00
 */
@Slf4j
public class KryoSerializer implements Serializer {

    /**
     * Vì Kryo không an toàn luồng. Vì vậy, hãy sử dụng ThreadLocal để lưu trữ đối tượng Kryo
     */
    private final ThreadLocal<Kryo> kryoThreadLocal = ThreadLocal.withInitial(() -> {
        Kryo kryo = new Kryo();
        kryo.register(RpcResponse.class);
        kryo.register(RpcRequest.class);
        return kryo;
    });

    @Override
    public byte[] serialize(Object obj) {
        try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
             Output output = new Output(byteArrayOutputStream)) {
            Kryo kryo = kryoThreadLocal.get();
            // Object->byte: Tuần tự hóa đối tượng thành mảng byte
            kryo.writeObject(output, obj);
            kryoThreadLocal.remove();
            return output.toBytes();
        } catch (Exception e) {
            throw new SerializeException("Serialization failed");
        }
    }

    @Override
    public <T> T deserialize(byte[] bytes, Class<T> clazz) {
        try (ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(bytes);
             Input input = new Input(byteArrayInputStream)) {
            Kryo kryo = kryoThreadLocal.get();
            // byte->Object: Giải tuần tự hóa đối tượng từ mảng byte
            Object o = kryo.readObject(input, clazz);
            kryoThreadLocal.remove();
            return clazz.cast(o);
        } catch (Exception e) {
            throw new SerializeException("Deserialization failed");
        }
    }

}
```

Địa chỉ GitHub: [https://github.com/EsotericSoftware/kryo](https://github.com/EsotericSoftware/kryo)

### Protobuf

Protobuf đến từ Google, hiệu năng tương đối xuất sắc, cũng hỗ trợ nhiều ngôn ngữ, đồng thời hỗ trợ đa nền tảng. Điều là việc sử dụng quá phức tạp, vì bạn cần tự định nghĩa tệp IDL và tạo mã tuần tự hóa tương ứng. Mặc dù điều này không linh hoạt, nhưng mặt khác, Protobuf không có rủi ro lỗ hổng tuần tự hóa.

> Protobuf bao gồm định nghĩa định dạng tuần tự hóa, thư viện của các ngôn ngữ khác nhau cũng như một trình biên dịch IDL. Thông thường, bạn cần định nghĩa tệp proto, sau đó sử dụng trình biên dịch IDL để biên dịch thành ngôn ngữ bạn cần

Một tệp proto đơn giản như sau:

```protobuf
// Phiên bản protobuf
syntax = "proto3";
// SearchRequest sẽ được biên dịch thành đối tượng tương ứng của các ngôn ngữ khác nhau, ví dụ lớp trong Java, struct trong Go
message Person {
  // Trường kiểu string
  string name = 1;
  // Trường kiểu int
  int32 age = 2;
}
```

Địa chỉ GitHub: [https://github.com/protocolbuffers/protobuf](https://github.com/protocolbuffers/protobuf)

### ProtoStuff

Do tính dễ sử dụng kém của Protobuf, anh em của nó ProtoStuff ra đời.

protostuff dựa trên Google protobuf, nhưng cung cấp nhiều chức năng hơn và cách sử dụng đơn giản hơn. Mặc dù dễ sử dụng hơn, nhưng không có nghĩa là hiệu năng của ProtoStuff kém hơn.

Địa chỉ GitHub: [https://github.com/protostuff/protostuff](https://github.com/protostuff/protostuff)

### Hessian

Hessian là một giao thức RPC nhị phân nhẹ, được tự mô tả. Hessian là một triển khai tuần tự hóa khá cũ, đồng thời cũng được sử dụng trên các ngôn ngữ khác nhau.

Dubbo2.x mặc định sử dụng Hessian2 làm phương thức tuần tự hóa, nhưng Dubbo đã sửa đổi Hessian2, tuy nhiên cấu trúc chung vẫn tương tự.

### Tóm Tắt

Kryo là phương pháp tuần tự hóa được thiết kế đặc biệt cho ngôn ngữ Java và có hiệu năng rất cao, nếu ứng dụng của bạn được thiết kế đặc biệt cho ngôn ngữ Java, bạn có thể cân nhắc sử dụng, và một bài viết trên trang web chính thức Dubbo đề cập rằng nên sử dụng Kryo làm phương thức tuần tự hóa trong môi trường sản xuất.

Những cái như Protobuf, ProtoStuff, hessian là những phương pháp tuần tự hóa được sử dụng trên các ngôn ngữ khác nhau, nếu có nhu cầu gọi chéo ngôn ngữ, bạn có thể cân nhắc sử dụng.

Ngoài các phương pháp tuần tự hóa mà tôi giới thiệu ở trên, còn có Thrift, Avro và những cái khác.
