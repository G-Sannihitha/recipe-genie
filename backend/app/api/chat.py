# backend/app/api/chat.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.llm import ask_llm
from app.services.conversation_service import (
    create_new_chat, 
    save_chat_message, 
    get_user_chats, 
    get_chat_messages,
    update_chat_title,
    delete_chat
)

router = APIRouter()

class ChatRequest(BaseModel):
    user_id: str
    chat_id: str = None
    message: str

class ChatResponse(BaseModel):
    reply: str
    chat_id: str

class NewChatRequest(BaseModel):
    user_id: str

class NewChatResponse(BaseModel):
    chat_id: str

class ChatTitleUpdate(BaseModel):
    user_id: str
    chat_id: str
    title: str

@router.post("/new", response_model=NewChatResponse)
async def create_chat(request: NewChatRequest):
    try:
        chat_id = create_new_chat(request.user_id)
        return {"chat_id": chat_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating chat: {str(e)}")

@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    try:
        # If no chat_id provided, create a new one
        if not request.chat_id:
            chat_id = create_new_chat(request.user_id)
        else:
            chat_id = request.chat_id

        # Get AI response
        reply = ask_llm(request.message)
        
        # Save conversation to Firestore
        save_chat_message(request.user_id, chat_id, request.message, reply)
        
        return {"reply": reply, "chat_id": chat_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@router.get("/chats/{user_id}")
async def get_chats(user_id: str):
    try:
        chats = get_user_chats(user_id)
        return {"chats": chats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chats: {str(e)}")

@router.get("/messages/{user_id}/{chat_id}")
async def get_messages(user_id: str, chat_id: str):
    try:
        messages = get_chat_messages(user_id, chat_id)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching messages: {str(e)}")

@router.put("/title")
async def update_title(request: ChatTitleUpdate):
    try:
        update_chat_title(request.user_id, request.chat_id, request.title)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating title: {str(e)}")

@router.delete("/{user_id}/{chat_id}")
async def delete_user_chat(user_id: str, chat_id: str):
    try:
        delete_chat(user_id, chat_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting chat: {str(e)}")