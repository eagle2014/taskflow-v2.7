namespace TaskFlow.API.Models.Entities;

public class Quote
{
    public Guid QuoteID { get; set; }
    public string SiteID { get; set; } = string.Empty;
    public Guid DealID { get; set; }
    public Guid CustomerID { get; set; }
    public Guid? ContactID { get; set; }

    // Quote Info
    public string QuoteNumber { get; set; } = string.Empty;
    public string? QuoteName { get; set; }
    public int Version { get; set; } = 1;

    // Dates
    public DateTime QuoteDate { get; set; }
    public DateTime? ValidUntil { get; set; }

    // Values
    public decimal SubTotal { get; set; } = 0;
    public decimal DiscountPercent { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    public decimal TaxPercent { get; set; } = 10;
    public decimal TaxAmount { get; set; } = 0;
    public decimal TotalAmount { get; set; } = 0;
    public string Currency { get; set; } = "VND";

    // Status
    public string Status { get; set; } = "Draft"; // Draft, Sent, Accepted, Rejected
    public string? PaymentTerms { get; set; }
    public string? DeliveryTerms { get; set; }
    public string? Notes { get; set; }

    // Audit
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
}