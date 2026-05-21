---
title: Giải thích chi tiết ba loại log MySQL (binlog, redo log và undo log)
description: Phân tích sâu vai trò và nguyên lý của ba loại log MySQL là binlog, redo log và undo log, giải thích cơ chế two-phase commit đảm bảo data consistency, cùng ứng dụng của log trong crash recovery và master-slave replication.
category: Cơ sở dữ liệu
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MySQL log,binlog,redo log,undo log,two-phase commit,crash recovery,master-slave replication,WAL,transaction log
---

> Bài này do công chúng số "Programmer Axing" đóng góp, JavaGuide đã bổ sung và hoàn thiện.

## Lời mở đầu

MySQL log chủ yếu bao gồm error log, query log, slow query log, transaction log, binary log, v.v. Trong đó quan trọng nhất là binary log binlog (archive log) và transaction log redo log (redo log) và undo log (rollback log).

![](/images/github/javaguide/01.png)

Hôm nay nói về redo log (redo log), binlog (archive log), two-phase commit, undo log (rollback log).

## redo log

redo log (redo log) là độc quyền của InnoDB storage engine, mang lại cho MySQL khả năng crash recovery.

Ví dụ MySQL instance crash hoặc server down, khi restart, InnoDB storage engine sẽ dùng redo log để phục hồi data, đảm bảo tính bền vững và toàn vẹn của data.

![](/images/github/javaguide/02.png)

Data trong MySQL theo đơn vị page. Khi query một record, sẽ load một page data từ disk, data được load ra gọi là data page, được đặt vào `Buffer Pool`.

Các query tiếp theo đều tra trong `Buffer Pool` trước, không hit mới load từ disk, giảm disk IO overhead, tăng hiệu năng.

Khi update data trong bảng cũng vậy: nếu thấy data cần update tồn tại trong `Buffer Pool` thì update trực tiếp trong `Buffer Pool`.

Sau đó ghi "đã làm gì trên data page nào" vào redo log buffer, rồi flush to disk vào file redo log.

![](/images/github/javaguide/03.png)

> Ghi chú hình ảnh: Bước 4 "清空 redo log buffe 刷盘到 redo 日志中" — "buffe" phải là "buffer".

Lý tưởng là transaction commit xong thì flush ngay, nhưng thực tế thời điểm flush được quyết định theo strategy.

> Mỗi redo record gồm: tablespace number + data page number + offset + modified data length + specific modified data.

### Thời điểm flush disk

Trong InnoDB storage engine, **redo log buffer** là vùng memory tạm để lưu redo log. Để đảm bảo durability của transaction và data consistency, InnoDB flush data log từ buffer này vào file redo log trên disk vào các thời điểm cụ thể. Có thể tóm gọn thành 6 thời điểm:

1. **Khi transaction commit (quan trọng nhất)**: Khi transaction commit, redo log trong log buffer sẽ được flush to disk (có thể kiểm soát qua tham số `innodb_flush_log_at_trx_commit`, sẽ đề cập sau).
2. **Khi redo log buffer sắp hết dung lượng**: Đây là chiến lược proactive capacity management của InnoDB, nhằm tránh user thread bị block do buffer đầy.
   - Khi không gian đã dùng của redo log buffer vượt quá **nửa (50%)** tổng dung lượng, background thread sẽ **chủ động** flush phần log này to disk để nhường chỗ cho log write tiếp theo — đây là tối ưu "phòng xa".
   - Nếu buffer bị **lấp đầy hoàn toàn** do transaction lớn hoặc I/O bận rộn, tất cả user thread cố ghi log mới đều bị **block** và phải thực hiện một lần sync flush, cho đến khi có space khả dụng. Tình huống này ảnh hưởng đến hiệu năng database — cần tránh.
3. **Khi Checkpoint được kích hoạt**: Checkpoint là cơ chế cốt lõi InnoDB thiết kế để rút ngắn thời gian crash recovery. Khi Checkpoint được trigger, InnoDB cần flush tất cả dirty page trước checkpoint đó vào disk. Theo nguyên tắc **Write-Ahead Logging (WAL)**, trước khi data page được ghi vào disk, redo log tương ứng của nó phải đã được lưu xuống disk trước. Do đó thực hiện Checkpoint operation nhất định sẽ đảm bảo redo log liên quan đã được flush to disk.
4. **Background thread định kỳ flush**: InnoDB có một background master thread, khoảng mỗi giây thực hiện một lần routine task, trong đó có flush redo log từ redo log buffer to disk. Cơ chế này là đảm bảo persistence chính khi `innodb_flush_log_at_trx_commit` được đặt là 0 hoặc 2.
5. **Tắt server bình thường**: Trong quá trình MySQL server tắt bình thường, để đảm bảo data của tất cả committed transaction được lưu đầy đủ, InnoDB thực hiện một lần flush cuối cùng — clear toàn bộ log còn lại trong redo log buffer và ghi vào disk file.
6. **Khi binlog được switch**: Khi bật binlog, trong cấu hình "double one" của MySQL với `innodb_flush_log_at_trx_commit=1` và `sync_binlog=1`, để đảm bảo tính nhất quán trạng thái giữa redo log và binlog (dùng cho crash recovery hoặc master-slave replication), khi file binlog đầy hoặc thực thi thủ công `flush logs` để switch, sẽ trigger hành động flush redo log.

Tóm lại, InnoDB flush redo log trong nhiều tình huống để đảm bảo durability và consistency của data.

Cần chú ý đặt đúng flush strategy `innodb_flush_log_at_trx_commit`. Tùy theo flush strategy cấu hình của MySQL mà sau khi MySQL crash có thể xảy ra mất một chút data.

`innodb_flush_log_at_trx_commit` có 3 giá trị — tức 3 loại flush strategy:

- **0**: Đặt là 0 — mỗi lần transaction commit không thực hiện flush. Cách này hiệu năng cao nhất nhưng cũng kém an toàn nhất — nếu MySQL crash hoặc down, có thể mất transaction trong 1 giây gần nhất.
- **1**: Đặt là 1 — mỗi lần transaction commit đều flush. Cách này hiệu năng thấp nhất nhưng an toàn nhất — chỉ cần transaction commit thành công, redo log record nhất định đã trên disk, không mất data gì.
- **2**: Đặt là 2 — mỗi lần transaction commit chỉ ghi nội dung redo log từ log buffer vào page cache (file system cache). Page cache chuyên dùng để cache file, file được cache ở đây là redo log file. Cách này hiệu năng và an toàn đều nằm giữa hai cách trên.

Giá trị mặc định của `innodb_flush_log_at_trx_commit` là 1 — chỉ khi đặt là 1 mới không mất data gì. Để đảm bảo durability của transaction phải đặt là 1.

Ngoài ra, InnoDB storage engine có một background thread, cứ mỗi `1` giây sẽ ghi nội dung trong `redo log buffer` ra file system cache (`page cache`), rồi gọi `fsync` để flush disk.

![](/images/github/javaguide/04.png)

Tức là, một redo log record chưa commit transaction cũng có thể được flush to disk.

**Tại sao vậy?**

Vì trong quá trình thực thi transaction, redo log record được ghi vào `redo log buffer` và những redo log record này sẽ được background thread flush to disk.

![](/images/github/javaguide/05.png)

Ngoài background thread poll 1 lần mỗi `1` giây, còn có một tình huống: khi không gian `redo log buffer` chiếm gần đến một nửa `innodb_log_buffer_size`, background thread sẽ chủ động flush disk.

Dưới đây là flow chart của các flush strategy khác nhau.

#### innodb_flush_log_at_trx_commit=0

![](/images/github/javaguide/06.png)

Khi là `0`, nếu MySQL crash hoặc down có thể mất data trong `1` giây.

#### innodb_flush_log_at_trx_commit=1

![](/images/github/javaguide/07.png)

Khi là `1`, chỉ cần transaction commit thành công, redo log record nhất định đã trên disk, không mất data gì.

Nếu MySQL crash hoặc down trong quá trình thực thi transaction, phần log này bị mất, nhưng transaction chưa commit nên mất log cũng không thiệt hại gì.

#### innodb_flush_log_at_trx_commit=2

![](/images/github/javaguide/09.png)

Khi là `2`, chỉ cần transaction commit thành công, nội dung trong `redo log buffer` chỉ được ghi vào file system cache (`page cache`).

Nếu chỉ MySQL crash thì không mất data gì, nhưng nếu server down thì có thể mất data trong `1` giây.

### Log file group

Redo log file trên disk không phải chỉ một file mà xuất hiện dưới dạng **log file group** — mỗi redo log file có kích thước bằng nhau.

Ví dụ có thể cấu hình thành một nhóm `4` file, mỗi file `1GB` — toàn bộ redo log file group có thể ghi `4GB` nội dung.

Dùng dạng circular array, ghi từ đầu, ghi đến cuối thì quay lại đầu ghi tiếp như hình dưới.

![](/images/github/javaguide/10.png)

Trong **log file group** này còn có hai thuộc tính quan trọng: `write pos` và `checkpoint`.

- **write pos** là vị trí đang ghi hiện tại, vừa ghi vừa tiến về phía sau.
- **checkpoint** là vị trí cần xóa hiện tại, cũng tiến về phía sau.

Mỗi lần flush redo log record vào **log file group**, vị trí `write pos` sẽ dịch chuyển về phía sau.

Mỗi lần MySQL load **log file group** để phục hồi data, sẽ clear redo log record đã load và dịch `checkpoint` về phía sau.

Phần trống giữa `write pos` và `checkpoint` có thể dùng để ghi redo log record mới.

![](/images/github/javaguide/11.png)

Nếu `write pos` đuổi kịp `checkpoint`, nghĩa là **log file group** đầy — lúc này không thể ghi redo log record mới. MySQL phải dừng lại, clear một số record, đẩy `checkpoint` tiến lên.

![](/images/github/javaguide/12.png)

Lưu ý từ MySQL 8.0.30, log file group có một số thay đổi:

> The innodb_redo_log_capacity variable supersedes the innodb_log_files_in_group and innodb_log_file_size variables, which are deprecated. When the innodb_redo_log_capacity setting is defined, the innodb_log_files_in_group and innodb_log_file_size settings are ignored; otherwise, these settings are used to compute the innodb_redo_log_capacity setting (innodb_log_files_in_group \* innodb_log_file_size = innodb_redo_log_capacity). If none of those variables are set, redo log capacity is set to the innodb_redo_log_capacity default value, which is 104857600 bytes (100MB). The maximum redo log capacity is 128GB.

> Redo log files reside in the #innodb_redo directory in the data directory unless a different directory was specified by the innodb_log_group_home_dir variable. If innodb_log_group_home_dir was defined, the redo log files reside in the #innodb_redo directory in that directory. There are two types of redo log files, ordinary and spare. Ordinary redo log files are those being used. Spare redo log files are those waiting to be used. InnoDB tries to maintain 32 redo log files in total, with each file equal in size to 1/32 \* innodb_redo_log_capacity; however, file sizes may differ for a time after modifying the innodb_redo_log_capacity setting.

Ý nghĩa: Trước MySQL 8.0.30 có thể cấu hình số file và kích thước file của log file group qua `innodb_log_files_in_group` và `innodb_log_file_size`. Nhưng từ MySQL 8.0.30 trở đi, hai biến này đã bị deprecated — dù được chỉ định cũng chỉ để tính giá trị `innodb_redo_log_capacity`. Số file của log file group cố định là 32, kích thước file là `innodb_redo_log_capacity / 32`.

Về điểm thay đổi này, có thể verify như sau:

Trước tiên tạo config file, cấu hình giá trị `innodb_log_files_in_group` và `innodb_log_file_size`:

```properties
[mysqld]
innodb_log_file_size = 10485760
innodb_log_files_in_group = 64
```

Dùng docker khởi động container MySQL 8.0.32:

```bash
docker run -d -p 3312:3309 -e MYSQL_ROOT_PASSWORD=your-password -v /path/to/your/conf:/etc/mysql/conf.d --name
MySQL830 mysql:8.0.32
```

Xem startup log:

```plain
2023-08-03T02:05:11.720357Z 0 [Warning] [MY-013907] [InnoDB] Deprecated configuration parameters innodb_log_file_size and/or innodb_log_files_in_group have been used to compute innodb_redo_log_capacity=671088640. Please use innodb_redo_log_capacity instead.
```

Điều này cũng cho thấy `innodb_log_files_in_group` và `innodb_log_file_size` chỉ để tính `innodb_redo_log_capacity` và đã bị deprecated.

Xem thêm số file của log file group là bao nhiêu:

![](./images/redo-log.png)

Đúng là 32, và kích thước mỗi log file là `671088640 / 32 = 20971520`.

Do đó khi dùng MySQL 8.0.30 trở lên, khuyến nghị dùng biến `innodb_redo_log_capacity` để cấu hình log file group.

### Tổng kết redo log

Chắc mọi người đã hiểu vai trò của redo log và thời điểm flush, hình thức lưu trữ.

Giờ suy nghĩ một câu hỏi: **Tại sao không trực tiếp flush data page đã modify lên disk mỗi lần là xong, cần gì đến redo log?**

Chẳng phải cả hai đều là flush disk? Khác nhau chỗ nào?

```java
1 Byte = 8bit
1 KB = 1024 Byte
1 MB = 1024 KB
1 GB = 1024 MB
1 TB = 1024 GB
```

Thực tế, kích thước data page là `16KB`. Flush disk tốn thời gian — có thể chỉ modify vài `Byte` trong data page, có cần thiết flush toàn bộ data page không?

Hơn nữa, flush data page là random write vì data page có thể nằm ở vị trí ngẫu nhiên trong disk file — hiệu năng rất kém.

Nếu ghi redo log, một record chỉ chiếm vài chục `Byte`, chỉ chứa tablespace number, data page number, disk file offset, update value. Lại là sequential write nên flush rất nhanh.

Vì vậy ghi redo log để lưu modify content — hiệu năng vượt xa so với flush data page trực tiếp, và cũng giúp database có concurrency ability tốt hơn.

> Thực ra data page trong memory cũng sẽ flush disk vào một thời điểm nhất định — gọi là page merge, sẽ giải thích chi tiết khi nói về `Buffer Pool`.

## binlog

redo log là physical log, record content là "đã làm gì trên data page nào", thuộc InnoDB storage engine.

Còn binlog là logical log, record content là original logic của câu lệnh, tương tự "cộng 1 vào field c của row ID=2", thuộc `MySQL Server` layer.

Bất kể dùng storage engine nào, chỉ cần có update table data thì đều sinh ra binlog.

Vậy binlog dùng để làm gì?

Có thể nói **data backup, primary-backup, primary-primary, master-slave** của MySQL database đều không thể thiếu binlog — cần dựa vào binlog để sync data, đảm bảo data consistency.

![](/images/github/javaguide/01-20220305234724956.png)

binlog ghi lại tất cả thao tác logic có update data và là sequential write.

### Record format

binlog log có 3 format, có thể chỉ định qua tham số `binlog_format`.

- **statement**
- **row**
- **mixed**

Chỉ định `statement` — content được ghi là SQL statement nguyên văn. Ví dụ thực thi `update T set update_time=now() where id=1`, content được ghi như hình dưới.

![](/images/github/javaguide/02-20220305234738688.png)

Khi sync data sẽ thực thi SQL statement đã ghi. Nhưng có vấn đề: `update_time=now()` sẽ lấy system time hiện tại — thực thi trực tiếp sẽ dẫn đến không nhất quán với data của primary DB.

Để giải quyết vấn đề này, cần chỉ định là `row` — content được ghi không còn là simple SQL statement mà bao gồm cả data cụ thể của thao tác, như hình dưới.

![](/images/github/javaguide/03-20220305234742460.png)

Content được ghi ở format `row` không đọc được trực tiếp, cần dùng công cụ `mysqlbinlog` để parse.

`update_time=now()` trở thành thời gian cụ thể `update_time=1627112756247`. @1, @2, @3 sau condition đều là giá trị gốc của field 1~3 trong row data đó (**giả sử bảng này chỉ có 3 field**).

Như vậy đảm bảo được tính nhất quán của sync data. Thường chỉ định là `row` — mang lại reliability tốt hơn cho data recovery và sync của database.

Nhưng format này cần capacity lớn hơn để ghi, chiếm nhiều không gian hơn, khi recovery và sync tiêu tốn nhiều IO resource hơn, ảnh hưởng đến tốc độ thực thi.

Vì vậy có một phương án trung gian — chỉ định là `mixed` — content được ghi là mix của cả hai.

MySQL sẽ đánh giá xem SQL statement đó có thể gây data inconsistency không. Nếu có thì dùng format `row`, nếu không thì dùng format `statement`.

### Write mechanism

Thời điểm ghi binlog cũng rất đơn giản: trong quá trình thực thi transaction, trước tiên ghi log vào `binlog cache`. Khi transaction commit, ghi `binlog cache` vào binlog file.

Vì binlog của một transaction không thể bị chia nhỏ — dù transaction lớn đến mấy cũng phải đảm bảo ghi một lần — nên hệ thống cấp phát cho mỗi thread một block memory làm `binlog cache`.

Có thể kiểm soát kích thước binlog cache của một thread qua tham số `binlog_cache_size`. Nếu nội dung lưu vượt quá tham số này, phải tạm lưu ra disk (`Swap`).

Flow chart flush disk của binlog như dưới.

![](/images/github/javaguide/04-20220305234747840.png)

- **`write` trong hình trên là ghi log vào page cache của file system, không persist data vào disk nên tốc độ khá nhanh**
- **`fsync` trong hình trên mới là thao tác persist data vào disk**

Thời điểm `write` và `fsync` có thể kiểm soát bởi tham số `sync_binlog`, mặc định là `1`.

Khi là `0` — mỗi lần commit transaction chỉ `write`, do hệ thống tự quyết định khi nào thực thi `fsync`.

![](/images/github/javaguide/05-20220305234754405.png)

Mặc dù hiệu năng được cải thiện, nhưng khi máy down, binlog trong `page cache` sẽ bị mất.

Để an toàn, có thể đặt là `1` — mỗi lần commit transaction đều thực thi `fsync` — giống như **redo log flush disk flow**.

Cuối cùng còn có một cách trung gian: đặt là `N(N>1)` — mỗi lần commit transaction đều `write`, nhưng tích lũy đủ `N` transaction mới `fsync`.

![](/images/github/javaguide/06-20220305234801592.png)

Trong tình huống IO bottleneck, đặt `sync_binlog` thành giá trị khá lớn có thể cải thiện hiệu năng.

Tương tự, nếu máy down, sẽ mất binlog của `N` transaction gần nhất.

## Two-phase Commit (Hai giai đoạn commit)

redo log (redo log) mang lại cho InnoDB storage engine khả năng crash recovery.

binlog (archive log) đảm bảo data consistency cho MySQL cluster architecture.

Mặc dù cả hai đều thuộc đảm bảo persistence, nhưng trọng tâm khác nhau.

Trong quá trình thực thi update statement, sẽ ghi cả hai log redo log và binlog. Lấy transaction cơ bản làm đơn vị: redo log có thể ghi liên tục trong quá trình thực thi transaction, còn binlog chỉ ghi khi commit transaction — nên thời điểm ghi redo log và binlog không giống nhau.

![](/images/github/javaguide/01-20220305234816065.png)

Quay lại chủ đề: nếu logic của hai log redo log và binlog không nhất quán, sẽ xảy ra vấn đề gì?

Lấy câu `update` làm ví dụ: giả sử record `id=2` có field `c` bằng `0`, update field `c` thành `1`. SQL: `update T set c=1 where id=2`.

Giả sử trong quá trình thực thi, sau khi ghi xong redo log thì binlog gặp exception, sẽ xảy ra gì?

![](/images/github/javaguide/02-20220305234828662.png)

Vì binlog chưa ghi xong đã exception, binlog không có modify record tương ứng. Do đó khi dùng binlog để recovery data sau này sẽ thiếu lần update này. Row `c` được phục hồi là `0`, còn primary DB do recovery bằng redo log, row `c` là `1` — data không nhất quán.

![](/images/github/javaguide/03-20220305235104445.png)

Để giải quyết vấn đề logic consistency giữa hai log, InnoDB storage engine dùng phương án **two-phase commit**.

Nguyên lý đơn giản: tách việc ghi redo log thành hai bước `prepare` và `commit` — đây là **two-phase commit**.

![](/images/github/javaguide/04-20220305234956774.png)

Sau khi dùng **two-phase commit**, dù binlog gặp exception khi ghi cũng không có ảnh hưởng. Vì khi MySQL recovery data dựa trên redo log, phát hiện redo log vẫn ở giai đoạn `prepare` và không có binlog log tương ứng thì sẽ rollback transaction đó.

![](/images/github/javaguide/05-20220305234937243.png)

Xem một tình huống nữa: redo log gặp exception ở giai đoạn `commit`, có rollback transaction không?

![](/images/github/javaguide/06-20220305234907651.png)

Sẽ không rollback transaction — nó thực thi logic trong khung hình. Mặc dù redo log ở giai đoạn `prepare`, nhưng có thể tìm được binlog log tương ứng qua transaction `id`, nên MySQL cho rằng là hoàn chỉnh và sẽ commit transaction để recovery data.

## undo log

> Phần nội dung này là bổ sung của JavaGuide:

Mọi modify data của transaction đều được ghi vào undo log. Khi xảy ra lỗi trong quá trình thực thi transaction hoặc cần rollback, MySQL có thể dùng undo log để phục hồi data về trạng thái trước khi transaction bắt đầu.

undo log là logical log, ghi câu SQL statement. Ví dụ transaction thực thi câu DELETE thì undo log sẽ ghi câu INSERT tương ứng. Đồng thời, thông tin undo log cũng được ghi vào redo log vì undo log cũng phải được bảo vệ bởi cơ chế persistence. Và undo log bản thân sẽ bị xóa dọn dẹp: ví dụ thao tác INSERT, sau khi transaction commit thì có thể xóa. Thao tác UPDATE/DELETE sau khi transaction commit không xóa ngay mà đưa vào history list, do background thread purge dọn dẹp.

undo log ghi theo cách segment (đoạn). Mỗi thao tác undo khi ghi chiếm một **undo log segment** (undo log segment). undo log segment nằm trong **rollback segment** (rollback segment). Khi transaction bắt đầu, cần cấp phát một rollback segment cho nó. Mỗi rollback segment có 1024 undo log segment, giúp quản lý rollback nhu cầu của nhiều concurrent transaction.

Thông thường, **rollback segment header** (thường ở first page của rollback segment) chịu trách nhiệm quản lý rollback segment. rollback segment header là một phần của rollback segment, thường ở first page của rollback segment. **history list** là một phần của rollback segment header — chức năng chính là ghi lại undo log của tất cả transaction đã committed nhưng chưa được dọn dẹp (purge). List này giúp purge thread tìm và dọn sạch các undo log record không còn cần thiết.

Ngoài ra, triển khai `MVCC` phụ thuộc vào: **hidden column, Read View, undo log**. Trong triển khai nội bộ, InnoDB dùng `DB_TRX_ID` và `Read View` của data row để đánh giá visibility của data. Nếu không visible, dùng `DB_ROLL_PTR` của data row để tìm historical version trong undo log. Mỗi transaction có thể đọc phiên bản data khác nhau. Trong cùng một transaction, user chỉ thấy các sửa đổi đã commit trước khi transaction tạo `Read View` và các sửa đổi do chính transaction đó thực hiện.

## Tổng kết

> Phần nội dung này là bổ sung của JavaGuide:

MySQL InnoDB engine dùng **redo log** để đảm bảo **durability** của transaction, dùng **undo log** để đảm bảo **atomicity** của transaction.

**Data backup, primary-backup, primary-primary, master-slave** của MySQL database đều không thể thiếu binlog — cần dựa vào binlog để sync data, đảm bảo data consistency.

## Tài liệu tham khảo

- 《MySQL 45 Lectures in Practice》
- 《Becoming a MySQL Performance Optimization Expert from Scratch》
- 《How MySQL Works: Understanding MySQL from Its Roots》
- 《MySQL Technology InnoDB Storage Engine》
