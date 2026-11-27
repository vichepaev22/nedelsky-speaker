"use client";

import { useState, useSyncExternalStore } from "react";
import { evidence, evidenceGroups, roleLabels, type Evidence, type Topic } from "./portfolio";

const filters: { value: "all" | Topic; label: string }[] = [
  { value: "all", label: "Все темы" }, { value: "ai", label: "ИИ" },
  { value: "business", label: "Бизнес и сервис" }, { value: "procurement", label: "Госзакупки" },
  { value: "sport", label: "Спорт" }, { value: "swimming", label: "Детское плавание" },
];
const subscribe = () => () => {};
export function SourceLink({ id, children }: { id: string; children: React.ReactNode }) {
  const source = evidence.find(item => item.id === id);
  if (!source) throw new Error(`Unknown public source: ${id}`);
  return <a href={source.url} className="profile-source-link">{children}</a>;
}
function EvidenceCard({ sources }: { sources: Evidence[] }) {
  const first = sources[0];
  const date = first.publishedAt
    ? new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(first.publishedAt))
    : first.year ? `${first.year} год` : "Дата не подтверждена";
  return <article className="evidence-card">
    <div className="evidence-meta"><span>{roleLabels[first.type]}</span><span>{date}</span></div>
    <h3>{first.title}</h3>
    <p className="evidence-role">{first.role}</p>
    <p>{first.summary}</p>
    {sources.length > 1 && <p className="evidence-group-note">Несколько публикаций об одном событии — это одна история, а не отдельные достижения.</p>}
    <ul className="evidence-sources" aria-label={`Источники: ${first.title}`}>
      {sources.map(source => <li key={source.id} data-source-id={source.id}>
        <a href={source.url}>{source.publisher}{source.id === "S10" ? " · English" : source.id === "S27" ? " · отзыв участника" : ""}<span aria-hidden="true"> ↗</span></a>
        {sources.length > 1 && <span>{source.role}</span>}
      </li>)}
    </ul>
  </article>;
}
export function EvidenceLibrary() {
  const [topic, setTopic] = useState<"all" | Topic>("all");
  const enhanced = useSyncExternalStore(subscribe, () => true, () => false);
  const groups = evidenceGroups();
  const sections = [
    { id: "materials", title: "Авторские материалы", intro: "Материалы с подтверждённой подписью автора. Публикация о Максиме не становится его авторской статьёй.", types: ["author_work"] },
    { id: "speaking", title: "Выступления и программы", intro: "Отчёты о встречах и анонсы организаторов. Роль и статус события указаны отдельно.", types: ["speaking"] },
    { id: "media", title: "В СМИ и профессиональном сообществе", intro: "Комментарии, интервью и публикации о проектах. Дубли одного события объединены.", types: ["expert_comment", "credential", "media", "project", "press_release"] },
  ];
  const visibleGroups = groups.filter(group => topic === "all" || group.some(item => item.topics.includes(topic)));
  return <div className="profile-library">
    {enhanced && <div className="profile-filter" role="group" aria-label="Фильтр публикаций по теме">
      {filters.map(filter => <button type="button" key={filter.value} aria-pressed={topic === filter.value} onClick={() => setTopic(filter.value)}>{filter.label}</button>)}
    </div>}
    <p className="profile-filter-status" role="status">Показано историй: {visibleGroups.length}. Источники проверены 27 ноября 2026 года.</p>
    {sections.map(section => {
      const items = visibleGroups.filter(group => section.types.includes(group[0].type));
      return <section className="profile-section" id={section.id} key={section.id} aria-labelledby={`${section.id}-heading`}>
        <header className="profile-section-heading"><h2 id={`${section.id}-heading`}>{section.title}</h2><p>{section.intro}</p></header>
        {items.length ? <div className="profile-evidence-grid">{items.map(group => <EvidenceCard sources={group} key={group[0].eventGroupId} />)}</div>
          : <p className="profile-empty">В этой теме пока нет подтверждённых материалов в разделе. <button type="button" onClick={() => setTopic("all")}>Показать все темы</button></p>}
      </section>;
    })}
  </div>;
}
