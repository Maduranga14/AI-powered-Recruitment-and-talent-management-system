using backend.Data;
using backend.DTOs.Auth;
using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AuthService(AppDbContext dbContext, IJwtService jwtService, IEmailService emailService) : IAuthService
    {
        private readonly AppDbContext _db = dbContext;
        private readonly IJwtService _jwtService = jwtService;
        private readonly IEmailService _emailService = emailService;

        // ─────────────────────────────────────────────
        // Candidate Registration
        // ─────────────────────────────────────────────
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
                Status = UserStatus.Active,
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

            // Send welcome email to candidate
            var emailSubject = $"Welcome to TalentPortal AI, {user.FirstName}!";
            var emailBody = $@"
                <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'>
                    <h2 style='color: #4f46e5; margin-bottom: 16px;'>Welcome to TalentPortal AI!</h2>
                    <p style='color: #475569; font-size: 16px; line-height: 1.6;'>Hello {user.FirstName},</p>
                    <p style='color: #475569; font-size: 16px; line-height: 1.6;'>Thank you for registering an account on our platform! We are excited to help you find your next role using AI-powered matching.</p>
                    <p style='color: #475569; font-size: 16px; line-height: 1.6;'>To get started, log in to your candidate dashboard to build your profile, upload your resume, and start matching with top jobs:</p>
                    <p style='margin: 24px 0; text-align: center;'>
                        <a href='http://localhost:5173/dashboard' style='background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;'>Go to Candidate Dashboard</a>
                    </p>
                    <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;' />
                    <p style='color: #94a3b8; font-size: 12px;'>This is an automated notification. Please do not reply directly to this email.</p>
                </div>";

            try
            {
                await _emailService.SendEmailAsync(user.Email, emailSubject, emailBody);
            }
            catch
            {
                // Silently swallow email failures in background so registration flow succeeds
            }

            var token = _jwtService.GenerateToken(user);
            return BuildAuthResponse(user, token);
        }

        // ─────────────────────────────────────────────
        // Recruiter Registration (Pending approval)
        // ─────────────────────────────────────────────
        public async Task<string> RegisterRecruiterAsync(RegisterRecruiterDto dto)
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
                Role = UserRole.Recruiter,
                Status = UserStatus.Pending,      // Key: awaits admin approval
                OrganizationName = dto.OrganizationName.Trim(),
                IsActive = false,                 // Not yet active
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return "Your recruiter account has been created and is awaiting admin approval. You will be able to log in once approved.";
        }

        // ─────────────────────────────────────────────
        // Login (with Pending check)
        // ─────────────────────────────────────────────
        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid email or password.");

            // Check recruiter pending status
            if (user.Status == UserStatus.Pending)
                throw new InvalidOperationException("Your account is awaiting admin approval. You will receive access once an administrator reviews your application.");

            // Check recruiter rejected status
            if (user.Status == UserStatus.Rejected)
                throw new UnauthorizedAccessException("Your account application was not approved. Please contact support for more information.");

            if (!user.IsActive)
                throw new UnauthorizedAccessException("Your account has been deactivated. Please contact the administrator.");

            var token = _jwtService.GenerateToken(user);
            return BuildAuthResponse(user, token);
        }

        // ─────────────────────────────────────────────
        // Invite Hiring Manager
        // ─────────────────────────────────────────────
        public async Task<InviteResponseDto> InviteHiringManagerAsync(InviteHiringManagerDto dto, Guid recruiterId, string frontendBaseUrl)
        {
            // Validate the recruiter exists and has an org name
            var recruiter = await _db.Users.FindAsync(recruiterId)
                ?? throw new KeyNotFoundException("Recruiter account not found.");

            if (recruiter.Role != UserRole.Recruiter && recruiter.Role != UserRole.Admin)
                throw new UnauthorizedAccessException("Only Recruiters or Admins can invite Hiring Managers.");

            var orgName = recruiter.OrganizationName ?? recruiter.FullName;

            // Check if there's already an active (unused, non-expired) invite for this email,
            // and automatically supersede/deactivate it so a new invitation can be sent.
            var existingInvites = await _db.HiringManagerInvitations
                .Where(i => i.InvitedEmail.ToLower() == dto.Email.ToLower() && !i.IsUsed)
                .ToListAsync();

            foreach (var oldInvite in existingInvites)
            {
                oldInvite.IsUsed = true; // Mark as superseded
            }

            // Check if email is already a registered user
            var emailExists = await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (emailExists)
                throw new InvalidOperationException("A user account already exists with this email address.");

            var token = Guid.NewGuid().ToString("N"); // 32-char hex token
            var expiry = DateTime.UtcNow.AddHours(72);

            var invitation = new HiringManagerInvitation
            {
                Token = token,
                InvitedEmail = dto.Email.ToLower().Trim(),
                OrganizationName = orgName,
                CreatedByRecruiterId = recruiterId,
                ExpiresAt = expiry,
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _db.HiringManagerInvitations.Add(invitation);
            await _db.SaveChangesAsync();

            var inviteLink = $"{frontendBaseUrl}/register-hm?token={token}";

            // Send HTML email with invitation details
            var emailSubject = $"Invitation to join {orgName} on TalentPortal AI";
            var emailBody = $@"
                <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'>
                    <h2 style='color: #4f46e5; margin-bottom: 16px;'>Welcome to TalentPortal AI!</h2>
                    <p style='color: #475569; font-size: 16px; line-height: 1.6;'>You have been invited by <strong>{recruiter.FullName}</strong> to join the organization <strong>{orgName}</strong> as a Hiring Manager.</p>
                    <p style='color: #475569; font-size: 16px; line-height: 1.6;'>To accept this invitation and set up your account, click the button below:</p>
                    <p style='margin: 24px 0; text-align: center;'>
                        <a href='{inviteLink}' style='background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;'>Accept & Complete Registration</a>
                    </p>
                    <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;' />
                    <p style='color: #64748b; font-size: 12px; line-height: 1.5;'>If the button doesn't work, copy and paste this URL into your browser:</p>
                    <p style='color: #4f46e5; font-size: 12px; font-family: monospace; word-break: break-all; margin-top: 4px;'>{inviteLink}</p>
                    <p style='color: #94a3b8; font-size: 12px; margin-top: 16px;'>This invitation will expire in 72 hours.</p>
                </div>";

            await _emailService.SendEmailAsync(dto.Email.ToLower().Trim(), emailSubject, emailBody);

            return new InviteResponseDto
            {
                Message = $"Invitation sent to {dto.Email}. The link expires in 72 hours.",
                InviteLink = inviteLink,
                Token = token,
                ExpiresAt = expiry
            };
        }

        // ─────────────────────────────────────────────
        // Validate Invite Token (for pre-filling form)
        // ─────────────────────────────────────────────
        public async Task<InviteInfoDto> ValidateInviteAsync(string token)
        {
            var invite = await _db.HiringManagerInvitations
                .FirstOrDefaultAsync(i => i.Token == token);

            if (invite == null)
                throw new KeyNotFoundException("This invitation link is invalid.");

            if (invite.IsUsed)
                throw new InvalidOperationException("This invitation has already been used.");

            if (invite.ExpiresAt < DateTime.UtcNow)
                throw new InvalidOperationException("This invitation link has expired. Please ask your recruiter to send a new invite.");

            return new InviteInfoDto
            {
                InvitedEmail = invite.InvitedEmail,
                OrganizationName = invite.OrganizationName,
                ExpiresAt = invite.ExpiresAt
            };
        }

        // ─────────────────────────────────────────────
        // Register Hiring Manager via Token
        // ─────────────────────────────────────────────
        public async Task<AuthResponseDto> RegisterHiringManagerAsync(RegisterHiringManagerDto dto)
        {
            var invite = await _db.HiringManagerInvitations
                .FirstOrDefaultAsync(i => i.Token == dto.Token);

            if (invite == null)
                throw new KeyNotFoundException("This invitation link is invalid.");

            if (invite.IsUsed)
                throw new InvalidOperationException("This invitation has already been used. Please request a new invite.");

            if (invite.ExpiresAt < DateTime.UtcNow)
                throw new InvalidOperationException("This invitation link has expired. Please request a new invite.");

            // Prevent duplicate accounts
            var emailExists = await _db.Users.AnyAsync(u => u.Email.ToLower() == invite.InvitedEmail);
            if (emailExists)
                throw new InvalidOperationException("An account already exists for this email address.");

            var user = new User
            {
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Email = invite.InvitedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = UserRole.HiringManager,
                Status = UserStatus.Active,
                OrganizationName = invite.OrganizationName,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);

            // Mark the token as used
            invite.IsUsed = true;
            await _db.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user);
            return BuildAuthResponse(user, token);
        }

        // ─────────────────────────────────────────────
        // Helper
        // ─────────────────────────────────────────────
        private AuthResponseDto BuildAuthResponse(User user, string token) => new()
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role.ToString(),
            Status = user.Status.ToString(),
            OrganizationName = user.OrganizationName,
            ExpiresAt = _jwtService.GetExpiry()
        };
    }
}
