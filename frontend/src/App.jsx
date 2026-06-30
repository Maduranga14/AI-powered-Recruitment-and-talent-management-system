import React, { useState } from 'react'
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MyApplications from './pages/MyApplications';
import JobSearch from './pages/JobSearch';
import AIInsights from './pages/AIInsights';
import Interviews from './pages/Interviews';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard setActivePage={setActivePage} />
      case "applications": return <MyApplications />;
      case "jobsearch": return <JobSearch />
      case "interviews": return <Interviews />
      case "aiinsights": return <AIInsights />
    }
  }

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </Layout>
  )
}
