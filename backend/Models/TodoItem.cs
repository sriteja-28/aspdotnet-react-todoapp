namespace backend.Models;

public class TodoItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }
    public int SortOrder { get; set; } = 0;

    // Foreign Key
    public int? TodoListId { get; set; }

    // Navigation Property
    [System.Text.Json.Serialization.JsonIgnore]
    public TodoList? TodoList { get; set; }
}