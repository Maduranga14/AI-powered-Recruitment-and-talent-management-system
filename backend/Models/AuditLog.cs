namespace backend.Models
{
    /// <summary>
    /// Immutable record of a sensitive platform action for governance and compliance.
    /// </summary>
    public class AuditLog
    {
        public int Id { get; set; }

        /// <summary>Actor user identifier. Nullable for system/anonymous events.</summary>
        public Guid? UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        /// <summary>Machine-readable action code, e.g. USER_LOGIN, JOB_CREATED.</summary>
        public string Action { get; set; } = string.Empty;

        /// <summary>Functional area, e.g. Auth, Jobs, Users, Settings.</summary>
        public string Module { get; set; } = string.Empty;

        public string IpAddress { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        /// <summary>JSON or free-text payload with contextual metadata.</summary>
        public string? Details { get; set; }
    }
}
