using System.Security.Claims;
using backend.DTOs.Auth;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class AuthController(IAuthService authService, IConfiguration configuration) : ControllerBase
    {
        private readonly IAuthService _authService = authService;
        private readonly IConfiguration _config = configuration;

        // ─── Candidate Registration ───────────────────
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Register([FromBody] RegisterCandidateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _authService.RegisterCandidateAsync(dto);
                return StatusCode(StatusCodes.Status201Created, new
                {
                    message = "Account created successfully. Welcome to TalentPortal AI!",
                    data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // ─── Recruiter Registration (Pending) ─────────
        [HttpPost("register-recruiter")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> RegisterRecruiter([FromBody] RegisterRecruiterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var message = await _authService.RegisterRecruiterAsync(dto);
                return StatusCode(StatusCodes.Status201Created, new { message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // ─── Login ────────────────────────────────────
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _authService.LoginAsync(dto);
                return Ok(new
                {
                    message = "Login successful.",
                    data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                // Pending / Rejected recruiters → 403 with clear message
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        // ─── Invite Hiring Manager ────────────────────
        [HttpPost("invite-hiring-manager")]
        [Authorize(Roles = "Recruiter,Admin")]
        [ProducesResponseType(typeof(InviteResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> InviteHiringManager([FromBody] InviteHiringManagerDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var recruiterIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                              ?? User.FindFirstValue("sub");

            if (!Guid.TryParse(recruiterIdStr, out var recruiterId))
                return Unauthorized(new { message = "Invalid session. Please log in again." });

            var frontendBase = _config["FrontendBaseUrl"] ?? "http://localhost:5173";

            try
            {
                var result = await _authService.InviteHiringManagerAsync(dto, recruiterId, frontendBase);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
        }

        // ─── Validate Invite Token ────────────────────
        [HttpGet("validate-invite")]
        [ProducesResponseType(typeof(InviteInfoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ValidateInvite([FromQuery] string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest(new { message = "Token is required." });

            try
            {
                var info = await _authService.ValidateInviteAsync(token);
                return Ok(info);
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

        // ─── Register Hiring Manager via Token ────────
        [HttpPost("register-hiring-manager")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> RegisterHiringManager([FromBody] RegisterHiringManagerDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _authService.RegisterHiringManagerAsync(dto);
                return StatusCode(StatusCodes.Status201Created, new
                {
                    message = "Account created successfully. Welcome to TalentPortal AI!",
                    data = result
                });
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

        // ─── Me ───────────────────────────────────────
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult Me()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue("sub");
            var email = User.FindFirstValue(ClaimTypes.Email)
                      ?? User.FindFirstValue("email");
            var role = User.FindFirstValue(ClaimTypes.Role);
            var fullName = User.FindFirstValue("fullName");

            return Ok(new
            {
                userId,
                email,
                role,
                fullName
            });
        }
    }
}
