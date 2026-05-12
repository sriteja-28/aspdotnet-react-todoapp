using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TodoController : ControllerBase
{
    private readonly AppDbContext _context;

    public TodoController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/todo?listId=1&sort=dueDate
    [HttpGet]
    public async Task<IActionResult> GetTodos(
        [FromQuery] int? listId,
        [FromQuery] string sort = "myOrder")
    {
        var query = _context.TodoItems.AsQueryable();

        if (listId.HasValue)
            query = query.Where(x => x.TodoListId == listId);

        // Always show incomplete first, then apply secondary sort
        query = sort switch
        {
            "dueDate"   => query.OrderBy(x => x.IsCompleted).ThenBy(x => x.DueDate == null).ThenBy(x => x.DueDate),
            "title"     => query.OrderBy(x => x.IsCompleted).ThenBy(x => x.Title),
            "createdAt" => query.OrderBy(x => x.IsCompleted).ThenBy(x => x.CreatedAt),
            _           => query.OrderBy(x => x.IsCompleted).ThenBy(x => x.SortOrder) // "myOrder" default
        };

        var todos = await query.ToListAsync();
        return Ok(todos);
    }

    // GET /api/todo/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTodo(int id)
    {
        var todo = await _context.TodoItems.FindAsync(id);
        if (todo == null) return NotFound();
        return Ok(todo);
    }

    // POST /api/todo
    [HttpPost]
    public async Task<IActionResult> AddTodo([FromBody] TodoItem todo)
    {
        // Default to "My Tasks" list if not specified
        if (todo.TodoListId == null || todo.TodoListId == 0)
            todo.TodoListId = 1;

        todo.CreatedAt = DateTime.UtcNow;

        // Place new item at the end of the list
        var maxOrder = await _context.TodoItems
            .Where(x => x.TodoListId == todo.TodoListId)
            .MaxAsync(x => (int?)x.SortOrder) ?? -1;
        todo.SortOrder = maxOrder + 1;

        _context.TodoItems.Add(todo);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTodo), new { id = todo.Id }, todo);
    }

    // PUT /api/todo/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTodo(int id, [FromBody] TodoItem updatedTodo)
    {
        var todo = await _context.TodoItems.FindAsync(id);
        if (todo == null) return NotFound();

        todo.Title = updatedTodo.Title;
        todo.IsCompleted = updatedTodo.IsCompleted;
        todo.DueDate = updatedTodo.DueDate;
        todo.TodoListId = updatedTodo.TodoListId;
        todo.SortOrder = updatedTodo.SortOrder;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict("The record was modified by another process.");
        }

        return Ok(todo);
    }

    // DELETE /api/todo/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTodo(int id)
    {
        var todo = await _context.TodoItems.FindAsync(id);
        if (todo == null) return NotFound();

        _context.TodoItems.Remove(todo);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PUT /api/todo/reorder  — accepts [{id, sortOrder}, ...]
    [HttpPut("reorder")]
    public async Task<IActionResult> ReorderTodos([FromBody] List<ReorderItem> items)
    {
        foreach (var item in items)
        {
            var todo = await _context.TodoItems.FindAsync(item.Id);
            if (todo != null)
                todo.SortOrder = item.SortOrder;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class ReorderItem
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
}