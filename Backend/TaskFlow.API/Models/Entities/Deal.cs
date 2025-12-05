namespace TaskFlow.API.Models.Entities;

public class Deal
{
    public Guid DealID { get; set; }
    public string SiteID { get; set; } = string.Empty;
    public Guid CustomerID { get; set; }
    public Guid? ContactID { get; set; }

    // Basic
    public string DealCode { get; set; } = string.Empty;
    public string DealName { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Value
    public decimal? DealValue { get; set; }
    public string Currency { get; set; } = "VND";

    // Pipeline
    public string Stage { get; set; } = "Lead"; // Lead, Qualified, Proposal, Negotiation, Won, Lost
    public int Probability { get; set; } = 0;

    // Dates
    public DateTime? ExpectedCloseDate { get; set; }
    public DateTime? ActualCloseDate { get; set; }

    // Status
    public string Status { get; set; } = "Open"; // Open, Won, Lost
    public string? LostReason { get; set; }
    public Guid? OwnerID { get; set; }
    public string? Source { get; set; }

    // Audit
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
}