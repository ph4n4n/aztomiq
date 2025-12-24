# 🚀 Deployment Guide

AZtomiq is designed for easy deployment to static hosting providers like **GitHub Pages**, **Vercel**, or **Netlify**.

## 1. Production Build

Before deploying, always run the production build command:

```bash
npm run build
```

**What happens during build?**

- EJS templates are rendered into static HTML.
- CSS is minified.
- JavaScript is obfuscated and minified (if `--obfuscate` flag is passed).
- Assets are hashed for cache-busting.
- `sitemap.xml`, `robots.txt`, and `manifest.json` are automatically generated.

The output will be located in the `/dist` folder.

---

## 2. GitHub Pages Deployment (Default)

The framework includes a built-in deployment script using `git subtree`.

### Configuration

Update the `deploy` section in `src/data/global.yaml`:

```yaml
build:
  deploy:
    remote: "https://github.com/ph4n4n/aztomiq.site"
    branch: "main"
    dist_folder: "dist"
    strategy: "init" # "init" or "subtree"
```

### Run Deploy

```bash
npm run deploy
```

---

## 3. Manual Deployment

Simply upload the contents of the `/dist` folder to your favorite host.

### Vercel / Netlify

Point the "Build Command" to `npm run build` and the "Output Directory" to `dist`.

---

## 4. Post-Deployment Checklist

- [ ] Check `https://your-site.com/sitemap.xml`.
- [ ] Verify PWA status in Chrome DevTools (Lighthouse).
- [ ] Test the language switcher (`/en/` vs `/vi/`).
- [ ] Ensure all tool icons (Lucide) render correctly.
