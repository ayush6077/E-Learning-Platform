const router = require('express').Router();
const Quiz = require('../models/Quiz');
const { protect, authorize } = require('../middleware/auth');

// GET /api/quizzes/course/:courseId
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId });
    res.json(quizzes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/quizzes/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/quizzes - create quiz
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// POST /api/quizzes/:id/submit
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    const { answers } = req.body; // { questionId: selectedOption }
    let score = 0;
    const results = quiz.questions.map(q => {
      const userAnswer = answers[q._id.toString()];
      let isCorrect = false;
      if (q.type === 'mcq') {
        const correctOpt = q.options.find(o => o.isCorrect);
        isCorrect = correctOpt && userAnswer === correctOpt.text;
      } else if (q.type === 'true-false') {
        isCorrect = userAnswer === q.correctAnswer;
      }
      if (isCorrect) score += q.points;
      return { questionId: q._id, isCorrect, correctAnswer: q.type === 'mcq' ? q.options.find(o => o.isCorrect)?.text : q.correctAnswer, explanation: q.explanation };
    });
    const maxScore = quiz.questions.reduce((a, q) => a + q.points, 0);
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = percentage >= quiz.passingScore;
    res.json({ score, maxScore, percentage, passed, results, xpReward: passed ? quiz.xpReward : Math.round(quiz.xpReward * 0.3) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
