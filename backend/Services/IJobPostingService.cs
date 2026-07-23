using backend.DTOs.Jobs;
using backend.Models.Enums;

namespace backend.Services
{
    public interface IJobPostingService
    {
        
        Task<JobPostingDetailDto> CreateAsync(CreateJobPostingDto dto, Guid recruiterId);

        
        Task<PagedJobsDto> GetByRecruiterAsync(Guid recruiterId, JobStatus? status, int page, int pageSize);

        
        Task<JobPostingDetailDto> GetDetailAsync(Guid id, Guid recruiterId);

        
        Task<JobPostingDetailDto> UpdateAsync(Guid id, UpdateJobPostingDto dto, Guid recruiterId);

       
        Task<JobPostingDetailDto> ChangeStatusAsync(Guid id, JobStatus newStatus, Guid recruiterId);

        
        Task DeleteAsync(Guid id, Guid recruiterId);

        
        Task<List<PublicJobPageDto>> GetPublishedJobsAsync(string? keyword, string? location, EmploymentType? type);

        
        Task<PublicJobPageDto> GetPublicJobPageAsync(Guid id);

        
        Task<JobApplicantsResultDto> GetApplicantsAsync(Guid jobId, Guid recruiterId, bool includeAiScores = false);

       
        Task<List<JobApplicantDto>> GetAllApplicantsAsync(Guid recruiterId, bool includeAiScores = false);

       
        Task<JobApplicantDto> UpdateApplicationStatusAsync(
            Guid jobId, Guid applicationId, ApplicationStatus status, Guid recruiterId);

        
        Task<List<JobApplicantDto>> GetManagerApplicantsAsync(Guid managerUserId, bool includeAiScores = false);

        
        Task<JobApplicantDto> SubmitManagerFeedbackAsync(Guid applicationId, string recommendation, string feedback, int overallRating, string? skillRatings, Guid managerUserId);

        
        Task<InterviewDto> ScheduleInterviewAsync(Guid jobId, Guid applicationId, ScheduleInterviewDto dto, Guid recruiterId);

        
        Task<List<InterviewDto>> GetInterviewsAsync(Guid recruiterId);

        
        Task<List<InterviewDto>> GetManagerInterviewsAsync(Guid managerUserId);

        
        Task<InterviewDto> RequestRescheduleAsync(Guid interviewId, string? reason, Guid managerUserId);

        
        Task<InterviewDto> RescheduleInterviewAsync(Guid interviewId, ScheduleInterviewDto dto, Guid recruiterId);

        
        Task<InterviewDto> SubmitInterviewFeedbackAsync(Guid interviewId, SubmitInterviewFeedbackDto dto, Guid managerUserId);

        
        Task<JobApplicantDto> MakeHiringDecisionAsync(Guid applicationId, string decision, string? notes, Guid managerUserId);

        
        Task<CommunicationLogDto> SendApplicantEmailAsync(Guid applicationId, SendApplicantEmailDto dto, Guid recruiterId);

        
        Task<List<CommunicationLogDto>> GetCommunicationHistoryAsync(Guid applicationId, Guid recruiterId);
    }
}
