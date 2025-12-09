# 📓 Chat Journal AI

A sophisticated, AI-powered journaling application that transforms solitary writing into a collaborative experience. Features a beautiful calendar interface, secure authentication, and an intelligent AI companion that helps you reflect on your day.

## 🚀 Features

- **🤖 AI Collaboration**: Split-screen interface where an AI assistant reads your journal entry in real-time and offers suggestions, feedback, or just chats with you about your day.
- **📅 Visual Calendar**: Year-at-a-glance view of your journaling habits with visual indicators.
- **🔐 Secure Authentication**: Full user registration and login system using JWT tokens and password hashing.
- **📝 Rich Text Editing**: Clean, distraction-free document editor for your thoughts.
- **💬 Standalone Chat**: A separate chat interface for general conversation with the AI, with history persistence.
- **📱 Mobile Responsive**: Fully responsive design that works seamlessly on desktop, tablets, and mobile devices.
- **💾 Persistent Storage**: All data is securely stored in a PostgreSQL database.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (via Vite)
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios
- **Markdown**: react-markdown (for AI responses)
- **Icons**: Heroicons

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL
- **Authentication**: OAuth2 with JWT (python-jose, passlib)
- **AI Provider**: Google Gemini (gemini-2.5-flash)

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.10+)
- PostgreSQL installed and running locally

### 1. Clone the Repository
```bash
git clone <repository-url>
cd calling-journal
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment.

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
# .venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration & Secrets
**Step 1: Get your API Keys**
*   **Gemini API Key**: Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create a free API key.
*   **Database URL**: Ensure you have PostgreSQL installed. You can use pgAdmin4 or the command line to create a database named `calling_journal`.

**Step 2: Create the Environment File**
Create a file named `.env` in the **root directory** of the project (the folder containing both `backend/` and `frontend/`).

**Step 3: Add your Secrets**
Paste the following into your `.env` file:

```env
# Database Connection (PostgreSQL)
# Format: postgresql://<username>:<password>@localhost/<database_name>
DATABASE_URL=postgresql://postgres:password@localhost/calling_journal

# AI Provider (Google Gemini)
GEMINI_API_KEY=your_actual_api_key_here

# Security (Generate a random string for this)
SECRET_KEY=change_this_to_a_secure_random_string
```

### 4. Database Setup
Before running the app, make sure the database exists:
```bash
# If using command line psql
createdb calling_journal
```
*Note: The application will automatically create the necessary tables when the backend starts.*

### 5. Start the Backend Server
Make sure you are in the `backend` directory and your virtual environment is active.

```bash
uvicorn backend.main:app --reload
```
The API will be available at `http://localhost:8000`.

### 6. Frontend Setup
Open a new terminal and navigate to the frontend directory.

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The application will open at `http://localhost:5173`.

## 🌍 Deployment Guide

### Database (PostgreSQL)
1. Create a managed PostgreSQL database on a provider like **Render**, **Neon**, or **Supabase**.
2. Copy the provided `External Database URL`.

### Backend (Render)
1. Connect your GitHub repository to **Render**.
2. Create a new **Web Service**.
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
4. **Environment Variables**: Add `DATABASE_URL`, `GEMINI_API_KEY`, and `SECRET_KEY`.

### Frontend (Vercel)
1. Connect your GitHub repository to **Vercel**.
2. Import the project and select the `frontend` folder as the root.
3. Vercel will automatically detect Vite.
4. **Environment Variables**: Add `VITE_API_URL` pointing to your deployed Backend URL (e.g., `https://your-app.onrender.com`).
   *Note: You may need to update `frontend/src/api.js` to use `import.meta.env.VITE_API_URL` instead of hardcoded localhost.*

---
*Created by Haider Amin*
