---
title: Java open source development tools chất lượng
description: Gợi ý các Java open source development tools chất lượng, tuyển chọn các công cụ phát triển cần thiết bao gồm code quality check, project build, testing frameworks, containerized deployment.
category: Open Source Projects
icon: tool
---

## Code Quality

- [SonarQube](https://github.com/SonarSource/sonarqube "sonarqube"): Static code analysis tool, giúp phát hiện code defects, nhanh chóng locate các lỗi tiềm ẩn hoặc rõ ràng trong code, cải thiện code quality, tăng tốc phát triển.
- [Spotless](https://github.com/diffplug/spotless): Code formatting tool hỗ trợ nhiều ngôn ngữ, hỗ trợ Maven và Gradle dưới dạng Plugin.
- [CheckStyle](https://github.com/checkstyle/checkstyle "checkstyle"): Tương tự Spotless, giúp programmer viết Java code theo coding standards.
- [PMD](https://github.com/pmd/pmd "pmd"): Extensible multi-language static code analyzer.
- [SpotBugs](https://github.com/spotbugs/spotbugs "spotbugs"): Kế thừa của FindBugs. Static analysis tool để tìm lỗi trong Java code.
- [P3C](https://github.com/alibaba/p3c "p3c"): Alibaba Java Coding Guidelines PMD implements và IDE plugin. Có plugin cho cả Eclipse và IDEA.

## Project Build

- [Maven](https://maven.apache.org/): Software project management và comprehension tool. Dựa trên khái niệm Project Object Model (POM), Maven có thể quản lý build, report và documentation của project từ một central piece of information. Chi tiết: [Maven Core Concepts Summary](https://javaguide.cn/tools/maven/maven-core-concepts.html).
- [Gradle](https://gradle.org/): Open source build automation tool, đủ flexible để build gần như mọi loại software. Gradle đưa ra ít giả định về những gì bạn muốn build hay cách build, khiến Gradle đặc biệt flexible. Chi tiết: [Gradle Core Concepts Summary](https://javaguide.cn/tools/gradle/gradle-core-concepts.html).

## Decompiler

- [JADX](https://github.com/skylot/jadx): Command line và GUI tool để generate Java source code từ Android Dex và Apk files.
- [JD-GUI](https://github.com/java-decompiler/jd-gui): Standalone GUI tool có thể hiển thị Java source code trong CLASS files.

## Database

### Database Modeling

- [CHINER](https://gitee.com/robergroup/chiner): Open source free domestic database modeling tool. Mục tiêu là tạo một database relationship model design platform phong phú về database ecosystem, độc lập với các database cụ thể. Tiền thân là [PDMan](https://gitee.com/robergroup/pdman), được định vị là free alternative cho PowerDesigner.

Open source database modeling tools khá ít, dưới đây là một số non-open source database modeling tools (một số cần trả phí):

- [MySQL Workbench](https://www.mysql.com/products/workbench/): Visual tool do MySQL official cung cấp cho database architects, developers và DBA. MySQL Workbench hỗ trợ data modeling, SQL development cũng như server configuration, user management, performance optimization, database backup và migration, hỗ trợ Windows, Linux và macOS.
- [Navicat Data Modeler](https://www.navicat.com.cn/products/navicat-data-modeler): Powerful và cost-effective database design tool, giúp user tạo conceptual, logical và physical data models chất lượng cao. Trả phí.
- [DbSchema](https://dbschema.com/): Powerful visual tool để database design và management, hỗ trợ hầu hết relational và NoSQL databases. Trả phí.
- [dbdiagram.io](https://dbdiagram.io/home): Simple free online ER diagram tool, tạo model bằng cách viết code, thiết kế cho developers và data analysts. Có free version.

### Database Management

- [Chat2DB](https://github.com/alibaba/Chat2DB): Intelligent general database tool và SQL client mã nguồn mở của Alibaba, hỗ trợ cài đặt local trên Windows, Mac và server-side deployment với Web access. So với traditional database client software như Navicat, DBeaver, Chat2DB tích hợp AIGC capabilities, hỗ trợ natural language to SQL, SQL performance optimization v.v.
- [Beekeeper Studio](https://github.com/beekeeper-studio/beekeeper-studio): Cross-platform database management tool, đẹp, hỗ trợ SQLite, MySQL, MariaDB, Postgres, CockroachDB, SQL Server, Amazon Redshift.
- [Sequel Pro](https://github.com/sequelpro/sequelpro): MySQL/MariaDB database management tool cho macOS.
- [DBeaver](https://github.com/dbeaver/dbeaver): Open source database management tool phát triển dựa trên Java, hỗ trợ hầu hết các database products. DBeaver community edition hỗ trợ relational databases như MySQL, PostgreSQL, MariaDB, SQLite, Oracle, Db2, SQL Server, embedded databases như SQLite, H2, full-text search engines như Elasticsearch và Solr, big data tools như Hive và Spark.
- [Kangaroo](https://gitee.com/dbkangaroo/kangaroo): Management client xây dựng cho các popular database systems (SQLite/MySQL/PostgreSQL/...), hỗ trợ tạo bảng, query, modeling, sync, import/export và các tính năng khác. Hỗ trợ Windows/Mac/Linux.
- [Arctype](https://arctype.com/): Desktop database query tool, có thể kết nối với nhiều database, thực thi SQL và hiển thị data dưới dạng visual.
- [Mongood](https://github.com/RenzHoly/Mongood): MongoDB graphical management tool. Dựa trên Microsoft Fluent UI, hỗ trợ auto dark mode.

### Redis

- [Another Redis Desktop Manager](https://github.com/qishibo/AnotherRedisDesktopManager/blob/master/README.zh-CN.md): Redis desktop (GUI) management client nhanh hơn, tốt hơn, ổn định hơn, tương thích với Windows, Mac, Linux.
- [Tiny RDM](https://github.com/tiny-craft/tiny-rdm): Redis desktop (GUI) management client hiện đại hơn, dựa trên Webview2, tương thích với Windows, Mac, Linux.
- [Redis Manager](https://github.com/ngbdf/redis-manager): Redis one-stop management platform, hỗ trợ monitoring, installation (except sentinel), management, alerting và basic data operations cho clusters (cluster, master-replica, sentinel).
- [CacheCloud](https://github.com/sohutv/cachecloud): Redis cloud management platform, hỗ trợ efficient management của nhiều Redis architectures (Standalone, Sentinel, Cluster), giảm đáng kể large-scale Redis ops cost.
- [RedisShake](https://github.com/tair-opensource/RedisShake): Tool để processing và migrating Redis data.

## Docker

- [Portainer](https://github.com/portainer/portainer): Visual management của Docker dưới dạng Web application.
- [lazydocker](https://github.com/jesseduffield/lazydocker): Simple terminal UI cho docker và docker-compose.

## ZooKeeper

- [PrettyZoo](https://github.com/vran-dev/PrettyZoo): ZooKeeper graphical management client được triển khai dựa trên Apache Curator và JavaFX, giao diện rất đẹp, hỗ trợ Mac/Windows/Linux. Bạn có thể dùng PrettyZoo để visual CRUD trên ZooKeeper.
- [zktools](https://zktools.readthedocs.io/en/latest/#installing): Low-latency ZooKeeper graphical management client, giao diện rất đẹp, hỗ trợ Mac/Windows/Linux.

## Kafka

- [Kafka UI](https://github.com/provectus/kafka-ui): Free open source Web UI để monitoring và managing Apache Kafka clusters.
- [Kafdrop](https://github.com/obsidiandynamics/kafdrop): Web UI để xem Kafka topics và browse consumer groups.
- [EFAK](https://github.com/smartloli/EFAK) (Eagle For Apache Kafka, trước đây là Kafka Eagle): Simple high-performance monitoring system để comprehensive monitoring và management của Kafka cluster.
