import assert from "node:assert/strict";
import test from "node:test";
import { NOTICE_STORAGE_KEY, NOTICE_VERSION, NOTICE_LIFETIME_MS, hasNoticePreference, saveNoticePreference } from "../app/privacy-preferences.ts";

const now = Date.UTC(2026, 9, 23);

test("notice stores only a version and 180-day expiry after acknowledgement", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(hasNoticePreference(storage, now), false);
  assert.equal(values.size, 0);
  assert.equal(saveNoticePreference(storage, now), true);
  assert.equal(values.size, 1);
  assert.deepEqual(JSON.parse(values.get(NOTICE_STORAGE_KEY)), { version: NOTICE_VERSION, expiresAt: now + NOTICE_LIFETIME_MS });
  assert.equal(hasNoticePreference(storage, now + 1), true);
  assert.equal(hasNoticePreference(storage, now + NOTICE_LIFETIME_MS), false);
});

test("invalid, expired and old-version records do not suppress the notice", () => {
  for (const value of [null, "broken", "null", "true", "{}", JSON.stringify({ version: "old", expiresAt: now + 1000 }), JSON.stringify({ version: NOTICE_VERSION, expiresAt: now - 1 }), JSON.stringify({ version: NOTICE_VERSION, expiresAt: "forever" })]) {
    assert.equal(hasNoticePreference({ getItem: () => value }, now), false);
  }
});

test("blocked browser storage is handled without throwing", () => {
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.equal(hasNoticePreference(blocked, now), false);
  assert.equal(saveNoticePreference(blocked, now), false);
});
