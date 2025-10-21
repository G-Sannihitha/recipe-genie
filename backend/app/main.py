# backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.services.llm import ask_llm
from app.services.conversation_service import (
    create_new_chat, get_user_chats, save_chat_message,
    get_chat_messages, update_chat_title, delete_chat
)
import os, re

app = FastAPI(title="Recipe Genie API")

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

@app.post("/chat/new")
def new_chat(request: dict):
    user_id = request.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    return {"chat_id": create_new_chat(user_id)}

@app.get("/chat/chats/{user_id}")
def load_user_chats(user_id: str):
    return {"chats": get_user_chats(user_id)}

@app.get("/chat/messages/{user_id}/{chat_id}")
def load_chat_messages(user_id: str, chat_id: str):
    return {"messages": get_chat_messages(user_id, chat_id)}

@app.post("/chat/message")
def send_message(request: dict):
    user_id = request.get("user_id")
    chat_id = request.get("chat_id")
    message = request.get("message")
    if not user_id or not message:
        raise HTTPException(status_code=400, detail="Missing fields")
    reply = ask_llm(message)
    reply = clean_all_markdown(reply)
    save_chat_message(user_id, chat_id, message, reply)
    return {"reply": reply, "chat_id": chat_id}

def clean_all_markdown(text: str):
    if not text: return text
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"\*(.*?)\*", r"\1", text)
    text = re.sub(r"_(.*?)_", r"\1", text)
    text = re.sub(r"^#+\s*(.*?)$", r"\1", text, flags=re.MULTILINE)
    text = re.sub(r"`(.*?)`", r"\1", text)
    text = re.sub(r"\[(.*?)\]\(.*?\)", r"\1", text)
    return text.strip()

@app.put("/chat/title")
def rename_chat(request: dict):
    user_id, chat_id, title = request.get("user_id"), request.get("chat_id"), request.get("title")
    if not all([user_id, chat_id, title]):
        raise HTTPException(status_code=400, detail="Missing parameters")
    update_chat_title(user_id, chat_id, title)
    return {"status": "success"}

@app.delete("/chat/{user_id}/{chat_id}")
def remove_chat(user_id: str, chat_id: str):
    delete_chat(user_id, chat_id)
    return {"status": "success"}

@app.get("/health")
def health():
    return {"status": "healthy"}

# Serve React frontend
frontend_path = os.path.join(os.path.dirname(__file__), "../../frontend/build")
app.mount("/static", StaticFiles(directory=os.path.join(frontend_path, "static")), name="static")

@app.get("/{full_path:path}")
def serve_react(full_path: str):
    index_file = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Frontend build not found"}
