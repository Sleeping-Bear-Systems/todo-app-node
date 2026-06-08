import { createHash, randomUUID } from "node:crypto";

export type User = Readonly<{
  id: string;
  username: string;
  passwordHash: string;
  role: string;
}>;

// temporary user list
const users: User[] = [];

export function createMockUsers() {
  getOrCreateUser(
    "admin",
    "password1234",
    "admin",
    "9599c9f5-2df4-45b2-99c7-4e8a80f0867b",
  );
}

function getOrCreateUser(
  username: string,
  password: string,
  role: string,
  userId?: string,
): User {
  const normalizedUsername = username.trim().toLowerCase();
  const existing = users.find((u) => u.username === normalizedUsername);
  if (existing !== undefined) {
    return existing;
  }
  const passwordHash = createHash("sha256").update(password).digest("hex");
  const validUserId = userId ?? randomUUID();
  const user: User = {
    id: validUserId,
    username: normalizedUsername,
    passwordHash,
    role,
  };
  users.push(user);
  return user;
}

export function verifyUser(
  username: string,
  password: string,
): Omit<User, "passwordHash"> | undefined {
  const normalizedUsername = username.trim().toLowerCase();
  const passwordHash = createHash("sha256").update(password).digest("hex");
  const existing = users.find(
    (u) => u.username === normalizedUsername && u.passwordHash === passwordHash,
  );
  return existing
    ? {
        id: existing.id,
        username: existing.username,
        role: existing.role,
      }
    : undefined;
}
