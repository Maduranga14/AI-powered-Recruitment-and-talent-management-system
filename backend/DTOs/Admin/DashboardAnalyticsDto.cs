namespace backend.DTOs.Admin
{
    public class DashboardAnalyticsDto
    {
        // ── KPI Cards ────────────────────────────────────────────────────────
        public int TotalJobsPosted { get; set; }
        public int TotalApplicants { get; set; }
        public int TotalHired { get; set; }
        public int TotalActiveOrganizations { get; set; }

        // ── Recruitment Pipeline Funnel ──────────────────────────────────────
        public PipelineFunnelDto Pipeline { get; set; } = new();

        // ── Top Organizations by hiring activity ─────────────────────────────
        public List<OrgHiringDto> TopOrganizations { get; set; } = [];

        // ── Job distribution per department ──────────────────────────────────
        public List<DepartmentJobsDto> DepartmentBreakdown { get; set; } = [];

        // ── AI & Efficiency Metrics ──────────────────────────────────────────
        public double AverageMatchScore { get; set; }
        public double AverageTimeToHireDays { get; set; }

        // ── Recent Activity Log ───────────────────────────────────────────────
        public List<ActivityLogItemDto> RecentActivity { get; set; } = [];
    }

    public class PipelineFunnelDto
    {
        public int Received { get; set; }
        public int UnderReview { get; set; }
        public int InterviewScheduled { get; set; }
        public int Hired { get; set; }
    }

    public class OrgHiringDto
    {
        public string OrganizationName { get; set; } = string.Empty;
        public int TotalJobs { get; set; }
        public int TotalApplications { get; set; }
        public int Hired { get; set; }
    }

    public class DepartmentJobsDto
    {
        public string DepartmentName { get; set; } = string.Empty;
        public int JobCount { get; set; }
    }

    public class ActivityLogItemDto
    {
        public string Type { get; set; } = string.Empty;   // "job_posted" | "hired" | "application" | "interview"
        public string Message { get; set; } = string.Empty;
        public string Meta { get; set; } = string.Empty;
        public DateTime OccurredAt { get; set; }
    }
}
