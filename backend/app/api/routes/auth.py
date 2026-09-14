from fastapi import APIRouter, Header, HTTPException

from app.core.security import DEMO_OTP, auth_store
from app.demo_data import TERMINALS
from app.schemas import (
    AuthSession,
    AuthenticatedUser,
    LoginChallenge,
    LoginRequest,
    OtpVerifyRequest,
    ResendOtpRequest,
    SessionStatus,
)

router = APIRouter(prefix="/auth", tags=["auth"])

DEMO_USERS = {
    ("BANK-A", "analyst"): {
        "password": "fedtrust123",
        "user": AuthenticatedUser(
            user_id="user-001",
            username="analyst",
            institution_id="BANK-A",
            institution_name="Bank A Fraud Operations",
            role="fraud_analyst",
        ),
    }
}


@router.post("/login", response_model=LoginChallenge)
def login(payload: LoginRequest) -> LoginChallenge:
    user_record = DEMO_USERS.get((payload.institution_id, payload.username))
    if user_record is None or payload.password != user_record["password"]:
        raise HTTPException(status_code=401, detail="Invalid institution ID, username, or password")
    if payload.terminal_id not in TERMINALS:
        raise HTTPException(status_code=403, detail="Terminal is not enrolled")

    mfa_token = auth_store.create_login_challenge(f"{payload.institution_id}:{payload.username}")
    return LoginChallenge(
        mfa_token=mfa_token,
        expires_in_seconds=180,
        masked_destination="+91 ******1042",
        status="otp_required",
    )


@router.post("/verify-otp", response_model=AuthSession)
def verify_otp(payload: OtpVerifyRequest) -> AuthSession:
    if not auth_store.verify_login_challenge(payload.mfa_token, payload.otp):
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    user = DEMO_USERS[("BANK-A", "analyst")]["user"]
    access_token = auth_store.create_session(user)
    return AuthSession(access_token=access_token, expires_in_seconds=3600, user=user)


@router.post("/resend-otp", response_model=LoginChallenge)
def resend_otp(payload: ResendOtpRequest) -> LoginChallenge:
    mfa_token = auth_store.create_login_challenge("BANK-A:analyst")
    return LoginChallenge(
        mfa_token=mfa_token,
        expires_in_seconds=180,
        masked_destination="+91 ******1042",
        status="otp_required",
    )


@router.get("/session", response_model=SessionStatus)
def session(authorization: str | None = Header(default=None)) -> SessionStatus:
    user = auth_store.get_session(authorization)
    return SessionStatus(authenticated=user is not None, user=user)


@router.post("/logout")
def logout(authorization: str | None = Header(default=None)) -> dict[str, str]:
    auth_store.delete_session(authorization)
    return {"status": "logged_out"}


@router.get("/demo-credentials")
def demo_credentials() -> dict[str, str]:
    return {
        "institution_id": "BANK-A",
        "username": "analyst",
        "password": "fedtrust123",
        "otp": DEMO_OTP,
        "terminal_id": "POS-MUM-001",
    }
