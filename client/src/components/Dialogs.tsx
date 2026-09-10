import { useState } from 'react';
import {
  X,
  Eye,
  EyeOff,
  ListChecks,
} from 'lucide-react';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function CreateGroupDialog({ isOpen, onClose, onSubmit }: CreateGroupDialogProps) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold">New Group</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--color-bg-tertiary)] rounded-lg text-[var(--color-text-tertiary)]"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) {
              onSubmit(name.trim());
              setName('');
              onClose();
            }
          }}
          className="p-6"
        >
          <label className="label">Group Name</label>
          <input
            type="text"
            className="input"
            placeholder="Enter group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim()} className="btn btn-primary flex-1">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CreateEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: any) => void;
  onGeneratePassword: () => void;
}

export function CreateEntryDialog({
  isOpen,
  onClose,
  onSubmit,
  onGeneratePassword,
}: CreateEntryDialogProps) {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold">New Entry</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--color-bg-tertiary)] rounded-lg text-[var(--color-text-tertiary)]"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim()) {
              onSubmit({
                title: title.trim(),
                username: username.trim(),
                password,
                url: url.trim(),
                notes: notes.trim(),
              });
              setTitle('');
              setUsername('');
              setPassword('');
              setUrl('');
              setNotes('');
              onClose();
            }
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., GitHub Account"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="label">Username</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., john@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10 password-field"
                  placeholder="Enter or generate"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="button"
                onClick={onGeneratePassword}
                className="btn btn-secondary px-3"
                title="Generate password"
              >
                <ListChecks size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="label">URL</label>
            <input
              type="url"
              className="input"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input min-h-[80px] resize-y"
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={!title.trim()} className="btn btn-primary flex-1">
              Create Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditEntryDialogProps {
  isOpen: boolean;
  entry: any;
  onClose: () => void;
  onSubmit: (id: string, updates: any) => void;
  onGeneratePassword: () => void;
}

export function EditEntryDialog({
  isOpen,
  entry,
  onClose,
  onSubmit,
  onGeneratePassword,
}: EditEntryDialogProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [username, setUsername] = useState(entry?.username || '');
  const [password, setPassword] = useState(entry?.password || '');
  const [url, setUrl] = useState(entry?.url || '');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen || !entry) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold">Edit Entry</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--color-bg-tertiary)] rounded-lg text-[var(--color-text-tertiary)]"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(entry.id, {
              title: title.trim(),
              username: username.trim(),
              password,
              url: url.trim(),
              notes: notes.trim(),
            });
            onClose();
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="label">Username</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10 password-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="button"
                onClick={onGeneratePassword}
                className="btn btn-secondary px-3"
                title="Generate password"
              >
                <ListChecks size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="label">URL</label>
            <input
              type="url"
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input min-h-[80px] resize-y"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ChangeMasterPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (current: string, newPass: string) => Promise<boolean>;
}

export function ChangeMasterPasswordDialog({
  isOpen,
  onClose,
  onSubmit,
}: ChangeMasterPasswordDialogProps) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold">Change Master Password</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--color-bg-tertiary)] rounded-lg text-[var(--color-text-tertiary)]"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (newPass !== confirmPass) return;
            setLoading(true);
            const success = await onSubmit(current, newPass);
            setLoading(false);
            if (success) {
              setCurrent('');
              setNewPass('');
              setConfirmPass('');
              onClose();
            }
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="label">Current Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              className="input password-field"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">New Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              className="input password-field"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              className="input password-field"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
            />
            {newPass && confirmPass && newPass !== confirmPass && (
              <p className="text-xs text-[var(--color-danger)] mt-1">Passwords do not match</p>
            )}
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="showPasswords"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-[var(--color-accent)]"
            />
            <label htmlFor="showPasswords" className="text-sm text-[var(--color-text-secondary)]">
              Show passwords
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !current || !newPass || newPass !== confirmPass}
              className="btn btn-primary flex-1"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Changing...
                </span>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
