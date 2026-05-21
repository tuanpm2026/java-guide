---
title: Kiến thức cơ bản J2EE
description: Giải thích chi tiết kiến thức cơ bản J2EE, bao gồm vòng đời Servlet, chuyển tiếp yêu cầu và chuyển hướng, cơ chế Session và Cookie cùng các khái niệm cốt lõi của Java Web.
category: Thiết kế hệ thống
head:
  - - meta
    - name: keywords
      content: J2EE,Java Web,Servlet,JSP,HTTP请求响应,Servlet生命周期,Session,Cookie
---

# Tổng kết Servlet

Trong chương trình Java Web, **Servlet** chủ yếu chịu trách nhiệm nhận yêu cầu từ người dùng `HttpServletRequest`, xử lý trong `doGet()`, `doPost()` và phản hồi `HttpServletResponse` về cho người dùng. **Servlet** có thể thiết lập các tham số khởi tạo để sử dụng nội bộ. Một lớp Servlet chỉ có một thể hiện duy nhất, khi khởi tạo sẽ gọi phương thức `init()`, khi hủy sẽ gọi phương thức `destroy()`**. **Servlet cần được cấu hình trong web.xml (khi tạo Servlet trong MyEclipse sẽ tự động cấu hình), **một Servlet có thể thiết lập nhiều URL truy cập**. **Servlet không an toàn với đa luồng**, vì vậy cần thận trọng khi sử dụng biến lớp.

## Trình bày sự khác biệt giữa Servlet và CGI?

### Nhược điểm của CGI

1. Cần khởi động một tiến trình hệ thống chạy chương trình CGI cho mỗi yêu cầu. Nếu yêu cầu đến thường xuyên, điều này sẽ gây ra chi phí rất lớn.

2. Cần tải và chạy một chương trình CGI cho mỗi yêu cầu, điều này tạo ra chi phí rất lớn.

3. Cần viết lại mã xử lý giao thức mạng và mã hóa, đây là những công việc rất tốn thời gian.

### Ưu điểm của Servlet

1. Chỉ cần khởi động một tiến trình hệ thống và tải một JVM, giảm đáng kể chi phí hệ thống.

2. Khi nhiều yêu cầu cần xử lý giống nhau, chỉ cần tải một lớp duy nhất, giảm đáng kể chi phí.

3. Tất cả các lớp được tải động có thể dùng chung việc xử lý giao thức mạng và giải mã yêu cầu, giảm đáng kể khối lượng công việc.

4. Servlet có thể tương tác trực tiếp với máy chủ Web, còn các chương trình CGI thông thường thì không. Servlet còn có thể chia sẻ dữ liệu giữa các chương trình, giúp dễ dàng triển khai các tính năng như connection pool.

Bổ sung: Sun Microsystems phát hành công nghệ Servlet năm 1996 chính là để cạnh tranh với CGI. Servlet là một chương trình Java đặc biệt, một ứng dụng Web dựa trên Java thường chứa một hoặc nhiều lớp Servlet. Servlet không thể tự tạo và thực thi, nó chạy trong container Servlet, container sẽ truyền yêu cầu người dùng đến chương trình Servlet và gửi phản hồi của Servlet trở lại người dùng. Thông thường một Servlet sẽ liên kết với một hoặc nhiều trang JSP. Trước đây CGI thường bị chỉ trích vì vấn đề hiệu năng, nhưng Fast CGI đã giải quyết được vấn đề hiệu quả của CGI từ lâu rồi, vì vậy khi phỏng vấn không cần phải tùy tiện chỉ trích CGI, thực tế có rất nhiều trang web quen thuộc của bạn đang sử dụng công nghệ CGI.

Tham khảo: 《javaweb 整合开发王者归来》P7

## Servlet interface có những phương thức nào và khám phá vòng đời Servlet

Servlet interface định nghĩa 5 phương thức, trong đó **ba phương thức đầu liên quan đến vòng đời Servlet**:

- `void init(ServletConfig config) throws ServletException`
- `void service(ServletRequest req, ServletResponse resp) throws ServletException, java.io.IOException`
- `void destroy()`
- `java.lang.String getServletInfo()`
- `ServletConfig getServletConfig()`

**Vòng đời:** **Sau khi Web container tải Servlet và khởi tạo thể hiện, vòng đời Servlet bắt đầu**, container chạy phương thức **init()** để khởi tạo Servlet; khi yêu cầu đến, phương thức **service()** của Servlet được gọi, phương thức service() sẽ gọi **doGet hoặc doPost** tương ứng với yêu cầu; khi máy chủ tắt hoặc dự án bị gỡ cài đặt, máy chủ sẽ hủy thể hiện Servlet, lúc này phương thức **destroy()** của Servlet sẽ được gọi. **Phương thức init và destroy chỉ thực thi một lần, phương thức service thực thi mỗi khi client gửi yêu cầu đến Servlet**. Đôi khi trong Servlet cần sử dụng một số tài nguyên cần khởi tạo và hủy, do đó có thể đặt mã khởi tạo tài nguyên vào phương thức init, mã hủy tài nguyên vào phương thức destroy, như vậy không cần khởi tạo và hủy tài nguyên mỗi lần xử lý yêu cầu client.

Tham khảo: 《javaweb 整合开发王者归来》P81

## Sự khác biệt giữa GET và POST

Vấn đề này được thảo luận khá sôi nổi trên Zhihu, địa chỉ: <https://www.zhihu.com/question/28586791>.

![](https://static001.geekbang.org/infoq/04/0454a5fff1437c32754f1dfcc3881148.png)

GET và POST là hai phương thức yêu cầu thường dùng trong giao thức HTTP, chúng có các đặc điểm và cách dùng khác nhau trong các tình huống và mục đích khác nhau. Nhìn chung, có thể phân biệt chúng qua một số khía cạnh sau:

- Sự khác biệt về ngữ nghĩa: GET thường dùng để lấy hoặc truy vấn tài nguyên, còn POST thường dùng để tạo hoặc sửa đổi tài nguyên. Yêu cầu GET nên là idempotent, tức là thực hiện nhiều lần không thay đổi trạng thái tài nguyên, còn yêu cầu POST có thể có tác dụng phụ, tức là mỗi lần thực hiện có thể tạo ra kết quả khác nhau hoặc ảnh hưởng đến trạng thái tài nguyên.
- Sự khác biệt về định dạng: Tham số của yêu cầu GET thường đặt trong URL, tạo thành query string, còn tham số của yêu cầu POST thường đặt trong body của yêu cầu, có thể có nhiều định dạng mã hóa như application/x-www-form-urlencoded, multipart/form-data, application/json, v.v. Độ dài URL của yêu cầu GET bị giới hạn bởi trình duyệt và máy chủ, còn kích thước body của yêu cầu POST không có giới hạn rõ ràng.
- Sự khác biệt về cache: Vì yêu cầu GET là idempotent, nó có thể được trình duyệt hoặc các node trung gian (như proxy, gateway) cache lại để tăng hiệu năng và hiệu quả. Còn yêu cầu POST không phù hợp để cache, vì nó có thể có tác dụng phụ, mỗi lần thực hiện có thể cần phản hồi thời gian thực.
- Sự khác biệt về bảo mật: Cả yêu cầu GET và POST đều không tuyệt đối an toàn, vì giao thức HTTP bản thân truyền dữ liệu dạng văn bản thuần, dù là URL, header hay body đều có thể bị đánh cắp hoặc giả mạo. Để đảm bảo bảo mật, phải sử dụng giao thức HTTPS để mã hóa dữ liệu truyền. Tuy nhiên, trong một số tình huống, yêu cầu GET dễ làm lộ dữ liệu nhạy cảm hơn so với POST, vì tham số của GET xuất hiện trong URL, và URL có thể được ghi lại trong lịch sử trình duyệt, log máy chủ, log proxy, v.v. Do đó, thông thường nên dùng POST + body để truyền dữ liệu riêng tư.

Điểm quan trọng là hiểu rõ sự khác biệt về ngữ nghĩa giữa hai phương thức. Tuy nhiên, cũng có một số dự án dùng POST cho tất cả yêu cầu, điều này không cố định, miễn là nhóm dự án thống nhất với nhau.

## Khi nào gọi doGet() và doPost()

Khi thuộc tính method của thẻ Form là get thì gọi doGet(), khi là post thì gọi doPost().

## Sự khác biệt giữa Chuyển tiếp (Forward) và Chuyển hướng (Redirect)

**Chuyển tiếp là hành vi của máy chủ, chuyển hướng là hành vi của client.**

**Chuyển tiếp (Forward)**
Được thực hiện thông qua phương thức forward(HttpServletRequest request, HttpServletResponse response) của đối tượng RequestDispatcher. RequestDispatcher có thể lấy được thông qua phương thức getRequestDispatcher() của HttpServletRequest. Ví dụ đoạn mã dưới đây chuyển đến trang login_success.jsp.

```java
     request.getRequestDispatcher("login_success.jsp").forward(request, response);
```

**Chuyển hướng (Redirect)** được thực hiện bằng cách sử dụng mã trạng thái do máy chủ trả về. Khi trình duyệt client gửi yêu cầu đến máy chủ, máy chủ sẽ trả về một mã trạng thái. Máy chủ thiết lập mã trạng thái thông qua phương thức `setStatus(int status)` của `HttpServletResponse`. Nếu máy chủ trả về 301 hoặc 302, trình duyệt sẽ gửi yêu cầu mới đến địa chỉ mới để lấy tài nguyên đó.

1. **Về hiển thị thanh địa chỉ**

   forward là máy chủ yêu cầu tài nguyên, máy chủ trực tiếp truy cập URL đích, đọc nội dung phản hồi của URL đó rồi gửi nội dung này đến trình duyệt. Trình duyệt hoàn toàn không biết nội dung máy chủ gửi đến từ đâu, vì vậy thanh địa chỉ vẫn là địa chỉ ban đầu.
   redirect là máy chủ dựa vào logic gửi một mã trạng thái, báo cho trình duyệt yêu cầu lại địa chỉ đó. Do đó thanh địa chỉ hiển thị URL mới.

2. **Về chia sẻ dữ liệu**

   forward: Trang chuyển tiếp và trang được chuyển tiếp đến có thể dùng chung dữ liệu trong request.
   redirect: Không thể chia sẻ dữ liệu.

3. **Về phạm vi sử dụng**

   forward: Thường dùng khi người dùng đăng nhập, chuyển tiếp đến module tương ứng theo vai trò.
   redirect: Thường dùng khi người dùng đăng xuất và quay về trang chủ, hoặc chuyển đến các trang web khác.

4. Về hiệu quả

   forward: Cao.
   redirect: Thấp.

## Tự động làm mới (Refresh)

Tự động làm mới không chỉ có thể thực hiện chuyển trang tự động sau một khoảng thời gian, mà còn có thể tự động làm mới trang hiện tại sau một khoảng thời gian. Trong Servlet, tự động làm mới được thực hiện bằng cách thiết lập thuộc tính Header thông qua đối tượng HttpServletResponse, ví dụ:

```java
Response.setHeader("Refresh","5;URL=http://localhost:8080/servlet/example.htm");
```

Trong đó 5 là thời gian tính bằng giây. URL chỉ định trang muốn chuyển đến (nếu thiết lập đường dẫn của chính mình, sẽ thực hiện tự động làm mới trang hiện tại 5 giây một lần).

## Servlet và an toàn luồng

**Servlet không an toàn với đa luồng, việc đọc ghi đồng thời với đa luồng sẽ gây ra vấn đề dữ liệu không đồng bộ.** Giải pháp là hạn chế định nghĩa thuộc tính name, mà nên khai báo biến name riêng lẻ trong các phương thức doGet() và doPost(). Mặc dù dùng khối lệnh synchronized(name){} có thể giải quyết vấn đề, nhưng sẽ gây ra việc chờ đợi của luồng, không phải là giải pháp khoa học.
Lưu ý: Đọc ghi đồng thời với đa luồng vào thuộc tính lớp Servlet sẽ gây ra dữ liệu không đồng bộ. Nhưng nếu chỉ đọc đồng thời mà không ghi, thì không có vấn đề dữ liệu không đồng bộ. Vì vậy các thuộc tính chỉ đọc trong Servlet tốt nhất nên khai báo là kiểu final.

Tham khảo: 《javaweb 整合开发王者归来》P92

## Mối quan hệ giữa JSP và Servlet

Thực ra vấn đề này đã được giải thích ở trên rồi. Servlet là một chương trình Java đặc biệt, nó chạy trên JVM của máy chủ, có thể cung cấp nội dung hiển thị cho trình duyệt với sự hỗ trợ của máy chủ. JSP về bản chất là một dạng đơn giản hóa của Servlet, JSP sẽ được máy chủ xử lý thành một chương trình Java tương tự Servlet, có thể đơn giản hóa việc tạo nội dung trang. Điểm khác biệt chính giữa Servlet và JSP là logic ứng dụng của Servlet nằm trong file Java và hoàn toàn tách biệt khỏi HTML trong tầng trình bày. Còn JSP là Java và HTML có thể kết hợp thành một file có phần mở rộng .jsp. Có người nói Servlet là viết HTML trong Java, còn JSP là viết mã Java trong HTML, tất nhiên đây là cách nói rất phiến diện và không chính xác. JSP thiên về view, Servlet thiên về logic điều khiển, trong mô hình kiến trúc MVC, JSP phù hợp đóng vai trò view còn Servlet phù hợp đóng vai trò controller.

## Nguyên lý hoạt động của JSP

JSP là một loại Servlet, nhưng cách hoạt động khác với HttpServlet. HttpServlet được biên dịch từ mã nguồn thành file class trước rồi mới triển khai lên máy chủ, tức là biên dịch trước rồi triển khai. Còn JSP thì triển khai trước rồi biên dịch. JSP sẽ được biên dịch thành lớp HttpJspPage (một lớp con của interface Servlet) lần đầu tiên client truy cập file JSP. Lớp này sẽ được máy chủ tạm thời lưu trong thư mục làm việc của máy chủ. Dưới đây chúng ta tìm hiểu qua ví dụ cụ thể.
Trong dự án JspLoginDemo có một file JSP tên login.jsp, sau khi triển khai dự án lên máy chủ lần đầu và truy cập file JSP này, chúng ta thấy thư mục đó có thêm hai file như hình dưới.
File .class chính là Servlet tương ứng với JSP. Sau khi biên dịch xong sẽ chạy file class để phản hồi yêu cầu client. Sau đó khi client truy cập login.jsp, Tomcat sẽ không biên dịch lại file JSP mà sẽ trực tiếp gọi file class để phản hồi yêu cầu client.

![Nguyên lý hoạt động của JSP](https://oss.javaguide.cn/github/javaguide/1.jpeg)

Vì JSP chỉ được biên dịch lần đầu tiên client yêu cầu, nên lần đầu truy cập JSP sẽ thấy khá chậm, sau đó sẽ cảm thấy nhanh hơn nhiều. Nếu xóa file class mà máy chủ đang lưu, máy chủ cũng sẽ biên dịch lại JSP.

Khi phát triển ứng dụng Web thường xuyên cần sửa đổi JSP. Tomcat có thể tự động phát hiện sự thay đổi của chương trình JSP. Nếu phát hiện mã nguồn JSP thay đổi, Tomcat sẽ biên dịch lại JSP trong lần client tiếp theo yêu cầu JSP mà không cần khởi động lại Tomcat. Tính năng tự động phát hiện này mặc định được bật, việc phát hiện thay đổi tiêu tốn một ít thời gian, có thể tắt nó trong web.xml khi triển khai ứng dụng Web.

Tham khảo: 《javaweb 整合开发王者归来》P97

## JSP có những đối tượng nội tại nào và tác dụng của chúng

[JSP 内置对象 - CSDN 博客](http://blog.csdn.net/qq_34337272/article/details/64310849)

JSP có 9 đối tượng nội tại:

- request: Đóng gói yêu cầu của client, bao gồm các tham số từ yêu cầu GET hoặc POST;
- response: Đóng gói phản hồi của máy chủ đến client;
- pageContext: Thông qua đối tượng này có thể lấy các đối tượng khác;
- session: Đối tượng đóng gói phiên làm việc của người dùng;
- application: Đối tượng đóng gói môi trường chạy của máy chủ;
- out: Đối tượng luồng đầu ra để xuất phản hồi của máy chủ;
- config: Đối tượng cấu hình của ứng dụng Web;
- page: Bản thân trang JSP (tương đương với this trong chương trình Java);
- exception: Đối tượng đóng gói ngoại lệ được ném bởi trang.

## Request object có những phương thức chính nào

- `setAttribute(String name,Object)`: Thiết lập giá trị tham số request có tên là name
- `getAttribute(String name)`: Trả về giá trị thuộc tính được chỉ định bởi name
- `getAttributeNames()`: Trả về tập hợp tên tất cả thuộc tính của đối tượng request, kết quả là một thể hiện của Enumeration
- `getCookies()`: Trả về tất cả đối tượng Cookie của client, kết quả là một mảng Cookie
- `getCharacterEncoding()`: Trả về phương thức mã hóa ký tự trong yêu cầu = getContentLength()`: Trả về độ dài Body của yêu cầu
- `getHeader(String name)`: Lấy thông tin tiêu đề file được định nghĩa bởi giao thức HTTP
- `getHeaders(String name)`: Trả về tất cả giá trị của request Header có tên chỉ định, kết quả là một thể hiện của Enumeration
- `getHeaderNames()`: Trả về tên tất cả request Header, kết quả là một thể hiện của Enumeration
- `getInputStream()`: Trả về luồng đầu vào của yêu cầu, dùng để lấy dữ liệu trong yêu cầu
- `getMethod()`: Lấy phương thức client truyền dữ liệu đến máy chủ
- `getParameter(String name)`: Lấy giá trị tham số có tên là name mà client truyền cho máy chủ
- `getParameterNames()`: Lấy tên tất cả tham số mà client truyền cho máy chủ, kết quả là một thể hiện của Enumeration
- `getParameterValues(String name)`: Lấy tất cả giá trị của tham số có tên là name
- `getProtocol()`: Lấy tên giao thức mà client dùng để truyền dữ liệu đến máy chủ
- `getQueryString()`: Lấy query string
- `getRequestURI()`: Lấy địa chỉ client gửi chuỗi yêu cầu
- `getRemoteAddr()`: Lấy địa chỉ IP của client
- `getRemoteHost()`: Lấy tên của client
- `getSession([Boolean create])`: Trả về Session liên kết với yêu cầu
- `getServerName()`: Lấy tên máy chủ
- `getServletPath()`: Lấy đường dẫn file script mà client yêu cầu
- `getServerPort()`: Lấy số cổng của máy chủ
- `removeAttribute(String name)`: Xóa một thuộc tính trong yêu cầu

## Sự khác biệt giữa request.getAttribute() và request.getParameter()

**Về hướng lấy dữ liệu:**

`getParameter()` dùng để lấy giá trị tham số được truyền qua POST/GET;

`getAttribute()` dùng để lấy giá trị dữ liệu trong container đối tượng;

**Về mục đích sử dụng:**

`getParameter()` dùng khi client chuyển hướng, tức là khi nhấp vào liên kết hoặc nhấn nút submit để truyền giá trị, tức là dùng để nhận dữ liệu khi truyền giá trị qua form hoặc redirect url.

`getAttribute()` dùng khi chuyển hướng phía máy chủ, tức là khi dùng hàm forward trong servlet, hoặc dùng mapping.findForward trong struts. getAttribute chỉ có thể nhận giá trị được truyền qua setAttribute.

Ngoài ra, có thể dùng `setAttribute()`, `getAttribute()` để gửi và nhận đối tượng. Còn `getParameter()` rõ ràng chỉ có thể truyền chuỗi.
`setAttribute()` là ứng dụng máy chủ đặt đối tượng này vào một vùng nhớ tương ứng với trang đó, khi máy chủ trang của bạn chuyển hướng đến trang khác, ứng dụng máy chủ sẽ sao chép vùng nhớ này sang vùng nhớ tương ứng với trang khác. Như vậy `getAttribute()` có thể lấy được giá trị bạn đã thiết lập, tất nhiên phương pháp này có thể truyền đối tượng. session cũng tương tự, chỉ là vòng đời của đối tượng trong bộ nhớ khác nhau. `getParameter()` chỉ là ứng dụng máy chủ phân tích văn bản trang request bạn gửi lên, lấy giá trị bạn thiết lập trong form hoặc khi redirect url.

**Tóm lại:**

`getParameter()` trả về kiểu String, dùng để đọc giá trị từ form đã submit; (sau khi lấy sẽ chuyển đổi sang kiểu tương ứng cần thiết như kiểu số nguyên, kiểu ngày tháng, v.v.)

`getAttribute()` trả về kiểu Object, cần chuyển đổi kiểu, có thể dùng `setAttribute()` thiết lập thành bất kỳ đối tượng nào, rất linh hoạt, có thể dùng bất cứ lúc nào.

## Sự khác biệt giữa chỉ thị include và hành động include

**Chỉ thị include:** JSP có thể bao gồm các file khác thông qua chỉ thị include. File được bao gồm có thể là file JSP, file HTML hoặc file văn bản. File được bao gồm giống như một phần của file JSP đó, sẽ được biên dịch và thực thi cùng nhau. Cú pháp như sau:
<%@ include file="Đường dẫn url tương đối của file" %>

**Hành động include:** Phần tử hành động `<jsp:include>` dùng để bao gồm file tĩnh và động. Hành động này chèn file chỉ định vào trang đang tạo. Cú pháp như sau:
<jsp:include page="Địa chỉ URL tương đối" flush="true" />

## 9 đối tượng nội tại, 7 hành động, 3 chỉ thị của JSP

[Tổng kết 9 đối tượng nội tại, 7 hành động, 3 chỉ thị của JSP](http://blog.csdn.net/qq_34337272/article/details/64310849)

## Giải thích 4 phạm vi trong JSP

4 phạm vi trong JSP bao gồm page, request, session và application, cụ thể:

- **page** đại diện cho các đối tượng và thuộc tính liên quan đến một trang.
- **request** đại diện cho các đối tượng và thuộc tính liên quan đến một yêu cầu mà Web client gửi. Một yêu cầu có thể trải qua nhiều trang, liên quan đến nhiều Web component; dữ liệu tạm thời cần hiển thị trên trang có thể đặt trong phạm vi này.
- **session** đại diện cho các đối tượng và thuộc tính liên quan đến một phiên kết nối giữa một người dùng và máy chủ. Dữ liệu liên quan đến một người dùng nên được đặt trong session của chính người dùng đó.
- **application** đại diện cho các đối tượng và thuộc tính liên quan đến toàn bộ ứng dụng Web, về bản chất nó là một phạm vi toàn cục trải rộng qua toàn bộ ứng dụng Web, bao gồm nhiều trang, yêu cầu và phiên làm việc.

## Cách thực hiện chế độ đơn luồng cho JSP hoặc Servlet

Đối với trang JSP, có thể thiết lập thông qua chỉ thị page.
`<%@page isThreadSafe="false"%>`

Đối với Servlet, có thể cho Servlet tùy chỉnh thực hiện interface đánh dấu SingleThreadModel.

Lưu ý: Nếu thiết lập JSP hoặc Servlet ở chế độ đơn luồng, sẽ dẫn đến việc tạo một thể hiện Servlet cho mỗi yêu cầu, thực hành này sẽ gây ra vấn đề hiệu năng nghiêm trọng (áp lực bộ nhớ của máy chủ rất lớn, còn dẫn đến garbage collection thường xuyên), vì vậy thông thường sẽ không làm như vậy.

## Các công nghệ để thực hiện theo dõi phiên

1. **Sử dụng Cookie**

   Gửi Cookie đến client

   ```java
   Cookie c =new Cookie("name","value"); //创建Cookie
   c.setMaxAge(60*60*24); //设置最大时效，此处设置的最大时效为一天
   response.addCookie(c); //把Cookie放入到HTTP响应中
   ```

   Đọc Cookie từ client

   ```java
   String name ="name";
   Cookie[]cookies =request.getCookies();
   if(cookies !=null){
      for(int i= 0;i<cookies.length;i++){
       Cookie cookie =cookies[i];
       if(name.equals(cookis.getName()))
       //something is here.
       //you can get the value
       cookie.getValue();

      }
    }

   ```

   **Ưu điểm:** Dữ liệu có thể được lưu lâu dài, không cần tài nguyên máy chủ, đơn giản, Key-Value dạng văn bản.

   **Nhược điểm:** Kích thước bị giới hạn, người dùng có thể vô hiệu hóa chức năng Cookie, do lưu trữ cục bộ nên có một số rủi ro bảo mật.

2. URL Rewriting

   Thêm thông tin phiên của người dùng vào URL làm tham số yêu cầu, hoặc thêm ID phiên duy nhất vào cuối URL để xác định một phiên.

   **Ưu điểm:** Vẫn có thể sử dụng khi Cookie bị vô hiệu hóa.

   **Nhược điểm:** Phải mã hóa URL của trang web, tất cả trang phải được tạo động, không thể truy cập bằng URL đã ghi trước đó.

3. Trường form ẩn

   ```html
   <input type="hidden" name="session" value="..." />
   ```

   **Ưu điểm:** Có thể sử dụng khi Cookie bị vô hiệu hóa.

   **Nhược điểm:** Tất cả trang phải là kết quả sau khi submit form.

4. HttpSession

   Trong tất cả các công nghệ theo dõi phiên, đối tượng HttpSession là mạnh nhất và có nhiều tính năng nhất. Khi người dùng truy cập một trang web lần đầu tiên, HttpSession sẽ tự động được tạo, mỗi người dùng có thể truy cập HttpSession của riêng họ. Có thể lấy HttpSession thông qua phương thức getSession của đối tượng HttpServletRequest, thông qua phương thức setAttribute của HttpSession có thể đặt một giá trị vào HttpSession, thông qua phương thức getAttribute của đối tượng HttpSession cùng với tên thuộc tính có thể lấy đối tượng được lưu trong HttpSession. Khác với ba cách trên, HttpSession được lưu trong bộ nhớ của máy chủ, vì vậy không nên đặt các đối tượng quá lớn vào đó, dù container Servlet hiện tại có thể chuyển đối tượng trong HttpSession sang thiết bị lưu trữ khác khi bộ nhớ sắp đầy, điều này chắc chắn ảnh hưởng đến hiệu năng. Giá trị thêm vào HttpSession có thể là bất kỳ đối tượng Java nào, tốt nhất đối tượng này nên thực hiện interface Serializable, như vậy container Servlet khi cần có thể serialize nó ra file, nếu không khi serialize sẽ xảy ra ngoại lệ.

## Sự khác biệt giữa Cookie và Session

Cookie và Session đều là phương thức phiên để theo dõi danh tính người dùng trình duyệt, nhưng hai cái có phạm vi ứng dụng khác nhau.

**Cookie thường được dùng để lưu thông tin người dùng** ví dụ ① Chúng ta lưu thông tin người dùng đã đăng nhập vào Cookie, lần truy cập trang web tiếp theo trang có thể tự động điền một số thông tin cơ bản giúp đăng nhập; ② Hầu hết trang web đều có tính năng duy trì đăng nhập, tức là lần sau truy cập trang web không cần đăng nhập lại, điều này là do khi người dùng đăng nhập chúng ta có thể lưu một Token vào Cookie, lần đăng nhập sau chỉ cần tra cứu người dùng theo giá trị Token (vì lý do bảo mật, đăng nhập lại thường phải ghi lại Token mới); ③ Sau khi đăng nhập vào trang web một lần, truy cập các trang khác của trang web không cần đăng nhập lại. **Tác dụng chính của Session là ghi lại trạng thái người dùng ở phía máy chủ.** Tình huống điển hình là giỏ hàng, khi bạn muốn thêm hàng vào giỏ, hệ thống không biết đây là thao tác của người dùng nào, vì giao thức HTTP là stateless. Sau khi máy chủ tạo Session cụ thể cho người dùng cụ thể, có thể xác định và theo dõi người dùng này.

Dữ liệu Cookie được lưu ở phía client (trình duyệt), dữ liệu Session được lưu ở phía máy chủ.

Cookie được lưu trữ ở client, còn Session được lưu trữ trên máy chủ, tương đối mà nói Session có độ bảo mật cao hơn. Nếu dùng Cookie, không nên ghi thông tin nhạy cảm vào Cookie, tốt nhất nên mã hóa thông tin Cookie và giải mã ở phía máy chủ khi cần sử dụng.

<!-- @include: @article-footer.snippet.md -->
