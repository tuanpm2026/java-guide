---
title: Cấu trúc dữ liệu tuyến tính
description: Tổng hợp các đặc tính và thao tác của array/linked list/stack/queue, kết hợp phân tích complexity và ứng dụng điển hình, nắm vững lựa chọn và triển khai cấu trúc tuyến tính.
category: Kiến thức cơ bản máy tính
tag:
  - Cấu trúc dữ liệu
head:
  - - meta
    - name: keywords
      content: array,linked list,stack,queue,deque,complexity analysis,random access,insert delete
---

## 1. Array (Mảng)

**Array (Mảng)** là cấu trúc dữ liệu rất phổ biến. Nó gồm các element (phần tử) cùng kiểu, và dùng một khối bộ nhớ liên tục để lưu trữ.

Có thể tính trực tiếp địa chỉ lưu trữ tương ứng của element thông qua index (chỉ số) của element đó.

Đặc điểm của array: **Hỗ trợ random access** và capacity có hạn.

```java
Giả sử array có độ dài n.
Access: O(1)   // Truy cập element ở vị trí cụ thể
Insert: O(n)   // Trường hợp xấu nhất: insert ở đầu mảng cần di chuyển tất cả element
Delete: O(n)   // Trường hợp xấu nhất: xóa ở đầu mảng cần di chuyển tất cả element phía sau
```

![Array](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/array.png)

## 2. Linked List (Danh sách liên kết)

### 2.1. Giới thiệu Linked List

**Linked List** dù là linear table nhưng không lưu data theo thứ tự tuyến tính — không dùng bộ nhớ liên tục để lưu.

Complexity của thao tác insert và delete trong linked list là O(1) — chỉ cần biết element trước element đích. Nhưng khi tìm kiếm một node hoặc truy cập node ở vị trí cụ thể, complexity là O(n).

Dùng cấu trúc linked list có thể khắc phục nhược điểm của array phải biết trước kích thước data. Linked list có thể tận dụng đầy đủ bộ nhớ máy tính, triển khai dynamic memory management linh hoạt. Nhưng linked list không tiết kiệm không gian — chiếm nhiều hơn array vì mỗi node còn lưu con trỏ đến node khác. Ngoài ra linked list không có ưu điểm random access của array.

### 2.2. Phân loại Linked List

**Các loại linked list phổ biến:**

1. Singly Linked List (Danh sách liên kết đơn)
2. Doubly Linked List (Danh sách liên kết đôi)
3. Circular Linked List (Danh sách liên kết vòng)
4. Doubly Circular Linked List (Danh sách liên kết đôi vòng)

```java
Giả sử linked list có n element.
Access: O(n)         // Truy cập element ở vị trí cụ thể
Insert/Delete: O(1)  // Phải biết vị trí cần insert element
```

#### 2.2.1. Singly Linked List

**Singly Linked List** chỉ có một hướng. Node chỉ có một successor pointer `next` trỏ đến node phía sau. Do đó cấu trúc dữ liệu linked list thường không liên tục về mặt bộ nhớ vật lý. Thường gọi node đầu tiên là head node. Linked list thường có một `head` node không lưu giá trị nào. Thông qua head node có thể duyệt toàn bộ linked list. Tail node thường trỏ đến null.

![Singly Linked List](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/single-linkedlist.png)

#### 2.2.2. Circular Linked List

**Circular Linked List** thực ra là loại singly linked list đặc biệt. Điểm khác với singly linked list là tail node của circular linked list không trỏ đến null mà trỏ đến head node của linked list.

![Circular Linked List](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/circular-linkedlist.png)

#### 2.2.3. Doubly Linked List

**Doubly Linked List** chứa hai con trỏ — một `prev` trỏ đến node trước, một `next` trỏ đến node sau.

![Doubly Linked List](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/bidirectional-linkedlist.png)

#### 2.2.4. Doubly Circular Linked List

**Doubly Circular Linked List** có `next` của node cuối cùng trỏ đến `head`, còn `prev` của `head` trỏ đến node cuối cùng — tạo thành vòng tròn.

![Doubly Circular Linked List](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/bidirectional-circular-linkedlist.png)

### 2.3. Tình huống ứng dụng

- Nếu cần hỗ trợ random access, linked list không làm được.
- Nếu số lượng element cần lưu không xác định và thường xuyên thêm/xóa data — dùng linked list phù hợp hơn.
- Nếu số lượng element cần lưu xác định và không cần thường xuyên thêm/xóa — dùng array phù hợp hơn.

### 2.4. Array vs Linked List

- Array hỗ trợ random access, linked list không hỗ trợ.
- Array dùng bộ nhớ liên tục — thân thiện với CPU cache mechanism. Linked list thì ngược lại.
- Kích thước array cố định, còn linked list tự nhiên hỗ trợ dynamic expansion. Nếu khai báo array quá nhỏ, cần xin thêm bộ nhớ lớn hơn để lưu array element, rồi copy array cũ vào — thao tác này khá tốn thời gian!

## 3. Stack (Ngăn xếp)

### 3.1. Giới thiệu Stack

**Stack** chỉ cho phép thêm data (push) và xóa data (pop) ở một đầu của cấu trúc dữ liệu tuyến tính có thứ tự (gọi là đỉnh stack — top). Do đó hoạt động theo nguyên tắc **LIFO (Last In First Out — Vào sau ra trước)**. **Trong stack, cả push và pop đều xảy ra ở đỉnh stack.**

Stack thường được triển khai bằng one-dimensional array hoặc linked list. Stack triển khai bằng array gọi là **sequential stack**, triển khai bằng linked list gọi là **linked stack**.

```java
Giả sử stack có n element.
Access: O(n)         // Trường hợp xấu nhất
Insert/Delete: O(1)  // Insert/delete ở đỉnh
```

![Stack](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/%E6%A0%88.png)

### 3.2. Tình huống ứng dụng phổ biến của Stack

Khi data cần xử lý chỉ liên quan đến insert và delete ở một đầu và thỏa tính chất **LIFO (Last In First Out)**, có thể dùng cấu trúc dữ liệu stack.

#### 3.2.1. Triển khai chức năng back và forward của trình duyệt

Chỉ cần dùng hai stack (Stack1 và Stack2) là có thể triển khai chức năng này. Ví dụ bạn xem lần lượt 4 trang 1, 2, 3, 4 — push lần lượt vào Stack1. Khi muốn quay lại trang 2, click nút back — pop 4, 3 từ Stack1 và push vào Stack2. Nếu muốn đến trang 3, click nút forward — pop 3 từ Stack2 và push vào Stack1. Ví dụ minh họa:

![Stack triển khai back và forward của trình duyệt](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/%E6%A0%88%E5%AE%9E%E7%8E%B0%E6%B5%8F%E8%A7%88%E5%99%A8%E5%80%92%E9%80%80%E5%92%8C%E5%89%8D%E8%BF%9B.png)

#### 3.2.2. Kiểm tra dấu ngoặc có thành cặp không

> Cho một chuỗi chỉ chứa `'('`, `')'`, `'{'`, `'}'`, `'['`, `']'`. Xác định xem chuỗi có hợp lệ không.
>
> Chuỗi hợp lệ cần thỏa:
>
> 1. Dấu ngoặc mở phải được đóng bằng cùng loại dấu ngoặc đóng.
> 2. Dấu ngoặc mở phải được đóng theo đúng thứ tự.
>
> Ví dụ `"()"`, `"()[]{}"`, `"{[]}"` đều hợp lệ, còn `"(]"`, `"([)]"` thì không.

Đây thực ra là một bài LeetCode, có thể dùng `Stack` để giải.

1. Trước tiên lưu quy tắc tương ứng giữa các dấu ngoặc vào `Map`.
2. Tạo stack. Duyệt chuỗi — nếu ký tự là dấu ngoặc mở thì push vào `stack`. Ngược lại so sánh top element của `stack` với dấu ngoặc này. Nếu không bằng nhau thì return false. Sau khi duyệt xong, nếu `stack` rỗng thì return `true`.

```java
public boolean isValid(String s){
    // Quy tắc tương ứng giữa các dấu ngoặc
    HashMap<Character, Character> mappings = new HashMap<Character, Character>();
    mappings.put(')', '(');
    mappings.put('}', '{');
    mappings.put(']', '[');
    Stack<Character> stack = new Stack<Character>();
    char[] chars = s.toCharArray();
    for (int i = 0; i < chars.length; i++) {
        if (mappings.containsKey(chars[i])) {
            char topElement = stack.empty() ? '#' : stack.pop();
            if (topElement != mappings.get(chars[i])) {
                return false;
            }
        } else {
            stack.push(chars[i]);
        }
    }
    return stack.isEmpty();
}
```

#### 3.2.3. Đảo ngược chuỗi

Push từng ký tự trong chuỗi vào stack rồi pop ra là xong.

#### 3.2.4. Duy trì function call

Function được gọi cuối cùng phải hoàn thành thực thi trước — thỏa tính chất **LIFO** của stack. Ví dụ recursive function call có thể được triển khai bằng stack — mỗi lần gọi đệ quy đều push tham số và return address vào stack.

#### 3.2.5. DFS (Depth First Search)

Trong quá trình DFS, stack được dùng để lưu search path để backtrack lên tầng trên.

### 3.3. Triển khai Stack

Stack có thể được triển khai bằng array hoặc linked list. Dù dùng array hay linked list, time complexity của push và pop đều là O(1).

Dưới đây triển khai stack bằng array. Stack này có các method cơ bản: `push()`, `pop()` (return đỉnh stack và pop), `peek()` (return đỉnh stack không pop), `isEmpty()`, `size()`.

> Gợi ý: Trước mỗi lần push, kiểm tra xem capacity của stack có đủ không. Nếu không đủ thì mở rộng bằng `Arrays.copyOf()`.

```java
public class MyStack {
    private int[] storage;    // Mảng lưu element của stack
    private int capacity;     // Capacity của stack
    private int count;        // Số element trong stack
    private static final int GROW_FACTOR = 2;

    // Constructor không có initial capacity. Default capacity là 8
    public MyStack() {
        this.capacity = 8;
        this.storage=new int[8];
        this.count = 0;
    }

    // Constructor có initial capacity
    public MyStack(int initialCapacity) {
        if (initialCapacity < 1)
            throw new IllegalArgumentException("Capacity too small.");

        this.capacity = initialCapacity;
        this.storage = new int[initialCapacity];
        this.count = 0;
    }

    // Push
    public void push(int value) {
        if (count == capacity) {
            ensureCapacity();
        }
        storage[count++] = value;
    }

    // Đảm bảo capacity đủ
    private void ensureCapacity() {
        int newCapacity = capacity * GROW_FACTOR;
        storage = Arrays.copyOf(storage, newCapacity);
        capacity = newCapacity;
    }

    // Return đỉnh stack và pop
    private int pop() {
        if (count == 0)
            throw new IllegalArgumentException("Stack is empty.");
        count--;
        return storage[count];
    }

    // Return đỉnh stack không pop
    private int peek() {
        if (count == 0){
            throw new IllegalArgumentException("Stack is empty.");
        }else {
            return storage[count-1];
        }
    }

    // Kiểm tra stack có rỗng không
    private boolean isEmpty() {
        return count == 0;
    }

    // Return số element trong stack
    private int size() {
        return count;
    }

}
```

Kiểm tra:

```java
MyStack myStack = new MyStack(3);
myStack.push(1);
myStack.push(2);
myStack.push(3);
myStack.push(4);
myStack.push(5);
myStack.push(6);
myStack.push(7);
myStack.push(8);
System.out.println(myStack.peek()); // 8
System.out.println(myStack.size()); // 8
for (int i = 0; i < 8; i++) {
    System.out.println(myStack.pop());
}
System.out.println(myStack.isEmpty()); // true
myStack.pop(); // Báo lỗi: java.lang.IllegalArgumentException: Stack is empty.
```

## 4. Queue (Hàng đợi)

### 4.1. Giới thiệu Queue

**Queue** là linear table theo nguyên tắc **FIFO (First In First Out — Vào trước ra trước)**. Trong thực tế thường được triển khai bằng linked list hoặc array. Queue triển khai bằng array gọi là **sequential queue**, triển khai bằng linked list gọi là **linked queue**. **Queue chỉ cho phép insert ở phía sau (rear) — tức enqueue, xóa ở phía trước (front) — tức dequeue**.

Cách thao tác với queue tương tự stack, điểm khác biệt duy nhất là queue chỉ cho phép thêm data mới ở phía sau.

```java
Giả sử queue có n element.
Access: O(n)         // Trường hợp xấu nhất
Insert/Delete: O(1)  // Insert ở phía sau, delete ở phía trước
```

![Queue](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/queue.png)

### 4.2. Phân loại Queue

#### 4.2.1. Single Queue

Single queue là queue thông thường. Mỗi lần thêm element đều thêm vào queue tail. Single queue chia thành **sequential queue (triển khai bằng array)** và **linked queue (triển khai bằng linked list)**.

**Sequential queue tồn tại vấn đề "false overflow" — rõ ràng còn chỗ nhưng không thể thêm vào.**

Giả sử hình dưới là sequential queue. Chúng ta pop 2 element đầu 1, 2 và enqueue 2 element 7, 8. Khi thực hiện enqueue/dequeue, `front` và `rear` liên tục di chuyển về phía sau. Khi `rear` di chuyển đến cuối, không thể thêm data vào queue nữa dù mảng còn không gian trống — hiện tượng này gọi là **"false overflow"**. Ngoài vấn đề false overflow, như hình dưới, khi thêm element 8, con trỏ `rear` di chuyển ra ngoài mảng (out of bounds).

> Để tránh trường hợp khi chỉ có một element thì queue head và tail trùng nhau gây xử lý phức tạp, giới thiệu hai con trỏ: con trỏ `front` trỏ đến element đầu queue, con trỏ `rear` trỏ đến vị trí sau element cuối cùng. Như vậy khi `front` bằng `rear`, queue không phải còn một element mà là queue rỗng. — Từ 《Nói chuyện Data Structure》

![Sequential Queue False Overflow](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/seq-queue-false-overflow.png)

#### 4.2.2. Circular Queue

Circular queue có thể giải quyết vấn đề false overflow và out of bounds của sequential queue. Giải pháp là: bắt đầu từ đầu — như vậy tạo thành vòng nối đầu với đuôi. Đây cũng là nguồn gốc tên gọi circular queue.

Vẫn dùng hình trên, đặt con trỏ `rear` trỏ đến vị trí index 0 trong mảng là không còn vấn đề out of bounds. Khi thêm element vào queue, `rear` di chuyển về phía sau.

![Circular Queue](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/circular-queue.png)

Trong sequential queue, `front==rear` nghĩa là queue rỗng. Trong circular queue thì khác — cũng có thể là queue đầy như hình trên. Có hai giải pháp:

1. Đặt một biến flag `flag`. Khi `front==rear` và `flag=0` thì queue rỗng. Khi `front==rear` và `flag=1` thì queue đầy.
2. Khi queue rỗng là `front==rear`. Khi queue đầy, giữ một vị trí trống trong mảng, `rear` trỏ đến vị trí trống đó. Điều kiện queue đầy là: `(rear+1) % QueueSize==front`.

#### 4.2.3. Deque (Double-ended Queue)

**Deque (Hàng đợi hai đầu)** là queue có thể insert và delete ở cả hai đầu — linh hoạt hơn single queue.

Nói chung có thể thực hiện `addFirst`, `addLast`, `removeFirst` và `removeLast` trên deque.

#### 4.2.4. Priority Queue (Hàng đợi ưu tiên)

**Priority Queue** về cấu trúc tầng dưới không phải cấu trúc dữ liệu tuyến tính — thường được triển khai bằng heap.

1. Khi mỗi element enqueue, priority queue insert element mới vào heap và điều chỉnh heap.
2. Khi dequeue từ đầu queue, priority queue return heap top element và điều chỉnh heap.

Chi tiết triển khai heap xem phần [Heap](https://javaguide.cn/cs-basics/data-structure/heap.html).

Tóm lại, bất kể thực hiện thao tác nào, priority queue đều có thể thực hiện một loạt thao tác heap theo **một cách sắp xếp nào đó**, từ đó đảm bảo **tính có thứ tự** của toàn bộ collection.

Mặc dù cấu trúc tầng dưới của priority queue không phải strictly linear, nhưng trong quá trình dùng chúng ta không cảm nhận được **heap**. Từ góc độ người dùng, priority queue có thể coi là cấu trúc dữ liệu tuyến tính: một linear queue tự động sắp xếp.

### 4.3. Tình huống ứng dụng phổ biến của Queue

Khi cần xử lý data theo một thứ tự nhất định, có thể cân nhắc dùng queue.

- **Blocking queue**: Blocking queue có thể coi là queue với thêm blocking operation. Khi queue rỗng, dequeue block. Khi queue đầy, enqueue block. Dùng blocking queue có thể dễ dàng triển khai mô hình "producer-consumer".
- **Request/task queue trong thread pool**: Khi không có thread rảnh trong thread pool, task request thread resource mới sẽ được xử lý như thế nào? Câu trả lời là các task đó được đưa vào task queue, chờ thread rảnh trong thread pool để lấy task từ queue ra thực thi. Task queue chia thành unbounded queue (triển khai bằng linked list) và bounded queue (triển khai bằng array). Unbounded queue về lý thuyết không giới hạn capacity — task có thể tiếp tục enqueue cho đến khi system resource cạn kiệt. Ví dụ `LinkedBlockingQueue` mà `FixedThreadPool` dùng có default capacity là `Integer.MAX_VALUE`, nên có thể coi là "unbounded queue". Bounded queue thì khác — khi queue đầy, nếu có task mới submit, vì queue không thể chứa thêm, thread pool sẽ từ chối và throw `java.util.concurrent.RejectedExecutionException`.
- **Stack**: Deque tự nhiên có thể triển khai đầy đủ tính năng của stack (`push`, `pop` và `peek`), và trong interface `Deque` đã có method tương ứng. Class `Stack` đã bị bỏ như `Vector`. Hiện nay trong Java thường dùng doubly-ended queue (Deque) để triển khai stack.
- **BFS (Breadth-First Search)**: Trong quá trình BFS của graph, queue được dùng để lưu các node chờ truy cập, đảm bảo duyệt node theo thứ tự tầng.
- Linux kernel process queue (xếp hàng theo priority)
- Party trong cuộc sống thực, playlist trên player
- Message queue
- V.v.……

<!-- @include: @article-footer.snippet.md -->
