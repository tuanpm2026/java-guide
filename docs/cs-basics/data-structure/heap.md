---
description: Phân tích tính chất và thao tác của heap, hiểu triển khai priority queue và ưu thế hiệu năng của heap sort, nắm vững complexity của insert/delete và tình huống thực hành.
category: Kiến thức cơ bản máy tính
tag:
  - Cấu trúc dữ liệu
head:
  - - meta
    - name: keywords
      content: heap,max heap,min heap,priority queue,heapify,sift up,sift down,heap sort
---

# Heap (Đống)

## Heap là gì?

Heap là loại tree thỏa điều kiện sau:

Giá trị của mỗi node trong heap lớn hơn hoặc bằng (hoặc nhỏ hơn hoặc bằng) giá trị của tất cả node trong subtree của nó. Hay nói cách khác, giá trị của bất kỳ node nào cũng lớn hơn hoặc bằng (hoặc nhỏ hơn hoặc bằng) giá trị của tất cả child node.

> Hãy hiểu heap (max heap) như một công ty. Công ty này rất công bằng — ai có năng lực mạnh thì làm sếp, không có chuyện người yếu làm sếp. Người dưới sếp nhất định không mạnh hơn sếp. Điều này giúp hiểu các thao tác của heap tiếp theo.

**!!! Lưu ý đặc biệt:**

- Nhiều blog nói heap là complete binary tree. Thực ra không phải vậy. **Heap không nhất thiết là complete binary tree**. Chỉ là để tiện lưu trữ và indexing, chúng ta thường biểu diễn heap dưới dạng complete binary tree. Thực tế, Fibonacci heap và binomial heap nổi tiếng không phải complete binary tree — chúng thậm chí không phải binary tree.
- **(Binary) heap là một mảng, có thể coi là approximate complete binary tree.** — 《Introduction to Algorithms》 3rd Edition.

Hãy thử xác định xem các hình dưới có phải heap không?

![](./pictures/堆/堆1.png)

Hình 1 và 2 là heap. Hình 1 là max heap — mỗi node đều lớn hơn tất cả node trong subtree. Hình 2 là min heap — mỗi node đều nhỏ hơn tất cả node trong subtree.

Hình 3 không phải heap. Trong hình 3, root node 1 nhỏ hơn 2 và 15, trong khi 15 lớn hơn 3, 19 lớn hơn 5 — không thỏa tính chất heap.

## Công dụng của Heap

Khi chúng ta chỉ quan tâm đến max hoặc min của tất cả data, và có nhiều lần lấy max/min, nhiều lần insert hoặc delete data — có thể dùng heap.

Một số bạn có thể nghĩ đến sorted array. Khởi tạo sorted array time complexity là `O(nlog(n))`. Query max/min time complexity là `O(1)`. Nhưng khi update (insert hoặc delete) data, time complexity là `O(n)` — dù dùng binary search với complexity `O(log(n))` để tìm data cần insert/delete, việc di chuyển data vẫn cần `O(n)`.

**So với sorted array, ưu thế chính của heap là efficiency cao hơn khi insert và delete data.** Vì heap được triển khai dựa trên complete binary tree, khi insert/delete data chỉ cần di chuyển node lên/xuống trong binary tree, time complexity là `O(log(n))` — hiệu quả hơn `O(n)` của sorted array.

Tuy nhiên cần lưu ý: Time complexity khởi tạo Heap là `O(n)`, không phải `O(nlogn)`.

## Phân loại Heap

Heap chia thành **max heap** và **min heap**. Sự khác biệt là cách sắp xếp node.

- **Max heap**: Giá trị của mỗi node đều lớn hơn hoặc bằng giá trị của tất cả node trong subtree của nó.
- **Min heap**: Giá trị của mỗi node đều nhỏ hơn hoặc bằng giá trị của tất cả node trong subtree của nó.

Như hình dưới, hình 1 là max heap, hình 2 là min heap:

![](./pictures/堆/堆2.png)

## Lưu trữ Heap

Như đã đề cập khi giới thiệu tree, nhờ tính chất tuyệt vời của complete binary tree, dùng mảng để lưu binary tree vừa tiết kiệm không gian vừa tiện indexing (nếu root node có sequence number là 1, với bất kỳ node i nào trong tree, left child có sequence number là `2*i`, right child là `2*i+1`).

Để tiện lưu trữ và indexing, (binary) heap có thể được lưu dưới dạng complete binary tree. Cách lưu như hình dưới:

![Lưu trữ Heap](./pictures/堆/堆的存储.png)

## Thao tác với Heap

Các thao tác update chính của heap gồm hai loại: **Insert element** và **Delete heap top element**. Cần nắm vững và hiểu rõ quá trình thao tác.

> Trước khi vào phần chính, nhắc lại một lần nữa: Heap là một công ty công bằng. Người có năng lực tự nhiên sẽ đi đến vị trí phù hợp với năng lực của mình.

### Insert Element (Chèn phần tử)

> Insert element — như nhân viên mới vào công ty, mới đến cần bắt đầu từ vị trí thấp nhất.

**1. Đặt element cần insert vào cuối**

![Heap Insert 1](./pictures/堆/堆-插入元素1.png)

> Người có năng lực sẽ dần được thăng chức tăng lương. Vàng thật không sợ lửa!

**2. Từ dưới lên trên, nếu parent node nhỏ hơn element này thì swap node với parent node. Lặp đến khi không thể swap nữa.**

![Heap Insert 2](./pictures/堆/堆-插入元素2.png)

![Heap Insert 3](./pictures/堆/堆-插入元素3.png)

### Delete Heap Top Element (Xóa phần tử đỉnh)

Theo tính chất heap, phần tử đỉnh của max heap là lớn nhất trong tất cả, phần tử đỉnh của min heap là nhỏ nhất. Khi cần nhiều lần tìm max/min element, có thể dùng heap.

Sau khi xóa heap top element, để duy trì tính chất heap cần điều chỉnh cấu trúc heap — quá trình này gọi là "**heapify (heap hóa)**". Có hai phương pháp heapify:

- **Bottom-up heapify**: Như insert element đã đề cập — element di chuyển từ đáy lên trên.
- **Top-down heapify**: Element di chuyển từ đỉnh xuống dưới. Khi giải thích cách xóa heap top element, tôi sẽ trình bày cả hai quá trình để mọi người cảm nhận sự khác biệt.

#### Bottom-up Heapify (Heap hóa từ dưới lên)

> Trong công ty heap, sẽ có trường hợp sếp nghỉ việc. Sau khi sếp nghỉ, vị trí của họ để trống.

Trước tiên xóa heap top element, làm trống vị trí index 1 trong mảng.

![Delete Heap Top 1](./pictures/堆/删除堆顶元素1.png)

> Vậy ai sẽ thay thế vị trí đó? Tất nhiên là cấp dưới trực tiếp. Ai có năng lực mạnh thì lên!

So sánh left child và right child của root node — tức element ở index 2 và 3 trong mảng. Điền element lớn hơn vào vị trí root node (index 1).

![Delete Heap Top 2](./pictures/堆/删除堆顶元素2.png)

> Lúc này lại có một vị trí trống. Vẫn quy tắc cũ: ai có năng lực thì lên.

Liên tục so sánh left/right child của vị trí trống và di chuyển element lớn hơn vào vị trí trống. Lặp đến đáy heap.

![Delete Heap Top 3](./pictures/堆/删除堆顶元素3.png)

Lúc này đã hoàn thành bottom-up heapify. Không còn element để điền vào vị trí trống. Nhưng có thể thấy mảng có "bong bóng" — gây lãng phí storage space. Tiếp theo thử top-down heapify.

#### Top-down Heapify (Heap hóa từ trên xuống)

Top-down heapify tóm gọn là "đá chìm xuống biển". Việc đầu tiên là nhấc hòn đá lên, ném xuống từ mặt biển. Hòn đá là element cuối cùng của heap — di chuyển element cuối lên heap top.

![Delete Heap Top 4](./pictures/堆/删除堆顶元素4.png)

Sau đó bắt đầu cho hòn đá chìm xuống đáy — liên tục so sánh với left/right child, swap với child lớn hơn, cho đến khi không thể swap nữa.

![Delete Heap Top 5](./pictures/堆/删除堆顶元素5.png)

![Delete Heap Top 6](./pictures/堆/删除堆顶元素6.png)

### Tổng kết thao tác Heap

- **Insert element**: Trước tiên đặt element vào cuối mảng, rồi bottom-up heapify — sift up element ở cuối.
- **Delete heap top element**: Xóa heap top element, đặt element cuối vào heap top, rồi top-down heapify — sift down element ở đỉnh. Cũng có thể bottom-up heapify nhưng sẽ tạo "bong bóng" lãng phí storage space. Tốt nhất dùng top-down heapify.

## Heap Sort (Sắp xếp đống)

Quá trình heap sort gồm hai bước:

- Bước 1: Build heap — xây dựng mảng không có thứ tự thành một heap.
- Bước 2: Sort — lấy heap top element ra, rồi heapify các element còn lại. Lặp đến khi tất cả element được lấy ra.

### Build Heap (Xây dựng Heap)

Nếu đã hiểu rõ quá trình heapify, việc nắm build heap tương đối dễ. Build heap là quá trình top-down heapify đối với tất cả non-leaf node.

Trước tiên cần biết non-leaf node là những node nào. Parent node của node cuối cùng và tất cả element trước nó đều là non-leaf node. Tức là nếu có n node, chúng ta cần top-down heapify (sift down) các node từ n/2 đến 1.

Quá trình cụ thể như hình dưới:

![Build Heap 1](./pictures/堆/建堆1.png)

Trừu tượng hóa mảng không có thứ tự ban đầu thành một tree. Trong hình có 6 node, nên node 4, 5, 6 là leaf node. Node 1, 2, 3 là non-leaf node. Do đó cần top-down heapify (sift down) cho node 1-3. Lưu ý thứ tự là từ sau ra trước — bắt đầu từ node 3, đến node 1.

Kết quả heapify node 3:

![Build Heap 2](./pictures/堆/建堆2.png)

Kết quả heapify node 2:

![Build Heap 3](./pictures/堆/建堆3.png)

Kết quả heapify node 1:

![Build Heap 4](./pictures/堆/建堆4.png)

Đến đây, tree tương ứng với mảng đã trở thành max heap — build heap hoàn thành!

### Sort (Sắp xếp)

Vì heap top element là lớn nhất trong tất cả, chúng ta lặp lại việc lấy heap top element, đặt element lớn nhất này vào cuối mảng, rồi heapify các element còn lại.

Suy nghĩ về hai câu hỏi:

- Sau khi xóa heap top element cần top-down heapify hay bottom-up heapify?
- Element heap top lấy ra cất ở đâu? Tạo mảng mới không?

Trả lời câu hỏi đầu tiên: Cần top-down heapify. Khi heapify cần di chuyển element cuối lên heap top — lúc đó vị trí cuối trống ra. Vì số element trong heap đã giảm, vị trí này sẽ không dùng nữa, nên có thể đặt element lấy ra vào cuối.

Bạn tinh mắt đã nhận ra đây thực ra là một lần swap — swap heap top với element cuối. Như vậy gộp việc lấy heap top element và bước đầu của heapify (đặt element cuối vào vị trí root) lại với nhau.

Quá trình chi tiết như hình dưới:

Lấy element đầu tiên và heapify:

![Heap Sort 1](./pictures/堆/堆排序1.png)

Lấy element thứ hai và heapify:

![Heap Sort 2](./pictures/堆/堆排序2.png)

Lấy element thứ ba và heapify:

![Heap Sort 3](./pictures/堆/堆排序3.png)

Lấy element thứ tư và heapify:

![Heap Sort 4](./pictures/堆/堆排序4.png)

Lấy element thứ năm và heapify:

![Heap Sort 5](./pictures/堆/堆排序5.png)

Lấy element thứ sáu và heapify:

![Heap Sort 6](./pictures/堆/堆排序6.png)

Heap sort hoàn thành!
