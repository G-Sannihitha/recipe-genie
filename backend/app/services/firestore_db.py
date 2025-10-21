import datetime
import os
import firebase_admin
from firebase_admin import credentials, firestore

# === Determine the correct Firebase credentials path ===
# Use Render's mounted secret file if available, otherwise fall back to local.
cred_path = "/etc/secrets/serviceAccountKey.json"
if not os.path.exists(cred_path):
    current_dir = os.path.dirname(__file__)
    cred_path = os.path.join(current_dir, "serviceAccountKey.json")

# === Initialize Firebase only once ===
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

# Firestore client
db = firestore.client()


# ===================== Utility Functions =====================

def save_chat(user_id: str, chat_id: str, user_message: str, bot_reply: str):
    chat_ref = (
        db.collection("users")
        .document(user_id)
        .collection("conversations")
        .document(chat_id)
        .collection("messages")
    )

    # Save user message
    chat_ref.add({
        "sender": "user",
        "message": user_message,
        "timestamp": datetime.datetime.utcnow()
    })

    # Save bot reply
    chat_ref.add({
        "sender": "bot",
        "message": bot_reply,
        "timestamp": datetime.datetime.utcnow()
    })


def save_user_preferences(user_id: str, preferences: dict):
    """Save or update user preferences in Firestore."""
    pref_ref = db.collection("users").document(user_id)
    pref_ref.set({"preferences": preferences}, merge=True)


def get_user_preferences(user_id: str) -> dict:
    """Fetch user preferences from Firestore. Returns empty dict if none found."""
    pref_ref = db.collection("users").document(user_id).get()
    if pref_ref.exists:
        return pref_ref.to_dict().get("preferences", {})
    return {}


# --- Conversation state handling ---
def save_conversation_state(user_id: str, state: dict):
    """Save temporary conversation state for a user."""
    db.collection("users").document(user_id).set({"state": state}, merge=True)


def get_conversation_state(user_id: str) -> dict:
    """Get the stored conversation state for a user."""
    doc = db.collection("users").document(user_id).get()
    if doc.exists:
        return doc.to_dict().get("state", {})
    return {}


def clear_conversation_state(user_id: str):
    """Clear stored conversation state after it's resolved."""
    db.collection("users").document(user_id).update({"state": firestore.DELETE_FIELD})


def save_chat_message(user_id: str, chat_id: str, user_message: str, bot_reply: str):
    """Save a complete chat message exchange"""
    chat_ref = db.collection("users").document(user_id).collection("conversations").document(chat_id)
    
    # Generate title from first message if it's the first message
    chat_doc = chat_ref.get()
    if not chat_doc.exists or chat_doc.to_dict().get("message_count", 0) == 0:
        title = user_message[:30] + "..." if len(user_message) > 30 else user_message
        chat_ref.set({
            "title": title,
            "updated_at": datetime.datetime.utcnow(),
            "message_count": 1
        }, merge=True)
    else:
        chat_ref.update({
            "updated_at": datetime.datetime.utcnow(),
            "message_count": firestore.Increment(1)
        })
    
    # Save the actual messages
    messages_ref = chat_ref.collection("messages")
    
    # Save user message
    messages_ref.add({
        "sender": "user",
        "content": user_message,
        "timestamp": datetime.datetime.utcnow()
    })
    
    # Save bot reply
    messages_ref.add({
        "sender": "assistant",
        "content": bot_reply,
        "timestamp": datetime.datetime.utcnow()
    })
