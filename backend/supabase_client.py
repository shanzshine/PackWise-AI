"""
PackWise Risk Prediction API — Supabase persistence
======================================================
Reads credentials from environment variables (see .env.example) so no
secrets ever get hard-coded into source files.
"""

import os
import logging
from supabase import create_client, Client

logger = logging.getLogger("packwise.supabase")

_SUPABASE_URL = os.getenv("SUPABASE_URL")
_SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

_client: Client | None = None
if _SUPABASE_URL and _SUPABASE_SERVICE_KEY:
    _client = create_client(_SUPABASE_URL, _SUPABASE_SERVICE_KEY)
else:
    logger.warning(
        "SUPABASE_URL / SUPABASE_SERVICE_KEY not set — running WITHOUT database "
        "persistence. Predictions will still work, results just won't be saved."
    )


def save_assessment(plan_id: str, report_dict: dict, input_snapshot: dict,
                     rule_engine_version: str = "v1.0") -> str | None:
    """
    Menyimpan risk report ke dalam kolom `zones` di tabel packaging_plan.
    Schema baru tidak punya tabel terpisah risk_assessments — data risk
    disimpan sebagai bagian dari packaging_plan.zones (JSONB).
    Returns plan_id sebagai assessment_id agar workflow frontend tidak break.
    """
    if _client is None:
        return None

    try:
        categories = report_dict.get("categories", {})

        risk_summary = {
            "overall_risk_level": report_dict.get("overall_risk_level"),
            "drop_test_risk_pct": categories.get("Drop Test Risk", {}).get("risk_percentage"),
            "movement_risk_pct": categories.get("Movement Risk", {}).get("risk_percentage"),
            "accessory_loss_risk_pct": categories.get("Accessory Loss Risk", {}).get("risk_percentage"),
            "triggered_rules": [
                {
                    "category": cat,
                    "rule_id": rule["rule_id"],
                    "severity": rule["severity"],
                    "explanation": rule["explanation"],
                }
                for cat, cat_data in categories.items()
                for rule in cat_data.get("matched_rules", [])
            ],
            "input_snapshot": input_snapshot,
        }

        # 1. Simpan risk summary ke packaging_plan.zones sebagai field tambahan
        _client.table("packaging_plan").update({
            "zones": risk_summary
        }).eq("plan_id", plan_id).execute()

        # 2. Simpan juga ke tabel risk_assessments jika tabel tersebut ada
        try:
            _client.table("risk_assessments").insert({
                "plan_id": plan_id,
                "overall_risk_level": report_dict.get("overall_risk_level", "Low Risk"),
                "drop_test_pass_pct": categories.get("Drop Test Risk", {}).get("risk_percentage"),
                "movement_risk_pct": categories.get("Movement Risk", {}).get("risk_percentage"),
                "accessory_loss_risk_pct": categories.get("Accessory Loss Risk", {}).get("risk_percentage"),
                "triggered_rules": risk_summary.get("triggered_rules", []),
            }).execute()
        except Exception as re_err:
            logger.warning(f"Could not insert into risk_assessments table (ignoring): {re_err}")

        logger.info(f"Risk assessment saved for plan {plan_id}")
        return plan_id  # Return plan_id sebagai pengganti assessment_id

    except Exception as e:
        logger.error(f"Failed to save risk assessment: {e}")
        return None
