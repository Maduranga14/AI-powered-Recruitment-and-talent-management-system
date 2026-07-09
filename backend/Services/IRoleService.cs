using backend.DTOs.Admin;

namespace backend.Services
{
    public interface IRoleService
    {
        Task<List<RoleDto>> GetAllRolesAsync();
        Task<RoleDetailsDto?> GetRoleDetailsAsync(string id);
        Task<RoleDto> CreateRoleAsync(CreateRoleDto dto);
        Task<bool> UpdateRolePermissionsAsync(string id, UpdateRolePermissionsDto dto);
        Task<bool> DeleteRoleAsync(string id);
    }
}
