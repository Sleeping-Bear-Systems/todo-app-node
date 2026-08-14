import { randomUUID } from "node:crypto";
import {
  command,
  type EventStore,
  STREAM_DOES_NOT_EXIST,
} from "@event-driven-io/emmett";
import type { PongoClient } from "@event-driven-io/pongo";
import bcrypt from "bcrypt";
import type { Clock } from "#shared/clock.ts";
import type { Role } from "#shared/role.ts";
import { handle, type UserCommand } from "./userCommand.ts";
import { type UserDocument, usersCollectionName } from "./userProjection.ts";

const BCRYPT_SALT_ROUNDS = 12;

export async function createUser(
  username: string,
  password: string,
  role: Role,
  eventStore: EventStore,
  readStore: PongoClient,
  clock: Clock,
): Promise<string> {
  const normalizedUsername = username.toLocaleLowerCase().trim();
  const user = await readStore
    .db()
    .collection<UserDocument>(usersCollectionName)
    .findOne({ username: normalizedUsername });
  if (user !== null) {
    return user?._id ?? "";
  }
  const userId = randomUUID();
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
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

export async function createMockUsers2(
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
