const steps = [
  ["Задача", "Что должно измениться в вашей работе"],
  ["Контекст", "Данные, ограничения и образец результата"],
  ["Прототип", "Первый сценарий на конкретной задаче"],
  ["Проверка", "Качество и контроль со стороны человека"],
  ["План внедрения", "Следующие шаги и ответственные"],
];

export function AiWorkflowVisual() {
  return (
    <div className="workflow-board" aria-labelledby="workflow-title">
      <div className="workflow-heading">
        <span className="workflow-label">Логика работы</span>
        <span className="workflow-mark" aria-hidden="true">N ↗</span>
        <h2 id="workflow-title">Собираем решение.<br />{" "}<em>Шаг за шагом.</em></h2>
      </div>
      <ol className="workflow-steps">
        {steps.map(([title, description], index) => (
          <li key={title} style={{ animationDelay: `${index * 180}ms` }}>
            <span className="workflow-number" aria-hidden="true">0{index + 1}</span>
            <div><strong>{title}</strong><p>{description}</p></div>
            <span className="workflow-node" aria-hidden="true" />
          </li>
        ))}
      </ol>
      <div className="workflow-example">
        <span>Учебный пример · ответ клиенту</span>
        <p>Запрос + данные о продукте <b aria-hidden="true">→</b> черновик ИИ <b aria-hidden="true">→</b> проверка сотрудником</p>
      </div>
    </div>
  );
}
