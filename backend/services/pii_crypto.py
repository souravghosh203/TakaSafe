"""Field-level encryption for PII written to durable demo audit storage."""

from __future__ import annotations

import base64
import os
import secrets
from typing import Any, Dict


_PREFIX = "enc:v1:"
_AAD = b"takasafe-pii-v1"
def _is_sensitive_field(field_name: Any) -> bool:
    # Cover snake_case and camelCase API/audit keys (for example
    # senderWallet, phone_number, nationalId) without relying on one schema.
    normalized = "".join(character for character in str(field_name).lower() if character.isalnum())
    return any(marker in normalized for marker in ("phone", "mobile", "wallet", "nationalid", "nid"))


def _key_bytes() -> bytes:
    encoded = os.getenv("PII_ENCRYPTION_KEY", "").strip()
    if not encoded:
        raise ValueError("PII_ENCRYPTION_KEY is required before writing PII to durable storage")
    try:
        key = base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4))
    except Exception as error:
        raise ValueError("PII_ENCRYPTION_KEY must be URL-safe base64 for a 32-byte key") from error
    if len(key) != 32:
        raise ValueError("PII_ENCRYPTION_KEY must decode to exactly 32 bytes")
    return key


def encrypt_pii(value: str) -> str:
    if value.startswith(_PREFIX):
        return value
    try:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    except ImportError as error:
        raise ValueError("Install backend requirements to enable AES-GCM PII encryption") from error
    nonce = secrets.token_bytes(12)
    ciphertext = AESGCM(_key_bytes()).encrypt(nonce, value.encode("utf-8"), _AAD)
    payload = base64.urlsafe_b64encode(nonce + ciphertext).decode("ascii").rstrip("=")
    return f"{_PREFIX}{payload}"


def decrypt_pii(value: str) -> str:
    if not value.startswith(_PREFIX):
        return value
    try:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    except ImportError as error:
        raise ValueError("Install backend requirements to enable AES-GCM PII encryption") from error
    payload = value[len(_PREFIX):]
    raw = base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4))
    return AESGCM(_key_bytes()).decrypt(raw[:12], raw[12:], _AAD).decode("utf-8")


def encrypt_pii_fields(value: Any) -> Any:
    """Copy a JSON record and encrypt values stored under PII field names."""
    if isinstance(value, dict):
        protected: Dict[str, Any] = {}
        for key, item in value.items():
            if _is_sensitive_field(key) and item is not None:
                protected[key] = encrypt_pii(str(item))
            else:
                protected[key] = encrypt_pii_fields(item)
        return protected
    if isinstance(value, list):
        return [encrypt_pii_fields(item) for item in value]
    return value


def decrypt_pii_fields(value: Any) -> Any:
    """Return a copy of an encrypted JSON record with PII fields decrypted."""
    if isinstance(value, dict):
        decrypted: Dict[str, Any] = {}
        for key, item in value.items():
            if _is_sensitive_field(key) and isinstance(item, str):
                decrypted[key] = decrypt_pii(item)
            else:
                decrypted[key] = decrypt_pii_fields(item)
        return decrypted
    if isinstance(value, list):
        return [decrypt_pii_fields(item) for item in value]
    return value
