export type Result =
  | Readonly<{
      type: "Success";
      tag: string;
    }>
  | Readonly<{
      type: "Failure";
      tag: string;
      message: string;
    }>;

export function toSuccess(tag: string): Result {
  return {
    type: "Success",
    tag,
  };
}

export function toFailure(tag: string, message: string = "error"): Result {
  return {
    type: "Failure",
    tag,
    message,
  };
}
