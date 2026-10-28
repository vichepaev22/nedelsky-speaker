/* eslint-disable @next/next/no-img-element */
import { sitePath } from "./site-paths";

const projects = [
  {
    id: "obraz", category: "Telegram · MAX · Mini App", name: "Образ", title: "Фотостудия в привычном чате",
    task: "Сделать обработку фотографий и примерку образов понятными без сложного редактора.",
    solution: "Бот и Mini App: загрузка фото, выбор сценария, подтверждение обработки, сравнение и скачивание.",
    result: "Единый путь от исходного фото до результата, с историей работ и повторной доставкой файла.",
    href: "https://t.me/obraz_photo_bot", cta: "Открыть бота в Telegram", external: true,
  },
  {
    id: "tempo", category: "Telegram · личный пилот", name: "ТЕМП", title: "Помощник спортсмена",
    task: "Собрать данные тренировок и материалы для спортсмена в одном понятном пространстве.",
    solution: "Личный бот с импортом FIT-файлов Garmin, историей и сводкой; кабинет с учебными карточками и созданием сторис.",
    result: "Рабочий личный пилот и публичный демо-кабинет. Автосинхронизация спортивных аккаунтов — отдельный этап.",
    href: "https://vichepaev22.github.io/tempo-athlete-miniapp/", cta: "Посмотреть демо", external: true,
  },
  {
    id: "bestservice", category: "Сервис · клиентский опыт", name: "BestService", title: "Отзывы становятся картой улучшений",
    task: "Помочь бизнесу увидеть повторяющиеся проблемы и ожидания клиентов в отзывах.",
    solution: "Сервис анализа отзывов: темы, боли, клиентский путь и рекомендации по улучшению сервиса.",
    result: "Отдельный продукт с интерфейсом отчёта, который связывает обратную связь с задачами бизнеса.",
    href: sitePath("/programs/service-design/"), cta: "Посмотреть подход", external: false,
  },
  {
    id: "websites", category: "Сайты · упаковка экспертизы", name: "Создание сайтов", title: "От предложения до работающего сайта",
    task: "Показать экспертизу и продукты так, чтобы посетитель понимал предложение и следующий шаг.",
    solution: "Структура, тексты, дизайн и разработка: главная страница, программы и отдельная страница продуктов.",
    result: "Этот сайт — пример: адаптивные страницы, выбор формата и понятный путь к обсуждению задачи.",
    href: sitePath("/ai-for-business/?product=ai-transformation#details-ai-transformation"), cta: "Обсудить свой сайт", external: false,
  },
];

const projectExtraLinks: Record<string, { href: string; label: string }[]> = {
  obraz: [{ href: "https://max.ru/id244318115322_1_bot", label: "Открыть бота в MAX" }],
  bestservice: [{ href: "https://vichepaev22.github.io/bestservice-demo/", label: "MVP продукта" }],
};

function ProjectVisual({ id }: { id: string }) {
  if (id === "tempo") {
    return (
      <div className="project-art project-art-tempo" aria-hidden="true">
        <div className="tempo-dashboard">
          <div className="tempo-heading"><strong>ТЕМП<span>·</span></strong><small>Личный кабинет</small></div>
          <div className="tempo-chart"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          <div className="tempo-tools"><span>FIT → тренировка</span><span>История</span><span>Сторис ↗</span></div>
        </div>
        <span className="project-art-note">Данные → понимание → следующий шаг</span>
      </div>
    );
  }
  if (id === "obraz") {
    return (
      <div className="project-art project-art-obraz" aria-hidden="true">
        <div className="project-phone">
          <div className="phone-heading">образ <i>·</i><span>Ваша фотостудия</span></div>
          <div className="phone-photo"><span>Ваше фото</span><b>+</b></div>
          <div className="phone-options"><span>Причёска</span><span>Стиль</span><span>Фон</span></div>
          <div className="phone-action">Создать образ ↗</div>
        </div>
        <span className="project-art-note">Фото → образ → результат</span>
      </div>
    );
  }
  if (id === "bestservice") {
    return (
      <div className="project-art project-art-bestservice" aria-hidden="true">
        <div className="review-note"><span>Голос клиента</span><p>Отзывы и ожидания</p><b>↘</b></div>
        <div className="review-report"><span>BestService</span><strong>Карта сервиса</strong><div><i /><i /><i /></div><p>Темы <b>→</b> путь клиента <b>→</b> решения</p></div>
        <span className="project-art-note">От обратной связи — к действию</span>
      </div>
    );
  }
  return (
    <div className="project-art project-art-websites">
      <div className="project-browser">
        <div className="browser-chrome"><i /><i /><i /><span>Личный сайт спикера</span></div>
        <div className="browser-page"><div><span>Максим Недельский</span><strong>Знания,<br /> которые<br /> <em>становятся</em><br /> действиями</strong><b>Пригласить спикера ↗</b></div><img src={sitePath("/images/speaker/maxim-navy.png")} alt="Максим Недельский с микрофоном на макете сайта спикера" width="1023" height="1537" loading="lazy" /></div>
      </div>
      <span className="project-art-note">Экспертиза → предложение → сайт</span>
    </div>
  );
}

export function ProjectPortfolio() {
  return (
    <section className="projects-section" id="projects" aria-labelledby="projects-title">
      <div className="section-intro">
        <p className="eyebrow eyebrow-dark">Собственные проекты</p>
        <h2 id="projects-title">Идеи, которые<br />{" "}<em>уже стали продуктами.</em></h2>
        <p className="section-lead">Практика за пределами выступлений: боты, цифровые сервисы и сайты. Показываю, как собираю решения под конкретную задачу.</p>
      </div>
      <div className="project-grid">
        {projects.map((project) => (
          <article className={`project-card project-${project.id}`} key={project.id}>
            <ProjectVisual id={project.id} />
            <div className="project-copy">
              <p className="project-category">{project.category}</p>
              <h3>{project.name}</h3>
              <p className="project-positioning">{project.title}</p>
              <dl className="project-details">
                <div><dt>Задача</dt><dd>{project.task}</dd></div>
                <div><dt>Решение</dt><dd>{project.solution}</dd></div>
                <div><dt>Результат</dt><dd>{project.result}</dd></div>
              </dl>
              <div className="project-actions">
                <a className="project-link" href={project.href} target={project.external ? "_blank" : undefined} rel={project.external ? "noopener noreferrer" : undefined}>{project.cta}<span aria-hidden="true">↗</span></a>
                {(projectExtraLinks[project.id] ?? []).map((link) => <a className="project-link" key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<span aria-hidden="true">↗</span></a>)}
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="project-caption">Графика иллюстрирует логику проектов. Возможности и объём похожего решения обсуждаем под вашу задачу.</p>
    </section>
  );
}
