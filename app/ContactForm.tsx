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
    const contact = String(form.get("contact") || "").trim();
    const topic = String(form.get("topic") || "").trim();
    const details = String(form.get("details") || "").trim();

    const message = [
      "Здравствуйте, Максим! Хочу обсудить выступление.",
      name && `Имя: ${name}`,
      company && `Компания / событие: ${company}`,
      contact && `Как связаться: ${contact}`,
      topic && `Интересующая тема: ${topic}`,
      details && `Задача: ${details}`,
    ].filter(Boolean).join("\n");

    void navigator.clipboard?.writeText(message);
    setStatus("Заявка скопирована. Откройте ВКонтакте и вставьте её в сообщение Максиму.");
    window.open("https://vk.ru/ndlsky", "_blank", "noopener,noreferrer");
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <h3>Короткая заявка</h3>
      <p>Заполните поля — текст заявки скопируется, а страница ВКонтакте откроется в новой вкладке.</p>
      <div className="field-grid">
        <div className="field"><label htmlFor="lead-name">Ваше имя</label><input id="lead-name" name="name" required autoComplete="name" placeholder="Как к вам обращаться" /></div>
        <div className="field"><label htmlFor="lead-contact">Контакт</label><input id="lead-contact" name="contact" required placeholder="VK или e-mail" /></div>
        <div className="field field-full"><label htmlFor="lead-company">Компания или событие</label><input id="lead-company" name="company" placeholder="Например: форум для предпринимателей" /></div>
        <div className="field field-full"><label htmlFor="lead-topic">Интересующая тема</label><select id="lead-topic" name="topic" value={topic} onChange={(event) => setTopic(event.currentTarget.value)}><option>ИИ для роста бизнеса</option><option>Сервис-дизайн и клиентский опыт</option><option>Партнёрство как основа взаимодействия</option><option>Госзакупки как инструмент развития бизнеса</option><option>Нужна консультация по выбору темы</option></select></div>
        <div className="field field-full"><label htmlFor="lead-details">Что хотите получить</label><textarea id="lead-details" name="details" placeholder="Аудитория, дата, город, формат и задача мероприятия" /></div>
      </div>
      <button className="button form-submit" type="submit">Скопировать заявку и написать в VK <span>↗</span></button>
      <p className="form-status" aria-live="polite">{status}</p>
      <p className="form-consent">Отправляя заявку, вы передаёте контактные данные только для обсуждения выступления.</p>
    </form>
  );
}
