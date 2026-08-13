import type { Command } from "@event-driven-io/emmett";
import type { CommandMetadata } from "./commandMetadata.ts";
import type { UserEvent } from "./userEvent.ts";
import type { UserState } from "./userState.ts";

export type UserCommand = Command<
  "RegisterUser",
  { userId: string; userName: string; passwordHash: string },
  CommandMetadata
>;

export function decide(_command: UserCommand, _state: UserState): UserEvent[] {
  return [];
}
