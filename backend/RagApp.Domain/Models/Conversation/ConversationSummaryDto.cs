namespace RagApp.Domain.Models.Conversation;

public class ConversationSummaryDto
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public long CreatedAtTimestamp { get; set; }
}