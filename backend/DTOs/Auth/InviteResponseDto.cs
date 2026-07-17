namespace backend.DTOs.Auth
{
    public class InviteResponseDto
    {
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// The full invite link. During development this is returned directly.
        /// In production, send via email and omit from the response.
        /// </summary>
        public string InviteLink { get; set; } = string.Empty;

        public string Token { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }
    }
}
