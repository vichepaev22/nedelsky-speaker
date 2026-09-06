/* eslint-disable @next/next/no-img-element */
import type { Program } from "./programs-data";
import { ProgramInteraction } from "./ProgramInteraction";
import { FormatExplorer } from "./FormatExplorer";
import { SiteHeader } from "./SiteHeader";
import { sitePath } from "./site-paths";

function ProgramTitle({ title }: { title: string }) {
  const longWord = "взаимодействия";
  const wordIndex = title.indexOf(longWord);
  if (wordIndex === -1) return title;

  return <>{title.slice(0, wordIndex)}взаимо<wbr />действия{title.slice(wordIndex + longWord.length)}</>;
}

function ThemeVisual({ type }: { type: Program["visual"] }) {
  if (type === "service") {
    return <div className="topic-visual visual-service" aria-label="Схема клиентского пути"><span>Первый контакт</span><i /><span>Опыт</span><i /><span>Возвращение</span></div>;
  }
  if (type === "partnership") {
    return <div className="topic-visual visual-partnership" aria-label="Схема партнёрского взаимодействия"><b>Цель</b><span>Доверие</span><span>Роли</span><span>Договорённости</span></div>;
  }
  if (type === "procurement") {
    return <div className="topic-visual visual-procurement" aria-label="Схема закупочного цикла"><span>Планирование</span><span>Закупка</span><span>Исполнение</span></div>;
  }
  return <div className="topic-visual visual-ai" aria-label="Схема внедрения ИИ"><span>Контекст</span><i>→</i><span>Решение</span><i>→</i><span>Процесс</span></div>;
}

export function ProgramPage({ program }: { program: Program }) {
  const contactUrl = sitePath(`/?program=${program.slug}#contact`);

  return (
    <main className={`program-detail detail-${program.tone}`}>
      <SiteHeader
        brandHref={sitePath("/#top")}
        contactHref={contactUrl}
        navigation={[
          { href: "#interactive", label: "В деталях" },
          { href: "#formats", label: "Форматы" },
          { href: "#content", label: "Программа" },
          { href: "#result", label: "Результат" },
        ]}
      />

      <section className="program-hero">
        <div className="program-hero-copy">
          <a className="back-link" href={sitePath("/#programs")}>← Все программы</a>
          <p className="eyebrow eyebrow-dark">{program.tag} · программа {program.number}</p>
          <h1><ProgramTitle title={program.title} /></h1>
          <p className="program-hero-lead">{program.lead}</p>
          <p className="program-hero-description">{program.description}</p>
          <div className="program-hero-actions">
            <a className="button button-coral" href={contactUrl}>Подобрать формат <span>↗</span></a>
            <a className="text-link" href="#formats">Выбрать формат <span>↓</span></a>
          </div>
        </div>
        <figure className={`program-hero-photo ${program.imageWide ? "is-wide" : ""}`}>
          <img src={sitePath(program.image)} alt={program.imageAlt} width={program.imageWide ? 1537 : 1023} height={program.imageWide ? 1023 : 1537} />
        </figure>
      </section>

      <section className="program-audience" aria-labelledby="audience-title">
        <p className="eyebrow eyebrow-dark" id="audience-title">Для кого</p>
        <div>{program.audiences.map((audience, index) => <p key={audience}><span>0{index + 1}</span>{audience}</p>)}</div>
      </section>

      <ProgramInteraction type={program.visual} />

      <section className="detail-formats" id="formats" aria-labelledby="formats-title">
        <div className="detail-section-heading">
          <p className="eyebrow eyebrow-dark">Длительность и глубина</p>
          <h2 id="formats-title">Одна тема —<br /><em>три формата.</em></h2>
        </div>
        <FormatExplorer formats={program.formats} />
        <div className="format-grid">
          {program.formats.map((format) => (
            <article className="format-card" key={format.label}>
              <p className="format-kind">{format.type}</p>
              <p className="format-duration">{format.duration}</p>
              <h3>{format.label}</h3>
              <p>{format.description}</p>
              <ul>{format.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
              <a className="format-link" href={contactUrl}>Выбрать этот формат <span>↗</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className="detail-content" id="content" aria-labelledby="content-title">
        <div className="detail-content-heading">
          <p className="eyebrow">Содержание</p>
          <h2 id="content-title">От понимания —<br /><em>к своей практике.</em></h2>
          <ThemeVisual type={program.visual} />
        </div>
        <div className="detail-modules">
          {program.modules.map((module) => (
            <article key={module.number}>
              <span>{module.number}</span>
              <div><h3>{module.title}</h3><p>{module.description}</p><strong>{module.result}</strong></div>
            </article>
          ))}
        </div>
      </section>

      <section className="detail-result" id="result">
        <p className="eyebrow eyebrow-dark">Что остаётся после</p>
        <div>
          <p className="result-mark">✦</p>
          <blockquote>{program.finalResult}</blockquote>
          {program.note && <p className="program-note">{program.note}</p>}
          <a className="button button-dark" href={contactUrl}>Обсудить свой формат <span>↗</span></a>
        </div>
      </section>

      <section className="detail-contact">
        <p className="eyebrow">Нужен формат под вашу аудиторию?</p>
        <h2>Адаптирую программу<br /><em>под задачу команды.</em></h2>
        <a className="button button-coral" href={contactUrl}>Подобрать формат <span>↗</span></a>
        <a className="detail-vk" href="https://vk.ru/ndlsky" target="_blank" rel="noreferrer">Или написать Максиму в VK ↗</a>
      </section>

      <footer>
        <a className="brand brand-footer" href={sitePath("/#top")}><span className="brand-mark">N</span><span>Максим<br />Недельский</span></a>
        <p>Бизнес-тренер · Предприниматель · Спикер</p>
        <a href="https://vk.ru/ndlsky" target="_blank" rel="noreferrer">ВКонтакте ↗</a>
      </footer>
    </main>
  );
}
