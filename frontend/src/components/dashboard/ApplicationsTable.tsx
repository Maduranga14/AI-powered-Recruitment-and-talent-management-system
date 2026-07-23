import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FileSearchIcon } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Application, ApplicationStatus } from '../../context/AuthContext';
import type { InterviewDto } from '../../services/api';

const statusTone: Record<
  ApplicationStatus,
  'blue' | 'amber' | 'brand' | 'green' | 'red'
> = {
  Applied: 'blue',
  'In Review': 'amber',
  Interview: 'brand',
  Offer: 'green',
  Rejected: 'red',
};

const STAGES: ApplicationStatus[] = [
  'Applied',
  'In Review',
  'Interview',
  'Offer',
];

function Stepper({ status }: { status: ApplicationStatus }) {
  if (status === 'Rejected') {
    return (
      <span className="text-xs font-semibold text-red-500">
        Not moving forward
      </span>
    );
  }
  const currentIndex = STAGES.indexOf(status);
  return (
    <div className="flex items-center gap-1.5" aria-label={`Stage: ${status}`}>
      {STAGES.map((s, i) => (
        <span
          key={s}
          title={s}
          className={`h-1.5 w-6 rounded-full ${
            i <= currentIndex ? 'bg-brand-600' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

function appDisplay(app: Application) {
  const title = app.jobTitle ?? 'Unknown role';
  const company = app.jobCompany ?? 'Unknown company';
  const logo =
    app.jobCompanyLogo ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=4f46e5&color=fff&bold=true&size=96`;
  return { title, company, logo };
}

function interviewHint(
  app: Application,
  interviews: InterviewDto[]
): { label: string; tone: 'amber' | 'green' | 'brand' } | null {
  const match = interviews.find((i) => i.jobPostingId === app.jobId);
  if (!match) return null;
  if (match.rescheduleRequested) {
    return { label: 'Reschedule pending', tone: 'amber' };
  }
  if (match.lastRescheduledAt) {
    return { label: 'Interview updated', tone: 'green' };
  }
  return { label: 'Interview scheduled', tone: 'brand' };
}

export function ApplicationsTable({
  applications,
  interviews = [],
}: {
  applications: Application[];
  interviews?: InterviewDto[];
}) {
  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 py-16 text-center shadow-xl">
        <FileSearchIcon className="mx-auto h-10 w-10 text-slate-500" />
        <p className="mt-3 font-semibold text-white">No applications yet</p>
        <p className="mt-1 text-sm text-slate-400">
          Start applying to track your progress here.
        </p>
        <Link to="/jobs">
          <Button className="mt-5 bg-brand-600 hover:bg-brand-500 text-white font-bold">Browse jobs</Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl text-white">
      <table className="hidden w-full text-left sm:table">
        <thead>
          <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/60">
            <th className="px-5 py-3.5">Role</th>
            <th className="px-5 py-3.5">Stage</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5">Applied</th>
            <th className="px-5 py-3.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {applications.map((app) => {
            const { title, company, logo } = appDisplay(app);
            const hint = interviewHint(app, interviews);
            return (
              <tr
                key={app.jobId}
                className="transition-colors hover:bg-slate-800/60"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img src={logo} alt="" className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-700" />
                    <div>
                      <p className="text-sm font-bold text-white">
                        {title}
                      </p>
                      <p className="text-xs text-slate-400">{company}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Stepper status={app.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={statusTone[app.status]}>{app.status}</Badge>
                    {hint && hint.label !== app.status && (
                      <Badge tone={hint.tone}>{hint.label}</Badge>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-slate-400">
                  {formatDistanceToNow(app.appliedAt, { addSuffix: true })}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    to={`/jobs/${app.jobId}`}
                    className="text-sm font-bold text-teal-300 hover:text-white hover:underline transition"
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="divide-y divide-slate-100 sm:hidden">
        {applications.map((app) => {
          const { title, company, logo } = appDisplay(app);
          const hint = interviewHint(app, interviews);
          return (
            <Link
              key={app.jobId}
              to={`/jobs/${app.jobId}`}
              className="flex items-center gap-3 p-4"
            >
              <img src={logo} alt="" className="h-10 w-10 rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {title}
                </p>
                <p className="text-xs text-slate-500">{company}</p>
                <div className="mt-2">
                  <Stepper status={app.status} />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge tone={statusTone[app.status]}>{app.status}</Badge>
                {hint && hint.label !== app.status && (
                  <Badge tone={hint.tone}>{hint.label}</Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
