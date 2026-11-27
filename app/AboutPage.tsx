/* eslint-disable @next/next/no-img-element */
import { SiteHeader } from "./SiteHeader";
import { PrivacyLinks } from "./PrivacyNotice";
import { EvidenceLibrary, SourceLink } from "./EvidenceLibrary";
import { sitePath } from "./site-paths";

export const aboutTitle = "Максим Недельский — обо мне, публикации и выступления";
export const aboutDescription = "Предприниматель и бизнес-тренер Максим Недельский: практическое применение ИИ, госзакупки, сервис-дизайн, авторские материалы, выступления и спортивные проекты с первоисточниками.";

export function AboutPage() {
  return <main className="profile-page">
    <a className="skip-link" href="#biography">Перейти к содержанию</a>
    <SiteHeader brandHref={sitePath("/")} contactHref={sitePath("/#contact")} contactLabel="Пригласить спикера" navigation={[
      { href: "#biography", label: "Обо мне" }, { href: "#materials", label: "Материалы" },
      { href: "#media", label: "В СМИ" }, { href: sitePath("/ai-for-business/"), label: "ИИ для бизнеса" },
    ]} />
    <div className="profile-shell">
      <nav className="profile-breadcrumbs" aria-label="Хлебные крошки"><a href={sitePath("/")}>Главная</a><span aria-hidden="true">/</span><span aria-current="page">Обо мне</span></nav>
      <section className="profile-hero">
        <div>
          <p className="eyebrow eyebrow-dark">Предприниматель · бизнес-тренер · спикер</p>
          <h1>Максим <em>Недельский</em></h1>
          <p className="profile-lead">Помогаю предпринимателям перейти от интереса к ИИ — к понятной задаче, прототипу и плану внедрения.</p>
          <p>Обучение, разбор процессов и совместное прототипирование. Без обещаний «автономного бизнеса»: результат проверяет и использует человек.</p>
          <div className="profile-actions"><a className="button button-dark" href={sitePath("/#contact")}>Пригласить спикера <span aria-hidden="true">↗</span></a><a className="text-link" href={sitePath("/ai-for-business/")}>Обсудить обучение →</a></div>
        </div>
        <figure className="profile-portrait"><img src={sitePath("/images/speaker/maxim-navy-optimized.jpg")} width="1023" height="1537" alt="Максим Недельский выступает с микрофоном" fetchPriority="high" /><figcaption>Максим Владимирович Недельский · Maxim Nedelsky</figcaption></figure>
      </section>
      <nav className="profile-jump" aria-label="На этой странице"><a href="#biography">Биография</a><a href="#materials">Авторские материалы</a><a href="#speaking">Выступления</a><a href="#media">СМИ</a><a href="#projects">Проекты</a><a href="#timeline">Хронология</a></nav>
      <section className="profile-section profile-bio" id="biography">
        <div><p className="eyebrow eyebrow-dark">Опыт и подход</p><h2>Практика, о которой <em>можно прочитать</em></h2></div>
        <div className="profile-prose">
          <p>Я — Максим Недельский, предприниматель и бизнес-тренер. Сейчас работаю с задачами применения ИИ: от обучения нейросетям до разбора процессов, прототипа помощника и дорожной карты. Объём работы и ограничения описаны в <a href={sitePath("/ai-for-business/")}>трёх действующих форматах</a>.</p>
          <p>Мой профессиональный опыт включает госзакупки: я подготовил <SourceLink id="S01">подписанный чек-лист для «Деловой среды»</SourceLink>, комментировал тему <SourceLink id="S04">государственно-частного партнёрства для РБК Пермь в 2021 году</SourceLink> и участвовал в <SourceLink id="S07">образовательной программе для НКО</SourceLink>.</p>
          <p>В <SourceLink id="S02">анонсе «Моего бизнеса» 2024 года</SourceLink> я представлен как AI-консультант, специалист по госзакупкам и федеральный эксперт Росмолодёжь.Гранты. Это подтверждение роли в тот период, а не заявление о текущем реестровом статусе. В мае 2025 года «Вектор» рассказал о <SourceLink id="S03">практическом семинаре по нейросетям для предпринимателей Губкинского</SourceLink>.</p>
          <p>Отдельная часть моей деятельности — спортивные инициативы на Ямале. СМИ писали о <SourceLink id="S11">работе в детском плавании</SourceLink>, <SourceLink id="S18">развитии триатлонного сообщества</SourceLink> и участии в организации <SourceLink id="S20">проекта «Ямал любит спорт»</SourceLink>. Эти публикации описывают конкретные периоды и проекты, а не перечень текущих услуг.</p>
        </div>
      </section>
      <section className="profile-specialties" aria-label="Направления работы">
        <h2>С чем ко мне приходят</h2>
        <div><a href={sitePath("/ai-for-business/")}>ИИ и процессы бизнеса ↗</a><a href={sitePath("/programs/service-design/")}>Сервис-дизайн и клиентский опыт ↗</a><a href={sitePath("/programs/partnership/")}>Партнёрство ↗</a><a href={sitePath("/programs/procurement/")}>Госзакупки ↗</a></div>
      </section>
      <EvidenceLibrary />
      <section className="profile-section" id="projects">
        <header className="profile-section-heading"><h2>Предпринимательские и общественные проекты</h2><p>Текущие предложения — отдельно от исторического опыта. Публикация о проекте не означает, что он сейчас доступен для заказа.</p></header>
        <div className="profile-project-grid">
          <article><span className="profile-tag">Текущие услуги</span><h3>ИИ для бизнеса</h3><p>Индивидуальное обучение, совместное прототипирование и работа над процессами. Состав, сроки и границы — на странице программ.</p><a href={sitePath("/ai-for-business/")}>Выбрать формат →</a></article>
          <article><span className="profile-tag">Опыт · 2021</span><h3>Детское образование</h3><p>В материалах интенсива по развитию бизнеса — участник из Губкинского, представлявший центр IQ007. Не роль организатора или спикера интенсива.</p><SourceLink id="S09">Материал организатора ↗</SourceLink></article>
          <article><span className="profile-tag">Публикация · 2025</span><h3>Детское плавание</h3><p>«Вести Ямал» рассказывали о занятиях в «Акулёнке» с моим комментарием. Актуальные адреса, филиалы и запись уточняются отдельно.</p><SourceLink id="S11">Репортаж «Вести Ямал» ↗</SourceLink></article>
          <article><span className="profile-tag">Инициативы · 2023–2025</span><h3>Триатлон на Ямале</h3><p>От предложения о развитии спорта до работы сообщества. СМИ называют меня основателем федерации; текущий юридический статус здесь не подтверждается.</p><SourceLink id="S18">Публикация «Ямал-Медиа» ↗</SourceLink></article>
          <article><span className="profile-tag">Событие · 2026</span><h3>«Ямал любит спорт»</h3><p>Один из организаторов спортивного проекта. В материале «Север-Пресса» описан конкретный командный пробег, а не постоянные показатели аудитории.</p><SourceLink id="S20">Как проходил проект ↗</SourceLink></article>
        </div>
      </section>
      <section className="profile-section" id="timeline">
        <header className="profile-section-heading"><h2>Опыт в хронологии</h2><p>Только датированные события из открытых источников.</p></header>
        <ol className="profile-timeline">
          <li><b>2020</b><div><h3>Обучение для НКО</h3><p>Вебинар о стратегиях работы некоммерческих организаций в госзакупках.</p><SourceLink id="S07">Программа обучения ↗</SourceLink></div></li>
          <li><b>2021</b><div><h3>Госзакупки и предпринимательство</h3><p>Комментарий РБК о государственно-частном партнёрстве; участие в интенсиве по развитию бизнеса.</p><SourceLink id="S04">РБК Пермь ↗</SourceLink>{" · "}<SourceLink id="S09">Материал организатора ↗</SourceLink></div></li>
          <li><b>2023</b><div><h3>Сервис-дизайн и спортивные инициативы</h3><p>Анонс вебинара о клиентском сервисе в Перми; предложение о развитии триатлона на Ямале.</p><SourceLink id="S28">Анонс «Моего бизнеса» ↗</SourceLink>{" · "}<SourceLink id="S13">«МК Ямал» ↗</SourceLink></div></li>
          <li><b>2024</b><div><h3>ИИ в образовательной программе</h3><p>Представлен как AI-консультант и эксперт по госзакупкам в анонсе «Моего бизнеса».</p><SourceLink id="S02">РИА Воронеж ↗</SourceLink></div></li>
          <li><b>2025</b><div><h3>Практический семинар по нейросетям</h3><p>Работа предпринимателей Губкинского над задачами бизнеса в командах.</p><SourceLink id="S03">Репортаж «Вектора» ↗</SourceLink></div></li>
          <li><b>2026</b><div><h3>«Ямал любит спорт»</h3><p>Участие в организации спортивного проекта.</p><SourceLink id="S20">«Север-Пресс» ↗</SourceLink></div></li>
        </ol>
      </section>
      <section className="profile-contact" id="about-contact"><p className="eyebrow">Следующий шаг</p><h2>Обсудим <em>вашу задачу?</em></h2><p>Напишите, для кого нужна программа и что хотите изменить в работе. Вместе определим подходящий формат.</p><div className="profile-actions"><a className="button" href="https://vk.ru/ndlsky">Написать Максиму в ВК ↗</a><a href={sitePath("/#contact")}>Короткая форма на сайте →</a></div></section>
      <footer className="profile-footer"><nav aria-label="Навигация в подвале"><a href={sitePath("/")}>Главная</a><a href={sitePath("/about/")}>Обо мне</a><a href={sitePath("/#programs")}>Все программы</a><a href={sitePath("/ai-for-business/")}>ИИ для бизнеса</a><a href="#materials">Публикации</a><a href="#about-contact">Связаться</a></nav><p>© Максим Недельский · Ссылки ведут на материалы правообладателей. Содержание источников не воспроизводится.</p><PrivacyLinks /></footer>
    </div>
  </main>;
}
