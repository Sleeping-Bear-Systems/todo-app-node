import type { Role } from "./role.ts";

export type Account = Readonly<{
  userId: string;
  username: string;
  role: Role;
}>;
