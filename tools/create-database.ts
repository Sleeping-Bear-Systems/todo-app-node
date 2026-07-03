import { existsSync } from "node:fs";
import { type ParseArgsConfig, parseArgs } from "node:util";
import z from "zod";

const config: ParseArgsConfig = {
  options: {
    path: { type: "string", short: "p" },
  },
};

const { values } = parseArgs(config);

const createDatabaseSchema = z.object({
  path: z.string().nonempty().optional().default("./todo-app.db"),
});

const parameters = createDatabaseSchema.parse(values);

const now = Date.now().toString();
console.log(now);

if (existsSync(parameters.path)) {
}

console.log(parameters.path);
