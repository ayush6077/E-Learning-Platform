const router = require('express').Router();
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/progress/:courseId - get student's progress for a course
router.get('/:courseId', protect, async (req, res) => {
  try {
    const progress = await Progress.findOne({ student: req.user._id, course: req.params.courseId });
    if (!progress) return res.status(404).json({ message: 'Progress not found' });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/progress - get all progress for student
router.get('/', protect, async (req, res) => {
  try {
    const progress = await Progress.find({ student: req.user._id })
      .populate('course', 'title thumbnail category modules totalDuration');
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/progress/:courseId/lesson/:lessonId - mark lesson complete
router.put('/:courseId/lesson/:lessonId', protect, async (req, res) => {
  try {
    const progress = await Progress.findOne({ student: req.user._id, course: req.params.courseId });
    if (!progress) return res.status(404).json({ message: 'Progress not found' });

    const { timeSpent = 0 } = req.body;
    const lessonId = req.params.lessonId;

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      progress.xpEarned += 50;

      // Update user XP
      const user = await User.findById(req.user._id);
      user.totalXP += 50;
      user.calculateLevel();
      await user.save();
    }

    progress.timeSpent += timeSpent;
    progress.lastAccessed = new Date();

    // Calculate percentage
    const course = await Course.findById(req.params.courseId);
    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    progress.percentComplete = totalLessons > 0 ? Math.round((progress.completedLessons.length / totalLessons) * 100) : 0;

    if (progress.percentComplete === 100 && !progress.completedAt) {
      progress.completedAt = new Date();
      await User.findByIdAndUpdate(req.user._id, {
        $push: { completedCourses: req.params.courseId },
        $inc: { totalXP: 500 }
      });
    }

    await progress.save();
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/progress/:courseId/quiz-score - submit quiz score
router.post('/:courseId/quiz-score', protect, async (req, res) => {
  try {
    const { quizId, score, maxScore } = req.body;
    const progress = await Progress.findOne({ student: req.user._id, course: req.params.courseId });
    if (!progress) return res.status(404).json({ message: 'Progress not found' });

    progress.quizScores.push({ quizId, score, maxScore, attemptedAt: new Date() });
    const xpGain = Math.round((score / maxScore) * 100);
    progress.xpEarned += xpGain;

    await progress.save();

    await User.findByIdAndUpdate(req.user._id, { $inc: { totalXP: xpGain } });

    res.json({ progress, xpGained: xpGain });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
