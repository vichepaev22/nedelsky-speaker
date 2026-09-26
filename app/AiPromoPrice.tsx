"use client";

import { useSyncExternalStore } from "react";

type OfferPhase = "standard" | "upcoming" | "active";

const promoDate = "2026-09-28";
const timeZone = "Asia/Yekaterinburg";

function dateKeyInTimeZone(date: Date): string {
  const parts = new Intl.DateTimeFormat("ru-RU", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function getAiOfferPhase(date = new Date()): OfferPhase {
  const currentDate = dateKeyInTimeZone(date);
  if (currentDate < promoDate) return "upcoming";
  if (currentDate === promoDate) return "active";
  return "standard";
}

export function formatRubles(price: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(price)} ₽`;
}

function subscribeToClock(onStoreChange: () => void) {
  const timer = window.setInterval(onStoreChange, 60_000);
  return () => window.clearInterval(timer);
}

function useOfferPhase(): OfferPhase {
  return useSyncExternalStore(subscribeToClock, () => getAiOfferPhase(), () => "standard");
}

export function AiPromoNotice() {
  const phase = useOfferPhase();
  if (phase === "standard") return null;

  return (
    <div className={`ai-offer-notice is-${phase}`} role="note">
      <span>28</span>
      <p>
        <strong>{phase === "active" ? "Специальные цены действуют сегодня" : "Специальные цены только 28 сентября"}</strong>
        {phase === "active"
          ? "Предложение завершится в 23:59 по времени Екатеринбурга."
          : "Без таймера и скрытых условий — предложение включится на один календарный день."}
      </p>
    </div>
  );
}

export function AiPromoPrice({ basePrice, promoPrice }: { basePrice: number; promoPrice: number }) {
  const phase = useOfferPhase();

  if (phase === "standard") {
    return (
      <div className="ai-price" data-phase="standard">
        <span className="ai-price-label">Стоимость формата</span>
        <strong>{formatRubles(basePrice)}</strong>
      </div>
    );
  }

  return (
    <div className={`ai-price is-${phase}`} data-phase={phase}>
      <span className="ai-price-label">{phase === "active" ? "Только сегодня · 28 сентября" : "Специальная цена · только 28 сентября"}</span>
      <div className="ai-price-row">
        <s>{formatRubles(basePrice)}</s>
        <strong>{formatRubles(promoPrice)}</strong>
      </div>
      <small>{phase === "active" ? "Цена действует до 23:59 по времени Екатеринбурга" : "Специальная цена начнёт действовать 28 сентября"}</small>
    </div>
  );
}
