import React, { useState } from 'react'
import Login from './pages/Login';


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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('candidate');
  const [activePage, setActivePage] = useState('dashboard');
  const [recruiterPage, setRecruiterPage] = useState('r-dashboard');
  const [adminPage, setAdminPage] = useState('admin-dashboard');

  const handleLogin = (selectedRole) => {
    setRole(selectedRole);
    setIsLoggedIn(true);
    if (selectedRole === 'hiringmanager') {
      setActivePage('hm-dashboard');
    } else if (selectedRole === 'admin') {
      setAdminPage('admin-dashboard');
    } else {
      setActivePage('dashboard');
    }
    setRecruiterPage('r-dashboard');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
    return <Login onLogin={handleLogin} />;
  }

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
      <AdminLayout activePage={adminPage} setActivePage={setAdminPage}>
        {renderAdminPage()}
      </AdminLayout>
    );
  }

  if (role == 'candidate') {
    const renderCandidatePage = () => {
      switch (activePage) {
       
        case "dashboard": return <Dashboard setActivePage={setActivePage} />;
        case "applications": return <MyApplications />;
       
        
        case "jobsearch": return <JobSearch />;
        case "interviews": return <Interviews />;
        case "aiinsights": return <AIInsights />;
      }
    };
    return (
      <Layout activePage={activePage} setActivePage={setActivePage}>
        {renderCandidatePage()}
      </Layout>
    )
  }

  if (role == 'hiringmanager') {
    const renderHiringManagerPage = () => {
      switch (activePage) {
        case "hm-dashboard": return <HMDashboard setActivePage={setActivePage} />;
        case "hm-reviews": return <HMReviews />;
        case "hm-interviews": return <HMInterviews />;
        case "hm-analytics": return <HMAnalytics />;
        case "hm-aiinsights": return <HMAIInsights />;
        case "hm-settings": return <HMSettings />;
        default: return <HMDashboard setActivePage={setActivePage} />;
      }
    };
    return (
      <HiringManagerLayout activePage={activePage} setActivePage={setActivePage}>
        {renderHiringManagerPage()}
      </HiringManagerLayout>
    );
  }

  const renderRecruiterPage = () => {
    switch (recruiterPage) {
      case 'r-dashboard': return <RecruiterDashboard setActivePage={setRecruiterPage} />
      case 'r-jobmanagement': return <JobManagement />
      case 'r-applications': return <Applications />
      case 'r-interviewmanagement': return <InterviewManagement />
      case 'r-candidatesearch': return <CandidateSearch />;
      case 'r-reports': return <ReportsAnalytics />;
      default: return <RecruiterDashboard setActivePage={setRecruiterPage} />;
    }
  }

  return (
    <RecriterLayout activePage={recruiterPage} setActivePage={setRecruiterPage}>
      {renderRecruiterPage()}
    </RecriterLayout>
  );
}
