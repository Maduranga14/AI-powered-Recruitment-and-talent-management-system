using backend.DTOs.Admin;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/admin/analytics")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Produces("application/json")]
    public class AnalyticsController(IAnalyticsService analyticsService) : ControllerBase
    {
        private readonly IAnalyticsService _analytics = analyticsService;

        /// <summary>Returns aggregated recruitment analytics for the admin dashboard.</summary>
        [HttpGet("dashboard")]
        [ProducesResponseType(typeof(DashboardAnalyticsDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var data = await _analytics.GetDashboardAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, detail = ex.InnerException?.Message });
            }
        }
    }
}
