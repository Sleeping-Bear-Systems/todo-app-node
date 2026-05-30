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

## Running the application

```pwsh
npm run dev
```

Run the built application:

```pwsh
npm run start
```
