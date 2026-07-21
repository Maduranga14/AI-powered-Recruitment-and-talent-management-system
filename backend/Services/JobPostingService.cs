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

            var reqText = dto.Requirements?.Trim();
            var fullDesc = !string.IsNullOrWhiteSpace(reqText)
                ? $"{dto.Description.Trim()}\n\nRequirements:\n{reqText}"
                : dto.Description.Trim();

            var posting = new JobPosting
            {
                Title = dto.Title.Trim(),
                Description = fullDesc,
                Requirements = reqText,
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

            // PostedBy: automatically set to the recruiter's organization name
            var recruiter = await _db.Users
                .Include(u => u.Organization)
                .FirstOrDefaultAsync(u => u.Id == recruiterId);

            var recruiterOrgName = recruiter?.Organization?.Name ?? recruiter?.OrganizationName;

            posting.PostedBy = !string.IsNullOrWhiteSpace(recruiterOrgName)
                ? recruiterOrgName.Trim()
                : (!string.IsNullOrWhiteSpace(dto.PostedBy) ? dto.PostedBy.Trim() : string.Empty);

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
            if (dto.Description != null || dto.Requirements != null)
            {
                var curParts = (posting.Description ?? string.Empty).Split("\n\nRequirements:\n");
                var newDesc = dto.Description?.Trim() ?? curParts[0];
                var newReq = dto.Requirements?.Trim() ?? (curParts.Length > 1 ? curParts[1] : null);
                posting.Description = !string.IsNullOrWhiteSpace(newReq)
                    ? $"{newDesc}\n\nRequirements:\n{newReq}"
                    : newDesc;
                posting.Requirements = newReq;
            }
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

            var list = await query
                .OrderByDescending(j => j.PublishedAt)
                .Select(j => new
                {
                    j.Id,
                    j.Title,
                    j.Description,
                    j.Requirements,
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
                .ToListAsync();

            return list.Select(j =>
            {
                var parts = (j.Description ?? string.Empty).Split("\n\nRequirements:\n");
                return new PublicJobPageDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Description = parts[0],
                    Requirements = j.Requirements ?? (parts.Length > 1 ? parts[1] : null),
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
                };
            }).ToList();
        }

        
        public async Task<PublicJobPageDto> GetPublicJobPageAsync(Guid id)
        {
            var job = await _db.JobPostings
                .Include(j => j.Department)
                .Include(j => j.CreatedByRecruiter)
                .FirstOrDefaultAsync(j => j.Id == id && j.Status == JobStatus.Published)
                ?? throw new KeyNotFoundException("Job posting not found or is no longer available.");

            var descParts = (job.Description ?? string.Empty).Split("\n\nRequirements:\n");
            return new PublicJobPageDto
            {
                Id = job.Id,
                Title = job.Title,
                Description = descParts[0],
                Requirements = job.Requirements ?? (descParts.Length > 1 ? descParts[1] : null),
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
                    .ThenInclude(j => j.Department)
                .Include(a => a.Interviews)
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
                    .ThenInclude(j => j.Department)
                .Include(a => a.Interviews)
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
                .Include(a => a.Interviews)
                .FirstOrDefaultAsync(a => a.Id == applicationId && a.JobPostingId == jobId)
                ?? throw new KeyNotFoundException("Application not found for this job.");

            application.Status = status;
            application.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            if (status == ApplicationStatus.Hired)
            {
                try
                {
                    var candidateName = $"{application.CandidateProfile.User.FirstName} {application.CandidateProfile.User.LastName}".Trim();
                    var emailSubject = $"Congratulations! Offer extended for {job.Title}";
                    var emailBody = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;'>
                            <div style='text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;'>
                                <h1 style='color: #059669; font-size: 24px; margin: 0;'>🎉 Congratulations, {candidateName}!</h1>
                                <p style='color: #475569; font-size: 15px; margin-top: 8px;'>We are thrilled to select you for the <strong>{job.Title}</strong> role.</p>
                            </div>
                            <div style='padding: 20px 0;'>
                                <p style='color: #334155; font-size: 14px; line-height: 1.6;'>
                                    After evaluating your interview and background, our hiring team has officially decided to extend an offer for the <strong>{job.Title}</strong> position.
                                </p>
                                <div style='background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin: 20px 0;'>
                                    <p style='margin: 0; color: #065f46; font-weight: bold; font-size: 14px;'>Next Steps:</p>
                                    <p style='margin: 4px 0 0 0; color: #047857; font-size: 13px;'>
                                        Our recruitment team will contact you shortly with your official offer letter and onboarding details.
                                    </p>
                                </div>
                                <p style='color: #334155; font-size: 14px;'>Welcome aboard! We look forward to working together.</p>
                            </div>
                            <div style='border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;'>
                                <p style='margin: 0;'>This is an automated notification from TalentPortal.</p>
                            </div>
                        </div>";

                    await _emailService.SendEmailAsync(application.CandidateProfile.User.Email, emailSubject, emailBody);
                }
                catch
                {
                    // Status is updated in database even if email sending fails
                }
            }

            if (status == ApplicationStatus.Rejected)
            {
                try
                {
                    var candidateName = $"{application.CandidateProfile.User.FirstName} {application.CandidateProfile.User.LastName}".Trim();
                    var emailSubject = $"Update on your application for {job.Title}";
                    var emailBody = $@"
                        <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'>
                            <h2 style='color: #475569; margin-bottom: 16px;'>Application Update</h2>
                            <p>Dear {candidateName},</p>
                            <p>Thank you for your interest in the <strong>{job.Title}</strong> role. We appreciate the time you took to apply and share your experience with us.</p>
                            <p>After careful review of your application, we regret to inform you that we will not be moving forward with your candidacy at this time.</p>
                            <p>We encourage you to keep an eye on our career portal for future opportunities that align with your skill set.</p>
                            <p>We wish you all the best in your job search and professional endeavors.</p>
                            <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;' />
                            <p style='color: #64748b; font-size: 12px;'>This is an automated notification. Please do not reply directly to this email.</p>
                        </div>";

                    await _emailService.SendEmailAsync(application.CandidateProfile.User.Email, emailSubject, emailBody);
                }
                catch
                {
                    // Rejection status is updated in database even if email sending fails
                }
            }

            return MapApplicant(application, job.Title);
        }

        private static JobApplicantDto MapApplicant(JobApplication a, string jobTitle)
        {
            var profile = a.CandidateProfile;
            var user = profile?.User;
            var fullName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Candidate";
            var email = user?.Email ?? string.Empty;

            var latestExp = profile?.Experiences != null
                ? profile.Experiences
                    .OrderByDescending(e => e.IsCurrent)
                    .ThenByDescending(e => e.StartDate)
                    .FirstOrDefault()
                : null;

            string? experienceSummary = null;
            if (latestExp != null && profile?.Experiences != null)
            {
                var years = profile.Experiences.Count;
                experienceSummary = latestExp.IsCurrent
                    ? $"{years} role{(years == 1 ? "" : "s")} · Current: {latestExp.Title} at {latestExp.Company}"
                    : $"{years} role{(years == 1 ? "" : "s")} · {latestExp.Title} at {latestExp.Company}";
            }

            var latestInterview = a.Interviews?
                .Where(i => i.FeedbackSubmittedAt.HasValue)
                .OrderByDescending(i => i.FeedbackSubmittedAt)
                .FirstOrDefault();

            return new JobApplicantDto
            {
                ApplicationId = a.Id,
                JobPostingId = a.JobPostingId,
                CandidateProfileId = profile?.Id ?? Guid.Empty,
                UserId = profile?.UserId ?? Guid.Empty,
                FullName = fullName,
                Email = email,
                Headline = profile?.Headline,
                Location = profile?.Location,
                PhotoUrl = profile?.PhotoUrl,
                JobTitle = jobTitle,
                DepartmentName = a.JobPosting?.Department?.Name,
                Status = a.Status.ToString(),
                CoverLetter = a.CoverLetter,
                AppliedAt = a.AppliedAt,
                Skills = profile?.Skills != null ? profile.Skills.Select(s => s.Name).OrderBy(n => n).ToList() : [],
                ExperienceSummary = experienceSummary,
                ResumeUrl = profile?.ResumeUrl,
                Feedback = a.Feedback,
                Recommendation = a.Recommendation,
                OverallRating = a.OverallRating,
                SkillRatings = a.SkillRatings,
                // Post-interview evaluation
                InterviewOverallRating = latestInterview?.FeedbackOverallRating,
                InterviewRecommendation = latestInterview?.FeedbackRecommendation,
                InterviewComments = latestInterview?.FeedbackComments,
                InterviewSkillRatings = latestInterview?.FeedbackSkillRatings,
                InterviewTechnicalScore = latestInterview?.FeedbackTechnicalScore,
            };
        }

      
        private async Task<JobPostingDetailDto> BuildDetailDtoAsync(Guid id)
        {
            var detail = await _db.JobPostings
                .Where(j => j.Id == id)
                .Select(j => new
                {
                    j.Id,
                    j.Title,
                    j.Description,
                    j.Requirements,
                    j.Location,
                    EmploymentType = j.EmploymentType.ToString(),
                    Status = j.Status.ToString(),
                    DepartmentName = j.Department != null ? j.Department.Name : null,
                    j.DepartmentId,
                    j.SalaryMin,
                    j.SalaryMax,
                    j.SalaryCurrency,
                    j.ExperienceRequired,
                    j.RequiredSkills,
                    j.Deadline,
                    j.CreatedAt,
                    j.UpdatedAt,
                    j.PublishedAt,
                    j.CreatedByRecruiterId,
                    RecruiterName = j.CreatedByRecruiter != null
                        ? j.CreatedByRecruiter.FirstName + " " + j.CreatedByRecruiter.LastName
                        : string.Empty,
                    j.PostedBy
                })
                .FirstAsync();

            var descParts = (detail.Description ?? string.Empty).Split("\n\nRequirements:\n");

            return new JobPostingDetailDto
            {
                Id = detail.Id,
                Title = detail.Title,
                Description = descParts[0],
                Requirements = detail.Requirements ?? (descParts.Length > 1 ? descParts[1] : null),
                Location = detail.Location,
                EmploymentType = detail.EmploymentType,
                Status = detail.Status,
                DepartmentName = detail.DepartmentName,
                DepartmentId = detail.DepartmentId,
                SalaryMin = detail.SalaryMin,
                SalaryMax = detail.SalaryMax,
                SalaryCurrency = detail.SalaryCurrency,
                ExperienceRequired = detail.ExperienceRequired,
                RequiredSkills = detail.RequiredSkills,
                Deadline = detail.Deadline,
                CreatedAt = detail.CreatedAt,
                UpdatedAt = detail.UpdatedAt,
                PublishedAt = detail.PublishedAt,
                CreatedByRecruiterId = detail.CreatedByRecruiterId,
                RecruiterName = detail.RecruiterName,
                PostedBy = detail.PostedBy
            };
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
                .Include(a => a.Interviews)
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

            if (interviewType == "Onsite" && string.IsNullOrWhiteSpace(dto.Location))
                throw new ArgumentException("A location is required for onsite interviews.");

            await ValidateInterviewerAvailabilityAsync(dto.InterviewerName, scheduledAt, dto.DurationMinutes);

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
                         || (i.JobApplication != null && i.JobApplication.JobPosting != null && i.JobApplication.JobPosting.CreatedByRecruiterId == recruiterId))
                .OrderBy(i => i.ScheduledAt)
                .ToListAsync();

            return interviews
                .Where(i => i.JobApplication?.CandidateProfile != null)
                .Select(i =>
            {
                var user = i.JobApplication.CandidateProfile.User;
                var name = user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Candidate";
                var email = user?.Email ?? string.Empty;
                var jobTitle = i.JobApplication.JobPosting?.Title ?? "Job Position";

                return MapInterview(
                    i,
                    i.JobApplication,
                    jobTitle,
                    name,
                    email);
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
                ScheduledAt = DateTime.SpecifyKind(interview.ScheduledAt, DateTimeKind.Utc),
                DurationMinutes = interview.DurationMinutes,
                InterviewType = interview.InterviewType,
                MeetingLink = interview.MeetingLink,
                Location = interview.Location,
                InterviewerName = interview.InterviewerName,
                Notes = interview.Notes,
                ApplicationStatus = application.Status.ToString(),
                RescheduleRequested = interview.RescheduleRequested,
                RescheduleReason = interview.RescheduleReason,
                RescheduleRequestedAt = interview.RescheduleRequestedAt.HasValue
                    ? DateTime.SpecifyKind(interview.RescheduleRequestedAt.Value, DateTimeKind.Utc)
                    : null,
                LastRescheduledAt = interview.LastRescheduledAt.HasValue
                    ? DateTime.SpecifyKind(interview.LastRescheduledAt.Value, DateTimeKind.Utc)
                    : null,
                // Post-interview feedback fields
                FeedbackOverallRating = interview.FeedbackOverallRating,
                FeedbackRecommendation = interview.FeedbackRecommendation,
                FeedbackComments = interview.FeedbackComments,
                FeedbackSkillRatings = interview.FeedbackSkillRatings,
                FeedbackTechnicalScore = interview.FeedbackTechnicalScore,
                FeedbackSubmittedAt = interview.FeedbackSubmittedAt.HasValue
                    ? DateTime.SpecifyKind(interview.FeedbackSubmittedAt.Value, DateTimeKind.Utc)
                    : null,
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

            if (interviewType == "Onsite" && string.IsNullOrWhiteSpace(dto.Location))
                throw new ArgumentException("A location is required for onsite interviews.");

            await ValidateInterviewerAvailabilityAsync(dto.InterviewerName, scheduledAt, dto.DurationMinutes, excludeInterviewId: interview.Id);

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

        private async Task ValidateInterviewerAvailabilityAsync(
            string interviewerName, DateTime scheduledAt, int durationMinutes, Guid? excludeInterviewId = null)
        {
            var interviewerClean = interviewerName.Trim();
            var durationMins = durationMinutes > 0 ? durationMinutes : 60;
            var interviewEnd = scheduledAt.AddMinutes(durationMins);

            var sameDayInterviews = await _db.Interviews
                .AsNoTracking()
                .Where(i => i.ScheduledAt.Date == scheduledAt.Date)
                .ToListAsync();

            var conflict = sameDayInterviews.FirstOrDefault(i =>
                (!excludeInterviewId.HasValue || i.Id != excludeInterviewId.Value) &&
                i.InterviewerName.Equals(interviewerClean, StringComparison.OrdinalIgnoreCase) &&
                scheduledAt < i.ScheduledAt.AddMinutes(i.DurationMinutes) &&
                interviewEnd > i.ScheduledAt);

            if (conflict != null)
            {
                var conflictStart = conflict.ScheduledAt.ToLocalTime();
                var conflictEnd = conflictStart.AddMinutes(conflict.DurationMinutes);
                throw new InvalidOperationException(
                    $"Interviewer '{interviewerClean}' already has an interview scheduled from {conflictStart:h:mm tt} to {conflictEnd:h:mm tt} on {conflictStart:MMM d, yyyy}. Please choose a different time or interviewer.");
            }
        }

        public async Task<InterviewDto> SubmitInterviewFeedbackAsync(
            Guid interviewId, SubmitInterviewFeedbackDto dto, Guid managerUserId)
        {
            var manager = await _db.Users.FindAsync(managerUserId)
                ?? throw new KeyNotFoundException("Hiring manager user not found.");

            if (manager.Role != UserRole.HiringManager)
                throw new UnauthorizedAccessException("Only hiring managers can submit interview feedback.");

            // Resolve departments this manager is responsible for
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
                throw new UnauthorizedAccessException("You are not authorized to submit feedback for this interview.");

            var application = interview.JobApplication;
            if (application.Status != ApplicationStatus.Interview)
                throw new InvalidOperationException(
                    $"Feedback can only be submitted when the application status is 'Interview'. Current status: '{application.Status}'.");

            // Validate recommendation value
            var allowed = new[] { "Strong Yes", "Yes", "Maybe", "No", "Strong No" };
            if (!allowed.Contains(dto.Recommendation, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException("Recommendation must be one of: Strong Yes, Yes, Maybe, No, Strong No.");

            // Persist feedback on the Interview record
            interview.FeedbackOverallRating = dto.OverallRating;
            interview.FeedbackRecommendation = dto.Recommendation;
            interview.FeedbackComments = dto.Comments.Trim();
            interview.FeedbackSkillRatings = string.IsNullOrWhiteSpace(dto.SkillRatings) ? null : dto.SkillRatings;
            interview.FeedbackTechnicalScore = dto.TechnicalAssessmentScore;
            interview.FeedbackSubmittedAt = DateTime.UtcNow;

            // Advance application status to UnderFinalReview
            application.Status = ApplicationStatus.UnderFinalReview;
            application.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var user = application.CandidateProfile.User;
            var candidateName = $"{user.FirstName} {user.LastName}".Trim();
            return MapInterview(interview, application, posting.Title, candidateName, user.Email);
        }
    }
}
