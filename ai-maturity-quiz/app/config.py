import os
import secrets
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urlsplit


def read_environment():
    path = Path(__file__).resolve().parent.parent / ".env"
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip() and not line.lstrip().startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


@dataclass
class Settings:
    secret: str = field(default_factory=lambda: os.getenv("APP_SECRET") or secrets.token_urlsafe(32))
    consultation_url: str = field(default_factory=lambda: os.getenv("CONSULTATION_URL", "https://vk.ru/ndlsky"))
    diagnostic_url: str = field(default_factory=lambda: os.getenv("DIAGNOSTIC_URL", ""))
    site_url: str = field(default_factory=lambda: os.getenv("SITE_URL", "https://nedelsky.pages.dev"))
    ttl_seconds: int = field(default_factory=lambda: int(float(os.getenv("SESSION_TTL_HOURS", "24"))*3600))
    secure_cookie: bool = field(default_factory=lambda: os.getenv("COOKIE_SECURE", "false").lower() == "true")
    max_sessions: int = 5000

    def __post_init__(self):
        if not 1 <= self.ttl_seconds <= 7*24*3600:
            raise ValueError("Session TTL must be between 1 second and 7 days")
        for url in [self.consultation_url, self.diagnostic_url, self.site_url]:
            if url and (urlsplit(url).scheme != "https" or not urlsplit(url).netloc or urlsplit(url).username):
                raise ValueError("Configured public URLs must use HTTPS")
        if self.secure_cookie and not os.getenv("APP_SECRET"):
            raise ValueError("Set APP_SECRET before production launch")
        for flag in ["LEADS_ENABLED", "ANALYTICS_ENABLED"]:
            if os.getenv(flag, "false").lower() == "true":
                raise ValueError(f"{flag} is intentionally unavailable in this MVP")
