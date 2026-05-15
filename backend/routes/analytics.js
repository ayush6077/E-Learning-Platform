const router = require('express').Router();
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/analytics/student - student's own analytics
router.get('/student', protect, async (req, res) => {
  try {
    const progresses = await Progress.find({ student: req.user._id })
      .populate('course', 'title category modules');

    const totalCoursesEnrolled = progresses.length;
    const totalCoursesCompleted = progresses.filter(p => p.completedAt).length;
    const totalTimeSpent = progresses.reduce((acc, p) => acc + p.timeSpent, 0);
    const totalXPEarned = progresses.reduce((acc, p) => acc + p.xpEarned, 0);
    const averageProgress = progresses.length > 0
      ? Math.round(progresses.reduce((acc, p) => acc + p.percentComplete, 0) / progresses.length)
      : 0;

    const quizData = progresses.flatMap(p => p.quizScores);
    const avgQuizScore = quizData.length > 0
      ? Math.round(quizData.reduce((acc, q) => acc + (q.score / q.maxScore * 100), 0) / quizData.length)
      : 0;

    // Weekly activity (last 7 days)
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      // Simplified - in production use actual session tracking
      weeklyActivity.push({
        date: dayStart.toISOString().split('T')[0],
        minutes: Math.floor(Math.random() * 120)
      });
    }

    // Category breakdown
    const categoryMap = {};
    progresses.forEach(p => {
      if (p.course) {
        const cat = p.course.category || 'Other';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      }
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));

    const user = await User.findById(req.user._id);

    res.json({
      totalCoursesEnrolled,
      totalCoursesCompleted,
      totalTimeSpent,
      totalXPEarned,
      averageProgress,
      avgQuizScore,
      weeklyActivity,
      categoryBreakdown,
      streak: user.streak,
      level: user.level,
      totalXP: user.totalXP,
      badges: user.badges,
      recentActivity: progresses
        .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
        .slice(0, 5)
        .map(p => ({
          courseTitle: p.course?.title,
          percentComplete: p.percentComplete,
          lastAccessed: p.lastAccessed
        }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/instructor - instructor analytics
router.get('/instructor', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    const courseIds = courses.map(c => c._id);

    const allProgress = await Progress.find({ course: { $in: courseIds } })
      .populate('student', 'name email avatar level');

    const totalStudents = new Set(allProgress.map(p => p.student?._id?.toString())).size;
    const totalEnrollments = allProgress.length;
    const completionRate = totalEnrollments > 0
      ? Math.round(allProgress.filter(p => p.completedAt).length / totalEnrollments * 100) : 0;
    const avgProgress = totalEnrollments > 0
      ? Math.round(allProgress.reduce((acc, p) => acc + p.percentComplete, 0) / totalEnrollments) : 0;

    const courseStats = courses.map(course => {
      const cp = allProgress.filter(p => p.course.toString() === course._id.toString());
      return {
        courseId: course._id,
        title: course.title,
        enrollments: cp.length,
        completions: cp.filter(p => p.completedAt).length,
        avgProgress: cp.length > 0 ? Math.round(cp.reduce((acc, p) => acc + p.percentComplete, 0) / cp.length) : 0,
        avgTimeSpent: cp.length > 0 ? Math.round(cp.reduce((acc, p) => acc + p.timeSpent, 0) / cp.length) : 0,
        rating: course.rating
      };
    });

    // Top students
    const studentMap = {};
    allProgress.forEach(p => {
      const sid = p.student?._id?.toString();
      if (!sid) return;
      if (!studentMap[sid]) studentMap[sid] = { ...p.student._doc, xpEarned: 0, coursesCompleted: 0 };
      studentMap[sid].xpEarned += p.xpEarned;
      if (p.completedAt) studentMap[sid].coursesCompleted++;
    });
    const topStudents = Object.values(studentMap)
      .sort((a, b) => b.xpEarned - a.xpEarned)
      .slice(0, 10);

    res.json({
      totalStudents,
      totalEnrollments,
      completionRate,
      avgProgress,
      totalCourses: courses.length,
      courseStats,
      topStudents
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/admin - platform analytics (admin only)
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalEnrollments] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments({ isPublished: true }),
      Progress.countDocuments()
    ]);
    const completions = await Progress.countDocuments({ completedAt: { $ne: null } });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('name email role createdAt');

    res.json({ totalUsers, totalCourses, totalEnrollments, completions, recentUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
