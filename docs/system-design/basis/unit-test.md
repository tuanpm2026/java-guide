---
title: Unit Test thực chất là gì? Nên làm như thế nào?
description: Hướng dẫn nhập môn unit test, bao gồm khái niệm unit test, kỹ thuật Mock và Stub, test pyramid và cách dùng JUnit test framework.
category: Code Quality
head:
  - - meta
    - name: keywords
      content: unit test,Unit Testing,Mock,Stub,Fake,test pyramid,testability,TDD,JUnit
---

> Bài này được tái cấu trúc và hoàn thiện từ bài [Bàn về tại sao viết unit test - Keyboard Man - 2016](https://www.jianshu.com/p/fa41fb80d2b8).

## Unit Test là gì?

Wikipedia giới thiệu unit test như sau:

> Trong lập trình máy tính, Unit Testing là công việc kiểm tra tính đúng đắn nhắm vào program module (đơn vị thiết kế nhỏ nhất của phần mềm).
>
> Program unit là **phần có thể test nhỏ nhất** của ứng dụng. Trong procedural programming, một unit là single program, function, procedure, v.v. Với OOP, unit nhỏ nhất là method, bao gồm method trong base class (superclass), abstract class hay derived class (subclass).

Vì mỗi unit có logic độc lập, khi unit test cần isolate external dependency, đảm bảo các dependency đó không ảnh hưởng đến verification logic. Chúng ta thường dùng Fake, Stub và Mock.

Về giải thích các khái niệm Fake, Mock và Stub, xem bài: [Làm rõ khái niệm Fakes, Mocks và Stubs trong testing - Wang Xia Yao Yue Xiong - 2018](https://zhuanlan.zhihu.com/p/26942686).

## Tại sao cần Unit Test?

### Bảo vệ Refactoring

Trong bài [refactoring](./refactoring.md) tôi viết:

> Unit test có thể cung cấp confidence cho refactoring, giảm chi phí refactoring. Chúng ta nên coi trọng unit test như coi trọng production code.

Mỗi developer đều trải qua refactoring. Tình trạng code bị hỏng sau khi refactor không phải hiếm gặp — có thể chỉ sửa một method đơn giản mà gây ra lỗi nghiêm trọng trong hệ thống.

Nếu có unit test thì không còn rủi ro ẩn này nữa. Viết xong một class thì viết unit test, đảm bảo logic của class đúng. Viết class thứ hai, unit test... Viết 100 class, tương tự, mỗi class đạt điểm đầu tiên "đảm bảo logic đúng" — 100 class ghép lại chắc chắn không có vấn đề. Bạn có thể yên tâm vừa refactor vừa chạy APP — thay vì refactor xong toàn bộ rồi hồi hộp run.

### Cải thiện chất lượng code

Vì mỗi unit có logic độc lập, khi unit test cần isolate external dependency, đảm bảo các dependency không ảnh hưởng đến verification logic. Vì phải tách các dependency, unit test thúc đẩy project chia nhỏ component, sắp xếp lại dependency relationship của project — giảm thiểu code coupling nhiều hơn. Code viết như vậy dễ maintain hơn, dễ extend hơn, từ đó cải thiện chất lượng code.

### Giảm bug

Một cỗ máy gồm nhiều chi tiết nhỏ. Nếu một chi tiết hỏng, máy vận hành sai. Phải đảm bảo mỗi chi tiết đúng theo spec trong bản thiết kế thì máy mới vận hành bình thường.

Một project có thể unit test sẽ chia nhỏ business, feature thành các unit nhỏ hơn có logic độc lập. Mục tiêu của unit test là đảm bảo tính đúng đắn logic của từng unit. Unit test đảm bảo mỗi "chi tiết" của project thực thi theo "spec" (yêu cầu), từ đó đảm bảo toàn bộ "cỗ máy" (project) vận hành đúng, giảm thiểu bug tối đa.

### Nhanh chóng locate bug

Nếu program có bug, chạy tất cả unit test một lần, tìm test không pass — có thể nhanh chóng locate execution code tương ứng. Sau khi fix code, chạy unit test tương ứng. Nếu vẫn không pass, tiếp tục sửa, chạy test... Cho đến khi **test pass**.

### CI phụ thuộc Unit Test

Continuous Integration cần dựa vào unit test. Khi CI service tự động build code mới, sẽ tự động chạy unit test để phát hiện code error.

## Ai bắt bạn viết Unit Test?

### Leader yêu cầu

Một số leader có kinh nghiệm sẽ yêu cầu team viết unit test. Với teammate có một chút kinh nghiệm, yêu cầu này khá hợp lý. Với người ít kinh nghiệm, mới tốt nghiệp — có thể gần chết, viết code còn chưa tốt mà còn phải viết unit test, are you kidding me?

Đào tạo người mới cách dùng unit test là nhiệm vụ khó khăn. Người mới chưa hình thành code style, cũng không biết unit test quan trọng thế nào. Bắt buộc unit test sẽ khiến họ bối rối, không thể viết code theo suy nghĩ của mình.

### Các expert đều viết Unit Test

Nhiều open source project nổi tiếng ở nước ngoài đều có lượng lớn unit test. Ví dụ retrofit, okhttp, butterknife... Expert nước ngoài đều viết unit test, chúng ta cũng viết thôi!

Nhiều bạn đọc có suy nghĩ này, ban đầu rất hứng khởi. Khi thực sự cần unit test cho project của mình thì gặp đủ khó khăn. Lý do lớn là project không thân thiện với unit test. Cuối cùng chỉ có thể unit test một số utility class không đáng kể. Dần dần ước muốn ban đầu cũng tan thành mây khói.

### Giữ thể diện

Đã là developer có vài năm kinh nghiệm mà hàng ngày bị tester đuổi bug thì có mặt mũi nào? Bỏ thêm chút thời gian viết unit test, đảm bảo không có low-level bug, còn thể hiện phong cách expert — sao không làm?

### Không tự tin

Tác giả cũng là người không mấy tin tưởng code của mình, luôn cảm thấy đâu đó sẽ bất ngờ có bug khó hiểu, cũng sợ người khác vô tình sửa code của mình (paranoia), mỗi lần deploy version mới đều hồi hộp... Bỏ chút thời gian viết unit test, có rảnh thì chạy test, đảm bảo logic cũ không có vấn đề — ít nhất ngủ yên hơn.

## TDD - Test-Driven Development

### TDD là gì?

TDD là Test-Driven Development (Phát triển hướng kiểm thử). Đây là một core practice và technology của Agile development, cũng là một design methodology.

Nguyên lý TDD là viết test case code trước khi viết functional code, rồi mới viết functional code nhắm vào test case để nó pass được.

Nhịp điệu của TDD: "Red - Green - Refactor".

![](https://static001.geekbang.org/resource/image/09/7f/090e1fc6aff08b4aa66376f776c2337f.png)

Vì TDD có yêu cầu rất cao với developer, khác với traditional development mindset, nên triển khai khá khó khăn.

TDD trong mắt nhiều người là không thực dụng. Một là họ không hiểu ý nghĩa "driving" development trong testing. Nhưng quan trọng hơn là họ hiếm khi phân rã task. Mà task decomposition là điểm mấu chốt để làm tốt TDD. Chỉ khi phân rã task đến mức có thể test được thì mới có thể viết test có mục tiêu.

### Phân tích ưu nhược điểm của TDD

TDD có ưu và nhược điểm. Vì mỗi test case đều đến từ requirement, hay nói cách khác là chia nhỏ requirement lớn thành nhiều requirement nhỏ để viết test case. Sau khi test case được viết ra, execution code developer viết phải thỏa test case. Nếu test không pass thì sửa execution code cho đến khi test case pass.

**Ưu điểm**:

1. Giúp sắp xếp requirement, làm rõ tư duy.
2. Giúp thiết kế interface hợp lý hơn (nếu chỉ tưởng tượng rất dễ thiết kế ra thứ tệ).
3. Giảm xác suất code có bug.
4. Tăng development efficiency (với điều kiện dùng TDD đúng và thành thạo).

**Nhược điểm**:

1. Người dùng được TDD rất ít, trông có vẻ đơn giản nhưng threshold thực ra rất cao.
2. Đầu tư development resource (thời gian và công sức) thường nhiều hơn.
3. Vì test case được viết trước khi design code, rất có thể hạn chế developer trong thiết kế tổng thể code.
4. Có thể gây bất mãn với developer. Tôi cho điểm này rất nghiêm trọng — không phải ai cũng thích unit test dù unit test mang lại nhiều lợi ích.

Đọc liên quan: [Cách mở TDD với tư thế đúng đắn - Chen Tian - 2017](https://zhuanlan.zhihu.com/p/24997923).

## Chọn Unit Test Framework như thế nào?

Với unit test, các framework phổ biến hiện nay gồm: JUnit, Mockito, Spock, PowerMock, JMockit, TestableMock, v.v.

JUnit gần như là lựa chọn mặc định nhưng không hỗ trợ Mock, nên cần chọn thêm một Mock tool. Mockito và Spock là hai Mock tool phổ biến nhất — thường chọn một trong hai.

Rốt cuộc nên chọn Mockito hay Spock? Tôi đã phân tích so sánh đơn giản:

- Spock không thể Mock static method và private method. Mockito từ 3.4.0 trở đi hỗ trợ Mock static method. Xem issue này: <https://github.com/mockito/mockito/issues/1013>. Tutorial cụ thể: <https://www.baeldung.com/mockito-mock-static-methods>.
- Spock dựa trên Groovy, test code viết ra rõ ràng dễ đọc hơn, khá chuẩn mực (tích hợp sẵn quy chuẩn cấu trúc test given-when-then phổ biến). Mockito không có quy chuẩn cấu trúc cụ thể — cần project team tự thỏa thuận hay tuân theo best practice về test code. Thông thường với cùng test case, code Spock ngắn gọn hơn.
- Mockito được nhiều người dùng hơn, ổn định và đáng tin cậy. Hơn nữa Mockito là Mock tool mà SpringBoot Test tích hợp mặc định.

Cả Mockito và Spock đều là Mock tool rất tốt. Tương đối mà nói, Mockito có applicability rộng hơn.

## Tổng kết

Unit test thực sự mang lại nhiều lợi ích, nhưng không trải nghiệm được ngay lập tức. Giống như mua bảo hiểm trọng bệnh — đóng nhiều phí, không ốm đau, hàng chục năm thậm chí cả đời không dùng đến. Tốt nhất là cả đời không cần dùng bảo hiểm, sức khỏe mới quan trọng nhất. Unit test cũng vậy — viết ra mua được sự yên tâm, là bảo đảm cho code. Có bug thì phát hiện sớm, không bug thì tốt nhất. Không thể nói "viết nhiều unit test như vậy mà không phát hiện được bug, lãng phí thời gian" được chứ?

Dưới đây là một số gợi ý cá nhân về unit test:

> - Code càng quan trọng, càng phải viết unit test.
> - Code không thể unit test thì nên nghĩ nhiều hơn về cách cải thiện, chứ không phải từ bỏ.
> - Vừa viết business code vừa viết unit test, chứ không phải sau khi hoàn thành toàn bộ feature mới viết.
> - Nên nghĩ nhiều hơn về cách cải tiến, đơn giản hóa test code.
> - Test code cần được refactor hoặc modify theo sự phát triển của production code. Nếu test không thể giữ clean, sẽ ngày càng khó sửa đổi.

Là một developer giàu kinh nghiệm, viết unit test nhiều hơn là **chịu trách nhiệm với code của mình**. Code có test case, người khác dễ hiểu hơn. Khi người khác tiếp nhận code của bạn cũng có thể tự tin thực hiện thay đổi.

**Thực hành nhiều hơn, giao lưu nhiều hơn với engineer có kinh nghiệm về unit test** — bạn sẽ thấy lợi ích từ viết unit test ngày càng nhiều hơn.
