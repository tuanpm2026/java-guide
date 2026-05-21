---
title: Tổng kết 10 thuật toán sắp xếp cổ điển
description: Tổng hợp có hệ thống 10 thuật toán sắp xếp cổ điển, kèm so sánh độ phức tạp và tính ổn định, bao gồm nguyên lý cốt lõi và tình huống sử dụng của các loại sắp xếp so sánh và không so sánh, giúp nhanh chóng lựa chọn và tối ưu hóa.
category: Kiến thức cơ bản máy tính
tag:
  - Thuật toán
head:
  - - meta
    - name: keywords
      content: 排序算法,快速排序,归并排序,堆排序,冒泡排序,选择排序,插入排序,希尔排序,桶排序,计数排序,基数排序,时间复杂度,空间复杂度,稳定性
---

> Bài viết này được dịch từ: <http://www.guoyaohua.com/sorting.html>, JavaGuide đã bổ sung và hoàn thiện thêm.

<!-- markdownlint-disable MD024 -->

## Mở đầu

Sắp xếp là thao tác sắp xếp một chuỗi bản ghi theo thứ tự tăng dần hoặc giảm dần dựa trên một hoặc một số khóa trong chúng. Thuật toán sắp xếp là phương pháp để các bản ghi được sắp xếp theo yêu cầu. Thuật toán sắp xếp được chú trọng đáng kể trong nhiều lĩnh vực, đặc biệt là trong xử lý lượng lớn dữ liệu. Một thuật toán xuất sắc có thể tiết kiệm rất nhiều tài nguyên. Trong các lĩnh vực khác nhau, xem xét các hạn chế và quy chuẩn khác nhau của dữ liệu, để đạt được một thuật toán xuất sắc phù hợp với thực tế, cần trải qua nhiều suy luận và phân tích.

## Giới thiệu

### Tổng kết các thuật toán sắp xếp

Các thuật toán sắp xếp nội bộ thông dụng bao gồm: **Sắp xếp chèn (Insertion Sort)**, **Sắp xếp Shell (Shell Sort)**, **Sắp xếp chọn (Selection Sort)**, **Sắp xếp nổi bọt (Bubble Sort)**, **Sắp xếp trộn (Merge Sort)**, **Sắp xếp nhanh (Quick Sort)**, **Sắp xếp đống (Heap Sort)**, **Sắp xếp cơ số (Radix Sort)**, v.v. Bài viết này chỉ giải thích các thuật toán sắp xếp nội bộ. Tóm tắt bằng một bảng:

| Thuật toán sắp xếp | Độ phức tạp thời gian (TB) | Độ phức tạp thời gian (Xấu nhất) | Độ phức tạp thời gian (Tốt nhất) | Độ phức tạp không gian | Kiểu sắp xếp     | Tính ổn định  |
| ------------------ | -------------------------- | -------------------------------- | -------------------------------- | ---------------------- | ---------------- | ------------- |
| Sắp xếp nổi bọt    | O(n^2)                     | O(n^2)                           | O(n)                             | O(1)                   | Sắp xếp nội bộ   | Ổn định       |
| Sắp xếp chọn       | O(n^2)                     | O(n^2)                           | O(n^2)                           | O(1)                   | Sắp xếp nội bộ   | Không ổn định |
| Sắp xếp chèn       | O(n^2)                     | O(n^2)                           | O(n)                             | O(1)                   | Sắp xếp nội bộ   | Ổn định       |
| Sắp xếp Shell      | O(nlogn)                   | O(n^2)                           | O(nlogn)                         | O(1)                   | Sắp xếp nội bộ   | Không ổn định |
| Sắp xếp trộn       | O(nlogn)                   | O(nlogn)                         | O(nlogn)                         | O(n)                   | Sắp xếp ngoại bộ | Ổn định       |
| Sắp xếp nhanh      | O(nlogn)                   | O(n^2)                           | O(nlogn)                         | O(logn)                | Sắp xếp nội bộ   | Không ổn định |
| Sắp xếp đống       | O(nlogn)                   | O(nlogn)                         | O(nlogn)                         | O(1)                   | Sắp xếp nội bộ   | Không ổn định |
| Sắp xếp đếm        | O(n+k)                     | O(n+k)                           | O(n+k)                           | O(k)                   | Sắp xếp ngoại bộ | Ổn định       |
| Sắp xếp thùng      | O(n+k)                     | O(n^2)                           | O(n+k)                           | O(n+k)                 | Sắp xếp ngoại bộ | Ổn định       |
| Sắp xếp cơ số      | O(n×k)                     | O(n×k)                           | O(n×k)                           | O(n+k)                 | Sắp xếp ngoại bộ | Ổn định       |

**Giải thích thuật ngữ**:

- **n**: Quy mô dữ liệu, biểu thị kích thước dữ liệu cần sắp xếp.
- **k**: Số lượng "thùng", trong một số thuật toán sắp xếp đặc thù (như sắp xếp cơ số, sắp xếp thùng, v.v.), biểu thị số lượng khoảng hoặc danh mục sắp xếp độc lập được phân chia.
- **Sắp xếp nội bộ**: Tất cả các thao tác sắp xếp đều hoàn thành trong bộ nhớ, không cần sự hỗ trợ của đĩa hoặc thiết bị lưu trữ khác. Phù hợp khi kích thước dữ liệu đủ nhỏ để tải hoàn toàn vào bộ nhớ.
- **Sắp xếp ngoại bộ**: Dùng khi kích thước dữ liệu quá lớn, không thể tải hết vào bộ nhớ. Sắp xếp ngoại bộ thường liên quan đến xử lý phân vùng dữ liệu, một phần dữ liệu được tạm thời lưu trên đĩa ngoài hoặc thiết bị lưu trữ khác.
- **Ổn định**: Nếu A đứng trước B, và $A=B$, sau khi sắp xếp A vẫn đứng trước B.
- **Không ổn định**: Nếu A đứng trước B, và $A=B$, sau khi sắp xếp A có thể xuất hiện sau B.
- **Độ phức tạp thời gian**: Mô tả định tính thời gian thực thi của một thuật toán.
- **Độ phức tạp không gian**: Mô tả định tính kích thước bộ nhớ cần thiết khi thực thi một thuật toán.

### Phân loại thuật toán sắp xếp

Mười thuật toán sắp xếp thông dụng có thể được phân thành hai loại: **sắp xếp so sánh** và **sắp xếp không so sánh**.

![Phân loại thuật toán sắp xếp](/images/github/javaguide/cs-basics/sorting-algorithms/sort2.png)

Các thuật toán **sắp xếp nhanh**, **sắp xếp trộn**, **sắp xếp đống** và **sắp xếp nổi bọt** thông dụng đều thuộc **thuật toán sắp xếp so sánh**. Sắp xếp so sánh xác định thứ tự tương đối giữa các phần tử thông qua so sánh, vì độ phức tạp thời gian không thể vượt qua `O(nlogn)` nên còn được gọi là sắp xếp so sánh phi tuyến tính. Trong các thuật toán sắp xếp như sắp xếp nổi bọt, quy mô vấn đề là `n`, và vì cần so sánh `n` lần, nên độ phức tạp thời gian trung bình là `O(n²)`. Trong **sắp xếp trộn**, **sắp xếp nhanh**, quy mô vấn đề được thu nhỏ thành `logn` lần thông qua **phương pháp chia để trị**, nên độ phức tạp thời gian trung bình là `O(nlogn)`.

Ưu điểm của sắp xếp so sánh là áp dụng được cho dữ liệu có quy mô bất kỳ, không phụ thuộc vào phân phối dữ liệu. Có thể nói sắp xếp so sánh áp dụng cho mọi trường hợp cần sắp xếp.

Trong khi đó, **sắp xếp đếm**, **sắp xếp cơ số**, **sắp xếp thùng** thuộc **thuật toán sắp xếp không so sánh**. Sắp xếp không so sánh không xác định thứ tự tương đối giữa các phần tử thông qua so sánh, mà thông qua việc xác định có bao nhiêu phần tử đứng trước mỗi phần tử. Vì có thể vượt qua giới hạn thời gian dưới của sắp xếp dựa trên so sánh, chạy trong thời gian tuyến tính, nên được gọi là sắp xếp không so sánh thời gian tuyến tính. Sắp xếp không so sánh chỉ cần xác định số lượng phần tử đã có trước mỗi phần tử, nên một lần duyệt là đủ. Độ phức tạp thời gian thuật toán là $O(n)$.

Độ phức tạp thời gian của sắp xếp không so sánh thấp, nhưng do cần chiếm không gian để xác định vị trí duy nhất, nên có những yêu cầu nhất định về quy mô và phân phối dữ liệu.

## Sắp xếp nổi bọt (Bubble Sort)

Sắp xếp nổi bọt là một thuật toán sắp xếp đơn giản. Nó liên tục duyệt qua chuỗi cần sắp xếp, so sánh từng cặp phần tử liền kề, nếu thứ tự sai thì hoán đổi chúng. Công việc duyệt qua chuỗi được thực hiện lặp đi lặp lại cho đến khi không cần hoán đổi nữa, lúc này chuỗi đã được sắp xếp. Thuật toán được đặt tên là sắp xếp nổi bọt vì các phần tử nhỏ hơn sẽ từ từ "nổi" lên đầu danh sách thông qua hoán đổi.

### Các bước thuật toán

1. So sánh các phần tử liền kề. Nếu phần tử đầu tiên lớn hơn phần tử thứ hai, hoán đổi chúng;
2. Thực hiện thao tác tương tự cho mỗi cặp phần tử liền kề, từ cặp đầu tiên đến cặp cuối cùng, sau đó phần tử cuối cùng sẽ là số lớn nhất;
3. Lặp lại các bước trên cho tất cả phần tử, trừ phần tử cuối cùng;
4. Lặp lại bước 1~3 cho đến khi sắp xếp xong.

### Minh họa thuật toán

![Sắp xếp nổi bọt](/images/github/javaguide/cs-basics/sorting-algorithms/bubble_sort.gif)

### Triển khai code

```java
/**
 * 冒泡排序
 * @param arr
 * @return arr
 */
public static int[] bubbleSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        // Set a flag, if true, that means the loop has not been swapped,
        // that is, the sequence has been ordered, the sorting has been completed.
        boolean flag = true;
        for (int j = 0; j < arr.length - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int tmp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = tmp;
       // Change flag
                flag = false;
            }
        }
        if (flag) {
            break;
        }
    }
    return arr;
}
```

**Ở đây code được tối ưu hóa thêm một chút, thêm cờ `is_sorted`, mục đích là tối ưu độ phức tạp thời gian tốt nhất của thuật toán thành `O(n)`, tức là khi chuỗi đầu vào ban đầu đã được sắp xếp, độ phức tạp thời gian của thuật toán này chỉ là `O(n)`.**

### Phân tích thuật toán

- **Tính ổn định**: Ổn định
- **Độ phức tạp thời gian**: Tốt nhất: $O(n)$, Xấu nhất: $O(n^2)$, Trung bình: $O(n^2)$
- **Độ phức tạp không gian**: $O(1)$
- **Kiểu sắp xếp**: In-place

## Sắp xếp chọn (Selection Sort)

Sắp xếp chọn là một thuật toán sắp xếp đơn giản và trực quan, dù dữ liệu nào vào cũng có độ phức tạp thời gian $O(n^2)$. Vì vậy khi dùng nó, quy mô dữ liệu càng nhỏ càng tốt. Ưu điểm duy nhất có thể là không chiếm thêm bộ nhớ. Nguyên lý hoạt động của nó: đầu tiên tìm phần tử nhỏ nhất (lớn nhất) trong chuỗi chưa được sắp xếp, đặt vào vị trí đầu của chuỗi đã được sắp xếp, sau đó tiếp tục tìm phần tử nhỏ nhất (lớn nhất) trong các phần tử chưa được sắp xếp còn lại, đặt vào cuối chuỗi đã được sắp xếp. Cứ thế cho đến khi tất cả phần tử đều được sắp xếp xong.

### Các bước thuật toán

1. Đầu tiên tìm phần tử nhỏ nhất (lớn nhất) trong chuỗi chưa được sắp xếp, đặt vào vị trí đầu của chuỗi đã được sắp xếp
2. Tiếp tục tìm phần tử nhỏ nhất (lớn nhất) trong các phần tử chưa được sắp xếp còn lại, đặt vào cuối chuỗi đã được sắp xếp.
3. Lặp lại bước 2 cho đến khi tất cả phần tử đều được sắp xếp xong.

### Minh họa thuật toán

![Selection Sort](/images/github/javaguide/cs-basics/sorting-algorithms/selection_sort.gif)

### Triển khai code

```java
/**
 * 选择排序
 * @param arr
 * @return arr
 */
public static int[] selectionSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex != i) {
            int tmp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = tmp;
        }
    }
    return arr;
}
```

### Phân tích thuật toán

- **Tính ổn định**: Không ổn định
- **Độ phức tạp thời gian**: Tốt nhất: $O(n^2)$, Xấu nhất: $O(n^2)$, Trung bình: $O(n^2)$
- **Độ phức tạp không gian**: $O(1)$
- **Kiểu sắp xếp**: In-place

## Sắp xếp chèn (Insertion Sort)

Sắp xếp chèn là một thuật toán sắp xếp đơn giản và trực quan. Nguyên lý hoạt động của nó là xây dựng chuỗi đã sắp xếp, với dữ liệu chưa được sắp xếp, quét từ sau ra trước trong chuỗi đã sắp xếp, tìm vị trí thích hợp và chèn vào. Trong triển khai sắp xếp chèn, thường dùng sắp xếp in-place (chỉ cần $O(1)$ không gian bổ sung), vì vậy trong quá trình quét từ sau ra trước, cần liên tục dịch chuyển các phần tử đã sắp xếp sang sau, để tạo không gian chèn cho phần tử mới.

Mặc dù triển khai code của sắp xếp chèn không đơn giản như sắp xếp nổi bọt và sắp xếp chọn, nhưng nguyên lý của nó nên là dễ hiểu nhất, vì ai đã chơi bài đều có thể hiểu ngay. Sắp xếp chèn là thuật toán sắp xếp đơn giản và trực quan nhất, nguyên lý hoạt động là xây dựng chuỗi đã sắp xếp, với dữ liệu chưa được sắp xếp, quét từ sau ra trước trong chuỗi đã sắp xếp, tìm vị trí thích hợp và chèn vào.

Sắp xếp chèn cũng có một thuật toán tối ưu hóa, gọi là chèn nhị phân.

### Các bước thuật toán

1. Bắt đầu từ phần tử đầu tiên, phần tử này có thể được coi là đã sắp xếp;
2. Lấy phần tử tiếp theo, quét từ sau ra trước trong chuỗi các phần tử đã sắp xếp;
3. Nếu phần tử đó (đã sắp xếp) lớn hơn phần tử mới, chuyển phần tử đó sang vị trí tiếp theo;
4. Lặp lại bước 3 cho đến khi tìm được vị trí mà phần tử đã sắp xếp nhỏ hơn hoặc bằng phần tử mới;
5. Chèn phần tử mới vào vị trí đó;
6. Lặp lại bước 2~5.

### Minh họa thuật toán

![insertion_sort](/images/github/javaguide/cs-basics/sorting-algorithms/insertion_sort.gif)

### Triển khai code

```java
/**
 * 插入排序
 * @param arr
 * @return arr
 */
public static int[] insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int preIndex = i - 1;
        int current = arr[i];
        while (preIndex >= 0 && current < arr[preIndex]) {
            arr[preIndex + 1] = arr[preIndex];
            preIndex -= 1;
        }
        arr[preIndex + 1] = current;
    }
    return arr;
}
```

### Phân tích thuật toán

- **Tính ổn định**: Ổn định
- **Độ phức tạp thời gian**: Tốt nhất: $O(n)$, Xấu nhất: $O(n^2)$, Trung bình: $O(n2)$
- **Độ phức tạp không gian**: O(1)$
- **Kiểu sắp xếp**: In-place

## Sắp xếp Shell (Shell Sort)

Sắp xếp Shell là một thuật toán sắp xếp được đề xuất bởi Donald Shell vào năm 1959. Sắp xếp Shell cũng là một loại sắp xếp chèn, là phiên bản hiệu quả hơn của sắp xếp chèn đơn giản sau khi được cải tiến, còn được gọi là thuật toán sắp xếp tăng dần giảm dần, đồng thời đây là một trong những thuật toán đầu tiên vượt qua $O(n^2)$.

Ý tưởng cơ bản của sắp xếp Shell là: đầu tiên chia toàn bộ chuỗi bản ghi cần sắp xếp thành nhiều chuỗi con để thực hiện sắp xếp chèn trực tiếp riêng biệt, khi toàn bộ chuỗi "cơ bản có thứ tự", mới thực hiện một lần sắp xếp chèn trực tiếp cho toàn bộ bản ghi.

### Các bước thuật toán

Hãy xem các bước cơ bản của sắp xếp Shell, ở đây chúng ta chọn increment $gap=length/2$, tiếp tục thu nhỏ theo cách $gap = gap/2$, cách chọn increment này có thể biểu diễn bằng một chuỗi $\lbrace \frac{n}{2}, \frac{(n/2)}{2}, \dots, 1 \rbrace$, gọi là **chuỗi increment**. Việc chọn và chứng minh chuỗi increment cho sắp xếp Shell là một bài toán toán học khó, chuỗi increment chúng ta chọn là chuỗi phổ biến nhất, cũng là increment mà Shell đề xuất, gọi là increment Shell, nhưng thực ra chuỗi increment này không phải là tối ưu. Ở đây chúng ta dùng increment Shell làm ví dụ.

Chia toàn bộ chuỗi bản ghi cần sắp xếp thành nhiều chuỗi con để thực hiện sắp xếp chèn trực tiếp riêng biệt, mô tả thuật toán cụ thể:

- Chọn một chuỗi increment $\lbrace t_1, t_2, \dots, t_k \rbrace$, trong đó $t_i \gt t_j, i \lt j, t_k = 1$;
- Theo số lượng k trong chuỗi increment, thực hiện sắp xếp k lần cho chuỗi;
- Mỗi lần sắp xếp, theo increment $t$ tương ứng, chia chuỗi cần sắp xếp thành nhiều chuỗi con có độ dài $m$, thực hiện sắp xếp chèn trực tiếp cho từng bảng con. Khi hệ số increment bằng 1, toàn bộ chuỗi được xử lý như một bảng, độ dài bảng là độ dài toàn bộ chuỗi.

### Minh họa thuật toán

![shell_sort](/images/github/javaguide/cs-basics/sorting-algorithms/shell_sort.png)

### Triển khai code

```java
/**
 * 希尔排序
 *
 * @param arr
 * @return arr
 */
public static int[] shellSort(int[] arr) {
    int n = arr.length;
    int gap = n / 2;
    while (gap > 0) {
        for (int i = gap; i < n; i++) {
            int current = arr[i];
            int preIndex = i - gap;
            // Insertion sort
            while (preIndex >= 0 && arr[preIndex] > current) {
                arr[preIndex + gap] = arr[preIndex];
                preIndex -= gap;
            }
            arr[preIndex + gap] = current;

        }
        gap /= 2;
    }
    return arr;
}
```

### Phân tích thuật toán

- **Tính ổn định**: Không ổn định
- **Độ phức tạp thời gian**: Tốt nhất: $O(nlogn)$, Xấu nhất: $O(n^2)$, Trung bình: $O(nlogn)$
- **Độ phức tạp không gian**: $O(1)$

## Sắp xếp trộn (Merge Sort)

Sắp xếp trộn là một thuật toán sắp xếp hiệu quả được xây dựng trên thao tác trộn. Thuật toán này là một ứng dụng rất điển hình của phương pháp chia để trị (Divide and Conquer). Sắp xếp trộn là một phương pháp sắp xếp ổn định. Trộn các chuỗi con đã có thứ tự để tạo ra chuỗi hoàn toàn có thứ tự; tức là đầu tiên làm cho mỗi chuỗi con có thứ tự, sau đó làm cho các đoạn chuỗi con có thứ tự với nhau. Nếu trộn hai bảng có thứ tự thành một bảng có thứ tự, gọi là trộn 2 đường.

Cũng như sắp xếp chọn, hiệu suất của sắp xếp trộn không bị ảnh hưởng bởi dữ liệu đầu vào, nhưng biểu hiện tốt hơn nhiều so với sắp xếp chọn, vì độ phức tạp thời gian luôn là $O(nlogn)$. Chi phí là cần thêm không gian bộ nhớ.

### Các bước thuật toán

Thuật toán sắp xếp trộn là một quá trình đệ quy, điều kiện biên là khi chuỗi đầu vào chỉ có một phần tử thì trả về trực tiếp, quá trình cụ thể như sau:

1. Nếu đầu vào chỉ có một phần tử thì trả về trực tiếp, ngược lại chia chuỗi đầu vào có độ dài $n$ thành hai chuỗi con có độ dài $n/2$;
2. Thực hiện sắp xếp trộn cho hai chuỗi con này, làm cho chuỗi con có thứ tự;
3. Thiết lập hai con trỏ, lần lượt trỏ vào vị trí bắt đầu của hai chuỗi con đã sắp xếp;
4. So sánh các phần tử mà hai con trỏ chỉ đến, chọn phần tử tương đối nhỏ hơn đặt vào không gian trộn (dùng để lưu kết quả sắp xếp), và di chuyển con trỏ đến vị trí tiếp theo;
5. Lặp lại bước 3~4 cho đến khi một con trỏ đến cuối chuỗi;
6. Sao chép trực tiếp tất cả phần tử còn lại của chuỗi kia vào cuối chuỗi đã trộn.

### Minh họa thuật toán

![MergeSort](/images/github/javaguide/cs-basics/sorting-algorithms/merge_sort.gif)

### Triển khai code

```java
/**
 * 归并排序
 *
 * @param arr
 * @return arr
 */
public static int[] mergeSort(int[] arr) {
    if (arr.length <= 1) {
        return arr;
    }
    int middle = arr.length / 2;
    int[] arr_1 = Arrays.copyOfRange(arr, 0, middle);
    int[] arr_2 = Arrays.copyOfRange(arr, middle, arr.length);
    return merge(mergeSort(arr_1), mergeSort(arr_2));
}

/**
 * Merge two sorted arrays
 *
 * @param arr_1
 * @param arr_2
 * @return sorted_arr
 */
public static int[] merge(int[] arr_1, int[] arr_2) {
    int[] sorted_arr = new int[arr_1.length + arr_2.length];
    int idx = 0, idx_1 = 0, idx_2 = 0;
    while (idx_1 < arr_1.length && idx_2 < arr_2.length) {
        if (arr_1[idx_1] < arr_2[idx_2]) {
            sorted_arr[idx] = arr_1[idx_1];
            idx_1 += 1;
        } else {
            sorted_arr[idx] = arr_2[idx_2];
            idx_2 += 1;
        }
        idx += 1;
    }
    if (idx_1 < arr_1.length) {
        while (idx_1 < arr_1.length) {
            sorted_arr[idx] = arr_1[idx_1];
            idx_1 += 1;
            idx += 1;
        }
    } else {
        while (idx_2 < arr_2.length) {
            sorted_arr[idx] = arr_2[idx_2];
            idx_2 += 1;
            idx += 1;
        }
    }
    return sorted_arr;
}
```

### Phân tích thuật toán

- **Tính ổn định**: Ổn định
- **Độ phức tạp thời gian**: Tốt nhất: $O(nlogn)$, Xấu nhất: $O(nlogn)$, Trung bình: $O(nlogn)$
- **Độ phức tạp không gian**: $O(n)$

## Sắp xếp nhanh (Quick Sort)

Sắp xếp nhanh sử dụng tư tưởng chia để trị, tương tự như sắp xếp trộn. Nhìn thoáng qua sắp xếp nhanh và sắp xếp trộn rất giống nhau, đều thu nhỏ vấn đề, sắp xếp chuỗi con trước rồi trộn lại. Điểm khác biệt là sắp xếp nhanh trong quá trình phân chia bài toán con có thêm một bước xử lý, chia hai nhóm dữ liệu thành một nhóm lớn và một nhóm nhỏ, như vậy khi trộn cuối cùng không cần so sánh lại như sắp xếp trộn. Nhưng cũng chính vì vậy, tính không xác định trong phân chia làm cho độ phức tạp thời gian của sắp xếp nhanh không ổn định.

Ý tưởng cơ bản của sắp xếp nhanh: thông qua một lần sắp xếp, chia chuỗi cần sắp xếp thành hai phần độc lập, trong đó tất cả phần tử của một phần đều nhỏ hơn các phần tử của phần kia, sau đó tiếp tục sắp xếp các chuỗi con này, để đạt được toàn bộ chuỗi có thứ tự.

### Các bước thuật toán

Sắp xếp nhanh sử dụng chiến lược [chia để trị](https://zh.wikipedia.org/wiki/分治法) (Divide and conquer) để chia một chuỗi thành 2 chuỗi con nhỏ hơn và lớn hơn, sau đó đệ quy sắp xếp hai chuỗi con. Mô tả thuật toán cụ thể như sau:

1. **Chọn phần tử trục (Pivot)**: Chọn một phần tử từ mảng làm trục. Để tránh trường hợp xấu nhất, thường chọn ngẫu nhiên.
2. **Phân vùng (Partition)**: Sắp xếp lại chuỗi, đặt tất cả phần tử nhỏ hơn giá trị trục trước trục, tất cả phần tử lớn hơn đứng sau trục (phần tử bằng nhau có thể ở phía nào cũng được). Sau thao tác này, trục sẽ ở vị trí giữa của chuỗi.
3. **Đệ quy (Recurse)**: Đệ quy sắp xếp nhanh chuỗi con các phần tử nhỏ hơn giá trị trục và chuỗi con các phần tử lớn hơn giá trị trục.

**Về hiệu suất, đây cũng là điểm khác biệt then chốt so với sắp xếp trộn:**

- **Trường hợp trung bình và tốt nhất:** Độ phức tạp thời gian là $O(nlogn)$. Điều này xảy ra khi mỗi lần phân vùng đều chia mảng thành hai nửa bằng nhau.
- **Trường hợp xấu nhất:** Độ phức tạp thời gian sẽ giảm xuống $O(n^2)$. Điều này xảy ra khi mỗi lần trục chúng ta chọn là giá trị nhỏ nhất hoặc lớn nhất của mảng hiện tại, chẳng hạn đối với một mảng đã được sắp xếp, mỗi lần chọn phần tử đầu tiên làm trục, điều này sẽ dẫn đến phân vùng cực kỳ mất cân bằng, thuật toán thoái hóa thành sắp xếp nổi bọt. Đó là lý do tại sao **chọn trục ngẫu nhiên** rất quan trọng.

### Minh họa thuật toán

![RandomQuickSort](/images/github/javaguide/cs-basics/sorting-algorithms/random_quick_sort.gif)

### Triển khai code

```java
import java.util.concurrent.ThreadLocalRandom;

class Solution {
    public int[] sortArray(int[] a) {
        quick(a, 0, a.length - 1);
        return a;
    }

    // 快速排序的核心递归函数
    void quick(int[] a, int left, int right) {
        if (left >= right) { // 递归终止条件：区间只有一个或没有元素
            return;
        }
        int p = partition(a, left, right); // 分区操作，返回分区点索引
        quick(a, left, p - 1); // 对左侧子数组递归排序
        quick(a, p + 1, right); // 对右侧子数组递归排序
    }

    // 分区函数：将数组分为两部分，小于基准值的在左，大于基准值的在右
    int partition(int[] a, int left, int right) {
        // 随机选择一个基准点，避免最坏情况（如数组接近有序）
        int idx = ThreadLocalRandom.current().nextInt(right - left + 1) + left;
        swap(a, left, idx); // 将基准点放在数组的最左端
        int pv = a[left]; // 基准值
        int i = left + 1; // 左指针，指向当前需要检查的元素
        int j = right; // 右指针，从右往左寻找比基准值小的元素

        while (i <= j) {
            // 左指针向右移动，直到找到一个大于等于基准值的元素
            while (i <= j && a[i] < pv) {
                i++;
            }
            // 右指针向左移动，直到找到一个小于等于基准值的元素
            while (i <= j && a[j] > pv) {
                j--;
            }
            // 如果左指针尚未越过右指针，交换两个不符合位置的元素
            if (i <= j) {
                swap(a, i, j);
                i++;
                j--;
            }
        }
        // 将基准值放到分区点位置，使得基准值左侧小于它，右侧大于它
        swap(a, j, left);
        return j;
    }

    // 交换数组中两个元素的位置
    void swap(int[] a, int i, int j) {
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
}
```

### Phân tích thuật toán

- **Tính ổn định**: Không ổn định
- **Độ phức tạp thời gian**: Tốt nhất: $O(nlogn)$, Xấu nhất: $O(n^2)$, Trung bình: $O(nlogn)$
- **Độ phức tạp không gian**: $O(logn)$

## Sắp xếp đống (Heap Sort)

Sắp xếp đống là một thuật toán sắp xếp được thiết kế bằng cách sử dụng cấu trúc dữ liệu heap. Heap là cấu trúc gần giống cây nhị phân hoàn chỉnh, đồng thời thỏa mãn **tính chất của heap**: **giá trị của node con luôn nhỏ hơn (hoặc lớn hơn) node cha của nó**.

### Các bước thuật toán

1. Xây dựng chuỗi ban đầu cần sắp xếp $(R_1, R_2, \dots, R_n)$ thành max-heap, heap này là vùng không có thứ tự ban đầu;
2. Hoán đổi phần tử đỉnh heap $R_1$ với phần tử cuối cùng $R_n$, lúc này thu được vùng không có thứ tự mới $(R_1, R_2, \dots, R_{n-1})$ và vùng có thứ tự mới $R_n$, và thỏa mãn $R_i \leqslant R_n (i \in 1, 2,\dots, n-1)$;
3. Vì sau khi hoán đổi, đỉnh heap mới $R_1$ có thể vi phạm tính chất của heap, nên cần điều chỉnh vùng không có thứ tự hiện tại $(R_1, R_2, \dots, R_{n-1})$ thành heap mới, sau đó lại hoán đổi $R_1$ với phần tử cuối cùng của vùng không có thứ tự, thu được vùng không có thứ tự mới $(R_1, R_2, \dots, R_{n-2})$ và vùng có thứ tự mới $(R_{n-1}, R_n)$. Tiếp tục lặp lại quá trình này cho đến khi số phần tử trong vùng có thứ tự là $n-1$, thì toàn bộ quá trình sắp xếp hoàn thành.

### Minh họa thuật toán

![HeapSort](/images/github/javaguide/cs-basics/sorting-algorithms/heap_sort.gif)

### Triển khai code

```java
// Global variable that records the length of an array;
static int heapLen;

/**
 * Swap the two elements of an array
 * @param arr
 * @param i
 * @param j
 */
private static void swap(int[] arr, int i, int j) {
    int tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

/**
 * Build Max Heap
 * @param arr
 */
private static void buildMaxHeap(int[] arr) {
    for (int i = arr.length / 2 - 1; i >= 0; i--) {
        heapify(arr, i);
    }
}

/**
 * Adjust it to the maximum heap
 * @param arr
 * @param i
 */
private static void heapify(int[] arr, int i) {
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    int largest = i;
    if (right < heapLen && arr[right] > arr[largest]) {
        largest = right;
    }
    if (left < heapLen && arr[left] > arr[largest]) {
        largest = left;
    }
    if (largest != i) {
        swap(arr, largest, i);
        heapify(arr, largest);
    }
}

/**
 * Heap Sort
 * @param arr
 * @return
 */
public static int[] heapSort(int[] arr) {
    // index at the end of the heap
    heapLen = arr.length;
    // build MaxHeap
    buildMaxHeap(arr);
    for (int i = arr.length - 1; i > 0; i--) {
        // Move the top of the heap to the tail of the heap in turn
        swap(arr, 0, i);
        heapLen -= 1;
        heapify(arr, 0);
    }
    return arr;
}
```

### Phân tích thuật toán

- **Tính ổn định**: Không ổn định
- **Độ phức tạp thời gian**: Tốt nhất: $O(nlogn)$, Xấu nhất: $O(nlogn)$, Trung bình: $O(nlogn)$
- **Độ phức tạp không gian**: $O(1)$

## Sắp xếp đếm (Counting Sort)

Điểm cốt lõi của sắp xếp đếm là chuyển đổi giá trị dữ liệu đầu vào thành khóa lưu trữ trong không gian mảng bổ sung. Là một loại sắp xếp có độ phức tạp thời gian tuyến tính, **sắp xếp đếm yêu cầu dữ liệu đầu vào phải là số nguyên có phạm vi xác định**.

Sắp xếp đếm (Counting sort) là một thuật toán sắp xếp ổn định. Sắp xếp đếm sử dụng một mảng bổ sung `C`, trong đó phần tử thứ `i` là số lượng phần tử trong mảng cần sắp xếp `A` có giá trị bằng `i`. Sau đó dựa trên mảng `C` để đặt các phần tử trong `A` vào vị trí chính xác. **Nó chỉ có thể sắp xếp số nguyên**.

### Các bước thuật toán

1. Tìm giá trị lớn nhất `max` và nhỏ nhất `min` trong mảng;
2. Tạo một mảng mới `C` có độ dài `max-min+1`, giá trị mặc định của các phần tử là 0;
3. Duyệt phần tử `A[i]` trong mảng gốc `A`, dùng `A[i] - min` làm chỉ số của mảng `C`, dùng số lần xuất hiện của giá trị `A[i]` trong `A` làm giá trị của `C[A[i] - min]`;
4. Biến đổi mảng `C`, **giá trị phần tử mới là tổng của phần tử đó và phần tử trước nó**, tức là khi `i>1` thì `C[i] = C[i] + C[i-1]`;
5. Tạo mảng kết quả `R`, có độ dài bằng mảng gốc.
6. Duyệt **từ sau ra trước** các phần tử `A[i]` trong mảng gốc `A`, dùng `A[i]` trừ đi giá trị nhỏ nhất `min` làm chỉ số, tìm giá trị tương ứng `C[A[i] - min]` trong mảng đếm `C`, `C[A[i] - min] - 1` chính là vị trí của `A[i]` trong mảng kết quả `R`, sau khi thực hiện các thao tác trên, giảm `count[A[i] - min]` đi 1.

### Minh họa thuật toán

![CountingSort](/images/github/javaguide/cs-basics/sorting-algorithms/counting_sort.gif)

### Triển khai code

```java
/**
 * Gets the maximum and minimum values in the array
 *
 * @param arr
 * @return
 */
private static int[] getMinAndMax(int[] arr) {
    int maxValue = arr[0];
    int minValue = arr[0];
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] > maxValue) {
            maxValue = arr[i];
        } else if (arr[i] < minValue) {
            minValue = arr[i];
        }
    }
    return new int[] { minValue, maxValue };
}

/**
 * Counting Sort
 *
 * @param arr
 * @return
 */
public static int[] countingSort(int[] arr) {
    if (arr.length < 2) {
        return arr;
    }
    int[] extremum = getMinAndMax(arr);
    int minValue = extremum[0];
    int maxValue = extremum[1];
    int[] countArr = new int[maxValue - minValue + 1];
    int[] result = new int[arr.length];

    for (int i = 0; i < arr.length; i++) {
        countArr[arr[i] - minValue] += 1;
    }
    for (int i = 1; i < countArr.length; i++) {
        countArr[i] += countArr[i - 1];
    }
    for (int i = arr.length - 1; i >= 0; i--) {
        int idx = countArr[arr[i] - minValue] - 1;
        result[idx] = arr[i];
        countArr[arr[i] - minValue] -= 1;
    }
    return result;
}
```

### Phân tích thuật toán

Khi các phần tử đầu vào là `n` số nguyên từ `0` đến `k`, thời gian chạy của nó là $O(n+k)$. Sắp xếp đếm không phải là sắp xếp so sánh, tốc độ sắp xếp nhanh hơn bất kỳ thuật toán sắp xếp so sánh nào. Vì độ dài của mảng đếm `C` phụ thuộc vào phạm vi giá trị trong mảng cần sắp xếp (bằng **hiệu giữa giá trị lớn nhất và nhỏ nhất của mảng cộng với 1**), điều này làm cho sắp xếp đếm cần nhiều bộ nhớ bổ sung cho các mảng có phạm vi giá trị rất lớn.

- **Tính ổn định**: Ổn định
- **Độ phức tạp thời gian**: Tốt nhất: $O(n+k)$, Xấu nhất: $O(n+k)$, Trung bình: $O(n+k)$
- **Độ phức tạp không gian**: $O(k)$

## Sắp xếp thùng (Bucket Sort)

Sắp xếp thùng là phiên bản nâng cấp của sắp xếp đếm. Nó tận dụng mối quan hệ ánh xạ của hàm, điểm mấu chốt của hiệu quả hay không nằm ở việc xác định hàm ánh xạ này. Để sắp xếp thùng hiệu quả hơn, chúng ta cần làm được hai điểm sau:

1. Trong điều kiện không gian bổ sung đủ, tăng số lượng thùng càng nhiều càng tốt
2. Hàm ánh xạ được sử dụng có thể phân phối đều N dữ liệu đầu vào vào K thùng

Nguyên lý hoạt động của sắp xếp thùng: giả sử dữ liệu đầu vào tuân theo phân phối đồng đều, phân chia dữ liệu vào số lượng thùng hữu hạn, mỗi thùng sau đó được sắp xếp riêng (có thể dùng thuật toán sắp xếp khác hoặc tiếp tục dùng sắp xếp thùng đệ quy).

### Các bước thuật toán

1. Thiết lập một BucketSize, biểu thị số lượng giá trị khác nhau mà mỗi thùng có thể chứa;
2. Duyệt dữ liệu đầu vào và ánh xạ từng dữ liệu vào thùng tương ứng;
3. Sắp xếp mỗi thùng không rỗng, có thể dùng phương pháp sắp xếp khác hoặc đệ quy dùng sắp xếp thùng;
4. Nối dữ liệu đã sắp xếp từ các thùng không rỗng lại.

### Minh họa thuật toán

![BucketSort](/images/github/javaguide/cs-basics/sorting-algorithms/bucket_sort.gif)

### Triển khai code

```java
/**
 * Gets the maximum and minimum values in the array
 * @param arr
 * @return
 */
private static int[] getMinAndMax(List<Integer> arr) {
    int maxValue = arr.get(0);
    int minValue = arr.get(0);
    for (int i : arr) {
        if (i > maxValue) {
            maxValue = i;
        } else if (i < minValue) {
            minValue = i;
        }
    }
    return new int[] { minValue, maxValue };
}

/**
 * Bucket Sort
 * @param arr
 * @return
 */
public static List<Integer> bucketSort(List<Integer> arr, int bucket_size) {
    if (arr.size() < 2 || bucket_size == 0) {
        return arr;
    }
    int[] extremum = getMinAndMax(arr);
    int minValue = extremum[0];
    int maxValue = extremum[1];
    int bucket_cnt = (maxValue - minValue) / bucket_size + 1;
    List<List<Integer>> buckets = new ArrayList<>();
    for (int i = 0; i < bucket_cnt; i++) {
        buckets.add(new ArrayList<Integer>());
    }
    for (int element : arr) {
        int idx = (element - minValue) / bucket_size;
        buckets.get(idx).add(element);
    }
    for (int i = 0; i < buckets.size(); i++) {
        if (buckets.get(i).size() > 1) {
            buckets.set(i, sort(buckets.get(i), bucket_size / 2));
        }
    }
    ArrayList<Integer> result = new ArrayList<>();
    for (List<Integer> bucket : buckets) {
        for (int element : bucket) {
            result.add(element);
        }
    }
    return result;
}
```

### Phân tích thuật toán

- **Tính ổn định**: Ổn định
- **Độ phức tạp thời gian**: Tốt nhất: $O(n+k)$, Xấu nhất: $O(n^2)$, Trung bình: $O(n+k)$
- **Độ phức tạp không gian**: $O(n+k)$

## Sắp xếp cơ số (Radix Sort)

Sắp xếp cơ số cũng là thuật toán sắp xếp không so sánh, sắp xếp từng chữ số trong mỗi phần tử, bắt đầu từ chữ số thấp nhất, độ phức tạp là $O(n×k)$, $n$ là độ dài mảng, $k$ là số chữ số lớn nhất của phần tử trong mảng;

Sắp xếp cơ số sắp xếp theo chữ số thấp trước rồi thu thập; sau đó sắp xếp theo chữ số cao rồi thu thập lại; cứ thế cho đến chữ số cao nhất. Đôi khi một số thuộc tính có thứ tự ưu tiên, sắp xếp theo ưu tiên thấp trước, sau đó sắp xếp theo ưu tiên cao. Thứ tự cuối cùng là ưu tiên cao hơn đứng trước, khi ưu tiên cao bằng nhau thì ưu tiên thấp cao hơn đứng trước. Sắp xếp cơ số dựa trên sắp xếp và thu thập riêng lẻ, nên ổn định.

### Các bước thuật toán

1. Lấy số lớn nhất trong mảng và lấy số chữ số của nó, đó là số lần lặp $N$ (ví dụ: giá trị lớn nhất trong mảng là 1000, thì $N=4$);
2. `A` là mảng gốc, bắt đầu từ chữ số thấp nhất, lấy từng vị trí tạo thành mảng `radix`;
3. Thực hiện sắp xếp đếm cho `radix` (tận dụng đặc điểm sắp xếp đếm phù hợp với số phạm vi nhỏ);
4. Gán lần lượt `radix` cho mảng gốc;
5. Lặp lại bước 2~4 $N$ lần

### Minh họa thuật toán

![RadixSort](/images/github/javaguide/cs-basics/sorting-algorithms/radix_sort.gif)

### Triển khai code

```java
/**
 * Radix Sort
 *
 * @param arr
 * @return
 */
public static int[] radixSort(int[] arr) {
    if (arr.length < 2) {
        return arr;
    }
    int N = 1;
    int maxValue = arr[0];
    for (int element : arr) {
        if (element > maxValue) {
            maxValue = element;
        }
    }
    while (maxValue / 10 != 0) {
        maxValue = maxValue / 10;
        N += 1;
    }
    for (int i = 0; i < N; i++) {
        List<List<Integer>> radix = new ArrayList<>();
        for (int k = 0; k < 10; k++) {
            radix.add(new ArrayList<Integer>());
        }
        for (int element : arr) {
            int idx = (element / (int) Math.pow(10, i)) % 10;
            radix.get(idx).add(element);
        }
        int idx = 0;
        for (List<Integer> l : radix) {
            for (int n : l) {
                arr[idx++] = n;
            }
        }
    }
    return arr;
}
```

### Phân tích thuật toán

- **Tính ổn định**: Ổn định
- **Độ phức tạp thời gian**: Tốt nhất: $O(n×k)$, Xấu nhất: $O(n×k)$, Trung bình: $O(n×k)$
- **Độ phức tạp không gian**: $O(n+k)$

**Sắp xếp cơ số vs Sắp xếp đếm vs Sắp xếp thùng**

Ba thuật toán sắp xếp này đều sử dụng khái niệm thùng, nhưng cách sử dụng thùng có sự khác biệt rõ rệt:

- Sắp xếp cơ số: phân bổ thùng dựa trên từng chữ số của giá trị khóa
- Sắp xếp đếm: mỗi thùng chỉ lưu trữ một giá trị khóa duy nhất
- Sắp xếp thùng: mỗi thùng lưu trữ một phạm vi giá trị nhất định

## Tài liệu tham khảo

- <https://www.cnblogs.com/guoyaohua/p/8600214.html>
- <https://en.wikipedia.org/wiki/Sorting_algorithm>
- <https://sort.hust.cc/>

<!-- @include: @article-footer.snippet.md -->
