---
title: Tổng hợp các phương án lọc từ nhạy cảm
description: Giải thích chi tiết các phương án lọc từ nhạy cảm, từ thuật toán khớp brute force đến Trie tree, AC automaton, bao gồm phân tích độ phức tạp, thực hành kỹ thuật và chiến lược tối ưu trong môi trường đồng thời cao.
category: Thiết kế hệ thống
tag:
  - Bảo mật
  - Cấu trúc dữ liệu
head:
  - - meta
    - name: keywords
      content: 敏感词过滤,Trie树,DFA算法,AC自动机,双数组Trie,字符串匹配,KMP算法,内容安全,原子热替换
---

Lọc từ nhạy cảm là khâu cốt lõi của an toàn nội dung. Dù là mạng xã hội, nền tảng thương mại điện tử, trò chơi trực tuyến, hay các ứng dụng AI ngày nay, đều cần lọc thời gian thực nội dung đầu vào và nội dung được tạo ra, ngăn chặn sự lan truyền của các thông tin vi phạm như nội dung khiêu dâm, bạo lực, phát biểu thù hận.

Từ góc độ kỹ thuật, lọc từ nhạy cảm về bản chất là **vấn đề khớp chuỗi đa mẫu**: tìm đồng thời nhiều từ khóa trong một đoạn văn bản.

Bài viết này gần 2 vạn chữ, tôi sẽ bắt đầu từ sự tiến hóa thuật toán, và chia sẻ một số kinh nghiệm thực tế như đối phó với từ biến dạng, tối ưu đồng thời cao, quản lý từ điển.

**Kết luận cốt lõi**:

| Thuật toán                  | Tình huống phù hợp           | Đặc điểm                                      |
| --------------------------- | ---------------------------- | --------------------------------------------- |
| **Trie tree**               | Quy mô từ điển nhỏ (< 1 vạn) | Triển khai đơn giản, dễ hiểu                  |
| **AC automaton**            | Tình huống thông lượng cao   | Một lần quét khớp tất cả từ, hiệu năng tối ưu |
| **Double-Array Trie (DAT)** | Từ điển quy mô lớn (> 1 vạn) | Chiếm dụng bộ nhớ thấp, chi phí xây dựng cao  |

## Tiến hóa thuật toán

Dưới đây theo thứ tự **từ đơn giản đến phức tạp**, giới thiệu dần các thuật toán lọc từ nhạy cảm, xem mỗi bước tối ưu có động cơ và hiệu quả gì.

### Khớp brute force (Thuật toán BF)

**Khớp brute force (Brute Force)** là phương án trực quan nhất: duyệt qua từng vị trí trong văn bản, thử khớp từng từ nhạy cảm.

Giả sử từ điển nhạy cảm có `n` từ, độ dài trung bình là `m`, độ dài văn bản cần khớp là `L`:

```java
public List<String> bruteForceMatch(String text, List<String> words) {
    List<String> result = new ArrayList<>();
    for (String word : words) {              // O(n)：duyệt qua từng từ nhạy cảm
        if (text.contains(word)) {           // O(L × m)：khớp chuỗi con brute force
            result.add(word);
        }
    }
    return result;
}
```

**Độ phức tạp thời gian**: O(n × L × m)

| Tình huống | Số từ nhạy cảm | Độ dài văn bản | Độ dài từ TB | Số thao tác |
| ---------- | -------------- | -------------- | ------------ | ----------- |
| Quy mô nhỏ | 100            | 1000           | 5            | 50 vạn      |
| Quy mô TB  | 1000           | 5000           | 5            | 2500 vạn    |
| Quy mô lớn | 10000          | 10000          | 5            | 5 tỷ        |

**Phân tích vấn đề**:

1. **Quét lặp**: Mỗi từ nhạy cảm đều phải duyệt qua toàn bộ đoạn văn, nhiều ký tự bị so sánh lặp đi lặp lại.
2. **Không tái sử dụng trạng thái**: Không có liên kết giữa các từ nhạy cảm, không thể tận dụng thông tin đã khớp.
3. **Khả năng mở rộng kém**: Khi từ điển tăng trưởng, hiệu năng giảm tuyến tính.

Khi từ điển đạt đến vạn từ, độ trễ khớp brute force sẽ đạt đến cấp giây, hoàn toàn không đáp ứng được yêu cầu hiệu năng của dịch vụ trực tuyến.

### Trie tree: Tận dụng tiền tố để giảm so sánh

**Trie tree** (phát âm /ˈtraɪ/) còn gọi là từ điển cây, cây tiền tố, tối ưu khớp brute force qua chiến lược **không gian đổi thời gian**. Ý tưởng cốt lõi là: tận dụng **tiền tố chung** của chuỗi để giảm chi phí lưu trữ và thời gian truy vấn.

Chức năng gợi ý từ khóa trong thanh tìm kiếm trình duyệt có thể được triển khai dựa trên Trie tree:

![Hiệu ứng demo Trie tree trình duyệt](https://oss.javaguide.cn/github/javaguide/system-design/security/brower-trie.png)

#### Tính chất cơ bản

Trie tree có 3 tính chất cơ bản sau:

1. **Nút gốc không chứa ký tự**, ngoài nút gốc mỗi nút chỉ chứa một ký tự.
2. **Từ nút gốc đến một nút nào đó**, các ký tự trên đường đi nối lại tạo thành chuỗi tương ứng với nút đó.
3. **Tất cả các nút con của mỗi nút chứa các ký tự khác nhau**.

#### Ví dụ cấu trúc

Giả sử trong từ điển nhạy cảm có các từ sau:

- 高清视频
- 高清 CV
- 东京冷
- 东京热

Cấu trúc Trie tree được xây dựng như sau (nút màu đỏ đánh dấu kết thúc chuỗi):

![Trie tree từ nhạy cảm](https://oss.javaguide.cn/github/javaguide/system-design/security/sensitive-word-trie.png)

Khi tìm kiếm chuỗi "东京热", hãy tách nó thành các ký tự đơn "东", "京", "热", sau đó khớp từng tầng từ nút gốc.

#### So sánh với khớp brute force

Giả sử từ điển là `["she", "he", "his", "hers"]`, tìm trong văn bản `"ushers"`:

| Thuật toán       | Quá trình khớp                      | Số lần so sánh ký tự |
| ---------------- | ----------------------------------- | -------------------- |
| Khớp brute force | Lần lượt quét văn bản với 4 từ      | Khoảng 24 lần¹       |
| Trie tree        | Từ mỗi vị trí bắt đầu, khớp dọc cây | Khoảng 10 lần        |

> ¹ Đây là ước tính đơn giản hóa (số từ × độ dài văn bản), số lần so sánh tối tệ thực tế phụ thuộc vào độ dài từng từ và vị trí văn bản, sẽ cao hơn.

Ưu thế của Trie tree là: **tất cả từ nhạy cảm chia sẻ cùng một cây**, một lần duyệt có thể thử khớp tất cả từ.

#### Phân tích độ phức tạp

| Chỉ số                 | Triển khai HashMap | Triển khai mảng |
| ---------------------- | ------------------ | --------------- |
| Tiền xử lý             | O(n × m)           | O(n × m × σ)    |
| Thời gian truy vấn     | O(L × m)           | O(L × m)        |
| Độ phức tạp không gian | O(n × m)           | O(n × m × σ)    |

> σ là kích thước bộ ký tự (khoảng 2 vạn ký tự Hán, ASCII chỉ 128). Ví dụ code trong bài sử dụng triển khai `HashMap`, phù hợp với bộ ký tự lớn như tiếng Trung; triển khai mảng phù hợp với bộ ký tự nhỏ (như thuần tiếng Anh).

#### Ví dụ code

```java
public class SimpleTrie {
    private static class Node {
        Map<Character, Node> children = new HashMap<>();
        boolean isEnd;
    }

    private final Node root = new Node();

    // Thêm từ nhạy cảm
    public void addWord(String word) {
        Node node = root;
        for (char c : word.toCharArray()) {
            node = node.children.computeIfAbsent(c, k -> new Node());
        }
        node.isEnd = true;
    }

    // Phát hiện văn bản có chứa từ nhạy cảm không
    public boolean contains(String text) {
        for (int i = 0; i < text.length(); i++) {
            Node node = root;
            for (int j = i; j < text.length(); j++) {
                node = node.children.get(text.charAt(j));
                if (node == null) break;
                if (node.isEnd) return true;
            }
        }
        return false;
    }

    // Lấy tất cả từ nhạy cảm khớp trong văn bản
    public List<String> matchAll(String text) {
        List<String> result = new ArrayList<>();
        for (int i = 0; i < text.length(); i++) {
            Node node = root;
            for (int j = i; j < text.length(); j++) {
                node = node.children.get(text.charAt(j));
                if (node == null) break;
                if (node.isEnd) {
                    result.add(text.substring(i, j + 1));
                }
            }
        }
        return result;
    }
}
```

#### Hạn chế của Trie tree

Dù Trie tree cải thiện đáng kể so với khớp brute force, nhưng vẫn còn **vấn đề backtrack**:

Trong văn bản `"ushers"` tìm từ điển `["she", "he", "his"]`:

1. Bắt đầu từ vị trí 1, khớp `"s" → "h" → "e"`, tìm thấy `"she"`
2. Sau khi khớp xong, **quay lại vị trí 2**, bắt đầu lại khớp `"h" → "e"`, tìm thấy `"he"`

Chiến lược "quay lui về vị trí tiếp theo sau khi khớp thất bại" này, trong trường hợp xấu nhất (ví dụ văn bản `"aaaaaaaa"` khớp từ `"aaaaab"`) sẽ thoái hóa về O(L × m).

Có thể **hoàn toàn không backtrack** không? Điều này dẫn đến AC automaton.

**Lưu ý**: `PatriciaTrie` được cung cấp bởi [Apache Commons Collections](https://mvnrepository.com/artifact/org.apache.commons/commons-collections4) là Trie nhị phân nén dựa trên **bit operation** (PATRICIA = Practical Algorithm To Retrieve Information Coded In Alphanumeric), nguyên lý khác với **Trie cấp ký tự** được mô tả trong bài này, không phù hợp để trực tiếp sử dụng cho tình huống lọc từ nhạy cảm tiếng Trung.

### AC automaton: Một lần quét khớp tất cả từ

**AC automaton (Aho-Corasick Automaton)** là thuật toán khớp đa mẫu được xây dựng trên Trie tree, được đề xuất bởi Alfred V. Aho và Margaret J. Corasick tại Bell Labs năm 1975.

Ý tưởng cốt lõi giống với thuật toán KMP: **tận dụng thông tin đã khớp, khi khớp thất bại nhảy đến vị trí thích hợp để tiếp tục khớp, tránh backtrack**. Điểm khác biệt là KMP xử lý chuỗi mẫu đơn, còn AC automaton xử lý chuỗi đa mẫu.

#### Các thành phần cốt lõi

Hoạt động của AC automaton dựa vào ba hàm cốt lõi:

| Hàm             | Vai trò                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------- |
| **Hàm goto**    | Chuyển đổi trạng thái: sau khi đọc ký tự từ trạng thái hiện tại nhảy đến trạng thái nào           |
| **Hàm failure** | Nhảy khi thất bại: khi thất bại nhảy đến trạng thái "hậu tố dài nhất giống nhau", tránh backtrack |
| **Hàm output**  | Đầu ra khớp: ghi lại tập hợp từ khớp tương ứng với mỗi trạng thái                                 |

#### Các bước xây dựng

Xây dựng AC automaton gồm ba bước:

![Luồng xây dựng và khớp AC automaton](https://oss.javaguide.cn/github/javaguide/system-design/security/sensitive-word-ac-automaton-flow.png)

**Bước một: Xây dựng Trie tree**

Chèn tất cả chuỗi mẫu vào Trie tree, tạo thành khung cơ bản của automaton. Đánh dấu kết thúc trên nút cuối của mỗi chuỗi mẫu.

**Bước hai: Xây dựng con trỏ fail (cốt lõi)**

Con trỏ fail là cơ chế cốt lõi của AC automaton. Vai trò của nó là: **khi ký tự hiện tại không thể tiếp tục khớp, nhảy đến trạng thái nào để tiếp tục thử, thay vì quay về điểm bắt đầu**.

Quá trình xây dựng sử dụng BFS (duyệt theo chiều rộng) duyệt theo từng tầng, cho nút hiện tại `temp`:

1. Tìm nút fail của nút cha `temp`
2. Trong các nút con của nút fail đó tìm nút có cùng ký tự với `temp`
3. Nếu tìm thấy, thì `temp.fail` trỏ đến nút con đó
4. Nếu không tìm thấy, tiếp tục tìm nút fail của fail, đến khi tìm thấy hoặc về root

**Bản chất của con trỏ fail**: Trỏ đến trạng thái mà **hậu tố dài nhất** của chuỗi tương ứng với trạng thái hiện tại đang ở đó.

::: tip Mối quan hệ với KMP
Con trỏ fail là tổng quát hóa của mảng next trong thuật toán KMP trên Trie tree. Ví dụ: hậu tố `"he"` của `"she"` giống với tiền tố của `"he"`, vì vậy con trỏ fail của `'e'` kết thúc `"she"` trỏ đến `'e'` trong `"he"`.
:::

**Bước ba: Khớp mẫu**

Bắt đầu quét từ đầu chuỗi văn bản, con trỏ `p` ban đầu trỏ đến root:

1. **Chuyển đổi trạng thái**: Nếu ký tự hiện tại trong các nút con của `p`, `p` di chuyển xuống; nếu không, lùi theo chuỗi fail, đến khi có thể khớp hoặc về root
2. **Thu thập đầu ra**: **[Quan trọng]** Sau mỗi lần chuyển đổi, **phải duyệt một lần theo chuỗi fail**, thu thập tất cả từ khớp ở các trạng thái kết thúc

Tại sao phải duyệt theo chuỗi fail? Vì hậu tố của một từ dài có thể là một từ ngắn khác. Ví dụ khi `"she"` khớp thành công, duyệt theo chuỗi fail có thể tìm thấy `"he"`, nếu không sẽ bỏ lỡ từ lồng ghép.

#### Ví dụ code

```java
public class AhoCorasickAutomaton {
    private static class Node {
        Map<Character, Node> children = new HashMap<>();
        Node fail;                    // Con trỏ thất bại
        List<String> outputs = new ArrayList<>(); // Từ khớp tương ứng với trạng thái này
    }

    private final Node root = new Node();

    // Bước một: Xây dựng Trie tree
    public void addWord(String word) {
        Node node = root;
        for (char c : word.toCharArray()) {
            node = node.children.computeIfAbsent(c, k -> new Node());
        }
        node.outputs.add(word); // Nút cuối ghi lại từ khớp
    }

    // Bước hai: Xây dựng con trỏ fail (BFS)
    public void buildFailPointer() {
        Queue<Node> queue = new LinkedList<>();
        root.fail = root;

        // Các nút con trực tiếp của nút gốc, fail trỏ về root
        for (Node child : root.children.values()) {
            child.fail = root;
            queue.offer(child);
        }

        while (!queue.isEmpty()) {
            Node current = queue.poll();
            for (Map.Entry<Character, Node> entry : current.children.entrySet()) {
                char c = entry.getKey();
                Node child = entry.getValue();

                // Dọc theo chuỗi fail của nút cha tìm xem có chuyển đổi ký tự c không
                Node fail = current.fail;
                while (fail != root && !fail.children.containsKey(c)) {
                    fail = fail.fail;
                }
                child.fail = fail.children.getOrDefault(c, root);
                // Tránh vòng lặp tự: nếu fail trỏ về chính nó, đổi thành trỏ về root
                if (child.fail == child) {
                    child.fail = root;
                }
                // Hợp nhất đầu ra của nút fail (quan trọng!)
                child.outputs.addAll(child.fail.outputs);
                queue.offer(child);
            }
        }
    }

    // Bước ba: Khớp mẫu (một lần quét)
    public List<String> match(String text) {
        List<String> result = new ArrayList<>();
        Node state = root;

        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            // Dọc theo chuỗi fail tìm trạng thái có thể xử lý ký tự c
            while (state != root && !state.children.containsKey(c)) {
                state = state.fail;
            }
            state = state.children.getOrDefault(c, root);
            // Thu thập tất cả từ khớp của trạng thái hiện tại (đã hợp nhất qua chuỗi fail)
            result.addAll(state.outputs);
        }
        return result;
    }
}
```

Ví dụ sử dụng:

```java
AhoCorasickAutomaton ac = new AhoCorasickAutomaton();
ac.addWord("she");
ac.addWord("he");
ac.addWord("her");
ac.addWord("hers");
ac.buildFailPointer(); // Sau khi chèn tất cả từ, xây dựng một lần con trỏ fail

List<String> matches = ac.match("ushers");
// Đầu ra: [she, he, her, hers]
```

#### So sánh hiệu năng

| Thuật toán       | Tiền xử lý | Thời gian khớp | Đặc điểm                                                      |
| ---------------- | ---------- | -------------- | ------------------------------------------------------------- |
| Khớp brute force | O(1)       | O(L × n × m)   | Mỗi từ quét riêng biệt                                        |
| Trie tree        | O(n × m)   | O(L × m)       | Có thể backtrack                                              |
| AC automaton     | O(n × m)¹  | O(L + z)       | Một lần quét, z là tổng số lần khớp (bao gồm khớp chồng lấp)² |

> 1. Khi dùng HashMap lưu nút con là O(n × m); nếu dùng mảng (cần phân bổ trước kích thước bộ ký tự σ), thì là O(n × m × σ).
> 2. Trong tình huống cực đoan, nếu từ điển có nhiều từ lồng nhau (như "a", "ab", "abc", ..., "abc...z"), z có thể lớn hơn nhiều so với L, lúc này thời gian do z chi phối. Trong thực tế kỹ thuật thông thường từ điển nhạy cảm không có lồng ghép cực đoan như vậy.

AC automaton thực hiện **khớp thời gian tuyến tính**, không liên quan đến số lượng từ nhạy cảm, chỉ liên quan đến độ dài văn bản và số lượng kết quả khớp.

Kết hợp AC automaton với DAT ([AhoCorasickDoubleArrayTrie](https://github.com/hankcs/AhoCorasickDoubleArrayTrie)), có thể đồng thời đảm bảo hiệu quả khớp và chiếm dụng bộ nhớ.

### Double-Array Trie (DAT): Nén chiếm dụng bộ nhớ

Trie tree tiêu chuẩn chiếm dụng bộ nhớ lớn (mỗi nút cần một Map), trong thực tế kỹ thuật thường dùng phiên bản cải tiến—**Double-Array Trie (DAT)**.

DAT được đề xuất bởi Aoe Jun-ichi và các cộng sự tại Nhật Bản trong bài báo [《An Efficient Implementation of Trie Structures》](https://www.co-ding.com/assets/pdf/dat.pdf) năm 1989. Nó nén cấu trúc Trie qua hai mảng số nguyên (base[] và check[]):

| Đặc tính               | Trie tiêu chuẩn (triển khai mảng) | Double-Array Trie                                       |
| ---------------------- | --------------------------------- | ------------------------------------------------------- |
| Độ phức tạp không gian | O(n × m × σ)                      | O(n × m)                                                |
| Chiếm dụng bộ nhớ      | Khá lớn                           | Thường có thể giảm xuống 20%~30% so với triển khai mảng |
| Độ phức tạp triển khai | Đơn giản                          | Khá phức tạp (cần xử lý xung đột)                       |

**Lưu ý**: Hiệu quả nén của DAT có liên quan chặt chẽ với tỷ lệ tiền tố chung của từ điển. Trong trường hợp cực đoan (không có tiền tố chung), hiệu quả nén hạn chế.

Tham khảo triển khai: <https://github.com/komiya-atsushi/darts-java>

### Triển khai DFA: Đóng gói kỹ thuật

**DFA (Deterministic Finite Automaton, Ôtô hữu hạn tất định)** là khái niệm trong lý thuyết automaton. Từ góc độ triển khai, một lần khớp từ gốc của Trie bản thân đã là một quá trình chạy DFA—mỗi nút đại diện cho một trạng thái, mỗi cạnh đại diện cho một chuyển đổi ký tự. Tuy nhiên, khớp Trie thông thường cần khởi động lại DFA từ mỗi vị trí trong văn bản, còn AC automaton thông qua con trỏ fail hoàn thiện tất cả chuyển đổi trạng thái, mới là **DFA đa mẫu một lần quét** thực sự.

[Hutool 5.8.x](https://hutool.cn/docs/#/dfa/%E6%A6%82%E8%BF%B0) cung cấp triển khai lọc từ nhạy cảm dựa trên DFA (lớp dưới là Trie):

![Thuật toán DFA của Hutool](https://oss.javaguide.cn/github/javaguide/system-design/security/hutool-dfa.png)

```java
WordTree wordTree = new WordTree();
wordTree.addWord("大");
wordTree.addWord("大憨憨");
wordTree.addWord("憨憨");

String text = "那人真是个大憨憨！";

// Lấy từ khóa đầu tiên khớp
String matchStr = wordTree.match(text);
System.out.println(matchStr); // Đầu ra: 大

// matchAll(text, limit, isDensityMatch, isGreedy)
// - limit: giới hạn số lượng khớp, -1 là không giới hạn
// - isDensityMatch: có khớp mật độ không (tiếp tục tìm từ chồng lấp bên trong từ đã khớp)
// - isGreedy: có khớp tham lam không (true khớp từ dài nhất, false khớp từ ngắn nhất)
List<String> matchStrList = wordTree.matchAll(text, -1, false, false);
System.out.println(matchStrList); // Đầu ra: [大, 憨憨]

List<String> matchStrList2 = wordTree.matchAll(text, -1, false, true);
System.out.println(matchStrList2); // Đầu ra: [大, 大憨憨]
```

**Giải thích đầu ra**:

- `matchAll(text, -1, false, false)`: Không tham lam + không khớp mật độ

  - Bắt đầu từ vị trí 0, `"大"` khớp thành công (khớp ngắn nhất)
  - Sau khi bỏ qua ký tự đã khớp, `"憨憨"` bắt đầu từ vị trí 2 khớp thành công
  - Kết quả: `[大, 憨憨]`

- `matchAll(text, -1, false, true)`: Tham lam + không khớp mật độ
  - Bắt đầu từ vị trí 0, `"大憨憨"` khớp thành công (khớp dài nhất)
  - Đồng thời `"大"` cũng khớp thành công (là tiền tố)
  - Kết quả: `[大, 大憨憨]`

## Đối phó với từ biến dạng

Trong tình huống thực tế, người dùng thường dùng các cách sau để vượt qua lọc từ nhạy cảm:

| Cách biến dạng            | Ví dụ                 | Chiến lược ứng phó                           |
| ------------------------- | --------------------- | -------------------------------------------- |
| Đồng âm                   | "赌博" → "读博"       | Duy trì từ điển đồng âm                      |
| Chèn ký tự đặc biệt       | "fuck" → "f\*u\*c\*k" | Tiền xử lý loại bỏ ký tự đặc biệt            |
| Hỗn hợp phồn thể giản thể | "台灣" → "台湾"       | Thống nhất chuyển đổi sang giản thể rồi khớp |
| Ký tự toàn góc            | "abc" → "ａｂｃ"      | Chuyển toàn góc sang nửa góc                 |

**Tiền làm sạch** là chiến lược phổ biến để xử lý từ biến dạng: chuẩn hóa văn bản trước khi khớp.

```java
public String preprocess(String text) {
    StringBuilder sb = new StringBuilder();
    for (char c : text.toCharArray()) {
        c = toHalfWidth(c);                    // Toàn góc sang nửa góc
        c = Character.toLowerCase(c);          // Thống nhất chữ thường
        if (isChineseOrAlphanumeric(c)) {      // Giữ lại tiếng Trung và chữ số
            sb.append(c);
        }
    }
    return toSimplifiedChinese(sb.toString()); // Phồn thể sang giản thể
}

private char toHalfWidth(char c) {
    if (c >= 'Ａ' && c <= 'Ｚ') return (char) (c - 'Ａ' + 'A');
    if (c >= 'ａ' && c <= 'ｚ') return (char) (c - 'ａ' + 'a');
    if (c >= '０' && c <= '９') return (char) (c - '０' + '0');
    return c;
}

private boolean isChineseOrAlphanumeric(char c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')
        || (c >= '0' && c <= '9') || (c >= '一' && c <= '龥');
}
```

Các thư viện trưởng thành như [ToolGood.Words](https://github.com/toolgood/ToolGood.Words) đã tích hợp sẵn các chức năng như chuyển đổi phồn giản thể, chuyển đổi toàn góc nửa góc, có thể sử dụng trực tiếp.

::: warning Lưu ý

- **Ánh xạ vị trí**: Phương thức `preprocess` sẽ loại bỏ ký tự đặc biệt, dẫn đến vị trí văn bản sau làm sạch và văn bản gốc không còn tương ứng một-một. Nếu nghiệp vụ cần trả về vị trí chính xác của từ nhạy cảm trong văn bản gốc (như đánh dấu nổi bật, thay thế một phần), cần duy trì bảng ánh xạ từ vị trí sau làm sạch sang vị trí gốc.
- **Giới hạn Unicode**: Code trên dùng `char` duyệt ký tự. `char` của Java là đơn vị mã hóa UTF-16, các ký tự ngoài BMP (như một số emoji, ký tự mở rộng chữ Hán) sẽ chiếm hai `char` (surrogate pair), duyệt theo `char` sẽ làm những ký tự này bị tách sai. Nếu cần hỗ trợ ký tự mặt phẳng bổ sung, nên sử dụng luồng `codePoints()` xử lý.
  :::

## Tối ưu đồng thời cao

### Hoán đổi nóng nguyên tử: Hỗ trợ cập nhật nóng từ điển

Trong môi trường sản xuất, từ điển nhạy cảm cần cập nhật thường xuyên, nhưng không thể ảnh hưởng đến các yêu cầu khớp đang thực hiện. Thực hiện hoán đổi nóng nguyên tử (Atomic Hot-Swap) qua `AtomicReference`: trước tiên xây dựng Trie mới ở nền, sau khi xây dựng xong thay thế nguyên tử Trie cũ, đảm bảo luồng đọc không bị ảnh hưởng.

```java
public class SensitiveWordFilter {
    private final AtomicReference<SimpleTrie> trieRef;

    public SensitiveWordFilter(List<String> initialWords) {
        this.trieRef = new AtomicReference<>(buildTrie(initialWords));
    }

    // Khi khớp lấy Trie hiện tại
    public List<String> match(String text) {
        SimpleTrie trie = trieRef.get();
        return trie != null ? trie.matchAll(text) : Collections.emptyList();
    }

    // Cập nhật từ điển: trước tiên xây dựng Trie mới, rồi publish nguyên tử
    public void refreshWords(List<String> newWords) {
        SimpleTrie newTrie = buildTrie(newWords);
        trieRef.set(newTrie);  // Publish nguyên tử, hiển thị ngay với luồng đọc
    }

    private SimpleTrie buildTrie(List<String> words) {
        SimpleTrie trie = new SimpleTrie();
        for (String word : words) {
            trie.addWord(word);
        }
        return trie;
    }
}
```

**Điểm mấu chốt**:

- Sử dụng `AtomicReference` đảm bảo thao tác chuyển đổi là nguyên tử.
- Trie cũ có thể vẫn còn luồng đang sử dụng, phụ thuộc GC để tự thu hồi.
- Có thể xây dựng Trie mới bất đồng bộ ở nền, không ảnh hưởng đến phản hồi dịch vụ.

### Xử lý song song: Phân đoạn văn bản dài

Đối với văn bản cực dài (như bài viết, bình luận), có thể xử lý song song sau khi phân đoạn.

**Lưu ý**: Khi phân đoạn phải thêm vùng chồng lấp, nếu không sẽ bỏ sót từ nhạy cảm bắc qua biên.

```java
// Dùng thread pool độc lập, tránh chiếm dụng ForkJoinPool.commonPool()
private final ExecutorService filterExecutor =
    new ThreadPoolExecutor(
        4, 8, 60L, TimeUnit.SECONDS,
        LinkedBlockingQueue<>(1000),
        new ThreadPoolExecutor.CallerRunsPolicy() // Khi hàng đợi đầy, luồng gọi thực thi, thực hiện back pressure
    );

public List<String> parallelMatch(String text, int chunkSize, int maxWordLength) {
    // Vùng chồng lấp = độ dài từ nhạy cảm dài nhất - 1, ngăn bỏ sót từ bắc qua biên
    int overlap = maxWordLength - 1;
    List<CompletableFuture<List<String>>> futures = new ArrayList<>();

    for (int i = 0; i < text.length(); i += chunkSize) {
        int start = i;
        int end = Math.min(i + chunkSize + overlap, text.length());
        String chunk = text.substring(start, end);

        // Truyền rõ ràng thread pool tùy chỉnh
        futures.add(CompletableFuture.supplyAsync(() ->
            trieRef.get().matchAll(chunk), filterExecutor
        ));
    }

    return futures.stream()
        .flatMap(f -> f.join().stream())
        .distinct()
        .collect(Collectors.toList());
}
```

**Tại sao cần vùng chồng lấp?**

Giả sử từ nhạy cảm `"赌博网站"` dài 4 ký tự, kích thước khối là 100. Nếu văn bản vừa xuất hiện từ đó từ vị trí 99, sẽ bị cắt thành hai chunk:

- chunk1: `...văn bản kết thúc ở vị trí 99赌`
- chunk2: `博网站tiếp theo...`

Cả hai chunk đều không thể khớp hoàn chỉnh `"赌博网站"`, dẫn đến báo thiếu. Vùng chồng lấp đảm bảo mỗi từ nhạy cảm đều có thể xuất hiện hoàn chỉnh trong ít nhất một chunk.

### Loại trừ nhanh: Bloom filter

Dùng **Bloom filter** để lọc sơ bộ, có thể nhanh chóng loại trừ văn bản không chứa từ nhạy cảm.

**Điều kiện tiên quyết phù hợp**: Phương án này chỉ có lợi khi phần lớn văn bản không chứa từ nhạy cảm và tỷ lệ dương tính giả của Bloom filter cực thấp. Vì bản thân `quickCheck` có độ phức tạp O(L × maxWordLen), cùng bậc với khớp Trie, nếu văn bản thường xuyên kích hoạt Bloom filter (dương tính giả), ngược lại sẽ tăng thêm chi phí.

**Lưu ý**: Bloom filter phát hiện mối quan hệ thành viên tập hợp của phần tử đơn lẻ, cần phát hiện các chuỗi con của văn bản, chứ không phải toàn bộ đoạn văn.

```java
public List<String> matchWithBloomFilter(String text, int maxWordLength) {
    // Kiểm tra nhanh: quét tất cả chuỗi con có thể
    if (!quickCheck(text, maxWordLength)) {
        return Collections.emptyList();  // Chắc chắn không chứa từ nhạy cảm
    }
    // Có thể chứa từ nhạy cảm, tiến hành khớp chính xác
    return trieRef.get().matchAll(text);
}

private boolean quickCheck(String text, int maxWordLen) {
    BloomFilter<String> filter = getBloomFilter();  // Bloom filter chứa tất cả từ nhạy cảm
    for (int i = 0; i < text.length(); i++) {
        for (int len = 1; len <= maxWordLen && i + len <= text.length(); len++) {
            if (filter.mightContain(text.substring(i, i + len))) {
                return true;  // Có thể chứa, cần khớp chính xác
            }
        }
    }
    return false;  // Chắc chắn không chứa
}
```

**Tình huống phù hợp**: Khi tỷ lệ phủ từ nhạy cảm thấp, Bloom filter có thể nhanh chóng loại trừ nhiều văn bản không chứa từ nhạy cảm, giảm số lần khớp Trie. Nhưng bản thân quét Bloom filter cũng có chi phí (O(L × maxWordLen)), cần đánh giá có nên kích hoạt hay không dựa trên đặc điểm dữ liệu thực tế.

## Dự án mã nguồn mở

| Dự án                                                                              | Ngôn ngữ             | JDK tối thiểu | Đặc điểm                                                                                                                                   | Tình huống phù hợp                  |
| ---------------------------------------------------------------------------------- | -------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| [ToolGood.Words](https://github.com/toolgood/ToolGood.Words)                       | C#/Java/Python/Go/JS | Java 8+       | Hỗ trợ đa ngôn ngữ, tích hợp chuyển đổi phồn giản thể, toàn góc nửa góc, chuyển đổi phiên âm; phiên bản C# tốc độ lọc vượt 3 tỷ ký tự/giây | Dự án đa ngôn ngữ                   |
| [Hutool DFA](https://hutool.cn/docs/#/dfa/%E6%A6%82%E8%BF%B0)                      | Java                 | Java 8+       | Nhẹ, API đơn giản, triển khai dựa trên Trie                                                                                                | Từ điển quy mô vừa nhỏ              |
| [AhoCorasickDoubleArrayTrie](https://github.com/hankcs/AhoCorasickDoubleArrayTrie) | Java                 | Java 7+       | AC automaton + Double-Array Trie, hiệu năng xuất sắc                                                                                       | Từ điển quy mô lớn, thông lượng cao |

## Khuyến nghị sản xuất

### Quản lý từ điển

- **Cập nhật định kỳ**: Từ điển nhạy cảm cần duy trì liên tục, hỗ trợ tải nóng tránh khởi động lại dịch vụ.
- **Quản lý phân cấp**: Theo tình huống nghiệp vụ chia thành độ nhạy cảm cao/trung/thấp, áp dụng chiến lược xử lý khác nhau (chặn trực tiếp, kiểm duyệt thủ công, ghi log).
- **Cơ chế danh sách trắng**: Duy trì danh sách trắng ngăn chặn nhận diện sai. Tình huống điển hình như từ nhạy cảm "XXX" nhận diện sai từ thông thường "XXY" (khớp chuỗi con sai), "公安" nhận diện sai "办公安排", v.v. Các chiến lược ứng phó phổ biến bao gồm loại trừ từ nhóm danh sách trắng, yêu cầu độ dài khớp tối thiểu (như chỉ khớp từ hoàn chỉnh chứ không phải chuỗi con), phán định cửa sổ ngữ cảnh, v.v.
- **Log khớp**: Ghi lại kết quả khớp để tối ưu từ điển và phân tích báo cáo sai.

### Xử lý ngoại lệ

- **Tải từ điển thất bại**: Khi xây dựng Trie mới thất bại (như OOM, file hỏng), nên giữ nguyên Trie cũ, ghi log lỗi và cảnh báo.
- **Xử lý từ điển trống**: Khi từ điển trống nên ghi log WARN, thay vì im lặng cho qua tất cả văn bản.
- **Khớp timeout**: Trong tình huống văn bản cực dài + từ điển lớn, có thể đặt timeout circuit breaker, hạ cấp thành cho qua hoặc kiểm duyệt thủ công.

### Chỉ số giám sát

| Chỉ số                  | Ngưỡng khuyến nghị     | Mô tả                                                        |
| ----------------------- | ---------------------- | ------------------------------------------------------------ |
| Độ trễ khớp (p99)       | < 10ms                 | Thời gian lọc mỗi lần                                        |
| Tỷ lệ báo sai           | < 1%                   | Nội dung bình thường bị nhận diện sai là nhạy cảm            |
| Tỷ lệ bỏ sót            | Giám sát liên tục      | Nội dung nhạy cảm không được nhận diện                       |
| Tỷ lệ kích hoạt từ điển | Phân tích theo nhu cầu | Tần số kích hoạt của mỗi từ nhạy cảm, dùng để tối ưu từ điển |

### Khuyến nghị kiến trúc

![](https://oss.javaguide.cn/github/javaguide/system-design/security/sensitive-word-filter-arch.png)

## Tài liệu tham khảo

### Bài báo khoa học

- Aho, A.V. and Corasick, M.J. (1975). "[Efficient string matching: An aid to bibliographic search](https://dl.acm.org/doi/10.1145/360825.360855)." _Communications of the ACM_, 18(6), 333-340.（Bài báo gốc AC automaton）
- Aoe, J., Morimoto, K., and Sato, T. (1989). "[An Efficient Implementation of Trie Structures](https://www.co-ding.com/assets/pdf/dat.pdf)." _Software: Practice and Experience_.

### Bằng sáng chế liên quan

- [Một hệ thống quản lý lọc từ nhạy cảm tự động](https://patents.google.com/patent/CN101964000B)
- [Một phương pháp và hệ thống lọc từ nhạy cảm trong trò chơi mạng](https://patents.google.com/patent/CN103714160A/zh)

<!-- @include: @article-footer.snippet.md -->
