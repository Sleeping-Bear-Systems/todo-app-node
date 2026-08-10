import type { EventStore } from "@event-driven-io/emmett";
import type { PongoClient } from "@event-driven-io/pongo";
import type { RequestIdVariables } from "hono/request-id";
import type { Logger } from "winston";
import type { Account } from "./account.ts";
import type { AppConfig } from "./appConfig.ts";
import type { Clock } from "./clock.ts";

export type AppVariables = Readonly<{
  appConfig: AppConfig;
  clock: Clock;
  logger: Logger;
  eventStore: EventStore;
  readStore: PongoClient;
  isDatastarRequest: boolean;
}> &
  RequestIdVariables;

export type AuthenticatedAppVariables = AppVariables &
  Readonly<{
    jwtPayload: unknown;
    account: Account;
  }>;
