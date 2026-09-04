namespace RagApp.Domain.Models.Message;

public class MessageDto
{
    public int Id { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? SourcesJson { get; set; }
    public long CreatedAtTimestamp { get; set; }
    public bool IsError { get; set; }
    public string? ErrorSeverity { get; set; }
}