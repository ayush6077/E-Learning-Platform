#!/bin/bash
echo ""
echo "🚀 Starting EduPulse..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Download from https://nodejs.org (use v18 or higher)"
  exit 1
fi

# Check MongoDB
if ! command -v mongod &> /dev/null; then
  echo "❌ MongoDB not found. Download from https://www.mongodb.com/try/download/community"
  exit 1
fi

# Start MongoDB in background if not running
if ! pgrep -x "mongod" > /dev/null; then
  echo "▶ Starting MongoDB..."
  mkdir -p ./data/db
  mongod --dbpath ./data/db --fork --logpath ./data/mongo.log
  sleep 2
  echo "✅ MongoDB started"
else
  echo "✅ MongoDB already running"
fi

# Install backend deps if needed
if [ ! -d "backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd backend && npm install && cd ..
fi

# Install client deps if needed
if [ ! -d "client/node_modules" ]; then
  echo "📦 Installing client dependencies..."
  cd client && npm install && cd ..
fi

# Seed database (only first time)
if [ ! -f ".seeded" ]; then
  echo "🌱 Seeding database with sample data..."
  cd backend && node seed.js && cd ..
  touch .seeded
fi

echo ""
echo "▶ Starting backend on http://localhost:5000"
cd backend && npm run dev &
BACKEND_PID=$!

sleep 2

echo "▶ Starting frontend on http://localhost:3000"
cd ../client && npm start &
FRONTEND_PID=$!

echo ""
echo "✅ EduPulse is running!"
echo "   Frontend → http://localhost:3000"
echo "   Backend  → http://localhost:5000"
echo ""
echo "   Demo login: student@elearn.dev / password123"
echo ""
echo "Press Ctrl+C to stop everything."

# Wait and clean up on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
