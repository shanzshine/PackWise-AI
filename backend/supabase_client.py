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


def save_assessment(plan_id: int, report_dict: dict, input_snapshot: dict,
                     rule_engine_version: str = "v1.0") -> str | None:
    """
    Saves a full risk report (already-serialized dict, as returned by
    serialize_report() in main.py) into risk_assessment + its 3 child
    tables. Returns the new assessment_id, or None if saving is disabled
    or fails (prediction results are still returned to the caller either
    way — a save failure should never block the API response).
    """
    if _client is None:
        return None

    try:
        categories = report_dict["categories"]
        assessment_row = {
            "plan_id": plan_id,
            "rule_engine_version": rule_engine_version,
            "overall_risk_level": report_dict["overall_risk_level"],
            "drop_test_risk_pct": categories["Drop Test Risk"]["risk_percentage"],
            "drop_test_pass_probability": categories["Drop Test Risk"]["pass_probability"],
            "movement_risk_pct": categories["Movement Risk"]["risk_percentage"],
            "accessory_loss_risk_pct": categories["Accessory Loss Risk"]["risk_percentage"],
            "input_snapshot": input_snapshot,
        }
        result = _client.table("risk_assessment").insert(assessment_row).execute()
        assessment_id = result.data[0]["assessment_id"]

        # Triggered rules (flatten across all 3 categories)
        triggered_rows = []
        for category_name, category_data in categories.items():
            for rule in category_data["matched_rules"]:
                triggered_rows.append({
                    "assessment_id": assessment_id,
                    "category": category_name,
                    "rule_id": rule["rule_id"],
                    "evidence_id": rule["evidence_id"],
                    "severity": rule["severity"],
                    "confidence": rule["confidence"],
                    "source_reference": rule["source_reference"],
                    "explanation": rule["explanation"],
                })
        if triggered_rows:
            _client.table("risk_triggered_rule").insert(triggered_rows).execute()

        # Movement by region
        region_rows = [
            {
                "assessment_id": assessment_id,
                "body_region": region_name,
                "risk_percentage": data["risk_percentage"],
                "risk_level": data["risk_level"],
                "coverage": data["coverage"],
            }
            for region_name, data in report_dict["movement_by_region"].items()
        ]
        if region_rows:
            _client.table("risk_movement_by_region").insert(region_rows).execute()

        # Accessory loss by item
        accessory_rows = [
            {
                "assessment_id": assessment_id,
                "accessory_name": item["name"],
                "weight_g": item["weight_g"],
                "loss_probability": item["loss_probability"],
                "risk_level": item["risk_level"],
                "explanation": item["explanation"],
            }
            for item in report_dict["accessory_loss_by_item"]
        ]
        if accessory_rows:
            _client.table("risk_accessory_item").insert(accessory_rows).execute()

        return assessment_id

    except Exception as e:
        # Never let a database hiccup break the prediction response itself.
        logger.error(f"Failed to save assessment to Supabase: {e!r}")
        return None
