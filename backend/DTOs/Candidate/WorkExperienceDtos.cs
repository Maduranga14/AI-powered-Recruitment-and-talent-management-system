using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Candidate
{
    // ─── Request DTO ──────────────────────────────────────────────────────────

    public class WorkExperienceDto
    {
        [Required]
        [MaxLength(150)]
        public string Company { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        /// <summary>Leave null when IsCurrent = true.</summary>
        public DateTime? EndDate { get; set; }

        public bool IsCurrent { get; set; } = false;

        [MaxLength(1000)]
        public string? Description { get; set; }
    }

    // ─── Response DTO ─────────────────────────────────────────────────────────

    public class WorkExperienceResponseDto
    {
        public Guid Id { get; set; }
        public string Company { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrent { get; set; }
        public string? Description { get; set; }
    }
}
