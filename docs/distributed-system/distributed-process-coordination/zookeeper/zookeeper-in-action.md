---
title: Hướng dẫn thực hành ZooKeeper
category: Distributed System
description: Hướng dẫn thực hành ZooKeeper, bao gồm cài đặt qua Docker, các lệnh zkCli phổ biến (create/get/set/delete/ls), four-letter commands (stat/srvr/dump) và các operations CRUD cùng distributed lock bằng Java client Curator.
tag:
  - ZooKeeper
head:
  - - meta
    - name: keywords
      content: ZooKeeper,ZooKeeper install,ZooKeeper commands,Curator,zkCli,distributed lock,Docker deploy,four-letter commands,ZooKeeper practice
---

<!-- @include: @small-advertisement.snippet.md -->

Bài viết này demo đơn giản các lệnh phổ biến của ZooKeeper và cách sử dụng cơ bản của Java client Curator. Nội dung được giới thiệu đều là các operations cơ bản nhất, đáp ứng nhu cầu làm việc hàng ngày.

Nếu bài có điều gì cần cải thiện, hãy góp ý trong phần comment!

## Cài đặt ZooKeeper

### Cài đặt ZooKeeper qua Docker

**a. Pull ZooKeeper bằng Docker**

```shell
docker pull zookeeper:3.5.8
```

**b. Chạy ZooKeeper**

```shell
docker run -d --name zookeeper -p 2181:2181 zookeeper:3.5.8
```

### Kết nối ZooKeeper service

**a. Vào trong ZooKeeper container**

Dùng `docker ps` để xem ContainerID của ZooKeeper, sau đó dùng lệnh `docker exec -it ContainerID /bin/bash` để vào container.

**b. Vào thư mục bin, sau đó kết nối ZooKeeper service qua lệnh `./zkCli.sh -server 127.0.0.1:2181`**

```bash
root@eaf70fc620cb:/apache-zookeeper-3.5.8-bin# cd bin
```

Nếu bạn thấy console in ra thông tin như hình dưới, nghĩa là đã kết nối thành công ZooKeeper service.

![Kết nối ZooKeeper service](/images/github/javaguide/distributed-system/zookeeper/connect-zooKeeper-service.png)

## Demo các lệnh phổ biến của ZooKeeper

### Xem các lệnh phổ biến (lệnh help)

Dùng lệnh `help` để xem các lệnh phổ biến của ZooKeeper

### Tạo node (lệnh create)

Tạo node1 trong root directory với chuỗi liên kết là "node1"

```shell
[zk: 127.0.0.1:2181(CONNECTED) 34] create /node1 "node1"
```

Tạo node1 trong root directory với nội dung liên kết là số 123

```shell
[zk: 127.0.0.1:2181(CONNECTED) 1] create /node1/node1.1 123
Created /node1/node1.1
```

### Cập nhật dữ liệu node (lệnh set)

```shell
[zk: 127.0.0.1:2181(CONNECTED) 11] set /node1 "set node1"
```

### Lấy dữ liệu node (lệnh get)

Lệnh `get` có thể lấy nội dung dữ liệu và trạng thái của node được chỉ định. Có thể thấy chúng ta đã đổi nội dung node data thành "set node1" bằng lệnh `set`.

```shell
[zk: zookeeper(CONNECTED) 12] get -s /node1
set node1
cZxid = 0x47
ctime = Sun Jan 20 10:22:59 CST 2019
mZxid = 0x4b
mtime = Sun Jan 20 10:41:10 CST 2019
pZxid = 0x4a
cversion = 1
dataVersion = 1
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 9
numChildren = 1

```

### Xem child nodes trong một directory (lệnh ls)

Xem nodes trong root directory bằng lệnh `ls`

```shell
[zk: 127.0.0.1:2181(CONNECTED) 37] ls /
[dubbo, ZooKeeper, node1]
```

Xem nodes trong directory node1 bằng lệnh `ls`

```shell
[zk: 127.0.0.1:2181(CONNECTED) 5] ls /node1
[node1.1]
```

Lệnh `ls` trong ZooKeeper tương tự lệnh `ls` trong Linux, liệt kê thông tin tất cả child nodes dưới absolute path (1 level, không đệ quy)

### Xem trạng thái node (lệnh stat)

Xem trạng thái node bằng lệnh `stat`

```shell
[zk: 127.0.0.1:2181(CONNECTED) 10] stat /node1
cZxid = 0x47
ctime = Sun Jan 20 10:22:59 CST 2019
mZxid = 0x47
mtime = Sun Jan 20 10:22:59 CST 2019
pZxid = 0x4a
cversion = 1
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 11
numChildren = 1
```

Một số thông tin hiển thị ở trên như cversion, aclVersion, numChildren... đã được giới thiệu trong bài "[ZooKeeper Introduction Guide](https://javaguide.cn/distributed-system/distributed-process-coordination/zookeeper/zookeeper-intro.html)".

### Xem node info và trạng thái (lệnh ls2)

Lệnh `ls2` giống như sự kết hợp của lệnh `ls` và `stat`. Thông tin trả về của lệnh `ls2` gồm 2 phần:

1. Danh sách child nodes
2. Thông tin stat của node hiện tại

```shell
[zk: 127.0.0.1:2181(CONNECTED) 7] ls2 /node1
[node1.1]
cZxid = 0x47
ctime = Sun Jan 20 10:22:59 CST 2019
mZxid = 0x47
mtime = Sun Jan 20 10:22:59 CST 2019
pZxid = 0x4a
cversion = 1
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 11
numChildren = 1

```

### Xóa node (lệnh delete)

Lệnh này khá đơn giản, nhưng cần lưu ý: để xóa một node, node đó phải không có child nodes.

```shell
[zk: 127.0.0.1:2181(CONNECTED) 3] delete /node1/node1.1
```

## Sử dụng cơ bản ZooKeeper Java Client Curator

Curator là một bộ framework Java client mã nguồn mở cho ZooKeeper của Netflix. So với ZooKeeper client tích hợp sẵn, Curator được đóng gói hoàn thiện hơn, các API đều khá tiện dụng.

![](/images/github/javaguide/distributed-system/zookeeper/curator.png)

Hãy demo đơn giản cách dùng Curator!

Curator 4.0+ hỗ trợ tốt ZooKeeper 3.5.x. Trước khi bắt đầu, hãy thêm dependencies sau vào project của bạn.

```xml
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-framework</artifactId>
    <version>4.2.0</version>
</dependency>
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-recipes</artifactId>
    <version>4.2.0</version>
</dependency>
```

### Kết nối ZooKeeper client

Tạo `CuratorFramework` object thông qua `CuratorFrameworkFactory`, sau đó gọi method `start()` của `CuratorFramework` object là xong!

```java
private static final int BASE_SLEEP_TIME = 1000;
private static final int MAX_RETRIES = 3;

// Retry strategy. Retry 3 times, and will increase the sleep time between retries.
RetryPolicy retryPolicy = new ExponentialBackoffRetry(BASE_SLEEP_TIME, MAX_RETRIES);
CuratorFramework zkClient = CuratorFrameworkFactory.builder()
    // the server to connect to (can be a server list)
    .connectString("127.0.0.1:2181")
    .retryPolicy(retryPolicy)
    .build();
zkClient.start();
```

Giải thích một số parameters cơ bản:

- `baseSleepTimeMs`: Thời gian chờ ban đầu giữa các lần retry
- `maxRetries`: Số lần retry tối đa
- `connectString`: Danh sách servers cần kết nối
- `retryPolicy`: Retry strategy

### CRUD của data nodes

#### Tạo node

Như đã giới thiệu trong [ZooKeeper Common Concepts](./zookeeper-intro.md), thường phân znode thành 4 loại:

- **PERSISTENT node**: Một khi tạo sẽ tồn tại mãi dù ZooKeeper cluster crash, cho đến khi bị xóa.
- **EPHEMERAL node**: Lifetime gắn với **client session**, **session mất thì node mất**. Ephemeral nodes chỉ có thể là leaf nodes, không tạo được child nodes.
- **PERSISTENT_SEQUENTIAL node**: Ngoài đặc tính của PERSISTENT node, tên child nodes còn có sequential. Ví dụ `/node1/app0000000001`, `/node1/app0000000002`.
- **EPHEMERAL_SEQUENTIAL node**: Ngoài đặc tính của EPHEMERAL node, tên child nodes còn có sequential.

Khi dùng ZooKeeper, bạn sẽ thấy class `CreateMode` thực sự có 7 loại znode, nhưng hay dùng nhất vẫn là 4 loại trên.

**a. Tạo persistent node**

Có thể tạo persistent node theo 2 cách sau.

```java
//Lưu ý: code dưới sẽ báo lỗi, nguyên nhân giải thích ở dưới
zkClient.create().forPath("/node1/00001");
zkClient.create().withMode(CreateMode.PERSISTENT).forPath("/node1/00002");
```

Nhưng chạy code trên sẽ báo lỗi vì parent node `node1` chưa được tạo.

Bạn có thể tạo parent node `node1` trước, sau đó chạy code trên sẽ không báo lỗi nữa.

```java
zkClient.create().forPath("/node1");
```

Cách khuyến nghị hơn là dùng dòng code sau, **`creatingParentsIfNeeded()` đảm bảo tự động tạo parent node khi chưa tồn tại, rất hữu dụng.**

```java
zkClient.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath("/node1/00001");
```

**b. Tạo ephemeral node**

```java
zkClient.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL).forPath("/node1/00001");
```

**c. Tạo node và chỉ định nội dung dữ liệu**

```java
zkClient.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL).forPath("/node1/00001","java".getBytes());
zkClient.getData().forPath("/node1/00001");//Lấy dữ liệu node, trả về byte array
```

**d. Kiểm tra node có được tạo thành công không**

```java
zkClient.checkExists().forPath("/node1/00001");//Nếu không null, node tạo thành công
```

#### Xóa node

**a. Xóa một child node**

```java
zkClient.delete().forPath("/node1/00001");
```

**b. Xóa một node và tất cả child nodes của nó**

```java
zkClient.delete().deletingChildrenIfNeeded().forPath("/node1");
```

#### Lấy/Cập nhật nội dung dữ liệu node

```java
zkClient.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL).forPath("/node1/00001","java".getBytes());
zkClient.getData().forPath("/node1/00001");//Lấy nội dung dữ liệu node
zkClient.setData().forPath("/node1/00001","c++".getBytes());//Cập nhật nội dung dữ liệu node
```

#### Lấy tất cả child node paths của một node

```java
List<String> childrenPaths = zkClient.getChildren().forPath("/node1");
```

<!-- @include: @article-footer.snippet.md -->
