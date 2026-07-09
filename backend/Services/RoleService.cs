using backend.Data;
using backend.DTOs.Admin;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class RoleService(AppDbContext dbContext) : IRoleService
    {
        private readonly AppDbContext _db = dbContext;

        public async Task<List<RoleDto>> GetAllRolesAsync()
        {
            var roles = await _db.Roles.ToListAsync();
            return roles.Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                Icon = r.Icon,
                Tags = string.IsNullOrWhiteSpace(r.Tags)
                    ? []
                    : r.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(t => t.Trim()).ToList(),
                IsDefault = r.IsDefault
            }).ToList();
        }

        public async Task<RoleDetailsDto?> GetRoleDetailsAsync(string id)
        {
            var role = await _db.Roles
                .Include(r => r.Permissions)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null) return null;

            var roleDto = new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                Icon = role.Icon,
                Tags = string.IsNullOrWhiteSpace(role.Tags)
                    ? []
                    : role.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(t => t.Trim()).ToList(),
                IsDefault = role.IsDefault
            };

            var permissionsGroup = new RolePermissionsGroupDto();

            foreach (var p in role.Permissions)
            {
                var dto = new RolePermissionDto
                {
                    Id = p.PermissionId,
                    Label = p.Label,
                    Desc = p.Description,
                    Enabled = p.Enabled,
                    View = p.View,
                    Edit = p.Edit,
                    Delete = p.Delete
                };

                if (p.Type == "AIInsight")
                {
                    permissionsGroup.AiInsights.Add(dto);
                }
                else if (p.Type == "SystemManagement")
                {
                    permissionsGroup.SystemManagement.Add(dto);
                }
                else if (p.Type == "RecruitmentOps")
                {
                    permissionsGroup.RecruitmentOps.Add(dto);
                }
            }

            return new RoleDetailsDto
            {
                Role = roleDto,
                Permissions = permissionsGroup
            };
        }

        public async Task<RoleDto> CreateRoleAsync(CreateRoleDto dto)
        {
            var rawId = dto.Name.ToLower().Replace(" ", "-");
            var cleanId = System.Text.RegularExpressions.Regex.Replace(rawId, @"[^a-zA-Z0-9\-]", "");

            var id = cleanId;
            var counter = 1;
            while (await _db.Roles.AnyAsync(r => r.Id == id))
            {
                id = $"{cleanId}-{counter++}";
            }

            var tags = string.IsNullOrWhiteSpace(dto.Tags)
                ? "Custom Role"
                : dto.Tags;

            var role = new Role
            {
                Id = id,
                Name = dto.Name,
                Description = dto.Description,
                Icon = dto.Icon,
                Tags = tags,
                IsDefault = false
            };

            // Set up template permissions (default all to disabled/false)
            role.Permissions = new List<RolePermission>
            {
                new RolePermission { PermissionId = "candidate-scoring", Type = "AIInsight", Label = "Candidate Scoring", Description = "Allow AI to generate match scores based on job descriptions.", Enabled = false },
                new RolePermission { PermissionId = "predictive-retention", Type = "AIInsight", Label = "Predictive Retention Analytics", Description = "Access AI-driven forecasting for long-term candidate retention.", Enabled = false },
                new RolePermission { PermissionId = "user-lifecycle", Type = "SystemManagement", Label = "User Lifecycle Management", Description = "Create, suspend, and delete user accounts.", Enabled = false },
                new RolePermission { PermissionId = "billing", Type = "SystemManagement", Label = "Billing & Subscription", Description = "Manage payment methods and upgrade plans.", Enabled = false },
                new RolePermission { PermissionId = "audit-log", Type = "SystemManagement", Label = "Audit Log Access", Description = "View historical logs of all system activities.", Enabled = false },
                new RolePermission { PermissionId = "job-postings", Type = "RecruitmentOps", Label = "Job Postings", View = false, Edit = false, Delete = false },
                new RolePermission { PermissionId = "candidate-profiles", Type = "RecruitmentOps", Label = "Candidate Profiles", View = false, Edit = false, Delete = false },
                new RolePermission { PermissionId = "interview-schedules", Type = "RecruitmentOps", Label = "Interview Schedules", View = false, Edit = false, Delete = false }
            };

            _db.Roles.Add(role);
            await _db.SaveChangesAsync();

            return new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                Icon = role.Icon,
                Tags = role.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(t => t.Trim()).ToList(),
                IsDefault = role.IsDefault
            };
        }

        public async Task<bool> UpdateRolePermissionsAsync(string id, UpdateRolePermissionsDto dto)
        {
            var role = await _db.Roles
                .Include(r => r.Permissions)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null) return false;

            foreach (var updateItem in dto.Permissions)
            {
                var permission = role.Permissions.FirstOrDefault(p => p.PermissionId == updateItem.PermissionId);
                if (permission != null)
                {
                    permission.Enabled = updateItem.Enabled;
                    permission.View = updateItem.View;
                    permission.Edit = updateItem.Edit;
                    permission.Delete = updateItem.Delete;
                }
            }

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteRoleAsync(string id)
        {
            var role = await _db.Roles.FindAsync(id);
            if (role == null) return false;

            if (role.IsDefault || role.Id == "global-admin")
            {
                throw new InvalidOperationException("System default roles cannot be deleted.");
            }

            _db.Roles.Remove(role);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
