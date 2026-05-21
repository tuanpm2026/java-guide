---
title: Quá trình thực thi câu SQL trong MySQL
description: Giải thích chi tiết toàn bộ quy trình thực thi SQL trong MySQL, từ xác thực danh tính của connector, query cache, phân tích cú pháp bởi analyzer, optimizer tạo execution plan đến executor gọi storage engine.
category: Cơ sở dữ liệu
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MySQL execution flow,quá trình thực thi SQL,connector,parser,optimizer,executor,Server layer,storage engine,InnoDB
---

> Bài này được đóng góp bởi [Mộc Mộc Tượng](https://github.com/kinglaw1204).

Bài này sẽ phân tích quy trình thực thi của một câu SQL trong MySQL, bao gồm cách query SQL được xử lý nội bộ trong MySQL và câu lệnh update được hoàn thành như thế nào.

Trước khi phân tích, tôi sẽ giới thiệu kiến trúc cơ bản của MySQL. Biết MySQL gồm những component nào và vai trò của chúng sẽ giúp chúng ta hiểu và giải quyết những vấn đề này.

## 1. Phân tích kiến trúc cơ bản MySQL

### 1.1 Tổng quan kiến trúc MySQL cơ bản

Hình dưới là sơ đồ kiến trúc đơn giản của MySQL. Từ hình này bạn có thể thấy rõ cách câu SQL của người dùng được thực thi bên trong MySQL.

Trước tiên giới thiệu ngắn gọn vai trò cơ bản của một số component trong hình để giúp hiểu — chi tiết về từng component sẽ được trình bày ở mục 1.2.

- **Connector**: Liên quan đến xác thực danh tính và quyền hạn (khi đăng nhập MySQL).
- **Query Cache**: Khi thực thi câu query, sẽ kiểm tra query cache trước (đã được loại bỏ từ MySQL 8.0 vì chức năng này không thực dụng).
- **Analyzer**: Nếu không hit cache, câu SQL sẽ qua analyzer. Nói đơn giản, analyzer xem câu SQL muốn làm gì, rồi kiểm tra syntax của câu SQL có đúng không.
- **Optimizer**: Thực thi theo phương án mà MySQL cho là tối ưu nhất.
- **Executor**: Thực thi câu lệnh, sau đó trả dữ liệu từ storage engine.

![](https://oss.javaguide.cn/javaguide/13526879-3037b144ed09eb88.png)

Nói đơn giản, MySQL chủ yếu chia thành Server layer và Storage Engine layer:

- **Server layer**: Chủ yếu bao gồm connector, query cache, analyzer, optimizer, executor. Tất cả chức năng xuyên storage engine đều được triển khai ở tầng này, như stored procedure, trigger, view, function, v.v. Cũng có một logging module chung là binlog.
- **Storage engine**: Chủ yếu chịu trách nhiệm lưu trữ và đọc dữ liệu. Dùng kiến trúc plugin có thể thay thế, hỗ trợ nhiều storage engine như InnoDB, MyISAM, Memory. Trong đó InnoDB engine có module log riêng là redolog. **Storage engine phổ biến nhất hiện nay là InnoDB — từ MySQL 5.5 đã là storage engine mặc định.**

### 1.2 Giới thiệu các component cơ bản của Server layer

#### 1) Connector

Connector liên quan đến chức năng xác thực danh tính và quyền hạn — giống như một bảo vệ cấp cao.

Chủ yếu chịu trách nhiệm đăng nhập database của người dùng, thực hiện xác thực danh tính người dùng bao gồm kiểm tra username/password, quyền hạn, v.v. Nếu username/password đã thông qua, connector sẽ query bảng quyền hạn để lấy tất cả quyền của user đó. Sau đó mọi logic phán đoán quyền hạn trong connection này đều phụ thuộc vào dữ liệu quyền đọc được lúc này. Nghĩa là, chỉ cần connection này không bị ngắt, dù admin có sửa quyền của user đó, user đó cũng không bị ảnh hưởng.

#### 2) Query Cache (đã loại bỏ từ MySQL 8.0)

Query Cache chủ yếu dùng để cache các câu SELECT đã thực thi và result set của chúng.

Sau khi connection được thiết lập, khi thực thi câu query sẽ kiểm tra query cache trước. MySQL kiểm tra xem SQL này đã từng thực thi chưa, cache dưới dạng Key-Value trong memory (Key là câu query, Value là result set). Nếu cache key hit, trả thẳng cho client. Nếu không hit, thực thi các bước tiếp theo, sau khi hoàn thành cũng cache kết quả lại để lần sau dùng. Tất nhiên khi thực sự query cache vẫn phải kiểm tra quyền của user có quyền query bảng đó không.

Không khuyến nghị dùng query cache của MySQL vì cache invalidation trong tình huống nghiệp vụ thực tế có thể rất thường xuyên. Nếu bạn cập nhật một bảng thì tất cả query cache của bảng đó sẽ bị xóa. Với dữ liệu ít cập nhật thì vẫn có thể dùng cache.

Do đó trong hầu hết trường hợp chúng ta không khuyến nghị dùng query cache.

Từ MySQL 8.0 đã xóa chức năng cache. Official cũng cho rằng chức năng này ít được dùng trong tình huống thực tế, nên loại bỏ thẳng.

#### 3) Analyzer

Nếu MySQL không hit cache, sẽ vào analyzer. Analyzer chủ yếu phân tích câu SQL muốn làm gì. Analyzer cũng chia làm mấy bước:

**Bước 1, lexical analysis (phân tích từ vựng)**: Một câu SQL gồm nhiều string. Trước tiên cần trích xuất keyword, ví dụ `select`, trích xuất bảng cần query, trích xuất tên field, trích xuất điều kiện query, v.v. Sau khi xong các thao tác này, chuyển sang bước 2.

**Bước 2, syntax analysis (phân tích cú pháp)**: Chủ yếu kiểm tra SQL bạn nhập có đúng không, có phù hợp cú pháp MySQL không.

Sau 2 bước này, MySQL chuẩn bị thực thi. Nhưng thực thi như thế nào, cách nào tốt nhất? Lúc này optimizer phát huy tác dụng.

#### 4) Optimizer

Vai trò của optimizer là thực thi theo phương án tối ưu nhất mà nó xác định (đôi khi có thể cũng không tối ưu nhất — bài này không đi sâu vào phần này). Ví dụ khi có nhiều index nên chọn index nào, multi-table query nên chọn thứ tự join như thế nào.

Có thể nói, sau optimizer, cách thực thi cụ thể của câu lệnh đó đã được xác định.

#### 5) Executor

Sau khi chọn execution plan, MySQL chuẩn bị thực thi. Trước tiên kiểm tra user có quyền không. Không có quyền thì trả error message. Có quyền thì gọi interface của engine, trả kết quả thực thi của engine.

## 2. Phân tích câu lệnh

### 2.1 Câu truy vấn

Nói nhiều như vậy rồi, một câu SQL thực sự được thực thi như thế nào? Thực ra SQL của chúng ta có thể chia thành hai loại: query và update (thêm, sửa, xóa). Trước tiên phân tích câu query:

```sql
select * from tb_student  A where A.age='18' and A.name=' Zhang San ';
```

Kết hợp giải thích trên, phân tích quy trình thực thi câu lệnh này:

- Trước tiên kiểm tra câu lệnh có quyền không. Không có quyền trả error thẳng. Có quyền thì trước MySQL 8.0 sẽ query cache trước — dùng câu SQL này làm key tìm trong memory xem có kết quả không. Có thì trả từ cache, không có thực thi bước tiếp.
- Thông qua analyzer thực hiện lexical analysis, trích xuất các element key của câu SQL: trích xuất loại thao tác là `select`, trích xuất tên bảng cần query là `tb_student`, cần query tất cả column, điều kiện query là `id='1'` của bảng đó. Sau đó kiểm tra câu SQL có lỗi syntax không, ví dụ keyword có đúng không, v.v. Nếu không có vấn đề thực thi bước tiếp.
- Tiếp theo optimizer xác định execution plan. Câu SQL trên có thể có 2 execution plan: a. Trước tiên query sinh viên tên "Zhang San" trong bảng, rồi kiểm tra tuổi có phải 18 không. b. Trước tiên tìm sinh viên 18 tuổi, rồi query sinh viên tên "Zhang San". Optimizer dựa trên thuật toán tối ưu của mình để chọn phương án hiệu quả nhất (optimizer cho là vậy, đôi khi có thể không phải tốt nhất). Sau khi xác nhận execution plan, chuẩn bị thực thi.
- Kiểm tra quyền hạn. Không có quyền trả error message. Có quyền gọi interface của database engine, trả kết quả thực thi của engine.

### 2.2 Câu cập nhật

Trên đây là quy trình thực thi của một câu query SQL. Tiếp theo xem câu lệnh update được thực thi như thế nào:

```plain
update tb_student A set A.age='19' where A.name=' Zhang San ';
```

Sửa tuổi của Zhang San. Trong database thực tế chắc chắn không đặt field tuổi (không thì bị tech lead đánh). Câu lệnh này về cơ bản cũng đi theo flow của câu query trước, chỉ là khi thực thi update chắc chắn phải log — lúc này đưa vào logging module. MySQL tích hợp sẵn **binlog (archive log)**, tất cả storage engine đều có thể dùng. InnoDB còn có module log riêng là **redo log**. Chúng ta khám phá flow thực thi câu lệnh này trong mode InnoDB:

- Trước tiên query đến bản ghi của Zhang San — không đi qua query cache vì quy tắc thiết kế của query cache là chỉ phục vụ câu lệnh query.
- Sau khi lấy được bản ghi query, đổi `age` thành 19, gọi API interface của engine để ghi row dữ liệu này. InnoDB engine lưu dữ liệu trong memory, đồng thời ghi redo log. Lúc này redo log vào trạng thái **prepare**, sau đó báo cho executor rằng đã thực thi xong, có thể commit bất kỳ lúc nào.
- Executor nhận thông báo, ghi binlog, sau đó xóa query cache của bảng đó. Việc xóa tại thời điểm này đảm bảo SELECT sau đó sẽ không đọc cache cũ — vì transaction sắp commit cuối cùng, dữ liệu sắp cập nhật thành trạng thái mới nhất, thời điểm cache invalidate vừa khớp với thực tế dữ liệu được cập nhật.
- Executor gọi interface của engine, commit redo log thành trạng thái **commit**.
- Cập nhật hoàn tất.

**Chắc chắn có bạn hỏi: Tại sao cần dùng hai logging module, không dùng một được không?**

Vì ban đầu MySQL không có InnoDB engine (InnoDB engine được công ty khác cắm vào MySQL dạng plugin). Storage engine tích hợp sẵn của MySQL là MyISAM. Chúng ta biết redo log là đặc thù của InnoDB, các storage engine khác không có — điều này dẫn đến không có khả năng crash-safe (crash-safe là ngay cả khi database bị khởi động lại bất thường, các bản ghi đã commit trước đó đều không bị mất). binlog chỉ có thể dùng để archive.

Không phải không thể dùng một logging module, chỉ là InnoDB dùng redo log để hỗ trợ transaction. Vậy lại có bạn hỏi, dùng hai logging module nhưng không cần phức tạp thế được không? Tại sao redo log cần giới thiệu trạng thái prepare pre-commit? Dùng proof by contradiction để giải thích:

- **Ghi redo log trước rồi commit thẳng, sau đó ghi binlog**: Giả sử sau khi ghi redo log xong, máy chết, binlog chưa được ghi vào. Khi máy restart, máy này sẽ phục hồi dữ liệu qua redo log, nhưng lúc này binlog không có bản ghi dữ liệu đó. Sau đó khi backup máy, dữ liệu này sẽ bị mất, master-slave sync cũng sẽ mất dữ liệu này.
- **Ghi binlog trước, sau đó ghi redo log**: Giả sử sau khi ghi binlog xong, máy bị khởi động lại bất thường. Do không có redo log, máy này không thể phục hồi bản ghi này. Nhưng binlog có ghi, dẫn đến tình huống data inconsistency tương tự trên.

Nếu dùng two-phase commit cho redo log thì khác rồi: sau khi ghi xong redo log, đánh dấu là prepare; tiếp theo ghi xong binlog, rồi đánh dấu redo log là commit — điều này ngăn chặn được các vấn đề trên và đảm bảo data consistency.

Vậy câu hỏi đặt ra: Có tình huống cực đoan nào không? Giả sử redo log ở trạng thái prepare, binlog cũng đã ghi xong, lúc này xảy ra khởi động lại bất thường thì sao? Điều này phụ thuộc vào cơ chế xử lý của MySQL:

- Kiểm tra redo log có phải trạng thái commit không. Nếu có, nghĩa là binlog chắc chắn đã flush disk, commit ngay lập tức.
- Nếu redo log chỉ là trạng thái prepare nhưng không phải commit, lúc này lấy XID của transaction để kiểm tra trong binlog xem transaction đó có flush disk xong không. Có thì commit redo log, không thì rollback transaction.

Như vậy giải quyết được vấn đề data consistency.

## 3. Tổng kết

- MySQL chủ yếu chia thành Server layer và Engine layer. Server layer chủ yếu bao gồm connector, query cache, analyzer, optimizer, executor, và một logging module (binlog) có thể dùng cho tất cả execution engine. Riêng redolog chỉ có InnoDB có.
- Engine layer là plugin, hiện chủ yếu bao gồm MyISAM, InnoDB, Memory, v.v.
- Quy trình thực thi câu query: permission check (nếu hit cache) → query cache → analyzer → optimizer → permission check → executor → engine
- Quy trình thực thi câu update: analyzer → permission check → executor → engine → redo log (prepare state) → binlog → redo log (commit state)

## 4. Tài liệu tham khảo

- 《MySQL 45 Lectures in Practice》
- MySQL 5.6 Reference Manual: <https://dev.MySQL.com/doc/refman/5.6/en/>

<!-- @include: @article-footer.snippet.md -->
