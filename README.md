# Сайт Максима Недельского

## Страница опыта и публикаций (GEO-PORTFOLIO-01)

Новый маршрут `/about/` подготовлен для обеих статических версий и SSR. Канонический сайт — `https://nedelsky.pages.dev/`; GitHub Pages остаётся зеркалом. PR не означает публикацию.

- `content/evidence-register.json` — редакторский реестр, включая непубличные статусы. Не импортировать его в UI.
- После проверки источников: `npm run portfolio:export`; `npm run portfolio:check` выполняется также перед сборками.
- `npm run test:portfolio` — после обеих статических сборок; `tests/portfolio-browser.mjs` — отдельный локальный Playwright smoke-test (требует доступный Playwright/браузер, ничего не устанавливает).
- `npm run preview:portfolio` — после сборок открывает только loopback `http://127.0.0.1:4191/about/` и `/nedelsky-speaker/about/`.
- [Аудит и реальные ограничения](docs/geo-audit.md), [шаги владельца и репутационные черновики](docs/geo-owner-checklist.md), [протокол измерений](docs/geo-measurement-protocol.md).

Публичная версия: <https://vichepaev22.github.io/nedelsky-speaker/>

## Как устроен лендинг

- **HTML — структура и содержание:** `github-pages/index.html` и статическая разметка, которая собирается для главной и четырёх страниц программ.
- **CSS — визуальная система и адаптивность:** `github-pages/site.css` подключает стили из `app/globals.css`. Вёрстка рассчитана на экраны от 320 px.
- **JavaScript — интерактивность:** `github-pages/main.tsx` оживляет уже готовую HTML-страницу, включая форму заявки в VK.

Исходный HTML после сборки содержит ключевое содержание, метаданные и JSON-LD, поэтому страницы остаются понятными поисковым роботам и помощникам, даже если JavaScript не выполняется.

## Поиск и ассистенты

- `public/sitemap.xml` — карта всех публичных страниц;
- `public/robots.txt` — правила доступа для Яндекса и распространённых AI-краулеров;
- `public/llms.txt` — компактное машинно-читаемое описание эксперта, тем и ссылок;
- JSON-LD Schema.org в исходном HTML: `Person`, `ProfilePage`, `WebPage`, `Course`, `BreadcrumbList`.

## Команды

```bash
npm run lint
npx tsc --noEmit
npm test
npm run test:pages
```
