using RagApp.BusinessLayer.Interfaces;
using RagApp.BusinessLayer.Structure;
using RagApp.DataAccess.Context;
using RagApp.Domain.Models.Message;
using RagApp.Domain.Models.Service;

namespace RagApp.BusinessLayer.Core;

public class ConversationLogic : ConversationActions, IConversationLogic
{
    public ConversationLogic(RagAppDbContext context, HttpClient httpClient) : base(context, httpClient) { }

    public ServiceResponse GetConversations(int userId) => GetConversationsAction(userId);
    public ServiceResponse GetConversationDetail(int userId, int conversationId) =>
        GetConversationDetailAction(userId, conversationId);
    
    public Task<ServiceResponse> Ask(int userId, AskDto dto) => AskAction(userId, dto);
}