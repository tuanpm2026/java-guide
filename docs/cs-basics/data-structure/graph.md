---
title: Graph (Đồ thị)
description: Giới thiệu các khái niệm cơ bản và cách biểu diễn phổ biến của graph, kết hợp các thuật toán cốt lõi như DFS/BFS và tình huống ứng dụng, nắm vững kiến thức nhập môn graph theory.
category: Kiến thức cơ bản máy tính
tag:
  - Cấu trúc dữ liệu
head:
  - - meta
    - name: keywords
      content: graph,adjacency list,adjacency matrix,DFS,BFS,degree,directed graph,undirected graph,connectivity
---

Graph là cấu trúc phi tuyến tương đối phức tạp. **Tại sao nói là tương đối phức tạp?**

Từ nội dung trước chúng ta biết:

- Phần tử của cấu trúc dữ liệu tuyến tính thỏa quan hệ tuyến tính duy nhất. Mỗi phần tử (trừ phần tử đầu tiên và cuối cùng) chỉ có một direct predecessor và một direct successor.
- Phần tử của cấu trúc dữ liệu dạng tree có quan hệ phân cấp rõ ràng.

Nhưng quan hệ giữa các phần tử trong cấu trúc graph là tùy ý.

**Graph là gì?** Nói đơn giản, graph là tập hợp gồm tập hữu hạn không rỗng các đỉnh (vertex) và tập hợp các cạnh (edge) giữa các đỉnh. Thường biểu diễn là: **G(V,E)**, trong đó G là graph, V là tập đỉnh, E là tập cạnh.

Hình dưới là cấu trúc dữ liệu graph — đây còn là directed graph (đồ thị có hướng).

![Directed Graph](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/directed-graph.png)

Graph có rất nhiều ví dụ trong cuộc sống hàng ngày! Ví dụ quan hệ bạn bè trên mạng xã hội có thể biểu diễn bằng graph.

## Các khái niệm cơ bản của Graph

### Vertex (Đỉnh)

Phần tử dữ liệu trong graph gọi là đỉnh. Graph có ít nhất một đỉnh (tập hữu hạn không rỗng).

Trong graph quan hệ bạn bè, mỗi user là một đỉnh.

### Edge (Cạnh)

Quan hệ giữa các đỉnh được biểu diễn bằng cạnh.

Trong graph quan hệ bạn bè, nếu hai user là bạn bè thì giữa hai người tồn tại một cạnh.

### Degree (Bậc)

Degree biểu thị một đỉnh có bao nhiêu cạnh. Trong directed graph còn chia thành out-degree (bậc ra) và in-degree (bậc vào). Out-degree là số cạnh đi ra từ đỉnh đó, in-degree là số cạnh đi vào đỉnh đó.

Trong graph quan hệ bạn bè, degree biểu thị số bạn bè của một người.

### Undirected Graph và Directed Graph

Cạnh biểu thị quan hệ giữa các đỉnh. Một số quan hệ là hai chiều, như quan hệ bạn học — A là bạn học của B thì B chắc chắn là bạn học của A. Khi biểu thị quan hệ giữa A và B, không cần quan tâm đến hướng, dùng cạnh không có mũi tên để biểu thị. Graph như vậy là undirected graph.

Một số quan hệ có hướng, như quan hệ cha-con, thầy-trò, quan hệ follow trên Weibo — A là bố của B nhưng B chắc chắn không phải bố của A. A follow B nhưng B không nhất thiết follow lại A. Trong trường hợp này dùng cạnh có mũi tên để biểu thị quan hệ hai bên — graph như vậy là directed graph.

### Unweighted Graph và Weighted Graph

Với một quan hệ, nếu chúng ta chỉ quan tâm có quan hệ hay không, không quan tâm quan hệ mạnh đến đâu — có thể dùng unweighted graph biểu thị.

Với một quan hệ, nếu vừa quan tâm có quan hệ hay không, vừa quan tâm độ mạnh của quan hệ — ví dụ mô tả quan hệ giữa hai thành phố trên bản đồ cần dùng khoảng cách — thì dùng weighted graph. Mỗi cạnh trong weighted graph có một số để biểu thị trọng số, đại diện cho độ mạnh của quan hệ.

Hình dưới là weighted directed graph.

![Weighted Directed Graph](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/weighted-directed-graph.png)

## Lưu trữ Graph

### Adjacency Matrix (Ma trận kề)

Adjacency matrix lưu graph bằng ma trận hai chiều — cách biểu diễn khá trực quan.

Nếu đỉnh thứ i và đỉnh thứ j có quan hệ với trọng số n thì `A[i][j]=n`.

Trong undirected graph, chúng ta chỉ quan tâm quan hệ có hay không. Nên khi đỉnh i và đỉnh j có quan hệ thì `A[i][j]=1`, không có quan hệ thì `A[i][j]=0`. Như hình dưới:

![Adjacency Matrix của Undirected Graph](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/adjacency-matrix-representation-of-undirected-graph.png)

Đáng chú ý: **Adjacency matrix của undirected graph là symmetric matrix (ma trận đối xứng), vì trong undirected graph, đỉnh i và đỉnh j có quan hệ thì đỉnh j và đỉnh i nhất định cũng có quan hệ.**

![Adjacency Matrix của Directed Graph](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/adjacency-matrix-representation-of-directed-graph.png)

Ưu điểm của cách lưu adjacency matrix là đơn giản trực quan (chỉ cần dùng mảng hai chiều) và rất hiệu quả khi lấy quan hệ giữa hai đỉnh (trực tiếp lấy giá trị phần tử mảng tại vị trí chỉ định). Nhưng nhược điểm cũng khá rõ ràng — khá lãng phí không gian.

### Adjacency List (Danh sách kề)

Để giải quyết vấn đề adjacency matrix lãng phí memory space, ra đời cách lưu trữ graph khác — **adjacency list**.

Adjacency linked list dùng một linked list để lưu tất cả successor neighbor vertex của một vertex. Với mỗi vertex Vi trong graph, tất cả vertex Vj kề với Vi được linked thành một singly linked list, linked list này gọi là **adjacency list** của vertex Vi. Như hình dưới:

![Adjacency List của Undirected Graph](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/adjacency-list-representation-of-undirected-graph.png)

![Adjacency List của Directed Graph](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/adjacency-list-representation-of-directed-graph.png)

Hãy đếm số element trong adjacency list và số cạnh trong graph — bạn sẽ thấy:

- Trong undirected graph, số element trong adjacency list bằng gấp đôi số cạnh. Như undirected graph trong hình trái, số cạnh là 7, số element trong adjacency list là 14.
- Trong directed graph, số element trong adjacency list bằng số cạnh. Như directed graph trong hình phải, số cạnh là 8, số element trong adjacency list là 8.

## Tìm kiếm trong Graph

### BFS (Breadth-First Search — Tìm kiếm theo chiều rộng)

BFS giống như sóng nước lan rộng từng lớp từng lớp ra ngoài, như hình dưới:

![Minh họa BFS](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/breadth-first-search.png)

**Cách triển khai cụ thể của BFS dùng cấu trúc dữ liệu tuyến tính đã học — Queue**. Quá trình cụ thể như hình dưới:

**Bước 1:**

![BFS bước 1](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/breadth-first-search1.png)

**Bước 2:**

![BFS bước 2](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/breadth-first-search2.png)

**Bước 3:**

![BFS bước 3](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/breadth-first-search3.png)

**Bước 4:**

![BFS bước 4](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/breadth-first-search4.png)

**Bước 5:**

![BFS bước 5](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/breadth-first-search5.png)

**Bước 6:**

![BFS bước 6](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/breadth-first-search6.png)

### DFS (Depth-First Search — Tìm kiếm theo chiều sâu)

DFS là "đi hết một con đường" — từ vertex nguồn, cứ đi cho đến khi không còn successor node mới backtrack lên vertex trước, rồi tiếp tục "đi hết một con đường", như hình dưới:

![Minh họa DFS](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/depth-first-search.png)

**Tương tự BFS, cách triển khai cụ thể của DFS dùng cấu trúc dữ liệu tuyến tính khác — Stack**. Quá trình cụ thể như hình dưới:

**Bước 1:**

![DFS bước 1](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/depth-first-search1.png)

**Bước 2:**

![DFS bước 2](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/depth-first-search2.png)

**Bước 3:**

![DFS bước 3](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/depth-first-search3.png)

**Bước 4:**

![DFS bước 4](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/depth-first-search4.png)

**Bước 5:**

![DFS bước 5](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/depth-first-search5.png)

**Bước 6:**

![DFS bước 6](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/depth-first-search6.png)
