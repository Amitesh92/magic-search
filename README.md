# Web App Workspace

This repository contains multiple front-end subprojects and shared code for a multi-app web workspace.

## Projects

- `react-app/` - React single-spa application
- `shell/` - Root-config application for the microfrontend setup
- `vue-app/` - Vue single-spa application
- `shared/` - Shared library code (for example, `SmartSearch.js`)

## Prerequisites

- Node.js 16+ or compatible version
- npm 8+ (or the npm version shipped with your Node.js distribution)

## Install

Each subproject has its own `package.json`, so install dependencies per project.

```bash
cd react-app
npm install
```

```bash
cd ../shell
npm install
```

```bash
cd ../vue-app
npm install
```

## Run locally

### React app

```bash
cd react-app
npm run start
```

Also available:

```bash
npm run start:standalone
```

### Vue app

```bash
cd vue-app
npm run start
```

## Build for production

### React app

```bash
cd react-app
npm run build
```

### Vue app

```bash
cd vue-app
npm run build
```

## Test

### React app

```bash
cd react-app
npm test
```

## Notes

- This repository is structured as a workspace of separate applications, not a single root package.
- The `shared/` folder contains reusable code that can be imported by the apps.
- If you clone this repo, run `npm install` separately in each app folder before using the app.
