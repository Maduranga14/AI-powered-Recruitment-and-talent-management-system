const BASE_URL = 'http://localhost:5073/api';

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  organizationName?: string;
  expiresAt: string;
}

export interface InviteResponse {
  message: string;
  inviteLink: string;
  token: string;
  expiresAt: string;
}

export interface InviteInfo {
  invitedEmail: string;
  organizationName: string;
  expiresAt: string;
}

export interface PendingRecruiter {
  id: string;
  fullName: string;
  email: string;
  organizationName: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('tp_token');
  const headers = new Headers();
  if (!(options.body instanceof FormData)) {
    headers.append('Content-Type', 'application/json');
  }
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(', ') : null) ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// Public request — never sends Authorization header so expired tokens
// don't cause AllowAnonymous endpoints to return 401
async function publicRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const authApi = {

  login: (payload: { email: string; password: string }) =>
    request<ApiResponse<AuthResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) =>
    request<ApiResponse<AuthResponse>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),


  registerRecruiter: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    organizationName: string;
  }) =>
    request<{ message: string }>('/auth/register-recruiter', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),


  inviteHiringManager: (payload: { email: string; departmentId?: string }) =>
    request<InviteResponse>('/auth/invite-hiring-manager', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  validateInvite: (token: string) =>
    request<InviteInfo>(`/auth/validate-invite?token=${encodeURIComponent(token)}`),

  registerHiringManager: (payload: {
    token: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
  }) =>
    request<ApiResponse<AuthResponse>>('/auth/register-hiring-manager', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  organizationName?: string;
  organizationId?: string;
  departmentName?: string;
  departmentId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminOrganizationDto {
  id: string;
  name: string;
  taxNumber: string;
  website?: string | null;
  shortDescription?: string | null;
  logoUrl?: string | null;
  initials: string;
  sub: string;
  plan: 'Scale' | 'Growth' | 'Starter' | string;
  status: 'Healthy' | 'Review' | 'Restricted' | string;
  owner: string;
  members: number;
  activeJobs: number;
  joined: string;
  monthlyUsage: string;
  createdAt: string;
}

export interface CreateOrganizationPayload {
  name: string;
  taxNumber: string;
  website?: string;
  shortDescription?: string;
  logoUrl?: string;
  sub?: string;
  plan?: string;
  status?: string;
  owner?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const adminApi = {
  getDepartments: (organizationName?: string) => {
    const qs = organizationName ? `?organizationName=${encodeURIComponent(organizationName)}` : '';
    return request<DepartmentDashboardDto>(`/departments/dashboard${qs}`);
  },

  getPendingRecruiters: () =>
    request<PendingRecruiter[]>('/admin/pending-recruiters'),

  approveRecruiter: (id: string) =>
    request<{ message: string }>(`/admin/recruiters/${id}/approve`, {
      method: 'PUT',
    }),

  rejectRecruiter: (id: string) =>
    request<{ message: string }>(`/admin/recruiters/${id}/reject`, {
      method: 'PUT',
    }),

  toggleUserStatus: (id: string) =>
    request<{ message: string; isActive: boolean }>(`/admin/users/${id}/toggle-status`, {
      method: 'PUT',
    }),

  getUsers: (role?: string, page = 1, pageSize = 100) => {
    const roleParam = role ? `&role=${encodeURIComponent(role)}` : '';
    return request<PagedResult<BackendUser>>(`/admin/users?page=${page}&pageSize=${pageSize}${roleParam}`);
  },

  updateUser: (id: string, payload: {
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    status?: string;
    organizationId?: string;
    departmentId?: string;
  }) =>
    request<{ message: string; data: BackendUser }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteUser: (id: string) =>
    request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  createUser: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    organizationId?: string;
    departmentId?: string;
  }) =>
    request<{ message: string; data: BackendUser }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getOrganizations: () =>
    request<AdminOrganizationDto[]>('/admin/organizations'),

  createOrganization: (payload: CreateOrganizationPayload) =>
    request<{ message: string; data: AdminOrganizationDto }>('/admin/organizations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateOrganization: (id: string, payload: CreateOrganizationPayload) =>
    request<{ message: string; data: AdminOrganizationDto }>(`/admin/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteOrganization: (id: string) =>
    request<{ message: string }>(`/admin/organizations/${id}`, {
      method: 'DELETE',
    }),

  getAnalytics: () =>
    request<DashboardAnalyticsDto>('/admin/analytics/dashboard'),

  // ─── Audit Logs ──────────────────────────────────────────────────────────
  getAuditLogs: (page = 1, pageSize = 20, search?: string, module?: string) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set('search', search);
    if (module) params.set('module', module);
    return request<PagedResult<AuditLogEntry>>(`/admin/audit-logs?${params}`);
  },

  getAuditModules: () =>
    request<string[]>('/admin/audit-logs/modules'),

  // ─── System Settings ─────────────────────────────────────────────────────
  getSettings: () =>
    request<SystemSettingEntry[]>('/admin/settings'),

  updateSettings: (settings: { key: string; value: string }[]) =>
    request<{ message: string; data: SystemSettingEntry[] }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    }),
};



export interface JobPostingDetail {
  id: string;
  title: string;
  description: string;
  requirements?: string | null;
  location: string;
  employmentType: string;
  status: string;
  departmentName: string | null;
  departmentId: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  experienceRequired: string | null;
  requiredSkills: string | null;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  createdByRecruiterId: string;
  recruiterName: string;
}

export interface JobPostingListItem {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  status: string;
  departmentName: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  deadline: string | null;
  createdAt: string;
  publishedAt: string | null;
  recruiterName: string;
  applicantCount?: number;
  screenedCount?: number;
  shortlistedCount?: number;
  interviewCount?: number;
}

export interface WorkExperienceItem {
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
}

export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
}

export interface JobApplicant {
  applicationId: string;
  jobPostingId: string;
  candidateProfileId: string;
  userId: string;
  fullName: string;
  email: string;
  headline: string | null;
  location: string | null;
  photoUrl: string | null;
  jobTitle: string;
  departmentName?: string | null;
  status: string;
  coverLetter: string | null;
  appliedAt: string;
  matchScore: number;
  skills: string[];
  experiences: WorkExperienceItem[];
  educations: EducationItem[];
  experienceSummary: string | null;
  resumeUrl: string | null;
  feedback?: string | null;
  recommendation?: string | null;
  overallRating?: number | null;
  skillRatings?: string | null;
  // Post-interview evaluation fields
  interviewOverallRating?: number | null;
  interviewRecommendation?: string | null;
  interviewComments?: string | null;
  interviewSkillRatings?: string | null;
  interviewTechnicalScore?: number | null;
}

export interface ScheduleInterviewPayload {
  scheduledAt: string;
  durationMinutes: number;
  interviewType: 'Video' | 'Phone' | 'Onsite';
  meetingLink?: string;
  location?: string;
  interviewerName: string;
  notes?: string;
}

export interface InterviewDto {
  id: string;
  applicationId: string;
  jobPostingId: string;
  candidateName: string;
  candidateEmail: string;
  photoUrl: string | null;
  jobTitle: string;
  company?: string | null;
  jobLocation?: string | null;
  scheduledAt: string;
  durationMinutes: number;
  interviewType: string;
  meetingLink: string | null;
  location: string | null;
  interviewerName: string;
  notes: string | null;
  applicationStatus: string;
  rescheduleRequested?: boolean;
  rescheduleReason?: string | null;
  rescheduleRequestedAt?: string | null;
  lastRescheduledAt?: string | null;
  // Post-interview feedback fields
  feedbackOverallRating?: number | null;
  feedbackRecommendation?: string | null;
  feedbackComments?: string | null;
  feedbackSkillRatings?: string | null;
  feedbackTechnicalScore?: number | null;
  feedbackSubmittedAt?: string | null;
  hasFeedback?: boolean;
}

export interface JobApplicantsResult {
  jobId: string;
  jobTitle: string;
  jobStatus: string;
  applicants: JobApplicant[];
}

export interface PagedJobsResult {
  items: JobPostingListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateJobPostingPayload {
  title: string;
  description: string;
  requirements?: string;
  location: string;
  employmentType: number;
  status: number; // 0=Draft, 1=Published
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  experienceRequired?: string;
  requiredSkills?: string;
  deadline?: string;
  departmentId?: string;
  postedBy?: string;
}


// Employment type enum values matching the backend
export const EmploymentTypeMap: Record<string, number> = {
  FullTime: 0,
  PartTime: 1,
  Contract: 2,
  Internship: 3,
  Remote: 4,
};

export const recruiterApi = {
  inviteHiringManager: (payload: { email: string; departmentId?: string }) =>
    authApi.inviteHiringManager(payload),

  createJob: (payload: CreateJobPostingPayload) =>
    request<ApiResponse<JobPostingDetail>>('/recruiter/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getJobDetails: (id: string) =>
    request<JobPostingDetail>(`/recruiter/jobs/${id}`),

  updateJob: (id: string, payload: Partial<CreateJobPostingPayload>) =>
    request<ApiResponse<JobPostingDetail>>(`/recruiter/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteJob: (id: string) =>
    request<void>(`/recruiter/jobs/${id}`, {
      method: 'DELETE',
    }),

  getMyJobs: (status?: string, page = 1, pageSize = 20) => {
    const statusParam = status ? `&status=${encodeURIComponent(status)}` : '';
    return request<PagedJobsResult>(`/recruiter/jobs?page=${page}&pageSize=${pageSize}${statusParam}`);
  },

  getJobApplicants: (jobId: string, includeAiScores = false) =>
    request<JobApplicantsResult>(`/recruiter/jobs/${jobId}/applicants?includeAiScores=${includeAiScores}`),

  getAllApplicants: (includeAiScores = false) =>
    request<JobApplicant[]>(`/recruiter/applicants?includeAiScores=${includeAiScores}`),

  getCandidateProfile: (profileId: string) =>
    request<CandidateProfileResponseDto>(`/recruiter/candidates/${profileId}/profile`),

  updateApplicantStatus: (jobId: string, applicationId: string, status: number) =>
    request<ApiResponse<JobApplicant>>(
      `/recruiter/jobs/${jobId}/applicants/${applicationId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    ),

  scheduleInterview: (
    jobId: string,
    applicationId: string,
    payload: ScheduleInterviewPayload
  ) =>
    request<ApiResponse<InterviewDto>>(
      `/recruiter/jobs/${jobId}/applicants/${applicationId}/interview`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  getInterviews: () =>
    request<InterviewDto[]>('/recruiter/interviews'),

  rescheduleInterview: (interviewId: string, payload: ScheduleInterviewPayload) =>
    request<ApiResponse<InterviewDto>>(`/recruiter/interviews/${interviewId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  updateJobStatus: (id: string, status: number) =>
    request<ApiResponse<JobPostingDetail>>(`/recruiter/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getHiringManagers: () =>
    request<RecruiterHiringManagersResponse>('/recruiter/hiring-managers'),

  getHiringManagerAvailability: (id: string) =>
    request<BusySlot[]>(`/recruiter/hiring-managers/${id}/availability`),

  toggleHiringManagerStatus: (id: string) =>
    request<{ message: string; isActive: boolean }>(`/recruiter/hiring-managers/${id}/toggle-status`, {
      method: 'PUT',
    }),

  resendInvitation: (id: string) =>
    request<{ message: string }>(`/recruiter/hiring-managers/invitations/${id}/resend`, {
      method: 'POST',
    }),

  revokeInvitation: (id: string) =>
    request<{ message: string }>(`/recruiter/hiring-managers/invitations/${id}/revoke`, {
      method: 'DELETE',
    }),

  deleteHiringManager: (id: string) =>
    request<{ message: string }>(`/recruiter/hiring-managers/${id}`, {
      method: 'DELETE',
    }),

  getDepartments: (organizationName?: string) => {
    const qs = organizationName ? `?organizationName=${encodeURIComponent(organizationName)}` : '';
    return request<DepartmentDashboardDto>(`/departments/dashboard${qs}`);
  },

  createDepartment: (payload: { name: string; description?: string; head?: string; contactEmail?: string; badge?: string; organizationName?: string }) =>
    request<DepartmentDto>('/departments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteDepartment: (id: string) =>
    request<void>(`/departments/${id}`, {
      method: 'DELETE',
    }),

  sendMessage: (payload: {
    toEmail: string;
    toName: string;
    subject: string;
    message: string;
    jobTitle?: string;
  }) =>
    request<{ message: string }>('/recruiter/messages/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const managerApi = {
  getApplicants: (includeAiScores = false) =>
    request<JobApplicant[]>(`/manager/applicants?includeAiScores=${includeAiScores}`),

  getInterviews: () =>
    request<InterviewDto[]>('/manager/interviews'),

  requestReschedule: (interviewId: string, reason?: string) =>
    request<ApiResponse<InterviewDto>>(
      `/manager/interviews/${interviewId}/request-reschedule`,
      {
        method: 'POST',
        body: JSON.stringify({ reason: reason || undefined }),
      }
    ),

  submitFeedback: (
    applicationId: string,
    payload: {
      recommendation: string;
      feedback: string;
      overallRating: number;
      skillRatings?: string;
    }
  ) =>
    request<JobApplicant>(`/manager/applications/${applicationId}/feedback`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  submitInterviewFeedback: (
    interviewId: string,
    payload: {
      recommendation: string;
      comments: string;
      overallRating: number;
      skillRatings?: string;
      technicalAssessmentScore?: number | null;
    }
  ) =>
    request<ApiResponse<InterviewDto>>(`/manager/interviews/${interviewId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  makeHiringDecision: (
    applicationId: string,
    payload: {
      decision: string;
      notes?: string;
    }
  ) =>
    request<JobApplicant>(`/manager/applications/${applicationId}/decision`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export interface HiringManager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  departmentId?: string | null;
  departmentName?: string | null;
}

export interface HiringManagerInvitation {
  id: string;
  email: string;
  sentAt: string;
  expiresAt: string;
  isExpired: boolean;
}

export interface RecruiterHiringManagersResponse {
  hiringManagers: HiringManager[];
  pendingInvitations: HiringManagerInvitation[];
}

export interface BusySlot {
  scheduledAt: string;
  durationMinutes: number;
}

// ─── Public job types ─────────────────────────────────────────────────────────

export interface PublicJob {
  id: string;
  title: string;
  description: string;
  requirements?: string | null;
  location: string;
  employmentType: string;
  departmentName: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  experienceRequired: string | null;
  requiredSkills: string[];
  deadline: string | null;
  publishedAt: string;
  organizationName: string;
  postedBy: string;
}

export const publicApi = {
  getPublishedJobs: (keyword?: string, location?: string) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    const qs = params.toString();
    return publicRequest<PublicJob[]>(`/jobs${qs ? '?' + qs : ''}`);
  },

  getJobById: (id: string) =>
    publicRequest<PublicJob>(`/jobs/${id}`),

  getOrganizations: () =>
    publicRequest<AdminOrganizationDto[]>('/organizations'),
};

// ─── Candidate Profile integration types ─────────────────────────────────────

export interface CandidateLinksDto {
  linkedIn?: string | null;
  portfolio?: string | null;
  gitHub?: string | null;
}

export interface WorkExperienceResponseDto {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
}

export interface WorkExperienceDto {
  company: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
}

export interface EducationResponseDto {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string | null;
}

export interface EducationDto {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string | null;
}

export interface CandidateProfileResponseDto {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  headline?: string | null;
  resumeUrl?: string | null;
  photoUrl?: string | null;
  experiences: WorkExperienceResponseDto[];
  educations: EducationResponseDto[];
  skills: string[];
  links?: CandidateLinksDto | null;
  completenessPercent: number;
  missingFields: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCandidateProfileDto {
  phone?: string | null;
  location?: string | null;
  headline?: string | null;
  experiences?: WorkExperienceDto[] | null;
  educations?: EducationDto[] | null;
  skills?: string[] | null;
  links?: CandidateLinksDto | null;
}

export interface ApplicationResponseDto {
  applicationId: string;
  jobPostingId: string;
  jobTitle: string;
  company: string;
  location: string;
  employmentType: string;
  status: string;
  coverLetter?: string | null;
  appliedAt: string;
  updatedAt: string;
}

export interface CandidateProfileExportDto {
  profileId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  headline?: string | null;
  resumeUrl?: string | null;
  photoUrl?: string | null;
  experiences: WorkExperienceResponseDto[];
  educations: EducationResponseDto[];
  skills: string[];
  links?: CandidateLinksDto | null;
  applications: ApplicationResponseDto[];
  createdAt: string;
  exportedAt: string;
}

export interface ParsedResumeDto {
  phone?: string | null;
  location?: string | null;
  headline?: string | null;
  skills: string[];
  experiences: {
    company: string;
    title: string;
    startDate: string;
    endDate?: string | null;
    isCurrent: boolean;
    description?: string | null;
  }[];
  educations: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string | null;
  }[];
}

export interface JobRecommendationDto {
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  employmentType: string;
  description: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency: string;
  requiredSkills: string[];
  matchScore: number;
  matchExplanation: string;
}

export const candidateApi = {
  getProfile: () =>
    request<CandidateProfileResponseDto>('/candidate/profile'),

  createProfile: (payload: { phone: string; location: string; headline: string }) =>
    request<{ message: string; data: CandidateProfileResponseDto }>('/candidate/profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProfile: (payload: UpdateCandidateProfileDto) =>
    request<{ message: string; data: CandidateProfileResponseDto }>('/candidate/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ message: string; resumeUrl: string }>('/candidate/profile/resume', {
      method: 'POST',
      body: formData,
    });
  },

  parseResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ message: string; resumeUrl: string; data: ParsedResumeDto }>('/candidate/profile/resume/parse', {
      method: 'POST',
      body: formData,
    });
  },

  getRecommendations: () =>
    request<JobRecommendationDto[]>('/candidate/profile/recommendations'),

  deleteResume: () =>
    request<void>('/candidate/profile/resume', {
      method: 'DELETE',
    }),

  deleteProfile: () =>
    request<{ message: string }>('/candidate/profile', {
      method: 'DELETE',
    }),

  exportProfile: () =>
    request<CandidateProfileExportDto>('/candidate/profile/export'),

  getApplications: () =>
    request<ApplicationResponseDto[]>('/candidate/profile/applications'),

  getInterviews: () =>
    request<InterviewDto[]>('/candidate/profile/interviews'),

  applyToJob: (payload: { jobPostingId: string; coverLetter?: string }) =>
    request<{ message: string; data: ApplicationResponseDto }>('/candidate/profile/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// ── AI Chat Assistant ────────────────────────────────────────────────────────

export interface ChatMessageDto {
  id: string;
  role: 'user' | 'assistant' | 'system' | string;
  content: string;
  createdAt: string;
}

export interface ChatConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview: string | null;
}

export interface ChatConversationDetail {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessageDto[];
}

export interface SendChatResponse {
  conversationId: string;
  conversationTitle: string;
  userMessage: ChatMessageDto;
  assistantMessage: ChatMessageDto;
  usedFallback: boolean;
}

export interface ChatSuggestions {
  suggestions: string[];
  greeting: string;
  assistantName: string;
}

export const chatApi = {
  getSuggestions: () => request<ChatSuggestions>('/chat/suggestions'),

  listConversations: () =>
    request<ChatConversationSummary[]>('/chat/conversations'),

  getConversation: (id: string) =>
    request<ChatConversationDetail>(`/chat/conversations/${id}`),

  deleteConversation: (id: string) =>
    request<void>(`/chat/conversations/${id}`, { method: 'DELETE' }),

  sendMessage: async (payload: { message: string; conversationId?: string | null }) => {
    const body: { message: string; conversationId?: string } = {
      message: payload.message,
    };
    if (payload.conversationId) {
      body.conversationId = payload.conversationId;
    }
    return request<SendChatResponse>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

export interface DepartmentDto {
  id: string;
  name: string;
  description?: string | null;
  badge: string;
  badgeColor: string;
  head: string;
  contactEmail?: string | null;
  headInitials: string;
  headColor: string;
  organizationName?: string | null;
}

export interface DepartmentDashboardDto {
  corporateStructure: {
    id: string;
    name: string;
    sub: string;
  };
  departments: DepartmentDto[];
  globalPolicies: {
    id: string;
    label: string;
    desc: string;
    enabled: boolean;
  }[];
}

// ── Recruitment Analytics ─────────────────────────────────────────────────────

export interface PipelineFunnelDto {
  received: number;
  underReview: number;
  interviewScheduled: number;
  hired: number;
}

export interface OrgHiringDto {
  organizationName: string;
  totalJobs: number;
  totalApplications: number;
  hired: number;
}

export interface DepartmentJobsDto {
  departmentName: string;
  jobCount: number;
}

export interface ActivityLogItemDto {
  type: 'job_posted' | 'hired' | 'application' | 'interview' | string;
  message: string;
  meta: string;
  occurredAt: string;
}

export interface DashboardAnalyticsDto {
  totalJobsPosted: number;
  totalApplicants: number;
  totalHired: number;
  totalActiveOrganizations: number;
  pipeline: PipelineFunnelDto;
  topOrganizations: OrgHiringDto[];
  departmentBreakdown: DepartmentJobsDto[];
  averageMatchScore: number;
  averageTimeToHireDays: number;
  recentActivity: ActivityLogItemDto[];
}

// ── Audit & Settings ──────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: number;
  userId?: string | null;
  userName: string;
  action: string;
  module: string;
  ipAddress: string;
  timestamp: string;
  details?: string | null;
}

export interface SystemSettingEntry {
  id: number;
  key: string;
  value: string;
  description: string;
  updatedAt: string;
  updatedBy: string;
}
