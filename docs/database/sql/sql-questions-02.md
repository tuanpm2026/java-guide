---
title: Tổng hợp câu hỏi phỏng vấn SQL thường gặp (2)
description: Phần 2 tổng hợp câu hỏi phỏng vấn SQL thường gặp, giải thích chi tiết các câu lệnh DML như INSERT, UPDATE, DELETE, bao gồm các kỹ thuật thực tế như chèn hàng loạt, nhập từ bảng khác, chèn có cập nhật, v.v.
category: Cơ sở dữ liệu
tag:
  - Kiến thức cơ bản về cơ sở dữ liệu
  - SQL
head:
  - - meta
    - name: keywords
      content: SQL面试题,INSERT插入,UPDATE更新,DELETE删除,批量插入,REPLACE INTO,数据操作
---

> Nguồn đề bài: [Nowcoder - SQL Advanced Challenge](https://www.nowcoder.com/exam/oj?page=1&tab=SQL%E7%AF%87&topicId=240)

## Thao tác thêm, xóa, sửa

Tổng hợp các cách chèn bản ghi trong SQL:

- **Chèn thông thường (tất cả các trường)**: `INSERT INTO table_name VALUES (value1, value2, ...)`
- **Chèn thông thường (chỉ định trường)**: `INSERT INTO table_name (column1, column2, ...) VALUES (value1, value2, ...)`
- **Chèn nhiều bản ghi cùng lúc**: `INSERT INTO table_name (column1, column2, ...) VALUES (value1_1, value1_2, ...), (value2_1, value2_2, ...), ...`
- **Nhập từ bảng khác**: `INSERT INTO table_name SELECT * FROM table_name2 [WHERE key=value]`
- **Chèn có cập nhật**: `REPLACE INTO table_name VALUES (value1, value2, ...)` (lưu ý nguyên lý của cách này là khi phát hiện khóa chính hoặc khóa chỉ mục duy nhất bị trùng sẽ xóa bản ghi cũ rồi chèn lại)

### Chèn bản ghi (1)

**Mô tả**: Backend Nowcoder sẽ ghi lại lịch sử làm bài thi của mỗi người dùng vào bảng `exam_record`. Hiện có chi tiết lịch sử làm bài của hai người dùng như sau:

- Người dùng 1001 bắt đầu làm bài thi 9001 vào lúc 10 giờ 11 phút 12 giây tối ngày 1 tháng 9 năm 2021, nộp bài sau 50 phút, đạt 90 điểm;
- Người dùng 1002 bắt đầu làm bài thi 9002 vào lúc 7 giờ 1 phút 2 giây sáng ngày 4 tháng 9 năm 2021, và thoát khỏi nền tảng sau 10 phút.

Bảng lịch sử làm bài `exam_record` đã được tạo, cấu trúc như sau. Vui lòng dùng một câu lệnh để chèn hai bản ghi này vào bảng.

| Filed       | Type       | Null | Key | Extra          | Default | Comment           |
| ----------- | ---------- | ---- | --- | -------------- | ------- | ----------------- |
| id          | int(11)    | NO   | PRI | auto_increment | (NULL)  | ID tự tăng        |
| uid         | int(11)    | NO   |     |                | (NULL)  | ID người dùng     |
| exam_id     | int(11)    | NO   |     |                | (NULL)  | ID bài thi        |
| start_time  | datetime   | NO   |     |                | (NULL)  | Thời gian bắt đầu |
| submit_time | datetime   | YES  |     |                | (NULL)  | Thời gian nộp     |
| score       | tinyint(4) | YES  |     |                | (NULL)  | Điểm số           |

**Đáp án**:

```sql
// 存在自增主键，无需手动赋值
INSERT INTO exam_record (uid, exam_id, start_time, submit_time, score) VALUES
(1001, 9001, '2021-09-01 22:11:12', '2021-09-01 23:01:12', 90),
(1002, 9002, '2021-09-04 07:01:02', NULL, NULL);
```

### Chèn bản ghi (2)

**Mô tả**: Hiện có bảng lịch sử làm bài `exam_record`, cấu trúc như bảng dưới đây. Bảng chứa lịch sử làm bài thi của người dùng qua nhiều năm. Do dữ liệu ngày càng nhiều, việc bảo trì ngày càng khó khăn, cần tinh gọn nội dung bảng và sao lưu dữ liệu lịch sử.

Bảng `exam_record`:

| Filed       | Type       | Null | Key | Extra          | Default | Comment           |
| ----------- | ---------- | ---- | --- | -------------- | ------- | ----------------- |
| id          | int(11)    | NO   | PRI | auto_increment | (NULL)  | ID tự tăng        |
| uid         | int(11)    | NO   |     |                | (NULL)  | ID người dùng     |
| exam_id     | int(11)    | NO   |     |                | (NULL)  | ID bài thi        |
| start_time  | datetime   | NO   |     |                | (NULL)  | Thời gian bắt đầu |
| submit_time | datetime   | YES  |     |                | (NULL)  | Thời gian nộp     |
| score       | tinyint(4) | YES  |     |                | (NULL)  | Điểm số           |

Chúng tôi đã tạo một bảng mới `exam_record_before_2021` để sao lưu lịch sử làm bài trước năm 2021, cấu trúc giống với bảng `exam_record`. Vui lòng nhập các bản ghi lịch sử làm bài đã hoàn thành trước năm 2021 vào bảng đó.

**Đáp án**:

```sql
INSERT INTO exam_record_before_2021 (uid, exam_id, start_time, submit_time, score)
SELECT uid,exam_id,start_time,submit_time,score
FROM exam_record
WHERE YEAR(submit_time) < 2021;
```

### Chèn bản ghi (3)

**Mô tả**: Hiện có một bộ đề thi SQL khó (ID 9003), thời lượng một tiếng rưỡi. Hãy chèn thời điểm 2021-01-01 00:00:00 làm thời gian phát hành vào bảng thông tin đề thi `examination_info`. Dù bài thi với ID đó có tồn tại hay không, đều phải chèn thành công.

Bảng thông tin đề thi `examination_info`:

| Filed        | Type        | Null | Key | Extra          | Default | Comment             |
| ------------ | ----------- | ---- | --- | -------------- | ------- | ------------------- |
| id           | int(11)     | NO   | PRI | auto_increment | (NULL)  | ID tự tăng          |
| exam_id      | int(11)     | NO   | UNI |                | (NULL)  | ID bài thi          |
| tag          | varchar(32) | YES  |     |                | (NULL)  | Nhãn danh mục       |
| difficulty   | varchar(8)  | YES  |     |                | (NULL)  | Độ khó              |
| duration     | int(11)     | NO   |     |                | (NULL)  | Thời lượng (phút)   |
| release_time | datetime    | YES  |     |                | (NULL)  | Thời gian phát hành |

**Đáp án**:

```sql
REPLACE INTO examination_info VALUES
 (NULL, 9003, "SQL", "hard", 90, "2021-01-01 00:00:00");
```

### Cập nhật bản ghi (1)

**Mô tả**: Hiện có bảng thông tin đề thi `examination_info`, cấu trúc như sau:

| Filed        | Type     | Null | Key | Extra          | Default | Comment             |
| ------------ | -------- | ---- | --- | -------------- | ------- | ------------------- |
| id           | int(11)  | NO   | PRI | auto_increment | (NULL)  | ID tự tăng          |
| exam_id      | int(11)  | NO   | UNI |                | (NULL)  | ID bài thi          |
| tag          | char(32) | YES  |     |                | (NULL)  | Nhãn danh mục       |
| difficulty   | char(8)  | YES  |     |                | (NULL)  | Độ khó              |
| duration     | int(11)  | NO   |     |                | (NULL)  | Thời lượng          |
| release_time | datetime | YES  |     |                | (NULL)  | Thời gian phát hành |

Hãy sửa tất cả trường `tag` có giá trị `PYTHON` trong bảng **examination_info** thành `Python`.

**Hướng giải**: Bài này có hai hướng giải, cách dễ nghĩ nhất là dùng `update + where` để chỉ định điều kiện cập nhật trực tiếp, cách thứ hai là tìm và thay thế dựa trên trường cần sửa.

**Đáp án 1**:

```sql
UPDATE examination_info SET tag = 'Python' WHERE tag='PYTHON'
```

**Đáp án 2**:

```sql
UPDATE examination_info
SET tag = REPLACE(tag,'PYTHON','Python')

# REPLACE (目标字段，"查找内容","替换内容")
```

### Cập nhật bản ghi (2)

**Mô tả**: Hiện có bảng lịch sử làm bài exam_record, chứa lịch sử làm bài thi của người dùng qua nhiều năm, cấu trúc như bảng dưới: Bảng lịch sử làm bài `exam_record`: **`submit_time`** là thời gian hoàn thành (lưu ý câu này)

| Filed       | Type       | Null | Key | Extra          | Default | Comment           |
| ----------- | ---------- | ---- | --- | -------------- | ------- | ----------------- |
| id          | int(11)    | NO   | PRI | auto_increment | (NULL)  | ID tự tăng        |
| uid         | int(11)    | NO   |     |                | (NULL)  | ID người dùng     |
| exam_id     | int(11)    | NO   |     |                | (NULL)  | ID bài thi        |
| start_time  | datetime   | NO   |     |                | (NULL)  | Thời gian bắt đầu |
| submit_time | datetime   | YES  |     |                | (NULL)  | Thời gian nộp     |
| score       | tinyint(4) | YES  |     |                | (NULL)  | Điểm số           |

**Yêu cầu**: Hãy sửa tất cả các bản ghi chưa hoàn thành trong bảng `exam_record` bắt đầu làm bài ==trước== ngày 1 tháng 9 năm 2021 thành hoàn thành thụ động, tức là: đổi thời gian hoàn thành thành '2099-01-01 00:00:00', điểm số thành 0.

**Hướng giải**: Chú ý các từ khóa trong đề bài (đã được làm nổi bật) — điều kiện `"trước xxx thời gian"`, ngay lập tức cần nghĩ đến so sánh thời gian, có thể dùng trực tiếp `xxx_time < "2021-09-01 00:00:00"` hoặc dùng hàm `date()` để so sánh; điều kiện thứ hai là `"chưa hoàn thành"`, tức là thời gian hoàn thành là NULL, nghĩa là `submit_time IS NULL` trong bảng.

**Đáp án**:

```sql
UPDATE exam_record SET submit_time = '2099-01-01 00:00:00', score = 0 WHERE DATE(start_time) < "2021-09-01" AND submit_time IS null
```

### Xóa bản ghi (1)

**Mô tả**: Hiện có bảng lịch sử làm bài `exam_record`, chứa lịch sử làm bài thi của người dùng qua nhiều năm, cấu trúc như bảng dưới:

Bảng lịch sử làm bài `exam_record:` **`start_time`** là thời gian bắt đầu làm bài, `submit_time` là thời gian nộp bài, tức là thời gian kết thúc.

| Filed       | Type       | Null | Key | Extra          | Default | Comment           |
| ----------- | ---------- | ---- | --- | -------------- | ------- | ----------------- |
| id          | int(11)    | NO   | PRI | auto_increment | (NULL)  | ID tự tăng        |
| uid         | int(11)    | NO   |     |                | (NULL)  | ID người dùng     |
| exam_id     | int(11)    | NO   |     |                | (NULL)  | ID bài thi        |
| start_time  | datetime   | NO   |     |                | (NULL)  | Thời gian bắt đầu |
| submit_time | datetime   | YES  |     |                | (NULL)  | Thời gian nộp     |
| score       | tinyint(4) | YES  |     |                | (NULL)  | Điểm số           |

**Yêu cầu**: Hãy xóa các bản ghi trong bảng `exam_record` có thời gian làm bài dưới 5 phút và điểm số không đạt (ngưỡng đạt là 60 điểm);

**Hướng giải**: Dù đây là bài luyện xóa, nhưng thực ra đang kiểm tra cách sử dụng hàm thời gian. Để so sánh số phút được đề cập ở đây, các hàm thường dùng là **`TIMEDIFF`** và **`TIMESTAMPDIFF`**, hai hàm này có sự khác biệt nhỏ về cách dùng, hàm sau linh hoạt hơn, tùy theo thói quen cá nhân.

1.　 `TIMEDIFF`: Sự chênh lệch giữa hai thời điểm

```sql
TIMEDIFF(time1, time2)
```

Cả hai tham số đều bắt buộc, đều là biểu thức thời gian hoặc ngày giờ. Nếu tham số không hợp lệ hoặc là NULL, hàm sẽ trả về NULL.

Với bài này, có thể dùng trong hàm MINUTE, vì TIMEDIFF tính ra là giá trị chênh lệch thời gian, bọc ngoài bằng hàm MINUTE thì tính ra số phút.

2. `TIMESTAMPDIFF`: Dùng để tính chênh lệch thời gian giữa hai ngày

```sql
TIMESTAMPDIFF(unit,datetime_expr1,datetime_expr2)
# 参数说明
#unit: 日期比较返回的时间差单位，常用可选值如下:
SECOND：秒
MINUTE：分钟
HOUR：小时
DAY：天
WEEK：星期
MONTH：月
QUARTER：季度
YEAR：年
# TIMESTAMPDIFF函数返回datetime_expr2 - datetime_expr1的结果（人话： 后面的 - 前面的  即2-1），其中datetime_expr1和datetime_expr2可以是DATE或DATETIME类型值（人话：可以是"2023-01-01"， 也可以是"2023-01-01- 00:00:00"）
```

Bài này cần so sánh phút, vì vậy là TIMESTAMPDIFF(MINUTE, thời gian bắt đầu, thời gian kết thúc) < 5

**Đáp án**:

```sql
DELETE FROM exam_record WHERE MINUTE (TIMEDIFF(submit_time , start_time)) < 5 AND score < 60
```

```sql
DELETE FROM exam_record WHERE TIMESTAMPDIFF(MINUTE, start_time, submit_time) < 5 AND score < 60
```

### Xóa bản ghi (2)

**Mô tả**: Hiện có bảng lịch sử làm bài `exam_record`, chứa lịch sử làm bài thi của người dùng qua nhiều năm, cấu trúc như bảng dưới:

Bảng lịch sử làm bài `exam_record`: `start_time` là thời gian bắt đầu làm bài, `submit_time` là thời gian nộp bài, tức là thời gian kết thúc, nếu chưa hoàn thành thì để trống.

| Filed       | Type       | Null | Key | Extra          | Default | Comment           |
| ----------- | ---------- | :--: | --- | -------------- | ------- | ----------------- |
| id          | int(11)    |  NO  | PRI | auto_increment | (NULL)  | ID tự tăng        |
| uid         | int(11)    |  NO  |     |                | (NULL)  | ID người dùng     |
| exam_id     | int(11)    |  NO  |     |                | (NULL)  | ID bài thi        |
| start_time  | datetime   |  NO  |     |                | (NULL)  | Thời gian bắt đầu |
| submit_time | datetime   | YES  |     |                | (NULL)  | Thời gian nộp     |
| score       | tinyint(4) | YES  |     |                | (NULL)  | Điểm số           |

**Yêu cầu**: Hãy xóa 3 bản ghi bắt đầu làm bài sớm nhất trong số các bản ghi chưa hoàn thành làm bài ==hoặc== thời gian làm bài dưới 5 phút trong bảng `exam_record`.

**Hướng giải**: Bài này tương đối đơn giản, nhưng cần chú ý thông tin trong đề bài: thời gian kết thúc, nếu chưa hoàn thành thì để trống — đây thực ra là một điều kiện.

Điều kiện còn lại là dưới 5 phút, tương tự bài trên, nhưng ở đây là **hoặc**, tức là thỏa mãn một trong hai điều kiện là được; ngoài ra còn kiểm tra nhẹ cách dùng ORDER BY và LIMIT.

**Đáp án**:

```sql
DELETE FROM exam_record WHERE submit_time IS null OR TIMESTAMPDIFF(MINUTE, start_time, submit_time) < 5
ORDER BY start_time
LIMIT 3
# 默认就是asc， desc是降序排列
```

### Xóa bản ghi (3)

**Mô tả**: Hiện có bảng lịch sử làm bài exam_record, chứa lịch sử làm bài thi của người dùng qua nhiều năm, cấu trúc như bảng dưới:

| Filed       | Type       | Null | Key | Extra          | Default | Comment           |
| ----------- | ---------- | :--: | --- | -------------- | ------- | ----------------- |
| id          | int(11)    |  NO  | PRI | auto_increment | (NULL)  | ID tự tăng        |
| uid         | int(11)    |  NO  |     |                | (NULL)  | ID người dùng     |
| exam_id     | int(11)    |  NO  |     |                | (NULL)  | ID bài thi        |
| start_time  | datetime   |  NO  |     |                | (NULL)  | Thời gian bắt đầu |
| submit_time | datetime   | YES  |     |                | (NULL)  | Thời gian nộp     |
| score       | tinyint(4) | YES  |     |                | (NULL)  | Điểm số           |

**Yêu cầu**: Hãy xóa tất cả bản ghi trong bảng `exam_record` và ==đặt lại khóa chính tự tăng==

**Hướng giải**: Bài này kiểm tra sự khác biệt giữa ba câu lệnh xóa, chú ý phần được làm nổi bật, yêu cầu đặt lại khóa chính;

- `DROP`: Xóa bảng, xóa cấu trúc bảng, không thể hoàn tác
- `TRUNCATE`: Định dạng lại bảng, không xóa cấu trúc bảng, không thể hoàn tác
- `DELETE`: Xóa dữ liệu, có thể hoàn tác

Lý do chọn `TRUNCATE` là: TRUNCATE chỉ có thể áp dụng cho bảng; `TRUNCATE` sẽ xóa tất cả các hàng trong bảng nhưng cấu trúc bảng cùng các ràng buộc, chỉ mục, v.v. vẫn được giữ nguyên; `TRUNCATE` sẽ đặt lại giá trị tự tăng của bảng; sau khi dùng `TRUNCATE`, không gian mà bảng và chỉ mục chiếm dụng sẽ được phục hồi về kích thước ban đầu.

Bài này cũng có thể dùng `DELETE`, nhưng sau khi xóa, cần phải thủ công `ALTER` cấu trúc bảng để đặt lại giá trị ban đầu của khóa chính;

Tương tự cũng có thể dùng `DROP`, xóa toàn bộ bảng bao gồm cả cấu trúc, rồi tạo lại bảng.

**Đáp án**:

```sql
TRUNCATE  exam_record;
```

## Thao tác bảng và chỉ mục

### Tạo bảng mới

**Mô tả**: Hiện có bảng thông tin người dùng chứa thông tin người dùng đã đăng ký trên nền tảng qua nhiều năm. Khi nền tảng Nowcoder không ngừng phát triển, lượng người dùng tăng trưởng nhanh chóng. Để phục vụ hiệu quả những người dùng hoạt động tích cực, cần tách một phần người dùng ra thành một bảng mới.

Bảng thông tin người dùng ban đầu:

| Filed         | Type        | Null | Key | Default           | Extra          | Comment           |
| ------------- | ----------- | ---- | --- | ----------------- | -------------- | ----------------- |
| id            | int(11)     | NO   | PRI | (NULL)            | auto_increment | ID tự tăng        |
| uid           | int(11)     | NO   | UNI | (NULL)            |                | ID người dùng     |
| nick_name     | varchar(64) | YES  |     | (NULL)            |                | Biệt danh         |
| achievement   | int(11)     | YES  |     | 0                 |                | Điểm thành tích   |
| level         | int(11)     | YES  |     | (NULL)            |                | Cấp độ người dùng |
| job           | varchar(32) | YES  |     | (NULL)            |                | Hướng nghề nghiệp |
| register_time | datetime    | YES  |     | CURRENT_TIMESTAMP |                | Thời gian đăng ký |

Với tư cách là nhà phân tích dữ liệu, hãy **tạo bảng thông tin người dùng VIP user_info_vip**, cấu trúc giống với bảng thông tin người dùng.

Kết quả bạn cần trả về như bảng dưới, hãy viết câu lệnh tạo bảng ghi lại tất cả các ràng buộc và mô tả trong bảng.

| Filed         | Type        | Null | Key | Default           | Extra          | Comment           |
| ------------- | ----------- | ---- | --- | ----------------- | -------------- | ----------------- |
| id            | int(11)     | NO   | PRI | (NULL)            | auto_increment | ID tự tăng        |
| uid           | int(11)     | NO   | UNI | (NULL)            |                | ID người dùng     |
| nick_name     | varchar(64) | YES  |     | (NULL)            |                | Biệt danh         |
| achievement   | int(11)     | YES  |     | 0                 |                | Điểm thành tích   |
| level         | int(11)     | YES  |     | (NULL)            |                | Cấp độ người dùng |
| job           | varchar(32) | YES  |     | (NULL)            |                | Hướng nghề nghiệp |
| register_time | datetime    | YES  |     | CURRENT_TIMESTAMP |                | Thời gian đăng ký |

**Hướng giải**: Nếu bài cho tên bảng cũ, có thể dùng trực tiếp `create table bảng mới as select * from bảng cũ;`. Nhưng bài này không cho tên bảng cũ, nên cần tự tạo. Chú ý tạo giá trị mặc định và khóa, khá đơn giản. (Lưu ý: nếu thực thi trên Nowcoder, chú ý comment trong bảng phải giống với comment trong đề bài, bao gồm cả hoa thường, nếu không sẽ không qua; ngoài ra bộ ký tự cũng phải được thiết lập)

Đáp án:

```sql
CREATE TABLE IF NOT EXISTS user_info_vip(
    id INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT'自增ID',
    uid INT(11) UNIQUE NOT NULL COMMENT '用户ID',
    nick_name VARCHAR(64) COMMENT'昵称',
    achievement INT(11) DEFAULT 0 COMMENT '成就值',
    `level` INT(11) COMMENT '用户等级',
    job VARCHAR(32) COMMENT '职业方向',
    register_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间'
)CHARACTER SET UTF8
```

### Sửa bảng

**Mô tả**: Hiện có bảng thông tin người dùng `user_info`, chứa thông tin người dùng đã đăng ký trên nền tảng qua nhiều năm.

**Bảng thông tin người dùng `user_info`:**

| Filed         | Type        | Null | Key | Default           | Extra          | Comment           |
| ------------- | ----------- | ---- | --- | ----------------- | -------------- | ----------------- |
| id            | int(11)     | NO   | PRI | (NULL)            | auto_increment | ID tự tăng        |
| uid           | int(11)     | NO   | UNI | (NULL)            |                | ID người dùng     |
| nick_name     | varchar(64) | YES  |     | (NULL)            |                | Biệt danh         |
| achievement   | int(11)     | YES  |     | 0                 |                | Điểm thành tích   |
| level         | int(11)     | YES  |     | (NULL)            |                | Cấp độ người dùng |
| job           | varchar(32) | YES  |     | (NULL)            |                | Hướng nghề nghiệp |
| register_time | datetime    | YES  |     | CURRENT_TIMESTAMP |                | Thời gian đăng ký |

**Yêu cầu:** Hãy thêm vào bảng thông tin người dùng, sau trường `level`, một cột `school` có thể lưu tối đa 15 ký tự Hán; đổi tên cột `job` thành `profession` đồng thời thay đổi độ dài trường `varchar` thành 10; đặt giá trị mặc định của `achievement` là 0.

**Hướng giải**: Trước tiên cần hiểu cú pháp cơ bản của câu lệnh ALTER:

- Thêm một cột: `ALTER TABLE tên_bảng ADD COLUMN tên_cột kiểu_dữ_liệu 【first | after tên_trường】;` (first: thêm trước một cột nào đó, after thì ngược lại)
- Sửa kiểu hoặc ràng buộc của cột: `ALTER TABLE tên_bảng MODIFY COLUMN tên_cột kiểu_mới 【ràng_buộc_mới】;`
- Đổi tên cột: `ALTER TABLE tên_bảng change COLUMN tên_cột_cũ tên_cột_mới kiểu;`
- Xóa cột: `ALTER TABLE tên_bảng drop COLUMN tên_cột;`
- Đổi tên bảng: `ALTER TABLE tên_bảng rename 【to】 tên_bảng_mới;`
- Đưa một cột lên đầu tiên: `ALTER TABLE tên_bảng MODIFY COLUMN tên_cột kiểu first;`

Từ khóa `COLUMN` thực ra có thể bỏ qua, ở đây liệt kê ra để đảm bảo chuẩn.

Khi sửa, nếu có nhiều mục cần sửa, có thể viết gộp lại, nhưng chú ý định dạng.

**Đáp án**:

```sql
ALTER TABLE user_info
    ADD school VARCHAR(15) AFTER level,
    CHANGE job profession VARCHAR(10),
    MODIFY achievement INT(11) DEFAULT 0;
```

### Xóa bảng

**Mô tả**: Hiện có bảng lịch sử làm bài `exam_record`, chứa lịch sử làm bài thi của người dùng qua nhiều năm. Thông thường mỗi năm đều tạo một bảng sao lưu `exam_record_{YEAR}` cho bảng `exam_record`, với `{YEAR}` là năm tương ứng.

Bây giờ khi dữ liệu ngày càng nhiều, bộ nhớ đang cạn kiệt. Hãy xóa tất cả các bảng sao lưu từ rất lâu trước (từ năm 2011 đến 2014) nếu chúng tồn tại.

**Hướng giải**: Bài này rất đơn giản, xóa trực tiếp thôi. Nếu muốn gọn hơn, có thể ngăn cách các bảng cần xóa bằng dấu phẩy và viết trên một dòng. Nếu cần xóa rất nhiều bảng, hoàn toàn có thể viết script để xóa.

**Đáp án**:

```sql
DROP TABLE IF EXISTS exam_record_2011;
DROP TABLE IF EXISTS exam_record_2012;
DROP TABLE IF EXISTS exam_record_2013;
DROP TABLE IF EXISTS exam_record_2014;
```

### Tạo chỉ mục

**Mô tả**: Hiện có bảng thông tin đề thi `examination_info`, chứa thông tin về các loại đề thi khác nhau. Để thuận tiện hơn trong việc truy vấn bảng, cần tạo các chỉ mục sau trên bảng `examination_info`.

Quy tắc như sau: Tạo chỉ mục thông thường `idx_duration` trên cột `duration`, tạo chỉ mục duy nhất `uniq_idx_exam_id` trên cột `exam_id`, tạo chỉ mục toàn văn `full_idx_tag` trên cột `tag`.

Kết quả trả về sẽ như bảng dưới:

| examination_info | 0   | PRIMARY          | 1   | id       | A   | 0   |     |     |     | BTREE    |
| ---------------- | --- | ---------------- | --- | -------- | --- | --- | --- | --- | --- | -------- |
| examination_info | 0   | uniq_idx_exam_id | 1   | exam_id  | A   | 0   |     |     | YES | BTREE    |
| examination_info | 1   | idx_duration     | 1   | duration | A   | 0   |     |     |     | BTREE    |
| examination_info | 1   | full_idx_tag     | 1   | tag      |     | 0   |     |     | YES | FULLTEXT |

Ghi chú: Phần backend sẽ so sánh kết quả đầu ra thông qua câu lệnh `SHOW INDEX FROM examination_info`

**Hướng giải**: Trước tiên cần hiểu các loại chỉ mục thường gặp:

- Chỉ mục B-Tree: Chỉ mục B-Tree (hoặc cây cân bằng) là loại chỉ mục phổ biến và mặc định nhất. Nó phù hợp với nhiều điều kiện truy vấn khác nhau, có thể nhanh chóng tìm đến dữ liệu thỏa mãn điều kiện. Chỉ mục B-Tree phù hợp với các thao tác tìm kiếm thông thường, hỗ trợ truy vấn đẳng thức, truy vấn phạm vi và sắp xếp.
- Chỉ mục duy nhất: Chỉ mục duy nhất tương tự chỉ mục B-Tree thông thường, điểm khác biệt là nó yêu cầu giá trị của cột được lập chỉ mục phải là duy nhất. Điều này có nghĩa là khi chèn hoặc cập nhật dữ liệu, MySQL sẽ xác minh tính duy nhất của cột chỉ mục.
- Chỉ mục khóa chính: Chỉ mục khóa chính là một loại chỉ mục duy nhất đặc biệt, được dùng để xác định duy nhất mỗi hàng dữ liệu trong bảng. Mỗi bảng chỉ có thể có một chỉ mục khóa chính, nó giúp cải thiện tốc độ truy cập dữ liệu và tính toàn vẹn dữ liệu.
- Chỉ mục toàn văn: Chỉ mục toàn văn được dùng để tìm kiếm toàn văn trong dữ liệu văn bản. Nó hỗ trợ tìm kiếm từ khóa trong trường văn bản, không chỉ đơn giản là tìm kiếm đẳng thức hoặc phạm vi. Chỉ mục toàn văn phù hợp với các tình huống ứng dụng cần tìm kiếm toàn văn.

```sql
-- 示例：
-- 添加B-Tree索引：
	CREATE INDEX idx_name(索引名) ON 表名 (字段名);   -- idx_name为索引名，以下都是
-- 创建唯一索引：
	CREATE UNIQUE INDEX idx_name ON 表名 (字段名);
-- 创建一个主键索引：
	ALTER TABLE 表名 ADD PRIMARY KEY (字段名);
-- 创建一个全文索引
	ALTER TABLE 表名 ADD FULLTEXT INDEX idx_name (字段名);

-- 通过以上示例，可以看出create 和 alter 都可以添加索引
```

Với kiến thức cơ bản trên, đáp án của bài này cũng đã rõ ràng.

**Đáp án**:

```sql
ALTER TABLE examination_info
    ADD INDEX idx_duration(duration),
    ADD UNIQUE INDEX uniq_idx_exam_id(exam_id),
    ADD FULLTEXT INDEX full_idx_tag(tag);
```

### Xóa chỉ mục

**Mô tả**: Hãy xóa chỉ mục duy nhất uniq_idx_exam_id và chỉ mục toàn văn full_idx_tag trên bảng `examination_info`.

**Hướng giải**: Bài này kiểm tra cú pháp cơ bản để xóa chỉ mục:

```sql
-- 使用 DROP INDEX 删除索引
DROP INDEX idx_name ON 表名;

-- 使用 ALTER TABLE 删除索引
ALTER TABLE employees DROP INDEX idx_email;
```

Cần lưu ý: Trong MySQL, không hỗ trợ xóa nhiều chỉ mục cùng một lúc. Mỗi lần xóa chỉ mục, chỉ có thể chỉ định một tên chỉ mục để xóa.

Ngoài ra, lệnh **DROP** cần phải được dùng cẩn thận!!!

**Đáp án**:

```sql
DROP INDEX uniq_idx_exam_id ON examination_info;
DROP INDEX full_idx_tag ON examination_info;
```

<!-- @include: @article-footer.snippet.md -->
