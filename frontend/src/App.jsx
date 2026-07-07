import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MyApplications from './pages/MyApplications';
import JobSearch from './pages/JobSearch';
import AIInsights from './pages/AIInsights';
import Interviews from './pages/Interviews';

import RecriterLayout from './recruiter/RecriterLayout';
import RecruiterDashboard from './recruiter/pages/RecruiterDashboard';
import JobManagement from './recruiter/pages/JobManagement';
import Applications from './recruiter/pages/Applications';
import InterviewManagement from './recruiter/pages/InterviewManagement';
import CandidateSearch from './recruiter/pages/CandidateSearch';
import ReportsAnalytics from './recruiter/pages/ReportAnalytics';

import HiringManagerLayout from './hiringmanager/HiringManagerLayout';
import HMDashboard from './hiringmanager/pages/HMDashboard';
import HMReviews from './hiringmanager/pages/HMReviews';
import HMInterviews from './hiringmanager/pages/HMInterviews';
import HMAnalytics from './hiringmanager/pages/HMAnalytics';
import HMAIInsights from './hiringmanager/pages/HMAIInsights';
import HMSettings from './hiringmanager/pages/HMSettings';

import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import UserManagement from './admin/pages/UserManagement';
import RolesPermissions from './admin/pages/RolesPermissions';
import RecruitmentAnalytics from './admin/pages/RecruitmentAnalytics';
import OrganizationDepartments from './admin/pages/OrganizationDepartments';
import AdminSettings from './admin/pages/AdminSettings';
  
function AppInner() {
  const { user, isLoading, logout } = useAuth();

  const [page, setPage] = useState('login'); 
  const [activePage, setActivePage] = useState('dashboard');
  const [recruiterPage, setRecruiterPage] = useState('r-dashboard');
  const [adminPage, setAdminPage] = useState('admin-dashboard');

  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <svg className="animate-spin text-blue-600" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    );
  }

  if (!user) {
    if (page === 'register') {
      return (
        <Register
          onLogin={(role, userData) => {
            setActivePage('dashboard');
          }}
          onGoToLogin={() => setPage('login')}
        />
      );
    }
    return (
      <Login
        onLogin={(role, userData) => {
          // Set the initial page based on role
          if (role === 'hiringmanager') setActivePage('hm-dashboard');
          else if (role === 'admin') setAdminPage('admin-dashboard');
          else if (role === 'recruiter') setRecruiterPage('r-dashboard');
          else setActivePage('dashboard');
        }}
        onGoToRegister={() => setPage('register')}
      />
    );
  }

  
  const role = user.role?.toLowerCase();

  
  if (role === 'admin') {
    const renderAdminPage = () => {
      switch (adminPage) {
        case 'admin-dashboard': return <AdminDashboard />;
        case 'admin-usermanagement': return <UserManagement />;
        case 'admin-roles': return <RolesPermissions />;
        case 'admin-analytics': return <RecruitmentAnalytics />;
        case 'admin-orgdepts': return <OrganizationDepartments />;
        case 'admin-settings': return <AdminSettings />;
        default: return <AdminDashboard />;
      }
    };
    return (
      <AdminLayout activePage={adminPage} setActivePage={setAdminPage} user={user} onLogout={logout}>
        {renderAdminPage()}
      </AdminLayout>
    );
  }

  
  if (role === 'candidate') {
    const renderCandidatePage = () => {
      switch (activePage) {
        case 'dashboard': return <Dashboard setActivePage={setActivePage} />;
        case 'applications': return <MyApplications />;
        case 'jobsearch': return <JobSearch />;
        case 'interviews': return <Interviews />;
        case 'aiinsights': return <AIInsights />;
        default: return <Dashboard setActivePage={setActivePage} />;
      }
    };
    return (
      <Layout activePage={activePage} setActivePage={setActivePage} user={user} onLogout={logout}>
        {renderCandidatePage()}
      </Layout>
    );
  }

  
  if (role === 'hiringmanager') {
    const renderHiringManagerPage = () => {
      switch (activePage) {
        case 'hm-dashboard': return <HMDashboard setActivePage={setActivePage} />;
        case 'hm-reviews': return <HMReviews />;
        case 'hm-interviews': return <HMInterviews />;
        case 'hm-analytics': return <HMAnalytics />;
        case 'hm-aiinsights': return <HMAIInsights />;
        case 'hm-settings': return <HMSettings />;
        default: return <HMDashboard setActivePage={setActivePage} />;
      }
    };
    return (
      <HiringManagerLayout activePage={activePage} setActivePage={setActivePage} user={user} onLogout={logout}>
        {renderHiringManagerPage()}
      </HiringManagerLayout>
    );
  }

  
  const renderRecruiterPage = () => {
    switch (recruiterPage) {
      case 'r-dashboard': return <RecruiterDashboard setActivePage={setRecruiterPage} />;
      case 'r-jobmanagement': return <JobManagement />;
      case 'r-applications': return <Applications />;
      case 'r-interviewmanagement': return <InterviewManagement />;
      case 'r-candidatesearch': return <CandidateSearch />;
      case 'r-reports': return <ReportsAnalytics />;
      default: return <RecruiterDashboard setActivePage={setRecruiterPage} />;
    }
  };
  return (
    <RecriterLayout activePage={recruiterPage} setActivePage={setRecruiterPage} user={user} onLogout={logout}>
      {renderRecruiterPage()}
    </RecriterLayout>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
