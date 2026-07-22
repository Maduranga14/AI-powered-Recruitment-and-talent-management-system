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
            // Buffer the input stream to a seekable MemoryStream to ensure complete reading and seeking support
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
                // Try DOCX parser first, fallback to PDF if stream is actually PDF
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
                throw new NotSupportedException("Legacy Microsoft Word .doc format is not supported for automatic parsing. Please convert your resume to PDF or .docx format.");
            }
            else
            {
                // Fallback attempt: try to parse as PDF first, then DOCX
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
                throw new InvalidOperationException("OpenAI API key is not configured. Please add the ApiKey inside 'OpenAI' configuration in appsettings.json.");
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
                temperature = 0.1, // Low temperature for high precision extraction
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
                    _logger.LogError("OpenAI API call failed with status {StatusCode}: {Body}", response.StatusCode, body);
                    throw new InvalidOperationException($"OpenAI resume parsing request failed: {response.ReasonPhrase}");
                }

                using var doc = JsonDocument.Parse(body);
                var jsonText = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(jsonText))
                {
                    throw new InvalidOperationException("OpenAI returned an empty reply.");
                }

                var parsed = JsonSerializer.Deserialize<ParsedResumeDto>(jsonText, JsonOpts)
                    ?? throw new InvalidOperationException("Failed to deserialize OpenAI JSON response to ParsedResumeDto.");

                // Post-process values for safety
                if (parsed.Phone != null)
                {
                    parsed.Phone = SanitizePhone(parsed.Phone);
                }

                // Limit length of headline
                if (parsed.Headline != null && parsed.Headline.Length > 220)
                {
                    parsed.Headline = parsed.Headline.Substring(0, 217) + "...";
                }

                return parsed;
            }
            catch (Exception ex) when (ex is not InvalidOperationException)
            {
                _logger.LogError(ex, "Failed to call OpenAI service or parse its output.");
                throw new InvalidOperationException("An error occurred while analyzing the resume with AI. Please check your internet connection and API key configurations.", ex);
            }
        }

        private string? SanitizePhone(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            var digits = new string(raw.Where(char.IsDigit).ToArray());
            if (digits.Length >= 10)
            {
                // Take the last 10 digits to match typical local numbers in case of country code prefix
                return digits.Substring(digits.Length - 10);
            }
            return null; // Return null so validation does not fail if it's less than 10 digits
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
