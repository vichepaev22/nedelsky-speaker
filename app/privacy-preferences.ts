export const NOTICE_STORAGE_KEY = "nedelsky-privacy-notice";
export const NOTICE_VERSION = "2026-10-23";
export const NOTICE_LIFETIME_MS = 180 * 24 * 60 * 60 * 1000;

export function hasNoticePreference(storage: Pick<Storage, "getItem">, now = Date.now()): boolean {
  try {
    const record: unknown = JSON.parse(storage.getItem(NOTICE_STORAGE_KEY) ?? "null");
    if (!record || typeof record !== "object") return false;
    const value = record as { version?: unknown; expiresAt?: unknown };
    return value.version === NOTICE_VERSION && typeof value.expiresAt === "number" && Number.isFinite(value.expiresAt) && value.expiresAt > now;
  } catch {
    return false;
  }
}

export function saveNoticePreference(storage: Pick<Storage, "setItem">, now = Date.now()): boolean {
  try {
    storage.setItem(NOTICE_STORAGE_KEY, JSON.stringify({ version: NOTICE_VERSION, expiresAt: now + NOTICE_LIFETIME_MS }));
    return true;
  } catch {
    return false;
  }
}
