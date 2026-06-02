import type { JwtVariables } from "hono/jwt";
import type { Logger } from "winston";
import type { AppConfig } from "./appConfig.js";
import type { Clock } from "./clock.js";

export type AppVariables = Readonly<{
  appConfig: AppConfig;
  clock: Clock;
  logger: Logger;
}>;

export type AuthenticatedAppVariables = AppVariables & JwtVariables;
