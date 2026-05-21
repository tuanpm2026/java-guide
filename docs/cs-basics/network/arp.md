---
title: Giải thích chi tiết giao thức ARP（Tầng mạng）
description: Giải thích cơ chế phân giải địa chỉ và quy trình xử lý message của ARP, kết hợp ARP table và broadcast/unicast để phân tích chi tiết các tấn công và chiến lược phòng thủ phổ biến.
category: Kiến thức cơ bản máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: ARP,phân giải địa chỉ,IP sang MAC,broadcast query,unicast response,ARP table,ARP spoofing
---

Mỗi khi học một giao thức mạng mới, cần đặt nó vào mô hình OSI 7 tầng hoặc TCP/IP protocol stack để học: thứ nhất là học vị trí của giao thức trong toàn bộ protocol stack; thứ hai là học giao thức đó giải quyết vấn đề gì, vai trò của nó; thứ ba là học nguyên lý hoạt động và các chi tiết sâu hơn.

**Giao thức ARP** có thể nói là một giao thức **khá low-level, rất quan trọng và lại rất đơn giản** trong protocol stack.

Trước khi đọc bài này, hãy xem qua một vài câu hỏi sau:

1. **Vị trí của ARP trong protocol stack?** Vị trí của ARP trong protocol stack rất quan trọng. Sau khi hiểu nguyên lý hoạt động, rất khó nói ARP thuộc tầng mạng hay tầng liên kết, vì nó kết nối chính xác tầng mạng và tầng liên kết. Hầu hết các tài liệu nước ngoài đặt ARP ở tầng mạng.
2. **ARP giải quyết vấn đề gì, vai trò như thế nào?** ARP, tên đầy đủ là **Address Resolution Protocol (Giao thức phân giải địa chỉ)**, giải quyết vấn đề chuyển đổi giữa địa chỉ tầng mạng (IP) và địa chỉ tầng liên kết (MAC). Vì trong quá trình truyền vật lý của IP datagram, luôn cần biết hop tiếp theo (đích vật lý tiếp theo) là ở đâu, nhưng địa chỉ IP là địa chỉ logic còn MAC mới là địa chỉ vật lý, ARP giải quyết một số vấn đề chuyển đổi IP → MAC.
3. **Nguyên lý hoạt động của ARP?** Chỉ cần nhớ ba từ khóa: **ARP table, broadcast query, unicast response**.

## MAC Address

Trước khi giới thiệu giao thức ARP, cần giới thiệu về MAC address.

MAC address, tên đầy đủ là **Media Access Control Address (Địa chỉ kiểm soát truy cập phương tiện)**. Nếu mọi tài nguyên trên Internet được xác định duy nhất bởi địa chỉ IP (nội dung giao thức IP), thì mọi thiết bị mạng đều được xác định duy nhất bởi MAC address.

![Mặt sau router thường ghi MAC address](/images/github/javaguide/cs-basics/network/router-back-will-indicate-mac-address.png)

Có thể hiểu MAC address là số CMND thực sự của thiết bị mạng, IP address chỉ là cách định vị không trùng lặp (ví dụ "Nguyễn Văn A ở tỉnh X thành phố Y phường Z" là định vị logic tức là địa chỉ IP, số CMND của họ mới là MAC address). Cũng có thể hiểu MAC address là số CMND, IP address là địa chỉ bưu chính. MAC address còn có các tên gọi khác như LAN address, physical address, Ethernet address, v.v.

> Một điều cần biết nữa là không chỉ tài nguyên mạng mới có IP address, thiết bị mạng cũng có IP address, ví dụ router. Nhưng về mặt cấu trúc, vai trò của các thiết bị mạng như router là tạo thành một mạng, thường là mạng nội bộ, nên IP address chúng dùng thường là IP nội bộ. Khi thiết bị trong mạng nội bộ giao tiếp với thiết bị ngoài mạng nội bộ, cần dùng giao thức NAT.

MAC address dài 6 byte (48 bit), không gian địa chỉ có tới 280 nghìn tỷ ($2^{48}$). MAC address được IEEE quản lý và phân phối tập trung. Về lý thuyết, MAC address trên card mạng của một thiết bị mạng là vĩnh viễn. Các nhà sản xuất card mạng khác nhau mua không gian MAC address của mình từ IEEE (24 bit đầu của MAC), tức là 24 bit đầu do IEEE quản lý tập trung, đảm bảo không trùng lặp. Còn 24 bit sau do mỗi nhà sản xuất tự quản lý, cũng đảm bảo hai card mạng sản xuất ra không có MAC address trùng nhau.

MAC address có tính di động và vĩnh viễn. Giống như số CMND vĩnh viễn xác định danh tính một người, dù đi đâu cũng không thay đổi. Còn IP address không có các tính chất này, khi một thiết bị thay đổi mạng, IP address của nó có thể thay đổi, tức là vị trí của nó trên Internet thay đổi.

Cuối cùng, cần nhớ MAC address có một địa chỉ đặc biệt: `FF-FF-FF-FF-FF-FF` (toàn bit 1), địa chỉ này là broadcast address.

## Nguyên lý hoạt động của ARP

Khi ARP hoạt động có một tiền đề lớn, đó là **ARP table**.

Trong một LAN, mỗi thiết bị mạng tự duy trì một ARP table của mình. ARP table ghi lại ánh xạ IP address — MAC address của một số thiết bị mạng khác, ánh xạ này được lưu dưới dạng tuple ba phần tử `<IP, MAC, TTL>`. Trong đó, TTL là vòng đời của ánh xạ, giá trị điển hình là 20 phút, quá thời gian này entry sẽ bị xóa.

Nguyên lý hoạt động của ARP sẽ được thảo luận trong hai kịch bản:

1. **Tìm MAC address trong cùng một LAN**;
2. **Tìm địa chỉ thiết bị mạng từ LAN này sang LAN khác**.

### Tìm MAC address trong cùng một LAN

Giả sử có kịch bản sau: host A có IP address `137.196.7.23` muốn gửi IP datagram đến host B có IP address `137.196.7.14` trong cùng một LAN.

> Nhấn mạnh lại: khi host gửi IP datagram (tầng mạng), chỉ biết IP address đích, không biết MAC address đích. ARP chính là để giải quyết vấn đề này.

Để đạt được mục tiêu này, host A phải dùng giao thức ARP để lấy MAC address của host B, rồi đóng gói IP datagram thành frame tầng liên kết và gửi đến hop tiếp theo. Trong LAN này, các sự kiện diễn ra theo thứ tự thời gian như sau:

1. Host A tra cứu ARP table của mình, phát hiện không có entry ánh xạ cho IP address của host B, tức không biết MAC address của host B.

2. Host A tạo một ARP query packet và broadcast ra LAN đang ở.

   ARP packet là loại message đặc biệt. ARP packet có hai loại: query packet và response packet, cả hai có cùng format, đều chứa IP address và MAC address của bên gửi và bên nhận. Tất nhiên trong query packet, IP address gửi là IP của host A, IP address nhận là IP của host B, MAC address gửi cũng là MAC của host A, nhưng MAC address nhận tuyệt đối không phải MAC của host B (vì đây chính xác là điều ta đang hỏi!), mà là một giá trị đặc biệt — `FF-FF-FF-FF-FF-FF`. Như đã nói, MAC address này là broadcast address, tức query packet sẽ được broadcast đến tất cả thiết bị trong LAN.

3. Query packet do host A tạo sẽ được broadcast trong LAN. Về lý thuyết, mỗi thiết bị đều nhận được packet đó và kiểm tra xem IP address nhận trong query packet có phải IP của mình không. Nếu có, nghĩa là query packet đã đến host B; nếu không, query packet vô dụng với thiết bị hiện tại, bỏ qua.

4. Host B nhận query packet, xác nhận là hỏi mình, rồi tạo ARP response packet, packet này chỉ có một đích đến — host A, và gửi cho host A. Đồng thời host B trích xuất thông tin IP address và MAC address từ query packet, tạo entry ánh xạ IP-MAC của host A trong ARP table của mình.

   ARP response packet có cấu trúc giống ARP query packet, khác là IP address gửi và nhận ngược lại, MAC address gửi là của bản thân bên gửi, MAC address đích là của bên gửi query packet. Tức là ARP response packet chỉ có một đích đến, không phải broadcast.

5. Host A cuối cùng sẽ nhận response packet của host B, trích xuất thông tin IP address và MAC address trong packet đó, tạo thông tin ánh xạ và thêm vào ARP table của mình.

![](./images/arp/arp_same_lan.png)

Trong toàn bộ quá trình, có một số điểm cần bổ sung:

1. Nếu host A muốn gửi IP datagram cho host B và thông tin ánh xạ IP-MAC của host B đã có trong ARP table của host A, thì host A không cần broadcast, chỉ cần trích xuất MAC address và tạo frame tầng liên kết để gửi.
2. Thông tin ánh xạ trong ARP table có vòng đời, giá trị điển hình là 20 phút.
3. Sau khi host đích nhận query message do host hỏi tạo ra, sẽ trước tiên lưu ánh xạ IP-MAC của host hỏi vào ARP table của mình, nhờ đó mới lấy được MAC address đích để response, gửi response packet thuận lợi.

Tóm lại, ARP là giao thức **broadcast query, unicast response**.

### Tìm MAC address trong LAN khác

Phức tạp hơn là khi host A gửi và host B nhận không ở cùng một subnet. Giả sử kịch bản phổ biến, hai subnet của hai host được kết nối bởi một router. Cần lưu ý: thông thường nói thiết bị mạng có một IP address và một MAC address, nói chính xác hơn thì đây là một interface. Router là thiết bị liên kết mạng, có nhiều interface, mỗi interface cũng cần có IP address và MAC address không trùng lặp. Do đó khi bàn về ARP table, các interface của router đều tự duy trì ARP table riêng, không phải cả router chỉ có một ARP table.

Tiếp theo, nhìn lại tìm MAC address trong cùng subnet: nếu host A gửi broadcast query packet, thì tất cả thiết bị (interface) trong subnet của A đều nhận được packet đó, vì IP đích của packet và IP của host A gửi cùng subnet. Nhưng khi IP đích không cùng subnet với A, sẽ không có thiết bị nào trong subnet của A nhận packet đó thành công. Vậy host A nên gửi query packet như thế nào? Các sự kiện diễn ra theo thứ tự thời gian như sau:

1. Host A tra cứu ARP table, muốn tìm MAC address của interface router mục tiêu trong subnet của mình.

   Router mục tiêu là router có thể chuyển tiếp message đến subnet của B, dựa trên IP address của host B đích để phân tích subnet B đang ở.

2. Host A không tìm được MAC address của interface router mục tiêu trong subnet của mình, sẽ dùng ARP để hỏi MAC address đó. Vì interface mục tiêu và host A cùng subnet, quá trình này giống với tìm MAC address trong cùng LAN.

3. Host A lấy được MAC address của interface mục tiêu, trước tiên tạo IP datagram với source IP là IP của A, destination IP là IP của B, rồi tạo frame tầng liên kết với source MAC là MAC của A, destination MAC là **MAC address của interface kết nối với router trong subnet này**. Host A sẽ gửi frame tầng liên kết này theo unicast đến interface mục tiêu.

4. Interface mục tiêu nhận frame tầng liên kết từ host A gửi, phân tích, tra cứu forwarding table theo IP address đích, chuyển tiếp IP datagram đến interface kết nối với subnet của host B.

   Đến đây, frame đã chuyển từ subnet của host A sang subnet của host B.

5. Interface router tra cứu ARP table, muốn tìm MAC address của host B.

6. Nếu interface router không tìm được MAC address của host B, sẽ dùng giao thức ARP, broadcast query, unicast response để lấy MAC address của host B.

7. Interface router đóng gói lại IP datagram thành frame tầng liên kết, destination MAC address là MAC address của host B, gửi unicast đến đích.

![](./images/arp/arp_different_lan.png)

<!-- @include: @article-footer.snippet.md -->
