import re

from fastapi.testclient import TestClient
from app.main import create_app
from app.config import Settings
from app.questions import ALL_QUESTIONS, QUESTIONS


def csrf(response):
    return re.search(r'name="csrf" value="([^"]+)"', response.text)[1]


def start(client):
    cover = client.get("/")
    return client.post("/start", data={"csrf": csrf(cover)})


def answer(client, step, response, option="A", **extra):
    return client.post(f"/answer/{step}", data={"csrf": csrf(response), "question_id": ALL_QUESTIONS[step]["id"], "option_id": option, **extra})


def test_complete_edit_resume_and_isolation():
    app = create_app(Settings())
    with TestClient(app) as client, TestClient(app) as other:
        response = start(client)
        for step, q in enumerate(ALL_QUESTIONS):
            if "/chapter/" in str(response.url): response = client.get(f"/quiz/{step}")
            option = next((o["id"] for o in q["options"] if o.get("score") == 3), "A")
            response = answer(client, step, response, option)
        assert response.status_code == 200 and "Агентский" in response.text
        assert "Индекс ответов" in response.text and 'data-index="100"' in response.text
        question = client.get("/quiz/3")
        zero = next(o["id"] for o in QUESTIONS[0]["options"] if o["score"] == 0)
        answer(client, 3, question, zero)
        result = client.get("/result")
        assert 'data-index="94"' in result.text
        assert f'value="{zero}" checked' in client.get("/quiz/3").text
        assert other.get("/result", follow_redirects=False).status_code == 303
        assert "Ваша карта работы с ИИ" not in other.get("/result").text


def test_validation_csrf_origin_and_no_client_scores():
    with TestClient(create_app(Settings())) as client:
        response = start(client)
        assert client.post("/answer/0", data={"option_id": "A"}).status_code == 403
        assert client.post("/start", data={"csrf": csrf(response)}, headers={"Origin": "https://evil.test"}).status_code == 403
        assert answer(client, 0, response, "NOPE").status_code == 422
        assert answer(client, 0, response, "A", score="999").status_code == 422
        assert client.get("/quiz/18", follow_redirects=False).headers["location"] == "/quiz/0"
        assert client.get("/result", follow_redirects=False).headers["location"] == "/quiz/0"
        assert client.post("/start", content="x"*5000, headers={"Content-Type": "application/x-www-form-urlencoded"}).status_code == 413


def test_session_expiry_restart_and_headers():
    app = create_app(Settings())
    with TestClient(app) as client:
        response = start(client)
        answer(client, 0, response)
        assert client.get("/quiz/1").status_code == 200
        response = client.get("/quiz/0")
        reset = client.post("/restart", data={"csrf": csrf(response)})
        assert reset.url.path == "/"
        assert client.get("/result", follow_redirects=False).status_code == 303
        for session in app.state.sessions.values(): session["expires"] = 0
        assert client.get("/quiz/0", follow_redirects=False).headers["location"] == "/?expired=1"
        page = client.get("/?expired=1")
        assert "Сессия завершилась" in page.text
        assert page.headers["cache-control"] == "no-store"
        assert "HttpOnly" in page.headers["set-cookie"] and "SameSite=lax" in page.headers["set-cookie"]
        assert "default-src 'self'" in page.headers["content-security-policy"]
        assert client.get("/missing").status_code == 404


def test_autosave_does_not_advance_and_never_exposes_scores():
    with TestClient(create_app(Settings())) as client:
        response = start(client)
        assert '"score"' not in response.text
        save = client.post("/answer/0?draft=1", data={"csrf": csrf(response), "question_id": "P1", "option_id": "B"})
        assert save.status_code == 204
        assert 'value="B" checked' in client.get("/quiz/0").text


def test_browser_post_keeps_same_origin_without_leaking_external_referrer():
    with TestClient(create_app(Settings())) as client:
        response = client.get("/")
        assert response.headers["referrer-policy"] == "same-origin"
        result = client.post("/start", data={"csrf": csrf(response)}, headers={"Origin": "http://testserver"})
        assert result.status_code == 200 and result.url.path == "/quiz/0"


def test_non_ascii_csrf_is_rejected_not_a_server_error():
    with TestClient(create_app(Settings())) as client:
        start(client)
        assert client.post("/start", data={"csrf": "неверный-код"}).status_code == 403
