namespace backend.Models
{
    public class CandidateProfile
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid UserId { get; set; }

        public string? Phone { get; set; }

        public string? Location { get; set; }

        public string? LinkedInUrl { get; set; }

        public string? Skills { get; set; }

        public int? ExperienceYears { get; set; }

        public string? EducationLevel { get; set; }

        public string? ResumeFileUrl { get; set; }

        public string? Bio { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
    }
}
