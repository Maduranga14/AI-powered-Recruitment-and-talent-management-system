using backend.DTOs.Admin;
using backend.Models.Enums;

namespace backend.Services
{
    public interface IAdminUserService
    {
        Task<UserListDto> CreateUserAsync(CreateUserDto dto);
        Task<PagedResultDto<UserListDto>> GetAllUsersAsync(UserRole? roleFilter, int page, int pageSize);
        Task<UserListDto?> GetUserByIdAsync(Guid id);
        Task<bool> ToggleUserActiveAsync(Guid id);
        Task ResetUserPasswordAsync(Guid id, string newPassword);
    }
}
