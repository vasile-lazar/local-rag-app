using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RagApp.Domain.Entities.Conversation;
using RagApp.Domain.Enums;

namespace RagApp.Domain.Entities.Message;

public class MessageEntity
{
    [Required]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int ConversationId { get; set; }

    [ForeignKey(nameof(ConversationId))] 
    public ConversationEntity Conversation { get; set; } = null!;

    [Required]
    public MessageRole Role { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;
    
    public string? SourcesJson { get; set; }

    [Required]
    public long CreatedAtTimestamp { get; set; }

    public bool IsError { get; set; } = false;

    public string? ErrorSeverity {get; set;}
}