import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isToday, isPast, parseISO } from 'date-fns';

function formatDue(dueDate) {
  if (!dueDate) return null;
  const d = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  if (isToday(d)) return { label: 'Today', cls: 'today' };
  if (isPast(d))  return { label: format(d, 'MMM d'), cls: 'overdue' };
  return { label: format(d, 'MMM d'), cls: '' };
}

export default function TodoCard({ todo, onToggle, onEdit, onDelete, sortMode }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDate, setEditDate]   = useState(
    todo.dueDate ? todo.dueDate.slice(0, 10) : ''
  );

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id, disabled: sortMode !== 'myOrder' });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const due = formatDue(todo.dueDate);

  const saveEdit = () => {
    if (editTitle.trim()) {
      onEdit(todo.id, { title: editTitle.trim(), dueDate: editDate || null });
    }
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`todo-card ${todo.isCompleted ? 'completed' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      {sortMode === 'myOrder' && (
        <span {...attributes} {...listeners} className="card-drag-handle">⠿</span>
      )}

      <div
        className={`todo-check ${todo.isCompleted ? 'done' : ''}`}
        onClick={() => onToggle(todo.id)}
        title={todo.isCompleted ? 'Mark incomplete' : 'Mark complete'}
      />

      <div className="todo-body">
        {editing ? (
          <>
            <input
              className="todo-title-input"
              autoFocus
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false); }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <input
                type="date"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
                style={{ fontSize: 12, color: 'var(--text-2)', background: 'transparent', fontFamily: 'var(--font-sans)' }}
              />
              <button className="btn-submit" style={{ padding: '4px 12px', fontSize: 12 }} onClick={saveEdit}>Save</button>
              <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div className="todo-title" onDoubleClick={() => { setEditing(true); setEditTitle(todo.title); }}>
              {todo.title}
            </div>
            {due && (
              <div className={`todo-due ${due.cls}`}>
                📅 {due.label}
              </div>
            )}
          </>
        )}
      </div>

      {!editing && (
        <div className="card-actions">
          <button className="card-action-btn" title="Edit" onClick={() => setEditing(true)}>✏️</button>
          <button className="card-action-btn delete" title="Delete" onClick={() => onDelete(todo.id)}>🗑</button>
        </div>
      )}
    </div>
  );
}