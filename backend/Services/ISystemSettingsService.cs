using backend.DTOs.Admin;

namespace backend.Services
{
    public interface ISystemSettingsService
    {
        Task<List<SystemSettingDto>> GetAllSettingsAsync();
        Task<List<SystemSettingDto>> UpdateSettingsAsync(
            UpdateSystemSettingsDto dto,
            string updatedBy);
    }
}
