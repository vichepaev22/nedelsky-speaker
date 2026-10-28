import assert from "node:assert/strict";
import test from "node:test";
import { createCountdown, formatTime, parseMinutes, pauseCountdown, resetCountdown, settleCountdown, startCountdown, timeLeft } from "../app/speaker-timer.ts";

test("duration accepts whole minutes and rejects incomplete input", () => {
  for (const input of ["", " ", "0", "-1", "1.5", "1000", "NaN"]) assert.equal(parseMinutes(input), null);
  assert.equal(parseMinutes("15"), 15);
  assert.equal(parseMinutes("60"), 60);
  assert.equal(parseMinutes("999"), 999);
  assert.throws(() => createCountdown(0), RangeError);
});

test("a delayed update uses elapsed time rather than the number of interval ticks", () => {
  const timer = startCountdown(createCountdown(15), 10_000);
  assert.equal(timeLeft(timer, 130_000), 13 * 60_000);
  assert.equal(formatTime(timeLeft(timer, 899_001)), "00:11");
  assert.equal(startCountdown(timer, 200_000), timer, "starting twice must not extend the deadline");
});

test("pause preserves subsecond precision and resume ignores time spent paused", () => {
  const timer = startCountdown(createCountdown(1), 1000);
  const paused = pauseCountdown(timer, 11_251);
  assert.equal(paused.remainingMs, 49_749);
  assert.equal(timeLeft(paused, 90_000), 49_749);
  const resumed = startCountdown(paused, 100_000);
  assert.equal(timeLeft(resumed, 102_000), 47_749);
});

test("completion stays at zero and a fresh start restores the configured duration", () => {
  const running = startCountdown(createCountdown(1), 0);
  const done = settleCountdown(running, 60_100);
  assert.equal(done.status, "finished");
  assert.equal(formatTime(timeLeft(done, 100_000)), "00:00");
  assert.equal(settleCountdown(done, 120_000), done);
  assert.equal(timeLeft(startCountdown(done, 200_000), 200_000), 60_000);
});

test("pausing after the deadline finishes the countdown and reset clears its deadline", () => {
  const timer = startCountdown(createCountdown(5), 0);
  assert.equal(pauseCountdown(timer, 301_000).status, "finished");
  assert.deepEqual(resetCountdown(pauseCountdown(timer, 100_000)), createCountdown(5));
});

test("digital display supports long sessions and does not round down to zero early", () => {
  assert.equal(formatTime(60 * 60_000), "60:00");
  assert.equal(formatTime(999 * 60_000), "999:00");
  assert.equal(formatTime(1), "00:01");
  assert.equal(formatTime(-1), "00:00");
});
