# Shared architecture

- `app/ai-products-data.ts` — единый источник содержания, цен и этапов трёх продуктов.
- `app/AiBusinessPage.tsx` — семантическая страница, переиспользующая `SiteHeader`, `sitePath` и изображения проекта.
- `app/AiPromoPrice.tsx` — клиентское определение фазы акции в `Asia/Yekaterinburg`; статический fallback всегда показывает обычную цену.
- `app/AiInquiryForm.tsx` — клиентская форма без сетевой отправки: выбранный продукт, имя и задача превращаются в текст, копируются и открывают `https://vk.ru/ndlsky`.
- `/ai-for-business/` добавляется одновременно в vinext route, Vite client router и статический генератор.
- Новых runtime-зависимостей нет. Интерактивность реализуется React и CSS, с поддержкой `prefers-reduced-motion`.
- Cloudflare canonical: `https://nedelsky.pages.dev/ai-for-business/`; GitHub canonical формируется из текущего target origin.
- В Schema.org публикуются подтверждённые Person/WebPage/Service и обычные цены; временная скидка не остаётся в статической разметке как действующая после 28 сентября.

# Validation contract

- `npm run test:cloudflare`
- `npm run test:pages`
- `npm test`
- после деплоя: HTTP 200 главной и `/ai-for-business/`, правильный canonical и доступные CSS/JS.
