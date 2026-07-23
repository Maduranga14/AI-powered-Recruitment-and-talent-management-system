import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  MenuIcon,
  XIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  ChevronDownIcon } from
'lucide-react';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
const navLinks = [
{
  to: '/jobs',
  label: 'Find Jobs'
},
{
  to: '/companies',
  label: 'Companies'
},
{
  to: '/#how',
  label: 'How it works'
}];

function getUserAvatar(user: any): string {
  if (user?.photoUrl) {
    if (user.photoUrl.startsWith('http')) return user.photoUrl;
    return `http://localhost:5073${user.photoUrl.startsWith('/') ? '' : '/'}${user.photoUrl}`;
  }
  return user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff&bold=true&size=128&format=png`;
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };
  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    const email = user.email.toLowerCase();
    if (email.includes('admin')) return '/admin';
    if (email.includes('recruiter')) return '/recruiter';
    if (email.includes('manager')) return '/hiring-manager';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl text-white shadow-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo to="/" size="md" />

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) =>
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
            `rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${isActive && link.to.startsWith('/jobs') ? 'text-teal-300 bg-white/10 border border-white/10' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`
            }>
            
              {link.label}
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && user ?
          <div className="relative">
              <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-slate-800 border border-slate-700/80 bg-slate-800/60 shadow-sm"
              aria-haspopup="menu"
              aria-expanded={menuOpen}>
              
                <img
                src={getUserAvatar(user)}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-500/40" />
              
                <span className="text-sm font-bold text-slate-200">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-slate-400" />
              </button>
              <AnimatePresence>
                {menuOpen &&
              <>
                    <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)} />
                
                    <motion.div
                  initial={{
                    opacity: 0,
                    y: 6
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    y: 6
                  }}
                  className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-700/90 bg-slate-900 p-2 shadow-2xl backdrop-blur-2xl"
                  role="menu">
                  
                      <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-800/80 rounded-xl mb-1 border border-slate-700/60">
                        <img
                          src={getUserAvatar(user)}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-500/30"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white truncate">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-slate-400 font-medium">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="my-1 h-px bg-slate-800" />
                      <Link
                    to={getDashboardPath()}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition"
                    role="menuitem">
                    
                        <LayoutDashboardIcon className="h-4 w-4 text-teal-400" /> Dashboard
                      </Link>
                      <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
                    role="menuitem">
                    
                        <LogOutIcon className="h-4 w-4" /> Log out
                      </button>
                    </motion.div>
                  </>
              }
              </AnimatePresence>
            </div> :

          <>
              <Button variant="ghost" onClick={() => navigate('/login')} className="text-slate-200 hover:text-white hover:bg-slate-800">
                Log in
              </Button>
              <Button onClick={() => navigate('/register')} className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-5">Sign up</Button>
            </>
          }
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}>
          
          {mobileOpen ?
          <XIcon className="h-6 w-6" /> :

          <MenuIcon className="h-6 w-6" />
          }
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen &&
        <motion.div
          initial={{
            height: 0,
            opacity: 0
          }}
          animate={{
            height: 'auto',
            opacity: 1
          }}
          exit={{
            height: 0,
            opacity: 0
          }}
          className="overflow-hidden border-t border-slate-200 bg-white md:hidden">
          
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) =>
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100">
              
                  {link.label}
                </Link>
            )}
              <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                {isAuthenticated ?
              <>
                    <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate(getDashboardPath());
                  }}>
                  
                      Dashboard
                    </Button>
                    <Button
                  fullWidth
                  variant="outline"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}>
                  
                      Log out
                    </Button>
                  </> :

              <>
                    <Button
                  fullWidth
                  variant="outline"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/login');
                  }}>
                  
                      Log in
                    </Button>
                    <Button
                  fullWidth
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/register');
                  }}>
                  
                      Sign up
                    </Button>
                  </>
              }
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}