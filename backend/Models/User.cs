using backend.Models.Enums;

namespace backend.Models
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public UserRole Role { get; set; }

        
        public UserStatus Status { get; set; } = UserStatus.Active;

        private string? _organizationName;
        public string? OrganizationName
        {
            get => Organization?.Name ?? _organizationName;
            set => _organizationName = value;
        }

        public Guid? OrganizationId { get; set; }
        public Organization? Organization { get; set; }

        public Guid? DepartmentId { get; set; }
        public Department? Department { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public CandidateProfile? CandidateProfile { get; set; }

        public string FullName => $"{FirstName} {LastName}";
    }
}
