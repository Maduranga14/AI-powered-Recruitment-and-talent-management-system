using System.Security.Claims;
using System.Text.Json;
using backend.Data;
using backend.DTOs.Admin;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AuditLogService(AppDbContext db, IHttpContextAccessor httpContextAccessor) : IAuditLogService
    {
        private readonly AppDbContext _db = db;
        private readonly IHttpContextAccessor _http = httpContextAccessor;

        public async Task LogActivityAsync(
            string action,
            string module,
            Guid? userId = null,
            string? userName = null,
            string? ipAddress = null,
            object? details = null)
        {
            var http = _http.HttpContext;
            var resolvedUserId = userId ?? ResolveUserId(http);
            var resolvedUserName = userName ?? ResolveUserName(http) ?? "System";
            var resolvedIp = ipAddress ?? ResolveIpAddress(http);

            var detailsJson = details switch
            {
                null => null,
                string s => s,
                _ => JsonSerializer.Serialize(details)
            };

            var entry = new AuditLog
            {
                UserId = resolvedUserId,
                UserName = resolvedUserName,
                Action = action.Trim(),
                Module = module.Trim(),
                IpAddress = resolvedIp,
                Timestamp = DateTime.UtcNow,
                Details = detailsJson
            };

            _db.AuditLogs.Add(entry);
            await _db.SaveChangesAsync();
        }

        public async Task<PagedResultDto<AuditLogDto>> GetAuditLogsAsync(
            int page,
            int pageSize,
            string? search = null,
            string? module = null)
        {
            var query = _db.AuditLogs.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(module))
                query = query.Where(a => a.Module == module);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(a =>
                    a.Action.ToLower().Contains(term) ||
                    a.UserName.ToLower().Contains(term) ||
                    a.Module.ToLower().Contains(term) ||
                    (a.Details != null && a.Details.ToLower().Contains(term)) ||
                    a.IpAddress.Contains(term));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(a => a.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AuditLogDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    UserName = a.UserName,
                    Action = a.Action,
                    Module = a.Module,
                    IpAddress = a.IpAddress,
                    Timestamp = a.Timestamp,
                    Details = a.Details
                })
                .ToListAsync();

            return new PagedResultDto<AuditLogDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<IReadOnlyList<string>> GetModulesAsync()
        {
            return await _db.AuditLogs
                .AsNoTracking()
                .Select(a => a.Module)
                .Distinct()
                .OrderBy(m => m)
                .ToListAsync();
        }

        private static Guid? ResolveUserId(HttpContext? http)
        {
            var raw = http?.User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? http?.User.FindFirstValue("sub");
            return Guid.TryParse(raw, out var id) ? id : null;
        }

        private static string? ResolveUserName(HttpContext? http)
        {
            return http?.User.FindFirstValue(ClaimTypes.Name)
                ?? http?.User.FindFirstValue(ClaimTypes.Email);
        }

        private static string ResolveIpAddress(HttpContext? http)
        {
            if (http == null) return "unknown";

            var forwarded = http.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(forwarded))
                return forwarded.Split(',')[0].Trim();

            return http.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }
    }
}
