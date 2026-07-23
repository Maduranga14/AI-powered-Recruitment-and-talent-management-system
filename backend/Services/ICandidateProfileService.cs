using backend.DTOs.Candidate;

namespace backend.Services
{
    public interface ICandidateProfileService
    {
        
        Task<CandidateProfileResponseDto> CreateProfileAsync(Guid userId, CreateCandidateProfileDto dto);

        
        Task<CandidateProfileResponseDto> GetProfileAsync(Guid userId);

        
        Task<CandidateProfileResponseDto> UpdateProfileAsync(Guid userId, UpdateCandidateProfileDto dto);

      
        Task<string> UploadResumeAsync(Guid userId, IFormFile file);

        
        Task DeleteResumeAsync(Guid userId);

        
        Task<string> UploadPhotoAsync(Guid userId, IFormFile file);

        
        Task DeletePhotoAsync(Guid userId);

       
        Task<List<ApplicationResponseDto>> GetApplicationsAsync(Guid userId);

       
        Task<List<backend.DTOs.Jobs.InterviewDto>> GetInterviewsAsync(Guid userId);

       
        Task<ApplicationResponseDto> ApplyToJobAsync(Guid userId, ApplyToJobDto dto);

       
        Task DeleteProfileAsync(Guid userId);

        
        Task<CandidateProfileExportDto> ExportProfileAsync(Guid userId);

        
        Task<CandidateProfileResponseDto> GetProfileByIdAsync(Guid profileId);

        
        Task<List<JobRecommendationDto>> GetJobRecommendationsAsync(Guid userId);

       
        Task<ApplicationResponseDto> RespondToOfferAsync(Guid userId, Guid applicationId, bool accept);
    }
}
