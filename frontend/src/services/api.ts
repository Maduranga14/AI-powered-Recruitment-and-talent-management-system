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
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
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
  isActive: boolean;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const adminApi = {
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

  getUsers: (role?: string, page = 1, pageSize = 100) => {
    const roleParam = role ? `&role=${encodeURIComponent(role)}` : '';
    return request<PagedResult<BackendUser>>(`/admin/users?page=${page}&pageSize=${pageSize}${roleParam}`);
  },
};



export interface JobPostingDetail {
  id: string;
  title: string;
  description: string;
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
  status: string;
  coverLetter: string | null;
  appliedAt: string;
  skills: string[];
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
  location: string;
  employmentType: number;
  status: number; // 0=Draft, 1=Published
  salaryMin?: number;
  salaryMax?: number;
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

  getJobApplicants: (jobId: string) =>
    request<JobApplicantsResult>(`/recruiter/jobs/${jobId}/applicants`),

  getAllApplicants: () =>
    request<JobApplicant[]>('/recruiter/applicants'),

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

  createDepartment: (payload: { name: string; head: string; badge?: string; organizationName?: string }) =>
    request<DepartmentDto>('/departments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteDepartment: (id: string) =>
    request<void>(`/departments/${id}`, {
      method: 'DELETE',
    }),
};

export const managerApi = {
  getApplicants: () =>
    request<JobApplicant[]>('/manager/applicants'),

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
  badge: string;
  badgeColor: string;
  head: string;
  headInitials: string;
  headColor: string;
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
