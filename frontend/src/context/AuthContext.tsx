import React, {
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
  Component } from
'react';
import { getPhoneValidationError } from '../utils/phone';
import {
  authApi,
  candidateApi,
  UpdateCandidateProfileDto, 
  WorkExperienceResponseDto, 
  EducationResponseDto, 
  CandidateLinksDto 
} from '../services/api';

export interface CandidateProfile {
  name: string;
  email: string;
  title: string;
  role?: string;
  location: string;
  bio: string;
  skills: string[];
  resumeName: string | null;
  avatar: string;
  organizationName?: string;

  // Real backend candidate profile fields
  id?: string;
  phone?: string | null;
  headline?: string | null;
  resumeUrl?: string | null;
  photoUrl?: string | null;
  experiences?: WorkExperienceResponseDto[];
  educations?: EducationResponseDto[];
  links?: CandidateLinksDto | null;
  completenessPercent?: number;
  missingFields?: string[];
  createdAt?: string;
  updatedAt?: string;
}
export type ApplicationStatus =
'Applied' |
'In Review' |
'Interview' |
'Offer' |
'Rejected';
export interface Application {
  jobId: string;
  status: ApplicationStatus;
  appliedAt: number;
  
  jobTitle?: string;
  jobCompany?: string;
  jobCompanyLogo?: string;
}
export interface SavedJob {
  jobId: string;
  jobTitle: string;
  jobCompany: string;
  jobCompanyLogo: string;
  jobLocation: string;
  savedAt: number;
}

interface AuthContextValue {
  user: CandidateProfile | null;
  savedJobs: SavedJob[];
  applications: Application[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<CandidateProfile>) => void;
  saveProfile: () => Promise<void>;
  uploadResume: (file: File) => Promise<void>;
  deleteResume: () => Promise<void>;
  uploadPhoto: (file: File) => Promise<string>;
  deletePhoto: () => Promise<void>;
  exportProfileData: () => Promise<void>;
  deleteCandidateProfile: () => Promise<void>;
  toggleSaveJob: (jobId: string, meta?: { title: string; company: string; logo: string; location: string }) => void;
  isSaved: (jobId: string) => boolean;
  applyToJob: (jobId: string, meta?: { title: string; company: string; logo: string; coverLetter?: string }) => Promise<void>;
  hasApplied: (jobId: string) => boolean;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'talenta.auth.v1';
interface PersistedState {
  user: CandidateProfile | null;
  savedJobs: SavedJob[];
  applications: Application[];
}
const DEFAULT_AVATAR =
'https://ui-avatars.com/api/?name=New+User&background=4f46e5&color=fff&bold=true&size=128&format=png';
function makeAvatar(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'New User')}&background=4f46e5&color=fff&bold=true&size=128&format=png`;
}
function load(): PersistedState {
  if (typeof window === 'undefined')
  return {
    user: null,
    savedJobs: [],
    applications: []
  };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedState;
  } catch {

    /* ignore */}
  return {
    user: null,
    savedJobs: [],
    applications: []
  };
}
function mapStatus(status: string): ApplicationStatus {
  if (status === 'UnderReview' || status === 'Reviewed') return 'In Review';
  if (status === 'Hired' || status === 'Offer') return 'Offer';
  return status as ApplicationStatus;
}

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const initial = load();
  const [user, setUser] = useState<CandidateProfile | null>(initial.user);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(initial.savedJobs);
  const [applications, setApplications] = useState<Application[]>(
    initial.applications
  );
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user,
          savedJobs,
          applications
        })
      );
    } catch {
      /* ignore */}
  }, [user, savedJobs, applications]);

  const fetchProfile = async () => {
    try {
      const profile = await candidateApi.getProfile();
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          id: profile.id,
          phone: profile.phone,
          location: profile.location || prev.location,
          headline: profile.headline,
          resumeUrl: profile.resumeUrl,
          photoUrl: profile.photoUrl,
          experiences: profile.experiences,
          educations: profile.educations,
          skills: profile.skills,
          links: profile.links,
          completenessPercent: profile.completenessPercent,
          missingFields: profile.missingFields,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
          name: profile.fullName || prev.name,
          email: profile.email || prev.email,
          title: profile.headline || prev.title,
          bio: profile.headline || prev.bio,
          resumeName: profile.resumeUrl ? profile.resumeUrl.substring(profile.resumeUrl.lastIndexOf('/') + 1) : null,
          avatar: makeAvatar(profile.fullName || prev.name)
        };
      });

      const apps = await candidateApi.getApplications();
      const mappedApps = apps.map((a) => ({
        jobId: a.jobPostingId,
        status: mapStatus(a.status),
        appliedAt: new Date(a.appliedAt).getTime(),
        jobTitle: a.jobTitle,
        jobCompany: a.company,
      }));
      setApplications(mappedApps);
    } catch (err) {
      console.error('Failed to fetch candidate profile:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('tp_token');
    if (token && user) {
      const isCandidate = (user.title || '').toLowerCase() === 'candidate' || 
                          (user.title || '').toLowerCase() === 'candidate profile' ||
                          user.completenessPercent !== undefined;
      if (isCandidate) {
        fetchProfile();
      }
    }
  }, []);

  const login: AuthContextValue['login'] = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('tp_token', res.data.token);
    
    const initialUser: CandidateProfile = {
      name: res.data.fullName,
      email: res.data.email,
      title: res.data.role,
      role: res.data.role,
      location: 'Office',
      bio: 'Workspace user.',
      skills: [],
      resumeName: null,
      avatar: makeAvatar(res.data.fullName),
      organizationName: res.data.organizationName,
    };
    
    setUser(initialUser);

    if (res.data.role.toLowerCase() === 'candidate') {
      try {
        const profile = await candidateApi.getProfile();
        setUser({
          ...initialUser,
          id: profile.id,
          phone: profile.phone,
          location: profile.location || 'City, Country',
          headline: profile.headline,
          resumeUrl: profile.resumeUrl,
          photoUrl: profile.photoUrl,
          experiences: profile.experiences,
          educations: profile.educations,
          skills: profile.skills,
          links: profile.links,
          completenessPercent: profile.completenessPercent,
          missingFields: profile.missingFields,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
          name: profile.fullName || initialUser.name,
          email: profile.email || initialUser.email,
          title: profile.headline || initialUser.title,
          bio: profile.headline || initialUser.bio,
          resumeName: profile.resumeUrl ? profile.resumeUrl.substring(profile.resumeUrl.lastIndexOf('/') + 1) : null,
          avatar: makeAvatar(profile.fullName || initialUser.name)
        });

        const apps = await candidateApi.getApplications();
        const mappedApps = apps.map((a) => ({
          jobId: a.jobPostingId,
          status: mapStatus(a.status),
          appliedAt: new Date(a.appliedAt).getTime(),
          jobTitle: a.jobTitle,
          jobCompany: a.company,
        }));
        setApplications(mappedApps);
      } catch (err) {
        console.error('Failed to load candidate profile on login:', err);
      }
    }
  };

  const register: AuthContextValue['register'] = async (name, email, password) => {
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || 'User';

    const res = await authApi.register({
      firstName,
      lastName,
      email,
      password,
      confirmPassword: password
    });

    localStorage.setItem('tp_token', res.data.token);

    const initialUser: CandidateProfile = {
      name: res.data.fullName,
      email: res.data.email,
      title: 'Candidate Profile',
      location: 'City, Country',
      bio: 'New Candidate joining Talenta.',
      skills: [],
      resumeName: null,
      avatar: makeAvatar(res.data.fullName)
    };

    setUser(initialUser);

    try {
      const profile = await candidateApi.getProfile();
      setUser({
        ...initialUser,
        id: profile.id,
        phone: profile.phone,
        location: profile.location || 'City, Country',
        headline: profile.headline,
        resumeUrl: profile.resumeUrl,
        photoUrl: profile.photoUrl,
        experiences: profile.experiences,
        educations: profile.educations,
        skills: profile.skills,
        links: profile.links,
        completenessPercent: profile.completenessPercent,
        missingFields: profile.missingFields,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        name: profile.fullName || initialUser.name,
        email: profile.email || initialUser.email,
        title: profile.headline || initialUser.title,
        bio: profile.headline || initialUser.bio,
        resumeName: profile.resumeUrl ? profile.resumeUrl.substring(profile.resumeUrl.lastIndexOf('/') + 1) : null,
        avatar: makeAvatar(profile.fullName || initialUser.name)
      });
      setApplications([]);
    } catch (err) {
      console.error('Failed to load candidate profile on register:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('tp_token');
    setUser(null);
    setApplications([]);
  };

  const updateProfile: AuthContextValue['updateProfile'] = React.useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        ...patch
      };
      if (patch.name) next.avatar = makeAvatar(patch.name);
      return next;
    });
  }, []);

  const saveProfile = async () => {
    if (!user) return;

    const phoneValidationError = getPhoneValidationError(user.phone);
    if (phoneValidationError) {
      throw new Error(phoneValidationError);
    }

    try {
      const payload: UpdateCandidateProfileDto = {
        phone: user.phone || '',
        location: user.location || '',
        headline: user.title || '', // Map UI 'title' back to backend Headline
        skills: user.skills || [],
        experiences: (user.experiences || []).map((e) => ({
          company: e.company,
          title: e.title,
          startDate: e.startDate,
          endDate: e.endDate || null,
          isCurrent: e.isCurrent,
          description: e.description || null,
        })),
        educations: (user.educations || []).map((ed) => ({
          institution: ed.institution,
          degree: ed.degree,
          fieldOfStudy: ed.fieldOfStudy,
          startDate: ed.startDate,
          endDate: ed.endDate || null,
        })),
        links: user.links ? {
          linkedIn: user.links.linkedIn || null,
          portfolio: user.links.portfolio || null,
          gitHub: user.links.gitHub || null,
        } : null,
      };

      const res = await candidateApi.updateProfile(payload);
      const updated = res.data;
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          completenessPercent: updated.completenessPercent,
          missingFields: updated.missingFields,
          updatedAt: updated.updatedAt,
          name: updated.fullName || prev.name,
          email: updated.email || prev.email,
        };
      });
    } catch (err) {
      console.error('Failed to save candidate profile:', err);
      throw err;
    }
  };

  const uploadResume = async (file: File) => {
    if (!user) return;
    try {
      const res = await candidateApi.uploadResume(file);
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          resumeUrl: res.resumeUrl,
          resumeName: file.name,
        };
      });
      await fetchProfile();
    } catch (err) {
      console.error('Failed to upload resume:', err);
      throw err;
    }
  };

  const deleteResume = async () => {
    if (!user) return;
    try {
      await candidateApi.deleteResume();
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          resumeUrl: null,
          resumeName: null,
        };
      });
      await fetchProfile();
    } catch (err) {
      console.error('Failed to delete resume:', err);
      throw err;
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    if (!user) return '';
    try {
      const res = await candidateApi.uploadPhoto(file);
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          photoUrl: res.photoUrl,
          avatar: res.photoUrl,
        };
      });
      await fetchProfile();
      return res.photoUrl;
    } catch (err) {
      console.error('Failed to upload photo:', err);
      throw err;
    }
  };

  const deletePhoto = async () => {
    if (!user) return;
    try {
      await candidateApi.deletePhoto();
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          photoUrl: null,
          avatar: makeAvatar(prev.name),
        };
      });
      await fetchProfile();
    } catch (err) {
      console.error('Failed to delete photo:', err);
      throw err;
    }
  };

  const exportProfileData = async () => {
    if (!user) return;
    try {
      const data = await candidateApi.exportProfile();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `${user.name.replace(/\s+/g, '_')}_profile_export.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Failed to export profile:', err);
      throw err;
    }
  };

  const deleteCandidateProfile = async () => {
    if (!user) return;
    try {
      await candidateApi.deleteProfile();
      logout();
    } catch (err) {
      console.error('Failed to delete candidate profile:', err);
      throw err;
    }
  };

  const toggleSaveJob = (jobId: string, meta?: { title: string; company: string; logo: string; location: string }) => {
    setSavedJobs((prev) => {
      const exists = prev.some((s) => s.jobId === jobId);
      if (exists) return prev.filter((s) => s.jobId !== jobId);
      return [
        ...prev,
        {
          jobId,
          jobTitle: meta?.title ?? '',
          jobCompany: meta?.company ?? '',
          jobCompanyLogo: meta?.logo ?? '',
          jobLocation: meta?.location ?? '',
          savedAt: Date.now(),
        },
      ];
    });
  };

  const isSaved = (jobId: string) => savedJobs.some((s) => s.jobId === jobId);

  const applyToJob = async (jobId: string, meta?: { title: string; company: string; logo: string; coverLetter?: string }) => {
    try {
      const res = await candidateApi.applyToJob({
        jobPostingId: jobId,
        coverLetter: meta?.coverLetter,
      });
      const newApp = res.data;
      setApplications((prev) => {
        if (prev.some((a) => a.jobId === jobId)) return prev;
        return [
          ...prev,
          {
            jobId,
            status: mapStatus(newApp.status),
            appliedAt: new Date(newApp.appliedAt).getTime(),
            jobTitle: newApp.jobTitle || meta?.title,
            jobCompany: newApp.company || meta?.company,
          },
        ];
      });
    } catch (err) {
      console.error('Failed to apply to job:', err);
      throw err;
    }
  };

  const hasApplied = (jobId: string) =>
    applications.some((a) => a.jobId === jobId);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      savedJobs,
      applications,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      saveProfile,
      uploadResume,
      deleteResume,
      uploadPhoto,
      deletePhoto,
      exportProfileData,
      deleteCandidateProfile,
      toggleSaveJob,
      isSaved,
      applyToJob,
      hasApplied
    }),
    [user, savedJobs, applications]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}