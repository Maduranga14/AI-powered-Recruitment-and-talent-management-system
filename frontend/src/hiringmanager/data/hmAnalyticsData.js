export const analyticsStats = [
  {
    id: 'total',
    label: 'TOTAL CANDIDATES',
    value: '1,284',
    trend: '+12% vs last month',
    trendUp: true,
    icon: 'people',
    iconBg: '#f0f9ff',
    iconColor: '#0ea5e9',
  },
  {
    id: 'success',
    label: 'HIRING SUCCESS RATE',
    value: '74.2%',
    trend: '98% Target',
    trendUp: null,
    badge: true,
    icon: 'check-circle',
    iconBg: '#f0fdf4',
    iconColor: '#22c55e',
  },
];

export const pipelineFunnel = [
  { stage: 'Applied', count: 1284, percentage: 100, color: '#1e293b' },
  { stage: 'Screening', count: 858, percentage: 75, color: '#334155' },
  { stage: 'Interview', count: 573, percentage: 49, color: '#475569' },
  { stage: 'Offer In', count: null, percentage: 28, color: '#64748b' },
  { stage: 'Hired', count: null, percentage: 12, color: '#94a3b8' },
];

export const aiQualityTrend = [
  { week: 'WK 1', high: 40, baseline: 30 },
  { week: 'WK 2', high: 55, baseline: 35 },
  { week: 'WK 3', high: 45, baseline: 30 },
  { week: 'WK 4', high: 70, baseline: 40 },
  { week: 'WK 5', high: 80, baseline: 45 },
  { week: 'WK 6', high: 75, baseline: 40 },
  { week: 'CURRENT', high: 95, baseline: 50 },
];

export const departmentDistribution = [
  { label: 'Engineering', percentage: 40, color: '#14b8a6' },
  { label: 'Design', percentage: 25, color: '#3b82f6' },
  { label: 'Marketing', percentage: 20, color: '#8b5cf6' },
  { label: 'Sales', percentage: 15, color: '#f97316' },
];

export const decisionCandidates = [
  {
    id: 1,
    initials: 'SC',
    color: '#14b8a6',
    name: 'Sarah Chen',
    role: 'Senior Content Eng.',
    level: 'L4 LEVEL',
    aiMatch: 98,
    type: 'ai-recommendation',
    note: 'Excellent architectural background. Strong culture fit based on past 3 interviews. Recommend immediate offer.',
    pipeline: 140,
    interviews: '4/4',
    action: 'Approve Offer',
    actionStyle: 'primary',
  },
  {
    id: 2,
    initials: 'MM',
    color: '#3b82f6',
    name: 'Marcus Miller',
    role: 'Senior Product Designer',
    level: 'DESIGN SYSTEM',
    aiMatch: 84,
    type: 'manager-note',
    note: 'Portfolio is stellar, but salary expectations are 15% above current budget. Needs compensation review.',
    pipeline: 90,
    interviews: '3/4',
    action: 'Request Review',
    actionStyle: 'outline',
  },
  {
    id: 3,
    initials: 'ER',
    color: '#ef4444',
    name: 'Elena Rodriguez',
    role: 'Marketing Director',
    level: 'URGENT HIRE',
    aiMatch: 62,
    type: 'ai-warning',
    note: 'Low score in data analytics assessment. Past roles show high turnover in first year. Potential mismatch.',
    pipeline: 220,
    interviews: '3/4',
    action: 'Reject',
    actionStyle: 'danger',
  },
];
