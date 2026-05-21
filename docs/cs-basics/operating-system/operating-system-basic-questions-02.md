---
title: Tổng hợp câu hỏi phỏng vấn hệ điều hành thường gặp (Phần 2)
description: Tổng hợp câu hỏi phỏng vấn hệ điều hành tần suất cao mới nhất (Phần 2)：ánh xạ bộ nhớ ảo, phân mảnh bộ nhớ/Buddy System, TLB + xử lý page fault, so sánh phân trang và phân đoạn, thuật toán thay thế trang, hệ thống tệp & điều phối đĩa, kèm sơ đồ + chú thích điểm quan trọng, nắm vững kiến thức bộ nhớ/tệp OS trong một bài, vượt qua phỏng vấn backend nhanh chóng!
category: Kiến thức cơ bản máy tính
tag:
  - Hệ điều hành
head:
  - - meta
    - name: keywords
      content: 操作系统面试题,虚拟内存详解,分页 vs 分段,页面置换算法,内存碎片,伙伴系统,TLB快表,页缺失,文件系统基础,磁盘调度算法,硬链接 vs 软链接
---

<!-- @include: @article-header.snippet.md -->

## Quản lý bộ nhớ

### Quản lý bộ nhớ làm gì chủ yếu?

![Những việc chính mà quản lý bộ nhớ thực hiện](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/memory-management-roles.png)

Quản lý bộ nhớ của hệ điều hành rất quan trọng, chủ yếu chịu trách nhiệm các công việc sau:

- **Cấp phát và thu hồi bộ nhớ**: Cấp phát và giải phóng bộ nhớ theo nhu cầu của tiến trình, hàm malloc: xin cấp phát bộ nhớ, hàm free: giải phóng bộ nhớ.
- **Dịch địa chỉ**: Chuyển đổi địa chỉ ảo trong chương trình thành địa chỉ vật lý trong bộ nhớ.
- **Mở rộng bộ nhớ**: Khi hệ thống không đủ bộ nhớ, sử dụng kỹ thuật bộ nhớ ảo hoặc kỹ thuật overlay tự động để mở rộng bộ nhớ về mặt logic.
- **Ánh xạ bộ nhớ**: Ánh xạ trực tiếp một tệp vào không gian tiến trình, cho phép đọc và ghi nội dung tệp trực tiếp qua con trỏ bộ nhớ, tốc độ nhanh hơn.
- **Tối ưu bộ nhớ**: Tối ưu hiệu quả sử dụng bộ nhớ thông qua điều chỉnh chiến lược cấp phát và thuật toán thu hồi.
- **Bảo mật bộ nhớ**: Đảm bảo bộ nhớ được các tiến trình sử dụng không gây cản trở lẫn nhau, tránh một số chương trình độc hại phá hoại tính bảo mật của hệ thống thông qua sửa đổi bộ nhớ.
- ……

### Phân mảnh bộ nhớ là gì?

Phân mảnh bộ nhớ được tạo ra từ quá trình xin cấp phát và giải phóng bộ nhớ, thường chia thành hai loại sau:

- **Phân mảnh bộ nhớ bên trong (Internal Memory Fragmentation)**: Bộ nhớ đã được cấp phát cho tiến trình nhưng không được sử dụng. Nguyên nhân chính gây ra phân mảnh bộ nhớ bên trong là khi cấp phát bộ nhớ theo tỷ lệ cố định như lũy thừa của 2, bộ nhớ được cấp phát cho tiến trình có thể lớn hơn nhu cầu thực tế. Ví dụ, một tiến trình chỉ cần 65 byte bộ nhớ nhưng được cấp phát 128 (2^7) byte, thì 63 byte bộ nhớ trở thành phân mảnh bộ nhớ bên trong.
- **Phân mảnh bộ nhớ bên ngoài (External Memory Fragmentation)**: Do các vùng bộ nhớ liên tục chưa được cấp phát quá nhỏ, không thể đáp ứng bất kỳ yêu cầu cấp phát bộ nhớ nào của tiến trình. Các mảnh nhỏ và không liên tục này được gọi là phân mảnh bên ngoài. Tức là, phân mảnh bộ nhớ bên ngoài chỉ các vùng bộ nhớ chưa được cấp phát cho tiến trình nhưng cũng không thể sử dụng. Cơ chế phân đoạn được giới thiệu sau sẽ dẫn đến phân mảnh bộ nhớ bên ngoài.

![Phân mảnh bộ nhớ](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/internal-and-external-fragmentation.png)

Phân mảnh bộ nhớ dẫn đến giảm hiệu quả sử dụng bộ nhớ. Giảm thiểu phân mảnh bộ nhớ là điều quản lý bộ nhớ cần rất chú trọng.

### Các phương pháp quản lý bộ nhớ thường gặp là gì?

Phương pháp quản lý bộ nhớ có thể chia đơn giản thành hai loại:

- **Quản lý bộ nhớ liên tục**: Cấp phát một không gian bộ nhớ liên tục cho một chương trình người dùng, hiệu quả sử dụng bộ nhớ thường không cao.
- **Quản lý bộ nhớ không liên tục**: Cho phép bộ nhớ mà một chương trình sử dụng được phân bố trong các vùng bộ nhớ rời rạc hoặc không kề nhau, linh hoạt hơn tương đối.

#### Quản lý bộ nhớ liên tục

**Quản lý theo khối** là một phương pháp quản lý bộ nhớ liên tục của hệ điều hành máy tính thời kỳ đầu, tồn tại vấn đề phân mảnh bộ nhớ nghiêm trọng. Quản lý theo khối chia bộ nhớ thành một số khối có kích thước cố định, mỗi khối chỉ chứa một tiến trình. Nếu chương trình cần bộ nhớ để chạy, hệ điều hành cấp phát cho nó một khối; nếu chương trình chỉ cần không gian rất nhỏ, phần lớn khối bộ nhớ được cấp phát đó hầu như bị lãng phí. Những không gian chưa được sử dụng trong mỗi khối được gọi là phân mảnh bộ nhớ bên trong. Ngoài phân mảnh bộ nhớ bên trong, do giữa hai khối bộ nhớ có thể còn có phân mảnh bộ nhớ bên ngoài, những phân mảnh bên ngoài không liên tục này quá nhỏ nên không thể cấp phát tiếp.

Trong hệ thống Linux, quản lý bộ nhớ liên tục sử dụng **thuật toán Buddy System (Hệ thống bạn đồng hành)** để triển khai — đây là thuật toán cấp phát bộ nhớ liên tục kinh điển, có thể giải quyết hiệu quả vấn đề phân mảnh bộ nhớ bên ngoài. Tư tưởng chính của Buddy System là chia bộ nhớ theo lũy thừa của 2 (kích thước mỗi khối bộ nhớ đều là lũy thừa của 2, ví dụ 2^6 = 64 KB), và kết hợp các khối bộ nhớ liền kề thành một cặp "bạn đồng hành" (lưu ý: **chỉ những khối liền kề mới là bạn đồng hành**).

Khi cấp phát bộ nhớ, Buddy System sẽ cố gắng tìm khối bộ nhớ có kích thước phù hợp nhất. Nếu khối bộ nhớ tìm được quá lớn, sẽ chia đôi thành hai khối có kích thước bằng nhau. Nếu vẫn còn lớn thì tiếp tục chia, cho đến khi đạt kích thước phù hợp.

Giả sử hai khối bộ nhớ liền kề đều được giải phóng, hệ thống sẽ hợp nhất hai khối bộ nhớ đó thành một khối lớn hơn, để thuận tiện cho việc cấp phát bộ nhớ sau. Như vậy có thể giảm vấn đề phân mảnh bộ nhớ, nâng cao hiệu quả sử dụng bộ nhớ.

![Quản lý bộ nhớ Buddy System](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/linux-buddy-system.png)

Dù đã giải quyết vấn đề phân mảnh bộ nhớ bên ngoài, Buddy System vẫn tồn tại vấn đề hiệu quả sử dụng bộ nhớ không cao (phân mảnh bộ nhớ bên trong). Chủ yếu là vì Buddy System chỉ có thể cấp phát khối bộ nhớ có kích thước 2^n, nên khi kích thước bộ nhớ cần cấp phát không phải bội số nguyên của 2^n, sẽ lãng phí một lượng bộ nhớ nhất định. Ví dụ: nếu cần cấp phát 65 byte bộ nhớ, vẫn phải cấp phát khối bộ nhớ có kích thước 2^7 = 128 byte.

![Vấn đề lãng phí bộ nhớ của Buddy System](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/buddy-system-memory-waste.png)

Với vấn đề phân mảnh bộ nhớ bên trong, Linux sử dụng **SLAB** để giải quyết. Vì nội dung này không phải trọng tâm của bài viết, nên sẽ không giới thiệu chi tiết ở đây.

#### Quản lý bộ nhớ không liên tục

Quản lý bộ nhớ không liên tục có 3 phương pháp:

- **Quản lý theo đoạn (Segmentation)**: Quản lý/cấp phát bộ nhớ vật lý dưới dạng đoạn (một đoạn bộ nhớ vật lý liên tục). Không gian địa chỉ ảo của ứng dụng được chia thành các đoạn có kích thước không bằng nhau; đoạn có ý nghĩa thực tế, mỗi đoạn định nghĩa một nhóm thông tin logic, ví dụ có đoạn chương trình chính MAIN, đoạn chương trình con X, đoạn dữ liệu D và đoạn stack S.
- **Quản lý theo trang (Paging)**: Chia bộ nhớ vật lý thành các trang vật lý liên tục có độ dài bằng nhau, không gian địa chỉ ảo của ứng dụng cũng được chia thành các trang ảo liên tục có độ dài bằng nhau, là phương pháp quản lý bộ nhớ được các hệ điều hành hiện đại sử dụng rộng rãi.
- **Cơ chế quản lý đoạn-trang**: Cơ chế quản lý bộ nhớ kết hợp quản lý theo đoạn và theo trang, chia bộ nhớ vật lý thành một số đoạn trước, mỗi đoạn tiếp tục chia thành nhiều trang có kích thước bằng nhau.

### Bộ nhớ ảo

#### Bộ nhớ ảo là gì? Có tác dụng gì?

**Bộ nhớ ảo (Virtual Memory)** là một kỹ thuật rất quan trọng trong quản lý bộ nhớ của hệ thống máy tính. Về bản chất, nó chỉ tồn tại về mặt logic — là một không gian bộ nhớ tưởng tượng, chủ yếu đóng vai trò là cầu nối để tiến trình truy cập bộ nhớ chính (bộ nhớ vật lý) và đơn giản hóa việc quản lý bộ nhớ.

![Bộ nhớ ảo như cầu nối để tiến trình truy cập bộ nhớ chính](https://oss.javaguide.cn/xingqiu/virtual-memory.png)

Tóm lại, bộ nhớ ảo cung cấp các khả năng sau:

- **Cô lập tiến trình**: Bộ nhớ vật lý được truy cập thông qua không gian địa chỉ ảo, không gian địa chỉ ảo tương ứng 1-1 với tiến trình. Mỗi tiến trình đều nghĩ mình sở hữu toàn bộ bộ nhớ vật lý; các tiến trình cách ly với nhau, code trong một tiến trình không thể thay đổi bộ nhớ vật lý đang được tiến trình khác hoặc hệ điều hành sử dụng.
- **Nâng cao hiệu quả sử dụng bộ nhớ vật lý**: Với không gian địa chỉ ảo, hệ điều hành chỉ cần nạp vào bộ nhớ vật lý phần dữ liệu hoặc lệnh mà tiến trình đang sử dụng.
- **Đơn giản hóa quản lý bộ nhớ**: Mỗi tiến trình đều có không gian địa chỉ ảo nhất quán và riêng tư, lập trình viên không cần làm việc trực tiếp với bộ nhớ vật lý thực sự, mà truy cập bộ nhớ vật lý qua không gian địa chỉ ảo, đơn giản hóa quản lý bộ nhớ.
- **Nhiều tiến trình chia sẻ bộ nhớ vật lý**: Trong quá trình chạy, tiến trình sẽ nạp nhiều thư viện động của hệ điều hành. Những thư viện này là chung cho mỗi tiến trình, thực tế chỉ nạp một lần trong bộ nhớ — phần này được gọi là shared memory.
- **Nâng cao tính bảo mật khi sử dụng bộ nhớ**: Kiểm soát quyền truy cập bộ nhớ vật lý của tiến trình, cô lập quyền truy cập của các tiến trình khác nhau, nâng cao tính bảo mật của hệ thống.
- **Cung cấp không gian bộ nhớ khả dụng lớn hơn**: Có thể cho phép chương trình có không gian bộ nhớ khả dụng vượt quá kích thước bộ nhớ vật lý của hệ thống. Vì khi bộ nhớ vật lý không đủ, có thể sử dụng đĩa thay thế, lưu các trang bộ nhớ vật lý (thường 4 KB) vào tệp đĩa (ảnh hưởng đến tốc độ đọc ghi). Dữ liệu hoặc trang code sẽ được di chuyển giữa bộ nhớ vật lý và đĩa theo nhu cầu.

#### Không có bộ nhớ ảo thì có vấn đề gì?

Nếu không có bộ nhớ ảo, chương trình truy cập và thao tác trực tiếp trên bộ nhớ vật lý — dường như ít một lớp trung gian hơn, nhưng lại phát sinh nhiều vấn đề hơn.

**Cụ thể có những vấn đề gì?** Đây là một số ví dụ (tham chiếu các khả năng bộ nhớ ảo cung cấp để trả lời câu hỏi này):

1. Chương trình người dùng có thể truy cập bất kỳ bộ nhớ vật lý nào, có thể vô tình thao tác vào bộ nhớ cần thiết cho hệ điều hành, dẫn đến crash hệ điều hành, ảnh hưởng nghiêm trọng đến tính bảo mật hệ thống.
2. Chạy nhiều chương trình cùng lúc dễ crash. Ví dụ bạn muốn chạy cùng lúc WeChat và QQ Music, WeChat khi chạy gán giá trị cho địa chỉ bộ nhớ 1xxx, QQ Music cũng gán giá trị cho địa chỉ bộ nhớ 1xxx, thì giá trị gán của QQ Music sẽ ghi đè lên giá trị WeChat đã gán trước đó, điều này có thể khiến chương trình WeChat crash.
3. Tất cả dữ liệu và lệnh sử dụng trong quá trình chạy chương trình đều phải nạp vào bộ nhớ vật lý. Theo nguyên lý cục bộ, trong đó có một phần lớn có thể không bao giờ được sử dụng đến, lãng phí tài nguyên bộ nhớ vật lý quý báu.
4. ……

#### Địa chỉ ảo và địa chỉ vật lý là gì?

**Địa chỉ vật lý (Physical Address)** là địa chỉ trong bộ nhớ vật lý thực sự, cụ thể hơn là địa chỉ trong thanh ghi địa chỉ bộ nhớ. Địa chỉ bộ nhớ được truy cập trong chương trình không phải là địa chỉ vật lý, mà là **địa chỉ ảo (Virtual Address)**.

Tức là, khi lập trình phát triển, thực ra chúng ta đang làm việc với địa chỉ ảo. Ví dụ trong ngôn ngữ C, giá trị số lưu trong con trỏ có thể hiểu là một địa chỉ trong bộ nhớ — địa chỉ đó chính là địa chỉ ảo chúng ta nói đến.

Hệ điều hành thường chuyển đổi địa chỉ ảo thành địa chỉ vật lý thông qua một thành phần quan trọng trong chip CPU là **MMU (Memory Management Unit - Đơn vị quản lý bộ nhớ)**. Quá trình này được gọi là **dịch địa chỉ/chuyển đổi địa chỉ (Address Translation)**.

![Quá trình dịch địa chỉ](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/physical-virtual-address-translation.png)

Sau khi MMU chuyển đổi địa chỉ ảo thành địa chỉ vật lý, tiếp tục truyền qua bus đến thiết bị bộ nhớ vật lý, từ đó hoàn thành yêu cầu đọc ghi bộ nhớ vật lý tương ứng.

Hai cơ chế chính để MMU dịch địa chỉ ảo thành địa chỉ vật lý là: **cơ chế phân đoạn** và **cơ chế phân trang**.

#### Không gian địa chỉ ảo và không gian địa chỉ vật lý là gì?

- Không gian địa chỉ ảo là tập hợp các địa chỉ ảo, là phạm vi của bộ nhớ ảo. Mỗi tiến trình có một không gian địa chỉ ảo nhất quán và riêng tư.
- Không gian địa chỉ vật lý là tập hợp các địa chỉ vật lý, là phạm vi của bộ nhớ vật lý.

#### Địa chỉ ảo và địa chỉ bộ nhớ vật lý được ánh xạ như thế nào?

MMU có 3 cơ chế chính để dịch địa chỉ ảo thành địa chỉ vật lý:

1. Cơ chế phân đoạn
2. Cơ chế phân trang
3. Cơ chế đoạn-trang

Trong đó, hệ điều hành hiện đại sử dụng rộng rãi cơ chế phân trang — cần chú trọng đặc biệt!

### Cơ chế phân đoạn

**Cơ chế phân đoạn (Segmentation)** quản lý/cấp phát bộ nhớ vật lý dưới dạng đoạn (một đoạn bộ nhớ vật lý **liên tục**). Không gian địa chỉ ảo của ứng dụng được chia thành các đoạn có kích thước không bằng nhau; đoạn có ý nghĩa thực tế, mỗi đoạn định nghĩa một nhóm thông tin logic, ví dụ có đoạn chương trình chính MAIN, đoạn chương trình con X, đoạn dữ liệu D và đoạn stack S.

#### Bảng đoạn có tác dụng gì? Quá trình dịch địa chỉ diễn ra như thế nào?

Quản lý phân đoạn ánh xạ địa chỉ ảo và địa chỉ vật lý thông qua **Bảng đoạn (Segment Table)**.

Địa chỉ ảo trong cơ chế phân đoạn gồm hai phần:

- **Số đoạn (Segment Number)**: Xác định địa chỉ ảo này thuộc đoạn nào trong toàn bộ không gian địa chỉ ảo.
- **Offset trong đoạn**: Offset so với địa chỉ bắt đầu của đoạn đó.

Quá trình dịch địa chỉ cụ thể như sau:

1. MMU trước tiên phân tích lấy số đoạn trong địa chỉ ảo;
2. Dùng số đoạn tra trong bảng đoạn của ứng dụng để lấy thông tin đoạn tương ứng (tìm mục bảng đoạn tương ứng);
3. Lấy địa chỉ bắt đầu (địa chỉ vật lý) của đoạn đó từ thông tin đoạn, cộng với offset trong đoạn trong địa chỉ ảo để ra địa chỉ vật lý cuối cùng.

![Quá trình dịch địa chỉ trong cơ chế phân đoạn](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/segment-virtual-address-composition.png)

Bảng đoạn còn lưu thông tin như độ dài đoạn (có thể dùng để kiểm tra địa chỉ ảo có vượt quá phạm vi hợp lệ không), loại đoạn (ví dụ đoạn code, đoạn dữ liệu) và các thông tin khác.

**Dùng số đoạn nhất định tìm được mục bảng đoạn tương ứng không? Tìm được địa chỉ vật lý cuối cùng rồi, bộ nhớ vật lý tương ứng nhất định tồn tại không?**

Không nhất thiết. Mục bảng đoạn có thể không tồn tại:

- **Mục bảng đoạn bị xóa**: Lỗi phần mềm, hành vi phần mềm độc hại và các tình huống khác có thể dẫn đến mục bảng đoạn bị xóa.
- **Mục bảng đoạn chưa được tạo**: Nếu hệ thống thiếu bộ nhớ hoặc không thể cấp phát khối bộ nhớ vật lý liên tục thì mục bảng đoạn không thể được tạo ra.

#### Tại sao cơ chế phân đoạn gây ra phân mảnh bộ nhớ bên ngoài?

Cơ chế phân đoạn dễ xuất hiện phân mảnh bộ nhớ bên ngoài, tức là để lại các khoảng trống phân mảnh giữa các đoạn (không đủ để ánh xạ cho các đoạn trong không gian địa chỉ ảo), dẫn đến giảm hiệu quả sử dụng tài nguyên bộ nhớ vật lý.

Ví dụ: Giả sử hệ thống có 5GB bộ nhớ vật lý khả dụng sử dụng cơ chế phân đoạn để cấp phát bộ nhớ. Hiện có 4 tiến trình, mỗi tiến trình chiếm dụng bộ nhớ như sau:

- Tiến trình 1: 0~1GB (đoạn 1)
- Tiến trình 2: 1~3GB (đoạn 2)
- Tiến trình 3: 3~4,5GB (đoạn 3)
- Tiến trình 4: 4,5~5GB (đoạn 4)

Lúc này, chúng ta đóng tiến trình 1 và tiến trình 4, thì bộ nhớ đoạn 1 và đoạn 4 sẽ được giải phóng, còn 1,5GB bộ nhớ vật lý trống. Vì 1,5GB bộ nhớ vật lý này không liên tục, nên không thể cấp phát bộ nhớ trống cho một tiến trình cần 1,5GB bộ nhớ vật lý.

![Phân mảnh bộ nhớ bên ngoài do cơ chế phân đoạn](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/segment-external-memory-fragmentation.png)

### Cơ chế phân trang

**Cơ chế phân trang (Paging)** chia bộ nhớ chính (bộ nhớ vật lý) thành các trang vật lý liên tục có độ dài bằng nhau, không gian địa chỉ ảo của ứng dụng cũng được chia thành các trang ảo liên tục có độ dài bằng nhau. Các hệ điều hành hiện đại sử dụng rộng rãi cơ chế phân trang.

**Lưu ý: Các trang ở đây có độ dài bằng nhau và liên tục, khác với các đoạn có độ dài khác nhau trong cơ chế phân đoạn.**

Trong cơ chế phân trang, bất kỳ trang ảo nào trong không gian địa chỉ ảo của ứng dụng đều có thể được ánh xạ đến bất kỳ trang vật lý nào trong bộ nhớ vật lý, do đó có thể thực hiện phân bổ rời rạc tài nguyên bộ nhớ vật lý. Cơ chế phân trang cấp phát bộ nhớ vật lý theo kích thước trang cố định, giúp tài nguyên bộ nhớ vật lý dễ quản lý, có thể tránh hiệu quả vấn đề phân mảnh bộ nhớ bên ngoài trong cơ chế phân đoạn.

#### Bảng trang có tác dụng gì? Quá trình dịch địa chỉ diễn ra như thế nào?

Quản lý phân trang ánh xạ địa chỉ ảo và địa chỉ vật lý thông qua **Bảng trang (Page Table)**. Đây là sơ đồ minh họa quá trình dịch địa chỉ dựa trên bảng trang đơn cấp.

![Bảng trang đơn cấp](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/page-table.png)

Trong cơ chế phân trang, mỗi tiến trình sẽ có một bảng trang tương ứng.

Địa chỉ ảo trong cơ chế phân trang gồm hai phần:

- **Số trang (Page Number)**: Qua số trang ảo có thể tra trong bảng trang để lấy số trang vật lý tương ứng;
- **Offset trong trang**: Địa chỉ bắt đầu trang vật lý + offset trong trang = địa chỉ bộ nhớ vật lý.

Quá trình dịch địa chỉ cụ thể như sau:

1. MMU trước tiên phân tích lấy số trang ảo trong địa chỉ ảo;
2. Dùng số trang ảo tra trong bảng trang của ứng dụng để lấy số trang vật lý tương ứng (tìm mục bảng trang tương ứng);
3. Dùng địa chỉ bắt đầu trang vật lý (địa chỉ vật lý) tương ứng với số trang vật lý đó cộng với offset trong trang trong địa chỉ ảo để ra địa chỉ vật lý cuối cùng.

![Quá trình dịch địa chỉ trong cơ chế phân trang](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/paging-virtual-address-composition.png)

Bảng trang còn lưu các thông tin như flag truy cập (xác định trang đó đã được truy cập chưa), bit đánh dấu dữ liệu dirty và các thông tin khác.

**Dùng số trang ảo nhất định tìm được số trang vật lý tương ứng không? Tìm được số trang vật lý rồi có ra địa chỉ vật lý cuối cùng, trang vật lý tương ứng nhất định tồn tại không?**

Không nhất thiết! Có thể xuất hiện **page fault (lỗi trang)**. Tức là bộ nhớ vật lý không có trang vật lý tương ứng, hoặc bộ nhớ vật lý có trang vật lý tương ứng nhưng trang ảo chưa thiết lập ánh xạ với trang vật lý (mục bảng trang tương ứng không tồn tại). Về page fault, phần sau sẽ giới thiệu chi tiết.

#### Bảng trang đơn cấp có vấn đề gì? Tại sao cần bảng trang đa cấp?

Lấy môi trường 32 bit làm ví dụ, phạm vi không gian địa chỉ ảo là 2^32 (4GB). Giả sử kích thước một trang là 2^12 (4KB), thì tổng số mục bảng trang là 4G / 4K = 2^20. Mỗi mục bảng trang là một địa chỉ, chiếm 4 byte: `(2^20 × 2^2) / (1024 × 1024) = 4MB`. Tức là một chương trình chưa làm gì mà kích thước bảng trang đã chiếm 4MB.

Khi có nhiều ứng dụng đang chạy trong hệ thống, chi phí bảng trang vẫn rất lớn. Hơn nữa, phần lớn ứng dụng có thể chỉ dùng một vài mục trong bảng trang, các mục còn lại bị lãng phí.

Để giải quyết vấn đề này, hệ điều hành giới thiệu **bảng trang đa cấp** — bảng trang đa cấp tương ứng với nhiều bảng trang, mỗi bảng trang liên kết với bảng trang trước đó. Hệ thống 32 bit thường dùng bảng trang hai cấp, hệ thống 64 bit thường dùng bảng trang bốn cấp.

Lấy bảng trang hai cấp làm ví dụ: Bảng trang hai cấp chia thành bảng trang cấp một và bảng trang cấp hai. Bảng trang cấp một có 1024 mục bảng trang, bảng trang cấp một liên kết với bảng trang cấp hai, bảng trang cấp hai cũng có 1024 mục bảng trang. Mối quan hệ giữa mục bảng trang cấp một và bảng trang cấp hai là một-nhiều; bảng trang cấp hai được nạp theo nhu cầu (chỉ dùng đến một phần nhỏ bảng trang cấp hai), từ đó tiết kiệm không gian.

Giả sử chỉ cần 2 bảng trang cấp hai, thì bộ nhớ chiếm dụng của bảng trang hai cấp là: 4KB (bảng trang cấp một) + 4KB × 2 (bảng trang cấp hai) = 12 KB.

![Bảng trang đa cấp](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/multilevel-page-table.png)

Bảng trang đa cấp là kịch bản điển hình của đánh đổi thời gian lấy không gian — dùng cách tăng số lần tra bảng trang để giảm không gian mà bảng trang chiếm dụng.

#### TLB có tác dụng gì? Luồng dịch địa chỉ sau khi sử dụng TLB là thế nào?

Để nâng cao tốc độ chuyển đổi từ địa chỉ ảo sang địa chỉ vật lý, hệ điều hành giới thiệu **TLB (Translation Lookaside Buffer - Bộ đệm dịch địa chỉ nhanh, còn gọi là bảng tra nhanh)** trên nền **giải pháp bảng trang**.

![Dịch địa chỉ sau khi thêm TLB](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/physical-virtual-address-translation-mmu.png)

Trong kiến trúc AArch64 và x86-64 chủ lưu, TLB thuộc về đơn vị bên trong MMU (Memory Management Unit), về bản chất là một bộ nhớ cache tốc độ cao, lưu cache ánh xạ từ số trang ảo đến số trang vật lý — bạn có thể xem nó đơn giản như một bảng hash lưu các cặp key (số trang ảo) - value (số trang vật lý).

Luồng dịch địa chỉ sau khi sử dụng TLB như sau:

1. Dùng số trang ảo trong địa chỉ ảo làm key để tra trong TLB;
2. Nếu tra được trang vật lý tương ứng thì không cần tra bảng trang nữa, trường hợp này gọi là TLB hit (TLB trúng).
3. Nếu không tra được trang vật lý tương ứng thì vẫn phải tra bảng trang trong bộ nhớ chính, đồng thời thêm mục ánh xạ đó trong bảng trang vào TLB; trường hợp này gọi là TLB miss (TLB không trúng).
4. Khi TLB đầy mà cần đăng ký trang mới, sẽ loại bỏ một trang trong TLB theo chiến lược loại bỏ nhất định.

![Luồng dịch địa chỉ sau khi sử dụng TLB](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/page-table-tlb.png)

Vì bảng trang cũng ở trong bộ nhớ chính, nên trước khi có TLB, mỗi lần đọc ghi dữ liệu bộ nhớ CPU phải truy cập bộ nhớ chính hai lần. Với TLB, dữ liệu bảng trang tồn tại trong TLB chỉ cần truy cập bộ nhớ chính một lần.

Ý tưởng thiết kế TLB rất đơn giản, nhưng tỷ lệ hit thường rất cao và hiệu quả tốt. Đây là vì các trang được truy cập thường xuyên chỉ là một phần rất nhỏ.

Sau khi đọc xong bạn sẽ thấy bảng tra nhanh rất giống với cache (ví dụ Redis) mà chúng ta thường dùng trong phát triển hệ thống — đúng vậy, nhiều tư tưởng trong hệ điều hành, nhiều thuật toán kinh điển, bạn đều có thể tìm thấy bóng dáng của chúng trong các công cụ hoặc framework mà chúng ta dùng hàng ngày.

#### Cơ chế swap có tác dụng gì?

Tư tưởng của cơ chế swap (hoán đổi trang) là khi bộ nhớ vật lý không đủ, hệ điều hành chọn đưa nội dung một số trang vật lý ra đĩa, khi cần dùng lại thì đọc chúng trở lại bộ nhớ vật lý. Tức là, cơ chế swap dùng thiết bị lưu trữ đĩa giá rẻ hơn để mở rộng bộ nhớ vật lý.

Điều này cũng giải thích một vấn đề thường gặp khi dùng máy tính: Tại sao ngay cả khi tổng bộ nhớ vật lý cần thiết để chạy tất cả tiến trình trong hệ điều hành lớn hơn bộ nhớ vật lý thực tế, các tiến trình đó vẫn có thể chạy bình thường — chỉ là tốc độ chạy sẽ chậm hơn.

Đây cũng là chiến lược đánh đổi thời gian lấy không gian — bạn dùng thời gian tính toán của CPU, thời gian tốn vào việc nạp và xuất trang, để đổi lấy một không gian bộ nhớ vật lý ảo lớn hơn để hỗ trợ chương trình chạy.

#### Page fault là gì?

Theo Wikipedia:

> Page fault (lỗi trang, còn gọi là hard error, hard interrupt, paging error, page miss, page interrupt, page fault, v.v.) là ngắt do MMU phát sinh khi phần mềm cố gắng truy cập một trang đã được ánh xạ trong không gian địa chỉ ảo nhưng hiện tại chưa được nạp vào bộ nhớ vật lý.

Hai loại page fault thường gặp:

- **Hard Page Fault**: Bộ nhớ vật lý không có trang vật lý tương ứng. Khi đó, Page Fault Handler sẽ chỉ định CPU đọc nội dung tương ứng từ tệp đĩa đã mở vào bộ nhớ vật lý, sau đó giao cho MMU thiết lập ánh xạ giữa trang ảo và trang vật lý tương ứng.
- **Soft Page Fault**: Bộ nhớ vật lý có trang vật lý tương ứng, nhưng trang ảo chưa thiết lập ánh xạ với trang vật lý. Khi đó, Page Fault Handler sẽ chỉ định MMU thiết lập ánh xạ giữa trang ảo và trang vật lý tương ứng.

Khi xảy ra hai loại page fault trên, ứng dụng đang truy cập bộ nhớ vật lý hợp lệ, chỉ là xuất hiện vấn đề trang vật lý bị thiếu hoặc chưa thiết lập ánh xạ giữa trang ảo và trang vật lý. Nếu ứng dụng truy cập bộ nhớ vật lý không hợp lệ, sẽ còn xuất hiện **Invalid Page Fault (lỗi trang không hợp lệ)**.

#### Các thuật toán thay thế trang thường gặp là gì?

Khi xảy ra hard page fault, nếu bộ nhớ vật lý không có trang vật lý trống nào khả dụng, hệ điều hành phải loại bỏ một trang vật lý trong bộ nhớ vật lý, như vậy có thể nhường không gian để nạp trang mới.

Quy tắc để chọn loại bỏ trang vật lý nào được gọi là **thuật toán thay thế trang** — có thể xem thuật toán thay thế trang là quy tắc loại bỏ trang vật lý.

Nếu page fault xảy ra quá thường xuyên sẽ ảnh hưởng rất nhiều đến hiệu năng. Một thuật toán thay thế trang tốt nên giảm được số lần xuất hiện page fault.

Có 5 thuật toán thay thế trang thường gặp sau (các thuật toán khác phần lớn được cải tiến từ các thuật toán này):

![Các thuật toán thay thế trang thường gặp](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/image-20230409113009139.png)

1. **Thuật toán thay thế trang tối ưu (OPT, Optimal)**: Ưu tiên loại bỏ trang không bao giờ được dùng lại trong tương lai, hoặc trang không được truy cập trong thời gian dài nhất, như vậy có thể đảm bảo tỷ lệ page fault thấp nhất. Nhưng vì hiện tại không thể dự đoán trước trang nào trong số các trang bộ nhớ của tiến trình sẽ không được truy cập trong thời gian dài nhất trong tương lai, nên thuật toán này không thể triển khai, chỉ là thuật toán thay thế trang tối ưu về mặt lý thuyết, có thể dùng làm tiêu chuẩn để đánh giá các thuật toán thay thế khác.
2. **Thuật toán thay thế trang vào trước ra trước (FIFO, First In First Out)**: Thuật toán thay thế trang đơn giản nhất, luôn loại bỏ trang vào bộ nhớ sớm nhất, tức là chọn trang lưu trú trong bộ nhớ lâu nhất để loại bỏ. Thuật toán này dễ triển khai và hiểu, thường chỉ cần một hàng đợi FIFO là đủ. Tuy nhiên hiệu năng của nó không tốt lắm.
3. **Thuật toán thay thế trang ít được dùng gần đây nhất (LRU, Least Recently Used)**: LRU gán cho mỗi trang một trường truy cập, dùng để ghi lại thời gian T kể từ lần truy cập cuối cùng của trang đó. Khi cần loại bỏ một trang, chọn trang có giá trị T lớn nhất trong các trang hiện tại, tức là trang ít được dùng gần đây nhất để loại bỏ. LRU triển khai dựa trên lịch sử truy cập các trang trước đó, nên dễ triển khai. OPT triển khai dựa trên lịch sử truy cập các trang trong tương lai, nên không thể triển khai.
4. **Thuật toán thay thế trang ít sử dụng nhất (LFU, Least Frequently Used)**: Khá giống LRU, nhưng thuật toán thay thế này chọn trang được sử dụng ít nhất trong một khoảng thời gian trước đó làm trang loại bỏ.
5. **Thuật toán thay thế trang Clock**: Có thể xem là một loại thuật toán gần đây chưa dùng (NRU - Not Recently Used), tức là trang bị loại bỏ là trang gần đây chưa được sử dụng.

**Tại sao hiệu năng của thuật toán thay thế trang FIFO không tốt?**

Có hai nguyên nhân chính:

1. **Các trang được truy cập thường xuyên hoặc cần tồn tại lâu dài sẽ bị nạp và xuất liên tục**: Các trang được nạp sớm hơn thường là những trang được truy cập thường xuyên hoặc cần tồn tại lâu dài, những trang này sẽ bị nạp và xuất liên tục.
2. **Tồn tại hiện tượng Belady**: Trang bị thay thế không phải là trang tiến trình không truy cập, đôi khi sẽ xuất hiện hiện tượng bất thường khi số trang được cấp phát tăng lên nhưng tỷ lệ page fault lại tăng. Nguyên nhân xuất hiện hiện tượng bất thường này là vì thuật toán FIFO chỉ xét thứ tự vào bộ nhớ của trang, mà không xét tần suất và mức độ cấp bách khi truy cập trang.

**Thuật toán thay thế trang nào được dùng nhiều trong thực tế?**

LRU là thuật toán được dùng nhiều trong thực tế, và được xem là thuật toán thay thế trang gần nhất với OPT.

Tuy nhiên cần lưu ý rằng trong ứng dụng thực tế, các thuật toán này sẽ được cải tiến. Ví dụ InnoDB Buffer Pool (bộ đệm InnoDB, cơ chế quản lý trang cache trong cơ sở dữ liệu MySQL) đã cải tiến thuật toán LRU truyền thống, sử dụng thuật toán gọi là "Adaptive LRU" (kết hợp tư tưởng của cả LRU và LFU).

### Cơ chế phân trang và cơ chế phân đoạn có điểm chung và khác biệt gì?

**Điểm chung**:

- Đều là phương pháp quản lý bộ nhớ không liên tục.
- Đều sử dụng phương pháp ánh xạ địa chỉ, ánh xạ địa chỉ ảo sang địa chỉ vật lý để thực hiện quản lý và bảo vệ bộ nhớ.

**Khác biệt**:

- Cơ chế phân trang quản lý bộ nhớ theo đơn vị trang, còn cơ chế phân đoạn quản lý bộ nhớ theo đơn vị đoạn. Kích thước trang là cố định, do hệ điều hành quyết định, thường là lũy thừa của 2. Còn kích thước đoạn không cố định, phụ thuộc vào chương trình đang chạy.
- Trang là đơn vị vật lý, tức là hệ điều hành chia bộ nhớ vật lý thành các trang có kích thước cố định, thường là lũy thừa của 2 như 4KB, 8KB, v.v. Còn đoạn là đơn vị logic, được thiết kế để đáp ứng nhu cầu logic của chương trình về không gian bộ nhớ, thường được chia dựa trên cấu trúc logic của dữ liệu và code trong chương trình.
- Cơ chế phân đoạn dễ xuất hiện phân mảnh bộ nhớ bên ngoài, tức là để lại các khoảng trống phân mảnh giữa các đoạn (không đủ để ánh xạ cho các đoạn trong không gian địa chỉ ảo). Cơ chế phân trang giải quyết vấn đề phân mảnh bộ nhớ bên ngoài, nhưng vẫn có thể xuất hiện phân mảnh bộ nhớ bên trong.
- Cơ chế phân trang sử dụng bảng trang để hoàn thành ánh xạ từ địa chỉ ảo sang địa chỉ vật lý, bảng trang thực hiện ánh xạ đa cấp thông qua bảng trang cấp một và cấp hai; còn cơ chế phân đoạn sử dụng bảng đoạn để hoàn thành ánh xạ từ địa chỉ ảo sang địa chỉ vật lý, trong mỗi mục bảng đoạn ghi thông tin địa chỉ bắt đầu và độ dài của đoạn đó.
- Cơ chế phân trang không có yêu cầu gì đối với chương trình, chương trình chỉ cần truy cập theo địa chỉ ảo là được; còn cơ chế phân đoạn yêu cầu lập trình viên chia chương trình thành nhiều đoạn, và sử dụng thanh ghi đoạn để truy cập các đoạn khác nhau một cách tường minh.

### Cơ chế đoạn-trang

Cơ chế quản lý bộ nhớ kết hợp quản lý theo đoạn và theo trang. Từ góc nhìn của chương trình, bộ nhớ được chia thành nhiều đoạn logic, mỗi đoạn logic tiếp tục được chia thành các trang có kích thước cố định.

Trong cơ chế đoạn-trang, quá trình dịch địa chỉ chia thành hai bước:

1. **Ánh xạ địa chỉ kiểu đoạn (địa chỉ ảo → địa chỉ tuyến tính):**
   - Địa chỉ ảo = Bộ chọn đoạn (số đoạn) + Offset trong đoạn.
   - Tra bảng đoạn theo số đoạn, tìm địa chỉ cơ sở đoạn, cộng với offset trong đoạn để ra địa chỉ tuyến tính.
2. **Ánh xạ địa chỉ kiểu trang (địa chỉ tuyến tính → địa chỉ vật lý):**
   - Địa chỉ tuyến tính = Số trang + Offset trong trang.
   - Tra bảng trang theo số trang, tìm số khung trang vật lý, cộng với offset trong trang để ra địa chỉ vật lý.

### Nguyên lý cục bộ

Để hiểu tốt hơn kỹ thuật bộ nhớ ảo, nhất thiết phải biết **Nguyên lý cục bộ (Locality Principle)** nổi tiếng trong máy tính. Ngoài ra, nguyên lý cục bộ áp dụng được cho cả cấu trúc chương trình lẫn cấu trúc dữ liệu, là một khái niệm rất quan trọng.

Nguyên lý cục bộ chỉ rằng trong quá trình thực thi chương trình, việc truy cập dữ liệu và lệnh tồn tại tính cục bộ nhất định về không gian và thời gian. Trong đó, tính cục bộ thời gian (temporal locality) là đặc điểm một mục dữ liệu hoặc lệnh được sử dụng lặp lại nhiều lần trong một khoảng thời gian; tính cục bộ không gian (spatial locality) là đặc điểm một mục dữ liệu hoặc lệnh và các mục dữ liệu hoặc lệnh kề cận với nó được sử dụng lặp lại nhiều lần trong một khoảng thời gian.

Trong cơ chế phân trang, vai trò của bảng trang là chuyển đổi địa chỉ ảo sang địa chỉ vật lý, từ đó hoàn thành truy cập bộ nhớ. Trong quá trình này, nguyên lý cục bộ thể hiện ở hai khía cạnh:

- **Tính cục bộ thời gian**: Do trong chương trình tồn tại một số vòng lặp hoặc thao tác lặp lại, nên sẽ truy cập lặp lại cùng một trang hoặc một số trang cụ thể. Để tận dụng tính cục bộ thời gian, cơ chế phân trang thường dùng cơ chế cache để nâng cao tỷ lệ hit của trang — tức là đưa một số trang được truy cập gần đây vào cache; nếu trang cần truy cập lần sau đã ở trong cache thì không cần truy cập bộ nhớ một lần nữa mà đọc trực tiếp từ cache.
- **Tính cục bộ không gian**: Do việc truy cập dữ liệu và lệnh trong chương trình thường có tính liên tục không gian nhất định, nên khi truy cập một trang, thường truy cập kèm theo các trang kề cận. Để tận dụng tính cục bộ không gian, cơ chế phân trang thường dùng kỹ thuật prefetch (tải trước) để đọc trước một số trang kề cận vào cache bộ nhớ, để khi truy cập trong tương lai có thể sử dụng trực tiếp, từ đó nâng cao tốc độ truy cập.

Tóm lại, nguyên lý cục bộ là một trong những nguyên tắc thiết kế quan trọng của kiến trúc máy tính, và là nền tảng của nhiều thuật toán tối ưu. Trong cơ chế phân trang, tận dụng tính cục bộ thời gian và không gian, dùng kỹ thuật cache và prefetch, có thể nâng cao tỷ lệ hit của trang, từ đó nâng cao hiệu quả truy cập bộ nhớ.

## Hệ thống tệp

### Hệ thống tệp làm gì chủ yếu?

Hệ thống tệp chủ yếu chịu trách nhiệm quản lý và tổ chức các tệp và thư mục trên thiết bị lưu trữ máy tính, các chức năng bao gồm:

1. **Quản lý lưu trữ**: Lưu dữ liệu tệp vào phương tiện lưu trữ vật lý, và quản lý phân bổ không gian để đảm bảo mỗi tệp có đủ không gian lưu trữ, tránh xung đột giữa các tệp.
2. **Quản lý tệp**: Tạo, xóa, di chuyển, đổi tên, nén, mã hóa, chia sẻ tệp, v.v.
3. **Quản lý thư mục**: Tạo, xóa, di chuyển, đổi tên thư mục, v.v.
4. **Kiểm soát truy cập tệp**: Quản lý quyền truy cập tệp của các người dùng hoặc tiến trình khác nhau, để đảm bảo người dùng chỉ có thể truy cập tệp được ủy quyền, nhằm đảm bảo tính bảo mật và bí mật của tệp.

### Hard link và soft link có gì khác nhau?

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

### Tại sao hard link không thể vượt qua hệ thống tệp?

Như đã đề cập, hard link được thiết lập thông qua số inode, và hard link cùng tệp nguồn chia sẻ số inode giống nhau.

Tuy nhiên, mỗi hệ thống tệp có bảng inode độc lập riêng, và mỗi bảng inode chỉ duy trì các inode trong hệ thống tệp đó. Nếu tạo hard link giữa các hệ thống tệp khác nhau, có thể dẫn đến xung đột số inode, tức là số inode của tệp đích đã được sử dụng trong hệ thống tệp đó.

### Các cách nâng cao hiệu năng hệ thống tệp là gì?

- **Tối ưu phần cứng**: Sử dụng thiết bị phần cứng tốc độ cao (như SSD, NVMe) thay thế đĩa cứng cơ học truyền thống, sử dụng công nghệ RAID (Redundant Array of Independent Disks) để nâng cao hiệu năng đĩa.
- **Chọn hệ thống tệp phù hợp**: Các hệ thống tệp khác nhau có đặc điểm khác nhau, chọn hệ thống tệp phù hợp cho các trường hợp ứng dụng khác nhau có thể nâng cao hiệu năng hệ thống.
- **Sử dụng cache**: Hiệu quả truy cập đĩa tương đối thấp, có thể dùng cache để giảm số lần truy cập đĩa. Tuy nhiên cần chú ý tỷ lệ hit của cache — tỷ lệ hit quá thấp thì hiệu quả quá kém.
- **Tránh sử dụng đĩa quá mức**: Chú ý tỷ lệ sử dụng đĩa, tránh lấp đầy đĩa, cố gắng để lại một số không gian dư, để tránh ảnh hưởng tiêu cực đến hiệu năng hệ thống tệp.
- **Phân vùng đĩa hợp lý**: Phương án phân vùng đĩa hợp lý giúp hệ thống tệp lưu tệp ở các vùng khác nhau, từ đó giảm phân mảnh tệp, nâng cao hiệu năng đọc ghi tệp.

### Các thuật toán điều phối đĩa thường gặp là gì?

Thuật toán điều phối đĩa là thuật toán sắp xếp và điều phối các yêu cầu truy cập đĩa trong hệ điều hành, mục đích là nâng cao hiệu quả truy cập đĩa.

Thời gian của một lần đọc ghi đĩa được quyết định bởi thời gian tìm đầu đọc/ghi đĩa, thời gian trễ quay và thời gian truyền dữ liệu. Thuật toán điều phối đĩa có thể giảm thời gian tìm đầu đọc/ghi và thời gian trễ bằng cách thay đổi thứ tự xử lý các yêu cầu đĩa đến.

Có 6 thuật toán điều phối đĩa thường gặp sau (các thuật toán khác phần lớn được cải tiến từ các thuật toán này):

![Các thuật toán điều phối đĩa thường gặp](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/disk-scheduling-algorithms.png)

1. **Thuật toán đến trước phục vụ trước (First-Come First-Served, FCFS)**: Xử lý theo thứ tự các yêu cầu đến bộ điều phối đĩa, yêu cầu đến trước được phục vụ trước. Thuật toán FCFS khá đơn giản để triển khai, không có chi phí thuật toán. Tuy nhiên vì không xét đến đường dẫn và hướng di chuyển của đầu đọc/ghi, thời gian tìm đầu đọc/ghi trung bình khá dài. Đồng thời thuật toán này dễ gây ra vấn đề starvation (chờ đợi vô thời hạn), tức là một số yêu cầu đĩa đến sau có thể phải chờ rất lâu mới được phục vụ.
2. **Thuật toán ưu tiên thời gian tìm đầu đọc ngắn nhất (Shortest Seek Time First, SSTF)**: Còn gọi là Shortest Service Time First (SSTF), ưu tiên phục vụ yêu cầu gần vị trí đầu đọc/ghi hiện tại nhất. Thuật toán SSTF có thể tối thiểu hóa thời gian tìm đầu đọc, nhưng dễ gây ra vấn đề starvation — các yêu cầu gần đầu đọc/ghi liên tục được phục vụ, còn các yêu cầu xa đầu đọc/ghi không được hồi đáp trong thời gian dài. Trong ứng dụng thực tế cần tối ưu hóa triển khai của thuật toán này để tránh starvation.
3. **Thuật toán quét (SCAN)**: Còn gọi là thuật toán Elevator (thang máy), ý tưởng cơ bản rất giống thang máy. Đầu đọc/ghi quét đĩa theo một hướng, gặp track nào có yêu cầu thì xử lý, cho đến khi đến biên của đĩa thì đổi hướng di chuyển, cứ thế lặp lại. Thuật toán SCAN có thể đảm bảo tất cả yêu cầu được phục vụ, giải quyết vấn đề starvation. Nhưng nếu đầu đọc/ghi vừa quét xong từ một hướng mà yêu cầu mới đến, yêu cầu đó phải đợi đầu đọc/ghi đi từ hướng ngược lại về mới được xử lý.
4. **Thuật toán quét vòng (Circular Scan, C-SCAN)**: Biến thể của thuật toán SCAN, chỉ quét ở một phía của đĩa, và chỉ quét theo một hướng, cho đến khi đến biên đĩa thì quay lại điểm bắt đầu của đĩa, bắt đầu lại từ đầu.
5. **Thuật toán LOOK**: Trong thuật toán SCAN, đầu đọc/ghi phải đến biên đĩa mới đổi hướng, điều này có thể làm nhiều việc vô ích vì trên hướng di chuyển của đầu đọc/ghi có thể đã không còn yêu cầu nào cần xử lý. Thuật toán LOOK cải tiến thuật toán SCAN, nếu trên hướng di chuyển của đầu đọc/ghi không còn yêu cầu nào khác thì có thể lập tức đổi hướng, cứ thế lặp lại. Tức là vừa quét vừa quan sát có còn yêu cầu theo hướng đã chỉ định không, vì vậy gọi là LOOK.
6. **Thuật toán C-LOOK**: C-SCAN chỉ khi đến biên đĩa mới đổi hướng đầu đọc/ghi, và khi đầu đọc/ghi quay về cũng cần quay về điểm bắt đầu của đĩa, điều này có thể làm nhiều việc vô ích. Thuật toán C-LOOK cải tiến thuật toán C-SCAN, nếu trên hướng di chuyển của đầu đọc/ghi không còn yêu cầu truy cập track nào thì có thể lập tức cho đầu đọc/ghi quay về, và đầu đọc/ghi chỉ cần quay về vị trí có yêu cầu truy cập track.

## Tài liệu tham khảo

- 《Hệ điều hành máy tính — Thang Tiểu Đan》phiên bản thứ 4
- 《Hiểu sâu về hệ thống máy tính》
- 《Học lại hệ điều hành》
- 《Nguyên lý và triển khai hệ điều hành hiện đại》
- Tổng hợp kiến thức hệ điều hành ôn thi Wang Dao: <https://wizardforcel.gitbooks.io/wangdaokaoyan-os/content/13.html>
- Quản lý bộ nhớ Buddy System và SLAB: <https://blog.csdn.net/qq_44272681/article/details/124199068>
- Tại sao Linux cần bộ nhớ ảo: <https://draveness.me/whys-the-design-os-virtual-memory/>
- Tự tu dưỡng của lập trình viên (7): Lỗi trang bộ nhớ: <https://liam.page/2017/09/01/page-fault/>
- Chuyện của bộ nhớ ảo: <https://juejin.cn/post/6844903507594575886>

<!-- @include: @article-footer.snippet.md -->
