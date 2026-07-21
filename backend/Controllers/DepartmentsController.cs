using System.Security.Claims;
using backend.DTOs.Admin;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Recruiter")]
    [Produces("application/json")]
    public class DepartmentsController(IDepartmentService departmentService) : ControllerBase
    {
        private readonly IDepartmentService _departmentService = departmentService;

        private Guid? GetUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? User.FindFirstValue("sub");

            return Guid.TryParse(raw, out var id) ? id : null;
        }

        [HttpGet("dashboard")]
        [ProducesResponseType(typeof(DepartmentDashboardDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDashboard([FromQuery] string? organizationName = null)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            var result = await _departmentService.GetDepartmentDashboardAsync(userId.Value, organizationName);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(DepartmentDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            var dept = await _departmentService.CreateDepartmentAsync(dto, userId.Value);
            return StatusCode(StatusCodes.Status201Created, dept);
        }

        [HttpPut("policies/{id}/toggle")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(GlobalPolicyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> TogglePolicy(string id)
        {
            try
            {
                var result = await _departmentService.TogglePolicyAsync(id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteDepartment(Guid id)
        {
            var deleted = await _departmentService.DeleteDepartmentAsync(id);
            if (!deleted)
                return NotFound(new { message = $"Department with ID '{id}' not found." });

            return NoContent();
        }
    }

}
