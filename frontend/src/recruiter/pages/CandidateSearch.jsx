import { useState } from 'react';

const skills = ['React', 'Node.js', 'Python', 'Machine Learning', 'Product Management', 'UI/UX Design', 'Data Science', 'DevOps'];
const locations = ['All Locations', 'Remote', 'San Francisco, CA', 'New York, NY', 'London, UK', 'Berlin, DE', 'Singapore'];
const experience = ['All Levels', 'Entry Level', 'Mid Level', 'Senior', 'Lead / Principal', 'Director+'];

const candidates = [
    { id: 1, name: 'Sarah Jenkins', title: 'Senior Product Designer', location: 'London, UK', experience: '8 years', aiMatch: 96, initials: 'SJ', color: '#6366f1', skills: ['Figma', 'UI/UX', 'Design Systems'], available: true },
    { id: 2, name: 'David Chen', title: 'Full Stack Engineer', location: 'San Francisco, CA', experience: '6 years', aiMatch: 88, initials: 'DC', color: '#10b981', skills: ['React', 'Node.js', 'PostgreSQL'], available: true },
    { id: 3, name: 'Marcus Thompson', title: 'ML Infrastructure Lead', location: 'Berlin, DE', experience: '10 years', aiMatch: 94, initials: 'MT', color: '#f59e0b', skills: ['Python', 'Kubernetes', 'TensorFlow'], available: false },
    { id: 4, name: 'Priya Sharma', title: 'Product Manager', location: 'Toronto, CA', experience: '5 years', aiMatch: 79, initials: 'PS', color: '#8b5cf6', skills: ['Product Strategy', 'Agile', 'Analytics'], available: true },
    { id: 5, name: 'Mei Lin', title: 'Data Scientist', location: 'Singapore', experience: '7 years', aiMatch: 93, initials: 'ML', color: '#06b6d4', skills: ['Python', 'ML', 'SQL', 'Tableau'], available: true },
    { id: 6, name: 'Noah Patel', title: 'Frontend Developer', location: 'Dubai, UAE', experience: '4 years', aiMatch: 82, initials: 'NP', color: '#a855f7', skills: ['React', 'TypeScript', 'CSS'], available: true },
];

function MatchRing({ score }) {
    const color = score >= 90 ? '#10b981' : score >= 80 ? '#2563EB' : '#f59e0b';
    return (
        <div className="flex items-center gap-1" style={{ color }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="5" />
            </svg>
            <span className="text-[13px] font-bold">{score}%</span>
        </div>
    );
}

export default function CandidateSearch() {
    const [query, setQuery] = useState('');
    const [loc, setLoc] = useState('All Locations');
    const [exp, setExp] = useState('All Levels');
    const [activeSkills, setActiveSkills] = useState([]);

    const toggleSkill = (s) => setActiveSkills(prev =>
        prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );

    const filtered = candidates.filter(c => {
        const q = query.toLowerCase();
        const matchQ = !q || c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
        const matchLoc = loc === 'All Locations' || c.location.includes(loc.split(',')[0]);
        const matchSkill = activeSkills.length === 0 || activeSkills.some(s =>
            c.skills.some(cs => cs.toLowerCase().includes(s.toLowerCase()))
        );
        return matchQ && matchLoc && matchSkill;
    });

    return (
        <div className="flex flex-col gap-6">
            
            <div>
                <h1 className="text-[22px] font-bold text-gray-900 mb-0.5">Candidate Search</h1>
                <p className="text-[13.5px] text-gray-500">Find and shortlist top talent powered by AI matching.</p>
            </div>

            
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2.5 flex-1 bg-gray-50 focus-within:border-blue-400 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, title, or skill..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="bg-transparent border-none outline-none flex-1 text-[13.5px] text-gray-700 placeholder-gray-400"
                        />
                    </div>
                    <select value={loc} onChange={e => setLoc(e.target.value)}
                        className="text-[13px] text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 bg-white outline-none cursor-pointer">
                        {locations.map(l => <option key={l}>{l}</option>)}
                    </select>
                    <select value={exp} onChange={e => setExp(e.target.value)}
                        className="text-[13px] text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 bg-white outline-none cursor-pointer">
                        {experience.map(l => <option key={l}>{l}</option>)}
                    </select>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors">
                        Search
                    </button>
                </div>

                
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] text-gray-500 font-medium">Filter by skill:</span>
                    {skills.map(s => (
                        <button
                            key={s}
                            onClick={() => toggleSkill(s)}
                            className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors border
                                ${activeSkills.includes(s)
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            
            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[13px] text-gray-500">
                        Showing <span className="font-semibold text-gray-800">{filtered.length}</span> candidates
                    </p>
                    <div className="flex items-center gap-2 text-[12.5px] text-gray-500">
                        <span>Sort by:</span>
                        <select className="text-[12.5px] text-gray-700 border border-gray-200 rounded-lg px-2 py-1 bg-white outline-none">
                            <option>AI Match Score</option>
                            <option>Most Recent</option>
                            <option>Experience</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {filtered.map(c => (
                        <div
                            key={c.id}
                            className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow hover:border-blue-200 group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-11 h-11 rounded-full text-white font-bold flex items-center justify-center text-sm shrink-0"
                                        style={{ backgroundColor: c.color }}
                                    >
                                        {c.initials}
                                    </div>
                                    <div>
                                        <div className="text-[13.5px] font-bold text-gray-900">{c.name}</div>
                                        <div className="text-[12px] text-gray-500">{c.title}</div>
                                    </div>
                                </div>
                                <MatchRing score={c.aiMatch} />
                            </div>

                            <div className="flex items-center gap-3 text-[12px] text-gray-500 mb-4">
                                <span className="flex items-center gap-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {c.location}
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    {c.experience}
                                </span>
                                {c.available && (
                                    <span className="flex items-center gap-1 text-emerald-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Available
                                    </span>
                                )}
                            </div>

                            
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {c.skills.map(skill => (
                                    <span key={skill} className="bg-gray-100 text-gray-600 text-[11.5px] px-2.5 py-0.5 rounded-full">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            
                            <div className="flex gap-2">
                                <button className="flex-1 border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-700 text-[12.5px] font-medium py-2 rounded-lg transition-colors">
                                    View Profile
                                </button>
                                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-semibold py-2 rounded-lg transition-colors">
                                    Schedule
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
