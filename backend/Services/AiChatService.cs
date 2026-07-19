using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Data;
using backend.DTOs.Chat;
using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public class AiChatService(
        AppDbContext db,
        IHttpClientFactory httpClientFactory,
        IOptions<OpenAiSettings> openAiOptions) : IAiChatService
    {
        private readonly AppDbContext _db = db;
        private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
        private readonly OpenAiSettings _settings = openAiOptions.Value;

        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public async Task<List<ChatConversationSummaryDto>> GetConversationsAsync(Guid userId)
        {
            return await _db.ChatConversations
                .AsNoTracking()
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.UpdatedAt)
                .Select(c => new ChatConversationSummaryDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    MessageCount = c.Messages.Count(m => m.Role != "system"),
                    LastMessagePreview = c.Messages
                        .Where(m => m.Role != "system")
                        .OrderByDescending(m => m.CreatedAt)
                        .Select(m => m.Content)
                        .FirstOrDefault()
                })
                .Take(40)
                .ToListAsync();
        }

        public async Task<ChatConversationDetailDto> GetConversationAsync(Guid userId, Guid conversationId)
        {
            var conversation = await _db.ChatConversations
                .AsNoTracking()
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId)
                ?? throw new KeyNotFoundException("Conversation not found.");

            return new ChatConversationDetailDto
            {
                Id = conversation.Id,
                Title = conversation.Title,
                CreatedAt = conversation.CreatedAt,
                UpdatedAt = conversation.UpdatedAt,
                Messages = conversation.Messages
                    .Where(m => m.Role != "system")
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => new ChatMessageDto
                    {
                        Id = m.Id,
                        Role = m.Role,
                        Content = m.Content,
                        CreatedAt = m.CreatedAt
                    })
                    .ToList()
            };
        }

        public async Task DeleteConversationAsync(Guid userId, Guid conversationId)
        {
            var conversation = await _db.ChatConversations
                .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId)
                ?? throw new KeyNotFoundException("Conversation not found.");

            _db.ChatConversations.Remove(conversation);
            await _db.SaveChangesAsync();
        }

        public ChatSuggestionsDto GetSuggestions(UserRole role, string? displayName)
        {
            var first = string.IsNullOrWhiteSpace(displayName)
                ? "there"
                : displayName.Split(' ', StringSplitOptions.RemoveEmptyEntries)[0];

            return role switch
            {
                UserRole.Recruiter => new ChatSuggestionsDto
                {
                    AssistantName = "TalentPortal AI",
                    Greeting = $"Hi {first} — I can help you hire faster. What do you need?",
                    Suggestions =
                    [
                        "How do I create and publish a job posting?",
                        "How do I invite a hiring manager?",
                        "How do I review applicants for a role?",
                        "Tips to write a stronger job description"
                    ]
                },
                UserRole.HiringManager => new ChatSuggestionsDto
                {
                    AssistantName = "TalentPortal AI",
                    Greeting = $"Hi {first} — ready to help with interviews and feedback.",
                    Suggestions =
                    [
                        "How do I leave interview feedback?",
                        "What should I look for in shortlisted candidates?",
                        "How does the hiring calendar work?",
                        "Best practices for structured interviews"
                    ]
                },
                UserRole.Admin => new ChatSuggestionsDto
                {
                    AssistantName = "TalentPortal AI",
                    Greeting = $"Hi {first} — I can help with platform administration.",
                    Suggestions =
                    [
                        "How do I approve pending recruiters?",
                        "How do organizations and departments work?",
                        "What moderation tools are available?",
                        "Summarize admin responsibilities on TalentPortal"
                    ]
                },
                _ => new ChatSuggestionsDto
                {
                    AssistantName = "TalentPortal AI",
                    Greeting = $"Hi {first} — I'm your career assistant. How can I help today?",
                    Suggestions =
                    [
                        "How do I improve my profile for better matches?",
                        "How do I apply to a job?",
                        "How can I track my applications?",
                        "What makes a strong cover note?"
                    ]
                }
            };
        }

        public async Task<SendChatResponseDto> SendMessageAsync(
            Guid userId, UserRole role, string? displayName, SendChatMessageDto dto)
        {
            var content = dto.Message.Trim();
            if (string.IsNullOrWhiteSpace(content))
                throw new ArgumentException("Message cannot be empty.");

            ChatConversation conversation;
            if (dto.ConversationId.HasValue)
            {
                conversation = await _db.ChatConversations
                    .Include(c => c.Messages)
                    .FirstOrDefaultAsync(c => c.Id == dto.ConversationId.Value && c.UserId == userId)
                    ?? throw new KeyNotFoundException("Conversation not found.");
            }
            else
            {
                conversation = new ChatConversation
                {
                    UserId = userId,
                    Title = BuildTitle(content),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _db.ChatConversations.Add(conversation);
                await _db.SaveChangesAsync();
            }

            var userMessage = new ChatMessage
            {
                ConversationId = conversation.Id,
                Role = "user",
                Content = content,
                CreatedAt = DateTime.UtcNow
            };
            _db.ChatMessages.Add(userMessage);

            var history = conversation.Messages
                .Where(m => m.Role is "user" or "assistant")
                .OrderBy(m => m.CreatedAt)
                .Select(m => new OpenAiChatMessage { Role = m.Role, Content = m.Content })
                .ToList();

            history.Add(new OpenAiChatMessage { Role = "user", Content = content });

            var maxHistory = Math.Max(4, _settings.MaxHistoryMessages);
            if (history.Count > maxHistory)
                history = history.TakeLast(maxHistory).ToList();

            var (assistantText, usedFallback) = await GenerateAssistantReplyAsync(
                role, displayName, history);

            var assistantMessage = new ChatMessage
            {
                ConversationId = conversation.Id,
                Role = "assistant",
                Content = assistantText,
                CreatedAt = DateTime.UtcNow
            };
            _db.ChatMessages.Add(assistantMessage);

            if (conversation.Title == "New conversation")
                conversation.Title = BuildTitle(content);

            conversation.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return new SendChatResponseDto
            {
                ConversationId = conversation.Id,
                ConversationTitle = conversation.Title,
                UsedFallback = usedFallback,
                UserMessage = new ChatMessageDto
                {
                    Id = userMessage.Id,
                    Role = userMessage.Role,
                    Content = userMessage.Content,
                    CreatedAt = userMessage.CreatedAt
                },
                AssistantMessage = new ChatMessageDto
                {
                    Id = assistantMessage.Id,
                    Role = assistantMessage.Role,
                    Content = assistantMessage.Content,
                    CreatedAt = assistantMessage.CreatedAt
                }
            };
        }

        private async Task<(string Text, bool UsedFallback)> GenerateAssistantReplyAsync(
            UserRole role,
            string? displayName,
            List<OpenAiChatMessage> history)
        {
            var latestUserMessage = history.LastOrDefault(m => m.Role == "user")?.Content
                ?? history.LastOrDefault()?.Content
                ?? string.Empty;

            var apiKey = ResolveApiKey();
            if (string.IsNullOrWhiteSpace(apiKey))
                return (BuildConversationalReply(role, latestUserMessage), true);

            try
            {
                var client = _httpClientFactory.CreateClient("OpenAI");
                var payload = new Dictionary<string, object?>
                {
                    ["model"] = string.IsNullOrWhiteSpace(_settings.Model) ? "gpt-4o-mini" : _settings.Model,
                    ["temperature"] = _settings.Temperature <= 0 ? 0.7 : _settings.Temperature,
                    ["messages"] = new object[]
                    {
                        new { role = "system", content = BuildSystemPrompt(role, displayName) }
                    }.Concat(history.Select(m => new { role = m.Role, content = m.Content })).ToArray()
                };

                using var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
                {
                    Content = new StringContent(JsonSerializer.Serialize(payload, JsonOpts), Encoding.UTF8, "application/json")
                };
                request.Headers.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

                using var response = await client.SendAsync(request);
                var body = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    // Still answer the user — never leave them without a reply
                    return (BuildConversationalReply(role, latestUserMessage), true);
                }

                using var doc = JsonDocument.Parse(body);
                var text = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(text))
                    return (BuildConversationalReply(role, latestUserMessage), true);

                return (text.Trim(), false);
            }
            catch
            {
                return (BuildConversationalReply(role, latestUserMessage), true);
            }
        }

        private string ResolveApiKey()
        {
            if (!string.IsNullOrWhiteSpace(_settings.ApiKey))
                return _settings.ApiKey.Trim();

            return Environment.GetEnvironmentVariable("OPENAI_API_KEY")
                ?? Environment.GetEnvironmentVariable("TalentPortal_OpenAI__ApiKey")
                ?? string.Empty;
        }

        private static string BuildSystemPrompt(UserRole role, string? displayName)
        {
            var name = string.IsNullOrWhiteSpace(displayName) ? "the user" : displayName;
            var roleLabel = role switch
            {
                UserRole.Recruiter => "Recruiter",
                UserRole.HiringManager => "Hiring Manager",
                UserRole.Admin => "Platform Admin",
                _ => "Candidate"
            };

            return $"""
                You are TalentPortal AI — a friendly, capable assistant inside an AI-powered recruitment and talent management platform.

                User: {name}
                Role: {roleLabel}

                You can answer ANY question the user asks — general knowledge, advice, brainstorming, writing help, explanations, or TalentPortal how-tos.
                When the topic relates to recruiting, careers, or this product, prioritize practical TalentPortal guidance:
                - Candidates: profile, resume, jobs, applications, cover notes, dashboard
                - Recruiters: create/publish jobs, applicants, hiring-manager invites, departments
                - Hiring managers: candidate review, interview feedback, calendar
                - Admins: pending recruiter approvals, people/orgs, moderation

                Style:
                - Always reply helpfully to the user's actual message (never ignore it).
                - Be clear, warm, and professional. Use short paragraphs or numbered steps when useful.
                - Never invent private user data or claim you changed database records.
                - If a task requires the UI, explain exactly where to click in TalentPortal.
                """;
        }

        /// <summary>
        /// Always produces a real reply for any user message (used when OpenAI is unavailable).
        /// </summary>
        private static string BuildConversationalReply(UserRole role, string userMessage)
        {
            var raw = (userMessage ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(raw))
                return "I'm here — send me a message and I'll help with anything you need.";

            var q = raw.ToLowerInvariant();

            // Greetings
            if (IsMatch(q, "^(hi|hello|hey|good morning|good afternoon|good evening)\\b"))
            {
                var first = role switch
                {
                    UserRole.Recruiter => "I can help with jobs, applicants, and hiring workflows.",
                    UserRole.HiringManager => "I can help with interviews, feedback, and candidate reviews.",
                    UserRole.Admin => "I can help with approvals, people, and platform admin tasks.",
                    _ => "I can help with your profile, job search, applications, or anything else on your mind."
                };
                return $"Hello! {first} What would you like to talk about?";
            }

            if (IsMatch(q, "^(thanks|thank you|thx)\\b"))
                return "You're welcome! Anytime you need help — recruiting questions or anything else — just ask.";

            if (q is "ok" or "okay" or "k" or "cool" or "nice" or "great")
                return "Glad that works. What should we tackle next?";

            // Platform-specific shortcuts
            if (q.Contains("apply") || q.Contains("application"))
            {
                return role == UserRole.Candidate
                    ? "To apply: open Jobs, choose a role, click Apply now, attach your resume, add an optional note, then submit. Track status under Dashboard → Applications.\n\nWant help drafting a cover note for a specific role?"
                    : "Candidates apply from Jobs pages. From your workspace you review applicants in the pipeline instead of applying yourself. Need help finding an applicant list?";
            }

            if (q.Contains("resume") || q.Contains("cv") || (q.Contains("profile") && q.Contains("update")))
            {
                return "Open Dashboard → Profile to update your headline, skills, experience, and upload a PDF/DOCX resume (max 5 MB). A complete profile improves match quality.\n\nTell me what section you want to improve and I’ll suggest wording.";
            }

            if (q.Contains("job") && (q.Contains("create") || q.Contains("post") || q.Contains("publish")))
            {
                return "Recruiters create roles via Recruiter → Jobs → Create job. Add title, location, description, and requirements, then publish. Applicants show up under View applicants.\n\nI can help you outline a job description if you share the role title.";
            }

            if (q.Contains("hiring manager") || q.Contains("invite"))
            {
                return "Invite hiring managers from Recruiter → Hiring Managers → Invite. They get an email link to join your organization.\n\nNeed sample invite wording?";
            }

            if (q.Contains("approve") || q.Contains("pending recruiter"))
            {
                return "Admins approve recruiter sign-ups under Admin → Pending Approvals. Approve to activate, or reject if invalid.";
            }

            // Writing / brainstorm requests
            if (q.Contains("write") || q.Contains("draft") || q.Contains("rewrite") || q.Contains("improve"))
            {
                return $"Happy to help with that. Based on what you said — \"{Truncate(raw, 160)}\" — here's a solid starting draft:\n\n" +
                       $"{DraftFromPrompt(raw, role)}\n\n" +
                       "Tell me the tone you want (formal, friendly, shorter) and I’ll refine it.";
            }

            // Questions
            if (raw.Contains('?') || IsMatch(q, "^(how|what|why|when|where|who|which|can|could|should|is|are|do|does|did)\\b"))
            {
                return AnswerQuestion(role, raw, q);
            }

            // Default: always acknowledge and respond to the actual message
            return $"Got it — you said: \"{Truncate(raw, 220)}\".\n\n" +
                   $"{ContinueConversation(role, q)}\n\n" +
                   "Ask me anything else — careers, TalentPortal steps, writing help, or general questions.";
        }

        private static string AnswerQuestion(UserRole role, string raw, string q)
        {
            if (q.Contains("who are you") || q.Contains("what are you") || q.Contains("your name"))
                return "I'm TalentPortal AI, your in-app assistant. I can help with this hiring platform and also answer general questions, brainstorm, or help you write.";

            if (q.Contains("help"))
            {
                return role switch
                {
                    UserRole.Recruiter =>
                        "I can help you create jobs, review applicants, invite hiring managers, manage departments, or answer general questions. What do you need right now?",
                    UserRole.HiringManager =>
                        "I can help with candidate reviews, interview feedback, calendar tips, or any other question. Where should we start?",
                    UserRole.Admin =>
                        "I can help with recruiter approvals, people/organizations, moderation, or general questions. What’s on your plate?",
                    _ =>
                        "I can help you improve your profile, find jobs, apply, track applications, write notes, or answer almost anything else. What do you need?"
                };
            }

            return $"Good question. Here’s a direct take on \"{Truncate(raw, 180)}\":\n\n" +
                   $"{ContinueConversation(role, q)}\n\n" +
                   "If you want a deeper answer, add more detail (goal, role, or constraints) and I’ll expand.";
        }

        private static string ContinueConversation(UserRole role, string q)
        {
            if (q.Contains("salary") || q.Contains("pay") || q.Contains("compensation"))
                return "For compensation, compare market ranges for the role/location, be transparent when posting jobs, and for candidates negotiate with evidence (skills, impact, competing offers). On TalentPortal, salary can be set when creating a job.";

            if (q.Contains("interview"))
                return "Strong interviews are structured: same core questions per candidate, score against the job criteria, and capture feedback quickly. Hiring managers can leave feedback in their workspace; recruiters can move stages from the applicants list.";

            if (q.Contains("skill") || q.Contains("learn") || q.Contains("career"))
                return "Focus on skills that match the roles you want, show proof (projects/outcomes), and keep your TalentPortal profile skills list current so matching stays accurate.";

            if (q.Contains("joke") || q.Contains("funny"))
                return "Why did the recruiter bring a ladder to the interview? To help the candidate reach the next level. Want another, or shall we get back to hiring?";

            return role switch
            {
                UserRole.Recruiter =>
                    "From a recruiting angle, clarify the outcome you want (source, screen, schedule, or hire) and I can give concrete next steps in TalentPortal.",
                UserRole.HiringManager =>
                    "As a hiring manager, the fastest path is usually: review the shortlist, leave clear feedback, and confirm next interview steps with your recruiter.",
                UserRole.Admin =>
                    "As an admin, check Pending Approvals and People/Organizations if this is an access issue — or tell me what you’re trying to change and I’ll walk you through it.",
                _ =>
                    "A practical next step: make sure your profile and resume are up to date, then browse Jobs for roles that match your skills. I can also help rewrite a headline or cover note."
            };
        }

        private static string DraftFromPrompt(string raw, UserRole role)
        {
            var topic = Truncate(raw, 100);
            if (role == UserRole.Candidate || raw.ToLowerInvariant().Contains("cover") || raw.ToLowerInvariant().Contains("note"))
            {
                return "I'm excited to apply for this opportunity. My background aligns well with the role’s requirements, and I’d welcome the chance to contribute and grow with your team. I’d be glad to share more detail in an interview.";
            }

            return $"Draft based on your request ({topic}):\n\nPlease find a clear, professional summary of the key points below. I’m happy to adjust length, tone, or audience on request.";
        }

        private static bool IsMatch(string input, string pattern) =>
            System.Text.RegularExpressions.Regex.IsMatch(input, pattern, System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        private static string Truncate(string value, int max)
        {
            var cleaned = value.Replace('\n', ' ').Trim();
            if (cleaned.Length <= max) return cleaned;
            return cleaned[..(max - 1)].TrimEnd() + "…";
        }

        private static string BuildTitle(string firstMessage)
        {
            var cleaned = firstMessage.Trim().Replace('\n', ' ');
            if (cleaned.Length <= 48) return cleaned;
            return cleaned[..45].TrimEnd() + "…";
        }

        private sealed class OpenAiChatMessage
        {
            public string Role { get; set; } = "user";
            public string Content { get; set; } = string.Empty;
        }
    }
}
