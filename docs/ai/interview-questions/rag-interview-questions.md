---
title: Tổng hợp câu hỏi phỏng vấn RAG
description: Tổng hợp có hệ thống các câu hỏi phỏng vấn RAG tần suất cao, bao gồm kiến thức cơ bản RAG, Embedding, cơ sở dữ liệu vector, chiến lược Chunk, xử lý tài liệu, Hybrid Search, Query Rewrite, Rerank, GraphRAG, cập nhật knowledge base và đánh giá RAG, kèm bài viết tham khảo tương ứng.
category: AI
tag:
  - Phỏng vấn RAG
  - Cơ sở dữ liệu vector
  - Phỏng vấn AI
head:
  - - meta
    - name: keywords
      content: RAG面试题,RAG面试,检索增强生成面试题,Embedding面试题,向量数据库面试题,GraphRAG面试题,RAG优化面试题,Chunk面试题,Hybrid Search面试题,Rerank面试题
---

RAG là module dễ bị đánh giá thấp nhất trong phát triển ứng dụng AI.

Nhiều người nghĩ RAG chỉ là "cắt tài liệu -> chuyển vector -> lưu vào vector store -> truy xuất -> ghép Prompt". Hiểu như vậy ở giai đoạn Demo thì ổn, nhưng khi vào nghiệp vụ thực tế, vấn đề ngay lập tức trở nên phức tạp: phân tích tài liệu không sạch, Chunk cắt vỡ ngữ nghĩa, chọn nhầm mô hình Embedding, kết quả truy xuất không chính xác, bỏ sót bộ lọc quyền, tài liệu cập nhật nhưng phiên bản cũ vẫn còn, mô hình nhận được bằng chứng nhưng không trả lời đúng.

Do đó, điều phỏng vấn RAG thực sự kiểm tra không phải là "bạn có biết kết nối cơ sở dữ liệu vector không", mà là: **bạn có thể chia nhỏ một hệ thống tăng cường truy xuất thành một pipeline kỹ thuật có thể định vị, tối ưu, đánh giá và cập nhật hay không.**

Bộ câu hỏi phỏng vấn RAG này được tổng hợp dựa trên các bài viết hiện có trong chuyên mục AI. Khuyến nghị bạn ôn tập theo lộ trình chính sau:

1. Đầu tiên hiểu RAG giải quyết vấn đề gì, và sự khác biệt giữa nó với fine-tuning, long context, tìm kiếm truyền thống.
2. Tiếp theo hiểu Embedding, độ tương đồng, chỉ mục ANN và lựa chọn cơ sở dữ liệu vector.
3. Sau đó hiểu xử lý tài liệu, chiến lược Chunk, metadata và bộ lọc quyền.
4. Tiếp theo nắm vững Hybrid Search, Query Rewrite, Rerank, nén ngữ cảnh và các phương pháp tối ưu khác.
5. Cuối cùng bổ sung GraphRAG, cập nhật knowledge base và vòng lặp đánh giá.

## Phỏng vấn viên thực sự muốn kiểm tra gì

Câu hỏi RAG thường bắt đầu từ khái niệm, nhưng sẽ nhanh chóng đi sâu vào chẩn đoán và tối ưu. Bạn có thể chuẩn bị theo các cấp độ sau.

| Hướng kiểm tra       | Phỏng vấn viên muốn xác nhận gì                                                                          | Điểm trừ phổ biến                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Cơ bản RAG           | Bạn có biết RAG giải quyết vấn đề cập nhật kiến thức, dữ liệu riêng tư và khả năng truy xuất nguồn không | Chỉ nói "giảm ảo giác", không nói được pipeline                    |
| Embedding và chỉ mục | Bạn có hiểu tính gần đúng và sự đánh đổi chi phí của truy xuất vector không                              | Coi cơ sở dữ liệu vector như database thông thường                 |
| Xử lý tài liệu       | Bạn có biết chất lượng truy xuất được quyết định trước khi tài liệu vào hệ thống không                   | Chỉ điều chỉnh TopK, không xem phân tích và Chunk                  |
| Tối ưu truy xuất     | Bạn có thể định vị vấn đề truy xuất không chính xác, sắp xếp không đúng, nhiễu ngữ cảnh không            | Khi hiệu quả kém chỉ sửa Prompt                                    |
| GraphRAG             | Bạn có hiểu tại sao quan hệ multi-hop và câu hỏi toàn cục khó không                                      | Cho rằng GraphRAG nhất định tốt hơn vector RAG                     |
| Cập nhật và đánh giá | Bạn có thể duy trì knowledge base chạy lâu dài không                                                     | Không có ý thức về phiên bản, triển khai dần, rollback và đánh giá |

Khi trả lời câu hỏi RAG, hãy cố gắng chia vấn đề thành các giai đoạn "trước khi dữ liệu vào chỉ mục, khi truy xuất, khi chèn ngữ cảnh, sau khi mô hình tạo sinh, cập nhật liên tục trực tuyến". Như vậy phỏng vấn viên sẽ dễ cảm nhận hơn tư duy hệ thống của bạn.

## Cơ bản RAG

Bài viết tham khảo: [《Giải thích toàn diện kiến thức cơ bản RAG》](../rag/rag-basis.md)

Nhóm câu hỏi này là điểm vào của phỏng vấn RAG. Trọng tâm là giải thích rõ giá trị và giới hạn của RAG: nó không làm mô hình đột ngột thông minh hơn, mà cung cấp bằng chứng bên ngoài cho mô hình, giúp câu trả lời có thể trích dẫn, kiểm toán và cập nhật.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- RAG chủ yếu giải quyết các vấn đề: kiến thức mô hình lỗi thời, thiếu dữ liệu riêng tư, câu trả lời không thể truy xuất nguồn.
- Tìm kiếm truyền thống trả về danh sách tài liệu, RAG trả về câu trả lời được tổng hợp dựa trên bằng chứng.
- RAG và fine-tuning không phải quan hệ thay thế. Khi kiến thức thay đổi thường xuyên, cần trích dẫn nguồn thì ưu tiên RAG; khi cần cố định phong cách, định dạng hoặc xu hướng năng lực thì mới xem xét fine-tuning.
- Long context phù hợp để phân tích sâu ít tài liệu, nhưng knowledge base doanh nghiệp vẫn cần truy xuất để kiểm soát chi phí, quyền và nhiễu.
- RAG không thể loại bỏ hoàn toàn ảo giác. Truy xuất sai, bằng chứng không đủ, nhiễu ngữ cảnh, mô hình không tuân theo bằng chứng đều có thể dẫn đến câu trả lời sai.

Câu hỏi tần suất cao:

- RAG là gì? Tại sao cần RAG?
- Sự khác biệt giữa RAG và công cụ tìm kiếm truyền thống là gì?
- Nên chọn RAG hay fine-tuning? Khi nào dùng RAG, khi nào fine-tuning, khi nào kết hợp cả hai?
- Trong hệ thống RAG, cách chọn mô hình Embedding như thế nào? Tại sao?
- Sự khác biệt giữa cosine similarity, inner product và Euclidean distance là gì?
- Vấn đề ảo giác trong RAG được giải quyết như thế nào? RAG có nhất định không tạo ra ảo giác không?
- Vấn đề Lost in the Middle là gì? Cách ứng phó?
- Long context window có thay thế được RAG không?
- Các chỉ số đánh giá của hệ thống RAG là gì?
- Ưu điểm và hạn chế của RAG là gì?
- Tình huống nào phù hợp dùng RAG? Tình huống nào không phù hợp?

Cách trả lời hoàn chỉnh hơn là: Giá trị của RAG nằm ở việc gắn kết câu trả lời của mô hình với bằng chứng có thể truy xuất, nhưng giới hạn trên của nó được quyết định bởi chất lượng truy xuất. Nếu bằng chứng đúng không được truy xuất, dù Prompt sau viết hay đến đâu cũng không cứu được.

## Cơ sở dữ liệu vector và chỉ mục

Bài viết tham khảo: [《Giải thích toàn diện thuật toán chỉ mục vector và cơ sở dữ liệu vector trong RAG》](../rag/rag-vector-store.md)

Nhóm câu hỏi này sẽ kiểm tra một số khái niệm nền tảng, nhưng phỏng vấn viên thường không yêu cầu bạn tính công thức, mà xem bạn có hiểu sự đánh đổi của truy xuất vector không: tốc độ, tỷ lệ thu hồi, bộ nhớ, chi phí xây dựng, khả năng lọc và độ phức tạp vận hành.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Embedding ánh xạ văn bản vào không gian vector ngữ nghĩa, văn bản tương tự có khoảng cách gần hơn trong không gian.
- Truy xuất xấp xỉ ANN đánh đổi một phần độ chính xác để đổi lấy hiệu suất truy vấn cao hơn, đây là sự đánh đổi phổ biến trong truy xuất vector quy mô lớn.
- Flat phù hợp cho quy mô nhỏ và benchmark, HNSW truy vấn nhanh nhưng chi phí bộ nhớ cao, IVFFLAT tiết kiệm tài nguyên hơn nhưng phụ thuộc vào phân cụm và điều chỉnh tham số.
- PostgreSQL + pgvector phù hợp cho quy mô vừa và nhỏ và tech stack PostgreSQL có sẵn, cơ sở dữ liệu vector chuyên dụng phù hợp hơn cho quy mô lớn, concurrency cao, tình huống truy xuất phức tạp.
- Truy xuất vector thường phải kết hợp với lọc metadata, lọc quyền, truy xuất từ khóa, không thể chỉ nhìn vào độ tương đồng.

Câu hỏi tần suất cao:

- Embedding là gì? Tại sao cần chuyển văn bản thành vector?
- Tại sao cần cơ sở dữ liệu vector trong bối cảnh RAG?
- Tại sao thuật toán ANN có thể chấp nhận kết quả không chính xác 100%?
- Có những thuật toán chỉ mục vector nào? Ưu nhược điểm của từng loại?
- Flat, HNSW, IVFFLAT, IVF-PQ phù hợp với tình huống nào?
- Sự khác biệt giữa HNSW và IVFFLAT là gì?
- Tham số `ef_search` của HNSW điều chỉnh như thế nào? Tăng và giảm sẽ có kết quả gì?
- Sự khác biệt cốt lõi nhất giữa cơ sở dữ liệu vector và cơ sở dữ liệu truyền thống là gì?
- Nếu dữ liệu vector tăng từ 1 triệu lên 100 triệu, kiến trúc cần điều chỉnh gì?
- Tại sao chọn PostgreSQL + pgvector? Khi nào nên chuyển sang cơ sở dữ liệu vector chuyên dụng?

Nếu được hỏi "cách chọn cơ sở dữ liệu vector", đừng chỉ liệt kê tên sản phẩm. Câu trả lời tốt hơn là trước tiên hỏi về quy mô, độ trễ, điều kiện lọc, khả năng vận hành, sở thích dịch vụ cloud, yêu cầu bảo mật dữ liệu, rồi mới đưa ra giải pháp. Lựa chọn kỹ thuật không phải bình chọn bảng xếp hạng, mà là khớp ràng buộc.

## Xử lý tài liệu và chiến lược Chunk

Bài viết tham khảo: [《Chiến lược xử lý và phân chia tài liệu RAG: từ phân tích, làm sạch, Chunking đến xử lý nội dung đa phương thức》](../rag/rag-document-processing.md)

Nguồn gốc của nhiều vấn đề RAG không phải ở mô hình, cũng không phải ở vector store, mà ở xử lý tài liệu. Nội dung rác vào chỉ mục, truy xuất sau đó cũng chỉ là rác có độ tương đồng cao.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Pipeline xử lý tài liệu thường bao gồm: phân tích, làm sạch, cấu trúc hóa, phân chia, bổ sung metadata, Embedding, nhập cơ sở dữ liệu và xác minh.
- Phân chia Chunk không thể chỉ theo độ dài cố định. Cần xem xét cấp độ tiêu đề, ngữ nghĩa đoạn văn, bảng, khối code, FAQ, ranh giới chương.
- Chunk quá lớn: truy xuất không chính xác và chi phí ngữ cảnh cao; Chunk quá nhỏ: ngữ nghĩa không hoàn chỉnh, dễ mất ngữ cảnh.
- Overlap có thể giảm thiểu vấn đề ranh giới phân chia, nhưng quá lớn dễ đưa vào nội dung trùng lặp và nhiễu truy xuất.
- Metadata rất quan trọng, bao gồm nguồn, tiêu đề, số trang, thời gian cập nhật, phạm vi quyền, phiên bản tài liệu và nhãn nghiệp vụ.

Câu hỏi tần suất cao:

- Pipeline xử lý tài liệu RAG thường bao gồm những bước nào?
- Phân tích, làm sạch, cấu trúc hóa tài liệu giải quyết vấn đề gì?
- Tại sao phân chia Chunk không thể chỉ theo độ dài cố định?
- Kích thước Chunk, Overlap, ranh giới ngữ nghĩa cần đánh đổi như thế nào?
- Bảng, khối code, hình ảnh, nội dung đa phương thức được xử lý như thế nào trước khi vào RAG?
- Giai đoạn xử lý tài liệu làm thế nào để giữ lại cấp độ tiêu đề, số trang, nguồn và metadata quyền?
- Chất lượng Chunk kém sẽ gây ra vấn đề gì trong truy xuất và tạo sinh?
- Cách xây dựng từ đầu một pipeline xử lý tài liệu cấp doanh nghiệp?

Trong phỏng vấn nếu được hỏi "cắt Chunk như thế nào", khuyến nghị không nói trực tiếp là cố định 500 hay 1000 ký tự. Câu trả lời ổn định hơn là: Trước tiên xác định phạm vi cơ bản theo loại tài liệu và độ chi tiết hỏi đáp; ưu tiên cắt theo tiêu đề, đoạn văn, ranh giới ngữ nghĩa; xử lý đặc biệt cho bảng, code, FAQ; giữ lại tiêu đề cấp trên và metadata; cuối cùng xác minh chiến lược Chunk qua đánh giá truy xuất, thay vì điều chỉnh tham số theo cảm giác.

## Tối ưu truy xuất RAG

Bài viết tham khảo: [《Giải thích toàn diện tối ưu RAG: từ thu hồi, xếp hạng lại đến kỹ thuật kỹ thuật ngữ cảnh》](../rag/rag-optimization.md)

Nhóm câu hỏi này thể hiện rõ nhất kinh nghiệm thực chiến. Khi hiệu quả RAG kém, đừng vội sửa Prompt. Trước tiên xác định vấn đề xảy ra ở đoạn nào: không thu hồi được bằng chứng đúng, thu hồi được nhưng xếp hạng quá thấp, nội dung đưa vào ngữ cảnh quá nhiễu, mô hình không sử dụng bằng chứng đúng cách, hay mẫu đánh giá không ổn định.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Hybrid Search kết hợp truy xuất từ khóa và truy xuất vector, phù hợp với tình huống có thuật ngữ chuyên ngành, số hiệu, tên thực thể, biểu đạt ngữ nghĩa hỗn hợp.
- Query Rewrite giải quyết vấn đề câu hỏi người dùng không chuẩn, thông thường, đa ý định, viết tắt và lược bỏ ngữ cảnh.
- Rerank chịu trách nhiệm sắp xếp lại trong danh sách ứng viên, giải quyết vấn đề độ tương đồng vector không bằng độ liên quan câu trả lời.
- Nén ngữ cảnh có thể giảm nhiễu và chi phí, nhưng nén sai sẽ mất bằng chứng quan trọng.
- Tối ưu RAG phải dựa trên tập mẫu thất bại, không thể chỉ dùng vài trường hợp chủ quan để điều chỉnh liên tục.

Câu hỏi tần suất cao:

- Tỷ lệ thu hồi RAG thấp cần chẩn đoán như thế nào?
- Chiến lược Chunk, Metadata, Hybrid Search, Query Rewrite, Rerank giải quyết vấn đề gì?
- Hybrid Search là gì? BM25 và truy xuất vector được hợp nhất như thế nào?
- Query Rewrite, HyDE, Self-Query phù hợp với tình huống nào?
- Rerank giải quyết vấn đề gì? Tại sao không thể chỉ dựa vào sắp xếp theo độ tương đồng vector?
- Nén ngữ cảnh có giá trị gì? Khi nào sẽ làm tổn hại chất lượng câu trả lời?
- Tại sao tối ưu RAG phải xây dựng tập mẫu thất bại trước?
- RAG trực tuyến xuất hiện "trả lời lạc đề", cần định vị theo con đường nào?

Thứ tự chẩn đoán được khuyến nghị là: Trước tiên xem tài liệu đúng có vào pool ứng viên không, rồi xem vị trí xếp hạng có cao không, rồi xem ngữ cảnh có bị cắt bớt hay bị ô nhiễm không, cuối cùng xem mô hình có trung thực sử dụng bằng chứng không. Như vậy tránh được việc nhầm lẫn vấn đề truy xuất thành vấn đề Prompt.

## GraphRAG

Bài viết tham khảo: [《Giải thích toàn diện GraphRAG: Tại sao chỉ dựa vào truy xuất vector không đủ cho hỏi đáp kiến thức phức tạp》](../rag/graphrag.md)

Câu hỏi GraphRAG thường xuất hiện trong các phỏng vấn sâu hơn. Nó không phải viên đạn bạc cho RAG tiêu chuẩn, mà dùng cấu trúc đồ thị để bù đắp điểm yếu của truy xuất vector trong quan hệ thực thể, suy luận multi-hop và câu hỏi toàn cục.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Vector RAG tiêu chuẩn giỏi thu hồi nội dung tương tự cục bộ, nhưng không giỏi quan hệ xuyên tài liệu, suy luận multi-hop và tóm tắt toàn cục.
- GraphRAG sẽ trích xuất thực thể và quan hệ, xây dựng knowledge graph, sau đó trả lời câu hỏi phức tạp qua truy xuất cục bộ, truy xuất toàn cục hoặc tóm tắt cộng đồng.
- Tóm tắt cộng đồng có thể giúp trả lời câu hỏi toàn cục, nhưng chi phí xây dựng và cập nhật rất cao, cũng có thể đưa vào độ lệch tóm tắt.
- Lọc quyền trong GraphRAG phức tạp hơn lọc cấp tài liệu, vì node, cạnh, lân cận và tóm tắt đều có thể gây rò rỉ thông tin.
- Hệ thống trưởng thành thường không phải GraphRAG thuần túy, mà định tuyến động giữa truy xuất từ khóa, truy xuất vector, multi-vector, truy xuất đồ thị dựa trên loại câu hỏi.

Câu hỏi tần suất cao:

- GraphRAG giải quyết vấn đề gì? Khác gì so với vector RAG tiêu chuẩn?
- Tại sao nói Chunk là ốc đảo thông tin?
- Tại sao độ tương đồng vector không giỏi suy luận multi-hop?
- Thực thể, quan hệ, phát hiện cộng đồng trong GraphRAG là gì?
- Truy xuất toàn cục và truy xuất cục bộ khác nhau như thế nào?
- Tóm tắt cộng đồng trong GraphRAG có giá trị gì? Chi phí của nó ở đâu?
- GraphRAG làm lọc quyền như thế nào?
- Tình huống nào phù hợp với GraphRAG? Tình huống nào không phù hợp?
- Tại sao hệ thống trưởng thành thường không phải GraphRAG thuần túy mà là kiến trúc định tuyến hỗn hợp?

Nếu được hỏi "có nên dùng GraphRAG không", đừng mặc định trả lời có. Phán đoán ổn định hơn là: Nếu vấn đề nghiệp vụ liên quan nhiều đến quan hệ xuyên tài liệu, mạng lưới tổ chức, liên kết thực thể, suy luận multi-hop và tóm tắt toàn cục, có thể đánh giá GraphRAG; Nếu chỉ là FAQ, tài liệu sản phẩm, truy vấn chính sách, RAG tiêu chuẩn kết hợp tối ưu truy xuất thường hiệu quả hơn.

## Cập nhật knowledge base và đánh giá

Bài viết tham khảo: [《Cách cập nhật tài liệu knowledge base RAG: cập nhật gia tăng, kiểm soát phiên bản, loại bỏ trùng lặp và xây dựng lại toàn bộ》](../rag/rag-knowledge-update.md)、[《Hệ thống đánh giá ứng dụng AI: từ xây dựng Golden Set đến vòng lặp triển khai dần trực tuyến》](../llm-basis/llm-evaluation.md)

Sau khi RAG lên sản xuất, điều dễ bị bỏ qua nhất là "bảo trì dài hạn". Tài liệu sẽ cập nhật, mô hình Embedding sẽ nâng cấp, chiến lược Chunk sẽ điều chỉnh, quyền sẽ thay đổi, phân phối câu hỏi nghiệp vụ cũng sẽ thay đổi. Không có cơ chế cập nhật và đánh giá, RAG sẽ nhanh chóng biến từ "hỏi đáp knowledge base" thành "đọc lại kiến thức cũ ngẫu nhiên".

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Cập nhật knowledge base cần xử lý thêm mới, sửa đổi, xóa, phiên bản, loại bỏ trùng lặp, quyền, triển khai dần và rollback.
- Nâng cấp mô hình Embedding thường có nghĩa là không gian vector thay đổi, dùng lẫn vector cũ và mới sẽ gây vấn đề chất lượng truy xuất.
- Thay đổi chiến lược Chunk có thể ảnh hưởng đến tất cả các phân mảnh lịch sử, thường cần xây dựng lại toàn bộ.
- Đánh giá RAG cần chia chỉ số truy xuất và chỉ số tạo sinh. Truy xuất kém và tạo sinh kém có hướng tối ưu hoàn toàn khác nhau.
- Mẫu thất bại trực tuyến cần được đưa trở lại tập đánh giá để tạo vòng lặp cải tiến liên tục.

Câu hỏi tần suất cao:

- Tại sao knowledge base RAG không thể chỉ thêm mới mà không xóa?
- Nên chọn cập nhật gia tăng hay xây dựng lại toàn bộ?
- Sau khi nâng cấp mô hình Embedding, tại sao thường cần xây dựng lại chỉ mục?
- Thay đổi chiến lược Chunk sẽ ảnh hưởng đến dữ liệu lịch sử nào?
- Làm thế nào để tránh nhiều phiên bản của cùng một tài liệu được thu hồi đồng thời?
- Cập nhật knowledge base làm triển khai dần, rollback và kiểm toán như thế nào?
- Tại sao đánh giá RAG cần chia chất lượng truy xuất và chất lượng tạo sinh?
- MRR, NDCG, Recall@K, Context Precision, Faithfulness đo lường gì?

Khi trả lời câu hỏi cập nhật, có thể dùng mạch "phiên bản dữ liệu + phiên bản chỉ mục + triển khai dần + giám sát chỉ số + rollback nhanh". Như vậy trông giống hệ thống sản xuất hơn là chỉ nói "đồng bộ tài liệu định kỳ".

## Khung chẩn đoán

Khi hiệu quả RAG kém, có thể chẩn đoán theo con đường sau:

1. Hiểu câu hỏi: Câu hỏi người dùng có thông thường, viết tắt, đa ý định, cần suy luận multi-hop không.
2. Xử lý tài liệu: Tài liệu gốc có phân tích đúng không, Chunk có giữ ngữ nghĩa và metadata không.
3. Giai đoạn thu hồi: Bằng chứng đúng có vào pool ứng viên không, pool thu hồi có đủ lớn không.
4. Giai đoạn sắp xếp: Bằng chứng đúng có được xếp hàng đầu không, có cần Rerank không.
5. Giai đoạn ngữ cảnh: Bằng chứng có bị cắt bớt, trùng lặp, ô nhiễm không, có tồn tại Lost in the Middle không.
6. Giai đoạn tạo sinh: Mô hình có trung thực trả lời dựa trên bằng chứng không, có cần chiến lược trích dẫn và từ chối trả lời không.
7. Giai đoạn đánh giá: Có tập mẫu ổn định không, có thể tái hiện vấn đề không.

Khung này rất phù hợp để phỏng vấn, vì nó có thể chia RAG từ "một pipeline" thành "nhiều module có thể chẩn đoán".

## Điểm trừ phổ biến

- Đơn giản hóa RAG thành kết nối cơ sở dữ liệu vector.
- Chỉ quan tâm đến TopK, không quan tâm đến phân tích tài liệu, Chunk, metadata và quyền.
- Khi hiệu quả kém chỉ sửa Prompt, không xem truy xuất và sắp xếp.
- Cho rằng độ tương đồng vector cao bằng với câu trả lời liên quan.
- Cho rằng GraphRAG nhất định tốt hơn RAG tiêu chuẩn, không xem xét chi phí và tình huống áp dụng.
- Không có quản lý phiên bản knowledge base, triển khai dần, rollback và vòng lặp đánh giá.

## Khuyến nghị ôn tập

Khuyến nghị ôn tập theo thứ tự "Khái niệm cơ bản -> Chỉ mục vector -> Xử lý tài liệu -> Tối ưu truy xuất -> GraphRAG -> Cập nhật và đánh giá".

Khi ôn tập hãy luôn nhớ một câu: **Năng lực cốt lõi của RAG không phải tạo sinh, mà là đưa bằng chứng đúng đến trước mô hình một cách ổn định, chi phí thấp, có quản trị.** Nếu bạn có thể triển khai xung quanh câu này, phỏng vấn RAG cơ bản sẽ không đi lạc hướng.
