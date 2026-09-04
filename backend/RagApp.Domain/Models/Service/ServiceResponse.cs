namespace RagApp.Domain.Models.Service;

public class ServiceResponse
{
    public bool IsSuccess { get; set; }
    public string Message { get; set; } = string.Empty;
    public object? Data { get; set; }
}