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
  headers.append('Content-Type', 'application/json');
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

  
  inviteHiringManager: (payload: { email: string }) =>
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
  inviteHiringManager: (payload: { email: string }) =>
    authApi.inviteHiringManager(payload),

  createJob: (payload: CreateJobPostingPayload) =>
    request<ApiResponse<JobPostingDetail>>('/recruiter/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyJobs: (status?: string, page = 1, pageSize = 20) => {
    const statusParam = status ? `&status=${encodeURIComponent(status)}` : '';
    return request<PagedJobsResult>(`/recruiter/jobs?page=${page}&pageSize=${pageSize}${statusParam}`);
  },

  updateJobStatus: (id: string, status: number) =>
    request<ApiResponse<JobPostingDetail>>(`/recruiter/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getHiringManagers: () =>
    request<RecruiterHiringManagersResponse>('/recruiter/hiring-managers'),

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
};

export interface HiringManager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
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
