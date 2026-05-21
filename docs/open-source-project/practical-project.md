---
title: Java open source practical projects chất lượng
description: Gợi ý các Java open source practical projects chất lượng, tuyển chọn các practical projects như rapid development platforms, e-commerce systems, permission management phù hợp để học và đưa vào resume.
category: Open Source Projects
icon: project
---

## AI

- [interview-guide](https://github.com/Snailclimb/interview-guide): Dựa trên Spring Boot 4.0 + Java 21 + Spring AI + PostgreSQL + pgvector + RustFS + Redis, triển khai các core features như intelligent resume analysis, AI mock interview, knowledge base RAG retrieval. Rất phù hợp làm learning và resume project, learning threshold thấp.
- [PaiAgent](https://github.com/itwanger/PaiAgent): Enterprise-level AI workflow visual orchestration platform, giúp việc kết hợp và điều phối AI capabilities trở nên đơn giản và hiệu quả. Thông qua giao diện drag-and-drop trực quan, cả developers và business people đều có thể nhanh chóng xây dựng complex AI processing flows mà không cần viết code.

## Rapid Development Platforms

- [Snowy](https://gitee.com/xiaonuobase/snowy): First domestic front-end and back-end separated rapid development platform with national cryptography. Chi tiết: [5.1k! Đây là scaffold phát triển nhanh front-backend separation mạnh nhất tôi từng thấy!](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247534316&idx=1&sn=69938397674fc33ecda43c8c9d0a4039&chksm=cea10927f9d68031bc862485c6be984ade5af233d4d871d498c38f22164a84314678c0c67cd7&token=1464380539&lang=zh_CN#rd)
- [eladmin](https://github.com/elunez/eladmin): Back-end management system với front-backend separation, project dùng modular development, permission control dùng RBAC, hỗ trợ data dictionary và data permission management, one-click generate front-end và back-end code, dynamic routing.
- [RuoYi](https://gitee.com/y_project/RuoYi): Permission management system dựa trên SpringBoot, dễ đọc dễ hiểu, giao diện đẹp, chạy là dùng được.
- [AgileBoot-Back-End](https://github.com/valarchie/AgileBoot-Back-End): Basic rapid development framework dựa trên Ruoyi với nhiều refactoring và optimization.
- [SmartAdmin](https://gitee.com/lab1024/smart-admin): Low-code mid-backend solution đơn giản và dễ dùng.
- [EuBackend](https://gitee.com/zhaoeryu/eu-backend): Lightweight rapid development platform dựa trên SpringBoot.
- [RuoYi-Vue-Pro](https://github.com/YunaiV/ruoyi-vue-pro): All-new Pro version của RuoYi-Vue, optimizes all features, hỗ trợ data permissions, SaaS multi-tenancy, Flowable workflow, third-party login, payment v.v.
- [RuoYi-Vue-Plus](https://gitee.com/dromara/RuoYi-Vue-Plus): All-new Plus version, rewrite tất cả RuoYi-Vue features, tích hợp Sa-Token, Mybatis-Plus, Jackson, SpringDoc, Hutool, OSS v.v.
- [pig](https://gitee.com/log4j/pig "pig"): RBAC permission management system dựa trên Spring Boot + Spring Cloud + OAuth2.
- [Guns](https://gitee.com/stylefeng/guns): Modern Java application development base framework.
- [JeecgBoot](https://github.com/zhangdaiscott/jeecg-boot): J2EE low-code rapid development platform dựa trên code generator, hỗ trợ generate front-backend separated architecture projects.
- [Erupt](https://gitee.com/erupt/erupt): Low-code full-stack framework dùng Java annotations để dynamically generate pages và backend features như CRUD, permission control.
- [BallCat](https://github.com/ballcat-projects/ballcat): Fully-featured rapid development scaffold! Ngoài basic permission management, scheduled tasks, còn hỗ trợ XSS filtering, SQL injection prevention, data desensitization và nhiều tính năng khác.
- [JHipster](https://github.com/jhipster/generator-jhipster): Open source application platform, có thể create Spring Boot + Angular/React projects trong vài giây.

## Blog/Forum Systems

Các project dưới đây đều rất phù hợp cho Spring Boot beginners học. Tôi đã xem overall code architecture của phần lớn các project dưới đây — cá nhân thấy không tệ, sẽ không dẫn đường sai cho các bạn chưa từng làm project thực tế.

- [paicoding](https://github.com/itwanger/paicoding): Open source community dễ dùng và mạnh mẽ, dựa trên Spring Boot mainstream tech stack, kèm detailed tutorial.
- [forest](https://github.com/rymcu/forest): Next-gen knowledge community system, có thể custom topics và portfolios. Backend dựa trên SpringBoot + Shrio + MyBatis + JWT + Redis, frontend dựa trên Vue + NuxtJS + Element-UI.
- [community](https://github.com/codedrinker/community): Open source forum, Q&A system với các features như posting questions, replies, notifications, latest/hottest sorting, remove zero-reply feature. Tech stack: Spring, Spring Boot, MyBatis, MySQL/H2, Bootstrap.
- [OneBlog](https://gitee.com/yadong.zhang/DBlog): Minimalist, beautiful, feature-rich và responsive blog system, hỗ trợ ad slots, SEO, real-time communication v.v.
- [VBlog](https://github.com/lenve/VBlog): V Blog, multi-user blog management platform triển khai với Vue + SpringBoot!
- [My-Blog](https://github.com/ZHENFENG13/My-Blog): Java blog system với SpringBoot + Mybatis + Thymeleaf, giao diện đẹp, chức năng đầy đủ, deploy đơn giản.

## Wiki/Documentation Systems

- [zyplayer-doc](https://gitee.com/dromara/zyplayer-doc): Knowledge base, notes, WIKI document management tool phù hợp cho team và individual private deployment, còn có database management, API management v.v.
- [kkFileView](https://gitee.com/kekingcn/file-online-preview): Online document preview solution, hỗ trợ preview hầu hết các document formats như doc, docx, ppt, pptx, wps, xls, xlsx, zip, rar, ofd, xmind, bpmn, eml, epub, 3ds, dwg, psd, mp4, mp3 v.v.

## File Management/Cloud Drive

- [cloud-drive](https://gitee.com/SnailClimb/cloud-drive): Minimalist modern cloud storage system dựa trên Alibaba Cloud OSS, cung cấp file upload, download, sharing v.v.
- [qiwen-file](https://gitee.com/qiwen-cloud/qiwen-file): Distributed file system dựa trên SpringBoot + Vue, hỗ trợ local disk, Alibaba Cloud OSS, FastDFS, MinIO và nhiều storage options, hỗ trợ Office online editing, chunked upload, second upload, resumable upload v.v.
- [free-fs](https://gitee.com/dh_free/free-fs): Cloud storage management system kết hợp Qiniu Cloud, Alibaba Cloud OSS dựa trên SpringBoot + MyBatis Plus + MySQL + Sa-Token + Layui. Có đầy đủ chức năng upload, delete, preview, list query, download, move, rename, directory management, login, register, permission control.
- [zfile](https://github.com/zfile-dev/zfile): Online cloud drive dựa trên Spring Boot + Vue, hỗ trợ S3, OneDrive, SharePoint, Google Drive, Duoge Cloud, Upyun, local storage, FTP, SFTP và nhiều storage sources. Hỗ trợ online browsing images, playing audio/video, text files, Office, obj (3D) và nhiều file types.

## Exam/Practice Systems

- [PlayEdu](https://github.com/PlayEdu/PlayEdu): Open source system phù hợp để setup internal training platform cho enterprises/organizations.
- [HOJ](https://gitee.com/himitzh0730/hoj): Distributed architecture online judge platform OJ, chức năng rất đầy đủ, hỗ trợ problem solving, training, competition, evaluation.
- [VOJ](https://github.com/simplefanC/voj): High-performance online evaluation system dựa trên microservices architecture. Có local judge service, hỗ trợ remote judging trên các OJ nổi tiếng (HDU, POJ...).
- [OnlineJudge](https://github.com/SDUOJ/OnlineJudge): Online evaluation system dựa trên microservices architecture, hỗ trợ nhiều international competition formats (ICPC/OI/IOI), Docker containerized deployment.
- [sg-exam](https://gitee.com/wells2333/sg-exam): Teaching management platform dễ dùng và đẹp, cung cấp multi-tenancy, permission management, exams, practice, online learning.
- [uexam](https://gitee.com/mindskip/uexam): Fully-featured online exam system, easy deploy, friendly UI, clean code structure.
- [PassJava-Platform](https://github.com/Jackson0714/PassJava-Platform): Interview practice mini-app dựa trên microservices architecture!

## E-commerce Systems

Các e-commerce systems dưới đây phần lớn khá phức tạp như mall. Nếu chưa có Java basics và chưa làm quen với Spring Boot, không khuyến nghị nghiên cứu quá mức các projects sau đây hoặc dùng chúng làm graduation project.

- [congomall](https://gitee.com/nageoffer/congomall): TOC mall system khác biệt, SpringCloud-Alibaba microservices architecture design, dựa trên DDD domain-driven model, elegant code design, bao phủ core mall business.
- [mall](https://github.com/macrozheng/mall "mall"): E-commerce system gồm front-end mall system và backend management system, dựa trên SpringBoot + MyBatis.
- [mall-swarm](https://github.com/macrozheng/mall-swarm "mall-swarm"): Microservices mall system dùng Spring Cloud Greenwich, Spring Boot 2, MyBatis, Docker, Elasticsearch và các core technologies khác.
- [litemall](https://github.com/linlinjava/litemall "litemall"): Another small mall. litemall = Spring Boot backend + Vue admin frontend + WeChat mini-program user frontend + Vue user mobile frontend.
- [newbee-mall](https://github.com/newbee-ltd/newbee-mall): E-commerce system gồm newbee-mall mall system và newbee-mall-admin backend management system, dựa trên Spring Boot 2.X và related tech stack.

## Ticketing Systems

- [12306](https://gitee.com/nageoffer/12306): High-concurrency 12306 ticket booking service dựa trên JDK17 + SpringBoot3 + SpringCloud microservices architecture.
- [Damai](https://gitee.com/java-up-up/damai): Cung cấp ticket booking functionality cho hot concerts, thiết kế practical solutions để giải quyết các vấn đề phát sinh khi cạnh tranh mua vé trong high concurrency.

## Build Wheels (DIY Projects)

- [guide-rpc-framework](https://github.com/Snailclimb/guide-rpc-framework): Custom RPC framework dựa trên Netty + Kyro + Zookeeper với detailed implementation process và tutorials.
- [mini-spring](https://github.com/DerekYRC/mini-spring): Simplified Spring framework giúp bạn nhanh chóng làm quen với Spring source code và nắm core principles. Code extremely simplified, preserves Spring core features như IoC, AOP, resource loader.
- [mini-spring-cloud](https://github.com/DerekYRC/mini-spring-cloud): Handwritten simplified Spring Cloud để giúp bạn nhanh chóng làm quen với Spring Cloud source code và core principles.
- [haidnorJVM](https://github.com/FranzHaidnor/haidnorJVM): Simple Java Virtual Machine triển khai bằng Java.
- [itstack-demo-jvm](https://github.com/fuzhengwei/itstack-demo-jvm): Triển khai basic features của JVM bằng Java code (search and parse class files, bytecode commands, runtime data areas v.v.).
- [Freedom](https://github.com/alchemystar/Freedom): DIY database với ACID. Related projects: [MYDB](https://github.com/CN-GuoZiyang/MYDB), [toyDB](https://github.com/erikgrinaker/toydb).
- [lu-raft-kv](https://github.com/stateIs0/lu-raft-kv): Java version Raft (CP) KV distributed storage implementation, rất phù hợp cho những bạn muốn học sâu về Raft protocol. Đã triển khai hai core features của Raft: leader election và log replication.
