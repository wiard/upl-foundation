from __future__ import annotations

from typing import Any


def adjudicate_demo(
    *,
    boundary: dict[str, Any],
    gamma: list[str],
    baseline: dict[str, Any],
    contrast: dict[str, Any] | None,
    witnesses: dict[str, Any],
) -> dict[str, Any]:
    deterministic_fp32 = bool(baseline["deterministic_fp32"])
    deterministic_fp16 = bool(baseline["deterministic_fp16"])
    claim_id = "UPL::DEMO_06::L2_L3::FWD::DTYPE_PRECISION::DOT_PRODUCT_MARGIN_SHIFT"
    k2 = (
        "Under boundary B, changing only the execution precision from fp32 to fp16 "
        "in the L2 dot-product operation changes the measured margin representation "
        "z = w · x + b enough to cross the predefined binary decision boundary for at least one "
        "input in X_margin, while X_control remains invariant."
    )

    reasons: list[str] = []
    limits = [
        "One machine, one Python install, one PyTorch version.",
        "One toy binary linear classifier only.",
        "No claim extends beyond the declared boundary B.",
        "No claim is made about larger AI systems or broader hardware behavior.",
    ]

    judgment = {
        "claim_id": claim_id,
        "upl_name": claim_id,
        "Gamma": gamma,
        "K_2": k2,
        "B": boundary,
        "canonical_witnesses": witnesses,
        "control_flips": None,
        "margin_flips": None,
        "scenario": None,
        "sigma_main": None,
        "sigma_diag": None,
        "K_1": None,
        "reasons": reasons,
        "limits": limits,
        "notes": {
            "no_training": True,
            "no_external_data": True,
            "no_push": True,
        },
    }

    if not deterministic_fp32 or not deterministic_fp16:
        reasons.append("Same-precision determinism did not hold for at least one precision setting.")
        judgment["scenario"] = "A"
        judgment["sigma_diag"] = "checked"
        judgment["sigma_main"] = "out_of_boundary"
        judgment["K_1"] = (
            "Under B, repeated same-precision execution produced non-identical outputs."
        )
        return judgment

    if contrast is None:
        reasons.append("Cross-precision contrast was not executed after determinism passed.")
        judgment["scenario"] = "A"
        judgment["sigma_diag"] = "checked"
        judgment["sigma_main"] = "incomplete"
        judgment["K_1"] = (
            "Under B, repeated same-precision execution produced non-identical outputs."
        )
        return judgment

    control_flips = int(contrast["control_flips"])
    margin_flips = int(contrast["margin_flips"])
    judgment["control_flips"] = control_flips
    judgment["margin_flips"] = margin_flips

    if control_flips > 0:
        reasons.append("The control set produced cross-precision flips, so the control boundary is contaminated.")
        judgment["scenario"] = "D"
        judgment["sigma_main"] = "failed"
        return judgment

    if margin_flips >= 1:
        reasons.append("Same-precision determinism held in both precisions.")
        reasons.append("No control flips occurred.")
        reasons.append("At least one margin input changed classification across precisions.")
        judgment["scenario"] = "B"
        judgment["sigma_main"] = "checked"
        return judgment

    reasons.append("Same-precision determinism held, but no margin flips were observed.")
    judgment["scenario"] = "C"
    judgment["sigma_main"] = "failed"
    judgment["limits"] = limits + ["Margin inputs may not have been sharp enough, or fp16 may have been sufficient under B."]
    return judgment
