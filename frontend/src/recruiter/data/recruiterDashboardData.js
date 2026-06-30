export const dashboardStats = [
  {
    id: 'jobs', label: 'ACTIVE JOBS', value: '12',
    trend: '+2 this week', trendColor: '#2563EB',
    iconBg: '#dbeafe', iconColor: '#2563EB', iconType: 'briefcase',
  },
  {
    id: 'applications', label: 'TOTAL APPLICATIONS', value: '450',
    trend: 'High Vol', trendColor: '#10b981',
    iconBg: '#ede9fe', iconColor: '#7c3aed', iconType: 'people',
  },
  {
    id: 'interviews', label: 'INTERVIEWS TODAY', value: '8',
    trend: 'Busy Day', trendColor: '#06b6d4',
    iconBg: '#ccfbf1', iconColor: '#0d9488', iconType: 'calendar',
  },
  {
    id: 'timetohire', label: 'TIME TO HIRE', value: '18d',
    trend: '↓ 3 days', trendColor: '#10b981',
    iconBg: '#dcfce7', iconColor: '#16a34a', iconType: 'clock',
  },
];

export const pipeline = [
  { stage: 'Applied', count: 88, color: '#e2e8f0' },
  { stage: 'Shortlisted', count: 42, color: '#cbd5e1' },
  { stage: 'Interviewed', count: 12, color: '#94a3b8' },
  { stage: 'Hired', count: 35, color: '#0f172a' },
];

export const aiTopMatches = [
  { id: 1, name: 'David Chen', role: 'Sr. React Developer', initials: 'DC', color: '#6366f1' },
  { id: 2, name: 'Aria Smith', role: 'Lead Product Designer', initials: 'AS', color: '#ec4899' },
];

export const recentApplications = [
  { id: 1, name: 'Lucas Miller', location: 'London, UK', role: 'Product Manager', appliedAgo: '2 hrs ago', aiScore: 84, initials: 'LM', color: '#8b5cf6' },
  { id: 2, name: 'Sarah Kim', location: 'Seoul, KR', role: 'Frontend Engineer', appliedAgo: '5 hrs ago', aiScore: 92, initials: 'SK', color: '#10b981' },
  { id: 3, name: 'Robert James', location: 'Austin, US', role: 'Data Scientist', appliedAgo: 'Yesterday', aiScore: 61, initials: 'RJ', color: '#f59e0b' },
];

export const todaySchedule = [
  { id: 1, time: '10:30', name: 'Michael Scott', role: 'UX Research Interview', hasJoin: true },
  { id: 2, time: '14:00', name: 'Dwight Schrute', role: 'Sales Manager (Final)', hasJoin: true },
  { id: 3, time: '16:30', name: 'Jim Halpert', role: 'Marketing Lead', hasJoin: false },
];

export const recentJobPostings = [
  { id: 1, title: 'Senior Product Designer', dept: 'Design', location: 'Remote', postedAgo: '2h ago', status: 'ACTIVE' },
  { id: 2, title: 'Frontend Engineer', dept: 'Engineering', location: 'NY', postedAgo: '5h ago', status: 'URGENT' },
  { id: 3, title: 'Marketing Manager', dept: 'Growth', location: 'London', postedAgo: 'Yesterday', status: 'ACTIVE' },
  { id: 4, title: 'Data Scientist', dept: 'AI', location: 'SF', postedAgo: '3 days ago', status: 'PAUSED' },
];
