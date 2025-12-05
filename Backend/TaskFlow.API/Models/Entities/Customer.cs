namespace TaskFlow.API.Models.Entities;

public class Customer
{
    public Guid CustomerID { get; set; }
    public string SiteID { get; set; } = string.Empty;

    // Basic
    public string CustomerCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerType { get; set; } = "Company"; // Company, Individual

    // Extended
    public string? Industry { get; set; }
    public string? Website { get; set; }
    public string? TaxCode { get; set; }

    // Contact
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }

    // Business
    public decimal? AnnualRevenue { get; set; }
    public int? EmployeeCount { get; set; }

    // Status
    public string Status { get; set; } = "Active"; // Active, Inactive, Lead
    public string? Source { get; set; }
    public string? Notes { get; set; }

    // Audit
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
}