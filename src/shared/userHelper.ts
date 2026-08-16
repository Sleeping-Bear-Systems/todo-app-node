import { randomUUID } from "node:crypto";
import {
  command,
  type EventStore,
  STREAM_DOES_NOT_EXIST,
} from "@event-driven-io/emmett";
import { genSalt, hash } from "bcrypt-ts";
import type { Clock } from "#shared/clock.ts";
import type { AppConfig } from "./appConfig.ts";
import {
  handle,
  mapToStreamId,
  type UserCommand,
} from "./domain/userCommand.ts";

const BCRYPT_SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  const salt = await genSalt(BCRYPT_SALT_ROUNDS);
  return await hash(password, salt);
}

export async function createAdminUser(
  appConfig: AppConfig,
  eventStore: EventStore,
  clock: Clock,
): Promise<void> {
  const userId = "709b0fd4-72af-4d37-9579-ecb40491a833";
  const streamId = mapToStreamId(userId);
  const exists = await eventStore.streamExists(streamId);
  if (exists) {
    return;
  }
  const passwordHash = await hashPassword(appConfig.admin.password);
  const registerUserCommand = command<UserCommand>(
    "RegisterUser",
    {
      userId,
      username: appConfig.admin.username,
      passwordHash,
      role: "admin",
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
}

export async function createNormalUser(
  eventStore: EventStore,
  clock: Clock,
): Promise<void> {
  const userId = "8f521aba-eca4-46c8-b833-27041533e9ea";
  const streamId = mapToStreamId(userId);
  const exists = await eventStore.streamExists(streamId);
  if (exists) {
    return;
  }
  const passwordHash = await hashPassword("password1357");
  const registerUserCommand = command<UserCommand>(
    "RegisterUser",
    {
      userId,
      username: "john-doe",
      passwordHash,
      role: "standard",
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
}
