import { type ParseArgsConfig, parseArgs } from "node:util";
import z from "zod";

// get environment variables
const environmentVariablesSchema = z.object({
  POSTGRES_URI: z.string().optional().default(""),
});

const environmentVariables = environmentVariablesSchema.parse(process.env);

// get command lines arguments
const config: ParseArgsConfig = {
  options: {
    uri: { type: "string", short: "u" },
  },
};

const { values } = parseArgs(config);

const commandLineArgumentsSchema = z.object({
  uri: z.string().optional().default(environmentVariables.POSTGRES_URI),
});

const parameters = commandLineArgumentsSchema.parse(values);

console.log(parameters.uri);
