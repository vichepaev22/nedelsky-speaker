import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://maxim-nedelsky-speaker-ru.chepaev.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Максим Недельский — бизнес-тренер и спикер",
    template: "%s · Максим Недельский",
  },
  description: "Практические выступления и семинары для бизнеса об ИИ, сервис-дизайне, партнёрстве и развитии бизнеса.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "Максим Недельский — бизнес-тренер и спикер",
    title: "Максим Недельский — бизнес-тренер и спикер",
    description: "Практические выступления и семинары для бизнеса об ИИ, сервис-дизайне, партнёрстве и развитии бизнеса.",
    images: [{ url: "/images/speaker/maxim-flags-navy.png", width: 1537, height: 1023, alt: "Максим Недельский на деловом мероприятии" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Максим Недельский — бизнес-тренер и спикер",
    description: "Практические выступления и семинары для бизнеса.",
    images: ["/images/speaker/maxim-flags-navy.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
