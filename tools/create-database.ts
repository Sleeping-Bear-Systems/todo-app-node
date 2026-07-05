import { type ParseArgsConfig, parseArgs } from "node:util";
import z from "zod";

// get environment variables
const environmentVariablesSchema = z.object({
  POSTGRES_URI: z.string().optional(),
});

const environmentVariables = environmentVariablesSchema.parse(process.env);

// get command line arguments
const config: ParseArgsConfig = {
  options: {
    uri: { type: "string", short: "u" },
  },
};

const { values } = parseArgs(config);

const commandLineArgumentsSchema = z.object({
  uri: z.string().optional(),
});

const commandLineArguments = commandLineArgumentsSchema.parse(values);

// get database URI
const postgresUri =
  environmentVariables.POSTGRES_URI ?? commandLineArguments.uri;
if (!postgresUri) {
  console.error("POSTGRES_URI (env) or --uri/-u is required.");
  process.exit(1);
}

console.error("Not implemented: database creation is not wired up yet.");
process.exit(1);
