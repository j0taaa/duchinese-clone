# HanziLane Mobile

React Native mobile replica of the HanziLane web app, scaffolded with Expo Router.

## What is included

- Warm, DuChinese-style mobile UI for the main product areas
- Tabs for Library, Infinite, Generate, My Library, and Profile
- Stack screens for story reading, series pages, and auth
- Local-first state for sign-in, read history, generated lessons, and usage stats
- Mock lesson generation so the app is usable before backend wiring

## Run it

```bash
cd mobile-app
npm install
npm run start
```

Then open it in Expo Go, an emulator, or the web preview.

## Current backend model

This scaffold is intentionally local-first. It does not yet call the Next.js backend.

The app state and generation flow live in [`lib/mobile-app-context.tsx`](./lib/mobile-app-context.tsx). That is the main seam to replace with real network requests later.

## Suggested next step

Point the mobile provider at the existing web backend by adding mobile-friendly JSON endpoints for:

- library stories and series
- story detail
- auth session creation
- generation requests
- read / view tracking
