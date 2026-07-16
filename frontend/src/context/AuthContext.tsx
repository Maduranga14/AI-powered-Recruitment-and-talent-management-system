import React, {
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
  Component } from
'react';
export interface CandidateProfile {
  name: string;
  email: string;
  title: string;
  location: string;
  bio: string;
  skills: string[];
  resumeName: string | null;
  avatar: string;
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
}
interface AuthContextValue {
  user: CandidateProfile | null;
  savedJobs: string[];
  applications: Application[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
  updateProfile: (patch: Partial<CandidateProfile>) => void;
  toggleSaveJob: (jobId: string) => void;
  applyToJob: (jobId: string) => void;
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
  const login: AuthContextValue['login'] = (email) => {
    const name = email.split('@')[0].replace(/[._]/g, ' ');
    const pretty = name.replace(/\b\w/g, (c) => c.toUpperCase());
    setUser({
      name: pretty || 'Alex Morgan',
      email,
      title: 'Senior Frontend Engineer',
      location: 'San Francisco, CA',
      bio: 'Product-minded frontend engineer who loves building accessible, delightful interfaces.',
      skills: [
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Design Systems',
      'GraphQL'],

      resumeName: 'Alex_Morgan_CV.pdf',
      avatar: makeAvatar(pretty)
    });
  };
  const register: AuthContextValue['register'] = (name, email) => {
    setUser({
      name,
      email,
      title: '',
      location: '',
      bio: '',
      skills: [],
      resumeName: null,
      avatar: name ? makeAvatar(name) : DEFAULT_AVATAR
    });
  };
  const logout = () => setUser(null);
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
  const applyToJob = (jobId: string) => {
    setApplications((prev) => {
      if (prev.some((a) => a.jobId === jobId)) return prev;
      return [
      ...prev,
      {
        jobId,
        status: 'Applied',
        appliedAt: Date.now()
      }];

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