# backend/app/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.llm import ask_llm
from app.services.conversation_service import (
    create_new_chat,
    get_user_chats,
    save_chat_message,
    get_chat_messages,
    update_chat_title,
    delete_chat,
)
from dotenv import load_dotenv
import os
import re

load_dotenv()

app = FastAPI(title="Recipe Genie API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Recipe Genie backend running ✅"}


# 🟢 Create new chat
@app.post("/chat/new")
def new_chat(request: dict):
    user_id = request.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    chat_id = create_new_chat(user_id)
    return {"chat_id": chat_id}


# 🟢 Get all chats for user
@app.get("/chat/chats/{user_id}")
def load_user_chats(user_id: str):
    try:
        chats = get_user_chats(user_id)
        return {"chats": chats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🟢 Get messages of a specific chat
@app.get("/chat/messages/{user_id}/{chat_id}")
def load_chat_messages(user_id: str, chat_id: str):
    try:
        messages = get_chat_messages(user_id, chat_id)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🟢 Send message to AI + save in Firestore
@app.post("/chat/message")
def send_message(request: dict):
    user_id = request.get("user_id")
    chat_id = request.get("chat_id")
    user_message = request.get("message")

    if not user_id or not user_message:
        raise HTTPException(status_code=400, detail="Missing fields")

    # Simply pass the user message to llm.py - the system prompt there handles everything
    reply = ask_llm(user_message)

    # Clean any potential markdown that might slip through
    reply = clean_all_markdown(reply)

    # Save conversation to Firestore
    save_chat_message(user_id, chat_id, user_message, reply)

    return {"reply": reply, "chat_id": chat_id}


def clean_all_markdown(text: str) -> str:
    """Completely remove all markdown formatting as a backup"""
    if not text:
        return text
    
    # Remove all bold **text**
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    
    # Remove all italic *text* or _text_
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    text = re.sub(r'_(.*?)_', r'\1', text)
    
    # Remove headers # Header
    text = re.sub(r'^#+\s*(.*?)$', r'\1', text, flags=re.MULTILINE)
    
    # Remove inline code `text`
    text = re.sub(r'`(.*?)`', r'\1', text)
    
    # Remove markdown links [text](url)
    text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)
    
    # Remove horizontal rules ---
    text = re.sub(r'^---+\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^___+\s*$', '', text, flags=re.MULTILINE)
    
    # Remove blockquotes >
    text = re.sub(r'^>\s*', '', text, flags=re.MULTILINE)
    
    # Ensure proper spacing
    text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)  # Replace 3+ line breaks with 2
    
    return text.strip()


# 🟢 Rename chat title
@app.put("/chat/title")
def rename_chat(request: dict):
    user_id = request.get("user_id")
    chat_id = request.get("chat_id")
    title = request.get("title")
    if not all([user_id, chat_id, title]):
        raise HTTPException(status_code=400, detail="Missing parameters")
    update_chat_title(user_id, chat_id, title)
    return {"status": "success"}


# 🟢 Delete chat
@app.delete("/chat/{user_id}/{chat_id}")
def remove_chat(user_id: str, chat_id: str):
    try:
        delete_chat(user_id, chat_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🩵 Health check
@app.get("/health")
def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)