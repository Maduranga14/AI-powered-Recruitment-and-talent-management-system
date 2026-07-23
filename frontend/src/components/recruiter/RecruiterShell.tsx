import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BellIcon,
  BriefcaseBusinessIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  InboxIcon,
  LayoutDashboardIcon,
  MenuIcon,
  PlusIcon,
  SparklesIcon,
  UsersRoundIcon,
  XIcon,
  LogOutIcon,
  BriefcaseIcon,
  UserCheckIcon,
  Building2Icon } from
'lucide-react';
import { Button } from '../ui/Button';
export type RecruiterView =
'overview' |
'jobs' |
'candidates' |
'schedule' |
'inbox' |
'hiring-managers' |
'departments';
interface RecruiterShellProps {
  activeView: RecruiterView;
  onViewChange: (view: RecruiterView) => void;
  onCreateJob: () => void;
  children: React.ReactNode;
}
const navigation: {
  id: RecruiterView;
  label: string;
  icon: typeof LayoutDashboardIcon;
  badge?: string;
}[] = [
{
  id: 'overview',
  label: 'Overview',
  icon: LayoutDashboardIcon
},
{
  id: 'jobs',
  label: 'Jobs',
  icon: BriefcaseBusinessIcon
},
{
  id: 'candidates',
  label: 'Candidates',
  icon: UsersRoundIcon
},
{
  id: 'hiring-managers',
  label: 'Hiring Managers',
  icon: UserCheckIcon
},
{
  id: 'departments',
  label: 'Departments',
  icon: Building2Icon
},
{
  id: 'schedule',
  label: 'Interviews',
  icon: CalendarDaysIcon
},
{
  id: 'inbox',
  label: 'Inbox',
  icon: InboxIcon,
  badge: '2'
}];

export function RecruiterShell({
  activeView,
  onViewChange,
  onCreateJob,
  children
}: RecruiterShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const setView = (view: RecruiterView) => {
    onViewChange(view);
    setMobileOpen(false);
  };
  const nav = (compact = false) =>
  <nav
    aria-label="Recruiter workspace"
    className={compact ? 'flex items-center justify-around' : 'space-y-1'}>
    
      {navigation.map(({ id, label, icon: Icon, badge }) => {
      const active = activeView === id;
      return (
        <button
          key={id}
          onClick={() => setView(id)}
          className={
          compact ?
          `relative flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors ${active ? 'text-teal-300' : 'text-slate-400'}` :
          `flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${active ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`
          }
          aria-current={active ? 'page' : undefined}>
          
            <Icon className="h-5 w-5" />
            <span>{label}</span>
            {badge &&
          <span
            className={
            compact ?
            'absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] text-white font-bold' :
            'ml-auto rounded-full bg-brand-500/30 border border-brand-400/30 px-2 py-0.5 text-[10px] text-brand-200 font-bold'
            }>
            
                {badge}
              </span>
          }
          </button>);

    })}
    </nav>;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-800 bg-slate-950 p-4 text-white lg:flex">
        <button
          onClick={() => setView('overview')}
          className="flex items-center gap-2.5 px-2 py-2 text-left"
          aria-label="Talenta Recruit home">
          
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-brand-600 text-white shadow-md shadow-brand-500/20">
            <SparklesIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-lg font-black tracking-tight text-white">
              Talenta
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-teal-400">
              Recruit
            </span>
          </span>
        </button>
        <div className="mt-8">{nav()}</div>
        <div className="mt-auto rounded-2xl bg-gradient-to-br from-slate-900 to-brand-950 p-4 text-white border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-teal-300">
            <SparklesIcon className="h-4 w-4 text-teal-400 animate-pulse" /> AI Recruiting Brief
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-300">
            12 candidates need a decision this week. Keep momentum on your top
            roles.
          </p>
          <button
            onClick={() => setView('candidates')}
            className="mt-3 text-xs font-bold text-teal-300 hover:text-white underline decoration-teal-400 underline-offset-4 transition">
            
            Review candidates
          </button>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 h-16 border-b border-slate-800/80 bg-slate-900/90 px-4 text-white backdrop-blur-xl sm:px-6 lg:px-8 shadow-lg">
          <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800 lg:hidden"
              aria-label="Open recruiter navigation">
              
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="hidden min-w-0 lg:block">
              <p className="text-xs font-medium text-slate-400">
                {user?.organizationName || 'Talenta Workspace'}
              </p>
              <p className="text-sm font-bold text-white">
                Recruiting Workspace
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => onViewChange('inbox')}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Open notifications">
                
                <BellIcon className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-teal-400 ring-2 ring-slate-900" />
              </button>
              <Button
                size="sm"
                className="hidden sm:inline-flex bg-brand-600 hover:bg-brand-500 text-white font-bold"
                onClick={onCreateJob}>
                
                <PlusIcon className="h-4 w-4" /> Create job
              </Button>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 text-left hover:bg-slate-800 border border-slate-700/80 bg-slate-800/60"
                  aria-label="Recruiter account menu"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}>
                  
                  <img
                    src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff&bold=true&size=96"}
                    alt=""
                    className="h-8 w-8 rounded-lg object-cover" />
                  
                  <span className="hidden text-sm font-semibold text-white sm:block">
                    {user?.name ? user.name.split(' ')[0] : "User"}
                  </span>
                  <ChevronDownIcon className="hidden h-4 w-4 text-slate-400 sm:block" />
                </button>
                <AnimatePresence>
                  {menuOpen &&
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl backdrop-blur-2xl text-white"
                        role="menu">
                        <div className="px-3 py-2">
                          <p className="text-sm font-bold text-white">
                            {user?.name || "User"}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {user?.email || "user@example.com"}
                          </p>
                        </div>
                        <div className="my-1 h-px bg-slate-800" />
                        <button
                          onClick={() => {
                            setView('overview');
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
                          role="menuitem">
                          <LayoutDashboardIcon className="h-4 w-4 text-teal-400" /> Dashboard
                        </button>
                        <button
                          onClick={() => {
                            navigate('/jobs');
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
                          role="menuitem">
                          <BriefcaseIcon className="h-4 w-4 text-teal-400" /> Find Jobs
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
                          role="menuitem">
                          <LogOutIcon className="h-4 w-4" /> Log out
                        </button>
                      </motion.div>
                    </>
                  }
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 lg:hidden">
        {nav(true)}
      </nav>

      <AnimatePresence>
        {mobileOpen &&
        <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="absolute inset-0 w-full bg-slate-900/40" />
          
            <motion.aside
            initial={{
              x: -280
            }}
            animate={{
              x: 0
            }}
            exit={{
              x: -280
            }}
            transition={{
              type: 'tween',
              duration: 0.2
            }}
            className="relative flex h-full w-72 flex-col bg-white p-4 shadow-2xl">
            
              <div className="flex items-center justify-between">
                <button
                onClick={() => setView('overview')}
                className="flex items-center gap-2">
                
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                    <SparklesIcon className="h-5 w-5" />
                  </span>
                  <span className="font-display font-extrabold">
                    Talenta Recruit
                  </span>
                </button>
                <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close navigation">
                
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-8">{nav()}</div>
              <button
                onClick={handleLogout}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                <LogOutIcon className="h-4 w-4" /> Log out
              </button>
              <Button
              className="mt-auto"
              fullWidth
              onClick={() => {
                onCreateJob();
                setMobileOpen(false);
              }}>
              
                <PlusIcon className="h-4 w-4" /> Create job
              </Button>
            </motion.aside>
          </div>
        }
      </AnimatePresence>
    </div>);

}