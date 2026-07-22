using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Recruiter
{
    public class SendMessageDto
    {
        /// <summary>Recipient candidate email address.</summary>
        [Required, EmailAddress]
        public string ToEmail { get; set; } = string.Empty;

        /// <summary>Recipient display name (used in the email greeting).</summary>
        [Required]
        public string ToName { get; set; } = string.Empty;

        /// <summary>Email subject line.</summary>
        [Required, MaxLength(200)]
        public string Subject { get; set; } = string.Empty;

        /// <summary>Plain-text message body written by the recruiter.</summary>
        [Required, MaxLength(4000)]
        public string Message { get; set; } = string.Empty;

        /// <summary>Optional job title for context in the email footer.</summary>
        public string? JobTitle { get; set; }
    }
}
