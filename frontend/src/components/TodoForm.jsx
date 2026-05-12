import { useState } from 'react';

export default function TodoForm({ onAdd }) {
  const [title, setTitle]   = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await onAdd(title.trim(), dueDate || null);
    setTitle('');
    setDueDate('');
  };

  return (
    <div className="todo-form">
      <div className="todo-form-top">
        <span className="todo-form-icon">＋</span>
        <input
          className="todo-form-input"
          placeholder="Add a task…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
        />
      </div>
      <div className="todo-form-bottom">
        <div className="date-input-wrap">
          <span>📅</span>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
        <button
          className="btn-submit"
          disabled={!title.trim()}
          onClick={handleSubmit}
        >
          Add Task
        </button>
      </div>
    </div>
  );
}