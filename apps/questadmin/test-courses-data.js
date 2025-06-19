/**
 * Script to create test courses for browse functionality testing
 */

const testCourses = [
  {
    title: "Introduction to JavaScript",
    description: "Learn the fundamentals of JavaScript programming, including variables, functions, arrays, and objects. Perfect for beginners starting their coding journey.",
    instructor: "John Smith",
    category: "Programming",
    level: "beginner",
    price: 0,
    duration: 20,
    status: "published",
    instructorId: "test-instructor-1",
    primaryLanguage: "en",
    supportedLanguages: ["en"],
    enableTranslation: false,
    whatYouWillLearn: [
      "JavaScript basics and syntax",
      "Working with variables and data types",
      "Functions and scope",
      "DOM manipulation",
      "Event handling"
    ],
    prerequisites: [],
    targetAudience: ["Beginner programmers", "Students", "Career changers"],
    tags: ["javascript", "programming", "web development"],
    skills: ["JavaScript", "Programming", "Web Development"]
  },
  {
    title: "Advanced React Development",
    description: "Master advanced React concepts including hooks, context, performance optimization, and modern patterns for building scalable applications.",
    instructor: "Sarah Johnson",
    category: "Web Development",
    level: "advanced",
    price: 99,
    duration: 40,
    status: "published",
    instructorId: "test-instructor-2",
    primaryLanguage: "en",
    supportedLanguages: ["en"],
    enableTranslation: false,
    whatYouWillLearn: [
      "Advanced React hooks",
      "State management patterns",
      "Performance optimization",
      "Custom hooks development",
      "Testing React applications"
    ],
    prerequisites: ["Basic React knowledge", "JavaScript ES6+"],
    targetAudience: ["Experienced developers", "React developers", "Frontend engineers"],
    tags: ["react", "advanced", "frontend"],
    skills: ["React", "JavaScript", "Frontend Development"]
  },
  {
    title: "Data Science with Python",
    description: "Comprehensive course covering data analysis, visualization, and machine learning using Python libraries like pandas, numpy, and scikit-learn.",
    instructor: "Dr. Michael Chen",
    category: "Data Science",
    level: "intermediate",
    price: 149,
    duration: 60,
    status: "published",
    instructorId: "test-instructor-3",
    primaryLanguage: "en",
    supportedLanguages: ["en"],
    enableTranslation: false,
    whatYouWillLearn: [
      "Data analysis with pandas",
      "Data visualization with matplotlib",
      "Machine learning basics",
      "Statistical analysis",
      "Real-world project implementation"
    ],
    prerequisites: ["Basic Python knowledge", "Mathematics basics"],
    targetAudience: ["Data analysts", "Scientists", "Business analysts"],
    tags: ["python", "data science", "machine learning"],
    skills: ["Python", "Data Analysis", "Machine Learning"]
  }
];

console.log('Test courses data:');
console.log(JSON.stringify(testCourses, null, 2));
console.log(`\nTotal courses: ${testCourses.length}`);
console.log(`Free courses: ${testCourses.filter(c => c.price === 0).length}`);
console.log(`Paid courses: ${testCourses.filter(c => c.price > 0).length}`);
console.log(`Beginner courses: ${testCourses.filter(c => c.level === 'beginner').length}`);
console.log(`Intermediate courses: ${testCourses.filter(c => c.level === 'intermediate').length}`);
console.log(`Advanced courses: ${testCourses.filter(c => c.level === 'advanced').length}`);
