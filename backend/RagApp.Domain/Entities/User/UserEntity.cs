using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RagApp.Domain.Entities.Conversation;
using RagApp.Domain.Enums;

namespace RagApp.Domain.Entities.User;

public class UserEntity
{
    [Required]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    public ICollection<ConversationEntity> Conversations { get; set; } = new List<ConversationEntity>();
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    [Required]
    public string Salt { get; set; } = string.Empty;
    
    [Required]
    public long CreatedAtTimestamp { get; set; }
    
    public UserType Role { get; set; } = UserType.User;
    
    public StatusType Status { get; set; } = StatusType.Active;
}