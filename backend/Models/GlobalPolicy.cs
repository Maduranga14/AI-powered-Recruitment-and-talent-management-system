using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class GlobalPolicy
    {
        [Key]
        public string Id { get; set; } = string.Empty;

        [Required]
        public string Label { get; set; } = string.Empty;

        [Required]
        public string Desc { get; set; } = string.Empty;

        public bool Enabled { get; set; }
    }
}
