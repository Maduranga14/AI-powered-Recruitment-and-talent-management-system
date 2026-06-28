import { statCards } from "../data/dashboardData";
import WelcomeBanner from '../components/dashboard/WelcomeBanner'
import StatCardGrid from '../components/ui/StatCardGrid'
import ActivityChart from '../components/dashboard/ActivityChart'
import UpcomingInterviews from '../components/dashboard/UpcommingInterviews'
import JobRecommendations from '../components/dashboard/JobRecommendations'
import ApplicationStatusTable from '../components/dashboard/ApplicationStatusTable'

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-6">
            <WelcomeBanner onViewMatches={() => setActivePage("jobsearch")} onUpdateProfile={() => { }} />
            <StatCardGrid cards={statCards} />
            <div className="grid grid-cols-[1fr_320px] gap-6">
                <ActivityChart />
                <UpcomingInterviews />
            </div>
            <JobRecommendations onSeeAll={() => setActivePage("jobsearch")} />
            <ApplicationStatusTable />
        </div>
    );
}
