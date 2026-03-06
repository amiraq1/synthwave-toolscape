const SUPABASE_NETWORK_ERROR_CODE = "SUPABASE_NETWORK_UNAVAILABLE";
const SUPABASE_NETWORK_ERROR_MESSAGE = "Supabase network unavailable";

type ErrorLike = {
  code?: unknown;
  message?: unknown;
  details?: unknown;
  cause?: unknown;
};

const collectErrorText = (error: unknown): string => {
  if (!error) return "";

  if (typeof error === "string") {
    return error.toLowerCase();
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const causeText = collectErrorText((error as ErrorLike).cause);
    return `${message} ${causeText}`.trim();
  }

  if (typeof error === "object") {
    const errorLike = error as ErrorLike;
    return [
      String(errorLike.code ?? ""),
      String(errorLike.message ?? ""),
      String(errorLike.details ?? ""),
      collectErrorText(errorLike.cause),
    ]
      .join(" ")
      .toLowerCase()
      .trim();
  }

  return "";
};

export const createSupabaseNetworkError = (cause?: unknown): Error => {
  const error = new Error(SUPABASE_NETWORK_ERROR_MESSAGE) as Error & ErrorLike;
  error.code = SUPABASE_NETWORK_ERROR_CODE;
  error.cause = cause;
  error.details = collectErrorText(cause);
  return error;
};

export const isSupabaseNetworkError = (error: unknown): boolean => {
  const text = collectErrorText(error);

  return [
    SUPABASE_NETWORK_ERROR_CODE.toLowerCase(),
    SUPABASE_NETWORK_ERROR_MESSAGE.toLowerCase(),
    "err_name_not_resolved",
    "enotfound",
    "dns name does not exist",
    "failed to fetch",
  ].some((token) => text.includes(token));
};
