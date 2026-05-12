const BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Lists
export const getLists        = ()          => request('/todolist');
export const createList      = (name)      => request('/todolist', { method: 'POST', body: JSON.stringify({ name }) });
export const updateList      = (id, data)  => request(`/todolist/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteList      = (id)        => request(`/todolist/${id}`, { method: 'DELETE' });
export const reorderLists    = (items)     => request('/todolist/reorder', { method: 'PUT', body: JSON.stringify(items) });

// Todos
export const getTodos        = (listId, sort = 'myOrder') =>
  request(`/todo?listId=${listId}&sort=${sort}`);

export const createTodo      = (data)      => request('/todo', { method: 'POST', body: JSON.stringify(data) });
export const updateTodo      = (id, data)  => request(`/todo/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTodo      = (id)        => request(`/todo/${id}`, { method: 'DELETE' });
export const reorderTodos    = (items)     => request('/todo/reorder', { method: 'PUT', body: JSON.stringify(items) });