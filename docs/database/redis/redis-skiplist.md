---
title: Tại sao Redis dùng Skip List để triển khai Sorted Set
description: Giải thích chuyên sâu tại sao Sorted Set Zset của Redis chọn Skip List thay vì Red-Black Tree, B+ Tree, phân tích chi tiết nguyên lý cấu trúc dữ liệu Skip List, phân tích độ phức tạp thời gian và triển khai mã nguồn Redis.
category: Cơ sở dữ liệu
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis跳表,SkipList,有序集合,Zset,跳表原理,平衡树对比,Redis数据结构
---

## Lời mở đầu

Trong những năm gần đây, các cuộc phỏng vấn về Redis thường đề cập đến thiết kế nội bộ của các cấu trúc dữ liệu phổ biến, trong đó có một câu hỏi phỏng vấn khá thú vị: "Tại sao Sorted Set của Redis sử dụng Skip List ở tầng dưới, mà không dùng Balanced Tree, Red-Black Tree hay B+ Tree?".

Bài viết này lấy câu hỏi phỏng vấn thường gặp tại các công ty lớn này làm điểm khởi đầu, đưa mọi người tìm hiểu chi tiết về cấu trúc dữ liệu Skip List.

Tổng thể bài viết được thể hiện như hình dưới đây, tác giả sẽ dẫn dắt từ cách sử dụng cơ bản của Sorted Set đến phân tích và triển khai mã nguồn của Skip List, giúp bạn hiểu và nắm vững sâu hơn về triển khai Skip List ở tầng dưới của Sorted Set trong Redis.

![](/images/javaguide/database/redis/skiplist/202401222005468.png)

## Ứng dụng của Skip List trong Redis

Ở đây chúng ta cần tìm hiểu trước về cấu trúc dữ liệu Sorted Set mà Redis sử dụng Skip List. Redis có một cấu trúc dữ liệu khá phổ biến gọi là **Sorted Set (tập hợp có thứ tự, viết tắt là zset)**, như tên gọi nó là một tập hợp có thể đảm bảo thứ tự và các phần tử là duy nhất, vì vậy nó thường được dùng cho bảng xếp hạng và các tình huống cần sắp xếp thống kê.

Ở đây chúng ta dùng dòng lệnh để demo việc triển khai bảng xếp hạng. Tác giả lần lượt nhập 3 người dùng: **xiaoming**, **xiaohong**, **xiaowang**, với **score** lần lượt là 60, 80, 60, cuối cùng được xếp hạng giảm dần theo điểm.

```bash

127.0.0.1:6379> zadd rankList 60 xiaoming
(integer) 1
127.0.0.1:6379> zadd rankList 80 xiaohong
(integer) 1
127.0.0.1:6379> zadd rankList 60 xiaowang
(integer) 1

# 返回有序集中指定区间内的成员，通过索引，分数从高到低
127.0.0.1:6379> ZREVRANGE rankList 0 100 WITHSCORES
1) "xiaohong"
2) "80"
3) "xiaowang"
4) "60"
5) "xiaoming"
6) "60"
```

Lúc này chúng ta dùng lệnh `object` để xem cấu trúc dữ liệu của zset, có thể thấy Sorted Set hiện tại vẫn đang lưu trữ bằng **ziplist (danh sách nén)**.

```bash
127.0.0.1:6379> object encoding rankList
"ziplist"
```

Vì nhà thiết kế xem xét rằng dữ liệu Redis được lưu trong bộ nhớ, để tiết kiệm bộ nhớ quý giá, khi số phần tử trong Sorted Set nhỏ hơn 64 byte và số lượng phần tử nhỏ hơn 128, sẽ dùng ziplist. Giá trị mặc định của ngưỡng này đến từ hai cấu hình dưới đây.

```bash
zset-max-ziplist-value 64
zset-max-ziplist-entries 128
```

Khi một phần tử nào đó trong Sorted Set vượt quá một trong hai ngưỡng này, nó sẽ chuyển thành **skiplist** (thực tế là dict+skiplist, còn sử dụng thêm dictionary để cải thiện hiệu quả lấy phần tử cụ thể).

Hãy thêm một phần tử lớn hơn 64 byte, có thể thấy bộ lưu trữ nội bộ của Sorted Set đã chuyển sang skiplist.

```bash
127.0.0.1:6379> zadd rankList 90 yigemingzihuichaoguo64zijiedeyonghumingchengyongyuceshitiaobiaodeshijiyunyong
(integer) 1

# 超过阈值，转为跳表
127.0.0.1:6379> object encoding rankList
"skiplist"
```

Tức là ZSet có hai triển khai khác nhau, lần lượt là ziplist và skiplist, quy tắc cụ thể dùng cấu trúc nào để lưu như sau:

- Khi đối tượng Sorted Set đồng thời thỏa mãn hai điều kiện sau, dùng ziplist:
  1. Số cặp key-value được lưu bởi ZSet ít hơn 128;
  2. Độ dài mỗi phần tử nhỏ hơn 64 byte.
- Nếu không thỏa mãn cả hai điều kiện trên, dùng skiplist.

## Tự viết một Skip List

Để trả lời tốt hơn câu hỏi trên cũng như hiểu và nắm vững Skip List tốt hơn, ở đây có thể giúp độc giả hiểu cấu trúc dữ liệu Skip List thông qua việc tự viết một Skip List đơn giản.

Chúng ta đều biết Linked List có thứ tự có độ phức tạp thời gian trung bình là **O(n)** tức tăng tuyến tính cho thêm, truy vấn, xóa, nên khi số node đạt đến một khối lượng nhất định thì hiệu suất sẽ rất kém. Còn Skip List, chúng ta hoàn toàn có thể hiểu là trên cơ sở linked list gốc, xây dựng nhiều cấp chỉ mục, thông qua chỉ mục nhiều cấp để định vị và kiểm tra, làm cho độ phức tạp thời gian của thêm, xóa, sửa, tìm kiếm trở thành **O(log n)**.

Có thể điều này nghe còn khá trừu tượng, hãy lấy một ví dụ, với skip list dưới đây làm ví dụ, linked list gốc của nó lưu theo thứ tự 1-10, có 2 cấp chỉ mục, số chỉ mục ở mỗi cấp đều là một nửa số phần tử ở tầng dưới.

![](/images/javaguide/database/redis/skiplist/202401222005436.png)

Giả sử chúng ta cần tìm phần tử 6, quy trình hoạt động như sau:

1. Bắt đầu từ chỉ mục cấp 2, đến node 4.
2. Xem node kế tiếp của 4, là chỉ mục cấp 2 của 8, giá trị này lớn hơn 6, nghĩa là tất cả chỉ mục sau đó trong chỉ mục cấp 2 đều lớn hơn 6, không cần tiếp tục tìm kiếm về phía sau, chúng ta tìm kiếm xuống dưới.
3. Đến chỉ mục cấp 1 của 4, so sánh node kế tiếp là 6, tìm kiếm kết thúc.

So với linked list có thứ tự gốc cần 6 lần, Skip List của chúng ta thông qua việc xây dựng chỉ mục nhiều cấp, chỉ cần hai lần là trực tiếp định vị được phần tử mục tiêu, độ phức tạp tìm kiếm được tối ưu trực tiếp thành **O(log n)**.

![](/images/javaguide/database/redis/skiplist/202401222005524.png)

Thêm phần tử cũng tương tự, giả sử chúng ta cần thêm phần tử 7 vào tập hợp có thứ tự này, chúng ta cần tìm qua skip list **giá trị lớn nhất nhỏ hơn phần tử 7**, tức là vị trí của phần tử 6 trong hình dưới, chèn nó vào sau phần tử 6, cho chỉ mục của phần tử 6 trỏ đến node mới chèn 7, quy trình hoạt động như sau:

1. Từ chỉ mục cấp 2 định vị được chỉ mục của phần tử 4.
2. Xem chỉ mục kế tiếp của chỉ mục 4 là 8, chỉ mục tiến về phía trước.
3. Đến chỉ mục cấp 1, thấy chỉ mục kế tiếp của chỉ mục 4 là 6, nhỏ hơn phần tử chèn 7, con trỏ tiến đến vị trí chỉ mục 6.
4. Tiếp tục so sánh node kế tiếp của 6 là chỉ mục 8, lớn hơn phần tử 7, chỉ mục tiếp tục xuống dưới.
5. Cuối cùng chúng ta đến node gốc của 6, thấy node kế tiếp là 7, con trỏ không có không gian để tiếp tục xuống dưới, từ đây chúng ta biết phần tử 6 là giá trị lớn nhất nhỏ hơn phần tử chèn 7, vì vậy chèn phần tử 7.

![](/images/javaguide/database/redis/skiplist/202401222005480.png)

Ở đây chúng ta lại đối mặt với một vấn đề, chúng ta có cần xây dựng chỉ mục cho phần tử 7 không, chiều cao bao nhiêu là phù hợp?

Chúng ta đề cập ở trên, trong điều kiện lý tưởng mỗi cấp chỉ mục là một nửa số phần tử của cấp dưới, giả sử tổng cộng có 16 phần tử, số phần tử chỉ mục ở các cấp tương ứng nên là:

```bash
1. Chỉ mục cấp 1:16/2=8
2. Chỉ mục cấp 2:8/2 =4
3. Chỉ mục cấp 3:4/2=2
```

Từ đây dùng quy nạp toán học có thể biết:

```bash
1. Chỉ mục cấp 1:16/2=16/2^1=8
2. Chỉ mục cấp 2:8/2 => 16/2^2 =4
3. Chỉ mục cấp 3:4/2=>16/2^3=2
```

Giả sử số phần tử là n, thì công thức tính số phần tử r trong chỉ mục cấp k là:

```bash
r=n/2^k
```

Tương tự chúng ta suy ra chiều cao tối đa của chỉ mục, thông thường số phần tử của chỉ mục cấp cao nhất là 2, đặt tổng số phần tử là n, chiều cao chỉ mục là h, thay vào công thức trên có thể được:

```bash
2= n/2^h
=> 2*2^h=n
=> 2^(h+1)=n
=> h+1=log2^n
=> h=log2^n -1
```

Và Redis là cơ sở dữ liệu bộ nhớ, giả sử số phần tử tối đa là **65536**, thay **65536** vào công thức trên có thể biết chiều cao tối đa là 16. Vì vậy chúng ta khuyến nghị chiều cao chỉ mục được xây dựng sau khi thêm một phần tử không vượt quá 16.

Vì chúng ta yêu cầu đảm bảo mỗi chỉ mục cấp trên là một nửa chỉ mục cấp dưới, khi triển khai thuật toán tạo chiều cao, chúng ta có thể thiết kế như sau:

1. Tính chiều cao của skip list bắt đầu từ linked list gốc, tức là theo mặc định chiều cao của phần tử được chèn là 1, nghĩa là không có chỉ mục, chỉ có node phần tử.
2. Thiết kế một phương thức để tạo chiều cao chỉ mục level cho phần tử chèn.
3. Thực hiện một lần tính ngẫu nhiên, phạm vi giá trị ngẫu nhiên là từ 0 đến 1.
4. Nếu số ngẫu nhiên lớn hơn 0.5 thì thêm một cấp chỉ mục cho phần tử hiện tại, từ đó chúng ta đảm bảo xác suất tạo chỉ mục cấp 1 là **50%**, điều này cũng đảm bảo trong điều kiện lý tưởng chỉ có một nửa phần tử tạo chỉ mục cấp 1.
5. Tương tự mỗi lần thuật toán ngẫu nhiên tiếp theo cho giá trị lớn hơn 0.5, chiều cao chỉ mục của chúng ta tăng 1, như vậy có thể đảm bảo xác suất tạo chỉ mục cấp 2 cho node là **25%**, cấp 3 là **12.5%**……

Quay lại phía trên, sau khi chèn 7, chúng ta dùng thuật toán ngẫu nhiên được 2, tức là cần xây dựng chỉ mục cấp 1 cho nó:

![](/images/javaguide/database/redis/skiplist/202401222005505.png)

Cuối cùng hãy nói về xóa, giả sử ở đây chúng ta muốn xóa phần tử 10, chúng ta phải định vị **ở mỗi cấp** giá trị lớn nhất nhỏ hơn 10 của node hiện tại, các bước thực thi là:

1. Chỉ mục cấp 2, node kế tiếp của 4 là 8, con trỏ tiến.
2. Chỉ mục 8 không có node kế tiếp, cấp đó không có phần tử cần xóa, con trỏ trực tiếp xuống dưới.
3. Chỉ mục cấp 1, node kế tiếp của 8 là 10, nghĩa là chỉ mục cấp 1 của 8 khi xóa cần ngắt kết nối với chỉ mục cấp 1 của 10, xóa 10.
4. Sau khi hoàn thành định vị chỉ mục cấp 1, con trỏ xuống dưới, node kế tiếp là 9, con trỏ tiến.
5. Node kế tiếp của 9 là 10, tương tự cần cho nó trỏ đến null, xóa 10.

![](/images/javaguide/database/redis/skiplist/202401222005503.png)

### Định nghĩa template

Sau khi có ý tưởng tổng thể, chúng ta có thể bắt đầu triển khai một skip list, trước tiên định nghĩa **Node** trong skip list. Từ phần demo ở trên có thể thấy mỗi **Node** chứa các phần tử sau:

1. Giá trị **value** được lưu trữ.
2. Địa chỉ của node kế tiếp.
3. Chỉ mục nhiều cấp.

Để thuận tiện quản lý địa chỉ node kế tiếp và địa chỉ phần tử mà chỉ mục nhiều cấp trỏ đến trong **Node**, tác giả thiết lập một mảng **forwards** trong **Node**, dùng để ghi lại node kế tiếp của linked list gốc và hướng node kế tiếp của chỉ mục nhiều cấp.

Lấy hình dưới làm ví dụ, độ dài mảng **forwards** của chúng ta là 5, trong đó **chỉ mục 0** ghi lại địa chỉ node kế tiếp của linked list gốc, còn các cái còn lại từ dưới lên trên biểu thị hướng node kế tiếp từ chỉ mục cấp 1 đến cấp 4.

![](/images/javaguide/database/redis/skiplist/202401222005347.png)

Vì vậy chúng ta có định nghĩa code như sau, có thể thấy tác giả thiết lập độ dài mảng cố định là 16 **(chiều cao tối đa khuyến nghị theo tính toán ở trên là 16)**, mặc định **data** là -1, chiều cao tối đa node **maxLevel** được khởi tạo là 1, chú ý giá trị của **maxLevel** này biểu thị tổng chiều cao của linked list gốc cộng với chỉ mục.

```java
/**
 * 跳表索引最大高度为16
 */
private static final int MAX_LEVEL = 16;

class Node {
    private int data = -1;
    private Node[] forwards = new Node[MAX_LEVEL];
    private int maxLevel = 0;

}
```

### Thêm phần tử

Sau khi định nghĩa node, trước tiên hãy triển khai việc thêm phần tử. Khi thêm phần tử, trước tiên là thiết lập **data**, chúng ta trực tiếp gán **value** được truyền vào cho **data**.

Sau đó là thiết lập chiều cao **maxLevel**, chúng ta đã cung cấp ý tưởng ở trên, chiều cao mặc định là 1, tức là chỉ có một node linked list gốc, thông qua thuật toán ngẫu nhiên mỗi lần lớn hơn 0.5 thì chiều cao chỉ mục tăng 1, từ đó chúng ta có được thuật toán tính chiều cao `randomLevel()`:

```java
/**
 * 理论来讲，一级索引中元素个数应该占原始数据的 50%，二级索引中元素个数占 25%，三级索引12.5% ，一直到最顶层。
 * 因为这里每一层的晋升概率是 50%。对于每一个新插入的节点，都需要调用 randomLevel 生成一个合理的层数。
 * 该 randomLevel 方法会随机生成 1~MAX_LEVEL 之间的数，且 ：
 * 50%的概率返回 1
 * 25%的概率返回 2
 *  12.5%的概率返回 3 ...
 * @return
 */
private int randomLevel() {
    int level = 1;
    while (Math.random() > PROB && level < MAX_LEVEL) {
        ++level;
    }
    return level;
}
```

Sau đó thiết lập địa chỉ node kế tiếp của **Node** và chỉ mục **Node** cần chèn, bước này hơi phức tạp hơn một chút, giả sử chiều cao của node hiện tại là 4, tức là 1 node cộng 3 chỉ mục, vì vậy chúng ta tạo một mảng **maxOfMinArr** có độ dài 4, duyệt giá trị lớn nhất nhỏ hơn **value** hiện tại trong các node chỉ mục ở mỗi cấp.

Giả sử **value** chúng ta muốn chèn là 5, kết quả tìm kiếm mảng là node tiền nhiệm của node hiện tại và node tiền nhiệm của chỉ mục cấp 1, cấp 2 đều là 4, chỉ mục cấp 3 là null.

![](/images/javaguide/database/redis/skiplist/202401222005299.png)

Sau đó dựa trên mảng **maxOfMinArr** định vị các node kế tiếp ở mỗi cấp, cho phần tử 5 chèn vào trỏ đến các node kế tiếp này, còn **maxOfMinArr** trỏ đến 5, kết quả như hình:

![](/images/javaguide/database/redis/skiplist/202401222005369.png)

Chuyển thành code là dạng dưới đây, có đơn giản không nào? Hãy tiếp tục:

```java
/**
 * 默认情况下的高度为1，即只有自己一个节点
 */
private int levelCount = 1;

/**
 * 跳表最底层的节点，即头节点
 */
private Node h = new Node();

public void add(int value) {
    int level = randomLevel(); // 新节点的随机高度

    Node newNode = new Node();
    newNode.data = value;
    newNode.maxLevel = level;

    // 用于记录每层前驱节点的数组
    Node[] update = new Node[level];
    for (int i = 0; i < level; i++) {
        update[i] = h;
    }

    Node p = h;
    // 关键修正：从跳表的当前最高层开始查找
    for (int i = levelCount - 1; i >= 0; i--) {
        while (p.forwards[i] != null && p.forwards[i].data < value) {
            p = p.forwards[i];
        }
        // 只记录需要更新的层的前驱节点
        if (i < level) {
            update[i] = p;
        }
    }

    // 插入新节点
    for (int i = 0; i < level; i++) {
        newNode.forwards[i] = update[i].forwards[i];
        update[i].forwards[i] = newNode;
    }

    // 更新跳表的总高度
    if (levelCount < level) {
        levelCount = level;
    }
}
```

### Tìm kiếm phần tử

Logic tìm kiếm khá đơn giản, bắt đầu từ chỉ mục cấp cao nhất của skip list định vị giá trị lớn nhất nhỏ hơn value cần tìm, lấy hình dưới làm ví dụ, chúng ta muốn tìm node 8:

![](/images/javaguide/database/redis/skiplist/202401222005323.png)

- **Bắt đầu từ cấp cao nhất (chỉ mục cấp 3)**: Con trỏ tìm kiếm `p` bắt đầu từ head node. Ở chỉ mục cấp 3, `forwards[2]` (giả sử cấp cao nhất là 3, chỉ mục bắt đầu từ 0) của `p` trỏ đến node `5`. Vì `5 < 8`, con trỏ `p` di chuyển sang phải đến node `5`. `forwards[2]` của node `5` ở chỉ mục cấp 3 là `null` (hoặc trỏ đến một node lớn hơn `8`, không vẽ trong hình). Tìm kiếm về phía phải ở cấp hiện tại kết thúc, con trỏ `p` giữ nguyên tại node `5`, **di chuyển xuống cấp chỉ mục 2**.
- **Ở chỉ mục cấp 2**: Con trỏ hiện tại `p` là node `5`. `forwards[1]` của `p` trỏ đến node `8`. Vì `8` không nhỏ hơn `8` (tức `8 < 8` là `false`), tìm kiếm về phía phải ở cấp hiện tại kết thúc (`p` sẽ không di chuyển đến node `8`). Con trỏ `p` giữ nguyên tại node `5`, **di chuyển xuống chỉ mục cấp 1**.
- **Ở chỉ mục cấp 1**: Con trỏ hiện tại `p` là node `5`. `forwards[0]` của `p` trỏ đến node `5` ở tầng thấp nhất. Vì `5 < 8`, con trỏ `p` di chuyển sang phải đến node `5` ở tầng thấp nhất. Lúc này, con trỏ hiện tại `p` là node `5` ở tầng thấp nhất. `forwards[0]` của nó trỏ đến node `6` ở tầng thấp nhất. Vì `6 < 8`, con trỏ `p` di chuyển sang phải đến node `6` ở tầng thấp nhất. Con trỏ hiện tại `p` là node `6` ở tầng thấp nhất. `forwards[0]` của nó trỏ đến node `7` ở tầng thấp nhất. Vì `7 < 8`, con trỏ `p` di chuyển sang phải đến node `7` ở tầng thấp nhất. Con trỏ hiện tại `p` là node `7` ở tầng thấp nhất. `forwards[0]` của nó trỏ đến node `8` ở tầng thấp nhất. Vì `8` không nhỏ hơn `8` (tức `8 < 8` là `false`), tìm kiếm về phía phải ở cấp hiện tại kết thúc. Lúc này, vòng lặp `for` kết thúc.
- **Định vị và kiểm tra cuối cùng**: Sau khi tìm kiếm ở tất cả các cấp, con trỏ `p` cuối cùng dừng lại ở node `7` của tầng thấp nhất (chỉ mục cấp 0). Node này là node lớn nhất có giá trị nhỏ hơn giá trị mục tiêu `8` trong toàn bộ skip list. Kiểm tra **node kế tiếp** của node `7` (tức `p.forwards[0]`): `p.forwards[0]` trỏ đến node `8`. Kiểm tra `p.forwards[0].data` (tức giá trị của node `8`) có bằng giá trị mục tiêu `8` không. Điều kiện thỏa mãn (`8 == 8`), **tìm kiếm thành công, tìm thấy node `8`**.

Vì vậy triển khai code của chúng ta cũng khá giống với các bước trên, bắt đầu từ chỉ mục cấp cao nhất để tìm về phía trước, nếu không null và nhỏ hơn giá trị cần tìm thì tiếp tục tìm về phía trước, gặp node không nhỏ hơn thì tiếp tục xuống dưới, cứ lặp lại cho đến khi lấy được node lớn nhất nhỏ hơn giá trị cần tìm trong skip list hiện tại, kiểm tra node kế tiếp của nó có bằng giá trị cần tìm không:

```java
public Node get(int value) {
    Node p = h; // 从头节点开始

    // 从最高层级索引开始，逐层向下
    for (int i = levelCount - 1; i >= 0; i--) {
        // 在当前层级向右查找，直到 p.forwards[i] 为 null
        // 或者 p.forwards[i].data 大于等于目标值 value
        while (p.forwards[i] != null && p.forwards[i].data < value) {
            p = p.forwards[i]; // 向右移动
        }
        // 此时 p.forwards[i] 为 null，或者 p.forwards[i].data >= value
        // 或者 p 是当前层级中小于 value 的最大节点（如果存在这样的节点）
    }

    // 经过所有层级的查找，p 现在是原始链表（0级索引）中
    // 小于目标值 value 的最大节点（或者头节点，如果所有元素都大于等于 value）

    // 检查 p 在原始链表中的下一个节点是否是目标值
    if (p.forwards[0] != null && p.forwards[0].data == value) {
        return p.forwards[0]; // 找到了，返回该节点
    }

    return null; // 未找到
}
```

### Xóa phần tử

Cuối cùng là logic xóa, cần tìm giá trị lớn nhất nhỏ hơn node cần xóa ở mỗi cấp, giả sử chúng ta muốn xóa 10:

1. Chỉ mục cấp 3 tìm được giá trị lớn nhất nhỏ hơn 10 là 5, tiếp tục xuống dưới.
2. Chỉ mục cấp 2 bắt đầu tìm từ chỉ mục 5, thấy giá trị lớn nhất nhỏ hơn 10 là 8, tiếp tục xuống dưới.
3. Tương tự chỉ mục cấp 1 tìm được 8, tiếp tục xuống dưới.
4. Node gốc tìm thấy 9.
5. Bắt đầu từ chỉ mục cấp cao nhất, kiểm tra node kế tiếp của mỗi node nhỏ hơn 10 có phải là 10 không, nếu bằng 10 thì cho node đó trỏ đến node kế tiếp của 10, giao node 10 và chỉ mục của nó cho GC thu hồi.

![](/images/javaguide/database/redis/skiplist/202401222005350.png)

```java
/**
 * 删除
 *
 * @param value
 */
public void delete(int value) {
    Node p = h;
    //找到各级节点小于value的最大值
    Node[] updateArr = new Node[levelCount];
    for (int i = levelCount - 1; i >= 0; i--) {
        while (p.forwards[i] != null && p.forwards[i].data < value) {
            p = p.forwards[i];
        }
        updateArr[i] = p;
    }
    //查看原始层节点前驱是否等于value，若等于则说明存在要删除的值
    if (p.forwards[0] != null && p.forwards[0].data == value) {
        //从最高级索引开始查看其前驱是否等于value，若等于则将当前节点指向value节点的后继节点
        for (int i = levelCount - 1; i >= 0; i--) {
            if (updateArr[i].forwards[i] != null && updateArr[i].forwards[i].data == value) {
                updateArr[i].forwards[i] = updateArr[i].forwards[i].forwards[i];
            }
        }
    }

    //从最高级开始查看是否有一级索引为空，若为空则层级减1
    while (levelCount > 1 && h.forwards[levelCount - 1] == null) {
        levelCount--;
    }

}
```

### Code đầy đủ và kiểm tra

Code đầy đủ như sau, độc giả có thể tự tham khảo:

```java
public class SkipList {

    /**
     * 跳表索引最大高度为16
     */
    private static final int MAX_LEVEL = 16;

    /**
     * 每个节点添加一层索引高度的概率为二分之一
     */
    private static final float PROB = 0.5f;

    /**
     * 默认情况下的高度为1，即只有自己一个节点
     */
    private int levelCount = 1;

    /**
     * 跳表最底层的节点，即头节点
     */
    private Node h = new Node();

    public SkipList() {
    }

    public class Node {

        private int data = -1;
        /**
         *
         */
        private Node[] forwards = new Node[MAX_LEVEL];
        private int maxLevel = 0;

        @Override
        public String toString() {
            return "Node{"
                    + "data=" + data
                    + ", maxLevel=" + maxLevel
                    + '}';
        }
    }

    public void add(int value) {
        int level = randomLevel(); // 新节点的随机高度

        Node newNode = new Node();
        newNode.data = value;
        newNode.maxLevel = level;

        // 用于记录每层前驱节点的数组
        Node[] update = new Node[level];
        for (int i = 0; i < level; i++) {
            update[i] = h;
        }

        Node p = h;
        // 关键修正：从跳表的当前最高层开始查找
        for (int i = levelCount - 1; i >= 0; i--) {
            while (p.forwards[i] != null && p.forwards[i].data < value) {
                p = p.forwards[i];
            }
            // 只记录需要更新的层的前驱节点
            if (i < level) {
                update[i] = p;
            }
        }

        // 插入新节点
        for (int i = 0; i < level; i++) {
            newNode.forwards[i] = update[i].forwards[i];
            update[i].forwards[i] = newNode;
        }

        // 更新跳表的总高度
        if (levelCount < level) {
            levelCount = level;
        }
    }

    /**
     * 理论来讲，一级索引中元素个数应该占原始数据的 50%，二级索引中元素个数占 25%，三级索引12.5% ，一直到最顶层。
     * 因为这里每一层的晋升概率是 50%。对于每一个新插入的节点，都需要调用 randomLevel 生成一个合理的层数。 该 randomLevel
     * 方法会随机生成 1~MAX_LEVEL 之间的数，且 ： 50%的概率返回 1 25%的概率返回 2 12.5%的概率返回 3 ...
     *
     * @return
     */
    private int randomLevel() {
        int level = 1;
        while (Math.random() > PROB && level < MAX_LEVEL) {
            ++level;
        }
        return level;
    }

    public Node get(int value) {
        Node p = h;
        //找到小于value的最大值
        for (int i = levelCount - 1; i >= 0; i--) {
            while (p.forwards[i] != null && p.forwards[i].data < value) {
                p = p.forwards[i];
            }
        }
        //如果p的前驱节点等于value则直接返回
        if (p.forwards[0] != null && p.forwards[0].data == value) {
            return p.forwards[0];
        }

        return null;
    }

    /**
     * 删除
     *
     * @param value
     */
    public void delete(int value) {
        Node p = h;
        //找到各级节点小于value的最大值
        Node[] updateArr = new Node[levelCount];
        for (int i = levelCount - 1; i >= 0; i--) {
            while (p.forwards[i] != null && p.forwards[i].data < value) {
                p = p.forwards[i];
            }
            updateArr[i] = p;
        }
        //查看原始层节点前驱是否等于value，若等于则说明存在要删除的值
        if (p.forwards[0] != null && p.forwards[0].data == value) {
            //从最高级索引开始查看其前驱是否等于value，若等于则将当前节点指向value节点的后继节点
            for (int i = levelCount - 1; i >= 0; i--) {
                if (updateArr[i].forwards[i] != null && updateArr[i].forwards[i].data == value) {
                    updateArr[i].forwards[i] = updateArr[i].forwards[i].forwards[i];
                }
            }
        }

        //从最高级开始查看是否有一级索引为空，若为空则层级减1
        while (levelCount > 1 && h.forwards[levelCount - 1] == null) {
            levelCount--;
        }

    }

    public void printAll() {
        Node p = h;
        //基于最底层的非索引层进行遍历，只要后继节点不为空，则速速出当前节点，并移动到后继节点
        while (p.forwards[0] != null) {
            System.out.println(p.forwards[0]);
            p = p.forwards[0];
        }

    }
}

```

Code kiểm tra:

```java
public static void main(String[] args) {
        SkipList skipList = new SkipList();
        for (int i = 0; i < 24; i++) {
            skipList.add(i);
        }

        System.out.println("**********输出添加结果**********");
        skipList.printAll();

        SkipList.Node node = skipList.get(22);
        System.out.println("**********查询结果:" + node+" **********");

        skipList.delete(22);
        System.out.println("**********删除结果**********");
        skipList.printAll();


    }
```

**Đặc điểm của Skip List trong Redis**:

1. Sử dụng **danh sách liên kết đôi (doubly linked list)**, khác với ví dụ ở trên, có một con trỏ quay lui. Chủ yếu dùng để đơn giản hóa các thao tác, ví dụ khi xóa một phần tử, cần tìm node tiền nhiệm của phần tử đó, sử dụng con trỏ quay lui rất tiện.
2. Giá trị `score` có thể trùng lặp, nếu `score` giống nhau thì sắp xếp theo thứ tự từ điển của ele (giá trị được lưu trong node, là sds).
3. Redis mặc định cho phép số cấp tối đa là 32, được định nghĩa bởi `ZSKIPLIST_MAXLEVEL` trong mã nguồn.

## So sánh với ba cấu trúc dữ liệu khác

Cuối cùng, hãy trả lời câu hỏi phỏng vấn ở đầu bài: "Tại sao Sorted Set của Redis sử dụng Skip List ở tầng dưới, mà không dùng Balanced Tree, Red-Black Tree hay B+ Tree?".

### Balanced Tree vs Skip List

Đầu tiên nói về so sánh với Balanced Tree. Balanced Tree còn được gọi là **AVL Tree**, là cây nhị phân cân bằng chặt chẽ, điều kiện cân bằng phải thỏa mãn (độ chênh lệch chiều cao giữa cây con trái và phải của tất cả node không vượt quá 1, tức hệ số cân bằng trong phạm vi `[-1,1]`). Độ phức tạp thời gian của chèn, xóa và truy vấn của Balanced Tree cũng giống Skip List, đều là **O(log n)**.

Về truy vấn phạm vi, nó cũng có thể đạt được hiệu quả tương tự Skip List thông qua duyệt theo thứ tự. Nhưng mỗi lần chèn hoặc xóa đều cần đảm bảo sự cân bằng tuyệt đối của node trái và phải của toàn bộ cây, chỉ cần mất cân bằng là phải xoay để duy trì cân bằng, quá trình này khá tốn thời gian.

![](/images/javaguide/database/redis/skiplist/202401222005312.png)

Skip List ra đời với mục đích khắc phục một số nhược điểm của Balanced Tree. Người phát minh Skip List trong bài báo [《Skip lists: a probabilistic alternative to balanced trees》](https://15721.courses.cs.cmu.edu/spring2018/papers/08-oltpindexes1/pugh-skiplists-cacm1990.pdf) có đề cập chi tiết:

![](/images/github/javaguide/database/redis/skiplist-a-probabilistic-alternative-to-balanced-trees.png)

> Skip lists are a data structure that can be used in place of balanced trees. Skip lists use probabilistic balancing rather than strictly enforced balancing and as a result the algorithms for insertion and deletion in skip lists are much simpler and significantly faster than equivalent algorithms for balanced trees.
>
> Skip List là một cấu trúc dữ liệu có thể dùng thay thế cho cây cân bằng. Skip List sử dụng cân bằng theo xác suất thay vì cân bằng được thực thi nghiêm ngặt, vì vậy các thuật toán chèn và xóa trong Skip List đơn giản hơn nhiều và nhanh hơn đáng kể so với các thuật toán tương đương trong cây cân bằng.

Tác giả cũng trích dẫn code cốt lõi của thao tác chèn AVL Tree, có thể thấy mỗi lần thêm cần thực hiện một lần đệ quy định vị vị trí chèn, sau đó còn cần kiểm tra backtrack lên root node xem các node ở mỗi cấp có mất cân bằng không, rồi điều chỉnh bằng cách xoay node.

```java
// 向二分搜索树中添加新的元素(key, value)
public void add(K key, V value) {
    root = add(root, key, value);
}

// 向以node为根的二分搜索树中插入元素(key, value)，递归算法
// 返回插入新节点后二分搜索树的根
private Node add(Node node, K key, V value) {

    if (node == null) {
        size++;
        return new Node(key, value);
    }

    if (key.compareTo(node.key) < 0)
        node.left = add(node.left, key, value);
    else if (key.compareTo(node.key) > 0)
        node.right = add(node.right, key, value);
    else // key.compareTo(node.key) == 0
        node.value = value;

    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));

    int balanceFactor = getBalanceFactor(node);

    // LL型需要右旋
    if (balanceFactor > 1 && getBalanceFactor(node.left) >= 0) {
        return rightRotate(node);
    }

    //RR型失衡需要左旋
    if (balanceFactor < -1 && getBalanceFactor(node.right) <= 0) {
        return leftRotate(node);
    }

    //LR需要先左旋成LL型，然后再右旋
    if (balanceFactor > 1 && getBalanceFactor(node.left) < 0) {
        node.left = leftRotate(node.left);
        return rightRotate(node);
    }

    //RL
    if (balanceFactor < -1 && getBalanceFactor(node.right) > 0) {
        node.right = rightRotate(node.right);
        return leftRotate(node);
    }
    return node;
}
```

### Red-Black Tree vs Skip List

Red-Black Tree (Cây đỏ đen) cũng là một loại cây tìm kiếm nhị phân tự cân bằng, hiệu suất truy vấn của nó kém hơn AVL Tree một chút, nhưng hiệu quả chèn và xóa cao hơn. Độ phức tạp thời gian của chèn, xóa và truy vấn của Red-Black Tree cũng giống Skip List, đều là **O(log n)**.

Red-Black Tree là một **cây cân bằng đen**, tức là từ bất kỳ node nào đến node lá khác, số node đen nó đi qua là như nhau. Khi thực hiện thao tác chèn, cần xoay và tô màu (biến đổi đỏ đen) để duy trì cân bằng đen. Tuy nhiên, so với AVL Tree, chi phí để duy trì cân bằng nhỏ hơn một chút. Để tìm hiểu chi tiết về Red-Black Tree, có thể xem bài viết: [Red-Black Tree](https://javaguide.cn/cs-basics/data-structure/red-black-tree.html).

So với Red-Black Tree, triển khai của Skip List cũng đơn giản hơn. Hơn nữa, thao tác tìm kiếm dữ liệu theo phạm vi, hiệu quả của Red-Black Tree không cao bằng Skip List.

![](/images/javaguide/database/redis/skiplist/202401222005709.png)

Code cốt lõi tương ứng khi thêm vào Red-Black Tree như sau, độc giả có thể tự tham khảo hiểu:

```java
private Node < K, V > add(Node < K, V > node, K key, V val) {

    if (node == null) {
        size++;
        return new Node(key, val);

    }

    if (key.compareTo(node.key) < 0) {
        node.left = add(node.left, key, val);
    } else if (key.compareTo(node.key) > 0) {
        node.right = add(node.right, key, val);
    } else {
        node.val = val;
    }

    //左节点不为红，右节点为红，左旋
    if (isRed(node.right) && !isRed(node.left)) {
        node = leftRotate(node);
    }

    //左链右旋
    if (isRed(node.left) && isRed(node.left.left)) {
        node = rightRotate(node);
    }

    //颜色翻转
    if (isRed(node.left) && isRed(node.right)) {
        flipColors(node);
    }

    return node;
}
```

### B+ Tree vs Skip List

Chắc hẳn những độc giả dùng MySQL đều biết cấu trúc dữ liệu B+ Tree, B+ Tree là một cấu trúc dữ liệu phổ biến với những đặc điểm sau:

1. **Cấu trúc cây nhiều nhánh**: Đây là cây nhiều nhánh, mỗi node có thể chứa nhiều node con, giảm chiều cao của cây, hiệu quả truy vấn cao.
2. **Hiệu quả lưu trữ cao**: Trong đó các node không phải lá lưu nhiều key, node lá lưu value, làm cho mỗi node có thể lưu nhiều khóa hơn, hiệu quả truy vấn phạm vi dựa trên chỉ mục cao hơn.
3. **Tính cân bằng**: Nó là cân bằng tuyệt đối, tức là chiều cao của các nhánh của cây không chênh lệch nhiều, đảm bảo độ phức tạp thời gian truy vấn và chèn là **O(log n)**.
4. **Truy cập tuần tự**: Các node lá được kết nối qua con trỏ linked list, truy vấn phạm vi xuất sắc.
5. **Phân phối dữ liệu đồng đều**: Khi B+ Tree chèn có thể gây ra phân phối lại dữ liệu, làm cho dữ liệu được phân phối đồng đều hơn trong toàn bộ cây, đảm bảo hiệu quả truy vấn phạm vi và xóa.

![](/images/javaguide/database/redis/skiplist/202401222005649.png)

Vì vậy B+ Tree phù hợp hơn làm một trong những cấu trúc chỉ mục thường dùng trong cơ sở dữ liệu và hệ thống file. Ý tưởng cốt lõi của nó là thông qua IO ít nhất có thể để định vị đến chỉ mục nhiều nhất có thể để lấy dữ liệu truy vấn. Đối với Redis là cơ sở dữ liệu bộ nhớ, nó không quan tâm đến những điều này, vì Redis là cơ sở dữ liệu bộ nhớ nên không thể lưu trữ lượng lớn dữ liệu, vì vậy đối với chỉ mục không cần duy trì theo cách B+ Tree, chỉ cần duy trì ngẫu nhiên theo xác suất là được, tiết kiệm bộ nhớ. Hơn nữa dùng Skip List để triển khai zset so với phương án trước đơn giản hơn, khi chèn chỉ cần thông qua chỉ mục để chèn dữ liệu vào vị trí thích hợp trong linked list rồi duy trì chỉ mục ngẫu nhiên có độ cao nhất định là được, không cần như B+ Tree khi chèn mà phát hiện mất cân bằng còn cần tách và trộn node.

### Lý do tác giả Redis đưa ra

Tất nhiên chúng ta cũng có thể tham khảo lý do tác giả Redis tự đưa ra:

> There are a few reasons:
> 1、They are not very memory intensive. It's up to you basically. Changing parameters about the probability of a node to have a given number of levels will make then less memory intensive than btrees.
> 2、A sorted set is often target of many ZRANGE or ZREVRANGE operations, that is, traversing the skip list as a linked list. With this operation the cache locality of skip lists is at least as good as with other kind of balanced trees.
> 3、They are simpler to implement, debug, and so forth. For instance thanks to the skip list simplicity I received a patch (already in Redis master) with augmented skip lists implementing ZRANK in O(log(N)). It required little changes to the code.

Dịch ra có nghĩa là:

> Có một vài lý do:
>
> 1、Chúng không tốn nhiều bộ nhớ. Điều này chủ yếu phụ thuộc vào bạn. Thay đổi các tham số về xác suất để một node có số cấp nhất định sẽ làm chúng tiết kiệm bộ nhớ hơn B Tree.
>
> 2、Sorted Set thường là mục tiêu của nhiều thao tác ZRANGE hoặc ZREVRANGE, tức là duyệt skip list như một linked list. Thông qua thao tác này, tính cục bộ cache của skip list ít nhất cũng tốt bằng các loại cây cân bằng khác.
>
> 3、Chúng dễ triển khai, debug, v.v. hơn. Ví dụ, nhờ tính đơn giản của skip list, tôi đã nhận được một bản vá (đã có trong nhánh chính Redis) với skip list mở rộng triển khai ZRANK trong O(log(N)). Nó chỉ cần thay đổi rất ít code.

## Tổng kết

Bài viết này thông qua nhiều nội dung giới thiệu nguyên lý hoạt động và triển khai của skip list, giúp độc giả làm quen sâu hơn với điểm mạnh yếu của cấu trúc dữ liệu Skip List, cuối cùng kết hợp so sánh các đặc điểm thao tác của từng cấu trúc dữ liệu, từ đó giúp độc giả hiểu tốt hơn câu hỏi phỏng vấn này. Khuyến nghị độc giả khi hiểu Skip List, nên kết hợp vừa đọc vừa mô phỏng bằng bút để nắm bắt chi tiết quá trình thêm, xóa, sửa, tìm kiếm của skip list.

## Tài liệu tham khảo

- Tại sao redis dùng skiplist mà không dùng red-black?: <https://www.zhihu.com/question/20202931/answer/16086538>
- Skip List--跳表（全网最详细的跳表文章没有之一）: <https://www.jianshu.com/p/9d8296562806>
- Redis 对象与底层数据结构详解: <https://blog.csdn.net/shark_chili3007/article/details/104171986>
- Redis Sorted Set: <https://www.runoob.com/redis/redis-sorted-sets.html>
- So sánh Red-Black Tree và Skip List: <https://zhuanlan.zhihu.com/p/576984787>
- Tại sao zset của redis dùng skip list mà không dùng b+ tree?: <https://blog.csdn.net/f80407515/article/details/129136998>
