import { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Hash,
  Trash,
  Pencil,
} from 'lucide-react';
import type { Group } from '../types';

interface GroupSidebarProps {
  groups: Group[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string) => void;
  onCreateGroup: (parentId?: string) => void;
  onRenameGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
}

function GroupItem({
  group,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  level = 0,
}: {
  group: Group;
  selectedGroupId: string | null;
  onSelectGroup: (id: string) => void;
  onCreateGroup: (parentId?: string) => void;
  onRenameGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [showMenu, setShowMenu] = useState(false);

  const isSelected = selectedGroupId === group.id;
  const hasChildren = group.children.length > 0;

  const handleRename = () => {
    if (editName.trim() && editName !== group.name) {
      onRenameGroup(group.id, editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-1 py-1 px-2 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
            : 'hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectGroup(group.id)}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(!showMenu);
        }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 hover:bg-[var(--color-bg-tertiary)] rounded"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {isSelected ? (
          <FolderOpen size={16} className="fill-current" />
        ) : (
          <Folder size={16} />
        )}

        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-accent)] rounded px-2 py-0.5 text-sm outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-sm truncate">{group.name}</span>
        )}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateGroup(group.id);
            }}
            className="p-1 hover:bg-[var(--color-bg-tertiary)] rounded text-[var(--color-text-tertiary)]"
            title="Add subgroup"
          >
            <FolderPlus size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 hover:bg-[var(--color-bg-tertiary)] rounded text-[var(--color-text-tertiary)]"
            title="Rename"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${group.name}" and all its contents?`)) {
                onDeleteGroup(group.id);
              }
            }}
            className="p-1 hover:bg-[var(--color-danger-subtle)] rounded text-[var(--color-danger)]"
            title="Delete"
          >
            <Trash size={12} />
          </button>
        </div>
      </div>

      {expanded && hasChildren && (
        <div>
          {group.children.map((child) => (
            <GroupItem
              key={child.id}
              group={child}
              selectedGroupId={selectedGroupId}
              onSelectGroup={onSelectGroup}
              onCreateGroup={onCreateGroup}
              onRenameGroup={onRenameGroup}
              onDeleteGroup={onDeleteGroup}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GroupSidebar({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
}: GroupSidebarProps) {
  const totalEntries = groups.reduce((acc, g) => {
    const countEntries = (group: Group): number =>
      group.entries.length + group.children.reduce((a, c) => a + countEntries(c), 0);
    return acc + countEntries(g);
  }, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-subtle)]">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
          Groups
        </h2>
        <button
          onClick={() => onCreateGroup()}
          className="p-1.5 hover:bg-[var(--color-bg-tertiary)] rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          title="New group"
        >
          <FolderPlus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {groups.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Folder size={32} className="mx-auto text-[var(--color-text-tertiary)] mb-3" />
            <p className="text-sm text-[var(--color-text-tertiary)]">No groups yet</p>
            <button
              onClick={() => onCreateGroup()}
              className="mt-3 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              Create your first group
            </button>
          </div>
        ) : (
          groups.map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              selectedGroupId={selectedGroupId}
              onSelectGroup={onSelectGroup}
              onCreateGroup={onCreateGroup}
              onRenameGroup={onRenameGroup}
              onDeleteGroup={onDeleteGroup}
            />
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
          <Hash size={12} />
          <span>{totalEntries} entries total</span>
        </div>
      </div>
    </div>
  );
}
