---
title: Red-Black Tree
description: Giải thích sâu năm tính chất và quá trình điều chỉnh xoay của Red-Black Tree, hiểu cơ chế self-balancing và ứng dụng trong standard library và cấu trúc index.
category: Kiến thức cơ bản máy tính
tag:
  - Cấu trúc dữ liệu
head:
  - - meta
    - name: keywords
      content: red-black tree,self-balancing,rotation,insert delete,properties,black height,time complexity
---

## Giới thiệu Red-Black Tree

Red-Black Tree (Cây đỏ-đen) là loại cây tìm kiếm nhị phân tự cân bằng (self-balancing binary search tree). Nó được Rudolf Bayer phát minh năm 1972, lúc đó được gọi là "symmetric binary B-trees". Sau đó, năm 1978 được Leo J. Guibas và Robert Sedgewick sửa đổi thành "Red-Black Tree" như ngày nay.

Nhờ tính chất self-balancing, nó đảm bảo hoàn thành các thao tác tìm kiếm, thêm, xóa trong time complexity O(logn) trong trường hợp xấu nhất — hiệu năng ổn định.

Trong JDK, `TreeMap`, `TreeSet` và `HashMap` từ JDK 1.8 đều sử dụng Red-Black Tree ở tầng dưới.

## Tại sao cần Red-Black Tree?

Red-Black Tree ra đời để giải quyết nhược điểm của Binary Search Tree (BST).

BST là cấu trúc dữ liệu dựa trên so sánh. Mỗi node có một key value, và key của left child nhỏ hơn key của parent node, key của right child lớn hơn key của parent. Cấu trúc này tiện cho tìm kiếm, insert và delete vì chỉ cần so sánh key là xác định được vị trí target node. Tuy nhiên BST có một vấn đề lớn: hình dạng của nó phụ thuộc vào thứ tự insert node. Nếu node được insert theo thứ tự tăng dần hoặc giảm dần, BST sẽ degenerate thành cấu trúc linear — tức linked list. Trong trường hợp này, hiệu năng BST giảm mạnh, time complexity từ O(logn) thành O(n).

Red-Black Tree ra đời để giải quyết nhược điểm của BST — BST trong một số trường hợp có thể degenerate thành cấu trúc linear.

## Đặc điểm của Red-Black Tree

1. Mỗi node hoặc là đỏ hoặc là đen. Màu đen quyết định cân bằng, màu đỏ không quyết định cân bằng. Điều này tương ứng với việc một node trong cây 2-3 có thể chứa 1~2 node.
2. Root node luôn là màu đen.
3. Mỗi leaf node đều là black empty node (NIL node). Ở đây ý nói Red-Black Tree luôn có empty leaf node — đây là quy tắc của bản thân Red-Black Tree.
4. Nếu node là đỏ thì child node của nó phải là đen (ngược lại không nhất thiết). Quy tắc này thường còn gọi là "không có hai red node liên tiếp". Một node có thể có tối đa 3 child node tạm thời — node ở giữa là black, node trái và phải là red.
5. Mọi đường đi từ bất kỳ node nào đến leaf node hay empty child node của nó đều phải chứa cùng số black node (cùng black height). Chỉ có một node ở mỗi tầng đóng góp vào tree height quyết định cân bằng — đó chính là black node trong Red-Black Tree.

Chính những đặc điểm này đảm bảo sự cân bằng của Red-Black Tree, giữ cho chiều cao không vượt quá 2log(n+1).

## Cấu trúc dữ liệu Red-Black Tree

Xây dựng trên nền BST binary search tree, AVL tree, 2-3 tree, Red-Black Tree đều là self-balancing binary search tree (gọi chung là B-tree). Nhưng so với AVL tree, time complexity do height balancing mang lại, Red-Black Tree kiểm soát cân bằng lỏng hơn một chút — chỉ cần đảm bảo black node cân bằng là đủ.

## Triển khai cấu trúc Red-Black Tree

```java
public class Node {

    public Class<?> clazz;
    public Integer value;
    public Node parent;
    public Node left;
    public Node right;

    // Thuộc tính cần cho AVL tree
    public int height;
    // Thuộc tính cần cho Red-Black Tree
    public Color color = Color.RED;

}
```

### 1. Left-leaning recoloring

![Slide 1](./pictures/红黑树/红黑树1.png)

- Khi recolor, dựa vào grandparent node của node hiện tại, tìm uncle node của node hiện tại.
- Sau đó đổi parent node thành đen, uncle node thành đen, grandparent node thành đỏ. Nhưng grandparent node đổi thành đỏ chỉ là tạm thời — sau khi thao tác cân bằng tree height xong sẽ đổi root node thành đen.

### 2. Right-leaning recoloring

![Slide 2](./pictures/红黑树/红黑树2.png)

### 3. Left rotation rebalancing

#### 3.1 Một lần left rotation

![Slide 3](./pictures/红黑树/红黑树3.png)

#### 3.2 Right rotation + Left rotation

![Slide 4](./pictures/红黑树/红黑树4.png)

### 4. Right rotation rebalancing

#### 4.1 Một lần right rotation

![Slide 5](./pictures/红黑树/红黑树5.png)

#### 4.2 Left rotation + Right rotation

![Slide 6](./pictures/红黑树/红黑树6.png)

## Bài đọc thêm

- [《Phân tích sâu Red-Black Tree và triển khai Java》- Meituan Tech Team](https://zhuanlan.zhihu.com/p/24367771)
- [Truyện tranh: Red-Black Tree là gì? - Programmer Xiao Hui](https://juejin.im/post/5a27c6946fb9a04509096248#comment) (cũng giới thiệu BST, rất khuyến nghị)

<!-- @include: @article-footer.snippet.md -->
