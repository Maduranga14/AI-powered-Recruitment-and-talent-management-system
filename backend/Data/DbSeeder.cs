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
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Interviews]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Interviews]') AND name = 'FeedbackComments') BEGIN ALTER TABLE [dbo].[Interviews] ADD [FeedbackComments] NVARCHAR(4000) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Interviews]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Interviews]') AND name = 'FeedbackOverallRating') BEGIN ALTER TABLE [dbo].[Interviews] ADD [FeedbackOverallRating] INT NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Interviews]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Interviews]') AND name = 'FeedbackRecommendation') BEGIN ALTER TABLE [dbo].[Interviews] ADD [FeedbackRecommendation] NVARCHAR(20) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Interviews]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Interviews]') AND name = 'FeedbackSkillRatings') BEGIN ALTER TABLE [dbo].[Interviews] ADD [FeedbackSkillRatings] NVARCHAR(MAX) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Interviews]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Interviews]') AND name = 'FeedbackSubmittedAt') BEGIN ALTER TABLE [dbo].[Interviews] ADD [FeedbackSubmittedAt] DATETIME2 NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Interviews]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Interviews]') AND name = 'FeedbackTechnicalScore') BEGIN ALTER TABLE [dbo].[Interviews] ADD [FeedbackTechnicalScore] INT NULL; END");

            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Organizations]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Organizations]') AND name = 'TaxNumber') BEGIN ALTER TABLE [dbo].[Organizations] ADD [TaxNumber] NVARCHAR(100) NOT NULL CONSTRAINT DF_Organizations_TaxNumber DEFAULT('TAX-0000-0000'); END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Organizations]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Organizations]') AND name = 'Website') BEGIN ALTER TABLE [dbo].[Organizations] ADD [Website] NVARCHAR(500) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Organizations]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Organizations]') AND name = 'ShortDescription') BEGIN ALTER TABLE [dbo].[Organizations] ADD [ShortDescription] NVARCHAR(1000) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Organizations]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Organizations]') AND name = 'LogoUrl') BEGIN ALTER TABLE [dbo].[Organizations] ADD [LogoUrl] NVARCHAR(500) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Organizations]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Organizations]') AND name = 'Plan') BEGIN ALTER TABLE [dbo].[Organizations] ADD [Plan] NVARCHAR(50) NOT NULL CONSTRAINT DF_Organizations_Plan DEFAULT('Starter'); END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Organizations]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Organizations]') AND name = 'Status') BEGIN ALTER TABLE [dbo].[Organizations] ADD [Status] NVARCHAR(50) NOT NULL CONSTRAINT DF_Organizations_Status DEFAULT('Healthy'); END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Organizations]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Organizations]') AND name = 'Owner') BEGIN ALTER TABLE [dbo].[Organizations] ADD [Owner] NVARCHAR(200) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Organizations]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Organizations]') AND name = 'MonthlyUsage') BEGIN ALTER TABLE [dbo].[Organizations] ADD [MonthlyUsage] NVARCHAR(100) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Organizations]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Organizations]') AND name = 'CreatedAt') BEGIN ALTER TABLE [dbo].[Organizations] ADD [CreatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Organizations_CreatedAt DEFAULT(GETUTCDATE()); END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[Organizations]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Organizations]') AND name = 'UpdatedAt') BEGIN ALTER TABLE [dbo].[Organizations] ADD [UpdatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Organizations_UpdatedAt DEFAULT(GETUTCDATE()); END");

            await db.Database.ExecuteSqlRawAsync("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Departments]') AND name = 'Description') BEGIN ALTER TABLE [dbo].[Departments] ADD [Description] NVARCHAR(500) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Departments]') AND name = 'ContactEmail') BEGIN ALTER TABLE [dbo].[Departments] ADD [ContactEmail] NVARCHAR(200) NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Departments]') AND name = 'OrganizationId') BEGIN ALTER TABLE [dbo].[Departments] ADD [OrganizationId] UNIQUEIDENTIFIER NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'OrganizationId') BEGIN ALTER TABLE [dbo].[Users] ADD [OrganizationId] UNIQUEIDENTIFIER NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'DepartmentId') BEGIN ALTER TABLE [dbo].[Users] ADD [DepartmentId] UNIQUEIDENTIFIER NULL; END");
            await db.Database.ExecuteSqlRawAsync("IF OBJECT_ID(N'[dbo].[JobPostings]', N'U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[JobPostings]') AND name = 'Requirements') BEGIN ALTER TABLE [dbo].[JobPostings] ADD [Requirements] NVARCHAR(MAX) NULL; END");

            await SeedAdminAsync(db);
            await SeedDepartmentDashboardAsync(db);
            await SeedRolesAndPermissionsAsync(db);
            await EnsureAuditTablesAsync(db);
            await SeedSystemSettingsAsync(db);
            await SeedAuditLogsAsync(db);
        }

        private static async Task EnsureAuditTablesAsync(AppDbContext db)
        {
            await db.Database.ExecuteSqlRawAsync(@"
                IF OBJECT_ID(N'[dbo].[AuditLogs]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[AuditLogs] (
                        [Id]        INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                        [UserId]    UNIQUEIDENTIFIER NULL,
                        [UserName]  NVARCHAR(200) NOT NULL DEFAULT(''),
                        [Action]    NVARCHAR(100) NOT NULL,
                        [Module]    NVARCHAR(50)  NOT NULL,
                        [IpAddress] NVARCHAR(45)  NOT NULL DEFAULT(''),
                        [Timestamp] DATETIME2     NOT NULL DEFAULT(GETUTCDATE()),
                        [Details]   NVARCHAR(4000) NULL
                    );
                    CREATE INDEX IX_AuditLogs_Timestamp ON [dbo].[AuditLogs]([Timestamp] DESC);
                    CREATE INDEX IX_AuditLogs_Module    ON [dbo].[AuditLogs]([Module]);
                    CREATE INDEX IX_AuditLogs_Action    ON [dbo].[AuditLogs]([Action]);
                END");

            await db.Database.ExecuteSqlRawAsync(@"
                IF OBJECT_ID(N'[dbo].[SystemSettings]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[SystemSettings] (
                        [Id]          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                        [Key]         NVARCHAR(100) NOT NULL,
                        [Value]       NVARCHAR(500) NOT NULL,
                        [Description] NVARCHAR(500) NULL,
                        [UpdatedAt]   DATETIME2     NOT NULL DEFAULT(GETUTCDATE()),
                        [UpdatedBy]   NVARCHAR(200) NOT NULL DEFAULT('')
                    );
                    CREATE UNIQUE INDEX UX_SystemSettings_Key ON [dbo].[SystemSettings]([Key]);
                END");
        }

        private static async Task SeedSystemSettingsAsync(AppDbContext db)
        {
            if (await db.SystemSettings.AnyAsync()) return;

            var now = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            db.SystemSettings.AddRange(
                new SystemSetting { Key = "MaintenanceMode",               Value = "false", Description = "Put the platform in read-only maintenance mode. All write operations are blocked when enabled.", UpdatedAt = now, UpdatedBy = "System" },
                new SystemSetting { Key = "MaxUploadFileSizeMB",           Value = "10",    Description = "Maximum file size (in MB) allowed for resume and document uploads.", UpdatedAt = now, UpdatedBy = "System" },
                new SystemSetting { Key = "AiMatchScoreThreshold",         Value = "65",    Description = "Minimum AI match score (0–100) required for a candidate to appear in shortlist suggestions.", UpdatedAt = now, UpdatedBy = "System" },
                new SystemSetting { Key = "CandidateProfileRetentionDays", Value = "365",   Description = "Number of days inactive candidate profiles are retained before automatic archival.", UpdatedAt = now, UpdatedBy = "System" },
                new SystemSetting { Key = "MaxJobPostingsPerRecruiter",    Value = "50",    Description = "Maximum number of active job postings a single recruiter account can maintain simultaneously.", UpdatedAt = now, UpdatedBy = "System" },
                new SystemSetting { Key = "EmailNotificationsEnabled",     Value = "true",  Description = "Global toggle for all outbound platform emails (invitations, status updates, hire decisions).", UpdatedAt = now, UpdatedBy = "System" },
                new SystemSetting { Key = "AiChatEnabled",                 Value = "true",  Description = "Enable or disable the AI Assistant chat feature across all user portals.", UpdatedAt = now, UpdatedBy = "System" },
                new SystemSetting { Key = "DefaultJobDeadlineDays",        Value = "30",    Description = "Default number of days until a published job posting expires if no deadline is set.", UpdatedAt = now, UpdatedBy = "System" }
            );
            await db.SaveChangesAsync();
            Console.WriteLine("System settings seeded.");
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

        private static async Task SeedAuditLogsAsync(AppDbContext db)
        {
            if (await db.AuditLogs.AnyAsync()) return;

            var adminId      = new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
            var recruiterAId = new Guid("e0dcad41-8bca-4b5a-9ec4-8a9fbe4b442c");
            var recruiterBId = new Guid("0ffb991f-3f88-4ff6-a114-f2affddeb2ec");
            var hmJaneId     = new Guid("eab94e5d-9615-4f55-82c0-5f67dabaa210");
            var candAlexId   = new Guid("efb44238-dc28-4783-b553-83b04afdac5f");
            var candYohanId  = new Guid("9d015c70-f76e-4333-bfd9-96c2e20d1f66");
            var candMadId    = new Guid("f62394ab-a496-46ac-bdd9-639274e3a9c0");
            var jobUiUxId      = new Guid("1b8f93f9-4489-44db-b955-ee772f16dcff");
            var jobFullStackId = new Guid("ef34d041-241f-4e39-be08-d278e895c4c4");
            var jobPhotoId     = new Guid("50018d24-950c-4906-9c0e-c3fad728a733");
            var jobFrontendId  = new Guid("4073450b-eabb-42d2-bd98-2b7c4e47eb46");
            var jobAbcdId      = new Guid("d16dc03f-6408-4bc3-8b1e-dfeae76e6d95");
            var appAlexUiUx      = new Guid("e6d5b5dd-8bd6-4c4c-bb70-3f0e1e86d1b8");
            var appYohanUiUx     = new Guid("c49f8a70-ec51-4d1a-827c-6ca6fc02497d");
            var appAlexFullStack = new Guid("f63b871f-06a4-4206-8b47-8f72bbe5483e");
            var appAlexPhoto     = new Guid("69f70f04-edf0-40c8-ad04-faad931bf323");
            var appAlexFrontend  = new Guid("eb43fd42-251d-40ff-8f04-6cc1bd1481d8");
            var appMadAbcd       = new Guid("40f8bf26-ec47-495a-ab9a-10129ee4c507");
            var d = new DateTime(2026, 7, 21, 0, 0, 0, DateTimeKind.Utc);

            db.AuditLogs.AddRange(
                new AuditLog { UserId=adminId,      UserName="System Administrator", Action="PLATFORM_STARTED",     Module="Auth",       IpAddress="127.0.0.1",   Timestamp=d.AddHours(0),                Details="{\"event\":\"Application started, migrations applied\"}" },
                new AuditLog { UserId=adminId,      UserName="System Administrator", Action="USER_LOGIN",           Module="Auth",       IpAddress="127.0.0.1",   Timestamp=d.AddHours(8).AddMinutes(30),  Details="{\"status\":\"success\"}" },
                new AuditLog { UserId=adminId,      UserName="System Administrator", Action="SETTINGS_UPDATED",     Module="Settings",   IpAddress="127.0.0.1",   Timestamp=d.AddHours(9),                 Details="{\"keys\":[\"AiMatchScoreThreshold\",\"MaxUploadFileSizeMB\"]}" },
                new AuditLog { UserId=adminId,      UserName="System Administrator", Action="ROLE_UPDATED",         Module="Settings",   IpAddress="127.0.0.1",   Timestamp=d.AddHours(10),                Details="{\"role\":\"Recruiter\",\"permission\":\"candidate-profiles\",\"enabled\":true}" },
                new AuditLog { UserId=adminId,      UserName="System Administrator", Action="ORGANIZATION_CREATED", Module="Users",      IpAddress="127.0.0.1",   Timestamp=d.AddHours(12),                Details="{\"name\":\"madushan team\"}" },
                new AuditLog { UserId=adminId,      UserName="System Administrator", Action="ORGANIZATION_CREATED", Module="Users",      IpAddress="127.0.0.1",   Timestamp=d.AddHours(12).AddMinutes(5),  Details="{\"name\":\"new org\"}" },
                new AuditLog { UserId=adminId,      UserName="System Administrator", Action="RECRUITER_APPROVED",   Module="Users",      IpAddress="127.0.0.1",   Timestamp=d.AddHours(13).AddMinutes(8),  Details="{\"name\":\"anushka basnayake\"}" },
                new AuditLog { UserId=recruiterAId, UserName="anushka basnayake",    Action="USER_REGISTERED",      Module="Auth",       IpAddress="192.168.1.10",Timestamp=d.AddHours(13).AddMinutes(12), Details="{\"role\":\"Recruiter\",\"email\":\"basnayakamadushan0@gmail.com\"}" },
                new AuditLog { UserId=candAlexId,   UserName="alex morgan",          Action="USER_REGISTERED",      Module="Auth",       IpAddress="10.0.0.5",    Timestamp=d.AddHours(13).AddMinutes(16), Details="{\"role\":\"Candidate\",\"email\":\"alex@gmail.com\"}" },
                new AuditLog { UserId=recruiterAId, UserName="anushka basnayake",    Action="USER_LOGIN",           Module="Auth",       IpAddress="192.168.1.10",Timestamp=d.AddHours(13).AddMinutes(20), Details="{\"status\":\"success\"}" },
                new AuditLog { UserId=recruiterAId, UserName="anushka basnayake",    Action="JOB_CREATED",          Module="Jobs",       IpAddress="192.168.1.10",Timestamp=d.AddHours(13).AddMinutes(22), Details="{\"title\":\"UI/UX Design\",\"status\":\"Published\"}" },
                new AuditLog { UserId=recruiterAId, UserName="anushka basnayake",    Action="HM_INVITED",           Module="Users",      IpAddress="192.168.1.10",Timestamp=d.AddHours(13).AddMinutes(25), Details="{\"email\":\"jane@gmail.com\"}" },
                new AuditLog { UserId=candAlexId,   UserName="alex morgan",          Action="JOB_APPLIED",          Module="Candidates", IpAddress="10.0.0.5",    Timestamp=d.AddHours(13).AddMinutes(25), Details="{\"job\":\"UI/UX Design\"}" },
                new AuditLog { UserId=recruiterAId, UserName="anushka basnayake",    Action="APPLICANT_SHORTLISTED",Module="Candidates", IpAddress="192.168.1.10",Timestamp=d.AddHours(14).AddMinutes(10), Details="{\"candidate\":\"alex morgan\",\"job\":\"UI/UX Design\"}" },
                new AuditLog { UserId=hmJaneId,     UserName="jane doe",             Action="USER_REGISTERED",      Module="Auth",       IpAddress="10.0.0.8",    Timestamp=d.AddHours(14).AddMinutes(57), Details="{\"role\":\"HiringManager\",\"via\":\"invite\"}" },
                new AuditLog { UserId=candYohanId,  UserName="yohan bandara",        Action="USER_REGISTERED",      Module="Auth",       IpAddress="10.0.0.9",    Timestamp=d.AddHours(14).AddMinutes(59), Details="{\"role\":\"Candidate\",\"email\":\"yohan@gmail.com\"}" },
                new AuditLog { UserId=candYohanId,  UserName="yohan bandara",        Action="JOB_APPLIED",          Module="Candidates", IpAddress="10.0.0.9",    Timestamp=d.AddHours(14).AddMinutes(59), Details="{\"job\":\"UI/UX Design\"}" },
                new AuditLog { UserId=recruiterAId, UserName="anushka basnayake",    Action="JOB_CREATED",          Module="Jobs",       IpAddress="192.168.1.10",Timestamp=d.AddHours(15).AddMinutes(6),  Details="{\"title\":\"full stack development\",\"status\":\"Published\"}" },
                new AuditLog { UserId=candAlexId,   UserName="alex morgan",          Action="JOB_APPLIED",          Module="Candidates", IpAddress="10.0.0.5",    Timestamp=d.AddHours(15).AddMinutes(7),  Details="{\"job\":\"full stack development\"}" },
                new AuditLog { UserId=recruiterAId, UserName="anushka basnayake",    Action="APPLICANT_SHORTLISTED",Module="Candidates", IpAddress="192.168.1.10",Timestamp=d.AddHours(15).AddMinutes(30), Details="{\"candidate\":\"alex morgan\",\"job\":\"full stack development\"}" },
                new AuditLog { UserId=recruiterAId, UserName="anushka basnayake",    Action="JOB_CREATED",          Module="Jobs",       IpAddress="192.168.1.10",Timestamp=d.AddHours(16).AddMinutes(20), Details="{\"title\":\"photoshop\",\"status\":\"Published\"}" },
                new AuditLog { UserId=candAlexId,   UserName="alex morgan",          Action="JOB_APPLIED",          Module="Candidates", IpAddress="10.0.0.5",    Timestamp=d.AddHours(16).AddMinutes(21), Details="{\"job\":\"photoshop\"}" },
                new AuditLog { UserId=recruiterAId, UserName="anushka basnayake",    Action="APPLICANT_SHORTLISTED",Module="Candidates", IpAddress="192.168.1.10",Timestamp=d.AddHours(16).AddMinutes(30), Details="{\"candidate\":\"alex morgan\",\"job\":\"photoshop\"}" },
                new AuditLog { UserId=candMadId,    UserName="madushan basnayaka",   Action="USER_REGISTERED",      Module="Auth",       IpAddress="10.0.0.20",   Timestamp=d.AddHours(16).AddMinutes(52), Details="{\"role\":\"Candidate\",\"email\":\"senalilehansa100@gmail.com\"}" },
                new AuditLog { UserId=recruiterBId, UserName="ivan samare",          Action="USER_REGISTERED",      Module="Auth",       IpAddress="10.0.0.15",   Timestamp=d.AddHours(16).AddMinutes(52), Details="{\"role\":\"Recruiter\",\"email\":\"ivan@gmail.com\"}" },
                new AuditLog { UserId=adminId,      UserName="System Administrator", Action="RECRUITER_APPROVED",   Module="Users",      IpAddress="127.0.0.1",   Timestamp=d.AddHours(16).AddMinutes(53), Details="{\"name\":\"ivan samare\"}" },
                new AuditLog { UserId=recruiterBId, UserName="ivan samare",          Action="USER_LOGIN",           Module="Auth",       IpAddress="10.0.0.15",   Timestamp=d.AddHours(16).AddMinutes(55), Details="{\"status\":\"success\"}" },
                new AuditLog { UserId=recruiterBId, UserName="ivan samare",          Action="JOB_CREATED",          Module="Jobs",       IpAddress="10.0.0.15",   Timestamp=d.AddHours(16).AddMinutes(59), Details="{\"title\":\"frontend development\",\"status\":\"Published\"}" },
                new AuditLog { UserId=candAlexId,   UserName="alex morgan",          Action="JOB_APPLIED",          Module="Candidates", IpAddress="10.0.0.5",    Timestamp=d.AddHours(17).AddMinutes(0),  Details="{\"job\":\"frontend development\"}" },
                new AuditLog { UserId=recruiterBId, UserName="ivan samare",          Action="APPLICANT_SHORTLISTED",Module="Candidates", IpAddress="10.0.0.15",   Timestamp=d.AddHours(17).AddMinutes(5),  Details="{\"candidate\":\"alex morgan\",\"job\":\"frontend development\"}" },
                new AuditLog { UserId=recruiterBId, UserName="ivan samare",          Action="INTERVIEW_SCHEDULED",  Module="Interviews", IpAddress="10.0.0.15",   Timestamp=d.AddHours(17).AddMinutes(10), Details="{\"candidate\":\"alex morgan\",\"type\":\"Video\",\"interviewer\":\"jane doe\"}" },
                new AuditLog { UserId=recruiterAId, UserName="anushka basnayake",    Action="INTERVIEW_SCHEDULED",  Module="Interviews", IpAddress="192.168.1.10",Timestamp=d.AddHours(17).AddMinutes(15), Details="{\"candidate\":\"yohan bandara\",\"type\":\"Video\",\"interviewer\":\"anushka basnayake\"}" },
                new AuditLog { UserId=recruiterAId, UserName="anushka basnayake",    Action="INTERVIEW_SCHEDULED",  Module="Interviews", IpAddress="192.168.1.10",Timestamp=d.AddHours(17).AddMinutes(20), Details="{\"candidate\":\"alex morgan\",\"type\":\"Video\",\"interviewer\":\"maduranga\"}" },
                new AuditLog { UserId=hmJaneId,     UserName="jane doe",             Action="CANDIDATE_HIRED",      Module="Candidates", IpAddress="10.0.0.8",    Timestamp=d.AddHours(17).AddMinutes(30), Details="{\"candidate\":\"alex morgan\",\"job\":\"frontend development\",\"decision\":\"Hired\"}" },
                new AuditLog { UserId=recruiterAId, UserName="anushka basnayake",    Action="USER_LOGIN",           Module="Auth",       IpAddress="192.168.1.10",Timestamp=d.AddHours(18),                Details="{\"status\":\"success\"}" },
                new AuditLog { UserId=recruiterBId, UserName="ivan samare",          Action="JOB_CREATED",          Module="Jobs",       IpAddress="10.0.0.15",   Timestamp=d.AddHours(21).AddMinutes(10), Details="{\"title\":\"abcd\",\"status\":\"Published\"}" },
                new AuditLog { UserId=candMadId,    UserName="madushan basnayaka",   Action="JOB_APPLIED",          Module="Candidates", IpAddress="10.0.0.20",   Timestamp=d.AddHours(21).AddMinutes(12), Details="{\"job\":\"abcd\"}" },
                new AuditLog { UserId=recruiterBId, UserName="ivan samare",          Action="INTERVIEW_SCHEDULED",  Module="Interviews", IpAddress="10.0.0.15",   Timestamp=d.AddHours(21).AddMinutes(15), Details="{\"candidate\":\"madushan basnayaka\",\"type\":\"Video\",\"interviewer\":\"jane doe\"}" }
            );
            await db.SaveChangesAsync();
            Console.WriteLine("Audit logs seeded.");
        }
    }
}
