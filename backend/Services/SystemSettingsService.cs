using backend.Data;
using backend.DTOs.Admin;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class SystemSettingsService(AppDbContext db) : ISystemSettingsService
    {
        private readonly AppDbContext _db = db;

        public async Task<List<SystemSettingDto>> GetAllSettingsAsync()
        {
            return await _db.SystemSettings
                .AsNoTracking()
                .OrderBy(s => s.Key)
                .Select(s => MapToDto(s))
                .ToListAsync();
        }

        public async Task<List<SystemSettingDto>> UpdateSettingsAsync(
            UpdateSystemSettingsDto dto,
            string updatedBy)
        {
            var keys = dto.Settings.Select(s => s.Key.Trim()).ToList();
            var existing = await _db.SystemSettings
                .Where(s => keys.Contains(s.Key))
                .ToListAsync();

            var existingKeys = existing.Select(s => s.Key).ToHashSet(StringComparer.OrdinalIgnoreCase);
            var unknownKeys = keys.Where(k => !existingKeys.Contains(k)).ToList();
            if (unknownKeys.Count > 0)
                throw new KeyNotFoundException($"Unknown setting key(s): {string.Join(", ", unknownKeys)}");

            var now = DateTime.UtcNow;
            foreach (var update in dto.Settings)
            {
                var setting = existing.First(s =>
                    string.Equals(s.Key, update.Key.Trim(), StringComparison.OrdinalIgnoreCase));
                setting.Value = update.Value.Trim();
                setting.UpdatedAt = now;
                setting.UpdatedBy = updatedBy;
            }

            await _db.SaveChangesAsync();
            return await GetAllSettingsAsync();
        }

        private static SystemSettingDto MapToDto(Models.SystemSetting s) => new()
        {
            Id = s.Id,
            Key = s.Key,
            Value = s.Value,
            Description = s.Description,
            UpdatedAt = s.UpdatedAt,
            UpdatedBy = s.UpdatedBy
        };
    }
}
