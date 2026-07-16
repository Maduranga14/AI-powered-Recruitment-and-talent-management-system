import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { Landing } from './pages/Landing';
import { Jobs } from './pages/Jobs';
import { JobDetail } from './pages/JobDetail';
import { Companies } from './pages/Companies';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Recruiter } from './pages/Recruiter';
import { HiringManager } from './pages/HiringManager';
import { Admin } from './pages/Admin';
function Layout() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isInternalWorkspace =
  pathname === '/recruiter' ||
  pathname === '/hiring-manager' ||
  pathname === '/admin';
  if (pathname === '/recruiter') {
    return <Recruiter />;
  }
  if (pathname === '/hiring-manager') {
    return <HiringManager />;
  }
  if (pathname === '/admin') {
    return <Admin />;
  }
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      {!isAuthPage && <Navbar />}
      <main className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recruiter" element={<Recruiter />} />
          <Route path="/hiring-manager" element={<HiringManager />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      {!isAuthPage && !isInternalWorkspace && <Footer />}
    </div>);

}
export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout />
      </BrowserRouter>
    </AuthProvider>);

}