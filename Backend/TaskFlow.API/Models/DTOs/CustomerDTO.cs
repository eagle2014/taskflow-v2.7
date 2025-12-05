namespace TaskFlow.API.Models.DTOs;

public class CustomerDTO
{
    public Guid CustomerID { get; set; }
    public string SiteID { get; set; } = string.Empty;
    public string CustomerCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerType { get; set; } = "Company";
    public string? Industry { get; set; }
    public string? Website { get; set; }
    public string? TaxCode { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? EmployeeCount { get; set; }
    public string Status { get; set; } = "Active";
    public string? Source { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCustomerDTO
{
    public string CustomerCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerType { get; set; } = "Company";
    public string? Industry { get; set; }
    public string? Website { get; set; }
    public string? TaxCode { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? EmployeeCount { get; set; }
    public string Status { get; set; } = "Active";
    public string? Source { get; set; }
    public string? Notes { get; set; }
}

public class UpdateCustomerDTO
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerType { get; set; } = "Company";
    public string? Industry { get; set; }
    public string? Website { get; set; }
    public string? TaxCode { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? EmployeeCount { get; set; }
    public string Status { get; set; } = "Active";
    public string? Source { get; set; }
    public string? Notes { get; set; }
}

public class CustomerSearchDTO
{
    public string? SearchTerm { get; set; }
    public string? CustomerType { get; set; }
    public string? Status { get; set; }
    public string? Industry { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}