namespace backend.Models.Enums
{
    public enum ApplicationStatus
    {
        Applied,
        UnderReview,
        Interview,
        Rejected,
        Hired,
        Reviewed,
        /// <summary>Set after the hiring manager submits post-interview feedback.</summary>
        UnderFinalReview
    }
}
