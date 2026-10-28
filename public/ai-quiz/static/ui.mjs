export function mountUI() {
  const controller=new AbortController();
  let cleanup=()=>{};
  function listen(target,event,handler,options={}){target.addEventListener(event,handler,{...options,signal:controller.signal});}


  const key = "nedelsky-ai-quiz-result-v1";
  // Keep decorative motion out of keyboard-driven navigation, also across pages.
  const inputModeKey = "nedelsky-quiz-input-mode";
  function inputMode(mode) {
    document.body.classList.toggle("keyboard-navigation", mode === "keyboard");
    try { sessionStorage.setItem(inputModeKey, mode); } catch { /* Optional preference. */ }
  }
  try { if (sessionStorage.getItem(inputModeKey) === "keyboard") inputMode("keyboard"); } catch { /* No storage required. */ }
  listen(document,"keydown", (event) => {
    if (["Tab", "Enter", " ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) inputMode("keyboard");
  });
  listen(document,"pointerdown", () => inputMode("pointer"), { passive: true });
  const printButton = document.getElementById("print-result");
  if (printButton) {
    printButton.hidden = false;
    listen(printButton,"click", () => window.print());
  }

  if (document.body.hasAttribute("data-focus-screen")) {
    const heading = document.querySelector("h1");
    if (heading) heading.focus({ preventScroll: true });
  }

  const firstChapter = document.querySelector("[data-first-chapter]");
  if (firstChapter) {
    const questionStage = document.getElementById("question-stage");
    questionStage.hidden = true;
    firstChapter.querySelector("h2").focus({ preventScroll: true });
    listen(firstChapter.querySelector("[data-begin-chapter]"),"click", (event) => {
      event.preventDefault();
      questionStage.hidden = false;
      firstChapter.dispatchEvent(new Event("chapter-dismiss"));
      firstChapter.hidden = true;
      document.getElementById("question-title").focus({ preventScroll: true });
    });
  }

  const journey = document.querySelector(".journey-path");
  if (journey) {
    const traveller = journey.querySelector(".journey-traveller");
    const total = Math.max(1, Number(journey.dataset.total) || 16);
    const step = Math.min(total, Math.max(0, Number(journey.dataset.step) || 0));
    journey.style.setProperty("--journey-position", `${step / total * 100}%`);
    traveller.hidden = false;
  }
  const save = document.getElementById("save-result");
  const download = document.getElementById("download-result");
  const source = document.getElementById("result-save-source");
  if (save && download && source) {
    save.hidden = false;
    download.hidden = false;
    listen(save,"click", () => {
      const card = document.getElementById("result-card");
      const value = { version: 1, date: new Date().toISOString(), level: card.dataset.level, index: Number(card.dataset.index), text: source.textContent.trim() };
      try {
        localStorage.setItem(key, JSON.stringify(value));
        document.getElementById("save-status").textContent = "Карта сохранена в этом браузере. Её можно найти на обложке диагностики и удалить там. Синхронизации между устройствами нет.";
      } catch {
        document.getElementById("save-status").textContent = "Браузер не разрешил сохранение. Можно скачать текстовую карту соседней кнопкой.";
      }
    });
    listen(download,"click", () => {
      const url = URL.createObjectURL(new Blob([source.textContent.trim()], { type: "text/plain;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `nedelsky-ai-map-${new Date().toISOString().slice(0,10)}.txt`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  const savedCard = document.getElementById("saved-card");
  if (savedCard) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      if (value && value.version === 1 && typeof value.text === "string" && value.text.length <= 10000 && !Number.isNaN(Date.parse(value.date)) && ["Базовый", "Прикладной", "Продвинутый", "Агентский"].includes(value.level) && Number.isInteger(value.index) && value.index >= 0 && value.index <= 100) {
        document.getElementById("saved-text").textContent = value.text;
        document.getElementById("saved-date").textContent = `Сохранено ${new Date(value.date).toLocaleDateString("ru-RU")} · ${value.level} · ${value.index}/100`;
        savedCard.hidden = false;
      }
    } catch { /* Quiz still works when storage is missing or blocked. */ }
    listen(document.getElementById("delete-saved"),"click", () => {
      try {
        localStorage.removeItem(key);
        document.getElementById("saved-status").textContent = "Сохранённая карта удалена из этого браузера.";
        document.getElementById("saved-text").textContent = "";
        document.getElementById("saved-date").textContent = "";
        document.getElementById("delete-saved").hidden = true;
      } catch {
        document.getElementById("saved-status").textContent = "Браузер заблокировал доступ. Удалить данные можно в настройках этого сайта.";
      }
    });
  }

  return ()=>{controller.abort();cleanup();};
}
