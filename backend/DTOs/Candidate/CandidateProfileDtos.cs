using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Candidate
{
    // ─── Create request ───────────────────────────────────────────────────────

    public class CreateCandidateProfileDto
    {
        [Required(ErrorMessage = "Phone is required.")]
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Location is required.")]
        [MaxLength(150)]
        public string Location { get; set; } = string.Empty;

        [Required(ErrorMessage = "Headline is required.")]
        [MaxLength(220)]
        public string Headline { get; set; } = string.Empty;

        public List<WorkExperienceDto> Experiences { get; set; } = new();
        public List<EducationDto> Educations { get; set; } = new();
        public List<string> Skills { get; set; } = new();
        public CandidateLinksDto? Links { get; set; }
    }

    // ─── Update request ───────────────────────────────────────────────────────

    public class UpdateCandidateProfileDto
    {
        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(150)]
        public string? Location { get; set; }

        [MaxLength(220)]
        public string? Headline { get; set; }

        /// <summary>
        /// When provided, replaces all existing experience entries.
        /// Send null to leave experiences unchanged.
        /// </summary>
        public List<WorkExperienceDto>? Experiences { get; set; }

        /// <summary>
        /// When provided, replaces all existing education entries.
        /// Send null to leave education unchanged.
        /// </summary>
        public List<EducationDto>? Educations { get; set; }

        /// <summary>
        /// When provided, replaces all existing skills.
        /// Send null to leave skills unchanged.
        /// </summary>
        public List<string>? Skills { get; set; }

        /// <summary>When provided, replaces link fields. Send null to leave links unchanged.</summary>
        public CandidateLinksDto? Links { get; set; }
    }

    // ─── Full profile response ────────────────────────────────────────────────

    public class CandidateProfileResponseDto
    {
        public Guid Id { get; set; }

        // From User entity
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // Profile fields
        public string? Phone { get; set; }
        public string? Location { get; set; }
        public string? Headline { get; set; }
        public string? ResumeUrl { get; set; }
        public string? PhotoUrl { get; set; }

        public List<WorkExperienceResponseDto> Experiences { get; set; } = new();
        public List<EducationResponseDto> Educations { get; set; } = new();
        public List<string> Skills { get; set; } = new();
        public CandidateLinksDto? Links { get; set; }

        // Computed
        public int CompletenessPercent { get; set; }
        public List<string> MissingFields { get; set; } = new();

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // ─── Export response (mirrors full profile — can be extended) ────────────

    public class CandidateProfileExportDto
    {
        public Guid ProfileId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Location { get; set; }
        public string? Headline { get; set; }
        public string? ResumeUrl { get; set; }
        public string? PhotoUrl { get; set; }
        public List<WorkExperienceResponseDto> Experiences { get; set; } = new();
        public List<EducationResponseDto> Educations { get; set; } = new();
        public List<string> Skills { get; set; } = new();
        public CandidateLinksDto? Links { get; set; }
        public List<ApplicationResponseDto> Applications { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime ExportedAt { get; set; } = DateTime.UtcNow;
    }
}
