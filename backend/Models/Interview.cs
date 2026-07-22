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

        /// <summary>True when the hiring manager asked the recruiter to pick a new time.</summary>
        public bool RescheduleRequested { get; set; }

        [MaxLength(1000)]
        public string? RescheduleReason { get; set; }

        public DateTime? RescheduleRequestedAt { get; set; }

        /// <summary>Set when the recruiter confirms a new interview time.</summary>
        public DateTime? LastRescheduledAt { get; set; }

        public Guid CreatedByRecruiterId { get; set; }

        [ForeignKey(nameof(CreatedByRecruiterId))]
        public User CreatedByRecruiter { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Google Calendar Sync ────────────────────────────────────────────────
        [MaxLength(250)]
        public string? GoogleCalendarEventId { get; set; }

        [MaxLength(1000)]
        public string? GoogleCalendarHtmlLink { get; set; }

        public bool IsSyncedToGoogleCalendar { get; set; }


        // ── Post-interview feedback (submitted by the hiring manager) ────────────

        /// <summary>Overall rating 1–5 submitted after the interview.</summary>
        public int? FeedbackOverallRating { get; set; }

        /// <summary>Strong Yes | Yes | Maybe | No | Strong No</summary>
        [MaxLength(20)]
        public string? FeedbackRecommendation { get; set; }

        /// <summary>Written evaluation: strengths, concerns, general impression.</summary>
        [MaxLength(4000)]
        public string? FeedbackComments { get; set; }

        /// <summary>JSON: {"Technical skills":4,"Communication":3,"Culture fit":5}</summary>
        public string? FeedbackSkillRatings { get; set; }

        /// <summary>Optional technical assessment score 1–5.</summary>
        public int? FeedbackTechnicalScore { get; set; }

        /// <summary>UTC timestamp when the hiring manager submitted feedback.</summary>
        public DateTime? FeedbackSubmittedAt { get; set; }
    }
}
