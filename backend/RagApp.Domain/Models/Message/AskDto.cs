namespace RagApp.Domain.Models.Message;

public class AskDto
{
    public int? ConversationId { get; set; }
    public string Query { get; set; } = string.Empty;
}