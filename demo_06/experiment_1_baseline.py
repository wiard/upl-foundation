from __future__ import annotations

from dataclasses import dataclass

import torch

from model import compute_logit
from witnesses import tensor_sha256


@dataclass(frozen=True)
class BaselineRunResult:
    logits_a_fp32: torch.Tensor
    logits_b_fp32: torch.Tensor
    logits_a_fp16: torch.Tensor
    logits_b_fp16: torch.Tensor
    hash_a_fp32: str
    hash_b_fp32: str
    hash_a_fp16: str
    hash_b_fp16: str
    deterministic_fp32: bool
    deterministic_fp16: bool

    def to_dict(self) -> dict[str, object]:
        return {
            "hash_a_fp32": self.hash_a_fp32,
            "hash_b_fp32": self.hash_b_fp32,
            "hash_a_fp16": self.hash_a_fp16,
            "hash_b_fp16": self.hash_b_fp16,
            "deterministic_fp32": self.deterministic_fp32,
            "deterministic_fp16": self.deterministic_fp16,
        }


def run_same_precision_baseline(
    w: torch.Tensor,
    b: torch.Tensor,
    x_control: torch.Tensor,
    x_margin: torch.Tensor,
) -> BaselineRunResult:
    x_all = torch.cat([x_control, x_margin], dim=0)

    logits_a_fp32 = compute_logit(x_all, w, b, precision="fp32")
    logits_b_fp32 = compute_logit(x_all, w, b, precision="fp32")
    logits_a_fp16 = compute_logit(x_all, w, b, precision="fp16")
    logits_b_fp16 = compute_logit(x_all, w, b, precision="fp16")

    hash_a_fp32 = tensor_sha256(logits_a_fp32)
    hash_b_fp32 = tensor_sha256(logits_b_fp32)
    hash_a_fp16 = tensor_sha256(logits_a_fp16)
    hash_b_fp16 = tensor_sha256(logits_b_fp16)

    return BaselineRunResult(
        logits_a_fp32=logits_a_fp32,
        logits_b_fp32=logits_b_fp32,
        logits_a_fp16=logits_a_fp16,
        logits_b_fp16=logits_b_fp16,
        hash_a_fp32=hash_a_fp32,
        hash_b_fp32=hash_b_fp32,
        hash_a_fp16=hash_a_fp16,
        hash_b_fp16=hash_b_fp16,
        deterministic_fp32=hash_a_fp32 == hash_b_fp32,
        deterministic_fp16=hash_a_fp16 == hash_b_fp16,
    )
