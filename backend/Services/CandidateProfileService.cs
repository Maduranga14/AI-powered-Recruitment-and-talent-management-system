using backend.Data;
using backend.DTOs.Candidate;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CandidateProfileService(
        AppDbContext db,
        IWebHostEnvironment env,
        IHttpContextAccessor httpContextAccessor) : ICandidateProfileService
    {
        private readonly AppDbContext _db = db;
        private readonly IWebHostEnvironment _env = env;
        private readonly IHttpContextAccessor _http = httpContextAccessor;

        // Allowed resume file extensions and size limit (5 MB)
        private static readonly string[] AllowedExtensions = [".pdf", ".doc", ".docx"];
        private const long MaxFileSizeBytes = 5 * 1024 * 1024;

        // ── Create ────────────────────────────────────────────────────────────
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

            // Experience
            foreach (var exp in dto.Experiences)
                profile.Experiences.Add(MapExperience(exp));

            // Education
            foreach (var ed in dto.Educations)
                profile.Educations.Add(MapEducation(ed));

            // Skills — deduplicate, trim
            foreach (var skill in dto.Skills.Select(s => s.Trim()).Where(s => s.Length > 0).Distinct())
                profile.Skills.Add(new CandidateSkill { Name = skill });

            // Links
            if (dto.Links != null)
                profile.Links = MapLinks(dto.Links);

            _db.CandidateProfiles.Add(profile);
            await _db.SaveChangesAsync();

            return await BuildResponseAsync(profile.Id, user);
        }

        // ── Get ───────────────────────────────────────────────────────────────
        public async Task<CandidateProfileResponseDto> GetProfileAsync(Guid userId)
        {
            var (profile, user) = await LoadProfileAsync(userId);
            return await BuildResponseAsync(profile.Id, user);
        }

        // ── Update ────────────────────────────────────────────────────────────
        public async Task<CandidateProfileResponseDto> UpdateProfileAsync(
            Guid userId, UpdateCandidateProfileDto dto)
        {
            var (profile, user) = await LoadProfileAsync(userId);

            if (dto.Phone != null) profile.Phone = dto.Phone.Trim();
            if (dto.Location != null) profile.Location = dto.Location.Trim();
            if (dto.Headline != null) profile.Headline = dto.Headline.Trim();

            // Replace experience list if provided
            if (dto.Experiences != null)
            {
                _db.WorkExperiences.RemoveRange(profile.Experiences);
                profile.Experiences.Clear();
                foreach (var exp in dto.Experiences)
                    profile.Experiences.Add(MapExperience(exp));
            }

            // Replace education list if provided
            if (dto.Educations != null)
            {
                _db.Educations.RemoveRange(profile.Educations);
                profile.Educations.Clear();
                foreach (var ed in dto.Educations)
                    profile.Educations.Add(MapEducation(ed));
            }

            // Replace skills if provided
            if (dto.Skills != null)
            {
                _db.CandidateSkills.RemoveRange(profile.Skills);
                profile.Skills.Clear();
                foreach (var skill in dto.Skills.Select(s => s.Trim()).Where(s => s.Length > 0).Distinct())
                    profile.Skills.Add(new CandidateSkill { Name = skill });
            }

            // Replace links if provided
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
                    profile.Links = MapLinks(dto.Links);
                }
            }

            profile.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return await BuildResponseAsync(profile.Id, user);
        }

        // ── Resume upload ─────────────────────────────────────────────────────
        public async Task<string> UploadResumeAsync(Guid userId, IFormFile file)
        {
            var (profile, _) = await LoadProfileAsync(userId);

            // Validate extension
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext))
                throw new ArgumentException(
                    $"Unsupported file type '{ext}'. Allowed: {string.Join(", ", AllowedExtensions)}.");

            // Validate size
            if (file.Length > MaxFileSizeBytes)
                throw new ArgumentException("File size exceeds the 5 MB limit.");

            // Remove old file if present
            if (!string.IsNullOrEmpty(profile.ResumeUrl))
                DeleteFileFromDisk(profile.ResumeUrl);

            // Save new file
            var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "resumes");
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{profile.Id}_{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadsDir, fileName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Build URL relative to the host
            var relativePath = $"/uploads/resumes/{fileName}";
            var request = _http.HttpContext?.Request;
            var fileUrl = request != null
                ? $"{request.Scheme}://{request.Host}{relativePath}"
                : relativePath;

            profile.ResumeUrl = fileUrl;
            profile.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return fileUrl;
        }

        // ── Resume delete ─────────────────────────────────────────────────────
        public async Task DeleteResumeAsync(Guid userId)
        {
            var (profile, _) = await LoadProfileAsync(userId);

            if (string.IsNullOrEmpty(profile.ResumeUrl))
                throw new InvalidOperationException("No resume is currently uploaded.");

            DeleteFileFromDisk(profile.ResumeUrl);
            profile.ResumeUrl = null;
            profile.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        // ── Applications ──────────────────────────────────────────────────────
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
                    AppliedAt = a.AppliedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .ToListAsync();
        }

        // ── Apply to job ──────────────────────────────────────────────────────
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
                AppliedAt = application.AppliedAt,
                UpdatedAt = application.UpdatedAt
            };
        }

        // ── Soft-delete profile ───────────────────────────────────────────────
        public async Task DeleteProfileAsync(Guid userId)
        {
            var (profile, _) = await LoadProfileAsync(userId);

            // Clear personal data fields
            profile.Phone = null;
            profile.Location = null;
            profile.Headline = null;
            profile.PhotoUrl = null;

            if (!string.IsNullOrEmpty(profile.ResumeUrl))
            {
                DeleteFileFromDisk(profile.ResumeUrl);
                profile.ResumeUrl = null;
            }

            // Clear child collections
            _db.WorkExperiences.RemoveRange(profile.Experiences);
            _db.Educations.RemoveRange(profile.Educations);
            _db.CandidateSkills.RemoveRange(profile.Skills);

            if (profile.Links != null)
                _db.CandidateLinks.Remove(profile.Links);

            profile.IsDeleted = true;
            profile.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
        }

        // ── Export ────────────────────────────────────────────────────────────
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
                    AppliedAt = a.AppliedAt,
                    UpdatedAt = a.UpdatedAt
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

        // ── Completeness calculator ───────────────────────────────────────────

        private static (int percent, List<string> missing) CalculateCompleteness(
            CandidateProfile profile, User user)
        {
            // 10 tracked fields
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

        // ── Private helpers ───────────────────────────────────────────────────

        /// <summary>Load profile with all navigation properties, throw 404 if missing.</summary>
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

        /// <summary>Load profile entity only (no User), throw 404 if missing.</summary>
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

        /// <summary>Delete a file from disk given its absolute URL or relative path.</summary>
        private void DeleteFileFromDisk(string fileUrl)
        {
            try
            {
                // Strip scheme+host if present to get the relative path
                string relativePath;
                if (Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri))
                    relativePath = uri.AbsolutePath;
                else
                    relativePath = fileUrl;

                // relativePath is like /uploads/resumes/xxx.pdf
                var diskPath = Path.Combine(_env.WebRootPath, relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

                if (File.Exists(diskPath))
                    File.Delete(diskPath);
            }
            catch
            {
                // Swallow file-not-found errors — DB update must still proceed
            }
        }
    }
}
