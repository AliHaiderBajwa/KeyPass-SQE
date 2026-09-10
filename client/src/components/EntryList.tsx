import {
  Plus,
  Eye,
  EyeOff,
  Globe,
  User,
  Lock,
} from 'lucide-react';
import type { Group, Entry } from '../types';

interface EntryListProps {
  group: Group | null;
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  onCreateEntry: () => void;
  onCopyToClipboard: (text: string, label: string) => void;
  passwordVisible: Record<string, boolean>;
  onTogglePasswordVisibility: (id: string) => void;
}

function EntryItem({
  entry,
  isSelected,
  onSelect,
  onCopyToClipboard,
  passwordVisible,
  onTogglePasswordVisibility,
}: {
  entry: Entry;
  isSelected: boolean;
  onSelect: () => void;
  onCopyToClipboard: (text: string, label: string) => void;
  passwordVisible: boolean;
  onTogglePasswordVisibility: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20'
          : 'hover:bg-[var(--color-bg-tertiary)] border border-transparent'
      }`}
      onClick={onSelect}
    >
      <div
        className={`flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold uppercase ${
          isSelected
            ? 'bg-[var(--color-accent)] text-[var(--color-bg-primary)]'
            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
        }`}
      >
        {entry.title.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium truncate ${
              isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'
            }`}
          >
            {entry.title}
          </span>
          {entry.url && (
            <Globe size={12} className="text-[var(--color-text-tertiary)] shrink-0" />
          )}
        </div>
        <div className="text-xs text-[var(--color-text-tertiary)] truncate mt-0.5">
          {entry.username || 'No username'}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {entry.username && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopyToClipboard(entry.username, 'Username');
            }}
            className="p-1.5 hover:bg-[var(--color-bg-secondary)] rounded text-[var(--color-text-tertiary)]"
            title="Copy username"
          >
            <User size={14} />
          </button>
        )}
        {entry.password && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePasswordVisibility();
            }}
            className="p-1.5 hover:bg-[var(--color-bg-secondary)] rounded text-[var(--color-text-tertiary)]"
            title={passwordVisible ? 'Hide password' : 'Show password'}
          >
            {passwordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function EntryList({
  group,
  selectedEntryId,
  onSelectEntry,
  onCreateEntry,
  onCopyToClipboard,
  passwordVisible,
  onTogglePasswordVisibility,
}: EntryListProps) {
  const entries = group?.entries || [];

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-bg-tertiary)] mb-4">
            <Lock size={28} className="text-[var(--color-text-tertiary)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
            No group selected
          </h3>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Select a group from the sidebar to view entries
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-subtle)]">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{group.name}</h2>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <button onClick={onCreateEntry} className="btn btn-primary h-8 text-xs">
          <Plus size={14} />
          Add Entry
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-bg-tertiary)] mb-4">
              <Lock size={24} className="text-[var(--color-text-tertiary)]" />
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)] mb-3">No entries in this group</p>
            <button onClick={onCreateEntry} className="btn btn-secondary text-xs">
              <Plus size={14} />
              Add your first entry
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {entries.map((entry) => (
              <EntryItem
                key={entry.id}
                entry={entry}
                isSelected={selectedEntryId === entry.id}
                onSelect={() => onSelectEntry(entry.id)}
                onCopyToClipboard={onCopyToClipboard}
                passwordVisible={passwordVisible[entry.id]}
                onTogglePasswordVisibility={() => onTogglePasswordVisibility(entry.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
