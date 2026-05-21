---
title: ZooKeeper Introduction Guide
category: Distributed System
description: ZooKeeper introduction guide covering core concepts, data model (ZNode/node types), Watcher listener mechanism, ACL permission control and typical application scenarios as registry center, distributed lock, config center.
tag:
  - ZooKeeper
head:
  - - meta
    - name: keywords
      content: ZooKeeper,ZooKeeper intro,ZNode,Watcher,distributed lock,registry center,distributed coordination,ZAB,ephemeral node,persistent node
---

<!-- @include: @small-advertisement.snippet.md -->

Chắc mọi người không quá xa lạ với ZooKeeper. Nhưng bạn thực sự hiểu ZooKeeper dùng để làm gì không? Nếu người khác/interviewer bảo bạn giới thiệu về ZooKeeper, bạn có thể trả lời đến mức nào?

Tôi từng dùng Dubbo để làm distributed projects, dùng ZooKeeper làm registry center. Để đảm bảo distributed system có thể sync access một resource nhất định, tôi cũng dùng ZooKeeper để implement distributed lock. Ngoài ra khi học Kafka, biết rằng nhiều chức năng của Kafka depends on ZooKeeper.

Mục đích bài này là giúp mọi người hiểu ZooKeeper chi tiết hơn một chút.

## ZooKeeper Introduction

### ZooKeeper Origin (Nguồn gốc)

Đoạn dưới đây từ chương 4 phần 1 của 《From Paxos to ZooKeeper》:

> ZooKeeper có nguồn gốc từ một research group của Yahoo Research. Lúc đó, researchers phát hiện rằng nhiều large-scale systems bên trong Yahoo đều cần rely on một similar system để distributed coordination, nhưng những systems này thường có distributed single-point problems. Vì vậy Yahoo developers đã cố gắng develop một general distributed coordination framework không có single-point problems.
>
> Về tên "ZooKeeper": Trong early stage của project, xem xét rằng nhiều internal projects trước đó đều dùng tên động vật (như Pig), Yahoo engineers muốn đặt tên động vật. Chief Scientist của Research Institute lúc đó là Raghu Ramakrishnan đùa: "Cứ như này, chỗ chúng ta thành vườn thú mất!" Nghe vậy mọi người nhất trí gọi là "Zoo Keeper" — vì các distributed components được đặt tên theo động vật đặt cạnh nhau trông như một large zoo, còn ZooKeeper chính xác là để coordinate distributed environment — và cái tên ZooKeeper ra đời như vậy.

### ZooKeeper Overview

ZooKeeper là một open-source **distributed coordination service**. Mục tiêu thiết kế là encapsulate những distributed consistency services phức tạp và dễ lỗi, tạo thành một efficient and reliable primitive set, và cung cấp cho users qua một series of simple interfaces.

ZooKeeper cung cấp high availability, high performance, stable distributed data consistency solutions. Thường được dùng để implement: data publish/subscribe, load balancing, naming service, distributed coordination/notification, cluster management, Master election, distributed lock và distributed queue. Những functions này mainly rely on **data storage + event listener** của ZooKeeper.

ZooKeeper lưu data trong memory nên performance rất tốt. Đặc biệt high performance trong applications "read" nhiều hơn "write" — vì "write" dẫn đến sync state giữa tất cả servers.

Top-level open source projects using ZooKeeper:

- **Kafka**: ZooKeeper mainly provides Broker và Topic registration và multi-Partition load balancing. Tuy nhiên, Kafka 2.8+ đã giới thiệu KRaft mode based on Raft protocol, không còn depends on ZooKeeper.
- **HBase**: ZooKeeper ensures only one Master in entire cluster và preserves regionserver state info.
- **Hadoop**: ZooKeeper provides high availability support cho Namenode.

### ZooKeeper Characteristics

- **Sequential Consistency**: Transaction requests from same client will be applied to ZooKeeper strictly in order.
- **Atomicity**: Processing results of all transaction requests are consistent across all machines in cluster.
- **Single System Image**: Regardless of which ZooKeeper server client connects to, it sees consistent server data model.
- **Reliability**: Once a change request is applied, results will be persisted until overwritten by next change.
- **High Availability**: 3~5 machines (preferably odd number) form a cluster. If fewer than half of machines fail, cluster remains available.

### ZooKeeper Application Scenarios

Typical application scenarios:

1. **Naming Service**: Can generate globally unique IDs through ZooKeeper sequential nodes.
2. **Data Publish/Subscribe**: **Watcher mechanism** conveniently implements data publish/subscribe. When you publish data to monitored ZooKeeper nodes, other machines can implement dynamic config updates by monitoring node changes.
3. **Distributed Lock**: Obtain distributed lock by creating unique node. Lock is released when holder completes code or crashes. See [Distributed Lock Details](https://javaguide.cn/distributed-system/distributed-lock.html).

## ZooKeeper Important Concepts

### Data Model

ZooKeeper data model uses a hierarchical multi-tree structure. Each node can store data (numbers, strings, or binary sequences). Each node can have N child nodes. The top is the root node represented by "/". Each data node in ZooKeeper is called a **znode** — the smallest data unit. Each znode has a unique path identifier.

**Important**: **ZooKeeper is mainly for coordination services, not for storing business data. Don't put large data in znodes — ZooKeeper's upper limit per node is 1MB.**

ZooKeeper node path format is similar to Unix filesystem paths.

![ZooKeeper Data Model](https://oss.javaguide.cn/github/javaguide/distributed-system/zookeeper/znode-structure.png)

### znode (Data Node)

Each data node in ZooKeeper is called a **znode**. We usually classify znodes into 4 types:

- **PERSISTENT node**: Created and persists even if ZooKeeper cluster crashes, until deleted.
- **EPHEMERAL node**: Lifetime bound to **client session**. **Session disappears, node disappears**. Ephemeral nodes can only be leaf nodes, cannot have child nodes.
- **PERSISTENT_SEQUENTIAL node**: In addition to PERSISTENT characteristics, child node names are sequential (e.g., `/node1/app0000000001`, `/node1/app0000000002`).
- **EPHEMERAL_SEQUENTIAL node**: In addition to EPHEMERAL characteristics, child node names are sequential.

Each znode consists of 2 parts:

- **stat**: Status information
- **data**: Specific content of stored data

znode status info:

| ZNode Status Info | Explanation                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| cZxid             | create ZXID — transaction ID when this data node was created                                                       |
| ctime             | create time — creation time                                                                                        |
| mZxid             | modified ZXID — transaction ID of last update                                                                      |
| mtime             | modified time — time of last update                                                                                |
| pZxid             | Transaction ID of last modification of child node list (only updates when child list changes, not content changes) |
| cversion          | Child node version — increments by 1 each time child nodes change                                                  |
| dataVersion       | Data node content version — 0 at creation, increments by 1 per content update                                      |
| aclVersion        | Node ACL version — number of ACL info changes                                                                      |
| ephemeralOwner    | sessionId of session that created ephemeral node; 0 if persistent node                                             |
| dataLength        | Data node content length                                                                                           |
| numChildren       | Number of child nodes of current node                                                                              |

### Version

For each znode, ZooKeeper maintains a **Stat** data structure recording 3 related versions:

- **dataVersion**: Version of current znode node
- **cversion**: Version of current znode child nodes
- **aclVersion**: Version of current znode's ACL

### ACL (Permission Control)

ZooKeeper uses ACL (AccessControlLists) strategy for permission control, similar to UNIX filesystem permissions.

5 permissions for znode operations:

- **CREATE**: Can create child nodes
- **READ**: Can get node data and list child nodes
- **WRITE**: Can set/update node data
- **DELETE**: Can delete child nodes
- **ADMIN**: Can set node ACL permissions

Note: **CREATE** and **DELETE** are permissions for **child nodes**.

Identity authentication methods:

- **world**: Default — all users have unconditional access.
- **auth**: No id used — represents any authenticated user.
- **digest**: Username:password authentication.
- **ip**: Restrict specified IPs.

### Watcher (Event Listener)

Watcher is a very important feature in ZooKeeper. ZooKeeper allows users to register Watchers on specified nodes. When specific events trigger, ZooKeeper server will notify interested clients. This mechanism is an important feature for ZooKeeper to implement distributed coordination services.

![ZooKeeper Watcher Mechanism](https://oss.javaguide.cn/github/javaguide/distributed-system/zookeeper/zookeeper-watcher.png)

### Session

Session can be seen as a TCP long connection between ZooKeeper server and client. Through this connection, client can maintain valid session with server via heartbeat detection, send requests and receive responses, and also receive Watcher event notifications.

Session has a `sessionTimeout` attribute representing the timeout duration. When client connection breaks due to server pressure, network failure, or client disconnect, as long as it can reconnect to any server in cluster within `sessionTimeout` period, the previously created session remains valid.

Before creating session for client, server first assigns a `sessionID` to each client. Since `sessionID` is an important identifier for ZooKeeper sessions, many session-related mechanisms are based on this `sessionID`, so it must be globally unique regardless of which server assigns it.

## ZooKeeper Cluster

For high availability, best to deploy ZooKeeper as a cluster. Usually 3 servers can form a ZooKeeper cluster.

![ZooKeeper Cluster Architecture](https://oss.javaguide.cn/github/javaguide/distributed-system/zookeeper/zookeeper-cluster.png)

Each Server represents a server with ZooKeeper service installed. Servers maintain current state in memory and communicate with each other. Data consistency is maintained across cluster through **ZAB Protocol (ZooKeeper Atomic Broadcast)**.

**Most typical cluster mode: Master/Slave mode**. Master server provides write service; Slave servers obtain latest data from Master through async replication to provide read service.

### ZooKeeper Cluster Roles

ZooKeeper introduces three roles: Leader, Follower, and Observer.

![ZooKeeper Cluster Roles](https://oss.javaguide.cn/github/javaguide/distributed-system/zookeeper/zookeeper-cluser-roles.png)

All machines in ZooKeeper cluster select a **Leader** through a **Leader election process**. Leader can provide both write and read services. **Follower** and **Observer** can only provide read services. Observer machines don't participate in Leader election or "majority write success" strategy, so they can improve cluster read performance without affecting write performance.

| Role     | Description                                                                                                                                                                |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Leader   | Provides read and write service to clients. Initiates and decides votes, updates system state.                                                                             |
| Follower | Provides read service to clients; forwards write requests to Leader. Participates in election voting.                                                                      |
| Observer | Provides read service to clients; forwards write requests to Leader. Does NOT participate in election voting or "majority write success" strategy. Added in ZooKeeper 3.3. |

### ZooKeeper Cluster Leader Election Process

When Leader server encounters network interruption, crash, restart or other anomalies, it enters Leader election process:

1. **Leader election phase**: All nodes are in election phase. A node that gets more than half of votes can become candidate leader.
2. **Discovery phase**: Followers communicate with candidate leader, syncing recently received transaction proposals.
3. **Synchronization phase**: Leader syncs all replicas in cluster using latest proposal history from previous phase. Candidate becomes real leader only after sync completes.
4. **Broadcast phase**: ZooKeeper cluster can officially provide transaction service. Leader can broadcast messages. New joining nodes also need to be synced.

Server states in ZooKeeper cluster:

- **LOOKING**: Searching for Leader.
- **LEADING**: Leader state — this node is Leader.
- **FOLLOWING**: Follower state — this node is Follower.
- **OBSERVING**: Observer state — this node doesn't participate in Leader election.

### Why ZooKeeper Cluster Needs Odd Number of Servers?

If n ZooKeeper servers are in cluster, remaining servers must be > n/2. 2n and 2n-1 have the same fault tolerance (n-1).

For 3 servers: can tolerate 1 failure. For 4 servers: also can only tolerate 1 failure.
For 5 servers: can tolerate 2 failures. For 6 servers: also can only tolerate 2 failures.

So why add that unnecessary extra ZooKeeper?

### Majority Mechanism Prevents Split-Brain

**What is cluster split-brain?**

In a cluster with machines in different data centers, if network connection between data centers fails, cluster splits into smaller clusters — each sub-cluster elects its own leader, causing "split-brain."

Example: 6-server cluster split across 2 data centers (3 each). When network breaks, each side thinks the other 3 are offline and elects its own leader. Without majority mechanism, 2 leaders exist when network recovers.

**How does majority mechanism prevent split-brain?**

ZooKeeper's majority mechanism makes it impossible to have 2 leaders because fewer than or equal to half cannot produce a leader. This ensures no split-brain regardless of how machines are distributed across data centers.

## ZAB Protocol and Paxos Algorithm

ZooKeeper didn't fully adopt Paxos algorithm. It uses ZAB protocol as its core algorithm for data consistency. ZAB is a crash-recoverable atomic broadcast protocol specifically designed for ZooKeeper.

### ZAB Protocol Modes

ZAB protocol has two basic modes:

- **Crash recovery**: When service framework starts, or when Leader server encounters network interruption/crash/restart, ZAB enters recovery mode and elects a new Leader. When new Leader elected and majority of machines have synced with new Leader, ZAB exits recovery mode.
- **Message broadcast**: When majority of Followers have synced with Leader, service framework enters message broadcast mode. New servers joining cluster will enter data recovery mode to find and sync with Leader before participating in message broadcast.

### Reference Articles

For ZAB Protocol and Paxos Algorithm:

- [Paxos Algorithm Details](https://javaguide.cn/distributed-system/protocol/paxos-algorithm.html)
- [ZAB Protocol Details](https://javaguide.cn/distributed-system/protocol/zab.html)
- [Raft Algorithm Details](https://javaguide.cn/distributed-system/protocol/raft-algorithm.html)

## ZooKeeper VS ETCD

[ETCD](https://etcd.io/) is a strongly consistent distributed key-value store. It uses [Raft algorithm](https://javaguide.cn/distributed-system/protocol/raft-algorithm.html) for consistency, implemented in Go.

Like ZooKeeper, ETCD can also be used for data publish/subscribe, load balancing, naming service, distributed coordination/notification, distributed lock, etc.

|                    | ZooKeeper                                                              | ETCD                                             |
| ------------------ | ---------------------------------------------------------------------- | ------------------------------------------------ |
| **Language**       | Java                                                                   | Go                                               |
| **Protocol**       | TCP                                                                    | gRPC                                             |
| **Interface**      | Must use its own client                                                | HTTP transport, accessible via curl etc.         |
| **Consensus**      | ZAB protocol                                                           | Raft algorithm                                   |
| **Watcher**        | Limited, one-time trigger                                              | One Watch can monitor all events                 |
| **Data model**     | Directory-based hierarchical                                           | Flat k-v model                                   |
| **Storage**        | k-v storage, ConcurrentHashMap, in-memory, not suitable for large data | k-v storage, bbolt engine, can handle several GB |
| **MVCC**           | Not supported                                                          | Supported via two B+ trees                       |
| **Global Session** | Has flaws                                                              | More flexible implementation                     |
| **Auth**           | ACL                                                                    | RBAC                                             |
| **Transactions**   | Simple transaction capability                                          | Only version number checking                     |
| **Deployment**     | Complex                                                                | Simple                                           |

ZooKeeper has limitations in storage performance, global session, Watcher mechanism. More and more open source projects are replacing ZooKeeper with Raft implementations.

ETCD is generally superior, providing more stable high-load read/write capability and fixing many ZooKeeper issues. ETCD can basically cover all ZooKeeper application scenarios as a replacement.

## Summary

1. ZooKeeper itself is a distributed program (as long as more than half of nodes are alive, ZooKeeper can function normally).
2. For high availability, best to deploy ZooKeeper as a cluster.
3. ZooKeeper stores data in memory, ensuring high throughput and low latency.
4. ZooKeeper is especially high performance in read-heavy applications.
5. ZooKeeper has ephemeral nodes concept — they exist as long as the creating client session is active.
6. ZooKeeper fundamentally provides only two functions: ① managing (storing, reading) user-submitted data; ② providing data node monitoring service.

## References

- 《From Paxos to ZooKeeper: Distributed Consistency Principles and Practice》
- ZooKeeper Limitations Discussion: <https://wingsxdu.com/posts/database/zookeeper-limitations/>

<!-- @include: @article-footer.snippet.md -->
