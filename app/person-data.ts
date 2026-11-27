export const PRIMARY_ORIGIN = "https://nedelsky.pages.dev";
export const PERSON_ID = `${PRIMARY_ORIGIN}/#maxim-nedelsky`;
export const ABOUT_URL = `${PRIMARY_ORIGIN}/about/`;

export function personEntity() {
  return {
    "@type": "Person", "@id": PERSON_ID,
    name: "Максим Недельский",
    alternateName: ["Максим Владимирович Недельский", "Недельский Максим Владимирович", "Maxim Nedelsky"],
    url: `${PRIMARY_ORIGIN}/`,
    image: `${PRIMARY_ORIGIN}/images/speaker/maxim-navy-optimized.jpg`,
    description: "Предприниматель, бизнес-тренер и спикер по практическому применению ИИ в бизнесе. Проводит обучение, разбор процессов и совместное прототипирование решений.",
    jobTitle: ["Бизнес-тренер", "Предприниматель", "Спикер"],
    sameAs: ["https://vk.ru/ndlsky"],
    knowsAbout: ["искусственный интеллект в бизнесе", "автоматизация бизнес-процессов", "сервис-дизайн", "клиентский опыт", "партнёрство", "государственные закупки"],
  };
}
