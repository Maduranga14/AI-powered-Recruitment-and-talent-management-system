// ─── Dashboard Stats ───────────────────────────────────────────────
export const dashboardStats = [
  {
    id: 'active-users',
    label: 'Active Users',
    value: '12.8k',
    badge: '+12%',
    badgeType: 'up',
    icon: 'users',
    color: 'blue',
  },
  {
    id: 'server-health',
    label: 'Server Health',
    value: '99.9%',
    badge: 'OPTIMAL',
    badgeType: 'optimal',
    icon: 'server',
    color: 'green',
  },
  {
    id: 'api-calls',
    label: 'API Calls',
    value: '4.2M',
    badge: 'Last 24h',
    badgeType: 'info',
    icon: 'api',
    color: 'teal',
  },
  {
    id: 'security-alerts',
    label: 'Security Alerts',
    value: '0',
    badge: 'Stable',
    badgeType: 'stable',
    icon: 'shield',
    color: 'red',
  },
];

export const hiringFunnelData = {
  weekly: [
    { day: 'Mon', applications: 320, interviews: 140 },
    { day: 'Tue', applications: 280, interviews: 110 },
    { day: 'Wed', applications: 390, interviews: 160 },
    { day: 'Thu', applications: 350, interviews: 145 },
    { day: 'Fri', applications: 470, interviews: 210 },
    { day: 'Sat', applications: 90, interviews: 30 },
    { day: 'Sun', applications: 60, interviews: 20 },
  ],
  daily: [
    { day: '6am', applications: 40, interviews: 10 },
    { day: '9am', applications: 120, interviews: 50 },
    { day: '12pm', applications: 210, interviews: 90 },
    { day: '3pm', applications: 180, interviews: 80 },
    { day: '6pm', applications: 95, interviews: 40 },
    { day: '9pm', applications: 30, interviews: 10 },
  ],
};

export const orgSummary = {
  activeDepartments: 24,
  totalEmployees: 1402,
  distribution: [
    { dept: 'Engineering', pct: 42, color: '#1e3a5f' },
    { dept: 'Sales & Marketing', pct: 28, color: '#2563EB' },
    { dept: 'Product', pct: 15, color: '#0ea5e9' },
  ],
};

export const recentAdminActivity = [
  {
    id: 1,
    initials: 'SR',
    name: 'Sarah Roberts',
    sub: 'Admin ID: #9921',
    action: 'Updated Role Permission',
    module: 'SECURITY',
    timestamp: 'Oct 24, 14:22:10',
    status: 'Success',
  },
  {
    id: 2,
    initials: 'MW',
    name: 'Marcus Wong',
    sub: 'Admin ID: #8842',
    action: 'Modified User Profile',
    module: 'USERS',
    timestamp: 'Oct 24, 13:45:02',
    status: 'Success',
  },
  {
    id: 3,
    initials: 'SYS',
    name: 'System Automation',
    sub: 'Node: AWS-USE-1',
    action: 'Monthly Data Rotation',
    module: 'DATABASE',
    timestamp: 'Oct 24, 12:00:00',
    status: 'Success',
  },
  {
    id: 4,
    initials: 'JD',
    name: 'Janet Doe',
    sub: 'Admin ID: #9011',
    action: 'Failed Login Attempt',
    module: 'AUTH',
    timestamp: 'Oct 24, 11:32:15',
    status: 'Failed',
  },
];

// ─── User Management ────────────────────────────────────────────────
export const userStats = [
  { id: 'total-users', label: 'Total Users', value: '1,284', badge: 'Active', icon: 'users2' },
  { id: 'admins', label: 'Administrators', value: '12', icon: 'admin' },
  { id: 'engagement', label: 'Engagement Rate', value: '86%', icon: 'shield2' },
];

export const userDirectory = [
  { id: 1, initials: 'JD', name: 'Jane Doe', email: 'jane.doe@talentai.io', role: 'Admin', status: 'Active', lastLogin: '2024-05-24  09:12 AM', color: '#2563EB' },
  { id: 2, initials: 'MB', name: 'Marcus Bennett', email: 'm.bennett@talentai.io', role: 'Recruiter', status: 'Active', lastLogin: '2024-05-23  14:45 PM', color: '#7c3aed' },
  { id: 3, initials: 'SL', name: 'Sarah Lansing', email: 's.lansing@talentai.io', role: 'Hiring Manager', status: 'Active', lastLogin: '2024-05-20  11:30 AM', color: '#0d9488' },
  { id: 4, initials: 'KO', name: "Kevin O'Connell", email: 'k.oconnell@talentai.io', role: 'Interviewer', status: 'Inactive', lastLogin: '2024-03-12  16:00 AM', color: '#94a3b8' },
  { id: 5, initials: 'PR', name: 'Priya Ramesh', email: 'p.ramesh@talentai.io', role: 'Recruiter', status: 'Active', lastLogin: '2024-05-22  10:15 AM', color: '#ea580c' },
  { id: 6, initials: 'TN', name: 'Thomas Nguyen', email: 't.nguyen@talentai.io', role: 'Admin', status: 'Active', lastLogin: '2024-05-24  08:55 AM', color: '#2563EB' },
];

// ─── Roles & Permissions ────────────────────────────────────────────
export const roles = [
  {
    id: 'global-admin',
    icon: 'admin',
    name: 'Global Admin',
    description: 'Unrestricted access to all modules and system settings.',
    tags: ['Manage Users', 'Billing', 'AI Config', '+12 more'],
    isDefault: true,
  },
  {
    id: 'dept-head',
    icon: 'dept',
    name: 'Department Head',
    description: 'Manage departmental hiring pipelines and view team analytics.',
    tags: ['Hiring', 'Analytics', 'Feedback'],
    isDefault: false,
  },
  {
    id: 'senior-recruiter',
    icon: 'recruiter',
    name: 'Senior Recruiter',
    description: 'Execute searches, manage candidates, and schedule interviews.',
    tags: ['Candidate Sourcing', 'Interviews'],
    isDefault: false,
  },
  {
    id: 'interviewer',
    icon: 'interviewer',
    name: 'Interviewer',
    description: 'Access candidate profiles and submit structured feedback.',
    tags: ['Feedback', 'Candidate Profiles'],
    isDefault: false,
  },
  {
    id: 'hr-analyst',
    icon: 'analyst',
    name: 'HR Analyst',
    description: 'View and export analytics reports across all departments.',
    tags: ['Analytics', 'Reports'],
    isDefault: false,
  },
];

export const rolePermissions = {
  aiInsights: [
    { id: 'candidate-scoring', label: 'Candidate Scoring', desc: 'Allow AI to generate match scores based on job descriptions.', enabled: true },
    { id: 'predictive-retention', label: 'Predictive Retention Analytics', desc: 'Access AI-driven forecasting for long-term candidate retention.', enabled: true },
  ],
  systemManagement: [
    { id: 'user-lifecycle', label: 'User Lifecycle Management', desc: 'Create, suspend, and delete user accounts.', enabled: true },
    { id: 'billing', label: 'Billing & Subscription', desc: 'Manage payment methods and upgrade plans.', enabled: true },
    { id: 'audit-log', label: 'Audit Log Access', desc: 'View historical logs of all system activities.', enabled: true },
  ],
  recruitmentOps: [
    { id: 'job-postings', label: 'Job Postings', view: true, edit: true, delete: true },
    { id: 'candidate-profiles', label: 'Candidate Profiles', view: true, edit: true, delete: true },
    { id: 'interview-schedules', label: 'Interview Schedules', view: true, edit: true, delete: false },
  ],
};

// ─── Recruitment Analytics ──────────────────────────────────────────
export const analyticsKPIs = [
  { id: 'time-to-hire', label: 'TIME TO HIRE', value: '18.4', unit: 'days', trend: '-12%', trendUp: false },
  { id: 'cost-per-hire', label: 'COST PER HIRE', value: '$3,240', unit: '', trend: '-4.5%', trendUp: false },
  { id: 'offer-acceptance', label: 'OFFER ACCEPTANCE', value: '92.5', unit: '%', trend: '+2.1%', trendUp: true },
  { id: 'sourcing-quality', label: 'SOURCING QUALITY', value: '8.2', unit: '/ 10', trend: '— Flat', trendUp: null },
];

export const hiringPipeline = [
  { stage: 'SOURCED', count: 4200, cr: null, color: '#1e3a5f' },
  { stage: 'APPLIED', count: 2850, cr: '67.8% CR', color: '#374151' },
  { stage: 'SCREENED', count: 980, cr: '34.3% CR', color: '#2563EB' },
  { stage: 'INTERVIEWED', count: 420, cr: '42.8% CR', color: '#0284c7' },
  { stage: 'HIRED', count: 124, cr: '29.5% CR', color: '#0d9488' },
];

export const deptPerformance = [
  { dept: 'Engineering', roles: 42, pct: 88 },
  { dept: 'Product Design', roles: 18, pct: 60 },
  { dept: 'Sales & Marketing', roles: 24, pct: 75 },
  { dept: 'Operations', roles: 12, pct: 35 },
];

export const sourcingROI = [
  { icon: 'linkedin', channel: 'LinkedIn Recruiter', qualScore: 8.8, convRate: '12.4%', costPerHire: '$4,800' },
  { icon: 'referral', channel: 'Employee Referrals', qualScore: 9.4, convRate: '28.6%', costPerHire: '$1,200' },
  { icon: 'indeed', channel: 'Indeed Organic', qualScore: 6.2, convRate: '4.2%', costPerHire: '$0' },
];

// ─── Organization & Departments ─────────────────────────────────────
export const corporateStructure = {
  name: 'TalentAI Global Holding',
  sub: 'Principal Entity • NYC HQ',
  children: [
    { id: 'eng', icon: 'code', name: 'Engineering Division', sub: 'Global Dev & DevOps', headcount: 142 },
    { id: 'sales', icon: 'dollar', name: 'Sales & Marketing', sub: 'Growth & Partnerships', headcount: 88 },
    { id: 'ops', icon: 'grid', name: 'Operations', sub: 'Logistics & HR', headcount: 34 },
  ],
};

export const departments = [
  { id: 'eng-dept', badge: 'HIGH VOLUME', badgeColor: '#f59e0b', name: 'Engineering', head: 'Sarah Jenkins', headInitials: 'SJ', headColor: '#2563EB', headcount: 142, activeRoles: 18 },
  { id: 'sales-dept', badge: 'GROWTH', badgeColor: '#0d9488', name: 'Sales & Marketing', head: 'Marcus Vane', headInitials: 'MV', headColor: '#7c3aed', headcount: 88, activeRoles: 7 },
  { id: 'product-dept', badge: 'STRATEGIC', badgeColor: '#64748b', name: 'Product Management', head: 'Elena Rodriguez', headInitials: 'ER', headColor: '#ea580c', headcount: 26, activeRoles: 4 },
];

export const globalPolicies = [
  { id: 'resume-filtering', label: 'Resume Filtering', desc: 'Automatically score and rank candidates based on semantic job description mapping.', enabled: true },
  { id: 'standard-interview', label: 'Standard Interview', desc: 'Enforce a 4-stage interview process across all entry-level and mid-tier roles.', enabled: false },
  { id: 'diversity-bias-shield', label: 'Diversity Bias Shield', desc: 'Mask name, gender, and ethnicity details in early screening stages to ensure fair review.', enabled: true },
];
