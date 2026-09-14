from dataclasses import dataclass

from app.demo_data import TERMINALS
from app.schemas import TerminalBeacon


@dataclass(frozen=True)
class RfAuthResult:
    trust_score: float
    verified: bool
    reasons: list[str]


class RfAuthenticator:
    def verify(self, beacon: TerminalBeacon) -> RfAuthResult:
        profile = TERMINALS.get(beacon.terminal_id)
        if profile is None:
            return RfAuthResult(
                trust_score=0.05,
                verified=False,
                reasons=["Unknown terminal ID"],
            )

        if profile.status != "active":
            return RfAuthResult(
                trust_score=0.1,
                verified=False,
                reasons=["Terminal is not active"],
            )

        penalties: list[float] = []
        reasons: list[str] = []

        frequency_delta = abs(beacon.frequency_ghz - profile.expected_frequency_ghz)
        if frequency_delta > 0.03:
            penalties.append(0.35)
            reasons.append("RF frequency is outside the expected 2.45 GHz band")

        rssi_delta = abs(beacon.rssi_dbm - profile.expected_rssi_dbm)
        if rssi_delta > 8:
            penalties.append(0.25)
            reasons.append("RSSI differs from the enrolled terminal signature")

        path_loss_delta = abs(beacon.path_loss_db - profile.expected_path_loss_db)
        if path_loss_delta > 10:
            penalties.append(0.25)
            reasons.append("Path loss differs from the enrolled near-field profile")

        if beacon.s11_db > profile.max_s11_db:
            penalties.append(0.3)
            reasons.append("Return loss S11 is weaker than the trusted antenna threshold")

        trust_score = max(0.0, 1.0 - sum(penalties))
        verified = trust_score >= 0.7
        if verified:
            reasons.append("Verified RF terminal signature")

        return RfAuthResult(
            trust_score=round(trust_score, 3),
            verified=verified,
            reasons=reasons,
        )

