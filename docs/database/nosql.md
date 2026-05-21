---
title: Tổng hợp kiến thức cơ bản về NoSQL
description: Tổng hợp kiến thức cơ bản về NoSQL database, bao gồm sự khác biệt giữa NoSQL và SQL, ưu điểm của NoSQL, bốn loại NoSQL database (key-value, document, graph, wide-column) và tình huống sử dụng của các sản phẩm đại diện như Redis, MongoDB, Neo4j.
category: Cơ sở dữ liệu
tag:
  - NoSQL
  - MongoDB
  - Redis
head:
  - - meta
    - name: keywords
      content: NoSQL,Redis,MongoDB,HBase,Cassandra,key-value database,document database,graph database,wide-column storage,sự khác biệt SQL và NoSQL
---

## NoSQL là gì?

NoSQL (viết tắt của Not Only SQL) là thuật ngữ chỉ chung các database phi quan hệ, chủ yếu nhắm vào việc lưu trữ dữ liệu kiểu key-value, document và graph. Ngoài ra, NoSQL database tích hợp sẵn tính năng distributed, data redundancy và data sharding, nhằm cung cấp giải pháp lưu trữ dữ liệu có khả năng mở rộng, high availability và high performance.

Một hiểu lầm phổ biến là NoSQL database hay non-relational database không lưu trữ tốt relational data. Thực ra NoSQL database CÓ THỂ lưu relational data — chỉ là cách lưu khác với relational database.

Các đại diện NoSQL database: HBase, Cassandra, MongoDB, Redis.

![](https://oss.javaguide.cn/github/javaguide/database/mongodb/sql-nosql-tushi.png)

## SQL và NoSQL khác nhau như thế nào?

|                    | SQL Database                                                                                                       | NoSQL Database                                                                                                                                                                |
| :----------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data storage model | Structured storage — bảng với hàng và cột cố định                                                                  | Unstructured storage. Document: JSON document, Key-Value: cặp key-value, Wide-Column: bảng với hàng và cột động, Graph: node và edge                                          |
| Lịch sử phát triển | Phát triển từ thập niên 1970, tập trung giảm data redundancy                                                       | Phát triển cuối thập niên 2000, tập trung tăng scalability, giảm chi phí lưu trữ large-scale data                                                                             |
| Ví dụ              | Oracle, MySQL, Microsoft SQL Server, PostgreSQL                                                                    | Document: MongoDB, CouchDB; Key-Value: Redis, DynamoDB; Wide-Column: Cassandra, HBase; Graph: Neo4j, Amazon Neptune, Giraph                                                   |
| ACID properties    | Cung cấp Atomicity, Consistency, Isolation và Durability (ACID)                                                    | Thường không hỗ trợ ACID transaction — đánh đổi lấy scalability và high performance. Một số ít hỗ trợ như MongoDB. Tuy nhiên hỗ trợ ACID của MongoDB vẫn khác MySQL.          |
| Hiệu năng          | Thường phụ thuộc vào disk subsystem. Để đạt hiệu năng tốt nhất, thường cần tối ưu query, index và table structure. | Thường được quyết định bởi kích thước cluster hardware bên dưới, network latency và ứng dụng gọi.                                                                             |
| Mở rộng            | Vertical (scale up — dùng server mạnh hơn), read-write separation, database sharding                               | Horizontal (scale out — thêm server, thường dựa trên sharding mechanism)                                                                                                      |
| Mục đích sử dụng   | Lưu trữ dữ liệu cho các project cấp doanh nghiệp phổ thông                                                         | Đa dạng: ví dụ graph database hỗ trợ phân tích và duyệt qua mối quan hệ giữa connected data; key-value database xử lý được lượng dữ liệu lớn và state change tần suất cực cao |
| Query syntax       | SQL (Structured Query Language)                                                                                    | Syntax truy cập dữ liệu có thể khác nhau giữa các database                                                                                                                    |

## NoSQL Database có những ưu điểm gì?

NoSQL database rất phù hợp cho nhiều ứng dụng hiện đại như mobile, Web và game — những ứng dụng cần database linh hoạt, scalable, high performance và mạnh mẽ để cung cấp trải nghiệm người dùng xuất sắc.

- **Linh hoạt**: NoSQL database thường cung cấp schema linh hoạt để thực hiện iterative development nhanh hơn và nhiều hơn. Data model linh hoạt khiến NoSQL database trở thành lựa chọn lý tưởng cho semi-structured và unstructured data.
- **Khả năng mở rộng**: NoSQL database thường được thiết kế để scale out bằng cách dùng distributed hardware cluster, thay vì scale up bằng cách thêm server đắt tiền và mạnh hơn.
- **High performance**: NoSQL database được tối ưu cho các data model và access pattern cụ thể, đạt hiệu năng cao hơn so với dùng relational database để thực hiện chức năng tương tự.
- **Tính năng mạnh mẽ**: NoSQL database cung cấp API và data type mạnh mẽ, được xây dựng đặc biệt cho data model tương ứng.

## NoSQL Database có những loại nào?

NoSQL database chủ yếu chia thành bốn loại sau:

- **Key-Value**: Key-value database là loại database tương đối đơn giản, mỗi item chứa key và value. Đây là loại NoSQL database linh hoạt nhất vì ứng dụng có thể kiểm soát hoàn toàn nội dung lưu trong trường value, không có bất kỳ giới hạn nào. Redis và DynamoDB là hai key-value database rất phổ biến.
- **Document**: Dữ liệu trong document database được lưu trong các document tương tự object JSON (JavaScript Object Notation), rất rõ ràng trực quan. Mỗi document chứa các cặp field và value. Các value thường có thể là nhiều loại khác nhau bao gồm string, number, boolean, array hay object, và structure của chúng thường nhất quán với các object developer dùng trong code. MongoDB là document database rất phổ biến.
- **Graph**: Graph database được thiết kế để dễ dàng xây dựng và vận hành các ứng dụng làm việc với highly connected dataset. Tình huống sử dụng điển hình của graph database bao gồm social network, recommendation engine, fraud detection và knowledge graph. Neo4j và Giraph là hai graph database rất phổ biến.
- **Wide-Column**: Wide-column store database rất phù hợp cho việc cần lưu trữ lượng dữ liệu cực lớn. Cassandra và HBase là hai wide-column store database rất phổ biến.

Hình dưới đây có nguồn từ [Microsoft Official Documentation | Relational vs NoSQL data](https://learn.microsoft.com/en-us/dotnet/architecture/cloud-native/relational-vs-nosql-data).

![NoSQL Data Models](https://oss.javaguide.cn/github/javaguide/database/mongodb/types-of-nosql-datastores.png)

## Tài liệu tham khảo

- NoSQL là gì? - MongoDB official docs: <https://www.mongodb.com/zh-cn/nosql-explained>
- What is NoSQL? - AWS: <https://aws.amazon.com/cn/nosql/>
- NoSQL vs. SQL Databases - MongoDB official docs: <https://www.mongodb.com/zh-cn/nosql-explained/nosql-vs-sql>

<!-- @include: @article-footer.snippet.md -->
