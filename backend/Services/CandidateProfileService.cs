using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using backend.Data;
using backend.DTOs.Candidate;
using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;


namespace backend.Services
{
    public class CandidateProfileService(
        AppDbContext db,
        IWebHostEnvironment env,
        IHttpContextAccessor httpContextAccessor,
        ICloudStorageService cloudStorage,
        IHttpClientFactory httpClientFactory,
        IOptions<OpenAiSettings> openAiOptions) : ICandidateProfileService
    {
        private readonly AppDbContext _db = db;
        private readonly IWebHostEnvironment _env = env;
        private readonly IHttpContextAccessor _http = httpContextAccessor;
        private readonly ICloudStorageService _cloudStorage = cloudStorage;
        private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
        private readonly OpenAiSettings _openAiSettings = openAiOptions.Value;

        private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web)
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            PropertyNameCaseInsensitive = true
        };

        
        private static readonly string[] AllowedExtensions = [".pdf", ".doc", ".docx"];
        private static readonly string[] AllowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
        private const long MaxFileSizeBytes = 5 * 1024 * 1024;

        
        public async Task<CandidateProfileResponseDto> CreateProfileAsync(
            Guid userId, CreateCandidateProfileDto dto)
        {
            var user = await _db.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("User not found.");

            var exists = await _db.CandidateProfiles
                .AnyAsync(cp => cp.UserId == userId && !cp.IsDeleted);

            if (exists)
                throw new InvalidOperationException(
                    "A profile already exists for this account. Use PUT to update it.");

            var profile = new CandidateProfile
            {
                UserId = userId,
                Phone = dto.Phone.Trim(),
                Location = dto.Location.Trim(),
                Headline = dto.Headline.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            
            foreach (var exp in dto.Experiences)
                profile.Experiences.Add(MapExperience(exp));

           
            foreach (var ed in dto.Educations)
                profile.Educations.Add(MapEducation(ed));

            
            foreach (var skill in dto.Skills.Select(s => s.Trim()).Where(s => s.Length > 0).Distinct())
                profile.Skills.Add(new CandidateSkill { Name = skill });

           
            if (dto.Links != null)
                profile.Links = MapLinks(dto.Links);

            _db.CandidateProfiles.Add(profile);
            await _db.SaveChangesAsync();

            return await BuildResponseAsync(profile.Id, user);
        }

       
        public async Task<CandidateProfileResponseDto> GetProfileAsync(Guid userId)
        {
            var (profile, user) = await LoadProfileAsync(userId);
            return await BuildResponseAsync(profile.Id, user);
        }

        public async Task<CandidateProfileResponseDto> GetProfileByIdAsync(Guid profileId)
        {
            var profile = await _db.CandidateProfiles
                .Include(cp => cp.User)
                .Include(cp => cp.Experiences)
                .Include(cp => cp.Educations)
                .Include(cp => cp.Skills)
                .Include(cp => cp.Links)
                .FirstOrDefaultAsync(cp => cp.Id == profileId && !cp.IsDeleted)
                ?? throw new KeyNotFoundException("Candidate profile not found.");

            return await BuildResponseAsync(profile.Id, profile.User);
        }

        
        public async Task<CandidateProfileResponseDto> UpdateProfileAsync(
            Guid userId, UpdateCandidateProfileDto dto)
        {
            var (profile, user) = await LoadProfileAsync(userId);

            if (dto.Phone != null) profile.Phone = dto.Phone.Trim();
            if (dto.Location != null) profile.Location = dto.Location.Trim();
            if (dto.Headline != null) profile.Headline = dto.Headline.Trim();

            
            if (dto.Experiences != null)
            {
                _db.WorkExperiences.RemoveRange(profile.Experiences);
                foreach (var exp in dto.Experiences)
                {
                    _db.WorkExperiences.Add(new WorkExperience
                    {
                        CandidateProfileId = profile.Id,
                        Company = exp.Company.Trim(),
                        Title = exp.Title.Trim(),
                        StartDate = exp.StartDate,
                        EndDate = exp.IsCurrent ? null : exp.EndDate,
                        IsCurrent = exp.IsCurrent,
                        Description = exp.Description?.Trim()
                    });
                }
            }

            
            if (dto.Educations != null)
            {
                _db.Educations.RemoveRange(profile.Educations);
                foreach (var ed in dto.Educations)
                {
                    _db.Educations.Add(new Education
                    {
                        CandidateProfileId = profile.Id,
                        Institution = ed.Institution.Trim(),
                        Degree = ed.Degree.Trim(),
                        FieldOfStudy = ed.FieldOfStudy.Trim(),
                        StartDate = ed.StartDate,
                        EndDate = ed.EndDate
                    });
                }
            }

            
            if (dto.Skills != null)
            {
                _db.CandidateSkills.RemoveRange(profile.Skills);
                foreach (var skill in dto.Skills.Select(s => s.Trim()).Where(s => s.Length > 0).Distinct())
                {
                    _db.CandidateSkills.Add(new CandidateSkill
                    {
                        CandidateProfileId = profile.Id,
                        Name = skill
                    });
                }
            }

            
            if (dto.Links != null)
            {
                if (profile.Links != null)
                {
                    profile.Links.LinkedIn = dto.Links.LinkedIn;
                    profile.Links.Portfolio = dto.Links.Portfolio;
                    profile.Links.GitHub = dto.Links.GitHub;
                }
                else
                {
                    _db.CandidateLinks.Add(new CandidateLinks
                    {
                        CandidateProfileId = profile.Id,
                        LinkedIn = dto.Links.LinkedIn,
                        Portfolio = dto.Links.Portfolio,
                        GitHub = dto.Links.GitHub
                    });
                }
            }

            profile.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return await BuildResponseAsync(profile.Id, user);
        }

       
        public async Task<string> UploadResumeAsync(Guid userId, IFormFile file)
        {
            var (profile, _) = await LoadProfileAsync(userId);

           
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext))
                throw new ArgumentException(
                    $"Unsupported file type '{ext}'. Allowed: {string.Join(", ", AllowedExtensions)}.");

          
            if (file.Length > MaxFileSizeBytes)
                throw new ArgumentException("File size exceeds the 5 MB limit.");

           
            if (!string.IsNullOrEmpty(profile.ResumeUrl))
                await _cloudStorage.DeleteFileAsync(profile.ResumeUrl);

            
            var fileName = $"{profile.Id}_{Guid.NewGuid():N}{ext}";
            string fileUrl;
            using (var stream = file.OpenReadStream())
            {
                fileUrl = await _cloudStorage.UploadFileAsync(stream, fileName, file.ContentType, "candidate-resumes");
            }

            profile.ResumeUrl = fileUrl;
            profile.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return fileUrl;
        }

       
        public async Task DeleteResumeAsync(Guid userId)
        {
            var (profile, _) = await LoadProfileAsync(userId);

            if (string.IsNullOrEmpty(profile.ResumeUrl))
                throw new InvalidOperationException("No resume is currently uploaded.");

            await _cloudStorage.DeleteFileAsync(profile.ResumeUrl);
            profile.ResumeUrl = null;
            profile.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

       
        public async Task<string> UploadPhotoAsync(Guid userId, IFormFile file)
        {
            var (profile, _) = await LoadProfileAsync(userId);

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedImageExtensions.Contains(ext))
                throw new ArgumentException(
                    $"Unsupported image type '{ext}'. Allowed: {string.Join(", ", AllowedImageExtensions)}.");

            if (file.Length > MaxFileSizeBytes)
                throw new ArgumentException("Image size exceeds the 5 MB limit.");

            if (!string.IsNullOrEmpty(profile.PhotoUrl))
            {
                await _cloudStorage.DeleteFileAsync(profile.PhotoUrl);
            }

            var fileName = $"photo_{profile.Id}_{Guid.NewGuid():N}{ext}";
            string photoUrl;
            using (var stream = file.OpenReadStream())
            {
                photoUrl = await _cloudStorage.UploadFileAsync(stream, fileName, file.ContentType, "candidate-photos");
            }

            profile.PhotoUrl = photoUrl;
            profile.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return photoUrl;
        }

        public async Task DeletePhotoAsync(Guid userId)
        {
            var (profile, _) = await LoadProfileAsync(userId);

            if (string.IsNullOrEmpty(profile.PhotoUrl))
                throw new InvalidOperationException("No profile photo is currently uploaded.");

            await _cloudStorage.DeleteFileAsync(profile.PhotoUrl);
            profile.PhotoUrl = null;
            profile.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

       
        public async Task<List<ApplicationResponseDto>> GetApplicationsAsync(Guid userId)
        {
            var profile = await GetProfileEntityAsync(userId);

            return await _db.JobApplications
                .Where(a => a.CandidateProfileId == profile.Id)
                .Include(a => a.JobPosting)
                .OrderByDescending(a => a.AppliedAt)
                .Select(a => new ApplicationResponseDto
                {
                    ApplicationId = a.Id,
                    JobPostingId = a.JobPostingId,
                    JobTitle = a.JobPosting.Title,
                    Company = a.JobPosting.PostedBy,
                    Location = a.JobPosting.Location,
                    EmploymentType = a.JobPosting.EmploymentType.ToString(),
                    Status = a.Status.ToString(),
                    CoverLetter = a.CoverLetter,
                    AppliedAt = DateTime.SpecifyKind(a.AppliedAt, DateTimeKind.Utc),
                    UpdatedAt = DateTime.SpecifyKind(a.UpdatedAt, DateTimeKind.Utc)
                })
                .ToListAsync();
        }

        public async Task<List<backend.DTOs.Jobs.InterviewDto>> GetInterviewsAsync(Guid userId)
        {
            var profile = await GetProfileEntityAsync(userId);

            var interviews = await _db.Interviews
                .Include(i => i.JobApplication)
                    .ThenInclude(a => a.JobPosting)
                .Include(i => i.JobApplication)
                    .ThenInclude(a => a.CandidateProfile)
                        .ThenInclude(cp => cp.User)
                .Where(i => i.JobApplication.CandidateProfileId == profile.Id)
                .OrderBy(i => i.ScheduledAt)
                .ToListAsync();

            return interviews.Select(i =>
            {
                var user = i.JobApplication.CandidateProfile.User;
                var name = $"{user.FirstName} {user.LastName}".Trim();
                var posting = i.JobApplication.JobPosting;
                return new backend.DTOs.Jobs.InterviewDto
                {
                    Id = i.Id,
                    ApplicationId = i.JobApplicationId,
                    JobPostingId = i.JobApplication.JobPostingId,
                    CandidateName = name,
                    CandidateEmail = user.Email,
                    PhotoUrl = i.JobApplication.CandidateProfile.PhotoUrl,
                    JobTitle = posting.Title,
                    Company = posting.PostedBy,
                    JobLocation = posting.Location,
                    ScheduledAt = DateTime.SpecifyKind(i.ScheduledAt, DateTimeKind.Utc),
                    DurationMinutes = i.DurationMinutes,
                    InterviewType = i.InterviewType,
                    MeetingLink = i.MeetingLink,
                    Location = i.Location,
                    InterviewerName = i.InterviewerName,
                    Notes = i.Notes,
                    ApplicationStatus = i.JobApplication.Status.ToString(),
                    RescheduleRequested = i.RescheduleRequested,
                    RescheduleReason = i.RescheduleReason,
                    RescheduleRequestedAt = i.RescheduleRequestedAt.HasValue
                        ? DateTime.SpecifyKind(i.RescheduleRequestedAt.Value, DateTimeKind.Utc)
                        : null,
                    LastRescheduledAt = i.LastRescheduledAt.HasValue
                        ? DateTime.SpecifyKind(i.LastRescheduledAt.Value, DateTimeKind.Utc)
                        : null
                };
            }).ToList();
        }

       
        public async Task<ApplicationResponseDto> ApplyToJobAsync(Guid userId, ApplyToJobDto dto)
        {
            var profile = await GetProfileEntityAsync(userId);

            var job = await _db.JobPostings.FindAsync(dto.JobPostingId)
                ?? throw new KeyNotFoundException("Job posting not found.");

            var alreadyApplied = await _db.JobApplications.AnyAsync(
                a => a.CandidateProfileId == profile.Id && a.JobPostingId == dto.JobPostingId);

            if (alreadyApplied)
                throw new InvalidOperationException("You have already applied to this job.");

            var application = new JobApplication
            {
                CandidateProfileId = profile.Id,
                JobPostingId = dto.JobPostingId,
                CoverLetter = dto.CoverLetter?.Trim(),
                AppliedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.JobApplications.Add(application);
            await _db.SaveChangesAsync();

            return new ApplicationResponseDto
            {
                ApplicationId = application.Id,
                JobPostingId = job.Id,
                JobTitle = job.Title,
                Company = job.PostedBy,
                Location = job.Location,
                EmploymentType = job.EmploymentType.ToString(),
                Status = application.Status.ToString(),
                CoverLetter = application.CoverLetter,
                AppliedAt = DateTime.SpecifyKind(application.AppliedAt, DateTimeKind.Utc),
                UpdatedAt = DateTime.SpecifyKind(application.UpdatedAt, DateTimeKind.Utc)
            };
        }

       
        public async Task DeleteProfileAsync(Guid userId)
        {
            var (profile, _) = await LoadProfileAsync(userId);

         
            profile.Phone = null;
            profile.Location = null;
            profile.Headline = null;
            profile.PhotoUrl = null;

            if (!string.IsNullOrEmpty(profile.ResumeUrl))
            {
                DeleteFileFromDisk(profile.ResumeUrl);
                profile.ResumeUrl = null;
            }

            
            _db.WorkExperiences.RemoveRange(profile.Experiences);
            _db.Educations.RemoveRange(profile.Educations);
            _db.CandidateSkills.RemoveRange(profile.Skills);

            if (profile.Links != null)
                _db.CandidateLinks.Remove(profile.Links);

            profile.IsDeleted = true;
            profile.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
        }

        
        public async Task<CandidateProfileExportDto> ExportProfileAsync(Guid userId)
        {
            var (profile, user) = await LoadProfileAsync(userId);

            var applications = await _db.JobApplications
                .Where(a => a.CandidateProfileId == profile.Id)
                .Include(a => a.JobPosting)
                .OrderByDescending(a => a.AppliedAt)
                .Select(a => new ApplicationResponseDto
                {
                    ApplicationId = a.Id,
                    JobPostingId = a.JobPostingId,
                    JobTitle = a.JobPosting.Title,
                    Company = a.JobPosting.PostedBy,
                    Location = a.JobPosting.Location,
                    EmploymentType = a.JobPosting.EmploymentType.ToString(),
                    Status = a.Status.ToString(),
                    CoverLetter = a.CoverLetter,
                    AppliedAt = DateTime.SpecifyKind(a.AppliedAt, DateTimeKind.Utc),
                    UpdatedAt = DateTime.SpecifyKind(a.UpdatedAt, DateTimeKind.Utc)
                })
                .ToListAsync();

            return new CandidateProfileExportDto
            {
                ProfileId = profile.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = profile.Phone,
                Location = profile.Location,
                Headline = profile.Headline,
                ResumeUrl = profile.ResumeUrl,
                PhotoUrl = profile.PhotoUrl,
                Experiences = profile.Experiences.Select(e => new WorkExperienceResponseDto
                {
                    Id = e.Id,
                    Company = e.Company,
                    Title = e.Title,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    IsCurrent = e.IsCurrent,
                    Description = e.Description
                }).ToList(),
                Educations = profile.Educations.Select(ed => new EducationResponseDto
                {
                    Id = ed.Id,
                    Institution = ed.Institution,
                    Degree = ed.Degree,
                    FieldOfStudy = ed.FieldOfStudy,
                    StartDate = ed.StartDate,
                    EndDate = ed.EndDate
                }).ToList(),
                Skills = profile.Skills.Select(s => s.Name).ToList(),
                Links = profile.Links != null ? new CandidateLinksDto
                {
                    LinkedIn = profile.Links.LinkedIn,
                    Portfolio = profile.Links.Portfolio,
                    GitHub = profile.Links.GitHub
                } : null,
                Applications = applications,
                CreatedAt = profile.CreatedAt,
                ExportedAt = DateTime.UtcNow
            };
        }

        

        private static (int percent, List<string> missing) CalculateCompleteness(
            CandidateProfile profile, User user)
        {
           
            var checks = new (string field, bool filled)[]
            {
                ("Name",        !string.IsNullOrWhiteSpace(user.FullName)),
                ("Email",       !string.IsNullOrWhiteSpace(user.Email)),
                ("Phone",       !string.IsNullOrWhiteSpace(profile.Phone)),
                ("Location",    !string.IsNullOrWhiteSpace(profile.Location)),
                ("Headline",    !string.IsNullOrWhiteSpace(profile.Headline)),
                ("Skills",      profile.Skills.Count > 0),
                ("Experience",  profile.Experiences.Count > 0),
                ("Education",   profile.Educations.Count > 0),
                ("Resume",      !string.IsNullOrWhiteSpace(profile.ResumeUrl)),
                ("Links",       profile.Links != null &&
                                (!string.IsNullOrWhiteSpace(profile.Links.LinkedIn) ||
                                 !string.IsNullOrWhiteSpace(profile.Links.Portfolio)))
            };

            var missing = checks.Where(c => !c.filled).Select(c => c.field).ToList();
            var percent = (int)Math.Round((double)(checks.Length - missing.Count) / checks.Length * 100);

            return (percent, missing);
        }

        
        private async Task<(CandidateProfile profile, User user)> LoadProfileAsync(Guid userId)
        {
            var user = await _db.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("User not found.");

            var profile = await _db.CandidateProfiles
                .Include(cp => cp.Experiences)
                .Include(cp => cp.Educations)
                .Include(cp => cp.Skills)
                .Include(cp => cp.Links)
                .FirstOrDefaultAsync(cp => cp.UserId == userId && !cp.IsDeleted)
                ?? throw new KeyNotFoundException(
                    "Candidate profile not found. Please create a profile first.");

            return (profile, user);
        }

        
        private async Task<CandidateProfile> GetProfileEntityAsync(Guid userId)
        {
            return await _db.CandidateProfiles
                .FirstOrDefaultAsync(cp => cp.UserId == userId && !cp.IsDeleted)
                ?? throw new KeyNotFoundException(
                    "Candidate profile not found. Please create a profile first.");
        }

        private async Task<CandidateProfileResponseDto> BuildResponseAsync(Guid profileId, User user)
        {
            var profile = await _db.CandidateProfiles
                .Include(cp => cp.Experiences)
                .Include(cp => cp.Educations)
                .Include(cp => cp.Skills)
                .Include(cp => cp.Links)
                .FirstAsync(cp => cp.Id == profileId);

            var (percent, missing) = CalculateCompleteness(profile, user);

            return new CandidateProfileResponseDto
            {
                Id = profile.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = profile.Phone,
                Location = profile.Location,
                Headline = profile.Headline,
                ResumeUrl = profile.ResumeUrl,
                PhotoUrl = profile.PhotoUrl,
                Experiences = profile.Experiences.Select(e => new WorkExperienceResponseDto
                {
                    Id = e.Id,
                    Company = e.Company,
                    Title = e.Title,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    IsCurrent = e.IsCurrent,
                    Description = e.Description
                }).ToList(),
                Educations = profile.Educations.Select(ed => new EducationResponseDto
                {
                    Id = ed.Id,
                    Institution = ed.Institution,
                    Degree = ed.Degree,
                    FieldOfStudy = ed.FieldOfStudy,
                    StartDate = ed.StartDate,
                    EndDate = ed.EndDate
                }).ToList(),
                Skills = profile.Skills.Select(s => s.Name).ToList(),
                Links = profile.Links != null ? new CandidateLinksDto
                {
                    LinkedIn = profile.Links.LinkedIn,
                    Portfolio = profile.Links.Portfolio,
                    GitHub = profile.Links.GitHub
                } : null,
                CompletenessPercent = percent,
                MissingFields = missing,
                CreatedAt = profile.CreatedAt,
                UpdatedAt = profile.UpdatedAt
            };
        }

        private static WorkExperience MapExperience(WorkExperienceDto dto) => new()
        {
            Company = dto.Company.Trim(),
            Title = dto.Title.Trim(),
            StartDate = dto.StartDate,
            EndDate = dto.IsCurrent ? null : dto.EndDate,
            IsCurrent = dto.IsCurrent,
            Description = dto.Description?.Trim()
        };

        private static Education MapEducation(EducationDto dto) => new()
        {
            Institution = dto.Institution.Trim(),
            Degree = dto.Degree.Trim(),
            FieldOfStudy = dto.FieldOfStudy.Trim(),
            StartDate = dto.StartDate,
            EndDate = dto.EndDate
        };

        private static CandidateLinks MapLinks(CandidateLinksDto dto) => new()
        {
            LinkedIn = dto.LinkedIn,
            Portfolio = dto.Portfolio,
            GitHub = dto.GitHub
        };

       
        private void DeleteFileFromDisk(string fileUrl)
        {
            try
            {
                
                string relativePath;
                if (Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri))
                    relativePath = uri.AbsolutePath;
                else
                    relativePath = fileUrl;

               
                var diskPath = Path.Combine(_env.WebRootPath, relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

                if (File.Exists(diskPath))
                    File.Delete(diskPath);
            }
            catch
            {
                
            }
        }

        public async Task<List<JobRecommendationDto>> GetJobRecommendationsAsync(Guid userId)
        {
            var profile = await _db.CandidateProfiles
                .Include(cp => cp.Skills)
                .Include(cp => cp.Experiences)
                .Include(cp => cp.Educations)
                .FirstOrDefaultAsync(cp => cp.UserId == userId && !cp.IsDeleted);

            var activeJobs = await _db.JobPostings
                .AsNoTracking()
                .Where(j => j.Status == backend.Models.Enums.JobStatus.Published)
                .OrderByDescending(j => j.PublishedAt)
                .Take(25) 
                .ToListAsync();

            if (activeJobs.Count == 0)
            {
                return new List<JobRecommendationDto>();
            }

            var result = new List<JobRecommendationDto>();

            
            if (profile == null || (profile.Skills.Count == 0 && string.IsNullOrWhiteSpace(profile.Headline)))
            {
                return activeJobs.Select(j => new JobRecommendationDto
                {
                    JobId = j.Id,
                    JobTitle = j.Title,
                    Company = j.PostedBy,
                    Location = j.Location,
                    EmploymentType = j.EmploymentType.ToString(),
                    Description = j.Description ?? string.Empty,
                    SalaryMin = j.SalaryMin,
                    SalaryMax = j.SalaryMax,
                    SalaryCurrency = j.SalaryCurrency,
                    RequiredSkills = string.IsNullOrEmpty(j.RequiredSkills)
                        ? new List<string>()
                        : j.RequiredSkills.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList(),
                    MatchScore = 0,
                    MatchExplanation = "Please upload your resume or add skills to your profile to get personalized AI matching."
                }).ToList();
            }

            var apiKey = ResolveOpenAiApiKey();
            if (string.IsNullOrWhiteSpace(apiKey))
            {
               
                return RunKeywordMatchingFallback(profile, activeJobs);
            }

            try
            {
                var client = _httpClientFactory.CreateClient("OpenAI");
                var modelName = string.IsNullOrWhiteSpace(_openAiSettings.Model) ? "gpt-4o-mini" : _openAiSettings.Model;

                var candidateInfo = new
                {
                    Headline = profile.Headline ?? string.Empty,
                    Location = profile.Location ?? string.Empty,
                    Skills = profile.Skills.Select(s => s.Name).ToList(),
                    Experiences = profile.Experiences.Select(e => new
                    {
                        e.Company,
                        e.Title,
                        StartDate = e.StartDate.ToString("yyyy-MM"),
                        EndDate = e.IsCurrent ? "Present" : e.EndDate?.ToString("yyyy-MM"),
                        e.Description
                    }).ToList()
                };

                var jobsInfo = activeJobs.Select(j => new
                {
                    j.Id,
                    j.Title,
                    Company = j.PostedBy,
                    j.Location,
                    j.Description,
                    RequiredSkills = string.IsNullOrEmpty(j.RequiredSkills)
                        ? new List<string>()
                        : j.RequiredSkills.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList()
                }).ToList();

                var systemPrompt = @"You are a high-performance recruiter assistant AI inside TalentPortal AI.
Compare the candidate's profile with the list of active job postings.
For each job, calculate:
1. matchScore: an integer from 0 to 100 representing how well their skills, title, and work history align with the job posting requirements.
2. matchExplanation: a 1-2 sentence description explaining the fit (e.g., highlighting matching skills or gaps in experience).

Rule: Your response MUST be a single, valid JSON object with a 'matches' array. Each item in the array must contain 'jobId' (string matching the input job ID), 'matchScore' (integer), and 'matchExplanation' (string). Do not add markdown formatting, backticks, or any conversational text.
Example structure:
{
  ""matches"": [
    {
      ""jobId"": ""3fa85f64-5717-4562-b3fc-2c963f66afa6"",
      ""matchScore"": 85,
      ""matchExplanation"": ""Your experience with React matches their front-end needs perfectly, though you lack Go experience.""
    }
  ]
}";

                var payload = new
                {
                    model = modelName,
                    temperature = 0.2,
                    response_format = new { type = "json_object" },
                    messages = new[]
                    {
                        new { role = "system", content = systemPrompt },
                        new { role = "user", content = $"Candidate Profile:\n{JsonSerializer.Serialize(candidateInfo, JsonOpts)}\n\nActive Jobs:\n{JsonSerializer.Serialize(jobsInfo, JsonOpts)}" }
                    }
                };

                using var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
                {
                    Content = new StringContent(JsonSerializer.Serialize(payload, JsonOpts), Encoding.UTF8, "application/json")
                };
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

                using var response = await client.SendAsync(request);
                if (!response.IsSuccessStatusCode)
                {
                    return RunKeywordMatchingFallback(profile, activeJobs);
                }

                var body = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(body);
                var jsonText = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(jsonText))
                {
                    return RunKeywordMatchingFallback(profile, activeJobs);
                }

                using var responseDoc = JsonDocument.Parse(jsonText);
                var matchesElement = responseDoc.RootElement.GetProperty("matches");

                var matchDict = matchesElement.EnumerateArray().ToDictionary(
                    item => Guid.Parse(item.GetProperty("jobId").GetString()!),
                    item => new {
                        Score = item.GetProperty("matchScore").GetInt32(),
                        Exp = item.GetProperty("matchExplanation").GetString() ?? string.Empty
                    }
                );

                foreach (var job in activeJobs)
                {
                    int score = 0;
                    string exp = "No specific match feedback available.";

                    if (matchDict.TryGetValue(job.Id, out var matchVal))
                    {
                        score = matchVal.Score;
                        exp = matchVal.Exp;
                    }

                    result.Add(new JobRecommendationDto
                    {
                        JobId = job.Id,
                        JobTitle = job.Title,
                        Company = job.PostedBy,
                        Location = job.Location,
                        EmploymentType = job.EmploymentType.ToString(),
                        Description = job.Description ?? string.Empty,
                        SalaryMin = job.SalaryMin,
                        SalaryMax = job.SalaryMax,
                        SalaryCurrency = job.SalaryCurrency,
                        RequiredSkills = string.IsNullOrEmpty(job.RequiredSkills)
                            ? new List<string>()
                            : job.RequiredSkills.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList(),
                        MatchScore = score,
                        MatchExplanation = exp
                    });
                }
            }
            catch
            {
                return RunKeywordMatchingFallback(profile, activeJobs);
            }

            return result.OrderByDescending(r => r.MatchScore).ToList();
        }

        private string ResolveOpenAiApiKey()
        {
            if (!string.IsNullOrWhiteSpace(_openAiSettings.ApiKey))
                return _openAiSettings.ApiKey.Trim();

            return Environment.GetEnvironmentVariable("OPENAI_API_KEY")
                ?? Environment.GetEnvironmentVariable("TalentPortal_OpenAI__ApiKey")
                ?? string.Empty;
        }

        private List<JobRecommendationDto> RunKeywordMatchingFallback(CandidateProfile profile, List<JobPosting> jobs)
        {
            var result = new List<JobRecommendationDto>();
            var candidateSkills = profile.Skills.Select(s => s.Name.ToLowerInvariant()).ToHashSet();

            foreach (var j in jobs)
            {
                var jobSkills = string.IsNullOrEmpty(j.RequiredSkills)
                    ? new List<string>()
                    : j.RequiredSkills.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList();

                int matchCount = 0;
                foreach (var js in jobSkills)
                {
                    if (candidateSkills.Contains(js.ToLowerInvariant()))
                    {
                        matchCount++;
                    }
                }

                int score = jobSkills.Count > 0 ? (matchCount * 100) / jobSkills.Count : 50;
                string explanation = jobSkills.Count > 0
                    ? $"Matched {matchCount} of {jobSkills.Count} required skills ({string.Join(", ", jobSkills.Intersect(profile.Skills.Select(s => s.Name), StringComparer.OrdinalIgnoreCase))})."
                    : "This job does not specify required skills, but matches your general profile.";

                result.Add(new JobRecommendationDto
                {
                    JobId = j.Id,
                    JobTitle = j.Title,
                    Company = j.PostedBy,
                    Location = j.Location,
                    EmploymentType = j.EmploymentType.ToString(),
                    Description = j.Description ?? string.Empty,
                    SalaryMin = j.SalaryMin,
                    SalaryMax = j.SalaryMax,
                    SalaryCurrency = j.SalaryCurrency,
                    RequiredSkills = jobSkills,
                    MatchScore = score,
                    MatchExplanation = explanation
                });
            }

            return result.OrderByDescending(r => r.MatchScore).ToList();
        }

        public async Task<ApplicationResponseDto> RespondToOfferAsync(Guid userId, Guid applicationId, bool accept)
        {
            var application = await _db.JobApplications
                .Include(a => a.JobPosting)
                .Include(a => a.CandidateProfile)
                    .ThenInclude(cp => cp.User)
                .FirstOrDefaultAsync(a => a.Id == applicationId && a.CandidateProfile.UserId == userId)
                ?? throw new KeyNotFoundException("Application not found.");

            if (application.Status != ApplicationStatus.Offer && application.Status != ApplicationStatus.Hired)
            {
                throw new InvalidOperationException("You can only respond to applications that currently have an extended offer.");
            }

            application.Status = accept ? ApplicationStatus.Hired : ApplicationStatus.Rejected;
            application.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return new ApplicationResponseDto
            {
                ApplicationId = application.Id,
                JobPostingId = application.JobPostingId,
                JobTitle = application.JobPosting.Title,
                Company = application.JobPosting.PostedBy,
                Location = application.JobPosting.Location,
                EmploymentType = application.JobPosting.EmploymentType.ToString(),
                Status = application.Status.ToString(),
                AppliedAt = DateTime.SpecifyKind(application.AppliedAt, DateTimeKind.Utc),
                UpdatedAt = DateTime.SpecifyKind(application.UpdatedAt, DateTimeKind.Utc),
                CoverLetter = application.CoverLetter
            };

        }
    }
}
