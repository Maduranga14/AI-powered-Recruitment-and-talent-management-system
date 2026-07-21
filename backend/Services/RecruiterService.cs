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
            var recruiter = await _db.Users.FindAsync(recruiterId)
                ?? throw new KeyNotFoundException("Recruiter account not found.");

            if (recruiter.Role != UserRole.Recruiter && recruiter.Role != UserRole.Admin)
                throw new UnauthorizedAccessException("Only Recruiters or Admins can perform these actions.");

            return recruiter;
        }

        public async Task<RecruiterHiringManagersResponseDto> GetHiringManagersAndInvitesAsync(Guid recruiterId)
        {
            var recruiter = await GetRecruiterOrThrowAsync(recruiterId);
            var orgName = recruiter.OrganizationName ?? recruiter.FullName;

            var departments = await _db.Departments
                .Where(d => d.OrganizationName == orgName)
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
            var orgName = recruiter.OrganizationName ?? recruiter.FullName;

            var manager = await _db.Users.FindAsync(managerId)
                ?? throw new KeyNotFoundException("Hiring Manager account not found.");

            if (manager.Role != UserRole.HiringManager)
                throw new InvalidOperationException("The specified user is not a Hiring Manager.");

            if (manager.OrganizationName != orgName)
                throw new UnauthorizedAccessException("You do not have permission to manage users in other organizations.");

            manager.IsActive = !manager.IsActive;
            manager.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return manager.IsActive;
        }

        public async Task<string> ResendInvitationAsync(Guid invitationId, Guid recruiterId, string frontendBaseUrl)
        {
            var recruiter = await GetRecruiterOrThrowAsync(recruiterId);
            var orgName = recruiter.OrganizationName ?? recruiter.FullName;

            var invite = await _db.HiringManagerInvitations.FindAsync(invitationId)
                ?? throw new KeyNotFoundException("Invitation not found.");

            if (invite.OrganizationName != orgName)
                throw new UnauthorizedAccessException("You do not have permission to manage invitations for other organizations.");

            if (invite.IsUsed)
                throw new InvalidOperationException("This invitation has already been used and cannot be resent.");

            // Refresh token and expiry details
            var newToken = Guid.NewGuid().ToString("N");
            var expiry = DateTime.UtcNow.AddHours(72);

            invite.Token = newToken;
            invite.ExpiresAt = expiry;
            invite.CreatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var inviteLink = $"{frontendBaseUrl}/register-hm?token={newToken}";

            // Send HTML email with invitation details
            var emailSubject = $"[Reminder] Invitation to join {orgName} on TalentPortal AI";
            var emailBody = $@"
                <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'>
                    <h2 style='color: #4f46e5; margin-bottom: 16px;'>Reminder: Welcome to TalentPortal AI!</h2>
                    <p style='color: #475569; font-size: 16px; line-height: 1.6;'>You have a pending invitation from <strong>{recruiter.FullName}</strong> to join the organization <strong>{orgName}</strong> as a Hiring Manager.</p>
                    <p style='color: #475569; font-size: 16px; line-height: 1.6;'>To accept this invitation and complete your registration, click the button below:</p>
                    <p style='margin: 24px 0; text-align: center;'>
                        <a href='{inviteLink}' style='background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;'>Accept & Complete Registration</a>
                    </p>
                    <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;' />
                    <p style='color: #64748b; font-size: 12px; line-height: 1.5;'>If the button doesn't work, copy and paste this URL into your browser:</p>
                    <p style='color: #4f46e5; font-size: 12px; font-family: monospace; word-break: break-all; margin-top: 4px;'>{inviteLink}</p>
                    <p style='color: #94a3b8; font-size: 12px; margin-top: 16px;'>This invitation will expire in 72 hours.</p>
                </div>";

            await _emailService.SendEmailAsync(invite.InvitedEmail, emailSubject, emailBody);

            return $"Invitation resent to {invite.InvitedEmail}. The link expires in 72 hours.";
        }

        public async Task RevokeInvitationAsync(Guid invitationId, Guid recruiterId)
        {
            var recruiter = await GetRecruiterOrThrowAsync(recruiterId);
            var orgName = recruiter.OrganizationName ?? recruiter.FullName;

            var invite = await _db.HiringManagerInvitations.FindAsync(invitationId)
                ?? throw new KeyNotFoundException("Invitation not found.");

            if (invite.OrganizationName != orgName)
                throw new UnauthorizedAccessException("You do not have permission to manage invitations for other organizations.");

            _db.HiringManagerInvitations.Remove(invite);
            await _db.SaveChangesAsync();
        }

        public async Task<List<BusySlotDto>> GetHiringManagerAvailabilityAsync(Guid managerId, Guid recruiterId)
        {
            var recruiter = await GetRecruiterOrThrowAsync(recruiterId);
            var orgName = recruiter.OrganizationName ?? recruiter.FullName;

            var manager = await _db.Users.FindAsync(managerId)
                ?? throw new KeyNotFoundException("Hiring Manager account not found.");

            if (manager.Role != UserRole.HiringManager)
                throw new InvalidOperationException("The specified user is not a Hiring Manager.");

            if (manager.OrganizationName != orgName)
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
            var orgName = recruiter.OrganizationName ?? recruiter.FullName;

            var manager = await _db.Users.FindAsync(managerId)
                ?? throw new KeyNotFoundException("Hiring Manager account not found.");

            if (manager.Role != UserRole.HiringManager)
                throw new InvalidOperationException("The specified user is not a Hiring Manager.");

            if (manager.OrganizationName != orgName)
                throw new UnauthorizedAccessException("You do not have permission to delete users in other organizations.");

            // Unset from any departments they head
            var managerFullName = $"{manager.FirstName} {manager.LastName}".Trim();
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
