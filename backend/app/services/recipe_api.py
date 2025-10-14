import requests

BASE_URL = "https://www.themealdb.com/api/json/v1/1"

def search_meals_by_ingredient(ingredient):
    url = f"{BASE_URL}/filter.php?i={ingredient}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json().get("meals", [])
    return []

def get_meal_details(meal_id):
    url = f"{BASE_URL}/lookup.php?i={meal_id}"
    response = requests.get(url)
    if response.status_code == 200:
        meals = response.json().get("meals", [])
        return meals[0] if meals else None
    return None

def suggest_recipe_by_ingredients(ingredients):
    # Simple example: search for recipes containing the first ingredient
    if not ingredients:
        return []
    meals = search_meals_by_ingredient(ingredients[0])
    detailed_meals = []
    for meal in meals:
        details = get_meal_details(meal['idMeal'])
        if details:
            detailed_meals.append(details)
    return detailed_meals
