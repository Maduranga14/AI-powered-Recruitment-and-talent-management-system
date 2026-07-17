namespace backend.Models
{
    public class HiringManagerInvitation
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        
        public string Token { get; set; } = string.Empty;

        public string InvitedEmail { get; set; } = string.Empty;

        
        public string OrganizationName { get; set; } = string.Empty;

        
        public Guid CreatedByRecruiterId { get; set; }

        public DateTime ExpiresAt { get; set; }

        public bool IsUsed { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
