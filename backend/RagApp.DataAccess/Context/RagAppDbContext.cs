using Microsoft.EntityFrameworkCore;
using RagApp.Domain.Entities.Conversation;
using RagApp.Domain.Entities.Message;
using RagApp.Domain.Entities.User;

namespace RagApp.DataAccess.Context;

public class RagAppDbContext : DbContext
{
    public RagAppDbContext(DbContextOptions<RagAppDbContext> options) : base(options) { }

    public DbSet<UserEntity> Users { get; set; }
    public DbSet<ConversationEntity> Conversations { get; set; }
    public DbSet<MessageEntity> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<UserEntity>()
            .Property(u => u.Status)
            .HasConversion<string>();

        modelBuilder.Entity<MessageEntity>()
            .Property(m => m.Role)
            .HasConversion<string>();

        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}