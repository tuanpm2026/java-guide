---
title: Giải thích chi tiết MySQL Query Cache
description: Phân tích sâu nguyên lý hoạt động, quản lý cấu hình và ưu nhược điểm của MySQL Query Cache. Phân tích tại sao MySQL 8.0 loại bỏ chức năng Query Cache, cùng các khuyến nghị best practice trong môi trường production.
category: Cơ sở dữ liệu
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MySQL query cache,Query Cache,cơ chế cache MySQL,cache invalidation,MySQL 8.0,tối ưu hiệu năng query,MySQL memory management
---

Cache là một biện pháp tối ưu hiệu năng hệ thống hiệu quả và thực dụng — dù là OS, các phần mềm ứng dụng hay web service đều áp dụng rộng rãi cơ chế cache.

Tuy nhiên, các DBA có kinh nghiệm đều khuyến nghị tắt Query Cache của MySQL trong môi trường production. Thêm nữa, từ MySQL 5.7.20, Query Cache đã bị mặc định deprecated. Và từ MySQL 8.0 trở đi, chức năng Query Cache đã bị xóa hoàn toàn.

Tại sao vậy? Query Cache thực sự vô dụng đến vậy sao?

Với các câu hỏi sau, chúng ta bắt đầu bài này:

- MySQL Query Cache là gì? Phạm vi áp dụng?
- Quy tắc cache của MySQL là gì?
- Ưu và nhược điểm của MySQL Cache là gì?
- MySQL Cache ảnh hưởng thế nào đến hiệu năng?

## Giới thiệu MySQL Query Cache

Kiến trúc MySQL như hình dưới:

![](/images/github/javaguide/mysql/mysql-architecture.png)

Để cải thiện tốc độ response của các câu query hoàn toàn giống nhau, MySQL Server tính Hash của câu query để lấy Hash value. MySQL Server không xử lý SQL theo bất kỳ cách nào — SQL phải hoàn toàn giống nhau mới cho cùng Hash value. Sau khi có Hash value, dùng Hash value đó để tìm kết quả query trong query cache.

- Nếu match (cache hit), trả trực tiếp result set cho client mà không cần parse hay execute query lại.
- Nếu không match (cache miss), lưu Hash value và result set vào query cache để dùng sau.

Tức là, **sau khi câu query (select) đến MySQL Server, sẽ kiểm tra query cache trước. Nếu đã thực thi trước đó thì trả thẳng result set cho client.**

![](/images/javaguide/13526879-3037b144ed09eb88.png)

## Quản lý và Cấu hình MySQL Query Cache

Dùng lệnh `show variables like '%query_cache%'` để xem thông tin liên quan đến query cache.

Trước phiên bản 8.0, thông tin in ra có thể như sau:

```bash
mysql> show variables like '%query_cache%';
+------------------------------+---------+
| Variable_name                | Value   |
+------------------------------+---------+
| have_query_cache             | YES     |
| query_cache_limit            | 1048576 |
| query_cache_min_res_unit     | 4096    |
| query_cache_size             | 599040  |
| query_cache_type             | ON      |
| query_cache_wlock_invalidate | OFF     |
+------------------------------+---------+
6 rows in set (0.02 sec)
```

Từ phiên bản 8.0 trở đi, thông tin in ra như sau:

```bash
mysql> show variables like '%query_cache%';
+------------------+-------+
| Variable_name    | Value |
+------------------+-------+
| have_query_cache | NO    |
+------------------+-------+
1 row in set (0.01 sec)
```

Dưới đây giải thích thông tin do `show variables like '%query_cache%';` in ra trước phiên bản 8.0.

- **`have_query_cache`**: MySQL Server này có hỗ trợ query cache không. YES = hỗ trợ, ngược lại không hỗ trợ.
- **`query_cache_limit`**: Kết quả query tối đa của MySQL Query Cache. Kết quả query lớn hơn giá trị này sẽ không được cache.
- **`query_cache_min_res_unit`**: Kích thước block nhỏ nhất được cấp phát bởi query cache (byte). Khi query thực hiện, MySQL lưu kết quả vào query cache. Nếu kết quả lớn hơn `query_cache_min_res_unit`, MySQL sẽ lưu dữ liệu đồng thời với việc retrieve kết quả, tức trong một query MySQL có thể thực hiện nhiều lần cấp phát memory. Điều chỉnh `query_cache_min_res_unit` hợp lý có thể tối ưu memory.
- **`query_cache_size`**: Lượng memory được cấp phát để cache kết quả query, đơn vị byte, và phải là bội số nguyên của 1024. Tài liệu chính thức MySQL 5.7 cho biết giá trị mặc định là `1048576` (1 MB), đặt thành 0 để disable query cache. Giá trị mặc định có thể khác giữa các minor version, khuyến nghị chỉ định tường minh trong config file, không phụ thuộc vào default.
- **`query_cache_type`**: Đặt loại query cache, mặc định ON. Đặt giá trị GLOBAL ảnh hưởng đến tất cả client kết nối sau. Client có thể đặt giá trị SESSION để ảnh hưởng đến query cache của chính họ.
- **`query_cache_wlock_invalidate`**: Nếu một bảng bị lock, có trả về dữ liệu từ cache không. Mặc định tắt, production thường khuyến nghị giữ cấu hình mặc định này.

Các giá trị có thể của `query_cache_type` (`query_cache_type` là dynamic variable trong MySQL 5.6/5.7, **nhưng có điều kiện tiên quyết**: nếu khi instance khởi động `query_cache_type=0`, server sẽ bỏ qua việc cấp phát mutex lock của query cache, lúc này dùng `SET GLOBAL` để sửa dynamic sẽ báo lỗi — phải sửa config file và restart; nếu khởi động với giá trị khác 0, có thể dùng `SET GLOBAL query_cache_type=N` để có hiệu lực online mà không cần restart):

- 0 hoặc OFF: Tắt chức năng query cache.
- 1 hoặc ON: Bật chức năng query cache, nhưng không cache query bắt đầu bằng `Select SQL_NO_CACHE`.
- 2 hoặc DEMAND: Bật chức năng query cache, nhưng chỉ cache query bắt đầu bằng `Select SQL_CACHE`.

**Khuyến nghị**:

- Không nên đặt `query_cache_size` quá lớn. Không gian quá lớn không chỉ chiếm dụng không gian của các cấu trúc memory khác của instance mà còn tăng chi phí tìm kiếm trong cache. Khuyến nghị giá trị ban đầu từ 10MB đến 100MB tùy theo instance spec, sau đó điều chỉnh dựa trên tình hình sử dụng thực tế.
- Khuyến nghị disable query cache bằng cách đặt `query_cache_size` = 0 thay vì chỉ dựa vào `query_cache_type`. Cả hai đều là dynamic variable, nhưng `query_cache_size=0` sẽ hoàn toàn bỏ qua path cấp phát và kiểm tra memory cache — disable triệt để hơn.

Trước phiên bản 8.0, thêm vào `my.cnf` và restart MySQL để bật query cache:

```properties
query_cache_type=1
query_cache_size=614400
```

Hoặc, khi instance khởi động với `query_cache_type` khác 0, cũng có thể bật query cache online bằng lệnh sau (nếu giá trị khởi động là 0 thì lệnh này sẽ báo lỗi, cần sửa config file và restart):

```sql
set global query_cache_type=1;
set global query_cache_size=614400;
```

Để dọn dẹp cache thủ công, dùng 3 SQL sau:

- `flush query cache;`: Dọn memory fragmentation trong query cache.
- `reset query cache;`: Xóa tất cả query khỏi query cache.
- `flush tables;`: Đóng tất cả bảng đang mở, đồng thời xóa nội dung trong query cache.

## Cơ chế Cache của MySQL

### Quy tắc Cache

- Query cache lưu câu query và result set vào memory (thường dưới dạng key-value, trong đó Key là Hash value được tính từ text câu query, database hiện tại, charset client và version protocol, Value là result set của query). Lần sau query lại thì lấy trực tiếp từ memory.
- Kết quả cache được chia sẻ qua các session, nên kết quả cache của một client, client khác cũng có thể dùng.
- SQL phải hoàn toàn giống nhau mới cache hit (chữ hoa/thường, khoảng trắng, database đang dùng, version protocol, charset, v.v. đều phải giống nhau). Khi kiểm tra query cache, MySQL Server không xử lý SQL theo bất kỳ cách nào — nó dùng chính xác query do client gửi.
- Không cache result set của subquery trong query, chỉ cache result set cuối cùng của query.
- Các function không xác định sẽ không bao giờ được cache, ví dụ `now()`, `curdate()`, `last_insert_id()`, `rand()`, v.v.
- Không cache query tạo ra warning.
- Result set vượt quá `query_cache_limit` (mặc định 1 MB) sẽ không được cache.
- Nếu query chứa bất kỳ user-defined function, stored function, user variable, temporary table, system table trong thư viện MySQL nào, kết quả query cũng sẽ không được cache.
- Sau khi cache được thiết lập, MySQL query cache system theo dõi mọi bảng liên quan trong query. Nếu các bảng này (data hoặc structure) thay đổi, tất cả cached data liên quan đến bảng đó sẽ bị invalidate.
- MySQL Cache gần như không hoạt động trong môi trường sharding. Lý do: query thường được route qua middleware (như ShardingSphere, MyCat) đến các MySQL instance khác nhau, mỗi instance duy trì Query Cache độc lập; middleware khi route thường rewrite SQL (thêm shard key condition, v.v.) khiến câu đã rewrite có Hash value khác câu gốc, cache không thể hit.
- Không cache query dùng `SQL_NO_CACHE`.
- ……

Ví dụ SELECT option của query cache:

```sql
SELECT SQL_CACHE id, name FROM customer;# Sẽ cache
SELECT SQL_NO_CACHE id, name FROM customer;# Sẽ không cache
```

### Quản lý Memory trong Cơ chế Cache

Query cache hoàn toàn lưu trong memory, nên trước khi cấu hình và sử dụng, cần hiểu cách nó dùng memory.

MySQL Query Cache dùng kỹ thuật memory pool, tự quản lý release và cấp phát memory thay vì qua OS. Đơn vị cơ bản của memory pool là block có độ dài thay đổi, dùng để lưu thông tin về type, size, data, v.v. Cache của một result set kết nối các block này bằng linked list. Độ dài block tối thiểu là `query_cache_min_res_unit`.

Khi server khởi động, khởi tạo memory cần cho cache — là một block rảnh hoàn chỉnh. Khi query bắt đầu trả kết quả, vì lúc này không biết result set đầy đủ lớn bao nhiêu, MySQL sẽ xin một data block cơ bản với kích thước `query_cache_min_res_unit` từ memory pool. Nếu result set vượt quá capacity của block, MySQL sẽ tiếp tục xin thêm data block mới trong quá trình tạo kết quả và kết nối chúng qua linked list.

Việc cấp phát memory block cần lock space block trước nên operation khá chậm. MySQL sẽ cố tránh operation này, chọn memory block nhỏ nhất có thể; nếu không đủ thì tiếp tục xin thêm; sau khi lưu xong nếu còn thừa thì release phần thừa.

Khi concurrent read/write tiến hành, các cache block có kích thước khác nhau bị release ngẫu nhiên và không có thứ tự. Thêm vào đó, không gian nhỏ còn thừa sau khi cấp phát (nhỏ hơn `query_cache_min_res_unit`) không thể tái sử dụng, khiến memory pool nhanh chóng sinh ra nhiều free memory block không liên tục (tương tự external fragmentation ở tầng OS), dẫn đến memory defragmentation xảy ra thường xuyên hơn.

## Ưu và Nhược điểm của MySQL Query Cache

**Ưu điểm:**

- Query cache check xảy ra sau khi MySQL nhận query request từ client, sau khi query permission verification, và trước khi parse query SQL. Tức là sau khi MySQL nhận query SQL từ client, chỉ cần thực hiện permission verification tương ứng là có thể tìm kết quả qua query cache — thậm chí không cần Optimizer module phân tích execution plan, càng không cần tương tác với storage engine nào.
- Vì query cache dựa trên memory, trả kết quả query từ memory trực tiếp, giảm đáng kể disk I/O và CPU computation. **Nhưng ưu điểm này chỉ áp dụng trong tình huống static ít concurrency, đọc nhiều ghi ít**; trong môi trường multi-core high concurrency, cạnh tranh kịch liệt về global mutex lock `LOCK_query_cache` sẽ khiến nhiều thread ở trạng thái chờ lock (`Waiting for query cache lock` có thể thấy qua `SHOW PROCESSLIST`), TPS/QPS thực tế thậm chí giảm mạnh.

**Nhược điểm:**

- MySQL thực hiện Hash calculation cho mỗi câu SELECT nhận được, sau đó tìm xem kết quả cache của query này có tồn tại không. Mặc dù chi phí CPU cho Hash calculation và tìm kiếm bản thân là không đáng kể, nhưng Query Cache phụ thuộc vào single global mutex lock (`LOCK_query_cache`) để đảm bảo concurrent safety. Khi high concurrency, hàng nghìn câu query đồng thời tranh giành mutex lock để kiểm tra hay ghi cache — lock contention kịch liệt và chi phí thread context switching sẽ trở thành performance bottleneck chí mạng.
- Vấn đề cache invalidation. Nếu bảng thay đổi thường xuyên, sẽ khiến invalidation rate của query cache rất cao. Thay đổi bảng không chỉ là data thay đổi mà còn bao gồm bất kỳ thay đổi nào về cấu trúc bảng hay index.
- Các câu query khác nhau nhưng có cùng kết quả đều được cache riêng biệt, gây lãng phí memory resource. Chữ hoa/thường, khoảng trắng hay comment khác nhau trong câu query, query cache đều coi là query khác nhau (vì Hash value sẽ khác nhau).
- Cấu hình system variable không hợp lý có thể gây nhiều memory fragmentation, dẫn đến query cache thường xuyên phải dọn dẹp memory.

## Ảnh hưởng của MySQL Query Cache đến Hiệu năng

Bật query cache trong MySQL Server gây overhead thêm cho cả đọc và ghi:

- **Read operation cần lock để check**: Trước khi read query bắt đầu phải kiểm tra cache hit, cần lấy shared lock `LOCK_query_cache`. Khi high concurrency, nhiều read request đồng thời tranh lock sẽ xếp hàng chờ.
- **Cache write overhead**: Nếu read query có thể cache, sau khi thực thi cần ghi kết quả vào cache, bao gồm cấp phát memory và kết nối linked list — cũng cần giữ lock.
- **Write operation trigger global invalidation**: Khi ghi dữ liệu vào bảng, phải invalidate tất cả cache của bảng đó. Cần lấy exclusive lock để scan toàn bộ cache area — `query_cache_size` càng lớn, thời gian giữ lock càng dài. Thiết kế single global mutex lock của Query Cache khiến write operation block tất cả request đọc/ghi khác — đây là lý do chính MySQL 8.0 loại bỏ nó.
- **InnoDB long transaction làm trầm trọng vấn đề**: Với MVCC, cache liên quan không thể dùng trước khi transaction commit. Long transaction không chỉ giảm cache hit rate, mà exclusive lock do write operation trigger còn block việc đọc cache của **các bảng không liên quan khác**.

Có thể dùng lệnh sau để xem tình trạng sử dụng query cache, đánh giá có nên bật không:

```sql
SHOW STATUS LIKE 'Qcache%';
```

Giải thích các metric quan trọng:

| Status variable        | Ý nghĩa                                                                                                      |
| :--------------------- | :----------------------------------------------------------------------------------------------------------- |
| `Qcache_hits`          | Số lần cache hit                                                                                             |
| `Qcache_inserts`       | Số query được ghi vào cache                                                                                  |
| `Qcache_not_cached`    | Số query không được cache (không thể cache hoặc không hit)                                                   |
| `Qcache_lowmem_prunes` | Số cache entry bị loại do không đủ memory; tăng liên tục = cache space thiếu hoặc fragmentation nghiêm trọng |
| `Qcache_free_memory`   | Memory rảnh còn lại trong cache (byte)                                                                       |

Công thức tính hit rate tham khảo:

```
Hit rate = Qcache_hits / (Qcache_hits + Qcache_inserts + Qcache_not_cached)
```

Nếu hit rate lâu dài dưới 50%, workload không phù hợp với Query Cache — khuyến nghị tắt. Ngoài ra, cần theo dõi tỷ lệ `Qcache_lowmem_prunes` / `Qcache_inserts`: nếu tỷ lệ cực cao, nghĩa là data vừa ghi vào cache đã sớm bị loại do memory fragmentation hoặc không đủ dung lượng — lúc này bật cache là thiệt thòi thuần túy. Khi `Qcache_lowmem_prunes` tăng liên tục, có thể chạy `FLUSH QUERY CACHE` để defragment memory, hoặc giảm giá trị `query_cache_min_res_unit`.

## Tổng kết

MySQL Query Cache tuy có thể cải thiện hiệu năng query database, nhưng cơ chế Query Cache bản thân cũng đưa vào overhead quản lý thêm — sau mỗi query phải thực hiện cache operation, sau khi invalidate còn phải destroy.

Query Cache là cơ chế cache phù hợp với ít tình huống. Nếu ứng dụng của bạn ít cập nhật database thì Query Cache sẽ phát huy tác dụng đáng kể. Điển hình như blog system — blog thường cập nhật chậm, bảng dữ liệu tương đối ổn định, khi đó Query Cache sẽ rõ ràng hơn.

Tóm tắt đơn giản tình huống phù hợp với Query Cache:

- Data bảng ít thay đổi, data tương đối tĩnh.
- Query (Select) có tần suất lặp lại cao.
- Result set query nhỏ hơn 1 MB.

Với hệ thống thường xuyên cập nhật, tác dụng của Query Cache rất nhỏ. Trong một số trường hợp bật Query Cache sẽ giảm hiệu năng.

Tóm tắt đơn giản tình huống không phù hợp với Query Cache:

- Data bảng, cấu trúc bảng hoặc index thay đổi thường xuyên
- Query ít được lặp lại
- Result set query rất lớn

《High Performance MySQL》viết:

> Dựa trên kinh nghiệm của chúng tôi, query cache có thể dẫn đến hiệu năng hệ thống giảm, thậm chí deadlock trong môi trường high concurrency pressure. Nếu nhất định phải dùng query cache, đừng đặt memory quá lớn, và chỉ dùng khi chắc chắn có lợi ích (số lần modify database content ít).

**Quả thực vậy! Trong dự án thực tế, khuyến nghị hơn là dùng local cache (như Caffeine) hoặc distributed cache (như Redis) — hiệu năng tốt hơn và tổng quát hơn.**

## Tài liệu tham khảo

- 《High Performance MySQL》
- MySQL cơ chế cache: <https://zhuanlan.zhihu.com/p/55947158>
- Cài đặt và sử dụng RDS MySQL Query Cache - Alibaba Cloud Database RDS Documentation: <https://help.aliyun.com/document_detail/41717.html>
- 8.10.3 The MySQL Query Cache - MySQL official docs: <https://dev.mysql.com/doc/refman/5.7/en/query-cache.html>

<!-- @include: @article-footer.snippet.md -->
