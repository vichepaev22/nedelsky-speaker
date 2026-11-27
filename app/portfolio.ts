import data from "./portfolio-public.json";
import { ABOUT_URL, PERSON_ID, PRIMARY_ORIGIN, personEntity } from "./person-data";

export type Topic = "ai" | "business" | "procurement" | "sport" | "swimming";
export type Evidence = {
  id: string; title: string; publisher: string; url: string;
  type: "author_work" | "expert_comment" | "speaking" | "credential" | "media" | "project" | "press_release";
  topics: Topic[]; publishedAt?: string; year?: number; role: string; summary: string;
  claimIds: string[]; verifiedAt: string; eventGroupId: string; format?: string; sourceKind: string;
};
export const evidence = data as Evidence[];
export const evidenceById = (id: string) => {
  const item = evidence.find(source => source.id === id);
  if (!item) throw new Error(`Source not verified: ${id}`);
  return item;
};
export function evidenceGroups(sources = evidence) {
  return [...new Set(sources.map(item => item.eventGroupId))].map(id => sources.filter(item => item.eventGroupId === id));
}
export const roleLabels: Record<Evidence["type"], string> = {
  author_work: "Авторский материал", expert_comment: "Экспертный комментарий",
  speaking: "Выступление / программа", credential: "Исторический статус",
  media: "Материал о деятельности", project: "Проект / участие", press_release: "Пресс-релиз",
};
export function aboutSchema(includePerson = true) {
  const works = evidence.map(item => ({
    "@type": "CreativeWork", "@id": item.url,
    name: item.title, url: item.url,
    description: `${item.role}. ${item.summary}`,
    inLanguage: item.id === "S10" ? "en" : "ru",
    ...(item.publishedAt ? { datePublished: item.publishedAt } : {}),
    publisher: { "@type": "Organization", name: item.publisher },
    ...(item.type === "author_work" ? { author: { "@id": PERSON_ID } } : { about: { "@id": PERSON_ID } }),
    ...(item.format?.startsWith("PDF") ? { encodingFormat: "application/pdf" } : {}),
  }));
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...(includePerson ? [{ ...personEntity(), subjectOf: works.filter(item => !("author" in item)).map(item => ({ "@id": item["@id"] })) }] : []),
      { "@type": "ProfilePage", "@id": `${ABOUT_URL}#webpage`, url: ABOUT_URL,
        name: "Максим Недельский — обо мне, публикации и выступления", inLanguage: "ru-RU",
        mainEntity: { "@id": PERSON_ID }, dateModified: "2026-11-27",
        breadcrumb: { "@id": `${ABOUT_URL}#breadcrumbs` },
        citation: works.map(item => ({ "@id": item["@id"] })),
      },
      { "@type": "BreadcrumbList", "@id": `${ABOUT_URL}#breadcrumbs`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: `${PRIMARY_ORIGIN}/` },
        { "@type": "ListItem", position: 2, name: "Обо мне", item: ABOUT_URL },
      ] },
      ...works,
    ],
  };
}
