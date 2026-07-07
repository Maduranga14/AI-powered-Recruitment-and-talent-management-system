import React from 'react';
import HiringManagerSidebar from './HiringManagerSidebar';
import HiringManagerTopbar from './HiringManagerTopbar';
import Footer from '../components/Footer';

export default function HiringManagerLayout({ activePage, setActivePage, children, user, onLogout }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <HiringManagerSidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="ml-[220px] flex-1 flex flex-col min-w-0">
        <HiringManagerTopbar user={user} onLogout={onLogout} />
        <main className="flex-1 p-7">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
