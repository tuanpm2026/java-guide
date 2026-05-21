---
title: Tóm tắt kiến thức cơ bản về lập trình Shell
description: Lập trình Shell rất hữu ích trong công việc phát triển hàng ngày của chúng ta. Hiện nay, hai ngôn ngữ tự động hóa vận hành phổ biến nhất trên hệ thống Linux là Shell và Python. Bài viết này sẽ tóm tắt ngắn gọn các kiến thức cơ bản về lập trình Shell, giúp bạn bắt đầu với lập trình Shell!
category: Kiến thức cơ bản về máy tính
tag:
  - Hệ điều hành
  - Linux
head:
  - - meta
    - name: keywords
      content: Shell,脚本,命令,自动化,运维,Linux,基础语法
---

Lập trình Shell rất hữu ích trong công việc phát triển hàng ngày của chúng ta. Hiện nay, hai ngôn ngữ tự động hóa vận hành phổ biến nhất trên hệ thống Linux là Shell và Python.

Bài viết này sẽ tóm tắt ngắn gọn các kiến thức cơ bản về lập trình Shell, giúp bạn bắt đầu với lập trình Shell!

## Ghi chú về phiên bản

**Các ví dụ trong bài này áp dụng cho bash phiên bản 4.0+**. Các phiên bản bash khác nhau có thể có sự khác biệt về một số tính năng, đặc biệt là:

- **Mảng (Array)**: bash 2.0+ hỗ trợ, POSIX sh thuần túy (như dash) không hỗ trợ
- **Một số thao tác chuỗi**: như `${var:offset:length}` có thể không được hỗ trợ trong các phiên bản cũ hơn
- **Mở rộng số học `$((...))`**: bash 2.0+ hỗ trợ

Kiểm tra phiên bản bash của bạn:

```shell
bash --version
# 或
echo $BASH_VERSION
```

## Bước vào cánh cửa lập trình Shell

### Tại sao phải học Shell?

Khi học một thứ gì đó, phần lớn chúng ta đều hướng đến tính thực tiễn. Từ góc độ công việc, học Shell là để nâng cao hiệu quả làm việc, tăng năng suất, giúp chúng ta hoàn thành nhiều việc hơn trong ít thời gian hơn.

Nhiều người nói rằng lập trình Shell thuộc về kiến thức vận hành, nên để các kỹ sư vận hành làm, những người làm backend không cần học. Tôi cho rằng quan điểm này hoàn toàn sai. So với các kỹ sư chuyên vận hành Linux, yêu cầu về mức độ thành thạo Shell của chúng ta thấp hơn, nhưng lập trình Shell vẫn là thứ chúng ta bắt buộc phải nắm vững!

Hiện nay, hai ngôn ngữ tự động hóa vận hành phổ biến nhất trên hệ thống Linux là Shell và Python.

Trong hai ngôn ngữ này, Shell gần như là ngôn ngữ lập trình tự động hóa vận hành bắt buộc phải sử dụng trong các doanh nghiệp IT, đặc biệt trong các khâu giám sát dịch vụ, triển khai nghiệp vụ nhanh, khởi động/dừng dịch vụ, sao lưu và xử lý dữ liệu, phân tích log, v.v. Shell là không thể thiếu. Python phù hợp hơn để xử lý các logic nghiệp vụ phức tạp, phát triển các công cụ phần mềm vận hành phức tạp, và triển khai truy cập qua web. Shell là một bộ giải thích lệnh, giải thích và thực thi các lệnh và chương trình mà người dùng nhập vào — một phương thức đối thoại tương tác, nhập lệnh là có phản hồi ngay lập tức.

Ngoài ra, hiểu biết về lập trình shell cũng là yêu cầu tuyển dụng nhân viên backend của hầu hết các công ty internet. Hình dưới đây là ảnh chụp màn hình về yêu cầu lập trình Shell của một số công ty internet nổi tiếng mà tôi đã thu thập.

![大型互联网公司对于shell编程技能的要求](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/60190220.jpg)

### Shell là gì?

**Shell là bộ giải thích lệnh của hệ thống Linux/Unix**, đóng vai trò là cầu nối giữa người dùng và nhân hệ điều hành, chịu trách nhiệm nhận các lệnh người dùng nhập vào và gọi các chương trình tương ứng.

**Lập trình Shell** là quá trình kết hợp các lệnh, cấu trúc điều khiển (if/for/while), biến và hàm thành các script tự động hóa thông qua bộ giải thích Shell (như bash). Shell vừa là bộ giải thích lệnh, vừa là một ngôn ngữ lập trình hoàn chỉnh (hỗ trợ biến, mảng, hàm, điều khiển luồng, pipeline, chuyển hướng, v.v.).

**Các loại Shell phổ biến**:

- **bash** (Bourne Again Shell): Shell mặc định trên hệ thống Linux, được sử dụng nhiều nhất
- **sh** (Bourne Shell): Shell truyền thống của Unix, chuẩn POSIX
- **zsh**: Shell tương tác mạnh mẽ
- **dash**: Shell nhẹ, `/bin/sh` trên Ubuntu mặc định trỏ đến nó
- **csh/tcsh**: Shell theo phong cách C

### Hello World trong lập trình Shell

Khi học bất kỳ ngôn ngữ lập trình nào, điều đầu tiên là xuất ra HelloWorld! Dưới đây tôi sẽ trình bày từ bước tạo file đến viết code shell để xuất ra Hello World.

(1) Tạo file mới helloworld.sh: `touch helloworld.sh`, phần mở rộng là sh (sh đại diện cho Shell) (phần mở rộng không ảnh hưởng đến việc thực thi script, chỉ cần đặt tên dễ hiểu. Nếu bạn viết shell script bằng php, dùng phần mở rộng php cũng được)

(2) Cấp quyền thực thi cho script: `chmod +x helloworld.sh`

(3) Sử dụng lệnh vim để sửa file helloworld.sh: `vim helloworld.sh` (vim file -----> vào file ----> chế độ lệnh -----> nhấn i để vào chế độ chỉnh sửa ----> chỉnh sửa file -------> nhấn Esc để vào chế độ dòng cuối ----> nhập :wq/q! (nhập wq để ghi nội dung và thoát, tức lưu; nhập q! để thoát cưỡng bức không lưu.))

Nội dung helloworld.sh như sau:

```shell
#!/bin/bash
set -euo pipefail  # 严格模式：遇错退出、未定义变量报错、管道失败报错
# 第一个 shell 小程序，echo 是 Linux 中的输出命令
echo "helloworld!"
```

Trong shell, ký hiệu # đại diện cho chú thích. **Dòng đầu tiên của shell khá đặc biệt, thường bắt đầu bằng #! để chỉ định loại shell sử dụng. Trên Linux, ngoài bash shell, còn có nhiều phiên bản shell khác như zsh, dash, v.v... Nhưng bash shell vẫn là loại chúng ta sử dụng nhiều nhất.**

(4) Chạy script: `./helloworld.sh`. (Lưu ý, phải viết là `./helloworld.sh`, không phải `helloworld.sh`. Khi chạy các chương trình nhị phân khác cũng vậy — nếu chỉ viết `helloworld.sh`, hệ thống Linux sẽ tìm trong PATH xem có lệnh nào tên helloworld.sh không. Chỉ có /bin, /sbin, /usr/bin, /usr/sbin, v.v. nằm trong PATH, thư mục hiện tại của bạn thường không nằm trong PATH, vì vậy viết `helloworld.sh` sẽ không tìm thấy lệnh — phải dùng `./helloworld.sh` để báo cho hệ thống biết tìm ngay trong thư mục hiện tại.)

![shell 编程Hello World](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/55296212.jpg)

## Biến trong Shell

### Giới thiệu về biến trong lập trình Shell

**Trong lập trình Shell, thường có ba loại biến:**

1. **Biến tự định nghĩa (biến cục bộ)**: Mặc định chỉ có hiệu lực trong tiến trình Shell hiện tại, **các tiến trình con không thể truy cập**. Nếu cần truyền cho tiến trình con, phải dùng `export` để khai báo thành biến môi trường.
2. **Biến môi trường**: Ví dụ `PATH`, `HOME`, v.v., có thể được kế thừa bởi các tiến trình con. Dùng lệnh `env` để xem tất cả biến môi trường, lệnh `set` để xem tất cả biến (bao gồm cả biến môi trường và biến cục bộ).
3. **Biến đặc biệt của Shell**: Các biến đặc biệt được Shell thiết lập (như `$?`, `$$`, `$!`, v.v.), dùng để lưu trữ trạng thái tiến trình, tham số, v.v.

**Các biến môi trường thường dùng:**

> PATH quyết định shell sẽ tìm kiếm lệnh hoặc chương trình trong các thư mục nào
> HOME thư mục chính của người dùng hiện tại
> HISTSIZE số lượng bản ghi lịch sử
> LOGNAME tên đăng nhập của người dùng hiện tại
> HOSTNAME tên máy chủ
> SHELL loại Shell của người dùng hiện tại
> LANGUAGE biến môi trường liên quan đến ngôn ngữ, có thể thay đổi biến môi trường này cho đa ngôn ngữ
> MAIL thư mục lưu trữ thư của người dùng hiện tại
> PS1 dấu nhắc cơ bản, # cho người dùng root, \$ cho người dùng thường

**Sử dụng biến môi trường đã được định nghĩa trong Linux:**

Ví dụ để xem thư mục người dùng hiện tại, có thể dùng lệnh `echo $HOME`; để xem loại Shell của người dùng hiện tại, có thể dùng `echo $SHELL`. Cách sử dụng rất đơn giản.

**Sử dụng biến tự định nghĩa:**

```shell
#!/bin/bash
#自定义变量hello
hello="hello world"
echo $hello
echo  "helloworld!"
```

![使用自己定义的变量](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/19835037.jpg)

**Lưu ý khi đặt tên biến trong lập trình Shell:**

- Tên chỉ có thể dùng chữ cái tiếng Anh, số và dấu gạch dưới, ký tự đầu tiên không được bắt đầu bằng số, nhưng có thể dùng dấu gạch dưới (\_).
- Không được có khoảng trắng ở giữa, có thể dùng dấu gạch dưới (\_).
- Không được dùng dấu chấm câu.
- Không được dùng các từ khóa của bash (có thể dùng lệnh help để xem các từ khóa dành riêng).

### Giới thiệu về chuỗi trong Shell

Chuỗi là kiểu dữ liệu được sử dụng nhiều và hữu ích nhất trong lập trình shell (ngoài số và chuỗi, cũng không có kiểu nào hữu ích hơn), chuỗi có thể dùng dấu nháy đơn hoặc dấu nháy kép. Điều này khác với Java.

Trong dấu nháy đơn, tất cả các ký tự đặc biệt (như `$`, dấu backtick, `\`, v.v.) đều mất đi ý nghĩa đặc biệt và được xử lý như ký tự nghĩa đen.

Trong dấu nháy kép, các ký tự sau vẫn giữ ý nghĩa đặc biệt:

- `$`: mở rộng biến (như `$var`) và thay thế lệnh (như `$(cmd)` hoặc `` `cmd` ``)
- `\`: ký tự thoát
- `` ` `` hoặc `$()`: thay thế lệnh (khuyến nghị dùng cú pháp `$()`)
- `!`: mở rộng lịch sử (chỉ bật mặc định trong Shell tương tác)
- `${}`: mở rộng tham số

**Lưu ý**: Chuỗi trong dấu nháy đơn là **nghĩa đen hoàn toàn**, chuỗi trong dấu nháy kép sẽ được thực hiện thay thế biến và lệnh.

**Chuỗi với dấu nháy đơn:**

```shell
#!/bin/bash
name='SnailClimb'
hello='Hello, I am $name!'
echo $hello
```

Kết quả xuất ra:

```plain
Hello, I am $name!
```

**Chuỗi với dấu nháy kép:**

```shell
#!/bin/bash
name='SnailClimb'
hello="Hello, I am $name!"
echo $hello
```

Kết quả xuất ra:

```plain
Hello, I am SnailClimb!
```

### Các thao tác phổ biến với chuỗi trong Shell

**Nối chuỗi:**

```shell
#!/bin/bash
name="SnailClimb"
# 使用双引号拼接
greeting="hello, "$name" !"
greeting_1="hello, ${name} !"
echo $greeting  $greeting_1
# 使用单引号拼接
greeting_2='hello, '$name' !'
greeting_3='hello, ${name} !'
echo $greeting_2  $greeting_3
```

Kết quả xuất ra:

![输出结果](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/51148933.jpg)

**Lấy độ dài chuỗi:**

```shell
#!/bin/bash
# 获取字符串长度
name="SnailClimb"
# 第一种方式（推荐）：bash 内置
echo ${#name}  # 输出 10
# 第二种方式：外部命令（性能较差）
expr length "$name"
```

Kết quả xuất ra:

```plain
10
10
```

**Giải thích**:

- Khuyến nghị dùng cú pháp `${#var}`, đây là tính năng tích hợp của bash, hiệu năng tốt hơn
- `expr` là lệnh bên ngoài, cần fork tiến trình, hiệu năng kém hơn
- **`expr length` là phần mở rộng GNU**, không phải chuẩn POSIX. Có thể không được hỗ trợ trên BSD expr của macOS hoặc các hệ thống khác
- Nếu cần tính di động, khuyến nghị dùng `${#var}` hoặc `expr "$var" : '.*'` (tương thích POSIX)

Khi dùng lệnh expr, các toán tử trong biểu thức phải có khoảng trắng ở hai bên:

```shell
expr 5+6       # 直接输出 5+6（无空格）
expr 5 + 6     # 输出 11（有空格）
# 更推荐使用 bash 算术扩展：
echo $((5 + 6))  # 输出 11
```

Đối với một số toán tử, chúng ta cần dùng ký hiệu `\` để thoát:

```shell
expr 5 * 6       # 输出错误（未转义）
expr 5 \* 6      # 输出 30（正确转义）
```

**Cắt chuỗi con:**

Cắt chuỗi đơn giản:

```shell
#从字符串第 0 个字符开始往后截取 10 个字符（索引从 0 开始）
str="SnailClimb is a great man"
echo ${str:0:10} #输出:SnailClimb
```

Cắt theo biểu thức:

```shell
#!/bin/bash
# author: amau

var="https://www.runoob.com/linux/linux-shell-variable.html"
# %表示删除从后匹配, 最短结果
# %%表示删除从后匹配, 最长匹配结果
# #表示删除从头匹配, 最短结果
# ##表示删除从头匹配, 最长匹配结果
# 注: *为通配符, 意为匹配任意数量的任意字符
s1=${var%%t*} #h
s2=${var%t*}  #https://www.runoob.com/linux/linux-shell-variable.h
s3=${var%%.*} #https://www
s4=${var#*/}  #/www.runoob.com/linux/linux-shell-variable.html
s5=${var##*/} #linux-shell-variable.html
```

### Mảng trong Shell

**bash 2.0+** hỗ trợ mảng một chiều (không hỗ trợ mảng nhiều chiều) và không giới hạn kích thước mảng.

**Lưu ý quan trọng**: Mảng là **tính năng mở rộng không phải POSIX** của bash, POSIX sh thuần túy (như dash) không hỗ trợ mảng. Nếu cần viết script có tính di động, nên tránh dùng mảng.

Dưới đây là ví dụ code Shell về các thao tác mảng, qua đó bạn có thể biết cách tạo mảng, lấy độ dài mảng, lấy/xóa phần tử tại vị trí cụ thể, xóa toàn bộ mảng và duyệt mảng.

```shell
#!/bin/bash
array=(1 2 3 4 5);
# 获取数组长度
length=${#array[@]}
# 或者
length2=${#array[*]}
#输出数组长度
echo $length #输出：5
echo $length2 #输出：5
# 输出数组第三个元素
echo ${array[2]} #输出：3
unset array[1]# 删除下标为1的元素也就是删除第二个元素
for i in ${array[@]};do echo $i ;done # 遍历数组，输出：1 3 4 5
unset array; # 删除数组中的所有元素
for i in ${array[@]};do echo $i ;done # 遍历数组，数组元素为空，没有任何输出内容
```

**Giải thích quan trọng: Lỗ hổng chỉ mục mảng**:

Sau khi xóa phần tử bằng `unset array[1]`, mảng sẽ có **lỗ hổng chỉ mục**:

```shell
#!/bin/bash
array=(1 2 3 4 5)
echo "删除前: ${array[@]}"  # 输出: 1 2 3 4 5
echo "索引1的值: ${array[1]}"  # 输出: 2

unset array[1]  # 删除索引1的元素
echo "删除后: ${array[@]}"  # 输出: 1 3 4 5
echo "索引1的值: ${array[1]}"  # 输出: (空值)
echo "索引2的值: ${array[2]}"  # 输出: 3 (索引2仍在)

# 遍历时索引不连续
for index in "${!array[@]}"; do
    echo "索引[$index] = ${array[$index]}"
done
# 输出:
# 索引[0] = 1
# 索引[2] = 3
# 索引[3] = 4
# 索引[4] = 5
```

**Lưu ý**: Sau khi xóa phần tử, nếu dùng `${array[1]}` để truy cập sẽ nhận được giá trị rỗng. Khi duyệt mảng, khuyến nghị dùng `"${!array[@]}"` để lấy các chỉ mục hợp lệ, hoặc dùng `"${array[@]}"` để duyệt trực tiếp các giá trị.

## Các toán tử cơ bản trong Shell

Lập trình Shell hỗ trợ các loại toán tử sau:

- Toán tử số học
- Toán tử quan hệ
- Toán tử boolean
- Toán tử chuỗi
- Toán tử kiểm tra file

### Toán tử số học

| **Toán tử** | **Mô tả** | **Ví dụ**                                        |
| ----------- | --------- | ------------------------------------------------ |
| **+**       | Cộng      | `expr $a + $b`                                   |
| **-**       | Trừ       | `expr $a - $b`                                   |
| **\***      | Nhân      | `expr $a \* $b` (lưu ý dấu sao cần thoát)        |
| **/**       | Chia      | `expr $b / $a`                                   |
| **%**       | Chia dư   | `expr $b % $a`                                   |
| **=**       | Gán       | `a=$b` gán giá trị của biến b cho a              |
| **==**      | Bằng nhau | `[ $a == $b ]` dùng so sánh số, bằng trả về true |
| **!=**      | Khác nhau | `[ $a != $b ]` dùng so sánh số, khác trả về true |

**Khuyến nghị dùng mở rộng số học tích hợp của bash**:

```shell
#!/bin/bash
a=3; b=3
val=$((a + b))  # bash 算术扩展（推荐）
# 输出：Total value: 6
echo "Total value: $val"
```

**Giải thích**:

- `$((...))` là tính năng tích hợp của bash, không cần fork tiến trình bên ngoài, hiệu năng tốt hơn
- **Không khuyến nghị** dùng lệnh `expr` (cần fork tiến trình, và toán tử phải có khoảng trắng ở hai bên)
- **Không khuyến nghị** dùng backtick `` `...` `` (đã lỗi thời), nên dùng cú pháp `$(...)`

**Nếu cần tương thích với POSIX sh**, có thể dùng:

```shell
val=$(expr "$a" + "$b")  # POSIX 兼容，但性能较差
```

### Toán tử quan hệ

Toán tử quan hệ chỉ hỗ trợ số, không hỗ trợ chuỗi, trừ khi giá trị của chuỗi là số.

| **Toán tử** | **Mô tả**                                                    | **Tiếng Anh tương ứng** |
| ----------- | ------------------------------------------------------------ | ----------------------- |
| **-eq**     | Kiểm tra hai số có **bằng nhau** không                       | equal                   |
| **-ne**     | Kiểm tra hai số có **không bằng nhau** không                 | not equal               |
| **-gt**     | Kiểm tra số bên trái có **lớn hơn** bên phải không           | greater than            |
| **-lt**     | Kiểm tra số bên trái có **nhỏ hơn** bên phải không           | less than               |
| **-ge**     | Kiểm tra số bên trái có **lớn hơn hoặc bằng** bên phải không | greater equal           |
| **-le**     | Kiểm tra số bên trái có **nhỏ hơn hoặc bằng** bên phải không | less equal              |

Ví dụ đơn giản minh họa cách dùng toán tử quan hệ — chương trình shell dưới đây sẽ xuất ra A khi score=100, ngược lại xuất ra B:

```shell
#!/bin/bash
score=90;
maxscore=100;
if [[ $score -eq $maxscore ]]
then
   echo "A"
else
   echo "B"
fi
```

Kết quả xuất ra:

```plain
B
```

### Toán tử logic

| **Toán tử** | **Mô tả**     | **Ví dụ**                                               |
| ----------- | ------------- | ------------------------------------------------------- | --- | --------------------------------- |
| **&&**      | Logic **AND** | `[[ $a -lt 100 && $b -gt 100 ]]` (cả hai đúng mới đúng) |
| **\|\|**    | Logic **OR**  | `[[ $a -lt 100                                          |     | $b -gt 100 ]]` (một đúng là đúng) |

**Phép logic trong mở rộng số học**:

```shell
#!/bin/bash
a=$(( 1 && 0))
# 输出：0；逻辑与运算只有相与的两边都是1，与的结果才是1；否则与的结果是0
echo $a;
```

**Thực thi ngắn mạch lệnh (phổ biến trong môi trường production)**:

Trong tự động hóa vận hành và CI/CD pipeline, thường sử dụng `&&` và `||` để kiểm soát luồng thực thi chuỗi lệnh, gọi là **thực thi ngắn mạch**:

```shell
#!/bin/bash
set -euo pipefail

# &&：前一个命令成功（返回 0）时才执行后一个命令
mkdir -p "/tmp/app_data" && echo "目录就绪"

# ||：前一个命令失败（返回非 0）时才执行后一个命令
mkdir -p "/tmp/app_data" || echo "目录创建失败"

# 组合使用：生产环境典型的防御姿势
mkdir -p "/tmp/app_data" && echo "目录就绪" || exit 1

# 实际场景示例
# 1. 检查文件存在后再删除
[ -f "/tmp/old_file.log" ] && rm "/tmp/old_file.log"

# 2. 命令失败时输出错误信息并退出
cd /app/config || { echo "无法进入配置目录"; exit 1; }

# 3. 条件执行命令
command1 && command2 || command3
# ⚠️ 注意：此写法有陷阱！
# - 当 command1 成功时，执行 command2
# - 当 command1 失败时，执行 command3
# - 但如果 command1 成功但 command2 失败，command3 仍会执行！
#
# ✅ 更安全的写法（推荐）：
if command1; then
    command2
else
    command3
fi
#
# 或明确知道 command2 不会失败时才使用 && || 组合
```

**Lưu ý quan trọng**:

- Thực thi ngắn mạch phụ thuộc vào **mã thoát (Exit Code)** của lệnh: thành công trả về 0, thất bại trả về khác 0
- Điều này khác với `&&` và `||` bên trong `[[ ]]`, vốn dùng để kiểm tra điều kiện
- `command1 && command2 || command3` có bẫy: nếu command1 thành công nhưng command2 thất bại, command3 vẫn sẽ thực thi
- Trong môi trường production, khuyến nghị dùng cấu trúc if-then-else để đảm bảo logic rõ ràng

### Toán tử boolean

| **Toán tử** | **Mô tả**                                                                                | **Ví dụ**                                   |
| ----------- | ---------------------------------------------------------------------------------------- | ------------------------------------------- |
| **!**       | Đảo ngược kết quả biểu thức. Nếu biểu thức là true, trả về false; ngược lại trả về true. | `[ ! false ]` trả về true.                  |
| **-o**      | Nếu có một biểu thức là true, trả về true.                                               | `[ $a -lt 20 -o $b -gt 100 ]` trả về true.  |
| **-a**      | Cả hai biểu thức đều phải là true mới trả về true.                                       | `[ $a -lt 20 -a $b -gt 100 ]` trả về false. |

### Toán tử chuỗi

| **Toán tử** | **Mô tả**                                        | **Ví dụ**                         |
| ----------- | ------------------------------------------------ | --------------------------------- |
| **=**       | Kiểm tra hai chuỗi có **bằng nhau** không        | `[ $a = $b ]`                     |
| **!=**      | Kiểm tra hai chuỗi có **khác nhau** không        | `[ $a != $b ]`                    |
| **-z**      | Kiểm tra độ dài chuỗi có bằng **0** không (zero) | `[ -z $a ]` rỗng thì true         |
| **-n**      | Kiểm tra độ dài chuỗi có **khác 0** không        | `[ -n "$a" ]` không rỗng thì true |
| **str**     | Kiểm tra trực tiếp chuỗi có rỗng không           | `[ $a ]` không rỗng thì true      |

Ví dụ đơn giản:

```shell
#!/bin/bash
a="abc";
b="efg";
if [[ $a = $b ]]
then
   echo "a 等于 b"
else
   echo "a 不等于 b"
fi
```

Kết quả xuất ra:

```plain
a 不等于 b
```

### Toán tử liên quan đến file

Dùng để kiểm tra các thuộc tính khác nhau (như quyền, loại, v.v.) của file Unix/Linux.

- **Kiểm tra sự tồn tại và loại:**
  - **-e file**: Kiểm tra file (bao gồm thư mục) có tồn tại không.
  - **-f file**: Kiểm tra có phải file thông thường không (không phải thư mục cũng không phải file thiết bị).
  - **-d file**: Kiểm tra có phải thư mục không.
  - **-s file**: Kiểm tra file có rỗng không (kích thước file lớn hơn 0 trả về true).
  - **-b/-c/-p**: Kiểm tra lần lượt có phải thiết bị block, thiết bị ký tự, named pipe không.
- **Kiểm tra quyền:**
  - **-r file**: Kiểm tra file có thể đọc không.
  - **-w file**: Kiểm tra file có thể ghi không.
  - **-x file**: Kiểm tra file có thể thực thi không.
- **Kiểm tra đặc biệt:**
  - **-u / -g / -k**: Kiểm tra file có được thiết lập SUID, SGID hoặc Sticky Bit không.

Cách sử dụng rất đơn giản. Ví dụ, ta đã định nghĩa đường dẫn file `file="/usr/learnshell/test.sh"`, nếu muốn kiểm tra file có thể đọc không, dùng `if [ -r $file ]`; nếu muốn kiểm tra file có thể ghi không, dùng `-w $file`. Rất đơn giản phải không.

## Điều khiển luồng trong Shell

### Câu lệnh điều kiện if

Ví dụ đơn giản về câu lệnh điều kiện if else-if else:

```shell
#!/bin/bash
a=3;
b=9;
if [[ $a -eq $b ]]
then
   echo "a 等于 b"
elif [[ $a -gt $b ]]
then
   echo "a 大于 b"
else
   echo "a 小于 b"
fi
```

Kết quả xuất ra:

```plain
a 小于 b
```

Tin rằng qua ví dụ trên, bạn đã nắm được câu lệnh điều kiện if trong lập trình shell.

**Xử lý câu lệnh rỗng**: Trong Shell, câu lệnh rỗng có thể dùng `:` (lệnh dấu hai chấm) hoặc lệnh `true`:

```shell
if [[ condition ]]; then
    :  # 空语句（什么都不做）
fi

# 或
if [[ condition ]]; then
    true  # 空语句
fi
```

Điều này hữu ích trong một số tình huống, ví dụ như placeholder trong vòng lặp while.

### Câu lệnh vòng lặp for

Qua ba ví dụ đơn giản dưới đây, bạn sẽ hiểu cách dùng cơ bản nhất của câu lệnh vòng lặp for. Thực ra, tính năng của câu lệnh vòng lặp for nhiều hơn những gì các ví dụ này thể hiện.

**Xuất dữ liệu trong danh sách hiện tại:**

```shell
for loop in 1 2 3 4 5
do
    echo "The value is: $loop"
done
```

**Tạo 10 số ngẫu nhiên:**

```shell
#!/bin/bash
for i in {0..9};
do
   echo $RANDOM;
done
```

**Xuất từ 1 đến 5:**

Thông thường khi gọi biến shell cần thêm \$, nhưng trong (()) của for thì không cần. Hãy xem ví dụ sau:

```shell
#!/bin/bash
length=5
for((i=1;i<=length;i++));do
    echo $i;
done;
```

### Câu lệnh while

**Câu lệnh vòng lặp while cơ bản:**

```shell
#!/bin/bash
int=1
while (( int <= 5 ))  # 算术上下文内变量无需 $
do
    echo $int
    (( int++ ))  # 推荐使用 (( )) 替代 let
done
```

**Vòng lặp while có thể dùng để đọc thông tin từ bàn phím:**

```shell
echo '按下 <CTRL-D> 退出'
echo -n '输入你最喜欢的电影: '
while read -r FILM  # -r 选项禁止反斜杠转义，提高安全性
do
    echo "是的！$FILM 是一个好电影"
done
```

Kết quả xuất ra:

```plain
按下 <CTRL-D> 退出
输入你最喜欢的电影: 变形金刚
是的！变形金刚 是一个好电影
```

**Vòng lặp vô hạn:**

```shell
while true
do
    command
done
```

## Hàm trong Shell

### Hàm không có tham số và không có giá trị trả về

```shell
#!/bin/bash
hello(){
    echo "这是我的第一个 shell 函数!"
}
echo "-----函数开始执行-----"
hello
echo "-----函数执行完毕-----"
```

Kết quả xuất ra:

```plain
-----函数开始执行-----
这是我的第一个 shell 函数!
-----函数执行完毕-----
```

### Hàm có giá trị trả về

**Nhập hai số, cộng chúng lại và trả về kết quả:**

```shell
#!/bin/bash
set -euo pipefail

funWithReturn(){
    local aNum
    local anotherNum
    echo "输入第一个数字: "
    read -r aNum
    echo "输入第二个数字: "
    read -r anotherNum
    echo "两个数字分别为 $aNum 和 $anotherNum !"
    return $((aNum + anotherNum))
}
funWithReturn
echo "输入的两个数字之和为 $?"
```

**Giải thích quan trọng**:

- **Từ khóa `local`**: Giới hạn biến trong phạm vi hàm, tránh làm ô nhiễm không gian tên toàn cục
- **`read -r`**: Tùy chọn `-r` vô hiệu hóa thoát dấu gạch chéo ngược, tăng tính bảo mật
- **Giá trị trả về của hàm**: Hàm Shell chỉ có thể trả về mã thoát từ 0-255. Nếu cần trả về dữ liệu phức tạp, nên dùng `echo` hoặc biến toàn cục

**Tại sao dùng local?**

- Trong các script phức tạp hoặc khi import nhiều script bên ngoài, các biến không khai báo local có thể bị ghi đè vô tình
- Ô nhiễm biến toàn cục dẫn đến các lỗi cấu hình hoặc lỗi logic khó tìm
- Dùng `local` là thực hành tốt nhất trong lập trình hàm, tương tự khái niệm biến cục bộ trong các ngôn ngữ lập trình khác

Kết quả xuất ra:

```plain
输入第一个数字:
1
输入第二个数字:
2
两个数字分别为 1 和 2 !
输入的两个数字之和为 3
```

### Hàm có tham số

```shell
#!/bin/bash
funWithParam(){
    echo "第一个参数为 $1"
    echo "第二个参数为 $2"
    echo "脚本名称为 $0"
    echo "第十个参数为 ${10}"   # 注意：参数 ≥ 10 时必须用 ${n}
    echo "第十一个参数为 ${11}"
    echo "参数总数有 $# 个"
    echo "所有参数为 $*"         # 作为单个字符串输出
    echo "所有参数为 $@"         # 作为独立的参数输出（推荐）
}
funWithParam 1 2 3 4 5 6 7 8 9 34 73
```

Kết quả xuất ra:

```plain
第一个参数为 1
第二个参数为 2
脚本名称为 ./script.sh
第十个参数为 34
第十一个参数为 73
参数总数有 11 个
所有参数为 1 2 3 4 5 6 7 8 9 34 73
所有参数为 1 2 3 4 5 6 7 8 9 34 73
```

**Lưu ý quan trọng**:

- **Tham số vị trí `$n` khi `n ≥ 10` phải dùng cú pháp `${n}`**
- Ví dụ: `$10` sẽ được phân tích là sự nối của `$1` và ký tự nghĩa đen `0`, không phải tham số thứ mười
- `$0` biểu thị tên của script
- `$#` biểu thị tổng số tham số

**Sự khác biệt cốt lõi giữa `$*` và `$@`**:

| Biểu thức | Không có dấu nháy            | Bọc trong dấu nháy kép                                         |
| --------- | ---------------------------- | -------------------------------------------------------------- |
| `$*`      | Mở rộng thành tất cả tham số | Mở rộng thành **một chuỗi đơn** (tất cả tham số gộp lại)       |
| `$@`      | Mở rộng thành tất cả tham số | Mở rộng thành **các tham số độc lập** (mỗi tham số giữ nguyên) |

**So sánh ví dụ**:

```shell
#!/bin/bash
test_args() {
    echo "--- 使用 \$* （无引号）---"
    for arg in $*; do
        echo "参数: [$arg]"
    done

    echo -e "\n--- 使用 \$@ （无引号）---"
    for arg in $@; do
        echo "参数: [$arg]"
    done

    echo -e "\n--- 使用 \"\$*\" （双引号）---"
    for arg in "$*"; do
        echo "参数: [$arg]"
    done

    echo -e "\n--- 使用 \"\$@\" （双引号，推荐）---"
    for arg in "$@"; do
        echo "参数: [$arg]"
    done
}

# 调用函数，传递包含空格的参数
test_args "hello world" "foo bar"
```

**Kết quả xuất ra**:

```plain
--- 使用 $* （无引号）---
参数: [hello]
参数: [world]
参数: [foo]
参数: [bar]

--- 使用 $@ （无引号）---
参数: [hello]
参数: [world]
参数: [foo]
参数: [bar]

--- 使用 "$*" （双引号）---
参数: [hello world foo bar]  # 所有参数合并为一个字符串

--- 使用 "$@" （双引号，推荐）---
参数: [hello world]  # 每个参数保持独立
参数: [foo bar]
```

**Kết luận**: Khi truyền tham số, **luôn dùng `"$@"`** để đảm bảo tính độc lập của từng tham số (đặc biệt khi tham số chứa khoảng trắng).

## Thực hành tốt nhất trong lập trình Shell

Sau khi nắm vững các kiến thức cơ bản về lập trình Shell, việc tìm hiểu một số thực hành tốt nhất sẽ giúp bạn viết các script an toàn và hiệu quả hơn.

### Quy chuẩn cơ bản của script

**1. Quy chuẩn Shebang**:

```shell
#!/usr/bin/env bash  # 更可移植（自动查找 bash）
set -euo pipefail     # 严格模式：遇错退出、未定义变量报错、管道失败报错
```

**Hai cách viết Shebang**:

- `#!/bin/bash`: Chỉ định trực tiếp đường dẫn bash, phù hợp với môi trường cố định mà bạn biết vị trí bash
- `#!/usr/bin/env bash`: Tìm bash qua env, tính di động cao hơn, phù hợp với các hệ thống khác nhau (như macOS / Linux)

**Lựa chọn trong bài này**:

- Ví dụ trong bài dùng `#!/bin/bash`: Đơn giản, dễ hiểu cho người mới học
- Ví dụ production dùng `#!/usr/bin/env bash`: Nhấn mạnh tính di động

**2. Tham chiếu biến**:

```shell
# 始终用双引号包裹变量
echo "$var"     # 推荐
echo $var       # 可能导致 word splitting 和 globbing 问题
```

**3. Dùng shellcheck**:

```bash
shellcheck your_script.sh  # 静态分析，发现常见问题
```

**4. Cú pháp khuyến nghị**:

- Dùng `[[ ]]` thay vì `[ ]` (an toàn hơn, hỗ trợ khớp mẫu)
- Dùng `$((...))` thay vì `expr` (hiệu năng tốt hơn)
- Dùng `$(...)` thay vì backtick (có thể lồng nhau, rõ ràng hơn)
- Dùng `${n}` để truy cập tham số vị trí n ≥ 10

### Cách hoạt động của pipefail

Theo mặc định, giá trị trả về của lệnh pipeline chỉ phụ thuộc vào lệnh cuối cùng. Sau khi bật `pipefail`, giá trị trả về của pipeline sẽ là giá trị trả về của lệnh thất bại cuối cùng, giúp tránh che giấu lỗi ở các bước trung gian.

**So sánh ví dụ**:

```shell
# 默认模式（危险）
cat huge_file.txt | grep "pattern" | head -n 10
# 即使 cat 失败（文件不存在），只要 head 成功，返回码就是 0

# pipefail 模式（安全）
set -o pipefail
cat huge_file.txt | grep "pattern" | head -n 10
# cat 失败会立即返回错误码，不会被忽略
```

## Thực hành tốt nhất trong môi trường production

### Bảo mật script

**1. Luôn dùng chế độ nghiêm ngặt**:

```shell
#!/usr/bin/env bash
set -euo pipefail  # 遇错退出、未定义变量报错、管道失败报错
```

**2. Tham chiếu biến an toàn**:

```shell
# 始终用双引号包裹变量，防止 word splitting 和 globbing
rm -rf "$temp_dir"       # 推荐
rm -rf $temp_dir         # 危险：如果 temp_dir 包含空格会导致误删
```

**3. Dùng local để giới hạn phạm vi biến**:

```shell
process_data() {
    local input_file="$1"
    local output_file="$2"
    # ... 处理逻辑
}
```

### Gợi ý về chỉ số giám sát

**Các chỉ số quan trọng**:

- **Mã thoát thực thi script (Exit Code)**: Khác 0 phải kích hoạt cảnh báo
- **Thời gian chờ thực thi lệnh**: Phòng chặn mạng hoặc read bị khóa (dùng lệnh `timeout`)
- **Tranh chấp đồng thời tài nguyên quan trọng**: File tạm thời, file khóa, kết nối mạng, v.v.
- **Tỷ lệ sử dụng File Descriptor (FD) trên máy**: Phòng FD bị cạn kiệt do khởi chạy đồng thời nền
- **Độ bão hòa PID**: Giám sát số lượng tiến trình, phòng PID bị cạn kiệt
- **P99 độ trễ yêu cầu mạng**: Giám sát độ trễ đuôi của yêu cầu API

**Ví dụ kiểm soát timeout**:

```shell
# 为整个脚本设置超时（5 分钟）
timeout 300 ./your_script.sh || { echo "脚本执行超时"; exit 1; }

# 为单个命令设置超时
timeout 10 curl -s https://api.example.com/data || { echo "API 请求超时"; exit 1; }
```

**Yêu cầu API cấp production (với retry và backoff)**:

```shell
# ⚠️ 重要：单纯拦截超时不够，必须考虑重试风暴
# 下面的配置包含连接超时、总超时、重试机制和指数退避

curl -s \
     --connect-timeout 3 \      # 连接超时 3 秒
     --max-time 10 \             # 总超时 10 秒
     --retry 3 \                 # 失败时重试 3 次
     --retry-delay 2 \           # 重试间隔 2 秒
     --retry-max-time 30 \       # 重试总时长不超过 30 秒
     --retry-connrefused \       # 连接被拒绝时也重试
     --retry-all-errors \        # 所有错误都重试
     https://api.example.com/data || { echo "API 请求彻底失败"; exit 1; }
```

**Phòng chống bão retry**:

```shell
# ❌ 危险：无节制的重试会导致级联雪崩
for i in {1..10}; do
    curl -s https://api.example.com/data && break || sleep 1
done

# ✅ 安全：带抖动（Jitter）的指数退避重试
retry_with_backoff() {
    local max_attempts=5
    local base_delay=1
    local max_delay=32
    local attempt=1

    while (( attempt <= max_attempts )); do
        if curl -s --connect-timeout 3 --max-time 10 \
                --retry 3 --retry-delay 2 --retry-max-time 30 \
                "$@"; then
            return 0
        fi

        if (( attempt < max_attempts )); then
            # 指数退避 + 随机抖动（防止重试风暴）
            local delay=$(( base_delay * (1 << (attempt - 1)) ))
            delay=$(( delay > max_delay ? max_delay : delay ))
            local jitter=$((RANDOM % 1000))  # 0-999ms 随机抖动
            delay=$(( delay * 1000 + jitter ))
            echo "请求失败，${delay}ms 后重试 (第 $attempt 次)" >&2
            sleep "${delay}e-6"
        fi

        ((attempt++))
    done

    return 1
}

# 使用
retry_with_backoff https://api.example.com/data
```

**Lưu ý quan trọng**:

- **Bão retry**: Sau khi phân vùng mạng phục hồi, retry không kiểm soát sẽ ngay lập tức làm quá tải dịch vụ hạ nguồn
- **Exponential backoff**: Khoảng thời gian giữa mỗi lần retry tăng theo hàm mũ (1s → 2s → 4s → 8s...)
- **Random jitter**: Thêm độ trễ ngẫu nhiên để tránh nhiều client retry cùng lúc (hiệu ứng thundering herd)
- **Chỉ số giám sát**: Cần giám sát tỷ lệ mất gói timeout và P99 thời gian xử lý yêu cầu

### Gợi ý kiểm tra tải

**Kiểm tra an toàn đồng thời**:

```shell
# ❌ 危险：无限制并发可能导致 PID 耗尽或 OOM
for i in {1..100}; do
    ./your_script.sh &
done
wait

# ✅ 安全：使用 xargs 控制并发度（推荐）
# 限制最大并行数为 10，防止系统资源耗尽
seq 1 100 | xargs -n 1 -P 10 -I {} ./your_script.sh

# 或使用 GNU parallel（功能更强大）
seq 1 100 | parallel -j 10 ./your_script.sh
```

**Lưu ý quan trọng**:

- **Kiểm soát độ đồng thời**: Kiểm tra tải trên một máy trong môi trường production nên dùng `xargs -P` hoặc GNU parallel để giới hạn số tiến trình đồng thời
- **Giám sát tài nguyên**: Giám sát tỷ lệ sử dụng file descriptor (FD) và độ bão hòa PID trong quá trình kiểm tra tải
- **Chế độ lỗi**: `&` không giới hạn sẽ gây ra hàng trăm tiến trình treo ở trạng thái D, dẫn đến kernel-level pseudo-deadlock trên node

**Phát hiện các vấn đề phổ biến**:

- **Xung đột đường dẫn cố định**: Tránh dùng các đường dẫn cố định như `/tmp/test.log`, nên dùng `$$` để thêm PID tiến trình:

  ```shell
  temp_file="/tmp/myapp_$$/temp.log"
  mkdir -p "$(dirname "$temp_file")"
  ```

- **Cơ chế khóa**: Dùng `flock` để ngăn thực thi đồng thời:

  ```shell
  # ⚠️ 重要：flock 仅在本地文件系统（Ext4/XFS）保证强一致性
  # 若锁文件位于 NFS 等网络存储，flock 可能静默失效（脑裂风险）

  # 单机场景：确保同一时间只有一个实例在运行
  exec 200>/var/lock/myapp.lock
  flock -n 200 || { echo "脚本已在运行"; exit 1; }

  # 分布式场景：需要使用分布式锁服务（如 Redis、etcd、ZooKeeper）
  # 或通过数据库唯一索引、消息队列等机制实现互斥
  ```

  **Trực quan hóa rủi ro split-brain của flock**:

  ```mermaid
  sequenceDiagram
      participant CronA as 节点A (定时任务)
      participant CronB as 节点B (定时任务)
      participant Storage as 存储层

      CronA->>Storage: 请求 flock 互斥锁 (非阻塞)
      Storage-->>CronA: 授予锁 (成功)
      CronA->>CronA: 执行核心自动化逻辑

      CronB->>Storage: 并发请求 flock 互斥锁 (非阻塞)
      alt 本地文件系统 (Ext4/XFS)
          Storage-->>CronB: 拒绝加锁 (返回非0)
          CronB->>CronB: 安全退出，防御并发成功 ✓
      else 网络文件系统 (NFS/配置异常)
          Storage-->>CronB: 错误地授予锁 (静默失效)
          CronB->>CronB: 🚨 执行核心逻辑，发生并发写与数据踩踏！
      end
  ```

  **Gợi ý giải pháp khóa phân tán**:

  - **Redis**: Dùng `SET key value NX PX timeout` để triển khai khóa phân tán
  - **etcd**: Dùng transaction API và cơ chế lease
  - **Database**: Dùng ràng buộc `UNIQUE INDEX`
  - **Message Queue**: Dùng chế độ single consumer để đảm bảo mutual exclusion

**Bắt mã thoát của tiến trình nền**:

```shell
# ❌ 问题：wait 默认不检查退出码，后台任务失败会被静默吃掉
for i in {1..10}; do
    ./task.sh &
done
wait  # 只等待所有后台进程结束，不检查退出码

# ✅ 正确：逐个检查后台进程的退出码
pids=()
for i in {1..10}; do
    ./task.sh &
    pids+=($!)
done

# 等待所有后台进程并检查退出码
for pid in "${pids[@]}"; do
    if ! wait "$pid"; then
        echo "进程 $pid 执行失败" >&2
        exit_code=1
    fi
done

# 或使用 wait -n（bash 4.3+）等待任一进程并检查退出码
while wait -n; do
    : # 检查 $? 是否为 0
done
```

### Những hiểu lầm phổ biến

**1. Nuốt context lỗi**:

```shell
# ❌ 错误：滥用 > /dev/null 2>&1
command > /dev/null 2>&1

# ✅ 正确：只屏蔽不需要的输出，保留错误信息
command > /dev/null  # 或
command 2>/tmp/error.log
```

**2. Giả định phụ thuộc môi trường**:

```shell
# ❌ 危险：依赖特定的 PATH 顺序，未验证命令是否存在
curl -s https://api.example.com/data

# ✅ 安全：验证命令存在后再使用
command -v curl >/dev/null 2>&1 || { echo "curl 未安装"; exit 1; }
curl -s https://api.example.com/data

# 或者：明确指定完整路径（适用于关键生产环境）
CURL_PATH="/usr/bin/curl"
[[ -x "$CURL_PATH" ]] || { echo "curl 不存在或不可执行"; exit 1; }
"$CURL_PATH" -s https://api.example.com/data
```

**Giải thích**: Xác minh sự tồn tại của lệnh có thể ngăn chặn lỗi runtime do sự khác biệt môi trường. Nếu cần bảo mật cao hơn, hãy chỉ định đường dẫn đầy đủ.

**3. Không xử lý lỗi pipeline**:

```shell
# ❌ 问题：默认模式下管道只看最后一个命令的返回码
cat huge_file.txt | grep "pattern" | head -n 10
# 即使 cat 失败，只要 head 成功，整体返回码就是 0

# ✅ 安全：使用 pipefail 确保任何命令失败都能被捕获
set -o pipefail
cat huge_file.txt | grep "pattern" | head -n 10
```

**4. Không dọn dẹp tài nguyên tạm thời**:

```shell
# ❌ 问题：脚本异常退出时临时文件未被清理
temp_file="/tmp/data_$$"
process_data "$temp_file"

# ✅ 安全：使用 trap 确保清理
temp_file="/tmp/data_$$"
trap 'rm -f "$temp_file"' EXIT
process_data "$temp_file"
```

### Mẫu xử lý lỗi

**Template lập trình phòng thủ**:

```shell
#!/usr/bin/env bash
set -euo pipefail

# 错误处理函数
error_exit() {
    echo "错误: $1" >&2
    exit "${2:-1}"
}

# 验证依赖
command -v curl >/dev/null 2>&1 || error_exit "curl 未安装"
command -v jq >/dev/null 2>&1 || error_exit "jq 未安装"

# 验证参数
[[ $# -eq 1 ]] || error_exit "用法: $0 <config_file>"

# 验证文件存在
[[ -f "$1" ]] || error_exit "配置文件不存在: $1"

# 设置超时和清理
temp_file="/tmp/process_$$"
trap 'rm -f "$temp_file"' EXIT

# 主要逻辑（带超时）
timeout 300 process_data "$1" "$temp_file" || error_exit "数据处理失败或超时"

echo "处理完成：$temp_file"
```

### Gợi ý diễn tập sự cố

Script trong môi trường production cần được kiểm tra sự cố đầy đủ để đảm bảo xử lý đúng trong mọi tình huống bất thường. Dưới đây là các kịch bản diễn tập sự cố được khuyến nghị:

**1. Kiểm tra phân vùng mạng**

```shell
# 使用 iptables 模拟 50% 丢包率
sudo iptables -A OUTPUT -p tcp --dport 443 -m statistic --mode random --probability 0.5 -j DROP

# 测试带有重试机制的 curl 是否引发雪崩
retry_with_backoff https://api.example.com/data

# 恢复网络
sudo iptables -D OUTPUT -p tcp --dport 443 -m statistic --mode random --probability 0.5 -j DROP
```

**Điểm kiểm tra**:

- Xác minh cơ chế retry có hoạt động bình thường không
- Kiểm tra có exponential backoff và random jitter không
- Xác nhận không gây cascade failure do retry storm

**2. Kiểm tra phản hồi chậm làm sập hệ thống**

```shell
# 模拟下游 API 长时间不返回（但不断开连接）
# 使用 nc 监听端口但不发送数据
nc -l 8080 &

# 测试 timeout 是否能准确切断连接
timeout 5 curl -s http://localhost:8080/data || echo "超时触发"

# 清理
pkill nc
```

**Điểm kiểm tra**:

- Xác minh `--max-time` có hiệu lực không
- Kiểm tra có rò rỉ tài nguyên không (kết nối, bộ nhớ)
- Xác nhận script có thể thoát đúng cách sau timeout

**3. Kiểm tra clock drift**

```shell
# 模拟系统时钟回拨（需要 root 权限）
sudo date -s "2 hours ago"

# 测试基于 $PID 生成的临时文件是否有重复覆盖风险
temp_file="/tmp/test_$$/data.txt"
mkdir -p "$(dirname "$temp_file")"
echo "data" > "$temp_file"
echo "Created: $temp_file"

# 恢复系统时钟
sudo ntpdate -u time.nist.gov
```

**Điểm kiểm tra**:

- Xác minh file tạm thời có bị ghi đè sau khi PID xoay vòng không
- Kiểm tra có cần thêm timestamp hoặc UUID để tăng tính duy nhất không
- Xác nhận tính mạnh mẽ của script đối với thay đổi clock

**4. Kiểm tra độ trễ NFS**

```shell
# 模拟 NFS 存储高延迟（使用 tc 延迟网络）
# 挂载测试用的 NFS 共享
sudo mount -t nfs nfs-server:/share /mnt/nfs-test

# 监控 I/O 延迟（P90 / P99）
iostat -x 1 10 | grep dm-0

# 在 NFS 共享上执行脚本，验证 flock 是否正常
LOCK_FILE="/mnt/nfs-test/myapp.lock"
exec 200>"$LOCK_FILE"
flock -n 200 || { echo "获取锁失败"; exit 1; }

# 清理
sudo umount /mnt/nfs-test
```

**Điểm kiểm tra**:

- Xác minh flock có hiệu quả trên network storage không (dự kiến có thể không hiệu quả)
- Kiểm tra có rủi ro split-brain không (nhiều node đồng thời lấy khóa)
- Xác nhận có cần dùng distributed lock thay thế không

**5. Kiểm tra file descriptor cạn kiệt**

```shell
# 查看当前进程的 FD 限制
ulimit -n

# 模拟大量并发连接，测试 FD 耗尽场景
for i in {1..1000}; do
    exec {fd}>"/tmp/file_$i" 2>/dev/null || break
done

# 检查 FD 使用情况
ls -l /proc/$$/fd | wc -l

# 清理
for i in {1..1000}; do
    eval "exec $fd>&-" 2>/dev/null
done
```

**Điểm kiểm tra**:

- Xác minh hành vi của script khi FD không đủ
- Kiểm tra có rò rỉ tài nguyên không
- Xác nhận giới hạn độ đồng thời có hiệu quả không

**6. Kiểm tra tính nhất quán dữ liệu khi tải**

```shell
# 在 NFS 共享存储目录下，由多个机器节点同时高频执行脚本
# 验证数据恢复与幂等性边界

# 节点 A
for i in {1..100}; do
    echo "nodeA_data_$i" >> /mnt/shared/data.txt
    sleep 0.1
done &

# 节点 B（在另一台机器上同时执行）
for i in {1..100}; do
    echo "nodeB_data_$i" >> /mnt/shared/data.txt
    sleep 0.1
done &

# 检查数据是否完整
wait
wc -l /mnt/shared/data.txt
sort /mnt/shared/data.txt | uniq -c
```

**Điểm kiểm tra**:

- Xác minh việc ghi đồng thời có dẫn đến hỗn loạn dữ liệu không
- Kiểm tra có cần dùng cơ chế khóa không
- Xác nhận chiến lược phục hồi dữ liệu có hiệu quả không

## Tổng kết

Lập trình Shell là một trong những kỹ năng cốt lõi bắt buộc của các kỹ sư backend và vận hành. Nắm vững nó có thể nâng cao đáng kể hiệu quả làm việc, thực hiện tự động hóa vận hành và quản lý hệ thống. Bài viết này đã giới thiệu có hệ thống các điểm kiến thức cốt lõi của lập trình Shell từ nhập môn đến thực hành production.

### Ôn tập các điểm kiến thức cốt lõi

| Module kiến thức     | Điểm quan trọng                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --- | --------- |
| **Biến**             | Phân biệt biến cục bộ, biến môi trường và biến đặc biệt; dùng `local` để tránh ô nhiễm toàn cục; luôn bọc biến trong dấu nháy kép |
| **Chuỗi**            | Khuyến nghị dùng dấu nháy kép; hiểu sự khác biệt giữa dấu nháy đơn và kép; nắm vững `${#var}` để lấy độ dài                       |
| **Mảng**             | bash 2.0+ hỗ trợ mảng (không phải POSIX); chú ý lỗ hổng chỉ mục sau khi xóa phần tử                                               |
| **Toán tử**          | Ưu tiên dùng `$((...))` cho phép tính số học; `[[ ]]` an toàn hơn `[ ]`                                                           |
| **Điều khiển luồng** | Dùng `[[ ]]` để kiểm tra điều kiện; tránh bẫy của `command1 && command2                                                           |     | command3` |
| **Hàm**              | Dùng `local` để giới hạn phạm vi biến; hàm chỉ có thể trả về mã thoát từ 0-255                                                    |
| **Thay thế lệnh**    | Dùng `$(...)` thay vì backtick; dùng `read -r` để tăng tính bảo mật                                                               |

### Yếu tố quan trọng khi viết script cấp production

Khi viết script Shell cho môi trường production, phải tuân thủ các nguyên tắc sau:

**1. Chế độ nghiêm ngặt**

```shell
#!/usr/bin/env bash
set -euo pipefail  # 遇错退出、未定义变量报错、管道失败报错
```

**2. Lập trình phòng thủ**

- Xác minh phụ thuộc: `command -v` kiểm tra sự tồn tại của lệnh
- Xác minh tham số: kiểm tra số lượng và loại tham số
- Xác minh file: xác nhận file tồn tại và có thể truy cập
- Kiểm soát timeout: dùng `timeout` để tránh deadlock
- Dọn dẹp tài nguyên: dùng `trap` để đảm bảo tài nguyên tạm thời được giải phóng

**3. Tránh các bẫy phổ biến**

- Không nuốt context lỗi (tránh lạm dụng `>/dev/null 2>&1`)
- Không phụ thuộc vào thứ tự PATH cụ thể (xác minh hoặc chỉ định đường dẫn đầy đủ)
- Không bỏ qua lỗi pipeline (dùng `set -o pipefail`)
- Không bỏ sót việc dọn dẹp tài nguyên tạm thời (dùng `trap`)

**4. An toàn đồng thời**

- Dùng `$$` để thêm PID cô lập file tạm thời
- Dùng `flock` để ngăn script thực thi đồng thời
- Tránh dùng đường dẫn file tạm thời cố định

### Gợi ý học tập

**Người mới bắt đầu**:

1. Bắt đầu từ các lệnh alias và script đơn giản
2. Tập trung nắm vững biến, điều kiện và vòng lặp
3. Dùng `shellcheck` để kiểm tra lỗi script
4. Thực hành nhiều, xuất phát từ các tình huống thực tế (như phân tích log, xử lý file)

**Học nâng cao**:

1. Học sâu về quản lý tiến trình, xử lý tín hiệu
2. Nắm vững các công cụ xử lý text như `sed`, `awk`, `grep`
3. Học regular expression và kỹ thuật xử lý text
4. Tìm hiểu về tối ưu hiệu năng và xử lý đồng thời

**Thực hành production**:

1. Đọc Google Shell Style Guide
2. Nghiên cứu các script Shell của dự án open source
3. Xác minh đầy đủ trong môi trường test trước khi triển khai
4. Xây dựng cơ chế giám sát và cảnh báo hoàn chỉnh

### Tài nguyên tham khảo

- **Tài liệu chính thức**: Bash Reference Manual (GNU)
- **Kiểm tra code**: ShellCheck - Shell Script Analysis Tool
- **Chuẩn code**: Google Shell Style Guide
- **Các bẫy phổ biến**: Bash Pitfalls (http://mywiki.wooledge.org/BashPitfalls)
