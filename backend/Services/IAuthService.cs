using backend.DTOs.Auth;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterCandidateAsync(RegisterCandidateDto dto);
        Task<string> RegisterRecruiterAsync(RegisterRecruiterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<InviteResponseDto> InviteHiringManagerAsync(InviteHiringManagerDto dto, Guid recruiterId, string frontendBaseUrl);
        Task<InviteInfoDto> ValidateInviteAsync(string token);
        Task<AuthResponseDto> RegisterHiringManagerAsync(RegisterHiringManagerDto dto);
    }
}
