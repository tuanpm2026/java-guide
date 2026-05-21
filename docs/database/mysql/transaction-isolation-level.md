---
title: Giải thích chi tiết Transaction Isolation Level trong MySQL
description: Giải thích chi tiết bốn mức độ transaction isolation trong MySQL (Read Uncommitted, Read Committed, Repeatable Read, Serializable), phân tích các vấn đề concurrency như dirty read, non-repeatable read, phantom read, và cách InnoDB giải quyết phantom read thông qua MVCC và cơ chế lock.
category: Cơ sở dữ liệu
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MySQL transaction isolation level,read uncommitted,read committed,repeatable read,serializable,dirty read,non-repeatable read,phantom read,MVCC,gap lock
---

> Bài viết này được hoàn thành bởi [SnailClimb](https://github.com/Snailclimb) và [guang19](https://github.com/guang19).

Để xem tổng quan cơ bản về transaction, hãy xem bài: [Tổng hợp kiến thức MySQL thường gặp & câu hỏi phỏng vấn](./mysql-questions-01.md#MySQL-事务)

## Tổng kết các Transaction Isolation Level

SQL chuẩn định nghĩa bốn mức transaction isolation để cân bằng giữa tính isolation và hiệu năng concurrency. Mức độ càng cao thì tính nhất quán dữ liệu càng tốt, nhưng hiệu năng concurrency có thể càng thấp. Bốn mức đó là:

- **READ-UNCOMMITTED (Đọc chưa commit)**: Mức isolation thấp nhất, cho phép đọc các thay đổi dữ liệu chưa được commit, có thể dẫn đến dirty read, phantom read hoặc non-repeatable read. Mức này rất ít dùng trong thực tế vì đảm bảo tính nhất quán dữ liệu quá yếu.
- **READ-COMMITTED (Đọc đã commit)**: Cho phép đọc dữ liệu mà transaction đồng thời đã commit, có thể ngăn dirty read, nhưng phantom read hoặc non-repeatable read vẫn có thể xảy ra. Đây là mức isolation mặc định của hầu hết database (như Oracle, SQL Server).
- **REPEATABLE-READ (Đọc lặp lại được)**: Kết quả đọc cùng một trường nhiều lần đều nhất quán, trừ khi dữ liệu bị chính transaction đó sửa đổi. Có thể ngăn dirty read và non-repeatable read, nhưng phantom read vẫn có thể xảy ra. Mức isolation mặc định của MySQL InnoDB storage engine chính là REPEATABLE READ. Ngoài ra, InnoDB ở mức này thông qua cơ chế **MVCC (Multi-Version Concurrency Control)** và **Next-Key Locks (Gap Lock + Row Lock)** đã giải quyết phần lớn vấn đề phantom read.
- **SERIALIZABLE (Có thể tuần tự hóa)**: Mức isolation cao nhất, tuân thủ đầy đủ isolation trong ACID. Tất cả transaction được thực thi lần lượt theo thứ tự, các transaction không thể ảnh hưởng lẫn nhau, tức là mức này có thể ngăn dirty read, non-repeatable read và phantom read.

| Isolation Level  | Dirty Read | Non-Repeatable Read | Phantom Read            |
| ---------------- | ---------- | ------------------- | ----------------------- |
| READ UNCOMMITTED | √          | √                   | √                       |
| READ COMMITTED   | ×          | √                   | √                       |
| REPEATABLE READ  | ×          | ×                   | √ (chuẩn) / ≈× (InnoDB) |
| SERIALIZABLE     | ×          | ×                   | ×                       |

**Kiểm tra mức mặc định:**

Mức isolation mặc định của MySQL InnoDB là **REPEATABLE READ**. Có thể kiểm tra bằng lệnh sau:

- Trước MySQL 8.0: `SELECT @@tx_isolation;`
- MySQL 8.0 trở đi: `SELECT @@transaction_isolation;`

```bash
mysql> SELECT @@transaction_isolation;
+-------------------------+
| @@transaction_isolation |
+-------------------------+
| REPEATABLE-READ         |
+-------------------------+
```

**Cách InnoDB xử lý phantom read ở mức REPEATABLE READ:**

Theo định nghĩa SQL isolation chuẩn, REPEATABLE READ không thể ngăn phantom read. Nhưng triển khai của InnoDB thông qua các cơ chế sau đã phần lớn tránh được phantom read:

- **Snapshot Read**: Câu lệnh `SELECT` thông thường, triển khai qua cơ chế **MVCC**. Khi transaction bắt đầu, tạo một snapshot dữ liệu; các lần snapshot read tiếp theo đều đọc phiên bản dữ liệu này, tránh thấy các row mới mà transaction khác insert (phantom read) hoặc row bị sửa đổi (non-repeatable read).
- **Current Read**: Các thao tác như `SELECT ... FOR UPDATE`, `SELECT ... LOCK IN SHARE MODE`, `INSERT`, `UPDATE`, `DELETE`. InnoDB dùng **Next-Key Lock** để lock các index record trong phạm vi quét và khoảng trống giữa chúng (gap), ngăn transaction khác insert record mới trong phạm vi này, tránh phantom read. Next-Key Lock là sự kết hợp của Row Lock (Record Lock) và Gap Lock.

Đáng lưu ý: mặc dù thường cho rằng mức isolation càng cao thì concurrency càng kém, nhưng InnoDB storage engine đã tối ưu mức REPEATABLE READ thông qua cơ chế MVCC. Với nhiều tình huống chỉ đọc hoặc read nhiều write ít thông thường, hiệu năng **có thể không có sự khác biệt đáng kể so với READ COMMITTED**. Tuy nhiên, trong tình huống write-intensive với xung đột concurrency cao, cơ chế gap lock của RR có thể gây nhiều lock wait hơn RC.

Ngoài ra, trong một số tình huống cụ thể như distributed transaction (XA Transactions) yêu cầu strict consistency, InnoDB có thể yêu cầu hoặc khuyến nghị dùng mức SERIALIZABLE để đảm bảo tính nhất quán dữ liệu toàn cục.

Chương 7.7 của 《MySQL Internals: InnoDB Storage Engine (Phiên bản 2)》viết:

> InnoDB storage engine cung cấp hỗ trợ cho XA transaction, và thông qua XA transaction để hỗ trợ triển khai distributed transaction. Distributed transaction cho phép nhiều transaction resource độc lập tham gia vào một global transaction. Transaction resource thường là hệ thống RDBMS, nhưng cũng có thể là các loại resource khác. Global transaction yêu cầu tất cả transaction tham gia hoặc đều commit hoặc đều rollback, điều này đặt ra yêu cầu cao hơn so với ACID gốc của transaction. Ngoài ra, khi dùng distributed transaction, mức transaction isolation của InnoDB phải được đặt thành SERIALIZABLE.

## Minh họa thực tế

Dưới đây tôi sẽ dùng 2 command line MySQL để mô phỏng vấn đề dirty read của nhiều thread (nhiều transaction) trên cùng một dữ liệu.

Trong cấu hình mặc định của MySQL command line, transaction được tự động commit, tức là sẽ thực thi COMMIT ngay sau khi chạy câu SQL. Nếu muốn bật tường minh một transaction, cần dùng lệnh: `START TRANSACTION`.

Có thể đặt isolation level bằng lệnh sau:

```sql
SET [SESSION|GLOBAL] TRANSACTION ISOLATION LEVEL [READ UNCOMMITTED|READ COMMITTED|REPEATABLE READ|SERIALIZABLE]
```

Các câu lệnh concurrency control sử dụng trong thực tế dưới đây:

- `START TRANSACTION` | `BEGIN`: Bật tường minh một transaction.
- `COMMIT`: Commit transaction, làm tất cả sửa đổi trên database trở thành vĩnh viễn.
- `ROLLBACK`: Rollback sẽ kết thúc transaction của người dùng và hủy bỏ tất cả sửa đổi chưa commit đang thực hiện.

### Dirty Read (Đọc chưa commit)

![](<https://oss.javaguide.cn/github/javaguide/2019-31-1%E8%84%8F%E8%AF%BB(%E8%AF%BB%E6%9C%AA%E6%8F%90%E4%BA%A4)%E5%AE%9E%E4%BE%8B.jpg>)

### Tránh Dirty Read (Đọc đã commit)

![](https://oss.javaguide.cn/github/javaguide/2019-31-2%E8%AF%BB%E5%B7%B2%E6%8F%90%E4%BA%A4%E5%AE%9E%E4%BE%8B.jpg)

### Non-Repeatable Read (Đọc không lặp lại được)

Vẫn là hình Read Committed ở trên, mặc dù tránh được Read Uncommitted, nhưng lại xảy ra vấn đề Non-Repeatable Read khi một transaction chưa kết thúc.

![](https://oss.javaguide.cn/github/javaguide/2019-32-1%E4%B8%8D%E5%8F%AF%E9%87%8D%E5%A4%8D%E8%AF%BB%E5%AE%9E%E4%BE%8B.jpg)

### Repeatable Read (Đọc lặp lại được)

![](https://oss.javaguide.cn/github/javaguide/2019-33-2%E5%8F%AF%E9%87%8D%E5%A4%8D%E8%AF%BB.jpg)

### Phantom Read (Đọc bóng ma)

#### Minh họa tình huống xảy ra Phantom Read

![](https://oss.javaguide.cn/github/javaguide/phantom_read.png)

SQL script 1 lần đầu query chỉ có một record có lương 500. SQL script 2 insert một record có lương 500 và commit. SQL script 1 trong cùng transaction dùng current read query lại thì phát hiện có hai record có lương 500 — đây là phantom read.

#### Cách giải quyết Phantom Read

Có nhiều cách giải quyết phantom read, nhưng ý tưởng cốt lõi là: khi một transaction đang thao tác dữ liệu của một bảng, transaction khác không được phép thêm hoặc xóa dữ liệu trong bảng đó. Các cách giải quyết phantom read chủ yếu:

1. Nâng transaction isolation level lên `SERIALIZABLE`.
2. Ở mức transaction repeatable read, thêm table lock cho bảng mà transaction đang thao tác.
3. Ở mức transaction repeatable read, thêm `Next-key Lock (Record Lock + Gap Lock)` cho bảng mà transaction đang thao tác.

### Tài liệu tham khảo

- 《MySQL Internals: InnoDB Storage Engine》
- <https://dev.MySQL.com/doc/refman/5.7/en/>
- [MySQL Lock: Seven Soul Questions](https://tech.youzan.com/seven-questions-about-the-lock-of-MySQL/)
- [Transaction Isolation Level và Quan hệ với Lock trong InnoDB](https://tech.meituan.com/2014/08/20/innodb-lock.html)

<!-- @include: @article-footer.snippet.md -->
