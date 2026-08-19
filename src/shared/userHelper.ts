import { randomUUID } from "node:crypto";
import {
  command,
  type EventStore,
  STREAM_DOES_NOT_EXIST,
} from "@event-driven-io/emmett";
import { genSalt, hash } from "bcrypt-ts";
import z from "zod";
import type { Clock } from "#shared/clock.ts";
import type { Role } from "#shared/role.ts";
import {
  handle,
  mapToStreamId,
  type UserCommand,
} from "./domain/userCommand.ts";

const BCRYPT_SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  const salt = await genSalt(BCRYPT_SALT_ROUNDS);
  return await hash(password, salt);
}

export async function createUser(
  userId: string,
  username: string,
  password: string,
  role: Role,
  eventStore: EventStore,
  clock: Clock,
): Promise<string> {
  const streamId = mapToStreamId(userId);
  const streamExists = await eventStore.streamExists(streamId);
  if (streamExists) {
    return userId;
  }
  const passwordHash = await hashPassword(password);
  const registerUserCommand = command<UserCommand>(
    "RegisterUser",
    {
      userId,
      username,
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

export async function createStandardUser(
  eventStore: EventStore,
  clock: Clock,
): Promise<void> {
  await createUser(
    "16822321-9ebc-4c2a-aa1f-e29a3ea8e295",
    "john-doe",
    "password1357",
    "standard",
    eventStore,
    clock,
  );
}

const defaultAdminUsername = "admin";
const defaultAdminPassword = "password1234";
const adminUserId = "a865648c-d86b-415f-b6d1-e12b665027cc";

const credentialsSchema = z.object({
  ADMIN_USERNAME: z.string().trim().min(4),
  ADMIN_PASSWORD: z.string().trim().min(8),
});

export async function createAdminUser(
  isProduction: boolean,
  processEnv: Record<string, string | undefined>,
  eventStore: EventStore,
  clock: Clock,
): Promise<void> {
  let username: string;
  let password: string;
  if (isProduction) {
    const credentials = credentialsSchema.parse(processEnv);
    username = credentials.ADMIN_USERNAME;
    password = credentials.ADMIN_PASSWORD;
    if (credentials.ADMIN_USERNAME.toLowerCase() === defaultAdminUsername) {
      throw new Error("Invalid admin username");
    }
    if (credentials.ADMIN_PASSWORD === defaultAdminPassword) {
      throw new Error("Invalid admin password");
    }
  } else {
    username = defaultAdminUsername;
    password = defaultAdminPassword;
  }

  await createUser(adminUserId, username, password, "admin", eventStore, clock);
}
