import { pongoSingleStreamProjection } from "@event-driven-io/emmett-postgresql";
import type { Role } from "#shared/role.ts";
import type { UserEvent } from "./userEvent.ts";

export type UserDocument = {
  _id: string;
  status: "Unknown" | "Active";
  username: string;
  passwordHash: string;
  role: Role;
};

export function initialState(): UserDocument {
  return {
    _id: "",
    status: "Unknown",
    username: "",
    passwordHash: "",
    role: "unknown",
  };
}

export function evolve(document: UserDocument, event: UserEvent): UserDocument {
  const { type, data } = event;
  switch (document.status) {
    case "Unknown":
      if (type === "UserRegistered") {
        return {
          _id: data.userId,
          status: "Active",
          username: data.username,
          passwordHash: data.passwordHash,
          role: data.role,
        };
      }
      break;
    case "Active":
      if (type === "PasswordChanged") {
        return { ...document, passwordHash: data.passwordHash };
      } else if (type === "RoleChanged") {
        return { ...document, role: data.role };
      }
      break;
    default: {
      const _exhaustive: never = document.status;
      return _exhaustive;
    }
  }
  return document;
}

export const usersCollectionName: string = "users";

export const userProjection = pongoSingleStreamProjection({
  collectionName: usersCollectionName,
  canHandle: ["UserRegistered", "PasswordChanged", "RoleChanged"],
  getDocumentId: (event) => {
    return event.data.userId;
  },
  initialState,
  evolve,
});
