---
title: Hướng Dẫn Chi Tiết BigDecimal
description: Giải thích chi tiết cách sử dụng BigDecimal giải quyết vấn đề mất độ chính xác của số thực phẩy động, nắm vững các phép tính cộng trừ nhân chia, quy tắc làm tròn RoundingMode, phương thức so sánh compareTo, áp dụng cho các tình huống tính toán độ chính xác cao như tài chính.
category: Java
tag:
  - Java Cơ Bản
head:
  - - meta
    - name: keywords
      content: BigDecimal,số thực phẩy động,mất độ chính xác,phép tính số thập phân,RoundingMode quy tắc làm tròn,so sánh BigDecimal,tính toán tiền tệ,mất độ chính xác
---

Trong "Sổ Tay Phát Triển Java" của Alibaba có đề cập: "Để tránh mất độ chính xác, có thể sử dụng `BigDecimal` để thực hiện các phép tính số thực phẩy động".

Liệu phép tính số thực phẩy động có thực sự gặp rủi ro mất độ chính xác không? Có thật!

Ví dụ mã code:

```java
float a = 2.0f - 1.9f;
float b = 1.8f - 1.7f;
System.out.println(a);// 0.100000024
System.out.println(b);// 0.099999905
System.out.println(a == b);// false
```

**Tại sao phép tính số thực phẩy động `float` hoặc `double` lại gặp rủi ro mất độ chính xác?**

Điều này có liên quan lớn đến cơ chế lưu trữ số thập phân trong máy tính. Chúng ta biết máy tính sử dụng hệ nhị phân, và khi máy tính biểu diễn một số, độ rộng là có giới hạn, các số thập phân vô hạn được lưu trữ trong máy tính chỉ có thể bị cắt ngắn, vì vậy sẽ dẫn đến mất độ chính xác của số thập phân. Điều này cũng giải thích tại sao số thập phân thập phân không thể được biểu diễn chính xác bằng hệ nhị phân.

Ví dụ, số 0,2 ở hệ thập phân không thể chuyển đổi chính xác thành số thập phân nhị phân:

```java
// Quá trình chuyển đổi 0,2 sang số nhị phân là: nhân liên tục với 2 cho đến khi không có phần thập phân,
// Trong quá trình tính toán này, các phần nguyên từ trên xuống dưới được sắp xếp là kết quả nhị phân.
0.2 * 2 = 0.4 -> 0
0.4 * 2 = 0.8 -> 0
0.8 * 2 = 1.6 -> 1
0.6 * 2 = 1.2 -> 1
0.2 * 2 = 0.4 -> 0 (xảy ra lặp lại)
...
```

Để biết thêm chi tiết về số thực phẩy động, đề xuất xem bài viết này: "Nền Tảng Hệ Thống Máy Tính (Bốn) - Số Thực Phẩy Động".

## Giới Thiệu BigDecimal

`BigDecimal` có thể thực hiện phép tính trên số thập phân mà không gây ra mất độ chính xác.

Thông thường, hầu hết các tình huống kinh doanh cần kết quả tính toán số thập phân chính xác (ví dụ: các tình huống liên quan đến tiền tệ) đều được thực hiện thông qua `BigDecimal`.

Trong "Sổ Tay Phát Triển Java" của Alibaba có đề cập: **Để so sánh bằng giữa các số thực phẩy động, các kiểu dữ liệu cơ bản không thể sử dụng == để so sánh, các kiểu dữ liệu gói không thể sử dụng equals để xác định.**

Vấn đề cụ thể có thể được giải quyết bằng cách sử dụng trực tiếp `BigDecimal` để định nghĩa giá trị của số thập phân, sau đó thực hiện các phép tính trên số thập phân:

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("0.9");
BigDecimal c = new BigDecimal("0.8");

BigDecimal x = a.subtract(b);
BigDecimal y = b.subtract(c);

System.out.println(x.compareTo(y));// 0
```

## Các Phương Thức Thường Dùng của BigDecimal

### Tạo Đối Tượng

Khi sử dụng `BigDecimal`, để tránh mất độ chính xác, khuyến nghị sử dụng hàm tạo `BigDecimal(String val)` hoặc phương thức tĩnh `BigDecimal.valueOf(double val)` để tạo đối tượng.

"Sổ Tay Phát Triển Java" của Alibaba cũng có đề cập đến phần này.

### Cộng Trừ Nhân Chia

Phương thức `add` dùng để cộng hai đối tượng `BigDecimal`, phương thức `subtract` dùng để trừ hai đối tượng `BigDecimal`. Phương thức `multiply` dùng để nhân hai đối tượng `BigDecimal`, phương thức `divide` dùng để chia hai đối tượng `BigDecimal`.

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("0.9");
System.out.println(a.add(b));// 1.9
System.out.println(a.subtract(b));// 0.1
System.out.println(a.multiply(b));// 0.90
System.out.println(a.divide(b));// Không thể chia hết, ném ngoại lệ ArithmeticException
System.out.println(a.divide(b, 2, RoundingMode.HALF_UP));// 1.11
```

Lưu ý khi sử dụng phương thức `divide`, nên sử dụng phiên bản có 3 tham số, và `RoundingMode` không nên chọn `UNNECESSARY`, nếu không sẽ rất có thể gặp ngoại lệ `ArithmeticException` (khi không thể chia hết xuất hiện số thập phân vô hạn), trong đó `scale` biểu thị giữ lại bao nhiêu chữ số thập phân, `roundingMode` đại diện cho quy tắc giữ lại.

```java
public BigDecimal divide(BigDecimal divisor, int scale, RoundingMode roundingMode) {
    return divide(divisor, scale, roundingMode.oldMode);
}
```

Có rất nhiều quy tắc giữ lại, dưới đây liệt kê một số:

```java
public enum RoundingMode {
   // 2.4 -> 3 , 1.6 -> 2
   // -1.6 -> -2 , -2.4 -> -3
   UP(BigDecimal.ROUND_UP),
   // 2.4 -> 2 , 1.6 -> 1
   // -1.6 -> -1 , -2.4 -> -2
   DOWN(BigDecimal.ROUND_DOWN),
   // 2.4 -> 3 , 1.6 -> 2
   // -1.6 -> -1 , -2.4 -> -2
   CEILING(BigDecimal.ROUND_CEILING),
   // 2.5 -> 2 , 1.6 -> 1
   // -1.6 -> -2 , -2.5 -> -3
   FLOOR(BigDecimal.ROUND_FLOOR),
   // 2.4 -> 2 , 1.6 -> 2
   // -1.6 -> -2 , -2.4 -> -2
   HALF_UP(BigDecimal.ROUND_HALF_UP),
   //......
}
```

### So Sánh Kích Thước

`a.compareTo(b)`: Trả về -1 có nghĩa là `a` nhỏ hơn `b`, 0 có nghĩa là `a` bằng `b`, 1 có nghĩa là `a` lớn hơn `b`.

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("0.9");
System.out.println(a.compareTo(b));// 1
```

### Giữ Lại Vài Chữ Số Thập Phân

Thông qua phương thức `setScale` để đặt giữ lại bao nhiêu chữ số thập phân cũng như quy tắc giữ lại. Có khá nhiều quy tắc giữ lại, không cần phải nhớ, IDEA sẽ gợi ý.

```java
BigDecimal m = new BigDecimal("1.255433");
BigDecimal n = m.setScale(3,RoundingMode.HALF_DOWN);
System.out.println(n);// 1.255
```

## Vấn Đề So Sánh Bằng của BigDecimal

Trong "Sổ Tay Phát Triển Java" của Alibaba có đề cập:

Ví dụ mã code với vấn đề khi sử dụng phương thức `equals()` của `BigDecimal` để so sánh bằng:

```java
BigDecimal a = new BigDecimal("1");
BigDecimal b = new BigDecimal("1.0");
System.out.println(a.equals(b));//false
```

Điều này là do phương thức `equals()` không chỉ so sánh kích thước giá trị (value) mà còn so sánh độ chính xác (scale), trong khi phương thức `compareTo()` sẽ bỏ qua độ chính xác khi so sánh.

Scale của 1.0 là 1, scale của 1 là 0, do đó kết quả của `a.equals(b)` là false.

Phương thức `compareTo()` có thể so sánh giá trị của hai `BigDecimal`, nếu bằng nhau sẽ trả về 0, nếu số thứ nhất lớn hơn số thứ hai sẽ trả về 1, ngược lại sẽ trả về -1.

```java
BigDecimal a = new BigDecimal("1");
BigDecimal b = new BigDecimal("1.0");
System.out.println(a.compareTo(b));//0
```

## Chia Sẻ Lớp Tiện Ích BigDecimal

Trên mạng có một lớp tiện ích `BigDecimal` được sử dụng bởi khá nhiều người, cung cấp nhiều phương thức tĩnh để đơn giản hóa các phép tính `BigDecimal`.

Tôi đã cải thiện nó một chút, chia sẻ mã nguồn:

```java
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Lớp tiện ích nhỏ để đơn giản hóa phép tính BigDecimal
 */
public class BigDecimalUtil {

    /**
     * Độ chính xác mặc định của phép chia
     */
    private static final int DEF_DIV_SCALE = 10;

    private BigDecimalUtil() {
    }

    /**
     * Cung cấp phép cộng chính xác.
     *
     * @param v1 số bị cộng
     * @param v2 số cộng
     * @return Tổng của hai tham số
     */
    public static double add(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.add(b2).doubleValue();
    }

    /**
     * Cung cấp phép trừ chính xác.
     *
     * @param v1 số bị trừ
     * @param v2 số trừ
     * @return Hiệu của hai tham số
     */
    public static double subtract(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.subtract(b2).doubleValue();
    }

    /**
     * Cung cấp phép nhân chính xác.
     *
     * @param v1 số bị nhân
     * @param v2 số nhân
     * @return Tích của hai tham số
     */
    public static double multiply(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.multiply(b2).doubleValue();
    }

    /**
     * Cung cấp phép chia (tương đối) chính xác, khi xảy ra tình huống không chia hết, chính xác đến
     * 10 chữ số sau dấu thập phân, những số phía sau dùng quy tắc làm tròn.
     *
     * @param v1 số bị chia
     * @param v2 số chia
     * @return Thương của hai tham số
     */
    public static double divide(double v1, double v2) {
        return divide(v1, v2, DEF_DIV_SCALE);
    }

    /**
     * Cung cấp phép chia (tương đối) chính xác. Khi xảy ra tình huống không chia hết, tham số scale chỉ định
     * độ chính xác, những số phía sau dùng quy tắc làm tròn.
     *
     * @param v1    số bị chia
     * @param v2    số chia
     * @param scale Biểu thị cần phải chính xác đến bao nhiêu chữ số sau dấu thập phân.
     * @return Thương của hai tham số
     */
    public static double divide(double v1, double v2, int scale) {
        if (scale < 0) {
            throw new IllegalArgumentException(
                    "The scale must be a positive integer or zero");
        }
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.divide(b2, scale, RoundingMode.HALF_EVEN).doubleValue();
    }

    /**
     * Cung cấp xử lý làm tròn chính xác các chữ số thập phân.
     *
     * @param v     số cần làm tròn
     * @param scale Giữ lại bao nhiêu chữ số sau dấu thập phân
     * @return Kết quả sau khi làm tròn
     */
    public static double round(double v, int scale) {
        if (scale < 0) {
            throw new IllegalArgumentException(
                    "The scale must be a positive integer or zero");
        }
        BigDecimal b = BigDecimal.valueOf(v);
        BigDecimal one = new BigDecimal("1");
        return b.divide(one, scale, RoundingMode.HALF_UP).doubleValue();
    }

    /**
     * Cung cấp chuyển đổi kiểu chính xác (Float)
     *
     * @param v số cần chuyển đổi
     * @return Trả về kết quả chuyển đổi
     */
    public static float convertToFloat(double v) {
        BigDecimal b = BigDecimal.valueOf(v);
        return b.floatValue();
    }

    /**
     * Cung cấp chuyển đổi kiểu chính xác (Int) không thực hiện làm tròn
     *
     * @param v số cần chuyển đổi
     * @return Trả về kết quả chuyển đổi
     */
    public static int convertsToInt(double v) {
        BigDecimal b = BigDecimal.valueOf(v);
        return b.intValue();
    }

    /**
     * Cung cấp chuyển đổi kiểu chính xác (Long)
     *
     * @param v số cần chuyển đổi
     * @return Trả về kết quả chuyển đổi
     */
    public static long convertsToLong(double v) {
        BigDecimal b = BigDecimal.valueOf(v);
        return b.longValue();
    }

    /**
     * Trả về giá trị lớn hơn trong hai số
     *
     * @param v1 số thứ nhất cần so sánh
     * @param v2 số thứ hai cần so sánh
     * @return Trả về giá trị lớn hơn trong hai số
     */
    public static double returnMax(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.max(b2).doubleValue();
    }

    /**
     * Trả về giá trị nhỏ hơn trong hai số
     *
     * @param v1 số thứ nhất cần so sánh
     * @param v2 số thứ hai cần so sánh
     * @return Trả về giá trị nhỏ hơn trong hai số
     */
    public static double returnMin(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.min(b2).doubleValue();
    }

    /**
     * So sánh chính xác hai số
     *
     * @param v1 số thứ nhất cần so sánh
     * @param v2 số thứ hai cần so sánh
     * @return Nếu hai số bằng nhau thì trả về 0, nếu số thứ nhất lớn hơn số thứ hai thì trả về 1, ngược lại trả về -1
     */
    public static int compareTo(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.compareTo(b2);
    }

}
```

## Tóm Tắt

Số thực phẩy động không thể được biểu diễn chính xác bằng hệ nhị phân, do đó tồn tại rủi ro mất độ chính xác.

Tuy nhiên, Java cung cấp `BigDecimal` để hoạt động trên số thực phẩy động. Cách triển khai `BigDecimal` sử dụng `BigInteger` (để hoạt động trên số nguyên lớn), sự khác biệt là `BigDecimal` đã thêm khái niệm về vị trí thập phân.
