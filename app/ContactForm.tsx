"use client";

import { FormEvent, useEffect, useState } from "react";

const topicsByProgram: Record<string, string> = {
  "ai-business": "ИИ для роста бизнеса",
  "service-design": "Сервис-дизайн и клиентский опыт",
  partnership: "Партнёрство как основа взаимодействия",
  procurement: "Госзакупки как инструмент развития бизнеса",
};

export function ContactForm() {
  const [status, setStatus] = useState<string>("");
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
    const name = String(form.get("name") || "").trim();
    const company = String(form.get("company") || "").trim();
    const topic = String(form.get("topic") || "").trim();
    const details = String(form.get("details") || "").trim();

    const message = [
      "Здравствуйте, Максим! Хочу обсудить выступление.",
      name && `Имя: ${name}`,
      company && `Компания / событие: ${company}`,
      topic && `Интересующая тема: ${topic}`,
      details && `Задача: ${details}`,
    ].filter(Boolean).join("\n");

    setDraft(message);
    const vkWindow = window.open("https://vk.ru/ndlsky", "_blank", "noopener,noreferrer");

    if (!navigator.clipboard) {
      setStatus("ВКонтакте открыт. Скопируйте подготовленный текст ниже и вставьте его в сообщение.");
      return;
    }

    void navigator.clipboard.writeText(message).then(
      () => setStatus("Текст скопирован. Вставьте его в открывшееся сообщение ВКонтакте."),
      () => setStatus("Не удалось скопировать автоматически. Скопируйте подготовленный текст ниже."),
    );

    if (!vkWindow) {
      setStatus("Браузер заблокировал новую вкладку. Скопируйте текст ниже и откройте ВКонтакте по ссылке.");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <h3>Короткая заявка</h3>
      <p>Можно написать сразу или за минуту подготовить структурированное сообщение.</p>
      <a className="form-vk-direct" href="https://vk.ru/ndlsky" target="_blank" rel="noreferrer">Написать сразу в VK <span>↗</span></a>
      <p className="form-divider"><span>или подготовить сообщение</span></p>
      <div className="field-grid">
        <div className="field"><label htmlFor="lead-name">Ваше имя</label><input id="lead-name" name="name" required autoComplete="name" placeholder="Как к вам обращаться" /></div>
        <div className="field"><label htmlFor="lead-company">Компания или событие</label><input id="lead-company" name="company" placeholder="Например: бизнес-форум" /></div>
        <div className="field field-full"><label htmlFor="lead-topic">Интересующая тема</label><select id="lead-topic" name="topic" value={topic} onChange={(event) => setTopic(event.currentTarget.value)}><option>ИИ для роста бизнеса</option><option>Сервис-дизайн и клиентский опыт</option><option>Партнёрство как основа взаимодействия</option><option>Госзакупки как инструмент развития бизнеса</option><option>Нужна консультация по выбору темы</option></select></div>
        <div className="field field-full"><label htmlFor="lead-details">Что хотите получить</label><textarea id="lead-details" name="details" placeholder="Аудитория, дата, город, формат и задача мероприятия" /></div>
      </div>
      <button className="button form-submit" type="submit">Подготовить текст и открыть VK <span>↗</span></button>
      <p className="form-status" aria-live="polite">{status}</p>
      {draft && (
        <div className="draft-fallback">
          <label htmlFor="lead-draft">Подготовленный текст</label>
          <textarea id="lead-draft" readOnly value={draft} onFocus={(event) => event.currentTarget.select()} />
        </div>
      )}
      <p className="form-consent">Сайт не отправляет и не сохраняет данные: текст остаётся в вашем браузере, пока вы сами не отправите его во ВКонтакте.</p>
    </form>
  );
}
