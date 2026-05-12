namespace backend.Models;

public class TodoList
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; } = 0;

    // Collection of tasks inside this list
    public List<TodoItem> Todos { get; set; } = new();
}