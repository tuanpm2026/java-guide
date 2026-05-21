---
title: Giải thích chi tiết Web Real-time Message Push
description: Message push thường chỉ việc nhân viên vận hành website và các bộ phận khác chủ động push message đến webpage hiện tại hoặc mobile app của user thông qua một số công cụ.
category: System Design
icon: "messages"
head:
  - - meta
    - name: keywords
      content: Web message push,real-time message,WebSocket,SSE,long polling,short polling,MQTT,real-time communication solutions
---

> Original article: <https://juejin.cn/post/7122014462181113887>, JavaGuide đã hoàn thiện và bổ sung nội dung.

Tôi có một người bạn đã làm một website nhỏ, bây giờ muốn triển khai tính năng Web message push trong trang. Đúng vậy, đó là cái chấm đỏ nhỏ trong hình dưới — một tính năng rất phổ biến.

![In-site message Web push](/images/github/javaguide/system-design/web-real-time-message-push/1460000042192380.png)

Nhưng bạn ấy chưa nghĩ ra dùng cách nào, ở đây tôi giúp bạn ấy tổng hợp một số phương án và triển khai đơn giản.

## Message Push là gì?

Push scenario khá nhiều. Ví dụ có người follow Official Account của tôi, lúc này tôi sẽ nhận được một push message để thu hút tôi click vào mở app.

Message push thường chỉ việc nhân viên vận hành website và các bộ phận khác, thông qua một số công cụ để chủ động push message đến webpage hiện tại hoặc mobile device APP của user.

Message push thường chia thành Web-end message push và mobile-end message push.

Mobile-end message push example:

![Mobile-end message push example](/images/github/javaguide/system-design/web-real-time-message-push/IKleJ9auR1Ojdicyr0bH.png)

Web-end message push example:

![Web-end message push example](/images/github/javaguide/system-design/web-real-time-message-push/image-20220819100512941.png)

Trước khi triển khai cụ thể, hãy phân tích lại yêu cầu phía trên. Thực ra tính năng rất đơn giản: chỉ cần trigger một event nào đó (chủ động chia sẻ resource hoặc backend chủ động push message), chấm đỏ notification trên webpage sẽ real-time `+1` là được.

Thông thường phía server sẽ có một số message push table để ghi lại các loại message khác nhau được push khi user trigger các event khác nhau. Frontend chủ động query (pull) hoặc bị động nhận (push) tất cả unread message count của user.

![Message push table](/images/github/javaguide/system-design/web-real-time-message-push/1460000042192384.png)

Message push không ngoài hai hình thức push và pull. Dưới đây chúng ta lần lượt tìm hiểu.

## Các phương án Message Push phổ biến

### Short Polling (Polling ngắn)

**Polling** có lẽ là một trong những phương án đơn giản nhất để triển khai message push. Ở đây chúng ta tạm chia polling thành short polling và long polling.

Short polling dễ hiểu — theo khoảng thời gian được chỉ định, browser gửi HTTP request đến server, server real-time trả về unread message data cho client, browser render và hiển thị.

Một JS timer đơn giản là đủ. Request unread message count interface mỗi giây, hiển thị data trả về là được.

```typescript
setInterval(() => {
  // Method request
  messageCount().then((res) => {
    if (res.code === 200) {
      this.messageCount = res.data;
    }
  });
}, 1000);
```

Hiệu quả vẫn ổn. Short polling triển khai đơn giản nhưng nhược điểm cũng rõ ràng: Vì push data không thay đổi thường xuyên, dù backend hiện tại có message mới hay không, client đều gửi request — chắc chắn gây áp lực lớn lên server, lãng phí bandwidth và server resource.

### Long Polling (Polling dài)

Long polling là phiên bản cải tiến của short polling ở trên, vừa giảm tối đa lãng phí server resource vừa đảm bảo tính tương đối real-time của message. Long polling được ứng dụng rộng rãi trong middleware — như Nacos, Apollo config center, message queue Kafka, RocketMQ đều dùng long polling.

Bài [Nacos config center interaction model: push hay pull?](https://mp.weixin.qq.com/s/94ftESkDoZI9gAGflLiGwg) tôi đã giới thiệu chi tiết nguyên lý triển khai long polling của Nacos. Bạn quan tâm có thể xem.

Long polling thực ra nguyên lý gần giống polling, đều dùng cách polling. Tuy nhiên, nếu data phía server không thay đổi, sẽ hold request đó mãi cho đến khi data phía server thay đổi, hoặc đợi một khoảng thời gian timeout mới trả về. Sau khi trả về, client ngay lập tức gửi long polling request tiếp theo.

Lần này tôi dùng cách Apollo config center triển khai long polling, áp dụng một class `DeferredResult`. Đây là một cơ chế async request được Spring đóng gói và cung cấp sau Servlet 3.0, nghĩa đen là "delayed result".

![Long polling diagram](/images/github/javaguide/system-design/web-real-time-message-push/1460000042192386.png)

`DeferredResult` cho phép container thread nhanh chóng release resource chiếm dụng, không block request thread, từ đó nhận nhiều request hơn để cải thiện system throughput. Sau đó khởi động async worker thread để xử lý business logic thực sự. Sau khi xử lý xong gọi `DeferredResult.setResult(200)` để submit response result.

Dưới đây chúng ta dùng long polling để triển khai message push.

Vì một ID có thể được nhiều long polling request monitor, tôi dùng cấu trúc `Multimap` từ Guava package để lưu long polling — một key có thể tương ứng với nhiều value. Khi monitor thấy key thay đổi, tất cả long polling tương ứng đều sẽ respond. Frontend nhận được status code không phải request timeout thì biết data thay đổi, chủ động query unread message count interface, cập nhật page data.

```java
@Controller
@RequestMapping("/polling")
public class PollingController {

    // Lưu long polling collection monitor một ID cụ thể
    // Thread-safe structure
    public static Multimap<String, DeferredResult<String>> watchRequests = Multimaps.synchronizedMultimap(HashMultimap.create());

    /**
     * Set monitor
     */
    @GetMapping(path = "watch/{id}")
    @ResponseBody
    public DeferredResult<String> watch(@PathVariable String id) {
        // Deferred object set timeout
        DeferredResult<String> deferredResult = new DeferredResult<>(TIME_OUT);
        // Remove key when async request complete, prevent memory overflow
        deferredResult.onCompletion(() -> {
            watchRequests.remove(id, deferredResult);
        });
        // Register long polling request
        watchRequests.put(id, deferredResult);
        return deferredResult;
    }

    /**
     * Change data
     */
    @GetMapping(path = "publish/{id}")
    @ResponseBody
    public String publish(@PathVariable String id) {
        // Data changed - take out all long polling requests monitoring ID and respond one by one
        if (watchRequests.containsKey(id)) {
            Collection<DeferredResult<String>> deferredResults = watchRequests.get(id);
            for (DeferredResult<String> deferredResult : deferredResults) {
                deferredResult.setResult("I updated: " + new Date());
            }
        }
        return "success";
    }
```

Khi request vượt quá timeout được đặt, sẽ ném ra `AsyncRequestTimeoutException`. Ở đây chỉ cần dùng `@ControllerAdvice` để globally catch và trả về thống nhất. Frontend nhận status code đã thỏa thuận rồi gửi lại long polling request, cứ vậy lặp lại.

```kotlin
@ControllerAdvice
public class AsyncRequestTimeoutHandler {

    @ResponseStatus(HttpStatus.NOT_MODIFIED)
    @ResponseBody
    @ExceptionHandler(AsyncRequestTimeoutException.class)
    public String asyncRequestTimeoutHandler(AsyncRequestTimeoutException e) {
        System.out.println("Async request timeout");
        return "304";
    }
}
```

Hãy test thử. Đầu tiên page gửi long polling request `/polling/watch/10086` để monitor message change. Request bị hold lại, không thay đổi data cho đến timeout rồi lại gửi long polling request. Sau đó manually thay đổi data `/polling/publish/10086`, long polling nhận được response. Sau khi frontend xử lý business logic xong lại gửi request, cứ vậy tuần hoàn.

Long polling cải thiện performance so với short polling rất nhiều, nhưng vẫn sẽ tạo ra nhiều request — đây là một điểm chưa hoàn hảo.

### iframe Stream (Luồng iframe)

iframe stream là chèn một thẻ `<iframe>` ẩn vào page, thông qua request message count API interface trong `src`, tạo ra một long connection giữa server và client. Server liên tục truyền data sang `iframe`.

Data truyền thường là HTML, hoặc JavaScript script nhúng, để đạt được hiệu quả cập nhật page real-time.

![iframe stream diagram](/images/github/javaguide/system-design/web-real-time-message-push/1460000042192388.png)

Cách triển khai đơn giản. Frontend chỉ cần một thẻ `<iframe>` là xong.

```html
<iframe src="/iframe/message" style="display:none"></iframe>
```

Server side chỉ cần assemble HTML, JS script data ghi vào response.

```java
@Controller
@RequestMapping("/iframe")
public class IframeController {
    @GetMapping(path = "message")
    public void message(HttpServletResponse response) throws IOException, InterruptedException {
        while (true) {
            response.setHeader("Pragma", "no-cache");
            response.setDateHeader("Expires", 0);
            response.setHeader("Cache-Control", "no-cache,no-store");
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().print(" <script type=\"text/javascript\">\n" +
                    "parent.document.getElementById('clock').innerHTML = \"" + count.get() + "\";" +
                    "parent.document.getElementById('count').innerHTML = \"" + count.get() + "\";" +
                    "</script>");
        }
    }
}
```

iframe stream có server overhead rất lớn, và IE, Chrome v.v. luôn ở trạng thái loading với biểu tượng xoay không ngừng — giết chết người bị OCD.

![iframe stream effect](/images/github/javaguide/system-design/web-real-time-message-push/1460000042192389.png)

iframe stream rất không thân thiện — cực kỳ không khuyến nghị.

### SSE (Khuyến nghị)

Nhiều người có thể không biết, ngoài `WebSocket` nổi tiếng, còn có Server-Sent Events (SSE) để server push message đến client. Đây là one-way message push từ server side đến client (browser).

ChatGPT nổi tiếng cũng dùng SSE. Với conversation scenario cần đợi response lâu, ChatGPT dùng một chiến lược khéo léo: push data đã tính toán ra cho user, và dùng SSE technology để liên tục trả về data trong quá trình tính toán. Ưu điểm là tránh user đóng page vì chờ quá lâu.

![ChatGPT using SSE for conversation](/images/github/javaguide/system-design/web-real-time-message-push/chatgpt-sse.png)

SSE dựa trên HTTP protocol. Chúng ta biết HTTP protocol thông thường không thể để server chủ động push message đến client, nhưng SSE là ngoại lệ — nó thay đổi cách tiếp cận.

![SSE diagram](/images/github/javaguide/system-design/web-real-time-message-push/1460000042192390.png)

SSE mở một one-way channel giữa server và client. Response của server không còn là data packet one-time nữa mà là data stream info kiểu `text/event-stream`, streaming từ server đến client khi có data thay đổi.

Tư duy triển khai tổng thể hơi giống xem video online — video stream liên tục được push đến browser. Bạn cũng có thể hiểu là client đang thực hiện một lần download rất dài (mạng không tốt).

![SSE demonstration](/images/github/javaguide/system-design/web-real-time-message-push/1460000042192391.png)

SSE và WebSocket có tác dụng tương tự, đều có thể thiết lập communication giữa server và browser, triển khai server push message đến client. Nhưng vẫn có một số điểm khác nhau:

- SSE dựa trên HTTP protocol, không cần protocol hoặc server implementation đặc biệt để hoạt động; WebSocket cần server riêng để xử lý protocol.
- SSE là one-way communication, chỉ có thể server push đến client; WebSocket là full-duplex communication — cả hai phía đều có thể gửi và nhận đồng thời.
- SSE triển khai đơn giản, chi phí phát triển thấp, không cần import component khác; WebSocket truyền data cần parsing thêm một lần, development threshold cao hơn một chút.
- SSE mặc định hỗ trợ auto reconnect; WebSocket cần tự implement.
- SSE chỉ có thể truyền text message, binary data cần được encode trước khi truyền; WebSocket mặc định hỗ trợ truyền binary data.

**SSE hay WebSocket, chọn cái nào?**

> Không có công nghệ tốt hay xấu, chỉ có cái nào phù hợp hơn.

SSE có vẻ ít được biết đến, một phần vì đã có WebSocket cung cấp protocol phong phú hơn để thực hiện bidirectional, full-duplex communication. Đối với gaming, instant messaging và các scenario cần bidirectional near real-time update, có bidirectional channel hấp dẫn hơn.

Nhưng trong một số trường hợp, không cần gửi data từ client. Bạn chỉ cần một số cập nhật về server operations. Ví dụ: in-site message, unread message count, status update, stock quotes, monitoring count v.v. — SSE dù về độ dễ triển khai hay chi phí đều có ưu thế hơn. Ngoài ra, SSE có nhiều tính năng mà WebSocket thiếu trong thiết kế như: auto reconnect, event ID và khả năng gửi arbitrary event.

Frontend chỉ cần một HTTP request, kèm unique ID, mở event stream, monitor event push từ server là được.

```javascript
<script>
    let source = null;
    let userId = 7777
    if (window.EventSource) {
        // Establish connection
        source = new EventSource('http://localhost:7777/sse/sub/'+userId);
        setMessageInnerHTML("Connected user=" + userId);
        /**
         * Once connection established, open event is triggered
         */
        source.addEventListener('open', function (e) {
            setMessageInnerHTML("Establishing connection...");
        }, false);
        /**
         * Client receives data sent from server
         */
        source.addEventListener('message', function (e) {
            setMessageInnerHTML(e.data);
        });
    } else {
        setMessageInnerHTML("Your browser doesn't support SSE");
    }
</script>
```

Server side implementation đơn giản hơn. Tạo một `SseEmitter` object đặt vào `sseEmitterMap` để quản lý.

```java
private static Map<String, SseEmitter> sseEmitterMap = new ConcurrentHashMap<>();

/**
 * Create connection
 */
public static SseEmitter connect(String userId) {
    try {
        // Set timeout, 0 means never expire. Default 30 seconds
        SseEmitter sseEmitter = new SseEmitter(0L);
        // Register callback
        sseEmitter.onCompletion(completionCallBack(userId));
        sseEmitter.onError(errorCallBack(userId));
        sseEmitter.onTimeout(timeoutCallBack(userId));
        sseEmitterMap.put(userId, sseEmitter);
        count.getAndIncrement();
        return sseEmitter;
    } catch (Exception e) {
        log.info("Failed to create new SSE connection, current user: {}", userId);
    }
    return null;
}

/**
 * Send message to specified user
 */
public static void sendMessage(String userId, String message) {

    if (sseEmitterMap.containsKey(userId)) {
        try {
            sseEmitterMap.get(userId).send(message);
        } catch (IOException e) {
            log.error("User [{}] push exception: {}", userId, e.getMessage());
            removeUser(userId);
        }
    }
}
```

**Lưu ý:** SSE không hỗ trợ IE browser, nhưng compatibility với các browser mainstream khác khá tốt.

![SSE compatibility](/images/github/javaguide/system-design/web-real-time-message-push/1460000042192393.png)

### WebSocket

WebSocket là một cách triển khai message push mà mọi người đều khá quen thuộc. Trước đó khi nói về SSE chúng ta cũng so sánh với WebSocket.

Đây là một protocol full-duplex communication trên TCP connection, thiết lập communication channel giữa client và server. Browser và server chỉ cần một lần handshake, hai bên có thể tạo persistent connection và tiến hành bidirectional data transmission.

![WebSocket diagram](/images/github/javaguide/system-design/web-real-time-message-push/1460000042192394.png)

Quá trình hoạt động của WebSocket có thể chia thành các bước sau:

1. Client gửi HTTP request đến server, request header chứa các field như `Upgrade: websocket` và `Sec-WebSocket-Key`, yêu cầu upgrade protocol lên WebSocket.
2. Sau khi server nhận request này, sẽ thực hiện upgrade protocol. Nếu hỗ trợ WebSocket, sẽ reply HTTP status code 101. Response header chứa các field như `Connection: Upgrade` và `Sec-WebSocket-Accept: xxx`, cho biết đã upgrade thành công lên WebSocket protocol.
3. Client và server thiết lập WebSocket connection, có thể tiến hành bidirectional data transmission. Data được truyền dưới dạng frames (chứ không phải HTTP request và response truyền thống). Mỗi WebSocket message có thể được chia thành nhiều data frames (minimum unit). Sender sẽ chia message thành nhiều frame gửi đến receiver. Receiver nhận message frames và reassemble các frame liên quan thành complete message.
4. Client hoặc server có thể chủ động gửi close frame để ngắt kết nối. Sau khi phía còn lại nhận được, cũng reply close frame, rồi cả hai đóng TCP connection.

Ngoài ra, sau khi thiết lập WebSocket connection, cần dùng heartbeat mechanism để duy trì sự ổn định và hoạt động của WebSocket connection.

Integrate WebSocket trong SpringBoot, trước tiên import WebSocket related toolkit. So với SSE có development cost thêm.

```xml
<!-- Import websocket -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

Server side dùng annotation `@ServerEndpoint` để đánh dấu class hiện tại là WebSocket server. Client có thể kết nối đến WebSocket server qua `ws://localhost:7777/webSocket/10086`.

```java
@Component
@Slf4j
@ServerEndpoint("/websocket/{userId}")
public class WebSocketServer {
    // Connection session với một client cụ thể, cần dùng nó để gửi data cho client
    private Session session;
    private static final CopyOnWriteArraySet<WebSocketServer> webSockets = new CopyOnWriteArraySet<>();
    // Lưu online connection count
    private static final Map<String, Session> sessionPool = new HashMap<String, Session>();
    /**
     * Method được gọi khi link thành công
     */
    @OnOpen
    public void onOpen(Session session, @PathParam(value = "userId") String userId) {
        try {
            this.session = session;
            webSockets.add(this);
            sessionPool.put(userId, session);
            log.info("websocket message: New connection, total: " + webSockets.size());
        } catch (Exception e) {
        }
    }
    /**
     * Method được gọi khi nhận được message từ client
     */
    @OnMessage
    public void onMessage(String message) {
        log.info("websocket message: Received client message: " + message);
    }
    /**
     * Single-point message
     */
    public void sendOneMessage(String userId, String message) {
        Session session = sessionPool.get(userId);
        if (session != null && session.isOpen()) {
            try {
                log.info("websocket message: Single-point message: " + message);
                session.getAsyncRemote().sendText(message);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

Server side cũng cần inject `ServerEndpointExporter` — Bean này sẽ tự động register WebSocket server dùng annotation `@ServerEndpoint`.

```java
@Configuration
public class WebSocketConfiguration {

    /**
     * Dùng để register WebSocket server đã dùng @ServerEndpoint annotation
     */
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}
```

Frontend khởi tạo mở WebSocket connection và monitor connection status, nhận data từ server hoặc gửi data đến server.

```javascript
<script>
    var ws = new WebSocket('ws://localhost:7777/webSocket/10086');
    // Get connection status
    console.log('WebSocket connection status: ' + ws.readyState);
    // Monitor whether connection successful
    ws.onopen = function () {
        console.log('WebSocket connection status: ' + ws.readyState);
        // After successful connection, send some data
        ws.send('test1');
    }
    // Receive and display info sent back from server
    ws.onmessage = function (data) {
        console.log('Received message from server:');
        console.log(data);
        // Close WebSocket connection after communication complete
        ws.close();
    }
    // Monitor connection close event
    ws.onclose = function () {
        // Monitor WebSocket status throughout the process
        console.log('WebSocket connection status: ' + ws.readyState);
    }
    // Monitor and handle error event
    ws.onerror = function (error) {
        console.log(error);
    }
    function sendMessage() {
        var content = $("#message").val();
        $.ajax({
            url: '/socket/publish?userId=10086&message=' + content,
            type: 'GET',
            data: { "id": "7777", "content": content },
            success: function (data) {
                console.log(data)
            }
        })
    }
</script>
```

Page khởi tạo thiết lập WebSocket connection, sau đó có thể bidirectional communicate — hiệu quả khá tốt.

![](/images/github/javaguide/system-design/web-real-time-message-push/1460000042192395.png)

### MQTT

**MQTT protocol là gì?**

MQTT (Message Queue Telemetry Transport) là lightweight communication protocol dựa trên publish/subscribe mode, lấy message thông qua subscribing các topic tương ứng. Đây là standard transmission protocol trong IoT (Internet of Things).

Protocol này tách biệt publisher và subscriber, do đó có thể cung cấp reliable message service cho remote connected devices trong unreliable network environment. Cách dùng hơi giống MQ truyền thống.

![MQTT protocol example](/images/github/javaguide/system-design/web-real-time-message-push/1460000022986325.png)

TCP protocol nằm ở transport layer, MQTT protocol nằm ở application layer. MQTT protocol được xây dựng trên TCP/IP protocol — tức là bất cứ nơi nào hỗ trợ TCP/IP protocol stack đều có thể dùng MQTT protocol.

**Tại sao dùng MQTT protocol?**

Tại sao MQTT protocol lại được ưa chuộng đến vậy trong IoT mà không phải protocol khác, ví dụ HTTP protocol quen thuộc hơn?

- Đầu tiên HTTP protocol là synchronous protocol — client request xong phải chờ response của server. Trong môi trường IoT, device bị ảnh hưởng nhiều bởi môi trường như bandwidth thấp, network latency cao, network communication không ổn định. Rõ ràng async message protocol phù hợp hơn cho IoT application.
- HTTP là one-way. Nếu muốn lấy message, client phải tự initiate connection. Trong IoT application, device hoặc sensor thường là client, có nghĩa là chúng không thể bị động nhận command từ network.
- Thường cần gửi một command hoặc message đến tất cả device trên network. HTTP triển khai tính năng như vậy không chỉ rất khó mà chi phí cũng rất cao.

Chi tiết về MQTT protocol introduction và practice, ở đây tôi không lặp lại nữa. Mọi người có thể tham khảo hai bài tôi viết trước, bên trong cũng viết khá chi tiết.

- MQTT protocol introduction: [SpringBoot + RabbitMQ cho smart home, thật ra đơn giản vậy](https://mp.weixin.qq.com/s/udFE6k9pPetIWsa6KeErrA)
- MQTT triển khai message push: [Unread messages (red dot), frontend và RabbitMQ real-time message push practice — cực đơn giản](https://mp.weixin.qq.com/s/U-fUGr9i1MVa4PoVyiDFCg)

## Tổng kết

> Nội dung dưới đây do JavaGuide bổ sung

|               | Giới thiệu                                                                                                                                                                            | Ưu điểm                                      | Nhược điểm                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------- |
| Short Polling | Client định kỳ gửi request đến server, server trả về response data ngay (dù không có data update)                                                                                     | Đơn giản, dễ hiểu, dễ triển khai             | Real-time kém, quá nhiều invalid request, kết nối liên tục tốn nhiều resource     |
| Long Polling  | Khác với short polling, long polling sau khi nhận request từ client đợi đến khi có data update mới trả về                                                                             | Giảm invalid request                         | Treo request gây lãng phí resource                                                |
| iframe Stream | Server và client tạo long connection, server liên tục truyền data đến `iframe`                                                                                                        | Đơn giản, dễ hiểu, dễ triển khai             | Duy trì long connection tăng overhead, hiệu quả kém (biểu tượng xoay không ngừng) |
| SSE           | One-way message push từ server side đến client (browser)                                                                                                                              | Đơn giản, dễ triển khai, tính năng phong phú | Không hỗ trợ bidirectional communication                                          |
| WebSocket     | Ngoài lần đầu thiết lập connection dùng HTTP protocol, các lần khác đều trực tiếp dùng TCP protocol để communicate. Có thể triển khai full-duplex communication giữa client và server | Hiệu năng cao, overhead nhỏ                  | Yêu cầu developer cao hơn, triển khai tương đối phức tạp hơn                      |
| MQTT          | Lightweight communication protocol dựa trên publish/subscribe mode, lấy message thông qua subscribing topic tương ứng                                                                 | Mature and stable, lightweight               | Yêu cầu developer cao hơn, triển khai tương đối phức tạp hơn                      |

<!-- @include: @article-footer.snippet.md -->
