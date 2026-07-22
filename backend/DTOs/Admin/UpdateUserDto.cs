using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using backend.Models.Enums;

namespace backend.DTOs.Admin
{
    public class UpdateUserDto
    {
        [Required(ErrorMessage = "First name is required.")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Last name is required.")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = string.Empty;

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public UserRole? Role { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public UserStatus? Status { get; set; }

        public Guid? OrganizationId { get; set; }

        public Guid? DepartmentId { get; set; }
    }
}
