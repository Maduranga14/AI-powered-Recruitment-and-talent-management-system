using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Web;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class GoogleCalendarService : IGoogleCalendarService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public GoogleCalendarService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            _httpClient = new HttpClient();
        }

        public async Task<GoogleCalendarStatusDto> GetStatusAsync(Guid userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new KeyNotFoundException("User not found.");

            var integration = await _context.GoogleCalendarIntegrations
                .FirstOrDefaultAsync(g => g.UserId == userId);

            var clientId = _configuration["GoogleCalendar:ClientId"];
            var isClientIdConfigured = !string.IsNullOrWhiteSpace(clientId);

            string? authUrl = null;
            if (isClientIdConfigured)
            {
                var redirectUri = _configuration["GoogleCalendar:RedirectUri"]
                    ?? $"{_configuration["FrontendBaseUrl"]}/hiring-manager?tab=calendar";
                var scope = HttpUtility.UrlEncode("https://www.googleapis.com/auth/calendar.events");
                authUrl = $"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={clientId}&redirect_uri={HttpUtility.UrlEncode(redirectUri)}&scope={scope}&access_type=offline&prompt=consent";
            }

            if (integration == null || !integration.IsConnected)
            {
                return new GoogleCalendarStatusDto
                {
                    IsConnected = false,
                    GoogleEmail = null,
                    ConnectedAt = null,
                    AutoSyncInterviews = true,
                    CalendarId = "primary",
                    ClientIdConfigured = isClientIdConfigured,
                    AuthUrl = authUrl
                };
            }

            return new GoogleCalendarStatusDto
            {
                IsConnected = integration.IsConnected,
                GoogleEmail = integration.GoogleEmail,
                ConnectedAt = integration.ConnectedAt,
                AutoSyncInterviews = integration.AutoSyncInterviews,
                CalendarId = integration.CalendarId,
                ClientIdConfigured = isClientIdConfigured,
                AuthUrl = authUrl
            };
        }

        public async Task<GoogleCalendarStatusDto> ConnectAsync(Guid userId, ConnectGoogleCalendarRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new KeyNotFoundException("User not found.");

            var integration = await _context.GoogleCalendarIntegrations
                .FirstOrDefaultAsync(g => g.UserId == userId);

            var emailToConnect = !string.IsNullOrWhiteSpace(request.Email)
                ? request.Email.Trim()
                : user.Email;

            string? accessToken = null;
            string? refreshToken = null;
            DateTime? tokenExpiresAt = null;

            var clientId = _configuration["GoogleCalendar:ClientId"];
            var clientSecret = _configuration["GoogleCalendar:ClientSecret"];
            var redirectUri = _configuration["GoogleCalendar:RedirectUri"]
                ?? $"{_configuration["FrontendBaseUrl"]}/hiring-manager?tab=calendar";

            if (!string.IsNullOrWhiteSpace(request.AuthorizationCode) && !string.IsNullOrWhiteSpace(clientId) && !string.IsNullOrWhiteSpace(clientSecret))
            {
                try
                {
                    var tokenRequest = new Dictionary<string, string>
                    {
                        { "code", request.AuthorizationCode },
                        { "client_id", clientId },
                        { "client_secret", clientSecret },
                        { "redirect_uri", redirectUri },
                        { "grant_type", "authorization_code" }
                    };

                    var tokenResponse = await _httpClient.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(tokenRequest));
                    if (tokenResponse.IsSuccessStatusCode)
                    {
                        var json = await tokenResponse.Content.ReadAsStringAsync();
                        using var doc = JsonDocument.Parse(json);
                        var root = doc.RootElement;
                        accessToken = root.GetProperty("access_token").GetString();
                        if (root.TryGetProperty("refresh_token", out var rtElement))
                        {
                            refreshToken = rtElement.GetString();
                        }
                        if (root.TryGetProperty("expires_in", out var expElement))
                        {
                            tokenExpiresAt = DateTime.UtcNow.AddSeconds(expElement.GetInt32());
                        }

                        if (!string.IsNullOrWhiteSpace(accessToken))
                        {
                            var userReq = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v2/userinfo");
                            userReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                            var userRes = await _httpClient.SendAsync(userReq);
                            if (userRes.IsSuccessStatusCode)
                            {
                                var userJson = await userRes.Content.ReadAsStringAsync();
                                using var userDoc = JsonDocument.Parse(userJson);
                                if (userDoc.RootElement.TryGetProperty("email", out var emailEl))
                                {
                                    var fetchedEmail = emailEl.GetString();
                                    if (!string.IsNullOrWhiteSpace(fetchedEmail))
                                    {
                                        emailToConnect = fetchedEmail;
                                    }
                                }
                            }
                        }
                    }
                }
                catch
                {
                    // Fallback to direct email connect if code exchange encounters an issue
                }
            }

            if (integration == null)
            {
                integration = new GoogleCalendarIntegration
                {
                    UserId = userId,
                    IsConnected = true,
                    GoogleEmail = emailToConnect,
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    TokenExpiresAt = tokenExpiresAt,
                    AutoSyncInterviews = request.AutoSyncInterviews,
                    ConnectedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.GoogleCalendarIntegrations.Add(integration);
            }
            else
            {
                integration.IsConnected = true;
                integration.GoogleEmail = emailToConnect;
                if (!string.IsNullOrWhiteSpace(accessToken)) integration.AccessToken = accessToken;
                if (!string.IsNullOrWhiteSpace(refreshToken)) integration.RefreshToken = refreshToken;
                if (tokenExpiresAt.HasValue) integration.TokenExpiresAt = tokenExpiresAt;
                integration.AutoSyncInterviews = request.AutoSyncInterviews;
                integration.UpdatedAt = DateTime.UtcNow;
            }


            await _context.SaveChangesAsync();

            // Trigger auto-sync if enabled
            if (integration.AutoSyncInterviews)
            {
                try
                {
                    await SyncAllInterviewsAsync(userId);
                }
                catch
                {
                    // Ignore background sync errors on connect
                }
            }

            return await GetStatusAsync(userId);
        }

        public async Task<bool> DisconnectAsync(Guid userId)
        {
            var integration = await _context.GoogleCalendarIntegrations
                .FirstOrDefaultAsync(g => g.UserId == userId);

            if (integration == null) return true;

            integration.IsConnected = false;
            integration.AccessToken = null;
            integration.RefreshToken = null;
            integration.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<GoogleCalendarStatusDto> UpdateSettingsAsync(Guid userId, UpdateGoogleCalendarSettingsRequest request)
        {
            var integration = await _context.GoogleCalendarIntegrations
                .FirstOrDefaultAsync(g => g.UserId == userId);

            if (integration == null)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null) throw new KeyNotFoundException("User not found.");

                integration = new GoogleCalendarIntegration
                {
                    UserId = userId,
                    IsConnected = true,
                    GoogleEmail = user.Email,
                    AutoSyncInterviews = request.AutoSyncInterviews,
                    CalendarId = string.IsNullOrWhiteSpace(request.CalendarId) ? "primary" : request.CalendarId
                };
                _context.GoogleCalendarIntegrations.Add(integration);
            }
            else
            {
                integration.AutoSyncInterviews = request.AutoSyncInterviews;
                if (!string.IsNullOrWhiteSpace(request.CalendarId))
                {
                    integration.CalendarId = request.CalendarId;
                }
                integration.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return await GetStatusAsync(userId);
        }

        public async Task<SyncInterviewResultDto> SyncInterviewAsync(Guid userId, Guid interviewId)
        {
            var interview = await _context.Interviews
                .Include(i => i.JobApplication)
                .ThenInclude(a => a.CandidateProfile)
                .ThenInclude(cp => cp.User)
                .Include(i => i.JobApplication)
                .ThenInclude(a => a.JobPosting)
                .ThenInclude(j => j.Department)
                .FirstOrDefaultAsync(i => i.Id == interviewId);

            if (interview == null)
            {
                return new SyncInterviewResultDto
                {
                    InterviewId = interviewId,
                    Success = false,
                    Message = "Interview not found."
                };
            }

            var candidateName = interview.JobApplication?.CandidateProfile?.User?.FullName
                ?? "Candidate";


            var jobTitle = interview.JobApplication?.JobPosting?.Title
                ?? "Position";

            var directWebUrl = GenerateDirectCalendarUrl(interview, candidateName, jobTitle);

            var integration = await _context.GoogleCalendarIntegrations
                .FirstOrDefaultAsync(g => g.UserId == userId);

            if (integration != null)
            {
                var validToken = await EnsureValidAccessTokenAsync(integration);
                if (!string.IsNullOrWhiteSpace(validToken))
                {
                    try
                    {
                        var startUtc = DateTime.SpecifyKind(interview.ScheduledAt, DateTimeKind.Utc);
                        var endUtc = startUtc.AddMinutes(interview.DurationMinutes > 0 ? interview.DurationMinutes : 60);

                        var eventBody = new
                        {
                            summary = $"Interview: {candidateName} - {jobTitle}",
                            description = $"Role: {jobTitle}\nCandidate: {candidateName}\nFormat: {interview.InterviewType}\nMeeting Link: {interview.MeetingLink}\nNotes: {interview.Notes}\nScheduled via TalentPortal AI Platform",
                            location = string.IsNullOrWhiteSpace(interview.MeetingLink) ? interview.Location : interview.MeetingLink,
                            start = new { dateTime = startUtc.ToString("yyyy-MM-ddTHH:mm:ssZ") },
                            end = new { dateTime = endUtc.ToString("yyyy-MM-ddTHH:mm:ssZ") }
                        };

                        var requestMsg = new HttpRequestMessage(HttpMethod.Post, $"https://www.googleapis.com/calendar/v3/calendars/{Uri.EscapeDataString(integration.CalendarId ?? "primary")}/events");
                        requestMsg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", validToken);
                        requestMsg.Content = new StringContent(JsonSerializer.Serialize(eventBody), Encoding.UTF8, "application/json");

                        var response = await _httpClient.SendAsync(requestMsg);
                        if (response.IsSuccessStatusCode)
                        {
                            var json = await response.Content.ReadAsStringAsync();
                            using var doc = JsonDocument.Parse(json);
                            if (doc.RootElement.TryGetProperty("id", out var idProp))
                            {
                                interview.GoogleCalendarEventId = idProp.GetString();
                            }
                            if (doc.RootElement.TryGetProperty("htmlLink", out var linkProp))
                            {
                                interview.GoogleCalendarHtmlLink = linkProp.GetString();
                                directWebUrl = interview.GoogleCalendarHtmlLink ?? directWebUrl;
                            }
                        }
                    }
                    catch
                    {
                        // Fallback to direct web URL link if API call fails
                    }
                }
            }


            // Update local database record as synced to Google Calendar
            interview.IsSyncedToGoogleCalendar = true;
            interview.GoogleCalendarHtmlLink = directWebUrl;
            if (string.IsNullOrEmpty(interview.GoogleCalendarEventId))
            {
                interview.GoogleCalendarEventId = $"gcal-evt-{interview.Id}";
            }

            await _context.SaveChangesAsync();


            return new SyncInterviewResultDto
            {
                InterviewId = interviewId,
                Success = true,
                EventId = interview.GoogleCalendarEventId,
                HtmlLink = directWebUrl,
                DirectWebCalendarUrl = directWebUrl,
                Message = $"Successfully synced interview with {candidateName} to Google Calendar."
            };
        }

        public async Task<List<SyncInterviewResultDto>> SyncAllInterviewsAsync(Guid userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return new List<SyncInterviewResultDto>();

            // Get interviews associated with jobs in the manager's department or created by recruiter
            var interviews = await _context.Interviews
                .Include(i => i.JobApplication)
                .ThenInclude(a => a.CandidateProfile)
                .ThenInclude(cp => cp.User)
                .Include(i => i.JobApplication)
                .ThenInclude(a => a.JobPosting)
                .Where(i => user.DepartmentId == null || i.JobApplication.JobPosting.DepartmentId == user.DepartmentId)
                .ToListAsync();

            var results = new List<SyncInterviewResultDto>();
            foreach (var interview in interviews)
            {
                var result = await SyncInterviewAsync(userId, interview.Id);
                results.Add(result);
            }

            return results;
        }

        public string GenerateDirectCalendarUrl(Interview interview, string candidateName, string jobTitle)
        {
            var startUtc = interview.ScheduledAt;
            var endUtc = startUtc.AddMinutes(interview.DurationMinutes > 0 ? interview.DurationMinutes : 60);

            // ISO 8601 string format without punctuation for Google Calendar template action: YYYYMMDDTHHMMSSZ
            var datesParam = $"{startUtc:yyyyMMddTHHmmssZ}/{endUtc:yyyyMMddTHHmmssZ}";
            var title = $"Interview: {candidateName} - {jobTitle}";

            var detailsSb = new StringBuilder();
            detailsSb.AppendLine($"Role: {jobTitle}");
            detailsSb.AppendLine($"Candidate: {candidateName}");
            detailsSb.AppendLine($"Format: {interview.InterviewType}");
            if (!string.IsNullOrWhiteSpace(interview.MeetingLink))
            {
                detailsSb.AppendLine($"Meeting Link: {interview.MeetingLink}");
            }
            if (!string.IsNullOrWhiteSpace(interview.Notes))
            {
                detailsSb.AppendLine($"Notes / Focus: {interview.Notes}");
            }
            detailsSb.AppendLine($"Scheduled via TalentPortal AI Recruitment Platform");

            var location = !string.IsNullOrWhiteSpace(interview.MeetingLink)
                ? interview.MeetingLink
                : (!string.IsNullOrWhiteSpace(interview.Location) ? interview.Location : interview.InterviewType);

            return $"https://calendar.google.com/calendar/render?action=TEMPLATE" +
                   $"&text={HttpUtility.UrlEncode(title)}" +
                   $"&dates={datesParam}" +
                   $"&details={HttpUtility.UrlEncode(detailsSb.ToString())}" +
                   $"&location={HttpUtility.UrlEncode(location)}";
        }

        private async Task<string?> EnsureValidAccessTokenAsync(GoogleCalendarIntegration integration)
        {
            if (string.IsNullOrWhiteSpace(integration.RefreshToken))
            {
                return integration.AccessToken;
            }

            if (integration.TokenExpiresAt.HasValue && integration.TokenExpiresAt.Value > DateTime.UtcNow.AddMinutes(5) && !string.IsNullOrWhiteSpace(integration.AccessToken))
            {
                return integration.AccessToken;
            }

            var clientId = _configuration["GoogleCalendar:ClientId"];
            var clientSecret = _configuration["GoogleCalendar:ClientSecret"];
            if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            {
                return integration.AccessToken;
            }

            try
            {
                var refreshParams = new Dictionary<string, string>
                {
                    { "client_id", clientId },
                    { "client_secret", clientSecret },
                    { "refresh_token", integration.RefreshToken },
                    { "grant_type", "refresh_token" }
                };

                var response = await _httpClient.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(refreshParams));
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(json);
                    if (doc.RootElement.TryGetProperty("access_token", out var tokenProp))
                    {
                        integration.AccessToken = tokenProp.GetString();
                        if (doc.RootElement.TryGetProperty("expires_in", out var expProp))
                        {
                            integration.TokenExpiresAt = DateTime.UtcNow.AddSeconds(expProp.GetInt32());
                        }
                        integration.UpdatedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                    }
                }
            }
            catch
            {
                // Fallback to existing token
            }

            return integration.AccessToken;
        }
    }
}

