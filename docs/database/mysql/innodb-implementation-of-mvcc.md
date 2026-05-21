---
title: Triển khai MVCC trong InnoDB Storage Engine
description: Phân tích sâu nguyên lý triển khai MVCC trong InnoDB storage engine, giải thích chi tiết hidden column, undo log version chain, cơ chế ReadView, cùng sự khác biệt giữa snapshot read và current read, hiểu cách MySQL triển khai transaction isolation.
category: Cơ sở dữ liệu
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MVCC,Multi-Version Concurrency Control,InnoDB,snapshot read,current read,consistent view,ReadView,undo log,hidden column,transaction isolation
---

## MVCC (Multi-Version Concurrency Control)

MVCC là cơ chế kiểm soát concurrency, dùng để duy trì tính nhất quán và isolation của dữ liệu khi nhiều concurrent transaction cùng đọc và ghi database. Nó được triển khai bằng cách duy trì nhiều phiên bản dữ liệu trên mỗi data row. Khi một transaction cần modify dữ liệu trong database, MVCC tạo data snapshot cho transaction đó thay vì trực tiếp modify row dữ liệu thực.

1. Read operation (SELECT):

Khi một transaction thực thi read operation, nó sử dụng snapshot read. Snapshot read được tạo dựa trên trạng thái database lúc transaction bắt đầu, do đó transaction không đọc được các sửa đổi chưa commit của transaction khác. Cụ thể:

- Với read operation, transaction tìm các data row thỏa điều kiện và chọn phiên bản data phù hợp với thời điểm bắt đầu transaction để đọc.
- Nếu một data row có nhiều phiên bản, transaction chọn phiên bản mới nhất không muộn hơn thời điểm bắt đầu, đảm bảo transaction chỉ đọc dữ liệu đã tồn tại trước khi nó bắt đầu.
- Transaction đọc snapshot data, nên các sửa đổi của các concurrent transaction khác trên data row không ảnh hưởng đến read operation của transaction hiện tại.

2. Write operation (INSERT, UPDATE, DELETE):

Khi một transaction thực thi write operation, nó tạo phiên bản data mới và ghi dữ liệu đã sửa đổi vào database. Cụ thể:

- Với write operation, transaction tạo phiên bản mới cho data row cần modify và ghi dữ liệu đã sửa vào phiên bản mới.
- Phiên bản data mới mang version number của transaction hiện tại để các transaction khác có thể đọc đúng phiên bản dữ liệu.
- Phiên bản original data vẫn tồn tại cho các transaction khác dùng snapshot read — đảm bảo các transaction khác không bị ảnh hưởng bởi write operation của transaction hiện tại.

3. Transaction commit và rollback:

- Khi một transaction commit, các sửa đổi của nó trở thành phiên bản mới nhất của database và visible với các transaction khác.
- Khi một transaction rollback, các sửa đổi của nó bị hủy bỏ, không visible với các transaction khác.

4. Version garbage collection:

Để tránh số lượng phiên bản trong database tăng trưởng không giới hạn, MVCC định kỳ thực hiện garbage collection. Cơ chế này xóa dữ liệu phiên bản cũ không còn cần thiết để giải phóng không gian.

MVCC triển khai kiểm soát concurrency bằng cách tạo nhiều phiên bản dữ liệu và dùng snapshot read. Read operation dùng snapshot của dữ liệu phiên bản cũ, write operation tạo phiên bản mới và đảm bảo phiên bản original vẫn khả dụng. Như vậy các transaction khác nhau có thể thực thi concurrent ở mức độ nhất định mà không cản trở lẫn nhau, từ đó cải thiện concurrency performance và data consistency của database.

## Consistent Nonlocking Read và Locking Read

### Consistent Nonlocking Read

Với triển khai [**Consistent Nonlocking Read**](https://dev.mysql.com/doc/refman/5.7/en/innodb-consistent-read.html), cách thường làm là thêm trường version number hoặc timestamp — version number +1 hoặc cập nhật timestamp khi cập nhật dữ liệu. Khi query, so sánh version number hiện tại visible với version number của record tương ứng. Nếu version của record nhỏ hơn visible version thì record đó visible.

Trong `InnoDB` storage engine, [multi versioning](https://dev.mysql.com/doc/refman/5.7/en/innodb-multi-versioning.html) chính là triển khai của nonlocking read. Nếu row đang được đọc đang có thao tác `DELETE` hoặc `UPDATE`, read operation không chờ lock của row được release. Thay vào đó, `InnoDB` đọc snapshot data của row — cách đọc lịch sử data này gọi là snapshot read.

Trong hai isolation level `Repeatable Read` và `Read Committed`, nếu thực thi câu `select` thông thường (không bao gồm `select ... lock in share mode`, `select ... for update`) thì dùng `Consistent Nonlocking Read (MVCC)`. Và trong `Repeatable Read`, `MVCC` triển khai repeatable read và ngăn một phần phantom read.

### Locking Read

Nếu thực thi các câu lệnh sau đây là [**Locking Read**](https://dev.mysql.com/doc/refman/5.7/en/innodb-locking-reads.html):

- `select ... lock in share mode`
- `select ... for update`
- các thao tác `insert`, `update`, `delete`

Trong locking read, đọc phiên bản mới nhất của data — loại đọc này còn gọi là `current read`. Locking read sẽ lock các record đọc được:

- `select ... lock in share mode`: Lock record bằng `S lock`, transaction khác cũng có thể thêm `S lock`, nhưng thêm `X lock` sẽ bị block.
- `select ... for update`, `insert`, `update`, `delete`: Lock record bằng `X lock`, và transaction khác không thể thêm bất kỳ lock nào.

Trong consistent nonlocking read, ngay cả khi record đang được đọc đã bị transaction khác lock bằng `X lock`, record vẫn có thể đọc được — tức đọc snapshot data. Đã nói ở trên, trong `Repeatable Read`, `MVCC` ngăn một phần phantom read. "Phần" ở đây nghĩa là trong tình huống `consistent nonlocking read`, chỉ đọc được data được insert trước lần query đầu tiên (dựa vào Read View để đánh giá visibility của data — Read View được tạo ra ở lần query đầu tiên). Nhưng! Nếu là `current read`, mỗi lần đọc đều là data mới nhất. Nếu giữa hai lần query có transaction khác insert data thì sẽ xảy ra phantom read. Vì vậy, **khi `InnoDB` triển khai `Repeatable Read`, nếu thực hiện current read sẽ dùng `Next-key Lock` trên các record đọc được để ngăn transaction khác insert data vào khoảng trống**.

## Triển khai MVCC trong InnoDB

Triển khai `MVCC` phụ thuộc vào: **hidden column, Read View, undo log**. Trong triển khai nội bộ, `InnoDB` dùng `DB_TRX_ID` và `Read View` của data row để đánh giá visibility của data. Nếu không visible, dùng `DB_ROLL_PTR` của data row để tìm historical version trong `undo log`. Mỗi transaction có thể đọc phiên bản data khác nhau. Trong cùng một transaction, user chỉ thấy các sửa đổi đã commit trước khi transaction tạo `Read View` và các sửa đổi do chính transaction đó thực hiện.

### Hidden Column

Nội bộ, `InnoDB` storage engine thêm ba [hidden column](https://dev.mysql.com/doc/refman/5.7/en/innodb-multi-versioning.html) cho mỗi data row:

- `DB_TRX_ID (6 byte)`: ID của transaction insert hoặc update row lần cuối. Ngoài ra, `delete` bên trong được coi là update, chỉ đánh dấu là đã xóa trong trường `deleted_flag` trong `Record header`.
- `DB_ROLL_PTR (7 byte)`: Con trỏ rollback, trỏ đến `undo log` của row đó. Nếu row chưa được update thì rỗng.
- `DB_ROW_ID (6 byte)`: Nếu không có primary key và bảng không có unique non-null index, `InnoDB` dùng ID này để tạo clustered index.

### ReadView

```c
class ReadView {
  /* ... */
private:
  trx_id_t m_low_limit_id;      /* Transaction >= ID này đều không visible */

  trx_id_t m_up_limit_id;       /* Transaction < ID này đều visible */

  trx_id_t m_creator_trx_id;    /* ID của transaction tạo Read View này */

  trx_id_t m_low_limit_no;      /* Transaction Number, Undo Logs có number < số này đều có thể Purge */

  ids_t m_ids;                  /* Danh sách active transaction khi tạo Read View */

  m_closed;                     /* Đánh dấu Read View đã close chưa */
}
```

[`Read View`](https://github.com/facebook/mysql-8.0/blob/8.0/storage/innobase/include/read0types.h#L298) chủ yếu dùng để đánh giá visibility — lưu "các active transaction khác hiện không visible với transaction này".

Các trường chính:

- `m_low_limit_id`: Transaction ID lớn nhất đã xuất hiện + 1, tức ID của transaction tiếp theo sẽ được cấp phát. Phiên bản data có ID >= giá trị này đều không visible.
- `m_up_limit_id`: Transaction ID nhỏ nhất trong danh sách active transaction `m_ids`. Nếu `m_ids` rỗng thì `m_up_limit_id` = `m_low_limit_id`. Phiên bản data có ID < giá trị này đều visible.
- `m_ids`: Danh sách ID của các active transaction chưa commit khi tạo `Read View`. Khi tạo `Read View`, ghi lại ID của các uncommitted transaction hiện tại. Sau đó dù chúng có modify giá trị record row, với transaction hiện tại vẫn không visible. `m_ids` không bao gồm transaction hiện tại và các transaction đã commit (đang trong memory).
- `m_creator_trx_id`: ID của transaction tạo `Read View` này.

**Sơ đồ visibility của transaction** ([nguồn hình](https://leviathan.vip/2019/03/20/InnoDB%E7%9A%84%E4%BA%8B%E5%8A%A1%E5%88%86%E6%9E%90-MVCC/#MVCC-1)):

![trans_visible](./images/mvvc/trans_visible.png)

### Undo Log

`undo log` có hai chức năng chính:

- Khôi phục dữ liệu về trạng thái trước khi modify khi transaction rollback.
- Phục vụ `MVCC` — khi đọc record, nếu record đó đang được transaction khác chiếm dụng hoặc phiên bản hiện tại không visible với transaction này, có thể đọc dữ liệu phiên bản trước thông qua `undo log`, từ đó triển khai nonlocking read.

**Trong `InnoDB` storage engine, `undo log` chia thành hai loại: `insert undo log` và `update undo log`:**

1. **`insert undo log`**: `undo log` phát sinh trong thao tác `insert`. Vì record của thao tác `insert` chỉ visible với transaction bản thân, không visible với transaction khác, nên `undo log` này có thể xóa thẳng sau khi transaction commit. Không cần thao tác `purge`.

**Trạng thái khởi đầu của data khi `insert`:**

![](./images/mvvc/317e91e1-1ee1-42ad-9412-9098d5c6a9ad.png)

2. **`update undo log`**: `undo log` phát sinh trong thao tác `update` hoặc `delete`. `undo log` này có thể cần cung cấp cơ chế `MVCC`, do đó không thể xóa khi transaction commit. Khi commit đưa vào linked list `undo log`, chờ `purge thread` xóa cuối cùng.

**Lần đầu data bị modify:**

![](./images/mvvc/c52ff79f-10e6-46cb-b5d4-3c9cbcc1934a.png)

**Lần thứ hai data bị modify:**

![](./images/mvvc/6a276e7a-b0da-4c7b-bdf7-c0c7b7b3b31c.png)

Các sửa đổi của các transaction khác nhau hoặc cùng transaction trên cùng một record row sẽ khiến `undo log` của record row đó tạo thành một linked list — đầu danh sách là record mới nhất, cuối danh sách là record cũ nhất.

### Thuật toán đánh giá visibility của data

Trong `InnoDB` storage engine, sau khi tạo transaction mới, trước khi thực thi mỗi câu `select`, sẽ tạo một snapshot (Read View). **Snapshot lưu ID của các transaction đang active (chưa commit) trong hệ thống database hiện tại**. Nói đơn giản là lưu danh sách ID của các transaction khác mà transaction hiện tại không nên thấy (tức `m_ids`). Khi user trong transaction này muốn đọc một record row nào đó, `InnoDB` sẽ so sánh `DB_TRX_ID` của record row đó với một số variable trong `Read View` và transaction ID hiện tại, để đánh giá có thỏa điều kiện visibility không.

[Thuật toán so sánh cụ thể](https://github.com/facebook/mysql-8.0/blob/8.0/storage/innobase/include/read0types.h#L161) như sau ([nguồn hình](https://leviathan.vip/2019/03/20/InnoDB%E7%9A%84%E4%BA%8B%E5%8A%A1%E5%88%86%E6%9E%90-MVCC/#MVCC-1)):

![](./images/mvvc/8778836b-34a8-480b-b8c7-654fe207a8c2.png)

1. Nếu DB_TRX_ID < m_up_limit_id: Transaction modify row lần cuối (DB_TRX_ID) đã commit trước khi transaction hiện tại tạo snapshot, nên giá trị của record row đó visible với transaction hiện tại.

2. Nếu DB_TRX_ID >= m_low_limit_id: Transaction modify row lần cuối (DB_TRX_ID) modify row sau khi transaction hiện tại tạo snapshot, nên giá trị của record row đó không visible với transaction hiện tại. Chuyển đến bước 5.

3. Nếu m_ids rỗng: Transaction modify row đã commit trước khi transaction hiện tại tạo snapshot, nên giá trị của record row đó visible với transaction hiện tại.

4. Nếu m_up_limit_id <= DB_TRX_ID < m_low_limit_id: Transaction modify row lần cuối (DB_TRX_ID) có thể đang ở trạng thái "active" hoặc "committed" khi transaction hiện tại tạo snapshot. Cần tìm trong active transaction list m_ids (code dùng binary search vì đã sort):

   - Nếu tìm thấy DB_TRX_ID trong active transaction list m_ids: ① Trước khi transaction hiện tại tạo snapshot, giá trị record row bị sửa bởi transaction ID DB_TRX_ID nhưng chưa commit; hoặc ② Sau khi transaction hiện tại tạo snapshot, giá trị record row bị sửa bởi transaction ID DB_TRX_ID. Trong các trường hợp này, giá trị record row không visible với transaction hiện tại. Chuyển đến bước 5.

   - Không tìm thấy trong active transaction list: "Transaction với id là trx_id" đã commit trước khi "transaction hiện tại" tạo snapshot sau khi modify "giá trị record row", nên record row visible với transaction hiện tại.

5. Lấy snapshot record từ `undo log` mà `DB_ROLL_PTR` của record row trỏ đến, dùng `DB_TRX_ID` của snapshot record để quay lại bước 1 và bắt đầu lại, cho đến khi tìm được phiên bản snapshot thỏa điều kiện hoặc trả về rỗng.

## Sự khác biệt của MVCC trong RC và RR isolation level

Trong transaction isolation level `RC` và `RR` (isolation level mặc định của InnoDB storage engine), `InnoDB` dùng `MVCC` (consistent nonlocking read), nhưng thời điểm tạo `Read View` khác nhau:

- Trong RC isolation level: Tạo `Read View` (m_ids list) mới trước **mỗi lần `select`**.
- Trong RR isolation level: Chỉ tạo một `Read View` (m_ids list) trước **lần `select` đầu tiên** sau khi transaction bắt đầu.

## MVCC giải quyết vấn đề Non-Repeatable Read

Mặc dù cả RC và RR đều dùng `MVCC` để đọc snapshot data, nhưng do **thời điểm tạo Read View khác nhau** nên trong RR level mới triển khai được repeatable read.

Ví dụ:

![](./images/mvvc/6fb2b9a1-5f14-4dec-a797-e4cf388ed413.png)

### Tình huống tạo ReadView trong RC

**1. Giả sử timeline đến T4, version chain của data row id = 1 là:**

![](./images/mvvc/a3fd1ec6-8f37-42fa-b090-7446d488fd04.png)

Vì trong RC level mỗi lần query đều tạo `Read View`, và transaction 101, 102 chưa commit, nên `Read View` do transaction `103` tạo lúc này có active transaction **`m_ids`: [101, 102]**, `m_low_limit_id`: 104, `m_up_limit_id`: 101, `m_creator_trx_id`: 103.

- Lúc này `DB_TRX_ID` của record mới nhất là 101, m_up_limit_id <= 101 < m_low_limit_id, nên tìm trong `m_ids` list — tìm thấy `DB_TRX_ID`, record không visible.
- Dùng `DB_ROLL_PTR` tìm record phiên bản trước trong `undo log` — `DB_TRX_ID` vẫn là 101, không visible.
- Tiếp tục tìm phiên bản trước với `DB_TRX_ID` là 1, thỏa 1 < m_up_limit_id, visible. Vậy transaction 103 query được data `name = Cải hoa`.

**2. Timeline đến T6, version chain của data là:**

![](./images/mvvc/528559e9-dae8-4d14-b78d-a5b657c88391.png)

Vì trong RC level, tạo lại `Read View`. Lúc này transaction 101 đã commit, 102 chưa commit, nên lúc này `m_ids` trong `Read View`: **[102]**, `m_low_limit_id`: 104, `m_up_limit_id`: 102, `m_creator_trx_id`: 103.

- Lúc này `DB_TRX_ID` của record mới nhất là 102, m_up_limit_id <= 102 < m_low_limit_id, tìm trong `m_ids` list — tìm thấy `DB_TRX_ID`, record không visible.
- Dùng `DB_ROLL_PTR` tìm record phiên bản trước trong `undo log` — `DB_TRX_ID` là 101, thỏa 101 < m_up_limit_id, record visible. Vậy tại thời điểm T6 query được data `name = Lý Tứ` — kết quả không nhất quán với query tại T4, non-repeatable read!

**3. Timeline đến T9, version chain của data là:**

![](./images/mvvc/6f82703c-36a1-4458-90fe-d7f4edbac71a.png)

Tạo lại `Read View`. Lúc này cả transaction 101 và 102 đều đã commit, nên **m_ids** rỗng, `m_up_limit_id = m_low_limit_id = 104`. Transaction ID mới nhất là 102, thỏa 102 < m_low_limit_id, visible. Kết quả query là `name = Triệu Lục`.

> **Tóm lại:** **Trong RC isolation level, transaction tạo và đặt Read View mới trước mỗi lần query, dẫn đến non-repeatable read.**

### Tình huống tạo ReadView trong RR

Trong repeatable read level, chỉ tạo một Read View sau khi transaction bắt đầu, vào lần đầu đọc data.

**1. Trong tình huống T4, version chain là:**

![](./images/mvvc/0e906b95-c916-4f30-beda-9cb3e49746bf.png)

Tạo `Read View` khi thực thi câu `select` hiện tại, lúc này **`m_ids`: [101, 102]**, `m_low_limit_id`: 104, `m_up_limit_id`: 101, `m_creator_trx_id`: 103.

Lúc này giống RC level:

- `DB_TRX_ID` của record mới nhất là 101, m_up_limit_id <= 101 < m_low_limit_id, tìm trong `m_ids` — tìm thấy `DB_TRX_ID`, record không visible.
- Dùng `DB_ROLL_PTR` tìm record phiên bản trước trong `undo log` — `DB_TRX_ID` vẫn là 101, không visible.
- Tiếp tục tìm phiên bản trước `DB_TRX_ID` là 1, thỏa 1 < m_up_limit_id, visible. Vậy transaction 103 query được data `name = Cải hoa`.

**2. Tại thời điểm T6:**

![](./images/mvvc/79ed6142-7664-4e0b-9023-cf546586aa39.png)

Trong RR level chỉ tạo `Read View` một lần, nên lúc này vẫn dùng **`m_ids`: [101, 102]**, `m_low_limit_id`: 104, `m_up_limit_id`: 101, `m_creator_trx_id`: 103.

- `DB_TRX_ID` của record mới nhất là 102, m_up_limit_id <= 102 < m_low_limit_id, tìm trong `m_ids` — tìm thấy `DB_TRX_ID`, record không visible.
- Dùng `DB_ROLL_PTR` tìm record phiên bản trước trong `undo log` — `DB_TRX_ID` là 101, không visible.
- Tiếp tục dùng `DB_ROLL_PTR` tìm record phiên bản trước trong `undo log` — `DB_TRX_ID` vẫn là 101, không visible.
- Tiếp tục tìm phiên bản trước `DB_TRX_ID` là 1, thỏa 1 < m_up_limit_id, visible. Vậy transaction 103 query được data `name = Cải hoa`.

**3. Tại thời điểm T9:**

![](./images/mvvc/cbbedbc5-0e3c-4711-aafd-7f3d68a4ed4e.png)

Tình huống lúc này hoàn toàn giống T6. Vì đã tạo `Read View`, vẫn dùng **`m_ids`: [101, 102]**, nên kết quả query vẫn là `name = Cải hoa`.

## MVCC + Next-key-Lock ngăn Phantom Read

`InnoDB` storage engine trong RR level giải quyết phantom read thông qua `MVCC` và `Next-key Lock`:

**1. Thực thi `select` thông thường — dùng snapshot read của `MVCC`**

Trong snapshot read, RR isolation level chỉ tạo `Read View` một lần sau khi transaction bắt đầu và dùng cho đến khi commit. Nên sau khi tạo `Read View`, các phiên bản record update, insert của transaction khác không visible với transaction hiện tại, triển khai repeatable read và ngăn phantom read trong snapshot read.

**2. Thực thi `select...for update/lock in share mode`, `insert`, `update`, `delete` — current read**

Trong current read, đọc data mới nhất. Nếu transaction khác insert record mới và đúng trong phạm vi query của transaction hiện tại thì sẽ xảy ra phantom read! `InnoDB` dùng [Next-key Lock](https://dev.mysql.com/doc/refman/5.7/en/innodb-locking.html#innodb-next-key-locks) để ngăn điều này. Khi thực hiện current read, đồng thời lock các record đọc được và khoảng trống giữa chúng, ngăn transaction khác insert data vào phạm vi query. Chỉ cần không cho insert thì sẽ không có phantom read.

## Tài liệu tham khảo

- **《MySQL Internals: InnoDB Storage Engine Edition 2》**
- [Quan hệ giữa Transaction Isolation Level và Lock trong InnoDB](https://tech.meituan.com/2014/08/20/innodb-lock.html)
- [MySQL Transaction và MVCC triển khai Isolation Level như thế nào](https://blog.csdn.net/qq_35190492/article/details/109044141)
- [InnoDB Transaction Analysis — MVCC](https://leviathan.vip/2019/03/20/InnoDB%E7%9A%84%E4%BA%8B%E5%8A%A1%E5%88%86%E6%9E%90-MVCC/)

<!-- @include: @article-footer.snippet.md -->
