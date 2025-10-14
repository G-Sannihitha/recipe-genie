from fastapi import APIRouter
from ..services.llm import ask_llm

router = APIRouter()

@router.get("/")
def list_recipes():
    prompt = (
        "List 5 popular Indian recipes with their names and categories in JSON format. "
        "Example: [{\"name\": \"Paneer Butter Masala\", \"category\": \"Main Course\"}, ...]"
    )
    try:
        response = ask_llm(prompt)
        return {"recipes": response}
    except Exception as e:
        return {"error": str(e)}
