# ⚛️ Atomic Feature Architecture

Every tool in **AZtomiq** is a self-contained "Atom". This document explains the inner workings of a feature module.

## Directory: `src/features/[id]/`

### 1. `tool.yaml` (The Brain)

Defines metadata, category, and access modes.

```yaml
id: hello-world
translationKey: hello_world
icon: smile
category: tools
status: active # 'active' | 'draft' | 'legacy'
mode: standard # 'standard' | 'advanced'
meta:
  version: 1.0.0
```

### 2. `index.ejs` (The Skeleton)

The UI template. It has access to the `t()` function and `toolConfig`.

```html
<!-- title: <%= t('hello_world.title') %> - AZtomiq -->
<section class="tool-page-container">
  <h1><i data-lucide="smile"></i> <%= t('hello_world.title') %></h1>
  ...
</section>
<script src="<%= toolConfig._assets.js %>"></script>
<link rel="stylesheet" href="<%= toolConfig._assets.css %>" />
```

### 3. `locales/[lang].yaml` (The Voice)

Contains translations specific to this tool.

- Root key must match `translationKey`.
- Supports nested keys and even HTML.

### 4. `script.js` & `style.css` (The Muscles)

- **Scoped Assets**: During build, these are hashed and placed in `dist/assets/features/[id]/`.
- **Vanilla Only**: No external frameworks. Use the `AZtomiqMode` global if your logic depends on user mode.

### 5. `HOWTOUSE.[lang].md` (The Manual)

(Optional) If you create a `HOWTOUSE.en.md` file, the framework will automatically parse it and provide a "How to use" instruction modal for the user.

---

## Life Cycle of a Feature

1. **Scaffolding**: `npm run aztomiq tool:create [id]`
2. **Indexing**: The build script scans `src/features/` and populates the global `tools` array.
3. **Merging**: Locales are merged into the global translation table.
4. **Rendering**: `index.ejs` is rendered into `[locale]/[id]/index.html`.
5. **Asset Injection**: Script and style tags are injected with cache-busting hashes.
