export function formDataStringEntries(data: FormData) {
  return Object.fromEntries(data.entries()) as Record<
    string,
    string | undefined
  >;
}
