namespace backend.DTOs.Auth
{
    /// <summary>
    /// Returned by GET /api/auth/validate-invite so the frontend can pre-fill the HM registration form.
    /// </summary>
    public class InviteInfoDto
    {
        public string InvitedEmail { get; set; } = string.Empty;
        public string OrganizationName { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}
