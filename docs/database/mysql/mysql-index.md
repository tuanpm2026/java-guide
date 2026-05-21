---
title: Giải thích chi tiết về Index MySQL
description: Giải thích chi tiết về Index MySQL, phân tích sâu cấu trúc index B+ tree, sự khác biệt giữa clustered index và secondary index, nguyên tắc tiền tố trái nhất của composite index, tối ưu covering index và index pushdown, cùng các tình huống index thất bại phổ biến.
category: Cơ sở dữ liệu
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MySQL索引,B+树索引,聚簇索引,覆盖索引,联合索引,索引下推,回表查询,索引失效,最左前缀原则
---

> Cảm ơn [WT-AHA](https://github.com/WT-AHA) đã hoàn thiện bài viết này, PR liên quan: <https://github.com/Snailclimb/JavaGuide/pull/1648>.

Dù đã trải qua vài buổi phỏng vấn, chắc các bạn đều hiểu kiến thức index cơ sở dữ liệu xuất hiện với tần suất cao đến chừng nào trong phỏng vấn.

Ngoài việc rất quan trọng cho việc chuẩn bị phỏng vấn, sử dụng index đúng cách cũng cải thiện hiệu năng SQL rất đáng kể, là một phương pháp tối ưu SQL có tính giá thành/hiệu quả cao.

## Giới thiệu Index

**Index là một cấu trúc dữ liệu dùng để truy vấn và tìm kiếm dữ liệu nhanh chóng, về bản chất có thể coi là một cấu trúc dữ liệu đã được sắp xếp.**

Vai trò của index tương đương với mục lục của sách. Ví dụ: khi chúng ta tra từ điển, nếu không có mục lục, chúng ta chỉ có thể lật từng trang để tìm từ cần tra, rất chậm; nếu có mục lục, chúng ta chỉ cần tra vị trí chữ trong mục lục trước, rồi lật thẳng đến trang đó.

Cấu trúc dữ liệu lớp dưới của index có nhiều loại, các cấu trúc index phổ biến gồm: B tree, B+ tree, Hash, red-black tree. Trong MySQL, dù là Innodb hay MyISAM, đều dùng B+ tree làm cấu trúc index.

## Ưu nhược điểm của Index

**Ưu điểm của Index:**

1. **Tốc độ truy vấn tăng vọt (mục đích chính)**: Thông qua index, cơ sở dữ liệu có thể **giảm đáng kể lượng dữ liệu cần quét**, định vị trực tiếp đến bản ghi phù hợp, từ đó tăng tốc đáng kể tốc độ truy xuất dữ liệu, giảm số lần I/O đĩa.
2. **Đảm bảo tính duy nhất dữ liệu**: Bằng cách tạo **Unique Index**, có thể đảm bảo giá trị của một cột (hoặc kết hợp một vài cột) trong bảng là duy nhất, như ID người dùng, email, v.v. Khóa chính bản thân là một loại unique index.
3. **Tăng tốc sắp xếp và nhóm**: Nếu các cột trong mệnh đề ORDER BY hoặc GROUP BY của truy vấn có index, cơ sở dữ liệu thường có thể trực tiếp tận dụng đặc điểm đã được sắp xếp của index, tránh thao tác sắp xếp thêm, từ đó nâng cao hiệu năng.

**Nhược điểm của Index:**

1. **Tốn thời gian tạo và duy trì**: Bản thân việc tạo index cần thời gian, đặc biệt khi thao tác với bảng lớn. Quan trọng hơn, khi **thêm, xóa, sửa (thao tác DML)** dữ liệu trong bảng, không chỉ cần thao tác dữ liệu, mà index liên quan cũng phải được cập nhật và duy trì động, điều này sẽ **giảm hiệu quả thực thi của các thao tác DML**.
2. **Chiếm dụng không gian lưu trữ**: Index bản chất cũng là một cấu trúc dữ liệu, cần lưu trữ dưới dạng file vật lý (hoặc cấu trúc bộ nhớ), vì vậy sẽ **chiếm thêm một lượng không gian đĩa nhất định**. Càng nhiều index, index càng lớn, không gian chiếm dụng càng nhiều.
3. **Có thể bị sử dụng sai hoặc thất bại**: Nếu thiết kế index không đúng, hoặc câu lệnh truy vấn viết không tốt, optimizer của cơ sở dữ liệu có thể không chọn sử dụng index (hoặc chọn sai index), ngược lại dẫn đến giảm hiệu năng.

**Vậy, dùng index có nhất định cải thiện hiệu năng truy vấn không?**

**Không nhất thiết.** Trong hầu hết trường hợp, sử dụng index hợp lý thực sự nhanh hơn nhiều so với quét toàn bảng. Nhưng cũng có ngoại lệ:

- **Lượng dữ liệu quá nhỏ**: Nếu dữ liệu trong bảng rất ít (ví dụ chỉ vài trăm bản ghi), quét toàn bảng có thể nhanh hơn tìm kiếm qua index, vì bản thân việc đi theo index cũng có chi phí.
- **Tỷ lệ kết quả truy vấn quá lớn**: Nếu dữ liệu cần truy vấn chiếm phần lớn toàn bảng (ví dụ vượt quá 20%-30%), optimizer có thể cho rằng quét toàn bảng kinh tế hơn, vì chi phí quay lại bảng nhiều lần (random I/O) qua index có thể cao hơn so với quét toàn bảng tuần tự một lần.
- **Duy trì index không đúng hoặc thống kê thông tin lỗi thời**: Dẫn đến optimizer đưa ra phán đoán sai.

## Lựa chọn cấu trúc dữ liệu lớp dưới cho Index

### Bảng Hash

Bảng Hash là tập hợp các cặp key-value, thông qua key có thể lấy ra value tương ứng nhanh chóng, vì vậy bảng hash có thể truy xuất dữ liệu nhanh (gần O(1)).

**Tại sao có thể lấy ra value nhanh chóng qua key?** Lý do là **thuật toán hash** (còn gọi là thuật toán tán xạ). Thông qua thuật toán hash, chúng ta có thể nhanh chóng tìm thấy index tương ứng với key, tìm được index là tìm được value tương ứng.

```java
hash = hashfunc(key)
index = hash % array_size
```

![](https://oss.javaguide.cn/github/javaguide/database/mysql20210513092328171.png)

Nhưng! Thuật toán hash có vấn đề **Hash collision**, tức là nhiều key khác nhau cuối cùng thu được index giống nhau. Thông thường, giải pháp phổ biến là **chaining (phương pháp chuỗi)**. Phương pháp chuỗi là lưu trữ dữ liệu va chạm hash trong linked list. Ví dụ `HashMap` trước JDK1.8 giải quyết hash collision bằng phương pháp chuỗi. Tuy nhiên, từ JDK1.8 trở đi `HashMap` giới thiệu red-black tree để nâng cao hiệu quả tìm kiếm khi linked list quá dài.

![](https://oss.javaguide.cn/github/javaguide/database/mysql20210513092224836.png)

Để giảm xảy ra hash collision, một hàm hash tốt nên "đều đặn" phân phối dữ liệu trong toàn bộ tập giá trị hash có thể.

MySQL storage engine InnoDB không hỗ trợ trực tiếp hash index thông thường, nhưng trong InnoDB storage engine có một loại "Adaptive Hash Index" (index hash thích nghi) đặc biệt. Adaptive Hash Index không phải là pure hash index theo nghĩa truyền thống, mà kết hợp các đặc điểm của B+Tree và hash index để thích nghi tốt hơn với các mô hình truy cập dữ liệu và nhu cầu hiệu năng trong ứng dụng thực tế. Mỗi bucket hash của Adaptive Hash Index thực chất là một cấu trúc B+Tree nhỏ. Cấu trúc B+Tree này có thể lưu trữ nhiều cặp key-value, không chỉ một key. Điều này giúp giảm độ dài chuỗi va chạm hash, nâng cao hiệu quả index. Về giới thiệu chi tiết Adaptive Hash Index, có thể xem bài viết [MySQL các loại "Buffer" - Adaptive Hash Index](https://mp.weixin.qq.com/s/ra4v1XR5pzSWc-qtGO-dBg).

Vì hash table nhanh như vậy, **tại sao MySQL không dùng nó làm cấu trúc dữ liệu index?** Chủ yếu vì Hash index không hỗ trợ truy vấn sắp xếp và phạm vi. Giả sử chúng ta muốn sắp xếp hoặc truy vấn phạm vi dữ liệu trong bảng, Hash index không làm được. Và mỗi lần I/O chỉ lấy được một bản ghi.

Hãy thử một tình huống:

```java
SELECT * FROM tb1 WHERE id < 500;
```

Trong truy vấn phạm vi này, B+Tree có ưu thế rất lớn, chỉ cần duyệt qua các nút lá nhỏ hơn 500 là đủ. Còn Hash index dựa trên thuật toán hash để định vị, lẽ nào còn phải tính hash cho từng dữ liệu từ 1 đến 499? Đây chính là nhược điểm lớn nhất của Hash.

### Cây tìm kiếm nhị phân (BST)

Binary Search Tree là một cấu trúc dữ liệu dựa trên cây nhị phân, có các đặc điểm sau:

1. Tất cả các nút trong cây con trái đều nhỏ hơn giá trị nút gốc.
2. Tất cả các nút trong cây con phải đều lớn hơn giá trị nút gốc.
3. Cây con trái và phải cũng là cây tìm kiếm nhị phân.

Khi cây tìm kiếm nhị phân cân bằng, tức độ sâu của cây con trái và phải của mỗi nút trong cây không chênh lệch quá 1, độ phức tạp thời gian truy vấn là O(log2(N)), có hiệu quả khá cao. Tuy nhiên, khi cây tìm kiếm nhị phân không cân bằng, ví dụ trong trường hợp xấu nhất (chèn nút theo thứ tự), cây sẽ thoái hóa thành linked list tuyến tính (còn gọi là cây nghiêng), dẫn đến hiệu quả truy vấn giảm mạnh, độ phức tạp thời gian thoái hóa về O(N).

![Cây nghiêng](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/oblique-tree.png)

Tức là, **hiệu năng của cây tìm kiếm nhị phân phụ thuộc rất nhiều vào mức độ cân bằng của nó, dẫn đến nó không phù hợp làm cấu trúc dữ liệu index lớp dưới cho MySQL.**

Để giải quyết vấn đề này và nâng cao hiệu quả truy vấn, người ta phát minh ra nhiều loại cấu trúc dữ liệu cải tiến dựa trên cây tìm kiếm nhị phân, như cây cân bằng nhị phân (AVL tree), B-Tree, B+Tree, v.v.

### AVL tree

AVL tree là cây tìm kiếm nhị phân tự cân bằng đầu tiên được phát minh trong khoa học máy tính, tên được lấy từ chữ viết tắt tên của người phát minh G.M. Adelson-Velsky và E.M. Landis. Đặc điểm của AVL tree là đảm bảo độ chênh lệch chiều cao của cây con trái và phải của bất kỳ nút nào không vượt quá 1, vì vậy còn được gọi là cây nhị phân cân bằng theo chiều cao, độ phức tạp thời gian tìm kiếm, chèn và xóa trong cả trường hợp trung bình và tệ nhất đều là O(logn).

![](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/avl-tree.png)

AVL tree dùng phép quay để duy trì cân bằng. Chủ yếu có bốn loại phép quay: LL rotation, RR rotation, LR rotation và RL rotation. Trong đó LL rotation và RR rotation được dùng để xử lý mất cân bằng trái-trái và phải-phải, còn LR rotation và RL rotation được dùng để xử lý mất cân bằng trái-phải và phải-trái.

Vì AVL tree cần thường xuyên thực hiện phép quay để duy trì cân bằng, sẽ có chi phí tính toán lớn từ đó giảm hiệu năng thao tác ghi của cơ sở dữ liệu. Ngoài ra, khi sử dụng AVL tree, mỗi nút của cây chỉ lưu một dữ liệu, mỗi lần I/O đĩa chỉ đọc được dữ liệu của một nút, nếu dữ liệu cần truy vấn phân tán trên nhiều nút, cần thực hiện nhiều lần I/O đĩa. **I/O đĩa là thao tác tốn thời gian, khi thiết kế index cơ sở dữ liệu, chúng ta cần ưu tiên cân nhắc cách giảm tối đa số lần I/O đĩa.**

Trong ứng dụng thực tế, AVL tree không được dùng nhiều.

### Red-black tree

Red-black tree là cây tìm kiếm nhị phân tự cân bằng, thông qua thay đổi màu sắc và phép quay khi chèn và xóa nút, giữ cho cây luôn ở trạng thái cân bằng, nó có các đặc điểm sau:

1. Mỗi nút là màu đỏ hoặc đen;
2. Nút gốc luôn là màu đen;
3. Mỗi nút lá đều là nút đen rỗng (NIL node);
4. Nếu nút là màu đỏ, thì nút con của nó phải là màu đen (ngược lại chưa chắc đúng);
5. Mỗi đường dẫn từ bất kỳ nút nào đến nút lá hoặc nút con rỗng của nó, phải chứa cùng số nút đen (tức cùng chiều cao đen).

![Red-black tree](https://oss.javaguide.cn/github/javaguide/cs-basics/data-structure/red-black-tree.png)

Khác với AVL tree, red-black tree không theo đuổi cân bằng nghiêm ngặt, mà là cân bằng tương đối. Chính vì vậy, hiệu quả truy vấn của red-black tree hơi giảm, vì tính cân bằng của red-black tree tương đối yếu, có thể dẫn đến chiều cao cây cao hơn, điều này có thể dẫn đến một số dữ liệu cần thực hiện nhiều lần I/O đĩa mới truy vấn được, đây cũng là lý do chính MySQL không chọn red-black tree. Cũng chính vì vậy, hiệu quả chèn và xóa của red-black tree được nâng cao đáng kể, vì red-black tree khi chèn và xóa nút chỉ cần thực hiện O(1) lần phép quay và đổi màu để duy trì trạng thái cân bằng cơ bản, không cần thực hiện O(logn) lần phép quay như AVL tree.

**Ứng dụng của red-black tree khá rộng rãi, TreeMap, TreeSet và HashMap của JDK1.8 ở lớp dưới đều dùng red-black tree. Đối với trường hợp dữ liệu trong bộ nhớ, hiệu suất của red-black tree là rất xuất sắc.**

### B tree & B+ tree

B tree còn gọi là B- tree, tên đầy đủ là **cây tìm kiếm cân bằng đa chiều**, B+ tree là một biến thể của B tree. B trong B tree và B+ tree là viết tắt của `Balanced` (cân bằng).

Hiện tại hầu hết các hệ thống cơ sở dữ liệu và hệ thống file đều dùng B-Tree hoặc biến thể B+Tree làm cấu trúc index.

**Vậy B tree và B+ tree có gì giống và khác nhau?**

- Tất cả các nút của B tree đều lưu cả key và data, còn B+ tree chỉ có nút lá lưu key và data, các nút nội không lưu gì ngoài key.
- Các nút lá của B tree là độc lập; các nút lá của B+ tree có một chuỗi tham chiếu trỏ đến nút lá kề cạnh.
- Quá trình tìm kiếm của B tree tương đương với tìm kiếm nhị phân trên khóa của mỗi nút trong phạm vi, có thể chưa đến nút lá tìm kiếm đã kết thúc. Còn hiệu quả tìm kiếm của B+ tree rất ổn định, bất kỳ tìm kiếm nào cũng là quá trình từ nút gốc đến nút lá, tìm kiếm tuần tự trên nút lá rõ ràng hơn.
- Khi thực hiện truy vấn phạm vi trong B tree, trước tiên tìm giới hạn dưới cần tìm, sau đó duyệt B tree theo thứ tự giữa đến khi tìm thấy giới hạn trên; còn truy vấn phạm vi của B+ tree chỉ cần duyệt linked list là đủ.

Tóm lại, B+ tree so với B tree có ít lần I/O hơn, hiệu quả truy vấn ổn định hơn và phù hợp hơn với truy vấn phạm vi.

Trong MySQL, cả engine MyISAM và InnoDB đều dùng B+Tree làm cấu trúc index, nhưng cách triển khai của hai engine không hoàn toàn giống nhau. (Nội dung dưới đây được tổng hợp từ 《Đạo tu luyện của Java Engineer》)

> Trong engine MyISAM, miền data của nút lá B+Tree lưu địa chỉ của bản ghi dữ liệu. Khi tìm kiếm index, trước tiên tìm kiếm theo thuật toán B+Tree, nếu key chỉ định tồn tại, lấy giá trị miền data của nó, sau đó đọc bản ghi dữ liệu tương ứng với địa chỉ miền data. Đây được gọi là "**non-clustered index (non-clustered index)**".
>
> Trong engine InnoDB, file dữ liệu của nó chính là file index. So với MyISAM, file index và file dữ liệu là tách biệt, file dữ liệu bảng chính là một cấu trúc index được tổ chức theo B+Tree, miền data của nút lá cây lưu bản ghi dữ liệu đầy đủ. Key của index này là khóa chính của bảng dữ liệu, vì vậy file dữ liệu bảng InnoDB chính là primary index. Đây được gọi là "**clustered index (clustered index)**", còn các index còn lại đóng vai trò là **secondary index**, miền data của secondary index lưu giá trị khóa chính của bản ghi tương ứng chứ không phải địa chỉ, đây cũng là điểm khác với MyISAM. Khi tìm kiếm theo primary index, trực tiếp tìm đến nút chứa key là lấy được dữ liệu; khi tìm kiếm theo secondary index, cần trước tiên lấy giá trị khóa chính, sau đó đi thêm một vòng theo primary index. Vì vậy, khi thiết kế bảng, không nên dùng trường quá dài làm khóa chính, cũng không nên dùng trường không đơn điệu làm khóa chính, điều này sẽ gây ra primary index thường xuyên bị split.

## Tổng kết các loại Index

Phân loại theo chiều cấu trúc dữ liệu:

- BTree index: Loại index mặc định và phổ biến nhất trong MySQL. Chỉ có nút lá lưu value, nút phi lá chỉ có con trỏ và key. Engine MyISAM và InnoDB đều triển khai BTree index bằng B+Tree, nhưng cách triển khai của hai engine không hoàn toàn giống nhau (đã giới thiệu ở trên).
- Hash index: Dạng cặp key-value, có thể định vị trong một lần.
- RTree index: Thường không được dùng, chỉ hỗ trợ kiểu dữ liệu geometry, ưu thế trong tìm kiếm phạm vi, hiệu quả tương đối thấp, thường được thay thế bằng search engine như ElasticSearch.
- Full-text index: Phân từ nội dung văn bản, thực hiện tìm kiếm. Hiện tại chỉ có thể tạo full-text index trên cột `CHAR`, `VARCHAR`, `TEXT`. Thường không được dùng, hiệu quả tương đối thấp, thường được thay thế bằng search engine như ElasticSearch.

Phân loại theo góc cách lưu trữ lớp dưới:

- Clustered index (clustered index): Index có cấu trúc và dữ liệu lưu cùng nhau, primary key index trong InnoDB thuộc clustered index.
- Non-clustered index (non-clustered index): Index có cấu trúc và dữ liệu lưu tách biệt, secondary index (auxiliary index) thuộc non-clustered index. MySQL engine MyISAM, dù là primary key hay non-primary key, đều dùng non-clustered index.

Phân loại theo chiều ứng dụng:

- Primary key index: Tăng tốc truy vấn + giá trị cột duy nhất (không được là NULL) + chỉ có một trong bảng.
- Ordinary index: Chỉ tăng tốc truy vấn.
- Unique index: Tăng tốc truy vấn + giá trị cột duy nhất (có thể có NULL).
- Covering index: Một index bao gồm (hoặc che phủ) tất cả các trường cần truy vấn.
- Composite index: Nhiều giá trị cột tạo thành một index, chuyên dùng cho tìm kiếm kết hợp, hiệu quả cao hơn index merge.
- Full-text index: Phân từ nội dung văn bản, thực hiện tìm kiếm. Hiện tại chỉ có thể tạo full-text index trên cột `CHAR`, `VARCHAR`, `TEXT`. Thường không được dùng, hiệu quả tương đối thấp, thường được thay thế bằng search engine như ElasticSearch.
- Prefix index: Tạo index trên một vài ký tự đầu của văn bản, so với ordinary index xây dựng dữ liệu nhỏ hơn, vì chỉ lấy một vài ký tự đầu.

Tính năng index mới được triển khai trong MySQL 8.x:

- Invisible index: Còn gọi là non-visible index, không được optimizer sử dụng, nhưng vẫn cần duy trì, thường được dùng trong các tình huống soft delete và gray release. Primary key không thể đặt thành invisible (bao gồm đặt rõ ràng hoặc ngầm định).
- Descending index: Các phiên bản trước đã hỗ trợ chỉ định index là descending qua desc, nhưng thực tế vẫn tạo ascending index thông thường. Đến phiên bản MySQL 8.x mới thực sự hỗ trợ descending index. Ngoài ra, trong MySQL 8.x, không còn sắp xếp ngầm định cho câu lệnh GROUP BY nữa.
- Function index: Từ phiên bản MySQL 8.0.13 bắt đầu hỗ trợ dùng giá trị hàm hoặc biểu thức trong index, tức có thể bao gồm hàm hoặc biểu thức trong index.

## Primary Key Index

Cột khóa chính của bảng dữ liệu dùng primary key index.

Một bảng dữ liệu chỉ có thể có một khóa chính, và khóa chính không được là null, không được trùng lặp.

Trong bảng InnoDB của MySQL, khi không rõ ràng chỉ định khóa chính của bảng, InnoDB sẽ tự động kiểm tra xem bảng có trường unique index không cho phép tồn tại giá trị null không, nếu có, chọn trường đó làm khóa chính mặc định, nếu không InnoDB sẽ tự động tạo một khóa chính tự tăng 6 Byte.

![Primary key index](https://oss.javaguide.cn/github/javaguide/open-source-project/cluster-index.png)

## Secondary Index

Nút lá của Secondary Index lưu giá trị khóa chính, tức thông qua secondary index có thể xác định vị trí của khóa chính, secondary index còn được gọi là auxiliary index/non-primary key index.

Unique index, ordinary index, prefix index, v.v. đều thuộc secondary index.

PS: Các bạn chưa hiểu có thể giữ câu hỏi, đọc tiếp xuống dưới sẽ có câu trả lời, hoặc tự tìm kiếm.

1. **Unique Key**: Unique index cũng là một loại ràng buộc. Cột thuộc tính của unique index không thể xuất hiện dữ liệu trùng lặp, nhưng cho phép dữ liệu là NULL, một bảng cho phép tạo nhiều unique index. Mục đích xây dựng unique index hầu hết là vì tính duy nhất của dữ liệu trong cột thuộc tính đó, chứ không phải vì hiệu quả truy vấn.
2. **Ordinary Index**: Vai trò duy nhất của ordinary index là truy vấn dữ liệu nhanh. Một bảng cho phép tạo nhiều ordinary index, và cho phép dữ liệu trùng lặp và NULL.
3. **Prefix Index**: Prefix index chỉ áp dụng cho dữ liệu kiểu chuỗi. Prefix index tạo index trên một vài ký tự đầu của văn bản, so với ordinary index xây dựng dữ liệu nhỏ hơn, vì chỉ lấy một vài ký tự đầu.
4. **Full Text Index**: Full text index chủ yếu để tìm kiếm thông tin từ khóa trong dữ liệu văn bản lớn, là một công nghệ đang được sử dụng trong cơ sở dữ liệu search engine. Trước Mysql5.6 chỉ có engine MyISAM hỗ trợ full text index, sau 5.6 InnoDB cũng hỗ trợ full text index.

Secondary index:

![Secondary index](https://oss.javaguide.cn/github/javaguide/open-source-project/no-cluster-index.png)

## Clustered Index và Non-Clustered Index

### Clustered Index (Clustered Index)

#### Giới thiệu Clustered Index

Clustered Index (Clustered Index) tức index có cấu trúc và dữ liệu lưu cùng nhau, không phải là một loại index riêng biệt. Primary key index trong InnoDB thuộc clustered index.

Trong MySQL, file `.ibd` của bảng trong engine InnoDB chứa cả index và dữ liệu của bảng đó, đối với bảng engine InnoDB, mỗi nút phi lá của index (B+ tree) lưu index, nút lá lưu index và dữ liệu tương ứng với index.

#### Ưu nhược điểm của Clustered Index

**Ưu điểm**:

- **Tốc độ truy vấn rất nhanh**: Tốc độ truy vấn của clustered index rất nhanh, vì toàn bộ B+ tree là một cây cân bằng đa nhánh, các nút lá đều đã được sắp xếp, định vị đến nút index tương đương với định vị đến dữ liệu. So với non-clustered index, clustered index giảm một lần I/O đọc dữ liệu.
- **Tối ưu cho tìm kiếm sắp xếp và phạm vi**: Clustered index rất nhanh cho tìm kiếm sắp xếp và phạm vi của khóa chính.

**Nhược điểm**:

- **Phụ thuộc vào dữ liệu có thứ tự**: Vì B+ tree là cây cân bằng đa nhánh, nếu dữ liệu index không có thứ tự, thì cần sắp xếp khi chèn, nếu dữ liệu là số nguyên thì còn được, còn dữ liệu dài và khó so sánh như chuỗi hoặc UUID, tốc độ chèn hay tìm kiếm chắc chắn sẽ chậm hơn.
- **Chi phí cập nhật cao**: Nếu dữ liệu trong cột index bị sửa đổi, thì index tương ứng cũng sẽ bị sửa đổi, và nút lá của clustered index còn lưu dữ liệu, chi phí sửa đổi chắc chắn tương đối lớn, vì vậy đối với primary key index, khóa chính thường không được phép sửa đổi.

### Non-Clustered Index (Non-Clustered Index)

#### Giới thiệu Non-Clustered Index

Non-Clustered Index (Non-Clustered Index) tức index có cấu trúc và dữ liệu lưu tách biệt, không phải là một loại index riêng biệt. Secondary index (auxiliary index) thuộc non-clustered index. MySQL engine MyISAM, dù là primary key hay non-primary key, đều dùng non-clustered index.

Nút lá của non-clustered index không nhất thiết lưu con trỏ đến dữ liệu, vì nút lá của secondary index lưu khóa chính, sau đó quay lại bảng theo khóa chính để truy vấn dữ liệu.

#### Ưu nhược điểm của Non-Clustered Index

**Ưu điểm**:

Chi phí cập nhật nhỏ hơn clustered index. Chi phí cập nhật của non-clustered index không lớn như clustered index, vì nút lá của non-clustered index không lưu dữ liệu.

**Nhược điểm**:

- **Phụ thuộc vào dữ liệu có thứ tự**: Cũng như clustered index, non-clustered index cũng phụ thuộc vào dữ liệu có thứ tự.
- **Có thể cần truy vấn lần hai (quay lại bảng)**: Đây có lẽ là nhược điểm lớn nhất của non-clustered index. Khi tìm đến con trỏ hoặc khóa chính tương ứng với index, có thể cần quay lại file dữ liệu hoặc bảng theo con trỏ hoặc khóa chính để truy vấn.

Đây là ảnh chụp màn hình file của bảng MySQL:

![File bảng MySQL](https://oss.javaguide.cn/github/javaguide/database/mysql20210420165311654.png)

Clustered index và non-clustered index:

![Clustered index và non-clustered index](https://oss.javaguide.cn/github/javaguide/database/mysql20210420165326946.png)

#### Non-clustered index có nhất thiết phải quay lại bảng không (Covering index)?

**Non-clustered index không nhất thiết phải quay lại bảng.**

Hãy thử một tình huống, người dùng chuẩn bị dùng SQL để truy vấn tên người dùng, và trường tên người dùng vừa hay đã tạo index.

```sql
 SELECT name FROM table WHERE name='guang19';
```

Thì key của index này chính là name, tìm thấy name tương ứng trực tiếp trả về là được, không cần quay lại bảng.

Dù là MyISAM cũng như vậy, dù primary key index của MyISAM thực sự cần quay lại bảng, vì nút lá của primary key index lưu con trỏ. Nhưng! **Nếu SQL truy vấn chính là khóa chính?**

```sql
SELECT id FROM table WHERE id=1;
```

Bản thân primary key index có key chính là khóa chính, tìm thấy trả về là được. Tình huống này được gọi là covering index.

## Covering Index và Composite Index

### Covering Index

Nếu một index bao gồm (hoặc che phủ) tất cả các trường cần truy vấn, chúng ta gọi đó là **covering index (Covering Index)**.

Trong storage engine InnoDB, nút lá của non-primary key index chứa giá trị khóa chính. Điều này có nghĩa là khi sử dụng non-primary key index để truy vấn, cơ sở dữ liệu trước tiên tìm giá trị khóa chính tương ứng, sau đó thông qua primary key index để định vị và truy xuất dữ liệu hàng đầy đủ. Quá trình này được gọi là "quay lại bảng".

**Covering index tức các trường cần truy vấn chính là trường của index, thì trực tiếp dựa trên index đó có thể truy vấn được dữ liệu, không cần quay lại bảng.**

> Ví dụ primary key index, nếu một SQL cần truy vấn khóa chính, thì chính xác là dựa trên primary key index có thể tìm thấy khóa chính. Ví dụ khác là ordinary index, nếu một SQL cần truy vấn name, trường name vừa hay có index,
> thì trực tiếp dựa trên index này có thể truy vấn được dữ liệu, cũng không cần quay lại bảng.

![Covering index](https://oss.javaguide.cn/github/javaguide/database/mysql20210420165341868.png)

Dưới đây là demo đơn giản về hiệu ứng covering index.

1、Tạo một bảng tên `cus_order`, để kiểm tra thực tế phương thức sắp xếp này. Để thuận tiện kiểm tra, bảng `cus_order` này chỉ có 3 trường `id`, `score`, `name`.

```sql
CREATE TABLE `cus_order` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `score` int(11) NOT NULL,
  `name` varchar(11) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8mb4;
```

2、Định nghĩa một stored procedure (PROCEDURE) đơn giản để chèn dữ liệu kiểm tra 100 vạn bản ghi.

```sql
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `BatchinsertDataToCusOder`(IN start_num INT,IN max_num INT)
BEGIN
      DECLARE i INT default start_num;
      WHILE i < max_num DO
          insert into `cus_order`(`id`, `score`, `name`)
          values (i,RAND() * 1000000,CONCAT('user', i));
          SET i = i + 1;
      END WHILE;
  END;;
DELIMITER ;
```

Sau khi định nghĩa stored procedure xong, thực thi stored procedure là được!

```sql
CALL BatchinsertDataToCusOder(1, 1000000); # Chèn 100 vạn+ dữ liệu ngẫu nhiên
```

Đợi một lúc, 100 vạn dữ liệu kiểm tra đã chèn xong!

3、Tạo covering index và dùng lệnh `EXPLAIN` phân tích.

Để sắp xếp 100 vạn dữ liệu này theo `score`, chúng ta cần thực thi câu SQL dưới đây.

```sql
#Sắp xếp giảm dần
SELECT `score`,`name` FROM `cus_order` ORDER BY `score` DESC;
```

Dùng lệnh `EXPLAIN` phân tích câu SQL này, thông qua `Using filesort` trong cột `Extra`, chúng ta phát hiện không có dùng covering index.

![](https://oss.javaguide.cn/github/javaguide/mysql/not-using-covering-index-demo.png)

Tất nhiên điều này cũng là lẽ đương nhiên, vì chúng ta chưa tạo index!

Ở đây chúng ta tạo composite index trên hai trường `score` và `name`:

```sql
ALTER TABLE `cus_order` ADD INDEX id_score_name(score, name);
```

Sau khi tạo xong, dùng lệnh `EXPLAIN` phân tích lại câu SQL này.

![](https://oss.javaguide.cn/github/javaguide/mysql/using-covering-index-demo.png)

Thông qua `Using index` trong cột `Extra`, cho thấy câu SQL này đã sử dụng thành công covering index.

Về giới thiệu chi tiết lệnh `EXPLAIN` xem bài viết: [Phân tích kế hoạch thực thi MySQL](./mysql-query-execution-plan.md).

### Composite Index

Tạo index bằng nhiều trường trong bảng gọi là **composite index**, còn được gọi là **combination index** hoặc **compound index**.

Tạo composite index trên hai trường `score` và `name`:

```sql
ALTER TABLE `cus_order` ADD INDEX id_score_name(score, name);
```

### Nguyên tắc khớp tiền tố trái nhất

Nguyên tắc khớp tiền tố trái nhất là khi sử dụng composite index, MySQL sẽ khớp từ trái sang phải theo thứ tự trường trong index với điều kiện trong truy vấn. Nếu điều kiện truy vấn khớp với trường ngoài cùng bên trái của index, thì MySQL sẽ dùng index để lọc dữ liệu, giúp nâng cao hiệu quả truy vấn.

Nguyên tắc khớp trái nhất sẽ tiếp tục khớp sang phải, cho đến khi gặp truy vấn phạm vi (như >, <). Đối với truy vấn phạm vi >=, <=, BETWEEN và LIKE khớp tiền tố, không dừng khớp.

Giả sử có composite index `(column1, column2, column3)`, tất cả tiền tố từ trái sang phải của nó là `(column1)`, `(column1, column2)`, `(column1, column2, column3)` (tạo 1 composite index tương đương với tạo 3 index), tất cả truy vấn bao gồm các cột này đều sẽ đi theo index chứ không quét toàn bảng.

Khi sử dụng composite index, có thể đặt trường có mức độ phân biệt cao ở phía bên trái nhất, điều này cũng có thể lọc được nhiều dữ liệu hơn.

Dưới đây là demo đơn giản về hiệu ứng khớp tiền tố trái nhất.

1、Tạo một bảng tên `student`, bảng này chỉ có 3 trường `id`, `name`, `class`.

```sql
CREATE TABLE `student` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `class` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `name_class_idx` (`name`,`class`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

2、Dưới đây chúng ta kiểm tra lần lượt ba câu SQL khác nhau.

![](https://oss.javaguide.cn/github/javaguide/database/mysql/leftmost-prefix-matching-rule.png)

```sql
# Có thể đánh vào index
SELECT * FROM student WHERE name = 'Anne Henry';
EXPLAIN SELECT * FROM student WHERE name = 'Anne Henry' AND class = 'lIrm08RYVk';
# Không thể đánh vào index
SELECT * FROM student WHERE class = 'lIrm08RYVk';
```

Hãy xem thêm một câu hỏi phỏng vấn phổ biến: Nếu có index `composite index (a, b, c)`, truy vấn `a=1 AND c=1` có đánh vào index không? `c=1` thì sao? `b=1 AND c=1` thì sao? `b = 1 AND a = 1 AND c = 1` thì sao?

Đừng nhìn đáp án vội, cho mình 3 phút để nghĩ.

1. Truy vấn `a=1 AND c=1`: Theo nguyên tắc khớp tiền tố trái nhất, truy vấn có thể dùng phần tiền tố của index. Vì vậy, truy vấn này chỉ dùng index trên `a=1`, sau đó lọc kết quả với `c=1`.
2. Truy vấn `c=1`: Vì truy vấn không chứa cột ngoài cùng bên trái `a`, theo nguyên tắc khớp tiền tố trái nhất, toàn bộ index không thể được dùng.
3. Truy vấn `b=1 AND c=1`: Giống tình huống thứ hai, toàn bộ index sẽ không được dùng.
4. Truy vấn `b=1 AND a=1 AND c=1`: Truy vấn này có thể dùng index. Khi query optimizer phân tích câu SQL, đối với composite index sẽ sắp xếp lại điều kiện truy vấn để có thể dùng index. Sẽ sắp xếp lại điều kiện `b=1` và `a=1`, trở thành `a=1 AND b=1 AND c=1`.

MySQL 8.0.13 giới thiệu Index Skip Scan (ISS), có thể nâng cao hiệu quả truy vấn trong một số tình huống truy vấn index. Trước khi có ISS, truy vấn composite index không thỏa mãn nguyên tắc khớp tiền tố trái nhất sẽ thực hiện quét toàn bảng. ISS cho phép MySQL trong một số trường hợp tránh quét toàn bảng, ngay cả khi điều kiện truy vấn không phù hợp với tiền tố trái nhất. Tuy nhiên, tính năng này khá hạn chế, không thể so sánh với Oracle, MySQL 8.0.31 còn báo cáo một bug: [Bug #109145 Using index for skip scan cause incorrect result](https://bugs.mysql.com/bug.php?id=109145) (các phiên bản sau đã sửa). Cá nhân tôi khuyên chỉ cần biết có tính năng này, không cần tìm hiểu sâu, trong dự án thực tế chưa chắc dùng được.

## Index Pushdown

**Index Condition Pushdown (ICP)** là tính năng tối ưu index được cung cấp trong **MySQL 5.6**, cho phép storage engine thực hiện phán đoán một phần điều kiện `WHERE` trong quá trình duyệt index, trực tiếp lọc các bản ghi không thỏa mãn điều kiện, từ đó giảm số lần quay lại bảng, nâng cao hiệu quả truy vấn.

Giả sử chúng ta có bảng tên `user`, chứa 4 trường `id`, `username`, `zipcode` và `birthdate`, đã tạo composite index `(zipcode, birthdate)`.

```sql
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `zipcode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `birthdate` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_zipcode_birthdate` (`zipcode`,`birthdate`) ) ENGINE=InnoDB AUTO_INCREMENT=1001 DEFAULT CHARSET=utf8mb4;

# Truy vấn người dùng có zipcode là 431200 và sinh nhật vào tháng 3
SELECT * FROM user WHERE zipcode = '431200' AND MONTH(birthdate) = 3;
```

- Trước khi có ICP, dù trường `zipcode` có thể giúp nhanh chóng định vị người dùng có `zipcode = '431200'` qua index, nhưng chúng ta vẫn cần quay lại bảng cho từng người dùng tìm được, lấy dữ liệu người dùng đầy đủ, rồi mới xét `MONTH(birthdate) = 3`.
- Sau khi có ICP, storage engine khi dùng trường `zipcode` index tìm người dùng `zipcode = '431200'`, đồng thời phán đoán `MONTH(birthdate) = 3`. Như vậy, chỉ có bản ghi thỏa mãn đồng thời điều kiện mới được trả về, giảm số lần quay lại bảng.

![](https://oss.javaguide.cn/github/javaguide/database/mysql/index-condition-pushdown.png)

![](https://oss.javaguide.cn/github/javaguide/database/mysql/index-condition-pushdown-graphic-illustration.png)

Hãy nói thêm về nguyên lý cụ thể của ICP, trước tiên xem sơ đồ kiến trúc đơn giản MySQL dưới đây.

![](https://oss.javaguide.cn/javaguide/13526879-3037b144ed09eb88.png)

MySQL có thể đơn giản chia thành hai tầng Server layer và storage engine layer. Server layer xử lý các thao tác như phân tích truy vấn, phân tích, tối ưu hóa, cache và tương tác với client, còn storage engine layer chịu trách nhiệm lưu trữ và đọc dữ liệu, MySQL hỗ trợ nhiều storage engine như InnoDB, MyISAM, Memory.

**Pushdown** trong ICP thực ra là chỉ việc chuyển một phần công việc mà tầng trên (Server layer) chịu trách nhiệm xuống cho tầng dưới (storage engine layer) xử lý.

Dưới đây chúng ta kết hợp nguyên lý ICP để giải thích thêm ví dụ đã đề cập.

Trước khi có ICP:

- Storage engine layer trước tiên tìm tất cả các ID khóa chính của người dùng có `zipcode = '431200'` theo trường index `zipcode`, sau đó quay lại bảng lần hai, lấy dữ liệu người dùng đầy đủ;
- Storage engine layer chuyển tất cả dữ liệu người dùng có `zipcode = '431200'` lên Server layer, Server layer lọc thêm theo điều kiện `MONTH(birthdate) = 3`.

Sau khi có ICP:

- Storage engine layer trước tiên tìm tất cả người dùng có `zipcode = '431200'` theo trường index `zipcode`, sau đó trực tiếp phán đoán `MONTH(birthdate) = 3`, lọc ra các ID khóa chính phù hợp điều kiện;
- Quay lại bảng lần hai, theo các ID khóa chính phù hợp điều kiện để lấy dữ liệu người dùng đầy đủ;
- Storage engine layer chuyển tất cả dữ liệu người dùng phù hợp điều kiện lên Server layer.

Có thể thấy, **ngoài việc có thể giảm số lần quay lại bảng, ICP còn có thể giảm lượng truyền dữ liệu giữa storage engine layer và Server layer.**

Cuối cùng, tóm tắt phạm vi ứng dụng của ICP:

1. Áp dụng cho truy vấn của InnoDB engine và MyISAM engine.
2. Áp dụng cho truy vấn phạm vi có kế hoạch thực thi là range, ref, eq_ref, ref_or_null.
3. Đối với bảng InnoDB, chỉ dùng cho non-clustered index. Mục tiêu của ICP là giảm số lần đọc toàn hàng, từ đó giảm thao tác I/O. Đối với clustered index của InnoDB, bản ghi đầy đủ đã được đọc vào buffer của InnoDB. Trong trường hợp này dùng ICP không giảm được I/O.
4. Subquery không thể dùng ICP, vì subquery thường sẽ tạo bảng tạm để xử lý kết quả, còn bảng tạm không có index.
5. Stored procedure không thể dùng ICP, vì storage engine không thể gọi stored function.

## Một số khuyến nghị sử dụng Index đúng cách

### Chọn trường phù hợp để tạo Index

- **Trường không được là NULL**: Dữ liệu của trường index nên cố gắng không là NULL, vì đối với trường dữ liệu là NULL, cơ sở dữ liệu khó tối ưu hơn. Nếu trường thường xuyên được truy vấn nhưng không thể tránh là NULL, khuyến nghị dùng giá trị ngắn có ngữ nghĩa rõ ràng như 0, 1, true, false thay thế.
- **Trường được truy vấn thường xuyên**: Trường mà chúng ta tạo index nên là trường có thao tác truy vấn rất thường xuyên.
- **Trường được dùng làm điều kiện truy vấn**: Trường được dùng làm điều kiện WHERE nên được cân nhắc tạo index.
- **Trường thường xuyên cần sắp xếp**: Index đã được sắp xếp, như vậy truy vấn có thể tận dụng thứ tự sắp xếp của index, tăng tốc thời gian truy vấn sắp xếp.
- **Trường thường xuyên được dùng để join**: Trường thường xuyên được dùng để join có thể là một số cột foreign key, đối với cột foreign key không nhất thiết phải tạo foreign key, chỉ là cột đó liên quan đến mối quan hệ giữa các bảng. Đối với trường thường xuyên được truy vấn join, có thể cân nhắc tạo index, nâng cao hiệu quả truy vấn join nhiều bảng.

### Tránh Index thất bại

Index thất bại cũng là một trong những nguyên nhân chính của truy vấn chậm, các tình huống phổ biến dẫn đến index thất bại gồm hai loại dưới đây:

**1. Cách viết SQL xung đột với logic lớp dưới (phá vỡ tính có thứ tự của B+Tree)**

Loại vấn đề này phổ biến nhất, bản chất là điều kiện truy vấn làm B+Tree lớp dưới mất đi khả năng định vị nhanh "tìm kiếm nhị phân".

- **Vi phạm nguyên tắc tiền tố trái nhất**: Bỏ qua cột dẫn đầu của composite index, hoặc gặp truy vấn phạm vi (như `>`, `<`, `BETWEEN`, `LIKE "abc%"`) dẫn đến định vị chính xác của các cột sau bị gián đoạn, hạ cấp xuống quét phạm vi cộng với lọc.
- **Gia công trên cột index**: Thực hiện tính toán toán học hoặc áp dụng hàm trên cột index bên trái `WHERE`, dẫn đến dữ liệu gốc thay đổi logic, hiển thị không có thứ tự trong cây index.
- **Chuyển đổi kiểu ngầm định (tinh tế và chết người)**: Khi "cột kiểu chuỗi" so sánh với "giá trị kiểu số", MySQL sẽ mặc định thêm hàm chuyển đổi vào cột, trực tiếp phá vỡ tính có thứ tự của cây.
- **Ký tự đại diện đầu tiên trong LIKE fuzzy query**: Như `LIKE "%abc"`, sự không xác định của ký tự tiền tố làm optimizer không thể khóa điểm bắt đầu của khoảng quét.
- **Bẫy sắp xếp ORDER BY**: Cột sắp xếp không khớp index, hướng sắp xếp không nhất quán với cấu trúc index, v.v. kích hoạt sắp xếp thêm trong bộ nhớ hoặc đĩa (`Using filesort`).

**2. Quyết định chi phí của optimizer (thỏa hiệp dựa trên chi phí I/O)**

Loại vấn đề này không phải bản thân index không thể dùng, mà là MySQL optimizer sau khi tính toán, cho rằng "không đi ordinary index" tổng chi phí ngược lại nhỏ hơn.

- **`SELECT \*` liều lĩnh dẫn đến chi phí quay lại bảng vượt tải**: Khi truy vấn nhiều cột không được index bao phủ, nếu lượng dữ liệu khớp lớn (thường vượt quá 20%~30%), optimizer sẽ phán đoán I/O tuần tự của quét toàn bảng tốt hơn so với random I/O quay lại bảng nhiều lần, từ đó chủ động từ bỏ index.
- **Điều kiện `OR` dẫn đến quét toàn bảng**: Chỉ cần bất kỳ phía nào của điều kiện `OR` không có index tương ứng, sẽ kích hoạt quét toàn bảng. Dù cả hai phía đều có index, nếu chi phí kỳ vọng của Index Merge quá cao, vẫn sẽ bị từ bỏ.
- **Danh sách `IN` quá dài gây ước tính sai**: Khi độ dài danh sách `IN` vượt quá ngưỡng hệ thống (mặc định 200), optimizer sẽ chuyển từ phát hiện sâu chính xác (Index Dive) sang ước tính thống kê thô, rất dễ tạo ra phán đoán sai về chi phí thực thi do thông tin thống kê lỗi thời.

Giới thiệu chi tiết: [Tổng kết các tình huống index thất bại MySQL](https://javaguide.cn/database/mysql/mysql-index-invalidation.html).

### Trường được cập nhật thường xuyên nên thận trọng khi tạo Index

Dù index có thể mang lại hiệu quả truy vấn, nhưng chi phí duy trì index cũng không nhỏ. Nếu một trường không được truy vấn thường xuyên, mà lại thường xuyên bị sửa đổi, thì càng không nên tạo index trên trường như vậy.

### Giới hạn số lượng Index trên mỗi bảng

Index không phải càng nhiều càng tốt, khuyến nghị không quá 5 index trên một bảng! Index có thể nâng cao hiệu quả, cũng có thể giảm hiệu quả.

Index có thể tăng hiệu quả truy vấn, nhưng cũng sẽ giảm hiệu quả chèn và cập nhật, thậm chí trong một số trường hợp còn giảm cả hiệu quả truy vấn.

Vì MySQL optimizer khi chọn cách tối ưu truy vấn, sẽ dựa trên thông tin thống kê, đánh giá mỗi index có thể dùng để truy vấn, để tạo ra kế hoạch thực thi tốt nhất, nếu có nhiều index đều có thể dùng cho truy vấn cùng lúc, sẽ tăng thời gian MySQL optimizer tạo kế hoạch thực thi, cũng sẽ giảm hiệu năng truy vấn.

### Ưu tiên cân nhắc tạo Composite Index thay vì Single Column Index

Vì index cần chiếm dụng không gian đĩa, có thể hiểu đơn giản là mỗi index tương ứng với một B+ tree. Nếu một bảng có quá nhiều trường, quá nhiều index, thì khi dữ liệu của bảng đạt đến một lượng nhất định, không gian index chiếm dụng cũng rất nhiều, và chi phí sửa đổi index cũng khá cao. Nếu là composite index, nhiều trường trên một index, sẽ tiết kiệm rất nhiều không gian đĩa, và hiệu quả thao tác sửa đổi dữ liệu cũng được nâng cao.

### Chú ý tránh Index dư thừa

Index dư thừa chỉ các index có chức năng giống nhau, có thể đánh vào index (a, b) nhất định có thể đánh vào index (a), thì index (a) là index dư thừa. Ví dụ (name, city) và (name) là hai index dư thừa, truy vấn có thể đánh vào cái trước nhất định có thể đánh vào cái sau. Trong hầu hết trường hợp, nên cố gắng mở rộng index hiện có thay vì tạo index mới.

### Dùng Prefix Index thay thế Ordinary Index cho trường kiểu chuỗi

Prefix index chỉ giới hạn với kiểu chuỗi, so với ordinary index chiếm ít không gian hơn, vì vậy có thể cân nhắc dùng prefix index thay thế ordinary index.

### Xóa các Index lâu không được dùng

Xóa các index lâu không được dùng, sự tồn tại của index không dùng sẽ gây ra tổn hao hiệu năng không cần thiết.

MySQL 5.7 có thể xem index nào chưa bao giờ được dùng qua view `schema_unused_indexes` trong thư viện `sys`.

### Biết cách phân tích câu SQL có đi theo truy vấn index không

Chúng ta có thể dùng lệnh `EXPLAIN` để phân tích **kế hoạch thực thi** của SQL, như vậy sẽ biết câu lệnh có đánh vào index không. Kế hoạch thực thi là cách thực thi cụ thể của một câu SQL sau khi được MySQL query optimizer tối ưu hóa.

`EXPLAIN` sẽ không thực sự thực thi câu lệnh liên quan, mà thông qua **query optimizer** phân tích câu lệnh, tìm ra phương án truy vấn tối ưu, và hiển thị thông tin tương ứng.

Định dạng đầu ra của `EXPLAIN` như sau:

```sql
mysql> EXPLAIN SELECT `score`,`name` FROM `cus_order` ORDER BY `score` DESC;
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+----------------+
| id | select_type | table     | partitions | type | possible_keys | key  | key_len | ref  | rows   | filtered | Extra          |
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+----------------+
|  1 | SIMPLE      | cus_order | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 997572 |   100.00 | Using filesort |
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+----------------+
1 row in set, 1 warning (0.00 sec)
```

Ý nghĩa của từng trường như sau:

| **Tên cột**   | **Ý nghĩa**                                                           |
| ------------- | --------------------------------------------------------------------- |
| id            | Định danh tuần tự của truy vấn SELECT                                 |
| select_type   | Loại truy vấn tương ứng với từ khóa SELECT                            |
| table         | Tên bảng được dùng                                                    |
| partitions    | Phân vùng khớp, đối với bảng chưa phân vùng, giá trị là NULL          |
| type          | Phương thức truy cập bảng                                             |
| possible_keys | Các index có thể được dùng                                            |
| key           | Index thực sự được dùng                                               |
| key_len       | Độ dài của index được chọn                                            |
| ref           | Khi dùng truy vấn bằng index, cột hoặc hằng số được so sánh với index |
| rows          | Số hàng dự kiến sẽ đọc                                                |
| filtered      | Sau khi lọc theo điều kiện bảng, tỷ lệ phần trăm số bản ghi còn lại   |
| Extra         | Thông tin bổ sung                                                     |

Do giới hạn bài viết, ở đây tôi chỉ giới thiệu sơ qua lệnh `EXPLAIN` của MySQL, giới thiệu chi tiết xem bài viết: [Phân tích kế hoạch thực thi MySQL](./mysql-query-execution-plan.md).

<!-- @include: @article-footer.snippet.md -->
