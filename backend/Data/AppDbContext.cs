using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        // ── Existing tables ──────────────────────────────────────────────────
        public DbSet<User> Users { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<GlobalPolicy> GlobalPolicies { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<HiringManagerInvitation> HiringManagerInvitations { get; set; }
        public DbSet<JobPosting> JobPostings { get; set; }

        // ── Candidate profile tables ─────────────────────────────────────────
        public DbSet<CandidateProfile> CandidateProfiles { get; set; }
        public DbSet<WorkExperience> WorkExperiences { get; set; }
        public DbSet<Education> Educations { get; set; }
        public DbSet<CandidateSkill> CandidateSkills { get; set; }
        public DbSet<CandidateLinks> CandidateLinks { get; set; }
        public DbSet<JobApplication> JobApplications { get; set; }
        public DbSet<Interview> Interviews { get; set; }
        public DbSet<ChatConversation> ChatConversations { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── User ─────────────────────────────────────────────────────────
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.FirstName).IsRequired().HasMaxLength(50);
                entity.Property(u => u.LastName).IsRequired();
                entity.Property(u => u.Email).IsRequired();
                entity.Property(u => u.PasswordHash).IsRequired();
                entity.Property(u => u.Role).HasConversion<string>();
                entity.Property(u => u.Status)
                      .HasConversion<string>()
                      .HasDefaultValue(UserStatus.Active);
                entity.Property(u => u.OrganizationName).HasMaxLength(200);

                // 1:1 User → CandidateProfile
                entity.HasOne(u => u.CandidateProfile)
                      .WithOne(cp => cp.User)
                      .HasForeignKey<CandidateProfile>(cp => cp.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.Ignore(u => u.FullName);
            });

            // ── CandidateProfile ──────────────────────────────────────────────
            modelBuilder.Entity<CandidateProfile>(entity =>
            {
                entity.HasKey(cp => cp.Id);
                entity.Property(cp => cp.Phone).HasMaxLength(20);
                entity.Property(cp => cp.Location).HasMaxLength(150);
                entity.Property(cp => cp.Headline).HasMaxLength(220);
                entity.Property(cp => cp.ResumeUrl).HasMaxLength(500);
                entity.Property(cp => cp.PhotoUrl).HasMaxLength(500);

                // 1:many CandidateProfile → WorkExperience
                entity.HasMany(cp => cp.Experiences)
                      .WithOne(e => e.CandidateProfile)
                      .HasForeignKey(e => e.CandidateProfileId)
                      .OnDelete(DeleteBehavior.Cascade);

                // 1:many CandidateProfile → Education
                entity.HasMany(cp => cp.Educations)
                      .WithOne(ed => ed.CandidateProfile)
                      .HasForeignKey(ed => ed.CandidateProfileId)
                      .OnDelete(DeleteBehavior.Cascade);

                // 1:many CandidateProfile → CandidateSkill
                entity.HasMany(cp => cp.Skills)
                      .WithOne(s => s.CandidateProfile)
                      .HasForeignKey(s => s.CandidateProfileId)
                      .OnDelete(DeleteBehavior.Cascade);

                // 1:many CandidateProfile → JobApplication
                entity.HasMany(cp => cp.Applications)
                      .WithOne(a => a.CandidateProfile)
                      .HasForeignKey(a => a.CandidateProfileId)
                      .OnDelete(DeleteBehavior.Cascade);

                // 1:1 CandidateProfile → CandidateLinks
                entity.HasOne(cp => cp.Links)
                      .WithOne(l => l.CandidateProfile)
                      .HasForeignKey<CandidateLinks>(l => l.CandidateProfileId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ── WorkExperience ────────────────────────────────────────────────
            modelBuilder.Entity<WorkExperience>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Company).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Description).HasMaxLength(1000);
            });

            // ── Education ─────────────────────────────────────────────────────
            modelBuilder.Entity<Education>(entity =>
            {
                entity.HasKey(ed => ed.Id);
                entity.Property(ed => ed.Institution).IsRequired().HasMaxLength(200);
                entity.Property(ed => ed.Degree).IsRequired().HasMaxLength(150);
                entity.Property(ed => ed.FieldOfStudy).IsRequired().HasMaxLength(150);
            });

            // ── CandidateSkill ────────────────────────────────────────────────
            modelBuilder.Entity<CandidateSkill>(entity =>
            {
                entity.HasKey(s => s.Id);
                entity.Property(s => s.Name).IsRequired().HasMaxLength(80);
            });

            // ── CandidateLinks ────────────────────────────────────────────────
            modelBuilder.Entity<CandidateLinks>(entity =>
            {
                entity.HasKey(l => l.Id);
                entity.Property(l => l.LinkedIn).HasMaxLength(300);
                entity.Property(l => l.Portfolio).HasMaxLength(300);
                entity.Property(l => l.GitHub).HasMaxLength(300);
            });

            // ── JobApplication ────────────────────────────────────────────────
            modelBuilder.Entity<JobApplication>(entity =>
            {
                entity.HasKey(a => a.Id);
                entity.Property(a => a.Status).HasConversion<string>();
                entity.Property(a => a.CoverLetter).HasMaxLength(3000);

                // Prevent duplicate applications
                entity.HasIndex(a => new { a.CandidateProfileId, a.JobPostingId }).IsUnique();

                // JobPosting side: restrict delete so posted job can't cascade-delete applications
                entity.HasOne(a => a.JobPosting)
                      .WithMany()
                      .HasForeignKey(a => a.JobPostingId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ── Interview ─────────────────────────────────────────────────────
            modelBuilder.Entity<Interview>(entity =>
            {
                entity.HasKey(i => i.Id);
                entity.Property(i => i.InterviewType).IsRequired().HasMaxLength(30);
                entity.Property(i => i.InterviewerName).IsRequired().HasMaxLength(150);
                entity.Property(i => i.MeetingLink).HasMaxLength(500);
                entity.Property(i => i.Location).HasMaxLength(300);
                entity.Property(i => i.Notes).HasMaxLength(1000);
                entity.HasIndex(i => i.ScheduledAt);
                entity.HasIndex(i => i.CreatedByRecruiterId);

                entity.HasOne(i => i.JobApplication)
                      .WithMany()
                      .HasForeignKey(i => i.JobApplicationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(i => i.CreatedByRecruiter)
                      .WithMany()
                      .HasForeignKey(i => i.CreatedByRecruiterId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ── Role & RolePermission ─────────────────────────────────────────
            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(r => r.Id);
                entity.HasMany(r => r.Permissions)
                      .WithOne(rp => rp.Role)
                      .HasForeignKey(rp => rp.RoleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<RolePermission>(entity =>
            {
                entity.HasKey(rp => rp.Id);
            });

            // ── JobPosting ────────────────────────────────────────────────────
            modelBuilder.Entity<JobPosting>(entity =>
            {
                entity.HasKey(j => j.Id);
                entity.Property(j => j.Title).IsRequired().HasMaxLength(200);
                entity.Property(j => j.Location).IsRequired().HasMaxLength(200);
                entity.Property(j => j.SalaryCurrency).HasMaxLength(10);
                entity.Property(j => j.ExperienceRequired).HasMaxLength(100);
                entity.Property(j => j.RequiredSkills).HasMaxLength(1000);
                entity.Property(j => j.SalaryMin).HasColumnType("decimal(18,2)");
                entity.Property(j => j.SalaryMax).HasColumnType("decimal(18,2)");
                entity.Property(j => j.PostedBy).HasMaxLength(200);
                entity.Property(j => j.EmploymentType).HasConversion<string>();
                entity.Property(j => j.Status)
                      .HasConversion<string>()
                      .HasDefaultValue(JobStatus.Draft);

                entity.HasOne(j => j.Department)
                      .WithMany()
                      .HasForeignKey(j => j.DepartmentId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(j => j.CreatedByRecruiter)
                      .WithMany()
                      .HasForeignKey(j => j.CreatedByRecruiterId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(j => j.Status);
                entity.HasIndex(j => j.CreatedByRecruiterId);
            });

            // ── HiringManagerInvitation ───────────────────────────────────────
            modelBuilder.Entity<HiringManagerInvitation>(entity =>
            {
                entity.HasKey(i => i.Id);
                entity.HasIndex(i => i.Token).IsUnique();
                entity.Property(i => i.Token).IsRequired().HasMaxLength(100);
                entity.Property(i => i.InvitedEmail).IsRequired().HasMaxLength(256);
                entity.Property(i => i.OrganizationName).IsRequired().HasMaxLength(200);
            });

            // ── AI Chat ───────────────────────────────────────────────────────
            modelBuilder.Entity<ChatConversation>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Title).IsRequired().HasMaxLength(200);
                entity.HasIndex(c => c.UserId);
                entity.HasIndex(c => c.UpdatedAt);

                entity.HasOne(c => c.User)
                      .WithMany()
                      .HasForeignKey(c => c.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(c => c.Messages)
                      .WithOne(m => m.Conversation)
                      .HasForeignKey(m => m.ConversationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.HasKey(m => m.Id);
                entity.Property(m => m.Role).IsRequired().HasMaxLength(20);
                entity.Property(m => m.Content).IsRequired();
                entity.HasIndex(m => m.ConversationId);
                entity.HasIndex(m => m.CreatedAt);
            });
        }
    }
}

