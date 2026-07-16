"""
PackWise Risk Prediction API — Authentication
================================================
Wraps Supabase Auth (NOT a custom password system). Matches the team's
original flowchart: Admin creates PE/PM accounts (no public self-signup),
users log in with email+password, Admin can reset a user's password.

Endpoints:
    POST /auth/login           - anyone: log in, get an access token
    POST /auth/create-user     - ADMIN ONLY: create a new PE/PM/Admin account
    GET  /auth/me               - anyone with a valid token: who am I / my role
    POST /auth/reset-password  - ADMIN ONLY: reset a user's password

Protecting other endpoints:
    from auth import get_current_user
    @app.post("/predict")
    def predict_from_row(row: ProductRow, user = Depends(get_current_user)):
        ...
"""

import os
import secrets
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

_SUPABASE_URL = os.getenv("SUPABASE_URL")
_SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

_admin_client: Client | None = None
if _SUPABASE_URL and _SUPABASE_SERVICE_KEY:
    _admin_client = create_client(_SUPABASE_URL, _SUPABASE_SERVICE_KEY)

def get_admin_client() -> Client:
    if not _SUPABASE_URL or not _SUPABASE_SERVICE_KEY:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
    return create_client(_SUPABASE_URL, _SUPABASE_SERVICE_KEY)


# ---------------------------------------------------------------------
# Request/response schemas
# ---------------------------------------------------------------------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CreateUserRequest(BaseModel):
    email: EmailStr
    name: str
    role: str  # 'Admin' | 'Packaging Engineer' | 'Product Manager'


class ResetPasswordRequest(BaseModel):
    user_id: str


class ChangePasswordRequest(BaseModel):
    new_password: str


# ---------------------------------------------------------------------
# Dependency: verify the caller's token, get their user + role
# ---------------------------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    if _admin_client is None:
        raise HTTPException(
            status_code=500,
            detail="Supabase not configured on the server.",
        )

    token = credentials.credentials

    try:
        user_response = _admin_client.auth.get_user(token)
        auth_user = user_response.user

        if auth_user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token.",
            )

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token.",
        )

    profile = (
        _admin_client.table("app_user")
        .select("*")
        .eq("user_id", auth_user.id)
        .execute()
    )

    if not profile.data:
        raise HTTPException(
            status_code=404,
            detail="Authenticated, but no matching app_user profile found.",
        )

    return profile.data[0]


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Admin role required for this action.")
    return user


# ---------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------

@router.post("/login")
def login(body: LoginRequest):
    client = get_admin_client()
    try:
        result = client.auth.sign_in_with_password({"email": body.email, "password": body.password})
        return {
            "access_token": result.session.access_token,
            "refresh_token": result.session.refresh_token,
            "user": {"id": result.user.id, "email": result.user.email},
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {e}")


@router.post("/create-user")
def create_user(body: CreateUserRequest, admin: dict = Depends(require_admin)):
    client = get_admin_client()
    try:
        temp_password = secrets.token_urlsafe(9)
        result = client.auth.admin.create_user({
            "email": body.email,
            "password": temp_password,
            "email_confirm": True,
            "user_metadata": {"name": body.name, "role": body.role},
        })
        
        # Explicitly upsert the user into app_user to prevent failures if DB trigger is missing
        try:
            client.table("app_user").upsert({
                "user_id": result.user.id,
                "email": body.email,
                "name": body.name,
                "role": body.role,
                "must_change_password": True
            }).execute()
        except Exception as ue:
            print(f"Warning: app_user upsert failed (might already be handled by trigger): {ue}")

        return {
            "id": result.user.id,
            "email": result.user.email,
            "name": body.name,
            "role": body.role,
            "temporary_password": temp_password,
            "note": "Give this to the new user through your usual offline/chat channel. "
                    "They will be required to set their own new password on first login.",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not create user: {e}")


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return user


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, admin: dict = Depends(require_admin)):
    client = get_admin_client()
    try:
        temp_password = secrets.token_urlsafe(9)
        client.auth.admin.update_user_by_id(body.user_id, {"password": temp_password})
        client.table("app_user").update({"must_change_password": True}).eq("user_id", body.user_id).execute()
        return {
            "status": "password reset",
            "temporary_password": temp_password,
            "note": "Give this to the user through your usual offline/chat channel. "
                    "They will be required to set their own new password on next login.",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not reset password: {e}")


@router.post("/change-password")
def change_password(body: ChangePasswordRequest, user: dict = Depends(get_current_user)):
    client = get_admin_client()
    try:
        client.auth.admin.update_user_by_id(user["user_id"], {"password": body.new_password})
        client.table("app_user").update({"must_change_password": False}).eq("user_id", user["user_id"]).execute()
        return {"status": "password changed"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not change password: {e}")
