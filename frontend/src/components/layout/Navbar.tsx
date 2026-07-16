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
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="Talenta home">
          
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <SparklesIcon className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-slate-900">
            Talenta
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) =>
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive && link.to.startsWith('/jobs') ? 'text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
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
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-slate-100"
              aria-haspopup="menu"
              aria-expanded={menuOpen}>
              
                <img
                src={user.avatar}
                alt=""
                className="h-8 w-8 rounded-full" />
              
                <span className="text-sm font-semibold text-slate-700">
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
                  className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lift"
                  role="menu">
                  
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>
                      <div className="my-1 h-px bg-slate-100" />
                      <Link
                    to={getDashboardPath()}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    role="menuitem">
                    
                        <LayoutDashboardIcon className="h-4 w-4" /> Dashboard
                      </Link>
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
            </div> :

          <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button onClick={() => navigate('/register')}>Sign up</Button>
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