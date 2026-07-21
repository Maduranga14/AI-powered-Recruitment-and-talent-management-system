using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;

namespace backend.Models
{
    public class JobPosting
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string? Requirements { get; set; }

        [Required]
        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;

        public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;

        public JobStatus Status { get; set; } = JobStatus.Draft;

       
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }

        [MaxLength(10)]
        public string SalaryCurrency { get; set; } = "USD";

       
        [MaxLength(100)]
        public string? ExperienceRequired { get; set; }

        
        [MaxLength(1000)]
        public string? RequiredSkills { get; set; }

        
        public DateTime? Deadline { get; set; }

        
        public Guid? DepartmentId { get; set; }

        [ForeignKey(nameof(DepartmentId))]
        public Department? Department { get; set; }

        
        [Required]
        public Guid CreatedByRecruiterId { get; set; }

        [ForeignKey(nameof(CreatedByRecruiterId))]
        public User? CreatedByRecruiter { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        
        public DateTime? PublishedAt { get; set; }

        // Who is posting this job (company / organization name shown publicly)
        [MaxLength(200)]
        public string PostedBy { get; set; } = string.Empty;
    }
}
