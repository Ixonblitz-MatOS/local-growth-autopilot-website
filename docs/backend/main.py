from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from functools import wraps
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from sqlalchemy import DateTime, Integer, String, Text, asc, create_engine, desc, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Mapped, Session, declarative_base, mapped_column, sessionmaker
from werkzeug.security import check_password_hash, generate_password_hash


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def bool_env(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def normalize_email(value: Any) -> str:
    return str(value or "").strip().lower()


def ensure_db_url(url: str) -> str:
    normalized = url.strip()
    if not normalized:
        data_dir = BASE_DIR / "data"
        data_dir.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{(data_dir / 'site.db').as_posix()}"
    if normalized.startswith("postgres://"):
        return normalized.replace("postgres://", "postgresql+psycopg://", 1)
    if normalized.startswith("postgresql://"):
        return normalized.replace("postgresql://", "postgresql+psycopg://", 1)
    return normalized


DATABASE_URL = ensure_db_url(os.environ.get("DATABASE_URL", ""))
ADMIN_EMAIL = normalize_email(os.environ.get("ADMIN_EMAIL", "admin@gavellintelligence.local"))
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "ChangeThisPassword123!")
ADMIN_SESSION_HOURS = max(1, int(os.environ.get("ADMIN_SESSION_HOURS", "12")))
LOGIN_MAX_ATTEMPTS = max(3, int(os.environ.get("LOGIN_MAX_ATTEMPTS", "8")))
LOGIN_WINDOW_MINUTES = max(1, int(os.environ.get("LOGIN_WINDOW_MINUTES", "15")))
LOGIN_LOCKOUT_MINUTES = max(1, int(os.environ.get("LOGIN_LOCKOUT_MINUTES", "20")))


engine = create_engine(
    DATABASE_URL,
    future=True,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite:///") else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False, class_=Session)
Base = declarative_base()


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    created_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=now_utc)


class ContactRequest(Base):
    __tablename__ = "contact_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(80), nullable=False, default="")
    company: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    service_interest: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="new", index=True)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=now_utc, index=True)
    updated_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=now_utc, onupdate=now_utc)


class SectionView(Base):
    __tablename__ = "section_views"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    section_name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    view_duration_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    viewport_percentage: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    session_id: Mapped[str] = mapped_column(String(120), nullable=False, default="", index=True)
    device_type: Mapped[str] = mapped_column(String(40), nullable=False, default="")
    referrer: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=now_utc, index=True)
    updated_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=now_utc, onupdate=now_utc)


class SiteSetting(Base):
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    setting_key: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    setting_value: Mapped[str] = mapped_column(Text, nullable=False, default="")
    setting_group: Mapped[str] = mapped_column(String(120), nullable=False, default="general", index=True)
    created_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=now_utc, index=True)
    updated_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=now_utc, onupdate=now_utc)


def parse_cors_origins() -> list[str]:
    raw = os.environ.get("CORS_ORIGINS", "http://127.0.0.1:5173,http://localhost:5173")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "change-me-in-production")
app.config["SESSION_COOKIE_NAME"] = os.environ.get("SESSION_COOKIE_NAME", "gavell_admin_session")
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = os.environ.get("SESSION_COOKIE_SAMESITE", "Lax")
app.config["SESSION_COOKIE_SECURE"] = bool_env("SESSION_COOKIE_SECURE", False)
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=ADMIN_SESSION_HOURS)

CORS(
    app,
    supports_credentials=True,
    origins=parse_cors_origins(),
    resources={
        r"/api/.*": {"origins": parse_cors_origins()},
        r"/health": {"origins": parse_cors_origins()},
        r"/": {"origins": parse_cors_origins()},
    },
)


failed_login_attempts: dict[str, list[datetime]] = {}
login_lockouts: dict[str, datetime] = {}


def login_scope_keys(email: str, client_ip: str) -> list[str]:
    return [f"email:{email}", f"ip:{client_ip}"]


def prune_login_limits(now: datetime) -> None:
    cutoff = now - timedelta(minutes=LOGIN_WINDOW_MINUTES)
    for scope, attempts in list(failed_login_attempts.items()):
        fresh = [ts for ts in attempts if ts >= cutoff]
        if fresh:
            failed_login_attempts[scope] = fresh
        else:
            failed_login_attempts.pop(scope, None)

    for scope, lock_until in list(login_lockouts.items()):
        if lock_until <= now:
            login_lockouts.pop(scope, None)


def get_remaining_lockout_seconds(email: str, client_ip: str) -> int:
    now = now_utc()
    prune_login_limits(now)
    remaining = 0
    for scope in login_scope_keys(email, client_ip):
        lock_until = login_lockouts.get(scope)
        if lock_until and lock_until > now:
            remaining = max(remaining, int((lock_until - now).total_seconds()))
    return remaining


def record_failed_login(email: str, client_ip: str) -> None:
    now = now_utc()
    prune_login_limits(now)
    lock_until = now + timedelta(minutes=LOGIN_LOCKOUT_MINUTES)
    for scope in login_scope_keys(email, client_ip):
        bucket = failed_login_attempts.setdefault(scope, [])
        bucket.append(now)
        if len(bucket) >= LOGIN_MAX_ATTEMPTS:
            login_lockouts[scope] = lock_until


def clear_failed_login(email: str, client_ip: str) -> None:
    for scope in login_scope_keys(email, client_ip):
        failed_login_attempts.pop(scope, None)
        login_lockouts.pop(scope, None)


def dt_to_iso(value: datetime | None) -> str | None:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.isoformat()


def serialize_contact(row: ContactRequest) -> dict[str, Any]:
    return {
        "id": row.id,
        "full_name": row.full_name,
        "email": row.email,
        "phone": row.phone,
        "company": row.company,
        "service_interest": row.service_interest,
        "message": row.message,
        "status": row.status,
        "notes": row.notes,
        "created_date": dt_to_iso(row.created_date),
        "updated_date": dt_to_iso(row.updated_date),
    }


def serialize_section_view(row: SectionView) -> dict[str, Any]:
    return {
        "id": row.id,
        "section_name": row.section_name,
        "view_duration_ms": row.view_duration_ms,
        "viewport_percentage": row.viewport_percentage,
        "session_id": row.session_id,
        "device_type": row.device_type,
        "referrer": row.referrer,
        "created_date": dt_to_iso(row.created_date),
        "updated_date": dt_to_iso(row.updated_date),
    }


def serialize_site_setting(row: SiteSetting) -> dict[str, Any]:
    return {
        "id": row.id,
        "setting_key": row.setting_key,
        "setting_value": row.setting_value,
        "setting_group": row.setting_group,
        "created_date": dt_to_iso(row.created_date),
        "updated_date": dt_to_iso(row.updated_date),
    }


def require_admin(handler):
    @wraps(handler)
    def wrapped(*args, **kwargs):
        if not session.get("admin_user_id"):
            return jsonify({"error": "Authentication required."}), 401
        return handler(*args, **kwargs)

    return wrapped


def get_sort_expression(model: Any, sort: str, allowed: set[str], default_field: str = "created_date"):
    sort_value = sort or f"-{default_field}"
    is_desc = sort_value.startswith("-")
    field = sort_value[1:] if is_desc else sort_value
    if field not in allowed:
        field = default_field
        is_desc = True
    column = getattr(model, field)
    return desc(column) if is_desc else asc(column)


def parse_limit(raw_limit: str | None, default: int = 100, max_limit: int = 2000) -> int:
    try:
        value = int(raw_limit or default)
    except ValueError:
        value = default
    return max(1, min(max_limit, value))


def init_db() -> None:
    Base.metadata.create_all(engine)

    with SessionLocal() as db:
        existing = db.scalar(select(AdminUser).where(AdminUser.email == ADMIN_EMAIL))
        if existing:
            existing.password_hash = generate_password_hash(ADMIN_PASSWORD)
        else:
            db.add(
                AdminUser(
                    email=ADMIN_EMAIL,
                    password_hash=generate_password_hash(ADMIN_PASSWORD),
                )
            )
        db.commit()


@app.get("/")
def root():
    return jsonify({"ok": True, "service": "gavell-intelligence-api"})


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.get("/api/auth/session")
def auth_session():
    user_id = session.get("admin_user_id")
    admin_email = session.get("admin_email")
    if not user_id or not admin_email:
        return jsonify({"authenticated": False}), 401
    return jsonify({"authenticated": True, "user": {"id": user_id, "email": admin_email}})


@app.post("/api/auth/login")
def auth_login():
    payload = request.get_json(silent=True) or {}
    email = normalize_email(payload.get("email"))
    password = str(payload.get("password") or "")
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown").split(",")[0].strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    remaining = get_remaining_lockout_seconds(email, client_ip)
    if remaining > 0:
        return jsonify({"error": "Too many login attempts. Try again later.", "retry_after_seconds": remaining}), 429

    with SessionLocal() as db:
        user = db.scalar(select(AdminUser).where(AdminUser.email == email))
        if not user or not check_password_hash(user.password_hash, password):
            record_failed_login(email, client_ip)
            return jsonify({"error": "Invalid email or password."}), 401

    clear_failed_login(email, client_ip)
    session.clear()
    session.permanent = True
    session["admin_user_id"] = user.id
    session["admin_email"] = user.email
    return jsonify({"ok": True, "user": {"id": user.id, "email": user.email}})


@app.post("/api/auth/logout")
def auth_logout():
    session.clear()
    return jsonify({"ok": True})


@app.post("/api/contact-requests")
def create_contact_request():
    payload = request.get_json(silent=True) or {}
    full_name = str(payload.get("full_name") or "").strip()
    email = str(payload.get("email") or "").strip()
    message = str(payload.get("message") or "").strip()

    if not full_name or not email or not message:
        return jsonify({"error": "full_name, email, and message are required."}), 400

    row = ContactRequest(
        full_name=full_name,
        email=email,
        phone=str(payload.get("phone") or "").strip(),
        company=str(payload.get("company") or "").strip(),
        service_interest=str(payload.get("service_interest") or "").strip(),
        message=message,
        status=str(payload.get("status") or "new").strip() or "new",
        notes=str(payload.get("notes") or "").strip(),
    )

    with SessionLocal() as db:
        db.add(row)
        db.commit()
        db.refresh(row)

    return jsonify({"ok": True, "item": serialize_contact(row)}), 201


@app.post("/api/section-views")
def create_section_view():
    payload = request.get_json(silent=True) or {}
    section_name = str(payload.get("section_name") or "").strip()
    if not section_name:
        return jsonify({"error": "section_name is required."}), 400

    row = SectionView(
        section_name=section_name,
        view_duration_ms=max(0, int(payload.get("view_duration_ms") or 0)),
        viewport_percentage=max(0, min(100, int(payload.get("viewport_percentage") or 0))),
        session_id=str(payload.get("session_id") or "").strip(),
        device_type=str(payload.get("device_type") or "").strip(),
        referrer=str(payload.get("referrer") or "").strip(),
    )

    with SessionLocal() as db:
        db.add(row)
        db.commit()
        db.refresh(row)

    return jsonify({"ok": True, "item": serialize_section_view(row)}), 201


@app.get("/api/admin/contact-requests")
@require_admin
def list_contact_requests():
    sort = request.args.get("sort", "-created_date")
    limit = parse_limit(request.args.get("limit"), default=200, max_limit=2000)
    allowed = {"created_date", "updated_date", "status", "full_name", "email"}
    order = get_sort_expression(ContactRequest, sort, allowed)

    with SessionLocal() as db:
        rows = db.scalars(select(ContactRequest).order_by(order).limit(limit)).all()
    return jsonify({"items": [serialize_contact(row) for row in rows]})


@app.patch("/api/admin/contact-requests/<int:contact_id>")
@require_admin
def update_contact_request(contact_id: int):
    payload = request.get_json(silent=True) or {}
    allowed_fields = {"full_name", "email", "phone", "company", "service_interest", "message", "status", "notes"}
    status_values = {"new", "contacted", "in_progress", "closed"}

    with SessionLocal() as db:
        row = db.get(ContactRequest, contact_id)
        if row is None:
            return jsonify({"error": "Contact request not found."}), 404

        for key, value in payload.items():
            if key not in allowed_fields:
                continue
            text_value = str(value or "").strip()
            if key == "status":
                if text_value not in status_values:
                    return jsonify({"error": "Unsupported status value."}), 400
                setattr(row, key, text_value)
            else:
                setattr(row, key, text_value)

        row.updated_date = now_utc()
        db.commit()
        db.refresh(row)

    return jsonify({"ok": True, "item": serialize_contact(row)})


@app.delete("/api/admin/contact-requests/<int:contact_id>")
@require_admin
def delete_contact_request(contact_id: int):
    with SessionLocal() as db:
        row = db.get(ContactRequest, contact_id)
        if row is None:
            return jsonify({"error": "Contact request not found."}), 404
        db.delete(row)
        db.commit()
    return jsonify({"ok": True})


@app.get("/api/admin/section-views")
@require_admin
def list_section_views():
    sort = request.args.get("sort", "-created_date")
    limit = parse_limit(request.args.get("limit"), default=1000, max_limit=5000)
    allowed = {"created_date", "updated_date", "section_name", "view_duration_ms", "viewport_percentage"}
    order = get_sort_expression(SectionView, sort, allowed)

    with SessionLocal() as db:
        rows = db.scalars(select(SectionView).order_by(order).limit(limit)).all()
    return jsonify({"items": [serialize_section_view(row) for row in rows]})


@app.get("/api/admin/site-settings")
@require_admin
def list_site_settings():
    sort = request.args.get("sort", "setting_key")
    limit = parse_limit(request.args.get("limit"), default=1000, max_limit=5000)
    allowed = {"created_date", "updated_date", "setting_key", "setting_group"}
    order = get_sort_expression(SiteSetting, sort, allowed, default_field="setting_key")

    with SessionLocal() as db:
        rows = db.scalars(select(SiteSetting).order_by(order).limit(limit)).all()
    return jsonify({"items": [serialize_site_setting(row) for row in rows]})


@app.post("/api/admin/site-settings")
@require_admin
def create_site_setting():
    payload = request.get_json(silent=True) or {}
    setting_key = str(payload.get("setting_key") or "").strip()
    if not setting_key:
        return jsonify({"error": "setting_key is required."}), 400

    row = SiteSetting(
        setting_key=setting_key,
        setting_value=str(payload.get("setting_value") or "").strip(),
        setting_group=str(payload.get("setting_group") or "general").strip() or "general",
    )

    with SessionLocal() as db:
        db.add(row)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            return jsonify({"error": "A setting with this key already exists."}), 409
        db.refresh(row)

    return jsonify({"ok": True, "item": serialize_site_setting(row)}), 201


@app.patch("/api/admin/site-settings/<int:setting_id>")
@require_admin
def update_site_setting(setting_id: int):
    payload = request.get_json(silent=True) or {}
    allowed_fields = {"setting_key", "setting_value", "setting_group"}

    with SessionLocal() as db:
        row = db.get(SiteSetting, setting_id)
        if row is None:
            return jsonify({"error": "Site setting not found."}), 404

        for key, value in payload.items():
            if key in allowed_fields:
                setattr(row, key, str(value or "").strip())

        row.updated_date = now_utc()
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            return jsonify({"error": "A setting with this key already exists."}), 409
        db.refresh(row)

    return jsonify({"ok": True, "item": serialize_site_setting(row)})


@app.delete("/api/admin/site-settings/<int:setting_id>")
@require_admin
def delete_site_setting(setting_id: int):
    with SessionLocal() as db:
        row = db.get(SiteSetting, setting_id)
        if row is None:
            return jsonify({"error": "Site setting not found."}), 404
        db.delete(row)
        db.commit()
    return jsonify({"ok": True})


init_db()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
