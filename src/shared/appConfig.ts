import z from "zod";

const environmentVariablesSchema = z.object({
  port: z.coerce.number().optional().default(3000),
});

export type AppConfig = Readonly<{
  port: number;
}>;

export function createAppConfig(
  env: Record<string, string | undefined>,
): AppConfig {
  const environmentVariables = environmentVariablesSchema.parse(env);
  return {
    port: environmentVariables.port,
  };
}
