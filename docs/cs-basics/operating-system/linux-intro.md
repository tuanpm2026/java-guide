---
title: Tổng hợp kiến thức cơ bản về Linux
description: Giới thiệu ngắn gọn một số khái niệm Linux và các lệnh thường dùng mà lập trình viên Java cần biết.
category: Kiến thức cơ bản máy tính
tag:
  - Hệ điều hành
  - Linux
head:
  - - meta
    - name: keywords
      content: Linux,基础命令,发行版,文件系统,权限,进程,网络
---

<!-- @include: @small-advertisement.snippet.md -->

Giới thiệu ngắn gọn một số khái niệm Linux và các lệnh thường dùng mà lập trình viên Java cần biết.

## Khám phá Linux

### Giới thiệu về Linux

Có thể tóm tắt Linux là gì qua ba điểm sau:

- **Hệ thống tương tự Unix**: Linux là hệ điều hành tự do, mã nguồn mở, tương tự Unix.
- **Bản chất Linux là Linux kernel**: Nói chính xác, từ "Linux" chỉ đề cập đến Linux kernel. Chỉ riêng Linux kernel không thể tạo thành một hệ điều hành hoạt động bình thường. Do đó, có nhiều bản phân phối Linux khác nhau ra đời.
- **Cha đẻ của Linux (Linus Benedict Torvalds)**: Một nhân vật huyền thoại trong lĩnh vực lập trình, thực sự là bậc thầy! Là hình mẫu chúng ta ngưỡng mộ và tôn kính. Ông là tác giả đầu tiên của **Linux kernel**, sau đó khởi xướng dự án mã nguồn mở này và đảm nhận vai trò kiến trúc sư trưởng của Linux kernel. Ông cũng khởi xướng dự án mã nguồn mở Git và là nhà phát triển chính.

![Cha đẻ của Linux](/images/github/javaguide/cs-basics/operating-system/linux/linux-father.png)

### Lịch sử ra đời Linux

Năm 1989, Linus Torvalds nhập ngũ phục vụ trong Lữ đoàn Tân binh Finland trong 11 tháng, mang quân hàm Thiếu úy, chủ yếu phục vụ tại bộ phận máy tính với nhiệm vụ tính toán đạn đạo. Trong thời gian tại ngũ, ông mua giáo trình của Giáo sư Andrew Stuart Tanenbaum và mã nguồn minix, bắt đầu nghiên cứu hệ điều hành. Năm 1990, sau khi xuất ngũ trở về đại học, ông bắt đầu tiếp xúc với Unix.

> **Minix** là một hệ điều hành mini tương tự Unix, được Giáo sư Tanenbaum tạo ra cho mục đích giảng dạy, sử dụng kiến trúc vi nhân (microkernel). Nó đã truyền cảm hứng cho sự ra đời của Linux kernel.

Năm 1991, Linus Torvalds đã mã nguồn mở Linux kernel. Linux lấy hình ảnh một chú chim cánh cụt đáng yêu làm biểu tượng, tượng trưng cho sự dám nghĩ dám làm và yêu cuộc sống.

![OPINION: Make the switch to a Linux operating system | Opinion ...](/images/github/javaguide/cs-basics/operating-system/linux/Linux-Logo.png)

### Các bản phân phối Linux thường gặp

![Hệ điều hành Linux](/images/github/javaguide/cs-basics/operating-system/linux/linux.png)

Linus Torvalds chỉ mã nguồn mở Linux kernel. Như đã đề cập ở trên về vai trò của kernel hệ điều hành, một số tổ chức hoặc nhà sản xuất đóng gói Linux kernel với các phần mềm và tài liệu khác nhau, đồng thời cung cấp giao diện cài đặt hệ thống, công cụ cấu hình, cài đặt và quản lý hệ thống — tạo thành các bản phân phối Linux.

> Kernel chủ yếu chịu trách nhiệm quản lý bộ nhớ hệ thống, quản lý thiết bị phần cứng, quản lý hệ thống tệp và quản lý ứng dụng.

Các bản phân phối Linux có thể chia thành hai loại chính:

- **Bản phân phối do công ty thương mại duy trì**: Ví dụ Red Hat Enterprise Linux (RHEL) được công ty Red Hat duy trì và hỗ trợ.
- **Bản phân phối do tổ chức cộng đồng duy trì**: Ví dụ CentOS (dựa trên Red Hat Enterprise Linux) và Ubuntu (dựa trên Debian).

Với người mới học Linux, tôi khuyến nghị chọn CentOS vì những lý do sau:

- CentOS miễn phí và mã nguồn mở;
- CentOS dựa trên RHEL, chức năng nhất quán cao với RHEL, ổn định và bảo mật, hiệu năng xuất sắc.

## Hệ thống tệp Linux

### Giới thiệu về hệ thống tệp Linux

Trong hệ điều hành Linux, tất cả các tài nguyên được hệ điều hành quản lý — như card mạng, ổ đĩa, máy in, thiết bị đầu vào/đầu ra, tệp thông thường hay thư mục — đều được coi là tệp. Đây là một khái niệm quan trọng trong hệ thống Linux: "Mọi thứ đều là tệp".

Khái niệm này xuất phát từ triết lý UNIX — trừu tượng hóa tất cả tài nguyên thành tệp để quản lý và truy cập. Hệ thống tệp Linux cũng kế thừa ý tưởng thiết kế hệ thống tệp UNIX. Thiết kế này cho phép hệ thống Linux quản lý và thao tác các loại tài nguyên khác nhau thông qua giao diện tệp thống nhất, thực hiện phương thức hoạt động tệp thống nhất. Ví dụ, có thể đối xử với card mạng, ổ đĩa, tệp thiết bị tương tự như đọc ghi tệp, làm cho việc thao tác và quản lý các tài nguyên này trở nên thống nhất và thuận tiện hơn.

Ý tưởng thiết kế lấy tệp làm trung tâm này mang lại tính linh hoạt và khả năng mở rộng cho hệ thống Linux, làm cho Linux trở thành một hệ điều hành mạnh mẽ. Đồng thời đây cũng là một đặc điểm lớn của hệ thống Linux, được đông đảo người dùng và nhà phát triển yêu thích và tán dương.

### Giới thiệu về inode

inode là nền tảng của hệ thống tệp Linux/Unix. Vậy inode thực sự là gì? Có tác dụng gì?

Có thể tóm tắt inode qua năm điểm sau:

1. Đĩa cứng lấy sector (Sector) làm đơn vị lưu trữ vật lý nhỏ nhất, còn hệ điều hành và hệ thống tệp lấy block làm đơn vị đọc ghi, block gồm nhiều sector. Dữ liệu tệp được lưu trong các block này. Sector đĩa cứng hiện đại thường là 4KB, bằng với một số kích thước block thường gặp, nhưng hệ điều hành cũng hỗ trợ block lớn hơn để nâng cao hiệu năng đọc ghi tệp lớn. Thông tin metadata của tệp (như quyền, kích thước, thời gian sửa đổi và vị trí block dữ liệu) được lưu trong inode (index node - node chỉ mục). Mỗi tệp có một inode duy nhất. inode không lưu dữ liệu tệp mà lưu các con trỏ trỏ đến các block dữ liệu, hệ điều hành tìm và đọc dữ liệu tệp qua các con trỏ này. Ổ đĩa trạng thái rắn (SSD) tuy không có sector vật lý nhưng sử dụng block logic, khái niệm tương tự như block của đĩa cứng truyền thống.
2. inode là cấu trúc dữ liệu có kích thước cố định, kích thước được xác định khi tạo hệ thống tệp và không thay đổi trong suốt vòng đời của tệp.
3. Tốc độ truy cập inode rất nhanh vì hệ thống có thể định vị thẳng đến thông tin metadata của tệp qua số inode mà không cần duyệt toàn bộ hệ thống tệp.
4. Số lượng inode có giới hạn, mỗi hệ thống tệp chỉ chứa số lượng inode cố định. Điều này có nghĩa là khi inode trong hệ thống tệp dùng hết, không thể tạo thêm tệp hoặc thư mục mới dù đĩa vẫn còn không gian trống. Vì vậy khi tạo hệ thống tệp cần phân bổ số lượng inode hợp lý dựa trên số lượng dự kiến của tệp và thư mục.
5. Có thể dùng lệnh `stat` để xem thông tin inode của tệp, bao gồm số inode, loại tệp, quyền, chủ sở hữu, kích thước tệp, thời gian sửa đổi.

Nói đơn giản: inode dùng để lưu thông tin về tệp bị chia thành mấy block, địa chỉ mỗi block ở đâu, chủ sở hữu tệp, thời gian tạo, quyền, kích thước, v.v.

Tóm tắt về inode và block:

- **inode**: Ghi lại thông tin thuộc tính của tệp, có thể dùng lệnh `stat` để xem thông tin inode.
- **block**: Nội dung thực tế của tệp. Nếu một tệp lớn hơn một block thì chiếm nhiều block, nhưng một block chỉ lưu được một tệp. (Vì dữ liệu được trỏ bởi inode — nếu dữ liệu hai tệp lưu trong cùng một block thì sẽ loạn)

![Thông tin inode của tệp](./images/文件inode信息.png)

Có thể thấy, hệ điều hành Linux/Unix sử dụng inode để phân biệt các tệp khác nhau. Lợi ích của cách làm này là dù tên tệp bị thay đổi hay xóa, số inode của tệp không thay đổi, từ đó tránh được một số lỗi do đổi tên, di chuyển hoặc xóa tệp gây ra. Đồng thời, inode cũng cung cấp hiệu năng hệ thống tệp cao hơn vì tốc độ truy cập inode rất nhanh, có thể định vị thẳng đến thông tin metadata của tệp qua số inode mà không cần duyệt toàn bộ hệ thống tệp.

Tuy nhiên, sử dụng số inode cũng làm cho hệ thống tệp trở nên trừu tượng và phức tạp hơn ở tầng người dùng và ứng dụng, cần truy cập và quản lý thông tin inode của tệp thông qua lệnh hệ thống hoặc giao diện hệ thống tệp.

### Hard link và soft link

Trên hệ thống Linux/Unix, file link (liên kết tệp) là một loại tệp đặc biệt, có thể trỏ đến một tệp khác trong hệ thống tệp. Có hai loại file link thường gặp:

**1. Hard link (Liên kết cứng)**

- Trong hệ thống tệp Linux/Unix, mỗi tệp và thư mục có một số inode (index node) duy nhất để xác định tệp hoặc thư mục đó. Hard link thiết lập kết nối qua số inode, hard link và tệp nguồn có cùng số inode — hai tệp này hoàn toàn bình đẳng với hệ thống tệp (có thể xem là liên kết cứng với nhau, nguồn gốc là cùng một tệp). Xóa một trong hai không ảnh hưởng đến cái còn lại, có thể đặt hard link cho tệp để ngăn tệp quan trọng bị xóa nhầm.
- Chỉ khi xóa cả tệp nguồn lẫn tất cả các hard link tương ứng, tệp đó mới bị xóa thực sự.
- Hard link có một số giới hạn — không thể tạo hard link cho thư mục và tệp không tồn tại, hơn nữa hard link cũng không thể vượt qua hệ thống tệp.
- Lệnh `ln` dùng để tạo hard link.

**2. Soft link (Liên kết mềm - Symbolic Link hoặc Symlink)**

- Soft link và tệp nguồn có số inode khác nhau, thay vào đó trỏ đến một đường dẫn tệp.
- Sau khi tệp nguồn bị xóa, soft link vẫn tồn tại, nhưng trỏ đến một đường dẫn tệp không hợp lệ.
- Soft link tương tự như shortcut trong hệ thống Windows.
- Khác với hard link, có thể tạo soft link cho thư mục hoặc tệp không tồn tại, và soft link có thể vượt qua hệ thống tệp.
- Lệnh `ln -s` dùng để tạo soft link.

**Tại sao hard link không thể vượt qua hệ thống tệp?**

Như đã đề cập, hard link được thiết lập thông qua số inode, và hard link cùng tệp nguồn chia sẻ số inode giống nhau.

Tuy nhiên, mỗi hệ thống tệp có bảng inode độc lập riêng, và mỗi bảng inode chỉ duy trì các inode trong hệ thống tệp đó. Nếu tạo hard link giữa các hệ thống tệp khác nhau, có thể dẫn đến xung đột số inode, tức là số inode của tệp đích đã được sử dụng trong hệ thống tệp đó.

### Các loại tệp trong Linux

Linux hỗ trợ nhiều loại tệp. Các loại tệp quan trọng bao gồm: **tệp thông thường**, **tệp thư mục**, **tệp liên kết**, **tệp thiết bị**, **tệp pipe**, **tệp Socket**, v.v.

- **Tệp thông thường (-)**: Dùng để lưu trữ thông tin và dữ liệu, người dùng Linux có thể xem, sửa đổi và xóa tệp thông thường tùy theo quyền truy cập. Ví dụ: hình ảnh, âm thanh, PDF, text, video, mã nguồn, v.v.
- **Tệp thư mục (d, directory file)**: Thư mục cũng là một loại tệp, dùng để biểu thị và quản lý các tệp trong hệ thống, tệp thư mục chứa một số tên tệp và tên thư mục con. Mở thư mục thực chất là mở tệp thư mục.
- **Tệp liên kết tượng trưng (l, symbolic link)**: Lưu địa chỉ trỏ đến tệp chứ không phải bản thân tệp.
- **Thiết bị ký tự (c, char)**: Dùng để truy cập thiết bị ký tự như bàn phím.
- **Tệp thiết bị (b, block)**: Dùng để truy cập thiết bị khối như đĩa cứng, đĩa mềm.
- **Tệp pipe (p, pipe)**: Một loại tệp đặc biệt dùng cho giao tiếp giữa các tiến trình.
- **Tệp socket (s, socket)**: Dùng cho giao tiếp mạng giữa các tiến trình, cũng có thể dùng cho giao tiếp phi mạng trên cùng máy.

Mỗi loại tệp có công dụng và thuộc tính khác nhau, có thể dùng lệnh như `ls`, `file` để xem thông tin loại tệp.

```bash
# Tệp thông thường (-)
-rw-r--r--  1 user  group  1024 Apr 14 10:00 file.txt

# Tệp thư mục (d, directory file)
drwxr-xr-x  2 user  group  4096 Apr 14 10:00 directory/

# Tệp socket (s, socket)
srwxrwxrwx  1 user  group    0 Apr 14 10:00 socket
```

### Cây thư mục Linux

Linux sử dụng cấu trúc phân cấp gọi là cây thư mục để tổ chức tệp và thư mục. Cây thư mục lấy thư mục gốc (/) làm điểm bắt đầu, mở rộng xuống dưới tạo thành một loạt thư mục và thư mục con. Mỗi thư mục có thể chứa tệp và các thư mục con khác. Cấu trúc phân cấp rõ ràng, giống như một cây lộn ngược.

![Cấu trúc thư mục Linux](./images/Linux目录树.png)

**Giải thích các thư mục thường gặp:**

- **/bin:** Chứa các tệp thực thi nhị phân (ls, cat, mkdir, v.v.), các lệnh thường dùng thường ở đây;
- **/etc:** Chứa các tệp quản lý và cấu hình hệ thống;
- **/home:** Thư mục gốc chứa các tệp của tất cả người dùng, là điểm cơ sở của thư mục home người dùng, ví dụ thư mục home của user là /home/user, có thể dùng ~user để biểu thị;
- **/usr:** Dùng để lưu ứng dụng hệ thống;
- **/opt:** Vị trí đặt các gói ứng dụng tùy chọn được cài thêm. Thông thường có thể cài tomcat, v.v. ở đây;
- **/proc:** Thư mục hệ thống tệp ảo, là ánh xạ của bộ nhớ hệ thống. Có thể truy cập thư mục này trực tiếp để lấy thông tin hệ thống;
- **/root:** Thư mục home của super user (quản trị viên hệ thống) (tầng lớp đặc quyền ^o^);
- **/sbin:** Chứa các tệp thực thi nhị phân, chỉ root mới có thể truy cập. Ở đây lưu các lệnh quản lý cấp hệ thống dành cho quản trị viên hệ thống, như ifconfig, v.v.;
- **/dev:** Dùng để lưu tệp thiết bị;
- **/mnt:** Điểm mount để quản trị viên hệ thống cài hệ thống tệp tạm thời, hệ thống cung cấp thư mục này để người dùng mount tạm thời các hệ thống tệp khác;
- **/boot:** Chứa các tệp dùng khi khởi động hệ thống;
- **/lib và /lib64:** Chứa các tệp thư viện liên quan đến hoạt động hệ thống;
- **/tmp:** Dùng để lưu các tệp tạm thời khác nhau, là điểm lưu trữ tệp tạm thời chung;
- **/var:** Dùng để lưu các tệp cần thay đổi dữ liệu khi chạy, cũng là vùng tràn cho một số tệp lớn, ví dụ các tệp log của các dịch vụ (log khởi động hệ thống, v.v.);
- **/lost+found:** Thư mục này thường trống, các tệp "vô gia cư" bị bỏ lại khi hệ thống tắt đột ngột (trên Windows gọi là file .chk) ở đây.

## Các lệnh Linux thường dùng

Dưới đây chỉ liệt kê một số lệnh thường dùng hơn.

Khuyến nghị một website tra cứu nhanh lệnh Linux rất hay — nếu quên lệnh nào hay không hiểu lệnh nào đều có thể tìm ở đây. Tra cứu nhanh lệnh Linux online: <https://wangchujiang.com/linux-command/>.

![Tra cứu nhanh lệnh Linux](/images/github/javaguide/cs-basics/operating-system/linux/linux-command-search.png)

Ngoài ra, website [shell.how](https://www.shell.how/) có thể dùng để giải thích ý nghĩa các lệnh thường gặp, hữu ích khi học các lệnh cơ bản Linux cũng như các lệnh thường dùng khác (như Git, NPM).

![Ví dụ sử dụng shell.how](/images/github/javaguide/cs-basics/operating-system/linux/shell-now.png)

### Chuyển đổi thư mục

- `cd usr`: Chuyển đến thư mục usr trong thư mục hiện tại
- `cd ..（hoặc cd../）`: Chuyển đến thư mục cha
- `cd /`: Chuyển đến thư mục gốc hệ thống
- `cd ~`: Chuyển đến thư mục home của người dùng
- **`cd -`:** Chuyển đến thư mục của thao tác trước

### Thao tác thư mục

- `ls`: Hiển thị danh sách tệp và thư mục con trong thư mục. Ví dụ: `ls /home`, hiển thị danh sách tệp và thư mục con trong thư mục `/home`.
- `ll`: `ll` là alias của `ls -l`, lệnh ll có thể xem thông tin chi tiết của tất cả thư mục và tệp trong thư mục đó.
- `mkdir [tùy chọn] tên_thư_mục`: Tạo thư mục mới (thêm). Ví dụ: `mkdir -m 755 my_directory`, tạo thư mục mới tên `my_directory` với quyền 755, chủ sở hữu có quyền đọc, ghi, thực thi, nhóm và người dùng khác chỉ có quyền đọc và thực thi. Nếu muốn tất cả người dùng (kể cả nhóm và người dùng khác) đều có quyền đọc, ghi, thực thi cho thư mục, cần đặt quyền là `777`: `mkdir -m 777 my_directory`.
- `find [đường_dẫn] [biểu_thức]`: Tìm kiếm tệp hoặc thư mục trong thư mục chỉ định và các thư mục con (tra cứu), rất mạnh mẽ và linh hoạt. Ví dụ: ① Liệt kê tất cả tệp và thư mục trong thư mục hiện tại và thư mục con: `find .`; ② Tìm tên tệp kết thúc bằng `.txt` trong thư mục `/home`: `find /home -name "*.txt"`, bỏ qua hoa thường: `find /home -iname "*.txt"`; ③ Tìm tất cả tệp kết thúc bằng `.txt` và `.pdf` trong thư mục hiện tại: `find . \( -name "*.txt" -o -name "*.pdf" \)` hoặc `find . -name "*.txt" -o -name "*.pdf"`.
- `pwd`: Hiển thị đường dẫn thư mục làm việc hiện tại.
- `rmdir [tùy chọn] tên_thư_mục`: Xóa thư mục rỗng (xóa). Ví dụ: `rmdir -p my_directory`, xóa thư mục rỗng `my_directory` và đệ quy xóa các thư mục cha rỗng của `my_directory` cho đến khi gặp thư mục không rỗng hoặc thư mục gốc.
- `rm [tùy chọn] tên_tệp_hoặc_thư_mục`: Xóa tệp/thư mục (xóa). Ví dụ: `rm -r my_directory`, xóa thư mục `my_directory`, `-r` (recursive, đệ quy) nghĩa là đệ quy xóa thư mục chỉ định và tất cả thư mục con và tệp.
- `cp [tùy chọn] tệp/thư_mục_nguồn tệp/thư_mục_đích`: Sao chép tệp hoặc thư mục (di chuyển). Ví dụ: `cp file.txt /home/file.txt`, sao chép tệp `file.txt` vào thư mục `/home` và đổi tên thành `file.txt`. `cp -r source destination`, sao chép thư mục `source` và tất cả thư mục con và tệp vào thư mục `destination`, giữ nguyên thuộc tính và cấu trúc thư mục của tệp nguồn.
- `mv [tùy chọn] tệp/thư_mục_nguồn tệp/thư_mục_đích`: Di chuyển tệp hoặc thư mục (di chuyển), cũng có thể dùng để đổi tên tệp hoặc thư mục. Ví dụ: `mv file.txt /home/file.txt`, di chuyển tệp `file.txt` vào thư mục `/home` và đổi tên thành `file.txt`. Kết quả của `mv` và `cp` khác nhau — `mv` giống như tệp "dọn nhà", số tệp không tăng. Còn `cp` sao chép tệp, số tệp tăng.

### Thao tác tệp

Các lệnh như `mv`, `cp`, `rm` áp dụng cho cả tệp và thư mục nên không liệt kê lại ở đây.

- `touch [tùy chọn] tên_tệp..`: Tạo tệp mới hoặc cập nhật tệp đã tồn tại (thêm). Ví dụ: `touch file1.txt file2.txt file3.txt`, tạo 3 tệp.
- `ln [tùy chọn] <tệp_nguồn> <tệp_hard_link/soft_link>`: Tạo hard link/soft link. Ví dụ: `ln -s file.txt file_link`, tạo soft link tên `file_link` trỏ đến tệp `file.txt`. Tùy chọn `-s` biểu thị tạo soft link, s tức là symbolic (soft link còn gọi là symbolic link).
- `cat/more/less/tail tên_tệp`: Xem tệp (tra cứu). Lệnh `tail -f tệp` có thể theo dõi động một tệp, ví dụ tệp log của Tomcat sẽ thay đổi khi chương trình chạy, có thể dùng `tail -f catalina-2016-11-11.log` để theo dõi thay đổi tệp.
- `vim tên_tệp`: Chỉnh sửa nội dung tệp (sửa). vim là thành phần mạnh mẽ trong Linux, là phiên bản nâng cao của vi editor. Lệnh và phím tắt của vim editor rất nhiều, nhưng ở đây không liệt kê hết, bạn cũng không cần nghiên cứu quá sâu — biết dùng vim để chỉnh sửa tệp là được. Trong phát triển thực tế, vim chủ yếu dùng để sửa tệp cấu hình, các bước cơ bản: `vim tên_tệp -----> vào tệp -----> chế độ lệnh -----> nhấn i vào chế độ chỉnh sửa -----> chỉnh sửa tệp ------> nhấn Esc vào chế độ dòng cuối -----> nhập: wq/q!` (nhập wq nghĩa là ghi nội dung và thoát, tức là lưu; nhập q! nghĩa là buộc thoát không lưu).

### Nén tệp

**1) Đóng gói và nén tệp:**

Tệp đóng gói trong Linux thường kết thúc bằng `.tar`, lệnh nén thường kết thúc bằng `.gz`. Thông thường đóng gói và nén được thực hiện cùng lúc, tệp sau khi đóng gói và nén có đuôi `.tar.gz`.

Lệnh: `tar -zcvf tên_tệp_sau_nén tệp_cần_nén`, trong đó:

- z: Gọi lệnh nén gzip để nén
- c: Đóng gói tệp
- v: Hiển thị quá trình chạy
- f: Chỉ định tên tệp

Ví dụ: Giả sử thư mục test có ba tệp: `aaa.txt`, `bbb.txt`, `ccc.txt`. Nếu muốn đóng gói thư mục `test` và đặt tên tệp nén là `test.tar.gz` có thể dùng lệnh: `tar -zcvf test.tar.gz aaa.txt bbb.txt ccc.txt` hoặc `tar -zcvf test.tar.gz /test/`.

**2) Giải nén:**

Lệnh: `tar [-xvf] tệp_nén`

Trong đó x đại diện cho giải nén

Ví dụ:

- Giải nén `test.tar.gz` trong `/test` vào thư mục hiện tại: `tar -xvf test.tar.gz`
- Giải nén test.tar.gz trong /test vào thư mục /usr: `tar -xvf test.tar.gz -C /usr` (`-C` đại diện cho chỉ định vị trí giải nén)

### Truyền tệp

- `scp [tùy chọn] tệp_nguồn tệp_từ_xa` (scp tức là secure copy, sao chép bảo mật): Dùng để truyền tệp bảo mật qua giao thức SSH, có thể thực hiện tải lên từ local đến remote host và tải xuống từ remote host về local. Ví dụ: `scp -r my_directory user@remote:/home/user`, tải thư mục local `my_directory` lên thư mục `/home/user` của máy chủ từ xa. `scp -r user@remote:/home/user/my_directory`, tải thư mục `my_directory` trong `/home/user` của máy chủ từ xa về local. Lưu ý rằng lệnh `scp` cần thiết lập kết nối SSH giữa hệ thống local và từ xa để truyền tệp, vì vậy cần đảm bảo máy chủ từ xa đã cấu hình SSH và có quyền và phương thức xác thực đúng.
- `rsync [tùy chọn] tệp_nguồn tệp_từ_xa`: Có thể sao chép tệp hiệu quả giữa hệ thống local và từ xa, và có thể xử lý thông minh việc sao chép gia tăng, tiết kiệm băng thông và thời gian. Ví dụ: `rsync -r my_directory user@remote:/home/user`, tải thư mục local `my_directory` lên thư mục `/home/user` của máy chủ từ xa.
- `ftp` (File Transfer Protocol): Cung cấp cách đơn giản để kết nối đến máy chủ FTP từ xa và thực hiện các thao tác tải lên, tải xuống, xóa tệp. Trước khi dùng cần kết nối và đăng nhập máy chủ FTP từ xa. Sau khi vào giao diện dòng lệnh FTP, có thể dùng lệnh `put` để tải tệp local lên máy chủ từ xa, dùng lệnh `get` để tải tệp từ máy chủ từ xa về local, dùng lệnh `delete` để xóa tệp trên máy chủ từ xa. Ở đây không demo thêm.

### Quyền tệp

Trong hệ điều hành, mỗi tệp có quyền, người dùng sở hữu và nhóm sở hữu cụ thể. Quyền là cơ chế hệ điều hành dùng để giới hạn truy cập tài nguyên. Trong Linux quyền thường chia thành đọc (readable), ghi (writable) và thực thi (executable), chia thành ba nhóm tương ứng với chủ sở hữu tệp (owner), nhóm (group) và người dùng khác (other). Qua cơ chế này giới hạn người dùng nào, nhóm nào có thể thực hiện thao tác gì trên tệp cụ thể.

Qua lệnh **`ls -l`** có thể xem quyền của tệp hoặc thư mục trong một thư mục nào đó.

Ví dụ: Chạy `ls -l` trong bất kỳ thư mục nào

![](./images/Linux权限命令.png)

Nội dung cột đầu tiên giải thích như sau:

![](./images/Linux权限解读.png)

> Dưới đây sẽ giải thích chi tiết loại tệp, quyền trong Linux và khái niệm chủ sở hữu, nhóm sở hữu, nhóm khác của tệp.

**Loại tệp:**

- d: Đại diện cho thư mục
- -: Đại diện cho tệp
- l: Đại diện cho soft link (có thể hiểu là shortcut trong Windows)

**Các loại quyền trong Linux:**

- r: Đại diện cho quyền đọc, r cũng có thể biểu thị bằng số 4
- w: Đại diện cho quyền ghi, w cũng có thể biểu thị bằng số 2
- x: Đại diện cho quyền thực thi, x cũng có thể biểu thị bằng số 1

**Sự khác biệt về quyền của tệp và thư mục:**

Đối với tệp và thư mục, đọc ghi thực thi có ý nghĩa khác nhau.

Với tệp:

| Tên quyền |           Thao tác có thể thực hiện |
| :-------- | ----------------------------------: |
| r         | Có thể dùng cat để xem nội dung tệp |
| w         |         Có thể sửa đổi nội dung tệp |
| x         |        Có thể chạy như tệp nhị phân |

Với thư mục:

| Tên quyền |           Thao tác có thể thực hiện |
| :-------- | ----------------------------------: |
| r         |  Có thể xem danh sách trong thư mục |
| w         | Có thể tạo và xóa tệp trong thư mục |
| x         |          Có thể dùng cd vào thư mục |

Cần lưu ý: **Super user có thể bỏ qua quyền của người dùng thông thường, kể cả quyền tệp thư mục là 000, vẫn có thể truy cập.**

**Trong Linux mỗi người dùng nhất định phải thuộc một nhóm, không thể đứng ngoài nhóm. Trong linux mỗi tệp có khái niệm chủ sở hữu, nhóm sở hữu, nhóm khác.**

- **Chủ sở hữu (u)**: Thường là người tạo tệp. Ai tạo tệp đó tự nhiên trở thành chủ sở hữu của tệp. Dùng lệnh `ls ‐ahl` có thể xem chủ sở hữu của tệp. Cũng có thể dùng `chown tên_người_dùng tên_tệp` để sửa đổi chủ sở hữu tệp.
- **Nhóm sở hữu (g)**: Khi một người dùng tạo tệp, nhóm sở hữu của tệp là nhóm của người dùng đó. Dùng lệnh `ls ‐ahl` có thể xem nhóm sở hữu của tệp. Cũng có thể dùng `chgrp tên_nhóm tên_tệp` để sửa đổi nhóm sở hữu tệp.
- **Nhóm khác (o)**: Ngoài chủ sở hữu và người dùng trong nhóm sở hữu của tệp, tất cả người dùng khác trong hệ thống là nhóm khác của tệp.

> Hãy xem lại cách sửa đổi quyền của tệp/thư mục.

**Lệnh sửa đổi quyền tệp/thư mục: `chmod`**

Ví dụ: Sửa đổi quyền của aaa.txt trong /test thành chủ sở hữu tệp có toàn quyền, nhóm sở hữu có quyền đọc ghi, người dùng khác chỉ có quyền đọc.

**`chmod u=rwx,g=rw,o=r aaa.txt`** hoặc **`chmod 764 aaa.txt`**

![](./images/修改文件权限.png)

**Thêm một thứ khá thường dùng:**

Giả sử chúng ta cài zookeeper, mỗi lần khởi động máy muốn nó tự khởi động thì làm thế nào?

1. Tạo script mới tên zookeeper
2. Thêm quyền thực thi cho script zookeeper mới tạo, lệnh là: `chmod +x zookeeper`
3. Thêm zookeeper vào mục khởi động cùng hệ thống, lệnh là: `chkconfig --add zookeeper`
4. Nếu muốn kiểm tra đã thêm thành công chưa, lệnh là: `chkconfig --list`

### Quản lý người dùng

Hệ điều hành Linux là hệ điều hành phân tán đa người dùng đa nhiệm. Bất kỳ người dùng nào muốn sử dụng tài nguyên hệ thống đều phải đăng ký tài khoản với quản trị viên hệ thống trước, sau đó dùng tài khoản đó để vào hệ thống.

Tài khoản người dùng một mặt có thể giúp quản trị viên hệ thống theo dõi người dùng đang sử dụng hệ thống và kiểm soát quyền truy cập tài nguyên; mặt khác cũng giúp người dùng tổ chức tệp và cung cấp bảo vệ bảo mật cho người dùng.

**Các lệnh quản lý người dùng Linux:**

- `useradd [tùy chọn] tên_người_dùng`: Tạo tài khoản người dùng. Tài khoản được tạo bởi lệnh `useradd` thực sự được lưu trong tệp văn bản `/etc/passwd`.
- `userdel [tùy chọn] tên_người_dùng`: Xóa tài khoản người dùng.
- `usermod [tùy chọn] tên_người_dùng`: Sửa đổi thuộc tính và cấu hình tài khoản người dùng như tên người dùng, ID người dùng, thư mục home.
- `passwd [tùy chọn] tên_người_dùng`: Đặt thông tin xác thực người dùng, bao gồm mật khẩu, thời gian hết hạn mật khẩu, v.v. Ví dụ: `passwd -S tên_người_dùng`, hiển thị thông tin mật khẩu tài khoản. `passwd -d tên_người_dùng`: Xóa mật khẩu người dùng, sẽ khiến người dùng không thể đăng nhập. `passwd tên_người_dùng`, sửa đổi mật khẩu người dùng, hệ thống sẽ nhắc nhập mật khẩu mới và xác nhận.
- `su [tùy chọn] tên_người_dùng` (su tức là Switch User, chuyển đổi người dùng): Chuyển đổi danh tính giữa người dùng hiện đang đăng nhập và người dùng khác.

### Quản lý nhóm người dùng

Mỗi người dùng có một nhóm người dùng, hệ thống có thể quản lý tập trung tất cả người dùng trong một nhóm. Các hệ thống Linux khác nhau có quy định khác nhau về nhóm người dùng, ví dụ trong Linux người dùng thuộc nhóm cùng tên với mình, nhóm này được tạo đồng thời khi tạo người dùng.

Quản lý nhóm người dùng bao gồm thêm, xóa và sửa đổi nhóm. Thêm, xóa và sửa đổi nhóm thực ra là cập nhật tệp `/etc/group`.

**Các lệnh quản lý nhóm người dùng trong hệ thống Linux:**

- `groupadd [tùy chọn] nhóm_người_dùng`: Thêm một nhóm người dùng mới.
- `groupdel nhóm_người_dùng`: Xóa một nhóm người dùng đã tồn tại.
- `groupmod [tùy chọn] nhóm_người_dùng`: Sửa đổi thuộc tính của nhóm người dùng.

### Trạng thái hệ thống

- `top [tùy chọn]`: Dùng để xem theo thời gian thực tỷ lệ sử dụng CPU, tỷ lệ sử dụng bộ nhớ, thông tin tiến trình, v.v. của hệ thống.
- `htop [tùy chọn]`: Tương tự `top` nhưng cung cấp giao diện tương tác và thân thiện hơn, cho phép người dùng thao tác tương tác, hỗ trợ chủ đề màu, có thể cuộn ngang hoặc dọc để duyệt danh sách tiến trình, và hỗ trợ thao tác chuột.
- `uptime [tùy chọn]`: Dùng để xem tổng thời gian hệ thống đã chạy, tải trung bình của hệ thống và các thông tin khác.
- `vmstat [khoảng_thời_gian] [số_lần_lặp]`: vmstat (Virtual Memory Statistics) có nghĩa là hiển thị trạng thái bộ nhớ ảo, nhưng nó có thể báo cáo trạng thái chạy tổng thể hệ thống về tiến trình, bộ nhớ, I/O, v.v.
- `free [tùy chọn]`: Dùng để xem tình trạng sử dụng bộ nhớ của hệ thống, bao gồm bộ nhớ đã dùng, khả dụng, bộ đệm và cache, v.v.
- `df [tùy chọn] [hệ_thống_tệp]`: Dùng để xem tình trạng sử dụng không gian đĩa của hệ thống, bao gồm tổng dung lượng, đã sử dụng và khả dụng của không gian đĩa. Ví dụ: `df -a`, xem tất cả hệ thống tệp.
- `du [tùy chọn] [tệp]`: Dùng để xem tình trạng sử dụng không gian đĩa của thư mục hoặc tệp chỉ định, có thể chỉ định các tùy chọn khác nhau để kiểm soát định dạng và đơn vị đầu ra.
- `sar [tùy chọn] [khoảng_thời_gian] [số_lần_lặp]`: Dùng để thu thập, báo cáo và phân tích thống kê hiệu năng của hệ thống, bao gồm thông tin chi tiết về sử dụng CPU, bộ nhớ, đĩa I/O, hoạt động mạng của hệ thống. Đặc điểm của nó là có thể liên tục lấy mẫu hệ thống để thu được lượng lớn dữ liệu mẫu. Dữ liệu mẫu và kết quả phân tích đều có thể lưu vào tệp, tiêu thụ tài nguyên hệ thống rất ít khi dùng.
- `ps [tùy chọn]`: Dùng để xem thông tin tiến trình trong hệ thống, bao gồm ID, trạng thái, tình trạng sử dụng tài nguyên của tiến trình. `ps -ef`/`ps -aux`: Hai lệnh này đều xem các tiến trình đang chạy trong hệ thống hiện tại, điểm khác nhau là định dạng hiển thị khác nhau. Nếu muốn xem tiến trình cụ thể có thể dùng định dạng này: `ps aux|grep redis` (xem tiến trình chứa chuỗi redis), cũng có thể dùng `pgrep redis -a`.
- `systemctl [lệnh] [tên_dịch_vụ]`: Dùng để quản lý các dịch vụ và đơn vị hệ thống, có thể xem trạng thái, khởi động, dừng, khởi động lại các dịch vụ hệ thống.

### Giao tiếp mạng

- `ping [tùy chọn] máy_chủ_đích`: Kiểm tra kết nối mạng với máy chủ đích.
- `ifconfig` hoặc `ip`: Dùng để xem thông tin giao diện mạng của hệ thống, bao gồm địa chỉ IP, địa chỉ MAC, trạng thái của giao diện mạng.
- `netstat [tùy chọn]`: Dùng để xem trạng thái kết nối mạng và thống kê mạng của hệ thống, có thể xem tình trạng kết nối mạng hiện tại, các cổng đang lắng nghe, giao thức mạng.
- `ss [tùy chọn]`: Tốt hơn `netstat`, cung cấp thông tin kết nối mạng nhanh và chi tiết hơn.
- `nload`: Cả `sar` và `nload` đều có thể theo dõi lưu lượng mạng, nhưng đầu ra của `sar` là dữ liệu dạng text, không đủ trực quan. `nload` là công cụ chuyên dùng để theo dõi lưu lượng mạng theo thời gian thực, cung cấp giao diện terminal đồ họa, trực quan hơn. Tuy nhiên, `nload` không lưu dữ liệu lịch sử nên không phù hợp để phân tích xu hướng dài hạn. Hơn nữa hệ thống không cài mặc định, cần cài thủ công.
- `sudo hostnamectl set-hostname tên_máy_chủ_mới`: Thay đổi tên máy chủ và vẫn có hiệu lực sau khi khởi động lại. `sudo hostname tên_máy_chủ_mới` cũng có thể thay đổi tên máy chủ. Tuy nhiên lưu ý rằng thay đổi tên máy chủ trực tiếp bằng lệnh `hostname` chỉ có hiệu lực tạm thời, sau khi khởi động lại hệ thống sẽ trở lại tên máy chủ ban đầu.

### Khác

- `sudo + lệnh_khác`: Thực thi lệnh với quyền quản trị viên hệ thống, tức là lệnh được thực thi qua sudo giống như root trực tiếp thực hiện.
- `grep [tùy chọn] "nội_dung_tìm_kiếm" đường_dẫn_tệp`: Lệnh tìm kiếm văn bản mạnh mẽ và thường dùng, có thể tìm kiếm khớp trong tệp hoặc đầu ra lệnh dựa trên chuỗi chỉ định hoặc biểu thức chính quy, phù hợp với nhiều tình huống như phân tích log, lọc văn bản, định vị nhanh. Ví dụ: Tìm kiếm bỏ qua hoa thường tất cả dòng chứa "error" trong syslog: `grep -i "error" /var/log/syslog`; tìm tất cả tiến trình liên quan đến java: `ps -ef | grep "java"`.
- `kill -9 pid_tiến_trình`: Giết tiến trình (-9 nghĩa là buộc dừng). Trước tiên dùng ps để tìm tiến trình, sau đó dùng kill để giết.
- `shutdown`: `shutdown -h now`: Chỉ định tắt máy ngay lập tức; `shutdown +5 "System will shutdown after 5 minutes"`: Chỉ định tắt máy sau 5 phút, đồng thời gửi thông báo cảnh báo đến người dùng đang đăng nhập.
- `reboot`: `reboot`: Khởi động lại máy. `reboot -w`: Mô phỏng khởi động lại (chỉ ghi log mà không thực sự khởi động lại).

## Biến môi trường Linux

Trong hệ thống Linux, biến môi trường là một số tham số dùng để định nghĩa môi trường chạy hệ thống, ví dụ thư mục home khác nhau của mỗi người dùng (HOME).

### Phân loại biến môi trường

Theo phạm vi, biến môi trường có thể chia đơn giản thành:

- Biến môi trường cấp người dùng: `~/.bashrc`, `~/.bash_profile`.
- Biến môi trường cấp hệ thống: `/etc/bashrc`, `/etc/environment`, `/etc/profile`, `/etc/profile.d`.

Thứ tự thực thi các tệp cấu hình trên là: `/etc/environment` -> `/etc/profile` -> `/etc/profile.d` -> `~/.bash_profile` -> `/etc/bashrc` -> `~/.bashrc`

Nếu muốn sửa đổi tệp biến môi trường cấp hệ thống, cần quản trị viên có quyền ghi vào tệp đó.

Khuyến nghị cấu hình biến môi trường cấp người dùng trong `~/.bash_profile`, cấu hình biến môi trường cấp hệ thống trong `/etc/profile.d`.

Theo vòng đời, biến môi trường có thể chia đơn giản thành:

- Vĩnh viễn: Cần người dùng sửa đổi tệp cấu hình liên quan, biến có hiệu lực vĩnh viễn.
- Tạm thời: Người dùng dùng lệnh `export` để khai báo biến môi trường trong terminal hiện tại, đóng terminal shell thì mất hiệu lực.

### Đọc biến môi trường

Lệnh `export` có thể xuất tất cả biến môi trường được định nghĩa trong hệ thống hiện tại.

```bash
# Liệt kê giá trị biến môi trường hiện tại
export -p
```

Ngoài lệnh `export`, lệnh `env` cũng có thể liệt kê tất cả biến môi trường.

Lệnh `echo` có thể xuất giá trị biến môi trường chỉ định.

```bash
# Xuất giá trị biến môi trường PATH hiện tại
echo $PATH
# Xuất giá trị biến môi trường HOME hiện tại
echo $HOME
```

### Sửa đổi biến môi trường

Lệnh `export` có thể sửa đổi biến môi trường chỉ định. Tuy nhiên cách này chỉ có hiệu lực với terminal shell hiện tại, đóng terminal shell sẽ mất hiệu lực. Sau khi sửa đổi xong, có hiệu lực ngay lập tức.

```bash
export CLASSPATH=./JAVA_HOME/lib;$JAVA_HOME/jre/lib
```

Sửa đổi tệp cấu hình biến môi trường bằng lệnh `vim`. Cách này sửa đổi biến môi trường có hiệu lực vĩnh viễn.

```bash
vim ~/.bash_profile
```

Nếu sửa đổi biến môi trường cấp hệ thống thì có hiệu lực với tất cả người dùng, nếu sửa đổi biến môi trường cấp người dùng thì chỉ có hiệu lực với người dùng hiện tại.

Sau khi sửa đổi xong, cần dùng lệnh `source` để áp dụng hoặc đóng terminal shell và đăng nhập lại.

```bash
source /etc/profile
```

<!-- @include: @article-footer.snippet.md -->
