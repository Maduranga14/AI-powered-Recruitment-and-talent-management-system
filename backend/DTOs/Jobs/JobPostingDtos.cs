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
    }

    public class JobPostingDetailDto : JobPostingListDto
    {
        public string Description { get; set; } = string.Empty;
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
}
