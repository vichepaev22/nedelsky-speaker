"use client";

import type { MouseEvent } from "react";

type NavigationItem = {
  href: string;
  label: string;
};

type SiteHeaderProps = {
  brandHref: string;
  contactHref: string;
  navigation: NavigationItem[];
};

export function SiteHeader({ brandHref, contactHref, navigation }: SiteHeaderProps) {
  function closeMobileMenu(event: MouseEvent<HTMLAnchorElement>) {
    event.currentTarget.closest("details")?.removeAttribute("open");
  }

  return (
    <header className="site-header">
      <a className="brand" href={brandHref} aria-label="Максим Недельский — на главную">
        <span className="brand-mark" aria-hidden="true">N</span>
        <span>Максим<br />Недельский</span>
      </a>

      <nav className="desktop-nav" aria-label="Основная навигация">
        {navigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
      </nav>

      <details className="mobile-menu">
        <summary aria-label="Открыть навигацию">
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </summary>
        <nav aria-label="Мобильная навигация">
          {navigation.map((item) => <a href={item.href} key={item.href} onClick={closeMobileMenu}>{item.label}</a>)}
        </nav>
      </details>

      <a className="button button-dark header-cta" href={contactHref}>
        <span className="header-cta-full">Обсудить выступление</span>
        <span className="header-cta-short">Связаться</span>
        <b aria-hidden="true">↗</b>
      </a>
    </header>
  );
}
