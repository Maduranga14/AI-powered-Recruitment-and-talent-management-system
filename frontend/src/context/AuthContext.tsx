import React, {
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
  Component } from
'react';
import { authApi } from '../services/api';
export interface CandidateProfile {
  name: string;
  email: string;
  title: string;
  location: string;
  bio: string;
  skills: string[];
  resumeName: string | null;
  avatar: string;
  organizationName?: string;
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
interface AuthContextValue {
  user: CandidateProfile | null;
  savedJobs: string[];
  applications: Application[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<CandidateProfile>) => void;
  toggleSaveJob: (jobId: string) => void;
  applyToJob: (jobId: string, meta?: { title: string; company: string; logo: string }) => void;
  hasApplied: (jobId: string) => boolean;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'talenta.auth.v1';
interface PersistedState {
  user: CandidateProfile | null;
  savedJobs: string[];
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
export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const initial = load();
  const [user, setUser] = useState<CandidateProfile | null>(initial.user);
  const [savedJobs, setSavedJobs] = useState<string[]>(initial.savedJobs);
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
  const login: AuthContextValue['login'] = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('tp_token', res.data.token);
    setUser({
      name: res.data.fullName,
      email: res.data.email,
      // store role in title so the routing logic in App.tsx can read it
      title: res.data.role,
      location: 'Office',
      bio: 'Workspace user.',
      skills: [],
      resumeName: null,
      avatar: makeAvatar(res.data.fullName),
      organizationName: res.data.organizationName,
    });
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
    setUser({
      name: res.data.fullName,
      email: res.data.email,
      title: 'Candidate Profile',
      location: 'City, Country',
      bio: 'New Candidate joining Talenta.',
      skills: [],
      resumeName: null,
      avatar: makeAvatar(res.data.fullName)
    });
  };
  const logout = () => {
    localStorage.removeItem('tp_token');
    setUser(null);
  };
  const updateProfile: AuthContextValue['updateProfile'] = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        ...patch
      };
      if (patch.name) next.avatar = makeAvatar(patch.name);
      return next;
    });
  };
  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) =>
    prev.includes(jobId) ?
    prev.filter((id) => id !== jobId) :
    [...prev, jobId]
    );
  };
  const applyToJob = (jobId: string, meta?: { title: string; company: string; logo: string }) => {
    setApplications((prev) => {
      if (prev.some((a) => a.jobId === jobId)) return prev;
      return [
        ...prev,
        {
          jobId,
          status: 'Applied',
          appliedAt: Date.now(),
          jobTitle: meta?.title,
          jobCompany: meta?.company,
          jobCompanyLogo: meta?.logo,
        },
      ];
    });
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
      toggleSaveJob,
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