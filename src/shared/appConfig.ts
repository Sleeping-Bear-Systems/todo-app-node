import z from "zod";

const environmentVariablesSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  SEQ_API_KEY: z.string().optional(),
  SEQ_URL: z.url().optional(),
  JWT_SECRET_KEY: z.string().min(64),
  POSTGRES_URI: z.url().refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "postgres:" || protocol === "postgresql:";
  }, "POSTGRES_URI must use postgres:// or postgresql://"),
});

export type AppConfig = Readonly<{
  port: number;
  environment: "development" | "production" | "test";
  seq: Readonly<{
    apiKey: string | undefined;
    url: string | undefined;
  }>;
  jwt: Readonly<{
    secretKey: string;
    cookieName: string;
  }>;
  postgres: Readonly<{
    uri: string;
  }>;
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
    jwt: {
      secretKey: environmentVariables.JWT_SECRET_KEY,
      cookieName: "todo-app-node",
    },
    postgres: {
      uri: environmentVariables.POSTGRES_URI,
    },
  };
}
