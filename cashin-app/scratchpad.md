# App Flow & Component Review

## 1. Authentication (src/lib/auth.ts)
*   **Current State:** Implemented using `localStorage` for quick MVP prototyping.
*   **Functions:** `register`, `login`, `logout`, `getSession`, `updateUser`.
*   **Security Note:** Passwords are base64 encoded with a static salt (NOT secure, but fine for local MVP). It's designed to be easily swapped with Supabase Auth later (e.g., `supabase.auth.signUp()`).
*   **Data Structure:** `User` object (id, email, name, passwordHash, monthlyIncome, savingsGoalPct, createdAt).

## 2. App State & Context (src/lib/AppContext.tsx)
*   **Current State:** Uses React Context (`AppProvider`, `useApp`) to manage global state.
*   **Data Managed:**
    *   `user`: Current logged-in user.
    *   `transactions`: List of transactions for the current user (loaded/saved to `localStorage` per user ID).
    *   `dashboard`: Computed dashboard metrics (available balance, progress, etc.) via `computeDashboard`.
*   **Functions:** `categorize` (calls `/api/categorize`), `addTransaction`, `deleteTransaction`, `updateProfile`, `logout`, `refreshUser`, `getFinancialContext`.
*   **Issue:** The onboarding page (`src/app/page.tsx`) needs to be updated to use the new authentication flow (login/register) instead of just setting a name. It also needs to redirect to dashboard only if logged in.

## 3. Data Models & Utils (src/lib/types.ts & src/lib/utils.ts)
*   **Types:** Clear interfaces for `User`, `Transaction`, `DashboardData`, and `UserFinancialContext`.
*   **Utils:** Formatting (`formatCurrency`, `formatDate`), calculating dashboard metrics (`computeDashboard`), and generating context for the AI (`buildFinancialContext`).

## 4. API Routes (src/app/api/*)
*   **`/api/categorize`:**
    *   Uses Groq + Llama 3.1 8B (fast model).
    *   Takes text input, sanitizes it, and prompts the LLM to return a structured JSON (`amount`, `type`, `category`, `subcategory`, `emoji`, `date`, `confidence`, `description`).
    *   Works well, as seen in the previous screenshot validation.
*   **`/api/chat`:**
    *   Uses Groq + Llama 3.3 70B (smart model) with SSE streaming.
    *   System prompt sets it up as "Assistente do Cidadão" with specific guardrails.
    *   **Missing feature:** Currently, it doesn't receive the `UserFinancialContext`. The user requested that the AI be able to access the user's saved data if necessary.
*   **`/api/transactions`:**
    *   Currently an in-memory store.
    *   **Issue:** Since we moved state management to `AppContext.tsx` (using `localStorage` for now), we probably don't need this API route for the frontend right now, or it should be synced with the `localStorage` approach if we want to simulate a backend. Given we use `localStorage` in the context directly, this API route is currently redundant and unused by the updated `AppContext.tsx`.

## 5. UI Components (src/app/* & src/components/*)
*   **`layout.tsx` & `globals.css`:** Sets up the dark theme, fonts, and Tailwind styles. Looks good.
*   **`page.tsx` (Onboarding):** Currently a simple 3-step wizard. Needs to be converted to a Login/Register flow as requested.
*   **`dashboard/page.tsx`:** Displays the calculated dashboard metrics. Needs to check if the user is authenticated.
*   **`dashboard/stats/page.tsx`:** Displays category breakdown. The user requested adding a chart (like Recharts) and lateral buttons to add entries to the chart.
*   **`dashboard/chat/page.tsx`:** Real-time chat. Needs to pass the financial context to the API.
*   **`dashboard/profile/page.tsx`:** Profile management. Looks fine, but needs to use the updated `AppCtx` properly.
*   **Desktop Version:** The layout is currently restricted to mobile (`max-w-md mx-auto`). The user requested a desktop version.

## Action Plan
1.  **Refactor `src/app/page.tsx`:** Change it to a Login/Registration screen.
2.  **Update `src/app/api/chat/route.ts`:** Modify it to accept and use the `UserFinancialContext` from the frontend.
3.  **Update `src/app/dashboard/chat/page.tsx`:** Pass the financial context to the chat API.
4.  **Refactor `src/app/dashboard/stats/page.tsx`:** Add a Recharts chart and buttons to interact with it, as requested.
5.  **Desktop Layout:** Modify `src/app/layout.tsx` to handle a responsive desktop layout (e.g., sidebar instead of bottom nav on large screens).
6.  **Auth Guarding:** Ensure dashboard pages redirect to login if no user is present.
