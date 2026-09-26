"use client";

import { FormEvent, useEffect, useState } from "react";
import { aiProducts, getAiProduct } from "./ai-products-data";
import { formatRubles, getAiOfferPhase } from "./AiPromoPrice";

type FormStatus = { tone: "success" | "attention"; message: string };

export function AiInquiryForm() {
  const [productSlug, setProductSlug] = useState(aiProducts[0].slug);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<FormStatus | null>(null);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("product") ?? "";
    if (!getAiProduct(requested)) return;
    const updateProduct = window.setTimeout(() => setProductSlug(requested), 0);
    return () => window.clearTimeout(updateProduct);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const details = String(form.get("details") || "").trim();
    const product = getAiProduct(String(form.get("product") || "")) ?? aiProducts[0];
    const activePrice = getAiOfferPhase() === "active" ? product.promoPrice : product.basePrice;
    const message = [
      "Здравствуйте, Максим! Хочу обсудить формат работы с ИИ.",
      `Имя: ${name}`,
      `Продукт: ${product.title}`,
      `Стоимость на дату обращения: ${formatRubles(activePrice)}`,
      details && `Задача: ${details}`,
    ].filter(Boolean).join("\n");

    setDraft(message);
    window.open("https://vk.ru/ndlsky", "_blank", "noopener,noreferrer");

    if (!navigator.clipboard) {
      setStatus({ tone: "attention", message: "Текст подготовлен ниже. Скопируйте его и вставьте в сообщение ВКонтакте." });
      return;
    }

    void navigator.clipboard.writeText(message).then(
      () => setStatus({ tone: "success", message: "Текст заявки подготовлен и скопирован. ВКонтакте открыт в новой вкладке." }),
      () => setStatus({ tone: "attention", message: "ВКонтакте открыт. Скопируйте подготовленный текст вручную." }),
    );
  }

  return (
    <form className="ai-inquiry-form" onSubmit={submit}>
      <div className="ai-field">
        <label htmlFor="ai-lead-name">Ваше имя</label>
        <input id="ai-lead-name" name="name" required autoComplete="name" placeholder="Как к вам обращаться" />
      </div>
      <div className="ai-field">
        <label htmlFor="ai-lead-product">Выбранный формат</label>
        <select id="ai-lead-product" name="product" value={productSlug} onChange={(event) => setProductSlug(event.currentTarget.value)}>
          {aiProducts.map((product) => <option value={product.slug} key={product.slug}>{product.shortTitle}</option>)}
        </select>
      </div>
      <div className="ai-field ai-field-wide">
        <label htmlFor="ai-lead-details">Кратко опишите задачу <span>необязательно</span></label>
        <textarea id="ai-lead-details" name="details" placeholder="Что хотите улучшить или научиться делать с помощью ИИ" />
      </div>
      <button className="button button-coral ai-inquiry-submit" type="submit">Подготовить заявку и открыть VK <span>↗</span></button>
      <output className={`form-status ${status ? `is-${status.tone}` : ""}`} aria-live="polite">
        {status && <><span aria-hidden="true">{status.tone === "success" ? "✓" : "!"}</span>{status.message}</>}
      </output>
      {draft && (
        <div className="draft-fallback ai-draft">
          <label htmlFor="ai-lead-draft">Подготовленный текст</label>
          <textarea id="ai-lead-draft" readOnly value={draft} onFocus={(event) => event.currentTarget.select()} />
        </div>
      )}
      <p className="ai-privacy-note">Сайт не отправляет и не сохраняет данные. Вы сами отправляете подготовленный текст Максиму во ВКонтакте.</p>
    </form>
  );
}
