import React from 'react'
import RecruiterSidebar from './RecruiterSidebar'
import RecruiterTopbar from './RecruiterTopbar'
import Footer from '../components/Footer'

export default function RecriterLayout({ activePage, setActivePage, children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
        <RecruiterSidebar activePage={activePage} setActivePage={setActivePage} />
        <div className="ml-[220px] flex-1 flex flex-col min-w-0">
            <RecruiterTopbar />
            <main className='flex-1 p-7'>{children}</main>
            <Footer />
        </div>
    </div>
  )
}
