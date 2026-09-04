using RagApp.Domain.Models.Message;
using RagApp.Domain.Models.Service;

namespace RagApp.BusinessLayer.Interfaces;

public interface IConversationLogic
{
    ServiceResponse GetConversations(int userId);
    ServiceResponse GetConversationDetail(int userId, int conversationId);
    Task<ServiceResponse> Ask(int userId, AskDto dto);
}