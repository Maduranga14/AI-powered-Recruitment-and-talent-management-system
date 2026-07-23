namespace backend.Services
{
    public interface ICloudStorageService
    {
       
        Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string? targetContainer = null);

        Task DeleteFileAsync(string fileUrl);
    }
}
