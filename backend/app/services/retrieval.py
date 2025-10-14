from backend.app.services.llm import ask_llm  # ✅ fixed path

def handle_user_query(message: str, user_id: str = None):
    """
    Process the user query and return an AI-generated response.
    """
    print(f"User {user_id} asked: {message}")

    reply = ask_llm(message)
    return reply
