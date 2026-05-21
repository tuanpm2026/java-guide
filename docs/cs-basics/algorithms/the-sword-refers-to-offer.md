---
title: Một số bài lập trình trong Kiếm chỉ Offer
description: Tuyển chọn các bài lập trình phổ biến trong "Kiếm chỉ Offer", đưa ra nhiều hướng giải quyết như đệ quy và vòng lặp cùng ví dụ minh họa, giúp ôn tập hiệu quả các dạng bài hay gặp.
category: 计算机基础
tag:
  - Thuật toán
head:
  - - meta
    - name: keywords
      content: 剑指Offer,斐波那契,递归,迭代,链表,数组,面试题
---

## Dãy số Fibonacci

**Mô tả bài toán:**

Mọi người đều biết dãy số Fibonacci. Bây giờ cho một số nguyên n, hãy xuất ra phần tử thứ n của dãy Fibonacci.
n<=39

**Phân tích bài toán:**

Có thể chắc chắn rằng bài này dùng phương pháp đệ quy là hoàn toàn có thể giải được, nhưng sẽ có một vấn đề lớn là đệ quy tính toán lặp lại nhiều lần sẽ dẫn đến tràn bộ nhớ. Ngoài ra có thể dùng phương pháp lặp, dùng fn1 và fn2 để lưu kết quả trong quá trình tính toán và tái sử dụng. Dưới đây tôi sẽ đưa ra ví dụ code của cả hai phương pháp và so sánh thời gian chạy.

**Ví dụ code:**

Dùng phương pháp lặp:

```java
int Fibonacci(int number) {
    if (number <= 0) {
        return 0;
    }
    if (number == 1 || number == 2) {
        return 1;
    }
    int first = 1, second = 1, third = 0;
    for (int i = 3; i <= number; i++) {
        third = first + second;
        first = second;
        second = third;
    }
    return third;
}
```

Dùng đệ quy:

```java
public int Fibonacci(int n) {
    if (n <= 0) {
        return 0;
    }
    if (n == 1||n==2) {
        return 1;
    }

    return Fibonacci(n - 2) + Fibonacci(n - 1);
}
```

## Bài toán nhảy bậc thang

**Mô tả bài toán:**

Một con ếch mỗi lần có thể nhảy lên 1 bậc thang hoặc 2 bậc. Tìm tổng số cách để con ếch nhảy lên một cầu thang n bậc.

**Phân tích bài toán:**

Phân tích thông thường:

> a. Nếu có hai cách nhảy là 1 bậc hoặc 2 bậc, giả sử lần đầu nhảy 1 bậc, thì còn lại n-1 bậc, số cách là f(n-1);
> b. Giả sử lần đầu nhảy 2 bậc, thì còn lại n-2 bậc, số cách là f(n-2)
> c. Từ giả thiết a, b suy ra tổng số cách: f(n) = f(n-1) + f(n-2)
> d. Từ thực tế: khi chỉ có 1 bậc thì f(1) = 1, khi chỉ có 2 bậc thì f(2) = 2

Phân tích tìm quy luật:

> f(1) = 1, f(2) = 2, f(3) = 3, f(4) = 5, có thể tổng kết được quy luật f(n) = f(n-1) + f(n-2). Nhưng tại sao lại có quy luật như vậy? Giả sử có 6 bậc thang, chúng ta có thể nhảy một bước từ bậc 5 lên bậc 6, như vậy có bao nhiêu cách nhảy đến bậc 5 thì có bấy nhiêu cách nhảy đến bậc 6. Ngoài ra cũng có thể nhảy hai bước từ bậc 4 lên bậc 6, có bao nhiêu cách nhảy đến bậc 4 thì có bấy nhiêu cách nhảy đến bậc 6. Không thể nhảy từ bậc 3 lên bậc 6 hay gì đó nữa, nên cuối cùng f(6) = f(5) + f(4). Cách hiểu này cũng giúp hiểu dễ hơn bài toán nhảy bậc thang biến thể.

**Vậy bài toán này thực ra là bài toán dãy số Fibonacci.**

Code chỉ cần sửa đổi nhỏ từ code bài trước. Điểm khác nhau duy nhất với bài trước là dãy khởi đầu của bài này là 1 2 3 5 8... còn bài trước là 1 1 2 3 5.... Ngoài ra bài này cũng có thể dùng đệ quy, nhưng hiệu suất đệ quy quá thấp, nên tôi chỉ đưa ra code theo phương pháp lặp.

**Ví dụ code:**

```java
int jumpFloor(int number) {
    if (number <= 0) {
        return 0;
    }
    if (number == 1) {
        return 1;
    }
    if (number == 2) {
        return 2;
    }
    int first = 1, second = 2, third = 0;
    for (int i = 3; i <= number; i++) {
        third = first + second;
        first = second;
        second = third;
    }
    return third;
}
```

## Bài toán nhảy bậc thang biến thể

**Mô tả bài toán:**

Một con ếch mỗi lần có thể nhảy lên 1 bậc thang, 2 bậc... cũng có thể nhảy lên n bậc. Tìm tổng số cách để con ếch nhảy lên một cầu thang n bậc.

**Phân tích bài toán:**

Giả sử n>=2, bước đầu có n cách nhảy: nhảy 1 bậc, nhảy 2 bậc, đến nhảy n bậc
Nhảy 1 bậc, còn n-1 bậc, số cách còn lại là f(n-1)
Nhảy 2 bậc, còn n-2 bậc, số cách còn lại là f(n-2)
……
Nhảy n-1 bậc, còn 1 bậc, số cách còn lại là f(1)
Nhảy n bậc, còn 0 bậc, số cách còn lại là f(0)
Vậy khi n>=2:
f(n)=f(n-1)+f(n-2)+...+f(1)
Vì f(n-1)=f(n-2)+f(n-3)+...+f(1)
Nên f(n)=2\*f(n-1), lại có f(1)=1, suy ra **f(n)=2^(number-1)**

**Ví dụ code:**

```java
int JumpFloorII(int number) {
    return 1 << --number;//2^(number-1)用位移操作进行，更快
}
```

**Bổ sung:**

Trong Java có ba toán tử dịch bit:

1. "<<" : **Toán tử dịch trái**, tương đương với nhân với 2 mũ n
2. ">>": **Toán tử dịch phải**, tương đương với chia cho 2 mũ n
3. ">>>" : **Toán tử dịch phải không dấu**, bất kể bit cao nhất trước khi dịch là 0 hay 1, sau khi dịch phần trống bên trái đều được lấp bằng 0. Tương tự >> nhưng không xét dấu.

```java
int a = 16;
int b = a << 2;//左移2，等同于16 * 2的2次方，也就是16 * 4
int c = a >> 2;//右移2，等同于16 / 2的2次方，也就是16 / 4
```

## Tìm kiếm trong mảng hai chiều

**Mô tả bài toán:**

Trong một mảng hai chiều, mỗi hàng được sắp xếp theo thứ tự tăng dần từ trái sang phải, mỗi cột được sắp xếp theo thứ tự tăng dần từ trên xuống dưới. Hãy viết một hàm, nhận vào một mảng hai chiều như vậy và một số nguyên, xác định xem mảng có chứa số nguyên đó không.

**Phân tích bài toán:**

Bài này tương đối đơn giản, điều chúng ta cần suy nghĩ là làm thế nào để nhanh nhất. Dưới đây là một hướng suy nghĩ khá dễ hiểu:

> Ma trận đã có thứ tự, nhìn từ góc dưới bên trái, số nhỏ hơn khi đi lên, số lớn hơn khi đi sang phải,
> vì vậy bắt đầu tìm từ góc dưới bên trái, khi số cần tìm lớn hơn số ở góc dưới bên trái, dịch sang phải;
> khi số cần tìm nhỏ hơn số ở góc dưới bên trái, dịch lên trên. Tìm kiếm theo cách này là nhanh nhất.

**Ví dụ code:**

```java
public boolean Find(int target, int [][] array) {
    //基本思路从左下角开始找，这样速度最快
    int row = array.length-1;//行
    int column = 0;//列
    //当行数大于0，当前列数小于总列数时循环条件成立
    while((row >= 0)&& (column< array[0].length)){
        if(array[row][column] > target){
            row--;
        }else if(array[row][column] < target){
            column++;
        }else{
            return true;
        }
    }
    return false;
}
```

## Thay thế khoảng trắng

**Mô tả bài toán:**

Hãy viết một hàm thay thế các khoảng trắng trong một chuỗi bằng "%20". Ví dụ, khi chuỗi là We Are Happy thì sau khi thay thế chuỗi trở thành We%20Are%20Happy.

**Phân tích bài toán:**

Bài này không khó, chúng ta có thể dùng vòng lặp kiểm tra từng ký tự trong chuỗi có phải khoảng trắng không, nếu có thì dùng phương thức append() để nối thêm "%20", ngược lại thì nối ký tự gốc.

Hoặc cách đơn giản nhất là dùng: replaceAll(String regex,String replacement), một dòng code là giải quyết xong.

**Ví dụ code:**

Cách thông thường:

```java
public String replaceSpace(StringBuffer str) {
    StringBuffer out = new StringBuffer();
    for (int i = 0; i < str.toString().length(); i++) {
        char b = str.charAt(i);
        if(String.valueOf(b).equals(" ")){
            out.append("%20");
        }else{
            out.append(b);
        }
    }
    return out.toString();
}
```

Giải quyết bằng một dòng code:

```java
public String replaceSpace(StringBuffer str) {
    //return str.toString().replaceAll(" ", "%20");
    //public String replaceAll(String regex,String replacement)
    //用给定的替换替换与给定的regular expression匹配的此字符串的每个子字符串。
    //\ 转义字符. 如果你要使用 "\" 本身, 则应该使用 "\\". String类型中的空格用"\s"表示，所以我这里猜测"\\s"就是代表空格的意思
    return str.toString().replaceAll("\\s", "%20");
}
```

## Lũy thừa nguyên của một số

**Mô tả bài toán:**

Cho một số thực dấu phẩy động kiểu double là base và một số nguyên kiểu int là exponent. Tính base mũ exponent.

**Phân tích bài toán:**

Bài này tương đối phức tạp và khó hơn một chút. Ở đây tôi dùng tư tưởng **chia đôi lũy thừa**, tất nhiên cũng có thể dùng **lũy thừa nhanh**.
Theo chi tiết trong sách Kiếm chỉ Offer, hướng giải của bài toán này như sau: 1. Khi cơ số bằng 0 và số mũ < 0, sẽ xảy ra tình huống tính nghịch đảo của 0, cần xử lý lỗi, đặt một biến toàn cục; 2. Kiểm tra xem cơ số có bằng 0 không, vì base là kiểu double nên không thể dùng == trực tiếp để so sánh; 3. Tối ưu hàm tính lũy thừa (chia đôi).
Khi n là số chẵn, a^n = (a^n/2)_(a^n/2);
Khi n là số lẻ, a^n = a^[(n-1)/2] _ a^[(n-1)/2] \* a. Độ phức tạp thời gian O(logn)

**Độ phức tạp thời gian**: O(logn)

**Ví dụ code:**

```java
public class Solution {
      boolean invalidInput=false;
      public double Power(double base, int exponent) {
          //如果底数等于0并且指数小于0
          //由于base为double型，不能直接用==判断
        if(equal(base,0.0)&&exponent<0){
            invalidInput=true;
            return 0.0;
        }
        int absexponent=exponent;
         //如果指数小于0，将指数转正
        if(exponent<0)
            absexponent=-exponent;
         //getPower方法求出base的exponent次方。
        double res=getPower(base,absexponent);
         //如果指数小于0，所得结果为上面求的结果的倒数
        if(exponent<0)
            res=1.0/res;
        return res;
  }
    //比较两个double型变量是否相等的方法
    boolean equal(double num1,double num2){
        if(num1-num2>-0.000001&&num1-num2<0.000001)
            return true;
        else
            return false;
    }
    //求出b的e次方的方法
    double getPower(double b,int e){
        //如果指数为0，返回1
        if(e==0)
            return 1.0;
        //如果指数为1，返回b
        if(e==1)
            return b;
        //e>>1相等于e/2，这里就是求a^n =（a^n/2）*（a^n/2）
        double result=getPower(b,e>>1);
        result*=result;
        //如果指数n为奇数，则要再乘一次底数base
        if((e&1)==1)
            result*=b;
        return result;
    }
}
```

Tất nhiên bài này cũng có thể dùng cách đơn giản: nhân liên tiếp. Tuy nhiên độ phức tạp thời gian của cách này là O(n), không hiệu quả bằng cách trước.

```java
// 使用累乘
public double powerAnother(double base, int exponent) {
    double result = 1.0;
    for (int i = 0; i < Math.abs(exponent); i++) {
        result *= base;
    }
    if (exponent >= 0)
        return result;
    else
        return 1 / result;
}
```

## Sắp xếp số lẻ đứng trước số chẵn trong mảng

**Mô tả bài toán:**

Nhập một mảng số nguyên, viết một hàm để điều chỉnh thứ tự các số trong mảng sao cho tất cả số lẻ nằm ở nửa đầu mảng, tất cả số chẵn nằm ở nửa sau mảng, và đảm bảo vị trí tương đối giữa các số lẻ và giữa các số chẵn không thay đổi.

**Phân tích bài toán:**

Bài này có khá nhiều cách giải, giới thiệu một cách tôi thấy khá dễ hiểu:
Đầu tiên đếm số lượng số lẻ, giả sử là n, sau đó tạo một mảng mới cùng độ dài. Duyệt qua mảng gốc bằng vòng lặp, kiểm tra từng phần tử là số chẵn hay số lẻ. Nếu là số lẻ thì thêm vào mảng mới bắt đầu từ chỉ số 0; nếu là số chẵn thì thêm vào mảng mới bắt đầu từ chỉ số n.

**Ví dụ code:**

Thuật toán độ phức tạp thời gian O(n), không gian O(n)

```java
public class Solution {
    public void reOrderArray(int [] array) {
        //如果数组长度等于0或者等于1，什么都不做直接返回
        if(array.length==0||array.length==1)
            return;
        //oddCount：保存奇数个数
        //oddBegin：奇数从数组头部开始添加
        int oddCount=0,oddBegin=0;
        //新建一个数组
        int[] newArray=new int[array.length];
        //计算出（数组中的奇数个数）开始添加元素
        for(int i=0;i<array.length;i++){
            if((array[i]&1)==1) oddCount++;
        }
        for(int i=0;i<array.length;i++){
            //如果数为基数新数组从头开始添加元素
            //如果为偶数就从oddCount（数组中的奇数个数）开始添加元素
            if((array[i]&1)==1)
                newArray[oddBegin++]=array[i];
            else newArray[oddCount++]=array[i];
        }
        for(int i=0;i<array.length;i++){
            array[i]=newArray[i];
        }
    }
}
```

## Node thứ k từ cuối trong danh sách liên kết

**Mô tả bài toán:**

Nhập một danh sách liên kết, xuất ra node thứ k từ cuối của danh sách đó.

**Phân tích bài toán:**

**Tóm tắt một câu:**
Dùng hai con trỏ, con trỏ p1 chạy trước, sau khi p1 chạy được k-1 node thì con trỏ p2 bắt đầu chạy. Khi p1 chạy đến cuối, con trỏ p2 đang chỉ đến chính là node thứ k từ cuối.

**Hiểu đơn giản về ý tưởng:**
Giả thiết: số node trong danh sách liên kết (độ dài) là n.
Quy luật 1: Để tìm node thứ k từ cuối cần đi về trước bao nhiêu bước? Ví dụ node cuối cùng (thứ 1 từ cuối) cần đi n bước, vậy node thứ 2 từ cuối thì sao? Rõ ràng là n-1 bước, nên quy luật là: tìm node thứ k từ cuối cần đi n-k+1 bước.

**Bắt đầu thuật toán:**

1. Đặt hai con trỏ p1 và p2 đều trỏ vào head. Khi p1 đi được k-1 bước, dừng lại. p2 không di chuyển trong suốt thời gian đó.
2. Bước tiếp theo của p1 là bước thứ k, lúc này p2 bắt đầu di chuyển cùng. Tại sao p2 di chuyển lúc này? Xem phân tích dưới.
3. Khi p1 chạy đến cuối danh sách liên kết, tức là p1 đã đi n bước. Vì p2 bắt đầu di chuyển sau khi p1 đi k-1 bước, nghĩa là p1 và p2 luôn chênh nhau k-1 bước. Nên khi p1 đi n bước, p2 đã đi n-(k-1) bước. Tức là p2 đi n-k+1 bước, đây chính xác là vị trí node thứ k từ cuối theo quy luật 1.
   Như vậy có dễ hiểu hơn không?

**Kiến thức kiểm tra:**

Danh sách liên kết + Tính bền vững của code

**Ví dụ code:**

```java
/*
//链表类
public class ListNode {
    int val;
    ListNode next = null;

    ListNode(int val) {
        this.val = val;
    }
}*/

//时间复杂度O(n),一次遍历即可
public class Solution {
    public ListNode FindKthToTail(ListNode head,int k) {
        ListNode pre=null,p=null;
        //两个指针都指向头结点
        p=head;
        pre=head;
        //记录k值
        int a=k;
        //记录节点的个数
        int count=0;
        //p指针先跑，并且记录节点数，当p指针跑了k-1个节点后，pre指针开始跑，
        //当p指针跑到最后时，pre所指指针就是倒数第k个节点
        while(p!=null){
            p=p.next;
            count++;
            if(k<1){
                pre=pre.next;
            }
            k--;
        }
        //如果节点个数小于所求的倒数第k个节点，则返回空
        if(count<a) return null;
        return pre;

    }
}
```

## Đảo ngược danh sách liên kết

**Mô tả bài toán:**

Nhập một danh sách liên kết, sau khi đảo ngược, xuất tất cả các phần tử của danh sách.

**Phân tích bài toán:**

Đây là một bài rất thông thường về danh sách liên kết. Ý tưởng không quá khó nhưng khi tự triển khai lại có thể cảm thấy không biết bắt đầu từ đâu. Tôi đã tham khảo code của người khác.
Ý tưởng là dựa vào đặc điểm của danh sách liên kết, node trước trỏ đến node sau, chuyển node phía sau lên phía trước.
Ví dụ như hình dưới: Chúng ta đổi chỗ node 1 và node 2, sau đó cho node 3 trỏ vào node 2, node 4 trỏ vào node 3, như vậy danh sách liên kết bên dưới sẽ được đảo ngược.

![Danh sách liên kết](/images/p3-juejin/844773c7300e4373922bb1a6ae2a55a3~tplv-k3u1fbpfcp-zoom-1.png)

**Kiến thức kiểm tra:**

Danh sách liên kết + Tính bền vững của code

**Ví dụ code:**

```java
/*
public class ListNode {
    int val;
    ListNode next = null;

    ListNode(int val) {
        this.val = val;
    }
}*/
public class Solution {
    public ListNode ReverseList(ListNode head) {
       ListNode next = null;
       ListNode pre = null;
        while (head != null) {
              //保存要反转到头来的那个节点
               next = head.next;
               //要反转的那个节点指向已经反转的上一个节点
               head.next = pre;
               //上一个已经反转到头部的节点
               pre = head;
               //一直向链表尾走
               head = next;
        }
        return pre;
    }
}
```

## Hợp nhất hai danh sách liên kết đã sắp xếp

**Mô tả bài toán:**

Nhập hai danh sách liên kết đơn tăng dần, xuất danh sách liên kết sau khi hợp nhất, yêu cầu danh sách hợp nhất phải thỏa mãn quy tắc không giảm.

**Phân tích bài toán:**

Chúng ta có thể phân tích như sau:

1. Giả sử chúng ta có hai danh sách liên kết A, B;
2. So sánh giá trị của node đầu A1 của A với giá trị của node đầu B1 của B, giả sử A1 nhỏ hơn thì A1 là node đầu;
3. So sánh A2 với B1, giả sử B1 nhỏ hơn thì A1 trỏ đến B1;
4. So sánh A2 với B2... và cứ như vậy lặp lại.
   Như vậy thôi, nên cũng khá dễ hiểu.

**Kiến thức kiểm tra:**

Danh sách liên kết + Tính bền vững của code

**Ví dụ code:**

Phiên bản không đệ quy:

```java
/*
public class ListNode {
    int val;
    ListNode next = null;

    ListNode(int val) {
        this.val = val;
    }
}*/
public class Solution {
    public ListNode Merge(ListNode list1,ListNode list2) {
       //list1为空，直接返回list2
       if(list1 == null){
            return list2;
        }
        //list2为空，直接返回list1
        if(list2 == null){
            return list1;
        }
        ListNode mergeHead = null;
        ListNode current = null;
        //当list1和list2不为空时
        while(list1!=null && list2!=null){
            //取较小值作头结点
            if(list1.val <= list2.val){
                if(mergeHead == null){
                   mergeHead = current = list1;
                }else{
                   current.next = list1;
                    //current节点保存list1节点的值因为下一次还要用
                   current = list1;
                }
                //list1指向下一个节点
                list1 = list1.next;
            }else{
                if(mergeHead == null){
                   mergeHead = current = list2;
                }else{
                   current.next = list2;
                     //current节点保存list2节点的值因为下一次还要用
                   current = list2;
                }
                //list2指向下一个节点
                list2 = list2.next;
            }
        }
        if(list1 == null){
            current.next = list2;
        }else{
            current.next = list1;
        }
        return mergeHead;
    }
}
```

Phiên bản đệ quy:

```java
public ListNode Merge(ListNode list1,ListNode list2) {
    if(list1 == null){
        return list2;
    }
    if(list2 == null){
        return list1;
    }
    if(list1.val <= list2.val){
        list1.next = Merge(list1.next, list2);
        return list1;
    }else{
        list2.next = Merge(list1, list2.next);
        return list2;
    }
}
```

## Dùng hai stack để triển khai queue

**Mô tả bài toán:**

Dùng hai stack để triển khai một queue, hoàn thành các thao tác Push và Pop của queue. Các phần tử trong queue có kiểu int.

**Phân tích bài toán:**

Trước tiên ôn lại đặc điểm cơ bản của stack và queue:
**Stack:** Vào sau ra trước (LIFO)
**Queue:** Vào trước ra trước
Rõ ràng chúng ta cần dựa vào một số phương thức cơ bản của stack do JDK cung cấp để triển khai. Hãy xem một số phương thức thông dụng của lớp Stack:

![Một số phương thức thông dụng của lớp Stack](/images/github/javaguide/cs-basics/algorithms/5985000.jpg)

Vì đề bài cho hai stack, chúng ta có thể nghĩ như sau: khi push thì push phần tử vào stack1; khi pop thì trước tiên pop tất cả phần tử từ stack1 sang stack2, sau đó thực hiện pop trên stack2. Như vậy có thể đảm bảo vào trước ra trước. (Âm [pop] nhân âm [pop] bằng dương [vào trước ra trước])

**Kiến thức kiểm tra:**

Queue + Stack

Ví dụ code:

```java
//左程云的《程序员代码面试指南》的答案
import java.util.Stack;

public class Solution {
    Stack<Integer> stack1 = new Stack<Integer>();
    Stack<Integer> stack2 = new Stack<Integer>();

    //当执行push操作时，将元素添加到stack1
    public void push(int node) {
        stack1.push(node);
    }

    public int pop() {
        //如果两个队列都为空则抛出异常,说明用户没有push进任何元素
        if(stack1.empty()&&stack2.empty()){
            throw new RuntimeException("Queue is empty!");
        }
        //如果stack2不为空直接对stack2执行pop操作，
        if(stack2.empty()){
            while(!stack1.empty()){
                //将stack1的元素按后进先出push进stack2里面
                stack2.push(stack1.pop());
            }
        }
          return stack2.pop();
    }
}
```

## Chuỗi push và pop của stack

**Mô tả bài toán:**

Nhập hai chuỗi số nguyên, chuỗi thứ nhất biểu thị thứ tự push vào stack, hãy xác định xem chuỗi thứ hai có phải là thứ tự pop hợp lệ của stack đó không. Giả sử tất cả các số được push vào stack đều khác nhau. Ví dụ chuỗi 1,2,3,4,5 là thứ tự push vào một stack, chuỗi 4,5,3,2,1 là một thứ tự pop hợp lệ tương ứng, nhưng 4,3,5,1,2 không thể là thứ tự pop của chuỗi push đó. (Lưu ý: độ dài của hai chuỗi bằng nhau)

**Phân tích bài toán:**

Bài này suy nghĩ mãi không ra hướng, đã tham khảo [đáp án của Alias](https://www.nowcoder.com/questionTerminal/d77d11405cc7470d82554cb392585106), hướng suy nghĩ của anh ấy được viết rất chi tiết, nên khá dễ hiểu.

【Hướng giải】Dùng một stack phụ, duyệt qua thứ tự push, đầu tiên cho số đầu tiên vào stack phụ (ở đây là 1), sau đó kiểm tra xem phần tử trên đỉnh stack có bằng phần tử đầu tiên của thứ tự pop không (ở đây là 4). Rõ ràng 1 ≠ 4 nên tiếp tục push. Cứ như vậy cho đến khi bằng thì bắt đầu pop. Sau mỗi lần pop một phần tử, thứ tự pop tiến lên một vị trí, cho đến khi không bằng nữa thì tiếp tục push. Vòng lặp như vậy cho đến khi duyệt hết thứ tự push. Nếu stack phụ vẫn không rỗng, nghĩa là chuỗi pop không phải thứ tự pop của stack đó.

Ví dụ:

Push 1,2,3,4,5

Pop 4,5,3,2,1

Đầu tiên push 1 vào stack phụ, đỉnh stack là 1 ≠ 4, tiếp tục push 2

Đỉnh stack là 2 ≠ 4, tiếp tục push 3

Đỉnh stack là 3 ≠ 4, tiếp tục push 4

Đỉnh stack là 4 = 4, pop 4, thứ tự pop tiến lên một vị trí là 5, stack phụ là 1,2,3

Đỉnh stack là 3 ≠ 5, tiếp tục push 5

Đỉnh stack là 5 = 5, pop 5, thứ tự pop tiến lên là 3, stack phụ là 1,2,3

…….
Thực hiện lần lượt, cuối cùng stack phụ rỗng. Nếu không rỗng thì chuỗi pop không phải thứ tự pop của stack đó.

**Kiến thức kiểm tra:**

Stack

**Ví dụ code:**

```java
import java.util.ArrayList;
import java.util.Stack;
//这道题没想出来，参考了Alias同学的答案：https://www.nowcoder.com/questionTerminal/d77d11405cc7470d82554cb392585106
public class Solution {
    public boolean IsPopOrder(int [] pushA,int [] popA) {
        if(pushA.length == 0 || popA.length == 0)
            return false;
        Stack<Integer> s = new Stack<Integer>();
        //用于标识弹出序列的位置
        int popIndex = 0;
        for(int i = 0; i< pushA.length;i++){
            s.push(pushA[i]);
            //如果栈不为空，且栈顶元素等于弹出序列
            while(!s.empty() &&s.peek() == popA[popIndex]){
                //出栈
                s.pop();
                //弹出序列向后一位
                popIndex++;
            }
        }
        return s.empty();
    }
}
```

<!-- @include: @article-footer.snippet.md -->
