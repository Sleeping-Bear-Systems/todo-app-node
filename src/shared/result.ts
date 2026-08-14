export type Result<T = unknown> =
  | Readonly<{
      type: "Success";
      value: T;
      tag: string;
    }>
  | Readonly<{
      type: "Failure";
      tag: string;
      message: string;
    }>;

export function toSuccess<T>(tag: string, value: T): Result<T> {
  return {
    type: "Success",
    tag,
    value,
  };
}

export function toFailure<T = unknown>(
  tag: string,
  message: string = "error",
): Result<T> {
  return {
    type: "Failure",
    tag,
    message,
  };
}
