---
title: Giải thích nâng cao về ZooKeeper
category: Phân tán
description: Giải thích nâng cao về ZooKeeper, đi sâu vào nguyên lý giao thức ZAB, cơ chế bầu chọn Leader (FastLeaderElection), chiến lược triển khai cluster (nút lẻ), quản lý phiên và phân tích so sánh với các trung tâm đăng ký như Eureka, Nacos.
tag:
  - ZooKeeper
head:
  - - meta
    - name: keywords
      content: ZooKeeper,ZAB协议,Leader选举,集群部署,会话管理,Eureka对比,Nacos对比,分布式协调,CP系统
---

> Bài viết do [FrancisQ](https://juejin.im/user/5c33853851882525ea106810) đóng góp.

## ZooKeeper là gì

`ZooKeeper` được phát triển bởi `Yahoo`, sau đó được tặng cho `Apache` và hiện đã trở thành dự án cấp cao nhất của `Apache`. `ZooKeeper` là một máy chủ điều phối ứng dụng phân tán mã nguồn mở, cung cấp dịch vụ nhất quán cho các hệ thống phân tán. Tính nhất quán của nó được thực hiện thông qua giao thức **ZAB（ZooKeeper Atomic Broadcast）** được thiết kế riêng cho ZooKeeper. Các chức năng chính bao gồm: duy trì cấu hình, đồng bộ hóa phân tán, quản lý cluster, v.v.

Nói đơn giản, `ZooKeeper` là một **framework điều phối phân tán**. Phân tán? Dịch vụ điều phối? Cái này là gì vậy?

Thực ra khi giải thích về khái niệm phân tán, tôi nhận thấy một số bạn không thể phân biệt rõ ràng giữa **phân tán và cluster**. Một thời gian trước có bạn thảo luận với tôi về vấn đề phân tán, họ nói phân tán không phải chỉ là thêm máy sao? Một máy không đủ thì thêm máy để chịu tải thôi. Tất nhiên cách nói "thêm máy" cũng không sai, một hệ thống phân tán chắc chắn liên quan đến nhiều máy, nhưng đừng quên, trong khoa học máy tính còn có một khái niệm tương tự—`Cluster`, cluster cũng là thêm máy đấy thôi? Nhưng **cluster** và **phân tán** thực ra là hai khái niệm hoàn toàn khác nhau.

Ví dụ, bây giờ tôi có một dịch vụ flash sale, lượng truy cập quá lớn khiến hệ thống đơn máy không chịu được, thì tôi thêm vài máy chủ cũng **tương tự** cung cấp dịch vụ flash sale, lúc này đó là **`Cluster` tức cluster**.

![cluster](https://oss.javaguide.cn/p3-juejin/60263e969b9e4a0f81724b1f4d5b3d58~tplv-k3u1fbpfcp-zoom-1.jpeg)

Nhưng, bây giờ tôi đổi cách tiếp cận, tôi **tách dịch vụ flash sale thành nhiều dịch vụ con**, ví dụ dịch vụ tạo đơn hàng, dịch vụ thêm điểm thưởng, dịch vụ trừ coupon, v.v., **sau đó tôi triển khai các dịch vụ con này trên các máy chủ khác nhau**, lúc này đó là **`Distributed` tức phân tán**.

![distributed](https://oss.javaguide.cn/p3-juejin/0d42e7b4249144b3a77a0c519216ae3d~tplv-k3u1fbpfcp-zoom-1.jpeg)

Vậy tại sao tôi phản bác quan điểm của bạn rằng phân tán chỉ là thêm máy? Vì tôi cho rằng thêm máy phù hợp hơn để xây dựng cluster, vì thực sự chỉ là thêm máy. Còn đối với phân tán, trước tiên bạn cần phân tách nghiệp vụ, sau đó mới thêm máy (không chỉ đơn giản là thêm máy), đồng thời bạn cũng phải giải quyết hàng loạt vấn đề do phân tán mang lại.

![](https://oss.javaguide.cn/p3-juejin/e3662ca1a09c4444b07f15dbf85c6ba8~tplv-k3u1fbpfcp-zoom-1.jpeg)

Ví dụ như các thành phần phân tán phối hợp với nhau như thế nào, làm thế nào để giảm độ phụ thuộc giữa các hệ thống, xử lý transaction phân tán, cấu hình toàn bộ hệ thống phân tán như thế nào, v.v. `ZooKeeper` chủ yếu dùng để giải quyết những vấn đề này.

## Vấn đề nhất quán

Khi thiết kế một hệ thống phân tán, chắc chắn sẽ gặp một vấn đề—**do sự tồn tại của partition tolerance (dung sai phân vùng), chúng ta buộc phải cân bằng giữa tính sẵn sàng (availability) và tính nhất quán dữ liệu (consistency)**. Đây là định lý `CAP` nổi tiếng.

Để hiểu đơn giản, hãy coi một lớp học là toàn bộ hệ thống, còn học sinh là các hệ thống con độc lập trong hệ thống. Lúc này trong lớp, Tiểu Hồng và Tiểu Minh bí mật yêu nhau bị "mõm lớn" Tiểu Hoa phát hiện, Tiểu Hoa vui mừng kể cho những người xung quanh nghe, rồi tin Tiểu Hồng Tiểu Minh đang yêu nhau lan truyền trong lớp. Trong quá trình tin tức đang lan truyền, bạn bắt một học sinh hỏi về tình huống, nếu họ trả lời không biết, thì có nghĩa là toàn bộ hệ thống lớp học xuất hiện vấn đề dữ liệu không nhất quán (vì Tiểu Hoa đã biết tin này rồi). Còn nếu họ không trả lời bạn, vì toàn bộ lớp đang có tin tức đang lan truyền (để đảm bảo tính nhất quán, cần mọi người đều biết mới có thể cung cấp dịch vụ), lúc này xuất hiện vấn đề về tính sẵn sàng của hệ thống.

![](https://oss.javaguide.cn/p3-juejin/38b9ff4b193e4487afe32c9710c6d644~tplv-k3u1fbpfcp-zoom-1-20230717160254318-20230717160259975.jpeg)

Trường hợp đầu tiên ở trên là cách xử lý của `Eureka`, nó đảm bảo AP (tính sẵn sàng), còn trường hợp sau là cách xử lý của `ZooKeeper` mà chúng ta sẽ nói đến hôm nay, nó đảm bảo CP (tính nhất quán dữ liệu).

## Giao thức và thuật toán nhất quán

Để giải quyết vấn đề nhất quán dữ liệu, qua quá trình khám phá không ngừng của các nhà khoa học và lập trình viên, đã xuất hiện nhiều giao thức và thuật toán nhất quán. Ví dụ 2PC (two-phase commit), 3PC (three-phase commit), thuật toán Paxos, v.v.

Lúc này hãy suy nghĩ một câu hỏi: nếu học sinh truyền tin bằng cách viết giấy nhắn, thì sẽ xuất hiện một vấn đề—làm sao tôi biết được tờ giấy của mình đã đến tay người tôi muốn gửi chưa? Nếu bị một đứa nào đó chiếm lấy và sửa đổi thì sao?

![](https://oss.javaguide.cn/p3-juejin/8c73e264d28b4a93878f4252e4e3e43c~tplv-k3u1fbpfcp-zoom-1.jpeg)

Lúc này xuất hiện một khái niệm—**vấn đề các tướng Byzantine**. Nó có nghĩa là **việc đạt được sự nhất quán thông qua truyền tin nhắn trên kênh truyền thông không đáng tin cậy là không thể**, vì vậy **điều kiện tiên quyết bắt buộc** của mọi thuật toán nhất quán là kênh truyền tin an toàn và đáng tin cậy.

Tại sao phải giải quyết vấn đề nhất quán dữ liệu? Hãy nghĩ xem, nếu một hệ thống flash sale được tách thành dịch vụ đặt hàng và dịch vụ thêm điểm thưởng, hai dịch vụ này triển khai trên các máy khác nhau, nếu trong quá trình truyền tin hệ thống điểm thưởng bị sập, không thể để đặt hàng xong mà không cộng điểm thưởng được. Bạn phải đảm bảo dữ liệu ở cả hai phía phải nhất quán.

### 2PC (Hai giai đoạn commit)

Two-phase commit là một giao thức đảm bảo tính nhất quán dữ liệu trong hệ thống phân tán, hiện nhiều cơ sở dữ liệu sử dụng giao thức two-phase commit để xử lý **transaction phân tán**.

Trước khi giới thiệu 2PC, hãy cùng nghĩ xem transaction phân tán thực sự có vấn đề gì?

Vẫn lấy ví dụ về hai hệ thống đặt hàng và thêm điểm thưởng trong hệ thống flash sale, sau khi đặt hàng xong chúng ta gửi tin nhắn cho hệ thống điểm thưởng nói rằng giờ thêm điểm. Nếu chúng ta chỉ gửi tin nhắn mà không nhận phản hồi, thì hệ thống đặt hàng làm sao biết được tình trạng hệ thống điểm thưởng nhận tin? Nếu chúng ta thêm quá trình nhận phản hồi, thì khi hệ thống điểm thưởng nhận tin và trả về `Response` cho hệ thống đặt hàng, nhưng giữa chừng mạng bị trục trặc, tin phản hồi không gửi được, hệ thống đặt hàng có nghĩ rằng hệ thống điểm thưởng nhận tin thất bại không? Nó có rollback transaction không? Nhưng lúc này hệ thống điểm thưởng đã nhận tin thành công, nó sẽ xử lý tin và thêm điểm cho người dùng, lúc này sẽ xảy ra tình trạng điểm đã được thêm nhưng đơn hàng không được đặt thành công.

Vì vậy điều chúng ta cần giải quyết là trong hệ thống phân tán, trong toàn bộ chuỗi gọi, tất cả dữ liệu của các dịch vụ hoặc đều thành công hoặc đều thất bại, tức là **vấn đề nguyên tử của tất cả các dịch vụ**.

Trong two-phase commit, chủ yếu có hai vai trò: coordinator (điều phối viên) và participant (bên tham gia).

Giai đoạn đầu tiên: Khi cần thực thi một transaction phân tán, người khởi tạo transaction trước tiên gửi yêu cầu transaction đến coordinator, sau đó coordinator sẽ gửi yêu cầu `prepare` (bao gồm nội dung transaction) cho tất cả các participant, nói với participant rằng bạn cần thực thi transaction rồi, nếu có thể thực thi nội dung transaction tôi gửi thì hãy thực thi nhưng không commit, sau khi thực thi xin phản hồi cho tôi. Sau đó participant nhận tin `prepare`, họ bắt đầu thực thi transaction (không commit), ghi thông tin `Undo` và `Redo` vào log transaction, sau đó participant phản hồi coordinator về việc đã sẵn sàng chưa.

Giai đoạn thứ hai: Giai đoạn này coordinator dựa trên phản hồi của các participant để quyết định tiếp theo có thể commit hay rollback transaction.

Ví dụ lúc này **tất cả participant** đều trả về sẵn sàng, lúc này sẽ commit transaction, coordinator gửi **yêu cầu `Commit`** cho tất cả participant, khi participant nhận yêu cầu `Commit` sẽ thực hiện **thao tác commit** transaction đã thực thi trước đó, sau khi commit xong sẽ gửi phản hồi commit thành công cho coordinator.

Còn nếu trong giai đoạn đầu không phải tất cả participant đều trả về sẵn sàng, thì lúc này coordinator sẽ gửi **yêu cầu rollback transaction `rollback`** cho tất cả participant, participant nhận được sẽ **rollback tất cả xử lý transaction trong giai đoạn đầu**, sau đó trả kết quả xử lý cho coordinator, cuối cùng coordinator nhận phản hồi và trả kết quả xử lý thất bại cho người khởi tạo transaction.

![Luồng 2PC](https://oss.javaguide.cn/p3-juejin/1a7210167f1d4d4fb97afcec19902a59~tplv-k3u1fbpfcp-zoom-1.jpeg)

Cá nhân tôi cảm thấy 2PC được triển khai khá hạn chế, vì thực tế nó chỉ giải quyết vấn đề nguyên tử của các transaction, đồng thời cũng mang lại nhiều vấn đề khác.

![](https://oss.javaguide.cn/p3-juejin/cc534022c7184770b9b82b2d0008432a~tplv-k3u1fbpfcp-zoom-1.jpeg)

- **Vấn đề điểm lỗi đơn**, nếu coordinator bị hỏng thì toàn bộ hệ thống sẽ không thể sử dụng.
- **Vấn đề blocking**, tức là khi coordinator gửi yêu cầu `prepare`, participant nhận được và có thể xử lý thì sẽ thực thi transaction nhưng không commit, lúc này sẽ tiếp tục chiếm dụng tài nguyên mà không giải phóng, nếu lúc này coordinator bị sập, thì các tài nguyên này sẽ không được giải phóng nữa, điều này sẽ ảnh hưởng nghiêm trọng đến hiệu năng.
- **Vấn đề dữ liệu không nhất quán**, ví dụ khi giai đoạn hai, coordinator chỉ gửi được một phần yêu cầu `commit` rồi bị sập, điều đó có nghĩa là, các participant nhận được tin sẽ commit transaction, còn những bên không nhận được sẽ không commit transaction, lúc này sẽ xảy ra vấn đề không nhất quán dữ liệu.

### 3PC (Ba giai đoạn commit)

Vì 2PC có hàng loạt vấn đề như điểm lỗi đơn, cơ chế xử lý lỗi không hoàn thiện, v.v., dẫn đến sự ra đời của **3PC (three-phase commit)**. Vậy ba giai đoạn là gì?

> Đừng nhầm PC với máy tính cá nhân, thực ra chúng là viết tắt của phase-commit, tức giai đoạn commit.

1. **Giai đoạn CanCommit**: Coordinator gửi yêu cầu `CanCommit` cho tất cả participant, participant nhận yêu cầu sẽ kiểm tra tình trạng bản thân để xem có thể thực thi transaction không, nếu có thể thì trả về phản hồi YES và vào trạng thái chuẩn bị, ngược lại trả về NO.
2. **Giai đoạn PreCommit**: Coordinator dựa vào phản hồi của các participant để quyết định có thực hiện thao tác `PreCommit` tiếp theo không. Nếu tất cả participant đều trả về YES, coordinator sẽ gửi yêu cầu `PreCommit` pre-commit cho tất cả participant, **participant nhận yêu cầu pre-commit, sẽ thực thi transaction và ghi thông tin `Undo` và `Redo` vào log transaction**, cuối cùng nếu participant thực thi transaction thành công sẽ trả về phản hồi thành công cho coordinator. Nếu trong giai đoạn đầu coordinator nhận được **bất kỳ thông tin NO nào**, hoặc **trong khoảng thời gian nhất định** không nhận được phản hồi từ tất cả participant, thì sẽ hủy transaction, gửi yêu cầu hủy (abort) cho tất cả participant, participant nhận yêu cầu hủy sẽ hủy transaction ngay, hoặc trong khoảng thời gian nhất định không nhận được yêu cầu từ coordinator cũng sẽ hủy transaction.
3. **Giai đoạn DoCommit**: Giai đoạn này thực ra khá giống giai đoạn hai của `2PC`, nếu coordinator nhận được phản hồi YES từ tất cả participant trong giai đoạn `PreCommit`, thì coordinator sẽ gửi yêu cầu `DoCommit` cho tất cả participant, **participant nhận yêu cầu `DoCommit` sẽ thực hiện thao tác commit transaction**, sau khi hoàn thành sẽ phản hồi coordinator, coordinator nhận phản hồi commit thành công từ tất cả participant thì hoàn thành transaction. Nếu coordinator trong giai đoạn `PreCommit` **nhận được bất kỳ NO nào hoặc trong khoảng thời gian nhất định không nhận được phản hồi từ tất cả participant**, thì sẽ gửi yêu cầu hủy, participant nhận yêu cầu hủy sẽ **rollback transaction thông qua log rollback đã ghi trước đó**, và phản hồi tình trạng rollback cho coordinator, coordinator nhận phản hồi từ participant và hủy transaction.

![Luồng 3PC](https://oss.javaguide.cn/p3-juejin/80854635d48c42d896dbaa066abf5c26~tplv-k3u1fbpfcp-zoom-1.jpeg)

> Đây là sơ đồ luồng của `3PC` trong môi trường thành công, bạn có thể thấy `3PC` xử lý timeout interrupt ở nhiều nơi, ví dụ coordinator trong thời gian quy định không nhận đủ tất cả xác nhận thì tiến hành hủy transaction, điều này có thể **giảm thời gian blocking đồng bộ**. Cũng cần lưu ý rằng, **trong giai đoạn `DoCommit` của `3PC`, nếu participant không nhận được yêu cầu commit transaction từ coordinator, nó sẽ commit transaction sau một khoảng thời gian**. Tại sao làm vậy? Vì lúc này chắc chắn **đã đảm bảo tất cả coordinator trong giai đoạn đầu đều trả về phản hồi có thể thực thi transaction**, lúc này chúng ta có lý do để **tin rằng các hệ thống khác đều có thể thực thi và commit transaction**, vì vậy **dù** coordinator có gửi tin cho participant hay không, khi vào giai đoạn ba participant đều sẽ commit transaction.

Tóm lại, `3PC` đã giảm nhẹ tốt vấn đề blocking thông qua nhiều cơ chế timeout, nhưng vấn đề quan trọng nhất là tính nhất quán vẫn chưa được giải quyết triệt để, ví dụ trong giai đoạn `DoCommit`, khi một participant nhận được yêu cầu thì các participant và coordinator khác bị sập hoặc xảy ra phân vùng mạng, lúc này participant nhận được tin sẽ commit transaction, sẽ xuất hiện vấn đề không nhất quán dữ liệu.

Vì vậy, để giải quyết vấn đề nhất quán vẫn cần dựa vào thuật toán `Paxos` ⭐️ ⭐️ ⭐️.

### Thuật toán `Paxos`

Thuật toán `Paxos` là một **thuật toán nhất quán có tính chịu lỗi cao dựa trên truyền tin nhắn**, là một trong những thuật toán hiệu quả nhất được công nhận hiện nay để giải quyết vấn đề nhất quán phân tán, **vấn đề mà nó giải quyết là làm thế nào để đạt được sự nhất quán về một giá trị (quyết định) trong hệ thống phân tán**.

Trong `Paxos` có ba vai trò chính: `Proposer người đề xuất`, `Acceptor người biểu quyết`, `Learner người học`. Thuật toán `Paxos` cũng như `2PC`, có hai giai đoạn: `Prepare` và `accept`.

#### Giai đoạn prepare

- `Proposer người đề xuất`: Chịu trách nhiệm đề xuất `proposal`, mỗi người đề xuất khi đưa ra đề xuất trước tiên sẽ lấy **số đề xuất N có tính duy nhất toàn cục và tăng dần**, tức là số N duy nhất trong toàn bộ cluster, sau đó gán số đó cho đề xuất của mình, trong **giai đoạn đầu chỉ gửi số đề xuất cho tất cả người biểu quyết**.
- `Acceptor người biểu quyết`: Mỗi người biểu quyết sau khi `accept` một đề xuất, sẽ ghi số đề xuất N vào local, vì vậy trong số các đề xuất đã được accept lưu trữ ở mỗi người biểu quyết sẽ có **đề xuất có số lớn nhất**, số đó giả sử là `maxN`. Mỗi người biểu quyết chỉ `accept` các đề xuất có số lớn hơn `maxN` của local, khi phê chuẩn đề xuất, người biểu quyết sẽ gửi đề xuất có số lớn nhất đã từng được accept trước đó làm phản hồi cho `Proposer`.

> Dưới đây là sơ đồ luồng của giai đoạn `prepare`, bạn có thể tham khảo.

![Paxos giai đoạn một](https://oss.javaguide.cn/p3-juejin/cd1e5f78875b4ad6b54013738f570943~tplv-k3u1fbpfcp-zoom-1.jpeg)

#### Giai đoạn accept

Sau khi `Proposer` đề xuất một đề xuất, nếu `Proposer` nhận được phê chuẩn từ hơn một nửa số `Acceptor` (bao gồm `Proposer` đồng ý), lúc này `Proposer` sẽ gửi đề xuất thực sự cho tất cả `Acceptor` (bạn có thể hiểu giai đoạn đầu là thăm dò), lúc này `Proposer` sẽ gửi nội dung và số đề xuất.

Sau khi người biểu quyết nhận được yêu cầu đề xuất, sẽ so sánh lại số đề xuất lớn nhất đã phê chuẩn với số đề xuất này, nếu số đề xuất này **lớn hơn hoặc bằng** số đề xuất lớn nhất đã phê chuẩn, thì `accept` đề xuất đó (lúc này thực thi nội dung đề xuất nhưng không commit), sau đó trả tình trạng cho `Proposer`. Nếu không thỏa mãn thì không phản hồi hoặc trả về NO.

![Paxos giai đoạn hai 1](https://oss.javaguide.cn/p3-juejin/dad7f51d58b24a72b249278502ec04bd~tplv-k3u1fbpfcp-zoom-1.jpeg)

Khi `Proposer` nhận được hơn một nửa `accept`, lúc này nó sẽ gửi yêu cầu commit đề xuất cho tất cả `acceptor`. Cần lưu ý rằng, vì ở trên chỉ có hơn một nửa `acceptor` phê chuẩn và thực thi nội dung đề xuất, những bên khác không phê chuẩn chưa thực thi nội dung đề xuất, vì vậy lúc này cần **gửi nội dung và số đề xuất cho các `acceptor` chưa phê chuẩn và yêu cầu họ vô điều kiện thực thi và commit**, còn đối với các `acceptor` đã phê chuẩn đề xuất trước đó thì **chỉ cần gửi số đề xuất** và yêu cầu `acceptor` thực hiện commit là được.

![Paxos giai đoạn hai 2](https://oss.javaguide.cn/p3-juejin/9359bbabb511472e8de04d0826967996~tplv-k3u1fbpfcp-zoom-1.jpeg)

Còn nếu `Proposer` không nhận được hơn một nửa `accept` thì nó sẽ **tăng dần** số `Proposal` đó, sau đó **quay lại giai đoạn `Prepare`**.

> Đối với `Learner` học nội dung đề xuất được `Acceptor` phê chuẩn như thế nào, có nhiều cách, bạn đọc có thể tự tìm hiểu thêm, ở đây không giải thích quá nhiều.

#### Vấn đề vòng lặp vô tận của thuật toán Paxos

Thực ra cũng giống như hai người tranh cãi, Tiểu Minh nói tôi đúng, Tiểu Hồng nói tôi mới đúng, hai người không ai chịu ai.

Ví dụ, lúc này người đề xuất P1 đề xuất phương án M1, hoàn thành giai đoạn `Prepare`, lúc này `acceptor` phê chuẩn M1, nhưng lúc này người đề xuất P2 cũng đề xuất phương án M2, nó cũng hoàn thành giai đoạn `Prepare`. Sau đó phương án M1 của P1 không thể được phê chuẩn trong giai đoạn hai nữa (vì `acceptor` đã phê chuẩn M2 lớn hơn M1), vì vậy P1 tăng phương án lên M3 và quay lại giai đoạn `Prepare`, sau đó `acceptor` lại phê chuẩn phương án M3 mới, nó lại không thể phê chuẩn M2 nữa, lúc này M2 lại tăng và vào giai đoạn `Prepare`...

Cứ thế đề xuất vô tận không dừng, đây là vấn đề vòng lặp vô tận của thuật toán `paxos`.

![](https://oss.javaguide.cn/p3-juejin/bc3d45941abf4fca903f7f4b69405abf~tplv-k3u1fbpfcp-zoom-1.jpeg)

Vậy giải quyết như thế nào? Đơn giản thôi, người đông dễ tranh cãi, bây giờ **chỉ cho phép một người được đề xuất** là xong.

## Giới thiệu ZAB

### Kiến trúc Zookeeper

Là một framework điều phối phân tán xuất sắc, hiệu quả và đáng tin cậy, `ZooKeeper` khi giải quyết vấn đề nhất quán dữ liệu phân tán không sử dụng trực tiếp `Paxos`, mà thiết kế riêng một giao thức nhất quán gọi là `ZAB(ZooKeeper Atomic Broadcast)` giao thức phát sóng nguyên tử, giao thức này có thể hỗ trợ tốt **khôi phục sau sự cố**.

![Kiến trúc Zookeeper](https://oss.javaguide.cn/p3-juejin/07bf6c1e10f84fc58a2453766ca6bd18~tplv-k3u1fbpfcp-zoom-1.png)

### Ba vai trò trong ZAB

Cũng như khi giới thiệu `Paxos`, trước khi giới thiệu giao thức `ZAB`, hãy cùng tìm hiểu ba vai trò chính trong `ZAB`: `Leader lãnh đạo`, `Follower người theo dõi`, `Observer người quan sát`.

- `Leader`: **Bộ xử lý yêu cầu ghi duy nhất** trong cluster, có thể khởi xướng bỏ phiếu (bỏ phiếu cũng để thực hiện yêu cầu ghi).
- `Follower`: Có thể nhận yêu cầu từ client, nếu là yêu cầu đọc thì có thể tự xử lý, **nếu là yêu cầu ghi thì phải chuyển tiếp cho `Leader`**. Trong quá trình bầu chọn sẽ tham gia bỏ phiếu, **có quyền bầu chọn và được bầu chọn**.
- `Observer`: Là `Follower` không có quyền bầu chọn và không được bầu chọn.

Trong giao thức `ZAB` còn định nghĩa hai chế độ cho `zkServer` (tức tổng gọi của ba vai trò trên): **phát sóng tin nhắn** và **khôi phục sau sự cố**.

### Chế độ phát sóng tin nhắn

Nói thẳng ra là giao thức `ZAB` xử lý yêu cầu ghi như thế nào, ở trên chúng ta không nói chỉ có `Leader` mới có thể xử lý yêu cầu ghi sao? Vậy `Follower` và `Observer` của chúng ta có cần **đồng bộ cập nhật dữ liệu** không? Không thể để dữ liệu chỉ cập nhật ở `Leader`, còn các vai trò khác đều không được cập nhật chứ?

Không phải là **duy trì tính nhất quán dữ liệu trong toàn bộ cluster** sao? Nếu là bạn, bạn sẽ làm như thế nào?

Rõ ràng, bước đầu tiên `Leader` cần **phát sóng** yêu cầu ghi ra, cho `Leader` hỏi `Followers` có đồng ý cập nhật không, nếu hơn một nửa đồng ý thì tiến hành cập nhật `Follower` và `Observer` (giống `Paxos`). Tất nhiên nói vậy hơi trừu tượng, vẽ sơ đồ để hiểu.

![Phát sóng tin nhắn](https://oss.javaguide.cn/p3-juejin/b64c7f25a5d24766889da14260005e31~tplv-k3u1fbpfcp-zoom-1.jpeg)

Ừm... Trông có vẻ đơn giản, dường như đã hiểu rồi. Hai `Queue` đó từ đâu ra? Câu trả lời là **`ZAB` cần đảm bảo `Follower` và `Observer` duy trì tính thứ tự**. Tính thứ tự là gì, ví dụ bây giờ có yêu cầu ghi A, lúc này `Leader` phát sóng yêu cầu A ra, vì chỉ cần hơn một nửa đồng ý, nên có thể lúc này một `Follower` F1 vì lý do mạng không nhận được, còn `Leader` lại phát sóng thêm yêu cầu B, vì lý do mạng, F1 lại nhận được yêu cầu B trước rồi mới nhận yêu cầu A, lúc này thứ tự xử lý yêu cầu khác nhau sẽ dẫn đến dữ liệu khác nhau, từ đó **gây ra vấn đề không nhất quán dữ liệu**.

Vì vậy ở phía `Leader`, nó chuẩn bị một **hàng đợi** cho mỗi `zkServer` khác, sử dụng phương thức FIFO để gửi tin nhắn. Vì giao thức sử dụng **`TCP`** để truyền thông mạng, đảm bảo tính thứ tự gửi tin, tính thứ tự nhận tin cũng được đảm bảo.

Ngoài ra, trong `ZAB` còn định nghĩa **ID transaction toàn cục tăng đơn điệu `ZXID`**, nó là kiểu long 64 bit, trong đó 32 bit cao đại diện cho `epoch` (thế kỷ), 32 bit thấp đại diện cho ID transaction. `epoch` sẽ thay đổi khi `Leader` thay đổi, khi một `Leader` bị sập và `Leader` mới lên ngôi, thế kỷ (`epoch`) sẽ thay đổi. Còn 32 bit thấp có thể hiểu đơn giản là ID transaction tăng dần.

Lý do định nghĩa điều này cũng là để đảm bảo tính thứ tự, mỗi `proposal` được tạo ra ở `Leader` cần **sắp xếp theo `ZXID`** mới được xử lý.

### Chế độ khôi phục sau sự cố

Nói đến khôi phục sau sự cố, trước tiên phải đề cập đến thuật toán bầu chọn `Leader` trong `ZAB`, khi hệ thống gặp sự cố, ảnh hưởng lớn nhất nên là sự cố của `Leader`, vì chúng ta chỉ có một `Leader`, nên khi `Leader` gặp sự cố chúng ta chắc chắn phải bầu chọn lại `Leader`.

Bầu chọn `Leader` có thể chia thành hai giai đoạn khác nhau: giai đoạn đầu là bầu chọn lại khi `Leader` bị sập, giai đoạn hai là bầu chọn khởi tạo `Leader` khi `Zookeeper` khởi động. Dưới đây tôi sẽ giới thiệu cách `ZAB` tiến hành bầu chọn khởi tạo.

Giả sử cluster của chúng ta có 3 máy, điều đó có nghĩa là cần hơn hai máy đồng ý (hơn một nửa). Ví dụ lúc này chúng ta khởi động `server1`, nó sẽ **bỏ phiếu cho chính mình** trước, nội dung bỏ phiếu là `myid` và `ZXID` của máy chủ, vì khởi tạo nên `ZXID` đều là 0, lúc này phiếu của `server1` là (1,0). Nhưng lúc này phiếu của `server1` chỉ là 1, nên không thể làm `Leader`, lúc này toàn bộ cluster vẫn trong giai đoạn bầu chọn nên đang trong **trạng thái `Looking`**.

Tiếp theo `server2` khởi động, nó cũng sẽ bỏ phiếu cho chính mình trước (2,0) và phát sóng thông tin phiếu (cả `server1` cũng làm vậy, nhưng khi đó không có máy chủ khác), `server1` nhận được thông tin phiếu của `server2` sẽ so sánh thông tin phiếu với của mình. **Trước tiên sẽ so sánh `ZXID`, `ZXID` lớn hơn được ưu tiên làm `Leader`, nếu giống nhau thì so sánh `myid`, `myid` lớn hơn được ưu tiên làm `Leader`**. Vì vậy lúc này `server1` thấy `server2` phù hợp làm `Leader` hơn, nó sẽ thay đổi thông tin phiếu của mình thành (2,0) rồi phát sóng ra, sau đó `server2` nhận được thấy giống với của mình không cần thay đổi, và **phiếu của mình đã vượt quá một nửa**, thì **xác định `server2` là `Leader`**, `server1` cũng sẽ đặt máy chủ của mình thành `Following` và trở thành `Follower`. Toàn bộ máy chủ chuyển từ trạng thái `Looking` sang trạng thái bình thường.

Khi `server3` khởi động và phát hiện cluster không ở trạng thái `Looking`, nó sẽ trực tiếp gia nhập cluster với tư cách `Follower`.

Vẫn ví dụ ba `server` trên, nếu trong quá trình toàn bộ cluster hoạt động mà `server2` bị sập, thì toàn bộ cluster sẽ bầu chọn lại `Leader` như thế nào? Thực ra cũng tương tự bầu chọn khởi tạo.

Trước tiên chắc chắn là hai `Follower` còn lại sẽ **chuyển trạng thái từ `Following` sang trạng thái `Looking`**, sau đó mỗi `server` sẽ bỏ phiếu cho chính mình như khi khởi tạo (tất nhiên ở đây `zxid` có thể không phải 0 nữa, để thuận tiện lấy một số ngẫu nhiên).

Giả sử `server1` bỏ phiếu cho mình là (1,99), sau đó phát sóng cho các `server` khác, `server3` cũng bỏ phiếu cho mình (3,95) trước, sau đó cũng phát sóng cho các `server` khác. `server1` và `server3` lúc này sẽ nhận được thông tin phiếu của nhau, cũng như bầu chọn ban đầu, họ sẽ so sánh phiếu của mình với phiếu nhận được (`zxid` lớn hơn được ưu tiên, nếu giống nhau thì `myid` lớn hơn được ưu tiên). Lúc này `server1` nhận phiếu của `server3` thấy không tốt bằng của mình nên không thay đổi, `server3` nhận kết quả phiếu của `server1` thấy tốt hơn của mình nên thay đổi phiếu thành (1,99) rồi phát sóng, cuối cùng `server1` nhận được thấy phiếu của mình đã vượt quá một nửa thì đặt mình là `Leader`, `server3` cũng trở thành `Follower`.

> Lưu ý rằng `ZooKeeper` tại sao phải đặt số nút lẻ? Ví dụ ở đây chúng ta có ba, bị sập một vẫn có thể làm việc bình thường, bị sập hai thì không thể làm việc bình thường (đã không đủ nút vượt quá một nửa nữa, nên không thể tiến hành các thao tác như bỏ phiếu). Còn giả sử bây giờ chúng ta có bốn, bị sập một cũng có thể làm việc, **nhưng bị sập hai cũng không thể làm việc bình thường**, điều này giống với ba cái, còn ba cái ít hơn bốn cái một cái, mang lại hiệu quả tương đương, vì vậy `Zookeeper` khuyến nghị số `server` lẻ.

Vậy sau khi nói về cách bầu chọn `Leader` trong `ZAB`, hãy tìm hiểu **khôi phục sau sự cố** là gì?

Thực ra chủ yếu là **khi có máy trong cluster bị sập, toàn bộ cluster đảm bảo tính nhất quán dữ liệu như thế nào?**

Nếu chỉ là `Follower` bị sập, và số bị sập không vượt quá một nửa, vì chúng ta đã nói ở đầu `Leader` sẽ duy trì hàng đợi, nên không cần lo về việc không nhận được dữ liệu tiếp theo dẫn đến dữ liệu không nhất quán.

Nếu `Leader` bị sập thì phức tạp hơn, chắc chắn phải tạm dừng dịch vụ, chuyển sang trạng thái `Looking` rồi bầu chọn lại `Leader` (đã nói ở trên), nhưng điều này chia thành hai tình huống: **đảm bảo các đề xuất đã được Leader commit có thể được tất cả Follower commit** và **bỏ qua các đề xuất đã bị loại bỏ**.

Đảm bảo các đề xuất đã được Leader commit có thể được tất cả Follower commit nghĩa là gì?

Giả sử `Leader (server2)` gửi yêu cầu `commit` (quên rồi hãy xem lại chế độ phát sóng tin nhắn ở trên), nó gửi cho `server3`, rồi khi chuẩn bị gửi cho `server1` thì đột nhiên bị sập. Lúc này khi bầu chọn lại nếu chúng ta chọn `server1` làm `Leader`, thì chắc chắn sẽ có vấn đề không nhất quán dữ liệu, vì `server3` chắc chắn sẽ commit đề xuất yêu cầu `commit` mà `server2` đã gửi, còn `server1` không nhận được nên sẽ loại bỏ.

![Khôi phục sau sự cố](https://oss.javaguide.cn/p3-juejin/4b8365e80bdf441ea237847fb91236b7~tplv-k3u1fbpfcp-zoom-1.jpeg)

Vậy giải quyết như thế nào?

Các bạn thông minh chắc chắn sẽ thắc mắc, **lúc này `server1` đã không thể trở thành `Leader` nữa, vì khi `server1` và `server3` bỏ phiếu bầu chọn sẽ so sánh `ZXID`, lúc này `ZXID` của `server3` chắc chắn lớn hơn `server1` rồi**. (Không hiểu có thể xem lại thuật toán bầu chọn ở trên)

Vậy bỏ qua các đề xuất đã bị loại bỏ nghĩa là gì?

Giả sử `Leader (server2)` lúc này đã đồng ý đề xuất N1, tự commit transaction này và chuẩn bị gửi yêu cầu `commit` cho tất cả `Follower`, nhưng lúc đó lại bị sập, lúc này chắc chắn phải bầu chọn lại `Leader`, ví dụ lúc này chọn `server1` làm `Leader` (điều này không quan trọng). Nhưng một lúc sau, **`Leader` bị sập đó lại khôi phục lại**, lúc này nó chắc chắn sẽ gia nhập cluster với tư cách `Follower`, cần lưu ý là vừa rồi `server2` đã đồng ý commit đề xuất N1, nhưng các `server` khác không nhận được thông tin `commit` của nó, nên các `server` khác không thể commit đề xuất N1 nữa, điều này sẽ gây ra vấn đề không nhất quán dữ liệu, vì vậy **đề xuất N1 đó cuối cùng cần phải bị loại bỏ**.

![Khôi phục sau sự cố](https://oss.javaguide.cn/p3-juejin/99cdca39ad6340ae8b77e8befe94e36e~tplv-k3u1fbpfcp-zoom-1.jpeg)

## Một số kiến thức lý thuyết về Zookeeper

Hiểu giao thức `ZAB` vẫn chưa đủ, nó chỉ là một cách triển khai nội bộ của `Zookeeper`, còn chúng ta làm thế nào để sử dụng `Zookeeper` để thực hiện một số tình huống ứng dụng điển hình? Ví dụ quản lý cluster, khóa phân tán, bầu chọn `Master`, v.v.

Điều này liên quan đến cách sử dụng `Zookeeper`, nhưng trước khi sử dụng, chúng ta cần nắm thêm một số khái niệm. Ví dụ **mô hình dữ liệu**, **cơ chế phiên**, **ACL**, **cơ chế Watcher**, v.v. của `Zookeeper`.

### Mô hình dữ liệu

Cấu trúc lưu trữ dữ liệu của `zookeeper` rất giống với hệ thống file `Unix` tiêu chuẩn, đều là treo nhiều nút con dưới nút gốc (dạng cây). Nhưng `zookeeper` không có khái niệm thư mục và file trong hệ thống file, mà **sử dụng `znode` làm nút dữ liệu**. `znode` là đơn vị dữ liệu nhỏ nhất trong `zookeeper`, mỗi `znode` có thể lưu trữ dữ liệu, đồng thời cũng có thể treo nút con, tạo thành không gian tên dạng cây.

![Mô hình dữ liệu zk](https://oss.javaguide.cn/p3-juejin/663240470d524dd4ac6e68bde0b666eb~tplv-k3u1fbpfcp-zoom-1.jpeg)

Mỗi `znode` có **loại nút** và **trạng thái nút** riêng của mình.

Trong đó loại nút có thể chia thành **nút bền vững**, **nút bền vững có thứ tự**, **nút tạm thời** và **nút tạm thời có thứ tự**.

- Nút bền vững: Một khi tạo sẽ tồn tại mãi cho đến khi bị xóa.
- Nút bền vững có thứ tự: Một nút cha có thể **duy trì thứ tự tạo** cho các nút con của nó, thứ tự này thể hiện trong **tên nút**, là chuỗi số 10 chữ số tự động thêm vào sau tên nút, bắt đầu đếm từ 0.
- Nút tạm thời: Vòng đời của nút tạm thời được liên kết với **phiên client**, **phiên biến mất thì nút biến mất**. Nút tạm thời **chỉ có thể là nút lá**, không thể tạo nút con.
- Nút tạm thời có thứ tự: Nút cha có thể tạo một nút tạm thời duy trì thứ tự (giống nút bền vững có thứ tự trước đó).

Trạng thái nút chứa nhiều thuộc tính của nút như `czxid`, `mzxid`, v.v., trong `zookeeper` sử dụng class `Stat` để duy trì. Dưới đây tôi liệt kê một số thuộc tính và giải thích.

- `czxid`: `Created ZXID`, ID transaction khi nút dữ liệu này **được tạo**.
- `mzxid`: `Modified ZXID`, ID transaction **khi nút được cập nhật lần cuối**.
- `ctime`: `Created Time`, thời gian nút này được tạo.
- `mtime`: `Modified Time`, thời gian nút này được sửa đổi lần cuối.
- `version`: Số phiên bản của nút.
- `cversion`: Số phiên bản của **nút con**.
- `aversion`: Số phiên bản `ACL` của nút.
- `ephemeralOwner`: `sessionID` của phiên tạo nút này, nếu nút là nút bền vững, giá trị này là 0.
- `dataLength`: Độ dài nội dung dữ liệu của nút.
- `numChildre`: Số nút con của nút này, nếu là nút tạm thời thì là 0.
- `pzxid`: ID transaction khi danh sách nút con của nút này được sửa đổi lần cuối, lưu ý là **danh sách** nút con, không phải nội dung.

### Phiên (Session)

Tôi nghĩ điều này với các bạn phát triển backend chắc không xa lạ, không phải là `session` sao? Chỉ là client và server `zk` duy trì cơ chế phiên thông qua **kết nối dài `TCP`**, thực ra về phiên bạn có thể hiểu là **duy trì trạng thái kết nối**.

Trong `zookeeper`, phiên còn có các sự kiện tương ứng, ví dụ `CONNECTION_LOSS sự kiện mất kết nối`, `SESSION_MOVED sự kiện di chuyển phiên`, `SESSION_EXPIRED sự kiện hết hạn phiên`.

### ACL

`ACL` là `Access Control Lists`, đây là một phương thức kiểm soát quyền truy cập. Trong `zookeeper` định nghĩa 5 loại quyền, chúng lần lượt là:

- `CREATE`: Quyền tạo nút con.
- `READ`: Quyền lấy dữ liệu nút và danh sách nút con.
- `WRITE`: Quyền cập nhật dữ liệu nút.
- `DELETE`: Quyền xóa nút con.
- `ADMIN`: Quyền đặt ACL của nút.

### Cơ chế Watcher

`Watcher` là bộ lắng nghe sự kiện, là một tính năng rất quan trọng của `zk`, nhiều chức năng phụ thuộc vào nó, nó hơi giống phương thức đăng ký, tức client **đăng ký** `watcher` chỉ định với server, khi server đáp ứng một số sự kiện hoặc yêu cầu của `watcher` sẽ **gửi thông báo sự kiện cho client**, client nhận thông báo sẽ tìm `Watcher` mình đã định nghĩa rồi **thực thi phương thức callback tương ứng**.

![Cơ chế watcher](https://oss.javaguide.cn/p3-juejin/ac87b7cff7b44c63997ff0f6a7b6d2eb~tplv-k3u1fbpfcp-zoom-1.jpeg)

## Một số tình huống ứng dụng điển hình của Zookeeper

Sau khi nói nhiều lý thuyết như vậy, có thể bạn đang mơ hồ, những thứ này có ích gì? Có thể làm được gì? Đừng vội, để tôi từ từ kể cho bạn nghe.

![](https://oss.javaguide.cn/p3-juejin/dbc1a52b0c304bb093ef08fb1d4c704c~tplv-k3u1fbpfcp-zoom-1.jpeg)

### Bầu chọn Master

Còn nhớ nút tạm thời mà chúng ta đã nói ở trên không? Vì tính nhất quán mạnh của `Zookeeper`, có thể **đảm bảo tính duy nhất toàn cục khi tạo nút trong môi trường đồng thời cao** (tức không thể tạo các nút giống nhau).

Tận dụng tính năng này, chúng ta có thể **để nhiều client cùng tạo một nút chỉ định**, client tạo thành công chính là `master`.

Nhưng, nếu `master` này bị sập thì sao?

Hãy nghĩ xem tại sao chúng ta tạo nút tạm thời? Còn nhớ vòng đời của nút tạm thời không? `master` bị sập có nghĩa là phiên bị đứt không? Phiên đứt có nghĩa là nút này không còn không? Còn nhớ `watcher` không? Chúng ta có thể **để các nút không phải `master` theo dõi trạng thái nút**, ví dụ chúng ta theo dõi nút cha của nút tạm thời này, nếu số nút con thay đổi thì có nghĩa `master` bị sập, lúc này chúng ta **kích hoạt callback để bầu chọn lại**, hoặc chúng ta trực tiếp theo dõi trạng thái nút, chúng ta có thể thông qua việc nút có mất kết nối không để xác định `master` có bị sập không, v.v.

![Bầu chọn Master](https://oss.javaguide.cn/p3-juejin/00468757fb8f4f51875f645fbb7b25a2~tplv-k3u1fbpfcp-zoom-1.jpeg)

Tóm lại, chúng ta có thể hoàn toàn **tận dụng nút tạm thời, trạng thái nút và `watcher` để thực hiện chức năng bầu chọn Master**, nút tạm thời chủ yếu dùng để bầu chọn, trạng thái nút và `watcher` có thể dùng để xác định tình trạng hoạt động của `master` và bầu chọn lại.

### Phát hành/Đăng ký dữ liệu

Còn nhớ cơ chế `Watcher` của Zookeeper không? Zookeeper thông qua phương thức kết hợp push-pull để thực hiện tương tác giữa client và server: client đăng ký nút với server, một khi dữ liệu của nút tương ứng thay đổi, server sẽ gửi thông báo sự kiện `Watcher` đến client đang "theo dõi" nút đó, client nhận thông báo cần **chủ động** lấy dữ liệu mới nhất từ server. Dựa trên cách này, Zookeeper thực hiện chức năng **phát hành/đăng ký dữ liệu**.

Một tình huống ứng dụng điển hình là **quản lý tập trung thông tin cấu hình toàn cục**. Client khi khởi động sẽ chủ động lấy thông tin cấu hình từ server Zookeeper, đồng thời **đăng ký lắng nghe `Watcher`** trên nút chỉ định. Khi thông tin cấu hình thay đổi, server thông báo cho tất cả client đã đăng ký để lấy lại thông tin cấu hình, thực hiện cập nhật thời gian thực của thông tin cấu hình.

Thông tin cấu hình toàn cục được đề cập ở trên thường bao gồm thông tin danh sách máy, cấu hình chuyển đổi chạy, thông tin cấu hình cơ sở dữ liệu, v.v. Cần lưu ý rằng loại thông tin cấu hình toàn cục này thường có các đặc điểm sau:

- Lượng dữ liệu nhỏ
- Nội dung dữ liệu thay đổi động trong quá trình chạy
- Các máy trong cluster chia sẻ cấu hình nhất quán

### Cân bằng tải

Có thể thực hiện cân bằng tải thông qua **nút tạm thời** của Zookeeper. Hãy nhớ lại đặc điểm của nút tạm thời: khi kết nối giữa client tạo nút và server bị đứt, tức khi phiên client (session) biến mất, nút tương ứng cũng sẽ tự động biến mất. Do đó, chúng ta có thể sử dụng nút tạm thời để duy trì danh sách địa chỉ Server, từ đó đảm bảo yêu cầu không bị phân phối đến máy chủ đã dừng.

Cụ thể, chúng ta cần mỗi Server trong cluster sử dụng client Zookeeper để kết nối server Zookeeper, đồng thời sử dụng **thông tin địa chỉ của Server** để tạo nút tạm thời trong thư mục chỉ định trên server. Khi yêu cầu client gọi dịch vụ cluster, trước tiên lấy danh sách nút trong thư mục đó từ Zookeeper (tức tất cả Server có sẵn), sau đó theo các chiến lược cân bằng tải khác nhau chuyển tiếp yêu cầu đến một Server cụ thể.

### Khóa phân tán

Có nhiều cách thực hiện khóa phân tán, ví dụ `Redis`, cơ sở dữ liệu, `zookeeper`, v.v. Cá nhân tôi cho rằng `zookeeper` trong việc thực hiện khóa phân tán là rất rất đơn giản.

Ở trên chúng ta đã đề cập đến **zk đảm bảo tính duy nhất toàn cục khi tạo nút trong môi trường đồng thời cao**, nhìn vào điều này là biết có thể làm được gì rồi. Thực hiện mutex lock đấy thôi, vì có thể trong môi trường phân tán, nên có thể thực hiện khóa phân tán.

Thực hiện như thế nào? Thực ra điều này cũng cơ bản giống với bầu chọn Master, chúng ta cũng có thể tận dụng việc tạo nút tạm thời.

Trước tiên chắc chắn là làm thế nào để lấy khóa, vì tính duy nhất khi tạo nút, chúng ta có thể để nhiều client cùng tạo một nút tạm thời, **tạo thành công tức là đã lấy được khóa**. Sau đó các client không lấy được khóa cũng như các nút không phải master trong việc bầu chọn Master, tạo `watcher` để theo dõi trạng thái nút, nếu mutex lock này được giải phóng (có thể client lấy khóa bị sập, hoặc client đó chủ động giải phóng khóa), thì có thể gọi callback để lấy lại khóa.

> `zk` không cần quan tâm đến vấn đề khóa không được giải phóng như `redis`, vì khi client bị sập, nút cũng bị sập, khóa cũng được giải phóng. Có đơn giản không?

Vậy có thể sử dụng `zookeeper` để đồng thời thực hiện **khóa chia sẻ và khóa độc quyền** không? Câu trả lời là có thể, chỉ là hơi phức tạp một chút.

Còn nhớ **nút có thứ tự** không?

Lúc này tôi quy định tất cả các nút tạo phải có thứ tự, khi bạn là yêu cầu đọc (muốn lấy khóa chia sẻ), nếu **không có nút nào nhỏ hơn mình, hoặc các nút nhỏ hơn mình đều là yêu cầu đọc**, thì có thể lấy được khóa đọc, sau đó có thể bắt đầu đọc. **Nếu trong các nút nhỏ hơn mình có yêu cầu ghi**, thì client hiện tại không thể lấy được khóa đọc, chỉ có thể chờ các yêu cầu ghi trước đó hoàn thành.

Nếu bạn là yêu cầu ghi (lấy khóa độc quyền), nếu **không có nút nào nhỏ hơn mình**, thì client hiện tại có thể lấy được khóa ghi trực tiếp, tiến hành sửa đổi dữ liệu. Nếu phát hiện **có nút nhỏ hơn mình, dù là thao tác đọc hay ghi, client hiện tại đều không thể lấy được khóa ghi**, chờ tất cả thao tác trước đó hoàn thành.

Điều này thực hiện rất tốt cả khóa chia sẻ và khóa độc quyền đồng thời, tất nhiên vẫn còn chỗ để tối ưu, ví dụ khi một khóa được giải phóng sẽ thông báo tất cả client đang chờ gây ra **hiệu ứng bầy đàn**. Lúc này bạn có thể để nút đang chờ chỉ theo dõi nút trước nó.

Cụ thể làm thế nào? Thực ra cũng khá đơn giản, bạn có thể để **yêu cầu đọc theo dõi nút yêu cầu ghi cuối cùng nhỏ hơn mình, yêu cầu ghi chỉ theo dõi nút cuối cùng nhỏ hơn mình**, bạn đọc có hứng thú có thể tự nghiên cứu.

### Dịch vụ đặt tên

Làm thế nào để đặt ID cho một đối tượng, mọi người có thể nghĩ đến `UUID`, nhưng vấn đề lớn nhất của `UUID` là nó quá dài... (quá dài chưa chắc đã là điều tốt, hehe). Vậy trong điều kiện cho phép, chúng ta có thể sử dụng `zookeeper` để thực hiện không?

Chúng ta đã đề cập trước đó rằng `zookeeper` lưu trữ nút dữ liệu qua **cấu trúc cây**, điều đó có nghĩa là **đường dẫn đầy đủ** của mỗi nút chắc chắn là duy nhất, chúng ta có thể sử dụng đường dẫn đầy đủ của nút làm phương thức đặt tên. Và quan trọng hơn, đường dẫn do chúng ta tự định nghĩa, điều này cho phép chúng ta đặt ID có ngữ nghĩa cho một số đối tượng dễ hiểu hơn.

### Quản lý cluster và trung tâm đăng ký

Nhìn đến đây chắc bạn cảm thấy `zookeeper` thật sự quá mạnh mẽ, nó sao có thể làm được nhiều vậy!

Đừng vội, nó còn có thể làm được nhiều thứ khác. Có thể chúng ta sẽ có nhu cầu như thế này, chúng ta cần biết có bao nhiêu máy đang hoạt động trong toàn bộ cluster, chúng ta muốn thu thập dữ liệu trạng thái chạy của từng máy trong cluster, thực hiện thao tác bật/tắt máy trong cluster, v.v.

Còn `zookeeper` hỗ trợ tự nhiên `watcher` và nút tạm thời có thể thực hiện tốt những nhu cầu này. Chúng ta có thể tạo nút tạm thời cho mỗi máy và theo dõi nút cha của nó, nếu danh sách nút con có thay đổi (chúng ta có thể đã tạo xóa nút tạm thời), thì chúng ta có thể sử dụng `watcher` ràng buộc trên nút cha của nó để theo dõi trạng thái và callback.

![Quản lý cluster](https://oss.javaguide.cn/p3-juejin/f3d70709f10f4fa6b09125a56a976fda~tplv-k3u1fbpfcp-zoom-1.jpeg)

Còn về trung tâm đăng ký cũng rất đơn giản, chúng ta cũng để **nhà cung cấp dịch vụ** tạo nút tạm thời trong `zookeeper` và ghi `ip, port, phương thức gọi` vào nút, khi **người dùng dịch vụ** cần gọi sẽ **tìm danh sách địa chỉ của dịch vụ tương ứng thông qua trung tâm đăng ký (IP cổng, v.v.)** và cache vào local (để tiện gọi sau), khi người dùng gọi dịch vụ, sẽ không yêu cầu trung tâm đăng ký nữa mà trực tiếp lấy một nhà cung cấp dịch vụ từ danh sách địa chỉ theo thuật toán cân bằng tải để gọi dịch vụ.

Khi một máy chủ của nhà cung cấp dịch vụ bị sập hoặc offline, địa chỉ tương ứng sẽ bị xóa khỏi danh sách địa chỉ nhà cung cấp dịch vụ. Đồng thời, trung tâm đăng ký sẽ gửi danh sách địa chỉ dịch vụ mới cho máy của người dùng dịch vụ và cache ở máy người dùng (tất nhiên bạn có thể để người dùng theo dõi nút, tôi nhớ `Eureka` sẽ thử lỗi trước, sau đó mới cập nhật).

![Trung tâm đăng ký](https://oss.javaguide.cn/p3-juejin/469cebf9670740d1a6711fe54db70e05~tplv-k3u1fbpfcp-zoom-1.jpeg)

## Tổng kết

Các bạn đọc đến đây thật sự rất kiên nhẫn! Không biết mọi người có còn nhớ tôi đã nói gì không.

![](https://oss.javaguide.cn/p3-juejin/912c1aa6b7794d4aac8ebe6a14832cae~tplv-k3u1fbpfcp-zoom-1.jpeg)

Trong bài viết này tôi đã dẫn dắt mọi người vào `zookeeper`, framework điều phối phân tán mạnh mẽ này. Bây giờ hãy cùng sơ lược qua nội dung toàn bộ bài viết.

- Sự khác biệt giữa phân tán và cluster

- Nguyên lý và triển khai của các framework nhất quán `2PC`, `3PC` và thuật toán `paxos`.

- Nội dung của giao thức phát sóng nguyên tử `ZAB` chuyên dụng của `zookeeper` (bầu chọn `Leader`, khôi phục sau sự cố, phát sóng tin nhắn).

- Một số khái niệm cơ bản trong `zookeeper`, ví dụ `ACL`, nút dữ liệu, phiên, cơ chế `watcher`, v.v.

- Các tình huống ứng dụng điển hình của `zookeeper`, ví dụ bầu chọn Master, trung tâm đăng ký, v.v.

  Nếu quên có thể quay lại xem và hiểu lại, nếu có thắc mắc và góp ý hãy mạnh dạn đề xuất.

<!-- @include: @article-footer.snippet.md -->
