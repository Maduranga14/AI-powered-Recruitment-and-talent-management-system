import React from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon } from 'lucide-react';
const columns = [
{
  title: 'For candidates',
  links: [
  {
    label: 'Browse jobs',
    to: '/jobs'
  },
  {
    label: 'AI recommendations',
    to: '/dashboard'
  },
  {
    label: 'Career resources',
    to: '/jobs'
  },
  {
    label: 'Salary insights',
    to: '/jobs'
  }]

},
{
  title: 'For employers',
  links: [
  {
    label: 'Post a job',
    to: '/'
  },
  {
    label: 'Recruiter suite',
    to: '/'
  },
  {
    label: 'Pricing',
    to: '/'
  },
  {
    label: 'Talent analytics',
    to: '/'
  }]

},
{
  title: 'Company',
  links: [
  {
    label: 'About',
    to: '/'
  },
  {
    label: 'Careers',
    to: '/jobs'
  },
  {
    label: 'Blog',
    to: '/'
  },
  {
    label: 'Contact',
    to: '/'
  }]

}];

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-brand-600 text-white shadow-md shadow-brand-500/20">
                <SparklesIcon className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-black text-white">
                Wayfare <span className="text-teal-400 font-semibold text-sm">Global</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-slate-400">
              Intelligent career navigation and hiring platform connecting visionaries with top teams worldwide.
            </p>
          </div>
          {columns.map((col) =>
          <div key={col.title}>
              <h4 className="text-sm font-bold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) =>
              <li key={link.label}>
                    <Link
                  to={link.to}
                  className="text-sm text-slate-400 transition-colors hover:text-teal-300">
                  
                      {link.label}
                    </Link>
                  </li>
              )}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-6 sm:flex-row">
          <p className="text-sm text-slate-500">
            © 2026 Wayfare Global, Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link to="/" className="hover:text-slate-300">
              Privacy
            </Link>
            <Link to="/" className="hover:text-slate-300">
              Terms
            </Link>
            <Link to="/" className="hover:text-slate-300">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>);

}