namespace TaskFlow.API.Models.Entities;

public class QuoteItem
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