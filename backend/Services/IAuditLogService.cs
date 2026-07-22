using backend.DTOs.Admin;

namespace backend.Services
{
    /// <summary>
    /// Central audit trail service. Inject into any service or controller that performs
    /// sensitive operations and call <see cref="LogActivityAsync"/> after success.
    /// </summary>
    public interface IAuditLogService
    {
        /// <summary>
        /// Persists an audit event. When <paramref name="userId"/> / <paramref name="userName"/>
        /// are omitted, the current authenticated user is resolved from HttpContext.
        /// </summary>
        /// <param name="action">Machine-readable code, e.g. USER_LOGIN, JOB_CREATED.</param>
        /// <param name="module">Functional area, e.g. Auth, Jobs, Users.</param>
        /// <param name="userId">Actor user id (optional — resolved from JWT when null).</param>
        /// <param name="userName">Actor display name (optional — resolved from JWT when null).</param>
        /// <param name="ipAddress">Client IP (optional — resolved from HttpContext when null).</param>
        /// <param name="details">Extra context; objects are serialized to JSON.</param>
        Task LogActivityAsync(
            string action,
            string module,
            Guid? userId = null,
            string? userName = null,
            string? ipAddress = null,
            object? details = null);

        Task<PagedResultDto<AuditLogDto>> GetAuditLogsAsync(
            int page,
            int pageSize,
            string? search = null,
            string? module = null);

        Task<IReadOnlyList<string>> GetModulesAsync();
    }
}
