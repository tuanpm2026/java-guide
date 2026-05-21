---
title: Giải thích chi tiết Read-Write Separation và Database Sharding
description: Bài viết giải thích sâu về nguyên lý cốt lõi của database read-write separation và sharding, bao gồm cơ chế master-slave replication, phương án triển khai read-write separation (proxy/component), sự khác biệt giữa vertical và horizontal sharding, cùng các giải pháp cho vấn đề distributed transaction, distributed ID, cross-database JOIN sau khi sharding.
category: High Performance
head:
  - - meta
    - name: keywords
      content: read-write separation,database sharding,master-slave replication,horizontal sharding,vertical database split,ShardingSphere,MyCat,distributed ID,cross-database query
---

<!-- @include: @small-advertisement.snippet.md -->

## Read-Write Separation

### Read-Write Separation là gì?

Như tên gọi, chúng ta có thể biết: **Read-write separation chủ yếu là để phân tán các thao tác đọc/ghi trên database ra các database node khác nhau.** Như vậy, có thể cải thiện một chút write performance và cải thiện đáng kể read performance.

Tôi vẽ một sơ đồ đơn giản để giúp những bạn chưa hiểu rõ về read-write separation.

![Read-write separation diagram](https://oss.javaguide.cn/github/javaguide/high-performance/read-and-write-separation-and-library-subtable/read-and-write-separation.png)

Thông thường, chúng ta sẽ chọn one master multi slave — một master database chịu trách nhiệm ghi, các slave database còn lại chịu trách nhiệm đọc. Giữa master và slave sẽ đồng bộ dữ liệu để đảm bảo tính chính xác của dữ liệu trong slave. Architecture này triển khai tương đối đơn giản và cũng phù hợp với đặc điểm đọc nhiều ghi ít của hệ thống.

### Làm thế nào để triển khai Read-Write Separation?

Dù dùng phương án triển khai cụ thể nào, muốn triển khai read-write separation thường bao gồm các bước sau:

1. Deploy nhiều database, chọn một trong số đó làm master database, các database còn lại là slave database.
2. Đảm bảo dữ liệu giữa master database và slave database được đồng bộ real-time, quá trình này là **master-slave replication**.
3. Hệ thống giao write request cho master database xử lý, read request cho slave database xử lý.

Trong project thực tế, có hai cách phổ biến:

**1. Proxy method**

![Read-write separation via proxy](https://oss.javaguide.cn/github/javaguide/high-performance/read-and-write-separation-and-library-subtable/read-and-write-separation-proxy.png)

Chúng ta có thể thêm một proxy layer giữa application và database. Tất cả request dữ liệu của application đều giao cho proxy layer xử lý, proxy layer chịu trách nhiệm tách read/write request và route chúng đến database tương ứng.

Middleware cung cấp chức năng tương tự: **MySQL Router** (official, thay thế cho MySQL Proxy), **Atlas** (dựa trên MySQL Proxy), **MaxScale**, **MyCat**.

Thêm một điểm về MySQL Router: Trong phiên bản MySQL 8.2, MySQL Router có thể tự động nhận biết các thao tác đọc/ghi trên database và route chúng đến instance đúng. Đây là tính năng có giá trị, có thể tối ưu hiệu năng và scalability của database mà không cần thay đổi gì trong application. Chi tiết có thể tham khảo blog chính thức: [MySQL 8.2 – transparent read/write splitting](https://blogs.oracle.com/mysql/post/mysql-82-transparent-readwrite-splitting).

**2. Component method**

Trong cách này, chúng ta có thể triển khai routing read/write request bằng cách import third-party component.

Đây cũng là cách tôi khuyến nghị hơn. Cách này hiện đang được dùng nhiều nhất trong các công ty internet, có rất nhiều case study thực tế. Nếu bạn muốn dùng cách này, khuyến nghị dùng **ShardingSphere-JDBC**, import jar package trực tiếp là có thể dùng, rất tiện lợi. Đồng thời cũng tiết kiệm nhiều chi phí vận hành.

Bạn có thể tìm thấy [ShardingSphere-JDBC read-write separation configuration](https://shardingsphere.apache.org/document/current/cn/features/readwrite-splitting/) trên ShardingSphere official website.

### Nguyên lý Master-Slave Replication là gì?

MySQL binlog (binary log — file log nhị phân) chủ yếu ghi lại tất cả thay đổi dữ liệu trong MySQL database (tất cả câu lệnh DDL và DML mà database thực thi). Vì vậy, dựa trên MySQL binlog của master, chúng ta có thể đồng bộ dữ liệu từ master sang slave.

Quá trình cụ thể và chi tiết hơn như sau (hình ảnh từ [《MySQL Master-Slave Replication on the Same Machine》](https://www.toptal.com/mysql/mysql-master-slave-replication-tutorial)):

![MySQL master-slave replication](https://oss.javaguide.cn/java-guide-blog/78816271d3ab52424bfd5ad3086c1a0f.png)

1. Master ghi các thay đổi dữ liệu trong database vào binlog
2. Slave kết nối với master
3. Slave tạo một I/O thread để request binlog cập nhật từ master
4. Master tạo một binlog dump thread để gửi binlog, I/O thread của slave chịu trách nhiệm nhận
5. I/O thread của slave ghi binlog nhận được vào relay log.
6. SQL thread của slave đọc relay log để đồng bộ dữ liệu về local (tức là thực thi SQL một lần nữa).

Thế nào? Sau khi đọc giải thích của tôi về quá trình master-slave replication này, bạn đã hiểu rõ chưa!

Thông thường khi bạn thấy binlog là phải nghĩ đến master-slave replication. Tất nhiên, ngoài master-slave replication, binlog còn có thể giúp chúng ta thực hiện data recovery.

🌈 Mở rộng thêm:

Không biết mọi người có dùng qua tool của Alibaba mã nguồn mở tên canal không. Tool này có thể giúp chúng ta đồng bộ dữ liệu giữa MySQL và các data source khác như Elasticsearch hoặc MySQL database khác. Rõ ràng, nguyên lý tầng dưới của tool này cũng phụ thuộc vào binlog. Nguyên lý của canal là mô phỏng quá trình MySQL master-slave replication, parse binlog để đồng bộ dữ liệu sang các data source khác.

Ngoài ra, component Redis caching phân tán mà chúng ta thường dùng cũng triển khai read-write separation thông qua master-slave replication.

🌕 Tổng kết ngắn gọn:

**MySQL master-slave replication phụ thuộc vào binlog. Ngoài ra, một số tool đồng bộ dữ liệu MySQL sang các data source khác (như canal) thường cũng phụ thuộc vào binlog ở tầng dưới.**

### Làm thế nào để tránh master-slave lag?

Read-write separation rất hiệu quả trong việc cải thiện concurrency của database, nhưng đồng thời cũng gây ra một vấn đề: có độ trễ giữa dữ liệu master và slave. Ví dụ sau khi bạn ghi vào master, mất thời gian để đồng bộ dữ liệu từ master sang slave, khoảng thời gian chênh lệch này gây ra vấn đề data inconsistency giữa master và slave. Đây chính là **master-slave sync lag** mà chúng ta thường nói.

Nếu business scenario của chúng ta không thể chấp nhận master-slave sync lag, nên làm thế nào để tránh (chú ý: tôi nói ở đây là tránh chứ không phải giảm lag)?

Đây có hai phương án tôi biết (khả năng có hạn, hoan nghênh bổ sung), bạn có thể tham khảo theo business scenario của mình.

#### Buộc route read request về master

Đối với một số ít nghiệp vụ bắt buộc phải strong consistency (như query balance ngay sau khi thanh toán), có thể buộc query master qua Hint.

```java
// ShardingSphere-JDBC buộc đọc master
HintManager hintManager = HintManager.getInstance();
hintManager.setMasterRouteOnly();
// Tiếp tục JDBC operation
```

> ⚠️ **Chú ý**: Tuyệt đối không được dùng phương án này trên diện rộng! Mục đích ban đầu của read-write separation là để phân tải read pressure cho master. Nếu lượng lớn read request do lag mà quay về master, trong các tình huống high concurrency như khuyến mãi, flash sale, rất dễ làm sập master dẫn đến toàn bộ trang web sập. **Trade-off đúng đắn**: Chỉ read master cho core strong consistency chain, non-core chain nhất thiết phải chấp nhận eventual consistency ở business layer (như hiển thị "Data đang đồng bộ").

```java
HintManager hintManager = HintManager.getInstance();
hintManager.setMasterRouteOnly();
// Tiếp tục JDBC operation
```

Đối với phương án này, bạn có thể giao tất cả read request bắt buộc phải lấy dữ liệu mới nhất cho master xử lý.

#### Delayed read (Đọc trễ)

Một số bạn chắc chắn sẽ nghĩ: vì master-slave sync có lag, thì tôi đọc sau khi đã lag xong, ví dụ master-slave sync lag 0.5s, thì tôi đọc dữ liệu sau 1 giây. Tiện vậy! Tiện thật đấy, nhưng cũng khá vô lý.

Tuy nhiên, nếu bạn thiết kế business flow như này sẽ tốt hơn: Đối với một số tình huống nhạy cảm với dữ liệu, bạn có thể tránh request ngay sau khi hoàn thành write request. Ví dụ sau khi thanh toán thành công, chuyển đến trang thanh toán thành công, khi bạn click quay về mới trở về tài khoản của mình.

#### Tổng kết

Về cách tránh master-slave lag, chúng ta giới thiệu hai phương án. Thực ra, delayed read không thể tránh hoàn toàn master-slave lag, chỉ có thể nói giảm xác suất xảy ra lag thôi, project thực tế thường không dùng.

Tổng thể mà nói, muốn không có vấn đề delay, thông thường vẫn phải buộc giao tất cả read request bắt buộc lấy dữ liệu mới nhất cho master xử lý. Nếu phần lớn business scenario của project không yêu cầu tính chính xác dữ liệu cao thì phương án này có thể chọn.

### Khi nào sẽ xảy ra master-slave lag? Làm thế nào để giảm lag?

Ở phần trên chúng ta cũng đề cập đến master-slave lag và cách tránh, ở đây chúng ta phân tích kỹ hơn về nguyên nhân xảy ra master-slave lag và làm thế nào để giảm master-slave lag.

Để hiểu khi nào sẽ xảy ra master-slave lag, chúng ta cần hiểu master-slave lag là gì.

MySQL master-slave sync lag là tình trạng dữ liệu của slave bị chậm hơn dữ liệu của master, tình trạng này có thể do hai nguyên nhân:

1. Tốc độ I/O thread của slave nhận binlog không theo kịp tốc độ ghi binlog của master, dẫn đến dữ liệu relay log của slave chậm hơn dữ liệu binlog của master;
2. Tốc độ SQL thread của slave thực thi relay log không theo kịp tốc độ I/O thread của slave nhận binlog, dẫn đến dữ liệu của slave chậm hơn dữ liệu relay log của slave.

Có 3 thời điểm chính liên quan đến master-slave sync:

1. Master thực thi xong một transaction, ghi vào binlog, thời điểm này gọi là T1;
2. I/O thread của slave nhận binlog và ghi vào relay log gọi là T2;
3. SQL thread của slave đọc relay log đồng bộ dữ liệu về local gọi là T3.

> **Chú ý**: Mô tả trên dựa trên chế độ **async replication** mặc định của MySQL. Nếu bật enhanced semi-sync replication trong MySQL 5.7+ (`rpl_semi_sync_master_wait_point=AFTER_SYNC`), master sau khi ghi binlog sẽ chờ ít nhất một slave nhận và ghi vào relay log mới trả về commit success cho client — điều này ở một mức độ nào đó tính thời gian network transmission T2-T1 vào response time của transaction trên master, đánh đổi write performance để có data safety cao hơn.

Kết hợp với nguyên lý master-slave replication đã nói ở trên, có thể rút ra:

- Hiệu số T2 và T1 phản ánh hiệu năng của I/O thread trong slave và hiệu quả network transmission, hiệu số này càng nhỏ thì hiệu năng I/O thread và network transmission càng cao.
- Hiệu số T3 và T2 phản ánh tốc độ thực thi của SQL thread trong slave, hiệu số này càng nhỏ thì tốc độ thực thi SQL thread càng nhanh.

Vậy khi nào sẽ xảy ra master-slave lag? Đây là một số tình huống phổ biến:

1. **Slave machine specs kém hơn master**: Tốc độ slave nhận binlog, ghi relay log và thực thi SQL sẽ chậm hơn (T2-T1 và T3-T2 sẽ lớn hơn), dẫn đến lag. Giải pháp là chọn machine có spec bằng hoặc cao hơn master làm slave, hoặc tối ưu hiệu năng slave, ví dụ điều chỉnh parameter, thêm cache, dùng SSD.
2. **Slave xử lý quá nhiều read request**: Slave cần thực thi tất cả write operation của master, đồng thời còn phải phản hồi read request. Nếu read request quá nhiều, chiếm CPU, memory, network và các resource khác của slave, ảnh hưởng đến replication efficiency của slave. Giải pháp là giới thiệu cache (recommended), dùng one-master-multi-slave architecture, phân tán read request đến các slave khác nhau, hoặc dùng hệ thống khác để cung cấp query capability, ví dụ đưa binlog vào Hadoop, Elasticsearch.
3. **Large transaction**: Transaction chạy lâu, chưa commit trong thời gian dài gọi là large transaction. Do large transaction thực thi lâu và large transaction trên slave tốn nhiều thời gian và resource hơn trên master, nên rất dễ gây ra master-slave lag. Giải pháp là tránh modify dữ liệu hàng loạt, cố gắng thực hiện theo batch. Tình huống tương tự là slow SQL có thời gian thực thi dài, project thực tế gặp slow SQL nên tối ưu.
4. **Quá nhiều slave**: Master cần sync binlog đến tất cả slave, nếu có quá nhiều slave, sẽ tăng thời gian và chi phí sync (T2-T1 sẽ khá lớn, nhưng ở đây là do áp lực sync của master lớn gây ra). Giải pháp là giảm số lượng slave, hoặc phân slave thành các tầng khác nhau, để slave tầng trên sync cho slave tầng dưới, giảm áp lực cho master.
5. **Network lag**: Nếu tốc độ network transmission giữa master và slave chậm, hoặc xảy ra packet loss, jitter, sẽ ảnh hưởng đến transmission efficiency của binlog, dẫn đến slave lag. Giải pháp là tối ưu môi trường mạng, ví dụ tăng bandwidth, giảm latency, tăng stability.
6. **Single-threaded replication**: MySQL 5.5 trở về trước chỉ hỗ trợ single-threaded replication. Để tối ưu replication performance, MySQL 5.6 giới thiệu **multi-threaded replication** nhưng chỉ hỗ trợ parallel theo database (`slave_parallel_type=DATABASE`). MySQL 5.7 cải tiến thêm, hỗ trợ parallel theo group commit (`slave_parallel_type=LOGICAL_CLOCK`), cải thiện đáng kể hiệu quả parallel. Khuyến nghị cấu hình `slave_parallel_workers > 0` trong slave để bật parallel replication.
7. **Replication mode**: MySQL mặc định là async replication, chắc chắn sẽ có vấn đề lag. Full sync replication không có vấn đề lag nhưng hiệu năng quá kém. Semi-sync replication là giải pháp trung gian, so với async replication, semi-sync replication cải thiện data safety, giảm master-slave lag (vẫn có một mức độ lag nhất định). Từ MySQL 5.5, MySQL hỗ trợ **semi-sync replication** dưới dạng plugin. Và MySQL 5.7 giới thiệu **enhanced semi-sync replication**.
8. ……

## Database Sharding (Phân mảnh cơ sở dữ liệu)

Read-write separation chủ yếu đối phó với read concurrency của database, không giải quyết vấn đề storage. Hãy thử nghĩ: **Nếu data volume của một table trong MySQL quá lớn thì làm thế nào?**

Nói cách khác, **chúng ta nên giải quyết storage pressure của MySQL như thế nào?**

Một trong những câu trả lời là **database/table sharding**.

### Database Split là gì?

**Database split** là phân tán dữ liệu trong database ra các database khác nhau, có thể là vertical database split hoặc horizontal database split.

**Vertical database split** là chia single database theo nghiệp vụ, các nghiệp vụ khác nhau dùng database khác nhau, từ đó phân tán áp lực của một database ra nhiều database.

Ví dụ: Bạn tách riêng user table, order table và product table trong database thành user database, order database và product database.

![Vertical database split](./images/read-and-write-separation-and-library-subtable/vertical-slicing-database.png)

**Horizontal database split** là tách cùng một table theo quy tắc nhất định ra các database khác nhau, mỗi database có thể ở trên các server khác nhau, như vậy thực hiện horizontal scaling, giải quyết vấn đề storage và performance bottleneck của single table.

Ví dụ: Order table data quá lớn, bạn horizontal split (horizontal table split) order table, rồi đặt 2 order table sau khi split vào hai database khác nhau.

![Horizontal database split](./images/read-and-write-separation-and-library-subtable/horizontal-slicing-database.png)

### Table Split là gì?

**Table split** là split data của single table, có thể là vertical split hoặc horizontal split.

**Vertical table split** là split column của table, tách một table có nhiều column thành nhiều table.

Ví dụ: Chúng ta có thể tách riêng một số column trong user info table ra làm một table.

**Horizontal table split** là split row của table, tách một table có nhiều row thành nhiều table, có thể giải quyết vấn đề data volume quá lớn của single table.

Ví dụ: Chúng ta có thể split user info table thành nhiều user info table, như vậy tránh được việc data volume quá lớn ảnh hưởng đến hiệu năng.

Horizontal split chỉ có thể giải quyết vấn đề data volume lớn của single table. Để cải thiện hiệu năng, chúng ta thường chọn đặt nhiều table sau khi split vào các database khác nhau. Tức là, horizontal table split thường xuất hiện cùng với horizontal database split.

![Table split](./images/read-and-write-separation-and-library-subtable/two-forms-of-sub-table.png)

### Khi nào cần database/table sharding?

Có thể cân nhắc database/table sharding khi gặp các tình huống sau:

- Data volume của single table đạt hàng chục triệu bản ghi trở lên (ngưỡng cụ thể phụ thuộc vào độ phức tạp của table structure, số lượng index, cấu hình phần cứng v.v.), tốc độ đọc/ghi database giảm rõ rệt.
- Không gian dữ liệu trong database ngày càng lớn, thời gian backup ngày càng dài.
- Concurrency của application quá cao (nên ưu tiên xem xét các phương pháp tối ưu hiệu năng khác trước, không phải sharding).

Tuy nhiên, chi phí của database/table sharding rất cao, nếu không bắt buộc thì không nên dùng. Và cũng không nhất thiết phải sharding khi single table đạt hàng chục triệu rows, xét cho cùng mỗi table có các field khác nhau, data volume chúng có thể chứa ở hiệu năng tốt cũng không giống nhau, vẫn phải phân tích từng tình huống cụ thể.

### Các sharding algorithm phổ biến là gì?

Sharding algorithm chủ yếu giải quyết vấn đề sau khi dữ liệu được horizontal sharding, dữ liệu nên được lưu trong table nào.

Các sharding algorithm phổ biến:

- **Hash Sharding**: Tính hash của sharding key được chỉ định, rồi dựa vào hash value để xác định data nên được đặt vào table nào. Hash sharding phù hợp với scenario random read/write, không phù hợp với scenario cần range query thường xuyên. Hash sharding có thể phân phối dữ liệu tương đối đều vào các table, nhưng không thân thiện với dynamic scaling (ví dụ thêm table hoặc database).
- **Range Sharding**: Phân phối dữ liệu theo khoảng cụ thể (ví dụ khoảng thời gian, khoảng ID). Ví dụ phân record có `id` từ `1~299999` vào table đầu tiên, `300000~599999` vào table thứ hai. Range sharding phù hợp với scenario cần range query thường xuyên và phân phối dữ liệu đều, không phù hợp với scenario random read/write (dữ liệu không được phân tán, dễ xảy ra hot spot data).
- **Consistent Hashing Sharding**: Tổ chức hash space thành một vòng tròn, map cả sharding key và node (database hoặc table) lên vòng này, rồi dựa theo quy tắc clockwise để xác định data hoặc request nên được phân bổ vào node nào. Giải quyết được vấn đề hash truyền thống không thân thiện với dynamic scaling.

Dựa trên các thuật toán cơ bản trên, còn có thể kết hợp với nghiệp vụ để tạo ra routing strategy phức tạp hơn:

- **Mapping Table Routing**: Duy trì một routing table độc lập để ghi lại mapping giữa sharding key và data node, cực kỳ linh hoạt nhưng có single point performance bottleneck.
- **Geographic Routing**: Dùng địa lý làm sharding key, kết hợp cơ chế range hoặc mapping table, lưu trữ dữ liệu gần với data center cụ thể (thường dùng trong kiến trúc NewSQL multi-active).

### Sharding Key nên chọn như thế nào?

Sharding Key là field quan trọng để data sharding. Việc chọn sharding key rất quan trọng, nó liên quan đến phân phối dữ liệu và query efficiency. Thông thường, sharding key nên có các đặc điểm sau:

- Có commonality — có thể bao phủ phần lớn query scenario, giảm tối đa số sharding liên quan đến một lần query, giảm database pressure;
- Có discreteness — có thể phân tán dữ liệu đều vào các shard, tránh data skew và hot spot problem;
- Có stability — giá trị của sharding key không thay đổi, tránh data migration và consistency problem;
- Có scalability — có thể hỗ trợ dynamic add/remove shard, tránh chi phí re-sharding.

Trong project thực tế, sharding key rất khó đáp ứng tất cả đặc điểm trên, cần cân nhắc. Ngoài ra, sharding key có thể là tổ hợp của nhiều field trong table, ví dụ lấy 4 chữ số cuối của user ID làm suffix của order ID.

### Database/Table Sharding sẽ gây ra những vấn đề gì?

Nhớ rằng, bất kỳ quyết định kỹ thuật nào bạn làm trong công ty, không chỉ cần cân nhắc liệu công nghệ này có thể đáp ứng yêu cầu không, có phù hợp với business scenario hiện tại không, mà còn phải cân nhắc kỹ chi phí nó mang lại.

Sau khi giới thiệu database/table sharding, sẽ mang lại những thách thức gì cho hệ thống?

- **JOIN operation**: Các table trong cùng một database được phân tán ra các database khác nhau, dẫn đến không thể dùng JOIN operation. Điều này dẫn đến chúng ta cần manually đóng gói dữ liệu, ví dụ query dữ liệu từ một database, rồi dựa trên dữ liệu đó đi tìm dữ liệu tương ứng ở database khác. Tuy nhiên, nhiều senior DBA ở các công ty lớn đều khuyến nghị cố gắng không dùng JOIN operation. Vì JOIN có efficiency thấp và sẽ ảnh hưởng đến database/table sharding. Với những nơi cần dùng JOIN, có thể dùng phương pháp query nhiều lần và assemble data ở business layer. Tuy nhiên, phương pháp này cần cân nhắc tolerance của business cho transaction của nhiều query.
- **Transaction problem**: Các table trong cùng database được phân tán ra các database khác nhau, nếu một operation đơn lẻ liên quan đến nhiều database, thì transaction tích hợp của database không thể đáp ứng yêu cầu nữa. Lúc này, cần giới thiệu distributed transaction. Về tổng hợp các giải pháp distributed transaction phổ biến, trang web cũng có tổng hợp tương ứng: <https://javaguide.cn/distributed-system/distributed-transaction.html>.
- **Distributed ID**: Sau khi sharding database, dữ liệu nằm rải rác trên các database của các server khác nhau, auto-increment primary key của database không còn có thể đảm bảo tính duy nhất của primary key được tạo ra. Làm thế nào để tạo global unique primary key cho các data node khác nhau? Lúc này, cần giới thiệu distributed ID vào hệ thống. Về giới thiệu chi tiết distributed ID và tổng hợp các giải pháp triển khai, có thể xem bài tôi viết: [Giới thiệu Distributed ID & Tổng hợp giải pháp triển khai](https://javaguide.cn/distributed-system/distributed-id.html).
- **Cross-database aggregation query problem**: Database/table sharding sẽ làm cho các aggregate query thông thường như group by, order by trở nên vô cùng phức tạp. Vì các operation này cần data aggregation và sorting trên nhiều shard, chứ không phải trên single database. Để triển khai các operation này, cần viết business code phức tạp, hoặc dùng middleware để coordinate communication và data transmission giữa các shard. Điều này làm tăng chi phí phát triển và bảo trì, cũng như ảnh hưởng đến query performance và scalability.
- **Dynamic scaling difficulty (Resharding)**: Đặc biệt khi dùng traditional Hash modulo algorithm, một khi capacity của shard hiện tại đầy và cần thêm node mới, sẽ khiến hash mapping của phần lớn dữ liệu bị fail, gây ra việc shuffle và migration dữ liệu toàn bộ cực kỳ đau đớn. Các giải pháp gồm: pre-split đủ shard (như 1024 logical table), dùng consistent hashing, hoặc dùng distributed database hỗ trợ automatic Rebalance (như TiDB).
- ……

Ngoài ra, sau khi giới thiệu database/table sharding, thường cần sự tham gia của DBA, đồng thời cần nhiều database server hơn, đây đều là chi phí.

### Có phương án nào được khuyến nghị cho database/table sharding không?

Apache ShardingSphere là một hệ sinh thái distributed database, có thể chuyển đổi bất kỳ database nào thành distributed database, và tăng cường database gốc thông qua các khả năng như data sharding, elastic scaling, encryption.

Project ShardingSphere (bao gồm Sharding-JDBC, Sharding-Proxy và Sharding-Sidecar) được Dangdang donate cho Apache, hiện được duy trì chủ yếu bởi một số senior engineers từ JD Finance.

ShardingSphere tuyệt đối có thể nói là lựa chọn đầu tiên cho database/table sharding hiện tại! Chức năng của ShardingSphere đầy đủ, ngoài hỗ trợ read-write separation và sharding, còn cung cấp distributed transaction, database governance, shadow database, data encryption và desensitization.

Các chức năng ShardingSphere cung cấp:

![Features provided by ShardingSphere](https://oss.javaguide.cn/github/javaguide/high-performance/shardingsphere-features.png)

Ưu điểm của ShardingSphere (trích từ ShardingSphere official documentation: <https://shardingsphere.apache.org/document/current/cn/overview/>):

- Hiệu năng tột đỉnh: Driver end trải qua nhiều năm mài giũa, hiệu quả gần với native JDBC, hiệu năng cực đỉnh.
- Tương thích ecosystem: Proxy end hỗ trợ bất kỳ ứng dụng nào truy cập qua MySQL/PostgreSQL protocol, driver end có thể kết nối với bất kỳ database nào triển khai JDBC specification.
- Business zero invasion: Khi đối mặt với database replacement scenario, ShardingSphere có thể đáp ứng business migration mượt mà mà không cần thay đổi.
- Low ops cost: Tiền đề giữ nguyên technology stack gốc, DBA learning và management cost thấp, interaction thân thiện.
- Secure và stable: Cung cấp incremental capability trên nền database mature, cân bằng security và stability.
- Elastic scaling: Có khả năng compute, storage smooth online scaling, có thể đáp ứng nhu cầu đa dạng của business.
- Open ecosystem: Thông qua multi-level (kernel, function, ecosystem) pluggable capability, cung cấp cho user hệ thống độc đáo có thể customize để đáp ứng nhu cầu đặc biệt của mình.

Ngoài ra, ecosystem của ShardingSphere hoàn thiện, cộng đồng active, tài liệu đầy đủ, update và release tương đối thường xuyên.

Tuy nhiên, cần nói thêm một điều: **Hiện nay nhiều công ty dùng distributed relational database kiểu TiDB, không cần chúng ta manually sharding (database layer đã làm cho chúng ta), cũng không cần giải quyết các vấn đề do manual sharding gây ra, một bước đến vị trí, tích hợp nhiều tính năng thực dụng (như transparent scale-in/out, cold/hot storage separation)! Nếu điều kiện công ty cho phép, cá nhân cũng khuyến nghị phương án này!**

### Sau khi database/table sharding, làm thế nào để migrate dữ liệu?

Sau khi database/table sharding, làm thế nào để migrate dữ liệu từ old database (single database single table) sang new database (database system sau khi sharding)?

Phương án đơn giản và cũng rất phổ biến là **downtime migration** — viết script để ghi dữ liệu từ old database vào new database. Ví dụ vào lúc 2 giờ sáng khi rất ít người dùng hệ thống, đăng một thông báo nói hệ thống cần maintenance upgrade dự kiến 1 tiếng. Sau đó, viết script để sync toàn bộ dữ liệu từ old database vào new database.

Nếu không muốn downtime migration data, cũng có thể cân nhắc **double-write scheme**. Double-write scheme nhắm đến tình huống không thể downtime migration, triển khai phức tạp hơn một chút. Nguyên lý cụ thể như sau:

- Update operation trên old database (insert/delete/update), đồng thời cũng ghi vào new database (double write). Nếu data trong new database không tồn tại, thực thi insert; nếu đã tồn tại, thực thi update. Như vậy đảm bảo new database capture được các thay đổi mới nhất.
- Trong quá trình migration, double write chỉ đồng bộ data trong old database đã được update operation sang new database. Chúng ta còn cần tự viết script để so sánh data trong old database và new database. Nếu new database không có, insert data vào new database. Nếu new database có, old database không có, xóa data tương ứng trong new database (redundant data cleanup).
- Lặp lại operation ở bước trên cho đến khi data trong old database và new database nhất quán.

> **⚠️ Chú ý**:
>
> - Double write nên đảm bảo atomicity tối đa: Có thể write old database thành công rồi mới async write new database, nếu new database write fail thì log lại chờ retry;
> - Data comparison nên thực hiện trong business off-peak period, tránh data inconsistency do new write trong quá trình comparison;
> - Khuyến nghị dùng tool như Canal để monitor binlog để triển khai incremental sync, giảm chi phí phát triển và bảo trì của double write.
>
> **Làm thế nào để giải quyết double write concurrency problem?** Trong giai đoạn migration dữ liệu cũ và double write incremental song song, rất dễ xảy ra concurrent problem của old data overwriting new data. Phải giới thiệu field `update_time` hoặc `version` trong new database table. Dù là double write hay script fill-in, trước khi ghi vào new database phải kèm condition `WHERE new_version < old_version` (optimistic lock check), đảm bảo chỉ có data mới hơn mới có thể ghi vào.

Muốn triển khai double write trong project vẫn khá phức tạp, dễ xảy ra vấn đề. Chúng ta có thể dùng database sync tool Canal đã đề cập ở trên để làm incremental data migration (vẫn phụ thuộc binlog, chi phí phát triển và bảo trì thấp hơn).

## Tổng kết

- Read-write separation chủ yếu là để phân tán các thao tác đọc/ghi trên database ra các database node khác nhau. Như vậy, có thể cải thiện một chút write performance và cải thiện đáng kể read performance.
- Read-write separation dựa trên master-slave replication, MySQL master-slave replication phụ thuộc vào binlog.
- **Database split** là phân tán dữ liệu trong database ra các database khác nhau. **Table split** là split data của single table, có thể là vertical split hoặc horizontal split.
- Sau khi giới thiệu database/table sharding, hệ thống cần giải quyết vấn đề transaction, distributed ID, không thể dùng JOIN.
- Hiện nay nhiều công ty dùng distributed relational database kiểu TiDB, không cần manually sharding (database layer đã làm), cũng không cần giải quyết các vấn đề do manual sharding gây ra, một bước đến vị trí, tích hợp nhiều tính năng thực dụng! Nếu điều kiện công ty cho phép, cá nhân cũng khuyến nghị phương án này!
- Nếu bắt buộc phải manual sharding, ShardingSphere là lựa chọn đầu tiên! Chức năng của ShardingSphere đầy đủ, ngoài hỗ trợ read-write separation và sharding, còn cung cấp distributed transaction, database governance và các chức năng khác. Ngoài ra, ecosystem của ShardingSphere hoàn thiện, cộng đồng active, tài liệu đầy đủ, update và release thường xuyên.

<!-- @include: @article-footer.snippet.md -->
