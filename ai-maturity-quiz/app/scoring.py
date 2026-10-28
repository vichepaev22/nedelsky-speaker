from .questions import QUESTIONS, ALL_QUESTIONS, PROFILE


def preliminary_level(index):
    if not isinstance(index, int) or not 0 <= index <= 100:
        raise ValueError("Индекс вне диапазона")
    return 1 if index < 25 else 2 if index < 50 else 3 if index < 75 else 4


def evaluate(answers):
    known = {q["id"] for q in ALL_QUESTIONS}
    if not isinstance(answers, dict) or set(answers) - known:
        raise ValueError("Неизвестный вопрос")
    for q in PROFILE:
        if q["id"] in answers and answers[q["id"]] not in {o["id"] for o in q["options"]}:
            raise ValueError("Неизвестный ответ")
    scores = {}
    for q in QUESTIONS:
        selected = next((o for o in q["options"] if o["id"] == answers.get(q["id"])), None)
        if selected is None:
            raise ValueError("Не хватает корректных ответов")
        scores[q["id"]] = selected["score"]
    index = round(100 * sum(scores.values()) / 48)
    blocks = {c: round(100 * sum(s for q, s in scores.items() if q.startswith(c)) / 12) for c in "BPSA"}
    gates = {
        "P": sum(s >= 2 for q, s in scores.items() if q.startswith("P")) >= 2,
        "S": sum(s >= 2 for q, s in scores.items() if q.startswith("S")) >= 2,
        "A": sum(s >= 2 for q, s in scores.items() if q.startswith("A")) >= 3 and scores["A14"] >= 2 and scores["A16"] >= 2,
    }
    initial = preliminary_level(index)
    level = initial
    gap = None
    for target, block in [(2, "P"), (3, "S"), (4, "A")]:
        if level >= target and not gates[block]:
            level, gap = target - 1, block
            break
    return {"index": index, "level": level, "preliminary": initial, "blocks": blocks,
            "strength": max(blocks, key=blocks.get),
            "growth": next((c for c, n in blocks.items() if n < 67), min(blocks, key=blocks.get)),
            "gate_gap": gap}
