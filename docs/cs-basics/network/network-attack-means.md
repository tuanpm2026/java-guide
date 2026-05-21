---
title: Tóm tắt các phương thức tấn công mạng phổ biến (Bảo mật)
description: Tóm tắt các phương thức tấn công và chiến lược phòng thủ TCP/IP phổ biến, bao gồm DDoS, giả mạo IP/ARP, tấn công man-in-the-middle, v.v., nhấn mạnh các thực hành phòng thủ kỹ thuật.
category: Cơ sở máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: 网络攻击,DDoS,IP 欺骗,ARP 欺骗,中间人攻击,扫描,防护
---

> Bài viết này được tổng hợp và hoàn thiện từ bài [Các phương thức tấn công TCP/IP phổ biến - Notelam Notes - 2021](https://mp.weixin.qq.com/s/AZwWrOlLxRSSi-ywBgZ0fA).

Nội dung chính của bài viết này là giới thiệu về các phương thức tấn công TCP/IP phổ biến, đặc biệt là tấn công DDoS, cũng sẽ bổ sung một số phương thức tấn công mạng phổ biến khác.

## Giả mạo IP

### IP là gì?

Trong mạng, tất cả các thiết bị đều được phân bổ một địa chỉ. Địa chỉ này giống như địa chỉ nhà của một người - **số nhà và số phòng**, số nhà được phân bổ cho toàn bộ mạng con, **số phòng** tương ứng với số được phân bổ cho máy tính trong mạng con, đây chính là địa chỉ trong mạng. "Số nhà" tương ứng là số mạng (network number), **"số phòng"** tương ứng là số máy chủ (host number), toàn bộ địa chỉ này là **địa chỉ IP**.

### Qua địa chỉ IP chúng ta có thể biết điều gì?

Qua địa chỉ IP, chúng ta có thể biết vị trí của máy chủ đích cần truy cập, từ đó gửi tin nhắn đến máy chủ. Thông thường tin nhắn do người gửi phát ra trước tiên đi qua hub của mạng con, chuyển tiếp đến bộ định tuyến gần nhất, rồi theo vị trí định tuyến truy cập đến bộ định tuyến tiếp theo, cho đến đích cuối cùng.

**Định dạng tiêu đề IP**:

![](/images/p3-juejin/843fd07074874ee0b695eca659411b42~tplv-k3u1fbpfcp-zoom-1.png)

### Kỹ thuật giả mạo IP là gì?

Lừa đảo, dẫn dụ, giả mạo!

Kỹ thuật giả mạo IP là kỹ thuật **làm giả** địa chỉ IP của một máy chủ. Thông qua việc giả mạo địa chỉ IP, một máy chủ có thể **giả mạo** thành máy chủ khác, trong khi máy chủ bị giả mạo thường có một số đặc quyền hoặc được các máy chủ khác tin tưởng.

Giả sử hiện có một người dùng hợp lệ **(1.1.1.1)** đã thiết lập kết nối bình thường với máy chủ. Kẻ tấn công tạo các dữ liệu TCP tấn công, giả mạo IP của mình thành **1.1.1.1** và gửi đoạn dữ liệu TCP có bit RST đến máy chủ. Sau khi máy chủ nhận được dữ liệu như vậy, nó nghĩ rằng kết nối từ **1.1.1.1** có lỗi, và sẽ xóa kết nối đã được thiết lập trong buffer.

Lúc này, nếu người dùng hợp lệ **1.1.1.1** gửi dữ liệu hợp lệ, máy chủ đã không còn kết nối đó nữa, người dùng đó phải bắt đầu thiết lập kết nối mới. Trong cuộc tấn công, kẻ tấn công giả mạo một lượng lớn địa chỉ IP, gửi dữ liệu RST đến mục tiêu, khiến máy chủ không phục vụ người dùng hợp lệ. Mặc dù tấn công giả mạo IP có độ khó đáng kể, nhưng chúng ta nên nhận thức rõ ràng rằng phương thức tấn công này rất phổ biến, và việc xâm nhập thường bắt đầu từ loại tấn công này.

![Tấn công DDoS giả mạo IP](/images/p3-juejin/7547a145adf9404aa3a05f01f5ca2e32~tplv-k3u1fbpfcp-zoom-1.png)

### Làm thế nào để giảm thiểu giả mạo IP?

Mặc dù không thể ngăn chặn hoàn toàn giả mạo IP, nhưng có thể thực hiện các biện pháp để ngăn các gói giả mạo xâm nhập vào mạng. **Lọc đầu vào (Ingress filtering)** là biện pháp phòng thủ phổ biến chống giả mạo, như được chỉ rõ trong BCP38 (tài liệu thực hành tốt nhất chung). Lọc đầu vào là một hình thức lọc gói tin, thường được triển khai trên các thiết bị ở [rìa mạng](https://www.cloudflare.com/learning/serverless/glossary/what-is-edge-computing/), dùng để kiểm tra các gói IP đến và xác định tiêu đề nguồn của chúng. Nếu tiêu đề nguồn của các gói không khớp với nguồn gốc hoặc trông đáng ngờ, chúng sẽ bị từ chối. Một số mạng cũng triển khai lọc đầu ra, kiểm tra các gói IP rời khỏi mạng, đảm bảo các gói này có tiêu đề nguồn hợp lệ, nhằm ngăn người dùng bên trong mạng sử dụng kỹ thuật giả mạo IP để khởi động các cuộc tấn công độc hại ra ngoài.

## Tấn công lũ SYN (SYN Flood)

### SYN Flood là gì?

SYN Flood là một trong những cuộc tấn công DDoS (Distributed Denial of Service - Tấn công từ chối dịch vụ phân tán) nguyên thủy và kinh điển nhất trên Internet, nhằm làm cạn kiệt tài nguyên máy chủ có sẵn, khiến máy chủ không thể truyền lưu lượng hợp lệ.

SYN Flood khai thác cơ chế bắt tay ba chiều của giao thức TCP. Kẻ tấn công thường sử dụng công cụ hoặc kiểm soát máy tính zombie để gửi số lượng lớn các bản tin TCP SYN có địa chỉ IP nguồn hoặc cổng nguồn thay đổi đến máy chủ. Sau khi máy chủ phản hồi các bản tin này, một lượng lớn kết nối nửa mở sẽ được tạo ra. Khi tài nguyên hệ thống bị cạn kiệt, máy chủ sẽ không thể cung cấp dịch vụ bình thường.
Tăng hiệu suất máy chủ và cung cấp nhiều khả năng kết nối hơn là không đủ trước số lượng lớn bản tin của SYN Flood. Chìa khóa để phòng thủ SYN Flood là xác định yêu cầu kết nối nào đến từ nguồn thực, chặn các yêu cầu từ nguồn không thực để đảm bảo các yêu cầu kinh doanh bình thường được phục vụ.

![](/images/p3-juejin/2b3d2d4dc8f24890b5957df1c7d6feb8~tplv-k3u1fbpfcp-zoom-1.png)

### Nguyên lý tấn công TCP SYN Flood là gì?

Tấn công **TCP SYN Flood** khai thác bắt tay ba chiều của **TCP** (**SYN -> SYN/ACK -> ACK**). Giả sử bên khởi tạo kết nối là A, bên nhận kết nối là B, tức là B lắng nghe yêu cầu kết nối từ A trên một cổng (**Port**) nào đó. Quá trình như hình dưới đây, bên trái là A, bên phải là B.

![](/images/p3-juejin/a39355a1ea404323a11ca6644e009183~tplv-k3u1fbpfcp-zoom-1.png)

A trước tiên gửi tin nhắn **SYN** (Synchronization) cho B, yêu cầu B chuẩn bị nhận dữ liệu; B sau khi nhận phản hồi tin nhắn **SYN-ACK** (Synchronization-Acknowledgement) cho A, mục đích của tin nhắn này có hai:

- Xác nhận với A rằng đã sẵn sàng nhận dữ liệu,
- Đồng thời yêu cầu A cũng chuẩn bị nhận dữ liệu. Lúc này B đã xác nhận trạng thái nhận với A và chờ xác nhận từ A, kết nối ở **trạng thái nửa mở (Half-Open)**, chỉ mở được một nửa; A sau khi nhận lại gửi tin nhắn **ACK** (Acknowledgement) cho B, xác nhận với B rằng cũng đã sẵn sàng nhận dữ liệu. Đến đây bắt tay ba chiều hoàn tất, "**kết nối**" được thiết lập.

Điều quan trọng nhất là liệu cả hai bên có vào được **trạng thái có thể nhận tin nhắn** theo yêu cầu của đối phương hay không. Việc xác nhận trạng thái này chủ yếu là **số thứ tự tin nhắn (SequenceNum)** mà cả hai bên sẽ sử dụng. **TCP** cần dùng **số thứ tự tin nhắn** để đánh dấu thứ tự gửi tin nhắn nhằm đảm bảo tin nhắn đến tay ứng dụng phía trên của bên nhận theo đúng thứ tự gửi.

**TCP** là kết nối **song công (Duplex)**, đồng thời hỗ trợ truyền thông hai chiều, tức là cả hai bên có thể gửi tin nhắn cho nhau đồng thời. Trong đó, **SYN** và **SYN-ACK** mở kênh liên lạc một chiều A→B (B biết số thứ tự tin nhắn của A); **SYN-ACK** và **ACK** mở kênh liên lạc một chiều B→A (A biết số thứ tự tin nhắn của B).

Phần trên thảo luận về truyền thông trong điều kiện bình thường, trung thực.

Nhưng thực tế, mạng có thể không ổn định và mất gói, khiến tin nhắn bắt tay không đến được đối phương, hoặc đối phương cố tình không tuân thủ quy tắc, cố tình trì hoãn hoặc không gửi tin nhắn xác nhận bắt tay.

Giả sử B cung cấp dịch vụ qua một cổng **TCP**, khi B nhận được tin nhắn **SYN** từ A, nó tích cực phản hồi tin nhắn **SYN-ACK**, khiến kết nối vào **trạng thái nửa mở**. Vì B không chắc chắn tin nhắn **SYN-ACK** gửi cho A hay tin nhắn ACK phản hồi từ A có bị mất dọc đường không, nên sẽ đặt một **Timer** cho mỗi kết nối nửa mở đang chờ hoàn thành. Nếu quá thời gian vẫn không nhận được tin nhắn **ACK** từ A, sẽ gửi lại tin nhắn **SYN-ACK** một lần cho A, cho đến khi số lần thử lại vượt quá một ngưỡng nhất định mới từ bỏ.

![Hình](/images/p3-juejin/7ff1daddcec44d61994f254e664987b4~tplv-k3u1fbpfcp-zoom-1.png)

Để giúp A kết nối thành công, B cần **phân bổ tài nguyên kernel** để duy trì kết nối nửa mở. Khi B phải đối mặt với lượng lớn kết nối A như hình trên, **tấn công SYN Flood** được hình thành. Bên tấn công A có thể điều khiển máy tính zombie gửi một lượng lớn tin nhắn SYN cho B nhưng không phản hồi tin nhắn ACK, hoặc đơn giản là giả mạo **IP nguồn** trong tin nhắn SYN, khiến tin nhắn **SYN-ACK** phản hồi của B không thể đến đích, dẫn đến B bị chiếm đóng bởi lượng lớn kết nối nửa mở chắc chắn không thể hoàn thành, cho đến khi tài nguyên cạn kiệt, ngừng phản hồi các yêu cầu kết nối bình thường.

### Các hình thức phổ biến của SYN Flood là gì?

**Người dùng độc hại có thể khởi động tấn công SYN Flood theo ba cách khác nhau**:

1. **Tấn công trực tiếp:** Tấn công lũ SYN không giả mạo địa chỉ IP được gọi là tấn công trực tiếp. Trong loại tấn công này, kẻ tấn công hoàn toàn không che giấu địa chỉ IP của mình. Vì kẻ tấn công khởi động tấn công bằng thiết bị nguồn đơn lẻ với địa chỉ IP thực, nên rất dễ phát hiện và giải quyết kẻ tấn công. Để làm cho máy mục tiêu ở trạng thái nửa mở, kẻ tấn công sẽ ngăn máy cá nhân phản hồi gói SYN-ACK từ máy chủ. Điều này thường được thực hiện bằng hai cách: triển khai quy tắc tường lửa để chặn tất cả các gói đi ra ngoài trừ gói SYN; hoặc lọc tất cả gói SYN-ACK đến, ngăn chúng tiếp cận máy người dùng độc hại. Thực tế, phương pháp này ít được sử dụng vì loại tấn công này khá dễ giảm thiểu - chỉ cần chặn địa chỉ IP của mỗi hệ thống độc hại.
2. **Tấn công giả mạo:** Người dùng độc hại cũng có thể giả mạo địa chỉ IP của từng gói SYN gửi đi nhằm ngăn các biện pháp giảm thiểu và làm khó việc lộ danh tính. Mặc dù các gói có thể đã được giả mạo, nhưng vẫn có thể truy vết nguồn gốc qua các gói này. Công việc phát hiện này khó thực hiện nhưng không phải không thể, đặc biệt nếu Nhà cung cấp Dịch vụ Internet (ISP) sẵn sàng hợp tác.
3. **Tấn công phân tán (DDoS):** Nếu sử dụng mạng botnet để tấn công, khả năng truy vết nguồn tấn công rất thấp. Khi mức độ che giấu tăng lên, kẻ tấn công còn có thể lệnh cho mỗi thiết bị phân tán giả mạo địa chỉ IP của gói gửi đi. Ngay cả khi sử dụng botnet (như Mirai botnet), thường cũng không cố tình che giấu IP của các thiết bị bị xâm phạm.

### Làm thế nào để giảm thiểu SYN Flood?

#### Mở rộng hàng đợi tồn đọng

Mỗi hệ điều hành được cài đặt trên thiết bị mục tiêu cho phép một số lượng kết nối nửa mở nhất định. Để phản hồi một lượng lớn gói SYN, một cách là tăng số lượng kết nối nửa mở tối đa mà hệ điều hành cho phép. Để mở rộng thành công mức tồn đọng tối đa, hệ thống phải dự trữ thêm tài nguyên bộ nhớ để xử lý các yêu cầu mới. Nếu hệ thống không có đủ bộ nhớ để đáp ứng kích thước hàng đợi tồn đọng tăng lên, sẽ có tác động tiêu cực đến hiệu suất hệ thống, nhưng vẫn tốt hơn từ chối dịch vụ.

#### Thu hồi các kết nối nửa mở TCP được tạo sớm nhất

Chiến lược giảm thiểu khác là ghi đè lên các kết nối nửa mở được tạo sớm nhất sau khi hàng đợi tồn đọng được lấp đầy. Chiến lược này yêu cầu thời gian thiết lập kết nối hợp lệ hoàn chỉnh phải ít hơn thời gian để các gói SYN độc hại lấp đầy hàng đợi tồn đọng. Khi lượng tấn công tăng lên hoặc kích thước hàng đợi tồn đọng nhỏ hơn nhu cầu thực tế, biện pháp phòng thủ cụ thể này sẽ không hiệu quả.

#### SYN Cookie

Chiến lược này yêu cầu máy chủ tạo Cookie. Để tránh ngắt kết nối khi lấp đầy hàng đợi tồn đọng, máy chủ sử dụng gói SYN-ACK để phản hồi mỗi yêu cầu kết nối, sau đó xóa yêu cầu SYN khỏi hàng đợi tồn đọng, đồng thời xóa yêu cầu khỏi bộ nhớ, đảm bảo cổng vẫn mở và sẵn sàng thiết lập kết nối lại. Nếu kết nối là yêu cầu hợp lệ và gói ACK cuối cùng đã được gửi từ máy khách về máy chủ, máy chủ sẽ tái tạo (có một số hạn chế) mục nhập hàng đợi tồn đọng SYN. Mặc dù biện pháp giảm thiểu này có thể làm mất một số thông tin kết nối TCP, nhưng tốt hơn là dẫn đến tấn công từ chối dịch vụ đối với người dùng hợp lệ.

## Tấn công lũ UDP (UDP Flood)

### UDP Flood là gì?

**UDP Flood** cũng là một loại tấn công từ chối dịch vụ, gửi một lượng lớn gói giao thức dữ liệu người dùng (**UDP**) đến máy chủ mục tiêu, nhằm áp đảo khả năng xử lý và phản hồi của thiết bị. Tường lửa bảo vệ máy chủ mục tiêu cũng có thể bị cạn kiệt do lũ **UDP**, dẫn đến từ chối dịch vụ với lưu lượng hợp lệ.

### Nguyên lý tấn công UDP Flood là gì?

**UDP Flood** chủ yếu khai thác các bước mà máy chủ thực hiện để phản hồi các gói **UDP** được gửi đến một trong các cổng của nó. Trong điều kiện bình thường, khi máy chủ nhận được gói **UDP** trên một cổng cụ thể, nó thực hiện hai bước:

- Máy chủ trước tiên kiểm tra xem có chương trình đang chạy lắng nghe yêu cầu trên cổng đã chỉ định hay không.
- Nếu không có chương trình nào nhận gói tại cổng đó, máy chủ phản hồi bằng gói **ICMP** (ping) để thông báo cho người gửi rằng đích không thể tiếp cận.

Ví dụ. Giả sử hôm nay muốn liên hệ với một người ở khách sạn, nhân viên khách sạn sau khi nhận điện thoại sẽ kiểm tra danh sách phòng để xác nhận người đó có trong phòng không, rồi chuyển máy.

Đầu tiên, nhân viên lễ tân nhận cuộc gọi yêu cầu kết nối đến một phòng cụ thể. Họ cần kiểm tra danh sách tất cả các phòng để xác nhận khách có trong phòng và sẵn sàng nghe điện thoại. Tình cờ thay, nếu đột nhiên tất cả các đường dây điện thoại sáng lên cùng một lúc, họ sẽ sớm bị choáng ngợp.

Khi máy chủ nhận được mỗi gói **UDP** mới, nó sẽ xử lý yêu cầu theo các bước và sử dụng tài nguyên máy chủ trong quá trình đó. Khi gửi bản tin **UDP**, mỗi bản tin sẽ chứa địa chỉ **IP** của thiết bị nguồn. Trong loại tấn công **DDoS** này, kẻ tấn công thường không sử dụng địa chỉ **IP** thực của mình, mà sẽ giả mạo địa chỉ **IP** nguồn của gói **UDP**, từ đó ngăn vị trí thực của kẻ tấn công bị lộ và có thể bão hòa các gói phản hồi từ máy chủ mục tiêu.

Do máy chủ mục tiêu sử dụng tài nguyên để kiểm tra và phản hồi mỗi gói **UDP** nhận được, khi nhận được một lượng lớn gói **UDP**, tài nguyên của mục tiêu có thể nhanh chóng bị cạn kiệt, dẫn đến từ chối dịch vụ với lưu lượng bình thường.

![](/images/p3-juejin/23dbbc8243a84ed181e088e38bffb37a~tplv-k3u1fbpfcp-zoom-1.png)

### Làm thế nào để giảm thiểu UDP Flood?

Hầu hết các hệ điều hành đều giới hạn một phần tốc độ phản hồi bản tin **ICMP**, để gián đoạn các cuộc tấn công **DDoS** cần phản hồi ICMP. Một nhược điểm của biện pháp giảm thiểu này là trong quá trình tấn công, các gói hợp lệ cũng có thể bị lọc. Nếu dung lượng của **UDP Flood** đủ cao để bão hòa bảng trạng thái tường lửa của máy chủ mục tiêu, thì bất kỳ biện pháp giảm thiểu nào xảy ra ở cấp độ máy chủ cũng sẽ không đủ để giải quyết nút thắt cổ chai ở thượng nguồn của thiết bị mục tiêu.

## Tấn công lũ HTTP (HTTP Flood)

### HTTP Flood là gì?

HTTP Flood là một loại tấn công DDoS (Distributed Denial of Service - Tấn công từ chối dịch vụ phân tán) quy mô lớn, nhằm làm quá tải máy chủ mục tiêu bằng các yêu cầu HTTP. Khi mục tiêu đạt trạng thái bão hòa do các yêu cầu và không thể phản hồi lưu lượng bình thường, sẽ xảy ra từ chối dịch vụ, từ chối các yêu cầu khác từ người dùng thực.

![Tấn công lũ HTTP](/images/p3-juejin/aa64869551d94c8d89fa80eaf4395bfa~tplv-k3u1fbpfcp-zoom-1.png)

### Nguyên lý tấn công của HTTP Flood là gì?

Tấn công lũ HTTP là một loại tấn công DDoS "tầng 7". Tầng 7 là tầng ứng dụng của mô hình OSI, đề cập đến các giao thức Internet như HTTP. HTTP là nền tảng của các yêu cầu Internet dựa trên trình duyệt, thường được dùng để tải trang web hoặc gửi nội dung biểu mẫu qua Internet. Việc giảm thiểu các cuộc tấn công tầng ứng dụng đặc biệt phức tạp vì rất khó phân biệt lưu lượng độc hại với lưu lượng bình thường.

Để đạt hiệu quả tối đa, các tác nhân độc hại thường khai thác hoặc tạo mạng botnet để tối đa hóa tác động của cuộc tấn công. Bằng cách khai thác nhiều thiết bị bị nhiễm phần mềm độc hại, kẻ tấn công có thể tung ra một lượng lớn lưu lượng tấn công.

Có hai loại tấn công lũ HTTP:

- **Tấn công HTTP GET**: Trong hình thức tấn công này, nhiều máy tính hoặc thiết bị khác phối hợp với nhau, gửi nhiều yêu cầu hình ảnh, tệp hoặc tài nguyên khác đến máy chủ mục tiêu. Khi mục tiêu bị nhấn chìm bởi các yêu cầu và phản hồi đến, các yêu cầu khác từ nguồn lưu lượng bình thường sẽ bị từ chối.
- **Tấn công HTTP POST**: Nói chung, khi gửi biểu mẫu trên website, máy chủ phải xử lý yêu cầu đến và đẩy dữ liệu vào lớp lưu trữ lâu dài (thường là cơ sở dữ liệu). So với năng lực xử lý và băng thông cần thiết để gửi yêu cầu POST, quá trình xử lý dữ liệu biểu mẫu và chạy các lệnh cơ sở dữ liệu cần thiết tương đối tốn kém. Loại tấn công này khai thác sự chênh lệch tiêu thụ tài nguyên tương đối, gửi nhiều yêu cầu POST trực tiếp đến máy chủ mục tiêu cho đến khi dung lượng của máy chủ mục tiêu bão hòa và từ chối dịch vụ.

### Làm thế nào để phòng thủ HTTP Flood?

Như đã đề cập, việc giảm thiểu tấn công tầng 7 rất phức tạp và thường cần tiếp cận từ nhiều khía cạnh. Một cách là thách thức các thiết bị gửi yêu cầu để kiểm tra xem có phải bot không, tương tự như bài kiểm tra CAPTCHA thường dùng khi tạo tài khoản trực tuyến. Bằng cách đặt ra các yêu cầu như thách thức tính toán JavaScript, có thể giảm thiểu nhiều cuộc tấn công.

Các cách khác để chặn tấn công lũ HTTP bao gồm sử dụng Tường lửa ứng dụng Web (WAF), quản lý cơ sở dữ liệu danh tiếng IP để theo dõi và chọn lọc chặn lưu lượng độc hại, cũng như phân tích động bởi kỹ sư. Cloudflare với ưu thế về quy mô hơn 20 triệu thiết bị Internet có thể phân tích lưu lượng từ nhiều nguồn khác nhau và giảm thiểu các cuộc tấn công tiềm ẩn thông qua quy tắc WAF được cập nhật nhanh và các chiến lược bảo vệ khác, từ đó loại bỏ lưu lượng DDoS tầng ứng dụng.

## Tấn công lũ DNS (DNS Flood)

### DNS Flood là gì?

Máy chủ Hệ thống Tên miền (DNS) là "danh bạ điện thoại" của Internet; các thiết bị Internet dùng những máy chủ này để tra cứu máy chủ web cụ thể nhằm truy cập nội dung Internet. Tấn công DNS Flood là một loại tấn công từ chối dịch vụ phân tán (DDoS), kẻ tấn công dùng lượng lớn lưu lượng để nhấn chìm máy chủ DNS của một tên miền, nhằm cố gắng làm gián đoạn việc phân giải DNS của tên miền đó. Nếu người dùng không thể tìm thấy danh bạ điện thoại, họ không thể tra cứu địa chỉ để gọi đến tài nguyên cụ thể. Bằng cách làm gián đoạn phân giải DNS, tấn công DNS Flood sẽ làm suy yếu khả năng phản hồi lưu lượng hợp lệ của website, API hoặc ứng dụng web. Rất khó phân biệt tấn công DNS Flood với lưu lượng lớn bình thường, vì các lưu lượng quy mô lớn này thường đến từ nhiều địa chỉ duy nhất, truy vấn bản ghi thực của tên miền, bắt chước lưu lượng hợp lệ.

### Nguyên lý tấn công DNS Flood là gì?

![](/images/p3-juejin/97ea11a212924900b10d159226783887~tplv-k3u1fbpfcp-zoom-1.png)

Chức năng của hệ thống tên miền là chuyển đổi tên dễ nhớ (ví dụ example.com) thành địa chỉ máy chủ website khó nhớ (ví dụ 192.168.0.1), vì vậy một cuộc tấn công thành công vào cơ sở hạ tầng DNS sẽ khiến hầu hết mọi người không thể sử dụng Internet. Tấn công DNS Flood là một loại tấn công dựa trên DNS tương đối mới, loại tấn công này tăng mạnh sau sự nổi lên của [mạng botnet IoT](https://www.cloudflare.com/learning/ddos/glossary/internet-of-things-iot/) băng thông cao như [Mirai](https://www.cloudflare.com/learning/ddos/glossary/mirai-botnet/). Tấn công DNS Flood sử dụng kết nối băng thông cao của camera IP, đầu thu DVR và các thiết bị IoT khác để trực tiếp nhấn chìm máy chủ DNS của các nhà cung cấp lớn. Lượng lớn yêu cầu từ thiết bị IoT nhấn chìm dịch vụ của nhà cung cấp DNS, ngăn người dùng hợp lệ truy cập máy chủ DNS của nhà cung cấp.

Tấn công DNS Flood khác với [tấn công khuếch đại DNS](https://www.cloudflare.com/zh-cn/learning/ddos/dns-amplification-ddos-attack/). Khác với tấn công DNS Flood, tấn công khuếch đại DNS phản chiếu và khuếch đại lưu lượng từ các máy chủ DNS không bảo mật để ẩn nguồn tấn công và nâng cao hiệu quả tấn công. Tấn công khuếch đại DNS sử dụng các thiết bị có băng thông kết nối nhỏ để gửi vô số yêu cầu đến các máy chủ DNS không bảo mật. Các thiết bị này gửi yêu cầu nhỏ cho bản ghi DNS rất lớn, nhưng khi gửi yêu cầu, kẻ tấn công giả mạo địa chỉ trả về là nạn nhân mục tiêu. Hiệu ứng khuếch đại này cho phép kẻ tấn công phá vỡ mục tiêu lớn hơn bằng nguồn lực tấn công hạn chế.

### Làm thế nào để phòng thủ DNS Flood?

Tấn công DNS Flood đã thay đổi phương pháp tấn công dựa trên khuếch đại truyền thống. Với mạng botnet băng thông cao dễ dàng có được, kẻ tấn công hiện có thể tấn công các tổ chức lớn. Trừ khi các thiết bị IoT bị xâm phạm được cập nhật hoặc thay thế, cách duy nhất để chống lại các cuộc tấn công này là sử dụng hệ thống DNS cực lớn, phân tán cao để giám sát, hấp thụ và chặn lưu lượng tấn công theo thời gian thực.

## Tấn công đặt lại TCP

Trong tấn công **đặt lại TCP**, kẻ tấn công gửi tin nhắn giả mạo đến một hoặc cả hai bên truyền thông, báo với họ rằng hãy ngắt kết nối ngay lập tức, khiến kết nối giữa cả hai bên truyền thông bị gián đoạn. Trong điều kiện bình thường, nếu máy khách phát hiện đoạn báo đến không chính xác cho kết nối liên quan, **TCP** sẽ gửi một đoạn báo đặt lại, dẫn đến việc kết nối **TCP** bị hủy nhanh chóng.

**Tấn công đặt lại TCP** lợi dụng cơ chế này, bằng cách gửi đoạn đặt lại giả mạo đến các bên truyền thông, lừa cả hai bên đóng kết nối TCP sớm. Nếu đoạn đặt lại giả mạo hoàn toàn thuyết phục, người nhận sẽ coi nó là hợp lệ và đóng kết nối **TCP**, ngăn kết nối được sử dụng để trao đổi thông tin thêm. Phía máy chủ có thể tạo kết nối **TCP** mới để khôi phục liên lạc, nhưng vẫn có thể bị kẻ tấn công đặt lại kết nối. May mắn thay, kẻ tấn công cần một khoảng thời gian để lắp ráp và gửi đoạn giả mạo, vì vậy thông thường loại tấn công này chỉ có sát thương đối với kết nối dài. Đối với kết nối ngắn, kẻ tấn công chưa kịp tấn công thì người ta đã hoàn thành trao đổi thông tin.

Theo một nghĩa nào đó, việc giả mạo **đoạn TCP** khá dễ dàng, vì **TCP/IP** không có phương pháp tích hợp nào để xác minh danh tính máy chủ. Một số giao thức mở rộng IP đặc biệt (như `IPSec`) thực sự có thể xác minh danh tính, nhưng không được sử dụng rộng rãi. Máy khách chỉ có thể nhận đoạn báo, và trong trường hợp có thể, sử dụng các giao thức cấp cao hơn (như `TLS`) để xác minh danh tính máy chủ. Nhưng phương pháp này không áp dụng cho gói đặt lại **TCP**, vì gói đặt lại **TCP** là một phần của giao thức **TCP** và không thể xác minh bằng các giao thức cấp cao hơn.

## Mô phỏng tấn công

> Các thử nghiệm sau được thực hiện trên hệ thống `OSX`, vui lòng tự kiểm tra trên các hệ thống khác.

Bây giờ hãy tóm tắt những gì cần làm để giả mạo một **đoạn đặt lại TCP**:

- Nghe lén thông tin trao đổi của cả hai bên truyền thông.
- Chặn một đoạn báo với bit cờ `ACK` được đặt thành 1, và đọc số `ACK` của nó.
- Giả mạo một đoạn đặt lại TCP (bit cờ `RST` được đặt thành 1), số thứ tự của nó bằng số `ACK` của đoạn vừa chặn được. Đây chỉ là phương án trong trường hợp lý tưởng, giả định tốc độ trao đổi thông tin không quá nhanh. Trong hầu hết các trường hợp, để tăng tỷ lệ thành công, có thể gửi liên tiếp các đoạn đặt lại có số thứ tự khác nhau.
- Gửi đoạn đặt lại giả mạo cho một hoặc cả hai bên truyền thông, khiến họ ngắt kết nối.

Để thử nghiệm đơn giản, chúng ta có thể sử dụng máy tính cục bộ để liên lạc với chính nó qua `localhost`, sau đó thực hiện tấn công đặt lại TCP với chính mình. Cần thực hiện các bước sau:

- Thiết lập kết nối TCP giữa hai terminal.
- Viết chương trình tấn công có thể nghe lén dữ liệu của cả hai bên truyền thông.
- Sửa đổi chương trình tấn công, giả mạo và gửi đoạn đặt lại.

Bây giờ bắt đầu thử nghiệm chính thức.

> Thiết lập kết nối TCP

Có thể dùng công cụ netcat để thiết lập kết nối TCP, công cụ này đã được cài đặt sẵn trên nhiều hệ điều hành. Mở cửa sổ terminal đầu tiên, chạy lệnh sau:

```bash
nc -nvl 8000
```

Lệnh này sẽ khởi động dịch vụ TCP, lắng nghe trên cổng `8000`. Tiếp theo mở cửa sổ terminal thứ hai, chạy lệnh sau:

```bash
nc 127.0.0.1 8000
```

Lệnh này sẽ cố gắng thiết lập kết nối với dịch vụ trên. Nhập một số ký tự trong một cửa sổ, chúng sẽ được gửi qua kết nối TCP đến cửa sổ kia và in ra.

![](/images/p3-juejin/df0508cbf26446708cf98f8ad514dbea~tplv-k3u1fbpfcp-zoom-1.gif)

> Nghe lén lưu lượng

Viết một chương trình tấn công, sử dụng thư viện mạng Python `scapy` để đọc dữ liệu được trao đổi giữa hai cửa sổ terminal và in ra terminal. Mã khá dài, dưới đây chỉ là một phần, mã hoàn chỉnh được trả lời qua phản hồi backend "TCP Attack". Cốt lõi của mã là gọi phương thức nghe lén của `scapy`:

![](/images/p3-juejin/27feb834aa9d4b629fd938611ac9972e~tplv-k3u1fbpfcp-zoom-1.png)

Đoạn mã này báo cho `scapy` nghe lén gói tin trên giao diện mạng `lo0` và ghi lại thông tin chi tiết về tất cả các kết nối TCP.

- **iface**: Báo cho scapy lắng nghe trên giao diện mạng `lo0` (localhost).
- **lfilter**: Đây là bộ lọc, báo cho scapy bỏ qua tất cả các gói không thuộc kết nối TCP đã chỉ định (cả hai bên truyền thông đều là `localhost`, cổng `8000`).
- **prn**: scapy sử dụng hàm này để xử lý tất cả gói tin thỏa mãn quy tắc `lfilter`. Ví dụ trên chỉ in gói tin ra terminal, phần tiếp theo sẽ sửa đổi hàm để giả mạo đoạn đặt lại.
- **count**: Số lượng gói tin cần nghe lén trước khi hàm scapy trả về.

> Gửi đoạn đặt lại giả mạo

Bây giờ bắt đầu sửa đổi chương trình, gửi đoạn đặt lại TCP giả mạo để thực hiện tấn công đặt lại TCP. Dựa trên phân tích ở trên, chỉ cần sửa đổi hàm prn, cho nó kiểm tra gói tin, trích xuất các tham số cần thiết và sử dụng các tham số này để giả mạo đoạn đặt lại TCP và gửi đi.

Ví dụ, giả sử chương trình chặn được một đoạn báo gửi từ (`src_ip`, `src_port`) đến (`dst_ip`, `dst_port`), đoạn báo này có bit cờ ACK được đặt thành 1, số ACK là `100,000`. Chương trình tấn công tiếp theo cần:

- Vì gói tin giả mạo là phản hồi của gói tin bị chặn, nên IP/Port nguồn của gói giả mạo phải là IP/Port đích của gói bị chặn, và ngược lại.
- Đặt bit cờ `RST` của gói giả mạo thành 1, để biểu thị đây là đoạn đặt lại.
- Đặt số thứ tự của gói giả mạo bằng số ACK của gói bị chặn, vì đây là số thứ tự tiếp theo mà người gửi mong muốn nhận.
- Gọi phương thức `send` của `scapy` để gửi gói giả mạo đến người gửi của gói bị chặn.

Đối với chương trình của tôi, chỉ cần bỏ chú thích dòng này và chú thích dòng trên nó là có thể tấn công toàn diện. Thiết lập kết nối TCP theo bước 1, mở cửa sổ thứ ba để chạy chương trình tấn công, sau đó nhập một số chuỗi ký tự trong một terminal của kết nối TCP, bạn sẽ thấy kết nối TCP bị gián đoạn!

> Thử nghiệm thêm

1. Có thể tiếp tục thử nghiệm với chương trình tấn công, cộng trừ 1 vào số thứ tự của gói giả mạo để xem điều gì xảy ra, liệu có thực sự cần giống hệt số `ACK` của gói bị chặn không.
2. Mở `Wireshark`, lắng nghe giao diện mạng lo0, sử dụng bộ lọc `ip.src == 127.0.0.1 && ip.dst == 127.0.0.1 && tcp.port == 8000` để lọc dữ liệu không liên quan. Bạn có thể thấy tất cả chi tiết của kết nối TCP.
3. Gửi luồng dữ liệu nhanh hơn trên kết nối, làm cho việc tấn công khó hơn.

## Tấn công Man-in-the-Middle

Pigsy muốn tỏ tình với Xiaolan, nên viết một lá thư cho Xiaolan, nhưng Xiaohei, một người thứ ba, đã chặn lá thư này, sửa đổi nội dung của nó, từ đó gây ra sự hỗn loạn giữa họ. Người thứ ba này chính là kẻ tấn công man-in-the-middle. Tiếp tục nói về tấn công man-in-the-middle là gì.

### Tấn công man-in-the-middle là gì?

Tấn công man-in-the-middle, tiếng Anh là Man-in-the-Middle Attack, viết tắt là "MITM Attack". Chỉ cuộc tấn công mà kẻ tấn công thiết lập độc lập kết nối với cả hai đầu giao tiếp, trao đổi dữ liệu nhận được, khiến cả hai đầu giao tiếp tin rằng họ đang trực tiếp nói chuyện với nhau qua kết nối riêng tư, nhưng thực tế toàn bộ phiên bị kẻ tấn công kiểm soát hoàn toàn. Hãy vẽ một sơ đồ:

![Hình](/images/p3-juejin/d69b74e63981472b852797f2fa08976f~tplv-k3u1fbpfcp-zoom-1.png)

Từ sơ đồ này có thể thấy, kẻ tấn công man-in-the-middle thực chất là kẻ tấn công. Thông qua nguyên lý này, có nhiều ứng dụng thực tế, ví dụ như khi bạn duyệt các trang web không lành mạnh trên điện thoại, điện thoại sẽ nhắc bạn rằng trang web này có thể chứa virus, có tiếp tục truy cập không, hoặc thực hiện các thao tác khác.

### Nguyên lý của tấn công man-in-the-middle là gì?

Ví dụ, tôi và công ty ký một hợp đồng lao động, mỗi người giữ một bản. Không biết ai đó có thể đã sửa nội dung hợp đồng, không biết thật giả, phải làm sao? Chỉ còn cách tìm cơ quan chuyên nghiệp để giám định, tự nhiên phải tốn tiền.

Trong lĩnh vực bảo mật có câu: **Chúng ta không thể loại bỏ hoàn toàn tội phạm mạng, chỉ có cách tăng chi phí của tội phạm mạng**. Vì không thể loại bỏ hoàn toàn tình huống này, chúng ta chỉ còn cách tìm cách tăng chi phí phạm tội. Hôm nay hãy tìm hiểu đơn giản về kiến thức bảo mật mạng cơ bản, đây cũng là câu hỏi phỏng vấn tần suất cao.

Để tránh tình huống cả hai bên đổ lỗi cho nhau, cả hai bên đưa vào bên thứ ba, giao bản gốc hợp đồng cho cơ quan bên thứ ba đáng tin cậy. Miễn là cơ quan này không tham nhũng, hợp đồng tương đối an toàn.

**Nếu cơ quan bên thứ ba không nghiêm ngặt hoặc dễ có sơ hở thì sao?**

Mặc dù đã giao bản gốc hợp đồng cho cơ quan bên thứ ba, để ngăn nhân viên nội bộ sửa đổi, cần thực hiện biện pháp gì?

Một cách khả thi là đưa vào **thuật toán tóm tắt**. Tức là hợp đồng và tóm tắt đi cùng nhau. Để dễ hiểu tóm tắt, hãy hình dung tóm tắt là một hàm, hàm này mã hóa bản gốc, tạo ra một giá trị băm duy nhất. Một khi bản gốc thay đổi dù chỉ một chút, giá trị băm này sẽ thay đổi.

#### Các thuật toán tóm tắt phổ biến là gì?

Hiện tại các thuật toán mã hóa thường dùng bao gồm thuật toán tóm tắt tin nhắn và thuật toán băm an toàn (**SHA**). **MD5** chuyển đổi bài viết có độ dài tùy ý thành giá trị băm 128 bit. Tuy nhiên vào năm 2004, **MD5** đã được chứng minh là dễ xảy ra va chạm, tức là hai bản gốc tạo ra cùng một tóm tắt. Điều này tương đương với việc cung cấp cho hacker một cửa hậu, dễ dàng làm giả tóm tắt.

Vì vậy trong hầu hết các trường hợp sẽ chọn **thuật toán SHA**.

**Nếu xuất hiện kẻ nội gián thì sao?**

Có vẻ rất an toàn, về lý thuyết đã loại trừ việc giả mạo hợp đồng. Nhưng nếu một nhân viên nào đó có quyền sửa cả hợp đồng lẫn tóm tắt, thì gây chuyện chỉ là vấn đề thời gian. Xét cho cùng, không có hệ thống nào có thể hoàn toàn ngăn nhân viên tiếp xúc thông tin nhạy cảm, trừ khi thông tin nhạy cảm không tồn tại. Vậy có thể cân nhắc lưu trữ hợp đồng và tóm tắt tách biệt không?

**Vậy làm thế nào để đảm bảo nhân viên không sửa hợp đồng?**

Điều này thực sự khó, nhưng lúc nào cũng có cách. Chúng ta đặt hợp đồng ở cả hai bên, tóm tắt ở cơ quan bên thứ ba, khó giả mạo hơn nhiều.

**Nếu nhân viên thông đồng với một trong hai bên thì sao?**

Có vẻ đặt ở cơ quan bên thứ ba vẫn không an toàn, vẫn còn rủi ro không nhỏ. Vì vậy cần tìm giải pháp mới, đây là lúc xuất hiện **chữ ký số và chứng chỉ**.

#### Chứng chỉ số và chữ ký có tác dụng gì?

Tương tự, ví dụ. Sum và Mike ký hợp đồng. Sum trước tiên dùng thuật toán **SHA** để tính tóm tắt của hợp đồng, rồi mã hóa tóm tắt bằng khóa riêng của mình, tạo ra chữ ký số. Sum giao bản gốc hợp đồng, chữ ký, và khóa công khai cho Mike.

![](/images/p3-juejin/e4b7d6fca78b45c8840c12411b717f2f~tplv-k3u1fbpfcp-zoom-1.png)

Nếu Sum muốn chứng minh hợp đồng là của Mike, thì phải dùng khóa công khai của Mike, giải mã chữ ký này để lấy tóm tắt x, sau đó Mike tính tóm tắt SHA của bản gốc Y, rồi so sánh x và y. Nếu hai giá trị bằng nhau thì cho rằng dữ liệu không bị giả mạo.

Trong quá trình này, Mike không thể sửa hợp đồng của Sum, vì sửa hợp đồng không chỉ cần sửa bản gốc mà còn sửa tóm tắt, sửa tóm tắt cần cung cấp khóa riêng của Mike, khóa riêng là mật khẩu riêng của Sum, khóa công khai là mật khẩu Sum công bố cho người khác sử dụng.

Tóm lại, dữ liệu mã hóa bằng khóa công khai chỉ có khóa riêng mới giải mã được. Dữ liệu mã hóa bằng khóa riêng chỉ có khóa công khai mới giải mã được. Đây là **mã hóa bất đối xứng**.

Bảo vệ quyền riêng tư? Không phải dọa mọi người, thông tin là trong suốt với nhau, nhưng hãy cố gắng bảo vệ quyền riêng tư cá nhân. Hôm nay học về mã hóa đối xứng và bất đối xứng.

#### Mã hóa đối xứng là gì?

Mã hóa đối xứng, theo đúng tên, bên mã hóa và bên giải mã sử dụng cùng một chìa khóa (khóa bí mật). Cụ thể hơn, bên gửi mã hóa thông tin sắp gửi bằng thuật toán và khóa bí mật tương ứng; đối với bên nhận, sử dụng thuật toán giải mã và khóa bí mật tương tự để mở khóa thông tin, từ đó có thể đọc thông tin.

![Hình](/images/p3-juejin/ef81cb5e2f0a4d3d9ac5a44ecf97e3cc~tplv-k3u1fbpfcp-zoom-1.png)

#### Các thuật toán mã hóa đối xứng phổ biến là gì?

**DES**

DES sử dụng khóa có vẻ là 64 bit, nhưng chỉ có 56 bit trong số đó được thực sự dùng trong thuật toán, 8 bit còn lại có thể dùng để kiểm tra chẵn lẻ và bị loại bỏ trong thuật toán. Do đó, độ dài khóa hiệu quả của **DES** là 56 bit, thường gọi độ dài khóa **DES** là 56 bit. Giả sử khóa là 56 bit, dùng cách phá vỡ brute-force, số khóa là 2 lũy thừa 56, thì thời gian giải mã mỗi nano giây một lần khoảng 1 năm. Tất nhiên, không ai làm vậy. **DES** hiện không còn là phương pháp mã hóa an toàn, chủ yếu vì khóa 56 bit quá ngắn.

![](/images/p3-juejin/9eb3a2bf6cf14132a890bc3447480eeb~tplv-k3u1fbpfcp-zoom-1.jpeg)

**IDEA**

Thuật toán Mã hóa Dữ liệu Quốc tế (International Data Encryption Algorithm). Độ dài khóa 128 bit, ưu điểm không có hạn chế bằng sáng chế.

**AES**

Sau khi DES bị phá vỡ, không lâu sau **AES** được giới thiệu, cung cấp ba độ dài để lựa chọn: 128 bit, 192 bit và 256 bit. Để không ảnh hưởng quá nhiều đến hiệu suất, chọn 128 là đủ.

**SM1 và SM4**

Các loại trên đều là của nước ngoài, chúng ta trong nước tự nghiên cứu mật mã quốc gia **SM1** và **SM4**. Cả hai đều là tiêu chuẩn quốc gia, thuật toán mở. Ưu điểm là được nhà nước ủng hộ mạnh mẽ và công nhận.

**Tóm tắt**:

![](/images/p3-juejin/578961e3175540e081e1432c409b075a~tplv-k3u1fbpfcp-zoom-1.png)

#### Các thuật toán mã hóa bất đối xứng phổ biến là gì?

Trong mã hóa đối xứng, bên gửi và bên nhận sử dụng cùng một khóa bí mật. Trong mã hóa bất đối xứng, bên gửi và bên nhận sử dụng các khóa bí mật khác nhau. Vấn đề chính nó giải quyết là ngăn rò rỉ trong quá trình thỏa thuận khóa bí mật. Ví dụ trong mã hóa đối xứng, Xiaolan mã hóa tin nhắn cần gửi, sau đó báo cho bạn mật khẩu là 123balala. OK, với người khác, rất dễ chiếm đoạt mật khẩu 123balala. Trong trường hợp bất đối xứng, Xiaolan báo mật khẩu 123balala cho tất cả mọi người, nhưng với kẻ man-in-the-middle, lấy được cũng vô dụng vì không có khóa riêng. Vì vậy, khóa bất đối xứng thực ra chủ yếu giải quyết bài toán phân phối khóa. Như hình dưới:

![](/images/p3-juejin/153cf04a0ecc43c38003f3a1ab198cc0~tplv-k3u1fbpfcp-zoom-1.png)

Thực ra chúng ta thường xuyên sử dụng mã hóa bất đối xứng, ví dụ khi thiết lập nền tảng big data hadoop với nhiều máy chủ, để tiện lợi cho việc đặt đăng nhập không mật khẩu giữa nhiều máy, có liên quan đến phân phối khóa bí mật. Ví dụ khác là thiết lập cụm docker cũng sẽ sử dụng các thuật toán mã hóa bất đối xứng liên quan.

Các thuật toán mã hóa bất đối xứng phổ biến:

- RSA (Thuật toán mã hóa RSA, RSA Algorithm): Bảo mật dựa trên độ khó tính toán của việc phân tích số nguyên lớn, ứng dụng rộng rãi, tính tương thích tốt. Nhược điểm là hiệu suất tương đối chậm, khóa càng dài (như 2048/4096 bit) bảo mật càng cao, nhưng chi phí tính toán cũng tăng.

- ECC: Dựa trên đường cong elliptic. Là thuật toán mã hóa bất đối xứng có cường độ mã hóa cao nhất hiện nay.
- SM2: Cũng được thiết kế dựa trên bài toán đường cong elliptic. Ưu điểm lớn nhất là được nhà nước công nhận và ủng hộ mạnh mẽ.

Tóm tắt:

![](/images/p3-juejin/28b96fb797904d4b818ee237cdc7614c~tplv-k3u1fbpfcp-zoom-1.png)

#### Các thuật toán băm phổ biến là gì?

Phần này nên quen thuộc hơn với mọi người. Ví dụ MD5 kiểm tra mà chúng ta thường dùng, trong nhiều trường hợp, tôi không dùng nó để mã hóa, mà để lấy ID duy nhất. Trong quá trình xây dựng hệ thống, lưu trữ thông tin mật khẩu của người dùng, thường thông qua thuật toán băm, cuối cùng lưu giá trị băm của nó.

**MD5** (không khuyến nghị)

MD5 có thể được dùng để tạo tóm tắt tin nhắn 128 bit, đây là thuật toán băm được ứng dụng khá phổ biến hiện nay. Mặc dù do khiếm khuyết của thuật toán, tính duy nhất của nó đã bị phá vỡ, nhưng trong hầu hết các trường hợp điều này không gây ra vấn đề bảo mật. Tuy nhiên, nếu không bị giới hạn độ dài (32 ký tự), tôi vẫn không khuyến nghị tiếp tục sử dụng **MD5**.

**SHA**

Thuật toán băm an toàn. **SHA** bao gồm ba phiên bản **SHA-1**, **SHA-2** và **SHA-3**. Ý tưởng cơ bản của thuật toán là: nhận một đoạn dữ liệu văn bản thuần túy, chuyển đổi nó theo cách không thể đảo ngược thành mật văn có độ dài cố định. Nói đơn giản, SHA chuyển đổi dữ liệu đầu vào (tức là preimage hoặc tin nhắn) thành giá trị đầu ra có độ dài cố định ngắn hơn, gọi là giá trị băm (hoặc tóm tắt tin nhắn, mã xác thực tin nhắn). SHA-1 đã được chứng minh là không đủ an toàn, vì vậy dần được SHA-2 thay thế, còn SHA-3 là phiên bản mới nhất của dòng SHA, sử dụng cấu trúc khác (thuật toán Keccak) cung cấp bảo mật và linh hoạt cao hơn.

**SM3**

Mật mã quốc gia **SM3**. Cường độ mã hóa tương đương thuật toán SHA-256. Chủ yếu được nhà nước ủng hộ.

**Tóm tắt**:

![Hình](/images/p3-juejin/79c3c2f72d2f44c7abf2d73a49024495~tplv-k3u1fbpfcp-zoom-1.png)

**Trong hầu hết các trường hợp sử dụng mã hóa đối xứng, có bảo mật khá tốt. Nếu cần phân phối khóa bí mật theo kiểu phân tán, hãy cân nhắc bất đối xứng. Nếu không cần tính toán có thể đảo ngược thì dùng thuật toán băm.** Vì khoảng thời gian này có nhu cầu về mặt này, nên tôi đã đọc một số tài liệu liên quan. Cảm ơn mọi người đã xem!

#### Cơ quan bên thứ ba và cơ chế chứng chỉ có tác dụng gì?

Vẫn còn vấn đề, lúc này nếu Sum phủ nhận đã cung cấp khóa công khai và hợp đồng cho Mike, thì xong rồi.

Vì vậy Sum cần đủ uy tín cho những gì đã làm, điều này đưa vào **cơ quan bên thứ ba và cơ chế chứng chỉ**.

Chứng chỉ có tín dụng vì bên phát hành chứng chỉ có tín dụng. Vì vậy nếu Sum muốn Mike thừa nhận khóa công khai của mình, Sum sẽ không trực tiếp giao khóa công khai cho Mike, mà cung cấp chứng chỉ từ cơ quan bên thứ ba, có chứa khóa công khai. Nếu Mike cũng tin tưởng cơ quan này, được pháp luật công nhận, thì quan hệ tin tưởng được thiết lập.

![](/images/p3-juejin/b1a3dbf87e3e41ff894f39512a10f66d~tplv-k3u1fbpfcp-zoom-1.png)

Như hình trên, Sum nộp đơn xin của mình cho cơ quan, tạo ra bản gốc chứng chỉ. Cơ quan dùng khóa riêng của mình ký vào bản gốc đơn của Sum (trước tiên tính tóm tắt theo nội dung bản gốc, rồi mã hóa bằng khóa riêng), tạo ra chứng chỉ có thông tin chữ ký. Mike nhận được chứng chỉ có thông tin chữ ký, giải mã bằng khóa công khai của cơ quan bên thứ ba, lấy được tóm tắt chứng chỉ của Sum và bản gốc chứng chỉ. Có tóm tắt và bản gốc chứng chỉ của Sum, Mike có thể thực hiện xác minh chữ ký. Nếu xác minh thành công, Mike có thể xác nhận chứng chỉ của Sum thực sự được cơ quan bên thứ ba phát hành.

Với cơ chế này, cả hai bên ký hợp đồng đều không thể phủ nhận hợp đồng. Cốt lõi của giải pháp này là cần cơ quan dịch vụ tín dụng bên thứ ba cung cấp bảo đảm tín dụng. Điều này tạo ra một chuỗi tin tưởng cơ bản nhất. Nếu sự tin tưởng vào cơ quan bên thứ ba sụp đổ, ví dụ bị hacker tấn công, thì toàn bộ chuỗi tin tưởng cũng đứt.

Để chuỗi tin tưởng này vững chắc hơn, cần móc nối từng mắt xích, tạo ra chuỗi tin tưởng dài hơn, tránh rủi ro tin tưởng đơn điểm.

![](/images/p3-juejin/1481f0409da94ba6bb0fee69bf0996f8~tplv-k3u1fbpfcp-zoom-1.png)

Trong hình trên, cơ quan chứng chỉ gốc có uy tín tốt nhất cung cấp chứng chỉ gốc, rồi cơ quan chứng chỉ gốc ký chứng chỉ cơ quan cấp hai; cơ quan cấp hai ký chứng chỉ cơ quan cấp ba; cuối cùng cơ quan cấp ba ký chứng chỉ Sum.

Để xác minh tính hợp lệ của chứng chỉ Sum, cần dùng khóa công khai trong chứng chỉ cơ quan cấp ba để giải mã chữ ký số trên chứng chỉ Sum.

Để xác minh tính hợp lệ của chứng chỉ cơ quan cấp ba, cần dùng chứng chỉ cơ quan cấp hai để giải mã chữ ký số trên chứng chỉ cơ quan cấp ba.

Để xác minh tính hợp lệ của chứng chỉ cơ quan cấp hai, cần dùng chứng chỉ gốc để giải mã.

Trên đây tạo thành một chuỗi tin tưởng tương đối dài. Nếu một bên muốn gian lận thì rất khó, trừ khi tất cả các cơ quan trong chuỗi đồng thời liên kết để thực hiện gian lận.

### Làm thế nào để tránh tấn công man-in-the-middle?

Đã biết nguyên lý tấn công man-in-the-middle và sự nguy hiểm của nó, bây giờ hãy xem cách tránh. Tin rằng chúng ta đều đã gặp tình huống dưới đây:

![](/images/p3-juejin/0dde4b76be6240699312d822a3fe1ed3~tplv-k3u1fbpfcp-zoom-1.png)

Xuất hiện giao diện này trong nhiều trường hợp là do gặp phải hiện tượng tấn công man-in-the-middle, cần giám sát kịp thời chứng chỉ bảo mật. Và website nổi tiếng GitHub cũng từng bị tấn công man-in-the-middle:

Để tránh tấn công man-in-the-middle, hiện tại chủ yếu có hai phương pháp:

- Máy khách không nên tùy tiện tin tưởng chứng chỉ: Vì các chứng chỉ này rất có thể là kẻ man-in-the-middle.
- App có thể nhúng sẵn chứng chỉ cục bộ: Tức là chúng ta cục bộ đã có sẵn một số chứng chỉ, như vậy các chứng chỉ khác không thể phát huy tác dụng nữa.

## DDoS

Qua mô tả ở trên, tóm lại có nhiều loại tấn công đều là **tấn công DDoS**, nên hãy tóm tắt đơn giản nội dung liên quan đến cuộc tấn công này.

Thực ra, các công ty Internet lớn trên toàn cầu đều đã từng hứng chịu một lượng lớn cuộc tấn công **DDoS**.

Năm 2018, GitHub bị tấn công băng thông lên đến 1,35Tbps chỉ trong chớp mắt. Cuộc tấn công DDoS này gần như được coi là cuộc tấn công DDoS quy mô lớn nhất và mạnh nhất trong lịch sử Internet. Sau khi GitHub bị tấn công, chỉ một tuần sau, tấn công DDoS lại tiếp tục nhắm vào Google, Amazon và thậm chí Pornhub. Băng thông tấn công DDoS tiếp theo cũng đạt tối đa 1Tbps.

### Tấn công DDoS thực sự là gì?

DDoS viết tắt của Distributed Denial of Service, dịch sang tiếng Việt là **tấn công từ chối dịch vụ phân tán**. Chỉ các cuộc tấn công đồng thời từ nhiều kẻ tấn công ở các vị trí khác nhau nhắm vào một hoặc một số mục tiêu, là một loại phương thức tấn công quy mô lớn, phân tán, phối hợp. Tấn công DoS đơn lẻ thường theo phương thức một đối một, nó khai thác một số lỗ hổng trong giao thức mạng và hệ điều hành, áp dụng chiến lược **lừa đảo và giả mạo** để tấn công mạng, làm máy chủ website tràn ngập lượng lớn thông tin cần phản hồi, tiêu thụ băng thông mạng hoặc tài nguyên hệ thống, khiến mạng hoặc hệ thống quá tải đến mức tê liệt và ngừng cung cấp dịch vụ mạng bình thường.

> Ví dụ

Tôi mở một quán lẩu Trùng Khánh có 50 chỗ ngồi. Do nguyên liệu tốt, phục vụ chu đáo, khách thường đông đúc, kinh doanh rất sôi động. Còn quán lẩu của anh Ergou đối diện thì vắng khách. Để đối phó với tôi, Ergou nghĩ ra một kế, thuê 50 người đến quán lẩu của tôi ngồi nhưng không gọi món, khiến khách thực không thể ăn được.

Ví dụ trên chính là điển hình của tấn công DDoS, nói chung là chỉ kẻ tấn công sử dụng "máy tính zombie" gửi một lượng lớn yêu cầu đến website mục tiêu trong thời gian ngắn, tiêu thụ quy mô lớn tài nguyên máy chủ của website mục tiêu, khiến nó không thể phục vụ bình thường. Game trực tuyến, tài chính Internet là các lĩnh vực có tần suất tấn công DDoS cao.

Phương thức tấn công rất nhiều, ví dụ **ICMP Flood**, **UDP Flood**, **NTP Flood**, **SYN Flood**, **CC Attack**, **DNS Query Flood** v.v.

### Làm thế nào để ứng phó với tấn công DDoS?

#### Máy chủ phòng thủ cao

Vẫn lấy ví dụ quán lẩu Trùng Khánh đã mở. Máy chủ phòng thủ cao giống như tôi tăng cường hai bảo vệ cho quán lẩu Trùng Khánh. Hai bảo vệ này có thể bảo vệ cửa hàng không bị lưu manh quấy rối, và còn tuần tra định kỳ xung quanh cửa hàng để ngăn lưu manh quấy rối.

Máy chủ phòng thủ cao chủ yếu là các máy chủ có thể độc lập phòng thủ 50Gbps trở lên, có thể giúp website chống tấn công từ chối dịch vụ, quét định kỳ các nút chính của mạng, v.v. Thứ này tốt nhưng đắt~

#### Danh sách đen

Đối với lưu manh trong quán lẩu, trong cơn tức giận tôi chụp ảnh lưu hồ sơ họ và cấm họ vào cửa hàng, nhưng đôi khi gặp người trông giống cũng bị cấm vào. Đây là thiết lập danh sách đen, phương pháp này tuân theo nguyên tắc "thà giết lầm một nghìn còn hơn bỏ sót một trăm", sẽ chặn lưu lượng bình thường, ảnh hưởng đến hoạt động kinh doanh bình thường.

#### Làm sạch DDoS

**Làm sạch DDoS**, tức là tôi phát hiện khách vào quán vài phút nhưng mãi không gọi món, thì tôi đuổi họ ra.

**Làm sạch DDoS** sẽ giám sát thời gian thực dữ liệu yêu cầu của người dùng, kịp thời phát hiện các lưu lượng bất thường như tấn công **DOS**, trong điều kiện không ảnh hưởng đến hoạt động kinh doanh bình thường, làm sạch các lưu lượng bất thường này.

#### Tăng tốc CDN

Tăng tốc CDN, chúng ta có thể hiểu như sau: Để giảm thiểu lưu manh quấy rối, tôi đơn giản chuyển quán lẩu lên trực tuyến, nhận đặt giao hàng tận nhà, như vậy lưu manh không tìm được quán ở đâu, cũng không gây rối được.

Trong thực tế, dịch vụ CDN phân phối lưu lượng truy cập website đến các nút khác nhau, như vậy một mặt ẩn địa chỉ IP thực của website, mặt khác ngay cả khi bị tấn công **DDoS**, cũng có thể phân tán lưu lượng đến các nút khác nhau, ngăn nguồn gốc sụp đổ.

## Tham khảo

- Tấn công lũ HTTP - CloudFlare: <https://www.cloudflare.com/zh-cn/learning/ddos/http-flood-ddos-attack/>
- Tấn công lũ SYN: <https://www.cloudflare.com/zh-cn/learning/ddos/syn-flood-ddos-attack/>
- Giả mạo IP là gì?: <https://www.cloudflare.com/zh-cn/learning/ddos/glossary/ip-spoofing/>
- Lũ DNS là gì? | Tấn công DDoS lũ DNS: <https://www.cloudflare.com/zh-cn/learning/ddos/dns-flood-ddos-attack/>

<!-- @include: @article-footer.snippet.md -->
