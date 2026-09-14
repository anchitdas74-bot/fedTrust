from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from secrets import randbelow, token_urlsafe

from app.schemas import AuthenticatedUser


def generate_otp() -> str:
    """Generate a random 6-digit OTP."""
    return f"{randbelow(900000) + 100000:06d}"


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
        """Create a new login MFA challenge with a random OTP."""
        token = token_urlsafe(24)
        otp = generate_otp()

        self._login_challenges[token] = OtpChallenge(
            subject_id=subject_id,
            otp=otp,
            expires_at=datetime.now(timezone.utc)
            + timedelta(minutes=3),
            attempts_remaining=3,
        )

        # Demo only: print OTP in backend terminal.
        # Production should send this through SMS/email.
        print(f"[DEMO OTP] {subject_id}: {otp}")

        return token

    def verify_login_challenge(
        self,
        token: str,
        otp: str,
    ) -> bool:
        """Verify the login OTP."""
        return self._verify(
            self._login_challenges,
            token,
            otp,
        )

    def create_session(
        self,
        user: AuthenticatedUser,
    ) -> str:
        """Create an authenticated session."""
        access_token = token_urlsafe(32)

        self._sessions[access_token] = user

        return access_token

    def get_session(
        self,
        access_token: str | None,
    ) -> AuthenticatedUser | None:
        """Retrieve a session from an access token."""
        if not access_token:
            return None

        return self._sessions.get(
            access_token.replace("Bearer ", "")
        )

    def delete_session(
        self,
        access_token: str | None,
    ) -> None:
        """Delete an authenticated session."""
        if access_token:
            self._sessions.pop(
                access_token.replace("Bearer ", ""),
                None,
            )

    def create_step_up_challenge(
        self,
        transaction_id: str,
    ) -> str:
        """Create a new step-up verification challenge."""
        token = token_urlsafe(24)
        otp = generate_otp()

        self._step_up_challenges[token] = OtpChallenge(
            subject_id=transaction_id,
            otp=otp,
            expires_at=datetime.now(timezone.utc)
            + timedelta(minutes=2),
            attempts_remaining=3,
        )

        # Demo only: print OTP in backend terminal.
        # Production should send this through SMS/email.
        print(
            f"[DEMO STEP-UP OTP] "
            f"{transaction_id}: {otp}"
        )

        return token

    def verify_step_up_challenge(
        self,
        token: str,
        otp: str,
    ) -> str | None:
        """Verify a transaction step-up OTP."""
        challenge = self._step_up_challenges.get(token)

        if challenge is None:
            return None

        transaction_id = challenge.subject_id

        if not self._verify(
            self._step_up_challenges,
            token,
            otp,
        ):
            return None

        return transaction_id

    @staticmethod
    def _verify(
        challenges: dict[str, OtpChallenge],
        token: str,
        otp: str,
    ) -> bool:
        """Validate an OTP challenge."""
        challenge = challenges.get(token)

        # Challenge doesn't exist.
        if challenge is None:
            return False

        # Challenge has expired.
        if datetime.now(timezone.utc) > challenge.expires_at:
            challenges.pop(token, None)
            return False

        # No attempts remaining.
        if challenge.attempts_remaining <= 0:
            challenges.pop(token, None)
            return False

        # Incorrect OTP.
        if otp != challenge.otp:
            challenge.attempts_remaining -= 1

            if challenge.attempts_remaining <= 0:
                challenges.pop(token, None)

            return False

        # Correct OTP.
        # Invalidate the challenge so it cannot be reused.
        challenges.pop(token, None)

        return True


auth_store = InMemoryAuthStore()