using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Candidate
{
    public class ParsedResumeDto
    {
        public string? Phone { get; set; }
        public string? Location { get; set; }
        public string? Headline { get; set; }
        public List<string> Skills { get; set; } = new();
        public List<WorkExperienceDto> Experiences { get; set; } = new();
        public List<EducationDto> Educations { get; set; } = new();
    }
}
