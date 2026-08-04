const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read a JSON file safely
function readJSON(filename, defaultData = []) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || JSON.stringify(defaultData));
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultData;
  }
}

// Helper to write a JSON file safely
function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    return false;
  }
}

// Seed Initial Data if empty
function initializeDatabase() {
  // 1. Seed Quizzes
  const defaultQuizzes = [
    {
      id: "q-rajasthan-history",
      title: "Rajasthan History & Dynasties Quiz",
      questions: [
        { id: "q1", questionText: "Which famous Battle of Haldighati was fought in 1576 AD?", options: ["Maharana Pratap and Akbar's army", "Prithviraj Chauhan and Muhammad Ghori", "Rana Sanga and Babur", "Maldeo Rathore and Sher Shah Suri"], correctOptionIndex: 0 },
        { id: "q2", questionText: "Who was the founder of the Mewar Dynasty?", options: ["Bappa Rawal", "Rana Hamir", "Rana Kumbha", "Rana Sanga"], correctOptionIndex: 0 },
        { id: "q3", questionText: "The famous Kirti Stambha (Tower of Fame) at Chittorgarh was built by:", options: ["Rana Kumbha", "Rana Sanga", "Rana Pratap", "Rana Udai Singh"], correctOptionIndex: 0 }
      ]
    },
    {
      id: "q-rajasthan-geography",
      title: "Geography of Rajasthan MCQ",
      questions: [
        { id: "qp1", questionText: "Which is the highest peak in Rajasthan?", options: ["Guru Shikhar", "Ser", "Achalgarh", "Dilwara"], correctOptionIndex: 0 },
        { id: "qp2", questionText: "Which river is known as the 'Ganga of Mewar' or 'Vashisthi'?", options: ["Banas", "Chambal", "Luni", "Mahi"], correctOptionIndex: 0 }
      ]
    },
    {
      id: "q-reet-pedagogy",
      title: "Child Development and Pedagogy (REET)",
      questions: [
        { id: "rp1", questionText: "According to Piaget, in which stage does a child develop object permanence?", options: ["Sensory-motor stage", "Pre-operational stage", "Concrete operational stage", "Formal operational stage"], correctOptionIndex: 0 },
        { id: "rp2", questionText: "The 'Trial and Error' theory of learning was proposed by:", options: ["Thorndike", "Pavlov", "Skinner", "Kohler"], correctOptionIndex: 0 }
      ]
    },
    {
      id: "q-constable-gk",
      title: "Rajasthan Police General GK Quiz",
      questions: [
        { id: "pg1", questionText: "In which year was the Rajasthan Police force established?", options: ["1949", "1950", "1951", "1956"], correctOptionIndex: 2 },
        { id: "pg2", questionText: "Where is the Rajasthan Police Academy located?", options: ["Jaipur", "Jodhpur", "Ajmer", "Bikaner"], correctOptionIndex: 0 }
      ]
    },
    {
      id: "q-polity-basics",
      title: "Rajasthan Polity & Administration MCQ",
      questions: [
        { id: "pb1", questionText: "Who was the first Governor of Rajasthan?", options: ["Gurumukh Nihal Singh", "Sawai Man Singh", "Sampurnanand", "Madan Lal Khurana"], correctOptionIndex: 0 },
        { id: "pb2", questionText: "How many members are there in the Rajasthan Legislative Assembly (Vidhan Sabha)?", options: ["150", "200", "250", "180"], correctOptionIndex: 1 }
      ]
    }
  ];
  readJSON('quizzes.json', defaultQuizzes);

  // 2. Seed Courses
      const defaultCourses = [
    {
      id: "c-2nd-grade",
      title: "2nd Grade",
      description: "Complete preparation course for the 2nd Grade Teacher examination.",
      thumbnail: "/images/ras_course.png",
      price: 18000,
      chapters: [
        {
          id: "ch-2nd-grade-syl",
          title: "Syllabus & Introduction",
          description: "Detailed syllabus for the 2nd Grade examination.",
          isFreePreview: true,
          lessons: [{ id: "les-2nd-grade-pdf", title: "Course Syllabus PDF", type: "pdf", pdfUrl: "https://drive.google.com/drive/folders/1zCoXrEReGEaQ6ExUlUl8ziD0vdA1Hv12?usp=sharing" }]
        }
      ]
    },
    {
      id: "c-reet-mains",
      title: "Reet Mains L1, L2",
      description: "Comprehensive preparation for REET Mains examinations (Level 1 & Level 2).",
      thumbnail: "/images/reet_course.png",
      price: 15000,
      chapters: [
        {
          id: "ch-reetmains-syl",
          title: "Syllabus & Introduction",
          description: "Detailed syllabus for REET Mains.",
          isFreePreview: true,
          lessons: [{ id: "les-reetmains-pdf", title: "Course Syllabus PDF", type: "pdf", pdfUrl: "https://drive.google.com/drive/folders/1zCoXrEReGEaQ6ExUlUl8ziD0vdA1Hv12?usp=sharing" }]
        }
      ]
    },
    {
      id: "c-reet-pre",
      title: "Reet Pre L1, L2",
      description: "Comprehensive preparation for REET Prelims examinations (Level 1 & Level 2).",
      thumbnail: "/images/reet_course.png",
      price: 12000,
      chapters: [
        {
          id: "ch-reetpre-syl",
          title: "Syllabus & Introduction",
          description: "Detailed syllabus for REET Prelims.",
          isFreePreview: true,
          lessons: [{ id: "les-reetpre-pdf", title: "Course Syllabus PDF", type: "pdf", pdfUrl: "https://drive.google.com/drive/folders/1zCoXrEReGEaQ6ExUlUl8ziD0vdA1Hv12?usp=sharing" }]
        }
      ]
    },
    {
      id: "c-foundation-1yr",
      title: "Foundation (1 Year)",
      description: "1-Year strong foundation course covering basics for competitive exams.",
      thumbnail: "/images/ras_course.png",
      price: 15000,
      chapters: [
        {
          id: "ch-found1-syl",
          title: "Syllabus & Introduction",
          description: "Detailed syllabus.",
          isFreePreview: true,
          lessons: [{ id: "les-found1-pdf", title: "Course Syllabus PDF", type: "pdf", pdfUrl: "https://drive.google.com/drive/folders/1zCoXrEReGEaQ6ExUlUl8ziD0vdA1Hv12?usp=sharing" }]
        }
      ]
    },
    {
      id: "c-foundation-6mo",
      title: "Foundation (6 Months)",
      description: "6-Month fast-track foundation course for competitive exams.",
      thumbnail: "/images/ras_course.png",
      price: 8000,
      chapters: [
        {
          id: "ch-found6-syl",
          title: "Syllabus & Introduction",
          description: "Detailed syllabus.",
          isFreePreview: true,
          lessons: [{ id: "les-found6-pdf", title: "Course Syllabus PDF", type: "pdf", pdfUrl: "https://drive.google.com/drive/folders/1zCoXrEReGEaQ6ExUlUl8ziD0vdA1Hv12?usp=sharing" }]
        }
      ]
    },
    {
      id: "c-cet",
      title: "CET 10+2 / Graduation",
      description: "Comprehensive preparation for Common Eligibility Test (CET) both 10+2 and Graduation levels.",
      thumbnail: "/images/patwar_cet_course.png",
      price: 6000,
      chapters: [
        {
          id: "ch-cet-syl",
          title: "Syllabus & Introduction",
          description: "Detailed syllabus for CET.",
          isFreePreview: true,
          lessons: [{ id: "les-cet-pdf", title: "Course Syllabus PDF", type: "pdf", pdfUrl: "https://drive.google.com/drive/folders/1zCoXrEReGEaQ6ExUlUl8ziD0vdA1Hv12?usp=sharing" }]
        }
      ]
    },
    {
      id: "c-ssc",
      title: "SSC",
      description: "Complete package for Staff Selection Commission (SSC) exams.",
      thumbnail: "/images/ras_course.png",
      price: 6000,
      chapters: [
        {
          id: "ch-ssc-syl",
          title: "Syllabus & Introduction",
          description: "Detailed syllabus for SSC.",
          isFreePreview: true,
          lessons: [{ id: "les-ssc-pdf", title: "Course Syllabus PDF", type: "pdf", pdfUrl: "https://drive.google.com/drive/folders/1zCoXrEReGEaQ6ExUlUl8ziD0vdA1Hv12?usp=sharing" }]
        }
      ]
    },
    {
      id: "c-rrb",
      title: "RRB",
      description: "Prepare effectively for Railway Recruitment Board (RRB) examinations.",
      thumbnail: "/images/ras_course.png",
      price: 6000,
      chapters: [
        {
          id: "ch-rrb-syl",
          title: "Syllabus & Introduction",
          description: "Detailed syllabus for RRB.",
          isFreePreview: true,
          lessons: [{ id: "les-rrb-pdf", title: "Course Syllabus PDF", type: "pdf", pdfUrl: "https://drive.google.com/drive/folders/1zCoXrEReGEaQ6ExUlUl8ziD0vdA1Hv12?usp=sharing" }]
        }
      ]
    },
    {
      id: "c-raj-police",
      title: "Raj Police",
      description: "Targeted course for Rajasthan Police recruitment exams.",
      thumbnail: "/images/police_course.png",
      price: 6000,
      chapters: [
        {
          id: "ch-rajpol-syl",
          title: "Syllabus & Introduction",
          description: "Detailed syllabus for Raj Police.",
          isFreePreview: true,
          lessons: [{ id: "les-rajpol-pdf", title: "Course Syllabus PDF", type: "pdf", pdfUrl: "https://drive.google.com/drive/folders/1zCoXrEReGEaQ6ExUlUl8ziD0vdA1Hv12?usp=sharing" }]
        }
      ]
    },
    {
      id: "c-delhi-police",
      title: "Delhi Police",
      description: "Dedicated preparation course for Delhi Police examinations.",
      thumbnail: "/images/police_course.png",
      price: 6000,
      chapters: [
        {
          id: "ch-delpol-syl",
          title: "Syllabus & Introduction",
          description: "Detailed syllabus for Delhi Police.",
          isFreePreview: true,
          lessons: [{ id: "les-delpol-pdf", title: "Course Syllabus PDF", type: "pdf", pdfUrl: "https://drive.google.com/drive/folders/1zCoXrEReGEaQ6ExUlUl8ziD0vdA1Hv12?usp=sharing" }]
        }
      ]
    },
    {
      id: "c-army",
      title: "Army",
      description: "Prepare for Indian Army recruitment examinations with our expert guidance.",
      thumbnail: "/images/ras_course.png",
      price: 6000,
      chapters: [
        {
          id: "ch-army-syl",
          title: "Syllabus & Introduction",
          description: "Detailed syllabus for Army.",
          isFreePreview: true,
          lessons: [{ id: "les-army-pdf", title: "Course Syllabus PDF", type: "pdf", pdfUrl: "https://drive.google.com/drive/folders/1zCoXrEReGEaQ6ExUlUl8ziD0vdA1Hv12?usp=sharing" }]
        }
      ]
    },
    {
      id: "c-pre-bstc",
      title: "Pre BSTC",
      description: "Pre BSTC examination preparation with complete syllabus coverage.",
      thumbnail: "/images/reet_course.png",
      price: 4500,
      chapters: [
        {
          id: "ch-bstc-syl",
          title: "Syllabus & Introduction",
          description: "Detailed syllabus for Pre BSTC.",
          isFreePreview: true,
          lessons: [{ id: "les-bstc-pdf", title: "Course Syllabus PDF", type: "pdf", pdfUrl: "https://drive.google.com/drive/folders/1zCoXrEReGEaQ6ExUlUl8ziD0vdA1Hv12?usp=sharing" }]
        }
      ]
    }
  ];
  readJSON('courses.json', defaultCourses);

  // 3. Seed Doubt Sessions
  const defaultDoubtSessions = [
    {
      id: "ds1",
      title: "RAS Prelims Paper 1 & Rajasthan GK - Live Doubt Class",
      date: "Every Wednesday",
      time: "5:00 PM - 6:30 PM IST",
      url: "https://zoom.us/j/999888777666?pwd=mockpasswordRAS",
      description: "Interactive session with Avasthi Sir to clear concepts and solve previous years questions of Rajasthan History and Art & Culture."
    },
    {
      id: "ds2",
      title: "REET Pedagogy & Child Development - Weekly Mentorship",
      date: "Every Friday",
      time: "6:30 PM - 7:30 PM IST",
      url: "https://meet.google.com/abc-defg-hij",
      description: "Live session discussing child psychology, pedagogical frameworks, and REET Level 1 & 2 exam syllabus queries."
    }
  ];
  readJSON('doubt_sessions.json', defaultDoubtSessions);

  // 4. Seed Blogs
  const defaultBlogs = [
    {
      id: "blog1",
      title: "How to Crack RAS Prelims: Rajasthan GK Strategy",
      summary: "Rajasthan GK holds around 35-40% weightage in RAS Prelims. Learn the exact topic weightage and reference books to score high.",
      content: "Cracking the RAS (Rajasthan Administrative Services) exam requires a solid grip on Rajasthan General Knowledge (GK). Out of 150 questions in the Prelims paper, about 50-60 questions are directly related to Rajasthan's history, art, culture, geography, polity, and economy. Focus first on Rajasthan's Art and Culture, as it has the highest consistency in exam questions—memorize major forts, temples, folk deities, and festivals. For geography, map-based study is extremely effective for rivers, minerals, and physical divisions. Keep revising from standard textbooks and take mock tests weekly. Remember, consistency is the key to securing a top rank in state services!",
      author: "V. K. Avasthi (Senior General Studies Faculty)",
      date: "June 25, 2026",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "blog2",
      title: "REET Child Pedagogy: Tips for Scoring 30/30",
      summary: "BAAL VIKAS is a core section in REET. Master Piaget, Vygotsky theories and teaching methods to secure full marks.",
      content: "Baal Vikas (Child Development and Pedagogy) is one of the most scoring sections in the REET exam. To score 30 out of 30, you need to understand the practical application of child development theories. Pay special attention to Piaget's stages of cognitive development, Kohlberg's moral development, and Vygotsky's socio-cultural theory. Practice situational questions where you act as a facilitator in an inclusive classroom. Additionally, ensure you are well-versed in the Right to Education (RTE) Act 2009 and National Curriculum Framework (NCF) 2005, as multiple direct questions are asked from these acts every year.",
      author: "P. Avasthi (CD & Pedagogy Director)",
      date: "June 28, 2026",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "blog3",
      title: "Common Eligibility Test (CET) Prep Strategy",
      summary: "Balancing graduation level and 12th level CET. Focus on Computer, English, and Mental Ability topics.",
      content: "The Rajasthan CET has become a mandatory qualifying gateway for multiple state services like Junior Accountant, LDC, Patwar, and Police Constable. The syllabus is massive, covering India and Rajasthan history, polity, geography, along with General English, Hindi, Computers, and Mental Ability. The best strategy is to first master the core scoring subjects: Mental Ability, Computers, and Hindi/English. These sections have defined syllabi and high accuracy rates. Devote 2 hours daily to Rajasthan GK, focusing on economic surveys and current affairs. Regular practice of mock papers will help you easily clear the qualifying cutoff.",
      author: "R. Sharma (General Mental Ability HOD)",
      date: "June 20, 2026",
      image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "blog4",
      title: "Important Milestones in Rajasthan's Integration",
      summary: "Understand the 7 stages of Rajasthan formation between 1948 and 1956, a must-know topic for all state exams.",
      content: "The integration of Rajasthan took place in seven distinct stages from 18 March 1948 to 1 November 1956. This is a highly critical topic for RAS, REET, Patwar, and Constable exams. You must memorize the dates of each stage, the princely states merged, the names of prime ministers/chief ministers appointed, and the Rajpramukhs. For example, the Matsya Union was the first stage formed on 18 March 1948, comprising Alwar, Bharatpur, Dholpur, and Karauli. The final state of modern Rajasthan was established on 1 November 1956 under the recommendation of the State Reorganization Commission headed by Fazal Ali. Use timelines and maps to memorize this sequence easily.",
      author: "A. Dwivedi (History Senior Faculty)",
      date: "June 15, 2026",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400"
    }
  ];
  readJSON('blogs.json', defaultBlogs);

  // 5. Seed Admin User
  const defaultUsers = [
    {
      id: "u-admin",
      name: "Avasthi Classes Admin",
      email: "admin@avasthiclasses.com",
      phone: "+919999988888",
      passwordHash: "$2a$10$sjKfBl0A3VgROCMRnv3Q1ewzSHbI8FksdmVC7bXb7AWIUZRU9fBDe", // "admin123"
      role: "admin",
      createdAt: new Date().toISOString()
    },
    {
      id: "u-demo",
      name: "Rahul Sharma (Free Student)",
      email: "rahul@gmail.com",
      phone: "+919876543210",
      passwordHash: "$2a$10$CjmvJ0aAlf4Q8qadx0D9W.qe/i6YZWd9i6T2sYcO3ZC2/wdVTCAlO", // "123456"
      role: "subscriber",
      createdAt: new Date().toISOString()
    },
    {
      id: "u-paid",
      name: "Ananya Sen (Premium Student)",
      email: "ananya@gmail.com",
      phone: "+918765432109",
      passwordHash: "$2a$10$wO7oWkUlyqI/z3L47tEeeu59Tf8d16N6z5gW5G3Nq9/hUa", // "student123"
      role: "premium_student",
      createdAt: new Date().toISOString()
    }
  ];
  readJSON('users.json', defaultUsers);

  // Initialize progress and payments
  readJSON('progress.json', {});
  readJSON('attempts.json', []);
  readJSON('payments.json', [
    {
      id: "p1",
      order_id: "order_mock_001",
      payment_id: "pay_mock_001",
      user_id: "u-paid",
      amount: 4999,
      course_id: "c-ras-pre-mains",
      course_title: "RAS (Rajasthan Administrative Services) Complete Course",
      status: "captured",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  // Seed Promotional Data
  const defaultFlyers = [
    {
      id: "flyer-1",
      title: "RAS 2026 Foundation Super Batch",
      subtitle: "New Offline & Online Batch starting from 1st August. Admissions Open!",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200",
      badge: "ADMISSIONS OPEN",
      targetExam: "RAS 2026",
      active: true
    },
    {
      id: "flyer-2",
      title: "REET Level 1 & 2 Pedagogy & GK Test Series",
      subtitle: "Top classroom faculty curated test series with video solutions.",
      imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200",
      badge: "50+ MOCK TESTS",
      targetExam: "REET 2026",
      active: true
    },
    {
      id: "flyer-3",
      title: "Rajasthan Police Constable Crash Course",
      subtitle: "Special daily doubt resolution & physical test guidance program.",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
      badge: "SPECIAL BATCH",
      targetExam: "Police Constable",
      active: true
    }
  ];
  readJSON('flyers.json', defaultFlyers);

  const defaultUpdates = [
    {
      id: "up-1",
      title: "RAS Prelims 2026 Offline Test Series Schedule Released",
      date: "25 Jul",
      year: "2026",
      category: "Schedule",
      isNew: true,
      description: "Detailed test timeline and syllabus breakdown for 35 offline tests is now available at the administrative block."
    },
    {
      id: "up-2",
      title: "Special Workshop on Rajasthan Economy & Budget Analysis",
      date: "28 Jul",
      year: "2026",
      category: "Seminar",
      isNew: true,
      description: "Interactive session by Senior Faculty on Rajasthan State Budget highlights and economic review."
    },
    {
      id: "up-3",
      title: "REET 2026 Super-30 Merit Scholarship Test Announced",
      date: "02 Aug",
      year: "2026",
      category: "Scholarship",
      isNew: false,
      description: "Top 30 rankers in the open diagnostic test will receive 100% tuition waiver for REET classroom coaching."
    }
  ];
  readJSON('updates.json', defaultUpdates);

  const defaultResults = [
    {
      id: "top-1",
      name: "Pooja Choudhary",
      exam: "RAS Exam 2023",
      rank: "Rank 04",
      year: "2023",
      photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
      testimonial: "Avasthi Classes guided me thoroughly for RAS Mains answer writing. The test series was instrumental in my top rank!"
    },
    {
      id: "top-2",
      name: "Vikram Singh Rathore",
      exam: "REET Level-2",
      rank: "Rank 01 (State Topper)",
      year: "2024",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      testimonial: "The pedagogy guidance and daily offline quizzes gave me the confidence to secure State Rank 1."
    },
    {
      id: "top-3",
      name: "Rahul Sharma",
      exam: "Rajasthan Police Sub-Inspector",
      rank: "Rank 12",
      year: "2024",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      testimonial: "Best coaching institute in Rajasthan for competitive exam preparation. Dedicated faculty and structured notes."
    }
  ];
  readJSON('results.json', defaultResults);

  const defaultStaff = [
    {
      id: "staff-1",
      name: "V. K. Avasthi",
      designation: "Director & Senior Faculty (History)",
      photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "staff-2",
      name: "P. Avasthi",
      designation: "HOD - Child Development & Pedagogy",
      photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "staff-3",
      name: "R. Sharma",
      designation: "Senior Faculty (Mental Ability)",
      photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400"
    }
  ];
  readJSON('staff.json', defaultStaff);
}

// Initial Call
initializeDatabase();

// Exportable DB Methods
module.exports = {
  // Raw Data Access
  getCollection(filename) {
    return readJSON(filename);
  },
  saveCollection(filename, data) {
    return writeJSON(filename, data);
  },

  // Users Management
  getUsers() {
    return readJSON('users.json');
  },
  saveUsers(users) {
    return writeJSON('users.json', users);
  },
  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  },
  getUserByEmail(email) {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  createUser(user) {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
    return user;
  },
  updateUser(id, updatedFields) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updatedFields };
      this.saveUsers(users);
      return users[idx];
    }
    return null;
  },

  // Courses Management
  getCourses() {
    return readJSON('courses.json');
  },
  saveCourses(courses) {
    return writeJSON('courses.json', courses);
  },
  getCourseById(id) {
    return this.getCourses().find(c => c.id === id);
  },

  // Quizzes
  getQuizzes() {
    return readJSON('quizzes.json');
  },
  saveQuizzes(quizzes) {
    return writeJSON('quizzes.json', quizzes);
  },
  getQuizById(id) {
    return this.getQuizzes().find(q => q.id === id);
  },

  // Attempts
  getAttempts() {
    return readJSON('attempts.json');
  },
  saveAttempts(attempts) {
    return writeJSON('attempts.json', attempts);
  },
  getUserAttempts(userId) {
    return this.getAttempts().filter(a => a.user_id === userId);
  },
  saveAttempt(attempt) {
    const attempts = this.getAttempts();
    attempts.push(attempt);
    this.saveAttempts(attempts);
    return attempt;
  },

  // Video/Course Progress
  getProgress() {
    return readJSON('progress.json', {});
  },
  saveProgress(progress) {
    return writeJSON('progress.json', progress);
  },
  getUserProgress(userId, courseId) {
    const progress = this.getProgress();
    if (!progress[userId]) return {};
    if (courseId) return progress[userId][courseId] || {};
    return progress[userId];
  },
  updateVideoProgress(userId, courseId, lessonId, watchedPercentage) {
    const progress = this.getProgress();
    if (!progress[userId]) progress[userId] = {};
    if (!progress[userId][courseId]) progress[userId][courseId] = {};
    
    const current = progress[userId][courseId][lessonId] || { watchedPercentage: 0, completed: false };
    
    // Auto complete when >= 90%
    const completed = watchedPercentage >= 90 ? true : current.completed;
    
    progress[userId][courseId][lessonId] = {
      watchedPercentage: Math.max(current.watchedPercentage, watchedPercentage),
      completed,
      updatedAt: new Date().toISOString()
    };
    
    this.saveProgress(progress);
    return progress[userId][courseId][lessonId];
  },

  // Live Doubt Sessions
  getDoubtSessions() {
    return readJSON('doubt_sessions.json');
  },
  saveDoubtSessions(sessions) {
    return writeJSON('doubt_sessions.json', sessions);
  },

  // Payments
  getPayments() {
    return readJSON('payments.json');
  },
  savePayments(payments) {
    return writeJSON('payments.json', payments);
  },
  createPayment(payment) {
    const payments = this.getPayments();
    payments.push(payment);
    this.savePayments(payments);
    return payment;
  },

  // Promotional Data (Flyers, Updates/Bulletins, Topper Results)
  getFlyers() {
    return readJSON('flyers.json');
  },
  saveFlyers(flyers) {
    return writeJSON('flyers.json', flyers);
  },

  getUpdates() {
    return readJSON('updates.json');
  },
  saveUpdates(updates) {
    return writeJSON('updates.json', updates);
  },

  getResults() {
    return readJSON('results.json');
  },
  saveResults(results) {
    return writeJSON('results.json', results);
  },

  getStaff() {
    return readJSON('staff.json');
  },
  saveStaff(staff) {
    return writeJSON('staff.json', staff);
  }
};
