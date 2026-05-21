---
title: Java open source tool libraries chất lượng
description: Gợi ý các Java open source tool libraries chất lượng, bao gồm các công cụ phổ biến như Lombok, Guava, Hutool, Arthas để nâng cao hiệu quả phát triển và chất lượng code.
category: Open Source Projects
icon: codelibrary-fill
---

## Code Quality

- [Lombok](https://github.com/rzwitserloot/lombok): Powerful tool library để simplify Java code. Thông qua các annotation của Lombok, chúng ta có thể auto generate các logic code phổ biến như `getter`, `setter`, `equals`, `hashCode`, `toString` methods và constructor, log variables v.v.
- [Guava](https://github.com/google/guava "guava"): Bộ core libraries mạnh mẽ do Google phát triển, mở rộng chức năng standard library của Java. Cung cấp nhiều utility classes và collection types hữu ích như `Multimap` (multi-value mapping), `Multiset` (multiset), `BiMap` (bidirectional mapping) và immutable collections. Ngoài ra còn có graph processing library, concurrency tools, I/O operations, hashing algorithms, string processing, caching và nhiều chức năng thực dụng khác.
- [Hutool](https://github.com/looly/hutool "hutool"): Java tool library toàn diện và user-friendly, nhằm simplify development tasks với minimal dependencies. Đóng gói nhiều chức năng thực dụng như file operations, cache, encryption/decryption, logging, file operations.

## Troubleshooting và Performance Optimization

- [Arthas](https://github.com/alibaba/arthas "arthas"): Java diagnostic tool mã nguồn mở của Alibaba, có thể real-time monitor và diagnose Java applications. Cung cấp rich commands và features để analyze application performance issues bao gồm resource consumption và loading time trong quá trình startup.
- [Async Profiler](https://github.com/async-profiler/async-profiler): Low-overhead async Java performance analysis tool để collect và analyze application performance data.
- [Spring Boot Startup Report](https://github.com/maciejwalkowiak/spring-boot-startup-report): Tool để generate Spring Boot application startup reports. Cung cấp thông tin chi tiết về quá trình startup bao gồm loading time của mỗi bean, thời gian auto-configuration v.v. Giúp bạn analyze và optimize startup process.
- [Spring Startup Analyzer](https://github.com/linyimin0812/spring-startup-analyzer/blob/main/README_ZH.md): Thu thập dữ liệu quá trình khởi động Spring application, generate interactive analysis reports (HTML), dùng để analyze startup bottlenecks. Hỗ trợ Spring Bean async initialization để giảm và optimize Spring application startup time.

## Document Processing

### Document Parsing

- [Tika](https://github.com/apache/tika): Apache Tika toolkit có thể detect và extract metadata và text content từ hơn một nghìn loại file khác nhau (như PPT, XLS, PDF).

### Excel

- [EasyExcel](https://github.com/alibaba/easyexcel): Fast, simple Java tool để process Excel mà không bị OOM. Tuy nhiên, project này đã ngừng duy trì, đã migrate sang [FastExcel](https://github.com/fast-excel/fastexcel).
- [Excel Spring Boot Starter](https://github.com/pig-mesh/excel-spring-boot-starter): Spring Boot Starter dựa trên FastExcel để simplify Excel read/write operations.
- [Excel Streaming Reader](https://github.com/monitorjbl/excel-streaming-reader): Excel streaming code style reading tool (chỉ hỗ trợ đọc XLSX files), đóng gói dựa trên Apache POI, đồng thời giữ nguyên syntax của standard POI API.
- [MyExcel](https://github.com/liaochong/myexcel): Toolkit tích hợp nhiều chức năng như import, export, encrypt Excel.

### Word

- [poi-tl](https://github.com/Sayi/poi-tl): Word template engine dựa trên Apache POI, có thể generate Word documents từ Word templates và data — WYSIWYG!

### JSON

- [JsonPath](https://github.com/json-path/JsonPath): Tool library để process JSON data.

### PDF

Đối với nhu cầu PDF tạo đơn giản, OpenPDF là lựa chọn tốt — open source miễn phí, API đơn giản dễ dùng. Với scenario phức tạp cần parse, convert và extract text, có thể chọn Apache PDFBox. Tất nhiên, scenario phức tạp nếu không ngại LGPL license cũng có thể chọn iText.

- [x-easypdf](https://gitee.com/dromara/x-easypdf): Framework xây dựng PDF theo cách lắp ghép (dựa trên pdfbox/fop), hỗ trợ PDF export và edit, phù hợp với scenario tạo PDF document đơn giản.
- [iText](https://github.com/itext/itext7): Java library để create, edit và enhance PDF documents. iText 7 community edition dùng AGPL license. iText 5 vẫn là LGPL license, có thể dùng miễn phí cho commercial purposes nhưng đã ngừng duy trì.
- [OpenPDF](https://github.com/LibrePDF/OpenPDF): Hoàn toàn open source miễn phí (LGPL/MPL dual license), dựa trên một fork của iText, đơn giản dễ dùng.
- [Apache PDFBox](https://github.com/apache/pdfbox): Hoàn toàn open source miễn phí (Apache license), chức năng mạnh mẽ, hỗ trợ create, parse, convert và extract text từ PDF.
- [FOP](https://xmlgraphics.apache.org/fop/): Apache FOP dùng để convert XSL-FO (Extensible Stylesheet Language Formatting Objects) sang nhiều output formats, phổ biến nhất là PDF.

## Image Processing

- [Thumbnailator](https://github.com/coobird/thumbnailator): Image processing tool library, chức năng chính là scale images, add watermarks, rotate images, resize và crop regions.
- [Imglib](https://github.com/nackily/imglib): Lightweight Java image processing library, cung cấp ba phần chính: image collection, image processing (dựa trên Thumbnailator), aggregation và split.

## CAPTCHA

- [EasyCaptcha](https://gitee.com/whvse/EasyCaptcha): Java graphic captcha, hỗ trợ gif, Chinese characters, arithmetic và các loại khác, dùng cho Java Web, JavaSE v.v.
- [AJ-Captcha](https://gitee.com/anji-plus/captcha): Behavioral captcha (sliding puzzle, click text), frontend và backend (Java) interaction.
- [tianai-captcha](https://gitee.com/tianai/tianai-captcha): Slider captcha đẹp và dễ dùng.

## SMS & Email

- [SMS4J](https://github.com/dromara/SMS4J): SMS aggregation framework, giải quyết quy trình phức tạp khi tích hợp nhiều SMS SDKs.
- [Simple Java Mail](https://github.com/bbottema/simple-java-mail): Java email library nhẹ đơn giản nhất, đồng thời có thể gửi các email phức tạp.

## Online Payment

- [Jeepay](https://gitee.com/jeequan/jeepay): Open source payment system phù hợp cho internet enterprises, đã triển khai các interfaces cho transaction, refund, transfer, split payment v.v.
- [YunGouOS-PAY-SDK](https://gitee.com/YunGouOS/YunGouOS-PAY-SDK): WeChat Pay interface, WeChat official personal payment interface.
- [IJPay](https://gitee.com/javen205/IJPay): Aggregated payments, encapsulates WeChat Pay, QQ Pay, Alipay, JD Pay, UnionPay, PayPal và nhiều payment methods và interfaces phổ biến khác.

## Khác

- [oshi](https://github.com/oshi/oshi "oshi"): JNA-based (native) operating system và hardware information library cho Java.
- [ip2region](https://github.com/lionsoul2014/ip2region): Free IP address query library, IP to region mapping library, cung cấp Binary, B-tree và pure-memory ba query algorithms.
- [agrona](https://github.com/real-logic/agrona): Java high-performance data structures (`Buffers`, `Lists`, `Maps`, `Scalable Timer Wheel`...) và utility methods.
