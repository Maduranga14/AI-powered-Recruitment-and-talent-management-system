using System;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.DTOs.Recruiter;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/recruiter")]
    [Authorize(Roles = "Recruiter")]
    [Produces("application/json")]
    public class RecruiterController(
        IRecruiterService recruiterService,
        IConfiguration configuration,
        IEmailService emailService,
        Data.AppDbContext db) : ControllerBase
    {
        private readonly IRecruiterService _recruiterService = recruiterService;
        private readonly IConfiguration _config = configuration;
        private readonly IEmailService _emailService = emailService;
        private readonly Data.AppDbContext _db = db;

        private Guid? GetRecruiterId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? User.FindFirstValue("sub");

            return Guid.TryParse(raw, out var id) ? id : null;
        }

        [HttpGet("hiring-managers")]
        [ProducesResponseType(typeof(RecruiterHiringManagersResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetHiringManagers()
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            var result = await _recruiterService.GetHiringManagersAndInvitesAsync(recruiterId.Value);
            return Ok(result);
        }

        [HttpPut("hiring-managers/{id:guid}/toggle-status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ToggleStatus(Guid id)
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var isActive = await _recruiterService.ToggleHiringManagerStatusAsync(id, recruiterId.Value);
                return Ok(new
                {
                    message = isActive ? "Hiring Manager account activated successfully." : "Hiring Manager account deactivated successfully.",
                    isActive
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("hiring-managers/invitations/{id:guid}/resend")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ResendInvite(Guid id)
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            var frontendBase = _config["FrontendBaseUrl"] ?? "http://localhost:5173";

            try
            {
                var message = await _recruiterService.ResendInvitationAsync(id, recruiterId.Value, frontendBase);
                return Ok(new { message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("hiring-managers/invitations/{id:guid}/revoke")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RevokeInvite(Guid id)
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                await _recruiterService.RevokeInvitationAsync(id, recruiterId.Value);
                return Ok(new { message = "Invitation revoked successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
        }

        [HttpGet("hiring-managers/{id:guid}/availability")]
        [ProducesResponseType(typeof(System.Collections.Generic.List<BusySlotDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetHiringManagerAvailability(Guid id)
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                var result = await _recruiterService.GetHiringManagerAvailabilityAsync(id, recruiterId.Value);
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("hiring-managers/{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteHiringManager(Guid id)
        {
            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            try
            {
                await _recruiterService.DeleteHiringManagerAsync(id, recruiterId.Value);
                return Ok(new { message = "Hiring Manager account deleted successfully." });
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
        }

        /// <summary>
        /// Send a direct email message from the recruiter to a candidate.
        /// The recruiter's name and organisation are resolved from their JWT claims.
        /// </summary>
        [HttpPost("messages/send")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var recruiterId = GetRecruiterId();
            if (recruiterId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            // Resolve recruiter name + org from DB
            var recruiter = await _db.Users
                .Include(u => u.Organization)
                .FirstOrDefaultAsync(u => u.Id == recruiterId.Value);

            var recruiterName = recruiter != null
                ? $"{recruiter.FirstName} {recruiter.LastName}".Trim()
                : User.FindFirstValue(System.Security.Claims.ClaimTypes.Name) ?? "Your Recruiter";

            var orgName = recruiter?.Organization?.Name
                ?? recruiter?.OrganizationName
                ?? "TalentPortal";

            var htmlBody = $@"
                <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;'>
                    <div style='border-bottom:1px solid #f1f5f9;padding-bottom:16px;margin-bottom:20px;'>
                        <h2 style='margin:0;color:#0f172a;font-size:20px;'>Message from {System.Web.HttpUtility.HtmlEncode(recruiterName)}</h2>
                        <p style='margin:4px 0 0;color:#64748b;font-size:14px;'>{System.Web.HttpUtility.HtmlEncode(orgName)}</p>
                    </div>
                    <p style='color:#334155;font-size:15px;line-height:1.6;'>Dear {System.Web.HttpUtility.HtmlEncode(dto.ToName)},</p>
                    <div style='background:#f8fafc;border-left:4px solid #4f46e5;border-radius:8px;padding:16px 20px;margin:16px 0;'>
                        <p style='color:#1e293b;font-size:15px;line-height:1.7;white-space:pre-wrap;margin:0;'>{System.Web.HttpUtility.HtmlEncode(dto.Message)}</p>
                    </div>
                    {(string.IsNullOrWhiteSpace(dto.JobTitle) ? "" : $"<p style='color:#475569;font-size:14px;margin-top:16px;'>Regarding: <strong>{System.Web.HttpUtility.HtmlEncode(dto.JobTitle)}</strong></p>")}
                    <hr style='border:0;border-top:1px solid #e2e8f0;margin:24px 0;'/>
                    <p style='color:#64748b;font-size:13px;margin:0;'>
                        This message was sent via <strong>TalentPortal AI</strong> by {System.Web.HttpUtility.HtmlEncode(recruiterName)} at {System.Web.HttpUtility.HtmlEncode(orgName)}.
                        Please reply directly to this email to respond.
                    </p>
                </div>";

            try
            {
                await _emailService.SendEmailAsync(dto.ToEmail, dto.Subject, htmlBody);
                return Ok(new { message = $"Message sent to {dto.ToEmail} successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to send email. " + ex.Message });
            }
        }
    }
}
