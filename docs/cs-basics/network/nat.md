---
title: Giải thích chi tiết giao thức NAT（Tầng mạng）
description: Phân tích cơ chế chuyển đổi địa chỉ và port mapping của NAT, kết hợp giao tiếp LAN/WAN và NAT table để hiểu các chi tiết thực tiễn trong mạng gia đình và doanh nghiệp.
category: Kiến thức cơ bản máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: NAT,chuyển đổi địa chỉ,port mapping,LAN,WAN,connection tracking,DHCP
---

## Tình huống ứng dụng

Tình huống ứng dụng của **NAT (Network Address Translation — Giao thức dịch địa chỉ mạng)** đúng như tên gọi — chuyển đổi địa chỉ mạng, được ứng dụng trong quá trình chuyển đổi địa chỉ từ mạng nội bộ ra mạng ngoài. Cụ thể, trong một subnet nhỏ (LAN — Local Area Network), các host dùng địa chỉ IP trong cùng LAN đó, nhưng ngoài LAN, trên WAN (Wide Area Network), cần một địa chỉ IP thống nhất để định danh LAN đó trên toàn Internet.

Kịch bản này thực ra không khó hiểu. Khi ngày càng có nhiều văn phòng nhỏ, văn phòng tại nhà (SOHO — Small Office, Home Office) xuất hiện, để quản lý các SOHO này, nhiều subnet được thiết kế ra, khiến số lượng host trên toàn Internet sẽ rất lớn. Nếu mỗi host đều có một IP address "tuyệt đối duy nhất", thì khả năng biểu diễn của địa chỉ IPv4 có thể nhanh chóng đạt giới hạn ($2^{32}$). Do đó, thực tế IP address trong subnet SOHO là "tương đối", điều này cũng phần nào giảm bớt áp lực phân bổ địa chỉ IPv4.

"Đại diện" của subnet SOHO, hay cửa sổ giao tiếp với thế giới bên ngoài, thường do router đảm nhận. Phía LAN của router quản lý một subnet nhỏ, còn WAN interface của nó mới là interface thực sự tham gia vào Internet, tức có một "địa chỉ tuyệt đối duy nhất". Giao thức NAT đóng vai trò chuyển đổi địa chỉ quan trọng khi host trong LAN giao tiếp với thế giới bên ngoài LAN.

## Chi tiết

![Giao thức NAT](https://oss.javaguide.cn/github/javaguide/cs-basics/network/nat-demo.png)

Giả sử kịch bản hiện tại như hình trên. Ở giữa là một router, phía phải tổ chức một LAN với network number `10.0.0/24`. IP address của LAN interface là `10.0.0.4`, và trong subnet có ít nhất ba host: `10.0.0.1`, `10.0.0.2` và `10.0.0.3`. Phía trái router kết nối với WAN, IP address của WAN interface là `138.76.29.7`.

Đầu tiên, dựa trên thông tin trên, có một số điều cần lưu ý:

1. Network address của subnet phía phải router là `10.0.0.0/24` (network prefix 24 bit, host number 8 bit). Địa chỉ ba host và địa chỉ LAN interface của router đều được quy định bởi giao thức DHCP. Và DHCP này chạy bên trong router (router tự duy trì một DHCP server nhỏ), cung cấp dịch vụ DHCP cho các thiết bị trong subnet.
2. Địa chỉ WAN interface của router cũng do DHCP quy định, nhưng địa chỉ này do router lấy từ ISP (Internet Service Provider), tức DHCP này thường chạy trên DHCP server trong vùng router đang ở.

Bây giờ, trong router còn chạy giao thức NAT để cung cấp dịch vụ chuyển đổi địa chỉ cho giao tiếp LAN-WAN. Vì vậy, một cấu trúc rất quan trọng là **NAT translation table (bảng dịch NAT)**. Để giải thích chi tiết hoạt động của NAT, giả sử có request sau:

1. Host `10.0.0.1` gửi HTTP request (ví dụ request trang) đến web server có IP `128.119.40.186` (cổng 80). Lúc này host `10.0.0.1` chọn ngẫu nhiên một cổng, ví dụ `3345`, làm source port number cho request này, gửi request đến router (destination address sẽ là `128.119.40.186`, nhưng trước tiên đến `10.0.0.4`).
2. `10.0.0.4` tức LAN interface của router nhận request từ `10.0.0.1`. Router gán một source port number mới cho request này, ví dụ `5001`, và gửi request message đến WAN interface `138.76.29.7`. Đồng thời ghi một entry vào NAT translation table: **138.76.29.7:5001 → 10.0.0.1:3345**.
3. Request message đến WAN interface, tiếp tục gửi đến host đích `128.119.40.186`.

Sau đó, sẽ có response như sau:

1. Host `128.119.40.186` nhận request, tạo response message và gửi đến đích `138.76.29.7:5001`.
2. Response message đến WAN interface của router. Router tra cứu NAT translation table, tìm thấy `138.76.29.7:5001` có trong bảng, từ đó chuyển đổi destination address và destination port thành `10.0.0.1:3345`, rồi gửi đến `10.0.0.4`.
3. Response message đã được chuyển đổi đến LAN interface của router, rồi được chuyển tiếp đến đích `10.0.0.1`.

![Chuyển đổi địa chỉ cho giao tiếp LAN-WAN](https://oss.javaguide.cn/github/javaguide/cs-basics/network/nat-demo2.png)

🐛 Đính chính (xem: [issue#2009](https://github.com/Snailclimb/JavaGuide/issues/2009)): Giá trị Dest ở bước 4 trong hình trên phải là `10.0.0.1:3345` chứ không phải ~~`138.76.29.7:5001`~~, đây là lỗi ghi nhầm.

## Điểm cần lưu ý

Từ quá trình trên, có một số điểm quan trọng cần nhấn mạnh:

1. Khi request message đến router và được gán port number mới, vì port number có 16 bit, thông thường số host tối đa trong LAN do một router quản lý ≈ 65500 ($2^{16}$ không gian địa chỉ), nhưng thường subnet SOHO không có nhiều host đến vậy.
2. Với server đích, nó không bao giờ biết "chính xác host nào đã gửi request cho tôi", chỉ biết là request từ router `138.76.29.7:5001` chuyển tiếp. Do đó có thể nói **router đóng vai trò che chắn giữa WAN và LAN**. Tất cả message từ host nội bộ gửi ra ngoài đều có cùng IP address (port number khác nhau); tất cả message từ ngoài gửi vào nội bộ cũng chỉ có một đích đến (port number khác nhau). Chỉ sau khi được chuyển đổi NAT, message bên ngoài mới có thể đến đúng host nội bộ.
3. Khi message đi qua router và thực hiện NAT, nếu IP của LAN host đã được đăng ký trong NAT translation table, thì router không cần gán port mới, mà trực tiếp đi qua router theo entry trong bảng. Tương tự khi message bên ngoài gửi vào nội bộ.

Tóm tắt đặc điểm của giao thức NAT:

1. NAT che chắn LAN với WAN, giúp giảm bớt hiệu quả áp lực phân bổ địa chỉ IPv4.
2. Khi IP address của LAN host thay đổi, không cần thông báo cho WAN.
3. Khi ISP phía WAN thay đổi địa chỉ interface, không cần thông báo cho các host trong LAN.
4. LAN host không hiển thị với WAN, không thể định địa chỉ trực tiếp, đảm bảo một mức độ bảo mật nhất định.

Tuy nhiên, giao thức NAT do tính độc đáo của nó còn tồn tại một số tranh cãi. Ví dụ, bạn có thể đã nhận ra: **khi định danh một host nội bộ ngoài LAN, NAT dùng port number vì IP address đều giống nhau**. Hành vi dùng port number để định địa chỉ host này có thể gây ra một số hiểu lầm. Ngoài ra, router là thiết bị tầng mạng nhưng lại sửa đổi nội dung packet tầng vận chuyển (sửa source IP address và port number), cũng là hành vi không chuẩn. Tuy nhiên, bất chấp điều đó, giao thức NAT như là sản phẩm của kỷ nguyên IPv4, đã giải quyết thuận tiện nhiều vấn đề vốn phức tạp và vẫn được sử dụng đến ngày nay.

<!-- @include: @article-footer.snippet.md -->
