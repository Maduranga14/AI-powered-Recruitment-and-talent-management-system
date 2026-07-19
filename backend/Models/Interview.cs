using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    /// <summary>
    /// A scheduled interview for a job application, created by a recruiter.
    /// </summary>
    public class Interview
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid JobApplicationId { get; set; }

        [ForeignKey(nameof(JobApplicationId))]
        public JobApplication JobApplication { get; set; } = null!;

        /// <summary>UTC start time of the interview.</summary>
        public DateTime ScheduledAt { get; set; }

        public int DurationMinutes { get; set; } = 60;

        /// <summary>Video | Phone | Onsite</summary>
        [Required, MaxLength(30)]
        public string InterviewType { get; set; } = "Video";

        [MaxLength(500)]
        public string? MeetingLink { get; set; }

        [MaxLength(300)]
        public string? Location { get; set; }

        [Required, MaxLength(150)]
        public string InterviewerName { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Notes { get; set; }

        public Guid CreatedByRecruiterId { get; set; }

        [ForeignKey(nameof(CreatedByRecruiterId))]
        public User CreatedByRecruiter { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
