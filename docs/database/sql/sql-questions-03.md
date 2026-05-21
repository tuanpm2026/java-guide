---
title: Tổng hợp câu hỏi phỏng vấn SQL thường gặp (3)
description: Tổng hợp câu hỏi phỏng vấn SQL phần 3, giải thích chuyên sâu về cách sử dụng các hàm tổng hợp COUNT, SUM, AVG, MAX, MIN, cùng với phân nhóm GROUP BY, lọc HAVING, tính trung bình cắt ngắn và các kỹ thuật nâng cao khác.
category: Cơ sở dữ liệu
tag:
  - Kiến thức cơ bản về cơ sở dữ liệu
  - SQL
head:
  - - meta
    - name: keywords
      content: SQL面试题,聚合函数,COUNT,SUM,AVG,MAX,MIN,GROUP BY,HAVING,截断平均值
---

> Nguồn câu hỏi: [Bộ đề luyện SQL nâng cao - NowCoder](https://www.nowcoder.com/exam/oj?page=1&tab=SQL%E7%AF%87&topicId=240)

Các câu hỏi khó hoặc rất khó có thể bỏ qua tùy theo tình huống thực tế và nhu cầu phỏng vấn của bạn.

## Hàm tổng hợp

### Trung bình cắt ngắn điểm bài thi SQL khó (khá khó)

**Mô tả**: Nhóm vận hành của Niuke muốn xem tình hình điểm số của mọi người trong các bài thi khó thuộc danh mục SQL.

Hãy giúp họ tính trung bình cắt ngắn (trung bình sau khi bỏ đi một điểm cao nhất và một điểm thấp nhất) của tất cả người dùng hoàn thành bài thi SQL khó từ bảng `exam_record`.

Dữ liệu mẫu: `examination_info` (`exam_id` ID bài thi, tag danh mục bài thi, `difficulty` độ khó, `duration` thời gian thi, `release_time` thời gian phát hành)

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2020-01-01 10:00:00 |
| 2   | 9002    | Thuật toán | medium     | 80       | 2020-08-02 10:00:00 |

Dữ liệu mẫu: `exam_record` (uid ID người dùng, exam_id ID bài thi, start_time thời gian bắt đầu, submit_time thời gian nộp bài, score điểm)

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-02 09:01:01 | 2020-01-02 09:21:01 | 80     |
| 2   | 1001 | 9001    | 2021-05-02 10:01:01 | 2021-05-02 10:30:01 | 81     |
| 3   | 1001 | 9001    | 2021-06-02 19:01:01 | 2021-06-02 19:31:01 | 84     |
| 4   | 1001 | 9002    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89     |
| 5   | 1001 | 9001    | 2021-09-02 12:01:01 | (NULL)              | (NULL) |
| 6   | 1001 | 9002    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 7   | 1002 | 9002    | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87     |
| 8   | 1002 | 9001    | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90     |
| 9   | 1003 | 9001    | 2021-09-07 12:01:01 | 2021-09-07 10:31:01 | 50     |
| 10  | 1004 | 9001    | 2021-09-06 10:01:01 | (NULL)              | (NULL) |

Kết quả truy vấn theo dữ liệu đầu vào:

| tag | difficulty | clip_avg_score |
| --- | ---------- | -------------- |
| SQL | hard       | 81.7           |

Từ bảng `examination_info` có thể biết bài thi 9001 là bài thi SQL khó, các điểm của bài thi này là [80,81,84,90,50], sau khi loại điểm cao nhất và thấp nhất còn lại [80,81,84], điểm trung bình là 81.6666667, làm tròn 1 chữ số thập phân là 81.7

**Mô tả đầu vào:**

Dữ liệu đầu vào có ít nhất 3 điểm hợp lệ

**Cách giải 1:** Để tìm bài thi SQL khó, cần join với bảng examination_info, sau đó tìm ra khóa học khó; từ examination_info biết exam_id của SQL khó là 9001, nên dùng điều kiện exam_id = 9001 để truy vấn;

Đầu tiên tìm các lần thi 9001: `select * from exam_record where exam_id = 9001`

Sau đó, tìm điểm cao nhất: `select max(score) 最高分 from exam_record where exam_id = 9001`

Tiếp theo, tìm điểm thấp nhất: `select min(score) 最低分 from exam_record where exam_id = 9001`

Trong tập kết quả điểm số truy vấn được, để loại điểm cao nhất và thấp nhất, cách trực quan nhất là dùng NOT IN hoặc NOT EXISTS, ở đây dùng NOT IN:

Trước tiên viết phần chính: `select tag, difficulty, round(avg(score), 1) clip_avg_score from examination_info info INNER JOIN exam_record record`

**Mẹo nhỏ**: Hàm `ROUND()` trong MySQL, `ROUND(X)` trả về số nguyên gần nhất với X, `ROUND(X,D)` trả về X với D chữ số thập phân, làm tròn theo quy tắc 4/5.

Ghép các mảnh câu lệnh trên lại; lưu ý trong NOT IN, hai truy vấn con được kết hợp bằng UNION ALL để tạo kết quả dạng một cột nhiều hàng.

**Đáp án 1:**

```sql
SELECT tag, difficulty, ROUND(AVG(score), 1) clip_avg_score
	FROM examination_info info  INNER JOIN exam_record record
		WHERE info.exam_id = record.exam_id
			AND  record.exam_id = 9001
				AND record.score NOT IN(
					SELECT MAX(score)
						FROM exam_record
							WHERE exam_id = 9001
								UNION ALL
					SELECT MIN(score)
						FROM exam_record
							WHERE exam_id = 9001
				)
```

Đây là cách giải trực quan và dễ nghĩ nhất, nhưng vẫn cần cải thiện; đây là cách làm tắt, thực ra theo đúng yêu cầu bài toán nên viết như sau:

```sql
SELECT tag,
       difficulty,
       ROUND(AVG(score), 1) clip_avg_score
FROM examination_info info
INNER JOIN exam_record record
WHERE info.exam_id = record.exam_id
  AND record.exam_id =
    (SELECT examination_info.exam_id
     FROM examination_info
     WHERE tag = 'SQL'
       AND difficulty = 'hard' )
  AND record.score NOT IN
    (SELECT MAX(score)
     FROM exam_record
     WHERE exam_id =
         (SELECT examination_info.exam_id
          FROM examination_info
          WHERE tag = 'SQL'
            AND difficulty = 'hard' )
     UNION ALL SELECT MIN(score)
     FROM exam_record
     WHERE exam_id =
         (SELECT examination_info.exam_id
          FROM examination_info
          WHERE tag = 'SQL'
            AND difficulty = 'hard' ) )
```

Tuy nhiên bạn sẽ thấy có rất nhiều câu lệnh lặp lại, nên có thể dùng `WITH` để trích xuất phần dùng chung:

**Giới thiệu mệnh đề `WITH`**:

Mệnh đề `WITH`, còn được gọi là Common Table Expression (CTE), là cách định nghĩa bảng tạm thời trong truy vấn SQL. Nó cho phép tạo tập kết quả được đặt tên tạm thời trong truy vấn và có thể tham chiếu đến tập kết quả đó trong cùng một truy vấn.

Cú pháp cơ bản:

```sql
WITH cte_name (column1, column2, ..., columnN) AS (
    -- Thân truy vấn
    SELECT ...
    FROM ...
    WHERE ...
)
-- Truy vấn chính
SELECT ...
FROM cte_name
WHERE ...
```

Mệnh đề `WITH` gồm các phần sau:

- `cte_name`: đặt tên cho bảng tạm thời, có thể tham chiếu trong truy vấn chính.
- `(column1, column2, ..., columnN)`: tùy chọn, chỉ định tên cột của bảng tạm thời.
- `AS`: bắt buộc, đánh dấu bắt đầu định nghĩa bảng tạm thời.
- `Thân truy vấn CTE`: câu lệnh truy vấn thực tế, định nghĩa dữ liệu trong bảng tạm thời.

Một trong những mục đích chính của mệnh đề `WITH` là cải thiện tính dễ đọc và dễ bảo trì của truy vấn, đặc biệt khi có nhiều truy vấn con lồng nhau hoặc cần dùng lại cùng một logic truy vấn nhiều lần.

Ngoài ra, mệnh đề `WITH` còn cho phép thực hiện truy vấn đệ quy trong các truy vấn phức tạp. Truy vấn đệ quy cho phép thực hiện nhiều vòng lặp trên cùng một bảng trong một truy vấn, từng bước xây dựng tập kết quả. Điều này rất hữu ích khi xử lý dữ liệu phân cấp, cấu trúc tổ chức và cấu trúc dạng cây.

**Chi tiết nhỏ**: MySQL phiên bản 5.7 và trước đó không hỗ trợ sử dụng alias trực tiếp trong mệnh đề `WITH`.

Dưới đây là đáp án đã cải tiến:

```sql
WITH t1 AS
  (SELECT record.*,
          info.tag,
          info.difficulty
   FROM exam_record record
   INNER JOIN examination_info info ON record.exam_id = info.exam_id
   WHERE info.tag = "SQL"
     AND info.difficulty = "hard" )
SELECT tag,
       difficulty,
       ROUND(AVG(score), 1)
FROM t1
WHERE score NOT IN
    (SELECT max(score)
     FROM t1
     UNION SELECT min(score)
     FROM t1)
```

**Cách giải 2:**

- Lọc bài thi SQL khó: `where tag="SQL" and difficulty="hard"`
- Tính trung bình cắt ngắn: `(tổng - giá trị lớn nhất - giá trị nhỏ nhất) / (tổng số - 2)`:
  - `(sum(score) - max(score) - min(score)) / (count(score) - 2)`
  - Nhược điểm là nếu có nhiều giá trị bằng max hoặc min, phương pháp này khó lọc được, nhưng đề bài đã nói ----->**`trung bình sau khi loại một điểm cao nhất và một điểm thấp nhất`**, nên có thể dùng công thức này.

**Đáp án 2:**

```sql
SELECT info.tag,
       info.difficulty,
       ROUND((SUM(record.score)- MIN(record.score)- MAX(record.score)) / (COUNT(record.score)- 2), 1) AS clip_avg_score
FROM examination_info info,
     exam_record record
WHERE info.exam_id = record.exam_id
  AND info.tag = "SQL"
  AND info.difficulty = "hard";
```

### Thống kê số lần làm bài

Có bảng ghi làm bài thi `exam_record`, hãy thống kê tổng số lần làm bài `total_pv`, số lần làm bài đã hoàn thành `complete_pv`, số bài thi đã hoàn thành `complete_exam_cnt`.

Dữ liệu mẫu bảng `exam_record` (`uid` ID người dùng, `exam_id` ID bài thi, `start_time` thời gian bắt đầu, `submit_time` thời gian nộp, `score` điểm):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-02 09:01:01 | 2020-01-02 09:21:01 | 80     |
| 2   | 1001 | 9001    | 2021-05-02 10:01:01 | 2021-05-02 10:30:01 | 81     |
| 3   | 1001 | 9001    | 2021-06-02 19:01:01 | 2021-06-02 19:31:01 | 84     |
| 4   | 1001 | 9002    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89     |
| 5   | 1001 | 9001    | 2021-09-02 12:01:01 | (NULL)              | (NULL) |
| 6   | 1001 | 9002    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 7   | 1002 | 9002    | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87     |
| 8   | 1002 | 9001    | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90     |
| 9   | 1003 | 9001    | 2021-09-07 12:01:01 | 2021-09-07 10:31:01 | 50     |
| 10  | 1004 | 9001    | 2021-09-06 10:01:01 | (NULL)              | (NULL) |

Kết quả mẫu:

| total_pv | complete_pv | complete_exam_cnt |
| -------- | ----------- | ----------------- |
| 10       | 7           | 2                 |

Giải thích: Tính đến thời điểm hiện tại, có 10 lần làm bài, số lần hoàn thành là 7 (bỏ giữa chừng là trạng thái chưa hoàn thành, thời gian nộp và điểm là NULL), các bài đã hoàn thành gồm 9001 và 9002.

**Cách giải**: Nhìn thấy "thống kê số lần" là ngay lập tức nghĩ đến hàm `COUNT` để giải quyết; vấn đề là phải thống kê các bản ghi khác nhau thế nào? Dùng truy vấn con là đủ để giải (bài này dùng case when cũng được, logic khác nhau thôi); trước tiên hãy tìm hiểu cách dùng cơ bản của `COUNT`:

Cú pháp cơ bản của hàm `COUNT()`:

```sql
COUNT(expression)
```

Trong đó, `expression` có thể là tên cột, biểu thức, hằng số hoặc ký tự đại diện. Dưới đây là một số ví dụ sử dụng phổ biến:

1. Đếm số hàng trong bảng:

```sql
SELECT COUNT(*) FROM table_name;
```

2. Đếm số giá trị không null của một cột:

```sql
SELECT COUNT(column_name) FROM table_name;
```

3. Đếm số hàng thỏa mãn điều kiện:

```sql
SELECT COUNT(*) FROM table_name WHERE condition;
```

4. Kết hợp với `GROUP BY`, đếm số hàng trong mỗi nhóm sau khi phân nhóm:

```sql
SELECT column_name, COUNT(*) FROM table_name GROUP BY column_name;
```

5. Đếm số tổ hợp duy nhất của nhiều cột:

```sql
SELECT COUNT(DISTINCT column_name1, column_name2) FROM table_name;
```

Khi dùng hàm `COUNT()`, nếu không chỉ định tham số hoặc dùng `COUNT(*)`, sẽ đếm tất cả các hàng. Nếu dùng tên cột, chỉ đếm số giá trị không null của cột đó.

Ngoài ra, kết quả của hàm `COUNT()` là số nguyên. Dù kết quả là 0 thì cũng không trả về NULL, cần ghi nhớ điều này.

**Đáp án**:

```sql
SELECT
	count(*) total_pv,
	( SELECT count(*) FROM exam_record WHERE submit_time IS NOT NULL ) complete_pv,
	( SELECT COUNT( DISTINCT exam_id, score IS NOT NULL OR NULL ) FROM exam_record ) complete_exam_cnt
FROM
	exam_record
```

Cần chú ý đặc biệt đến câu `COUNT( DISTINCT exam_id, score IS NOT NULL OR NULL )`: kiểm tra xem score có null không, nếu có trả về true, nếu không trả về null; lưu ý nếu không có `or null` thì trong trường hợp không null sẽ chỉ trả về false tức là 0;

`COUNT` bình thường không thể đếm nhiều cột, `distinct` giúp nhiều cột thành một tổng thể, cho phép đếm số hàng xuất hiện; `count distinct` khi tính chỉ trả về các hàng không null, cần chú ý điều này;

Ngoài ra qua bài này ta học được ----> mẫu câu quen dùng của count với điều kiện: `count( kiểm tra cột or null)`

### Điểm thấp nhất không dưới điểm trung bình

**Mô tả**: Hãy tìm điểm thấp nhất của người dùng trong bảng ghi làm bài mà điểm đó không thấp hơn điểm trung bình của loại bài thi SQL.

Dữ liệu mẫu bảng exam_record (uid ID người dùng, exam_id ID bài thi, start_time thời gian bắt đầu, submit_time thời gian nộp, score điểm):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-02 09:01:01 | 2020-01-02 09:21:01 | 80     |
| 2   | 1002 | 9001    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89     |
| 3   | 1002 | 9002    | 2021-09-02 12:01:01 | (NULL)              | (NULL) |
| 4   | 1002 | 9003    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 5   | 1002 | 9001    | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87     |
| 6   | 1002 | 9002    | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90     |
| 7   | 1003 | 9002    | 2021-02-06 12:01:01 | (NULL)              | (NULL) |
| 8   | 1003 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86     |
| 9   | 1004 | 9003    | 2021-09-06 12:01:01 | (NULL)              | (NULL) |

Bảng `examination_info` (`exam_id` ID bài thi, `tag` danh mục, `difficulty` độ khó, `duration` thời gian, `release_time` thời gian phát hành)

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2020-01-01 10:00:00 |
| 2   | 9002    | SQL        | easy       | 60       | 2020-02-01 10:00:00 |
| 3   | 9003    | Thuật toán | medium     | 80       | 2020-08-02 10:00:00 |

Dữ liệu đầu ra mẫu:

| min_score_over_avg |
| ------------------ |
| 87                 |

**Giải thích**: Bài thi 9001 và 9002 thuộc danh mục SQL, các điểm số của những bài thi này là [80,89,87,90], điểm trung bình là 86.5, điểm nhỏ nhất không thấp hơn điểm trung bình là 87

**Cách giải**: Loại câu hỏi này nhìn ban đầu có vẻ phức tạp, nhưng sau khi đọc kỹ đề, hãy học cách nắm bắt thông tin chính trong đề bài. Ví dụ với bài này: `tìm điểm thấp nhất của người dùng mà điểm đó không thấp hơn điểm trung bình của bài thi SQL`. Bạn có thể nhận ra ngay những thông tin nào để làm hướng giải?

Điều thứ nhất: tìm điểm số bài thi ==SQL==

Điều thứ hai: ==điểm trung bình== của loại bài thi đó

Điều thứ ba: ==điểm thấp nhất của người dùng== của loại bài thi đó

Và "cầu nối" ở giữa là ==không thấp hơn==

Sau khi tách điều kiện, lần lượt thực hiện từng bước:

```sql
-- Tìm điểm thi tag là 'SQL'   【80, 89,87,90】
-- Tính điểm trung bình của nhóm này
select  ROUND(AVG(score), 1) from  examination_info info INNER JOIN exam_record record
	where info.exam_id = record.exam_id
	and tag= 'SQL'
```

Sau đó tìm điểm thấp nhất của loại bài thi này, rồi so sánh tập kết quả `【80, 89,87,90】` với điểm trung bình để ra kết quả cuối cùng.

**Đáp án**:

```sql
SELECT MIN(score) AS min_score_over_avg
FROM examination_info info
INNER JOIN exam_record record
WHERE info.exam_id = record.exam_id
  AND tag= 'SQL'
  AND score >=
    (SELECT ROUND(AVG(score), 1)
     FROM examination_info info
     INNER JOIN exam_record record
     WHERE info.exam_id = record.exam_id
       AND tag= 'SQL' )
```

Thực ra loại câu hỏi này tuy trông "rối" nhưng khi xem xét kỹ, tách điều kiện lớn thành điều kiện nhỏ, sau khi tách hết rồi ghép tất cả lại. Hãy nhớ: **nắm trục chính, phân nhánh phụ**, vấn đề sẽ được giải quyết.

## Truy vấn phân nhóm

### Số ngày hoạt động trung bình và số người dùng hoạt động theo tháng

**Mô tả**: Bảng `exam_record` lưu ghi làm bài thi của người dùng trên Niuke, nội dung như sau:

Bảng `exam_record` (`uid` ID người dùng, `exam_id` ID bài thi, `start_time` thời gian bắt đầu, `submit_time` thời gian nộp, `score` điểm)

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-07-02 09:01:01 | 2021-07-02 09:21:01 | 80     |
| 2   | 1002 | 9001    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 81     |
| 3   | 1002 | 9002    | 2021-09-02 12:01:01 | (NULL)              | (NULL) |
| 4   | 1002 | 9003    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 5   | 1002 | 9001    | 2021-07-02 19:01:01 | 2021-07-02 19:30:01 | 82     |
| 6   | 1002 | 9002    | 2021-07-05 18:01:01 | 2021-07-05 18:59:02 | 90     |
| 7   | 1003 | 9002    | 2021-07-06 12:01:01 | (NULL)              | (NULL) |
| 8   | 1003 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86     |
| 9   | 1004 | 9003    | 2021-09-06 12:01:01 | (NULL)              | (NULL) |
| 10  | 1002 | 9003    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81     |
| 11  | 1005 | 9001    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88     |
| 12  | 1006 | 9002    | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89     |
| 13  | 1007 | 9002    | 2020-09-02 12:11:01 | 2020-09-02 12:31:01 | 89     |

Hãy tính số ngày hoạt động trung bình theo tháng `avg_active_days` và số người dùng hoạt động theo tháng `mau` cho mỗi tháng trong năm 2021, kết quả mẫu như sau:

| month  | avg_active_days | mau |
| ------ | --------------- | --- |
| 202107 | 1.50            | 2   |
| 202109 | 1.25            | 4   |

**Giải thích**: Tháng 7/2021 có 2 người hoạt động, tổng cộng 3 ngày (1001 hoạt động 1 ngày, 1002 hoạt động 2 ngày), số ngày hoạt động trung bình là 1.5; tháng 9/2021 có 4 người hoạt động, tổng cộng 5 ngày, số ngày hoạt động trung bình là 1.25, kết quả giữ 2 chữ số thập phân.

Lưu ý: ở đây "hoạt động" nghĩa là có hành vi ==nộp bài==.

**Cách giải**: Sau khi đọc đề chú ý phần được highlight; thường khi tính số ngày và số người dùng hoạt động theo tháng là nghĩ ngay đến các hàm ngày tháng; bài này cũng tách thành các phần nhỏ để giải quyết; đầu tiên đếm số người hoạt động, phải dùng `COUNT()`, ở đây có một bẫy - người dùng 1002 đã làm hai loại bài khác nhau trong tháng 9, nên cần chú ý dedup để tránh thống kê số người hoạt động sai; thứ hai là phải biết định dạng ngày tháng, như bảng trên, đề yêu cầu hiển thị theo định dạng `202107`, phải dùng `DATE_FORMAT` để định dạng.

Cú pháp cơ bản:

`DATE_FORMAT(date_value, format)`

- Tham số `date_value` là giá trị ngày hoặc thời gian cần định dạng.
- Tham số `format` là định dạng ngày hoặc giờ chỉ định (giống định dạng ngày tháng trong Java).

**Đáp án**:

```sql
SELECT DATE_FORMAT(submit_time, '%Y%m') MONTH,
                                        round(count(DISTINCT UID, DATE_FORMAT(submit_time, '%Y%m%d')) / count(DISTINCT UID), 2) avg_active_days,
                                        COUNT(DISTINCT UID) mau
FROM exam_record
WHERE YEAR (submit_time) = 2021
GROUP BY MONTH
```

Thêm một lưu ý, dùng `COUNT(DISTINCT uid, DATE_FORMAT(submit_time, '%Y%m%d'))` có thể đếm số lượng tổ hợp giá trị của cột `uid` và cột `submit_time` sau khi định dạng theo năm, tháng, ngày.

### Tổng số câu làm theo tháng và số câu trung bình mỗi ngày

**Mô tả**: Có bảng ghi luyện tập `practice_record`, nội dung mẫu như sau:

| id  | uid  | question_id | submit_time         | score |
| --- | ---- | ----------- | ------------------- | ----- |
| 1   | 1001 | 8001        | 2021-08-02 11:41:01 | 60    |
| 2   | 1002 | 8001        | 2021-09-02 19:30:01 | 50    |
| 3   | 1002 | 8001        | 2021-09-02 19:20:01 | 70    |
| 4   | 1002 | 8002        | 2021-09-02 19:38:01 | 70    |
| 5   | 1003 | 8002        | 2021-08-01 19:38:01 | 80    |

Hãy thống kê tổng số câu làm theo tháng `month_q_cnt` và số câu trung bình mỗi ngày `avg_day_q_cnt` (sắp xếp tăng dần theo tháng) của người dùng trong mỗi tháng năm 2021, cũng như tình hình tổng thể trong năm đó, dữ liệu đầu ra mẫu như sau:

| submit_month  | month_q_cnt | avg_day_q_cnt |
| ------------- | ----------- | ------------- |
| 202108        | 2           | 0.065         |
| 202109        | 3           | 0.100         |
| 2021 Tổng hợp | 5           | 0.161         |

**Giải thích**: Tháng 8/2021 có 2 lần làm bài, số câu trung bình mỗi ngày là 2/31=0.065 (giữ 3 chữ số thập phân); tháng 9/2021 có 3 lần, trung bình mỗi ngày là 3/30=0.100; năm 2021 có tổng 5 lần (tổng hợp theo năm, trung bình tính theo 31 ngày: 5/31=0.161)

> Niuke đã sử dụng MySQL phiên bản mới nhất. Nếu bạn gặp lỗi: ONLY_FULL_GROUP_BY, nghĩa là: đối với thao tác tổng hợp GROUP BY, nếu cột trong SELECT không xuất hiện trong GROUP BY, SQL đó không hợp lệ vì cột không nằm trong mệnh đề GROUP BY, tức là cột được truy vấn phải xuất hiện sau GROUP BY, hoặc cột đó phải nằm trong hàm tổng hợp.

**Cách giải:**

Nhìn vào dữ liệu mẫu là nghĩ ngay đến các hàm liên quan, ví dụ `submit_month` phải dùng `DATE_FORMAT` để định dạng ngày tháng. Sau đó truy vấn số câu mỗi tháng.

Số câu mỗi tháng:

```sql
SELECT MONTH ( submit_time ), COUNT( question_id )
FROM
	practice_record
GROUP BY
	MONTH (submit_time)
```

Tiếp theo, cột thứ ba cần dùng hàm `DAY(LAST_DAY(date_value))` để tìm số ngày trong tháng của ngày đã cho.

Ví dụ mã:

```sql
SELECT DAY(LAST_DAY('2023-07-08')) AS days_in_month;
-- Kết quả: 31

SELECT DAY(LAST_DAY('2023-02-01')) AS days_in_month;
-- Kết quả: 28 (tháng 2 năm nhuận)

SELECT DAY(LAST_DAY(NOW())) AS days_in_current_month;
-- Kết quả: 31 (số ngày trong tháng hiện tại)
```

Dùng hàm `LAST_DAY()` để lấy ngày cuối cùng của tháng chứa ngày đã cho, sau đó dùng hàm `DAY()` để lấy số ngày của ngày đó. Như vậy có thể lấy được số ngày của tháng chỉ định.

Lưu ý, hàm `LAST_DAY()` trả về giá trị ngày, còn hàm `DAY()` dùng để lấy phần số ngày từ giá trị ngày đó.

Với phân tích trên, có thể viết đáp án ngay, bài này phức tạp ở phần xử lý ngày tháng, logic không khó.

**Đáp án**:

```sql
SELECT DATE_FORMAT(submit_time, '%Y%m') submit_month,
       count(question_id) month_q_cnt,
       ROUND(COUNT(question_id) / DAY (LAST_DAY(submit_time)), 3) avg_day_q_cnt
FROM practice_record
WHERE DATE_FORMAT(submit_time, '%Y') = '2021'
GROUP BY submit_month
UNION ALL
SELECT '2021汇总' AS submit_month,
       count(question_id) month_q_cnt,
       ROUND(COUNT(question_id) / 31, 3) avg_day_q_cnt
FROM practice_record
WHERE DATE_FORMAT(submit_time, '%Y') = '2021'
ORDER BY submit_month
```

Trong dữ liệu mẫu vì hàng cuối cần dữ liệu tổng hợp, nên phải dùng `UNION ALL` để thêm vào tập kết quả; đừng quên sắp xếp cuối cùng!

### Người dùng hợp lệ có số bài chưa hoàn thành lớn hơn 1 (khá khó)

**Mô tả**: Có bảng ghi làm bài thi `exam_record` (`uid` ID người dùng, `exam_id` ID bài thi, `start_time` thời gian bắt đầu, `submit_time` thời gian nộp, `score` điểm), dữ liệu mẫu như sau:

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-07-02 09:01:01 | 2021-07-02 09:21:01 | 80     |
| 2   | 1002 | 9001    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 81     |
| 3   | 1002 | 9002    | 2021-09-02 12:01:01 | (NULL)              | (NULL) |
| 4   | 1002 | 9003    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 5   | 1002 | 9001    | 2021-07-02 19:01:01 | 2021-07-02 19:30:01 | 82     |
| 6   | 1002 | 9002    | 2021-07-05 18:01:01 | 2021-07-05 18:59:02 | 90     |
| 7   | 1003 | 9002    | 2021-07-06 12:01:01 | (NULL)              | (NULL) |
| 8   | 1003 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86     |
| 9   | 1004 | 9003    | 2021-09-06 12:01:01 | (NULL)              | (NULL) |
| 10  | 1002 | 9003    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81     |
| 11  | 1005 | 9001    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88     |
| 12  | 1006 | 9002    | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89     |
| 13  | 1007 | 9002    | 2020-09-02 12:11:01 | 2020-09-02 12:31:01 | 89     |

Còn có bảng thông tin bài thi `examination_info` (`exam_id` ID bài thi, `tag` danh mục, `difficulty` độ khó, `duration` thời gian, `release_time` thời gian phát hành), dữ liệu mẫu như sau:

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2020-01-01 10:00:00 |
| 2   | 9002    | SQL        | easy       | 60       | 2020-02-01 10:00:00 |
| 3   | 9003    | Thuật toán | medium     | 80       | 2020-08-02 10:00:00 |

Hãy thống kê dữ liệu của các người dùng hợp lệ có số bài chưa hoàn thành lớn hơn 1 trong năm 2021 (người dùng hợp lệ là người có số bài hoàn thành ít nhất là 1 và số bài chưa hoàn thành nhỏ hơn 5), xuất ID người dùng, số bài chưa hoàn thành, số bài đã hoàn thành, tập hợp tag của các bài đã làm, sắp xếp từ nhiều đến ít theo số bài chưa hoàn thành. Kết quả đầu ra của dữ liệu mẫu:

| uid  | incomplete_cnt | complete_cnt | detail                                                                            |
| ---- | -------------- | ------------ | --------------------------------------------------------------------------------- |
| 1002 | 2              | 4            | 2021-09-01:Thuật toán;2021-07-02:SQL;2021-09-02:SQL;2021-09-05:SQL;2021-07-05:SQL |

**Giải thích**: Trong các bản ghi làm bài năm 2021, ngoài 1004, các người dùng khác đều thỏa mãn định nghĩa người dùng hợp lệ, nhưng chỉ có 1002 có số bài chưa hoàn thành lớn hơn 1, nên chỉ xuất 1002; detail là tập hợp {ngày:tag} của các bài thi 1002 đã làm, ngày và tag nối bằng **:** , nhiều phần tử nối bằng **;**.

**Cách giải:**

Sau khi đọc kỹ đề, phân tích: trước tiên cần join bảng vì sau đó cần xuất `tag`;

Lọc dữ liệu năm 2021:

```sql
SELECT *
FROM exam_record er
LEFT JOIN examination_info ei ON er.exam_id = ei.exam_id
WHERE YEAR (er.start_time)= 2021
```

Phân nhóm theo uid, sau đó kiểm tra điều kiện cho từng người dùng, đề yêu cầu `số bài hoàn thành ít nhất là 1, số bài chưa hoàn thành lớn hơn 1 và nhỏ hơn 5`

Vậy điều kiện khi viết SQL là: `chưa hoàn thành > 1 and đã hoàn thành >=1 and chưa hoàn thành < 5`

Vì cuối cùng cần nối chuỗi, và còn phải nối kết hợp, có thể dùng hàm `GROUP_CONCAT`; dưới đây giới thiệu sơ lược cách dùng hàm này:

Định dạng cơ bản:

```sql
GROUP_CONCAT([DISTINCT] expr [ORDER BY {unsigned_integer | col_name | expr} [ASC | DESC] [, ...]]             [SEPARATOR sep])
```

- `expr`: cột hoặc biểu thức cần nối.
- `DISTINCT`: tham số tùy chọn, dùng để dedup. Khi chỉ định `DISTINCT`, các giá trị giống nhau chỉ xuất hiện một lần.
- `ORDER BY`: tham số tùy chọn, dùng để sắp xếp các giá trị sau khi nối. Có thể chọn sắp xếp tăng dần (`ASC`) hoặc giảm dần (`DESC`).
- `SEPARATOR sep`: tham số tùy chọn, dùng để thiết lập ký tự phân cách cho các giá trị sau khi nối. (Bài này dùng tham số này để thiết lập dấu ;)

Hàm `GROUP_CONCAT()` thường dùng trong mệnh đề `GROUP BY`, nối các giá trị của một nhóm hàng thành một chuỗi và trả về dưới dạng tổng hợp trong tập kết quả.

**Đáp án**:

```sql
SELECT a.uid,
       SUM(CASE
               WHEN a.submit_time IS NULL THEN 1
           END) AS incomplete_cnt,
       SUM(CASE
               WHEN a.submit_time IS NOT NULL THEN 1
           END) AS complete_cnt,
       GROUP_CONCAT(DISTINCT CONCAT(DATE_FORMAT(a.start_time, '%Y-%m-%d'), ':', b.tag)
                    ORDER BY start_time SEPARATOR ";") AS detail
FROM exam_record a
LEFT JOIN examination_info b ON a.exam_id = b.exam_id
WHERE YEAR (a.start_time)= 2021
GROUP BY a.uid
HAVING incomplete_cnt > 1
AND complete_cnt >= 1
AND incomplete_cnt < 5
ORDER BY incomplete_cnt DESC
```

- `SUM(CASE WHEN a.submit_time IS NULL THEN 1 END)` đếm số bản ghi chưa hoàn thành của mỗi người dùng.
- `SUM(CASE WHEN a.submit_time IS NOT NULL THEN 1 END)` đếm số bản ghi đã hoàn thành của mỗi người dùng.
- `GROUP_CONCAT(DISTINCT CONCAT(DATE_FORMAT(a.start_time, '%Y-%m-%d'), ':', b.tag) ORDER BY a.start_time SEPARATOR ';')` nối ngày thi và tag của mỗi người dùng thành chuỗi phân cách bằng dấu phẩy, sắp xếp theo thời gian bắt đầu thi.

## Truy vấn con lồng nhau

### Danh mục yêu thích của người dùng hoàn thành trung bình không dưới 3 bài/tháng (khá khó)

**Mô tả**: Có bảng ghi làm bài thi `exam_record` (`uid`: ID người dùng, `exam_id`: ID bài thi, `start_time`: thời gian bắt đầu, `submit_time`: thời gian nộp, NULL nếu chưa nộp, `score`: điểm), dữ liệu mẫu như sau:

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-07-02 09:01:01 | (NULL)              | (NULL) |
| 2   | 1002 | 9003    | 2021-09-01 12:01:01 | 2021-09-01 12:21:01 | 60     |
| 3   | 1002 | 9002    | 2021-09-02 12:01:01 | 2021-09-02 12:31:01 | 70     |
| 4   | 1002 | 9001    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 81     |
| 5   | 1002 | 9002    | 2021-07-06 12:01:01 | (NULL)              | (NULL) |
| 6   | 1003 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86     |
| 7   | 1003 | 9003    | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40     |
| 8   | 1003 | 9001    | 2021-09-08 13:01:01 | (NULL)              | (NULL) |
| 9   | 1003 | 9002    | 2021-09-08 14:01:01 | (NULL)              | (NULL) |
| 10  | 1003 | 9003    | 2021-09-08 15:01:01 | (NULL)              | (NULL) |
| 11  | 1005 | 9001    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88     |
| 12  | 1005 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88     |
| 13  | 1005 | 9002    | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89     |

Bảng thông tin bài thi `examination_info` (`exam_id`: ID bài thi, `tag`: danh mục, `difficulty`: độ khó, `duration`: thời gian, `release_time`: thời gian phát hành), dữ liệu mẫu như sau:

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2020-01-01 10:00:00 |
| 2   | 9002    | C++        | easy       | 60       | 2020-02-01 10:00:00 |
| 3   | 9003    | Thuật toán | medium     | 80       | 2020-08-02 10:00:00 |

Hãy thống kê danh mục và số lần làm bài yêu thích của những người dùng có "số bài hoàn thành trung bình theo tháng" không dưới 3, sắp xếp giảm dần theo số lần, kết quả đầu ra mẫu như sau:

| tag        | tag_cnt |
| ---------- | ------- |
| C++        | 4       |
| SQL        | 2       |
| Thuật toán | 1       |

**Giải thích**: Người dùng 1002 và 1005 đều hoàn thành 3 bài thi trong tháng 9/2021, các người dùng khác đều nhỏ hơn 3; sau đó phân phối tag của các bài thi 1002 và 1005 đã làm, sắp xếp giảm dần theo số lần làm là C++, SQL, Thuật toán.

**Cách giải**: Bài này kiểm tra truy vấn con kết hợp, trọng điểm ở `trung bình tháng >= 3`, nhưng cá nhân tôi thấy đề bài không diễn đạt rõ, nên hiểu đơn giản là truy vấn trong tháng 9 cho dễ hiểu; ở đây không phải mỗi tháng đều >= 3 hoặc tổng số lần làm / số tháng làm bài. Đừng hiểu nhầm.

Trước tiên truy vấn những người dùng có số bài làm trung bình theo tháng lớn hơn 3:

```sql
SELECT UID
FROM exam_record record
GROUP BY UID,
         MONTH (start_time)
HAVING count(submit_time) >= 3
```

Sau bước này, tiếp tục đi sâu; chỉ cần hiểu được bước trên (tức là không bị bối rối bởi "trung bình tháng" trong đề), sau đó lồng thêm truy vấn con, truy vấn những người dùng nào thuộc nhóm đó, rồi truy vấn các cột cần thiết trong đề. Nhớ sắp xếp!

```sql
SELECT tag,
       count(start_time) AS tag_cnt
FROM exam_record record
INNER JOIN examination_info info ON record.exam_id = info.exam_id
WHERE UID IN
    (SELECT UID
     FROM exam_record record
     GROUP BY UID,
              MONTH (start_time)
     HAVING count(submit_time) >= 3)
GROUP BY tag
ORDER BY tag_cnt DESC
```

### Số người làm bài và điểm trung bình trong ngày phát hành bài thi

**Mô tả**: Có bảng thông tin người dùng `user_info` (`uid` ID người dùng, `nick_name` biệt danh, `achievement` điểm thành tích, `level` cấp độ, `job` hướng nghề nghiệp, `register_time` thời gian đăng ký), dữ liệu mẫu như sau:

| id  | uid  | nick_name | achievement | level | job        | register_time       |
| --- | ---- | --------- | ----------- | ----- | ---------- | ------------------- |
| 1   | 1001 | NiuKe 1   | 3100        | 7     | Thuật toán | 2020-01-01 10:00:00 |
| 2   | 1002 | NiuKe 2   | 2100        | 6     | Thuật toán | 2020-01-01 10:00:00 |
| 3   | 1003 | NiuKe 3   | 1500        | 5     | Thuật toán | 2020-01-01 10:00:00 |
| 4   | 1004 | NiuKe 4   | 1100        | 4     | Thuật toán | 2020-01-01 10:00:00 |
| 5   | 1005 | NiuKe 5   | 1600        | 6     | C++        | 2020-01-01 10:00:00 |
| 6   | 1006 | NiuKe 6   | 3000        | 6     | C++        | 2020-01-01 10:00:00 |

**Giải thích**: Người dùng 1001 có biệt danh là NiuKe số 1, điểm thành tích 3100, cấp độ 7, hướng nghề là thuật toán, thời gian đăng ký 2020-01-01 10:00:00

Bảng thông tin bài thi `examination_info` (`exam_id` ID bài thi, `tag` danh mục, `difficulty` độ khó, `duration` thời gian, `release_time` thời gian phát hành), dữ liệu mẫu:

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2021-09-01 06:00:00 |
| 2   | 9002    | C++        | easy       | 60       | 2020-02-01 10:00:00 |
| 3   | 9003    | Thuật toán | medium     | 80       | 2020-08-02 10:00:00 |

Bảng ghi làm bài thi `exam_record` (`uid` ID người dùng, `exam_id` ID bài thi, `start_time` thời gian bắt đầu, `submit_time` thời gian nộp, `score` điểm), dữ liệu mẫu:

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-07-02 09:01:01 | 2021-09-01 09:41:01 | 70     |
| 2   | 1002 | 9003    | 2021-09-01 12:01:01 | 2021-09-01 12:21:01 | 60     |
| 3   | 1002 | 9002    | 2021-09-02 12:01:01 | 2021-09-02 12:31:01 | 70     |
| 4   | 1002 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 80     |
| 5   | 1002 | 9003    | 2021-08-01 12:01:01 | 2021-08-01 12:21:01 | 60     |
| 6   | 1002 | 9002    | 2021-08-02 12:01:01 | 2021-08-02 12:31:01 | 70     |
| 7   | 1002 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 85     |
| 8   | 1002 | 9002    | 2021-07-06 12:01:01 | (NULL)              | (NULL) |
| 9   | 1003 | 9002    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86     |
| 10  | 1003 | 9003    | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40     |
| 11  | 1003 | 9003    | 2021-09-01 13:01:01 | 2021-09-01 13:41:01 | 70     |
| 12  | 1003 | 9001    | 2021-09-08 14:01:01 | (NULL)              | (NULL) |
| 13  | 1003 | 9002    | 2021-09-08 15:01:01 | (NULL)              | (NULL) |
| 14  | 1005 | 9001    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 90     |
| 15  | 1005 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88     |
| 16  | 1005 | 9002    | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89     |

Hãy tính số người dùng trên cấp 5 làm bài `uv` và điểm trung bình `avg_score` trong ngày phát hành mỗi bài thi SQL, sắp xếp giảm dần theo số người, nếu bằng nhau thì sắp xếp tăng dần theo điểm trung bình, kết quả đầu ra của dữ liệu mẫu:

| exam_id | uv  | avg_score |
| ------- | --- | --------- |
| 9001    | 3   | 81.3      |

Giải thích: Chỉ có một bài thi SQL là bài 9001, ngày phát hành (2021-09-01) có 1001, 1002, 1003, 1005 đã làm, nhưng 1003 là cấp 5, ba người còn lại đều trên cấp 5, điểm của họ là [70,80,85,90], điểm trung bình là 81.3 (giữ 1 chữ số thập phân).

**Cách giải**: Bài này trông phức tạp, nhưng trước tiên tách dần các điều kiện "bên ngoài" rồi ghép lại, đáp án sẽ hiện ra; truy vấn nhiều bảng hãy nhớ: từ ngoài vào trong, bóc từng lớp.

Đầu tiên nối ba bảng lại, đồng thời đưa ra một số điều kiện, ví dụ đề yêu cầu người dùng `cấp > 5`, có thể truy vấn trước:

```sql
SELECT DISTINCT u_info.uid
FROM examination_info e_info
INNER JOIN exam_record record
INNER JOIN user_info u_info
WHERE e_info.exam_id = record.exam_id
  AND u_info.uid = record.uid
  AND u_info.LEVEL > 5
```

Tiếp theo chú ý đề yêu cầu: `người dùng làm bài thi SQL trong ngày phát hành`, chú ý ==ngày hôm đó==, vậy phải nghĩ đến việc so sánh thời gian.

So sánh ngày phát hành bài thi và ngày bắt đầu thi: `DATE(e_info.release_time) = DATE(record.start_time)`; không cần lo `submit_time` null, sau này sẽ được lọc trong where.

**Đáp án**:

```sql
SELECT record.exam_id AS exam_id,
       COUNT(DISTINCT u_info.uid) AS uv,
       ROUND(SUM(record.score) / COUNT(u_info.uid), 1) AS avg_score
FROM examination_info e_info
INNER JOIN exam_record record
INNER JOIN user_info u_info
WHERE e_info.exam_id = record.exam_id
  AND u_info.uid = record.uid
  AND DATE (e_info.release_time) = DATE (record.start_time)
  AND submit_time IS NOT NULL
  AND tag = 'SQL'
  AND u_info.LEVEL > 5
GROUP BY record.exam_id
ORDER BY uv DESC,
         avg_score ASC
```

Chú ý phân nhóm và sắp xếp cuối cùng! Sắp xếp theo số người trước, nếu bằng nhau thì theo điểm trung bình.

### Phân phối cấp độ người dùng từng đạt điểm trên 80 trong bài thi

**Mô tả**:

Có bảng thông tin người dùng `user_info` (`uid` ID người dùng, `nick_name` biệt danh, `achievement` điểm thành tích, `level` cấp độ, `job` hướng nghề, `register_time` thời gian đăng ký):

| id  | uid  | nick_name | achievement | level | job        | register_time       |
| --- | ---- | --------- | ----------- | ----- | ---------- | ------------------- |
| 1   | 1001 | NiuKe 1   | 3100        | 7     | Thuật toán | 2020-01-01 10:00:00 |
| 2   | 1002 | NiuKe 2   | 2100        | 6     | Thuật toán | 2020-01-01 10:00:00 |
| 3   | 1003 | NiuKe 3   | 1500        | 5     | Thuật toán | 2020-01-01 10:00:00 |
| 4   | 1004 | NiuKe 4   | 1100        | 4     | Thuật toán | 2020-01-01 10:00:00 |
| 5   | 1005 | NiuKe 5   | 1600        | 6     | C++        | 2020-01-01 10:00:00 |
| 6   | 1006 | NiuKe 6   | 3000        | 6     | C++        | 2020-01-01 10:00:00 |

Bảng thông tin bài thi `examination_info` (`exam_id` ID bài thi, `tag` danh mục, `difficulty` độ khó, `duration` thời gian, `release_time` thời gian phát hành):

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2021-09-01 06:00:00 |
| 2   | 9002    | C++        | easy       | 60       | 2021-09-01 06:00:00 |
| 3   | 9003    | Thuật toán | medium     | 80       | 2021-09-01 10:00:00 |

Bảng ghi làm bài `exam_record` (`uid` ID người dùng, `exam_id` ID bài thi, `start_time` thời gian bắt đầu, `submit_time` thời gian nộp, `score` điểm):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:41:01 | 79     |
| 2   | 1002 | 9003    | 2021-09-01 12:01:01 | 2021-09-01 12:21:01 | 60     |
| 3   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70     |
| 4   | 1002 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 80     |
| 5   | 1002 | 9003    | 2021-08-01 12:01:01 | 2021-08-01 12:21:01 | 60     |
| 6   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70     |
| 7   | 1002 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 85     |
| 8   | 1002 | 9002    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 9   | 1003 | 9002    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 86     |
| 10  | 1003 | 9003    | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40     |
| 11  | 1003 | 9003    | 2021-09-01 13:01:01 | 2021-09-01 13:41:01 | 81     |
| 12  | 1003 | 9001    | 2021-09-01 14:01:01 | (NULL)              | (NULL) |
| 13  | 1003 | 9002    | 2021-09-08 15:01:01 | (NULL)              | (NULL) |
| 14  | 1005 | 9001    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 90     |
| 15  | 1005 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 88     |
| 16  | 1005 | 9002    | 2021-09-02 12:11:01 | 2021-09-02 12:31:01 | 89     |

Thống kê phân phối cấp độ của người dùng từng đạt trên 80 điểm trong bài thi thuộc danh mục SQL, sắp xếp giảm dần theo số lượng (đảm bảo các số lượng đều khác nhau). Kết quả đầu ra của dữ liệu mẫu:

| level | level_cnt |
| ----- | --------- |
| 6     | 2         |
| 5     | 1         |

Giải thích: 9001 là bài thi SQL, người làm bài thi đó trên 80 điểm gồm 1002, 1003, 1005 cộng 3 người, 2 người cấp 6, 1 người cấp 5.

**Cách giải:** Bài này và bài trước dùng cùng dữ liệu, chỉ thay đổi điều kiện truy vấn, hiểu bài trước rồi thì bài này làm trong phút mốt.

**Đáp án**:

```sql
SELECT u_info.LEVEL AS LEVEL,
       count(u_info.uid) AS level_cnt
FROM examination_info e_info
INNER JOIN exam_record record
INNER JOIN user_info u_info
WHERE e_info.exam_id = record.exam_id
  AND u_info.uid = record.uid
  AND record.score > 80
  AND submit_time IS NOT NULL
  AND tag = 'SQL'
GROUP BY LEVEL
ORDER BY level_cnt DESC
```

## Truy vấn hợp (UNION)

### Số người và số lần làm bài của mỗi câu hỏi và mỗi bài thi

**Mô tả**:

Có bảng ghi làm bài thi exam_record (uid ID người dùng, exam_id ID bài thi, start_time thời gian bắt đầu, submit_time thời gian nộp, score điểm):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:41:01 | 81     |
| 2   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70     |
| 3   | 1002 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 80     |
| 4   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70     |
| 5   | 1004 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 85     |
| 6   | 1002 | 9002    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |

Bảng luyện tập câu hỏi practice_record (uid ID người dùng, question_id ID câu hỏi, submit_time thời gian nộp, score điểm):

| id  | uid  | question_id | submit_time         | score |
| --- | ---- | ----------- | ------------------- | ----- |
| 1   | 1001 | 8001        | 2021-08-02 11:41:01 | 60    |
| 2   | 1002 | 8001        | 2021-09-02 19:30:01 | 50    |
| 3   | 1002 | 8001        | 2021-09-02 19:20:01 | 70    |
| 4   | 1002 | 8002        | 2021-09-02 19:38:01 | 70    |
| 5   | 1003 | 8001        | 2021-08-02 19:38:01 | 70    |
| 6   | 1003 | 8001        | 2021-08-02 19:48:01 | 90    |
| 7   | 1003 | 8002        | 2021-08-01 19:38:01 | 80    |

Hãy thống kê số người và số lần làm bài của mỗi câu hỏi và mỗi bài thi, hiển thị riêng theo thứ tự uv & pv giảm dần của "bài thi" và "câu hỏi", kết quả đầu ra của dữ liệu mẫu:

| tid  | uv  | pv  |
| ---- | --- | --- |
| 9001 | 3   | 3   |
| 9002 | 1   | 3   |
| 8001 | 3   | 5   |
| 8002 | 2   | 2   |

**Giải thích**: Về "bài thi" có 3 người làm 3 lần bài 9001, 1 người làm 3 lần 9002; về "luyện câu hỏi" có 3 người làm 5 lần 8001, có 2 người làm 2 lần 8002

**Cách giải**: Điểm khó và dễ mắc lỗi của bài này là vấn đề dùng `UNION` và `ORDER BY` cùng một lúc

Có những trường hợp sau: dùng `union` và nhiều `order by` không có ngoặc đơn sẽ báo lỗi!

`order by` không có tác dụng trong mệnh đề con được nối bởi `union`;

Ví dụ không có ngoặc đơn:

```sql
SELECT exam_id AS tid,
       COUNT(DISTINCT UID) AS uv,
       COUNT(UID) AS pv
FROM exam_record
GROUP BY exam_id
ORDER BY uv DESC,
         pv DESC
UNION
SELECT question_id AS tid,
       COUNT(DISTINCT UID) AS uv,
       COUNT(UID) AS pv
FROM practice_record
GROUP BY question_id
ORDER BY uv DESC,
         pv DESC
```

Trực tiếp báo lỗi cú pháp, nếu không có ngoặc đơn chỉ có thể có một `order by`

Còn một trường hợp `order by` không có tác dụng, nhưng có thể hoạt động trong truy vấn con của truy vấn con; giải pháp ở đây là lồng thêm một lớp truy vấn bên ngoài.

**Đáp án**:

```sql
SELECT *
FROM
  (SELECT exam_id AS tid,
          COUNT(DISTINCT exam_record.uid) uv,
          COUNT(*) pv
   FROM exam_record
   GROUP BY exam_id
   ORDER BY uv DESC, pv DESC) t1
UNION
SELECT *
FROM
  (SELECT question_id AS tid,
          COUNT(DISTINCT practice_record.uid) uv,
          COUNT(*) pv
   FROM practice_record
   GROUP BY question_id
   ORDER BY uv DESC, pv DESC) t2;
```

### Người thỏa mãn hai hoạt động riêng biệt

**Mô tả**: Để thúc đẩy nhiều người dùng học tập và luyện tập trên nền tảng Niuke, chúng ta thường trao phần thưởng cho những người dùng vừa năng động vừa có thành tích tốt. Giả sử trước đây chúng ta có hai đợt hoạt động vận hành, trao phiếu ưu đãi cho người luôn đạt 85 điểm trở lên trong mỗi lần thi (activity1), và cho người ít nhất một lần hoàn thành bài thi khó trong một nửa thời gian với điểm trên 80 (activity2).

Bây giờ cần bạn lọc ra người thỏa mãn cả hai hoạt động này trong một lần, giao cho nhóm vận hành. Hãy viết một SQL: xuất id và mã hoạt động của tất cả người trong năm 2021 vừa luôn đạt 85 điểm mỗi lần thi vừa ít nhất một lần hoàn thành bài thi khó trong một nửa thời gian với điểm trên 80, sắp xếp theo ID người dùng.

Có bảng thông tin bài thi `examination_info` (`exam_id` ID bài thi, `tag` danh mục, `difficulty` độ khó, `duration` thời gian, `release_time` thời gian phát hành):

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2021-09-01 06:00:00 |
| 2   | 9002    | C++        | easy       | 60       | 2021-09-01 06:00:00 |
| 3   | 9003    | Thuật toán | medium     | 80       | 2021-09-01 10:00:00 |

Bảng ghi làm bài thi `exam_record` (`uid` ID người dùng, `exam_id` ID bài thi, `start_time` thời gian bắt đầu, `submit_time` thời gian nộp, `score` điểm):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81     |
| 2   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 70     |
| 3   | 1003 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | **86** |
| 4   | 1003 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 89     |
| 5   | 1004 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85     |

Kết quả đầu ra của dữ liệu mẫu:

| uid  | activity  |
| ---- | --------- |
| 1001 | activity2 |
| 1003 | activity1 |
| 1004 | activity1 |
| 1004 | activity2 |

**Giải thích**: Người dùng 1001 điểm nhỏ nhất là 81 không thỏa mãn hoạt động 1, nhưng hoàn thành bài thi 60 phút trong 29 phút 59 giây với điểm 81, thỏa mãn hoạt động 2; 1003 điểm nhỏ nhất là 86 thỏa mãn hoạt động 1, thời gian hoàn thành đều lớn hơn một nửa thời gian bài thi, không thỏa mãn hoạt động 2; 1004 đúng dùng một nửa thời gian (30 phút đúng) hoàn thành với điểm 85, thỏa mãn cả hoạt động 1 và 2.

**Cách giải**: Bài này liên quan đến phép trừ thời gian, cần dùng hàm `TIMESTAMPDIFF()` để tính hiệu số phút giữa hai timestamp.

Dưới đây xem cách dùng cơ bản:

Ví dụ:

```sql
TIMESTAMPDIFF(MINUTE, start_time, end_time)
```

Tham số đầu tiên của hàm `TIMESTAMPDIFF()` là đơn vị thời gian, ở đây chọn `MINUTE` để trả về hiệu phút. Tham số thứ hai là timestamp sớm hơn, tham số thứ ba là timestamp muộn hơn. Hàm sẽ trả về hiệu số phút giữa chúng.

Sau khi hiểu cách dùng hàm này, nhìn lại yêu cầu `activity1`, tìm điểm >= 85; hãy viết điều này trước, sau đó hướng suy nghĩ sẽ rõ ràng hơn nhiều:

```sql
SELECT DISTINCT UID
FROM exam_record
WHERE score >= 85
  AND YEAR (start_time) = '2021'
```

Theo điều kiện 2, tiếp tục viết `người hoàn thành bài thi khó trong một nửa thời gian với điểm trên 80`:

```sql
SELECT UID
FROM examination_info info
INNER JOIN exam_record record
WHERE info.exam_id = record.exam_id
  AND (TIMESTAMPDIFF(MINUTE, start_time, submit_time)) < (info.duration / 2)
  AND difficulty = 'hard'
  AND score >= 80
```

Sau đó `UNION` cả hai lại. (Đặc biệt chú ý vấn đề ngoặc đơn và vị trí `order by`, cách dùng cụ thể đã đề cập ở bài trước)

**Đáp án**:

```sql
SELECT DISTINCT UID UID,
                    'activity1' activity
FROM exam_record
WHERE UID not in
    (SELECT UID
     FROM exam_record
     WHERE score<85
       AND YEAR(submit_time) = 2021 )
UNION
SELECT DISTINCT UID UID,
                    'activity2' activity
FROM exam_record e_r
LEFT JOIN examination_info e_i ON e_r.exam_id = e_i.exam_id
WHERE YEAR(submit_time) = 2021
  AND difficulty = 'hard'
  AND TIMESTAMPDIFF(SECOND, start_time, submit_time) <= duration *30
  AND score>80
ORDER BY UID
```

## Truy vấn kết nối (JOIN)

### Số bài thi hoàn thành và số câu hỏi luyện tập của người dùng thỏa mãn điều kiện (khó)

**Mô tả**:

Có bảng thông tin người dùng user_info (uid ID người dùng, nick_name biệt danh, achievement điểm thành tích, level cấp độ, job hướng nghề, register_time thời gian đăng ký):

| id  | uid  | nick_name | achievement | level | job        | register_time       |
| --- | ---- | --------- | ----------- | ----- | ---------- | ------------------- |
| 1   | 1001 | NiuKe 1   | 3100        | 7     | Thuật toán | 2020-01-01 10:00:00 |
| 2   | 1002 | NiuKe 2   | 2300        | 7     | Thuật toán | 2020-01-01 10:00:00 |
| 3   | 1003 | NiuKe 3   | 2500        | 7     | Thuật toán | 2020-01-01 10:00:00 |
| 4   | 1004 | NiuKe 4   | 1200        | 5     | Thuật toán | 2020-01-01 10:00:00 |
| 5   | 1005 | NiuKe 5   | 1600        | 6     | C++        | 2020-01-01 10:00:00 |
| 6   | 1006 | NiuKe 6   | 2000        | 6     | C++        | 2020-01-01 10:00:00 |

Bảng thông tin bài thi examination_info (exam_id ID bài thi, tag danh mục, difficulty độ khó, duration thời gian, release_time thời gian phát hành):

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2021-09-01 06:00:00 |
| 2   | 9002    | C++        | hard       | 60       | 2021-09-01 06:00:00 |
| 3   | 9003    | Thuật toán | medium     | 80       | 2021-09-01 10:00:00 |

Bảng ghi làm bài thi exam_record (uid ID người dùng, exam_id ID bài thi, start_time thời gian bắt đầu, submit_time thời gian nộp, score điểm):

| id  | uid  | exam_id | start_time          | submit_time         | score |
| --- | ---- | ------- | ------------------- | ------------------- | ----- |
| 1   | 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81    |
| 2   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81    |
| 3   | 1003 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 86    |
| 4   | 1003 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:51 | 89    |
| 5   | 1004 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85    |
| 6   | 1005 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:02 | 85    |
| 7   | 1006 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:21:01 | 84    |
| 8   | 1006 | 9001    | 2021-09-07 10:01:01 | 2021-09-07 10:21:01 | 80    |

Bảng ghi luyện câu hỏi practice_record (uid ID người dùng, question_id ID câu hỏi, submit_time thời gian nộp, score điểm):

| id  | uid  | question_id | submit_time         | score |
| --- | ---- | ----------- | ------------------- | ----- |
| 1   | 1001 | 8001        | 2021-08-02 11:41:01 | 60    |
| 2   | 1002 | 8001        | 2021-09-02 19:30:01 | 50    |
| 3   | 1002 | 8001        | 2021-09-02 19:20:01 | 70    |
| 4   | 1002 | 8002        | 2021-09-02 19:38:01 | 70    |
| 5   | 1004 | 8001        | 2021-08-02 19:38:01 | 70    |
| 6   | 1004 | 8002        | 2021-08-02 19:48:01 | 90    |
| 7   | 1001 | 8002        | 2021-08-02 19:38:01 | 70    |
| 8   | 1004 | 8002        | 2021-08-02 19:48:01 | 90    |
| 9   | 1004 | 8002        | 2021-08-02 19:58:01 | 94    |
| 10  | 1004 | 8003        | 2021-08-02 19:38:01 | 70    |
| 11  | 1004 | 8003        | 2021-08-02 19:48:01 | 90    |
| 12  | 1004 | 8003        | 2021-08-01 19:38:01 | 80    |

Hãy tìm những "tài năng" cấp 7 có điểm trung bình bài thi SQL khó lớn hơn 80, thống kê tổng số lần hoàn thành bài thi và tổng số lần luyện câu hỏi trong năm 2021, chỉ giữ lại người dùng có bài thi hoàn thành trong năm 2021. Sắp xếp tăng dần theo số bài hoàn thành, giảm dần theo số câu luyện.

Dữ liệu đầu ra mẫu:

| uid  | exam_cnt | question_cnt |
| ---- | -------- | ------------ |
| 1001 | 1        | 2            |
| 1003 | 2        | 0            |

Giải thích: Người dùng 1001, 1003, 1004, 1006 thỏa mãn điểm trung bình bài SQL khó lớn hơn 80, nhưng chỉ 1001, 1003 là "tài năng" cấp 7; 1001 hoàn thành 1 lần bài 9001, luyện 2 câu hỏi; 1003 hoàn thành 2 lần bài 9001, 9002, chưa luyện câu hỏi (nên đếm là 0)

**Cách giải:**

Trước tiên lọc sơ bộ theo điều kiện, ví dụ truy vấn người dùng đã làm bài SQL khó:

```sql
SELECT
	record.uid
FROM
	exam_record record
	INNER JOIN examination_info e_info ON record.exam_id = e_info.exam_id
	JOIN user_info u_info ON record.uid = u_info.uid
WHERE
	e_info.tag = 'SQL'
	AND e_info.difficulty = 'hard'
```

Sau đó theo yêu cầu đề bài, tiếp tục thêm điều kiện;

Nhưng ở đây cần chú ý:

Thứ nhất: không được đặt điều kiện `YEAR(submit_time)= 2021` vào cuối, mà phải đặt trong điều kiện `ON`, vì left join có trường hợp trả về tất cả hàng của bảng trái với bảng phải là null, đặt trong `ON` của `JOIN` là để đảm bảo khi join hai bảng, chỉ bản ghi thỏa mãn điều kiện năm mới được kết nối. Điều này giúp tránh các bản ghi năm khác bị đưa vào kết quả. Tức là 1001 đã làm bài thi 2021 nhưng chưa luyện câu hỏi, nếu đặt điều kiện vào cuối sẽ loại trường hợp này.

Thứ hai, phải dùng `COUNT(distinct er.exam_id) exam_cnt, COUNT(distinct pr.id) question_cnt`, phải thêm distinct vì left join tạo ra rất nhiều giá trị trùng lặp.

**Đáp án**:

```sql
SELECT er.uid AS UID,
       count(DISTINCT er.exam_id) AS exam_cnt,
       count(DISTINCT pr.id) AS question_cnt
FROM exam_record er
LEFT JOIN practice_record pr ON er.uid = pr.uid
AND YEAR (er.submit_time)= 2021
AND YEAR (pr.submit_time)= 2021
WHERE er.uid IN
    (SELECT er.uid
     FROM exam_record er
     LEFT JOIN examination_info ei ON er.exam_id = ei.exam_id
     LEFT JOIN user_info ui ON er.uid = ui.uid
     WHERE tag = 'SQL'
       AND difficulty = 'hard'
       AND LEVEL = 7
     GROUP BY er.uid
     HAVING avg(score) > 80)
GROUP BY er.uid
ORDER BY exam_cnt,
         question_cnt DESC
```

Bạn tinh ý có thể nhận ra, tại sao rõ ràng đã giới hạn `tag = 'SQL' AND difficulty = 'hard'`, nhưng người dùng 1003 vẫn ra được hai bản ghi thi, trong đó một bản ghi thi `tag` là `C++`; đây là do đặc điểm của `LEFT JOIN`, ngay cả khi không có hàng khớp với bảng phải, tất cả bản ghi của bảng trái vẫn được giữ lại.

### Tình trạng hoạt động của mỗi người dùng cấp 6/7 (khó)

**Mô tả**:

Có bảng thông tin người dùng `user_info` (`uid` ID người dùng, `nick_name` biệt danh, `achievement` điểm thành tích, `level` cấp độ, `job` hướng nghề, `register_time` thời gian đăng ký):

| id  | uid  | nick_name | achievement | level | job        | register_time       |
| --- | ---- | --------- | ----------- | ----- | ---------- | ------------------- |
| 1   | 1001 | NiuKe 1   | 3100        | 7     | Thuật toán | 2020-01-01 10:00:00 |
| 2   | 1002 | NiuKe 2   | 2300        | 7     | Thuật toán | 2020-01-01 10:00:00 |
| 3   | 1003 | NiuKe 3   | 2500        | 7     | Thuật toán | 2020-01-01 10:00:00 |
| 4   | 1004 | NiuKe 4   | 1200        | 5     | Thuật toán | 2020-01-01 10:00:00 |
| 5   | 1005 | NiuKe 5   | 1600        | 6     | C++        | 2020-01-01 10:00:00 |
| 6   | 1006 | NiuKe 6   | 2600        | 7     | C++        | 2020-01-01 10:00:00 |

Bảng thông tin bài thi `examination_info` (`exam_id` ID bài thi, `tag` danh mục, `difficulty` độ khó, `duration` thời gian, `release_time` thời gian phát hành):

| id  | exam_id | tag        | difficulty | duration | release_time        |
| --- | ------- | ---------- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL        | hard       | 60       | 2021-09-01 06:00:00 |
| 2   | 9002    | C++        | easy       | 60       | 2021-09-01 06:00:00 |
| 3   | 9003    | Thuật toán | medium     | 80       | 2021-09-01 10:00:00 |

Bảng ghi làm bài thi `exam_record` (`uid` ID người dùng, `exam_id` ID bài thi, `start_time` thời gian bắt đầu, `submit_time` thời gian nộp, `score` điểm):

| uid  | exam_id | start_time          | submit_time         | score  |
| ---- | ------- | ------------------- | ------------------- | ------ |
| 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 78     |
| 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81     |
| 1005 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85     |
| 1005 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:02 | 85     |
| 1006 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:21:59 | 84     |
| 1006 | 9001    | 2021-09-07 10:01:01 | 2021-09-07 10:21:01 | 81     |
| 1002 | 9001    | 2020-09-01 13:01:01 | 2020-09-01 13:41:01 | 81     |
| 1005 | 9001    | 2021-09-01 14:01:01 | (NULL)              | (NULL) |

Bảng ghi luyện câu hỏi `practice_record` (`uid` ID người dùng, `question_id` ID câu hỏi, `submit_time` thời gian nộp, `score` điểm):

| uid  | question_id | submit_time         | score |
| ---- | ----------- | ------------------- | ----- |
| 1001 | 8001        | 2021-08-02 11:41:01 | 60    |
| 1004 | 8001        | 2021-08-02 19:38:01 | 70    |
| 1004 | 8002        | 2021-08-02 19:48:01 | 90    |
| 1001 | 8002        | 2021-08-02 19:38:01 | 70    |
| 1004 | 8002        | 2021-08-02 19:48:01 | 90    |
| 1006 | 8002        | 2021-08-04 19:58:01 | 94    |
| 1006 | 8003        | 2021-08-03 19:38:01 | 70    |
| 1006 | 8003        | 2021-08-02 19:48:01 | 90    |
| 1006 | 8003        | 2020-08-01 19:38:01 | 80    |

Hãy thống kê tổng số tháng hoạt động, số ngày hoạt động năm 2021, số ngày hoạt động làm bài thi năm 2021, số ngày hoạt động luyện câu hỏi năm 2021 của mỗi người dùng cấp 6/7, sắp xếp giảm dần theo tổng tháng hoạt động và số ngày hoạt động năm 2021. Kết quả đầu ra của dữ liệu mẫu:

| uid  | act_month_total | act_days_2021 | act_days_2021_exam |
| ---- | --------------- | ------------- | ------------------ |
| 1006 | 3               | 4             | 1                  |
| 1001 | 2               | 2             | 1                  |
| 1005 | 1               | 1             | 1                  |
| 1002 | 1               | 0             | 0                  |
| 1003 | 0               | 0             | 0                  |

**Giải thích**: Người dùng cấp 6/7 có 5 người, trong đó 1006 đã hoạt động trong tháng 202109, 202108, 202008 tổng cộng 3 tháng, trong năm 2021 hoạt động các ngày 20210907, 20210804, 20210803, 20210802 tổng cộng 4 ngày, trong khu vực bài thi năm 2021 hoạt động 1 ngày 20210907, trong khu vực luyện câu hỏi hoạt động 3 ngày.

**Cách giải:**

Điểm mấu chốt của bài này là dùng `CASE WHEN THEN`, nếu không phải viết rất nhiều `left join` vì sẽ tạo ra rất nhiều tập kết quả.

Câu lệnh `CASE WHEN THEN` là một biểu thức điều kiện, dùng để thực thi các thao tác khác nhau hoặc trả về các kết quả khác nhau dựa trên điều kiện trong SQL.

Cấu trúc cú pháp như sau:

```sql
CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ...
    ELSE result
END
```

Trong cấu trúc này, có thể thêm nhiều mệnh đề `WHEN` theo nhu cầu, mỗi mệnh đề `WHEN` theo sau là điều kiện (condition) và kết quả (result). Điều kiện có thể là bất kỳ biểu thức logic nào, nếu thỏa mãn điều kiện sẽ trả về kết quả tương ứng.

Mệnh đề `ELSE` cuối cùng là tùy chọn, dùng để chỉ định kết quả mặc định khi không thỏa mãn tất cả điều kiện trước đó. Nếu không cung cấp mệnh đề `ELSE`, mặc định trả về `NULL`.

Ví dụ:

```sql
SELECT score,
    CASE
        WHEN score >= 90 THEN '优秀'
        WHEN score >= 80 THEN '良好'
        WHEN score >= 60 THEN '及格'
        ELSE '不及格'
    END AS grade
FROM student_scores;
```

Trong ví dụ trên, dựa trên các phạm vi điểm số (score) khác nhau của học sinh, dùng câu lệnh CASE WHEN THEN để trả về cấp độ (grade) tương ứng. Nếu điểm >= 90 trả về "Xuất sắc"; nếu >= 80 trả về "Tốt"; nếu >= 60 trả về "Đạt"; còn lại trả về "Không đạt".

Sau khi hiểu cách dùng trên, nhìn lại bài này, yêu cầu liệt kê các ngày hoạt động khác nhau.

```sql
count(distinct act_month) as act_month_total,
count(distinct case when year(act_time)='2021'then act_day end) as act_days_2021,
count(distinct case when year(act_time)='2021' and tag='exam' then act_day end) as act_days_2021_exam,
count(distinct case when year(act_time)='2021' and tag='question'then act_day end) as act_days_2021_question
```

Ở đây tag là được đặt trước để đánh dấu, thuận tiện phân biệt truy vấn, tách khu vực thi và luyện câu hỏi.

Tìm người dùng ở khu vực làm bài thi:

```sql
SELECT
		uid,
		exam_id AS ans_id,
		start_time AS act_time,
		date_format( start_time, '%Y%m' ) AS act_month,
		date_format( start_time, '%Y%m%d' ) AS act_day,
		'exam' AS tag
	FROM
		exam_record
```

Tiếp theo là người dùng ở khu vực luyện câu hỏi:

```sql
SELECT
		uid,
		question_id AS ans_id,
		submit_time AS act_time,
		date_format( submit_time, '%Y%m' ) AS act_month,
		date_format( submit_time, '%Y%m%d' ) AS act_day,
		'question' AS tag
	FROM
		practice_record
```

Cuối cùng `UNION` hai kết quả lại và đừng quên sắp xếp (Bài này có chút giống với tư tưởng divide and conquer - chia để trị)

**Đáp án**:

```sql
SELECT user_info.uid,
       count(DISTINCT act_month) AS act_month_total,
       count(DISTINCT CASE
                          WHEN YEAR (act_time)= '2021' THEN act_day
                      END) AS act_days_2021,
       count(DISTINCT CASE
                          WHEN YEAR (act_time)= '2021'
                               AND tag = 'exam' THEN act_day
                      END) AS act_days_2021_exam,
       count(DISTINCT CASE
                          WHEN YEAR (act_time)= '2021'
                               AND tag = 'question' THEN act_day
                      END) AS act_days_2021_question
FROM
  (SELECT UID,
          exam_id AS ans_id,
          start_time AS act_time,
          date_format(start_time, '%Y%m') AS act_month,
          date_format(start_time, '%Y%m%d') AS act_day,
          'exam' AS tag
   FROM exam_record
   UNION ALL SELECT UID,
                    question_id AS ans_id,
                    submit_time AS act_time,
                    date_format(submit_time, '%Y%m') AS act_month,
                    date_format(submit_time, '%Y%m%d') AS act_day,
                    'question' AS tag
   FROM practice_record) total
RIGHT JOIN user_info ON total.uid = user_info.uid
WHERE user_info.LEVEL IN (6,
                          7)
GROUP BY user_info.uid
ORDER BY act_month_total DESC,
         act_days_2021 DESC
```
