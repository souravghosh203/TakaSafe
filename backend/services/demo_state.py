"""Database-free runtime state for the TakaSafe hackathon demo.

Seed data is read from ``data/*.json``.  Changes belong to this process only;
the only optional durable record is the append-only JSONL audit trail.
"""

from __future__ import annotations

import asyncio
import copy
import json
import os
import uuid
from collections import deque
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, AsyncIterator, Deque, Dict, Iterable, List, Optional

from backend.services.pii_crypto import encrypt_pii_fields


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
AUDIT_LOG_PATH = DATA_DIR / "audit_log.jsonl"
MAX_EVENTS = 100


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def read_seed(filename: str, collection: str) -> List[Dict[str, Any]]:
    """Read a labelled seed file and return a defensive copy of its records."""
    with (DATA_DIR / filename).open("r", encoding="utf-8") as handle:
        document = json.load(handle)
    if document.get("source") != "SYNTHETIC" and document.get("source") != "SYNTHETIC_DEMO_WATCHLIST":
        raise ValueError(f"{filename} must be marked as synthetic demo data")
    records = document.get(collection, [])
    if not isinstance(records, list):
        raise ValueError(f"{filename} has no valid {collection} list")
    return copy.deepcopy(records)


class DemoState:
    """Small, explicit in-memory store with a bounded SSE replay buffer."""

    def __init__(self) -> None:
        self.persistence_available = True
        self._event_sequence = 0
        self._event_signal = asyncio.Event()
        self.reset(initial=True)

    def reset(self, initial: bool = False) -> None:
        self.transactions: Dict[str, Dict[str, Any]] = {
            row["id"]: {**row, "source": "SYNTHETIC"}
            for row in read_seed("transactions.json", "transactions")
        }
        self.customers = read_seed("customers.json", "customers")
        self.watchlist = read_seed("watchlist.json", "entries")
        self.agents: Dict[str, Dict[str, Any]] = {
            row["id"]: row for row in read_seed("agents.json", "agents")
        }
        self.disaster_scenarios = read_seed("disaster_scenarios.json", "scenarios")
        self.investigations: Dict[str, Dict[str, Any]] = {}
        self.operator_decisions: Dict[str, Dict[str, Any]] = {}
        self.customer_logins: Dict[str, List[Dict[str, Any]]] = {}
        self.alert_feedback: List[Dict[str, Any]] = []
        self.audit_events: List[Dict[str, Any]] = self._baseline_audits()
        self.active_alerts: Dict[str, Dict[str, Any]] = {
            row["id"]: row for row in self.transactions.values() if row.get("is_threat")
        }
        self.events: Deque[Dict[str, Any]] = deque(maxlen=MAX_EVENTS)
        self._event_sequence = 0
        self._event_signal.set()
        self._event_signal = asyncio.Event()
        if not initial:
            self.record_audit(
                actor="demo-admin",
                action="DEMO_RESET",
                transaction_id=None,
                decision="RESET",
                reason="Reloaded the original synthetic JSON data into runtime memory.",
                model_version="ScamShield XGBoost demo",
            )
            self.publish("demo_reset", {"source": "DEMO", "storage": "DATABASE_FREE"})

    @staticmethod
    def _baseline_audits() -> List[Dict[str, Any]]:
        return [
            {
                "id": "AUD-DEMO-001",
                "event_id": "AUD-DEMO-001",
                "timestamp": "2026-10-01T09:42:15Z",
                "actor": "Synthetic Demo Operator",
                "analyst": "Synthetic Demo Operator",
                "caseId": "CASE-DEMO-7718",
                "entityType": "TRANSACTION",
                "entityId": "TXN-DEMO-1001",
                "transaction_id": "TXN-DEMO-1001",
                "action": "HOLD_FOR_REVIEW",
                "actionTaken": "HOLD_FOR_REVIEW",
                "decision": "HOLD_FOR_REVIEW",
                "riskScore": 94,
                "reason": "Synthetic risk scenario queued for human review.",
                "notes": "Synthetic baseline audit event; not a real customer record.",
                "model_version": "ScamShield XGBoost demo",
                "source": "SYNTHETIC",
            }
        ]

    def publish(self, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        self._event_sequence += 1
        event = {
            "id": self._event_sequence,
            "event_id": f"EVT-{uuid.uuid4().hex[:12].upper()}",
            "timestamp": utc_now(),
            "event_type": event_type,
            "transaction_id": data.get("transaction_id") or data.get("entityId"),
            "source": data.get("source", "DEMO"),
            "risk_level": data.get("risk_level"),
            "data": data,
        }
        self.events.append(event)
        self._event_signal.set()
        return event

    async def event_stream(self, last_event_id: Optional[str]) -> AsyncIterator[Dict[str, Any]]:
        try:
            last_sequence = int(last_event_id or 0)
        except ValueError:
            last_sequence = 0
        yield {"event": "ready", "data": {"timestamp": utc_now(), "label": "Demo/Sandbox Event Stream"}}
        while True:
            pending = [event for event in self.events if event["id"] > last_sequence]
            if pending:
                for event in pending:
                    last_sequence = event["id"]
                    yield {"id": str(event["id"]), "event": event["event_type"], "data": event}
                continue
            try:
                await asyncio.wait_for(self._event_signal.wait(), timeout=15)
                self._event_signal.clear()
            except asyncio.TimeoutError:
                yield {"comment": "heartbeat"}

    def record_audit(
        self,
        *,
        actor: str,
        action: str,
        transaction_id: Optional[str],
        decision: str,
        reason: str,
        model_version: str,
        extras: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        event_id = f"AUD-{uuid.uuid4().hex[:12].upper()}"
        entry: Dict[str, Any] = {
            "id": event_id,
            "event_id": event_id,
            "timestamp": utc_now(),
            "actor": actor,
            "analyst": actor,
            "action": action,
            "actionTaken": action,
            "transaction_id": transaction_id,
            "entityId": transaction_id or "N/A",
            "decision": decision,
            "reason": reason,
            "model_version": model_version,
            "source": "DEMO_RUNTIME",
        }
        if extras:
            entry.update(extras)
        self.audit_events.insert(0, entry)
        try:
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            with AUDIT_LOG_PATH.open("a", encoding="utf-8") as handle:
                protected_entry = encrypt_pii_fields(entry)
                handle.write(json.dumps(protected_entry, ensure_ascii=False, separators=(",", ":")) + "\n")
            self.persistence_available = True
        except (OSError, ValueError):
            # Never fall back to writing PII as plaintext when encryption is unavailable.
            self.persistence_available = False
        self.publish(
            "state-change",
            {
                "kind": "audit-action",
                "entryId": event_id,
                "entityType": entry.get("entityType", "TRANSACTION"),
                "entityId": transaction_id,
                "actionTaken": action,
                "transaction_id": transaction_id,
                "source": "DEMO",
            },
        )
        return entry

    def screen_watchlist(self, identities: Iterable[Any]) -> Dict[str, Any]:
        candidates = {self._normalise_identity(value) for value in identities if value is not None}
        candidates.discard("")
        for entry in self.watchlist:
            aliases = {self._normalise_identity(alias) for alias in entry.get("aliases", [])}
            if candidates & aliases:
                return {
                    "match": True,
                    "match_type": entry["match_type"],
                    "confidence": entry["confidence"],
                    "source": "SYNTHETIC_DEMO_WATCHLIST",
                    "requires_human_review": True,
                }
        return {
            "match": False,
            "match_type": None,
            "confidence": 0.0,
            "source": "SYNTHETIC_DEMO_WATCHLIST",
            "requires_human_review": False,
        }

    @staticmethod
    def _normalise_identity(value: Any) -> str:
        return "".join(char for char in str(value).upper() if char.isalnum())


demo_state = DemoState()
