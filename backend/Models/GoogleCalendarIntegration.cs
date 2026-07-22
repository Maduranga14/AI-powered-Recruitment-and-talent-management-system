using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class GoogleCalendarIntegration
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; } = null!;

        public bool IsConnected { get; set; } = true;

        [Required, MaxLength(150)]
        public string GoogleEmail { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? AccessToken { get; set; }

        [MaxLength(2000)]
        public string? RefreshToken { get; set; }

        public DateTime? TokenExpiresAt { get; set; }

        [MaxLength(250)]
        public string CalendarId { get; set; } = "primary";

        public bool AutoSyncInterviews { get; set; } = true;

        public DateTime ConnectedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
