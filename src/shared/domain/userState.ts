import type { Role } from "#shared/role.ts";
import type { UserEvent } from "./userEvent.ts";

export type UserState =
  | Readonly<{
      status: "Unknown";
    }>
  | Readonly<{
      status: "Active";
      userId: string;
      userName: string;
      passwordHash: string;
      role: Role;
    }>;

export function initialState(): UserState {
  return { status: "Unknown" };
}

export function evolve(state: UserState, event: UserEvent): UserState {
  const { type, data } = event;
  switch (state.status) {
    case "Unknown":
      if (type === "UserRegistered") {
        return {
          status: "Active",
          userId: data.userId,
          userName: data.userName,
          passwordHash: data.passwordHash,
          role: data.role,
        };
      }
      break;
    case "Active":
      switch (type) {
        case "PasswordChanged":
          return {
            ...state,
            passwordHash: data.passwordHash,
          };
        case "RoleChanged": {
          return {
            ...state,
            role: data.role,
          };
        }
      }
      break;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
  return state;
}
