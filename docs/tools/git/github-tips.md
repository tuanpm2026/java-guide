---
title: Tổng hợp các mẹo hữu dụng trên Github
description: Tổng hợp các mẹo sử dụng Github hiệu quả, bao gồm personalized homepage, automatic resume và statistics display, nâng cao trải nghiệm personal brand và open source collaboration.
category: Dev Tools
tag:
  - Git
head:
  - - meta
    - name: keywords
      content: Github tips,personal homepage,README,statistics,open source contribution,resume
---

Tôi đã dùng Github hơn 6 năm. Hôm nay không giữ lại gì, chia sẻ tất cả những Github tips tôi thấy hữu dụng cho các bạn quan tâm JavaGuide.

## Tạo Github Resume & Github Annual Report một click

Qua website [https://resume.github.io/](https://resume.github.io/) bạn có thể tạo một Github resume online chỉ trong một click.

Lúc tham gia campus recruitment, trong phần thông tin cá nhân tôi đặt một Github resume online. Tôi nghĩ điều này sẽ khiến interviewer cảm thấy bạn là người có kiến thức, tăng thêm điểm ấn tượng.

Tuy nhiên, nếu Github của bạn không có gì thì đừng đặt vào resume. Kết quả sau khi tạo như hình dưới.

![Github Resume](/images/2020-11/image-20201108192205620.png)

Qua website <https://www.githubtrends.io/wrapped>, bạn có thể tạo một Github personal annual report — annual report này sẽ liệt kê project contribution của bạn trong năm, ngôn ngữ lập trình dùng nhiều nhất, thông tin đóng góp chi tiết.

![](/images/github/dootask/image-20211226144607457.png)

## Personalize Github Homepage

Github hiện hỗ trợ custom display một số nội dung trên personal homepage. Hiệu quả hiển thị như hình dưới.

![Personalized homepage display effect](/images/java-guide-blog/image-20210616221212259.png)

Làm được điều này rất đơn giản — chỉ cần tạo một repository cùng tên với Github account của bạn, rồi customize nội dung `README.md` là được.

Nội dung custom hiển thị trên homepage của bạn chính là nội dung `README.md` (_bạn nào chưa biết Markdown syntax hãy tự phạt đứng góc tường 5 phút_).

![Tạo repository cùng tên Github account](/images/java-guide-blog/image-20201107110309341.png)

Điều này cũng có thể làm rất creative! Ví dụ thông qua open source project [github-readme-stats](https://hellogithub.com/periodical/statistics/click/?target=https://github.com/anuraghazra/github-readme-stats), bạn có thể hiển thị dynamically generated GitHub statistics trong README. Hiệu quả như hình dưới.

![Dynamically generate GitHub statistics via github-readme-stats](/images/java-guide-blog/image-20210616221312426.png)

Về personalized homepage, sẽ không nói thêm nhiều. Bạn quan tâm có thể tự nghiên cứu.

## Custom Project Badges

Các project badges bạn thấy trên Github đều được tạo qua website [https://shields.io/](https://shields.io/). Badges của project JavaGuide của tôi như hình dưới.

![Project badges](/images/2020-11/image-20201107143136559.png)

Và bạn không chỉ tạo được static badges — shield.io còn có thể dynamically read project status và tạo badges tương ứng.

![Custom project badges](/images/2020-11/image-20201107143502356.png)

Badges mô tả project status được tạo ra như hình dưới.

![Badges describing project status](/images/2020-11/image-20201107143752642.png)

## Automatically Add Contribution Charts to Projects

Thông qua tool repobeats, bạn có thể thêm biểu đồ cơ bản về project contribution như hình dưới cho Github project — khá tốt 👍

![](/images/github/dootask/repobeats.png)

Link: <https://repobeats.axiom.co/>.

## Github Emojis

![Github emojis](/images/2020-11/image-20201107162254582.png)

Nếu muốn dùng emoji trên Github, có thể tìm tại đây: [www.webfx.com/tools/emoji-cheat-sheet/](https://www.webfx.com/tools/emoji-cheat-sheet/).

![Online Github emojis](/images/2020-11/image-20201107162432941.png)

## Đọc Source Code Github Projects Hiệu Quả

Codespaces mà Github ra mắt gần đây có thể cung cấp online IDE giống VS Code, nhưng hiện chưa mở hoàn toàn.

Giới thiệu sơ qua một số cách tôi hay dùng nhất để đọc source code của Github projects.

### Chrome Plugin Octotree

Cái này đã nói nhiều lần rồi — đây là cách tôi yêu thích nhất. Sau khi dùng Octotree, sidebar của trang web sẽ hiển thị project theo dạng tree structure, mang lại trải nghiệm đọc source code như IDE.

![Chrome plugin Octotree](/images/2020-11/image-20201107144944798.png)

### Chrome Plugin SourceGraph

Khi không muốn clone project về local, tôi thường dùng cách này để đọc source code. SourceGraph không chỉ cho phép chúng ta đọc code trên Github một cách elegant, nó còn hỗ trợ một số thao tác hay như: jump giữa các classes, code search v.v.

Sau khi bạn cài plugin này, project homepage sẽ có thêm một small icon như hình dưới. Click vào icon đó là có thể đọc source code online.

![](/images/2020-11/image-20201107145749659.png)

Đọc code bằng SourceGraph trông như thế này — cũng là tree structure, nhưng cá nhân tôi cảm thấy hand-feel không bằng Octotree. Tuy nhiên, SourceGraph có nhiều plugins built-in và còn hỗ trợ jump giữa các classes!

![](/images/2020-11/image-20201107150307314.png)

### Clone project về local

Clone project về local rồi dùng IDE yêu thích để đọc. Đây có thể nói là cách sướng nhất!

Nếu muốn tìm hiểu sâu về một project nào đó, đây là lựa chọn đầu tiên. Một câu `git clone` là xong.

## Extend GitHub Functionality

**Enhanced GitHub** có thể làm Github của bạn dễ dùng hơn. Chrome plugin này có thể visualize kích thước Github repository, kích thước từng file và cho phép bạn download từng file nhanh chóng.

![](/images/2020-11/image-20201107160817672.png)

## Auto Generate Table of Contents cho Markdown Files

Nếu muốn generate table of contents cho Markdown files trên Github, dùng plugin **Markdown Preview Enhanced** của VS Code là được.

Hiệu quả của table of contents được tạo ra như hình dưới. Bạn click trực tiếp vào link trong table of contents là jump đến vị trí tương ứng trong bài, có thể optimize trải nghiệm đọc.

![](</images/2020-11/iShot2020-11-07%2016.14.14%20(1).png>)

Tuy nhiên, hiện nay Github đã tự động tạo table of contents cho Markdown files, chỉ cần click mới hiển thị.

![](/images/github/cosy/image-20211227093215005.png)

## Tận Dụng Github Explore

Thực ra, Github Explore built-in là một tính năng rất mạnh và dễ dùng. Nhưng theo quan sát của tôi, nhiều user Github trong nước không biết cái này dùng để làm gì.

Nói đơn giản, Github Explore có thể mang lại cho bạn các dịch vụ sau:

1. Có thể gợi ý projects dựa trên sở thích cá nhân của bạn;
2. Github Topics phân loại và tổng hợp một số projects theo categories/topics. Ví dụ [Data visualization](https://github.com/topics/data-visualization) tổng hợp các open source projects liên quan đến data visualization, [Awesome Lists](https://github.com/topics/awesome) tổng hợp các Awesome series repositories;
3. Thông qua Github Trending, chúng ta có thể xem một số open source projects đang hot gần đây, có thể lọc theo loại ngôn ngữ và time dimension;
4. Github Collections giống một collection folder. Ví dụ [Teaching materials for computational social science](https://github.com/collections/teaching-computational-social-science) tổng hợp các open source resources liên quan đến computer courses, [Learn to Code](https://github.com/collections/learn-to-code) tổng hợp các repositories hữu ích cho việc học lập trình;
5. ……

![](/images/github/javaguide/github-explore.png)

## GitHub Actions rất mạnh mẽ

Bạn có thể hiểu đơn giản GitHub Actions là CI/CD built-in của Github. Thông qua GitHub Actions bạn có thể trực tiếp build, test và deploy code trên GitHub, còn có thể review code, quản lý API, phân tích project dependencies. Tóm lại, GitHub Actions có thể tự động hóa giúp bạn hoàn thành nhiều việc.

Về giới thiệu chi tiết GitHub Actions, khuyến nghị đọc bài [GitHub Actions Beginner Tutorial](https://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html) của thầy Ruan Yifeng.

GitHub Actions có một official marketplace, nơi có rất nhiều Actions người khác submit — bạn có thể lấy về dùng trực tiếp.

![](/images/github/javaguide/image-20211227100147433.png)

## Lời cuối

Trong bài viết này, tôi không giữ lại gì — chia sẻ tất cả Github tips đã tổng hợp được những năm qua. Thực lòng hy vọng có ích cho mọi người. Thực lòng hy vọng mọi người nhất định phải tận dụng tốt Github — kho báu độc quyền của programmer.

Ngoài ra, trong bài viết này tôi không đề cập đến GitHub search tips. Theo tôi, không cần nhớ các commands mà các bài viết trên mạng nói — thực ra chẳng có mấy tác dụng. Bạn sẽ thấy những gì dùng nhiều nhất vẫn là keyword search và filtering feature built-in của Github.

<!-- @include: @article-footer.snippet.md -->
