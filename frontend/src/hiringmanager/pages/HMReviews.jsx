import React from 'react';
import EvaluationUpcoming from '../components/reviews/EvaluationUpcoming';
import SkillScoreCards from '../components/reviews/SkillScoreCards';
import CandidateScorePanel from '../components/reviews/CandidateScorePanel';
import AIEvaluationInsights from '../components/reviews/AIEvaluationInsights';
import { upcomingInterviewsReview, skillScores, featuredCandidate } from '../data/hmReviewsData';

export default function HMReviews({ setActivePage }) {
  return (
    <div className="flex flex-col gap-6">
     
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">Candidate Evaluation Hub</h1>
          <p className="text-gray-500 text-[13.5px] mt-1">Review interview performance and AI-driven decision metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="border border-gray-200 text-gray-700 text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Export Report
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Evaluation
          </button>
        </div>
      </div>

      
      <EvaluationUpcoming
        interviews={upcomingInterviewsReview}
        onViewAll={() => setActivePage('hm-interviews')}
      />

      
      <SkillScoreCards scores={skillScores} />

      
      <div className="grid grid-cols-[1fr_300px] gap-6">
        <CandidateScorePanel
          candidate={featuredCandidate}
          onSaveDraft={() => {}}
          onSubmit={() => {}}
        />
        <AIEvaluationInsights candidate={featuredCandidate} />
      </div>
    </div>
  );
}
