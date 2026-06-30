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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('candidate');
  const [activePage, setActivePage] = useState('dashboard');
  const [recruiterPage, setRecruiterPage] = useState('r-dashboard');

  const handleLogin = (selectedRole) => {
    setRole(selectedRole);
    setIsLoggedIn(true);
    setActivePage('dashboard');
    setRecruiterPage('r-dashboard');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  if (role == 'candidate') {
    const renderCandidatePage = () => {
      switch (activePage) {
        case "dashboard": return <Dashboard setActivePage={setActivePage} />
        case "applications": return <MyApplications />;
        case "jobsearch": return <JobSearch />
        case "interviews": return <Interviews />
        case "aiinsights": return <AIInsights />
      }
    };
    return (
      <Layout activePage={activePage} setActivePage={setActivePage}>
        {renderCandidatePage()}
      </Layout>
    )
  }

  const renderRecruiterPage = () => {
    switch (recruiterPage) {
      case 'r-dashboard': return <RecruiterDashboard setActivePage={setRecruiterPage} />
      case 'r-jobmanagement': return <JobManagement />
    }
  }

  return (
    <RecriterLayout activePage={recruiterPage} setActivePage={setRecruiterPage}>
      {renderRecruiterPage()}
    </RecriterLayout>
  );
}
