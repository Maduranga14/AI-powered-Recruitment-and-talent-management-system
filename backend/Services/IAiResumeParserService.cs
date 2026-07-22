using System.IO;
using System.Threading.Tasks;
using backend.DTOs.Candidate;

namespace backend.Services
{
    public interface IAiResumeParserService
    {
        Task<ParsedResumeDto> ParseResumeAsync(Stream stream, string contentType);
    }
}
