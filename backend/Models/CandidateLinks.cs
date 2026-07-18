using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    /// <summary>
    /// Social / portfolio links for a candidate — 1:1 with CandidateProfile.
    /// All fields are optional; the row is created/updated with the profile.
    /// </summary>
    public class CandidateLinks
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid CandidateProfileId { get; set; }

        [ForeignKey(nameof(CandidateProfileId))]
        public CandidateProfile CandidateProfile { get; set; } = null!;

        [MaxLength(300)]
        public string? LinkedIn { get; set; }

        [MaxLength(300)]
        public string? Portfolio { get; set; }

        [MaxLength(300)]
        public string? GitHub { get; set; }
    }
}
