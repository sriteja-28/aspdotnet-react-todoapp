import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '../context/AppContext';

function SidebarItem({ list, isActive, onClick, onRename, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sidebar-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(list.id)}
    >
      <span {...attributes} {...listeners} className="drag-handle" title="Drag to reorder">⠿</span>
      <span className="list-icon">📋</span>
      <span className="list-name">{list.name}</span>
      <span className="list-count">{list.taskCount ?? 0}</span>
      {list.id !== 1 && (
        <div style={{ display:'flex', gap:2, marginLeft:'auto' }} onClick={e => e.stopPropagation()}>
          <button
            className="card-action-btn"
            title="Rename"
            onClick={() => onRename(list)}
          >✏️</button>
          <button
            className="card-action-btn delete"
            title="Delete"
            onClick={() => onDelete(list.id)}
          >🗑</button>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { lists, activeListId, setActiveListId, addList, renameList, removeList, reorderListItems } = useApp();
  const [showNewList, setShowNewList] = useState(false);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(null); // { id, name }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = lists.findIndex(l => l.id === active.id);
    const newIdx = lists.findIndex(l => l.id === over.id);
    reorderListItems(arrayMove(lists, oldIdx, newIdx));
  };

  const handleAddList = async () => {
    if (!newName.trim()) return;
    await addList(newName.trim());
    setNewName('');
    setShowNewList(false);
  };

  const handleRename = async () => {
    if (!renaming || !renaming.name.trim()) return;
    await renameList(renaming.id, renaming.name.trim());
    setRenaming(null);
  };

  return (
    <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span /> MyTasks
        </div>
      </div>

      <div className="sidebar-section-label">Lists</div>

      <div className="sidebar-lists">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={lists.map(l => l.id)} strategy={verticalListSortingStrategy}>
            {lists.map(list => (
              <SidebarItem
                key={list.id}
                list={list}
                isActive={list.id === activeListId}
                onClick={(id) => { setActiveListId(id); onClose?.(); }}
                onRename={l => setRenaming({ id: l.id, name: l.name })}
                onDelete={removeList}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="sidebar-footer">
        {showNewList ? (
          <div style={{ padding: '4px 4px' }}>
            <input
              className="modal-input"
              style={{ marginBottom: 8 }}
              autoFocus
              placeholder="List name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddList(); if (e.key === 'Escape') setShowNewList(false); }}
            />
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowNewList(false)}>Cancel</button>
              <button className="btn-submit" onClick={handleAddList}>Add</button>
            </div>
          </div>
        ) : (
          <button className="btn-add-list" onClick={() => setShowNewList(true)}>
            <span>＋</span> New List
          </button>
        )}
      </div>

      {/* Rename Modal */}
      {renaming && (
        <div className="modal-overlay" onClick={() => setRenaming(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Rename List</h2>
            <input
              className="modal-input"
              autoFocus
              value={renaming.name}
              onChange={e => setRenaming(r => ({ ...r, name: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(null); }}
            />
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setRenaming(null)}>Cancel</button>
              <button className="btn-submit" onClick={handleRename}>Save</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}