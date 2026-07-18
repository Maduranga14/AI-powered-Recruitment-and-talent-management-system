using System;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.DTOs.Recruiter;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/recruiter")]
    [Authorize(Roles = "Recruiter")]
    [Produces("application/json")]
    public class RecruiterController(IRecruiterService recruiterService, IConfiguration configuration) : ControllerBase
    {
        private readonly IRecruiterService _recruiterService = recruiterService;
        private readonly IConfiguration _config = configuration;

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
    }
}
