const SORTS = [
  { key: 'myOrder', label: 'My Order' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'title',   label: 'Title' },
  { key: 'createdAt', label: 'Date Added' },
];

export default function FilterBar({ sort, onSort }) {
  return (
    <div className="filter-bar">
      <span style={{ fontSize: 11, color: 'var(--text-3)', marginRight: 4 }}>Sort:</span>
      {SORTS.map(s => (
        <button
          key={s.key}
          className={`filter-btn ${sort === s.key ? 'active' : ''}`}
          onClick={() => onSort(s.key)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}