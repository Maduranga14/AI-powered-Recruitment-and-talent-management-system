namespace backend.DTOs.Admin
{
    public class AuditLogDto
    {
        public int Id { get; set; }
        public Guid? UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? Details { get; set; }
    }
}
