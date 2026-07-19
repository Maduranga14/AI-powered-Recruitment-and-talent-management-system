using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Chat
{
    public class ChatConversationSummaryDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int MessageCount { get; set; }
        public string? LastMessagePreview { get; set; }
    }

    public class ChatMessageDto
    {
        public Guid Id { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class ChatConversationDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<ChatMessageDto> Messages { get; set; } = [];
    }

    public class SendChatMessageDto
    {
        [Required(ErrorMessage = "Message is required.")]
        [StringLength(4000, MinimumLength = 1)]
        public string Message { get; set; } = string.Empty;

        /// <summary>Optional existing conversation. Omit to start a new one.</summary>
        public Guid? ConversationId { get; set; }
    }

    public class SendChatResponseDto
    {
        public Guid ConversationId { get; set; }
        public string ConversationTitle { get; set; } = string.Empty;
        public ChatMessageDto UserMessage { get; set; } = null!;
        public ChatMessageDto AssistantMessage { get; set; } = null!;
        public bool UsedFallback { get; set; }
    }

    public class ChatSuggestionsDto
    {
        public List<string> Suggestions { get; set; } = [];
        public string Greeting { get; set; } = string.Empty;
        public string AssistantName { get; set; } = "TalentPortal AI";
    }
}
