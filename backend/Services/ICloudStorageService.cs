namespace backend.Services
{
    public interface ICloudStorageService
    {
        /// <summary>
        /// Uploads a file stream to cloud storage and returns the public URL.
        /// </summary>
        Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);

        /// <summary>
        /// Deletes a file from cloud storage given its URL.
        /// </summary>
        Task DeleteFileAsync(string fileUrl);
    }
}
