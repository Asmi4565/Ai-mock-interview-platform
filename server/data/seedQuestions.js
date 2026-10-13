export const defaultQuestions = [
  // 1. HR / Behavioral
  {
    category: 'HR / Behavioral',
    role: 'General Software Engineer',
    difficulty: 'Beginner',
    prompt: 'Tell me about yourself, your educational background, and why you are interested in a career in software development.',
    idealKeywords: ['education', 'projects', 'passion', 'growth', 'problem solving'],
    rubricGuide: 'Look for structured communication, concise timeline, specific project highlights, and enthusiasm for learning.',
  },
  {
    category: 'HR / Behavioral',
    role: 'General Software Engineer',
    difficulty: 'Beginner',
    prompt: 'Describe a challenging project you worked on during college. What obstacles did you encounter, and how did you resolve them?',
    idealKeywords: ['STAR method', 'situation', 'obstacle', 'solution', 'outcome', 'learning'],
    rubricGuide: 'Assess use of the STAR method (Situation, Task, Action, Result), personal accountability, and problem-solving strategy.',
  },
  {
    category: 'HR / Behavioral',
    role: 'General Software Engineer',
    difficulty: 'Intermediate',
    prompt: 'Tell me about a time when you disagreed with a teammate or project partner. How did you handle the situation and what was the outcome?',
    idealKeywords: ['active listening', 'collaboration', 'compromise', 'objective evaluation', 'team goal'],
    rubricGuide: 'Evaluate interpersonal maturity, empathy, communication clarity, and focus on delivering team goals.',
  },
  {
    category: 'HR / Behavioral',
    role: 'General Software Engineer',
    difficulty: 'Beginner',
    prompt: 'How do you handle deadlines and prioritize tasks when you have multiple assignments or project milestones due at the same time?',
    idealKeywords: ['prioritization', 'time management', 'communication', 'focus', 'tools'],
    rubricGuide: 'Look for practical prioritization frameworks (e.g. urgent vs important), early communication, and stress resilience.',
  },

  // 2. Technical Fundamentals (Core CS & Web)
  {
    category: 'Technical Fundamentals',
    role: 'Full Stack Developer',
    difficulty: 'Beginner',
    prompt: 'Explain the difference between synchronous and asynchronous programming in JavaScript. Why is the event loop important in Node.js?',
    idealKeywords: ['event loop', 'call stack', 'callback queue', 'promises', 'non-blocking I/O', 'single threaded'],
    rubricGuide: 'Check understanding of single-threaded non-blocking architecture, Call Stack, Event Queue, and async/await mechanisms.',
  },
  {
    category: 'Technical Fundamentals',
    role: 'Full Stack Developer',
    difficulty: 'Beginner',
    prompt: 'What are the main principles of Object-Oriented Programming (OOP)? Provide a brief real-world example of Polymorphism or Encapsulation.',
    idealKeywords: ['encapsulation', 'abstraction', 'inheritance', 'polymorphism', 'classes', 'methods'],
    rubricGuide: 'Clear definitions of the 4 pillars with an accurate, practical programming example.',
  },
  {
    category: 'Technical Fundamentals',
    role: 'Full Stack Developer',
    difficulty: 'Intermediate',
    prompt: 'Compare relational databases (SQL) with non-relational databases (NoSQL). Under what conditions would you choose MongoDB over PostgreSQL?',
    idealKeywords: ['schema flexibility', 'ACID transactions', 'scalability', 'joins', 'document model', 'JSON'],
    rubricGuide: 'Evaluate trade-offs between structured ACID guarantees vs horizontal scalability and schema flexibility.',
  },
  {
    category: 'Technical Fundamentals',
    role: 'Full Stack Developer',
    difficulty: 'Beginner',
    prompt: 'Explain what RESTful APIs are and list the primary HTTP methods and standard status codes (200, 201, 400, 401, 404, 500).',
    idealKeywords: ['stateless', 'GET', 'POST', 'PUT', 'DELETE', 'client-server', 'status codes'],
    rubricGuide: 'Check understanding of resource endpoints, idempotent vs non-idempotent methods, and proper error status codes.',
  },

  // 3. Role-Specific: Frontend
  {
    category: 'Role-Specific Practice',
    role: 'Frontend Developer',
    difficulty: 'Beginner',
    prompt: 'How does React maintain UI state? Explain the difference between Props and State, and why state should not be mutated directly.',
    idealKeywords: ['immutability', 're-rendering', 'useState', 'unidirectional data flow', 'virtual DOM'],
    rubricGuide: 'Ensure candidate explains that React compares state references to trigger re-renders, and why direct mutation breaks UI consistency.',
  },
  {
    category: 'Role-Specific Practice',
    role: 'Frontend Developer',
    difficulty: 'Intermediate',
    prompt: 'Explain how the useEffect hook works in React. What happens if the dependency array is empty, omitted, or contains variables?',
    idealKeywords: ['lifecycle', 'dependency array', 'cleanup function', 'infinite loops', 'side effects'],
    rubricGuide: 'Precise explanation of initial mount vs state updates, cleanup functions for listeners/timers, and dependency management.',
  },
  {
    category: 'Role-Specific Practice',
    role: 'Frontend Developer',
    difficulty: 'Beginner',
    prompt: 'What is responsive web design? What CSS techniques (e.g. Flexbox, Grid, Media Queries) do you use to support mobile and desktop screens?',
    idealKeywords: ['flexbox', 'css grid', 'media queries', 'viewport', 'mobile first', 'breakpoints'],
    rubricGuide: 'Understanding of fluid layouts, modern CSS layouts without hardcoded pixel widths, and mobile-first methodologies.',
  },

  // 4. Role-Specific: Backend
  {
    category: 'Role-Specific Practice',
    role: 'Backend Developer',
    difficulty: 'Beginner',
    prompt: 'Explain how authentication works in modern web applications. What is a JWT (JSON Web Token), and how does the server verify it securely?',
    idealKeywords: ['header payload signature', 'secret key', 'stateless', 'bearer token', 'expiration', 'hashing'],
    rubricGuide: 'Look for explanation of the 3 parts of a JWT, digital signature verification with HMAC/RSA, and secure storage in cookies/headers.',
  },
  {
    category: 'Role-Specific Practice',
    role: 'Backend Developer',
    difficulty: 'Intermediate',
    prompt: 'What is middleware in Express.js? How do you implement error handling middleware and authentication guard middleware?',
    idealKeywords: ['req res next', 'pipeline', 'error handling', 'status codes', 'interceptor'],
    rubricGuide: 'Check explanation of `next()`, order of middleware execution, and the 4-parameter `(err, req, res, next)` error handler.',
  },
  {
    category: 'Role-Specific Practice',
    role: 'Backend Developer',
    difficulty: 'Intermediate',
    prompt: 'How do database indexes improve query performance in MongoDB, and what are the trade-offs regarding write operations and memory usage?',
    idealKeywords: ['B-tree', 'lookup speed', 'write penalty', 'RAM overhead', 'explain plan', 'compound index'],
    rubricGuide: 'Accurate description of avoiding full collection scans vs slower inserts/updates and index RAM consumption.',
  },

  // 5. System Design & Architecture
  {
    category: 'System Design & Architecture',
    role: 'Full Stack Developer',
    difficulty: 'Intermediate',
    prompt: 'How would you design a secure user login system that prevents brute force attacks and protects stored passwords against database breaches?',
    idealKeywords: ['bcrypt', 'salting', 'rate limiting', 'HTTPS', 'input sanitization', 'session expiry'],
    rubricGuide: 'Evaluate defense-in-depth: slow hashing algorithms, rate limiting IP attempts, input validation, and secure transmission.',
  },
];
