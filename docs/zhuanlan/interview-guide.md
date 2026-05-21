---
title: 《Nền tảng phỏng vấn thông minh SpringAI + Kho tri thức RAG》
description: Dự án thực chiến nền tảng phỏng vấn thông minh Spring AI, phát triển dựa trên Spring Boot 4.0 và Spring AI 2.0, tích hợp kho tri thức RAG và chức năng phân tích CV.
category: Kiến thức sao
star: 5
---

Nhiều bạn đã phản hồi với tôi: "CV của mình toàn là CRUD, nhà tuyển dụng nhìn không thèm nhìn, phải làm sao?"

Khi làn sóng AI đã đến, chúng ta hãy trực tiếp nhét khả năng của mô hình lớn, cơ sở dữ liệu vector, kiến trúc RAG vào dự án của bạn.

## Giới thiệu dự án

Đây là nền tảng hỗ trợ phỏng vấn AI thông minh dựa trên Spring Boot 4.0 + Java 21 + Spring AI 2.0. Hệ thống cung cấp ba chức năng cốt lõi:

1. **Phân tích CV thông minh**: Sau khi tải CV lên, AI tự động đánh giá đa chiều và đưa ra gợi ý cải thiện
2. **Hệ thống phỏng vấn mô phỏng**: Tạo câu hỏi phỏng vấn cá nhân hóa dựa trên nội dung CV, hỗ trợ hỏi đáp thời gian thực và đánh giá câu trả lời
3. **Hỏi đáp kho tri thức RAG**: Tải tài liệu kỹ thuật lên để xây dựng kho tri thức riêng, hỗ trợ hỏi đáp thông minh được tăng cường bởi tìm kiếm vector

![Hiệu ứng demo](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-resume-history.png)

**Địa chỉ dự án** (Hoan nghênh star ủng hộ):

- Github：<https://github.com/Snailclimb/interview-guide>
- Gitee：<https://gitee.com/SnailClimb/interview-guide>

Code đầy đủ hoàn toàn mã nguồn mở và miễn phí, không có phiên bản Pro hay phiên bản trả phí!

## Cách viết CV

**Làm thế nào để đưa dự án thực chiến 《Nền tảng phỏng vấn thông minh SpringAI + Kho tri thức RAG》vào CV?** Tôi cung cấp năm hướng để bạn tùy chọn, phù hợp chính xác với nhu cầu vị trí:

1. **Hướng backend**: Cung cấp ba phiên bản "Tập trung vào kiến trúc & năng lực phân tán", "Tập trung vào ứng dụng AI & lập trình reactive", "Tập trung vào kỹ thuật công nghệ & cơ sở hạ tầng", dù bạn phỏng vấn vị trí backend, ứng dụng mô hình lớn hay kiến trúc, đều có thể tìm được điểm đột phá phù hợp nhất.
2. **Hướng kiểm thử/phát triển kiểm thử**: Thiết kế riêng hai phiên bản "Unit test & TDD" và "Bao phủ các kịch bản chức năng/ngoại lệ", nổi bật năng lực cạnh tranh cốt lõi của kỹ sư kiểm thử trong đảm bảo chất lượng AI.

![Cách viết CV 《Nền tảng phỏng vấn thông minh SpringAI + Kho tri thức RAG》](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/project-on-resume.png)

Mỗi mô tả đều bám sát logic thực tế của dự án, tuân thủ nghiêm ngặt quy chuẩn giới thiệu dự án. Không chỉ dạy bạn cách viết, mà còn dạy bạn cách bổ sung, ví dụ đối với "Xác thực và phân quyền người dùng" chưa được đề cập trong dự án này, đưa ra gợi ý bổ sung, dạy bạn cách triển khai phương án xác thực và phân quyền chính thống dựa trên SpringSecurity/Sa-Token.

Ngoài ra, tôi còn bổ sung các điểm kỹ thuật khó mà nhà tuyển dụng có thể đào sâu (như Redis Stream vs hàng đợi tin nhắn truyền thống, chi tiết triển khai giới hạn tốc độ phân tán) cùng template điểm khó dự án và giải pháp.

## Tổng quan hướng dẫn

Hãy cùng xem qua hướng dẫn đi kèm mà tôi đã viết, mức độ tâm huyết thể hiện qua từng chữ! Trong toàn bộ hướng dẫn dự án, tôi đã tự tay vẽ hàng chục sơ đồ kỹ thuật để hỗ trợ hiểu.

Ví dụ, bài tổng kết câu hỏi phỏng vấn RAG này, mất một tuần mới hoàn thành phiên bản đầu tiên, tổng cộng **3.4 vạn chữ**, bao gồm **35 câu hỏi phỏng vấn RAG tần số cao**, chỉ riêng việc hiệu đính đã thực hiện ba lần. Và đây chỉ là phiên bản đầu, sau này sẽ tiếp tục hoàn thiện và tối ưu!

![Câu hỏi phỏng vấn RAG](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/rag-interview-questions.png)

Đây là bài giới thiệu chi tiết về ý tưởng phát triển kho tri thức RAG tương ứng.

![Ý tưởng phát triển chi tiết kho tri thức RAG](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/rag-knowledge-base-coding.png)

Không chỉ dạy bạn "cách viết code", mà còn dạy bạn "tại sao thiết kế như vậy" và "cách đối phó với những thách thức phức tạp trong các tình huống thực tế của doanh nghiệp".

## Bố cục nội dung hướng dẫn đi kèm

Dự án này hiện tại triển khai các chức năng khá đơn giản, ngưỡng học tập rất thấp, nhưng kiến thức liên quan khá phong phú. Thông qua hướng dẫn từng bước chi tiết, chúng ta sẽ xây dựng từ đầu một kiến trúc backend hoàn chỉnh tích hợp **tích hợp LLM, RAG (Retrieval-Augmented Generation), cơ sở dữ liệu vector, giới hạn tốc độ phân tán và xử lý bất đồng bộ**.

Dù bạn muốn học ứng dụng tiên tiến của **Spring AI**, hay cần một **dự án CV giá trị cao**, dự án này sẽ cung cấp cho bạn hướng dẫn toàn diện từ xây dựng cơ sở hạ tầng, giải quyết bài toán nghiệp vụ đến ôn tập kỹ năng phỏng vấn.

Hướng dẫn dự án đi kèm cần trả phí (**cuối bài/cuối bài** có cách tham gia), nhưng mong mọi người thông cảm, chủ yếu để bù đắp chi phí thời gian. Và thu phí so với dịch vụ cung cấp chắc chắn là cực kỳ xứng đáng. Đời này không bao giờ làm chuyện trục lợi!

**Bố cục nội dung như sau (đã hoàn thành, tổng cộng hơn 13 vạn chữ)**:

![Tổng quan nội dung hướng dẫn đi kèm](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/tutorial-overview.png)

### Thiết lập môi trường

- Thiết lập PostgreSQL + PGvector cơ sở dữ liệu vector trên local
- Spring Boot + RustFS xây dựng dịch vụ object storage tương thích S3 hiệu năng cao
- ⭐Đăng ký API mô hình lớn và triển khai mô hình local bằng Ollama
- Chương cuối thiết lập môi trường và khởi động dự án

### Phát triển chức năng cốt lõi

- Trích xuất và phân tích nội dung đa định dạng dựa trên Tika
- ⭐Tích hợp Spring AI với mô hình lớn
- ⭐Spring AI + pgvector thực hiện hỏi đáp kho tri thức RAG
- Thực hiện hiệu ứng đánh máy dựa trên SSE
- Hướng dẫn từng bước viết Prompt có cấu trúc cấp sản xuất
- Chức năng phỏng vấn mô phỏng AI
- Xuất báo cáo PDF dựa trên iText 8

### Tối ưu nâng cao

- Thực hành tốt nhất ánh xạ thực thể MapStruct
- ⭐Thực hiện xử lý tác vụ bất đồng bộ dựa trên Redis Stream
- Đóng gói thành phần giới hạn tốc độ phân tán đa chiều Redis + Lua
- ⭐Thiết kế kiến trúc Skill
- Hướng dẫn nâng cấp Spring Boot 4.0
- Triển khai một lệnh bằng Docker Compose

### Phỏng vấn

- ⭐Hướng dẫn viết CV và đóng gói kinh nghiệm dự án chuyên sâu
- Khi nhà tuyển dụng hỏi "dự án này ở đâu ra", trả lời thế nào?
- ⭐Khai thác câu hỏi phỏng vấn Spring AI
- ⭐Khai thác câu hỏi phỏng vấn kho tri thức RAG
- Khai thác câu hỏi phỏng vấn Redis
- Khai thác câu hỏi phỏng vấn tải lên file, phân tích và xuất PDF

## Tham gia học tập

**Dự án này là dự án thực chiến độc quyền nội bộ của [JavaGuide Kiến thức sao](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html), đọc học trực tuyến qua tài liệu Yuque, không mở riêng ra ngoài.**

Lý do chọn phát hành trong nội bộ sao, là để đảm bảo mỗi người học đều nhận được **hỗ trợ kỹ thuật chuyên sâu** và **dịch vụ hỗ trợ xin việc hoàn chỉnh**.

Toàn bộ hướng dẫn dự án dự kiến hoàn thành trong **1-2** tháng. Mỗi bài viết (không cung cấp video, lãng phí thời gian và không có lợi cho việc nâng cao khả năng học tập) đều được cân nhắc kỹ lưỡng, đảm bảo **chất lượng cao, không rào cản**, dù bạn có nền tảng yếu cũng có thể theo tài liệu chạy từ đầu.

Đây chỉ là bắt đầu. Sau này sao sẽ tiếp tục ra mắt nhiều **dự án thực chiến Java** phù hợp với tình huống nghiệp vụ thực tế của doanh nghiệp hơn, giúp bạn luôn đứng ở đầu công nghệ (hé lộ trước, dự án tiếp theo là **hệ thống dịch vụ khách hàng thông minh cấp doanh nghiệp**, sẽ dẫn mọi người thực hành nhiều khả năng AI hơn).

Ngoài ra, sao của tôi còn có nhiều dịch vụ khác, ví dụ **hỏi đáp 1-1, chỉnh sửa CV, tài liệu phỏng vấn hệ thống backend (bao gồm thiết kế hệ thống tần số cao & câu hỏi tình huống), học tập chấm điểm**, v.v., bất kỳ dịch vụ nào trong số đó khi lấy ra riêng lẻ cũng đã vượt xa giá vé sao. Hoan nghênh tìm hiểu chi tiết [Kiến thức sao](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html)!

Đã duy trì kiên trì **sáu năm**, nội dung liên tục cập nhật, dù giá rất rẻ (**0.4 tệ/ngày**) nhưng chất lượng rất cao, chủ trương là chân thành!

Hiện sao đang khuyến mãi, giá hai cuốn sách, bạn có thể sở hữu dịch vụ của trung tâm đào tạo hàng chục nghìn! Đây cung cấp thêm một phiếu giảm giá **30 tệ** (giá sắp tăng, người dùng cũ quét mã gia hạn giảm nửa giá):

![Phiếu giảm giá Kiến thức sao 30 tệ](https://oss.javaguide.cn/xingqiu/xingqiuyouhuijuan-30.jpg)

Tận tâm làm nội dung, giữ vững bản tâm, không trục lợi, còn lại giao cho thời gian! Cùng cố gắng!

## Kiến trúc hệ thống

**Lưu ý**: Sơ đồ kiến trúc được vẽ bằng draw.io, xuất dạng svg, hiệu ứng hiển thị trong chế độ Dark có thể có vấn đề.

Hệ thống sử dụng kiến trúc tách biệt frontend và backend, tổng thể chia thành ba tầng: tầng hiển thị frontend, tầng dịch vụ backend, tầng lưu trữ dữ liệu.

![Sơ đồ kiến trúc hệ thống](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/interview-guide-architecture-diagram.png)

**Tầng backend**:

- REST Controllers: Điểm vào API thống nhất, xử lý yêu cầu HTTP
- Tầng dịch vụ nghiệp vụ:
  - Resume Service: Tải lên CV, phân tích, phân tích AI
    - Interview Service: Quản lý phiên phỏng vấn, tạo câu hỏi, đánh giá câu trả lời
    - Knowledge Service: Tải lên kho tri thức, phân khối văn bản, vector hóa
    - RAG Chat Service: Tạo sinh tăng cường bởi tìm kiếm, hỏi đáp streaming
- Tầng xử lý bất đồng bộ: Consumer dựa trên Redis Stream, xử lý bất đồng bộ các tác vụ AI tốn thời gian (như phân tích CV, vector hóa, đánh giá phỏng vấn)
- Tầng tích hợp AI: Spring AI + DashScope (Tongyi Qianwen). Giao diện gọi LLM thống nhất, hỗ trợ tạo đối thoại và vector hóa văn bản.

**Tầng lưu trữ dữ liệu**:

- PostgreSQL + pgvector:
  - Dữ liệu quan hệ: CV, hồ sơ phỏng vấn, metadata kho tri thức
  - Tìm kiếm vector: Lưu trữ vector tài liệu, hỗ trợ tìm kiếm độ tương đồng
- Redis:

  - Cache phiên: Trạng thái phiên phỏng vấn
  - Hàng đợi tin nhắn: Redis Stream thực hiện hàng đợi tác vụ bất đồng bộ

- RustFS/MinIO (S3): File gốc (CV PDF, tài liệu kho tri thức)

**Luồng xử lý bất đồng bộ**:

Phân tích CV, vector hóa kho tri thức và tạo báo cáo phỏng vấn sử dụng xử lý bất đồng bộ Redis Stream, ở đây lấy phân tích CV và vector hóa kho tri thức làm ví dụ giới thiệu tổng thể luồng:

```
Yêu cầu tải lên → Lưu file → Gửi tin nhắn vào Stream → Trả về ngay
                              ↓
                      Consumer tiêu thụ tin nhắn
                              ↓
                    Thực thi tác vụ phân tích/vector hóa
                              ↓
                      Cập nhật trạng thái cơ sở dữ liệu
                              ↓
                   Frontend polling lấy trạng thái mới nhất
```

Chuyển đổi trạng thái: `PENDING` → `PROCESSING` → `COMPLETED` / `FAILED`

**Luồng xử lý hỏi đáp kho tri thức**:

```
Hỏi đáp kho tri thức → Vector hóa câu hỏi → pgvector tìm kiếm độ tương đồng → Truy xuất tài liệu liên quan
                                                      ↓
                                Xây dựng Prompt → LLM tạo câu trả lời → SSE streaming trả về
```

## Công nghệ sử dụng

### Công nghệ backend

| Công nghệ             | Phiên bản  | Mô tả                                                     |
| --------------------- | ---------- | --------------------------------------------------------- |
| Spring Boot           | 4.0.1      | Framework ứng dụng                                        |
| Java                  | 21         | Ngôn ngữ phát triển (Virtual Threads)                     |
| Spring AI             | 2.0.0-M4   | Framework tích hợp AI                                     |
| PostgreSQL + pgvector | 14+        | Cơ sở dữ liệu quan hệ + lưu trữ vector                    |
| Redis + Redisson      | 6+ / 4.0.0 | Cache + hàng đợi tin nhắn (Stream)                        |
| Apache Tika           | 2.9.2      | Phân tích tài liệu                                        |
| iText 8               | 8.0.5      | Xuất PDF                                                  |
| MapStruct             | 1.6.3      | Ánh xạ đối tượng                                          |
| SpringDoc OpenAPI     | 3.0.2      | Tài liệu giao diện API                                    |
| DashScope SDK         | 2.22.7     | Nhận dạng/tổng hợp giọng nói (Qwen3 ASR/TTS)              |
| spring-ai-agent-utils | 0.7.0      | Thư viện Spring AI Agent Skills                           |
| WebSocket             | -          | Truyền thông hai chiều thời gian thực phỏng vấn giọng nói |
| Gradle                | 8.14       | Công cụ build                                             |

Giải đáp câu hỏi thường gặp về lựa chọn công nghệ:

1. Tại sao chọn PostgreSQL + pgvector để lưu trữ? PG lưu trữ dữ liệu vector đủ dùng, đơn giản hóa kiến trúc, không muốn đưa vào quá nhiều thành phần.
2. Tại sao đưa vào Redis?
   - Redis thay thế `ConcurrentHashMap` để thực hiện cache phiên phỏng vấn.
   - Dựa trên Redis Stream thực hiện bất đồng bộ cho các tình huống như phân tích CV, vector hóa kho tri thức (cũng có thể tách rời, phân tích và vector hóa có thể sử dụng ngôn ngữ lập trình khác). Không sử dụng [Kafka](https://javaguide.cn/high-performance/message-queue/kafka-questions-01.html) hay hàng đợi tin nhắn chín muồi hơn, cũng là để không đưa vào quá nhiều thành phần.
3. Tại sao chọn Gradle làm công cụ build? Cá nhân thích dùng Gradle hơn, cũng đã viết bài liên quan: [Tổng kết khái niệm cốt lõi Gradle](https://javaguide.cn/tools/gradle/gradle-core-concepts.html).

### Công nghệ frontend

| Công nghệ          | Phiên bản | Mô tả                    |
| ------------------ | --------- | ------------------------ |
| React              | 18.3      | Framework UI             |
| TypeScript         | 5.6       | Ngôn ngữ phát triển      |
| Vite               | 5.4       | Công cụ build            |
| Tailwind CSS       | 4.1       | Framework CSS            |
| React Router       | 7.11      | Quản lý routing          |
| Framer Motion      | 12.23     | Thư viện animation       |
| Recharts           | 3.6       | Thư viện biểu đồ         |
| Lucide React       | 0.468     | Thư viện icon            |
| React Big Calendar | 1.19      | Component lịch phỏng vấn |
| React Markdown     | 9.0       | Render Markdown          |
| React Virtuoso     | 4.18      | Danh sách cuộn ảo        |

## Giải đáp câu hỏi thường gặp về lựa chọn công nghệ

Đây chỉ là giới thiệu ngắn gọn, sau này tôi sẽ chia sẻ bài viết chi tiết về lựa chọn công nghệ.

### Tại sao chọn Spring AI?

Spring AI là framework tích hợp AI chính thức của Spring, cung cấp trừu tượng hóa thống nhất cho việc gọi LLM. Lý do chọn nó:

1. Trừu tượng hóa thống nhất: Một bộ code hỗ trợ nhiều nhà cung cấp LLM (OpenAI, Alibaba Cloud DashScope, Ollama, v.v.), chuyển đổi model chỉ cần sửa cấu hình
2. Tích hợp hệ sinh thái Spring: Tích hợp liền mạch với Spring Boot, hỗ trợ auto-configuration, dependency injection, declarative calling
3. Hỗ trợ lưu trữ vector tích hợp: Hỗ trợ native pgvector, Milvus, Pinecone và các cơ sở dữ liệu vector khác, đơn giản hóa phát triển RAG
4. Đầu ra có cấu trúc: Thông qua `BeanOutputConverter` ánh xạ trực tiếp đầu ra LLM thành đối tượng Java, không cần phân tích JSON thủ công

```java
// Ví dụ: Spring AI đầu ra có cấu trúc
var converter = new BeanOutputConverter<>(ResumeAnalysisDTO.class);
String result = chatClient.prompt()
    .system(systemPrompt)
    .user(userPrompt + converter.getFormat())
    .call()
    .content();
return converter.convert(result);  // Trực tiếp nhận đối tượng Java
```

### Tại sao chọn PostgreSQL + pgvector để lưu trữ dữ liệu?

Dự án này cần lưu trữ đồng thời dữ liệu có cấu trúc (CV, hồ sơ phỏng vấn) và dữ liệu vector (Embedding tài liệu). So sánh phương án:

| Phương án             | Ưu điểm                                           | Nhược điểm                                                       |
| --------------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| PostgreSQL + pgvector | Một cơ sở dữ liệu xử lý tất cả, vận hành đơn giản | Hiệu năng tìm kiếm vector không bằng thư viện vector chuyên dụng |
| PostgreSQL + Milvus   | Hiệu năng tìm kiếm vector tốt hơn                 | Thêm một thành phần, phức tạp vận hành hơn                       |
| PostgreSQL + Pinecone | Cloud-hosted, không cần vận hành                  | Chi phí cao, dữ liệu ở bên thứ ba                                |

**Lý do chọn pgvector**:

- Kiến trúc đơn giản: Không đưa vào thành phần bổ sung, giảm độ phức tạp triển khai và vận hành
- Hiệu năng đủ dùng: Index HNSW hỗ trợ truy vấn mili giây, hoàn toàn đủ dùng cho tình huống hàng chục nghìn tài liệu
- Tính nhất quán giao dịch: Dữ liệu vector và dữ liệu nghiệp vụ trong cùng một cơ sở dữ liệu, hỗ trợ giao dịch tự nhiên
- Truy vấn SQL: Có thể kết hợp điều kiện WHERE để lọc, ví dụ "chỉ tìm kiếm trong kho tri thức của một danh mục cụ thể"

```sql
-- Ví dụ tìm kiếm độ tương đồng pgvector
SELECT content, 1 - (embedding <=> \$1) as similarity
FROM vector_store
WHERE metadata->>'category' = 'Java'
ORDER BY embedding <=> \$1
LIMIT 5;
```

**Tại sao không chọn MySQL kết hợp cơ sở dữ liệu vector?**

Ưu thế lớn nhất của PostgreSQL, cũng là "切牌" giúp nó vượt đối thủ trong kỷ nguyên AI, là tính mở rộng mạnh mẽ. Nhà phát triển có thể cài đặt các plugin chức năng mạnh mẽ cho cơ sở dữ liệu mà không cần sửa đổi kernel, làm cho PostgreSQL trở thành "dao quân đội Thụy Sĩ dữ liệu" đa năng.

- **Tìm kiếm vector AI?** Có extension **pgvector** được khuyến nghị chính thức, hiệu năng mạnh mẽ, hệ sinh thái trưởng thành, có thể sánh với cơ sở dữ liệu vector chuyên dụng.
- **Tìm kiếm toàn văn?** Hỗ trợ tích hợp (đáp ứng nhu cầu cơ bản), hoặc sử dụng extension như **pg_bm25**.
- **Dữ liệu chuỗi thời gian?** Có extension **TimescaleDB** hàng đầu.
- **Thông tin địa lý?** Có extension **PostGIS** tiêu chuẩn ngành.

Khả năng "một cửa" này chính là sức hấp dẫn. Nó có nghĩa là nhiều dự án không cần phụ thuộc vào nhiều middleware bên ngoài như Elasticsearch, Milvus, chỉ cần một PostgreSQL tăng cường có thể đáp ứng các nhu cầu đa dạng, từ đó đơn giản hóa đáng kể tech stack, giảm độ phức tạp và chi phí phát triển và vận hành.

Về so sánh chi tiết MySQL và PostgreSQL, có thể tham khảo bài viết tôi đã viết: [MySQL vs PostgreSQL, Chọn gì?](https://mp.weixin.qq.com/s/APWD-PzTcTqGUuibAw7GGw).

### Tại sao đưa vào Redis?

Dự án này chủ yếu có hai tình huống sử dụng Redis:

1. Redis thay thế `ConcurrentHashMap` để thực hiện cache phiên.
2. Dựa trên Redis Stream thực hiện bất đồng bộ cho các tình huống như phân tích CV, vector hóa kho tri thức (cũng có thể tách rời, phân tích và vector hóa có thể sử dụng ngôn ngữ lập trình khác).

**Tại sao đưa vào Redis Stream? Tại sao không chọn Kafka, RabbitMQ hay hàng đợi tin nhắn trưởng thành hơn?**

Các tác vụ AI như phân tích CV, vector hóa kho tri thức mất thời gian khá lâu (10-60 giây), không phù hợp xử lý đồng bộ. Cần hàng đợi tin nhắn để thực hiện tách rời bất đồng bộ.

| Chiều                      | Redis Stream                                    | RabbitMQ                                    | Kafka                                        | Hàng đợi bộ nhớ                                         |
| :------------------------- | :---------------------------------------------- | :------------------------------------------ | :------------------------------------------- | :------------------------------------------------------ |
| **Thông lượng**            | Cao (trăm nghìn QPS)                            | Trung bình (vạn QPS)                        | Cực cao (triệu, mở rộng ngang)               | Cực cao (hàng chục triệu/giây, giới hạn bởi CPU/bộ nhớ) |
| **Độ trễ**                 | Cực thấp (dưới mili giây)                       | Thấp (mili giây)                            | Trung bình (mili đến chục mili giây)         | Cực thấp (nano/micro giây)                              |
| **Lưu trữ bền vững**       | Hỗ trợ (RDB/AOF)                                | Hỗ trợ (Mnesia/đĩa)                         | Hỗ trợ mạnh (log phân đoạn native)           | Không (tiến trình kết thúc là mất)                      |
| **Khả năng chứa tin nhắn** | Trung bình (giới hạn bởi bộ nhớ)                | Trung bình (chứa đĩa, hiệu năng giảm rõ)    | Cực mạnh (lưu trữ đĩa TB)                    | Kém (giới hạn bởi heap bộ nhớ)                          |
| **Chế độ tiêu thụ**        | Pub/sub / Consumer group                        | Routing linh hoạt / nhiều chế độ exchange   | Pub/sub / Consumer group                     | Point-to-point / multi-consumer (tùy triển khai)        |
| **Phát lại tin nhắn**      | Hỗ trợ (theo ID / khoảng thời gian)             | Không hỗ trợ                                | Hỗ trợ mạnh (theo Offset / timestamp)        | Không hỗ trợ                                            |
| **Thứ tự tin nhắn**        | Stream đơn có thứ tự                            | Hàng đợi đơn có thứ tự                      | Partition đơn có thứ tự                      | Có thứ tự (hàng đợi đơn)                                |
| **Độ tin cậy**             | Trung bình (replication bất đồng bộ có thể mất) | Cao (Publisher Confirm / transaction)       | Cực cao (multi-replica ISR + acks)           | Thấp (không lưu trữ, không xác nhận)                    |
| **Độ phức tạp vận hành**   | Thấp                                            | Trung bình                                  | Cao (chế độ KRaft đã đơn giản hóa)           | Cực thấp                                                |
| **Tình huống phù hợp**     | Xử lý luồng nhẹ nhàng, đã có Redis              | Routing phức tạp, tích hợp cấp doanh nghiệp | Luồng big data, event sourcing, tổng hợp log | Tách rời trong tiến trình, tình huống hiệu năng tối đa  |

Lý do chọn Redis Stream:

- Tái sử dụng thành phần hiện có: Redis đã được dùng cho cache phiên, không cần đưa vào middleware mới.
- Chức năng đáp ứng nhu cầu: Hỗ trợ consumer group, xác nhận tin nhắn (ACK), lưu trữ bền vững.
- Vận hành đơn giản: Đối với dự án vừa và nhỏ, Redis Stream hoàn toàn đủ dùng.

### Tại sao chọn Gradle làm công cụ build?

Spring Boot official bây giờ cũng dùng Gradle, thêm vào việc trong nước hiện tại Maven phổ biến hơn, đổi sang Gradle còn mới hơn.

Cá nhân cũng thích dùng Gradle hơn, cũng đã viết bài liên quan: [Tổng kết khái niệm cốt lõi Gradle](https://javaguide.cn/tools/gradle/gradle-core-concepts.html).

### Tại sao sử dụng MapStruct?

Dự án có nhiều nhu cầu chuyển đổi Entity ↔ DTO, MapStruct là framework ánh xạ đối tượng tạo code tại thời điểm biên dịch:

| Phương án   | Hiệu năng                    | Type safety               | Độ phức tạp sử dụng          |
| ----------- | ---------------------------- | ------------------------- | ---------------------------- |
| MapStruct   | Không reflection, nhanh nhất | Kiểm tra tại compile time | Định nghĩa interface là được |
| BeanUtils   | Reflection, chậm             | Báo lỗi tại runtime       | Một dòng code                |
| ModelMapper | Reflection, tương đối chậm   | Báo lỗi tại runtime       | Cấu hình phức tạp            |
| Viết tay    | Nhanh nhất                   | Kiểm tra tại compile time | Code lặp nhiều               |

### Tại sao sử dụng Apache Tika?

Hệ thống cần phân tích tài liệu nhiều định dạng (PDF, Word, TXT), Apache Tika là thư viện phân tích tài liệu của Apache Foundation:

- Hỗ trợ định dạng đầy đủ: PDF, DOCX, DOC, TXT, HTML, Markdown và hàng trăm định dạng khác
- Tự động nhận dạng: Tự động phát hiện định dạng theo nội dung file, không cần phụ thuộc vào phần mở rộng file
- Trích xuất văn bản: API thống nhất trích xuất văn bản thuần, che khuất sự khác biệt định dạng

```java
// Ví dụ phân tích Tika
Tika tika = new Tika();
String content = tika.parseToString(inputStream);  // Tự động nhận dạng định dạng và trích xuất văn bản
```

### Tại sao sử dụng SSE thay vì WebSocket?

Hỏi đáp kho tri thức cần đầu ra streaming (hiển thị từng chữ như ChatGPT), có hai lựa chọn kỹ thuật:

| Phương án | Ưu điểm                                 | Nhược điểm                                         |
| --------- | --------------------------------------- | -------------------------------------------------- |
| SSE       | Đơn giản, dựa trên HTTP, push một chiều | Chỉ hỗ trợ server → client                         |
| WebSocket | Truyền thông hai chiều, chức năng mạnh  | Giao thức phức tạp, cần duy trì trạng thái kết nối |

Lý do chọn SSE:

- Phù hợp tình huống: Đầu ra streaming LLM là một chiều (server → client), không cần truyền thông hai chiều
- Triển khai đơn giản: Dựa trên HTTP, hỗ trợ tự nhiên reconnect, cross-origin
- Spring hỗ trợ tốt: `Flux<ServerSentEvent<String>>` một dòng code xong

### Tại sao frontend chọn React + TypeScript + Tailwind CSS?

| Công nghệ    | Lý do chọn                                                                               |
| ------------ | ---------------------------------------------------------------------------------------- |
| React        | Hệ sinh thái trưởng thành nhất, phát triển component hóa, tài nguyên cộng đồng phong phú |
| TypeScript   | Type safety, IDE gợi ý thông minh, giảm lỗi runtime                                      |
| Vite         | Dev server khởi động nhanh (giây), trải nghiệm HMR hot update tốt                        |
| Tailwind CSS | Atomic CSS, phát triển nhanh, không cần viết file CSS                                    |

## Tính năng chức năng

### Module quản lý CV

- **Phân tích đa định dạng**: Hỗ trợ nhiều định dạng CV như PDF, DOCX, DOC, TXT.
- **Luồng xử lý bất đồng bộ**: Dựa trên Redis Stream thực hiện phân tích CV bất đồng bộ, hỗ trợ xem tiến độ xử lý thời gian thực (Chờ phân tích/Đang phân tích/Đã hoàn thành/Thất bại).
- **Đảm bảo ổn định**: Cơ chế retry tự động khi phân tích thất bại (tối đa 3 lần) và phát hiện trùng lặp dựa trên hash nội dung.
- **Xuất báo cáo phân tích**: Hỗ trợ xuất kết quả phân tích AI thành báo cáo phân tích CV PDF có cấu trúc bằng một cú nhấp.

### Module phỏng vấn mô phỏng

- **Ra câu hỏi dựa trên Skill**: Tích hợp sẵn 10+ hướng phỏng vấn (Java backend, chuyên đề Alibaba/ByteDance/Tencent, frontend, Python, thuật toán, thiết kế hệ thống, phát triển kiểm thử, AI Agent, v.v.), mỗi hướng được định nghĩa bởi `SKILL.md` với phạm vi kiểm tra, phân bổ độ khó và kho kiến thức tham khảo. Thực hiện tải theo nhu cầu dựa trên cơ chế Progressive Disclosure của `spring-ai-agent-utils`.
- **Ra câu hỏi song song hai hướng**: Khi có CV, 60% câu hỏi đào sâu dự án CV (Prompt độc lập) + 40% câu hỏi cơ bản theo hướng (dựa trên Skill), sử dụng virtual thread Java 21 tạo song song rồi hợp nhất, phân tách vật lý tránh xung đột Prompt.
- **Phân tích JD tùy chỉnh**: Dán mô tả vị trí (JD), LLM động trích xuất phân loại phỏng vấn và khớp kho câu hỏi chia sẻ, không cần đặt hướng sẵn là có thể bắt đầu phỏng vấn.
- **Hướng đề xuất từ CV**: Sau khi tải CV, LLM tự động đề xuất hướng phỏng vấn phù hợp nhất qua Semantic Matching, giảm chi phí lựa chọn của người dùng.
- **Loại trùng câu hỏi lịch sử**: Khi ra câu hỏi tự động loại trừ các câu đã hỏi trong các phiên hiện có, tránh kiểm tra lặp.
- **Liên kết thời lượng giai đoạn phỏng vấn**: Sau khi kéo thanh tổng thời lượng, các giai đoạn (giới thiệu bản thân, kiểm tra kỹ thuật, đào sâu dự án, hỏi ngược) tự động phân bổ theo tỷ lệ thời gian.
- **Luồng hỏi thêm thông minh**: Hỗ trợ cấu hình nhiều vòng hỏi thêm thông minh (mặc định 1 câu), mô phỏng tình huống hỏi đáp nhiều vòng.
- **Kiến trúc đánh giá thống nhất**: Phỏng vấn văn bản và phỏng vấn giọng nói dùng chung một bộ engine đánh giá (đánh giá theo lô + đầu ra có cấu trúc + tổng hợp lần hai + fallback dự phòng), kết quả đánh giá có thể so sánh.
- **Xuất báo cáo một lần**: Hỗ trợ tạo bất đồng bộ và xuất báo cáo đánh giá phỏng vấn mô phỏng PDF chi tiết.
- **Điểm vào trung tâm phỏng vấn**: Trang trung tâm phỏng vấn tích hợp điểm vào phỏng vấn văn bản và phỏng vấn giọng nói, hỗ trợ tiếp tục phỏng vấn và phỏng vấn lại.

### Module sắp xếp phỏng vấn

- **Phân tích lời mời**: Hai engine quy tắc + AI, hỗ trợ định dạng Feishu/Tencent Meeting/Zoom, tự động trích xuất công ty, vị trí, thời gian, link cuộc họp
- **Quản lý lịch**: Chế độ xem ngày/tuần/tháng + kéo thả điều chỉnh + chế độ xem danh sách
- **Chuyển đổi trạng thái**: Tác vụ định kỳ tự động hết hạn, đánh dấu thủ công chờ phỏng vấn/đã hoàn thành/đã hủy
- **Nhắc nhở phỏng vấn**: Có thể cấu hình nhắc nhở, tránh bỏ lỡ phỏng vấn

### Module phỏng vấn giọng nói

Phỏng vấn đối thoại giọng nói thời gian thực, WebSocket + mô hình giọng nói Qianwen3 (API Key thống nhất cho ASR/TTS/LLM):

- **Đối thoại streaming thời gian thực**: TTS song song cấp câu, vừa tạo vừa tổng hợp vừa phát, độ trễ gói đầu tiên 200ms
- **VAD phía server**: Tự động ngắt câu, phụ đề thời gian thực (bao gồm kết quả trung gian)
- **Bảo vệ echo + gửi thủ công**: Tránh âm thanh AI bị thu nhầm
- **Bộ nhớ ngữ cảnh nhiều vòng + tạm dừng/tiếp tục**: Tự động tạm dừng khi timeout
- **Đo lường Micrometer**: Các chỉ số như độ trễ TTS/ASR, thời lượng phiên

> **Vấn đề đã biết**: Độ trễ end-to-end cao (server chuyển tiếp âm thanh), echo rò rỉ khi không có tai nghe, màu sắc âm thanh TTS đơn điệu, âm thanh gián đoạn khi mạng yếu. Sau này dự kiến khám phá WebRTC, client-side VAD khử nhiễu, mô hình giọng nói end-to-end, v.v.

### Module quản lý kho tri thức

- **Xử lý tài liệu thông minh**: Hỗ trợ tải lên, phân khối và vector hóa bất đồng bộ tự động cho nhiều định dạng tài liệu như PDF, DOCX, Markdown.
- **Tăng cường tìm kiếm RAG**: Tích hợp cơ sở dữ liệu vector, nâng cao độ chính xác và chuyên sâu của hỏi đáp AI thông qua Retrieval-Augmented Generation (RAG).
- **Tương tác phản hồi streaming**: Thực hiện phản hồi streaming kiểu đánh máy dựa trên công nghệ SSE (Server-Sent Events).
- **Hỏi đáp thông minh**: Hỗ trợ hỏi đáp thông minh dựa trên nội dung kho tri thức, cung cấp thông tin thống kê kho tri thức trực quan.

## Hiệu ứng demo

### CV và phỏng vấn

Trung tâm phỏng vấn:

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-interview-hub.png)

Ra câu hỏi Skill + phân tích JD:

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-skill-jd-parse.png)

Thư viện CV:

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-resume-history.png)

Tải lên và phân tích CV:

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-resume-upload-analysis.png)

Chi tiết phân tích CV:

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-resume-analysis-detail.png)

Lịch sử phỏng vấn:

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-interview-history.png)

Chi tiết phỏng vấn:

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-interview-detail.png)

Phỏng vấn mô phỏng:

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-mock-interview.png)

Sắp xếp phỏng vấn

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-interview-schedule-list.png)

### Kho tri thức

Quản lý kho tri thức:

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-knowledge-base-management.png)

Trợ lý hỏi đáp:

![page-qa-assistant](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/page-qa-assistant.png)

## Học dự án này bạn sẽ đạt được gì?

Dự án này sử dụng tech stack Java 21 + Spring Boot 4.0 tiên tiến nhất ngành, là dự án thực chiến full-stack đầu tiên trên thị trường tích hợp sâu Spring AI 2.0. Chúng tôi không chỉ cung cấp code chất lượng cao, mà còn đi kèm hướng dẫn phân tích kiến trúc chi tiết.

Thiết kế tổng thể dự án theo nguyên tắc "từ cơ bản đến nâng cao". Dù nền tảng lập trình của bạn còn yếu, chỉ cần theo hướng dẫn từng bước của chúng tôi, cũng có thể suôn sẻ xây dựng từ đầu một ứng dụng mô hình AI lớn cấp sản xuất.

### Nắm vững sâu mô hình phát triển ứng dụng AI cốt lõi

Dự án này là bàn đạp tốt nhất để bạn chuyển từ backend truyền thống sang kỹ sư phát triển ứng dụng AI:

- **Thực chiến công nghiệp Spring AI 2.0**: Hiểu sâu tầng trừu tượng AI chính thức của Spring, nắm vững cách kết nối với Tongyi Qianwen, OpenAI và các model chính thống khác qua giao diện declarative thống nhất.

- **Ứng dụng sâu Prompt Engineering (kỹ thuật prompt)**: Thoát khỏi ghép chuỗi đơn giản. Học cách xây dựng System/User Prompt có cấu trúc, và sử dụng BeanOutputConverter thực hiện ánh xạ tự động đầu ra LLM sang đối tượng Java, chấm dứt hoàn toàn việc phân tích JSON thủ công phiền phức.

- **Công nghệ Query Rewrite (viết lại truy vấn)**: Học cách sử dụng LLM viết lại thông minh truy vấn gốc của người dùng, bổ sung ngữ nghĩa, tối ưu từ khóa tìm kiếm, nâng cao đáng kể tỷ lệ recall của hệ thống RAG. Nắm vững chiến lược tìm kiếm cascade "câu hỏi gốc → câu hỏi đã viết lại → quay lại câu hỏi gốc".

- **Tinh chỉnh tham số tìm kiếm động**: Hiểu sâu cách điều chỉnh động topK và ngưỡng độ tương đồng dựa trên độ dài truy vấn, mật độ ngữ nghĩa và các đặc điểm khác, thực hiện chiến lược tìm kiếm khác biệt cho truy vấn ngắn, trung bình và dài.

- **Vòng lặp đầy đủ RAG (Retrieval-Augmented Generation)**: Phân tích sâu chuỗi kỹ thuật hoàn chỉnh "phân tích tài liệu → phân khối văn bản → vector hóa (Embedding) → lưu trữ cơ sở dữ liệu vector → tìm kiếm độ tương đồng → tạo sinh tăng cường ngữ cảnh". Học cơ chế "phán định có kết quả hợp lệ", tránh các đoạn văn có liên quan yếu kích hoạt model trả lời dài "thông tin không đủ".

- **Độ tin cậy đầu ra có cấu trúc và chiến lược retry**: Nắm vững mô hình đóng gói thống nhất `StructuredOutputInvoker`, học cách nâng cao đáng kể tỷ lệ phân tích thành công của đầu ra có cấu trúc LLM thông qua retry tự động, tiêm lỗi, chỉ thị JSON nghiêm ngặt và các cách khác.

### Tư duy kiến trúc backend Java hiện đại

Bạn có thể học được các thực hành kỹ thuật xuất sắc:

- **Chào đón Java 21 và Spring Boot 4.0**: Đón đầu Virtual Threads, Record class và các tính năng hiệu năng cao khác. Thích nghi sâu với thiết kế module hóa của Spring Boot 4.0, để tech stack của bạn dẫn đầu thị trường.

- **Kiến trúc monolith module hóa**: Học cách tổ chức code qua phân tầng rõ ràng (Modules + Infrastructure + Common). Thiết kế này vừa có ưu điểm tách rời của microservice, lại giảm đáng kể gánh nặng tâm lý vận hành của ứng dụng monolith.

- **Hiệu năng chuyển đổi đối tượng tối đa**: Thông qua MapStruct tạo code ánh xạ tại compile time. Học cách xử lý thanh lịch, an toàn việc ánh xạ phức tạp giữa Entity và DTO trong các tình huống theo đuổi tốc độ phản hồi tối đa.

### Lựa chọn lưu trữ dữ liệu và middleware thực tế

Chúng tôi từ chối tích hợp middleware một cách mù quáng, mà dạy bạn cách đưa ra lựa chọn "lý trí nhất" dựa trên tình huống nghiệp vụ:

- **Phương án lưu trữ "một cửa" PostgreSQL + pgvector**: Nắm vững cách xử lý hiệu quả dữ liệu nghiệp vụ quan hệ và dữ liệu vector chiều cao trong cùng một bộ cơ sở dữ liệu. Học sâu thực hành tinh chỉnh hiệu năng index HNSW trong tình huống hàng chục nghìn tài liệu.

- **Hệ thống giới hạn tốc độ phân tán Redis + Lua**: Thực chiến đóng gói thành phần giới hạn tốc độ phân tán hiệu năng cao. Dựa trên Lua script đảm bảo tính nguyên tử của logic giới hạn tốc độ, hỗ trợ kiểm soát lưu lượng chính xác theo người dùng, IP hoặc chiều toàn cục, phòng thủ hiệu quả hành vi nhấn API ác ý, bảo vệ an toàn hạn ngạch API AI giá trị cao.

- **Xử lý tác vụ bất đồng bộ Redis Stream**: Khám phá sâu tại sao chọn Redis Stream nhẹ nhàng thay vì Kafka trong các tình huống tốn thời gian như phân tích CV (10-60 giây). Thực chiến trình diễn cách thực hiện tách rời hệ thống và cắt giảm lưu lượng đỉnh thông qua hàng đợi tin nhắn.

- **Xử lý và tối ưu hóa làm sạch file cấp doanh nghiệp**: Không chỉ xây dựng engine phân tích tài liệu thông dụng bằng Apache Tika, mà còn triển khai thêm TextCleaningService. Thông qua làm sạch regex, chuẩn hóa dòng trống và khử nhiễu văn bản (như loại bỏ link ảnh, ký tự điều khiển bất hợp lệ), nâng cao đáng kể chất lượng recall RAG; đồng thời tích hợp phát hiện hash nội dung, chặn tải lên trùng lặp từ đầu nguồn, tiết kiệm chi phí lưu trữ và Token.

### Mô hình thiết kế chức năng AI nâng cao

- **Kiến trúc Skill và Agent Skills**: Học cách tách rời cấu hình hướng phỏng vấn khỏi code, thiết kế cấu hình hai tầng dựa trên `SKILL.md` + `skill.meta.yml`. Nắm vững cơ chế Progressive Disclosure ba tầng Discovery → Semantic Matching → Execution của `spring-ai-agent-utils`, và chiến lược tải tài nguyên khác biệt của phỏng vấn văn bản (gọi một lần, tải trước) và phỏng vấn giọng nói (nhiều vòng ReAct, tải theo nhu cầu).

- **Kiến trúc ra câu hỏi song song hai hướng**: Hiểu sâu vấn đề xung đột Prompt "một lần gọi không thể cân bằng cả CV và hướng", học cách thực hiện ra câu hỏi hỗn hợp 60% câu hỏi CV + 40% câu hỏi hướng thông qua phân tách vật lý (hai bộ template Prompt độc lập + hai hướng gọi AI song song), cùng thiết kế chiến lược hợp nhất index và hạ cấp.

- **Cơ chế tạo hỏi thêm nhiều vòng**: Học cách thực hiện cấu trúc cây "câu hỏi chính + hỏi thêm" thông qua thiết kế Prompt nhiều tầng trong tình huống tạo câu hỏi phỏng vấn. Nắm vững các kỹ thuật thực chiến như số lượng hỏi thêm có thể cấu hình, phân bổ trọng số loại câu hỏi, loại trùng lịch sử.

- **Xử lý thông minh đầu ra streaming**: Nắm vững công nghệ "cửa sổ thăm dò" trong tình huống streaming SSE—trong khi duy trì tốc độ phản hồi chữ đầu tiên, nhanh chóng nhận dạng đầu ra "không có thông tin" và thống nhất thành template cố định, tránh người dùng thấy văn bản từ chối dài.

- **Chiến lược không có kết quả thống nhất**: Học cách thiết kế trải nghiệm không có kết quả nhất quán cho người dùng trong hệ thống RAG, bao gồm tối ưu toàn liên kết như phán định kết quả, chuẩn hóa đầu ra, cắt ngắn streaming.

### Giao hàng kỹ thuật công nghệ và triển khai tiêu chuẩn hóa

- **Hệ thống build hiện đại Gradle**: Thoát khỏi cấu hình phiền phức của Maven, nắm vững tính linh hoạt của Gradle 8.14 và Version Catalog, học cách quản lý thanh lịch các phụ thuộc dự án lớn.

- **Triển khai container hóa cấp sản xuất**: Thông qua Docker Compose một lệnh dựng toàn bộ môi trường chạy bao gồm mở rộng cơ sở dữ liệu, cache, object storage, hiểu quy chuẩn cấu hình cơ sở hạ tầng trong kỷ nguyên cloud native.

### Kỹ thuật công nghệ frontend mượt mà và trải nghiệm tương tác

Đối với các nhà phát triển backend, đây còn là cơ hội tuyệt vời để bổ sung "tầm nhìn full-stack":

- **Render streaming SSE (Server-Sent Events)**: Nắm vững công nghệ cơ bản cho đầu ra từng chữ như ChatGPT, hiểu ưu thế kiến trúc so với WebSocket trong tình huống push một chiều.

- **UI responsive và thiết kế hiệu ứng**: Xây dựng giao diện đẹp mắt tối giản bằng Tailwind CSS, kết hợp Framer Motion thực hiện hiệu ứng tương tác nâng cao.

- **Trực quan hóa dữ liệu AI**: Thông qua Recharts biểu diễn điểm số phân tích CV và so sánh đa chiều sau khi AI phân tích dưới dạng radar chart trực quan, để dữ liệu "biết nói".

## Cách tham gia học tập?

Nhiều dự án AI chỉ dừng lại ở việc gọi một API. Còn dự án này đưa bạn giải quyết **các vấn đề kỹ thuật thực tế**:

- Làm thế nào xử lý vấn đề mô hình lớn phản hồi chậm? (**Xử lý bất đồng bộ + Redis Stream**)
- Làm thế nào để mô hình lớn xuất dữ liệu có định dạng cố định? (**Structured Prompt + MapStruct**)
- Làm thế nào để mô hình lớn trả lời dựa trên tài liệu riêng tư? (**RAG + pgvector**)

**Dự án này là dự án thực chiến độc quyền nội bộ của [JavaGuide Kiến thức sao](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html), đọc học trực tuyến qua tài liệu Yuque, không mở riêng ra ngoài.**

Lý do chọn phát hành trong nội bộ sao, là để đảm bảo mỗi người học đều nhận được **hỗ trợ kỹ thuật chuyên sâu** và **dịch vụ hỗ trợ xin việc hoàn chỉnh**.

Đây chỉ là bắt đầu. Sau này sao sẽ tiếp tục ra mắt nhiều **dự án thực chiến Java** phù hợp với tình huống nghiệp vụ thực tế của doanh nghiệp hơn, giúp bạn luôn đứng ở đầu công nghệ (hé lộ trước, dự án tiếp theo là **hệ thống dịch vụ khách hàng thông minh cấp doanh nghiệp**, sẽ dẫn mọi người thực hành nhiều khả năng AI hơn).

Ngoài ra, sao của tôi còn có nhiều dịch vụ khác, ví dụ **hỏi đáp 1-1, chỉnh sửa CV, tài liệu phỏng vấn hệ thống backend (bao gồm thiết kế hệ thống tần số cao & câu hỏi tình huống), học tập chấm điểm**, v.v., bất kỳ dịch vụ nào trong số đó khi lấy ra riêng lẻ cũng đã vượt xa giá vé sao. Hoan nghênh tìm hiểu chi tiết [Kiến thức sao](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html)!

Đã duy trì kiên trì **sáu năm**, nội dung liên tục cập nhật, dù giá rất rẻ (**0.4 tệ/ngày**) nhưng chất lượng rất cao, chủ trương là chân thành!

Hiện sao đang khuyến mãi, giá hai cuốn sách, bạn có thể sở hữu dịch vụ của trung tâm đào tạo hàng chục nghìn! Đây cung cấp thêm một phiếu giảm giá **30 tệ** (giá sắp tăng, người dùng cũ quét mã gia hạn giảm nửa giá):

![Phiếu giảm giá Kiến thức sao 30 tệ](https://oss.javaguide.cn/xingqiu/xingqiuyouhuijuan-30.jpg)

Tận tâm làm nội dung, giữ vững bản tâm, không trục lợi, còn lại giao cho thời gian! Cùng cố gắng!
