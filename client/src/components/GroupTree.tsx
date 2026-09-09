import React, { useState } from 'react';

interface Group {
  id: string;
  name: string;
  parentId: string | null;
  children?: Group[];
}

interface GroupTreeProps {
  groups: Group[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onAddGroup: (parentId: string | null, name: string) => void;
  onRenameGroup: (groupId: string, name: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

export const GroupTree: React.FC<GroupTreeProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onAddGroup,
  onRenameGroup,
  onDeleteGroup
}) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addParentId, setAddParentId] = useState<string | null>(null);

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      onAddGroup(addParentId, newGroupName.trim());
      setNewGroupName('');
      setShowAddDialog(false);
    }
  };

  const handleRename = (groupId: string) => {
    if (editName.trim()) {
      onRenameGroup(groupId, editName.trim());
      setEditingGroupId(null);
    }
  };

  const handleDelete = (groupId: string, groupName: string) => {
    if (window.confirm(`Delete group "${groupName}" and all its contents?`)) {
      onDeleteGroup(groupId);
    }
  };

  const renderGroup = (group: Group, level: number = 0) => (
    <div key={group.id} className="group-item">
      <div 
        className={`group-content ${selectedGroupId === group.id ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 20 + 10}px` }}
        onClick={() => onSelectGroup(group.id)}
      >
        <span className="group-icon">📁</span>
        <span className="group-name">{group.name}</span>
        <div className="group-actions">
          <button 
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              setEditingGroupId(group.id);
              setEditName(group.name);
            }}
            title="Rename"
          >
            ✏️
          </button>
          <button 
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              setAddParentId(group.id);
              setShowAddDialog(true);
            }}
            title="Add subgroup"
          >
            ➕
          </button>
          <button 
            className="icon-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(group.id, group.name);
            }}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {editingGroupId === group.id && (
        <div className="edit-form" style={{ paddingLeft: `${level * 20 + 30}px` }}>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="New name (REQ-9)"
            autoFocus
          />
          <button onClick={() => handleRename(group.id)}>Save</button>
          <button onClick={() => setEditingGroupId(null)}>Cancel</button>
        </div>
      )}
      
      {group.children?.map(child => renderGroup(child, level + 1))}
    </div>
  );

  return (
    <div className="group-tree">
      <div className="tree-header">
        <h3>📁 Groups</h3>
        <button 
          className="icon-btn"
          onClick={() => {
            setAddParentId(null);
            setShowAddDialog(true);
          }}
          title="Add root group"
        >
          ➕
        </button>
      </div>
      
      <div className="tree-content">
        {groups.map(group => renderGroup(group))}
      </div>
      
      {showAddDialog && (
        <div className="add-group-form">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name (REQ-7)"
            autoFocus
          />
          <button onClick={handleAddGroup}>Add</button>
          <button onClick={() => setShowAddDialog(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};
