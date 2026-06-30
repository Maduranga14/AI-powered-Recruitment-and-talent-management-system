import React from 'react'
import PageHeader from '../components/ui/PageHeader'
import StatCardGrid from '../components/ui/StatCardGrid'
import { completedInterviews, statCards, upcomingInterviews } from '../data/interviewsData'
import InterviewCard from '../components/interviews/InterviewCard'
import CompletedInterviewsTable from '../components/interviews/CompletedInterviewsTable'
import InterviewAlerts from '../components/interviews/InterviewAlerts'
import AIPrepKit from '../components/interviews/AIPrepKit'

export default function Interviews() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="My Interviews" subtitle="Manage your upcoming scheduling, track your performance, and prepare for your next big career move with AI-driven insights." />
            <StatCardGrid cards={statCards} />
            <div className="grid grid-cols-[1fr_280px] gap-6 items-start">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Upcomming Interviews</h2>
                        <a href="#" className='text-blue-600 text-sm font-medium'>View Full Calendar →</a>
                    </div>
                    {upcomingInterviews.map(iv => <InterviewCard key={iv.id} interview={iv} />)}
                    <h2 className="text-lg font-bold text-gray-900 mt-2">Recently Completed</h2>
                    <CompletedInterviewsTable interviews={completedInterviews} />
                </div>
                <div className="flex flex-col gap-4">
                    <InterviewAlerts />
                    <AIPrepKit context="NexTech's tech stack" />
                </div>
            </div>
        </div>
    )
}
