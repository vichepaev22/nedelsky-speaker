import unittest
from app.questions import QUESTIONS
from app.scoring import evaluate


class ExtremeContract(unittest.TestCase):
    def test_extremes(self):
        for score, index, level in [(0, 0, 1), (3, 100, 4)]:
            answers = {q["id"]: next(o["id"] for o in q["options"] if o["score"] == score) for q in QUESTIONS}
            result = evaluate(answers)
            self.assertEqual((result["index"], result["level"]), (index, level))
