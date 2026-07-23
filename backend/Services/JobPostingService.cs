using backend.Data;
using backend.DTOs.Jobs;
using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public class JobPostingService(
        AppDbContext db,
        IEmailService emailService,
        IHttpClientFactory httpClientFactory,
        IOptions<OpenAiSettings> openAiOptions,
        ILogger<JobPostingService> logger) : IJobPostingService
    {
        private readonly AppDbContext _db = db;
        private readonly IEmailService _emailService = emailService;
        private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
        private readonly OpenAiSettings _openAiSettings = openAiOptions.Value;
        private readonly ILogger<JobPostingService> _logger = logger;

        public async Task<JobPostingDetailDto> CreateAsync(CreateJobPostingDto dto, Guid recruiterId)
        {
            
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
            
            posting.SalaryMin = dto.SalaryMin;
            posting.SalaryMax = dto.SalaryMax;
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

        public async Task<JobApplicantsResultDto> GetApplicantsAsync(Guid jobId, Guid recruiterId, bool includeAiScores = false)
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

            var aiScores = includeAiScores
                ? await CalculateAiMatchScoresAsync(jobId, applications)
                : new Dictionary<Guid, int>();

            return new JobApplicantsResultDto
            {
                JobId = job.Id,
                JobTitle = job.Title,
                JobStatus = job.Status.ToString(),
                Applicants = applications.Select(a =>
                {
                    aiScores.TryGetValue(a.Id, out int s);
                    return MapApplicant(a, a.JobPosting?.Title ?? job.Title, s > 0 ? s : (int?)null);
                }).ToList()
            };
        }

        public async Task<List<JobApplicantDto>> GetAllApplicantsAsync(Guid recruiterId, bool includeAiScores = false)
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

            var aiScores = new Dictionary<Guid, int>();
            if (includeAiScores)
            {
                foreach (var group in applications.GroupBy(a => a.JobPostingId))
                {
                    var jobScores = await CalculateAiMatchScoresAsync(group.Key, group.ToList());
                    foreach (var kvp in jobScores) aiScores[kvp.Key] = kvp.Value;
                }
            }

            return applications.Select(a =>
            {
                aiScores.TryGetValue(a.Id, out int s);
                return MapApplicant(a, a.JobPosting?.Title ?? string.Empty, s > 0 ? s : (int?)null);
            }).ToList();
        }

        public async Task<JobApplicantDto> UpdateApplicationStatusAsync(
            Guid jobId, Guid applicationId, ApplicationStatus status, Guid recruiterId)
        {
            var job = await _db.JobPostings
                .AsNoTracking()
                .FirstOrDefaultAsync(j => j.Id == jobId && j.CreatedByRecruiterId == recruiterId)
                ?? throw new KeyNotFoundException("Job posting not found or you do not have access.");

            var application = await _db.JobApplications
                .Include(a => a.JobPosting)
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

            var aiScores = await CalculateAiMatchScoresAsync(jobId, new List<JobApplication> { application });
            aiScores.TryGetValue(application.Id, out int aiScore);
            return MapApplicant(application, job.Title, aiScore > 0 ? aiScore : null);
        }

        private static JobApplicantDto MapApplicant(JobApplication a, string jobTitle, int? overrideMatchScore = null)
        {
            var profile = a.CandidateProfile;
            var user = profile?.User;
            var fullName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Candidate";
            var email = user?.Email ?? string.Empty;

            int matchScore = 0;
            if (a.Status == ApplicationStatus.Reviewed)
            {
                matchScore = CalculateScoreFromManagerReview(a);
            }
            else if (a.Status == ApplicationStatus.UnderFinalReview)
            {
                matchScore = CalculateScoreForFinalReview(a);
            }
            else if (a.Status == ApplicationStatus.Applied || a.Status == ApplicationStatus.UnderReview)
            {
                if (overrideMatchScore.HasValue && overrideMatchScore.Value > 0)
                {
                    matchScore = overrideMatchScore.Value;
                }
                else
                {
                    var mapScores = CalcKeywordScores(new List<JobApplication> { a });
                    mapScores.TryGetValue(a.Id, out matchScore);
                }
            }

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
                AppliedAt = DateTime.SpecifyKind(a.AppliedAt, DateTimeKind.Utc),
                MatchScore = matchScore,
                Skills = profile?.Skills != null ? profile.Skills.Select(s => s.Name).OrderBy(n => n).ToList() : [],
                Experiences = profile?.Experiences != null
                    ? profile.Experiences
                        .OrderByDescending(e => e.IsCurrent)
                        .ThenByDescending(e => e.StartDate)
                        .Select(e => new WorkExperienceDto
                        {
                            Title = e.Title,
                            Company = e.Company,
                            StartDate = e.StartDate,
                            EndDate = e.EndDate,
                            IsCurrent = e.IsCurrent,
                            Description = e.Description,
                        }).ToList()
                    : [],
                Educations = profile?.Educations != null
                    ? profile.Educations
                        .OrderByDescending(e => e.EndDate ?? DateTime.MaxValue)
                        .Select(e => new EducationDto
                        {
                            Institution = e.Institution,
                            Degree = e.Degree,
                            FieldOfStudy = e.FieldOfStudy,
                            StartDate = e.StartDate,
                            EndDate = e.EndDate,
                        }).ToList()
                    : [],
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

        private async Task<List<Guid>> GetManagerDepartmentIdsAsync(User manager)
        {
            var deptIds = new List<Guid>();

            if (manager.DepartmentId.HasValue)
            {
                deptIds.Add(manager.DepartmentId.Value);
            }

            var managerFullName = manager.FullName.Trim().ToLower();
            var managerAltName = $"{manager.FirstName} {manager.LastName}".Trim().ToLower();
            var userOrgName = manager.Organization?.Name ?? manager.OrganizationName;

            var headedDepts = await _db.Departments
                .Where(d => d.Head != null &&
                            (d.Head.ToLower() == managerFullName || d.Head.ToLower() == managerAltName) &&
                            (userOrgName == null || d.OrganizationName == userOrgName || d.OrganizationId == manager.OrganizationId))
                .Select(d => d.Id)
                .ToListAsync();

            deptIds.AddRange(headedDepts);

            if (deptIds.Count == 0 && (manager.OrganizationId.HasValue || !string.IsNullOrWhiteSpace(userOrgName)))
            {
                var cleanOrgName = userOrgName?.ToLower();
                var orgDepts = await _db.Departments
                    .Where(d => (manager.OrganizationId.HasValue && d.OrganizationId == manager.OrganizationId.Value)
                             || (cleanOrgName != null && d.OrganizationName != null && d.OrganizationName.ToLower() == cleanOrgName))
                    .ToListAsync();

                var managerDeptName = manager.Department?.Name;
                if (!string.IsNullOrWhiteSpace(managerDeptName))
                {
                    var cleanDeptName = managerDeptName.ToLower();
                    var matched = orgDepts.Where(d => d.Name != null && d.Name.ToLower() == cleanDeptName).Select(d => d.Id);
                    deptIds.AddRange(matched);
                }

                if (deptIds.Count == 0)
                {
                    deptIds.AddRange(orgDepts.Select(d => d.Id));
                }
            }

            return deptIds.Distinct().ToList();
        }

        public async Task<List<JobApplicantDto>> GetManagerApplicantsAsync(Guid managerUserId, bool includeAiScores = false)
        {
            var manager = await _db.Users
                .Include(u => u.Organization)
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == managerUserId);

            if (manager == null || manager.Role != UserRole.HiringManager)
                throw new KeyNotFoundException("Hiring manager user not found.");

            var departments = await GetManagerDepartmentIdsAsync(manager);

            if (departments.Count == 0)
                return new List<JobApplicantDto>();

            var applications = await _db.JobApplications
                .AsSplitQuery()
                .Include(a => a.JobPosting)
                    .ThenInclude(j => j.Department)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.User)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Experiences)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Skills)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Educations)
                .Include(a => a.Interviews)
                .Where(a => a.JobPosting.DepartmentId != null &&
                            departments.Contains(a.JobPosting.DepartmentId.Value) &&
                            a.Status != ApplicationStatus.Applied)
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();

            var aiScores = new Dictionary<Guid, int>();
            if (includeAiScores)
            {
                var groupedByJob = applications.GroupBy(a => a.JobPostingId);
                foreach (var group in groupedByJob)
                {
                    var jobScores = await CalculateAiMatchScoresAsync(group.Key, group.ToList());
                    foreach (var kvp in jobScores)
                    {
                        aiScores[kvp.Key] = kvp.Value;
                    }
                }
            }

            return applications
                .Where(a => a.CandidateProfile?.User != null)
                .Select(a => {
                aiScores.TryGetValue(a.Id, out int aiScore);
                var jobTitle = a.JobPosting?.Title ?? "Position";
                return MapApplicant(a, jobTitle, aiScore > 0 ? aiScore : null);
            }).ToList();
        }


        public async Task<JobApplicantDto> SubmitManagerFeedbackAsync(Guid applicationId, string recommendation, string feedback, int overallRating, string? skillRatings, Guid managerUserId)
        {
            var manager = await _db.Users
                .Include(u => u.Organization)
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == managerUserId);

            if (manager == null || manager.Role != UserRole.HiringManager)
                throw new KeyNotFoundException("Hiring manager user not found.");

            var departments = await GetManagerDepartmentIdsAsync(manager);

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

           
            application.Feedback = feedback;
            application.Recommendation = recommendation;
            application.OverallRating = overallRating;
            application.SkillRatings = skillRatings;

            
            application.Status = ApplicationStatus.Reviewed;

            application.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return MapApplicant(application, application.JobPosting.Title);
        }

        public async Task<JobApplicantDto> MakeHiringDecisionAsync(Guid applicationId, string decision, string? notes, Guid managerUserId)
        {
            var manager = await _db.Users
                .Include(u => u.Organization)
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == managerUserId);

            if (manager == null || manager.Role != UserRole.HiringManager)
                throw new KeyNotFoundException("Hiring manager user not found.");

            var departments = await GetManagerDepartmentIdsAsync(manager);

            var application = await _db.JobApplications
                .Include(a => a.JobPosting)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.User)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Experiences)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Skills)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.Educations)
                .Include(a => a.Interviews)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
                throw new KeyNotFoundException("Application not found.");

            if (application.JobPosting.DepartmentId == null || !departments.Contains(application.JobPosting.DepartmentId.Value))
                throw new UnauthorizedAccessException("You are not authorized to manage this application.");

            ApplicationStatus targetStatus;
            var cleanDecision = decision.Trim().ToLower();
            if (cleanDecision is "hire" or "hired" or "offer")
            {
                targetStatus = ApplicationStatus.Offer;
                if (string.IsNullOrWhiteSpace(application.Recommendation)) application.Recommendation = "Strong Yes";
            }
            else if (cleanDecision is "reject" or "rejected")
            {
                targetStatus = ApplicationStatus.Rejected;
                if (string.IsNullOrWhiteSpace(application.Recommendation)) application.Recommendation = "No";
            }
            else if (cleanDecision is "underfinalreview" or "review")
            {
                targetStatus = ApplicationStatus.UnderFinalReview;
            }
            else if (Enum.TryParse<ApplicationStatus>(decision, true, out var parsed))
            {
                targetStatus = parsed;
            }
            else
            {
                throw new ArgumentException($"Invalid decision status '{decision}'. Expected Hired, Rejected, or UnderFinalReview.");
            }

            application.Status = targetStatus;
            if (!string.IsNullOrWhiteSpace(notes))
            {
                var prefix = $"[Hiring Decision: {targetStatus}] ";
                application.Feedback = string.IsNullOrWhiteSpace(application.Feedback)
                    ? $"{prefix}{notes.Trim()}"
                    : $"{application.Feedback}\n\n{prefix}{notes.Trim()}";
            }

            application.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            
            var user = application.CandidateProfile?.User;
            var candidateEmail = user?.Email;
            var candidateName = user != null
                ? $"{user.FirstName} {user.LastName}".Trim()
                : "Candidate";

            if (!string.IsNullOrWhiteSpace(candidateEmail))
            {
                var jobTitle = application.JobPosting.Title;
                var orgName = manager.Organization?.Name ?? manager.OrganizationName ?? "Hiring Team";

                if (targetStatus == ApplicationStatus.Offer || targetStatus == ApplicationStatus.Hired)
                {

                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            var subject = $"Congratulations! Offer Decision for {jobTitle}";
                            var body = $@"
                                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;'>
                                    <div style='text-align: center; padding-bottom: 20px; border-b: 1px solid #f1f5f9;'>
                                        <h2 style='color: #059669; font-size: 24px; margin: 0;'>🎉 Congratulations!</h2>
                                        <p style='color: #64748b; font-size: 14px; margin-top: 4px;'>You have been selected for the position</p>
                                    </div>
                                    <div style='padding: 20px 0;'>
                                        <p style='font-size: 16px; color: #1e293b;'>Dear <strong>{candidateName}</strong>,</p>
                                        <p style='font-size: 15px; color: #334155; line-height: 1.6;'>
                                            We are thrilled to inform you that following your interviews and evaluations for the <strong>{jobTitle}</strong> position, our hiring manager has decided to <strong>HIRE</strong> you for the role!
                                        </p>
                                        {(string.IsNullOrWhiteSpace(notes) ? "" : $"<div style='background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 14px; margin: 20px 0;'><p style='margin:0; font-size: 14px; color: #065f46;'><strong>Hiring Manager Note:</strong> {notes}</p></div>")}
                                        <p style='font-size: 15px; color: #334155; line-height: 1.6;'>
                                            Our recruitment team will be reaching out to you shortly with onboarding instructions and formal paperwork.
                                        </p>
                                    </div>
                                    <div style='border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;'>
                                        <p style='font-size: 14px; color: #64748b; margin: 0;'>Best regards,<br/><strong style='color: #0f172a;'>{orgName}</strong></p>
                                        <p style='color: #94a3b8; font-size: 12px; margin-top: 16px;'>This is an automated decision notification from TalentPortal.</p>
                                    </div>
                                </div>";
                            await _emailService.SendEmailAsync(candidateEmail, subject, body);
                        }
                        catch
                        {
                            // Fail silently background task
                        }
                    });
                }
                else if (targetStatus == ApplicationStatus.Rejected)
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            var subject = $"Application Update: {jobTitle}";
                            var body = $@"
                                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;'>
                                    <div style='text-align: center; padding-bottom: 20px; border-b: 1px solid #f1f5f9;'>
                                        <h2 style='color: #475569; font-size: 20px; margin: 0;'>Application Status Update</h2>
                                    </div>
                                    <div style='padding: 20px 0;'>
                                        <p style='font-size: 16px; color: #1e293b;'>Dear <strong>{candidateName}</strong>,</p>
                                        <p style='font-size: 15px; color: #334155; line-height: 1.6;'>
                                            Thank you for interviewing and taking the time to discuss the <strong>{jobTitle}</strong> role with our hiring team.
                                        </p>
                                        <p style='font-size: 15px; color: #334155; line-height: 1.6;'>
                                            After careful evaluation of all candidates, we regret to inform you that we have decided to proceed with another applicant whose background more closely matches our immediate technical needs.
                                        </p>
                                        {(string.IsNullOrWhiteSpace(notes) ? "" : $"<div style='background-color: #f8fafc; border-left: 4px solid #64748b; border-radius: 8px; padding: 14px; margin: 20px 0;'><p style='margin:0; font-size: 14px; color: #334155;'><strong>Hiring Team Feedback:</strong> {notes}</p></div>")}
                                        <p style='font-size: 15px; color: #334155; line-height: 1.6;'>
                                            We appreciate your effort throughout our selection process and wish you success in your job search.
                                        </p>
                                    </div>
                                    <div style='border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;'>
                                        <p style='font-size: 14px; color: #64748b; margin: 0;'>Best regards,<br/><strong style='color: #0f172a;'>{orgName}</strong></p>
                                        <p style='color: #94a3b8; font-size: 12px; margin-top: 16px;'>This is an automated decision notification from TalentPortal.</p>
                                    </div>
                                </div>";
                            await _emailService.SendEmailAsync(candidateEmail, subject, body);
                        }
                        catch
                        {
                            // Fail silently background task
                        }
                    });
                }
            }

            var aiScores = await CalculateAiMatchScoresAsync(application.JobPostingId, new List<JobApplication> { application });
            aiScores.TryGetValue(application.Id, out int aiScore);
            return MapApplicant(application, application.JobPosting.Title, aiScore > 0 ? aiScore : null);
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
            var manager = await _db.Users
                .Include(u => u.Organization)
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == managerUserId);

            if (manager == null || manager.Role != UserRole.HiringManager)
                throw new KeyNotFoundException("Hiring manager user not found.");

            var departments = await GetManagerDepartmentIdsAsync(manager);

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

            return interviews
                .Where(i => i.JobApplication?.CandidateProfile?.User != null)
                .Select(i =>
            {
                var user = i.JobApplication.CandidateProfile.User;
                var name = $"{user.FirstName} {user.LastName}".Trim();
                var jobTitle = i.JobApplication.JobPosting?.Title ?? "Job Position";
                return MapInterview(
                    i,
                    i.JobApplication,
                    jobTitle,
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
                
                FeedbackOverallRating = interview.FeedbackOverallRating,
                FeedbackRecommendation = interview.FeedbackRecommendation,
                FeedbackComments = interview.FeedbackComments,
                FeedbackSkillRatings = interview.FeedbackSkillRatings,
                FeedbackTechnicalScore = interview.FeedbackTechnicalScore,
                FeedbackSubmittedAt = interview.FeedbackSubmittedAt.HasValue
                    ? DateTime.SpecifyKind(interview.FeedbackSubmittedAt.Value, DateTimeKind.Utc)
                    : null,
                GoogleCalendarEventId = interview.GoogleCalendarEventId,
                GoogleCalendarHtmlLink = interview.GoogleCalendarHtmlLink,
                IsSyncedToGoogleCalendar = interview.IsSyncedToGoogleCalendar,
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
            var manager = await _db.Users
                .Include(u => u.Organization)
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == managerUserId)
                ?? throw new KeyNotFoundException("Hiring manager user not found.");

            if (manager.Role != UserRole.HiringManager)
                throw new UnauthorizedAccessException("Only hiring managers can submit interview feedback.");

            var departments = await GetManagerDepartmentIdsAsync(manager);

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

            
            var allowed = new[] { "Strong Yes", "Yes", "Maybe", "No", "Strong No" };
            if (!allowed.Contains(dto.Recommendation, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException("Recommendation must be one of: Strong Yes, Yes, Maybe, No, Strong No.");

            
            interview.FeedbackOverallRating = dto.OverallRating;
            interview.FeedbackRecommendation = dto.Recommendation;
            interview.FeedbackComments = dto.Comments.Trim();
            interview.FeedbackSkillRatings = string.IsNullOrWhiteSpace(dto.SkillRatings) ? null : dto.SkillRatings;
            interview.FeedbackTechnicalScore = dto.TechnicalAssessmentScore;
            interview.FeedbackSubmittedAt = DateTime.UtcNow;

            
            application.Status = ApplicationStatus.UnderFinalReview;
            application.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var user = application.CandidateProfile.User;
            var candidateName = $"{user.FirstName} {user.LastName}".Trim();
            return MapInterview(interview, application, posting.Title, candidateName, user.Email);
        }

        private async Task<Dictionary<Guid, int>> CalculateAiMatchScoresAsync(Guid jobId, List<JobApplication> applications)
        {
            if (applications.Count == 0)
                return new Dictionary<Guid, int>();

            var keywordScores = CalcKeywordScores(applications);

            
            var activeApps = applications
                .Where(a => a.Status == ApplicationStatus.Applied || a.Status == ApplicationStatus.UnderReview)
                .ToList();

            if (activeApps.Count == 0)
                return keywordScores;

            var apiKey = ResolveOpenAiApiKey();
            if (string.IsNullOrWhiteSpace(apiKey))
                return keywordScores;

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(6));

            try
            {
                var job = await _db.JobPostings.AsNoTracking().FirstOrDefaultAsync(j => j.Id == jobId, cts.Token);
                if (job == null) return keywordScores;

                var client = _httpClientFactory.CreateClient("OpenAI");
                var modelName = string.IsNullOrWhiteSpace(_openAiSettings.Model) ? "gpt-4o-mini" : _openAiSettings.Model;

                var candidatesList = activeApps.Select(a => new
                {
                    ApplicationId = a.Id,
                    Headline = a.CandidateProfile?.Headline ?? string.Empty,
                    Skills = a.CandidateProfile?.Skills.Select(s => s.Name).ToList() ?? new List<string>(),
                    Experiences = a.CandidateProfile != null
                        ? a.CandidateProfile.Experiences.Select(e => new { e.Title, e.Company, e.Description }).ToList()
                        : new List<object>().Select(e => new { Title = string.Empty, Company = string.Empty, Description = (string?)null }).ToList()
                }).ToList();

                var payload = new
                {
                    model = modelName,
                    temperature = 0.2,
                    max_tokens = 512,
                    response_format = new { type = "json_object" },
                    messages = new[]
                    {
                        new { role = "system", content = @"You are a recruiter AI inside TalentPortal AI.
For each candidate, calculate matchScore (0-100) based on how well their skills, title, work history, and experience match the job title, description, and required skills.
Return ONLY a valid JSON object: {""scores"":[{""applicationId"":""<guid>"",""matchScore"":92}]}. No markdown." },
                        new { role = "user", content = $"Job Title: {job.Title}\nJob Description: {job.Description}\nRequired Skills: {job.RequiredSkills}\n\nCandidates:\n{JsonSerializer.Serialize(candidatesList)}" }
                    }
                };

                using var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
                {
                    Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
                };
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

                using var response = await client.SendAsync(request, cts.Token);
                if (!response.IsSuccessStatusCode) return keywordScores;

                var body = await response.Content.ReadAsStringAsync(cts.Token);
                using var doc = JsonDocument.Parse(body);
                var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

                if (!string.IsNullOrWhiteSpace(content))
                {
                    using var contentDoc = JsonDocument.Parse(content);
                    if (contentDoc.RootElement.TryGetProperty("scores", out var scoresProperty))
                    {
                        foreach (var item in scoresProperty.EnumerateArray())
                        {
                            var appIdStr = item.GetProperty("applicationId").GetString();
                            if (Guid.TryParse(appIdStr, out var appId))
                                keywordScores[appId] = item.GetProperty("matchScore").GetInt32();
                        }
                    }
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("AI match score calculation timed out for job {JobId}. Using keyword scores.", jobId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during batch AI match score calculation for job {JobId}.", jobId);
            }

            return keywordScores;
        }

        private static int CalculateScoreFromManagerReview(JobApplication a)
        {
            if (a.OverallRating.HasValue && a.OverallRating.Value > 0)
            {
                return a.OverallRating.Value switch
                {
                    5 => 95,
                    4 => 80,
                    3 => 65,
                    2 => 40,
                    1 => 20,
                    _ => Math.Min(100, a.OverallRating.Value * 20)
                };
            }

            if (!string.IsNullOrWhiteSpace(a.Recommendation))
            {
                var rec = a.Recommendation.Trim().ToLowerInvariant();
                if (rec.Contains("strong yes")) return 95;
                if (rec.Contains("yes")) return 80;
                if (rec.Contains("maybe")) return 60;
                if (rec.Contains("strong no")) return 15;
                if (rec.Contains("no")) return 35;
            }

            return 70;
        }

        private static int CalculateScoreForFinalReview(JobApplication a)
        {
            int preScore = CalculateScoreFromManagerReview(a);

            var interview = a.Interviews?
                .Where(i => i.FeedbackSubmittedAt.HasValue || !string.IsNullOrEmpty(i.FeedbackRecommendation))
                .OrderByDescending(i => i.FeedbackSubmittedAt ?? i.ScheduledAt)
                .FirstOrDefault();

            if (interview == null)
            {
                return preScore;
            }

            int postScore = 70;
            if (interview.FeedbackTechnicalScore.HasValue && interview.FeedbackTechnicalScore.Value > 0)
            {
                postScore = interview.FeedbackTechnicalScore.Value;
            }
            else if (interview.FeedbackOverallRating.HasValue && interview.FeedbackOverallRating.Value > 0)
            {
                postScore = interview.FeedbackOverallRating.Value switch
                {
                    5 => 95,
                    4 => 80,
                    3 => 65,
                    2 => 40,
                    1 => 20,
                    _ => Math.Min(100, interview.FeedbackOverallRating.Value * 20)
                };
            }

            if (!string.IsNullOrWhiteSpace(interview.FeedbackRecommendation))
            {
                var rec = interview.FeedbackRecommendation.Trim().ToLowerInvariant();
                int recScore = rec switch
                {
                    var r when r.Contains("strong yes") => 95,
                    var r when r.Contains("yes") => 80,
                    var r when r.Contains("maybe") => 60,
                    var r when r.Contains("strong no") => 15,
                    var r when r.Contains("no") => 35,
                    _ => postScore
                };
                postScore = (postScore + recScore) / 2;
            }

            int combined = (int)Math.Round((preScore * 0.3) + (postScore * 0.7));
            return Math.Clamp(combined, 0, 100);
        }

        private static Dictionary<Guid, int> CalcKeywordScores(List<JobApplication> applications)
        {
            var scores = new Dictionary<Guid, int>();
            foreach (var a in applications)
            {
                if (a.Status != ApplicationStatus.Applied && a.Status != ApplicationStatus.UnderReview)
                {
                    scores[a.Id] = 0;
                    continue;
                }

                var profile = a.CandidateProfile;
                int score = 75;
                if (profile != null && a.JobPosting != null)
                {
                    var rawSkills = string.IsNullOrEmpty(a.JobPosting.RequiredSkills)
                        ? new List<string>()
                        : a.JobPosting.RequiredSkills.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(s => s.Trim().ToLowerInvariant()).ToList();

                    var candidateSkills = profile.Skills.Select(s => s.Name.Trim().ToLowerInvariant()).ToList();

                    if (rawSkills.Count > 0 && candidateSkills.Count > 0)
                    {
                        int matches = 0;
                        foreach (var req in rawSkills)
                        {
                            if (candidateSkills.Any(cs => cs.Equals(req, StringComparison.OrdinalIgnoreCase) || cs.Contains(req) || req.Contains(cs)))
                            {
                                matches++;
                            }
                        }

                        double matchRatio = (double)matches / rawSkills.Count;
                        score = Math.Max(70, (int)Math.Round(matchRatio * 100));

                        if (candidateSkills.Count > rawSkills.Count && score >= 50)
                        {
                            score = Math.Min(95, score + 5);
                        }
                    }
                    else if (!string.IsNullOrWhiteSpace(a.JobPosting.Title) && !string.IsNullOrWhiteSpace(profile.Headline))
                    {
                        if (profile.Headline.Contains(a.JobPosting.Title, StringComparison.OrdinalIgnoreCase) ||
                            a.JobPosting.Title.Contains(profile.Headline, StringComparison.OrdinalIgnoreCase))
                        {
                            score = 85;
                        }
                    }
                }
                scores[a.Id] = Math.Clamp(score, 65, 95);
            }
            return scores;
        }

        public async Task<CommunicationLogDto> SendApplicantEmailAsync(Guid applicationId, SendApplicantEmailDto dto, Guid recruiterId)
        {
            var application = await _db.JobApplications
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.User)
                .Include(a => a.JobPosting)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            var recruiter = await _db.Users.FirstOrDefaultAsync(u => u.Id == recruiterId);
            var recruiterName = recruiter != null ? $"{recruiter.FirstName} {recruiter.LastName}" : "Recruiter";
            var recruiterEmail = recruiter?.Email ?? "recruiter@talentportal.com";

            string candidateName = application?.CandidateProfile?.User != null 
                ? $"{application.CandidateProfile.User.FirstName} {application.CandidateProfile.User.LastName}" 
                : "Candidate";
            string candidateEmail = application?.CandidateProfile?.User?.Email ?? string.Empty;

            if (string.IsNullOrWhiteSpace(candidateEmail))
            {
                candidateEmail = "candidate@example.com";
            }

            
            try
            {
                await _emailService.SendEmailAsync(
                    candidateEmail,
                    dto.Subject.Trim(),
                    $"<p>Dear {candidateName},</p><p>{dto.Body.Replace("\n", "<br/>")}</p><hr/><p>Sent by {recruiterName} ({recruiterEmail}) via TalentPortal.</p>"
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "SMTP Email delivery failed for candidate {Email}. Logging record anyway.", candidateEmail);
            }

            
            if (application != null && recruiter != null)
            {
                var log = new CommunicationLog
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = applicationId,
                    SenderId = recruiterId,
                    Subject = dto.Subject.Trim(),
                    Body = dto.Body.Trim(),
                    MessageType = string.IsNullOrWhiteSpace(dto.MessageType) ? "ManualEmail" : dto.MessageType.Trim(),
                    SentAt = DateTime.UtcNow
                };

                try
                {
                    _db.CommunicationLogs.Add(log);
                    await _db.SaveChangesAsync();
                }
                catch (Exception dbEx)
                {
                    _logger.LogWarning(dbEx, "Could not save CommunicationLog to database for application {ApplicationId}. Returning in-memory DTO.", applicationId);
                }

                return new CommunicationLogDto
                {
                    Id = log.Id,
                    ApplicationId = log.ApplicationId,
                    SenderId = log.SenderId,
                    SenderName = recruiterName,
                    Subject = log.Subject,
                    Body = log.Body,
                    MessageType = log.MessageType,
                    SentAt = log.SentAt
                };
            }

           
            return new CommunicationLogDto
            {
                Id = Guid.NewGuid(),
                ApplicationId = applicationId,
                SenderId = recruiterId,
                SenderName = recruiterName,
                Subject = dto.Subject.Trim(),
                Body = dto.Body.Trim(),
                MessageType = string.IsNullOrWhiteSpace(dto.MessageType) ? "ManualEmail" : dto.MessageType.Trim(),
                SentAt = DateTime.UtcNow
            };
        }

        public async Task<List<CommunicationLogDto>> GetCommunicationHistoryAsync(Guid applicationId, Guid recruiterId)
        {
            try
            {
                return await _db.CommunicationLogs
                    .AsNoTracking()
                    .Include(l => l.Sender)
                    .Where(l => l.ApplicationId == applicationId)
                    .OrderByDescending(l => l.SentAt)
                    .Select(l => new CommunicationLogDto
                    {
                        Id = l.Id,
                        ApplicationId = l.ApplicationId,
                        SenderId = l.SenderId,
                        SenderName = l.Sender != null ? $"{l.Sender.FirstName} {l.Sender.LastName}" : "Recruiter",
                        Subject = l.Subject,
                        Body = l.Body,
                        MessageType = l.MessageType,
                        SentAt = l.SentAt
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to retrieve communication history for application {ApplicationId}. Returning empty list.", applicationId);
                return new List<CommunicationLogDto>();
            }
        }

        private string ResolveOpenAiApiKey()
        {
            if (!string.IsNullOrWhiteSpace(_openAiSettings.ApiKey))
                return _openAiSettings.ApiKey.Trim();

            return Environment.GetEnvironmentVariable("OPENAI_API_KEY")
                ?? Environment.GetEnvironmentVariable("TalentPortal_OpenAI__ApiKey")
                ?? string.Empty;
        }
    }
}

