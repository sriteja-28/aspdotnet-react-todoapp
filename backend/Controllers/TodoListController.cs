using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TodoListController : ControllerBase
{
    private readonly AppDbContext _context;

    public TodoListController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/todolist
    [HttpGet]
    public async Task<IActionResult> GetLists()
    {
        var lists = await _context.TodoLists
            .OrderBy(x => x.SortOrder)
            .Select(l => new
            {
                l.Id,
                l.Name,
                l.SortOrder,
                TaskCount = l.Todos.Count(t => !t.IsCompleted)
            })
            .ToListAsync();

        return Ok(lists);
    }

    // GET /api/todolist/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetList(int id)
    {
        var list = await _context.TodoLists
            .Include(l => l.Todos)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (list == null) return NotFound();
        return Ok(list);
    }

    // POST /api/todolist
    [HttpPost]
    public async Task<IActionResult> CreateList([FromBody] TodoList list)
    {
        var maxOrder = await _context.TodoLists
            .MaxAsync(x => (int?)x.SortOrder) ?? -1;
        list.SortOrder = maxOrder + 1;

        _context.TodoLists.Add(list);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetList), new { id = list.Id }, list);
    }

    // PUT /api/todolist/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateList(int id, [FromBody] TodoList updatedList)
    {
        var list = await _context.TodoLists.FindAsync(id);
        if (list == null) return NotFound();

        // Protect the default "My Tasks" name from deletion but allow rename
        list.Name = updatedList.Name;
        list.SortOrder = updatedList.SortOrder;

        await _context.SaveChangesAsync();
        return Ok(list);
    }

    // DELETE /api/todolist/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteList(int id)
    {
        if (id == 1)
            return BadRequest("Cannot delete the default 'My Tasks' list.");

        var list = await _context.TodoLists
            .Include(l => l.Todos)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (list == null) return NotFound();

        // Move orphaned tasks to default list
        foreach (var todo in list.Todos)
            todo.TodoListId = 1;

        _context.TodoLists.Remove(list);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PUT /api/todolist/reorder
    [HttpPut("reorder")]
    public async Task<IActionResult> ReorderLists([FromBody] List<ReorderItem> items)
    {
        foreach (var item in items)
        {
            var list = await _context.TodoLists.FindAsync(item.Id);
            if (list != null)
                list.SortOrder = item.SortOrder;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
}