from .firestore_db import db
from google.cloud import firestore

# Save a test chat message
doc_ref = db.collection("chats").document()
doc_ref.set({
    "user_id": "test_user",
    "message": "Hello!",
    "bot_reply": "Hi there!",
    "timestamp": firestore.SERVER_TIMESTAMP
})

print("✅ Test document saved to Firestore")