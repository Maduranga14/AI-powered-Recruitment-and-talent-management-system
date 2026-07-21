using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Organization
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string TaxNumber { get; set; } = string.Empty;

        public string? Website { get; set; }

        [StringLength(1000)]
        public string? ShortDescription { get; set; }

        public string? LogoUrl { get; set; }

        public string Sub { get; set; } = string.Empty;

        public string Plan { get; set; } = "Starter";

        public string Status { get; set; } = "Healthy";

        public string? Owner { get; set; }

        public string? MonthlyUsage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public ICollection<User> Users { get; set; } = new List<User>();

        [JsonIgnore]
        public ICollection<Department> Departments { get; set; } = new List<Department>();
    }
}
