using backend.DTOs.Auth;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterCandidateAsync(RegisterCandidateDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
    }
}
