"""This module requires PyTorch. In the current local environment, torch is not yet available; therefore the self-check is not executed here."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
from typing import Any

import torch


DEFAULT_D = 16
DEFAULT_SCALE = 0.0512
DEFAULT_MODEL_PATH = Path(__file__).with_name("toy_model.pt")
DEFAULT_CONTROL_TARGETS = (-0.30, -0.20, -0.12, 0.12, 0.20, 0.30)
DEFAULT_MARGIN_TARGETS = (-3e-4, -1.5e-4, -5e-5, 5e-5, 1.5e-4, 3e-4)
CONTROL_THRESHOLD = 0.1
MARGIN_THRESHOLD = 3e-4


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def configure_torch_runtime() -> None:
    torch.use_deterministic_algorithms(True)
    if torch.backends.mkldnn.is_available():
        torch.backends.mkldnn.deterministic = True


def build_parameters(d: int = DEFAULT_D, scale: float = DEFAULT_SCALE) -> tuple[torch.Tensor, torch.Tensor]:
    if d not in {8, 16, 32}:
        raise ValueError(f"d must be one of {{8, 16, 32}}, got {d}")
    if scale <= 0:
        raise ValueError("scale must be positive")

    w = torch.full((d,), 1.0 / math.sqrt(d), dtype=torch.float32)

    # x_star = scale * ones(d) gives w·x_star = scale * sqrt(d).
    # Choosing b = -(scale * sqrt(d) + 0.25 * ulp_fp16(dot))
    # places the fp32 logit inside the fp16 rounding gap near zero.
    dot_value = scale * math.sqrt(d)
    fp16_gap = abs(dot_value) * 2.0 ** -11
    target_logit = -0.25 * fp16_gap
    b = torch.tensor(target_logit - dot_value, dtype=torch.float32)

    return w, b


def save_parameters(path: Path, w: torch.Tensor, b: torch.Tensor) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    torch.save({"w": w, "b": b}, path)
    return sha256_file(path)


def load_parameters(path: Path) -> tuple[torch.Tensor, torch.Tensor]:
    payload = torch.load(path, map_location="cpu")
    return payload["w"].to(torch.float32), payload["b"].to(torch.float32)


def construct_x_star(d: int, scale: float = DEFAULT_SCALE) -> torch.Tensor:
    return torch.full((d,), scale, dtype=torch.float32)


def compute_logit(x: torch.Tensor, w: torch.Tensor, b: torch.Tensor, precision: str = "fp32") -> torch.Tensor:
    if precision not in {"fp32", "fp16"}:
        raise ValueError(f"precision must be 'fp32' or 'fp16', got {precision}")

    target_dtype = torch.float32 if precision == "fp32" else torch.float16
    x_t = x.to(target_dtype)
    w_t = w.to(target_dtype)
    b_t = b.to(target_dtype)
    logits = x_t @ w_t + b_t
    return logits.to(torch.float32)


def predict_sign(logit: torch.Tensor) -> int:
    return 1 if float(logit.item()) >= 0.0 else -1


def logits_to_signs(logits: torch.Tensor) -> torch.Tensor:
    return torch.where(logits >= 0.0, torch.ones_like(logits), -torch.ones_like(logits))


def alpha_for_target_logit(target_logit: float, b: torch.Tensor, d: int) -> float:
    return (target_logit - float(b.item())) / math.sqrt(d)


def construct_inputs_for_targets(d: int, b: torch.Tensor, targets: tuple[float, ...]) -> torch.Tensor:
    rows = []
    for target in targets:
        alpha = alpha_for_target_logit(target, b, d)
        rows.append(torch.full((d,), alpha, dtype=torch.float32))
    return torch.stack(rows, dim=0)


def construct_input_sets(
    d: int,
    b: torch.Tensor,
    control_targets: tuple[float, ...] = DEFAULT_CONTROL_TARGETS,
    margin_targets: tuple[float, ...] = DEFAULT_MARGIN_TARGETS,
) -> tuple[torch.Tensor, torch.Tensor]:
    x_control = construct_inputs_for_targets(d, b, control_targets)
    x_margin = construct_inputs_for_targets(d, b, margin_targets)
    return x_control, x_margin


def self_check(d: int = DEFAULT_D, scale: float = DEFAULT_SCALE, model_path: Path = DEFAULT_MODEL_PATH) -> dict[str, Any]:
    configure_torch_runtime()
    w, b = build_parameters(d=d, scale=scale)
    model_hash = save_parameters(model_path, w, b)

    w_loaded, b_loaded = load_parameters(model_path)
    x_star = construct_x_star(d=d, scale=scale)

    logit_fp32 = compute_logit(x_star, w_loaded, b_loaded, precision="fp32")
    logit_fp16 = compute_logit(x_star, w_loaded, b_loaded, precision="fp16")
    delta = logit_fp16 - logit_fp32

    dot_value = torch.dot(w_loaded, x_star).item()
    expected_gap_scale = abs(dot_value) * 2.0 ** -11

    result = {
        "d": d,
        "scale": scale,
        "w_value": float(w_loaded[0].item()),
        "b_value": float(b_loaded.item()),
        "dot_value_fp32": float(dot_value),
        "logit_fp32": float(logit_fp32.item()),
        "logit_fp16": float(logit_fp16.item()),
        "delta_fp16_minus_fp32": float(delta.item()),
        "expected_gap_scale": float(expected_gap_scale),
        "prediction_fp32": predict_sign(logit_fp32),
        "prediction_fp16": predict_sign(logit_fp16),
        "model_path": str(model_path),
        "model_sha256": model_hash,
    }

    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="demo_06 toy linear model viability check")
    parser.add_argument("--d", type=int, default=DEFAULT_D, choices=[8, 16, 32])
    parser.add_argument("--scale", type=float, default=DEFAULT_SCALE)
    parser.add_argument("--model-path", type=Path, default=DEFAULT_MODEL_PATH)
    args = parser.parse_args()

    result = self_check(d=args.d, scale=args.scale, model_path=args.model_path)
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
