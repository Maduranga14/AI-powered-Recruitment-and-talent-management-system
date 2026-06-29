import React from 'react'
import ProfileMatchCard from '../components/aiinsights/ProfileMatchCard'
import SkillGapAnalysis from '../components/aiinsights/SkillGapAnalysis'
import TopAIMatchesCard from '../components/aiinsights/TopAIMatchesCard'
import InterviewReadinessCard from '../components/aiinsights/InterviewReadinessCard'
import ResumeInsightsCard from '../components/aiinsights/ResumeInsightsCard'
import PerformanceStatsCard from '../components/aiinsights/PerformanceStatsCard'

export default function AIInsights() {
    return (
        <div className="grid grid-cols-[1fr_300px] gap-5 items-start">
            <div className="flex flex-col gap-5">
                <ProfileMatchCard />
                <SkillGapAnalysis />
                <TopAIMatchesCard />
            </div>
            <div className="flex flex-col gap-5">
                <InterviewReadinessCard score={88} />
                <ResumeInsightsCard />
                <PerformanceStatsCard />
            </div>
        </div>
    );
}
