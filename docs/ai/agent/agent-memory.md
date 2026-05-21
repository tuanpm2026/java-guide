---
title: Hệ thống bộ nhớ AI Agent：Bộ nhớ ngắn hạn, bộ nhớ dài hạn và cơ chế tiến hóa bộ nhớ
description: Phân biệt rõ các cấp bậc và biểu diễn bộ nhớ Agent (Token/tham số/tiềm ẩn), chuỗi đọc/ghi bộ nhớ ngắn/dài hạn, lựa chọn giữa vector và Markdown, cũng như cách triển khai nhẹ như Claude Code.
category: Phát triển ứng dụng AI
head:
  - - meta
    - name: keywords
      content: AI Agent,记忆系统,Memory,短期记忆,长期记忆,上下文工程,Mem0,MemGPT,ZEP,Agent Skills
---

<!-- @include: @article-header.snippet.md -->

Khi chạy tác vụ dài, rất nhanh sẽ đụng vào vài ràng buộc cứng: cửa sổ ngữ cảnh có giới hạn trên, hóa đơn Token cứ tăng, sau khi Session kết thúc nếu không lưu vào database, lịch trình vòng trước mặc định sẽ biến mất cùng process. Nhiều khi không phải model không đủ thông minh, mà là nó không có một tầng bộ nhớ có thể gắn kết lịch sử.

Tầng bộ nhớ cần giải quyết hai việc: trong vòng hội thoại hiện tại, sự kiện then chốt không được mất; sau vài ngày mở một Session mới, vẫn có thể lấy lại sở thích, bối cảnh và quyết định lịch sử liên quan đến người dùng. Dưới đây sẽ triển khai theo mấy tuyến: phân loại biểu diễn và chức năng bộ nhớ, vòng đời đọc/ghi, triển khai ngắn hạn và dài hạn, sản phẩm chính thống và tối ưu hóa truy vấn, bộ nhớ Markdown. Cửa sổ trượt cắt thế nào, overload giải tải thế nào, có giao nhau với [《Hướng dẫn thực hành kỹ thuật ngữ cảnh》](./context-engineering.md) trên cùng trang, hai bài có thể đối chiếu với nhau.

Bài viết này sẽ phân tích rõ ràng hệ thống bộ nhớ Agent. Toàn văn gần 9500 chữ, chủ yếu xem mấy phần này:

1. Hình thức lưu trữ và phân loại chức năng bộ nhớ;
2. Bộ nhớ ngắn hạn và dài hạn lần lượt triển khai như thế nào;
3. LETTA, ZEP, MemOS những sản phẩm này có gì khác nhau;
4. Phản ánh, quên lãng, truy vấn hỗn hợp những cơ chế này nên làm như thế nào;
5. Tại sao Markdown cũng có thể làm phương tiện bộ nhớ nhẹ.

## Hệ thống bộ nhớ của Agent được thiết kế như thế nào?

![Sơ đồ toàn cảnh phân loại bộ nhớ Agent](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-memory-memory-taxonomy.svg)

Hệ thống bộ nhớ thường chia thành hai tầng: bộ nhớ ngắn hạn và bộ nhớ dài hạn. Bộ nhớ ngắn hạn là cấp Session, phục vụ tác vụ hiện tại; bộ nhớ dài hạn là xuyên Session, chịu trách nhiệm lắng đọng sở thích người dùng, quyết định lịch sử, kinh nghiệm trước đây. Cả hai về mặt vật lý và logic đều nên tách biệt, đừng trộn lẫn.

![Kiến trúc hệ thống bộ nhớ AI Agent](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-memory-arch.png)

### Bộ nhớ có những hình thức lưu trữ nào?

Ngoài tách theo chiều thời gian, bộ nhớ còn có thể chia thành ba loại theo vị trí lưu trữ và hình thức biểu diễn.

| Hình thức lưu trữ  | Giải thích                                                                        | Triển khai điển hình                                 |
| ------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Bộ nhớ cấp Token   | Lưu trữ dưới dạng ngôn ngữ tự nhiên hoặc ký hiệu rời rạc trong database bên ngoài | Khối văn bản trong vector database, JSON có cấu trúc |
| Bộ nhớ tham số hóa | Mã hóa thông tin vào tham số model                                                | Tri thức pre-trained, LoRA adapter, SFT fine-tuning  |
| Bộ nhớ tiềm ẩn     | Chứa đựng dưới dạng ngầm trong biểu diễn nội bộ model                             | KV Cache, giá trị kích hoạt, Hidden States           |

Ba hình thức này không hoàn toàn tách biệt. Framework "Memory Cube" mà MemOS đề xuất hỗ trợ dòng chảy động từ bộ nhớ thuần văn bản, đến bộ nhớ kích hoạt (KV Cache), rồi đến bộ nhớ tham số. Nói đơn giản là đặt bộ nhớ nóng hay dùng ở vị trí gần hơn, còn bộ nhớ lạnh ổn định lâu dài dùng cách nặng hơn để cố định.

### Bộ nhớ phân loại chức năng như thế nào?

Xét theo mục đích chức năng, bộ nhớ Agent có thể chia thành ba loại.

| Loại chức năng     | Vấn đề cốt lõi              | Nội dung lưu trữ                                               | Kịch bản điển hình                           |
| ------------------ | --------------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| Bộ nhớ sự kiện     | Agent biết gì               | Sở thích người dùng, trạng thái môi trường, sự kiện tường minh | Nhớ sở thích tech stack của người dùng       |
| Bộ nhớ kinh nghiệm | Agent cải thiện như thế nào | Lịch trình trước đây, bài học thành bại, tri thức chiến lược   | Học hỏi từ code review thất bại              |
| Bộ nhớ làm việc    | Agent đang suy nghĩ gì      | Ngữ cảnh suy luận hiện tại, tiến độ tác vụ                     | Trạng thái trung gian trong suy luận đa bước |

Theo tính chất nội dung còn có thể chi tiết hơn:

- Bộ nhớ tình huống (Episodic Memory): Ghi lại sự kiện cụ thể ở thời gian, kịch bản cụ thể, trả lời "What happened?". Ví dụ: "Thứ tư tuần trước người dùng phản hồi vấn đề timeout đơn hàng".
- Bộ nhớ ngữ nghĩa (Semantic Memory): Tri thức phổ quát, sự kiện hoặc quy luật được chắt lọc từ nhiều tình huống, trả lời "What does it mean?". Ví dụ: "Người dùng này nhạy cảm với vấn đề hiệu năng hơn là nhu cầu tính năng".
- Bộ nhớ thủ tục (Procedural Memory): Lưu trữ kỹ năng, quy tắc và hành vi đã học, cho phép Agent tự động thực thi một loại chuỗi tác vụ mà không cần suy luận lại mỗi lần. Ví dụ: "Khi xử lý code review cho người dùng này, ưu tiên kiểm tra rủi ro OOM".

### Vòng đời thao tác bộ nhớ như thế nào?

![Vòng đời thao tác bộ nhớ](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-memory-lifestyle.png)

Một ký ức từ khi vào hệ thống đến khi bị loại bỏ cuối cùng, thường trải qua những khâu này. Tên trong các bài báo khác nhau sẽ có khác biệt, nhưng ngữ nghĩa cơ bản có thể đối chiếu.

```text
编码(Encode) → 存储(Storage) → 提取(Retrieval) → 巩固(Consolidation) → 反思(Reflection) → 遗忘(Forgetting)
```

| Thao tác   | Giải thích                                                          | Triển khai kỹ thuật                                    |
| ---------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| Mã hóa     | Chuyển đổi tương tác gốc thành thông tin có cấu trúc có thể lưu trữ | LLM trích xuất triple sự kiện, tạo tóm tắt             |
| Lưu trữ    | Lưu thông tin đã mã hóa                                             | Ghi vào vector database / graph database / tham số     |
| Trích xuất | Truy vấn ký ức liên quan dựa trên ngữ cảnh                          | Vector search + BM25 + graph traversal                 |
| Củng cố    | Chuyển đổi bộ nhớ ngắn hạn thành bộ nhớ dài hạn                     | Tác vụ bất đồng bộ: tóm tắt hội thoại → entity library |
| Phản ánh   | Chủ động xem lại đánh giá nội dung ký ức, tối ưu quyết định         | Sau khi tác vụ hoàn thành trích xuất Meta-Knowledge    |
| Quên lãng  | Loại bỏ ký ức ít giá trị hoặc lỗi thời                              | Weight decay + conflict marking loại bỏ                |

Ngoài "lưu gì" "lưu ở đâu", khó hơn là khi nào ghi, khi nào đọc, khi nào cập nhật. Cách làm đơn giản nhất là sau mỗi vòng hội thoại chạy một lần trích xuất, ghi kết quả vào long-term library. Nhưng cách này rất dễ ghi vào lượng lớn nhiễu, vector database nhanh chóng bị nhồi đầy mảnh vỡ ít giá trị. Đầu kia là để policy network quyết định nhịp đọc/ghi thông qua reinforcement learning, lý thuyết có thể giảm ghi không hiệu quả, nhưng chi phí huấn luyện cao, khả năng giải thích cũng kém, triển khai thực tế vẫn phụ thuộc nhiều hơn vào phát lại có thể quan sát và đánh giá offline.

Nhiều team sẽ tìm cân bằng giữa hai: dùng quy tắc đơn giản lọc trước, ví dụ importance cao hơn ngưỡng nào đó mới ghi; rồi dùng offline batch job làm phát hiện xung đột, merge và dọn dẹp. Cách này không hoa lệ, nhưng dễ kiểm soát hơn.

### Bộ nhớ ngắn hạn (Short-Term Memory / Working Memory) là gì?

Bộ nhớ ngắn hạn là thông tin tạm thời mà Agent giữ trong một phiên hội thoại đơn lẻ hiện tại, bao gồm câu hỏi của người dùng, reply mỗi vòng của model, kết quả trung gian (Observations) của gọi tool. Những nội dung này sẽ trực tiếp đi vào Prompt của vòng hiện tại, là phương tiện chính của trạng thái tác vụ hiện tại. Hidden state phía host machine, `state` JSON nếu tồn tại cũng nên căn chỉnh với narrative này.

Bộ nhớ ngắn hạn chủ yếu dựa vào cửa sổ ngữ cảnh của bản thân LLM. Cửa sổ của các model chủ lưu đã ngày càng lớn hơn: GPT-5 hỗ trợ 400K Token, Claude Sonnet 4.6 hỗ trợ 1M Token, Gemini 3 Pro hỗ trợ 1M Token, Llama 4 Scout hỗ trợ 10M Token, Grok 4 hỗ trợ 2M Token (dữ liệu tính đến năm 2026). Tuy nhiên cửa sổ ngữ cảnh là chỉ số thay đổi thường xuyên, những con số này tốt nhất lấy model card chính thức hoặc tài liệu API mới nhất của từng model làm chuẩn.

Cửa sổ to, không có nghĩa là có thể nhồi ngữ cảnh vô hạn. Chi phí suy luận sẽ tăng tuyến tính theo số Token. Nghiên cứu "Lost in the Middle" cũng chỉ ra rằng, trong tác vụ truy vấn đa tài liệu, model dễ tận dụng thông tin ở đầu và đuôi ngữ cảnh hơn, tỷ lệ tận dụng thông tin ở đoạn giữa rõ ràng thấp hơn. Cửa sổ càng dài, bias vị trí này càng rõ ràng, vì vậy trong kỹ thuật ngữ cảnh cần chủ động kiểm soát phân bố thông tin đầu vào.

![Hiện tượng ngưỡng 40% tỷ lệ sử dụng ngữ cảnh](https://oss.javaguide.cn/github/javaguide/ai/harness/context-utilization-40-percent-threshold-phenomenon.svg)

Để kiểm soát bộ nhớ ngắn hạn phình to, tầng framework thường có ba cách làm phổ biến, cùng loại với Token degradation, JIT offloading trong kỹ thuật ngữ cảnh.

Cách thứ nhất là Context Reduction. Khi lịch sử hội thoại đạt đến ngưỡng Token đặt trước, framework tự động loại bỏ N vòng message sớm nhất, tức là cửa sổ trượt; hoặc gọi model nhẹ nén lịch sử hội thoại thành tóm tắt, đánh đổi mất mát thông tin lấy không gian ngữ cảnh.

Cách thứ hai là Context Offloading. Gọi tool hoặc Skill có thể trả về dữ liệu rất lớn, ví dụ HTML trang web hoàn chỉnh, nội dung file CSV. Lúc này có thể đặt kết quả nặng vào lưu trữ tạm bên ngoài, trong Prompt chỉ giữ một tham chiếu ngắn, ví dụ UUID hoặc đường dẫn file. Khi model cần đào sâu chi tiết, lại đọc qua Function Calling bắt buộc liên kết công cụ nội bộ. Ở đây nhất định phải cấu hình chiến lược chống avalanche: khi đọc timeout hoặc file vượt giới hạn, tool phải chủ động trả về kết quả cắt bớt hoặc hạ cấp.

Cách thứ ba là Context Isolation. Trong kiến trúc đa Agent, khi Agent chính phân công tác vụ cho Agent con, chỉ truyền lệnh tác vụ tinh giản và đoạn ngữ cảnh cần thiết, đừng broadcast toàn bộ lịch sử hội thoại cho mỗi Agent con. Đây là cách làm quan trọng để kiểm soát tổng tiêu thụ Token của hệ thống đa Agent.

### Bộ nhớ dài hạn (Long-Term Memory) là gì?

Bộ nhớ dài hạn là cơ sở tri thức persistent sống bên ngoài Session. Nó không biến mất khi hội thoại kết thúc, mà thông qua cơ chế "ghi-truy vấn", cho phép Agent trong Session mới vẫn lấy được sở thích, sự kiện và quyết định lịch sử đã lắng đọng trước đó.

Bộ nhớ dài hạn có thể hiểu là hai chuỗi Record & Retrieve.

Ghi bộ nhớ (Record) thường xảy ra sau khi hội thoại kết thúc. Framework kích hoạt tác vụ nền bất đồng bộ, gọi LLM tinh chế ngữ nghĩa bộ nhớ ngắn hạn vòng này: lọc nhiễu hội thoại thừa, trích xuất sự kiện có cấu trúc giá trị cao, ví dụ "tech stack ưu thích của người dùng là Python + FastAPI", "đối tượng báo cáo của người dùng là CFO, cần phong cách diễn đạt phi kỹ thuật", rồi ghi vào lưu trữ persistent.

Chuỗi ghi này tốt nhất thiết kế theo Best-Effort. LLM trích xuất có thể bỏ sót sự kiện then chốt, cũng có thể vô tình ghi câu trình bày giả định thành sở thích. Bản thân thao tác ghi còn cần có idempotency Key, tránh retry tạo ký ức trùng lặp. Trong kịch bản trích xuất LLM, idempotency Key phù hợp hơn dựa trên source message ID + extraction batch ID, thay vì văn bản kết quả trích xuất, vì temperature sampling hoặc điều chỉnh Prompt nhỏ có thể dẫn đến ngữ nghĩa giống nhau nhưng chữ khác nhau, string hash không đáng tin. Khi đa hội thoại đồng thời, merge và ghi đè entity library còn cần optimistic lock hoặc version control (MVCC).

Truy vấn bộ nhớ (Retrieve) thường xảy ra khi Session mới bắt đầu. Hệ thống vector hóa user Query, rồi làm semantic similarity search với các mục trong long-term memory library, prepend một lô mục có hit rate cao nhất vào System Prompt hoặc đặt vào parallel slot. Chạy một lần vector search trên first-packet path rất phổ biến, nhưng P99 của VectorStore sẽ trực tiếp ăn vào TTFT. Cách giảm thiểu phổ biến là dùng Redis làm preheat line, hoặc toàn lượng preload sở thích nông, hồ sơ tĩnh, deep memory mới đi async rerank, hoặc overlap với pipeline generation, giảm cảm giác chờ đợi của người.

### Bộ nhớ dài hạn và RAG có gì khác nhau?

![Sự khác biệt giữa bộ nhớ dài hạn và RAG (Retrieval-Augmented Generation)](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-memory-rag-vs-memory.svg)

Bộ nhớ dài hạn và RAG về kỹ thuật rất giống nhau, cả hai đều dùng vector database và semantic search. Nhưng đối tượng phục vụ của chúng khác nhau.

RAG gắn kết nguồn tri thức chia sẻ, ví dụ quy định công ty, tài liệu sản phẩm, kết quả truy vấn database thời gian thực. Những nội dung này không bị ràng buộc mạnh với "ai đang sử dụng", với người dùng khác nhau thường trả về cùng một bộ nội dung cơ sở tri thức. Đặc trưng cốt lõi của RAG là không cá nhân hóa, chứ không nhất thiết là tĩnh, kết quả truy vấn database thời gian thực cũng có thể kết nối vào RAG.

Bộ nhớ dài hạn quản lý kinh nghiệm cá nhân hóa được lắng đọng động trong tương tác giữa Agent và người dùng cụ thể, ví dụ sở thích người dùng, thói quen, quyết định lịch sử, bối cảnh riêng. Nó cao độ cá nhân hóa, khác nhau theo từng người.

Hai cái không phải chọn một. RAG cung cấp tri thức thế giới, ví dụ quy định công ty, tài liệu sản phẩm; bộ nhớ dài hạn cung cấp hồ sơ người dùng, ví dụ sở thích, thói quen, quyết định lịch sử. Giai đoạn truy vấn có thể thu hồi riêng biệt rồi fusion ranking; entity trong bộ nhớ dài hạn cũng có thể dùng làm query expansion của RAG search; sở thích người dùng còn có thể làm tín hiệu personalized reranking của kết quả RAG.

## Các kiến trúc kỹ thuật bộ nhớ chủ lưu có những gì?

Bộ nhớ dài hạn liên quan đến vector storage, semantic search và quản lý bộ nhớ. Logic càng phức tạp, nhiều team sẽ tách nó thành component độc lập, không còn trộn lẫn với quy trình Agent chính.

### Kiến trúc lưu trữ nền thường bao gồm những cấp bậc nào?

Kiến trúc nền thường chia thành ba tầng.

VectorStore chịu trách nhiệm lưu trữ vector. Nó chuyển đổi văn bản ký ức được trích xuất thành Embeddings, rồi lưu vào vector database. Lấy Qdrant 1.x single-node, SSD local, HNSW index ef=128, Recall@10 ≥ 0.95 làm chuẩn, trong kịch bản low concurrency (ví dụ QPS dưới 50), P99 latency có thể kiểm soát ở mức vài chục millisecond. Các sản phẩm khác nhau ở cùng QPS có thể có P99 chênh lệch 5-10 lần, ví dụ giữa Pinecone Serverless, tự xây Qdrant, Milvus sẽ có sự khác biệt rõ ràng. Lựa chọn thực tế tốt nhất tham khảo [ann-benchmarks.com](https://ann-benchmarks.com/) hoặc báo cáo benchmark của các nhà cung cấp. Phương án phổ biến bao gồm Pinecone, Weaviate, Chroma, Qdrant.

GraphStore chịu trách nhiệm lưu trữ đồ thị. Trong kịch bản nâng cao, có thể mô hình hóa bộ nhớ thành knowledge graph dạng "entity-relationship", ví dụ dùng Neo4j. Nó phù hợp hơn với truy vấn phức tạp cần multi-hop reasoning, ví dụ "đồng nghiệp A và dự án B mà người dùng đề cập có mối liên hệ gì".

Reranker chịu trách nhiệm reranking. Vector search chỉ là thu hồi ban đầu, semantic relevance không phải lúc nào cũng được sắp xếp chính xác. Reranker thường dựa trên Cross-Encoder để rerank lần hai các kết quả ứng viên, đưa ký ức liên quan hơn lên trước, giảm nội dung không liên quan đi vào ngữ cảnh.

Khi lựa chọn vector database, mấy chiều kích sau rất quan trọng:

| Chiều kích                | Xem xét then chốt                           | Giải thích                                                          |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------------------- |
| Loại chỉ mục              | HNSW / IVF / DiskANN                        | Ảnh hưởng tradeoff giữa recall rate và latency                      |
| Lọc metadata              | pre-filter vs post-filter                   | High filter rate, pre-filter dễ phá vỡ tính kết nối cấu trúc đồ thị |
| Cô lập đa tenant          | Namespace / Collection / physical isolation | Ảnh hưởng recall rate và bảo mật dữ liệu                            |
| Tính nhất quán persistent | strong consistency vs eventual consistency  | Ảnh hưởng độ tin cậy ghi                                            |
| Mô hình chi phí           | Serverless theo lượng vs tự xây cluster     | Ảnh hưởng chi phí vận hành                                          |

Khi LLM trích xuất sự kiện, failure mode cũng cần nghĩ trước. Nó có thể bỏ sót sự kiện then chốt, cũng có thể cố định câu trình bày giả định thành sở thích. Về mặt kỹ thuật có thể làm vài lớp phòng vệ: dùng JSON Schema ràng buộc cứng đầu ra, phối hợp cơ chế retry; dùng LLM-as-Judge làm kiểm tra lần hai, kết quả low confidence không ghi; trong Prompt thêm "nhận dạng câu giả định", ví dụ "I might..." loại câu trình bày này không cố định; ký ức high importance vào hàng đợi Human Review; đồng thời giữ lại nhật ký kiểm toán hội thoại gốc và kết quả trích xuất, tiện truy vết.

### Làm sao so sánh các sản phẩm Memory chủ lưu?

Bảng dưới đây chủ yếu xem mấy dự án hay sản phẩm public mỗi cái nhấn mạnh gì, không bằng kết luận lựa chọn trực tiếp. Cuối cùng vẫn phải xem yêu cầu latency, yêu cầu tuân thủ và hình thức dữ liệu của bạn.

| Sản phẩm                               | Tư tưởng cốt lõi                                             | Điểm kỹ thuật nổi bật                                                                                                                                                                   | Kịch bản phù hợp                  |
| -------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| [Mem0](https://github.com/mem0ai/mem0) | ADD-only single-pass extraction + multi-signal fusion search | Một lần gọi LLM hoàn thành entity extraction và cross-memory linking; semantic + BM25 + Entity Linking parallel scoring; kích hoạt graph memory qua GraphStore backend tùy chọn (Mem0g) | Bộ nhớ hội thoại phổ quát         |
| LETTA (trước đây là MemGPT)            | Virtual memory paging của hệ điều hành                       | Main Context ↔ External Context dynamic swap; recursive summary compression                                                                                                            | Quản lý ngữ cảnh hội thoại dài    |
| ZEP                                    | Time-aware knowledge graph                                   | Tự xây engine Graphiti; ba lớp subgraph tình huống/ngữ nghĩa/cộng đồng; cơ chế edge invalidation                                                                                        | Kịch bản đa tenant cấp enterprise |
| A-MEM                                  | Zettelkasten knowledge management                            | Phương pháp ghi chú thẻ; tự động thiết lập kết nối ngữ nghĩa giữa các ký ức                                                                                                             | Tác vụ tri thức chuyên sâu        |
| MemOS                                  | Dynamic conversion ba loại bộ nhớ                            | Văn bản thuần ↔ activation memory (KV Cache) ↔ parameter memory (LoRA)                                                                                                                | Quản lý bộ nhớ full-stack         |
| MIRIX                                  | Sáu module phân công hợp tác                                 | Meta-memory manager routing; các memory component khác nhau dùng cấu trúc lưu trữ khác nhau                                                                                             | Hỗ trợ quyết định phức tạp        |

### LETTA, ZEP, MemOS có gì khác nhau?

LETTA coi ngữ cảnh như trang trong hệ điều hành. Main Context chứa lệnh hệ thống và bàn làm việc hiện tại, FIFO giữ message mới nhất; khi không giữ được, nén đoạn cũ thành tóm tắt đệ quy rồi đổi sang External Context. Cách suy nghĩ này rất dễ hiểu, nhưng đây là con đường có tổn thất. Sau nhiều vòng tóm tắt đệ quy, các chi tiết như chữ key literal chính xác, call stack lỗi, vài chữ số thập phân rất dễ bị rửa sạch trước. Trông giống "mất trí nhớ", thực ra là tác dụng phụ của nén.

ZEP thêm ba cấp hạt nhân trên đồ thị: subgraph tình huống giữ chặt payload gốc, subgraph ngữ nghĩa trích xuất entity relationship, subgraph cộng đồng gom mạnh liên kết thành khối tóm tắt lớn. Cách suy nghĩ này có điểm tương đồng với community layer của GraphRAG. Điểm đáng học hỏi hơn của ZEP là cơ chế edge invalidation: khi sự kiện mới và edge cũ overlap về thời gian, đánh dấu edge cũ là invalid và ghi timestamp. Như vậy vừa có thể theo dõi sự kiện mới, vừa tiện kiểm toán phán đoán cũ.

MemOS trong bài báo và quảng cáo vẽ ra gradient "text → KV Cache (activation) → LoRA (parameter)". Pre-inject cache hot entry có thể giảm cold start latency; nếu muốn cố định bộ nhớ thành weight, phải đi SFT offline, đây sẽ trở thành một hóa đơn training riêng.

Ở đây có một giới hạn rất thực tế: LoRA một khi ghi vào không dễ xóa. Vector database xóa một hàng là xong, nhưng rút ra một sự kiện nào đó từ tham số, về bản chất sẽ chạm đến vùng nước sâu của Machine Unlearning chưa được lát hoàn toàn. Vì vậy parameter memory chỉ phù hợp với sở thích thay đổi rất chậm. Trong kịch bản đa tenant, còn phải dựa vào runtime như vLLM / TGI hỗ trợ dynamic mount, unload adapter.

```text
纯文本记忆 ──(高频使用)──→ 激活记忆(KV Cache) ──(长期固化)──→ 参数记忆(LoRA)
     ↑                                                          │
     └──────────────(知识过时/卸载)─────────────────────────────┘
```

## Các cơ chế tiến hóa nâng cao của bộ nhớ có những gì?

Chỉ biết ghi và truy vấn thôi chưa đủ. Hệ thống Agent cấp production còn cần một bộ cơ chế trao đổi chất, cho phép bộ nhớ có thể được phản ánh, merge, dọn dẹp và quên lãng, nếu không database càng to, nhiễu cũng càng nhiều.

![Cơ chế tiến hóa nâng cao của hệ thống bộ nhớ](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-memory-evolution.png)

### Phản ánh và tổng hợp bộ nhớ triển khai như thế nào?

Nếu hệ thống chỉ append, bộ nhớ dài hạn rất nhanh sẽ trở thành sổ nhật ký. Cái thực sự có giá trị là chắt lọc từ sổ nhật ký ra các quy tắc, sở thích và bài học có thể tái sử dụng.

Hệ thống production thường thêm một tầng tác vụ introspection offline hoặc near-realtime.

Loại đầu tiên là Self-Reflection. Sau khi tác vụ hoàn thành, Agent khởi động tác vụ bất đồng bộ, rút ra nguyên nhân thành bại của tác vụ lần này, trích xuất "bài học" thành một Meta-Knowledge. Cơ chế này được Park et al. (2023) trong "Generative Agents" hệ thống hóa lần đầu, có thể coi là triển khai kỹ thuật mô phỏng "củng cố bộ nhớ khi ngủ" của con người.

Ví dụ: "Khi xử lý code review Java cho người dùng này, họ quan tâm đến hiệu năng hơn là tiêu chuẩn, trong tương lai nên ưu tiên chú ý rủi ro OOM."

Loại thứ hai là Reflect Loop tinh vi. Một số framework tiên phong 2025-2026, ví dụ MUSE, đã tiến hóa cơ chế phản ánh thành vòng "lập kế hoạch-thực thi-phản ánh-ghi nhớ" chi tiết hơn. Phản ánh không còn chỉ xảy ra sau khi tác vụ hoàn thành, mà kích hoạt khi mỗi subtask kết thúc. Reflect Agent độc lập sẽ làm ba lần xác minh đầu ra subtask: xác minh tính thực tế, kiểm tra đầu ra có phù hợp sự kiện khách quan không; xác minh deliverable, kiểm tra có hoàn thành mục tiêu người dùng chỉ định không; xác minh data fidelity, kiểm tra dữ liệu then chốt có bị mất hoặc biến dạng trong quá trình truyền không.

Loại phản ánh hạt nhân này có thể giảm lỗi tiếp tục khuếch đại trong suy luận đa vòng. Tuy nhiên nó cũng mang lại chi phí bổ sung, không phù hợp mở hết cho mọi tác vụ. Đối với tác vụ rủi ro thấp, giá trị thấp, phản ánh quá mức có thể không đáng.

Loại thứ ba là Memory Clustering & Consolidation. Khi bộ nhớ dài hạn xuất hiện nhiều bản ghi mảnh vỡ, trùng lặp, ví dụ người dùng 10 lần đề cập cùng một bối cảnh dự án, hệ thống có thể tự động kích hoạt tác vụ merge, sắp xếp những mảnh này thành "bách khoa thực thể" hoàn chỉnh hơn. Như vậy vừa có thể giảm dư thừa vector database, vừa nâng cao tính nhất quán truy vấn.

### Cơ chế dọn dẹp và quên lãng bộ nhớ như thế nào?

Bộ nhớ không phải càng nhiều càng tốt. Nhiễu vô dụng và thông tin lỗi thời sẽ nghiêm trọng can thiệp vào phán đoán LLM.

Một cách làm phổ biến là weight decay. Hệ thống duy trì điểm tổng hợp cho mỗi ký ức:

```text
score = relevance × importance × decay(t)
```

Trong đó `decay(t)` thường lấy dạng mũ, ví dụ `e^{-λt}`. Cơ chế này xuất phát từ mô hình truy vấn ba chiều mà "Generative Agents" đề xuất. Trong kỹ thuật thực tế, không khuyến nghị mỗi lần tính time decay cho tất cả ký ức trong vector database, cách ổn định hơn là vector database trước làm static semantic recall, rồi ở giai đoạn Reranker áp dụng điều chỉnh động thời gian thực.

Một cách làm khác là conflict resolution. Khi sự kiện mới và cũ mâu thuẫn, ví dụ năm ngoái người dùng dùng Java 8, năm nay nâng cấp lên Java 21, ký ức cũ nên được đánh dấu là loại bỏ. Chú ý, soft delete của vector database chủ lưu có thể phá vỡ tính kết nối cấu trúc đồ thị HNSW, vì vậy còn cần định kỳ thực thi tác vụ Vacuum để dọn dẹp và xây dựng lại.

Điểm này nhiều team ban đầu sẽ đánh giá thấp. Mọi người tiếc không dám "quên", cho rằng thông tin để dành còn hơn mất. Kết quả vector database chất đống vài chục vạn ký ức, mỗi lần Top-K có lẫn một đống nhiễu lỗi thời, Agent đưa ra đề nghị vẫn dừng ở ba năm trước. Trải nghiệm này rất tệ, và rất khó bù lại bằng cách điều chỉnh Prompt.

## Làm thế nào tối ưu hóa hiệu quả truy vấn bộ nhớ dài hạn?

Ngoài VectorStore và GraphStore, môi trường production thường còn cần thêm một tầng chiến lược truy vấn hỗn hợp.

![Chiến lược tối ưu hóa truy vấn bộ nhớ dài hạn](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-memory-retrieval-optimization.png)

### Truy vấn hỗn hợp và lọc metadata làm như thế nào?

Chỉ dựa vào vector search đơn thuần, dễ tạo ra "liên kết giả". Dense Retrieval xem semantic similarity, đôi khi sẽ thu hồi nội dung nghe có vẻ tương tự nhưng trên nghiệp vụ không liên quan.

Hybrid Search sẽ kết hợp keyword search (BM25 / Sparse) và semantic vector search (Dense). Các loại query khác nhau có thể điều chỉnh weight động, ví dụ query danh từ riêng tăng BM25 weight, query ý định mơ hồ tăng vector weight. Có vài cách fusion phổ biến:

- RRF (Reciprocal Rank Fusion): Gần như không cần điều chỉnh tham số, phù hợp cold start, weighted fusion theo ranking nghịch đảo.
- Linear weighted (`α·dense + (1-α)·sparse`): Có thể điều chỉnh, nhưng cần dữ liệu annotation để calibrate weight.
- Cross-encoder Reranker: Giai đoạn thu hồi lấy union, giai đoạn precision ranking thống nhất scoring, hữu ích hơn cho long-tail query.

Hard Filters metadata cũng rất quan trọng. Trước vector search, trước tiên dựa trên UserID, org ID, time range, business tag thực hiện hard filter, đây là biện pháp cô lập dữ liệu quan trọng nhất trong kịch bản đa tenant. Nếu thiếu tầng cô lập này, "sở thích của Trương Tam bị đưa cho Lý Tứ" không phải vấn đề hiệu quả, mà là sự cố vi phạm privacy compliance. Cách ổn định hơn là bắt buộc inject điều kiện cô lập ở tầng data access, không phụ thuộc vào người gọi truyền tham số thủ công.

Ở đây cũng có trade-off kỹ thuật. Trong vector database dựa trên HNSW, nếu trong đồ thị khổng lồ thực hiện strong filter ít nhãn tenant, có thể phá vỡ đường kết nối cấu trúc đồ thị, dẫn đến recall rate giảm đáng kể. Với các tenant cốt lõi hoạt động cao, phân bổ Collection độc lập để physical isolation thường ổn định hơn.

### Tại sao tối ưu hóa chuỗi truy vấn thường được ưu tiên hơn chiến lược ghi?

ROI của tối ưu hóa chuỗi truy vấn thường cao hơn chuỗi ghi.

Mem0 trên LoCoMo đạt 91.6, +20 điểm so với thuật toán cũ; trên LongMemEval đạt 93.4, +26 điểm; trên BEAM (1M) đạt 64.1; mỗi lần truy vấn khoảng tiêu tốn 7K Token, so với phương án full context 25K+ tiết kiệm hơn. Xem [Mem0 official benchmark](https://docs.mem0.ai/core-concepts/memory-evaluation).

Nhiều khi bạn cảm thấy "bộ nhớ không có tác dụng", không phải giai đoạn ghi hoàn toàn thất bại, mà là Recall chạy lệch, hoặc precision ranking không đưa nội dung thực sự liên quan lên trên. Ưu tiên xem query, filter conditions, fusion weight trong trace, rồi mới quyết định có cần thêm budget cho extraction pipeline không. Đừng mở đầu là thêm ồ ạt logic ghi, điều đó rất có thể chỉ là viết nhiễu nhanh hơn.

## Kiến trúc hệ thống bộ nhớ cấp production cần chú ý những điểm nào?

Khi thực sự lên production, cần theo dõi không chỉ "có nhớ được không", mà còn bao gồm độ chính xác thu hồi, tuân thủ, hiệu năng và chi phí.

| Chiều kích          | Vấn đề cốt lõi            | Giải pháp                                                |
| ------------------- | ------------------------- | -------------------------------------------------------- |
| Đa chiều index      | Độ chính xác thu hồi      | Kết hợp ba loại index Vector + Graph + Keyword           |
| Privacy compliance  | GDPR và các quy định khác | Thực hiện PII desensitization trước khi ghi              |
| Cold-hot separation | Hiệu năng và chi phí      | Cache sở thích tần suất cao + RAG bối cảnh tần suất thấp |

Đằng sau mỗi mục trong bảng đều là chi phí. Đa bộ index có nghĩa là gánh nặng bảo trì cao hơn, PII policy cần pháp lý duyệt qua, ranh giới cold-hot cũng rất dễ bị tranh luận trong team. Trước khi đạt đến quy mô đa tenant, single vector pipeline trước chạy thông ghi idempotent, truy vấn trace, rerank, thường hiệu quả hơn.

## Làm sao dùng Markdown lưu trữ bộ nhớ Agent?

Khi chuỗi vector quá nặng, còn có một cách rất thô nhưng hữu dụng: ghi những gì Agent cần nhớ vào Markdown trong repository. Không cần embedding cũng không sao, miễn là lượng thông tin có thể kiểm soát, và khả năng đọc quan trọng hơn semantic search, con đường này là khả thi.

### Tại sao Markdown có thể làm bộ nhớ Agent?

Markdown có thể coi là bộ nhớ dài hạn plaintext cùng viết bởi người và máy. Không bắt buộc phải dùng vector search, chỉ dựa vào tổ chức thư mục, và cơ chế `@` / `rules` trong Claude Code, cũng có thể chạy được.

Nó tiết kiệm chi phí nhìn thấy và vận hành:

- Transparent và có thể kiểm toán: Mở file bất cứ lúc nào, có thể nhìn thấy Agent nhớ gì, ghi gì, không có black box.
- Persistent: File lưu trên disk, không phụ thuộc vào vòng đời process. Process crash, restart, chuyển máy, bộ nhớ vẫn còn.
- Version control: Bộ nhớ có thể commit lên Git, rollback, branch, Code Review đều rất tự nhiên.
- Zero migration cost: Định dạng chuẩn, không có vendor lock-in. Khi đổi model, đổi framework, sao chép file là xong.
- Chi phí thấp: Chi phí, độ phức tạp vận hành của managed vector database và RAG pipeline đầy đủ không thấp, Markdown local file gần như không có chi phí thêm.

Manus coi file system là external memory có cấu trúc; Claude Code product hóa `CLAUDE.md` và Auto Memory; trong các dự án Agent như OpenClaw và thực hành cộng đồng, cũng có thể thấy cách suy nghĩ bộ nhớ file hóa tương tự. Chúng đều cho thấy rằng, trong nhiều kịch bản Agent, file system + Markdown đã là phương án bộ nhớ dài hạn đủ thực dụng.

### Cơ chế `CLAUDE.md` của Claude Code như thế nào?

Hệ thống bộ nhớ của Claude Code áp dụng dual-track: `CLAUDE.md` do con người viết, và Auto Memory được tích lũy tự động.

#### `CLAUDE.md` nên viết gì, không nên viết gì?

Official khuyến nghị mỗi `CLAUDE.md` kiểm soát trong 200 dòng. Vượt quá giới hạn này sẽ làm giảm tỷ lệ tuân thủ lệnh của Claude. Chia file qua tham chiếu `@` có thể cải thiện khả năng bảo trì, nhưng không giảm tiêu thụ ngữ cảnh, vì file được tham chiếu sẽ load toàn bộ khi khởi động. Nếu lệnh rất dài, ưu tiên dùng thư mục `.claude/rules/` path-scoped rules, chỉ load quy tắc tương ứng khi chỉnh sửa path khớp.

Có thể hiểu `CLAUDE.md` như tài liệu onboarding cho nhân viên AI mới. Viết không tốt còn hơn không viết, vì `CLAUDE.md` cồng kềnh sẽ nhấn chìm các quy tắc thực sự quan trọng.

Có mấy loại nội dung phù hợp viết vào. Thông tin tech stack và version rất quan trọng, sự khác biệt version framework thường là nguồn gốc AI mắc lỗi. Bạn không ghi version Spring Boot, nó dễ tạo ra cách dùng phổ biến hơn trong dữ liệu training. Lệnh thường dùng cũng nên viết vào, ví dụ build, test, lint, start, và cố gắng đặt trong code block. Lệnh trong code block Claude có xu hướng chạy theo, lệnh trong ngôn ngữ tự nhiên nó có thể viết lại theo hiểu biết của mình.

Quyết định kiến trúc và lý do đằng sau cũng đáng viết. Chỉ viết quy tắc thôi chưa đủ, giải thích "tại sao" có thể giúp Claude suy ra nhiều trường hợp hơn. Ví dụ chỉ viết "không viết SQL trực tiếp, dùng QueryWrapper" không bằng thêm "vì hệ thống kiểm toán SQL phụ thuộc phân tích Wrapper để ghi nhật ký thao tác". Như vậy ở các kịch bản query khác nó cũng dễ tự giác dùng Wrapper hơn. Quy ước team và các điểm bẫy đặc thù của dự án cũng phù hợp viết, ví dụ định dạng commit message, quy tắc đặt tên branch, phụ thuộc environment variable, những thứ này Claude rất khó suy ra chỉ bằng cách đọc code, nhưng kỹ sư mới vào nhất định sẽ hỏi.

Nội dung không phù hợp viết vào cũng rất rõ ràng: quy tắc code style nên giao cho formatting tool; hành vi mặc định của ngôn ngữ hoặc framework, ví dụ Python hiện đại dùng f-string, loại nội dung này viết vào là nhiễu; tài liệu tham khảo dài đoạn đưa link là đủ, Claude cần lúc có thể tự đọc.

Một tiêu chí đánh giá rất hữu dụng: đọc lần lượt từng dòng `CLAUDE.md`, mỗi dòng đều tự hỏi mình, nếu không có dòng này, gần đây Claude có thực sự mắc lỗi này không. Nếu câu trả lời là "hình như không có", thì nó có thể xóa.

#### Làm sao viết để Claude thực sự tuân thủ?

Quy tắc phải cụ thể có thể xác minh. "Chú ý khả năng đọc code" không thể xác minh, "tên hàm bắt đầu bằng động từ, hàm đơn lẻ không quá 40 dòng" thì có thể xác minh. Quy tắc càng cụ thể, xác suất Claude tuân thủ càng cao.

Cấm kị tốt nhất kèm phương án thay thế. Chỉ nói "không làm X", Claude gặp kịch bản liên quan có thể bị kẹt. Cách viết tốt hơn là "không làm X, gặp tình huống này làm Y". Ví dụ:

```markdown
# 依赖注入

- 不要使用 @Autowired 字段注入
- 使用构造器注入，配合 Lombok 的 @RequiredArgsConstructor
- 参考示例：UserController.java 中的写法
```

Từ nhấn mạnh có thể dùng, nhưng đừng lạm dụng. Nếu một quy tắc nào đó Claude liên tục vi phạm, thêm `IMPORTANT:` hoặc `YOU MUST:` có thể tăng sự chú ý một chút. Nhưng nếu toàn bộ file đâu cũng là "quan trọng", cuối cùng tương đương không có trọng điểm.

Nếu Claude liên tục bỏ qua một quy tắc nào đó, đừng phản ứng đầu tiên là thêm dấu chấm than. Khả năng lớn hơn là file quá dài, quy tắc bị pha loãng bởi nội dung khác. Cách giải quyết là tinh giản file, không phải tiếp tục thêm nhấn mạnh.

Tiêu đề cũng cố gắng dùng tên thông thường, ví dụ Commands, Structure, Conventions, Testing. Dữ liệu training của Claude có nhiều cấu trúc README chuẩn, nó có kỳ vọng ổn định về những gì thường được viết dưới các tiêu đề như vậy.

#### Cấu trúc phân cấp file `CLAUDE.md` như thế nào?

| Cấp            | Vị trí                                               | Phạm vi áp dụng        | Kịch bản phù hợp                                                                                         |
| -------------- | ---------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------- |
| Cấp tổ chức    | Thư mục hệ thống, ví dụ `/etc/claude-code/CLAUDE.md` | Tất cả người dùng      | Tiêu chuẩn coding công ty, chiến lược bảo mật, bất kỳ cài đặt nào cũng không thể loại trừ                |
| Cấp người dùng | `~/.claude/CLAUDE.md`                                | Tất cả dự án cá nhân   | Sở thích code style, thói quen công cụ cá nhân                                                           |
| Cấp dự án      | `./CLAUDE.md` hoặc `./.claude/CLAUDE.md`             | Chia sẻ team           | Kiến trúc dự án, tiêu chuẩn coding, workflow, commit lên Git                                             |
| Cấp local      | `./CLAUDE.local.md`                                  | Cá nhân dự án hiện tại | Sandbox URL, sở thích dữ liệu test, cần thêm thủ công vào `.gitignore`, chạy `/init` có thể tự động thêm |

Tải file tuân theo quy tắc tìm kiếm lên trên trong cây thư mục: từ working directory hiện tại từng cấp lên trên. Trong cùng thư mục, `CLAUDE.local.md` sẽ được thêm vào sau `CLAUDE.md`, quy tắc càng gần working directory có độ ưu tiên càng cao.

`CLAUDE.md` không phù hợp lưu log dài đoạn và bản ghi hội thoại đầy đủ, cũng không nên lưu key nhạy cảm, Token, thông tin tài khoản. Dữ liệu runtime tần suất cao thay đổi, thông tin động có thể query thời gian thực cũng không phù hợp viết vào.

Sau khi dự án lớn lên, cần quản lý phân cấp. Dự án một người, một `CLAUDE.md` thường đủ dùng; dự án team phải tách ra.

```markdown
# `CLAUDE.md`（项目根目录）

## Project

Spring Boot 3.2 + MyBatis-Plus + MySQL 8.0 的订单管理服务。

## Commands

- 构建：`mvn clean package`
- 测试：`mvn test`

## Rules

- API 约定：@docs/api-conventions.md
- 数据库规范：@docs/database-rules.md
```

Có thể dùng `@path/to/file` tham chiếu file bên ngoài. Nhưng cần chú ý, tham chiếu `@` hỗ trợ tối đa 5 cấp đệ quy. Khi lần đầu dùng tham chiếu bên ngoài trong dự án, Claude Code sẽ hiện hộp thoại approval. Nếu từ chối nhầm, tham chiếu sẽ bị vô hiệu hóa vĩnh viễn, cần reset thủ công. Tham chiếu `@` sẽ nhúng toàn bộ nội dung file vào ngữ cảnh, file được tham chiếu load toàn bộ khi khởi động, vì vậy không giảm tiêu thụ ngữ cảnh.

Nếu cần kiểm soát hạt nhân hơn, có thể dùng thư mục `.claude/rules/` tổ chức path-scoped rules. Sự khác biệt then chốt với tham chiếu `@`: rules chỉ load khi khớp path chỉ định, thuộc lazy loading; tham chiếu `@` load toàn bộ khi khởi động. Khi quy tắc chỉ nhắm đến file hoặc thư mục cụ thể, ví dụ quy chuẩn backend API, cấu hình test, ưu tiên dùng rules, không tiếp tục nhồi vào `CLAUDE.md`.

```yaml
---
paths:
  - "src/main/java/**/controller/**/*.java"
---
# Controller 规范
- 统一使用 Result<T> 包装返回值
- 所有接口必须添加 Swagger 注解
```

Như vậy khi chỉnh sửa Controller chỉ load quy tắc Controller, khi chỉnh sửa Service chỉ load quy tắc Service.

#### AGENTS.md và CLAUDE.md có mối quan hệ gì?

Claude Code đọc `CLAUDE.md`, không phải `AGENTS.md`. `AGENTS.md` giống như tiêu chuẩn mở xuyên công cụ hơn, được OpenAI Codex, Cursor và các tool khác áp dụng. Nếu repository đã dùng `AGENTS.md` để cung cấp lệnh cho các coding Agent khác, có thể tạo một `CLAUDE.md` import `AGENTS.md`, cho phép hai công cụ tái sử dụng cùng một bộ lệnh cơ bản, không cần bảo trì trùng lặp.

```markdown
@AGENTS.md

## Claude Code 特定指令

- 使用 plan mode 处理 `src/billing/` 下的改动
```

#### Auto Memory là gì?

Auto Memory là ghi chú Claude tự động viết dựa trên hội thoại, bao gồm chế độ debug, thói quen code, sở thích workflow. Nó lưu trong thư mục `~/.claude/projects/<project>/memory/`, `MEMORY.md` là file entry, ghi chú chi tiết đặt trong file con.

Ở đây có vài hạn chế sử dụng cần nhớ. `MEMORY.md` chỉ load 200 dòng đầu hoặc 25KB, phần vượt quá sẽ không được đọc, Claude sẽ tách nội dung chi tiết vào file Topic. Sau 20-30 phiên, chất lượng ghi chú Auto Memory có thể giảm, xuất hiện tích lũy các mục mâu thuẫn hoặc thông tin lỗi thời. Trong cộng đồng có các công cụ như dream-skill có thể làm memory consolidation, ví dụ bốn giai đoạn Orient, Gather Signal, Consolidate, Prune, nhưng đây không phải tính năng official chính thức.

Nếu muốn tắt Auto Memory, ngoài chuyển đổi `/memory` và cấu hình `autoMemoryEnabled`, cũng có thể tắt qua biến môi trường `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`. Kịch bản CI/CD phù hợp dùng cách này hơn, vì automated pipeline không cần thiết để Claude tích lũy ghi chú môi trường build.

Auto Memory cần Claude Code v2.1.59+, mặc định bật.

### Bộ nhớ Markdown thiết kế phân cấp như thế nào?

Một hệ thống bộ nhớ Markdown hoàn chỉnh thường sẽ chia thành vài cấp:

- Bộ nhớ cấp người dùng: Lưu sở thích cá nhân và thói quen dài hạn, đặt trong `~/.claude/CLAUDE.md`, ví dụ indent 2-space, viết test trước viết code sau, không thích dùng emoji.
- Bộ nhớ cấp dự án: Lưu quy chuẩn dự án, tech stack, cấu trúc thư mục, đặt trong `CLAUDE.md` thư mục gốc repository, thành viên team chia sẻ, đồng bộ qua Git.
- Bộ nhớ cấp subdirectory: Lưu quy tắc riêng của module cục bộ, đặt trong `CLAUDE.md` của subdirectory, ví dụ quy chuẩn thiết kế API dưới `backend/`, yêu cầu phong cách viết dưới `docs/`.
- Bộ nhớ chia sẻ team: Quy ước chung cần commit lên repository, thường là `CLAUDE.md` cấp dự án và file quy tắc có thể versioning trong thư mục `.claude/rules/`.
- Bộ nhớ private: Workflow cá nhân không nên commit, ví dụ `CLAUDE.local.md`, sau khi thêm vào `.gitignore` chỉ giữ local.

### Ranh giới giữa bộ nhớ Markdown và bộ nhớ dài hạn truyền thống ở đâu?

![Ranh giới áp dụng của bộ nhớ Markdown và bộ nhớ dài hạn truyền thống](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-memory-markdown-memory-boundary.svg)

Markdown và vector database đều có ranh giới áp dụng riêng, không khuyến nghị cắt một dao.

| Chiều kích            | Bộ nhớ Markdown                                                         | Bộ nhớ vector                        | RAG knowledge base                  | Framework database (Mem0, v.v.)     |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------------ | ----------------------------------- | ----------------------------------- |
| Độ chính xác truy vấn | Toàn bộ inject, không có cơ chế truy vấn, load toàn bộ khi khởi động    | Cao, semantic similarity             | Cao, semantic search                | Cao, hybrid strategy                |
| Chi phí ngữ cảnh      | Tương quan tuyến tính với kích thước file, file lớn sẽ chiếm không gian | On-demand search, hiệu quả ngữ cảnh  | On-demand search, hiệu quả ngữ cảnh | On-demand search, hiệu quả ngữ cảnh |
| Trải nghiệm debug     | Xuất sắc, đọc/ghi file trực tiếp                                        | Trung bình, cần công cụ vector query | Trung bình, cần search log          | Phức tạp, cần hiểu framework logic  |
| Chi phí deploy        | Cực thấp, chỉ cần đọc/ghi file                                          | Cao, cần duy trì vector service      | Cao, cần RAG pipeline               | Cao, cần framework runtime          |
| Version control       | Native integration Git                                                  | Cần cơ chế đồng bộ thêm              | Cần cơ chế đồng bộ thêm             | Cần cơ chế đồng bộ thêm             |
| Chi phí migration     | Zero, sao chép file là xong                                             | Cao, lock-in định dạng proprietary   | Cao, lock-in pipeline               | Cực cao, bị ràng buộc framework     |
| Kịch bản phù hợp      | Sở thích, quy ước, ghi chép điểm bẫy                                    | Truy vấn bộ nhớ đa dạng              | Truy vấn tri thức chia sẻ           | Quản lý bộ nhớ đa nguồn phức tạp    |

Giới hạn của Markdown cũng rất rõ ràng. Khi bạn cần truy vấn đoạn cụ thể từ khổng lồ văn bản phi cấu trúc, Markdown được tổ chức thủ công sẽ trở thành điểm nghẽn, lúc này khả năng semantic search của vector database không thể thay thế.

Ngược lại, nếu nhu cầu bộ nhớ là "nhớ quy chuẩn coding của dự án này", "nhớ sở thích báo cáo của người dùng" loại thông tin rõ ràng, có thể cấu trúc hóa này, tính đơn giản và khả năng bảo trì của Markdown thường phù hợp hơn các hệ thống phức tạp.

### Bộ nhớ Markdown nên bảo trì như thế nào?

Lấy `CLAUDE.md` làm ví dụ ở đây. `CLAUDE.md` không phải viết xong là xong, dự án sẽ tiến hóa, quy tắc cũng sẽ lỗi thời.

Thêm quy tắc phải chậm. Một quy tắc mới chỉ đáng viết vào khi Claude thực sự mắc một lỗi, và quy tắc này có thể ngăn cùng loại lỗi xảy ra lại. Đặt ra quy tắc trước cho những việc chưa xảy ra, thường là lãng phí không gian ngữ cảnh.

Xóa quy tắc phải quyết đoán. Nếu một quy tắc đã tồn tại lâu, nhưng sau khi xóa hành vi Claude không thay đổi, chứng tỏ nó có thể ngay từ đầu đã không có tác dụng. Để không gian cho quy tắc thực sự cần thiết quan trọng hơn duy trì một file "trông có vẻ đầy đủ".

Quy tắc tốt nhất tiến hóa liên tục theo lỗi làm động lực. Sau mỗi lần sửa lỗi của Claude, có thể thêm một câu "cập nhật `CLAUDE.md`, đảm bảo lần sau không mắc lại". Sau khi tích lũy vài lỗi cùng loại, mới tổng kết thành một quy tắc tinh lọc, tránh file phình to nhanh.

Có hai tín hiệu cảnh báo đáng chú ý. Thứ nhất, Claude xin lỗi về quy tắc đã viết trong file, ví dụ "xin lỗi, tôi vừa bỏ qua quy tắc XX". Điều này cho thấy cách diễn đạt quy tắc có thể chưa đủ trực tiếp. Thứ hai, cùng một quy tắc bị vi phạm lặp đi lặp lại trong các phiên khác nhau. Đây thường không phải vấn đề diễn đạt, mà là toàn bộ file quá dài, quy tắc bị pha loãng. Cách giải quyết không phải tiếp tục thay đổi diễn đạt, mà là nén toàn bộ file.

Khi bảo trì có thể dùng kiểm tra hội thoại: cứ vài tuần, chọn vài quy tắc trong `CLAUDE.md` hỏi Claude, "nếu tôi xóa quy tắc này, bạn có thay đổi hành vi không?" Nếu nó nói không, quy tắc này có thể xóa.

Tuy nhiên phương pháp này chỉ có thể dùng như tham khảo heuristic, không thể hoàn toàn tin vào tự đánh giá của Claude. Claude không thể dự đoán chính xác liệu thiếu một quy tắc nào đó mình có thay đổi hành vi không. Cách đáng tin cậy hơn là backup quy tắc trước, sau khi thực sự xóa, quan sát hành vi trên vài tác vụ thực tế có thay đổi không.

`/init` cũng có thể dùng, nhưng đừng dùng trực tiếp. `CLAUDE.md` được tạo tự động là điểm khởi đầu tốt, nhưng bên trong có thể có mô tả dự án không chính xác. Xem xét từng dòng theo nguyên tắc trên, xóa dư thừa, bổ sung thiếu sót.

Cuối cùng, cập nhật bộ nhớ chia sẻ team tốt nhất đi qua Git. Mỗi lần cập nhật bộ nhớ quan trọng đều commit, khi có vấn đề có thể rollback, Code Review cũng có thể truy vết nguyên nhân sửa đổi. Sửa đổi nội dung chia sẻ team, khuyến nghị đi qua PR process.

## Làm sao nối các điểm chính của bài về bộ nhớ lại?

Câu hỏi mà tầng bộ nhớ cần trả lời rất đơn giản: làm thế nào để Agent không phải mỗi lần mở Session mới đều bắt đầu từ đầu.

Bộ nhớ ngắn hạn dựa vào cửa sổ ngữ cảnh chống đỡ, sliding window, summary compression, offload kết quả nặng là ba con dao được dùng phổ biến nhất ở phía kỹ thuật. Bộ nhớ dài hạn dựa vào hai chuỗi "ghi-truy vấn", cho phép khi Session mới khởi động cũng lấy được sở thích người dùng và quyết định lịch sử.

Trong bài viết này có vài phán đoán đáng mang theo.

Bộ nhớ ngắn hạn và dài hạn không phải hai mặt của một tính năng, mà về mặt vật lý và logic đều nên tách biệt. Bộ nhớ ngắn hạn sống trong tác vụ và process hiện tại, bộ nhớ dài hạn nên lưu trong database.

Trong vòng đời bộ nhớ, điều bị bỏ qua nhất là quên lãng. Nhiều team tiếc không dám xóa, kết quả truy vấn thu hồi đầy nhiễu lỗi thời của vài năm trước, Agent đưa ra đề nghị ngày càng không đáng tin.

Vector database và Markdown cũng không phải chọn một. Thông tin có lượng hạn chế, yêu cầu đọc cao như sở thích, quy ước, ghi chép điểm bẫy, trải nghiệm debug của Markdown rất tốt; nhưng nếu cần lấy đoạn liên quan từ hàng chục vạn văn bản phi cấu trúc, vector search vẫn không thể thay thế.

`CLAUDE.md` không phải viết càng nhiều càng tốt. Mỗi quy tắc nên tương ứng với lỗi Claude thực sự đã mắc. Nếu sau khi xóa một quy tắc hành vi Claude không thay đổi, thì nó có thể ngay từ đầu chưa từng có tác dụng.

Tối ưu hóa chuỗi truy vấn thường đáng được ưu tiên làm hơn chuỗi ghi. Khi cảm thấy "bộ nhớ không có tác dụng", chín phần mười là Recall chạy lệch, hoặc rerank không đưa nội dung thực sự liên quan lên trên. Xem trace trước, sau đó mới xem xét thêm budget cho extraction pipeline.

Hệ thống bộ nhớ cuối cùng phải chịu đựng được ba câu hỏi: Agent biết sự kiện gì, Agent học được gì từ tác vụ trước, Agent đang xử lý gì lúc này. Chỉ khi ba tầng này được căn chỉnh, "có bộ nhớ" mới không phải câu nói suông.
