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
    }
}
