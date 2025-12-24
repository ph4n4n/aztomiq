---
title: Technical Documentation & Core Architecture
date: Dec 24, 2025
tag: Docs
lang: en
readTime: 12 min read
slug: technical-documentation-en
---

Welcome to the official technical documentation of **AZtomiq**. This article is extracted directly from the project's `README.md` to give you the most comprehensive overview of the system.

---

# ⚛️ AZtomiq

A high-performance, **privacy-first**, and ultra-modular multi-tool website framework. Built with a passion for simplicity and speed.

---

## 🌟 Why AZtomiq?

AZtomiq isn't just another static site generator. It's an **Ecosystem** designed for building professional utility toolkits.

- **⚛️ Atomic Architecture**: Every feature is a self-contained "Atom". Zero global dependencies, maximum portability.
- **🛡️ Privacy by Design**: 100% Client-side processing. No data ever leaves the user's browser.
- **🌍 Production Ready i18n**: Built-in multi-lingual support with atomic translation merging.
- **⚡ Blazing Fast**: No heavy JS frameworks. Powered by Vanilla JS and optimized EJS templates.
- **📱 Modern PWA**: Fully offline-capable with automated Service Worker generation.

---

## 🏗️ Core Architecture

```text
.
├── bin/              # 🛠️ Main CLI entry point
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

## 🚀 Quick Start

### 1. Installation

```bash
git clone https://github.com/ph4n4n/aztomiq.git
cd aztomiq
npm install
```

### 2. Development

Start the watcher and local server:

```bash
npm run dev
```

### 3. Creating Your First Tool

Use our CLI to scaffold a new feature instantly:

```bash
npm run aztomiq tool:create my-awesome-tool
```

### 4. Build for Production

Generate the static site in the `dist/` folder:

```bash
npm run build
```

---

## 🤝 Contribution

We love contributors! If you have a cool tool idea:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingTool`).
3. Create your tool using `npm run aztomiq tool:create`.
4. Commit your Changes.
5. Push to the Branch.
6. Open a Pull Request.

---

_Built with ❤️ by the AZtomiq Team_
