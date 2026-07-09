using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class RolePermission
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string RoleId { get; set; } = string.Empty;

        [ForeignKey(nameof(RoleId))]
        public Role? Role { get; set; }

        [Required]
        public string PermissionId { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = string.Empty;

        [Required]
        public string Label { get; set; } = string.Empty; 

        public string Description { get; set; } = string.Empty; 

        public bool Enabled { get; set; }

        public bool View { get; set; }
        public bool Edit { get; set; }
        public bool Delete { get; set; }
    }
}
