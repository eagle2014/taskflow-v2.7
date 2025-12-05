namespace TaskFlow.API.Models.Entities;

public class Contact
{
    public Guid ContactID { get; set; }
    public string SiteID { get; set; } = string.Empty;
    public Guid? CustomerID { get; set; }

    // Basic
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Mobile { get; set; }

    // Position
    public string? Position { get; set; }
    public string? Department { get; set; }

    // Status
    public bool IsPrimary { get; set; }
    public string Status { get; set; } = "Active"; // Active, Inactive
    public string? LinkedIn { get; set; }
    public string? Notes { get; set; }

    // Audit
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }

    // Computed property
    public string FullName => $"{FirstName} {LastName}".Trim();
}