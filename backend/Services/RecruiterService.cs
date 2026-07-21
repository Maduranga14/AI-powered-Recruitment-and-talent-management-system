using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs.Recruiter;
using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class RecruiterService(AppDbContext db, IEmailService emailService) : IRecruiterService
    {
        private readonly AppDbContext _db = db;
        private readonly IEmailService _emailService = emailService;

        private async Task<User> GetRecruiterOrThrowAsync(Guid recruiterId)
        {
            var recruiter = await _db.Users
                .Include(u => u.Organization)
                .FirstOrDefaultAsync(u => u.Id == recruiterId)
                ?? throw new KeyNotFoundException("Recruiter account not found.");

            if (recruiter.Role != UserRole.Recruiter && recruiter.Role != UserRole.Admin)
                throw new UnauthorizedAccessException("Only Recruiters or Admins can perform these actions.");

            return recruiter;
        }

        private static bool IsSameOrganization(User recruiter, User manager)
        {
            if (recruiter.Role == UserRole.Admin) return true;

            if (recruiter.OrganizationId.HasValue && manager.OrganizationId.HasValue)
            {
                if (recruiter.OrganizationId.Value == manager.OrganizationId.Value) return true;
            }

            var recruiterOrg = recruiter.OrganizationName ?? recruiter.Organization?.Name;
            var managerOrg = manager.OrganizationName ?? manager.Organization?.Name;

            if (!string.IsNullOrWhiteSpace(recruiterOrg) && !string.IsNullOrWhiteSpace(managerOrg))
            {
                if (string.Equals(recruiterOrg.Trim(), managerOrg.Trim(), StringComparison.OrdinalIgnoreCase))
                    return true;
            }

            if (recruiter.OrganizationId.HasValue && manager.Organization != null && manager.Organization.Id == recruiter.OrganizationId.Value)
                return true;

            return false;
        }

        public async Task<RecruiterHiringManagersResponseDto> GetHiringManagersAndInvitesAsync(Guid recruiterId)
        {
            var recruiter = await GetRecruiterOrThrowAsync(recruiterId);
            var orgName = recruiter.OrganizationName ?? recruiter.Organization?.Name ?? recruiter.FullName;

            var departments = await _db.Departments
                .Where(d => d.OrganizationName == orgName || (recruiter.OrganizationId.HasValue && d.OrganizationId == recruiter.OrganizationId.Value))
                .ToListAsync();

            var query = _db.Users
                .Include(u => u.Department)
                .Include(u => u.Organization)
                .Where(u => u.Role == UserRole.HiringManager);

            if (recruiter.OrganizationId.HasValue)
            {
                var targetOrgId = recruiter.OrganizationId.Value;
                query = query.Where(u => u.OrganizationId == targetOrgId || (u.Organization != null && u.Organization.Name == orgName));
            }
            else if (!string.IsNullOrWhiteSpace(orgName))
            {
                query = query.Where(u => u.Organization != null && u.Organization.Name == orgName);
            }

            var users = await query
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .ToListAsync();

            var managers = users.Select(u =>
            {
                var fullName = $"{u.FirstName} {u.LastName}".Trim();
                var dept = u.Department ?? departments.FirstOrDefault(d => !string.IsNullOrEmpty(d.Head) && string.Equals(d.Head, fullName, StringComparison.OrdinalIgnoreCase));
                return new HiringManagerDto
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    DepartmentId = dept?.Id,
                    DepartmentName = dept?.Name
                };
            }).ToList();

            var pendingInvites = await _db.HiringManagerInvitations
                .Where(i => i.OrganizationName == orgName && !i.IsUsed)
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new HiringManagerInvitationDto
                {
                    Id = i.Id,
                    Email = i.InvitedEmail,
                    SentAt = i.CreatedAt,
                    ExpiresAt = i.ExpiresAt
                })
                .ToListAsync();

            return new RecruiterHiringManagersResponseDto
            {
                HiringManagers = managers,
                PendingInvitations = pendingInvites
            };
        }

        public async Task<bool> ToggleHiringManagerStatusAsync(Guid managerId, Guid recruiterId)
        {
            var recruiter = await GetRecruiterOrThrowAsync(recruiterId);

            var manager = await _db.Users
                .Include(u => u.Organization)
                .FirstOrDefaultAsync(u => u.Id == managerId)
                ?? throw new KeyNotFoundException("Hiring Manager account not found.");

            if (manager.Role != UserRole.HiringManager)
                throw new InvalidOperationException("The specified user is not a Hiring Manager.");

            if (!IsSameOrganization(recruiter, manager))
                throw new UnauthorizedAccessException("You do not have permission to manage users in other organizations.");

            manager.IsActive = !manager.IsActive;
            manager.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return manager.IsActive;
        }

        public async Task<string> ResendInvitationAsync(Guid invitationId, Guid recruiterId, string frontendBaseUrl)
        {
            var recruiter = await GetRecruiterOrThrowAsync(recruiterId);
            var orgName = recruiter.OrganizationName ?? recruiter.Organization?.Name ?? recruiter.FullName;

            var invite = await _db.HiringManagerInvitations.FindAsync(invitationId)
                ?? throw new KeyNotFoundException("Invitation not found.");

            if (invite.OrganizationName != orgName)
                throw new UnauthorizedAccessException("You do not have permission to manage invitations for other organizations.");

            if (invite.IsUsed)
                throw new InvalidOperationException("This invitation has already been used and cannot be resent.");

            // Refresh token and expiry details
            invite.Token = Guid.NewGuid().ToString("N");
            invite.ExpiresAt = DateTime.UtcNow.AddDays(7);
            await _db.SaveChangesAsync();

            var joinLink = $"{frontendBaseUrl.TrimEnd('/')}/accept-invite?token={invite.Token}";

            var emailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #4f46e5;'>Invitation to Join {orgName}</h2>
                    <p>You have been re-invited by <strong>{recruiter.FullName}</strong> to join <strong>{orgName}</strong> as a Hiring Manager.</p>
                    <p>Click the link below to accept your invitation and set up your account:</p>
                    <div style='margin: 24px 0;'>
                        <a href='{joinLink}' style='background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>Accept Invitation</a>
                    </div>
                    <p style='color: #6b7280; font-size: 14px;'>This link will expire in 7 days.</p>
                </div>";

            await _emailService.SendEmailAsync(invite.InvitedEmail, $"Reminder: You've been invited to join {orgName} as a Hiring Manager", emailBody);

            return joinLink;
        }

        public async Task RevokeInvitationAsync(Guid invitationId, Guid recruiterId)
        {
            var recruiter = await GetRecruiterOrThrowAsync(recruiterId);
            var orgName = recruiter.OrganizationName ?? recruiter.Organization?.Name ?? recruiter.FullName;

            var invite = await _db.HiringManagerInvitations.FindAsync(invitationId)
                ?? throw new KeyNotFoundException("Invitation not found.");

            if (invite.OrganizationName != orgName)
                throw new UnauthorizedAccessException("You do not have permission to delete invitations for other organizations.");

            _db.HiringManagerInvitations.Remove(invite);
            await _db.SaveChangesAsync();
        }

        public async Task<List<BusySlotDto>> GetHiringManagerAvailabilityAsync(Guid managerId, Guid recruiterId)
        {
            var recruiter = await GetRecruiterOrThrowAsync(recruiterId);

            var manager = await _db.Users
                .Include(u => u.Organization)
                .FirstOrDefaultAsync(u => u.Id == managerId)
                ?? throw new KeyNotFoundException("Hiring Manager account not found.");

            if (manager.Role != UserRole.HiringManager)
                throw new InvalidOperationException("The specified user is not a Hiring Manager.");

            if (!IsSameOrganization(recruiter, manager))
                throw new UnauthorizedAccessException("You do not have permission to view users in other organizations.");

            var managerFullName = $"{manager.FirstName} {manager.LastName}".Trim();

            var allInterviews = await _db.Interviews
                .AsNoTracking()
                .Where(i => i.ScheduledAt >= DateTime.UtcNow.AddDays(-1))
                .ToListAsync();

            var busySlots = allInterviews
                .Where(i => i.InterviewerName.Trim().Equals(managerFullName, StringComparison.OrdinalIgnoreCase))
                .OrderBy(i => i.ScheduledAt)
                .Select(i => new BusySlotDto
                {
                    ScheduledAt = DateTime.SpecifyKind(i.ScheduledAt, DateTimeKind.Utc),
                    DurationMinutes = i.DurationMinutes
                })
                .ToList();

            return busySlots;
        }

        public async Task DeleteHiringManagerAsync(Guid managerId, Guid recruiterId)
        {
            var recruiter = await GetRecruiterOrThrowAsync(recruiterId);

            var manager = await _db.Users
                .Include(u => u.Organization)
                .FirstOrDefaultAsync(u => u.Id == managerId)
                ?? throw new KeyNotFoundException("Hiring Manager account not found.");

            if (manager.Role != UserRole.HiringManager)
                throw new InvalidOperationException("The specified user is not a Hiring Manager.");

            if (!IsSameOrganization(recruiter, manager))
                throw new UnauthorizedAccessException("You do not have permission to manage users in other organizations.");

            // Unset from any departments they head
            var managerFullName = $"{manager.FirstName} {manager.LastName}".Trim();
            var orgName = recruiter.OrganizationName ?? recruiter.Organization?.Name ?? recruiter.FullName;
            var departments = await _db.Departments
                .Where(d => d.Head == managerFullName && d.OrganizationName == orgName)
                .ToListAsync();

            foreach (var dept in departments)
            {
                dept.Head = string.Empty;
                dept.HeadInitials = string.Empty;
            }

            _db.Users.Remove(manager);
            await _db.SaveChangesAsync();
        }
    }
}
