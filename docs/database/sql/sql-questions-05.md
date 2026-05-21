---
title: Tổng hợp câu hỏi phỏng vấn SQL thường gặp (5)
description: Phần 5 tổng hợp câu hỏi phỏng vấn SQL thường gặp, giải thích chi tiết kỹ thuật xử lý giá trị NULL, bao gồm các hàm IFNULL, COALESCE, và sử dụng CASE WHEN để thống kê có điều kiện và tính tỷ lệ hoàn thành.
category: Cơ sở dữ liệu
tag:
  - Cơ bản về cơ sở dữ liệu
  - SQL
head:
  - - meta
    - name: keywords
      content: SQL面试题,NULL空值处理,IFNULL,COALESCE,CASE WHEN,条件统计,完成率计算
---

> Nguồn câu hỏi từ: [NowCoder - Thử thách SQL Nâng cao](https://www.nowcoder.com/exam/oj?page=1&tab=SQL%E7%AF%87&topicId=240)

Các câu hỏi khó hoặc rất khó có thể bỏ qua tùy theo tình huống thực tế và nhu cầu phỏng vấn của bạn.

## Xử lý giá trị NULL

### Thống kê số lần chưa hoàn thành và tỷ lệ chưa hoàn thành của bài thi có trạng thái chưa hoàn thành

**Mô tả**:

Cho bảng bản ghi làm bài thi `exam_record`（`uid` ID người dùng, `exam_id` ID đề thi, `start_time` thời gian bắt đầu làm bài, `submit_time` thời gian nộp bài, `score` điểm số）, dữ liệu như sau:

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-02 09:01:01 | 2020-01-02 09:21:01 | 80     |
| 2   | 1001 | 9001    | 2021-05-02 10:01:01 | 2021-05-02 10:30:01 | 81     |
| 3   | 1001 | 9001    | 2021-09-02 12:01:01 | (NULL)              | (NULL) |

Hãy thống kê số lần chưa hoàn thành incomplete_cnt và tỷ lệ chưa hoàn thành incomplete_rate của các đề thi có trạng thái chưa hoàn thành. Kết quả đầu ra từ dữ liệu mẫu như sau:

| exam_id | incomplete_cnt | complete_rate |
| ------- | -------------- | ------------- |
| 9001    | 1              | 0.333         |

Giải thích: Đề thi 9001 có 3 lần được làm, trong đó hai lần hoàn thành, 1 lần chưa hoàn thành, do đó số lần chưa hoàn thành là 1, tỷ lệ chưa hoàn thành là 0.333 (làm tròn đến 3 chữ số thập phân)

**Tư duy**:

Câu hỏi này chỉ cần lưu ý một cái có điều kiện hạn chế, một cái không có điều kiện hạn chế; hoặc truy vấn riêng từng điều kiện rồi kết hợp; hoặc trực tiếp thực hiện phán định điều kiện trong select.

**Đáp án**:

Cách viết 1:

```sql
SELECT
    exam_id,
    (COUNT(*) - COUNT(submit_time)) AS incomplete_cnt,
    ROUND((COUNT(*) - COUNT(submit_time)) / COUNT(*), 3) AS incomplete_rate
FROM
    exam_record
GROUP BY
    exam_id
HAVING
    (COUNT(*) - COUNT(submit_time)) > 0;
```

Sử dụng `COUNT(*)` để đếm tổng số bản ghi trong nhóm, `COUNT(submit_time)` chỉ đếm số bản ghi mà trường `submit_time` không phải NULL (tức là số đã hoàn thành). Lấy hiệu hai giá trị đó chính là số chưa hoàn thành.

Cách viết 2:

```sql
SELECT
    exam_id,
    COUNT(CASE WHEN submit_time IS NULL THEN 1 END) AS incomplete_cnt,
    ROUND(COUNT(CASE WHEN submit_time IS NULL THEN 1 END) / COUNT(*), 3) AS incomplete_rate
FROM
    exam_record
GROUP BY
    exam_id
HAVING
    COUNT(CASE WHEN submit_time IS NULL THEN 1 END) > 0;
```

Sử dụng biểu thức `CASE`, khi điều kiện thỏa mãn trả về một giá trị khác `NULL` (ví dụ 1), ngược lại trả về `NULL`. Sau đó dùng hàm `COUNT` để đếm số giá trị khác `NULL`.

Cách viết 3:

```sql
SELECT
    exam_id,
    SUM(submit_time IS NULL) AS incomplete_cnt,
    ROUND(SUM(submit_time IS NULL) / COUNT(*), 3) AS incomplete_rate
FROM
    exam_record
GROUP BY
    exam_id
HAVING
    incomplete_cnt > 0;
```

Sử dụng hàm `SUM` để tính tổng của một biểu thức. Khi `submit_time` là `NULL`, biểu thức `(submit_time IS NULL)` có giá trị là 1 (TRUE), ngược lại là 0 (FALSE). Cộng tất cả các 1 và 0 lại ta được số lần chưa hoàn thành.

### Thời gian làm bài trung bình và điểm trung bình của đề thi khó dành cho người dùng cấp 0

**Mô tả**:

Cho bảng thông tin người dùng `user_info`（`uid` ID người dùng，`nick_name` biệt danh, `achievement` điểm thành tựu, `level` cấp độ, `job` hướng nghề nghiệp, `register_time` thời gian đăng ký）, dữ liệu như sau:

| id  | uid  | nick_name | achievement | level | job  | register_time       |
| --- | ---- | --------- | ----------- | ----- | ---- | ------------------- |
| 1   | 1001 | 牛客 1 号 | 10          | 0     | 算法 | 2020-01-01 10:00:00 |
| 2   | 1002 | 牛客 2 号 | 2100        | 6     | 算法 | 2020-01-01 10:00:00 |

Bảng thông tin đề thi `examination_info`（`exam_id` ID đề thi, `tag` danh mục đề thi, `difficulty` độ khó đề thi, `duration` thời lượng thi, `release_time` thời gian phát hành）, dữ liệu như sau:

| id  | exam_id | tag  | difficulty | duration | release_time        |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1   | 9001    | SQL  | hard       | 60       | 2020-01-01 10:00:00 |
| 2   | 9002    | SQL  | easy       | 60       | 2020-01-01 10:00:00 |
| 3   | 9004    | 算法 | medium     | 80       | 2020-01-01 10:00:00 |

Bảng bản ghi làm bài thi `exam_record`（`uid` ID người dùng, `exam_id` ID đề thi, `start_time` thời gian bắt đầu làm bài, `submit_time` thời gian nộp bài, `score` điểm số）, dữ liệu như sau:

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-02 09:01:01 | 2020-01-02 09:21:59 | 80     |
| 2   | 1001 | 9001    | 2021-05-02 10:01:01 | (NULL)              | (NULL) |
| 3   | 1001 | 9002    | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87     |
| 4   | 1001 | 9001    | 2021-06-02 19:01:01 | 2021-06-02 19:32:00 | 20     |
| 5   | 1001 | 9002    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89     |
| 6   | 1001 | 9002    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 7   | 1002 | 9002    | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90     |

Hãy xuất thời gian làm bài trung bình và điểm trung bình của tất cả các bài thi đề khó của mỗi người dùng cấp 0, các bài chưa hoàn thành mặc định lấy thời lượng thi tối đa và 0 điểm. Kết quả đầu ra từ dữ liệu mẫu như sau:

| uid  | avg_score | avg_time_took |
| ---- | --------- | ------------- |
| 1001 | 33        | 36.7          |

Giải thích: Người dùng cấp 0 có 1001, đề thi khó có 9001, 1001 có 3 bản ghi làm bài 9001, lần lượt mất 20 phút, chưa hoàn thành (thời lượng thi 60 phút), 30 phút (chưa đủ 31 phút), điểm lần lượt là 80, chưa hoàn thành (tính 0 điểm), 20. Vì vậy thời gian làm bài trung bình là 110/3=36.7 (làm tròn 1 chữ số thập phân), điểm trung bình là 33 (làm tròn)

**Tư duy**: Câu hỏi này dùng `IF` là cách phán định thuận tiện nhất, vì liên quan đến xử lý giá trị NULL. Tất nhiên `case when` cũng được, đại đồng tiểu dị. Điểm khó của câu hỏi này chính là xử lý giá trị null, còn những điều kiện truy vấn khác thì không khó.

**Đáp án**:

```sql
SELECT UID,
       round(avg(new_socre)) AS avg_score,
       round(avg(time_diff), 1) AS avg_time_took
FROM
  (SELECT er.uid,
          IF (er.submit_time IS NOT NULL, TIMESTAMPDIFF(MINUTE, start_time, submit_time), ef.duration) AS time_diff,
          IF (er.submit_time IS NOT NULL,er.score,0) AS new_socre
   FROM exam_record er
   LEFT JOIN user_info uf ON er.uid = uf.uid
   LEFT JOIN examination_info ef ON er.exam_id = ef.exam_id
   WHERE uf.LEVEL = 0 AND ef.difficulty = 'hard' ) t
GROUP BY UID
ORDER BY UID
```

## Câu lệnh điều kiện nâng cao

### Lọc người dùng theo điều kiện biệt danh, điểm thành tựu và ngày hoạt động (khó hơn)

**Mô tả**:

Cho bảng thông tin người dùng `user_info`（`uid` ID người dùng，`nick_name` biệt danh, `achievement` điểm thành tựu, `level` cấp độ, `job` hướng nghề nghiệp, `register_time` thời gian đăng ký）:

| id  | uid  | nick_name   | achievement | level | job  | register_time       |
| --- | ---- | ----------- | ----------- | ----- | ---- | ------------------- |
| 1   | 1001 | 牛客 1 号   | 1000        | 2     | 算法 | 2020-01-01 10:00:00 |
| 2   | 1002 | 牛客 2 号   | 1200        | 3     | 算法 | 2020-01-01 10:00:00 |
| 3   | 1003 | 进击的 3 号 | 2200        | 5     | 算法 | 2020-01-01 10:00:00 |
| 4   | 1004 | 牛客 4 号   | 2500        | 6     | 算法 | 2020-01-01 10:00:00 |
| 5   | 1005 | 牛客 5 号   | 3000        | 7     | C++  | 2020-01-01 10:00:00 |

Bảng bản ghi làm bài thi `exam_record`（`uid` ID người dùng, `exam_id` ID đề thi, `start_time` thời gian bắt đầu làm bài, `submit_time` thời gian nộp bài, `score` điểm số）:

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-02 09:01:01 | 2020-01-02 09:21:59 | 80     |
| 3   | 1001 | 9002    | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87     |
| 2   | 1001 | 9001    | 2021-05-02 10:01:01 | (NULL)              | (NULL) |
| 4   | 1001 | 9001    | 2021-06-02 19:01:01 | 2021-06-02 19:32:00 | 20     |
| 6   | 1001 | 9002    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 5   | 1001 | 9002    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89     |
| 11  | 1002 | 9001    | 2020-01-01 12:01:01 | 2020-01-01 12:31:01 | 81     |
| 12  | 1002 | 9002    | 2020-02-01 12:01:01 | 2020-02-01 12:31:01 | 82     |
| 13  | 1002 | 9002    | 2020-02-02 12:11:01 | 2020-02-02 12:31:01 | 83     |
| 7   | 1002 | 9002    | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90     |
| 16  | 1002 | 9001    | 2021-09-06 12:01:01 | 2021-09-06 12:21:01 | 80     |
| 17  | 1002 | 9001    | 2021-09-06 12:01:01 | (NULL)              | (NULL) |
| 18  | 1002 | 9001    | 2021-09-07 12:01:01 | (NULL)              | (NULL) |
| 8   | 1003 | 9003    | 2021-02-06 12:01:01 | (NULL)              | (NULL) |
| 9   | 1003 | 9001    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 89     |
| 10  | 1004 | 9002    | 2021-08-06 12:01:01 | (NULL)              | (NULL) |
| 14  | 1005 | 9001    | 2021-02-01 11:01:01 | 2021-02-01 11:31:01 | 84     |
| 15  | 1006 | 9001    | 2021-02-01 11:01:01 | 2021-02-01 11:31:01 | 84     |

Bảng bản ghi luyện tập câu hỏi `practice_record`（`uid` ID người dùng, `question_id` ID câu hỏi, `submit_time` thời gian nộp, `score` điểm số）:

| id  | uid  | question_id | submit_time         | score |
| --- | ---- | ----------- | ------------------- | ----- |
| 1   | 1001 | 8001        | 2021-08-02 11:41:01 | 60    |
| 2   | 1002 | 8001        | 2021-09-02 19:30:01 | 50    |
| 3   | 1002 | 8001        | 2021-09-02 19:20:01 | 70    |
| 4   | 1002 | 8002        | 2021-09-02 19:38:01 | 70    |
| 5   | 1003 | 8002        | 2021-09-01 19:38:01 | 80    |

Hãy tìm người dùng có biệt danh bắt đầu bằng "牛客" và kết thúc bằng "号", điểm thành tựu từ 1200~2500, và lần hoạt động gần nhất (làm bài hoặc làm đề thi) vào tháng 9 năm 2021.

Kết quả đầu ra từ dữ liệu mẫu như sau:

| uid  | nick_name | achievement |
| ---- | --------- | ----------- |
| 1002 | 牛客 2 号 | 1200        |

**Giải thích**: Những người có biệt danh bắt đầu bằng "牛客" kết thúc bằng "号" và điểm thành tựu từ 1200~2500 là 1002, 1004;

Lần hoạt động gần nhất trong khu đề thi của 1002 là tháng 9 năm 2021, lần hoạt động gần nhất trong khu luyện câu là tháng 9 năm 2021; Lần hoạt động gần nhất trong khu đề thi của 1004 là tháng 8 năm 2021, khu câu không hoạt động.

Vì vậy chỉ có 1002 thỏa mãn điều kiện.

**Tư duy**:

Trước tiên liệt kê câu truy vấn chính theo các điều kiện

Biệt danh bắt đầu bằng "牛客" kết thúc bằng "号": `nick_name LIKE "牛客%号"`

Điểm thành tựu từ 1200~2500: `achievement BETWEEN 1200 AND 2500`

Điều kiện thứ ba vì giới hạn là tháng 9, nên viết trực tiếp: `( date_format( record.submit_time, '%Y%m' )= 202109 OR date_format( pr.submit_time, '%Y%m' )= 202109 )`

**Đáp án**:

```sql
SELECT DISTINCT u_info.uid,
                u_info.nick_name,
                u_info.achievement
FROM user_info u_info
LEFT JOIN exam_record record ON record.uid = u_info.uid
LEFT JOIN practice_record pr ON u_info.uid = pr.uid
WHERE u_info.nick_name LIKE "牛客%号"
  AND u_info.achievement BETWEEN 1200
  AND 2500
  AND (date_format(record.submit_time, '%Y%m')= 202109
       OR date_format(pr.submit_time, '%Y%m')= 202109)
GROUP BY u_info.uid
```

### Lọc bản ghi làm bài theo quy tắc biệt danh và quy tắc đề thi (khó hơn)

**Mô tả**:

Cho bảng thông tin người dùng `user_info`（`uid` ID người dùng，`nick_name` biệt danh, `achievement` điểm thành tựu, `level` cấp độ, `job` hướng nghề nghiệp, `register_time` thời gian đăng ký）:

| id  | uid  | nick_name    | achievement | level | job  | register_time       |
| --- | ---- | ------------ | ----------- | ----- | ---- | ------------------- |
| 1   | 1001 | 牛客 1 号    | 1900        | 2     | 算法 | 2020-01-01 10:00:00 |
| 2   | 1002 | 牛客 2 号    | 1200        | 3     | 算法 | 2020-01-01 10:00:00 |
| 3   | 1003 | 牛客 3 号 ♂ | 2200        | 5     | 算法 | 2020-01-01 10:00:00 |
| 4   | 1004 | 牛客 4 号    | 2500        | 6     | 算法 | 2020-01-01 10:00:00 |
| 5   | 1005 | 牛客 555 号  | 2000        | 7     | C++  | 2020-01-01 10:00:00 |
| 6   | 1006 | 666666       | 3000        | 6     | C++  | 2020-01-01 10:00:00 |

Bảng thông tin đề thi `examination_info`（`exam_id` ID đề thi, `tag` danh mục đề thi, `difficulty` độ khó đề thi, `duration` thời lượng thi, `release_time` thời gian phát hành）:

| id  | exam_id | tag | difficulty | duration | release_time        |
| --- | ------- | --- | ---------- | -------- | ------------------- |
| 1   | 9001    | C++ | hard       | 60       | 2020-01-01 10:00:00 |
| 2   | 9002    | c#  | hard       | 80       | 2020-01-01 10:00:00 |
| 3   | 9003    | SQL | medium     | 70       | 2020-01-01 10:00:00 |

Bảng bản ghi làm bài thi `exam_record`（`uid` ID người dùng, `exam_id` ID đề thi, `start_time` thời gian bắt đầu làm bài, `submit_time` thời gian nộp bài, `score` điểm số）:

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-02 09:01:01 | 2020-01-02 09:21:59 | 80     |
| 2   | 1001 | 9001    | 2021-05-02 10:01:01 | (NULL)              | (NULL) |
| 4   | 1001 | 9001    | 2021-06-02 19:01:01 | 2021-06-02 19:32:00 | 20     |
| 3   | 1001 | 9002    | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87     |
| 5   | 1001 | 9002    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89     |
| 6   | 1001 | 9002    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 11  | 1002 | 9001    | 2020-01-01 12:01:01 | 2020-01-01 12:31:01 | 81     |
| 16  | 1002 | 9001    | 2021-09-06 12:01:01 | 2021-09-06 12:21:01 | 80     |
| 17  | 1002 | 9001    | 2021-09-06 12:01:01 | (NULL)              | (NULL) |
| 18  | 1002 | 9001    | 2021-09-07 12:01:01 | (NULL)              | (NULL) |
| 7   | 1002 | 9002    | 2021-05-05 18:01:01 | 2021-05-05 18:59:02 | 90     |
| 12  | 1002 | 9002    | 2020-02-01 12:01:01 | 2020-02-01 12:31:01 | 82     |
| 13  | 1002 | 9002    | 2020-02-02 12:11:01 | 2020-02-02 12:31:01 | 83     |
| 9   | 1003 | 9001    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 89     |
| 8   | 1003 | 9003    | 2021-02-06 12:01:01 | (NULL)              | (NULL) |
| 10  | 1004 | 9002    | 2021-08-06 12:01:01 | (NULL)              | (NULL) |
| 14  | 1005 | 9001    | 2021-02-01 11:01:01 | 2021-02-01 11:31:01 | 84     |
| 15  | 1006 | 9001    | 2021-02-01 11:01:01 | 2021-09-01 11:31:01 | 84     |

Tìm ID đề thi đã hoàn thành và điểm trung bình của người dùng có biệt danh là "牛客"+số nguyên thuần túy+"号" hoặc chỉ gồm số nguyên thuần túy đối với danh mục đề thi bắt đầu bằng chữ c (như C, C++, c# v.v.), sắp xếp theo ID người dùng và điểm trung bình tăng dần. Kết quả đầu ra từ dữ liệu mẫu như sau:

| uid  | exam_id | avg_score |
| ---- | ------- | --------- |
| 1002 | 9001    | 81        |
| 1002 | 9002    | 85        |
| 1005 | 9001    | 84        |
| 1006 | 9001    | 84        |

Giải thích: Người dùng có biệt danh thỏa mãn điều kiện là 1002, 1004, 1005, 1006;

Đề thi bắt đầu bằng c có 9001, 9002;

Trong bản ghi làm bài thỏa mãn điều kiện trên, điểm 1002 hoàn thành 9001 là 81, 80, điểm trung bình là 81 (80.5 làm tròn được 81);

Điểm 1002 hoàn thành 9002 là 90, 82, 83, điểm trung bình là 85;

**Tư duy**:

Vẫn như cũ, đã cho các điều kiện thì viết từng điều kiện ra trước

Tìm người dùng có biệt danh là "牛客"+số nguyên thuần túy+"号" hoặc chỉ gồm số nguyên thuần túy: Ban đầu tôi viết như sau: `nick_name LIKE '牛客%号' OR nick_name REGEXP '^[0-9]+$'`, nhưng nếu trong bảng có "牛客 H 号" thì cũng vượt qua được.

Vì vậy ở đây cần dùng regex: `nick_name LIKE '^牛客[0-9]+号'`

Đối với danh mục đề thi bắt đầu bằng chữ c: `e_info.tag LIKE 'c%'` hoặc `tag regexp '^c|^C'` cái đầu cũng khớp được chữ C hoa

**Đáp án**:

```sql
SELECT UID,
       exam_id,
       ROUND(AVG(score), 0) avg_score
FROM exam_record
WHERE UID IN
    (SELECT UID
     FROM user_info
     WHERE nick_name RLIKE "^牛客[0-9]+号 $"
       OR nick_name RLIKE "^[0-9]+$")
  AND exam_id IN
    (SELECT exam_id
     FROM examination_info
     WHERE tag RLIKE "^[cC]")
  AND score IS NOT NULL
GROUP BY UID,exam_id
ORDER BY UID,avg_score;
```

### Xuất kết quả khác nhau dựa trên sự tồn tại của bản ghi được chỉ định (khó)

**Mô tả**:

Cho bảng thông tin người dùng `user_info`（`uid` ID người dùng，`nick_name` biệt danh, `achievement` điểm thành tựu, `level` cấp độ, `job` hướng nghề nghiệp, `register_time` thời gian đăng ký）:

| id  | uid  | nick_name   | achievement | level | job  | register_time       |
| --- | ---- | ----------- | ----------- | ----- | ---- | ------------------- |
| 1   | 1001 | 牛客 1 号   | 19          | 0     | 算法 | 2020-01-01 10:00:00 |
| 2   | 1002 | 牛客 2 号   | 1200        | 3     | 算法 | 2020-01-01 10:00:00 |
| 3   | 1003 | 进击的 3 号 | 22          | 0     | 算法 | 2020-01-01 10:00:00 |
| 4   | 1004 | 牛客 4 号   | 25          | 0     | 算法 | 2020-01-01 10:00:00 |
| 5   | 1005 | 牛客 555 号 | 2000        | 7     | C++  | 2020-01-01 10:00:00 |
| 6   | 1006 | 666666      | 3000        | 6     | C++  | 2020-01-01 10:00:00 |

Bảng bản ghi làm bài thi `exam_record`（`uid` ID người dùng, `exam_id` ID đề thi, `start_time` thời gian bắt đầu làm bài, `submit_time` thời gian nộp bài, `score` điểm số）:

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-02 09:01:01 | 2020-01-02 09:21:59 | 80     |
| 2   | 1001 | 9001    | 2021-05-02 10:01:01 | (NULL)              | (NULL) |
| 3   | 1001 | 9002    | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 87     |
| 4   | 1001 | 9002    | 2021-09-01 12:01:01 | (NULL)              | (NULL) |
| 5   | 1001 | 9003    | 2021-09-02 12:01:01 | (NULL)              | (NULL) |
| 6   | 1001 | 9004    | 2021-09-03 12:01:01 | (NULL)              | (NULL) |
| 7   | 1002 | 9001    | 2020-01-01 12:01:01 | 2020-01-01 12:31:01 | 99     |
| 8   | 1002 | 9003    | 2020-02-01 12:01:01 | 2020-02-01 12:31:01 | 82     |
| 9   | 1002 | 9003    | 2020-02-02 12:11:01 | (NULL)              | (NULL) |
| 10  | 1002 | 9002    | 2021-05-05 18:01:01 | (NULL)              | (NULL) |
| 11  | 1002 | 9001    | 2021-09-06 12:01:01 | (NULL)              | (NULL) |
| 12  | 1003 | 9003    | 2021-02-06 12:01:01 | (NULL)              | (NULL) |
| 13  | 1003 | 9001    | 2021-09-07 10:01:01 | 2021-09-07 10:31:01 | 89     |

Hãy lọc dữ liệu trong bảng: khi có bất kỳ người dùng cấp 0 nào có số đề thi chưa hoàn thành lớn hơn 2, xuất số đề thi chưa hoàn thành và tỷ lệ chưa hoàn thành (giữ 3 chữ số thập phân) của mỗi người dùng cấp 0; nếu không tồn tại người dùng như vậy, thì xuất hai chỉ số này của tất cả người dùng có bản ghi làm bài. Kết quả sắp xếp theo tỷ lệ chưa hoàn thành tăng dần.

Kết quả đầu ra từ dữ liệu mẫu như sau:

| uid  | incomplete_cnt | incomplete_rate |
| ---- | -------------- | --------------- |
| 1004 | 0              | 0.000           |
| 1003 | 1              | 0.500           |
| 1001 | 4              | 0.667           |

**Giải thích**: Người dùng cấp 0 là 1001, 1003, 1004; số đề thi đã làm và số chưa hoàn thành lần lượt là: 6:4, 2:1, 0:0;

Tồn tại người dùng cấp 0 là 1001 có số đề thi chưa hoàn thành lớn hơn 2, do đó xuất hai chỉ số của ba người dùng này (1004 chưa từng làm đề thi, tỷ lệ chưa hoàn thành mặc định là 0, sau khi giữ 3 chữ số thập phân là 0.000);

Kết quả sắp xếp theo tỷ lệ chưa hoàn thành tăng dần.

Chú thích: Nếu 1001 không thỏa mãn "số đề thi chưa hoàn thành lớn hơn 2", thì cần xuất hai chỉ số này của 1001, 1002, 1003, vì trong bảng bản ghi làm bài chỉ có bản ghi làm bài của ba người dùng này.

**Tư duy**:

Trước tiên viết SQL cho điều kiện có thể thỏa mãn **"số đề thi chưa hoàn thành của người dùng cấp 0 lớn hơn 2"**

```sql
SELECT ui.uid UID
FROM user_info ui
LEFT JOIN exam_record er ON ui.uid = er.uid
WHERE ui.uid IN
    (SELECT ui.uid
     FROM user_info ui
     LEFT JOIN exam_record er ON ui.uid = er.uid
     WHERE er.submit_time IS NULL
       AND ui.LEVEL = 0 )
GROUP BY ui.uid
HAVING sum(IF(er.submit_time IS NULL, 1, 0)) > 2
```

Sau đó viết riêng câu truy vấn SQL cho hai trường hợp:

Trường hợp 1. Truy vấn tỷ lệ đề thi chưa hoàn thành của người dùng cấp 0 thỏa mãn điều kiện

```sql
SELECT
	tmp1.uid uid,
	sum(
	IF
	( er.submit_time IS NULL AND er.start_time IS NOT NULL, 1, 0 )) incomplete_cnt,
	round(
		sum(
		IF
		( er.submit_time IS NULL AND er.start_time IS NOT NULL, 1, 0 ))/ count( tmp1.uid ),
		3
	) incomplete_rate
FROM
	(
	SELECT DISTINCT
		ui.uid
	FROM
		user_info ui
		LEFT JOIN exam_record er ON ui.uid = er.uid
	WHERE
		er.submit_time IS NULL
		AND ui.LEVEL = 0
	) tmp1
	LEFT JOIN exam_record er ON tmp1.uid = er.uid
GROUP BY
	tmp1.uid
ORDER BY
	incomplete_rate
```

Trường hợp 2. Truy vấn tỷ lệ đề thi chưa hoàn thành của tất cả người dùng có bản ghi làm bài khi không tồn tại điều kiện yêu cầu

```sql
SELECT
	ui.uid uid,
	sum( CASE WHEN er.submit_time IS NULL AND er.start_time IS NOT NULL THEN 1 ELSE 0 END ) incomplete_cnt,
	round(
		sum(
		IF
		( er.submit_time IS NULL AND er.start_time IS NOT NULL, 1, 0 ))/ count( ui.uid ),
		3
	) incomplete_rate
FROM
	user_info ui
	JOIN exam_record er ON ui.uid = er.uid
GROUP BY
	ui.uid
ORDER BY
	incomplete_rate
```

Ghép lại, đó là đáp án

```sql
WITH host_user AS
  (SELECT ui.uid UID
   FROM user_info ui
   LEFT JOIN exam_record er ON ui.uid = er.uid
   WHERE ui.uid IN
       (SELECT ui.uid
        FROM user_info ui
        LEFT JOIN exam_record er ON ui.uid = er.uid
        WHERE er.submit_time IS NULL
          AND ui.LEVEL = 0 )
   GROUP BY ui.uid
   HAVING sum(IF (er.submit_time IS NULL, 1, 0))> 2),
     tt1 AS
  (SELECT tmp1.uid UID,
                   sum(IF (er.submit_time IS NULL
                           AND er.start_time IS NOT NULL, 1, 0)) incomplete_cnt,
                   round(sum(IF (er.submit_time IS NULL
                                 AND er.start_time IS NOT NULL, 1, 0))/ count(tmp1.uid), 3) incomplete_rate
   FROM
     (SELECT DISTINCT ui.uid
      FROM user_info ui
      LEFT JOIN exam_record er ON ui.uid = er.uid
      WHERE er.submit_time IS NULL
        AND ui.LEVEL = 0 ) tmp1
   LEFT JOIN exam_record er ON tmp1.uid = er.uid
   GROUP BY tmp1.uid
   ORDER BY incomplete_rate),
     tt2 AS
  (SELECT ui.uid UID,
                 sum(CASE
                         WHEN er.submit_time IS NULL
                              AND er.start_time IS NOT NULL THEN 1
                         ELSE 0
                     END) incomplete_cnt,
                 round(sum(IF (er.submit_time IS NULL
                               AND er.start_time IS NOT NULL, 1, 0))/ count(ui.uid), 3) incomplete_rate
   FROM user_info ui
   JOIN exam_record er ON ui.uid = er.uid
   GROUP BY ui.uid
   ORDER BY incomplete_rate)
  (SELECT tt1.*
   FROM tt1
   LEFT JOIN
     (SELECT UID
      FROM host_user) t1 ON 1 = 1
   WHERE t1.uid IS NOT NULL )
UNION ALL
  (SELECT tt2.*
   FROM tt2
   LEFT JOIN
     (SELECT UID
      FROM host_user) t2 ON 1 = 1
   WHERE t2.uid IS NULL)
```

Phiên bản V2 (cải tiến từ phiên bản trên, câu trả lời ngắn hơn, logic chặt chẽ hơn):

```sql
SELECT
	ui.uid,
	SUM(
	IF
	( start_time IS NOT NULL AND score IS NULL, 1, 0 )) AS incomplete_cnt,#3.试卷未完成数
	ROUND( AVG( IF ( start_time IS NOT NULL AND score IS NULL, 1, 0 )), 3 ) AS incomplete_rate #4.未完成率

FROM
	user_info ui
	LEFT JOIN exam_record USING ( uid )
WHERE
CASE

		WHEN (#1.当有任意一个0级用户未完成试卷数大于2时
		SELECT
			MAX( lv0_incom_cnt )
		FROM
			(
			SELECT
				SUM(
				IF
				( score IS NULL, 1, 0 )) AS lv0_incom_cnt
			FROM
				user_info
				JOIN exam_record USING ( uid )
			WHERE
				LEVEL = 0
			GROUP BY
				uid
			) table1
			)> 2 THEN
			uid IN ( #1.1找出每个0级用户
			SELECT uid FROM user_info WHERE LEVEL = 0 ) ELSE uid IN ( #2.若不存在这样的用户，找出有作答记录的用户
			SELECT DISTINCT uid FROM exam_record )
		END
		GROUP BY
			ui.uid
	ORDER BY
	incomplete_rate #5.结果按未完成率升序排序
```

### Phân phối điểm theo cấp độ người dùng (khó hơn)

**Mô tả**:

Cho bảng thông tin người dùng `user_info`（`uid` ID người dùng，`nick_name` biệt danh, `achievement` điểm thành tựu, `level` cấp độ, `job` hướng nghề nghiệp, `register_time` thời gian đăng ký）:

| id  | uid  | nick_name    | achievement | level | job  | register_time       |
| --- | ---- | ------------ | ----------- | ----- | ---- | ------------------- |
| 1   | 1001 | 牛客 1 号    | 19          | 0     | 算法 | 2020-01-01 10:00:00 |
| 2   | 1002 | 牛客 2 号    | 1200        | 3     | 算法 | 2020-01-01 10:00:00 |
| 3   | 1003 | 牛客 3 号 ♂ | 22          | 0     | 算法 | 2020-01-01 10:00:00 |
| 4   | 1004 | 牛客 4 号    | 25          | 0     | 算法 | 2020-01-01 10:00:00 |
| 5   | 1005 | 牛客 555 号  | 2000        | 7     | C++  | 2020-01-01 10:00:00 |
| 6   | 1006 | 666666       | 3000        | 6     | C++  | 2020-01-01 10:00:00 |

Bảng bản ghi làm bài thi exam_record（uid ID người dùng, exam_id ID đề thi, start_time thời gian bắt đầu làm bài, submit_time thời gian nộp bài, score điểm số）:

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-02 09:01:01 | 2020-01-02 09:21:59 | 80     |
| 2   | 1001 | 9001    | 2021-05-02 10:01:01 | (NULL)              | (NULL) |
| 3   | 1001 | 9002    | 2021-02-02 19:01:01 | 2021-02-02 19:30:01 | 75     |
| 4   | 1001 | 9002    | 2021-09-01 12:01:01 | 2021-09-01 12:11:01 | 60     |
| 5   | 1001 | 9003    | 2021-09-02 12:01:01 | 2021-09-02 12:41:01 | 90     |
| 6   | 1001 | 9001    | 2021-06-02 19:01:01 | 2021-06-02 19:32:00 | 20     |
| 7   | 1001 | 9002    | 2021-09-05 19:01:01 | 2021-09-05 19:40:01 | 89     |
| 8   | 1001 | 9004    | 2021-09-03 12:01:01 | (NULL)              | (NULL) |
| 9   | 1002 | 9001    | 2020-01-01 12:01:01 | 2020-01-01 12:31:01 | 99     |
| 10  | 1002 | 9003    | 2020-02-01 12:01:01 | 2020-02-01 12:31:01 | 82     |
| 11  | 1002 | 9003    | 2020-02-02 12:11:01 | 2020-02-02 12:41:01 | 76     |

Để đánh giá định tính kết quả làm bài của người dùng, chúng ta chia điểm đề thi theo điểm mốc [90,75,60] thành bốn mức điểm xuất sắc, tốt, trung bình, kém (điểm mốc chia vào khoảng trái), hãy thống kê tỷ lệ của từng mức điểm đối với từng cấp độ người dùng đã hoàn thành đề thi (kết quả giữ 3 chữ số thập phân), người dùng chưa hoàn thành đề thi không cần xuất, kết quả sắp xếp theo cấp độ người dùng giảm dần, tỷ lệ giảm dần.

Kết quả đầu ra từ dữ liệu mẫu như sau:

| level | score_grade | ratio |
| ----- | ----------- | ----- |
| 3     | 良          | 0.667 |
| 3     | 优          | 0.333 |
| 0     | 良          | 0.500 |
| 0     | 中          | 0.167 |
| 0     | 优          | 0.167 |
| 0     | 差          | 0.167 |

Giải thích: Người dùng đã hoàn thành đề thi là 1001, 1002; cấp độ người dùng và mức điểm tương ứng như sau:

| uid  | exam_id | score | level | score_grade |
| ---- | ------- | ----- | ----- | ----------- |
| 1001 | 9001    | 80    | 0     | 良          |
| 1001 | 9002    | 75    | 0     | 良          |
| 1001 | 9002    | 60    | 0     | 中          |
| 1001 | 9003    | 90    | 0     | 优          |
| 1001 | 9001    | 20    | 0     | 差          |
| 1001 | 9002    | 89    | 0     | 良          |
| 1002 | 9001    | 99    | 3     | 优          |
| 1002 | 9003    | 82    | 3     | 良          |
| 1002 | 9003    | 76    | 3     | 良          |

Vì vậy tỷ lệ mức điểm của người dùng cấp 0 (chỉ có 1001) là: xuất sắc 1/6, tốt 1/6, trung bình 1/6, kém 3/6; người dùng cấp 3 (chỉ có 1002) là: xuất sắc 1/3, tốt 2/3. Kết quả giữ 3 chữ số thập phân.

**Tư duy**:

Trước tiên viết điều kiện **"chia điểm đề thi theo điểm mốc [90,75,60] thành bốn mức điểm xuất sắc, tốt, trung bình, kém"**, ở đây có thể dùng `case when`

```sql
CASE
		WHEN a.score >= 90 THEN
		'优'
		WHEN a.score < 90 AND a.score >= 75 THEN
		'良'
		WHEN a.score < 75 AND a.score >= 60 THEN
	'中' ELSE '差'
END
```

Đây là điểm mấu chốt của câu hỏi này, phần còn lại chỉ là ghép các điều kiện

**Đáp án**:

```sql
SELECT a.LEVEL,
       a.score_grade,
       ROUND(a.cur_count / b.total_num, 3) AS ratio
FROM
  (SELECT b.LEVEL AS LEVEL,
          (CASE
               WHEN a.score >= 90 THEN '优'
               WHEN a.score < 90
                    AND a.score >= 75 THEN '良'
               WHEN a.score < 75
                    AND a.score >= 60 THEN '中'
               ELSE '差'
           END) AS score_grade,
          count(1) AS cur_count
   FROM exam_record a
   LEFT JOIN user_info b ON a.uid = b.uid
   WHERE a.submit_time IS NOT NULL
   GROUP BY b.LEVEL,
            score_grade) a
LEFT JOIN
  (SELECT b.LEVEL AS LEVEL,
          count(b.LEVEL) AS total_num
   FROM exam_record a
   LEFT JOIN user_info b ON a.uid = b.uid
   WHERE a.submit_time IS NOT NULL
   GROUP BY b.LEVEL) b ON a.LEVEL = b.LEVEL
ORDER BY a.LEVEL DESC,
         ratio DESC
```

## Truy vấn giới hạn

### Ba người đăng ký sớm nhất

**Mô tả**:

Cho bảng thông tin người dùng `user_info`（`uid` ID người dùng，`nick_name` biệt danh, `achievement` điểm thành tựu, `level` cấp độ, `job` hướng nghề nghiệp, `register_time` thời gian đăng ký）:

| id  | uid  | nick_name    | achievement | level | job  | register_time       |
| --- | ---- | ------------ | ----------- | ----- | ---- | ------------------- |
| 1   | 1001 | 牛客 1 号    | 19          | 0     | 算法 | 2020-01-01 10:00:00 |
| 2   | 1002 | 牛客 2 号    | 1200        | 3     | 算法 | 2020-02-01 10:00:00 |
| 3   | 1003 | 牛客 3 号 ♂ | 22          | 0     | 算法 | 2020-01-02 10:00:00 |
| 4   | 1004 | 牛客 4 号    | 25          | 0     | 算法 | 2020-01-02 11:00:00 |
| 5   | 1005 | 牛客 555 号  | 4000        | 7     | C++  | 2020-01-11 10:00:00 |
| 6   | 1006 | 666666       | 3000        | 6     | C++  | 2020-11-01 10:00:00 |

Hãy tìm 3 người đăng ký sớm nhất. Kết quả đầu ra từ dữ liệu mẫu như sau:

| uid  | nick_name    | register_time       |
| ---- | ------------ | ------------------- |
| 1001 | 牛客 1       | 2020-01-01 10:00:00 |
| 1003 | 牛客 3 号 ♂ | 2020-01-02 10:00:00 |
| 1004 | 牛客 4 号    | 2020-01-02 11:00:00 |

Giải thích: Sắp xếp theo thời gian đăng ký và lấy ba người đầu tiên, xuất ID người dùng, biệt danh, thời gian đăng ký.

**Đáp án**:

```sql
SELECT uid, nick_name, register_time
    FROM user_info
    ORDER BY register_time
    LIMIT 3
```

### Trang thứ ba trong danh sách những người hoàn thành đề thi ngay ngày đăng ký (khó hơn)

**Mô tả**: Cho bảng thông tin người dùng `user_info`（`uid` ID người dùng，`nick_name` biệt danh, `achievement` điểm thành tựu, `level` cấp độ, `job` hướng nghề nghiệp, `register_time` thời gian đăng ký）:

| id  | uid  | nick_name    | achievement | level | job  | register_time       |
| --- | ---- | ------------ | ----------- | ----- | ---- | ------------------- |
| 1   | 1001 | 牛客 1       | 19          | 0     | 算法 | 2020-01-01 10:00:00 |
| 2   | 1002 | 牛客 2 号    | 1200        | 3     | 算法 | 2020-01-01 10:00:00 |
| 3   | 1003 | 牛客 3 号 ♂ | 22          | 0     | 算法 | 2020-01-01 10:00:00 |
| 4   | 1004 | 牛客 4 号    | 25          | 0     | 算法 | 2020-01-01 10:00:00 |
| 5   | 1005 | 牛客 555 号  | 4000        | 7     | 算法 | 2020-01-11 10:00:00 |
| 6   | 1006 | 牛客 6 号    | 25          | 0     | 算法 | 2020-01-02 11:00:00 |
| 7   | 1007 | 牛客 7 号    | 25          | 0     | 算法 | 2020-01-02 11:00:00 |
| 8   | 1008 | 牛客 8 号    | 25          | 0     | 算法 | 2020-01-02 11:00:00 |
| 9   | 1009 | 牛客 9 号    | 25          | 0     | 算法 | 2020-01-02 11:00:00 |
| 10  | 1010 | 牛客 10 号   | 25          | 0     | 算法 | 2020-01-02 11:00:00 |
| 11  | 1011 | 666666       | 3000        | 6     | C++  | 2020-01-02 10:00:00 |

Bảng thông tin đề thi examination_info（exam_id ID đề thi, tag danh mục đề thi, difficulty độ khó đề thi, duration thời lượng thi, release_time thời gian phát hành）:

| id  | exam_id | tag  | difficulty | duration | release_time        |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1   | 9001    | 算法 | hard       | 60       | 2020-01-01 10:00:00 |
| 2   | 9002    | 算法 | hard       | 80       | 2020-01-01 10:00:00 |
| 3   | 9003    | SQL  | medium     | 70       | 2020-01-01 10:00:00 |

Bảng bản ghi làm bài thi `exam_record`（`uid` ID người dùng, `exam_id` ID đề thi, `start_time` thời gian bắt đầu làm bài, `submit_time` thời gian nộp bài, `score` điểm số）:

| id  | uid  | exam_id | start_time          | submit_time         | score |
| --- | ---- | ------- | ------------------- | ------------------- | ----- |
| 1   | 1001 | 9001    | 2020-01-02 09:01:01 | 2020-01-02 09:21:59 | 80    |
| 2   | 1002 | 9003    | 2020-01-20 10:01:01 | 2020-01-20 10:10:01 | 81    |
| 3   | 1002 | 9002    | 2020-01-01 12:11:01 | 2020-01-01 12:31:01 | 83    |
| 4   | 1003 | 9002    | 2020-01-01 19:01:01 | 2020-01-01 19:30:01 | 75    |
| 5   | 1004 | 9002    | 2020-01-01 12:01:01 | 2020-01-01 12:11:01 | 60    |
| 6   | 1005 | 9002    | 2020-01-01 12:01:01 | 2020-01-01 12:41:01 | 90    |
| 7   | 1006 | 9001    | 2020-01-02 19:01:01 | 2020-01-02 19:32:00 | 20    |
| 8   | 1007 | 9002    | 2020-01-02 19:01:01 | 2020-01-02 19:40:01 | 89    |
| 9   | 1008 | 9003    | 2020-01-02 12:01:01 | 2020-01-02 12:20:01 | 99    |
| 10  | 1008 | 9001    | 2020-01-02 12:01:01 | 2020-01-02 12:31:01 | 98    |
| 11  | 1009 | 9002    | 2020-01-02 12:01:01 | 2020-01-02 12:31:01 | 82    |
| 12  | 1010 | 9002    | 2020-01-02 12:11:01 | 2020-01-02 12:41:01 | 76    |
| 13  | 1011 | 9001    | 2020-01-02 10:01:01 | 2020-01-02 10:31:01 | 89    |

![](/images/github/javaguide/database/sql/D2B491866B85826119EE3474F10D3636.png)

Tìm những người có hướng tìm việc là kỹ sư thuật toán và đã hoàn thành đề thi thuật toán ngay ngày đăng ký, xếp hạng theo điểm cao nhất trong tất cả các kỳ thi đã tham gia. Bảng xếp hạng rất dài, chúng ta sẽ phân trang hiển thị, mỗi trang 3 bản ghi, bây giờ cần lấy thông tin người trên trang thứ 3 (số trang bắt đầu từ 1).

Kết quả đầu ra từ dữ liệu mẫu như sau:

| uid  | level | register_time       | max_score |
| ---- | ----- | ------------------- | --------- |
| 1010 | 0     | 2020-01-02 11:00:00 | 76        |
| 1003 | 0     | 2020-01-01 10:00:00 | 75        |
| 1004 | 0     | 2020-01-01 11:00:00 | 60        |

Giải thích: Ngoài 1011, tất cả người dùng khác đều có hướng tìm việc là kỹ sư thuật toán; đề thi thuật toán có 9001 và 9002, 11 người dùng đều hoàn thành đề thi thuật toán ngay ngày đăng ký; khi tính điểm tối đa trong tất cả các kỳ thi, chỉ có 1002 và 1008 hoàn thành hai kỳ thi, những người khác chỉ hoàn thành một kỳ thi, điểm tối đa của 1002 trong hai kỳ thi là 81, điểm tối đa của 1008 là 99.

Xếp hạng theo điểm cao nhất:

| uid  | level | register_time       | max_score |
| ---- | ----- | ------------------- | --------- |
| 1008 | 0     | 2020-01-02 11:00:00 | 99        |
| 1005 | 7     | 2020-01-01 10:00:00 | 90        |
| 1007 | 0     | 2020-01-02 11:00:00 | 89        |
| 1002 | 3     | 2020-01-01 10:00:00 | 83        |
| 1009 | 0     | 2020-01-02 11:00:00 | 82        |
| 1001 | 0     | 2020-01-01 10:00:00 | 80        |
| 1010 | 0     | 2020-01-02 11:00:00 | 76        |
| 1003 | 0     | 2020-01-01 10:00:00 | 75        |
| 1004 | 0     | 2020-01-01 11:00:00 | 60        |
| 1006 | 0     | 2020-01-02 11:00:00 | 20        |

Mỗi trang 3 bản ghi, trang thứ ba tức là bản ghi thứ 7~9, trả về bản ghi của 1010, 1003, 1004.

**Tư duy**:

1. Mỗi trang 3 bản ghi, tức là cần lấy thông tin người trên trang thứ ba, phải dùng `limit`

2. Thống kê thông tin và điểm mỗi lần thi của người có hướng tìm việc là kỹ sư thuật toán và đã hoàn thành đề thi thuật toán ngay ngày đăng ký, trước tiên tìm người dùng thỏa mãn điều kiện, sau đó dùng left join để kết nối tìm thông tin và điểm mỗi lần thi

**Đáp án**:

```sql
SELECT t1.uid,
       LEVEL,
       register_time,
       max(score) AS max_score
FROM exam_record t
JOIN examination_info USING (exam_id)
JOIN user_info t1 ON t.uid = t1.uid
AND date(t.submit_time) = date(t1.register_time)
WHERE job = '算法'
  AND tag = '算法'
GROUP BY t1.uid,
         LEVEL,
         register_time
ORDER BY max_score DESC
LIMIT 6,3
```

## Hàm chuyển đổi văn bản

### Sửa các bản ghi bị nhập sai cột

**Mô tả**: Cho bảng thông tin đề thi `examination_info`（`exam_id` ID đề thi, `tag` danh mục đề thi, `difficulty` độ khó đề thi, `duration` thời lượng thi, `release_time` thời gian phát hành）:

| id  | exam_id | tag            | difficulty | duration | release_time        |
| --- | ------- | -------------- | ---------- | -------- | ------------------- |
| 1   | 9001    | 算法           | hard       | 60       | 2021-01-01 10:00:00 |
| 2   | 9002    | 算法           | hard       | 80       | 2021-01-01 10:00:00 |
| 3   | 9003    | SQL            | medium     | 70       | 2021-01-01 10:00:00 |
| 4   | 9004    | 算法,medium,80 |            | 0        | 2021-01-01 10:00:00 |

Bạn nhập đề có một lần nhầm lẫn nhập đồng thời danh mục đề thi tag, độ khó và thời lượng vào trường tag, hãy giúp tìm ra những bản ghi bị nhập sai đó và tách ra xuất theo đúng kiểu cột.

Kết quả đầu ra từ dữ liệu mẫu như sau:

| exam_id | tag  | difficulty | duration |
| ------- | ---- | ---------- | -------- |
| 9004    | 算法 | medium     | 80       |

**Tư duy**:

Trước tiên tìm hiểu hàm sẽ dùng trong bài này

Hàm `SUBSTRING_INDEX` dùng để trích xuất một phần chuỗi tại dấu phân cách được chỉ định. Nó nhận ba tham số: chuỗi gốc, dấu phân cách và số lượng phần cần trả về.

Cú pháp của hàm `SUBSTRING_INDEX`:

```sql
SUBSTRING_INDEX(str, delimiter, count)
```

- `str`: Chuỗi gốc cần tách.
- `delimiter`: Chuỗi hoặc ký tự dùng làm dấu phân cách.
- `count`: Số lượng phần cần trả về.
  - Nếu `count` lớn hơn 0, trả về `count` phần đầu tiên từ bên trái (tính theo dấu phân cách).
  - Nếu `count` nhỏ hơn 0, trả về `count` phần đầu tiên từ bên phải (tính theo dấu phân cách), tức là đếm từ bên phải sang trái.

Dưới đây là một số ví dụ minh họa cách dùng hàm `SUBSTRING_INDEX`:

1. Trích xuất phần đầu tiên của chuỗi:

   ```sql
   SELECT SUBSTRING_INDEX('apple,banana,cherry', ',', 1);
   -- 输出结果：'apple'
   ```

2. Trích xuất phần cuối cùng của chuỗi:

   ```sql
   SELECT SUBSTRING_INDEX('apple,banana,cherry', ',', -1);
   -- 输出结果：'cherry'
   ```

3. Trích xuất hai phần đầu tiên của chuỗi:

   ```sql
   SELECT SUBSTRING_INDEX('apple,banana,cherry', ',', 2);
   -- 输出结果：'apple,banana'
   ```

4. Trích xuất hai phần cuối cùng của chuỗi:

   ```sql
   SELECT SUBSTRING_INDEX('apple,banana,cherry', ',', -2);
   -- 输出结果：'banana,cherry'
   ```

**Đáp án**:

```sql
SELECT
	exam_id,
	substring_index( tag, ',', 1 ) tag,
	substring_index( substring_index( tag, ',', 2 ), ',',- 1 ) difficulty,
	substring_index( tag, ',',- 1 ) duration
FROM
	examination_info
WHERE
	difficulty = ''
```

### Xử lý cắt ngắn biệt danh quá dài

**Mô tả**: Cho bảng thông tin người dùng `user_info`（`uid` ID người dùng，`nick_name` biệt danh, `achievement` điểm thành tựu, `level` cấp độ, `job` hướng nghề nghiệp, `register_time` thời gian đăng ký）:

| id  | uid  | nick_name              | achievement | level | job  | register_time       |
| --- | ---- | ---------------------- | ----------- | ----- | ---- | ------------------- |
| 1   | 1001 | 牛客 1                 | 19          | 0     | 算法 | 2020-01-01 10:00:00 |
| 2   | 1002 | 牛客 2 号              | 1200        | 3     | 算法 | 2020-01-01 10:00:00 |
| 3   | 1003 | 牛客 3 号 ♂           | 22          | 0     | 算法 | 2020-01-01 10:00:00 |
| 4   | 1004 | 牛客 4 号              | 25          | 0     | 算法 | 2020-01-01 11:00:00 |
| 5   | 1005 | 牛客 5678901234 号     | 4000        | 7     | 算法 | 2020-01-11 10:00:00 |
| 6   | 1006 | 牛客 67890123456789 号 | 25          | 0     | 算法 | 2020-01-02 11:00:00 |

Một số người dùng có biệt danh rất dài, điều này sẽ gây lộn xộn giao diện trong một số trường hợp hiển thị, do đó cần chuyển đổi những biệt danh đặc biệt dài trước khi xuất, hãy xuất thông tin người dùng có số ký tự lớn hơn 10, đối với người dùng có số ký tự lớn hơn 13 thì xuất 10 ký tự đầu tiên sau đó thêm ba dấu chấm: "...".

Kết quả đầu ra từ dữ liệu mẫu như sau:

| uid  | nick_name          |
| ---- | ------------------ |
| 1005 | 牛客 5678901234 号 |
| 1006 | 牛客 67890123...   |

Giải thích: Người dùng có số ký tự lớn hơn 10 là 1005 và 1006, độ dài lần lượt là 13, 17; do đó cần cắt ngắn biệt danh của 1006 khi xuất.

**Tư duy**:

Câu hỏi này liên quan đến tính toán ký tự, để tính số ký tự của chuỗi (tức là độ dài chuỗi), có thể dùng hàm `LENGTH` hoặc `CHAR_LENGTH`. Sự khác biệt giữa hai hàm này là cách xử lý ký tự đa byte.

1. Hàm `LENGTH`: Nó trả về số byte của chuỗi đã cho. Đối với chuỗi chứa ký tự đa byte, mỗi ký tự được tính là một byte.

Ví dụ:

```sql
SELECT LENGTH('你好'); -- 输出结果：6，因为 '你好' 中的每个汉字每个占3个字节
```

1. Hàm `CHAR_LENGTH`: Nó trả về số ký tự của chuỗi đã cho. Đối với chuỗi chứa ký tự đa byte, mỗi ký tự được tính là một ký tự.

Ví dụ:

```sql
SELECT CHAR_LENGTH('你好'); -- 输出结果：2，因为 '你好' 中有两个字符，即两个汉字
```

**Đáp án**:

```sql
SELECT
	uid,
CASE

		WHEN CHAR_LENGTH( nick_name ) > 13 THEN
		CONCAT( SUBSTR( nick_name, 1, 10 ), '...' ) ELSE nick_name
	END AS nick_name
FROM
	user_info
WHERE
	CHAR_LENGTH( nick_name ) > 10
GROUP BY
	uid;
```

### Thống kê lọc khi chữ hoa chữ thường lẫn lộn (khó hơn)

**Mô tả**:

Cho bảng thông tin đề thi `examination_info`（`exam_id` ID đề thi, `tag` danh mục đề thi, `difficulty` độ khó đề thi, `duration` thời lượng thi, `release_time` thời gian phát hành）:

| id  | exam_id | tag  | difficulty | duration | release_time        |
| --- | ------- | ---- | ---------- | -------- | ------------------- |
| 1   | 9001    | 算法 | hard       | 60       | 2021-01-01 10:00:00 |
| 2   | 9002    | C++  | hard       | 80       | 2021-01-01 10:00:00 |
| 3   | 9003    | C++  | hard       | 80       | 2021-01-01 10:00:00 |
| 4   | 9004    | sql  | medium     | 70       | 2021-01-01 10:00:00 |
| 5   | 9005    | C++  | hard       | 80       | 2021-01-01 10:00:00 |
| 6   | 9006    | C++  | hard       | 80       | 2021-01-01 10:00:00 |
| 7   | 9007    | C++  | hard       | 80       | 2021-01-01 10:00:00 |
| 8   | 9008    | SQL  | medium     | 70       | 2021-01-01 10:00:00 |
| 9   | 9009    | SQL  | medium     | 70       | 2021-01-01 10:00:00 |
| 10  | 9010    | SQL  | medium     | 70       | 2021-01-01 10:00:00 |

Bảng thông tin làm bài thi `exam_record`（`uid` ID người dùng, `exam_id` ID đề thi, `start_time` thời gian bắt đầu làm bài, `submit_time` thời gian nộp bài, `score` điểm số）:

| id  | uid  | exam_id | start_time          | submit_time         | score  |
| --- | ---- | ------- | ------------------- | ------------------- | ------ |
| 1   | 1001 | 9001    | 2020-01-01 09:01:01 | 2020-01-01 09:21:59 | 80     |
| 2   | 1002 | 9003    | 2020-01-20 10:01:01 | 2020-01-20 10:10:01 | 81     |
| 3   | 1002 | 9002    | 2020-02-01 12:11:01 | 2020-02-01 12:31:01 | 83     |
| 4   | 1003 | 9002    | 2020-03-01 19:01:01 | 2020-03-01 19:30:01 | 75     |
| 5   | 1004 | 9002    | 2020-03-01 12:01:01 | 2020-03-01 12:11:01 | 60     |
| 6   | 1005 | 9002    | 2020-03-01 12:01:01 | 2020-03-01 12:41:01 | 90     |
| 7   | 1006 | 9001    | 2020-05-02 19:01:01 | 2020-05-02 19:32:00 | 20     |
| 8   | 1007 | 9003    | 2020-01-02 19:01:01 | 2020-01-02 19:40:01 | 89     |
| 9   | 1008 | 9004    | 2020-02-02 12:01:01 | 2020-02-02 12:20:01 | 99     |
| 10  | 1008 | 9001    | 2020-02-02 12:01:01 | 2020-02-02 12:31:01 | 98     |
| 11  | 1009 | 9002    | 2020-02-02 12:01:01 | 2020-01-02 12:43:01 | 81     |
| 12  | 1010 | 9001    | 2020-01-02 12:11:01 | (NULL)              | (NULL) |
| 13  | 1010 | 9001    | 2020-02-02 12:01:01 | 2020-01-02 10:31:01 | 89     |

Danh mục đề thi tag có thể xảy ra tình trạng lẫn lộn chữ hoa chữ thường, hãy trước tiên lọc ra danh mục tag có số lần làm bài nhỏ hơn 3, thống kê số lần làm bài gốc tương ứng với đề thi khi chuyển thành chữ hoa.

Nếu sau khi chuyển đổi tag không thay đổi, không xuất kết quả đó.

Kết quả đầu ra từ dữ liệu mẫu như sau:

| tag | answer_cnt |
| --- | ---------- |
| C++ | 6          |

Giải thích: Các đề thi đã được làm là 9001, 9002, 9003, 9004, tag và số lần được làm của chúng như sau:

| exam_id | tag  | answer_cnt |
| ------- | ---- | ---------- |
| 9001    | 算法 | 4          |
| 9002    | C++  | 6          |
| 9003    | c++  | 2          |
| 9004    | sql  | 2          |

Các tag có số lần làm nhỏ hơn 3 là c++ và sql, sau khi chuyển thành chữ hoa chỉ có C++ đã có số lần làm, vì vậy xuất số lần làm sau khi chuyển c++ thành chữ hoa là 6.

**Tư duy**:

Trước tiên, câu hỏi này có chút lộn xộn, 9004 theo dữ liệu mẫu chỉ có 1 lần, nhưng ở đây hiển thị 2 lần.

Trước tiên xem các hàm chuyển đổi chữ hoa chữ thường:

1.`UPPER(s)` hoặc `UCASE(s)` có thể chuyển tất cả ký tự chữ cái trong chuỗi s thành chữ hoa;

2.`LOWER(s)` hoặc `LCASE(s)` có thể chuyển tất cả ký tự chữ cái trong chuỗi s thành chữ thường.

Điểm khó là cùng một bảng kết nối để truy vấn các giá trị khác nhau

**Đáp án**:

```sql
WITH a AS
  (SELECT tag,
          COUNT(start_time) AS answer_cnt
   FROM exam_record er
   JOIN examination_info ei ON er.exam_id = ei.exam_id
   GROUP BY tag)
SELECT a.tag,
       b.answer_cnt
FROM a
INNER JOIN a AS b ON UPPER(a.tag)= b.tag #a小写 b大写
AND a.tag != b.tag
WHERE a.answer_cnt < 3;
```

<!-- @include: @article-footer.snippet.md -->
