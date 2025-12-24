---
title: Hướng dẫn kỹ thuật & Core Architecture
date: Dec 24, 2025
tag: Docs
lang: vi
readTime: 10 min read
slug: technical-documentation
---

Chào mừng bạn đến với tài liệu kỹ thuật chính thức của **AZtomiq**. Bài viết này được trích xuất trực tiếp từ file `README.md` của dự án để bạn có cái nhìn tổng quan nhất về hệ thống.

---

# ⚛️ AZtomiq

A high-performance, **privacy-first**, and ultra-modular multi-tool website framework. Built with a passion for simplicity and speed.

---

## 🌟 Tại sao nên chọn AZtomiq?

AZtomiq không chỉ là một trình tạo tĩnh (static site generator) thông thường. Nó là một **Hệ sinh thái** được thiết kế để xây dựng các bộ công cụ tiện ích chuyên nghiệp.

- **⚛️ Kiến trúc Nguyên tử (Atomic Architecture)**: Mỗi tính năng là một "Nguyên tử" tự chứa. Không có phụ thuộc toàn cục, khả năng di động tối đa.
- **🛡️ Quyền riêng tư (Privacy by Design)**: Xử lý 100% phía Client. Không có dữ liệu nào rời khỏi trình duyệt của người dùng.
- **🌍 Sẵn sàng cho i18n**: Hỗ trợ đa ngôn ngữ tích hợp sẵn với khả năng gộp bản dịch nguyên tử.
- **⚡ Tốc độ cực nhanh**: Không có JS framework nặng nề. Được cung cấp bởi Vanilla JS và các template EJS tối ưu.
- **📱 PWA hiện đại**: Khả năng ngoại tuyến hoàn toàn với việc tạo Service Worker tự động.

---

## 🏗️ Kiến trúc lõi (Core Architecture)

```text
.
├── bin/              # 🛠️ Main CLI entry point (aztomiq command)
├── docs/             # 📚 Documentation & Guides
├── scripts/          # ⚙️ Modular build logic (Pages, Assets, Cache)
├── src/
│   ├── assets/       # 🎨 Global Design System (CSS/JS)
│   ├── data/         # 📊 Global site & category metadata
│   ├── features/     # ⚛️ Atomic Tools (The heart of AZtomiq)
│   ├── includes/     # 🧩 Reusable EJS components
│   ├── locales/      # 🌍 System-wide translations
│   ├── pages/        # 📄 Static landing & system pages
│   └── templates/    # 🧬 SEO & PWA generators
└── package.json
```

---

## 🚀 Bắt đầu nhanh (Quick Start)

### 1. Cài đặt

```bash
git clone https://github.com/ph4n4n/aztomiq.git
cd aztomiq
npm install
```

### 2. Phát triển (Development)

Chạy watcher và server cục bộ:

```bash
npm run dev
```

### 3. Tạo công cụ đầu tiên của bạn

Sử dụng CLI của chúng tôi để tạo khung tính năng mới ngay lập tức:

```bash
npm run aztomiq tool:create my-awesome-tool
```

### 4. Build cho Production

Tạo trang tĩnh trong thư mục `dist/`:

```bash
npm run build
```

---

## 🤝 Tham gia đóng góp

Chúng tôi luôn chào đón các đóng góp! Nếu bạn có ý tưởng cho một công cụ thú vị:

1. Fork dự án.
2. Tạo Feature Branch (`git checkout -b feature/AmazingTool`).
3. Tạo công cụ của bạn bằng `npm run aztomiq tool:create`.
4. Commit thay đổi.
5. Push bài viết lên Branch.
6. Mở một Pull Request.

---

_Cảm ơn bạn đã quan tâm đến AZtomiq!_
