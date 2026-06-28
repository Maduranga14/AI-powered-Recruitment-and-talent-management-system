import MatchBadge from "../ui/MatchBadge";
import JobTag from "../ui/JobTag";
import { jobRecommendations } from "../../data/dashboardData";

export default function JobRecommendations({ onSeeAll }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-base font-bold text-gray-900">AI Job Recommendations</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Based on your skills in Product Design, UI/UX, and Design Systems.</p>
                </div>
                <a href="#" onClick={e => { e.preventDefault(); onSeeAll(); }} className="text-blue-600 text-sm font-semibold">See all recommendations</a>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {jobRecommendations.map((job, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2.5">
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-sm">{job.company[0]}</div>
                            <MatchBadge match={job.match} color={job.matchColor} />
                        </div>
                        <div className="font-bold text-sm mb-0.5">{job.title}</div>
                        <div className="text-xs text-gray-500 mb-2.5">{job.company} • {job.location}</div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {job.tags.map(t => <JobTag key={t} label={t} />)}
                            {job.salary && <JobTag label={job.salary} variant="salary" />}
                        </div>
                        <button className="w-full border-[1.5px] border-gray-200 hover:bg-gray-100 rounded-lg py-2 text-sm font-medium text-gray-700 transition-colors">Apply with Resume</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
