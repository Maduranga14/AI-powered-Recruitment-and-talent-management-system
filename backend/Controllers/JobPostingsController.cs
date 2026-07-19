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

        // RECRUITER ENDPOINTS  —  /api/recruiter/jobs

        /// <summary>Create a new job posting (Draft or Published immediately)</summary>
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

        /// <summary>List all job postings created by the logged-in recruiter</summary>
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

        /// <summary>Get full detail of a single job posting (must belong to requester)</summary>
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

        /// <summary>Update an existing job posting</summary>
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

        /// <summary>Change status: Draft → Published / Published → Closed|Archived / etc.</summary>
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

        /// <summary>Delete a Draft or Archived posting</summary>
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

        /// <summary>List candidates who applied to one of the recruiter's jobs</summary>
        [HttpGet("api/recruiter/jobs/{id:guid}/applicants")]
        [Authorize(Roles = "Recruiter")]
        [ProducesResponseType(typeof(JobApplicantsResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetApplicants(Guid id)
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _jobService.GetApplicantsAsync(id, recruiterId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>List applicants across all of the recruiter's jobs</summary>
        [HttpGet("api/recruiter/applicants")]
        [Authorize(Roles = "Recruiter")]
        [ProducesResponseType(typeof(List<JobApplicantDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllApplicants()
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            var result = await _jobService.GetAllApplicantsAsync(recruiterId.Value);
            return Ok(result);
        }

        /// <summary>Update pipeline status for an applicant on a recruiter-owned job</summary>
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

        

        /// <summary>Browse all published jobs (candidates, unauthenticated)</summary>
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

        /// <summary>View a single published job page</summary>
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

        /// <summary>Get a candidate's profile by ID (Recruiters/Managers only)</summary>
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

        /// <summary>List candidates who applied to jobs headed by the logged-in manager's departments</summary>
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

        /// <summary>Submit notes/feedback and move application status for an applicant</summary>
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

        private Guid? GetRecruiterId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? User.FindFirstValue("sub");

            return Guid.TryParse(raw, out var id) ? id : null;
        }
    }
}
