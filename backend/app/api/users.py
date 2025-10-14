# backend/app/api/users.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/me")
def get_user():
    return {"user": "demo_user", "preferences": []}
