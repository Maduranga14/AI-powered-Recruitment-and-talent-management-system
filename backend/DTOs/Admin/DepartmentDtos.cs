using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Admin
{
    public class OrganizationDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Sub { get; set; } = string.Empty;
    }
    public class DepartmentDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Badge { get; set; } = string.Empty;
        public string BadgeColor { get; set; } = string.Empty;
        public string Head { get; set; } = string.Empty;
        public string HeadInitials { get; set; } = string.Empty;
        public string HeadColor { get; set; } = string.Empty;
    }

    public class GlobalPolicyDto
    {
        public string Id { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Desc { get; set; } = string.Empty;
        public bool Enabled { get; set; }
    }

    public class DepartmentDashboardDto
    {
        public OrganizationDto CorporateStructure { get; set; } = new();
        public List<DepartmentDto> Departments { get; set; } = [];
        public List<GlobalPolicyDto> GlobalPolicies { get; set; } = [];
    }

    public class CreateDepartmentDto
    {
        [Required(ErrorMessage = "Department name is required.")]
        [StringLength(100, ErrorMessage = "Department name cannot exceed 100 characters.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(50, ErrorMessage = "Badge text cannot exceed 50 characters.")]
        public string Badge { get; set; } = string.Empty;

        [StringLength(7, ErrorMessage = "Badge color must be a valid hex color code.")]
        public string BadgeColor { get; set; } = "#64748b";

        [Required(ErrorMessage = "Department head name is required.")]
        [StringLength(100, ErrorMessage = "Head name cannot exceed 100 characters.")]
        public string Head { get; set; } = string.Empty;

        [StringLength(10, ErrorMessage = "Head initials cannot exceed 10 characters.")]
        public string HeadInitials { get; set; } = string.Empty;

        [StringLength(7, ErrorMessage = "Head color must be a valid hex color code.")]
        public string HeadColor { get; set; } = "#2563EB";
    }
}
