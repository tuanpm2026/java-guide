---
title: Tổng hợp các khái niệm cốt lõi của Git
description: Tổng hợp các khái niệm cốt lõi và workflow của Git, bao gồm branch và merge, quản lý commit và giải quyết conflict, giúp nâng cao cộng tác nhóm và chất lượng code.
category: Dev Tools
tag:
  - Git
head:
  - - meta
    - name: keywords
      content: Git,version control,distributed,branch,commit,merge,conflict resolution,workflow
---

## Version Control

### Version control là gì?

Version control là một hệ thống ghi lại những thay đổi về nội dung của một hoặc nhiều file, để có thể xem lại các phiên bản cụ thể trong tương lai. Ngoài source code của project, bạn có thể thực hiện version control cho bất kỳ loại file nào.

### Tại sao cần version control?

Với nó, bạn có thể khôi phục file về trạng thái trước đó, thậm chí rollback toàn bộ project về một thời điểm trong quá khứ. Bạn có thể so sánh chi tiết những thay đổi của file, tìm xem ai đã sửa chỗ nào lần cuối, từ đó tìm ra nguyên nhân gây ra vấn đề kỳ lạ, hay ai đã báo cáo một bug nào đó vào lúc nào...

### Local version control systems

Nhiều người có thói quen lưu các phiên bản khác nhau bằng cách copy toàn bộ thư mục project, có khi còn đổi tên thêm thời gian backup để phân biệt. Cách này ưu điểm duy nhất là đơn giản, nhưng rất dễ mắc lỗi. Đôi khi nhầm lẫn thư mục đang làm việc, lỡ tay viết nhầm file hoặc ghi đè file không mong muốn.

Để giải quyết vấn đề này, người ta từ lâu đã phát triển nhiều loại local version control systems, hầu hết dùng database đơn giản để lưu lại các thay đổi của file qua các lần update.

![Local version control system](/images/github/javaguide/tools/git/%E6%9C%AC%E5%9C%B0%E7%89%88%E6%9C%AC%E6%8E%A7%E5%88%B6%E7%B3%BB%E7%BB%9F.png)

### Centralized version control systems

Tiếp theo mọi người lại gặp một vấn đề: làm thế nào để developers trên các hệ thống khác nhau cộng tác với nhau? Vì vậy, Centralized Version Control Systems (CVCS) ra đời.

Các CVCS đều có một server tập trung duy nhất, lưu tất cả các phiên bản của file, còn những người cộng tác kết nối vào server đó qua client, lấy về file mới nhất hoặc submit các cập nhật.

![Centralized version control system](/images/github/javaguide/tools/git/%E9%9B%86%E4%B8%AD%E5%8C%96%E7%9A%84%E7%89%88%E6%9C%AC%E6%8E%A7%E5%88%B6%E7%B3%BB%E7%BB%9F.png)

Cách này tuy giải quyết được vấn đề local VCS không cho phép developers trên các hệ thống khác nhau cộng tác, nhưng vẫn còn các vấn đề:

- **Single point of failure:** Central server down, người khác không thể dùng được; nếu đĩa central database bị hỏng mà không backup, sẽ mất hết dữ liệu. Local VCS cũng có vấn đề tương tự, chỉ cần toàn bộ lịch sử project được lưu ở một nơi duy nhất là có nguy cơ mất hết lịch sử cập nhật.
- **Phải kết nối mạng mới dùng được:** Bị ảnh hưởng bởi tình trạng mạng và bandwidth.

### Distributed version control systems

Vì vậy Distributed Version Control Systems (DVCS) ra đời. Git là một DVCS điển hình.

Trong loại hệ thống này, client không chỉ pull về bản snapshot mới nhất của file, mà mirror toàn bộ repository. Như vậy, bất kỳ server cộng tác nào bị lỗi, sau đó đều có thể khôi phục từ bất kỳ local repository nào đã mirror. Vì mỗi lần clone thực ra là một bản backup đầy đủ của repository.

![Distributed version control system](/images/github/javaguide/tools/git/%E5%88%86%E5%B8%83%E5%BC%8F%E7%89%88%E6%9C%AC%E6%8E%A7%E5%88%B6%E7%B3%BB%E7%BB%9F.png)

DVCS có thể làm việc không cần kết nối mạng, vì mỗi người đều có full version repository trên máy của mình. Khi bạn sửa một file, chỉ cần push thay đổi của mình cho người khác là xong. Nhưng trong thực tế khi dùng DVCS, hiếm khi push trực tiếp, mà thường dùng một server giữ vai trò "central server". Server này chỉ đơn giản là để "trao đổi" thay đổi giữa mọi người, không có nó mọi người vẫn làm việc bình thường, chỉ là trao đổi thay đổi bất tiện hơn thôi.

Ưu thế của DVCS không chỉ là không cần mạng, chúng ta sẽ còn thấy các tính năng cực mạnh như branch management của Git.

## Làm quen với Git

### Lịch sử Git

Linux kernel project lúc đó dùng DVCS BitKeeper để quản lý và maintain code. Nhưng sau đó công ty thương mại phát triển BitKeeper kết thúc hợp tác với cộng đồng Linux kernel open source, họ thu hồi quyền Linux kernel community dùng BitKeeper miễn phí. Cộng đồng Linux open source (đặc biệt là Linus Torvalds - cha đẻ Linux) dựa trên bài học kinh nghiệm từ BitKeeper, phát triển hệ thống version của riêng mình, và có nhiều cải tiến đáng kể so với VCS mới.

### Điểm khác biệt chính giữa Git và các VCS khác

Git khác biệt đáng kể so với các VCS khác trong cách lưu và đối xử với thông tin, dù cú pháp command có vẻ rất giống. Hiểu những điểm khác biệt này sẽ giúp tránh nhầm lẫn khi sử dụng.

Điểm khác biệt chính giữa Git và các VCS khác: **cách đối xử với dữ liệu**.

**Git lưu trực tiếp bằng cách ghi snapshot, không phải diff. Mình sẽ giải thích chi tiết sự khác biệt của hai cách này.**

Hầu hết các VCS (CVS, Subversion, Perforce, Bazaar...) đều lưu thông tin dưới dạng danh sách thay đổi file. Các hệ thống này **coi thông tin lưu trữ như là một tập file cơ bản và mỗi file tích lũy dần các sự thay đổi theo thời gian.**

Nguyên lý cụ thể như hình dưới, hiểu thực ra rất đơn giản, mỗi khi chúng ta commit update một file, hệ thống sẽ ghi lại những thay đổi nào đã được thực hiện với file đó, biểu diễn bằng ký hiệu delta Δ.

![](/images/github/javaguide/tools/git/2019-3deltas.png)

**Làm thế nào để có được phiên bản cuối cùng của một file?**

Rất đơn giản, kiến thức toán THPT cơ bản, chỉ cần cộng file gốc với tất cả các delta đó là được.

**Cách này có vấn đề gì không?**

Ví dụ nếu chúng ta có rất rất nhiều delta, muốn lấy file cuối cùng sẽ tốn thời gian và performance.

Git không đối xử hoặc lưu dữ liệu theo cách trên. Thay vào đó, Git giống như coi dữ liệu là một tập snapshot của filesystem nhỏ. Mỗi lần bạn commit, hoặc lưu trạng thái project trong Git, nó chủ yếu tạo ra một snapshot của toàn bộ file tại thời điểm đó và lưu index của snapshot. Để hiệu quả, nếu file không thay đổi, Git không lưu lại file đó mà chỉ giữ một link trỏ đến file đã lưu trước đó. Git đối xử với dữ liệu giống như một **stream snapshot** hơn.

![](/images/github/javaguide/tools/git/2019-3snapshots.png)

### Ba trạng thái của Git

Git có ba trạng thái, file của bạn có thể ở một trong các trạng thái:

1. **Committed**: Dữ liệu đã được lưu an toàn vào local database.
2. **Modified**: Đã sửa file nhưng chưa lưu vào database.
3. **Staged**: Đã đánh dấu phiên bản hiện tại của file đã sửa để đưa vào snapshot của lần commit tiếp theo.

Từ đó dẫn đến khái niệm về ba vùng làm việc của Git project: **Git repository (.git directory)**, **Working Directory** và **Staging Area**.

![](/images/github/javaguide/tools/git/2019-3areas.png)

**Basic Git workflow như sau:**

1. Sửa file trong working directory.
2. Stage file, đặt snapshot của file vào staging area.
3. Commit, lấy file từ staging area và lưu snapshot vĩnh viễn vào Git repository directory.

## Git Quick Start

### Lấy Git repository

Có hai cách lấy Git project repository.

1. Khởi tạo repository trong thư mục hiện có: Vào thư mục project chạy lệnh `git init`, lệnh này sẽ tạo một thư mục con tên `.git`.
2. Clone một Git repository hiện có từ server: `git clone [url]`. Tự đặt tên cho local repository: `git clone [url] directoryname`

### Ghi lại mỗi lần cập nhật vào repository

1. **Kiểm tra trạng thái file hiện tại**: `git status`
2. **Staging các thay đổi (thêm vào staging area)**: `git add filename` (cho file cụ thể), `git add *` (tất cả file), `git add *.txt` (hỗ trợ wildcard, tất cả file .txt)
3. **Bỏ qua file**: File `.gitignore`
4. **Commit**: `git commit -m "commit message"` (Trước mỗi lần commit, dùng `git status` để kiểm tra xem đã staged hết chưa, sau đó chạy commit command)
5. **Bỏ qua staging area khi update**: `git commit -a -m "commit message"`. Thêm option `-a` vào `git commit`, Git sẽ tự động stage tất cả file đang được tracked rồi commit, bỏ qua bước `git add`.
6. **Xóa file**: `git rm filename` (Xóa khỏi staging area, sau đó commit.)
7. **Đổi tên file**: `git mv README.md README` (Lệnh này tương đương tập hợp của ba lệnh `mv README.md README`, `git rm README.md`, `git add README`)

### Một Git commit message tốt

Một Git commit message tốt trông như thế này:

```plain
Tiêu đề: Dùng dòng này để mô tả và giải thích commit này

Phần thân có thể là vài dòng, thêm chi tiết để giải thích commit, tốt nhất là đưa ra context liên quan hoặc giải thích commit này fix và giải quyết vấn đề gì.

Phần thân tất nhiên có thể có vài đoạn, nhưng nhất định chú ý xuống dòng và câu không quá dài. Vì như vậy khi dùng "git log" sẽ trông gọn hơn.
```

Mô tả tiêu đề commit nên càng rõ ràng càng tốt và tóm tắt trong một câu. Như vậy tiện cho các Git log viewer tools hiển thị và người khác đọc.

### Push thay đổi lên remote repository

- Nếu bạn chưa clone existing repository và muốn kết nối repository của mình với một remote server, có thể dùng lệnh: `git remote add origin <server>`. Ví dụ muốn liên kết local repository với repository trên GitHub: `git remote add origin https://github.com/Snailclimb/test.git`
- Push các thay đổi này lên remote repository: `git push origin master` (có thể thay _master_ bằng branch bất kỳ bạn muốn push)

  Như vậy bạn có thể push thay đổi của mình lên server đã thêm vào.

### Xóa và đổi tên remote repository

- Đổi tên test thành test1: `git remote rename test test1`
- Xóa remote repository test1: `git remote rm test1`

### Xem commit history

Sau khi commit nhiều lần, hoặc clone một project, có thể bạn muốn xem lại commit history. Công cụ đơn giản và hiệu quả nhất cho việc này là lệnh `git log`. `git log` sẽ liệt kê tất cả các update theo thứ tự thời gian commit, mới nhất ở trên cùng.

**Có thể thêm một số params để xem nội dung mong muốn:**

Chỉ xem commit record của một người:

```shell
git log --author=bob
```

### Undo operations

Đôi khi sau khi commit xong mới nhận ra quên thêm vài file, hoặc commit message viết sai. Lúc này có thể chạy commit command với option `--amend` để commit lại:

```shell
git commit --amend
```

Unstage file:

```shell
git reset filename
```

Undo sửa đổi file:

```shell
git checkout -- filename
```

Nếu muốn bỏ hết tất cả thay đổi và commit local, lấy phiên bản history mới nhất từ server và trỏ local main branch vào nó:

```shell
git fetch origin
git reset --hard origin/master
```

### Branches

Branch được dùng để cô lập phát triển feature. Khi tạo repository, _master_ là branch "mặc định". Phát triển trên các branch khác, hoàn thành rồi merge vào main branch.

Thông thường khi phát triển feature mới, fix một urgent bug... chúng ta chọn tạo branch. Single-branch hay multi-branch development tốt hơn, vẫn phụ thuộc vào scenario cụ thể.

Tạo một branch tên là test:

```shell
git branch test
```

Switch branch hiện tại sang test (khi bạn switch branch, Git sẽ reset working directory để trông giống như lần commit cuối cùng trên branch đó. Git sẽ tự động add, delete, modify file để đảm bảo working directory lúc này y hệt lần commit cuối của branch đó):

```shell
git checkout test
```

![](/images/github/javaguide/tools/git/2019-3%E5%88%87%E6%8D%A2%E5%88%86%E6%94%AF.png)

Bạn cũng có thể tạo branch và switch sang ngay (kết hợp hai lệnh trên):

```shell
git checkout -b feature_x
```

Switch về main branch:

```shell
git checkout master
```

Merge branch (có thể có conflict):

```shell
 git merge test
```

Xóa branch:

```shell
git branch -d feature_x
```

Push branch lên remote repository (sau khi push thành công người khác có thể thấy):

```shell
git push origin
```

## Tài liệu học tập được khuyến nghị

**Công cụ học tập demo online:**

"Bổ sung từ [issue729](https://github.com/Snailclimb/JavaGuide/issues/729)" Learn Git Branching <https://oschina.gitee.io/learn-git-branching/>. Website này có thể demo tiện lợi các thao tác Git cơ bản, giải thích rõ ràng. Action và kết quả của từng command cơ bản.

**Đọc thêm:**

- [Git入门图文教程(1.5W字 40图)](https://www.cnblogs.com/anding/p/16987769.html): Bài viết rất công phu, nội dung đầy đủ kèm hình minh họa chi tiết, rất đáng đọc!
- [Git - Simple Guide](https://rogerdudler.github.io/git-guide/index.zh.html): Bao gồm các thao tác Git phổ biến, rất rõ ràng.
- [Git Illustrated](https://marklodato.github.io/visual-git-guide/index-zh-cn.html): Minh họa các lệnh phổ biến nhất trong Git. Nếu bạn đã hiểu sơ qua về hoạt động của Git, bài này giúp bạn hiểu sâu hơn.
- [Git Tutorial Anyone Can Understand](https://backlog.com/git-tutorial/cn/intro/intro1_1.html): Giải thích thú vị.
- [Pro Git book](https://git-scm.com/book/zh/v2): Cuốn sách Git nước ngoài, đã được dịch ra nhiều ngôn ngữ, chất lượng cao.

<!-- @include: @article-footer.snippet.md -->
