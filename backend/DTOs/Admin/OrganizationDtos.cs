using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Admin
{
    public class OrganizationDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string TaxNumber { get; set; } = string.Empty;

        public string? Website { get; set; }

        public string? ShortDescription { get; set; }

        public string? LogoUrl { get; set; }

        public string Initials { get; set; } = string.Empty;

        public string Sub { get; set; } = string.Empty;

        public string Plan { get; set; } = "Starter";

        public string Status { get; set; } = "Healthy";

        public string Owner { get; set; } = string.Empty;

        public int Members { get; set; }

        public int ActiveJobs { get; set; }

        public string Joined { get; set; } = string.Empty;

        public string MonthlyUsage { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }

    public class CreateOrganizationDto
    {
        [Required(ErrorMessage = "Organization name is required.")]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Registration/Tax number is required.")]
        [StringLength(100)]
        public string TaxNumber { get; set; } = string.Empty;

        public string? Website { get; set; }

        [StringLength(1000)]
        public string? ShortDescription { get; set; }

        public string? LogoUrl { get; set; }

        public string Sub { get; set; } = string.Empty;

        public string Plan { get; set; } = "Starter";

        public string Status { get; set; } = "Healthy";

        public string Owner { get; set; } = string.Empty;
    }

    public class UpdateOrganizationDto
    {
        [Required(ErrorMessage = "Organization name is required.")]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Registration/Tax number is required.")]
        [StringLength(100)]
        public string TaxNumber { get; set; } = string.Empty;

        public string? Website { get; set; }

        [StringLength(1000)]
        public string? ShortDescription { get; set; }

        public string? LogoUrl { get; set; }

        public string Sub { get; set; } = string.Empty;

        public string Plan { get; set; } = "Starter";

        public string Status { get; set; } = "Healthy";

        public string Owner { get; set; } = string.Empty;
    }
}
