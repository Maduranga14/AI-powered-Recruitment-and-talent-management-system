using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    /// <summary>
    /// A single education entry on a candidate's profile (1-to-many).
    /// </summary>
    public class Education
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid CandidateProfileId { get; set; }

        [ForeignKey(nameof(CandidateProfileId))]
        public CandidateProfile CandidateProfile { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string Institution { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Degree { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string FieldOfStudy { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        /// <summary>Null for ongoing studies.</summary>
        public DateTime? EndDate { get; set; }
    }
}
