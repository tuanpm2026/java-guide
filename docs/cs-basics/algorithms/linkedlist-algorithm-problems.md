---
title: Một số bài tập thuật toán Linked List phổ biến
description: Tổng hợp các bài toán linked list tần suất cao với ý tưởng và implementation, bao gồm cộng hai số, đảo ngược, phát hiện vòng... nhấn mạnh xử lý edge case và phân tích độ phức tạp.
category: CS Basics
tag:
  - Algorithms
head:
  - - meta
    - name: keywords
      content: linked list algorithms,add two numbers,reverse linked list,cycle detection,merge linked lists,complexity analysis
---

<!-- markdownlint-disable MD024 -->

## 1. Cộng hai số

### Mô tả bài toán

> Leetcode: Cho hai linked lists không rỗng biểu diễn hai số nguyên không âm. Các chữ số được lưu theo thứ tự ngược, mỗi node chỉ chứa một chữ số. Cộng hai số và trả về linked list mới.
>
> Bạn có thể giả sử trừ số 0, cả hai số đều không bắt đầu bằng số 0.

Ví dụ:

```plain
Input: (2 -> 4 -> 3) + (5 -> 6 -> 4)
Output: 7 -> 0 -> 8
Lý do: 342 + 465 = 807
```

### Phân tích bài toán

Leetcode official detailed solution:

<https://leetcode-cn.com/problems/add-two-numbers/solution/>

> Khi cần thao tác với head node, hãy cân nhắc tạo dummy node, dùng dummy->next để biểu diễn head node thực sự. Như vậy tránh được boundary problems khi head node null.

Chúng ta dùng một biến để track carry (số nhớ), mô phỏng quá trình cộng từng chữ số bắt đầu từ đầu danh sách (chứa chữ số ít có nghĩa nhất).

![Hình 1: Visualization của phương pháp cộng hai số: 342 + 465 = 807, mỗi node chứa một chữ số, và chữ số được lưu theo thứ tự ngược.](https://oss.javaguide.cn/github/javaguide/cs-basics/algorithms/34910956.jpg)

### Solution

**Đầu tiên bắt đầu cộng từ chữ số có nghĩa nhỏ nhất, tức là từ đầu danh sách l1 và l2. Chú ý phải xử lý carry!**

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) { val = x; }
 * }
 */
 //https://leetcode-cn.com/problems/add-two-numbers/description/
class Solution {
public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode dummyHead = new ListNode(0);
    ListNode p = l1, q = l2, curr = dummyHead;
    //carry là số nhớ
    int carry = 0;
    while (p != null || q != null) {
        int x = (p != null) ? p.val : 0;
        int y = (q != null) ? q.val : 0;
        int sum = carry + x + y;
        //số nhớ
        carry = sum / 10;
        //giá trị node mới là sum % 10
        curr.next = new ListNode(sum % 10);
        curr = curr.next;
        if (p != null) p = p.next;
        if (q != null) q = q.next;
    }
    if (carry > 0) {
        curr.next = new ListNode(carry);
    }
    return dummyHead.next;
}
}
```

## 2. Đảo ngược linked list

### Mô tả bài toán

> Sword Offer: Nhập vào một linked list, sau khi đảo ngược, xuất tất cả elements của linked list.

![Đảo ngược linked list](https://oss.javaguide.cn/github/javaguide/cs-basics/algorithms/81431871.jpg)

### Phân tích bài toán

Bài thuật toán này, nói thẳng ra là: làm thế nào để node sau trỏ về node trước! Trong code dưới định nghĩa một node `next`, node này chủ yếu lưu node cần đảo ngược lên đầu, tránh linked list bị "đứt".

### Solution

```java
public class ListNode {
  int val;
  ListNode next = null;

  ListNode(int val) {
    this.val = val;
  }
}
```

```java
/**
 *
 * @author Snailclimb
 * @date 2018年9月19日
 * @Description: TODO
 */
public class Solution {

  public ListNode ReverseList(ListNode head) {

    ListNode next = null;
    ListNode pre = null;

    while (head != null) {
      // Lưu node cần đảo ngược lên đầu
      next = head.next;
      // Node cần đảo ngược trỏ về node đã đảo ngược trước đó (lần đầu tiên sẽ trỏ null)
      head.next = pre;
      // Node trước đó đã đảo ngược lên đầu
      pre = head;
      // Đi dần về cuối linked list
      head = next;
    }
    return pre;
  }

}
```

Test method:

```java
  public static void main(String[] args) {

    ListNode a = new ListNode(1);
    ListNode b = new ListNode(2);
    ListNode c = new ListNode(3);
    ListNode d = new ListNode(4);
    ListNode e = new ListNode(5);
    a.next = b;
    b.next = c;
    c.next = d;
    d.next = e;
    new Solution().ReverseList(a);
    while (e != null) {
      System.out.println(e.val);
      e = e.next;
    }
  }
```

Output:

```plain
5
4
3
2
1
```

## 3. Node thứ k từ cuối trong linked list

### Mô tả bài toán

> Sword Offer: Nhập vào một linked list, xuất node thứ k từ cuối.

### Phân tích bài toán

> **Node thứ k từ cuối trong linked list chính là node thứ (L-K+1) từ đầu, biết điều này thì bài toán coi như xong!**

Đầu tiên hai nodes/pointers, node1 chạy trước, khi node1 chạy được k-1 nodes thì node2 bắt đầu chạy, khi node1 chạy đến cuối thì node2 đang trỏ tới chính là node thứ k từ cuối, tức là node thứ (L-K+1) từ đầu.

### Solution

```java
/*
public class ListNode {
    int val;
    ListNode next = null;

    ListNode(int val) {
        this.val = val;
    }
}*/

// Time complexity O(n), một lần duyệt là đủ
// https://www.nowcoder.com/practice/529d3ae5a407492994ad2a246518148a?tpId=13&tqId=11167&tPage=1&rp=1&ru=/ta/coding-interviews&qru=/ta/coding-interviews/question-ranking
public class Solution {
  public ListNode FindKthToTail(ListNode head, int k) {
    // Nếu linked list rỗng hoặc k <= 0
    if (head == null || k <= 0) {
      return null;
    }
    // Khai báo hai nodes trỏ vào head node
    ListNode node1 = head, node2 = head;
    // Đếm số nodes
    int count = 0;
    // Lưu giá trị k, dùng sau
    int index = k;
    // node1 chạy trước và đếm nodes, khi node1 chạy k-1 nodes thì node2 bắt đầu chạy
    // Khi node1 chạy đến cuối, node2 đang ở vị trí node thứ k từ cuối
    while (node1 != null) {
      node1 = node1.next;
      count++;
      if (k < 1) {
        node2 = node2.next;
      }
      k--;
    }
    // Nếu số nodes nhỏ hơn k thì trả về null
    if (count < index)
      return null;
    return node2;

  }
}
```

## 4. Xóa node thứ N từ cuối trong linked list

> Leetcode: Cho một linked list, xóa node thứ n từ cuối và trả về head node.

**Ví dụ:**

```plain
Cho linked list: 1->2->3->4->5, và n = 2.

Sau khi xóa node thứ hai từ cuối, linked list thành 1->2->3->5.

```

**Ghi chú:**

n cho trước được đảm bảo hợp lệ.

**Nâng cao:**

Bạn có thể implement bằng một lần duyệt không?

Bài này trên leetcode có giải thích chi tiết, có thể tham khảo Leetcode.

### Phân tích bài toán

Chú ý bài toán này có thể đơn giản hóa thành: xóa node thứ (L - n + 1) từ đầu, L là chiều dài list. Chỉ cần tìm được L là có thể giải quyết dễ dàng.

![Hình 1. Xóa element thứ L - n + 1 trong list](https://oss.javaguide.cn/github/javaguide/cs-basics/algorithms/94354387.jpg)

### Solution

**Two-pass method (hai lần duyệt):**

Đầu tiên thêm một **dummy node** làm hỗ trợ, node này nằm ở đầu list. Dummy node để đơn giản hóa một số edge cases, ví dụ list chỉ có một node, hoặc cần xóa head. Trong lần duyệt đầu, tìm chiều dài L của list. Sau đó đặt pointer trỏ vào dummy node và duyệt list cho đến node thứ (L - n). **Liên kết lại next pointer của node thứ (L - n) sang node thứ (L - n + 2), hoàn thành thuật toán.**

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) { val = x; }
 * }
 */
// https://leetcode-cn.com/problems/remove-nth-node-from-end-of-list/description/
public class Solution {
  public ListNode removeNthFromEnd(ListNode head, int n) {
    // Dummy node để đơn giản hóa một số edge cases như list chỉ có một node, hoặc cần xóa head
    ListNode dummy = new ListNode(0);
    // Dummy node trỏ vào head node
    dummy.next = head;
    // Lưu chiều dài linked list
    int length = 0;
    ListNode len = head;
    while (len != null) {
      length++;
      len = len.next;
    }
    length = length - n;
    ListNode target = dummy;
    // Tìm node ở vị trí L-n
    while (length > 0) {
      target = target.next;
      length--;
    }
    // Liên kết lại next pointer của node thứ (L-n) sang node thứ (L-n+2)
    target.next = target.next.next;
    return dummy.next;
  }
}
```

**Nâng cao — One-pass method (một lần duyệt):**

> Node thứ N từ cuối trong linked list chính là node thứ (L - n + 1) từ đầu.

Cách này giống ý tưởng bài số 3 "tìm node thứ k từ cuối". **Ý tưởng cơ bản:** Định nghĩa hai nodes node1, node2; node1 chạy trước, khi node1 chạy đến node thứ n+1, node2 bắt đầu chạy. Khi node1 chạy đến node cuối cùng, node2 đang ở vị trí node thứ (L - n) (L là tổng chiều dài, tức là node thứ n+1 từ cuối).

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) { val = x; }
 * }
 */
public class Solution {
  public ListNode removeNthFromEnd(ListNode head, int n) {

    ListNode dummy = new ListNode(0);
    dummy.next = head;
    // Khai báo hai nodes trỏ vào head node
    ListNode node1 = dummy, node2 = dummy;

    // node1 chạy trước, khi node1 chạy đến node thứ n thì node2 bắt đầu chạy
    // Khi node1 chạy đến node cuối cùng, node2 ở vị trí node thứ (L-n), tức là node thứ n+1 từ cuối (L là tổng chiều dài)
    while (node1 != null) {
      node1 = node1.next;
      if (n < 1 && node1 != null) {
        node2 = node2.next;
      }
      n--;
    }

    node2.next = node2.next.next;

    return dummy.next;

  }
}
```

## 5. Gộp hai sorted linked lists

### Mô tả bài toán

> Sword Offer: Nhập vào hai linked lists tăng dần đơn điệu, xuất linked list được gộp từ hai list, và list gộp phải thỏa mãn quy tắc không giảm đơn điệu.

### Phân tích bài toán

Có thể phân tích như sau:

1. Giả sử có hai linked lists A, B;
2. So sánh giá trị head node A1 của A với head node B1 của B, giả sử A1 nhỏ hơn thì A1 là head node;
3. Tiếp theo A2 so sánh với B1, giả sử B1 nhỏ hơn, thì A1 trỏ đến B1;
4. A2 lại so sánh với B2
   Cứ lặp đi lặp lại như vậy, cũng khá dễ hiểu.

Hãy thử implement theo cách đệ quy!

### Solution

**Recursive version:**

```java
/*
public class ListNode {
    int val;
    ListNode next = null;

    ListNode(int val) {
        this.val = val;
    }
}*/
//https://www.nowcoder.com/practice/d8b6b4358f774294a89de2a6ac4d9337?tpId=13&tqId=11169&tPage=1&rp=1&ru=/ta/coding-interviews&qru=/ta/coding-interviews/question-ranking
public class Solution {
  public ListNode Merge(ListNode list1, ListNode list2) {
    if (list1 == null) {
      return list2;
    }
    if (list2 == null) {
      return list1;
    }
    if (list1.val <= list2.val) {
      list1.next = Merge(list1.next, list2);
      return list1;
    } else {
      list2.next = Merge(list1, list2.next);
      return list2;
    }
  }
}
```

<!-- @include: @article-footer.snippet.md -->
