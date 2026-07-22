using System;
using System.Collections.Generic;

namespace backend.DTOs.Candidate
{
    public class JobRecommendationDto
    {
        public Guid JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string EmploymentType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public string SalaryCurrency { get; set; } = "USD";
        public List<string> RequiredSkills { get; set; } = new();
        public int MatchScore { get; set; }
        public string MatchExplanation { get; set; } = string.Empty;
    }
}
