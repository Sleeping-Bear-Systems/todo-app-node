import { randomUUID } from "node:crypto";
import {
  command,
  type EventStore,
  STREAM_DOES_NOT_EXIST,
} from "@event-driven-io/emmett";
import type { PongoClient } from "@event-driven-io/pongo";
import { genSalt, hash } from "bcrypt-ts";
import type { Clock } from "#shared/clock.ts";
import type { Role } from "#shared/role.ts";
import { handle, type UserCommand } from "./domain/userCommand.ts";
import {
  type UserDocument,
  usersCollectionName,
} from "./domain/userProjection.ts";

const BCRYPT_SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  const salt = await genSalt(BCRYPT_SALT_ROUNDS);
  return await hash(password, salt);
}

export async function createUser(
  username: string,
  password: string,
  role: Role,
  eventStore: EventStore,
  readStore: PongoClient,
  clock: Clock,
): Promise<string> {
  const normalizedUsername = username.toLowerCase().trim();
  const userDocument = await readStore
    .db()
    .collection<UserDocument>(usersCollectionName)
    .findOne({ username: normalizedUsername });
  if (userDocument !== null) {
    return userDocument._id;
  }
  const userId = randomUUID();
  const passwordHash = await hashPassword(password);
  const registerUserCommand = command<UserCommand>(
    "RegisterUser",
    {
      userId,
      username: normalizedUsername,
      passwordHash,
      role,
    },
    {
      userId: "system",
      now: clock.now(),
      correlationId: randomUUID(),
    },
  );
  await handle(eventStore, userId, registerUserCommand, {
    expectedStreamVersion: STREAM_DOES_NOT_EXIST,
  });
  return userId;
}

export async function createMockUsers(
  eventStore: EventStore,
  readStore: PongoClient,
  clock: Clock,
): Promise<void> {
  await createUser(
    "admin",
    "password1234",
    "admin",
    eventStore,
    readStore,
    clock,
  );
  await createUser(
    "john-doe",
    "password1357",
    "standard",
    eventStore,
    readStore,
    clock,
  );
}
