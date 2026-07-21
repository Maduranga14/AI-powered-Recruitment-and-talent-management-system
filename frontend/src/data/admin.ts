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
  department?: string;
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