using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Candidate
{
    // ─── Request DTO ──────────────────────────────────────────────────────────

    public class EducationDto
    {
        [Required]
        [MaxLength(200)]
        public string Institution { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Degree { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string FieldOfStudy { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        /// <summary>Null for ongoing studies.</summary>
        public DateTime? EndDate { get; set; }
    }

    // ─── Response DTO ─────────────────────────────────────────────────────────

    public class EducationResponseDto
    {
        public Guid Id { get; set; }
        public string Institution { get; set; } = string.Empty;
        public string Degree { get; set; } = string.Empty;
        public string FieldOfStudy { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
