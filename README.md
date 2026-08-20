# todo-app-node

A simple ToDo web application using event sourcing.

## Environment Variables

The application reads these variables from the process environment:

| Variable         | Required                    | Description                                                                                                                   | Default or constraints                                                                                          |
| ---------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `POSTGRES_URI`   | Yes                         | PostgreSQL connection URI used by the event store and read store.                                                             | Must use the `postgres://` or `postgresql://` protocol.                                                         |
| `JWT_SECRET_KEY` | Yes                         | Secret used to sign authentication cookies.                                                                                   | Must be at least 64 characters long.                                                                            |
| `PORT`           | No                          | TCP port on which the HTTP server listens.                                                                                    | `3000`; must be an integer from `1` to `65535`.                                                                 |
| `NODE_ENV`       | No                          | Application environment. Development and test environments create mock users; production requires explicit admin credentials. | `development`; accepted values are `development`, `production`, and `test`.                                     |
| `SEQ_API_KEY`    | No                          | API key for sending structured logs to Seq.                                                                                   | Seq logging is enabled only when this and `SEQ_URL` are both set.                                               |
| `SEQ_URL`        | No                          | Seq server URL for structured logs.                                                                                           | Seq logging is enabled only when this and `SEQ_API_KEY` are both set.                                           |
| `ADMIN_USERNAME` | Required in production only | Admin username for the initial administrator account.                                                                         | Must be at least 4 characters after trimming and lowercasing, and must not be the default development username. |
| `ADMIN_PASSWORD` | Required in production only | Admin password for the initial administrator account.                                                                         | Must be at least 8 characters after trimming, and must not be the default development password.                 |

For example, in PowerShell:

```pwsh
$env:POSTGRES_URI = "postgres://postgres:password@localhost:5432/todo_app"
$env:JWT_SECRET_KEY = "replace-with-a-random-secret-at-least-64-characters-long"
$env:NODE_ENV = "development"
$env:PORT = "3000"
npm run dev
```

For a production deployment, set unique admin credentials as well:

```pwsh
$env:NODE_ENV = "production"
$env:ADMIN_USERNAME = "your-unique-admin-username"
$env:ADMIN_PASSWORD = "your-strong-admin-password"
```

The app rejects the default development admin values in production and will fail fast if you reuse `admin` or `password1234`.

`POSTGRES_URI` is also used by the database creation script. The script accepts an explicit `--uri` argument, which takes precedence over the environment variable.

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

## Upgrade Cadence

To check for package upgrades:

```pwsh
npx npm-check-updates
```

## References

### Icons

[Plump Line - Free](https://www.streamlinehq.com/icons/plump-line-free)
