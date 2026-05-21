---
title: Auto-increment Primary Key trong MySQL có nhất thiết liên tục không?
description: Giải thích chi tiết nguyên nhân auto-increment primary key trong MySQL không liên tục, phân tích cơ chế cấp phát giá trị auto-increment trong các tình huống như unique key conflict, transaction rollback, batch insert, cùng cấu hình và ảnh hưởng của InnoDB auto-increment lock mode.
category: Cơ sở dữ liệu
tag:
  - MySQL
  - Phỏng vấn Big Tech
head:
  - - meta
    - name: keywords
      content: MySQL auto-increment primary key,AUTO_INCREMENT,primary key không liên tục,transaction rollback,batch insert,unique key conflict,innodb_autoinc_lock_mode
---

> Tác giả: Feitian Xiaorou Rou
>
> Bài gốc: <https://mp.weixin.qq.com/s/qci10h9rJx_COZbHV3aygQ>

Ai cũng biết, auto-increment primary key giúp clustered index duy trì thứ tự insert tăng dần, tránh random query, từ đó cải thiện hiệu quả query.

Nhưng thực tế, MySQL auto-increment primary key không đảm bảo nhất thiết phải liên tục tăng dần.

Lấy ví dụ dưới đây, tạo một bảng như sau:

![](https://oss.javaguide.cn/p3-juejin/3e6b80ba50cb425386b80924e3da0d23~tplv-k3u1fbpfcp-zoom-1.png)

## Giá trị auto-increment được lưu ở đâu?

Dùng `insert into test_pk values(null, 1, 1)` để insert một row data, rồi thực thi lệnh `show create table` xem định nghĩa cấu trúc bảng:

![](https://oss.javaguide.cn/p3-juejin/c17e46230bd34150966f0d86b2ad5e91~tplv-k3u1fbpfcp-zoom-1.png)

Định nghĩa cấu trúc bảng trên được lưu trong file cục bộ có hậu tố `.frm`, tìm được file `.frm` này trong thư mục data dưới thư mục cài MySQL:

![](https://oss.javaguide.cn/p3-juejin/3ec0514dd7be423d80b9e7f2d52f5902~tplv-k3u1fbpfcp-zoom-1.png)

Từ cấu trúc bảng trên, thấy trong định nghĩa bảng có `AUTO_INCREMENT=2`, nghĩa là lần insert tiếp theo nếu cần tự động tạo giá trị auto-increment sẽ tạo id = 2.

Nhưng cần lưu ý, giá trị auto-increment không được lưu trong cấu trúc bảng tức file `.frm` này. Các engine khác nhau có chiến lược lưu giá trị auto-increment khác nhau:

1. Giá trị auto-increment của MyISAM engine được lưu trong data file.

2. Giá trị auto-increment của InnoDB engine thực ra được lưu trong memory, không được persist. Mỗi lần mở bảng lần đầu, sẽ tìm giá trị auto-increment lớn nhất `max(id)`, rồi dùng `max(id)+1` làm giá trị auto-increment hiện tại của bảng.

Ví dụ: Hiện tại row data lớn nhất trong bảng có id là 1, AUTO_INCREMENT=2. Lúc này xóa row id=1, AUTO_INCREMENT vẫn là 2.

![](https://oss.javaguide.cn/p3-juejin/61b8dc9155624044a86d91c368b20059~tplv-k3u1fbpfcp-zoom-1.png)

Nhưng nếu restart MySQL instance ngay lúc đó, AUTO_INCREMENT của bảng này sau khi restart sẽ thành 1. Tức là, restart MySQL có thể modify giá trị AUTO_INCREMENT của một bảng.

![](https://oss.javaguide.cn/p3-juejin/27fdb15375664249a31f88b64e6e5e66~tplv-k3u1fbpfcp-zoom-1.png)

![](https://oss.javaguide.cn/p3-juejin/dee15f93e65d44d384345a03404f3481~tplv-k3u1fbpfcp-zoom-1.png)

Trên đây là thử nghiệm trên MySQL 5.x của tôi. Thực ra, **từ MySQL 8.0 trở đi, bản ghi thay đổi giá trị auto-increment được đặt trong redo log, cung cấp khả năng persist giá trị auto-increment** — tức triển khai "nếu restart, giá trị auto-increment của bảng có thể khôi phục về giá trị trước khi MySQL restart".

Tức với ví dụ trên, sau khi restart instance, AUTO_INCREMENT của bảng này vẫn là 2.

Sau khi hiểu giá trị auto-increment của MySQL được lưu ở đâu, hãy xem cơ chế modify giá trị auto-increment, từ đó dẫn ra tình huống đầu tiên giá trị auto-increment không liên tục.

## Các tình huống auto-increment không liên tục

### Tình huống 1

Trong MySQL, nếu field id được định nghĩa là AUTO_INCREMENT, khi insert một row data, hành vi của giá trị auto-increment như sau:

- Nếu khi insert data, field id được chỉ định là 0, null hoặc không chỉ định giá trị, thì điền giá trị AUTO_INCREMENT hiện tại của bảng vào auto-increment field.
- Nếu khi insert data, field id được chỉ định giá trị cụ thể, thì dùng trực tiếp giá trị chỉ định trong câu lệnh.

Dựa trên quan hệ lớn/nhỏ giữa giá trị cần insert và giá trị auto-increment hiện tại, kết quả thay đổi giá trị auto-increment cũng khác nhau. Giả sử giá trị cần insert là `insert_num`, giá trị auto-increment hiện tại là `autoIncrement_num`:

- Nếu `insert_num < autoIncrement_num`: giá trị auto-increment của bảng không thay đổi.
- Nếu `insert_num >= autoIncrement_num`: cần modify giá trị auto-increment hiện tại thành giá trị auto-increment mới.

Tức là, nếu id được insert là 100, auto-increment hiện tại là 90, `insert_num >= autoIncrement_num`, thì giá trị auto-increment sẽ được modify thành giá trị auto-increment mới là 101.

Nhất thiết như vậy không?

Không hẳn~

Ai biết về distributed id chắc biết, để tránh primary key của hai library xung đột nhau, có thể cho một library có auto-increment id toàn số lẻ, library kia toàn số chẵn.

Số lẻ hay số chẵn này thực ra được quyết định bởi hai tham số `auto_increment_offset` và `auto_increment_increment` — biểu thị giá trị khởi đầu và bước nhảy của auto-increment, giá trị mặc định đều là 1.

Vì vậy, trong ví dụ trên, bước tạo giá trị auto-increment mới thực ra như thế này: Bắt đầu từ `auto_increment_offset`, bước nhảy là `auto_increment_increment`, cộng dần liên tục cho đến khi tìm được giá trị đầu tiên lớn hơn 100, làm giá trị auto-increment mới.

Vì vậy trong trường hợp này, giá trị auto-increment có thể là 102, 103, v.v. — dẫn đến primary key id không liên tục.

Đáng tiếc hơn, ngay cả khi cả hai tham số auto-increment initial value và step đều đặt là 1, auto-increment primary key id cũng không chắc đảm bảo liên tục.

### Tình huống 2

Ví dụ: Bây giờ insert một record (null, 1, 1) vào bảng, primary key tạo ra là 1, AUTO_INCREMENT=2, đúng chứ.

![](https://oss.javaguide.cn/p3-juejin/c22c4f2cea234c7ea496025eb826c3bc~tplv-k3u1fbpfcp-zoom-1.png)

Lúc này thực thi thêm lệnh insert `(null,1,1)`, rõ ràng sẽ báo lỗi `Duplicate entry` vì chúng ta đặt một unique index field `a`:

![](https://oss.javaguide.cn/p3-juejin/c0325e31398d4fa6bb1cbe08ef797b7f~tplv-k3u1fbpfcp-zoom-1.png)

Nhưng bạn sẽ ngạc nhiên khi thấy rằng dù insert thất bại, giá trị auto-increment vẫn tăng từ 2 lên 3!

Tại sao vậy?

Phân tích flow thực thi của câu insert này:

1. Executor gọi InnoDB engine interface chuẩn bị insert một row record (null, 1, 1).
2. InnoDB nhận thấy user không chỉ định giá trị auto-increment id, lấy giá trị auto-increment hiện tại của bảng `test_pk` là 2.
3. Đổi record đưa vào thành (2, 1, 1).
4. Đổi giá trị auto-increment của bảng thành 3.
5. Tiếp tục thực thi thao tác insert data. Vì đã tồn tại record a=1 nên báo Duplicate key error, câu lệnh trả về.

Có thể thấy thao tác modify giá trị auto-increment xảy ra trước khi thực sự thực thi insert data.

Khi câu lệnh này thực sự thực thi, vì gặp unique key a conflict nên row id=2 không insert thành công, nhưng giá trị auto-increment cũng không được đổi lại. Vì vậy, khi insert data row mới tiếp theo, giá trị auto-increment id lấy được là 3. Tức là đã xảy ra tình huống auto-increment primary key không liên tục.

Đến đây đã liệt kê hai tình huống auto-increment primary key không liên tục:

1. Auto-increment initial value và auto-increment step không đặt là 1.
2. Unique key conflict.

Ngoài ra, transaction rollback cũng gây ra tình huống này.

### Tình huống 3

Bây giờ bảng có một record `(1, 1, 1)`, AUTO_INCREMENT = 3:

![](https://oss.javaguide.cn/p3-juejin/6220fcf7dac54299863e43b6fb97de3e~tplv-k3u1fbpfcp-zoom-1.png)

Trước tiên insert một row data `(null, 2, 2)`, tức (3, 2, 2), và AUTO_INCREMENT thành 4:

![](https://oss.javaguide.cn/p3-juejin/3f02d46437d643c3b3d9f44a004ab269~tplv-k3u1fbpfcp-zoom-1.png)

Rồi thực thi đoạn SQL này:

![](https://oss.javaguide.cn/p3-juejin/faf5ce4a2920469cae697f845be717f5~tplv-k3u1fbpfcp-zoom-1.png)

Dù đã insert record (null, 3, 3) nhưng đã dùng rollback để rollback lại, nên trong database không có record này:

![](https://oss.javaguide.cn/p3-juejin/6cb4c02722674dd399939d3d03a431c1~tplv-k3u1fbpfcp-zoom-1.png)

Trong tình huống transaction rollback này, giá trị auto-increment không rollback theo! Như hình dưới, giá trị auto-increment vẫn cố tăng từ 4 lên 5:

![](https://oss.javaguide.cn/p3-juejin/e6eea1c927424ac7bda34a511ca521ae~tplv-k3u1fbpfcp-zoom-1.png)

Vì vậy khi insert thêm một data (null, 3, 3), primary key id sẽ tự động được gán là `5`:

![](https://oss.javaguide.cn/p3-juejin/80da69dd13b543c4a32d6ed832a3c568~tplv-k3u1fbpfcp-zoom-1.png)

Vậy tại sao khi xảy ra unique key conflict hay rollback, MySQL không đổi giá trị auto-increment của bảng về lại? Nếu rollback về thì không còn auto-increment id không liên tục nữa?

Thực ra lý do chính làm vậy là để cải thiện performance.

Dùng proof by contradiction để chứng minh: Giả sử MySQL rollback giá trị auto-increment khi transaction rollback, điều gì sẽ xảy ra?

Có hai transaction A và B chạy song song. Khi xin giá trị auto-increment, để tránh hai transaction xin được cùng id, chắc chắn phải lock, rồi xin theo thứ tự.

1. Giả sử transaction A xin được id=1, transaction B xin được id=2, lúc này giá trị auto-increment của bảng t là 3, tiếp tục thực thi.
2. Transaction B commit thành công, nhưng transaction A gặp unique key conflict — row id=1 insert thất bại. Nếu cho phép transaction A rollback auto-increment id về, tức đổi giá trị auto-increment hiện tại của bảng về 1, thì sẽ xảy ra: bảng đã có row id=2, nhưng giá trị auto-increment hiện tại là 1.
3. Tiếp tục, các transaction khác sẽ xin được id=2. Lúc này câu insert báo lỗi "primary key conflict".

![](https://oss.javaguide.cn/p3-juejin/5f26f02e60f643c9a7cab88a9f1bdce9~tplv-k3u1fbpfcp-zoom-1.png)

Để giải quyết primary key conflict này có hai cách:

1. Trước mỗi lần xin id, kiểm tra trước xem id đó đã tồn tại trong bảng chưa. Nếu có thì bỏ qua.
2. Mở rộng phạm vi lock auto-increment id — phải đợi một transaction thực thi xong và commit, transaction tiếp theo mới xin auto-increment id được.

Rõ ràng, chi phí của hai cách trên đều khá cao, dẫn đến vấn đề performance. Nguyên nhân sâu xa là giả định "cho phép auto-increment id rollback" của chúng ta.

Do đó, InnoDB từ bỏ thiết kế này — câu lệnh thực thi thất bại cũng không rollback auto-increment id. Chính vì vậy mà chỉ đảm bảo auto-increment id tăng dần, không đảm bảo liên tục.

Tóm lại, đã phân tích ba tình huống giá trị auto-increment không liên tục. Còn tình huống thứ tư: batch insert data.

### Tình huống 4

Với các câu lệnh batch insert data, MySQL có một chiến lược xin auto-increment id theo batch:

1. Trong quá trình thực thi câu lệnh, lần đầu tiên xin auto-increment id sẽ được cấp 1 cái.
2. Sau khi dùng hết 1 cái, lần thứ hai câu lệnh xin auto-increment id sẽ được cấp 2 cái.
3. Sau khi dùng hết 2 cái, vẫn câu lệnh đó, lần thứ ba xin auto-increment id sẽ được cấp 4 cái.
4. Cứ thế, cùng câu lệnh xin auto-increment id, mỗi lần xin được số auto-increment id gấp đôi lần trước.

Lưu ý, "batch insert data" ở đây không phải câu insert thông thường chứa nhiều value! Vì loại câu lệnh này khi xin auto-increment id, có thể tính chính xác cần bao nhiêu id, rồi xin một lần, xin xong là lock có thể release.

Còn với các câu lệnh kiểu `insert...select`, `replace...select` và `load data`, MySQL không biết cần xin bao nhiêu id, nên áp dụng chiến lược xin batch này — vì xin từng cái một thực sự quá chậm.

Ví dụ: Giả sử bảng hiện tại có dữ liệu sau:

![](https://oss.javaguide.cn/p3-juejin/6453cfc107f94e3bb86c95072d443472~tplv-k3u1fbpfcp-zoom-1.png)

Tạo bảng `test_pk2` có cùng định nghĩa cấu trúc với bảng `test_pk` hiện tại:

![](https://oss.javaguide.cn/p3-juejin/45248a6dc34f431bba14d434bee2c79e~tplv-k3u1fbpfcp-zoom-1.png)

Dùng `insert...select` để batch insert data vào bảng `test_pk2`:

![](https://oss.javaguide.cn/p3-juejin/c1b061e86bae484694d15ceb703b10ca~tplv-k3u1fbpfcp-zoom-1.png)

Có thể thấy import data thành công.

Xem lại giá trị auto-increment của `test_pk2` là bao nhiêu:

![](https://oss.javaguide.cn/p3-juejin/0ff9039366154c738331d64ebaf88d3b~tplv-k3u1fbpfcp-zoom-1.png)

Như đã phân tích, là 8 chứ không phải 6.

Cụ thể, `insert...select` thực tế insert 5 row data vào bảng: (1,1)(2,2)(3,3)(4,4)(5,5). Nhưng 5 row này được xin auto-increment id trong 3 lần. Kết hợp chiến lược xin batch, mỗi lần xin được số auto-increment id gấp đôi lần trước, nên:

- Lần đầu xin được 1 id: id=1
- Lần hai được cấp 2 id: id=2 và id=3
- Lần ba được cấp 4 id: id=4, id=5, id=6, id=7

Vì câu lệnh này thực tế chỉ dùng 5 id, nên id=6 và id=7 bị lãng phí. Sau đó, thực thi `insert into test_pk2 values(null, 6, 6)`, data thực sự insert là (8, 6, 6):

![](https://oss.javaguide.cn/p3-juejin/51612fbac3804cff8c5157df21d6e355~tplv-k3u1fbpfcp-zoom-1.png)

## Tổng kết ngắn

Bài này tóm tắt 4 tình huống auto-increment không liên tục:

1. Auto-increment initial value và auto-increment step không đặt là 1.
2. Unique key conflict.
3. Transaction rollback.
4. Batch insert (như câu lệnh `insert...select`).
