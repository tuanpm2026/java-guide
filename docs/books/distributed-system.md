---
title: Sách kinh điển phải đọc về Distributed System
description: Gợi ý sách về distributed system, DDIA, distributed transaction, consensus algorithm, microservices architecture và các sách kinh điển khác để nắm vững kiến thức cốt lõi về distributed system design.
category: Computer Books
icon: "distributed-network"
---

## 《Deep Understanding of Distributed Systems》

![](https://oss.javaguide.cn/github/javaguide/books/deep-understanding-of-distributed-system.png)

**[《Deep Understanding of Distributed Systems》](https://book.douban.com/subject/35794814/)** là cuốn sách distributed bằng tiếng Trung original xuất bản năm 2022, chủ yếu nói về các khái niệm cơ bản trong lĩnh vực distributed, các thách thức phổ biến và consensus algorithms.

Tác giả dành nhiều trang để giới thiệu các consensus algorithms rất quan trọng trong lĩnh vực distributed, và còn dựa trên Go language hướng dẫn bạn triển khai từ đầu thuật toán Paxos — ông tổ của consensus algorithms.

Thật ra, tôi chưa bắt đầu đọc cuốn này. Nhưng! Hầu hết mọi bài viết liên quan đến distributed trên blog của tác giả cuốn này tôi đều đọc nghiêm túc. Tác giả bắt đầu ý tưởng 《Deep Understanding of Distributed Systems》 từ năm 2019, bắt đầu viết năm 2020, mất gần hai năm mới hoàn thành.

![](https://oss.javaguide.cn/github/javaguide/books/image-20220706121952258.png)

Tác giả viết riêng một bài để giới thiệu câu chuyện đằng sau cuốn sách này, bạn quan tâm có thể tự tìm đọc: <https://zhuanlan.zhihu.com/p/487534882>.

Cuối cùng, đây là link code repository và errata của cuốn sách: <https://github.com/tangwz/DistSysDeepDive>.

## 《Designing Data-Intensive Applications》

![](https://oss.javaguide.cn/github/javaguide/books/ddia.png)

Rất khuyến nghị **[《Designing Data-Intensive Application》](https://book.douban.com/subject/30329536/)** (DDIA) — xứng đáng đọc nhiều lần! Gần 90% người đọc cuốn này trên Douban đã cho 5 sao.

Cuốn sách này chủ yếu nói về distributed database, data partitioning, transactions, distributed systems v.v.

Phần lớn các khái niệm được giới thiệu trong sách bạn có thể đã nghe trước đây, nhưng sau khi đọc nội dung, bạn có thể bỗng nhiên giải khai: "Ôi! Hóa ra là như vậy! Đây không phải là nguyên lý của công nghệ X đó sao?".

Tôi đã từng viết câu trả lời trên Zhihu để giới thiệu và khuyến nghị cuốn sách này, bạn chưa đọc có thể xem: [Những cuốn sách lập trình nào khiến bạn đọc xong cảm thấy rất hứng khởi?](https://www.zhihu.com/question/50408698/answer/2278198495). Ngoài ra, nếu khi đọc cuốn sách này bạn cảm thấy khó, nhiều chỗ không hiểu, tôi khuyến nghị xem [《DDIA Chapter-by-chapter Analysis》 mini book](https://ddia.qtmuniao.com) do tác giả 《Deep Understanding of Distributed Systems》 viết.

## 《Deep Understanding of Distributed Transactions》

![](https://oss.javaguide.cn/github/javaguide/books/In-depth-understanding-of-distributed-transactions-xiaoyu.png)

Một trong các tác giả của **[《Deep Understanding of Distributed Transactions》](https://book.douban.com/subject/35626925/)** là người sáng lập Apache ShenYu (incubating) gateway và các distributed transaction frameworks như Hmily, RainCat, Myth.

Khi học distributed transactions, có thể tham khảo cuốn sách này. Mặc dù có một số lỗi nhỏ và chỗ logic không mạch lạc, nhưng về tổng thể việc giới thiệu các distributed transaction solutions vẫn khá tốt.

## 《From Paxos to ZooKeeper》

![](https://oss.javaguide.cn/github/javaguide/books/image-20211216161350118.png)

**[《From Paxos to ZooKeeper》](https://book.douban.com/subject/26292004/)** là một cuốn sách tốt để nhập môn distributed theory. Cuốn sách này chủ yếu giới thiệu một số typical distributed consistency protocols và tư duy giải quyết vấn đề distributed consistency. Trọng tâm là giới thiệu Paxos và ZAB protocols.

PS: ZooKeeper hiện nay không được dùng nhiều, không cần học quá kỹ, nhưng Paxos và ZAB protocols vẫn rất đáng nghiên cứu sâu.

## 《Deep Dive into Distributed Consensus Algorithms》

![](https://oss.javaguide.cn/github/javaguide/books/deep-dive-into-distributed-consensus-algorithms.png)

**[《Deep Dive into Distributed Consensus Algorithms》](https://book.douban.com/subject/36335459/)** phân tích chi tiết các nguyên lý cốt lõi và implementation details của các mainstream distributed consensus algorithms như Paxos, Raft, Zab. Nếu bạn muốn tìm hiểu về distributed consensus algorithms, có thể tham khảo cuốn sách này.

## 《Microservices Patterns》

![](https://oss.javaguide.cn/github/javaguide/books/microservices-patterns.png)

Tác giả của **[《Microservices Patterns》](https://book.douban.com/subject/33425123/)** là Chris Richardson — được bình chọn là một trong mười kiến trúc sư phần mềm hàng đầu thế giới và là tiên phong trong microservices architecture. Cuốn sách tập hợp 44 architecture design patterns đã được thực tiễn kiểm chứng, dùng để giải quyết các thách thức như service decomposition, transaction management, querying và cross-service communication. Nội dung không chỉ vững về lý thuyết mà còn hướng dẫn người đọc từng bước nắm vững việc develop và deploy production-level microservices architecture applications thông qua các Java code examples phong phú.

## 《Phoenix Architecture》

![](https://oss.javaguide.cn/github/javaguide/books/f5bec14d3b404ac4b041d723153658b5.png)

**[《Phoenix Architecture》](https://book.douban.com/subject/35492898/)** là tổng kết nhiều năm kinh nghiệm architecture và R&D của thầy Zhou Zhiming, nội dung rất chất lượng, vừa sâu vừa rộng, lý thuyết kết hợp thực hành!

Như phụ đề của cuốn sách "Building Reliable Large-scale Distributed Systems" nói, nội dung chính của cuốn sách này là: "Làm thế nào để xây dựng một large-scale distributed software system đáng tin cậy", bao gồm các khía cạnh:

- Con đường phát triển của software architecture từ monolithic đến microservices đến serverless.
- Những vấn đề nào architect cần chú ý khi thiết kế architecture, có những best practices nào.
- Nền tảng của distributed như các consensus algorithms phổ biến Paxos, Multi Paxos.
- Immutable infrastructure như virtualized containers, service mesh.
- Hướng dẫn tránh bẫy khi chuyển sang microservices.

Tôi đã khuyến nghị cuốn sách này nhiều lần. Xem các bài cũ:

- [Thêm một cuốn sách kinh điển của thầy Zhou Zhiming! Tìm thấy kho báu!](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247505254&idx=1&sn=04faf3093d6002354f06fffbfc2954e0&chksm=cea19aadf9d613bbba7ed0e02ccc4a9ef3a30f4d83530e7ad319c2cc69cd1770e43d1d470046&scene=178&cur_album_id=1646812382221926401#rd)
- [Thêm một cuốn sách kinh điển trong lĩnh vực Java! Thầy Zhou Zhiming YYDS!](https://mp.weixin.qq.com/s/9nbzfZGAWM9_qIMp1r6uUQ)

## Khác

- [《Distributed Systems: Concepts and Design》](https://book.douban.com/subject/21624776/): Thiên về dạng textbook, nội dung đầy đủ nhưng không thú vị, có thể dùng làm sách tham khảo.
- [《Distributed Architecture: Principles and Practice》](https://book.douban.com/subject/35689350/): Xuất bản năm 2021, không có nhiều độc giả, tôi cũng chưa đọc.
