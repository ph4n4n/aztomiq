# Project Structure

AZtomiq follows an **Atomic Architecture**, separating the core framework from individual feature modules.

## Directory Layout

```text
.
├── bin/                # CLI executables
│   └── aztomiq.js      # Main CLI tool
├── docs/               # Documentation
├── scripts/            # Build and utility scripts
│   ├── builds/         # Modular build logic (assets, pages, templates)
│   ├── build.js        # Main build entry point
│   ├── deploy.js       # Deployment script (GitHub Pages)
│   └── ui-test.js      # Puppeteer-based UI testing
├── src/
│   ├── assets/         # Global assets (CSS, JS, Images)
│   ├── data/           # Global configuration (global.yaml)
│   ├── features/       # Atomic tools (each folder is a tool)
│   │   └── hello-world/
│   │       ├── locales/    # Tool-specific translations
│   │       ├── index.ejs   # Tool UI template
│   │       ├── script.js   # Tool logic
│   │       ├── style.css   # Tool styles
│   │       └── tool.yaml   # Tool configuration
│   ├── includes/       # Shared EJS components (header, footer, head)
│   ├── locales/        # Global translations
│   └── pages/          # Static system pages (About, Privacy, etc.)
├── CHANGELOG.md        # Global project history
└── package.json        # Project dependencies and scripts
```

## Core vs Features

- **Core**: Everything in `src/assets`, `src/includes`, and `scripts/`. Changing these affects the entire site.
- **Features**: Located in `src/features/`. Each tool is self-contained. Deleting a feature folder completely removes it from the build without breaking the core.
