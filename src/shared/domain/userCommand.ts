import {
  type Command,
  DeciderCommandHandler,
  event,
  IllegalStateError,
} from "@event-driven-io/emmett";
import type { Role } from "#shared/role.ts";
import { type CommandMetadata, toEventMetadata } from "./commandMetadata.ts";
import type { UserEvent } from "./userEvent.ts";
import { evolve, initialState, type UserState } from "./userState.ts";

export type UserCommand =
  | Command<
      "RegisterUser",
      Readonly<{
        userId: string;
        username: string;
        passwordHash: string;
        role: Role;
      }>,
      CommandMetadata
    >
  | Command<
      "ChangePassword",
      Readonly<{ userId: string; passwordHash: string }>,
      CommandMetadata
    >
  | Command<
      "ChangeRole",
      Readonly<{ userId: string; role: Role }>,
      CommandMetadata
    >;

export function decide(
  command: UserCommand,
  state: UserState,
): UserEvent | UserEvent[] {
  const { type, data, metadata } = command;
  const eventMetadata = toEventMetadata(metadata);
  switch (type) {
    case "RegisterUser":
      if (state.status !== "Unknown") {
        throw new IllegalStateError("User exists");
      }
      return event<UserEvent>(
        "UserRegistered",
        {
          userId: data.userId,
          username: data.username,
          passwordHash: data.passwordHash,
          role: data.role,
        },
        eventMetadata,
      );
    case "ChangePassword":
      if (state.status !== "Active") {
        throw new IllegalStateError("User does not exist");
      }
      return event<UserEvent>(
        "PasswordChanged",
        { userId: data.userId, passwordHash: data.passwordHash },
        eventMetadata,
      );
    case "ChangeRole":
      if (state.status !== "Active") {
        throw new IllegalStateError("User does not exist");
      }
      return event<UserEvent>(
        "RoleChanged",
        { userId: data.userId, role: data.role },
        eventMetadata,
      );
    default: {
      const _exhaustive: never = command;
      return _exhaustive;
    }
  }
}

export function mapToStreamId(id: string): string {
  return `user-${id}`;
}

export const handle = DeciderCommandHandler<
  UserState,
  UserCommand,
  UserEvent,
  UserEvent
>({
  evolve,
  initialState,
  decide,
  mapToStreamId,
});
