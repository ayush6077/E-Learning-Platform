const router = require('express').Router();
const User = require('../models/User');
const Progress = require('../models/Progress');
const { protect, authorize } = require('../middleware/auth');

// GET /api/students - list all students (admin/instructor)
router.get('/', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ totalXP: -1 });
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/students/leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name avatar totalXP level streak badges')
      .sort({ totalXP: -1 })
      .limit(50);
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/students/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const progress = await Progress.find({ student: req.params.id }).populate('course', 'title category thumbnail');
    res.json({ student, progress });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
