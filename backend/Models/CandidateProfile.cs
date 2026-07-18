using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    /// <summary>
    /// Core candidate profile entity — 1:1 with User.
    /// File URLs (ResumeUrl, PhotoUrl) store paths only; binary is kept on disk.
    /// </summary>
    public class CandidateProfile
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        // ── Foreign key ──────────────────────────────────────────────────────
        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; } = null!;

        // ── Personal info ────────────────────────────────────────────────────
        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(150)]
        public string? Location { get; set; }

        /// <summary>Short professional headline, e.g. "Full-stack Developer · 5 yrs"</summary>
        [MaxLength(220)]
        public string? Headline { get; set; }

        // ── File references (URL / relative path only — no binary in DB) ─────
        [MaxLength(500)]
        public string? ResumeUrl { get; set; }

        [MaxLength(500)]
        public string? PhotoUrl { get; set; }

        // ── Privacy / lifecycle ──────────────────────────────────────────────
        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation collections ───────────────────────────────────────────
        public ICollection<WorkExperience> Experiences { get; set; } = new List<WorkExperience>();
        public ICollection<Education> Educations { get; set; } = new List<Education>();
        public ICollection<CandidateSkill> Skills { get; set; } = new List<CandidateSkill>();
        public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();

        /// <summary>1:1 social/portfolio links</summary>
        public CandidateLinks? Links { get; set; }
    }
}
