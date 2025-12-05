namespace TaskFlow.API.Models.DTOs;

public class DealDTO
{
    public Guid DealID { get; set; }
    public string SiteID { get; set; } = string.Empty;
    public Guid CustomerID { get; set; }
    public string? CustomerName { get; set; }
    public Guid? ContactID { get; set; }
    public string? ContactName { get; set; }
    public string DealCode { get; set; } = string.Empty;
    public string DealName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? DealValue { get; set; }
    public string Currency { get; set; } = "VND";
    public string Stage { get; set; } = "Lead";
    public int Probability { get; set; } = 0;
    public DateTime? ExpectedCloseDate { get; set; }
    public DateTime? ActualCloseDate { get; set; }
    public string Status { get; set; } = "Open";
    public string? LostReason { get; set; }
    public Guid? OwnerID { get; set; }
    public string? OwnerName { get; set; }
    public string? Source { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateDealDTO
{
    public Guid CustomerID { get; set; }
    public Guid? ContactID { get; set; }
    public string DealCode { get; set; } = string.Empty;
    public string DealName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? DealValue { get; set; }
    public string Currency { get; set; } = "VND";
    public string Stage { get; set; } = "Lead";
    public int Probability { get; set; } = 0;
    public DateTime? ExpectedCloseDate { get; set; }
    public string Status { get; set; } = "Open";
    public Guid? OwnerID { get; set; }
    public string? Source { get; set; }
}

public class UpdateDealDTO
{
    public Guid CustomerID { get; set; }
    public Guid? ContactID { get; set; }
    public string DealName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? DealValue { get; set; }
    public string Currency { get; set; } = "VND";
    public string Stage { get; set; } = "Lead";
    public int Probability { get; set; } = 0;
    public DateTime? ExpectedCloseDate { get; set; }
    public DateTime? ActualCloseDate { get; set; }
    public string Status { get; set; } = "Open";
    public string? LostReason { get; set; }
    public Guid? OwnerID { get; set; }
    public string? Source { get; set; }
}

public class DealSearchDTO
{
    public string? SearchTerm { get; set; }
    public Guid? CustomerID { get; set; }
    public string? Stage { get; set; }
    public string? Status { get; set; }
    public Guid? OwnerID { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}