---
title: Tổng hợp câu hỏi phỏng vấn hệ điều hành thường gặp (Phần 1)
description: Tổng hợp các câu hỏi phỏng vấn hệ điều hành tần suất cao mới nhất (Phần 1): chuyển đổi user mode/kernel mode, sự khác biệt giữa process và thread, bốn điều kiện deadlock, giải thích chi tiết system call, so sánh thuật toán lập lịch, kèm biểu đồ và đánh dấu trọng tâm, nắm vững các điểm cốt lõi của OS trong một bài, nhanh chóng vượt qua phỏng vấn kỹ thuật backend!
category: Kiến thức cơ bản máy tính
tag:
  - Hệ điều hành
head:
  - - meta
    - name: keywords
      content: 操作系统面试题,用户态 vs 内核态,进程 vs 线程,死锁必要条件,系统调用过程,进程调度算法,PCB进程控制块,进程间通信IPC,死锁预防避免,操作系统基础高频题,虚拟内存管理
---

<!-- @include: @small-advertisement.snippet.md -->

Nhiều bạn đọc phàn nàn rằng kiến thức về hệ điều hành khá phức tạp và không có nhiều kiên nhẫn để đọc, nhưng khi phỏng vấn lại thường xuyên gặp phải. Vì vậy, tôi đã tổng hợp các câu hỏi thường gặp về hệ điều hành! Bài viết này tổng hợp một số câu hỏi liên quan đến hệ điều hành mà tôi cho là khá quan trọng như **chế độ người dùng và chế độ nhân, system call, process và thread, deadlock, quản lý bộ nhớ, bộ nhớ ảo, hệ thống file** v.v.

Bài viết này chỉ là cái nhìn tổng quan về một số khái niệm quan trọng của hệ điều hành, để học sâu hơn, tôi khuyên mọi người nên đọc sách. Ngoài ra, nhiều nội dung của bài viết này tham khảo cuốn sách "Modern Operating Systems" ấn bản thứ ba, rất cảm ơn.

Trước khi bắt đầu nội dung, chúng ta hãy nói về lý do tại sao phải học hệ điều hành.

- **Về việc nâng cao năng lực cá nhân**: Nhiều ý tưởng trong hệ điều hành, nhiều thuật toán kinh điển, bạn đều có thể tìm thấy bóng dáng của chúng trong các công cụ hoặc framework được sử dụng trong phát triển hàng ngày của chúng ta. Ví dụ bộ nhớ cache trong hệ thống chúng ta phát triển (như Redis) và bộ nhớ cache tốc độ cao trong hệ điều hành rất giống nhau. CPU có nhiều loại bộ nhớ cache tốc độ cao, nhưng hầu hết đều là để giải quyết vấn đề tốc độ xử lý của CPU và tốc độ xử lý bộ nhớ không tương xứng. Chúng ta còn có thể coi bộ nhớ là bộ nhớ cache tốc độ cao của bộ nhớ ngoài, khi chương trình chạy chúng ta sao chép dữ liệu từ bộ nhớ ngoài vào bộ nhớ, do tốc độ xử lý bộ nhớ cao hơn nhiều so với bộ nhớ ngoài, điều này cải thiện tốc độ xử lý. Tương tự, bộ nhớ cache Redis mà chúng ta sử dụng là để giải quyết vấn đề tốc độ xử lý chương trình và tốc độ truy cập cơ sở dữ liệu quan hệ thông thường không tương xứng. Bộ nhớ cache tốc độ cao thường sẽ đảm bảo dữ liệu trong cache là dữ liệu thường xuyên được truy cập theo nguyên tắc cục bộ (nguyên tắc 2-8) dựa trên thuật toán loại bỏ tương ứng. Redis cache chúng ta thường dùng cũng thường áp dụng nguyên tắc 2-8, nhiều thuật toán loại bỏ đều tương tự như trong hệ điều hành. Đã nói về nguyên tắc 2-8, thì không thể không đề cập đến tỷ lệ hit, đây là khái niệm chung cho tất cả cache. Nói đơn giản là trong số dữ liệu bạn muốn truy cập, có bao nhiêu có thể tìm thấy trực tiếp trong cache. Tỷ lệ hit cao thường có nghĩa là thiết kế cache của bạn khá hợp lý và tốc độ xử lý hệ thống cũng tương đối nhanh.
- **Từ góc độ phỏng vấn**: Đặc biệt là tuyển dụng sinh viên mới tốt nghiệp, kiến thức về hệ điều hành được kiểm tra rất rất nhiều.

**Nói đơn giản, học hệ điều hành có thể nâng cao chiều sâu suy nghĩ và khả năng hiểu về công nghệ, và kiến thức về hệ điều hành cũng là bắt buộc trong phỏng vấn.**

## Kiến thức cơ bản về hệ điều hành

![](https://oss.javaguide.cn/2020-8/image-20200807161118901.png)

### Hệ điều hành là gì?

Có thể tóm tắt hệ điều hành là gì qua bốn điểm sau:

1. Hệ điều hành (Operating System, viết tắt là OS) là chương trình quản lý phần cứng và phần mềm máy tính, là nền tảng của máy tính.
2. Hệ điều hành về bản chất là một chương trình phần mềm chạy trên máy tính, chủ yếu dùng để quản lý phần cứng và phần mềm máy tính. Ví dụ: tất cả các ứng dụng chạy trên máy tính của bạn đều gọi bộ nhớ hệ thống và phần cứng như ổ đĩa thông qua hệ điều hành.
3. Hệ điều hành che khuất tính phức tạp của tầng phần cứng. Hệ điều hành giống như người phụ trách sử dụng phần cứng, điều phối các vấn đề liên quan khác nhau.
4. Kernel (nhân) của hệ điều hành là phần cốt lõi của hệ điều hành, nó chịu trách nhiệm quản lý bộ nhớ hệ thống, quản lý thiết bị phần cứng, quản lý hệ thống file và quản lý ứng dụng. Kernel là cầu nối kết nối ứng dụng và phần cứng, quyết định hiệu suất và độ ổn định của hệ thống.

Nhiều người dễ nhầm lẫn giữa Kernel (nhân) của hệ điều hành và CPU (Central Processing Unit - Bộ xử lý trung tâm). Bạn có thể phân biệt đơn giản qua hai điểm sau:

1. Kernel của hệ điều hành thuộc tầng hệ điều hành, trong khi CPU thuộc phần cứng.
2. CPU chủ yếu cung cấp khả năng tính toán, xử lý các loại chỉ thị. Kernel chủ yếu chịu trách nhiệm quản lý hệ thống như quản lý bộ nhớ, nó che khuất các thao tác với phần cứng.

Hình dưới đây minh họa rõ ràng mối quan hệ giữa ứng dụng, kernel và CPU.

![Kernel_Layout](https://oss.javaguide.cn/2020-8/Kernel_Layout.png)

### Hệ điều hành có những chức năng gì?

Từ góc độ quản lý tài nguyên, hệ điều hành có 6 chức năng chính:

1. **Quản lý process và thread**: Tạo, hủy, chặn, đánh thức process, giao tiếp giữa các process, v.v.
2. **Quản lý lưu trữ**: Phân bổ và quản lý bộ nhớ, phân bổ và quản lý bộ nhớ ngoài (ổ đĩa, v.v.), v.v.
3. **Quản lý file**: Đọc, ghi, tạo và xóa file, v.v.
4. **Quản lý thiết bị**: Hoàn thành các yêu cầu hoặc giải phóng thiết bị (thiết bị input/output và thiết bị lưu trữ ngoài, v.v.) cũng như khởi động thiết bị, v.v.
5. **Quản lý mạng**: Hệ điều hành chịu trách nhiệm quản lý việc sử dụng mạng máy tính. Mạng là cách kết nối các máy tính khác nhau trong hệ thống máy tính, hệ điều hành cần quản lý cấu hình, kết nối, giao tiếp và bảo mật của mạng máy tính để cung cấp dịch vụ mạng hiệu quả và đáng tin cậy.
6. **Quản lý bảo mật**: Xác thực danh tính người dùng, kiểm soát truy cập, mã hóa file, v.v. để ngăn người dùng bất hợp pháp truy cập và thao tác tài nguyên hệ thống.

### Các hệ điều hành phổ biến có những gì?

#### Windows

Hệ điều hành desktop cá nhân phổ biến nhất hiện nay, không cần giới thiệu nhiều, mọi người đều biết. Giao diện đơn giản dễ sử dụng, hệ sinh thái phần mềm rất tốt.

_Muốn chơi game máy tính thì vẫn phải có Windows, nên hiện tại tôi dùng một máy Windows để chơi game, một máy Mac để phát triển và học tập hàng ngày._

![windows](./images/windows.png)

#### Unix

Hệ điều hành đa người dùng, đa nhiệm sớm nhất. Linux ra đời sau đã tham khảo Unix ở nhiều khía cạnh.

Hiện nay hệ điều hành này đã dần dần rút lui khỏi sân khấu hệ điều hành.

![unix](./images/unix.png)

#### Linux

**Linux là hệ điều hành dạng Unix miễn phí và mã nguồn mở.** Linux có nhiều phiên bản phân phối khác nhau, nhưng tất cả đều sử dụng **Linux kernel**.

> Nói chính xác, bản thân từ Linux chỉ biểu thị Linux kernel, trong hệ thống GNU/Linux, Linux thực ra chính là Linux kernel, và phần còn lại của hệ thống chủ yếu bao gồm các chương trình được viết và cung cấp bởi dự án GNU. Chỉ riêng Linux kernel không thể trở thành một hệ điều hành hoạt động bình thường.
>
> **Nhiều người có xu hướng dùng thuật ngữ "GNU/Linux" để diễn đạt điều mà mọi người thường gọi là "Linux".**

![Hệ điều hành Linux](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/linux/linux.png)

#### Mac OS

Hệ điều hành riêng của Apple, trải nghiệm lập trình tương đương Linux, nhưng về giao diện, hệ sinh thái phần mềm và trải nghiệm người dùng đều tốt hơn hệ điều hành Linux.

![macos](./images/macos.png)

### Chế độ người dùng (User Mode) và chế độ nhân (Kernel Mode)

#### Chế độ người dùng và chế độ nhân là gì?

Dựa trên đặc điểm truy cập tài nguyên của process, chúng ta có thể chia việc chạy process trên hệ thống thành hai cấp độ:

![Chế độ người dùng và chế độ nhân](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/usermode-and-kernelmode.png)

- **User Mode (Chế độ người dùng)**: Process chạy ở user mode có thể đọc trực tiếp dữ liệu chương trình người dùng, có quyền hạn thấp hơn. Khi ứng dụng cần thực thi một số thao tác đòi hỏi quyền đặc biệt, ví dụ như đọc ghi đĩa, giao tiếp mạng, v.v., cần gửi yêu cầu system call đến hệ điều hành, chuyển sang kernel mode.
- **Kernel Mode (Chế độ nhân)**: Process chạy ở kernel mode gần như có thể truy cập bất kỳ tài nguyên nào của máy tính bao gồm không gian bộ nhớ hệ thống, thiết bị, driver, v.v., không bị giới hạn, có quyền hạn rất cao. Khi hệ điều hành nhận được yêu cầu system call của process, sẽ chuyển từ user mode sang kernel mode, thực thi system call tương ứng và trả kết quả về cho process, cuối cùng chuyển lại từ kernel mode về user mode.

Kernel mode có mức đặc quyền cao hơn user mode, do đó có thể thực thi các thao tác cấp thấp hơn, nhạy cảm hơn. Tuy nhiên, do việc vào kernel mode cần phải trả chi phí khá cao (cần thực hiện một loạt chuyển đổi context và kiểm tra quyền), nên cần giảm thiểu số lần vào kernel mode để cải thiện hiệu suất và độ ổn định của hệ thống.

#### Tại sao cần có user mode và kernel mode? Chỉ có kernel mode không được sao?

Thiết kế như vậy chủ yếu là vì **bảo mật** và **ổn định**.

- Trong tất cả các chỉ thị của CPU, có một số chỉ thị khá nguy hiểm như phân bổ bộ nhớ, thiết lập đồng hồ, xử lý IO, v.v., nếu tất cả các chương trình đều có thể sử dụng những chỉ thị này, sẽ gây ảnh hưởng thảm khốc đến việc vận hành bình thường của hệ thống. Do đó, chúng ta cần giới hạn những chỉ thị nguy hiểm này chỉ có thể chạy ở kernel mode. Những chỉ thị chỉ có thể được thực thi bởi kernel mode hệ điều hành còn được gọi là **chỉ thị đặc quyền**.
- Nếu hệ thống máy tính chỉ có kernel mode, thì tất cả các chương trình hoặc process đều phải chia sẻ tài nguyên hệ thống, ví dụ như bộ nhớ, CPU, ổ đĩa, v.v., điều này sẽ dẫn đến cạnh tranh và xung đột tài nguyên hệ thống, từ đó ảnh hưởng đến hiệu suất và hiệu quả hệ thống. Và, điều này cũng sẽ làm giảm tính bảo mật của hệ thống, bởi vì tất cả các chương trình hoặc process đều có cùng cấp đặc quyền và quyền truy cập.

Do đó, việc đồng thời có user mode và kernel mode chủ yếu là để đảm bảo tính bảo mật, ổn định và hiệu suất của hệ thống máy tính.

#### User mode và kernel mode chuyển đổi như thế nào?

![3 cách chuyển từ user mode sang kernel mode](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/the-way-switch-between-user-mode-and-kernel-mode.drawio.png)

3 cách chuyển từ user mode sang kernel mode:

1. **System call (Trap)**: Đây là cách chủ yếu nhất, do ứng dụng **chủ động** phát khởi. Ví dụ, khi chương trình của chúng ta cần đọc một file hoặc gửi dữ liệu mạng, nó không thể trực tiếp thao tác ổ đĩa hay card mạng, mà phải gọi giao diện được cung cấp bởi hệ điều hành (như `read()`, `send()`), điều này sẽ kích hoạt một lần chuyển đổi từ user mode sang kernel mode.
2. **Interrupt (Ngắt)**: Đây là **thụ động**, được kích hoạt bởi thiết bị phần cứng bên ngoài. Ví dụ, khi ổ đĩa hoàn thành việc đọc dữ liệu, sẽ gửi một tín hiệu ngắt đến CPU, CPU sẽ tạm dừng chương trình ở user mode hiện tại và chuyển sang kernel mode để xử lý ngắt này.
3. **Exception (Ngoại lệ)**: Đây cũng là **thụ động**, do lỗi của chương trình gây ra. Ví dụ, code của chúng ta thực hiện thao tác chia cho không, hoặc truy cập một địa chỉ bộ nhớ không hợp lệ (page fault), CPU sẽ bắt lấy ngoại lệ này và chuyển sang kernel mode để xử lý nó.

Trong cách xử lý của hệ thống, interrupt và exception tương tự nhau, đều tìm kiếm chương trình xử lý tương ứng thông qua interrupt vector table. Sự khác biệt là interrupt đến từ bên ngoài processor, không phải do bất kỳ chỉ thị chuyên dụng nào gây ra, còn exception là kết quả của việc thực thi chỉ thị hiện tại.

Cuối cùng, cần nhấn mạnh rằng **việc chuyển đổi trạng thái này có chi phí hiệu suất**. Vì nó liên quan đến việc lưu context của user mode (registers, v.v.), chuyển sang kernel mode để thực thi, sau đó khôi phục context của user mode. Do đó, trong lập trình hiệu suất cao, chúng ta thường cần xem xét cách giảm số lần chuyển đổi này, ví dụ như thông qua buffered I/O để đọc ghi file theo lô, đây là một ví dụ điển hình.

### System call (Lời gọi hệ thống)

#### System call là gì?

Các chương trình chúng ta chạy về cơ bản đều chạy ở user mode, nếu chúng ta muốn gọi chức năng con ở cấp kernel mode được cung cấp bởi hệ điều hành thì làm thế nào? Đó là khi cần system call!

Tức là trong các chương trình người dùng mà chúng ta chạy, tất cả các thao tác liên quan đến tài nguyên ở cấp kernel mode (như quản lý file, kiểm soát process, quản lý bộ nhớ, v.v.) đều phải gửi yêu cầu dịch vụ đến hệ điều hành thông qua system call và được hệ điều hành thực hiện thay.

![System call](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/system-call.png)

Các system call này có thể phân thành các loại sau đây theo chức năng:

- Quản lý thiết bị: Hoàn thành các yêu cầu hoặc giải phóng thiết bị (thiết bị input/output và thiết bị lưu trữ ngoài, v.v.) cũng như khởi động thiết bị, v.v.
- Quản lý file: Hoàn thành chức năng đọc, ghi, tạo và xóa file, v.v.
- Quản lý process: Chức năng tạo, hủy, chặn, đánh thức process, giao tiếp giữa các process, v.v.
- Quản lý bộ nhớ: Hoàn thành chức năng phân bổ, thu hồi bộ nhớ cũng như lấy kích thước và địa chỉ vùng bộ nhớ mà công việc chiếm dụng, v.v.

System call và gọi hàm thư viện thông thường rất giống nhau, chỉ là system call được cung cấp bởi kernel hệ điều hành, chạy ở kernel mode, còn gọi hàm thư viện thông thường được cung cấp bởi thư viện hàm hoặc người dùng tự cung cấp, chạy ở user mode.

Tóm tắt: System call là một cách để ứng dụng tương tác với hệ điều hành, thông qua system call, ứng dụng có thể truy cập tài nguyên cấp thấp của hệ điều hành như file, thiết bị, mạng, v.v.

#### Bạn có hiểu về quá trình của system call không?

Quá trình của system call có thể đơn giản chia thành các bước sau:

1. Chương trình ở user mode phát khởi system call, vì system call liên quan đến một số chỉ thị đặc quyền (chỉ thị chỉ có thể được thực thi bởi kernel mode hệ điều hành), quyền hạn chương trình user mode không đủ, do đó sẽ ngắt thực thi, tức là Trap (Trap là một loại interrupt).
2. Sau khi xảy ra interrupt, chương trình đang thực thi trên CPU sẽ bị ngắt, nhảy đến chương trình xử lý interrupt. Chương trình kernel bắt đầu thực thi, tức là bắt đầu xử lý system call.
3. Khi xử lý system call hoàn tất, hệ điều hành sử dụng chỉ thị đặc quyền (như `iret`, `sysret` hoặc `eret`) để chuyển lại về user mode, khôi phục context của user mode, tiếp tục thực thi chương trình người dùng.

![Quá trình system call](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/system-call-procedure.png)

## Process và Thread

### Sự khác biệt giữa process và thread là gì?

Process và thread là hai khái niệm cốt lõi trong hệ điều hành về thực thi đồng thời, mối quan hệ của chúng có thể hiểu là mối quan hệ giữa **nhà máy và công nhân**.

**Process (Tiến trình) giống như một nhà máy**. Khi hệ điều hành phân bổ tài nguyên, đơn vị cơ bản là process. Ví dụ, khi tôi khởi động WeChat, hệ điều hành sẽ tạo một nhà máy độc lập cho nó, phân bổ cho nó không gian bộ nhớ riêng, file handle và các tài nguyên khác. Nhà máy này được cô lập hoàn toàn với các nhà máy khác (ví dụ như process trình duyệt tôi đang mở).

**Thread (Luồng) giống như công nhân trong nhà máy**. Một nhà máy có thể có nhiều công nhân, họ chia sẻ tài nguyên của nhà máy này, nhưng mỗi công nhân có hộp công cụ và danh sách nhiệm vụ riêng, cho phép họ thực thi các nhiệm vụ khác nhau một cách độc lập. Ví dụ như nhà máy WeChat có thể có một công nhân (thread) chịu trách nhiệm nhận tin nhắn, một công nhân chịu trách nhiệm hiển thị giao diện.

Đây là hình ảnh tôi vẽ bằng AI, có thể nói là rất trực quan:

![](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/process-and-thread-difference-wechat-factory-as-an-example.png)

Hình dưới là vùng bộ nhớ Java, hãy để tôi nói về mối quan hệ giữa thread và process từ góc độ JVM!

![Vùng dữ liệu runtime Java (sau JDK1.8)](https://oss.javaguide.cn/github/javaguide/java/jvm/java-runtime-data-areas-jdk1.8.png)

Từ hình trên có thể thấy: Một process có thể có nhiều thread, nhiều thread chia sẻ tài nguyên **heap** và **method area (metaspace sau JDK1.8)** của process, nhưng mỗi thread có **program counter**, **virtual machine stack** và **native method stack** riêng.

Dưới đây tóm tắt sự khác biệt cốt lõi giữa thread và process từ 3 góc độ:

1. **Quyền sở hữu tài nguyên:** Process là đơn vị cơ bản của việc phân bổ tài nguyên, có không gian địa chỉ độc lập; còn thread là đơn vị cơ bản của lập lịch CPU, hầu như không sở hữu tài nguyên hệ thống, chỉ giữ lại một ít dữ liệu riêng tư (PC, stack, registers), chủ yếu chia sẻ tài nguyên của process mà nó thuộc về.
2. **Chi phí:** Chi phí tạo hoặc hủy một nhà máy (process) rất lớn, cần phân bổ tài nguyên độc lập. Còn chi phí thuê hoặc sa thải một công nhân (thread) thì nhỏ hơn nhiều. Tương tự, chi phí chuyển đổi context giữa các process lớn hơn nhiều so với chuyển đổi giữa các thread.
3. **Độ bền vững:** Các nhà máy bị cô lập với nhau, một nhà máy đóng cửa (process bị crash) không ảnh hưởng đến các nhà máy khác. Nhưng các công nhân trong cùng một nhà máy chia sẻ tài nguyên, một công nhân thao tác sai (ví dụ một thread truy cập bộ nhớ không hợp lệ) có thể khiến toàn bộ nhà máy ngừng hoạt động (toàn bộ process bị crash).

### Tại sao đã có process rồi còn cần thread?

Lý do cốt lõi là **để thực hiện đồng thời chi phí thấp, hiệu quả cao trong một ứng dụng duy nhất**. Nếu tôi muốn WeChat đồng thời nhận tin nhắn và gửi file, nếu dùng hai process để thực hiện, không chỉ chi phí tài nguyên lớn mà giao tiếp giữa chúng cũng rất phức tạp (cần IPC). Còn dùng hai thread, chi phí chuyển đổi không chỉ thấp mà còn có thể giao tiếp hiệu quả trực tiếp thông qua shared memory, từ đó có thể tận dụng tốt hơn CPU đa nhân, cải thiện tốc độ phản hồi và throughput của ứng dụng.

Lấy ví dụ nhà máy và công nhân ở trên: thread = công nhân nhẹ dưới cùng một mái nhà, chi phí chuyển đổi thấp, giao tiếp shared memory không cần copy; nếu đổi sang hai process độc lập, sẽ phải xây mỗi nhà máy riêng (không gian địa chỉ độc lập), vừa tốn gạch vừa tốn điện (chi phí tài nguyên và IPC).

### Tại sao nên sử dụng đa luồng?

Trước tiên nói từ tổng thể:

- **Từ góc độ cơ bản của máy tính:** Thread có thể được ví như process nhẹ, là đơn vị nhỏ nhất của thực thi chương trình, chi phí chuyển đổi và lập lịch giữa các thread nhỏ hơn nhiều so với process. Ngoài ra, kỷ nguyên CPU đa nhân có nghĩa là nhiều thread có thể chạy đồng thời, điều này giảm chi phí chuyển đổi context thread.
- **Từ xu hướng phát triển internet hiện đại:** Hiện nay các hệ thống yêu cầu concurrency hàng triệu thậm chí chục triệu, và lập trình đa luồng đồng thời chính là nền tảng để phát triển hệ thống high concurrency, tận dụng tốt cơ chế đa luồng có thể cải thiện đáng kể khả năng concurrency tổng thể và hiệu suất của hệ thống.

Đi sâu hơn vào cơ bản của máy tính:

- **Kỷ nguyên đơn nhân**: Trong kỷ nguyên đơn nhân, đa luồng chủ yếu là để cải thiện hiệu quả sử dụng CPU và hệ thống IO của một process. Giả sử chỉ chạy một Java process, khi chúng ta yêu cầu IO, nếu trong Java process chỉ có một thread, thread này bị IO block thì toàn bộ process bị block. CPU và thiết bị IO chỉ có một cái đang chạy, thì có thể nói đơn giản là hiệu quả tổng thể hệ thống chỉ 50%. Khi sử dụng đa luồng, một thread bị IO block, các thread khác vẫn có thể tiếp tục sử dụng CPU. Từ đó cải thiện hiệu quả tổng thể sử dụng tài nguyên hệ thống của Java process.
- **Kỷ nguyên đa nhân**: Trong kỷ nguyên đa nhân, đa luồng chủ yếu là để cải thiện khả năng sử dụng CPU đa nhân của process. Ví dụ: Giả sử chúng ta cần tính toán một tác vụ phức tạp, nếu chỉ dùng một thread, dù hệ thống có bao nhiêu lõi CPU, cũng chỉ có một lõi CPU được sử dụng. Còn tạo nhiều thread, các thread này có thể được ánh xạ lên nhiều CPU cơ bản để thực thi, trong trường hợp các thread trong tác vụ không có resource contention, hiệu quả thực thi tác vụ sẽ được cải thiện đáng kể, xấp xỉ (thời gian thực thi trên đơn nhân / số lõi CPU).

### Các cách đồng bộ hóa giữa các thread là gì?

Đồng bộ hóa thread là thực thi đồng thời của hai hoặc nhiều thread chia sẻ tài nguyên quan trọng. Nên đồng bộ hóa thread để tránh xung đột sử dụng tài nguyên quan trọng.

Dưới đây là một số cách đồng bộ hóa thread thông dụng:

1. **Mutex (Khóa loại trừ lẫn nhau)**: Sử dụng cơ chế đối tượng mutex, chỉ thread sở hữu đối tượng mutex mới có quyền truy cập tài nguyên chung. Vì đối tượng mutex chỉ có một, nên có thể đảm bảo tài nguyên chung không bị nhiều thread truy cập đồng thời. Ví dụ như từ khóa `synchronized` trong Java và các loại `Lock` khác nhau đều là cơ chế này.
2. **Read-Write Lock (Khóa đọc-ghi)**: Cho phép nhiều thread đọc tài nguyên chia sẻ đồng thời, nhưng chỉ một thread có thể thực hiện thao tác ghi lên tài nguyên chia sẻ.
3. **Semaphore (Cờ hiệu)**: Cho phép nhiều thread truy cập cùng một tài nguyên tại cùng một thời điểm, nhưng cần kiểm soát số lượng thread tối đa có thể truy cập tài nguyên này tại cùng một thời điểm.
4. **Barrier (Rào chắn)**: Barrier là một primitive đồng bộ, dùng để chờ nhiều thread đến một điểm nhất định rồi cùng tiếp tục thực thi. Khi một thread đến barrier, nó sẽ dừng thực thi và chờ các thread khác đến barrier, cho đến khi tất cả các thread đã đến barrier, chúng mới cùng tiếp tục thực thi. Ví dụ như `CyclicBarrier` trong Java là cơ chế này.
5. **Event (Sự kiện)** - Wait/Notify: Duy trì đồng bộ đa luồng thông qua thao tác thông báo, còn có thể dễ dàng thực hiện so sánh độ ưu tiên đa luồng.

### PCB là gì? Chứa những thông tin gì?

**PCB (Process Control Block)** tức là khối điều khiển process, là cấu trúc dữ liệu dùng trong hệ điều hành để quản lý và theo dõi process, mỗi process tương ứng với một PCB độc lập. Bạn có thể coi PCB là bộ não của process.

Khi hệ điều hành tạo một process mới, sẽ phân bổ một process ID duy nhất cho process đó và tạo một khối điều khiển process tương ứng. Khi process thực thi, thông tin trong PCB liên tục thay đổi, hệ điều hành dựa vào những thông tin này để quản lý và lập lịch process.

PCB chủ yếu chứa các phần nội dung sau:

- Thông tin mô tả process, bao gồm tên process, định danh, v.v.;
- Thông tin lập lịch process, bao gồm lý do process bị block, trạng thái process (ready, running, blocked, v.v.), mức độ ưu tiên process (xác định mức độ quan trọng của process), v.v.;
- Nhu cầu tài nguyên của process, bao gồm thời gian CPU, không gian bộ nhớ, thiết bị I/O, v.v.
- Thông tin file đã mở bởi process, bao gồm file descriptor, loại file, chế độ mở, v.v.
- Thông tin trạng thái processor (bao gồm nội dung của các loại thanh ghi khác nhau của processor), bao gồm các thanh ghi đa năng, instruction counter, program status word PSW, con trỏ stack người dùng.
- ...

### Process có mấy trạng thái?

Thông thường chúng ta phân process thành khoảng 5 trạng thái, điều này rất giống với thread!

- **Trạng thái tạo (new)**: Process đang được tạo, chưa đến trạng thái ready.
- **Trạng thái sẵn sàng (ready)**: Process đã ở trạng thái sẵn sàng chạy, tức là process đã có được tất cả tài nguyên cần thiết ngoại trừ processor, một khi nhận được tài nguyên processor (time slice được processor phân bổ) là có thể chạy.
- **Trạng thái chạy (running)**: Process đang chạy trên processor (tại bất kỳ thời điểm nào dưới CPU đơn nhân chỉ có một process ở trạng thái running).
- **Trạng thái block (waiting)**: Còn được gọi là trạng thái chờ, process đang chờ một sự kiện nào đó mà tạm dừng chạy như chờ tài nguyên nào đó có sẵn hoặc chờ thao tác IO hoàn thành. Ngay cả khi processor rảnh, process này cũng không thể chạy.
- **Trạng thái kết thúc (terminated)**: Process đang biến mất khỏi hệ thống. Có thể là process kết thúc bình thường hoặc bị ngắt thoát chạy vì lý do khác.

![Sơ đồ chuyển đổi trạng thái process](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/state-transition-of-process.png)

### Các cách giao tiếp giữa các process là gì?

> Phần tổng hợp dưới đây tham khảo bài viết: [《IPC - Giao tiếp giữa các process (InterProcess Communication)》](https://www.jianshu.com/p/c1015f5ffa74), khuyến nghị đọc, tóm tắt rất hay.

1. **Pipe/Anonymous Pipe (Ống/Ống vô danh)**: Dùng cho giao tiếp giữa các process cha-con hoặc anh-em có quan hệ thân tộc.
2. **Named Pipe (Ống có tên)**: Ống vô danh do không có tên nên chỉ có thể dùng cho giao tiếp giữa các process có quan hệ thân tộc. Để khắc phục hạn chế này, người ta đề xuất ống có tên. Ống có tên tuân theo nghiêm ngặt nguyên tắc **FIFO (First In First Out)**. Ống có tên tồn tại dưới dạng file đĩa, có thể thực hiện giao tiếp giữa bất kỳ hai process nào trên cùng máy.
3. **Signal (Tín hiệu)**: Tín hiệu là cách giao tiếp tương đối phức tạp, dùng để thông báo cho process nhận biết rằng một sự kiện nào đó đã xảy ra;
4. **Message Queue (Hàng đợi tin nhắn)**: Hàng đợi tin nhắn là danh sách liên kết các tin nhắn, có định dạng cụ thể, được lưu trong bộ nhớ và được xác định bởi định danh hàng đợi tin nhắn. Dữ liệu giao tiếp của pipe và message queue đều theo nguyên tắc FIFO. Khác với pipe (ống vô danh: chỉ tồn tại trong file bộ nhớ; ống có tên: tồn tại trong phương tiện đĩa thực tế hoặc hệ thống file), message queue được lưu trong kernel, chỉ khi kernel khởi động lại (tức là hệ điều hành khởi động lại) hoặc khi xóa rõ ràng một message queue, message queue đó mới thực sự bị xóa. Message queue có thể thực hiện truy vấn tin nhắn ngẫu nhiên, tin nhắn không nhất thiết phải được đọc theo thứ tự FIFO, cũng có thể đọc theo loại tin nhắn. Ưu thế hơn FIFO. Message queue khắc phục những nhược điểm của signal là tải thông tin ít, pipe chỉ có thể tải byte stream không định dạng và kích thước bộ đệm bị giới hạn.
5. **Semaphore (Cờ hiệu)**: Cờ hiệu là một bộ đếm, dùng để truy cập dữ liệu chia sẻ của nhiều process, mục đích của cờ hiệu là đồng bộ hóa giữa các process. Cách giao tiếp này chủ yếu dùng để giải quyết các vấn đề liên quan đến đồng bộ và tránh race condition.
6. **Shared Memory (Bộ nhớ chia sẻ)**: Cho phép nhiều process truy cập cùng một khối bộ nhớ, các process khác nhau có thể nhìn thấy kịp thời các cập nhật đối với dữ liệu trong bộ nhớ chia sẻ của nhau. Cách này cần dựa vào một số thao tác đồng bộ như mutex và semaphore. Có thể nói đây là cách giao tiếp giữa các process hữu ích nhất.
7. **Socket (Cổng giao tiếp)**: Phương pháp này chủ yếu được sử dụng để giao tiếp qua mạng giữa client và server. Socket là đơn vị thao tác cơ bản của giao tiếp mạng hỗ trợ TCP/IP, có thể coi là endpoint để các process trên các máy chủ khác nhau thực hiện giao tiếp hai chiều, nói đơn giản là một thỏa thuận của hai bên giao tiếp, sử dụng các hàm liên quan trong socket để hoàn thành quá trình giao tiếp.

### Các thuật toán lập lịch process là gì?

![Các thuật toán lập lịch process thường gặp](https://oss.javaguide.cn/github/javaguide/cs-basics/network/scheduling-algorithms-of-process.png)

Mục tiêu cốt lõi của thuật toán lập lịch process là quyết định process nào trong ready queue sẽ nhận được tài nguyên CPU, mục tiêu thiết kế thường là đánh đổi giữa **throughput, turnaround time, response time** và **fairness**.

Tôi thường phân loại các thuật toán này thành hai loại chính: **Non-preemptive (Không có quyền ưu tiên)** và **Preemptive (Có quyền ưu tiên)**.

**Loại 1: Non-preemptive Scheduling (Lập lịch không có quyền ưu tiên)**

Theo cách này, một khi CPU được phân bổ cho một process, nó sẽ tiếp tục chạy cho đến khi hoàn thành tác vụ hoặc chủ động từ bỏ (ví dụ như chờ I/O).

1. **FCFS (First Come, First Served - Đến trước, phục vụ trước)**: Đây là đơn giản nhất, giống như xếp hàng, ai đến trước thì dùng trước. Ưu điểm là công bằng, dễ thực hiện. Nhưng nhược điểm rõ ràng, nếu một tác vụ rất dài đến trước, vô số tác vụ ngắn phía sau đều phải chờ, điều này sẽ dẫn đến thời gian chờ trung bình rất dài, chúng ta gọi đây là "convoy effect - hiệu ứng đoàn hộ tống".
2. **SJF (Shortest Job First - Tác vụ ngắn nhất trước)**: Chọn ra process có thời gian chạy ước tính ngắn nhất từ ready queue để phân bổ tài nguyên. Về lý thuyết, thời gian chờ trung bình của nó là ngắn nhất, throughput rất cao. Nhưng nhược điểm là cần dự đoán thời gian chạy, điều này rất khó thực hiện, và có thể dẫn đến tác vụ dài bị "chết đói", không bao giờ được thực thi.

**Loại 2: Preemptive Scheduling (Lập lịch có quyền ưu tiên)**

Hệ điều hành có thể buộc tước quyền sử dụng CPU của process hiện tại và phân bổ cho process quan trọng hơn. Hệ điều hành hiện đại về cơ bản đều sử dụng cách này.

- **RR (Round-Robin - Luân chuyển thời gian)**: Đây là thuật toán preemptive kinh điển và công bằng nhất. Nó phân bổ cho mỗi process một time slice cố định, hết rồi đặt nó vào cuối hàng đợi, chuyển sang process tiếp theo. Nó rất phù hợp với hệ thống chia sẻ thời gian, đảm bảo mỗi process đều được phản hồi, nhưng việc thiết lập time slice rất quan trọng: quá dài sẽ thoái hóa thành FCFS, quá ngắn sẽ dẫn đến chuyển đổi context quá thường xuyên, tăng overhead hệ thống.
- **Priority Scheduling (Lập lịch theo độ ưu tiên)**: Mỗi process có một độ ưu tiên, bộ lập lịch process luôn chọn process có độ ưu tiên cao nhất, các process có cùng độ ưu tiên thực thi theo cách FCFS. Điều này rất linh hoạt, có thể xác định độ ưu tiên dựa trên yêu cầu bộ nhớ, yêu cầu thời gian hoặc bất kỳ yêu cầu tài nguyên nào khác, nhưng cũng có thể dẫn đến process ưu tiên thấp bị "chết đói".

Các thuật toán lập lịch process được giới thiệu trước đây đều có một số hạn chế nhất định, ví dụ: **thuật toán lập lịch ưu tiên process ngắn, chỉ quan tâm đến process ngắn mà bỏ qua process dài**. Vậy có thuật toán nào kết hợp được ưu điểm của các thuật toán lập lịch process này không?

**MFQ (Multi-level Feedback Queue - Hàng đợi nhiều cấp phản hồi)** là thuật toán phổ biến nhất trong thực tế, ví dụ như UNIX ban đầu. Nó rất thông minh, kết hợp RR và lập lịch theo độ ưu tiên. Nó thiết lập nhiều hàng đợi với các mức độ ưu tiên khác nhau, mỗi hàng đợi sử dụng lập lịch RR với kích thước time slice khác nhau. Process mới vào hàng đợi ưu tiên cao nhất; nếu không hoàn thành trong một time slice, sẽ bị hạ cấp xuống hàng đợi tiếp theo. Điều này vừa quan tâm đến tác vụ ngắn (hoàn thành nhanh trong hàng đợi ưu tiên cao), vừa đảm bảo tác vụ dài không bị chết đói (cuối cùng sẽ được thực thi trong hàng đợi ưu tiên thấp), là một phương án rất cân bằng.

### Vậy chính xác là ai lập lịch cho process?

Cốt lõi chịu trách nhiệm lập lịch process là hai thành phần phối hợp chặt chẽ trong kernel hệ điều hành: **Scheduler (Bộ lập lịch)** và **Dispatcher (Bộ phân phối)**. Chúng ta có thể hiểu chúng như một đội:

- **Scheduler (Bộ lập lịch):** Có thể coi là người ra quyết định. Khi cần lập lịch, bộ lập lịch sẽ được kích hoạt, nó sẽ dựa vào thuật toán lập lịch được thiết lập sẵn (như multi-level feedback queue chúng ta đã bàn trước đó), chọn ra process tiếp theo sẽ chiếm CPU từ ready queue.
- **Dispatcher (Bộ phân phối):** Có thể coi là người thực thi. Nó chịu trách nhiệm hoàn thành công việc "bàn giao" cụ thể, tức là **context switching**. Quá trình này rất cấp thấp, chủ yếu bao gồm:
  - Lưu context của process hiện tại (trạng thái CPU register, program counter, v.v.) vào PCB của nó.
  - Tải context của process được chọn tiếp theo, đọc trạng thái từ PCB của nó, khôi phục vào CPU register.
  - Chính thức chuyển quyền kiểm soát CPU cho process mới, để nó bắt đầu chạy.

## Deadlock (Tắc nghẽn)

### Deadlock là gì?

Deadlock mô tả tình huống như sau: nhiều process/thread đồng thời bị block, một hoặc tất cả trong số chúng đều đang chờ một tài nguyên nào đó được giải phóng. Do process/thread bị block vô thời hạn, chương trình không thể kết thúc bình thường.

Một ví dụ kinh điển nhất là **"cross-lock - khóa chéo"**. Hãy tưởng tượng có hai thread và hai lock:

- Thread 1 đã lấy được lock A, sau đó cố gắng lấy lock B.
- Gần như đồng thời, Thread 2 đã lấy được lock B, sau đó cố gắng lấy lock A.

Lúc này, Thread 1 chờ Thread 2 giải phóng lock B, còn Thread 2 chờ Thread 1 giải phóng lock A, hai bên đều giữ tài nguyên mà đối phương cần và chờ đối phương giải phóng, tạo thành một "nút thắt".

<img src="https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/deadlock-two-threads-waiting-for-each-other-to-release-lock.png" style="zoom: 50%;" />

### Bốn điều kiện cần thiết để xảy ra deadlock là gì?

Sự xuất hiện của deadlock không phải ngẫu nhiên, nó cần đồng thời thỏa mãn **bốn điều kiện cần thiết**:

1. **Mutual Exclusion (Loại trừ lẫn nhau)**: Tài nguyên phải ở chế độ không chia sẻ, tức là mỗi lần chỉ có một process có thể sử dụng. Nếu process khác yêu cầu tài nguyên đó, phải chờ cho đến khi tài nguyên đó được giải phóng.
2. **Hold and Wait (Giữ và chờ)**: Một process phải giữ ít nhất một tài nguyên và chờ một tài nguyên khác, trong khi tài nguyên đó đang được process khác giữ.
3. **No Preemption (Không có quyền ưu tiên)**: Tài nguyên không thể bị tước đoạt. Tài nguyên chỉ được giải phóng sau khi process giữ tài nguyên hoàn thành tác vụ.
4. **Circular Wait (Chờ vòng tròn)**: Có một nhóm các process chờ đợi {P0, P1,..., Pn}, P0 chờ tài nguyên do P1 giữ, P1 chờ tài nguyên do P2 giữ, ..., Pn-1 chờ tài nguyên do Pn giữ, Pn chờ tài nguyên do P0 giữ.

**Lưu ý**: Bốn điều kiện này là **điều kiện cần thiết** để xảy ra deadlock, tức là miễn là hệ thống xảy ra deadlock, các điều kiện này nhất định phải được thỏa mãn, và chỉ cần một trong các điều kiện trên không được thỏa mãn, deadlock sẽ không xảy ra.

Dưới đây là giải thích về điều kiện cần thiết từ Baidu Baike:

> Nếu không có sự kiện A thì chắc chắn không có sự kiện B, tức là nếu có sự kiện B thì nhất định có sự kiện A, thì A là điều kiện cần thiết của B. Từ góc độ logic học, B có thể suy ra A, A là điều kiện cần thiết của B, tương đương với B là điều kiện đủ của A.

### Bạn có thể viết code mô phỏng deadlock không?

Dưới đây mô phỏng deadlock thread được biểu thị trong hình qua một ví dụ thực tế:

![Sơ đồ minh họa deadlock thread](https://oss.javaguide.cn/github/javaguide/java/2019-4%E6%AD%BB%E9%94%811-20230814005444749.png)

```java
public class DeadLockDemo {
    private static Object resource1 = new Object();//资源 1
    private static Object resource2 = new Object();//资源 2

    public static void main(String[] args) {
        new Thread(() -> {
            synchronized (resource1) {
                System.out.println(Thread.currentThread() + "get resource1");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread() + "waiting get resource2");
                synchronized (resource2) {
                    System.out.println(Thread.currentThread() + "get resource2");
                }
            }
        }, "线程 1").start();

        new Thread(() -> {
            synchronized (resource2) {
                System.out.println(Thread.currentThread() + "get resource2");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread() + "waiting get resource1");
                synchronized (resource1) {
                    System.out.println(Thread.currentThread() + "get resource1");
                }
            }
        }, "线程 2").start();
    }
}
```

Output

```text
Thread[线程 1,5,main]get resource1
Thread[线程 2,5,main]get resource2
Thread[线程 1,5,main]waiting get resource2
Thread[线程 2,5,main]waiting get resource1
```

Thread A lấy được monitor lock của `resource1` thông qua `synchronized (resource1)`, sau đó cho Thread A nghỉ 1s thông qua `Thread.sleep(1000)` để Thread B có thể thực thi và lấy được monitor lock của `resource2`. Thread A và Thread B sau khi hết thời gian nghỉ đều bắt đầu cố gắng yêu cầu tài nguyên của đối phương, sau đó hai thread này sẽ rơi vào trạng thái chờ nhau, đây cũng chính là deadlock.

### Phương pháp giải quyết deadlock

Các phương pháp giải quyết deadlock có thể được phân tích từ nhiều góc độ, thông thường có **bốn phương pháp: phòng ngừa, tránh, phát hiện và giải trừ**.

- **Phòng ngừa deadlock (Deadlock Prevention):** Đây là phương pháp thường được lập trình viên sử dụng nhất. Phá vỡ điều kiện thông qua quy ước viết code. Kinh điển nhất là **phá vỡ circular wait**, ví dụ quy định tất cả các thread đều phải **theo cùng một thứ tự** để lấy lock (ví dụ trước A rồi mới B), như vậy sẽ không hình thành vòng tròn.
- **Tránh deadlock (Deadlock Avoidance):** Đây là phương pháp động hơn, ví dụ như **thuật toán Banker** của hệ điều hành. Nó sẽ dự đoán trước khi phân bổ tài nguyên, nếu lần phân bổ này có thể gây ra deadlock trong tương lai, thì từ chối phân bổ. Nhưng phương pháp này có overhead rất lớn, ít được sử dụng trong hệ thống đa năng.
- **Phát hiện và giải trừ deadlock (Deadlock Detection and Recovery):** Đây là chiến lược "sửa chữa sau sự cố", giống như optimistic lock. Hệ thống cho phép deadlock xảy ra, nhưng sẽ có một background thread (hoặc cơ chế) định kỳ phát hiện xem có tồn tại vòng deadlock không (ví dụ bằng cách phân tích thread wait graph). Khi phát hiện, sẽ thực hiện biện pháp giải trừ, ví dụ **buộc tước đoạt tài nguyên của một thread nào đó hoặc trực tiếp kết thúc nó**. Xử lý deadlock trong hệ thống cơ sở dữ liệu thường sử dụng cách này.

#### Phòng ngừa deadlock

Bốn điều kiện cần thiết của deadlock đã được liệt kê ở trên, rõ ràng là chỉ cần phá vỡ bất kỳ một trong bốn điều kiện cần thiết là có thể phòng ngừa deadlock xảy ra.

Phá vỡ điều kiện thứ nhất **Mutual Exclusion**: Làm cho tài nguyên có thể được truy cập đồng thời, đây là phương pháp đơn giản, ổ đĩa có thể được quản lý theo phương pháp này, nhưng chúng ta biết rằng có nhiều tài nguyên **thường không thể được truy cập đồng thời**, vì vậy cách làm này không khả thi trong hầu hết các trường hợp.

Phá vỡ điều kiện thứ ba **No Preemption**: Tức là có thể sử dụng **thuật toán lập lịch có quyền tước đoạt**, nhưng phương pháp lập lịch có quyền tước đoạt hiện tại thường chỉ áp dụng cho phân bổ **tài nguyên bộ nhớ chính** và **tài nguyên processor**, không phù hợp với tất cả tài nguyên, sẽ dẫn đến **tỷ lệ sử dụng tài nguyên giảm**.

Vì vậy, **phương pháp phòng ngừa deadlock** thực tế hơn thường là xem xét phá vỡ điều kiện thứ hai và thứ tư.

**1. Chiến lược phân bổ tĩnh**

Chiến lược phân bổ tĩnh có thể phá vỡ điều kiện thứ hai của deadlock (giữ và chờ). Chiến lược phân bổ tĩnh là một process phải yêu cầu tất cả tài nguyên cần thiết trước khi thực thi và chỉ bắt đầu thực thi sau khi biết rằng tất cả tài nguyên cần thiết đều được thỏa mãn. Process hoặc giữ tất cả tài nguyên rồi bắt đầu thực thi, hoặc không giữ tài nguyên, sẽ không xảy ra tình huống giữ một số tài nguyên và chờ một số tài nguyên khác.

Chiến lược phân bổ tĩnh logic đơn giản, thực hiện cũng dễ dàng, nhưng chiến lược này **giảm nghiêm trọng tỷ lệ sử dụng tài nguyên**, vì trong các tài nguyên mà mỗi process giữ, có một số tài nguyên được sử dụng ở thời điểm thực thi tương đối muộn, thậm chí có một số tài nguyên chỉ được sử dụng trong các trường hợp đặc biệt, điều này có thể gây ra tình huống **một process giữ một số tài nguyên hầu như không dùng khiến các process khác cần tài nguyên đó phải chờ**.

**2. Chiến lược phân bổ theo cấp bậc**

Chiến lược phân bổ theo cấp bậc phá vỡ điều kiện thứ tư (circular wait). Trong chiến lược phân bổ theo cấp bậc, tất cả tài nguyên được phân thành nhiều cấp bậc, sau khi một process lấy được một tài nguyên ở một cấp bậc nào đó, nó chỉ có thể yêu cầu tài nguyên ở cấp bậc cao hơn; khi một process muốn giải phóng một tài nguyên ở một cấp bậc nào đó, phải trước tiên giải phóng tài nguyên ở cấp bậc cao hơn mà mình đang giữ, theo chiến lược này, không thể xảy ra chuỗi chờ vòng tròn, vì như vậy sẽ xuất hiện tình huống đã yêu cầu tài nguyên ở cấp bậc cao hơn nhưng lại đi yêu cầu tài nguyên ở cấp bậc thấp hơn, vi phạm chiến lược phân bổ theo cấp bậc, bằng chứng bỏ qua.

#### Tránh deadlock

Ở trên đã đề cập đến việc **phá vỡ** một trong bốn điều kiện cần thiết để xảy ra deadlock là có thể **phòng ngừa** thành công hệ thống xảy ra deadlock, nhưng sẽ dẫn đến **hiệu suất thực thi process thấp** và **tỷ lệ sử dụng tài nguyên thấp**. Còn tránh deadlock thì ngược lại, góc nhìn của nó là cho phép đồng thời tồn tại bốn điều kiện cần thiết trong hệ thống, chỉ cần nắm vững tình huống yêu cầu tài nguyên động liên quan đến mỗi process trong các process đồng thời, đưa ra **lựa chọn thông minh và hợp lý**, vẫn có thể tránh deadlock, vì bốn điều kiện đó chỉ là điều kiện cần thiết để xảy ra deadlock.

Chúng ta phân loại trạng thái hệ thống thành **trạng thái an toàn** và **trạng thái không an toàn**, mỗi khi trước khi phân bổ tài nguyên cho người yêu cầu đều kiểm tra trạng thái hệ thống trước, nếu phân bổ tài nguyên hệ thống cho người yêu cầu sẽ gây ra deadlock, thì từ chối phân bổ, nếu không thì chấp nhận yêu cầu và phân bổ tài nguyên cho nó.

> Nếu hệ điều hành có thể đảm bảo tất cả process nhận được tất cả tài nguyên cần thiết trong thời gian hữu hạn, thì hệ thống được gọi là ở trạng thái an toàn, nếu không thì hệ thống không an toàn. Rõ ràng, nếu hệ thống ở trạng thái an toàn thì không xảy ra deadlock, nếu hệ thống ở trạng thái không an toàn thì có thể xảy ra deadlock.

Vậy làm thế nào để đảm bảo hệ thống ở trạng thái an toàn? Thông qua thuật toán, trong đó **thuật toán tránh deadlock** đại diện nhất là thuật toán Banker của Dijkstra, thuật toán Banker nói tóm lại trong một câu: Khi một process yêu cầu sử dụng tài nguyên, **thuật toán Banker** trước tiên **thử** phân bổ tài nguyên cho process đó, sau đó thông qua **thuật toán safety** để phán đoán xem sau khi phân bổ hệ thống có ở trạng thái an toàn không, nếu không an toàn thì hủy phân bổ thử, để process tiếp tục chờ, nếu có thể vào trạng thái an toàn, thì **thực sự phân bổ tài nguyên cho process đó**.

Chi tiết thuật toán Banker có thể xem: [《Nói rõ thuật toán Banker trong một câu + một hình》](https://blog.csdn.net/qq_33414271/article/details/80245715).

Sách giáo khoa về hệ điều hành trình bày thuật toán Banker cũng khá rõ ràng, có thể tham khảo.

Tránh deadlock (thuật toán Banker) cải thiện **vấn đề tỷ lệ sử dụng tài nguyên thấp**, nhưng nó phải liên tục phát hiện tình trạng chiếm dụng và yêu cầu tài nguyên của mỗi loại tài nguyên của mỗi process, cũng như thực hiện **kiểm tra safety**, cần mất khá nhiều thời gian.

#### Phát hiện deadlock

Thêm hạn chế vào việc phân bổ tài nguyên có thể **phòng ngừa và tránh** sự xuất hiện của deadlock, nhưng đều không có lợi cho việc **chia sẻ đầy đủ** tài nguyên hệ thống của mỗi process. Một con đường khác để giải quyết vấn đề deadlock là **phát hiện và giải trừ deadlock** (ở đây bỗng liên tưởng đến optimistic lock và pessimistic lock, cảm thấy phát hiện và giải trừ deadlock giống như **optimistic lock**, khi phân bổ tài nguyên không lo trước có sẽ xảy ra deadlock không, đợi đến khi deadlock thực sự xuất hiện mới giải quyết, còn **phòng ngừa và tránh deadlock** giống như pessimistic lock hơn, luôn lo deadlock sẽ xuất hiện, vì vậy khi phân bổ tài nguyên thì rất thận trọng).

Phương pháp này không áp đặt bất kỳ hạn chế nào lên việc phân bổ tài nguyên, cũng không thực hiện biện pháp tránh deadlock, nhưng hệ thống **định kỳ chạy một chương trình "phát hiện deadlock"**, phán đoán xem hệ thống có xảy ra deadlock không, nếu phát hiện hệ thống xảy ra deadlock, mới thực hiện biện pháp giải trừ.

##### Đồ thị phân bổ tài nguyên process

Mỗi khoảnh khắc trong hệ điều hành **trạng thái hệ thống** đều có thể được biểu thị bằng **đồ thị phân bổ tài nguyên process**, đồ thị phân bổ tài nguyên process là một đồ thị có hướng mô tả mối quan hệ yêu cầu và phân bổ tài nguyên của process và tài nguyên, có thể được dùng để **phát hiện xem hệ thống có ở trạng thái deadlock không**.

Dùng một hộp chữ nhật biểu thị mỗi loại tài nguyên, các chấm đen trong hộp biểu thị các tài nguyên trong loại tài nguyên đó, dùng một vòng tròn biểu thị mỗi process, dùng **cạnh có hướng** để biểu thị **tình huống process yêu cầu tài nguyên và tài nguyên được phân bổ**.

Hình 2-21 là một ví dụ về **đồ thị phân bổ tài nguyên process**, trong đó có ba loại tài nguyên, tình trạng chiếm dụng và yêu cầu tài nguyên của mỗi process đã được thể hiện rõ ràng trong đồ thị. Trong ví dụ này, do tồn tại **vòng tròn chiếm dụng và chờ tài nguyên**, dẫn đến một nhóm process mãi mãi ở trạng thái chờ tài nguyên, xảy ra **deadlock**.

![Đồ thị phân bổ tài nguyên process](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/process-resource-allocation-diagram.jpg)

Sự tồn tại của vòng tròn trong đồ thị phân bổ tài nguyên process không nhất thiết là deadlock đã xảy ra. Vì chờ vòng tròn tài nguyên chỉ là điều kiện cần thiết của deadlock xảy ra, chứ không phải điều kiện đủ. Hình 2-22 là một ví dụ có vòng tròn nhưng không có deadlock. Mặc dù process P1 và process P3 lần lượt chiếm dụng một tài nguyên R1 và một tài nguyên R2, và do chờ một tài nguyên R2 và một tài nguyên R1 khác đã hình thành vòng tròn, nhưng process P2 và process P4 lần lượt đã chiếm được một tài nguyên R1 và một tài nguyên R2, yêu cầu tài nguyên của chúng đã được thỏa mãn, trong thời gian hữu hạn sẽ trả lại tài nguyên, sau đó P1 hoặc P3 đều có thể lấy được tài nguyên cần thiết khác, vòng tròn tự động biến mất, hệ thống cũng không ở trạng thái deadlock.

##### Các bước phát hiện deadlock

Biết nguyên lý phát hiện deadlock, chúng ta có thể viết một chương trình **phát hiện deadlock** sử dụng các bước sau, phát hiện xem hệ thống có xảy ra deadlock không.

1. Nếu trong đồ thị phân bổ tài nguyên process không có vòng tròn, thì lúc này hệ thống không xảy ra deadlock
2. Nếu trong đồ thị phân bổ tài nguyên process có vòng tròn và mỗi loại tài nguyên chỉ có một tài nguyên, thì hệ thống đã xảy ra deadlock.
3. Nếu trong đồ thị phân bổ tài nguyên process có vòng tròn và các loại tài nguyên liên quan có nhiều tài nguyên, lúc này hệ thống chưa chắc sẽ xảy ra deadlock. Nếu trong đồ thị phân bổ tài nguyên process có thể tìm được một process **vừa không bị block vừa không độc lập**, process đó có thể trả lại tài nguyên đang giữ trong thời gian hữu hạn, tức là loại bỏ các cạnh đi, lặp lại quá trình này, cho đến khi có thể **loại bỏ tất cả các cạnh** trong thời gian hữu hạn, thì sẽ không xảy ra deadlock, nếu không sẽ xảy ra deadlock. (Quá trình loại bỏ cạnh tương tự như **topological sort**)

#### Giải trừ deadlock

Khi chương trình phát hiện deadlock phát hiện có deadlock xảy ra, cần tìm cách giải trừ nó, để hệ thống phục hồi từ trạng thái deadlock, các phương pháp giải trừ deadlock thường dùng có bốn loại sau:

1. **Kết thúc ngay lập tức tất cả process đang thực thi, khởi động lại hệ điều hành**: Phương pháp này đơn giản, nhưng toàn bộ công việc trước đó đều bị mất, thiệt hại rất lớn.
2. **Hủy tất cả các process liên quan đến deadlock, giải trừ deadlock rồi tiếp tục chạy**: Phương pháp này có thể triệt để phá vỡ **điều kiện circular wait của deadlock**, nhưng sẽ trả giá rất lớn, ví dụ có một số process có thể đã tính toán trong thời gian dài, do bị hủy mà một phần kết quả đã tạo ra cũng bị xóa, khi thực thi lại còn phải tính toán lại.
3. **Lần lượt hủy các process liên quan đến deadlock, thu hồi tài nguyên của chúng cho đến khi deadlock được giải trừ.**
4. **Tước đoạt tài nguyên**: Tước đoạt tài nguyên từ một hoặc vài process liên quan đến deadlock, phân bổ lại tài nguyên đã tước đoạt cho các process liên quan đến deadlock cho đến khi deadlock được giải trừ.

## Tham khảo

- 《Hệ điều hành máy tính - Tang Xiaodan》 ấn bản thứ tư
- 《Computer Systems: A Programmer's Perspective》
- 《Học lại hệ điều hành》
- Tại sao hệ điều hành cần phân biệt user mode và kernel mode: <https://blog.csdn.net/chen134225/article/details/81783980>
- Hiểu user mode và kernel mode từ gốc rễ: <https://juejin.cn/post/6923863670132850701>
- Zombie process và orphan process là gì: <https://blog.csdn.net/a745233700/article/details/120715371>

<!-- @include: @article-footer.snippet.md -->
