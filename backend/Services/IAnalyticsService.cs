using backend.DTOs.Admin;

namespace backend.Services
{
    public interface IAnalyticsService
    {
        Task<DashboardAnalyticsDto> GetDashboardAsync();
    }
}
