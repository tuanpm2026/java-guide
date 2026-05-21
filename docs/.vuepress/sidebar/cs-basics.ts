import { ICONS, createImportantSection } from "./constants.js";

export const csBasics = [
  {
    text: "Mạng máy tính",
    prefix: "network/",
    icon: ICONS.NETWORK,
    children: [
      {
        text: "Câu hỏi phỏng vấn",
        icon: ICONS.INTERVIEW,
        children: [
          {
            text: "⭐️ Tổng hợp câu hỏi phỏng vấn Mạng máy tính (Phần 1)",
            link: "other-network-questions",
          },
          {
            text: "⭐️ Tổng hợp câu hỏi phỏng vấn Mạng máy tính (Phần 2)",
            link: "other-network-questions2",
          },
          // { text: "Tổng hợp kiến thức mạng máy tính", link: "computer-network-xiexiren-summary" },
        ],
      },
      {
        text: "Cơ bản",
        icon: ICONS.STAR,
        children: [
          {
            text: "Chi tiết mô hình OSI 7 lớp & TCP/IP 4 lớp",
            link: "osi-and-tcp-ip-model",
          },
          {
            text: "Từ URL đến trang hiển thị: chuyện gì xảy ra?",
            link: "the-whole-process-of-accessing-web-pages",
          },
        ],
      },
      {
        text: "Application Layer",
        icon: ICONS.CODE,
        children: [
          {
            text: "⭐️ Tổng hợp protocol Application Layer",
            link: "application-layer-protocol",
          },
          { text: "⭐️ HTTP vs HTTPS", link: "http-vs-https" },
          {
            text: "RSA và ECDHE trong HTTPS handshake",
            link: "https-rsa-vs-ecdhe",
          },
          { text: "HTTP 1.0 vs HTTP 1.1", link: "http1.0-vs-http1.1" },
          { text: "Tổng hợp HTTP status code", link: "http-status-codes" },
          { text: "Chi tiết hệ thống DNS", link: "dns" },
        ],
      },
      {
        text: "Transport Layer",
        icon: ICONS.NETWORK,
        children: [
          {
            text: "⭐️ TCP three-way handshake & four-way wavehand",
            link: "tcp-connection-and-disconnection",
          },
          { text: "Chi tiết TCP TIME_WAIT", link: "tcp-time-wait" },
          {
            text: "TCP byte stream vs UDP datagram",
            link: "tcp-byte-stream-udp-datagram",
          },
          {
            text: "⭐️ Đảm bảo độ tin cậy của TCP",
            link: "tcp-reliability-guarantee",
          },
        ],
      },
      {
        text: "Network Layer",
        icon: ICONS.NETWORK,
        children: [
          { text: "Chi tiết giao thức ARP", link: "arp" },
          { text: "Chi tiết giao thức NAT", link: "nat" },
        ],
      },
      {
        text: "Bảo mật",
        icon: ICONS.SECURITY,
        children: [
          {
            text: "Các kiểu tấn công mạng phổ biến",
            link: "network-attack-means",
          },
        ],
      },
    ],
  },
  {
    text: "Hệ điều hành",
    prefix: "operating-system/",
    icon: ICONS.OS,
    children: [
      "operating-system-basic-questions-01",
      "operating-system-basic-questions-02",
      {
        text: "Linux",
        icon: ICONS.LINUX,
        children: ["linux-intro", "shell-intro"],
      },
    ],
  },
  {
    text: "Cấu trúc dữ liệu",
    prefix: "data-structure/",
    icon: ICONS.DATA_STRUCTURE,
    collapsible: true,
    children: [
      { text: "Cấu trúc dữ liệu tuyến tính", link: "linear-data-structure" },
      { text: "Cây (Tree)", link: "tree" },
      { text: "Đồ thị (Graph)", link: "graph" },
      { text: "Heap", link: "heap" },
      { text: "Red-Black Tree", link: "red-black-tree" },
      { text: "Bloom Filter", link: "bloom-filter" },
    ],
  },
  {
    text: "Thuật toán",
    prefix: "algorithms/",
    icon: ICONS.ALGORITHM,
    collapsible: true,
    children: [
      "classical-algorithm-problems-recommendations",
      "common-data-structures-leetcode-recommendations",
      "string-algorithm-problems",
      "linkedlist-algorithm-problems",
      "the-sword-refers-to-offer",
      "10-classical-sorting-algorithms",
    ],
  },
];
