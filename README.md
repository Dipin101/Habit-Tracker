# 🌱 Tracker App

A personal full-stack habit tracking app built out of frustration with todo-list style habit apps. This was built for one purpose — to help you stay **disciplined and consistent** by tracking your habits, mood, sleep, and memorable moments all in one place.

🔗 **Live Demo:** [habit-tracker-three-ivory.vercel.app](https://habit-tracker-three-ivory.vercel.app)

---

## 💡 Why I Built This

Most habit apps felt like todo lists — check something off today, forget about it tomorrow. I wanted something that:

- Keeps you **focused on the same habits all month** (not jumping between tasks)
- Lets you **reflect on your day** beyond just ticking boxes
- Shows you **patterns** between your mood, sleep, and consistency over time
- **Never deletes your data** — because everything you do is progress worth reflecting on

---

## ✨ Features

### 🧠 Habit Tracker

- Add up to **10 habits per month** — intentionally limited so you focus and build consistency, not scatter your energy
- Each habit can be marked as **Completed**, **Pending**, or **Not Done**
- Add a **comment** to any habit explaining why it wasn't completed
- Habits are fixed for the month once added — just update their status daily
- You get to reset or change habits at the start of next month depending on your preference

### 📖 Memorable Day

- Write up to **100 characters** to capture the most memorable thing about your day
- Expand to write a **full journal entry** if you want to elaborate
- Revisit and reflect on past entries through the analytics view

### 😴 Sleep Tracker

- Optionally enable sleep tracking (toggle on/off — no pressure)
- Log how many hours you slept
- Visualized as a **basic chart** showing your sleep over time
- No hassle of inputting time, just click on what hours you slept on the chart

### 📊 Dashboard

Your daily overview at a glance:

- 🗣 **Daily Quote** — fetched from a free API
- 😊 **Mood Input** — rate your mood from 1–10
- 🔥 **Streak Tracker** — checks your latest interaction date, counts consecutive days, resets to 0 if a day is missed
- ✅ **Completed Habits %** — today's completion rate
- 😴 **Average Sleep** — monthly average
- 📅 **Month's Total Completion Rate**

### 📅 Monthly Analytics

My favorite feature. Click any month card to get a full breakdown:

- **Card View** — each month displayed as a card, color gets darker the more consistently you used the app.
  Grey = no data or future month.
  Green = current month.

Clicking a month opens a **detailed report with 4 tabs:**

**Habits Tab**

- Grid view of your habit consistency
- Overall completion (completed out of total)
- Most consistent habit ranked at the top

**Sleep Tab**

- Sleep rate and trend for the month
- Weekly data displayed above the chart
- Shows how many days were recorded (so you know how accurate the data is)
- Calendar view with sleep hours per day

**Memorable Tab**

- Calendar view with a peek at each day's memorable entry
- Click any day to open a **modal** with your full journal entry
- List view of all entries
- Ability to **favourite** memorable moments

**Mood Tab**

- Average mood for the month (1–10 converted to a 5-star rating)
- Your **best day** and **worst day**
- Calendar view with mood per day
- **Mood + Sleep Correlation** — visualizes your sleep hours alongside your mood score and habit completion.
- Highlights whether it was a "perfect day" with a combined score.

> 💡 _The mood-sleep correlation was inspired by wanting to understand: does sleeping more actually make me more productive and happier? Now I can see it._

---

## 🔐 Authentication

- **Google Sign-In** via Firebase
- **Manual signup and login** connected to Firebase
- **Password reset** via Firebase's `sendPasswordResetEmail`
- **Update profile** — name and phone number (email excluded) using PATCH
- Protected dashboard routes for authenticated users only

---

## 🎨 UI / UX

- Mobile-first responsive design
- Dynamic **sidebar** on desktop after login
- **Bottom navigation bar** on mobile for the dashboard
- Forms validated with **React Hook Form**
- Icons via **React Icons**
- Regular emojis used as they suited better than react icons
- Typography via **Google Fonts**
- Animations via **Framer Motion**
- Charts via **Chart.js**

---

## 🛠 Tech Stack

| Layer      | Technology                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Frontend   | React, React Router v7, React Hook Form, TailwindCSS, Framer Motion, Chart.js, React Icons, Luxons for Dates |
| Backend    | Node.js, Express.js, Nodemon                                                                                 |
| Database   | MongoDB, Mongoose (local → migrated to Atlas)                                                                |
| Auth       | Firebase (Google Sign-In + Manual + Password Reset)                                                          |
| Build Tool | Vite                                                                                                         |
| Deployment | Frontend: Vercel · Backend: Render                                                                           |

---

## 📁 Project Structure

### Frontend (`client/src`)

```
src/
├── assets/
│   └── screenshots/
├── components/
│   ├── analytics/
│   │   ├── CompletionRing.jsx
│   │   ├── Legend.jsx
│   │   ├── NotebookCard.jsx
│   │   └── RuledLines.jsx
│   ├── monthAnalytics/
│   │   └── shared/
│   │       ├── CommentModal.jsx
│   │       ├── DiaryPage.jsx
│   │       └── StatCard.jsx
│   │   └── tabs/
│   │       ├── HabitsTab.jsx
│   │       ├── MemorableTab.jsx
│   │       ├── MoodTab.jsx
│   │       └── SleepTab.jsx
│   ├── CompletedTask.jsx
│   ├── CompletionCard.jsx
│   ├── HabitsToTrack.jsx
│   ├── Loading.jsx
│   ├── MemorableDay.jsx
│   ├── MonthlyOverview.jsx
│   ├── MoodMeter.jsx
│   ├── Navbar.jsx
│   ├── QuoteCard.jsx
│   ├── SleepCompletion.jsx
│   ├── SleepCycle.jsx
│   ├── StickyFeature.jsx
│   ├── StreakCard.jsx
│   ├── Tab.jsx
│   ├── TodayHabits.jsx
│   └── ZoomBridge.jsx
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── Dashboard/
│   ├── Analytics.jsx
│   ├── AnalyticsMonth.jsx
│   ├── HabitTrack.jsx
│   ├── Homepage.jsx
│   ├── Profile.jsx
│   ├── Signin.jsx
│   └── Signup.jsx
├── api.js
├── App.jsx
├── firebase.js
└── main.jsx
```

### Backend (`server/`)

```
server/
├── config/
│   └── .env
├── controller/
│   ├── Analytics/
│   │   ├── getMonthAnalytics.js
│   │   └── getMonthsSummary.js
│   ├── authController/
│   │   ├── googleAuth.js
│   │   ├── register.js
│   │   └── signin.js
│   ├── dashboardController/
│   │   ├── getAvgSleep.js
│   │   ├── getMonthlyOverview.js
│   │   ├── getTodayCompletion.js
│   │   ├── MoodController.js
│   │   └── postStreak.js
│   ├── habitsController/
│   │   ├── createMemorable.js
│   │   ├── getHabits.js
│   │   ├── getMemorable.js
│   │   ├── getMonth.js
│   │   ├── getQuote.js
│   │   ├── getSleep.js
│   │   ├── postHabits.js
│   │   ├── postMonths.js
│   │   └── postSleep.js
│   └── profileController/
│       ├── getProfile.js
│       └── updateProfile.js
├── database/
│   └── db.js
├── firebase/
│   └── firebaseAdmin.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Habits.js
│   └── Users.js
├── routes/
│   └── users.js
└── server.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v20+
- MongoDB local or [MongoDB Atlas](https://www.mongodb.com/atlas)
- Firebase project (for authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/Dipin101/Tracker.git
cd Tracker
```

### 2. Set Up the Server

```bash
cd server
npm install
```

Create a `.env` file inside `server/config/`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

Start the server:

```bash
npm run dev
```

### 3. Set Up the Client

```bash
cd client
npm install
```

Create a `.env` file in the `client/` root:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## 🔌 API Endpoints

> Note: This app uses `GET`, `POST`, and `PATCH` only. Data is never deleted — every entry is a record of progress worth keeping.

### Auth

| Method | Endpoint                | Description                 |
| ------ | ----------------------- | --------------------------- |
| POST   | `/api/users/register`   | Register new user           |
| POST   | `/api/users/signin`     | Sign in with email/password |
| POST   | `/api/users/googleauth` | Sign in with Google         |

### Habits

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | `/api/users/habits/:userId` | Get habits for the month |
| POST   | `/api/users/habits`         | Add a new habit          |

### Dashboard

| Method | Endpoint                                   | Description              |
| ------ | ------------------------------------------ | ------------------------ |
| GET    | `/api/users/quote`                         | Get daily quote          |
| GET    | `/api/users/completion`                    | Get today's completion % |
| GET    | `/api/users/months-summary/:userId/:year`  | Get monthly overview     |
| GET    | `/api/users/avgsleep/:userId/:year/:month` | Get average sleep        |
| POST   | `/api/users/streak`                        | Update streak            |
| POST   | `/api/users/mood-save`                     | Log mood                 |

### Sleep

| Method | Endpoint                                | Description     |
| ------ | --------------------------------------- | --------------- |
| GET    | `/api/users/sleep/:userId/:year/:month` | Get sleep data  |
| POST   | `/api/users/sleep`                      | Log sleep hours |

### Memorable

| Method | Endpoint                                         | Description            |
| ------ | ------------------------------------------------ | ---------------------- |
| GET    | `/api/users/memorable/:userId/:year/:month/:day` | Get memorable entries  |
| POST   | `/api/users/memorable`                           | Create memorable entry |

### Analytics

| Method | Endpoint                                    | Description                  |
| ------ | ------------------------------------------- | ---------------------------- |
| GET    | `/api/users/months-summary/:userId/:year`   | Get months summary           |
| GET    | `/api/users/analytics/:userId/:year/:month` | Get detailed month analytics |

### Profile

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| GET    | `/api/users/getProfile`    | Get user profile      |
| PATCH  | `/api/users/updateProfile` | Update name and phone |

---

## 👤 Author

**Dipin** — [github.com/Dipin101](https://github.com/Dipin101)
