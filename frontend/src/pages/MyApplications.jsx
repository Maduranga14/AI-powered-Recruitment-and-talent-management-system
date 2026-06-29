import React, { useState } from 'react'
import { applications } from "../data/applicationsData";
import PageHeader from '../components/ui/PageHeader';
import ApplicationsFilterBar from '../components/applications/ApplicationsFilterBar';
import ApplicationsTable from '../components/applications/ApplicationsTable';

export default function MyApplications() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Statuses");
    const [page, setPage] = useState(1);

    const filtered = applications.filter(app => {
        const matchSearch = app.company.toLowerCase().includes(search.toLowerCase()) ||
            app.position.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "All Statuses" || app.status === statusFilter;
        return matchSearch && matchStatus;
    });


    return (
        <div className="flex flex-col gap-5">
            <PageHeader title="Application Tracking" subtitle="Manage and track your active job applications across different stages." />
            <ApplicationsFilterBar search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusChange={setStatusFilter} />
            <ApplicationsTable applications={filtered} page={page} onPageChange={setPage} totalItems={12} />
        </div>
    );
}
