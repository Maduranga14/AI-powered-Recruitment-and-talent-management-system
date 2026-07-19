using System.Security.Claims;
using backend.DTOs.Chat;
using backend.Models.Enums;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/chat")]
    [Produces("application/json")]
    public class ChatController(IAiChatService chatService) : ControllerBase
    {
        private readonly IAiChatService _chatService = chatService;

        /// <summary>Role-aware greeting and suggested prompts</summary>
        [HttpGet("suggestions")]
        [ProducesResponseType(typeof(ChatSuggestionsDto), StatusCodes.Status200OK)]
        public IActionResult GetSuggestions()
        {
            var (userId, role, name) = GetUserContext();
            if (userId == null) return Unauthorized(new { message = "Invalid session." });

            return Ok(_chatService.GetSuggestions(role, name));
        }

        /// <summary>List the current user's conversations</summary>
        [HttpGet("conversations")]
        [ProducesResponseType(typeof(List<ChatConversationSummaryDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListConversations()
        {
            var (userId, _, _) = GetUserContext();
            if (userId == null) return Unauthorized(new { message = "Invalid session." });

            var result = await _chatService.GetConversationsAsync(userId.Value);
            return Ok(result);
        }

        /// <summary>Get a conversation with messages</summary>
        [HttpGet("conversations/{id:guid}")]
        [ProducesResponseType(typeof(ChatConversationDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetConversation(Guid id)
        {
            var (userId, _, _) = GetUserContext();
            if (userId == null) return Unauthorized(new { message = "Invalid session." });

            try
            {
                var result = await _chatService.GetConversationAsync(userId.Value, id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>Delete a conversation</summary>
        [HttpDelete("conversations/{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteConversation(Guid id)
        {
            var (userId, _, _) = GetUserContext();
            if (userId == null) return Unauthorized(new { message = "Invalid session." });

            try
            {
                await _chatService.DeleteConversationAsync(userId.Value, id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>Send a message (creates a conversation if needed)</summary>
        [HttpPost("messages")]
        [ProducesResponseType(typeof(SendChatResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SendMessage([FromBody] SendChatMessageDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (userId, role, name) = GetUserContext();
            if (userId == null) return Unauthorized(new { message = "Invalid session." });

            try
            {
                var result = await _chatService.SendMessageAsync(userId.Value, role, name, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private (Guid? UserId, UserRole Role, string? Name) GetUserContext()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? User.FindFirstValue("sub");

            if (!Guid.TryParse(raw, out var id))
                return (null, UserRole.Candidate, null);

            var roleClaim = User.FindFirstValue(ClaimTypes.Role) ?? "Candidate";
            Enum.TryParse<UserRole>(roleClaim, true, out var role);

            var name = User.FindFirstValue(ClaimTypes.Name)
                    ?? User.FindFirstValue("fullName")
                    ?? User.Identity?.Name;

            return (id, role, name);
        }
    }
}
