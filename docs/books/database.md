---
title: Sách kinh điển phải đọc về Database
description: Gợi ý sách database, sách kinh điển về MySQL, PostgreSQL, Redis và các database khác, bao phủ introductory tutorials, principles analysis, performance optimization và nhiều nội dung khác.
category: Computer Books
icon: "database"
head:
  - - meta
    - name: keywords
      content: database book selection
---

## Database Basics

Về database basics, nếu bạn thấy sách khá nhàm chán và khó duy trì, tôi khuyến nghị có thể xem một số video tốt trước. [《Database System Principles》](https://www.icourse163.org/course/BNU-1002842007) của Beijing Normal University và [《Database Systems (Part 2): Management and Technology》](https://www.icourse163.org/course/HIT-1001578001) của Harbin Institute of Technology đều rất tốt.

Khóa học [《Database System Principles》](https://www.icourse163.org/course/BNU-1002842007) này giảng viên giảng rất chi tiết, và bài tập mỗi section cũng rất phù hợp với kiến thức được dạy. Sau còn có nhiều lab thực hành đi kèm.

![](/images/github/javaguide/books/up-e113c726a41874ef5fb19f7ac14e38e16ce.png)

Nếu bạn thích thực hành và không thích kiến thức lý thuyết, khuyến nghị xem [《How to Build a Simple Database》](https://cstack.github.io/db_tutorial/) — project này hướng dẫn từng bước viết một database đơn giản.

![](/images/github/javaguide/books/up-11de8cb239aa7201cc8d78fa28928b9ec7d.png)

Trên GitHub cũng có bạn triển khai database đơn giản bằng Java, giới thiệu khá chi tiết. Địa chỉ: [https://github.com/alchemystar/Freedom](https://github.com/alchemystar/Freedom).

Ngoài cái viết bằng Java, **[db_tutorial](https://github.com/cstack/db_tutorial)** là project do một developer nước ngoài viết bằng C — bạn có thể xem thử.

**Chỉ cần sử dụng tốt search engine, bạn có thể tìm thấy database toys được triển khai bằng nhiều ngôn ngữ khác nhau.**

![](/images/github/javaguide/books/up-d32d853f847633ac7ed0efdecf56be1f1d2.png)

**Học trên giấy vẫn thấy nông — muốn hiểu thực sự phải thực hành! Rất khuyến nghị các bạn CS major nhất định phải thực hành nhiều hơn!!!**

### 《Database System Concepts》

[《Database System Concepts》](https://book.douban.com/subject/10548379/) bao phủ toàn bộ các khái niệm về database system, hệ thống kiến thức rõ ràng — là giáo trình cực kỳ kinh điển để học database system! Không phải sách tham khảo!

![](/images/github/javaguide/booksimage-20220409150441742.png)

### 《Database System Implementation》

Nếu bạn cũng muốn nghiên cứu MySQL bottom layer principles, khuyến nghị đọc trước [《Database System Implementation》](https://book.douban.com/subject/4838430/).

![](/images/github/javaguide/books/database-system-implementation.png)

Dù là MySQL hay Oracle, framework tổng thể của chúng tương tự nhau, khác biệt là implementation bên trong như data structure của database index, cách triển khai storage engine v.v.

Cuốn sách này một số chỗ dịch khá vụng về. Nếu có khả năng đọc bản tiếng Anh thì khuyến nghị đọc bản tiếng Anh.

《Database System Implementation》 là giáo trình của Stanford, ngoài ra còn có một cuốn [《A First Course in Database Systems》](https://book.douban.com/subject/3923575/) là prerequisite course, có thể giúp bạn nhập môn database.

## MySQL

Dữ liệu của website hay APP của chúng ta cần dùng database để lưu trữ.

Trong phát triển project doanh nghiệp, MySQL được dùng nhiều hơn. Nếu bạn muốn học MySQL, có thể xem 3 cuốn sách sau:

- **[《MySQL必知必会》 (MySQL Crash Course)](https://book.douban.com/subject/3354490/)**: Rất mỏng! Rất phù hợp cho người mới học MySQL, là tài liệu nhập môn tuyệt vời.
- **[《高性能MySQL》 (High Performance MySQL)](https://book.douban.com/subject/23008813/)**: Kinh điển trong lĩnh vực MySQL! Bắt buộc phải đọc khi học MySQL! Thuộc loại advanced, chủ yếu dạy cách sử dụng MySQL tốt hơn. Vừa có lý thuyết vừa có thực hành! Nếu không có thời gian đọc hết, khuyến nghị chương 5 (Creating High Performance Indexes) và chương 6 (Query Performance Optimization) nhất định phải đọc kỹ.
- **[《MySQL技术内幕》 (MySQL Internals)](https://book.douban.com/subject/24708143/)**: Muốn tìm hiểu sâu về MySQL storage engine — đọc cuốn này là đúng!

![](/images/github/javaguide/books/up-3d31e762933f9e50cc7170b2ebd8433917b.png)

Về video, bạn có thể xem [《MySQL Database Tutorial》](https://www.bilibili.com/video/BV1fx411X7BD) của Dongli Node. Video này về cơ bản giới thiệu đủ các kiến thức nhập môn liên quan đến MySQL.

Ngoài ra, rất khuyến nghị **[《MySQL是怎样运行的》 (How MySQL Works)](https://book.douban.com/subject/35231266/)** — nội dung rất phù hợp để chuẩn bị phỏng vấn. Giảng rất chi tiết nhưng không nhàm chán, nội dung rất tâm huyết!

![](/images/github/javaguide/csdn/20210703120643370.png)

## PostgreSQL

Giống MySQL, PostgreSQL cũng là relational database open source miễn phí và mạnh mẽ. Slogan của PostgreSQL là "**The World's Most Advanced Open Source Relational Database**".

![](/images/github/javaguide/books/image-20220702144954370.png)

Những năm gần đây, do các new features của PostgreSQL quá xuất sắc, ngày càng nhiều project chuyển từ MySQL sang PostgreSQL.

Nếu bạn còn đang phân vân có nên thử PostgreSQL không, khuyến nghị xem topic Zhihu này: [PostgreSQL so với MySQL, ưu điểm ở đâu? - Zhihu](https://www.zhihu.com/question/20010554).

### 《PostgreSQL Guide: Internals》

[《PostgreSQL Guide: Internals》](https://book.douban.com/subject/33477094/) chủ yếu giới thiệu cơ chế hoạt động bên trong của PostgreSQL, bao gồm tổ chức logic và physical implementation của database objects, process và memory architecture.

Lúc mới đi làm cần dùng PostgreSQL, đọc được khoảng 1/3 nội dung, cảm thấy không tệ.

![](/images/github/javaguide/books/PostgreSQL-Guide.png)

### 《PostgreSQL Internals: Deep Exploration of Query Optimization》

[《PostgreSQL Internals: Deep Exploration of Query Optimization》](https://book.douban.com/subject/30256561/) chủ yếu nói về một số chi tiết implementation kỹ thuật trong query optimization của PostgreSQL, có thể giúp bạn hiểu sâu về query optimizer của PostgreSQL.

![《PostgreSQL Internals: Deep Exploration of Query Optimization》](/images/github/javaguide/books/PostgreSQL-TechnologyInsider.png)

## Redis

**Redis là một database được phát triển bằng C**, nhưng khác với database truyền thống ở chỗ **dữ liệu của Redis được lưu trong memory** — tức là nó là in-memory database, nên tốc độ đọc/ghi rất nhanh. Do đó Redis được ứng dụng rộng rãi cho caching.

Nếu bạn muốn học Redis, rất khuyến nghị hai cuốn sách sau:

- [《Redis Design and Implementation》](https://book.douban.com/subject/25900156/): Chủ yếu là nội dung liên quan đến Redis theory, khá toàn diện. Tôi trước đây đã viết một bài [《7 năm trước, 24 tuổi, xuất bản một cuốn sách kinh điển về Redis》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247507030&idx=1&sn=0a5fd669413991b30163ab6f5834a4ad&chksm=cea1939df9d61a8b93925fae92f4cee0838c449534e60731cfaf533369831192e296780b32a6&token=709354671&lang=zh_CN&scene=21#wechat_redirect) để giới thiệu cuốn sách này.
- [《Redis Core Principles and Practice》](https://book.douban.com/subject/26612779/): Chủ yếu kết hợp source code để phân tích các kiến thức quan trọng của Redis như các data structures và advanced features.

![《Redis Design and Implementation》 và 《Redis Core Principles and Practice》](/images/github/javaguide/books/redis-books.png)

Ngoài ra, [《Redis Development and Operations》](https://book.douban.com/subject/26971561/) cũng rất tốt — vừa có giới thiệu cơ bản vừa có chia sẻ kinh nghiệm development và operations thực tế.

![《Redis Development and Operations》](/images/github/javaguide/books/redis-kaifa-yu-yunwei.png)
