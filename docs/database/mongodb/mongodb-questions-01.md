---
title: Tổng hợp câu hỏi phỏng vấn MongoDB thường gặp (Phần 1)
description: Tổng hợp câu hỏi phỏng vấn MongoDB thường gặp phần 1, giải thích chi tiết các kiến thức cốt lõi như khái niệm cơ bản, cấu trúc lưu trữ, kiểu dữ liệu, tính khả dụng cao với replica set, mở rộng ngang với sharded cluster, hỗ trợ cho việc chuẩn bị phỏng vấn backend.
category: Cơ sở dữ liệu
tag:
  - NoSQL
  - MongoDB
head:
  - - meta
    - name: keywords
      content: MongoDB面试题,文档数据库,BSON,副本集,分片集群,MongoDB索引,WiredTiger,聚合管道
---

> Một phần nhỏ nội dung có tham khảo mô tả từ tài liệu chính thức của MongoDB, xin lưu ý điều này.

## Kiến thức cơ bản về MongoDB

### MongoDB là gì?

MongoDB là một hệ thống cơ sở dữ liệu NoSQL mã nguồn mở dựa trên **lưu trữ file phân tán**, được viết bằng **C++**. MongoDB cung cấp phương thức lưu trữ **hướng tài liệu** (document-oriented), tương đối đơn giản và dễ sử dụng, hỗ trợ mô hình hóa dữ liệu "**không có schema**", có thể lưu trữ các kiểu dữ liệu khá phức tạp, là một **cơ sở dữ liệu kiểu tài liệu** rất phổ biến.

Trong điều kiện tải cao, MongoDB hỗ trợ mở rộng ngang và tính khả dụng cao một cách tự nhiên, có thể dễ dàng thêm nhiều node/instance hơn để đảm bảo hiệu năng và tính khả dụng của dịch vụ. Trong nhiều tình huống, MongoDB có thể được sử dụng để thay thế cơ sở dữ liệu quan hệ truyền thống hoặc phương thức lưu trữ key/value, nhằm cung cấp giải pháp lưu trữ dữ liệu có khả năng mở rộng, khả dụng cao và hiệu năng cao cho các ứng dụng Web.

### Cấu trúc lưu trữ của MongoDB là gì?

Cấu trúc lưu trữ của MongoDB khác với cơ sở dữ liệu quan hệ truyền thống, chủ yếu bao gồm ba đơn vị sau:

- **Document (Tài liệu)**: Đơn vị cơ bản nhất trong MongoDB, được tạo thành từ các cặp key-value BSON, tương tự như Row (hàng) trong cơ sở dữ liệu quan hệ.
- **Collection (Bộ sưu tập)**: Một collection có thể chứa nhiều document, tương tự như Table (bảng) trong cơ sở dữ liệu quan hệ.
- **Database (Cơ sở dữ liệu)**: Một database có thể chứa nhiều collection, có thể tạo nhiều database trong MongoDB, tương tự như Database trong cơ sở dữ liệu quan hệ.

Nói cách khác, MongoDB lưu trữ các bản ghi dữ liệu dưới dạng document (cụ thể hơn là [BSON document](https://www.mongodb.com/docs/manual/core/document/#std-label-bson-document-format)), các document này được tập hợp lại trong collection, và database lưu trữ một hoặc nhiều collection document.

**So sánh các thuật ngữ thông dụng giữa SQL và MongoDB**:

| SQL                        | MongoDB                            |
| -------------------------- | ---------------------------------- |
| Bảng (Table)               | Collection (Bộ sưu tập)            |
| Hàng (Row)                 | Document (Tài liệu)                |
| Cột (Col)                  | Field (Trường)                     |
| Khóa chính (Primary Key)   | Object ID (Objectid)               |
| Chỉ mục (Index)            | Chỉ mục (Index)                    |
| Bảng lồng (Embedded Table) | Embedded Document (Tài liệu nhúng) |
| Mảng (Array)               | Mảng (Array)                       |

#### Document

Bản ghi trong MongoDB chính là một BSON document, đây là cấu trúc dữ liệu được tạo thành từ các cặp key-value, tương tự như đối tượng JSON, là đơn vị dữ liệu cơ bản trong MongoDB. Giá trị của các field có thể bao gồm các document khác, mảng và mảng document.

![MongoDB Document](https://oss.javaguide.cn/github/javaguide/database/mongodb/crud-annotated-document..png)

Key của document là chuỗi ký tự. Ngoài một số ngoại lệ, key có thể sử dụng bất kỳ ký tự UTF-8 nào.

- Key không được chứa `\0` (ký tự null). Ký tự này được dùng để biểu thị kết thúc của key.
- `.` và `$` có ý nghĩa đặc biệt, chỉ có thể sử dụng trong các môi trường cụ thể.
- Các key bắt đầu bằng dấu gạch dưới `_` được dự trữ (không bắt buộc nghiêm ngặt).

**BSON [bee·sahn]** là viết tắt của Binary [JSON](http://json.org/), là biểu diễn nhị phân của JSON document, hỗ trợ nhúng document và mảng vào các document và mảng khác, đồng thời bao gồm các phần mở rộng cho phép biểu diễn các kiểu dữ liệu không thuộc đặc tả JSON. Nội dung về đặc tả BSON có thể tham khảo tại [bsonspec.org](http://bsonspec.org/), xem thêm [Các kiểu BSON](https://www.mongodb.com/docs/manual/reference/bson-types/).

Theo giới thiệu của Wikipedia về BJSON, tốc độ duyệt của BJSON tốt hơn JSON, đây cũng là lý do chính MongoDB chọn BSON, nhưng BJSON cần nhiều không gian lưu trữ hơn.

> So với JSON, BSON tập trung vào việc cải thiện hiệu quả lưu trữ và quét. Các phần tử lớn trong BSON document được đặt tiền tố bằng trường độ dài để dễ quét. Trong một số trường hợp, do sự hiện diện của tiền tố độ dài và chỉ mục mảng tường minh, BSON sử dụng nhiều không gian hơn JSON.

![Trang chủ website BSON](https://oss.javaguide.cn/github/javaguide/database/mongodb/bsonspec.org.png)

#### Collection

MongoDB collection tồn tại trong database, **không có cấu trúc cố định**, tức là **không có schema**, điều này có nghĩa là có thể chèn dữ liệu có định dạng và kiểu khác nhau vào collection. Tuy nhiên, thông thường dữ liệu được chèn vào collection đều có một mức độ liên quan nhất định.

![MongoDB Collection](https://oss.javaguide.cn/github/javaguide/database/mongodb/crud-annotated-collection.png)

Collection không cần tạo trước, khi document đầu tiên được chèn vào hoặc chỉ mục đầu tiên được tạo, nếu collection chưa tồn tại, một collection mới sẽ được tạo.

Tên collection có thể là bất kỳ chuỗi UTF-8 nào thỏa mãn các điều kiện sau:

- Tên collection không được là chuỗi rỗng `""`.
- Tên collection không được chứa `\0` (ký tự null), ký tự này biểu thị kết thúc của tên collection.
- Tên collection không được bắt đầu bằng "system.", đây là tiền tố dành riêng cho các collection hệ thống. Ví dụ collection `system.users` lưu thông tin người dùng của database, collection `system.namespaces` lưu thông tin về tất cả các collection trong database.
- Tên collection phải bắt đầu bằng dấu gạch dưới hoặc ký tự chữ cái, và không được chứa `$`.

#### Database

Database dùng để lưu trữ tất cả các collection, còn collection dùng để lưu trữ tất cả các document. Trong một MongoDB có thể tạo nhiều database, mỗi database có collection và quyền riêng của nó.

MongoDB có một số database đặc biệt được dự trữ.

- **admin**: Database admin chủ yếu để lưu người dùng root và các role. Ví dụ, bảng system.users lưu người dùng, bảng system.roles lưu các role. Thường không khuyến nghị người dùng thao tác trực tiếp với database này. Khi thêm một người dùng vào database này và cấp cho họ quyền role có tên dbAdminAnyDatabase trên thư viện admin, người dùng đó tự động kế thừa quyền của tất cả các database. Một số lệnh phía server cũng chỉ có thể chạy từ database này, chẳng hạn như tắt server.
- **local**: Database local sẽ không được sao chép sang các shard khác, do đó có thể dùng để lưu trữ bất kỳ collection nào chỉ dành cho server đơn lẻ cục bộ. Thường không khuyến nghị người dùng trực tiếp sử dụng thư viện local để lưu dữ liệu, cũng không khuyến nghị thực hiện các thao tác CRUD, vì dữ liệu không thể được sao lưu và phục hồi bình thường.
- **config**: Khi MongoDB sử dụng cấu hình sharding, database config có thể được sử dụng để lưu thông tin liên quan đến shard.
- **test**: Thư viện test được tạo mặc định, khi kết nối với dịch vụ [mongod](https://mongoing.com/docs/reference/program/mongod.html), nếu không chỉ định database kết nối cụ thể, mặc định sẽ kết nối đến database test.

Tên database có thể là bất kỳ chuỗi UTF-8 nào thỏa mãn các điều kiện sau:

- Không được là chuỗi rỗng `""`.
- Không được chứa `' '` (khoảng trắng), `.`, `$`, `/`, `\` và `\0` (ký tự null).
- Nên là chữ thường toàn bộ.
- Tối đa 64 byte.

Tên database cuối cùng sẽ trở thành file trong hệ thống file, đây cũng là lý do tại sao có nhiều hạn chế như vậy.

### MongoDB có những đặc điểm gì?

- **Bản ghi dữ liệu được lưu trữ dưới dạng document**: Bản ghi trong MongoDB chính là một BSON document, đây là cấu trúc dữ liệu được tạo thành từ các cặp key-value, tương tự như đối tượng JSON, là đơn vị dữ liệu cơ bản trong MongoDB.
- **Schema tự do**: Khái niệm collection tương tự như bảng trong MySQL, nhưng không cần định nghĩa bất kỳ schema nào, có thể biểu diễn các đối tượng mô hình miền phức tạp với ít đối tượng dữ liệu hơn.
- **Hỗ trợ nhiều phương thức truy vấn**: MongoDB query API hỗ trợ các thao tác đọc/ghi (CRUD) cũng như tổng hợp dữ liệu, tìm kiếm văn bản và truy vấn không gian địa lý.
- **Hỗ trợ giao dịch ACID**: Cơ sở dữ liệu NoSQL thường không hỗ trợ giao dịch, đã đánh đổi vì khả năng mở rộng và hiệu năng cao. Tuy nhiên, cũng có ngoại lệ, MongoDB hỗ trợ giao dịch. Giống như cơ sở dữ liệu quan hệ, giao dịch MongoDB cũng có các đặc tính ACID. MongoDB hỗ trợ tính nguyên tử gốc cho tài liệu đơn, cũng có đặc tính của giao dịch. MongoDB 4.0 đã thêm hỗ trợ giao dịch đa tài liệu, nhưng chỉ hỗ trợ giao dịch trong chế độ triển khai replica set, tức là phạm vi giao dịch bị giới hạn trong một replica set. MongoDB 4.2 đã giới thiệu giao dịch phân tán, thêm hỗ trợ giao dịch đa tài liệu trên sharded cluster, và hợp nhất hỗ trợ hiện có cho giao dịch đa tài liệu trên replica set.
- **Lưu trữ nhị phân hiệu quả**: Document được lưu trữ trong collection tồn tại dưới dạng các cặp key-value. Key dùng để nhận dạng duy nhất một document, thường là kiểu ObjectId, value tồn tại dưới dạng BSON. BSON = Binary JSON, là định dạng được thêm vào JSON một số kiểu và mô tả metadata.
- **Tính năng nén dữ liệu tích hợp sẵn**: Cần ít tài nguyên hơn để lưu trữ cùng lượng dữ liệu.
- **Hỗ trợ mapreduce**: Hoàn thành các tác vụ tổng hợp phức tạp thông qua phương pháp chia để trị. Tuy nhiên, từ MongoDB 5.0 trở đi, map-reduce không còn được khuyến nghị sử dụng chính thức, giải pháp thay thế là [aggregation pipeline](https://www.mongodb.com/docs/manual/core/aggregation-pipeline/). Aggregation pipeline cung cấp hiệu năng và khả năng sử dụng tốt hơn map-reduce.
- **Hỗ trợ nhiều kiểu chỉ mục**: MongoDB hỗ trợ nhiều kiểu chỉ mục, bao gồm chỉ mục một trường, chỉ mục phức hợp, chỉ mục đa khóa, chỉ mục hash, chỉ mục văn bản, chỉ mục vị trí địa lý, v.v., mỗi kiểu chỉ mục có trường hợp sử dụng khác nhau.
- **Hỗ trợ failover**: Cung cấp tính năng tự động phục hồi sự cố, khi node chính bị lỗi, tự động bầu chọn một node chính mới từ các node phụ, đảm bảo cluster hoạt động bình thường, điều này hoàn toàn trong suốt với client.
- **Hỗ trợ sharded cluster**: MongoDB hỗ trợ cluster tự động phân chia dữ liệu, giúp cluster lưu trữ nhiều dữ liệu hơn, có hiệu năng mạnh mẽ hơn. Khi chèn và cập nhật dữ liệu, có thể tự động định tuyến và lưu trữ.
- **Hỗ trợ lưu trữ file lớn**: Yêu cầu không gian lưu trữ tài liệu đơn trong MongoDB không vượt quá 16MB. Đối với các file lớn hơn 16MB, MongoDB cung cấp GridFS để lưu trữ, thông qua GridFS, có thể xử lý dữ liệu lớn thành các chunk, sau đó lưu các tài liệu nhỏ được cắt nhỏ này vào cơ sở dữ liệu.

### MongoDB phù hợp với những tình huống ứng dụng nào?

**Ưu thế của MongoDB nằm ở tính linh hoạt của mô hình dữ liệu và storage engine, khả năng mở rộng của kiến trúc và hỗ trợ chỉ mục mạnh mẽ.**

Khi chọn MongoDB nên cân nhắc đầy đủ ưu điểm của MongoDB, kết hợp với yêu cầu thực tế của dự án để quyết định:

- Khi dự án phát triển, liệu việc lưu dữ liệu bằng định dạng giống JSON (BSON) có đáp ứng được yêu cầu dự án không? Bản ghi trong MongoDB chính là một BSON document, đây là cấu trúc dữ liệu được tạo thành từ các cặp key-value, tương tự như đối tượng JSON, là đơn vị dữ liệu cơ bản trong MongoDB.
- Có cần lưu trữ lượng dữ liệu lớn không? Có cần mở rộng ngang nhanh chóng không? MongoDB hỗ trợ sharded cluster, có thể dễ dàng thêm nhiều node (instance), giúp cluster lưu trữ nhiều dữ liệu hơn, có hiệu năng mạnh mẽ hơn.
- Có cần nhiều kiểu chỉ mục hơn để đáp ứng nhiều tình huống ứng dụng hơn không? MongoDB hỗ trợ nhiều kiểu chỉ mục, bao gồm chỉ mục một trường, chỉ mục phức hợp, chỉ mục đa khóa, chỉ mục hash, chỉ mục văn bản, chỉ mục vị trí địa lý, v.v., mỗi kiểu chỉ mục có trường hợp sử dụng khác nhau.
- ……

## Storage Engine của MongoDB

### MongoDB hỗ trợ những storage engine nào?

Storage Engine (Engine lưu trữ) là thành phần cốt lõi của cơ sở dữ liệu, chịu trách nhiệm quản lý cách thức lưu trữ dữ liệu trong bộ nhớ và trên đĩa.

Giống như MySQL, MongoDB cũng áp dụng **kiến trúc storage engine dạng plugin**, hỗ trợ các loại storage engine khác nhau, các storage engine khác nhau giải quyết các vấn đề của các tình huống khác nhau. Khi tạo database hoặc collection, có thể chỉ định storage engine.

> Kiến trúc storage engine dạng plugin có thể thực hiện việc tách rời giữa lớp Server và lớp storage engine, có thể hỗ trợ nhiều storage engine, như MySQL có thể hỗ trợ cả storage engine InnoDB có cấu trúc B-Tree và storage engine RocksDB có cấu trúc LSM.

Khi storage engine mới ra mắt, mặc định sử dụng MMAPV1 storage engine, phiên bản MongoDB4.x không còn hỗ trợ MMAPv1 storage engine.

Hiện tại chủ yếu có hai loại storage engine sau:

- **WiredTiger storage engine**: Từ MongoDB 3.2 trở đi, storage engine mặc định là [WiredTiger storage engine](https://www.mongodb.com/docs/manual/core/wiredtiger/). Rất phù hợp với hầu hết các workload, được khuyến nghị cho các deployment mới. WiredTiger cung cấp các tính năng như mô hình đồng thời cấp document, checkpoint và nén dữ liệu (sẽ giới thiệu ở phần sau).
- **In-Memory storage engine**: [In-Memory storage engine](https://www.mongodb.com/docs/manual/core/inmemory/) có sẵn trong MongoDB Enterprise. Thay vì lưu trữ document trên đĩa, nó giữ chúng trong bộ nhớ để có độ trễ dữ liệu dự đoán được hơn.

Ngoài ra, MongoDB 3.0 cung cấp **API storage engine có thể cắm (pluggable)**, cho phép bên thứ ba phát triển storage engine cho MongoDB, điểm này cũng khá giống MySQL.

### WiredTiger dựa trên LSM Tree hay B+ Tree?

Hiện tại phần lớn storage engine cơ sở dữ liệu phổ biến được triển khai dựa trên B/B+ Tree hoặc LSM (Log Structured Merge) Tree. Đối với cơ sở dữ liệu NoSQL, phần lớn (như HBase, Cassandra, RocksDB) đều dựa trên LSM tree, MongoDB thì hơi khác.

Như đã nói ở trên, từ MongoDB 3.2 trở đi, storage engine mặc định là WiredTiger storage engine. Trên website chính thức của engine WiredTiger, chúng ta phát hiện WiredTiger sử dụng B+ tree làm cấu trúc lưu trữ của nó:

```plain
WiredTiger maintains a table's data in memory using a data structure called a B-Tree ( B+ Tree to be specific), referring to the nodes of a B-Tree as pages. Internal pages carry only keys. The leaf pages store both keys and values.
```

Ngoài ra, WiredTiger còn hỗ trợ cây [LSM (Log Structured Merge)](https://source.wiredtiger.com/3.1.0/lsm.html) làm cấu trúc lưu trữ, khi MongoDB sử dụng WiredTiger làm storage engine, mặc định sử dụng B+ tree.

Nếu muốn tìm hiểu lý do MongoDB sử dụng B+ tree, có thể xem bài viết này: [【Series phản bác học vẹt】Đừng phân tích bừa nữa, MongoDB dùng B+ tree, không phải B tree như bạn nghĩ](https://zhuanlan.zhihu.com/p/519658576).

Khi sử dụng B+ tree, WiredTiger lấy **page** làm đơn vị cơ bản để đọc/ghi dữ liệu lên đĩa. Mỗi node của B+ tree là một page, có ba loại page:

- **root page (node gốc)**: Node gốc của B+ tree.
- **internal page (node nội bộ)**: Node chỉ mục trung gian không thực sự lưu trữ dữ liệu.
- **leaf page (node lá)**: Node lá thực sự lưu trữ dữ liệu, bao gồm page header (tiêu đề trang), block header (tiêu đề khối) và dữ liệu thực sự (key/value), trong đó page header định nghĩa kiểu trang, kích thước dữ liệu payload thực tế trong trang, số bản ghi trong trang, v.v.; block header định nghĩa checksum của trang này, vị trí địa chỉ của khối trên đĩa, v.v.

Cấu trúc tổng thể của nó như hình dưới đây:

![Cấu trúc tổng thể B+ tree của WiredTiger](https://oss.javaguide.cn/github/javaguide/database/mongodb/mongodb-b-plus-tree-integral-structure.png)

Nếu muốn nghiên cứu sâu hơn về WiredTiger storage engine, khuyến nghị đọc [Loạt bài về WiredTiger storage engine](https://mongoing.com/archives/category/wiredtiger%e5%ad%98%e5%82%a8%e5%bc%95%e6%93%8e%e7%b3%bb%e5%88%97) từ cộng đồng MongoDB tiếng Trung.

## Tổng hợp (Aggregation) trong MongoDB

### Tổng hợp trong MongoDB có tác dụng gì?

Trong các dự án thực tế, chúng ta thường cần tổng hợp nhiều document thậm chí nhiều collection lại để tính toán phân tích (như tính tổng, lấy giá trị lớn nhất) và trả về kết quả đã tính toán, quá trình này được gọi là **thao tác tổng hợp (aggregation)**.

Theo giới thiệu từ tài liệu chính thức, chúng ta có thể sử dụng thao tác tổng hợp để:

- Kết hợp các giá trị từ nhiều document lại với nhau.
- Thực hiện một loạt phép tính trên dữ liệu trong collection.
- Phân tích sự thay đổi của dữ liệu theo thời gian.

### MongoDB cung cấp những phương thức nào để thực thi tổng hợp?

MongoDB cung cấp hai phương thức thực thi tổng hợp:

- **Aggregation Pipeline (Pipeline tổng hợp)**: Phương thức ưu tiên để thực thi thao tác tổng hợp.
- **Single purpose aggregation methods (Phương thức tổng hợp đơn mục đích)**: Tức là các hàm tổng hợp đơn mục đích như `count()`, `distinct()`, `estimatedDocumentCount()`.

Phần lớn các bài viết còn đề cập đến phương thức tổng hợp **map-reduce**. Tuy nhiên, từ MongoDB 5.0 trở đi, map-reduce không còn được khuyến nghị sử dụng chính thức, giải pháp thay thế là [aggregation pipeline](https://www.mongodb.com/docs/manual/core/aggregation-pipeline/). Aggregation pipeline cung cấp hiệu năng và khả năng sử dụng tốt hơn map-reduce.

MongoDB aggregation pipeline bao gồm nhiều giai đoạn (stage), mỗi giai đoạn chuyển đổi document khi chúng đi qua pipeline. Mỗi giai đoạn nhận đầu ra của giai đoạn trước, xử lý dữ liệu thêm và gửi nó làm dữ liệu đầu vào cho giai đoạn tiếp theo.

Quy trình làm việc của mỗi pipeline là:

1. Nhận một loạt document dữ liệu gốc
2. Thực hiện một loạt phép tính trên các document này
3. Xuất document kết quả cho giai đoạn tiếp theo

![Quy trình làm việc của pipeline](https://oss.javaguide.cn/github/javaguide/database/mongodb/mongodb-aggregation-stage.png)

**Các toán tử giai đoạn thường dùng**:

| Toán tử   | Mô tả ngắn                                                                                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \$match   | Toán tử khớp, dùng để lọc tập hợp document                                                                                                                              |
| \$project | Toán tử chiếu, dùng để tái cấu trúc các field của từng document, có thể trích xuất field, đổi tên field, thậm chí có thể thêm field mới sau khi thao tác trên field gốc |
| \$sort    | Toán tử sắp xếp, dùng để sắp xếp document theo một hoặc nhiều field                                                                                                     |
| \$limit   | Toán tử giới hạn, dùng để giới hạn số lượng document trả về                                                                                                             |
| \$skip    | Toán tử bỏ qua, dùng để bỏ qua số lượng document được chỉ định                                                                                                          |
| \$count   | Toán tử thống kê, dùng để thống kê số lượng document                                                                                                                    |
| \$group   | Toán tử nhóm, dùng để nhóm tập hợp document                                                                                                                             |
| \$unwind  | Toán tử tách, dùng để tách từng giá trị trong mảng thành các document riêng lẻ                                                                                          |
| \$lookup  | Toán tử kết nối, dùng để kết nối với một collection khác trong cùng database và lấy document được chỉ định, tương tự populate                                           |

Xem thêm giới thiệu về các toán tử trong tài liệu chính thức: <https://docs.mongodb.com/manual/reference/operator/aggregation/>

Các toán tử giai đoạn được sử dụng trong phương thức `db.collection.aggregate`, ở lớp đầu tiên của tham số mảng.

```sql
db.collection.aggregate( [ { 阶段操作符：表述 }, { 阶段操作符：表述 }, ... ] )
```

Dưới đây là một ví dụ từ tài liệu chính thức của MongoDB:

```sql
db.orders.aggregate([
   # 第一阶段：$match阶段按status字段过滤文档，并将status等于"A"的文档传递到下一阶段。
    { $match: { status: "A" } },
  # 第二阶段：$group阶段按cust_id字段将文档分组，以计算每个cust_id唯一值的金额总和。
    { $group: { _id: "$cust_id", total: { $sum: "$amount" } } }
])
```

## Giao dịch trong MongoDB

> Để hiểu nguyên lý giao dịch MongoDB cần khá nhiều thời gian, bản thân tôi cũng chưa hiểu rõ hoàn toàn. Do đó, ở đây tôi chỉ giới thiệu sơ qua về giao dịch MongoDB, các bạn muốn tìm hiểu nguyên lý có thể tự tìm kiếm và tra cứu tài liệu liên quan.
>
> Đây giới thiệu một số bài viết để tham khảo:
>
> - [Kỹ thuật chuyên sâu: Nguyên lý giao dịch MongoDB](https://mongoing.com/archives/82187)
> - [Thiết kế và triển khai mô hình nhất quán MongoDB](https://developer.aliyun.com/article/782494)
> - [Giới thiệu về giao dịch trong tài liệu chính thức của MongoDB](https://www.mongodb.com/docs/upcoming/core/transactions/)

Như đã đề cập khi giới thiệu về cơ sở dữ liệu NoSQL, cơ sở dữ liệu NoSQL thường không hỗ trợ giao dịch, đã đánh đổi vì khả năng mở rộng và hiệu năng cao. Tuy nhiên, cũng có ngoại lệ, MongoDB hỗ trợ giao dịch.

Giống như cơ sở dữ liệu quan hệ, giao dịch MongoDB cũng có các đặc tính ACID:

- **Tính nguyên tử** (`Atomicity`): Giao dịch là đơn vị thực thi nhỏ nhất, không được phép chia cắt. Tính nguyên tử của giao dịch đảm bảo hành động hoặc hoàn thành toàn bộ, hoặc hoàn toàn không có tác dụng;
- **Tính nhất quán** (`Consistency`): Trước và sau khi thực thi giao dịch, dữ liệu vẫn nhất quán, ví dụ trong nghiệp vụ chuyển khoản, dù giao dịch có thành công hay không, tổng số tiền của người chuyển và người nhận phải không thay đổi;
- **Tính cô lập** (`Isolation`): Khi truy cập database đồng thời, giao dịch của một người dùng không bị giao dịch khác can thiệp, dữ liệu giữa các giao dịch đồng thời là độc lập. WiredTiger storage engine hỗ trợ cô lập read-uncommitted (đọc chưa commit), read-committed (đọc đã commit) và snapshot (ảnh nhanh), khi MongoDB khởi động mặc định chọn cô lập snapshot. Ở các mức cô lập khác nhau, trong vòng đời của một giao dịch, có thể xảy ra các hiện tượng như dirty read, non-repeatable read, phantom read.
- **Tính bền vững** (`Durability`): Sau khi một giao dịch được commit. Sự thay đổi của nó đối với dữ liệu trong database là bền vững, ngay cả khi database gặp sự cố cũng không nên có bất kỳ ảnh hưởng nào đến nó.

Bài viết này sẽ không đề cập chi tiết về giao dịch, bạn nào quan tâm có thể xem bài viết tôi đã viết [Tổng hợp câu hỏi phỏng vấn MySQL thường gặp](../mysql/mysql-questions-01.md), trong đó có giới thiệu chi tiết.

MongoDB hỗ trợ tính nguyên tử tự nhiên cho tài liệu đơn, cũng có đặc tính của giao dịch. Khi nói về giao dịch MongoDB, thường đề cập đến **đa tài liệu**. MongoDB 4.0 đã thêm hỗ trợ giao dịch ACID đa tài liệu, nhưng chỉ hỗ trợ giao dịch ACID trong chế độ triển khai replica set, tức là phạm vi giao dịch bị giới hạn trong một replica set. MongoDB 4.2 đã giới thiệu **giao dịch phân tán**, thêm hỗ trợ giao dịch đa tài liệu trên sharded cluster, và hợp nhất hỗ trợ hiện có cho giao dịch đa tài liệu trên replica set.

Theo giới thiệu từ tài liệu chính thức:

> Từ MongoDB 4.2 trở đi, giao dịch phân tán và giao dịch đa tài liệu là một ý nghĩa trong MongoDB. Giao dịch phân tán đề cập đến giao dịch đa tài liệu trên sharded cluster và replica set. Từ MongoDB 4.2 trở đi, giao dịch đa tài liệu (dù trên sharded cluster hay replica set) cũng được gọi là giao dịch phân tán.

Trong hầu hết các trường hợp, giao dịch đa tài liệu sẽ tạo ra chi phí hiệu năng lớn hơn so với ghi tài liệu đơn. Đối với hầu hết các tình huống, [mô hình dữ liệu phi chuẩn hóa (embedded document và mảng)](https://www.mongodb.com/docs/upcoming/core/data-model-design/#std-label-data-modeling-embedding) vẫn là lựa chọn tốt nhất. Tức là, việc mô hình hóa dữ liệu phù hợp có thể giảm thiểu tối đa nhu cầu sử dụng giao dịch đa tài liệu.

**Lưu ý**:

- Từ MongoDB 4.2 trở đi, giao dịch đa tài liệu hỗ trợ replica set và sharded cluster, trong đó: node chính sử dụng WiredTiger storage engine, đồng thời node phụ sử dụng WiredTiger storage engine hoặc In-Memory storage engine. Trong MongoDB 4.0, chỉ có replica set sử dụng WiredTiger storage engine mới hỗ trợ giao dịch.
- Trong MongoDB 4.2 và các phiên bản trước, bạn không thể tạo collection trong giao dịch. Từ MongoDB 4.4 trở đi, bạn có thể tạo collection và chỉ mục trong giao dịch. Để biết thêm chi tiết, vui lòng tham khảo [Tạo collection và chỉ mục trong giao dịch](https://www.mongodb.com/docs/upcoming/core/transactions/#std-label-transactions-create-collections-indexes).

## Nén dữ liệu trong MongoDB

Nhờ WiredTiger storage engine (storage engine mặc định từ MongoDB 3.2 trở đi), MongoDB hỗ trợ nén tất cả các collection và chỉ mục. Nén tối thiểu hóa việc sử dụng lưu trữ với chi phí CPU bổ sung.

Mặc định, WiredTiger sử dụng thuật toán nén [Snappy](https://github.com/google/snappy) (Google mã nguồn mở, nhằm đạt tốc độ rất cao và nén hợp lý, tỷ lệ nén 3~5 lần) cho tất cả collection dùng block compression, và prefix compression cho tất cả chỉ mục.

Ngoài Snappy, đối với collection còn có các thuật toán nén sau:

- [zlib](https://github.com/madler/zlib): Thuật toán nén cao, tỷ lệ nén 5~7 lần
- [Zstandard](https://github.com/facebook/zstd) (viết tắt là zstd): Thuật toán nén nhanh không mất dữ liệu được Facebook mã nguồn mở, nhắm tới các tình huống nén real-time ở mức zlib và tỷ lệ nén tốt hơn, cung cấp tỷ lệ nén cao hơn và mức sử dụng CPU thấp hơn, có sẵn từ MongoDB 4.2.

WiredTiger log cũng sẽ được nén, mặc định cũng sử dụng thuật toán nén Snappy. Nếu bản ghi log nhỏ hơn hoặc bằng 128 byte, WiredTiger sẽ không nén bản ghi đó.

## Sự khác biệt giữa Amazon DocumentDB và MongoDB

Amazon DocumentDB (tương thích với MongoDB) là dịch vụ database được quản lý hoàn toàn, nhanh chóng và đáng tin cậy. Amazon DocumentDB giúp dễ dàng thiết lập, vận hành và mở rộng database tương thích MongoDB trên cloud.

### Toán tử `$vectorSearch`

Amazon DocumentDB không hỗ trợ `$vectorSearch` như một toán tử độc lập. Thay vào đó, chúng tôi hỗ trợ `vectorSearch` bên trong toán tử `$search`. Để biết thêm thông tin, vui lòng tham khảo [Vector search Amazon DocumentDB](https://docs.aws.amazon.com/zh_cn/documentdb/latest/developerguide/vector-search.html).

### `OpCountersCommand`

Hành vi `OpCountersCommand` của Amazon DocumentDB khác với `opcounters.command` của MongoDB như sau:

- `opcounters.command` của MongoDB tính tất cả các lệnh ngoại trừ insert, update và delete, trong khi `OpCountersCommand` của Amazon DocumentDB cũng loại trừ lệnh `find`.
- Amazon DocumentDB tính các lệnh nội bộ (ví dụ `getCloudWatchMetricsV2`) vào `OpCountersCommand`.

### Quản lý database và collection

Amazon DocumentDB không hỗ trợ database admin hoặc local, cũng không hỗ trợ các collection `system.*` hoặc `startup_log` của MongoDB.

### `cursormaxTimeMS`

Trong Amazon DocumentDB, `cursor.maxTimeMS` đặt lại bộ đếm cho mỗi request. Do đó với `getMore`, nếu chỉ định 3000MS `maxTimeMS`, truy vấn đó mất 2800MS, và mỗi request `getMore` tiếp theo mất 300MS, cursor sẽ không timeout. Cursor chỉ timeout khi một thao tác đơn lẻ (dù là truy vấn hay một request `getMore` đơn lẻ) mất thời gian vượt quá giá trị `maxTimeMS` được chỉ định. Ngoài ra, scanner kiểm tra thời gian thực thi cursor chạy theo khoảng thời gian 5 phút.

### explain()

Amazon DocumentDB mô phỏng API MongoDB 4.0 trên một engine database chuyên dụng tận dụng hệ thống lưu trữ phân tán, chịu lỗi và tự phục hồi. Do đó, kế hoạch truy vấn và đầu ra của `explain()` có thể khác nhau giữa Amazon DocumentDB và MongoDB. Khách hàng muốn kiểm soát kế hoạch truy vấn của mình có thể sử dụng toán tử `$hint` để ép buộc chọn chỉ mục ưu tiên.

### Giới hạn tên field

Amazon DocumentDB không hỗ trợ dấu chấm "." trong tên field của document, ví dụ `db.foo.insert({'x.1':1})`.

Amazon DocumentDB cũng không hỗ trợ tiền tố $ trong tên field.

Ví dụ, thử lệnh sau trong Amazon DocumentDB hoặc MongoDB:

```shell
rs0:PRIMARY< db.foo.insert({"a":{"$a":1}})
```

MongoDB sẽ trả về:

```shell
WriteResult({ "nInserted" : 1 })
```

Amazon DocumentDB sẽ trả về lỗi:

```shell
WriteResult({
  "nInserted" : 0,
  "writeError" : {
    "code" : 2,
    "errmsg" : "Document can't have $ prefix field names: $a"
  }
})
```

## Tham khảo

- Tài liệu chính thức MongoDB (tài liệu tham khảo chính, lấy tài liệu chính thức làm chuẩn): <https://www.mongodb.com/docs/manual/>
- "Hướng dẫn toàn diện về MongoDB"
- Kỹ thuật chuyên sâu: Nguyên lý giao dịch MongoDB - Cộng đồng MongoDB tiếng Trung：<https://mongoing.com/archives/82187>
- Transactions - Tài liệu chính thức MongoDB：<https://www.mongodb.com/docs/manual/core/transactions/>
- WiredTiger Storage Engine - Tài liệu chính thức MongoDB：<https://www.mongodb.com/docs/manual/core/wiredtiger/>
- WiredTiger storage engine phần 1: Phân tích cấu trúc dữ liệu cơ bản：<https://mongoing.com/topic/archives-35143>

<!-- @include: @article-footer.snippet.md -->
