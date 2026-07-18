using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Candidate
{
    public class CandidateLinksDto
    {
        [MaxLength(300)]
        [Url(ErrorMessage = "LinkedIn must be a valid URL.")]
        public string? LinkedIn { get; set; }

        [MaxLength(300)]
        [Url(ErrorMessage = "Portfolio must be a valid URL.")]
        public string? Portfolio { get; set; }

        [MaxLength(300)]
        [Url(ErrorMessage = "GitHub must be a valid URL.")]
        public string? GitHub { get; set; }
    }
}
