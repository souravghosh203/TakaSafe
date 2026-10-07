"""Database-free demo API endpoints shared by the React dashboard and FastAPI."""

from __future__ import annotations

import asyncio
import json
import uuid
from datetime import datetime
from typing import Any, AsyncIterator, Dict, Iterable, Optional

from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

from backend.services.demo_state import DemoState, demo_state, utc_now


router = APIRouter(prefix="/api", tags=["Database-Free Demo"])
ALLOWED_DECISIONS = {"ALLOW", "MONITOR", "HOLD_FOR_REVIEW", "FREEZE_WALLET"}
ALLOWED_ACTIONS = ALLOWED_DECISIONS | {"DISPATCH_FLOAT", "ACTIVATE_MONITORING", "DISMISSED", "ADDITIONAL_VERIFICATION"}


class OperatorDecisionRequest(BaseModel):
    transaction_id: str = Field(min_length=1, max_length=128)
    decision: str
    operator_id: str = Field(min_length=1, max_length=128)
    reason: str = Field(min_length=1, max_length=1000)


class CustomerTransactionRequest(BaseModel):
    wallet: str = Field(min_length=1, max_length=64)
    amount: float = Field(gt=0, le=10_000_000)
    recipient: str = Field(min_length=1, max_length=128)
    timestamp: Optional[str] = None
    reference: str = Field(default="", max_length=256)
    status: str = "COMPLETED"
    riskScore: float = Field(default=0, ge=0, le=100)
    serviceType: str = "SEND_MONEY"
    direction: str = "OUT"
    fee: float = Field(default=0, ge=0)


def state(request: Request) -> DemoState:
    return getattr(request.app.state, "demo_state", demo_state)


def _flatten_values(value: Any) -> Iterable[Any]:
    if isinstance(value, dict):
        for nested in value.values():
            yield from _flatten_values(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from _flatten_values(nested)
    else:
        yield value


def _sse_frame(event: Dict[str, Any]) -> str:
    if "comment" in event:
        return f": {event['comment']}\n\n"
    lines = []
    if event.get("id"):
        lines.append(f"id: {event['id']}")
    lines.append(f"event: {event['event']}")
    lines.append("data: " + json.dumps(event["data"], separators=(",", ":")))
    return "\n".join(lines) + "\n\n"


@router.get("/health")
def health(request: Request) -> Dict[str, Any]:
    model = getattr(request.app.state, "model_service", None)
    return {
        "status": "ok",
        "backend": True,
        "ml_model": bool(model and model.is_loaded),
        "storage": "database-free",
        "storage_mode": "Database-Free Demo",
        "data_source": "synthetic-demo",
        "event_stream": True,
        "audit_log_persistence": state(request).persistence_available,
        "timestamp": utc_now(),
    }


@router.get("/model/info")
def model_info(request: Request) -> Dict[str, Any]:
    model = getattr(request.app.state, "model_service", None)
    return {
        "model": "ScamShield XGBoost",
        "version": "demo-local-artifact",
        "source": "LOCAL_MODEL_ARTIFACT",
        "dataset": "SYNTHETIC_DEMO_DATA",
        "database_required": False,
        "loaded": bool(model and model.is_loaded),
        "model_type": getattr(model, "model_type", "UNAVAILABLE"),
    }


@router.get("/transactions")
def transactions(request: Request) -> Dict[str, Any]:
    rows = sorted(state(request).transactions.values(), key=lambda item: item.get("timestamp", ""), reverse=True)
    return {"label": "Synthetic Demo Data", "transactions": rows}


@router.get("/transactions/{transaction_id}")
def transaction(transaction_id: str, request: Request) -> Dict[str, Any]:
    row = state(request).transactions.get(transaction_id)
    if not row:
        raise HTTPException(status_code=404, detail="Demo transaction not found")
    return row


@router.post("/transactions", status_code=201)
def create_transaction(payload: CustomerTransactionRequest, request: Request) -> Dict[str, Any]:
    if payload.status not in {"COMPLETED", "PROCEEDED", "HELD"} or payload.direction not in {"IN", "OUT"}:
        raise HTTPException(status_code=422, detail="Unsupported demo transaction status or direction")
    timestamp = payload.timestamp or utc_now()
    try:
        datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    except ValueError as error:
        raise HTTPException(status_code=422, detail="timestamp must be ISO-8601") from error
    app_state = state(request)
    transaction_id = f"TXN-RUNTIME-{uuid.uuid4().hex[:10].upper()}"
    row = {
        "id": transaction_id,
        "user_id": payload.wallet,
        "wallet": payload.wallet,
        "amount": payload.amount,
        "recipient": payload.recipient,
        "timestamp": timestamp,
        "reference": payload.reference,
        "status": payload.status,
        "risk_score": payload.riskScore,
        "service_type": payload.serviceType,
        "direction": payload.direction,
        "fee": payload.fee,
        "is_threat": False,
        "source": "DEMO_RUNTIME",
    }
    app_state.transactions[transaction_id] = row
    app_state.publish("transaction_created", {"transaction_id": transaction_id, "source": "DEMO_RUNTIME"})
    return {"success": True, "transaction": row, "source": "DEMO_RUNTIME"}


@router.post("/watchlist/screen")
async def screen_watchlist(request: Request) -> Dict[str, Any]:
    payload = await request.json()
    result = state(request).screen_watchlist(_flatten_values(payload))
    return result


@router.get("/events")
async def events(request: Request, last_event_id: Optional[str] = Header(default=None, alias="Last-Event-ID")) -> StreamingResponse:
    async def stream() -> AsyncIterator[str]:
        async for item in state(request).event_stream(last_event_id):
            if await request.is_disconnected():
                break
            yield _sse_frame(item)

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/demo/reset")
def reset_demo(request: Request) -> Dict[str, Any]:
    state(request).reset()
    return {
        "success": True,
        "storage": "database-free",
        "message": "Synthetic seed data has been reloaded into runtime memory.",
        "audit_log_persistence": state(request).persistence_available,
    }


@router.post("/operator/decision")
def operator_decision(payload: OperatorDecisionRequest, request: Request) -> Dict[str, Any]:
    decision = payload.decision.upper()
    if decision not in ALLOWED_DECISIONS:
        raise HTTPException(status_code=422, detail="Unsupported operator decision")
    app_state = state(request)
    decision_id = f"DEC-{uuid.uuid4().hex[:10].upper()}"
    app_state.operator_decisions[decision_id] = {
        "decision_id": decision_id,
        "transaction_id": payload.transaction_id,
        "decision": decision,
        "operator_id": payload.operator_id,
        "reason": payload.reason,
        "timestamp": utc_now(),
    }
    entry = app_state.record_audit(
        actor=payload.operator_id,
        action=decision,
        transaction_id=payload.transaction_id,
        decision=decision,
        reason=payload.reason,
        model_version="ScamShield XGBoost demo",
        extras={"entityType": "TRANSACTION", "caseId": f"CASE-{payload.transaction_id}"},
    )
    if payload.transaction_id in app_state.transactions:
        app_state.transactions[payload.transaction_id]["status"] = "BLOCKED" if decision == "FREEZE_WALLET" else "HELD" if decision == "HOLD_FOR_REVIEW" else "APPROVED"
    return {
        "success": True,
        "decision_id": decision_id,
        "requires_human_authorization": True,
        "audit_recorded": True,
        "audit_persistence_available": app_state.persistence_available,
        "audit_entry": entry,
    }


@router.get("/audit-logs")
def audit_logs(request: Request) -> Dict[str, Any]:
    return {"success": True, "logs": state(request).audit_events, "persistence_available": state(request).persistence_available}


@router.post("/audit-action")
async def audit_action(request: Request) -> Dict[str, Any]:
    payload = await request.json()
    action = str(payload.get("actionTaken", "")).upper()
    case_id = str(payload.get("caseId", "")).strip()
    if not case_id or action not in ALLOWED_ACTIONS:
        raise HTTPException(status_code=422, detail="A case ID and supported human action are required")
    entry = state(request).record_audit(
        actor=str(payload.get("analyst") or "Demo Operator"),
        action=action,
        transaction_id=str(payload.get("entityId") or "N/A"),
        decision=action,
        reason=str(payload.get("reason") or "Manual demo operator action"),
        model_version="ScamShield XGBoost demo",
        extras={
            "caseId": case_id,
            "entityType": str(payload.get("entityType") or "TRANSACTION"),
            "riskScore": min(100, max(0, float(payload.get("riskScore", 50)))),
            "notes": str(payload.get("notes") or "Logged through the human-in-the-loop demo."),
        },
    )
    return {"success": True, "entry": entry, "totalLogs": len(state(request).audit_events)}


@router.get("/suspicious-transactions")
def suspicious_transactions(request: Request) -> Dict[str, Any]:
    rows = [row for row in state(request).transactions.values() if row.get("is_threat")]
    return {"success": True, "transactions": rows, "source": "SYNTHETIC_AND_DEMO_RUNTIME"}


@router.get("/customer-history/{wallet}")
def customer_history(wallet: str, request: Request) -> Dict[str, Any]:
    if not wallet or len(wallet) > 64:
        raise HTTPException(status_code=422, detail="Invalid demo customer identity")
    rows = []
    for row in state(request).transactions.values():
        if row.get("user_id") == wallet or row.get("wallet") == wallet:
            rows.append({
                "amount": row["amount"], "recipient": row["recipient"], "timestamp": row["timestamp"],
                "reference": row.get("reference", ""), "status": row["status"], "riskScore": row.get("risk_score", 0),
                "serviceType": row.get("service_type", "SEND_MONEY"), "direction": row.get("direction", "OUT"), "fee": row.get("fee", 0),
                "source": row.get("source", "SYNTHETIC"),
            })
    return {"success": True, "history": sorted(rows, key=lambda item: item["timestamp"], reverse=True)}


@router.post("/customer-history/{wallet}")
def add_customer_history(wallet: str, payload: CustomerTransactionRequest, request: Request) -> Dict[str, Any]:
    if payload.wallet != wallet:
        raise HTTPException(status_code=422, detail="Path and payload wallet must match")
    return create_transaction(payload, request)


@router.get("/recipient-risk/{recipient}")
def recipient_risk(recipient: str, request: Request) -> Dict[str, Any]:
    app_state = state(request)
    screened = app_state.screen_watchlist([recipient])
    inbound = [row for row in app_state.transactions.values() if app_state._normalise_identity(row.get("recipient")) == app_state._normalise_identity(recipient)]
    reasons = []
    score = 0
    if screened["match"]:
        score += 40
        reasons.append("Recipient appears in the synthetic demo watchlist and requires human review.")
    if len(inbound) >= 2:
        score += 15
        reasons.append(f"{len(inbound)} synthetic/demo inbound transfers are present in the current runtime state.")
    return {"success": True, "score": min(score, 60), "reasons": reasons, "senderCount": len({row.get("wallet") for row in inbound}), "inboundAmount": sum(float(row.get("amount", 0)) for row in inbound), "source": "SYNTHETIC_AND_DEMO_RUNTIME"}


@router.get("/customer-logins/{user_id}")
def customer_logins(user_id: str, request: Request) -> Dict[str, Any]:
    return {"success": True, "logins": state(request).customer_logins.get(user_id, [])}


@router.post("/customer-logins/{user_id}")
async def add_customer_login(user_id: str, request: Request) -> Dict[str, Any]:
    payload = await request.json()
    wallet = str(payload.get("wallet", "")).strip()
    timestamp = str(payload.get("timestamp", "")).strip()
    device = str(payload.get("device", ""))[:512]
    if not user_id or len(user_id) > 64 or not wallet or not timestamp:
        raise HTTPException(status_code=422, detail="Invalid demo login record")
    entry = {"timestamp": timestamp, "device": device, "source": "DEMO_RUNTIME"}
    state(request).customer_logins.setdefault(user_id, []).append(entry)
    state(request).publish("state-change", {"kind": "customer-login", "userId": user_id, "source": "DEMO_RUNTIME"})
    return {"success": True, "alert": None}


@router.get("/alert-feedback")
def alert_feedback(request: Request) -> Dict[str, Any]:
    return {"success": True, "feedback": state(request).alert_feedback}


@router.post("/alert-feedback")
async def add_alert_feedback(request: Request) -> Dict[str, Any]:
    payload = await request.json()
    outcome = str(payload.get("outcome", ""))
    if outcome not in {"CONFIRMED_FRAUD", "FALSE_POSITIVE", "NEEDS_REVIEW"}:
        raise HTTPException(status_code=422, detail="Invalid feedback outcome")
    entry = {"timestamp": utc_now(), **payload, "source": "DEMO_RUNTIME"}
    state(request).alert_feedback.append(entry)
    state(request).publish("state-change", {"kind": "alert-feedback", "caseId": payload.get("caseId"), "source": "DEMO_RUNTIME"})
    return {"success": True}


@router.get("/agents")
def agents(request: Request) -> Dict[str, Any]:
    return {"label": "Simulation — Synthetic Demo Data", "agents": list(state(request).agents.values())}


@router.get("/disaster-scenarios")
def disaster_scenarios(request: Request) -> Dict[str, Any]:
    return {"label": "Simulation — Synthetic Demo Data", "scenarios": state(request).disaster_scenarios}


@router.post("/investigate")
async def investigate(request: Request) -> Dict[str, Any]:
    payload = await request.json()
    case_id = str(payload.get("caseId") or "CASE-DEMO")
    risk_score = payload.get("riskScore", 94)
    investigation = {
        "investigation_id": f"INV-{uuid.uuid4().hex[:10].upper()}",
        "case_id": case_id,
        "created_at": utc_now(),
        "source": "DEMO_RUNTIME",
        "human_authorization_required": True,
    }
    state(request).investigations[investigation["investigation_id"]] = investigation
    report = (
        "### Demo Investigation Summary\n"
        f"This is a synthetic, database-free demo case ({case_id}) with a supplied risk score of {risk_score}/100. "
        "The score is decision support only; an authorised operator must approve any hold or wallet freeze.\n\n"
        "### Evidence handling\n"
        "The investigation uses the current in-memory event, synthetic JSON seed data, and the local model artifact. "
        "It does not query a live MFS system, a customer database, or an official sanctions database."
    )
    return {"success": True, "report": report, "evidence": payload, "engine": "deterministic-demo-narrative", "investigation": investigation}
