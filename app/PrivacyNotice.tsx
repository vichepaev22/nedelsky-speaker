"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { hasNoticePreference, NOTICE_STORAGE_KEY, saveNoticePreference } from "./privacy-preferences";
import { sitePath } from "./site-paths";

const preferenceChanged = "nedelsky-privacy-change";
const noticeRequested = "nedelsky-privacy-open";

function subscribe(callback: () => void) {
  const storageChanged = (event: StorageEvent) => {
    if (event.key === NOTICE_STORAGE_KEY || event.key === null) callback();
  };
  window.addEventListener("storage", storageChanged);
  window.addEventListener(preferenceChanged, callback);
  return () => {
    window.removeEventListener("storage", storageChanged);
    window.removeEventListener(preferenceChanged, callback);
  };
}

function getSnapshot() {
  try { return hasNoticePreference(window.localStorage); } catch { return false; }
}

const getServerSnapshot = () => true;

export function PrivacyLinks() {
  return <nav className="privacy-links" aria-label="Правовая информация">
    <a href={sitePath("/legal/privacy/")}>Политика конфиденциальности</a>
    <button type="button" onClick={() => window.dispatchEvent(new Event(noticeRequested))}>О cookies</button>
  </nav>;
}

export function PrivacyNotice() {
  const acknowledged = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [requested, setRequested] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const acceptButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let frame = 0;
    const open = () => {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setRequested(true);
      setDismissed(false);
      frame = window.requestAnimationFrame(() => acceptButton.current?.focus({ preventScroll: true }));
    };
    window.addEventListener(noticeRequested, open);
    return () => {
      window.removeEventListener(noticeRequested, open);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  function acknowledge() {
    try { saveNoticePreference(window.localStorage); } catch { /* Closing still works when storage is unavailable. */ }
    setDismissed(true);
    setRequested(false);
    window.dispatchEvent(new Event(preferenceChanged));
    if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
  }

  if (dismissed || (!requested && acknowledged)) return null;

  return <aside className="privacy-notice" aria-labelledby="privacy-notice-title">
    <h2 id="privacy-notice-title">О cookies и данных</h2>
    <p>На сайте нет рекламных и аналитических cookies. Технические данные обрабатывает хостинг. Мы сохраняем в браузере только отметку о закрытии этого уведомления.</p>
    <div className="privacy-notice-actions">
      <a href={sitePath("/legal/privacy/#cookies")}>Подробнее в политике</a>
      <button type="button" ref={acceptButton} onClick={acknowledge}>Принять</button>
    </div>
  </aside>;
}
