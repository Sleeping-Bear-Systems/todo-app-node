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

## Jenkins CI setup

This repository includes two Jenkins pipeline definitions:

- `Jenkinsfile`: fast CI (install, build, lint, unit tests)
- `Jenkinsfile.e2e`: Playwright E2E tests

Recommended merge-gating configuration for `main`:

1. Create a Jenkins job that uses `Jenkinsfile` and runs on push/PR updates.
2. Create a second Jenkins job that uses `Jenkinsfile.e2e` and runs on PR updates.
3. Configure GitHub branch protection to require both Jenkins status checks.

This keeps CI responsibilities separated while still requiring E2E to pass before merge.

## Running the application

```pwsh
npm run dev
```

Run the built application:

```pwsh
npm run start
```
