import { type ParseArgsConfig, parseArgs } from "node:util";
import { Client, type ClientConfig } from "pg";
import { parseIntoClientConfig } from "pg-connection-string";
import z from "zod";

function logFatalError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.stack ?? error.message);
    return;
  }
  console.error(error);
}

process.on("uncaughtException", (error) => {
  logFatalError(error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logFatalError(reason);
  process.exit(1);
});

// get environment variables
const environmentVariablesSchema = z.object({
  POSTGRES_URI: z.string().optional(),
});

const environmentVariables = environmentVariablesSchema.parse(process.env);

// get command line arguments
const config: ParseArgsConfig = {
  options: {
    force: { type: "boolean", short: "f", default: false },
    uri: { type: "string", short: "u" },
  },
};

const { values } = parseArgs(config);

const commandLineArgumentsSchema = z.object({
  force: z.boolean().default(false),
  uri: z.string().optional(),
});

const commandLineArguments = commandLineArgumentsSchema.parse(values);

let client: Client | undefined;
try {
  // get Postgres client configuration
  const postgresUri =
    commandLineArguments.uri ?? environmentVariables.POSTGRES_URI;
  if (!postgresUri) {
    console.error("POSTGRES_URI (env) or --uri/-u is required.");
    process.exit(1);
  }
  const clientConfig: ClientConfig = parseIntoClientConfig(postgresUri);
  const database = clientConfig.database ?? "todo_app";
  // use an administrative database
  clientConfig.database = "postgres";

  // create client
  client = new Client(clientConfig);
  await client.connect();

  // drop existing database
  if (commandLineArguments.force) {
    console.log(`Dropping database "${database}"`);
    await client.query(
      `SELECT pg_terminate_backend(pid)
       FROM pg_stat_activity
       WHERE datname = $1
         AND pid <> pg_backend_pid()`,
      [database],
    );
    await client.query(`DROP DATABASE IF EXISTS "${database}"`);
    console.log("Success!");
  }

  // create database
  console.log(`Creating database "${database}"`);
  await client.query(`CREATE DATABASE "${database}"`);
  console.log("Success!");
} finally {
  // dispose Postgres client
  await client?.end();
}
