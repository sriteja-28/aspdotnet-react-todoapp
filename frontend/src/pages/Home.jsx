import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { useApp } from '../context/AppContext';
import { useTodos } from '../hooks/useTodos';
import TodoForm from '../components/TodoForm';
import TodoCard from '../components/TodoCard';
import FilterBar from '../components/FilterBar';

export default function Home() {
  const { activeList, activeListId } = useApp();
  const [sort, setSort] = useState('myOrder');

  const { todos, loading, addTodo, toggleTodo, editTodo, removeTodo, reorder } =
    useTodos(activeListId, sort);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [activeId, setActiveId] = useState(null);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIdx = todos.findIndex(t => t.id === active.id);
    const newIdx = todos.findIndex(t => t.id === over.id);
    reorder(arrayMove(todos, oldIdx, newIdx));
  };

  const incomplete = todos.filter(t => !t.isCompleted);
  const completed  = todos.filter(t =>  t.isCompleted);

  const activeCard = activeId ? todos.find(t => t.id === activeId) : null;

  return (
    <>
      <div className="main-header">
        <div>
          <div className="main-title">{activeList?.name ?? 'My Tasks'}</div>
          <div className="main-subtitle">
            {incomplete.length} task{incomplete.length !== 1 ? 's' : ''} remaining
          </div>
        </div>
      </div>

      <FilterBar sort={sort} onSort={setSort} />

      <TodoForm onAdd={addTodo} />

      <div className="todo-list-wrap">
        {loading ? (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <div className="empty-text">Loading…</div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }) => setActiveId(active.id)}
            onDragEnd={handleDragEnd}
          >
            {incomplete.length === 0 && completed.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <div className="empty-text">No tasks yet — add one above</div>
              </div>
            ) : (
              <>
                {incomplete.length > 0 && (
                  <>
                    <div className="section-label">Tasks · {incomplete.length}</div>
                    <SortableContext
                      items={incomplete.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {incomplete.map(todo => (
                        <TodoCard
                          key={todo.id}
                          todo={todo}
                          onToggle={toggleTodo}
                          onEdit={editTodo}
                          onDelete={removeTodo}
                          sortMode={sort}
                        />
                      ))}
                    </SortableContext>
                  </>
                )}

                {completed.length > 0 && (
                  <>
                    <div className="section-label" style={{ marginTop: 28 }}>
                      Completed · {completed.length}
                    </div>
                    {completed.map(todo => (
                      <TodoCard
                        key={todo.id}
                        todo={todo}
                        onToggle={toggleTodo}
                        onEdit={editTodo}
                        onDelete={removeTodo}
                        sortMode={sort}
                      />
                    ))}
                  </>
                )}
              </>
            )}

            <DragOverlay>
              {activeCard ? (
                <div className="todo-card" style={{ opacity: 0.9, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                  <div className="todo-check" />
                  <div className="todo-body">
                    <div className="todo-title">{activeCard.title}</div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </>
  );
}