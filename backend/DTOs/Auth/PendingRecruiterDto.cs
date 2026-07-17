namespace backend.DTOs.Auth
{
    public class PendingRecruiterDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string OrganizationName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
