---
title: Một số bài tập thuật toán chuỗi phổ biến
description: Tổng hợp các thuật toán chuỗi tần suất cao và các dạng bài, trọng tâm giải thích nguyên lý KMP/BM, kỹ thuật sliding window, giúp matching và implement hiệu quả.
category: CS Basics
tag:
  - Algorithms
head:
  - - meta
    - name: keywords
      content: string algorithms,KMP,BM,sliding window,substring,matching,complexity
---

> Tác giả: wwwxmu
>
> Nguồn gốc: <https://www.weiweiblog.cn/13string/>

## 1. KMP Algorithm

Nói đến các bài toán chuỗi, không thể không nhắc đến thuật toán KMP. Nó được dùng để giải quyết bài toán tìm chuỗi, có thể tìm vị trí xuất hiện của một chuỗi con (W) trong một chuỗi (S). Thuật toán KMP rút ngắn time complexity của string matching xuống O(m+n), và space complexity cũng chỉ là O(m). Vì phương pháp "brute force" sẽ phải backtrack trên main string nhiều lần, dẫn đến hiệu suất thấp, trong khi KMP có thể tận dụng thông tin "đã match một phần" này một cách hiệu quả, giữ pointer trên main string không backtrack, thông qua việc sửa đổi pointer của sub-string, để pattern string di chuyển đến vị trí có ích.

Chi tiết thuật toán tham khảo:

- [Hiểu KMP từ đầu đến cuối:](https://blog.csdn.net/v_july_v/article/details/7041827)
- [Làm thế nào để hiểu và nắm vững KMP tốt hơn?](https://www.zhihu.com/question/21923021)
- [Phân tích chi tiết KMP](https://blog.sengxian.com/algorithms/kmp)
- [Minh họa thuật toán KMP](http://blog.jobbole.com/76611/)
- [Thuật toán KMP string matching mà ai cũng nghe hiểu được [song ngữ]](https://www.bilibili.com/video/av3246487/?from=search&seid=17173603269940723925)
- [KMP String Matching Algorithm 1](https://www.bilibili.com/video/av11866460?from=search&seid=12730654434238709250)

**Ngoài ra, hãy tìm hiểu thêm về BM Algorithm!**

> BM Algorithm cũng là một precise string matching algorithm, nó dùng phương pháp so sánh từ phải sang trái, đồng thời áp dụng hai heuristic rules là Bad Character Rule và Good Suffix Rule để quyết định khoảng cách nhảy sang phải. Ý tưởng cơ bản là thực hiện character matching từ phải sang trái, sau khi gặp ký tự không match, tìm giá trị dịch sang phải lớn nhất từ bảng bad character và bảng good suffix, dịch pattern string sang phải và tiếp tục match.
> 《KMP Algorithm của String Matching》: <http://www.ruanyifeng.com/blog/2013/05/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm.html>

## 2. Thay thế khoảng trắng

> Sword Offer: Hãy implement một function, thay thế mỗi khoảng trắng trong chuỗi bằng "%20". Ví dụ, khi chuỗi là We Are Happy. thì chuỗi sau khi thay thế là We%20Are%20Happy.

Ở đây mình cung cấp hai phương pháp: ① Phương pháp thông thường; ② Dùng API để giải quyết.

```java
//https://www.weiweiblog.cn/replacespace/
public class Solution {

  /**
   * Phương pháp 1: Thông thường. Dùng String.charAt(i) và String.valueOf(char).equals(" ")
   * để duyệt chuỗi và kiểm tra element có phải khoảng trắng không. Có thì thay bằng "%20", không thì giữ nguyên
   */
  public static String replaceSpace(StringBuffer str) {

    int length = str.length();
    // System.out.println("length=" + length);
    StringBuffer result = new StringBuffer();
    for (int i = 0; i < length; i++) {
      char b = str.charAt(i);
      if (String.valueOf(b).equals(" ")) {
        result.append("%20");
      } else {
        result.append(b);
      }
    }
    return result.toString();

  }

  /**
   * Phương pháp 2: Dùng API thay thế tất cả khoảng trắng, một dòng code giải quyết vấn đề
   */
  public static String replaceSpace2(StringBuffer str) {

    return str.toString().replaceAll("\\s", "%20");
  }
}

```

Với trường hợp thay thế ký tự cố định (như khoảng trắng), phương pháp hai thực ra có thể dùng method `replace`, performance tốt hơn!

```java
str.toString().replace(" ","%20");
```

## 3. Longest Common Prefix

> Leetcode: Viết một function để tìm longest common prefix trong một mảng chuỗi. Nếu không có common prefix, trả về chuỗi rỗng "".

Ví dụ 1:

```plain
Input: ["flower","flow","flight"]
Output: "fl"
```

Ví dụ 2:

```plain
Input: ["dog","racecar","car"]
Output: ""
Giải thích: Input không có common prefix.
```

Ý tưởng rất đơn giản! Đầu tiên dùng Arrays.sort(strs) để sort mảng, sau đó so sánh character của element đầu tiên và element cuối cùng từ đầu đến cuối là được!

```java
public class Main {
 public static String replaceSpace(String[] strs) {

  // Nếu input không hợp lệ thì trả về chuỗi rỗng
  if (!checkStrs(strs)) {
   return "";
  }
  // Độ dài mảng
  int len = strs.length;
  // Lưu kết quả
  StringBuilder res = new StringBuilder();
  // Sort các element trong mảng chuỗi theo thứ tự tăng dần (nếu có số, số sẽ ở trước)
  Arrays.sort(strs);
  int m = strs[0].length();
  int n = strs[len - 1].length();
  int num = Math.min(m, n);
  for (int i = 0; i < num; i++) {
   if (strs[0].charAt(i) == strs[len - 1].charAt(i)) {
    res.append(strs[0].charAt(i));
   } else
    break;

  }
  return res.toString();

 }

 private static boolean checkStrs(String[] strs) {
  boolean flag = false;
  if (strs != null) {
   // Duyệt strs kiểm tra element values
   for (int i = 0; i < strs.length; i++) {
    if (strs[i] != null && strs[i].length() != 0) {
     flag = true;
    } else {
     flag = false;
     break;
    }
   }
  }
  return flag;
 }

 // Test
 public static void main(String[] args) {
  String[] strs = { "customer", "car", "cat" };
  // String[] strs = { "customer", "car", null };//empty string
  // String[] strs = {};//empty string
  // String[] strs = null;//empty string
  System.out.println(Main.replaceSpace(strs));// c
 }
}

```

## 4. Palindrome

### 4.1. Longest Palindrome

> LeetCode: Cho một chuỗi chứa chữ hoa và chữ thường, tìm longest palindrome có thể tạo ra từ các chữ cái đó. Trong quá trình tạo, phân biệt chữ hoa và chữ thường. Ví dụ `"Aa"` không thể là một palindrome. Lưu ý: Giả sử độ dài chuỗi không vượt quá 1010.
>
> Palindrome: "Palindrome" là chuỗi đọc xuôi và đọc ngược đều giống nhau, ví dụ "level" hoặc "noon" đều là palindromes.

Ví dụ 1:

```plain
Input:
"abccccdd"

Output:
7

Giải thích:
Longest palindrome chúng ta có thể tạo là "dccaccd", độ dài là 7.
```

Bây giờ chúng ta đã biết palindrome là gì. Hãy xem xét hai trường hợp có thể tạo thành palindrome:

- Kết hợp các ký tự xuất hiện số lần chẵn
- **Kết hợp ký tự xuất hiện số lần chẵn + một ký tự đơn xuất hiện nhiều nhất với số lần lẻ** (xem **[issue665](https://github.com/Snailclimb/JavaGuide/issues/665)**)

Chỉ cần đếm số lần xuất hiện của ký tự là được, số chẵn mới có thể tạo thành palindrome. Vì cho phép một ký tự xuất hiện ở giữa, ví dụ "abcba", nên nếu cuối cùng còn ký tự thừa, tổng độ dài có thể cộng thêm 1. Đầu tiên chuyển chuỗi thành char array. Sau đó duyệt array, kiểm tra ký tự tương ứng có trong hashset không. Nếu không có thì thêm vào, nếu có thì count++, rồi xóa ký tự đó! Như vậy có thể tìm được số ký tự xuất hiện số lần chẵn.

```java
//https://leetcode-cn.com/problems/longest-palindrome/description/
class Solution {
  public  int longestPalindrome(String s) {
    if (s.length() == 0)
      return 0;
    // Dùng để lưu ký tự
    HashSet<Character> hashset = new HashSet<Character>();
    char[] chars = s.toCharArray();
    int count = 0;
    for (int i = 0; i < chars.length; i++) {
      if (!hashset.contains(chars[i])) {// Nếu hashset chưa có ký tự này thì lưu vào
        hashset.add(chars[i]);
      } else {// Nếu có, thì count++ (tức là đã tìm được một cặp ký tự), rồi xóa ký tự đó
        hashset.remove(chars[i]);
        count++;
      }
    }
    return hashset.isEmpty() ? count * 2 : count * 2 + 1;
  }
}
```

### 4.2. Valid Palindrome

> LeetCode: Cho một chuỗi, kiểm tra xem nó có phải palindrome không, chỉ xét chữ cái và chữ số, có thể bỏ qua chữ hoa/thường. Lưu ý: Trong bài này, chúng ta định nghĩa chuỗi rỗng là palindrome hợp lệ.

Ví dụ 1:

```plain
Input: "A man, a plan, a canal: Panama"
Output: true
```

Ví dụ 2:

```plain
Input: "race a car"
Output: false
```

```java
//https://leetcode-cn.com/problems/valid-palindrome/description/
class Solution {
  public  boolean isPalindrome(String s) {
    if (s.length() == 0)
      return true;
    int l = 0, r = s.length() - 1;
    while (l < r) {
      // Duyệt từ hai đầu vào giữa
      if (!Character.isLetterOrDigit(s.charAt(l))) {// Ký tự không phải chữ cái và chữ số
        l++;
      } else if (!Character.isLetterOrDigit(s.charAt(r))) {// Ký tự không phải chữ cái và chữ số
        r--;
      } else {
        // Kiểm tra hai ký tự có bằng nhau không
        if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r)))
          return false;
        l++;
        r--;
      }
    }
    return true;
  }
}
```

### 4.3. Longest Palindromic Substring

> Leetcode: LeetCode: Longest Palindromic Substring - Cho chuỗi s, tìm longest palindromic substring trong s. Giả sử độ dài tối đa của s là 1000.

Ví dụ 1:

```plain
Input: "babad"
Output: "bab"
Lưu ý: "aba" cũng là đáp án hợp lệ.
```

Ví dụ 2:

```plain
Input: "cbbd"
Output: "bb"
```

Lấy một element làm trung tâm, tính max palindrome length chẵn và max palindrome length lẻ riêng.

```java
//https://leetcode-cn.com/problems/longest-palindromic-substring/description/
class Solution {
  private int index, len;

  public String longestPalindrome(String s) {
    if (s.length() < 2)
      return s;
    for (int i = 0; i < s.length() - 1; i++) {
      PalindromeHelper(s, i, i);
      PalindromeHelper(s, i, i + 1);
    }
    return s.substring(index, index + len);
  }

  public void PalindromeHelper(String s, int l, int r) {
    while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
      l--;
      r++;
    }
    if (len < r - l - 1) {
      index = l + 1;
      len = r - l - 1;
    }
  }
}
```

### 4.4. Longest Palindromic Subsequence

> LeetCode: Longest Palindromic Subsequence
> Cho chuỗi s, tìm longest palindromic subsequence trong đó. Giả sử độ dài tối đa của s là 1000.
> **Sự khác biệt giữa Longest Palindromic Subsequence và Longest Palindromic Substring là substring là một sequence liên tục trong chuỗi, còn subsequence là sequence ký tự trong chuỗi giữ nguyên vị trí tương đối, ví dụ "bbbb" có thể là subsequence của "bbbab" nhưng không phải substring.**

Cho chuỗi s, tìm longest palindromic subsequence trong đó. Giả sử độ dài tối đa của s là 1000.

Ví dụ 1:

```plain
Input:
"bbbab"
Output:
4
```

Một longest palindromic subsequence có thể là "bbbb".

Ví dụ 2:

```plain
Input:
"cbbd"
Output:
2
```

Một longest palindromic subsequence có thể là "bb".

**Dynamic Programming:** `dp[i][j] = dp[i+1][j-1] + 2 if s.charAt(i) == s.charAt(j) otherwise, dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1])`

```java
class Solution {
    public int longestPalindromeSubseq(String s) {
        int len = s.length();
        int [][] dp = new int[len][len];
        for(int i = len - 1; i>=0; i--){
            dp[i][i] = 1;
            for(int j = i+1; j < len; j++){
                if(s.charAt(i) == s.charAt(j))
                    dp[i][j] = dp[i+1][j-1] + 2;
                else
                    dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1]);
            }
        }
        return dp[0][len-1];
    }
}
```

## 5. Độ sâu khớp ngoặc

> iQIYI 2018 Java tuyển dụng mùa thu:
> Một chuỗi khớp ngoặc hợp lệ được định nghĩa như sau:
>
> 1. Chuỗi rỗng "" là một chuỗi khớp ngoặc hợp lệ
> 2. Nếu "X" và "Y" đều là chuỗi khớp ngoặc hợp lệ, "XY" cũng là chuỗi khớp ngoặc hợp lệ
> 3. Nếu "X" là chuỗi khớp ngoặc hợp lệ, thì "(X)" cũng là chuỗi khớp ngoặc hợp lệ
> 4. Mỗi chuỗi khớp ngoặc hợp lệ đều có thể được tạo ra từ các quy tắc trên.
>
> Ví dụ: "","()","()()","((()))" đều là chuỗi ngoặc hợp lệ
> Với chuỗi ngoặc hợp lệ, chúng ta định nghĩa độ sâu của nó như sau:
>
> 1. Độ sâu của chuỗi rỗng "" là 0
> 2. Nếu độ sâu của chuỗi "X" là x, độ sâu của chuỗi "Y" là y, thì độ sâu của chuỗi "XY" là max(x,y)
> 3. Nếu độ sâu của "X" là x, thì độ sâu của chuỗi "(X)" là x+1
>
> Ví dụ: Độ sâu của "()()()" là 1, độ sâu của "((()))" là 3. Bạn được cho một chuỗi ngoặc hợp lệ, hãy tính độ sâu của nó.

```plain
Mô tả input:
Input là một chuỗi ngoặc hợp lệ s, độ dài length của s (2 ≤ length ≤ 50), chuỗi chỉ chứa '(' và ')'.

Mô tả output:
Output một số nguyên dương, tức là độ sâu của chuỗi này.
```

Ví dụ:

```plain
Input:
(())
Output:
2
```

Code:

```java
import java.util.Scanner;

/**
 * https://www.nowcoder.com/test/8246651/summary
 *
 * @author Snailclimb
 * @date 2018年9月6日
 * @Description: TODO Tính độ sâu của chuỗi ngoặc hợp lệ cho trước
 */
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    String s = sc.nextLine();
    int cnt = 0, max = 0, i;
    for (i = 0; i < s.length(); ++i) {
      if (s.charAt(i) == '(')
        cnt++;
      else
        cnt--;
      max = Math.max(max, cnt);
    }
    sc.close();
    System.out.println(max);
  }
}

```

## 6. Chuyển đổi chuỗi thành số nguyên

> Sword Offer: Chuyển đổi một chuỗi thành một số nguyên (implement chức năng của Integer.valueOf(string), nhưng khi string không đúng định dạng số thì trả về 0), yêu cầu không được dùng library function để chuyển đổi chuỗi thành số nguyên. Trả về 0 nếu giá trị là 0 hoặc chuỗi không phải một giá trị số hợp lệ.

```java
//https://www.weiweiblog.cn/strtoint/
public class Main {

  public static int StrToInt(String str) {
    if (str.length() == 0)
      return 0;
    char[] chars = str.toCharArray();
    // Kiểm tra có dấu không
    int flag = 0;
    if (chars[0] == '+')
      flag = 1;
    else if (chars[0] == '-')
      flag = 2;
    int start = flag > 0 ? 1 : 0;
    int res = 0;// Lưu kết quả
    for (int i = start; i < chars.length; i++) {
      if (Character.isDigit(chars[i])) {// Gọi Character.isDigit(char) để kiểm tra có phải chữ số không, có thì True, không thì False
        int temp = chars[i] - '0';
        res = res * 10 + temp;
      } else {
        return 0;
      }
    }
   return flag != 2 ? res : -res;

  }

  public static void main(String[] args) {
    // TODO Auto-generated method stub
    String s = "-12312312";
    System.out.println("Chuyển đổi bằng library function: " + Integer.valueOf(s));
    int res = Main.StrToInt(s);
    System.out.println("Chuyển đổi bằng method tự viết: " + res);

  }

}

```

<!-- @include: @article-footer.snippet.md -->
