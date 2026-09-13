import { useState } from 'react';
import {
  Database,
  FolderOpen,
  Lock,
  Eye,
  FolderPlus,
} from 'lucide-react';

interface DatabaseManagerProps {
  loading: boolean;
  onCreate: (name: string, password: string, keyFilePath?: string) => Promise<{ ok: boolean; error?: string }>;
  onOpen: (name: string, password: string, keyFilePath?: string) => Promise<{ ok: boolean; error?: string }>;
}

export function DatabaseManager({ loading, onCreate, onOpen }: DatabaseManagerProps) {
  const [view, setView] = useState<'menu' | 'create' | 'open'>('menu');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useKeyFile, setUseKeyFile] = useState(false);
  const [keyFilePath, setKeyFilePath] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setView('menu');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setUseKeyFile(false);
    setKeyFilePath('');
    setError('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await onCreate(name, password, useKeyFile ? keyFilePath : undefined);
    if (result.ok) {
      reset();
    } else if (result.error) {
      setError(result.error);
    }
  };

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await onOpen(name, password, useKeyFile ? keyFilePath : undefined);
    if (result.ok) {
      reset();
    } else if (result.error) {
      setError(result.error);
    }
  };

  if (view === 'create') {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-accent-subtle)] mb-4">
              <FolderPlus size={32} className="text-[var(--color-accent)]" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Create New Database</h1>
            <p className="text-[var(--color-text-secondary)] mt-2 text-sm">
              Set up a new encrypted password database
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Database Name</label>
              <input
                type="text"
                className="input"
                placeholder="My Passwords"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Master Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10 password-field"
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          password.length >= i * 4
                            ? password.length >= 16
                              ? 'bg-[var(--color-accent)]'
                              : password.length >= 12
                              ? 'bg-[var(--color-warning)]'
                              : 'bg-[var(--color-danger)]'
                            : 'bg-[var(--color-bg-tertiary)]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                    {password.length < 8
                      ? 'Too short'
                      : password.length < 12
                      ? 'Fair'
                      : password.length < 16
                      ? 'Good'
                      : 'Strong'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input password-field"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="useKeyFile"
                checked={useKeyFile}
                onChange={(e) => setUseKeyFile(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0"
              />
              <label htmlFor="useKeyFile" className="text-sm text-[var(--color-text-secondary)]">
                Use key file for additional security
              </label>
            </div>

            {useKeyFile && (
              <div>
                <label className="label">Key File Path</label>
                <input
                  type="text"
                  className="input font-mono text-sm"
                  placeholder="/path/to/keyfile"
                  value={keyFilePath}
                  onChange={(e) => setKeyFilePath(e.target.value)}
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-[var(--color-danger-subtle)] border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={reset} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Database'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'open') {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-accent-subtle)] mb-4">
              <FolderOpen size={32} className="text-[var(--color-accent)]" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Open Database</h1>
            <p className="text-[var(--color-text-secondary)] mt-2 text-sm">
              Unlock your encrypted password database
            </p>
          </div>

          <form onSubmit={handleOpen} className="space-y-4">
            <div>
              <label className="label">Database Name</label>
              <input
                type="text"
                className="input"
                placeholder="Enter database name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Master Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10 password-field"
                  placeholder="Enter your master password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="useKeyFile"
                checked={useKeyFile}
                onChange={(e) => setUseKeyFile(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0"
              />
              <label htmlFor="useKeyFile" className="text-sm text-[var(--color-text-secondary)]">
                Use key file
              </label>
            </div>

            {useKeyFile && (
              <div>
                <label className="label">Key File Path</label>
                <input
                  type="text"
                  className="input font-mono text-sm"
                  placeholder="/path/to/keyfile"
                  value={keyFilePath}
                  onChange={(e) => setKeyFilePath(e.target.value)}
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-[var(--color-danger-subtle)] border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={reset} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    Unlocking...
                  </span>
                ) : (
                  'Open Database'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--color-accent-subtle)] mb-6">
            <Lock size={40} className="text-[var(--color-accent)]" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">KeyPass</h1>
          <p className="text-[var(--color-text-secondary)] mt-3 text-sm">
            Secure password management
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setView('create')}
            className="w-full btn btn-primary justify-start gap-4 h-14"
          >
            <Database size={20} />
            <div className="text-left">
              <div className="font-semibold">Create New Database</div>
              <div className="text-xs opacity-70 font-normal">Set up a new encrypted vault</div>
            </div>
          </button>

          <button
            onClick={() => setView('open')}
            className="w-full btn btn-secondary justify-start gap-4 h-14"
          >
            <FolderOpen size={20} />
            <div className="text-left">
              <div className="font-semibold">Open Existing Database</div>
              <div className="text-xs opacity-70 font-normal">Unlock a saved vault</div>
            </div>
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-tertiary)]">
            <Lock size={12} />
            <span>AES-256 encryption</span>
            <span className="text-[var(--color-border-default)]">·</span>
            <span>Zero-knowledge security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
