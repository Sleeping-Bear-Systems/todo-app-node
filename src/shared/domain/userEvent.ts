import type { Event } from "@event-driven-io/emmett";
import type { Role } from "#shared/role.ts";
import type { EventMetadata } from "./eventMetadata.ts";

export type UserEvent =
  | Event<
      "UserRegistered",
      { userId: string; username: string; passwordHash: string; role: Role },
      EventMetadata
    >
  | Event<
      "PasswordChanged",
      { userId: string; passwordHash: string },
      EventMetadata
    >
  | Event<"RoleChanged", { userId: string; role: Role }, EventMetadata>;
