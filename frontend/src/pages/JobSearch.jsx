import { useState } from 'react'
import { jobs } from "../data/jobSearchData";
import JobSearchFilters from '../components/jobsearch/JobSearchFilters'
import JobCard from '../components/jobsearch/JobCard'
import TopPicksSidebar from '../components/jobsearch/TopPicksSidebar'
import MarketInsights from '../components/jobsearch/MarketInsights';

export default function JobSearch() {
    const [likedJobs, setLikedJobs] = useState({ 3: true });
    const toggleLike = id => setLikedJobs(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <div className="flex flex-col gap-5">
            <JobSearchFilters resultCount={124} />
            <div className="grid grid-cols-[1fr_280px] gap-5 items-start">
                <div className="flex flex-col gap-4">
                    {jobs.map(job => <JobCard key={job.id} job={job} liked={!!likedJobs[job.id]} onToggleLike={toggleLike} />)}
                </div>
                <div className="flex flex-col gap-4">
                    <TopPicksSidebar />
                    <MarketInsights />
                </div>
            </div>
        </div>
    );
}
