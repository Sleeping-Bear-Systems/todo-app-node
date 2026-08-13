import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { event } from "@event-driven-io/emmett";
import type { UserEvent } from "#shared/domain/userEvent.ts";
import { evolve, initialState, type UserState } from "./userState.ts";

const userId = "b8835ccf-58ca-4720-985e-a71168d4e5bc";
const eventMetadata = {
  userId,
  correlationId: "57c64c56-5034-4918-b9f1-2d56f438b276",
  now: new Date("2026-06-09T00:27:19.000Z"),
};

const activeUser: UserState = {
  status: "Active",
  userId,
  userName: "Ada Lovelace",
  passwordHash: "original-password-hash",
  role: "standard",
};

describe("evolve()", () => {
  test("UserRegistered transitions Unknown to Active", () => {
    const result = evolve(
      initialState(),
      event<UserEvent>(
        "UserRegistered",
        {
          userId,
          userName: "Ada Lovelace",
          passwordHash: "password-hash",
          role: "admin",
        },
        eventMetadata,
      ),
    );

    assert.deepEqual(result, {
      status: "Active",
      userId,
      userName: "Ada Lovelace",
      passwordHash: "password-hash",
      role: "admin",
    });
  });

  test("UserRegistered does not change an Active user", () => {
    const result = evolve(
      activeUser,
      event<UserEvent>(
        "UserRegistered",
        {
          userId,
          userName: "Grace Hopper",
          passwordHash: "replacement-password-hash",
          role: "admin",
        },
        eventMetadata,
      ),
    );

    assert.equal(result, activeUser);
  });

  test("PasswordChanged updates an Active user's password hash", () => {
    const result = evolve(
      activeUser,
      event<UserEvent>(
        "PasswordChanged",
        { userId, passwordHash: "updated-password-hash" },
        eventMetadata,
      ),
    );

    assert.deepEqual(result, {
      ...activeUser,
      passwordHash: "updated-password-hash",
    });
  });

  test("PasswordChanged does not change an Unknown user", () => {
    const unknownUser = initialState();
    const result = evolve(
      unknownUser,
      event<UserEvent>(
        "PasswordChanged",
        { userId, passwordHash: "updated-password-hash" },
        eventMetadata,
      ),
    );

    assert.equal(result, unknownUser);
  });

  test("RoleChanged updates an Active user's role", () => {
    const result = evolve(
      activeUser,
      event<UserEvent>("RoleChanged", { userId, role: "admin" }, eventMetadata),
    );

    assert.deepEqual(result, { ...activeUser, role: "admin" });
  });

  test("RoleChanged does not change an Unknown user", () => {
    const unknownUser = initialState();
    const result = evolve(
      unknownUser,
      event<UserEvent>("RoleChanged", { userId, role: "admin" }, eventMetadata),
    );

    assert.equal(result, unknownUser);
  });
});

describe("initialState()", () => {
  test("returns an Unknown user", () => {
    assert.deepEqual(initialState(), { status: "Unknown" });
  });
});
