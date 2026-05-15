const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'true-false', 'short-answer'], default: 'mcq' },
  options: [{ text: String, isCorrect: Boolean }],
  correctAnswer: String,
  explanation: String,
  points: { type: Number, default: 10 }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  module: { type: mongoose.Schema.Types.ObjectId },
  lesson: { type: mongoose.Schema.Types.ObjectId },
  questions: [questionSchema],
  passingScore: { type: Number, default: 70 },
  timeLimit: { type: Number, default: 30 }, // in minutes
  xpReward: { type: Number, default: 100 },
  attempts: { type: Number, default: 3 }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
