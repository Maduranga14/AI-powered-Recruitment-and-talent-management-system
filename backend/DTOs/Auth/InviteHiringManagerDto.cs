using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth
{
    /// <summary>
    /// Sent by a Recruiter to invite a Hiring Manager.
    /// </summary>
    public class InviteHiringManagerDto
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
