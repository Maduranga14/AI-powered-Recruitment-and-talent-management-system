namespace backend.DTOs
{
    public class GoogleCalendarStatusDto
    {
        public bool IsConnected { get; set; }
        public string? GoogleEmail { get; set; }
        public DateTime? ConnectedAt { get; set; }
        public bool AutoSyncInterviews { get; set; } = true;
        public string CalendarId { get; set; } = "primary";
        public bool ClientIdConfigured { get; set; }
        public string? AuthUrl { get; set; }
    }

    public class ConnectGoogleCalendarRequest
    {
        public string? AuthorizationCode { get; set; }
        public string? Email { get; set; }
        public bool AutoSyncInterviews { get; set; } = true;
    }

    public class UpdateGoogleCalendarSettingsRequest
    {
        public bool AutoSyncInterviews { get; set; } = true;
        public string? CalendarId { get; set; } = "primary";
    }

    public class SyncInterviewResultDto
    {
        public Guid InterviewId { get; set; }
        public bool Success { get; set; }
        public string? EventId { get; set; }
        public string? HtmlLink { get; set; }
        public string DirectWebCalendarUrl { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
