"use client";
import { useState } from "react";
import type { ProgramFormat } from "./programs-data";
const depths = [
  { title: "Разобраться в основах", text: "Увидеть возможности темы, познакомиться с подходом и определить следующий шаг." },
  { title: "Попробовать на практике", text: "Разобраться в подходе и закрепить его на упражнениях с обратной связью." },
  { title: "Разобрать свою задачу", text: "Пройти весь путь: от основ и упражнений до решения прикладной задачи и плана действий." },
];
export function FormatExplorer({ formats }: { formats: ProgramFormat[] }) {
  const [selected, setSelected] = useState(0);
  return <div className="format-explorer">
    <div className="format-explorer-heading"><span>Какую глубину выберем?</span><p>Нажмите на длительность и сравните результат.</p></div>
    <div className="format-depth-buttons" role="group" aria-label="Сравнить глубину форматов">
      {formats.map((format, index) => <button type="button" key={format.duration} aria-pressed={selected === index} aria-controls="format-depth-result" onClick={() => setSelected(index)}><strong>{format.duration}</strong><span>{format.type}</span></button>)}
    </div>
    <div className="format-depth-result" id="format-depth-result" aria-live="polite" aria-atomic="true">
      <div><h3>{depths[selected].title}</h3><p>{depths[selected].text}</p></div>
      <ol className="format-depth-steps" aria-label="Что включено в выбранный формат">
        {["Понять подход", "Отработать инструменты", "Применить к своей задаче"].map((label, index) => <li key={label} data-included={index <= selected}><span aria-hidden="true">{index <= selected ? "✓" : "—"}</span>{label}<span className="sr-only">{index <= selected ? " — включено" : " — в более длительном формате"}</span></li>)}
      </ol>
    </div>
  </div>;
}
