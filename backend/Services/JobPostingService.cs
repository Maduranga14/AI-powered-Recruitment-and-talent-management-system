using backend.Data;
using backend.DTOs.Jobs;
using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class JobPostingService(AppDbContext db, IEmailService emailService) : IJobPostingService
    {
        private readonly AppDbContext _db = db;
        private readonly IEmailService _emailService = emailService;

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
                ResumeUrl = profile.ResumeUrl,
                Feedback = a.Feedback,
                Recommendation = a.Recommendation,
                OverallRating = a.OverallRating,
                SkillRatings = a.SkillRatings
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

        public async Task<List<JobApplicantDto>> GetManagerApplicantsAsync(Guid managerUserId)
        {
            var manager = await _db.Users.FindAsync(managerUserId);
            if (manager == null || manager.Role != UserRole.HiringManager)
                throw new KeyNotFoundException("Hiring manager user not found.");

            var managerName = manager.FullName;

            // Find all departments headed by this manager in the manager's organization
            var departments = await _db.Departments
                .Where(d => d.Head == managerName && d.OrganizationName == manager.OrganizationName)
                .Select(d => d.Id)
                .ToListAsync();

            if (departments.Count == 0)
                return new List<JobApplicantDto>();

            // Query applications for postings in those departments where status != Applied (once shortlisted/under review)
            var applications = await _db.JobApplications
                .Include(a => a.JobPosting)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.User)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Experiences)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Skills)
                .Where(a => a.JobPosting.DepartmentId != null &&
                            departments.Contains(a.JobPosting.DepartmentId.Value) &&
                            a.Status != ApplicationStatus.Applied)
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();

            return applications.Select(a => MapApplicant(a, a.JobPosting.Title)).ToList();
        }

        public async Task<JobApplicantDto> SubmitManagerFeedbackAsync(Guid applicationId, string recommendation, string feedback, int overallRating, string? skillRatings, Guid managerUserId)
        {
            var manager = await _db.Users.FindAsync(managerUserId);
            if (manager == null || manager.Role != UserRole.HiringManager)
                throw new KeyNotFoundException("Hiring manager user not found.");

            var managerName = manager.FullName;

            // Find all departments headed by this manager
            var departments = await _db.Departments
                .Where(d => d.Head == managerName && d.OrganizationName == manager.OrganizationName)
                .Select(d => d.Id)
                .ToListAsync();

            var application = await _db.JobApplications
                .Include(a => a.JobPosting)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.User)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Experiences)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Skills)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
                throw new KeyNotFoundException("Application not found.");

            if (application.JobPosting.DepartmentId == null || !departments.Contains(application.JobPosting.DepartmentId.Value))
                throw new UnauthorizedAccessException("You are not authorized to review this application.");

            // Update feedback and recommendation
            application.Feedback = feedback;
            application.Recommendation = recommendation;
            application.OverallRating = overallRating;
            application.SkillRatings = skillRatings;

            // Transition status to Reviewed so the recruiter knows the manager completed their review
            application.Status = ApplicationStatus.Reviewed;

            application.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return MapApplicant(application, application.JobPosting.Title);
        }

        public async Task<InterviewDto> ScheduleInterviewAsync(
            Guid jobId, Guid applicationId, ScheduleInterviewDto dto, Guid recruiterId)
        {
            var job = await _db.JobPostings
                .FirstOrDefaultAsync(j => j.Id == jobId && j.CreatedByRecruiterId == recruiterId)
                ?? throw new KeyNotFoundException("Job posting not found or you do not have access.");

            var application = await _db.JobApplications
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.User)
                .FirstOrDefaultAsync(a => a.Id == applicationId && a.JobPostingId == jobId)
                ?? throw new KeyNotFoundException("Application not found for this job.");

            if (application.Status is ApplicationStatus.Rejected or ApplicationStatus.Hired)
                throw new InvalidOperationException(
                    $"Cannot schedule an interview when application status is '{application.Status}'.");

            var interviewType = dto.InterviewType.Trim();
            var allowedTypes = new[] { "Video", "Phone", "Onsite" };
            if (!allowedTypes.Contains(interviewType, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException("Interview type must be Video, Phone, or Onsite.");

            interviewType = allowedTypes.First(t =>
                t.Equals(interviewType, StringComparison.OrdinalIgnoreCase));

            var scheduledAt = dto.ScheduledAt.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(dto.ScheduledAt, DateTimeKind.Utc)
                : dto.ScheduledAt.ToUniversalTime();

            if (scheduledAt < DateTime.UtcNow.AddMinutes(-5))
                throw new ArgumentException("Interview time must be in the future.");

            if (interviewType == "Video" && string.IsNullOrWhiteSpace(dto.MeetingLink))
                throw new ArgumentException("A meeting link is required for video interviews.");

            if (interviewType == "Onsite" && string.IsNullOrWhiteSpace(dto.Location))
                throw new ArgumentException("A location is required for onsite interviews.");

            var interview = new Interview
            {
                JobApplicationId = application.Id,
                ScheduledAt = scheduledAt,
                DurationMinutes = dto.DurationMinutes > 0 ? dto.DurationMinutes : 60,
                InterviewType = interviewType,
                MeetingLink = string.IsNullOrWhiteSpace(dto.MeetingLink) ? null : dto.MeetingLink.Trim(),
                Location = string.IsNullOrWhiteSpace(dto.Location) ? null : dto.Location.Trim(),
                InterviewerName = dto.InterviewerName.Trim(),
                Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim(),
                CreatedByRecruiterId = recruiterId,
                CreatedAt = DateTime.UtcNow
            };

            application.Status = ApplicationStatus.Interview;
            application.UpdatedAt = DateTime.UtcNow;

            _db.Interviews.Add(interview);
            await _db.SaveChangesAsync();

            var candidate = application.CandidateProfile.User;
            var candidateName = $"{candidate.FirstName} {candidate.LastName}".Trim();
            var localTime = scheduledAt.ToLocalTime();
            var when = localTime.ToString("dddd, MMM d yyyy 'at' h:mm tt");
            var details = interviewType switch
            {
                "Video" => $"Join link: {interview.MeetingLink}",
                "Onsite" => $"Location: {interview.Location}",
                _ => "The interviewer will contact you by phone."
            };

            try
            {
                await _emailService.SendEmailAsync(
                    candidate.Email,
                    $"Interview scheduled — {job.Title}",
                    $"""
                    <p>Hi {candidateName},</p>
                    <p>You've been invited to interview for <strong>{job.Title}</strong>.</p>
                    <ul>
                      <li><strong>When:</strong> {when} ({interview.DurationMinutes} minutes)</li>
                      <li><strong>Type:</strong> {interviewType}</li>
                      <li><strong>Interviewer:</strong> {interview.InterviewerName}</li>
                      <li><strong>Details:</strong> {details}</li>
                    </ul>
                    {(string.IsNullOrWhiteSpace(interview.Notes) ? "" : $"<p><strong>Notes:</strong> {interview.Notes}</p>")}
                    <p>Good luck!</p>
                    """);
            }
            catch
            {
                // Scheduling succeeded even if email fails
            }

            return MapInterview(interview, application, job.Title, candidateName, candidate.Email);
        }

        public async Task<List<InterviewDto>> GetInterviewsAsync(Guid recruiterId)
        {
            var interviews = await _db.Interviews
                .Include(i => i.JobApplication)
                    .ThenInclude(a => a.JobPosting)
                .Include(i => i.JobApplication)
                    .ThenInclude(a => a.CandidateProfile)
                        .ThenInclude(cp => cp.User)
                .Where(i => i.CreatedByRecruiterId == recruiterId
                         || i.JobApplication.JobPosting.CreatedByRecruiterId == recruiterId)
                .OrderBy(i => i.ScheduledAt)
                .ToListAsync();

            return interviews.Select(i =>
            {
                var user = i.JobApplication.CandidateProfile.User;
                var name = $"{user.FirstName} {user.LastName}".Trim();
                return MapInterview(
                    i,
                    i.JobApplication,
                    i.JobApplication.JobPosting.Title,
                    name,
                    user.Email);
            }).ToList();
        }

        public async Task<List<InterviewDto>> GetManagerInterviewsAsync(Guid managerUserId)
        {
            var manager = await _db.Users.FindAsync(managerUserId);
            if (manager == null || manager.Role != UserRole.HiringManager)
                throw new KeyNotFoundException("Hiring manager user not found.");

            var managerName = manager.FullName;
            var departments = await _db.Departments
                .Where(d => d.Head == managerName && d.OrganizationName == manager.OrganizationName)
                .Select(d => d.Id)
                .ToListAsync();

            if (departments.Count == 0)
                return [];

            var interviews = await _db.Interviews
                .Include(i => i.JobApplication)
                    .ThenInclude(a => a.JobPosting)
                .Include(i => i.JobApplication)
                    .ThenInclude(a => a.CandidateProfile)
                        .ThenInclude(cp => cp.User)
                .Where(i => i.JobApplication.JobPosting.DepartmentId != null &&
                            departments.Contains(i.JobApplication.JobPosting.DepartmentId.Value))
                .OrderBy(i => i.ScheduledAt)
                .ToListAsync();

            return interviews.Select(i =>
            {
                var user = i.JobApplication.CandidateProfile.User;
                var name = $"{user.FirstName} {user.LastName}".Trim();
                return MapInterview(
                    i,
                    i.JobApplication,
                    i.JobApplication.JobPosting.Title,
                    name,
                    user.Email);
            }).ToList();
        }

        private static InterviewDto MapInterview(
            Interview interview,
            JobApplication application,
            string jobTitle,
            string candidateName,
            string candidateEmail)
        {
            var posting = application.JobPosting;
            return new InterviewDto
            {
                Id = interview.Id,
                ApplicationId = application.Id,
                JobPostingId = application.JobPostingId,
                CandidateName = candidateName,
                CandidateEmail = candidateEmail,
                PhotoUrl = application.CandidateProfile?.PhotoUrl,
                JobTitle = jobTitle,
                Company = posting?.PostedBy,
                JobLocation = posting?.Location,
                ScheduledAt = interview.ScheduledAt,
                DurationMinutes = interview.DurationMinutes,
                InterviewType = interview.InterviewType,
                MeetingLink = interview.MeetingLink,
                Location = interview.Location,
                InterviewerName = interview.InterviewerName,
                Notes = interview.Notes,
                ApplicationStatus = application.Status.ToString(),
                RescheduleRequested = interview.RescheduleRequested,
                RescheduleReason = interview.RescheduleReason,
                RescheduleRequestedAt = interview.RescheduleRequestedAt,
                LastRescheduledAt = interview.LastRescheduledAt
            };
        }

        public async Task<InterviewDto> RequestRescheduleAsync(
            Guid interviewId, string? reason, Guid managerUserId)
        {
            var manager = await _db.Users.FindAsync(managerUserId);
            if (manager == null || manager.Role != UserRole.HiringManager)
                throw new KeyNotFoundException("Hiring manager user not found.");

            var departments = await _db.Departments
                .Where(d => d.Head == manager.FullName && d.OrganizationName == manager.OrganizationName)
                .Select(d => d.Id)
                .ToListAsync();

            var interview = await _db.Interviews
                .Include(i => i.JobApplication)
                    .ThenInclude(a => a.JobPosting)
                .Include(i => i.JobApplication)
                    .ThenInclude(a => a.CandidateProfile)
                        .ThenInclude(cp => cp.User)
                .FirstOrDefaultAsync(i => i.Id == interviewId)
                ?? throw new KeyNotFoundException("Interview not found.");

            var posting = interview.JobApplication.JobPosting;
            if (posting.DepartmentId == null || !departments.Contains(posting.DepartmentId.Value))
                throw new UnauthorizedAccessException("You are not authorized to reschedule this interview.");

            interview.RescheduleRequested = true;
            interview.RescheduleReason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim();
            interview.RescheduleRequestedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var user = interview.JobApplication.CandidateProfile.User;
            var name = $"{user.FirstName} {user.LastName}".Trim();
            return MapInterview(interview, interview.JobApplication, posting.Title, name, user.Email);
        }

        public async Task<InterviewDto> RescheduleInterviewAsync(
            Guid interviewId, ScheduleInterviewDto dto, Guid recruiterId)
        {
            var interview = await _db.Interviews
                .Include(i => i.JobApplication)
                    .ThenInclude(a => a.JobPosting)
                .Include(i => i.JobApplication)
                    .ThenInclude(a => a.CandidateProfile)
                        .ThenInclude(cp => cp.User)
                .FirstOrDefaultAsync(i => i.Id == interviewId)
                ?? throw new KeyNotFoundException("Interview not found.");

            var job = interview.JobApplication.JobPosting;
            if (job.CreatedByRecruiterId != recruiterId && interview.CreatedByRecruiterId != recruiterId)
                throw new UnauthorizedAccessException("You do not have access to this interview.");

            var interviewType = dto.InterviewType.Trim();
            var allowedTypes = new[] { "Video", "Phone", "Onsite" };
            if (!allowedTypes.Contains(interviewType, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException("Interview type must be Video, Phone, or Onsite.");

            interviewType = allowedTypes.First(t =>
                t.Equals(interviewType, StringComparison.OrdinalIgnoreCase));

            var scheduledAt = dto.ScheduledAt.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(dto.ScheduledAt, DateTimeKind.Utc)
                : dto.ScheduledAt.ToUniversalTime();

            if (scheduledAt < DateTime.UtcNow.AddMinutes(-5))
                throw new ArgumentException("Interview time must be in the future.");

            if (interviewType == "Video" && string.IsNullOrWhiteSpace(dto.MeetingLink))
                throw new ArgumentException("A meeting link is required for video interviews.");

            if (interviewType == "Onsite" && string.IsNullOrWhiteSpace(dto.Location))
                throw new ArgumentException("A location is required for onsite interviews.");

            interview.ScheduledAt = scheduledAt;
            interview.DurationMinutes = dto.DurationMinutes > 0 ? dto.DurationMinutes : 60;
            interview.InterviewType = interviewType;
            interview.MeetingLink = string.IsNullOrWhiteSpace(dto.MeetingLink) ? null : dto.MeetingLink.Trim();
            interview.Location = string.IsNullOrWhiteSpace(dto.Location) ? null : dto.Location.Trim();
            interview.InterviewerName = dto.InterviewerName.Trim();
            interview.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();
            interview.RescheduleRequested = false;
            interview.RescheduleReason = null;
            interview.RescheduleRequestedAt = null;
            interview.LastRescheduledAt = DateTime.UtcNow;

            interview.JobApplication.Status = ApplicationStatus.Interview;
            interview.JobApplication.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var candidate = interview.JobApplication.CandidateProfile.User;
            var candidateName = $"{candidate.FirstName} {candidate.LastName}".Trim();
            var localTime = scheduledAt.ToLocalTime();
            var when = localTime.ToString("dddd, MMM d yyyy 'at' h:mm tt");
            var details = interviewType switch
            {
                "Video" => $"Join link: {interview.MeetingLink}",
                "Onsite" => $"Location: {interview.Location}",
                _ => "The interviewer will contact you by phone."
            };

            try
            {
                await _emailService.SendEmailAsync(
                    candidate.Email,
                    $"Interview rescheduled — {job.Title}",
                    $"""
                    <p>Hi {candidateName},</p>
                    <p>Your interview for <strong>{job.Title}</strong> has been rescheduled.</p>
                    <ul>
                      <li><strong>When:</strong> {when} ({interview.DurationMinutes} minutes)</li>
                      <li><strong>Type:</strong> {interviewType}</li>
                      <li><strong>Interviewer:</strong> {interview.InterviewerName}</li>
                      <li><strong>Details:</strong> {details}</li>
                    </ul>
                    {(string.IsNullOrWhiteSpace(interview.Notes) ? "" : $"<p><strong>Notes:</strong> {interview.Notes}</p>")}
                    <p>See you then!</p>
                    """);
            }
            catch
            {
                // Reschedule succeeded even if email fails
            }

            return MapInterview(interview, interview.JobApplication, job.Title, candidateName, candidate.Email);
        }
    }
}
