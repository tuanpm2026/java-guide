---
title: Sách kinh điển CS Basics phải đọc
description: Gợi ý sách Computer Basics, tổng hợp giáo trình kinh điển và tài nguyên học tập về operating systems, computer networks, algorithms & data structures, compiler principles và các core courses khác.
category: Computer Books
icon: "computer"
head:
  - - meta
    - name: keywords
      content: computer basics book selection
---

Xét đến việc nhiều bạn thích xem video, phần này tôi không chỉ khuyến nghị sách mà còn giới thiệu một số video tutorials tốt và Projects từ các trường đại học nổi tiếng.

## Operating Systems

**Tại sao phải học Operating Systems?**

**Về nâng cao năng lực cá nhân**: Nhiều ideas và classic algorithms trong OS, bạn đều có thể tìm thấy bóng dáng chúng trong các tools hoặc frameworks dùng trong phát triển hàng ngày. Ví dụ cache chúng ta dùng trong development (như Redis) rất giống high-speed cache của OS. CPU cache có nhiều loại, hầu hết để giải quyết sự không cân bằng giữa tốc độ xử lý CPU và memory. Memory cũng có thể coi là high-speed cache của external storage — khi program chạy ta copy data từ external storage vào memory, vì tốc độ memory cao hơn nhiều nên tăng tốc xử lý. Tương tự Redis cache là để giải quyết sự chênh lệch tốc độ giữa program processing và relational database access. High-speed cache thường theo locality principle (80/20 rule) dùng eviction algorithms để đảm bảo data thường được truy cập. Redis cache cũng thường theo 80/20 rule với similar eviction algorithms.

**Từ góc độ phỏng vấn**: Đặc biệt campus recruitment, OS knowledge được hỏi rất nhiều.

**Nói đơn giản, học OS nâng cao chiều sâu suy nghĩ và khả năng hiểu kỹ thuật, và OS knowledge là bắt buộc cho phỏng vấn.**

Nếu muốn học OS có hệ thống, hardest và most authoritative book là **[《Operating Systems: Three Easy Pieces》](https://book.douban.com/subject/33463930/)**. Kết hợp thêm **[《Computer Systems: A Programmer's Perspective》](https://book.douban.com/subject/1230413/)** để hiểu sâu hơn bản chất của computer systems!

![](/images/github/javaguide/booksimage-20201012191645919.png)

Ngoài ra, một cuốn sách OS domestic ra gần đây cũng rất tốt: **[《Modern Operating Systems: Principles and Implementation》](https://book.douban.com/subject/35208251/)** (tác phẩm của team thầy Xia và thầy Chen, đáng khuyến nghị).

![](/images/github/javaguide/books/20210406132050845.png)

Nếu bạn thích thực hành và không hứng thú với lý thuyết, khuyến nghị xem **[《Making your own 32-bit OS in 30 Days》](https://book.douban.com/subject/11530329/)** — sẽ hướng dẫn từng bước viết một OS.

Học trên giấy vẫn thấy nông — muốn hiểu thực sự phải thực hành! Rất khuyến nghị CS majors phải thực hành nhiều!

![](/images/github/javaguide/booksimage-20220409123802972.png)

Sách khác được khuyến nghị:

- **[《Write Your Own OS》](https://book.douban.com/subject/1422377/)**: Không chỉ phân tích chi tiết OS principles mà còn hướng dẫn từng bước dùng C và assembly để viết OS framework với basic functions.
- **[《Modern Operating Systems》](https://book.douban.com/subject/3852290/)**: Nội dung rất tốt. Dịch thuật tạm. Khuyến nghị làm exercises sau mỗi chapter.
- **[《Orange'S: OS Implementation》](https://book.douban.com/subject/26745156/)**: Tác giả từ Peking University, senior engineer tại Baidu. Do gặp khó trong môn OS ở đại học, sau đó nghiên cứu sâu và viết cuốn này.
- **[《Deep Dive into Linux OS》](https://book.douban.com/subject/25743846/)**: Theo dọc cuốn sách có cái nhìn rõ ràng về cách build a complete GNU/Linux system.
- **[《Operating System Design and Implementation》](https://book.douban.com/subject/2044818/)**: Authoritative OS textbook.
- **[《Orange'S: A One-implementation OS》](https://book.douban.com/subject/3735649/)**: Từ 20 dòng boot sector code, từng bước giúp bạn hoàn thành OS framework. Read together with 《OS Design and Implementation》!

Nếu thích xem video, khuyến nghị MOOC [《Operating Systems》](https://www.icourse163.org/course/HIT-1002531008) của thầy Li Zhijun từ Harbin Institute of Technology. Chất lượng content vượt trội so với nhiều national quality courses.

Curriculum outline:

![Curriculum outline](/images/github/javaguide/books/image-20220414144527747.png)

Covers six basic modules: CPU management, memory management, I/O device management, disk and file system, user interface và startup modules.

Độ khó của khóa học khá cao, đặc biệt các labs. Nếu muốn thực sự hiểu OS bottom-layer principles, hãy làm labs. Như thầy Li Zhijun nói: "Learning on paper is shallow — true understanding requires hands-on practice".

![](/images/github/javaguide/books/image-20220414145210679.png)

Nếu có thể tự làm một số labs, tôi tin sự hiểu biết về OS của bạn sẽ tăng lên mấy bậc. Tất nhiên nếu chỉ chuẩn bị phỏng vấn thì không cần làm labs.

Nói thật lòng, tôi rất thích các bài giảng của thầy Li Zhijun. Ông biết khoảng cách giữa domestic và foreign teaching materials, và đang cố gắng thu hẹp khoảng cách đó theo cách riêng của mình. Trân trọng.

![](/images/github/javaguide/books/image-20220414145249714.png)

Khóa học nước ngoài này cũng rất tốt: [《Computer Systems: A Programmer's Perspective》](https://www.bilibili.com/video/av31289365?from=search&seid=16298868573410423104).

## Computer Networks

Computer Networks là môn học có hệ thống mạnh. Các trường đại học danh tiếng đã phát triển curriculum khá mature.

Để học tốt computer networking, đầu tiên cần hiểu mô hình OSI 7-layer hoặc TCP/IP 5-layer, tức là application layer (application, presentation, session), transport layer, network layer, data link layer, physical layer.

![OSI 7-layer model](/images/github/javaguide/booksosi%E4%B8%83%E5%B1%82%E6%A8%A1%E5%9E%8B2.png)

Sách tham khảo rất khuyến nghị là **《Computer Networking: A Top-Down Approach》** từ Mechanical Industry Press. Mục lục rõ ràng, giảng theo TCP/IP 5-layer model, thảo luận chi tiết về mỗi layer. Về cơ bản curriculum của hầu hết các trường đều theo mục lục của cuốn này.

![](/images/github/javaguide/booksimage-20220409123250570.png)

Nếu thấy cuốn trên nhàm chán, rất khuyến nghị hai cuốn thú vị sau:

- [《Illustrated HTTP》](https://book.douban.com/subject/25863515/): Giảng HTTP như truyện tranh, rất thú vị, không chán. Bao gồm hầu hết HTTP knowledge points phổ biến. Do số trang, nội dung có thể không đầy đủ. Nhưng nếu không chuyên về networking mà muốn hiểu HTTP, cuốn này là đủ.
- [《How Networks Connect》](https://book.douban.com/subject/26941639/): Từ khi bạn gõ URL vào browser đến khi webpage hiển thị, trace toàn bộ quá trình. Với hình ảnh minh họa, giải thích toàn cảnh networking và cách actual network devices và software hoạt động.

![](/images/github/javaguide/booksimage-20201011215144139.png)

Ngoài theoretical knowledge, học computer networking cần "**hands-on practice**" — tương tự programming.

GitHub có các computer networking labs/Projects từ các trường nổi tiếng:

- [Harbin Institute of Technology Computer Networking Lab](https://github.com/rccoder/HIT-Computer-Network)
- [《Computer Networking - A Top-Down Approach (6th Ed)》 programming assignments and Wireshark lab translations](https://github.com/moranzcw/Computer-Networking-A-Top-Down-Approach-NOTES)
- [Semester Project for Computer Networks, chat room in Python](https://github.com/KevinWang15/network-pj-chatroom)
- [CMU Computer Networks course](https://computer-networks.github.io/sp19/lectures.html)

Video recommendations:

**1. [Harbin Institute of Technology Computer Networks Course](http://www.icourse163.org/course/HIT-154005)**: National quality course, already opened 10+ times. Community rating is very high!

![](/images/github/javaguide/booksimage-20201218141241911.png)

**2. [Wangdao Graduate Entrance Exam Computer Networks](https://www.bilibili.com/video/BV19E411D78Q?from=search&seid=17198507506906312317)**: Very suitable for CS major students preparing for graduate entrance exams! Currently has 16k+ likes on Bilibili.

![](/images/github/javaguide/booksimage-20201218141652837.png)

## Algorithms

First, three introductory books. Any one of these three is great for getting started.

1. [《My First Algorithm Book》](https://book.douban.com/subject/30357170/)
2. [《Grokking Algorithms》](https://book.douban.com/subject/26979890/)
3. [《Aha! Algorithm》](https://book.douban.com/subject/25894685/)

![](/images/java-guide-blog/image-20210327104418851.png)

Cá nhân tôi prefer **[《My First Algorithm Book》](https://book.douban.com/subject/30357170/)** mặc dù Douban score hơi thấp hơn hai cuốn kia. Illustrations và explanations là the best of these three. The only obvious issue is no code examples. But that doesn't prevent it from being a good introductory book. These introductory books aren't meant to make you strong in algorithms — just to introduce you to algorithm learning.

A few more classic algorithm books:

**[《Algorithms》](https://book.douban.com/subject/19952400/)**

![](/images/github/javaguide/booksimage-20220409123422140.png)

Very clear and easy to understand, suitable for data structures and algorithms beginners. Covers common data structures and algorithms! Provides detailed Java code — very suitable for Java learners. Can be called a must-have for Java programmers.

> **Below books are classics among classics but reading difficulty is high. No extensive commentary — they're god-tier books!**
>
> **If you're just preparing for algorithm interviews, don't recommend reading these books.**

**[《Programming Pearls》](https://book.douban.com/subject/3227098/)**

Classic classic work, strongly recommended by ACM champions and algorithm greats. The author is also remarkable — Java father James Gosling was his student.

Many say this book doesn't teach specific algorithms but teaches a way of thinking about programming. This way of thinking applies not just in programming but elsewhere too.

**[《The Algorithm Design Manual》](https://book.douban.com/subject/4048566/)**

Strongly recommended by the viral GitHub CS self-study project [Teach Yourself Computer Science](https://teachyourselfcs.com/).

Similar god-tier books: [《Introduction to Algorithms》](https://book.douban.com/subject/20432061/), [《The Art of Computer Programming (Vol 1)》](https://book.douban.com/subject/1130500/).

**For interview preparation, these books might help:**

**[《Sword Refers to Offer》](https://book.douban.com/subject/6466465/)**

![](/images/github/javaguide/booksimage-20220409145506482.png)

This interview bible covers many classic algorithm interview questions. Don't miss it if preparing for big company interviews.

Open source project with solutions: [CodingInterviews](https://github.com/gatieme/CodingInterviews).

**[《Programmer Code Interview Guide (2nd Ed)》](https://book.douban.com/subject/30422021/)**

Questions here are much harder than Sword Refers to Offer. More comprehensive coverage. Nearly 300 real classic code interview questions.

Video recommendation: Peking University national quality course — **[Algorithm Design (2): Algorithm Fundamentals](https://www.icourse163.org/course/PKU-1001894005)** — excellent!

![](/images/github/javaguide/books/22ce4a17dc0c40f6a3e0d58002261b7a.png)

Covers seven fundamental algorithms (enumeration, binary search, recursion, divide and conquer, dynamic programming, search, greedy). And some example problems are equivalent to medium-level ACM international programming contest problems.

## Data Structures

Many algorithm books mentioned above (like 《Algorithms》 and 《Introduction to Algorithms》) already cover common data structures in detail.

A few more data structure books:

**[《Big Talk Data Structures》](https://book.douban.com/subject/6424904/)**

Introductory book, easy to read, suitable for data structure beginners.

**[《Data Structures and Algorithm Analysis: Java》](https://book.douban.com/subject/3351237/)**

High quality, introduces common data structures and algorithms.

Similar: **[《Data Structures and Algorithm Analysis: C》](https://book.douban.com/subject/1139426/)**, **[《Data Structures and Algorithm Analysis: C++》](https://book.douban.com/subject/1971825/)**

Video recommendation: Zhejiang University national quality course — **[《Data Structures》](https://www.icourse163.org/course/ZJU-93001#/info)**.

Professor Lao Lao's data structures lectures are excellent! Though there's some difficulty, especially in exercises.

## CS Major Core Courses

Mathematics and English are general courses, usually completed in freshman and sophomore years. Specialized courses come in sophomore and junior years. Math has high credit weight and affects GPA, ranking and graduate school recommendations.

### Mathematics

#### Calculus (Advanced Mathematics)

Calculus (known as "high math") is the dread of many freshmen. But university exams aren't as strict as high school. Calculus matters for CS in computer graphics, machine learning gradient algorithms, signal processing, etc.

Book recommendation: 《The Princeton Review of Calculus》. This book details fundamentals, limits, continuity, differentiation, derivatives, integration, infinite series, Taylor series and power series.

#### Linear Algebra

Linear algebra has a more complex thinking mode — it defines a whole new mathematical world with new symbols and theorems. The way to understand it is geometrically.

Book recommendation: 《Linear Algebra Study Guide》 by Professor Li Shangzhi of USTC.

#### Probability and Statistics

For CS students, probability is more useful than statistics. Probability theory follows a path similar to calculus — formulas with examples. **Probability theory is an important prerequisite for data analysis, and probability in machine learning is self-evident.**

Book recommendation: 《Probability and Statistics Tutorial》. 8 chapters: first 4 on probability theory, last 4 on statistics.

#### Discrete Mathematics (Set theory, Graph theory, Modern Algebra, etc.)

Discrete mathematics is specialized math for CS. Mainly useful in graph research and other highly theoretical areas. Important for those pursuing graduate research.

### English

English is a flexible skill in university. For CS students specifically:

English courses are usually only in the first two years. **Don't rely on English courses to improve your English level.** Improvement requires daily accumulation, practice and targeted exercises.

**CET-4 and CET-6 certifications are must-haves.** Most employment positions check them. CET-4 is slightly harder than high school English. CET-6 needs targeted training. For CET-4 and 6, the pass line is 425 — achievable with focused practice on past papers plus high-frequency vocabulary. 600+ is excellent and a highlight on your resume.

IELTS and TOEFL are for those planning to study abroad or positions with special English requirements.

For CS students, key English abilities:

- **Proficiently use English-interface software and systems**
- **Read overseas blogs and bug solutions without difficulty**
- **Read English papers fluently**
- **Have some English paper writing ability**

### Compiler Principles

Compared to previous courses, compiler principles is less critical for most developers. Its importance lies in:

- Development of low-level languages, engines or high-level languages (like MySQL, Java)
- OS or embedded systems development
- Ideas of lexical, syntactic, semantic analysis and automata theory

**Important prerequisite: Formal Language and Automata. Automata theory has important applications in lexical analysis.**

Book recommendation: 《Compilers: Principles, Techniques and Tools》 (Dragon Book — difficult to get through). Other recommendations:

- **[《Modern Compiler Implementation》](https://book.douban.com/subject/30191414/)**: Introductory compiler book.
- **[《Engineering a Compiler》](https://book.douban.com/subject/20436488/)**: Covers all topics from frontend to backend.

Video recommendation: [Harbin Institute of Technology Compiler Principles](https://www.icourse163.org/course/HIT-1002123007) — national quality course with great instructor!

![](/images/github/javaguide/books/20210406152847824.png)
