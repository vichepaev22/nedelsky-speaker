"use client";

import { useState, type CSSProperties, type PointerEvent } from "react";
import type { Program } from "./programs-data";

type InteractionType = Program["visual"];

type InteractionStage = {
  label: string;
  description: string;
  x: number;
  y: number;
};

type InteractionConfig = {
  eyebrow: string;
  title: string;
  lead: string;
  stages: InteractionStage[];
  connections: Array<[number, number]>;
};

const interactions: Record<InteractionType, InteractionConfig> = {
  ai: {
    eyebrow: "Интерактивная модель",
    title: "Соберите нейронную связь",
    lead: "Двигайте курсор по полю и выбирайте узлы: идея превращается в решение только через связанный контекст.",
    stages: [
      { label: "Контекст", description: "Фиксируем задачу, ограничения и нужный бизнес-результат.", x: 15, y: 29 },
      { label: "Данные", description: "Определяем, какая информация нужна модели для точного ответа.", x: 42, y: 17 },
      { label: "Модель", description: "Подбираем инструмент под задачу, а не задачу под инструмент.", x: 76, y: 31 },
      { label: "Процесс", description: "Встраиваем решение в понятный рабочий сценарий команды.", x: 30, y: 66 },
      { label: "Результат", description: "Проверяем эффект и превращаем удачный сценарий в систему.", x: 68, y: 69 },
    ],
    connections: [[0, 1], [1, 2], [0, 3], [1, 3], [1, 4], [2, 4], [3, 4]],
  },
  service: {
    eyebrow: "Карта клиентского пути",
    title: "Посмотрите сервис глазами клиента",
    lead: "Пройдите путь от первого контакта до возвращения и откройте, что клиент думает и чувствует на каждом этапе.",
    stages: [
      { label: "Знакомство", description: "Первое обещание бренда формирует ожидание ещё до покупки.", x: 12, y: 42 },
      { label: "Выбор", description: "Клиент сравнивает не продукты, а понятность и уверенность в решении.", x: 37, y: 25 },
      { label: "Опыт", description: "Точки контакта складываются в цельное впечатление о компании.", x: 64, y: 59 },
      { label: "Возвращение", description: "Хороший финал опыта создаёт доверие и следующую покупку.", x: 88, y: 34 },
    ],
    connections: [[0, 1], [1, 2], [2, 3]],
  },
  partnership: {
    eyebrow: "Система партнёрства",
    title: "Соедините интересы вокруг общей цели",
    lead: "Выбирайте элементы системы и смотрите, как доверие, роли и договорённости удерживают партнёрство.",
    stages: [
      { label: "Общая цель", description: "Партнёры одинаково понимают, ради какого результата объединяются.", x: 50, y: 15 },
      { label: "Доверие", description: "Открытость позволяет быстрее принимать решения и проходить сложные моменты.", x: 17, y: 48 },
      { label: "Роли", description: "Каждый участник понимает свой вклад, полномочия и ответственность.", x: 50, y: 72 },
      { label: "Договорённости", description: "Правила взаимодействия превращают намерение в устойчивую практику.", x: 83, y: 48 },
    ],
    connections: [[0, 1], [0, 3], [1, 2], [2, 3], [0, 2]],
  },
  procurement: {
    eyebrow: "Маршрут закупки",
    title: "Проследите путь от потребности до исполнения",
    lead: "Выбирайте этапы цикла: сильная заявка начинается задолго до публикации закупки и продолжается после победы.",
    stages: [
      { label: "Потребность", description: "Разбираемся, какую задачу заказчик действительно должен решить.", x: 12, y: 41 },
      { label: "План", description: "Следим за бюджетным циклом и заранее оцениваем будущий спрос.", x: 37, y: 41 },
      { label: "Закупка", description: "Готовим документы и предложение под требования конкретной процедуры.", x: 63, y: 41 },
      { label: "Исполнение", description: "Качественный контракт становится основой репутации и новых продаж.", x: 88, y: 41 },
    ],
    connections: [[0, 1], [1, 2], [2, 3]],
  },
};

function Network({ config }: { config: InteractionConfig }) {
  return (
    <svg className="lab-network" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {config.connections.map(([from, to]) => {
        const start = config.stages[from];
        const end = config.stages[to];
        return <line key={`${from}-${to}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} />;
      })}
    </svg>
  );
}

export function ProgramInteraction({ type }: { type: InteractionType }) {
  const config = interactions[type];
  const [activeStage, setActiveStage] = useState(0);
  const active = config.stages[activeStage];

  const updatePointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
    event.currentTarget.style.setProperty("--pointer-x", `${x}%`);
    event.currentTarget.style.setProperty("--pointer-y", `${y}%`);
    event.currentTarget.style.setProperty("--shift-x", `${(x - 50) * 0.08}px`);
    event.currentTarget.style.setProperty("--shift-y", `${(y - 50) * 0.08}px`);
    event.currentTarget.style.setProperty("--shift-x-soft", `${(x - 50) * -0.04}px`);
    event.currentTarget.style.setProperty("--shift-y-soft", `${(y - 50) * -0.04}px`);
  };

  const resetPointer = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--pointer-x", "50%");
    event.currentTarget.style.setProperty("--pointer-y", "42%");
    event.currentTarget.style.setProperty("--shift-x", "0px");
    event.currentTarget.style.setProperty("--shift-y", "0px");
    event.currentTarget.style.setProperty("--shift-x-soft", "0px");
    event.currentTarget.style.setProperty("--shift-y-soft", "0px");
  };

  return (
    <section className={`program-lab lab-${type}`} aria-labelledby="interaction-title">
      <div className="program-lab-intro">
        <p className="eyebrow eyebrow-dark">{config.eyebrow}</p>
        <h2 id="interaction-title">{config.title}</h2>
        <p>{config.lead}</p>
        <span className="lab-hint"><b aria-hidden="true">↗</b> Проведите курсором и нажмите на узел</span>
      </div>

      <div
        className="lab-board"
        onPointerMove={updatePointer}
        onPointerLeave={resetPointer}
        style={{ "--pointer-x": "50%", "--pointer-y": "42%" } as CSSProperties}
      >
        <div className="lab-cursor" aria-hidden="true" />
        <Network config={config} />
        <div className="lab-nodes" role="group" aria-label="Элементы интерактивной схемы">
          {config.stages.map((stage, index) => (
            <button
              className={`lab-node ${activeStage === index ? "is-active" : ""}`}
              type="button"
              onClick={() => setActiveStage(index)}
              aria-pressed={activeStage === index}
              style={{ "--node-x": `${stage.x}%`, "--node-y": `${stage.y}%` } as CSSProperties}
              key={stage.label}
            >
              <span>0{index + 1}</span>
              {stage.label}
            </button>
          ))}
        </div>
        <div className="lab-readout" aria-live="polite">
          <span>0{activeStage + 1}</span>
          <div><strong>{active.label}</strong><p>{active.description}</p></div>
        </div>
      </div>
    </section>
  );
}
