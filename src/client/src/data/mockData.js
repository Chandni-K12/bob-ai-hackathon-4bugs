// ==========================================
// MOCK DATA — SIH Gamified Environmental Education Platform
// ==========================================

// ---------- SCHOOLS ----------
export const mockSchools = [
  { id: 's1', name: 'Green Valley School', location: 'Hyderabad', district: 'Rangareddy', state: 'Telangana', students: 480, teachers: 32, greenScore: 89.5, lat: 17.385, lng: 78.4867 },
  { id: 's2', name: 'Sunrise Academy', location: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka', students: 620, teachers: 45, greenScore: 85.2, lat: 12.9716, lng: 77.5946 },
  { id: 's3', name: 'ABC Public School', location: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', students: 390, teachers: 28, greenScore: 78.8, lat: 13.0827, lng: 80.2707 },
];

// ---------- CLASSES ----------
export const mockClasses = [
  { id: 'c1', name: '8-A', schoolId: 's1', teacher: 'Dr. Meera Reddy', students: 40 },
  { id: 'c2', name: '8-B', schoolId: 's1', teacher: 'Mr. Rajesh Kumar', students: 38 },
  { id: 'c3', name: '9-A', schoolId: 's2', teacher: 'Ms. Kavitha Nair', students: 42 },
];

// ---------- USERS ----------
export const mockUsers = [
  // Students
  { id: 'u1', name: 'Ananya Sharma', email: 'ananya@student.eco', role: 'student', schoolId: 's1', classId: 'c1', className: '8-A', schoolName: 'Green Valley School', points: 2450, streak: 5, level: 12, badges: 12, completedMissions: 28, quizAccuracy: 84, learningProgress: 76, classRank: 7, schoolRank: 24, avatar: '🌿' },
  { id: 'u2', name: 'Aarav Patel', email: 'aarav@student.eco', role: 'student', schoolId: 's1', classId: 'c1', className: '8-A', schoolName: 'Green Valley School', points: 2850, streak: 7, level: 14, badges: 15, completedMissions: 34, quizAccuracy: 92, learningProgress: 88, classRank: 1, schoolRank: 3, avatar: '🌳' },
  { id: 'u3', name: 'Priya Iyer', email: 'priya@student.eco', role: 'student', schoolId: 's1', classId: 'c1', className: '8-A', schoolName: 'Green Valley School', points: 2210, streak: 5, level: 11, badges: 10, completedMissions: 22, quizAccuracy: 84, learningProgress: 72, classRank: 3, schoolRank: 12, avatar: '💧' },
  { id: 'u4', name: 'Riya Deshmukh', email: 'riya@student.eco', role: 'student', schoolId: 's1', classId: 'c1', className: '8-A', schoolName: 'Green Valley School', points: 1980, streak: 3, level: 10, badges: 8, completedMissions: 18, quizAccuracy: 76, learningProgress: 64, classRank: 5, schoolRank: 18, avatar: '🌻' },
  { id: 'u5', name: 'Vikram Singh', email: 'vikram@student.eco', role: 'student', schoolId: 's1', classId: 'c1', className: '8-A', schoolName: 'Green Valley School', points: 1650, streak: 2, level: 9, badges: 6, completedMissions: 14, quizAccuracy: 68, learningProgress: 58, classRank: 8, schoolRank: 30, avatar: '🦋' },
  { id: 'u6', name: 'Meghna Rao', email: 'meghna@student.eco', role: 'student', schoolId: 's1', classId: 'c1', className: '8-A', schoolName: 'Green Valley School', points: 2680, streak: 6, level: 13, badges: 14, completedMissions: 31, quizAccuracy: 89, learningProgress: 82, classRank: 2, schoolRank: 6, avatar: '🌸' },
  { id: 'u7', name: 'Rohan Gupta', email: 'rohan@student.eco', role: 'student', schoolId: 's1', classId: 'c2', className: '8-B', schoolName: 'Green Valley School', points: 1920, streak: 4, level: 10, badges: 9, completedMissions: 20, quizAccuracy: 75, learningProgress: 65, classRank: 4, schoolRank: 20, avatar: '🌍' },
  { id: 'u8', name: 'Aisha Khan', email: 'aisha@student.eco', role: 'student', schoolId: 's2', classId: 'c3', className: '9-A', schoolName: 'Sunrise Academy', points: 2340, streak: 5, level: 12, badges: 11, completedMissions: 26, quizAccuracy: 82, learningProgress: 74, classRank: 2, schoolRank: 8, avatar: '🌺' },
  { id: 'u9', name: 'Siddharth Joshi', email: 'sid@student.eco', role: 'student', schoolId: 's2', classId: 'c3', className: '9-A', schoolName: 'Sunrise Academy', points: 2100, streak: 3, level: 11, badges: 9, completedMissions: 21, quizAccuracy: 78, learningProgress: 70, classRank: 4, schoolRank: 14, avatar: '🌲' },
  { id: 'u10', name: 'Kavya Nair', email: 'kavya@student.eco', role: 'student', schoolId: 's3', classId: 'c3', className: '9-A', schoolName: 'ABC Public School', points: 1780, streak: 2, level: 9, badges: 7, completedMissions: 16, quizAccuracy: 71, learningProgress: 60, classRank: 6, schoolRank: 22, avatar: '🍃' },
  // Teachers
  { id: 't1', name: 'Dr. Meera Reddy', email: 'meera@teacher.eco', role: 'teacher', schoolId: 's1', classId: 'c1', className: '8-A', schoolName: 'Green Valley School', avatar: '👩‍🏫' },
  { id: 't2', name: 'Mr. Rajesh Kumar', email: 'rajesh@teacher.eco', role: 'teacher', schoolId: 's1', classId: 'c2', className: '8-B', schoolName: 'Green Valley School', avatar: '👨‍🏫' },
  // Organizers
  { id: 'o1', name: 'Mrs. Lakshmi Menon', email: 'lakshmi@organizer.eco', role: 'organizer', schoolId: null, classId: null, avatar: '👩‍💼' },
];

// ---------- TOPICS ----------
export const mockTopics = [
  { id: 'tp1', name: 'Climate Change', icon: '🌡️', description: 'Understanding global warming, greenhouse gases, and climate action', difficulty: 'Intermediate', lessons: 10, completedLessons: 7, progress: 70, quizAvailable: true, points: 150, estimatedTime: '4 hrs', color: '#ef4444' },
  { id: 'tp2', name: 'Waste Management', icon: '♻️', description: 'Learn about waste segregation, recycling, and composting', difficulty: 'Beginner', lessons: 8, completedLessons: 6, progress: 72, quizAvailable: true, points: 100, estimatedTime: '3 hrs', color: '#22c55e' },
  { id: 'tp3', name: 'Water Conservation', icon: '💧', description: 'Water cycle, conservation methods, and rainwater harvesting', difficulty: 'Intermediate', lessons: 8, completedLessons: 4, progress: 50, quizAvailable: true, points: 120, estimatedTime: '3.5 hrs', color: '#3b82f6' },
  { id: 'tp4', name: 'Biodiversity', icon: '🦋', description: 'Flora, fauna, ecosystems, and conservation of biodiversity', difficulty: 'Advanced', lessons: 12, completedLessons: 5, progress: 42, quizAvailable: false, points: 200, estimatedTime: '5 hrs', color: '#a855f7' },
  { id: 'tp5', name: 'Renewable Energy', icon: '☀️', description: 'Solar, wind, hydro energy and sustainable power solutions', difficulty: 'Intermediate', lessons: 8, completedLessons: 8, progress: 100, quizAvailable: true, points: 130, estimatedTime: '3 hrs', color: '#f59e0b' },
  { id: 'tp6', name: 'Pollution', icon: '🏭', description: 'Air, water, soil, and noise pollution causes and prevention', difficulty: 'Beginner', lessons: 6, completedLessons: 3, progress: 50, quizAvailable: true, points: 90, estimatedTime: '2.5 hrs', color: '#64748b' },
  { id: 'tp7', name: 'Sustainable Lifestyle', icon: '🌱', description: 'Eco-friendly habits, sustainable consumption, and green living', difficulty: 'Beginner', lessons: 6, completedLessons: 5, progress: 83, quizAvailable: true, points: 80, estimatedTime: '2 hrs', color: '#10b981' },
  { id: 'tp8', name: 'Forest & Wildlife', icon: '🌲', description: 'Forest conservation, wildlife protection, and national parks', difficulty: 'Advanced', lessons: 10, completedLessons: 2, progress: 20, quizAvailable: false, points: 180, estimatedTime: '4.5 hrs', color: '#16a34a' },
  { id: 'tp9', name: 'Environmental Protection', icon: '🛡️', description: 'Environmental laws, policies, activism, and protection measures', difficulty: 'Advanced', lessons: 8, completedLessons: 1, progress: 12, quizAvailable: false, points: 160, estimatedTime: '3.5 hrs', color: '#0ea5e9' },
];

// ---------- MISSIONS ----------
export const mockMissions = [
  { id: 'm1', title: 'Plastic-Free Week', icon: '🚫', description: 'Avoid single-use plastics for 7 consecutive days', topic: 'Waste Management', difficulty: 'Medium', points: 100, progress: 4, total: 7, deadline: '2026-08-25', verificationRequired: true, status: 'in_progress', color: '#22c55e' },
  { id: 'm2', title: 'Water Saver', icon: '💧', description: 'Track and reduce water usage for 5 days', topic: 'Water Conservation', difficulty: 'Easy', points: 75, progress: 3, total: 5, deadline: '2026-08-23', verificationRequired: true, status: 'in_progress', color: '#3b82f6' },
  { id: 'm3', title: 'Waste Segregation Champion', icon: '♻️', description: 'Properly segregate waste at home and school for a week', topic: 'Waste Management', difficulty: 'Easy', points: 80, progress: 7, total: 7, deadline: '2026-08-20', verificationRequired: true, status: 'completed', color: '#10b981' },
  { id: 'm4', title: 'Green Transport', icon: '🚲', description: 'Use eco-friendly transport (walk, cycle, public) for 5 days', topic: 'Pollution', difficulty: 'Medium', points: 90, progress: 2, total: 5, deadline: '2026-08-28', verificationRequired: true, status: 'in_progress', color: '#f59e0b' },
  { id: 'm5', title: 'Plant a Tree', icon: '🌳', description: 'Plant a tree and document its growth for 2 weeks', topic: 'Biodiversity', difficulty: 'Hard', points: 200, progress: 0, total: 1, deadline: '2026-09-05', verificationRequired: true, status: 'not_started', color: '#16a34a' },
  { id: 'm6', title: 'Biodiversity Explorer', icon: '🔍', description: 'Document 10 different species in your local area', topic: 'Biodiversity', difficulty: 'Hard', points: 150, progress: 6, total: 10, deadline: '2026-09-10', verificationRequired: true, status: 'in_progress', color: '#a855f7' },
  { id: 'm7', title: 'Clean Campus', icon: '🧹', description: 'Organize a campus cleaning drive', topic: 'Environmental Protection', difficulty: 'Medium', points: 120, progress: 0, total: 1, deadline: '2026-08-30', verificationRequired: true, status: 'not_started', color: '#0ea5e9' },
  { id: 'm8', title: 'Energy Audit', icon: '⚡', description: 'Conduct an energy audit of your home and suggest improvements', topic: 'Renewable Energy', difficulty: 'Hard', points: 180, progress: 1, total: 3, deadline: '2026-09-01', verificationRequired: true, status: 'in_progress', color: '#f97316' },
  { id: 'm9', title: 'Composting Hero', icon: '🪱', description: 'Set up a composting system at home', topic: 'Waste Management', difficulty: 'Medium', points: 130, progress: 0, total: 1, deadline: '2026-09-15', verificationRequired: true, status: 'not_started', color: '#84cc16' },
  { id: 'm10', title: 'Rain Water Harvesting', icon: '🌧️', description: 'Design and implement a simple rainwater collection system', topic: 'Water Conservation', difficulty: 'Hard', points: 250, progress: 0, total: 1, deadline: '2026-09-20', verificationRequired: true, status: 'not_started', color: '#06b6d4' },
];

// ---------- BADGES ----------
export const mockBadges = [
  { id: 'b1', name: 'Eco Starter', icon: '🌱', description: 'Complete your first environmental lesson', unlocked: true, unlockedDate: '2026-07-15', color: '#22c55e' },
  { id: 'b2', name: 'Waste Warrior', icon: '♻️', description: 'Complete 5 waste management activities', unlocked: true, unlockedDate: '2026-07-22', color: '#10b981' },
  { id: 'b3', name: 'Water Guardian', icon: '💧', description: 'Save 100L of water through missions', unlocked: true, unlockedDate: '2026-07-30', color: '#3b82f6' },
  { id: 'b4', name: 'Green Champion', icon: '🌳', description: 'Plant 5 trees and verify growth', unlocked: true, unlockedDate: '2026-08-05', color: '#16a34a' },
  { id: 'b5', name: 'Climate Hero', icon: '🌍', description: 'Complete all Climate Change lessons', unlocked: true, unlockedDate: '2026-08-10', color: '#0ea5e9' },
  { id: 'b6', name: '7-Week Streak', icon: '🔥', description: 'Maintain a 7-week learning streak', unlocked: true, unlockedDate: '2026-08-12', color: '#f97316' },
  { id: 'b7', name: 'Eco Master', icon: '🏆', description: 'Reach Level 15 and earn 3000+ Eco Points', unlocked: false, color: '#eab308' },
  { id: 'b8', name: 'Quiz Champion', icon: '🧠', description: 'Score 90%+ in 10 quizzes', unlocked: true, unlockedDate: '2026-08-01', color: '#a855f7' },
  { id: 'b9', name: 'Mission Master', icon: '🎯', description: 'Complete 25 environmental missions', unlocked: true, unlockedDate: '2026-08-14', color: '#f43f5e' },
  { id: 'b10', name: 'Team Player', icon: '🤝', description: 'Participate in 3 competitions', unlocked: true, unlockedDate: '2026-08-08', color: '#14b8a6' },
  { id: 'b11', name: 'Biodiversity Scout', icon: '🦋', description: 'Document 20 different species', unlocked: true, unlockedDate: '2026-08-11', color: '#8b5cf6' },
  { id: 'b12', name: 'Energy Saver', icon: '⚡', description: 'Complete all Renewable Energy lessons', unlocked: true, unlockedDate: '2026-08-13', color: '#f59e0b' },
  { id: 'b13', name: 'Pollution Fighter', icon: '🛡️', description: 'Complete 10 pollution prevention tasks', unlocked: false, color: '#64748b' },
  { id: 'b14', name: 'Eco Leader', icon: '👑', description: 'Reach Top 5 in school leaderboard', unlocked: false, color: '#fbbf24' },
];

// ---------- QUIZ QUESTIONS (Scenario-based) ----------
export const mockQuizzes = [
  {
    id: 'q1',
    topicId: 'tp2',
    topic: 'Waste Management',
    title: 'Waste Segregation Scenarios',
    questions: [
      {
        id: 'qq1',
        scenario: 'You are walking through your school campus during lunch break. You notice food waste, plastic bottles, and paper being placed in the same bin.',
        question: 'What would be the most sustainable action?',
        options: [
          'Ignore it — it\'s not your responsibility',
          'Tell the teacher about it later',
          'Sort the waste into separate bins for wet, dry, and recyclable waste',
          'Put everything in the nearest bin yourself'
        ],
        correct: 2,
        explanation: 'Proper waste segregation is essential. Separating wet waste (food), dry waste (paper), and recyclables (plastic bottles) ensures efficient recycling and composting, reducing landfill burden.',
        points: 20,
      },
      {
        id: 'qq2',
        scenario: 'Your family is renovating the house and there are old paint cans, batteries, and broken electronics to dispose of.',
        question: 'How should you handle this e-waste and hazardous material?',
        options: [
          'Put everything in the regular garbage bin',
          'Burn it in the backyard to reduce waste',
          'Take it to a designated e-waste collection center or hazardous waste facility',
          'Bury it in the garden'
        ],
        correct: 2,
        explanation: 'E-waste and hazardous materials like paint and batteries contain toxic chemicals. They must be taken to authorized e-waste collection centers or hazardous waste facilities to prevent soil and water contamination.',
        points: 20,
      },
      {
        id: 'qq3',
        scenario: 'Your school canteen generates a lot of food waste daily. The principal asks for suggestions to reduce this waste.',
        question: 'What is the most effective long-term solution?',
        options: [
          'Reduce the menu variety so less food is prepared',
          'Set up a composting system to convert food waste into fertilizer for the school garden',
          'Ask students to eat less',
          'Throw the waste in a pit behind the school'
        ],
        correct: 1,
        explanation: 'Composting converts organic food waste into nutrient-rich fertilizer. This is a sustainable, circular economy approach that benefits the school garden while reducing landfill waste.',
        points: 25,
      },
    ],
    difficulty: 'Beginner',
    totalPoints: 65,
  },
  {
    id: 'q2',
    topicId: 'tp3',
    topic: 'Water Conservation',
    title: 'Water Conservation Scenarios',
    questions: [
      {
        id: 'qq4',
        scenario: 'You notice a leaking tap in the school washroom that drips continuously. You estimate it wastes about 20 liters per day.',
        question: 'What is the most impactful action you can take?',
        options: [
          'Place a bucket under the tap to collect water for plants',
          'Report it immediately to the school maintenance team and suggest using the collected water',
          'Ignore it — maintenance will notice eventually',
          'Try to fix it yourself'
        ],
        correct: 1,
        explanation: 'While collecting water is helpful, reporting and fixing the root cause prevents ongoing waste. A single dripping tap can waste over 7,000 liters per year. Combining both actions is the best approach.',
        points: 20,
      },
      {
        id: 'qq5',
        scenario: 'Your city faces a water shortage during summer. Your family uses about 500 liters of water daily.',
        question: 'Which combination of actions would save the most water?',
        options: [
          'Take shorter showers and turn off taps while brushing',
          'Install low-flow fixtures, harvest rainwater, and reuse greywater for plants',
          'Buy bottled water instead of using tap water',
          'Only reduce drinking water consumption'
        ],
        correct: 1,
        explanation: 'A comprehensive approach combining low-flow fixtures (saves 30-50%), rainwater harvesting, and greywater reuse can reduce household water consumption by 40-60%. Individual actions help but systemic changes have greater impact.',
        points: 25,
      },
    ],
    difficulty: 'Intermediate',
    totalPoints: 45,
  },
  {
    id: 'q3',
    topicId: 'tp1',
    topic: 'Climate Change',
    title: 'Climate Action Scenarios',
    questions: [
      {
        id: 'qq6',
        scenario: 'Your school is planning a field trip. The venue is 10 km away. There are 40 students and 3 teachers.',
        question: 'Which transport option has the lowest carbon footprint?',
        options: [
          'Each family drives their child to the venue separately',
          'Hire one school bus for everyone',
          'Cancel the trip to avoid emissions entirely',
          'Ask students to take auto-rickshaws in groups of 3'
        ],
        correct: 1,
        explanation: 'A single school bus carrying all 43 people has a much lower per-person carbon footprint than multiple cars or auto-rickshaws. Shared transport is one of the most effective ways to reduce transport emissions.',
        points: 20,
      },
      {
        id: 'qq7',
        scenario: 'India aims to reach net-zero emissions by 2070. Your school wants to contribute to this goal.',
        question: 'Which school-level initiative would have the greatest long-term impact?',
        options: [
          'Switch off lights during lunch break',
          'Install solar panels on the school roof and integrate environmental education into the curriculum',
          'Plant 10 trees in the school ground',
          'Organize one awareness rally per year'
        ],
        correct: 1,
        explanation: 'Solar panels provide clean energy for decades, reducing the school\'s carbon footprint permanently. Combined with environmental education, this creates both immediate impact and long-term behavioral change in students.',
        points: 25,
      },
    ],
    difficulty: 'Intermediate',
    totalPoints: 45,
  },
];

// ---------- CROSSWORD DATA ----------
const crosswordWords = {
  'Waste Management': {
    Beginner: [['BIN', 'A container used for collecting waste', 'across', 0, 0], ['REUSE', 'Use an item again instead of throwing it away', 'across', 4, 0], ['PAPER', 'Material commonly made from trees', 'across', 8, 0], ['RECYCLE', 'Process materials so they can become new products', 'down', 0, 10], ['CLEAN', 'Free from dirt or unwanted waste', 'down', 2, 5]],
    Intermediate: [['COMPOST', 'Decomposed organic matter used to fertilize soil', 'across', 0, 0], ['LANDFILL', 'Place where waste is buried', 'across', 4, 0], ['PLASTIC', 'Durable material found in many disposable products', 'across', 8, 0], ['SEGREGATE', 'Separate waste into different categories', 'down', 0, 11], ['REUSE', 'Use something again rather than discard it', 'down', 2, 5], ['RECYCLE', 'Process used materials into new products', 'down', 1, 1], ['HAZARDOUS', 'Potentially dangerous to people or the environment', 'down', 3, 8]],
    Advanced: [['CIRCULAR', 'Describes an economy that keeps materials in use', 'across', 0, 0], ['BIODEGRADE', 'Break down naturally through living organisms', 'across', 4, 0], ['MICROPLASTIC', 'Tiny plastic particle found in the environment', 'across', 8, 0], ['UPCYCLING', 'Turning waste into a product of higher value', 'down', 0, 12], ['RECOVERY', 'Extraction of useful materials or energy from waste', 'down', 2, 6], ['ZEROWASTE', 'Design approach that aims to eliminate disposal', 'down', 0, 2], ['EXTENDED', 'Describes producer responsibility beyond a sale', 'down', 2, 9], ['TOXICITY', 'Degree to which a substance can cause harm', 'down', 5, 4], ['RESOURCE', 'Useful material that can be conserved or reused', 'down', 1, 7]],
  },
  Climate: {
    Beginner: [['SUN', 'The star that provides Earth with light and heat', 'across', 0, 0], ['RAIN', 'Water falling from clouds', 'across', 4, 0], ['WIND', 'Moving air', 'across', 8, 0], ['EARTH', 'The planet on which we live', 'down', 0, 9], ['HOT', 'Having a high temperature', 'down', 2, 5]],
    Intermediate: [['CLIMATE', 'Long-term weather patterns in a region', 'across', 0, 0], ['CARBON', 'Element released when fossil fuels burn', 'across', 4, 0], ['DROUGHT', 'A long period with very little rainfall', 'across', 8, 0], ['EMISSION', 'Release of gases or particles into the air', 'down', 0, 11], ['WARMING', 'Increase in average global temperature', 'down', 2, 6], ['OCEAN', 'Large body of salt water affected by warming', 'down', 1, 1], ['FLOOD', 'Overflow of water onto normally dry land', 'down', 3, 8]],
    Advanced: [['GREENHOUSE', 'Atmospheric effect that traps heat near Earth', 'across', 0, 0], ['MITIGATION', 'Action that reduces the causes of climate change', 'across', 4, 0], ['ADAPTATION', 'Adjustment to actual or expected climate effects', 'across', 8, 0], ['SEQUESTRATION', 'Long-term capture and storage of carbon', 'down', 0, 12], ['ALBEDO', 'The amount of sunlight reflected by a surface', 'down', 2, 6], ['FEEDBACK', 'Process that amplifies or reduces climate change', 'down', 0, 2], ['RESILIENCE', 'Capacity to recover from climate impacts', 'down', 2, 9], ['AEROSOL', 'Tiny particle suspended in the atmosphere', 'down', 5, 4], ['PRECIPITATION', 'Water released from clouds as rain or snow', 'down', 1, 7]],
  },
  Biodiversity: {
    Beginner: [['TREE', 'A tall plant with a trunk and branches', 'across', 0, 0], ['BIRD', 'An animal with feathers and wings', 'across', 4, 0], ['FISH', 'An animal that lives in water', 'across', 8, 0], ['LIFE', 'A quality shared by plants and animals', 'down', 0, 8], ['WILD', 'Living in nature rather than being domesticated', 'down', 2, 4]],
    Intermediate: [['HABITAT', 'The natural home of an organism', 'across', 0, 0], ['SPECIES', 'A group of similar organisms that can reproduce', 'across', 4, 0], ['POLLINATOR', 'Animal that carries pollen between flowers', 'across', 8, 0], ['NATIVE', 'Naturally occurring in a particular place', 'down', 0, 11], ['CORAL', 'Marine animal that builds a reef structure', 'down', 2, 5], ['ADAPT', 'Change to survive in a different environment', 'down', 1, 1], ['PREDATOR', 'Animal that hunts another animal for food', 'down', 3, 8]],
    Advanced: [['ECOSYSTEM', 'Community of organisms interacting with their environment', 'across', 0, 0], ['BIODIVERSITY', 'Variety of living organisms in an ecosystem', 'across', 4, 0], ['CONSERVATION', 'Protection and careful management of nature', 'across', 8, 0], ['ENDEMIC', 'Found naturally only in a particular geographic area', 'down', 0, 12], ['CORRIDOR', 'Connected habitat that helps wildlife move safely', 'down', 2, 6], ['GENETIC', 'Relating to inherited variation within a species', 'down', 0, 2], ['INVASIVE', 'Non-native species that causes ecological harm', 'down', 2, 9], ['MIGRATION', 'Seasonal movement of animals between regions', 'down', 5, 4], ['KEYSTONE', 'Species with an especially large ecosystem impact', 'down', 1, 7]],
  },
};

export const mockCrosswordPuzzles = Object.entries(crosswordWords).flatMap(([topic, levels]) =>
  Object.entries(levels).map(([level, words]) => ({
    id: `${topic}-${level.toLowerCase()}`,
    topic,
    level,
    size: 13,
    words: words.map(([word, clue, direction, row, col], index) => ({ word, clue: `${index + 1}${direction === 'across' ? 'A' : 'D'}. ${clue}`, direction, row, col, num: index + 1 })),
    bonusPoints: level === 'Advanced' ? 100 : level === 'Intermediate' ? 75 : 50,
  }))
);

// ---------- COMPETITIONS ----------
export const mockCompetitions = [
  { id: 'comp1', name: 'Inter-School Green Challenge 2026', startDate: '2026-09-01', endDate: '2026-09-30', schools: 84, students: 12400, status: 'upcoming', missions: 15, description: 'Compete with schools across the state for the greenest campus award' },
  { id: 'comp2', name: 'National Green Campus Challenge 2026', startDate: '2026-09-01', endDate: '2026-09-30', schools: 128, students: 42850, status: 'upcoming', missions: 20, description: 'India\'s largest inter-school environmental competition' },
  { id: 'comp3', name: 'Clean City Initiative', startDate: '2026-08-01', endDate: '2026-08-31', schools: 45, students: 8900, status: 'active', missions: 10, description: 'Community clean-up challenge across participating schools' },
  { id: 'comp4', name: 'Water Warriors Cup', startDate: '2026-07-15', endDate: '2026-08-15', schools: 32, students: 5600, status: 'completed', missions: 8, description: 'Water conservation challenge with measurable impact' },
  { id: 'comp5', name: 'Biodiversity Blitz 2026', startDate: '2026-10-01', endDate: '2026-10-31', schools: 60, students: 9200, status: 'upcoming', missions: 12, description: 'Document and protect local biodiversity across India' },
];

// ---------- LEADERBOARD ----------
export const mockClassLeaderboard = [
  { rank: 1, name: 'Aarav Patel', points: 2850, change: 0, avatar: '🌳' },
  { rank: 2, name: 'Meghna Rao', points: 2680, change: 1, avatar: '🌸' },
  { rank: 3, name: 'Priya Iyer', points: 2210, change: -1, avatar: '💧' },
  { rank: 4, name: 'Rohan Gupta', points: 1920, change: 0, avatar: '🌍' },
  { rank: 5, name: 'Riya Deshmukh', points: 1980, change: 2, avatar: '🌻' },
  { rank: 6, name: 'Aisha Khan', points: 2340, change: -1, avatar: '🌺' },
  { rank: 7, name: 'Ananya Sharma', points: 2450, change: 1, avatar: '🌿' },
  { rank: 8, name: 'Vikram Singh', points: 1650, change: -2, avatar: '🦋' },
  { rank: 9, name: 'Siddharth Joshi', points: 2100, change: 0, avatar: '🌲' },
  { rank: 10, name: 'Kavya Nair', points: 1780, change: 1, avatar: '🍃' },
];

export const mockSchoolLeaderboard = [
  { rank: 1, name: 'Green Valley School', points: 82450, students: 480, city: 'Hyderabad' },
  { rank: 2, name: 'Sunrise Academy', points: 78320, students: 620, city: 'Bangalore' },
  { rank: 3, name: 'ABC Public School', points: 71900, students: 390, city: 'Chennai' },
  { rank: 4, name: 'Delhi Modern School', points: 68400, students: 510, city: 'Delhi' },
  { rank: 5, name: 'Pune Green School', points: 65800, students: 350, city: 'Pune' },
];

// ---------- SUBMISSIONS (for teacher review) ----------
export const mockSubmissions = [
  { id: 'sub1', studentId: 'u1', studentName: 'Ananya Sharma', missionId: 'm5', missionTitle: 'Plant a Tree', imageUrl: '/placeholder-tree.jpg', location: 'School Campus', timestamp: '2026-08-18T10:30:00', aiConfidence: 94, aiVerified: true, teacherApproval: 'pending', status: 'awaiting_approval', pointsAwarded: 0, detectedItems: ['Tree sapling', 'Soil', 'Gardening tools'] },
  { id: 'sub2', studentId: 'u2', studentName: 'Aarav Patel', missionId: 'm3', missionTitle: 'Waste Segregation Champion', imageUrl: '/placeholder-waste.jpg', location: 'Home', timestamp: '2026-08-17T14:20:00', aiConfidence: 91, aiVerified: true, teacherApproval: 'pending', status: 'awaiting_approval', pointsAwarded: 0, detectedItems: ['Paper → Dry Waste', 'Plastic → Dry Waste', 'Organic Waste → Wet Waste'] },
  { id: 'sub3', studentId: 'u3', studentName: 'Priya Iyer', missionId: 'm2', missionTitle: 'Water Saver', imageUrl: '/placeholder-water.jpg', location: 'Home', timestamp: '2026-08-17T09:15:00', aiConfidence: 87, aiVerified: true, teacherApproval: 'approved', status: 'approved', pointsAwarded: 75, detectedItems: ['Water meter reading', 'Low-flow faucet'] },
  { id: 'sub4', studentId: 'u4', studentName: 'Riya Deshmukh', missionId: 'm4', missionTitle: 'Green Transport', imageUrl: '/placeholder-cycle.jpg', location: 'Near School', timestamp: '2026-08-16T08:00:00', aiConfidence: 89, aiVerified: true, teacherApproval: 'pending', status: 'awaiting_approval', pointsAwarded: 0, detectedItems: ['Bicycle', 'School gate'] },
  { id: 'sub5', studentId: 'u6', studentName: 'Meghna Rao', missionId: 'm6', missionTitle: 'Biodiversity Explorer', imageUrl: '/placeholder-bird.jpg', location: 'School Garden', timestamp: '2026-08-18T16:45:00', aiConfidence: 92, aiVerified: true, teacherApproval: 'pending', status: 'awaiting_approval', pointsAwarded: 0, detectedItems: ['Bird species: Indian Mynah', 'Natural habitat'] },
  { id: 'sub6', studentId: 'u5', studentName: 'Vikram Singh', missionId: 'm1', missionTitle: 'Plastic-Free Week', imageUrl: '/placeholder-noplastic.jpg', location: 'Home', timestamp: '2026-08-15T12:30:00', aiConfidence: 72, aiVerified: false, teacherApproval: 'rejected', status: 'rejected', pointsAwarded: 0, detectedItems: ['Image unclear', 'Low quality'] },
  { id: 'sub7', studentId: 'u1', studentName: 'Ananya Sharma', missionId: 'm7', missionTitle: 'Clean Campus', imageUrl: '/placeholder-cleanup.jpg', location: 'School Campus', timestamp: '2026-08-18T15:00:00', aiConfidence: 96, aiVerified: true, teacherApproval: 'pending', status: 'awaiting_approval', pointsAwarded: 0, detectedItems: ['Group activity', 'Cleaning supplies', 'Campus area'] },
  { id: 'sub8', studentId: 'u8', studentName: 'Aisha Khan', missionId: 'm2', missionTitle: 'Water Saver', imageUrl: '/placeholder-rainwater.jpg', location: 'Home', timestamp: '2026-08-17T11:00:00', aiConfidence: 88, aiVerified: true, teacherApproval: 'approved', status: 'approved', pointsAwarded: 75, detectedItems: ['Rainwater collection setup'] },
];

// ---------- TEACHER DATA ----------
export const mockTeacherMetrics = {
  totalStudents: 120,
  activeStudents: 94,
  averagePerformance: 78,
  pendingReviews: 8,
  tasksAssigned: 24,
};

export const mockStudentPerformance = [
  { name: 'Aarav Patel', quizScore: 92, missions: 12, streak: 7, ecoPoints: 2850, performance: 'Excellent' },
  { name: 'Meghna Rao', quizScore: 89, missions: 10, streak: 6, ecoPoints: 2680, performance: 'Excellent' },
  { name: 'Priya Iyer', quizScore: 84, missions: 10, streak: 5, ecoPoints: 2210, performance: 'Good' },
  { name: 'Ananya Sharma', quizScore: 84, missions: 8, streak: 5, ecoPoints: 2450, performance: 'Good' },
  { name: 'Riya Deshmukh', quizScore: 76, missions: 6, streak: 3, ecoPoints: 1980, performance: 'Good' },
  { name: 'Rohan Gupta', quizScore: 75, missions: 5, streak: 4, ecoPoints: 1920, performance: 'Good' },
  { name: 'Vikram Singh', quizScore: 68, missions: 4, streak: 2, ecoPoints: 1650, performance: 'Needs Improvement' },
  { name: 'Kavya Nair', quizScore: 61, missions: 3, streak: 2, ecoPoints: 1450, performance: 'Needs Improvement' },
];

// ---------- AI INSIGHTS ----------
export const mockAIInsights = [
  { type: 'observation', icon: '📊', text: 'Students are performing well in Renewable Energy but struggling with Waste Management.', priority: 'medium' },
  { type: 'warning', icon: '⚠️', text: '23% of students have not completed the Water Conservation task.', priority: 'high' },
  { type: 'insight', icon: '💡', text: 'Scenario-based questions have a higher completion rate than standard questions.', priority: 'low' },
  { type: 'recommendation', icon: '🎯', text: 'Assign Waste Segregation Mission to Class 8-A to improve weak topic scores.', priority: 'high' },
  { type: 'positive', icon: '🌟', text: 'Class average Eco Points increased by 15% this week compared to last week.', priority: 'low' },
];

// ---------- ORGANIZER METRICS ----------
export const mockOrganizerMetrics = {
  totalSchools: 128,
  totalStudents: 42850,
  totalTeachers: 2340,
  activeCompetitions: 16,
  missionsCompleted: 156000,
  ecoPointsGenerated: 8450000,
  verifiedActions: 89200,
};

// ---------- CHART DATA ----------
export const mockTopicPerformance = [
  { topic: 'Climate Change', score: 78, students: 340 },
  { topic: 'Waste Mgmt', score: 65, students: 380 },
  { topic: 'Water', score: 72, students: 290 },
  { topic: 'Biodiversity', score: 58, students: 210 },
  { topic: 'Renewable', score: 85, students: 320 },
  { topic: 'Pollution', score: 70, students: 260 },
  { topic: 'Sustainable', score: 82, students: 350 },
  { topic: 'Forest', score: 45, students: 150 },
];

export const mockWeeklyActivity = [
  { day: 'Mon', lessons: 45, quizzes: 32, missions: 18 },
  { day: 'Tue', lessons: 52, quizzes: 28, missions: 22 },
  { day: 'Wed', lessons: 38, quizzes: 35, missions: 15 },
  { day: 'Thu', lessons: 61, quizzes: 41, missions: 28 },
  { day: 'Fri', lessons: 55, quizzes: 38, missions: 25 },
  { day: 'Sat', lessons: 28, quizzes: 15, missions: 12 },
  { day: 'Sun', lessons: 15, quizzes: 8, missions: 5 },
];

export const mockMonthlyProgress = [
  { month: 'Mar', points: 1200, missions: 8, students: 85 },
  { month: 'Apr', points: 1800, missions: 14, students: 92 },
  { month: 'May', points: 2400, missions: 20, students: 98 },
  { month: 'Jun', points: 1600, missions: 12, students: 78 },
  { month: 'Jul', points: 3200, missions: 28, students: 105 },
  { month: 'Aug', points: 2800, missions: 24, students: 110 },
];

// ---------- GREEN SCORE ----------
export const mockGreenScore = {
  learningScore: 84,
  missionScore: 91,
  verifiedActionScore: 88,
  participationScore: 95,
  overall: 89.5,
};

// ---------- NOTIFICATIONS ----------
export const mockNotifications = [
  { id: 'n1', type: 'points', icon: '🎉', message: 'You earned 100 Eco Points!', time: '2 mins ago', read: false },
  { id: 'n2', type: 'rank', icon: '🏆', message: 'You moved to #7 in your class!', time: '5 mins ago', read: false },
  { id: 'n3', type: 'streak', icon: '🔥', message: 'Your 5-week streak is active! Keep going!', time: '1 hour ago', read: true },
  { id: 'n4', type: 'badge', icon: '🎖️', message: 'New badge unlocked: Energy Saver!', time: '3 hours ago', read: true },
  { id: 'n5', type: 'mission', icon: '📋', message: 'New mission available: Clean Campus', time: '1 day ago', read: true },
];

// ---------- AI RECOMMENDATION ----------
export const mockAIRecommendation = {
  weakTopics: [
    { topic: 'Water Conservation', score: 58, status: 'Needs Improvement' },
    { topic: 'Forest & Wildlife', score: 45, status: 'Needs Improvement' },
  ],
  goodTopics: [
    { topic: 'Waste Management', score: 72, status: 'Good' },
    { topic: 'Climate Change', score: 78, status: 'Good' },
  ],
  strongTopics: [
    { topic: 'Renewable Energy', score: 92, status: 'Strong' },
    { topic: 'Sustainable Lifestyle', score: 85, status: 'Strong' },
  ],
  recommendedLesson: {
    title: 'Water Conservation: Save Every Drop',
    topic: 'Water Conservation',
    reason: 'You scored 58% in recent Water Conservation scenarios.',
  },
  recommendedMission: {
    title: 'Water Guardian',
    reason: 'You learn best through scenario-based activities. Try the Water Guardian mission next.',
  },
};
