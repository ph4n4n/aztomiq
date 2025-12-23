# ⚛️ AZtomiq Development Guidelines

This document establishes the architecture, standards, and workflows for developing features for the **AZtomiq** ecosystem.

---

## 1. Atomic Philosophy ⚛️

AZtomiq follows a strict **Atomic Design** philosophy. Every tool (feature) must be self-contained and independent.

- **Zero Global Pollution**: A feature should not depend on global assets except for core CSS variables.
- **Self-Healing**: If a feature folder is deleted, the project should still build and run perfectly.
- **Locality over Generality**: Feature-specific logic, styles, and translations must live _inside_ the feature folder.

---

## 2. Project Stack

- **Template Engine**: EJS (Embedded JavaScript)
- **Styling**: Vanilla CSS (PostCSS for minification)
- **Logic**: Vanilla JavaScript (ES6+)
- **Build System**: Custom SSG (Node.js + `fs-extra`)
- **CLI**: Custom `aztomiq` binary

---

## 3. The `aztomiq` CLI 🛠️

The primary way to interact with the framework is through our internal CLI.

| Command        | Usage                              | Description                                              |
| :------------- | :--------------------------------- | :------------------------------------------------------- |
| **Scaffold**   | `npm run aztomiq tool:create <id>` | Create a new tool with all boilerplate files.            |
| **Develop**    | `npm run dev`                      | Watch files, build `dist-dev`, and start a local server. |
| **Production** | `npm run build`                    | Full build with obfuscation and asset optimization.      |
| **Status**     | `npm run aztomiq status`           | Report health of features, translations, and tests.      |
| **Analyze**    | `npm run aztomiq analyze`          | Monitor JS/CSS footprint of every tool.                  |
| **Testing**    | `npm run aztomiq test ui`          | Automated visual & i18n testing via Puppeteer.           |

---

## 4. Feature Folder Structure

When you run `tool:create`, it generates this structure in `src/features/[id]/`:

```text
├── tool.yaml           # Metadata & configuration
├── index.ejs           # Tool entry point (UI)
├── style.css           # Tool-specific styles
├── script.js           # Tool-specific logic
├── CHANGELOG.md        # Tool-level version history
└── locales/            # Atomic translations
    ├── vi.yaml
    └── en.yaml
```

### `tool.yaml` Checklist:

- `id`: Unique tool identifier (kebab-case).
- `category`: Must match a category defined in `src/data/global.yaml`.
- `icon`: A valid **Lucide** icon name.
- `mode`: `standard` (for everyone) or `advanced` (for power users).
- `meta.version`: Semantic versioning (e.g., `1.0.2`).

---

## 5. Localization (i18n) Rules 🌍

We use an **Atomic YAML Localization** system.

1.  **Strict Rule**: No hardcoded text in EJS. Use `<%= t('key') %>`.
2.  **Namespace**: The root key in your feature's YAML must match the `translationKey` in `tool.yaml`.
    ```yaml
    # locales/en.yaml
    my_tool:
      title: "My Tool"
      desc: "Instant result."
    ```
3.  **HTML in Locales**: Use `<%- t('key') %>` in EJS if your translation contains HTML tags (like `<strong>`).
4.  **Shared Locales**: Use global keys for things like "Reset", "Calculate", or "Save" if they exist in `src/locales/`.

---

## 6. Development Standards

### UI & Styling

- **CSS Variables**: Always use variables from `global.css` (e.g., `var(--primary-color)`, `var(--radius)`).
- **Glassmorphism**: Follow the premium look by using `backdrop-filter: blur()` and subtle borders.
- **Lucide Icons**: Use matching icons for a consistent visual language.
- **Versioning Badge**: Every tool should show its version using:
  ```html
  <span class="version-badge" id="open-changelog"
    >v<%= toolConfig.meta.version %></span
  >
  ```

### JavaScript Performance

- **Client-Side Only**: All logic must run in the browser.
- **Event Delegation**: Prefer attaching listeners to parent containers if there are many interactive elements.
- **Service Worker**: Ensure your feature doesn't break offline capabilities. Avoid absolute URLs to external assets.

---

## 7. Submission Checklist

Before completing a feature, verify:

- [ ] Does it render correctly in both **Vietnamese** and **English**?
- [ ] Is it responsive on a **320px** wide screen?
- [ ] Does it support **Dark Mode** without hardcoded white backgrounds?
- [ ] Have I bumped the version using `npm run aztomiq version patch [id]`?
- [ ] Does `npm run aztomiq test ui` pass?
