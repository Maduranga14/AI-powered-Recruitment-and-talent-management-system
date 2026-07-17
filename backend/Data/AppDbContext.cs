using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<CandidateProfile> CandidateProfiles { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<GlobalPolicy> GlobalPolicies { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<HiringManagerInvitation> HiringManagerInvitations { get; set; }
        public DbSet<JobPosting> JobPostings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);

                entity.HasIndex(u => u.Email)
                      .IsUnique();

                entity.Property(u => u.FirstName)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(u => u.LastName)
                      .IsRequired();

                entity.Property(u => u.Email)
                      .IsRequired();

                entity.Property(u => u.PasswordHash)
                      .IsRequired();

                entity.Property(u => u.Role)
                      .HasConversion<string>();

                entity.Property(u => u.Status)
                      .HasConversion<string>()
                      .HasDefaultValue(UserStatus.Active);

                entity.Property(u => u.OrganizationName)
                      .HasMaxLength(200);

                entity.HasOne(u => u.CandidateProfile)
                      .WithOne(cp => cp.User)
                      .HasForeignKey<CandidateProfile>(cp => cp.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.Ignore(u => u.FullName);
            });

            modelBuilder.Entity<CandidateProfile>(entity =>
            {
                entity.HasKey(cp => cp.Id);

                entity.Property(cp => cp.Skills)
                      .HasMaxLength(1000);

                entity.Property(cp => cp.LinkedInUrl)
                      .HasMaxLength(200);

                entity.Property(cp => cp.ResumeFileUrl)
                      .HasMaxLength(500);
            });

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

                entity.Property(j => j.EmploymentType)
                      .HasConversion<string>();

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

            modelBuilder.Entity<HiringManagerInvitation>(entity =>
            {
                entity.HasKey(i => i.Id);

                entity.HasIndex(i => i.Token)
                      .IsUnique();

                entity.Property(i => i.Token)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(i => i.InvitedEmail)
                      .IsRequired()
                      .HasMaxLength(256);

                entity.Property(i => i.OrganizationName)
                      .IsRequired()
                      .HasMaxLength(200);
            });
        }
    }
}
