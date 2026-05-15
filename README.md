# EduPulse — E-Learning Platform 

A gamified e-learning platform with XP, leaderboards, quizzes, and performance analytics.
Built with **MongoDB + Express + React + Node.js (MERN)**.

---

## What you need before starting

Install these two things (free):

1. **Node.js** — https://nodejs.org (download the LTS version, v18 or higher)
2. **MongoDB Community** — https://www.mongodb.com/try/download/community

That's it. No Docker. No cloud accounts needed.

---

## How to run it

### Mac / Linux

Open a terminal in the project folder and run:

```bash
bash start.sh
```

This will:
- Start MongoDB automatically
- Install all dependencies
- Add sample courses, users, and data to the database
- Open the app at http://localhost:3000

### Windows

Double-click **start-windows.bat**

> Note: MongoDB must already be installed and in your PATH.
> If it isn't, start MongoDB manually from the Start Menu first.

---

## Logging in

Once it's running, go to http://localhost:3000 and use these accounts:

| Who        | Email                    | Password      |
|------------|--------------------------|---------------|
| Student    | student@elearn.dev       | password123   |
| Instructor | sarah@elearn.dev         | password123   |

---

## What's in the app

### As a Student
- Browse and enroll in courses
- Watch lessons, mark them complete, earn XP
- Take quizzes with instant scoring
- Track your progress with charts on the Analytics page
- Compete on the global Leaderboard
- Earn badges and level up

### As an Instructor
- Create courses with modules and lessons
- See how many students enrolled and their progress
- View which students are performing best

---

## Manual setup (if the start script doesn't work)

Open **three separate terminals**:

**Terminal 1 — MongoDB**
```bash
mongod
```

**Terminal 2 — Backend**
```bash
cd backend
npm install
node seed.js      # only needed once, adds sample data
npm run dev
```

**Terminal 3 — Frontend**
```bash
cd client
npm install
npm start
```

Then open http://localhost:3000

---

## Project layout

```
edupulse/
├── backend/          ← The server (Node.js + Express + MongoDB)
│   ├── models/       ← Database schemas (User, Course, Progress, Quiz)
│   ├── routes/       ← API endpoints
│   ├── seed.js       ← Adds sample data to the database
│   └── server.js     ← Starts the backend
│
├── client/           ← The website (React)
│   └── src/
│       ├── pages/    ← Every page of the app
│       ├── context/  ← Login state shared across pages
│       └── styles/   ← Global CSS design tokens
│
├── start.sh          ← One-click start (Mac/Linux)
├── start-windows.bat ← One-click start (Windows)
└── README.md         ← This file
```

---

## Stopping the app

- **Mac/Linux:** Press `Ctrl + C` in the terminal running `start.sh`
- **Windows:** Close the two terminal windows that opened

---

## Common problems

**"Port 3000 already in use"**
Something else is using that port. Either close it, or in `client/package.json` set `"start": "PORT=3001 react-scripts start"`.

**"Cannot connect to MongoDB"**
Make sure MongoDB is running. On Mac you can start it with `brew services start mongodb-community`.

**"Module not found"**
Run `npm install` inside both the `backend/` and `client/` folders.

**Want to reset the database?**
Delete the `.seeded` file and run `node seed.js` again inside the `backend/` folder.
