---
title: Tổng hợp tư tưởng thuật toán kinh điển (kèm đề xuất bài LeetCode)
description: Tổng hợp các tư tưởng thuật toán phổ biến và template giải bài, kết hợp đề xuất bài điển hình, nhấn mạnh con đường tư duy và đánh đổi complexity, nhanh chóng xây dựng hệ thống giải bài.
category: Kiến thức cơ bản máy tính
tag:
  - Thuật toán
head:
  - - meta
    - name: keywords
      content: greedy,divide and conquer,backtracking,dynamic programming,binary search,two pointers,algorithm thought,problem recommendations
---

## Greedy Algorithm (Thuật toán tham lam)

### Tư tưởng thuật toán

Bản chất của Greedy là chọn local optimal ở mỗi giai đoạn, từ đó đạt được global optimal.

### Các bước giải bài thông thường

- Phân tích bài toán thành một số bài toán con
- Tìm chiến lược greedy phù hợp
- Tìm nghiệm tối ưu của mỗi bài toán con
- Chồng các local optimal solution thành global optimal solution

### LeetCode

455. Assign Cookies: <https://leetcode.cn/problems/assign-cookies/>

456. Best Time to Buy and Sell Stock: <https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/>

457. Best Time to Buy and Sell Stock II: <https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/>

458. Jump Game: <https://leetcode.cn/problems/jump-game/>

459. Jump Game II: <https://leetcode.cn/problems/jump-game-ii/>

## Dynamic Programming (Lập trình động)

### Tư tưởng thuật toán

Trong Dynamic Programming, mỗi trạng thái nhất định được suy luận từ trạng thái trước — điểm này khác với Greedy. Greedy không có state deduction mà trực tiếp chọn optimal từ local.

Bài kinh điển: 01 Knapsack, Complete Knapsack

### Các bước giải bài thông thường

- Xác định mảng dp (dp table) và ý nghĩa của index
- Xác định công thức truy hồi
- Khởi tạo mảng dp như thế nào
- Xác định thứ tự duyệt
- Suy ra mảng dp bằng ví dụ

### LeetCode

509. Fibonacci Number: <https://leetcode.cn/problems/fibonacci-number/>

510. Min Cost Climbing Stairs: <https://leetcode.cn/problems/min-cost-climbing-stairs/>

511. Partition Equal Subset Sum: <https://leetcode.cn/problems/partition-equal-subset-sum/>

512. Coin Change II: <https://leetcode.cn/problems/coin-change-ii/>

513. Palindromic Substrings: <https://leetcode.cn/problems/palindromic-substrings/>

514. Longest Palindromic Subsequence: <https://leetcode.cn/problems/longest-palindromic-subsequence/>

## Backtracking Algorithm (Thuật toán quay lui)

### Tư tưởng thuật toán

Backtracking thực chất là quá trình tìm kiếm thử nghiệm tương tự như enumeration, chủ yếu là tìm nghiệm của bài toán trong quá trình tìm kiếm. Khi phát hiện điều kiện tìm nghiệm không còn thỏa, "quay lui" và thử đường khác. Bản chất là brute force (liệt kê đầy đủ).

Bài kinh điển: 8 queens

### Các bước giải bài thông thường

- Với bài toán đã cho, định nghĩa solution space — ít nhất phải chứa một nghiệm (tối ưu) của bài toán.
- Xác định cấu trúc solution space dễ search để có thể dùng backtracking search toàn bộ solution space thuận tiện.
- Search solution space theo kiểu depth-first, và trong quá trình search dùng pruning function để tránh invalid search.

### LeetCode

77. Combinations: <https://leetcode.cn/problems/combinations/>

78. Combination Sum: <https://leetcode.cn/problems/combination-sum/>

79. Combination Sum II: <https://leetcode.cn/problems/combination-sum-ii/>

80. Subsets: <https://leetcode.cn/problems/subsets/>

81. Subsets II: <https://leetcode.cn/problems/subsets-ii/>

82. N-Queens: <https://leetcode.cn/problems/n-queens/>

## Divide and Conquer Algorithm (Thuật toán chia để trị)

### Tư tưởng thuật toán

Chia bài toán có quy mô N thành K bài toán con có quy mô nhỏ hơn. Các bài toán con này độc lập với nhau và có cùng tính chất với bài toán gốc. Tìm nghiệm của các bài toán con thì có thể tìm được nghiệm của bài toán gốc.

Bài kinh điển: Binary search, Hanoi Tower

### Các bước giải bài thông thường

- Phân tách bài toán gốc thành một số bài toán con có quy mô nhỏ hơn, độc lập nhau và có cùng hình thức với bài toán gốc.
- Nếu quy mô bài toán con nhỏ và dễ giải thì giải trực tiếp, ngược lại giải đệ quy từng bài toán con.
- Gộp nghiệm của các bài toán con thành nghiệm của bài toán gốc.

### LeetCode

108. Convert Sorted Array to Binary Search Tree: <https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/>

109. Sort List: <https://leetcode.cn/problems/sort-list/>

110. Merge k Sorted Lists: <https://leetcode.cn/problems/merge-k-sorted-lists/>
