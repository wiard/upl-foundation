from __future__ import annotations

from dataclasses import dataclass

import torch

from model import compute_logit, logits_to_signs


@dataclass(frozen=True)
class PrecisionContrastResult:
    control_logits_fp32: torch.Tensor
    control_logits_fp16: torch.Tensor
    margin_logits_fp32: torch.Tensor
    margin_logits_fp16: torch.Tensor
    control_signs_fp32: torch.Tensor
    control_signs_fp16: torch.Tensor
    margin_signs_fp32: torch.Tensor
    margin_signs_fp16: torch.Tensor
    control_flips: int
    margin_flips: int

    def to_dict(self) -> dict[str, int]:
        return {
            "control_flips": self.control_flips,
            "margin_flips": self.margin_flips,
        }


def run_cross_precision_contrast(
    w: torch.Tensor,
    b: torch.Tensor,
    x_control: torch.Tensor,
    x_margin: torch.Tensor,
) -> PrecisionContrastResult:
    control_logits_fp32 = compute_logit(x_control, w, b, precision="fp32")
    control_logits_fp16 = compute_logit(x_control, w, b, precision="fp16")
    margin_logits_fp32 = compute_logit(x_margin, w, b, precision="fp32")
    margin_logits_fp16 = compute_logit(x_margin, w, b, precision="fp16")

    control_signs_fp32 = logits_to_signs(control_logits_fp32)
    control_signs_fp16 = logits_to_signs(control_logits_fp16)
    margin_signs_fp32 = logits_to_signs(margin_logits_fp32)
    margin_signs_fp16 = logits_to_signs(margin_logits_fp16)

    control_flips = int((control_signs_fp32 != control_signs_fp16).sum().item())
    margin_flips = int((margin_signs_fp32 != margin_signs_fp16).sum().item())

    return PrecisionContrastResult(
        control_logits_fp32=control_logits_fp32,
        control_logits_fp16=control_logits_fp16,
        margin_logits_fp32=margin_logits_fp32,
        margin_logits_fp16=margin_logits_fp16,
        control_signs_fp32=control_signs_fp32,
        control_signs_fp16=control_signs_fp16,
        margin_signs_fp32=margin_signs_fp32,
        margin_signs_fp16=margin_signs_fp16,
        control_flips=control_flips,
        margin_flips=margin_flips,
    )
