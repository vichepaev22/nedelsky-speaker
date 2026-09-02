/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { programs } from "./programs-data";
import { SiteHeader } from "./SiteHeader";
import { sitePath } from "./site-paths";

export const metadata: Metadata = {
  title: "Максим Недельский — бизнес-тренер и спикер",
  description:
    "Практические выступления и корпоративные семинары об ИИ, сервис-дизайне, партнёрстве и развитии бизнеса.",
};

const partners = [
  { name: "Сбер", logo: sitePath("/logos/sber.png"), href: "https://sberbank.promo.page/", tone: "sber" },
  { name: "Деловая среда", logo: sitePath("/logos/delovaya-sreda.svg"), href: "https://dasreda.ru/", tone: "dasreda" },
  { name: "ПСБ", logo: sitePath("/logos/psb.png"), href: "https://www.psbank.ru/bank/style", tone: "psb" },
  { name: "Газпром нефть", logo: sitePath("/logos/gazprom-neft.svg"), href: "https://www.gazprom-neft.ru/", tone: "gazprom" },
  { name: "Корпорация развития Дальнего Востока и Арктики", logo: sitePath("/logos/krdv.svg"), href: "https://erdc.ru/", tone: "krdv" },
  { name: "Фонд «Наше Будущее»", logo: sitePath("/logos/nash-buduschee.jfif"), href: "https://nb-fund.ru/", tone: "nashbuduschee" },
  { name: "Росмолодёжь.Гранты", logo: sitePath("/logos/rosmolodezh-granty.jfif"), href: "https://fadm.gov.ru/directions/grant/", tone: "rosmolodezh" },
  { name: "Мой бизнес", logo: sitePath("/logos/moy-biznes.jpg"), href: "https://moibiz93.ru/", tone: "moybiznes" },
];

export default function Home() {
  return (
    <main>
      <a className="skip-link" href="#content">Перейти к содержанию</a>

      <SiteHeader
        brandHref="#top"
        contactHref="#contact"
        navigation={[
          { href: "#programs", label: "Программы" },
          { href: "#about", label: "О спикере" },
          { href: "#organizers", label: "Организаторам" },
        ]}
      />

      <section className="hero" id="top">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Бизнес-тренер · Предприниматель · Спикер</p>
            <h1>Знания, которые <em>становятся</em> действиями</h1>
            <p className="hero-lead">
              Помогаю предпринимателям и командам внедрять ИИ, находить точки роста
              в сервисе и превращать идеи в работающие проекты.
            </p>
            <div className="hero-actions">
              <a className="button button-coral" href="#contact">Пригласить спикера <span>↘</span></a>
              <a className="text-link" href="#programs">Смотреть программы <span>↓</span></a>
            </div>
            <dl className="hero-facts" aria-label="Ключевые факты">
              <div><dt>8+ лет</dt><dd>в бизнесе и общественных проектах</dd></div>
              <div><dt>4 темы</dt><dd>для команд, экспертов и предпринимателей</dd></div>
              <div><dt>Практика</dt><dd>участники применяют инструменты в ходе семинара</dd></div>
            </dl>
          </div>

          <div className="hero-visual" aria-label="Максим Недельский выступает перед аудиторией">
            <div className="hero-stamp">MAXIM<br />NEDELSKY<span>●</span></div>
            <figure className="hero-main-photo">
              <img src={sitePath("/images/speaker/maxim-navy.png")} alt="Максим Недельский выступает с микрофоном" width="1023" height="1537" />
            </figure>
            <figure className="hero-side-photo">
              <img src={sitePath("/images/speaker/maxim-coral.png")} alt="Максим Недельский ведёт выступление" width="1023" height="1537" />
            </figure>
            <p className="hero-caption">выступления,<br />которые запускают изменения</p>
            <span className="hero-orbit orbit-one" aria-hidden="true" />
            <span className="hero-orbit orbit-two" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="programs-section" id="content">
        <div className="section-intro" id="programs">
          <p className="eyebrow eyebrow-dark">Программы</p>
          <h2>Не «послушать».<br /><em>Разобраться и сделать.</em></h2>
          <p className="section-lead">
            Каждую тему можно адаптировать под вашу аудиторию, отрасль и задачу:
            от открытой лекции до практикума для команды.
          </p>
        </div>

        <div className="program-grid">
          {programs.map((program) => (
            <article className={`program-card tone-${program.tone}`} key={program.number}>
              <div className="program-card-top">
                <span className="program-number">{program.number}</span>
                <span className="program-duration">3 формата</span>
              </div>
              <p className="program-tag">{program.tag}</p>
              <h3>{program.title}</h3>
              <p className="program-lead">{program.lead}</p>
              <div className="program-format-preview" aria-label="Доступные форматы">
                {program.formats.map((format) => (
                  <span key={format.duration}><b>{format.duration}</b>{format.type}</span>
                ))}
              </div>
              <ul>
                {program.modules.slice(0, 3).map((module) => <li key={module.number}>{module.title}</li>)}
              </ul>
              <div className="program-card-actions">
                <a href={sitePath(`/programs/${program.slug}/`)} className="program-link">Подробнее <span>→</span></a>
                <a href={sitePath(`/?program=${program.slug}#contact`)} className="program-request">Подобрать формат <span>↗</span></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="trust-strip" id="partners" aria-labelledby="trust-title">
        <div className="trust-heading">
          <p className="eyebrow eyebrow-dark" id="trust-title">Партнёры и площадки</p>
          <h2>Опыт работы<br />с сильными командами</h2>
          <p>Бизнес, институты развития и профессиональные сообщества — площадки, с которыми связан опыт Максима.</p>
        </div>
        <div className="partner-list" aria-label="Партнёры и площадки">
          {partners.map((partner) => (
            <a
              className={`partner-logo partner-${partner.tone}`}
              href={partner.href}
              target="_blank"
              rel="noreferrer"
              key={partner.name}
              aria-label={`Официальный сайт: ${partner.name}`}
            >
              <img src={partner.logo} alt={partner.name} />
            </a>
          ))}
        </div>
        <p className="logo-note">Логотипы размещены в исходном виде и принадлежат соответствующим правообладателям.</p>
      </section>

      <section className="method-section" id="cases">
        <div className="method-sticky">
          <p className="eyebrow">Подход</p>
          <h2>Минимум<br />теории.<br /><em>Максимум<br />применения.</em></h2>
          <p>Моя задача — не впечатлить списком инструментов, а дать участникам способ работать с ними самостоятельно.</p>
        </div>
        <div className="method-steps">
          <article>
            <span>01</span>
            <h3>Начинаем с живой задачи</h3>
            <p>Берём контекст аудитории: процессы, клиентов, команду или идею, которую давно хочется сдвинуть с места.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Собираем понятную логику</h3>
            <p>Сложные модели, ИИ-инструменты и принципы сервиса переводим на человеческий язык и в последовательность действий.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Пробуем прямо в зале</h3>
            <p>Участники создают первые промпты, находят точки клиентского пути, формируют гипотезы и примеряют решения к своей работе.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Уходим с результатом</h3>
            <p>После выступления остаётся не только вдохновение, но и конкретный следующий шаг, который можно сделать уже завтра.</p>
          </article>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-photo">
          <img src={sitePath("/images/speaker/maxim-coral.png")} alt="Максим Недельский во время делового выступления" width="1023" height="1537" loading="lazy" />
          <p>Максим<br />Недельский</p>
        </div>
        <div className="about-copy">
          <p className="eyebrow eyebrow-dark">О спикере</p>
          <h2>Эксперт, который <em>сам строит</em> то, о чём говорит</h2>
          <div className="about-text">
            <p>
              Предприниматель, эксперт и практик в области искусственного интеллекта,
              автоматизации и современных цифровых инструментов в бизнесе.
            </p>
            <p>
              Более восьми лет Максим развивает собственные предпринимательские и общественные проекты:
              от бизнеса в сфере детского спорта до региональных спортивных сообществ и мероприятий.
            </p>
            <p>
              Сегодня он внедряет ИИ в реальные процессы: работу с документами и данными,
              маркетинг, создание контента, аналитику, автоматизацию и разработку собственных AI-решений.
            </p>
          </div>
          <div className="credentials">
            <div><strong>Федеральный эксперт</strong><span>Росмолодёжь.Гранты</span></div>
            <div><strong>Учредитель</strong><span>Федерации триатлона Ямала</span></div>
          </div>
        </div>
      </section>

      <section className="audience-section">
        <div className="audience-intro">
          <p className="eyebrow eyebrow-dark">Кому подойдёт</p>
          <h2>Когда нужно<br /><em>переходить от слов</em><br />к изменениям</h2>
        </div>
        <div className="audience-list">
          <article><span>01</span><h3>Предпринимателям</h3><p>Которые ищут новые инструменты роста, не хотят отставать от технологий и ценят практические решения.</p></article>
          <article><span>02</span><h3>Командам и руководителям</h3><p>Которым важно улучшить клиентский опыт, процессы взаимодействия и скорость работы с задачами.</p></article>
          <article><span>03</span><h3>Экспертам и спикерам</h3><p>Которые хотят усилить свою экспертизу с помощью ИИ, быстро упаковывать знания и создавать новые продукты.</p></article>
          <article><span>04</span><h3>Сообществам и институтам развития</h3><p>Которым нужен современный, понятный и вовлекающий формат для своей аудитории.</p></article>
        </div>
      </section>

      <section className="organizer-section" id="organizers" aria-labelledby="organizer-title">
        <div className="organizer-intro">
          <p className="eyebrow eyebrow-dark">Организаторам и HR-командам</p>
          <h2 id="organizer-title">Быстро собрать<br /><em>подходящий формат</em></h2>
          <p>Чтобы подготовить предложение, достаточно пяти ориентиров: задача, аудитория, дата, город и желаемая глубина работы.</p>
          <a className="button button-dark" href="#contact">Подобрать программу <span>↘</span></a>
        </div>
        <div className="organizer-grid">
          <article><span>01</span><strong>4 темы</strong><p>ИИ, клиентский опыт, партнёрство и госзакупки.</p></article>
          <article><span>02</span><strong>3 формата</strong><p>Семинар 2 часа, тренинг 4–6 часов или практикум 8 часов.</p></article>
          <article><span>03</span><strong>Под задачу</strong><p>Программа адаптируется под отрасль, уровень участников и контекст события.</p></article>
          <article><span>04</span><strong>Практический результат</strong><p>Участники работают со своими кейсами и фиксируют следующий применимый шаг.</p></article>
        </div>
      </section>

      <section className="faq-section" aria-labelledby="faq-title">
        <div>
          <p className="eyebrow eyebrow-dark">Ответы на частые вопросы</p>
          <h2 id="faq-title">Как проходит<br /><em>работа со спикером</em></h2>
          <p>Программы можно адаптировать под задачу бизнеса, аудиторию и формат события — от открытого семинара до командного практикума.</p>
        </div>
        <div className="faq-list">
          <details open>
            <summary>Какие темы можно пригласить?</summary>
            <p>ИИ для роста бизнеса, сервис-дизайн и клиентский опыт, партнёрство, а также госзакупки как инструмент развития бизнеса. Для каждой темы на сайте есть отдельная подробная программа.</p>
          </details>
          <details>
            <summary>Как выбрать длительность?</summary>
            <p>Двухчасовой семинар помогает быстро разобраться в теме, тренинг на 4–6 часов даёт время на разбор задач участников, а восьмичасовой семинар-практикум позволяет собрать решения и план дальнейших действий.</p>
          </details>
          <details>
            <summary>Что получают участники?</summary>
            <p>Не только обзор инструментов: участники работают с собственными кейсами, находят точки роста и фиксируют следующий применимый шаг для бизнеса, команды или проекта.</p>
          </details>
          <details>
            <summary>Как обсудить выступление?</summary>
            <p>Напишите Максиму во ВКонтакте и укажите задачу, аудиторию, город, дату и желаемый формат. На основе этого можно подобрать тему, длительность и механику работы.</p>
          </details>
        </div>
      </section>

      <section className="quote-section">
        <p className="quote-mark" aria-hidden="true">“</p>
        <blockquote>Нейросети — не цель. Цель — освободить время, увидеть новые возможности и начать делать то, что вчера казалось сложным.</blockquote>
        <cite>Максим Недельский</cite>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-intro">
          <p className="eyebrow">Пригласить спикера</p>
          <h2>Давайте обсудим вашу <em>задачу</em></h2>
          <p>
            Расскажите немного о событии — я подготовлю подходящий формат,
            тему и логику выступления для вашей аудитории.
          </p>
          <a className="vk-card" href="https://vk.ru/ndlsky" target="_blank" rel="noreferrer">
            <span className="vk-icon">vk</span>
            <span><small>Написать напрямую</small><strong>vk.ru/ndlsky</strong></span>
            <b>↗</b>
          </a>
          <p className="contact-note">ВКонтакте — самый быстрый способ обсудить задачу, аудиторию и формат события.</p>
        </div>
        <ContactForm />
      </section>

      <footer>
        <a className="brand brand-footer" href="#top"><span className="brand-mark">N</span><span>Максим<br />Недельский</span></a>
        <p>Бизнес-тренер · Предприниматель · Спикер<br /><time dateTime="2026-08-28">Материалы обновлены 28 августа 2026</time></p>
        <a href="https://vk.ru/ndlsky" target="_blank" rel="noreferrer">ВКонтакте ↗</a>
      </footer>
    </main>
  );
}
