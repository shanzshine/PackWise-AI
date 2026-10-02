"""Train PackWise packaging recommendation models from the historical CSV.

New artifacts are written to a separate directory by default, so the models
currently used by the API are never overwritten accidentally.
"""

from __future__ import annotations

import argparse
import json
import platform
from pathlib import Path

import joblib
import pandas as pd
import sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


FEATURE_COLUMNS = [
    "product_family",
    "articulation",
    "pose",
    "product_weight_g",
    "height_cm",
    "complexity_score",
    "stability_index",
    "center_of_gravity",
    "hair_length",
    "dress_length",
    "accessory_count",
    "accessory_weight_g",
    "fragility_score",
    "attachment_needed",
    "fragile_parts_count",
]

CATEGORICAL_FEATURES = [
    "product_family",
    "articulation",
    "pose",
    "center_of_gravity",
    "hair_length",
    "dress_length",
]

MODEL_FILES = {
    "recommended_head_strap": "head_strap.pkl",
    "recommended_waist_strap": "waist_strap.pkl",
    "recommended_hand_strap": "hand_strap.pkl",
    "recommended_leg_strap": "leg_strap.pkl",
    "recommended_back_support": "back_support.pkl",
    "recommended_base_support": "base_support.pkl",
    "recommended_material": "material.pkl",
}


def parse_args() -> argparse.Namespace:
    backend_dir = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(
        description="Train and evaluate PackWise recommendation models."
    )
    parser.add_argument(
        "--dataset",
        type=Path,
        default=backend_dir.parent / "packaging_dataset.csv",
        help="Path to packaging_dataset.csv.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=backend_dir / "model_output",
        help="Directory for new model files and metrics.",
    )
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--random-state", type=int, default=42)
    return parser.parse_args()


def validate_dataset(data: pd.DataFrame) -> None:
    required = set(FEATURE_COLUMNS) | set(MODEL_FILES)
    missing = sorted(required - set(data.columns))
    if missing:
        raise ValueError(f"Dataset is missing required columns: {', '.join(missing)}")

    null_counts = data[list(required)].isna().sum()
    columns_with_nulls = null_counts[null_counts > 0]
    if not columns_with_nulls.empty:
        details = ", ".join(
            f"{column}={count}" for column, count in columns_with_nulls.items()
        )
        raise ValueError(f"Required columns contain missing values: {details}")

    for target in MODEL_FILES:
        if data[target].nunique() < 2:
            raise ValueError(f"Target '{target}' needs at least two classes.")


def prepare_features(
    data: pd.DataFrame,
) -> tuple[pd.DataFrame, dict[str, LabelEncoder]]:
    features = data[FEATURE_COLUMNS].copy()
    encoders: dict[str, LabelEncoder] = {}

    for column in CATEGORICAL_FEATURES:
        encoder = LabelEncoder()
        features[column] = encoder.fit_transform(features[column].astype(str))
        encoders[column] = encoder

    return features, encoders


def train(args: argparse.Namespace) -> dict[str, object]:
    dataset_path = args.dataset.resolve()
    output_dir = args.output_dir.resolve()

    data = pd.read_csv(dataset_path)
    validate_dataset(data)

    original_rows = len(data)
    data = data.drop_duplicates().reset_index(drop=True)
    features, encoders = prepare_features(data)

    output_dir.mkdir(parents=True, exist_ok=True)
    metrics: dict[str, object] = {
        "dataset": str(dataset_path),
        "rows_loaded": original_rows,
        "rows_used": len(data),
        "duplicates_removed": original_rows - len(data),
        "test_size": args.test_size,
        "random_state": args.random_state,
        "runtime_versions": {
            "python": platform.python_version(),
            "pandas": pd.__version__,
            "scikit_learn": sklearn.__version__,
            "joblib": joblib.__version__,
        },
        "data_warning": (
            "This repository dataset is dummy data. Metrics measure how well the "
            "model reproduces its labels, not performance on real production products."
        ),
        "targets": {},
    }

    for target, filename in MODEL_FILES.items():
        target_values = data[target].copy()
        if target == "recommended_material":
            material_encoder = LabelEncoder()
            target_values = pd.Series(
                material_encoder.fit_transform(target_values.astype(str)),
                index=target_values.index,
            )
            encoders[target] = material_encoder

        x_train, x_test, y_train, y_test = train_test_split(
            features,
            target_values,
            test_size=args.test_size,
            random_state=args.random_state,
            stratify=target_values,
        )

        model = RandomForestClassifier(
            n_estimators=500,
            class_weight="balanced_subsample",
            min_samples_leaf=1,
            random_state=args.random_state,
            # One worker also works in restricted Windows environments.
            n_jobs=1,
        )
        model.fit(x_train, y_train)
        predictions = model.predict(x_test)

        labels = sorted(pd.Series(target_values).unique().tolist())
        original_class_counts = data[target].value_counts().sort_index()
        if target == "recommended_material":
            class_labels = encoders[target].classes_.tolist()
        else:
            class_labels = [str(label) for label in labels]
        target_metrics = {
            "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
            "majority_baseline_accuracy": round(
                float(original_class_counts.max() / original_class_counts.sum()), 4
            ),
            "balanced_accuracy": round(
                float(balanced_accuracy_score(y_test, predictions)), 4
            ),
            "macro_f1": round(
                float(f1_score(y_test, predictions, average="macro", zero_division=0)),
                4,
            ),
            "weighted_f1": round(
                float(
                    f1_score(y_test, predictions, average="weighted", zero_division=0)
                ),
                4,
            ),
            "class_labels": class_labels,
            "class_counts": {
                str(label): int(count)
                for label, count in original_class_counts.items()
            },
            "confusion_matrix": confusion_matrix(
                y_test, predictions, labels=labels
            ).tolist(),
        }
        metrics["targets"][target] = target_metrics
        joblib.dump(model, output_dir / filename)

        print(
            f"{target:28} "
            f"accuracy={target_metrics['accuracy']:.4f} "
            f"balanced_accuracy={target_metrics['balanced_accuracy']:.4f} "
            f"macro_f1={target_metrics['macro_f1']:.4f}"
        )

    joblib.dump(encoders, output_dir / "label_encoders.pkl")
    (output_dir / "metrics.json").write_text(
        json.dumps(metrics, indent=2), encoding="utf-8"
    )

    print(f"\nNew artifacts written to: {output_dir}")
    print("The existing API models were not changed.")
    return metrics


if __name__ == "__main__":
    train(parse_args())
