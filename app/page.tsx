/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Максим Недельский — бизнес-тренер и спикер",
  description:
    "Практические выступления и корпоративные семинары об ИИ, сервис-дизайне, партнёрстве и развитии бизнеса.",
};

const programs = [
  {
    number: "01",
    tag: "ИИ и цифровые решения",
    title: "ИИ для экспертов",
    lead: "Как превратить нейросети в помощника для бизнеса, контента, аналитики и новых продуктов.",
    points: [
      "Промпты и работа с контекстом",
      "Сервис-дизайн и тренд-вотчинг",
      "Презентации, MVP и вайб-кодинг",
    ],
    tone: "coral",
  },
  {
    number: "02",
    tag: "Клиентский опыт",
    title: "Сервис-дизайн и клиентский опыт",
    lead: "Как находить точки роста в пути клиента и создавать ценность, эмоции и инновации.",
    points: [
      "Карта клиентского пути",
      "Эмоция = реальность − ожидание",
      "Модель сервиса для команды",
    ],
    tone: "lime",
  },
  {
    number: "03",
    tag: "Команды и сообщества",
    title: "Партнёрство как основа взаимодействия",
    lead: "Как превращать общую идею в устойчивый проект, доверие и понятные договорённости.",
    points: [
      "Честность, договорённости, гибкость",
      "Исполнитель, эксперт и партнёр",
      "Конфликтология и дорожная карта",
    ],
    tone: "blue",
  },
  {
    number: "04",
    tag: "Предпринимательство",
    title: "Госзакупки как инструмент развития бизнеса",
    lead: "Как увидеть в закупках не разовый тендер, а системный канал развития компании.",
    points: [
      "Логика 44-ФЗ и 223-ФЗ",
      "Бюджетный и закупочный циклы",
      "Стратегия работы с заказчиком",
    ],
    tone: "violet",
  },
];

const partners = [
  { name: "Сбер", logo: "/logos/sber.png", href: "https://sberbank.promo.page/", tone: "sber" },
  { name: "Деловая среда", logo: "/logos/delovaya-sreda.svg", href: "https://dasreda.ru/", tone: "dasreda" },
  { name: "ПСБ", logo: "/logos/psb.png", href: "https://www.psbank.ru/bank/style", tone: "psb" },
  { name: "Газпром нефть", logo: "/logos/gazprom-neft.svg", href: "https://www.gazprom-neft.ru/", tone: "gazprom" },
  { name: "Корпорация развития Дальнего Востока и Арктики", logo: "/logos/krdv.svg", href: "https://erdc.ru/", tone: "krdv" },
  { name: "Мой бизнес", logo: "/logos/moy-biznes.svg", href: "https://moibiz93.ru/", tone: "moybiznes" },
];

export default function Home() {
  return (
    <main>
      <a className="skip-link" href="#content">Перейти к содержанию</a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Максим Недельский — на главную">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span>Максим<br />Недельский</span>
        </a>
        <nav aria-label="Основная навигация">
          <a href="#programs">Программы</a>
          <a href="#about">О спикере</a>
          <a href="#cases">Формат работы</a>
        </nav>
        <a className="button button-dark header-cta" href="#contact">Обсудить выступление <span>↗</span></a>
      </header>

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
              <img src="/images/speaker/speaker-stage-wide.jpg" alt="Максим Недельский выступает на сцене с микрофоном" width="1440" height="960" />
            </figure>
            <figure className="hero-side-photo">
              <img src="/images/speaker/speaker-flags.jpg" alt="Максим Недельский ведёт выступление" width="720" height="1080" />
            </figure>
            <p className="hero-caption">выступления,<br />которые запускают изменения</p>
            <span className="hero-orbit orbit-one" aria-hidden="true" />
            <span className="hero-orbit orbit-two" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-labelledby="trust-title">
        <div className="trust-heading">
          <p className="eyebrow eyebrow-dark" id="trust-title">Партнёры и площадки</p>
          <h2>Мне доверяют<br />сильные команды</h2>
          <p>Опыт работы с бизнесом, институтами развития и профессиональными сообществами.</p>
        </div>
        <div className="partner-list" aria-label="Партнёры">
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
                <span className="program-duration">от 2 часов</span>
              </div>
              <p className="program-tag">{program.tag}</p>
              <h3>{program.title}</h3>
              <p className="program-lead">{program.lead}</p>
              <ul>
                {program.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <a href="#contact" className="program-link">Запросить программу <span>↗</span></a>
            </article>
          ))}
        </div>
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
          <img src="/images/speaker/speaker-talk.jpg" alt="Максим Недельский во время делового выступления" width="720" height="1080" loading="lazy" />
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
          <p className="contact-note">Для e-mail-заявок достаточно будет добавить адрес получателя — форма уже подготовлена.</p>
        </div>
        <ContactForm />
      </section>

      <footer>
        <a className="brand brand-footer" href="#top"><span className="brand-mark">N</span><span>Максим<br />Недельский</span></a>
        <p>Бизнес-тренер · Предприниматель · Спикер</p>
        <a href="https://vk.ru/ndlsky" target="_blank" rel="noreferrer">ВКонтакте ↗</a>
      </footer>
    </main>
  );
}
