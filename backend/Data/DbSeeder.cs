using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext db)
        {
            await SeedAdminAsync(db);
            await SeedDepartmentDashboardAsync(db);
            await SeedRolesAndPermissionsAsync(db);
        }

        private static async Task SeedAdminAsync(AppDbContext db)
        {
            var adminExists = await db.Users.AnyAsync(u => u.Role == UserRole.Admin);
            if (adminExists) return;

            var admin = new User
            {
                Id = new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
                FirstName = "System",
                LastName = "Administrator",
                Email = "admin@talentportal.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@12345"),
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };

            db.Users.Add(admin);
            await db.SaveChangesAsync();

            Console.WriteLine("Admin account seeded: admin@talentportal.com");
        }

        private static async Task SeedDepartmentDashboardAsync(AppDbContext db)
        {
            
            if (!await db.Organizations.AnyAsync())
            {
                db.Organizations.Add(new Organization
                {
                    Name = "TalentAI Global Holding",
                    Sub = "Principal Entity • NYC HQ"
                });
                await db.SaveChangesAsync();
                Console.WriteLine("Organization seeded.");
            }

            
            if (!await db.Departments.AnyAsync())
            {
                db.Departments.AddRange(
                    new Department
                    {
                        Name = "Engineering",
                        Badge = "HIGH VOLUME",
                        BadgeColor = "#f59e0b",
                        Head = "Sarah Jenkins",
                        HeadInitials = "SJ",
                        HeadColor = "#2563EB"
                    },
                    new Department
                    {
                        Name = "Sales & Marketing",
                        Badge = "GROWTH",
                        BadgeColor = "#0d9488",
                        Head = "Marcus Vane",
                        HeadInitials = "MV",
                        HeadColor = "#7c3aed"
                    },
                    new Department
                    {
                        Name = "Product Management",
                        Badge = "STRATEGIC",
                        BadgeColor = "#64748b",
                        Head = "Elena Rodriguez",
                        HeadInitials = "ER",
                        HeadColor = "#ea580c"
                    }
                );
                await db.SaveChangesAsync();
                Console.WriteLine("Departments seeded.");
            }

            
            if (!await db.GlobalPolicies.AnyAsync())
            {
                db.GlobalPolicies.AddRange(
                    new GlobalPolicy
                    {
                        Id = "resume-filtering",
                        Label = "Resume Filtering",
                        Desc = "Automatically score and rank candidates based on semantic job description mapping.",
                        Enabled = true
                    },
                    new GlobalPolicy
                    {
                        Id = "standard-interview",
                        Label = "Standard Interview",
                        Desc = "Enforce a 4-stage interview process across all entry-level and mid-tier roles.",
                        Enabled = false
                    },
                    new GlobalPolicy
                    {
                        Id = "diversity-bias-shield",
                        Label = "Diversity Bias Shield",
                        Desc = "Mask name, gender, and ethnicity details in early screening stages to ensure fair review.",
                        Enabled = true
                    }
                );
                await db.SaveChangesAsync();
                Console.WriteLine("Global policies seeded.");
            }
        }

        private static async Task SeedRolesAndPermissionsAsync(AppDbContext db)
        {
            if (await db.Roles.AnyAsync()) return;

            var roles = new List<Role>
            {
                new Role
                {
                    Id = "global-admin",
                    Name = "Admin",
                    Description = "Unrestricted access to all modules and system settings.",
                    Icon = "admin",
                    Tags = "Manage Users,Billing,AI Config,+12 more",
                    IsDefault = true,
                    Permissions = new List<RolePermission>
                    {
                        new RolePermission { PermissionId = "candidate-scoring", Type = "AIInsight", Label = "Candidate Scoring", Description = "Allow AI to generate match scores based on job descriptions.", Enabled = true },
                        new RolePermission { PermissionId = "predictive-retention", Type = "AIInsight", Label = "Predictive Retention Analytics", Description = "Access AI-driven forecasting for long-term candidate retention.", Enabled = true },
                        new RolePermission { PermissionId = "user-lifecycle", Type = "SystemManagement", Label = "User Lifecycle Management", Description = "Create, suspend, and delete user accounts.", Enabled = true },
                        new RolePermission { PermissionId = "billing", Type = "SystemManagement", Label = "Billing & Subscription", Description = "Manage payment methods and upgrade plans.", Enabled = true },
                        new RolePermission { PermissionId = "audit-log", Type = "SystemManagement", Label = "Audit Log Access", Description = "View historical logs of all system activities.", Enabled = true },
                        new RolePermission { PermissionId = "job-postings", Type = "RecruitmentOps", Label = "Job Postings", View = true, Edit = true, Delete = true },
                        new RolePermission { PermissionId = "candidate-profiles", Type = "RecruitmentOps", Label = "Candidate Profiles", View = true, Edit = true, Delete = true },
                        new RolePermission { PermissionId = "interview-schedules", Type = "RecruitmentOps", Label = "Interview Schedules", View = true, Edit = true, Delete = true }
                    }
                },
                new Role
                {
                    Id = "recruiter",
                    Name = "Recruiter",
                    Description = "Execute searches, manage candidates, and schedule interviews.",
                    Icon = "recruiter",
                    Tags = "Candidate Sourcing,Interviews",
                    IsDefault = false,
                    Permissions = new List<RolePermission>
                    {
                        new RolePermission { PermissionId = "candidate-scoring", Type = "AIInsight", Label = "Candidate Scoring", Description = "Allow AI to generate match scores based on job descriptions.", Enabled = true },
                        new RolePermission { PermissionId = "predictive-retention", Type = "AIInsight", Label = "Predictive Retention Analytics", Description = "Access AI-driven forecasting for long-term candidate retention.", Enabled = false },
                        new RolePermission { PermissionId = "user-lifecycle", Type = "SystemManagement", Label = "User Lifecycle Management", Description = "Create, suspend, and delete user accounts.", Enabled = false },
                        new RolePermission { PermissionId = "billing", Type = "SystemManagement", Label = "Billing & Subscription", Description = "Manage payment methods and upgrade plans.", Enabled = false },
                        new RolePermission { PermissionId = "audit-log", Type = "SystemManagement", Label = "Audit Log Access", Description = "View historical logs of all system activities.", Enabled = false },
                        new RolePermission { PermissionId = "job-postings", Type = "RecruitmentOps", Label = "Job Postings", View = true, Edit = true, Delete = true },
                        new RolePermission { PermissionId = "candidate-profiles", Type = "RecruitmentOps", Label = "Candidate Profiles", View = true, Edit = true, Delete = true },
                        new RolePermission { PermissionId = "interview-schedules", Type = "RecruitmentOps", Label = "Interview Schedules", View = true, Edit = true, Delete = false }
                    }
                },
                new Role
                {
                    Id = "HiringManager",
                    Name = "Hiring Manager",
                    Description = "Access candidate profiles and submit structured feedback.",
                    Icon = "interviewer",
                    Tags = "Feedback,Candidate Profiles",
                    IsDefault = false,
                    Permissions = new List<RolePermission>
                    {
                        new RolePermission { PermissionId = "candidate-scoring", Type = "AIInsight", Label = "Candidate Scoring", Description = "Allow AI to generate match scores based on job descriptions.", Enabled = false },
                        new RolePermission { PermissionId = "predictive-retention", Type = "AIInsight", Label = "Predictive Retention Analytics", Description = "Access AI-driven forecasting for long-term candidate retention.", Enabled = false },
                        new RolePermission { PermissionId = "user-lifecycle", Type = "SystemManagement", Label = "User Lifecycle Management", Description = "Create, suspend, and delete user accounts.", Enabled = false },
                        new RolePermission { PermissionId = "billing", Type = "SystemManagement", Label = "Billing & Subscription", Description = "Manage payment methods and upgrade plans.", Enabled = false },
                        new RolePermission { PermissionId = "audit-log", Type = "SystemManagement", Label = "Audit Log Access", Description = "View historical logs of all system activities.", Enabled = false },
                        new RolePermission { PermissionId = "job-postings", Type = "RecruitmentOps", Label = "Job Postings", View = true, Edit = false, Delete = false },
                        new RolePermission { PermissionId = "candidate-profiles", Type = "RecruitmentOps", Label = "Candidate Profiles", View = true, Edit = false, Delete = false },
                        new RolePermission { PermissionId = "interview-schedules", Type = "RecruitmentOps", Label = "Interview Schedules", View = true, Edit = false, Delete = false }
                    }
                },
            };

            db.Roles.AddRange(roles);
            await db.SaveChangesAsync();
            Console.WriteLine("Roles and default permissions seeded.");
        }
    }
}
