using backend.Data;
using backend.DTOs.Admin;
using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AdminUserService(AppDbContext dbContext) : IAdminUserService
    {
        private readonly AppDbContext _db = dbContext;

        
        public async Task<UserListDto> CreateUserAsync(CreateUserDto dto)
        {
            
            if (dto.Role != UserRole.Recruiter && dto.Role != UserRole.HiringManager)
                throw new ArgumentException("Admin can only create Recruiter or HiringManager accounts.");

            
            var emailExists = await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (emailExists)
                throw new InvalidOperationException($"A user with email '{dto.Email}' already exists.");

            var user = new User
            {
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Email = dto.Email.ToLower().Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return MapToListDto(user);
        }

        
        public async Task<PagedResultDto<UserListDto>> GetAllUsersAsync(UserRole? roleFilter, int page, int pageSize)
        {
            var query = _db.Users.AsQueryable();

            if (roleFilter.HasValue)
                query = query.Where(u => u.Role == roleFilter.Value);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => MapToListDto(u))
                .ToListAsync();

            return new PagedResultDto<UserListDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        
        public async Task<UserListDto?> GetUserByIdAsync(Guid id)
        {
            var user = await _db.Users.FindAsync(id);
            return user is null ? null : MapToListDto(user);
        }

        
        public async Task<bool> ToggleUserActiveAsync(Guid id)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException($"User with ID '{id}' not found.");

           
            if (user.Role == UserRole.Admin)
                throw new InvalidOperationException("Admin accounts cannot be deactivated.");

            user.IsActive = !user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return user.IsActive;
        }

        
        public async Task ResetUserPasswordAsync(Guid id, string newPassword)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException($"User with ID '{id}' not found.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
        }

        
        private static UserListDto MapToListDto(User u) => new()
        {
            Id = u.Id,
            FullName = $"{u.FirstName} {u.LastName}",
            Email = u.Email,
            Role = u.Role.ToString(),
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        };
    }
}
