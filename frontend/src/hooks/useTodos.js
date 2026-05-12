import { useState, useEffect, useCallback } from 'react';
import { getTodos, createTodo, updateTodo, deleteTodo, reorderTodos } from '../api/todoApi';

export function useTodos(listId, sort) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTodos = useCallback(async () => {
    if (!listId) return;
    setLoading(true);
    try {
      const data = await getTodos(listId, sort);
      setTodos(data);
    } catch (e) {
      console.error('Failed to fetch todos', e);
    } finally {
      setLoading(false);
    }
  }, [listId, sort]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const addTodo = async (title, dueDate = null) => {
    const todo = await createTodo({ title, dueDate, todoListId: listId });
    setTodos(prev => [...prev, todo]);
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const updated = await updateTodo(id, { ...todo, isCompleted: !todo.isCompleted });
    setTodos(prev => prev.map(t => t.id === id ? updated : t));
  };

  const editTodo = async (id, changes) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const updated = await updateTodo(id, { ...todo, ...changes });
    setTodos(prev => prev.map(t => t.id === id ? updated : t));
  };

  const removeTodo = async (id) => {
    await deleteTodo(id);
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const reorder = async (ordered) => {
    setTodos(ordered); // optimistic update
    const payload = ordered.map((t, i) => ({ id: t.id, sortOrder: i }));
    await reorderTodos(payload);
  };

  return { todos, loading, addTodo, toggleTodo, editTodo, removeTodo, reorder, refresh: fetchTodos };
}