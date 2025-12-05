namespace TaskFlow.API.Models.DTOs;

public class QuoteDTO
{
    public Guid QuoteID { get; set; }
    public string SiteID { get; set; } = string.Empty;
    public Guid DealID { get; set; }
    public string? DealName { get; set; }
    public Guid CustomerID { get; set; }
    public string? CustomerName { get; set; }
    public Guid? ContactID { get; set; }
    public string? ContactName { get; set; }
    public string QuoteNumber { get; set; } = string.Empty;
    public string? QuoteName { get; set; }
    public int Version { get; set; } = 1;
    public DateTime QuoteDate { get; set; }
    public DateTime? ValidUntil { get; set; }
    public decimal SubTotal { get; set; } = 0;
    public decimal DiscountPercent { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    public decimal TaxPercent { get; set; } = 10;
    public decimal TaxAmount { get; set; } = 0;
    public decimal TotalAmount { get; set; } = 0;
    public string Currency { get; set; } = "VND";
    public string Status { get; set; } = "Draft";
    public string? PaymentTerms { get; set; }
    public string? DeliveryTerms { get; set; }
    public string? Notes { get; set; }
    public List<QuoteItemDTO> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class QuoteItemDTO
{
    public Guid QuoteItemID { get; set; }
    public Guid QuoteID { get; set; }
    public int ItemOrder { get; set; } = 0;
    public string ItemName { get; set; } = string.Empty;
    public string? ItemDescription { get; set; }
    public decimal Quantity { get; set; } = 1;
    public string? Unit { get; set; }
    public decimal UnitPrice { get; set; } = 0;
    public decimal DiscountPercent { get; set; } = 0;
    public decimal Amount { get; set; } = 0;
}

public class CreateQuoteDTO
{
    public Guid DealID { get; set; }
    public Guid CustomerID { get; set; }
    public Guid? ContactID { get; set; }
    public string QuoteNumber { get; set; } = string.Empty;
    public string? QuoteName { get; set; }
    public DateTime QuoteDate { get; set; }
    public DateTime? ValidUntil { get; set; }
    public decimal DiscountPercent { get; set; } = 0;
    public decimal TaxPercent { get; set; } = 10;
    public string Currency { get; set; } = "VND";
    public string Status { get; set; } = "Draft";
    public string? PaymentTerms { get; set; }
    public string? DeliveryTerms { get; set; }
    public string? Notes { get; set; }
    public List<CreateQuoteItemDTO> Items { get; set; } = new();
}

public class CreateQuoteItemDTO
{
    public int ItemOrder { get; set; } = 0;
    public string ItemName { get; set; } = string.Empty;
    public string? ItemDescription { get; set; }
    public decimal Quantity { get; set; } = 1;
    public string? Unit { get; set; }
    public decimal UnitPrice { get; set; } = 0;
    public decimal DiscountPercent { get; set; } = 0;
}

public class UpdateQuoteDTO
{
    public Guid DealID { get; set; }
    public Guid CustomerID { get; set; }
    public Guid? ContactID { get; set; }
    public string? QuoteName { get; set; }
    public DateTime QuoteDate { get; set; }
    public DateTime? ValidUntil { get; set; }
    public decimal DiscountPercent { get; set; } = 0;
    public decimal TaxPercent { get; set; } = 10;
    public string Currency { get; set; } = "VND";
    public string Status { get; set; } = "Draft";
    public string? PaymentTerms { get; set; }
    public string? DeliveryTerms { get; set; }
    public string? Notes { get; set; }
    public List<CreateQuoteItemDTO> Items { get; set; } = new();
}

public class QuoteSearchDTO
{
    public string? SearchTerm { get; set; }
    public Guid? DealID { get; set; }
    public Guid? CustomerID { get; set; }
    public string? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}