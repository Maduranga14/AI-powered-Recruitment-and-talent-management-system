using backend.Data;
using backend.DTOs.Jobs;
using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class JobPostingService(AppDbContext db) : IJobPostingService
    {
        private readonly AppDbContext _db = db;

        // ─── Create ───────────────────────────────────────────────────────────
        public async Task<JobPostingDetailDto> CreateAsync(CreateJobPostingDto dto, Guid recruiterId)
        {
            // Validate department if provided
            if (dto.DepartmentId.HasValue)
            {
                var deptExists = await _db.Departments.AnyAsync(d => d.Id == dto.DepartmentId.Value);
                if (!deptExists)
                    throw new KeyNotFoundException("The specified department does not exist.");
            }

            // Validate salary range
            if (dto.SalaryMin.HasValue && dto.SalaryMax.HasValue && dto.SalaryMin > dto.SalaryMax)
                throw new ArgumentException("Salary minimum cannot be greater than maximum.");

            var posting = new JobPosting
            {
                Title = dto.Title.Trim(),
                Description = dto.Description.Trim(),
                Location = dto.Location.Trim(),
                EmploymentType = dto.EmploymentType,
                Status = dto.Status,
                SalaryMin = dto.SalaryMin,
                SalaryMax = dto.SalaryMax,
                SalaryCurrency = dto.SalaryCurrency.Trim().ToUpper(),
                ExperienceRequired = dto.ExperienceRequired?.Trim(),
                RequiredSkills = dto.RequiredSkills?.Trim(),
                Deadline = dto.Deadline,
                DepartmentId = dto.DepartmentId,
                CreatedByRecruiterId = recruiterId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                PublishedAt = dto.Status == JobStatus.Published ? DateTime.UtcNow : null
            };

            // PostedBy: use what the recruiter entered, fall back to their org name
            if (!string.IsNullOrWhiteSpace(dto.PostedBy))
            {
                posting.PostedBy = dto.PostedBy.Trim();
            }
            else
            {
                var recruiter = await _db.Users.FindAsync(recruiterId);
                posting.PostedBy = recruiter?.OrganizationName ?? string.Empty;
            }

            _db.JobPostings.Add(posting);
            await _db.SaveChangesAsync();

            return await BuildDetailDtoAsync(posting.Id);
        }

      
        public async Task<PagedJobsDto> GetByRecruiterAsync(Guid recruiterId, JobStatus? status, int page, int pageSize)
        {
            var query = _db.JobPostings
                .Where(j => j.CreatedByRecruiterId == recruiterId)
                .AsQueryable();

            if (status.HasValue)
                query = query.Where(j => j.Status == status.Value);

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(j => j.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(j => new JobPostingListDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Location = j.Location,
                    EmploymentType = j.EmploymentType.ToString(),
                    Status = j.Status.ToString(),
                    DepartmentName = j.Department != null ? j.Department.Name : null,
                    SalaryMin = j.SalaryMin,
                    SalaryMax = j.SalaryMax,
                    SalaryCurrency = j.SalaryCurrency,
                    Deadline = j.Deadline,
                    CreatedAt = j.CreatedAt,
                    PublishedAt = j.PublishedAt,
                    RecruiterName = j.CreatedByRecruiter != null
                        ? j.CreatedByRecruiter.FirstName + " " + j.CreatedByRecruiter.LastName
                        : string.Empty,
                    PostedBy = j.PostedBy,
                    ApplicantCount = _db.JobApplications.Count(a => a.JobPostingId == j.Id),
                    ScreenedCount = _db.JobApplications.Count(a =>
                        a.JobPostingId == j.Id && (
                            a.Status == ApplicationStatus.UnderReview ||
                            a.Status == ApplicationStatus.Interview ||
                            a.Status == ApplicationStatus.Hired)),
                    ShortlistedCount = _db.JobApplications.Count(a =>
                        a.JobPostingId == j.Id && a.Status == ApplicationStatus.UnderReview),
                    InterviewCount = _db.JobApplications.Count(a =>
                        a.JobPostingId == j.Id && a.Status == ApplicationStatus.Interview)
                })
                .ToListAsync();

            return new PagedJobsDto
            {
                Items = items,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            };
        }

       
        public async Task<JobPostingDetailDto> GetDetailAsync(Guid id, Guid recruiterId)
        {
            var exists = await _db.JobPostings
                .AnyAsync(j => j.Id == id && j.CreatedByRecruiterId == recruiterId);

            if (!exists)
                throw new KeyNotFoundException("Job posting not found or you do not have access.");

            return await BuildDetailDtoAsync(id);
        }

       
        public async Task<JobPostingDetailDto> UpdateAsync(Guid id, UpdateJobPostingDto dto, Guid recruiterId)
        {
            var posting = await _db.JobPostings
                .FirstOrDefaultAsync(j => j.Id == id && j.CreatedByRecruiterId == recruiterId)
                ?? throw new KeyNotFoundException("Job posting not found or you do not have access.");

            if (posting.Status == JobStatus.Closed || posting.Status == JobStatus.Archived)
                throw new InvalidOperationException("Closed or archived postings cannot be edited.");

            if (dto.DepartmentId.HasValue)
            {
                var deptExists = await _db.Departments.AnyAsync(d => d.Id == dto.DepartmentId.Value);
                if (!deptExists)
                    throw new KeyNotFoundException("The specified department does not exist.");
            }

            
            if (dto.Title != null)          posting.Title = dto.Title.Trim();
            if (dto.Description != null)    posting.Description = dto.Description.Trim();
            if (dto.Location != null)       posting.Location = dto.Location.Trim();
            if (dto.EmploymentType.HasValue) posting.EmploymentType = dto.EmploymentType.Value;
            if (dto.SalaryMin.HasValue)     posting.SalaryMin = dto.SalaryMin;
            if (dto.SalaryMax.HasValue)     posting.SalaryMax = dto.SalaryMax;
            if (dto.SalaryCurrency != null) posting.SalaryCurrency = dto.SalaryCurrency.Trim().ToUpper();
            if (dto.ExperienceRequired != null) posting.ExperienceRequired = dto.ExperienceRequired.Trim();
            if (dto.RequiredSkills != null) posting.RequiredSkills = dto.RequiredSkills.Trim();
            if (dto.Deadline.HasValue)      posting.Deadline = dto.Deadline;
            if (dto.DepartmentId.HasValue)  posting.DepartmentId = dto.DepartmentId;

           
            if (posting.SalaryMin.HasValue && posting.SalaryMax.HasValue && posting.SalaryMin > posting.SalaryMax)
                throw new ArgumentException("Salary minimum cannot be greater than maximum.");

            posting.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return await BuildDetailDtoAsync(id);
        }

        
        public async Task<JobPostingDetailDto> ChangeStatusAsync(Guid id, JobStatus newStatus, Guid recruiterId)
        {
            var posting = await _db.JobPostings
                .FirstOrDefaultAsync(j => j.Id == id && j.CreatedByRecruiterId == recruiterId)
                ?? throw new KeyNotFoundException("Job posting not found or you do not have access.");

            ValidateStatusTransition(posting.Status, newStatus);

            posting.Status = newStatus;
            posting.UpdatedAt = DateTime.UtcNow;

            
            if (newStatus == JobStatus.Published && posting.PublishedAt == null)
                posting.PublishedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return await BuildDetailDtoAsync(id);
        }

       
        public async Task DeleteAsync(Guid id, Guid recruiterId)
        {
            var posting = await _db.JobPostings
                .FirstOrDefaultAsync(j => j.Id == id && j.CreatedByRecruiterId == recruiterId)
                ?? throw new KeyNotFoundException("Job posting not found or you do not have access.");

            var applications = _db.JobApplications.Where(a => a.JobPostingId == id);
            _db.JobApplications.RemoveRange(applications);

            _db.JobPostings.Remove(posting);
            await _db.SaveChangesAsync();
        }

        
        public async Task<List<PublicJobPageDto>> GetPublishedJobsAsync(string? keyword, string? location, EmploymentType? type)
        {
            var query = _db.JobPostings
                .Where(j => j.Status == JobStatus.Published)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
                query = query.Where(j =>
                    j.Title.Contains(keyword) ||
                    j.Description.Contains(keyword) ||
                    (j.RequiredSkills != null && j.RequiredSkills.Contains(keyword)));

            if (!string.IsNullOrWhiteSpace(location))
                query = query.Where(j => j.Location.Contains(location));

            if (type.HasValue)
                query = query.Where(j => j.EmploymentType == type.Value);

            return await query
                .OrderByDescending(j => j.PublishedAt)
                .Select(j => new
                {
                    j.Id,
                    j.Title,
                    j.Description,
                    j.Location,
                    j.EmploymentType,
                    DepartmentName = j.Department != null ? j.Department.Name : null,
                    j.SalaryMin,
                    j.SalaryMax,
                    j.SalaryCurrency,
                    j.ExperienceRequired,
                    j.RequiredSkills,
                    j.Deadline,
                    j.PublishedAt,
                    OrganizationName = j.CreatedByRecruiter != null
                        ? j.CreatedByRecruiter.OrganizationName ?? string.Empty
                        : string.Empty,
                    j.PostedBy
                })
                .ToListAsync()
                .ContinueWith(t => t.Result.Select(j => new PublicJobPageDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Description = j.Description,
                    Location = j.Location,
                    EmploymentType = j.EmploymentType.ToString(),
                    DepartmentName = j.DepartmentName,
                    SalaryMin = j.SalaryMin,
                    SalaryMax = j.SalaryMax,
                    SalaryCurrency = j.SalaryCurrency,
                    ExperienceRequired = j.ExperienceRequired,
                    RequiredSkills = !string.IsNullOrEmpty(j.RequiredSkills)
                        ? j.RequiredSkills.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList()
                        : new List<string>(),
                    Deadline = j.Deadline,
                    PublishedAt = j.PublishedAt!.Value,
                    OrganizationName = j.OrganizationName,
                    PostedBy = j.PostedBy
                }).ToList());
        }

        
        public async Task<PublicJobPageDto> GetPublicJobPageAsync(Guid id)
        {
            var job = await _db.JobPostings
                .Include(j => j.Department)
                .Include(j => j.CreatedByRecruiter)
                .FirstOrDefaultAsync(j => j.Id == id && j.Status == JobStatus.Published)
                ?? throw new KeyNotFoundException("Job posting not found or is no longer available.");

            return new PublicJobPageDto
            {
                Id = job.Id,
                Title = job.Title,
                Description = job.Description,
                Location = job.Location,
                EmploymentType = job.EmploymentType.ToString(),
                DepartmentName = job.Department?.Name,
                SalaryMin = job.SalaryMin,
                SalaryMax = job.SalaryMax,
                SalaryCurrency = job.SalaryCurrency,
                ExperienceRequired = job.ExperienceRequired,
                RequiredSkills = job.RequiredSkills != null
                    ? job.RequiredSkills.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList()
                    : [],
                Deadline = job.Deadline,
                PublishedAt = job.PublishedAt!.Value,
                OrganizationName = job.CreatedByRecruiter?.OrganizationName ?? string.Empty,
                PostedBy = job.PostedBy
            };
        }

        public async Task<JobApplicantsResultDto> GetApplicantsAsync(Guid jobId, Guid recruiterId)
        {
            var job = await _db.JobPostings
                .AsNoTracking()
                .FirstOrDefaultAsync(j => j.Id == jobId && j.CreatedByRecruiterId == recruiterId)
                ?? throw new KeyNotFoundException("Job posting not found or you do not have access.");

            var applications = await _db.JobApplications
                .AsNoTracking()
                .Where(a => a.JobPostingId == jobId)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.User)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Skills)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Experiences)
                .Include(a => a.JobPosting)
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();

            return new JobApplicantsResultDto
            {
                JobId = job.Id,
                JobTitle = job.Title,
                JobStatus = job.Status.ToString(),
                Applicants = applications.Select(a => MapApplicant(a, a.JobPosting?.Title ?? job.Title)).ToList()
            };
        }

        public async Task<List<JobApplicantDto>> GetAllApplicantsAsync(Guid recruiterId)
        {
            var applications = await _db.JobApplications
                .AsNoTracking()
                .Where(a => a.JobPosting.CreatedByRecruiterId == recruiterId)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.User)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Skills)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Experiences)
                .Include(a => a.JobPosting)
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();

            return applications
                .Select(a => MapApplicant(a, a.JobPosting?.Title ?? string.Empty))
                .ToList();
        }

        public async Task<JobApplicantDto> UpdateApplicationStatusAsync(
            Guid jobId, Guid applicationId, ApplicationStatus status, Guid recruiterId)
        {
            var job = await _db.JobPostings
                .AsNoTracking()
                .FirstOrDefaultAsync(j => j.Id == jobId && j.CreatedByRecruiterId == recruiterId)
                ?? throw new KeyNotFoundException("Job posting not found or you do not have access.");

            var application = await _db.JobApplications
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.User)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Skills)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Experiences)
                .FirstOrDefaultAsync(a => a.Id == applicationId && a.JobPostingId == jobId)
                ?? throw new KeyNotFoundException("Application not found for this job.");

            application.Status = status;
            application.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return MapApplicant(application, job.Title);
        }

        private static JobApplicantDto MapApplicant(JobApplication a, string jobTitle)
        {
            var profile = a.CandidateProfile;
            var user = profile.User;
            var latestExp = profile.Experiences
                .OrderByDescending(e => e.IsCurrent)
                .ThenByDescending(e => e.StartDate)
                .FirstOrDefault();

            string? experienceSummary = null;
            if (latestExp != null)
            {
                var years = profile.Experiences.Count;
                experienceSummary = latestExp.IsCurrent
                    ? $"{years} role{(years == 1 ? "" : "s")} · Current: {latestExp.Title} at {latestExp.Company}"
                    : $"{years} role{(years == 1 ? "" : "s")} · {latestExp.Title} at {latestExp.Company}";
            }

            return new JobApplicantDto
            {
                ApplicationId = a.Id,
                JobPostingId = a.JobPostingId,
                CandidateProfileId = profile.Id,
                UserId = profile.UserId,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                Email = user.Email,
                Headline = profile.Headline,
                Location = profile.Location,
                PhotoUrl = profile.PhotoUrl,
                JobTitle = jobTitle,
                Status = a.Status.ToString(),
                CoverLetter = a.CoverLetter,
                AppliedAt = a.AppliedAt,
                Skills = profile.Skills.Select(s => s.Name).OrderBy(n => n).ToList(),
                ExperienceSummary = experienceSummary,
                ResumeUrl = profile.ResumeUrl
            };
        }

      
        private async Task<JobPostingDetailDto> BuildDetailDtoAsync(Guid id)
        {
            return await _db.JobPostings
                .Where(j => j.Id == id)
                .Select(j => new JobPostingDetailDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Description = j.Description,
                    Location = j.Location,
                    EmploymentType = j.EmploymentType.ToString(),
                    Status = j.Status.ToString(),
                    DepartmentName = j.Department != null ? j.Department.Name : null,
                    DepartmentId = j.DepartmentId,
                    SalaryMin = j.SalaryMin,
                    SalaryMax = j.SalaryMax,
                    SalaryCurrency = j.SalaryCurrency,
                    ExperienceRequired = j.ExperienceRequired,
                    RequiredSkills = j.RequiredSkills,
                    Deadline = j.Deadline,
                    CreatedAt = j.CreatedAt,
                    UpdatedAt = j.UpdatedAt,
                    PublishedAt = j.PublishedAt,
                    CreatedByRecruiterId = j.CreatedByRecruiterId,
                    RecruiterName = j.CreatedByRecruiter != null
                        ? j.CreatedByRecruiter.FirstName + " " + j.CreatedByRecruiter.LastName
                        : string.Empty,
                    PostedBy = j.PostedBy
                })
                .FirstAsync();
        }

        private static void ValidateStatusTransition(JobStatus current, JobStatus next)
        {
            var allowed = current switch
            {
                JobStatus.Draft      => new[] { JobStatus.Published, JobStatus.Archived },
                JobStatus.Published  => new[] { JobStatus.Closed, JobStatus.Archived },
                JobStatus.Closed     => new[] { JobStatus.Archived, JobStatus.Published },
                JobStatus.Archived   => Array.Empty<JobStatus>(),
                _ => Array.Empty<JobStatus>()
            };

            if (!allowed.Contains(next))
                throw new InvalidOperationException(
                    $"Cannot transition from '{current}' to '{next}'. " +
                    $"Allowed: {(allowed.Length > 0 ? string.Join(", ", allowed.Select(s => s.ToString())) : "none")}.");
        }
    }
}
