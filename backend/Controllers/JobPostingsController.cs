using System.Security.Claims;
using backend.DTOs.Jobs;
using backend.Models.Enums;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Produces("application/json")]
    public class JobPostingsController(IJobPostingService jobService, ICandidateProfileService profileService) : ControllerBase
    {
        private readonly IJobPostingService _jobService = jobService;
        private readonly ICandidateProfileService _profileService = profileService;

        
        [HttpPost("api/recruiter/jobs")]
        [Authorize(Roles = "Recruiter")]
        [ProducesResponseType(typeof(JobPostingDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Create([FromBody] CreateJobPostingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _jobService.CreateAsync(dto, recruiterId.Value);
                return StatusCode(StatusCodes.Status201Created, new
                {
                    message = dto.Status == JobStatus.Published
                        ? "Job posting published successfully."
                        : "Job posting saved as draft.",
                    data = result
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpGet("api/recruiter/jobs")]
        [Authorize(Roles = "Recruiter")]
        [ProducesResponseType(typeof(PagedJobsDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMyJobs(
            [FromQuery] JobStatus? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            var result = await _jobService.GetByRecruiterAsync(recruiterId.Value, status, page, pageSize);
            return Ok(result);
        }

        
        [HttpGet("api/recruiter/jobs/{id:guid}")]
        [Authorize(Roles = "Recruiter")]
        [ProducesResponseType(typeof(JobPostingDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDetail(Guid id)
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _jobService.GetDetailAsync(id, recruiterId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        
        [HttpPut("api/recruiter/jobs/{id:guid}")]
        [Authorize(Roles = "Recruiter")]
        [ProducesResponseType(typeof(JobPostingDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateJobPostingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _jobService.UpdateAsync(id, dto, recruiterId.Value);
                return Ok(new { message = "Job posting updated.", data = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpPatch("api/recruiter/jobs/{id:guid}/status")]
        [Authorize(Roles = "Recruiter")]
        [ProducesResponseType(typeof(JobPostingDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeJobStatusDto dto)
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _jobService.ChangeStatusAsync(id, dto.Status, recruiterId.Value);
                return Ok(new { message = $"Job status changed to '{dto.Status}'.", data = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpDelete("api/recruiter/jobs/{id:guid}")]
        [Authorize(Roles = "Recruiter")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                await _jobService.DeleteAsync(id, recruiterId.Value);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpGet("api/recruiter/jobs/{id:guid}/applicants")]
        [Authorize(Roles = "Recruiter")]
        [ProducesResponseType(typeof(JobApplicantsResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetApplicants(Guid id, [FromQuery] bool includeAiScores = false)
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _jobService.GetApplicantsAsync(id, recruiterId.Value, includeAiScores);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        
        [HttpGet("api/recruiter/applicants")]
        [Authorize(Roles = "Recruiter")]
        [ProducesResponseType(typeof(List<JobApplicantDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllApplicants([FromQuery] bool includeAiScores = false)
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            var result = await _jobService.GetAllApplicantsAsync(recruiterId.Value, includeAiScores);
            return Ok(result);
        }

        
        [HttpPatch("api/recruiter/jobs/{id:guid}/applicants/{applicationId:guid}/status")]
        [Authorize(Roles = "Recruiter")]
        [ProducesResponseType(typeof(JobApplicantDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateApplicantStatus(
            Guid id, Guid applicationId, [FromBody] UpdateApplicationStatusDto dto)
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _jobService.UpdateApplicationStatusAsync(
                    id, applicationId, dto.Status, recruiterId.Value);
                return Ok(new { message = $"Application status updated to '{dto.Status}'.", data = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        

        
        [HttpGet("api/jobs")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(List<PublicJobPageDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPublishedJobs(
            [FromQuery] string? keyword = null,
            [FromQuery] string? location = null,
            [FromQuery] EmploymentType? type = null)
        {
            var result = await _jobService.GetPublishedJobsAsync(keyword, location, type);
            return Ok(result);
        }

        
        [HttpGet("api/jobs/{id:guid}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(PublicJobPageDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPublicJobPage(Guid id)
        {
            try
            {
                var result = await _jobService.GetPublicJobPageAsync(id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        
        [HttpGet("api/recruiter/candidates/{id:guid}/profile")]
        [Authorize(Roles = "Recruiter,HiringManager")]
        [ProducesResponseType(typeof(backend.DTOs.Candidate.CandidateProfileResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCandidateProfile(Guid id)
        {
            try
            {
                var result = await _profileService.GetProfileByIdAsync(id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        
        [HttpGet("api/manager/applicants")]
        [Authorize(Roles = "HiringManager")]
        [ProducesResponseType(typeof(List<JobApplicantDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetManagerApplicants()
        {
            var managerId = GetRecruiterId();
            if (managerId == null) return Unauthorized();

            try
            {
                var result = await _jobService.GetManagerApplicantsAsync(managerId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        
        [HttpPatch("api/manager/applications/{applicationId:guid}/feedback")]
        [Authorize(Roles = "HiringManager")]
        [ProducesResponseType(typeof(JobApplicantDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SubmitManagerFeedback(Guid applicationId, [FromBody] SubmitFeedbackDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var managerId = GetRecruiterId();
            if (managerId == null) return Unauthorized();

            try
            {
                var result = await _jobService.SubmitManagerFeedbackAsync(applicationId, dto.Recommendation, dto.Feedback, dto.OverallRating, dto.SkillRatings, managerId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        
        [HttpPost("api/manager/applications/{applicationId:guid}/decision")]
        [Authorize(Roles = "HiringManager")]
        [ProducesResponseType(typeof(JobApplicantDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> MakeHiringDecision(Guid applicationId, [FromBody] MakeHiringDecisionDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var managerId = GetRecruiterId();
            if (managerId == null) return Unauthorized();

            try
            {
                var result = await _jobService.MakeHiringDecisionAsync(applicationId, dto.Decision, dto.Notes, managerId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        
        [HttpPost("api/recruiter/jobs/{id:guid}/applicants/{applicationId:guid}/interview")]
        [Authorize(Roles = "Recruiter")]
        [ProducesResponseType(typeof(InterviewDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ScheduleInterview(
            Guid id, Guid applicationId, [FromBody] ScheduleInterviewDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _jobService.ScheduleInterviewAsync(id, applicationId, dto, recruiterId.Value);
                return StatusCode(StatusCodes.Status201Created, new
                {
                    message = "Interview scheduled successfully.",
                    data = result
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpGet("api/recruiter/interviews")]
        [Authorize(Roles = "Recruiter")]
        [ProducesResponseType(typeof(List<InterviewDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetInterviews()
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            var result = await _jobService.GetInterviewsAsync(recruiterId.Value);
            return Ok(result);
        }

        
        [HttpGet("api/manager/interviews")]
        [Authorize(Roles = "HiringManager")]
        [ProducesResponseType(typeof(List<InterviewDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetManagerInterviews()
        {
            var managerId = GetRecruiterId();
            if (managerId == null) return Unauthorized();

            try
            {
                var result = await _jobService.GetManagerInterviewsAsync(managerId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        
        [HttpPost("api/manager/interviews/{interviewId:guid}/request-reschedule")]
        [Authorize(Roles = "HiringManager")]
        [ProducesResponseType(typeof(InterviewDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RequestReschedule(
            Guid interviewId, [FromBody] RequestRescheduleDto? dto)
        {
            var managerId = GetRecruiterId();
            if (managerId == null) return Unauthorized();

            try
            {
                var result = await _jobService.RequestRescheduleAsync(
                    interviewId, dto?.Reason, managerId.Value);
                return Ok(new
                {
                    message = "Reschedule request sent to the recruiter.",
                    data = result
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

      
        [HttpPut("api/recruiter/interviews/{interviewId:guid}")]
        [Authorize(Roles = "Recruiter")]
        [ProducesResponseType(typeof(InterviewDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RescheduleInterview(
            Guid interviewId, [FromBody] ScheduleInterviewDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _jobService.RescheduleInterviewAsync(interviewId, dto, recruiterId.Value);
                return Ok(new
                {
                    message = "Interview rescheduled successfully.",
                    data = result
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

       
        [HttpPost("api/manager/interviews/{interviewId:guid}/feedback")]
        [Authorize(Roles = "HiringManager")]
        [ProducesResponseType(typeof(InterviewDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> SubmitInterviewFeedback(
            Guid interviewId, [FromBody] SubmitInterviewFeedbackDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var managerId = GetRecruiterId();
            if (managerId == null) return Unauthorized();

            try
            {
                var result = await _jobService.SubmitInterviewFeedbackAsync(interviewId, dto, managerId.Value);
                return Ok(new
                {
                    message = "Interview feedback submitted. Application is now Under Final Review.",
                    data = result
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpPost("api/jobpostings/applications/{applicationId:guid}/send-email")]
        [Authorize(Roles = "Recruiter,Admin")]
        [ProducesResponseType(typeof(CommunicationLogDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SendApplicantEmail(
            Guid applicationId, [FromBody] SendApplicantEmailDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var recruiterId = GetRecruiterId();
            if (recruiterId == null) return Unauthorized();

            try
            {
                var result = await _jobService.SendApplicantEmailAsync(applicationId, dto, recruiterId.Value);
                return Ok(new
                {
                    message = "Email sent to candidate successfully.",
                    data = result
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpGet("api/jobpostings/applications/{applicationId:guid}/communication-history")]
        [Authorize(Roles = "Recruiter,Admin")]
        [ProducesResponseType(typeof(List<CommunicationLogDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCommunicationHistory(Guid applicationId)
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null) return Unauthorized();

            var history = await _jobService.GetCommunicationHistoryAsync(applicationId, recruiterId.Value);
            return Ok(history);
        }

        private Guid? GetRecruiterId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? User.FindFirstValue("sub");

            return Guid.TryParse(raw, out var id) ? id : null;
        }
    }
}
