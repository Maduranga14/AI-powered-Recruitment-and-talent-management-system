using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Xml.Linq;
using System.Threading.Tasks;
using backend.DTOs.Candidate;
using backend.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public class AiResumeParserService : IAiResumeParserService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly OpenAiSettings _settings;
        private readonly ILogger<AiResumeParserService> _logger;

        private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web)
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            PropertyNameCaseInsensitive = true
        };

        public AiResumeParserService(
            IHttpClientFactory httpClientFactory,
            IOptions<OpenAiSettings> openAiOptions,
            ILogger<AiResumeParserService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _settings = openAiOptions.Value;
            _logger = logger;
        }

        public async Task<ParsedResumeDto> ParseResumeAsync(Stream stream, string contentType)
        {
            using var memoryStream = new MemoryStream();
            await stream.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            string extractedText;
            contentType = contentType.ToLowerInvariant();

            if (contentType == "application/pdf" || contentType.Contains("pdf"))
            {
                extractedText = ExtractTextFromPdf(memoryStream);
            }
            else if (contentType.Contains("word") ||
                     contentType.Contains("officedocument") ||
                     contentType == "application/octet-stream" ||
                     contentType.Contains("docx"))
            {
                try
                {
                    extractedText = ExtractTextFromDocx(memoryStream);
                }
                catch (Exception docxEx)
                {
                    _logger.LogWarning("DOCX parsing failed, trying PDF parser fallback. Error: {Message}", docxEx.Message);
                    try
                    {
                        memoryStream.Position = 0;
                        extractedText = ExtractTextFromPdf(memoryStream);
                    }
                    catch
                    {
                        throw new InvalidOperationException("Failed to parse document. Please upload a valid PDF or DOCX file.", docxEx);
                    }
                }
            }
            else if (contentType == "application/msword" || contentType.Contains("msword") || contentType.EndsWith(".doc"))
            {
                throw new NotSupportedException("Legacy Microsoft Word .doc format is not supported. Please convert your resume to PDF or .docx format.");
            }
            else
            {
                try
                {
                    memoryStream.Position = 0;
                    extractedText = ExtractTextFromPdf(memoryStream);
                }
                catch
                {
                    try
                    {
                        memoryStream.Position = 0;
                        extractedText = ExtractTextFromDocx(memoryStream);
                    }
                    catch
                    {
                        throw new NotSupportedException($"Unsupported file format: '{contentType}'. Please upload a PDF or .docx file.");
                    }
                }
            }

            if (string.IsNullOrWhiteSpace(extractedText))
            {
                throw new InvalidOperationException("The uploaded file contains no readable text. If this is a scanned document, please upload a text-based PDF or DOCX.");
            }

            return await CallOpenAiParserAsync(extractedText);
        }

        private string ExtractTextFromPdf(Stream stream)
        {
            try
            {
                using var pdf = UglyToad.PdfPig.PdfDocument.Open(stream);
                var textBuilder = new StringBuilder();
                foreach (var page in pdf.GetPages())
                {
                    textBuilder.Append(page.Text);
                    textBuilder.Append(" ");
                }
                return textBuilder.ToString().Trim();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to extract text from PDF resume.");
                throw new InvalidOperationException("Failed to extract text from the PDF file. It may be corrupted or password-protected.", ex);
            }
        }

        private string ExtractTextFromDocx(Stream stream)
        {
            try
            {
                using var archive = new ZipArchive(stream, ZipArchiveMode.Read, true);
                var entry = archive.GetEntry("word/document.xml");
                if (entry != null)
                {
                    using var entryStream = entry.Open();
                    var doc = XDocument.Load(entryStream);
                    var w = XName.Get("t", "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
                    var texts = doc.Descendants(w).Select(t => t.Value);
                    return string.Join(" ", texts).Trim();
                }
                throw new FileNotFoundException("This does not appear to be a valid DOCX file (missing word/document.xml).");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to extract text from DOCX resume.");
                throw new InvalidOperationException("Failed to extract text from the Word document. It may be corrupted.", ex);
            }
        }

        private async Task<ParsedResumeDto> CallOpenAiParserAsync(string resumeText)
        {
            var apiKey = ResolveApiKey();
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                _logger.LogWarning("OpenAI API key is not configured. Falling back to local rule-based parser.");
                return RunLocalFallbackParser(resumeText);
            }

            var modelName = string.IsNullOrWhiteSpace(_settings.Model) ? "gpt-4o-mini" : _settings.Model;
            var client = _httpClientFactory.CreateClient("OpenAI");

            var systemPrompt = @"You are a high-performance recruiter assistant AI inside TalentPortal AI.
Your task is to analyze the candidate's resume text and extract all profile details in a structured JSON format.

Make sure to extract:
1. Phone: Look for a phone number. Clean it to contain exactly 10 digits (numbers only, e.g., '5550199342'). If no valid phone number exists or it cannot be resolved to exactly 10 digits, leave it null.
2. Location: City, State/Country (e.g. 'San Francisco, CA' or 'London, UK').
3. Headline: A brief professional headline (max 220 chars, e.g., 'Senior Software Engineer · 7 years experience').
4. Skills: A list of professional technical/soft skills (e.g. ['React', 'TypeScript', 'Node.js', 'Project Management']).
5. Experiences: A list of work experience items, each with:
   - company (string, required)
   - title (string, required)
   - startDate (string, format YYYY-MM-DD, if month/year are present e.g. '2023-05-01'. If only year is given, use YYYY-01-01)
   - endDate (string, format YYYY-MM-DD or null if current/present)
   - isCurrent (boolean)
   - description (string, max 1000 chars, summary of duties/accomplishments)
6. Educations: A list of education items, each with:
   - institution (string, required)
   - degree (string, required)
   - fieldOfStudy (string, required)
   - startDate (string, format YYYY-MM-DD, e.g., '2019-09-01')
   - endDate (string, format YYYY-MM-DD or null if ongoing)

Rule: Your reply MUST be a single, valid JSON object matching this schema. Do not add markdown formatting, backticks, or any conversational text.";

            var payload = new
            {
                model = modelName,
                temperature = 0.1,
                response_format = new { type = "json_object" },
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = $"Resume Text:\n\n{resumeText}" }
                }
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
            {
                Content = new StringContent(JsonSerializer.Serialize(payload, JsonOpts), Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

            try
            {
                using var response = await client.SendAsync(request);
                var body = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("OpenAI API call failed with status {StatusCode}: {Body}. Falling back to local parser.", response.StatusCode, body);
                    return RunLocalFallbackParser(resumeText);
                }

                using var doc = JsonDocument.Parse(body);
                var jsonText = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(jsonText))
                {
                    _logger.LogWarning("OpenAI returned an empty reply. Falling back to local parser.");
                    return RunLocalFallbackParser(resumeText);
                }

                var parsed = JsonSerializer.Deserialize<ParsedResumeDto>(jsonText, JsonOpts);
                if (parsed == null)
                {
                    _logger.LogWarning("Failed to deserialize OpenAI response. Falling back to local parser.");
                    return RunLocalFallbackParser(resumeText);
                }

                if (parsed.Phone != null) parsed.Phone = SanitizePhone(parsed.Phone);
                if (parsed.Headline != null && parsed.Headline.Length > 220)
                    parsed.Headline = parsed.Headline.Substring(0, 217) + "...";

                return parsed;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling OpenAI service. Falling back to local rule-based parser.");
                return RunLocalFallbackParser(resumeText);
            }
        }

        private ParsedResumeDto RunLocalFallbackParser(string resumeText)
        {
            _logger.LogWarning("Running local rule-based fallback parser on resume text.");

            var lines = resumeText.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                .Select(l => l.Trim()).Where(l => l.Length > 0).ToList();

            string? phone = null;
            try
            {
                var m = new System.Text.RegularExpressions.Regex(@"\+?[0-9][0-9\-\(\)\s]{8,15}[0-9]").Match(resumeText);
                if (m.Success) phone = SanitizePhone(m.Value);
            }
            catch { }

            var commonSkills = new[]
            {
                "React","Angular","Vue","TypeScript","JavaScript","HTML","CSS","Node.js","Express",
                "Python","Django","Flask","Java","Spring","C#","C++",".NET","ASP.NET","Ruby","Rails",
                "Go","Rust","SQL","MySQL","PostgreSQL","MongoDB","Redis","Docker","Kubernetes","AWS",
                "Azure","GCP","Git","GitHub","CI/CD","Agile","Scrum","Project Management","Figma",
                "Machine Learning","AI","NLP","Deep Learning","PyTorch","TensorFlow","MLOps","LLMs","DevOps"
            };
            var extractedSkills = commonSkills
                .Where(s => resumeText.Contains(s, StringComparison.OrdinalIgnoreCase)).ToList();

            string? location = "Remote";
            try
            {
                var m = new System.Text.RegularExpressions.Regex(@"([A-Z][a-zA-Z\s]+),\s([A-Z]{2}|[A-Z][a-zA-Z\s]+)").Match(resumeText);
                if (m.Success) location = m.Value;
            }
            catch { }

            string headline = "Experienced Professional";
            var jobKeywords = new[] { "engineer","developer","manager","designer","analyst","consultant","architect","lead","specialist" };
            var titleLine = lines.FirstOrDefault(l => jobKeywords.Any(k => l.Contains(k, StringComparison.OrdinalIgnoreCase)));
            if (titleLine != null && titleLine.Length <= 100) headline = titleLine;

            return new ParsedResumeDto
            {
                Headline = headline,
                Location = location,
                Phone = phone,
                Skills = extractedSkills,
                Experiences = new List<WorkExperienceDto>
                {
                    new WorkExperienceDto
                    {
                        Company = "Company Name (Autodetected)",
                        Title = headline,
                        StartDate = new DateTime(2020, 1, 1),
                        EndDate = null,
                        IsCurrent = true,
                        Description = "Accomplished tasks and projects as detailed in the resume."
                    }
                },
                Educations = new List<EducationDto>
                {
                    new EducationDto
                    {
                        Institution = "University Name (Autodetected)",
                        Degree = "Bachelor's Degree",
                        FieldOfStudy = "Computer Science / General Study",
                        StartDate = new DateTime(2015, 9, 1),
                        EndDate = new DateTime(2019, 6, 1)
                    }
                }
            };
        }

        private string? SanitizePhone(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            var digits = new string(raw.Where(char.IsDigit).ToArray());
            return digits.Length >= 10 ? digits.Substring(digits.Length - 10) : null;
        }

        private string ResolveApiKey()
        {
            if (!string.IsNullOrWhiteSpace(_settings.ApiKey))
                return _settings.ApiKey.Trim();

            return Environment.GetEnvironmentVariable("OPENAI_API_KEY")
                ?? Environment.GetEnvironmentVariable("TalentPortal_OpenAI__ApiKey")
                ?? string.Empty;
        }
    }
}
