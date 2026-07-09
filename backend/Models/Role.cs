using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Role
    {
        [Key]
        public string Id { get; set; } = string.Empty; // e.g. "global-admin"

        [Required]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Icon { get; set; } = "admin";

        public string Tags { get; set; } = string.Empty; // Comma-separated list

        public bool IsDefault { get; set; }

        public ICollection<RolePermission> Permissions { get; set; } = new List<RolePermission>();
    }
}
