---
title: "Trae + MiniMax thực chiến đa tình huống: Chẩn đoán lỗi Redis và tái cấu trúc đa ngôn ngữ"
description: Sử dụng Trae IDE tích hợp mô hình lớn MiniMax, thông qua hai tình huống thực tế là chẩn đoán lỗi kết nối Redis và tái cấu trúc đa ngôn ngữ từ C sang Go với mã nguồn Redis, chia sẻ kinh nghiệm thực chiến và kỹ năng làm việc trong lập trình với sự hỗ trợ của AI.
category: Thực chiến lập trình AI
head:
  - - meta
    - name: keywords
      content: Trae,AI编程,AI编程IDE,Redis故障排查,跨语言重构,Go语言,AI辅助开发,大模型编程
---

Xin chào mọi người, tôi là Guide. Trước đây đã chia sẻ một bài [thực chiến IDEA kết hợp plugin Qoder](./idea-qoder-plugin.md), bài đó chủ yếu nói về việc sử dụng AI hỗ trợ lập trình trong hệ sinh thái JetBrains. Bài này đổi góc độ, nói về trải nghiệm thực chiến của **Trae IDE tích hợp mô hình lớn**.

Trae là AI coding IDE do ByteDance ra mắt, dựa trên hệ sinh thái VS Code, hỗ trợ tích hợp nhiều mô hình lớn. Bài này sử dụng MiniMax M2.7 làm ví dụ, nhưng cách tích hợp của Trae là chung — đổi sang Claude, GPT hay các mô hình khác, quy trình về cơ bản giống nhau.

Tôi sử dụng MiniMax ở đây vì tôi vừa đăng ký MiniMax Code Plan muốn thực tế kiểm tra một chút, không phải quảng cáo, bạn có thể đổi sang mô hình khác, tư duy đều như nhau.

Tôi đã chọn hai tình huống phức tạp khá đặc trưng để thực tế kiểm chứng:

- **Tình huống 1**: Interface đột nhiên timeout hàng loạt, log chỉ hướng đến Redis, nhưng dự án có nhiều chỗ đang dùng Redis, rất khó nhanh chóng xác định nguyên nhân gốc rễ.
- **Tình huống 2**: Sao chép hoàn chỉnh chỉ lệnh slow query của Redis từ mã nguồn C sang Go, kiểm tra khả năng tái cấu trúc đa ngôn ngữ và hiểu ngữ cảnh.

## Bắt đầu nhanh: Trae tích hợp mô hình lớn

Trae hỗ trợ tích hợp nhiều mô hình lớn, dưới đây lấy ví dụ tích hợp mô hình tùy chỉnh, minh họa quy trình cấu hình chung.

**Bước 1**: Tải xuống và cài đặt Trae từ website chính thức và hoàn thành khởi tạo, đồng thời hoàn thành đăng ký và tạo API Key trên nền tảng mô hình tương ứng (bài này sử dụng nền tảng MiniMax làm ví dụ):

<https://platform.minimaxi.com/subscribe/token-plan>

**Bước 2**: Trong Trae click "Add Model" để thêm mô hình tùy chỉnh:

![Trae添加模型入口](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/trae-add-model-entry.png)

**Bước 3**: Chọn "Other Models" và nhập thủ công Model ID và API Key:

![选择Other Models](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/select-other-models.png)

**Bước 4**: Nhập Model ID (ví dụ `MiniMax-M2.7`) và API Key đã đăng ký, click "Add Model". Nếu không có thông báo lỗi, tức là tích hợp thành công:

![输入模型ID和API Key](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/input-minimax-m2.7-api-key.png)

Sau khi tích hợp xong, có thể sử dụng mô hình này trong Trae để lập trình với sự hỗ trợ của AI. Tiếp theo thông qua hai tình huống thực chiến, chia sẻ cách sử dụng cụ thể và kỹ năng.

## Tình huống 1: Nhanh chóng kiểm soát sự cố timeout interface và xác định nguyên nhân gốc rễ

### Xác định vấn đề

Ví dụ đầu tiên là tái hiện một sự cố thực tế trực tuyến (đã ẩn danh hóa). Lúc đó đồng nghiệp phòng ban phản ánh interface truy vấn danh sách nào đó báo lỗi, trang không có dữ liệu. Hệ thống giám sát trực tuyến xác định thông tin interface như sau:

Interface: `GET http://localhost:8080/api/rbac/user/list`

Kết quả trả về:

```
{
    "code": 500,
    "message": "系统繁忙，请稍后重试",
    "data": null,
    "timestamp": "2026-03-19T10:11:02.632242"
}
```

Kết hợp từ khóa thông tin stack ngoại lệ `Read timed out`, và thao tác `get(key)` trong đoạn code tương ứng, chúng ta có thể sơ bộ cho rằng lỗi này chỉ là biểu hiện bề mặt chứ không phải nguyên nhân gốc rễ.

```java
@Override
public String getConfigValue(String configKey, String environment) {
    String cacheKey = CONFIG_CACHE_PREFIX + configKey + ":" + environment;
    String value = stringRedisTemplate.opsForValue().get(cacheKey);
    if (value != null) {
        return value;
    }
    // 后续逻辑省略
}
```

Theo quy trình xử lý thông thường, chúng ta cần nhanh chóng xác định nguyên nhân gốc rễ vấn đề, hoàn thành kiểm soát sự cố, sau đó liên hệ vận hành để điều tra sâu hơn. Nhưng dự án có nhiều chỗ dùng Redis, kiểm tra từng cái một mất nhiều thời gian, trong thời gian đó có thể ảnh hưởng đến tính ổn định của nghiệp vụ.

Để kiểm chứng hiệu quả thực tế của AI hỗ trợ chẩn đoán, tác giả đã tái hiện tình huống lỗi này (đã ẩn danh hóa), để mô hình tiếp quản xử lý. Theo quy trình xử lý sự cố trực tuyến cấp doanh nghiệp, trước tiên cần xác định nguyên nhân gốc rễ và hoàn thành kiểm soát sự cố. Vì vậy, đưa ra chỉ lệnh đầu tiên cho mô hình:

```
Đối với lỗi 500 xảy ra khi truy cập interface http://localhost:8080/api/rbac/user/list (thông báo lỗi: "系统繁忙，请稍后重试"), vui lòng thực hiện các thao tác sau:
1. Phân tích thông tin stack ngoại lệ được cung cấp, xác định chính xác nguyên nhân gốc rễ dẫn đến lỗi server nội bộ;
2. Cung cấp phương án khẩn cấp kiểm soát sự cố trực tuyến chi tiết, bao gồm nhưng không giới hạn: chiến lược rollback tạm thời, biện pháp hạn chế lưu lượng, phương án service degradation hoặc quy trình khởi động lại khẩn cấp;
3. Giải thích nguyên nhân kỹ thuật phát sinh lỗi, chỉ ra module code hoặc vấn đề cấu hình cụ thể;

...... Thông tin stack ngoại lệ chính: `java.net.SocketTimeoutException: Read timed out`
```

![向M2.7下达的诊断指令截图](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-diagnostic-instruction.png)

Sau khi mô hình nhận được yêu cầu, nhanh chóng định vị ngữ cảnh của code được chỉ định và suy ra 4 nguyên nhân gốc rễ có thể xảy ra:

- Redis server bị down hoặc không phản hồi
- Cấu hình connection pool quá nhỏ, bị cạn kiệt trong điều kiện concurrency cao
- Redis connection leak (kết nối không được đóng đúng cách)
- Tải Redis server quá cao

![M2.7推理结果截图](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-inference-result.png)

Đến bước này, mô hình đã thu hẹp không gian vấn đề từ "N chỗ gọi Redis" xuống còn "4 nguyên nhân gốc rễ có thể" — khả năng **nhanh chóng thu hẹp phạm vi vấn đề** này chính là giá trị cốt lõi của AI hỗ trợ chẩn đoán. Tiếp theo xem tư duy kiểm soát sự cố của nó.

### Kiểm soát sự cố

Mô hình đã nhanh chóng phân tích logic gọi code dựa trên stack frame ngoại lệ đã cho, chính xác chỉ ra: interface truy vấn danh sách bị AOP interceptor chặn, cạn kiệt connection pool là nguyên nhân gốc rễ của lỗi 500. Một điểm quan trọng khác, nó chỉ ra rằng đoạn code này thiếu chiến lược degradation — điểm này tác giả chỉ nhận ra trong buổi tổng kết sau sự cố.

![M2.7代码调用链路分析截图](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-call-chain-analysis.png)

Đối với vấn đề trực tuyến, chiến lược kiểm soát sự cố là mấu chốt quan trọng nhất. Mô hình đưa ra một vài giải pháp, giải pháp đầu tiên là tạm thời tắt công tắc kiểm tra quyền — nguyên nhân là vì giải pháp một cần xóa dữ liệu cache Redis. Mặc dù giải pháp hơi mạnh bạo, nhưng nó chỉ ra chi tiết chuỗi gọi code và thông tin cấu trúc bảng, điều này cũng có thể hỗ trợ tốt cho tôi trong việc đoán qua ngữ nghĩa nghiệp vụ các tình huống và nguyên nhân có thể.

![M2.7调用链路分析](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-call-chain-analysis-2.png)

Dựa trên thông tin chuỗi gọi do mô hình cung cấp, tác giả tiếp tục hỏi về cơ sở kỹ thuật của giải pháp một, đảm bảo hiểu nghiệp vụ được nhanh chóng thống nhất:

```bash
Kết hợp với quy trình phát triển đầy đủ của code, giải thích chi tiết cơ sở kỹ thuật, tư duy thiết kế và tính hợp lý triển khai của giải pháp một.
```

Đây cũng là điểm tác giả khá hài lòng, mô hình đưa ra sơ đồ chuỗi gọi của code vấn đề, giúp tôi nhanh chóng biết được toàn bộ AOP và vị trí lỗi cụ thể mà truy vấn danh sách trải qua, giúp hiểu phạm vi ảnh hưởng của vấn đề hiện tại và nguyên nhân trực tiếp của lần ngoại lệ này.

Sau chưa đến 10 phút tương tác, tác giả không chỉ nhanh chóng có được góc nhìn kiến trúc vĩ mô, hiểu được lỗi trong kiến trúc phức tạp hiện tại và cơ sở của từng giải pháp, ví dụ giải pháp một: thông qua việc sửa cấu hình database, khởi động lại để làm mới cache nhằm tránh kiểm tra quyền.

![M2.7调用链路图截图](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-call-chain-diagram.png)

Chúng ta lại xem tư duy của giải pháp ba: khi Redis không khả dụng, sử dụng cache cục bộ hoặc giá trị mặc định, tránh cascading failure. Mô hình kết hợp đoạn code dự án hiện tại đưa ra gợi ý chỉnh sửa:

![M2.7方案三代码片段](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-solution-3-code.png)

Sau khi mô hình phân tích, chúng ta đã có đánh giá ban đầu về vấn đề: Redis client connection pool bị cạn kiệt, khiến logic truy vấn dựa trên công tắc cache của các interface nghiệp vụ hàng ngày bị sập, dẫn đến hiệu ứng domino. Tổng hợp nhiều gợi ý của mô hình, theo nguyên tắc bảo thủ, nhanh chóng kiểm soát sự cố, không làm sập database trong giờ cao điểm nghiệp vụ, đưa ra phương án hotfix sau:

```bash
Dựa trên phương án được cung cấp, tạo branch hotfix để khẩn cấp sửa chữa vấn đề ngoại lệ Redis. Các bước triển khai cụ thể như sau:
1. Tạo branch hotfix dựa trên code môi trường production hiện tại, quy tắc đặt tên là "hotfix/redis-exception-handler"
2. Triển khai cơ chế bắt ngoại lệ Redis theo giải pháp ba, thêm khối try-catch ở tất cả các thao tác Redis
3. Khi bắt được ngoại lệ Redis, tự động degradation để truy vấn trực tiếp từ database lấy dữ liệu
4. Triển khai cơ chế cache cục bộ JVM, cache kết quả truy vấn vào bộ nhớ, đặt thời gian hết hạn cache hợp lý
5. Hoàn thành unit test và integration test, tỷ lệ coverage cần đạt 80% trở lên
6. Chuẩn bị phương án rollback, đảm bảo có thể nhanh chóng phục hồi về phiên bản trước trong trường hợp khẩn cấp

```

![hotfix方案指令](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/hotfix-instruction.png)

Sau khi mô hình nhận chỉ lệnh, chính xác hiểu vấn đề, hoàn thành phân chia task và từng bước thực thi:

![M2.7任务拆解过程](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-task-breakdown.png)

Kết quả code đầu ra cuối cùng như sau: mô hình tích hợp logic truy vấn database degradation vào logic kiểm tra quyền gốc, việc hiểu logic kiểm tra quyền và tích hợp thiết kế phức tạp được thực hiện khá tốt.

```java
@Around("permissionCheck()")
public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
    try {
        // 从配置中心读取权限校验开关
        String checkEnabled = configService.getConfigValue("permission.check.enabled", "PROD");
        if (!"true".equalsIgnoreCase(checkEnabled)) {
            return joinPoint.proceed();
        }

        // ... 原有权限校验逻辑 ...

        // 尝试从Redis缓存获取权限信息
        Boolean hasPermission = checkPermissionFromCache(redisKey);

        if (hasPermission != null) {
            // ... 命中缓存处理 ...
        }

        // 降级：从数据库查询权限
        boolean hasPermissionFromDB = checkPermissionFromDatabase(userId, apiPath, httpMethod);
        // ... 降级逻辑处理 ...

    } catch (Exception e) {
        if (e instanceof RuntimeException && "无权限访问".equals(e.getMessage())) {
            throw e;
        }
        // 发生异常时，触发监控告警并采用保守策略放行
        AlertManager.notify("PERMISSION_CHECK_ERROR", e.getMessage());
        return joinPoint.proceed();
    }
}
```

getConfigValue cũng được bổ sung logic cache cục bộ, thiết kế cache đa lớp trong xử lý dự phòng lỗi làm khá tốt.

```java
/**
 * 获取配置值（指定环境）
 */
@Override
public String getConfigValue(String configKey, String environment) {
    String cacheKey = CONFIG_CACHE_PREFIX + configKey + ":" + environment;

    // 【第一步：尝试从本地缓存获取】
    String localValue = localCacheManager.get(cacheKey);
    if (localValue != null) {
        return localValue;
    }

    // 【第二步：尝试从Redis获取】
    try {
        if (isRedisAvailable()) {
            String value = stringRedisTemplate.opsForValue().get(cacheKey);
            if (value != null) {
                localCacheManager.put(cacheKey, value, LOCAL_CACHE_TTL);
                return value;
            }
        }
    } catch (Exception e) {
        // Redis异常，降级到数据库
        handleRedisFailure(e);
    }

    // 【第三步：降级到数据库】
    // ... 其他逻辑 ...
    return getConfigValueFromDatabaseWithFallback(configKey, environment);
}
```

Một chi tiết đáng chú ý là thiết kế cache cục bộ: mô hình áp dụng nguyên tắc Open/Closed, hoàn thành đóng gói lớp tiện ích cache cục bộ dựa trên ConcurrentHashMap, đã cân nhắc đến nguy cơ heap memory overflow, kết hợp thuật toán LRU để thực hiện dọn dẹp cache:

```java
@Component
public class LocalCacheManager {
    // 核心存储：ConcurrentHashMap保证线程安全
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupExecutor;

    // 缓存配置
    private static final long DEFAULT_TTL_MILLIS = 300000; // 5分钟
    private static final long MAX_CACHE_SIZE = 10000;

    public LocalCacheManager() {
        // 守护线程执行定时清理
        this.cleanupExecutor = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "local-cache-cleanup");
            t.setDaemon(true);
            return t;
        });
        this.cleanupExecutor.scheduleAtFixedRate(this::cleanupExpiredEntries, 1, 1, TimeUnit.MINUTES);
    }

    public void put(String key, String value) {
        put(key, value, DEFAULT_TTL_MILLIS);
    }

    public void put(String key, String value, long ttlMillis) {
        // 容量满时触发LRU清理
        if (cache.size() >= MAX_CACHE_SIZE) {
            cleanupExpiredEntries();
            if (cache.size() >= MAX_CACHE_SIZE) {
                evictOldestHalf();
            }
        }
        cache.put(key, new CacheEntry(value, System.currentTimeMillis() + ttlMillis));
    }

    public String get(String key) {
        CacheEntry entry = cache.get(key);
        if (entry == null || entry.isExpired()) {
            cache.remove(key);
            return null;
        }
        return entry.getValue();
    }

    // ... 其他方法省略 ...

    // LRU清理：删除最老的50%数据
    private void evictOldestHalf() {
        // ...... 省略排序和清理逻辑 ......
    }

    // 缓存条目
    private static class CacheEntry {
        private final String value;
        private final long expirationTime;

        public CacheEntry(String value, long expirationTime) {
            this.value = value;
            this.expirationTime = expirationTime;
        }

        public String getValue() {
            return value;
        }

        public boolean isExpired() {
            return System.currentTimeMillis() > expirationTime;
        }
    }
}
```

### Xác định nguyên nhân gốc rễ

Sau khi kiểm soát sự cố trực tuyến thông qua branch hotfix, chúng ta tiếp tục điều tra sâu nguyên nhân cạn kiệt Redis connection pool. Dựa trên kết quả đầu ra và suy luận của mô hình, một thao tác get thông thường theo hiệu năng 10w qps của Redis (trung bình 1~2ms mỗi lệnh), lý tưởng có thể xử lý khoảng 6600 lệnh mỗi giây với 10 kết nối, thấp hơn nhiều so với khả năng xử lý cực hạn của Redis, vì vậy vấn đề có thể nằm ở tầng code, chúng ta cần tiếp tục suy luận xem trong dự án có tồn tại thao tác Redis không hợp lý hay không:

```bash
Kết hợp với hiện tượng và biểu hiện cụ thể của sự cố lần này, thực hiện phân tích toàn diện và hệ thống toàn cục dự án. Phạm vi phân tích cần bao phủ nhiều chiều như kiến trúc dự án, triển khai code, quản lý phụ thuộc, cấu hình môi trường, tương tác dữ liệu, v.v., trọng tâm xác định và đầu ra nguyên nhân trực tiếp có thể dẫn đến sự cố production.
```

![M2.7全局分析指令](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-global-analysis-instruction.png)

Lúc này mô hình bắt đầu đọc và phân tích suy luận chi tiết dựa trên cấu trúc dự án toàn cục và ngữ cảnh:

![M2.7项目结构分析](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-project-structure-analysis.png)

Cuối cùng mô hình đưa ra báo cáo phân tích sự cố chi tiết, chỉ ra nguyên nhân gốc rễ: thiết kế sử dụng cấu trúc dữ liệu Redis không đúng cách khiến thao tác scan làm chết connection pool. Đồng thời, kết hợp ngữ cảnh đưa ra quy trình nghiệp vụ của thao tác này, giúp chúng ta nhanh chóng hiểu chuỗi lỗi này:

![M2.7故障根因分析](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-root-cause-analysis.png)

Còn giải pháp cũng rất gọn gàng, thông qua việc tối ưu hóa cấu trúc dữ liệu để giảm độ phức tạp thời gian của thao tác đọc/ghi Redis, tránh connection pool bị chết:

![M2.7优化方案建议](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-optimization-suggestion.png)

Trải nghiệm tổng thể của tình huống 1 khá tốt. Từ việc chính xác xác định nguyên nhân gốc rễ trong N chỗ gọi Redis, đến đưa ra phương án kiểm soát sự cố hoàn chỉnh, toàn bộ chuỗi suy luận rõ ràng và đầy đủ.

Tuy nhiên cũng phát hiện một số vấn đề: giải pháp một của nó (xóa cache Redis) hơi mạnh bạo, môi trường production thực tế có thể cần chiến lược bảo thủ hơn. Ngoài ra, một số code phòng thủ cho các điều kiện biên vẫn cần bổ sung thủ công — AI có thể giúp bạn đi được 90%, 10% còn lại vẫn phải tự lo.

## Tình huống 2: Tái cấu trúc đa ngôn ngữ từ mã nguồn C của Redis sang Go

### Thông tin nền

Tiếp theo chúng ta thử một tình huống khó cao — sao chép chỉ lệnh slow query của Redis. mini-redis áp dụng triết lý goroutine-per-connection của Go để nâng cao throughput, và triển khai middleware cache tuân thủ giao thức RESP theo phong cách ngôn ngữ C, do sự khác biệt trong triết lý thiết kế giữa các ngôn ngữ, liên quan đến việc phân tích logic phức tạp và triển khai giải pháp dị cấu. Dùng để kiểm chứng khả năng thiết kế kiến trúc đa ngôn ngữ của mô hình lớn rất phù hợp.

### Phân tích yêu cầu và thiết kế phương án

Đối với yêu cầu tái cấu trúc dự án, theo quy trình phát triển truyền thống, chúng ta cần nhiều thời gian để đọc mã nguồn phân tích logic, trong đó do lý do lịch sử code không có chú thích, cần kết hợp ngữ cảnh để suy luận debug. Sau khi hiểu logic gốc, còn cần kết hợp kiến trúc dự án mới để xây dựng các bước triển khai, và thiết kế unit test để đảm bảo logic đã có hoạt động ổn định. Toàn bộ quy trình (phát triển, test đến phát hành) ước tính cần 3 ngày làm việc. Với tâm thế thử xem, tác giả giao việc đọc mã nguồn và sắp xếp tài liệu kỹ thuật cho AI chịu trách nhiệm.

```bash
Tôi cần sao chép triển khai chỉ lệnh slow query của Redis bằng Go. Vui lòng đọc kỹ mã nguồn Redis, hiểu sâu nguyên lý triển khai đầy đủ của tính năng slow query, thiết kế cấu trúc dữ liệu, quy trình xử lý và các bước chính. Cụ thể bao gồm nhưng không giới hạn: cơ chế lưu trữ slow query log, cấu hình và điều chỉnh ngưỡng slow query, quy trình thu thập và ghi lại chỉ lệnh slow query, thiết kế và triển khai các interface API liên quan, cũng như cách truy vấn và hiển thị thông tin slow query. Dựa trên những hiểu biết này, sắp xếp tài liệu kỹ thuật rõ ràng, bao gồm mô tả nguyên lý cốt lõi, phân tích cấu trúc dữ liệu chính, phân giải các bước triển khai và các cân nhắc tối ưu hiệu năng có thể.
```

Sau khi chờ một lúc, mô hình chỉ rõ yêu cầu kỹ thuật, giới thiệu từ dưới lên trên từ cấu trúc dữ liệu đến chuỗi thực thi, thực hiện phân tích và giới thiệu chi tiết:

![M2.7慢查询数据结构分析](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-slowlog-data-structure.png)

Xem việc định vị logic AOP của slow query rất chính xác, trên luồng chính đưa ra các chú thích cần thiết, giúp tôi nhanh chóng hiểu quy trình xử lý tổng thể của slow query:

![M2.7慢查询切面逻辑](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-slowlog-aspect-logic.png)

Nhìn lại việc hiểu chỉ lệnh slot get của nó, cũng rất tới nơi, tư duy giống như senior developer, nắm lấy cái lớn bỏ qua cái nhỏ, làm rõ logic cốt lõi, đưa ra các chú thích cần thiết trên luồng chính:

![M2.7 slot get指令分析](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-slot-get-instruction.png)

Sau khi xác nhận mô hình đã hiểu chính xác về slow query, tiếp theo để nó từ góc độ chuyên gia phát triển thiết kế tài liệu thiết kế đầy đủ về phân tích chức năng, triển khai, regression test:

```bash
Theo phương pháp luận Test-Driven Development (TDD), sử dụng Go để tạo tài liệu hướng dẫn phát triển toàn diện chi tiết, hướng dẫn sao chép triển khai Redis. Hướng dẫn này phải tuân thủ các quy định sau:

1. Phương pháp phát triển:
   - Thực thi nghiêm ngặt quy trình làm việc TDD: viết test thất bại trước, sau đó triển khai code đơn giản nhất để pass test, cuối cùng refactor
   - Áp dụng phong cách lập trình hướng thủ tục tương tự như triển khai C gốc của Redis
   - Sử dụng cú pháp Go thuần và thư viện chuẩn nhất có thể

2. Cấu trúc hướng dẫn:
   - Bắt đầu từ hướng dẫn thiết lập dự án và cấu hình môi trường
   - Chia theo module logic theo tính năng Redis để phát triển
   - Đối với mỗi module/tính năng, cung cấp:
     a. Định nghĩa test case rõ ràng, bao gồm input và output kỳ vọng
     b. Triển khai code từng bước, kèm giải thích từng dòng
     c. Lệnh test rõ ràng và quy trình xác thực
     d. Kết quả test kỳ vọng và tiêu chí thành công

3. Yêu cầu kỹ thuật:
   - Bao gồm đoạn code hoàn chỉnh của tất cả các thành phần
   - Chỉ định cấu trúc file và quy ước đặt tên chính xác
   - Hướng dẫn chi tiết các lệnh biên dịch và test
   - Giải thích quy trình debug cho các vấn đề thông thường
   - Tham chiếu các mẫu mã nguồn C Redis liên quan khi áp dụng

4. Chi tiết triển khai:
   - Bắt đầu từ cấu trúc dữ liệu cốt lõi (string, list, hash, v.v.)
   - Dần tiến đến xử lý lệnh và triển khai giao thức
   - Bao gồm network layer và giao tiếp client-server
   - Đề cập đến cơ chế persistence (RDB/AOF)
   - Triển khai các lệnh Redis cơ bản theo cùng mẫu hành vi

5. Yêu cầu test:
   - Cung cấp code test đầy đủ cho mỗi thành phần
   - Giải thích các assertion test và phương pháp xác thực
   - Bao gồm cả unit test và integration test
   - Chỉ định cách chạy test và giải thích kết quả
   - Hướng dẫn chi tiết cách xác thực hành vi đúng theo đặc tả Redis

Hướng dẫn này phải đủ toàn diện để developer có kiến thức Go trung cấp có thể theo đó xây dựng thành công một hệ thống tương tự Redis có chức năng đầy đủ.
```

Sau khi chờ một lúc, chúng ta nhận được một tài liệu thiết kế. Mô hình kết hợp ngữ cảnh mã nguồn Redis, phân tích ra mạch cốt lõi và định nghĩa chính của slow query, và lên kế hoạch các bước phát triển hoàn chỉnh:
![慢查询设计文档](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-slowlog-design-doc.png)

### Triển khai code

Sau khi trích xuất tài liệu thiết kế từ mã nguồn Redis, để đảm bảo tư duy thiết kế của dự án C có thể được triển khai chính xác trong quy chuẩn dự án Go cá nhân, sao chép nó vào dự án mini-redis, để mô hình phân tích tính khả thi và gợi ý chỉnh sửa:

![M2.7可行性分析](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-feasibility-analysis.png)

Sau khi chờ một lúc mô hình hoàn thành phân tích khả thi cuối tài liệu và sắp xếp, chúng ta bắt đầu kiểm tra xác nhận thêm về phương án thiết kế của nó. Từ tổng quan dự án có thể thấy, mô hình đã phân tích cấu trúc dự án mini-redis, chính xác định vị đến cấu trúc linked list có thể tái sử dụng trực tiếp cho slow query và hoàn thành điều chỉnh tài liệu vi mô:

![M2.7链表结构体分析](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-linked-list-structure.png)

Nhìn lại tư duy triển khai cấu trúc dữ liệu quan trọng nhất, mô hình cũng kết hợp quy chuẩn code của mini-redis, tạo ra struct theo phong cách Go:

![M2.7 Go风格结构体](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-go-style-struct.png)

Về đo thời gian slow query, có một chi tiết đáng đề cập. Điểm vào xử lý lệnh của cá nhân triển khai và Redis gốc có một số sự khác biệt trong thiết kế: do tính năng cú pháp Go, tác giả đã xử lý đặc biệt con trỏ, hàm con trỏ và tổ chức file. Mô hình chính xác định vị được AOP đo thời gian dựa trên mô hình goroutine của tác giả, hoàn thành bộ đếm thời gian trước và thống kê sau, thực hiện giám sát slow query.

![M2.7时间测量切面](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-time-measurement-aspect.png)

Cuối cùng là triển khai chỉ lệnh slow query cốt lõi, dù là phân tích tham số hay hàm truy vấn lệnh và xử lý phản hồi, mô hình đều kết hợp logic đóng gói trong dự án hiện tại của tác giả đưa ra phương án code rõ ràng:

![M2.7慢查询指令实现](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-slowlog-command-implementation.png)

Sau khi kiểm tra kỹ tài liệu thiết kế, tư duy phát triển tổng thể về cơ bản nhất quán, nhưng trong chi tiết tổ chức code vẫn còn không gian tối ưu — ví dụ mô hình tách chỉ lệnh `slowlog` thành file độc lập, thay vì tuân theo quy ước dự án thống nhất đặt vào `command.go`. Cân nhắc rằng tính năng slow query không phải là chỉ lệnh đọc/ghi bộ nhớ cốt lõi, và logic quản lý log của nó tương đối độc lập, cách xử lý này cũng là sự dung hòa hợp lý. Sau khi cân nhắc, chúng ta quyết định giữ nguyên cách triển khai của mô hình, đồng thời chỉnh tay một phần bố cục file để phù hợp với quy chuẩn công trình đã có, sau đó thúc đẩy phần còn lại của công việc phát triển.

Chi tiết này cũng cho thấy: dù kiến trúc code do AI tạo ra hợp lý, việc thích ứng với quy chuẩn công trình đã có vẫn cần kiểm soát thủ công.

Thêm một điều, trong toàn bộ quá trình triển khai tính năng slow query, mô hình có hai lần tạo ra code không phù hợp phong cách dự án (như cách xử lý lỗi), cần chỉnh tay. Đây không phải vấn đề lớn, nhưng cho thấy hoàn toàn dựa vào AI để tạo ra vẫn không được.

### Nghiệm thu

Vì tác giả đã chỉ định rõ mô hình phát triển TDD, vì vậy mô hình trong thời gian này đã kết hợp phản hồi đầu ra và mô tả tài liệu để hoàn thành tự sửa lỗi vòng lặp, cuối cùng kết hợp phong cách dự án mini-redis để hoàn thành việc sao chép chỉ lệnh slow query.

Nhờ khả năng suy luận và tái cấu trúc của AI, trong quá trình nghiệm thu chúng ta có nhiều không gian để suy nghĩ hơn. Trước đây do chi phí phân tích, tóm tắt mã nguồn và nghiệm thu kỹ thuật quá lớn, dẫn đến logic tải cấu hình redis.conf mãi chưa được triển khai.

Vì tác giả cần đặt thời gian slow query thành 0, thuận tiện để nghiệm thu cuối cùng chỉ lệnh slow query, nên tác giả nhân tiện đề xuất thêm yêu cầu tải cấu hình cho nó:

![M2.7配置加载实现](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/m2.7-config-loading.png)

Toàn bộ quá trình phân tích logic và phát triển chưa đến 1 giờ, tác giả thuận lợi hoàn thành việc sao chép chỉ lệnh slow query và nghiệm thu, để minh họa tính năng slow query, đặt ngưỡng slow query của mini-redis thành 0:

```bash
# 慢查询阈值（微秒）
# 执行时间超过此值的命令会被记录到慢查询日志中
# 负值表示禁用慢查询日志，0 表示记录所有命令
# 默认值：10000（10毫秒）
slowlog-log-slower-than 0
```

Sau khi khởi động service mini-redis, gõ slowlog get mặc định trả về rỗng:

![slowlog get初始状态](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/slowlog-get-initial-state.png)

Sau khi thực hiện thao tác set đơn giản, gõ slowlog get, chỉ lệnh này như dự kiến được xác định là chỉ lệnh slow query và hiển thị:

![slowlog get记录set命令](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/slowlog-get-record-set-command.png)

Tương tự, chúng ta lần lượt gõ các chỉ lệnh tiếp theo, cũng đều chính xác theo phương pháp head insert của linked list để vào queue, thực hiện hiển thị theo thứ tự giảm dần theo thời gian:

![slowlog get多条记录](https://oss.javaguide.cn/github/javaguide/ai/coding/m2.7/slowlog-get-multiple-records.png)

## Tổng kết thực chiến: Suy nghĩ về quy trình làm việc lập trình với sự hỗ trợ của AI

Thông qua thực chiến trong hai tình huống điển hình, tóm tắt một số kinh nghiệm và suy nghĩ về việc sử dụng Trae + mô hình lớn hỗ trợ lập trình.

### Lập trình với sự hỗ trợ của AI có thể làm gì

Trong hai tình huống trên, lập trình với sự hỗ trợ của AI thể hiện một số khả năng cốt lõi:

| Chiều năng lực               | Biểu hiện tình huống                                                                      | Giải thích                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Chẩn đoán sự cố và kiểm soát | Tình huống 1: Nhanh chóng xác định vấn đề connection pool, cung cấp phương án degradation | Chuỗi suy luận đầy đủ, có thể phân tích từ stack frame đến chuỗi gọi          |
| Hiểu ngữ cảnh code           | Tình huống 1: Kết hợp Schema database phân tích điểm nghẽn truy vấn                       | Không giới hạn trong một file, có thể liên kết các phụ thuộc xuyên module     |
| Di chuyển code đa ngôn ngữ   | Tình huống 2: Sao chép slow query từ C sang Go                                            | Logic cốt lõi chính xác, thích ứng quy chuẩn công trình còn không gian tối ưu |
| Hiểu hệ thống phức tạp       | Tình huống 2: Phân tích mã nguồn Redis                                                    | Có thể nắm bắt ý định thiết kế, đầu ra tài liệu kỹ thuật có cấu trúc          |

### Kinh nghiệm và bài học từ thực chiến

**Những điểm làm tốt**:

- **Nhanh chóng thu hẹp phạm vi vấn đề**: Trong tình huống 1, mô hình từ N chỗ gọi Redis nhanh chóng xác định 4 nguyên nhân gốc rễ có thể, đến cuối cùng xác nhận thao tác scan dẫn đến connection pool bị chết, toàn bộ chuỗi suy luận rõ ràng
- **Đầu ra phương án đa lớp**: Phương án kiểm soát sự cố, phân tích nguyên nhân gốc rễ, gợi ý tối ưu hóa dài hạn được đưa ra theo lớp, phù hợp với quy trình xử lý sự cố thực tế
- **TDD tự sửa lỗi vòng lặp**: Trong tình huống 2, sau khi chỉ định chế độ TDD, mô hình có thể tự sửa lỗi dựa trên phản hồi test, giảm can thiệp thủ công

**Những điểm cần chú ý**:

- **Phương án mạnh bạo**: Một số phương án của mô hình (như xóa cache Redis) có thể quá mạnh bạo, môi trường production cần chiến lược bảo thủ hơn, điểm này nhất định phải kiểm soát thủ công
- **Thích ứng quy chuẩn công trình**: Dù cấu trúc code được tạo ra hợp lý, mức độ phù hợp với quy chuẩn cá nhân/nhóm cần sự mài giũa. Ví dụ trong tình huống 2, tổ chức file của chỉ lệnh `slowlog` cần chỉnh tay
- **Xử lý trường hợp biên**: Một số code phòng thủ cho các tình huống cực đoan khuyến nghị bổ sung thủ công — AI có thể giúp bạn đi được 90%, 10% còn lại vẫn phải tự lo
- **Tính nhất quán trong luồng dài**: Trong quá trình lặp đi lặp lại liên tục với dự án phức tạp, cần chú ý đến vấn đề suy giảm bộ nhớ ngữ cảnh

### Một số gợi ý khi sử dụng Trae + mô hình lớn

1. **Cung cấp ngữ cảnh đầy đủ**: Xác định rõ các ràng buộc, quy chuẩn code, cấu trúc dự án, chất lượng đầu ra của mô hình sẽ tốt hơn nhiều
2. **Xác nhận từng giai đoạn**: Kiến trúc phức tạp không nên để AI tạo ra quá nhiều code một lần, xác nhận và điều chỉnh từng giai đoạn sẽ kiểm soát được hơn
3. **Kiểm soát thủ công các quyết định quan trọng**: Các lựa chọn ở tầng kiến trúc (như chiến lược cache, phương án degradation) cần developer phán đoán dựa trên tình huống nghiệp vụ, AI không thể thay bạn làm
4. **Tận dụng chế độ TDD**: Chỉ định quy trình test-driven development, để mô hình tự sửa lỗi trong phản hồi test, hiệu quả hơn

## Lời kết

Trae như một AI coding IDE, sau khi tích hợp mô hình lớn trải nghiệm tương đối mượt mà — hiểu ngữ cảnh, phân chia task, tạo code, nghiệm thu test trong chế độ Agent tạo thành quy trình làm việc hoàn chỉnh.

Nhưng công cụ cuối cùng chỉ là công cụ. Nhìn lại hai tình huống trong bài viết này:

- **Chẩn đoán sự cố Redis trong tình huống 1**, cần có nhận thức rõ ràng về cơ chế connection pool của Redis, độ phức tạp thời gian của lệnh scan, mới có thể phán đoán phân tích mô hình đưa ra có hợp lý không.
- **Tái cấu trúc đa ngôn ngữ trong tình huống 2**, cần hiểu sâu về triết lý thiết kế mã nguồn Redis, quy chuẩn công trình Go, mới có thể đánh giá chất lượng phương án tái cấu trúc.

Công cụ lập trình AI có thể rút ngắn thời gian "từ ý tưởng đến code", nhưng việc nắm vững nguyên lý cơ bản, khả năng phán đoán kiến trúc hệ thống, vẫn cần developer tự tích lũy. Tiền đề để dùng tốt AI, là bạn phải hiểu rõ hơn AI về những gì bạn đang làm.
