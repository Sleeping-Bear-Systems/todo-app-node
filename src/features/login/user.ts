import { createHash } from "node:crypto";

export type User = Readonly<{
  username: string;
  passwordHash: string;
}>;

// temporary user list
const users: User[] = [];

export function getOrCreateUser(username: string, password: string): User {
  const normalizedUsername = username.trim().toLowerCase();
  const existing = users.find((u) => u.username === normalizedUsername);
  if (existing !== undefined) {
    return existing;
  }
  const passwordHash = createHash("sha256").update(password).digest("hex");
  const user: User = {
    username: normalizedUsername,
    passwordHash,
  };
  users.push(user);
  return user;
}

export function verifyUser(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const passwordHash = createHash("sha256").update(password).digest("hex");
  const existing = users.find(
    (u) => u.username === normalizedUsername && u.passwordHash === passwordHash,
  );
  return existing;
}
