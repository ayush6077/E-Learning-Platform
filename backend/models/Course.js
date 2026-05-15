const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
  duration: { type: Number, default: 0 }, // in minutes
  order: { type: Number, required: true },
  resources: [{ title: String, url: String, type: String }],
  xpReward: { type: Number, default: 50 }
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  order: { type: Number, required: true },
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  tags: [String],
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  thumbnail: { type: String, default: '' },
  price: { type: Number, default: 0 },
  isFree: { type: Boolean, default: true },
  modules: [moduleSchema],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 }, // in minutes
  isPublished: { type: Boolean, default: false },
  language: { type: String, default: 'English' },
  prerequisites: [String],
  outcomes: [String]
}, { timestamps: true });

courseSchema.virtual('totalLessons').get(function() {
  return this.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
});

module.exports = mongoose.model('Course', courseSchema);
