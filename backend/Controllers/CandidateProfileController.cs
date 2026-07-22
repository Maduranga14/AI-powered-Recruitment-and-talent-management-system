using System.Security.Claims;
using backend.DTOs.Candidate;
using backend.DTOs.Jobs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// Candidate Profile — CRUD, resume management, applications, and privacy controls.
    /// All endpoints require the Candidate role.
    /// </summary>
    [ApiController]
    [Route("api/candidate/profile")]
    [Authorize(Roles = "Candidate")]
    [Produces("application/json")]
    public class CandidateProfileController(
        ICandidateProfileService profileService,
        IAiResumeParserService parserService) : ControllerBase
    {
        private readonly ICandidateProfileService _profileService = profileService;
        private readonly IAiResumeParserService _parserService = parserService;

        // ── Profile CRUD ──────────────────────────────────────────────────────

        /// <summary>Create the candidate's profile (one per account).</summary>
        [HttpPost]
        [ProducesResponseType(typeof(CandidateProfileResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CreateProfile([FromBody] CreateCandidateProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _profileService.CreateProfileAsync(userId.Value, dto);
                return StatusCode(StatusCodes.Status201Created, new
                {
                    message = "Profile created successfully.",
                    data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>Get the caller's full profile including completeness metrics.</summary>
        [HttpGet]
        [ProducesResponseType(typeof(CandidateProfileResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _profileService.GetProfileAsync(userId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>Get AI job recommendations for the logged-in candidate.</summary>
        [HttpGet("recommendations")]
        [ProducesResponseType(typeof(List<JobRecommendationDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetRecommendations()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var recommendations = await _profileService.GetJobRecommendationsAsync(userId.Value);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An error occurred while matching job postings.",
                    error = ex.Message,
                    detail = ex.InnerException?.Message
                });
            }
        }

        /// <summary>Update profile fields. Only provided fields are changed.</summary>
        [HttpPut]
        [ProducesResponseType(typeof(CandidateProfileResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateCandidateProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _profileService.UpdateProfileAsync(userId.Value, dto);
                return Ok(new { message = "Profile updated successfully.", data = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An error occurred while updating the profile.",
                    error = ex.Message,
                    detail = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        // ── Resume management ─────────────────────────────────────────────────

        /// <summary>
        /// Upload or replace resume file. Accepts multipart/form-data with a "file" field.
        /// Allowed types: PDF, DOC, DOCX. Max size: 5 MB.
        /// </summary>
        [HttpPost("resume")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UploadResume(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file was provided." });

            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var url = await _profileService.UploadResumeAsync(userId.Value, file);
                return Ok(new { message = "Resume uploaded successfully.", resumeUrl = url });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An error occurred while uploading the resume.",
                    error = ex.Message,
                    detail = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        /// <summary>
        /// Parse resume file using AI. Uploads the resume and parses its text, returning the profile recommendation pre-fills.
        /// </summary>
        [HttpPost("resume/parse")]
        [ProducesResponseType(typeof(ParsedResumeDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ParseResume(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file was provided." });

            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                // 1. Upload/save resume to storage first
                var url = await _profileService.UploadResumeAsync(userId.Value, file);

                // 2. Extract and parse with AI
                using var stream = file.OpenReadStream();
                var parsedData = await _parserService.ParseResumeAsync(stream, file.ContentType);

                return Ok(new
                {
                    message = "Resume uploaded and parsed successfully by AI.",
                    resumeUrl = url,
                    data = parsedData
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (NotSupportedException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An error occurred while parsing the resume.",
                    error = ex.Message,
                    detail = ex.InnerException?.Message
                });
            }
        }

        /// <summary>Delete the uploaded resume from storage and clear the reference in the profile.</summary>
        [HttpDelete("resume")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> DeleteResume()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                await _profileService.DeleteResumeAsync(userId.Value);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An error occurred while deleting the resume.",
                    error = ex.Message,
                    detail = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        // ── Applications ──────────────────────────────────────────────────────

        /// <summary>List all jobs the candidate has applied to with their current status.</summary>
        [HttpGet("applications")]
        [ProducesResponseType(typeof(List<ApplicationResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetApplications()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _profileService.GetApplicationsAsync(userId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>List interviews scheduled for the logged-in candidate.</summary>
        [HttpGet("interviews")]
        [ProducesResponseType(typeof(List<InterviewDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetInterviews()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _profileService.GetInterviewsAsync(userId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>Apply to a published job posting.</summary>
        [HttpPost("applications")]
        [ProducesResponseType(typeof(ApplicationResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ApplyToJob([FromBody] ApplyToJobDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _profileService.ApplyToJobAsync(userId.Value, dto);
                return StatusCode(StatusCodes.Status201Created, new
                {
                    message = "Application submitted successfully.",
                    data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ── Privacy controls ──────────────────────────────────────────────────

        /// <summary>
        /// Soft-delete the profile: sets IsDeleted=true and wipes personal data fields.
        /// The user account itself is not removed.
        /// </summary>
        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> DeleteProfile()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                await _profileService.DeleteProfileAsync(userId.Value);
                return Ok(new { message = "Profile has been removed. Your account remains active." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>Export all profile data as JSON (GDPR-style data export).</summary>
        [HttpGet("export")]
        [ProducesResponseType(typeof(CandidateProfileExportDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ExportProfile()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _profileService.ExportProfileAsync(userId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ── Helper ────────────────────────────────────────────────────────────

        private Guid? GetUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? User.FindFirstValue("sub");

            return Guid.TryParse(raw, out var id) ? id : null;
        }
    }
}
