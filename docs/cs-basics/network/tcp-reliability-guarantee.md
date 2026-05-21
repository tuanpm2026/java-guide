---
title: Đảm bảo độ tin cậy truyền tải TCP（Tầng vận chuyển）
description: Hệ thống hóa các cơ chế đảm bảo độ tin cậy của TCP, bao gồm retransmit/SACK, kiểm soát luồng và kiểm soát tắc nghẽn, làm rõ các điểm cốt lõi để triển khai truyền tải đáng tin cậy end-to-end.
category: Kiến thức cơ bản máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: TCP,độ tin cậy,retransmit,SACK,kiểm soát luồng,kiểm soát tắc nghẽn,sliding window,checksum
---

## TCP đảm bảo độ tin cậy truyền tải như thế nào?

1. **Truyền theo khối dữ liệu**: Dữ liệu ứng dụng được chia thành các khối mà TCP cho là phù hợp nhất để gửi, rồi truyền cho tầng mạng. Các khối dữ liệu này gọi là segment.
2. **Sắp xếp lại và loại bỏ trùng lặp các gói tin không đúng thứ tự**: Để đảm bảo không bị mất gói, TCP gán cho mỗi gói một số thứ tự (sequence number). Nhờ số thứ tự, dữ liệu nhận được có thể được sắp xếp theo thứ tự và loại bỏ dữ liệu trùng lặp sequence number.
3. **Checksum**: TCP duy trì checksum của header và dữ liệu. Đây là checksum end-to-end, mục đích là phát hiện bất kỳ thay đổi nào trong quá trình truyền dữ liệu. Nếu checksum của segment nhận được có lỗi, TCP sẽ loại bỏ segment đó và không xác nhận.
4. **Cơ chế retransmit**: Trong trường hợp gói tin bị mất hoặc trễ, gửi lại gói tin cho đến khi nhận được xác nhận (ACK) từ đối phương. Các cơ chế retransmit TCP chủ yếu bao gồm: retransmit dựa trên timer (timeout retransmit), fast retransmit (kích hoạt retransmit dựa trên phản hồi từ receiver), SACK (trên cơ sở fast retransmit, trả về phạm vi sequence number của segment nhận được gần nhất, giúp client biết gói nào đã đến server), D-SACK (Duplicate SACK, trên cơ sở SACK, mang thêm thông tin cho sender biết gói nào được receiver nhận trùng lặp). Xem bài [Giải thích chi tiết cơ chế timeout và retransmit TCP](https://zhuanlan.zhihu.com/p/101702312) để tìm hiểu chi tiết.
5. **Kiểm soát luồng (Flow Control)**: Mỗi bên của kết nối TCP có không gian buffer cố định, phía receiver của TCP chỉ cho phép phía sender gửi dữ liệu mà receiver buffer có thể chứa. Khi receiver không kịp xử lý dữ liệu của sender, có thể nhắc sender giảm tốc độ gửi, tránh mất gói. Giao thức kiểm soát luồng TCP sử dụng là giao thức sliding window kích thước thay đổi (TCP sử dụng sliding window để thực hiện kiểm soát luồng).
6. **Kiểm soát tắc nghẽn (Congestion Control)**: Giảm lượng dữ liệu gửi khi mạng tắc nghẽn. Khi gửi dữ liệu, TCP cần xem xét hai yếu tố: một là khả năng nhận của receiver, hai là mức độ tắc nghẽn mạng. Khả năng nhận của receiver được biểu diễn bằng sliding window, cho biết receiver còn bao nhiêu buffer để nhận dữ liệu. Mức độ tắc nghẽn mạng được biểu diễn bằng congestion window, là giá trị sender tự duy trì dựa trên tình trạng mạng, biểu diễn lượng dữ liệu sender cho rằng có thể truyền trên mạng. Kích thước dữ liệu sender gửi là giá trị nhỏ hơn giữa sliding window và congestion window, đảm bảo sender không vượt quá khả năng nhận của receiver và không gây tắc nghẽn mạng quá mức.

## TCP thực hiện kiểm soát luồng như thế nào?

**TCP sử dụng sliding window để thực hiện kiểm soát luồng. Kiểm soát luồng nhằm kiểm soát tốc độ gửi của sender, đảm bảo receiver kịp nhận.** Trường window trong segment xác nhận do receiver gửi có thể dùng để kiểm soát kích thước cửa sổ sender, từ đó ảnh hưởng đến tốc độ gửi của sender. Đặt trường window về 0 thì sender không thể gửi dữ liệu.

**Tại sao cần kiểm soát luồng?** Vì trong quá trình giao tiếp, tốc độ gửi của sender và tốc độ nhận của receiver không nhất thiết bằng nhau. Nếu tốc độ gửi của sender quá nhanh, receiver sẽ không kịp xử lý. Nếu receiver không kịp xử lý, chỉ có thể lưu dữ liệu chưa kịp xử lý vào **Receiving Buffers** (dữ liệu không theo thứ tự cũng được lưu trong buffer). Nếu buffer đầy mà sender vẫn tiếp tục gửi điên cuồng, receiver chỉ có thể vứt bỏ các gói tin nhận được. Vừa xảy ra vấn đề mất gói vừa lãng phí tài nguyên mạng quý báu. Do đó cần kiểm soát tốc độ gửi của sender để sender và receiver ở trạng thái cân bằng động.

Cần lưu ý (hiểu nhầm phổ biến):

- Sender không đồng nghĩa với client
- Receiver không đồng nghĩa với server

TCP là giao tiếp full-duplex (FDX), cả hai bên có thể giao tiếp hai chiều, client và server đều có thể vừa là sender vừa là receiver. Do đó, mỗi đầu có một send buffer và một receive buffer, cả hai đầu đều tự duy trì một send window và một receive window. Kích thước receive window phụ thuộc vào giới hạn của ứng dụng, hệ thống, phần cứng (tốc độ truyền TCP không thể lớn hơn tốc độ xử lý dữ liệu của ứng dụng). Yêu cầu send window và receive window của hai bên giao tiếp là như nhau.

**Send window TCP có thể chia thành bốn phần**:

1. Segment TCP đã gửi và đã được xác nhận (đã gửi, đã xác nhận);
2. Segment TCP đã gửi nhưng chưa được xác nhận (đã gửi, chưa xác nhận);
3. Segment TCP chưa gửi nhưng receiver sẵn sàng nhận (có thể gửi);
4. Segment TCP chưa gửi và receiver cũng chưa sẵn sàng nhận (không thể gửi).

**Sơ đồ cấu trúc send window TCP**:

![Cấu trúc send window TCP](/images/github/javaguide/cs-basics/network/tcp-send-window.png)

- **SND.WND**: Send window.
- **SND.UNA**: Con trỏ Send Unacknowledged, trỏ đến byte đầu tiên của send window.
- **SND.NXT**: Con trỏ Send Next, trỏ đến byte đầu tiên của available window.

**Kích thước available window** = `SND.UNA + SND.WND - SND.NXT`.

**Receive window TCP có thể chia thành ba phần**:

1. Segment TCP đã nhận và đã xác nhận (đã nhận, đã xác nhận);
2. Chờ nhận và cho phép sender gửi segment TCP (có thể nhận, chưa xác nhận);
3. Không thể nhận và không cho phép sender gửi segment TCP (không thể nhận).

**Sơ đồ cấu trúc receive window TCP**:

![Cấu trúc receive window TCP](/images/github/javaguide/cs-basics/network/tcp-receive-window.png)

**Kích thước receive window được điều chỉnh động dựa trên tốc độ xử lý dữ liệu của receiver.** Nếu receiver đọc dữ liệu nhanh, receive window có thể mở rộng. Ngược lại có thể thu hẹp.

Ngoài ra, kích thước sliding window ở đây chỉ dùng để minh họa, kích thước window thực tế thường lớn hơn nhiều so với giá trị này.

## Kiểm soát tắc nghẽn của TCP được thực hiện như thế nào?

Trong một khoảng thời gian nhất định, nếu nhu cầu về một tài nguyên nào đó trong mạng vượt quá phần khả dụng mà tài nguyên đó có thể cung cấp, hiệu suất mạng sẽ trở nên tệ hơn. Tình trạng này gọi là tắc nghẽn. Kiểm soát tắc nghẽn nhằm ngăn quá nhiều dữ liệu được đưa vào mạng, tránh router hoặc liên kết trong mạng bị quá tải. Tất cả các biện pháp kiểm soát tắc nghẽn đều có một tiền đề là mạng có thể chịu đựng tải mạng hiện tại. Kiểm soát tắc nghẽn là một quá trình toàn cục, liên quan đến tất cả host, tất cả router và tất cả các yếu tố liên quan đến giảm hiệu suất truyền tải mạng. Ngược lại, kiểm soát luồng thường là kiểm soát lưu lượng giao tiếp điểm-điểm, là vấn đề end-to-end. Mục tiêu của kiểm soát luồng là kiềm chế tốc độ gửi dữ liệu của sender để receiver kịp nhận.

![Kiểm soát tắc nghẽn TCP](/images/github/javaguide/cs-basics/network/tcp-congestion-control.png)

Để thực hiện kiểm soát tắc nghẽn, TCP sender phải duy trì một biến trạng thái **congestion window (cwnd)**. Kích thước congestion window phụ thuộc vào mức độ tắc nghẽn mạng và thay đổi động. Sender đặt send window của mình bằng giá trị nhỏ hơn giữa congestion window và receive window của receiver.

Kiểm soát tắc nghẽn TCP sử dụng bốn thuật toán: **Slow Start (khởi đầu chậm)**, **Congestion Avoidance (tránh tắc nghẽn)**, **Fast Retransmit (truyền lại nhanh)** và **Fast Recovery (phục hồi nhanh)**. Ở tầng mạng cũng có thể cho router áp dụng chiến lược loại bỏ gói phù hợp (như Active Queue Management — AQM) để giảm xảy ra tắc nghẽn mạng.

- **Slow Start**: Ý tưởng của thuật toán slow start là khi host bắt đầu gửi dữ liệu, nếu ngay lập tức đưa lượng lớn byte dữ liệu vào mạng, có thể gây tắc nghẽn mạng vì lúc này chưa biết tình trạng tải mạng. Kinh nghiệm cho thấy cách tốt hơn là thăm dò trước, tức là tăng dần send window từ nhỏ đến lớn, nghĩa là tăng dần giá trị congestion window từ nhỏ đến lớn. cwnd khởi đầu bằng 1, mỗi vòng truyền lan qua, cwnd tăng gấp đôi.
- **Congestion Avoidance**: Ý tưởng của thuật toán congestion avoidance là cho congestion window cwnd tăng chậm dần, tức là mỗi RTT (Round-Trip Time) chỉ tăng cwnd của sender thêm 1.
- **Fast Retransmit và Fast Recovery**: Trong TCP/IP, Fast Retransmit and Recovery (FRR) là một thuật toán kiểm soát tắc nghẽn có thể phục hồi nhanh các gói tin bị mất. Nếu không có FRR, khi một gói tin bị mất, TCP sẽ dùng timer để yêu cầu tạm dừng truyền. Trong thời gian tạm dừng này, không có gói mới hay gói trùng lặp nào được gửi. Với FRR, nếu receiver nhận được một segment không theo thứ tự, nó ngay lập tức gửi cho sender một duplicate ACK (xác nhận trùng lặp). Nếu sender nhận được ba duplicate ACK, nó sẽ giả định rằng segment được chỉ ra trong ACK đã bị mất và ngay lập tức retransmit các segment bị mất đó. Với FRR, không bị trì hoãn bởi việc tạm dừng yêu cầu trong quá trình retransmit. Khi chỉ có một gói dữ liệu đơn lẻ bị mất, FRR hoạt động hiệu quả nhất. Khi nhiều gói dữ liệu bị mất trong một khoảng thời gian ngắn, nó không hoạt động hiệu quả.

## Bạn có hiểu giao thức ARQ không?

**ARQ (Automatic Repeat-reQuest — Yêu cầu phát lại tự động)** là một trong các giao thức sửa lỗi ở tầng data link và tầng vận chuyển trong mô hình OSI. Nó thực hiện truyền thông tin đáng tin cậy trên cơ sở dịch vụ không đáng tin cậy thông qua hai cơ chế: xác nhận và timeout. Nếu sender không nhận được thông tin xác nhận (ACK) trong một khoảng thời gian sau khi gửi, nó thường sẽ gửi lại cho đến khi nhận được xác nhận hoặc đã thử lại vượt quá số lần nhất định.

ARQ bao gồm giao thức Stop-and-Wait ARQ và giao thức Continuous ARQ.

### Giao thức Stop-and-Wait ARQ

Giao thức Stop-and-Wait nhằm thực hiện truyền đáng tin cậy. Nguyên lý cơ bản là gửi xong mỗi packet thì dừng gửi, chờ đối phương xác nhận (trả ACK). Nếu sau một khoảng thời gian (timeout) vẫn không nhận được xác nhận ACK, nghĩa là gửi không thành công, cần gửi lại cho đến khi nhận được xác nhận mới gửi packet tiếp theo.

Trong giao thức Stop-and-Wait, nếu receiver nhận được packet trùng lặp, sẽ loại bỏ packet đó nhưng vẫn phải gửi xác nhận.

**1) Trường hợp không có lỗi:**

Sender gửi packet, receiver nhận trong thời gian quy định và trả lời xác nhận. Sender tiếp tục gửi.

**2) Trường hợp có lỗi (timeout retransmit):**

Timeout retransmit trong giao thức Stop-and-Wait là chỉ cần vượt quá một khoảng thời gian mà vẫn không nhận được xác nhận, sẽ retransmit packet đã gửi trước đó (coi rằng packet vừa gửi đã bị mất). Do đó, sau mỗi lần gửi xong một packet cần đặt một timeout timer, thời gian retransmit phải dài hơn RTT trung bình của gói tin trong mạng. Cách tự động retransmit này thường được gọi là **ARQ (Automatic Repeat-reQuest)**. Ngoài ra trong giao thức Stop-and-Wait, nếu nhận được packet trùng lặp thì loại bỏ packet đó nhưng vẫn phải gửi xác nhận.

**3) Xác nhận bị mất và xác nhận bị trễ**

- **Xác nhận bị mất**: Message xác nhận bị mất trong quá trình truyền. Khi A gửi message M1, B nhận được và gửi message xác nhận M1 cho A, nhưng bị mất trong quá trình truyền. A không biết điều này, sau timeout A gửi lại M1, B nhận lại message này thực hiện hai biện pháp sau: 1. Loại bỏ message M1 trùng lặp này, không chuyển lên tầng trên. 2. Gửi message xác nhận cho A. (Không phải vì đã gửi rồi thì không gửi nữa. A có thể retransmit, chứng tỏ message xác nhận của B đã bị mất).
- **Xác nhận bị trễ**: Message xác nhận bị trễ trong quá trình truyền. A gửi M1, B nhận và gửi xác nhận. Trong thời gian timeout không nhận được xác nhận, A retransmit M1, B vẫn nhận và tiếp tục gửi xác nhận (B nhận được 2 bản M1). Lúc này A nhận được message xác nhận thứ hai do B gửi. Tiếp tục gửi dữ liệu khác. Sau một lúc, A nhận được message xác nhận M1 đầu tiên do B gửi (A cũng nhận được 2 bản xác nhận). Xử lý như sau: 1. A nhận được xác nhận trùng lặp thì bỏ qua thẳng. 2. B nhận được M1 trùng lặp cũng bỏ qua thẳng M1 trùng lặp.

### Giao thức Continuous ARQ

Giao thức Continuous ARQ có thể cải thiện hiệu quả sử dụng kênh. Sender duy trì một send window, tất cả các packet nằm trong send window có thể được gửi liên tục mà không cần chờ đối phương xác nhận. Receiver thường dùng cumulative acknowledgement, gửi xác nhận cho packet cuối cùng đến theo thứ tự, cho biết tất cả các packet đến packet này đều đã nhận đúng.

- **Ưu điểm**: Hiệu quả sử dụng kênh cao, dễ triển khai, ngay cả khi xác nhận bị mất cũng không cần retransmit.
- **Nhược điểm**: Không thể thông báo cho sender biết thông tin về tất cả các packet mà receiver đã nhận đúng. Ví dụ: sender gửi 5 message, packet thứ 3 ở giữa bị mất (số 3), lúc này receiver chỉ có thể gửi xác nhận cho hai packet đầu. Sender không biết số phận của 3 packet sau, đành phải gửi lại cả 3 packet đó. Đây còn gọi là Go-Back-N (quay lại N), nghĩa là cần quay lại retransmit N message đã gửi trước đó.

## Timeout retransmit được thực hiện như thế nào? RTO được xác định như thế nào?

Khi sender gửi dữ liệu, nó khởi động một timer, chờ đầu nhận xác nhận nhận được segment này. Receiver gửi lại ACK tương ứng cho mỗi packet đã nhận thành công. Nếu sender không nhận được xác nhận trong RTT (Round-Trip Time) hợp lý, gói tin tương ứng được giả định là [đã mất](https://zh.wikipedia.org/wiki/丢包) và được retransmit.

- RTT (Round Trip Time): Thời gian khứ hồi, là thời gian từ khi gửi gói tin đến khi nhận được ACK tương ứng.
- RTO (Retransmission Time Out): Thời gian timeout retransmit, tức là tính từ thời điểm gửi dữ liệu, vượt quá thời gian này thì thực hiện retransmit.

Việc xác định RTO là vấn đề quan trọng vì nó ảnh hưởng trực tiếp đến hiệu suất và hiệu quả của TCP. Nếu RTO đặt quá nhỏ, sẽ gây retransmit không cần thiết, tăng tải mạng; nếu RTO đặt quá lớn, sẽ gây trễ truyền dữ liệu, giảm throughput. Do đó RTO cần được điều chỉnh động dựa trên tình trạng thực tế của mạng.

Giá trị RTT thay đổi theo biến động của mạng, nên TCP không thể dùng trực tiếp RTT làm RTO. Để điều chỉnh RTO động, giao thức TCP sử dụng một số thuật toán như EWMA (Exponentially Weighted Moving Average), thuật toán Karn, thuật toán Jacobson, v.v. Các thuật toán này đều ước tính giá trị RTO dựa trên đo lường và thay đổi của RTT.

## Tài liệu tham khảo

1. 《Mạng máy tính (Phiên bản 7)》
2. 《Giải thích HTTP bằng hình ảnh》
3. [https://www.9tut.com/tcp-and-udp-tutorial](https://www.9tut.com/tcp-and-udp-tutorial)
4. [https://github.com/wolverinn/Waking-Up/blob/master/Computer%20Network.md](https://github.com/wolverinn/Waking-Up/blob/master/Computer%20Network.md)
5. TCP Flow Control — [https://www.brianstorti.com/tcp-flow-control/](https://www.brianstorti.com/tcp-flow-control/)
6. TCP Flow Control: <https://notfalse.net/24/tcp-flow-control>
7. Nguyên lý sliding window TCP: <https://cloud.tencent.com/developer/article/1857363>

<!-- @include: @article-footer.snippet.md -->
