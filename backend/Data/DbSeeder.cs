using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext db)
        {
            // Dynamically alter schema to add OrganizationName column if it does not exist
            await db.Database.ExecuteSqlRawAsync("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Departments]') AND name = 'OrganizationName') BEGIN ALTER TABLE [dbo].[Departments] ADD [OrganizationName] NVARCHAR(MAX) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[JobApplications]') AND name = 'Feedback') BEGIN ALTER TABLE [dbo].[JobApplications] ADD [Feedback] NVARCHAR(2000) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[JobApplications]') AND name = 'Recommendation') BEGIN ALTER TABLE [dbo].[JobApplications] ADD [Recommendation] NVARCHAR(50) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[HiringManagerInvitations]') AND name = 'DepartmentId') BEGIN ALTER TABLE [dbo].[HiringManagerInvitations] ADD [DepartmentId] UNIQUEIDENTIFIER NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[JobApplications]') AND name = 'OverallRating') BEGIN ALTER TABLE [dbo].[JobApplications] ADD [OverallRating] INT NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[JobApplications]') AND name = 'SkillRatings') BEGIN ALTER TABLE [dbo].[JobApplications] ADD [SkillRatings] NVARCHAR(MAX) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Interviews]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Interviews]') AND name = 'RescheduleRequested') BEGIN ALTER TABLE [dbo].[Interviews] ADD [RescheduleRequested] BIT NOT NULL CONSTRAINT DF_Interviews_RescheduleRequested DEFAULT(0); END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Interviews]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Interviews]') AND name = 'RescheduleReason') BEGIN ALTER TABLE [dbo].[Interviews] ADD [RescheduleReason] NVARCHAR(1000) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Interviews]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Interviews]') AND name = 'RescheduleRequestedAt') BEGIN ALTER TABLE [dbo].[Interviews] ADD [RescheduleRequestedAt] DATETIME2 NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Interviews]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Interviews]') AND name = 'LastRescheduledAt') BEGIN ALTER TABLE [dbo].[Interviews] ADD [LastRescheduledAt] DATETIME2 NULL; END");

            await SeedAdminAsync(db);
            await SeedDepartmentDashboardAsync(db);
            await SeedRolesAndPermissionsAsync(db);
            // Default demo accounts (Recruiter, Manager, Candidate) are not seeded anymore
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
                Status = UserStatus.Active,
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
            
            // Default organization (TalentAI Global Holding) is not seeded anymore

            var defaultDepts = await db.Departments.Where(d =>
                d.Name == "Engineering" ||
                d.Name == "Sales & Marketing" ||
                d.Name == "Product Management"
            ).ToListAsync();

            if (defaultDepts.Any())
            {
                db.Departments.RemoveRange(defaultDepts);
                await db.SaveChangesAsync();
                Console.WriteLine("Default departments removed.");
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

        private static async Task SeedDemoAccountsAsync(AppDbContext db)
        {
            // Seed Recruiter
            if (!await db.Users.AnyAsync(u => u.Email == "recruiter@talentportal.com"))
            {
                var recruiter = new User
                {
                    FirstName = "Olivia",
                    LastName = "Park",
                    Email = "recruiter@talentportal.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Recruiter@12345"),
                    Role = UserRole.Recruiter,
                    Status = UserStatus.Active,
                    OrganizationName = "Northwind Labs",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                db.Users.Add(recruiter);
                Console.WriteLine("Recruiter account seeded: recruiter@talentportal.com");
            }

            // Seed Hiring Manager
            if (!await db.Users.AnyAsync(u => u.Email == "manager@talentportal.com"))
            {
                var manager = new User
                {
                    FirstName = "Samantha",
                    LastName = "Reed",
                    Email = "manager@talentportal.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager@12345"),
                    Role = UserRole.HiringManager,
                    Status = UserStatus.Active,
                    OrganizationName = "Northwind Labs",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                db.Users.Add(manager);
                Console.WriteLine("Hiring Manager account seeded: manager@talentportal.com");
            }

            // Seed Demo Candidate
            if (!await db.Users.AnyAsync(u => u.Email == "alex.morgan@example.com"))
            {
                var candidate = new User
                {
                    FirstName = "Alex",
                    LastName = "Morgan",
                    Email = "alex.morgan@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("demo1234"),
                    Role = UserRole.Candidate,
                    Status = UserStatus.Active,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                db.Users.Add(candidate);

                var profile = new CandidateProfile
                {
                    UserId = candidate.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                db.CandidateProfiles.Add(profile);
                Console.WriteLine("Demo Candidate account seeded: alex.morgan@example.com");
            }

            await db.SaveChangesAsync();
        }
    }
}
