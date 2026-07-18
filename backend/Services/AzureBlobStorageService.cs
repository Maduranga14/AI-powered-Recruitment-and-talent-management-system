using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class AzureBlobStorageService : ICloudStorageService
    {
        private readonly string? _connectionString;
        private readonly string _containerName;
        private readonly IWebHostEnvironment _env;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AzureBlobStorageService> _logger;
        private string WebRoot => _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");

        public AzureBlobStorageService(
            IConfiguration config,
            IWebHostEnvironment env,
            IHttpContextAccessor httpContextAccessor,
            ILogger<AzureBlobStorageService> logger)
        {
            var section = config.GetSection("AzureBlobSettings");
            _connectionString = section["ConnectionString"];
            _containerName = section["ContainerName"] ?? "talentportal-resumes";
            
            _env = env;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
        {
            if (string.IsNullOrWhiteSpace(_connectionString))
            {
                _logger.LogWarning("Azure Blob Storage ConnectionString is not configured. Falling back to local disk storage.");
                
                var uploadsDir = Path.Combine(WebRoot, "uploads", "resumes");
                Directory.CreateDirectory(uploadsDir);

                var filePath = Path.Combine(uploadsDir, fileName);
                await using (var fileDestStream = new FileStream(filePath, FileMode.Create))
                {
                    await fileStream.CopyToAsync(fileDestStream);
                }

                var relativePath = $"/uploads/resumes/{fileName}";
                var request = _httpContextAccessor.HttpContext?.Request;
                return request != null
                    ? $"{request.Scheme}://{request.Host}{relativePath}"
                    : relativePath;
            }

            try
            {
                var blobServiceClient = new BlobServiceClient(_connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

                var blobClient = containerClient.GetBlobClient(fileName);
                await blobClient.UploadAsync(fileStream, new BlobUploadOptions
                {
                    HttpHeaders = new BlobHttpHeaders { ContentType = contentType }
                });

                return blobClient.Uri.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload file to Azure Blob Storage.");
                throw;
            }
        }

        public async Task DeleteFileAsync(string fileUrl)
        {
            if (string.IsNullOrWhiteSpace(fileUrl)) return;

            // Check if this is an Azure Blob Storage URL
            if (fileUrl.Contains("blob.core.windows.net", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(_connectionString))
                {
                    _logger.LogWarning("Azure Blob Storage ConnectionString is not configured. Cannot delete file from Azure: {Url}", fileUrl);
                    return;
                }

                try
                {
                    var blobUri = new Uri(fileUrl);
                    var blobServiceClient = new BlobServiceClient(_connectionString);
                    var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
                    
                    // The blob name is the path after the container name
                    // e.g., https://myaccount.blob.core.windows.net/mycontainer/myblob.pdf -> myblob.pdf
                    var segments = blobUri.Segments;
                    if (segments.Length > 2)
                    {
                        var blobName = string.Join("", segments.Skip(2));
                        var blobClient = containerClient.GetBlobClient(Uri.UnescapeDataString(blobName));
                        await blobClient.DeleteIfExistsAsync();
                        _logger.LogInformation("Deleted file from Azure Blob Storage: {BlobName}", blobName);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to delete file from Azure Blob Storage: {Url}", fileUrl);
                }
            }
            else
            {
                // Local fallback deletion
                try
                {
                    string relativePath;
                    if (Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri))
                        relativePath = uri.AbsolutePath;
                    else
                        relativePath = fileUrl;

                    var diskPath = Path.Combine(WebRoot, relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

                    if (File.Exists(diskPath))
                    {
                        File.Delete(diskPath);
                        _logger.LogInformation("Deleted local file: {Path}", diskPath);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to delete local fallback file: {Url}", fileUrl);
                }
            }
        }
    }
}
