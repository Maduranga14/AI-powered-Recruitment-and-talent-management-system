import React from 'react';
import InterviewCalendar from '../components/interviews/InterviewCalendar';
import UpcomingInterviewsList from '../components/interviews/UpcomingInterviewsList';
import { upcomingInterviews } from '../data/hmInterviewsData';

export default function HMInterviews() {
  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">Interview Schedule</h1>
          <p className="text-gray-500 text-[13.5px] mt-1">Manage your hiring pipeline and candidate meetings.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Schedule New Interview
        </button>
      </div>

    
      <div className="grid grid-cols-[1fr_320px] gap-6">
        <InterviewCalendar />
        <UpcomingInterviewsList interviews={upcomingInterviews} />
      </div>
    </div>
  );
}
