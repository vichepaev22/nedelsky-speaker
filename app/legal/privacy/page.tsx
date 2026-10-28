import type { Metadata } from "next";
import { PrivacyPage } from "../../PrivacyPage";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Обработка данных на сайте Максима Недельского: форма, ВКонтакте, технические сведения и настройки cookies.",
};

export default function Page() {
  return <PrivacyPage />;
}
