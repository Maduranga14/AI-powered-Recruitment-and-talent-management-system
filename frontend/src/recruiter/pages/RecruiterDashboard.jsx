import RecruiterWelcomeBanner from '../components/dashboard/RecruiterWelcomeBanner'
import {
    dashboardStats, pipeline, aiTopMatches,
    recentApplications, todaySchedule, recentJobPostings,
} from '../data/recruiterDashboardData';
import RecruiterStatCard from '../components/ui/RecruiterStatCard';
import RecruitmentPipeline from '../components/dashboard/RecruitementPipeline';
import AITopMatches from '../components/dashboard/AITopMatches';
import RecentApplicationsTable from '../components/dashboard/RecentApplicationsTable';
import TodaySchedule from '../components/dashboard/TodaySchedule';
import RecentJobPostings from '../components/dashboard/RecentJobPostings';
import ConversionTrends from '../components/dashboard/ConversionTrends';

export default function RecruiterDashboard() {
  return (
    <div className="flex flex-col gap-6">
        <RecruiterWelcomeBanner />


        <div className="grid grid-cols-4 gap-4">
            {dashboardStats.map(stat => (
                <RecruiterStatCard key={stat.id} {...stat} />
            ))}
        </div>


        <div className="grid grid-cols-[1fr_280px] gap-6">
            <RecruitmentPipeline
                pipeline={pipeline}
                onViewReport={() => setActivePage('r-reports')}
            />
            <AITopMatches
                matches={aiTopMatches}
                onViewAll={() => setActivePage('r-candidatesearch')}
            />
        </div>


        <div className="grid grid-cols-[1fr_260px] gap-6">
            <RecentApplicationsTable applications={recentApplications} />
            <TodaySchedule schedule={todaySchedule} />
        </div>


        <div className="grid grid-cols-[1fr_1fr] gap-6">
            <RecentJobPostings
                postings={recentJobPostings}
                onViewAll={() => setActivePage('r-jobmanagement')}
            />
            <ConversionTrends />
        </div>
    </div>
  )
}
