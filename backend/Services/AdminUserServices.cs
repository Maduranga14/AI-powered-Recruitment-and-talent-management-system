using backend.Data;
using backend.DTOs.Admin;
using backend.DTOs.Auth;
using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AdminUserService(AppDbContext dbContext, IEmailService emailService) : IAdminUserService
    {
        private readonly AppDbContext _db = dbContext;
        private readonly IEmailService _emailService = emailService;

        public async Task<UserListDto> CreateUserAsync(CreateUserDto dto)
        {
            if (dto.Role != UserRole.Recruiter && dto.Role != UserRole.HiringManager)
                throw new ArgumentException("Admin can only create Recruiter or HiringManager accounts.");

            var emailExists = await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (emailExists)
                throw new InvalidOperationException($"A user with email '{dto.Email}' already exists.");

            var user = new User
            {
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Email = dto.Email.ToLower().Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                Status = UserStatus.Active,
                OrganizationId = dto.OrganizationId,
                DepartmentId = dto.DepartmentId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // Load navigation properties for mapping
            if (user.OrganizationId.HasValue)
                await _db.Entry(user).Reference(u => u.Organization).LoadAsync();
            if (user.DepartmentId.HasValue)
                await _db.Entry(user).Reference(u => u.Department).LoadAsync();

            return MapToListDto(user);
        }

        public async Task<PagedResultDto<UserListDto>> GetAllUsersAsync(UserRole? roleFilter, int page, int pageSize)
        {
            var query = _db.Users
                .Include(u => u.Organization)
                .Include(u => u.Department)
                .AsQueryable();

            if (roleFilter.HasValue)
                query = query.Where(u => u.Role == roleFilter.Value);

            var totalCount = await query.CountAsync();

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = users.Select(MapToListDto).ToList();

            return new PagedResultDto<UserListDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<UserListDto?> GetUserByIdAsync(Guid id)
        {
            var user = await _db.Users.FindAsync(id);
            return user is null ? null : MapToListDto(user);
        }

        public async Task<bool> ToggleUserActiveAsync(Guid id)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException($"User with ID '{id}' not found.");

            if (user.Role == UserRole.Admin)
                throw new InvalidOperationException("Admin accounts cannot be deactivated.");

            user.IsActive = !user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return user.IsActive;
        }

        public async Task ResetUserPasswordAsync(Guid id, string newPassword)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException($"User with ID '{id}' not found.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
        }

        // ─── Recruiter Approval Workflow ─────────────────────────────────────

        public async Task<List<PendingRecruiterDto>> GetPendingRecruitersAsync()
        {
            return await _db.Users
                .Where(u => u.Role == UserRole.Recruiter && u.Status == UserStatus.Pending)
                .OrderBy(u => u.CreatedAt)
                .Select(u => new PendingRecruiterDto
                {
                    Id = u.Id,
                    FullName = $"{u.FirstName} {u.LastName}",
                    Email = u.Email,
                    OrganizationName = u.OrganizationName ?? "—",
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();
        }

        public async Task ApproveRecruiterAsync(Guid id)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException($"User with ID '{id}' not found.");

            if (user.Role != UserRole.Recruiter)
                throw new InvalidOperationException("Only Recruiter accounts can be approved via this endpoint.");

            if (user.Status == UserStatus.Active)
                throw new InvalidOperationException("This recruiter account is already active.");

            user.Status = UserStatus.Active;
            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            // Send notification email
            var emailSubject = "Your Recruiter Account Application has been Approved!";
            var emailBody = $@"
                <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'>
                    <h2 style='color: #22c55e; margin-bottom: 16px;'>Congratulations!</h2>
                    <p style='color: #475569; font-size: 16px; line-height: 1.6;'>Hello {user.FirstName}, your Recruiter account for the organization <strong>{user.OrganizationName}</strong> has been successfully approved by the administrator.</p>
                    <p style='color: #475569; font-size: 16px; line-height: 1.6;'>You can now log in to post jobs, manage candidate application pipelines, and invite your hiring manager team.</p>
                    <p style='margin: 24px 0; text-align: center;'>
                        <a href='http://localhost:5173/login' style='background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;'>Login to TalentPortal AI</a>
                    </p>
                    <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;' />
                    <p style='color: #94a3b8; font-size: 12px;'>This is an automated notification. Please do not reply directly to this email.</p>
                </div>";

            try
            {
                await _emailService.SendEmailAsync(user.Email, emailSubject, emailBody);
            }
            catch
            {
                // Silently log or swallow email failures in background so status update succeeds
            }
        }

        public async Task RejectRecruiterAsync(Guid id)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException($"User with ID '{id}' not found.");

            if (user.Role != UserRole.Recruiter)
                throw new InvalidOperationException("Only Recruiter accounts can be rejected via this endpoint.");

            if (user.Status == UserStatus.Rejected)
                throw new InvalidOperationException("This recruiter account has already been rejected.");

            user.Status = UserStatus.Rejected;
            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            // Send notification email
            var emailSubject = "Update regarding your Recruiter Account Application";
            var emailBody = $@"
                <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'>
                    <h2 style='color: #ef4444; margin-bottom: 16px;'>Application Status Update</h2>
                    <p style='color: #475569; font-size: 16px; line-height: 1.6;'>Hello {user.FirstName},</p>
                    <p style='color: #475569; font-size: 16px; line-height: 1.6;'>Thank you for your interest in registering a recruiter account for <strong>{user.OrganizationName}</strong> on TalentPortal AI.</p>
                    <p style='color: #475569; font-size: 16px; line-height: 1.6;'>After reviewing your application, we regret to inform you that we are unable to approve your recruiter account at this time.</p>
                    <p style='color: #475569; font-size: 16px; line-height: 1.6;'>If you believe this was an error or would like to request another review, please reach out to our system administrator support team.</p>
                    <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;' />
                    <p style='color: #94a3b8; font-size: 12px;'>This is an automated notification. Please do not reply directly to this email.</p>
                </div>";

            try
            {
                await _emailService.SendEmailAsync(user.Email, emailSubject, emailBody);
            }
            catch
            {
                // Silently log or swallow email failures in background so status update succeeds
            }
        }

        private static UserListDto MapToListDto(User u) => new()
        {
            Id = u.Id,
            FullName = $"{u.FirstName} {u.LastName}",
            Email = u.Email,
            Role = u.Role.ToString(),
            Status = u.Status.ToString(),
            OrganizationName = u.Organization?.Name ?? u.OrganizationName,
            OrganizationId = u.OrganizationId,
            DepartmentName = u.Department?.Name,
            DepartmentId = u.DepartmentId,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        };
    }
}
