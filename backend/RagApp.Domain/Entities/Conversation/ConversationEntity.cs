using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RagApp.Domain.Entities.User;
using RagApp.Domain.Entities.Message;

namespace RagApp.Domain.Entities.Conversation;

public class ConversationEntity
{
    [Required]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }
    
    [ForeignKey(nameof(UserId))]
    public UserEntity User { get; set; } = null!;

    [StringLength(200)]
    public string? Title { get; set; }

    [Required]
    public long CreatedAtTimestamp { get; set; }

    public ICollection<MessageEntity> Messages { get; set; } = new List<MessageEntity>();
}