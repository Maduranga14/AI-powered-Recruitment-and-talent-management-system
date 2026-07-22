using System.ComponentModel.DataAnnotations;
using backend.Models.Enums;

namespace backend.DTOs.Jobs
{
   
    public class CreateJobPostingDto
    {
        [Required(ErrorMessage = "Job title is required.")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Job description is required.")]
        public string Description { get; set; } = string.Empty;

        public string? Requirements { get; set; }

        [Required(ErrorMessage = "Location is required.")]
        [StringLength(200, ErrorMessage = "Location cannot exceed 200 characters.")]
        public string Location { get; set; } = string.Empty;

        public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;

        
        public JobStatus Status { get; set; } = JobStatus.Draft;

        [Range(0, 10_000_000, ErrorMessage = "Invalid salary value.")]
        public decimal? SalaryMin { get; set; }

        [Range(0, 10_000_000, ErrorMessage = "Invalid salary value.")]
        public decimal? SalaryMax { get; set; }

        [StringLength(10)]
        public string SalaryCurrency { get; set; } = "USD";

        [StringLength(100)]
        public string? ExperienceRequired { get; set; }

        [StringLength(1000)]
        public string? RequiredSkills { get; set; }

        public DateTime? Deadline { get; set; }

        public Guid? DepartmentId { get; set; }

        [StringLength(200)]
        public string? PostedBy { get; set; }
    }

    
    public class UpdateJobPostingDto
    {
        [StringLength(200)]
        public string? Title { get; set; }

        public string? Description { get; set; }

        public string? Requirements { get; set; }

        [StringLength(200)]
        public string? Location { get; set; }

        public EmploymentType? EmploymentType { get; set; }

        [Range(0, 10_000_000)]
        public decimal? SalaryMin { get; set; }

        [Range(0, 10_000_000)]
        public decimal? SalaryMax { get; set; }

        [StringLength(10)]
        public string? SalaryCurrency { get; set; }

        [StringLength(100)]
        public string? ExperienceRequired { get; set; }

        [StringLength(1000)]
        public string? RequiredSkills { get; set; }

        public DateTime? Deadline { get; set; }

        public Guid? DepartmentId { get; set; }
    }

    
    public class JobPostingListDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string EmploymentType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? DepartmentName { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public string SalaryCurrency { get; set; } = "USD";
        public DateTime? Deadline { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public string RecruiterName { get; set; } = string.Empty;
        public string PostedBy { get; set; } = string.Empty;
        public int ApplicantCount { get; set; }
        public int ScreenedCount { get; set; }
        public int ShortlistedCount { get; set; }
        public int InterviewCount { get; set; }
    }

    /// <summary>Applicant row shown on the recruiter "View applicants" pipeline.</summary>
    public class WorkExperienceDto
    {
        public string Title { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrent { get; set; }
        public string? Description { get; set; }
    }

    public class EducationDto
    {
        public string Institution { get; set; } = string.Empty;
        public string Degree { get; set; } = string.Empty;
        public string FieldOfStudy { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class JobApplicantDto
    {
        public Guid ApplicationId { get; set; }
        public Guid JobPostingId { get; set; }
        public Guid CandidateProfileId { get; set; }
        public Guid UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Headline { get; set; }
        public string? Location { get; set; }
        public string? PhotoUrl { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string? DepartmentName { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? CoverLetter { get; set; }
        public DateTime AppliedAt { get; set; }
        public int MatchScore { get; set; }
        public List<string> Skills { get; set; } = [];
        public List<WorkExperienceDto> Experiences { get; set; } = [];
        public List<EducationDto> Educations { get; set; } = [];
        public string? ExperienceSummary { get; set; }
        public string? ResumeUrl { get; set; }
        public string? Feedback { get; set; }
        public string? Recommendation { get; set; }
        public int? OverallRating { get; set; }
        public string? SkillRatings { get; set; }

        // Post-interview evaluation (submitted by interviewer after conducting interview)
        public int? InterviewOverallRating { get; set; }
        public string? InterviewRecommendation { get; set; }
        public string? InterviewComments { get; set; }
        public string? InterviewSkillRatings { get; set; }
        public int? InterviewTechnicalScore { get; set; }
    }

    public class JobApplicantsResultDto
    {
        public Guid JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string? DepartmentName { get; set; }
        public string JobStatus { get; set; } = string.Empty;
        public List<JobApplicantDto> Applicants { get; set; } = [];
    }

    public class UpdateApplicationStatusDto
    {
        [Required]
        public ApplicationStatus Status { get; set; }
    }

    public class JobPostingDetailDto : JobPostingListDto
    {
        public string Description { get; set; } = string.Empty;
        public string? Requirements { get; set; }
        public string? ExperienceRequired { get; set; }
        public string? RequiredSkills { get; set; }
        public Guid? DepartmentId { get; set; }
        public Guid CreatedByRecruiterId { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

   
    public class PublicJobPageDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Requirements { get; set; }
        public string Location { get; set; } = string.Empty;
        public string EmploymentType { get; set; } = string.Empty;
        public string? DepartmentName { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public string SalaryCurrency { get; set; } = "USD";
        public string? ExperienceRequired { get; set; }
        public List<string> RequiredSkills { get; set; } = [];
        public DateTime? Deadline { get; set; }
        public DateTime PublishedAt { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
        public string PostedBy { get; set; } = string.Empty;
    }

    
    public class ChangeJobStatusDto
    {
        [Required]
        public JobStatus Status { get; set; }
    }

   
    public class PagedJobsDto
    {
        public List<JobPostingListDto> Items { get; set; } = [];
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }

    public class SubmitFeedbackDto
    {
        [Required(ErrorMessage = "Recommendation is required.")]
        public string Recommendation { get; set; } = string.Empty;

        [Required(ErrorMessage = "Feedback is required.")]
        [MaxLength(2000)]
        public string Feedback { get; set; } = string.Empty;

        [Required(ErrorMessage = "Overall rating is required.")]
        public int OverallRating { get; set; }

        public string? SkillRatings { get; set; }
    }

    public class MakeHiringDecisionDto
    {
        /// <summary>Expected: "Hired" | "Rejected" | "UnderFinalReview"</summary>
        [Required(ErrorMessage = "Decision is required.")]
        public string Decision { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Notes { get; set; }
    }

    public class ScheduleInterviewDto
    {
        [Required]
        public DateTime ScheduledAt { get; set; }

        [Range(15, 480)]
        public int DurationMinutes { get; set; } = 60;

        /// <summary>Video | Phone | Onsite</summary>
        [Required, MaxLength(30)]
        public string InterviewType { get; set; } = "Video";

        [MaxLength(500)]
        public string? MeetingLink { get; set; }

        [MaxLength(300)]
        public string? Location { get; set; }

        [Required, MaxLength(150)]
        public string InterviewerName { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    public class InterviewDto
    {
        public Guid Id { get; set; }
        public Guid ApplicationId { get; set; }
        public Guid JobPostingId { get; set; }
        public string CandidateName { get; set; } = string.Empty;
        public string CandidateEmail { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string? Company { get; set; }
        public string? JobLocation { get; set; }
        public DateTime ScheduledAt { get; set; }
        public int DurationMinutes { get; set; }
        public string InterviewType { get; set; } = string.Empty;
        public string? MeetingLink { get; set; }
        public string? Location { get; set; }
        public string InterviewerName { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string ApplicationStatus { get; set; } = string.Empty;
        public bool RescheduleRequested { get; set; }
        public string? RescheduleReason { get; set; }
        public DateTime? RescheduleRequestedAt { get; set; }
        public DateTime? LastRescheduledAt { get; set; }

        // ── Post-interview feedback ──────────────────────────────────────────────
        public int? FeedbackOverallRating { get; set; }
        public string? FeedbackRecommendation { get; set; }
        public string? FeedbackComments { get; set; }
        public string? FeedbackSkillRatings { get; set; }
        public int? FeedbackTechnicalScore { get; set; }
        public DateTime? FeedbackSubmittedAt { get; set; }
        public bool HasFeedback => FeedbackSubmittedAt.HasValue;
    }

    /// <summary>Payload for hiring manager submitting post-interview feedback.</summary>
    public class SubmitInterviewFeedbackDto
    {
        [Required(ErrorMessage = "Recommendation is required.")]
        public string Recommendation { get; set; } = string.Empty;

        [Required(ErrorMessage = "Written comments are required.")]
        [MaxLength(4000)]
        public string Comments { get; set; } = string.Empty;

        [Required(ErrorMessage = "Overall rating is required.")]
        [Range(1, 5, ErrorMessage = "Overall rating must be between 1 and 5.")]
        public int OverallRating { get; set; }

        /// <summary>JSON: {"Technical skills":4,"Communication":3,"Culture fit":5}</summary>
        public string? SkillRatings { get; set; }

        [Range(1, 5, ErrorMessage = "Technical assessment score must be between 1 and 5.")]
        public int? TechnicalAssessmentScore { get; set; }
    }

    public class RequestRescheduleDto
    {
        [MaxLength(1000)]
        public string? Reason { get; set; }
    }
}
