using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;

namespace backend.Models
{
    /// <summary>
    /// Represents a candidate's application to a specific job posting.
    /// </summary>
    public class JobApplication
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid CandidateProfileId { get; set; }

        [ForeignKey(nameof(CandidateProfileId))]
        public CandidateProfile CandidateProfile { get; set; } = null!;

        public Guid JobPostingId { get; set; }

        [ForeignKey(nameof(JobPostingId))]
        public JobPosting JobPosting { get; set; } = null!;

        public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Optional cover letter text submitted with the application.</summary>
        [MaxLength(3000)]
        public string? CoverLetter { get; set; }

        [MaxLength(2000)]
        public string? Feedback { get; set; }

        [MaxLength(50)]
        public string? Recommendation { get; set; }

        public int? OverallRating { get; set; }

        public string? SkillRatings { get; set; }

        public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
    }
}
