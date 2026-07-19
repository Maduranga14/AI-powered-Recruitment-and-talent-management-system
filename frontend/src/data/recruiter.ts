export type RecruiterStage =
'New' |
'Screening' |
'Shortlisted' |
'Reviewed' |
'Interview' |
'Offer' |
'Rejected';

export interface RecruiterCandidate {
  id: string;
  name: string;
  title: string;
  location: string;
  avatar: string;
  role: string;
  stage: RecruiterStage;
  matchScore: number;
  skills: string[];
  experience: string;
  applied: string;
  rationale: string;
  summary: string;
  notes: string;
  email: string;
  /** Present when loaded from a real job application */
  applicationId?: string;
  jobId?: string;
  resumeUrl?: string | null;
  candidateProfileId?: string;
  recommendation?: string | null;
  feedback?: string | null;
  overallRating?: number | null;
  skillRatings?: string | null;
}

export interface RecruiterJob {
  id: string;
  title: string;
  team: string;
  location: string;
  status: 'Active' | 'Paused';
  applicants: number;
  screened: number;
  shortlisted: number;
  interviews: number;
  target: number;
  posted: string;
}

export interface RecruiterInterview {
  id: string;
  candidateId: string;
  candidate: string;
  role: string;
  time: string;
  duration: string;
  interviewer: string;
  type: string;
  avatar: string;
}

export interface RecruiterMessage {
  id: string;
  sender: string;
  initials: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  tone: 'brand' | 'accent' | 'amber' | 'blue';
}

const avatar = (name: string, bg: string) =>
`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&bold=true&size=128&format=png`;

export const RECRUITER_CANDIDATES: RecruiterCandidate[] = [
{
  id: 'candidate-1',
  name: 'Maya Chen',
  title: 'Senior Frontend Engineer',
  location: 'San Francisco, CA',
  avatar: avatar('Maya Chen', '0d9488'),
  role: 'Senior Frontend Engineer',
  stage: 'Shortlisted',
  matchScore: 96,
  skills: ['React', 'TypeScript', 'GraphQL', 'Accessibility'],
  experience: '6 years · Current: Staff Engineer at Radian',
  applied: 'Today',
  rationale:
  'Exceptional overlap across React architecture, TypeScript, and design-system work. Evidence of mentoring and performance ownership aligns with the role’s senior scope.',
  summary:
  'Product-minded frontend engineer who has led component-platform migrations and shipped analytics experiences used by enterprise teams.',
  notes:
  'Strong portfolio. Ask about API collaboration and leading through ambiguity.',
  email: 'maya.chen@example.com'
},
{
  id: 'candidate-2',
  name: 'Jordan Williams',
  title: 'Product Designer',
  location: 'Brooklyn, NY',
  avatar: avatar('Jordan Williams', '4f46e5'),
  role: 'Product Designer',
  stage: 'Interview',
  matchScore: 92,
  skills: ['Figma', 'Research', 'Prototyping', 'Design Systems'],
  experience: '5 years · Current: Lead Product Designer at Fieldwork',
  applied: 'Yesterday',
  rationale:
  'Portfolio demonstrates strong systems thinking and repeated success simplifying complex workflows. Research depth is above the role baseline.',
  summary:
  'End-to-end product designer with a focus on B2B workflows, inclusive research, and scalable interface patterns.',
  notes:
  'Hiring manager interview booked for Thursday. Candidate is especially interested in growth-stage product teams.',
  email: 'jordan.williams@example.com'
},
{
  id: 'candidate-3',
  name: 'Aarav Patel',
  title: 'Machine Learning Engineer',
  location: 'New York, NY',
  avatar: avatar('Aarav Patel', '7c3aed'),
  role: 'Machine Learning Engineer',
  stage: 'Screening',
  matchScore: 89,
  skills: ['Python', 'PyTorch', 'MLOps', 'LLMs'],
  experience: '5 years · Current: ML Engineer at SignalPath',
  applied: '2 days ago',
  rationale:
  'Strong applied ML foundation with direct production LLM and inference optimization experience. Limited evidence of large-team collaboration.',
  summary:
  'Applied ML engineer specializing in production recommendation systems and practical generative AI deployments.',
  notes:
  'Confirm onsite preference and hands-on ownership of the model deployment pipeline.',
  email: 'aarav.patel@example.com'
},
{
  id: 'candidate-4',
  name: 'Elena Rossi',
  title: 'Product Manager, Growth',
  location: 'Austin, TX',
  avatar: avatar('Elena Rossi', 'db2777'),
  role: 'Product Manager, Growth',
  stage: 'New',
  matchScore: 87,
  skills: ['Experimentation', 'SQL', 'Activation', 'Roadmaps'],
  experience: '4 years · Current: Growth PM at Orbit',
  applied: '2 days ago',
  rationale:
  'High relevance across growth experimentation and metric ownership. Resume suggests meaningful activation wins in a comparable product motion.',
  summary:
  'Growth product manager who uses qualitative insight and clean measurement to find high-leverage customer moments.',
  notes: 'New application. Share with the growth pod after screen.',
  email: 'elena.rossi@example.com'
},
{
  id: 'candidate-5',
  name: 'Noah Kim',
  title: 'Backend Engineer',
  location: 'Seattle, WA',
  avatar: avatar('Noah Kim', '2563eb'),
  role: 'Backend Engineer (Go)',
  stage: 'Shortlisted',
  matchScore: 85,
  skills: ['Go', 'PostgreSQL', 'Kubernetes', 'AWS'],
  experience: '5 years · Current: Platform Engineer at Finch',
  applied: '3 days ago',
  rationale:
  'Direct Go and distributed systems background with compelling reliability ownership. Strongest fit for the platform-heavy pieces of this role.',
  summary:
  'Backend engineer building reliable developer infrastructure, service APIs, and observability foundations.',
  notes:
  'Invite to technical interview once headcount confirmation is complete.',
  email: 'noah.kim@example.com'
},
{
  id: 'candidate-6',
  name: 'Sofia Alvarez',
  title: 'Data Analyst',
  location: 'Chicago, IL',
  avatar: avatar('Sofia Alvarez', 'ea580c'),
  role: 'Data Analyst',
  stage: 'Rejected',
  matchScore: 68,
  skills: ['SQL', 'Tableau', 'Excel', 'Statistics'],
  experience: '2 years · Current: Analyst at Northstar',
  applied: '4 days ago',
  rationale:
  'Solid foundational analytics skill set, though experience level and dashboard ownership do not yet meet the role’s current scope.',
  summary:
  'Early-career analyst focused on dashboarding, reporting automation, and business-partner support.',
  notes:
  'Send thoughtful close-out note. Strong candidate for a future junior analyst opening.',
  email: 'sofia.alvarez@example.com'
}];


export const RECRUITER_JOBS: RecruiterJob[] = [
{
  id: 'r-job-1',
  title: 'Senior Frontend Engineer',
  team: 'Product Engineering',
  location: 'San Francisco · Hybrid',
  status: 'Active',
  applicants: 48,
  screened: 24,
  shortlisted: 8,
  interviews: 3,
  target: 2,
  posted: 'Posted 2 days ago'
},
{
  id: 'r-job-2',
  title: 'Product Designer',
  team: 'Design',
  location: 'Remote · US',
  status: 'Active',
  applicants: 72,
  screened: 31,
  shortlisted: 10,
  interviews: 4,
  target: 1,
  posted: 'Posted yesterday'
},
{
  id: 'r-job-3',
  title: 'Machine Learning Engineer',
  team: 'Data & AI',
  location: 'New York · On-site',
  status: 'Active',
  applicants: 35,
  screened: 14,
  shortlisted: 5,
  interviews: 2,
  target: 1,
  posted: 'Posted 4 days ago'
},
{
  id: 'r-job-4',
  title: 'Product Manager, Growth',
  team: 'Growth',
  location: 'Austin · Hybrid',
  status: 'Paused',
  applicants: 91,
  screened: 43,
  shortlisted: 12,
  interviews: 5,
  target: 1,
  posted: 'Posted 6 days ago'
}];


export const RECRUITER_INTERVIEWS: RecruiterInterview[] = [
{
  id: 'interview-1',
  candidateId: 'candidate-2',
  candidate: 'Jordan Williams',
  role: 'Product Designer',
  time: 'Today · 10:30 AM',
  duration: '45 min',
  interviewer: 'Samantha Reed',
  type: 'Hiring manager',
  avatar: avatar('Jordan Williams', '4f46e5')
},
{
  id: 'interview-2',
  candidateId: 'candidate-1',
  candidate: 'Maya Chen',
  role: 'Senior Frontend Engineer',
  time: 'Today · 2:00 PM',
  duration: '60 min',
  interviewer: 'Arjun Mehta',
  type: 'Technical screen',
  avatar: avatar('Maya Chen', '0d9488')
},
{
  id: 'interview-3',
  candidateId: 'candidate-5',
  candidate: 'Noah Kim',
  role: 'Backend Engineer (Go)',
  time: 'Tomorrow · 9:00 AM',
  duration: '45 min',
  interviewer: 'Tomas Lin',
  type: 'Technical interview',
  avatar: avatar('Noah Kim', '2563eb')
},
{
  id: 'interview-4',
  candidateId: 'candidate-3',
  candidate: 'Aarav Patel',
  role: 'Machine Learning Engineer',
  time: 'Thursday · 11:30 AM',
  duration: '30 min',
  interviewer: 'Mina Shah',
  type: 'Recruiter screen',
  avatar: avatar('Aarav Patel', '7c3aed')
}];


export const RECRUITER_MESSAGES: RecruiterMessage[] = [
{
  id: 'message-1',
  sender: 'Maya Chen',
  initials: 'MC',
  subject: 'Re: Senior Frontend Engineer',
  preview:
  'Thanks for reaching out — I would love to learn more about the team and product direction.',
  time: '12m',
  unread: true,
  tone: 'accent'
},
{
  id: 'message-2',
  sender: 'Arjun Mehta',
  initials: 'AM',
  subject: 'Interview feedback: Jordan Williams',
  preview:
  'Strong signal from the portfolio review. I would recommend moving her to the panel.',
  time: '1h',
  unread: true,
  tone: 'brand'
},
{
  id: 'message-3',
  sender: 'Talenta AI',
  initials: 'AI',
  subject: '8 high-fit candidates surfaced',
  preview:
  'New recommendations are ready for the Senior Frontend Engineer search.',
  time: '3h',
  unread: false,
  tone: 'amber'
},
{
  id: 'message-4',
  sender: 'Noah Kim',
  initials: 'NK',
  subject: 'Interview availability',
  preview:
  'I have confirmed the Thursday slot. Looking forward to meeting the team.',
  time: 'Yesterday',
  unread: false,
  tone: 'blue'
}];


export const STAGE_ORDER: RecruiterStage[] = [
'New',
'Screening',
'Shortlisted',
'Reviewed',
'Interview',
'Offer',
'Rejected'];


export const STAGE_TONES: Record<
  RecruiterStage,
  'blue' | 'amber' | 'brand' | 'accent' | 'green' | 'red'> =
{
  New: 'blue',
  Screening: 'amber',
  Shortlisted: 'brand',
  Reviewed: 'green',
  Interview: 'accent',
  Offer: 'green',
  Rejected: 'red'
};