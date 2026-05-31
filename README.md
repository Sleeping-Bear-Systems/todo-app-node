# todo-app-node

A simple ToDo web application using event sourcing.

## Installing dependencies

```pwsh
npm install
```

## Building the application

```pwsh
npm run build
```

Force a full rebuild:

```pwsh
npm run build:force
```

## Linting and formatting the application

```pwsh
npm run biome:check
```

```pwsh
npm run biome:fix
```

## Testing the application

```pwsh
npm test
```

## End-to-end testing with Playwright

Install browser binaries:

```pwsh
npm run playwright:install
```

Run Playwright tests:

```pwsh
npm run playwright:test
```

Run the application without file watching (used by Playwright webServer):

```pwsh
npm run dev:e2e
```

Run Playwright tests in headed mode:

```pwsh
npm run playwright:test:headed
```

Run Playwright in UI mode:

```pwsh
npm run playwright:test:ui
```

Show the latest Playwright HTML report:

```pwsh
npm run playwright:report
```

## Running the application

```pwsh
npm run dev
```

Run the built application:

```pwsh
npm run start
```

## Jenkins CI setup

This repository includes two Jenkins pipeline definitions:

- `Jenkinsfile`: fast CI (install, build, lint, unit tests)
- `Jenkinsfile.e2e`: Playwright E2E tests
