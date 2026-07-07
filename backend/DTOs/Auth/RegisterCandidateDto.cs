using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth
{
    public class RegisterCandidateDto
    {
        [Required(ErrorMessage = "First name is required.")]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Last name is required.")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage ="password is required.")]
        [MinLength(8, ErrorMessage ="Password must be at least 8 characters.")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$",
            ErrorMessage = "Password must contain uppercase, lowercase, number, and special character.")]
        public String Password { get; set; } = String.Empty;

        [Required(ErrorMessage ="confirm password is required.")]
        [Compare("Password", ErrorMessage = "Password do not match")]
        public string ConfirmPassword {  get; set; } = String.Empty;
        
    }
}
