export const reportStats = [
  {
    label: 'Total Applications', value: '1,284',
    trend: '+15%', trendColor: '#10b981',
    subtitle: 'vs last month',
    iconBg: '#dbeafe', iconColor: '#2563EB', iconType: 'doc',
  },
  {
    label: 'Interviews Conducted', value: '412',
    trend: '+8%', trendColor: '#10b981',
    subtitle: 'vs last month',
    iconBg: '#fef3c7', iconColor: '#d97706', iconType: 'calendar',
  },
  {
    label: 'Successful Hires', value: '124',
    trend: '+12%', trendColor: '#10b981',
    subtitle: 'vs last year',
    iconBg: '#dcfce7', iconColor: '#16a34a', iconType: 'people',
  },
  {
    label: 'Hiring Success Rate', value: '92%',
    trend: 'Target: 90%', trendColor: '#64748b',
    iconBg: '#ccfbf1', iconColor: '#0d9488', iconType: 'check',
    progress: 92,
  },
];

// Normalized 0-100 data for 6 months JAN-JUN
export const volumeTrendData = {
  thisYear: [18, 28, 70, 100, 82, 68],
  lastYear: [10, 16, 38, 65, 55, 44],
  labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'],
};

export const departmentPipeline = [
  { dept: 'Engineering', hired: 42, total: 50 },
  { dept: 'Design', hired: 12, total: 15 },
  { dept: 'Marketing', hired: 8, total: 20 },
  { dept: 'Sales', hired: 28, total: 35 },
];

export const topPerformingJobs = [
  {
    id: 1, title: 'Senior Backend Eng.',
    dept: 'Engineering', location: 'San Francisco',
    apps: 842, matchQuality: 94, status: 'ACTIVE',
  },
  {
    id: 2, title: 'Lead Product Designer',
    dept: 'Design', location: 'Remote',
    apps: 513, matchQuality: 88, status: 'ACTIVE',
  },
  {
    id: 3, title: 'Account Executive',
    dept: 'Sales', location: 'New York',
    apps: '1.2k', matchQuality: 72, status: 'DRAFT',
  },
];
