import hashlib
import hmac
import secrets
import threading
import time
from pathlib import Path
from urllib.parse import parse_qsl

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import Settings, read_environment
from .content import DIMENSIONS, GATE_TEXT, GOALS, LEVELS, ROLE_CONTEXT, TRANSITIONS
from .questions import ALL_QUESTIONS, CHAPTERS, public_question
from .scoring import evaluate

ROOT = Path(__file__).resolve().parent
COOKIE = "nedelsky_quiz_session"


def create_app(settings=None):
    settings = settings or Settings()
    application = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
    application.mount("/static", StaticFiles(directory=ROOT / "static"), name="static")
    templates = Jinja2Templates(directory=ROOT / "templates")
    sessions = application.state.sessions = {}
    lock = threading.RLock()

    def sign(sid):
        return hmac.new(settings.secret.encode(), sid.encode(), hashlib.sha256).hexdigest()

    def session_for(request):
        value = request.cookies.get(COOKIE, "")
        if len(value) > 200 or not value.isascii() or "." not in value: return None
        sid, signature = value.split(".", 1)
        if not hmac.compare_digest(sign(sid), signature): return None
        with lock:
            session = sessions.get(sid)
            if session and session["expires"] <= time.time():
                sessions.pop(sid, None)
                return None
            return session

    def new_session():
        now = time.time()
        with lock:
            for key in [key for key, value in sessions.items() if value["expires"] <= now]: sessions.pop(key)
            if len(sessions) >= settings.max_sessions:
                raise HTTPException(503, "Сейчас много активных сессий. Попробуйте немного позже.")
            sid = secrets.token_urlsafe(32)
            session = {"id": sid, "expires": now + settings.ttl_seconds, "csrf": secrets.token_urlsafe(32), "answers": {}, "started": False, "writes": []}
            sessions[sid] = session
            return session

    def first_missing(session):
        return next((i for i, q in enumerate(ALL_QUESTIONS) if q["id"] not in session["answers"]), 19)

    def redirect(path): return RedirectResponse(path, status_code=303)

    def render(request, template, session=None, status=200, **context):
        return templates.TemplateResponse(request=request, name=template,
            context={"settings": settings, "session": session, "chapters": CHAPTERS, **context}, status_code=status)

    async def form_data(request):
        if request.headers.get("sec-fetch-site") == "cross-site": raise HTTPException(403, "Откройте тест в этой вкладке и повторите действие.")
        origin = request.headers.get("origin")
        if origin and origin != str(request.base_url).rstrip("/"): raise HTTPException(403, "Запрос с другого сайта отклонён.")
        body = bytearray()
        async for chunk in request.stream():
            body.extend(chunk)
            if len(body) > 4096: raise HTTPException(413, "Слишком большой запрос. Выберите один из предложенных ответов.")
        if request.headers.get("content-type", "").split(";")[0] != "application/x-www-form-urlencoded":
            raise HTTPException(415, "Используйте кнопки и варианты ответа на странице теста.")
        try:
            pairs = parse_qsl(body.decode("utf-8"), keep_blank_values=True, strict_parsing=True, max_num_fields=8)
        except (ValueError, UnicodeError): raise HTTPException(422, "Не удалось прочитать ответ. Попробуйте ещё раз.")
        if len(dict(pairs)) != len(pairs): raise HTTPException(422, "Выберите ровно один ответ.")
        return dict(pairs)

    async def checked_post(request):
        data = await form_data(request)
        session = session_for(request)
        if not session: return None, data
        if not hmac.compare_digest(data.get("csrf", "").encode("utf-8"), session["csrf"].encode("utf-8")):
            raise HTTPException(403, "Защитный код устарел. Обновите страницу и повторите действие.")
        now = time.time()
        session["writes"] = [t for t in session["writes"] if now - t < 60]
        if len(session["writes"]) >= 120: raise HTTPException(429, "Слишком много действий подряд. Подождите минуту.")
        session["writes"].append(now)
        return session, data

    @application.middleware("http")
    async def security_headers(request, call_next):
        response = await call_next(request)
        response.headers.update({"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin",
            "X-Frame-Options": "DENY", "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
            "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'"})
        if settings.secure_cookie: response.headers["Strict-Transport-Security"] = "max-age=31536000"
        return response

    @application.exception_handler(StarletteHTTPException)
    async def error_page(request, exception):
        return render(request, "error.html", status=exception.status_code, message=exception.detail)

    @application.get("/health")
    async def health(): return {"status": "ok"}

    @application.get("/", response_class=HTMLResponse)
    async def index(request: Request):
        session = session_for(request)
        fresh = session is None
        session = session or new_session()
        response = render(request, "index.html", session, expired=request.query_params.get("expired") == "1", resume=first_missing(session), title="Насколько эффективно вы используете ИИ?")
        if fresh:
            response.set_cookie(COOKIE, f'{session["id"]}.{sign(session["id"])}', max_age=settings.ttl_seconds,
                httponly=True, secure=settings.secure_cookie, samesite="lax")
        return response

    @application.post("/start")
    async def start(request: Request):
        session, data = await checked_post(request)
        if not session: return redirect("/?expired=1")
        if set(data) != {"csrf"}: raise HTTPException(422, "Лишние данные запроса.")
        session["started"] = True
        step = first_missing(session)
        return redirect(f"/quiz/{step}" if step < 19 else "/result")

    def question_page(request, session, step, error=None):
        q = ALL_QUESTIONS[step]
        return render(request, "question.html", session, status=422 if error else 200, q=public_question(q), step=step,
            selected=session["answers"].get(q["id"]), chapter=(step-3)//4 if step >= 3 else -1,
            progress=max(0, step-3), error=error, title=q["text"], focus=True)

    @application.get("/quiz/{step}")
    async def quiz(request: Request, step: int):
        if not 0 <= step < 19: raise HTTPException(404, "Такого вопроса нет.")
        session = session_for(request)
        if not session: return redirect("/?expired=1")
        if not session["started"]: return redirect("/")
        missing = first_missing(session)
        if step > missing: return redirect(f"/quiz/{missing}")
        return question_page(request, session, step)

    @application.post("/answer/{step}")
    async def answer(request: Request, step: int):
        if not 0 <= step < 19: raise HTTPException(404, "Такого вопроса нет.")
        session, data = await checked_post(request)
        if not session: return redirect("/?expired=1")
        if not session["started"]: return redirect("/")
        missing = first_missing(session)
        if step > missing: return redirect(f"/quiz/{missing}")
        q = ALL_QUESTIONS[step]
        if set(data) != {"csrf", "question_id", "option_id"} or data.get("question_id") != q["id"]:
            return question_page(request, session, step, "Ответ не сохранён: используйте один из вариантов этого вопроса.")
        if data["option_id"] not in {o["id"] for o in q["options"]}:
            return question_page(request, session, step, "Выберите один ответ, чтобы продолжить.")
        with lock: session["answers"][q["id"]] = data["option_id"]
        if request.query_params.get("draft") == "1": return Response(status_code=204)
        if step == 18: return redirect("/result")
        if step in [6, 10, 14]: return redirect(f"/chapter/{[6, 10, 14].index(step)+1}")
        return redirect(f"/quiz/{step+1}")

    @application.get("/chapter/{number}")
    async def chapter(request: Request, number: int):
        if not 1 <= number <= 3: raise HTTPException(404, "Такой главы нет.")
        session = session_for(request)
        if not session: return redirect("/?expired=1")
        step = 3 + number*4
        missing = first_missing(session)
        if missing < step: return redirect(f"/quiz/{missing}")
        return render(request, "chapter.html", session, number=number, next_step=step, transition=TRANSITIONS[number-1], title=TRANSITIONS[number-1][0], focus=True)

    @application.get("/result")
    async def result(request: Request):
        session = session_for(request)
        if not session: return redirect("/?expired=1")
        missing = first_missing(session)
        if missing < 19: return redirect(f"/quiz/{missing}")
        result = evaluate(session["answers"])
        level = LEVELS[result["level"]]
        return render(request, "result.html", session, result=result, level=level, dimensions=DIMENSIONS, gate_text=GATE_TEXT,
            goal=GOALS[session["answers"]["P2"]], role_context=ROLE_CONTEXT[session["answers"]["P1"]],
            product_url=f'{settings.site_url.rstrip("/")}/ai-for-business/?product={level["slug"]}#details-{level["slug"]}',
            title="Ваша карта работы с ИИ", focus=True)

    @application.post("/restart")
    async def restart(request: Request):
        session, data = await checked_post(request)
        if not session: return redirect("/?expired=1")
        if set(data) != {"csrf"}: raise HTTPException(422, "Лишние данные запроса.")
        with lock: sessions.pop(session["id"], None)
        response = redirect("/")
        response.delete_cookie(COOKIE, httponly=True, secure=settings.secure_cookie, samesite="lax")
        return response

    return application


read_environment()
app = create_app()
