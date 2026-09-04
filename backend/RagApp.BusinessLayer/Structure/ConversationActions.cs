using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using RagApp.DataAccess.Context;
using RagApp.Domain.Entities.Conversation;
using RagApp.Domain.Entities.Message;
using RagApp.Domain.Enums;
using RagApp.Domain.Models.Conversation;
using RagApp.Domain.Models.Message;
using RagApp.Domain.Models.Service;

namespace RagApp.BusinessLayer.Structure;

public class ConversationActions
{
    private readonly RagAppDbContext _context;
    private readonly HttpClient _httpClient;

    public ConversationActions(RagAppDbContext context, HttpClient httpClient)
    {
        _context = context;
        _httpClient = httpClient;
    }

    public ServiceResponse GetConversationsAction(int userId)
    {
        var conversations = _context.Conversations
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAtTimestamp)
            .Select(c => new ConversationSummaryDto
            {
                Id = c.Id,
                Title = c.Title,
                CreatedAtTimestamp = c.CreatedAtTimestamp
            })
            .ToList();

        return new ServiceResponse { IsSuccess = true, Data = conversations };
    }

    public ServiceResponse GetConversationDetailAction(int userId, int conversationId)
    {
        var conversation = _context.Conversations
            .Include(c => c.Messages)
            .FirstOrDefault(c => c.Id == conversationId);

        if (conversation == null)
            return new ServiceResponse { IsSuccess = false, Message = "Conversation not found." };

        // Ownership check — a user must not be able to read someone else's
        // conversation just by guessing/incrementing the ID in the URL.
        if (conversation.UserId != userId)
            return new ServiceResponse { IsSuccess = false, Message = "Conversation not found." };

        var dto = new ConversationDetailDto
        {
            Id = conversation.Id,
            Title = conversation.Title,
            CreatedAtTimestamp = conversation.CreatedAtTimestamp,
            Messages = conversation.Messages
                .OrderBy(m => m.CreatedAtTimestamp)
                .Select(m => new MessageDto
                {
                    Id = m.Id,
                    Role = m.Role.ToString(),
                    Content = m.Content,
                    SourcesJson = m.SourcesJson,
                    CreatedAtTimestamp = m.CreatedAtTimestamp
                })
                .ToList()
        };

        return new ServiceResponse { IsSuccess = true, Data = dto };
    }

    public async Task<ServiceResponse> AskAction(int userId, AskDto dto)
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        ConversationEntity conversation;
        if (dto.ConversationId.HasValue)
        {
            conversation = _context.Conversations
                               .FirstOrDefault(c => c.Id == dto.ConversationId && c.UserId == userId)
                           ?? throw new Exception("Conversation not found.");
        }
        else
        {
            conversation = new ConversationEntity
            {
                UserId = userId,
                Title = dto.Query.Length > 50 ? dto.Query[..50] + "..." : dto.Query,
                CreatedAtTimestamp = timestamp
            };
            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();
        }

        _context.Messages.Add(new MessageEntity
        {
            ConversationId = conversation.Id,
            Role = MessageRole.User,
            Content = dto.Query,
            CreatedAtTimestamp = timestamp
        });
        await _context.SaveChangesAsync();

        string answer;
        List<SourceDto> sources = new();
        bool isError = false;
        string? errorSeverity = null;

        try
        {
            var httpResponse = await _httpClient.PostAsJsonAsync("ask", new { query = dto.Query });
            httpResponse.EnsureSuccessStatusCode();
            var aiResponse = await httpResponse.Content.ReadFromJsonAsync<PythonAskResponse>()
                             ?? throw new Exception("Empty response from AI service.");
            answer = aiResponse.Answer;
            sources = aiResponse.Sources;
        }
        catch (HttpRequestException)
        {
            // Service unreachable entirely — connection refused, DNS failure, etc.
            // Transient: likely means a container isn't up. Yellow on the frontend.
            answer = "The AI service is currently unavailable. Please try again in a moment.";
            isError = true;
            errorSeverity = "transient";
        }
        catch (TaskCanceledException)
        {
            // Request timed out — service is up but too slow.
            answer = "The AI model took too long to respond. Please try again.";
            isError = true;
            errorSeverity = "transient";
        }
        catch (Exception e)
        {
            // Anything else — service responded with an actual error, or something
            // unexpected happened. Red on the frontend.
            Console.WriteLine(e);
            answer = "Something went wrong while generating a response.";
            isError = true;
            errorSeverity = "failed";
        }

        var answerTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        _context.Messages.Add(new MessageEntity
        {
            ConversationId = conversation.Id,
            Role = MessageRole.Assistant,
            Content = answer,
            SourcesJson = sources.Count > 0 ? System.Text.Json.JsonSerializer.Serialize(sources) : null,
            IsError = isError,
            ErrorSeverity = errorSeverity,
            CreatedAtTimestamp = answerTimestamp
        });
        await _context.SaveChangesAsync();

        return new ServiceResponse
        {
            IsSuccess = true,
            Data = new AskResponseDto
            {
                ConversationId = conversation.Id,
                Answer = answer,
                Sources = sources,
                IsError = isError,
                ErrorSeverity = errorSeverity
            }
        };
    }
}

// Shape returned by the Python /ask endpoint — internal to this class,
// not exposed as a public DTO since it's just for deserializing the HTTP call.
internal class PythonAskResponse
{
    public string Answer { get; set; } = string.Empty;
    public List<SourceDto> Sources { get; set; } = new();
}