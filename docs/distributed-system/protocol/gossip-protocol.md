---
title: Giải thích chi tiết Gossip Protocol
category: Distributed
description: Giải thích chi tiết nguyên lý Gossip Protocol, trình bày cơ chế lan truyền thông tin phi tập trung, hai loại mô hình lan truyền điển hình (Anti-Entropy và Rumor-Mongering), SWIM protocol và ứng dụng trong các hệ thống distributed như Redis Cluster, Cassandra.
tag:
  - Distributed Protocol & Algorithm
  - Data Replication Protocol
  - Eventual Consistency
head:
  - - meta
    - name: keywords
      content: Gossip protocol,anti-entropy,rumor-mongering,decentralized,Redis Cluster,SWIM,distributed communication,eventual consistency,distributed protocol
---

## Bối cảnh

Trong distributed system, chia sẻ state giữa các node khác nhau là một nhu cầu cơ bản.

Một cách đơn giản là **centralized broadcast**: Node trung tâm sync thông tin đến tất cả node khác. Cách này phù hợp với centralized system, nhưng có nhược điểm rõ ràng: Khi số lượng node tăng, sync efficiency giảm (O(N) complexity). Và phụ thuộc quá nhiều vào center node — có rủi ro single point of failure.

**Gossip Protocol** với **decentralized propagation** cung cấp một giải pháp thay thế phi tập trung.

![Distributed System Communication Mechanism: Centralized vs Decentralized](https://oss.javaguide.cn/github/javaguide/distributed-system/protocol/gossip-centralized-vs-decentralized.png)

## Giới thiệu Gossip Protocol

**Gossip** (còn gọi là **Epidemic Protocol** — giao thức dịch bệnh) lấy cảm hứng từ đặc tính ngẫu nhiên của sự lan truyền dịch bệnh. Tư tưởng cốt lõi là: Mỗi node định kỳ chọn ngẫu nhiên một số node khác để trao đổi thông tin, làm cho data lan truyền ra toàn mạng như virus lây bệnh.

![Gossip Translation](https://oss.javaguide.cn/github/javaguide/distributed-system/protocol/gossip.png)

Gossip Protocol được Demers và cộng sự đề xuất lần đầu trong paper [《Epidemic Algorithms for Replicated Database Maintenance》](https://dl.acm.org/doi/10.1145/41840.41841) năm 1987, dùng để giải quyết vấn đề đồng bộ replica của distributed database.

**Định nghĩa**: Gossip Protocol là communication protocol **phi tập trung**. Thông qua trao đổi thông tin ngẫu nhiên giữa các node, trong điều kiện môi trường non-Byzantine và không có permanent network partition, node định kỳ trao đổi liên tục — state của tất cả node trong cluster đạt được **eventual consistency**.

> **Phân biệt quan trọng**: Gossip là information propagation protocol, **không phải consensus algorithm** (như Raft/Paxos). Consensus algorithm đảm bảo strong consistency và safety. Gossip chỉ đảm bảo eventual consistency — không phù hợp cho các tình huống yêu cầu strong consistency như leader election hay state machine replication.

**Đặc tính quan trọng**:

- **Phi tập trung**: Không có center node, tất cả node đều bình đẳng.
- **Fault tolerance mạnh**: Chịu đựng node down, network partition, dynamic add/remove node.
- **Convergence theo xác suất**: Trong mô hình chọn điểm đều đặn ngẫu nhiên và fanout là hằng số, số vòng lan truyền kỳ vọng là O(log N) (ví dụ N=100 khoảng 5-7 vòng, phụ thuộc fanout và packet loss rate).
- **Message redundancy**: Cùng một message có thể nhận nhiều lần, cần deduplication mechanism.

## Ứng dụng của Gossip Protocol

Gossip Protocol được ứng dụng rộng rãi trong distributed system:

- **Redis Cluster**: Dùng để sync state và fault detection giữa các node.
- **Apache Cassandra**: Dùng để lan truyền thông tin node membership và state. Replica repair dùng anti-entropy/repair (dựa trên Merkle Tree).
- **Consul**: Dùng để member discovery, fault detection và event broadcast (dựa trên SWIM protocol).
- **Amazon Dynamo**: Dùng để eventual consistency của distributed storage.

Lấy **Redis Cluster** (3.0+) làm ví dụ:

Redis Cluster là giải pháp distributed cache phi tập trung. Các node trao đổi cluster state qua Gossip Protocol, bao gồm: thông tin node, slot assignment, node state (online/PFAIL/FAIL).

![Official Redis Cluster Solution](https://oss.javaguide.cn/github/javaguide/distributed-system/protocol/up-fcacc1eefca6e51354a5f1fc9f2919f51ec.png)

**Loại Gossip Message**:

| Loại message | Mục đích                                        |
| ------------ | ----------------------------------------------- |
| MEET         | Thêm node được chỉ định vào cluster             |
| PING         | Định kỳ gửi, trao đổi node state                |
| PONG         | Response cho PING, mang state info của bản thân |
| FAIL         | Broadcast fault marking của node                |

> Lưu ý: Trong implementation, MEET/PING/PONG chia sẻ cùng message structure. PONG là response cho PING/MEET. MEET tương đương với PING "force handshake".

**Fault detection flow**:

1. Nếu node A không nhận được response của B trong khoảng thời gian `cluster-node-timeout` (thường 15s, phụ thuộc cấu hình), sẽ đánh dấu B là **PFAIL** (suspected down).
2. Nếu A nhận được PFAIL report về B từ các master node khác, và **hơn một nửa master node** xác nhận B là PFAIL (report chưa hết hạn), A sẽ đánh dấu B là **FAIL** (confirmed down) và broadcast ra cluster.

Hình dưới là sơ đồ Redis Cluster với kiến trúc master-slave. Đường nét đứt trong hình biểu thị các node giao tiếp bằng Gossip, đường nét liền biểu thị master-slave replication.

![Redis Cluster Nodes Communicate with Gossip](https://oss.javaguide.cn/github/javaguide/distributed-system/protocol/redis-cluster-gossip.png)

> Lưu ý: Redis Cluster chủ yếu lan truyền thông tin node/slot/fault qua incremental gossip của PING/PONG (mang timestamp/flag bit, v.v.), không áp dụng quy trình anti-entropy reconciliation dựa trên Merkle tree như Dynamo.

Chi tiết về Redis Cluster xem bài [Redis Cluster Explained (Paid)](https://javaguide.cn/database/redis/redis-cluster.html).

## Các mô hình lan truyền Gossip Protocol

Gossip Protocol có hai mô hình lan truyền chính: **Anti-Entropy** và **Rumor-Mongering**.

### Anti-Entropy (Chống entropy)

**Định nghĩa**: Node trao đổi **đầy đủ data** (hoặc data digest) để loại bỏ sự khác biệt và đạt eventual consistency.

Ý nghĩa vật lý của **entropy** là mức độ hỗn loạn của hệ thống. Anti-entropy nghĩa là **giảm sự khác biệt data giữa các node, cải thiện consistency**.

Theo Wikipedia:

> Khái niệm entropy xuất phát từ vật lý học, dùng để đo lường mức độ hỗn loạn của hệ thống nhiệt động lực học. Entropy tốt hơn nên hiểu là đo lường tính không chắc chắn chứ không phải tính chắc chắn, vì entropy của nguồn thông tin càng ngẫu nhiên thì entropy càng lớn.

Ở đây, entropy trong anti-entropy có thể hiểu là mức độ hỗn loạn/sự khác biệt data giữa các node. Anti-entropy là loại bỏ sự khác biệt data giữa các node, tăng độ tương đồng data, từ đó giảm entropy value.

**Ba cách triển khai**:

| Cách      | Mô tả                                           | Tình huống áp dụng           |
| --------- | ----------------------------------------------- | ---------------------------- |
| Push      | Sender push toàn bộ data của mình cho receiver  | Sender có data mới           |
| Pull      | Receiver pull toàn bộ data của sender           | Receiver có data cũ          |
| Push-Pull | Trao đổi data hai chiều và so sánh sự khác biệt | Hiệu quả nhất, phổ biến nhất |

![Anti-Entropy Mechanism: Push-Pull Interaction Sequence Diagram](https://oss.javaguide.cn/github/javaguide/distributed-system/protocol/gossip-anti-entropy-pushpull.png)

Pseudocode:

![Anti-Entropy Pseudocode](https://oss.javaguide.cn/github/javaguide/distributed-system/protocol/up-df16e98bf71e872a7e1f01ca31cee93d77b.png)

**Convergence characteristic**: Trong mô hình chọn điểm đều đặn ngẫu nhiên và fanout là hằng số, kỳ vọng O(log N) vòng để cover tất cả node (ước tính thông thường có thể dùng bậc log₂N).

Một số hệ thống (như InfluxDB) dùng **deterministic closed-loop scheduling** (như ring topology) thay vì chọn ngẫu nhiên, có thể hoàn thành sync trong số vòng xác định. Đây là **engineering derived implementation** của anti-entropy, không phải core mechanism của Gossip Protocol tiêu chuẩn. Deterministic scheduling hi sinh ưu điểm fault tolerance của randomness để đổi lấy convergence time có thể dự đoán được.

![Deterministic Closed-Loop Scheduling](https://oss.javaguide.cn/github/javaguide/distributed-system/protocol/raft-anti-entropyclosed-loop.png)

1. Node A push data cho node B. Node B lấy được data mới nhất từ A.
2. Node B push data cho C. Node C lấy được data mới nhất từ A và B.
3. Node C push data cho A. Node A lấy được data mới nhất từ B và C.
4. Node A push data cho B tạo thành vòng kín. Node B lấy được data mới nhất từ C.

**Trade-off**: Closed-loop scheduling có thể hoàn thành sync trong thời gian xác định, nhưng hi sinh **fault tolerance** (node fault trong ring ảnh hưởng đến propagation path) và khó thích ứng với dynamic add/remove node.

**Tình huống áp dụng**: Cần residual rate thấp (hạn chế bỏ sót update), cho phép background periodic reconciliation repair. Khi data volume lớn cần dùng incremental comparison như digest/tree để kiểm soát chi phí.

> **Production optimization**: Trong large-scale distributed storage (như Cassandra, DynamoDB), data volume của node có thể đến TB. Trao đổi data đầy đủ trực tiếp là không thực tế. Production system dùng **Merkle Tree** để incremental diff comparison: Hai node trước tiên trao đổi Merkle Tree root hash. Nếu có sự khác biệt thì recursive compare subtree, định vị sự khác biệt ở level O(log M) của tree height (M là số entry trong range đó), sau đó chỉ truyền incremental data.

### Rumor-Mongering (Lan truyền tin đồn)

**Định nghĩa**: Khi node có **data mới**, node đó trở thành active node, định kỳ broadcast data đó đến random node cho đến khi tất cả node đều nhận được.

**Điểm khác với Anti-Entropy**:

- Chỉ lan truyền **data mới thêm (Delta)**, không phải data đầy đủ.
- Node sau khi nhận update vào trạng thái active và định kỳ lan truyền. Sau khi nhiều lần tiếp xúc với node đã biết update đó, sẽ dừng lan truyền theo strategy (count/probability/TTL).
- Phù hợp với tình huống **số node lớn**, **incremental data nhỏ**.

> **Deduplication mechanism**: Production environment (như Redis Cluster) dùng **version number** hay **message ID** để dedup, tránh xử lý trùng cùng message.

Như hình dưới (hình từ bài [INTRODUCTION TO GOSSIP](https://managementfromscratch.wordpress.com/2016/04/01/introduction-to-gossip/)):

![Gossip Propagation Diagram](https://oss.javaguide.cn/github/javaguide/distributed-system/protocol/gossip-rumor-mongering.gif)

Pseudocode:

![](https://oss.javaguide.cn/github/javaguide/csdn/20210605170707933.png)

**Convergence characteristic**: Trong mô hình chọn điểm đều đặn ngẫu nhiên và fanout là hằng số, sau O(log N) vòng với xác suất cao sẽ cover tất cả node.

**Lưu ý**:

- Kiểm soát kích thước message packet, tránh fragmentation càng nhiều càng tốt (phụ thuộc path MTU, thường kiểm soát trong một network packet đơn).
- Kết hợp deduplication mechanism (như message ID, version number).
- Tránh high-frequency update gây message storm.
- Dùng **Jitter (Random jitter)** để phân tán sync timing, tránh nhiều node đồng thời khởi động propagation gây cascading failure.

![Gossip Protocol: Random Propagation và Convergence Process](https://oss.javaguide.cn/github/javaguide/distributed-system/protocol/gossip-propagation.png)

### Tổng kết

| Điểm                | Anti-Entropy                        | Rumor-Mongering                                  |
| ------------------- | ----------------------------------- | ------------------------------------------------ |
| Nội dung lan truyền | Data đầy đủ (hoặc digest)           | Chỉ data mới thêm (Delta)                        |
| Tình huống áp dụng  | Số node vừa phải                    | Số node nhiều/dynamic change                     |
| Message overhead    | Lớn hơn                             | Nhỏ hơn                                          |
| Phạm vi hội tụ      | Hội tụ về data mới nhất (full sync) | Hội tụ về data đã biết (incremental propagation) |

## Ưu điểm và Nhược điểm của Gossip Protocol

**Ưu điểm**:

1. **Triển khai đơn giản**: Logic protocol đơn giản, dễ hiểu.

2. **Fault tolerance mạnh**: Chịu đựng node down, network partition, dynamic add/remove node. Node mới thêm hoặc restart trong điều kiện lý tưởng cuối cùng nhất định sẽ đạt state nhất quán với các node khác.

3. **Scalability tốt**: Convergence time là O(log N). Khi N lớn (như N > 100), parallel propagation thường nhanh hơn center node unicast (sau cần O(N) vòng). Trong mô hình rumor spreading điển hình, trade-off là **tổng message là O(N log N)** (phụ thuộc implementation strategy và stopping condition), có redundancy overhead.

**Nhược điểm**:

1. **Eventual consistency**: Message cần qua nhiều vòng lan truyền mới cover toàn mạng, có window period of inconsistency. Thời gian cụ thể để đạt consistency phụ thuộc vào network condition, gossip interval (**phụ thuộc implementation config, thường 100ms-1s**) và node scale.

2. **Không phù hợp với Byzantine environment**: Gossip Protocol được thiết kế giả định non-Byzantine environment, không xử lý tình huống malicious node (node không giả mạo hay tamper message).

3. **Message redundancy**: Do tính ngẫu nhiên của propagation, cùng một node có thể nhận trùng cùng message, cần deduplication mechanism.

## Tổng kết

- Gossip Protocol là communication protocol **phi tập trung**. Thông qua trao đổi thông tin ngẫu nhiên giữa các node, state của tất cả node trong cluster đạt được **eventual consistency**.
- **Không phải consensus algorithm**: Gossip không đảm bảo strong consistency/linearizability, không thể dùng cho leader election hay state machine replication. Consensus algorithm (Raft/Paxos) mới đảm bảo safety và linearizability.
- Core characteristics: Phi tập trung, fault tolerance mạnh, O(log N) convergence.
- Hai mô hình lan truyền: **Anti-entropy** (full data/digest), **Rumor-mongering** (incremental data).
- Ứng dụng điển hình: Metadata propagation (Redis Cluster), eventual consistent storage (Cassandra/DynamoDB).
- Trade-off: Simplicity và fault tolerance vs eventual consistency latency và message redundancy.

## Tài liệu tham khảo

- [Epidemic Algorithms for Replicated Database Maintenance](https://dl.acm.org/doi/10.1145/41840.41841) - Demers et al., 1987
- [Amazon Dynamo: All Things Distributed](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) - DeCandia et al., 2007
- [Redis Cluster Specification](https://redis.io/docs/management/scaling/)
- Giải thích chi tiết Redis Cluster Gossip Protocol trong 10.000 chữ: <https://segmentfault.com/a/1190000038373546>
- 《Distributed Protocol and Algorithm Practice》
- 《Redis Design and Implementation》
