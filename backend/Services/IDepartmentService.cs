using backend.DTOs.Admin;

namespace backend.Services
{
    public interface IDepartmentService
    {
        Task<DepartmentDashboardDto> GetDepartmentDashboardAsync();
        Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto dto);
        Task<GlobalPolicyDto> TogglePolicyAsync(string id);
        Task<bool> DeleteDepartmentAsync(Guid id);
    }
}
