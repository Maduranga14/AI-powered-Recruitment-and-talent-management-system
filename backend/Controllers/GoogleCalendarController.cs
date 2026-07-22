using System.Security.Claims;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/google-calendar")]
    [Authorize]
    public class GoogleCalendarController : ControllerBase
    {
        private readonly IGoogleCalendarService _calendarService;

        public GoogleCalendarController(IGoogleCalendarService calendarService)
        {
            _calendarService = calendarService;
        }

        private Guid? GetUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? User.FindFirstValue("sub");

            return Guid.TryParse(raw, out var id) ? id : null;
        }

        /// <summary>
        /// Get current Google Calendar integration status for logged in user.
        /// </summary>
        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "Invalid token claims." });

            try
            {
                var status = await _calendarService.GetStatusAsync(userId.Value);
                return Ok(status);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error getting calendar status.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Connect Google Calendar account.
        /// </summary>
        [HttpPost("connect")]
        public async Task<IActionResult> Connect([FromBody] ConnectGoogleCalendarRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "Invalid token claims." });

            try
            {
                var status = await _calendarService.ConnectAsync(userId.Value, request);
                return Ok(new
                {
                    message = "Google Calendar connected successfully!",
                    data = status
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Disconnect Google Calendar integration.
        /// </summary>
        [HttpPost("disconnect")]
        public async Task<IActionResult> Disconnect()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "Invalid token claims." });

            try
            {
                await _calendarService.DisconnectAsync(userId.Value);
                return Ok(new { message = "Google Calendar disconnected successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update Google Calendar settings (e.g. auto-sync preferences).
        /// </summary>
        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateGoogleCalendarSettingsRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "Invalid token claims." });

            try
            {
                var status = await _calendarService.UpdateSettingsAsync(userId.Value, request);
                return Ok(new
                {
                    message = "Calendar settings updated successfully.",
                    data = status
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Sync a specific interview to Google Calendar.
        /// </summary>
        [HttpPost("sync/{interviewId:guid}")]
        public async Task<IActionResult> SyncInterview(Guid interviewId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "Invalid token claims." });

            try
            {
                var result = await _calendarService.SyncInterviewAsync(userId.Value, interviewId);
                return Ok(new
                {
                    message = result.Message,
                    data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Sync all upcoming interviews for the user to Google Calendar.
        /// </summary>
        [HttpPost("sync-all")]
        public async Task<IActionResult> SyncAllInterviews()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "Invalid token claims." });

            try
            {
                var results = await _calendarService.SyncAllInterviewsAsync(userId.Value);
                return Ok(new
                {
                    message = $"Synced {results.Count(r => r.Success)} interviews to Google Calendar.",
                    data = results
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
