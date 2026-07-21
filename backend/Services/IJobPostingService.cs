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

        /// <summary>List candidates who applied to a job owned by this recruiter.</summary>
        Task<JobApplicantsResultDto> GetApplicantsAsync(Guid jobId, Guid recruiterId);

        /// <summary>List applicants across all jobs owned by this recruiter.</summary>
        Task<List<JobApplicantDto>> GetAllApplicantsAsync(Guid recruiterId);

        /// <summary>Update an application's pipeline status (must belong to recruiter's job).</summary>
        Task<JobApplicantDto> UpdateApplicationStatusAsync(
            Guid jobId, Guid applicationId, ApplicationStatus status, Guid recruiterId);

        /// <summary>List candidates who applied to jobs headed by this hiring manager's departments.</summary>
        Task<List<JobApplicantDto>> GetManagerApplicantsAsync(Guid managerUserId);

        /// <summary>Submit manager feedback and advance/reject the application.</summary>
        Task<JobApplicantDto> SubmitManagerFeedbackAsync(Guid applicationId, string recommendation, string feedback, int overallRating, string? skillRatings, Guid managerUserId);

        /// <summary>Schedule an interview for an applicant and set status to Interview.</summary>
        Task<InterviewDto> ScheduleInterviewAsync(Guid jobId, Guid applicationId, ScheduleInterviewDto dto, Guid recruiterId);

        /// <summary>List interviews for jobs owned by this recruiter (upcoming first).</summary>
        Task<List<InterviewDto>> GetInterviewsAsync(Guid recruiterId);

        /// <summary>List interviews for applications in this hiring manager's departments.</summary>
        Task<List<InterviewDto>> GetManagerInterviewsAsync(Guid managerUserId);

        /// <summary>Hiring manager requests that the recruiter reschedule an interview.</summary>
        Task<InterviewDto> RequestRescheduleAsync(Guid interviewId, string? reason, Guid managerUserId);

        /// <summary>Recruiter updates an existing interview's time/details (clears reschedule request).</summary>
        Task<InterviewDto> RescheduleInterviewAsync(Guid interviewId, ScheduleInterviewDto dto, Guid recruiterId);

        /// <summary>Hiring manager submits post-interview feedback and moves status to UnderFinalReview.</summary>
        Task<InterviewDto> SubmitInterviewFeedbackAsync(Guid interviewId, SubmitInterviewFeedbackDto dto, Guid managerUserId);

        /// <summary>Hiring manager makes final hiring decision (Hire / Reject / UnderFinalReview) on an application.</summary>
        Task<JobApplicantDto> MakeHiringDecisionAsync(Guid applicationId, string decision, string? notes, Guid managerUserId);
    }
}
