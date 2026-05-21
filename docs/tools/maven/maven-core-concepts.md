---
title: Tổng kết các khái niệm cốt lõi của Maven
description: Bản chất của Apache Maven là một công cụ quản lý và hiểu biết dự án phần mềm. Dựa trên khái niệm mô hình đối tượng dự án (Project Object Model, POM), Maven có thể quản lý việc xây dựng, báo cáo và tài liệu của dự án từ một nguồn thông tin trung tâm.
category: Công cụ phát triển
head:
  - - meta
    - name: keywords
      content: Maven坐标,Maven仓库,Maven生命周期,Maven多模块管理
---

> Phần nội dung này chủ yếu được tổng hợp từ tài liệu chính thức của Maven, đã được lược bỏ bớt, chủ yếu giữ lại những phần quan trọng, không đề cập đến thực hành, tập trung vào giới thiệu một số khái niệm quan trọng.

## Giới thiệu Maven

Tài liệu chính thức của [Maven](https://github.com/apache/maven) giới thiệu Maven như sau:

> Apache Maven is a software project management and comprehension tool. Based on the concept of a project object model (POM), Maven can manage a project's build, reporting and documentation from a central piece of information.
>
> Bản chất của Apache Maven là một công cụ quản lý và hiểu biết dự án phần mềm. Dựa trên khái niệm mô hình đối tượng dự án (Project Object Model, POM), Maven có thể quản lý việc xây dựng, báo cáo và tài liệu của dự án từ một nguồn thông tin trung tâm.

**POM là gì?** Mỗi dự án Maven đều có một file `pom.xml`, nằm ở thư mục gốc, chứa thông tin chi tiết về vòng đời xây dựng dự án. Thông qua file `pom.xml`, chúng ta có thể định nghĩa tọa độ dự án, dependencies của dự án, thông tin dự án, thông tin plugin và nhiều cấu hình khác.

Đối với nhà phát triển, Maven có 3 tác dụng chính:

1. **Xây dựng dự án**: Cung cấp phương thức xây dựng dự án tự động, chuẩn hóa và đa nền tảng.
2. **Quản lý dependencies**: Quản lý các tài nguyên phụ thuộc (file jar) của dự án một cách thuận tiện và nhanh chóng, tránh vấn đề xung đột phiên bản giữa các tài nguyên.
3. **Chuẩn hóa cấu trúc phát triển**: Cung cấp cấu trúc dự án chuẩn, thống nhất.

Ở đây sẽ không giới thiệu cách sử dụng cơ bản của Maven, khuyến nghị xem hướng dẫn bắt đầu nhanh với Maven trong 5 phút trên trang chính thức: [Maven in 5 Minutes](https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html).

## Tọa độ Maven

Các thư viện bên thứ ba và plugin mà dự án phụ thuộc vào đều có thể gọi là artifact. Mỗi artifact có thể được xác định duy nhất bằng tọa độ Maven, các phần tử tọa độ bao gồm:

- **groupId** (bắt buộc): Định nghĩa tổ chức hoặc công ty mà dự án Maven hiện tại thuộc về. groupId thường được chia thành nhiều phần, thông thường phần đầu là domain, phần thứ hai là tên công ty. Domain lại được chia thành org, com, cn, v.v., trong đó org là tổ chức phi lợi nhuận, com là tổ chức thương mại, cn đại diện cho Trung Quốc. Lấy dự án tomcat của cộng đồng mã nguồn mở apache làm ví dụ, groupId của dự án này là org.apache, domain là org (vì tomcat là dự án phi lợi nhuận), tên công ty là apache, artifactId là tomcat.
- **artifactId** (bắt buộc): Định nghĩa tên của dự án Maven hiện tại, là định danh duy nhất của dự án, tương ứng với tên thư mục gốc của dự án.
- **version** (bắt buộc): Định nghĩa phiên bản hiện tại của dự án Maven.
- **packaging** (tùy chọn): Định nghĩa phương thức đóng gói của dự án Maven (ví dụ jar, war...), mặc định dùng jar.
- **classifier** (tùy chọn): Thường dùng để phân biệt các artifact được xây dựng từ cùng một POM nhưng có nội dung khác nhau, có thể là bất kỳ chuỗi nào, được thêm vào sau số phiên bản.

Chỉ cần cung cấp đúng tọa độ, bạn có thể tìm thấy artifact tương ứng trong kho Maven để sử dụng.

Ví dụ (tích hợp EasyExcel của Alibaba):

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>easyexcel</artifactId>
    <version>3.1.1</version>
</dependency>
```

Bạn có thể tìm hầu hết các artifact có sẵn tại <https://mvnrepository.com/>, nếu dự án của bạn sử dụng Maven làm công cụ xây dựng thì bạn chắc chắn sẽ thường xuyên sử dụng trang này.

![Kho Maven](https://oss.javaguide.cn/github/javaguide/tools/maven/mvnrepository.com.png)

## Maven Dependencies

Nếu artifact được tạo ra bởi Maven (ví dụ file Jar) được dự án khác tham chiếu, thì artifact đó là dependency của dự án kia.

### Cấu hình dependency

**Ví dụ cấu hình**:

```xml
<project>
    <dependencies>
        <dependency>
            <groupId></groupId>
            <artifactId></artifactId>
            <version></version>
            <type>...</type>
            <scope>...</scope>
            <optional>...</optional>
            <exclusions>
                <exclusion>
                  <groupId>...</groupId>
                  <artifactId>...</artifactId>
                </exclusion>
          </exclusions>
        </dependency>
      </dependencies>
</project>
```

**Giải thích cấu hình**:

- dependencies: Trong một file pom.xml chỉ có thể tồn tại một thẻ này, là thẻ tổng quản lý các dependency.
- dependency: Nằm trong thẻ dependencies, có thể có nhiều, mỗi cái đại diện cho một dependency của dự án.
- groupId, artifactId, version (bắt buộc): Tọa độ cơ bản của dependency, đối với bất kỳ dependency nào, tọa độ cơ bản là quan trọng nhất, Maven dựa vào tọa độ để tìm dependency cần thiết. Chúng ta đã giải thích ý nghĩa cụ thể của các phần tử này ở trên, nên không nhắc lại ở đây.
- type (tùy chọn): Loại dependency, tương ứng với packaging được định nghĩa trong tọa độ dự án. Trong hầu hết các trường hợp, phần tử này không cần khai báo, giá trị mặc định là jar.
- scope (tùy chọn): Phạm vi dependency, giá trị mặc định là compile.
- optional (tùy chọn): Đánh dấu dependency có phải tùy chọn hay không.
- exclusions (tùy chọn): Dùng để loại trừ transitive dependency, ví dụ xung đột jar.

### Phạm vi dependency

**classpath** được dùng để chỉ định vị trí lưu trữ file `.class`, class loader sẽ tải các file `.class` cần thiết từ đường dẫn này vào bộ nhớ.

Maven có ba classpath khác nhau trong quá trình biên dịch, thực thi test và chạy thực tế:

- **classpath biên dịch**: Có hiệu lực khi biên dịch mã chính
- **classpath test**: Có hiệu lực khi biên dịch và chạy mã test
- **classpath chạy**: Có hiệu lực khi dự án chạy

Các phạm vi dependency của Maven như sau:

- **compile**: Phạm vi dependency biên dịch (mặc định), sử dụng phạm vi dependency này có hiệu lực cho cả ba trường hợp biên dịch, test, và chạy, tức là cần sử dụng file Jar dependency đó khi biên dịch, test và chạy.
- **test**: Phạm vi dependency test, từ nghĩa đen có thể biết phạm vi dependency này chỉ dùng được cho test, còn không thể dùng khi biên dịch và chạy dự án, điển hình là JUnit, chỉ cần khi biên dịch mã test và chạy mã test.
- **provided**: Phạm vi dependency này có hiệu lực cho biên dịch và test, nhưng không hiệu lực khi chạy. Ví dụ `servlet-api.jar` đã được cung cấp trong Tomcat, chúng ta chỉ cần nó trong giai đoạn biên dịch.
- **runtime**: Phạm vi dependency runtime, có hiệu lực cho test và chạy, nhưng không hiệu lực khi biên dịch mã chính, điển hình là triển khai driver JDBC.
- **system**: Phạm vi dependency hệ thống, khi sử dụng phạm vi system phải chỉ định rõ đường dẫn file dependency thông qua phần tử systemPath, không phụ thuộc vào giải quyết kho Maven, do đó có thể gây ra vấn đề không thể di chuyển khi xây dựng.

### Transitive dependency

### Xung đột dependency

**1. Đối với Maven, cùng một groupId cùng một artifactId, chỉ có thể sử dụng một version.**

```xml
<dependency>
    <groupId>in.hocg.boot</groupId>
    <artifactId>mybatis-plus-spring-boot-starter</artifactId>
    <version>1.0.48</version>
</dependency>
<!-- 只会使用 1.0.49 这个版本的依赖 -->
<dependency>
    <groupId>in.hocg.boot</groupId>
    <artifactId>mybatis-plus-spring-boot-starter</artifactId>
    <version>1.0.49</version>
</dependency>
```

Nếu các dependency cùng loại nhưng khác phiên bản tồn tại trong cùng một file pom, chỉ có dependency được khai báo sau được tích hợp.

**2. Hai dependency của dự án cùng tích hợp một dependency nào đó.**

Ví dụ, dự án có quan hệ dependency như sau:

```plain
依赖链路一：A -> B -> C -> X(1.0)
依赖链路二：A -> D -> X(2.0)
```

Hai đường dẫn dependency này có hai phiên bản X, để tránh dependency trùng lặp, Maven chỉ chọn một trong số đó để giải quyết.

**Phiên bản X nào sẽ được Maven giải quyết sử dụng?**

Khi gặp vấn đề này, Maven sẽ tuân theo hai nguyên tắc lớn là **ưu tiên đường dẫn ngắn nhất** và **ưu tiên thứ tự khai báo**. Quá trình giải quyết vấn đề này cũng được gọi là **Maven dependency mediation**.

**Ưu tiên đường dẫn ngắn nhất**

```plain
依赖链路一：A -> B -> C -> X(1.0) // dist = 3
依赖链路二：A -> D -> X(2.0) // dist = 2
```

Đường dẫn dependency thứ hai có đường dẫn ngắn nhất, do đó X(2.0) sẽ được giải quyết sử dụng.

Tuy nhiên, bạn cũng có thể nhận thấy nguyên tắc ưu tiên đường dẫn ngắn nhất không phải là tổng quát, như trường hợp độ dài đường dẫn bằng nhau dưới đây không thể giải quyết chỉ bằng nó:

```plain
依赖链路一：A -> B -> X(1.0) // dist = 2
依赖链路二：A -> D -> X(2.0) // dist = 2
```

Do đó, Maven đã định nghĩa thêm nguyên tắc ưu tiên thứ tự khai báo.

Nguyên tắc thứ nhất của dependency mediation không thể giải quyết tất cả vấn đề, ví dụ quan hệ dependency như sau: A->B->Y(1.0), A->C->Y(2.0), đường dẫn dependency của Y(1.0) và Y(2.0) có độ dài bằng nhau, đều là 2. Maven định nghĩa nguyên tắc thứ hai của dependency mediation:

**Ưu tiên thứ tự khai báo**

Với điều kiện độ dài đường dẫn dependency bằng nhau, thứ tự khai báo dependency trong `pom.xml` quyết định cái nào được giải quyết sử dụng, dependency được khai báo trước sẽ thắng. Trong ví dụ này, nếu khai báo dependency của B trước D, thì X(1.0) sẽ được giải quyết sử dụng.

```xml
<!-- A pom.xml -->
<dependencies>
    ...
    dependency B
    ...
    dependency D
</dependencies>
```

### Loại trừ dependency

Chỉ dựa vào Maven để thực hiện dependency mediation, trong nhiều trường hợp là không phù hợp, cần chúng ta thủ công loại trừ dependency.

Ví dụ, dự án hiện tại có quan hệ dependency như sau:

```plain
依赖链路一：A -> B -> C -> X(1.5) // dist = 3
依赖链路二：A -> D -> X(1.0) // dist = 2
```

Theo nguyên tắc ưu tiên đường dẫn ngắn nhất, X(1.0) sẽ được giải quyết sử dụng, tức là thực tế đang dùng X phiên bản 1.0.

Nhưng!!! Điều này sẽ gây ra một số vấn đề: Nếu dependency C sử dụng một lớp chỉ có trong X phiên bản 1.5, khi chạy dự án sẽ báo lỗi `NoClassDefFoundError`. Nếu dependency C sử dụng một phương thức chỉ có trong X phiên bản 1.5, khi chạy dự án sẽ báo lỗi `NoSuchMethodError`.

Bây giờ bạn đã biết tại sao dự án Maven của bạn thường xuyên báo lỗi `NoClassDefFoundError` và `NoSuchMethodError` rồi phải không?

**Giải quyết như thế nào?** Chúng ta có thể thủ công loại trừ X(1.0) thông qua thẻ `exclusion`.

```xml
<dependency>
    ......
    <exclusions>
      <exclusion>
        <artifactId>x</artifactId>
        <groupId>org.apache.x</groupId>
      </exclusion>
    </exclusions>
</dependency>
```

Thông thường khi giải quyết xung đột dependency, chúng ta sẽ ưu tiên giữ lại phiên bản cao hơn. Điều này là vì hầu hết các jar khi nâng cấp đều có backward compatibility.

Nếu phiên bản cao hơn đã sửa đổi một số lớp hoặc phương thức của phiên bản thấp hơn, thì lúc này không thể trực tiếp giữ lại phiên bản cao hơn, mà nên xem xét tối ưu hóa dependency tầng trên, ví dụ nâng cấp phiên bản của dependency tầng trên.

Vẫn là ví dụ trên:

```plain
依赖链路一：A -> B -> C -> X(1.5) // dist = 3
依赖链路二：A -> D -> X(1.0) // dist = 2
```

Chúng ta giữ lại X phiên bản 1.5, nhưng phiên bản X này đã xóa một số lớp trong phiên bản 1.0. Lúc này, chúng ta có thể xem xét nâng cấp phiên bản của D lên một phiên bản tương thích với X.

## Kho Maven

Trong thế giới Maven, bất kỳ dependency, plugin hay đầu ra xây dựng dự án nào đều có thể gọi là **artifact**.

Tọa độ và dependency là cách biểu diễn logic của artifact trong thế giới Maven, cách biểu diễn vật lý của artifact là file, Maven quản lý thống nhất các file này thông qua kho. Bất kỳ artifact nào cũng có một nhóm tọa độ xác định duy nhất. Với kho, không cần thủ công tích hợp artifact, chúng ta chỉ cần cung cấp tọa độ của artifact là có thể tìm thấy nó trong kho Maven.

Kho Maven được chia thành:

- **Kho cục bộ**: Một thư mục trên máy tính chạy Maven, nó cache các artifact được tải từ xa và chứa các artifact tạm thời chưa được phát hành. Đường dẫn cấu hình kho cục bộ của Maven có thể xem trong file `settings.xml`, đường dẫn kho cục bộ mặc định là `${user.home}/.m2/repository`.
- **Kho từ xa**: Kho Maven do chính thức hoặc các tổ chức khác duy trì.

Kho từ xa Maven có thể được chia thành:

- **Kho trung tâm**: Kho này được cộng đồng Maven duy trì, chứa hầu hết các gói phần mềm mã nguồn mở, và được cấu hình mặc định của Maven, không cần nhà phát triển cấu hình thêm. Ngoài ra để tiện tra cứu, còn cung cấp một [địa chỉ tra cứu](https://search.maven.org/), nhà phát triển có thể tìm kiếm tọa độ artifact nhanh hơn qua địa chỉ này.
- **Kho riêng (Private repository)**: Kho riêng là một loại kho Maven từ xa đặc biệt, là dịch vụ kho được thiết lập trong mạng nội bộ, kho riêng thường được cấu hình là mirror của kho từ xa Internet, phục vụ cho người dùng Maven trong mạng nội bộ.
- **Các kho công cộng khác**: Có một số kho công cộng nhằm tăng tốc độ truy cập (ví dụ kho mirror Maven của Alibaba Cloud) hoặc một số artifact không tồn tại trong kho trung tâm.

Thứ tự tìm kiếm gói dependency Maven:

1. Tìm trong kho cục bộ trước, nếu có thì sử dụng trực tiếp.
2. Nếu không tìm thấy trong kho cục bộ, sẽ tìm trong kho từ xa, tải gói về kho cục bộ.
3. Nếu không tìm thấy trong kho từ xa, sẽ báo lỗi.

## Vòng đời Maven

Vòng đời Maven là để trừu tượng hóa và thống nhất tất cả các quá trình xây dựng, bao gồm gần như tất cả các bước xây dựng như clean, khởi tạo, biên dịch, test, đóng gói, integration test, xác nhận, triển khai và tạo site của dự án.

Maven định nghĩa 3 vòng đời trong `META-INF/plexus/components.xml`:

- Vòng đời `default`
- Vòng đời `clean`
- Vòng đời `site`

Các vòng đời này độc lập với nhau, mỗi vòng đời chứa nhiều phase. Và các phase này có thứ tự, tức là phase sau phụ thuộc vào phase trước. Khi thực thi một phase, sẽ thực thi các phase trước nó trước.

Định dạng lệnh thực thi vòng đời Maven như sau:

```bash
mvn 阶段 [阶段2] ...[阶段n]
```

### Vòng đời default

Vòng đời `default` được định nghĩa mà không có plugin liên kết nào, là vòng đời chính của Maven, dùng để xây dựng ứng dụng, gồm 23 phase.

```xml
<phases>
  <!-- 验证项目是否正确，并且所有必要的信息可用于完成构建过程 -->
  <phase>validate</phase>
  <!-- 建立初始化状态，例如设置属性 -->
  <phase>initialize</phase>
  <!-- 生成要包含在编译阶段的源代码 -->
  <phase>generate-sources</phase>
  <!-- 处理源代码 -->
  <phase>process-sources</phase>
  <!-- 生成要包含在包中的资源 -->
  <phase>generate-resources</phase>
  <!-- 将资源复制并处理到目标目录中，为打包阶段做好准备。 -->
  <phase>process-resources</phase>
  <!-- 编译项目的源代码  -->
  <phase>compile</phase>
  <!-- 对编译生成的文件进行后处理，例如对 Java 类进行字节码增强/优化 -->
  <phase>process-classes</phase>
  <!-- 生成要包含在编译阶段的任何测试源代码 -->
  <phase>generate-test-sources</phase>
  <!-- 处理测试源代码 -->
  <phase>process-test-sources</phase>
  <!-- 生成要包含在编译阶段的测试源代码 -->
  <phase>generate-test-resources</phase>
  <!-- 处理从测试代码文件编译生成的文件 -->
  <phase>process-test-resources</phase>
  <!-- 编译测试源代码 -->
  <phase>test-compile</phase>
  <!-- 处理从测试代码文件编译生成的文件 -->
  <phase>process-test-classes</phase>
  <!-- 使用合适的单元测试框架（Junit 就是其中之一）运行测试 -->
  <phase>test</phase>
  <!-- 在实际打包之前，执行任何的必要的操作为打包做准备 -->
  <phase>prepare-package</phase>
  <!-- 获取已编译的代码并将其打包成可分发的格式，例如 JAR、WAR 或 EAR 文件 -->
  <phase>package</phase>
  <!-- 在执行集成测试之前执行所需的操作。 例如，设置所需的环境 -->
  <phase>pre-integration-test</phase>
  <!-- 处理并在必要时部署软件包到集成测试可以运行的环境 -->
  <phase>integration-test</phase>
  <!-- 执行集成测试后执行所需的操作。 例如，清理环境  -->
  <phase>post-integration-test</phase>
  <!-- 运行任何检查以验证打的包是否有效并符合质量标准。 -->
  <phase>verify</phase>
  <!-- 	将包安装到本地仓库中，可以作为本地其他项目的依赖 -->
  <phase>install</phase>
  <!-- 将最终的项目包复制到远程仓库中与其他开发者和项目共享 -->
  <phase>deploy</phase>
</phases>
```

Dựa vào lý thuyết quan hệ phụ thuộc giữa các phase đã đề cập trước đó, khi chúng ta thực thi lệnh `mvn test`, sẽ thực thi tất cả các phase từ validate đến test, điều này cũng giải thích tại sao khi thực thi test, mã nguồn dự án có thể tự động được biên dịch.

### Vòng đời clean

Mục đích của vòng đời clean là dọn dẹp dự án, gồm 3 phase:

1. pre-clean
2. clean
3. post-clean

```xml
<phases>
  <!--  执行一些需要在clean之前完成的工作 -->
  <phase>pre-clean</phase>
  <!--  移除所有上一次构建生成的文件 -->
  <phase>clean</phase>
  <!--  执行一些需要在clean之后立刻完成的工作 -->
  <phase>post-clean</phase>
</phases>
<default-phases>
  <clean>
    org.apache.maven.plugins:maven-clean-plugin:2.5:clean
  </clean>
</default-phases>
```

Dựa vào lý thuyết quan hệ phụ thuộc giữa các phase đã đề cập trước đó, khi chúng ta thực thi `mvn clean`, sẽ thực thi các phase pre-clean và clean trong vòng đời clean.

### Vòng đời site

Mục đích của vòng đời site là xây dựng và phát hành site dự án, gồm 4 phase:

1. pre-site
2. site
3. post-site
4. site-deploy

```xml
<phases>
  <!--  执行一些需要在生成站点文档之前完成的工作 -->
  <phase>pre-site</phase>
  <!--  生成项目的站点文档作 -->
  <phase>site</phase>
  <!--  执行一些需要在生成站点文档之后完成的工作，并且为部署做准备 -->
  <phase>post-site</phase>
  <!--  将生成的站点文档部署到特定的服务器上 -->
  <phase>site-deploy</phase>
</phases>
<default-phases>
  <site>
    org.apache.maven.plugins:maven-site-plugin:3.3:site
  </site>
  <site-deploy>
    org.apache.maven.plugins:maven-site-plugin:3.3:deploy
  </site-deploy>
</default-phases>
```

Maven có thể tự động tạo một site thân thiện dựa trên thông tin trong `pom.xml`, thuận tiện cho việc trao đổi nhóm và phát hành thông tin dự án.

## Plugin Maven

Maven về bản chất là một framework thực thi plugin, tất cả các quá trình thực thi đều được hoàn thành độc lập bởi từng plugin. Các lệnh như install, clean, deploy mà chúng ta sử dụng hàng ngày, thực chất ở tầng dưới đều là các Maven plugin. Về các plugin cốt lõi của Maven, có thể tham khảo tài liệu chính thức: <https://maven.apache.org/plugins/index.html>.

Đường dẫn plugin cục bộ mặc định: `${user.home}/.m2/repository/org/apache/maven/plugins`

![](https://oss.javaguide.cn/github/javaguide/tools/maven/maven-plugins.png)

Ngoài các plugin đi kèm của Maven, còn có một số plugin được cung cấp bởi bên thứ ba như plugin độ phủ test đơn vị jacoco-maven-plugin, plugin giúp nhà phát triển phát hiện các vị trí không tuân thủ chuẩn trong mã maven-checkstyle-plugin, phân tích chất lượng mã sonar-maven-plugin. Và chúng ta cũng có thể tự định nghĩa plugin để đáp ứng nhu cầu riêng.

Ví dụ sử dụng jacoco-maven-plugin:

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.8</version>
      <executions>
        <execution>
          <goals>
            <goal>prepare-agent</goal>
          </goals>
        </execution>
        <execution>
          <id>generate-code-coverage-report</id>
          <phase>test</phase>
          <goals>
            <goal>report</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

Bạn có thể hiểu Maven plugin như một tập hợp các task, người dùng có thể chạy trực tiếp task của plugin cụ thể qua dòng lệnh, hoặc gắn kết task plugin vào vòng đời xây dựng để chạy cùng với vòng đời.

Maven plugin được chia thành hai loại:

- **Build plugins**: Thực thi trong quá trình xây dựng.
- **Reporting plugins**: Thực thi trong quá trình tạo site.

## Quản lý đa module Maven

Quản lý đa module đơn giản là chia một dự án thành nhiều module, mỗi module chỉ chịu trách nhiệm một chức năng duy nhất. Biểu hiện trực quan là trong một dự án Maven không chỉ có một file `pom.xml`, sẽ có nhiều file `pom.xml` trong các thư mục khác nhau, từ đó thực hiện quản lý đa module.

Ngoài việc thuận tiện hơn cho việc phát triển và quản lý dự án, quản lý đa module còn có những lợi ích sau:

1. Giảm coupling giữa các mã (nâng từ coupling cấp class lên coupling cấp jar);
2. Giảm trùng lặp, nâng cao khả năng tái sử dụng;
3. Mỗi module có thể tự giải thích (thông qua tên module hoặc tài liệu module);
4. Module cũng chuẩn hóa ranh giới phân chia code, nhà phát triển dễ dàng xác định nội dung mình phụ trách thông qua module.

Trong quản lý đa module, sẽ có một module cha, các module còn lại đều là module con. Module cha thường chỉ có một `pom.xml`, không có nội dung khác. `pom.xml` của module cha thường chỉ định nghĩa số phiên bản của các dependency, các module con bao gồm những module nào và có những plugin nào. Tuy nhiên, cần lưu ý rằng nếu dependency chỉ được sử dụng trong một module con, thì có thể trực tiếp tích hợp trong pom.xml của module con đó, tránh để pom cha trở nên cồng kềnh.

Như hình dưới, dự án Dubbo được chia thành nhiều module con như dubbo-common (module logic chung), dubbo-remoting (module giao tiếp từ xa), dubbo-rpc (module gọi từ xa).

![](https://oss.javaguide.cn/github/javaguide/tools/maven/dubbo-maven-multi-module.png)

## Bài viết đề xuất

- [Chuyên gia bảo mật giải thích cơ chế phân xử dependency gián tiếp trong Maven - Alibaba Developer - 2022](https://mp.weixin.qq.com/s/flniMiP-eu3JSBnswfd_Ew)
- [Sử dụng hiệu quả công cụ build Java | Phần Maven - Alibaba Developer - 2022](https://mp.weixin.qq.com/s/Wvq7t2FC58jaCh4UFJ6GGQ)
- [Chuyên gia bảo mật kể chuyện repackage với Maven - Alibaba Developer - 2022](https://mp.weixin.qq.com/s/xsJkB0onUkakrVH0wejcIg)

## Tham khảo

- "Maven Thực Chiến"
- Introduction to Repositories - Tài liệu chính thức Maven：<https://maven.apache.org/guides/introduction/introduction-to-repositories.html>
- Introduction to the Build Lifecycle - Tài liệu chính thức Maven：<https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html#Lifecycle_Reference>
- Phạm vi dependency Maven：<http://www.mvnbook.com/maven-dependency.html>
- Giải quyết xung đột dependency Maven, bài này là đủ!：<https://www.cnblogs.com/qdhxhz/p/16363532.html>
- Multi-Module Project with Maven：<https://www.baeldung.com/maven-multi-module>

<!-- @include: @article-footer.snippet.md -->
