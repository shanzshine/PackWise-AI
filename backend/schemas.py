from pydantic import BaseModel
from typing import List

class PredictionRequest(BaseModel):
    product_family: str
    articulation: str
    pose: str
    product_weight_g: float
    height_cm: float
    center_of_gravity: str
    hair_length: str
    dress_length: str
    accessory_count: int
    accessory_weight_g: float
    selected_accessories: List[str]

class PredictionResponse(BaseModel):
    recommended_head_strap: int
    recommended_waist_strap: int
    recommended_hand_strap: int
    recommended_leg_strap: int
    recommended_back_support: int
    recommended_base_support: int
    recommended_material: str
