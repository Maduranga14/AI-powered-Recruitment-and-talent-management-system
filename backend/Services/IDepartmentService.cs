using backend.DTOs.Admin;

namespace backend.Services
{
    public interface IDepartmentService
    {
        Task<DepartmentDashboardDto> GetDepartmentDashboardAsync(Guid userId, string? filterOrganizationName = null);
        Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto dto, Guid userId);
        Task<GlobalPolicyDto> TogglePolicyAsync(string id);
        Task<bool> DeleteDepartmentAsync(Guid id);
    }
}
