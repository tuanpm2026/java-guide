---
title: Tổng hợp câu hỏi phỏng vấn MongoDB thường gặp (Phần 2)
description: Phần 2 tổng hợp các câu hỏi phỏng vấn MongoDB thường gặp, giải thích chuyên sâu về nguyên lý, trường hợp sử dụng và kỹ thuật tối ưu hóa truy vấn của các loại index MongoDB (single field, compound, multikey, text, geospatial, TTL).
category: Cơ sở dữ liệu
tag:
  - NoSQL
  - MongoDB
head:
  - - meta
    - name: keywords
      content: MongoDB索引,复合索引,多键索引,文本索引,地理位置索引,TTL索引,MongoDB查询优化,索引设计
---

## MongoDB Index

### Index trong MongoDB có tác dụng gì?

Tương tự như cơ sở dữ liệu quan hệ, MongoDB cũng có index. Mục đích chính của index là để nâng cao hiệu quả truy vấn; nếu không có index, MongoDB phải thực hiện **collection scan**, tức là quét từng document trong collection để chọn các document khớp với câu lệnh truy vấn. Nếu truy vấn có index phù hợp, MongoDB có thể sử dụng index đó để giới hạn số document phải kiểm tra. Ngoài ra, MongoDB có thể sử dụng thứ tự sắp xếp trong index để trả về kết quả đã được sắp xếp.

Dù index có thể rút ngắn đáng kể thời gian truy vấn, nhưng việc sử dụng và duy trì index là có chi phí. Khi thực hiện thao tác ghi, ngoài việc cập nhật document, index cũng phải được cập nhật, điều này chắc chắn ảnh hưởng đến hiệu suất ghi. Do đó, khi có nhiều thao tác ghi và ít thao tác đọc, hoặc khi không quan tâm đến hiệu suất đọc, không nên tạo index.

### MongoDB hỗ trợ những loại index nào?

**MongoDB hỗ trợ nhiều loại index, bao gồm single field index, compound index, multikey index, hash index, text index, geospatial index, v.v., mỗi loại index có trường hợp sử dụng khác nhau.**

- **Single field index:** Index được xây dựng trên một field đơn, thứ tự sắp xếp khi tạo index không quan trọng, MongoDB có thể duyệt từ đầu/cuối.
- **Compound index:** Index được xây dựng trên nhiều field, còn có thể gọi là composite index, joint index.
- **Multikey index**: Một field trong MongoDB có thể là array, khi tạo index trên field kiểu này thì đó là multikey index. MongoDB sẽ tạo index cho mỗi giá trị trong array. Nghĩa là bạn có thể dùng các giá trị trong array làm điều kiện để truy vấn, lúc đó vẫn sử dụng index.
- **Hash index**: Index theo giá trị hash của dữ liệu, dùng trên hash sharded cluster.
- **Text index:** Hỗ trợ truy vấn tìm kiếm văn bản trên nội dung chuỗi. Text index có thể bao gồm bất kỳ field nào có giá trị là chuỗi hoặc mảng các phần tử chuỗi. Một collection chỉ có thể có một text search index, nhưng index đó có thể bao phủ nhiều field. Dù MongoDB hỗ trợ full-text index, nhưng hiệu suất thấp, tạm thời không khuyến nghị sử dụng.
- **Geospatial index:** Index dựa trên kinh/vĩ độ, phù hợp cho truy vấn vị trí 2D và 3D.
- **Unique index**: Đảm bảo field được index không lưu trữ giá trị trùng lặp. Nếu collection đã tồn tại document vi phạm ràng buộc unique của index, thì việc tạo unique index ở background sẽ thất bại.
- **TTL index**: TTL index cung cấp cơ chế hết hạn, cho phép đặt thời gian hết hạn cho mỗi document; khi một document đạt đến thời gian hết hạn được đặt trước, nó sẽ bị xóa.
- ……

### Thứ tự của các field trong compound index có ảnh hưởng không?

Thứ tự của các field trong compound index rất quan trọng. Ví dụ như hình dưới đây, compound index bao gồm `{userid:1, score:-1}`, thì compound index này đầu tiên sắp xếp tăng dần theo `userid`; sau đó trong mỗi giá trị `userid`, sắp xếp giảm dần theo `score`.

![Compound index](https://oss.javaguide.cn/github/javaguide/database/mongodb/mongodb-composite-index.png)

Trong compound index, cách sắp xếp quyết định index đó có thể được áp dụng trong truy vấn hay không.

Sắp xếp dùng compound index:

```sql
db.s2.find().sort({"userid": 1, "score": -1})
db.s2.find().sort({"userid": -1, "score": 1})
```

Sắp xếp không dùng compound index:

```sql
db.s2.find().sort({"userid": 1, "score": 1})
db.s2.find().sort({"userid": -1, "score": -1})
db.s2.find().sort({"score": 1, "userid": -1})
db.s2.find().sort({"score": 1, "userid": 1})
db.s2.find().sort({"score": -1, "userid": -1})
db.s2.find().sort({"score": -1, "userid": 1})
```

Chúng ta có thể phân tích thông qua explain:

```sql
db.s2.find().sort({"score": -1, "userid": 1}).explain()
```

### Compound index có tuân theo nguyên tắc tiền tố bên trái không?

**Compound index trong MongoDB tuân theo nguyên tắc tiền tố bên trái**: Index có nhiều key, có thể đồng thời thu được index được tạo bởi tất cả các prefix của các key đó, nhưng không bao gồm các subset khác ngoài tiền tố bên trái. Ví dụ, có một index như `{a: 1, b: 1, c: 1, ..., z: 1}`, thì thực tế cũng có tương đương `{a: 1}`, `{a: 1, b: 1}`, `{a: 1, b: 1, c: 1}`, v.v., nhưng sẽ không có index không phải tiền tố bên trái như `{b: 1}`.

### TTL index là gì?

TTL index cung cấp cơ chế hết hạn, cho phép đặt thời gian hết hạn `expireAfterSeconds` cho mỗi document; khi một document đạt đến thời gian hết hạn được đặt trước, nó sẽ bị xóa. TTL index ngoài thuộc tính `expireAfterSeconds`, giống với index thông thường.

Dữ liệu hết hạn rất hữu ích cho một số loại thông tin, như dữ liệu sự kiện do máy tạo ra, log và thông tin session — những thông tin này chỉ cần lưu trong database trong thời gian giới hạn.

**Nguyên lý hoạt động của TTL index**:

- MongoDB sẽ mở một background thread đọc giá trị TTL index để phán đoán document có hết hạn không, nhưng không đảm bảo dữ liệu đã hết hạn sẽ bị xóa ngay lập tức. Vì background thread kích hoạt task xóa mỗi 60 giây, và nếu lượng dữ liệu cần xóa lớn, có thể xảy ra tình huống task xóa trước chưa hoàn thành mà task tiếp theo đã bắt đầu, dẫn đến hiện tượng dữ liệu hết hạn xuất hiện vượt quá thời gian lưu trữ dữ liệu hơn 60 giây.
- Đối với replica set, background process của TTL index chỉ khởi động trên node Primary, trên node Secondary sẽ luôn ở trạng thái idle; việc xóa dữ liệu trên Secondary node được đồng bộ thông qua oplog được tạo ra sau khi Primary xóa.

**Giới hạn của TTL index**:

- TTL index là single field index. Compound index không hỗ trợ TTL
- Field `_id` không hỗ trợ TTL index.
- Không thể tạo TTL index trên Capped Collection, vì MongoDB không thể xóa document khỏi Capped Collection.
- Nếu một field đã tồn tại non-TTL index, thì không thể tạo TTL index trên field đó.

### Covered index query là gì?

Theo giới thiệu trong tài liệu chính thức, covered query là truy vấn thỏa mãn:

- Tất cả các field truy vấn là một phần của index.
- Tất cả các field được trả về trong kết quả đều nằm trong cùng một index.
- Không có field nào trong truy vấn bằng `null`.

Vì tất cả các field xuất hiện trong truy vấn là một phần của index, MongoDB không cần kiểm tra toàn bộ document để khớp điều kiện truy vấn và trả về kết quả truy vấn dùng cùng index. Vì index tồn tại trong bộ nhớ, lấy dữ liệu từ index nhanh hơn nhiều so với đọc dữ liệu bằng cách quét document.

Ví dụ: Chúng ta có collection `users` như sau:

```json
{
   "_id": ObjectId("53402597d852426020000002"),
   "contact": "987654321",
   "dob": "01-01-1991",
   "gender": "M",
   "name": "Tom Benzamin",
   "user_name": "tombenzamin"
}
```

Chúng ta tạo joint index trong collection `users` với các field `gender` và `user_name`:

```sql
db.users.ensureIndex({gender:1,user_name:1})
```

Bây giờ, index này sẽ cover các truy vấn sau:

```sql
db.users.find({gender:"M"},{user_name:1,_id:0})
```

Để index được chỉ định cover truy vấn, phải chỉ định rõ ràng `_id: 0` để loại trừ field `_id` khỏi kết quả, vì index không bao gồm field `_id`.

## MongoDB High Availability

### Replica Cluster

#### Replica Cluster là gì?

Replica cluster của MongoDB còn được gọi là replica set, là một nhóm các tiến trình mongod duy trì cùng một dataset.

Client kết nối đến toàn bộ MongoDB replica cluster, primary node chịu trách nhiệm ghi cho toàn bộ replica cluster, secondary node có thể thực hiện thao tác đọc, nhưng mặc định primary node vẫn chịu trách nhiệm đọc cho toàn bộ replica cluster. Khi primary node xảy ra sự cố, tự động bầu chọn một primary node mới từ các secondary node, đảm bảo cluster hoạt động bình thường, điều này là transparent với client.

Thông thường, một replica cluster bao gồm 1 primary node, nhiều secondary node và 0 hoặc 1 arbiter node.

- **Primary node**: Điểm vào thao tác ghi của toàn cluster, nhận tất cả thao tác ghi, và ghi lại tất cả thay đổi của collection vào operation log (oplog). Khi primary node down sẽ tự động bầu chọn primary node mới.
- **Secondary node**: Đồng bộ dữ liệu từ primary node, bầu chọn node mới khi primary node down. Tuy nhiên, secondary node có thể được cấu hình với priority 0, ngăn nó trở thành primary node trong bầu chọn.
- **Arbiter node**: Dùng để tiết kiệm tài nguyên hoặc disaster recovery đa data center, chỉ chịu trách nhiệm bỏ phiếu khi bầu chọn primary node, không lưu trữ dữ liệu, đảm bảo có node nhận được đa số phiếu đồng ý.

Hình dưới là một replica cluster ba thành viên điển hình:

![](https://oss.javaguide.cn/github/javaguide/database/mongodb/replica-set-read-write-operations-primary.png)

Primary node và secondary node đồng bộ dữ liệu thông qua **oplog (operation log)**. oplog là một **Capped Collection** đặc biệt trong thư viện local, dùng để lưu incremental log được tạo ra bởi thao tác ghi, tương tự như Binlog trong MySQL.

> Capped Collection tương tự như hàng đợi vòng có độ dài cố định, dữ liệu được append tuần tự vào cuối collection; khi dung lượng collection đạt giới hạn, nó sẽ ghi đè document cũ nhất trong collection. Dữ liệu Capped Collection sẽ được ghi tuần tự vào không gian cố định trên đĩa, do đó tốc độ I/O rất nhanh; nếu không tạo index, hiệu suất tốt hơn.

![](https://oss.javaguide.cn/github/javaguide/database/mongodb/replica-set-primary-with-two-secondaries.png)

Khi một thao tác ghi trên primary node hoàn tất, một log tương ứng sẽ được ghi vào collection oplog, còn secondary node liên tục pull log mới từ oplog này và replay trên local để đạt được mục đích đồng bộ dữ liệu.

Replica set có tối đa một primary node. Nếu primary node hiện tại không khả dụng, một cuộc bầu chọn sẽ lựa ra primary node mới. Quy tắc bầu chọn node của MongoDB có thể đảm bảo node mới được chọn sau khi Primary down chắc chắn là node có đầy đủ dữ liệu nhất trong cluster.

#### Tại sao phải dùng replica cluster?

- **Thực hiện failover**: Cung cấp chức năng tự động phục hồi sự cố, khi primary node xảy ra sự cố, tự động bầu chọn một primary node mới từ các secondary node, đảm bảo cluster hoạt động bình thường, điều này là transparent với client.
- **Thực hiện read/write separation**: Chúng ta có thể đặt cấu hình để secondary node có thể đọc dữ liệu, primary node chịu trách nhiệm ghi dữ liệu, như vậy thực hiện read/write separation, giảm bớt vấn đề áp lực đọc/ghi quá lớn của primary node. Phiên bản MongoDB trước 4.0 nếu áp lực thư viện chính không lớn không khuyến nghị read/write separation, vì ghi sẽ chặn đọc, trừ khi business không quan tâm nhiều đến thời gian phản hồi và chấp nhận một mức độ trễ nhất định khi đọc dữ liệu lịch sử.

### Sharded Cluster

#### Sharded Cluster là gì?

Sharded cluster là phiên bản phân tán của MongoDB, so với replica set, dữ liệu trong sharded cluster được phân phối đều trên các shard khác nhau, không chỉ tăng đáng kể giới hạn dung lượng dữ liệu của toàn cluster, mà còn phân tán áp lực đọc/ghi sang các shard khác nhau, để giải quyết vấn đề bottleneck hiệu suất của replica set.

Sharded cluster của MongoDB bao gồm ba phần sau (hình dưới đây từ [giới thiệu về sharded cluster trong tài liệu chính thức](https://www.mongodb.com/docs/manual/sharding/)):

![](https://oss.javaguide.cn/github/javaguide/database/mongodb/sharded-cluster-production-architecture.png)

- **Config Servers**: Config server, về bản chất là một replica set của MongoDB, chịu trách nhiệm lưu trữ các metadata và cấu hình của cluster, như địa chỉ shard, Chunks, v.v.
- **Mongos**: Routing service, không lưu trữ dữ liệu cụ thể, lấy cấu hình cluster từ Config và chuyển tiếp request đến shard cụ thể, đồng thời tổng hợp kết quả shard trả về cho client.
- **Shard**: Mỗi shard là một subset của toàn bộ dữ liệu. Từ phiên bản MongoDB 3.6 trở đi, mỗi Shard phải được triển khai theo kiến trúc replica set.

#### Tại sao phải dùng sharded cluster?

Khi dung lượng dữ liệu và throughput hệ thống tăng trưởng, hai giải pháp phổ biến là: vertical scaling và horizontal scaling.

Vertical scaling được thực hiện bằng cách tăng khả năng của server đơn lẻ, như dung lượng đĩa, dung lượng bộ nhớ, số lượng CPU; horizontal scaling được thực hiện bằng cách lưu dữ liệu trên nhiều server, thêm server bổ sung theo nhu cầu để tăng dung lượng.

Tương tự Redis Cluster, MongoDB cũng có thể thực hiện **horizontal scaling** thông qua sharding. Horizontal scaling linh hoạt hơn, có thể đáp ứng nhu cầu lưu trữ dữ liệu lớn hơn, hỗ trợ throughput cao hơn. Và tổng chi phí của horizontal scaling thấp hơn, chỉ cần server đơn lẻ với cấu hình tương đối thấp, nhược điểm là tăng độ phức tạp của infrastructure triển khai và bảo trì.

Tức là khi bạn gặp các vấn đề sau, có thể dùng sharded cluster để giải quyết:

- Dung lượng lưu trữ bị giới hạn bởi máy đơn, tức là tài nguyên đĩa gặp bottleneck.
- Khả năng đọc/ghi bị giới hạn bởi máy đơn, có thể là tài nguyên CPU, bộ nhớ hoặc network card gặp bottleneck, dẫn đến không thể mở rộng khả năng đọc/ghi.

#### Shard key là gì?

**Shard Key (Khóa phân mảnh)** là tiền đề để phân vùng dữ liệu, từ đó phân phối dữ liệu đến các server khác nhau, giảm bớt tải cho server. Tức là, shard key quyết định cách các document trong collection được phân bố giữa các shard trong cluster.

Shard key là một field trong document, nhưng field này không phải là field thông thường, có một số yêu cầu nhất định:

- Nó phải xuất hiện trong tất cả các document.
- Nó phải là một index của collection, có thể là single index hoặc prefix index của compound index, không thể là multikey index, text index hoặc geospatial index.
- Trước phiên bản MongoDB 4.2, giá trị field shard key của document không thể thay đổi. Từ phiên bản MongoDB 4.2 trở đi, trừ khi field shard key là field `_id` không thể thay đổi, bạn có thể cập nhật giá trị shard key của document. Từ phiên bản MongoDB 5.0 trở đi, đã thực hiện live resharding, có thể chọn lại shard key hoàn toàn.
- Kích thước của nó không thể vượt quá 512 bytes.

#### Cách chọn shard key?

Việc chọn shard key phù hợp ảnh hưởng lớn đến hiệu quả sharding, chủ yếu dựa trên bốn yếu tố sau (trích từ [Lưu ý sử dụng sharded cluster - Tài liệu Tencent Cloud](https://cloud.tencent.com/document/product/240/44611)):

- **Cardinality (Cơ số giá trị)** Cardinality càng lớn càng tốt; nếu dùng shard key có cardinality nhỏ, vì số giá trị ứng viên có hạn, tổng số chunk sẽ có hạn; khi dữ liệu tăng nhiều, kích thước chunk sẽ ngày càng lớn, dẫn đến việc di chuyển chunk khi horizontal scaling rất khó. Ví dụ: chọn tuổi làm cardinality, phạm vi tối đa chỉ có 100, khi dữ liệu tăng, một giá trị phân bố quá nhiều, dẫn đến chunck vượt phạm vi chunksize, gây ra jumbo chunk không thể migrate, dẫn đến phân phối dữ liệu không đều, bottleneck hiệu suất.
- **Phân phối giá trị** Phân phối giá trị nên đều nhất có thể; shard key phân phối không đều sẽ khiến một số chunk có lượng dữ liệu rất lớn, tương tự có vấn đề phân phối dữ liệu không đều, bottleneck hiệu suất như trên.
- **Truy vấn mang shard** Khi truy vấn nên mang shard key; khi sử dụng shard key để truy vấn có điều kiện, mongos có thể định vị trực tiếp đến shard cụ thể; ngược lại mongos cần phân phối truy vấn đến tất cả shard, rồi đợi phản hồi trả về.
- **Tránh đơn điệu tăng hoặc giảm** Sharding key đơn điệu tăng, di chuyển file dữ liệu nhỏ, nhưng ghi sẽ tập trung, dẫn đến lượng dữ liệu của chunk cuối cùng liên tục tăng, liên tục xảy ra migrate; đơn điệu giảm tương tự.

Tóm lại, khi chọn shard key cần xem xét 4 điều kiện trên, thỏa mãn càng nhiều điều kiện càng tốt, mới có thể giảm ảnh hưởng của MoveChunks đến hiệu suất, từ đó có được trải nghiệm hiệu suất tối ưu.

#### Có những chiến lược phân mảnh nào?

MongoDB hỗ trợ hai thuật toán sharding để đáp ứng các nhu cầu truy vấn khác nhau (trích từ [Giới thiệu MongoDB Sharded Cluster - Tài liệu Alibaba Cloud](https://help.aliyun.com/document_detail/64561.html?spm=a2c4g.11186623.0.0.3121565eQhUGGB#h2--shard-key-3)):

**1. Sharding dựa trên phạm vi (Range-based sharding)**:

![](https://oss.javaguide.cn/github/javaguide/database/mongodb/example-of-scope-based-sharding.png)

MongoDB phân chia dữ liệu thành các chunk khác nhau theo phạm vi giá trị của shard key, mỗi chunk chứa dữ liệu trong một phạm vi nhất định. Khi shard key có cardinality lớn, tần suất thấp và giá trị không thay đổi đơn điệu, range sharding hiệu quả hơn.

- Ưu điểm: Mongos có thể nhanh chóng xác định vị trí dữ liệu mà request cần, và chuyển tiếp request đến Shard node tương ứng.
- Nhược điểm: Có thể dẫn đến phân phối dữ liệu không đều trên các Shard node, dễ tạo ra read/write hotspot, và không có khả năng phân tán ghi.
- Kịch bản áp dụng: Giá trị shard key không đơn điệu tăng hoặc giảm, cardinality shard key lớn và tần suất lặp lại thấp, cần range query và các business scenario khác.

**2. Sharding dựa trên Hash**

![](https://oss.javaguide.cn/github/javaguide/database/mongodb/example-of-hash-based-sharding.png)

MongoDB tính toán giá trị hash của một field đơn làm giá trị index, và phân chia dữ liệu thành các chunk khác nhau theo phạm vi giá trị hash.

- Ưu điểm: Có thể phân phối dữ liệu đều hơn trên các Shard node, có khả năng phân tán ghi.
- Nhược điểm: Không phù hợp để thực hiện range query; khi thực hiện range query, cần phân phối read request đến tất cả Shard node.
- Kịch bản áp dụng: Giá trị shard key tồn tại đơn điệu tăng hoặc giảm, cardinality shard key lớn và tần suất lặp lại thấp, cần phân phối ngẫu nhiên dữ liệu ghi, tính ngẫu nhiên của đọc dữ liệu tương đối lớn và các business scenario khác.

Ngoài hai chiến lược sharding trên, bạn còn có thể cấu hình **composite shard key**, ví dụ bao gồm một key cardinality thấp và một key đơn điệu tăng.

#### Dữ liệu phân mảnh được lưu như thế nào?

**Chunk (Khối)** là một khái niệm cốt lõi trong sharded cluster của MongoDB, về bản chất là đơn vị dữ liệu logic được tạo thành từ một nhóm Document. Mỗi Chunk chứa dữ liệu shard key trong một phạm vi nhất định, không giao nhau và union là toàn bộ dữ liệu, tức là khái niệm **phân vùng** trong toán học rời rạc.

Sharded cluster không ghi lại từng dữ liệu nằm trên shard nào, mà ghi lại Chunk nằm trên shard nào và Chunk này chứa những dữ liệu gì.

Theo mặc định, giá trị tối đa của một Chunk là 64MB (có thể điều chỉnh, phạm vi giá trị 1~1024 MB. Nếu không có yêu cầu đặc biệt, khuyến nghị giữ giá trị mặc định); khi thực hiện insert, update, delete dữ liệu, nếu lúc đó Mongos phát hiện kích thước hoặc lượng dữ liệu của Chunk mục tiêu vượt giới hạn, sẽ kích hoạt **Chunk splitting (Phân tách chunk)**.

![Phân tách chunk](https://oss.javaguide.cn/github/javaguide/database/mongodb/chunk-splitting-shard-a.png)

Sự tăng trưởng dữ liệu sẽ khiến Chunk phân tách ngày càng nhiều. Lúc này, số lượng Chunk trên các shard có thể không cân bằng. Component **Balancer (Cân bằng tải)** trong Mongos sẽ thực hiện tự động cân bằng, cố gắng giữ số lượng Chunk trên các Shard cân bằng nhau, quá trình này gọi là **Rebalance (Tái cân bằng)**. Theo mặc định, Rebalance cho database và collection được bật.

Như hình dưới, khi dữ liệu được insert, dẫn đến Chunk phân tách, khiến hai shard A và B có 3 Chunk, còn shard C chỉ có 1 cái; lúc này sẽ migrate 1 chunk được phân bổ từ B sang shard C để thực hiện cân bằng dữ liệu cluster.

![Chunk migration](https://oss.javaguide.cn/github/javaguide/database/mongodb/mongo-reblance-three-shards.png)

> Balancer là một background process của MongoDB chạy trên Primary node của Config Server (từ phiên bản MongoDB 3.4 trở đi), nó theo dõi số lượng Chunk trên mỗi shard, và thực hiện migrate khi số lượng Chunk trên một shard đạt ngưỡng.

Chunk chỉ phân tách, không hợp nhất, dù giá trị chunkSize có tăng lên.

Thao tác Rebalance tốn khá nhiều tài nguyên hệ thống; chúng ta có thể giảm ảnh hưởng của nó đến việc sử dụng MongoDB bình thường bằng cách thực hiện trong giờ thấp điểm business, pre-sharding hoặc đặt thời gian window Rebalance.

#### Nguyên lý Chunk migration là gì?

Để tìm hiểu chi tiết về nguyên lý Chunk migration, khuyến nghị đọc bài viết [Hiểu toàn bộ về chunk migration trong MongoDB](https://mongoing.com/archives/77479) của cộng đồng MongoDB Trung Quốc.

## Tài liệu học tập khuyến nghị

- [Hướng dẫn tiếng Trung MongoDB|Phiên bản tiếng Trung tài liệu chính thức](https://docs.mongoing.com/) (Khuyến nghị): Dựa trên phiên bản 4.2, liên tục đồng bộ với phiên bản mới nhất chính thức.
- [Tutorial MongoDB cho người mới bắt đầu — Học MongoDB trong 7 ngày](https://mongoing.com/archives/docs/mongodb%e5%88%9d%e5%ad%a6%e8%80%85%e6%95%99%e7%a8%8b/mongodb%e5%a6%82%e4%bd%95%e5%88%9b%e5%bb%ba%e6%95%b0%e6%8d%ae%e5%ba%93%e5%92%8c%e9%9b%86%e5%90%88): Nhập môn nhanh.
- [Thực chiến SpringBoot tích hợp MongoDB - 2022](https://www.cnblogs.com/dxflqm/p/16643981.html): Một bài viết nhập môn MongoDB rất tốt, chủ yếu xoay quanh việc sử dụng Java client của MongoDB để thực hiện các thao tác CRUD cơ bản.

## Tham khảo

- Tài liệu chính thức MongoDB (tài liệu tham khảo chính, lấy tài liệu chính thức làm chuẩn): <https://www.mongodb.com/docs/manual/>
- 《MongoDB: The Definitive Guide》
- Indexes - Tài liệu chính thức MongoDB: <https://www.mongodb.com/docs/manual/indexes/>
- MongoDB - Kiến thức Index - Programmer Xiangzai - 2022: <https://fatedeity.cn/posts/database/mongodb-index-knowledge.html>
- MongoDB - Index: <https://www.cnblogs.com/Neeo/articles/14325130.html>
- Sharding - Tài liệu chính thức MongoDB: <https://www.mongodb.com/docs/manual/sharding/>
- Giới thiệu MongoDB Sharded Cluster - Tài liệu Alibaba Cloud: <https://help.aliyun.com/document_detail/64561.html>
- Lưu ý sử dụng sharded cluster - Tài liệu Tencent Cloud: <https://cloud.tencent.com/document/product/240/44611>

<!-- @include: @article-footer.snippet.md -->
