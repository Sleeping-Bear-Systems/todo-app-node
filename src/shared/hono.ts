export function formDataStringEntries(data: FormData): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of data.entries()) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }

  return result;
}
