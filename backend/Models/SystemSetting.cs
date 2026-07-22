namespace backend.Models
{
    /// <summary>
    /// Key-value system configuration persisted in the database.
    /// </summary>
    public class SystemSetting
    {
        public int Id { get; set; }

        public string Key { get; set; } = string.Empty;

        public string Value { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public string UpdatedBy { get; set; } = string.Empty;
    }
}
