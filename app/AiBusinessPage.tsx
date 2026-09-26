/* eslint-disable @next/next/no-img-element */
import { AiContactLink, AiInquiryForm, AiProductLink } from "./AiInquiryForm";
import { AiPromoNotice, AiPromoPrice } from "./AiPromoPrice";
import { aiProducts, aiVkContact } from "./ai-products-data";
import { SiteHeader } from "./SiteHeader";
import { sitePath } from "./site-paths";

const situations = [
  ["01", "Непонятно, с чего начать", "Инструментов становится больше, а ясного первого шага всё ещё нет."],
  ["02", "Ответы получаются нестабильными", "Одни и те же запросы дают разное качество, а проверка занимает время."],
  ["03", "Много повторяющейся работы", "Документы, тексты, анализ и подготовка материалов забирают внимание команды."],
  ["04", "Команда работает разрозненно", "У каждого свои инструменты и способы — общего стандарта применения ИИ нет."],
  ["05", "Неясны приоритеты", "Хочется улучшить процессы, но непонятно, за какой из них браться первым."],
  ["06", "Есть идея помощника", "Нужен управляемый сценарий, прототип и понимание границ — без обещаний полной автономности."],
];

const faqs = [
  ["Нужен ли опыт работы с нейросетями?", "Нет. В «ИИ-старте» можно начинать с базового уровня. Для более глубоких форматов текущий опыт учитывается в подготовительной анкете."],
  ["Можно участвовать командой?", "«ИИ-старт» рассчитан на одного участника. В «ИИ-практике» и «ИИ-трансформации» может участвовать одна команда до трёх человек. Больший состав согласовывается отдельно."],
  ["Что означает прототип ИИ-агента?", "Это учебная или прикладная модель помощника с ролью, инструкциями, источниками и правилами контроля. Прототип не равен промышленной системе и не работает без ответственности человека."],
  ["Потребуются ли платные подписки?", "Это зависит от выбранной задачи и инструмента. Необходимые подписки, API и дополнительные сервисы обсуждаются до начала и не включаются автоматически."],
  ["Как начать работу?", "Напишите Максиму во ВКонтакте о своей задаче. Вместе выберем подходящий формат, согласуем объём, сроки, условия и порядок оплаты до начала работы."],
  ["Гарантирует ли программа рост выручки?", "Нет. Работа даёт знания, материалы, прототипы и план действий. Практический эффект зависит от исходной ситуации, качества внедрения и дальнейшего использования решений."],
];

export function AiBusinessPage() {
  return (
    <main className="ai-offer-page">
      <a className="skip-link" href="#ai-content">Перейти к содержанию</a>

      <SiteHeader
        brandHref={sitePath("/#top")}
        contactHref={aiVkContact}
        contactLabel="Обсудить задачу"
        contactTarget="_blank"
        navigation={[
          { href: "#ai-fit", label: "Подобрать формат" },
          { href: "#ai-compare", label: "Сравнить" },
          { href: "#ai-details", label: "Программа" },
          { href: "#ai-faq", label: "FAQ" },
        ]}
      />

      <section className="ai-hero" id="top">
        <div className="ai-hero-copy">
          <a className="back-link" href={sitePath("/#programs")}>← Сайт спикера</a>
          <p className="eyebrow eyebrow-dark">Для предпринимателей и команд до 3 человек</p>
          <h1>ИИ для бизнеса — <em>от задачи</em> до рабочего решения</h1>
          <p className="ai-hero-lead">Помогаю предпринимателям найти, где искусственный интеллект действительно экономит время, снижает ручную работу и усиливает процессы — от обучения до прототипирования и дорожной карты внедрения.</p>
          <ol className="ai-hero-path" aria-label="Путь работы с ИИ">
            <li>Обучение</li><li>Разбор процессов</li><li>Прототип</li><li>Дорожная карта</li>
          </ol>
          <div className="hero-actions">
            <a className="button button-coral" href="#ai-fit">Подобрать формат <span aria-hidden="true">↓</span></a>
            <AiContactLink className="text-link">Обсудить задачу <span aria-hidden="true">↗</span></AiContactLink>
          </div>
          <AiPromoNotice />
        </div>

        <div className="ai-hero-visual" aria-label="Максим Недельский проводит практическое занятие по искусственному интеллекту">
          <figure><img src={sitePath("/images/speaker/maxim-navy.png")} alt="Максим Недельский выступает с микрофоном" width="1023" height="1537" /></figure>
          <div className="ai-signal-card ai-signal-one"><small>Задача</small><strong>→ контекст</strong></div>
          <div className="ai-signal-card ai-signal-two"><small>Контекст</small><strong>→ решение</strong></div>
          <div className="ai-signal-card ai-signal-three"><small>Решение</small><strong>→ процесс</strong></div>
          <span className="ai-hero-ring" aria-hidden="true" />
        </div>

        <dl className="ai-hero-facts">
          <div><dt>3</dt><dd>формата глубины</dd></div>
          <div><dt>1–3</dt><dd>участника в работе</dd></div>
          <div><dt>Практика</dt><dd>на ваших задачах</dd></div>
        </dl>
      </section>

      <section className="ai-fit" id="ai-fit" aria-labelledby="ai-fit-title">
        <div className="ai-section-heading">
          <p className="eyebrow eyebrow-dark">Где вы сейчас?</p>
          <h2 id="ai-fit-title">Какой формат<br /><em>вам подходит?</em></h2>
          <p>Выберите близкую ситуацию — перейдёте к результатам, стоимости и программе нужного формата.</p>
        </div>
        <div className="ai-fit-grid">
          {aiProducts.map((product) => (
            <article key={product.slug}>
              <span className="ai-fit-number">{product.number}</span>
              <h3>{product.situation.title}</h3>
              <p>{product.situation.description}</p>
              <span className="ai-fit-product">{product.shortTitle}</span>
              <AiProductLink className="button ai-fit-link" productSlug={product.slug} targetId={`product-${product.slug}`}>{product.situation.cta} <span aria-hidden="true">↓</span></AiProductLink>
            </article>
          ))}
        </div>
      </section>

      <section className="ai-situations" id="ai-content" aria-labelledby="ai-situations-title">
        <div className="ai-section-heading">
          <p className="eyebrow eyebrow-dark">Когда это может быть полезно</p>
          <h2 id="ai-situations-title">ИИ уже рядом.<br /><em>Системы пока нет.</em></h2>
          <p>Это не диагноз бизнеса, а ситуации, с которых чаще всего начинается предметная работа.</p>
        </div>
        <div className="ai-situation-grid">
          {situations.map(([number, title, description]) => (
            <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>
          ))}
        </div>
      </section>

      <section className="ai-products" id="ai-products" aria-labelledby="ai-products-title">
        <div className="ai-section-heading is-light">
          <p className="eyebrow">Три формата работы</p>
          <h2 id="ai-products-title">Выберите не объём информации, а <em>глубину изменений.</em></h2>
          <p>От первого уверенного применения до совместной работы с процессами, сервисом и командой.</p>
        </div>
        <div className="ai-product-grid">
          {aiProducts.map((product, index) => (
            <article className={`ai-product-card ${index === 1 ? "is-accent" : ""}`} id={`product-${product.slug}`} tabIndex={-1} aria-labelledby={`title-${product.slug}`} key={product.slug}>
              <div className="ai-product-top"><span>{product.number}</span><small>{product.eyebrow}</small></div>
              <h3 id={`title-${product.slug}`}>{product.title}</h3>
              <p className="ai-product-description">{product.positioning}</p>
              <AiPromoPrice basePrice={product.basePrice} promoPrice={product.promoPrice} />
              <div className="ai-product-outcomes">
                <h4>Что вы получите</h4>
                <ul>{product.outcomes.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <dl className="ai-product-facts">
                <div><dt>Кому</dt><dd>{product.audience}</dd></div>
                <div><dt>Цикл</dt><dd>{product.cycle}</dd></div>
              </dl>
              <ul className="ai-product-includes" aria-label="Как проходит работа">{product.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
              <div className="ai-card-actions">
                <AiContactLink className="button button-dark ai-product-cta" productSlug={product.slug}>{product.cta} <span aria-hidden="true">↗</span></AiContactLink>
                <AiProductLink className="ai-detail-link" productSlug={product.slug} targetId={`details-${product.slug}`}>Посмотреть программу <span aria-hidden="true">↓</span></AiProductLink>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ai-compare" id="ai-compare" aria-labelledby="ai-compare-title">
        <div className="ai-section-heading">
          <p className="eyebrow eyebrow-dark">Сравнить форматы</p>
          <h2 id="ai-compare-title">Какой уровень<br /><em>подходит сейчас?</em></h2>
          <p>Выбор зависит не от количества инструментов, а от задачи, участников и нужной глубины.</p>
        </div>
        <div className="ai-comparison" role="table" aria-label="Сравнение трёх форматов работы">
          <div className="ai-comparison-head" role="row"><span role="columnheader">Формат</span><span role="columnheader">Для кого</span><span role="columnheader">Продолжительность</span><span role="columnheader">Главный результат</span></div>
          {aiProducts.map((product) => (
            <div className="ai-comparison-row" role="row" key={product.slug}>
              <strong role="cell">{product.shortTitle}</strong>
              <span role="cell" data-label="Для кого">{product.audience}</span>
              <span role="cell" data-label="Продолжительность">{product.cycle}</span>
              <span role="cell" data-label="Главный результат">{product.highlights.at(-1)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ai-details" id="ai-details" aria-labelledby="ai-details-title">
        <div className="ai-section-heading is-light">
          <p className="eyebrow">Подробная программа</p>
          <h2 id="ai-details-title">Что происходит<br /><em>на каждом этапе.</em></h2>
          <p>Каждый пункт связывает действие, практический результат и понятный объём времени.</p>
        </div>
        <div className="ai-detail-list">
          {aiProducts.map((product, productIndex) => (
            <details id={`details-${product.slug}`} open={productIndex === 0} key={product.slug}>
              <summary><span>{product.number}</span><strong>{product.title}</strong><i aria-hidden="true">+</i></summary>
              <div className="ai-detail-body">
                <div className="ai-detail-intro"><div><p>{product.description}</p><p>{product.goal}</p></div><dl><div><dt>С экспертом</dt><dd>{product.expertTime}</dd></div><div><dt>Практика</dt><dd>{product.practiceTime}</dd></div></dl></div>
                <div className="ai-stage-table" role="table" aria-label={`Этапы продукта ${product.title}`}>
                  <div className="ai-stage-head" role="row"><span role="columnheader">Этап</span><span role="columnheader">Что делаем</span><span role="columnheader">Результат</span><span role="columnheader">Время</span></div>
                  {product.stages.map((stage, stageIndex) => (
                    <div className="ai-stage-row" role="row" key={stage.title}>
                      <h3 role="cell"><span>{String(stageIndex + 1).padStart(2, "0")}</span>{stage.title}</h3>
                      <p role="cell" data-label="Что делаем">{stage.action}</p>
                      <p role="cell" data-label="Результат">{stage.result}</p>
                      <p role="cell" data-label="Время">{stage.time}</p>
                    </div>
                  ))}
                </div>
                <p className="ai-boundary"><strong>Граница продукта</strong>{product.boundary}</p>
                <div className="ai-detail-actions">
                  <AiContactLink className="button button-coral" productSlug={product.slug}>{product.cta} <span aria-hidden="true">↗</span></AiContactLink>
                  <a className="text-link" href="#ai-fit">Подобрать формат <span aria-hidden="true">↑</span></a>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="ai-method" aria-labelledby="ai-method-title">
        <div className="ai-method-copy">
          <p className="eyebrow eyebrow-dark">Метод работы</p>
          <h2 id="ai-method-title">От общей идеи —<br /><em>к проверяемому шагу.</em></h2>
          <p>Нейросеть здесь не цель и не украшение. Она включается там, где помогает лучше решить конкретную задачу.</p>
        </div>
        <ol>
          <li><span>01</span><div><strong>Разбираем задачу</strong><p>Фиксируем исходную ситуацию, контекст и ограничения.</p></div></li>
          <li><span>02</span><div><strong>Выбираем приоритет</strong><p>Не пытаемся автоматизировать всё одновременно.</p></div></li>
          <li><span>03</span><div><strong>Проектируем решение</strong><p>Распределяем работу между человеком, ИИ и процессом.</p></div></li>
          <li><span>04</span><div><strong>Проверяем на практике</strong><p>Смотрим на качество результата, риски и повторяемость.</p></div></li>
          <li><span>05</span><div><strong>Фиксируем следующие шаги</strong><p>Собираем понятную дорожную карту без лишних обещаний.</p></div></li>
        </ol>
      </section>

      <section className="ai-scope" aria-labelledby="ai-scope-title">
        <div className="ai-section-heading">
          <p className="eyebrow eyebrow-dark">Границы большого проекта</p>
          <h2 id="ai-scope-title">Комплексно —<br /><em>не значит безлимитно.</em></h2>
          <p>Для «ИИ-трансформации» объём фиксируется до оплаты, чтобы ожидания и результат оставались управляемыми.</p>
        </div>
        <div className="ai-scope-grid">
          {aiProducts[2].boundaries?.map((item, index) => <article key={item.label}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.label}</strong><p>{item.value}</p></article>)}
        </div>
        <p className="ai-no-promises"><strong>Что не обещаем:</strong> гарантированный рост выручки, сокращение затрат без замеров, автономное управление бизнесом, неограниченную разработку и круглосуточную доступность.</p>
      </section>

      <section className="ai-expert" aria-labelledby="ai-expert-title">
        <figure><img src={sitePath("/images/speaker/maxim-flags-navy.png")} alt="Максим Недельский выступает на деловом мероприятии" width="1537" height="1023" loading="lazy" /></figure>
        <div>
          <p className="eyebrow">О специалисте</p>
          <h2 id="ai-expert-title">Максим Недельский</h2>
          <p>Предприниматель, федеральный спикер и методолог образовательных программ. Более восьми лет развивает предпринимательские и общественные проекты и внедряет ИИ в документы, данные, маркетинг, контент, аналитику и автоматизацию.</p>
          <ul><li>Федеральный эксперт Росмолодёжь.Гранты</li><li>Учредитель Федерации триатлона Ямала</li><li>Практика на задачах бизнеса, а не «нейросети ради нейросетей»</li></ul>
          <a className="text-link" href={sitePath("/#partners")}>Посмотреть партнёров и опыт площадок <span>→</span></a>
        </div>
      </section>

      <section className="ai-faq" id="ai-faq" aria-labelledby="ai-faq-title">
        <div className="ai-section-heading">
          <p className="eyebrow eyebrow-dark">Вопросы и ожидания</p>
          <h2 id="ai-faq-title">До начала работы<br /><em>всё должно быть ясно.</em></h2>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => <details open={index === 0} key={question}><summary>{question}</summary><p>{answer}</p></details>)}
        </div>
      </section>

      <section className="ai-contact" id="ai-contact" aria-labelledby="ai-contact-title">
        <div className="ai-contact-copy">
          <p className="eyebrow">Следующий шаг</p>
          <h2 id="ai-contact-title">Обсудим задачу.<br /><em>Определим следующий шаг.</em></h2>
          <p>Можно прийти с конкретным процессом или с вопросом, с чего начать. До начала работы согласуем формат, объём, сроки и стоимость.</p>
          <p className="ai-contact-person">Максим Недельский<br /><span>ВКонтакте · ndlsky</span></p>
        </div>
        <AiInquiryForm />
      </section>

      <footer>
        <a className="brand brand-footer" href={sitePath("/#top")}><span className="brand-mark">N</span><span>Максим<br />Недельский</span></a>
        <p>ИИ для бизнеса · обучение · прототипирование<br />Условия и объём фиксируются до начала работы</p>
        <AiContactLink>Обсудить задачу ↗</AiContactLink>
      </footer>
    </main>
  );
}
