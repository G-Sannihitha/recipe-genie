# 👨‍🍳 Recipe Genie - AI Chef Assistant

**Recipe Genie** is an AI-powered cooking companion that helps you discover, generate, and refine recipes through natural conversation.  
It’s built with **React**, **FastAPI**, **Firebase**, and the **OpenAI API**, delivering a ChatGPT-style interface tailored for food lovers.

## Live Demo
Experience it here → [https://recipe-genie-frontend.onrender.com](https://recipe-genie-frontend.onrender.com)

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
`git clone https://github.com/G-Sannihitha/recipe-genie.git`  
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

### Screenshots
### Desktop Version:
<img width="1915" height="965" alt="image" src="https://github.com/user-attachments/assets/6a0f3810-ef80-4c15-9e28-2c79a32ea25a" />
<img width="1917" height="970" alt="image" src="https://github.com/user-attachments/assets/c8635da1-7c73-47d9-bad4-1bbfe1515e8b" />
<img width="1919" height="880" alt="image" src="https://github.com/user-attachments/assets/3d5404ed-c570-423b-b644-3446aa5430d1" />
<img width="1919" height="884" alt="image" src="https://github.com/user-attachments/assets/e74ece0f-1f8b-4ca1-a5e3-9165474e4e33" />
<img width="1919" height="876" alt="image" src="https://github.com/user-attachments/assets/196ff6cf-a5b2-4ffd-9ccb-c39581eb5ab0" />
<img width="1919" height="874" alt="image" src="https://github.com/user-attachments/assets/614726cc-f96b-476f-8c77-1bd22550c05f" />
<img width="1919" height="870" alt="image" src="https://github.com/user-attachments/assets/e3fd79f3-9b26-461b-9ba7-9af36a617890" />
<img width="1919" height="874" alt="image" src="https://github.com/user-attachments/assets/fc6c8854-8051-4891-91f4-4c7a661e53f8" />
<img width="1917" height="876" alt="image" src="https://github.com/user-attachments/assets/ff0396f7-1dc4-497a-8fc7-231a5da505d6" />
<img width="1915" height="865" alt="image" src="https://github.com/user-attachments/assets/ded648c0-e495-4ae1-ba0e-094428f1cfef" />
<img width="1918" height="967" alt="image" src="https://github.com/user-attachments/assets/e2cf0f19-a3ed-4c44-a89f-eb21acac68f5" />

### Mobile Version:
<img width="390" height="835" alt="image" src="https://github.com/user-attachments/assets/d0e5b70e-a31e-4f21-8f98-f2eba27ff5fa" />

<img width="387" height="835" alt="image" src="https://github.com/user-attachments/assets/4fbf05f5-3117-4b6b-b628-7f1b5125a6a9" />

<img width="390" height="789" alt="image" src="https://github.com/user-attachments/assets/a78baabd-038b-4095-a3c2-0f59804ad532" />

<img width="388" height="790" alt="image" src="https://github.com/user-attachments/assets/032ee579-6041-444f-913b-7d9864548b9b" />

<img width="386" height="790" alt="image" src="https://github.com/user-attachments/assets/2725564d-63db-4446-b202-4e5a21e7570c" />

<img width="391" height="790" alt="image" src="https://github.com/user-attachments/assets/4d42587b-d880-4946-a353-fdb4def30d1e" />

<img width="391" height="785" alt="image" src="https://github.com/user-attachments/assets/19d1a12b-0d8e-4846-81f8-eeec37eaaac5" />

<img width="386" height="785" alt="image" src="https://github.com/user-attachments/assets/795cfb3c-9347-4e92-896f-46dff3264748" />

<img width="386" height="785" alt="image" src="https://github.com/user-attachments/assets/5f2a53be-f204-4b2b-baa9-f55ba2156ec8" />

<img width="388" height="794" alt="image" src="https://github.com/user-attachments/assets/1453b466-dba3-4ff3-9c81-9fa051957497" />

<img width="383" height="715" alt="image" src="https://github.com/user-attachments/assets/1d19cfb6-d8db-4b06-92fd-a15b94b72242" />

<img width="383" height="716" alt="image" src="https://github.com/user-attachments/assets/b17ee628-4bed-46fc-84d0-8092acec86fb" />


### Author
👩‍💻 Sannihitha Gudimalla
M.S. Computer Science @ Illinois Institute of Technology


