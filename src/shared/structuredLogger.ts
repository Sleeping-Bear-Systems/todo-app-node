import { SeqTransport } from "@datalust/winston-seq";
import {
  createLogger,
  format,
  type Logger,
  type transport,
  transports,
} from "winston";
import type { AppConfig } from "./appConfig.ts";

export function createStructuredLogger(appConfig: AppConfig): Logger {
  // add console logging
  const combinedTransports: transport[] = [new transports.Console()];

  // check Seq configuration
  if (appConfig.seq.apiKey !== undefined && appConfig.seq.url !== undefined) {
    // add Seq logging
    combinedTransports.push(
      new SeqTransport({
        serverUrl: appConfig.seq.url,
        apiKey: appConfig.seq.apiKey,
        onError: (e) => {
          console.error(e);
        },
        handleExceptions: true,
        handleRejections: true,
      }),
    );
  }

  return createLogger({
    level: "info",
    format: format.combine(
      // This is required to get errors to log with stack traces. See https://github.com/winstonjs/winston/issues/1498
      format.errors({ stack: true }),
      format.json(),
    ),
    defaultMeta: {
      application: "todo-app",
      environment: appConfig.environment,
    },
    transports: combinedTransports,
  });
}
