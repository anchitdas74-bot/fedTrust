from app.demo_data import DEMO_CASES
from app.schemas import Decision, RiskLevel
from app.services.risk_engine import RiskEngine


def test_legitimate_case_is_approved() -> None:
    result = RiskEngine().score(DEMO_CASES[0])

    assert result.risk_level == RiskLevel.LOW
    assert result.decision == Decision.APPROVED
    assert result.rf_trust_score >= 0.7


def test_travel_shift_uses_step_up() -> None:
    result = RiskEngine().score(DEMO_CASES[1])

    assert result.risk_level == RiskLevel.MEDIUM
    assert result.decision == Decision.STEP_UP_VERIFICATION
    assert result.rf_trust_score >= 0.7


def test_credential_attack_is_blocked() -> None:
    result = RiskEngine().score(DEMO_CASES[2])

    assert result.risk_level == RiskLevel.HIGH
    assert result.decision == Decision.BLOCKED
    assert result.rf_trust_score < 0.7


def test_stolen_card_on_legit_terminal_is_not_auto_approved() -> None:
    result = RiskEngine().score(DEMO_CASES[3])

    assert result.risk_level in {RiskLevel.MEDIUM, RiskLevel.HIGH}
    assert result.decision != Decision.APPROVED
    assert result.rf_trust_score >= 0.7
