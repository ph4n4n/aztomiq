---
title: Hướng dẫn tạo Feature từ A-Z cho người mới
date: Dec 24, 2025
tag: Tutorial
lang: vi
readTime: 15 min read
slug: tutorial-create-feature-vi
---

# 🚀 Hướng dẫn tạo Feature từ A-Z với AZtomiq

Bạn là người mới và muốn build một công cụ trên nền tảng AZtomiq? Đừng lo, bài viết này sẽ "cầm tay chỉ việc" giúp bạn tạo ra một Feature hoàn chỉnh chỉ trong vài phút.

## Bước 1: Khởi tạo bằng CLI

Thay vì tạo tay từng folder, AZtomiq cung cấp lệnh để scaffold mọi thứ cần thiết. Mở terminal và chạy:

```bash
npm run aztomiq tool:create hello-world
```

Hệ thống sẽ tự đẻ ra folder `src/features/hello-world` với cấu trúc:

- `tool.yaml`: Cấu hình của công cụ.
- `index.ejs`: Giao diện (HTML).
- `style.css`: Thẩm mỹ (CSS).
- `script.js`: Phụ trách logic (JS).
- `locales/`: Đa ngôn ngữ.

## Bước 2: Khai báo "Danh tính" (tool.yaml)

Mở `tool.yaml`, đây là nơi bạn định nghĩa công cụ của mình với hệ thống:

```yaml
id: hello-world # ID duy nhất, không trùng lặp
name: Xin Chào World # Tên hiển thị trên Menu
category: daily # Nhóm (daily, dev, finance...)
icon: smile # Tên icon từ thư viện Lucide
status: active # Hiện trạng (active, beta)
```

## Bước 3: Xây dựng giao diện (index.ejs)

Mở `index.ejs`, bạn code HTML vào đây. Lưu ý: Bạn không cần viết `<html>` hay `<body>` vì AZtomiq đã lo phần "vỏ" (Layout) rồi.

```html
<div class="hello-container">
  <div class="glass-card">
    <h1>Chào mừng bạn!</h1>
    <input type="text" id="user-input" placeholder="Nhập tên bồ vào đây..." />
    <button id="greet-btn" class="btn-primary">Nhấn đi!</button>
    <p id="result-text"></p>
  </div>
</div>
```

## Bước 4: Thêm "Muối" cho giao diện (style.css)

CSS ở đây có tính **scoping**, tức là nó chỉ ảnh hưởng đến feature này thôi.

```css
.hello-container {
  display: flex;
  justify-content: center;
  padding: 3rem;
}
.glass-card {
  background: var(--glass-bg); /* Dùng biến CSS hệ thống */
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  padding: 2rem;
  border-radius: 20px;
}
```

## Bước 5: Viết Logic (script.js)

Đây là nơi xử lý các sự kiện click, tính toán hoặc gọi API:

```javascript
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("greet-btn");
  const input = document.getElementById("user-input");
  const result = document.getElementById("result-text");

  btn.addEventListener("click", () => {
    const name = input.value || "Người lạ";
    result.innerText = `Chào ${name}! Bạn vừa tạo thành công feature đầu tiên!`;
  });
});
```

## Bước 6: Đa ngôn ngữ (Locales)

Nếu muốn công cụ của bạn hỗ trợ cả tiếng Anh lẫn tiếng Việt, hãy vào folder `locales/` tạo các file `.yaml` tương ứng. AZtomiq sẽ tự động gộp chúng vào hệ thống dịch của toàn trang.

## Bước 7: Kiểm tra thành quả

Chạy lệnh dev để xem sự thay đổi ngay lập tức:

```bash
npm run dev
```

Truy cập `localhost:3000/hello-world/` và tận hưởng!

---

**Kết luận:** Build feature trên AZtomiq giống như lắp ghép Lego. Bạn chỉ tập trung vào **Logic của công cụ**, còn giao diện, menu, SEO và tốc độ đã có **AZtomiq** lo liệu! 😎
