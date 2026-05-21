---
title: Giải thích chi tiết Java IO Model
description: "Giải thích chi tiết Java IO Model: phân tích sâu ba model BIO blocking IO, NIO non-blocking IO, AIO async IO, cơ chế multiplexing, Reactor/Proactor pattern, phân biệt khái niệm synchronous/asynchronous/blocking/non-blocking."
category: Java
tag:
  - Java IO
  - Java cơ bản
head:
  - - meta
    - name: keywords
      content: Java IO model,BIO,NIO,AIO,blocking IO,non-blocking IO,multiplexing,Reactor pattern,Proactor pattern
---

IO model thực sự khó hiểu, đòi hỏi nhiều kiến thức nền tảng về máy tính. Viết bài này mất khá nhiều thời gian — hy vọng trình bày được những gì tôi biết! Chúc các bạn học được nhiều điều hữu ích! Để viết bài này còn lật lại cuốn 《UNIX Network Programming》 — khó quá trời!

_Năng lực cá nhân có hạn. Nếu bài viết có bất kỳ chỗ nào cần bổ sung/hoàn thiện/chỉnh sửa, hoan nghênh nhận xét, cùng tiến bộ!_

## Lời mở đầu

I/O luôn là điểm kiến thức khó hiểu với nhiều người. Bài này tôi sẽ kể lại I/O theo cách hiểu của mình, hy vọng có thể hữu ích cho bạn.

## I/O

### I/O là gì?

I/O (**I**nput/**O**utput) — **nhập/xuất**.

**Trước tiên giải nghĩa I/O từ góc độ cấu trúc máy tính.**

Theo kiến trúc Von Neumann, cấu trúc máy tính chia thành 5 phần: ALU (Arithmetic Logic Unit), Control Unit, Memory, Input device, Output device.

![Kiến trúc Von Neumann](https://oss.javaguide.cn/github/javaguide/java/io/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9pcy1jbG91ZC5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70.jpeg)

Input device (như bàn phím) và output device (như màn hình) đều là thiết bị ngoại vi. Network card, HDD có thể vừa là input device vừa là output device.

Input device nhập dữ liệu vào máy tính, output device nhận dữ liệu đầu ra từ máy tính.

**Từ góc độ cấu trúc máy tính, I/O mô tả quá trình giao tiếp giữa computer system và thiết bị ngoại vi.**

**Bây giờ giải nghĩa I/O từ góc độ ứng dụng.**

Theo kiến thức OS học ở đại học: Để đảm bảo tính ổn định và bảo mật của OS, address space của một process được chia thành **User space** và **Kernel space**.

Các ứng dụng thông thường đều chạy trong user space. Chỉ kernel space mới có thể thực hiện các thao tác liên quan đến resource ở system level như file management, process communication, memory management, v.v. Tức là, để thực hiện IO operation nhất thiết phải dựa vào khả năng của kernel space.

Và, program trong user space không thể trực tiếp truy cập kernel space.

Khi muốn thực thi IO operation, do không có quyền thực hiện trực tiếp, chỉ có thể phát system call để yêu cầu OS hỗ trợ.

Do đó, user process muốn thực thi IO operation phải truy cập gián tiếp kernel space qua **system call**.

Trong quá trình phát triển hàng ngày, chúng ta tiếp xúc nhiều nhất là **disk IO (đọc/ghi file)** và **network IO (network request và response)**.

**Từ góc độ ứng dụng: Ứng dụng phát IO call (system call) đến kernel của OS. Kernel chịu trách nhiệm thực thi IO operation cụ thể. Tức là, ứng dụng thực ra chỉ phát call cho IO operation — IO thực sự được thực thi bởi kernel của OS.**

Sau khi ứng dụng phát I/O call, sẽ trải qua hai bước:

1. Kernel chờ I/O device chuẩn bị dữ liệu.
2. Kernel copy dữ liệu từ kernel space sang user space.

### Có những IO model phổ biến nào?

Trong UNIX system, IO model có 5 loại: **Synchronous Blocking I/O**, **Synchronous Non-blocking I/O**, **I/O Multiplexing**, **Signal-driven I/O** và **Asynchronous I/O**.

Đây cũng là 5 IO model chúng ta thường nhắc đến.

## 3 IO model phổ biến trong Java

### BIO (Blocking I/O)

**BIO thuộc Synchronous Blocking IO model.**

Trong Synchronous Blocking IO model, sau khi ứng dụng phát `read` call, sẽ block liên tục cho đến khi kernel copy dữ liệu sang user space.

![Nguồn hình: 《Deep Dive Tomcat & Jetty》](https://oss.javaguide.cn/p3-juejin/6a9e704af49b4380bb686f0c96d33b81~tplv-k3u1fbpfcp-watermark.png)

Khi số client connection không cao thì không có vấn đề. Nhưng khi đối mặt với hàng trăm nghìn hay hàng triệu connection, BIO model truyền thống hoàn toàn bất lực. Do đó cần model I/O xử lý hiệu quả hơn để đáp ứng concurrency cao hơn.

### NIO (Non-blocking/New I/O)

NIO trong Java được giới thiệu trong Java 1.4, tương ứng với package `java.nio`, cung cấp các abstraction như `Channel`, `Selector`, `Buffer`. N trong NIO có thể hiểu là Non-blocking, không đơn thuần là New. Nó là phương pháp I/O operation dựa trên buffer và channel. Với ứng dụng (network) high-load, high-concurrency nên dùng NIO.

NIO trong Java có thể coi là **I/O Multiplexing model**. Cũng có nhiều người cho rằng NIO trong Java thuộc Synchronous Non-blocking IO model.

Hãy theo dõi tiếp, tin rằng bạn sẽ có câu trả lời!

Trước tiên xem **Synchronous Non-blocking IO model**.

![Nguồn hình: 《Deep Dive Tomcat & Jetty》](https://oss.javaguide.cn/p3-juejin/bb174e22dbe04bb79fe3fc126aed0c61~tplv-k3u1fbpfcp-watermark.png)

Trong Synchronous Non-blocking IO model, ứng dụng liên tục phát `read` call. Trong khoảng thời gian chờ kernel copy dữ liệu sang user space, thread vẫn bị block cho đến khi kernel copy xong dữ liệu sang user space.

So với Synchronous Blocking IO model, Synchronous Non-blocking IO model có cải thiện đáng kể. Thông qua polling, tránh được việc block liên tục.

> Synchronous non-blocking IO: Phát một `read` call; nếu dữ liệu chưa chuẩn bị sẵn, ứng dụng không cần block chờ mà có thể chuyển sang làm một số tính toán nhỏ, sau đó quay lại tiếp tục phát `read` call — đây là polling. Polling không phát liên tục mà có khoảng dừng. Việc tận dụng khoảng dừng này chính là điểm hiệu quả hơn của Synchronous Non-blocking IO so với Synchronous Blocking IO.

Nhưng IO model này cũng có vấn đề: **Quá trình ứng dụng liên tục thực hiện I/O system call để polling xem dữ liệu đã sẵn chưa tiêu tốn rất nhiều CPU resource.**

Lúc này **I/O Multiplexing model** xuất hiện.

![](https://oss.javaguide.cn/github/javaguide/java/io/88ff862764024c3b8567367df11df6ab~tplv-k3u1fbpfcp-watermark.png)

Trong IO Multiplexing model, thread trước tiên phát `select` call, hỏi kernel xem dữ liệu đã sẵn chưa. Sau khi kernel chuẩn bị dữ liệu xong, user thread mới phát `read` call. Quá trình `read` call (dữ liệu từ kernel space → user space) vẫn bị block.

> Hiện tại các system call hỗ trợ IO multiplexing gồm select, epoll, v.v. System call `select` hiện được hỗ trợ trên hầu hết mọi OS.
>
> - **select call**: System call do kernel cung cấp, hỗ trợ query trạng thái khả dụng của nhiều system call cùng lúc. Hầu hết OS đều hỗ trợ.
> - **epoll call**: Linux 2.6 kernel, là phiên bản nâng cao của select call, tối ưu hiệu quả thực thi IO.

**IO Multiplexing model giảm tiêu thụ CPU resource bằng cách giảm system call không hiệu quả.**

NIO trong Java có khái niệm **Selector (Bộ chọn)** rất quan trọng, còn gọi là **Multiplexer**. Thông qua nó, chỉ cần một thread có thể quản lý nhiều client connection. Chỉ khi dữ liệu từ client đến mới phục vụ.

![Quan hệ giữa Buffer, Channel và Selector](https://oss.javaguide.cn/github/javaguide/java/nio/channel-buffer-selector.png)

### AIO (Asynchronous I/O)

AIO chính là NIO 2. Java 7 giới thiệu NIO 2 — phiên bản cải tiến của NIO, là Asynchronous IO model.

Async IO được triển khai dựa trên event và callback mechanism. Tức là ứng dụng sau khi thực hiện operation sẽ return ngay, không bị block ở đó. Khi backend xử lý xong, OS sẽ thông báo cho thread tương ứng để thực hiện các operation tiếp theo.

![](https://oss.javaguide.cn/github/javaguide/java/io/3077e72a1af049559e81d18205b56fd7~tplv-k3u1fbpfcp-watermark.png)

Hiện tại AIO chưa được ứng dụng rộng rãi. Netty trước đây cũng đã thử dùng AIO nhưng sau đó bỏ. Vì sau khi Netty dùng AIO, hiệu năng trên Linux system không tăng lên mấy.

Cuối cùng, một hình tóm tắt đơn giản về BIO, NIO, AIO trong Java.

![So sánh BIO, NIO và AIO](https://oss.javaguide.cn/github/javaguide/java/nio/bio-aio-nio.png)

## Tài liệu tham khảo

- 《Deep Dive Tomcat & Jetty》
- Hoàn thành một IO như thế nào: <https://llc687.top/126.html>
- Developer nên hiểu IO như thế này: <https://www.jianshu.com/p/fa7bdc4f3de7>
- Hiểu nguyên lý tầng dưới Java NIO trong 10 phút: <https://www.cnblogs.com/crazymakercircle/p/10225159.html>
- Biết bao nhiêu về IO model | Lý thuyết: <https://www.cnblogs.com/sheng-jie/p/how-much-you-know-about-io-models.html>
- 《UNIX Network Programming Volume 1: The Sockets Networking API》 Section 6.2 IO Models

<!-- @include: @article-footer.snippet.md -->
