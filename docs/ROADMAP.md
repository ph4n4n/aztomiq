# 🗺️ AZtomiq Roadmap: From Git-Clone to NPM-First

Mục tiêu: Biến AZtomiq từ một template repository (phải git clone) thành một framework chuyên nghiệp có thể cài đặt qua npm (`npx create-aztomiq`).

---

## 🚀 Phase 1: CLI & Scaffolding (Current Focus)

**Mục tiêu**: Người dùng chỉ cần gõ 1 lệnh là có ngay project.

- [ ] **Lệnh Initializer**: Tạo package `create-aztomiq` để hỗ trợ lệnh `npx create-aztomiq [project-name]`.
- [ ] **Project Templates**: Đóng gói các bộ khung cơ bản (Minimal, Full-stack, Blog-oriented) vào CLI.
- [ ] **Hợp nhất Bin**: Làm cho lệnh `aztomiq` có thể chạy global hoặc qua `npx`.

## ⚙️ Phase 2: Engine Internalization

**Mục tiêu**: Giấu phần "lõi" (scripts/ builds/) vào trong node_modules để project của người dùng sạch sẽ.

- [ ] **Core-as-a-Dependency**: Người dùng `npm install aztomiq`. Toàn bộ logic build nằm trong package.
- [ ] **Configuration Layer**: Người dùng chỉ cần quan tâm `aztomiq.config.js` hoặc `global.yaml`.
- [ ] **Extensible Scripts**: Cho phép người dùng ghi đè (override) các bước build nếu cần mà không phải sửa code lõi.

## 📦 Phase 3: Atomic Feature Marketplace (NPM Plugins)

**Mục tiêu**: Chia sẻ công cụ dễ như cài thư viện.

- [ ] **NPM Features**: Hỗ trợ cài feature qua npm. Ví dụ: `npm install @aztomiq/tool-json-formatter`.
- [ ] **Auto-discovery**: Core sẽ tự tìm các feature trong `node_modules` có prefix `@aztomiq/tool-*` và tự động gắn vào website.
- [ ] **Feature Scaffolding**: Cải tiến `npm run aztomiq tool:create` để hỗ trợ xuất bản (publish) lên npm.

## 🎨 Phase 4: Theme & UI System

**Mục tiêu**: Tách biệt giao diện và logic.

- [ ] **Theme Support**: Tách CSS Glassmorphism hiện tại thành `default-theme`.
- [ ] **Multiple Themes**: Cho phép đổi theme dễ dàng qua config.
- [ ] **UI Component Library**: Cung cấp bộ các EJS partials chuẩn (Buttons, Cards, Modals) để dev tạo tool nhanh hơn.

---

## 🛠️ Action Plan cho tuần này (NPM-fication)

1. **Refactor Build Scripts**: Kiểm tra lại các đường dẫn trong `scripts/builds/` để đảm bảo chúng có thể chạy khi nằm trong `node_modules`.
2. **Update `package.json`**: Chuẩn bị các trường `files`, `publishConfig` để sẵn sàng lên NPM.
3. **Draft `create-aztomiq`**: Viết script đơn giản để clone template và replace thông tin cơ bản.

---

_Ghi chú: AZtomiq nhắm tới việc trở thành "Next.js cho Utility Tools" - Cực nhẹ, Cực nhanh, Cực dễ cài đặt._
