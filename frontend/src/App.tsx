import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { AiAssistant } from './components/ai/AiAssistant';
import { Landing } from './pages/Landing';
import { Jobs } from './pages/Jobs';
import { JobDetail } from './pages/JobDetail';
import { Companies } from './pages/Companies';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RegisterHiringManager } from './pages/RegisterHiringManager';
import { Dashboard } from './pages/Dashboard';
import { Recruiter } from './pages/Recruiter';
import { HiringManager } from './pages/HiringManager';
import { Admin } from './pages/Admin';
import { CandidateProfileView } from './pages/CandidateProfileView';

function Layout() {
  const { pathname } = useLocation();
  const { user, isAuthenticated } = useAuth();

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/register-hm';
  const isInternalWorkspace =
    pathname === '/recruiter' ||
    pathname === '/hiring-manager' ||
    pathname === '/admin' ||
    pathname === '/dashboard' ||
    pathname.startsWith('/candidate-profile/');

  // Role is stored in user.title from the backend JWT response
  const getRole = (user: { title?: string; email?: string } | null) => {
    if (!user) return null;
    const r = (user.title || '').toLowerCase();
    if (r === 'admin') return 'admin';
    if (r === 'recruiter') return 'recruiter';
    if (r === 'hiringmanager') return 'hiringmanager';
    // fallback: email-based heuristic for legacy sessions
    const email = (user.email || '').toLowerCase();
    if (email.includes('admin')) return 'admin';
    if (email.includes('recruiter')) return 'recruiter';
    if (email.includes('manager')) return 'hiringmanager';
    return 'candidate';
  };

  if (isInternalWorkspace) {
    if (!isAuthenticated || !user) {
      return <Navigate to={`/login?redirect=${encodeURIComponent(pathname)}`} replace />;
    }

    const role = getRole(user);

    if (pathname === '/admin' && role !== 'admin') {
      return <Navigate to={role === 'recruiter' ? '/recruiter' : role === 'hiringmanager' ? '/hiring-manager' : '/dashboard'} replace />;
    }
    if (pathname === '/recruiter' && role !== 'recruiter') {
      return <Navigate to={role === 'admin' ? '/admin' : role === 'hiringmanager' ? '/hiring-manager' : '/dashboard'} replace />;
    }
    if (pathname === '/hiring-manager' && role !== 'hiringmanager') {
      return <Navigate to={role === 'admin' ? '/admin' : role === 'recruiter' ? '/recruiter' : '/dashboard'} replace />;
    }
    if (pathname === '/dashboard' && role !== 'candidate') {
      return <Navigate to={role === 'admin' ? '/admin' : role === 'recruiter' ? '/recruiter' : '/hiring-manager'} replace />;
    }
    if (pathname.startsWith('/candidate-profile/')) {
      if (role !== 'recruiter' && role !== 'hiringmanager' && role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  if (pathname === '/recruiter') {
    return (
      <>
        <Recruiter />
        <AiAssistant />
      </>
    );
  }
  if (pathname === '/hiring-manager') {
    return (
      <>
        <HiringManager />
        <AiAssistant />
      </>
    );
  }
  if (pathname === '/admin') {
    return (
      <>
        <Admin />
        <AiAssistant />
      </>
    );
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
          <Route path="/register-hm" element={<RegisterHiringManager />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recruiter" element={<Recruiter />} />
          <Route path="/hiring-manager" element={<HiringManager />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/candidate-profile/:profileId" element={<CandidateProfileView />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      {!isAuthPage && !isInternalWorkspace && <Footer />}
      {!isAuthPage && <AiAssistant />}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}