---
title: Tree (Cây)
description: Hệ thống giải thích các khái niệm cốt lõi và phương pháp duyệt của tree và binary tree, kết hợp các chỉ số như height/depth, củng cố nền tảng cấu trúc dữ liệu và tư duy thuật toán.
category: Kiến thức cơ bản máy tính
tag:
  - Cấu trúc dữ liệu
head:
  - - meta
    - name: keywords
      content: tree,binary tree,binary search tree,balanced tree,traversal,preorder,inorder,postorder,level-order,height,depth
---

Tree là cấu trúc dữ liệu giống như cây trong cuộc sống thực (cây lật ngược). Bất kỳ cây không rỗng nào cũng chỉ có một root node (nút gốc).

Một cây có các đặc điểm sau:

1. Bất kỳ hai node nào trong cây đều có đúng một đường đi duy nhất kết nối chúng.
2. Nếu một cây có n node thì chắc chắn có đúng n-1 cạnh.
3. Một cây không chứa chu trình.

Hình dưới là một cây, cụ thể là binary tree.

![Binary Tree](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/%E4%BA%8C%E5%8F%89%E6%A0%91-2.png)

Như hình trên, giải thích một số thuật ngữ phổ biến trong tree:

- **Node (Nút)**: Mỗi phần tử trong tree đều có thể gọi là node.
- **Root node (Nút gốc)**: Node ở tầng cao nhất hoặc node không có parent node. Trong hình trên, node A là root node.
- **Parent node (Nút cha)**: Nếu một node chứa child node thì node đó gọi là parent node của child node đó. Trong hình, node B là parent node của node D và E.
- **Child node (Nút con)**: Root node của subtree chứa trong một node gọi là child node của node đó. Trong hình, node D và E là child node của node B.
- **Sibling node (Nút anh em)**: Các node có cùng parent node gọi là sibling node với nhau. Trong hình, parent node chung của node D và E là B, nên D và E là sibling node.
- **Leaf node (Nút lá)**: Node không có child node. Trong hình, D, F, H, I đều là leaf node.
- **Chiều cao của node (Node height)**: Số cạnh trong đường đi dài nhất từ node đó đến leaf node.
- **Độ sâu của node (Node depth)**: Số cạnh trong đường đi từ root node đến node đó.
- **Tầng của node (Node level)**: Node depth + 1.
- **Chiều cao của cây (Tree height)**: Chiều cao của root node.

> Về định nghĩa depth và height của tree, có thể xem câu hỏi này trên stackoverflow: [What is the difference between tree depth and height?](https://stackoverflow.com/questions/2603692/what-is-the-difference-between-tree-depth-and-height).

## Phân loại Binary Tree

**Binary tree** là cấu trúc tree mà mỗi node có tối đa hai nhánh (không tồn tại node có degree > 2).

Hai nhánh của **binary tree** thường gọi là "**left subtree**" hoặc "**right subtree**". Và hai nhánh của **binary tree** có thứ tự left/right, không thể đảo ngược tùy ý.

Tầng thứ i của **binary tree** có tối đa `2^(i-1)` node. Binary tree có độ sâu k có tổng tối đa `2^(k+1)-1` node (trường hợp full binary tree), tối thiểu `2^(k)` node (định nghĩa về node depth còn nhiều tranh luận trong nước, tôi cá nhân đồng ý với [định nghĩa node depth của Wikipedia](<https://zh.wikipedia.org/wiki/%E6%A0%91_(%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84)#/%E6%9C%AF%E8%AF%AD>)).

![Định nghĩa node depth của Wikipedia](https://oss.javaguide.cn/github/javaguide/image-20220119112736158.png)

### Full Binary Tree (Cây nhị phân đầy đủ / Cây nhị phân hoàn hảo)

Binary tree mà mọi tầng đều có số node tối đa gọi là **full binary tree**. Tức là nếu binary tree có K tầng và tổng số node là (2^k)-1 thì đó là **full binary tree**. Như hình dưới:

![Full Binary Tree](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/full-binary-tree.png)

### Complete Binary Tree (Cây nhị phân hoàn chỉnh)

Nếu tất cả các tầng trừ tầng cuối cùng đều đầy, và tầng cuối cùng hoặc đầy hoặc thiếu một số node liên tiếp ở bên phải — binary tree đó gọi là **complete binary tree**.

Hãy tưởng tượng một cây bắt đầu mở rộng từ root node. Phải mở rộng xong left child node mới bắt đầu mở rộng right child node. Mỗi tầng mở rộng xong mới tiếp tục tầng tiếp theo. Như hình dưới:

![Complete Binary Tree](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/complete-binary-tree.png)

Complete binary tree có một tính chất rất tốt: **Parent node và child node có quan hệ tương ứng về sequence number**.

Bạn tinh mắt có thể nhận ra: Khi root node có giá trị 1, nếu parent node có sequence number là i thì left child node là 2i, right child node là 2i+1. Tính chất này giúp complete binary tree tiết kiệm nhiều không gian khi lưu bằng mảng, cũng như tìm parent node và child node của một node qua index. Sẽ giới thiệu chi tiết khi nói về lưu trữ binary tree.

### Balanced Binary Tree (Cây nhị phân cân bằng)

**Balanced binary tree** là binary sort tree có các tính chất sau:

1. Có thể là cây rỗng.
2. Nếu không rỗng, giá trị tuyệt đối của hiệu chiều cao của left subtree và right subtree không vượt quá 1, và cả left subtree lẫn right subtree đều là balanced binary tree.

Các cách triển khai phổ biến của balanced binary tree là **Red-Black Tree**, **AVL Tree**, **Scapegoat Tree**, **Weight-Balanced Tree**, **Splay Tree**, v.v.

Trước khi giới thiệu balanced binary tree, hãy xem cây này trước:

![Oblique Tree (Cây lệch)](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/oblique-tree.png)

**Cái này bạn gọi là cây à???**

Đúng vậy, cái này thực sự được gọi là cây. Chỉ là cây này đã degenerate thành linked list. Chúng ta gọi nó là **oblique tree (cây lệch)**.

**Nếu vậy tại sao không dùng thẳng linked list đi?**

Không sai!

Nhưng binary tree so với linked list, vì parent-child node và sibling node thường có một số quan hệ đặc biệt — quan hệ này khiến việc **tìm kiếm** và **sửa đổi** dữ liệu trong cây nhanh hơn và tiện hơn so với linked list.

Nhưng nếu binary tree degenerate thành linked list thì những tính chất tốt của tree khó thể hiện ra, efficiency cũng giảm đáng kể. Để tránh điều này, chúng ta muốn mỗi parent node đều "công bằng" — phần chia cho left child và right child càng bằng nhau càng tốt, chênh lệch tối đa không quá một tầng. Như hình dưới:

![Balanced Binary Tree](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/balanced-binary-tree.png)

## Lưu trữ Binary Tree

Lưu trữ binary tree chủ yếu chia thành hai loại: **linked storage** và **sequential storage**:

### Linked Storage (Lưu trữ liên kết)

Tương tự linked list, linked storage của binary tree dựa vào con trỏ để kết nối các node với nhau, không cần không gian lưu trữ liên tục.

Mỗi node bao gồm ba thuộc tính:

- Data. Data không nhất thiết là single data — tùy tình huống có thể là nhiều data với kiểu khác nhau.
- Left node pointer `left`.
- Right node pointer `right`.

Nhưng JAVA không có con trỏ!

Thì dùng object reference vậy!

![Linked Storage Binary Tree](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/chain-store-binary-tree.png)

### Sequential Storage (Lưu trữ tuần tự)

Sequential storage dùng mảng để lưu trữ. Mỗi vị trí trong mảng chỉ lưu data của node, không lưu con trỏ left/right child. Index của child node được xác định qua array index. Root node có sequence number là 1. Với mỗi node được lưu ở vị trí index i trong mảng, left child được lưu ở vị trí 2i, right child ở vị trí 2i+1.

Sequential storage của complete binary tree như hình dưới:

![Sequential Storage của Complete Binary Tree](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/sequential-storage.png)

Hãy thử điền vào mảng để lưu binary tree dưới đây, so sánh xem khác gì so với sequential storage của complete binary tree:

![Sequential Storage của Non-complete Binary Tree](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/sequential-storage2.png)

Có thể thấy nếu binary tree cần lưu không phải complete binary tree, sẽ có khoảng trống trong mảng, dẫn đến memory utilization rate giảm.

## Duyệt Binary Tree

### Pre-order Traversal (Duyệt tiền tự)

![Pre-order Traversal](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/preorder-traversal.png)

Pre-order traversal của binary tree là trước tiên output root node, rồi duyệt left subtree, cuối cùng duyệt right subtree. Khi duyệt left subtree và right subtree cũng tuân theo quy tắc pre-order traversal. Tức là có thể triển khai pre-order traversal bằng đệ quy.

Code:

```java
public void preOrder(TreeNode root){
    if(root == null){
        return;
    }
    system.out.println(root.data);
    preOrder(root.left);
    preOrder(root.right);
}
```

### In-order Traversal (Duyệt trung tự)

![In-order Traversal](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/inorder-traversal.png)

In-order traversal của binary tree là trước tiên đệ quy in-order duyệt left subtree, rồi output giá trị root node, rồi đệ quy in-order duyệt right subtree. Hãy tưởng tượng như một bàn tay đập phẳng cây — parent node bị đẩy vào giữa left và right child node. Như hình dưới:

![In-order Traversal](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/inorder-traversal2.png)

Code:

```java
public void inOrder(TreeNode root){
    if(root == null){
        return;
    }
    inOrder(root.left);
    system.out.println(root.data);
    inOrder(root.right);
}
```

### Post-order Traversal (Duyệt hậu tự)

![Post-order Traversal](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/postorder-traversal.png)

Post-order traversal của binary tree là trước tiên đệ quy post-order duyệt left subtree, rồi đệ quy post-order duyệt right subtree, cuối cùng output giá trị root node.

Code:

```java
public void postOrder(TreeNode root){
	if(root == null){
		return;
	}
    postOrder(root.left);
	postOrder(root.right);
	system.out.println(root.data);
}
```
