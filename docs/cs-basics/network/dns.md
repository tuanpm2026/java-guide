---
title: Giải thích chi tiết DNS — Hệ thống tên miền（Tầng ứng dụng）
description: Giải thích chi tiết cấu trúc phân cấp và quá trình phân giải của DNS, bao gồm truy vấn đệ quy/lặp, cache và authoritative server, làm rõ các điểm cốt lõi về cổng tầng ứng dụng và tối ưu hiệu suất.
category: Kiến thức cơ bản máy tính
tag:
  - Mạng máy tính
head:
  - - meta
    - name: keywords
      content: DNS,phân giải tên miền,recursive query,iterative query,cache,authoritative DNS,cổng 53,UDP
---

DNS (Domain Name System — Hệ thống tên miền) là giao thức quan trọng đầu tiên được sử dụng sau khi người dùng nhập địa chỉ vào trình duyệt. Vấn đề DNS cần giải quyết là **ánh xạ giữa tên miền và địa chỉ IP**.

![DNS: Hệ thống tên miền](https://oss.javaguide.cn/github/javaguide/cs-basics/network/dns-overview.png)

Trong thực tế, có một tình huống trình duyệt có thể biết được ánh xạ tên miền — IP mà không cần dùng DNS. Trình duyệt duy trì một danh sách `hosts` cục bộ; thông thường trình duyệt sẽ kiểm tra trước xem tên miền cần truy cập có trong danh sách `hosts` không. Nếu có thì lấy địa chỉ IP tương ứng luôn. Nếu danh sách `hosts` cục bộ không có bản ghi tên miền — IP tương ứng thì DNS mới vào cuộc.

Hiện tại DNS sử dụng thiết kế cơ sở dữ liệu phân tán, phân cấp. **DNS là giao thức tầng ứng dụng, thường dựa trên giao thức UDP, cổng 53**. Khi dữ liệu response vượt quá giới hạn độ dài UDP (512 byte, EDNS0 có thể mở rộng lớn hơn) hoặc thực hiện Zone Transfer, sẽ chuyển sang dùng TCP để đảm bảo tính toàn vẹn dữ liệu.

![Tổng quan các giao thức TCP/IP theo tầng](https://oss.javaguide.cn/github/javaguide/cs-basics/network/network-protocol-overview.png)

## DNS Server

DNS server có thể được phân cấp từ dưới lên trên như sau (tất cả DNS server đều thuộc một trong bốn loại sau):

- **Root DNS server**: Root DNS server cung cấp địa chỉ IP của TLD server. Hiện trên thế giới chỉ có 13 nhóm root server, tại Trung Quốc hiện vẫn chưa có root server.
- **TLD DNS server (Top-Level Domain server)**: TLD là phần hậu tố của tên miền, như `com`, `org`, `net`, `edu`, v.v. Các quốc gia cũng có TLD riêng như `uk`, `fr`, `ca`. TLD server cung cấp địa chỉ IP của authoritative DNS server.
- **Authoritative DNS server**: Mỗi tổ chức có host công khai trên Internet phải cung cấp DNS record công khai, các record này ánh xạ tên của các host đó với địa chỉ IP.
- **Local DNS server**: Mỗi ISP (Internet Service Provider) đều có một local DNS server riêng. Khi host gửi DNS request, request đó được gửi đến local DNS server — nó đóng vai trò proxy và chuyển tiếp request đó vào cấu trúc phân cấp DNS. Về mặt kỹ thuật, nó không thuộc cấu trúc phân cấp DNS.

**Trên thế giới thực sự chỉ có 13 root server không?** Đây là hiểu lầm kỹ thuật lưu truyền từ lâu. Nếu tìm kiếm trên mạng, bạn vẫn có thể thấy nhiều bài cũ khẳng định "toàn cầu chỉ có 13 root server và tất cả đều do Mỹ kiểm soát".

**Thực tế không phải vậy.**

Ban đầu khi thiết kế kiến trúc DNS, bị giới hạn bởi kích thước gói IPv4 thời kỳ đầu (UDP cần giữ dưới 512 byte), không gian dành cho địa chỉ root server thực sự chỉ đủ chứa 13 địa chỉ IP, mỗi IP tương ứng với một root DNS server khác nhau. 13 địa chỉ này được đặt tên từ `a.root-servers.net` đến `m.root-servers.net`.

Mặc dù **về mặt logic** chỉ có 13 địa chỉ IP, nhưng khi Internet bùng nổ về quy mô, "một server vật lý đơn lẻ" sớm không thể chịu được áp lực truy vấn toàn cầu. Để nâng cao độ tin cậy, bảo mật và tốc độ phản hồi của DNS, các kỹ sư đã đưa vào công nghệ **IP Anycast**.

Nhờ công nghệ Anycast, mỗi địa chỉ IP logic có thể tương ứng với hàng trăm đến hàng nghìn server vật lý phân bổ khắp toàn cầu. Khi bạn gửi query, giao thức định tuyến Internet (BGP) tự động dẫn request đến instance vật lý **gần nhất** với bạn về vị trí địa lý hoặc đường mạng.

Đến cuối năm 2023, tổng số instance vật lý root server toàn cầu đã vượt 1700 máy. Theo dữ liệu giám sát thời gian thực mới nhất của **[Root-Servers.org](https://root-servers.org/)**, đến **năm 2026, số instance vật lý root server toàn cầu đã vượt 1900+** và đang tiến gần mốc 2000 máy.

![Root-Servers.org](https://oss.javaguide.cn/github/javaguide/cs-basics/network/root-servers-org.png)

## Quy trình hoạt động của DNS

Lấy hình dưới làm ví dụ để giới thiệu quy trình phân giải truy vấn DNS. Quy trình này được chia thành hai chế độ:

- **Iterative (Lặp)**
- **Recursive (Đệ quy)**

Hình dưới là cách thực tế thường dùng: truy vấn từ host đến local DNS server là đệ quy, các truy vấn còn lại là lặp.

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/DNS-process.png)

Giả sử host `cis.poly.edu` muốn biết địa chỉ IP của `gaia.cs.umass.edu`. Giả sử local DNS server của `cis.poly.edu` là `dns.poly.edu`, và authoritative DNS server của `gaia.cs.umass.edu` là `dns.cs.umass.edu`.

1. Đầu tiên, host `cis.poly.edu` gửi DNS request đến local DNS server `dns.poly.edu`, query chứa tên miền cần phân giải `gaia.cs.umass.edu`.
2. Local DNS server `dns.poly.edu` kiểm tra cache của mình, không tìm thấy bản ghi nào, cũng không biết địa chỉ IP của `gaia.cs.umass.edu` ở đâu, buộc phải gửi request đến root server.
3. Root server nhận thấy trong query có TLD `edu`, nên thông báo cho local DNS: bạn có thể gửi request đến TLD DNS của `edu`, vì địa chỉ IP của tên miền đích rất có thể ở đó.
4. Local DNS lấy được địa chỉ TLD DNS server của `edu`, gửi request hỏi địa chỉ IP của `gaia.cs.umass.edu`.
5. TLD DNS server của `edu` vẫn không biết IP của tên miền được hỏi, nhưng nhận thấy tên miền có tiền tố `umass.edu`, nên trả lời local DNS rằng authoritative server của `umass.edu` có thể có bản ghi địa chỉ IP của tên miền đích.
6. Lần này, local DNS gửi request đến authoritative DNS server `dns.cs.umass.edu`.
7. Cuối cùng, vì `gaia.cs.umass.edu` đã đăng ký với authoritative DNS server, ở đây có bản ghi địa chỉ IP của nó. Authoritative DNS trả về địa chỉ IP cho local DNS thành công.
8. Cuối cùng, local DNS lấy được địa chỉ IP của tên miền đích và trả về cho host đã yêu cầu.

Ngoài truy vấn lặp, còn có truy vấn đệ quy như hình dưới. Quá trình cụ thể tương tự như trên, chỉ khác về thứ tự.

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/DNS-process2.png)

Ngoài ra, cache DNS nằm ở local DNS server. Vì số lượng root server trên toàn thế giới rất ít, chỉ có hơn 600 máy được chia thành 13 nhóm, và số lượng TLD cũng trong phạm vi đếm được, nên local DNS thường đã cache nhiều TLD DNS server. Do đó trong quá trình tra cứu thực tế, không cần truy cập root server. Root server thường bị bỏ qua, không được hỏi. Điều này giúp tăng hiệu quả và tốc độ truy vấn DNS, giảm tải cho root server và TLD server.

## Định dạng message DNS

Định dạng message DNS như hình dưới:

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/DNS-packet.png)

Message DNS chia thành message query và message response, cấu trúc hai loại giống nhau.

- **Identifier (Định danh)**: 16 bit, dùng để định danh query. Định danh này được sao chép vào message response của query, để client dùng nó khớp request gửi đi với response nhận được.
- **Flags (Cờ)**: Bit "query/response" 1 bit, `0` là message query, `1` là message response; bit "authoritative" 1 bit (khi DNS server nào đó là authoritative DNS server của tên được yêu cầu và là message response, dùng cờ "authoritative"); bit "recursion desired" 1 bit, yêu cầu thực hiện recursive query một cách tường minh; bit "recursion available" 1 bit, dùng trong message response, cho biết DNS server hỗ trợ recursive query.
- **Question count, Answer RR count, Authority RR count, Additional RR count**: Chỉ ra số lượng 4 loại vùng dữ liệu phía sau.
- **Question section (Vùng câu hỏi)**: Chứa tên host đang được truy vấn và loại câu hỏi đang được hỏi.
- **Answer section (Vùng trả lời)**: Chứa resource record cho tên được yêu cầu ban đầu. **Vùng trả lời trong message response có thể chứa nhiều RR, do đó một hostname có thể có nhiều địa chỉ IP.**
- **Authority section (Vùng quyền hạn)**: Chứa record của các authoritative server khác.
- **Additional section (Vùng bổ sung)**: Chứa các record hữu ích khác.

## DNS Record

Khi DNS server response query, nó cần tra cứu trong database của mình. Các entry trong database gọi là **RR (Resource Record)**. RR cung cấp ánh xạ từ hostname đến địa chỉ IP. RR là một tuple bốn trường gồm `Name`, `Value`, `Type`, `TTL`.

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/20210506174303797.png)

`TTL` là thời gian sống của record, nó quyết định khi nào resource record nên được xóa khỏi cache.

Giá trị của các trường `Name` và `Value` phụ thuộc vào `Type`:

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/20210506170307897.png)

- Nếu `Type=A`, thì `Name` là thông tin hostname, `Value` là địa chỉ IP tương ứng với hostname đó. RR này ghi lại một ánh xạ hostname → IP.
- Nếu `Type=AAAA` (rất giống record `A`), điểm khác biệt duy nhất là record A dùng IPv4, còn record `AAAA` dùng IPv6.
- Nếu `Type=CNAME` (Canonical Name Record — bản ghi tên thực), thì `Value` là canonical hostname của host có alias là `Name`. `Value` mới là canonical hostname. Record `CNAME` ánh xạ một hostname sang hostname khác. `CNAME` dùng để tạo alias cho record `A` hiện có. Có ví dụ bên dưới.
- Nếu `Type=NS`, thì `Name` là một domain, còn `Value` là hostname của authoritative DNS server biết cách lấy địa chỉ IP của các host trong domain đó. Thông thường RR loại này được TLD server công bố.
- Nếu `Type=MX`, thì `Value` là canonical hostname của mail server có alias là `Name`. Vì đã có record `MX`, mail server có thể dùng chung alias với các server khác. Để lấy canonical hostname của mail server cần request record `MX`; để lấy canonical hostname của server khác cần request record `CNAME`.

Record `CNAME` luôn trỏ đến tên miền khác, không phải địa chỉ IP. Giả sử có DNS zone sau:

```plain
NAME                    TYPE   VALUE
--------------------------------------------------
bar.example.com.        CNAME  foo.example.com.
foo.example.com.        A      192.0.2.23
```

Khi người dùng query `bar.example.com`, DNS Server thực tế trả về địa chỉ IP của `foo.example.com`.

## Tài liệu tham khảo

- Các loại DNS server: <https://www.cloudflare.com/zh-cn/learning/dns/dns-server-types/>
- DNS Message Resource Record Field Formats: <http://www.tcpipguide.com/free/t_DNSMessageResourceRecordFieldFormats-2.htm>
- Understanding Different Types of Record in DNS Server: <https://www.mustbegeek.com/understanding-different-types-of-record-in-dns-server/>

<!-- @include: @article-footer.snippet.md -->
