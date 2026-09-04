namespace RagApp.Domain.Models.Message;

public class AskResponseDto
{
    public int ConversationId { get; set; }
    public string Answer { get; set; } = string.Empty;
    public List<SourceDto> Sources { get; set; } = new();
    public bool IsError { get; set; }
    public string? ErrorSeverity { get; set; }
}