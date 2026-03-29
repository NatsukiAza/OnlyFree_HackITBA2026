/** Coincide con validación en cliente para registro. */
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(raw: string): boolean {
  return USERNAME_REGEX.test(raw.trim());
}
