import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  FileTextIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  LinkedinIcon,
  GithubIcon,
  GlobeIcon,
  BrainCircuitIcon,
  Loader2Icon,
} from 'lucide-react';
import { recruiterApi, type CandidateProfileResponseDto } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const API_ORIGIN = 'http://localhost:5073';

function avatarFor(name: string, photoUrl?: string | null): string {
  if (photoUrl) {
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${API_ORIGIN}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d9488&color=fff&bold=true&size=128&format=png`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Fallback Mock profiles for testing/seeded items that may not be in DB
const MOCK_PROFILES: Record<string, CandidateProfileResponseDto> = {
  'manager-candidate-1': {
    id: 'manager-candidate-1',
    fullName: 'Maya Chen',
    email: 'maya.chen@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    headline: 'Senior Frontend Engineer | UI Architect',
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'Redux', 'Web Performance', 'Figma'],
    experiences: [
      {
        id: 'exp1',
        company: 'Vanguard Technologies',
        title: 'Lead Frontend Developer',
        startDate: '2023-03-01T00:00:00Z',
        endDate: null,
        isCurrent: true,
        description: 'Led UI architecture overhaul using Next.js 14 and custom design systems. Managed a frontend team of 5, improving build speeds by 40% and site performance metrics from 60 to 95.'
      },
      {
        id: 'exp2',
        company: 'WebFlow Studio',
        title: 'Senior Software Developer',
        startDate: '2020-05-15T00:00:00Z',
        endDate: '2023-02-28T00:00:00Z',
        isCurrent: false,
        description: 'Implemented component libraries, integrated REST APIs, and managed client-side application state. Focused heavily on high-interaction dashboards and data visualization tools.'
      }
    ],
    educations: [
      {
        id: 'edu1',
        institution: 'University of California, Berkeley',
        degree: 'B.S.',
        fieldOfStudy: 'Computer Science & Design',
        startDate: '2016-09-01T00:00:00Z',
        endDate: '2020-05-10T00:00:00Z'
      }
    ],
    links: {
      linkedIn: 'https://linkedin.com',
      gitHub: 'https://github.com',
      portfolio: 'https://mayachen.dev'
    },
    completenessPercent: 95,
    missingFields: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  'manager-candidate-2': {
    id: 'manager-candidate-2',
    fullName: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    phone: '+1 (555) 987-6543',
    location: 'Austin, TX',
    headline: 'DevOps Architect | AWS Specialist',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Python', 'CI/CD', 'GitHub Actions'],
    experiences: [
      {
        id: 'exp3',
        company: 'ScaleOps Inc',
        title: 'Principal DevOps Architect',
        startDate: '2022-01-10T00:00:00Z',
        endDate: null,
        isCurrent: true,
        description: 'Automated cluster scaling configurations on EKS using Terraform. Reduced annual cloud expenditures by 30% while maintaining 99.99% availability.'
      }
    ],
    educations: [
      {
        id: 'edu2',
        institution: 'University of Texas at Austin',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Information Systems',
        startDate: '2017-09-01T00:00:00Z',
        endDate: '2021-05-20T00:00:00Z'
      }
    ],
    links: {
      linkedIn: 'https://linkedin.com',
      gitHub: 'https://github.com',
      portfolio: ''
    },
    completenessPercent: 88,
    missingFields: ['portfolio'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

export function CandidateProfileView() {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CandidateProfileResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!profileId) return;
      setLoading(true);
      setError('');

      // Check if it is a mock ID first
      if (MOCK_PROFILES[profileId]) {
        // Artificially delay for transition effects
        await new Promise((resolve) => setTimeout(resolve, 300));
        setProfile(MOCK_PROFILES[profileId]);
        setLoading(false);
        return;
      }

      try {
        const data = await recruiterApi.getCandidateProfile(profileId);
        setProfile(data);
      } catch (err: any) {
        console.warn('API error loading profile, trying fallback mapping:', err);
        // Generically create a mock candidate fallback if API fails
        const matchingMockKey = Object.keys(MOCK_PROFILES).find(
          (key) => key.toLowerCase() === profileId.toLowerCase()
        );
        if (matchingMockKey) {
          setProfile(MOCK_PROFILES[matchingMockKey]);
        } else {
          setError(err?.message ?? 'Failed to load candidate profile.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center bg-slate-50 p-6">
        <Loader2Icon className="h-10 w-10 animate-spin text-brand-600" />
        <p className="mt-4 text-sm font-semibold text-slate-600">Retrieving profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-red-700">Unable to load profile</h2>
          <p className="mt-2 text-sm text-red-600">{error || 'Candidate profile not found.'}</p>
          <Button onClick={() => navigate(-1)} className="mt-6" variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 pb-24 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="group mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 focus:outline-none"
      >
        <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </button>

      {/* Main Profile Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Details */}
        <div className="space-y-6">
          {/* Card 1: Header Profile Card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
              <img
                src={avatarFor(profile.fullName, profile.photoUrl)}
                alt={profile.fullName}
                className="h-24 w-24 rounded-2xl object-cover ring-4 ring-brand-50"
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
                  {profile.fullName}
                </h1>
                <p className="mt-1.5 text-lg font-medium text-brand-700">
                  {profile.headline || 'Professional Candidate'}
                </p>
                <div className="mt-4 flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MapPinIcon className="h-4 w-4 text-slate-400" />
                    {profile.location || 'Not Specified'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MailIcon className="h-4 w-4 text-slate-400" />
                    <a href={`mailto:${profile.email}`} className="hover:text-brand-600 hover:underline">
                      {profile.email}
                    </a>
                  </span>
                  {profile.phone && (
                    <span className="flex items-center gap-1.5">
                      <PhoneIcon className="h-4 w-4 text-slate-400" />
                      {profile.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Work Experience */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <BriefcaseIcon className="h-5 w-5 text-slate-400" />
              Work History
            </h2>

            {profile.experiences.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500 italic">No work experience listed yet.</p>
            ) : (
              <div className="relative mt-6 border-l border-slate-200 pl-6 space-y-8">
                {profile.experiences.map((exp, idx) => (
                  <div key={exp.id || idx} className="relative">
                    {/* Timeline Node dot */}
                    <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-brand-600 bg-white ring-4 ring-white" />
                    
                    <div>
                      <span className="text-xs font-semibold text-brand-600">
                        {formatDate(exp.startDate)} &ndash; {exp.isCurrent || !exp.endDate ? 'Present' : formatDate(exp.endDate)}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-slate-950">
                        {exp.title}
                      </h3>
                      <p className="text-sm font-semibold text-slate-600 mt-0.5">
                        {exp.company}
                      </p>
                      {exp.description && (
                        <p className="mt-3 text-sm leading-6 text-slate-600 whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Education */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCapIcon className="h-5 w-5 text-slate-400" />
              Education
            </h2>

            {profile.educations.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500 italic">No education details listed yet.</p>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {profile.educations.map((edu, idx) => (
                  <div key={edu.id || idx} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <p className="text-xs font-semibold text-slate-400">
                      {formatDate(edu.startDate)} &ndash; {edu.endDate ? formatDate(edu.endDate) : 'Ongoing'}
                    </p>
                    <h3 className="mt-1.5 text-sm font-bold text-slate-900">
                      {edu.degree} in {edu.fieldOfStudy}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {edu.institution}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          {/* Card 4: Resume download & social links */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-base font-bold text-slate-900 mb-4">Application Attachments</h2>
            {profile.resumeUrl ? (
              <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <FileTextIcon className="h-6 w-6" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-slate-900">Resume / Curriculum Vitae</h3>
                <p className="mt-1 text-xs text-slate-500">PDF or Word document format</p>
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition"
                >
                  View Attachment
                </a>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <FileTextIcon className="h-6 w-6" />
                </span>
                <p className="mt-3 text-xs font-medium text-slate-500">No Resume uploaded yet.</p>
              </div>
            )}

            {/* Links Block */}
            {profile.links && (profile.links.linkedIn || profile.links.gitHub || profile.links.portfolio) && (
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Online Profiles</h3>
                <div className="mt-3 space-y-2">
                  {profile.links.linkedIn && (
                    <a
                      href={profile.links.linkedIn}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <LinkedinIcon className="h-4 w-4 text-slate-400" />
                      LinkedIn
                    </a>
                  )}
                  {profile.links.gitHub && (
                    <a
                      href={profile.links.gitHub}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <GithubIcon className="h-4 w-4 text-slate-400" />
                      GitHub
                    </a>
                  )}
                  {profile.links.portfolio && (
                    <a
                      href={profile.links.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <GlobeIcon className="h-4 w-4 text-slate-400" />
                      Portfolio Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 5: Core Skills List */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-base font-bold text-slate-900 mb-4">Core Skills</h2>
            {profile.skills.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No skills cataloged.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} tone="brand">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Completeness Index */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <BrainCircuitIcon className="h-4 w-4 text-brand-600" />
              Completeness Index
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-brand-600 rounded-full"
                  style={{ width: `${profile.completenessPercent}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-700">{profile.completenessPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
