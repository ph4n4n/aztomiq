# CLI Reference

The `aztomiq` CLI is the Swiss Army knife for managing your ecosystem.

## Usage

```bash
npm run aztomiq <command> [options]
```

## Commands

### `dev`

Starts the development server with file watching and automatic rebuilds.

- **Port**: Defaults to 3000.
- **Target**: Builds to `dist-dev/`.

### `build`

Builds the project for production.

- **Options**:
  - `--force`: Cleans the `dist` folder before building.
  - `--obfuscate`: Minifies and obfuscates JavaScript files.
- **Target**: Builds to `dist/`.

### `tool:create <id>`

Scaffolds a new atomic tool in `src/features/`.

- **Example**: `npm run aztomiq tool:create my-tool`
- **Generates**: `tool.yaml`, `index.ejs`, `script.js`, `style.css`, and localized YAMLs.

### `status`

Scans the ecosystem health, showing active/draft tools, translation status, and mode (Standard/Advanced).

### `analyze`

Displays the payload size (JS/CSS) for every tool in the `dist` folder. Useful for monitoring performance.

### `test ui`

Runs automated UI tests using Puppeteer. Checks for 404s, console errors, and missing translations across all mapped pages.

### `cleanup`

Removes build artifacts (`dist`, `dist-dev`).

- **Options**:
  - `--drafts`: Specifically deletes feature folders marked as `status: draft`.

### `version <type> [id]`

Bumps the version of a specific tool or all tools.

- **Types**: `patch`, `minor`, `major`.
- **Example**: `npm run aztomiq version minor hello-world`
