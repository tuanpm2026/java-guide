---
title: Tổng hợp các khái niệm cốt lõi của Docker
description: Hệ thống hóa các khái niệm cốt lõi của Docker và sự khác biệt giữa container và máy ảo, nắm vững mối quan hệ giữa image, container và repository cũng như giá trị thực tế trong việc phân phối và triển khai.
category: Công cụ phát triển
tag:
  - Docker
head:
  - - meta
    - name: keywords
      content: Docker,容器,镜像,仓库,引擎,隔离,虚拟机对比,部署
---

Bài viết này chỉ giới thiệu khá chi tiết về các khái niệm của Docker, không đề cập đến các vấn đề như cài đặt môi trường Docker hay một số thao tác và lệnh Docker thông thường.

## Giới thiệu về Container

**Docker là nền tảng container phần mềm hàng đầu thế giới**, vì vậy để hiểu các khái niệm Docker, chúng ta phải bắt đầu từ container.

### Container là gì?

#### Trước tiên hãy xem giải thích chính thức về container

**Tóm gọn container trong một câu: Container là việc đóng gói phần mềm thành các đơn vị chuẩn hóa, dùng cho phát triển, phân phối và triển khai.**

- **Container image là gói phần mềm độc lập, nhẹ và có thể thực thi**, chứa tất cả mọi thứ cần thiết để phần mềm chạy: mã nguồn, môi trường runtime, công cụ hệ thống, thư viện hệ thống và cấu hình.
- **Phần mềm được container hóa phù hợp với các ứng dụng trên Linux và Windows, có thể chạy nhất quán trong bất kỳ môi trường nào.**
- **Container mang lại tính độc lập cho phần mềm**, giúp nó không bị ảnh hưởng bởi sự khác biệt của môi trường bên ngoài (ví dụ, sự khác biệt giữa môi trường phát triển và môi trường staging), từ đó giúp giảm xung đột giữa các nhóm khi chạy các phần mềm khác nhau trên cùng một cơ sở hạ tầng.

#### Bây giờ hãy xem giải thích dễ hiểu hơn về container

Nếu cần mô tả container một cách thông thường, tôi nghĩ container giống như một nơi chứa đồ vật, giống như ba lô có thể đựng các loại văn phòng phẩm, tủ quần áo có thể để các loại quần áo, kệ giày có thể đặt các loại giày. Container mà chúng ta nói đến hiện nay thường chứa các ứng dụng như website, chương trình, thậm chí là môi trường hệ thống.

![Tìm hiểu về container](/images/github/javaguide/tools/docker/container.png)

### Sơ đồ minh họa máy vật lý, máy ảo và container

Việc so sánh máy ảo và container sẽ được giới thiệu chi tiết ở phần sau, ở đây chỉ dùng hình ảnh từ internet để giúp mọi người hiểu rõ hơn về ba khái niệm: máy vật lý, máy ảo và container (hình ảnh dưới đây được lấy từ internet).

**Máy vật lý:**

![Máy vật lý](/images/github/javaguide/tools/docker/%E7%89%A9%E7%90%86%E6%9C%BA%E5%9B%BE%E8%A7%A3.jpeg)

**Máy ảo:**

![Máy ảo](/images/github/javaguide/tools/docker/%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%9B%BE%E8%A7%A3.jpeg)

**Container:**

![](/images/javaguide/image-20211110104003678.png)

Qua ba hình ảnh trừu tượng trên, chúng ta có thể khái quát bằng cách so sánh: **Container ảo hóa hệ điều hành chứ không phải phần cứng, các container chia sẻ cùng một bộ tài nguyên hệ điều hành. Công nghệ máy ảo là ảo hóa một bộ phần cứng, sau đó chạy một hệ điều hành đầy đủ trên đó. Do đó mức độ cô lập của container sẽ thấp hơn một chút.**

### Container VS Máy ảo

Mỗi khi nói về container, chúng ta không thể tránh khỏi việc so sánh nó với máy ảo. Theo quan điểm của tôi, không cần quan tâm cái nào sẽ thay thế cái nào, mà cả hai có thể cùng tồn tại hòa bình.

Nói đơn giản: **Container và máy ảo có những ưu điểm tương tự về cô lập và phân bổ tài nguyên, nhưng chức năng có sự khác biệt, vì container ảo hóa hệ điều hành chứ không phải phần cứng, do đó container dễ di chuyển hơn và hiệu quả hơn.**

Công nghệ máy ảo truyền thống là ảo hóa một bộ phần cứng, sau đó chạy một hệ điều hành đầy đủ trên đó, rồi chạy các tiến trình ứng dụng cần thiết trên hệ điều hành đó; trong khi các tiến trình ứng dụng trong container chạy trực tiếp trên kernel của máy chủ, container không có kernel riêng của mình, và cũng không thực hiện ảo hóa phần cứng. Do đó container nhẹ hơn nhiều so với máy ảo truyền thống.

![](/images/javaguide/2e2b95eebf60b6d03f6c1476f4d7c697.png)

**So sánh container và máy ảo**:

![](/images/javaguide/4ef8691d67eb1eb53217099d0a691eb5.png)

- Container là một lớp trừu tượng ở tầng ứng dụng, dùng để đóng gói mã nguồn và tài nguyên phụ thuộc cùng nhau. Nhiều container có thể chạy trên cùng một máy, chia sẻ kernel hệ điều hành, nhưng mỗi container chạy như một tiến trình độc lập trong không gian người dùng. So với máy ảo, **container chiếm ít không gian hơn** (kích thước image container thường chỉ vài chục MB), **có thể khởi động ngay lập tức**.

- Máy ảo (VM) là một lớp trừu tượng ở tầng phần cứng vật lý, dùng để biến một máy chủ thành nhiều máy chủ. Hypervisor cho phép nhiều VM chạy trên một máy. Mỗi VM chứa toàn bộ hệ điều hành, một hoặc nhiều ứng dụng, các file nhị phân và thư viện cần thiết, do đó **chiếm nhiều không gian**. Và VM **khởi động cũng rất chậm**.

Qua trang web chính thức của Docker, chúng ta biết được nhiều ưu điểm của Docker như vậy, nhưng mọi người cũng không cần phủ nhận hoàn toàn công nghệ máy ảo, vì cả hai có các trường hợp sử dụng khác nhau. **Máy ảo giỏi hơn trong việc cô lập hoàn toàn toàn bộ môi trường chạy**. Ví dụ, các nhà cung cấp dịch vụ đám mây thường sử dụng công nghệ máy ảo để cô lập người dùng khác nhau. Còn **Docker thường được dùng để cô lập các ứng dụng khác nhau**, ví dụ như frontend, backend và cơ sở dữ liệu.

Theo quan điểm của tôi, không cần quan tâm cái nào sẽ thay thế cái nào, mà cả hai có thể cùng tồn tại hòa bình.

![](/images/javaguide/056c87751b9dd7b56f4264240fe96d00.png)

## Giới thiệu về Docker

### Docker là gì?

Thực ra khó mà nói ngắn gọn Docker là gì, dưới đây tôi giải thích Docker qua bốn điểm.

- **Docker là nền tảng container phần mềm hàng đầu thế giới.**
- **Docker** được phát triển bằng **ngôn ngữ Go** do Google phát triển, dựa trên chức năng CGroup và namespace được cung cấp bởi **Linux kernel**, cùng với các công nghệ **UnionFS** như AUFS, **đóng gói và cô lập tiến trình, thuộc công nghệ ảo hóa ở tầng hệ điều hành.** Do các tiến trình được cô lập độc lập với máy chủ và các tiến trình được cô lập khác, nên chúng còn được gọi là container.
- Docker có thể tự động thực hiện các tác vụ lặp đi lặp lại, ví dụ như thiết lập và cấu hình môi trường phát triển, từ đó giải phóng các nhà phát triển để họ tập trung vào những điều thực sự quan trọng: xây dựng phần mềm xuất sắc.
- Người dùng có thể dễ dàng tạo và sử dụng container, đưa ứng dụng của mình vào container. Container cũng có thể được quản lý phiên bản, sao chép, chia sẻ, chỉnh sửa, giống như quản lý code thông thường.

**Tư tưởng Docker**:

- **Container vận chuyển**: Giống như container trong vận tải biển, Docker container chứa ứng dụng và tất cả các phụ thuộc của nó, đảm bảo chạy theo cùng một cách trong bất kỳ môi trường nào.
- **Tiêu chuẩn hóa**: Phương thức vận chuyển, phương thức lưu trữ, giao diện API.
- **Cô lập**: Mỗi Docker container chạy trong môi trường cô lập của riêng mình, tách biệt với máy chủ và các container khác.

### Đặc điểm của Docker container

- **Nhẹ**: Nhiều Docker container chạy trên một máy có thể chia sẻ kernel hệ điều hành của máy đó; chúng có thể khởi động nhanh chóng, chỉ chiếm rất ít tài nguyên tính toán và bộ nhớ. Image được xây dựng thông qua các lớp hệ thống file và chia sẻ một số file chung. Điều này giúp giảm thiểu mức sử dụng đĩa và có thể tải image nhanh hơn.
- **Tiêu chuẩn**: Docker container dựa trên các tiêu chuẩn mở, có thể chạy trên tất cả các phiên bản Linux chính, Microsoft Windows và bất kỳ cơ sở hạ tầng nào bao gồm VM, máy chủ bare-metal và đám mây.
- **An toàn**: Tính cô lập mà Docker cung cấp cho ứng dụng không chỉ giới hạn ở việc cô lập lẫn nhau, mà còn độc lập với cơ sở hạ tầng bên dưới. Docker cung cấp mức cô lập mạnh nhất theo mặc định, do đó nếu ứng dụng có vấn đề, đó chỉ là vấn đề của một container riêng lẻ, và sẽ không ảnh hưởng đến toàn bộ máy.

### Tại sao nên dùng Docker?

- Image của Docker cung cấp môi trường runtime đầy đủ ngoại trừ kernel, đảm bảo tính nhất quán của môi trường chạy ứng dụng, do đó sẽ không còn xảy ra vấn đề "đoạn code này chạy tốt trên máy tôi mà" nữa; — Môi trường chạy nhất quán
- Có thể đạt được thời gian khởi động ở cấp độ giây, thậm chí mili giây. Tiết kiệm đáng kể thời gian phát triển, kiểm thử và triển khai. — Khởi động nhanh hơn
- Tránh sử dụng máy chủ chung, tài nguyên dễ bị ảnh hưởng bởi người dùng khác. — Tính cô lập
- Giỏi xử lý áp lực sử dụng máy chủ tập trung đột ngột; — Co giãn đàn hồi, mở rộng nhanh
- Có thể dễ dàng di chuyển ứng dụng đang chạy trên một nền tảng sang nền tảng khác, mà không cần lo lắng về việc thay đổi môi trường chạy gây ra ứng dụng không thể hoạt động bình thường. — Di chuyển thuận tiện
- Sử dụng Docker có thể thực hiện tích hợp liên tục, phân phối liên tục, triển khai thông qua việc tùy chỉnh image ứng dụng. — Phân phối và triển khai liên tục

---

## Các khái niệm cơ bản của Docker

Docker có ba khái niệm cơ bản rất quan trọng: Image (Hình ảnh), Container (Vùng chứa) và Repository (Kho lưu trữ).

Hiểu được ba khái niệm này, bạn sẽ hiểu toàn bộ vòng đời của Docker.

![](/images/github/javaguide/tools/docker/docker-build-run.jpeg)

### Image (Hình ảnh): Một hệ thống file đặc biệt

**Hệ điều hành được chia thành kernel và không gian người dùng**. Đối với Linux, sau khi kernel khởi động, sẽ mount hệ thống file root để cung cấp hỗ trợ không gian người dùng. Docker Image (Hình ảnh) tương đương với một hệ thống file root.

**Docker Image là một hệ thống file đặc biệt, ngoài việc cung cấp các file chương trình, thư viện, tài nguyên, cấu hình cần thiết cho quá trình chạy container, còn chứa một số tham số cấu hình chuẩn bị cho quá trình chạy (như anonymous volume, biến môi trường, người dùng, v.v.).** Image không chứa bất kỳ dữ liệu động nào và nội dung của nó sẽ không thay đổi sau khi được xây dựng.

Khi thiết kế Docker, đã tận dụng đầy đủ công nghệ **Union FS**, thiết kế nó thành **kiến trúc lưu trữ phân lớp**. Image thực tế được tạo bởi sự kết hợp của nhiều lớp hệ thống file.

**Khi xây dựng image, sẽ xây dựng từng lớp một, lớp trước là nền tảng của lớp sau. Mỗi lớp sau khi xây dựng xong sẽ không thay đổi nữa, bất kỳ thay đổi nào trên lớp sau chỉ xảy ra ở lớp đó.** Ví dụ, thao tác xóa file ở lớp trước, thực ra không phải xóa thực sự file ở lớp trước, mà chỉ đánh dấu file đó đã bị xóa ở lớp hiện tại. Khi container cuối cùng chạy, mặc dù sẽ không thấy file này, nhưng thực tế file đó sẽ luôn theo image. Do đó, khi xây dựng image, cần phải cẩn thận, mỗi lớp chỉ nên chứa những gì cần thêm cho lớp đó, bất kỳ thứ gì thừa nên được dọn dẹp trước khi quá trình xây dựng lớp đó kết thúc.

Đặc tính của lưu trữ phân lớp cũng giúp việc tái sử dụng và tùy chỉnh image dễ dàng hơn. Thậm chí có thể dùng image đã xây dựng trước đó làm lớp nền, sau đó thêm các lớp mới để tùy chỉnh nội dung cần thiết, xây dựng image mới.

### Container (Vùng chứa): Thực thể khi image chạy

Mối quan hệ giữa Image và Container giống như mối quan hệ giữa class và instance trong lập trình hướng đối tượng, image là định nghĩa tĩnh, **container là thực thể khi image chạy. Container có thể được tạo, khởi động, dừng, xóa, tạm dừng, v.v.**

**Bản chất của container là tiến trình, nhưng khác với tiến trình chạy trực tiếp trên máy chủ, tiến trình container chạy trong không gian tên (namespace) độc lập của riêng nó. Đã đề cập ở trên rằng image sử dụng lưu trữ phân lớp, container cũng vậy.**

**Vòng đời của lớp lưu trữ container giống với container, khi container bị hủy, lớp lưu trữ container cũng bị hủy theo. Do đó, bất kỳ thông tin nào được lưu trong lớp lưu trữ container sẽ mất khi container bị xóa.**

Theo yêu cầu của best practice Docker, **container không nên ghi bất kỳ dữ liệu nào vào lớp lưu trữ của nó**, lớp lưu trữ container phải được duy trì ở trạng thái không có trạng thái. **Tất cả các thao tác ghi file đều nên sử dụng Data Volume (Volume) hoặc bind mount thư mục máy chủ**, việc đọc ghi ở các vị trí này sẽ bỏ qua lớp lưu trữ container, trực tiếp thực hiện đọc ghi trên máy chủ (hoặc lưu trữ mạng), hiệu suất và độ ổn định cao hơn. Vòng đời của data volume độc lập với container, khi container bị hủy, data volume sẽ không bị hủy. Do đó, **sau khi sử dụng data volume, container có thể tùy ý xóa, chạy lại, dữ liệu sẽ không bị mất.**

### Repository (Kho lưu trữ): Nơi tập trung lưu trữ các file image

Sau khi image được xây dựng xong, có thể dễ dàng chạy trên máy chủ hiện tại, nhưng, **nếu cần sử dụng image này trên các máy chủ khác, chúng ta cần một dịch vụ lưu trữ và phân phối image tập trung, Docker Registry chính là dịch vụ như vậy.**

Một Docker Registry có thể chứa nhiều Repository; mỗi Repository có thể chứa nhiều Tag (nhãn); mỗi Tag tương ứng với một image. Vì vậy: **Kho lưu trữ image là nơi Docker dùng để lưu trữ tập trung các file image, tương tự như kho lưu trữ code mà chúng ta thường dùng trước đây.**

Thông thường, **một repository sẽ chứa các image của các phiên bản khác nhau của cùng một phần mềm**, và **tag thường được dùng để tương ứng với các phiên bản khác nhau của phần mềm đó**. Chúng ta có thể chỉ định image phiên bản cụ thể của phần mềm theo định dạng `<tên repository>:<tag>`. Nếu không chỉ định tag, mặc định sẽ dùng latest làm tag.

**Đây bổ sung thêm về khái niệm Docker Registry công khai và Docker Registry riêng tư:**

**Docker Registry công khai** là dịch vụ Registry mở cho người dùng sử dụng, cho phép người dùng quản lý image. Thông thường các dịch vụ công khai này cho phép người dùng tải lên, tải xuống miễn phí image công khai và có thể cung cấp dịch vụ trả phí để người dùng quản lý image riêng tư.

Registry công khai được sử dụng phổ biến nhất là **Docker Hub** chính thức, đây cũng là Registry mặc định và có nhiều image chính thức chất lượng cao, địa chỉ: [https://hub.docker.com/](https://hub.docker.com/ "https://hub.docker.com/"). Docker Hub được giới thiệu chính thức như sau:

> Docker Hub là dịch vụ do Docker chính thức cung cấp, dùng để tìm kiếm và chia sẻ container image với nhóm của bạn.

Ví dụ khi chúng ta muốn tìm kiếm image theo ý muốn:

![Tìm kiếm image bằng Docker Hub](/images/github/javaguide/tools/docker/Screen%20Shot%202019-11-04%20at%208.21.39%20PM.png)

Trong kết quả tìm kiếm của Docker Hub, có một số thông tin quan trọng giúp chúng ta chọn image phù hợp:

- **OFFICIAL Image**: Đại diện cho image được Docker chính thức cung cấp và bảo trì, tương đối ổn định và an toàn hơn.
- **Stars**: Tương tự như lượt thích, giống Star trên GitHub.
- **Downloads**: Đại diện cho số lần image được pull, về cơ bản có thể biểu thị tần suất sử dụng image.

Tất nhiên, ngoài cách tìm kiếm image trực tiếp qua trang web Docker Hub, chúng ta còn có thể tìm kiếm image trong Docker Hub thông qua lệnh `docker search`, kết quả tìm kiếm là như nhau.

```bash
➜  ~ docker search mysql
NAME                              DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
mysql                             MySQL is a widely used, open-source relation…   8763                [OK]
mariadb                           MariaDB is a community-developed fork of MyS…   3073                [OK]
mysql/mysql-server                Optimized MySQL Server Docker images. Create…   650                                     [OK]
```

Truy cập **Docker Hub** trong nước có thể khá chậm, trong nước cũng có một số nhà cung cấp dịch vụ đám mây cung cấp dịch vụ công khai tương tự Docker Hub. Ví dụ như [Thư viện image Tốc độ vân](https://www.tenxcloud.com/ "时速云镜像库"), [Dịch vụ image NetEase Cloud](https://www.163yun.com/product/repo "网易云镜像服务"), [DaoCloud Image Market](https://www.daocloud.io/ "DaoCloud 镜像市场"), [Thư viện image Alibaba Cloud](https://www.aliyun.com/product/containerservice?utm_content=se_1292836 "阿里云镜像库"), v.v.

Ngoài việc sử dụng dịch vụ công khai, người dùng cũng có thể **tự xây dựng Docker Registry riêng tư trên máy chủ cục bộ**. Docker chính thức cung cấp image Docker Registry có thể được sử dụng trực tiếp làm dịch vụ Registry riêng tư. Image Docker Registry mã nguồn mở chỉ cung cấp triển khai phía máy chủ của Docker Registry API, đủ để hỗ trợ lệnh Docker, không ảnh hưởng đến việc sử dụng. Nhưng không bao gồm giao diện đồ họa cũng như các chức năng nâng cao như bảo trì image, quản lý người dùng, kiểm soát truy cập.

### Mối quan hệ giữa Image, Container và Repository

Hình dưới đây minh họa rõ ràng mối quan hệ giữa Image, Container, Repository và Registry/Hub:

![Kiến trúc Docker](/images/github/javaguide/tools/docker/docker-regitstry.png)

- Dockerfile là một file văn bản, chứa một loạt các chỉ thị và tham số, dùng để định nghĩa cách xây dựng một Docker image. Khi chạy lệnh `docker build` và chỉ định một Dockerfile, Docker sẽ đọc các chỉ thị trong Dockerfile, từng bước xây dựng một image mới và lưu nó cục bộ.
- Lệnh `docker pull` có thể tải xuống một image từ Registry/Hub được chỉ định về cục bộ, mặc định sử dụng Docker Hub.
- Lệnh `docker run` có thể tạo một container mới từ image cục bộ và khởi động nó. Nếu không có image cục bộ, Docker sẽ cố gắng pull image từ Registry/Hub trước.
- Lệnh `docker push` có thể tải lên Docker image cục bộ lên Registry/Hub được chỉ định.

Trên đây liên quan đến một số lệnh Docker cơ bản, sẽ được giới thiệu chi tiết sau.

### Build Ship and Run

Các khái niệm Docker về cơ bản đã được trình bày xong, bây giờ hãy nói về: Build, Ship, and Run.

Nếu bạn tìm kiếm trang web chính thức của Docker, sẽ thấy dòng chữ: **"Docker - Build, Ship, and Run Any App, Anywhere"**. Vậy Build, Ship, and Run thực ra đang làm gì?

![](/images/github/javaguide/tools/docker/docker-build-ship-run.jpg)

- **Build (Xây dựng image)**: Image giống như container vận chuyển bao gồm các file và môi trường chạy, v.v.
- **Ship (Vận chuyển image)**: Vận chuyển giữa máy chủ và kho lưu trữ, kho lưu trữ ở đây giống như một bến cảng siêu lớn.
- **Run (Chạy image)**: Image đang chạy là một container, container là nơi chạy chương trình.

Quá trình Docker chạy là lấy image từ kho lưu trữ về cục bộ, sau đó dùng một lệnh để chạy image thành container. Vì vậy, chúng ta cũng thường gọi Docker là công nhân bến cảng hoặc nhân viên xếp dỡ bến cảng, điều này trùng khớp với bản dịch tiếng Trung của Docker là "công nhân vận chuyển".

## Các lệnh Docker thông dụng

### Lệnh cơ bản

```bash
docker version # 查看docker版本
docker images # 查看所有已下载镜像，等价于：docker image ls 命令
docker container ls # 查看所有容器
docker ps #查看正在运行的容器
docker image prune # 清理临时的、没有被使用的镜像文件。-a, --all: 删除所有没有用的镜像，而不仅仅是临时文件；
```

### Pull image

Lệnh `docker pull` mặc định sử dụng Registry/Hub là Docker Hub. Khi bạn thực thi lệnh docker pull mà không chỉ định địa chỉ Registry/Hub nào, Docker sẽ pull image từ Docker Hub.

```bash
docker search mysql # 查看mysql相关镜像
docker pull mysql:5.7 # 拉取mysql镜像
docker image ls # 查看所有已下载镜像
```

### Build image

Khi chạy lệnh `docker build` và chỉ định một Dockerfile, Docker sẽ đọc các chỉ thị trong Dockerfile, từng bước xây dựng một image mới và lưu nó cục bộ.

```bash
#
# imageName 是镜像名称，1.0.0 是镜像的版本号或标签
docker build -t imageName:1.0.0 .
```

Cần lưu ý: Tên file Dockerfile không nhất thiết phải là Dockerfile, và cũng không nhất thiết phải đặt ở thư mục gốc của build context. Sử dụng tùy chọn `-f` hoặc `--file`, có thể chỉ định bất kỳ file nào ở bất kỳ vị trí nào làm Dockerfile. Tất nhiên, thông thường mọi người hay sử dụng tên file mặc định `Dockerfile` và đặt nó trong thư mục build context của image.

### Xóa image

Ví dụ chúng ta muốn xóa image mysql đã tải xuống.

Trước khi xóa image bằng `docker rmi [image]` (tương đương `docker image rm [image]`), trước tiên phải đảm bảo image này không được container nào tham chiếu (có thể xóa bằng tên tag hoặc image ID). Dùng lệnh `docker ps` đã nói ở trên để kiểm tra.

```shell
➜  ~ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                               NAMES
c4cd691d9f80        mysql:5.7           "docker-entrypoint.s…"   7 weeks ago         Up 12 days          0.0.0.0:3306->3306/tcp, 33060/tcp   mysql
```

Có thể thấy mysql đang được tham chiếu bởi container có id là c4cd691d9f80, chúng ta cần dừng container này trước bằng `docker stop c4cd691d9f80` hoặc `docker stop mysql`.

Sau đó xem id của image mysql

```shell
➜  ~ docker images
REPOSITORY              TAG                 IMAGE ID            CREATED             SIZE
mysql                   5.7                 f6509bac4980        3 months ago        373MB
```

Xóa bằng IMAGE ID hoặc tên REPOSITORY

```shell
docker rmi f6509bac4980 #  或者 docker rmi mysql
```

### Push image

Lệnh `docker push` dùng để tải lên Docker image cục bộ lên Registry/Hub được chỉ định.

```bash
# 将镜像推送到私有镜像仓库 Harbor
# harbor.example.com是私有镜像仓库的地址，ubuntu是镜像的名称，18.04是镜像的版本标签
docker push harbor.example.com/ubuntu:18.04
```

Trước khi push image, cần đảm bảo Docker image cần push đã được xây dựng xong ở cục bộ. Ngoài ra, nhất thiết phải đăng nhập vào kho lưu trữ image tương ứng trước.

## Quản lý dữ liệu Docker

Có hai cách chính để quản lý dữ liệu trong container:

1. Data Volume (Volumes)
2. Bind mount thư mục máy chủ (Bind mounts)

![Quản lý dữ liệu Docker](/images/github/javaguide/tools/docker/docker-data-management.png)

Data volume là vùng lưu trữ dữ liệu được Docker quản lý, có những đặc điểm sau:

- Có thể chia sẻ và tái sử dụng giữa các container.
- Ngay cả khi container bị xóa, dữ liệu trong data volume cũng sẽ không bị tự động xóa, đảm bảo tính bền vững của dữ liệu.
- Các thay đổi đối với data volume sẽ có hiệu lực ngay lập tức.
- Cập nhật data volume sẽ không ảnh hưởng đến image.

```bash
# 创建一个数据卷
docker volume create my-vol
# 查看所有的数据卷
docker volume ls
# 查看数据卷的具体信息
docker inspect web
# 删除指定的数据卷
docker volume rm my-vol
```

Khi dùng lệnh `docker run`, sử dụng flag `--mount` để mount một hoặc nhiều data volume vào container.

Cũng có thể mount file hoặc thư mục trên máy chủ vào container thông qua flag `--mount`, điều này giúp container có thể truy cập trực tiếp vào hệ thống file của máy chủ. Quyền mặc định khi Docker mount thư mục máy chủ là đọc-ghi, người dùng cũng có thể thêm `readonly` để chỉ định chỉ đọc.

## Docker Compose

### Docker Compose là gì? Dùng để làm gì?

Docker Compose là một trong những dự án orchestration chính thức của Docker, được viết bằng Python, có trách nhiệm thực hiện việc orchestration nhanh chóng cho cluster Docker container. Thông qua Docker Compose, các nhà phát triển có thể sử dụng file YAML để cấu hình tất cả các dịch vụ của ứng dụng, sau đó chỉ cần một lệnh đơn giản là có thể tạo và khởi động tất cả các dịch vụ.

Docker Compose là dự án mã nguồn mở, địa chỉ: <https://github.com/docker/compose>.

Chức năng cốt lõi của Docker Compose:

- **Quản lý nhiều container**: Cho phép người dùng định nghĩa và quản lý nhiều container trong một file YAML.
- **Orchestration dịch vụ**: Cấu hình mạng và mối quan hệ phụ thuộc giữa các container.
- **Triển khai một lệnh**: Thông qua các lệnh đơn giản như `docker-compose up` và `docker-compose down`, có thể dễ dàng khởi động và dừng toàn bộ ứng dụng.

Docker Compose đơn giản hóa quy trình phát triển, kiểm thử và triển khai ứng dụng đa container, tăng năng suất của nhóm phát triển, đồng thời giảm độ phức tạp triển khai và chi phí quản lý của ứng dụng.

### Cấu trúc cơ bản của file Docker Compose

File Docker Compose là cốt lõi của công cụ Docker Compose, dùng để định nghĩa và cấu hình ứng dụng Docker đa container. File này thường được đặt tên là `docker-compose.yml`, được viết theo định dạng YAML (YAML Ain't Markup Language).

Cấu trúc cơ bản của file Docker Compose như sau:

- **Phiên bản (version):** Chỉ định phiên bản của định dạng file Compose. Phiên bản quyết định các tùy chọn cấu hình có sẵn.
- **Dịch vụ (services):** Định nghĩa từng container (dịch vụ) trong ứng dụng. Mỗi dịch vụ có thể sử dụng image khác nhau, cài đặt môi trường và mối quan hệ phụ thuộc khác nhau.
  - **Image (image):** Khởi động container từ image được chỉ định, có thể là repository, tag và image ID.
  - **Lệnh (command):** Tùy chọn, ghi đè lệnh CMD mặc định trong image. Chạy lệnh hoặc script cụ thể khi khởi động dịch vụ, thường dùng để khởi động ứng dụng, thực thi script khởi tạo, v.v.
  - **Cổng (ports):** Tùy chọn, ánh xạ cổng container và máy chủ.
  - **Phụ thuộc (depends_on):** Tùy chọn cấu hình phụ thuộc, nghĩa là nếu dịch vụ khi khởi động có phụ thuộc vào các dịch vụ khác, thì khởi động dịch vụ được phụ thuộc trước, sau khi hoàn tất mới khởi động dịch vụ này.
  - **Biến môi trường (environment):** Tùy chọn, thiết lập các biến môi trường cần thiết cho dịch vụ chạy.
  - **Khởi động lại (restart):** Tùy chọn, kiểm soát chính sách khởi động lại container. Khi container thoát, tự động khởi động lại container theo chính sách đã chỉ định.
  - **Volume dịch vụ (volumes):** Tùy chọn, định nghĩa volume được dịch vụ sử dụng, dùng để lưu trữ dữ liệu bền vững hoặc chia sẻ dữ liệu giữa các container.
  - **Build (build):** Chỉ định đường dẫn context cho dockerfile xây dựng image, hoặc đối tượng cấu hình chi tiết.
- **Mạng (networks):** Định nghĩa kết nối mạng giữa các container.
- **Volume (volumes):** Định nghĩa data volume dùng để lưu trữ và chia sẻ dữ liệu bền vững. Thường dùng cho lưu trữ cơ sở dữ liệu, file cấu hình, log và các dữ liệu bền vững khác.

```yaml
version: "3.8" # 定义版本， 表示当前使用的 docker-compose 语法的版本
services: # 服务，可以存在多个
    servicename1: # 服务名字，它也是内部 bridge 网络可以使用的 DNS name，如果不是集群模式相当于 docker run 的时候指定的一个名称，
   #集群（Swarm）模式是多个容器的逻辑抽象
        image: # 镜像的名字
        command: # 可选，如果设置，则会覆盖默认镜像里的 CMD 命令
        environment: # 可选，等价于 docker container run 里的 --env 选项设置环境变量
        volumes: # 可选，等价于 docker container run 里的 -v 选项 绑定数据卷
        networks: # 可选，等价于 docker container run 里的 --network 选项指定网络
        ports: # 可选，等价于 docker container run 里的 -p 选项指定端口映射
        restart: # 可选，控制容器的重启策略
        build: #构建目录
        depends_on: #服务依赖配置
    servicename2:
        image:
        command:
        networks:
    	ports:
    servicename3:
    #...
volumes: # 可选，需要创建的数据卷，类似 docker volume create
  db_data:
networks: # 可选，等价于 docker network create
```

### Các lệnh Docker Compose thông dụng

#### Khởi động

`docker-compose up` sẽ tạo và khởi động container dựa trên các dịch vụ được định nghĩa trong file `docker-compose.yml`, và kết nối chúng vào mạng mặc định.

```bash
# 在当前目录下寻找 docker-compose.yml 文件，并根据其中定义的服务启动应用程序
docker-compose up
# 后台启动
docker-compose up -d
# 强制重新创建所有容器，即使它们已经存在
docker-compose up --force-recreate
# 重新构建镜像
docker-compose up --build
# 指定要启动的服务名称，而不是启动所有服务
# 可以同时指定多个服务，用空格分隔。
docker-compose up service_name
```

Ngoài ra, nếu tên file Compose không phải là `docker-compose.yml` cũng không sao, có thể chỉ định thông qua tham số `-f`.

```bash
docker-compose -f docker-compose.prod.yml up
```

#### Dừng

`docker-compose down` dùng để dừng và xóa các container và mạng được khởi động thông qua `docker-compose up`.

```bash
# 在当前目录下寻找 docker-compose.yml 文件
# 根据其中定义移除启动的所有容器，网络和卷。
docker-compose down
# 停止容器但不移除
docker-compose down --stop
# 指定要停止和移除的特定服务，而不是停止和移除所有服务
# 可以同时指定多个服务，用空格分隔。
docker-compose down service_name
```

Tương tự, nếu tên file Compose không phải là `docker-compose.yml` cũng không sao, có thể chỉ định thông qua tham số `-f`.

```bash
docker-compose -f docker-compose.prod.yml down
```

#### Xem

`docker-compose ps` dùng để xem thông tin trạng thái của tất cả các container được khởi động thông qua `docker-compose up`.

```bash
# 查看所有容器的状态信息
docker-compose ps
# 只显示服务名称
docker-compose ps --services
# 查看指定服务的容器
docker-compose ps service_name
```

#### Khác

| Lệnh                     | Mô tả                                       |
| ------------------------ | ------------------------------------------- |
| `docker-compose version` | Xem phiên bản                               |
| `docker-compose images`  | Liệt kê tất cả image được container sử dụng |
| `docker-compose kill`    | Buộc dừng container của dịch vụ             |
| `docker-compose exec`    | Thực thi lệnh trong container               |
| `docker-compose logs`    | Xem log                                     |
| `docker-compose pause`   | Tạm dừng dịch vụ                            |
| `docker-compose unpause` | Tiếp tục dịch vụ                            |
| `docker-compose push`    | Push image dịch vụ                          |
| `docker-compose start`   | Khởi động container đã dừng                 |
| `docker-compose stop`    | Dừng container đang chạy                    |
| `docker-compose rm`      | Xóa container đã dừng của dịch vụ           |
| `docker-compose top`     | Xem tiến trình                              |

## Nguyên lý hoạt động của Docker

Đầu tiên, Docker là phần mềm dựa trên công nghệ ảo hóa nhẹ, vậy công nghệ ảo hóa là gì?

Nói đơn giản, công nghệ ảo hóa có thể được định nghĩa như sau:

> Công nghệ ảo hóa là một công nghệ quản lý tài nguyên, là việc trừu tượng hóa, chuyển đổi và trình bày các [tài nguyên vật lý](https://zh.wikipedia.org/wiki/計算機科學 "实体资源") ([CPU](https://zh.wikipedia.org/wiki/CPU "CPU"), [bộ nhớ](https://zh.wikipedia.org/wiki/内存 "内存"), [dung lượng đĩa](https://zh.wikipedia.org/wiki/磁盘空间 "磁盘空间"), [bộ điều hợp mạng](https://zh.wikipedia.org/wiki/網路適配器 "网络适配器"), v.v.) của máy tính và có thể được phân chia, kết hợp thành một hoặc nhiều môi trường cấu hình máy tính. Từ đó phá vỡ rào cản không thể phân chia giữa các cấu trúc vật lý, cho phép người dùng áp dụng các tài nguyên phần cứng máy tính này theo cách tốt hơn so với cấu hình ban đầu. Các tài nguyên ảo mới của những tài nguyên này không bị giới hạn bởi cách thiết lập, địa lý hay cấu hình vật lý của tài nguyên hiện có. Tài nguyên được ảo hóa thường bao gồm khả năng tính toán và lưu trữ dữ liệu.

Công nghệ Docker dựa trên công nghệ ảo hóa container LXC (Linux container - Container Linux).

> LXC, tên bắt nguồn từ viết tắt của Linux Containers (Container Linux), là một công nghệ ảo hóa ở tầng hệ điều hành (Operating system-level virtualization), là một giao diện không gian người dùng cho chức năng container của Linux kernel. Nó đóng gói hệ thống phần mềm ứng dụng thành một container phần mềm (Container), chứa mã nguồn của phần mềm ứng dụng, cũng như kernel và thư viện hệ điều hành cần thiết. Thông qua namespace thống nhất và API chung để phân bổ tài nguyên phần cứng khả dụng của các container phần mềm khác nhau, tạo ra môi trường sandbox độc lập để chạy ứng dụng, cho phép người dùng Linux dễ dàng tạo và quản lý container hệ thống hoặc ứng dụng.

Công nghệ LXC chủ yếu dựa vào chức năng CGroup và namespace được cung cấp trong Linux kernel, thông qua LXC có thể cung cấp môi trường hệ điều hành độc lập cho phần mềm.

**Giới thiệu về cgroup và namespace:**

- **namespace là cách mà Linux kernel dùng để cô lập tài nguyên kernel.** Thông qua namespace, một số tiến trình chỉ có thể thấy một phần tài nguyên liên quan đến chính chúng, trong khi các tiến trình khác cũng chỉ thấy tài nguyên liên quan đến chính chúng, hai nhóm tiến trình này hoàn toàn không cảm nhận được sự tồn tại của nhau. Cách triển khai cụ thể là chỉ định tài nguyên liên quan của một hoặc nhiều tiến trình trong cùng một namespace. Linux namespaces là một loại đóng gói cô lập cho tài nguyên hệ thống toàn cục, làm cho các tiến trình ở các namespace khác nhau có tài nguyên hệ thống toàn cục độc lập, thay đổi tài nguyên hệ thống trong một namespace chỉ ảnh hưởng đến các tiến trình trong namespace hiện tại, không có ảnh hưởng đến các tiến trình trong các namespace khác.

  (Nội dung giới thiệu về namespace trên lấy từ <https://www.cnblogs.com/sparkdev/p/9365405.html>, để biết thêm về namespace có thể xem bài viết này.)

- **CGroup là viết tắt của Control Groups, là một cơ chế được Linux kernel cung cấp có thể giới hạn, ghi lại, cô lập tài nguyên vật lý (như cpu, memory, i/o, v.v.) được sử dụng bởi nhóm tiến trình (process groups).**

  (Nội dung giới thiệu về CGroup trên lấy từ <https://www.ibm.com/developerworks/cn/linux/1506_cgroup/index.html>, để biết thêm về CGroup có thể xem bài viết này.)

**So sánh cgroup và namespace:**

Cả hai đều là phân nhóm tiến trình, nhưng chức năng của chúng có sự khác biệt về bản chất. namespace là để cô lập tài nguyên giữa các nhóm tiến trình, trong khi cgroup là để thực hiện giám sát và giới hạn tài nguyên thống nhất cho một nhóm tiến trình.

## Tổng kết

Bài viết này chủ yếu trình bày chi tiết một số khái niệm và lệnh thông dụng trong Docker. Để thực hành từ đầu có thể xem bài viết [Docker từ nhập môn đến thực hành](https://javaguide.cn/tools/docker/docker-in-action.html), nội dung rất chi tiết!

Ngoài ra, cũng giới thiệu cho mọi người một cuốn sách mã nguồn mở chất lượng cao [《Docker từ nhập môn đến thực hành》](https://yeasy.gitbook.io/docker_practice/introduction/why "《Docker 从入门到实践》"), nội dung của cuốn sách này rất cập nhật, bởi vì nội dung sách là mã nguồn mở, có thể cải tiến bất cứ lúc nào.

![Trang chủ website《Docker từ nhập môn đến thực hành》](/images/github/javaguide/tools/docker/docker-getting-started-practice-website-homepage.png)

## Tham khảo

- [Docker Compose：Hướng dẫn toàn diện từ cơ bản đến ứng dụng thực tế](https://juejin.cn/post/7306756690727747610)
- [Linux Namespace và Cgroup](https://segmentfault.com/a/1190000009732550 "Linux Namespace和Cgroup")
- [LXC vs Docker: Why Docker is Better](https://www.upguard.com/articles/docker-vs-lxc "LXC vs Docker: Why Docker is Better")
- [Giới thiệu CGroup, ví dụ ứng dụng và mô tả nguyên lý](https://www.ibm.com/developerworks/cn/linux/1506_cgroup/index.html "CGroup 介绍、应用实例及原理描述")

<!-- @include: @article-footer.snippet.md -->
