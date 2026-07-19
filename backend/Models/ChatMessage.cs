using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class ChatMessage
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ConversationId { get; set; }

        [ForeignKey(nameof(ConversationId))]
        public ChatConversation Conversation { get; set; } = null!;

        /// <summary>system | user | assistant</summary>
        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "user";

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
