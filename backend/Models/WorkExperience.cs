using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    /// <summary>
    /// A single work-experience entry on a candidate's profile (1-to-many).
    /// </summary>
    public class WorkExperience
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid CandidateProfileId { get; set; }

        [ForeignKey(nameof(CandidateProfileId))]
        public CandidateProfile CandidateProfile { get; set; } = null!;

        [Required]
        [MaxLength(150)]
        public string Company { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        /// <summary>Null when IsCurrent = true.</summary>
        public DateTime? EndDate { get; set; }

        /// <summary>True if this is the candidate's current job.</summary>
        public bool IsCurrent { get; set; } = false;

        [MaxLength(1000)]
        public string? Description { get; set; }
    }
}
