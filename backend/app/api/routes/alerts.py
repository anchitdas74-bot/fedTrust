from fastapi import APIRouter, HTTPException, Query

from app.schemas import Alert
from app.services.store import repository

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[Alert])
def list_alerts(
    severity: str | None = Query(default=None),
    terminal_id: str | None = Query(default=None),
    alert_type: str | None = Query(default=None),
) -> list[Alert]:
    alerts = repository.list_alerts()
    if severity:
        alerts = [alert for alert in alerts if alert.severity.value == severity]
    if terminal_id:
        alerts = [alert for alert in alerts if alert.terminal_id == terminal_id]
    if alert_type:
        alerts = [alert for alert in alerts if alert.alert_type == alert_type]
    return alerts


@router.get("/{alert_id}", response_model=Alert)
def get_alert(alert_id: str) -> Alert:
    alert = repository.get_alert(alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str) -> dict[str, bool | str]:
    resolved = repository.resolve_alert(alert_id)
    if not resolved:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"success": True, "message": f"Alert {alert_id} marked as resolved."}

