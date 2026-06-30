export const jobStats = [
  {
    label: 'Total Active Jobs', value: '24',
    trend: '+2 this week', trendColor: '#2563EB',
    iconBg: '#f1f5f9', iconColor: '#64748b', iconType: 'briefcase',
  },
  {
    label: 'New Applications', value: '186',
    trend: '14 New', trendColor: '#2563EB',
    iconBg: '#dbeafe', iconColor: '#2563EB', iconType: 'people',
  },
  {
    label: 'Jobs Closing Soon', value: '5',
    trend: 'Next: Friday', trendColor: '#ef4444',
    iconBg: '#fee2e2', iconColor: '#ef4444', iconType: 'alarm',
  },
  {
    label: 'Avg. Time to Fill', value: '18 Days',
    trend: '-3 days avg.', trendColor: '#10b981',
    iconBg: '#ccfbf1', iconColor: '#0d9488', iconType: 'calendar',
  },
];

export const jobs = [
  {
    id: 1, title: 'Senior Product Designer', jobId: '#DES-2024-001',
    department: 'Design', datePosted: 'Oct 12, 2023',
    applications: 45, avatarColors: ['#6366f1', '#ec4899', '#10b981'],
    extraCount: 42, status: 'Active',
  },
  {
    id: 2, title: 'Backend Engineer (Node.js)', jobId: '#ENG-2024-042',
    department: 'Engineering', datePosted: 'Nov 05, 2023',
    applications: 15, avatarColors: ['#3b82f6', '#f59e0b'],
    extraCount: 12, status: 'Active',
  },
  {
    id: 3, title: 'Marketing Manager', jobId: '#MKT-2024-015',
    department: 'Marketing', datePosted: 'Oct 28, 2023',
    applications: 11, avatarColors: ['#8b5cf6'],
    extraCount: 8, status: 'Draft',
  },
  {
    id: 4, title: 'Customer Success Lead', jobId: '#OPS-2023-089',
    department: 'Sales & Ops', datePosted: 'Sep 15, 2023',
    applications: 65, avatarColors: [],
    extraCount: 65, status: 'Closed',
  },
];
