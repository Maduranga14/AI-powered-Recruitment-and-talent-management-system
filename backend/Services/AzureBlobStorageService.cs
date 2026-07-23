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

        private readonly string _photoContainerName;

        public AzureBlobStorageService(
            IConfiguration config,
            IWebHostEnvironment env,
            IHttpContextAccessor httpContextAccessor,
            ILogger<AzureBlobStorageService> logger)
        {
            var section = config.GetSection("AzureBlobSettings");
            _connectionString = section["ConnectionString"];
            _containerName = section["ContainerName"] ?? "candidate-resumes";
            _photoContainerName = section["PhotoContainerName"] ?? "candidate-photos";
            
            _env = env;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string? targetContainer = null)
        {
            var containerToUse = !string.IsNullOrWhiteSpace(targetContainer)
                ? targetContainer
                : (fileName.StartsWith("photo_") ? _photoContainerName : _containerName);

            if (string.IsNullOrWhiteSpace(_connectionString))
            {
                _logger.LogWarning("Azure Blob Storage ConnectionString is not configured. Falling back to local disk storage.");
                
                var uploadsSubDir = containerToUse.Contains("photo") ? "photos" : "resumes";
                var uploadsDir = Path.Combine(WebRoot, "uploads", uploadsSubDir);
                Directory.CreateDirectory(uploadsDir);

                var filePath = Path.Combine(uploadsDir, fileName);
                await using (var fileDestStream = new FileStream(filePath, FileMode.Create))
                {
                    await fileStream.CopyToAsync(fileDestStream);
                }

                var relativePath = $"/uploads/{uploadsSubDir}/{fileName}";
                var request = _httpContextAccessor.HttpContext?.Request;
                return request != null
                    ? $"{request.Scheme}://{request.Host}{relativePath}"
                    : relativePath;
            }

            try
            {
                var blobServiceClient = new BlobServiceClient(_connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(containerToUse);

                try
                {
                    await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);
                }
                catch
                {
                    await containerClient.CreateIfNotExistsAsync();
                }

                var blobClient = containerClient.GetBlobClient(fileName);
                if (fileStream.CanSeek)
                {
                    fileStream.Position = 0;
                }

                await blobClient.UploadAsync(fileStream, new BlobUploadOptions
                {
                    HttpHeaders = new BlobHttpHeaders { ContentType = contentType }
                });

                _logger.LogInformation("Successfully uploaded file to Azure Blob Container '{Container}': {Uri}", containerToUse, blobClient.Uri);
                return blobClient.Uri.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload file to Azure Blob Storage Container '{Container}'. Falling back to local storage.", containerToUse);

                var uploadsSubDir = containerToUse.Contains("photo") ? "photos" : "resumes";
                var uploadsDir = Path.Combine(WebRoot, "uploads", uploadsSubDir);
                Directory.CreateDirectory(uploadsDir);

                var filePath = Path.Combine(uploadsDir, fileName);
                if (fileStream.CanSeek)
                {
                    fileStream.Position = 0;
                }

                await using (var fileDestStream = new FileStream(filePath, FileMode.Create))
                {
                    await fileStream.CopyToAsync(fileDestStream);
                }

                var relativePath = $"/uploads/{uploadsSubDir}/{fileName}";
                var request = _httpContextAccessor.HttpContext?.Request;
                return request != null
                    ? $"{request.Scheme}://{request.Host}{relativePath}"
                    : relativePath;
            }
        }

        public async Task DeleteFileAsync(string fileUrl)
        {
            if (string.IsNullOrWhiteSpace(fileUrl)) return;

           
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
                    
                    
                    var segments = blobUri.Segments;
                    if (segments.Length >= 3)
                    {
                        var containerName = segments[1].TrimEnd('/');
                        var blobName = string.Join("", segments.Skip(2));
                        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                        var blobClient = containerClient.GetBlobClient(Uri.UnescapeDataString(blobName));
                        await blobClient.DeleteIfExistsAsync();
                        _logger.LogInformation("Deleted file from Azure Container '{Container}': {BlobName}", containerName, blobName);
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
