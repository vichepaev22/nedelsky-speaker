import type { Metadata } from "next";
import { AboutPage, aboutTitle, aboutDescription } from "../AboutPage";
import { ABOUT_URL, PRIMARY_ORIGIN } from "../person-data";
import { aboutSchema } from "../portfolio";

export const metadata: Metadata = {
  title: { absolute: aboutTitle }, description: aboutDescription,
  alternates: { canonical: ABOUT_URL },
  openGraph: { title: aboutTitle, description: aboutDescription, url: ABOUT_URL, type: "profile", images: [`${PRIMARY_ORIGIN}/images/speaker/maxim-navy-optimized.jpg`] },
  twitter: { card: "summary_large_image", title: aboutTitle, description: aboutDescription, images: [`${PRIMARY_ORIGIN}/images/speaker/maxim-navy-optimized.jpg`] },
};
export default function Page() {
  // Person is supplied once by the SSR layout; static builds use the full graph.
  const json = JSON.stringify(aboutSchema(false)).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("&", "\\u0026");
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} /><AboutPage /></>;
}
