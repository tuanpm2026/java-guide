---
title: Hướng dẫn Code Refactoring
description: Hướng dẫn thực hành code refactoring, bao gồm định nghĩa refactoring, nguyên tắc refactoring, nhận diện code smell và các kỹ thuật refactoring cùng best practice.
category: Code Quality
head:
  - - meta
    - name: keywords
      content: code refactoring,refactoring techniques,refactoring principles,design pattern,SOLID,code smell,maintainability,unit test
---

Gần đây tôi đọc lại cuốn [《Refactoring: Improving the Design of Existing Code》](https://book.douban.com/subject/30468597/) — thu được nhiều điều. Thế là viết bài ngắn để chia sẻ quan điểm về refactoring.

![](https://oss.javaguide.cn/github/javaguide/image-20220311155746549.png)

## Refactoring là gì?

Cuốn sách kinh điển bắt buộc phải đọc khi học refactoring là 《Refactoring: Improving the Design of Existing Code》 đưa ra định nghĩa từ hai góc độ:

> - Refactoring (danh từ): Một loại điều chỉnh cấu trúc nội bộ phần mềm. Mục đích là cải thiện khả năng hiểu và giảm chi phí sửa đổi mà không thay đổi hành vi quan sát được của phần mềm.
> - Refactoring (động từ): Dùng một loạt kỹ thuật refactoring để điều chỉnh cấu trúc phần mềm mà không thay đổi hành vi quan sát được của nó.

Nói theo ngôn ngữ gần gũi với engineer hơn: **Refactoring là tận dụng design pattern (như composite pattern, strategy pattern, chain of responsibility pattern), software design principle (như SOLID principle, YAGNI principle, KISS principle) và refactoring technique (như encapsulation, inheritance, build test system) để làm cho code dễ hiểu hơn, dễ modify hơn.**

Software design principle hướng dẫn chúng ta tổ chức và chuẩn hóa code. Đồng thời refactoring cũng là để có thể thiết kế ra phần mềm thỏa mãn software design principle tốt hơn.

Điều cốt lõi của refactoring đúng đắn là **bước đi phải nhỏ, mỗi bước refactoring không ảnh hưởng đến hoạt động bình thường của phần mềm và có thể dừng refactoring bất cứ lúc nào.**

**Các design pattern phổ biến**:

![Các design pattern phổ biến](https://oss.javaguide.cn/github/javaguide/system-design/basis/common-design-patterns.png)

Tổng hợp đầy đủ hơn về design pattern, xem open source project **[java-design-patterns](https://github.com/iluwatar/java-design-patterns)**.

**Các software design principle phổ biến**:

![Các software design principle phổ biến](https://oss.javaguide.cn/github/javaguide/system-design/basis/programming-principles.png)

Tổng hợp đầy đủ hơn về design principle, xem hai open source project **[java-design-patterns](https://github.com/iluwatar/java-design-patterns)** và **[hacker-laws-zh](https://github.com/nusr/hacker-laws-zh)**.

## Tại sao cần Refactoring?

Khi giới thiệu định nghĩa refactoring ở trên, tôi đã giới thiệu lợi ích của refactoring từ góc độ tương đối trừu tượng: Mục đích chính của refactoring là cải thiện flexibility/extensibility và reusability của code & architecture.

Nếu ánh xạ vào project thực tế, refactoring cụ thể mang lại lợi gì cho chúng ta?

1. **Làm code dễ hiểu hơn**: Thêm comment, chuẩn hóa tên biến, tối ưu logic giúp code dễ được hiểu hơn.
2. **Tránh code decay**: Loại bỏ code có mùi (code smell) qua refactoring.
3. **Hiểu sâu hơn về code**: Quá trình refactoring sẽ giúp bạn hiểu sâu hơn về một phần code nào đó.
4. **Phát hiện potential bug**: Rất nhiều potential bug được phát hiện trong quá trình refactoring.
5. ……

Đọc xong giới thiệu trên về lợi ích của refactoring, bạn sẽ thấy mục tiêu cuối cùng của refactoring là **cải thiện tốc độ và chất lượng phát triển phần mềm**.

Refactoring không làm chậm tốc độ phát triển phần mềm. Ngược lại, nếu chất lượng code và software design kém, khi muốn thêm feature mới tốc độ phát triển sẽ ngày càng chậm. Cuối cùng thậm chí có cảm giác muốn viết lại toàn bộ hệ thống.

![](https://oss.javaguide.cn/github/javaguide/bad&good-design.png)

Trong 《Refactoring: Improving the Design of Existing Code》 có viết:

> Mục đích duy nhất của refactoring là giúp chúng ta phát triển nhanh hơn, tạo ra nhiều giá trị hơn với ít công sức hơn.

## Performance Optimization có phải là Refactoring không?

Mục đích của refactoring là cải thiện readability, maintainability và flexibility của code. Nó quan tâm đến cấu trúc nội bộ của code — làm thế nào để developer hiểu code dễ hơn, làm thế nào để feature development và maintenance sau này hiệu quả hơn. Còn performance optimization là để code chạy nhanh hơn và chiếm ít tài nguyên hơn — nó quan tâm đến biểu hiện bên ngoài của chương trình — giảm response time, giảm resource consumption, tăng system throughput. Hai cái này trông có vẻ đối lập nhưng thực ra mục tiêu thống nhất — đều để cải thiện overall quality của phần mềm.

Trong phát triển thực tế, cách làm lý tưởng là trước tiên **đảm bảo readability và maintainability của code**, sau đó chọn phương tiện performance optimization phù hợp theo nhu cầu thực tế. Software design tốt không phải theo đuổi performance maximize mà là tìm sự cân bằng giữa maintainability và performance. Qua cách này chúng ta có thể xây dựng hệ thống phần mềm vừa **dễ quản lý** vừa có **hiệu năng tốt**.

## Khi nào nên Refactoring?

Refactoring có thể được thực hiện bất cứ lúc nào trong quá trình phát triển — gặp thời thì làm. Không cần phân bổ riêng một đến hai ngày chỉ để refactoring.

### Trước khi commit code

Cuốn sách 《Refactoring: Improving the Design of Existing Code》 giới thiệu khái niệm **Campsite Rule**:

> Khi lập trình, cần tuân theo Campsite Rule: đảm bảo code base khi bạn rời đi nhất định khỏe mạnh hơn khi bạn đến.

Tư tưởng cốt lõi khái niệm này thực ra rất đơn giản: Trước khi commit code, dành chút thời gian suy nghĩ — commit lần này có làm project code khỏe mạnh hơn không, hay làm nó tệ hơn, hay không thay đổi gì?

Chỉ khi mỗi người trong project team đảm bảo commit của mình không làm project code tệ hơn, project code mới phát triển theo hướng lành mạnh.

**Khi rời khỏi campsite (project code), đừng để lại rác (code smell)! Cố gắng đảm bảo campsite sạch hơn trước!**

### Sau & Trước khi phát triển một feature mới

Sau khi phát triển một feature mới, nên quay lại xem có chỗ nào có thể cải thiện không. Trước khi thêm feature mới, có thể suy nghĩ xem mình có thể refactor code để việc phát triển feature mới dễ hơn không.

Phát triển một feature mới không chỉ đơn giản là verify feature pass — còn nên cố gắng đảm bảo chất lượng code.

Có một ẩn dụ về hai chiếc mũ: Trước khi tôi phát triển feature mới, tôi phát hiện refactoring có thể làm cho việc phát triển feature mới dễ hơn — tôi đội mũ refactoring. Sau khi refactor xong, tôi đổi lại mũ cũ, tiếp tục phát triển feature mới. Sau khi phát triển xong feature mới, tôi lại thấy code của mình khó hiểu — tôi lại đội mũ refactoring. Trạng thái phát triển tốt là như vậy — liên tục chuyển đổi giữa refactoring và phát triển feature mới.

![refactor-two-hats](https://oss.javaguide.cn/github/javaguide/refractor-two-hats.png)

### Sau Code Review

Code Review có thể cải thiện overall quality của code rất hiệu quả. Nó giúp chúng ta phát hiện code smell và những nơi có thể có vấn đề. Hơn nữa Code Review giúp programmer khác trong project team hiểu business module bạn phụ trách — tránh hiệu quả rủi ro single point về nhân lực.

Sau một lần Code Review, code của bạn có thể nhận được nhiều gợi ý cải tiến.

### Trash-collection Refactoring

Khi chúng ta phát hiện code smell (rác), nếu không muốn dừng công việc đang làm nhưng cũng không muốn để rác đó lại:

- Nếu rác này dễ refactor thì refactor ngay lập tức.
- Nếu rác này không dễ refactor, có thể ghi lại — hoàn thành task hiện tại rồi quay lại refactor.

### Khi đọc và hiểu code

Developer nên rất có cảm nhận: Chúng ta thường xuyên phải đọc code người khác trong team viết, cũng thường xuyên phải đọc code mình viết trong quá khứ. Thời gian đọc code thường nhiều hơn thời gian viết code rất nhiều.

Khi đọc và hiểu code, nếu phát hiện một số code smell, có thể refactor chúng.

Ví dụ khi đọc một đoạn code nào đó của A viết, bạn thấy đoạn code logic này quá phức tạp khó hiểu và bạn có cách viết tốt hơn — bạn có thể refactor đoạn code logic này của A.

## Có những lưu ý gì khi Refactoring?

### Unit test là mạng lưới bảo vệ Refactoring

**Unit test có thể cung cấp confidence cho refactoring, giảm chi phí refactoring. Chúng ta nên coi trọng unit test như coi trọng production code.**

Nói thêm một điểm: CI cũng phụ thuộc unit test. Khi CI service tự động build code mới, sẽ tự động chạy unit test để phát hiện code error.

**Thế nào mới gọi là unit test?** Có rất nhiều định nghĩa trên mạng, rất trừu tượng, dễ đọc xong vẫn mơ hồ. Tôi cho rằng định nghĩa unit test chủ yếu phụ thuộc vào project của bạn — một function hay thậm chí một class đều có thể coi là một unit. Ví dụ chúng ta viết một method tính individual stock return rate — để verify tính đúng đắn của nó chúng ta viết riêng một unit test. Hay code có một class chuyên phụ trách data masking — để verify masking có đúng kỳ vọng không chúng ta viết riêng unit test cho class đó.

**Unit test cũng cần được refactor hay modify.** Cuốn [《Clean Code: A Handbook of Agile Software Development》](https://book.douban.com/subject/4199741/) viết:

> Test code cần được modify theo sự phát triển của production code. Nếu test không thể giữ clean, sẽ ngày càng khó modify.

### Đừng refactoring chỉ để refactoring

**Refactoring nhất định phải mang lại giá trị cho project!** Trong một số tình huống không nên refactoring:

- Sau khi học một design pattern/engineering practice, bất chấp tình hình thực tế của project, cố ý áp dụng lên project (tránh cargo cult programming).
- Khi project đang gấp, refactor code tầng dưới của một API mà project gọi (refactoring xong không mang lại giá trị gì cho việc project gọi API này).
- Rewrite dễ hơn và tiết kiệm hơn refactoring.
- ……

### Tuân theo phương pháp luận

Cuốn 《Refactoring: Improving the Design of Existing Code》 liệt kê nhiều code smell phổ biến (như duplicate code, overly long function) và refactoring technique (như extract function, extract variable, extract class). Chúng ta nên dành thời gian học các kiến thức lý thuyết liên quan đến refactoring và thực hành các lý thuyết refactoring này trong code.

## Làm thế nào để luyện tập Refactoring?

Ngoài việc luyện tập và nâng cao kỹ năng refactoring trong quá trình refactor project code, còn có các cách sau:

- [Khi tôi refactoring, tôi đang nghĩ gì](https://mp.weixin.qq.com/s/pFaFKMXzNCOuW2SD9Co40g): Bài viết của Zhuanzhuan Tech tổng kết các tình huống refactoring và cách refactoring phổ biến.
- [Refactoring Practice](https://linesh.gitbook.io/refactoring/): Học refactoring từng bước qua một số case nhỏ!
- [Design Pattern + Refactoring Learning Website](https://refactoringguru.cn/): Học miễn phí online về code refactoring, design pattern, SOLID principle (Single responsibility, Open-Closed, Liskov Substitution, Interface Segregation và Dependency Inversion).
- [IDEA Official Docs Code Refactoring Tutorial](https://www.jetbrains.com/help/idea/refactoring-source-code.html#popular-refactorings): Dạy bạn cách refactoring với IDEA.

## Tài liệu tham khảo

- [Đọc lại 《Refactoring》 - ThoughtWorks Insights - 2020](https://insights.thoughtworks.cn/reread-refactoring/): Giới thiệu chi tiết các điểm quan trọng của refactoring như small-step refactoring, trash-collection refactoring. Chủ yếu về giới thiệu khái niệm refactoring.
- [Kỹ thuật code refactoring phổ biến - VectorJin - 2021](https://juejin.cn/post/6954378167947624484): Giới thiệu cách refactoring từ góc độ software design principle, design pattern, code layering, naming convention. Thiên về thực chiến hơn.
