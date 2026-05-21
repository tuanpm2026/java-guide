---
title: Giải thích chi tiết giao thức ZAB
category: Distributed
description: Giải thích chi tiết ZAB (ZooKeeper Atomic Broadcast Protocol) — giao thức đồng thuận cốt lõi của ZooKeeper, bao gồm message broadcast mode, crash recovery mode, cơ chế Leader election (ZXID/epoch), cơ chế phục hồi dữ liệu và phân tích vai trò Follower/Observer.
tag:
  - Distributed Protocol & Algorithm
  - Consensus Algorithm
head:
  - - meta
    - name: keywords
      content: ZAB protocol,ZooKeeper,atomic broadcast,distributed consistency,Leader election,crash recovery,ZXID,epoch,ZooKeeper principle
---

Là một distributed coordination framework xuất sắc, ZooKeeper được ngành IT ca ngợi về high availability và data consistency. Nhiều người nhầm tưởng ZooKeeper dùng thuật toán nổi tiếng Paxos, nhưng thực ra "linh hồn" của nó là giao thức đồng thuận được thiết kế riêng — **ZAB (ZooKeeper Atomic Broadcast — Giao thức broadcast nguyên tử)**.

ZAB không phải thuật toán distributed consistency chung như Paxos — nó là **thuật toán broadcast message nguyên tử hỗ trợ crash recovery được thiết kế đặc biệt cho ZooKeeper**. Dựa trên giao thức ZAB, ZooKeeper triển khai kiến trúc primary-backup để duy trì data consistency giữa các replica trong cluster.

## Vai trò cốt lõi và trạng thái của ZAB Cluster

Trước khi đi sâu vào cơ chế giao thức, cần hiểu ba vai trò chính trong ZooKeeper cluster:

- **Leader**: **Duy nhất** xử lý write request trong cluster. Chịu trách nhiệm khởi xướng vote và coordinate transaction — tất cả write operation đều phải qua Leader.
- **Follower**: Có thể trực tiếp xử lý read request của client. Khi nhận write request sẽ forward đến Leader. Trong quá trình Leader election, Follower có quyền bầu chọn và được bầu chọn.
- **Observer**: Chức năng tương tự Follower, nhưng **không có** quyền bầu chọn và được bầu. Sự tồn tại của nó là để mở rộng read performance của cluster theo chiều ngang mà không ảnh hưởng đến consensus performance (tức không tăng số vote cần chờ).

Tương ứng, node trong cluster thường ở một trong bốn trạng thái sau:

- `LOOKING`: Đang tìm Leader (đang trong quá trình election).
- `LEADING`: Node hiện tại là Leader, đang dẫn dắt cluster.
- `FOLLOWING`: Node hiện tại là Follower, tuân theo Leader.
- `OBSERVING`: Node hiện tại là Observer.

## Định danh cốt lõi: ZXID và Epoch

Để đảm bảo tính thứ tự tuyệt đối của message trong môi trường distributed, giao thức ZAB giới thiệu transaction ID tăng đơn điệu global — **ZXID**.

ZXID là long integer 64 bit:

- **32 bit cao (Epoch — Kỷ nguyên)**: Đại diện cho nhiệm kỳ của Leader hiện tại. Khi bầu ra Leader mới, Epoch tăng thêm 1 so với trước. Tương tự triều đại thay thế.
- **32 bit thấp (Transaction ID)**: Bộ đếm tăng dần đơn giản. Với mỗi write request của client, counter tăng 1. Khi Leader mới lên, 32 bit thấp này sẽ được reset về 0.

![Cấu trúc ZXID](https://oss.javaguide.cn/github/javaguide/distributed-system/protocol/zab-zxid-structure.png)

## Hai mode cơ bản của ZAB

Hoạt động của giao thức ZAB có thể tóm gọn thành hai mode cơ bản xen kẽ nhau: **Message Broadcast** (trạng thái hoạt động bình thường) và **Crash Recovery** (trạng thái bất thường hoặc khởi động).

### 1. Message Broadcast Mode (Xử lý write request bình thường)

![ZAB Message Broadcast Mode](https://oss.javaguide.cn/github/javaguide/distributed-system/protocol/zab-message-broadcast-flow.png)

Khi cluster có Leader khỏe mạnh và hơn một nửa số node đã hoàn thành đồng bộ trạng thái, cluster vào Message Broadcast mode. Quá trình này tương tự "Two-Phase Commit (2PC)" đơn giản hóa:

1. **Tạo proposal**: Sau khi Leader nhận write request, convert thành proposal mang ZXID.
2. **Gửi theo thứ tự**: Leader duy trì queue FIFO (First In First Out) cho mỗi Follower (dựa trên TCP), đảm bảo proposal được gửi cho Follower theo thứ tự tạo ra.
3. **Ghi và phản hồi (WAL force flush to disk)**: Sau khi Follower nhận proposal, phải append vào transaction log (TxnLog) cục bộ và force thực thi system call `fsync` để flush vật lý dữ liệu từ kernel buffer ra disk. Chỉ khi xác nhận dữ liệu đã thực sự lên disk mới gửi `ACK` cho Leader. Quá trình này là phòng tuyến cốt lõi của ZAB chống mất dữ liệu khi mất điện. Do đó trong deployment vật lý, rất khuyến nghị mount thư mục transaction log của ZooKeeper (`dataLogDir`) vào SSD độc lập và không có lock, tránh tranh giành disk với các process I/O cao khác — ngăn ngừa P99 response time xấu đi do `fsync` bị block. Trong production phải theo dõi chặt chẽ metric `fsynctime` của node — nếu thời gian flush trung bình thường xuyên vượt 100ms, cluster có thể crash bất kỳ lúc nào.
4. **Broadcast commit**: Khi Leader nhận `ACK` response từ **hơn một nửa** số node, coi thao tác write đó là thành công. Leader cập nhật quorum counter nội bộ khi ghi log cục bộ (không phải gửi ACK tường minh cho chính mình), sau khi xác nhận hơn một nửa sẽ trả response thành công cho client và broadcast `Commit` message đến tất cả node. Follower nhận `Commit` xong sẽ chính thức apply dữ liệu vào memory.

### 2. Crash Recovery Mode (Leader down hoặc network exception)

Khi hệ thống vừa khởi động, hoặc Leader server crash, hoặc mất liên lạc với hơn một nửa Follower, toàn cluster sẽ tạm dừng phục vụ ra ngoài, vào trạng thái `LOOKING`, trigger Crash Recovery mode. Crash Recovery chủ yếu bao gồm hai phase: **Leader Election** và **Data Recovery**.

![zab-crash-recovery-flow](https://oss.javaguide.cn/github/javaguide/distributed-system/protocol/zab-crash-recovery-flow.png)

#### Phase 1: Leader Election

Nguyên tắc cốt lõi của election là: **Node có dữ liệu mới nhất được ưu tiên bầu**. Mỗi node trước tiên bầu cho chính mình, thông tin vote chứa `(Epoch, ZXID, myid)`. Sau đó các node trao đổi vote và PK theo thứ tự sau:

1. **So sánh Epoch**: Epoch lớn hơn được ưu tiên.
2. **So sánh ZXID**: Nếu Epoch bằng nhau, ZXID lớn hơn được ưu tiên (biểu thị dữ liệu mới hơn).
3. **So sánh myid**: Nếu cả hai bằng nhau, server unique identifier `myid` lớn hơn được ưu tiên.

Khi một node nhận được **hơn một nửa** số vote, nó sẽ trở thành Leader mới. _(Đây cũng là lý do ZooKeeper khuyến nghị deploy số server lẻ — có thể đạt fault tolerance trên nửa với chi phí thấp nhất.)_

#### Phase 2: Data Recovery

Bầu ra Leader mới chỉ là bước đầu. Để đảm bảo data consistency, ZAB phải đảm bảo hai điều cực kỳ quan trọng trong giai đoạn data sync:

1. **Đảm bảo transaction đã được commit trên Leader cũ, cuối cùng được commit trên tất cả node.** (Ngăn mất dữ liệu)
2. **Loại bỏ transaction chỉ được đề xuất trên Leader cũ nhưng chưa kịp commit.** (Ngăn dirty data gây nhiễu)

Leader mới tìm `Epoch` lớn nhất hiện tại và cộng 1 làm epoch mới, sau đó so sánh với tất cả Follower. Follower gửi `lastZxid` của record mới nhất trong transaction log của mình (bao gồm cả proposal đã đề xuất nhưng chưa commit). Leader dựa trên giá trị này áp dụng chiến lược sync đa hình: **DIFF (incremental sync)**, **TRUNC (force discard uncommitted log)** hoặc **SNAP (full snapshot transfer)**.

Thiết kế này cực kỳ quan trọng: Leader cần xác định chính xác xem log của Follower có còn "ghost proposal" chưa commit của Leader cũ không, mới có thể phát lệnh TRUNC đúng cho Follower truncate rollback. Nếu chỉ báo cáo ZXID đã commit, dirty data chưa commit này sẽ không thể phát hiện và nhánh TRUNC sẽ không bao giờ được kích hoạt.

Quan trọng hơn, lúc này Epoch mới đã có hiệu lực. Nếu Leader cũ bị "giả chết" do JVM trigger Full GC kéo dài hàng chục giây, khi tỉnh dậy và cố gắng đẩy proposal của Epoch cũ xuống cluster — vì hơn một nửa node đã ghi lại Epoch mới cao hơn và đã submit quorum cho Leader mới, các ghost proposal đó sẽ bị node từ chối và bỏ qua không thương tiếc. ZAB chính là thông qua sự kết hợp **cơ chế Epoch + majority quorum** để miễn dịch hoàn toàn với hiện tượng split-brain trong môi trường mạng — chỉ từ chối bằng Epoch là chưa đủ, phải có hơn một nửa node đã kết nối với Leader mới thì Leader cũ mới thực sự mất khả năng ghi.

Khi hơn một nửa máy hoàn thành sync state và dữ liệu với Leader mới, giao thức ZAB sẽ thoát khỏi Crash Recovery mode một cách thuận lợi và vào lại Message Broadcast mode.

## So sánh với Raft

**Sự tương đồng cao giữa ZAB và Raft**: Nếu bạn đã biết về Raft algorithm, sẽ thấy chúng rất giống nhau. Cả hai đều có unique primary node, đều dùng Epoch/Term để đánh dấu nhiệm kỳ, và đều áp dụng chiến lược commit chỉ cần hơn một nửa node xác nhận. Điều này cho thấy kiến trúc dựa trên primary-backup và majority election đã trở thành tiêu chuẩn thực tế trong lĩnh vực distributed consensus hiện đại.

Trong thực tiễn distributed system hiện nay, Raft algorithm thường được coi là lựa chọn thực dụng và phổ biến hơn ZAB. Vì Raft từ khi thiết kế đã nhấn mạnh dễ hiểu và dễ triển khai — tách biệt rõ ràng Leader election, log replication và safety — giúp developer dễ implement và debug đúng hơn. Trong khi ZAB là giao thức độc quyền của ZooKeeper, tập trung hơn vào nhu cầu atomic broadcast cụ thể nên tính phổ quát kém hơn.

Raft đã được ứng dụng rộng rãi trong các hệ thống hiện đại như etcd của Kubernetes, Hashicorp Consul, Apache Kafka (trong KIP-500 loại bỏ dependency vào ZooKeeper, chuyển sang Raft-based KRaft), TiKV, v.v. — đã "dân chủ hóa" đáng kể việc phát triển distributed consensus.

Ngược lại, ZAB chủ yếu gắn với ZooKeeper. Dù ZooKeeper vẫn là coordination service kinh điển, nhưng nhiều project mới có xu hướng chọn Raft để tránh sự phức tạp thêm và bottleneck tiềm ẩn của ZooKeeper (như consensus overhead ở quy mô lớn).

Ngoài ra, cộng đồng hỗ trợ Raft tích cực hơn, đã có nhiều biến thể tối ưu (như phiên bản cải tiến cho blockchain), khiến nó có nhiều ưu điểm về efficiency và phạm vi ứng dụng. Tuy nhiên nếu hệ thống của bạn đã tích hợp sâu với ZooKeeper, ZAB vẫn là lựa chọn tối ưu nhất; nếu không thì với thiết kế mới hoặc nhu cầu general consensus, Raft là tiêu chuẩn thực dụng hơn hiện nay.

## Tổng kết

Giao thức ZAB thông qua cơ chế Leader election và majority confirmation được thiết kế cẩn thận, đã lựa chọn giữa partition tolerance (P) và consistency (C) trong distributed system (thỏa mãn thuộc tính CP). Khi xảy ra network partition, ZAB thà hi sinh availability (A) tạm thời để election, chứ không chấp nhận mất data consistency.

Cần đặc biệt nhấn mạnh: **Giao thức ZAB mặc định không đảm bảo strong consistency (linearizability) mà cung cấp Sequential Consistency (nhất quán tuần tự)**.

Vì Follower có thể trực tiếp xử lý read request của client mà không yêu cầu dữ liệu đồng bộ hoàn toàn, client hoàn toàn có thể đọc được dữ liệu cũ thua sau Leader (Stale Read). Trong production, nếu nghiệp vụ liên quan đến các tình huống yêu cầu data freshness cực cao như distributed lock, nhất thiết phải gọi tường minh primitive `sync()` trước khi thực thi `read()` — buộc Follower kết nối phải catch up với transaction state machine của Leader.

Khi xảy ra network partition, nếu client kết nối với Follower thuộc minority bị cô lập, dù write operation sẽ fail nhưng vẫn có thể đọc được dữ liệu expired. Đây là edge case phải xem xét khi dùng giao thức ZAB.
