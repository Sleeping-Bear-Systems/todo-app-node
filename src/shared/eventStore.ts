import type { EventStore } from "@event-driven-io/emmett";
import {
  getSQLiteEventStore,
  type SQLiteEventStoreOptions,
} from "@event-driven-io/emmett-sqlite";
import type { AppConfig } from "./appConfig.ts";

export function createEventStore(appConfig: AppConfig): EventStore {
  const options: SQLiteEventStoreOptions = {
    fileName: appConfig.sqlite.path,
  };
  const eventStore = getSQLiteEventStore(options);
  return eventStore;
}
