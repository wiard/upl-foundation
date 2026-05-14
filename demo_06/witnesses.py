from __future__ import annotations

import hashlib
import json
import platform
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import torch


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_json(payload: Any) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    return sha256_bytes(encoded)


def tensor_to_bytes(tensor: torch.Tensor) -> bytes:
    cpu_tensor = tensor.detach().cpu().contiguous()
    byte_view = cpu_tensor.view(torch.uint8).reshape(-1)
    return bytes(byte_view.tolist())


def tensor_sha256(tensor: torch.Tensor) -> str:
    return sha256_bytes(tensor_to_bytes(tensor))


def tensor_to_list(tensor: torch.Tensor) -> list[Any]:
    return tensor.detach().cpu().tolist()


def gather_pip_freeze() -> list[str]:
    completed = subprocess.run(
        [sys.executable, "-m", "pip", "freeze"],
        check=True,
        capture_output=True,
        text=True,
    )
    return [line for line in completed.stdout.splitlines() if line.strip()]


def witness_record(witness_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    record = {
        "witness_id": witness_id,
        "created_at_utc": utc_now_iso(),
        "payload": payload,
    }
    record["content_hash"] = sha256_json(record)
    return record


def save_witness(path: Path, witness: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(witness, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def build_w_input(
    *,
    d: int,
    w: torch.Tensor,
    b: torch.Tensor,
    x_control: torch.Tensor,
    x_margin: torch.Tensor,
    model_sha256: str,
    deterministic_input_rule: str,
    control_threshold: float,
    margin_threshold: float,
) -> dict[str, Any]:
    payload = {
        "d": d,
        "w": tensor_to_list(w),
        "b": float(b.item()),
        "model_sha256": model_sha256,
        "deterministic_input_construction_rule": deterministic_input_rule,
        "control_threshold": control_threshold,
        "margin_threshold": margin_threshold,
        "control_count": int(x_control.shape[0]),
        "margin_count": int(x_margin.shape[0]),
        "x_control_sha256": tensor_sha256(x_control),
        "x_margin_sha256": tensor_sha256(x_margin),
        "x_control": tensor_to_list(x_control),
        "x_margin": tensor_to_list(x_margin),
    }
    return witness_record("W_input", payload)


def build_w_exec(*, precision_settings: dict[str, Any]) -> dict[str, Any]:
    payload = {
        "python_version": sys.version,
        "python_implementation": platform.python_implementation(),
        "torch_version": torch.__version__,
        "device": "cuda:0" if torch.cuda.is_available() else "cpu",
        "precision_settings": precision_settings,
        "pip_freeze": gather_pip_freeze(),
        "no_training": True,
        "no_external_data": True,
    }
    return witness_record("W_exec", payload)


def build_w_map(*, mapping_payload: dict[str, Any]) -> dict[str, Any]:
    return witness_record("W_map", mapping_payload)


def build_w_contract(*, contract_payload: dict[str, Any]) -> dict[str, Any]:
    return witness_record("W_contract", contract_payload)


def build_w_check(*, check_payload: dict[str, Any]) -> dict[str, Any]:
    return witness_record("W_check", check_payload)


def build_w_ruleout(*, baseline_result: dict[str, Any]) -> dict[str, Any]:
    return witness_record("W_ruleout", baseline_result)
