import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { event } from "@event-driven-io/emmett";
import type { UserEvent } from "./userEvent.ts";
import { evolve, initialState, type UserDocument } from "./userProjection.ts";

const userId = "b8835ccf-58ca-4720-985e-a71168d4e5bc";
const eventMetadata = {
  userId,
  correlationId: "57c64c56-5034-4918-b9f1-2d56f438b276",
  now: new Date("2026-06-09T00:27:19.000Z"),
};

const unknownDocument: UserDocument = {
  _id: "",
  status: "Unknown",
  userName: "",
  passwordHash: "",
  role: "unknown",
};

const activeDocument: UserDocument = {
  _id: userId,
  status: "Active",
  userName: "user",
  passwordHash: "old-password-hash",
  role: "standard",
};

describe("evolve()", () => {
  test("UserRegistered transitions Unknown to Active", () => {
    const result = evolve(
      unknownDocument,
      event<UserEvent>(
        "UserRegistered",
        {
          userId,
          userName: "user",
          passwordHash: "password-hash",
          role: "standard",
        },
        eventMetadata,
      ),
    );

    assert.deepEqual(result, {
      _id: userId,
      status: "Active",
      userName: "user",
      passwordHash: "password-hash",
      role: "standard",
    });
  });

  test("UserRegistered does not change an Active user", () => {
    const result = evolve(
      activeDocument,
      event<UserEvent>(
        "UserRegistered",
        {
          userId,
          userName: "another-user",
          passwordHash: "another-password-hash",
          role: "admin",
        },
        eventMetadata,
      ),
    );

    assert.equal(result, activeDocument);
  });

  test("PasswordChanged updates an Active user's password hash", () => {
    const result = evolve(
      activeDocument,
      event<UserEvent>(
        "PasswordChanged",
        { userId, passwordHash: "new-password-hash" },
        eventMetadata,
      ),
    );

    assert.deepEqual(result, {
      ...activeDocument,
      passwordHash: "new-password-hash",
    });
  });

  test("PasswordChanged does not change an Unknown user", () => {
    const result = evolve(
      unknownDocument,
      event<UserEvent>(
        "PasswordChanged",
        { userId, passwordHash: "new-password-hash" },
        eventMetadata,
      ),
    );

    assert.equal(result, unknownDocument);
  });

  test("RoleChanged updates an Active user's role", () => {
    const result = evolve(
      activeDocument,
      event<UserEvent>("RoleChanged", { userId, role: "admin" }, eventMetadata),
    );

    assert.deepEqual(result, {
      ...activeDocument,
      role: "admin",
    });
  });

  test("RoleChanged does not change an Unknown user", () => {
    const result = evolve(
      unknownDocument,
      event<UserEvent>("RoleChanged", { userId, role: "admin" }, eventMetadata),
    );

    assert.equal(result, unknownDocument);
  });
});

describe("initialState()", () => {
  test("returns an Unknown user document with empty fields", () => {
    assert.deepEqual(initialState(), {
      _id: "",
      status: "Unknown",
      userName: "",
      passwordHash: "",
      role: "unknown",
    });
  });
});
