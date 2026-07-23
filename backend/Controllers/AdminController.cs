using System.Security.Claims;
using backend.DTOs.Admin;
using backend.Models.Enums;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Produces("application/json")]
    public class AdminController(
        IAdminUserService adminUserService,
        IAuditLogService auditLogService,
        ISystemSettingsService systemSettingsService) : ControllerBase
    {
        private readonly IAdminUserService _adminUserService = adminUserService;
        private readonly IAuditLogService _auditLogService = auditLogService;
        private readonly ISystemSettingsService _systemSettingsService = systemSettingsService;

        [HttpPost("users")]
        [ProducesResponseType(typeof(UserListDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var user = await _adminUserService.CreateUserAsync(dto);
                return StatusCode(StatusCodes.Status201Created, new
                {
                    message = $"{dto.Role} account created successfully.",
                    data = user
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpGet("users")]
        [ProducesResponseType(typeof(PagedResultDto<UserListDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUsers(
            [FromQuery] UserRole? role = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var result = await _adminUserService.GetAllUsersAsync(role, page, pageSize);
            return Ok(result);
        }

        [HttpGet("users/{id:guid}")]
        [ProducesResponseType(typeof(UserListDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var user = await _adminUserService.GetUserByIdAsync(id);
            if (user is null)
                return NotFound(new { message = $"User with ID '{id}' not found." });

            return Ok(user);
        }

        [HttpPut("users/{id:guid}")]
        [ProducesResponseType(typeof(UserListDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var user = await _adminUserService.UpdateUserAsync(id, dto);
                return Ok(new { message = "User updated successfully.", data = user });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("users/{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                await _adminUserService.DeleteUserAsync(id);
                return Ok(new { message = "User account deleted successfully." });
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

        [HttpPut("users/{id:guid}/toggle-status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ToggleUserStatus(Guid id)
        {
            try
            {
                var isActive = await _adminUserService.ToggleUserActiveAsync(id);
                return Ok(new
                {
                    message = isActive ? "User account activated." : "User account deactivated.",
                    isActive
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

        [HttpPut("users/{id:guid}/reset-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 8)
                return BadRequest(new { message = "New password must be at least 8 characters." });

            try
            {
                await _adminUserService.ResetUserPasswordAsync(id, dto.NewPassword);
                return Ok(new { message = "Password reset successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ─── User Management Endpoints ─────────────────────────────────────

        // ─── Audit Logs ───────────────────────────────────────────────────────

        /// <summary>Paginated audit trail with optional search and module filter.</summary>
        [HttpGet("audit-logs")]
        [ProducesResponseType(typeof(PagedResultDto<AuditLogDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAuditLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null,
            [FromQuery] string? module = null)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var result = await _auditLogService.GetAuditLogsAsync(page, pageSize, search, module);
            return Ok(result);
        }

        /// <summary>Distinct module names present in the audit log (for filter dropdowns).</summary>
        [HttpGet("audit-logs/modules")]
        [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAuditModules()
        {
            var modules = await _auditLogService.GetModulesAsync();
            return Ok(modules);
        }

        // ─── System Settings ──────────────────────────────────────────────────

        /// <summary>Retrieve all persisted system configuration key-value pairs.</summary>
        [HttpGet("settings")]
        [ProducesResponseType(typeof(List<SystemSettingDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _systemSettingsService.GetAllSettingsAsync();
            return Ok(settings);
        }

        /// <summary>Update one or more system settings by key.</summary>
        [HttpPut("settings")]
        [ProducesResponseType(typeof(List<SystemSettingDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateSystemSettingsDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updatedBy = User.FindFirstValue(ClaimTypes.Email)
                    ?? User.FindFirstValue(ClaimTypes.Name)
                    ?? "Admin";

                var settings = await _systemSettingsService.UpdateSettingsAsync(dto, updatedBy);

                await _auditLogService.LogActivityAsync(
                    action: "SETTINGS_UPDATED",
                    module: "Settings",
                    details: new { keys = dto.Settings.Select(s => s.Key).ToList() });

                return Ok(new { message = "Settings updated successfully.", data = settings });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
