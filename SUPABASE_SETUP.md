# I.R.I.S. — SUPABASE BACKEND INTEGRATION & DATABASE GUIDE

This guide provides step-by-step instructions for connecting I.R.I.S. to a real **Supabase** backend: PostgreSQL database, Supabase Authentication, Row Level Security (RLS), and Supabase Storage.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in or sign up.
2. Click **New Project**.
3. Choose an organization, enter a project name (e.g. `iris-educational-platform`), set a secure database password, and pick a cloud region close to your users.
4. Click **Create new project**. Provisioning takes ~1-2 minutes.

---

## 2. Run Database SQL Migration (22 Tables + RLS + Triggers)

1. In your Supabase Project dashboard, open the **SQL Editor** tab from the left sidebar.
2. Click **New query**.
3. Open the file `supabase-schema.sql` located in this repository and copy its entire contents into the SQL Editor.
4. Click **Run** (or `Ctrl/Cmd + Enter`).
5. This automatically creates:
   - **22 PostgreSQL tables**:
     1. `profiles`
     2. `user_preferences`
     3. `ai_conversations`
     4. `ai_messages`
     5. `saved_memories`
     6. `subjects`
     7. `chapters`
     8. `notes`
     9. `study_plans`
     10. `study_sessions`
     11. `tasks`
     12. `exams`
     13. `quizzes`
     14. `quiz_questions`
     15. `quiz_attempts`
     16. `flashcards`
     17. `uploaded_files`
     18. `achievements`
     19. `bookmarks`
     20. `learning_progress`
     21. `notifications`
     22. `projects`
   - **Row Level Security (RLS)** enabled on all tables, ensuring users can only read, write, update, and delete their own private academic records (`auth.uid() = user_id`).
   - Automatic user profile and preference trigger (`on_auth_user_created`) that runs whenever a new student signs up.

---

## 3. Create Storage Buckets

In the Supabase dashboard, go to **Storage > Buckets** and create the following buckets:

| Bucket Name | Public / Private | Purpose |
| :--- | :--- | :--- |
| `student-documents` | Private | Textbook PDFs, homework worksheets, problem sheets |
| `notes-attachments` | Private | Diagrams and images attached to study notes |
| `profile-avatars` | Public | Student customized profile pictures and avatars |
| `projects` | Private | Creative Lab project files and blueprints |
| `learning-resources` | Public | Shared curriculum formula books and guides |

---

## 4. Configure Environment Variables

1. In your Supabase Project, go to **Project Settings > API**.
2. Find:
   - **Project URL** (e.g., `https://xyzabcdefg.supabase.co`)
   - **Project API Keys > anon / public** key (a long JWT string)
3. Set these environment variables in your `.env` file (or in your hosting provider's environment settings):

```env
# Supabase Database & Auth Configuration
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 5. Enable Authentication Providers

1. Go to **Authentication > Providers** in your Supabase dashboard.
2. **Email**: Ensure **Email provider** is toggled ON.
   - For immediate testing without waiting for email confirmations, you can turn off **Confirm email** in **Authentication > URL Configuration / Email Templates**, or leave it on for production.
3. **Google OAuth** (Optional):
   - Toggle Google provider ON.
   - Enter your Google Cloud OAuth Client ID and Secret if you wish to allow Google one-click sign-in.

---

## 6. How I.R.I.S. Interacts with Supabase

- **Authentication:** `src/services/supabase.ts` uses `@supabase/supabase-js` to handle login, signup, password resets, session persistence, and logout.
- **Offline / Demo Resilience:** When `VITE_SUPABASE_URL` is not yet configured, I.R.I.S. automatically enables Demo Student Mode (`alex.student@iris.edu`), allowing full exploration and instant testing without blocking the UI.
- **Row Level Security (RLS):** Every table query is filtered by PostgreSQL policies on `auth.uid()`. Students cannot read or alter another student's conversations, memories, notes, or tasks.
- **Memory Vault:** Personal learning preferences and topics stored in `saved_memories` are linked directly to the student's ID and loaded on sign-in.
