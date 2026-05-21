---
title: Giải thích chi tiết thuật toán Consistent Hashing
category: Distributed
description: Giải thích chi tiết nguyên lý thuật toán Consistent Hashing, giải thích hash ring, cơ chế virtual node, giải pháp cho vấn đề data skew, cùng các tình huống ứng dụng trong distributed cache (Redis/Memcached), load balancing, database sharding.
tag:
  - Distributed Protocol & Algorithm
  - Hash Algorithm
head:
  - - meta
    - name: keywords
      content: consistent hashing,hash ring,virtual node,distributed cache,load balancing,data skew,hash algorithm,distributed algorithm,database sharding
---

Trước khi bắt đầu, hãy điểm qua hai tình huống phổ biến:

1. **Load balancing**: Do lượng truy cập quá lớn, website của chúng ta deploy nhiều server để cùng cung cấp cùng một service, nhưng mỗi server lưu data khác nhau. Để đảm bảo response đúng, các request có cùng tham số (key) (như request từ cùng IP, request của cùng user) cần được gửi đến cùng một server để xử lý.
2. **Distributed cache**: Do lượng data cache quá lớn, chúng ta deploy nhiều cache server để cùng cung cấp cache service. Cache data cần được phân phối đều nhất có thể trên các cache server này, và có thể tìm thấy cache server tương ứng qua key.

Bản chất của hai tình huống này đều là cần thiết lập một **mối quan hệ mapping ổn định từ key đến server/node**.

Để đạt mục tiêu này, bạn nghĩ đến phương án nào đầu tiên?

## Thuật toán Hash thông thường

Chắc ai cũng nhanh chóng nghĩ đến **"hash + modulo"** — kết hợp kinh điển này. Dùng hash function tính hash value của key, rồi lấy modulo số server, từ đó map key đến server cố định.

Công thức đơn giản:

```java
node_number = hash(key) % N
```

- `hash(key)`: Dùng hash function (khuyến nghị dùng non-cryptographic hash function có hiệu năng tốt như SipHash, MurMurHash3, CRC32, DJB) để hash key duy nhất.
- `% N`: Lấy modulo hash value, map hash value sang giá trị từ 0 đến N-1. N là số node/server.

![Hash modulo](/images/github/javaguide/distributed-system/protocol/consistent-hashing/hashqumo.png)

Tuy nhiên, thuật toán hash modulo truyền thống có một nhược điểm khá lớn: **không thể xử lý tốt tình huống server/node bị remove động (ví dụ một server bị down) hoặc thêm mới (ví dụ thêm một server mới).**

Hãy tưởng tượng, số server ban đầu là 4 (N=4). Nếu một server bị down, N thành 3. Lúc này với cùng một key, kết quả của `hash(key) % 3` rất có thể khác hoàn toàn với `hash(key) % 4`.

![Hash modulo - Remove Node2](/images/github/javaguide/distributed-system/protocol/consistent-hashing/hashqumo-remove-node2.png)

Điều này có nghĩa là gần như tất cả mapping quan hệ dữ liệu sẽ bị loạn. Trong tình huống distributed cache, điều này sẽ gây ra **cache invalidation và cache penetration quy mô lớn**, lập tức dồn toàn bộ áp lực lên database phía sau, gây cascading failure hệ thống.

Ước tính khi số node thay đổi từ N thành N-1, trung bình (N-1)/N tỷ lệ data cần migrate — tỷ lệ này **tiến gần 100%**. Hiệu ứng "kéo một sợi chuyển cả tấm" này hoàn toàn không thể chấp nhận trong production.

Để giải quyết tốt hơn vấn đề này, Consistent Hashing algorithm ra đời.

## Consistent Hashing Algorithm

Consistent Hashing algorithm được Viện Công nghệ Massachusetts (MIT) đề xuất năm 1997 (PDF của paper này có thể đọc online tại: <https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf>). Đây là thuật toán hash đặc biệt, khi remove hay thêm một server, có thể thay đổi mapping quan hệ giữa service request và server xử lý ít nhất có thể. Consistent Hashing giải quyết các vấn đề như dynamic scaling trong Distributed Hash Table (DHT) của thuật toán hash truyền thống.

Nguyên lý tầng dưới của Consistent Hashing algorithm cũng khá đơn giản — điểm mấu chốt là việc giới thiệu **hash ring**.

### Hash Ring

Consistent Hashing algorithm tổ chức hash space thành cấu trúc vòng tròn, map cả data lẫn node lên vòng tròn này, rồi theo quy tắc chiều kim đồng hồ để xác định data hay request nên được phân phối đến node nào. Thông thường, điểm bắt đầu của hash ring là 0, điểm kết thúc là 2^32 - 1, và điểm bắt đầu kết nối với điểm kết thúc. Phạm vi phân phối integer của ring là **[0, 2^32-1]**.

Thuật toán hash truyền thống lấy modulo số server, Consistent Hashing algorithm lấy modulo phạm vi hash ring — giá trị cố định, thường là 2^32:

```java
node_number = hash(key) % 2^32
```

Server/node được map lên hash ring như thế nào? Cũng bằng hash modulo. Ví dụ thường chúng ta hash theo IP hay hostname của server, rồi lấy modulo.

```java
hash(server_ip) % 2^32
```

Như hình dưới:

![Hash Ring](/images/github/javaguide/distributed-system/protocol/consistent-hashing/consistent-hashing-circle.png)

Chúng ta map cả data lẫn node lên hash ring. Mỗi node trên ring chịu trách nhiệm một khoảng. Với hình trên, mỗi node chịu trách nhiệm data như sau:

- **Node1**: Chịu khoảng từ Node4 đến Node1 (bao gồm value6).
- **Node2**: Chịu khoảng từ Node1 đến Node2 (bao gồm value1, value2).
- **Node3**: Chịu khoảng từ Node2 đến Node3 (bao gồm value3).
- **Node4**: Chịu khoảng từ Node3 đến Node4 (bao gồm value4, value5).

### Remove/Add Node

Khi thêm hay remove node, việc giới thiệu hash ring có thể tránh phạm vi ảnh hưởng quá lớn và giảm data cần migrate.

Vẫn dùng sơ đồ hash ring trên làm ví dụ. Giả sử Node2 bị remove, thì Node3 sẽ chịu trách nhiệm data của Node2. Chỉ cần migrate data Node2 sang Node3 là xong, các node khác không bị ảnh hưởng.

![Remove Node](/images/github/javaguide/distributed-system/protocol/consistent-hashing/consistent-hashing-circle-remove-node2.png)

Tương tự, nếu thêm một Node5 mới giữa Node1 và Node2, thì một phần data mà Node2 vốn chịu trách nhiệm (tức data có hash value nằm giữa Node1 và Node5, như value1 trong hình) giờ sẽ do Node5 chịu. Chỉ cần migrate phần data này từ Node2 sang Node5 — cũng chỉ ảnh hưởng node lân cận, phạm vi ảnh hưởng rất nhỏ.

![Add Node](/images/github/javaguide/distributed-system/protocol/consistent-hashing/consistent-hashing-circle-add-node5.png)

### Vấn đề Data Skew

Trong trường hợp lý tưởng, các node phân bố đều trên ring. Tuy nhiên thực tế có thể không vậy — đặc biệt khi số node ít. Các node có thể bị map vào khu vực gần nhau, dẫn đến phần lớn data đều do một node chịu trách nhiệm.

![Data Skew](/images/github/javaguide/distributed-system/protocol/consistent-hashing/consistent-hashing-circle-unbalance.png)

Với hình trên, mỗi node chịu trách nhiệm data như sau:

- **Node1**: Chịu khoảng từ Node4 đến Node1 (bao gồm value6).
- **Node2**: Chịu khoảng từ Node1 đến Node2 (bao gồm value1).
- **Node3**: Chịu khoảng từ Node2 đến Node3 (bao gồm value2, value3, value4, value5).
- **Node4**: Chịu khoảng từ Node3 đến Node4.

Ngoài vấn đề data skew, còn có một nguy cơ tiềm ẩn. Khi thêm hay xóa node, data phân phối không đều. Ví dụ nếu Node3 bị remove, toàn bộ data của Node3 phải chuyển sang Node4, sau đó tất cả request đổ vào Node4. Nếu khả năng xử lý của server Node4 yếu, có thể sập luôn. Trong trường hợp lý tưởng nên có nhiều node hơn để chia sẻ áp lực.

Làm thế nào giải quyết những vấn đề này? Câu trả lời là giới thiệu **virtual node**.

### Virtual Node

Virtual node là các "phân thân" ảo của node vật lý thực trên hash ring. Data rơi vào virtual node thực chất là rơi vào node vật lý thực, thông qua việc phân tán đều virtual node khắp hash ring.

Như hình dưới, 4 node Node1, Node2, Node3, Node4 đều tương ứng với 3 virtual node (hình chỉ để minh họa, thực tế node distribution không đều như vậy).

![Virtual Node](/images/github/javaguide/distributed-system/protocol/consistent-hashing/consistent-hashing-circle-virtual-node.png)

Với hình trên, data mỗi node cuối cùng chịu trách nhiệm:

- **Node1**: value4
- **Node2**: value1, value3
- **Node3**: value5
- **Node4**: value2, value6

**Lợi ích của việc giới thiệu virtual node là rất lớn:**

1. **Data balancing**: Càng nhiều virtual node, "server points" trên ring càng dày đặc, data distribution tự nhiên càng đều hơn — giải quyết triệt để vấn đề data skew. Thông thường mỗi node thực tương ứng 100 đến 200 virtual node. Ví dụ Nginx chọn phân bổ 160 virtual node cho mỗi weight. Weight ở đây để phân biệt server — server có khả năng xử lý mạnh hơn có weight cao hơn, dẫn đến virtual node nhiều hơn, xác suất được hit cao hơn.
2. **Tăng fault tolerance**: Đây mới là điểm tinh tế nhất của virtual node. Khi một node vật lý bị down, nó tương đương với việc nhiều virtual node trên ring đồng thời offline. Data và traffic mà các virtual node này vốn chịu trách nhiệm sẽ **tự nhiên, đều đặn** phân tán sang **nhiều** node vật lý khác nhau để tiếp quản, thay vì tập trung áp lực vào một node hàng xóm duy nhất. Điều này cải thiện đáng kể tính ổn định và fault tolerance của hệ thống.

## Tài liệu tham khảo

- Phân tích sâu thuật toán load balancing Nginx: <https://www.taohui.tech/2021/02/08/nginx/%E6%B7%B1%E5%85%A5%E5%89%96%E6%9E%90Nginx%E8%B4%9F%E8%BD%BD%E5%9D%87%E8%A1%A1%E7%AE%97%E6%B3%95/>
- Đọc source code học architecture — Consistent Hashing: <https://zhaoyang.me/posts/consistent-hash-algorithm/>
- Tổng hợp nguyên lý thuật toán Consistent Hash: <https://mp.weixin.qq.com/s/WTz1KA9kOGrqFVTtALJzjQ>
