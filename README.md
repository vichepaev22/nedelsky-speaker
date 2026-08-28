# Сайт Максима Недельского

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
