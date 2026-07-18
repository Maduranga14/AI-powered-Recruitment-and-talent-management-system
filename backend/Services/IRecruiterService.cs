using System;
using System.Threading.Tasks;
using backend.DTOs.Recruiter;

namespace backend.Services
{
    public interface IRecruiterService
    {
        Task<RecruiterHiringManagersResponseDto> GetHiringManagersAndInvitesAsync(Guid recruiterId);
        Task<bool> ToggleHiringManagerStatusAsync(Guid managerId, Guid recruiterId);
        Task<string> ResendInvitationAsync(Guid invitationId, Guid recruiterId, string frontendBaseUrl);
        Task RevokeInvitationAsync(Guid invitationId, Guid recruiterId);
    }
}
