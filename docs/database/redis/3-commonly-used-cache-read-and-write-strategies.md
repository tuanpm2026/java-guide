---
title: Giải thích chi tiết 3 chiến lược đọc/ghi cache phổ biến
description: So sánh sâu ba chiến lược đọc/ghi cache Cache Aside, Read/Write Through, Write Behind, kèm sơ đồ sequence chi tiết, phân tích vấn đề consistency và giải pháp cấp production. Bắt buộc phải biết khi thực chiến Redis!
category: Cơ sở dữ liệu
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: chiến lược đọc/ghi cache,Cache Aside,Read Through,Write Through,Write Behind,Write Back,cache consistency,cache invalidation,bypass cache,read-write through,async cache write,Redis cache strategy,cache update strategy
---

Tôi thấy nhiều bạn ghi trong CV "**thành thạo sử dụng cache**", nhưng khi hỏi về "**3 chiến lược đọc/ghi cache phổ biến**" thì lại ngơ ngác.

Theo tôi, nguyên nhân của vấn đề này là khi học Redis, có thể chúng ta chỉ viết một số Demo đơn giản mà không quan tâm đến chiến lược đọc/ghi cache, hoặc thậm chí không biết điều này tồn tại.

Nhưng, hiểu rõ 3 chiến lược đọc/ghi cache phổ biến rất hữu ích cho cả việc sử dụng cache trong công việc thực tế lẫn khi bị hỏi về cache trong phỏng vấn!

**Ba chế độ được giới thiệu dưới đây đều có ưu và nhược điểm riêng, không có chế độ tốt nhất — hãy chọn chiến lược phù hợp dựa trên tình huống nghiệp vụ cụ thể.**

### Cache Aside Pattern (Chế độ cache bên cạnh)

Đây là chế độ **phổ biến và kinh điển nhất** trong phát triển hàng ngày, gần như là tiêu chuẩn thực tế của các giải pháp cache ứng dụng Internet, đặc biệt phù hợp với tình huống **đọc nhiều ghi ít**.

Lý do chế độ này được gọi là **"Aside" (bên cạnh)** là vì **các thao tác ghi của ứng dụng hoàn toàn bỏ qua cache, trực tiếp thao tác DB**.

Ứng dụng đóng vai "chỉ huy" luồng dữ liệu, cần duy trì đồng thời cả hai nguồn dữ liệu Cache và DB.

Hãy xem các bước đọc/ghi cache trong chế độ này.

**Thao tác ghi:**

1. Ứng dụng **cập nhật DB trước**.
2. Sau đó **xóa dữ liệu tương ứng trong Cache**.

Vẽ một hình đơn giản giúp hiểu các bước ghi.

![](https://oss.javaguide.cn/github/javaguide/database/redis/cache-aside-write.png)

**Thao tác đọc:**

1. Ứng dụng đọc dữ liệu từ Cache trước.
2. Nếu hit (Cache hit), trả về ngay.
3. Nếu miss (Cache miss), đọc từ DB, sau khi đọc thành công, **ghi dữ liệu vào Cache**, rồi trả về.

Vẽ một hình đơn giản giúp hiểu các bước đọc.

![](https://oss.javaguide.cn/github/javaguide/database/redis/cache-aside-read.png)

Chỉ biết những điều trên là chưa đủ. Chúng ta cần hiểu nguyên lý bên trong.

Ví dụ phỏng vấn viên rất có thể sẽ hỏi thêm:

1. Tại sao thao tác ghi là "cập nhật DB trước, xóa Cache sau"? Có thể đổi thứ tự không?
2. Vậy "cập nhật DB trước, xóa Cache sau" có tuyệt đối an toàn không?
3. Tại sao lại "xóa Cache" mà không "cập nhật Cache"?

Tiếp theo tôi sẽ phân tích và giải đáp lần lượt các câu hỏi này.

**1. Tại sao thao tác ghi là "cập nhật DB trước, xóa Cache sau"? Có thể đổi thứ tự không?**

**Trả lời:** Tuyệt đối không thể. Nếu "xóa Cache trước, cập nhật DB sau", trong điều kiện high concurrency sẽ gây ra vấn đề data inconsistency kinh điển.

- **Phân tích sequence (Request A ghi, Request B đọc):**
  1. Request A: Xóa dữ liệu trong Cache trước.
  2. Request B: Phát hiện Cache trống, đọc **giá trị cũ** từ DB và chuẩn bị ghi vào Cache.
  3. Request A: Ghi **giá trị mới** vào DB.
  4. Request B: Ghi **giá trị cũ** vừa đọc được vào Cache.
- **Kết quả:** DB chứa giá trị mới, Cache chứa giá trị cũ — data inconsistency.

**2. Vậy "cập nhật DB trước, xóa Cache sau" có tuyệt đối an toàn không?**

**Trả lời:** Cũng không tuyệt đối an toàn! Vì cách này vẫn có thể gây ra vấn đề **database và cache data không nhất quán**.

- **Phân tích sequence (Request A đọc, Request B ghi):**
  1. Request A: Cache miss, đọc **giá trị cũ** từ DB.
  2. Request B: Nhanh chóng hoàn tất cập nhật DB và xóa Cache.
  3. Request A: Ghi **giá trị cũ** đã lấy trước đó vào Cache.
- **Kết quả:** DB chứa giá trị mới, Cache lại chứa giá trị cũ.
- **Tại sao xác suất cực nhỏ?** Vấn đề này về bản chất là vấn đề timing concurrency: chỉ cần trong khoảng thời gian "đọc DB → ghi Cache", có write request hoàn tất cập nhật DB là có thể xảy ra inconsistency. Trong hầu hết các nghiệp vụ, khoảng thời gian này tương đối ngắn, và còn cần đồng thời xảy ra với write request, nên xác suất không cao, nhưng tuyệt đối không phải không có.

**3. Tại sao lại "xóa Cache" mà không "cập nhật Cache"?**

- **Chi phí hiệu năng:** Thao tác ghi thường chỉ cập nhật một phần field của object. Nếu để "cập nhật Cache" mà phải query lại hoặc tính toán lại toàn bộ cache object, chi phí có thể rất lớn. Ngược lại, "xóa" là thao tác nhẹ.
- **Lazy loading thought:** Thao tác "xóa" tuân theo nguyên tắc lazy loading. Chỉ khi dữ liệu thực sự được cần (được đọc) lần sau, mới trigger load từ DB và ghi vào cache, tránh việc cập nhật cache vô ích.
- **An toàn concurrency:** "Cập nhật cache" trong high concurrency có thể xảy ra vấn đề thứ tự cập nhật lộn xộn, xác suất dữ liệu bẩn cao hơn.

Tất nhiên, tất cả những điều này đều dựa trên một tiền đề quan trọng: dữ liệu cache có thể được tái tạo một cách xác định từ database, và nghiệp vụ có thể chấp nhận data inconsistency trong khoảng thời gian cực ngắn giữa 'xóa cache' và 'lần đọc và backfill tiếp theo'.

Bây giờ hãy phân tích thêm **nhược điểm của Cache Aside Pattern**.

**Nhược điểm 1: Request đầu tiên nhất định không có trong Cache**

Giải pháp: Đối với hot data có lượng truy cập cực lớn, có thể warm up cache khi hệ thống khởi động hoặc trong giờ thấp điểm.

**Nhược điểm 2: Nếu thao tác ghi quá thường xuyên, dữ liệu trong Cache sẽ thường xuyên bị xóa, ảnh hưởng đến cache hit rate.**

Giải pháp:

- Tình huống yêu cầu database và cache data strong consistency: Khi cập nhật DB cũng đồng thời cập nhật Cache, nhưng cần thêm lock/distributed lock để đảm bảo không có vấn đề thread safety khi cập nhật Cache.
- Tình huống có thể tạm thời cho phép database và cache data không nhất quán: Khi cập nhật DB cũng đồng thời cập nhật Cache, nhưng đặt expiration time tương đối ngắn cho cache (ví dụ 1 phút), như vậy ngay cả khi dữ liệu không nhất quán thì ảnh hưởng cũng nhỏ.

### Read/Write Through Pattern (Đọc/Ghi xuyên qua)

Trong chế độ này, ứng dụng coi **Cache là lưu trữ duy nhất và chính**. Tất cả request đọc/ghi đều trực tiếp đến Cache, còn Cache service tự chịu trách nhiệm đồng bộ dữ liệu với DB.

**Trong suốt** với ứng dụng, developer không cần quan tâm đến sự tồn tại của DB.

Chiến lược đọc/ghi cache này các bạn có thể thấy rất hiếm trong phát triển hàng ngày. Ngoài ảnh hưởng về hiệu năng, xác suất cao là vì Redis distributed cache thường dùng không tự cung cấp chức năng Cache ghi dữ liệu vào DB — chúng ta cần tự triển khai ở tầng nghiệp vụ hoặc middleware.

**Ghi (Write Through):**

- Query Cache trước. Nếu Cache không có, cập nhật DB trực tiếp.
- Nếu Cache có, cập nhật Cache trước, sau đó Cache service tự cập nhật DB. Chỉ khi cả Cache và DB đều ghi thành công mới trả về thành công cho tầng trên.

Vẽ một hình đơn giản giúp hiểu các bước ghi.

![](https://oss.javaguide.cn/github/javaguide/database/redis/write-through.png)

**Đọc (Read Through):**

- Ứng dụng đọc dữ liệu từ Cache.
- Nếu hit, trả về ngay.
- Nếu miss, **Cache service tự chịu trách nhiệm** load dữ liệu từ DB, sau khi load thành công ghi vào mình trước, rồi mới trả về cho ứng dụng.

Vẽ một hình đơn giản giúp hiểu các bước đọc.

![](https://oss.javaguide.cn/github/javaguide/database/redis/read-through.png)

Read-Through thực ra chỉ là encapsulation trên cơ sở Cache-Aside. Trong Cache-Aside, khi xảy ra read request mà Cache không có dữ liệu tương ứng, client tự chịu trách nhiệm ghi dữ liệu vào Cache; còn Read Through thì Cache service tự ghi vào cache, điều này trong suốt với client.

Từ góc độ triển khai, Read-Through về bản chất là chuyển logic "đọc Miss → đọc DB → backfill Cache" trong Cache-Aside xuống bên trong cache service, trong suốt với client.

Giống Cache Aside, Read-Through cũng có vấn đề request đầu tiên nhất định không có trong Cache — với hot data có thể đưa vào cache trước.

### Write Behind Pattern (Ghi cache bất đồng bộ)

Write Behind (còn gọi là Write-Back) Pattern rất giống Read/Write Through Pattern, cả hai đều do Cache service chịu trách nhiệm đọc/ghi Cache và DB.

Nhưng có sự khác biệt lớn: **Read/Write Through đồng bộ cập nhật Cache và DB, trong khi Write Behind chỉ cập nhật cache, không trực tiếp cập nhật DB mà dùng cách batch update bất đồng bộ để cập nhật DB.**

**Thao tác ghi (Write Behind):**

1. Ứng dụng ghi dữ liệu vào Cache, sau đó **trả về ngay lập tức**.
2. Cache service đưa thao tác ghi này vào queue.
3. Thông qua một thread/task bất đồng bộ độc lập, **batch write và merge** các thao tác ghi trong queue vào DB.

Chế độ này mang lại thách thức cho data consistency (ví dụ: dữ liệu trong Cache chưa kịp ghi lại DB thì hệ thống đã crash), nên không phù hợp với tình huống cần strong consistency (như giao dịch, tồn kho).

Nhưng tính bất đồng bộ và batch của nó mang lại **write performance vô song**. Nó được ứng dụng rộng rãi trong nhiều hệ thống high performance:

- **Cơ chế InnoDB Buffer Pool của MySQL:** Sửa đổi dữ liệu được thực hiện trong memory Buffer Pool trước, sau đó background thread flush bất đồng bộ ra disk.
- **Page Cache của hệ điều hành:** Ghi file cũng được ghi vào memory trước, rồi OS flush bất đồng bộ ra disk.
- **Tình huống đếm tần suất cao:** Với các tình huống như lượt xem bài viết, số like bài đăng — cho phép data inconsistency tạm thời nhưng ghi cực thường xuyên — có thể tích lũy nhanh trong Redis trước, sau đó định kỳ đồng bộ bất đồng bộ về database.

<!-- @include: @article-footer.snippet.md -->
