namespace backend.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;

        public Guid UserId { get; set; }

        public string Email { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public string Status { get; set; } = "Active";

        public string? OrganizationName { get; set; }

        public DateTime ExpiresAt { get; set; }
    }
}
