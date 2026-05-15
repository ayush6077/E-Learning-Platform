require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const Progress = require('./models/Progress');
const Quiz = require('./models/Quiz');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/elearning';

const categories = ['Web Development', 'AI/ML', 'Data Science', 'UI/UX Design', 'DevOps', 'Blockchain', 'Cybersecurity', 'Mobile Dev'];

const sampleCourses = [
  {
    title: 'React 19 & Next.js 15 — Full Stack Mastery',
    description: 'Master modern React with Server Components, Actions, and build production-grade Next.js apps with edge deployment, AI integrations, and more.',
    category: 'Web Development', level: 'intermediate', tags: ['react', 'nextjs', 'typescript'],
    rating: 4.9, totalRatings: 2841, totalDuration: 3600, isPublished: true,
    outcomes: ['Build full-stack Next.js 15 apps', 'Use React Server Components', 'Deploy on Vercel Edge'],
    prerequisites: ['Basic JavaScript', 'HTML/CSS'],
    modules: [
      { title: 'React Foundations', order: 1, lessons: [
        { title: 'React 19 What\'s New', order: 1, duration: 25, xpReward: 50 },
        { title: 'JSX Deep Dive', order: 2, duration: 20, xpReward: 50 },
        { title: 'Hooks Mastery', order: 3, duration: 40, xpReward: 75 },
      ]},
      { title: 'Next.js 15 App Router', order: 2, lessons: [
        { title: 'File-based Routing', order: 1, duration: 30, xpReward: 50 },
        { title: 'Server Components', order: 2, duration: 35, xpReward: 75 },
        { title: 'Data Fetching Patterns', order: 3, duration: 45, xpReward: 75 },
      ]},
    ]
  },
  {
    title: 'AI Engineering: Build LLM-Powered Apps',
    description: 'Learn to build production AI applications using LangChain, vector databases, RAG pipelines, and fine-tuning models with real-world projects.',
    category: 'AI/ML', level: 'advanced', tags: ['llm', 'langchain', 'rag', 'openai'],
    rating: 4.8, totalRatings: 1920, totalDuration: 4200, isPublished: true,
    outcomes: ['Build RAG applications', 'Fine-tune LLMs', 'Deploy AI APIs'],
    prerequisites: ['Python basics', 'API experience'],
    modules: [
      { title: 'LLM Fundamentals', order: 1, lessons: [
        { title: 'How LLMs Work', order: 1, duration: 30, xpReward: 50 },
        { title: 'Prompt Engineering', order: 2, duration: 45, xpReward: 75 },
      ]},
      { title: 'LangChain & RAG', order: 2, lessons: [
        { title: 'LangChain Basics', order: 1, duration: 40, xpReward: 75 },
        { title: 'Vector Databases', order: 2, duration: 35, xpReward: 75 },
        { title: 'Building RAG Pipelines', order: 3, duration: 60, xpReward: 100 },
      ]},
    ]
  },
  {
    title: 'UI/UX Design for 2026: AI-Assisted Workflows',
    description: 'Design stunning interfaces using Figma AI, component-driven systems, accessibility-first principles, and motion design with real case studies.',
    category: 'UI/UX Design', level: 'beginner', tags: ['figma', 'design-systems', 'ux'],
    rating: 4.7, totalRatings: 3201, totalDuration: 2400, isPublished: true,
    outcomes: ['Design in Figma with AI', 'Build design systems', 'Master UX research'],
    prerequisites: [],
    modules: [
      { title: 'Design Principles', order: 1, lessons: [
        { title: 'Typography & Spacing', order: 1, duration: 20, xpReward: 50 },
        { title: 'Color Theory', order: 2, duration: 25, xpReward: 50 },
      ]},
    ]
  },
  {
    title: 'DevOps & Platform Engineering 2026',
    description: 'Master Kubernetes, Terraform, GitHub Actions, ArgoCD, and observability tools to build resilient cloud-native platforms.',
    category: 'DevOps', level: 'advanced', tags: ['kubernetes', 'terraform', 'ci-cd', 'cloud'],
    rating: 4.8, totalRatings: 1540, totalDuration: 5400, isPublished: true,
    outcomes: ['Deploy on Kubernetes', 'Build CI/CD pipelines', 'IaC with Terraform'],
    prerequisites: ['Linux basics', 'Docker knowledge'],
    modules: [
      { title: 'Containerization', order: 1, lessons: [
        { title: 'Docker Fundamentals', order: 1, duration: 40, xpReward: 75 },
        { title: 'Kubernetes Basics', order: 2, duration: 60, xpReward: 100 },
      ]},
    ]
  },
  {
    title: 'Python for Data Science & ML',
    description: 'Comprehensive data science course covering pandas, NumPy, scikit-learn, and building production ML pipelines.',
    category: 'Data Science', level: 'beginner', tags: ['python', 'pandas', 'machine-learning'],
    rating: 4.6, totalRatings: 4100, totalDuration: 3000, isPublished: true,
    outcomes: ['Data wrangling with pandas', 'Build ML models', 'Data visualization'],
    prerequisites: ['Basic Python'],
    modules: [
      { title: 'Python Essentials', order: 1, lessons: [
        { title: 'NumPy Arrays', order: 1, duration: 35, xpReward: 50 },
        { title: 'Pandas DataFrames', order: 2, duration: 45, xpReward: 75 },
      ]},
    ]
  },
  {
    title: 'Web3 & Solidity: Build DeFi Apps',
    description: 'Learn Solidity, smart contract security, DeFi protocols, and deploy your own decentralized applications on Ethereum.',
    category: 'Blockchain', level: 'intermediate', tags: ['solidity', 'ethereum', 'defi', 'web3'],
    rating: 4.5, totalRatings: 890, totalDuration: 3600, isPublished: true,
    outcomes: ['Write Solidity contracts', 'Build DeFi apps', 'Smart contract auditing'],
    prerequisites: ['JavaScript', 'Basic blockchain concepts'],
    modules: [
      { title: 'Solidity Basics', order: 1, lessons: [
        { title: 'Smart Contract 101', order: 1, duration: 40, xpReward: 75 },
        { title: 'ERC-20 Tokens', order: 2, duration: 50, xpReward: 100 },
      ]},
    ]
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing
    await Promise.all([User.deleteMany(), Course.deleteMany(), Progress.deleteMany(), Quiz.deleteMany()]);
    console.log('Cleared existing data');

    // Create admin
    const admin = await User.create({ name: 'Admin User', email: 'admin@elearn.dev', password: 'password123', role: 'admin', totalXP: 9999, level: 20 });

    // Create instructors
    const instructors = await User.create([
      { name: 'Sarah Chen', email: 'sarah@elearn.dev', password: 'password123', role: 'instructor', bio: 'Senior React engineer at Vercel. 8 years building web apps.', totalXP: 5000, level: 10 },
      { name: 'Marcus Webb', email: 'marcus@elearn.dev', password: 'password123', role: 'instructor', bio: 'ML Engineer at Google DeepMind. PhD in Computer Science.', totalXP: 4500, level: 9 },
      { name: 'Priya Sharma', email: 'priya@elearn.dev', password: 'password123', role: 'instructor', bio: 'Lead Designer at Figma. 10+ years UX experience.', totalXP: 3800, level: 8 },
    ]);

    // Create students
    const students = await User.create([
      { name: 'Alex Rivera', email: 'alex@student.dev', password: 'password123', role: 'student', totalXP: 2840, level: 6, streak: 14, badges: [{ name: 'Quick Learner', icon: '⚡' }, { name: '7-Day Streak', icon: '🔥' }] },
      { name: 'Jamie Lee', email: 'jamie@student.dev', password: 'password123', role: 'student', totalXP: 1920, level: 4, streak: 7 },
      { name: 'Chris Park', email: 'chris@student.dev', password: 'password123', role: 'student', totalXP: 3500, level: 7, streak: 21 },
      { name: 'Taylor Kim', email: 'taylor@student.dev', password: 'password123', role: 'student', totalXP: 800, level: 2, streak: 3 },
      { name: 'student', email: 'student@elearn.dev', password: 'password123', role: 'student', totalXP: 1500, level: 3, streak: 5 },
    ]);

    console.log('Users created');

    // Create courses
    const instructorMap = [0, 1, 2, 0, 1, 2];
    const createdCourses = [];
    for (let i = 0; i < sampleCourses.length; i++) {
      const course = await Course.create({ ...sampleCourses[i], instructor: instructors[instructorMap[i]]._id });
      createdCourses.push(course);
    }
    console.log('Courses created');

    // Create quizzes
    await Quiz.create([
      {
        title: 'React Fundamentals Quiz',
        course: createdCourses[0]._id,
        passingScore: 70, timeLimit: 15, xpReward: 150,
        questions: [
          { text: 'What hook replaces componentDidMount in React?', type: 'mcq', options: [{ text: 'useState', isCorrect: false }, { text: 'useEffect', isCorrect: true }, { text: 'useRef', isCorrect: false }, { text: 'useCallback', isCorrect: false }], explanation: 'useEffect with empty deps runs after mount.', points: 10 },
          { text: 'React Server Components run on the client', type: 'true-false', correctAnswer: 'false', explanation: 'RSC run on the server and ship zero JS to client.', points: 10 },
          { text: 'Which is the correct way to create state in React 19?', type: 'mcq', options: [{ text: 'this.state = {}', isCorrect: false }, { text: 'const [val, setVal] = useState()', isCorrect: true }, { text: 'createState()', isCorrect: false }, { text: 'React.state()', isCorrect: false }], explanation: 'useState hook is the standard way.', points: 10 },
        ]
      },
      {
        title: 'AI/ML Fundamentals Quiz',
        course: createdCourses[1]._id,
        passingScore: 60, timeLimit: 20, xpReward: 200,
        questions: [
          { text: 'What does RAG stand for in AI?', type: 'mcq', options: [{ text: 'Retrieval Augmented Generation', isCorrect: true }, { text: 'Random Augmented Gradient', isCorrect: false }, { text: 'Recurrent Aggregation Group', isCorrect: false }, { text: 'Response Auto Generation', isCorrect: false }], points: 10 },
          { text: 'Vector databases store data as high-dimensional vectors', type: 'true-false', correctAnswer: 'true', points: 10 },
        ]
      }
    ]);
    console.log('Quizzes created');

    // Enroll students in courses
    const mainStudent = students[0];
    for (let i = 0; i < 3; i++) {
      const course = createdCourses[i];
      course.enrolledStudents.push(mainStudent._id);
      await course.save();

      const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
      const completedCount = i === 2 ? totalLessons : Math.floor(totalLessons * (i === 0 ? 0.75 : 0.4));
      const completedLessons = course.modules.flatMap(m => m.lessons.map(l => l._id)).slice(0, completedCount);

      await Progress.create({
        student: mainStudent._id,
        course: course._id,
        completedLessons,
        percentComplete: Math.round((completedCount / totalLessons) * 100),
        timeSpent: 180 + i * 120,
        xpEarned: completedCount * 50,
        completedAt: i === 2 ? new Date() : null,
        quizScores: i === 0 ? [{ quizId: new mongoose.Types.ObjectId(), score: 28, maxScore: 30, attemptedAt: new Date() }] : []
      });

      await User.findByIdAndUpdate(mainStudent._id, { $push: { enrolledCourses: course._id } });
    }

    console.log('Progress created');
    console.log('\n✅ Seed complete!');
    console.log('\n📋 Test credentials:');
    console.log('  Student:    student@elearn.dev / password123');
    console.log('  Instructor: sarah@elearn.dev / password123');
    console.log('  Admin:      admin@elearn.dev / password123');
    mongoose.disconnect();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
