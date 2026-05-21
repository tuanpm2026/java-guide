---
title: Giải thích chi tiết thuật toán Raft
category: Distributed System
description: Giải thích chi tiết nguyên lý Raft consensus algorithm, bao gồm Leader election (random timeout mechanism), Log Replication, Safety guarantees (election restriction/log matching), membership changes và so sánh với Paxos algorithm. etcd, Consul đều dùng Raft.
tag:
  - Distributed Protocols & Algorithms
  - Consensus Algorithms
head:
  - - meta
    - name: keywords
      content: Raft algorithm,Raft,consensus algorithm,Leader election,log replication,etcd,Consul,distributed consensus,Paxos,distributed algorithm
---

> Bài này được hoàn thành bởi [SnailClimb](https://github.com/Snailclimb) và [Xieqijun](https://github.com/jun0315).

## 1 Background

Trong kiến trúc internet ngày nay, để chịu được massive traffic, hệ thống thường cần horizontal scaling. Khi có nhiều machines, downtime và network disconnection trở thành chuyện thường ngày. Làm thế nào để một nhóm servers có thể sụp đổ bất cứ lúc nào vẫn giữ được bước đi đồng bộ và không cung cấp dữ liệu sai cho bên ngoài? Đây là lúc **distributed consensus algorithms** xuất hiện.

Năm 2014, Diego Ongaro và đồng nghiệp công bố thuật toán Raft. Sứ mệnh ra đời rất rõ ràng: **cứu các programmers khỏi sự đày đọa của Paxos algorithm**. Raft nổi bật với "dễ hiểu" — tách vấn đề consensus phức tạp thành các modules độc lập:

- **Leader Election**: Dùng randomized election timeout (trong engineering thường là 150-300ms hoặc rộng hơn, tùy thuộc vào network và failure model).
- **Log Replication**: Leader broadcast logs qua AppendEntries RPC.
- **Safety**: Bao gồm election restriction và log matching.

Raft đã được áp dụng rộng rãi trong production. Các implementations dựa trên Raft như etcd, Consul đã trở thành components quan trọng của distributed systems. Academic và industry cũng đã thực hiện nhiều extensions và optimizations:

- **Pre-Vote** (2014): Ngăn nodes trong network partition làm gián đoạn elections của stable cluster
- **Read Index** (2014): Tối ưu read performance qua linearly consistent reads trong Leader term
- **Lease Read**: Linearly consistent read solution based on leases
- **Joint Consensus**: Unified consensus mechanism cho cluster membership changes

### 1.1 Tương tự "Chọn Tướng Soái" trong Non-Byzantine conditions

Raft có một tiền đề: **Non-Byzantine Fault Tolerant (CFT)**. Nói thẳng: anh em có thể bị chết máy, bị đứt mạng, nhưng tuyệt đối không có "kẻ nội gián" truyền tin giả.

Chúng ta có thể hiểu sơ qua qua "chọn tướng soái": Giả sử có 3 tướng A, B, C — hiện không có ai lãnh đạo. Mỗi người có một đồng hồ đếm ngược ngẫu nhiên (election timeout). Ai hết thời gian trước sẽ đứng ra hô: "Tôi muốn làm đại tướng quân, hãy bỏ phiếu cho tôi!" Nếu các tướng khác chưa bắt đầu ứng cử cũng chưa bỏ phiếu cho ai khác, họ sẽ thuận theo. Khi tướng đó nhận được **đa số phiếu**, họ trở thành đại tướng (Leader). Nếu tin tức thất lạc giữa đường và không ai nhận được phản hồi, thì reset đồng hồ và bắt đầu lại một vòng.

### 1.2 Consensus Algorithm là gì?

Mục tiêu cốt lõi của consensus algorithm là **làm cho một nhóm machines trông giống như một machine**. Miễn là hơn nửa số machines trong cluster vẫn còn hoạt động, toàn bộ system vẫn có thể phục vụ clients.

Điều này thường được implement qua **Replicated State Machine**: gửi cho mỗi node cùng một cuốn sổ ghi chép (log). Miễn là tất cả thực hiện commands theo cùng thứ tự, kết quả cuối cùng sẽ hoàn toàn giống nhau. Vì vậy, về bản chất consensus algorithm làm một việc — **đảm bảo logs của tất cả nodes hoàn toàn nhất quán**.

![Consensus algorithm architecture](/images/github/javaguide/paxos-rsm-architecture.png)

## 2 Khái Niệm Cơ Bản

Trước khi đi sâu vào Raft, cần hiểu ba core roles, term mechanism và log structure.

### 2.1 Node Types

Một Raft cluster bao gồm nhiều servers. Với cluster 5 servers điển hình. Tại bất kỳ thời điểm nào, mỗi server sẽ ở một trong ba states:

- **Leader**: "Đại tướng quân". Toàn quyền phụ trách nhận requests từ clients, ghi log và sync log cho followers. Để ngăn người khác chiếm ngôi, phải liên tục gửi heartbeats cho toàn bộ members, tuyên bố "ta vẫn còn sống".
- **Follower**: Thành viên an phận. Bình thường tuyệt đối không chủ động gửi requests, chỉ thụ động nhận heartbeats và log sync từ Leader.
- **Candidate**: Trạng thái tạm thời. Nếu follower không nhận được heartbeat từ Leader quá lâu, sẽ nghĩ mình có thể làm được và chuyển thành Candidate để bắt đầu vận động tranh cử.

Trong điều kiện bình thường, chỉ có một server là Leader, còn lại là Followers. Followers thụ động — không gửi request nào, chỉ respond lại requests từ Leader và Candidates.

![Raft server state transition diagram](/images/github/javaguide/paxos-server-state.png)

### 2.2 Terms (Nhiệm kỳ)

![Term diagram](/images/github/javaguide/paxos-term.png)

Raft algorithm chia thời gian thành các terms có độ dài tùy ý, terms được biểu thị bằng số liên tiếp. Mỗi term bắt đầu bằng một election. Khi bắt đầu, một hoặc nhiều Candidates sẽ cố gắng trở thành Leader. Nếu một Candidate thắng election, họ sẽ là Leader trong term đó. Nếu không có Leader được chọn (ví dụ split vote), term đó có thể không có Leader — sau đó khi election timeout mới sẽ bắt đầu term tiếp theo và election mới.

Mỗi node lưu trữ term number hiện tại. Khi servers giao tiếp với nhau sẽ exchange term numbers. Nếu server phát hiện term của mình nhỏ hơn người khác, nó sẽ update lên giá trị lớn hơn. Nếu Candidate hoặc Leader phát hiện term của mình đã hết hạn, nó sẽ ngay lập tức trở về Follower. Nếu server nhận được request với term đã hết hạn, nó sẽ từ chối request đó.

![Raft Term Progression](/images/github/javaguide/distributed-system/protocol/raft-term-progression.png)

### 2.3 Logs (Nhật ký)

Chỉ Leader mới có quyền append entries vào log. Một log entry chứa ba core elements: `<current_term, index, command>`.

Hai progress pointers quan trọng:

- **commitIndex**: Progress của logs được cộng đồng công nhận là đã an toàn landed (đã được replicated đến majority).
- **lastApplied**: Progress của logs đã thực sự được executed locally trên machine này.

## 3 Leader Election (Bầu Cử Lãnh Đạo)

![Raft Leader Election Flow](/images/github/javaguide/distributed-system/protocol/raft-election.png)

Raft dùng heartbeat mechanism để trigger Leader election.

Nếu server liên tục nhận được AppendEntries hợp lệ (heartbeat hoặc log replication) từ Leader, nó sẽ duy trì Follower state và refresh election timer.

Leader gửi heartbeats đến tất cả Followers định kỳ để duy trì vị trí Leader. Nếu Follower không nhận được heartbeat trong một period — gọi là election timeout — nó sẽ cho rằng không có Leader khả dụng và bắt đầu một election để chọn Leader mới.

Để bắt đầu election mới, Follower tự tăng term number và chuyển sang Candidate state. Sau đó gửi RequestVote RPC đến tất cả nodes. Candidate state kéo dài cho đến khi:

- Thắng election
- Node khác thắng election
- Một vòng election kết thúc mà không ai thắng

Điều kiện để thắng election: Candidate nhận được đa số phiếu `(N/2+1)` từ cluster trong một term sẽ trở thành Leader.

Trong khi Candidate đang chờ phiếu, nó có thể nhận heartbeat từ node khác tuyên bố mình là Leader:

- Nếu term của Leader đó >= term của mình: Đối phương đã trở thành Leader, mình quay về Follower.
- Nếu term của Leader đó < term của mình: Từ chối request và yêu cầu node đó update term.

Vì có thể có nhiều Candidates cùng xuất hiện và không Candidate nào nhận được đa số phiếu, nếu không có cơ chế nào để phân bổ lại phiếu thì có thể lặp đi lặp lại vô tận.

Raft dùng random election timeout để tránh tình trạng trên. Sau khi mỗi Candidate bắt đầu election, nó random hóa một election timeout mới. Cơ chế này giúp các servers phân tán ra, trong hầu hết trường hợp chỉ có một server timeout trước. Nó sẽ thắng election trước khi các servers khác timeout.

## 4 Log Replication (Sao Chép Nhật Ký)

Khi Leader được chọn, nó bắt đầu nhận client requests. Mỗi client request chứa một command cần được Replicated State Machine thực thi.

Sau khi Leader nhận request từ client, nó generate một entry `<index, term, cmd>`, append entry đó vào cuối log của mình, sau đó broadcast entry đó đến tất cả nodes, yêu cầu các servers khác replicate entry này.

Nếu Follower chấp nhận entry, nó sẽ append entry vào cuối log của mình và trả về đồng ý cho Leader.

Nếu Leader nhận được phản hồi replicate thành công từ majority Followers, Leader sẽ advance commitIndex và sau đó apply những logs đã committed theo thứ tự vào state machine trước khi return kết quả cho client.

Cần lưu ý một key constraint: Leader chỉ có thể advance commitIndex dựa trên "một log được tạo ra trong current term đã được replicated thành công đến majority". Với logs từ previous terms, dù chúng đã được replicated đến majority, Leader cũng không nên trực tiếp commit chỉ dựa trên majority. Thường dùng cách commit một new log trong current term (cách phổ biến là append và commit một no-op log sau khi elected) để gián tiếp push commit của historical logs.

### 4.1 Log Matching Property

Raft đảm bảo logs tuyệt đối không bao giờ diverge thông qua **Log Matching Property** — đây là một trong những cornerstones của Raft safety.

**Guarantee 1**: Nếu hai logs có entries ở cùng index với cùng term, thì stored commands chắc chắn giống nhau.
**Guarantee 2**: Nếu hai logs có entries ở cùng index với cùng term, thì tất cả entries trước vị trí đó cũng hoàn toàn giống nhau.

**AppendEntries consistency check**:

```
AppendEntries RPC parameters:
- prevLogIndex: Index of previous log entry (Leader's estimated alignment with Follower)
- prevLogTerm: Term of previous log entry
- entries[]: New log entries to append
```

**Consistency check logic**:

- Follower receives AppendEntries, checks local log at index = prevLogIndex
- If entry.term == prevLogTerm: Leader and Follower logs are consistent before prevLogIndex, check passes
- If not found or term doesn't match: Reject append, return failure

### 4.2 Log Inconsistency Recovery

Khi normal operation, Leader và Followers hoàn toàn sync. Tuy nhiên, khi old Leader đột ngột crashes, cluster thường có nhiều misaligned "dirty data".

Lúc này, AppendEntries sync requests của new Leader sẽ trigger "consistency check errors". Logic của Raft để resolve data conflicts rất "domineering": **tất cả lấy log của current Leader làm highest authority** — bất kỳ inconsistent records nào trên Follower đều phải bị xóa sạch và overwritten.

Cụ thể: Leader sẽ như "pulling a zipper" trace back để tìm last perfectly matching historical point. Sau khi tìm được "divergence point", Follower sẽ xóa toàn bộ rác sau divergence point và copy newest logs từ Leader.

Ở code level, Leader maintain một `nextIndex` pointer riêng cho mỗi Follower (estimated position of next log to send). Khi newly elected, Leader optimistically sets all `nextIndex` to its own latest log index + 1. Nếu Follower's data thực ra cũ hơn hoặc có conflicts, AppendEntries đầu tiên chắc chắn bị rejected.

Two approaches:

- **Naive approach**: Decrease `nextIndex` by 1 and retry until aligned (slow)
- **Fast Backup**: Follower reports conflicting term boundaries, Leader skips entire conflicting term at once (production-level optimization)

## 5 Safety (An Toàn)

### 5.1 Election Restriction (Hạn Chế Bầu Cử)

Leader cần đảm bảo lưu trữ toàn bộ các log entries đã được committed. Điều này đảm bảo log entries chỉ có một chiều: từ Leader đến Followers. Leader không bao giờ overwrite existing log entries.

Mỗi Candidate khi gửi RequestVote RPC sẽ mang thông tin của last entry. Tất cả nodes khi nhận vote info sẽ so sánh entry đó — nếu thấy của mình mới hơn thì từ chối vote cho Candidate đó.

**Cách xác định log mới hơn**: Nếu hai logs có terms khác nhau, term lớn hơn là mới hơn. Nếu terms giống nhau, index dài hơn là mới hơn.

### 5.2 Commit Rules

Khi Leader advance commitIndex, cần thỏa mãn điều kiện "một log được tạo trong current term đã được replicated đến majority". Với logs từ old terms, dù đã replicated đến majority, Leader cũng không nên trực tiếp commit chỉ dựa trên điều đó. Thường dùng cách commit một new log trong current term (thường là no-op) để gián tiếp commit historical logs. Restriction này để tránh committed logs bị overwritten khi Leaders switch frequently.

### 5.3 Node Crash và Network Partition

Nếu Follower và Candidate crash, xử lý khá đơn giản. RequestVote RPC và AppendEntries RPC gửi cho chúng sẽ fail. Vì tất cả Raft requests đều idempotent, failure sẽ retry vô hạn. Khi recovered, chúng có thể nhận requests mới và chọn append hoặc reject entries.

Nếu Leader crash, nodes không nhận được heartbeat trong electionTimeout sẽ trigger election mới. Trước khi election hoàn thành, system thường không thể provide linearly consistent writes (và linearly consistent reads).

**Quantitative analysis**: Trong 5-node cluster, unavailability window sau Leader crash thường < 1 giây. Đây là hiện thân của **PACELC theorem**: khi có partition (P), system chọn hy sinh availability (A) để đảm bảo consistency (C).

#### Single Node Isolation và Term Inflation Problem

Trong standard Raft, **single node network isolation** có thể dẫn đến **Term Inflation** problem — một isolated minority node sau khi recover phá vỡ stability của healthy cluster.

| Timeline | Normal Area {A, B, C, D}                                      | Isolated Area {E}                                                 |
| -------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| T0       | Leader A normal service, Term = 5                             | E can't receive heartbeat, election timeout                       |
| T1       | Cluster continues normally                                    | E self-increment Term to start election (Term 6), but no response |
| T2       | ...                                                           | E continues (Term 7, 8, ...), assume reaches Term 99              |
| T3       | Network recovers, E rejoins with Term 99                      | E broadcasts RequestVote (Term 99)                                |
| T4       | Node A receives Term 99 > its Term 5, **forced to step down** | E's "high Term" disrupts healthy cluster                          |

#### Pre-Vote Mechanism

**Pre-Vote** requires nodes to do a "pre-vote" before actually starting election:

1. **Pre-vote phase**: Candidate sends PreVoteRequest to other nodes with its log info
2. **Pre-vote conditions**: Candidate's log at least as new as receiver's AND receiver confirms it lost Leader connection (over electionTimeout without heartbeat)
3. **Official election**: Only after majority PreVote responses does it actually increment term and send RequestVote

In the single node isolation scenario, E's PreVote attempts during isolation would be rejected by other nodes (since they still receive heartbeats from Leader A). E can't get majority PreVote, so **won't actually increment Term**.

Pre-Vote is widely used in production Raft implementations like etcd, TiKV, Consul.

### 5.4 Timing và Availability

Raft's requirement: safety does not depend on timing. Best to satisfy:

`broadcastTime << electionTimeout << MTBF`

- `broadcastTime`: Average response time for concurrent messages to other nodes
- `electionTimeout`: Election timeout duration
- `MTBF (Mean Time Between Failures)`: Average healthy time for single machine

`broadcastTime` should be one order of magnitude smaller than `electionTimeout` so Leader can continuously send heartbeats to prevent Followers from starting elections.

`electionTimeout` should be several orders of magnitude smaller than `MTBF` for system stability.

Generally: broadcastTime ≈ `0.5~20ms`, electionTimeout can be set to `10~500ms` (common in engineering: 150-300ms), MTBF is generally 1-2 months.

## 6 References

- <https://tanxinyu.work/raft/>
- <https://github.com/OneSizeFitsQuorum/raft-thesis-zh_cn/blob/master/raft-thesis-zh_cn.md>
- <https://github.com/ongardie/dissertation/blob/master/stanford.pdf>
- <https://knowledge-sharing.gitbooks.io/raft/content/chapter5.html>

<!-- @include: @article-footer.snippet.md -->
