# 👨‍🍳 Recipe Genie - AI Chef Assistant

**Recipe Genie** is an AI-powered cooking companion that helps you discover, generate, and refine recipes through natural conversation.  
It’s built with **React**, **FastAPI**, **Firebase**, and the **OpenAI API**, delivering a ChatGPT-style interface tailored for food lovers.


## Features
- Chat-based recipe generation (ChatGPT-style UI)
- Personalized cooking suggestions using OpenAI API
- Step-by-step instructions and smart tips
- Light / Dark theme toggle
- Google and Email authentication via Firebase
- Chat history with edit and delete options
- Fully responsive for mobile and desktop

## Tech Stack
| Layer | Technology |
|-------|-------------|
| **Frontend** | React (Vite) + TailwindCSS |
| **Backend** | FastAPI (Python) |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Authentication |
| **AI** | OpenAI API |
| **Hosting** | Render / Vercel (optional) |


## Getting Started

### 1️ Clone the Repository
Go to your terminal, navigate to your preferred folder, and clone the project using  
`git clone https://github.com/Sannihitha167/recipe-genie.git`  
Then enter the folder using  
`cd recipe-genie`

### 2️ Setup the Backend
Navigate into the backend folder using  
`cd backend`  
Install all dependencies using  
`pip install -r requirements.txt`  
Then start the backend server using  
`uvicorn main:app --reload`

### 3️ Setup the Frontend
Move into the frontend folder using  
`cd frontend`  
Install required packages using  
`npm install`  
Then start the frontend server with  
`npm start`

### 4️ Configure Environment Variables
Create `.env` files in both `frontend/` and `backend/` folders with the following keys.

For backend:
- OPENAI_API_KEY = your_openai_key_here

For frontend:
- VITE_FIREBASE_API_KEY = your_firebase_key_here  
- VITE_FIREBASE_AUTH_DOMAIN = your_auth_domain  
- VITE_FIREBASE_PROJECT_ID = your_project_id  
- VITE_FIREBASE_STORAGE_BUCKET = your_bucket  
- VITE_FIREBASE_MESSAGING_SENDER_ID = your_sender_id  
- VITE_FIREBASE_APP_ID = your_app_id

### 5️ Run the App
Once both servers are running:
- The **backend** will be accessible from your configured FastAPI host and port.  
- The **frontend** will be accessible from your React/Vite development server or deployment URL.

🎉 Your Recipe Genie AI assistant is now live!


## Screenshots



