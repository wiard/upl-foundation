from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

from adjudicate import adjudicate_demo
from experiment_1_baseline import run_same_precision_baseline
from experiment_2_precision import run_cross_precision_contrast
from model import (
    CONTROL_THRESHOLD,
    DEFAULT_D,
    DEFAULT_MARGIN_TARGETS,
    DEFAULT_MODEL_PATH,
    DEFAULT_CONTROL_TARGETS,
    MARGIN_THRESHOLD,
    build_parameters,
    configure_torch_runtime,
    construct_input_sets,
    save_parameters,
)
from witnesses import (
    build_w_check,
    build_w_contract,
    build_w_exec,
    build_w_input,
    build_w_map,
    build_w_ruleout,
    save_witness,
    tensor_to_list,
)


OUTPUT_DIR = Path(__file__).with_name("output")


def write_trace(path: Path, lines: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def run_demo() -> dict[str, Any]:
    configure_torch_runtime()
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    trace_lines = ["demo_06 start"]

    d = DEFAULT_D
    w, b = build_parameters(d=d)
    model_sha256 = save_parameters(DEFAULT_MODEL_PATH, w, b)
    x_control, x_margin = construct_input_sets(d, b)
    trace_lines.append(f"model saved: {DEFAULT_MODEL_PATH}")
    trace_lines.append(f"x_control size: {tuple(x_control.shape)}")
    trace_lines.append(f"x_margin size: {tuple(x_margin.shape)}")

    baseline = run_same_precision_baseline(w, b, x_control, x_margin)
    trace_lines.append(f"deterministic_fp32={baseline.deterministic_fp32}")
    trace_lines.append(f"deterministic_fp16={baseline.deterministic_fp16}")

    contrast = None
    if baseline.deterministic_fp32 and baseline.deterministic_fp16:
        contrast = run_cross_precision_contrast(w, b, x_control, x_margin)
        trace_lines.append(f"control_flips={contrast.control_flips}")
        trace_lines.append(f"margin_flips={contrast.margin_flips}")
    else:
        trace_lines.append("cross precision contrast skipped because determinism baseline failed")

    precision_settings = {
        "default_dtype": "float32",
        "deterministic_algorithms": True,
        "mkldnn_deterministic": True,
    }

    deterministic_input_rule = (
        "Each input row is a constant vector alpha·1_d where alpha is chosen so that "
        "w·x + b equals a predefined target logit. Control targets are "
        f"{DEFAULT_CONTROL_TARGETS}; margin targets are {DEFAULT_MARGIN_TARGETS}."
    )

    op_payload = {
        "operation": "dtype-specific dot product plus bias addition",
        "representation": "scalar margin/logit z = w · x + b",
        "control_logits_fp32": tensor_to_list(contrast.control_logits_fp32) if contrast else [],
        "control_logits_fp16": tensor_to_list(contrast.control_logits_fp16) if contrast else [],
        "margin_logits_fp32": tensor_to_list(contrast.margin_logits_fp32) if contrast else [],
        "margin_logits_fp16": tensor_to_list(contrast.margin_logits_fp16) if contrast else [],
        "delta_control": (
            tensor_to_list(contrast.control_logits_fp32 - contrast.control_logits_fp16) if contrast else []
        ),
        "delta_margin": (
            tensor_to_list(contrast.margin_logits_fp32 - contrast.margin_logits_fp16) if contrast else []
        ),
    }
    repr_payload = {
        "control_signs_fp32": tensor_to_list(contrast.control_signs_fp32) if contrast else [],
        "control_signs_fp16": tensor_to_list(contrast.control_signs_fp16) if contrast else [],
        "margin_signs_fp32": tensor_to_list(contrast.margin_signs_fp32) if contrast else [],
        "margin_signs_fp16": tensor_to_list(contrast.margin_signs_fp16) if contrast else [],
    }
    output_payload = {
        "control_labels_fp32": tensor_to_list(contrast.control_signs_fp32) if contrast else [],
        "control_labels_fp16": tensor_to_list(contrast.control_signs_fp16) if contrast else [],
        "margin_labels_fp32": tensor_to_list(contrast.margin_signs_fp32) if contrast else [],
        "margin_labels_fp16": tensor_to_list(contrast.margin_signs_fp16) if contrast else [],
        "control_flips": contrast.control_flips if contrast else None,
        "margin_flips": contrast.margin_flips if contrast else None,
    }
    contract_payload = {
        "binary_decision_rule": "class = +1 if z >= 0 else -1",
        "flip_definition": "flip = class_fp32 != class_fp16",
        "success_condition": "control_flips = 0 and margin_flips >= 1",
        "failure_condition": "all witnesses present but margin_flips = 0",
        "prerequisite": "same-precision determinism must pass before cross-precision contrast",
    }
    check_payload = {
        "experiment_1": baseline.to_dict(),
        "experiment_2": contrast.to_dict() if contrast else None,
        "output_trace": output_payload,
        "control_flips": contrast.control_flips if contrast else None,
        "margin_flips": contrast.margin_flips if contrast else None,
    }
    ruleout_payload = baseline.to_dict() | {
        "fixed_inputs": True,
        "fixed_model": True,
        "fixed_boundary": True,
        "randomness_sources": [],
        "no_randomness": True,
        "training_performed": False,
        "no_external_data": True,
        "other_model_present": False,
        "alternative_dataset_present": False,
    }

    witnesses = {
        "W_input": build_w_input(
            d=d,
            w=w,
            b=b,
            x_control=x_control,
            x_margin=x_margin,
            model_sha256=model_sha256,
            deterministic_input_rule=deterministic_input_rule,
            control_threshold=CONTROL_THRESHOLD,
            margin_threshold=MARGIN_THRESHOLD,
        ),
        "W_exec": build_w_exec(precision_settings=precision_settings),
        "W_map": build_w_map(
            mapping_payload={
                "l2_operation": "dtype-specific dot product + bias addition",
                "l3_representation": "scalar margin/logit z = w · x + b",
                "op_trace": op_payload,
                "representation_trace": repr_payload,
            }
        ),
        "W_contract": build_w_contract(contract_payload=contract_payload),
        "W_check": build_w_check(check_payload=check_payload),
        "W_ruleout": build_w_ruleout(baseline_result=ruleout_payload),
    }

    witness_paths: dict[str, str] = {}
    for witness_name, witness in witnesses.items():
        witness_path = OUTPUT_DIR / f"{witness_name.lower()}.json"
        save_witness(witness_path, witness)
        witness_paths[witness_name] = str(witness_path)

    gamma = [
        "No training was run.",
        "Inputs were constructed in code only.",
        "One machine, one Python install, one PyTorch version.",
        "The claim is bounded to this toy binary linear classifier and declared precision settings.",
    ]
    boundary = {
        "machine": "single local machine",
        "python_install": "single interpreter or venv",
        "pytorch_version": witnesses["W_exec"]["payload"]["torch_version"],
        "toy": "binary linear classifier",
        "d": d,
        "control_condition": f"|w·x + b| > {CONTROL_THRESHOLD}",
        "margin_condition": f"|w·x + b| <= {MARGIN_THRESHOLD}",
        "precision_change": "fp32 -> fp16 only",
    }

    judgment = adjudicate_demo(
        boundary=boundary,
        gamma=gamma,
        baseline=baseline.to_dict(),
        contrast=contrast.to_dict() if contrast else None,
        witnesses=witnesses,
    )
    judgment["witness_paths"] = witness_paths

    judgment_path = OUTPUT_DIR / "judgment.json"
    judgment_path.write_text(json.dumps(judgment, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    write_trace(OUTPUT_DIR / "trace.log", trace_lines)

    return judgment


def main() -> None:
    judgment = run_demo()
    print(json.dumps(judgment, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
