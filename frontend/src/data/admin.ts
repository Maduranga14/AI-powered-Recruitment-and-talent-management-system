export type AdminRole =
'Candidate' |
'Recruiter' |
'Hiring manager' |
'Administrator';
export type AccountStatus = 'Active' | 'Suspended' | 'Invited';
export type OrganizationStatus = 'Healthy' | 'Review' | 'Restricted';
export type ModerationStatus = 'Pending' | 'Approved' | 'Declined';
export type BadgeTone =
'brand' |
'accent' |
'slate' |
'green' |
'amber' |
'red' |
'blue';

export interface AdminPerson {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AccountStatus;
  organization: string;
  joined: string;
  lastActive: string;
  avatar: string;
}

export interface AdminOrganization {
  id: string;
  name: string;
  initials: string;
  plan: 'Scale' | 'Growth' | 'Starter';
  members: number;
  activeJobs: number;
  status: OrganizationStatus;
  owner: string;
  joined: string;
  monthlyUsage: string;
}

export interface ModerationItem {
  id: string;
  type: 'Job listing' | 'Report';
  title: string;
  organization: string;
  submittedBy: string;
  submittedAt: string;
  reason: string;
  detail: string;
  status: ModerationStatus;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  detail: string;
  time: string;
  tone: BadgeTone;
}

const avatar = (name: string, color: string) =>
`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&bold=true&size=96&format=png`;

export const ADMIN_PEOPLE: AdminPerson[] = [
{
  id: 'person-1',
  name: 'Olivia Park',
  email: 'olivia@northwindlabs.com',
  role: 'Recruiter',
  status: 'Active',
  organization: 'Northwind Labs',
  joined: 'Mar 12, 2025',
  lastActive: '4 min ago',
  avatar: avatar('Olivia Park', '4f46e5')
},
{
  id: 'person-2',
  name: 'Samantha Reed',
  email: 'samantha@northwindlabs.com',
  role: 'Hiring manager',
  status: 'Active',
  organization: 'Northwind Labs',
  joined: 'Jan 28, 2025',
  lastActive: '18 min ago',
  avatar: avatar('Samantha Reed', '0d9488')
},
{
  id: 'person-3',
  name: 'Maya Chen',
  email: 'maya.chen@example.com',
  role: 'Candidate',
  status: 'Active',
  organization: 'Independent',
  joined: 'May 10, 2026',
  lastActive: '1 hr ago',
  avatar: avatar('Maya Chen', '2563eb')
},
{
  id: 'person-4',
  name: 'Theo Martin',
  email: 'theo@bloomly.co',
  role: 'Recruiter',
  status: 'Invited',
  organization: 'Bloomly',
  joined: 'May 14, 2026',
  lastActive: 'Invitation pending',
  avatar: avatar('Theo Martin', '7c3aed')
},
{
  id: 'person-5',
  name: 'Priya Nair',
  email: 'priya.nair@example.com',
  role: 'Candidate',
  status: 'Suspended',
  organization: 'Independent',
  joined: 'Apr 30, 2026',
  lastActive: 'May 12, 2026',
  avatar: avatar('Priya Nair', 'db2777')
},
{
  id: 'person-6',
  name: 'Elliot Brooks',
  email: 'elliot@talenta.io',
  role: 'Administrator',
  status: 'Active',
  organization: 'Talenta',
  joined: 'Oct 03, 2024',
  lastActive: 'Now',
  avatar: avatar('Elliot Brooks', '0f766e')
}];


export const ADMIN_ORGANIZATIONS: AdminOrganization[] = [
{
  id: 'org-1',
  name: 'Northwind Labs',
  initials: 'NL',
  plan: 'Scale',
  members: 42,
  activeJobs: 8,
  status: 'Healthy',
  owner: 'Olivia Park',
  joined: 'Aug 2024',
  monthlyUsage: '78% of monthly allowance'
},
{
  id: 'org-2',
  name: 'Bloomly',
  initials: 'B',
  plan: 'Growth',
  members: 18,
  activeJobs: 3,
  status: 'Healthy',
  owner: 'Dylan Ross',
  joined: 'Nov 2024',
  monthlyUsage: '42% of monthly allowance'
},
{
  id: 'org-3',
  name: 'Vantage AI',
  initials: 'VA',
  plan: 'Scale',
  members: 67,
  activeJobs: 12,
  status: 'Review',
  owner: 'Keisha Holt',
  joined: 'Feb 2025',
  monthlyUsage: '91% of monthly allowance'
},
{
  id: 'org-4',
  name: 'Meridian Health',
  initials: 'MH',
  plan: 'Growth',
  members: 24,
  activeJobs: 1,
  status: 'Restricted',
  owner: 'Jon Bell',
  joined: 'Apr 2025',
  monthlyUsage: '12% of monthly allowance'
},
{
  id: 'org-5',
  name: 'Hue & Co',
  initials: 'HC',
  plan: 'Starter',
  members: 6,
  activeJobs: 2,
  status: 'Healthy',
  owner: 'Alina Kumar',
  joined: 'May 2025',
  monthlyUsage: '35% of monthly allowance'
}];


export const ADMIN_MODERATION: ModerationItem[] = [
{
  id: 'mod-1',
  type: 'Job listing',
  title: 'Head of Data Infrastructure',
  organization: 'Vantage AI',
  submittedBy: 'Keisha Holt',
  submittedAt: '12 min ago',
  reason: 'New employer listing',
  detail:
  'Senior leadership role referencing production data systems and a remote-first operating model.',
  status: 'Pending'
},
{
  id: 'mod-2',
  type: 'Report',
  title: 'Listing language review',
  organization: 'Meridian Health',
  submittedBy: 'Jordan Williams',
  submittedAt: '45 min ago',
  reason: 'Candidate report · inclusive language',
  detail:
  'A candidate flagged phrasing in a recently published nursing role for review against platform listing guidelines.',
  status: 'Pending'
},
{
  id: 'mod-3',
  type: 'Job listing',
  title: 'Lifecycle Marketing Manager',
  organization: 'Bloomly',
  submittedBy: 'Dylan Ross',
  submittedAt: '2 hrs ago',
  reason: 'New employer listing',
  detail:
  'Growth marketing role with clear responsibilities, compensation range, and location information.',
  status: 'Pending'
},
{
  id: 'mod-4',
  type: 'Report',
  title: 'Potential duplicate listing',
  organization: 'Northwind Labs',
  submittedBy: 'Maya Chen',
  submittedAt: 'Yesterday',
  reason: 'Candidate report · duplicate',
  detail:
  'A candidate reported two similar engineering listings with overlapping descriptions.',
  status: 'Approved'
}];


export const ADMIN_AUDIT_EVENTS: AuditEvent[] = [
{
  id: 'audit-1',
  actor: 'Elliot Brooks',
  action: 'Approved a job listing',
  detail: 'Lifecycle Marketing Manager · Bloomly',
  time: 'Today · 9:42 AM',
  tone: 'green'
},
{
  id: 'audit-2',
  actor: 'System safeguard',
  action: 'Flagged elevated login activity',
  detail: 'Vantage AI workspace · resolved after verification',
  time: 'Today · 8:18 AM',
  tone: 'amber'
},
{
  id: 'audit-3',
  actor: 'Elliot Brooks',
  action: 'Reactivated an account',
  detail: 'Priya Nair · candidate account',
  time: 'Yesterday · 4:06 PM',
  tone: 'brand'
},
{
  id: 'audit-4',
  actor: 'System safeguard',
  action: 'Blocked a suspicious session',
  detail: 'Unknown device · no account access granted',
  time: 'Yesterday · 1:32 PM',
  tone: 'red'
}];


export const ROLE_TONES: Record<AdminRole, BadgeTone> = {
  Candidate: 'blue',
  Recruiter: 'brand',
  'Hiring manager': 'accent',
  Administrator: 'amber'
};

export const ACCOUNT_TONES: Record<AccountStatus, BadgeTone> = {
  Active: 'green',
  Suspended: 'red',
  Invited: 'amber'
};

export const ORGANIZATION_TONES: Record<OrganizationStatus, BadgeTone> = {
  Healthy: 'green',
  Review: 'amber',
  Restricted: 'red'
};

export const MODERATION_TONES: Record<ModerationStatus, BadgeTone> = {
  Pending: 'amber',
  Approved: 'green',
  Declined: 'red'
};