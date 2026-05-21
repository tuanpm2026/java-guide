---
title: Docker thực chiến
description: Hiểu về quản lý image và container Docker qua thực hành, giải quyết vấn đề nhất quán môi trường và hiệu quả bàn giao, nâng cao hiệu quả phối hợp giữa phát triển, test và triển khai.
category: Công cụ phát triển
tag:
  - Docker
head:
  - - meta
    - name: keywords
      content: Docker 实战,镜像构建,容器管理,环境一致性,部署,性能
---

## Giới thiệu Docker

Trước khi bắt đầu, hãy giới thiệu sơ qua về Docker, để biết thêm về các khái niệm Docker có thể xem bài viết trước [Tổng kết các khái niệm cốt lõi Docker](./docker-intro.md).

### Docker là gì?

Thực ra Docker là gì không dễ nói, dưới đây tôi sẽ giải thích Docker là gì qua bốn điểm.

- Docker là nền tảng container phần mềm hàng đầu thế giới, được phát triển và thực hiện dựa trên **ngôn ngữ Go**.
- Docker có thể tự động thực hiện các tác vụ lặp đi lặp lại, ví dụ như thiết lập và cấu hình môi trường phát triển, từ đó giải phóng nhà phát triển.
- Người dùng có thể dễ dàng tạo và sử dụng container, đưa ứng dụng của mình vào container. Container còn có thể quản lý phiên bản, sao chép, chia sẻ, sửa đổi, giống như quản lý mã nguồn thông thường.
- Docker có thể **đóng gói và cách ly tiến trình, thuộc công nghệ ảo hóa ở tầng hệ điều hành.** Do tiến trình được cách ly độc lập với host và các tiến trình được cách ly khác, nên còn gọi nó là container.

Địa chỉ trang chính thức: <https://www.docker.com/>.

![Tìm hiểu về container](/images/github/javaguide/tools/docker/container.png)

### Tại sao nên dùng Docker?

Docker có thể giúp nhà phát triển đóng gói ứng dụng và các gói dependency vào một container nhẹ, di động, sau đó phát hành lên bất kỳ máy Linux phổ biến nào, cũng có thể thực hiện ảo hóa.

Container hoàn toàn sử dụng cơ chế sandbox, không có bất kỳ interface nào giữa chúng với nhau (giống như app của iPhone), quan trọng hơn là chi phí hiệu năng của container cực kỳ thấp.

Trong quy trình phát triển truyền thống, các dự án của chúng ta thường cần sử dụng các môi trường như MySQL, Redis, FastDFS, v.v., những môi trường này đều cần chúng ta thủ công tải về và cấu hình, quy trình cài đặt cấu hình vô cùng phức tạp, và thao tác cũng khác nhau trên các hệ thống khác nhau.

Sự xuất hiện của Docker đã giải quyết hoàn hảo vấn đề này, chúng ta có thể cài đặt các môi trường phần mềm như MySQL, Redis trong container, giúp ứng dụng và kiến trúc môi trường tách biệt nhau, lợi thế của nó là:

1. Môi trường chạy nhất quán, có thể di chuyển dễ dàng hơn
2. Đóng gói và cách ly tiến trình, các container không ảnh hưởng lẫn nhau, sử dụng tài nguyên hệ thống hiệu quả hơn
3. Có thể sao chép nhiều container nhất quán thông qua image

Ngoài ra, trong cuốn sách mã nguồn mở [《Docker 从入门到实践》](https://yeasy.gitbook.io/docker_practice/introduction/why) cũng đã đưa ra lý do sử dụng Docker.

![](/images/github/javaguide/tools/docker/20210412220015698.png)

## Cài đặt Docker

### Windows

Tiếp theo tiến hành cài đặt Docker, lấy hệ thống Windows làm ví dụ, truy cập trang chính thức của Docker:

![Cài đặt Docker](/images/github/javaguide/tools/docker/docker-install-windows.png)

Sau đó nhấp vào `Get Started`:

![Cài đặt Docker](/images/github/javaguide/tools/docker/docker-install-windows-download.png)

Nhấp vào `Download for Windows` tại đây để tải về.

Nếu máy tính của bạn là hệ điều hành `Windows 10 64-bit Professional`, thì trước khi cài Docker cần bật `Hyper-V`, cách bật như sau. Mở Control Panel, chọn Programs:

![Bật Hyper-V](/images/github/javaguide/tools/docker/docker-windows-hyperv.png)

Nhấp vào `Turn Windows features on or off`:

![Bật Hyper-V](/images/github/javaguide/tools/docker/docker-windows-hyperv-enable.png)

Tích vào `Hyper-V`, nhấp OK là xong:

![Bật Hyper-V](/images/github/javaguide/tools/docker/docker-windows-hyperv-check.png)

Sau khi hoàn thành thay đổi cần khởi động lại máy tính.

Sau khi đã bật `Hyper-V`, chúng ta có thể cài đặt Docker, sau khi mở chương trình cài đặt, đợi một lúc rồi nhấp `Ok` là xong:

![Cài đặt Docker](/images/github/javaguide/tools/docker/docker-windows-hyperv-install.png)

Sau khi cài đặt xong, chúng ta vẫn cần khởi động lại máy tính, sau khi khởi động lại, nếu hiển thị nội dung như sau:

![Cài đặt Docker](/images/github/javaguide/tools/docker/docker-windows-hyperv-wsl2.png)

Nó hỏi chúng ta có muốn dùng WSL2 không, đây là một hệ thống con Linux dựa trên Windows, ở đây chúng ta hủy là được, nó sẽ dùng máy ảo `Hyper-V` mà chúng ta đã chọn trước đó.

Vì là thao tác giao diện đồ họa nên ở đây sẽ không giới thiệu cách dùng cụ thể của Docker Desktop.

### Mac

Sử dụng Homebrew để cài đặt trực tiếp là được:

```shell
brew install --cask docker
```

### Linux

Dưới đây xem cách cài Docker trong Linux, lấy CentOS7 làm ví dụ.

Trong môi trường test hoặc phát triển, Docker chính thức cung cấp một script cài đặt tiện lợi để đơn giản hóa quy trình cài đặt, sau khi thực thi script này sẽ tự động chuẩn bị mọi thứ và cài đặt phiên bản ổn định của Docker vào hệ thống.

```shell
curl -fsSL get.docker.com -o get-docker.sh
```

```shell
sh get-docker.sh --mirror Aliyun
```

Sau khi cài đặt xong, khởi động service trực tiếp:

```shell
systemctl start docker
```

Khuyến nghị thiết lập khởi động cùng hệ thống, thực thi lệnh:

```shell
systemctl enable docker
```

## Một số khái niệm trong Docker

Trước khi chính thức học Docker, chúng ta cần hiểu một số khái niệm cốt lõi trong Docker:

### Image

Image là một template chỉ đọc, image có thể dùng để tạo các Docker container, một image có thể tạo nhiều container.

### Container

Container là instance chạy được tạo từ image, Docker dùng container để chạy độc lập một hoặc một nhóm ứng dụng. Nó có thể được khởi động, bắt đầu, dừng, xóa, mỗi container đều được cách ly với nhau, là một nền tảng an toàn. Có thể xem container như một môi trường Linux đơn giản và ứng dụng chạy trong đó. Định nghĩa container và image gần như giống hệt nhau, cũng là một góc nhìn thống nhất của nhiều layer, điểm khác biệt duy nhất là layer trên cùng của container có thể đọc và ghi.

### Repository

Repository là nơi tập trung lưu trữ các file image. Repository và registry server khác nhau, trên registry server thường lưu nhiều repository, mỗi repository lại chứa nhiều image, mỗi image có các tag khác nhau. Repository được chia thành repository công khai và repository riêng tư, repository công khai lớn nhất là DockerHub, lưu trữ số lượng lớn image cho người dùng tải về, các repository công khai trong nước có Alibaba Cloud, NetEase Cloud, v.v.

### Tóm lại

Nói một cách thông thường, một image đại diện cho một phần mềm; còn chạy dựa trên một image là tạo ra một instance chương trình, instance chương trình này chính là container; còn repository là nơi lưu trữ tất cả image trong Docker.

Trong đó repository lại được chia thành repository từ xa và repository cục bộ, tương tự như Maven, nếu mỗi lần đều tải dependency từ xa thì sẽ giảm đáng kể hiệu quả, vì vậy chiến lược của Maven là lần đầu truy cập dependency sẽ tải về repository cục bộ, lần thứ hai, thứ ba dùng trực tiếp dependency trong repository cục bộ, tác dụng của repository từ xa và cục bộ trong Docker cũng tương tự như vậy.

## Trải nghiệm Docker lần đầu

Dưới đây chúng ta sẽ sử dụng Docker lần đầu, lấy việc tải image MySQL làm ví dụ `(thực hiện trong CentOS7)`.

Giống như GitHub, Docker cũng cung cấp một DockerHub để tra cứu địa chỉ và hướng dẫn cài đặt các loại image, vì vậy trước tiên truy cập DockerHub: [https://hub.docker.com/](https://hub.docker.com/)

![DockerHub](/images/github/javaguide/tools/docker/dockerhub-com.png)

Nhập `MySQL` vào ô tìm kiếm ở góc trên bên trái và nhấn Enter:

![DockerHub tìm kiếm MySQL](/images/github/javaguide/tools/docker/dockerhub-mysql.png)

Có thể thấy có rất nhiều image MySQL liên quan, nếu góc trên bên phải có nhãn `OFFICIAL IMAGE`, thì đó là image chính thức, vì vậy chúng ta nhấp vào image MySQL đầu tiên:

![Image chính thức MySQL](/images/github/javaguide/tools/docker/dockerhub-mysql-official-image.png)

Bên phải cung cấp lệnh tải image MySQL là `docker pull MySQL`, nhưng lệnh này luôn tải phiên bản mới nhất của image MySQL.

Nếu muốn tải image phiên bản cụ thể, nhấp vào `View Available Tags` bên dưới:

![Xem các phiên bản MySQL khác](/images/github/javaguide/tools/docker/dockerhub-mysql-view-available-tags.png)

Ở đây có thể thấy image của các phiên bản khác nhau, bên phải có lệnh tải, vì vậy nếu muốn tải image MySQL phiên bản 5.7.32, thực thi:

```shell
docker pull MySQL:5.7.32
```

Tuy nhiên quá trình tải image rất chậm, vì vậy chúng ta cần cấu hình nguồn mirror để tăng tốc tải, truy cập trang chính thức `Alibaba Cloud`, nhấp vào console:

![Tăng tốc mirror Alibaba Cloud](/images/github/javaguide/tools/docker/docker-aliyun-mirror-admin.png)

Sau đó nhấp vào menu ở góc trên bên trái, trong cửa sổ pop-up, di chuột đến Sản phẩm & Dịch vụ, tìm kiếm Container Registry ở bên phải, cuối cùng nhấp vào Container Registry:

![Tăng tốc mirror Alibaba Cloud](/images/github/javaguide/tools/docker/docker-aliyun-mirror-admin-accelerator.png)

Nhấp vào Image Accelerator ở bên trái, và lần lượt thực thi các lệnh cấu hình ở bên phải là xong.

```shell
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://679xpnpz.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## Lệnh image Docker

Docker cần thường xuyên thao tác với các image liên quan, vì vậy trước tiên hãy tìm hiểu các lệnh image trong Docker.

Nếu muốn xem Docker hiện đang có những image nào, có thể dùng lệnh `docker images`.

```shell
[root@izrcf5u3j3q8xaz ~]# docker images
REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
MySQL         5.7.32    f07dfa83b528   11 days ago     448MB
tomcat        latest    feba8d001e3f   2 weeks ago     649MB
nginx         latest    ae2feff98a0c   2 weeks ago     133MB
hello-world   latest    bf756fb1ae65   12 months ago   13.3kB
```

Trong đó `REPOSITORY` là tên image, `TAG` là nhãn phiên bản, `IMAGE ID` là id image (duy nhất), `CREATED` là thời gian tạo, lưu ý thời gian này không phải là thời gian chúng ta tải image vào Docker, mà là thời gian người tạo image tạo nó, `SIZE` là kích thước image.

Lệnh này có thể tra cứu theo tên image cụ thể:

```shell
docker image MySQL
```

Nếu làm vậy, sẽ tra cứu tất cả image MySQL trong Docker:

```shell
[root@izrcf5u3j3q8xaz ~]# docker images MySQL
REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
MySQL        5.6       0ebb5600241d   11 days ago     302MB
MySQL        5.7.32    f07dfa83b528   11 days ago     448MB
MySQL        5.5       d404d78aa797   20 months ago   205MB
```

Lệnh này còn có thể kèm tham số `-q`: `docker images -q`, `-q` có nghĩa là chỉ hiển thị id của image:

```shell
[root@izrcf5u3j3q8xaz ~]# docker images -q
0ebb5600241d
f07dfa83b528
feba8d001e3f
d404d78aa797
```

Nếu muốn tải image, dùng:

```shell
docker pull MySQL:5.7
```

`docker pull` là cố định, phía sau viết tên image và nhãn phiên bản cần tải; nếu không viết nhãn phiên bản, mà thực thi `docker pull MySQL` trực tiếp, thì sẽ tải phiên bản mới nhất của image.

Thường trước khi tải image chúng ta cần tìm kiếm xem image có những phiên bản nào mới có thể tải phiên bản cụ thể, dùng lệnh:

```shell
docker search MySQL
```

![](/images/github/javaguide/tools/docker/docker-search-mysql-terminal.png)

Tuy nhiên lệnh này chỉ có thể xem thông tin image liên quan đến MySQL, mà không biết có những phiên bản nào, nếu muốn biết phiên bản, thì chỉ có thể tra cứu như sau:

```shell
docker search MySQL:5.5
```

Nếu phiên bản tra cứu không tồn tại, kết quả sẽ trống:

![](/images/github/javaguide/tools/docker/docker-search-mysql-404-terminal.png)

Xóa image dùng lệnh:

```shell
docker image rm MySQL:5.5
```

Nếu không chỉ định phiên bản, mặc định cũng xóa phiên bản mới nhất.

Còn có thể xóa bằng cách chỉ định id image:

```shell
docker image rm bf756fb1ae65
```

Tuy nhiên lúc này báo lỗi:

```shell
[root@izrcf5u3j3q8xaz ~]# docker image rm bf756fb1ae65
Error response from daemon: conflict: unable to delete bf756fb1ae65 (must be forced) - image is being used by stopped container d5b6c177c151
```

Đây là do image `hello-world` cần xóa đang chạy, nên không thể xóa image, lúc này cần thực thi xóa bắt buộc:

```shell
docker image rm -f bf756fb1ae65
```

Lệnh này sẽ xóa cả image và tất cả container được thực thi từ image đó, hãy dùng cẩn thận.

Docker còn cung cấp phiên bản rút gọn của lệnh xóa image: `docker rmi tên-image:nhãn-phiên-bản`.

Lúc này chúng ta có thể kết hợp `rmi` và `-q` để thực hiện một số thao tác kết hợp, ví dụ bây giờ muốn xóa tất cả image MySQL, thì bạn cần tra cứu id các image MySQL và xóa từng cái một bằng `docker rmi`, nhưng bây giờ chúng ta có thể làm thế này:

```shell
docker rmi -f $(docker images MySQL -q)
```

Trước tiên dùng `docker images MySQL -q` tra cứu tất cả id image MySQL, `-q` có nghĩa là chỉ tra cứu id, và truyền các id này làm tham số cho lệnh `docker rmi -f`, như vậy tất cả image MySQL đều bị xóa.

## Lệnh container Docker

Sau khi nắm vững các lệnh liên quan đến image, chúng ta cần tìm hiểu về lệnh container, container dựa trên image.

Nếu cần chạy một container từ image, dùng:

```shell
docker run tomcat:8.0-jre8
```

Tất nhiên, điều kiện để chạy là bạn phải có image đó, vì vậy trước tiên tải image:

```shell
docker pull tomcat:8.0-jre8
```

Sau khi tải xong có thể chạy, sau khi chạy kiểm tra các container đang chạy hiện tại: `docker ps`.

![](/images/github/javaguide/tools/docker/docker-ps-terminal.png)

Trong đó `CONTAINER_ID` là id container, `IMAGE` là tên image, `COMMAND` là lệnh thực thi trong container, `CREATED` là thời gian tạo container, `STATUS` là trạng thái container, `PORTS` là cổng mà service trong container lắng nghe, `NAMES` là tên container.

Tomcat được chạy bằng cách này không thể truy cập trực tiếp từ bên ngoài, vì container có tính cách ly, nếu muốn truy cập trực tiếp tomcat bên trong container qua cổng 8080, cần ánh xạ cổng host với cổng trong container:

```shell
docker run -p 8080:8080 tomcat:8.0-jre8
```

Giải thích tác dụng của hai cổng này (`8080:8080`), cổng 8080 đầu tiên là cổng host, cổng 8080 thứ hai là cổng bên trong container, truy cập từ bên ngoài vào cổng 8080 sẽ qua ánh xạ để truy cập cổng 8080 bên trong container.

Lúc này bên ngoài có thể truy cập Tomcat:

![](/images/github/javaguide/tools/docker/docker-run-tomact-8080.png)

Nếu ánh xạ như sau:

```shell
docker run -p 8088:8080 tomcat:8.0-jre8
```

Thì bên ngoài cần truy cập cổng 8088 mới có thể truy cập tomcat, cần lưu ý là mỗi container được chạy đều độc lập với nhau, vì vậy chạy đồng thời nhiều container tomcat sẽ không gây ra xung đột cổng.

Container còn có thể chạy ở chế độ nền, như vậy sẽ không chiếm terminal:

```shell
docker run -d -p 8080:8080 tomcat:8.0-jre8
```

Khi khởi động container, mặc định container sẽ được đặt tên, nhưng tên này thực ra có thể thiết lập, dùng lệnh:

```shell
docker run -d -p 8080:8080 --name tomcat01 tomcat:8.0-jre8
```

Lúc này tên container là tomcat01, tên container phải là duy nhất.

Tiếp tục mở rộng thêm một vài tham số lệnh trong `docker ps`, ví dụ `-a`:

```shell
docker ps -a
```

Tham số này sẽ liệt kê tất cả container đang chạy và không chạy.

Tham số `-q` chỉ tra cứu id của các container đang chạy: `docker ps -q`.

```shell
[root@izrcf5u3j3q8xaz ~]# docker ps -q
f3aac8ee94a3
074bf575249b
1d557472a708
4421848ba294
```

Nếu kết hợp dùng, thì tra cứu tất cả id container đang chạy và không chạy: `docker ps -qa`.

```shell
[root@izrcf5u3j3q8xaz ~]# docker ps -aq
f3aac8ee94a3
7f7b0e80c841
074bf575249b
a1e830bddc4c
1d557472a708
4421848ba294
b0440c0a219a
c2f5d78c5d1a
5831d1bab2a6
d5b6c177c151
```

Tiếp theo là lệnh dừng, khởi động lại container, vì rất đơn giản nên sẽ không giới thiệu nhiều.

```shell
docker start c2f5d78c5d1a
```

Lệnh này có thể khởi động lại container đã dừng chạy, có thể khởi động bằng id container hoặc tên container.

```shell
docker restart c2f5d78c5d1a
```

Lệnh này có thể khởi động lại container được chỉ định.

```shell
docker stop c2f5d78c5d1a
```

Lệnh này có thể dừng container được chỉ định.

```shell
docker kill c2f5d78c5d1a
```

Lệnh này có thể trực tiếp kill container được chỉ định.

Tất cả các lệnh trên đều có thể kết hợp sử dụng bằng id container và tên container.

---

Sau khi container bị dừng, container tuy không còn chạy nữa nhưng vẫn tồn tại, nếu muốn xóa nó, dùng lệnh:

```shell
docker rm d5b6c177c151
```

Cần lưu ý id container không cần viết đầy đủ, chỉ cần đủ để xác định duy nhất là được.

Nếu muốn xóa container đang chạy, cần thêm tham số `-f` để xóa bắt buộc:

```shell
docker rm -f d5b6c177c151
```

Nếu muốn xóa tất cả container, có thể dùng lệnh kết hợp:

```shell
docker rm -f $(docker ps -qa)
```

Trước tiên dùng `docker ps -qa` tra cứu id tất cả container, sau đó xóa bằng `docker rm -f`.

---

Khi container chạy ở chế độ nền, chúng ta không biết trạng thái chạy của container, nếu lúc này cần xem log chạy của container, dùng lệnh:

```shell
docker logs 289cc00dc5ed
```

Cách hiển thị này không phải là real-time, nếu muốn hiển thị real-time, cần dùng tham số `-f`:

```shell
docker logs -f 289cc00dc5ed
```

Thông qua tham số `-t` còn có thể hiển thị timestamp của log, thường kết hợp với tham số `-f`:

```shell
docker logs -ft 289cc00dc5ed
```

---

Xem các tiến trình đang chạy trong container, có thể dùng lệnh:

```shell
docker top 289cc00dc5ed
```

Nếu muốn tương tác với container, dùng lệnh:

```shell
docker exec -it 289cc00dc5ed bash
```

Lúc này terminal sẽ vào bên trong container, các lệnh thực thi đều có hiệu lực trong container, trong container chỉ có thể thực thi một số lệnh đơn giản như ls, cd, v.v., nếu muốn thoát khỏi terminal container, quay lại CentOS, thực thi `exit` là được.

Bây giờ chúng ta đã có thể vào terminal container để thực hiện các thao tác liên quan rồi, vậy làm thế nào để triển khai một dự án vào container tomcat?

```shell
docker cp ./test.html 289cc00dc5ed:/usr/local/tomcat/webapps
```

Thông qua lệnh `docker cp` có thể sao chép file từ CentOS vào container, `./test.html` là đường dẫn tài nguyên trong CentOS, `289cc00dc5ed` là id container, `/usr/local/tomcat/webapps` là đường dẫn tài nguyên trong container, lúc này file `test.html` sẽ được sao chép vào đường dẫn đó.

```shell
[root@izrcf5u3j3q8xaz ~]# docker exec -it 289cc00dc5ed bash
root@289cc00dc5ed:/usr/local/tomcat# cd webapps
root@289cc00dc5ed:/usr/local/tomcat/webapps# ls
test.html
root@289cc00dc5ed:/usr/local/tomcat/webapps#
```

Nếu muốn sao chép file trong container ra CentOS, thì đảo ngược lại là được:

```shell
docker cp 289cc00dc5ed:/usr/local/tomcat/webapps/test.html ./
```

Vì vậy bây giờ nếu muốn triển khai dự án, trước tiên upload dự án lên CentOS, sau đó sao chép dự án từ CentOS vào container, lúc này khởi động container là xong.

---

Mặc dù dùng Docker khởi động môi trường phần mềm rất đơn giản, nhưng đồng thời cũng gặp phải một vấn đề, chúng ta không biết các chi tiết cụ thể bên trong container, ví dụ cổng lắng nghe, địa chỉ ip ràng buộc, v.v., may mắn thay Docker đã nghĩ đến điều này cho chúng ta, chỉ cần dùng lệnh:

```shell
docker inspect 923c969b0d91
```

![](/images/github/javaguide/tools/docker/docker-inspect-terminal.png)

## Data volume Docker

Sau khi học các lệnh container liên quan, chúng ta tìm hiểu về data volume trong Docker, nó có thể thực hiện chia sẻ file giữa host và container, lợi thế của nó là việc chúng ta sửa đổi file trên host sẽ trực tiếp ảnh hưởng đến container, mà không cần sao chép lại file từ host vào container.

Bây giờ nếu muốn tạo data volume giữa thư mục `/opt/apps` trong host và thư mục `webapps` trong container, nên viết lệnh như sau:

```shell
docker run -d -p 8080:8080 --name tomcat01 -v /opt/apps:/usr/local/tomcat/webapps tomcat:8.0-jre8
```

Tuy nhiên lúc này truy cập tomcat sẽ thấy không thể truy cập:

![](/images/github/javaguide/tools/docker/docker-data-volume-webapp-8080.png)

Điều này chứng tỏ data volume của chúng ta đã được thiết lập thành công, Docker sẽ đồng bộ thư mục `webapps` trong container với thư mục `/opt/apps`, và lúc này thư mục `/opt/apps` rỗng, dẫn đến thư mục `webapps` cũng trở thành thư mục rỗng, nên không thể truy cập.

Lúc này chúng ta chỉ cần thêm file vào thư mục `/opt/apps`, thư mục `webapps` cũng sẽ có file tương tự, đạt được chia sẻ file, thử nghiệm:

```shell
[root@centos-7 opt]# cd apps/
[root@centos-7 apps]# vim test.html
[root@centos-7 apps]# ls
test.html
[root@centos-7 apps]# cat test.html
<h1>This is a test html!</h1>
```

Đã tạo file `test.html` trong thư mục `/opt/apps`, vậy thư mục `webapps` trong container có file đó không? Vào terminal container:

```shell
[root@centos-7 apps]# docker exec -it tomcat01 bash
root@115155c08687:/usr/local/tomcat# cd webapps/
root@115155c08687:/usr/local/tomcat/webapps# ls
test.html
```

Bên trong container thực sự đã có file đó, tiếp theo chúng ta viết một ứng dụng Web đơn giản:

```java
public class HelloServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.getWriter().println("Hello World!");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doGet(req,resp);
    }
}
```

Đây là một Servlet rất đơn giản, chúng ta đóng gói nó và upload vào `/opt/apps`, thì container chắc chắn sẽ đồng bộ file đó, lúc này truy cập:

![](/images/github/javaguide/tools/docker/docker-data-volume-webapp-8080-hello-world.png)

Cách thiết lập data volume này gọi là data volume tùy chỉnh, vì thư mục data volume do chúng ta tự thiết lập, Docker còn cung cấp cho chúng ta một cách thiết lập data volume khác:

```shell
docker run -d -p 8080:8080 --name tomcat01 -v aa:/usr/local/tomcat/webapps tomcat:8.0-jre8
```

Lúc này `aa` không phải là thư mục của data volume, mà là bí danh của data volume, Docker sẽ tự động tạo cho chúng ta một data volume có tên là `aa`, và sẽ sao chép tất cả nội dung trong thư mục `webapps` của container vào data volume, data volume này nằm trong thư mục `/var/lib/docker/volumes`:

```shell
[root@centos-7 volumes]# pwd
/var/lib/docker/volumes
[root@centos-7 volumes]# cd aa/
[root@centos-7 aa]# ls
_data
[root@centos-7 aa]# cd _data/
[root@centos-7 _data]# ls
docs  examples  host-manager  manager  ROOT
```

Lúc này chúng ta chỉ cần sửa đổi nội dung thư mục đó là có thể ảnh hưởng đến container.

---

Cuối cùng giới thiệu thêm một vài lệnh liên quan đến container và image:

```shell
docker commit -m "描述信息" -a "镜像作者" tomcat01 my_tomcat:1.0
```

Lệnh này có thể đóng gói container thành một image, lúc này tra cứu image:

```shell
[root@centos-7 _data]# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
my_tomcat           1.0                 79ab047fade5        2 seconds ago       463MB
tomcat              8                   a041be4a5ba5        2 weeks ago         533MB
MySQL               latest              db2b37ec6181        2 months ago        545MB
```

Nếu muốn backup image ra ngoài, có thể dùng lệnh:

```shell
docker save my_tomcat:1.0 -o my-tomcat-1.0.tar
```

```shell
[root@centos-7 ~]# docker save my_tomcat:1.0 -o my-tomcat-1.0.tar
[root@centos-7 ~]# ls
anaconda-ks.cfg  initial-setup-ks.cfg  公共  视频  文档  音乐
get-docker.sh    my-tomcat-1.0.tar     模板  图片  下载  桌面
```

Nếu có image định dạng `.tar`, làm thế nào để tải nó vào Docker? Thực thi lệnh:

```shell
docker load -i my-tomcat-1.0.tar
```

```shell
root@centos-7 ~]# docker load -i my-tomcat-1.0.tar
b28ef0b6fef8: Loading layer [==================================================>]  105.5MB/105.5MB
0b703c74a09c: Loading layer [==================================================>]  23.99MB/23.99MB
......
Loaded image: my_tomcat:1.0
[root@centos-7 ~]# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
my_tomcat           1.0                 79ab047fade5        7 minutes ago       463MB
```

<!-- @include: @article-footer.snippet.md -->
