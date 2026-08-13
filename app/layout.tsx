import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Максим Недельский — бизнес-тренер и спикер",
    template: "%s · Максим Недельский",
  },
  description: "Практические выступления и семинары для бизнеса об ИИ, сервис-дизайне, партнёрстве и развитии бизнеса.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
