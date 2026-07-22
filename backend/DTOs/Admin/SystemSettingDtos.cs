using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Admin
{
    public class SystemSettingDto
    {
        public int Id { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
    }

    public class UpdateSystemSettingsDto
    {
        [Required]
        [MinLength(1, ErrorMessage = "At least one setting must be provided.")]
        public List<SystemSettingUpdateItemDto> Settings { get; set; } = [];
    }

    public class SystemSettingUpdateItemDto
    {
        [Required]
        public string Key { get; set; } = string.Empty;

        [Required]
        public string Value { get; set; } = string.Empty;
    }
}
