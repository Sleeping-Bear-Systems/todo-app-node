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

Run the CI-focused Biome checks (for use by the CI build server):

```pwsh
npm run biome:ci
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

Run Playwright tests with a non-blocking line reporter:

```pwsh
npm run playwright:test:non-blocking
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

## Creating the Postgres database

Create the database from `POSTGRES_URI` environment variable:

```pwsh
node --import tsx ./tools/create-database.ts
```

Create the database with an explicit URI:

```pwsh
node --import tsx ./tools/create-database.ts --uri postgres://localhost:5432/todo_app
```

ℹ️ If the database name isn't specified in the Postgres URI, the script will use `todo_app`.

Force drop and recreate if it already exists:

```pwsh
node --import tsx ./tools/create-database.ts --uri postgres://localhost:5432/todo_app --force
```

## Jenkins CI setup

This repository includes two Jenkins pipeline definitions:

- `Jenkinsfile`: fast CI (install, build, lint, unit tests)
- `Jenkinsfile.e2e`: Playwright E2E tests
