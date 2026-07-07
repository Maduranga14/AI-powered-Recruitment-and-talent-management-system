using backend.Data;
using backend.DTOs.Auth;
using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AuthService(AppDbContext dbContext, IJwtService jwtService) : IAuthService
    {
        private readonly AppDbContext _db = dbContext;
        private readonly IJwtService _jwtService = jwtService;

       
        public async Task<AuthResponseDto> RegisterCandidateAsync(RegisterCandidateDto dto)
        {
            
            var emailExists = await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (emailExists)
                throw new InvalidOperationException("An account with this email already exists.");

            
            var user = new User
            {
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Email = dto.Email.ToLower().Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = UserRole.Candidate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);

           
            var profile = new CandidateProfile
            {
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.CandidateProfiles.Add(profile);

            await _db.SaveChangesAsync();

            
            var token = _jwtService.GenerateToken(user);
            return new AuthResponseDto
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                ExpiresAt = _jwtService.GetExpiry()
            };
        }

        
        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid email or password.");

            if (!user.IsActive)
                throw new UnauthorizedAccessException("Your account has been deactivated. Please contact the administrator.");

            var token = _jwtService.GenerateToken(user);
            return new AuthResponseDto
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                ExpiresAt = _jwtService.GetExpiry()
            };
        }
    }
}
