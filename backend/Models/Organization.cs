using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Organization
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Name { get; set; } = string.Empty;

        public string Sub { get; set; } = string.Empty;
    }
}
