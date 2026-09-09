import React from 'react';

interface Entry {
  id: string;
  title: string;
  username: string;
  url: string;
  isTan: boolean;
  tanUsed: boolean;
}

interface EntryListProps {
  entries: Entry[];
  selectedEntryId: string | null;
  onSelectEntry: (entryId: string) => void;
  onDeleteEntry: (entryId: string) => void;
  onDuplicateEntry: (entryId: string) => void;
  onCopyPassword: (password: string) => void;
}

export const EntryList: React.FC<EntryListProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  onDeleteEntry,
  onDuplicateEntry,
  onCopyPassword
}) => {
  const handleDelete = (entryId: string, entryTitle: string) => {
    if (window.confirm(`Delete entry "${entryTitle}"?`)) {
      onDeleteEntry(entryId);
    }
  };

  return (
    <div className="entry-list">
      <div className="list-header">
        <h3>📋 Entries</h3>
        <span className="count">{entries.length} items</span>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Username</th>
            <th>URL</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={4} className="empty-state">
                No entries in this group. Click "Add Entry" to create one.
              </td>
            </tr>
          ) : (
            entries.map(entry => (
              <tr
                key={entry.id}
                className={`
                  ${selectedEntryId === entry.id ? 'selected' : ''}
                  ${entry.isTan ? 'tan-entry' : ''}
                  ${entry.tanUsed ? 'tan-used' : ''}
                `}
                onClick={() => onSelectEntry(entry.id)}
              >
                <td>
                  {entry.isTan ? '🔑' : '📋'} {entry.title}
                  {entry.tanUsed && <span className="badge">USED</span>}
                </td>
                <td>{entry.username || '-'}</td>
                <td>{entry.url || '-'}</td>
                <td>
                  <button 
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateEntry(entry.id);
                    }}
                    title="Duplicate (REQ-16)"
                  >
                    📋
                  </button>
                  <button 
                    className="icon-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(entry.id, entry.title);
                    }}
                    title="Delete (REQ-17)"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
