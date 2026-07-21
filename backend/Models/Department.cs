using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Department
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public string Name { get; set; } = string.Empty;       
        public string? Description { get; set; }
        public string Badge { get; set; } = string.Empty;        
        public string BadgeColor { get; set; } = "#64748b";
        public string? Head { get; set; } = string.Empty;     
        public string? ContactEmail { get; set; }
        public string HeadInitials { get; set; } = string.Empty;
        public string HeadColor { get; set; } = "#2563EB";
        public string? OrganizationName { get; set; }

        public Guid? OrganizationId { get; set; }
        public Organization? Organization { get; set; }
    }
}
