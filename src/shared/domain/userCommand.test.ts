import { describe, test } from "node:test";
import {
  command,
  DeciderSpecification,
  event,
  IllegalStateError,
} from "@event-driven-io/emmett";
import { toEventMetadata } from "./commandMetadata.ts";
import { decide, type UserCommand } from "./userCommand.ts";
import type { UserEvent } from "./userEvent.ts";
import { evolve, initialState } from "./userState.ts";

const spec = DeciderSpecification.for({
  decide,
  evolve,
  initialState,
});

const userId = "b8835ccf-58ca-4720-985e-a71168d4e5bc";
const now = new Date("2026-06-09T00:27:19.000Z");
const commandMetadata = {
  userId,
  correlationId: "57c64c56-5034-4918-b9f1-2d56f438b276",
  now,
};
const eventMetadata = toEventMetadata(commandMetadata);
const userRegistered = event<UserEvent>(
  "UserRegistered",
  {
    userId,
    userName: "Ada Lovelace",
    passwordHash: "password-hash",
    role: "standard",
  },
  eventMetadata,
);

describe("RegisterUser", () => {
  const registerUserCommand = command<UserCommand>(
    "RegisterUser",
    {
      userId,
      userName: "Ada Lovelace",
      passwordHash: "password-hash",
      role: "standard",
    },
    commandMetadata,
  );

  test("Unknown state returns a UserRegistered event", () => {
    spec([]).when(registerUserCommand).then(userRegistered);
  });

  test("Active state throws IllegalStateError", () => {
    spec([userRegistered])
      .when(registerUserCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "User exists",
      );
  });
});

describe("ChangePassword", () => {
  const changePasswordCommand = command<UserCommand>(
    "ChangePassword",
    { userId, passwordHash: "updated-password-hash" },
    commandMetadata,
  );

  test("Active state returns a PasswordChanged event", () => {
    spec([userRegistered])
      .when(changePasswordCommand)
      .then(
        event<UserEvent>(
          "PasswordChanged",
          { userId, passwordHash: "updated-password-hash" },
          eventMetadata,
        ),
      );
  });

  test("Unknown state throws IllegalStateError", () => {
    spec([])
      .when(changePasswordCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "User does not exist",
      );
  });
});

describe("ChangeRole", () => {
  const changeRoleCommand = command<UserCommand>(
    "ChangeRole",
    { userId, role: "admin" },
    commandMetadata,
  );

  test("Active state returns a RoleChanged event", () => {
    spec([userRegistered])
      .when(changeRoleCommand)
      .then(
        event<UserEvent>(
          "RoleChanged",
          { userId, role: "admin" },
          eventMetadata,
        ),
      );
  });

  test("Unknown state throws IllegalStateError", () => {
    spec([])
      .when(changeRoleCommand)
      .thenThrows(
        IllegalStateError,
        (error) => error.message === "User does not exist",
      );
  });
});
