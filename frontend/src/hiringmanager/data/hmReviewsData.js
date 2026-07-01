export const upcomingInterviewsReview = [
  {
    id: 1,
    initials: 'SK',
    color: '#14b8a6',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    role: 'Senior UI Architect',
    date: 'Oct 24, 10:30 AM',
    panelExtra: 1,
    status: 'LIVE NOW',
    statusColor: '#22c55e',
    action: 'JOIN ROOM',
  },
  {
    id: 2,
    initials: 'MW',
    color: '#3b82f6',
    name: 'Michael Wong',
    email: 'm.wong@example.com',
    role: 'Lead Experience Designer',
    date: 'Oct 25, 2:00 PM',
    panelExtra: 0,
    status: 'SCHEDULED',
    statusColor: '#94a3b8',
    action: null,
  },
];

export const skillScores = [
  { id: 'communication', label: 'Communication', score: 4.8, maxScore: 5, stars: 4 },
  { id: 'technical', label: 'Technical Skills', score: 4.5, maxScore: 5, stars: 4 },
  { id: 'leadership', label: 'Leadership', score: 4.2, maxScore: 5, stars: 4 },
  { id: 'problem', label: 'Problem Solving', score: 4.9, maxScore: 5, stars: 5 },
  { id: 'cultural', label: 'Cultural Fit', score: 4.7, maxScore: 5, stars: 4 },
];

export const featuredCandidate = {
  id: 88421,
  initials: 'MV',
  color: '#1e293b',
  name: 'Marcus Vane',
  role: 'Lead Product Designer Applicant',
  overallScore: 8.9,
  categoryScores: [
    { label: 'Visual Design Proficiency', score: 9.2 },
    { label: 'Systems Thinking', score: 8.5 },
    { label: 'User Research Knowledge', score: 7.8 },
    { label: 'Stakeholder Management', score: 8.8 },
  ],
  aiInsights: {
    summary: 'Marcus demonstrates exceptional visual design depth and systems-level thinking. His portfolio shows a high degree of maturity in handling complex enterprise-grade design systems.',
    strengths: ['Scalable architecture expertise', 'Strong data visualization focus'],
    areasForProbing: 'Consider asking about his specific contribution to user research methodologies in his previous Lead role.',
    marketFitConfidence: 98,
  },
};
