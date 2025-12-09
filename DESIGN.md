# 📐 Project Design & Rubric Compliance

This document outlines the design decisions, user personas, database schema, and how this project meets the requirements of the final project rubric.

## 👥 User Personas

### 1. Reflective Rachel (The Daily Journaler)
*   **Bio**: Rachel is a 28-year-old marketing manager who wants to improve her mental health. She tries to journal every day but sometimes gets writer's block.
*   **Goals**:
    *   Maintain a consistent daily habit.
    *   Get insights into her mood patterns.
    *   Have a safe, private space to vent.
*   **Pain Points**:
    *   Staring at a blank page.
    *   Forgetting to write.
    *   Feeling lonely in her reflection process.
*   **Solution**: The **AI Collaborator** feature helps Rachel by reading her draft and asking thoughtful questions to unblock her writing flow.

### 2. Busy Bob (The Quick Capturer)
*   **Bio**: Bob is a 45-year-old consultant who is always on the go. He prefers quick interactions and wants to see his progress at a glance.
*   **Goals**:
    *   Quickly jot down thoughts between meetings.
    *   See if he's been consistent with his habits.
*   **Pain Points**:
    *   Complex interfaces with too many clicks.
    *   Losing track of days he missed.
*   **Solution**: The **Visual Calendar** gives Bob an instant view of his streak, and the clean **Document Editor** lets him type without distraction.

## 📖 User Stories

1.  **Authentication**: "As a user, I want to register and log in securely so that my personal thoughts remain private."
2.  **Calendar View**: "As a user, I want to see a calendar of the entire year so I can track which days I have journaled."
3.  **Journaling**: "As a user, I want to create, read, update, and delete journal entries for specific dates."
4.  **AI Collaboration**: "As a user, I want to chat with an AI that knows what I've written in my current entry so I can get relevant feedback."
5.  **History**: "As a user, I want my chat history with the AI to be saved so I can review our conversations later."

## 🗄️ Database Schema (ERD)

The application uses a relational database (PostgreSQL) with the following schema:

### `users`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Unique user identifier |
| `email` | String | User's email address (Unique) |
| `hashed_password` | String | Bcrypt hashed password |

### `journal_entries`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Unique entry identifier |
| `date` | Date | The date of the journal entry |
| `title` | String | Title of the entry |
| `content` | Text | The main body of the journal |
| `mood` | String | Emoji representing mood |
| `owner_id` | Integer (FK) | Links to `users.id` |

### `chat_sessions`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Unique session identifier |
| `title` | String | Title of the chat session |
| `user_id` | Integer (FK) | Links to `users.id` |
| `created_at` | DateTime | Timestamp of creation |

### `chat_messages`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Unique message identifier |
| `role` | String | 'user' or 'model' |
| `content` | Text | The message text |
| `session_id` | Integer (FK) | Links to `chat_sessions.id` |

**Relationships:**
*   **One-to-Many**: A User has many Journal Entries.
*   **One-to-Many**: A User has many Chat Sessions.
*   **One-to-Many**: A Chat Session has many Chat Messages.

## ✅ Rubric Compliance Matrix

| Category | Criteria | Implementation Details |
| :--- | :--- | :--- |
| **1. Documentation** | Setup Instructions | Included in `README.md` (Local setup & Deployment). |
| | Tech Stack | Listed in `README.md`. |
| | Environment Variables | Documented in `README.md`. |
| | Design Doc | This file (`DESIGN.md`) covers Personas, Stories, and Schema. |
| **2. Frontend** | Components | React components (`Calendar.jsx`, `AITalk.jsx`, etc.) are modular. |
| | Framework | Built with **React** and **Vite**. |
| | Responsive UI | **Tailwind CSS** used. `AITalk.jsx` features a mobile-responsive tab switcher. |
| | Navigation | Client-side routing handles views (Calendar <-> Entry). |
| **3. Backend** | Framework | **FastAPI** used for high-performance async API. |
| | RESTful API | Endpoints like `GET /entries`, `POST /chat` follow REST standards. |
| | Documentation | FastAPI provides automatic Swagger UI at `/docs`. |
| | Separation of Concerns | Backend is in `/backend`, Frontend in `/frontend`. Completely decoupled. |
| **4. Database** | Persistent DB | **PostgreSQL** is used (configured in `database.py`). |
| | Relationships | One-to-Many relationships implemented (User -> Entries, Session -> Messages). |
| | CRUD | Full CRUD implemented for Journal Entries. |
| **5. AI & Agents** | AI Provider | **Google Gemini** (gemini-2.5-flash) integrated. |
| | Context/Agent | The "AI Collaborator" injects the current journal content into the prompt context, acting as an editor agent. |
| | Value Add | AI helps overcome writer's block, a core value proposition. |
| **6. Code Quality** | Security | `.env` is in `.gitignore`. Passwords are hashed. |
| | Git History | Regular commits (simulated via agent interactions). |
| | Formatting | Code follows standard Python (PEP8) and React conventions. |
| **7. Hosting** | Cloud Provider | Ready for deployment on Render/Vercel (Instructions in README). |
| | Public URL | *Pending final deployment step.* |
