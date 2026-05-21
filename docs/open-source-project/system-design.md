---
title: Java open source system design projects chất lượng
description: Gợi ý các Java open source system design projects chất lượng, tuyển chọn các infrastructure components như Web framework, microservices, message queue, search engine, database.
category: Open Source Projects
icon: "xitongsheji"
---

## Base Frameworks

### Web Frameworks

- [Spring Boot](https://github.com/spring-projects/spring-boot "spring-boot"): Spring Boot có thể dễ dàng tạo standalone production-grade Spring-based applications với built-in web servers để chạy như Java programs thông thường. Ngoài ra, phần lớn Spring Boot projects chỉ cần ít configuration — khác với Spring's heavy configuration.
- [SOFABoot](https://github.com/sofastack/sofa-boot): SOFABoot dựa trên Spring Boot, nhưng bổ sung thêm Readiness Check, class isolation, log space isolation và các capabilities khác. Đi kèm: SOFARPC (RPC framework), SOFABolt (Netty-based remote communication framework), SOFARegistry (registry center)... Chi tiết: [SOFAStack](https://github.com/sofastack).
- [Solon](https://gitee.com/opensolon/solon): Domestic full-scenario Java enterprise application development framework.
- [Javalin](https://github.com/tipsy/javalin): Lightweight Web framework hỗ trợ cả Java và Kotlin, được Microsoft, Red Hat, Uber sử dụng.
- [Play Framework](https://github.com/playframework/playframework): High-speed Web framework cho Java và Scala.
- [Blade](https://github.com/lets-blade/blade): Web framework theo đuổi simplicity và efficiency, based on Java8 + Netty4.

### Microservices/Cloud Native

- [Armeria](https://github.com/line/armeria): Microservices framework cho mọi trường hợp. Có thể build bất kỳ loại microservice nào với công nghệ bạn thích, bao gồm gRPC, Thrift, Kotlin, Retrofit, Reactive Streams, Spring Boot và Dropwizard.
- [Quarkus](https://github.com/quarkusio/quarkus): Cloud-native và container-first framework để viết Java applications.
- [Helidon](https://github.com/helidon-io/helidon): Bộ Java libraries để viết microservices, hỗ trợ Helidon MP và Helidon SE hai programming models.

### API Documentation

- [Swagger](https://swagger.io/): RESTful API documentation tool phổ biến, cung cấp một bộ tools và specs giúp developers dễ dàng create và maintain readable, easy-to-use và interactive API docs.
- [Knife4j](https://doc.xiaominfo.com/): Enhanced solution tích hợp cả Swagger2 và OpenAPI3.

### Bean Mapping

- [MapStruct](https://github.com/mapstruct/mapstruct) (Recommended): Java annotation processor thỏa mãn JSR269 spec để generate type-safe và high-performance mappings cho Java Beans. Based on compile-time get/set code generation, no reflection, no extra performance overhead.
- [MapStruct Plus](https://github.com/linpeilie/mapstruct-plus): Enhanced version của MapStruct, hỗ trợ auto-generating Mapper interfaces.
- [JMapper](https://github.com/jmapper-framework/jmapper-core): High-performance và easy-to-use Bean mapping framework.

### Other

- [Guice](https://github.com/google/guice): Lightweight dependency injection framework mã nguồn mở của Google, tương đương lightweight Spring Boot với minimal features. Rất hữu dụng trong một số trường hợp khi project chỉ cần dependency injection mà không cần AOP.
- [Spring Batch](https://github.com/spring-projects/spring-batch): Lightweight but comprehensive batch processing framework, primarily for batch processing scenarios like reading large volumes of records from database, file, or queue. Note: Spring Batch is NOT a scheduling framework. Works alongside schedulers like Quartz, XXL-JOB, Elastic-Job.

## Authentication & Authorization

### Permission Authentication

- [Sa-Token](https://github.com/dromara/sa-token): Lightweight Java permission authentication framework. Hỗ trợ authentication, authorization, SSO, kick-out, auto-renewal và các features. Compared to Spring Security và Shiro, Sa-Token has more built-in out-of-the-box features và simpler to use.
- [Spring Security](https://github.com/spring-projects/spring-security): Spring official security framework capable of authentication, authorization, encryption và session management. Most widely used Java security framework currently.
- [Shiro](https://github.com/apache/shiro): Java security framework with similar functionality to Spring Security but simpler to use.

### Third-party Login

- [WxJava](https://github.com/Wechat-Group/WxJava): WxJava (WeChat Java SDK), hỗ trợ WeChat Pay, Open Platform, Mini Programs, Enterprise WeChat/WeChat Work và Official Account backend development.
- [JustAuth](https://github.com/justauth/JustAuth): Small but comprehensive and beautiful third-party login open source component. Currently integrates dozens of third-party platforms domestically and internationally including GitHub, Gitee, Alipay, Sina Weibo, WeChat, Google, Facebook, Twitter, StackOverflow.

### Single Sign-On (SSO)

- [CAS](https://github.com/apereo/cas): Enterprise multi-language web SSO solution.
- [MaxKey](https://gitee.com/dromara/MaxKey): SSO authentication system providing secure, standard and open user identity management (IDM), identity authentication (AM), SSO, RBAC permission management và resource management.
- [Keycloak](https://github.com/keycloak/keycloak): Free, open source identity authentication và access management system with highly configurable SSO.

## Network Communication

- [Netty](https://github.com/netty/netty): NIO-based client-server framework for quickly and simply developing network applications.
- [Retrofit](https://github.com/square/retrofit): Type-safe HTTP client for Android và Java. Uses OkHttp library for HTTP requests.
- [Forest](https://gitee.com/dromara/forest): Lightweight HTTP client API framework making it easy for Java to send HTTP/HTTPS requests. Higher level than OkHttp và HttpClient, great for calling third-party RESTful API client interfaces.
- [netty-websocket-spring-boot-starter](https://github.com/YeautyYE/netty-websocket-spring-boot-starter): Helps use Netty to develop WebSocket server in Spring Boot, as simple as spring-websocket annotation development.

## Database

### Database Connection Pools

- [Druid](https://github.com/alibaba/druid): Alibaba Database division product, database connection pool born for monitoring.
- [HikariCP](https://github.com/brettwooldridge/HikariCP): Reliable high-performance JDBC connection pool. SpringBoot 2.0 chose HikariCP as default DB connection pool.

### Database Frameworks

- [MyBatis-Plus](https://github.com/baomidou/mybatis-plus): MyBatis enhancement tool. Only enhances, doesn't change. Simplifies development and improves efficiency.
- [MyBatis-Flex](https://gitee.com/mybatis-flex/mybatis-flex): Elegant MyBatis enhancement framework with no other third-party dependencies. Supports CRUD, paginated queries, multi-table queries, batch operations.
- [jOOQ](https://github.com/jOOQ/jOOQ): Best way to write SQL in Java.
- [Redisson](https://github.com/redisson/redisson "redisson"): Java In-Memory Data Grid built on top of Redis. Fully utilizes Redis key-value DB advantages to provide a series of distributed utility classes for Java developers. For example, distributed Java objects (Set, SortedSet, Map, List, Queue, Deque, etc.), distributed locks, etc.

### Data Sync

- [Canal](https://github.com/alibaba/canal "canal"): Canal translates to canal/pipeline/ditch. Primarily based on MySQL incremental log parsing to provide incremental data subscription and consumption.
- [DataX](https://github.com/alibaba/DataX "DataX"): Alibaba's widely-used offline data sync tool/platform. Enables efficient data sync between various heterogeneous data sources including MySQL, Oracle, SqlServer, PostgreSQL, HDFS, Hive, HBase, etc. Related: [DataX-Web](https://github.com/WeiYe-Jing/datax-web) (integrated visualization page for one-click data sync tasks).

Other: [Flinkx](https://github.com/DTStack/flinkx) (Flink-based distributed data sync tool).

### Time Series Databases

- [IoTDB](https://github.com/apache/iotdb): Domestic time series database written in Java providing data collection, storage and analysis services. Seamlessly integrates with Hadoop, Spark and visualization tools (like Grafana).
- [KairosDB](https://github.com/kairosdb/kairosdb): Fast distributed scalable time series database based on Cassandra.

## Search Engines

- [Elasticsearch](https://github.com/elastic/elasticsearch "elasticsearch") (Recommended): Open source, distributed, RESTful search engine.
- [Meilisearch](https://github.com/meilisearch/meilisearch): Powerful, fast, open source, easy-to-use and deploy search engine with Chinese search support.
- [Solr](https://lucene.apache.org/solr/): Apache Lucene project's open source enterprise search platform.
- [Easy-ES](https://gitee.com/dromara/easy-es): Fool-proof ElasticSearch ORM framework.

## Testing

### Testing Frameworks

- [JUnit](http://junit.org/): Java testing framework.
- [Mockito](https://github.com/mockito/mockito): Mock testing framework for writing beautiful unit tests with elegant, simple interfaces.
- [PowerMock](https://github.com/powermock/powermock): Extends Mockito to mock private methods, final methods and static methods that Mockito can't handle.
- [WireMock](https://github.com/tomakehurst/wiremock): Tool for mocking HTTP services.
- [Testcontainers](https://github.com/testcontainers/testcontainers-java): JUnit-supporting test library providing lightweight and disposable common database testing support, Selenium Web browser, or anything that can run in a Docker container.

Related reading:

- [The Practical Test Pyramid - Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Introduction to testing with PowerMock](https://juejin.im/post/6844903982058618894)

### Test Platforms

- [MeterSphere](https://github.com/metersphere/metersphere): One-stop open source continuous testing platform covering test tracking, interface testing, performance testing, team collaboration. Fully compatible with JMeter, Postman, Swagger.
- [Apifox](https://www.apifox.cn/): API documentation, API debugging, API Mock, API automation testing.

### API Debugging

- [Reqable](https://reqable.com/): Next-gen open source API development tool. Reqable = Fiddler + Charles + Postman, makes API debugging faster.
- [Insomnia](https://insomnia.rest/): Debug APIs like a human, not a machine. Beautiful and lightweight API development tool I use frequently.
- [RapidAPI](https://paw.cloud/): Full-featured HTTP client, Mac only.
- [Postcat](https://github.com/Postcatlab/postcat): Extensible open source API tool platform.
- [Postman](https://www.getpostman.com/): One of the most commonly used API testing tools.
- [Hoppscotch](https://github.com/liyasthomas/postwoman "postwoman") (formerly Postwoman): Open source API testing tool. Positioned as open source alternative to Postman, Insomnia.
- [Restful Fast Request](https://gitee.com/dromara/fast-request): IDEA version of Postman — API debug tool + API management + API search.

## Task Scheduling

- [Quartz](https://github.com/quartz-scheduler/quartz): Very popular open source task scheduling framework. The "big brother" of Java scheduled tasks, many other frameworks are based on it.
- [XXL-JOB](https://github.com/xuxueli/xxl-job): Distributed task scheduling platform with core design goal of rapid development, simple learning, lightweight, easy extension.
- [Elastic-Job](http://elasticjob.io/index_zh.html): Dangdang's open source distributed scheduling solution based on Quartz and ZooKeeper.
- [EasyScheduler](https://github.com/analysys/EasyScheduler "EasyScheduler") (renamed to DolphinScheduler, now Apache incubator project): Distributed easily-scalable visual workflow task scheduling platform.
- [PowerJob](https://gitee.com/KFCFans/PowerJob): New generation distributed task scheduling and computing framework, supports CRON, API, fixed frequency, fixed delay scheduling strategies.

## Workflow

1. [Flowable](https://github.com/flowable/flowable-engine): Branch of Activiti5, rich features. Introduces more advanced features including stronger CMMN, DMN support and more flexible integration options.
2. [Activiti](https://github.com/Activiti/Activiti): Conservative function expansion, suitable for traditional enterprise apps needing stable BPMN 2.0 workflow engine.
3. [Warm-Flow](https://gitee.com/dromara/warm-flow): Domestic open source workflow engine, simple and lightweight but not simple — fully-featured, independent components, extensible.
4. [FlowLong](https://gitee.com/aizuda/flowlong): Domestic open source workflow engine, designed for Chinese-style process approvals.

## Distributed

### API Gateways

- [Kong](https://github.com/Kong/kong "kong"): Cloud-native, fast, scalable distributed microservices abstraction layer. Released as open source in 2015, core values are high performance and scalability.
- [ShenYu](https://github.com/Dromara/soul "soul"): Scalable, high-performance, reactive API gateway solution for all microservices.
- [Spring Cloud Gateway](https://github.com/spring-cloud/spring-cloud-gateway): High-performance gateway built on Spring Framework 5.x and Spring Boot 2.x.
- [Zuul](https://github.com/Netflix/zuul): L7 application gateway providing dynamic routing, monitoring, resiliency, security.

### Config Centers

- [Apollo](https://github.com/ctripcorp/apollo "apollo") (Recommended): Distributed config center by Ctrip's framework team. Centrally manages configuration for different environments and clusters. Changes pushed to app in real-time.
- [Nacos](https://github.com/alibaba/nacos) (Recommended): Spring Cloud Alibaba's service registration/discovery component. Also provides distributed config management.
- [Spring Cloud Config](https://github.com/spring-cloud/spring-cloud-config): Spring Cloud's earliest config center, still suitable for Spring Cloud projects.
- [Consul](https://github.com/hashicorp/consul): HashiCorp's open source software providing service governance, config center, control plane and other features for microservices systems.

### Distributed Tracing

- [Skywalking](https://github.com/apache/skywalking "skywalking"): Application performance monitoring for distributed systems, especially microservices, cloud-native and container-oriented.
- [Zipkin](https://github.com/openzipkin/zipkin "zipkin"): Distributed tracing system. Helps collect timing data needed to troubleshoot latency issues in service architectures.
- [CAT](https://github.com/dianping/cat "cat"): Provides Java, C/C++, Node.js, Python, Go multi-language clients. Deeply integrated into Meituan Dianping's infrastructure middleware framework.

Related: [Skywalking official comparison of mainstream distributed tracing systems](https://skywalking.apache.org/zh/blog/2019-03-29-introduction-of-skywalking-and-simple-practice.html)

### Distributed Locks

- [Lock4j](https://gitee.com/baomidou/lock4j): High-performance distributed lock supporting different schemes like Redisson and ZooKeeper.
- [Redisson](https://github.com/redisson/redisson "redisson"): Provides comprehensive and powerful distributed lock support beyond simple Redis lock implementations.

## High Performance

### Multi-threading

- [Hippo4j](https://github.com/opengoofy/hippo4j): Async thread pool framework supporting dynamic changes, monitoring, alerting without code modification.
- [Dynamic Tp](https://github.com/dromara/dynamic-tp): Lightweight dynamic thread pool with built-in monitoring and alerting, integrates third-party middleware thread pool management.
- [asyncTool](https://gitee.com/jd-platform-opensource/asyncTool): JD multi-thread utility library, heavily uses `CompletableFuture`. Parallel framework for arbitrary multi-thread parallel, serial, blocking, dependency, callback combinations.

### Caching

#### Local Cache

- [Caffeine](https://github.com/ben-manes/caffeine): Powerful local caching solution with excellent performance.
- [Guava](https://github.com/google/guava): Google Java core library with complete local cache implementation.
- [OHC](https://github.com/snazy/ohc): Java off-heap cache solution (project no longer maintained since 2021).

#### Distributed Cache

- [Redis](https://github.com/redis/redis): In-memory database written in C, first choice for distributed caching.
- [Dragonfly](https://github.com/dragonflydb/dragonfly): In-memory database built for modern application workloads. Fully compatible with Redis and Memcached APIs. Claims to be world's fastest in-memory database.
- [KeyDB](https://github.com/Snapchat/KeyDB): High-performance fork of Redis focused on multi-threading, memory efficiency and high throughput.

#### Multi-level Cache

- [J2Cache](https://gitee.com/ld/J2Cache): Two-level Java caching framework based on local memory and Redis.
- [JetCache](https://github.com/alibaba/jetcache): Alibaba's open source caching framework supporting multi-level cache, distributed cache auto-refresh, TTL, etc.

### Message Queues

**Distributed queues**:

- [RocketMQ](https://github.com/apache/rocketmq "RocketMQ"): Alibaba's high-performance, high-throughput distributed message middleware.
- [Kafka](https://github.com/apache/kafka "Kafka"): Distributed, publish/subscribe-based messaging system.
- [RabbitMQ](https://github.com/rabbitmq "RabbitMQ"): Message queue based on AMQP protocol, developed in Erlang.

**In-memory queues**:

- [Disruptor](https://github.com/LMAX-Exchange/disruptor): High-performance queue developed by UK forex company LMAX. Research goal was to solve latency issues in memory queues.

### Read-Write Separation and Sharding

- [ShardingSphere](https://github.com/apache/shardingsphere): Ecosystem of open source distributed database middleware solutions consisting of Sharding-JDBC, Sharding-Proxy and Sharding-Sidecar (planned).
- [MyCat](https://github.com/MyCatApache/MyCat2): Database sharding middleware with most used features being read-write separation and sharding.
- [dynamic-datasource-spring-boot-starter](https://github.com/baomidou/dynamic-datasource-spring-boot-starter): Spring Boot starter for quickly integrating multiple data sources, supporting dynamic datasources, master-slave separation, read-write separation and distributed transactions.

## High Availability

### Rate Limiting

Distributed rate limiting:

- [Sentinel](https://github.com/alibaba/Sentinel) (Recommended): High availability defense component for distributed service architectures, focusing on traffic as the entry point for flow control, circuit breaking, system adaptive protection.
- [Hystrix](https://github.com/Netflix/Hystrix): Similar to Sentinel.

Related: [Sentinel vs Hystrix comparison](https://sentinelguard.io/zh-cn/blog/sentinel-vs-hystrix.html).

Single-machine rate limiting:

- [Bucket4j](https://github.com/vladimir-bukhtoyarov/bucket4j): Excellent rate limiting library based on token/leaky bucket algorithm.
- [Resilience4j](https://github.com/resilience4j/resilience4j): Lightweight fault tolerance component inspired by Hystrix.

### Monitoring

- [Spring Boot Admin](https://github.com/codecentric/spring-boot-admin): Manage and monitor Spring Boot applications.
- [Metrics](https://github.com/dropwizard/metrics): Capture JVM and application-level metrics.

### Logging

- ELK Classic: ELK = Elasticsearch + Logstash + Kibana.
- New ELK architecture: Elasticsearch + Logstash + Kibana + Beats.
- EFK: F represents [Fluentd](https://github.com/fluent/fluentd).
- [TLog](https://gitee.com/dromara/TLog): Lightweight distributed log marking tracing tool, integrable in 10 minutes. Auto-tags logs for microservice chain tracing.

## Bytecode Operations

- [ASM](https://asm.ow2.io/): Universal Java bytecode manipulation and analysis framework. Can modify existing classes in binary form or dynamically generate classes.
- [Byte Buddy](https://github.com/raphw/byte-buddy): Java bytecode generation and manipulation library for creating and modifying Java classes at runtime without compiler.
- [Javassist](https://github.com/jboss-javassist/javassist): Library for dynamic editing of Java bytecode.
- [Recaf](https://github.com/Col-E/Recaf): Modern Java bytecode editor based on ASM to simplify editing compiled Java applications.
