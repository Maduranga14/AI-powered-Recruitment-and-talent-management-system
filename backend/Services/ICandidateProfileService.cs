using backend.DTOs.Candidate;

namespace backend.Services
{
    public interface ICandidateProfileService
    {
        /// <summary>Create a new profile. Throws InvalidOperationException if one already exists.</summary>
        Task<CandidateProfileResponseDto> CreateProfileAsync(Guid userId, CreateCandidateProfileDto dto);

        /// <summary>Get the caller's profile including completeness metrics.</summary>
        Task<CandidateProfileResponseDto> GetProfileAsync(Guid userId);

        /// <summary>Partial update — only provided fields are replaced.</summary>
        Task<CandidateProfileResponseDto> UpdateProfileAsync(Guid userId, UpdateCandidateProfileDto dto);

        /// <summary>
        /// Upload a resume file and store its URL in the profile.
        /// Returns the saved file URL.
        /// </summary>
        Task<string> UploadResumeAsync(Guid userId, IFormFile file);

        /// <summary>Delete resume file from disk and clear ResumeUrl in DB.</summary>
        Task DeleteResumeAsync(Guid userId);

        /// <summary>List all job applications for this candidate.</summary>
        Task<List<ApplicationResponseDto>> GetApplicationsAsync(Guid userId);

        /// <summary>List interviews scheduled for this candidate.</summary>
        Task<List<backend.DTOs.Jobs.InterviewDto>> GetInterviewsAsync(Guid userId);

        /// <summary>Apply to a job posting. Throws if already applied.</summary>
        Task<ApplicationResponseDto> ApplyToJobAsync(Guid userId, ApplyToJobDto dto);

        /// <summary>Soft-delete: sets IsDeleted=true and clears personal data.</summary>
        Task DeleteProfileAsync(Guid userId);

        /// <summary>Return full profile data as export DTO.</summary>
        Task<CandidateProfileExportDto> ExportProfileAsync(Guid userId);

        /// <summary>Get candidate profile by its unique profile ID.</summary>
        Task<CandidateProfileResponseDto> GetProfileByIdAsync(Guid profileId);

        /// <summary>Get AI-powered job recommendations sorted by match score.</summary>
        Task<List<JobRecommendationDto>> GetJobRecommendationsAsync(Guid userId);
    }
}
