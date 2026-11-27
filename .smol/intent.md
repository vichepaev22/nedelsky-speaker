# Intent: страница «ИИ для бизнеса»

## Текущая доработка: конверсия без редизайна

Сохранить палитру, типографику, фотографии, факты программ и цены. Изменить первый экран, добавить диагностику из трёх ситуаций, поставить результаты перед процессом и убрать обязательную форму/копирование перед VK. Сохранить `?product=…#details-…`, добавить мобильную нижнюю CTA с safe-area. Выровнять все смысловые строки трёх карточек. SEO, домен и зависимости не менять. Проверка: сборки, целевые тесты, lint и браузер на ширинах 1440, 1280, 768, 430, 390, 375, 320; независимое ревью.

Ниже сохранён контекст создания страницы; новый прямой CTA заменяет описанный там сценарий формы.

Добавить к действующему сайту отдельную продуктовую страницу `/ai-for-business/` с тремя подтверждёнными форматами работы Максима Недельского. Сохранить главную как медиакит спикера, существующие четыре программы, текущую дизайн-систему, связь только через VK и обе статические публикации.

Страница должна честно показывать состав, длительность, результаты и ограничения продуктов. Цены подтверждены: 7 000 / 35 000 / 150 000 ₽; 28 сентября 2026 года по `Asia/Yekaterinburg` действуют цены 5 000 / 29 000 / 120 000 ₽. До появления платёжных ссылок CTA формирует сообщение и открывает VK, не имитируя отправку или оплату.

Успех: прямой маршрут статически сгенерирован, адаптивен и доступен; промо-состояние меняется по дате; SEO/GEO-метаданные, sitemap и llms.txt обновлены; Cloudflare- и GitHub-сборки проходят целевые тесты; опубликованный маршрут возвращает 200 и загружает ресурсы.
## GEO-PORTFOLIO-01 — 27 ноября 2026

accepted; implementation in progress, publication not authorized. Source brief copied unchanged to `docs/geo-brief-2026-11-27.md`; original Downloads file and dirty original checkout remain untouched. Working copy of the SAME repository on `codex/geo-portfolio-2026-11-27`, based on remote main ea30bbb. PR #1 is draft/open, not merged; incorporate its valid evidence/search-bot intent without a duplicate block or merging its unverified claims. Existing prototype_mode product_only applies to this site; no mock rebuild.

GEO-EVIDENCE: audit every S01–S27 and conduct additional first-party discovery. A code registry records status, exact role/date precision, checks and duplicate event group. Only reviewed verified entries pass a whitelist exporter into browser data; internal notes/review/broken records must not ship. A 200 response or snippet alone is insufficient. Preserve copyright/privacy; no copied articles, logos, personal identifiers, old contacts, fake titles or current-status inference from historic roles.

GEO-ABOUT: full /about/ route in existing palette/type, with biography, own material, speaking/announcements distinguished, grouped media/project history, dated timeline and existing service/contact CTAs. Initially complete HTML including all verified source links; optional topic buttons enhance, never gate content. Main header/footer and service pages link to /about/. Keep #about anchor for old links. Native navigation, keyboard focus, reduced motion,320/390/1440 layout. No paid forms/new tracking.

GEO-ENTITY: same canonical Person ID https://nedelsky.pages.dev/#maxim-nedelsky across all routes/builds, ProfilePage.mainEntity, own CreativeWork.author ONLY for confirmed works, others about/subjectOf. No made-up Article authors or VideoObject metadata. Add canonical /about/ sitemap/llms links. Keep GPTBot/training preferences unchanged; search-specific bot access separate. SEO/GEO claims checked against current primary documentation, no guaranteed citation/ranking score.

GEO-DELIVERY: focused source/export and rendered tests first; both static builds, SSR route, lint/typecheck, browser/no-JS/mobile, schema syntax/properties and source checks. Deliver docs/geo-audit.md, owner checklist/outreach drafts and repeatable independent-measurement protocol with unavailable baselines explicitly unmeasured. Branch/PR preparation allowed; no production deploy, account registration, sitemap submission without verified ownership, external messages or paid calls.
