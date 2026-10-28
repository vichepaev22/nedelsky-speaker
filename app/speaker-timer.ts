export type Countdown = {
  durationMs: number;
  remainingMs: number;
  deadline: number | null;
  status: "idle" | "running" | "paused" | "finished";
};

export function parseMinutes(value: string): number | null {
  if (!value.trim()) return null;
  const minutes = Number(value);
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= 999 ? minutes : null;
}

export function createCountdown(minutes: number): Countdown {
  if (parseMinutes(String(minutes)) === null) throw new RangeError("Duration must be 1–999 whole minutes.");
  return { durationMs: minutes * 60_000, remainingMs: minutes * 60_000, deadline: null, status: "idle" };
}

export function timeLeft(timer: Countdown, now: number): number {
  return timer.deadline === null ? timer.remainingMs : Math.max(0, timer.deadline - now);
}

export function startCountdown(timer: Countdown, now: number): Countdown {
  if (timer.status === "running") return timer;
  const remainingMs = timer.status === "finished" ? timer.durationMs : timer.remainingMs;
  return { ...timer, remainingMs, deadline: now + remainingMs, status: "running" };
}

export function pauseCountdown(timer: Countdown, now: number): Countdown {
  if (timer.status !== "running") return timer;
  const remainingMs = timeLeft(timer, now);
  return { ...timer, remainingMs, deadline: null, status: remainingMs > 0 ? "paused" : "finished" };
}

export function settleCountdown(timer: Countdown, now: number): Countdown {
  return timer.status === "running" && timeLeft(timer, now) === 0
    ? { ...timer, remainingMs: 0, deadline: null, status: "finished" }
    : timer;
}

export function resetCountdown(timer: Countdown): Countdown {
  return { ...timer, remainingMs: timer.durationMs, deadline: null, status: "idle" };
}

export function formatTime(milliseconds: number): string {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
