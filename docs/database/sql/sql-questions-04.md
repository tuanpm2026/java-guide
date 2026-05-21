---
title: Tổng hợp câu hỏi phỏng vấn SQL thường gặp (Phần 4)
description: Phần 4 tổng hợp câu hỏi phỏng vấn SQL thường gặp, giải thích chi tiết cách dùng và tình huống áp dụng của các hàm cửa sổ trong MySQL 8.0 như ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, LEAD.
category: Cơ sở dữ liệu
tag:
  - Kiến thức cơ bản về cơ sở dữ liệu
  - SQL
head:
  - - meta
    - name: keywords
      content: SQL面试题,窗口函数,ROW_NUMBER,RANK,DENSE_RANK,NTILE,LAG,LEAD,MySQL 8.0
---

> Nguồn câu hỏi: [Nowcoder - SQL Nâng Cao](https://www.nowcoder.com/exam/oj?page=1&tab=SQL%E7%AF%87&topicId=240)

Các câu hỏi khó hoặc rất khó có thể tự quyết định bỏ qua tùy theo tình hình thực tế và nhu cầu phỏng vấn.

## Hàm cửa sổ chuyên dụng

MySQL 8.0 đã bổ sung hỗ trợ hàm cửa sổ, dưới đây là các hàm cửa sổ phổ biến trong MySQL và cách sử dụng:

1. `ROW_NUMBER()`: Gán một giá trị nguyên duy nhất cho mỗi hàng trong tập kết quả truy vấn.

```sql
SELECT col1, col2, ROW_NUMBER() OVER (ORDER BY col1) AS row_num
FROM table;
```

2. `RANK()`: Tính thứ hạng của mỗi hàng trong kết quả sắp xếp.

```sql
SELECT col1, col2, RANK() OVER (ORDER BY col1 DESC) AS ranking
FROM table;
```

3. `DENSE_RANK()`: Tính thứ hạng của mỗi hàng trong kết quả sắp xếp, giữ nguyên thứ hạng khi trùng nhau.

```sql
SELECT col1, col2, DENSE_RANK() OVER (ORDER BY col1 DESC) AS ranking
FROM table;
```

4. `NTILE(n)`: Chia kết quả thành n nhóm đều nhau và gán nhãn số cho từng nhóm.

```sql
SELECT col1, col2, NTILE(4) OVER (ORDER BY col1) AS bucket
FROM table;
```

5. `SUM()`, `AVG()`,`COUNT()`, `MIN()`, `MAX()`: Các hàm tổng hợp này cũng có thể kết hợp với hàm cửa sổ, tính tổng, trung bình, số đếm, giá trị nhỏ nhất và lớn nhất của cột được chỉ định trong cửa sổ.

```sql
SELECT col1, col2, SUM(col1) OVER () AS sum_col
FROM table;
```

6. `LEAD()` và `LAG()`: Hàm LEAD dùng để lấy giá trị của hàng ở vị trí offset phía sau hàng hiện tại, còn hàm LAG dùng để lấy giá trị của hàng ở vị trí offset phía trước hàng hiện tại.

```sql
SELECT col1, col2, LEAD(col1, 1) OVER (ORDER BY col1) AS next_col1,
                 LAG(col1, 1) OVER (ORDER BY col1) AS prev_col1
FROM table;
```

7. `FIRST_VALUE()` và `LAST_VALUE()`: Hàm FIRST_VALUE dùng để lấy giá trị đầu tiên của cột được chỉ định trong cửa sổ, hàm LAST_VALUE dùng để lấy giá trị cuối cùng.

```sql
SELECT col1, col2, FIRST_VALUE(col2) OVER (PARTITION BY col1 ORDER BY col2) AS first_val,
                 LAST_VALUE(col2) OVER (PARTITION BY col1 ORDER BY col2) AS last_val
FROM table;
```

Hàm cửa sổ thường cần kết hợp với mệnh đề OVER để xác định kích thước cửa sổ, quy tắc sắp xếp và cách nhóm.

### Top 3 điểm số theo từng loại đề thi

**Mô tả**:

Bảng thông tin đề thi `examination_info` (`exam_id` ID đề thi, `tag` loại đề thi, `difficulty` độ khó, `duration` thời gian thi, `release_time` thời gian phát hành):

| id  | exam_id | tag  | difficulty | duration | release_time        |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL  | hard       | 60       | 2021-09-01 06:00:00 |
| 2   | 9002    | SQL  | hard       | 60       | 2021-09-01 06:00:00 |
| 3   | 9003    | 算法 | medium     | 80       | 2021-09-01 10:00:00 |

Bảng lịch sử làm bài `exam_record` (`uid` ID người dùng, `exam_id` ID đề thi, `start_time` thời gian bắt đầu, `submit_time` thời gian nộp bài, `score` điểm số):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 78     |
| 2   | 1002 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81     |
| 3   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81     |
| 4   | 1003 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:40:01 | 86     |
| 5   | 1003 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:51 | 89     |
| 6   | 1004 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85     |
| 7   | 1005 | 9003    | 2021-09-01 12:01:01 | 2021-09-01 12:31:02 | 85     |
| 8   | 1006 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:21:01 | 84     |
| 9   | 1003 | 9003    | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40     |
| 10  | 1003 | 9002    | 2021-09-01 14:01:01 | (NULL)              | (NULL) |

Tìm top 3 điểm số cao nhất theo từng loại đề thi. Nếu hai người có điểm cao nhất bằng nhau, chọn người có điểm thấp nhất cao hơn; nếu vẫn bằng nhau, chọn uid lớn hơn. Kết quả đầu ra từ dữ liệu mẫu:

| tid  | uid  | ranking |
| ---- | ---- | ------- |
| SQL  | 1003 | 1       |
| SQL  | 1004 | 2       |
| SQL  | 1002 | 3       |
| 算法 | 1005 | 1       |
| 算法 | 1006 | 2       |
| 算法 | 1003 | 3       |

**Giải thích**: Các loại đề thi có bản ghi điểm là SQL và Thuật toán. Đối với đề thi SQL, người dùng 1001, 1002, 1003, 1004 có điểm cao nhất lần lượt là 81, 81, 89, 85; điểm thấp nhất lần lượt là 78, 81, 86, 40. Do đó xếp theo điểm cao nhất rồi điểm thấp nhất, top 3 là 1003, 1004, 1002.

**Đáp án**:

```sql
SELECT tag,
       UID,
       ranking
FROM
  (SELECT b.tag AS tag,
          a.uid AS UID,
          ROW_NUMBER() OVER (PARTITION BY b.tag
                             ORDER BY b.tag,
                                      max(a.score) DESC,
                                      min(a.score) DESC,
                                      a.uid DESC) AS ranking
   FROM exam_record a
   LEFT JOIN examination_info b ON a.exam_id = b.exam_id
   GROUP BY b.tag,
            a.uid) t
WHERE ranking <= 3
```

### Đề thi có hiệu số giữa thời gian hoàn thành nhanh thứ 2 và chậm thứ 2 lớn hơn một nửa thời gian thi (Khó)

**Mô tả**:

Bảng thông tin đề thi `examination_info` (`exam_id` ID đề thi, `tag` loại đề thi, `difficulty` độ khó, `duration` thời gian thi, `release_time` thời gian phát hành):

| id  | exam_id | tag  | difficulty | duration | release_time        |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL  | hard       | 60       | 2021-09-01 06:00:00 |
| 2   | 9002    | C++  | hard       | 60       | 2021-09-01 06:00:00 |
| 3   | 9003    | 算法 | medium     | 80       | 2021-09-01 10:00:00 |

Bảng lịch sử làm bài `exam_record` (`uid` ID người dùng, `exam_id` ID đề thi, `start_time` thời gian bắt đầu, `submit_time` thời gian nộp bài, `score` điểm số):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2021-09-01 09:01:01 | 2021-09-01 09:51:01 | 78     |
| 2   | 1001 | 9002    | 2021-09-01 09:01:01 | 2021-09-01 09:31:00 | 81     |
| 3   | 1002 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:01 | 81     |
| 4   | 1003 | 9001    | 2021-09-01 19:01:01 | 2021-09-01 19:59:01 | 86     |
| 5   | 1003 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:31:51 | 89     |
| 6   | 1004 | 9002    | 2021-09-01 19:01:01 | 2021-09-01 19:30:01 | 85     |
| 7   | 1005 | 9001    | 2021-09-01 12:01:01 | 2021-09-01 12:31:02 | 85     |
| 8   | 1006 | 9001    | 2021-09-07 10:02:01 | 2021-09-07 10:21:01 | 84     |
| 9   | 1003 | 9001    | 2021-09-08 12:01:01 | 2021-09-08 12:11:01 | 40     |
| 10  | 1003 | 9002    | 2021-09-01 14:01:01 | (NULL)              | (NULL) |
| 11  | 1005 | 9001    | 2021-09-01 14:01:01 | (NULL)              | (NULL) |
| 12  | 1003 | 9003    | 2021-09-08 15:01:01 | (NULL)              | (NULL) |

Tìm thông tin đề thi có hiệu số giữa thời gian hoàn thành nhanh thứ 2 và chậm thứ 2 lớn hơn một nửa thời gian thi, sắp xếp giảm dần theo ID đề thi. Kết quả đầu ra:

| exam_id | duration | release_time        |
| ------- | -------- | ------------------- |
| 9001    | 60       | 2021-09-01 06:00:00 |

**Giải thích**: Đề thi 9001 được hoàn thành trong các thời gian 50 phút, 58 phút, 30 phút 1 giây, 19 phút, 10 phút. Hiệu số giữa nhanh thứ 2 và chậm thứ 2 là 50 phút - 19 phút = 31 phút, thời gian thi là 60 phút, thỏa điều kiện lớn hơn một nửa thời gian thi.

**Ý tưởng:**

Bước 1: Tìm thứ hạng thời gian hoàn thành từ nhỏ đến lớn và từ lớn đến nhỏ của từng đề thi (bảng a);

Bước 2: Kết nối với bảng thông tin đề thi b theo exam_id, nhóm theo exam_id, dùng `having` lọc bản ghi xếp hạng thứ 2, chuyển đổi giây sang phút để so sánh, cuối cùng sắp xếp giảm dần theo exam_id.

**Đáp án**:

```sql
SELECT a.exam_id,
       b.duration,
       b.release_time
FROM
  (SELECT exam_id,
          row_number() OVER (PARTITION BY exam_id
                             ORDER BY timestampdiff(SECOND, start_time, submit_time) DESC) rn1,
          row_number() OVER (PARTITION BY exam_id
                            ORDER BY timestampdiff(SECOND, start_time, submit_time) ASC) rn2,
                                              timestampdiff(SECOND, start_time, submit_time) timex
   FROM exam_record
   WHERE score IS NOT NULL ) a
INNER JOIN examination_info b ON a.exam_id = b.exam_id
GROUP BY a.exam_id
HAVING (max(IF (rn1 = 2, a.timex, 0))- max(IF (rn2 = 2, a.timex, 0)))/ 60 > b.duration / 2
ORDER BY a.exam_id DESC
```

### Khoảng thời gian tối đa giữa hai lần làm bài liên tiếp (Khó)

**Mô tả**

Bảng lịch sử làm bài `exam_record` (`uid` ID người dùng, `exam_id` ID đề thi, `start_time` thời gian bắt đầu, `submit_time` thời gian nộp bài, `score` điểm số):

| id  | uid  | exam_id | start_time          | submit_time         | score |
| --- | ---- | ------- | ------------------- | ------------------- | ----- |
| 1   | 1006 | 9003    | 2021-09-07 10:01:01 | 2021-09-07 10:21:02 | 84    |
| 2   | 1006 | 9001    | 2021-09-01 12:11:01 | 2021-09-01 12:31:01 | 89    |
| 3   | 1006 | 9002    | 2021-09-06 10:01:01 | 2021-09-06 10:21:01 | 81    |
| 4   | 1005 | 9002    | 2021-09-05 10:01:01 | 2021-09-05 10:21:01 | 81    |
| 5   | 1005 | 9001    | 2021-09-05 10:31:01 | 2021-09-05 10:51:01 | 81    |

Trong số những người đã làm bài ít nhất 2 ngày khác nhau trong năm 2021, hãy tính khoảng thời gian tối đa `days_window` giữa hai lần làm bài liên tiếp trong năm đó, sau đó tính số bài trung bình trong `days_window` ngày dựa theo lịch sử trong năm đó. Sắp xếp giảm dần theo khoảng thời gian tối đa và số bài trung bình. Kết quả đầu ra:

| uid  | days_window | avg_exam_cnt |
| ---- | ----------- | ------------ |
| 1006 | 6           | 2.57         |

**Giải thích**: Người dùng 1006 đã làm bài vào các ngày 20210901, 20210906, 20210907 với tổng cộng 3 lần. Khoảng thời gian tối đa giữa hai lần liên tiếp là 6 ngày (từ ngày 1 đến ngày 6). Trong 7 ngày từ ngày 1 đến ngày 7, họ làm 3 bài, trung bình 3/7=0.428571 bài/ngày, vậy trong 6 ngày trung bình làm 0.428571\*6=2.57 bài (làm tròn 2 chữ số thập phân). Người dùng 1005 làm 2 bài vào ngày 20210905 nhưng chỉ có 1 ngày làm bài, nên bị lọc ra.

**Ý tưởng:**

Lưu ý trong giải thích trên có gợi ý loại trùng lặp, nhưng KHÔNG loại trùng lặp! Loại trùng lặp sẽ không qua được test case. Lưu ý giới hạn thời gian là năm 2021;

Lưu ý chênh lệch ngày phải +1; và ==bài chưa nộp cũng tính==!!!! (Đề này mô tả không rõ ràng)

**Đáp án**:

```sql
SELECT UID,
       max(datediff(next_time, start_time)) + 1 AS days_window,
       round(count(start_time)/(datediff(max(start_time), min(start_time))+ 1) * (max(datediff(next_time, start_time))+ 1), 2) AS avg_exam_cnt
FROM
  (SELECT UID,
          start_time,
          lead(start_time, 1) OVER (PARTITION BY UID
                                    ORDER BY start_time) AS next_time
   FROM exam_record
   WHERE YEAR (start_time) = '2021' ) a
GROUP BY UID
HAVING count(DISTINCT date(start_time)) > 1
ORDER BY days_window DESC,
         avg_exam_cnt DESC
```

### Tình hình hoàn thành bài của người dùng không có bài chưa hoàn thành trong 3 tháng gần nhất

**Mô tả**:

Bảng lịch sử làm bài `exam_record` (`uid`: ID người dùng, `exam_id`: ID đề thi, `start_time`: thời gian bắt đầu, `submit_time`: thời gian nộp bài (NULL nghĩa là chưa hoàn thành), `score`: điểm số):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1006 | 9003    | 2021-09-06 10:01:01 | 2021-09-06 10:21:02 | 84     |
| 2   | 1006 | 9001    | 2021-08-02 12:11:01 | 2021-08-02 12:31:01 | 89     |
| 3   | 1006 | 9002    | 2021-06-06 10:01:01 | 2021-06-06 10:21:01 | 81     |
| 4   | 1006 | 9002    | 2021-05-06 10:01:01 | 2021-05-06 10:21:01 | 81     |
| 5   | 1006 | 9001    | 2021-05-01 12:01:01 | (NULL)              | (NULL) |
| 6   | 1001 | 9001    | 2021-09-05 10:31:01 | 2021-09-05 10:51:01 | 81     |
| 7   | 1001 | 9003    | 2021-08-01 09:01:01 | 2021-08-01 09:51:11 | 78     |
| 8   | 1001 | 9002    | 2021-07-01 09:01:01 | 2021-07-01 09:31:00 | 81     |
| 9   | 1001 | 9002    | 2021-07-01 12:01:01 | 2021-07-01 12:31:01 | 81     |
| 10  | 1001 | 9002    | 2021-07-01 12:01:01 | (NULL)              | (NULL) |

Tìm số bài đã hoàn thành của những người dùng không có bài nào ở trạng thái chưa hoàn thành trong 3 tháng gần nhất có bản ghi làm bài, sắp xếp giảm dần theo số bài hoàn thành và ID người dùng. Kết quả đầu ra:

| uid  | exam_complete_cnt |
| ---- | ----------------- |
| 1006 | 3                 |

**Giải thích**: Người dùng 1006 có 3 tháng gần nhất là 202109, 202108, 202106, số bài làm là 3, tất cả đều hoàn thành. Người dùng 1001 có 3 tháng gần nhất là 202109, 202108, 202107, số bài làm là 5, số bài hoàn thành là 4, vì có bài chưa hoàn thành nên bị lọc ra.

**Ý tưởng:**

1. Câu `tìm số bài hoàn thành của người dùng không có bài chưa hoàn thành trong 3 tháng gần nhất` - trước tiên phải nhóm theo người dùng
2. 3 tháng gần nhất: dùng dense rank, sắp xếp giảm dần, lọc rank <= 3
3. Đếm số bài làm
4. Ghép các điều kiện còn lại
5. Sắp xếp

**Đáp án**:

```sql
SELECT UID,
       count(score) exam_complete_cnt
FROM
  (SELECT *, DENSE_RANK() OVER (PARTITION BY UID
                             ORDER BY date_format(start_time, '%Y%m') DESC) dr
   FROM exam_record) t1
WHERE dr <= 3
GROUP BY UID
HAVING count(dr)= count(score)
ORDER BY exam_complete_cnt DESC,
         UID DESC
```

### Tình hình làm bài trong 3 tháng gần nhất của 50% người dùng có tỷ lệ chưa hoàn thành cao (Rất khó)

**Mô tả**:

Bảng thông tin người dùng `user_info` (`uid` ID người dùng, `nick_name` biệt danh, `achievement` điểm thành tích, `level` cấp độ, `job` hướng nghề nghiệp, `register_time` thời gian đăng ký):

| id  | uid  | nick_name    | achievement | level | job  | register_time       |
| --- | ---- | ------------ | ----------- | ----- | ---- | ------------------- |
| 1   | 1001 | 牛客 1 号    | 3200        | 7     | 算法 | 2020-01-01 10:00:00 |
| 2   | 1002 | 牛客 2 号    | 2500        | 6     | 算法 | 2020-01-01 10:00:00 |
| 3   | 1003 | 牛客 3 号 ♂ | 2200        | 5     | 算法 | 2020-01-01 10:00:00 |

Bảng thông tin đề thi `examination_info` (`exam_id` ID đề thi, `tag` loại đề thi, `difficulty` độ khó, `duration` thời gian thi, `release_time` thời gian phát hành):

| id  | exam_id | tag    | difficulty | duration | release_time        |
| --- | ------- | ------ | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL    | hard       | 60       | 2020-01-01 10:00:00 |
| 2   | 9002    | SQL    | hard       | 80       | 2020-01-01 10:00:00 |
| 3   | 9003    | 算法   | hard       | 80       | 2020-01-01 10:00:00 |
| 4   | 9004    | PYTHON | medium     | 70       | 2020-01-01 10:00:00 |

Bảng lịch sử làm bài `exam_record` (`uid` ID người dùng, `exam_id` ID đề thi, `start_time` thời gian bắt đầu, `submit_time` thời gian nộp bài, `score` điểm số):

| id  | uid  | exam_id | start_time          | submit_time         | score |
| --- | ---- | ------- | ------------------- | ------------------- | ----- |
| 1   | 1001 | 9001    | 2020-01-01 09:01:01 | 2020-01-01 09:21:59 | 90    |
| 15  | 1002 | 9001    | 2020-01-01 18:01:01 | 2020-01-01 18:59:02 | 90    |
| 13  | 1001 | 9001    | 2020-01-02 10:01:01 | 2020-01-02 10:31:01 | 89    |
| 2   | 1002 | 9001    | 2020-01-20 10:01:01 |                     |       |
| 3   | 1002 | 9001    | 2020-02-01 12:11:01 |                     |       |
| 5   | 1001 | 9001    | 2020-03-01 12:01:01 |                     |       |
| 6   | 1002 | 9001    | 2020-03-01 12:01:01 | 2020-03-01 12:41:01 | 90    |
| 4   | 1003 | 9001    | 2020-03-01 19:01:01 |                     |       |
| 7   | 1002 | 9001    | 2020-05-02 19:01:01 | 2020-05-02 19:32:00 | 90    |
| 14  | 1001 | 9002    | 2020-01-01 12:11:01 |                     |       |
| 8   | 1001 | 9002    | 2020-01-02 19:01:01 | 2020-01-02 19:59:01 | 69    |
| 9   | 1001 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:20:01 | 99    |
| 10  | 1002 | 9002    | 2020-02-02 12:01:01 |                     |       |
| 11  | 1002 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:43:01 | 81    |
| 12  | 1002 | 9002    | 2020-03-02 12:11:01 |                     |       |
| 17  | 1001 | 9002    | 2020-05-05 18:01:01 |                     |       |
| 16  | 1002 | 9003    | 2020-05-06 12:01:01 |                     |       |

Hãy thống kê số bài làm và số bài hoàn thành mỗi tháng trong 3 tháng gần nhất có bản ghi làm bài, của những người dùng cấp 6 và 7 trong số 50% người dùng có tỷ lệ chưa hoàn thành cao nhất trên đề thi SQL. Sắp xếp tăng dần theo ID người dùng và tháng.

Kết quả đầu ra từ dữ liệu mẫu:

| uid  | start_month | total_cnt | complete_cnt |
| ---- | ----------- | --------- | ------------ |
| 1002 | 202002      | 3         | 1            |
| 1002 | 202003      | 2         | 1            |
| 1002 | 202005      | 2         | 1            |

Giải thích: Tỷ lệ chưa hoàn thành, tổng số bài, số bài chưa hoàn thành của từng người dùng trên đề thi SQL:

| uid  | incomplete_cnt | total_cnt | incomplete_rate |
| ---- | -------------- | --------- | --------------- |
| 1001 | 3              | 7         | 0.4286          |
| 1002 | 4              | 8         | 0.5000          |
| 1003 | 1              | 1         | 1.0000          |

1001, 1002, 1003 xếp ở vị trí 1.0, 0.5, 0.0. Do đó 50% người dùng có tỷ lệ cao nhất (thứ hạng <= 0.5) là 1002, 1003;

1003 không phải cấp 6 hoặc 7;

3 tháng gần nhất có bản ghi là 202005, 202003, 202002;

Trong 3 tháng này, số bài làm của 1002 lần lượt là 3, 2, 2; số bài hoàn thành là 1, 1, 1.

**Ý tưởng:**

Lưu ý: Bài này cần đếm tổng số bài và số bài hoàn thành, còn đề thi SQL chỉ để lọc tỷ lệ chưa hoàn thành, người dùng cấp 6 và 7 để lọc bản ghi làm bài.

Trước tiên tính thứ hạng tỷ lệ chưa hoàn thành:

```sql
SELECT UID,
       count(submit_time IS NULL
             OR NULL)/ count(start_time) AS num,
       PERCENT_RANK() OVER (
                            ORDER BY count(submit_time IS NULL
                                           OR NULL)/ count(start_time)) AS ranking
FROM exam_record
LEFT JOIN examination_info USING (exam_id)
WHERE tag = 'SQL'
GROUP BY UID
```

Sau đó tính bản ghi luyện tập 3 tháng gần nhất:

```sql
SELECT UID,
       date_format(start_time, '%Y%m') AS month_d,
       submit_time,
       exam_id,
       dense_rank() OVER (PARTITION BY UID
                          ORDER BY date_format(start_time, '%Y%m') DESC) AS ranking
FROM exam_record
LEFT JOIN user_info USING (UID)
WHERE LEVEL IN (6,7)
```

**Đáp án**:

```sql
SELECT t1.uid,
       t1.month_d,
       count(*) AS total_cnt,
       count(t1.submit_time) AS complete_cnt
FROM-- Tính thứ hạng tỷ lệ chưa hoàn thành

  (SELECT UID,
          count(submit_time IS NULL OR NULL)/ count(start_time) AS num,
          PERCENT_RANK() OVER (
                               ORDER BY count(submit_time IS NULL OR NULL)/ count(start_time)) AS ranking
   FROM exam_record
   LEFT JOIN examination_info USING (exam_id)
   WHERE tag = 'SQL'
   GROUP BY UID) t
INNER JOIN
  (-- Tính bản ghi luyện tập 3 tháng gần nhất
 SELECT UID,
        date_format(start_time, '%Y%m') AS month_d,
        submit_time,
        exam_id,
        dense_rank() OVER (PARTITION BY UID
                           ORDER BY date_format(start_time, '%Y%m') DESC) AS ranking
   FROM exam_record
   LEFT JOIN user_info USING (UID)
   WHERE LEVEL IN (6,7) ) t1 USING (UID)
WHERE t1.ranking <= 3 AND t.ranking >= 0.5 -- Dùng điều kiện lọc để tìm bản ghi thỏa mãn

GROUP BY t1.uid,
         t1.month_d
ORDER BY t1.uid,
         t1.month_d
```

### Tốc độ tăng trưởng và biến động thứ hạng số lần hoàn thành đề thi so với cùng kỳ năm 2020 (Rất khó)

**Mô tả**:

Bảng thông tin đề thi `examination_info` (`exam_id` ID đề thi, `tag` loại đề thi, `difficulty` độ khó, `duration` thời gian thi, `release_time` thời gian phát hành):

| id  | exam_id | tag    | difficulty | duration | release_time        |
| --- | ------- | ------ | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL    | hard       | 60       | 2021-01-01 10:00:00 |
| 2   | 9002    | C++    | hard       | 80       | 2021-01-01 10:00:00 |
| 3   | 9003    | 算法   | hard       | 80       | 2021-01-01 10:00:00 |
| 4   | 9004    | PYTHON | medium     | 70       | 2021-01-01 10:00:00 |

Bảng lịch sử làm bài `exam_record` (`uid` ID người dùng, `exam_id` ID đề thi, `start_time` thời gian bắt đầu, `submit_time` thời gian nộp bài, `score` điểm số):

| id  | uid  | exam_id | start_time          | submit_time         | score |
| --- | ---- | ------- | ------------------- | ------------------- | ----- |
| 1   | 1001 | 9001    | 2020-08-02 10:01:01 | 2020-08-02 10:31:01 | 89    |
| 2   | 1002 | 9001    | 2020-04-01 18:01:01 | 2020-04-01 18:59:02 | 90    |
| 3   | 1001 | 9001    | 2020-04-01 09:01:01 | 2020-04-01 09:21:59 | 80    |
| 5   | 1002 | 9001    | 2021-03-02 19:01:01 | 2021-03-02 19:32:00 | 20    |
| 8   | 1003 | 9001    | 2021-05-02 12:01:01 | 2021-05-02 12:31:01 | 98    |
| 13  | 1003 | 9001    | 2020-01-02 10:01:01 | 2020-01-02 10:31:01 | 89    |
| 9   | 1001 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:20:01 | 99    |
| 10  | 1002 | 9002    | 2021-02-02 12:01:01 | 2020-02-02 12:43:01 | 81    |
| 11  | 1001 | 9002    | 2020-01-02 19:01:01 | 2020-01-02 19:59:01 | 69    |
| 16  | 1002 | 9002    | 2020-02-02 12:01:01 |                     |       |
| 17  | 1002 | 9002    | 2020-03-02 12:11:01 |                     |       |
| 18  | 1001 | 9002    | 2021-05-05 18:01:01 |                     |       |
| 4   | 1002 | 9003    | 2021-01-20 10:01:01 | 2021-01-20 10:10:01 | 81    |
| 6   | 1001 | 9003    | 2021-04-02 19:01:01 | 2021-04-02 19:40:01 | 89    |
| 15  | 1002 | 9003    | 2021-01-01 18:01:01 | 2021-01-01 18:59:02 | 90    |
| 7   | 1004 | 9004    | 2020-05-02 12:01:01 | 2020-05-02 12:20:01 | 99    |
| 12  | 1001 | 9004    | 2021-09-02 12:11:01 |                     |       |
| 14  | 1002 | 9004    | 2020-01-01 12:11:01 | 2020-01-01 12:31:01 | 83    |

Hãy tính tốc độ tăng trưởng số lần hoàn thành của từng loại đề thi trong nửa đầu năm 2021 so với cùng kỳ nửa đầu năm 2020 (định dạng phần trăm, giữ 1 chữ số thập phân), cùng với biến động thứ hạng số lần hoàn thành. Sắp xếp giảm dần theo tốc độ tăng trưởng và thứ hạng năm 2021.

Kết quả đầu ra từ dữ liệu mẫu:

| tag | exam_cnt_20 | exam_cnt_21 | growth_rate | exam_cnt_rank_20 | exam_cnt_rank_21 | rank_delta |
| --- | ----------- | ----------- | ----------- | ---------------- | ---------------- | ---------- |
| SQL | 3           | 2           | -33.3%      | 1                | 2                | 1          |

Giải thích: Nửa đầu năm 2020 có 3 tag có bản ghi hoàn thành là C++, SQL, PYTHON với số lần hoàn thành là 3, 3, 2, thứ hạng là 1, 1 (đồng hạng), 3;

Nửa đầu năm 2021 có 2 tag có bản ghi hoàn thành là Thuật toán, SQL với số lần hoàn thành là 3, 2, thứ hạng là 1, 2. Chi tiết:

| tag    | start_year | exam_cnt | exam_cnt_rank |
| ------ | ---------- | -------- | ------------- |
| C++    | 2020       | 3        | 1             |
| SQL    | 2020       | 3        | 1             |
| PYTHON | 2020       | 2        | 3             |
| 算法   | 2021       | 3        | 1             |
| SQL    | 2021       | 2        | 2             |

Tag duy nhất có thể so sánh cùng kỳ là SQL. Từ 2020 đến 2021, số lần hoàn thành 3=>2, giảm 33.3%; thứ hạng 1=>2, tụt 1 hạng.

**Ý tưởng:**

Điểm khó trong bài này là kiểu dữ liệu số nguyên dài không thể có dấu âm, dùng hàm cast để chuyển đổi kiểu dữ liệu sang signed.

Công thức tính tốc độ tăng trưởng: `(exam_cnt_21-exam_cnt_20)/exam_cnt_20`

Biến động thứ hạng số lần hoàn thành (thứ hạng tăng hay giảm bao nhiêu từ 2020 đến 2021):

Công thức: `exam_cnt_rank_21 - exam_cnt_rank_20`

Trong MySQL, hàm `CAST()` dùng để chuyển đổi kiểu dữ liệu của biểu thức. Cú pháp cơ bản:

```sql
CAST(expression AS data_type)

-- Chuyển một chuỗi thành số nguyên
SELECT CAST('123' AS INT);
```

Ví dụ đơn giản, hàm này rất dễ dùng.

**Đáp án**:

```sql
SELECT
  tag,
  exam_cnt_20,
  exam_cnt_21,
  concat(
    round(
      100 * (exam_cnt_21 - exam_cnt_20) / exam_cnt_20,
      1
    ),
    '%'
  ) AS growth_rate,
  exam_cnt_rank_20,
  exam_cnt_rank_21,
  cast(exam_cnt_rank_21 AS signed) - cast(exam_cnt_rank_20 AS signed) AS rank_delta
FROM
  (
    #Số lần hoàn thành và thứ hạng của từng loại đề thi nửa đầu năm 2020 và 2021
    SELECT
      tag,
      count(
        IF (
          date_format(start_time, '%Y%m%d') BETWEEN '20200101'
          AND '20200630',
          start_time,
          NULL
        )
      ) AS exam_cnt_20,
      count(
        IF (
          substring(start_time, 1, 10) BETWEEN '2021-01-01'
          AND '2021-06-30',
          start_time,
          NULL
        )
      ) AS exam_cnt_21,
      rank() over (
        ORDER BY
          count(
            IF (
              date_format(start_time, '%Y%m%d') BETWEEN '20200101'
              AND '20200630',
              start_time,
              NULL
            )
          ) DESC
      ) AS exam_cnt_rank_20,
      rank() over (
        ORDER BY
          count(
            IF (
              substring(start_time, 1, 10) BETWEEN '2021-01-01'
              AND '2021-06-30',
              start_time,
              NULL
            )
          ) DESC
      ) AS exam_cnt_rank_21
    FROM
      examination_info
      JOIN exam_record USING (exam_id)
    WHERE
      submit_time IS NOT NULL
    GROUP BY
      tag
  ) main
WHERE
  exam_cnt_21 * exam_cnt_20 <> 0
ORDER BY
  growth_rate DESC,
  exam_cnt_rank_21 DESC
```

## Hàm cửa sổ tổng hợp

### Chuẩn hóa min-max điểm số đề thi

**Mô tả**:

Bảng thông tin đề thi `examination_info` (`exam_id` ID đề thi, `tag` loại đề thi, `difficulty` độ khó, `duration` thời gian thi, `release_time` thời gian phát hành):

| id  | exam_id | tag    | difficulty | duration | release_time        |
| --- | ------- | ------ | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL    | hard       | 60       | 2020-01-01 10:00:00 |
| 2   | 9002    | C++    | hard       | 80       | 2020-01-01 10:00:00 |
| 3   | 9003    | 算法   | hard       | 80       | 2020-01-01 10:00:00 |
| 4   | 9004    | PYTHON | medium     | 70       | 2020-01-01 10:00:00 |

Bảng lịch sử làm bài `exam_record` (`uid` ID người dùng, `exam_id` ID đề thi, `start_time` thời gian bắt đầu, `submit_time` thời gian nộp bài, `score` điểm số):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 6   | 1003 | 9001    | 2020-01-02 12:01:01 | 2020-01-02 12:31:01 | 68     |
| 9   | 1001 | 9001    | 2020-01-02 10:01:01 | 2020-01-02 10:31:01 | 89     |
| 1   | 1001 | 9001    | 2020-01-01 09:01:01 | 2020-01-01 09:21:59 | 90     |
| 12  | 1002 | 9002    | 2021-05-05 18:01:01 | (NULL)              | (NULL) |
| 3   | 1004 | 9002    | 2020-01-01 12:01:01 | 2020-01-01 12:11:01 | 60     |
| 2   | 1003 | 9002    | 2020-01-01 19:01:01 | 2020-01-01 19:30:01 | 75     |
| 7   | 1001 | 9002    | 2020-01-02 12:01:01 | 2020-01-02 12:43:01 | 81     |
| 10  | 1002 | 9002    | 2020-01-01 12:11:01 | 2020-01-01 12:31:01 | 83     |
| 4   | 1003 | 9002    | 2020-01-01 12:01:01 | 2020-01-01 12:41:01 | 90     |
| 5   | 1002 | 9002    | 2020-01-02 19:01:01 | 2020-01-02 19:32:00 | 90     |
| 11  | 1002 | 9004    | 2021-09-06 12:01:01 | (NULL)              | (NULL) |
| 8   | 1001 | 9005    | 2020-01-02 12:11:01 | (NULL)              | (NULL) |

Trong vật lý và thống kê, có khái niệm chuẩn hóa min-max (hay chuẩn hóa phạm vi), là phép biến đổi tuyến tính của dữ liệu gốc để ánh xạ kết quả vào khoảng [0-1].

Công thức chuyển đổi:

![](/images/github/javaguide/database/sql/29A377601170AB822322431FCDF7EDFE.png)

Hãy áp dụng chuẩn hóa min-max trên điểm số bài làm đề thi độ khó cao của từng đề thi, sau đó thu nhỏ về khoảng [0,100] và xuất ID người dùng, ID đề thi, điểm trung bình sau chuẩn hóa. Cuối cùng sắp xếp tăng dần theo ID đề thi, giảm dần theo điểm đã chuẩn hóa. (Lưu ý: khoảng điểm mặc định là [0,100]; nếu trong bản ghi làm bài một đề thi chỉ có một điểm duy nhất, không cần dùng công thức, điểm sau chuẩn hóa vẫn là điểm gốc).

Kết quả đầu ra từ dữ liệu mẫu:

| uid  | exam_id | avg_new_score |
| ---- | ------- | ------------- |
| 1001 | 9001    | 98            |
| 1003 | 9001    | 0             |
| 1002 | 9002    | 88            |
| 1003 | 9002    | 75            |
| 1001 | 9002    | 70            |
| 1004 | 9002    | 0             |

Giải thích: Đề thi độ khó cao là 9001, 9002, 9003;

Bản ghi làm đề 9001 có 3 bài, điểm là 68, 89, 90. Sau chuẩn hóa theo công thức là 0, 95, 100. Hai điểm cuối đều của người dùng 1001, nên điểm trung bình mới của 1001 là (95+100)/2 ≈ 98 (chỉ lấy phần nguyên). Điểm mới của 1003 là 0.

**Ý tưởng:**

Lưu ý:

1. Dùng hàm cửa sổ `max/min(col) over()` tính giá trị lớn nhất và nhỏ nhất trong mỗi nhóm đề thi độ khó cao, sau đó tính công thức chuẩn hóa và nhân 100.
2. Nếu một đề thi chỉ có một điểm thì không dùng công thức, vì max_score = min_score, kết quả có thể bằng 0.
3. Cuối cùng nhóm theo uid, exam_id để tính trung bình sau chuẩn hóa, lọc NULL.

**Đáp án**:

```sql
SELECT
  uid,
  exam_id,
  round(sum(min_max) / count(score), 0) AS avg_new_score
FROM
  (
    SELECT
      *,
      IF (
        max_score = min_score,
        score,
        (score - min_score) / (max_score - min_score) * 100
      ) AS min_max
    FROM
      (
        SELECT
          uid,
          a.exam_id,
          score,
          max(score) over (PARTITION BY a.exam_id) AS max_score,
          min(score) over (PARTITION BY a.exam_id) AS min_score
        FROM
          exam_record a
          LEFT JOIN examination_info b USING (exam_id)
        WHERE
          difficulty = 'hard'
      ) t
    WHERE
      score IS NOT NULL
  ) t1
GROUP BY
  uid,
  exam_id
ORDER BY
  exam_id ASC,
  avg_new_score DESC;
```

### Số lần làm bài mỗi tháng và tổng lũy kế đến tháng hiện tại cho từng đề thi

**Mô tả:**

Bảng lịch sử làm bài exam_record (uid ID người dùng, exam_id ID đề thi, start_time thời gian bắt đầu, submit_time thời gian nộp bài, score điểm số):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-01 09:01:01 | 2020-01-01 09:21:59 | 90     |
| 2   | 1002 | 9001    | 2020-01-20 10:01:01 | 2020-01-20 10:10:01 | 89     |
| 3   | 1002 | 9001    | 2020-02-01 12:11:01 | 2020-02-01 12:31:01 | 83     |
| 4   | 1003 | 9001    | 2020-03-01 19:01:01 | 2020-03-01 19:30:01 | 75     |
| 5   | 1004 | 9001    | 2020-03-01 12:01:01 | 2020-03-01 12:11:01 | 60     |
| 6   | 1003 | 9001    | 2020-03-01 12:01:01 | 2020-03-01 12:41:01 | 90     |
| 7   | 1002 | 9001    | 2020-05-02 19:01:01 | 2020-05-02 19:32:00 | 90     |
| 8   | 1001 | 9002    | 2020-01-02 19:01:01 | 2020-01-02 19:59:01 | 69     |
| 9   | 1004 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:20:01 | 99     |
| 10  | 1003 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:31:01 | 68     |
| 11  | 1001 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:43:01 | 81     |
| 12  | 1001 | 9002    | 2020-03-02 12:11:01 | (NULL)              | (NULL) |

Hãy xuất số lần làm bài mỗi tháng và tổng lũy kế đến tháng hiện tại cho từng đề thi.
Kết quả đầu ra từ dữ liệu mẫu:

| exam_id | start_month | month_cnt | cum_exam_cnt |
| ------- | ----------- | --------- | ------------ |
| 9001    | 202001      | 2         | 2            |
| 9001    | 202002      | 1         | 3            |
| 9001    | 202003      | 3         | 6            |
| 9001    | 202005      | 1         | 7            |
| 9002    | 202001      | 1         | 1            |
| 9002    | 202002      | 3         | 4            |
| 9002    | 202003      | 1         | 5            |

Giải thích: Đề thi 9001 có bản ghi làm bài trong 4 tháng 202001, 202002, 202003, 202005, số lần lần lượt là 2, 1, 3, 1, tổng lũy kế là 2, 3, 6, 7.

**Ý tưởng:**

Hai điểm mấu chốt: tính tổng lũy kế đến tháng hiện tại và xuất số lần mỗi tháng.

Đây là câu quan trọng: `**sum(count(*)) over(partition by exam_id order by date_format(start_time,'%Y%m'))**`

**Đáp án**:

```sql
SELECT exam_id,
       date_format(start_time, '%Y%m') AS start_month,
       count(*) AS month_cnt,
       sum(count(*)) OVER (PARTITION BY exam_id
                           ORDER BY date_format(start_time, '%Y%m')) AS cum_exam_cnt
FROM exam_record
GROUP BY exam_id,
         start_month
```

### Tình hình làm bài mỗi tháng và lũy kế đến tháng hiện tại (Khó)

**Mô tả**: Bảng lịch sử làm bài `exam_record` (`uid` ID người dùng, `exam_id` ID đề thi, `start_time` thời gian bắt đầu, `submit_time` thời gian nộp bài, `score` điểm số):

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-01 09:01:01 | 2020-01-01 09:21:59 | 90     |
| 2   | 1002 | 9001    | 2020-01-20 10:01:01 | 2020-01-20 10:10:01 | 89     |
| 3   | 1002 | 9001    | 2020-02-01 12:11:01 | 2020-02-01 12:31:01 | 83     |
| 4   | 1003 | 9001    | 2020-03-01 19:01:01 | 2020-03-01 19:30:01 | 75     |
| 5   | 1004 | 9001    | 2020-03-01 12:01:01 | 2020-03-01 12:11:01 | 60     |
| 6   | 1003 | 9001    | 2020-03-01 12:01:01 | 2020-03-01 12:41:01 | 90     |
| 7   | 1002 | 9001    | 2020-05-02 19:01:01 | 2020-05-02 19:32:00 | 90     |
| 8   | 1001 | 9002    | 2020-01-02 19:01:01 | 2020-01-02 19:59:01 | 69     |
| 9   | 1004 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:20:01 | 99     |
| 10  | 1003 | 9002    | 2020-02-02 12:01:01 | 2020-02-02 12:31:01 | 68     |
| 11  | 1001 | 9002    | 2020-01-02 19:01:01 | 2020-02-02 12:43:01 | 81     |
| 12  | 1001 | 9002    | 2020-03-02 12:11:01 | (NULL)              | (NULL) |

Hãy xuất số người dùng hoạt động hàng tháng (MAU), số người dùng mới, số người dùng mới cao nhất trong tháng lũy kế đến tháng hiện tại, và tổng số người dùng lũy kế đến tháng hiện tại kể từ khi có bản ghi làm bài đầu tiên. Sắp xếp tăng dần theo tháng.

Kết quả đầu ra từ dữ liệu mẫu:

| start_month | mau | month_add_uv | max_month_add_uv | cum_sum_uv |
| ----------- | --- | ------------ | ---------------- | ---------- |
| 202001      | 2   | 2            | 2                | 2          |
| 202002      | 4   | 2            | 2                | 4          |
| 202003      | 3   | 0            | 2                | 4          |
| 202005      | 1   | 0            | 2                | 4          |

| month  | 1001 | 1002 | 1003 | 1004 |
| ------ | ---- | ---- | ---- | ---- |
| 202001 | 1    | 1    |      |      |
| 202002 | 1    | 1    | 1    | 1    |
| 202003 | 1    |      | 1    | 1    |
| 202005 |      | 1    |      |      |

Từ ma trận trên, tháng 1/2020 có 2 người dùng hoạt động (MAU=2), số người dùng mới là 2;

Tháng 2/2020 có 4 người hoạt động, số người mới là 2, số người mới tối đa trong một tháng là 2, tổng số người dùng lũy kế là 4.

**Ý tưởng:**

Điểm khó:

1. Cách tính số người dùng mới mỗi tháng
2. Tình hình lũy kế đến tháng hiện tại

Quy trình tổng quát:

(1) Tính tháng đăng nhập đầu tiên của mỗi người dùng `min()`

(2) Tính MAU và số người dùng mới mỗi tháng: trước tiên tính tháng đăng nhập đầu tiên của mỗi người, sau đó nhóm theo tháng đó để tính số người mới

(3) Tính số người mới tối đa trong một tháng lũy kế và tổng số người dùng lũy kế, sắp xếp theo tháng tăng dần

**Đáp án**:

```sql
-- Số người mới tối đa một tháng lũy kế và tổng lũy kế, sắp xếp theo tháng tăng dần
SELECT
	start_month,
	mau,
	month_add_uv,
	max( month_add_uv ) over ( ORDER BY start_month ),
	sum( month_add_uv ) over ( ORDER BY start_month )
FROM
	(
	-- Tính MAU và số người dùng mới mỗi tháng
	SELECT
		date_format( a.start_time, '%Y%m' ) AS start_month,
		count( DISTINCT a.uid ) AS mau,
		count( DISTINCT b.uid ) AS month_add_uv
	FROM
		exam_record a
		LEFT JOIN (
         -- Tính tháng đăng nhập đầu tiên của mỗi người
		SELECT uid, min( date_format( start_time, '%Y%m' )) AS first_month FROM exam_record GROUP BY uid ) b ON date_format( a.start_time, '%Y%m' ) = b.first_month
	GROUP BY
		start_month
	) main
ORDER BY
	start_month
```

<!-- @include: @article-footer.snippet.md -->
