using backend.Data;
using backend.DTOs.Admin;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AnalyticsService(AppDbContext db) : IAnalyticsService
    {
        private readonly AppDbContext _db = db;

        public async Task<DashboardAnalyticsDto> GetDashboardAsync()
        {
            // ── KPI counts ───────────────────────────────────────────────────
            var totalJobs = await _db.JobPostings.CountAsync();
            var totalApplicants = await _db.CandidateProfiles.CountAsync(cp => !cp.IsDeleted);
            var totalOrgs = await _db.Organizations.CountAsync();

            // Load all application statuses as strings to avoid EF enum translation issues
            var appStatusStrings = await _db.JobApplications
                .Select(a => a.Status.ToString())
                .ToListAsync();

            var totalHired = appStatusStrings.Count(s => s == "Hired");

            // ── Pipeline funnel ──────────────────────────────────────────────
            var pipeline = new PipelineFunnelDto
            {
                Received           = appStatusStrings.Count(s => s == "Applied"),
                UnderReview        = appStatusStrings.Count(s =>
                                         s == "UnderReview" || s == "Reviewed" || s == "UnderFinalReview"),
                InterviewScheduled = appStatusStrings.Count(s => s == "Interview"),
                Hired              = totalHired,
            };

            // ── Time-to-hire (days from applied → updated for hired apps) ────
            var hiredTimes = await _db.JobApplications
                .Where(a => a.Status == ApplicationStatus.Hired)
                .Select(a => new { a.AppliedAt, a.UpdatedAt })
                .ToListAsync();

            double avgTimeToHire = hiredTimes.Count > 0
                ? Math.Round(hiredTimes.Average(a => (a.UpdatedAt - a.AppliedAt).TotalDays), 1)
                : 0;

            // ── Average match score (OverallRating 1–5 → %) ─────────────────
            var ratings = await _db.JobApplications
                .Where(a => a.OverallRating.HasValue)
                .Select(a => a.OverallRating!.Value)
                .ToListAsync();

            double avgMatchScore = ratings.Count > 0
                ? Math.Round(ratings.Average() / 5.0 * 100, 1)
                : 0;

            // ── Top organizations ────────────────────────────────────────────
            var topOrgs = await BuildTopOrganizationsAsync();

            // ── Department breakdown ─────────────────────────────────────────
            var deptResult = await BuildDepartmentBreakdownAsync();

            // ── Recent activity ──────────────────────────────────────────────
            var activity = await BuildRecentActivityAsync();

            return new DashboardAnalyticsDto
            {
                TotalJobsPosted          = totalJobs,
                TotalApplicants          = totalApplicants,
                TotalHired               = totalHired,
                TotalActiveOrganizations = totalOrgs,
                Pipeline                 = pipeline,
                TopOrganizations         = topOrgs,
                DepartmentBreakdown      = deptResult,
                AverageMatchScore        = avgMatchScore,
                AverageTimeToHireDays    = avgTimeToHire,
                RecentActivity           = activity,
            };
        }

        // ── Top Organizations ─────────────────────────────────────────────────
        private async Task<List<OrgHiringDto>> BuildTopOrganizationsAsync()
        {
            // Load recruiter → org mapping
            var recruiterOrgs = await _db.Users
                .Where(u => u.OrganizationId.HasValue)
                .Select(u => new { UserId = u.Id, u.OrganizationId })
                .ToListAsync();

            var orgNames = await _db.Organizations
                .Select(o => new { o.Id, o.Name })
                .ToDictionaryAsync(o => o.Id, o => o.Name);

            // Map recruiter → org name
            var recruiterToOrg = recruiterOrgs
                .Where(r => orgNames.ContainsKey(r.OrganizationId!.Value))
                .ToDictionary(r => r.UserId, r => orgNames[r.OrganizationId!.Value]);

            // Load all jobs with their recruiter id
            var jobs = await _db.JobPostings
                .Select(j => new { j.Id, j.CreatedByRecruiterId, j.PostedBy })
                .ToListAsync();

            // Assign org name to each job
            var jobOrgs = jobs
                .Select(j => new
                {
                    j.Id,
                    OrgName = recruiterToOrg.TryGetValue(j.CreatedByRecruiterId, out var name)
                              ? name : j.PostedBy,
                })
                .Where(j => !string.IsNullOrWhiteSpace(j.OrgName))
                .ToList();

            // Top 5 orgs by job count
            var top5 = jobOrgs
                .GroupBy(j => j.OrgName)
                .Select(g => new { OrgName = g.Key, JobIds = g.Select(x => x.Id).ToHashSet(), Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .Take(5)
                .ToList();

            if (top5.Count == 0) return [];

            // Load all applications
            var allApps = await _db.JobApplications
                .Select(a => new { a.JobPostingId, a.Status })
                .ToListAsync();

            return top5.Select(o =>
            {
                var orgApps = allApps.Where(a => o.JobIds.Contains(a.JobPostingId)).ToList();
                return new OrgHiringDto
                {
                    OrganizationName  = o.OrgName,
                    TotalJobs         = o.Count,
                    TotalApplications = orgApps.Count,
                    Hired             = orgApps.Count(a => a.Status == ApplicationStatus.Hired),
                };
            }).ToList();
        }

        // ── Department Breakdown ──────────────────────────────────────────────
        private async Task<List<DepartmentJobsDto>> BuildDepartmentBreakdownAsync()
        {
            // Load dept IDs from jobs and dept names separately
            var jobDeptIds = await _db.JobPostings
                .Where(j => j.DepartmentId.HasValue)
                .Select(j => j.DepartmentId!.Value)
                .ToListAsync();

            if (jobDeptIds.Count == 0) return [];

            var deptNames = await _db.Departments
                .Select(d => new { d.Id, d.Name })
                .ToDictionaryAsync(d => d.Id, d => d.Name);

            return jobDeptIds
                .Where(id => deptNames.ContainsKey(id))
                .Select(id => deptNames[id])
                .GroupBy(name => name)
                .Select(g => new DepartmentJobsDto { DepartmentName = g.Key, JobCount = g.Count() })
                .OrderByDescending(d => d.JobCount)
                .Take(8)
                .ToList();
        }

        // ── Recent Activity ───────────────────────────────────────────────────
        private async Task<List<ActivityLogItemDto>> BuildRecentActivityAsync()
        {
            var events = new List<ActivityLogItemDto>();

            // Latest 3 job postings
            var latestJobs = await _db.JobPostings
                .OrderByDescending(j => j.CreatedAt)
                .Take(3)
                .Select(j => new { j.Title, j.CreatedAt, j.PostedBy, j.CreatedByRecruiterId })
                .ToListAsync();

            // Resolve org names for recruiters
            var recruiterIds = latestJobs.Select(j => j.CreatedByRecruiterId).Distinct().ToList();
            var recruiterToOrg = await _db.Users
                .Where(u => recruiterIds.Contains(u.Id) && u.OrganizationId.HasValue)
                .Join(_db.Organizations,
                      u => u.OrganizationId,
                      o => o.Id,
                      (u, o) => new { UserId = u.Id, OrgName = o.Name })
                .ToDictionaryAsync(x => x.UserId, x => x.OrgName);

            events.AddRange(latestJobs.Select(j => new ActivityLogItemDto
            {
                Type      = "job_posted",
                Message   = $"New job posted: {j.Title}",
                Meta      = recruiterToOrg.TryGetValue(j.CreatedByRecruiterId, out var org) ? org : j.PostedBy,
                OccurredAt = j.CreatedAt,
            }));

            // Latest 3 hires — load flat then join in memory to avoid complex SQL
            var hiredApps = await _db.JobApplications
                .Where(a => a.Status == ApplicationStatus.Hired)
                .OrderByDescending(a => a.UpdatedAt)
                .Take(3)
                .Select(a => new { a.CandidateProfileId, a.JobPostingId, a.UpdatedAt })
                .ToListAsync();

            if (hiredApps.Count > 0)
            {
                var hiredCpIds = hiredApps.Select(a => a.CandidateProfileId).ToList();
                var hiredJobIds = hiredApps.Select(a => a.JobPostingId).ToList();

                var cpUsers = await _db.CandidateProfiles
                    .Where(cp => hiredCpIds.Contains(cp.Id))
                    .Join(_db.Users, cp => cp.UserId, u => u.Id,
                          (cp, u) => new { cp.Id, Name = u.FirstName + " " + u.LastName })
                    .ToDictionaryAsync(x => x.Id, x => x.Name);

                var jobTitles = await _db.JobPostings
                    .Where(j => hiredJobIds.Contains(j.Id))
                    .Select(j => new { j.Id, j.Title })
                    .ToDictionaryAsync(j => j.Id, j => j.Title);

                events.AddRange(hiredApps.Select(a => new ActivityLogItemDto
                {
                    Type      = "hired",
                    Message   = $"{cpUsers.GetValueOrDefault(a.CandidateProfileId, "Candidate")} hired for {jobTitles.GetValueOrDefault(a.JobPostingId, "a role")}",
                    Meta      = "Offer accepted",
                    OccurredAt = a.UpdatedAt,
                }));
            }

            // Latest 2 interviews
            var latestInterviews = await _db.Interviews
                .OrderByDescending(i => i.CreatedAt)
                .Take(2)
                .Select(i => new { i.InterviewType, i.CreatedAt, i.JobApplicationId })
                .ToListAsync();

            if (latestInterviews.Count > 0)
            {
                var interviewAppIds = latestInterviews.Select(i => i.JobApplicationId).ToList();
                var interviewJobTitles = await _db.JobApplications
                    .Where(a => interviewAppIds.Contains(a.Id))
                    .Join(_db.JobPostings, a => a.JobPostingId, j => j.Id,
                          (a, j) => new { AppId = a.Id, j.Title })
                    .ToDictionaryAsync(x => x.AppId, x => x.Title);

                events.AddRange(latestInterviews.Select(i => new ActivityLogItemDto
                {
                    Type      = "interview",
                    Message   = $"{i.InterviewType} interview scheduled for {interviewJobTitles.GetValueOrDefault(i.JobApplicationId, "a role")}",
                    Meta      = "Interview stage",
                    OccurredAt = i.CreatedAt,
                }));
            }

            return [.. events.OrderByDescending(e => e.OccurredAt).Take(5)];
        }
    }
}
