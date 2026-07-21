using backend.DTOs.Admin;

namespace backend.Services
{
    public interface IOrganizationService
    {
        Task<List<OrganizationDto>> GetAllOrganizationsAsync();
        Task<OrganizationDto?> GetOrganizationByIdAsync(Guid id);
        Task<OrganizationDto> CreateOrganizationAsync(CreateOrganizationDto dto);
        Task<OrganizationDto> UpdateOrganizationAsync(Guid id, UpdateOrganizationDto dto);
        Task DeleteOrganizationAsync(Guid id);
    }
}
