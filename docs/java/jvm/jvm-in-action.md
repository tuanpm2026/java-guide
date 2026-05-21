---
title: Các case study troubleshoot vấn đề JVM và performance tuning
description: Tổng hợp các case study troubleshoot và tối ưu hiệu năng JVM trong production, bao gồm memory, GC, sử dụng công cụ, v.v.
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: JVM thực chiến,troubleshoot online,performance tuning,memory analysis,GC optimization,tools
---

Troubleshoot vấn đề JVM online và performance tuning cũng là câu hỏi phỏng vấn thường gặp, đặc biệt trong phỏng vấn big tech khi tuyển dụng kinh nghiệm.

Bài này tôi sẽ chia sẻ một số case study liên quan tôi đã đọc được.

Dưới đây là nội dung chính.

[Phân tích một vấn đề OOM online - Aí Xiǎo Xiān - 2023](https://juejin.cn/post/7205141492264976445)

- **Hiện tượng**: Một interface của service online rất chậm. Kiểm tra qua monitoring link phát hiện GAP time ở giữa rất lớn, nhưng interface thực tế không tốn nhiều thời gian. Trong khoảng thời gian đó có rất nhiều request như vậy.
- **Phân tích**: Dùng `jvisualvm` của JDK để phân tích dump file (MAT cũng có thể phân tích).
- **Khuyến nghị**: Với câu SQL, nếu phát hiện full table query không có `where` condition thì mặc định nên thêm `limit` phù hợp để giới hạn, ngăn vấn đề này kéo sập toàn bộ hệ thống.
- **Tài liệu**: [Case thực chiến: Ghi lại một lần phân tích dump file - HeapDump - 2022](https://heapdump.cn/article/3489050).

[Production incident — Ghi lại một lần troubleshoot OOM đặc biệt - Chéngyǔ Yǒuyún - 2023](https://www.cnblogs.com/mylibs/p/production-accident-0002.html)

- **Hiện tượng**: Trong điều kiện mạng bình thường, một open interface của hệ thống bắt đầu không thể truy cập và sử dụng từ khoảng 14h ngày 10/3/2023.
- **Giải pháp tạm thời**: Rollback khẩn cấp về phiên bản ổn định trước đó.
- **Phân tích**: Dùng công cụ MAT (Memory Analyzer Tool) phân tích dump file.
- **Khuyến nghị**: Thông thường, tham số `-Xmn` (kiểm soát kích thước Young area) phải luôn nhỏ hơn tham số `-Xmx` (kiểm soát kích thước heap memory tối đa), ngược lại sẽ trigger OOM error.
- **Tài liệu**: [Tổng hợp các tham số JVM quan trọng nhất - JavaGuide - 2023](https://javaguide.cn/java/jvm/jvm-parameters-intro.html)

[Troubleshoot phân tích một lần rò rỉ native memory JVM lớn (vấn đề 64M) - Juejin - 2022](https://juejin.cn/post/7078624931826794503)

- **Hiện tượng**: Khi project online vừa khởi động, dùng lệnh `top` kiểm tra thấy RES chiếm hơn 1.5G.
- **Phân tích**: Toàn bộ quy trình phân tích dùng khá nhiều công cụ, có thể theo từng bước theo tư duy của tác giả — rất đáng học hỏi.
- **Khuyến nghị**: Tránh xa Hibernate.
- **Tài liệu**: [Các trường liên quan đến memory trong lệnh Linux top (VIRT, RES, SHR, CODE, DATA)](https://liam.page/2020/07/17/memory-stat-in-TOP/)

[Troubleshoot vấn đề YGC, lại học được thêm! - IT Career Advancement - 2021](https://www.heapdump.cn/article/1661497)

- **Hiện tượng**: Sau khi phiên bản mới của ad service lên online, nhận được lượng lớn cảnh báo service timeout.
- **Phân tích**: Dùng công cụ MAT (Memory Analyzer Tool) phân tích dump file.
- **Khuyến nghị**: Học cách troubleshoot vấn đề YGC (Young GC), nắm vững kiến thức liên quan YGC.

[JVM performance optimization khó không? Hôm nay tôi thử một chút! - Chén Shùyì - 2021](https://shuyi.tech/archives/have-a-try-in-jvm-combat)

Bằng cách quan sát GC frequency và pause time, điều chỉnh JVM memory space để đạt trạng thái hợp lý nhất. Trong quá trình điều chỉnh nhớ đi từng bước nhỏ, tránh memory biến động mạnh ảnh hưởng đến online service. Đây thực ra là cách JVM performance tuning đơn giản nhất, có thể coi là coarse tuning.

[Các case GC problem trên môi trường production mà các bạn muốn đây - Biān Le Gè Chéng - 2021](https://mp.weixin.qq.com/s/df1uxHWUXzhErxW1sZ6OvQ)

- **Case 1**: Khi dùng guava cache, không đặt maximum cache count và weak reference, dẫn đến thường xuyên trigger Young GC.
- **Case 2**: Với một câu SQL query và sort phân trang, câu SQL này cần join nhiều bảng. Trong sharding scenario, gọi trực tiếp SQL hiệu năng rất kém. Vì vậy chuyển sang query bảng đơn rồi sort phân trang trong memory, dùng List để lưu data. Một số data volume lớn gây ra hiện tượng này.

[Phân tích và giải quyết 9 loại vấn đề CMS GC phổ biến trong Java - Meituan Tech Team - 2020](https://tech.meituan.com/2020/11/12/java-9-cms-gc.html)

Bài này hơn 20.000 chữ, giới thiệu chi tiết kiến thức cơ bản GC, tổng kết một số phân tích và giải pháp cho các vấn đề CMS GC phổ biến.

[Tuning GC cho hệ thống legacy, pause time giảm 90% - JD Cloud Tech Team - 2023](https://juejin.cn/post/7311623433817571365)

Bài này đề cập đến một vấn đề GC (garbage collection) gặp trong rule engine system, chủ yếu biểu hiện là hệ thống sau khi khởi động xảy ra một lần Young GC (young generation garbage collection) dài dẫn đến hiệu năng giảm. Qua phân tích, core của vấn đề là dynamic object age determination mechanism — nó gây ra object promotion quá sớm, dẫn đến garbage collection kéo dài.

<!-- @include: @article-footer.snippet.md -->
