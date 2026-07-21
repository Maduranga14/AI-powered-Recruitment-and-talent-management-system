using backend.Data;
using backend.DTOs.Admin;
using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class OrganizationService(AppDbContext dbContext) : IOrganizationService
    {
        private readonly AppDbContext _db = dbContext;

        public async Task<List<OrganizationDto>> GetAllOrganizationsAsync()
        {
            var orgs = await _db.Organizations
                .Include(o => o.Users)
                .OrderBy(o => o.Name)
                .ToListAsync();

            var activeJobsCount = await _db.JobPostings
                .Where(j => j.Status == JobStatus.Published)
                .ToListAsync();

            return orgs.Select(o => MapToDto(o, activeJobsCount)).ToList();
        }

        public async Task<OrganizationDto?> GetOrganizationByIdAsync(Guid id)
        {
            var org = await _db.Organizations
                .Include(o => o.Users)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (org is null) return null;

            var activeJobsCount = await _db.JobPostings
                .Where(j => j.Status == JobStatus.Published)
                .ToListAsync();

            return MapToDto(org, activeJobsCount);
        }

        public async Task<OrganizationDto> CreateOrganizationAsync(CreateOrganizationDto dto)
        {
            var existing = await _db.Organizations.AnyAsync(o => o.Name.ToLower() == dto.Name.ToLower().Trim());
            if (existing)
                throw new InvalidOperationException($"An organization named '{dto.Name}' already exists.");

            var org = new Organization
            {
                Name = dto.Name.Trim(),
                TaxNumber = dto.TaxNumber.Trim(),
                Website = dto.Website?.Trim(),
                ShortDescription = dto.ShortDescription?.Trim(),
                LogoUrl = dto.LogoUrl?.Trim(),
                Sub = dto.Sub.Trim(),
                Plan = string.IsNullOrWhiteSpace(dto.Plan) ? "Starter" : dto.Plan,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Healthy" : dto.Status,
                Owner = dto.Owner.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Organizations.Add(org);
            await _db.SaveChangesAsync();

            return MapToDto(org, []);
        }

        public async Task<OrganizationDto> UpdateOrganizationAsync(Guid id, UpdateOrganizationDto dto)
        {
            var org = await _db.Organizations
                .Include(o => o.Users)
                .FirstOrDefaultAsync(o => o.Id == id)
                ?? throw new KeyNotFoundException($"Organization with ID '{id}' not found.");

            org.Name = dto.Name.Trim();
            org.TaxNumber = dto.TaxNumber.Trim();
            org.Website = dto.Website?.Trim();
            org.ShortDescription = dto.ShortDescription?.Trim();
            org.LogoUrl = dto.LogoUrl?.Trim();
            org.Sub = dto.Sub.Trim();
            org.Plan = dto.Plan;
            org.Status = dto.Status;
            if (!string.IsNullOrWhiteSpace(dto.Owner))
                org.Owner = dto.Owner.Trim();
            org.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var activeJobsCount = await _db.JobPostings.Where(j => j.Status == JobStatus.Published).ToListAsync();
            return MapToDto(org, activeJobsCount);
        }

        public async Task DeleteOrganizationAsync(Guid id)
        {
            var org = await _db.Organizations.FindAsync(id)
                ?? throw new KeyNotFoundException($"Organization with ID '{id}' not found.");

            _db.Organizations.Remove(org);
            await _db.SaveChangesAsync();
        }

        private static OrganizationDto MapToDto(Organization o, List<JobPosting> activeJobs)
        {
            var words = o.Name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var initials = string.Concat(words.Select(w => char.ToUpper(w[0])));
            if (initials.Length > 3) initials = initials[..3];
            if (string.IsNullOrEmpty(initials)) initials = "ORG";

            var jobsForOrg = activeJobs.Count(j => 
                string.Equals(j.PostedBy, o.Name, StringComparison.OrdinalIgnoreCase) ||
                o.Users.Any(u => u.Id == j.CreatedByRecruiterId));

            var ownerName = o.Owner;
            if (string.IsNullOrEmpty(ownerName))
            {
                var ownerUser = o.Users.FirstOrDefault(u => u.Role == UserRole.Recruiter);
                ownerName = ownerUser != null ? ownerUser.FullName : "Unassigned";
            }

            return new OrganizationDto
            {
                Id = o.Id,
                Name = o.Name,
                TaxNumber = o.TaxNumber,
                Website = o.Website,
                ShortDescription = o.ShortDescription,
                LogoUrl = o.LogoUrl,
                Initials = initials,
                Sub = o.Sub,
                Plan = string.IsNullOrWhiteSpace(o.Plan) ? "Starter" : o.Plan,
                Status = string.IsNullOrWhiteSpace(o.Status) ? "Healthy" : o.Status,
                Owner = ownerName,
                Members = o.Users.Count,
                ActiveJobs = jobsForOrg,
                Joined = o.CreatedAt.ToString("MMM d, yyyy"),
                MonthlyUsage = $"{jobsForOrg} live roles",
                CreatedAt = o.CreatedAt
            };
        }
    }
}
