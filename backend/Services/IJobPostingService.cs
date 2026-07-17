using backend.DTOs.Jobs;
using backend.Models.Enums;

namespace backend.Services
{
    public interface IJobPostingService
    {
        
        Task<JobPostingDetailDto> CreateAsync(CreateJobPostingDto dto, Guid recruiterId);

        
        Task<PagedJobsDto> GetByRecruiterAsync(Guid recruiterId, JobStatus? status, int page, int pageSize);

        
        Task<JobPostingDetailDto> GetDetailAsync(Guid id, Guid recruiterId);

        
        Task<JobPostingDetailDto> UpdateAsync(Guid id, UpdateJobPostingDto dto, Guid recruiterId);

       
        Task<JobPostingDetailDto> ChangeStatusAsync(Guid id, JobStatus newStatus, Guid recruiterId);

        
        Task DeleteAsync(Guid id, Guid recruiterId);

        
        Task<List<PublicJobPageDto>> GetPublishedJobsAsync(string? keyword, string? location, EmploymentType? type);

        
        Task<PublicJobPageDto> GetPublicJobPageAsync(Guid id);
    }
}
