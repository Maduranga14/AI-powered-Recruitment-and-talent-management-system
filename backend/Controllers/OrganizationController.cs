using backend.DTOs.Admin;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Produces("application/json")]
    public class OrganizationController(IOrganizationService organizationService) : ControllerBase
    {
        private readonly IOrganizationService _organizationService = organizationService;

        // ── Public / Shared Endpoint for Organization Lists ─────────
        [HttpGet("api/organizations")]
        [ProducesResponseType(typeof(List<OrganizationDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPublicOrganizations()
        {
            var orgs = await _organizationService.GetAllOrganizationsAsync();
            return Ok(orgs);
        }

        // ── Admin Managed Organization Endpoints ────────────────────
        [HttpGet("api/admin/organizations")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(List<OrganizationDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAdminOrganizations()
        {
            var orgs = await _organizationService.GetAllOrganizationsAsync();
            return Ok(orgs);
        }

        [HttpGet("api/admin/organizations/{id:guid}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(OrganizationDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrganizationById(Guid id)
        {
            var org = await _organizationService.GetOrganizationByIdAsync(id);
            if (org is null)
                return NotFound(new { message = $"Organization with ID '{id}' not found." });

            return Ok(org);
        }

        [HttpPost("api/admin/organizations")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(OrganizationDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> CreateOrganization([FromBody] CreateOrganizationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var org = await _organizationService.CreateOrganizationAsync(dto);
                return StatusCode(StatusCodes.Status201Created, new
                {
                    message = "Organization created successfully.",
                    data = org
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("api/admin/organizations/{id:guid}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(OrganizationDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOrganization(Guid id, [FromBody] UpdateOrganizationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var org = await _organizationService.UpdateOrganizationAsync(id, dto);
                return Ok(new
                {
                    message = "Organization updated successfully.",
                    data = org
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("api/admin/organizations/{id:guid}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOrganization(Guid id)
        {
            try
            {
                await _organizationService.DeleteOrganizationAsync(id);
                return Ok(new { message = "Organization deleted successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
