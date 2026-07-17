using System.Net;
using System.Net.Mail;
using backend.Models;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public class SmtpEmailService(IOptions<SmtpSettings> smtpSettings, ILogger<SmtpEmailService> logger) : IEmailService
    {
        private readonly SmtpSettings _settings = smtpSettings.Value;
        private readonly ILogger<SmtpEmailService> _logger = logger;

        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            // Fallback for development if SMTP is not configured yet
            if (string.IsNullOrWhiteSpace(_settings.Server) || string.IsNullOrWhiteSpace(_settings.Username))
            {
                _logger.LogWarning("SMTP is not configured. Email to {To} simulated in console.", toEmail);
                Console.WriteLine("\n==================================================");
                Console.WriteLine($"[EMAIL SIMULATION] Sending Email to: {toEmail}");
                Console.WriteLine($"Subject: {subject}");
                Console.WriteLine($"Body: {htmlBody}");
                Console.WriteLine("==================================================\n");
                return;
            }

            try
            {
                // Enforce TLS 1.2 & TLS 1.3 explicitly to prevent Gmail from dropping connection
                System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12 | System.Net.SecurityProtocolType.Tls13;

                using var client = new SmtpClient(_settings.Server, _settings.Port)
                {
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(_settings.Username, _settings.Password),
                    EnableSsl = _settings.EnableSsl
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_settings.SenderEmail, _settings.SenderName),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(toEmail);

                _logger.LogInformation("Sending email to {To} via SMTP server {Server}...", toEmail, _settings.Server);
                await client.SendMailAsync(mailMessage);
                _logger.LogInformation("Email sent successfully to {To}.", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To} via SMTP.", toEmail);
                Console.WriteLine("\n=== SMTP ERROR DETAIL ===");
                Console.WriteLine(ex.ToString());
                Console.WriteLine("=========================\n");
                throw new InvalidOperationException("Email transmission failed. Please try again later or check SMTP server configurations.", ex);
            }
        }
    }
}
