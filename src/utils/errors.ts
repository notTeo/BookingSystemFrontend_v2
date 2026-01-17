type Translate = (key: string) => string;

export function getFriendlyError(
  raw: unknown,
  t: Translate,
  fallbackKey: string,
): string {
  const message = raw instanceof Error ? raw.message : typeof raw === "string" ? raw : "";
  const lower = message.toLowerCase();

  if (lower.includes("email") && (lower.includes("already") || lower.includes("exists"))) {
    return t("This email is already in use.");
  }
  if (lower.includes("password") && (lower.includes("weak") || lower.includes("length"))) {
    return t("Your password is too weak. Try a longer one.");
  }
  if (lower.includes("password") && (lower.includes("incorrect") || lower.includes("invalid"))) {
    return t("Email or password is incorrect.");
  }
  if (lower.includes("unauthorized") || lower.includes("invalid credentials")) {
    return t("Email or password is incorrect.");
  }
  if (lower.includes("token") || lower.includes("expired")) {
    return t("Your reset link is invalid or expired.");
  }
  if (lower.includes("email") && lower.includes("invalid")) {
    return t("Enter a valid email address.");
  }
  if (lower.includes("conflict") || lower.includes("overlap")) {
    return t("This request conflicts with an existing record.");
  }

  return t(fallbackKey);
}
