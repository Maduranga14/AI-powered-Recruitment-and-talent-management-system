using backend.DTOs;

namespace backend.Services
{
    public interface IGoogleCalendarService
    {
        Task<GoogleCalendarStatusDto> GetStatusAsync(Guid userId);
        Task<GoogleCalendarStatusDto> ConnectAsync(Guid userId, ConnectGoogleCalendarRequest request);
        Task<bool> DisconnectAsync(Guid userId);
        Task<GoogleCalendarStatusDto> UpdateSettingsAsync(Guid userId, UpdateGoogleCalendarSettingsRequest request);
        Task<SyncInterviewResultDto> SyncInterviewAsync(Guid userId, Guid interviewId);
        Task<List<SyncInterviewResultDto>> SyncAllInterviewsAsync(Guid userId);
        string GenerateDirectCalendarUrl(backend.Models.Interview interview, string candidateName, string jobTitle);
    }
}
