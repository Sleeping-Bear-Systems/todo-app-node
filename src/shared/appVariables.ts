import type { Logger } from "winston";
import type { AppConfig } from "./appConfig.js";

export type AppVariables = Readonly<{
  appConfig: AppConfig;
  logger: Logger;
}>;
