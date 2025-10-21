# backend/app/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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


# 1. CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can later restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. API Endpoints
@app.get("/api")
def root():
    return {"message": "Recipe Genie backend running ✅"}


# Create new chat
@app.post("/api/chat/new")
def new_chat(request: dict):
    user_id = request.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    chat_id = create_new_chat(user_id)
    return {"chat_id": chat_id}


# Get all chats for user
@app.get("/api/chat/chats/{user_id}")
def load_user_chats(user_id: str):
    try:
        chats = get_user_chats(user_id)
        return {"chats": chats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get messages of a specific chat
@app.get("/api/chat/messages/{user_id}/{chat_id}")
def load_chat_messages(user_id: str, chat_id: str):
    try:
        messages = get_chat_messages(user_id, chat_id)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Send message to AI + save in Firestore
@app.post("/api/chat/message")
def send_message(request: dict):
    user_id = request.get("user_id")
    chat_id = request.get("chat_id")
    user_message = request.get("message")

    if not user_id or not user_message:
        raise HTTPException(status_code=400, detail="Missing fields")

    reply = ask_llm(user_message)
    reply = clean_all_markdown(reply)

    save_chat_message(user_id, chat_id, user_message, reply)
    return {"reply": reply, "chat_id": chat_id}


def clean_all_markdown(text: str) -> str:
    """Completely remove all markdown formatting as a backup"""
    if not text:
        return text

    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"\*(.*?)\*", r"\1", text)
    text = re.sub(r"_(.*?)_", r"\1", text)
    text = re.sub(r"^#+\s*(.*?)$", r"\1", text, flags=re.MULTILINE)
    text = re.sub(r"`(.*?)`", r"\1", text)
    text = re.sub(r"\[(.*?)\]\(.*?\)", r"\1", text)
    text = re.sub(r"^---+\s*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"^___+\s*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"^>\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\n\s*\n\s*\n", "\n\n", text)
    return text.strip()


# Rename chat title
@app.put("/api/chat/title")
def rename_chat(request: dict):
    user_id = request.get("user_id")
    chat_id = request.get("chat_id")
    title = request.get("title")
    if not all([user_id, chat_id, title]):
        raise HTTPException(status_code=400, detail="Missing parameters")
    update_chat_title(user_id, chat_id, title)
    return {"status": "success"}


# Delete chat
@app.delete("/api/chat/{user_id}/{chat_id}")
def remove_chat(user_id: str, chat_id: str):
    try:
        delete_chat(user_id, chat_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Health check
@app.get("/api/health")
def health():
    return {"status": "healthy"}


# 3. Serve React Frontend

frontend_path = os.path.join(os.path.dirname(__file__), "../../frontend/build")

# Serve static files (JS, CSS, media)
app.mount("/static", StaticFiles(directory=os.path.join(frontend_path, "static")), name="static")

# Serve index.html for the root route
@app.get("/")
def serve_react_index():
    index_file = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Frontend build not found. Please run npm run build in frontend."}



# 4. Run Uvicorn
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
