using backend.DTOs.Chat;
using backend.Models.Enums;

namespace backend.Services
{
    public interface IAiChatService
    {
        Task<List<ChatConversationSummaryDto>> GetConversationsAsync(Guid userId);
        Task<ChatConversationDetailDto> GetConversationAsync(Guid userId, Guid conversationId);
        Task DeleteConversationAsync(Guid userId, Guid conversationId);
        Task<SendChatResponseDto> SendMessageAsync(Guid userId, UserRole role, string? displayName, SendChatMessageDto dto);
        ChatSuggestionsDto GetSuggestions(UserRole role, string? displayName);
    }
}
