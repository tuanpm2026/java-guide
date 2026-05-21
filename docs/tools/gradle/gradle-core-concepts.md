---
title: Tổng hợp các khái niệm cốt lõi của Gradle
description: Gradle là một công cụ xây dựng dự án tự động chạy trên JVM, giúp chúng ta tự động hóa quá trình build dự án.
category: Công cụ phát triển
head:
  - - meta
    - name: keywords
      content: Gradle,Groovy,Gradle Wrapper,Gradle 包装器,Gradle 插件
---

> Nội dung phần này chủ yếu được tổng hợp từ tài liệu chính thức của Gradle, đã được chỉnh sửa và lược bỏ một số phần, giữ lại những phần quan trọng hơn. Không đề cập đến thực hành, chủ yếu là giới thiệu các khái niệm quan trọng.

Nội dung về Gradle này thuộc loại tùy chọn, bạn có thể tự quyết định có nên học hay không tùy theo nhu cầu. Hiện tại ở Trung Quốc vẫn phổ biến dùng Maven hơn.

## Giới thiệu Gradle

Tài liệu chính thức của Gradle giới thiệu Gradle như sau:

> Gradle is an open-source [build automation](https://en.wikipedia.org/wiki/Build_automation) tool flexible enough to build almost any type of software. Gradle makes few assumptions about what you're trying to build or how to build it. This makes Gradle particularly flexible.
>
> Gradle là một công cụ tự động hóa xây dựng mã nguồn mở, đủ linh hoạt để xây dựng hầu hết các loại phần mềm. Gradle đặt ra rất ít giả định về những gì bạn đang cố gắng xây dựng hoặc cách xây dựng nó. Điều này làm cho Gradle đặc biệt linh hoạt.

Nói đơn giản, Gradle là một công cụ xây dựng dự án tự động chạy trên JVM, dùng để giúp chúng ta tự động hóa quá trình build dự án.

Đối với các nhà phát triển, Gradle có 3 tác dụng chính:

1. **Xây dựng dự án**: Cung cấp phương thức xây dựng dự án tự động, chuẩn hóa và đa nền tảng.
2. **Quản lý phụ thuộc**: Quản lý các tài nguyên phụ thuộc của dự án (file jar) một cách tiện lợi và nhanh chóng, tránh xung đột phiên bản giữa các tài nguyên.
3. **Thống nhất cấu trúc phát triển**: Cung cấp cấu trúc dự án chuẩn và thống nhất.

Script build của Gradle được viết bằng ngôn ngữ Groovy hoặc Kotlin, có khả năng diễn đạt rất mạnh và đủ linh hoạt.

## Giới thiệu Groovy

Gradle là một chương trình chạy trên JVM, nó có thể sử dụng Groovy để viết script build.

Groovy là ngôn ngữ script chạy trên JVM, là ngôn ngữ động được mở rộng dựa trên Java, cú pháp của nó rất giống với Java và có thể sử dụng các thư viện của Java. Groovy có thể được dùng cho lập trình hướng đối tượng, cũng có thể dùng như một ngôn ngữ script thuần túy. Trong thiết kế ngôn ngữ, nó đã tiếp thu các tính năng ưu việt của Java, Python, Ruby và Smalltalk, chẳng hạn như chuyển đổi kiểu động, closure và hỗ trợ metaprogramming.

Chúng ta có thể học Groovy theo cách học Java, chi phí học tập tương đối thấp. Ngay cả khi quên cú pháp Groovy trong quá trình phát triển, cũng có thể tiếp tục code bằng cú pháp Java.

Có nhiều ngôn ngữ chạy trên JVM như Groovy, Kotlin, Java, Scala — tất cả đều được biên dịch thành file bytecode Java và chạy trên JVM.

## Ưu điểm của Gradle

Gradle là hệ thống build thế hệ mới, có nhiều ưu điểm như hiệu quả cao và linh hoạt, được sử dụng rộng rãi trong phát triển Java. Không chỉ Android lấy nó làm hệ thống build chính thức, ngày càng nhiều dự án Java như Spring Boot cũng dần dần chuyển sang Gradle.

- Về tính linh hoạt, Gradle hỗ trợ viết script dựa trên ngôn ngữ Groovy, chú trọng vào sự linh hoạt của quá trình build, phù hợp để xây dựng các dự án có độ phức tạp cao, có thể hoàn thành các quá trình build rất phức tạp.
- Về tính chi tiết, độ chi tiết của Gradle build được tinh chỉnh đến từng task. Và tất cả source code Task của nó đều là mã nguồn mở, sau khi nắm vững toàn bộ quy trình đóng gói này, chúng ta có thể thay đổi luồng thực thi động bằng cách sửa đổi Task của nó.
- Về khả năng mở rộng, Gradle hỗ trợ cơ chế plugin, vì vậy chúng ta có thể tái sử dụng các plugin này, đơn giản và tiện lợi như tái sử dụng thư viện.

## Giới thiệu Gradle Wrapper

Tài liệu chính thức của Gradle giới thiệu Gradle Wrapper như sau:

> The recommended way to execute any Gradle build is with the help of the Gradle Wrapper (in short just "Wrapper"). The Wrapper is a script that invokes a declared version of Gradle, downloading it beforehand if necessary. As a result, developers can get up and running with a Gradle project quickly without having to follow manual installation processes saving your company time and money.
>
> Cách được khuyến nghị để thực thi bất kỳ Gradle build nào là nhờ sự trợ giúp của Gradle Wrapper (gọi tắt là "Wrapper"). Wrapper là một script gọi phiên bản Gradle đã được khai báo, tải xuống trước nếu cần. Do đó, các nhà phát triển có thể khởi động và chạy dự án Gradle nhanh chóng mà không cần thực hiện quy trình cài đặt thủ công, tiết kiệm thời gian và tiền bạc cho công ty.

Chúng ta có thể gọi Gradle Wrapper là bộ bao bọc Gradle, nó bao bọc Gradle thêm một lần nữa, cho phép tất cả các phương thức build Gradle chạy với sự trợ giúp của Gradle Wrapper.

Sơ đồ luồng làm việc của Gradle Wrapper như sau (nguồn hình ảnh [tài liệu chính thức Gradle Wrapper](https://docs.gradle.org/current/userguide/gradle_wrapper.html)):

![Luồng làm việc của Wrapper](/images/github/javaguide/csdn/efa7a0006b04051e2b84cd116c6ccdfc.png)

Toàn bộ luồng chủ yếu được chia thành 3 bước:

1. Đầu tiên khi chúng ta vừa tạo, nếu phiên bản được chỉ định chưa được tải xuống, trước tiên sẽ đi đến máy chủ Gradle để tải xuống gói nén của phiên bản tương ứng;
2. Sau khi tải xuống xong, cần giải nén và thực thi file batch;
3. Mỗi lần build dự án về sau sẽ tái sử dụng phiên bản Gradle đã giải nén này.

Gradle Wrapper sẽ mang lại cho chúng ta những lợi ích sau:

1. Chuẩn hóa dự án trên một phiên bản Gradle nhất định, từ đó đạt được build đáng tin cậy và mạnh mẽ hơn.
2. Cho phép chạy dự án Gradle mà không cần cài đặt môi trường Gradle trên máy tính.
3. Cung cấp phiên bản Gradle mới cho các người dùng và môi trường thực thi khác nhau (ví dụ IDE hoặc máy chủ continuous integration) đơn giản như việc thay đổi định nghĩa Wrapper.

### Tạo Gradle Wrapper

Nếu muốn tạo Gradle Wrapper, cần cấu hình biến môi trường Gradle trên máy cục bộ. Gradle đã tích hợp sẵn Wrapper Task, thực thi lệnh `gradle wrapper` trong thư mục gốc của dự án sẽ giúp chúng ta tạo Gradle Wrapper.

Khi thực thi lệnh `gradle wrapper`, có thể chỉ định một số tham số để kiểm soát việc tạo wrapper. Cụ thể có hai tham số cấu hình sau:

- `--gradle-version` dùng để chỉ định phiên bản Gradle được sử dụng
- `--gradle-distribution-url` dùng để chỉ định URL tải xuống phiên bản Gradle, quy tắc của giá trị này là `http://services.gradle.org/distributions/gradle-${gradleVersion}-bin.zip`

Sau khi thực thi lệnh `gradle wrapper`, Gradle Wrapper sẽ được tạo xong, các file sau được tạo trong thư mục gốc của dự án:

```plain
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew
└── gradlew.bat
```

Ý nghĩa của từng file như sau:

- `gradle-wrapper.jar`: Chứa logic code runtime của Gradle.
- `gradle-wrapper.properties`: Định nghĩa số phiên bản Gradle và các thuộc tính hành vi runtime của Gradle.
- `gradlew`: Trên nền tảng Linux, script wrapper dùng để thực thi lệnh Gradle.
- `gradlew.bat`: Trên nền tảng Windows, script wrapper dùng để thực thi lệnh Gradle.

Nội dung file `gradle-wrapper.properties` như sau:

```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-6.0.1-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

- `distributionBase`: Thư mục cha lưu trữ Gradle sau khi giải nén.
- `distributionPath`: Thư mục con của thư mục được chỉ định bởi `distributionBase`. `distributionBase+distributionPath` chính là thư mục cụ thể để lưu trữ Gradle sau khi giải nén.
- `distributionUrl`: Địa chỉ tải xuống gói nén của phiên bản Gradle được chỉ định.
- `zipStoreBase`: Thư mục cha lưu trữ gói nén Gradle sau khi tải xuống.
- `zipStorePath`: Thư mục con của thư mục được chỉ định bởi `zipStoreBase`. `zipStoreBase+zipStorePath` chính là vị trí lưu trữ gói nén Gradle.

### Cập nhật Gradle Wrapper

Có 2 cách để cập nhật Gradle Wrapper:

1. Sửa trực tiếp trường `distributionUrl`, sau đó thực thi lệnh Gradle.
2. Thực thi lệnh gradlew `gradlew wrapper –-gradle-version [version]`.

Lệnh dưới đây sẽ nâng cấp phiên bản Gradle lên 7.6.

```shell
gradlew wrapper --gradle-version 7.6
```

Thuộc tính `distributionUrl` trong file `gradle-wrapper.properties` cũng sẽ thay đổi tương ứng.

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-7.6-all.zip
```

### Tùy chỉnh Gradle Wrapper

Gradle đã tích hợp sẵn Wrapper Task, vì vậy việc build Gradle Wrapper sẽ tạo ra file thuộc tính của Gradle Wrapper. File thuộc tính này có thể được thiết lập thông qua việc tùy chỉnh Wrapper Task. Ví dụ nếu muốn sửa đổi phiên bản Gradle cần tải xuống thành 7.6, có thể thiết lập như sau:

```javascript
task wrapper(type: Wrapper) {
    gradleVersion = '7.6'
}
```

Cũng có thể thiết lập địa chỉ tải xuống gói nén phân phối Gradle và đường dẫn lưu trữ cục bộ sau khi Gradle giải nén, v.v.

```groovy
task wrapper(type: Wrapper) {
    gradleVersion = '7.6'
    distributionUrl = '../../gradle-7.6-bin.zip'
    distributionPath=wrapper/dists
}
```

Thuộc tính `distributionUrl` có thể được đặt thành thư mục dự án cục bộ, hoặc cũng có thể đặt thành địa chỉ mạng.

## Task trong Gradle

Trong Gradle, Task là đơn vị làm việc đơn lẻ trong quá trình thực thi build.

Build của Gradle dựa trên Task, khi bạn chạy dự án, thực chất là đang thực thi một loạt các Task như Task biên dịch source code Java, Task tạo file jar.

Cách khai báo Task như sau (còn có một số cách khai báo khác):

```groovy
// Khai báo một Task có tên là helloTask
task helloTask{
     doLast{
       println "Hello"
     }
}
```

Sau khi tạo một Task, có thể thêm các Action khác nhau vào Task theo nhu cầu. "doLast" ở trên chính là thêm một Action vào cuối hàng đợi.

```groovy
 //Thêm Action vào đầu hàng đợi Action
 Task doFirst(Action<? super Task> action);
 Task doFirst(Closure action);

 //Thêm Action vào cuối hàng đợi Action
 Task doLast(Action<? super Task> action);
 Task doLast(Closure action);

 //Xóa tất cả Action
 Task deleteAllActions();
```

Một Task có thể có nhiều Action, thực thi Action từ đầu hàng đợi đến cuối hàng đợi.

Action đại diện cho các hàm, phương thức riêng lẻ. Mỗi Task là một đồ thị thực thi được tạo thành từ nhiều Action theo thứ tự.

Từ khóa để khai báo phụ thuộc của Task là `dependsOn`, hỗ trợ khai báo một hoặc nhiều phụ thuộc:

```groovy
task first {
 doLast {
        println "+++++first+++++"
    }
}
task second {
 doLast {
        println "+++++second+++++"
    }
}

// Chỉ định nhiều task phụ thuộc
task print(dependsOn :[second,first]) {
 doLast {
      logger.quiet "指定多个task依赖"
    }
}

// Chỉ định một task phụ thuộc
task third(dependsOn : print) {
 doLast {
      println '+++++third+++++'
    }
}
```

Trước khi thực thi một Task, sẽ thực thi các Task phụ thuộc của nó trước.

Chúng ta cũng có thể thiết lập Task mặc định, ngay cả khi trong script chúng ta không gọi Task mặc định, nó vẫn sẽ được thực thi.

```groovy
defaultTasks 'clean', 'run'

task clean {
    doLast {
        println 'Default Cleaning!'
    }
}

task run {
    doLast {
        println 'Default Running!'
    }
}
```

Bản thân Gradle cũng tích hợp sẵn nhiều Task như copy (sao chép file), delete (xóa file).

```groovy
task deleteFile(type: Delete) {
    delete "C:\\Users\\guide\\Desktop\\test"
}
```

## Plugin Gradle

Gradle cung cấp một cơ chế build cốt lõi, còn các plugin Gradle là một số logic build cụ thể chạy trên cơ chế này, về bản chất giống với file `.gradle`. Bạn có thể coi plugin Gradle như một công cụ đóng gói một loạt Task và thực thi chúng.

Plugin Gradle chủ yếu được phân thành hai loại:

- Plugin script: Plugin script là một file script thông thường, nó có thể được import vào các script build khác.
- Plugin binary / Plugin object: Được định nghĩa trong một module plugin riêng biệt, các module khác áp dụng plugin thông qua Plugin ID. Vì cách này thân thiện hơn với việc phát hành và tái sử dụng, plugin Gradle mà chúng ta thường gặp đều chỉ dạng plugin binary.

Mặc dù về bản chất plugin Gradle và file .gradle không có sự khác biệt, file `.gradle` cũng có thể thực hiện chức năng tương tự như plugin Gradle. Tuy nhiên, plugin Gradle sử dụng module độc lập để đóng gói logic build, xét từ góc độ phát triển đến sử dụng, trải nghiệm tổng thể của plugin Gradle đều thân thiện hơn.

- **Tái sử dụng logic:** Cung cấp cùng một logic cho nhiều dự án tương tự tái sử dụng, giảm chi phí bảo trì logic tương tự. Tất nhiên file .gradle cũng có thể tái sử dụng logic, nhưng tính đóng gói của plugin Gradle tốt hơn;
- **Phát hành component:** Có thể phát hành plugin lên Maven repository để quản lý, các dự án khác có thể phụ thuộc bằng plugin ID. Tất nhiên file .gradle cũng có thể được đặt ở đường dẫn từ xa để các dự án khác tham chiếu;
- **Cấu hình build:** Plugin Gradle có thể khai báo extension của plugin để hiển thị các thuộc tính có thể cấu hình, cung cấp khả năng tùy chỉnh. Tất nhiên file .gradle cũng có thể làm được, nhưng việc triển khai sẽ phức tạp hơn.

## Vòng đời build của Gradle

Vòng đời build của Gradle có ba giai đoạn: **giai đoạn khởi tạo, giai đoạn cấu hình** và **giai đoạn chạy**.

![](/images/github/javaguide/csdn/dadbdf59fccd9a2ebf60a2d018541e52.png)

Giữa giai đoạn khởi tạo và giai đoạn cấu hình, sau khi giai đoạn cấu hình kết thúc, và sau khi giai đoạn thực thi kết thúc, chúng ta đều có thể thêm một số Hook tùy chỉnh.

![](/images/github/javaguide/csdn/5c297ccc4dac83229ff3e19caee9d1d2.png)

### Giai đoạn khởi tạo

Gradle hỗ trợ build đơn dự án và đa dự án. Trong giai đoạn khởi tạo, Gradle xác định những dự án nào sẽ tham gia vào quá trình build và tạo một [Project instance](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html) cho mỗi dự án. Về bản chất đây cũng là việc thực thi script `settings.gradle`, từ đó đọc xem toàn bộ dự án có bao nhiêu Project instance.

### Giai đoạn cấu hình

Trong giai đoạn cấu hình, Gradle sẽ phân tích file `build.gradle` của mỗi project, tạo tập hợp con các task cần thực thi và xác định mối quan hệ giữa các task, để giai đoạn thực thi có thể thực thi theo thứ tự, đồng thời thực hiện một số cấu hình khởi tạo cho các task.

Mỗi `build.gradle` tương ứng với một đối tượng Project, code được thực thi trong giai đoạn cấu hình bao gồm các câu lệnh khác nhau, closure và câu lệnh cấu hình trong Task trong `build.gradle`.

Sau khi giai đoạn cấu hình kết thúc, Gradle sẽ tạo một **đồ thị có hướng không có chu trình (DAG)** dựa trên mối quan hệ phụ thuộc của Task.

### Giai đoạn chạy

Trong giai đoạn chạy, Gradle thực thi các task dựa trên tập hợp con các task cần thực thi đã được tạo và cấu hình trong giai đoạn cấu hình.

## Tham khảo

- Tài liệu chính thức Gradle: <https://docs.gradle.org/current/userguide/userguide.html>
- Hướng dẫn nhập môn Gradle: <https://www.imooc.com/wiki/gradlebase>
- Groovy 快速入门看这篇就够了: <https://cloud.tencent.com/developer/article/1358357>
- 【Gradle】Gradle 的生命周期详解: <https://juejin.cn/post/7067719629874921508>
- 手把手带你自定义 Gradle 插件 —— Gradle 系列(2): <https://www.cnblogs.com/pengxurui/p/16281537.html>
- Gradle 爬坑指南 -- 理解 Plugin、Task、构建流程: <https://juejin.cn/post/6889090530593112077>

<!-- @include: @article-footer.snippet.md -->
