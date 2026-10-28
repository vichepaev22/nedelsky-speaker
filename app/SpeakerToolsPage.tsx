"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { SiteHeader } from "./SiteHeader";
import { sitePath } from "./site-paths";
import { PrivacyLinks } from "./PrivacyNotice";
import { createCountdown, formatTime, parseMinutes, pauseCountdown, resetCountdown, settleCountdown, startCountdown, timeLeft } from "./speaker-timer";

const timerViews = [
  { value: "digits", label: "Цифры", sample: "15:00" },
  { value: "ring", label: "Круг", sample: "◯" },
  { value: "bar", label: "Полоса", sample: "━" },
] as const;
type TimerView = (typeof timerViews)[number]["value"];

export function SpeakerToolsPage() {
  const [minutes, setMinutes] = useState("15");
  const [task, setTask] = useState("");
  const [view, setView] = useState<TimerView>("digits");
  const [timer, setTimer] = useState(() => createCountdown(15));
  const [now, setNow] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const stageRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const validMinutes = parseMinutes(minutes);
  const remaining = timeLeft(timer, now);
  const progress = Math.max(0, Math.min(1, remaining / timer.durationMs));
  const running = timer.status === "running";
  const finished = timer.status === "finished";
  const urgent = running && remaining <= 60_000;
  const taskText = task.trim();
  const startLabel = timer.status === "paused" ? "Продолжить" : finished ? "Ещё раз" : "Старт";
  const statusLabel = finished ? "Время вышло" : timer.status === "paused" ? "Пауза" : urgent ? "Последняя минута" : running ? "Работаем" : "Готовы начать?";

  useEffect(() => {
    if (timer.status !== "running") return;
    // A delayed/background tick refreshes the display; it never extends the deadline.
    function updateClock() {
      const timestamp = Date.now();
      setNow(timestamp);
      setTimer((current) => settleCountdown(current, timestamp));
    }
    const interval = window.setInterval(updateClock, 200);
    document.addEventListener("visibilitychange", updateClock);
    window.addEventListener("focus", updateClock);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", updateClock);
      window.removeEventListener("focus", updateClock);
    };
  }, [timer.status]);

  const toggleCountdown = useCallback(() => {
    const timestamp = Date.now();
    setNow(timestamp);
    setTimer((current) => current.status === "running" ? pauseCountdown(current, timestamp) : startCountdown(current, timestamp));
  }, []);

  const reset = useCallback(() => setTimer((current) => resetCountdown(current)), []);

  const leavePresentation = useCallback(() => {
    setPresenting(false);
    if (document.fullscreenElement === stageRef.current) void document.exitFullscreen().catch(() => {});
    previousFocus.current?.focus({ preventScroll: true });
  }, []);

  function showPresentation() {
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPresenting(true);
    stageRef.current?.focus({ preventScroll: true });
    // Keep the page-sized presentation if the browser cannot enter native fullscreen.
    if (stageRef.current?.requestFullscreen) void stageRef.current.requestFullscreen().catch(() => {});
  }

  useEffect(() => {
    function syncFullscreen() {
      if (document.fullscreenElement !== stageRef.current) leavePresentation();
    }
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, [leavePresentation]);

  useEffect(() => {
    if (!presenting) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { leavePresentation(); return; }
      const target = event.target;
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest("input,textarea,select,button,a"))) return;
      if (event.code === "Space") { event.preventDefault(); toggleCountdown(); }
      if (event.code === "KeyR") { event.preventDefault(); reset(); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [presenting, leavePresentation, toggleCountdown, reset]);

  function chooseMinutes(value: string) {
    setMinutes(value);
    const parsed = parseMinutes(value);
    if (parsed !== null) setTimer(createCountdown(parsed));
  }

  function startAndPresent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (validMinutes === null) return;
    const timestamp = Date.now();
    setNow(timestamp);
    setTimer((current) => startCountdown(current, timestamp));
    showPresentation();
  }

  return (
    <main className="speaker-tools-page">
      <a className="skip-link" href="#timer-settings">Перейти к таймеру</a>
      <SiteHeader brandHref={sitePath("/#top")} contactHref={sitePath("/#contact")} navigation={[
        { href: sitePath("/"), label: "Главная" },
        { href: sitePath("/#programs"), label: "Программы" },
        { href: sitePath("/ai-for-business/"), label: "Индивидуальная работа" },
      ]} />

      <section className="speaker-tools-intro">
        <p className="eyebrow eyebrow-dark">Инструменты для спикера</p>
        <h1>Таймер <em>групповой работы.</em></h1>
        <p>Один экран для задания и обратного отсчёта. Подходит для упражнений, обсуждений и работы в командах.</p>
      </section>

      <div className="timer-workspace">
        <form className="timer-settings" id="timer-settings" onSubmit={startAndPresent}>
          <div className="timer-field">
            <label htmlFor="timer-minutes">Время, минуты</label>
            <div className="timer-duration-input"><input id="timer-minutes" type="number" min="1" max="999" step="1" inputMode="numeric" value={minutes} disabled={running} onChange={(event) => chooseMinutes(event.target.value)} aria-describedby="timer-duration-hint" /><span>мин</span></div>
            <p id="timer-duration-hint">{validMinutes === null ? "Введите целое число от 1 до 999." : running ? "Для изменения времени поставьте таймер на паузу." : "Установите время или выберите ниже."}</p>
            <div className="timer-presets" aria-label="Быстрый выбор времени">
              {[5, 10, 15, 30, 60].map((preset) => <button type="button" key={preset} disabled={running} aria-pressed={validMinutes === preset} onClick={() => chooseMinutes(String(preset))}>{preset}</button>)}
            </div>
          </div>

          <div className="timer-field">
            <label htmlFor="timer-task">Задание для группы <span>необязательно</span></label>
            <textarea id="timer-task" rows={3} maxLength={180} value={task} onChange={(event) => setTask(event.target.value)} placeholder="Например: придумайте 3 идеи и выберите одну" />
            <p>Этот текст появится крупно над таймером.</p>
          </div>

          <fieldset className="timer-view-options">
            <legend>Вид таймера</legend>
            {timerViews.map((item) => <button type="button" key={item.value} aria-pressed={view === item.value} onClick={() => setView(item.value)}><span aria-hidden="true">{item.sample}</span>{item.label}</button>)}
          </fieldset>

          <button className="button button-coral timer-present-button" type="submit" disabled={validMinutes === null}>{running ? "Показать на весь экран" : `${startLabel} на весь экран`} <span aria-hidden="true">↗</span></button>
          <p className="timer-shortcuts">В режиме показа: пробел — пауза,<br />R — сброс, Esc — выйти.</p>
        </form>

        <section ref={stageRef} tabIndex={-1} className={`timer-stage${presenting ? " is-presenting" : ""}${urgent ? " is-urgent" : ""}${finished ? " is-finished" : ""}`} aria-label="Экран таймера" data-view={view} data-long-task={taskText.length > 80}>
          <div className="timer-stage-heading">
            <p className="timer-stage-label">Групповая работа</p>
            {taskText && <h2 className="timer-task">{taskText}</h2>}
          </div>

          <div className="timer-visual">
            <div className={`timer-clock timer-clock-${view}`}>
              {view === "ring" && <svg className="timer-ring" viewBox="0 0 360 360" aria-hidden="true"><circle className="timer-ring-track" cx="180" cy="180" r="169" /><circle className="timer-ring-progress" cx="180" cy="180" r="169" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - progress)} /></svg>}
              <div className="timer-readout" role="timer" aria-live="off" aria-label={`Осталось ${formatTime(remaining)}`}>{formatTime(remaining)}</div>
              {view === "bar" && <div className="timer-progress-bar" aria-hidden="true"><span style={{ width: `${100 * progress}%` }} /></div>}
            </div>
            <p className="timer-status" role="status">{statusLabel}</p>
          </div>

          <div className="timer-controls">
            <button type="button" className="timer-toggle" onClick={toggleCountdown} disabled={validMinutes === null && !running}>{running ? "Пауза" : startLabel}</button>
            <button type="button" onClick={reset}>Сбросить</button>
            <button type="button" onClick={presenting ? leavePresentation : showPresentation}>{presenting ? "Выйти из показа" : "На весь экран"}</button>
          </div>
        </section>
      </div>

      <p className="timer-page-note">Следующее упражнение? Сбросьте таймер, обновите задание и начните снова.</p>
      <footer className="tools-footer"><a href={sitePath("/")}>← На сайт Максима Недельского</a><span>Инструменты для живой работы с группой</span><PrivacyLinks /></footer>
    </main>
  );
}
