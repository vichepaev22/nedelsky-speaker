import pytest

from app.questions import QUESTIONS, PROFILE, ALL_QUESTIONS
from app.scoring import evaluate, preliminary_level


def answers_with_scores(scores):
    return {q["id"]: next(o["id"] for o in q["options"] if o["score"] == score) for q, score in zip(QUESTIONS, scores, strict=True)}


def test_bank():
    assert len(PROFILE) == 3 and len(QUESTIONS) == 16
    assert len({q["id"] for q in ALL_QUESTIONS}) == 19
    for q in QUESTIONS:
        assert len(q["options"]) == 4
        assert {o["score"] for o in q["options"]} == {0, 1, 2, 3}
        assert len({o["id"] for o in q["options"]}) == 4
    assert len({next(o["id"] for o in q["options"] if o["score"] == 3) for q in QUESTIONS}) > 1


@pytest.mark.parametrize("score,index,level", [(0, 0, 1), (3, 100, 4)])
def test_extremes(score, index, level):
    result = evaluate(answers_with_scores([score] * 16))
    assert (result["index"], result["level"]) == (index, level)


@pytest.mark.parametrize("index,level", [(24, 1), (25, 2), (49, 2), (50, 3), (74, 3), (75, 4)])
def test_thresholds(index, level):
    assert preliminary_level(index) == level


@pytest.mark.parametrize("scores,level", [
    ([3]*4 + [0]*4 + [3]*8, 1),
    ([3]*8 + [0]*4 + [3]*4, 2),
    ([3]*13 + [0] + [3]*2, 3),
    ([3]*15 + [0], 3),
    ([3]*12 + [2]*4, 4),
])
def test_sequential_gates(scores, level):
    assert evaluate(answers_with_scores(scores))["level"] == level


def test_context_does_not_change_score_and_ties_are_stable():
    answers = answers_with_scores([2]*16)
    first = evaluate(answers)
    assert first["strength"] == "B" and first["growth"] == "B"
    assert evaluate({**answers, "P1": "E", "P2": "A", "P3": "D"}) == first


def test_growth_first_under_67_and_failed_gate_priority():
    result = evaluate(answers_with_scores([3]*4 + [1]*4 + [3]*8))
    assert result["growth"] == "P" and result["gate_gap"] == "P"


@pytest.mark.parametrize("mutation", ["missing", "invalid", "unknown"])
def test_reject_invalid_answers(mutation):
    answers = answers_with_scores([3]*16)
    if mutation == "missing": answers.pop("B01")
    elif mutation == "invalid": answers["B01"] = "999"
    else: answers["EVIL"] = "A"
    with pytest.raises(ValueError): evaluate(answers)
