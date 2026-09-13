import { useState } from 'react';
import {
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Trash,
  Globe,
  User,
  Lock,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';
import type { Entry } from '../types';

interface EntryDetailProps {
  entry: Entry | null;
  onEdit: () => void;
  onDelete: () => void;
  onCopyToClipboard: (text: string, label: string) => void;
}

export function EntryDetail({
  entry,
  onEdit,
  onDelete,
  onCopyToClipboard,
}: EntryDetailProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!entry) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--color-bg-secondary)]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-bg-tertiary)] mb-4">
            <Lock size={28} className="text-[var(--color-text-tertiary)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
            Select an entry
          </h3>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Choose an entry from the list to view its details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-bg-secondary)]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-bold text-lg uppercase">
            {entry.title.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{entry.title}</h2>
            {entry.url && (
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-1 mt-0.5"
              >
                <ExternalLink size={10} />
                {new URL(entry.url).hostname}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="btn btn-secondary h-8 text-xs">
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${entry.title}"?`)) onDelete();
            }}
            className="btn h-8 text-xs bg-[var(--color-danger-subtle)] text-[var(--color-danger)] border border-[var(--color-danger)]/20 hover:bg-[var(--color-danger)] hover:text-white"
          >
            <Trash size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {entry.username && (
            <div>
              <label className="label flex items-center gap-2">
                <User size={14} />
                Username
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2.5 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border-subtle)] text-sm font-mono">
                  {entry.username}
                </div>
                <button
                  onClick={() => onCopyToClipboard(entry.username, 'Username')}
                  className="btn btn-ghost h-9 w-9 p-0"
                  title="Copy username"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          )}

          {entry.password && (
            <div>
              <label className="label flex items-center gap-2">
                <Lock size={14} />
                Password
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2.5 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border-subtle)] text-sm password-field">
                  {showPassword ? entry.password : '••••••••••••'}
                </div>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-ghost h-9 w-9 p-0"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => onCopyToClipboard(entry.password, 'Password')}
                  className="btn btn-ghost h-9 w-9 p-0"
                  title="Copy password"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          )}

          {entry.url && (
            <div>
              <label className="label flex items-center gap-2">
                <Globe size={14} />
                URL
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2.5 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border-subtle)] text-sm truncate">
                  {entry.url}
                </div>
                <button
                  onClick={() => onCopyToClipboard(entry.url, 'URL')}
                  className="btn btn-ghost h-9 w-9 p-0"
                  title="Copy URL"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          )}

          {entry.notes && (
            <div>
              <label className="label flex items-center gap-2">
                <FileText size={14} />
                Notes
              </label>
              <div className="px-3 py-2.5 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border-subtle)] text-sm whitespace-pre-wrap">
                {entry.notes}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                Created: {new Date((entry as any).createdAt || (entry as any).created_at || '').toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                Updated: {new Date((entry as any).updatedAt || (entry as any).updated_at || '').toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
