using backend.DTOs.Admin;
using backend.DTOs.Auth;
using backend.Models.Enums;

namespace backend.Services
{
    public interface IAdminUserService
    {
        Task<UserListDto> CreateUserAsync(CreateUserDto dto);
        Task<PagedResultDto<UserListDto>> GetAllUsersAsync(UserRole? roleFilter, int page, int pageSize);
        Task<UserListDto?> GetUserByIdAsync(Guid id);
        Task<UserListDto> UpdateUserAsync(Guid id, UpdateUserDto dto);
        Task<bool> ToggleUserActiveAsync(Guid id);
        Task DeleteUserAsync(Guid id);
        Task ResetUserPasswordAsync(Guid id, string newPassword);

        // Recruiter approval workflow
        Task<List<PendingRecruiterDto>> GetPendingRecruitersAsync();
        Task ApproveRecruiterAsync(Guid id);
        Task RejectRecruiterAsync(Guid id);
    }
}
