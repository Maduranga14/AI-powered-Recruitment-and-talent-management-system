using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    /// <summary>
    /// A single skill tag on a candidate's profile (1-to-many).
    /// </summary>
    public class CandidateSkill
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid CandidateProfileId { get; set; }

        [ForeignKey(nameof(CandidateProfileId))]
        public CandidateProfile CandidateProfile { get; set; } = null!;

        [Required]
        [MaxLength(80)]
        public string Name { get; set; } = string.Empty;
    }
}
