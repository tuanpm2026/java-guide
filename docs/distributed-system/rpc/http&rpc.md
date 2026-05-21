---
title: So sánh HTTP và RPC
category: Distributed
description: Giải thích chi tiết so sánh HTTP và RPC, từ tầng TCP giải thích bản chất sự khác biệt của hai cách giao tiếp, performance gap (serialization/connection reuse), so sánh transport protocol và gợi ý lựa chọn trong kiến trúc microservice.
tag:
  - RPC
head:
  - - meta
    - name: keywords
      content: HTTP,RPC,HTTP vs RPC,microservice communication,RPC protocol,TCP communication,serialization,RESTful,service call
---

> Bài này do [Xiaobai Debug](https://juejin.cn/user/4001878057422087) đóng góp. Bài gốc: <https://juejin.cn/post/7121882245605883934>.

Tôi nhớ lúc mới đi làm, lần đầu tiên tiếp xúc RPC protocol — lúc đó rất ngơ ngác. Tôi đang dùng HTTP protocol ổn, tại sao lại phải dùng RPC protocol?

Thế là lên mạng tìm.

Nhiều giải thích trông rất "official". Tôi tin mọi người cũng đã thấy trên nhiều platform khác nhau — giải thích xong như chưa giải thích, đều **dùng một khái niệm mình không biết để giải thích một khái niệm khác mình không biết**. Người hiểu rồi không cần đọc, người không hiểu đọc xong vẫn không hiểu.

Cái cảm giác đọc xong như chưa đọc, mơ hồ và khó chịu đó — **tôi hiểu**.

Để tránh mọi người **mệt mỏi thẩm mỹ** nặng nề, hôm nay chúng ta thử đổi cách trình bày.

## Bắt đầu từ TCP

Với tư cách là programmer, giả sử chúng ta cần gửi một đoạn data từ process trên máy A đến process trên máy B. Thông thường trong code chúng ta sẽ dùng socket để lập trình.

Lúc này các tùy chọn thường là **chọn một trong TCP và UDP. TCP đáng tin cậy, UDP không đáng tin cậy.** Trừ khi là programmer siêu đẳng như Ma Teng (QQ ban đầu dùng nhiều UDP), ngược lại chỉ cần có chút yêu cầu về độ tin cậy, người thường cứ chọn TCP là đúng rồi.

Tương tự như thế này:

```ini
fd = socket(AF_INET,SOCK_STREAM,0);
```

Trong đó `SOCK_STREAM` — sử dụng **byte stream** để truyền data. Nói thẳng ra chính là **TCP protocol**.

Sau khi định nghĩa socket, có thể vui vẻ thao tác với socket này như dùng `bind()` bind IP port, dùng `connect()` khởi tạo kết nối.

![Quá trình handshake thiết lập kết nối](/images/github/javaguide/distributed-system/rpc/f410977cda814d32b0eff3645c385a8a~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

Sau khi kết nối được thiết lập, có thể dùng `send()` gửi data, `recv()` nhận data.

Chỉ một kết nối TCP thuần như vậy đã có thể gửi nhận data rồi — vậy có đủ chưa?

Không đủ, dùng thế này sẽ có vấn đề.

## Dùng TCP thuần sẽ có vấn đề gì?

Ba đặc điểm TCP hay được nhắc đến: **hướng kết nối (connection-oriented)**, **đáng tin cậy (reliable)**, dựa trên **byte stream**.

![TCP là gì](/images/github/javaguide/distributed-system/rpc/acb4508111cb47d8a3df6734d04818bc~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

Ba đặc điểm này **tóm tắt rất sắc bén** — không học vô ích.

Mỗi đặc điểm đều có thể bàn cả bài, nhưng hôm nay chúng ta cần tập trung vào **dựa trên byte stream**.

Byte stream có thể hiểu là binary data (tức **chuỗi 01**) chảy trong một channel hai chiều. Các chuỗi 01 TCP thuần gửi/nhận **không có bất kỳ ranh giới nào** — bạn không biết đến đâu mới là một message hoàn chỉnh.

![Binary byte stream 01](/images/github/javaguide/distributed-system/rpc/b82d4fcdd0c4491e979856c93c1750d7~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

Chính vì đặc điểm không có ranh giới này, khi chúng ta dùng TCP gửi **"xin" và "chào"**, receiver nhận được là **"xinchào"** — lúc đó receiver không phân biệt được bạn muốn biểu đạt **"xin"+"chào"** hay **"xinch"+"ào"**.

![So sánh message](/images/github/javaguide/distributed-system/rpc/4e120d0f1152419585565f693e744a3a~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

Đây chính là vấn đề gọi là **TCP sticky packet problem**. Trước đây cũng đã có bài riêng bàn về vấn đề này.

Mục đích nói điều này là để cho mọi người biết rằng TCP thuần không thể dùng trực tiếp. Cần thêm một số **quy tắc tùy chỉnh** trên cơ sở này để phân biệt **message boundary**.

Do đó mỗi data cần gửi đều được đóng gói, ví dụ thêm **message header**. Trong message header ghi rõ độ dài của một packet hoàn chỉnh là bao nhiêu. Dựa trên độ dài này có thể tiếp tục nhận data, cắt ra là **message body** thực sự cần truyền.

![Message boundary length flag](/images/github/javaguide/distributed-system/rpc/cb29659d4907446e9f70551c44c6369f~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

**Message header** đã đề cập ở trên còn có thể chứa các thứ khác, như message body có được compress không, message body format là gì, v.v. Chỉ cần upstream và downstream đều thỏa thuận và đồng ý với nhau — đây gọi là **protocol**.

Mỗi project dùng TCP có thể định nghĩa một bộ tiêu chuẩn parse protocol tương tự. Chúng có thể **có sự khác biệt nhưng nguyên lý đều tương tự**.

**Và vì vậy trên cơ sở TCP đã phát sinh rất nhiều protocol, như HTTP và RPC.**

## HTTP và RPC

### RPC thực ra là một kiểu gọi

Hãy quay lại xem sơ đồ phân tầng mạng.

![Four-layer network protocol](/images/github/javaguide/distributed-system/rpc/04b603b5bd2443209233deea87816161~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

**TCP là transport layer protocol**, còn HTTP và các loại RPC protocol được xây dựng trên TCP chỉ là **application layer protocol** định nghĩa các format message khác nhau mà thôi.

**HTTP** (HyperText Transfer Protocol) còn gọi là **giao thức truyền tải siêu văn bản**. Chúng ta dùng khá nhiều. Hàng ngày lên mạng gõ URL vào trình duyệt là truy cập được trang web — đây chính là HTTP protocol.

![HTTP call](/images/github/javaguide/distributed-system/rpc/8f07a5d1c72a4c4fa811c6c3b5aadd3d~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

Còn **RPC** (Remote Procedure Call — gọi hàm từ xa), nó bản thân không phải một protocol cụ thể mà là một **cách gọi**.

Ví dụ: khi chúng ta gọi **local method** thì như thế này:

```ini
 res = localFunc(req)
```

Nếu đây không phải local method mà là method `remoteFunc` được expose bởi **remote server** — nếu chúng ta vẫn có thể gọi nó như gọi local method, như vậy có thể **che giấu một số network detail**, dùng tiện hơn, có phải tuyệt không?

```ini
res = remoteFunc(req)
```

![RPC có thể gọi remote method như gọi local method](/images/github/javaguide/distributed-system/rpc/761da6c30af244e19b1c44075d8b4254~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

Dựa trên tư tưởng này, các đại nhân đã tạo ra rất nhiều loại RPC protocol, như `gRPC` và `thrift` nổi tiếng.

Đáng chú ý: dù hầu hết RPC protocol dùng TCP ở tầng dưới, nhưng thực tế **chúng không nhất thiết phải dùng TCP — thay bằng UDP hoặc HTTP vẫn có thể đạt chức năng tương tự.**

Đến đây quay lại câu hỏi trong tiêu đề bài.

### Đã có RPC rồi, tại sao còn cần HTTP?

Thực ra TCP là protocol ra đời từ **năm 70**. HTTP thì đến **thập niên 90** mới bắt đầu phổ biến. Dùng TCP thuần sẽ có vấn đề — có thể hình dung bao nhiêu protocol tùy chỉnh ra đời trong khoảng thời gian đó, trong số đó có `RPC` ra đời từ **thập niên 80**.

Vì vậy câu ta nên hỏi không phải **đã có HTTP tại sao lại còn có RPC**, mà là **đã có RPC tại sao lại còn có HTTP?**

Các phần mềm được cài trên máy tính hiện nay, như phần mềm XX quản lý, XX bảo vệ — chúng đều là client (Client) cần kết nối với server (Server) để nhận/gửi message. Lúc này đều cần dùng application layer protocol. Trong kiến trúc Client/Server (C/S) này, chúng có thể dùng RPC protocol tự chế vì chỉ cần kết nối với server của công ty mình thôi.

Nhưng có một phần mềm khác — trình duyệt (Browser). Dù là Chrome hay IE, không chỉ cần kết nối được **server của công ty mình** mà còn phải truy cập được server của các website khác. Do đó cần có một tiêu chuẩn thống nhất, nếu không mọi người không thể giao tiếp. HTTP chính là protocol dùng để thống nhất **Browser/Server (B/S)** trong thời đại đó.

Tức là nhiều năm trước, **HTTP chủ yếu dùng cho B/S architecture, còn RPC dùng nhiều hơn cho C/S architecture. Nhưng bây giờ thực ra ranh giới đó đã không còn rõ nữa — B/S và C/S đang dần hợp nhất.** Nhiều phần mềm hỗ trợ cùng lúc nhiều platform, như Baidu Netdisk — vừa cần hỗ trợ web version, vừa cần hỗ trợ mobile và PC. Nếu communication protocol đều dùng HTTP thì server chỉ cần một bộ là đủ. Còn RPC bắt đầu rút về backstage, thường dùng trong cluster nội bộ công ty để giao tiếp giữa các microservice.

Vậy nói thế thì **cứ dùng HTTP hết không phải tiện hơn? Cần gì đến RPC?**

Dường như lại quay về điểm đầu bài. Vậy thì phải từ điểm khác biệt giữa chúng mà nói.

### HTTP và RPC khác nhau chỗ nào?

Hãy xem một vài điểm khác biệt khá rõ giữa RPC và HTTP.

#### Service Discovery

Trước tiên muốn gửi request đến server nào đó, phải thiết lập kết nối. Điều kiện tiên quyết để thiết lập kết nối là phải biết **địa chỉ IP và port**. Quá trình tìm ra IP port tương ứng với service này thực ra chính là **service discovery**.

Với **HTTP**, bạn biết domain name của service, có thể qua **DNS service** resolve ra IP address phía sau. Cổng mặc định là **80**.

Còn với **RPC** thì có sự khác biệt. Thường có middleware riêng để lưu service name và thông tin IP, như **Consul, Etcd, Nacos, ZooKeeper, thậm chí Redis**. Muốn truy cập một service nào đó thì lấy thông tin IP và port từ các middleware này. Vì DNS cũng là một loại service discovery, nên cũng có component làm service discovery dựa trên DNS như **CoreDNS**.

Có thể thấy phần service discovery hai bên có chút khác biệt nhưng không phân được cao thấp.

#### Hình thức kết nối tầng dưới

Lấy **HTTP1.1** phổ biến hiện nay làm ví dụ. Mặc định sau khi thiết lập TCP connection ở tầng dưới sẽ giữ nguyên kết nối đó (**keep alive**). Các request và response sau sẽ tái sử dụng kết nối này.

**RPC** protocol thì tương tự HTTP, cũng thiết lập long connection TCP để trao đổi data. Nhưng điểm khác là RPC protocol thường còn tạo thêm **connection pool**. Khi request volume lớn, tạo nhiều connection đặt trong pool. Khi cần gửi data thì lấy một connection từ pool ra, dùng xong trả lại, lần sau tái sử dụng — rất tiết kiệm.

![connection_pool](/images/github/javaguide/distributed-system/rpc/72fcad064c9e4103a11f1a2d579f79b2~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

Vì connection pool có lợi cho cải thiện network request performance, nhiều network library của ngôn ngữ lập trình cũng thêm connection pool cho HTTP, như Go làm thế.

Có thể thấy phần này hai bên cũng không chênh lệch nhiều, nên cũng không phải điểm mấu chốt.

#### Nội dung truyền tải

Message truyền qua TCP, cuối cùng cũng chỉ là **Message Header và Message Body**.

**Header** dùng để đánh dấu một số thông tin đặc biệt, trong đó quan trọng nhất là **độ dài message body**.

**Body** chứa nội dung thực sự cần truyền — chỉ có thể là binary 01 string vì máy tính chỉ hiểu cái này. Nên TCP truyền string và number không vấn đề gì — string có thể convert sang encoding rồi thành 01 string, còn number bản thân cũng có thể trực tiếp convert sang binary. Nhưng struct thì sao? Cần nghĩ cách convert nó thành binary 01 string. Hiện có nhiều phương án sẵn có như **JSON, Protocol Buffers (Protobuf)**.

Quá trình convert struct sang binary array gọi là **serialization**. Ngược lại convert binary array về struct gọi là **deserialization**.

![Serialization và Deserialization](/images/github/javaguide/distributed-system/rpc/d501dfc6f764430188ce61fda0f3e5d9~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

Với HTTP1.1 chính luồng, dù hiện nay nó được gọi là hypertext protocol và hỗ trợ audio/video, nhưng HTTP ban đầu được thiết kế để hiển thị text web page, nên nội dung truyền chủ yếu là string. Header và Body đều như vậy. Ở phần Body, nó dùng **JSON** để **serialize** struct data.

Nhìn vào hình minh họa:

![HTTP message](/images/github/javaguide/distributed-system/rpc/04e8a79ddb7247759df23f1132c01655~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

Có thể thấy nội dung ở đây rất nhiều redundancy — rất dài dòng. Rõ ràng nhất là các thông tin trong Header, nếu chúng ta thỏa thuận trước rằng vị trí thứ mấy trong header là `Content-Type` thì không cần mỗi lần đều thực sự truyền field `Content-Type` này. Tình huống tương tự cũng rất rõ ràng trong cấu trúc JSON của Body.

Còn RPC, vì degree of customization cao hơn, có thể dùng Protobuf hay serialization protocol khác nhỏ hơn để lưu struct data. Đồng thời cũng không cần xem xét các browser behavior như HTTP như 302 redirect. **Do đó performance cũng tốt hơn một chút — đây cũng là lý do chính tại sao trong microservice nội bộ công ty người ta bỏ HTTP, chọn RPC.**

![Nguyên lý HTTP](/images/github/javaguide/distributed-system/rpc/284c26bb7f2848889d1d9b95cf49decb~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

![Nguyên lý RPC](/images/github/javaguide/distributed-system/rpc/edb050d383c644e895e505253f1c4d90~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp.png)

Tất nhiên HTTP ở trên thực ra **đặc chỉ HTTP1.1 đang được dùng phổ biến hiện nay**. `HTTP2` đã cải tiến rất nhiều so với phiên bản trước, nên **performance có thể còn tốt hơn nhiều RPC protocol**. Còn gRPC chính là được triển khai dựa trên HTTP/2 (dù nó định nghĩa protocol riêng trên frame format của HTTP/2, nhưng transport layer vẫn là HTTP/2).

Thế lại có câu hỏi mới.

### Đã có HTTP2 rồi, tại sao còn cần RPC protocol?

Đây là vì HTTP2 ra đời năm 2015. Lúc đó RPC protocol nội bộ của nhiều công ty đã chạy nhiều năm rồi. Do lý do lịch sử, thường cũng không cần thiết phải đổi nữa.

## Tổng kết

- TCP thuần có thể gửi nhận data, nhưng nó là data stream không có ranh giới. Tầng trên cần định nghĩa message format để xác định **message boundary**. Từ đó sinh ra nhiều protocol, HTTP và các loại RPC protocol đều là application layer protocol được định nghĩa trên TCP.
- **RPC về bản chất không phải protocol mà là một cách gọi**, còn các triển khai cụ thể như gRPC và Thrift mới là protocol — chúng là protocol triển khai RPC call. Mục đích là giúp programmer gọi remote service method như gọi local method. Đồng thời RPC có nhiều cách triển khai, **không nhất thiết phải dựa trên TCP protocol**.
- Về lịch sử phát triển: **HTTP chủ yếu dùng cho B/S architecture, còn RPC dùng nhiều hơn cho C/S architecture. Nhưng bây giờ thực ra ranh giới đó đã không còn rõ — B/S và C/S đang dần hợp nhất.** Nhiều phần mềm hỗ trợ cùng lúc nhiều platform. Nên đối ngoài thường dùng HTTP protocol, còn microservice trong cluster nội bộ thì dùng RPC để giao tiếp.
- RPC thực ra ra đời sớm hơn HTTP, và performance tốt hơn HTTP1.1 chính luồng hiện nay, nên hầu hết công ty nội bộ vẫn dùng RPC.
- **HTTP2.0** đã tối ưu rất nhiều so với **HTTP1.1**, performance có thể tốt hơn nhiều RPC protocol. Nhưng vì nó chỉ ra đời gần đây nên cũng không thể thay thế RPC được.
