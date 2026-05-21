---
title: 《Backend Interview High-frequency System Design & Scenario Questions》
description: Chuyên mục câu hỏi system design và scenario phỏng vấn backend tần suất cao, bao gồm phân tích hơn 30 câu hỏi phỏng vấn kinh điển như flash sale system, short URL system, massive data processing.
category: Knowledge Planet
---

## Giới thiệu

**《Backend Interview High-frequency System Design & Scenario Questions》** là một e-book nội bộ trong [Knowledge Planet](../about-the-author/zhishixingqiu-two-years.md) của tôi, tổng hợp có hệ thống các system design cases và scenario questions tần suất cao trong phỏng vấn backend.

### Tại sao bạn cần e-book này?

Những năm gần đây, technical interview trong nước ngày càng "cạnh tranh hơn". Ngày càng nhiều công ty (Alibaba, Meituan, ByteDance, Tencent v.v.) bắt đầu kiểm tra **system design** và **scenario questions** trong phỏng vấn để đánh giá toàn diện hơn năng lực tổng hợp của ứng viên — dù là campus hay social recruitment.

> Nhiều bạn thuộc lòng technical questions rất thành thạo, nhưng gặp câu hỏi open-ended kiểu "làm thế nào để thiết kế một flash sale system?" là bị hỏng.

**Đặc điểm kiểm tra của system design và scenario questions**:

- ✅ Không có đáp án chuẩn, trọng tâm kiểm tra quá trình tư duy và khả năng architecture
- ✅ Kiểm tra việc ứng dụng tổng hợp các kỹ thuật như high concurrency, high availability, distributed
- ✅ Kiểm tra khả năng giải quyết vấn đề thực tế và kinh nghiệm engineering
- ⚠️ Phỏng vấn thông thường không toàn là scenario questions, thường xen kẽ 1-2 câu để kiểm tra bạn

Vì vậy, **《Backend Interview High-frequency System Design & Scenario Questions》** ra đời!

### E-book này mang lại cho bạn điều gì?

**1. Điểm cộng trong phỏng vấn**

Trả lời tốt system design và scenario questions, interviewer sẽ có ấn tượng rất tốt về bạn! Loại câu hỏi này chỉ cần chuẩn bị một chút là có thể nổi bật.

**2. Nâng cao tư duy system design**

Dù không chuẩn bị phỏng vấn, e-book này cũng có thể giúp bạn xây dựng thinking framework về system design, nâng cao khả năng giải quyết vấn đề thực tế.

**3. Tài liệu tham khảo thực chiến**

Nhiều cases được đề cập có thể trực tiếp áp dụng vào project của bạn, ví dụ:

- Third-party authorization login (WeChat/QQ login)
- Cách đúng để triển khai delayed tasks với Redis
- Thiết kế và triển khai dynamic thread pool
- Nhiều giải pháp triển khai distributed lock

## Tổng quan nội dung

### 📐 System Design Cases

| Topic                                                 | Core Knowledge Points                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| ⭐ **How to design a dynamic thread pool?**           | Dynamic adjustment of thread pool parameters, monitoring alerting, rejection policy, graceful shutdown |
| **How to design an in-site message system?**          | Message push, unread count statistics, WebSocket, message queue                                        |
| **How to design Weibo Feed/Information flow system?** | Push/pull model, Timeline, intelligent recommendation, read/write diffusion, cache strategy            |
| **How to design a leaderboard?**                      | Redis Sorted Set, real-time update, paginated query, massive data sorting                              |
| **Several typical system design cases (supplement)**  | Comprehensive cases like likes, coupons, red packets                                                   |

### 🎯 High-frequency Scenario Questions

| Topic                                                                    | Core Knowledge Points                                                                  |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| ⭐ **How to implement automatic order cancellation on timeout?**         | Delay queue, scheduled task, state machine, idempotency guarantee                      |
| **How to implement delayed tasks based on Redis?**                       | Expiry event monitoring vs Redisson DelayedQueue, timeliness, reliability              |
| ⭐ **How to solve large file upload problems?**                          | Chunked upload, resumable upload, instant upload, concurrent upload, file verification |
| **How to implement IP location feature?**                                | IP library selection, offline library vs online API, performance optimization          |
| **How to count website UV?**                                             | PV/UV/VV/IP concepts, HyperLogLog, deduplication statistics                            |
| ⭐ **Several typical backend interview scenario questions (supplement)** | Comprehensive scenarios like rate limiting, idempotency, cache penetration             |

### 🔐 Authentication Security & Risk Control

| Topic                                                                 | Core Knowledge Points                                                                     |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| ⭐ **How is sensitive word desensitization implemented in projects?** | Desensitization strategy, regex matching, performance optimization, dynamic configuration |
| ⭐ **How to securely transmit and store passwords?**                  | Salted hash, BCrypt, HTTPS, anti-replay attack                                            |
| **How to implement third-party authorization login?**                 | OAuth 2.0 protocol, authorization code mode, Token mechanism, JWT                         |
| **How to design captcha login scenarios?**                            | Captcha generation, storage, verification, anti-abuse, validity period management         |
| **How to restrict login after multiple incorrect passwords?**         | Rate limiting strategy, Redis counter, sliding window, distributed rate limiting          |

### 📊 Large Data Scenarios

| Topic                                                                      | Core Knowledge Points                                               |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| ⭐ **4 billion QQ numbers, limited to 1GB memory, how to deduplicate?**    | Bitmap, Bloom filter, divide and conquer, external sorting          |
| ⭐ **100 million DAU, how to ensure recommended videos are not repeated?** | Bloom filter, Redis Set, deduplication strategy, space optimization |
| ⭐ **Big data Top K problem**                                              | Heap sort, quick select, divide and conquer, MapReduce              |

### 🔄 Concurrency Control & Distributed Consistency

| Topic                                                               | Core Knowledge Points                                                             |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Multiple riders grabbing one order, how to ensure no duplicate?** | Distributed lock, optimistic lock, Redis SETNX, concurrency control               |
| **How to handle withdrawal failure (order cancellation)?**          | Compensation mechanism, idempotent design, status rollback, reconciliation system |

## Content Preview

![《Backend Interview High-frequency System Design & Scenario Questions》](https://oss.javaguide.cn/xingqiu/back-end-interview-high-frequency-system-design-and-scenario-questions-fengmian.png)

## Target Audience

- 🎓 **Campus job seekers**: Prepare for big company system design interviews
- 👨‍💻 **Social recruitment job changers**: Improve architecture design capabilities, get better offers
- 🔧 **Junior and mid-level engineers**: Learn system design thinking, improve ability to solve practical problems
- 📚 **Tech enthusiasts**: Understand design principles of common systems

<!-- @include: @planet2.snippet.md -->
