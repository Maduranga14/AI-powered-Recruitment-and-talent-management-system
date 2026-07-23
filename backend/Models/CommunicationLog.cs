using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class CommunicationLog
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ApplicationId { get; set; }

        [ForeignKey(nameof(ApplicationId))]
        public JobApplication Application { get; set; } = null!;

        [Required]
        public Guid SenderId { get; set; }

        [ForeignKey(nameof(SenderId))]
        public User Sender { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Body { get; set; } = string.Empty;

        [MaxLength(50)]
        public string MessageType { get; set; } = "ManualEmail"; // "ManualEmail", "StatusUpdate", "InterviewInvite"

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
