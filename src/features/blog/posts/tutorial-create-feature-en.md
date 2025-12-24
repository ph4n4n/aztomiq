---
title: Step-by-Step Guide: Creating Your First Feature
date: Dec 24, 2025
tag: Tutorial
lang: en
readTime: 12 min read
slug: tutorial-create-feature-en
---

# 🚀 Step-by-Step: Creating a Feature with AZtomiq

Are you new to AZtomiq? This guide will take you by the hand and show you exactly how to build a complete feature from scratch using our "Atomic" architecture.

## Step 1: Scaffold using the CLI

Instead of creating folders and files manually, use our built-in command to set up the structure instantly:

```bash
npm run aztomiq tool:create my-tool
```

This creates the `src/features/my-tool` directory with:

- `tool.yaml`: The brain.
- `index.ejs`: The structure (HTML).
- `style.css`: The look (CSS).
- `script.js`: The brain's logic (JS).
- `locales/`: Multi-language support.

## Step 2: Define your Identity (tool.yaml)

Open `tool.yaml` to tell the system what this tool is:

```yaml
id: my-tool # Unique ID
name: My Awesome Tool # Name shown in menus
category: dev # Category (daily, dev, etc.)
icon: tool # Icon from Lucide library
status: active # Status (active, beta)
```

## Step 3: Build the UI (index.ejs)

Write your HTML here. You don't need `<html>` tags as AZtomiq wraps your content in a global layout automatically.

```html
<div class="tool-wrap">
  <div class="glass-card">
    <h1>Hello AZtomiq!</h1>
    <input type="text" id="name-input" placeholder="Enter your name..." />
    <button id="action-btn" class="btn-primary">Click Me</button>
    <div id="output"></div>
  </div>
</div>
```

## Step 4: Add Styles (style.css)

Styles here are scoped, meaning they only apply to your specific feature.

```css
.tool-wrap {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}
.glass-card {
  background: var(--glass-bg); /* Use system CSS variables */
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
}
```

## Step 5: Implement Logic (script.js)

This is where the magic happens—handling events or API calls:

```javascript
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("action-btn");
  const input = document.getElementById("name-input");
  const display = document.getElementById("output");

  btn.addEventListener("click", () => {
    const val = input.value || "Friend";
    display.innerHTML = `<h3>Welcome, ${val}!</h3><p>You just built your first feature.</p>`;
  });
});
```

## Step 6: Multi-language Support

Add `.yaml` files in the `locales/` folder to support different languages. AZtomiq merges these automatically.

## Step 7: Build and Preview

Run the dev server to see your changes in real-time:

```bash
npm run dev
```

Visit `localhost:3000/my-tool/` and see your masterpiece!

---

**Summary:** Creating a feature in AZtomiq is like building with Lego bricks. You focus on the **Logic**, and the core handles the performance, SEO, and shell UI! 🚀
