import { navbar } from "vuepress-theme-hope";

export default navbar([
  { text: "Phỏng vấn Backend", icon: "java", link: "/home.md" },
  { text: "Phỏng vấn AI", icon: "a-MachineLearning", link: "/ai/" },
  {
    text: "Dự án thực tế",
    icon: "project",
    link: "/zhuanlan/interview-guide.md",
  },
  {
    text: "Knowledge Planet",
    icon: "planet",
    children: [
      {
        text: "Giới thiệu Planet",
        icon: "about",
        link: "/about-the-author/zhishixingqiu-two-years.md",
      },
      { text: "Chuyên mục độc quyền", icon: "about", link: "/zhuanlan/" },
      {
        text: "Tổng hợp chủ đề chất lượng",
        icon: "star",
        link: "https://www.yuque.com/snailclimb/rpkqw1/ncxpnfmlng08wlf1",
      },
    ],
  },
  {
    text: "Đọc thêm",
    icon: "book",
    children: [
      {
        text: "Open Source Project",
        icon: "github",
        link: "/open-source-project/",
      },
      { text: "Sách kỹ thuật", icon: "book", link: "/books/" },
      {
        text: "Cuộc sống lập trình",
        icon: "code",
        link: "/high-quality-technical-articles/",
      },
    ],
  },
  {
    text: "Về website",
    icon: "about",
    children: [
      { text: "Về tác giả", icon: "zuozhe", link: "/about-the-author/" },
      {
        text: "Tải PDF",
        icon: "pdf",
        link: "/interview-preparation/pdf-interview-javaguide.md",
      },
      {
        text: "Tài liệu phỏng vấn",
        icon: "pdf",
        link: "https://interview.javaguide.cn/home.html",
      },
      {
        text: "Lịch sử cập nhật",
        icon: "history",
        link: "/timeline/",
      },
    ],
  },
]);
