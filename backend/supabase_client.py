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
    Saves a full risk report into risk_assessments.
    Returns the new assessment_id, or None if saving fails.
    """
    if _client is None:
        return None

    try:
        categories = report_dict["categories"]
        
        # Collect triggered rules across all categories
        triggered_rules_list = []
        for category_name, category_data in categories.items():
            for rule in category_data.get("matched_rules", []):
                triggered_rules_list.append({
                    "category": category_name,
                    "rule_id": rule["rule_id"],
                    "evidence_id": rule["evidence_id"],
                    "severity": rule["severity"],
                    "confidence": rule["confidence"],
                    "source_reference": rule["source_reference"],
                    "explanation": rule["explanation"],
                })

        assessment_row = {
            "plan_id": plan_id,
            "overall_risk_level": report_dict["overall_risk_level"],
            "drop_test_risk_pct": categories["Drop Test Risk"]["risk_percentage"],
            "movement_risk_pct": categories["Movement Risk"]["risk_percentage"],
            "accessory_loss_risk_pct": categories["Accessory Loss Risk"]["risk_percentage"],
            "triggered_rules": triggered_rules_list,
        }
        
        result = _client.table("risk_assessments").insert(assessment_row).execute()
        assessment_id = result.data[0]["id"]
        return assessment_id
    except Exception as e:
        logger.error(f"Failed to save assessment to Supabase: {e}")
        return None
