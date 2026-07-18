using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Candidate
{
    // ─── Apply to a job request ───────────────────────────────────────────────

    public class ApplyToJobDto
    {
        [Required]
        public Guid JobPostingId { get; set; }

        [MaxLength(3000)]
        public string? CoverLetter { get; set; }
    }

    // ─── Application response ─────────────────────────────────────────────────

    public class ApplicationResponseDto
    {
        public Guid ApplicationId { get; set; }
        public Guid JobPostingId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string EmploymentType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? CoverLetter { get; set; }
        public DateTime AppliedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
