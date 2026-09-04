using RagApp.Domain.Models.Message;

namespace RagApp.Domain.Models.Conversation;

public class ConversationDetailDto
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public long CreatedAtTimestamp { get; set; }
    public List<MessageDto> Messages { get; set; } = new();
}