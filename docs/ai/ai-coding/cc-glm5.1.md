---
title: Thực chiến tích hợp mô hình bên thứ ba với Claude Code: Chẩn đoán thông minh JVM và xử lý slow query
description: Thông qua việc tích hợp mô hình GLM-5.1 với Claude Code, hoàn thành hai nhiệm vụ thực chiến là xây dựng từ đầu trợ lý chẩn đoán JVM thông minh và xử lý slow query với dữ liệu hàng triệu bản ghi, chia sẻ phương pháp làm việc và kinh nghiệm thực tế trong lập trình với sự hỗ trợ của AI.
category: Thực chiến lập trình AI
head:
  - - meta
    - name: keywords
      content: Claude Code,AI编程,GLM-5.1,JVM诊断,慢查询优化,AI辅助开发,Arthas,Agent,Spring AI
---

Xin chào mọi người, tôi là Guide. Trước đây đã chia sẻ [thực chiến IDEA kết hợp plugin Qoder](./idea-qoder-plugin.md) và [thực chiến Trae tích hợp mô hình lớn](./trae-m2.7.md), bao phủ lần lượt lập trình với sự hỗ trợ của AI trong hệ sinh thái JetBrains và VS Code. Bài này đổi góc độ, nói về trải nghiệm thực chiến của **Claude Code tích hợp mô hình bên thứ ba**.

Claude Code bản thân là công cụ CLI lập trình chính thức của Anthropic, nhưng nó hỗ trợ chuyển đổi mô hình cơ bản thông qua biến môi trường. Điều này có nghĩa là bạn không phải giới hạn ở dòng Claude, hoàn toàn có thể tích hợp các mô hình khác để sử dụng. Bài này lấy GLM-5.1 làm ví dụ, nhưng cách tích hợp là chung — đổi sang các mô hình tương thích khác, quy trình về cơ bản giống nhau.

Tôi đã chọn hai tình huống phức tạp khá đặc trưng để kiểm chứng:

- **Tình huống 1**: Từ đầu xây dựng một JVM intelligent diagnosis Agent dựa trên Arthas, bao gồm toàn bộ quy trình từ lựa chọn công nghệ, thiết kế kiến trúc đến triển khai code
- **Tình huống 2**: Trong hệ thống đơn hàng đã có với dữ liệu hàng triệu bản ghi, xác định và xử lý slow query, kiểm tra khả năng hiểu code base hiện có và tối ưu hóa tăng dần của AI

Một cái là từ đầu bàn giao công trình, một cái là tối ưu hiệu năng đối mặt với hệ thống đã có, vừa hay bao phủ hai chế độ làm việc điển hình của lập trình với sự hỗ trợ của AI.

## Chuẩn bị môi trường: Claude Code tích hợp mô hình bên thứ ba

Trước khi chính thức bắt đầu, cần hoàn thành việc kết nối Claude Code với mô hình bên thứ ba. Toàn bộ quá trình cấu hình chia ba bước:

**Bước 1**: Cài đặt Claude Code

```bash
npm i -g @anthropic-ai/claude-code@latest
```

**Bước 2**: Cài đặt cc-switch để hoàn thành chuyển đổi mô hình (người dùng macOS có thể cài đặt qua homebrew, chi tiết tham khảo tài liệu chính thức cc-switch: <https://github.com/farion1231/cc-switch/blob/main/README_ZH.md>)

**Bước 3**: Theo hướng dẫn của nhà cung cấp mô hình, hoàn thành cấu hình quan hệ tương ứng giữa biến môi trường mô hình nội bộ Claude Code và mô hình đích. Lấy GLM-5.1 làm ví dụ, tham khảo: <https://docs.bigmodel.cn/cn/coding-plan/tool/claude>

Ảnh chụp màn hình quá trình cấu hình như sau:

Click dấu cộng để thêm mô hình:

![点击添加模型](https://oss.javaguide.cn/ai/coding/glm5.1-cc/add-model-entry.png)

Chọn mô hình tương ứng:

![选择模型](https://oss.javaguide.cn/ai/coding/glm5.1-cc/select-model.png)

Cấu hình tham số:

![配置参数](https://oss.javaguide.cn/ai/coding/glm5.1-cc/config-params.png)

Cấu hình JSON về quan hệ tương ứng giữa biến môi trường mô hình nội bộ Claude Code và mô hình đích:

![Claude Code 内部模型环境变量与模型对应关系 JSON 配置](https://oss.javaguide.cn/ai/coding/glm5.1-cc/model-env-json-config.png)

Nếu bạn nghiêng về phát triển giao diện, khuyến nghị tương tác và nghiệm thu code thông qua VSCode + Claude Code for VS Code. Sau khi hoàn thành cài đặt plugin, có thể trực tiếp đối thoại với mô hình và review code trong IDE, so với giao diện CLI sẽ trực quan hơn:

![VSCode + Claude Code for VS Code](https://oss.javaguide.cn/ai/coding/glm5.1-cc/vscode-claude-code.png)

## Tình huống 1: Từ đầu xây dựng JVM Intelligent Diagnosis Agent

### Tại sao cần trợ lý chẩn đoán JVM thông minh?

Chẩn đoán JVM trực tuyến từ trước đến nay vẫn là vấn đề khó khăn nhất của lập trình viên Java. Trong mô hình phát triển truyền thống, đối mặt với nút cổ chai hiệu năng hoặc sự cố trực tuyến, con đường kiểm tra của nhân viên R&D về cơ bản đã cố định:

1. Xem bảng giám sát Grafana, xác định sơ bộ hướng bất thường
2. Đăng nhập vào server trực tuyến, kiểm tra các chỉ số CPU, memory, GC và các chỉ số khác
3. Sau khi xác định rõ vấn đề ở tầng ứng dụng Java, khởi động Arthas thực thi một loạt chỉ lệnh chẩn đoán, từng bước thu hẹp phạm vi vấn đề
4. Định vị đến đoạn code cụ thể, phân tích nguyên nhân gốc rễ và xây dựng phương án sửa chữa

Trước khi AI xuất hiện, quy trình này tuy phức tạp nhưng thực sự là phương tiện trực tiếp và hiệu quả nhất. Nhưng khi nghiệp vụ ngày càng phức tạp, yêu cầu về thời gian phản hồi sự cố cũng ngày càng cao, nhược điểm của mô hình truyền thống ngày càng rõ ràng:

- **Chỉ số giám sát quá chủ quan**: Đối mặt với đủ loại vấn đề kỳ lạ như CPU tăng vọt, memory leak, OOM, chỉ số trên bảng giám sát rất nhiều, nhân viên R&D thường dựa vào kinh nghiệm để suy đoán chủ quan, thiếu phương pháp luận chẩn đoán có hệ thống
- **Chuỗi chẩn đoán quá dài**: Từ bảng Grafana đến server trực tuyến rồi đến chẩn đoán Arthas, toàn bộ chuỗi kiểm tra liên quan đến việc chuyển đổi và kết nối nhiều công cụ, không chỉ tốn thời gian, mà đối với việc kiểm soát sự cố trực tuyến khẩn cấp còn có vẻ rất kém hiệu quả
- **Phụ thuộc cao vào kinh nghiệm kỹ sư**: Arthas thực sự là một công cụ chẩn đoán JVM mạnh mẽ, tích hợp sẵn các chỉ lệnh enhanced khác nhau có thể đi sâu vào bytecode để xem chi tiết runtime. Nhưng cái giá là nhà phát triển phải quen thuộc với các tham số chỉ lệnh và con đường suy luận khác nhau, mới có thể chính xác hoàn thành việc xác định vị trí vấn đề

Với sự tiến bộ của công nghệ AI, đặc biệt là sự trưởng thành của các khái niệm như Agent và Skill, tác giả có một ý tưởng công trình: có thể nhờ AI để kết tủa và tái sử dụng kinh nghiệm chẩn đoán, để AI xây dựng con đường quyết định rõ ràng dựa trên kinh nghiệm đã có không? Đồng thời kết hợp với phương án quyết định của nó, trao cho nó các công cụ tương ứng, dựa trên tên service và biểu hiện lỗi do người dùng cung cấp, tự động kết nối server trực tuyến để hoàn thành chẩn đoán, định vị đoạn code cụ thể, cuối cùng đưa ra nguyên nhân gốc rễ vấn đề và giải pháp.

### Bàn giao yêu cầu và thiết kế kiến trúc

Sau khi có ý tưởng, bước tiếp theo là lựa chọn công nghệ và triển khai phương án. Tác giả giao mô tả yêu cầu đầy đủ cho AI:

```bash
Nghiên cứu phát triển công cụ chẩn đoán thông minh dựa trên Arthas, công cụ này cần thực hiện các chức năng cốt lõi sau:
1. Khi người dùng nhập tên service lỗi trực tuyến và hiện tượng lỗi cụ thể, hệ thống có thể tự động định vị đến server lỗi đích, chủ động theo dõi thời gian thực và phân tích sâu service đích.
2. Thông qua tích hợp chức năng decompile của Arthas, chính xác định vị đến đoạn code cụ thể gây ra lỗi
3. Dựa trên kết quả phân tích, tạo ra tư duy giải quyết đầy đủ bao gồm nguyên nhân gốc rễ vấn đề, gợi ý sửa chữa code và các bước triển khai.

Vui lòng cung cấp phương án lựa chọn công nghệ của công cụ này, bao gồm nhưng không giới hạn ngôn ngữ phát triển (ưu tiên tech stack Java), framework cốt lõi, thiết kế bảng database, kiến trúc triển khai, v.v., và thiết kế phương án triển khai hệ thống chi tiết, bao gồm phân chia module chức năng, thiết kế quy trình dữ liệu, các điểm khó kỹ thuật và giải pháp, v.v.
```

Sau khi AI nhận yêu cầu, không lập tức bắt đầu viết code, mà trước tiên kết hợp ngữ cảnh dự án (thư mục file hoàn toàn trống) để suy luận phân tích, tự chủ hoàn thành một phương án kỹ thuật đầy đủ bao gồm hơn chục giai đoạn. "Đưa ra một mục tiêu, AI tự giải ra toàn bộ con đường" — đây là một ưu thế lớn của lập trình với sự hỗ trợ của AI, bạn có thể tập trung sức lực vào mô tả yêu cầu và review phương án, để AI chịu trách nhiệm lập kế hoạch con đường.

![AI 自主完成技术方案规划](https://oss.javaguide.cn/ai/coding/glm5.1-cc/ai-tech-plan.png)

AI kết hợp yêu cầu, tìm kiếm phương án lựa chọn công nghệ Agent và phương án tích hợp Arthas. Từ từ khóa tìm kiếm có thể thấy, trong việc lựa chọn phương án nó ưu tiên các giải pháp trưởng thành và ổn định:

![AI 检索 Agent 技术选型和 Arthas 集成方案](https://oss.javaguide.cn/ai/coding/glm5.1-cc/agent-arthas-integration-research.png)

Sau khi AI tham khảo nhiều tài liệu và tài liệu chính thức Arthas, đưa ra sơ đồ thiết kế kiến trúc hệ thống dưới đây. Từ trên xuống dưới chia ba lớp: lớp người dùng nhập tên service và hiện tượng lỗi, lớp Agent có ba module cốt lõi là Skill engine, Arthas HTTP Client và AI analysis engine phối hợp hoạt động, lớp dưới cùng kết nối với nhiều instance service đích thông qua Arthas internal HTTP API. Phân chia module và ranh giới trách nhiệm trong kiến trúc rõ ràng, thiết kế chuỗi đầy đủ từ đầu vào lỗi đến định vị code rồi đến tạo report được thực hiện tốt:

![AI 输出的系统架构设计图](https://oss.javaguide.cn/ai/coding/glm5.1-cc/system-architecture-design.png)

Sau khi AI đưa ra sơ đồ kiến trúc, còn tiếp tục phân tích phân công trách nhiệm của 6 thành phần cốt lõi — từ điều phối quy trình của AI Agent Server, đến quản lý session của Arthas HTTP Client, đến định nghĩa chuỗi bước chẩn đoán của Skill engine, đến việc tạo report của AI analysis engine, ranh giới và quan hệ cộng tác của từng thành phần được trình bày khá rõ ràng:

![AI 输出的核心角色分工表](https://oss.javaguide.cn/ai/coding/glm5.1-cc/core-component-roles.png)

Cuối cùng xem thiết kế data flow quan trọng nhất. Sau khi kiến trúc được xác định, miễn là chuỗi data flow đầy đủ và rõ ràng, về cơ bản có thể bắt đầu phát triển. AI kết hợp một tình huống RT timeout thông thường, đưa ra chuỗi chẩn đoán đầy đủ — từ Skill matching, thực thi bước chẩn đoán, theo dõi vấn đề, định vị nguyên nhân gốc rễ, đến decompile Arthas và cuối cùng đầu ra report chẩn đoán. AI thiết kế quy trình tương tác chế độ session đầy đủ cho Arthas HTTP API (init_session → async_exec → pull_results → interrupt_job → close_session), ngay cả cơ chế polling bất đồng bộ cho các lệnh theo dõi liên tục như `watch`, `trace` cũng được cân nhắc. Điểm này cần được chú trọng trong quá trình review — nếu AI hiểu sai mô hình giao tiếp của công cụ cơ bản, sẽ xuất hiện vấn đề trong giai đoạn code sau:

![AI 输出的数据流设计](https://oss.javaguide.cn/ai/coding/glm5.1-cc/data-flow-design.png)

Các chi tiết khác không cần nói nhiều. Nhìn chung, kiến trúc và chuỗi data flow đều khá tốt. AI không chỉ đưa ra phương án cho yêu cầu đã có, còn chủ động đưa ra 6 hướng mở rộng tiếp theo — WebSocket real-time push, vector hóa lưu trữ knowledge base chẩn đoán, auto-fix patch cho các Pattern đã biết, liên kết cảnh báo tự động kích hoạt chẩn đoán, thị trường Skill tùy chỉnh, hỗ trợ đa ngôn ngữ. Các hướng mở rộng này đều bám sát vào phần mở rộng kỹ thuật của kiến trúc hiện tại: knowledge base dựa trên dữ liệu report chẩn đoán đã có, auto-fix dựa trên Skill engine đã có, liên kết cảnh báo dựa trên cơ chế truy vấn instance service đã có.

![AI 给出的后续扩展建议](https://oss.javaguide.cn/ai/coding/glm5.1-cc/extension-suggestions.png)

### Bàn giao code và cấu trúc công trình

Sau khi xác nhận phương án không có vấn đề, tác giả trực tiếp ra lệnh phát triển:

```bash
Phương án tổng thể không có vấn đề, vui lòng hoàn thành công việc phát triển
```

Sau khi AI nhận lệnh, bắt đầu tự chủ code. Theo thiết kế kiến trúc trước đó, từng module tiến lên — từ parent POM và dựng bộ khung Maven multi-module, đến lớp tiện ích chung, mô hình dữ liệu, lớp truy cập dữ liệu, đóng gói Arthas client, Skill engine, AI analysis engine, tầng logic nghiệp vụ, Web controller, đến module khởi động và cấu hình triển khai, 11 bước con tất cả đều hoàn thành:

![AI 自主编码过程](https://oss.javaguide.cn/ai/coding/glm5.1-cc/ai-coding-process.png)

Sau một lúc, AI hoàn thành tất cả công việc code, và đưa ra một danh sách bàn giao chi tiết. 9 module, 46 file tất cả đều có — từ lớp tiện ích chung đến 7 Skill chẩn đoán tích hợp sẵn, từ đóng gói Arthas HTTP API theo chế độ kép exec+session đến Spring AI Alibaba diagnosis analyzer, không thiếu cái nào:

![AI 完成编码后输出的交付清单](https://oss.javaguide.cn/ai/coding/glm5.1-cc/delivery-checklist.png)

Trước tiên xem cấu trúc module tổng thể, AI theo tiêu chuẩn quy chuẩn Java multi-module hoàn thành phân chia công trình, từ trên xuống dưới nghiêm ngặt tuân theo cấp độ phụ thuộc common→model→dal→client→skill→ai→service→web→bootstrap, quy ước đặt tên thống nhất.

Module agent-skill đáng quan tâm, AI thiết kế interface trừu tượng của Skill engine, và tích hợp sẵn 7 kỹ năng chẩn đoán bao phủ các tình huống lỗi JVM thông thường (CPU tăng vọt, OOM, deadlock, interface chậm, GC bất thường, thread leak, class not found), mỗi Skill đều định nghĩa chuỗi bước chẩn đoán đầy đủ. Tư duy thiết kế "framework + built-in implementation" này có khả năng mở rộng tốt:

```bash
jvm-ai-agent/
├── jvm-ai-agent-server/                 # 智能体服务端（核心）
│   ├── agent-common/                    # 通用模块：工具类、常量、DTO
│   ├── agent-model/                     # 数据模型：实体、数据库映射
│   ├── agent-dal/                       # 数据访问层：Mapper、Repository
│   ├── agent-arthas-client/             # Arthas HTTP API 客户端封装
│   ├── agent-skill/                     # Skill 引擎（诊断方法论）
│   ├── agent-ai/                        # AI 分析引擎
│   ├── agent-service/                   # 业务逻辑层（含服务实例查询）
│   ├── agent-web/                       # Web 层：REST API、WebSocket
│   └── agent-server-bootstrap/          # 启动模块
│
└── pom.xml                              # 父 POM
```

Lại xem logic nghiệp vụ chẩn đoán cốt lõi, AI nghiêm ngặt theo data flow được định nghĩa trong thiết kế kiến trúc hoàn thành phát triển chuỗi nghiệp vụ chẩn đoán đầy đủ. Toàn bộ phương thức `executeDiagnosis` theo quy trình Skill matching, định vị instance, thực thi chuỗi chẩn đoán, phân tích lệnh động, AI analysis, tạo report tiến lên, xử lý ngoại lệ cũng cân nhắc đến chiến lược tiếp tục thực thi khi bước không quan trọng thất bại:

1. **Skill matching**: Thông qua `DefaultSkillMatcher` khớp kỹ năng chẩn đoán tốt nhất dựa trên từ khóa hiện tượng lỗi
2. **Định vị instance**: Thông qua `ServiceInstanceLocator` phân giải IP đích và Arthas port dựa trên tên service
3. **Thực thi chuỗi chẩn đoán**: Duyệt qua chuỗi bước chẩn đoán được định nghĩa bởi Skill, lần lượt thực thi lệnh Arthas và thu thập kết quả
4. **Phân tích lệnh động**: Trích xuất từ đầu ra Arthas các biến ngữ cảnh như tên class, tên method, inject vào template lệnh động cho các bước tiếp theo
5. **AI analysis report**: Giao toàn bộ dữ liệu chẩn đoán cho AI analysis engine, tạo report có cấu trúc bao gồm nguyên nhân gốc rễ, gợi ý sửa chữa, mức độ nghiêm trọng

```java
private void executeDiagnosis(DiagnosisRecord record, DiagnosisRequest request) {
    try {
        // 1. 匹配 Skill
        Optional<SkillDefinition> skillOpt = skillMatcher.findBestMatch(request.getSymptom());
        if (skillOpt.isEmpty()) {
            failDiagnosis(record, "无法匹配到合适的诊断技能");
            return;
        }
        SkillDefinition skill = skillOpt.get();
        // ......

        // 2. 定位目标实例
        ServiceRegistry instance = instanceLocator.resolveInstance(
                request.getServiceName(), request.getInstanceIp());
        // ......

        // 3. 执行诊断步骤链
        List<DiagnosticStep> chain = skill.getDiagnosticChain();
        StringBuilder allDiagnosticData = new StringBuilder();
        String decompiledCode = "";
        Map<String, String> contextVars = new HashMap<>();

        for (int i = 0; i < chain.size(); i++) {
            DiagnosticStep step = chain.get(i);
            // ...... 初始化步骤实体

            try {
                // 解析动态命令（支持上下文变量注入）
                String command = resolveCommand(step, contextVars);
                // ......

                // 执行Arthas命令并记录耗时
                String result = executeStep(host, port, step, command);

                // 如果是 jad 结果，记录为反编译代码
                if ("jad".equals(step.getResultType())) {
                    decompiledCode = result;
                }

                // 从结果中提取上下文变量供后续步骤使用
                extractContextVars(result, contextVars);
            } catch (Exception e) {
                // 非关键步骤失败时继续执行
                // ......
            }
        }

        // 4. AI 分析
        String report = diagnosisAnalyzer.analyze(
                request.getSymptom(), allDiagnosticData.toString(), decompiledCode, skill);

        // 5. 保存报告（从Markdown报告中提取根因、严重程度等结构化字段）
        // ......

        // 6. 更新诊断记录状态
        record.setStatus(DiagnosisStatus.COMPLETED.getCode());
        // ......
    } catch (Exception e) {
        failDiagnosis(record, e.getMessage());
    }
}
```

### Tích hợp giao diện tương tác Agent

Trong quá trình AI code, tác giả đã tham khảo tài liệu chính thức của Spring AI Alibaba, phát hiện nó cung cấp sẵn Agent Chat UI. Thay vì để AI tạo trang frontend từ đầu, không bằng trực tiếp tích hợp component tương tác này, thực hiện trải nghiệm chẩn đoán SSE streaming output. Vì vậy tác giả đưa ra một lệnh ngắn:

```bash
Theo tài liệu chính thức Spring AI Alibaba (tham khảo link https://java2ai.com/docs/frameworks/studio/quick-start：), thực hiện công việc phát triển trang tương tác agent thông minh
```

Chỉ đưa ra một link tài liệu và một câu nói, AI tự đi đọc tài liệu chính thức, hiểu các bước tích hợp, hoàn thành phát triển trang. Đây cũng là một kỹ thuật thực dụng khi sử dụng AI hỗ trợ lập trình: khi bạn chỉ cần tích hợp một component sẵn có nào đó, trực tiếp đưa ra link tài liệu thường hiệu quả hơn việc mô tả yêu cầu chi tiết.

![AI 完成 Agent Chat UI 页面集成](https://oss.javaguide.cn/ai/coding/glm5.1-cc/agent-chat-ui-integration.png)

Đến đây, một Agent chẩn đoán thông minh hoàn chỉnh đã được xây dựng xong. Để nghiệm thu chức năng, tác giả đã khởi động một interface test CPU tăng vọt ở local:

```java
@Slf4j
@RestController
public class TestController {
    @RequestMapping("cpu-100")
    public  void cpu() {
        while (true){
        }
    }
}
```

Khởi động Agent service, truy cập `http://localhost:{应用端口}/chatui/index.html`, trong hộp chat nhập: `order-service 程序CPU飙升,请协助排查`. Agent sau khi nhận được biểu hiện lỗi, hoàn thành chuỗi chẩn đoán đầy đủ — trước tiên thông qua Dashboard lấy tổng quan định vị đến Thread ID có mức sử dụng CPU cao nhất, sau đó dựa trên thông tin stack frame thread định vị đến đoạn code vấn đề, cuối cùng thông qua decompile Arthas (jad) đầu ra code hotspot và tạo report chẩn đoán đầy đủ bao gồm phân tích nguyên nhân gốc rễ và gợi ý sửa chữa. Toàn bộ quá trình Agent hoàn toàn tự chủ hoàn thành, SSE streaming output làm cho mỗi bước tiến độ chẩn đoán đều rõ ràng:

![Agent 诊断效果演示](https://oss.javaguide.cn/ai/coding/glm5.1-cc/agent-diagnosis-demo.png)

## Tình huống 2: Xử lý slow query với dữ liệu hàng triệu bản ghi

Tình huống 1 kiểm chứng "khả năng lập kế hoạch và bàn giao từ đầu" của AI, thì tình huống 2 muốn kiểm chứng một chiều khác: **Trong một code base đã có độ phức tạp nhất định, AI có thể chính xác hiểu kiến trúc đã có, xác định vấn đề và hoàn thành tối ưu hóa tăng dần không.**

### Xác định vấn đề: Interface tìm kiếm mất 18 giây

Đây là một service truy vấn đơn hàng dựa trên Spring Boot + MyBatis (glm-testing-service), nghiệp vụ cốt lõi xoay quanh truy vấn và phân tích đơn hàng, bao gồm bốn interface:

| Interface                       | Đường dẫn                      | Mô tả                                                                |
| ------------------------------- | ------------------------------ | -------------------------------------------------------------------- |
| Truy vấn đơn hàng người dùng    | POST /api/orders/user          | Truy vấn danh sách đơn hàng theo user ID, hỗ trợ lọc trạng thái      |
| Tìm kiếm đơn hàng               | POST /api/orders/search        | Tìm kiếm đơn hàng theo khoảng thời gian + số tiền + từ khóa sản phẩm |
| Thống kê bán hàng theo danh mục | GET /api/orders/category-stats | Thống kê tổng hợp bán hàng các danh mục theo trạng thái đơn hàng     |
| Lọc điều kiện kết hợp           | POST /api/orders/filter        | Lọc kết hợp theo người dùng + nhiều trạng thái + nhiều danh mục      |

Đã nạp dữ liệu test hàng triệu bản ghi vào database, cấu trúc bảng tương ứng như sau:

```sql
CREATE TABLE `orders` (
    `id`           BIGINT PRIMARY KEY AUTO_INCREMENT,
    `order_no`     VARCHAR(64)  NOT NULL,
    `user_id`      BIGINT       NOT NULL,
    `status`       TINYINT      NOT NULL DEFAULT 0,
    `total_amount` DECIMAL(10,2) NOT NULL,
    `product_name` VARCHAR(256) NOT NULL,
    `category`     VARCHAR(64)  NOT NULL,
    `create_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_category` (`category`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Dự án thông qua AOP để tự động ghi lại thời gian thực thi của từng interface, dùng để nhanh chóng xác định nút cổ chai hiệu năng:

```java
@Around("controllerPointcut()")
public Object printExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
    long startTime = System.currentTimeMillis();
    Object result = joinPoint.proceed();
    long costTime = System.currentTimeMillis() - startTime;
    log.info("[{}] {}.{} 耗时: {}ms", Thread.currentThread().getName(), className, methodName, costTime);
    return result;
}
```

Sau khi nạp dữ liệu test hàng triệu bản ghi vào database, stress test interface tìm kiếm đơn hàng. Interface này liên quan đến truy vấn kết hợp khớp fuzzy từ khóa + khoảng thời gian + lọc số tiền, ví dụ request tìm kiếm sau:

```bash
curl -X POST http://localhost:8080/api/orders/search \
  -H "Content-Type: application/json" \
  -d '{"startTime": "2025-01-01", "endTime": "2026-12-31", "minAmount": 500, "productName": "蓝牙", "pageNum": 1, "pageSize": 10}'
```

System log trực tiếp đưa ra cảnh báo slow query đập vào mắt:

```bash
[http-nio-8080-exec-1] OrderController.searchOrders 耗时: 18375ms
```

Full table scan của `LIKE '%蓝牙%'` dẫn đến interface mất gần 18 giây, hiệu năng triển khai interface nghiệp vụ hiện tại hoàn toàn không thể đáp ứng yêu cầu trực tuyến:

![接口耗时 18 秒的调测结果](https://oss.javaguide.cn/ai/coding/glm5.1-cc/search-api-18s-result.png)

### Phân tích và thiết kế phương án tối ưu

Tác giả trực tiếp đưa cảnh báo slow query trong system log cho AI, để nó kết hợp code đã có của dự án để hoàn thành phân tích suy luận và thiết kế phương án tối ưu:

```bash
Đối với vấn đề slow query interface "[http-nio-8080-exec-1] OrderController.searchOrders 耗时: 18375ms" được ghi lại trong system log, thực hiện phân tích toàn diện và cung cấp gợi ý tối ưu cho nghiệp vụ đơn hàng.
```

AI định vị đến code nghiệp vụ đích, kết hợp SQL và cấu trúc bảng, đưa ra giải pháp có hệ thống từ chiều thiết kế chỉ mục:

![AI 给出的慢查询解决方案](https://oss.javaguide.cn/ai/coding/glm5.1-cc/slow-query-solution.png)

Đồng thời đưa ra gợi ý tối ưu hóa theo giai đoạn và hiệu quả kỳ vọng:

![AI 给出的分阶段优化建议](https://oss.javaguide.cn/ai/coding/glm5.1-cc/phased-optimization-suggestions.png)

Sau khi xác nhận hướng đúng, tác giả đưa ra lệnh tối ưu cuối cùng:

```bash
Kết hợp tech stack hiện có của dự án, thực hiện tối ưu hóa có hệ thống module slow query
```

AI lần lượt phân tích logic nghiệp vụ và chi tiết truy vấn của từng interface. Các bước tối ưu từ dưới lên, từ tầng database tiến đến tầng ứng dụng, phương án bao gồm một vài điểm chính sau:

**Tầng database** — thêm 5 chỉ mục chính xác:

- Full-text index `ft_product_name` (ngram parser, hỗ trợ phân từ tiếng Trung) thay thế full table scan `LIKE '%xxx%'`
- Composite index `idx_create_time_amount` bao phủ WHERE và ORDER BY của thời gian + số tiền, tránh filesort
- Covering index `idx_search_covering` giúp truy vấn COUNT không cần quay lại bảng
- Composite index `idx_user_status_category` tối ưu lọc đa điều kiện
- Covering index `idx_status_category_amount` tối ưu thống kê tổng hợp danh mục

```sql
ALTER TABLE `orders` ADD FULLTEXT INDEX `ft_product_name` (`product_name`) WITH PARSER ngram;
ALTER TABLE `orders` ADD INDEX `idx_create_time_amount` (`create_time` DESC, `total_amount`);
ALTER TABLE `orders` ADD INDEX `idx_search_covering` (`create_time`, `total_amount`, `product_name`);
ALTER TABLE `orders` ADD INDEX `idx_user_status_category` (`user_id`, `status`, `category`);
ALTER TABLE `orders` ADD INDEX `idx_status_category_amount` (`status`, `category`, `total_amount`);
```

**Tầng ứng dụng** — SQL và tầng Service đồng bộ tối ưu:

- `LIKE '%xxx%'` thay thế bằng `MATCH ... AGAINST` full-text search
- Tình huống deep pagination tự động chuyển sang Deferred Join, thông qua subquery covering index định vị primary key trước rồi mới quay lại bảng
- COUNT theo nhu cầu: mặc định không query tổng số, chỉ khi frontend rõ ràng truyền `needTotal=true` mới thực thi

Dưới đây là phương án tối ưu chỉ mục do AI đưa ra, 5 câu DDL đều được cung cấp, và mỗi chỉ mục đều có mục tiêu tối ưu rõ ràng:

![AI 输出的索引优化 SQL 脚本](https://oss.javaguide.cn/ai/coding/glm5.1-cc/index-optimization-sql.png)

Từ code diff có thể trực quan thấy, AI trong code đã có thực hiện tối ưu tăng dần, thay thế truy vấn fuzzy `LIKE` bằng full-text search, đồng thời giữ nguyên logic nghiệp vụ gốc không thay đổi:

![AI 在既有代码中完成增量优化](https://oss.javaguide.cn/ai/coding/glm5.1-cc/incremental-code-optimization.png)

Đối với vấn đề deep pagination, AI kết hợp với dữ liệu hàng triệu bản ghi hiện tại đưa ra ngưỡng phân trang cụ thể — khi offset vượt quá 1000 tự động chuyển sang Deferred Join query, phân trang nông dùng truy vấn thông thường, phân trang sâu dùng subquery covering index định vị primary key trước rồi mới quay lại bảng:

```java
/** 深分页阈值：offset 超过此值时自动切换为延迟关联查询 */
private static final int DEEP_PAGE_THRESHOLD = 1000;

// 深分页（offset > 1000）走延迟关联，浅分页走普通查询
boolean isDeepPage = offset > DEEP_PAGE_THRESHOLD;
List<Order> orders;
if (isDeepPage) {
    orders = orderMapper.searchOrdersDeepPage(...);
} else {
    orders = orderMapper.searchOrders(...);
}
```

AI trong phương án này kết hợp dữ liệu cụ thể đưa ra chiến lược ngưỡng. Khi review loại phương án này, khuyến nghị chú ý đến tính hợp lý của ngưỡng — giá trị 1000 này hợp lý với dữ liệu hàng triệu bản ghi, nhưng nếu dữ liệu của bạn là hàng chục triệu hoặc hàng trăm nghìn, có thể cần điều chỉnh.

![AI 针对深分页场景基于阈值自动切换查询策略的代码实现](https://oss.javaguide.cn/ai/coding/glm5.1-cc/deep-pagination-threshold-code.png)

Sau khi hoàn thành tất cả tối ưu, AI đưa ra tổng kết hiệu quả tối ưu cuối cùng, bao gồm so sánh trước và sau tối ưu của các interface:

![AI 输出的最终优化效果总结](https://oss.javaguide.cn/ai/coding/glm5.1-cc/optimization-summary.png)

### Kiểm chứng hiệu quả tối ưu

Sau khi hoàn thành cải tiến, stress test lại interface, kết quả như sau. Interface sau khi khởi động ổn định thời gian duy trì trong vòng 300ms, **từ 18375ms xuống dưới 300ms, hiệu năng cải thiện hơn 60 lần.** Trong toàn bộ quá trình, việc tác giả làm chỉ có ba thứ: đưa ra vấn đề, review phương án, nghiệm thu kết quả.

![优化后接口耗时降至 300ms 以内](https://oss.javaguide.cn/ai/coding/glm5.1-cc/optimized-api-300ms.png)

## Tổng kết thực chiến

Thông qua thực chiến trong hai tình huống, tóm tắt kinh nghiệm và suy nghĩ về lập trình với sự hỗ trợ của Claude Code + mô hình bên thứ ba.

### Lập trình với sự hỗ trợ của AI có thể làm gì

| Chiều năng lực                        | Biểu hiện tình huống                                                                              | Giải thích                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Lập kế hoạch từ yêu cầu đến kiến trúc | Tình huống 1: Đưa ra mô tả yêu cầu, AI tự chủ hoàn thành lựa chọn công nghệ và thiết kế kiến trúc | Phù hợp để nhanh chóng kiểm chứng ý tưởng, nhưng phương án vẫn cần review thủ công |
| Bàn giao code end-to-end              | Tình huống 1: 9 module 46 file tự chủ bàn giao                                                    | Từ dựng bộ khung đến logic nghiệp vụ, giảm khối lượng code lặp lại                 |
| Tối ưu tăng dần code đã có            | Tình huống 2: Xác định slow query và tối ưu trong dự án dữ liệu hàng triệu bản ghi                | Có thể kết hợp cấu trúc bảng và SQL đưa ra phương án tối ưu theo giai đoạn         |
| Quyết định nhận biết dữ liệu          | Tình huống 2: Kết hợp dữ liệu cụ thể đưa ra chiến lược ngưỡng phân trang                          | Phán đoán dựa trên quy mô nghiệp vụ, thay vì phương án chung                       |

### Những điều cần chú ý trong thực chiến

**Những điểm làm tốt**:

- **Nhanh chóng kiểm chứng ý tưởng kiến trúc**: Trong tình huống 1, từ mô tả yêu cầu đến phương án kỹ thuật và thiết kế kiến trúc hoàn chỉnh, toàn bộ quá trình dưới 10 phút, rất hữu ích cho việc nhanh chóng kiểm chứng tính khả thi kỹ thuật
- **Đầu ra phương án đa lớp**: Trong tình huống slow query, tối ưu chỉ mục tầng database và refactor SQL tầng ứng dụng đồng bộ tiến lên, bao phủ tương đối toàn diện
- **Quyết định kết hợp dữ liệu**: Tình huống 2 đưa ra ngưỡng deep pagination cho dữ liệu hàng triệu bản ghi, thay vì đơn giản áp dụng phương án chung

**Những điều cần chú ý**:

- **Phương án kiến trúc cần review thủ công**: Thiết kế kiến trúc và data flow do AI đưa ra trông có vẻ đầy đủ, nhưng trong chi tiết có thể tồn tại vấn đề. Ví dụ thiết kế chế độ session của Arthas HTTP API trong tình huống 1, cần bạn hiểu mô hình giao tiếp của Arthas mới có thể phán đoán tính hợp lý của nó
- **Thỉnh thoảng đứt gãy trong thực thi chuỗi dài**: Trong tác vụ code liên tục phức tạp, AI đôi khi sẽ quên mất các ràng buộc thiết kế trước đó ở nửa sau. Khuyến nghị chia nhỏ tác vụ phức tạp thành các giai đoạn rõ ràng, mỗi giai đoạn xác nhận độc lập
- **Phong cách code và quy chuẩn công trình**: Cấu trúc code được tạo ra hợp lý, nhưng mức độ phù hợp với quy chuẩn cá nhân/nhóm cần sự mài giũa. Trong tình huống 1 có một phần đặt tên và tổ chức file cần chỉnh tay
- **Sự đánh đổi trong lựa chọn phương án**: AI sẽ đưa ra nhiều phương án, nhưng không thể thay bạn đánh đổi. Ví dụ trong tình huống 2, lựa chọn full-text index vs ES, sự đánh đổi giữa Deferred Join vs cursor pagination, những điều này cần phán đoán dựa trên tình huống nghiệp vụ

### Một số gợi ý khi sử dụng Claude Code + mô hình bên thứ ba

1. **Mô tả yêu cầu cần cụ thể**: Trong tình huống 1, prompt yêu cầu đầy đủ trực tiếp quyết định chất lượng phương án kiến trúc, yêu cầu mơ hồ chỉ có thể nhận được phương án mơ hồ
2. **Xác nhận từng giai đoạn**: Dự án phức tạp không nên để AI tạo từ đầu đến cuối một lần, lựa chọn công nghệ → thiết kế kiến trúc → triển khai code, mỗi giai đoạn review độc lập
3. **Kiểm soát thủ công các quyết định quan trọng**: Các lựa chọn ở tầng kiến trúc (như chiến lược cache, phương án phân trang) cần phán đoán dựa trên tình huống nghiệp vụ, AI không thể thay bạn làm
4. **Tận dụng link tài liệu**: Khi cần tích hợp một component sẵn có nào đó (như Spring AI Alibaba trong tình huống 1), trực tiếp đưa ra link tài liệu hiệu quả hơn mô tả yêu cầu chi tiết

## Lời kết

Sau khi Claude Code tích hợp mô hình bên thứ ba, hiểu ngữ cảnh, phân chia task, tạo code trong chế độ Agent tạo thành quy trình làm việc tương đối hoàn chỉnh. Hai tình huống chạy xong, lập trình với sự hỗ trợ của AI quả thực có thể rút ngắn thời gian "từ ý tưởng đến code".

Nhưng công cụ cuối cùng chỉ là công cụ. Nhìn lại hai tình huống trong bài viết này:

- **JVM Intelligent Diagnosis Agent trong tình huống 1**, cần có nhận thức rõ ràng về mô hình giao tiếp của Arthas, phương pháp luận chẩn đoán JVM, mới có thể review phương án kiến trúc do AI đưa ra có hợp lý không — quản lý vòng đời session của Arthas HTTP API, thiết kế chuỗi bước chẩn đoán của Skill engine, những điều này đều cần bạn kiểm soát.

- **Xử lý slow query trong tình huống 2**, cần hiểu sâu về nguyên lý chỉ mục MySQL, cơ chế full-text search, chiến lược tối ưu deep pagination, mới có thể phán đoán phương án tối ưu do AI đưa ra có phù hợp với tình huống nghiệp vụ của bạn không — ví dụ full-text index trong tình huống ghi dày đặc có thể gây ra tổn thất hiệu năng, ngưỡng của Deferred Join cần điều chỉnh dựa trên dữ liệu thực tế.

Công cụ lập trình AI đang thay đổi phương thức làm việc của developer — từ "người viết code" trở thành "người review code". Tiền đề để dùng tốt AI, là bạn phải hiểu rõ hơn AI về những gì bạn đang làm.

## Tham khảo

- Thông báo ra mắt GLM-5.1 Coding Plan: <https://docs.bigmodel.cn/cn/coding-plan/>
- Hướng dẫn cài đặt Claude Code: <https://docs.anthropic.com/en/docs/claude-code>
- Công cụ chuyển đổi mô hình cc-switch: <https://github.com/farion1231/cc-switch>
- Tài liệu chính thức Spring AI Alibaba: <https://java2ai.com/docs/>
- Tài liệu chính thức Arthas: <https://arthas.aliyun.com/doc/>
