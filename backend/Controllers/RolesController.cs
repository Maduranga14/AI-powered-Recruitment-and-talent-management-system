using backend.DTOs.Admin;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Produces("application/json")]
    public class RolesController(IRoleService roleService) : ControllerBase
    {
        private readonly IRoleService _roleService = roleService;

        [HttpGet]
        [ProducesResponseType(typeof(List<RoleDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllRoles()
        {
            var result = await _roleService.GetAllRolesAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(RoleDetailsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetRoleDetails(string id)
        {
            var result = await _roleService.GetRoleDetailsAsync(id);
            if (result == null)
            {
                return NotFound(new { message = $"Role with ID '{id}' was not found." });
            }
            return Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(RoleDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _roleService.CreateRoleAsync(dto);
            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPut("{id}/permissions")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateRolePermissions(string id, [FromBody] UpdateRolePermissionsDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var success = await _roleService.UpdateRolePermissionsAsync(id, dto);
            if (!success)
            {
                return NotFound(new { message = $"Role with ID '{id}' was not found." });
            }
            return Ok(new { message = "Role permissions updated successfully." });
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteRole(string id)
        {
            try
            {
                var success = await _roleService.DeleteRoleAsync(id);
                if (!success)
                {
                    return NotFound(new { message = $"Role with ID '{id}' was not found." });
                }
                return Ok(new { message = "Role deleted successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
