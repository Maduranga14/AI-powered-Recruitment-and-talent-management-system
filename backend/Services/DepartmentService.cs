using backend.Data;
using backend.DTOs.Admin;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class DepartmentService(AppDbContext dbContext) : IDepartmentService
    {
        private readonly AppDbContext _db = dbContext;

        public async Task<DepartmentDashboardDto> GetDepartmentDashboardAsync(Guid userId, string? filterOrganizationName = null)
        {
            var user = await _db.Users.FindAsync(userId);
            var userOrgName = user?.OrganizationName;

            // Enforce tenant isolation for non-admins
            var activeOrgName = (user?.Role == Models.Enums.UserRole.Admin)
                ? (filterOrganizationName ?? userOrgName)
                : userOrgName;

            var orgDto = new OrganizationDto
            {
                Id = Guid.Empty,
                Name = !string.IsNullOrEmpty(activeOrgName) ? activeOrgName : "TalentPortal Holding",
                Sub = !string.IsNullOrEmpty(activeOrgName) ? "Internal Entity" : "Principal Entity"
            };

            var query = _db.Departments.AsQueryable();
            // Filter by organization. Only global Admin (without organization) viewing no specific organization can see all.
            if (user?.Role != Models.Enums.UserRole.Admin || !string.IsNullOrEmpty(activeOrgName))
            {
                query = query.Where(d => d.OrganizationName == activeOrgName);
            }

            var depts = await query
                .Select(d => new DepartmentDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Description = d.Description,
                    Badge = d.Badge,
                    BadgeColor = d.BadgeColor,
                    Head = d.Head ?? "Unassigned",
                    ContactEmail = d.ContactEmail,
                    HeadInitials = d.HeadInitials,
                    HeadColor = d.HeadColor,
                    OrganizationName = d.OrganizationName
                })
                .ToListAsync();

            var policies = await _db.GlobalPolicies
                .Select(p => new GlobalPolicyDto
                {
                    Id = p.Id,
                    Label = p.Label,
                    Desc = p.Desc,
                    Enabled = p.Enabled
                })
                .ToListAsync();

            return new DepartmentDashboardDto
            {
                CorporateStructure = orgDto,
                Departments = depts,
                GlobalPolicies = policies
            };
        }

        public async Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto dto, Guid userId)
        {
            var user = await _db.Users.FindAsync(userId);

            // Determine organization name from DTO or user
            var userOrgName = !string.IsNullOrWhiteSpace(dto.OrganizationName)
                ? dto.OrganizationName.Trim()
                : user?.OrganizationName;

            // Lookup organization if organization name is provided
            var org = !string.IsNullOrWhiteSpace(userOrgName)
                ? await _db.Organizations.FirstOrDefaultAsync(o => o.Name.ToLower() == userOrgName.ToLower())
                : null;

            if (org != null)
            {
                userOrgName = org.Name;
            }

            var headName = string.IsNullOrWhiteSpace(dto.Head) ? "Unassigned" : dto.Head.Trim();
            var initials = dto.HeadInitials;
            if (string.IsNullOrWhiteSpace(initials) && !string.IsNullOrWhiteSpace(headName))
            {
                var parts = headName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length > 1)
                {
                    initials = $"{parts[0][0]}{parts[^1][0]}".ToUpper();
                }
                else if (parts.Length == 1)
                {
                    initials = parts[0][0].ToString().ToUpper();
                }
            }

            var colors = new[] { "#2563EB", "#7c3aed", "#ea580c", "#0d9488", "#0284c7", "#ec4899", "#8b5cf6" };
            var headColor = dto.HeadColor;
            if (string.IsNullOrWhiteSpace(headColor) || headColor == "#2563EB")
            {
                var random = new Random();
                headColor = colors[random.Next(colors.Length)];
            }

            var badgeColors = new[] { "#f59e0b", "#0d9488", "#64748b", "#3b82f6", "#ef4444" };
            var badgeColor = dto.BadgeColor;
            if (string.IsNullOrWhiteSpace(badgeColor) || badgeColor == "#64748b")
            {
                var random = new Random();
                badgeColor = badgeColors[random.Next(badgeColors.Length)];
            }

            var dept = new Department
            {
                Name = dto.Name.Trim(),
                Description = dto.Description?.Trim(),
                Badge = dto.Badge,
                BadgeColor = badgeColor,
                Head = headName,
                ContactEmail = dto.ContactEmail?.Trim(),
                HeadInitials = initials,
                HeadColor = headColor,
                OrganizationName = userOrgName,
                OrganizationId = org?.Id
            };

            _db.Departments.Add(dept);
            await _db.SaveChangesAsync();

            return new DepartmentDto
            {
                Id = dept.Id,
                Name = dept.Name,
                Description = dept.Description,
                Badge = dept.Badge,
                BadgeColor = dept.BadgeColor,
                Head = dept.Head,
                ContactEmail = dept.ContactEmail,
                HeadInitials = dept.HeadInitials,
                HeadColor = dept.HeadColor,
                OrganizationName = dept.OrganizationName
            };
        }

        public async Task<GlobalPolicyDto> TogglePolicyAsync(string id)
        {
            var policy = await _db.GlobalPolicies.FindAsync(id);
            if (policy == null)
            {
                throw new KeyNotFoundException($"Policy with ID '{id}' was not found.");
            }

            policy.Enabled = !policy.Enabled;
            await _db.SaveChangesAsync();

            return new GlobalPolicyDto
            {
                Id = policy.Id,
                Label = policy.Label,
                Desc = policy.Desc,
                Enabled = policy.Enabled
            };
        }

        public async Task<bool> DeleteDepartmentAsync(Guid id)
        {
            var dept = await _db.Departments.FindAsync(id);
            if (dept == null)
            {
                return false;
            }

            _db.Departments.Remove(dept);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
