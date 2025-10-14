# backend/app/services/conversation_service.py
import uuid
import datetime
from .firestore_db import db, firestore

def create_new_chat(user_id: str, title: str = "New Chat"):
    """Create a new chat conversation"""
    chat_id = str(uuid.uuid4())
    chat_data = {
        "id": chat_id,
        "title": title,
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow(),
        "message_count": 0  # Initialize with 0 messages
    }
    
    db.collection("users").document(user_id).collection("conversations").document(chat_id).set(chat_data)
    return chat_id

def get_user_chats(user_id: str, limit: int = 20):
    """Get user's recent chats"""
    chats_ref = db.collection("users").document(user_id).collection("conversations")
    docs = chats_ref.order_by("updated_at", direction=firestore.Query.DESCENDING).limit(limit).stream()
    
    chats = []
    for doc in docs:
        chat_data = doc.to_dict()
        chat_data["id"] = doc.id
        chats.append(chat_data)
    
    return chats

def update_chat_title(user_id: str, chat_id: str, title: str):
    """Update chat title"""
    chat_ref = db.collection("users").document(user_id).collection("conversations").document(chat_id)
    chat_ref.update({
        "title": title,
        "updated_at": datetime.datetime.utcnow()
    })

def delete_chat(user_id: str, chat_id: str):
    """Delete a chat and all its messages"""
    chat_ref = db.collection("users").document(user_id).collection("conversations").document(chat_id)
    
    # Delete all messages in the chat
    messages_ref = chat_ref.collection("messages")
    docs = messages_ref.stream()
    for doc in docs:
        doc.reference.delete()
    
    # Delete the chat document
    chat_ref.delete()

def save_chat_message(user_id: str, chat_id: str, user_message: str, bot_reply: str):
    """Save a complete chat message exchange"""
    # Update chat metadata
    chat_ref = db.collection("users").document(user_id).collection("conversations").document(chat_id)
    
    # Get current chat data to check if it's the first message
    chat_doc = chat_ref.get()
    
    if not chat_doc.exists or chat_doc.to_dict().get("message_count", 0) == 0:
        # This is the first message - generate title from user message
        title = user_message[:30] + "..." if len(user_message) > 30 else user_message
        chat_ref.set({
            "id": chat_id,
            "title": title,
            "updated_at": datetime.datetime.utcnow(),
            "message_count": 1,
            "created_at": datetime.datetime.utcnow()
        })
    else:
        # Update existing chat
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

def get_chat_messages(user_id: str, chat_id: str):
    """Get all messages for a specific chat"""
    messages_ref = db.collection("users").document(user_id).collection("conversations").document(chat_id).collection("messages")
    docs = messages_ref.order_by("timestamp").stream()
    
    messages = []
    for doc in docs:
        message_data = doc.to_dict()
        messages.append({
            "role": message_data["sender"],
            "content": message_data["content"],
            "timestamp": message_data["timestamp"]
        })
    
    return messages