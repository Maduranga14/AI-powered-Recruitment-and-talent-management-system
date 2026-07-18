import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BellIcon,
  Building2Icon,
  FileCheck2Icon,
  LayoutDashboardIcon,
  MenuIcon,
  ScaleIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersRoundIcon,
  XIcon,
  LogOutIcon,
  ChevronDownIcon,
  BriefcaseIcon,
  type LucideIcon } from
'lucide-react';
import { ClockIcon } from 'lucide-react';
export type AdminView =
'overview' |
'people' |
'organizations' |
'departments' |
'moderation' |
'pending-approvals' |
'audit-settings';
interface AdminShellProps {
  activeView: AdminView;
  moderationCount: number;
  onViewChange: (view: AdminView) => void;
  children: React.ReactNode;
}
interface NavigationItem {
  id: AdminView;
  label: string;
  icon: LucideIcon;
  badge?: boolean;
}
const navigation: NavigationItem[] = [
{
  id: 'overview',
  label: 'Overview',
  icon: LayoutDashboardIcon
},
{
  id: 'people',
  label: 'People',
  icon: UsersRoundIcon
},
{
  id: 'pending-approvals',
  label: 'Pending Approvals',
  icon: ClockIcon,
  badge: true
},
{
  id: 'organizations',
  label: 'Organizations',
  icon: Building2Icon
},
{
  id: 'departments',
  label: 'Departments',
  icon: Building2Icon
},
{
  id: 'moderation',
  label: 'Moderation',
  icon: FileCheck2Icon,
  badge: true
},
{
  id: 'audit-settings',
  label: 'Audit & settings',
  icon: Settings2Icon
}];

export function AdminShell({
  activeView,
  moderationCount,
  onViewChange,
  children
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return 'AD';
    return user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const changeView = (view: AdminView) => {
    onViewChange(view);
    setMobileOpen(false);
  };
  const navigationContent = (compact = false) =>
  <nav
    aria-label="Administrator workspace"
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
          `relative flex min-w-14 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${active ? 'text-brand-700' : 'text-slate-500'}` :
          `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
          }>
          
            <Icon className="h-5 w-5" />
            <span className={compact ? 'truncate' : ''}>{label}</span>
            {badge && moderationCount > 0 &&
          <span
            className={
            compact ?
            'absolute right-0 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] text-white' :
            'ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700'
            }>
            
                {moderationCount}
              </span>
          }
          </button>);

    })}
    </nav>;

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        <button
          onClick={() => changeView('overview')}
          className="flex items-center gap-2 rounded-xl px-2 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Talenta Admin home">
          
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ShieldCheckIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-lg font-extrabold tracking-tight">
              Talenta
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-accent-700">
              Admin console
            </span>
          </span>
        </button>
        <div className="mt-8">{navigationContent()}</div>
        <section
          className="mt-auto rounded-2xl bg-slate-900 p-4 text-white"
          aria-label="Platform safeguards">
          
          <div className="flex items-center gap-2 text-sm font-bold">
            <ScaleIcon className="h-4 w-4 text-accent-400" /> Governance pulse
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-300">
            {moderationCount} moderation items need a documented platform
            decision.
          </p>
          <button
            onClick={() => changeView('moderation')}
            className="mt-3 text-xs font-bold text-white underline decoration-accent-400 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            
            Open review queue
          </button>
        </section>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-lg sm:px-6 lg:px-8">
          <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
              aria-label="Open administrator navigation">
              
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="hidden lg:block">
              <p className="text-xs font-medium text-slate-400">
                Platform operations
              </p>
              <p className="text-sm font-bold text-slate-700">
                Governance workspace
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => changeView('moderation')}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Open moderation queue">
                
                <BellIcon className="h-5 w-5" />
                {moderationCount > 0 &&
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
                }
              </button>
              <button
                onClick={() => changeView('audit-settings')}
                className="hidden items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:inline-flex">
                
                <ShieldCheckIcon className="h-4 w-4" /> Safeguards
              </button>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 text-left hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label="Admin account menu"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}>
                  
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-100 text-sm font-extrabold text-accent-700">
                    {getInitials()}
                  </span>
                  
                  <span className="hidden text-sm font-semibold text-slate-700 sm:block">
                    {user?.name.split(' ')[0] || "Admin"}
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
                        className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lift"
                        role="menu">
                        <div className="px-3 py-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {user?.name || "System Admin"}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {user?.email || "admin@talentportal.com"}
                          </p>
                        </div>
                        <div className="my-1 h-px bg-slate-100" />
                        <button
                          onClick={() => {
                            changeView('overview');
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                          role="menuitem">
                          <LayoutDashboardIcon className="h-4 w-4" /> Dashboard
                        </button>
                        <button
                          onClick={() => {
                            navigate('/jobs');
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                          role="menuitem">
                          <BriefcaseIcon className="h-4 w-4" /> Find Jobs
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
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
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 lg:hidden">
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
            className="absolute inset-0 w-full bg-slate-900/40" />
          
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
            className="relative flex h-full w-72 flex-col bg-white p-4 shadow-2xl">
            
              <div className="flex items-center justify-between">
                <button
                onClick={() => changeView('overview')}
                className="flex items-center gap-2 font-display font-extrabold">
                
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <ShieldCheckIcon className="h-5 w-5" />
                  </span>
                  Talenta Admin
                </button>
                <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Close navigation">
                
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-8">{navigationContent()}</div>
              <button
                onClick={handleLogout}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                <LogOutIcon className="h-4 w-4" /> Log out
              </button>
              <button
              onClick={() => changeView('moderation')}
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              
                <SparklesIcon className="h-4 w-4" /> Review queue
              </button>
            </motion.aside>
          </div>
        }
      </AnimatePresence>
    </div>);

}