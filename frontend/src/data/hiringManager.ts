export type ManagerDecisionStatus =
'Awaiting feedback' |
'Feedback submitted' |
'Decision shared';

export type ManagerRecommendation = 'Strong Yes' | 'Yes' | 'Maybe' | 'No' | 'Strong No';

export interface ExperienceEntry {
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
}

export interface ManagerCandidate {
  id: string;
  name: string;
  title: string;
  location: string;
  avatar: string;
  role: string;
  decisionStatus: ManagerDecisionStatus;
  matchScore: number;
  skills: string[];
  experiences: ExperienceEntry[];
  educations: EducationEntry[];
  experience: string;
  applied: string;
  summary: string;
  signals: string[];
  interviewFocus: string;
  interviewTime?: string;
  recommendation?: ManagerRecommendation;
  evidence?: string;
  applicationId?: string;
  overallRating?: number;
  skillRatings?: string;
  email?: string;
  status?: string;
  departmentName?: string;
  appliedAt?: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface ManagerInterview {
  id: string;
  candidateId: string;
  candidate: string;
  role: string;
  time: string;
  duration: string;
  format: string;
  focus: string;
  avatar: string;
  meetingLink?: string | null;
  scheduledAt?: string;
  rescheduleRequested?: boolean;
  rescheduleReason?: string | null;
  feedbackSubmitted?: boolean;
}

export interface ManagerRole {
  id: string;
  title: string;
  team: string;
  openSeats: number;
  awaitingDecisions: number;
  stage: string;
}

const avatar = (name: string, background: string) =>
`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=fff&bold=true&size=128&format=png`;

export const MANAGER_CANDIDATES: ManagerCandidate[] = [
{
  id: 'manager-candidate-1',
  name: 'Maya Chen',
  title: 'Senior Frontend Engineer',
  location: 'San Francisco, CA',
  avatar: avatar('Maya Chen', '0d9488'),
  role: 'Senior Frontend Engineer',
  decisionStatus: 'Awaiting feedback',
  matchScore: 96,
  skills: ['React', 'TypeScript', 'GraphQL', 'Accessibility'],
  experiences: [],
  educations: [],
  experience: '6 years · Staff Engineer at Radian',
  applied: 'Applied today',
  summary:
  'Product-minded frontend engineer who has led component-platform migrations and shipped analytics experiences for enterprise teams.',
  signals: [
  'Led a design-system migration across four product teams',
  'Strong evidence of frontend architecture and mentorship',
  'Clear ownership of performance and accessibility outcomes'],

  interviewFocus:
  'Probe for API collaboration, technical tradeoffs, and leading through ambiguity.',
  interviewTime: 'Today · 2:00 PM'
},
{
  id: 'manager-candidate-2',
  name: 'Jordan Williams',
  title: 'Product Designer',
  location: 'Brooklyn, NY',
  avatar: avatar('Jordan Williams', '4f46e5'),
  role: 'Product Designer',
  decisionStatus: 'Awaiting feedback',
  matchScore: 92,
  skills: ['Figma', 'Research', 'Prototyping', 'Design Systems'],
  experiences: [],
  educations: [],
  experience: '5 years · Lead Product Designer at Fieldwork',
  applied: 'Applied yesterday',
  summary:
  'End-to-end product designer with deep B2B workflow experience, inclusive research practice, and a systems-first craft approach.',
  signals: [
  'Portfolio shows repeated simplification of complex workflow tools',
  'Research depth exceeds the role baseline',
  'Has partnered closely with engineering on scalable patterns'],

  interviewFocus:
  'Explore how they turn research into product direction and work through tradeoffs with engineering.',
  interviewTime: 'Today · 10:30 AM'
},
{
  id: 'manager-candidate-3',
  name: 'Aarav Patel',
  title: 'Machine Learning Engineer',
  location: 'New York, NY',
  avatar: avatar('Aarav Patel', '7c3aed'),
  role: 'Machine Learning Engineer',
  decisionStatus: 'Feedback submitted',
  matchScore: 89,
  skills: ['Python', 'PyTorch', 'MLOps', 'LLMs'],
  experiences: [],
  educations: [],
  experience: '5 years · ML Engineer at SignalPath',
  applied: 'Applied 2 days ago',
  summary:
  'Applied ML engineer specializing in production recommendation systems and pragmatic generative AI deployments.',
  signals: [
  'Direct production LLM and inference optimization experience',
  'Strong applied ML fundamentals',
  'Collaboration scope needs validation in the next round'],

  interviewFocus:
  'Validate large-team collaboration and ownership of model deployment operations.',
  recommendation: 'Advance',
  evidence:
  'Demonstrated excellent command of model evaluation and deployment tradeoffs; recommend a technical panel to validate collaboration depth.'
},
{
  id: 'manager-candidate-4',
  name: 'Noah Kim',
  title: 'Backend Engineer',
  location: 'Seattle, WA',
  avatar: avatar('Noah Kim', '2563eb'),
  role: 'Backend Engineer (Go)',
  decisionStatus: 'Decision shared',
  matchScore: 85,
  skills: ['Go', 'PostgreSQL', 'Kubernetes', 'AWS'],
  experiences: [],
  educations: [],
  experience: '5 years · Platform Engineer at Finch',
  applied: 'Applied 3 days ago',
  summary:
  'Backend engineer building reliable developer infrastructure, service APIs, and observability foundations.',
  signals: [
  'Direct Go and distributed systems background',
  'Strong reliability ownership',
  'Best fit for the platform-heavy scope of this role'],

  interviewFocus:
  'Discuss operational ownership and how they prioritize resilience against product delivery.',
  recommendation: 'Hold',
  evidence:
  'Solid technical profile. The team is comparing the final interview panel before committing to the next step.'
}];



export const MANAGER_INTERVIEWS: ManagerInterview[] = [
{
  id: 'manager-interview-1',
  candidateId: 'manager-candidate-2',
  candidate: 'Jordan Williams',
  role: 'Product Designer',
  time: 'Today · 10:30 AM',
  duration: '45 min',
  format: 'Video call',
  focus: 'Portfolio walkthrough · Research judgment',
  avatar: avatar('Jordan Williams', '4f46e5')
},
{
  id: 'manager-interview-2',
  candidateId: 'manager-candidate-1',
  candidate: 'Maya Chen',
  role: 'Senior Frontend Engineer',
  time: 'Today · 2:00 PM',
  duration: '60 min',
  format: 'Video call',
  focus: 'Architecture · Team leadership',
  avatar: avatar('Maya Chen', '0d9488')
},
{
  id: 'manager-interview-3',
  candidateId: 'manager-candidate-3',
  candidate: 'Aarav Patel',
  role: 'Machine Learning Engineer',
  time: 'Thursday · 11:30 AM',
  duration: '45 min',
  format: 'Video call',
  focus: 'Production ML · Collaboration',
  avatar: avatar('Aarav Patel', '7c3aed')
}];


export const MANAGER_ROLES: ManagerRole[] = [
{
  id: 'manager-role-1',
  title: 'Senior Frontend Engineer',
  team: 'Product Engineering',
  openSeats: 2,
  awaitingDecisions: 1,
  stage: 'Interview loop'
},
{
  id: 'manager-role-2',
  title: 'Product Designer',
  team: 'Design',
  openSeats: 1,
  awaitingDecisions: 1,
  stage: 'Hiring manager'
},
{
  id: 'manager-role-3',
  title: 'Machine Learning Engineer',
  team: 'Data & AI',
  openSeats: 1,
  awaitingDecisions: 0,
  stage: 'Panel review'
}];


export const DECISION_TONES: Record<
  ManagerDecisionStatus,
  'amber' | 'brand' | 'green'> =
{
  'Awaiting feedback': 'amber',
  'Feedback submitted': 'brand',
  'Decision shared': 'green'
};