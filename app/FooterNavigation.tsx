"use client";

import { useEffect, useRef } from "react";
import { sitePath } from "./site-paths";

const rows = [
  [{ href: "#partners", label: "Партнёры" }, { href: "#projects", label: "Проекты" }, { href: "#programs", label: "Программы" }, { href: "#cases", label: "Подход" }],
  [{ href: "#about", label: "О спикере" }, { href: "#organizers", label: "Организаторам" }, { href: sitePath("/ai-for-business/"), label: "ИИ для бизнеса" }, { href: "#contact", label: "Связаться" }],
];

export function FooterNavigation() {
  const navigation = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = navigation.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    let keyboardNavigation = false;
    const key = (event: KeyboardEvent) => { if (["Tab", "PageDown", "End", "ArrowDown"].includes(event.key)) keyboardNavigation = true; };
    const pointer = () => { keyboardNavigation = false; };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (!keyboardNavigation && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) element.dataset.entered = "true";
      observer.disconnect();
    }, { threshold: .2 });
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", pointer);
    document.addEventListener("wheel", pointer, { passive: true });
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", pointer);
      document.removeEventListener("wheel", pointer);
    };
  }, []);

  return <nav className="footer-nav" ref={navigation} aria-label="Навигация по разделам сайта">
    {rows.map((row, index) => <div className="footer-nav-row" key={index}>
      {row.map((item) => <a className={item.href === "#contact" ? "footer-contact-link" : undefined} href={item.href} key={item.href}>{item.label}{item.href === "#contact" && <span aria-hidden="true">↗</span>}</a>)}
    </div>)}
  </nav>;
}
