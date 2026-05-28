import z from "zod";

const environmentVariablesSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z.string().optional().default("development"),
  SEQ_API_KEY: z.string().optional(),
  SEQ_URL: z.url().optional(),
});

export type AppConfig = Readonly<{
  port: number;
  environment: string;
  seq: {
    apiKey: string | undefined;
    url: string | undefined;
  };
}>;

export function createAppConfig(
  processEnv: Record<string, string | undefined>,
): AppConfig {
  const environmentVariables = environmentVariablesSchema.parse(processEnv);
  return {
    port: environmentVariables.PORT,
    environment: environmentVariables.NODE_ENV,
    seq: {
      apiKey: environmentVariables.SEQ_API_KEY,
      url: environmentVariables.SEQ_URL,
    },
  };
}
