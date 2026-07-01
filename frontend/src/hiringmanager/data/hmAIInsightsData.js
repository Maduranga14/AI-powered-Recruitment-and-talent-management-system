export const insightStats = [
  {
    id: 'accuracy',
    label: 'Talent Match Accuracy',
    value: '94.8%',
    trend: '+4.2%',
    trendUp: true,
    color: '#14b8a6',
  },
  {
    id: 'retention',
    label: 'Predicted Retention',
    value: '87.0%',
    trend: '+12%',
    trendUp: true,
    color: '#3b82f6',
  },
  {
    id: 'velocity',
    label: 'Hiring Velocity Improv.',
    value: '22.4%',
    trend: '-8 Days',
    trendUp: true,
    color: '#8b5cf6',
  },
  {
    id: 'dei',
    label: 'D&I Impact Score',
    value: '7.8/10',
    trend: 'Neutral',
    trendUp: null,
    color: '#f97316',
  },
];

export const talentMatches = [
  {
    id: 1,
    initials: 'SR',
    color: '#14b8a6',
    name: 'Sofia Ramirez',
    tags: ['SENIOR LEAD', 'REACT ARCHITECTURE'],
    confidence: 98,
    status: 'MATCHED',
  },
  {
    id: 2,
    initials: 'KT',
    color: '#3b82f6',
    name: 'Kenji Tanaka',
    tags: ['SALES DESIGN', 'UX STRATEGY'],
    confidence: 94,
    status: 'MATCHED',
  },
  {
    id: 3,
    initials: 'AO',
    color: '#8b5cf6',
    name: 'Dr. Amara Okoro',
    tags: ['NLP SPECIALIST', 'PHD RESEARCH'],
    confidence: 91,
    status: 'MATCHED',
  },
];

export const sourcingPerformance = [
  { source: 'LinkedIn Direct', matchAvg: 8.4, percentage: 70, color: '#3b82f6' },
  { source: 'Internal Referral', matchAvg: 9.1, percentage: 85, color: '#14b8a6' },
  { source: 'GitHub Outreach', matchAvg: 7.2, percentage: 55, color: '#8b5cf6' },
];

export const successProbabilityBars = [
  { label: '', height: 30 },
  { label: '', height: 45 },
  { label: '', height: 55 },
  { label: '', height: 40 },
  { label: '', height: 60 },
  { label: '', height: 50 },
  { label: 'PREDICTED', height: 90, highlight: true },
];

export const aiInterviewPrep = {
  candidate: 'Sofia Ramirez (Final Stage)',
  focusArea: {
    title: 'CORE FOCUS AREA',
    content: "Assess 'Architectural Trade-offs'. Analysis suggests she prioritizes scalability over rapid deployment.",
  },
  suggestedQuestion: {
    title: 'SUGGESTED QUESTION',
    content: '"Can you describe a situation where you had to refactor a mission-critical component while it was under high load? What were the risk metrics?"',
  },
  skillGapProbe: {
    title: 'SKILL GAP PROBE',
    content: "Verify experience with Kubernetes orchestration. Her profile mentions 'Container Management' but lacks specific scaling logs.",
  },
};

export const aiUsage = { label: 'AI USAGE', sublabel: 'Queries', percentage: 84 };
