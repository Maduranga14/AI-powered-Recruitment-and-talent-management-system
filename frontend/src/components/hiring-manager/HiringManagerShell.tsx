import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BellIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  LayoutDashboardIcon,
  MenuIcon,
  SparklesIcon,
  UsersRoundIcon,
  XIcon,
  LogOutIcon,
  BriefcaseIcon,
  type LucideIcon } from
'lucide-react';
export type HiringManagerView =
'overview' |
'candidates' |
'feedback' |
'calendar';
interface HiringManagerShellProps {
  activeView: HiringManagerView;
  onViewChange: (view: HiringManagerView) => void;
  children: React.ReactNode;
}
interface NavigationItem {
  id: HiringManagerView;
  label: string;
  icon: LucideIcon;
  badge?: string;
}
const navigation: NavigationItem[] = [
{
  id: 'overview',
  label: 'Overview',
  icon: LayoutDashboardIcon
},
{
  id: 'candidates',
  label: 'My candidates',
  icon: UsersRoundIcon,
  badge: '2'
},
{
  id: 'feedback',
  label: 'Feedback',
  icon: ClipboardCheckIcon
},
{
  id: 'calendar',
  label: 'Interviews',
  icon: CalendarDaysIcon
}];

export function HiringManagerShell({
  activeView,
  onViewChange,
  children
}: HiringManagerShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeView = (view: HiringManagerView) => {
    onViewChange(view);
    setMobileOpen(false);
  };
  const navigationContent = (compact = false) =>
  <nav
    aria-label="Hiring manager workspace"
    className={compact ? 'flex items-center justify-around' : 'space-y-1'}>
    
      {navigation.map(({ id, label, icon: Icon, badge }) => {
      const active = activeView === id;
      return (
        <button
          key={id}
          onClick={() => changeView(id)}
          aria-current={active ? 'page' : undefined}
          className={
          compact ?
          `relative flex min-w-16 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${active ? 'text-teal-300' : 'text-slate-400'}` :
          `flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${active ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`
          }>
          
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
          onClick={() => changeView('overview')}
          className="flex items-center gap-2.5 px-2 py-2 text-left hover:opacity-90 transition-opacity"
          aria-label="Wayfare Manager home">
          
          <img src="/logo.png" alt="Wayfare Global" className="h-9 w-auto rounded-xl object-contain border border-slate-700/50 bg-slate-900/80 p-0.5" />
          <span>
            <span className="block font-display text-lg font-black tracking-tight text-white">
              Wayfare
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-teal-400">
              Manager
            </span>
          </span>
        </button>
        <div className="mt-8">{navigationContent()}</div>
        <section
          className="mt-auto rounded-2xl bg-gradient-to-br from-slate-900 to-brand-950 p-4 text-white border border-slate-800 shadow-xl"
          aria-label="Decision reminder">
          
          <div className="flex items-center gap-2 text-sm font-bold text-teal-300">
            <ClipboardCheckIcon className="h-4 w-4 text-teal-400 animate-pulse" /> Decision Focus
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-300">
            Two candidate conversations need your evidence before the next
            hiring sync.
          </p>
          <button
            onClick={() => changeView('feedback')}
            className="mt-3 text-xs font-bold text-teal-300 hover:text-white underline decoration-teal-400 underline-offset-4 transition">
            
            Complete feedback
          </button>
        </section>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 h-16 border-b border-slate-800/80 bg-slate-900/90 px-4 text-white backdrop-blur-xl sm:px-6 lg:px-8 shadow-lg">
          <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
              aria-label="Open hiring manager navigation">
              
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="hidden min-w-0 lg:block">
              <p className="text-xs font-medium text-slate-400">
                {user?.organizationName || 'Talenta Workspace'}
              </p>
              <p className="text-sm font-bold text-white">
                Hiring Manager Workspace
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => changeView('feedback')}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Review pending feedback">
                
                <BellIcon className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-teal-400 ring-2 ring-slate-900" />
              </button>
              <button
                onClick={() => changeView('feedback')}
                className="hidden items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-brand-600/30 transition-colors hover:bg-brand-500 sm:inline-flex">
                
                <ClipboardCheckIcon className="h-4 w-4" /> Give feedback
              </button>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 text-left hover:bg-slate-800 border border-slate-700/80 bg-slate-800/60"
                  aria-label="Hiring manager account menu"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}>
                  
                  <img
                    src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff&bold=true&size=96"}
                    alt=""
                    className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-700" />
                  
                  <span className="hidden text-sm font-bold text-white sm:block">
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
                        className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-1.5 text-white shadow-2xl backdrop-blur-2xl"
                        role="menu">
                        <div className="px-3 py-2">
                          <p className="text-sm font-bold text-white">
                            {user?.name || "User"}
                          </p>
                          <p className="truncate text-xs text-slate-400 font-medium">
                            {user?.email || "user@example.com"}
                          </p>
                        </div>
                        <div className="my-1 h-px bg-slate-800" />
                        <button
                          onClick={() => {
                            changeView('overview');
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                          role="menuitem">
                          <LayoutDashboardIcon className="h-4 w-4 text-teal-400" /> Dashboard
                        </button>
                        <button
                          onClick={() => {
                            navigate('/jobs');
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                          role="menuitem">
                          <BriefcaseIcon className="h-4 w-4 text-teal-400" /> Find Jobs
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-950/60"
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

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 lg:hidden">
        {navigationContent(true)}
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
            className="absolute inset-0 w-full bg-slate-950/70 backdrop-blur-md" />
          
            <motion.aside
            initial={{
              x: -288
            }}
            animate={{
              x: 0
            }}
            exit={{
              x: -288
            }}
            transition={{
              type: 'tween',
              duration: 0.2
            }}
            className="relative flex h-full w-72 flex-col border-r border-slate-800 bg-slate-900 p-4 text-white shadow-2xl">
            
              <div className="flex items-center justify-between">
                <button
                onClick={() => changeView('overview')}
                className="flex items-center gap-2 font-display font-extrabold text-white">
                
                  <img src="/logo.png" alt="Wayfare Global" className="h-9 w-auto rounded-xl object-contain border border-slate-700/50 bg-slate-900/80 p-0.5" />
                  Wayfare Manager
                </button>
                <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close navigation">
                
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-8">{navigationContent()}</div>
              <button
                onClick={handleLogout}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-950/60 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-900/80">
                <LogOutIcon className="h-4 w-4" /> Log out
              </button>
              <button
              onClick={() => changeView('feedback')}
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
              
                <ClipboardCheckIcon className="h-4 w-4" /> Give feedback
              </button>
            </motion.aside>
          </div>
        }
      </AnimatePresence>
    </div>);

}