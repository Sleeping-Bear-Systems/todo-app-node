import type { Event } from "@event-driven-io/emmett";
import type { Role } from "#shared/role.ts";
import type { EventMetadata } from "./eventMetadata.ts";

export type UserEvent =
  | Event<
      "UserRegistered",
      Readonly<{
        userId: string;
        username: string;
        passwordHash: string;
        role: Role;
      }>,
      EventMetadata
    >
  | Event<
      "PasswordChanged",
      Readonly<{ userId: string; passwordHash: string }>,
      EventMetadata
    >
  | Event<
      "RoleChanged",
      Readonly<{ userId: string; role: Role }>,
      EventMetadata
    >;
