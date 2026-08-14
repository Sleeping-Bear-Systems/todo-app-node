export type Role = "admin" | "standard" | "unknown";

export function toRole(role: string): Role {
  switch (role.toLowerCase()) {
    case "admin":
      return "admin";
    case "standard":
      return "standard";
    default:
      return "unknown";
  }
}
