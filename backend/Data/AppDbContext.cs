using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<CandidateProfile> CandidateProfiles { get; set; }

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
        }
    }
}
