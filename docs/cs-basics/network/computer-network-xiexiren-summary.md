---
title: Tóm tắt nội dung "Mạng máy tính" (Tạ Hy Nhân)
description: Ghi chú học tập dựa trên giáo trình "Mạng máy tính", tổng hợp các thuật ngữ và mô hình phân lớp cùng các kiến thức cốt lõi, thuận tiện cho ôn tập cuối kỳ và củng cố phỏng vấn.
category: Cơ bản máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: 计算机网络,谢希仁,术语,分层模型,链路,主机,教材总结
---

Bài viết này được tôi tổng hợp trong thời gian học mạng máy tính năm hai đại học, phần lớn nội dung đến từ cuốn [《Mạng máy tính》 phiên bản thứ 7 của thầy Tạ Hy Nhân](https://www.elias.ltd/usr/local/etc/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C%EF%BC%88%E7%AC%AC7%E7%89%88%EF%BC%89%E8%B0%A2%E5%B8%8C%E4%BB%81.pdf). Để nội dung dễ hiểu hơn, tôi đã cấu trúc lại những ghi chú trước đây và thêm một số hình minh họa liên quan để dễ hiểu hơn.

![](https://oss.javaguide.cn/p3-juejin/fb5d8645cd55484ab0177f25a13e97db~tplv-k3u1fbpfcp-zoom-1.png)

Câu hỏi liên quan: [Bạn đánh giá như thế nào về cuốn Mạng máy tính (phiên bản thứ 7) của Tạ Hy Nhân? - Zhihu](https://www.zhihu.com/question/327872966).

## 1. Tổng quan về mạng máy tính

### 1.1. Thuật ngữ cơ bản

1. **Nút (node)**: Nút trong mạng có thể là máy tính, hub, switch hoặc router v.v.
2. **Liên kết (link)**: Một đoạn đường vật lý từ nút này đến nút khác. Không có bất kỳ nút nào khác ở giữa.
3. **Host**: Máy tính kết nối trên Internet.
4. **ISP (Internet Service Provider)**: Nhà cung cấp dịch vụ Internet.

   ![ISP (Internet Service Provider) Definition](https://oss.javaguide.cn/p3-juejin/e77e26123d404d438d0c5943e3c65893~tplv-k3u1fbpfcp-zoom-1.png)

5. **IXP (Internet eXchange Point)**: Điểm trao đổi Internet. Chức năng chính của IXP là cho phép hai mạng kết nối trực tiếp và trao đổi gói tin, mà không cần phải chuyển tiếp gói tin qua mạng thứ ba.

   ![IXP Traffic Levels During the Stratos Skydive — RIPE Labs](https://oss.javaguide.cn/p3-juejin/7f9a6ddaa09441ceac11cb77f7a69d8f~tplv-k3u1fbpfcp-zoom-1.png)

   <p style="text-align:center;font-size:13px;color:gray">https://labs.ripe.net/Members/fergalc/ixp-traffic-during-stratos-skydive</p>

6. **RFC (Request For Comments)**: Có nghĩa là "Yêu cầu nhận xét", chứa hầu hết các tài liệu văn bản quan trọng về Internet.
7. **Mạng diện rộng WAN (Wide Area Network)**: Nhiệm vụ là vận chuyển dữ liệu do host gửi qua khoảng cách dài.
8. **Mạng đô thị MAN (Metropolitan Area Network)**: Dùng để kết nối nhiều mạng cục bộ lại với nhau.
9. **Mạng cục bộ LAN (Local Area Network)**: Hầu hết trường học hoặc doanh nghiệp đều có nhiều mạng cục bộ được kết nối với nhau.

   ![MAN & WMAN | Red de área metropolitana, Redes informaticas, Par trenzado](https://oss.javaguide.cn/p3-juejin/eb48d21b2e984a63a26250010d7adac4~tplv-k3u1fbpfcp-zoom-1.png)

   <p style="text-align:center;font-size:13px;color:gray">http://conexionesmanwman.blogspot.com/</p>

10. **Mạng cá nhân PAN (Personal Area Network)**: Mạng kết nối các thiết bị điện tử cá nhân bằng công nghệ không dây tại nơi làm việc cá nhân.

    ![Advantages and disadvantages of personal area network (PAN) - IT Release](https://oss.javaguide.cn/p3-juejin/54bd7b420388494fbe917e3c9c13f1a7~tplv-k3u1fbpfcp-zoom-1.png)

    <p style=”text-align:center;font-size:13px;color:gray”>https://www.itrelease.com/2018/07/advantages-and-disadvantages-of-personal-area-network-pan/</p>

11. **Gói tin (packet)**: Đơn vị dữ liệu truyền trên Internet. Gồm header và data segment. Gói tin còn gọi là packet, header còn gọi là packet header.
12. **Lưu và chuyển tiếp (store and forward)**: Router nhận một gói tin, kiểm tra xem gói tin có đúng không và lọc bỏ các gói lỗi xung đột. Sau khi xác định gói đúng, lấy địa chỉ đích, tra bảng để tìm địa chỉ cổng đầu ra muốn gửi, sau đó gửi gói đó đi.

    ![](https://oss.javaguide.cn/p3-juejin/addb6b2211444a4da9e0ffc129dd444f~tplv-k3u1fbpfcp-zoom-1.gif)

13. **Băng thông (bandwidth)**: Trong mạng máy tính, biểu thị "tốc độ dữ liệu tối đa" có thể truyền từ điểm này đến điểm khác trong mạng trong đơn vị thời gian. Thường dùng để biểu thị khả năng truyền dữ liệu của đường truyền mạng. Đơn vị là "bit mỗi giây", ký hiệu là b/s.
14. **Thông lượng (throughput)**: Biểu thị lượng dữ liệu đi qua một mạng nhất định (hoặc kênh, giao diện) trong đơn vị thời gian. Thông lượng thường được dùng để đo lường mạng trong thế giới thực, để biết thực tế có bao nhiêu dữ liệu có thể đi qua mạng. Thông lượng bị giới hạn bởi băng thông hoặc tốc độ danh định của mạng.

### 1.2. Tổng hợp các điểm kiến thức quan trọng

1. **Mạng máy tính (gọi tắt là mạng) kết nối nhiều máy tính lại với nhau, còn Internet kết nối nhiều mạng lại với nhau, là mạng của các mạng.**
2. Internet viết chữ thường (internet) là danh từ chung, chỉ mạng được tạo thành từ nhiều mạng máy tính kết nối với nhau. Giao thức truyền thông giữa các mạng này có thể là bất kỳ. Internet viết hoa chữ đầu (Internet) là danh từ riêng, chỉ mạng cụ thể lớn nhất thế giới, mở, được tạo thành từ nhiều mạng kết nối với nhau, sử dụng giao thức TCP/IP làm quy tắc truyền thông, tiền thân là ARPANET. Tên dịch khuyến nghị của Internet là "Nhân đặc mạng", hiện nay thường gọi là Internet.
3. Router là thành phần then chốt để thực hiện packet switching, nhiệm vụ của nó là chuyển tiếp các gói nhận được, đây là chức năng quan trọng nhất của phần lõi mạng. Packet switching sử dụng công nghệ lưu và chuyển tiếp, tức là chia một bản tin (toàn bộ khối dữ liệu cần gửi) thành nhiều gói trước khi truyền. Trước khi gửi bản tin, trước tiên chia bản tin dài thành các đoạn dữ liệu bằng nhau nhỏ hơn. Thêm header bao gồm thông tin điều khiển cần thiết vào đầu mỗi đoạn dữ liệu, tạo thành một gói tin. Gói tin còn gọi là packet. Gói tin là đơn vị dữ liệu truyền trên Internet, chính vì header của gói tin chứa thông tin điều khiển quan trọng như địa chỉ đích và địa chỉ nguồn, mỗi gói tin mới có thể chọn đường truyền độc lập trên Internet và được giao đúng đến điểm cuối truyền gói.
4. Internet có thể chia thành phần biên và phần lõi theo cách hoạt động. Host ở phần biên của mạng, vai trò là xử lý thông tin. Phần lõi bao gồm nhiều mạng và các router kết nối các mạng này, vai trò là cung cấp kết nối và switching.
5. Truyền thông máy tính là truyền thông giữa các process (tức là các chương trình đang chạy) trong máy tính. Phương thức truyền thông mà mạng máy tính sử dụng là phương thức client-server (C/S) và phương thức peer-to-peer (P2P).
6. Cả client và server đều chỉ các process ứng dụng liên quan trong truyền thông. Client là bên yêu cầu dịch vụ, server là bên cung cấp dịch vụ.
7. Theo phạm vi hoạt động khác nhau, mạng máy tính chia thành mạng diện rộng WAN, mạng đô thị MAN, mạng cục bộ LAN, mạng cá nhân PAN.
8. **Các chỉ số hiệu năng phổ biến nhất của mạng máy tính là: tốc độ, băng thông, thông lượng, độ trễ (độ trễ gửi, độ trễ xử lý, độ trễ hàng đợi), tích độ trễ băng thông, thời gian khứ hồi và tỷ lệ sử dụng kênh.**
9. Giao thức mạng, tức là giao thức, là các quy tắc được thiết lập để thực hiện trao đổi dữ liệu trong mạng. Các lớp của mạng máy tính và tập hợp giao thức của chúng gọi là kiến trúc mạng.
10. **Kiến trúc năm lớp bao gồm lớp ứng dụng, lớp vận chuyển, lớp mạng (lớp internet), lớp liên kết dữ liệu, lớp vật lý. Giao thức quan trọng nhất của lớp vận chuyển là TCP và UDP, giao thức quan trọng nhất của lớp mạng là IP.**

![](https://oss.javaguide.cn/p3-juejin/acec0fa44041449b8088872dcd7c0b3a~tplv-k3u1fbpfcp-zoom-1.gif)

Nội dung sau sẽ giới thiệu kiến trúc năm lớp của mạng máy tính: **Lớp vật lý + Lớp liên kết dữ liệu + Lớp mạng (Lớp internet) + Lớp vận chuyển + Lớp ứng dụng**.

## 2. Lớp vật lý (Physical Layer)

![Lớp vật lý](https://oss.javaguide.cn/p3-juejin/cf1bfdd36e5f4bde94aea44bbe7a6f8a~tplv-k3u1fbpfcp-zoom-1.png)

### 2.1. Thuật ngữ cơ bản

1. **Dữ liệu (data)**: Thực thể mang thông điệp.
2. **Tín hiệu (signal)**: Biểu hiện điện hoặc điện từ của dữ liệu. Hay nói cách khác, tín hiệu là đối tượng phù hợp để truyền trên môi trường truyền dẫn.
3. **Phần tử mã (code)**: Khi dùng dạng sóng trong miền thời gian (hay còn gọi tắt là miền thời gian) để biểu diễn tín hiệu số, dạng sóng cơ bản biểu diễn các giá trị rời rạc khác nhau.
4. **Đơn công (simplex)**: Chỉ có thể truyền thông theo một hướng mà không có tương tác theo hướng ngược lại.
5. **Bán song công (half duplex)**: Cả hai bên truyền thông đều có thể gửi thông tin, nhưng không thể gửi đồng thời (tất nhiên cũng không thể nhận đồng thời).
6. **Song công toàn phần (full duplex)**: Cả hai bên truyền thông có thể gửi và nhận thông tin cùng lúc.

   ![](https://oss.javaguide.cn/p3-juejin/b1f02095b7c34eafb3c255ee81f58c2a~tplv-k3u1fbpfcp-zoom-1.png)

7. **Méo tín hiệu (distortion)**: Mất tính trung thực, chủ yếu là tín hiệu nhận được khác với tín hiệu gửi, có mài mòn và suy hao. Các yếu tố ảnh hưởng đến mức độ méo: 1. Tốc độ truyền phần tử mã 2. Khoảng cách truyền tín hiệu 3. Nhiễu 4. Chất lượng môi trường truyền dẫn

   ![](https://oss.javaguide.cn/p3-juejin/f939342f543046459ffabdc476f7bca4~tplv-k3u1fbpfcp-zoom-1.png)

8. **Tiêu chuẩn Nyquist (Nyquist criterion)**: Trong bất kỳ kênh nào, hiệu quả truyền phần tử mã có giới hạn trên, nếu tốc độ truyền vượt quá giới hạn trên này, sẽ xảy ra vấn đề nhiễu liên phần tử mã nghiêm trọng, khiến việc phán đoán (tức nhận dạng) phần tử mã ở phía thu trở nên không thể.
9. **Định lý Shannon (Shannon theorem)**: Trong kênh bị giới hạn băng thông và có nhiễu, để không tạo ra lỗi, tốc độ truyền dữ liệu thông tin có giới hạn trên.
10. **Tín hiệu baseband (baseband signal)**: Tín hiệu từ nguồn. Chỉ tín hiệu số hoặc tín hiệu tương tự chưa được điều chế.
11. **Tín hiệu bandpass (bandpass signal)**: Tín hiệu baseband được điều chế sóng mang, dịch chuyển dải tần tín hiệu lên dải tần cao hơn để truyền trong kênh (tức chỉ có thể đi qua kênh trong một dải tần nhất định), tín hiệu sau khi điều chế là tín hiệu bandpass.
12. **Điều chế (modulation)**: Quá trình xử lý thông tin từ nguồn tín hiệu rồi thêm vào tín hiệu sóng mang, biến nó thành dạng phù hợp để truyền trong kênh.
13. **Tỷ số tín hiệu trên nhiễu (signal-to-noise ratio)**: Tỷ lệ giữa công suất trung bình của tín hiệu và công suất trung bình của nhiễu, ký hiệu là S/N. SNR (dB) = 10\*log10(S/N).
14. **Ghép kênh (channel multiplexing)**: Nhiều người dùng chia sẻ cùng một kênh. (Không nhất thiết phải cùng lúc).

    ![Công nghệ ghép kênh](https://oss.javaguide.cn/p3-juejin/5d9bf7b3db324ae7a88fcedcbace45d8~tplv-k3u1fbpfcp-zoom-1.png)

15. **Tốc độ bit (bit rate)**: Số bit được truyền trong đơn vị thời gian (mỗi giây).
16. **Tốc độ baud (baud rate)**: Số lần thay đổi trạng thái điều chế sóng mang trong đơn vị thời gian. Đối với tốc độ điều chế của tín hiệu dữ liệu lên sóng mang.
17. **Ghép kênh (multiplexing)**: Phương pháp chia sẻ kênh.
18. **ADSL (Asymmetric Digital Subscriber Line)**: Đường dây thuê bao số không đối xứng.
19. **Mạng lai quang-đồng trục (HFC network)**: Một loại mạng truy cập băng rộng dân dụng được phát triển trên cơ sở mạng truyền hình cáp hiện có có phạm vi bao phủ rộng.

### 2.2. Tổng hợp các điểm kiến thức quan trọng

1. **Nhiệm vụ chính của lớp vật lý là xác định một số đặc tính liên quan đến giao diện với môi trường truyền dẫn, như đặc tính cơ học, đặc tính điện, đặc tính chức năng, đặc tính quy trình.**
2. Một hệ thống truyền thông dữ liệu có thể chia thành ba phần: hệ thống nguồn, hệ thống truyền dẫn, hệ thống đích. Hệ thống nguồn bao gồm điểm nguồn (hoặc trạm nguồn, nguồn thông tin) và bộ phát, hệ thống đích bao gồm bộ thu và điểm đích.
3. **Mục đích của truyền thông là truyền thông điệp. Giọng nói, văn bản, hình ảnh v.v. đều là thông điệp, dữ liệu là thực thể mang thông điệp. Tín hiệu là biểu hiện điện hoặc điện từ của dữ liệu.**
4. Theo cách lấy giá trị của tham số biểu diễn thông điệp trong tín hiệu khác nhau, tín hiệu có thể chia thành tín hiệu tương tự (hoặc tín hiệu liên tục) và tín hiệu số (hoặc tín hiệu rời rạc). Khi dùng dạng sóng trong miền thời gian để biểu diễn tín hiệu số, dạng sóng cơ bản biểu diễn các giá trị rời rạc khác nhau gọi là phần tử mã.
5. Theo phương thức trao đổi thông tin giữa hai bên, truyền thông có thể chia thành truyền thông một chiều (hoặc truyền thông đơn công), truyền thông hai chiều xen kẽ (hoặc truyền thông bán song công), truyền thông hai chiều đồng thời (truyền thông song công toàn phần).
6. Tín hiệu từ nguồn gọi là tín hiệu baseband. Tín hiệu cần điều chế để truyền trên kênh. Điều chế có baseband modulation và bandpass modulation. Các phương pháp bandpass modulation cơ bản nhất là điều biên, điều tần và điều pha. Còn có các phương pháp điều chế phức tạp hơn, như điều chế biên độ vuông góc (QAM).
7. Để nâng cao tốc độ truyền dữ liệu trên kênh, có thể sử dụng môi trường truyền dẫn tốt hơn hoặc sử dụng kỹ thuật điều chế tiên tiến. Nhưng tốc độ truyền dữ liệu không thể tăng tùy ý.
8. Môi trường truyền dẫn có thể chia thành hai loại: môi trường truyền dẫn có dẫn hướng (dây xoắn đôi, cáp đồng trục, cáp quang) và môi trường truyền dẫn không có dẫn hướng (không dây, hồng ngoại, laser khí quyển).
9. Để sử dụng hiệu quả tài nguyên cáp quang, mạng quang thụ động PON được sử dụng rộng rãi giữa đường trục cáp quang và người dùng. Mạng quang thụ động không cần nguồn điện, chi phí vận hành và quản lý lâu dài rất thấp. Mạng quang thụ động phổ biến nhất là EPON (Ethernet PON) và GPON (Gigabit PON).

### 2.3. Bổ sung

#### 2.3.1. Lớp vật lý làm gì?

Lớp vật lý chủ yếu làm việc là **truyền trong suốt luồng bit**. Cũng có thể mô tả nhiệm vụ chính của lớp vật lý là xác định một số đặc tính của giao diện với môi trường truyền dẫn, tức là: đặc tính cơ học (một số thuộc tính vật lý của đầu nối giao diện như hình dạng và kích thước), đặc tính điện (phạm vi điện áp xuất hiện trên các đường cáp giao diện), đặc tính chức năng (ý nghĩa của một mức điện áp nhất định xuất hiện trên một đường nào đó), đặc tính quy trình (thứ tự xuất hiện của các sự kiện khả thi cho các chức năng khác nhau).

**Lớp vật lý xem xét cách truyền luồng bit dữ liệu trên môi trường truyền dẫn kết nối các loại máy tính, chứ không phải chỉ môi trường truyền dẫn cụ thể.** Trong các mạng máy tính hiện tại, các loại thiết bị phần cứng và môi trường truyền dẫn rất đa dạng, và phương tiện truyền thông cũng có nhiều cách khác nhau. Vai trò của lớp vật lý chính là che giấu sự khác biệt của các môi trường truyền dẫn và phương tiện truyền thông này càng nhiều càng tốt, để lớp liên kết dữ liệu phía trên lớp vật lý không cảm nhận được những sự khác biệt này, cho phép lớp liên kết dữ liệu chỉ cần xem xét việc hoàn thành giao thức và dịch vụ của lớp riêng mình, mà không cần quan tâm môi trường truyền dẫn và phương tiện truyền thông cụ thể của mạng là gì.

#### 2.3.2. Một số kỹ thuật ghép kênh thường dùng

1. **Ghép kênh phân chia tần số (FDM - Frequency Division Multiplexing)**: Tất cả người dùng chiếm các tài nguyên băng thông khác nhau cùng lúc.
2. **Ghép kênh phân chia thời gian (TDM - Time Division Multiplexing)**: Tất cả người dùng chiếm cùng một băng thông tần số ở các thời điểm khác nhau (phân chia thời gian không phân chia tần số).
3. **Ghép kênh phân chia thời gian thống kê (Statistic TDM)**: TDM cải tiến, có thể cải thiện đáng kể tỷ lệ sử dụng kênh.
4. **Ghép kênh phân chia mã (CDM - Code Division Multiplexing)**: Người dùng sử dụng các kiểu mã khác nhau được chọn đặc biệt, do đó các người dùng không gây nhiễu cho nhau. Tín hiệu do hệ thống này gửi có khả năng chống nhiễu rất mạnh, phổ của nó tương tự nhiễu trắng, không dễ bị kẻ thù phát hiện.
5. **Ghép kênh phân chia bước sóng (WDM - Wavelength Division Multiplexing)**: Ghép kênh phân chia bước sóng chính là ghép kênh phân chia tần số của ánh sáng.

#### 2.3.3. Một số kỹ thuật truy cập băng rộng thường dùng, chủ yếu là ADSL và FTTx

Các phương pháp truy cập băng rộng từ người dùng đến Internet bao gồm ADSL không đối xứng (sử dụng kỹ thuật số để cải tạo đường điện thoại tương tự hiện có, không cần đi dây lại. Phiên bản nhanh của ADSL là VDSL - Very high speed Digital Subscriber Line), mạng lai quang-đồng trục HFC (loại mạng truy cập băng rộng dân dụng được phát triển trên cơ sở mạng truyền hình cáp hiện có có phạm vi bao phủ rộng) và FTTx (tức là cáp quang đến...).

## 3. Lớp liên kết dữ liệu (Data Link Layer)

![Lớp liên kết dữ liệu](https://oss.javaguide.cn/p3-juejin/83ec6dafc8c14ca185bafb656d86f0b2~tplv-k3u1fbpfcp-zoom-1.png)

### 3.1. Thuật ngữ cơ bản

1. **Liên kết (link)**: Một đoạn đường vật lý từ nút này đến nút lân cận.
2. **Liên kết dữ liệu (data link)**: Thêm phần cứng và phần mềm thực hiện giao thức kiểm soát truyền dữ liệu vào liên kết là tạo thành liên kết dữ liệu.
3. **Kiểm tra dư vòng CRC (Cyclic Redundancy Check)**: Để đảm bảo độ tin cậy của truyền dữ liệu, CRC là một kỹ thuật phát hiện lỗi được sử dụng rộng rãi trong lớp liên kết dữ liệu.
4. **Khung (frame)**: Một đơn vị truyền của lớp liên kết dữ liệu, bao gồm một header lớp liên kết dữ liệu và PDU gói được mang theo.
5. **MTU (Maximum Transfer Unit)**: Đơn vị truyền tối đa. Giới hạn trên của độ dài phần dữ liệu của khung.
6. **Tỷ lệ lỗi bit BER (Bit Error Rate)**: Trong một khoảng thời gian, tỷ lệ bit truyền sai trong tổng số bit được truyền.
7. **PPP (Point-to-Point Protocol)**: Giao thức điểm-điểm. Tức là giao thức lớp liên kết dữ liệu được sử dụng khi máy tính người dùng giao tiếp với ISP. Dưới đây là sơ đồ khung PPP:
   ![PPP](https://oss.javaguide.cn/p3-juejin/6b0310d3103c4149a725a28aaf001899~tplv-k3u1fbpfcp-zoom-1.jpeg)
8. **Địa chỉ MAC (Media Access Control hoặc Medium Access Control)**: Dịch nghĩa là kiểm soát truy cập phương tiện, hay còn gọi là địa chỉ vật lý, địa chỉ phần cứng, dùng để xác định vị trí của thiết bị mạng. Trong mô hình OSI, lớp 3 mạng chịu trách nhiệm địa chỉ IP, lớp 2 liên kết dữ liệu chịu trách nhiệm địa chỉ MAC. Do đó một host sẽ có một địa chỉ MAC, và mỗi vị trí mạng sẽ có một địa chỉ IP riêng dành cho nó. Địa chỉ là định danh quan trọng để nhận dạng một hệ thống, "tên chỉ ra tài nguyên chúng ta đang tìm kiếm, địa chỉ chỉ ra nơi tài nguyên đang ở, routing cho chúng ta biết cách đến đó."

   ![ARP (Address Resolution Protocol) explained](https://oss.javaguide.cn/p3-juejin/057b83e7ec5b4c149e56255a3be89141~tplv-k3u1fbpfcp-zoom-1.png)

9. **Bridge (cầu nối)**: Thiết bị kết nối mạng dùng để relay ở lớp liên kết dữ liệu, kết nối hai hoặc nhiều mạng cục bộ.
10. **Switch (bộ chuyển mạch)**: Theo nghĩa rộng, switch là thiết bị hoàn thành trao đổi thông tin trong hệ thống truyền thông. Switch hoạt động ở lớp liên kết dữ liệu ở đây là switching hub, thực chất là một bridge nhiều cổng.

### 3.2. Tổng hợp các điểm kiến thức quan trọng

1. Liên kết là một đoạn đường vật lý từ nút này đến nút lân cận, liên kết dữ liệu bổ sung một số phần cứng cần thiết (như network adapter) và phần mềm (như triển khai giao thức) trên cơ sở liên kết.
2. Lớp liên kết dữ liệu chủ yếu sử dụng hai loại kênh: **kênh điểm-điểm** và **kênh broadcast**.
3. Đơn vị dữ liệu giao thức được truyền trong lớp liên kết dữ liệu là khung. Ba vấn đề cơ bản của lớp liên kết dữ liệu là: **đóng gói thành khung**, **truyền trong suốt** và **phát hiện lỗi**.
4. **Kiểm tra dư vòng CRC** là một phương pháp phát hiện lỗi, còn FCS (Frame Check Sequence) là mã dư được thêm vào sau dữ liệu.
5. **Giao thức điểm-điểm PPP** là giao thức được sử dụng nhiều nhất trong lớp liên kết dữ liệu, đặc điểm của nó là: đơn giản, chỉ phát hiện lỗi mà không sửa lỗi, không sử dụng số thứ tự, cũng không thực hiện kiểm soát luồng, có thể hỗ trợ nhiều giao thức lớp mạng đồng thời.
6. PPPoE là giao thức lớp liên kết sử dụng cho host truy cập băng rộng.
7. **Ưu điểm của LAN là: có chức năng broadcast, có thể truy cập toàn mạng thuận tiện từ một trạm; dễ mở rộng và phát triển dần dần; cải thiện độ tin cậy, tính khả dụng và khả năng sống còn của hệ thống.**
8. Máy tính cần giao tiếp với LAN bên ngoài thông qua communication adapter (hoặc network adapter), còn gọi là network interface card hoặc NIC. **Địa chỉ phần cứng của máy tính nằm trong ROM của adapter**.
9. Ethernet sử dụng phương thức làm việc không kết nối, không đánh số các khung dữ liệu được gửi, cũng không yêu cầu phía kia gửi xác nhận. Trạm đích nhận được khung lỗi thì bỏ đi, không làm gì khác.
10. Giao thức Ethernet sử dụng là **CSMA/CD (Carrier Sense Multiple Access with Collision Detection)**. Đặc điểm của giao thức: **nghe trước khi gửi, nghe trong khi gửi, ngay khi phát hiện xung đột trên bus, lập tức dừng gửi. Sau đó chờ một khoảng thời gian ngẫu nhiên theo thuật toán back-off rồi gửi lại.** Do đó, mỗi trạm trong một khoảng thời gian nhỏ sau khi tự gửi dữ liệu đều có khả năng gặp xung đột. Các trạm trên Ethernet cạnh tranh bình đẳng kênh Ethernet.
11. Adapter Ethernet có chức năng lọc, nó chỉ nhận khung unicast, khung broadcast và khung multicast.
12. Sử dụng hub có thể mở rộng Ethernet ở lớp vật lý (Ethernet mở rộng vẫn là một mạng).

### 3.3. Bổ sung

1. Đặc điểm của kênh điểm-điểm và kênh broadcast trong lớp liên kết dữ liệu, và đặc điểm của các giao thức sử dụng cho hai loại kênh này (giao thức PPP và giao thức CSMA/CD).
2. Ba vấn đề cơ bản của lớp liên kết dữ liệu: **đóng gói thành khung**, **truyền trong suốt**, **phát hiện lỗi**.
3. Địa chỉ phần cứng MAC của Ethernet.
4. Vai trò và tình huống áp dụng của adapter, repeater, hub, bridge, Ethernet switch.

## 4. Lớp mạng (Network Layer)

![Lớp mạng](https://oss.javaguide.cn/p3-juejin/775dc8136bec486aad4f1182c68f24cd~tplv-k3u1fbpfcp-zoom-1.png)

### 4.1. Thuật ngữ cơ bản

1. **Mạch ảo (Virtual Circuit)**: Kênh truyền trong suốt hai chiều được thiết lập giữa các cổng logic hoặc vật lý của hai thiết bị đầu cuối. Mạch ảo có nghĩa là đây chỉ là một kết nối logic, các gói được truyền theo kết nối logic này theo phương thức lưu và chuyển tiếp, chứ không thực sự thiết lập kết nối vật lý.
2. **IP (Internet Protocol)**: Giao thức Internet IP là một trong hai giao thức chính nhất trong hệ thống TCP/IP, là lõi của lớp internet trong kiến trúc TCP/IP. Kèm theo có ARP, RARP, ICMP, IGMP.
3. **ARP (Address Resolution Protocol)**: Giao thức phân giải địa chỉ. ARP phân giải địa chỉ IP thành địa chỉ phần cứng.
4. **ICMP (Internet Control Message Protocol)**: Giao thức thông điệp kiểm soát Internet (ICMP cho phép host hoặc router báo cáo tình huống lỗi và cung cấp báo cáo về các tình huống bất thường).
5. **Subnet mask**: Đây là bitmask dùng để chỉ ra các bit nào của địa chỉ IP xác định subnet mà host thuộc về và các bit nào xác định host. Subnet mask không thể tồn tại độc lập, nó phải kết hợp với địa chỉ IP để sử dụng.
6. **CIDR (Classless Inter-Domain Routing)**: Định tuyến liên miền không phân lớp (đặc điểm là loại bỏ khái niệm địa chỉ lớp A, B và C truyền thống và phân chia subnet, sử dụng "tiền tố mạng" (network-prefix) với độ dài khác nhau để thay thế số mạng và số subnet trong địa chỉ phân lớp).
7. **Default route (tuyến mặc định)**: Tuyến được router chọn khi không tìm thấy tuyến đến địa chỉ đích trong bảng định tuyến. Default route cũng có thể giảm không gian chiếm bởi bảng định tuyến và thời gian tìm kiếm trong bảng định tuyến.
8. **Thuật toán định tuyến (Routing Algorithm)**: Phần cốt lõi của giao thức định tuyến. Internet sử dụng giao thức định tuyến thích ứng, phân lớp.

### 4.2. Tổng hợp các điểm kiến thức quan trọng

1. **Lớp mạng trong giao thức TCP/IP chỉ cung cấp dịch vụ datagram đơn giản, linh hoạt, không kết nối, cố gắng giao tốt nhất. Lớp mạng không cam kết chất lượng dịch vụ, không đảm bảo thời hạn giao gói, các gói được truyền có thể bị lỗi, mất mát, trùng lặp và mất thứ tự. Độ tin cậy của truyền thông giữa các process do lớp vận chuyển chịu trách nhiệm.**
2. Có hai loại giao hàng trên Internet, một là giao hàng trực tiếp trong cùng mạng không cần qua router, loại kia là giao hàng gián tiếp với các mạng khác, đi qua ít nhất một router, nhưng lần cuối cùng nhất định là giao hàng trực tiếp.
3. Địa chỉ IP phân lớp bao gồm trường số mạng (chỉ định mạng) và trường số host (chỉ định host). Trường số mạng ở phần đầu nhất chỉ ra loại địa chỉ IP. Địa chỉ IP là cấu trúc địa chỉ phân cấp. Khi cơ quan quản lý địa chỉ IP phân bổ địa chỉ IP, chỉ phân bổ số mạng, số host do đơn vị nhận số mạng đó tự phân bổ. Router chuyển tiếp gói tin dựa trên số mạng mà host đích kết nối. Một router kết nối đến ít nhất hai mạng, vì vậy một router phải có ít nhất hai địa chỉ IP khác nhau.
4. IP datagram chia thành header và data hai phần. Phần trước của header là độ dài cố định, tổng cộng 20 byte, đây là phần tất cả IP packet đều phải có (địa chỉ nguồn, địa chỉ đích, tổng độ dài và các trường quan trọng khác đều cố định trong header). Một số trường tùy chọn có độ dài biến đổi được cố định ở phần sau của header. Time to live trong IP header chỉ số router tối đa mà IP datagram có thể đi qua trong Internet. Có thể ngăn IP datagram đi vòng vô hạn trên Internet.
5. **Giao thức phân giải địa chỉ ARP phân giải địa chỉ IP thành địa chỉ phần cứng. Cache tốc độ cao của ARP có thể giảm đáng kể lưu lượng truyền thông trên mạng. Vì vậy khi host lần sau giao tiếp với host có cùng địa chỉ, có thể tìm thấy địa chỉ phần cứng cần thiết trực tiếp từ cache tốc độ cao mà không cần gửi ARP request lại theo cách broadcast.**
6. CIDR không phân lớp là một giải pháp tốt để giải quyết tình trạng thiếu địa chỉ IP hiện tại. Ký pháp CIDR thêm dấu gạch chéo "/" sau địa chỉ IP, sau đó viết số bit mà tiền tố chiếm. Tiền tố (hoặc network prefix) dùng để chỉ định mạng, phần sau tiền tố là hậu tố, dùng để chỉ định host. CIDR gộp các địa chỉ IP liên tiếp có tiền tố giống nhau thành một "CIDR address block", phân bổ địa chỉ IP đều theo đơn vị CIDR address block.
7. ICMP là giao thức của lớp IP. ICMP message được gửi đi như dữ liệu của IP datagram, thêm header tạo thành IP datagram gửi đi. Sử dụng ICMP datagram không phải để thực hiện truyền đáng tin cậy. ICMP cho phép host hoặc router báo cáo tình huống lỗi và cung cấp báo cáo về các tình huống bất thường. Có hai loại ICMP message: ICMP error reporting message và ICMP inquiry message.
8. **Để giải quyết vấn đề cạn kiệt địa chỉ IP, giải pháp căn bản nhất là sử dụng phiên bản IP mới với không gian địa chỉ lớn hơn - IPv6.** Những thay đổi mà IPv6 mang lại: ① Không gian địa chỉ lớn hơn (sử dụng địa chỉ 128 bit) ② Format header linh hoạt ③ Options cải tiến ④ Hỗ trợ plug-and-play ⑤ Hỗ trợ pre-allocation tài nguyên ⑥ Header IPv6 được căn chỉnh 8 byte.
9. **Mạng riêng ảo VPN sử dụng Internet công cộng như phương tiện truyền thông giữa các mạng riêng của tổ chức. VPN sử dụng địa chỉ riêng của Internet bên trong. Một VPN phải có ít nhất một router có địa chỉ IP toàn cầu hợp lệ để có thể giao tiếp với VPN khác của cùng hệ thống qua Internet. Tất cả dữ liệu được truyền qua Internet cần được mã hóa.**
10. Đặc điểm của MPLS: ① Hỗ trợ chất lượng dịch vụ hướng kết nối ② Hỗ trợ traffic engineering, cân bằng tải mạng ③ Hỗ trợ hiệu quả VPN. MPLS đánh "nhãn" có độ dài cố định lên mỗi IP datagram tại node đầu vào, sau đó dựa trên nhãn để chuyển tiếp bằng phần cứng ở lớp 2 (lớp liên kết) (thực hiện label switching tại label switching router), do đó tốc độ chuyển tiếp tăng lên đáng kể.

## 5. Lớp vận chuyển (Transport Layer)

![Lớp vận chuyển](https://oss.javaguide.cn/p3-juejin/9fe85e137e7f4f03a580512200a59609~tplv-k3u1fbpfcp-zoom-1.png)

### 5.1. Thuật ngữ cơ bản

1. **Process (tiến trình)**: Chỉ thực thể chương trình đang chạy trong máy tính.
2. **Giao tiếp giữa các process ứng dụng**: Quá trình một process trên host này trao đổi dữ liệu với một process trên host khác (lưu ý thêm rằng điểm cuối thực sự của truyền thông không phải là host mà là process trong host, tức là truyền thông đầu-cuối là truyền thông giữa các process ứng dụng).
3. **Multiplexing và demultiplexing ở lớp vận chuyển**: Multiplexing nghĩa là các process khác nhau ở phía gửi đều có thể truyền dữ liệu qua cùng một giao thức lớp vận chuyển. Demultiplexing nghĩa là lớp vận chuyển ở phía nhận sau khi gỡ header của message có thể giao đúng dữ liệu đến process ứng dụng đích.
4. **TCP (Transmission Control Protocol)**: Giao thức điều khiển truyền dữ liệu.
5. **UDP (User Datagram Protocol)**: Giao thức datagram người dùng.

   ![TCP và UDP](https://oss.javaguide.cn/p3-juejin/b136e69e0b9b426782f77623dcf098bd~tplv-k3u1fbpfcp-zoom-1.png)

6. **Port (cổng)**: Mục đích của port là để xác nhận process nào của máy kia đang tương tác với mình, ví dụ MSN và QQ có port khác nhau, nếu không có port có thể xảy ra lỗi process QQ tương tác với MSN. Port còn gọi là protocol port number.
7. **Stop-and-wait protocol**: Chỉ sau khi bên gửi gửi xong một gói thì dừng gửi, chờ xác nhận của phía kia, sau khi nhận được xác nhận mới gửi gói tiếp theo.
8. **Kiểm soát luồng (flow control)**: Không để tốc độ gửi của bên gửi quá nhanh, vừa để bên nhận kịp nhận, vừa không gây tắc nghẽn mạng.
9. **Kiểm soát tắc nghẽn (congestion control)**: Ngăn quá nhiều dữ liệu được đưa vào mạng, để các router hoặc link trong mạng không bị quá tải. Điều kiện tiên quyết cho mọi việc kiểm soát tắc nghẽn là mạng có thể chịu được tải mạng hiện tại.

### 5.2. Tổng hợp các điểm kiến thức quan trọng

1. **Lớp vận chuyển cung cấp truyền thông logic giữa các process ứng dụng, tức là truyền thông giữa các lớp vận chuyển không thực sự truyền dữ liệu trực tiếp giữa hai lớp vận chuyển. Lớp vận chuyển che giấu các chi tiết mạng bên dưới (như cấu trúc topology mạng, giao thức định tuyến được sử dụng, v.v.) khỏi lớp ứng dụng, nó làm cho các process ứng dụng trông như thể có một kênh truyền thông logic đầu-cuối giữa hai thực thể lớp vận chuyển.**
2. **Lớp mạng cung cấp truyền thông logic cho host, còn lớp vận chuyển cung cấp truyền thông logic đầu-cuối cho các process ứng dụng.**
3. Hai giao thức quan trọng của lớp vận chuyển là UDP (User Datagram Protocol) và TCP (Transmission Control Protocol). Theo thuật ngữ OSI, đơn vị dữ liệu được truyền khi hai thực thể vận chuyển ngang hàng giao tiếp gọi là TPDU (Transport Protocol Data Unit). Nhưng trong hệ thống TCP/IP, tùy thuộc vào giao thức sử dụng là TCP hay UDP, gọi tương ứng là TCP segment hoặc UDP user datagram.
4. **UDP không cần thiết lập kết nối trước khi truyền dữ liệu, host từ xa nhận UDP message không cần đưa ra bất kỳ xác nhận nào. Mặc dù UDP không cung cấp giao hàng đáng tin cậy, nhưng trong một số trường hợp UDP thực sự là phương thức làm việc hiệu quả nhất. TCP cung cấp dịch vụ hướng kết nối. Phải thiết lập kết nối trước khi truyền dữ liệu, sau khi truyền dữ liệu xong phải giải phóng kết nối. TCP không cung cấp dịch vụ broadcast hoặc multicast. Vì TCP cần cung cấp dịch vụ truyền đáng tin cậy, hướng kết nối, không thể tránh khỏi việc thêm nhiều chi phí, như xác nhận, kiểm soát luồng, timer và quản lý kết nối. Điều này không chỉ làm tăng đáng kể header của PDU mà còn chiếm nhiều tài nguyên CPU.**
5. Hardware port là giao diện cho các thiết bị phần cứng khác nhau tương tác, còn software port là một loại địa chỉ để các process giao thức lớp ứng dụng khác nhau tương tác với thực thể vận chuyển trong giao tiếp inter-layer. Cả format header của UDP và TCP đều có hai trường quan trọng là source port và destination port. Khi lớp vận chuyển nhận được transport layer message từ lớp IP, có thể giao dữ liệu đến destination application layer dựa trên destination port number trong header. (Để hai process giao tiếp với nhau không chỉ cần biết địa chỉ IP của đối phương mà còn phải biết port number của đối phương (để tìm process ứng dụng trong máy tính đối phương))
6. Lớp vận chuyển dùng số port 16 bit để đánh dấu một port. Port number chỉ có ý nghĩa cục bộ, nó chỉ để đánh dấu giao diện inter-layer khi các process của lớp ứng dụng máy tính tương tác với lớp vận chuyển. Trong các máy tính khác nhau trên Internet, cùng port number không có liên quan. Protocol port number viết tắt là port. Mặc dù điểm cuối của truyền thông là process ứng dụng, nhưng chỉ cần giao message được gửi đến một port thích hợp nào đó của host đích, công việc còn lại (giao cuối cùng đến process đích) sẽ do TCP và UDP hoàn thành.
7. Port number của lớp vận chuyển chia thành port number phía server sử dụng (0~1023 được gán cho well-known port, 1024~49151 là registered port number) và port number tạm thời phía client sử dụng (49152~65535).
8. **Đặc điểm chính của UDP là ① Không kết nối ② Cố gắng giao tốt nhất ③ Hướng message ④ Không có kiểm soát tắc nghẽn ⑤ Hỗ trợ truyền thông tương tác one-to-one, one-to-many, many-to-one và many-to-many ⑥ Chi phí header nhỏ (chỉ có bốn trường: source port, destination port, length và checksum)**
9. **Đặc điểm chính của TCP là ① Hướng kết nối ② Mỗi kết nối TCP chỉ có thể là one-to-one ③ Cung cấp giao hàng đáng tin cậy ④ Cung cấp truyền thông song công toàn phần ⑤ Hướng byte stream**
10. **TCP dùng địa chỉ IP của host cộng với port number của host làm endpoint của kết nối TCP. Endpoint như vậy gọi là socket (ổ cắm) hoặc plug-in. Socket được biểu diễn bằng (địa chỉ IP:port number). Mỗi kết nối TCP được xác định duy nhất bởi hai endpoint ở hai đầu truyền thông.**
11. Stop-and-wait protocol là để thực hiện truyền đáng tin cậy, nguyên lý cơ bản là gửi xong một gói thì dừng gửi, chờ xác nhận của phía kia. Sau khi nhận được xác nhận mới gửi gói tiếp theo.
12. Để cải thiện hiệu quả truyền, bên gửi có thể không dùng stop-and-wait protocol hiệu quả thấp mà sử dụng truyền pipeline. Truyền pipeline là bên gửi có thể liên tục gửi nhiều gói, không cần dừng chờ xác nhận của phía kia sau mỗi gói. Điều này có thể giữ cho kênh luôn có dữ liệu truyền không gián đoạn. Phương thức truyền này có thể cải thiện đáng kể tỷ lệ sử dụng kênh.
13. Retransmission timeout trong stop-and-wait protocol nghĩa là chỉ cần quá một khoảng thời gian mà vẫn chưa nhận được xác nhận, thì retransmit gói đã gửi trước đó (cho rằng gói vừa gửi đã bị mất). Do đó sau mỗi lần gửi xong một gói cần đặt một timer timeout, thời gian retransmit phải dài hơn thời gian khứ hồi trung bình trong quá trình truyền gói. Phương thức tự động retransmit này thường gọi là ARQ (Automatic Repeat reQuest). Ngoài ra trong stop-and-wait protocol nếu nhận được gói trùng lặp, hủy gói đó, nhưng đồng thời cũng phải gửi xác nhận. Continuous ARQ protocol có thể cải thiện tỷ lệ sử dụng kênh. Bên gửi duy trì một cửa sổ gửi, tất cả gói trong cửa sổ gửi đều có thể được gửi liên tục, không cần chờ xác nhận của phía kia. Phía nhận thường sử dụng cumulative acknowledgment, gửi xác nhận cho gói cuối cùng đến theo thứ tự, chỉ ra rằng tất cả các gói đến vị trí này đều đã được nhận đúng.
14. 20 byte đầu tiên của TCP segment là cố định, theo sau là trường tùy chọn có độ dài tối đa 40 byte. Nếu thêm trường tùy chọn khiến độ dài header không phải bội số nguyên của 4 byte, cần thêm 0 vào sau đó. Do đó, độ dài header TCP có giá trị 20+4n byte, tối đa 60 byte.
15. **TCP sử dụng cơ chế cửa sổ trượt. Số thứ tự trong cửa sổ gửi biểu thị số thứ tự được phép gửi. Phần sau phần sau của cửa sổ gửi biểu thị đã gửi và đã nhận được xác nhận, còn phần trước phần trước của cửa sổ gửi biểu thị không được phép gửi. Phần sau của cửa sổ gửi có hai khả năng thay đổi: không di chuyển (không nhận được xác nhận mới) và di chuyển về phía trước (nhận được xác nhận mới). Phần trước của cửa sổ gửi thường liên tục di chuyển về phía trước. Nói chung, chúng ta luôn muốn truyền dữ liệu nhanh hơn. Nhưng nếu bên gửi gửi dữ liệu quá nhanh, bên nhận có thể không kịp nhận, điều này sẽ gây mất dữ liệu. Kiểm soát luồng là không để tốc độ gửi của bên gửi quá nhanh, để bên nhận kịp nhận.**
16. Trong một khoảng thời gian nhất định, nếu nhu cầu đối với một tài nguyên nhất định trong mạng vượt quá phần sẵn có mà tài nguyên đó có thể cung cấp, hiệu suất mạng sẽ xấu đi. Tình huống này gọi là tắc nghẽn. Kiểm soát tắc nghẽn là để ngăn quá nhiều dữ liệu được đưa vào mạng, để các router hoặc link trong mạng không bị quá tải. Điều kiện tiên quyết cho mọi việc kiểm soát tắc nghẽn là mạng có thể chịu được tải mạng hiện tại. Kiểm soát tắc nghẽn là một quá trình toàn cục, liên quan đến tất cả host, tất cả router, và tất cả các yếu tố liên quan đến giảm hiệu suất truyền mạng. Ngược lại, kiểm soát luồng thường là kiểm soát lưu lượng truyền thông point-to-point, là vấn đề đầu-cuối. Kiểm soát luồng cần làm là kiềm chế tốc độ gửi dữ liệu của bên gửi, để bên nhận kịp nhận.
17. **Để kiểm soát tắc nghẽn, bên gửi TCP cần duy trì biến trạng thái cửa sổ tắc nghẽn cwnd. Kích thước cửa sổ tắc nghẽn phụ thuộc vào mức độ tắc nghẽn mạng và thay đổi động. Bên gửi lấy cửa sổ gửi bằng giá trị nhỏ hơn trong cửa sổ tắc nghẽn và cửa sổ nhận của bên nhận.**
18. **Kiểm soát tắc nghẽn TCP sử dụng bốn thuật toán: slow start, congestion avoidance, fast retransmit và fast recovery. Ở lớp mạng cũng có thể để router sử dụng chính sách hủy gói phù hợp (như AQM - Active Queue Management), để giảm sự xuất hiện của tắc nghẽn mạng.**
19. Ba giai đoạn của kết nối vận chuyển: thiết lập kết nối, truyền dữ liệu và giải phóng kết nối.
20. **Process ứng dụng chủ động khởi tạo thiết lập kết nối TCP gọi là client, còn process ứng dụng bị động chờ kết nối được thiết lập gọi là server. Kết nối TCP sử dụng cơ chế bắt tay ba bước. Server phải xác nhận yêu cầu kết nối của người dùng, sau đó client phải xác nhận xác nhận của server.**
21. Giải phóng kết nối TCP sử dụng cơ chế bắt tay bốn bước. Bất kỳ bên nào cũng có thể gửi thông báo giải phóng kết nối sau khi truyền dữ liệu xong, sau khi phía kia xác nhận, vào trạng thái half-close. Khi bên kia cũng không có dữ liệu gửi nữa, gửi thông báo giải phóng kết nối, sau khi phía kia xác nhận, kết nối TCP được hoàn toàn đóng.

### 5.3. Bổ sung (Quan trọng)

Các kiến thức sau cần được chú ý đặc biệt:

1. Ý nghĩa của port và socket
2. Sự khác biệt giữa UDP và TCP và tình huống ứng dụng của cả hai
3. Nguyên lý hoạt động để thực hiện truyền đáng tin cậy trên mạng không đáng tin cậy, stop-and-wait protocol và ARQ protocol
4. Cửa sổ trượt TCP, kiểm soát luồng, kiểm soát tắc nghẽn và quản lý kết nối
5. Cơ chế bắt tay ba bước, bắt tay bốn bước của TCP

## 6. Lớp ứng dụng (Application Layer)

![Lớp ứng dụng](https://oss.javaguide.cn/p3-juejin/0f13f0ee13b24af7bdddf56162eb6602~tplv-k3u1fbpfcp-zoom-1.png)

### 6.1. Thuật ngữ cơ bản

1. **Hệ thống tên miền (DNS)**: DNS (Domain Name System) chuyển đổi tên miền mà con người có thể đọc được (ví dụ, www.baidu.com) thành địa chỉ IP mà máy móc có thể đọc được (ví dụ, 220.181.38.148). Chúng ta có thể hiểu nó như danh bạ điện thoại được thiết kế đặc biệt cho Internet.

   ![](https://oss.javaguide.cn/p3-juejin/e7da4b07947f4c0094d46dc96a067df0~tplv-k3u1fbpfcp-zoom-1.png)

   <p style="text-align:right;font-size:12px">https://www.seobility.net/en/wiki/HTTP_headers</p>

2. **Giao thức truyền tệp (FTP)**: FTP là viết tắt tiếng Anh của File Transfer Protocol (Giao thức truyền tệp), viết tắt tiếng Trung là "văn truyền giao thức". Dùng để truyền tệp hai chiều trên Internet. Đồng thời, nó cũng là một chương trình ứng dụng. Có các ứng dụng FTP khác nhau dựa trên các hệ điều hành khác nhau, và tất cả các ứng dụng này đều tuân theo cùng một giao thức để truyền tệp. Trong quá trình sử dụng FTP, người dùng thường gặp hai khái niệm: "Download" (tải xuống) và "Upload" (tải lên). "Download" là sao chép tệp từ remote host về máy tính của mình; "Upload" là sao chép tệp từ máy tính của mình lên remote host.

   ![Quá trình làm việc của FTP](https://oss.javaguide.cn/p3-juejin/f3f2caaa361045a38fb89bb9fee15bd3~tplv-k3u1fbpfcp-zoom-1.png)

3. **Giao thức truyền tệp đơn giản (TFTP)**: TFTP (Trivial File Transfer Protocol) là một giao thức trong họ giao thức TCP/IP dùng để truyền tệp đơn giản giữa client và server, cung cấp dịch vụ truyền tệp không phức tạp, chi phí thấp. Port number là 69.
4. **Giao thức terminal từ xa (TELNET)**: Giao thức Telnet là thành viên của họ giao thức TCP/IP, là giao thức tiêu chuẩn và phương thức chính của dịch vụ đăng nhập từ xa Internet. Nó cung cấp cho người dùng khả năng thực hiện công việc trên remote host từ máy tính cục bộ. Người dùng terminal sử dụng chương trình telnet trên máy tính của mình để kết nối đến server. Người dùng terminal có thể nhập lệnh trong chương trình telnet, các lệnh này sẽ chạy trên server, giống như nhập trực tiếp trên console của server. Có thể điều khiển server từ local. Để bắt đầu một phiên telnet, phải nhập tên người dùng và mật khẩu để đăng nhập vào server. Telnet là phương pháp phổ biến để điều khiển từ xa Web server.
5. **World Wide Web (WWW)**: WWW là viết tắt của World Wide Web, tên tiếng Việt là "mạng toàn cầu". Gồm chương trình Web client và Web server. WWW cho phép Web client (thường là trình duyệt) truy cập và duyệt các trang trên Web server. Là một hệ thống bao gồm nhiều hypertext liên kết với nhau, được truy cập qua Internet. Trong hệ thống này, mỗi thứ có ích gọi là một "tài nguyên"; và được xác định bởi một "Uniform Resource Identifier" (URI) toàn cầu; các tài nguyên này được truyền đến người dùng thông qua Hypertext Transfer Protocol (HTTP), và người dùng lấy tài nguyên bằng cách nhấp vào link. World Wide Web Consortium (W3C), còn gọi là Hội đồng W3C. Được thành lập vào tháng 10 năm 1994 tại phòng thí nghiệm khoa học máy tính của MIT. Người tạo ra World Wide Web Consortium là người phát minh ra WWW, Tim Berners-Lee. WWW không giống Internet, WWW chỉ là một trong những dịch vụ mà Internet có thể cung cấp, là một dịch vụ chạy nhờ Internet.
6. **Quy trình làm việc đại khái của WWW:**

   ![Quy trình làm việc đại khái của WWW](https://oss.javaguide.cn/p3-juejin/ba628fd37fdc4ba59c1a74eae32e03b1~tplv-k3u1fbpfcp-zoom-1.jpeg)

7. **URL (Uniform Resource Locator)**: URL là biểu diễn ngắn gọn về vị trí và phương thức truy cập tài nguyên có thể lấy từ Internet, là địa chỉ của tài nguyên tiêu chuẩn trên Internet. Mỗi tệp trên Internet đều có một URL duy nhất, thông tin nó chứa chỉ ra vị trí của tệp và cách trình duyệt xử lý nó.
8. **HTTP (Hypertext Transfer Protocol)**: HTTP (HyperText Transfer Protocol) là giao thức mạng được sử dụng rộng rãi nhất trên Internet. Tất cả các tệp WWW đều phải tuân theo tiêu chuẩn này. Mục đích ban đầu thiết kế HTTP là để cung cấp một phương pháp xuất bản và nhận các trang HTML. Năm 1960, người Mỹ Ted Nelson đã nghĩ ra một phương pháp xử lý thông tin văn bản thông qua máy tính và gọi nó là hypertext, đây trở thành nền tảng phát triển của kiến trúc tiêu chuẩn giao thức truyền siêu văn bản HTTP.

   Bản chất của giao thức HTTP chính là một định dạng truyền thông được thỏa thuận giữa trình duyệt và server. Nguyên lý HTTP như hình dưới:

   ![](https://oss.javaguide.cn/p3-juejin/8e3efca026654874bde8be88c96e1783~tplv-k3u1fbpfcp-zoom-1.jpeg)

9. **Proxy Server (máy chủ proxy)**: Proxy Server là một thực thể mạng, còn gọi là WWW cache tốc độ cao. Proxy server lưu tạm một số request và response gần đây vào đĩa cục bộ. Khi request mới đến, nếu proxy server phát hiện request này giống với request đã lưu tạm, sẽ trả về response đã lưu, mà không cần truy cập tài nguyên đó trên Internet theo URL một lần nữa. Proxy server có thể làm việc ở phía client hoặc server, cũng có thể làm việc ở hệ thống trung gian.
10. **SMTP (Simple Mail Transfer Protocol)**: SMTP là một nhóm quy tắc để truyền mail từ địa chỉ nguồn đến địa chỉ đích, kiểm soát cách thức chuyển tiếp thư. Giao thức SMTP thuộc họ giao thức TCP/IP, nó giúp mỗi máy tính tìm đến đích tiếp theo khi gửi hoặc chuyển tiếp thư. Thông qua server được chỉ định bởi giao thức SMTP, có thể gửi E-mail đến server của người nhận, toàn bộ quá trình chỉ mất vài phút. SMTP server là mail server gửi thư tuân theo giao thức SMTP, dùng để gửi hoặc chuyển tiếp email gửi đi.

    ![Quá trình một email được gửi đi](https://oss.javaguide.cn/p3-juejin/2bdccb760474435aae52559f2ef9652f~tplv-k3u1fbpfcp-zoom-1.png)

    <p style="text-align:right;font-size:12px">https://www.campaignmonitor.com/resources/knowledge-base/what-is-the-code-that-makes-bcc-or-cc-operate-in-an-email/</p>

11. **Search engine (công cụ tìm kiếm)**: Search engine (Search Engine) là hệ thống thu thập thông tin từ Internet theo chiến lược nhất định sử dụng chương trình máy tính cụ thể, sau khi tổ chức và xử lý thông tin, cung cấp dịch vụ tra cứu cho người dùng, hiển thị thông tin liên quan đến tra cứu của người dùng cho người dùng. Search engine bao gồm full-text index, directory index, meta search engine, vertical search engine, aggregated search engine, portal search engine và free link list v.v.

12. **Vertical search engine (công cụ tìm kiếm theo chiều dọc)**: Vertical search engine là search engine chuyên nghiệp nhắm vào một ngành cụ thể, là sự phân chia và mở rộng của search engine, là tích hợp một loại thông tin chuyên biệt trong thư viện trang web, trích xuất có định hướng các dữ liệu cần thiết theo trường sau khi xử lý rồi trả về cho người dùng theo một hình thức nào đó. Tìm kiếm theo chiều dọc được đề xuất so với search engine chung có lượng thông tin lớn, tra cứu không chính xác, độ sâu không đủ v.v., là mô hình dịch vụ search engine mới cung cấp thông tin có giá trị và dịch vụ liên quan nhắm vào một lĩnh vực cụ thể, một nhóm người cụ thể hoặc một nhu cầu cụ thể. Đặc điểm của nó là "chuyên, tinh, sâu", và có màu sắc ngành, so với thông tin hỗn loạn quy mô lớn của search engine chung, vertical search engine trông chuyên tập trung hơn, cụ thể và sâu sắc hơn.
13. **Full-text index (chỉ mục toàn văn)**: Kỹ thuật full-text index là công nghệ then chốt của search engine hiện nay. Thử nghĩ tìm kiếm một từ trong tệp 1MB có thể mất vài giây, trong tệp 100MB có thể mất vài chục giây, nếu tìm kiếm trong tệp lớn hơn sẽ cần chi phí hệ thống lớn hơn, chi phí như vậy không thực tế. Do đó trong mâu thuẫn như vậy đã xuất hiện kỹ thuật full-text index, đôi khi còn gọi là kỹ thuật inverted document.
14. **Directory index (chỉ mục thư mục)**: Directory index (search index/directory), như tên gọi là lưu trữ các trang web theo phân loại trong các thư mục tương ứng, do đó khi người dùng tra cứu thông tin, có thể chọn tìm kiếm theo từ khóa, cũng có thể tra cứu từng lớp theo thư mục phân loại.

### 6.2. Tổng hợp các điểm kiến thức quan trọng

1. Giao thức truyền tệp (FTP) sử dụng dịch vụ vận chuyển đáng tin cậy TCP. FTP sử dụng phương thức client-server. Một process FTP server có thể phục vụ nhiều người dùng cùng lúc. Khi truyền tệp, client và server FTP phải thiết lập hai kết nối TCP song song: connection điều khiển và connection dữ liệu. Thực tế dùng để truyền tệp là data connection.
2. Giao thức tương tác giữa WWW client và server là HTTP. HTTP sử dụng kết nối TCP để truyền đáng tin cậy. Nhưng HTTP bản thân là không kết nối, không trạng thái. Giao thức HTTP/1.1 sử dụng persistent connection (chia thành non-pipeline và pipeline).
3. Email gửi thư đến mail server người nhận sử dụng và đặt vào hòm thư người nhận, người nhận có thể đăng nhập mạng bất cứ lúc nào để đọc trên mail server của mình, tương đương với hòm thư điện tử.
4. Một hệ thống email có ba thành phần quan trọng: user agent, mail server, mail protocol (bao gồm giao thức gửi mail như SMTP, và giao thức đọc mail như POP3 và IMAP). Cả user agent và mail server đều phải chạy các giao thức này.

### 6.3. Bổ sung (Quan trọng)

Các kiến thức sau cần được chú ý đặc biệt:

1. Các giao thức phổ biến của lớp ứng dụng (trọng tâm là giao thức HTTP)
2. Hệ thống tên miền - phân giải tên miền thành địa chỉ IP
3. Quy trình đại khái truy cập một website
4. Khái niệm system call và application programming interface

<!-- @include: @article-footer.snippet.md -->
