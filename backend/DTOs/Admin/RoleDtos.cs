using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Admin
{
    public class RoleDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = [];
        public bool IsDefault { get; set; }
    }

    public class RolePermissionDto
    {
        public string Id { get; set; } = string.Empty; 
        public string Label { get; set; } = string.Empty;
        public string Desc { get; set; } = string.Empty;
        public bool Enabled { get; set; }
        public bool View { get; set; }
        public bool Edit { get; set; }
        public bool Delete { get; set; }
    }

    public class RolePermissionsGroupDto
    {
        public List<RolePermissionDto> AiInsights { get; set; } = [];
        public List<RolePermissionDto> SystemManagement { get; set; } = [];
        public List<RolePermissionDto> RecruitmentOps { get; set; } = [];
    }

    public class RoleDetailsDto
    {
        public RoleDto Role { get; set; } = new();
        public RolePermissionsGroupDto Permissions { get; set; } = new();
    }

    public class CreateRoleDto
    {
        [Required(ErrorMessage = "Role name is required.")]
        [StringLength(100, ErrorMessage = "Role name cannot exceed 100 characters.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(300, ErrorMessage = "Role description cannot exceed 300 characters.")]
        public string Description { get; set; } = string.Empty;

        [StringLength(50, ErrorMessage = "Icon name cannot exceed 50 characters.")]
        public string Icon { get; set; } = "admin";

        [StringLength(200, ErrorMessage = "Tags cannot exceed 200 characters.")]
        public string Tags { get; set; } = string.Empty; // comma-separated
    }

    public class UpdateRolePermissionsDto
    {
        [Required]
        public List<PermissionUpdateItem> Permissions { get; set; } = [];
    }

    public class PermissionUpdateItem
    {
        [Required]
        public string PermissionId { get; set; } = string.Empty;
        public bool Enabled { get; set; }
        public bool View { get; set; }
        public bool Edit { get; set; }
        public bool Delete { get; set; }
    }
}
