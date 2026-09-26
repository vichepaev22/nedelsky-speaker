"use client";

import { useEffect, useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { aiVkContact, getAiProduct } from "./ai-products-data";
import { sitePath } from "./site-paths";

const selectionEvent = "ai-product-change";

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  window.addEventListener(selectionEvent, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener(selectionEvent, onChange);
  };
}

function readLocation() {
  return window.location.search + window.location.hash;
}

function selectedProduct() {
  const requested = new URLSearchParams(window.location.search).get("product") ?? "";
  return getAiProduct(requested);
}

function revealTarget(hash: string, behavior: ScrollBehavior, moveFocus = false) {
  const id = hash.slice(1);
  if (!/^(?:details-|product-)ai-(?:start|practice|transformation)$/.test(id) && id !== "ai-contact") return;
  const target = document.getElementById(id);
  if (!target) return;
  if (target instanceof HTMLDetailsElement) target.open = true;
  if (moveFocus) {
    const focusTarget = target instanceof HTMLDetailsElement ? target.querySelector("summary") : target;
    if (focusTarget instanceof HTMLElement) focusTarget.focus({ preventScroll: true });
  }
  target.scrollIntoView({ behavior, block: "start" });
}

type ProductLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { productSlug: string; targetId: string };

export function AiProductLink({ productSlug, targetId, children, ...props }: ProductLinkProps) {
  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const destination = new URL(event.currentTarget.href);
    if (destination.href !== window.location.href) window.history.pushState(null, "", destination);
    window.dispatchEvent(new Event(selectionEvent));
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    revealTarget(destination.hash, behavior, true);
  }

  return <a {...props} href={sitePath(`/ai-for-business/?product=${productSlug}#${targetId}`)} onClick={navigate}>{children}</a>;
}

export function AiContactLink({ productSlug, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { productSlug?: string }) {
  function rememberProduct(event: MouseEvent<HTMLAnchorElement>) {
    if (!productSlug || !getAiProduct(productSlug)) return;
    const location = new URL(window.location.href);
    location.searchParams.set("product", productSlug);
    location.hash = event.currentTarget.closest("details")?.id ?? `product-${productSlug}`;
    window.history.replaceState(null, "", location);
    window.dispatchEvent(new Event(selectionEvent));
  }

  return <a {...props} href={aiVkContact} target="_blank" rel="noopener noreferrer" onClick={rememberProduct}>{children}</a>;
}

// Keep URL selection in the existing inquiry module; no second product state or form is needed.
export function AiInquiryForm() {
  const location = useSyncExternalStore(subscribeToLocation, readLocation, () => "");
  const product = location ? selectedProduct() : undefined;

  useEffect(() => {
    const restoreTarget = () => revealTarget(window.location.hash, "instant");
    const frame = window.requestAnimationFrame(restoreTarget);
    window.addEventListener("popstate", restoreTarget);
    window.addEventListener("hashchange", restoreTarget);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("popstate", restoreTarget);
      window.removeEventListener("hashchange", restoreTarget);
    };
  }, []);

  return (
    <>
      <div className="ai-contact-panel">
        <p className="eyebrow eyebrow-dark">Начнём с вашей задачи</p>
        <p className="ai-contact-context" aria-live="polite">{product ? <>Выбранный формат: <strong>{product.shortTitle}</strong></> : <>Формат можно выбрать вместе</>}</p>
        <p>Напишите, чем занимается ваш бизнес и какую задачу хотите решить. Обсудим, какой объём работы подойдёт.</p>
        <AiContactLink className="button button-dark">Обсудить задачу <span aria-hidden="true">↗</span></AiContactLink>
        <p className="ai-contact-hint">Откроется профиль Максима во ВКонтакте. Нажмите «Написать сообщение».</p>
        <a className="ai-format-link" href="#ai-fit">Подобрать формат <span aria-hidden="true">↑</span></a>
      </div>
      <nav className="ai-mobile-cta" aria-label="Быстрая связь">
        <span>{product?.shortTitle ?? "ИИ для бизнеса"}</span>
        <AiContactLink className="button button-dark">Обсудить задачу <span aria-hidden="true">↗</span></AiContactLink>
      </nav>
    </>
  );
}
