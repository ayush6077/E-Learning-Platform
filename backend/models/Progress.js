const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
  completedModules: [{ type: mongoose.Schema.Types.ObjectId }],
  currentLesson: { type: mongoose.Schema.Types.ObjectId },
  currentModule: { type: mongoose.Schema.Types.ObjectId },
  percentComplete: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 }, // in minutes
  lastAccessed: { type: Date, default: Date.now },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  quizScores: [{
    quizId: { type: mongoose.Schema.Types.ObjectId },
    score: Number,
    maxScore: Number,
    attemptedAt: Date
  }],
  notes: [{
    lessonId: { type: mongoose.Schema.Types.ObjectId },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  xpEarned: { type: Number, default: 0 }
}, { timestamps: true });

progressSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
