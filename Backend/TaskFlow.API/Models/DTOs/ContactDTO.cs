namespace TaskFlow.API.Models.DTOs;

public class ContactDTO
{
    public Guid ContactID { get; set; }
    public string SiteID { get; set; } = string.Empty;
    public Guid? CustomerID { get; set; }
    public string? CustomerName { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Mobile { get; set; }
    public string? Position { get; set; }
    public string? Department { get; set; }
    public bool IsPrimary { get; set; }
    public string Status { get; set; } = "Active";
    public string? LinkedIn { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateContactDTO
{
    public Guid? CustomerID { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Mobile { get; set; }
    public string? Position { get; set; }
    public string? Department { get; set; }
    public bool IsPrimary { get; set; }
    public string Status { get; set; } = "Active";
    public string? LinkedIn { get; set; }
    public string? Notes { get; set; }
}

public class UpdateContactDTO
{
    public Guid? CustomerID { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Mobile { get; set; }
    public string? Position { get; set; }
    public string? Department { get; set; }
    public bool IsPrimary { get; set; }
    public string Status { get; set; } = "Active";
    public string? LinkedIn { get; set; }
    public string? Notes { get; set; }
}

public class ContactSearchDTO
{
    public string? SearchTerm { get; set; }
    public Guid? CustomerID { get; set; }
    public string? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}