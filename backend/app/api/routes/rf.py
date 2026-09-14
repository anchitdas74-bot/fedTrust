from fastapi import APIRouter, HTTPException

from app.demo_data import DEMO_CASES, TERMINALS
from app.schemas import RfStatus, TerminalBeacon, TerminalProfile
from app.services.rf_auth import RfAuthenticator

router = APIRouter(prefix="/rf", tags=["rf"])
authenticator = RfAuthenticator()


@router.get("/status", response_model=RfStatus)
def current_rf_status() -> RfStatus:
    beacon = DEMO_CASES[0].terminal
    result = authenticator.verify(beacon)
    return RfStatus(
        current_terminal_id=beacon.terminal_id,
        expected_frequency_ghz=2.45,
        observed_frequency_ghz=beacon.frequency_ghz,
        rssi_dbm=beacon.rssi_dbm,
        path_loss_db=beacon.path_loss_db,
        s11_db=beacon.s11_db,
        vswr=1.28,
        trust_score=result.trust_score,
        verified=result.verified,
        status="available",
    )


@router.get("/terminals", response_model=list[TerminalProfile])
def list_terminals() -> list[TerminalProfile]:
    return list(TERMINALS.values())


@router.get("/terminals/{terminal_id}", response_model=TerminalProfile)
def get_terminal(terminal_id: str) -> TerminalProfile:
    terminal = TERMINALS.get(terminal_id)
    if terminal is None:
        raise HTTPException(status_code=404, detail="Terminal not found")
    return terminal


@router.post("/verify", response_model=RfStatus)
def verify_terminal(beacon: TerminalBeacon) -> RfStatus:
    result = authenticator.verify(beacon)
    return RfStatus(
        current_terminal_id=beacon.terminal_id,
        expected_frequency_ghz=2.45,
        observed_frequency_ghz=beacon.frequency_ghz,
        rssi_dbm=beacon.rssi_dbm,
        path_loss_db=beacon.path_loss_db,
        s11_db=beacon.s11_db,
        vswr=None,
        trust_score=result.trust_score,
        verified=result.verified,
        status="available",
    )

