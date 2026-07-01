import React from 'react';
import HMWelcomeBanner from '../components/dashboard/HMWelcomeBanner';
import HMStatCard from '../components/dashboard/HMStatCard';
import CandidateReviewTable from '../components/dashboard/CandidateReviewTable';
import AITalentRecs from '../components/dashboard/AITalentRecs';
import HiringVelocity from '../components/dashboard/HiringVelocity';
import { hmStats, candidateReviewData, aiTalentRecs, hiringVelocity } from '../data/hmDashboardData';

export default function HMDashboard({ setActivePage }) {
  return (
    <div className="flex flex-col gap-6">
      <HMWelcomeBanner />

      
      <div className="grid grid-cols-4 gap-4">
        {hmStats.map(stat => (
          <HMStatCard key={stat.id} {...stat} />
        ))}
      </div>

     
      <div className="grid grid-cols-[1fr_300px] gap-6">
        
        <CandidateReviewTable
          candidates={candidateReviewData}
          onExport={() => {}}
          onAdd={() => {}}
        />

        
        <div className="flex flex-col gap-4">
          <AITalentRecs
            recs={aiTalentRecs}
            onViewAll={() => setActivePage('hm-aiinsights')}
          />
          <HiringVelocity data={hiringVelocity} />
        </div>
      </div>
    </div>
  );
}
