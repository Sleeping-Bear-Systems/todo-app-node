import type { Event } from "@event-driven-io/emmett";
import type { Role } from "#shared/role.ts";
import type { EventMetadata } from "./eventMetadata.ts";

export type UserEvent =
  | Event<
      "RegisterUser",
      { userId: string; userName: string; passwordHash: string; role: Role },
      EventMetadata
    >
  | Event<
      "ChangePassword",
      { userId: string; passwordHash: string },
      EventMetadata
    >
  | Event<"ChangeRole", { userId: string; role: Role }, EventMetadata>;
