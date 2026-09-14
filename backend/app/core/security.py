from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe

from app.schemas import AuthenticatedUser


DEMO_OTP = "123456"


@dataclass
class OtpChallenge:
    subject_id: str
    otp: str
    expires_at: datetime
    attempts_remaining: int


class InMemoryAuthStore:
    def __init__(self) -> None:
        self._login_challenges: dict[str, OtpChallenge] = {}
        self._step_up_challenges: dict[str, OtpChallenge] = {}
        self._sessions: dict[str, AuthenticatedUser] = {}

    def create_login_challenge(self, subject_id: str) -> str:
        token = token_urlsafe(24)
        self._login_challenges[token] = OtpChallenge(
            subject_id=subject_id,
            otp=DEMO_OTP,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=3),
            attempts_remaining=3,
        )
        return token

    def verify_login_challenge(self, token: str, otp: str) -> bool:
        return self._verify(self._login_challenges, token, otp)

    def create_session(self, user: AuthenticatedUser) -> str:
        access_token = token_urlsafe(32)
        self._sessions[access_token] = user
        return access_token

    def get_session(self, access_token: str | None) -> AuthenticatedUser | None:
        if not access_token:
            return None
        return self._sessions.get(access_token.replace("Bearer ", ""))

    def delete_session(self, access_token: str | None) -> None:
        if access_token:
            self._sessions.pop(access_token.replace("Bearer ", ""), None)

    def create_step_up_challenge(self, transaction_id: str) -> str:
        token = token_urlsafe(24)
        self._step_up_challenges[token] = OtpChallenge(
            subject_id=transaction_id,
            otp=DEMO_OTP,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=2),
            attempts_remaining=3,
        )
        return token

    def verify_step_up_challenge(self, token: str, otp: str) -> str | None:
        challenge = self._step_up_challenges.get(token)
        if challenge is None:
            return None
        transaction_id = challenge.subject_id
        if not self._verify(self._step_up_challenges, token, otp):
            return None
        return transaction_id

    @staticmethod
    def _verify(challenges: dict[str, OtpChallenge], token: str, otp: str) -> bool:
        challenge = challenges.get(token)
        if challenge is None:
            return False
        if datetime.now(timezone.utc) > challenge.expires_at:
            challenges.pop(token, None)
            return False
        if challenge.attempts_remaining <= 0:
            challenges.pop(token, None)
            return False
        if otp != challenge.otp:
            challenge.attempts_remaining -= 1
            return False
        challenges.pop(token, None)
        return True


auth_store = InMemoryAuthStore()

