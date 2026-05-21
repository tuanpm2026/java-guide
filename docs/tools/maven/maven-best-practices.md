---
title: Maven Best Practices
description: Maven là công cụ tự động hóa build Java project được sử dụng rộng rãi. Nó đơn giản hóa quá trình build và giúp quản lý dependencies, giúp developers làm việc dễ dàng hơn. Trong bài này chúng ta sẽ thảo luận về một số best practices, tips và tricks để tối ưu hóa việc sử dụng Maven trong projects.
category: Dev Tools
head:
  - - meta
    - name: keywords
      content: Maven coordinates,Maven repository,Maven lifecycle,Maven multi-module management
---

> Bài này được JavaGuide dịch và hoàn thiện. Original article: <https://medium.com/@AlexanderObregon/maven-best-practices-tips-and-tricks-for-java-developers-438eca03f72b>.

Maven là công cụ tự động hóa build Java project được sử dụng rộng rãi. Nó đơn giản hóa quá trình build và giúp quản lý dependencies. Giới thiệu chi tiết về Maven có thể tham khảo bài tôi viết: [Maven Core Concepts Summary](./maven-core-concepts.md).

Bài này sẽ không đề cập đến giới thiệu Maven concepts, chủ yếu thảo luận về các best practices, gợi ý và tricks để tối ưu hóa việc sử dụng Maven trong projects.

## Maven Standard Directory Structure

Maven tuân theo standard directory structure để duy trì consistency giữa các projects. Tuân thủ cấu trúc này giúp các developers khác dễ hiểu project hơn.

Standard directory structure của Maven project:

```groovy
src/
  main/
    java/
    resources/
  test/
    java/
    resources/
pom.xml
```

- `src/main/java`: Source code directory
- `src/main/resources`: Resource files directory
- `src/test/java`: Test code directory
- `src/test/resources`: Test resource files directory

Đây chỉ là ví dụ Maven project directory đơn giản nhất. Trong project thực tế, chúng ta còn tiếp tục phân chia chi tiết hơn theo chuẩn project.

## Chỉ Định Maven Compiler Plugin

Mặc định Maven compile project bằng Java 5. Để dùng JDK version khác, configure Maven compiler plugin trong file `pom.xml`.

Ví dụ muốn compile project bằng Java 8, thêm code snippet dưới đây trong `<build>` tag:

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <version>3.8.1</version>
      <configuration>
        <source>1.8</source>
        <target>1.8</target>
      </configuration>
    </plugin>
  </plugins>
</build>
```

Như vậy Maven sẽ dùng Java 8 compiler để compile project. Nếu muốn dùng JDK version khác, chỉ cần sửa giá trị của `<source>` và `<target>` tags.

## Quản Lý Dependencies Hiệu Quả

Dependency management system của Maven là một trong những tính năng mạnh mẽ nhất. Trong top-level pom file, define common dependencies thông qua `dependencyManagement` tag. Điều này giúp tránh conflicts và đảm bảo tất cả modules dùng cùng versions của dependencies.

Ví dụ, giả sử có parent module và hai child modules A và B, muốn dùng JUnit 5.7.2 làm test framework trong tất cả modules. Có thể dùng `<dependencyManagement>` tag trong parent module `pom.xml` để define JUnit version:

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.7.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

Trong `pom.xml` của child modules A và B, chỉ cần reference `groupId` và `artifactId` của JUnit:

```xml
<dependencies>
  <dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
  </dependency>
</dependencies>
```

## Dùng Profiles Cho Các Environments Khác Nhau

Maven profiles cho phép configure build settings cho các environments khác nhau như development, testing và production. Define profiles trong `pom.xml` và activate bằng command-line parameters:

```xml
<profiles>
  <profile>
    <id>development</id>
    <activation>
      <activeByDefault>true</activeByDefault>
    </activation>
    <properties>
      <environment>dev</environment>
    </properties>
  </profile>
  <profile>
    <id>production</id>
    <properties>
      <environment>prod</environment>
    </properties>
  </profile>
</profiles>
```

Activate profile bằng command line:

```bash
mvn clean install -P production
```

## Giữ pom.xml Gọn Gàng và Có Tổ Chức

File `pom.xml` được tổ chức tốt dễ maintain và hiểu hơn. Một số tips để maintain clean `pom.xml`:

- Group các dependencies và plugins tương tự lại với nhau.
- Dùng comments để mô tả mục đích của specific dependencies hoặc plugins.
- Giữ version numbers của plugins và dependencies trong `<properties>` tag để dễ quản lý.

```xml
<properties>
  <junit.version>5.7.0</junit.version>
  <mockito.version>3.9.0</mockito.version>
</properties>
```

## Dùng Maven Wrapper

Maven Wrapper là công cụ để quản lý và sử dụng Maven, cho phép run và build Maven projects mà không cần cài Maven trước.

Maven official documentation giới thiệu:

> The Maven Wrapper is an easy way to ensure a user of your Maven build has everything necessary to run your Maven build.

Maven Wrapper đảm bảo build process sử dụng đúng Maven version — rất tiện lợi. Để dùng Maven Wrapper, run lệnh sau trong project directory:

```bash
mvn wrapper:wrapper
```

Lệnh này sẽ generate Maven Wrapper files trong project. Giờ có thể dùng `./mvnw` (hoặc `./mvnw.cmd` trên Windows) thay vì `mvn` để execute Maven commands.

## Tự Động Hóa Build Thông Qua Continuous Integration

Integrate Maven project với CI systems (như Jenkins hoặc GitHub Actions) đảm bảo code được build, test và deploy tự động. CI giúp phát hiện sớm vấn đề và cung cấp consistent build process trong toàn bộ team. Đây là ví dụ GitHub Actions workflow đơn giản cho Maven project:

```groovy
name: Java CI with Maven

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Set up JDK 11
      uses: actions/setup-java@v2
      with:
        java-version: '11'
        distribution: 'adopt'

    - name: Build with Maven
      run: ./mvnw clean install
```

## Tận Dụng Maven Plugins Cho Tính Năng Thêm

Có nhiều Maven plugins để mở rộng chức năng của Maven. Một số plugins phổ biến (3 cái đầu là plugins đi kèm Maven, 3 cái sau là third-party):

- **maven-surefire-plugin**: Configure và execute unit tests.
- **maven-failsafe-plugin**: Configure và execute integration tests.
- **maven-javadoc-plugin**: Generate project documentation in Javadoc format.
- **maven-checkstyle-plugin**: Enforce coding standards và best practices.
- **jacoco-maven-plugin**: Unit test coverage.
- **sonar-maven-plugin**: Analyze code quality.
- ……

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

Nếu các existing plugins không đáp ứng nhu cầu, chúng ta còn có thể customize plugins.

Explore các plugins có sẵn và configure chúng trong `pom.xml` file để enhance development process.

## Tổng Kết

Maven là công cụ mạnh mẽ có thể đơn giản hóa quá trình build và dependency management của Java projects. Bằng cách tuân theo các best practices và tricks này, chúng ta có thể tối ưu hóa việc sử dụng Maven và cải thiện Java development experience. Nhớ sử dụng standard directory structure, manage dependencies hiệu quả, tận dụng profiles cho các environments khác nhau và integrate project với CI systems để đảm bảo consistent builds.
