"use client";

import { FormEvent, useEffect, useState } from "react";
import { sitePath } from "./site-paths";

const topicsByProgram: Record<string, string> = {
  "ai-business": "ИИ для роста бизнеса",
  "service-design": "Сервис-дизайн и клиентский опыт",
  partnership: "Партнёрство как основа взаимодействия",
  procurement: "Госзакупки как инструмент развития бизнеса",
};

type FormStatus = {
  tone: "success" | "attention";
  message: string;
};

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [topic, setTopic] = useState("ИИ для роста бизнеса");

  useEffect(() => {
    const program = new URLSearchParams(window.location.search).get("program") ?? "";
    const nextTopic = topicsByProgram[program];
    if (!nextTopic) return;

    const updateTopic = window.setTimeout(() => setTopic(nextTopic), 0);
    return () => window.clearTimeout(updateTopic);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const topic = String(form.get("topic") || "").trim();
    const details = String(form.get("details") || "").trim();

    const message = [
      "Здравствуйте, Максим! Хочу обсудить задачу.",
      topic && `Интересующая тема: ${topic}`,
      details && `Вопрос / задача: ${details}`,
    ].filter(Boolean).join("\n");

    setDraft(message);
    window.open("https://vk.ru/ndlsky", "_blank", "noopener,noreferrer");

    if (!navigator.clipboard) {
      setStatus({
        tone: "success",
        message: "Текст готов ниже. Скопируйте его и вставьте в сообщение ВКонтакте.",
      });
      return;
    }

    void navigator.clipboard.writeText(message).then(
      () => setStatus({
        tone: "success",
        message: "Готово: текст скопирован. ВКонтакте откроется в новой вкладке. Вставьте текст и отправьте его; если вкладка не открылась — используйте карточку «Написать напрямую».",
      }),
      () => setStatus({
        tone: "attention",
        message: "Текст подготовлен ниже, но не скопирован автоматически. Выделите и скопируйте его вручную.",
      }),
    );
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <h3>Короткая форма</h3>
      <p>Выберите тему и опишите задачу — подготовим сообщение для ВКонтакте.</p>
      <div className="field-grid">
        <div className="field field-full"><label htmlFor="lead-topic">Интересующая тема</label><select id="lead-topic" name="topic" value={topic} onChange={(event) => setTopic(event.currentTarget.value)}><option>ИИ для роста бизнеса</option><option>Сервис-дизайн и клиентский опыт</option><option>Партнёрство как основа взаимодействия</option><option>Госзакупки как инструмент развития бизнеса</option><option>Нужна консультация по выбору темы</option></select></div>
        <div className="field field-full"><label htmlFor="lead-details">Что хотите получить, какой вопрос хотите задать</label><textarea id="lead-details" name="details" required maxLength={4000} placeholder="Опишите задачу или задайте вопрос. Если речь о событии — добавьте аудиторию, дату и формат." /></div>
      </div>
      <button className={`button form-submit ${status?.tone === "success" ? "is-success" : ""}`} type="submit">{status?.tone === "success" ? "Текст готов — открыть VK" : "Подготовить текст и открыть VK"} <span>{status?.tone === "success" ? "✓" : "↗"}</span></button>
      <output className={`form-status ${status ? `is-${status.tone}` : ""}`} aria-live="polite">
        {status && <><span aria-hidden="true">{status.tone === "success" ? "✓" : "!"}</span>{status.message}</>}
      </output>
      {draft && (
        <div className="draft-fallback">
          <label htmlFor="lead-draft">Подготовленный текст</label>
          <textarea id="lead-draft" readOnly value={draft} onFocus={(event) => event.currentTarget.select()} />
        </div>
      )}
      <p className="form-consent">Текст формы не отправляется на сервер сайта. Кнопка копирует его и открывает ВК — сообщение отправляете вы сами. <a href={sitePath("/legal/privacy/")}>Как обрабатываются данные</a>.</p>
    </form>
  );
}
