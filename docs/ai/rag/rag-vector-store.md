---
title: Phân tích chi tiết thuật toán chỉ mục vector và cơ sở dữ liệu vector trong RAG
description: Phân tích chuyên sâu về lựa chọn và sử dụng cơ sở dữ liệu vector trong các tình huống RAG, bao gồm các thuật toán chỉ mục vector (HNSW, IVFFLAT), nguyên lý tìm kiếm xấp xỉ ANN, thực hành pgvector và các điểm phỏng vấn tần suất cao.
category: AI 应用开发
head:
  - - meta
    - name: keywords
      content: RAG,向量数据库,向量索引,HNSW,IVFFLAT,pgvector,ANN,Embedding,相似度搜索
---

Cách đây không lâu khi phỏng vấn một công ty lớn, người phỏng vấn hỏi tôi: "Hệ thống RAG của bạn thực hiện tìm kiếm vector như thế nào?", tôi trả lời: "Dùng MySQL lưu Embedding, khi truy vấn thì duyệt toàn bộ để tính độ tương đồng."

Không khí đột nhiên im lặng trong năm giây. Tôi thấy khóe miệng người phỏng vấn giật giật, mới nhận ra mình đã gặp vấn đề lớn — lúc đó knowledge base của chúng tôi có hơn 500 nghìn Chunk, mỗi lần truy vấn đều phải quét toàn bảng, thời gian phản hồi trung bình trên 3 giây, người dùng đã bỏ đi từ lâu rồi.

Sau khi bị trượt phỏng vấn mới hiểu: Cái đó gọi là "tìm kiếm vũ lực", còn giải pháp cấp độ sản xuất phải là **cơ sở dữ liệu vector + ANN index**.

Câu chuyện là câu chuyện, nhưng cơ sở dữ liệu vector thực sự là cơ sở hạ tầng cốt lõi của các ứng dụng RAG hiện nay, và cũng là điểm phỏng vấn tần suất cao khi phỏng vấn phát triển ứng dụng AI. Hôm nay Guide chia sẻ một số câu hỏi phỏng vấn liên quan đến cơ sở dữ liệu vector, hy vọng có ích cho mọi người:

1. ⭐️ Tại sao tình huống RAG cần cơ sở dữ liệu vector?
2. ⭐️ Thuật toán chỉ mục vector là gì?
3. Có những thuật toán chỉ mục vector nào?
4. ⭐️ Dự án của bạn sử dụng thuật toán chỉ mục vector nào?
5. Sự khác biệt giữa chỉ mục HNSW và chỉ mục IVFFLAT là gì?
6. Có những cơ sở dữ liệu vector nào?
7. ⭐️ Tại sao bạn chọn PostgreSQL + pgvector?
8. Tại sao không chọn MySQL kết hợp cơ sở dữ liệu vector?

## ⭐️ Tại sao tình huống RAG cần cơ sở dữ liệu vector?

RAG (Retrieval-Augmented Generation) cốt lõi là "tìm kiếm ngữ nghĩa" — chuyển đổi tài liệu và câu hỏi người dùng thành vector nhiều chiều (Embedding), sau đó tìm Top-K đoạn tương đồng nhất làm ngữ cảnh LLM. Cơ sở dữ liệu quan hệ truyền thống (MySQL, PostgreSQL gốc) hoặc công cụ tìm kiếm toàn văn bản (BM25 của ES) không thể hoàn thành việc này một cách hiệu quả, vì vậy phải giới thiệu cơ sở dữ liệu vector (hoặc cơ sở dữ liệu có mở rộng vector).

![Tại sao tình huống RAG cần cơ sở dữ liệu vector?](https://oss.javaguide.cn/github/javaguide/ai/rag/rag-why-need-vector-store.png)

### 1. Tìm kiếm độ tương đồng vector nhiều chiều

Embedding thường là vector dày đặc 768~3072 chiều, cơ sở dữ liệu truyền thống chỉ có thể dùng `=` hoặc `LIKE` để khớp chính xác, không thể tính "độ tương đồng cosine / tích trong / khoảng cách Euclidean".

**Tìm kiếm vũ lực**: Nếu dùng SQL duyệt toàn bảng để tính độ tương đồng, độ phức tạp là O(n). Lấy ví dụ 1 triệu vector 1024 chiều:

- Tính toán mỗi truy vấn: 1,000,000 × 1,024 phép nhân
- Độ trễ thực tế: **Cấp giây** (giá trị cụ thể phụ thuộc vào phần cứng)

Độ trễ cấp giây — hoàn toàn không chấp nhận được cho hệ thống hỏi đáp cần phản hồi thời gian thực.

**Tìm kiếm xấp xỉ ANN**: Cơ sở dữ liệu vector được thiết kế chuyên biệt cho tìm kiếm láng giềng gần nhất (ANN, Approximate Nearest Neighbor), thông qua điều hướng đồ thị hoặc phân chia không gian để giảm đáng kể số lần tính khoảng cách, đưa độ trễ tìm kiếm xuống **cấp mili giây**.

| Chỉ số                | Tìm kiếm vũ lực | Tìm kiếm chỉ mục ANN                                         |
| --------------------- | --------------- | ------------------------------------------------------------ |
| Độ phức tạp thời gian | O(n)            | Chỉ mục đồ thị ≈ O(log n), chỉ mục cụm ≈ O(nprobe × n/nlist) |
| Độ trễ 1 triệu vector | Cấp giây        | Cấp mili giây                                                |
| Tỷ lệ thu hồi         | 100%            | 95-99%                                                       |
| Cải thiện tốc độ      | Cơ sở           | **100-200 lần**                                              |

> Lưu ý: Độ trễ trong bảng trên là mô tả theo cấp độ, hiệu suất thực tế phụ thuộc vào thông số phần cứng, tải đồng thời, tham số chỉ mục (như `ef_search`, `nprobe`), nên tham khảo [ann-benchmarks.com](https://ann-benchmarks.com) để kiểm chứng trong môi trường mục tiêu.

Dùng chưa đến 5% tổn thất tỷ lệ thu hồi, đổi lấy cải thiện tốc độ hơn 100 lần — đây là giá trị của chỉ mục.

### 2. Khả năng chịu tải dữ liệu quy mô lớn

Knowledge base RAG thường có hàng trăm nghìn đến hàng tỷ Chunk, cơ sở dữ liệu vector hỗ trợ **lưu trữ lâu dài vector cấp tỷ** + cập nhật gia tăng + phân mảnh, trong khi DB truyền thống sau khi lưu vector về cơ bản không thể mở rộng.

### 3. Sự khác biệt bản chất giữa tìm kiếm ngữ nghĩa và tìm kiếm từ khóa

| Phương thức tìm kiếm          | Nguyên lý                                   | Hạn chế                                                         |
| ----------------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| **BM25 từ khóa**              | Khớp chữ nghĩa, dựa trên thống kê tần số từ | Hỏng khi gặp từ đồng nghĩa/diễn giải lại ("退货" vs "退款流程") |
| **Tìm kiếm ngữ nghĩa vector** | Embedding nắm bắt độ tương đồng ngữ nghĩa   | Hiểu từ đồng nghĩa, ngữ cảnh, ý định ngầm định                  |

**Chiến lược Chunking của tài liệu (quy tắc cắt và độ chồng lấp) cùng với mô hình Embedding cùng nhau quyết định trần lý thuyết của recall ngữ nghĩa**, còn cơ sở dữ liệu vector chịu trách nhiệm hiện thực hóa trần đó trong độ trễ có thể chấp nhận được.

**Khả năng thiết yếu cấp sản xuất**:

- Hỗ trợ **lọc metadata** (như `WHERE category='Java' AND version>='v2'`) + truy vấn kết hợp độ tương đồng vector
- **Tìm kiếm kết hợp (Hybrid Search)**: Hợp nhất vector + BM25 + RRF (một trong những giải pháp thường dùng trong môi trường sản xuất)
- **Cập nhật động**: Hỗ trợ ghi gia tăng. Nhưng cần lưu ý: HNSW trong các tình huống xóa/cập nhật tần suất cao, vector bị xóa tồn tại dưới dạng "đánh dấu xóa", dead nodes tích lũy sẽ khiến tỷ lệ thu hồi giảm theo thời gian, cần định kỳ dọn dẹp thông qua cơ chế `REINDEX` hoặc vacuuming, và theo dõi tỷ lệ thu hồi thực tế
- **Cách ly quyền/đa tenant**: Bắt buộc trong RAG cấp doanh nghiệp

## ⭐️ Thuật toán chỉ mục vector là gì?

Thuật toán chỉ mục vector là cốt lõi của cơ sở dữ liệu vector, nhiệm vụ cốt lõi của nó là giải quyết một bài toán toán học khó: Làm thế nào để **cực nhanh** tìm ra những vector **tương đồng nhất** với vector truy vấn đã cho trong **biển vector nhiều chiều khổng lồ**.

Bản chất của nó là nghệ thuật **phân chia không gian và tổ chức dữ liệu**. Nếu không có chỉ mục, để tìm một vector tương đồng, chúng ta phải so sánh tất cả vector trong cơ sở dữ liệu, gọi là **tìm kiếm vũ lực**. Ở quy mô dữ liệu hàng triệu, hàng tỷ, độ trễ của phương pháp này là thảm họa.

Mục tiêu của chỉ mục vector là thông qua việc tổ chức dữ liệu trước, cho phép chúng ta khi truy vấn có thể **thông minh bỏ qua phần lớn vector không liên quan**, chỉ so sánh chính xác trong một tập ứng viên rất nhỏ.

Dùng ví dụ từ cuộc sống:

- **Không có chỉ mục** = Tìm một người bằng cách gõ cửa từng nhà trong cả thành phố
- **Có chỉ mục** = Trước tiên xác định ở quận nào → phố nào → tòa nhà nào → định vị nhanh chóng

Trong thực tế, thuật toán chỉ mục vector chủ yếu chia thành hai loại lớn:

![Phân loại thuật toán chỉ mục vector](/Users/guide/Downloads/rag-vector-index-algorithms.png)

Khi chúng ta nói về chỉ mục vector, tuyệt đại đa số thời gian nói đến là **thuật toán ANN**.

Chọn và tinh chỉnh một chỉ mục ANN phù hợp là yếu tố quan trọng quyết định hiệu suất và chi phí cuối cùng của hệ thống RAG hoặc tìm kiếm vector, cải thiện hiệu suất có thể đạt hàng trăm thậm chí hàng nghìn lần.

### 1. Thuật toán Láng giềng gần nhất chính xác (Exact Nearest Neighbor, ENN)

- **Mục tiêu:** Đảm bảo **100%** tìm được vector tương đồng nhất.
- **Đại diện:** Các cấu trúc cây không gian truyền thống như KD-Tree, VP-Tree.
- **Vấn đề:** Chúng hoạt động tốt trong không gian chiều thấp (ví dụ dưới 10 chiều), nhưng trong **không gian chiều cao** hàng trăm đến hàng nghìn chiều trong lĩnh vực AI, hiệu suất của chúng suy giảm mạnh, gặp phải **lời nguyền chiều** (curse of dimensionality), cuối cùng thoái hóa thành hiệu suất tương đương tìm kiếm vũ lực.

### 2. Thuật toán Láng giềng gần nhất xấp xỉ (Approximate Nearest Neighbor, ANN)

- **Mục tiêu:** Đây là cốt lõi của tìm kiếm vector hiện đại. Nó thực hiện một **đánh đổi kỹ thuật** rất thông minh: **từ bỏ 100% độ chính xác, đổi lấy cải thiện tốc độ truy vấn lên nhiều cấp độ**. Nó không đảm bảo nhất định tìm được vector tương đồng nhất, nhưng đảm bảo với xác suất rất cao (ví dụ 99%) vector tìm được cũng đã đủ tương đồng.
- **Đại diện:** Các thuật toán này là trào lưu chính hiện nay, chủ yếu có ba trường phái:
  - **Dựa trên đồ thị (Graph-based):** Như **HNSW**. Nó tổ chức vector thành mạng đồ thị nhiều lớp phức tạp, khi truy vấn di chuyển trên đồ thị như định vị đường đi, tốc độ cực nhanh, tỷ lệ thu hồi rất cao, là một trong những thuật toán có hiệu suất tổng hợp tốt nhất hiện tại.
  - **Dựa trên lượng tử hóa (Quantization-based):** Như **IVF_PQ**. Nó nén lượng lớn vector thành dữ liệu rất nhỏ thông qua kỹ thuật phân cụm và nén, giảm đáng kể mức tiêu thụ bộ nhớ, rất phù hợp cho các tình huống siêu quy mô lớn.
  - **Dựa trên hashing (Hashing-based):** Như **LSH**. Nó dùng hàm băm đặc biệt để các vector tương đồng có xác suất cao rơi vào cùng một bucket băm, thu hẹp phạm vi tìm kiếm.

## Có những thuật toán chỉ mục vector nào?

Trong cơ sở dữ liệu vector và các ứng dụng RAG (tạo sinh tăng cường bằng truy xuất), thuật toán chỉ mục trực tiếp quyết định tỷ lệ thu hồi, độ trễ phản hồi và tiêu thụ tài nguyên của hệ thống.

Ở đây cần phân biệt hai khái niệm cấp độ:

| Cấp độ                        | Ví dụ                       | Giải thích                                                               |
| ----------------------------- | --------------------------- | ------------------------------------------------------------------------ |
| **Cơ sở dữ liệu vector**      | Milvus, Qdrant, pgvector    | Hệ thống hoàn chỉnh chịu trách nhiệm lưu trữ, tìm kiếm và quản lý vector |
| **Thuật toán chỉ mục hỗ trợ** | HNSW, IVF-PQ, IVFFLAT, Flat | Triển khai nội bộ quyết định hiệu suất tìm kiếm và tỷ lệ thu hồi         |

**Tổng quan các thuật toán chỉ mục chủ lưu**:

| Tên thuật toán                   | Cơ chế nguyên lý                            | Ưu điểm cốt lõi                                    | Nhược điểm chính                                      | Quy mô dữ liệu phù hợp |
| -------------------------------- | ------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------- | ---------------------- |
| **Flat (tìm kiếm vũ lực)**       | Duyệt tất cả vector tính khoảng cách        | 100% chính xác không tổn hao                       | Độ phức tạp O(n), truy vấn cực chậm                   | < 10 vạn               |
| **HNSW (chỉ mục đồ thị)**        | Đồ thị thế giới nhỏ phân cấp                | Truy vấn cực nhanh, tỷ lệ thu hồi cực cao          | Tiêu thụ bộ nhớ khổng lồ, xây dựng tốn thời gian      | 10 vạn - 1000 vạn      |
| **IVFFLAT (phân cụm đảo ngược)** | Phân cụm + bucket chỉ mục đảo ngược         | Hiệu quả bộ nhớ cao, xây dựng nhanh                | Cần huấn luyện trước, tỷ lệ thu hồi thấp hơn một chút | 1000 vạn - 1 tỷ        |
| **IVF-PQ (lượng tử hóa tích)**   | Phân cụm + nén vector cực độ                | Hỗ trợ dữ liệu siêu lớn, chi phí cực thấp          | Tổn thất độ chính xác lớn hơn                         | > 1 tỷ                 |
| **IVF_RABITQ**                   | Phân cụm + lượng tử hóa bit xoay ngẫu nhiên | Tiêu thụ bộ nhớ cực thấp, tỷ lệ thu hồi tốt hơn PQ | Thuật toán mới, hỗ trợ hệ sinh thái hạn chế           | > 1 tỷ                 |

> **Về IVF_RABITQ**: Đây là thuật toán lượng tử hóa thế hệ mới được đề xuất năm 2024, đổi mới cốt lõi là **Random Rotation (xoay ngẫu nhiên) + Bit Quantization (lượng tử hóa bit)**. So với PQ truyền thống cắt vector thành sub-vector rồi phân cụm riêng, RABITQ trước tiên xoay ngẫu nhiên vector để phân phối các chiều đều hơn, sau đó lượng tử hóa mỗi chiều thành 1 bit (chỉ giữ bit dấu). Thiết kế này trong khi duy trì tỷ lệ thu hồi cao, nén bộ nhớ xuống 1/32 so với vector gốc, và tính toán khoảng cách có thể sử dụng phép toán bit để tăng tốc hiệu quả. Trong Milvus 2.5+ đã được cung cấp dưới dạng loại chỉ mục `IVF_RABITQ`.

## ⭐️ Dự án của bạn sử dụng thuật toán chỉ mục vector nào?

> Ở đây lấy dự án [《SpringAI Nền tảng Phỏng vấn Thông minh + Knowledge Base RAG》](https://javaguide.cn/zhuanlan/interview-guide.html) làm ví dụ.

Trong dự án của chúng tôi, sử dụng **pgvector extension của PostgreSQL**, và cấu hình **HNSW index**.

**Tại sao chọn HNSW?** Vì ở quy mô dữ liệu **cấp triệu**, HNSW đạt được sự cân bằng tốt nhất giữa **tốc độ tìm kiếm, tỷ lệ thu hồi và mức tiêu thụ bộ nhớ**.

Chúng ta có thể hiểu HNSW như một **mạng lưới đường cao tốc nhiều lớp**:

![Kiến trúc chỉ mục HNSW](https://oss.javaguide.cn/github/javaguide/ai/rag/rag-hnsw-architecture.png)

**Cơ chế cốt lõi:**

1. **Xây dựng phân cấp:** Cấp độ cao nhất của node được quyết định bởi công thức `level = floor(-ln(random()) * mL)`, trong đó `mL` là hệ số nhân cấp độ. Điều này làm cho số node ở các cấp cao hơn **giảm theo cấp số nhân**, tạo thành cấu trúc "kim tự tháp".
2. **Tìm kiếm tham lam**: Tìm kiếm bắt đầu từ lớp trên cùng, mỗi lớp đều tham lam di chuyển đến node láng giềng gần nhất với điểm truy vấn.
3. **Từ thô đến tinh**: Lớp trên dùng để nhanh chóng định vị vùng ngữ nghĩa, lớp dưới dùng để thực hiện tìm kiếm chính xác.

Cách tìm kiếm "từ thô đến tinh" này có thể nhanh chóng định vị vector láng giềng gần nhất mà không cần so sánh từng điểm như tìm kiếm vũ lực.

**Bản chất của HNSW là thuật toán láng giềng gần nhất xấp xỉ (ANN)**, có nghĩa là để theo đuổi tốc độ cực hạn, **nó không thể đảm bảo 100% tỷ lệ thu hồi**. Nhưng trong thực tế, thông qua điều chỉnh tham số, tỷ lệ thu hồi có thể đạt trên 99%, hoàn toàn đủ dùng cho ứng dụng RAG.

**Tham số tinh chỉnh:**

- **m**: Số kết nối tối đa của mỗi node. Giá trị `m` càng lớn, đồ thị càng dày đặc, tỷ lệ thu hồi càng cao, nhưng tăng thời gian xây dựng và tiêu thụ bộ nhớ.
- **ef_construction**: Phạm vi tìm kiếm khi xây dựng chỉ mục. Giá trị này càng lớn, chất lượng chỉ mục càng cao, nhưng xây dựng càng chậm.
- **ef_search**: Phạm vi tìm kiếm khi truy vấn. Đây là tham số thời gian chạy quan trọng nhất, ảnh hưởng trực tiếp đến **sự cân bằng giữa tốc độ truy vấn và tỷ lệ thu hồi**.

**Xem xét khả năng mở rộng:**

HNSW là chỉ mục tiêu thụ bộ nhớ rất nhiều. Nếu quy mô dữ liệu trong tương lai tăng lên **hàng chục triệu thậm chí hàng tỷ**, hoặc có yêu cầu cao hơn về thông lượng ghi, mức tiêu thụ bộ nhớ và chi phí xây dựng của HNSW có thể trở thành nút cổ chai.

Lúc đó có thể xem xét chuyển sang chỉ mục **IVFFLAT**. IVFFLAT dựa trên ý tưởng **chỉ mục đảo ngược**, thu hẹp phạm vi tìm kiếm bằng cách phân cụm không gian vector thành nhiều bucket. Hoặc giới thiệu **Milvus** và các cơ sở dữ liệu vector chuyên nghiệp khác, chúng cung cấp giải pháp chuyên nghiệp hơn trong các tình huống phân tán, quy mô lớn.

**Lưu ý hành vi lọc:**

HNSW index của pgvector 0.5+ khi thực thi lọc metadata, áp dụng **chiến lược lọc hỗn hợp**: điều kiện lọc được đánh giá song song trong quá trình quét chỉ mục, không phải lọc hoàn toàn sau. Nhưng nếu điều kiện lọc quá nghiêm ngặt, vẫn có thể dẫn đến kết quả cuối cùng ít hơn nhiều so với kỳ vọng Top-K.

Ví dụ, truy vấn "trả về 10 tài liệu tương đồng có `category='Java'`", nếu chỉ có 3 bản ghi trong tập ứng viên thỏa mãn điều kiện, thì chỉ trả về 3. Các giải pháp bao gồm:

1. **Tăng tập ứng viên**: Đặt `ef_search` hoặc `LIMIT` lớn hơn, để nhiều ứng viên hơn vào giai đoạn lọc
2. **Pre-filtering (Lọc trước)**: Lọc theo metadata trước rồi mới tìm kiếm vector, nhưng có thể dẫn đến chỉ mục bị vô hiệu hóa, thoái hóa thành tìm kiếm vũ lực
3. **Partial Index (Chỉ mục một phần)**: PostgreSQL hỗ trợ HNSW index có điều kiện, như `CREATE INDEX ... WHERE category = 'Java'`, nhưng cần tạo chỉ mục độc lập cho mỗi điều kiện lọc phổ biến

## Sự khác biệt giữa chỉ mục HNSW và chỉ mục IVFFLAT là gì?

Sự khác biệt cốt lõi giữa hai loại là: một loại dùng tính liên thông của **"đồ thị"** để tìm láng giềng, loại kia dùng **"phân cụm"** để thu hẹp phạm vi tìm kiếm.

**HNSW (chỉ mục đồ thị)**

- **Nguyên lý**: Xây dựng cấu trúc đồ thị nhiều lớp, truy vấn như di chuyển trên "đường cao tốc", trước tiên nhảy bước lớn, sau đó tìm kiếm tinh tế cục bộ
- **Ưu điểm**: Tốc độ tìm kiếm cực nhanh, tỷ lệ thu hồi rất ổn định và cao
- **Nhược điểm**: "Tiêu thụ bộ nhớ lớn", ngoài vector gốc còn cần lưu trữ nhiều quan hệ kết nối giữa các node; xây dựng chỉ mục rất chậm

**IVFFLAT (phân cụm đảo ngược)**

- **Nguyên lý**: Dùng K-Means để chia không gian vector thành nhiều bucket, khi truy vấn trước tiên tìm một vài bucket gần nhất, chỉ tìm kiếm vũ lực trong bucket
- **Ưu điểm**: Thân thiện với bộ nhớ, cấu trúc đơn giản, tốc độ xây dựng chỉ mục nhanh hơn HNSW **4-32 lần** (phụ thuộc vào tham số `nlist` và phần cứng)
- **Nhược điểm**: Tốc độ tìm kiếm chậm hơn HNSW một chút (trong yêu cầu độ chính xác cao); nếu phân phối dữ liệu thay đổi, cần huấn luyện lại tâm cụm

| Đặc điểm                  | HNSW (chỉ mục đồ thị)                                   | IVFFLAT (phân cụm đảo ngược)                              |
| ------------------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| **Nguyên lý nền tảng**    | Cấu trúc đồ thị thế giới nhỏ phân cấp                   | Cấu trúc phân cụm + bucket đảo ngược                      |
| **Tốc độ truy vấn**       | **Cực nhanh**                                           | Trung bình                                                |
| **Tiêu thụ bộ nhớ**       | **Cực cao** (vector gốc + con trỏ kết nối đồ thị)       | Trung bình (vector gốc + tâm cụm), thấp hơn HNSW          |
| **Tốc độ xây dựng**       | Chậm (cần chèn node từng cái)                           | **Nhanh hơn 4-32 lần** (phụ thuộc vào huấn luyện K-Means) |
| **Tính động của dữ liệu** | Thêm gia tăng thuận tiện, nhưng xóa cần REINDEX định kỳ | Nên huấn luyện toàn bộ, nếu không độ chính xác giảm       |
| **Quy mô phù hợp**        | 10 vạn - 1000 vạn                                       | 1000 vạn - 1 tỷ                                           |

**Làm thế nào để chọn?**

- **Chọn HNSW**: Dữ liệu ở cấp độ triệu, theo đuổi phản hồi tốc độ mili giây, và bộ nhớ server đủ
- **Chọn IVFFLAT**: Dữ liệu đến hàng chục triệu thậm chí hàng tỷ, hoặc tài nguyên bộ nhớ hạn chế, có thể chấp nhận độ trễ truy vấn dài hơn một chút

## Có những cơ sở dữ liệu vector nào?

Đối với việc lựa chọn cơ sở dữ liệu vector, phù hợp với dự án mới là tốt nhất, không có viên đạn bạc!

**Loại 1: Mở rộng cơ sở dữ liệu truyền thống**

- **Đại diện:** Plugin **PostgreSQL + pgvector** (lựa chọn trưởng thành nhất, đã được kiểm chứng trong môi trường sản xuất), **MongoDB Atlas Vector Search** (mở rộng vector trong lĩnh vực NoSQL)
- **Ưu điểm cốt lõi:**
  - **Thống nhất technology stack:** Không cần giới thiệu hệ thống cơ sở dữ liệu mới, giảm độ phức tạp vận hành
  - **Tính nhất quán giao dịch:** Dữ liệu vector và dữ liệu nghiệp vụ có thể được quản lý trong cùng một giao dịch, đảm bảo tính ACID
  - **Chi phí học tập thấp:** Kiến thức SQL hiện có của đội nhóm có thể tái sử dụng
  - **Truy vấn kết hợp tiện lợi:** Có thể dễ dàng kết hợp điều kiện lọc SQL với tìm kiếm vector
- **Tình huống áp dụng:** Lựa chọn hàng đầu trong **giai đoạn đầu dự án hoặc dự án vừa và nhỏ**. Đặc biệt khi dữ liệu nghiệp vụ (như metadata tài liệu) và dữ liệu vector cần **tính nhất quán mạnh**, có thể được quản lý trong **cùng một giao dịch**, ưu thế của nó rất lớn. Nó giảm đáng kể độ phức tạp của technology stack và chi phí vận hành, đối với đội nhóm đang sử dụng PG, đường cong học tập gần như bằng không.

**Loại 2: Tiến hóa từ công cụ tìm kiếm**

- **Đại diện:** Elasticsearch, OpenSearch (nhánh ES được AWS duy trì, chức năng vector tiếp tục được nâng cao).
- **Ưu điểm cốt lõi:**
  - **Khả năng Hybrid Search mạnh:** Có thể kết hợp liền mạch tìm kiếm từ khóa BM25 và tìm kiếm ngữ nghĩa vector
  - **Khả năng tìm kiếm toàn văn bản:** Xử lý văn bản dài, hỗ trợ highlight, phân tách từ và các tính năng tìm kiếm truyền thống
  - **Kiến trúc phân tán trưởng thành:** Khả năng mở rộng ngang mạnh
  - **Phân tích tổng hợp phong phú:** Hỗ trợ facet, aggregation và các chức năng phân tích
- **Tình huống áp dụng:** Cần hỗ trợ đồng thời tìm kiếm từ khóa và ngữ nghĩa; tình huống truy vấn kết hợp như tìm kiếm thương mại điện tử, tìm kiếm tài liệu; đội nhóm có technology stack ES sẵn; tình huống cần lọc phức tạp và tổng hợp.

**Loại 3: Cơ sở dữ liệu vector chuyên biệt gốc**

- **Đại diện:** **Milvus** (đầy đủ chức năng nhất, cộng đồng lớn nhất), **Weaviate** (tích hợp module AI, hỗ trợ truy vấn GraphQL, dễ sử dụng), **Qdrant** (viết bằng Rust, hiệu quả bộ nhớ cao, hỗ trợ bộ lọc phong phú).
- **Ưu điểm cốt lõi:**
  - **Tối ưu hóa chuyên dụng cho vector:** Hỗ trợ nhiều thuật toán chỉ mục (HNSW, IVF, LSH, ...)
  - **Khả năng quy mô hóa:** Có thể xử lý vector cấp tỷ
  - **Hiệu suất cực hạn:** Quản lý bộ nhớ và tối ưu hóa chỉ mục chuyên biệt
  - **Chức năng phong phú:** Hỗ trợ nhiều phép đo khoảng cách, cập nhật động, chỉ mục gia tăng, ...
- **Tình huống áp dụng:** Khi quy mô dữ liệu vector của chúng ta đạt **hàng tỷ thậm chí cao hơn**, hoặc có yêu cầu rất khắt khe về **QPS và độ trễ**, các cơ sở dữ liệu vector chuyên nghiệp này thường cung cấp hiệu suất tốt hơn và chức năng phong phú hơn pgvector (như thuật toán chỉ mục tiên tiến hơn, phân vùng dữ liệu, đa tenant, ...). Tất nhiên, chọn con đường này cũng có nghĩa là chúng ta cần đầu tư nhiều hơn vào **chi phí vận hành và học tập**.

**Loại 4: Dịch vụ cơ sở dữ liệu vector được quản lý trên đám mây**

- **Đại diện:** **Pinecone** (người tiên phong và dẫn đầu thị trường), **Zilliz Cloud** (phiên bản thương mại của Milvus), **Weaviate Cloud**, ...
- **Ưu điểm cốt lõi:**
  - **Ít vận hành:** Dịch vụ hoàn toàn quản lý, tự động mở rộng/thu hẹp (vẫn cần cấu hình tham số chỉ mục và theo dõi tỷ lệ thu hồi)
  - **Đảm bảo khả năng sẵn sàng cao:** SLA thường 99.9%+
  - **Triển khai nhanh:** Có thể bắt đầu sử dụng trong vài phút
  - **Tính toán đàn hồi:** Tính tiền theo mức sử dụng thực tế
- **Tình huống áp dụng:** Đối với đội nhóm **muốn ra mắt nhanh, mong muốn giảm gánh nặng vận hành và ngân sách đủ**, đây là lựa chọn rất hấp dẫn. Nó cho phép chúng ta tập trung toàn bộ tâm huyết vào logic nghiệp vụ của ứng dụng AI, mà không cần quan tâm đến chi tiết vận hành cơ sở dữ liệu nền tảng.

## ⭐️ Tại sao bạn chọn PostgreSQL + pgvector?

Ở đây lấy dự án [《SpringAI Nền tảng Phỏng vấn Thông minh + Knowledge Base RAG》](https://javaguide.cn/zhuanlan/interview-guide.html) làm ví dụ. Dự án này cần lưu trữ đồng thời dữ liệu có cấu trúc (hồ sơ, bản ghi phỏng vấn) và dữ liệu vector (tài liệu Embedding).

**So sánh các phương án**:

| Phương án               | Ưu điểm                                                | Nhược điểm                                    | Quy mô phù hợp   |
| ----------------------- | ------------------------------------------------------ | --------------------------------------------- | ---------------- |
| PostgreSQL + pgvector   | Một cơ sở dữ liệu giải quyết tất cả, vận hành đơn giản | Hiệu suất giảm rõ rệt trên cấp triệu          | < 100 vạn vector |
| PostgreSQL + Milvus     | Hiệu suất tìm kiếm vector tốt hơn                      | Thêm một component, độ phức tạp vận hành tăng | 100 vạn - 10 tỷ  |
| Pinecone / Zilliz Cloud | Hoàn toàn quản lý, ít vận hành                         | Chi phí cao, dữ liệu ở bên thứ ba             | Quy mô bất kỳ    |

**Lý do chọn pgvector**:

- **Kiến trúc đơn giản**: Không giới thiệu component thêm, giảm độ phức tạp triển khai và vận hành.
- **Hiệu suất đủ dùng**: HNSW index hỗ trợ tìm kiếm cấp mili giây, hoàn toàn đủ dùng cho tình huống tài liệu dưới cấp triệu.
- **Tính nhất quán giao dịch**: Dữ liệu vector và dữ liệu nghiệp vụ trong cùng cơ sở dữ liệu, hỗ trợ giao dịch tự nhiên.
- **Truy vấn SQL**: Có thể kết hợp điều kiện lọc WHERE (lưu ý: điều kiện lọc có thể làm chỉ mục vector bị vô hiệu hóa, cần kiểm tra execution plan).

```sql
-- pgvector 余弦相似度搜索示例
-- <=> 是余弦距离运算符（0 = 完全相同，2 = 完全相反）
-- 余弦相似度 = 1 - 余弦距离
SELECT content, 1 - (embedding <=> $1) as cosine_similarity
FROM vector_store
WHERE metadata->>'category' = 'Java'
ORDER BY embedding <=> $1  -- 按距离升序，越小越相似
LIMIT 5;

-- ⚠️ 关键前提：查询时使用的距离运算符必须与创建 HNSW 索引时指定的
-- operator class（例如 vector_cosine_ops）严格保持一致，否则查询将
-- 无法命中索引，直接退化为全表扫描。
-- 验证方式：EXPLAIN ANALYZE 检查执行计划是否包含 Index Scan。
```

## Tại sao không chọn MySQL kết hợp cơ sở dữ liệu vector?

Ưu thế lớn nhất của PostgreSQL, cũng là "át chủ bài" giúp nó bỏ xa đối thủ trong kỷ nguyên AI, là khả năng mở rộng mạnh mẽ của nó. Lập trình viên có thể cài đặt các plugin chức năng khác nhau cho cơ sở dữ liệu mà không cần sửa đổi kernel:

- **Tìm kiếm vector AI**: Extension **pgvector** (được khuyến nghị chính thức, hiệu suất trong tình huống cấp triệu tiếp cận thư viện vector chuyên nghiệp)
- **Tìm kiếm toàn văn bản**: Tích hợp `tsvector` (nhu cầu cơ bản), hoặc extension **pg_bm25** (nhu cầu nâng cao)
- **Dữ liệu thời gian thực**: Extension **TimescaleDB**
- **Thông tin địa lý**: Extension **PostGIS** (tiêu chuẩn ngành)

Khả năng "một cửa" này có nghĩa là nhiều dự án không cần phụ thuộc vào các middleware bên ngoài như Elasticsearch, Milvus, chỉ cần một PostgreSQL là có thể đáp ứng các nhu cầu đa dạng, từ đó đơn giản hóa technology stack.

**Lưu ý**: Dòng MySQL 8.x (bao gồm 8.4 LTS) không có hỗ trợ vector chính thức. MySQL 9.0 (phát hành tháng 7 năm 2024) mới chính thức giới thiệu kiểu dữ liệu `VECTOR` và các hàm vector như `STRING_TO_VECTOR`, `VECTOR_TO_STRING`, nhưng hiện tại chưa hỗ trợ chỉ mục vector (ANN), chỉ có thể thực hiện tính toán vũ lực. Mức độ trưởng thành hệ sinh thái và các trường hợp kiểm chứng sản xuất ít hơn nhiều so với pgvector. Nếu dự án đã bị ràng buộc sâu với hệ sinh thái MySQL, có thể xem xét giải pháp cơ bản MySQL 9.0+ (quy mô nhỏ) hoặc kết hợp MySQL + thư viện vector bên ngoài.

![Cột VECTOR không thể được dùng như bất kỳ loại khóa nào, bao gồm primary key, foreign key, unique key và partition key](https://oss.javaguide.cn/github/javaguide/ai/rag/mysql9-vector-cannot-be-used-as-any-type-of-key.png)

Về so sánh chi tiết giữa MySQL và PostgreSQL, có thể tham khảo bài viết tôi đã viết: [MySQL vs PostgreSQL, nên chọn cái nào?](https://mp.weixin.qq.com/s/APWD-PzTcTqGUuibAw7GGw).

## ⭐️ Thêm câu hỏi phỏng vấn RAG tần suất cao

Nội dung trên được trích từ hướng dẫn dự án thực hành của [hành tinh](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html) của tôi: [《SpringAI Nền tảng Phỏng vấn Thông minh + Knowledge Base RAG》](https://javaguide.cn/zhuanlan/interview-guide.html). Sắp xếp nội dung như sau (đã hoàn thành, tổng cộng hơn 13 vạn chữ)

![Tổng quan nội dung hướng dẫn](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/tutorial-overview.png)

Hai bài câu hỏi phỏng vấn Spring AI và RAG cộng lại gần 60 câu hỏi, tập trung vào sự toàn diện!

![Câu hỏi phỏng vấn RAG](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/rag-interview-questions.png)

**Địa chỉ dự án** (Chào mừng Star để ủng hộ):

- Github：<https://github.com/Snailclimb/interview-guide>
- Gitee：<https://gitee.com/SnailClimb/interview-guide>

Toàn bộ code hoàn chỉnh hoàn toàn miễn phí và mã nguồn mở, không có phiên bản Pro hay phiên bản trả tiền!

## Tổng kết

Cơ sở dữ liệu vector là cơ sở hạ tầng cốt lõi của hệ thống RAG, lựa chọn thuật toán chỉ mục vector và phương án cơ sở dữ liệu phù hợp trực tiếp quyết định hiệu suất và chi phí của hệ thống. Qua bài viết này, chúng ta đã hệ thống hóa kiến thức cốt lõi về cơ sở dữ liệu vector:

**Tổng kết các điểm cốt lõi**:

1. **Tại sao cần cơ sở dữ liệu vector**: Cơ sở dữ liệu truyền thống không thể xử lý hiệu quả tìm kiếm độ tương đồng vector nhiều chiều, ANN index có thể đưa độ trễ tìm kiếm từ cấp giây xuống cấp mili giây
2. **Thuật toán chỉ mục chủ lưu**:
   - Flat: Tìm kiếm vũ lực, 100% chính xác nhưng chậm
   - HNSW: Chỉ mục đồ thị, truy vấn cực nhanh, tiêu thụ bộ nhớ lớn
   - IVFFLAT: Phân cụm đảo ngược, thân thiện bộ nhớ, xây dựng nhanh
   - IVF-PQ: Lượng tử hóa tích, hỗ trợ dữ liệu siêu lớn, có tổn thất độ chính xác
3. **HNSW vs IVFFLAT**: HNSW truy vấn nhanh hơn nhưng bộ nhớ lớn, IVFFLAT thân thiện bộ nhớ phù hợp với dữ liệu quy mô lớn
4. **Lựa chọn cơ sở dữ liệu**: PostgreSQL + pgvector phù hợp với quy mô vừa và nhỏ, Milvus/Pinecone phù hợp với tình huống quy mô lớn

**Câu hỏi phỏng vấn tần suất cao**:

- Tại sao tình huống RAG cần cơ sở dữ liệu vector?
- Có những thuật toán chỉ mục vector nào? Ưu nhược điểm của từng loại?
- Sự khác biệt giữa HNSW và IVFFLAT?
- Tại sao chọn PostgreSQL + pgvector?

**Lời khuyên học tập**:

1. **Hiểu nguyên lý**: Cấu trúc đồ thị của HNSW, nguyên lý phân cụm của IVF, hiểu rồi mới có thể đưa ra lựa chọn đúng đắn
2. **Thực hành trực tiếp**: Dùng pgvector hoặc Milvus xây dựng một Demo tìm kiếm vector, cảm nhận sự khác biệt hiệu suất của các chỉ mục khác nhau
3. **Chú ý tinh chỉnh**: Sự đánh đổi giữa tham số chỉ mục (ef_search, nprobe) với tỷ lệ thu hồi và độ trễ, cần tinh chỉnh dựa trên tình huống nghiệp vụ

Lựa chọn cơ sở dữ liệu vector và tinh chỉnh chỉ mục, trực tiếp quyết định hệ thống RAG có đứng vững được trong môi trường sản xuất hay không — chọn sai là "tìm kiếm chậm, thu hồi kém, chi phí nổ" ba điều liên tiếp.
